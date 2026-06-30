'use client'

import { useEffect, useMemo, useState, useTransition } from 'react'
import { Bot, Check, DatabaseZap, History, KeyRound, Lightbulb, ShieldCheck, Stamp, Brain, LockKeyhole } from 'lucide-react'
import { DashboardSidebar } from '@/components/dashboard/DashboardSidebar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { agentToolsAPI, type AgentToolsState, type EnvironmentGuardItem } from '@/lib/api/client'

const emptyState: AgentToolsState = {
  memories: [],
  skill_permissions: [],
  approvals: [],
  decisions: [],
  environment_guards: [],
}

const tools = [
  { id: 'memory', label: 'Memoria', icon: Brain, hint: 'Lo que Fluxy recuerda' },
  { id: 'permissions', label: 'Permisos', icon: LockKeyhole, hint: 'Capacidades por skill' },
  { id: 'approvals', label: 'Approvals', icon: Stamp, hint: 'Decisiones humanas' },
  { id: 'runs', label: 'Runs', icon: History, hint: 'Historial y rollback' },
  { id: 'secrets', label: 'Secretos', icon: KeyRound, hint: 'Solo local' },
  { id: 'decisions', label: 'Decisiones', icon: Lightbulb, hint: 'ADRs de esquema' },
  { id: 'guards', label: 'Guardas', icon: ShieldCheck, hint: 'Dev/staging/prod' },
] as const

type ToolId = typeof tools[number]['id']

