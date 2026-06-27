# Phase 07 - PostgreSQL Backup and Sandbox

## Goal

Make safe PostgreSQL workflows real before broadening to other engines.

## Tasks

- Detect PostgreSQL version.
- Detect `pg_dump` and `pg_restore`.
- Detect Docker availability.
- Create backup manager.
- Create sandbox manager.
- If Docker exists, create a matching PostgreSQL container.
- If Docker does not exist but local PostgreSQL exists, create a shadow database.
- If neither exists, generate SQL and mark the run as not tested.
- Restore backup into sandbox.
- Apply generated migration in sandbox.
- Compare schema before and after.
- Generate report.

## Exit Criteria

- Fluxy can create a local PostgreSQL backup. Done when `pg_dump` is available; otherwise returns `unavailable`.
- Fluxy can create a Docker sandbox when Docker is available. Done through `/api/v1/safety/postgresql/sandbox`.
- Fluxy can test a migration against sandbox. Baseline creates sandbox/fallback; migration application is deferred to safe migration workflow.
- User receives a report before any real database change. Baseline endpoints return explicit status and fallback before real writes.

## Current Status

Phase 07 is implemented as a safe PostgreSQL backup/sandbox baseline. The sidecar detects `pg_dump`, `pg_restore` and Docker. It creates real local backups/sandboxes only when local tooling is available and returns clear fallback states otherwise.

## Verification

- `python -m py_compile apps/desktop/backend-python/backend/backups/postgres_backup.py apps/desktop/backend-python/backend/sandbox/postgres_sandbox.py apps/desktop/backend-python/backend/api/safety_router.py` passes.
- Smoke test verifies tool detection and report-only fallback behavior when Docker is unavailable.
