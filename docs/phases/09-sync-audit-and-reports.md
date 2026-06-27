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

- Desktop local projects can sync diagrams to cloud after login.
- Credentials and private artifacts stay local.
- Each skill run has an audit trail.
- Report artifacts can be opened from the app.

