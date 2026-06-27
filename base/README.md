# Base Rescue

This folder is a staging area for salvaged source material. It is intentionally not the final product structure.

## Sources

```txt
base/sources/fluxsql-main
```

Clean copy of the current `fluxsql` main branch checkout.

```txt
base/sources/fluxsql-desktop-branch
```

Clean copy of the `fluxsql` `origin/desktop` branch. This is stored independently because the local checkout was on `main`.

```txt
base/sources/data-generator-main
```

Clean copy of the downloaded data generator repository.

## Salvage Buckets

```txt
base/salvage/frontend/fluxsql-web
```

Web frontend to convert into `apps/web`.

```txt
base/salvage/backend-cloud-nest/fluxsql-backend-app
```

NestJS backend seed to convert into `services/api`.

```txt
base/salvage/desktop-tauri/src-tauri
```

Tauri shell from the desktop branch to convert into `apps/desktop/src-tauri`.

```txt
base/salvage/local-sidecar-fastapi/backend-python
```

FastAPI local sidecar from the desktop branch to convert into `services/local-sidecar`.

```txt
base/salvage/synthetic-data/backend
```

Data generator backend code to mine for connectors, generation logic, exporters, Faker mappings and schema models.

```txt
base/salvage/docs-reference/data-generator-docs
```

Business and architecture documentation useful for product pitch, requirements and future docs.

## What Must Survive

- Visual diagram editor and React Flow canvas.
- Project dashboard, diagram persistence and versioning ideas.
- Supabase/cloud auth integration ideas, but final cloud backend is NestJS.
- Tauri shell and local FastAPI sidecar.
- Database connectors and schema analyzer.
- Synthetic data generator, Faker mappings and SQL/CSV/JSON exporters.
- Query analyzer and adapter structure.
- Local SQLite persistence for desktop offline mode.

## What Must Not Be Carried Blindly

- Returning decrypted database passwords to the frontend.
- Direct inserts into real databases without policy checks.
- Duplicate frontend applications.
- Duplicate cloud auth models that fight the final NestJS API.
- Academic docs copied into the product surface without curation.
- Any assumption that cloud may receive credentials, dumps, backups or private query results.

