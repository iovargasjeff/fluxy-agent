import { db } from '../../db'
import { projects, collaborators, users } from '../../db/schema'
import { eq, desc, isNull, and, ne, isNotNull } from 'drizzle-orm'
import { createClient } from '../../supabase/server'

import { sql } from 'drizzle-orm'

export async function getProjectsByUser() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const [dbUser] = await db.select().from(users).where(eq(users.authId, user.id)).limit(1)
  if (!dbUser) return []

  try {
    // Intentar query con deleted_at (cuando la migración ya se ejecutó)
    const userProjects = await db
      .select({
        project: {
          id: projects.id,
          name: projects.name,
          description: projects.description,
          ownerId: projects.ownerId,
          tags: projects.tags,
          engineFamily: projects.engineFamily,
          createdAt: projects.createdAt,
          updatedAt: projects.updatedAt,
          deleted_at: projects.deleted_at,
        },
        role: collaborators.role,
        members: sql<{id: string, name: string}[]>`(
          SELECT json_agg(json_build_object('id', u.id, 'name', u.name))
          FROM ${collaborators} c
          JOIN ${users} u ON u.id = c.user_id
          WHERE c.project_id = ${projects.id}
        )`
      })
      .from(projects)
      .innerJoin(collaborators, eq(collaborators.projectId, projects.id))
      .where(and(
        eq(collaborators.userId, dbUser.id),
        isNull(projects.deleted_at)
      ))
      .orderBy(desc(projects.updatedAt))

    return userProjects
  } catch (error) {
    // Fallback: query sin deleted_at (cuando la migración no se ha ejecutado)
    console.error('getProjectsByUser fallback (deleted_at column may not exist):', error)
    
    const userProjects = await db
      .select({
        project: {
          id: projects.id,
          name: projects.name,
          description: projects.description,
          ownerId: projects.ownerId,
          tags: projects.tags,
          engineFamily: projects.engineFamily,
          createdAt: projects.createdAt,
          updatedAt: projects.updatedAt,
        },
        role: collaborators.role,
        members: sql<{id: string, name: string}[]>`(
          SELECT json_agg(json_build_object('id', u.id, 'name', u.name))
          FROM ${collaborators} c
          JOIN ${users} u ON u.id = c.user_id
          WHERE c.project_id = ${projects.id}
        )`
      })
      .from(projects)
      .innerJoin(collaborators, eq(collaborators.projectId, projects.id))
      .where(eq(collaborators.userId, dbUser.id))
      .orderBy(desc(projects.updatedAt))

    return userProjects
  }
}

export async function getSharedProjects(userId: string) {
  const sharedProjects = await db
    .select({
      project: {
        id: projects.id,
        name: projects.name,
        description: projects.description,
        ownerId: projects.ownerId,
        tags: projects.tags,
        engineFamily: projects.engineFamily,
        createdAt: projects.createdAt,
        updatedAt: projects.updatedAt,
        deleted_at: projects.deleted_at,
      },
      role: collaborators.role,
      members: sql<{id: string, name: string}[]>`(
        SELECT json_agg(json_build_object('id', u.id, 'name', u.name))
        FROM ${collaborators} c
        JOIN ${users} u ON u.id = c.user_id
        WHERE c.project_id = ${projects.id}
      )`
    })
    .from(projects)
    .innerJoin(collaborators, eq(collaborators.projectId, projects.id))
    .where(and(
      eq(collaborators.userId, userId),
      ne(collaborators.role, 'owner'),
      isNull(projects.deleted_at)
    ))
    .orderBy(desc(projects.updatedAt))

  return sharedProjects
}

export async function getDeletedProjects(userId: string) {
  try {
    const [dbUser] = await db.select().from(users).where(eq(users.id, userId)).limit(1)
    if (!dbUser) return []

    const deletedProjects = await db
      .select({
        project: {
          id: projects.id,
          name: projects.name,
          description: projects.description,
          ownerId: projects.ownerId,
          tags: projects.tags,
          engineFamily: projects.engineFamily,
          createdAt: projects.createdAt,
          updatedAt: projects.updatedAt,
          deleted_at: projects.deleted_at,
        },
        role: collaborators.role,
        members: sql<{id: string, name: string}[]>`(
          SELECT json_agg(json_build_object('id', u.id, 'name', u.name))
          FROM ${collaborators} c
          JOIN ${users} u ON u.id = c.user_id
          WHERE c.project_id = ${projects.id}
        )`
      })
      .from(projects)
      .innerJoin(collaborators, eq(collaborators.projectId, projects.id))
      .where(and(
        eq(collaborators.userId, dbUser.id),
        eq(collaborators.role, 'owner'),
        isNotNull(projects.deleted_at)
      ))
      .orderBy(desc(projects.deleted_at))

    return deletedProjects
  } catch (error) {
    // Si deleted_at no existe aún en BD, retornar array vacío
    console.error('getDeletedProjects error (deleted_at may not exist):', error)
    return []
  }
}
