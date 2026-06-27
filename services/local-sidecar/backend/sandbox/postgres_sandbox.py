import subprocess
import uuid
from shutil import which

from backend.models.schemas import SandboxRequest, SandboxResponse, ToolStatus


def detect_docker() -> ToolStatus:
    path = which("docker")
    if not path:
        return ToolStatus(name="docker", available=False)

    try:
        result = subprocess.run([path, "version", "--format", "{{.Server.Version}}"], capture_output=True, text=True, timeout=10)
        return ToolStatus(name="docker", available=result.returncode == 0, path=path)
    except Exception:
        return ToolStatus(name="docker", available=False, path=path)


def prepare_postgres_sandbox(req: SandboxRequest) -> SandboxResponse:
    docker = detect_docker()
    sandbox_id = f"fluxy_pg_sandbox_{uuid.uuid4().hex[:12]}"
    version = req.engine_version or "16"

    if not docker.available or not docker.path:
        return SandboxResponse(
            status="fallback",
            message="Docker is not available. Fluxy will generate SQL/report artifacts without sandbox execution.",
            sandbox_id=sandbox_id,
            docker=docker,
            fallback="report_only",
        )

    image = f"postgres:{version}"
    command = [
        docker.path,
        "run",
        "--detach",
        "--name",
        sandbox_id,
        "-e",
        "POSTGRES_PASSWORD=fluxy_sandbox",
        "-e",
        f"POSTGRES_DB={req.database_name}",
        image,
    ]
    result = subprocess.run(command, capture_output=True, text=True, timeout=120)
    if result.returncode != 0:
        return SandboxResponse(
            status="failed",
            message=result.stderr.strip() or "Docker sandbox creation failed.",
            sandbox_id=sandbox_id,
            docker=docker,
            fallback="report_only",
        )

    return SandboxResponse(
        status="created",
        message="PostgreSQL Docker sandbox created.",
        sandbox_id=sandbox_id,
        docker=docker,
    )
