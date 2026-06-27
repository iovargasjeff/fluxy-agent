# Development Phases

Final product name: Fluxy.

Repository strategy: clean monorepo, no imported Git history.

Backend decision: NestJS for the cloud API.

Desktop decision: fully functional without login. Login only enables cloud sync.

MVP database safety scope: PostgreSQL for backup and sandbox. Other engines may be inspected and used for synthetic generation earlier, but serious safe migration starts with PostgreSQL.

## Target Monorepo

```txt
fluxy-agent/
  apps/
    web/
      frontend-app/
      backend-api/
    desktop/
      frontend-app/
      backend-python/
  skills/
    official/
  docs/
  scripts/
  base/
```

## Phase Order

1. Rescue and decisions.
2. Monorepo foundation.
3. Web and cloud API.
4. Desktop and local sidecar.
5. Local security hardening.
6. Synthetic seeder.
7. Skills system.
8. PostgreSQL backup and sandbox.
9. MCP local bridge.
10. Sync, audit and reports.
11. MVP demo and cleanup.

## Detailed Companions

- [Salvage inventory](../salvage-inventory.md): exact map of what is preserved from each rescued source.
- [Functional MVP checklist](../functional-mvp-checklist.md): concrete work needed to turn the rescued code into a working app.

## Product Rules

- Fluxy cloud never receives database credentials.
- Fluxy cloud never receives backups, dumps or private query results.
- Desktop works offline.
- Direct writes to real databases are blocked by default.
- Risky actions require policy, backup, sandbox and human approval when applicable.
- Skills are free in the first version.
- Team Safety monetizes governance, policies, approvals, audit and private distribution, not basic skill access.
