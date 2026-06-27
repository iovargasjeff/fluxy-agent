# Salvage Inventory

This document explains what must be saved from the rescued repositories inside `base/`.

## Source Snapshots

```txt
base/sources/fluxsql-main
```

Original web/main snapshot.

Save:

- `frontend-app`: Next.js app, visual editor, dashboard, diagram UI, export UI, auth integration ideas.
- `backend-app`: NestJS seed for the final cloud API.
- `doc`: product and academic references that can be rewritten as Fluxy docs.
- Root README: useful product positioning, but rename FluxSQL to Fluxy.

Do not blindly keep:

- FluxSQL branding.
- Any duplicated backend path if NestJS becomes the only cloud API.
- Old academic wording inside the final product docs.

```txt
base/sources/fluxsql-desktop-branch
```

Original desktop branch snapshot.

Save:

- `frontend-app/src-tauri`: desktop shell, icons, Tauri config, Rust bootstrap.
- `backend-python`: local FastAPI sidecar.
- `backend-python/main.py`: unified local backend entry point.
- `backend-python/backend/api`: connector, generator and parser routers.
- `backend-python/backend/connectors`: database connectors.
- `backend-python/backend/analyzers`: schema analysis.
- `backend-python/backend/generators`: synthetic generation base.
- `backend-python/backend/parsers`: SQL parser.
- `backend-python/diagrams`: local diagram/project persistence.
- `backend-python/query_analyzer`: query analysis adapters and APIs.
- `requirements*.txt` and PyInstaller spec files: useful for desktop packaging.

Must change before production:

- Saved connection responses must not return decrypted passwords.
- Direct insert endpoints must move behind policy checks.
- Local secret storage must be separated from cloud auth secrets.
- App name, bundle identifier and visible branding must become Fluxy.

```txt
base/sources/data-generator-main
```

Original data generator snapshot.

Save:

- `DATA-GENERATOR/backend/connectors`: extra connector implementations and factory patterns.
- `DATA-GENERATOR/backend/analyzers`: schema analyzer ideas.
- `DATA-GENERATOR/backend/generators/data_generator.py`: FK-aware generation logic.
- `DATA-GENERATOR/backend/generators/faker_mappings.py`: column/type to Faker mappings.
- `DATA-GENERATOR/backend/generators/exporters.py`: SQL/CSV/JSON artifact export.
- `DATA-GENERATOR/backend/models`: Pydantic schema ideas.
- `DATA-GENERATOR/backend/parsers`: parser ideas.
- Markdown and Word docs: business pitch, requirements and architecture references.

Do not carry forward as product modules:

- Separate frontend application.
- Duplicate authentication model.
- Duplicate admin dashboard.
- Direct insert behavior without Fluxy policy.
- Documentation copied without editing.

## Salvage Buckets

```txt
base/salvage/frontend/fluxsql-web
```

Future target: `apps/web/frontend-app`.

```txt
base/salvage/backend-cloud-nest/fluxsql-backend-app
```

Future target: `apps/web/backend-api`.

```txt
base/salvage/desktop-tauri/src-tauri
```

Future target: `apps/desktop/frontend-app/src-tauri`.

```txt
base/salvage/local-sidecar-fastapi/backend-python
```

Future target: `apps/desktop/backend-python`.

```txt
base/salvage/synthetic-data/backend
```

Future target: selected modules inside `apps/desktop/backend-python` and `skills/official/seed_data`.

```txt
base/salvage/docs-reference/data-generator-docs
```

Future target: curated docs under `docs/product`, `docs/architecture` and `docs/research`.

## Final Rule

`base/` is not the product. It is the rescue area. Code becomes real only after it is moved into `apps/`, `services/`, `packages/` or `skills/` and adapted to Fluxy rules.

