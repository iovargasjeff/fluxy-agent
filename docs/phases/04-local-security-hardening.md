# Phase 04 - Local Security Hardening

## Goal

Remove unsafe behavior before exposing agent workflows.

## Tasks

- Stop returning decrypted `password_db` to any frontend response.
- Replace saved connection payloads with local `connection_id` and `has_credentials`.
- Store credentials encrypted only in local storage.
- Use a local key strategy that is not derived from a cloud JWT secret.
- Add `DatabaseProfile` with engine, version, host mask, environment and capabilities.
- Classify environment as development, staging or production.
- Block direct insert/update/delete/drop actions by default.
- Add policy decisions for risky operations.

## Safe Saved Connection Response

```json
{
  "connection_id": "local_postgres_ventas",
  "alias": "Ventas local",
  "engine": "postgresql",
  "database": "ventas",
  "host_masked": "localhost",
  "has_credentials": true,
  "environment": "development"
}
```

## Exit Criteria

- Frontend never receives decrypted passwords.
- Cloud never receives credentials.
- Direct insert is behind policy checks.
- Production profiles are read-only by default.

