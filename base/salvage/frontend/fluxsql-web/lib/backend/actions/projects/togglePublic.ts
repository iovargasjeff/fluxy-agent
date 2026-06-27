'use server'

import { db } from '../../db'
import { diagrams, projects } from '../../db/schema'
import { eq } from 'drizzle-orm'
import { createClient } from '../../supabase/server'
import { revalidatePath } from 'next/cache'

export async function togglePublicAction(projectId: string, isPublic: boolean, shareAccess: 'view' | 'edit' = 'view') {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return { error: 'No autorizado' }
    }

    // Buscar el diagrama junto con su proyecto para validar el owner
    const [diagramWithProject] = await db
      .select({ ownerId: projects.ownerId, diagramId: diagrams.id })
      .from(diagrams)
      .innerJoin(projects, eq(diagrams.projectId, projects.id))
      .where(eq(diagrams.projectId, projectId))
      .limit(1)

    if (!diagramWithProject) {
      return { error: 'Diagrama no encontrado' }
    }

    // Validar si el usuario activo tiene permiso en la tabla users
    const { users } = await import('../../db/schema')
    const [dbUser] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.authId, user.id))
      .limit(1)

    if (!dbUser || diagramWithProject.ownerId !== dbUser.id) {
      return { error: 'No tienes permisos para modificar el acceso público' }
    }

    await db.update(diagrams)
      .set({ isPublic, shareAccess, updatedAt: new Date() })
      .where(eq(diagrams.projectId, projectId))

    revalidatePath(`/public/${projectId}`)
    
    return { success: true, publicUrl: `/public/${projectId}` }
  } catch (error) {
    console.error('Error toggling public state:', error)
    return { error: 'Error interno al actualizar la privacidad' }
  }
}
