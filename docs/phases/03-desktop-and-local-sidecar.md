# Phase 03 - Desktop and Local Sidecar

## Goal

Make Fluxy Desktop a local-first application that works without login.

## Tasks

- Move Tauri into `apps/desktop/src-tauri`.
- Move FastAPI sidecar into `services/local-sidecar`.
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

- Desktop opens without login.
- Desktop can create local projects.
- Desktop can connect to a local database and inspect schema.
- Desktop can generate diagrams from real databases without cloud.

