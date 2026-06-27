# Phase 06 - Skills System

## Goal

Create free, installable and versioned Fluxy skills.

## Tasks

- Create `skills/official`.
- Create skill metadata format.
- Create skill registry.
- Create skill resolver by engine, version, environment and local capabilities.
- Create skill runner.
- Create artifact model for reports, SQL scripts, diagrams, backups and sandbox results.
- Add Skill Hub UI later, but define metadata now.

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

- Skills can be listed.
- Compatible skills can be resolved for a database profile.
- A skill can run and produce artifacts.

