import { pgTable, uuid, text, timestamp, boolean, jsonb, check, unique, integer } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  authId: uuid('auth_id').unique(),
  email: text('email').unique().notNull(),
  name: text('name'),
  avatarUrl: text('avatar_url'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

export const projects = pgTable('projects', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  description: text('description'),
  ownerId: uuid('owner_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  tags: text('tags').array().default(sql`ARRAY[]::text[]`),
  engineFamily: text('engine_family').default('sql').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  deleted_at: timestamp('deleted_at', { withTimezone: true }),
});

export const collaborators = pgTable('collaborators', {
  id: uuid('id').primaryKey().defaultRandom(),
  projectId: uuid('project_id').notNull().references(() => projects.id, { onDelete: 'cascade' }),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  role: text('role').notNull(),
  joinedAt: timestamp('joined_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => {
  return [
    check('role_check', sql`${table.role} IN ('owner', 'editor', 'viewer')`),
    unique('collaborators_project_id_user_id_unique').on(table.projectId, table.userId)
  ];
});

export const diagrams = pgTable('diagrams', {
  id: uuid('id').primaryKey().defaultRandom(),
  projectId: uuid('project_id').notNull().references(() => projects.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  sourceCode: text('source_code'),
  dialect: text('dialect'),
  flowJson: jsonb('flow_json'),
  mermaidString: text('mermaid_string'),
  isPublic: boolean('is_public').default(false).notNull(),
  shareAccess: text('share_access').default('view').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export const diagramVersions = pgTable('diagram_versions', {
  id: uuid('id').primaryKey().defaultRandom(),
  diagramId: uuid('diagram_id').notNull().references(() => diagrams.id, { onDelete: 'cascade' }),
  versionNumber: integer('version_number').notNull(),
  flowJson: jsonb('flow_json').notNull(),
  sqlContent: text('sql_content').default(''),
  activeDialect: text('active_dialect').default('postgresql').notNull(),
  snapshots: jsonb('snapshots').$type<Record<string, string>>(),
  message: text('message').notNull(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

export const projectInvitations = pgTable('project_invitations', {
  id: uuid('id').primaryKey().defaultRandom(),
  projectId: uuid('project_id').notNull().references(() => projects.id, { onDelete: 'cascade' }),
  email: text('email').notNull(),
  role: text('role').default('editor').notNull(),
  invitedBy: uuid('invited_by').notNull().references(() => users.id, { onDelete: 'cascade' }),
  acceptedAt: timestamp('accepted_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => {
  return [
    check('project_invitations_role_check', sql`${table.role} IN ('editor', 'viewer')`),
    unique('project_invitations_project_id_email_unique').on(table.projectId, table.email)
  ];
});

export const skillCatalog = pgTable('skill_catalog', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description').default('').notNull(),
  version: text('version').default('1.0.0').notNull(),
  author: text('author').default('Fluxy').notNull(),
  license: text('license').default('free').notNull(),
  category: text('category').notNull(),
  engines: text('engines').array().default(sql`ARRAY[]::text[]`).notNull(),
  tags: text('tags').array().default(sql`ARRAY[]::text[]`).notNull(),
  minEngineVersion: text('min_engine_version'),
  maxEngineVersion: text('max_engine_version'),
  riskLevel: text('risk_level').default('low').notNull(),
  requiresApproval: boolean('requires_approval').default(false).notNull(),
  requiresBackup: boolean('requires_backup').default(false).notNull(),
  requiresSandbox: boolean('requires_sandbox').default(false).notNull(),
  defaultEnabled: boolean('default_enabled').default(true).notNull(),
  sourceUrl: text('source_url'),
  specVersion: text('spec_version').default('agent-skills-v1').notNull(),
  manifest: jsonb('manifest').$type<Record<string, unknown>>().default({}),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => {
  return [
    check('skill_catalog_risk_level_check', sql`${table.riskLevel} IN ('low', 'medium', 'high')`)
  ];
});

export const userSkills = pgTable('user_skills', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  skillId: text('skill_id').notNull().references(() => skillCatalog.id, { onDelete: 'cascade' }),
  installedVersion: text('installed_version').notNull(),
  enabled: boolean('enabled').default(true).notNull(),
  installSource: text('install_source').default('fluxy-catalog').notNull(),
  installedAt: timestamp('installed_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => {
  return [
    unique('user_skills_user_id_skill_id_unique').on(table.userId, table.skillId)
  ];
});

export const agentMemories = pgTable('agent_memories', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  projectId: uuid('project_id').references(() => projects.id, { onDelete: 'cascade' }),
  scope: text('scope').default('workspace').notNull(),
  subject: text('subject').notNull(),
  content: text('content').notNull(),
  tags: text('tags').array().default(sql`ARRAY[]::text[]`).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export const skillPermissions = pgTable('skill_permissions', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  skillId: text('skill_id').notNull().references(() => skillCatalog.id, { onDelete: 'cascade' }),
  environment: text('environment').default('development').notNull(),
  canReadSchema: boolean('can_read_schema').default(true).notNull(),
  canGenerateSql: boolean('can_generate_sql').default(true).notNull(),
  canExecute: boolean('can_execute').default(false).notNull(),
  requiresApproval: boolean('requires_approval').default(true).notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => {
  return [
    unique('skill_permissions_user_skill_env_unique').on(table.userId, table.skillId, table.environment)
  ];
});

export const approvalRequests = pgTable('approval_requests', {
  id: uuid('id').primaryKey().defaultRandom(),
  projectId: uuid('project_id').references(() => projects.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  riskLevel: text('risk_level').default('medium').notNull(),
  status: text('status').default('pending').notNull(),
  requestedBy: uuid('requested_by').references(() => users.id, { onDelete: 'set null' }),
  details: jsonb('details').$type<Record<string, unknown>>().default({}),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => {
  return [
    check('approval_requests_status_check', sql`${table.status} IN ('pending', 'approved', 'rejected')`)
  ];
});

export const agentRuns = pgTable('agent_runs', {
  id: uuid('id').primaryKey().defaultRandom(),
  projectId: uuid('project_id').references(() => projects.id, { onDelete: 'cascade' }),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'set null' }),
  skillId: text('skill_id'),
  status: text('status').notNull(),
  input: jsonb('input').$type<Record<string, unknown>>().default({}),
  output: jsonb('output').$type<Record<string, unknown>>().default({}),
  rollbackPlan: text('rollback_plan'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

export const schemaDecisions = pgTable('schema_decisions', {
  id: uuid('id').primaryKey().defaultRandom(),
  projectId: uuid('project_id').references(() => projects.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  decision: text('decision').notNull(),
  rationale: text('rationale'),
  status: text('status').default('accepted').notNull(),
  createdBy: uuid('created_by').references(() => users.id, { onDelete: 'set null' }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

export const environmentGuards = pgTable('environment_guards', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  environment: text('environment').notNull(),
  requireBackup: boolean('require_backup').default(false).notNull(),
  requireSandbox: boolean('require_sandbox').default(false).notNull(),
  requireApproval: boolean('require_approval').default(false).notNull(),
  allowDirectWrite: boolean('allow_direct_write').default(true).notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => {
  return [
    unique('environment_guards_user_env_unique').on(table.userId, table.environment)
  ];
});
