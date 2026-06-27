# Phase 00 - Rescue and Decisions

## Goal

Preserve every useful piece before deleting old local repositories.

## Inputs

- `base/sources/fluxsql-main`
- `base/sources/fluxsql-desktop-branch`
- `base/sources/data-generator-main`
- `plan.md` from the parent workspace, used as product planning input.

## Decisions Locked

- Product name is Fluxy.
- Repository is clean, without previous Git history.
- Cloud backend is NestJS.
- Desktop is 100 percent functional without login.
- Login is only required for cloud sync and collaboration.
- PostgreSQL is the first engine for backup and sandbox.
- Skills are free for the first version.

## Salvage Checklist

- Save web frontend from FluxSQL main.
- Save NestJS backend seed from FluxSQL main.
- Save Tauri desktop shell from FluxSQL desktop.
- Save FastAPI local sidecar from FluxSQL desktop.
- Save query analyzer from FluxSQL desktop.
- Save connectors and schema analyzer.
- Save synthetic data generator, Faker mappings and exporters.
- Save docs that help pitch and requirements.

## Exit Criteria

- `base/sources` contains the three source snapshots.
- `base/salvage` contains separated frontend, cloud backend, desktop, local sidecar, synthetic data and docs buckets.
- No source repo has been deleted yet.

