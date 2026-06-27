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

- Web can create, list and edit cloud projects through NestJS.
- Diagrams are persisted through cloud API.
- No local database credentials are represented in cloud DTOs.

