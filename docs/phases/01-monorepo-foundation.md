# Phase 01 - Monorepo Foundation

## Goal

Create the final Fluxy repository structure and move rescued code into its future home.

## Tasks

- Create `apps/web` from `base/salvage/frontend/fluxsql-web`.
- Create `apps/desktop` from the shared web shell plus `base/salvage/desktop-tauri/src-tauri`.
- Create `services/api` from `base/salvage/backend-cloud-nest/fluxsql-backend-app`.
- Create `services/local-sidecar` from `base/salvage/local-sidecar-fastapi/backend-python`.
- Create `packages/shared` for shared TypeScript types, runtime contracts and API clients.
- Create `packages/db-schema` for cloud schema ownership.
- Create `packages/skill-sdk` for skill metadata and runner contracts.
- Create `packages/mcp-tools` for MCP tool schemas.
- Add root package manager config.
- Add root README, scripts and repo conventions.

## Preferred Tooling

- TypeScript workspace for web, desktop frontend and NestJS API.
- Python service isolated under `services/local-sidecar`.
- Tauri under `apps/desktop/src-tauri`.

## Exit Criteria

- Final folders exist.
- Basic install commands are documented.
- Old rescued code remains in `base` until MVP builds.

