from backend.models.schemas import DatabaseEnvironmentEnum, PolicyCheckResponse, PolicyDecision


WRITE_OPERATIONS = {"insert", "update", "delete", "drop", "alter", "truncate", "direct_insert"}


def classify_environment(host: str, database: str, alias: str | None = None) -> DatabaseEnvironmentEnum:
    text = " ".join(part for part in [host, database, alias or ""] if part).lower()

    if any(marker in text for marker in ["prod", "production", "live"]):
        return DatabaseEnvironmentEnum.production
    if any(marker in text for marker in ["stage", "staging", "qa", "preprod"]):
        return DatabaseEnvironmentEnum.staging
    if any(marker in text for marker in ["localhost", "127.0.0.1", "::1", "dev", "local", "test"]):
        return DatabaseEnvironmentEnum.development
    return DatabaseEnvironmentEnum.unknown


def mask_host(host: str) -> str:
    if host in {"localhost", "127.0.0.1", "::1"}:
        return host
    parts = host.split(".")
    if len(parts) >= 2:
        return f"{parts[0]}.***.{parts[-1]}"
    if len(host) <= 4:
        return "***"
    return f"{host[:2]}***{host[-2:]}"


def make_connection_id(engine: str, host: str, port: int, database: str, username: str | None = None) -> str:
    normalized = []
    for part in [engine, host, port, database, username or "user"]:
        normalized.append(str(part).lower().replace(" ", "_").replace(".", "_").replace("-", "_"))
    return f"local_{'_'.join(normalized)}"


def evaluate_policy(
    operation: str,
    environment: DatabaseEnvironmentEnum = DatabaseEnvironmentEnum.unknown,
    has_backup: bool = False,
    has_sandbox: bool = False,
    human_approved: bool = False,
) -> PolicyCheckResponse:
    normalized = operation.lower().strip()

    if normalized not in WRITE_OPERATIONS:
        return PolicyCheckResponse(decision=PolicyDecision.allow, reason="Read-only operation.")

    if environment == DatabaseEnvironmentEnum.production:
        return PolicyCheckResponse(
            decision=PolicyDecision.block,
            reason="Production profiles are read-only by default.",
            requires_backup=True,
            requires_sandbox=True,
            requires_human_approval=True,
        )

    if not has_backup or not has_sandbox or not human_approved:
        return PolicyCheckResponse(
            decision=PolicyDecision.require_approval,
            reason="Direct writes require backup, sandbox and explicit human approval.",
            requires_backup=not has_backup,
            requires_sandbox=not has_sandbox,
            requires_human_approval=not human_approved,
        )

    return PolicyCheckResponse(decision=PolicyDecision.allow, reason="Write policy requirements satisfied.")
