"""
api/connector_router.py
Rutas para manejar la conexión a bases de datos externas y extracción de esquemas.
Incluye endpoints para guardar, listar y eliminar conexiones exitosas.
"""
from fastapi import APIRouter, Depends, HTTPException
from fastapi.encoders import jsonable_encoder
from sqlalchemy.orm import Session
from typing import Dict, Any, List
import math

from backend.core.database import get_db
from backend.core.encryption import encrypt_password, decrypt_password
from backend.models.models import Conexion
from backend.models.schemas import (
    ConexionRequest,
    ConexionGuardadaResponse,
    DatabaseSchema,
    InsertRequest,
    InsertResponse,
    TableRowsRequest,
    TableRowsResponse,
)
from backend.connectors.connector_factory import get_connector
from backend.analyzers.schema_analyzer import analyze_schema
from backend.generators.data_generator import DataGenerator

router = APIRouter(prefix="/connect", tags=["Connector"])


def quote_table(name: str, motor: str) -> str:
    if motor == "mysql":
        return f"`{name.replace('`', '``')}`"
    if motor == "sqlserver":
        return f"[{name.replace(']', ']]')}]"
    return f'"{name.replace(chr(34), chr(34) * 2)}"'


# ─────────────────────────────────────────────────────────────
# TEST DE CONEXIÓN
# ─────────────────────────────────────────────────────────────
@router.post("/test", response_model=Dict[str, Any])
def test_connection(
    req: ConexionRequest
):
    """Prueba la conexión a una base de datos externa."""
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


# ─────────────────────────────────────────────────────────────
# ANALIZAR ESQUEMA (y guardar conexión exitosa)
# ─────────────────────────────────────────────────────────────
@router.post("/schema", response_model=DatabaseSchema)
def get_external_schema(
    req: ConexionRequest,
    db: Session = Depends(get_db)
):
    """
    Se conecta a la BD, extrae y analiza el esquema completo.
    Si la conexión es exitosa, la guarda automáticamente para reutilizarla.
    """
    try:
        with get_connector(req) as connector:
            schema = analyze_schema(connector)

        # Guardar la conexión exitosa (evitar duplicados por host+puerto+bd+usuario)
        existing = db.query(Conexion).filter(
            Conexion.host == req.host,
            Conexion.puerto == req.puerto,
            Conexion.nombre_bd == req.nombre_bd,
            Conexion.usuario_db == req.usuario,
        ).first()

        encrypted_pw = encrypt_password(req.password) if req.password else None

        if existing:
            # Actualizar contraseña por si cambió
            existing.password_db = encrypted_pw
            existing.motor_bd = req.motor or "postgresql"
        else:
            nueva = Conexion(
                nombre_alias=f"{req.nombre_bd}@{req.host}",
                motor_bd=req.motor or "postgresql",
                host=req.host,
                puerto=req.puerto,
                nombre_bd=req.nombre_bd,
                usuario_db=req.usuario,
                password_db=encrypted_pw,
            )
            db.add(nueva)

        db.commit()
        return schema

    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error obteniendo esquema: {str(e)}")


@router.post("/table-rows", response_model=TableRowsResponse)
def list_table_rows(req: TableRowsRequest):
    """Lists real rows from one detected table without modifying the database."""
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


# ─────────────────────────────────────────────────────────────
# LISTAR CONEXIONES GUARDADAS
# ─────────────────────────────────────────────────────────────
@router.get("/saved", response_model=List[ConexionGuardadaResponse])
def list_saved_connections(
    db: Session = Depends(get_db)
):
    """Devuelve todas las conexiones guardadas."""
    conexiones = (
        db.query(Conexion)
        .order_by(Conexion.created_at.desc())
        .all()
    )

    result = []
    for c in conexiones:
        decrypted_pw = None
        if c.password_db:
            try:
                decrypted_pw = decrypt_password(c.password_db)
            except Exception:
                decrypted_pw = None

        result.append(ConexionGuardadaResponse(
            id=c.id,
            nombre_alias=c.nombre_alias,
            motor_bd=c.motor_bd,
            host=c.host,
            puerto=c.puerto,
            nombre_bd=c.nombre_bd,
            usuario_db=c.usuario_db,
            password_db=decrypted_pw,
            created_at=c.created_at,
        ))

    return result


# ─────────────────────────────────────────────────────────────
# ELIMINAR CONEXIÓN GUARDADA
# ─────────────────────────────────────────────────────────────
@router.delete("/saved/{conexion_id}")
def delete_saved_connection(
    conexion_id: int,
    db: Session = Depends(get_db)
):
    """Elimina una conexión guardada."""
    conexion = db.query(Conexion).filter(
        Conexion.id == conexion_id
    ).first()

    if not conexion:
        raise HTTPException(status_code=404, detail="Conexión no encontrada.")

    db.delete(conexion)
    db.commit()
    return {"message": "Conexión eliminada correctamente."}


# ─────────────────────────────────────────────────────────────
# INSERCIÓN DIRECTA
# ─────────────────────────────────────────────────────────────
@router.post("/insert", response_model=InsertResponse)
def insert_generated_data(
    req: InsertRequest,
    db: Session = Depends(get_db)
):
    """Genera los datos sintéticos y los inserta directamente en la base de datos externa."""
    try:
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
                                if isinstance(row, dict):
                                    max_val = list(row.values())[0] or 0
                                else:
                                    max_val = row[0] or 0
                            pk_offsets[table_name] = int(max_val)
                            cursor.close()
                        except Exception:
                            pk_offsets[table_name] = 0

        generator = DataGenerator(locale=req.locale or "es_ES")
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

        # Actualizar estadísticas en la conexión guardada
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
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error durante la inserción: {str(e)}")
