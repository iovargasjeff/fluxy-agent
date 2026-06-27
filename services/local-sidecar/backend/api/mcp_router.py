from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from backend.api.connector_router import connection_profile_from_model
from backend.mcp.tools import MCP_TOOLS, call_tool, mcp_error
from backend.models.models import Conexion
from backend.models.schemas import DatabaseProfile, McpRpcRequest, McpRpcResponse
from backend.core.database import get_db

router = APIRouter(prefix="/mcp", tags=["MCP"])


@router.get("/health")
def mcp_health():
    return {
        "status": "ok",
        "protocol": "json-rpc",
        "tools": [tool["name"] for tool in MCP_TOOLS],
    }


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
            return [connection_profile_from_model(c).model_dump() for c in db.query(Conexion).all()]

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

        try:
            return McpRpcResponse(id=req.id, result=call_tool(tool_name, arguments, list_connections, get_profile))
        except Exception as error:
            return mcp_error(req.id, -32000, str(error))

    return mcp_error(req.id, -32601, f"Unsupported MCP method: {req.method}")
