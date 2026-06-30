'use client'

import { useEffect, useState, type ElementType } from 'react'
import { ReactFlowProvider, useReactFlow, type Edge, type Node } from '@xyflow/react'
import { ArrowLeft, Braces, CheckCircle2, Code2, Database, DatabaseZap, FileJson, GitBranch, LayoutGrid, PanelRight, Play, Plus, Save, History } from 'lucide-react'
import { toast } from 'sonner'
import { Canvas } from './Canvas'
import { EditorPanel } from './EditorPanel'
import { Neo4jSidebar } from './Neo4jSidebar'
import { Neo4jCommandBar } from './Neo4jCommandBar'
import { EditorInspector } from './EditorInspector'
import { ExportMenu } from './ExportMenu'
import { CommitModal } from './CommitModal'
import { VersionHistorySheet } from './VersionHistorySheet'
import { PublicShareToggle } from './PublicShareToggle'
import { PresenceToolbar } from './PresenceToolbar'
import { DiffViewerModal } from './DiffViewerModal'
import { CollaboratorCursors } from './CollaboratorCursors'
import { ThemeToggle } from '@/components/ThemeToggle'
import { useEditorStore } from '@/store/useEditorStore'
import { useCollaboratorCursors } from '@/hooks/useCollaboratorCursors'
import { useRealtimeSync } from '@/hooks/useRealtimeSync'
import { saveDiagramAction } from '@/lib/backend/actions/diagrams/save'
import { restoreVersionAction } from '@/lib/backend/actions/versions/restore'
import { getVersionDetailAction } from '@/lib/backend/actions/versions/detail'
import { getSchemaStats, type EditorDialect } from '@/lib/editor-schema'
import { toFlowJson } from '@/lib/flow-types'

interface EditorLayoutProps {
  projectName: string
  projectId: string
  initialSQL?: string
  initialNodes?: Node[]
  initialEdges?: Edge[]
  dialect?: string
  engineFamily: 'sql' | 'nosql'
  currentUser: { id: string, name: string }
  initialIsPublic?: boolean
  initialShareAccess?: 'view' | 'edit'
}

const DIALECTS: Array<{ value: EditorDialect; label: string; icon: ElementType; family: 'sql' | 'nosql' }> = [
  { value: 'postgresql', label: 'PostgreSQL', icon: Database, family: 'sql' },
  { value: 'mysql', label: 'MySQL', icon: Database, family: 'sql' },
  { value: 'sqlserver', label: 'SQL Server', icon: Database, family: 'sql' },
  { value: 'json', label: 'JSON', icon: FileJson, family: 'nosql' },
  { value: 'mongodb', label: 'MongoDB', icon: Database, family: 'nosql' },
  { value: 'neo4j', label: 'Neo4j', icon: Database, family: 'nosql' },
]

