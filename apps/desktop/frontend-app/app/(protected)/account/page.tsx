'use client'

import { Cloud, Copy, ExternalLink, ShieldCheck } from 'lucide-react'
import { DashboardSidebar } from '@/components/dashboard/DashboardSidebar'
import { Button } from '@/components/ui/button'

export default function AccountPage() {
  const loginUrl = 'http://localhost:3000/login'

  function openLogin() {
    const popup = window.open(loginUrl, '_blank', 'noopener,noreferrer')
    if (!popup) {
      window.location.href = loginUrl
    }
  }

  function copyLoginUrl() {
    void navigator.clipboard?.writeText(loginUrl)
  }

  return (
    <div className="flex min-h-screen bg-white text-slate-950 dark:bg-[#0A0F1E] dark:text-white">
      <DashboardSidebar userName="Usuario Local" userAvatarUrl={null} />
      <main className="flex flex-1 items-center justify-center px-6 py-10">
        <section className="w-full max-w-3xl rounded-lg border border-slate-200 bg-white p-8 shadow-sm dark:border-[#1E2A45] dark:bg-[#111827]">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#1A6CF6] text-white">
              <Cloud className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold">Conectar cuenta Fluxy</h1>
              <p className="text-sm text-slate-500 dark:text-[#94A3B8]">Sincroniza proyectos, decisiones, memoria y trabajo en tiempo real.</p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-lg border border-slate-200 p-4 dark:border-[#1E2A45]">
              <h2 className="font-semibold">Que se sincroniza</h2>
              <ul className="mt-3 space-y-2 text-sm text-slate-600 dark:text-[#CBD5E1]">
                <li>Diagramas y versiones.</li>
                <li>Decisiones de esquema y approvals.</li>
                <li>Memoria segura y permisos de skills.</li>
                <li>Presencia y colaboracion en tiempo real.</li>
              </ul>
            </div>
            <div className="rounded-lg border border-slate-200 p-4 dark:border-[#1E2A45]">
              <h2 className="font-semibold">Que queda local</h2>
              <ul className="mt-3 space-y-2 text-sm text-slate-600 dark:text-[#CBD5E1]">
                <li>Credenciales de base de datos.</li>
                <li>Hosts reales y passwords.</li>
                <li>MCP Local y sidecar.</li>
                <li>Conexiones activas de esta maquina.</li>
              </ul>
            </div>
          </div>

          <div className="mt-6 rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm text-blue-900 dark:border-blue-500/20 dark:bg-blue-500/10 dark:text-blue-100">
            <ShieldCheck className="mr-2 inline h-4 w-4" />
            El login se realiza en Fluxy Web. Desktop conserva los secretos localmente y solo sincroniza metadata segura.
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <Button onClick={openLogin}>
              <ExternalLink className="mr-2 h-4 w-4" />
              Abrir Fluxy Web
            </Button>
            <Button variant="outline" onClick={copyLoginUrl}>
              <Copy className="mr-2 h-4 w-4" />
              Copiar URL
            </Button>
            <a className="inline-flex items-center text-sm font-medium text-[#1A6CF6] hover:underline" href={loginUrl} target="_blank" rel="noreferrer">
              {loginUrl}
            </a>
          </div>
        </section>
      </main>
    </div>
  )
}
