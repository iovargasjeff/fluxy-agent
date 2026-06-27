import os
import subprocess
import uuid
from pathlib import Path
from shutil import which

from backend.core.config import settings
from backend.models.schemas import BackupRequest, BackupResponse, ToolStatus


def detect_pg_dump() -> ToolStatus:
    path = which("pg_dump")
    return ToolStatus(name="pg_dump", available=bool(path), path=path)


def detect_pg_restore() -> ToolStatus:
    path = which("pg_restore")
    return ToolStatus(name="pg_restore", available=bool(path), path=path)


def create_postgres_backup(req: BackupRequest) -> BackupResponse:
    tool = detect_pg_dump()
    if req.connection.motor and req.connection.motor.value != "postgresql":
        return BackupResponse(status="unsupported", message="PostgreSQL backup only supports postgresql connections.", tool=tool)

    if not tool.available or not tool.path:
        return BackupResponse(status="unavailable", message="pg_dump is not available on this machine.", tool=tool)

    backup_id = str(uuid.uuid4())
    output_dir = Path(req.output_dir or settings.TEMP_DIR).joinpath("backups")
    output_dir.mkdir(parents=True, exist_ok=True)
    output_path = output_dir.joinpath(f"{backup_id}.dump")

    env = os.environ.copy()
    env["PGPASSWORD"] = req.connection.password
    command = [
        tool.path,
        "--format=custom",
        "--host",
        req.connection.host,
        "--port",
        str(req.connection.puerto),
        "--username",
        req.connection.usuario,
        "--file",
        str(output_path),
        req.connection.nombre_bd,
    ]

    result = subprocess.run(command, env=env, capture_output=True, text=True, timeout=300)
    if result.returncode != 0:
        return BackupResponse(
            status="failed",
            message=result.stderr.strip() or "pg_dump failed.",
            backup_id=backup_id,
            path=str(output_path),
            tool=tool,
        )

    return BackupResponse(
        status="created",
        message="PostgreSQL backup created locally.",
        backup_id=backup_id,
        path=str(output_path),
        tool=tool,
    )
