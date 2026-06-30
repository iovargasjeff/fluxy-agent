from backend.models.schemas import McpRpcResponse, SkillRunRequest
from backend.skills.registry import list_skills
from backend.skills.runner import run_skill


MCP_TOOLS = [
    {
        "name": "fluxy_list_connections",
        "description": "List local saved connection profiles without secrets.",
        "inputSchema": {"type": "object", "properties": {}},
    },
    {
        "name": "fluxy_get_database_profile",
        "description": "Get a local database profile by numeric saved connection id.",
        "inputSchema": {"type": "object", "properties": {"conexion_id": {"type": "integer"}}, "required": ["conexion_id"]},
    },
    {
        "name": "fluxy_execute_sql",
        "description": "Execute a guarded SQL statement against a saved local database connection.",
        "inputSchema": {
            "type": "object",
            "properties": {"conexion_id": {"type": "integer"}, "sql": {"type": "string"}},
            "required": ["conexion_id", "sql"],
        },
    },
    {
        "name": "fluxy_list_skills",
        "description": "List installed Fluxy skills.",
        "inputSchema": {"type": "object", "properties": {}},
    },
    {
        "name": "fluxy_run_skill",
        "description": "Run a Fluxy skill through the local policy engine.",
        "inputSchema": {"type": "object", "properties": {"skill_id": {"type": "string"}}},
    },
    {
        "name": "fluxy_get_skill_status",
        "description": "Return baseline skill run status. Persistent status store arrives in audit phase.",
        "inputSchema": {"type": "object", "properties": {"run_id": {"type": "string"}}},
    },
    {
        "name": "fluxy_get_artifact",
        "description": "Return baseline artifact lookup status. Persistent artifact store arrives in audit phase.",
        "inputSchema": {"type": "object", "properties": {"artifact_id": {"type": "string"}}},
    },
    {
        "name": "fluxy_request_approval",
        "description": "Create an approval request placeholder for risky operations.",
        "inputSchema": {"type": "object", "properties": {"reason": {"type": "string"}}},
    },
]


def text_result(text: str):
    return {"content": [{"type": "text", "text": text}]}


def call_tool(name: str, arguments: dict, list_connections, get_profile, execute_sql):
    if name == "fluxy_list_connections":
        return {"content": [{"type": "json", "json": list_connections()}]}
    if name == "fluxy_get_database_profile":
        return {"content": [{"type": "json", "json": get_profile(arguments["conexion_id"])}]}
    if name == "fluxy_execute_sql":
        return {"content": [{"type": "json", "json": execute_sql(arguments["conexion_id"], arguments["sql"])}]}
    if name == "fluxy_list_skills":
        return {"content": [{"type": "json", "json": [skill.model_dump() for skill in list_skills()]}]}
    if name == "fluxy_run_skill":
        response = run_skill(SkillRunRequest(**arguments))
        return {"content": [{"type": "json", "json": response.model_dump()}]}
    if name == "fluxy_get_skill_status":
        return text_result("Skill status persistence will be available in the audit phase.")
    if name == "fluxy_get_artifact":
        return text_result("Artifact persistence will be available in the audit phase.")
    if name == "fluxy_request_approval":
        return text_result("Approval request recorded as pending in this baseline bridge.")
    raise ValueError(f"Unknown MCP tool: {name}")


def mcp_error(request_id, code: int, message: str):
    return McpRpcResponse(id=request_id, error={"code": code, "message": message})
