'use client'

import { Handle, Position, type NodeProps } from '@xyflow/react'
import { FileJson, Hash, Link } from 'lucide-react'

interface Column {
  name: string
  type: string
  isPrimaryKey?: boolean
  isForeignKey?: boolean
}

export interface NoSqlNodeData extends Record<string, unknown> {
  tableName: string
  columns: Column[]
  color?: string
  engineFamily?: 'nosql'
}

export function NoSqlNode({ data }: NodeProps) {
  const { tableName, columns: rawCols, color } = data as NoSqlNodeData
  const columns: Column[] = Array.isArray(rawCols) ? rawCols : []
  // Greenish default for NoSQL (MongoDB), or Neo4j blue
  const accent = color ?? '#10B981'

  return (
    <div className="min-w-[240px] overflow-hidden rounded-2xl border border-[#1E2A45] bg-[#0B1322] shadow-2xl shadow-black/40 backdrop-blur">
      <div className="px-4 py-2.5 flex items-center justify-between" style={{ background: `linear-gradient(135deg, ${accent}, #059669)` }}>
        <span className="flex items-center gap-2 truncate text-sm font-bold tracking-wide text-white drop-shadow-md">
          <FileJson size={16} className="opacity-90" />
          {tableName}
        </span>
        <span className="text-[10px] font-mono font-medium text-white/80 bg-black/20 px-1.5 py-0.5 rounded">
          Documento
        </span>
      </div>

      <div className="divide-y divide-[#1E2A45]/50 bg-[#0B1322] p-1">
        {columns.length === 0 ? (
          <div className="px-3 py-3 text-center text-[#64748B] text-xs italic">Sin propiedades</div>
        ) : (
          columns.map((col, idx) => (
            <div key={idx} className="relative flex items-center gap-2.5 px-3 py-2 group hover:bg-[#111827] rounded-md transition-colors">
              {/* Left handle (target) — hidden until hover */}
              <Handle
                type="target"
                position={Position.Left}
                id={`${col.name}-target`}
                className="!w-2.5 !h-2.5 !bg-[#10B981] !border-2 !border-[#0B1322] opacity-0 group-hover:opacity-100 transition-all"
                style={{ top: '50%', left: '-6px' }}
              />

              {col.isPrimaryKey ? (
                <Hash size={13} className="text-[#F59E0B] shrink-0" />
              ) : col.isForeignKey ? (
                <Link size={13} className="text-[#3B82F6] shrink-0" />
              ) : (
                <div className="w-1.5 h-1.5 rounded-full bg-[#334155] shrink-0 ml-1" />
              )}

              {/* Column name */}
              <span className="text-[#E2E8F0] text-xs flex-1 truncate font-medium">
                {col.name}
              </span>

              <span className="text-[#64748B] text-[10px] shrink-0 font-mono bg-[#0F172A] px-1.5 py-0.5 rounded border border-[#1E2A45]">
                {col.type}
              </span>

              {/* Right handle (source) — hidden until hover */}
              <Handle
                type="source"
                position={Position.Right}
                id={`${col.name}-source`}
                className="!w-2.5 !h-2.5 !bg-[#3B82F6] !border-2 !border-[#0B1322] opacity-0 group-hover:opacity-100 transition-all"
                style={{ top: '50%', right: '-6px' }}
              />
            </div>
          ))
        )}
      </div>
    </div>
  )
}
