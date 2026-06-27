# Phase 10 - MVP Demo and Cleanup

## Goal

Prepare a product demo and remove obsolete staging material only after the new repo works.

## Demo Flow

1. Open Fluxy Desktop.
2. Use it without login.
3. Connect to local PostgreSQL.
4. Generate a diagram from the real database.
5. Preview synthetic data.
6. Export seed SQL.
7. Log in.
8. Sync diagram to cloud.
9. Ask an AI agent through MCP to review the database.
10. Fluxy creates backup.
11. Fluxy creates sandbox.
12. Fluxy tests a migration in sandbox.
13. Fluxy generates report.
14. User approves or discards.

## Cleanup Rules

- Do not delete old source repos until Phase 10 exits.
- Keep `base/sources` until equivalent code exists in final folders.
- Keep `base/salvage` until the MVP demo passes.
- After cleanup, keep a short `docs/archive/sources.md` with original repo references.

## Exit Criteria

- Web build passes.
- Desktop build starts.
- Local sidecar starts.
- NestJS API starts.
- PostgreSQL demo passes.
- MCP demo passes.
- Old repos can be archived or deleted confidently.

