import math
from typing import Any, Dict, List

from fastapi import APIRouter, Depends, HTTPException
from fastapi.encoders import jsonable_encoder
from sqlalchemy.orm import Session

from backend.analyzers.schema_analyzer import analyze_schema
from backend.connectors.connector_factory import get_connector
from backend.core.database import get_db
from backend.core.encryption import decrypt_password, encrypt_password
from backend.generators.data_generator import DataGenerator
from backend.models.models import Conexion
from backend.models.schemas import (
    ConexionGuardadaResponse,
    ConexionRequest,
    DatabaseProfile,
    DatabaseSchema,
    InsertRequest,
    InsertResponse,
    PolicyCheckRequest,
    PolicyCheckResponse,
    PolicyDecision,
    TableRowsRequest,
    TableRowsResponse,
)
from backend.policy.engine import classify_environment, evaluate_policy, make_connection_id, mask_host

router = APIRouter(prefix="/connect", tags=["Connector"])


def quote_table(name: str, motor: str) -> str:
    if motor == "mysql":
        return f"`{name.replace('`', '``')}`"
    if motor == "sqlserver":
        return f"[{name.replace(']', ']]')}]"
    return f'"{name.replace(chr(34), chr(34) * 2)}"'


def connection_profile_from_model(c: Conexion) -> ConexionGuardadaResponse:
    environment = classify_environment(c.host, c.nombre_bd, c.nombre_alias)
    return ConexionGuardadaResponse(
        connection_id=make_connection_id(c.motor_bd, c.host, c.puerto, c.nombre_bd, c.usuario_db),
        alias=c.nombre_alias,
        engine=c.motor_bd,
        database=c.nombre_bd,
        host=c.host,
        host_masked=mask_host(c.host),
        port=c.puerto,
        username=c.usuario_db,
        has_credentials=bool(c.password_db),
        environment=environment,
        created_at=c.created_at,
    )


@router.post("/test", response_model=Dict[str, Any])
def test_connection(req: ConexionRequest):
    try:
        connector = get_connector(req)
        result = connector.test_connection()
        if not result.get("success"):
            raise HTTPException(
                status_code=400,
                detail=result.get("error", "No se pudo conectar a la base de datos."),
            )
        return result
    except HTTPException:
        raise
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/policy/check", response_model=PolicyCheckResponse)
def check_policy(req: PolicyCheckRequest):
    return evaluate_policy(
        operation=req.operation,
        environment=req.environment,
        has_backup=req.has_backup,
        has_sandbox=req.has_sandbox,
        human_approved=req.human_approved,
    )


@router.post("/schema", response_model=DatabaseSchema)
def get_external_schema(req: ConexionRequest, db: Session = Depends(get_db)):
    try:
        with get_connector(req) as connector:
            schema = analyze_schema(connector)

        existing = db.query(Conexion).filter(
            Conexion.host == req.host,
            Conexion.puerto == req.puerto,
            Conexion.nombre_bd == req.nombre_bd,
            Conexion.usuario_db == req.usuario,
        ).first()

        encrypted_pw = encrypt_password(req.password) if req.password else None

        if existing:
            existing.password_db = encrypted_pw
            existing.motor_bd = req.motor or "postgresql"
        else:
            db.add(Conexion(
                nombre_alias=f"{req.nombre_bd}@{req.host}",
                motor_bd=req.motor or "postgresql",
                host=req.host,
                puerto=req.puerto,
                nombre_bd=req.nombre_bd,
                usuario_db=req.usuario,
                password_db=encrypted_pw,
            ))

        db.commit()
        return schema

    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error obteniendo esquema: {str(e)}")


@router.post("/table-rows", response_model=TableRowsResponse)
def list_table_rows(req: TableRowsRequest):
    try:
        motor = req.connection.motor.value if req.connection.motor else ""
        with get_connector(req.connection) as connector:
            schema = analyze_schema(connector)
            allowed_tables = {table.name for table in schema.tables}
            if req.table_name not in allowed_tables:
                raise HTTPException(status_code=404, detail="Tabla no encontrada en la base de datos.")

            table = quote_table(req.table_name, motor)
            offset = (req.page - 1) * req.page_size
            cursor = connector._connection.cursor()
            cursor.execute(f"SELECT COUNT(*) FROM {table}")
            count_row = cursor.fetchone()
            total_rows = int(next(iter(count_row.values())) if isinstance(count_row, dict) else count_row[0])

            if motor == "sqlserver":
                cursor.execute(
                    f"SELECT * FROM {table} ORDER BY (SELECT NULL) OFFSET ? ROWS FETCH NEXT ? ROWS ONLY",
                    offset,
                    req.page_size,
                )
            else:
                cursor.execute(f"SELECT * FROM {table} LIMIT %s OFFSET %s", (req.page_size, offset))

            columns = [description[0] for description in cursor.description]
            rows = [
                [row.get(column) for column in columns] if isinstance(row, dict) else list(row)
                for row in cursor.fetchall()
            ]
            cursor.close()

        return TableRowsResponse(
            table_name=req.table_name,
            columns=columns,
            rows=jsonable_encoder(rows),
            page=req.page,
            page_size=req.page_size,
            total_rows=total_rows,
            total_pages=max(1, math.ceil(total_rows / req.page_size)),
        )
    except HTTPException:
        raise
    except Exception as error:
        raise HTTPException(status_code=500, detail=f"No se pudieron listar los datos: {error}")


@router.get("/saved", response_model=List[ConexionGuardadaResponse])
def list_saved_connections(db: Session = Depends(get_db)):
    conexiones = db.query(Conexion).order_by(Conexion.created_at.desc()).all()
    return [connection_profile_from_model(c) for c in conexiones]


