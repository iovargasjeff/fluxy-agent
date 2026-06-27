# Fluxy Desktop

Fluxy Desktop is the local-first app shell.

It owns its own Next.js frontend, Tauri shell and local FastAPI sidecar for database connections, credentials, backups, sandboxes, synthetic data and MCP.

Desktop must remain fully functional without login. Login only enables cloud sync.

```txt
apps/desktop/
├── frontend-app/    # Next.js desktop UI + src-tauri
└── backend-python/  # FastAPI local sidecar
```
