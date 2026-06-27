'use client'

import { useEffect, useRef, useState, forwardRef, type ElementType } from 'react'
import { ReactFlowProvider, useReactFlow, type Edge, type Node } from '@xyflow/react'
import { ArrowLeft, CheckCircle2, Code2, Database, FileJson, History, PanelRight, RefreshCw } from 'lucide-react'
import { toast } from 'sonner'
import { Canvas } from './Canvas'
import { EditorPanel } from './EditorPanel'
import { SchemaInspector } from './SchemaInspector'
import { ExportMenu } from './ExportMenu'
import { VersionHistorySheet } from './VersionHistorySheet'
import { PublicShareToggle } from './PublicShareToggle'
import { DiffViewerModal } from './DiffViewerModal'
import { useEditorStore } from '@/store/useEditorStore'
import { saveDiagramAction } from '@/lib/backend/actions/diagrams/save'
import { restoreVersionAction } from '@/lib/backend/actions/versions/restore'
import { getSchemaStats, type EditorDialect } from '@/lib/editor-schema'
import { toFlowJson } from '@/lib/flow-types'
import { diagramsAPI } from '@/lib/api/client'
import { useConnectionStore } from '@/lib/store/useConnectionStore'
import { useRouter } from 'next/navigation'

interface EditorLayoutProps {
  projectName: string
  projectId: string
  initialSQL?: string
  initialNodes?: Node[]
  initialEdges?: Edge[]
  dialect?: string
  initialIsPublic?: boolean
  initialShareAccess?: 'view' | 'edit'
}

const DIALECTS: Array<{ value: EditorDialect; label: string; icon: ElementType }> = [
  { value: 'postgresql', label: 'PostgreSQL', icon: Database },
  { value: 'mysql', label: 'MySQL', icon: Database },
  { value: 'sqlserver', label: 'SQL Server', icon: Database },
  { value: 'json', label: 'JSON', icon: FileJson },
]

