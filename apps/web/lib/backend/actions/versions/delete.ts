'use server'

import { revalidatePath } from 'next/cache'
import { and, eq, inArray } from 'drizzle-orm'
import { db } from '../../db'
import { collaborators, diagramVersions, diagrams, projects, users } from '../../db/schema'
import { createClient } from '../../supabase/server'

export async function deleteVersionAction(versionId: string, projectId: string) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return { error: 'No autorizado' }
    }

    const [dbUser] = await db
      .select()
      .from(users)
      .where(eq(users.authId, user.id))
      .limit(1)

    if (!dbUser) {
      return { error: 'Usuario no encontrado' }
    }

    const [access] = await db
      .select({ id: projects.id })
      .from(projects)
      .innerJoin(
        collaborators,
        and(
          eq(collaborators.projectId, projects.id),
          eq(collaborators.userId, dbUser.id),
          inArray(collaborators.role, ['owner', 'editor'])
        )
      )
      .where(eq(projects.id, projectId))
      .limit(1)

    if (!access) {
      return { error: 'Sin permisos para eliminar versiones' }
    }

    const [version] = await db
      .select({
        id: diagramVersions.id,
        diagramId: diagramVersions.diagramId,
        versionNumber: diagramVersions.versionNumber,
      })
      .from(diagramVersions)
      .where(eq(diagramVersions.id, versionId))
      .limit(1)

    if (!version) {
      return { error: 'Version no encontrada' }
    }

    const [diagram] = await db
      .select({ id: diagrams.id })
      .from(diagrams)
      .where(and(eq(diagrams.id, version.diagramId), eq(diagrams.projectId, projectId)))
      .limit(1)

    if (!diagram) {
      return { error: 'La version no corresponde a este proyecto' }
    }

    await db
      .delete(diagramVersions)
      .where(eq(diagramVersions.id, versionId))

    revalidatePath(`/editor/${projectId}`)
    return { success: true, versionNumber: version.versionNumber }
  } catch (error) {
    console.error('Error deleting version:', error)
    return { error: 'Error interno al eliminar la version' }
  }
}
