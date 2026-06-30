create table if not exists "skill_catalog" (
  "id" text primary key,
  "name" text not null,
  "description" text not null default '',
  "version" text not null default '1.0.0',
  "author" text not null default 'Fluxy',
  "license" text not null default 'free',
  "category" text not null,
  "engines" text[] not null default array[]::text[],
  "tags" text[] not null default array[]::text[],
  "min_engine_version" text,
  "max_engine_version" text,
  "risk_level" text not null default 'low',
  "requires_approval" boolean not null default false,
  "requires_backup" boolean not null default false,
  "requires_sandbox" boolean not null default false,
  "default_enabled" boolean not null default true,
  "source_url" text,
  "spec_version" text not null default 'agent-skills-v1',
  "manifest" jsonb not null default '{}'::jsonb,
  "created_at" timestamptz not null default now(),
  "updated_at" timestamptz not null default now(),
  constraint "skill_catalog_risk_level_check" check ("risk_level" in ('low', 'medium', 'high'))
);

create table if not exists "user_skills" (
  "id" uuid primary key default gen_random_uuid(),
  "user_id" uuid not null references "users"("id") on delete cascade,
  "skill_id" text not null references "skill_catalog"("id") on delete cascade,
  "installed_version" text not null,
  "enabled" boolean not null default true,
  "install_source" text not null default 'fluxy-catalog',
  "installed_at" timestamptz not null default now(),
  "updated_at" timestamptz not null default now(),
  constraint "user_skills_user_id_skill_id_unique" unique ("user_id", "skill_id")
);