function EditorLayoutInner({
  projectName,
  projectId,
  initialSQL,
  initialNodes = [],
  initialEdges = [],
  dialect = 'postgresql',
  initialIsPublic = false,
  initialShareAccess = 'view',
}: EditorLayoutProps) {
  const router = useRouter()
  const { toObject, fitView, setViewport } = useReactFlow()
  const nodes = useEditorStore((state) => state.nodes)
  const edges = useEditorStore((state) => state.edges)
  const mode = useEditorStore((state) => state.dialect)
  const setDialect = useEditorStore((state) => state.setDialect)
  const setSqlValue = useEditorStore((state) => state.setSqlValue)
  const setNodesAndEdges = useEditorStore((state) => state.setNodesAndEdges)

  const [saving, setSaving] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [savedLabel, setSavedLabel] = useState('Esquema sincronizado')
  const [showSqlPanel, setShowSqlPanel] = useState(true)
  const [showInspector, setShowInspector] = useState(true)
  const [diffModal, setDiffModal] = useState<{ open: boolean; initialVersionId?: string } | null>(null)
  const activeConnection = useConnectionStore((state) => state.activeConnection)

  const [sqlWidth, setSqlWidth] = useState(450)
  const [inspectorWidth, setInspectorWidth] = useState(320)
  const resizeTarget = useRef<'sql' | 'inspector' | null>(null)
  const initialized = useRef(false)
  const saveTimer = useRef<number | null>(null)

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!resizeTarget.current) return

      if (resizeTarget.current === 'sql') {
        const newWidth = e.clientX - 56

        if (newWidth > 220 && newWidth < window.innerWidth - 560) {
          setSqlWidth(newWidth)
        }
      } else {
        const newWidth = window.innerWidth - e.clientX

        if (newWidth > 280 && newWidth < window.innerWidth - 620) {
          setInspectorWidth(newWidth)
        }
      }
    }

    const handleMouseUp = () => {
      if (resizeTarget.current) {
        resizeTarget.current = null
        document.body.style.cursor = 'default'
      }
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [])

  const stats = getSchemaStats(nodes, edges)

  useEffect(() => {
    setDialect((dialect as EditorDialect) || 'postgresql')
    setSqlValue(initialSQL ?? '')
    setNodesAndEdges(initialNodes, initialEdges)
    initialized.current = true
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (!initialized.current) return
    if (saveTimer.current) window.clearTimeout(saveTimer.current)
    saveTimer.current = window.setTimeout(() => {
      void saveDiagramAction({ projectId, flowJson: toObject() }).then((result) => {
        if (!result.error) setSavedLabel('Guardado automaticamente')
      })
    }, 900)
    return () => {
      if (saveTimer.current) window.clearTimeout(saveTimer.current)
    }
  }, [nodes, projectId, toObject])

  async function handleBack() {
    if (saveTimer.current) window.clearTimeout(saveTimer.current)
    await handleSave()
    router.push('/dashboard')
  }

  async function handleSave() {
    setSaving(true)

    try {
      const flowObject = toObject()

      const result = await saveDiagramAction({
        projectId,
        flowJson: flowObject,
      })

      if (result.error) {
        toast.error(result.error)
        return
      }

      setSavedLabel(
        `Guardado ${new Date().toLocaleTimeString('es-PE', {
          hour: '2-digit',
          minute: '2-digit',
        })}`
      )

      toast.success('Diagrama guardado correctamente')
    } catch {
      toast.error('No se pudo guardar el diagrama')
    } finally {
      setSaving(false)
    }
  }

  async function handleRefresh() {
    if (!activeConnection) {
      toast.error('Conecta la base de datos de origen antes de actualizar.')
      return
    }
    setRefreshing(true)
    try {
      const refreshed = await diagramsAPI.refreshByProject(projectId, activeConnection)
      setNodesAndEdges(refreshed.flowJson.nodes ?? [], refreshed.flowJson.edges ?? [])
      setDialect(refreshed.dialect)
      setSqlValue(refreshed.sourceCode)
      window.requestAnimationFrame(() => void fitView({ duration: 350, padding: 0.24 }))
      toast.success('Diagrama actualizado desde la base de datos')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'No se pudo actualizar el diagrama')
    } finally {
      setRefreshing(false)
    }
  }

  async function handleRestore(versionId: string) {
    if (!window.confirm('Se perderán los cambios no guardados. ¿Restaurar esta versión?')) {
      return
    }

    const result = await restoreVersionAction(versionId, projectId)

    if (result.error) {
      toast.error(result.error)
      return
    }

    const flow = toFlowJson(result.data?.flowJson)
    const nextDialect = (result.data?.activeDialect as EditorDialect) || 'postgresql'

    useEditorStore.getState().setSyncPaused(true)
    setNodesAndEdges(flow.nodes ?? [], flow.edges ?? [])
    setDialect(nextDialect)
    setSqlValue(result.data?.sqlContent ?? '')

    window.requestAnimationFrame(() => {
      if (flow.viewport) {
        void setViewport(flow.viewport, { duration: 250 })
      } else {
        void fitView({ duration: 350, padding: 0.24 })
      }
    })

    toast.success(`Versión v${result.data?.versionNumber || '?'} restaurada`)
  }

  function handleCompare(versionId: string) {
    setDiffModal({ open: true, initialVersionId: versionId })
  }

  useEffect(() => {
    // Lock global scrollbar specifically for the editor
    const originalBodyOverflow = document.body.style.overflow
    const originalHtmlOverflow = document.documentElement.style.overflow
    document.body.style.overflow = 'hidden'
    document.documentElement.style.overflow = 'hidden'

    return () => {
      document.body.style.overflow = originalBodyOverflow
      document.documentElement.style.overflow = originalHtmlOverflow
    }
  }, [])

  return (
    <div
      className="flex h-full min-h-0 w-full overflow-hidden bg-[#07101F] text-white"
    >
      <aside className="flex w-14 shrink-0 flex-col items-center overflow-hidden border-r border-[#1E2A45] bg-[#0B1322] py-4">
        <Database className="mb-7 h-5 w-5 shrink-0 text-[#B6C7E3]" />

        <NavButton
          icon={Code2}
          active={showSqlPanel}
          label="Mostrar u ocultar SQL"
          onClick={() => setShowSqlPanel((value) => !value)}
        />

        <NavButton
          icon={PanelRight}
          active={showInspector}
          label="Mostrar u ocultar inspector"
          onClick={() => setShowInspector((value) => !value)}
        />

        <VersionHistorySheet projectId={projectId} onRestore={handleRestore} onCompare={handleCompare}>
          <NavButton icon={History} label="Historial" />
        </VersionHistorySheet>
      </aside>

      <main className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        <header className="relative z-[100] flex h-14 shrink-0 items-center gap-3 overflow-visible border-b border-[#1E2A45] bg-[#0B1322]/95 px-4 backdrop-blur">
          <button
            type="button"
            onClick={() => void handleBack()}
            className="rounded-lg p-2 text-[#94A3B8] hover:bg-[#111827] hover:text-white"
          >
            <ArrowLeft size={17} />
          </button>

          <span className="text-sm text-[#94A3B8]">Proyectos</span>
          <span className="text-[#334155]">/</span>
          <h1 className="max-w-52 truncate text-sm font-semibold">{projectName}</h1>

          <div className="mx-auto hidden shrink-0 rounded-xl border border-[#1E2A45] bg-[#0A0F1E] p-1 md:flex">
            {DIALECTS.filter(({ value }) => value === mode).map(({ value, label, icon: Icon }) => (
              <div
                key={value}
                className="flex items-center gap-1.5 rounded-lg bg-[#123A79] px-4 py-1.5 text-xs text-[#BFDBFE]"
              >
                <Icon size={13} />
                {label}
              </div>
            ))}
          </div>

          <div className="ml-auto flex shrink-0 items-center gap-2">
            <div className="hidden items-center gap-2 text-xs text-[#C7D2FE] lg:flex">
              <CheckCircle2 size={15} className="text-emerald-400" />
              {saving ? 'Guardando...' : savedLabel}
            </div>

            <PublicShareToggle
              diagramId={projectId}
              initialIsPublic={initialIsPublic}
              initialShareAccess={initialShareAccess}
            />

            <button
              type="button"
              onClick={handleRefresh}
              disabled={refreshing}
              className="inline-flex items-center gap-2 rounded-lg border border-[#1E2A45] px-3 py-2 text-xs text-[#BFDBFE] hover:bg-[#111827] disabled:opacity-50"
            >
              <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
              Actualizar desde BD
            </button>

            <ExportMenu projectName={projectName} />
          </div>
        </header>

        <section className="flex min-h-0 flex-1 overflow-hidden">
          {showSqlPanel && (
            <>
              <div
                style={{ width: sqlWidth }}
                className="flex min-h-0 min-w-0 shrink-0 flex-col overflow-hidden border-r border-[#1E2A45] bg-[#0B1322]"
              >
                <div className="min-h-0 flex-1 overflow-hidden">
                  <EditorPanel mode={mode} />
                </div>

                <div className="shrink-0 border-t border-[#1E2A45] bg-[#0D1424] p-3">
                  <div
                    className={`rounded-xl border p-3 text-sm ${stats.warnings
                        ? 'border-amber-500/30 bg-amber-500/10 text-amber-200'
                        : 'border-emerald-500/30 bg-emerald-500/10 text-emerald-200'
                      }`}
                  >
                    <CheckCircle2 className="mr-2 inline h-4 w-4" />
                    {stats.warnings
                      ? `${stats.warnings} advertencia(s) por revisar.`
                      : 'Todo listo. No se encontraron errores.'}
                    <span className="ml-2 text-xs text-[#94A3B8]">
                      {stats.tables} tablas · {stats.relations} relaciones
                    </span>
                  </div>
                </div>
              </div>

              <div
                className="z-50 -ml-1.5 w-1.5 shrink-0 cursor-col-resize transition-colors hover:bg-[#1A6CF6] active:bg-[#1A6CF6]"
                onMouseDown={() => {
                  resizeTarget.current = 'sql'
                  document.body.style.cursor = 'col-resize'
                }}
              />
            </>
          )}

          <div className="relative flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
            <div className="absolute left-5 top-5 z-10 grid grid-cols-3 gap-2">
              <Metric label="Tablas" value={stats.tables} />
              <Metric label="Relaciones" value={stats.relations} />
              <Metric label="Advertencias" value={stats.warnings} />
            </div>

            <div className="min-h-0 flex-1 overflow-hidden">
              <Canvas projectId={projectId} emitNodeMove={undefined} onSave={handleSave} />
            </div>
          </div>

          {showInspector && (
            <>
              <div
                className="z-50 -mr-1.5 w-1.5 shrink-0 cursor-col-resize transition-colors hover:bg-[#1A6CF6] active:bg-[#1A6CF6]"
                onMouseDown={() => {
                  resizeTarget.current = 'inspector'
                  document.body.style.cursor = 'col-resize'
                }}
              />

              <div
                style={{ width: inspectorWidth }}
                className="flex min-h-0 shrink-0 flex-col overflow-hidden border-l border-[#1E2A45] bg-[#0B1322]"
              >
                <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden">
                  <SchemaInspector projectId={projectId} />
                </div>
              </div>
            </>
          )}
        </section>
      </main>

      <DiffViewerModal
        open={diffModal?.open ?? false}
        onClose={() => setDiffModal(null)}
        projectId={projectId}
        initialVersionId={diffModal?.initialVersionId}
      />
    </div>
  )
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-[#1E2A45] bg-[#0D1424]/90 px-4 py-2 shadow-xl shadow-black/20 backdrop-blur">
      <div className="text-lg font-semibold text-white">{value}</div>
      <div className="text-[11px] text-[#94A3B8]">{label}</div>
    </div>
  )
}

export const NavButton = forwardRef<
  HTMLButtonElement,
  {
    icon: ElementType
    label: string
    active?: boolean
    onClick?: () => void
  }
>(({ icon: Icon, label, active = false, onClick, ...props }, ref) => {
  return (
    <button
      ref={ref}
      type="button"
      onClick={onClick}
      title={label}
      aria-label={label}
      className={`mb-2 rounded-xl p-3 transition ${active
          ? 'bg-[#1A6CF6] text-white shadow-lg shadow-[#1A6CF6]/30'
          : 'text-[#64748B] hover:bg-[#111827] hover:text-white'
        }`}
      {...props}
    >
      <Icon size={18} />
    </button>
  )
})

NavButton.displayName = 'NavButton'

export function EditorLayout(props: EditorLayoutProps) {
  return (
    <ReactFlowProvider>
      <EditorLayoutInner {...props} />
    </ReactFlowProvider>
  )
}