@router.get("/saved/{conexion_id}/profile", response_model=DatabaseProfile)
def get_database_profile(conexion_id: int, db: Session = Depends(get_db)):
    conexion = db.query(Conexion).filter(Conexion.id == conexion_id).first()

    if not conexion:
        raise HTTPException(status_code=404, detail="Conexion no encontrada.")

    profile = connection_profile_from_model(conexion)
    capabilities = ["inspect_schema", "generate_diagram", "preview_rows", "synthetic_seed_preview"]
    if profile.engine == "postgresql":
        capabilities.extend(["postgresql_backup", "postgresql_sandbox"])

    return DatabaseProfile(
        connection_id=profile.connection_id,
        alias=profile.alias,
        engine=profile.engine,
        database=profile.database,
        host_masked=profile.host_masked,
        port=profile.port,
        username=profile.username,
        environment=profile.environment,
        has_credentials=profile.has_credentials,
        capabilities=capabilities,
    )


def find_connection_by_public_id(db: Session, conexion_id: str):
    if conexion_id.isdigit():
        return db.query(Conexion).filter(Conexion.id == int(conexion_id)).first()

    for conexion in db.query(Conexion).all():
        if connection_profile_from_model(conexion).connection_id == conexion_id:
            return conexion
    return None


def connection_request_from_model(conexion: Conexion) -> ConexionRequest:
    return ConexionRequest(
        host=conexion.host,
        puerto=conexion.puerto,
        usuario=conexion.usuario_db or "",
        password=decrypt_password(conexion.password_db) if conexion.password_db else "",
        nombre_bd=conexion.nombre_bd,
        motor=conexion.motor_bd,
    )


@router.get("/saved/{conexion_id}/schema", response_model=DatabaseSchema)
def get_saved_connection_schema(conexion_id: str, db: Session = Depends(get_db)):
    conexion = find_connection_by_public_id(db, conexion_id)

    if not conexion:
        raise HTTPException(status_code=404, detail="Conexion no encontrada.")

    try:
        with get_connector(connection_request_from_model(conexion)) as connector:
            return analyze_schema(connector)
    except Exception as error:
        raise HTTPException(status_code=500, detail=f"Error obteniendo esquema: {error}")


@router.delete("/saved/{conexion_id}")
def delete_saved_connection(conexion_id: str, db: Session = Depends(get_db)):
    conexion = find_connection_by_public_id(db, conexion_id)

    if not conexion:
        raise HTTPException(status_code=404, detail="Conexion no encontrada.")

    db.delete(conexion)
    db.commit()
    return {"message": "Conexion eliminada correctamente."}


@router.post("/insert", response_model=InsertResponse)
def insert_generated_data(req: InsertRequest, db: Session = Depends(get_db)):
    try:
        policy = evaluate_policy(
            operation="direct_insert",
            environment=req.environment,
            has_backup=False,
            has_sandbox=False,
            human_approved=req.human_approved,
        )
        if not req.allow_direct_write or policy.decision != PolicyDecision.allow:
            raise HTTPException(
                status_code=403,
                detail={
                    "message": "Direct insert is blocked by Fluxy policy.",
                    "policy": policy.model_dump(),
                },
            )

        pk_offsets = {}
        with get_connector(req.connection) as connector:
            for table_schema in req.schema.tables:
                table_name = table_schema.name
                for col in table_schema.columns:
                    if col.is_primary_key and any(
                        t in col.data_type.upper()
                        for t in ["INT", "SERIAL", "BIGSERIAL", "SMALLSERIAL"]
                    ):
                        try:
                            cursor = connector._connection.cursor()
                            if req.connection.motor == "mysql":
                                sql = f"SELECT MAX(`{col.name}`) FROM `{table_name}`"
                            else:
                                sql = f'SELECT MAX("{col.name}") FROM "{table_name}"'
                            cursor.execute(sql)
                            row = cursor.fetchone()
                            max_val = 0
                            if row:
                                max_val = (list(row.values())[0] if isinstance(row, dict) else row[0]) or 0
                            pk_offsets[table_name] = int(max_val)
                            cursor.close()
                        except Exception:
                            pk_offsets[table_name] = 0

        generator = DataGenerator(locale=req.locale or "es_ES", seed=req.seed)
        generated_data = generator.generate(req.schema, req.table_configs, pk_offsets=pk_offsets)

        total_inserted = 0
        total_errors = 0
        tables_processed = 0
        logs = []

        with get_connector(req.connection) as connector:
            for table_name, table_data in generated_data.items():
                columns = table_data["columns"]
                rows = table_data["rows"]

                if rows:
                    result = connector.insert_records(table_name, columns, rows)
                    inserted = result.get("inserted", 0)
                    errors = result.get("errors", 0)

                    total_inserted += inserted
                    total_errors += errors
                    tables_processed += 1
                    logs.append(f"Tabla '{table_name}': {inserted} insertados, {errors} errores.")

        conexion = db.query(Conexion).filter(
            Conexion.host == req.connection.host,
            Conexion.puerto == req.connection.puerto,
            Conexion.nombre_bd == req.connection.nombre_bd,
        ).first()

        if conexion:
            conexion.registros_insertados += total_inserted
            conexion.registros_generados += total_inserted + total_errors
            db.commit()

        return InsertResponse(
            success=total_errors == 0,
            tables_processed=tables_processed,
            total_inserted=total_inserted,
            total_errors=total_errors,
            logs=logs,
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error durante la insercion: {str(e)}")
