"""
models/schemas.py
Schemas Pydantic para request/response de todos los endpoints.
"""
from pydantic import BaseModel, Field
from typing import Optional, List, Any, Dict
from datetime import datetime
from enum import Enum


# ─────────────────────────────────────────────────────────────
# ENUMS
# ─────────────────────────────────────────────────────────────
class MotorBDEnum(str, Enum):
    mysql = "mysql"
    postgresql = "postgresql"
    sqlserver = "sqlserver"
    mongodb = "mongodb"
    cassandra = "cassandra"
    neo4j = "neo4j"


# ─────────────────────────────────────────────────────────────
# CONEXION SCHEMAS
# ─────────────────────────────────────────────────────────────
class ConexionRequest(BaseModel):
    host: str = Field(..., min_length=1)
    puerto: int = Field(..., ge=1, le=65535)
    usuario: str
    password: str
    nombre_bd: str
    motor: Optional[MotorBDEnum] = None  # Auto-detectado si no se proporciona


class ConexionResponse(BaseModel):
    id: int
    motor_bd: str
    host: str
    puerto: int
    nombre_bd: str
    registros_generados: int
    registros_insertados: int
    created_at: datetime

    class Config:
        from_attributes = True


class ConexionGuardadaResponse(BaseModel):
    """Conexión guardada con credenciales (contraseña ya descifrada) para pre-rellenar el formulario."""
    id: int
    nombre_alias: Optional[str] = None
    motor_bd: str
    host: str
    puerto: int
    nombre_bd: str
    usuario_db: Optional[str] = None
    password_db: Optional[str] = None   # devuelta descifrada
    created_at: datetime

    class Config:
        from_attributes = True


# ─────────────────────────────────────────────────────────────
# SCHEMA BD EXTERNA
# ─────────────────────────────────────────────────────────────
class ColumnSchema(BaseModel):
    name: str
    data_type: str
    is_nullable: bool = True
    is_primary_key: bool = False
    is_unique: bool = False
    default_value: Optional[str] = None
    foreign_key: Optional[Dict[str, str]] = None  # {"table": "...", "column": "..."}
    max_length: Optional[int] = None


class TableSchema(BaseModel):
    name: str
    columns: List[ColumnSchema]
    primary_keys: List[str] = []
    foreign_keys: List[Dict[str, Any]] = []


class DatabaseSchema(BaseModel):
    motor: str
    database_name: str
    tables: List[TableSchema]


class TableRowsRequest(BaseModel):
    connection: ConexionRequest
    table_name: str = Field(..., min_length=1)
    page: int = Field(default=1, ge=1)
    page_size: int = Field(default=25, ge=1, le=100)


class TableRowsResponse(BaseModel):
    table_name: str
    columns: List[str]
    rows: List[List[Any]]
    page: int
    page_size: int
    total_rows: int
    total_pages: int


# ─────────────────────────────────────────────────────────────
# GENERACIÓN DE DATOS
# ─────────────────────────────────────────────────────────────
class TableGenerationConfig(BaseModel):
    table_name: str
    record_count: int = Field(..., ge=1, le=100000)
    selected: bool = True


class GenerateRequest(BaseModel):
    schema: DatabaseSchema
    table_configs: List[TableGenerationConfig]
    locale: Optional[str] = "es_ES"


class GeneratePreviewRequest(BaseModel):
    schema: DatabaseSchema
    table_configs: List[TableGenerationConfig]
    preview_rows: int = Field(default=10, ge=1, le=100)
    locale: Optional[str] = "es_ES"


class GeneratedDataResponse(BaseModel):
    table_name: str
    columns: List[str]
    rows: List[List[Any]]
    total_rows: int


class ExportRequest(BaseModel):
    schema: DatabaseSchema
    table_configs: List[TableGenerationConfig]
    format: str = Field(..., pattern="^(sql|csv|json)$")
    locale: Optional[str] = "es_ES"


class ExportResponse(BaseModel):
    file_id: str
    filename: str
    format: str
    download_url: str
    total_records: int


# ─────────────────────────────────────────────────────────────
# INSERCIÓN DIRECTA
# ─────────────────────────────────────────────────────────────
class InsertRequest(BaseModel):
    connection: ConexionRequest
    schema: DatabaseSchema
    table_configs: List[TableGenerationConfig]
    locale: Optional[str] = "es_ES"


class InsertResponse(BaseModel):
    success: bool
    tables_processed: int
    total_inserted: int
    total_errors: int
    logs: List[str]


# ─────────────────────────────────────────────────────────────
# PARSER SQL
# ─────────────────────────────────────────────────────────────
class ParseSQLRequest(BaseModel):
    sql_content: str


class ParseSQLResponse(BaseModel):
    success: bool
    schema: Optional[DatabaseSchema] = None
    warnings: List[str] = []
    error: Optional[str] = None
