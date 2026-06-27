"use server"

import { db } from '../../db'
import { collaborators, projects } from '../../db/schema'
import { eq } from 'drizzle-orm'

export async function addViewerToProject(projectId: string, userId: string): Promise<{ success: boolean, error?: string }> {
  try {
    // Verificar que el proyecto existe
    const [project] = await db
      .select({ ownerId: projects.ownerId })
      .from(projects)
      .where(eq(projects.id, projectId))
      .limit(1)

    if (!project) {
      return { success: false, error: 'Proyecto no encontrado' }
    }

    // El owner no se agrega a sí mismo como viewer
    if (project.ownerId === userId) {
      return { success: true }
    }

    // Insertar como viewer con ON CONFLICT DO NOTHING
    await db
      .insert(collaborators)
      .values({
        projectId,
        userId,
        role: 'viewer'
      })
      .onConflictDoNothing({
        target: [collaborators.projectId, collaborators.userId]
      })

    return { success: true }
  } catch (error) {
    console.error('Error al agregar viewer al proyecto:', error)
    return { success: false, error: 'Error interno del servidor' }
  }
}
