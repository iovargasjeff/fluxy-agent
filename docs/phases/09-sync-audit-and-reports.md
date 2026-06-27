# Phase 09 - Sync, Audit and Reports

## Goal

Connect desktop and cloud safely, and create the foundation for Team Safety.

## Tasks

- Create local sync queue.
- Create cloud sync client.
- Create conflict handling for diagrams and versions.
- Sync only safe artifacts.
- Add audit log for local skill runs.
- Add Markdown report generation.
- Add exportable report artifacts.
- Record agent name, skill, connection profile, backup, sandbox, approval and result.

## Sync Modes

```txt
desktop-local:
  save only local

desktop-hybrid:
  save local first, enqueue sync, push safe artifacts when logged in

web:
  save directly to cloud
```

## Exit Criteria

- Desktop local projects can sync diagrams to cloud after login. Baseline queue is implemented through `/api/v1/sync/queue`; cloud push worker is deferred.
- Credentials and private artifacts stay local. Done through safe payload validation that rejects sensitive keys and unsupported artifact types.
- Each skill run has an audit trail. Audit endpoint is implemented through `/api/v1/audit/logs`; full automatic runner integration is deferred to the workflow layer.
- Report artifacts can be opened from the app. Markdown report artifacts are implemented through `/api/v1/audit/reports` and `/api/v1/audit/reports/{id}.md`.

## Current Status

Phase 09 is implemented as a local-first Team Safety foundation. The sidecar now has a safe sync queue, audit log storage and Markdown report artifacts. Sync does not upload credentials, dumps, backups, private query results or raw rows.

## Verification

- `python -m py_compile services/local-sidecar/backend/api/sync_router.py services/local-sidecar/backend/api/audit_router.py services/local-sidecar/backend/sync/safe_payload.py services/local-sidecar/backend/reports/markdown.py` passes.
- Smoke test verifies safe sync enqueue, sensitive payload rejection and Markdown report rendering.
