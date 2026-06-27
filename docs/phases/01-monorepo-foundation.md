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

- Final folders exist. Done.
- Basic install commands are documented. Done.
- Rescued web code exists in `apps/web`. Done.
- Rescued NestJS API code exists in `services/api`. Done.
- Rescued Tauri code exists in `apps/desktop/src-tauri`. Done.
- Rescued FastAPI sidecar exists in `services/local-sidecar`. Done.
- Shared package placeholders exist under `packages`. Done.
- Official skills folder exists. Done.
- Old rescued code remains in `base` until MVP builds. Done.

## Current Status

Phase 01 is structurally complete. The next phase must make the web app and NestJS API coherent as Fluxy cloud surfaces.
