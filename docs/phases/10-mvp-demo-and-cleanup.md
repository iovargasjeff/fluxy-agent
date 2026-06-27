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

- Web build passes. Done with `pnpm run build:web`.
- Desktop build starts. Done with `cargo check` under `apps/desktop/src-tauri`.
- Local sidecar starts. Import/health check passes; full long-running server is covered by `pnpm run dev:local-sidecar`.
- NestJS API starts. Build passes with `pnpm run build:api`.
- PostgreSQL demo passes. Safety tooling and fallback smoke tests pass; real database demo depends on local PostgreSQL credentials.
- MCP demo passes. Smoke test verifies safe run and risky approval behavior.
- Old repos can be archived or deleted confidently. Keep `base/` until manual end-to-end demo is completed, then follow `docs/archive/sources.md`.

## Current Status

Phase 10 is implemented as an MVP closeout package:

- `docs/mvp-demo.md` documents the full demo flow.
- `docs/archive/sources.md` records the rescued sources.
- `scripts/verify-mvp.ps1` runs the repeatable MVP verification suite.

## Verification

- `pnpm run build:web` passes.
- `pnpm run build:api` passes.
- `cargo check` passes in `apps/desktop/src-tauri`.
- Local sidecar import and health check pass.
- Python compile checks pass.
- MVP smoke tests pass.
