# Phase 02 - Web and Cloud API

## Goal

Make the cloud product coherent: NestJS API owns cloud data and web uses it through typed clients.

## Tasks

- Rename visible product strings from FluxSQL to Fluxy.
- Keep the visual editor and dashboard.
- Move project, diagram, version and collaboration persistence behind the NestJS API.
- Keep Supabase only if it remains the selected auth/storage provider behind NestJS.
- Define API modules for users, projects, diagrams, versions, comments and public links.
- Define project limits for free users.
- Define cloud-safe connection profile records without secrets.

## Cloud Can Store

- Projects.
- Diagrams.
- Nodes and relationships.
- Canvas positions.
- Generated SQL.
- Versions and commits.
- Comments.
- Public link metadata.
- Non-sensitive skill preferences.

## Cloud Must Not Store

- Passwords.
- Full connection strings.
- Backups.
- Dumps.
- Sandbox files.
- Private query results.
- Logs containing sensitive data.

## Exit Criteria

- Fluxy branding is applied to the moved web/API surface. Done.
- NestJS API exposes cloud-safe modules for users, projects, diagrams, versions, comments and public links. Done.
- Web has a typed `FluxyCloudApiClient` for NestJS calls. Done.
- Cloud artifact policy endpoint documents that credentials, backups, dumps and private query results are not accepted. Done.
- Web can create, list and edit cloud projects through NestJS. Contract ready; persistence wiring is pending.
- Diagrams are persisted through cloud API. Contract ready; persistence wiring is pending.
- No local database credentials are represented in cloud DTOs. Done.

## Current Status

Phase 02 is contract-complete and ready for persistence wiring. The API currently returns safe stub responses for the new modules, which lets the frontend integrate against stable routes before Drizzle/Postgres implementation is finished.

## Verification

- `pnpm list -r --depth -1` detects the Fluxy workspace packages.
- `pnpm --filter @fluxy/api build` passes.
- `rg "FluxSQL|fluxsql" apps/web services/api apps/desktop/src-tauri` returns no matches.
