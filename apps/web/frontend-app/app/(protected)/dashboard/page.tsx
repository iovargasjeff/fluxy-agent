import { getProjectsByUser } from '@/lib/backend/actions/projects/list'
import { createClient } from '@/lib/backend/supabase/server'
import { db } from '@/lib/backend/db'
import { users } from '@/lib/backend/db/schema'
import { eq } from 'drizzle-orm'
import { DashboardPageContent } from '@/components/dashboard/DashboardPageContent'
import { Suspense } from 'react'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Fetch dbUser id for ownership comparison
  let dbUserId = ''
  let userName = user?.email ?? 'Usuario'
  let userAvatarUrl: string | null = null
  let currentUser: { id: string; name: string } | null = null
  if (user) {
    const [dbUser] = await db.select({ id: users.id, name: users.name, avatarUrl: users.avatarUrl }).from(users).where(eq(users.authId, user.id)).limit(1)
    dbUserId = dbUser?.id ?? ''
    if (dbUser?.name) userName = dbUser.name
    if (dbUser?.avatarUrl) userAvatarUrl = dbUser.avatarUrl
    if (dbUser) currentUser = { id: dbUser.id, name: dbUser.name ?? userName }
  }

  const projects = await getProjectsByUser()

  return (
    <div className="flex min-h-screen bg-white">
      <Suspense fallback={<div className="hidden lg:block w-[220px] flex-shrink-0" />}>
        <DashboardPageContent
          userName={userName}
          userEmail={user?.email}
          userAvatarUrl={userAvatarUrl}
          projects={projects}
          currentUserId={dbUserId}
          currentUser={currentUser}
        />
      </Suspense>
    </div>
  )
}
