'use client'

import { useEffect, useState, useTransition } from 'react'
import { Download, Power, ShieldCheck, Store, Wrench } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { DashboardSidebar } from '@/components/dashboard/DashboardSidebar'
import { skillsAPI, type SkillStoreItem } from '@/lib/api/client'

const riskTone: Record<string, string> = {
  low: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30',
  medium: 'bg-amber-500/10 text-amber-300 border-amber-500/30',
  high: 'bg-rose-500/10 text-rose-300 border-rose-500/30',
}

export default function DesktopSkillsPage() {
  const [skills, setSkills] = useState<SkillStoreItem[]>([])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [pending, startTransition] = useTransition()

  async function loadSkills() {
    setLoading(true)
    setError(null)
    try {
      setSkills(await skillsAPI.list())
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'No se pudo cargar la tienda de skills.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadSkills()
    }, 0)
    return () => window.clearTimeout(timer)
  }, [])

  const install = (skillId: string) => {
    startTransition(async () => {
      await skillsAPI.install(skillId)
      await loadSkills()
    })
  }

  const toggle = (skillId: string, enabled: boolean) => {
    startTransition(async () => {
      await skillsAPI.setEnabled(skillId, enabled)
      await loadSkills()
    })
  }

  return (
    <div className="flex min-h-screen bg-[#0A0F1E] text-white">
      <DashboardSidebar userName="Usuario Local" userAvatarUrl={null} />
      <main className="flex-1">
        <div className="border-b border-[#1E2A45] bg-[#111827]">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#1A6CF6] text-white">
                <Store className="h-5 w-5" />
              </div>
              <div>
                <h1 className="text-xl font-semibold">Skill Store</h1>
                <p className="text-sm text-[#94A3B8]">Instala skills locales para agentes especializados en bases de datos.</p>
              </div>
            </div>
            <Badge variant="outline" className="hidden border-[#1E2A45] text-[#94A3B8] sm:inline-flex">Agent Skills v1</Badge>
          </div>
        </div>

        <div className="mx-auto max-w-6xl px-6 py-8">
          {loading && <p className="text-sm text-[#94A3B8]">Cargando skills...</p>}
          {error && (
            <div className="rounded-lg border border-rose-500/30 bg-rose-500/10 p-4 text-sm text-rose-200">
              {error}
            </div>
          )}
          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {skills.map((skill) => (
              <article key={skill.id} className="flex min-h-[260px] flex-col rounded-lg border border-[#1E2A45] bg-[#111827] p-5 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="text-base font-semibold text-white">{skill.name}</h2>
                    <p className="mt-1 text-xs text-[#94A3B8]">{skill.category} · v{skill.version}</p>
                  </div>
                  <span className={`rounded-full border px-2.5 py-1 text-xs font-medium ${riskTone[skill.risk_level] ?? riskTone.low}`}>
                    {skill.risk_level}
                  </span>
                </div>

                <p className="mt-4 flex-1 text-sm leading-6 text-[#CBD5E1]">{skill.description}</p>

                <div className="mt-4 flex flex-wrap gap-2">
                  {(skill.engines.length ? skill.engines : ['multi-engine']).map((engine) => (
                    <Badge key={engine} variant="secondary" className="rounded-md bg-[#1E2A45] text-[#CBD5E1]">{engine}</Badge>
                  ))}
                </div>

                {(skill.requires_approval || skill.requires_backup || skill.requires_sandbox) && (
                  <div className="mt-4 flex items-center gap-2 text-xs text-[#94A3B8]">
                    <ShieldCheck className="h-4 w-4 text-[#1A6CF6]" />
                    Requiere guardas: {[skill.requires_approval && 'aprobacion', skill.requires_backup && 'backup', skill.requires_sandbox && 'sandbox'].filter(Boolean).join(', ')}
                  </div>
                )}

                <div className="mt-5 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 text-xs text-[#94A3B8]">
                    <Wrench className="h-4 w-4" />
                    {skill.installed ? (skill.enabled ? 'Activa' : 'Instalada') : 'Disponible'}
                  </div>
                  {skill.installed ? (
                    <Button
                      type="button"
                      variant={skill.enabled ? 'outline' : 'default'}
                      size="sm"
                      disabled={pending}
                      onClick={() => toggle(skill.id, !skill.enabled)}
                    >
                      <Power className="mr-2 h-4 w-4" />
                      {skill.enabled ? 'Desactivar' : 'Activar'}
                    </Button>
                  ) : (
                    <Button type="button" size="sm" disabled={pending} onClick={() => install(skill.id)}>
                      <Download className="mr-2 h-4 w-4" />
                      Instalar
                    </Button>
                  )}
                </div>
              </article>
            ))}
          </section>
        </div>
      </main>
    </div>
  )
}
