# Fluxy

Fluxy is the clean monorepo for the Fluxy agent product.

The repository starts from a controlled rescue of three sources:

- FluxSQL web/main.
- FluxSQL desktop branch.
- Data Generator project.

The product direction is:

```txt
Fluxy Web = cloud projects, collaboration, diagrams, versions and sync.
Fluxy Cloud API = NestJS backend for accounts, projects, billing-ready limits and team controls.
Fluxy Desktop = local-first app with Tauri, FastAPI sidecar, real database connections and offline mode.
Fluxy Skills = free installable workflows for database review, seeding, documentation and safe migration.
Fluxy MCP = local bridge for AI agents.
```

Repository shape:

```txt
apps/
├── web/
│   ├── frontend-app/  # cloud web UI
│   └── backend-api/   # NestJS cloud API
└── desktop/
    ├── frontend-app/  # desktop Next.js UI + Tauri
    └── backend-python/ # FastAPI local sidecar
```

Core security rule:

```txt
Cloud syncs safe artifacts.
Local runtime keeps credentials, backups, sandboxes, dumps and private query results.
```

Start here:

- [Base rescue map](./base/README.md)
- [Development phases](./docs/phases/README.md)
