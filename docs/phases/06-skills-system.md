# Phase 06 - Skills System

## Goal

Create free, installable, versioned and user-manageable Fluxy skills.

## Tasks

- Create skill metadata format.
- Create skill catalog storage.
- Create installed-skill storage per user/profile.
- Create activation/deactivation state per user/profile.
- Create skill registry backed by storage instead of a root `skills/official` folder.
- Create skill resolver by engine, version, environment and local capabilities.
- Create skill runner.
- Create artifact model for reports, SQL scripts, diagrams, backups and sandbox results.
- Add Skill Hub/Profile UI for download, install, activate and deactivate.

## Initial Skills

- `create_database`
- `review_database`
- `generate_diagram`
- `seed_data`
- `export_documentation`
- `safe_migration_basic`
- `postgresql_inspect`
- `postgresql_backup`
- `postgresql_sandbox`
- `postgresql_query_explain`
- `production_guard`

## Skill Metadata Example

```yaml
id: postgresql-safe-migration
name: PostgreSQL Safe Migration
version: 1.0.0
author: Fluxy
license: free
category: safety
engines:
  - postgresql
min_engine_version: 13
max_engine_version: 17
requires_approval: true
requires_backup: true
requires_sandbox: true
default_enabled: true
```

## Exit Criteria

- Skills can be listed. Done through `/api/v1/skills`.
- Skills can be installed/downloaded by the user.
- Skills can be activated or deactivated by the user.
- Compatible skills can be resolved for a database profile. Done through `/api/v1/skills/resolve`.
- A skill can run and produce artifacts. Done through `/api/v1/skills/run`.

## Current Status

Phase 06 currently has a first local runtime with built-in metadata in the sidecar registry. The product target is a persisted skill catalog with installed/enabled state per user or database profile. The runner returns safe artifacts for low-risk skills and returns policy requirements for risky skills.

## Verification

- `python -m py_compile apps/desktop/backend-python/backend/skills/registry.py apps/desktop/backend-python/backend/skills/runner.py apps/desktop/backend-python/backend/api/skills_router.py` passes.
- Smoke test verifies list, resolve and safe skill run behavior.
