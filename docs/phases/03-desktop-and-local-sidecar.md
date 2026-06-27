# Phase 03 - Desktop and Local Sidecar

## Goal

Make Fluxy Desktop a local-first application that works without login.

## Tasks

- Move Tauri into `apps/desktop/frontend-app/src-tauri`.
- Move FastAPI sidecar into `apps/desktop/backend-python`.
- Update app name, bundle identifier and window title to Fluxy.
- Start the local sidecar from Tauri.
- Keep local SQLite for offline projects, diagrams and connection profiles.
- Add a local API client in the frontend.
- Add runtime detection: web, desktop local, desktop hybrid.

## Runtime Modes

```txt
web:
  cloud API only

desktop-local:
  local sidecar only

desktop-hybrid:
  local sidecar first, cloud sync when logged in
```

## Exit Criteria

- Desktop Tauri app is moved to `apps/desktop/frontend-app/src-tauri`. Done in Phase 01.
- FastAPI sidecar is moved to `apps/desktop/backend-python`. Done in Phase 01.
- Tauri sidecar boot path points to `apps/desktop/backend-python`. Done.
- Tauri production sidecar binary is named `fluxy-sidecar`. Done.
- Runtime helpers support `web`, `desktop-local` and `desktop-hybrid`. Done.
- Web has a `FluxyLocalApiClient` for the sidecar. Done.
- Desktop opens without login. Pending full app runtime test.
- Desktop can create local projects. Existing local diagram/project routers preserved; full UI wiring pending.
- Desktop can connect to a local database and inspect schema. Existing sidecar route preserved.
- Desktop can generate diagrams from real databases without cloud. Existing sidecar route preserved.

## Verification

- `python -m py_compile apps/desktop/backend-python/main.py apps/desktop/backend-python/backend/api/connector_router.py apps/desktop/backend-python/backend/api/generator_router.py` passes after Phase 04/05 changes.
- `pnpm run lint:web` passes with inherited warnings only.
