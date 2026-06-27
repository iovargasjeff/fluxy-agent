'use client'

import { ChevronLeft, ChevronRight, Database, X } from 'lucide-react'

export interface DatabaseRows {
  table_name: string
  columns: string[]
  rows: unknown[][]
  page: number
  page_size: number
  total_rows: number
  total_pages: number
}

export function DatabaseRowsPanel({
  data, loading, error, onPageChange, onClose,
}: {
  data: DatabaseRows | null
  loading: boolean
  error: string | null
  onPageChange: (page: number) => void
  onClose: () => void
}) {
  if (!data && !loading && !error) return null

  return (
    <section className="overflow-hidden rounded-xl border border-blue-500/25 bg-gray-900">
      <header className="flex items-center justify-between border-b border-gray-800 px-5 py-4">
        <div className="flex items-center gap-3">
          <Database className="h-5 w-5 text-blue-400" />
          <div>
            <h2 className="font-semibold text-white">{data?.table_name ?? 'Datos actuales'}</h2>
            <p className="text-xs text-gray-400">Registros reales de la base de datos, solo lectura</p>
          </div>
        </div>
        <button type="button" onClick={onClose} className="rounded-lg p-2 text-gray-400 hover:bg-gray-800 hover:text-white"><X size={16} /></button>
      </header>

      <div className="max-h-[430px] min-h-44 overflow-auto">
        {loading && !data ? (
          <div className="flex min-h-44 items-center justify-center gap-3 text-sm text-blue-300">
            <span className="h-5 w-5 animate-spin rounded-full border-2 border-blue-400 border-t-transparent" />
            Consultando registros...
          </div>
        ) : error ? (
          <div className="flex min-h-44 items-center justify-center p-6 text-center text-sm text-red-300">{error}</div>
        ) : data?.rows.length === 0 ? (
          <div className="flex min-h-44 items-center justify-center text-sm text-gray-400">La tabla no contiene registros.</div>
        ) : data ? (
          <table className="min-w-full border-separate border-spacing-0 text-left text-xs">
            <thead className="sticky top-0 z-10 bg-gray-800">
              <tr>{data.columns.map((column) => <th key={column} className="whitespace-nowrap border-b border-r border-gray-700 px-4 py-3 font-semibold text-blue-200">{column}</th>)}</tr>
            </thead>
            <tbody>
              {data.rows.map((row, rowIndex) => (
                <tr key={rowIndex} className="odd:bg-gray-950 even:bg-gray-900 hover:bg-blue-950/40">
                  {row.map((value, columnIndex) => <td key={columnIndex} title={formatValue(value)} className="max-w-64 truncate whitespace-nowrap border-b border-r border-gray-800 px-4 py-2.5 font-mono text-gray-300">{formatValue(value)}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        ) : null}
      </div>

      {data && (
        <footer className="flex items-center justify-between border-t border-gray-800 bg-gray-950 px-5 py-3 text-xs">
          <span className="text-gray-400">{data.total_rows.toLocaleString()} registros</span>
          <div className="flex items-center gap-3">
            <button type="button" disabled={data.page <= 1 || loading} onClick={() => onPageChange(data.page - 1)} className="rounded-md border border-gray-700 p-1.5 text-blue-300 disabled:opacity-30"><ChevronLeft size={14} /></button>
            <span className="text-gray-300">Página {data.page} de {data.total_pages}</span>
            <button type="button" disabled={data.page >= data.total_pages || loading} onClick={() => onPageChange(data.page + 1)} className="rounded-md border border-gray-700 p-1.5 text-blue-300 disabled:opacity-30"><ChevronRight size={14} /></button>
          </div>
        </footer>
      )}
    </section>
  )
}

function formatValue(value: unknown) {
  if (value === null || value === undefined) return 'NULL'
  if (typeof value === 'object') return JSON.stringify(value)
  return String(value)
}
