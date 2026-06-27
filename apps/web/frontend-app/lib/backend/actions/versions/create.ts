'use server'

import { db } from '../../db'
import { collaborators, diagramVersions, diagrams, projects, users } from '../../db/schema'
import { and, eq, inArray } from 'drizzle-orm'
import { sql } from 'drizzle-orm'
import { createClient } from '../../supabase/server'
import { revalidatePath } from 'next/cache'
import type { FlowJson } from '@/lib/flow-types'
import type { EditorDialect } from '@/lib/editor-schema'
import { hasVersionSnapshots, serializeVersionSnapshots, type VersionSnapshots } from '@/lib/version-snapshots'

export async function createVersionAction(
  projectId: string, 
  flowJson: FlowJson, 
  sqlContent: string, 
  message: string,
  activeDialect: EditorDialect = 'postgresql',
  snapshots?: VersionSnapshots
) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return { error: 'No autorizado' }
    }

    if (!message || message.trim() === '') {
      return { error: 'El mensaje del commit es requerido' }
    }

    const [dbUser] = await db
      .select()
      .from(users)
      .where(eq(users.authId, user.id))
      .limit(1)

    if (!dbUser) {
      return { error: 'Usuario no encontrado en la base de datos local' }
    }

    // Get the diagramId for this project
    const [diagram] = await db
      .select({ id: diagrams.id })
      .from(diagrams)
      .innerJoin(projects, eq(projects.id, diagrams.projectId))
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

    if (!diagram) {
      return { error: 'Sin permisos para crear commits en este proyecto' }
    }

    const diagramId = diagram.id

    // Obtener MAX(versionNumber)
    const result = await db
      .select({ max: sql<number>`MAX(${diagramVersions.versionNumber})` })
      .from(diagramVersions)
      .where(eq(diagramVersions.diagramId, diagramId))

    const nextVersion = (result[0]?.max ?? 0) + 1
    const versionSnapshots = hasVersionSnapshots(snapshots)
      ? snapshots
      : serializeVersionSnapshots(flowJson.nodes, flowJson.edges)

    await db.insert(diagramVersions).values({
      diagramId,
      versionNumber: nextVersion,
      flowJson,
      sqlContent,
      activeDialect,
      snapshots: versionSnapshots,
      message: message.trim(),
      userId: dbUser.id
    })

    revalidatePath(`/editor/${diagramId}`)
    return { success: true, versionNumber: nextVersion }
  } catch (error) {
    console.error('Error creating version:', error)
    return { error: 'Error al crear la versión' }
  }
}
