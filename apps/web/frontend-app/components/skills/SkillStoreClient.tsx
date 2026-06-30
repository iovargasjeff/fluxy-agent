'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Download, Eye, Power, ShieldCheck, Store, Wrench } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { installSkillAction, setSkillEnabledAction, type SkillStoreItem } from '@/lib/backend/actions/skills/list'

interface SkillStoreClientProps {
  skills: SkillStoreItem[]
}

const riskTone: Record<string, string> = {
  low: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  medium: 'bg-amber-50 text-amber-700 border-amber-200',
  high: 'bg-rose-50 text-rose-700 border-rose-200',
}

export function SkillStoreClient({ skills }: SkillStoreClientProps) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [selectedSkill, setSelectedSkill] = useState<SkillStoreItem | null>(null)

  const install = (skillId: string) => {
    startTransition(async () => {
      await installSkillAction(skillId)
      router.refresh()
    })
  }

  const toggle = (skillId: string, enabled: boolean) => {
    startTransition(async () => {
      await setSkillEnabledAction(skillId, enabled)
      router.refresh()
    })
  }

  return (
    <div className="min-h-full bg-white text-slate-950">
      <div className="border-b border-slate-200">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-5 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#1A6CF6] text-white">
              <Store className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl font-semibold">Skill Store</h1>
              <p className="text-sm text-slate-500">Skills instalables para agentes de base de datos.</p>
            </div>
          </div>
          <Badge variant="outline" className="hidden sm:inline-flex">Agent Skills v1</Badge>
        </div>
      </div>

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        {selectedSkill && (
          <section className="mb-6 rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold text-slate-950">{selectedSkill.name}</h2>
                <p className="mt-1 text-sm leading-6 text-slate-600">{selectedSkill.description}</p>
              </div>
              <Badge variant="outline">{selectedSkill.riskLevel}</Badge>
            </div>

            <div className="grid gap-4 lg:grid-cols-3">
              <div className="rounded-lg border border-slate-200 p-4">
                <h3 className="text-sm font-semibold text-slate-900">Que permite</h3>
                <ul className="mt-3 space-y-2 text-sm text-slate-600">
                  <li>Ejecutarse como skill instalable compatible con Agent Skills v1.</li>
                  <li>Resolver compatibilidad por motor de base de datos.</li>
                  <li>Producir artefactos seguros como reportes, diagramas o planes.</li>
                  <li>Activarse o desactivarse antes de que el agente la use.</li>
                </ul>
              </div>

              <div className="rounded-lg border border-slate-200 p-4">
                <h3 className="text-sm font-semibold text-slate-900">Guardas y alcance</h3>
                <div className="mt-3 space-y-2 text-sm text-slate-600">
                  <p>Riesgo: <span className="font-medium text-slate-900">{selectedSkill.riskLevel}</span></p>
                  <p>Motores: {(selectedSkill.engines.length ? selectedSkill.engines : ['multi-engine']).join(', ')}</p>
                  <p>Requiere aprobacion: {selectedSkill.requiresApproval ? 'Si' : 'No'}</p>
                  <p>Requiere backup: {selectedSkill.requiresBackup ? 'Si' : 'No'}</p>
                  <p>Requiere sandbox: {selectedSkill.requiresSandbox ? 'Si' : 'No'}</p>
                </div>
              </div>

              <div className="rounded-lg border border-slate-200 p-4">
                <h3 className="text-sm font-semibold text-slate-900">Metadata</h3>
                <div className="mt-3 space-y-2 text-sm text-slate-600">
                  <p>ID: <span className="font-mono text-xs text-slate-900">{selectedSkill.id}</span></p>
                  <p>Version: {selectedSkill.version}</p>
                  <p>Autor: {selectedSkill.author}</p>
                  <p>Licencia: {selectedSkill.license}</p>
                  <p>Estado: {selectedSkill.installed ? (selectedSkill.enabled ? 'Activa' : 'Instalada') : 'Disponible'}</p>
                </div>
              </div>
            </div>
          </section>
        )}

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {skills.map((skill) => (
          <article key={skill.id} className="flex min-h-[270px] flex-col rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-base font-semibold text-slate-950">{skill.name}</h2>
                <p className="mt-1 text-xs text-slate-500">{skill.category} · v{skill.version}</p>
              </div>
              <span className={`rounded-full border px-2.5 py-1 text-xs font-medium ${riskTone[skill.riskLevel] ?? riskTone.low}`}>
                {skill.riskLevel}
              </span>
            </div>

            <p className="mt-4 flex-1 text-sm leading-6 text-slate-600">{skill.description}</p>

            <div className="mt-4 flex flex-wrap gap-2">
              {(skill.engines.length ? skill.engines : ['multi-engine']).map((engine) => (
                <Badge key={engine} variant="secondary" className="rounded-md">{engine}</Badge>
              ))}
            </div>

            {(skill.requiresApproval || skill.requiresBackup || skill.requiresSandbox) && (
              <div className="mt-4 flex items-center gap-2 text-xs text-slate-500">
                <ShieldCheck className="h-4 w-4 text-[#1A6CF6]" />
                Requiere guardas: {[skill.requiresApproval && 'aprobacion', skill.requiresBackup && 'backup', skill.requiresSandbox && 'sandbox'].filter(Boolean).join(', ')}
              </div>
            )}

            <div className="mt-5 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-xs text-slate-500">
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
        </section>
      </main>
    </div>
  )
}
