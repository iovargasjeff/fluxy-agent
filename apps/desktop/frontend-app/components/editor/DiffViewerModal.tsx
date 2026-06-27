'use client'

import dynamic from 'next/dynamic'
import { useEffect, useMemo, useState, type ElementType } from 'react'
import { useTheme } from 'next-themes'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'
import {
  Braces,
  CheckCircle2,
  Code2,
  Database,
  GitCompareArrows,
  Minus,
  Plus,
  Search,
  Table2,
} from 'lucide-react'
import { toast } from 'sonner'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { listVersionsAction } from '@/lib/backend/actions/versions/list'
import { getVersionDetailAction } from '@/lib/backend/actions/versions/detail'
import type { EditorDialect } from '@/lib/editor-schema'

const DiffEditor = dynamic(
  () => import('@monaco-editor/react').then((m) => m.DiffEditor),
  { ssr: false, loading: () => <div className="h-full w-full animate-pulse bg-[#08111F]" /> }
)

interface DiffViewerModalProps {
  open: boolean
  onClose: () => void
  projectId: string
  initialVersionId?: string
}

type VersionData = {
  id: string
  versionNumber: number
  message: string
  userId: string
  createdAt: Date | null
  authorName: string | null
}

type VersionDetail = {
  versionNumber: number
  activeDialect: EditorDialect
  snapshots: Record<EditorDialect, string>
}

type DiffRow = {
  type: 'added' | 'removed'
  text: string
}

const DIALECTS: Array<{ value: EditorDialect; label: string; icon: ElementType; tone: string }> = [
  { value: 'postgresql', label: 'PostgreSQL', icon: Database, tone: 'text-sky-300' },
  { value: 'mysql', label: 'MySQL', icon: Database, tone: 'text-slate-300' },
  { value: 'sqlserver', label: 'SQL Server', icon: Code2, tone: 'text-red-300' },
  { value: 'json', label: 'JSON', icon: Braces, tone: 'text-emerald-300' },
]

function buildLineDiff(originalCode: string, modifiedCode: string) {
  const original = originalCode.split('\n')
  const modified = modifiedCode.split('\n')
  const modifiedSet = new Set(modified.map((line) => line.trim()).filter(Boolean))
  const originalSet = new Set(original.map((line) => line.trim()).filter(Boolean))

  const removed: DiffRow[] = original
    .filter((line) => line.trim() && !modifiedSet.has(line.trim()))
    .map((text) => ({ type: 'removed', text }))

  const added: DiffRow[] = modified
    .filter((line) => line.trim() && !originalSet.has(line.trim()))
    .map((text) => ({ type: 'added', text }))

  return { rows: [...removed, ...added], added: added.length, removed: removed.length }
}

