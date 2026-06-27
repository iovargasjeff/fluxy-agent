'use server'

import { db } from '../../db'
import { diagramVersions, diagrams, projects, collaborators, users } from '../../db/schema'
import { eq, and, inArray } from 'drizzle-orm'
import { createClient } from '../../supabase/server'
import { revalidatePath } from 'next/cache'

export async function restoreVersionAction(versionId: string, projectId: string) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return { error: 'No autorizado' }
    }

    // Get the db user
    const [dbUser] = await db
      .select()
      .from(users)
      .where(eq(users.authId, user.id))
      .limit(1)

    if (!dbUser) {
      return { error: 'Usuario no encontrado' }
    }

    // Check project access (owner or editor)
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
      return { error: 'Sin permisos para restaurar versiones' }
    }

    // Find the version
    const [version] = await db
      .select()
      .from(diagramVersions)
      .where(eq(diagramVersions.id, versionId))
      .limit(1)

    if (!version) {
      return { error: 'Versión no encontrada' }
    }

    // Check that the version actually belongs to the given projectId via diagrams table
    const [diagram] = await db
      .select({ id: diagrams.id })
      .from(diagrams)
      .where(and(eq(diagrams.id, version.diagramId), eq(diagrams.projectId, projectId)))
      .limit(1)

    if (!diagram) {
      return { error: 'La versión no corresponde a este proyecto' }
    }

    // Update diagram with the old flowJson and sqlContent
    await db.update(diagrams)
      .set({ 
        flowJson: version.flowJson, 
        sourceCode: version.sqlContent, 
        dialect: version.activeDialect ?? 'postgresql',
        updatedAt: new Date() 
      })
      .where(eq(diagrams.id, version.diagramId))

    revalidatePath(`/editor/${projectId}`)

    return { 
      success: true, 
      flowJson: version.flowJson, 
      sqlContent: version.sqlContent, 
      dialect: version.activeDialect ?? 'postgresql',
      versionNumber: version.versionNumber 
    }
  } catch (error) {
    console.error('Error restoring version:', error)
    return { error: 'Error interno al restaurar la versión' }
  }
}
