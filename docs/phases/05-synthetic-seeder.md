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

- User can preview synthetic rows.
- User can export SQL, CSV or JSON.
- PostgreSQL SQL output uses correct quoting.
- No direct insert happens without explicit policy approval.

