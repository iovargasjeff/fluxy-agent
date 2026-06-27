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
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
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
  snapshots: jsonb('snapshots').$type<{
    postgresql: string
    mysql: string
    sqlserver: string
    json: string
  }>(),
  message: text('message').notNull(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});
