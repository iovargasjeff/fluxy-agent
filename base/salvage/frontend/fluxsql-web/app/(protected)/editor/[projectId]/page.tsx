import { db } from '@/lib/backend/db'
import { projects, collaborators, users } from '@/lib/backend/db/schema'
import { eq, and } from 'drizzle-orm'
import { createClient } from '@/lib/backend/supabase/server'
import { redirect } from 'next/navigation'
import { EditorLayout } from '@/components/editor/EditorLayout'
import { loadDiagramAction } from '@/lib/backend/actions/diagrams/load'
import { toFlowJson } from '@/lib/flow-types'
import { logActivity } from '@/lib/backend/actions/activity/logActivity'

export const dynamic = 'force-dynamic'

interface EditorPageProps {
  params: Promise<{ projectId: string }>
}

export default async function EditorPage({ params }: EditorPageProps) {
  const { projectId } = await params

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()


  if (!user) {
    redirect('/login')
  }

  // Get the db user
  const [dbUser] = await db
    .select()
    .from(users)
    .where(eq(users.authId, user.id))
    .limit(1)

  if (!dbUser) {
    redirect('/dashboard')
  }

  // Get full name from profiles if exists (as per issue 20, though dbUser.name could work too, the instructions strictly say from profiles if possible or use full_name)
  const { data: profile } = await supabase.from('profiles').select('full_name').eq('id', user.id).single()
  const currentUserName = profile?.full_name ?? dbUser.name ?? user.email ?? 'Anónimo'
  const currentUser = { id: dbUser.id, name: currentUserName }

  // Verify the user has access to this project via collaborators
  const [access] = await db
    .select({ project: projects })
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
    redirect('/dashboard')
  }

  // Load Diagram
  const { error, data: diagramData } = await loadDiagramAction(projectId)
  if (error || !diagramData) {
    redirect('/dashboard')
  }

  // Registrar actividad de abrir proyecto
  await logActivity(dbUser.id, 'project_opened', projectId, {
    projectName: access.project.name
  })

  const savedFlow = toFlowJson(diagramData.flowJson)
  const initialNodes = savedFlow.nodes ?? []
  const initialEdges = savedFlow.edges ?? []

  return (
    <EditorLayout
      projectName={access.project.name}
      projectId={projectId}
      initialSQL={diagramData.sourceCode ?? ''}
      initialNodes={initialNodes}
      initialEdges={initialEdges}
      dialect={diagramData.dialect ?? 'postgresql'}
      engineFamily={(access.project.engineFamily as 'sql' | 'nosql') ?? 'sql'}
      currentUser={currentUser}
      initialIsPublic={diagramData.isPublic ?? false}
      initialShareAccess={(diagramData.shareAccess as 'view' | 'edit') ?? 'view'}
    />
  )
}
