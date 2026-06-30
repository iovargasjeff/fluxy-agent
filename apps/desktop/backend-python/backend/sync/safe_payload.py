SENSITIVE_KEYS = {
    "password",
    "password_db",
    "connection_string",
    "dsn",
    "dump",
    "backup_path",
    "private_query_results",
    "rows",
    "data",
}

ALLOWED_ARTIFACT_TYPES = {
    "project",
    "diagram",
    "diagram_version",
    "comment",
    "public_link",
    "skill_preferences",
    "agent_memory",
    "skill_permission",
    "approval_request",
    "agent_run",
    "schema_decision",
    "environment_guard",
}


def validate_safe_sync_payload(artifact_type: str, payload: dict):
    if artifact_type not in ALLOWED_ARTIFACT_TYPES:
        raise ValueError(f"Artifact type `{artifact_type}` is not allowed for cloud sync.")

    def walk(value, path="payload"):
        if isinstance(value, dict):
            for key, nested in value.items():
                if key.lower() in SENSITIVE_KEYS:
                    raise ValueError(f"Sensitive key `{path}.{key}` cannot be synced.")
                walk(nested, f"{path}.{key}")
        elif isinstance(value, list):
            for index, item in enumerate(value):
                walk(item, f"{path}[{index}]")

    walk(payload)
