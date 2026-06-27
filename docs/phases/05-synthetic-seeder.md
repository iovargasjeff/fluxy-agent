# Phase 05 - Synthetic Seeder

## Goal

Turn the rescued data generator into Fluxy's internal `seed_data` skill.

## Tasks

- Port generator core, Faker mappings and exporters.
- Add deterministic seed support.
- Add preview mode.
- Add per-column rules.
- Add domain presets: ecommerce, clinic, booking, inventory.
- Fix SQL export by dialect.
- Avoid universal backticks in SQL.
- Support SQL, CSV and JSON artifacts.
- Keep direct insertion blocked unless policy allows it.

## MVP Engines

- PostgreSQL.
- MySQL.
- SQL Server.

## Exit Criteria

- User can preview synthetic rows. Done through `/api/v1/generate/preview`.
- User can export SQL, CSV or JSON. Done through `/api/v1/generate/export`.
- PostgreSQL SQL output uses correct quoting. Done.
- Deterministic seed support exists. Done.
- Column rules exist. Done.
- Domain presets exist for ecommerce, clinic, booking and inventory. Done.
- No direct insert happens without explicit policy approval. Done in Phase 04.

## Current Status

Phase 05 is implemented as the first Synthetic Seeder baseline. It supports reproducible generation, per-column generation rules, domain presets and dialect-aware SQL exports.

## Verification

- `python -m py_compile apps/desktop/backend-python/backend/generators/data_generator.py apps/desktop/backend-python/backend/generators/exporters.py apps/desktop/backend-python/backend/api/generator_router.py` passes.
- A local smoke script verifies deterministic seed output and PostgreSQL identifier quoting.
