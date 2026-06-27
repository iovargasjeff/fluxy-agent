'use server'

import { db } from '../../db'
import { collaborators, diagramVersions, diagrams, users } from '../../db/schema'
import { and, eq } from 'drizzle-orm'
import { createClient } from '../../supabase/server'
import type { EditorDialect } from '@/lib/editor-schema'
import { toFlowJson } from '@/lib/flow-types'
import { hasVersionSnapshots, serializeVersionSnapshots } from '@/lib/version-snapshots'

export async function getVersionDetailAction(versionId: string, projectId?: string) {
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

    const query = db
      .select({
        sqlContent: diagramVersions.sqlContent,
        flowJson: diagramVersions.flowJson,
        activeDialect: diagramVersions.activeDialect,
        snapshots: diagramVersions.snapshots,
        versionNumber: diagramVersions.versionNumber,
      })
      .from(diagramVersions)
      .innerJoin(diagrams, eq(diagrams.id, diagramVersions.diagramId))
      .innerJoin(
        collaborators,
        and(
          eq(collaborators.projectId, diagrams.projectId),
          eq(collaborators.userId, dbUser.id)
        )
      )
      .where(projectId
        ? and(eq(diagramVersions.id, versionId), eq(diagrams.projectId, projectId))
        : eq(diagramVersions.id, versionId)
      )
      .limit(1)

    const [version] = await query

    if (!version) {
      return { error: 'Version no encontrada' }
    }

    const flow = toFlowJson(version.flowJson)
    const snapshots = hasVersionSnapshots(version.snapshots)
      ? version.snapshots
      : serializeVersionSnapshots(flow.nodes, flow.edges)

    return {
      data: {
        ...version,
        activeDialect: (version.activeDialect ?? 'postgresql') as EditorDialect,
        snapshots: {
          ...snapshots,
          postgresql: snapshots.postgresql || version.sqlContent || '',
        },
      },
    }
  } catch (error) {
    console.error('Error fetching version detail:', error)
    return { error: 'Error interno al cargar la version' }
  }
}
