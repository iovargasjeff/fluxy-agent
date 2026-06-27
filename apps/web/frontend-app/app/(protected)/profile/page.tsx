import { createClient } from '@/lib/backend/supabase/server'
import { db } from '@/lib/backend/db'
import { users } from '@/lib/backend/db/schema'
import { eq } from 'drizzle-orm'
import { ProfileForm } from '@/components/profile/ProfileForm'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function ProfilePage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const [dbUser] = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      avatarUrl: users.avatarUrl,
    })
    .from(users)
    .where(eq(users.authId, user.id))
    .limit(1)

  if (!dbUser) {
    redirect('/login')
  }

  return (
    <div className="min-h-screen flex bg-[#030712] relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-blue-900/20 blur-[120px]" />
        <div className="absolute top-[20%] -right-[10%] w-[40%] h-[40%] rounded-full bg-purple-900/10 blur-[120px]" />
      </div>

      <div className="flex-1 p-6 md:p-12 relative z-10">
        <div className="max-w-xl mx-auto">
          <div className="mb-8">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 text-sm font-medium text-gray-400 hover:text-white transition-colors bg-gray-900/50 hover:bg-gray-800 px-4 py-2 rounded-full border border-gray-800/60 shadow-sm backdrop-blur-md"
            >
              <ArrowLeft size={16} />
              Volver al Dashboard
            </Link>
          </div>

          <div className="mb-8">
            <h1 className="text-3xl font-extrabold text-white tracking-tight mb-2">
              Configuración de perfil
            </h1>
            <p className="text-base text-gray-400">
              Administra tu información personal y foto de perfil.
            </p>
          </div>

          <ProfileForm
            userId={dbUser.id}
            initialName={dbUser.name ?? ''}
            initialEmail={dbUser.email}
            initialAvatarUrl={dbUser.avatarUrl ?? null}
          />
        </div>
      </div>
    </div>
  )
}