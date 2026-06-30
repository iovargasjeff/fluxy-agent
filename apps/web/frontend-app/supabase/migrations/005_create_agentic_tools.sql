create table if not exists public.agent_memories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  project_id uuid references public.projects(id) on delete cascade,
  scope text not null default 'workspace',
  subject text not null,
  content text not null,
  tags text[] not null default array[]::text[],
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.skill_permissions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  skill_id text not null references public.skill_catalog(id) on delete cascade,
  environment text not null default 'development',
  can_read_schema boolean not null default true,
  can_generate_sql boolean not null default true,
  can_execute boolean not null default false,
  requires_approval boolean not null default true,
  updated_at timestamptz not null default now(),
  constraint skill_permissions_user_skill_env_unique unique (user_id, skill_id, environment)
);

create table if not exists public.approval_requests (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references public.projects(id) on delete cascade,
  title text not null,
  risk_level text not null default 'medium',
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  requested_by uuid references public.users(id) on delete set null,
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.agent_runs (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references public.projects(id) on delete cascade,
  user_id uuid references public.users(id) on delete set null,
  skill_id text,
  status text not null,
  input jsonb not null default '{}'::jsonb,
  output jsonb not null default '{}'::jsonb,
  rollback_plan text,
  created_at timestamptz not null default now()
);

create table if not exists public.schema_decisions (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references public.projects(id) on delete cascade,
  title text not null,
  decision text not null,
  rationale text,
  status text not null default 'accepted',
  created_by uuid references public.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.environment_guards (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  environment text not null,
  require_backup boolean not null default false,
  require_sandbox boolean not null default false,
  require_approval boolean not null default false,
  allow_direct_write boolean not null default true,
  updated_at timestamptz not null default now(),
  constraint environment_guards_user_env_unique unique (user_id, environment)
);

create index if not exists agent_memories_user_project_idx on public.agent_memories(user_id, project_id);
create index if not exists approval_requests_project_idx on public.approval_requests(project_id);
create index if not exists schema_decisions_project_idx on public.schema_decisions(project_id);
