'use server'

import { db } from '../../db'
import { diagrams, projects, collaborators, users } from '../../db/schema'
import { eq, and } from 'drizzle-orm'
import { createClient } from '../../supabase/server'

export async function loadDiagramAction(projectId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'No autorizado', data: null }
  }

  // Get the db user
  const [dbUser] = await db
    .select()
    .from(users)
    .where(eq(users.authId, user.id))
    .limit(1)

  if (!dbUser) {
    return { error: 'Usuario no encontrado', data: null }
  }

  // Check project access
  const [access] = await db
    .select({ id: projects.id, engineFamily: projects.engineFamily })
    .from(projects)
    .innerJoin(
      collaborators,
      and(
        eq(collaborators.projectId, projects.id),
        eq(collaborators.userId, dbUser.id)
      )
    )
    .where(eq(projects.id, projectId))
    .limit(1)

  if (!access) {
    return { error: 'Sin permisos', data: null }
  }

  // Find diagram
  const [diagram] = await db
    .select()
    .from(diagrams)
    .where(eq(diagrams.projectId, projectId))
    .limit(1)

  if (!diagram) {
    // Use engineFamily from project to determine default dialect
    const defaultDialect = access.engineFamily === 'nosql' ? 'mongodb' : 'postgresql'
    
    try {
      const [newDiagram] = await db.insert(diagrams).values({
        projectId: projectId,
        name: 'Main Diagram',
        sourceCode: '',
        dialect: defaultDialect,
        flowJson: { nodes: [], edges: [], viewport: { x: 0, y: 0, zoom: 1 } },
        mermaidString: '',
        isPublic: false,
        shareAccess: 'view',
      }).returning()
      
      return { error: null, data: newDiagram }
    } catch (e) {
      console.error('Error creating diagram:', e)
      return { error: 'Error al crear diagrama base', data: null }
    }
  }

  return { error: null, data: diagram }
}

