import { eq } from 'drizzle-orm'
import { AgentToolsShell } from '@/components/agent-tools/AgentToolsShell'
import { db } from '@/lib/backend/db'
import { users } from '@/lib/backend/db/schema'
import { createClient } from '@/lib/backend/supabase/server'

export const dynamic = 'force-dynamic'

export default async function AgentToolsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  let userName = user?.email ?? 'Usuario'
  let userAvatarUrl: string | null = null

  if (user) {
    const [dbUser] = await db
      .select({ name: users.name, avatarUrl: users.avatarUrl })
      .from(users)
      .where(eq(users.authId, user.id))
      .limit(1)
    if (dbUser?.name) userName = dbUser.name
    if (dbUser?.avatarUrl) userAvatarUrl = dbUser.avatarUrl
  }

  return <AgentToolsShell userName={userName} userEmail={user?.email} userAvatarUrl={userAvatarUrl} />
}
