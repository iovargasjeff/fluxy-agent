# Functional MVP Checklist

This checklist turns the phase plan into a working app plan.

## Repository Foundation

- Create `apps/web`.
- Create `apps/desktop`.
- Create `services/api`.
- Create `services/local-sidecar`.
- Create `packages/shared`.
- Create `packages/db-schema`.
- Create `packages/skill-sdk`.
- Create `packages/mcp-tools`.
- Create `skills/official`.
- Add root workspace scripts.
- Add environment examples for web, API and local sidecar.

Done when:

- Root install works.
- Each app/service has a documented dev command.

## Web App

- Move rescued Next.js code into `apps/web`.
- Rename visible product text to Fluxy.
- Keep project dashboard.
- Keep diagram editor.
- Keep export actions.
- Replace direct persistence calls with typed API clients where needed.
- Add runtime mode detection for web.

Done when:

- Web app starts.
- User can create or open a diagram UI.
- Web talks to NestJS API for cloud data.

## Cloud API

- Move rescued NestJS seed into `services/api`.
- Define modules: auth, users, projects, diagrams, versions, comments, public links.
- Define DTOs that never include local secrets.
- Own cloud project and diagram persistence.
- Prepare future Team Safety modules without implementing enterprise complexity yet.

Done when:

- API starts.
- Web can save and load projects through API.
- Cloud DTOs contain no passwords, dumps, backups or private query results.

## Desktop App

- Move Tauri shell into `apps/desktop/src-tauri`.
- Point desktop frontend to shared web UI or desktop build.
- Rename app title and bundle metadata to Fluxy.
- Start or connect to the FastAPI local sidecar.
- Support offline mode without login.

Done when:

- Desktop app opens.
- Desktop works without login.
- Desktop can reach local sidecar health endpoint.

## Local Sidecar

- Move FastAPI backend into `services/local-sidecar`.
- Keep connector routes.
- Keep schema analysis.
- Keep local diagram/project storage.
- Keep query analyzer.
- Add local-only connection profile API.
- Add health endpoint and app version endpoint.

Done when:

- Sidecar starts.
- Sidecar can test a PostgreSQL connection.
- Sidecar can inspect a schema.
- Sidecar can save a local project/diagram.

## Security Hardening

- Remove password fields from saved connection responses.
- Use `connection_id` instead of passing full connection data around.
- Store credentials encrypted locally.
- Add `DatabaseProfile`.
- Add environment classification.
- Add policy engine.
- Block direct writes by default.

Done when:

- Frontend cannot receive decrypted database passwords.
- Cloud cannot receive database credentials.
- Direct insert/update/delete/drop requires policy approval.

## Synthetic Seeder

- Port useful generator logic from `base/salvage/synthetic-data/backend`.
- Add deterministic seeds.
- Add preview mode.
- Add SQL dialect quoting.
- Add CSV and JSON artifact export.
- Add per-column rules.
- Add first domain presets.

Done when:

- User can preview generated data.
- User can export PostgreSQL SQL safely.
- No real insert happens unless policy allows it.

## Skills

- Define skill metadata.
- Add official skills folder.
- Add registry.
- Add resolver.
- Add runner.
- Add artifacts.
- Add initial `seed_data`, `review_database`, `generate_diagram` and `safe_migration_basic`.

Done when:

- App can list skills.
- App can resolve skills by database engine/version.
- A skill can run and produce a report or artifact.

## PostgreSQL Backup and Sandbox

- Detect `pg_dump`.
- Detect Docker.
- Create local backup records.
- Create Docker PostgreSQL sandbox when possible.
- Restore backup to sandbox.
- Apply generated migration in sandbox.
- Produce comparison report.

Done when:

- A PostgreSQL database can be backed up.
- A sandbox can be created or a clear fallback is reported.
- A migration can be tested before touching the real database.

## MCP

- Expose minimal local MCP tools.
- List connection profiles without secrets.
- List skills.
- Run a read-only skill.
- Return approval-required state for risky skills.

Done when:

- An agent can call Fluxy locally.
- Agent cannot access raw credentials.
- Risky operations do not execute directly.

## Sync, Audit and Reports

- Add local sync queue.
- Sync safe diagram artifacts only.
- Add audit records for skill runs.
- Add Markdown reports.
- Record approvals and policy decisions.

Done when:

- Desktop can sync diagrams after login.
- Sensitive local artifacts stay local.
- Every agent-triggered workflow leaves an audit trail.

## MVP Is Functional When

- Web starts.
- NestJS API starts.
- Desktop starts.
- Local sidecar starts.
- Desktop works without login.
- Desktop connects to PostgreSQL.
- Desktop generates a diagram from PostgreSQL.
- Desktop previews synthetic data.
- Desktop exports seed SQL.
- Desktop can login and sync a diagram.
- MCP can run a safe review skill.
- PostgreSQL backup/sandbox demo works or reports a clear fallback.

