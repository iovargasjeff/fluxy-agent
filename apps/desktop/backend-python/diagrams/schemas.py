from pydantic import BaseModel
from typing import Any, Dict, List, Optional
from datetime import datetime
from backend.models.schemas import ConexionRequest

class ProjectBase(BaseModel):
    name: str
    description: Optional[str] = None

class ProjectCreate(ProjectBase):
    pass

class ProjectUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None

class ProjectResponse(ProjectBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    deleted_at: Optional[datetime] = None
    is_public: bool
    share_access: str

    class Config:
        from_attributes = True

class DiagramBase(BaseModel):
    name: str
    schema_json: Optional[str] = None
    project_id: int
    sql_content: str = ""
    active_dialect: str = "postgresql"

class DiagramCreate(DiagramBase):
    pass

class DiagramUpdate(BaseModel):
    name: Optional[str] = None
    schema_json: Optional[str] = None
    sql_content: Optional[str] = None
    active_dialect: Optional[str] = None

class DiagramResponse(DiagramBase):
    id: int
    source_database: Optional[str] = None
    selected_tables_json: str = "[]"
    last_synced_at: Optional[datetime] = None
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class VersionCreate(BaseModel):
    project_id: int
    message: str
    flow_json: Dict[str, Any]
    sql_content: str = ""
    active_dialect: str = "postgresql"
    snapshots: Dict[str, str]


class VersionSummary(BaseModel):
    id: int
    version_number: int
    message: str
    created_at: datetime

    class Config:
        from_attributes = True


class VersionDetail(VersionSummary):
    flow_json: Dict[str, Any]
    sql_content: str
    active_dialect: str
    snapshots: Dict[str, str]


class DiagramLayoutUpdate(BaseModel):
    positions: Dict[str, Dict[str, float]]
    viewport: Optional[Dict[str, float]] = None


class TableRowsRequest(BaseModel):
    connection: ConexionRequest
    page: int = 1
    page_size: int = 25


class TableRowsResponse(BaseModel):
    table_name: str
    columns: List[str]
    rows: List[List[Any]]
    page: int
    page_size: int
    total_rows: int
    total_pages: int
