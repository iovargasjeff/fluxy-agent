'use server'

import { db } from '../../db'
import { collaborators, diagramVersions, diagrams, users } from '../../db/schema'
import { and, eq, desc } from 'drizzle-orm'
import { createClient } from '../../supabase/server'

export async function listVersionsAction(projectId: string) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return { error: 'No autorizado' }
    }

    const [dbUser] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.authId, user.id))
      .limit(1)

    if (!dbUser) {
      return { error: 'Usuario no encontrado' }
    }

    const [diagram] = await db
      .select({ id: diagrams.id })
      .from(diagrams)
      .innerJoin(
        collaborators,
        and(
          eq(collaborators.projectId, diagrams.projectId),
          eq(collaborators.userId, dbUser.id)
        )
      )
      .where(eq(diagrams.projectId, projectId))
      .limit(1)

    if (!diagram) {
      return { error: 'Diagrama no encontrado para este proyecto' }
    }

    // Consultar el historial ordenado descendentemente
    const versionsList = await db
      .select({
        id: diagramVersions.id,
        versionNumber: diagramVersions.versionNumber,
        message: diagramVersions.message,
        userId: diagramVersions.userId,
        createdAt: diagramVersions.createdAt,
        authorName: users.name,
      })
      .from(diagramVersions)
      .leftJoin(users, eq(diagramVersions.userId, users.id))
      .where(eq(diagramVersions.diagramId, diagram.id))
      .orderBy(desc(diagramVersions.createdAt))

    return { data: versionsList }
  } catch (error) {
    console.error('Error listing versions:', error)
    return { error: 'Error interno al cargar el historial' }
  }
}
