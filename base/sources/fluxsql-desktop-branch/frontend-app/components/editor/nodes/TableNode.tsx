'use client'

import { Handle, Position, type NodeProps } from '@xyflow/react'
import { KeyRound, Link, Table2 } from 'lucide-react'

interface Column {
  name: string
  type: string
  isPrimaryKey?: boolean
  isForeignKey?: boolean
}

export interface TableNodeData extends Record<string, unknown> {
  tableName: string
  columns: Column[]
  color?: string
}

export function TableNode({ data }: NodeProps) {
  const { tableName, columns: rawCols, color } = data as TableNodeData
  const columns: Column[] = Array.isArray(rawCols) ? rawCols : []
  const accent = color ?? '#1A6CF6'

  return (
    <div className="min-w-[230px] overflow-hidden rounded-xl border border-[#243454] bg-[#0D1424]/95 shadow-2xl shadow-black/40 backdrop-blur">
      <div className="px-3 py-2" style={{ background: `linear-gradient(135deg, ${accent}, #0F5BEA)` }}>
        <span className="flex items-center gap-2 truncate text-sm font-semibold tracking-wide text-white">
          <Table2 size={14} />
          {tableName}
        </span>
      </div>

      <div className="divide-y divide-[#1E2A45] bg-gradient-to-b from-[#111827] to-[#0B1220]">
        {columns.length === 0 ? (
          <div className="px-3 py-2 text-[#6B7280] text-xs italic">Sin columnas</div>
        ) : (
          columns.map((col, idx) => (
            <div key={idx} className="relative flex items-center gap-2 px-3 py-1.5 group">
              {/* Left handle (target) — hidden until hover */}
              <Handle
                type="target"
                position={Position.Left}
                id={`${col.name}-target`}
                className="!w-2 !h-2 !bg-[#1A6CF6] !border-0 opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ top: '50%' }}
              />

              {/* PK / FK icon */}
              {col.isPrimaryKey ? (
                <KeyRound size={12} className="text-yellow-400 shrink-0" />
              ) : col.isForeignKey ? (
                <Link size={12} className="text-[#6B7280] shrink-0" />
              ) : (
                <span className="w-3 shrink-0" />
              )}

              {/* Column name */}
              <span className="text-[#E5E7EB] text-xs flex-1 truncate">{col.name}</span>

              <span className="text-[#6B7280] text-xs shrink-0 font-mono">{col.type}</span>

              {/* Right handle (source) — hidden until hover */}
              <Handle
                type="source"
                position={Position.Right}
                id={`${col.name}-source`}
                className="!w-2 !h-2 !bg-[#00D4FF] !border-0 opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ top: '50%' }}
              />
            </div>
          ))
        )}
      </div>
    </div>
  )
}
