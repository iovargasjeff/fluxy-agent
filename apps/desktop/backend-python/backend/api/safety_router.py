from fastapi import APIRouter

from backend.backups.postgres_backup import create_postgres_backup, detect_pg_dump, detect_pg_restore
from backend.models.schemas import BackupRequest, BackupResponse, SandboxRequest, SandboxResponse
from backend.sandbox.postgres_sandbox import detect_docker, prepare_postgres_sandbox

router = APIRouter(prefix="/safety", tags=["Safety"])


@router.get("/postgresql/tools")
def get_postgresql_tools():
    return {
        "pg_dump": detect_pg_dump(),
        "pg_restore": detect_pg_restore(),
        "docker": detect_docker(),
    }


@router.post("/postgresql/backup", response_model=BackupResponse)
def create_backup(req: BackupRequest):
    return create_postgres_backup(req)


@router.post("/postgresql/sandbox", response_model=SandboxResponse)
def create_sandbox(req: SandboxRequest):
    return prepare_postgres_sandbox(req)
