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

- Fluxy can create a local PostgreSQL backup.
- Fluxy can create a Docker sandbox when Docker is available.
- Fluxy can test a migration against sandbox.
- User receives a report before any real database change.

