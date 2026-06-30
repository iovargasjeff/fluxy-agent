import { eq } from 'drizzle-orm'
import { SkillStoreShell } from '@/components/skills/SkillStoreShell'
import { listSkillStore } from '@/lib/backend/actions/skills/list'
import { db } from '@/lib/backend/db'
import { users } from '@/lib/backend/db/schema'
import { createClient } from '@/lib/backend/supabase/server'

export const dynamic = 'force-dynamic'

export default async function SkillsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const skills = await listSkillStore()
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

  return <SkillStoreShell userName={userName} userEmail={user?.email} userAvatarUrl={userAvatarUrl} skills={skills} />
}