function extractChangedObjects(rows: DiffRow[]) {
  const names = new Map<string, number>()
  const patterns = [
    /CREATE\s+TABLE\s+["`\[]?([\w.-]+)/i,
    /ALTER\s+TABLE\s+["`\[]?([\w.-]+)/i,
    /REFERENCES\s+["`\[]?([\w.-]+)/i,
    /"([^"]+)"\s*:/,
  ]

  rows.forEach((row) => {
    const match = patterns.map((pattern) => row.text.match(pattern)).find(Boolean)
    const rawName = match?.[1]?.replace(/[\]`".]/g, '')
    if (!rawName) return
    names.set(rawName, (names.get(rawName) ?? 0) + 1)
  })

  return Array.from(names.entries()).map(([name, changes]) => ({ name, changes }))
}

function relativeDate(date: Date | null) {
  if (!date) return 'Fecha desconocida'
  return formatDistanceToNow(new Date(date), { addSuffix: true, locale: es })
}

export function DiffViewerModal({ open, onClose, projectId, initialVersionId }: DiffViewerModalProps) {
  const { resolvedTheme } = useTheme()
  const [versions, setVersions] = useState<VersionData[]>([])
  const [details, setDetails] = useState<Record<string, VersionDetail>>({})
  const [versionA, setVersionA] = useState('')
  const [versionB, setVersionB] = useState('')
  const [dialect, setDialect] = useState<EditorDialect>('postgresql')
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [sideBySide, setSideBySide] = useState(true)

  useEffect(() => {
    if (!open) return

    let isMounted = true
    async function loadVersions() {
      setLoading(true)
      setDetails({})
      const result = await listVersionsAction(projectId)
      if (!isMounted) return
      if (result.error) {
        toast.error(result.error)
        setLoading(false)
        return
      }

      const nextVersions = (result.data ?? []).map((version) => ({
        ...version,
        createdAt: version.createdAt ? new Date(version.createdAt) : null,
      }))
      setVersions(nextVersions)
      const selectedA = initialVersionId || nextVersions[1]?.id || nextVersions[0]?.id || ''
      const selectedB = nextVersions.find((version) => version.id !== selectedA)?.id || selectedA
      setVersionA(selectedA)
      setVersionB(selectedB)
      setLoading(false)
    }

    void loadVersions()

    return () => {
      isMounted = false
    }
  }, [open, projectId, initialVersionId])

  useEffect(() => {
    if (!open) return
    ;[versionA, versionB].filter(Boolean).forEach((versionId) => {
      if (details[versionId]) return
      getVersionDetailAction(versionId).then((result) => {
        const versionDetail = result.data
        if (result.error || !versionDetail) {
          toast.error(result.error ?? 'No se pudo cargar la version')
          return
        }
        setDetails((current) => ({ ...current, [versionId]: versionDetail }))
      })
    })
  }, [details, open, projectId, versionA, versionB])

  const selectedA = versions.find((version) => version.id === versionA)
  const selectedB = versions.find((version) => version.id === versionB)
  const detailA = details[versionA]
  const detailB = details[versionB]
  const detailsLoading = Boolean(versionA && versionB && (!detailA || !detailB))
  const codeA = detailA?.snapshots[dialect] ?? ''
  const codeB = detailB?.snapshots[dialect] ?? ''
  const hasDiff = codeA.trim() !== codeB.trim()
  const diff = useMemo(() => buildLineDiff(codeA, codeB), [codeA, codeB])
  const changedObjects = useMemo(() => extractChangedObjects(diff.rows), [diff.rows])
  const filteredObjects = changedObjects.filter((item) => item.name.toLowerCase().includes(search.toLowerCase()))
  const activeDialect = DIALECTS.find((item) => item.value === dialect) ?? DIALECTS[0]
  const language = dialect === 'json' ? 'json' : 'sql'

  return (
    <Dialog open={open} onOpenChange={(val) => !val && onClose()}>
      <DialogContent className="flex h-[90vh] w-[96vw] max-w-full sm:max-w-[1320px] flex-col gap-0 overflow-hidden border-[#1E2A45] bg-[#0B1322] p-0 text-white">
        <div className="flex items-center justify-between border-b border-[#1E2A45] bg-[#0D1424] px-5 py-3">
          <div className="min-w-0">
            <DialogTitle className="text-base font-semibold">Comparacion de commits</DialogTitle>
            <p className="mt-0.5 truncate text-xs text-[#94A3B8]">
              Compara snapshots guardados por formato.
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <div className="hidden items-center gap-1.5 rounded-md border border-[#1E2A45] bg-[#07101F] px-2 py-1.5 text-[11px] text-[#B6C7E3] md:flex">
              <CheckCircle2 size={14} className="text-[#60A5FA]" />
              Snapshots
            </div>
          </div>
        </div>

        {loading || versions.length < 2 ? (
          <div className="flex flex-1 flex-col items-center justify-center px-6 text-center text-[#94A3B8]">
            {loading ? (
              <>
                <div className="mb-4 h-12 w-12 animate-spin rounded-full border-2 border-[#1A6CF6] border-t-transparent" />
                <p>Cargando versiones...</p>
              </>
            ) : (
              <>
                <GitCompareArrows className="mb-4 h-12 w-12 text-[#1A6CF6]" />
                <p className="text-lg text-white">Necesitas al menos dos commits</p>
                <p className="text-sm">Guarda otra version para poder comparar cambios.</p>
              </>
            )}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-[minmax(180px,240px)_auto_minmax(180px,240px)_1px_1fr] items-center gap-3 border-b border-[#1E2A45] bg-[#091221] px-4 py-3">
              <VersionPicker label="Version A" value={versionA} versions={versions} onChange={setVersionA} />
              <button
                type="button"
                onClick={() => {
                  setVersionA(versionB)
                  setVersionB(versionA)
                }}
                disabled={!versionA || !versionB}
                className="mt-5 flex h-8 w-8 items-center justify-center rounded-md border border-[#1E2A45] bg-[#0D1424] text-[#C7D2FE] transition hover:border-[#1A6CF6] hover:text-white disabled:opacity-50"
                title="Intercambiar versiones"
              >
                  <GitCompareArrows size={16} />
              </button>
              <VersionPicker label="Version B" value={versionB} versions={versions} onChange={setVersionB} />
              <div className="h-12 w-px bg-[#1E2A45]" />
              <div className="min-w-0 self-center">
                <div className="mb-1.5 text-xs font-semibold text-[#B6C7E3]">Formato</div>
                <div className="grid grid-cols-4 items-center gap-2">
                  {DIALECTS.map(({ value, label, icon: Icon, tone }) => (
                    <button
                      key={value}
                      onClick={() => setDialect(value)}
                      className={`flex min-w-0 items-center justify-center gap-1.5 rounded-md border px-2 py-1.5 text-xs transition ${
                        dialect === value
                          ? 'border-[#1A6CF6] bg-[#123A79] text-white'
                          : 'border-[#1E2A45] bg-[#07101F] text-[#94A3B8] hover:text-white'
                      }`}
                    >
                      <Icon size={14} className={tone} />
                      <span className="truncate">{label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-2 border-b border-[#1E2A45] bg-[#07101F] px-4 py-2">
              <SummaryCard tone="red" label="Lineas eliminadas" value={diff.removed} icon={Minus} />
              <SummaryCard tone="green" label="Lineas agregadas" value={diff.added} icon={Plus} />
              <SummaryCard tone="blue" label="Cambios totales" value={diff.added + diff.removed} icon={Code2} />
              <SummaryCard tone="purple" label="Objetos modificados" value={changedObjects.length} icon={Table2} />
            </div>

            <div className="grid min-h-0 flex-1 grid-cols-[170px_1fr]">
              <aside className="flex min-h-0 flex-col border-r border-[#1E2A45] bg-[#0A1220] p-3">
                <div className="relative">
                  <Search className="pointer-events-none absolute left-2.5 top-2 h-3.5 w-3.5 text-[#64748B]" />
                  <input
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Buscar objeto..."
                    className="h-8 w-full rounded-md border border-[#1E2A45] bg-[#07101F] pl-8 pr-2 text-xs text-white outline-none placeholder:text-[#64748B] focus:border-[#1A6CF6]"
                  />
                </div>
                <div className="mt-3 flex items-center justify-between text-xs font-semibold text-[#E2E8F0]">
                  <span>Objetos</span>
                  <span className="rounded-md border border-[#1E2A45] px-2 py-0.5 text-xs text-[#94A3B8]">{filteredObjects.length}</span>
                </div>
                <div className="mt-2 min-h-0 flex-1 space-y-1.5 overflow-y-auto">
                  {filteredObjects.length === 0 ? (
                    <p className="rounded-md border border-[#1E2A45] p-2 text-xs text-[#94A3B8]">
                      {hasDiff ? 'Hay cambios de lineas sin objeto detectado.' : 'Sin cambios en este formato.'}
                    </p>
                  ) : filteredObjects.map((item) => (
                    <div key={item.name} className="flex items-center justify-between rounded-md border border-[#1E2A45] bg-[#0D1424] px-2 py-1.5 text-xs text-[#E2E8F0]">
                      <span className="flex min-w-0 items-center gap-2">
                        <Table2 size={13} className="shrink-0 text-[#60A5FA]" />
                        <span className="truncate">{item.name}</span>
                      </span>
                      <span className="rounded bg-[#123A79] px-1.5 py-0.5 text-[11px] text-[#BFDBFE]">{item.changes}</span>
                    </div>
                  ))}
                </div>
              </aside>

              <section className="flex min-h-0 flex-col">
                <div className="flex h-10 items-center gap-2 border-b border-[#1E2A45] bg-[#0D1424] px-3">
                  <button
                    onClick={() => setSideBySide(true)}
                    className={`rounded-md border px-2.5 py-1 text-xs ${sideBySide ? 'border-[#1A6CF6] bg-[#123A79] text-white' : 'border-[#1E2A45] text-[#94A3B8]'}`}
                  >
                    Dividida
                  </button>
                  <button
                    onClick={() => setSideBySide(false)}
                    className={`rounded-md border px-2.5 py-1 text-xs ${!sideBySide ? 'border-[#1A6CF6] bg-[#123A79] text-white' : 'border-[#1E2A45] text-[#94A3B8]'}`}
                  >
                    Unificada
                  </button>
                </div>

                <div className="grid grid-cols-2 border-b border-[#1E2A45] bg-[#111827] text-[11px] font-semibold text-[#B6C7E3]">
                  <div className="border-r border-[#1E2A45] px-4 py-1.5">
                    Version A - v{selectedA?.versionNumber} - {activeDialect.label}
                  </div>
                  <div className="px-4 py-1.5">
                    Version B - v{selectedB?.versionNumber} - {activeDialect.label}
                  </div>
                </div>

                {detailsLoading ? (
                  <div className="flex flex-1 flex-col items-center justify-center text-[#94A3B8]">
                    <div className="mb-4 h-10 w-10 animate-spin rounded-full border-2 border-[#1A6CF6] border-t-transparent" />
                    <p className="text-sm">Cargando snapshots de los commits...</p>
                  </div>
                ) : !hasDiff && detailA && detailB ? (
                  <div className="flex flex-1 flex-col items-center justify-center text-[#94A3B8]">
                    <CheckCircle2 className="mb-4 h-12 w-12 text-[#10B981]" />
                    <p className="text-lg text-white">No hay diferencias en {activeDialect.label}</p>
                    <p className="text-sm">Los snapshots seleccionados coinciden.</p>
                  </div>
                ) : (
                  <div className="min-h-0 flex-1">
                    <DiffEditor
                      key={`${versionA}-${versionB}-${dialect}-${sideBySide}`}
                      original={codeA}
                      modified={codeB}
                      language={language}
                      theme={resolvedTheme === 'dark' ? 'vs-dark' : 'light'}
                      options={{
                        readOnly: true,
                        renderSideBySide: sideBySide,
                        originalEditable: false,
                        minimap: { enabled: false },
                        fontSize: 13,
                        wordWrap: 'on',
                        scrollBeyondLastLine: false,
                        padding: { top: 12 },
                        renderOverviewRuler: true,
                        ignoreTrimWhitespace: false,
                        enableSplitViewResizing: true,
                        scrollBeyondLastColumn: 0,
                        scrollbar: {
                          alwaysConsumeMouseWheel: false,
                        },
                      }}
                    />
                  </div>
                )}
              </section>
            </div>

          </>
        )}
      </DialogContent>
    </Dialog>
  )
}

function VersionPicker({
  label,
  value,
  versions,
  onChange,
}: {
  label: string
  value: string
  versions: VersionData[]
  onChange: (value: string) => void
}) {
  const selected = versions.find((version) => version.id === value)

  return (
    <label className="block min-w-0">
      <span className="mb-1.5 block text-xs font-semibold text-[#B6C7E3]">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-8 w-full rounded-md border border-[#1E2A45] bg-[#07101F] px-2 font-mono text-xs text-white outline-none focus:border-[#1A6CF6]"
      >
        {versions.map((version) => (
          <option key={version.id} value={version.id}>
            v{version.versionNumber} - {version.message}
          </option>
        ))}
      </select>
      <span className="mt-1 block truncate text-[11px] text-[#94A3B8]">
        {selected ? `${relativeDate(selected.createdAt)} - ${selected.authorName ?? 'Tu equipo'}` : 'Selecciona una version'}
      </span>
    </label>
  )
}

function SummaryCard({
  label,
  value,
  tone,
  icon: Icon,
}: {
  label: string
  value: number
  tone: 'red' | 'green' | 'blue' | 'purple'
  icon: ElementType
}) {
  const tones = {
    red: 'border-red-500/20 bg-red-500/10 text-red-200',
    green: 'border-emerald-500/20 bg-emerald-500/10 text-emerald-200',
    blue: 'border-[#1A6CF6]/20 bg-[#1A6CF6]/10 text-[#BFDBFE]',
    purple: 'border-purple-500/20 bg-purple-500/10 text-purple-200',
  }

  return (
    <div className={`flex items-center gap-2 rounded-md border px-3 py-1.5 ${tones[tone]}`}>
      <span className="rounded bg-black/15 p-1.5">
        <Icon size={14} />
      </span>
      <span className="min-w-0">
        <span className="mr-1.5 text-base font-semibold">{value}</span>
        <span className="text-[11px] opacity-80">{label}</span>
      </span>
    </div>
  )
}
