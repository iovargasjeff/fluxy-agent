'use client'

import { useState } from 'react'
import { CheckCircle2, KeyRound, Loader2, ShieldCheck } from 'lucide-react'

interface DesktopLinkClientProps {
  deviceCode: string
  sidecarUrl: string
  userEmail: string
  accessToken: string
}

export function DesktopLinkClient({ deviceCode, sidecarUrl, userEmail, accessToken }: DesktopLinkClientProps) {
  const [pending, setPending] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function approve() {
    setPending(true)
    setError(null)
    setMessage(null)
    try {
      const response = await fetch(`${sidecarUrl}/api/v1/sync/device/complete`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          device_code: deviceCode,
          user_email: userEmail,
          access_token: accessToken,
        }),
      })
      if (!response.ok) {
        const body = await response.json().catch(() => ({}))
        throw new Error(body.detail || 'No se pudo autorizar este Desktop.')
      }
      setMessage('Desktop enlazado con tu cuenta Fluxy. Vuelve a Desktop y presiona Verificar.')
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'No se pudo autorizar este Desktop.')
    } finally {
      setPending(false)
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-6 text-slate-950">
      <section className="w-full max-w-lg rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-[#1A6CF6] text-white">
            <KeyRound className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-semibold">Autorizar Fluxy Desktop</h1>
            <p className="text-sm text-slate-500">Conecta este escritorio con tu cuenta Fluxy Web.</p>
          </div>
        </div>

        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm leading-6 text-blue-900">
          <ShieldCheck className="mr-2 inline h-4 w-4" />
          Autorizaras este Desktop para sincronizar diagramas, versiones, decisiones, approvals, memoria segura y permisos de skills. Las credenciales de bases de datos no se suben a Web.
        </div>

        <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-4">
          <p className="text-xs uppercase tracking-wide text-slate-500">Cuenta activa</p>
          <p className="mt-1 font-medium">{userEmail}</p>
        </div>

        {message && (
          <div className="mt-4 flex items-start gap-2 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">
            <CheckCircle2 className="h-5 w-5 flex-shrink-0" />
            <span>{message}</span>
          </div>
        )}
        {error && <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}

        <button
          type="button"
          onClick={approve}
          disabled={pending || !deviceCode || !accessToken}
          className="mt-5 flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-[#1A6CF6] font-medium text-white hover:bg-[#1559d1] disabled:opacity-60"
        >
          {pending && <Loader2 className="h-4 w-4 animate-spin" />}
          Autorizar este Desktop
        </button>
      </section>
    </main>
  )
}
