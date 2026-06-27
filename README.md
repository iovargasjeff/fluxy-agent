# Fluxy

Fluxy is the clean monorepo for the Fluxy product.

The product direction is:

```txt
Fluxy Web = cloud projects, collaboration, diagrams, versions and sync.
Fluxy Cloud API = NestJS backend for accounts, projects and team-ready controls.
Fluxy Desktop = local-first app with Tauri, FastAPI sidecar, real database connections and offline mode.
Fluxy Skills = free installable workflows managed from the app, with per-user/per-profile enablement.
Fluxy MCP = local bridge for AI agents.
```

Repository shape:

```txt
apps/
  web/
    frontend-app/   # cloud web UI
    backend-api/    # NestJS cloud API
  desktop/
    frontend-app/   # desktop Next.js UI + Tauri
    backend-python/ # FastAPI local sidecar
docs/
scripts/
```

Core security rule:

```txt
Cloud syncs safe artifacts.
Local runtime keeps credentials, backups, sandboxes, dumps and private query results.
```

Start here:

- [Development phases](./docs/phases/README.md)
