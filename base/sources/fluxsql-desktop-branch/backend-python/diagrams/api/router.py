import json
import math
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.encoders import jsonable_encoder
from sqlalchemy.orm import Session
from typing import List, Optional

from backend.core.database import get_db
from diagrams.models import Project, Diagram, DiagramVersion
from diagrams.schemas import (
    ProjectCreate, ProjectUpdate, ProjectResponse,
    DiagramCreate, DiagramUpdate, DiagramResponse,
    VersionCreate, VersionDetail, VersionSummary,
    DiagramLayoutUpdate, TableRowsRequest, TableRowsResponse,
)
from backend.models.schemas import ConexionRequest
from backend.connectors.connector_factory import get_connector
from backend.analyzers.schema_analyzer import analyze_schema
from pydantic import BaseModel

class GenerateDiagramRequest(BaseModel):
    connection: ConexionRequest
    selected_tables: List[str]
    name: str


class RefreshDiagramRequest(BaseModel):
    connection: ConexionRequest


def quote_identifier(name: str, dialect: str) -> str:
    if dialect == "mysql":
        return f"`{name.replace('`', '``')}`"
    if dialect == "sqlserver":
        return f"[{name.replace(']', ']]')}]"
    return f'"{name.replace(chr(34), chr(34) * 2)}"'


def fetch_table_rows(connection: ConexionRequest, table_name: str, page: int, page_size: int):
    dialect = connection.motor.value if connection.motor else ""
    quoted_table = quote_identifier(table_name, dialect)
    offset = (page - 1) * page_size

    with get_connector(connection) as connector:
        cursor = connector._connection.cursor()
        cursor.execute(f"SELECT COUNT(*) FROM {quoted_table}")
        count_row = cursor.fetchone()
        if isinstance(count_row, dict):
            total_rows = int(next(iter(count_row.values())) or 0)
        else:
            total_rows = int(count_row[0] or 0)

        if dialect == "sqlserver":
            cursor.execute(
                f"SELECT * FROM {quoted_table} ORDER BY (SELECT NULL) "
                "OFFSET ? ROWS FETCH NEXT ? ROWS ONLY",
                offset,
                page_size,
            )
        else:
            cursor.execute(f"SELECT * FROM {quoted_table} LIMIT %s OFFSET %s", (page_size, offset))

        columns = [description[0] for description in cursor.description]
        raw_rows = cursor.fetchall()
        rows = []
        for row in raw_rows:
            if isinstance(row, dict):
                rows.append([row.get(column) for column in columns])
            else:
                rows.append(list(row))
        cursor.close()

    return columns, jsonable_encoder(rows), total_rows


def column_type_sql(column, dialect: str) -> str:
    data_type = column.data_type or "TEXT"
    if column.max_length and "(" not in data_type and data_type.upper() in {"VARCHAR", "CHAR", "NVARCHAR"}:
        return f"{data_type}({column.max_length})"
    return data_type


def schema_to_sql(tables, dialect: str) -> str:
    statements = []
    for table in tables:
        primary_keys = [column.name for column in table.columns if column.is_primary_key]
        lines = []
        for column in table.columns:
            parts = [
                quote_identifier(column.name, dialect),
                column_type_sql(column, dialect),
            ]
            if not column.is_nullable:
                parts.append("NOT NULL")
            if column.default_value is not None:
                parts.append(f"DEFAULT {column.default_value}")
            if len(primary_keys) == 1 and column.is_primary_key:
                parts.append("PRIMARY KEY")
            if column.foreign_key:
                parts.append(
                    "REFERENCES "
                    f"{quote_identifier(column.foreign_key['table'], dialect)}"
                    f"({quote_identifier(column.foreign_key['column'], dialect)})"
                )
            lines.append("  " + " ".join(parts))
        if len(primary_keys) > 1:
            keys = ", ".join(quote_identifier(key, dialect) for key in primary_keys)
            lines.append(f"  PRIMARY KEY ({keys})")
        statements.append(
            f"CREATE TABLE {quote_identifier(table.name, dialect)} (\n"
            + ",\n".join(lines)
            + "\n);"
        )
    return "\n\n".join(statements)


