import { redirect } from 'next/navigation'
import { createClient } from '@/lib/backend/supabase/server'
import { DesktopLinkClient } from './DesktopLinkClient'

interface DesktopLinkPageProps {
  searchParams: Promise<{
    device_code?: string
    sidecar_url?: string
  }>
}

export default async function DesktopLinkPage({ searchParams }: DesktopLinkPageProps) {
  const params = await searchParams
  const deviceCode = params.device_code ?? ''
  const sidecarUrl = params.sidecar_url ?? 'http://127.0.0.1:8000'

  if (!deviceCode) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 px-6 text-slate-950">
        <section className="w-full max-w-lg rounded-lg border border-red-200 bg-white p-6 text-sm text-red-700 shadow-sm">
          Falta la solicitud de enlace. Vuelve a Fluxy Desktop y genera un nuevo codigo.
        </section>
      </main>
    )
  }

  const supabase = await createClient()
  const [{ data: userData }, { data: sessionData }] = await Promise.all([
    supabase.auth.getUser(),
    supabase.auth.getSession(),
  ])
  const user = userData.user
  const session = sessionData.session

  if (!user || !session?.access_token) {
    const next = `/desktop-link?device_code=${encodeURIComponent(deviceCode)}&sidecar_url=${encodeURIComponent(sidecarUrl)}`
    redirect(`/login?next=${encodeURIComponent(next)}`)
  }

  return (
    <DesktopLinkClient
      deviceCode={deviceCode}
      sidecarUrl={sidecarUrl}
      userEmail={user.email ?? 'cuenta Fluxy'}
      accessToken={session.access_token}
    />
  )
}
