# Phase 01 - Monorepo Foundation

## Goal

Create the final Fluxy repository structure and move rescued code into its future home.

## Tasks

- Create `apps/web/frontend-app` from the rescued web source.
- Create `apps/desktop` from the rescued desktop source.
- Create `apps/web/backend-api` from the rescued NestJS source.
- Create `apps/desktop/backend-python` from the rescued FastAPI sidecar source.
- Defer shared TypeScript packages until web and desktop need real shared contracts.
- Add root package manager config.
- Add root README, scripts and repo conventions.

## Preferred Tooling

- TypeScript workspace for web, desktop frontend and NestJS API.
- Python service isolated under `apps/desktop/backend-python`.
- Tauri under `apps/desktop/frontend-app/src-tauri`.

## Exit Criteria

- Final folders exist. Done.
- Basic install commands are documented. Done.
- Rescued web code exists in `apps/web/frontend-app`. Done.
- Rescued NestJS API code exists in `apps/web/backend-api`. Done.
- Rescued Tauri code exists in `apps/desktop/frontend-app/src-tauri`. Done.
- Rescued FastAPI sidecar exists in `apps/desktop/backend-python`. Done.
- Shared package placeholders are intentionally removed until they have real consumers. Done.
- Skill folder placeholders are intentionally removed; skills move to persisted app/catalog state. Done.
- Old rescued code was removed from the active tree after migration. Done.

## Current Status

Phase 01 is structurally complete. The next phase must make the web app and NestJS API coherent as Fluxy cloud surfaces.