def schema_to_flow(tables, existing_flow=None):
    existing_flow = existing_flow or {}
    existing_positions = {
        node.get("id"): node.get("position")
        for node in existing_flow.get("nodes", [])
        if isinstance(node, dict)
    }
    nodes = []
    edges = []
    selected_names = {table.name for table in tables}

    for index, table in enumerate(tables):
        node_id = table.name.lower()
        position = existing_positions.get(node_id) or {
            "x": (index % 3) * 360,
            "y": (index // 3) * 260,
        }
        nodes.append({
            "id": node_id,
            "type": "tableNode",
            "position": position,
            "data": {
                "tableName": table.name,
                "columns": [
                    {
                        "name": column.name,
                        "type": column_type_sql(column, ""),
                        "isPrimaryKey": column.is_primary_key,
                        "isForeignKey": bool(column.foreign_key),
                        "nullable": column.is_nullable,
                        "defaultValue": column.default_value,
                        "references": column.foreign_key,
                    }
                    for column in table.columns
                ],
            },
        })

        for column in table.columns:
            if not column.foreign_key or column.foreign_key.get("table") not in selected_names:
                continue
            parent_table = column.foreign_key["table"]
            parent_column = column.foreign_key["column"]
            edges.append({
                "id": f"rel-{node_id}-{column.name}-{parent_table.lower()}-{parent_column}",
                "source": node_id,
                "sourceHandle": f"{column.name}-source",
                "target": parent_table.lower(),
                "targetHandle": f"{parent_column}-target",
                "type": "relationship",
                "animated": False,
                "label": "N:1",
                "data": {
                    "cardinality": "many-to-one",
                    "sourceCardinality": "N",
                    "targetCardinality": "1",
                    "sourceColumn": column.name,
                    "targetColumn": parent_column,
                },
            })

    flow = {"nodes": nodes, "edges": edges}
    if existing_flow.get("viewport"):
        flow["viewport"] = existing_flow["viewport"]
    return flow


def introspect_selected_schema(connection: ConexionRequest, selected_tables: List[str], strict=True):
    with get_connector(connection) as connector:
        full_schema = analyze_schema(connector)
    if full_schema.motor not in {"postgresql", "mysql", "sqlserver"}:
        raise HTTPException(
            status_code=400,
            detail="ER SQL diagrams currently support PostgreSQL, MySQL and SQL Server.",
        )
    selected = set(selected_tables)
    tables = [table for table in full_schema.tables if table.name in selected]
    missing = selected.difference(table.name for table in tables)
    if strict and missing:
        raise HTTPException(
            status_code=400,
            detail=f"Tables not found in database: {', '.join(sorted(missing))}",
        )
    return full_schema, tables

router = APIRouter(tags=["ER Diagrams"])

# ==========================================
# PROJECTS
# ==========================================

@router.get("/projects", response_model=List[ProjectResponse])
def list_projects(db: Session = Depends(get_db)):
    """List all projects"""
    return db.query(Project).order_by(Project.created_at.desc()).all()

@router.get("/projects/{project_id}", response_model=ProjectResponse)
def get_project(project_id: int, db: Session = Depends(get_db)):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    return project

@router.post("/projects", response_model=ProjectResponse)
def create_project(req: ProjectCreate, db: Session = Depends(get_db)):
    project = Project(name=req.name, description=req.description)
    db.add(project)
    db.commit()
    db.refresh(project)
    return project

@router.patch("/projects/{project_id}", response_model=ProjectResponse)
def update_project(project_id: int, req: ProjectUpdate, db: Session = Depends(get_db)):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    if req.name is not None:
        project.name = req.name
    if req.description is not None:
        project.description = req.description
        
    db.commit()
    db.refresh(project)
    return project

@router.delete("/projects/{project_id}")
def delete_project(project_id: int, db: Session = Depends(get_db)):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    project.deleted_at = datetime.utcnow()
    db.commit()
    return {"ok": True}


@router.post("/projects/{project_id}/restore", response_model=ProjectResponse)
def restore_project(project_id: int, db: Session = Depends(get_db)):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    project.deleted_at = None
    db.commit()
    db.refresh(project)
    return project


@router.delete("/projects/{project_id}/permanent")
def permanently_delete_project(project_id: int, db: Session = Depends(get_db)):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    db.delete(project)
    db.commit()
    return {"ok": True}


@router.patch("/projects/{project_id}/sharing", response_model=ProjectResponse)
def update_project_sharing(
    project_id: int,
    is_public: bool,
    access: str = "view",
    db: Session = Depends(get_db),
):
    if access not in {"view", "edit"}:
        raise HTTPException(status_code=400, detail="Invalid share access")
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    project.is_public = is_public
    project.share_access = access
    db.commit()
    db.refresh(project)
    return project

# ==========================================
# DIAGRAMS
# ==========================================

@router.get("/diagrams", response_model=List[DiagramResponse])
def list_diagrams(projectId: Optional[int] = None, db: Session = Depends(get_db)):
    """List diagrams, optionally filtered by projectId"""
    query = db.query(Diagram)
    if projectId:
        query = query.filter(Diagram.project_id == projectId)
    return query.order_by(Diagram.created_at.desc()).all()

@router.get("/diagrams/{diagram_id}", response_model=DiagramResponse)
def get_diagram(diagram_id: int, db: Session = Depends(get_db)):
    diagram = db.query(Diagram).filter(Diagram.id == diagram_id).first()
    if not diagram:
        raise HTTPException(status_code=404, detail="Diagram not found")
    return diagram

@router.post("/diagrams", response_model=DiagramResponse)
def create_diagram(req: DiagramCreate, db: Session = Depends(get_db)):
    raise HTTPException(
        status_code=400,
        detail="Diagrams must be generated from a database connection.",
    )

@router.patch("/diagrams/{diagram_id}", response_model=DiagramResponse)
def update_diagram(diagram_id: int, req: DiagramUpdate, db: Session = Depends(get_db)):
    diagram = db.query(Diagram).filter(Diagram.id == diagram_id).first()
    if not diagram:
        raise HTTPException(status_code=404, detail="Diagram not found")
    
    if req.name is not None:
        diagram.name = req.name
    if req.schema_json is not None or req.sql_content is not None or req.active_dialect is not None:
        raise HTTPException(
            status_code=400,
            detail="Database-derived diagram structure is read-only. Refresh it from the database instead.",
        )
        
    db.commit()
    db.refresh(diagram)
    return diagram

@router.delete("/diagrams/{diagram_id}")
def delete_diagram(diagram_id: int, db: Session = Depends(get_db)):
    diagram = db.query(Diagram).filter(Diagram.id == diagram_id).first()
    if not diagram:
        raise HTTPException(status_code=404, detail="Diagram not found")
    db.delete(diagram)
    db.commit()
    return {"ok": True}

@router.post("/diagrams/generate", response_model=DiagramResponse)
def generate_diagram_from_db(req: GenerateDiagramRequest, projectId: int = Query(...), db: Session = Depends(get_db)):
    """Generates an ER diagram from the database and saves it to a project"""
    
    project = db.query(Project).filter(Project.id == projectId).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    try:
        full_schema, selected_tables = introspect_selected_schema(req.connection, req.selected_tables)
        dialect = full_schema.motor if full_schema.motor in {"postgresql", "mysql", "sqlserver"} else "json"
        flow_json = json.dumps(schema_to_flow(selected_tables))
        
        diagram = Diagram(
            name=req.name,
            schema_json=flow_json,
            sql_content=schema_to_sql(selected_tables, dialect),
            active_dialect=dialect,
            source_database=f"{full_schema.motor}:{full_schema.database_name}",
            selected_tables_json=json.dumps(req.selected_tables),
            last_synced_at=datetime.utcnow(),
            project_id=projectId,
        )
        db.add(diagram)
        project.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(diagram)
        return diagram
        
    except Exception as e:
        if isinstance(e, HTTPException):
            raise
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/diagrams/{diagram_id}/refresh", response_model=DiagramResponse)
def refresh_diagram(diagram_id: int, req: RefreshDiagramRequest, db: Session = Depends(get_db)):
    diagram = db.query(Diagram).filter(Diagram.id == diagram_id).first()
    if not diagram:
        raise HTTPException(status_code=404, detail="Diagram not found")
    selected_tables = json.loads(diagram.selected_tables_json or "[]")
    if not selected_tables:
        raise HTTPException(status_code=400, detail="Diagram has no source tables configured")

    try:
        existing_flow = json.loads(diagram.schema_json or "{}")
        full_schema, tables = introspect_selected_schema(req.connection, selected_tables, strict=False)
        dialect = full_schema.motor if full_schema.motor in {"postgresql", "mysql", "sqlserver"} else "json"
        diagram.schema_json = json.dumps(schema_to_flow(tables, existing_flow))
        diagram.sql_content = schema_to_sql(tables, dialect)
        diagram.active_dialect = dialect
        diagram.source_database = f"{full_schema.motor}:{full_schema.database_name}"
        diagram.selected_tables_json = json.dumps([table.name for table in tables])
        diagram.last_synced_at = datetime.utcnow()
        diagram.project.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(diagram)
        return diagram
    except Exception as e:
        if isinstance(e, HTTPException):
            raise
        raise HTTPException(status_code=500, detail=str(e))


@router.patch("/diagrams/{diagram_id}/layout", response_model=DiagramResponse)
def update_diagram_layout(diagram_id: int, req: DiagramLayoutUpdate, db: Session = Depends(get_db)):
    diagram = db.query(Diagram).filter(Diagram.id == diagram_id).first()
    if not diagram:
        raise HTTPException(status_code=404, detail="Diagram not found")
    flow = json.loads(diagram.schema_json or "{}")
    for node in flow.get("nodes", []):
        if node.get("id") in req.positions:
            node["position"] = req.positions[node["id"]]
    if req.viewport is not None:
        flow["viewport"] = req.viewport
    diagram.schema_json = json.dumps(flow)
    diagram.project.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(diagram)
    return diagram


def get_project_diagram(project_id: int, db: Session) -> Diagram:
    diagram = (
        db.query(Diagram)
        .filter(Diagram.project_id == project_id)
        .order_by(Diagram.created_at.desc())
        .first()
    )
    if not diagram:
        raise HTTPException(status_code=404, detail="Diagram not found")
    return diagram


@router.post("/projects/{project_id}/tables/{table_name}/rows", response_model=TableRowsResponse)
def preview_project_table(
    project_id: int,
    table_name: str,
    req: TableRowsRequest,
    db: Session = Depends(get_db),
):
    diagram = get_project_diagram(project_id, db)
    selected_tables = json.loads(diagram.selected_tables_json or "[]")
    if table_name not in selected_tables:
        raise HTTPException(status_code=403, detail="Table is not part of this diagram")

    page = max(1, req.page)
    page_size = min(max(1, req.page_size), 100)
    try:
        columns, rows, total_rows = fetch_table_rows(req.connection, table_name, page, page_size)
        return TableRowsResponse(
            table_name=table_name,
            columns=columns,
            rows=rows,
            page=page,
            page_size=page_size,
            total_rows=total_rows,
            total_pages=max(1, math.ceil(total_rows / page_size)),
        )
    except Exception as error:
        if isinstance(error, HTTPException):
            raise
        raise HTTPException(status_code=500, detail=f"No se pudieron consultar los datos: {error}")


def serialize_version(version: DiagramVersion) -> dict:
    return {
        "id": version.id,
        "version_number": version.version_number,
        "message": version.message,
        "created_at": version.created_at,
        "flow_json": json.loads(version.flow_json),
        "sql_content": version.sql_content,
        "active_dialect": version.active_dialect,
        "snapshots": json.loads(version.snapshots_json),
    }


@router.get("/versions", response_model=List[VersionSummary])
def list_versions(projectId: int, db: Session = Depends(get_db)):
    diagram = get_project_diagram(projectId, db)
    return (
        db.query(DiagramVersion)
        .filter(DiagramVersion.diagram_id == diagram.id)
        .order_by(DiagramVersion.version_number.desc())
        .all()
    )


@router.post("/versions", response_model=VersionDetail)
def create_version(req: VersionCreate, db: Session = Depends(get_db)):
    diagram = get_project_diagram(req.project_id, db)
    latest = (
        db.query(DiagramVersion)
        .filter(DiagramVersion.diagram_id == diagram.id)
        .order_by(DiagramVersion.version_number.desc())
        .first()
    )
    version = DiagramVersion(
        diagram_id=diagram.id,
        version_number=(latest.version_number + 1) if latest else 1,
        message=req.message,
        flow_json=json.dumps(req.flow_json),
        sql_content=req.sql_content,
        active_dialect=req.active_dialect,
        snapshots_json=json.dumps(req.snapshots),
    )
    db.add(version)
    db.commit()
    db.refresh(version)
    return serialize_version(version)


@router.get("/versions/{version_id}", response_model=VersionDetail)
def get_version(version_id: int, db: Session = Depends(get_db)):
    version = db.query(DiagramVersion).filter(DiagramVersion.id == version_id).first()
    if not version:
        raise HTTPException(status_code=404, detail="Version not found")
    return serialize_version(version)


@router.delete("/versions/{version_id}")
def delete_version(version_id: int, db: Session = Depends(get_db)):
    version = db.query(DiagramVersion).filter(DiagramVersion.id == version_id).first()
    if not version:
        raise HTTPException(status_code=404, detail="Version not found")
    db.delete(version)
    db.commit()
    return {"ok": True}


@router.post("/versions/{version_id}/restore", response_model=VersionDetail)
def restore_version(version_id: int, db: Session = Depends(get_db)):
    version = db.query(DiagramVersion).filter(DiagramVersion.id == version_id).first()
    if not version:
        raise HTTPException(status_code=404, detail="Version not found")
    diagram = db.query(Diagram).filter(Diagram.id == version.diagram_id).first()
    if not diagram:
        raise HTTPException(status_code=404, detail="Diagram not found")
    diagram.schema_json = version.flow_json
    diagram.sql_content = version.sql_content
    diagram.active_dialect = version.active_dialect
    db.commit()
    return serialize_version(version)

