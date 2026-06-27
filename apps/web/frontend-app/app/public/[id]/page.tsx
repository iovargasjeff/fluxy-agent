import { notFound, redirect } from 'next/navigation'
import { PublicDiagramView } from '@/components/public/PublicDiagramView'
import { EditorLayout } from '@/components/editor/EditorLayout'
import { db } from '@/lib/backend/db'
import { collaborators, diagrams, projects, users } from '@/lib/backend/db/schema'
import { and, eq } from 'drizzle-orm'
import { toFlowJson } from '@/lib/flow-types'
import { createClient } from '@/lib/backend/supabase/server'
import { addViewerToProject } from '@/lib/backend/actions/projects/addViewer'

export const dynamic = 'force-dynamic'

interface PublicPageProps {
  params: Promise<{ id: string }>
}

export default async function PublicPage({ params }: PublicPageProps) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect(`/login?next=/public/${id}`)
  }

  let [dbUser] = await db
    .select({ id: users.id, name: users.name, email: users.email })
    .from(users)
    .where(eq(users.authId, user.id))
    .limit(1)

  if (!dbUser) {
    const fallbackEmail = user.email ?? `${user.id}@shared.local`
    const fallbackName = user.user_metadata?.name ?? fallbackEmail.split('@')[0]
    const [createdUser] = await db
      .insert(users)
      .values({ authId: user.id, email: fallbackEmail, name: fallbackName })
      .returning({ id: users.id, name: users.name, email: users.email })

    dbUser = createdUser
  }

  const [diagram] = await db
    .select({
      id: diagrams.id,
      name: diagrams.name,
      projectId: diagrams.projectId,
      sourceCode: diagrams.sourceCode,
      dialect: diagrams.dialect,
      flowJson: diagrams.flowJson,
      isPublic: diagrams.isPublic,
      shareAccess: diagrams.shareAccess,
      projectName: projects.name,
      projectOwnerId: projects.ownerId,
      engineFamily: projects.engineFamily,
    })
    .from(diagrams)
    .innerJoin(projects, eq(projects.id, diagrams.projectId))
    .where(and(eq(diagrams.projectId, id), eq(diagrams.isPublic, true)))
    .limit(1)

  if (!diagram) notFound()

  // Registrar al usuario autenticado como viewer si no es el owner
  if (diagram.projectOwnerId !== dbUser.id) {
    await addViewerToProject(id, dbUser.id)
  }

  const [membership] = await db
    .select({ role: collaborators.role })
    .from(collaborators)
    .where(and(eq(collaborators.projectId, id), eq(collaborators.userId, dbUser.id)))
    .limit(1)

  const flow = toFlowJson(diagram.flowJson)
  const currentUser = { id: dbUser.id, name: dbUser.name ?? dbUser.email }

  if (diagram.shareAccess === 'edit' || membership?.role === 'owner' || membership?.role === 'editor') {
    return (
      <EditorLayout
        projectName={diagram.projectName}
        projectId={id}
        initialSQL={diagram.sourceCode ?? ''}
        initialNodes={flow.nodes ?? []}
        initialEdges={flow.edges ?? []}
        dialect={diagram.dialect ?? 'postgresql'}
        engineFamily={(diagram.engineFamily as 'sql' | 'nosql') ?? 'sql'}
        currentUser={currentUser}
        initialIsPublic={diagram.isPublic}
        initialShareAccess={diagram.shareAccess as 'view' | 'edit'}
      />
    )
  }

  return (
    <div className="flex h-screen w-full flex-col bg-[#0A0F1E] text-white">
      <header className="flex h-12 shrink-0 items-center border-b border-[#1E2A45] bg-[#111827] px-4">
        <h1 className="font-semibold text-[#E2E8F0]">{diagram.name}</h1>
        <span className="ml-4 rounded border border-[#334155] bg-[#1E2A45] px-2 py-0.5 text-xs text-[#94A3B8]">
          Solo lectura · sesión requerida
        </span>
      </header>

      <main className="relative min-h-0 flex-1">
        <PublicDiagramView flowJson={flow} />
      </main>
    </div>
  )
}
