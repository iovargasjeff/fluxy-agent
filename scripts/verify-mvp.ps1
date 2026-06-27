$ErrorActionPreference = "Stop"

Write-Host "== Fluxy MVP Verification =="

Write-Host "Checking API build..."
pnpm run build:api

Write-Host "Checking web build..."
pnpm run build:web

Write-Host "Checking web lint..."
pnpm run lint:web

Write-Host "Checking Tauri desktop..."
Push-Location "apps/desktop/src-tauri"
cargo check
Pop-Location

Write-Host "Checking local sidecar Python modules..."
python -m py_compile `
  services/local-sidecar/main.py `
  services/local-sidecar/backend/api/connector_router.py `
  services/local-sidecar/backend/api/generator_router.py `
  services/local-sidecar/backend/api/skills_router.py `
  services/local-sidecar/backend/api/safety_router.py `
  services/local-sidecar/backend/api/mcp_router.py `
  services/local-sidecar/backend/api/sync_router.py `
  services/local-sidecar/backend/api/audit_router.py `
  services/local-sidecar/backend/models/schemas.py `
  services/local-sidecar/backend/models/models.py `
  services/local-sidecar/backend/policy/engine.py `
  services/local-sidecar/backend/generators/data_generator.py `
  services/local-sidecar/backend/generators/exporters.py `
  services/local-sidecar/backend/skills/registry.py `
  services/local-sidecar/backend/skills/runner.py `
  services/local-sidecar/backend/backups/postgres_backup.py `
  services/local-sidecar/backend/sandbox/postgres_sandbox.py `
  services/local-sidecar/backend/mcp/tools.py `
  services/local-sidecar/backend/sync/safe_payload.py `
  services/local-sidecar/backend/reports/markdown.py

Write-Host "Running local smoke tests..."
@'
import sys
sys.path.insert(0, 'services/local-sidecar')

from main import health_check
from backend.models.schemas import DatabaseEnvironmentEnum, DatabaseProfile, SkillRunRequest
from backend.skills.registry import list_skills, resolve_skills
from backend.skills.runner import run_skill
from backend.sandbox.postgres_sandbox import detect_docker, prepare_postgres_sandbox
from backend.models.schemas import SandboxRequest
from backend.mcp.tools import MCP_TOOLS, call_tool
from backend.sync.safe_payload import validate_safe_sync_payload
from backend.reports.markdown import render_markdown_report

assert health_check()['status'] == 'ok'

profile = DatabaseProfile(
    connection_id='local_pg',
    engine='postgresql',
    database='demo',
    host_masked='localhost',
    port=5432,
    environment=DatabaseEnvironmentEnum.development,
    has_credentials=True,
)
assert any(skill.id == 'review_database' for skill in list_skills())
assert any(skill.id == 'postgresql_backup' for skill in resolve_skills(profile))
assert run_skill(SkillRunRequest(skill_id='review_database', profile=profile)).status == 'completed'
assert run_skill(SkillRunRequest(skill_id='safe_migration_basic', profile=profile)).status == 'requires_approval'

docker = detect_docker()
if not docker.available:
    assert prepare_postgres_sandbox(SandboxRequest()).status == 'fallback'

assert any(tool['name'] == 'fluxy_run_skill' for tool in MCP_TOOLS)
safe = call_tool('fluxy_run_skill', {'skill_id': 'review_database'}, lambda: [], lambda _: {})
assert safe['content'][0]['json']['status'] == 'completed'

validate_safe_sync_payload('diagram', {'id': 1, 'nodes': []})
try:
    validate_safe_sync_payload('diagram', {'password': 'secret'})
    raise AssertionError('sensitive payload should fail')
except ValueError:
    pass

report = render_markdown_report('Fluxy Report', 'OK', {'Checks': ['one', 'two']})
assert '# Fluxy Report' in report

print('mvp smoke ok')
'@ | python -

Write-Host "Fluxy MVP verification completed."

