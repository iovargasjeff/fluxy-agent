# Fluxy Local Sidecar

FastAPI service used by Fluxy Desktop.

Responsibilities:

- Local database connections.
- Schema inspection.
- Local diagram/project storage.
- Query analysis.
- Synthetic data generation.
- Local credentials.
- PostgreSQL backup and sandbox.
- MCP bridge.

This service must not send database credentials, dumps, backups or private query results to the cloud.

