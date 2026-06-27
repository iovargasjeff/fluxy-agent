# Fluxy MVP Demo

This is the target demo flow for the current MVP baseline.

## Prerequisites

- Node.js and pnpm.
- Python with `services/local-sidecar/requirements.txt` installed.
- Rust/Cargo for Tauri checks.
- Optional: PostgreSQL client tools (`pg_dump`, `pg_restore`).
- Optional: Docker for PostgreSQL sandbox execution.

## Demo Flow

1. Start the cloud API:

   ```powershell
   pnpm run dev:api
   ```

2. Start the web app:

   ```powershell
   pnpm run dev:web
   ```

3. Start the local sidecar:

   ```powershell
   pnpm run dev:local-sidecar
   ```

4. Open Fluxy Desktop or the web app against the local sidecar.

5. Use desktop without login.

6. Connect PostgreSQL and inspect schema.

7. Generate a diagram from selected tables.

8. Preview synthetic data and export PostgreSQL SQL.

9. Run a safe skill through MCP:

   ```json
   {
     "jsonrpc": "2.0",
     "id": 1,
     "method": "tools/call",
     "params": {
       "name": "fluxy_run_skill",
       "arguments": {
         "skill_id": "review_database",
         "instruction": "review schema quality"
       }
     }
   }
   ```

10. Request a risky skill and confirm it returns approval requirements:

   ```json
   {
     "jsonrpc": "2.0",
     "id": 2,
     "method": "tools/call",
     "params": {
       "name": "fluxy_run_skill",
       "arguments": {
         "skill_id": "safe_migration_basic"
       }
     }
   }
   ```

11. Check PostgreSQL safety tooling:

   ```txt
   GET /api/v1/safety/postgresql/tools
   ```

12. If Docker is available, create a sandbox. If not, Fluxy returns `report_only` fallback.

13. Create an audit log and Markdown report.

14. Enqueue a safe diagram sync artifact. Sensitive payloads must be rejected.

## Current Verification Status

- Web production build passes.
- NestJS API build passes.
- Tauri `cargo check` passes.
- Local sidecar imports and health check pass.
- Python compile checks pass.
- Skills smoke test passes.
- PostgreSQL safety fallback smoke test passes.
- MCP smoke test passes.
- Web lint passes with inherited warnings only.

## Known Follow-ups

- Wire the existing UI flows to the new local API clients end to end.
- Add PyInstaller packaging for `fluxy-sidecar`.
- Re-enable Tauri `externalBin` once the sidecar binary exists.
- Add automatic audit records from every skill runner execution.
- Add cloud sync worker that drains the local safe sync queue after login.
- Add full PostgreSQL sandbox restore/apply/compare workflow.

