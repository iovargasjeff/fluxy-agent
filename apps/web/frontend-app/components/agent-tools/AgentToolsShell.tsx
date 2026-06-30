'use client'

import { useState } from 'react'
import { Bot, Cloud, HardDrive, ShieldCheck } from 'lucide-react'
import { DashboardSidebar } from '@/components/dashboard/DashboardSidebar'
import { Badge } from '@/components/ui/badge'

const TOOLS = [
  { name: 'Memoria persistente', scope: 'Local + Cloud', status: 'Sincronizable', description: 'Recuerda decisiones por proyecto, motor, esquema y equipo.' },
  { name: 'Permisos por skill', scope: 'Local + Cloud', status: 'Sincronizable', description: 'Controla capacidades por usuario, equipo y entorno.' },
  { name: 'Approval inbox', scope: 'Local + Cloud', status: 'Equipo', description: 'Centraliza aprobaciones para cambios riesgosos.' },
  { name: 'Run history', scope: 'Local + Cloud', status: 'Auditoria', description: 'Historial de ejecuciones, artefactos y decisiones.' },
  { name: 'Team schema decisions', scope: 'Local + Cloud', status: 'Colaborativo', description: 'Registra acuerdos de diseño y discusiones de esquema.' },
  { name: 'Environment guard', scope: 'Local + Cloud', status: 'Politicas', description: 'Reglas distintas para dev, staging y production.' },
  { name: 'Secrets manager local', scope: 'Solo Local', status: 'Desktop', description: 'Las credenciales no se guardan ni sincronizan en web.' },
  { name: 'MCP Local Bridge', scope: 'Solo Local', status: 'Desktop', description: 'Disponible desde la app de escritorio para agentes externos.' },
]

interface AgentToolsShellProps {
  userName: string
  userEmail?: string
  userAvatarUrl?: string | null
}

export function AgentToolsShell({ userName, userEmail, userAvatarUrl }: AgentToolsShellProps) {
  const [activeSection, setActiveSection] = useState('agent-tools')

  return (
    <div className="flex min-h-screen bg-white">
      <DashboardSidebar userName={userName} userEmail={userEmail} userAvatarUrl={userAvatarUrl} activeSection={activeSection} onSectionChange={setActiveSection} />
      <main className="flex-1 overflow-auto bg-white text-slate-950">
        <div className="border-b border-slate-200 px-6 py-5">
          <div className="mx-auto flex max-w-6xl items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#1A6CF6] text-white">
              <Bot className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl font-semibold">Herramientas agenticas</h1>
              <p className="text-sm text-slate-500">Capacidades para memoria, aprobaciones, auditoria y colaboracion.</p>
            </div>
          </div>
        </div>
        <section className="mx-auto grid max-w-6xl gap-4 px-6 py-8 md:grid-cols-2 xl:grid-cols-3">
          {TOOLS.map((tool) => (
            <article key={tool.name} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-3 flex items-start justify-between gap-3">
                <h2 className="font-semibold">{tool.name}</h2>
                <Badge variant="outline">{tool.status}</Badge>
              </div>
              <p className="text-sm leading-6 text-slate-600">{tool.description}</p>
              <div className="mt-4 flex items-center gap-2 text-xs text-slate-500">
                {tool.scope === 'Solo Local' ? <HardDrive className="h-4 w-4" /> : <Cloud className="h-4 w-4" />}
                {tool.scope}
              </div>
            </article>
          ))}
        </section>
        <section className="mx-auto max-w-6xl px-6 pb-10">
          <div className="rounded-lg border border-blue-200 bg-blue-50 p-5 text-sm text-blue-900">
            <ShieldCheck className="mr-2 inline h-4 w-4" />
            En web se sincronizan proyectos, decisiones, permisos y presencia. Conexiones, secretos y MCP quedan en desktop.
          </div>
        </section>
      </main>
    </div>
  )
}