function EditorLayoutInner({
  projectName,
  projectId,
  initialSQL,
  initialNodes = [],
  initialEdges = [],
  dialect = 'postgresql',
  engineFamily,
  currentUser,
  initialIsPublic = false,
  initialShareAccess = 'view'
}: EditorLayoutProps) {
  const { toObject, fitView } = useReactFlow()
  const nodes = useEditorStore((state) => state.nodes)
  const edges = useEditorStore((state) => state.edges)
  const sqlValue = useEditorStore((state) => state.sqlValue)
  const mode = useEditorStore((state) => state.dialect)
  const setDialect = useEditorStore((state) => state.setDialect)
  const setSqlValue = useEditorStore((state) => state.setSqlValue)
  const setNodesAndEdges = useEditorStore((state) => state.setNodesAndEdges)
  const addTable = useEditorStore((state) => state.addTable)
  const syncSqlFromCanvas = useEditorStore((state) => state.syncSqlFromCanvas)
  const [saving, setSaving] = useState(false)
  const [savedLabel, setSavedLabel] = useState('Listo para editar')
  const [showSqlPanel, setShowSqlPanel] = useState(true)
  const [showInspector, setShowInspector] = useState(true)
  const [diffModal, setDiffModal] = useState<{ open: boolean; originalCode: string; modifiedCode: string; versionLabel: string } | null>(null)

  const { cursors, handleMouseMove } = useCollaboratorCursors(projectId, currentUser.id, currentUser.name)
  const { emitNodeMove, emitSqlChange, consumeRemoteSchemaUpdate } = useRealtimeSync(projectId, currentUser.id)
  const stats = getSchemaStats(nodes, edges)

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    setDialect((dialect as EditorDialect) || 'postgresql')
    if (initialSQL) setSqlValue(initialSQL)
    if (initialNodes.length > 0) setNodesAndEdges(initialNodes, initialEdges)
    
    return () => {
      document.body.style.overflow = ''
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (nodes.length === 0) return
    if (consumeRemoteSchemaUpdate()) return

    const timeout = window.setTimeout(() => {
      emitSqlChange(nodes, edges)
    }, 350)

    return () => window.clearTimeout(timeout)
  }, [nodes, edges, emitSqlChange, consumeRemoteSchemaUpdate])

  async function handleSave() {
    setSaving(true)
    try {
      const flowObject = toObject()
      const result = await saveDiagramAction({
        projectId,
        sqlContent: sqlValue,
        flowJson: flowObject,
        dialect: mode,
      })

      if (result.error) {
        toast.error(result.error)
        return
      }

      setSavedLabel(`Guardado ${new Date().toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })}`)
      toast.success('Diagrama guardado correctamente')
    } catch {
      toast.error('No se pudo guardar el diagrama')
    } finally {
      setSaving(false)
    }
  }

  async function handleRestore(versionId: string) {
    if (!window.confirm('Se perderán los cambios no guardados. ¿Restaurar esta versión?')) return

    const result = await restoreVersionAction(versionId, projectId)
    if (result.error) {
      toast.error(result.error)
      return
    }

    const flow = toFlowJson(result.flowJson)
    setSqlValue(result.sqlContent ?? '')
    setNodesAndEdges(flow.nodes ?? [], flow.edges ?? [])
    toast.success(`Versión v${result.versionNumber} restaurada`)
  }

  async function handleCompare(versionId: string, versionNumber: number) {
    const result = await getVersionDetailAction(versionId)
    if (result.error || !result.data) {
      toast.error(result.error ?? 'No se pudo cargar la versión')
      return
    }

    setDiffModal({
      open: true,
      originalCode: result.data.sqlContent ?? '',
      modifiedCode: sqlValue,
      versionLabel: `v${versionNumber} vs actual`,
    })
  }

  function handleValidate() {
    if (stats.warnings > 0) {
      toast.warning(`Hay ${stats.warnings} advertencia(s): revisa claves primarias o tablas vacías.`)
      return
    }
    toast.success('Todo listo. No se encontraron errores.')
  }

  function focusRelations() {
    useEditorStore.getState().setHoveredNodeId(null)
    fitView({ duration: 350, padding: 0.24 })
    toast.info('Mostrando todas las relaciones del diagrama.')
  }

  // Neo4j uses a fixed layout: [300px sidebar | flex-1 canvas area | 300px inspector]
  // Other editors use the original responsive grid
  const isNeo4j = mode === 'neo4j'
  const editorGridClass = isNeo4j
    ? (showInspector ? 'grid-cols-[280px_1fr_300px]' : 'grid-cols-[280px_1fr]')
    : showSqlPanel && showInspector
      ? 'grid-cols-[34%_1fr_320px]'
      : showSqlPanel
        ? 'grid-cols-[34%_1fr]'
        : showInspector
          ? 'grid-cols-[1fr_320px]'
          : 'grid-cols-[1fr]'

  return (
    <div className="flex h-full w-full flex-1 overflow-hidden bg-white text-slate-950 dark:bg-[#0F172A] dark:text-white" onMouseMove={handleMouseMove}>
      <aside className="flex w-14 shrink-0 flex-col items-center border-r border-slate-200 bg-white py-4 dark:border-[#334155] dark:bg-[#1E293B]">
        <Database className="mb-7 h-5 w-5 text-slate-500 dark:text-[#94A3B8]" />
        <NavButton icon={Code2} active={showSqlPanel} label="Mostrar u ocultar SQL" onClick={() => setShowSqlPanel((value) => !value)} />
        <NavButton icon={PanelRight} active={showInspector} label="Mostrar u ocultar inspector" onClick={() => setShowInspector((value) => !value)} />
        
        <VersionHistorySheet projectId={projectId} onRestore={handleRestore} onCompare={handleCompare}>
          <button
            type="button"
            title="Historial de versiones"
            className="mb-2 rounded-xl p-3 text-slate-500 transition hover:bg-blue-50 hover:text-[#1A6CF6] dark:text-[#64748B] dark:hover:bg-[#111827] dark:hover:text-white"
          >
            <History size={18} />
          </button>
        </VersionHistorySheet>
      </aside>

      <main className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-14 shrink-0 items-center gap-3 border-b border-slate-200 bg-white/95 px-4 backdrop-blur dark:border-[#334155] dark:bg-[#1E293B]/95">
          <a href="/dashboard" className="rounded-lg p-2 text-slate-500 hover:bg-blue-50 hover:text-[#1A6CF6] dark:text-[#94A3B8] dark:hover:bg-[#334155] dark:hover:text-white">
            <ArrowLeft size={17} />
          </a>
          <span className="text-sm text-slate-500 dark:text-[#94A3B8]">Proyectos</span>
          <span className="text-slate-300 dark:text-[#334155]">/</span>
          <h1 className="max-w-52 truncate text-sm font-semibold">{projectName}</h1>

          <div className="mx-auto flex items-center gap-3">
            <div className="flex rounded-xl border border-slate-200 bg-slate-50 p-1 dark:border-[#334155] dark:bg-[#0F172A]">
              {DIALECTS.filter(d => d.family === engineFamily).map(({ value, label, icon: Icon }) => (
                <button
                  key={value}
                  onClick={() => setDialect(value)}
                  className={`flex items-center gap-1.5 rounded-lg px-4 py-1.5 text-xs font-medium transition ${mode === value ? 'bg-[#1A6CF6] text-white dark:bg-[#123A79] dark:text-[#BFDBFE]' : 'text-slate-500 hover:text-slate-950 dark:text-[#64748B] dark:hover:text-white'}`}
                >
                  <Icon size={13} />
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="hidden items-center gap-2 text-xs text-slate-500 dark:text-[#C7D2FE] lg:flex">
            <CheckCircle2 size={15} className="text-emerald-400" />
            {saving ? 'Guardando...' : savedLabel}
          </div>
          <PresenceToolbar projectId={projectId} currentUser={currentUser} />
          <PublicShareToggle diagramId={projectId} initialIsPublic={initialIsPublic} initialShareAccess={initialShareAccess} />
          <CommitModal projectId={projectId} />
          <button
            type="button"
            onClick={() => toast.info('El generador de datos estara disponible desde Fluxy Desktop para insertar datos en una conexion local.')}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-600 hover:bg-blue-50 hover:text-[#1A6CF6] dark:border-[#334155] dark:text-[#BFDBFE] dark:hover:bg-[#111827]"
          >
            <DatabaseZap size={14} />
            Generar datos
          </button>
          <ExportMenu projectName={projectName} />
          <ThemeToggle />
        </header>

        <section className={`grid min-h-0 flex-1 ${editorGridClass}`}>

          {/* ── NEO4J LAYOUT: Database Info | Command Bar + Canvas | Inspector ── */}
          {isNeo4j ? (
            <>
              {/* Left: Database Information panel */}
              <Neo4jSidebar />

              {/* Center: Cypher command bar on TOP + Graph canvas BELOW */}
              <div className="flex min-h-0 min-w-0 flex-1 flex-col bg-white dark:bg-[#0F172A]">
                {/* Command bar with Monaco Cypher editor */}
                <Neo4jCommandBar emitSqlChange={emitSqlChange} />

                {/* Graph canvas — occupies the remaining vertical space */}
                <div className="relative min-h-0 flex-1">
                  <Canvas emitNodeMove={emitNodeMove} projectId={projectId} onSave={handleSave} />
                </div>
              </div>

              {/* Right: Neo4j Inspector (Property Keys) */}
              {showInspector && <EditorInspector />}
            </>
          ) : (
            /* ── ALL OTHER DIALECTS: original 3-column layout ── */
            <>
              {showSqlPanel && (
                <div className="flex h-full min-w-0 flex-col border-r border-slate-200 bg-white dark:border-[#1E2A45] dark:bg-[#0B1322]">
                  <div className="flex h-11 shrink-0 items-center gap-2 border-b border-slate-200 px-3 dark:border-[#1E2A45]">
                    {mode !== 'mongodb' && (
                      <>
                        <button onClick={syncSqlFromCanvas} className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-600 hover:text-[#1A6CF6] dark:border-[#1E2A45] dark:bg-[#111827] dark:text-[#94A3B8] dark:hover:text-white">
                          Formatear
                        </button>
                        <button onClick={handleValidate} className="rounded-lg border border-emerald-500/20 bg-emerald-50 px-3 py-1.5 text-xs text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">
                          Validar
                        </button>
                      </>
                    )}
                    <button onClick={() => toast.info('El editor ya sincroniza el esquema en vivo.')} className="rounded-lg bg-[#1A6CF6] px-3 py-1.5 text-xs text-white dark:bg-[#123A79] dark:text-[#BFDBFE]">
                      <Play className="mr-1 inline h-3 w-3" />
                      Ejecutar
                    </button>
                    <button onClick={addTable} className="ml-auto rounded-lg border border-[#1E2A45] p-1.5 text-[#94A3B8] hover:text-white" title={engineFamily === 'nosql' ? 'Agregar Colección' : 'Agregar tabla visual'}>
                      <Plus size={15} />
                    </button>
                  </div>
                  <div className="flex-1 min-h-0">
                    <EditorPanel mode={mode} emitSqlChange={emitSqlChange} />
                  </div>
                  <div className="shrink-0 border-t border-slate-200 bg-slate-50 p-3 dark:border-[#1E2A45] dark:bg-[#0D1424]">
                    <div className={`rounded-xl border p-3 text-sm ${stats.warnings ? 'border-amber-500/30 bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-200' : 'border-emerald-500/30 bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-200'}`}>
                      <CheckCircle2 className="mr-2 inline h-4 w-4" />
                      {stats.warnings ? `${stats.warnings} advertencia(s) por revisar.` : 'Todo listo. No se encontraron errores.'}
                      <span className="ml-2 text-xs text-[#94A3B8]">{stats.tables} tablas · {stats.relations} relaciones</span>
                    </div>
                  </div>
                </div>
              )}

              <div className="relative flex h-full min-w-0 flex-1 flex-col">
                <div className="absolute left-5 top-5 z-10 grid grid-cols-3 gap-2">
                  <Metric label="Tablas" value={stats.tables} />
                  <Metric label="Relaciones" value={stats.relations} />
                  <Metric label="Advertencias" value={stats.warnings} />
                </div>
                <Canvas emitNodeMove={emitNodeMove} projectId={projectId} onSave={handleSave} />
              </div>

              {showInspector && <EditorInspector />}
            </>
          )}
        </section>
      </main>

      <CollaboratorCursors cursors={cursors} />
      <DiffViewerModal
        open={diffModal?.open ?? false}
        onClose={() => setDiffModal(null)}
        originalCode={diffModal?.originalCode ?? ''}
        modifiedCode={diffModal?.modifiedCode ?? ''}
        versionLabel={diffModal?.versionLabel ?? ''}
      />
    </div>
  )
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white/90 px-4 py-2 shadow-xl shadow-slate-200/60 backdrop-blur dark:border-[#1E2A45] dark:bg-[#0D1424]/90 dark:shadow-black/20">
      <div className="text-lg font-semibold text-slate-950 dark:text-white">{value}</div>
      <div className="text-[11px] text-slate-500 dark:text-[#94A3B8]">{label}</div>
    </div>
  )
}

function NavButton({
  icon: Icon,
  label,
  active = false,
  onClick,
}: {
  icon: ElementType
  label: string
  active?: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={label}
      aria-label={label}
      className={`mb-2 rounded-xl p-3 transition ${active ? 'bg-[#1A6CF6] text-white shadow-lg shadow-[#1A6CF6]/30' : 'text-slate-500 hover:bg-blue-50 hover:text-[#1A6CF6] dark:text-[#64748B] dark:hover:bg-[#111827] dark:hover:text-white'}`}
    >
      <Icon size={18} />
    </button>
  )
}

export function EditorLayout(props: EditorLayoutProps) {
  return (
    <ReactFlowProvider>
      <EditorLayoutInner {...props} />
    </ReactFlowProvider>
  )
}
