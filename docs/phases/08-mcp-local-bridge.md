# Phase 08 - MCP Local Bridge

## Goal

Expose Fluxy Desktop to AI agents through a small local MCP surface.

## Tools

- `fluxy_list_connections`
- `fluxy_get_database_profile`
- `fluxy_list_skills`
- `fluxy_run_skill`
- `fluxy_get_skill_status`
- `fluxy_get_artifact`
- `fluxy_request_approval`

## Rule

Agents should mostly call `fluxy_run_skill`. Fluxy decides internal workflow steps using the skill resolver and policy engine.

## Exit Criteria

- MCP server starts from the local sidecar or desktop runtime. Done as `/api/v1/mcp/rpc`.
- Agent can list database profiles without secrets. Done through `fluxy_list_connections`.
- Agent can run a safe read-only skill. Done through `fluxy_run_skill`.
- Risky skill requests return approval requirements instead of executing directly. Done through skill runner policy.

## Current Status

Phase 08 is implemented as a local JSON-RPC MCP bridge exposed by the sidecar. It supports `initialize`, `tools/list` and `tools/call` for the planned Fluxy tools. Persistent skill status/artifact lookup will be expanded in the audit phase.

## Verification

- `python -m py_compile apps/desktop/backend-python/backend/mcp/tools.py apps/desktop/backend-python/backend/api/mcp_router.py` passes.
- Smoke test verifies `initialize`, `tools/list`, a safe `fluxy_run_skill`, and a risky `fluxy_run_skill` returning approval requirements.