export default function AgentToolsPage() {
  const [state, setState] = useState<AgentToolsState>(emptyState)
  const [activeTool, setActiveTool] = useState<ToolId>('memory')
  const [memory, setMemory] = useState({ scope: 'workspace', subject: '', content: '', tags: '' })
  const [permission, setPermission] = useState({ skill_id: 'safe_migration_basic', environment: 'production', can_read_schema: true, can_generate_sql: true, can_execute: false, requires_approval: true })
  const [approvalTitle, setApprovalTitle] = useState('')
  const [decision, setDecision] = useState({ title: '', decision: '', rationale: '', status: 'accepted' })
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  async function load() {
    try {
      setError(null)
      setState(await agentToolsAPI.state())
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'No se pudieron cargar las herramientas agenticas.')
    }
  }

  useEffect(() => {
    const timer = window.setTimeout(() => void load(), 0)
    return () => window.clearTimeout(timer)
  }, [])

  const activeMeta = useMemo(() => tools.find((tool) => tool.id === activeTool) ?? tools[0], [activeTool])

  const submitMemory = () => startTransition(async () => {
    try {
      setError(null)
      await agentToolsAPI.createMemory({ ...memory, tags: memory.tags.split(',').map((tag) => tag.trim()).filter(Boolean) })
      setMemory({ scope: 'workspace', subject: '', content: '', tags: '' })
      await load()
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'No se pudo guardar la memoria.')
    }
  })

  const submitPermission = () => startTransition(async () => {
    try {
      setError(null)
      await agentToolsAPI.upsertSkillPermission(permission)
      await load()
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'No se pudieron guardar los permisos.')
    }
  })

  const submitApproval = () => startTransition(async () => {
    try {
      setError(null)
      await agentToolsAPI.createApproval({ title: approvalTitle, risk_level: 'high', requested_by: 'local-user', details: { source: 'manual' } })
      setApprovalTitle('')
      await load()
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'No se pudo crear el approval.')
    }
  })

  const submitDecision = () => startTransition(async () => {
    try {
      setError(null)
      await agentToolsAPI.createDecision(decision)
      setDecision({ title: '', decision: '', rationale: '', status: 'accepted' })
      await load()
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'No se pudo guardar la decision.')
    }
  })

  const toggleGuard = (guard: EnvironmentGuardItem, field: keyof Pick<EnvironmentGuardItem, 'require_backup' | 'require_sandbox' | 'require_approval' | 'allow_direct_write'>) => {
    startTransition(async () => {
      try {
        setError(null)
        await agentToolsAPI.upsertEnvironmentGuard({ ...guard, [field]: !guard[field] })
        await load()
      } catch (cause) {
        setError(cause instanceof Error ? cause.message : 'No se pudo actualizar la guarda.')
      }
    })
  }

  return (
    <div className="flex min-h-screen bg-white text-slate-950 dark:bg-[#0A0F1E] dark:text-white">
      <DashboardSidebar userName="Usuario Local" userAvatarUrl={null} />
      <main className="flex-1 overflow-auto">
        <div className="border-b border-slate-200 bg-white px-6 py-5 dark:border-[#1E2A45] dark:bg-[#111827]">
          <div className="mx-auto flex max-w-7xl items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#1A6CF6] text-white">
              <Bot className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl font-semibold">Herramientas agenticas</h1>
              <p className="text-sm text-slate-500 dark:text-[#94A3B8]">Elige una herramienta y usa toda la pantalla para configurarla.</p>
            </div>
          </div>
        </div>

        <div className="mx-auto max-w-7xl px-6 py-6">
          {error && (
            <div className="mb-4 rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-200">
              {error}
            </div>
          )}
          <div className="mb-6 flex gap-3 overflow-x-auto pb-2">
            {tools.map(({ id, label, icon: Icon, hint }) => (
              <button
                key={id}
                type="button"
                onClick={() => setActiveTool(id)}
                className={`flex min-w-[180px] items-center gap-3 rounded-lg border p-4 text-left transition ${
                  activeTool === id
                    ? 'border-[#1A6CF6] bg-blue-50 text-[#1A6CF6] shadow-sm dark:bg-blue-500/10'
                    : 'border-slate-200 bg-white text-slate-600 hover:border-[#1A6CF6] hover:text-[#1A6CF6] dark:border-[#1E2A45] dark:bg-[#111827] dark:text-[#CBD5E1]'
                }`}
              >
                <Icon className="h-5 w-5 shrink-0" />
                <span>
                  <span className="block text-sm font-semibold">{label}</span>
                  <span className="block text-xs opacity-70">{hint}</span>
                </span>
              </button>
            ))}
          </div>

          <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm dark:border-[#1E2A45] dark:bg-[#111827]">
            <div className="mb-6 flex items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold">{activeMeta.label}</h2>
                <p className="text-sm text-slate-500 dark:text-[#94A3B8]">{activeMeta.hint}</p>
              </div>
              <Badge variant="outline">local-first</Badge>
            </div>

            {activeTool === 'memory' && (
              <div className="grid gap-6 lg:grid-cols-[minmax(360px,480px)_1fr]">
                <div className="grid gap-3">
                  <Input value={memory.subject} onChange={(e) => setMemory({ ...memory, subject: e.target.value })} placeholder="Tema: particionado de orders" />
                  <Textarea value={memory.content} onChange={(e) => setMemory({ ...memory, content: e.target.value })} placeholder="Que debe recordar Fluxy..." className="min-h-40" />
                  <Input value={memory.tags} onChange={(e) => setMemory({ ...memory, tags: e.target.value })} placeholder="tags separados por coma" />
                  <Button disabled={pending || !memory.subject || !memory.content} onClick={submitMemory}>Guardar memoria</Button>
                </div>
                <RecordList items={state.memories.map((item) => ({ title: item.subject, detail: item.content }))} empty="Sin recuerdos todavia." />
              </div>
            )}

            {activeTool === 'permissions' && (
              <div className="grid gap-6 lg:grid-cols-[minmax(360px,480px)_1fr]">
                <div className="grid gap-3">
                  <Input value={permission.skill_id} onChange={(e) => setPermission({ ...permission, skill_id: e.target.value })} placeholder="skill_id" />
                  <select className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm dark:border-[#1E2A45] dark:bg-[#0B1322]" value={permission.environment} onChange={(e) => setPermission({ ...permission, environment: e.target.value })}>
                    <option value="development">development</option>
                    <option value="staging">staging</option>
                    <option value="production">production</option>
                  </select>
                  <Toggle label="Leer schema" checked={permission.can_read_schema} onChange={() => setPermission({ ...permission, can_read_schema: !permission.can_read_schema })} />
                  <Toggle label="Generar SQL" checked={permission.can_generate_sql} onChange={() => setPermission({ ...permission, can_generate_sql: !permission.can_generate_sql })} />
                  <Toggle label="Ejecutar acciones" checked={permission.can_execute} onChange={() => setPermission({ ...permission, can_execute: !permission.can_execute })} />
                  <Toggle label="Requiere aprobacion" checked={permission.requires_approval} onChange={() => setPermission({ ...permission, requires_approval: !permission.requires_approval })} />
                  <Button disabled={pending || !permission.skill_id} onClick={submitPermission}>Guardar permisos</Button>
                </div>
                <RecordList items={state.skill_permissions.map((item) => ({ title: `${item.skill_id} / ${item.environment}`, detail: `read=${item.can_read_schema} sql=${item.can_generate_sql} execute=${item.can_execute}` }))} empty="Sin permisos configurados." />
              </div>
            )}

            {activeTool === 'approvals' && (
              <div className="grid gap-6 lg:grid-cols-[minmax(360px,480px)_1fr]">
                <div className="grid content-start gap-3">
                  <Input value={approvalTitle} onChange={(e) => setApprovalTitle(e.target.value)} placeholder="Aprobar migracion en production" />
                  <Button disabled={pending || !approvalTitle} onClick={submitApproval}>Crear approval</Button>
                </div>
                <div className="grid gap-2">
                  {state.approvals.map((item) => (
                    <div key={item.id} className="flex items-center justify-between rounded-lg border border-slate-200 p-4 text-sm dark:border-[#1E2A45]">
                      <span>{item.title}</span>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{item.status}</Badge>
                        {item.status === 'pending' && <Button size="sm" onClick={() => startTransition(async () => { await agentToolsAPI.setApprovalStatus(item.id, 'approved'); await load() })}><Check className="h-4 w-4" /></Button>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTool === 'runs' && (
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-5 text-sm leading-6 text-slate-600 dark:border-[#1E2A45] dark:bg-[#0B1322] dark:text-[#CBD5E1]">
                <DatabaseZap className="mr-2 inline h-4 w-4 text-[#1A6CF6]" />
                Run history ya se apoya en audit logs locales. El siguiente paso es enlazar cada run con artefactos, rollback plan y approval asociado.
              </div>
            )}

            {activeTool === 'secrets' && (
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-5 text-sm leading-6 text-slate-600 dark:border-[#1E2A45] dark:bg-[#0B1322] dark:text-[#CBD5E1]">
                Secrets manager vive en <strong>Conexiones</strong>: host real, usuario, password cifrado y rotacion quedan solo en esta maquina. No se sincronizan a Fluxy Cloud.
              </div>
            )}

            {activeTool === 'decisions' && (
              <div className="grid gap-6 lg:grid-cols-[minmax(360px,480px)_1fr]">
                <div className="grid gap-3">
                  <Input value={decision.title} onChange={(e) => setDecision({ ...decision, title: e.target.value })} placeholder="Decision: usar UUID en entidades publicas" />
                  <Textarea value={decision.decision} onChange={(e) => setDecision({ ...decision, decision: e.target.value })} placeholder="Decision tomada..." className="min-h-32" />
                  <Textarea value={decision.rationale} onChange={(e) => setDecision({ ...decision, rationale: e.target.value })} placeholder="Razonamiento..." className="min-h-32" />
                  <Button disabled={pending || !decision.title || !decision.decision} onClick={submitDecision}>Guardar decision</Button>
                </div>
                <RecordList items={state.decisions.map((item) => ({ title: item.title, detail: item.decision }))} empty="Sin decisiones todavia." />
              </div>
            )}

            {activeTool === 'guards' && (
              <div className="grid gap-4 xl:grid-cols-3">
                {state.environment_guards.map((guard) => (
                  <div key={guard.id} className="rounded-lg border border-slate-200 p-4 dark:border-[#1E2A45]">
                    <div className="mb-3 flex items-center gap-2 font-medium">
                      <ShieldCheck className="h-4 w-4 text-[#1A6CF6]" />
                      {guard.environment}
                    </div>
                    <div className="grid gap-2 text-sm">
                      <Toggle label="Backup obligatorio" checked={guard.require_backup} onChange={() => toggleGuard(guard, 'require_backup')} />
                      <Toggle label="Sandbox obligatorio" checked={guard.require_sandbox} onChange={() => toggleGuard(guard, 'require_sandbox')} />
                      <Toggle label="Aprobacion humana" checked={guard.require_approval} onChange={() => toggleGuard(guard, 'require_approval')} />
                      <Toggle label="Permitir escritura directa" checked={guard.allow_direct_write} onChange={() => toggleGuard(guard, 'allow_direct_write')} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  )
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: () => void }) {
  return (
    <label className="flex items-center justify-between gap-3 rounded-md border border-slate-200 px-3 py-2 dark:border-[#1E2A45]">
      <span>{label}</span>
      <input type="checkbox" checked={checked} onChange={onChange} />
    </label>
  )
}

function RecordList({ items, empty }: { items: Array<{ title: string; detail: string }>; empty: string }) {
  if (items.length === 0) return <p className="text-sm text-slate-500 dark:text-[#94A3B8]">{empty}</p>
  return (
    <div className="max-h-[520px] overflow-auto rounded-lg border border-slate-200 dark:border-[#1E2A45]">
      {items.map((item, index) => (
        <div key={`${item.title}-${index}`} className="border-b border-slate-200 p-4 last:border-b-0 dark:border-[#1E2A45]">
          <h3 className="text-sm font-semibold">{item.title}</h3>
          <p className="mt-1 line-clamp-3 text-sm text-slate-600 dark:text-[#CBD5E1]">{item.detail}</p>
        </div>
      ))}
    </div>
  )
}
