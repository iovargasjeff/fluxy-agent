create table if not exists public.skill_catalog (
  id text primary key,
  name text not null,
  description text not null default '',
  version text not null default '1.0.0',
  author text not null default 'Fluxy',
  license text not null default 'free',
  category text not null,
  engines text[] not null default array[]::text[],
  tags text[] not null default array[]::text[],
  min_engine_version text,
  max_engine_version text,
  risk_level text not null default 'low' check (risk_level in ('low', 'medium', 'high')),
  requires_approval boolean not null default false,
  requires_backup boolean not null default false,
  requires_sandbox boolean not null default false,
  default_enabled boolean not null default true,
  source_url text,
  spec_version text not null default 'agent-skills-v1',
  manifest jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.user_skills (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  skill_id text not null references public.skill_catalog(id) on delete cascade,
  installed_version text not null,
  enabled boolean not null default true,
  install_source text not null default 'fluxy-catalog',
  installed_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint user_skills_user_id_skill_id_unique unique (user_id, skill_id)
);

create index if not exists skill_catalog_category_idx on public.skill_catalog(category);
create index if not exists user_skills_user_id_idx on public.user_skills(user_id);

insert into public.skill_catalog (
  id, name, description, category, engines, tags, risk_level,
  requires_approval, requires_backup, requires_sandbox, manifest
) values
  ('create_database', 'Create Database', 'Design a new database schema from a product brief or domain model.', 'design', array[]::text[], array['schema','agent-skills'], 'low', false, false, false, '{"entrypoint":"SKILL.md"}'::jsonb),
  ('review_database', 'Review Database', 'Inspect schema structure and produce safe improvement recommendations.', 'review', array[]::text[], array['review','quality'], 'low', false, false, false, '{"entrypoint":"SKILL.md"}'::jsonb),
  ('generate_diagram', 'Generate Diagram', 'Create ER diagrams and documentation artifacts from database metadata.', 'diagram', array[]::text[], array['diagram','docs'], 'low', false, false, false, '{"entrypoint":"SKILL.md"}'::jsonb),
  ('seed_data', 'Synthetic Data Seeder', 'Generate realistic synthetic records using domain presets and table rules.', 'synthetic-data', array[]::text[], array['seed','faker'], 'medium', false, false, false, '{"entrypoint":"SKILL.md"}'::jsonb),
  ('export_documentation', 'Export Documentation', 'Export database summaries, table dictionaries and reports.', 'documentation', array[]::text[], array['docs','reports'], 'low', false, false, false, '{"entrypoint":"SKILL.md"}'::jsonb),
  ('safe_migration_basic', 'Safe Migration Basic', 'Plan guarded migrations with required backup, sandbox and human approval.', 'safety', array['postgresql'], array['migration','safety','postgresql'], 'high', true, true, true, '{"entrypoint":"SKILL.md"}'::jsonb),
  ('postgresql_inspect', 'PostgreSQL Inspect', 'Collect PostgreSQL schema, extension and configuration facts for analysis.', 'postgresql', array['postgresql'], array['postgresql','inspect'], 'low', false, false, false, '{"entrypoint":"SKILL.md"}'::jsonb),
  ('postgresql_backup', 'PostgreSQL Backup', 'Prepare a local PostgreSQL backup artifact before risky operations.', 'postgresql', array['postgresql'], array['postgresql','backup'], 'medium', false, false, false, '{"entrypoint":"SKILL.md"}'::jsonb),
  ('postgresql_sandbox', 'PostgreSQL Sandbox', 'Create or describe a PostgreSQL sandbox target for migration rehearsal.', 'postgresql', array['postgresql'], array['postgresql','sandbox'], 'medium', false, false, false, '{"entrypoint":"SKILL.md"}'::jsonb),
  ('postgresql_query_explain', 'PostgreSQL Query Explain', 'Run or interpret query plans and identify expensive PostgreSQL patterns.', 'postgresql', array['postgresql'], array['postgresql','performance'], 'low', false, false, false, '{"entrypoint":"SKILL.md"}'::jsonb),
  ('production_guard', 'Production Guard', 'Block destructive or production-risk actions unless safeguards are present.', 'safety', array[]::text[], array['policy','production'], 'high', true, false, false, '{"entrypoint":"SKILL.md"}'::jsonb)
on conflict (id) do update set
  name = excluded.name,
  description = excluded.description,
  category = excluded.category,
  engines = excluded.engines,
  tags = excluded.tags,
  risk_level = excluded.risk_level,
  requires_approval = excluded.requires_approval,
  requires_backup = excluded.requires_backup,
  requires_sandbox = excluded.requires_sandbox,
  manifest = excluded.manifest,
  updated_at = now();
