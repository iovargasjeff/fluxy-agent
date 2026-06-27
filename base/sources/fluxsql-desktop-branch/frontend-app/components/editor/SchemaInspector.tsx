'use client'

import { useEffect, useState } from 'react'
import { ChevronLeft, ChevronRight, Database, KeyRound, Link2, RefreshCw, Rows3, TableProperties } from 'lucide-react'
import { useEditorStore } from '@/store/useEditorStore'
import { isEditorNode, type EditorNode } from '@/lib/editor-schema'
import { useConnectionStore } from '@/lib/store/useConnectionStore'
import { diagramsAPI } from '@/lib/api/client'

interface TableRows {
  columns: string[]
  rows: unknown[][]
  page: number
  page_size: number
  total_rows: number
  total_pages: number
}

export function SchemaInspector({ projectId }: { projectId: string }) {
  const nodes = useEditorStore((state) => state.nodes)
  const selectedNodeId = useEditorStore((state) => state.selectedNodeId)
  const setSelectedNodeId = useEditorStore((state) => state.setSelectedNodeId)
  const activeConnection = useConnectionStore((state) => state.activeConnection)
  const tables = nodes.filter(isEditorNode)
  const selected = tables.find((node) => node.id === selectedNodeId) ?? tables[0]
  const selectedTableName = selected?.data.tableName
  const [tab, setTab] = useState<'schema' | 'data'>('schema')
  const [page, setPage] = useState(1)
  const [reload, setReload] = useState(0)
  const [tableRows, setTableRows] = useState<TableRows | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Reset pagination when the user selects another table on the canvas.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPage(1)
    setTableRows(null)
    setError(null)
  }, [selectedTableName])

  useEffect(() => {
    if (tab !== 'data' || !selectedTableName || !activeConnection) return
    let cancelled = false
    const connection = activeConnection

    async function loadRows() {
      setLoading(true)
      setError(null)
      try {
        const result = await diagramsAPI.previewTable(projectId, selectedTableName, connection, page)
        if (!cancelled) setTableRows(result)
      } catch (cause) {
        if (!cancelled) {
          setError(cause instanceof Error ? cause.message : 'No se pudieron cargar los registros.')
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    void loadRows()
    return () => {
      cancelled = true
    }
  }, [activeConnection, page, projectId, reload, selectedTableName, tab])

  if (!selected) {
    return <p className="p-4 text-sm text-[#94A3B8]">No hay tablas en este diagrama.</p>
  }

  return (
    <aside className="flex h-full min-h-0 flex-col bg-[#0D1424] text-white">
      <div className="shrink-0 border-b border-[#1E2A45] p-4">
        <p className="text-xs uppercase tracking-[0.18em] text-[#64748B]">Explorador de tabla</p>
        <select
          value={selected.id}
          onChange={(event) => setSelectedNodeId(event.target.value)}
          className="mt-3 w-full rounded-lg border border-[#1E2A45] bg-[#111827] px-3 py-2 text-sm font-semibold"
        >
          {tables.map((table) => <option key={table.id} value={table.id}>{table.data.tableName}</option>)}
        </select>

        <div className="mt-3 grid grid-cols-2 rounded-lg border border-[#1E2A45] bg-[#0A0F1E] p-1">
          <TabButton active={tab === 'schema'} icon={TableProperties} label="Estructura" onClick={() => setTab('schema')} />
          <TabButton active={tab === 'data'} icon={Rows3} label="Datos" onClick={() => setTab('data')} />
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-auto">
        {tab === 'schema' ? (
          <SchemaView selected={selected} />
        ) : (
          <DataView
            tableName={selected.data.tableName}
            data={tableRows}
            loading={loading}
            error={error}
            hasConnection={Boolean(activeConnection)}
            onRetry={() => {
              setTableRows(null)
              setReload((current) => current + 1)
            }}
          />
        )}
      </div>

      {tab === 'data' && tableRows && (
        <div className="flex shrink-0 items-center justify-between border-t border-[#1E2A45] bg-[#0B1322] px-3 py-2 text-xs">
          <span className="text-[#94A3B8]">{tableRows.total_rows.toLocaleString()} registros</span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={page <= 1 || loading}
              onClick={() => setPage((current) => Math.max(1, current - 1))}
              className="rounded-md border border-[#1E2A45] p-1.5 text-[#BFDBFE] disabled:opacity-30"
            >
              <ChevronLeft size={14} />
            </button>
            <span className="min-w-16 text-center text-[#CBD5E1]">{page} / {tableRows.total_pages}</span>
            <button
              type="button"
              disabled={page >= tableRows.total_pages || loading}
              onClick={() => setPage((current) => current + 1)}
              className="rounded-md border border-[#1E2A45] p-1.5 text-[#BFDBFE] disabled:opacity-30"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}
    </aside>
  )
}

function SchemaView({ selected }: { selected: EditorNode }) {
  return (
    <div className="p-4">
      <div className="flex items-center gap-2 rounded-lg border border-[#1A6CF6]/25 bg-[#1A6CF6]/10 p-3 text-xs text-[#BFDBFE]">
        <Database size={15} />
        La estructura proviene de la base de datos y es de solo lectura.
      </div>

      <div className="mt-4 space-y-2">
        {selected.data.columns.map((column) => (
          <div key={String(column.name)} className="rounded-lg border border-[#1E2A45] bg-[#111827]/80 p-3">
            <div className="flex items-center gap-2">
              {column.isPrimaryKey && <KeyRound size={13} className="shrink-0 text-amber-300" />}
              {column.isForeignKey && <Link2 size={13} className="shrink-0 text-blue-300" />}
              <span className="truncate font-mono text-xs font-semibold text-white">{String(column.name)}</span>
              <span className="ml-auto shrink-0 font-mono text-[11px] text-[#94A3B8]">{String(column.type)}</span>
            </div>
            <div className="mt-2 text-[11px] text-[#64748B]">
              {column.nullable === false ? 'NOT NULL' : 'NULL'}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function DataView({
  tableName,
  data,
  loading,
  error,
  hasConnection,
  onRetry,
}: {
  tableName: string
  data: TableRows | null
  loading: boolean
  error: string | null
  hasConnection: boolean
  onRetry: () => void
}) {
  if (!hasConnection) {
    return <EmptyState text="Conecta la base de datos de origen para consultar sus registros." />
  }
  if (loading && !data) {
    return <EmptyState text={`Consultando ${tableName}...`} spinning />
  }
  if (error) {
    return (
      <div className="flex min-h-52 flex-col items-center justify-center gap-3 p-5 text-center">
        <p className="text-xs leading-5 text-red-300">{error}</p>
        <button type="button" onClick={onRetry} className="rounded-lg bg-[#1A6CF6] px-3 py-2 text-xs font-medium">
          Reintentar
        </button>
      </div>
    )
  }
  if (!data || data.rows.length === 0) {
    return <EmptyState text="La tabla no contiene registros." />
  }

  return (
    <table className="min-w-full border-separate border-spacing-0 text-left text-xs">
      <thead className="sticky top-0 z-10 bg-[#111827]">
        <tr>
          {data.columns.map((column) => (
            <th key={column} className="whitespace-nowrap border-b border-r border-[#1E2A45] px-3 py-2 font-semibold text-[#BFDBFE]">
              {column}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.rows.map((row, rowIndex) => (
          <tr key={rowIndex} className="odd:bg-[#0D1424] even:bg-[#111827]/60 hover:bg-[#123A79]/30">
            {row.map((value, columnIndex) => (
              <td key={columnIndex} title={formatValue(value)} className="max-w-52 truncate whitespace-nowrap border-b border-r border-[#1E2A45]/70 px-3 py-2 font-mono text-[#CBD5E1]">
                {formatValue(value)}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  )
}

function EmptyState({ text, spinning = false }: { text: string; spinning?: boolean }) {
  return (
    <div className="flex min-h-52 flex-col items-center justify-center gap-3 p-5 text-center text-xs text-[#94A3B8]">
      {spinning ? <RefreshCw size={18} className="animate-spin text-[#60A5FA]" /> : <Rows3 size={18} className="text-[#64748B]" />}
      {text}
    </div>
  )
}

function TabButton({ active, icon: Icon, label, onClick }: { active: boolean; icon: React.ElementType; label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center justify-center gap-2 rounded-md px-2 py-2 text-xs font-medium ${active ? 'bg-[#123A79] text-[#BFDBFE]' : 'text-[#64748B] hover:text-white'}`}
    >
      <Icon size={14} />
      {label}
    </button>
  )
}

function formatValue(value: unknown) {
  if (value === null || value === undefined) return 'NULL'
  if (typeof value === 'object') return JSON.stringify(value)
  return String(value)
}
