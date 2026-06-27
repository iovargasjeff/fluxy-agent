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

- MCP server starts from the local sidecar or desktop runtime.
- Agent can list database profiles without secrets.
- Agent can run a safe read-only skill.
- Risky skill requests return approval requirements instead of executing directly.

