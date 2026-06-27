'use server'

import { db } from '../../db'
import { diagrams, projects, collaborators, users } from '../../db/schema'
import { eq, and } from 'drizzle-orm'
import { createClient } from '../../supabase/server'
import { revalidatePath } from 'next/cache'
import type { FlowJson } from '@/lib/flow-types'
import { logActivity } from '../activity/logActivity'

export async function saveDiagramAction({
  projectId,
  sqlContent,
  flowJson,
  dialect,
}: {
  projectId: string
  sqlContent: string
  flowJson: FlowJson
  dialect: string
}) {
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
    .select({ id: projects.id, name: projects.name, isPublic: diagrams.isPublic, shareAccess: diagrams.shareAccess })
    .from(projects)
    .innerJoin(diagrams, eq(diagrams.projectId, projects.id))
    .innerJoin(
      collaborators,
      and(
        eq(collaborators.projectId, projects.id),
        eq(collaborators.userId, dbUser.id)
      )
    )
    .where(eq(projects.id, projectId))
    .limit(1)

  let canSaveViaShareLink = false
  if (!access) {
    const [sharedDiagram] = await db
      .select({ isPublic: diagrams.isPublic, shareAccess: diagrams.shareAccess })
      .from(diagrams)
      .where(eq(diagrams.projectId, projectId))
      .limit(1)
    canSaveViaShareLink = Boolean(sharedDiagram?.isPublic && sharedDiagram.shareAccess === 'edit')
  }

  if (!access && !canSaveViaShareLink) {
    return { error: 'Sin permisos para guardar' }
  }

  try {
    await db.update(diagrams)
      .set({ 
        sourceCode: sqlContent, 
        flowJson, 
        dialect, 
        updatedAt: new Date() 
      })
      .where(eq(diagrams.projectId, projectId))

    // Registrar actividad de guardar proyecto
    await logActivity(dbUser.id, 'project_saved', projectId, {
      projectName: access?.name || 'Proyecto sin nombre'
    })

    revalidatePath(`/editor/${projectId}`)
    return { success: true }
  } catch (error) {
    console.error('Error saving diagram:', error)
    return { error: 'Error interno al guardar' }
  }
}
