'use client'

import { useEffect, useMemo, useState, useTransition } from 'react'
import { Download, Eye, Filter, Play, Power, Search, ShieldCheck, Store, Wrench } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { DashboardSidebar } from '@/components/dashboard/DashboardSidebar'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { skillsAPI, type SkillStoreItem } from '@/lib/api/client'

type InstallFilter = 'all' | 'installed' | 'enabled' | 'available'

const riskTone: Record<string, string> = {
  low: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:border-emerald-500/30',
  medium: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-300 dark:border-amber-500/30',
  high: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/10 dark:text-rose-300 dark:border-rose-500/30',
}

export default function DesktopSkillsPage() {
  const [skills, setSkills] = useState<SkillStoreItem[]>([])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedSkill, setSelectedSkill] = useState<SkillStoreItem | null>(null)
  const [query, setQuery] = useState('')
  const [installFilter, setInstallFilter] = useState<InstallFilter>('all')
  const [engineFilter, setEngineFilter] = useState('all')
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

  const engines = useMemo(() => {
    const values = new Set<string>()
    skills.forEach((skill) => {
      if (skill.engines.length === 0) values.add('multi-engine')
      skill.engines.forEach((engine) => values.add(engine))
    })
    return Array.from(values).sort()
  }, [skills])

  const filteredSkills = useMemo(() => {
    const normalized = query.trim().toLowerCase()
    return skills.filter((skill) => {
      const haystack = [
        skill.name,
        skill.description,
        skill.category,
        skill.risk_level,
        ...skill.engines,
        ...skill.tags,
      ].join(' ').toLowerCase()
      const matchesQuery = !normalized || haystack.includes(normalized)
      const matchesInstall =
        installFilter === 'all'
        || (installFilter === 'installed' && skill.installed)
        || (installFilter === 'enabled' && skill.enabled)
        || (installFilter === 'available' && !skill.installed)
      const skillEngines = skill.engines.length ? skill.engines : ['multi-engine']
      const matchesEngine = engineFilter === 'all' || skillEngines.includes(engineFilter)
      return matchesQuery && matchesInstall && matchesEngine
    })
  }, [engineFilter, installFilter, query, skills])

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-950 dark:bg-[#0A0F1E] dark:text-white">
      <DashboardSidebar userName="Usuario Local" userAvatarUrl={null} />
      <main className="flex-1">
        <div className="border-b border-slate-200 bg-white dark:border-[#1E2A45] dark:bg-[#111827]">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#1A6CF6] text-white">
                <Store className="h-5 w-5" />
              </div>
              <div>
                <h1 className="text-xl font-semibold">Skill Store</h1>
                <p className="text-sm text-slate-500 dark:text-[#94A3B8]">Instala skills locales para agentes especializados en bases de datos.</p>
              </div>
            </div>
            <Badge variant="outline" className="hidden border-slate-200 text-slate-500 dark:border-[#1E2A45] dark:text-[#94A3B8] sm:inline-flex">Agent Skills v1</Badge>
          </div>
        </div>

        <div className="mx-auto max-w-6xl px-6 py-8">
          <section className="mb-6 grid gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-[#1E2A45] dark:bg-[#111827] lg:grid-cols-[1fr_180px_180px]">
            <label className="relative block">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Buscar por nombre, motor, categoria o tag"
                className="h-11 w-full rounded-lg border border-slate-200 bg-white pl-10 pr-3 text-sm outline-none transition focus:border-[#1A6CF6] dark:border-[#1E2A45] dark:bg-[#0B1322]"
              />
            </label>
            <label className="relative block">
              <Filter className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <select
                value={installFilter}
                onChange={(event) => setInstallFilter(event.target.value as InstallFilter)}
                className="h-11 w-full rounded-lg border border-slate-200 bg-white pl-10 pr-3 text-sm outline-none transition focus:border-[#1A6CF6] dark:border-[#1E2A45] dark:bg-[#0B1322]"
              >
                <option value="all">Todas</option>
                <option value="installed">Instaladas</option>
                <option value="enabled">Activas</option>
                <option value="available">Disponibles</option>
              </select>
            </label>
            <select
              value={engineFilter}
              onChange={(event) => setEngineFilter(event.target.value)}
              className="h-11 rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-[#1A6CF6] dark:border-[#1E2A45] dark:bg-[#0B1322]"
            >
              <option value="all">Todos los motores</option>
              {engines.map((engine) => (
                <option key={engine} value={engine}>{engine}</option>
              ))}
            </select>
          </section>

          {loading && <p className="text-sm text-slate-500 dark:text-[#94A3B8]">Cargando skills...</p>}
          {error && (
            <div className="rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-200">
              {error}
            </div>
          )}

          <Dialog open={Boolean(selectedSkill)} onOpenChange={(open) => !open && setSelectedSkill(null)}>
            <DialogContent className="max-h-[88vh] w-[min(980px,94vw)] max-w-none overflow-auto border-slate-200 bg-white text-slate-950 dark:border-[#1E2A45] dark:bg-[#111827] dark:text-white">
              {selectedSkill && (
                <>
                  <DialogHeader>
                    <DialogTitle className="flex items-center justify-between gap-3">
                      <span>{selectedSkill.name}</span>
                      <Badge variant="outline" className="border-slate-200 text-slate-500 dark:border-[#1E2A45] dark:text-[#94A3B8]">{selectedSkill.risk_level}</Badge>
                    </DialogTitle>
                    <p className="text-sm text-slate-500 dark:text-[#94A3B8]">{selectedSkill.description}</p>
                  </DialogHeader>
                  <div className="grid gap-4 lg:grid-cols-3">
                    <div className="rounded-lg border border-slate-200 p-4 dark:border-[#1E2A45]">
                      <h3 className="text-sm font-semibold">Que permite</h3>
                      <ul className="mt-3 space-y-2 text-sm text-slate-600 dark:text-[#CBD5E1]">
                        <li>Resolver compatibilidad por motor local.</li>
                        <li>Ejecutarse solo si esta instalada y activa.</li>
                        <li>Producir artefactos seguros y auditables.</li>
                        <li>Respetar permisos, approvals y environment guard.</li>
                      </ul>
                    </div>
                    <div className="rounded-lg border border-slate-200 p-4 dark:border-[#1E2A45]">
                      <h3 className="text-sm font-semibold">Guardas</h3>
                      <div className="mt-3 space-y-2 text-sm text-slate-600 dark:text-[#CBD5E1]">
                        <p>Aprobacion: {selectedSkill.requires_approval ? 'Si' : 'No'}</p>
                        <p>Backup: {selectedSkill.requires_backup ? 'Si' : 'No'}</p>
                        <p>Sandbox: {selectedSkill.requires_sandbox ? 'Si' : 'No'}</p>
                      </div>
                    </div>
                    <div className="rounded-lg border border-slate-200 p-4 dark:border-[#1E2A45]">
                      <h3 className="text-sm font-semibold">Metadata</h3>
                      <div className="mt-3 space-y-2 text-sm text-slate-600 dark:text-[#CBD5E1]">
                        <p>ID: <span className="font-mono text-xs">{selectedSkill.id}</span></p>
                        <p>Version: {selectedSkill.version}</p>
                        <p>Motores: {(selectedSkill.engines.length ? selectedSkill.engines : ['multi-engine']).join(', ')}</p>
                      </div>
                    </div>
                  </div>
                  {selectedSkill.id === 'query_analyzer' && (
                    <Button type="button" className="mt-4 w-fit" onClick={() => window.location.href = '/analyzer'}>
                      <Play className="mr-2 h-4 w-4" />
                      Abrir analizador
                    </Button>
                  )}
                </>
              )}
            </DialogContent>
          </Dialog>

          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {filteredSkills.map((skill) => (
              <article key={skill.id} className="flex min-h-[260px] flex-col rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-[#1E2A45] dark:bg-[#111827]">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="text-base font-semibold">{skill.name}</h2>
                    <p className="mt-1 text-xs text-slate-500 dark:text-[#94A3B8]">{skill.category} · v{skill.version}</p>
                  </div>
                  <span className={`rounded-full border px-2.5 py-1 text-xs font-medium ${riskTone[skill.risk_level] ?? riskTone.low}`}>
                    {skill.risk_level}
                  </span>
                </div>

                <p className="mt-4 flex-1 text-sm leading-6 text-slate-600 dark:text-[#CBD5E1]">{skill.description}</p>

                <div className="mt-4 flex flex-wrap gap-2">
                  {(skill.engines.length ? skill.engines : ['multi-engine']).map((engine) => (
                    <Badge key={engine} variant="secondary" className="rounded-md bg-slate-100 text-slate-600 dark:bg-[#1E2A45] dark:text-[#CBD5E1]">{engine}</Badge>
                  ))}
                </div>

                {(skill.requires_approval || skill.requires_backup || skill.requires_sandbox) && (
                  <div className="mt-4 flex items-center gap-2 text-xs text-slate-500 dark:text-[#94A3B8]">
                    <ShieldCheck className="h-4 w-4 text-[#1A6CF6]" />
                    Requiere guardas: {[skill.requires_approval && 'aprobacion', skill.requires_backup && 'backup', skill.requires_sandbox && 'sandbox'].filter(Boolean).join(', ')}
                  </div>
                )}

                <div className="mt-5 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-[#94A3B8]">
                    <Wrench className="h-4 w-4" />
                    {skill.installed ? (skill.enabled ? 'Activa' : 'Instalada') : 'Disponible'}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button type="button" variant="outline" size="sm" onClick={() => setSelectedSkill(skill)}>
                      <Eye className="mr-2 h-4 w-4" />
                      Detalles
                    </Button>
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
                </div>
              </article>
            ))}
            {!loading && filteredSkills.length === 0 && (
              <div className="rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500 dark:border-[#1E2A45] dark:bg-[#111827] dark:text-[#94A3B8] md:col-span-2 xl:col-span-3">
                No hay skills que coincidan con esos filtros.
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  )
}
