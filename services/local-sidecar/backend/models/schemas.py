from datetime import datetime
from enum import Enum
from typing import Any, Dict, List, Optional

from pydantic import BaseModel, Field


class MotorBDEnum(str, Enum):
    mysql = "mysql"
    postgresql = "postgresql"
    sqlserver = "sqlserver"
    mongodb = "mongodb"
    cassandra = "cassandra"
    neo4j = "neo4j"


class DatabaseEnvironmentEnum(str, Enum):
    development = "development"
    staging = "staging"
    production = "production"
    unknown = "unknown"


class PolicyDecision(str, Enum):
    allow = "allow"
    block = "block"
    require_approval = "require_approval"


class ConexionRequest(BaseModel):
    host: str = Field(..., min_length=1)
    puerto: int = Field(..., ge=1, le=65535)
    usuario: str
    password: str
    nombre_bd: str
    motor: Optional[MotorBDEnum] = None


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
    """Safe saved connection profile. Never includes passwords."""

    connection_id: str
    alias: Optional[str] = None
    engine: str
    database: str
    host_masked: str
    port: int
    username: Optional[str] = None
    has_credentials: bool
    environment: DatabaseEnvironmentEnum = DatabaseEnvironmentEnum.unknown
    created_at: datetime

    class Config:
        from_attributes = True


class DatabaseProfile(BaseModel):
    connection_id: str
    alias: Optional[str] = None
    engine: str
    version: Optional[str] = None
    database: str
    host_masked: str
    port: int
    username: Optional[str] = None
    environment: DatabaseEnvironmentEnum
    has_credentials: bool
    capabilities: List[str] = []


class PolicyCheckRequest(BaseModel):
    operation: str
    environment: DatabaseEnvironmentEnum = DatabaseEnvironmentEnum.unknown
    has_backup: bool = False
    has_sandbox: bool = False
    human_approved: bool = False


class PolicyCheckResponse(BaseModel):
    decision: PolicyDecision
    reason: str
    requires_backup: bool = False
    requires_sandbox: bool = False
    requires_human_approval: bool = False


class ColumnSchema(BaseModel):
    name: str
    data_type: str
    is_nullable: bool = True
    is_primary_key: bool = False
    is_unique: bool = False
    default_value: Optional[str] = None
    foreign_key: Optional[Dict[str, str]] = None
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


class TableGenerationConfig(BaseModel):
    table_name: str
    record_count: int = Field(..., ge=1, le=100000)
    selected: bool = True
    column_rules: Dict[str, Any] = {}


class GenerateRequest(BaseModel):
    schema: DatabaseSchema
    table_configs: List[TableGenerationConfig]
    locale: Optional[str] = "es_ES"
    seed: Optional[int] = None
    domain: Optional[str] = None


class GeneratePreviewRequest(BaseModel):
    schema: DatabaseSchema
    table_configs: List[TableGenerationConfig]
    preview_rows: int = Field(default=10, ge=1, le=100)
    locale: Optional[str] = "es_ES"
    seed: Optional[int] = None
    domain: Optional[str] = None


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
    seed: Optional[int] = None
    domain: Optional[str] = None
    dialect: Optional[str] = None


class ExportResponse(BaseModel):
    file_id: str
    filename: str
    format: str
    download_url: str
    total_records: int


class InsertRequest(BaseModel):
    connection: ConexionRequest
    schema: DatabaseSchema
    table_configs: List[TableGenerationConfig]
    locale: Optional[str] = "es_ES"
    seed: Optional[int] = None
    environment: DatabaseEnvironmentEnum = DatabaseEnvironmentEnum.unknown
    allow_direct_write: bool = False
    human_approved: bool = False


class InsertResponse(BaseModel):
    success: bool
    tables_processed: int
    total_inserted: int
    total_errors: int
    logs: List[str]


class ParseSQLRequest(BaseModel):
    sql_content: str


class ParseSQLResponse(BaseModel):
    success: bool
    schema: Optional[DatabaseSchema] = None
    warnings: List[str] = []
    error: Optional[str] = None
