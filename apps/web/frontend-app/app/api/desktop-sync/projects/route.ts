import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { and, eq, inArray, isNull } from 'drizzle-orm'
import { db } from '@/lib/backend/db'
import { collaborators, diagrams, projects, users } from '@/lib/backend/db/schema'

export async function GET(request: Request) {
  const auth = request.headers.get('authorization') ?? ''
  const token = auth.startsWith('Bearer ') ? auth.slice('Bearer '.length) : ''
  if (!token) {
    return NextResponse.json({ error: 'Missing bearer token.' }, { status: 401 })
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { global: { headers: { Authorization: `Bearer ${token}` } } },
  )
  const { data: { user }, error } = await supabase.auth.getUser(token)
  if (error || !user) {
    return NextResponse.json({ error: 'Invalid Fluxy Web session.' }, { status: 401 })
  }

  const [dbUser] = await db.select().from(users).where(eq(users.authId, user.id)).limit(1)
  if (!dbUser) return NextResponse.json({ projects: [] })

  const projectRows = await db
    .select({
      project: projects,
      role: collaborators.role,
    })
    .from(projects)
    .innerJoin(collaborators, eq(collaborators.projectId, projects.id))
    .where(and(eq(collaborators.userId, dbUser.id), isNull(projects.deleted_at)))

  const projectIds = projectRows.map((row) => row.project.id)
  const diagramRows = projectIds.length
    ? await db.select().from(diagrams).where(inArray(diagrams.projectId, projectIds))
    : []

  return NextResponse.json({
    user: { id: dbUser.id, email: dbUser.email, name: dbUser.name },
    projects: projectRows.map((row) => ({
      id: row.project.id,
      name: row.project.name,
      description: row.project.description,
      role: row.role,
      engineFamily: row.project.engineFamily,
      updatedAt: row.project.updatedAt,
      createdAt: row.project.createdAt,
      diagrams: diagramRows
        .filter((diagram) => diagram.projectId === row.project.id)
        .map((diagram) => ({
          id: diagram.id,
          name: diagram.name,
          sourceCode: diagram.sourceCode,
          dialect: diagram.dialect,
          flowJson: diagram.flowJson,
          updatedAt: diagram.updatedAt,
          createdAt: diagram.createdAt,
        })),
    })),
  })
}
