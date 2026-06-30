import os
from pathlib import Path

from fastapi import APIRouter, Depends, Request
from sqlalchemy.orm import Session

from backend.api.connector_router import connection_profile_from_model
from backend.connectors.connector_factory import get_connector
from backend.core.encryption import decrypt_password
from backend.mcp.tools import MCP_TOOLS, call_tool, mcp_error
from backend.models.models import Conexion
from backend.models.schemas import ConexionRequest, DatabaseProfile, McpRpcRequest, McpRpcResponse
from backend.core.database import get_db

router = APIRouter(prefix="/mcp", tags=["MCP"])


@router.get("/health")
def mcp_health():
    return {
        "status": "ok",
        "protocol": "json-rpc",
        "tools": [tool["name"] for tool in MCP_TOOLS],
    }


def resolve_stdio_bridge_path() -> str:
    configured = os.environ.get("FLUXY_MCP_BRIDGE_PATH")
    if configured:
        return configured

    current = Path(__file__).resolve()
    for parent in current.parents:
        candidate = parent / "scripts" / "fluxy-mcp-stdio.mjs"
        if candidate.exists():
            return str(candidate)

    return "fluxy-mcp-stdio"


@router.get("/config")
def mcp_config(request: Request):
    endpoint = str(request.url_for("mcp_rpc"))
    bridge_path = resolve_stdio_bridge_path()
    command = "node" if bridge_path.endswith(".mjs") else bridge_path
    args = [bridge_path] if bridge_path.endswith(".mjs") else []
    return {
        "endpoint": endpoint,
        "bridge_path": bridge_path,
        "codex": {
            "mcpServers": {
                "fluxy": {
                    "command": command,
                    "args": args,
                    "env": {"FLUXY_MCP_URL": endpoint},
                }
            }
        },
        "antigravity": {
            "servers": {
                "fluxy": {
                    "type": "stdio",
                    "command": command,
                    "args": args,
                    "env": {"FLUXY_MCP_URL": endpoint},
                }
            }
        },
    }


def _validate_guarded_sql(sql_text: str) -> str:
    sql = sql_text.strip()
    lowered = sql.lower()

    if not sql:
        raise ValueError("SQL statement is required.")
    if lowered.count(";") > 1 or (";" in lowered and not lowered.endswith(";")):
        raise ValueError("Only one SQL statement is allowed per MCP call.")

    blocked = ["drop ", "truncate ", "delete ", "update ", "alter ", "grant ", "revoke ", "copy ", "\\", " do "]
    if any(token in f" {lowered} " for token in blocked):
        raise ValueError("This SQL operation needs human approval and is blocked by the local MCP guard.")

    allowed_prefixes = ("create ", "insert ", "comment ")
    if not lowered.startswith(allowed_prefixes):
        raise ValueError("Only CREATE, INSERT and COMMENT statements are allowed by this guarded MCP tool.")

    return sql


@router.post("/rpc", response_model=McpRpcResponse)
def mcp_rpc(req: McpRpcRequest, db: Session = Depends(get_db)):
    if req.method == "initialize":
        return McpRpcResponse(
            id=req.id,
            result={
                "protocolVersion": "2024-11-05",
                "serverInfo": {"name": "Fluxy Local Sidecar MCP", "version": "0.1.0"},
                "capabilities": {"tools": {}},
            },
        )

    if req.method == "tools/list":
        return McpRpcResponse(id=req.id, result={"tools": MCP_TOOLS})

    if req.method == "tools/call":
        tool_name = req.params.get("name")
        arguments = req.params.get("arguments", {})

        def list_connections():
            profiles = []
            for connection in db.query(Conexion).all():
                profile = connection_profile_from_model(connection).model_dump()
                profile["local_id"] = connection.id
                profiles.append(profile)
            return profiles

        def get_profile(conexion_id: int):
            conexion = db.query(Conexion).filter(Conexion.id == conexion_id).first()
            if not conexion:
                raise ValueError("Connection not found.")
            profile = connection_profile_from_model(conexion)
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
                capabilities=["inspect_schema", "generate_diagram", "synthetic_seed_preview"],
            ).model_dump()

        def execute_sql(conexion_id: int, sql_text: str):
            conexion = db.query(Conexion).filter(Conexion.id == conexion_id).first()
            if not conexion:
                raise ValueError("Connection not found.")
            if not conexion.password_db:
                raise ValueError("Connection has no stored credentials.")

            guarded_sql = _validate_guarded_sql(sql_text)
            req = ConexionRequest(
                host=conexion.host,
                puerto=conexion.puerto,
                usuario=conexion.usuario_db or "",
                password=decrypt_password(conexion.password_db),
                nombre_bd=conexion.nombre_bd,
                motor=conexion.motor_bd,
            )

            with get_connector(req) as connector:
                cursor = connector._connection.cursor()
                try:
                    cursor.execute(guarded_sql)
                    rowcount = cursor.rowcount
                    connector._connection.commit()
                finally:
                    cursor.close()

            return {
                "ok": True,
                "conexion_id": conexion_id,
                "statement": guarded_sql.split(None, 1)[0].upper(),
                "rowcount": rowcount,
            }

        try:
            return McpRpcResponse(id=req.id, result=call_tool(tool_name, arguments, list_connections, get_profile, execute_sql))
        except Exception as error:
            return mcp_error(req.id, -32000, str(error))

    return mcp_error(req.id, -32601, f"Unsupported MCP method: {req.method}")
