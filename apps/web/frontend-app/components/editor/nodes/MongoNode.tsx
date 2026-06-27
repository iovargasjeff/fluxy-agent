'use client'

import { Handle, Position, type NodeProps } from '@xyflow/react'
import { Braces, Hash, Link } from 'lucide-react'

interface Column {
  name: string
  type: string
  isPrimaryKey?: boolean
  isForeignKey?: boolean
  isArray?: boolean
  subFields?: Column[]
}

export interface MongoNodeData extends Record<string, unknown> {
  tableName: string
  columns: Column[]
  color?: string
  isSubDocument?: boolean
  isArray?: boolean
}

function getTypeSymbol(type: string): string {
  const t = type.toLowerCase()
  if (t.includes('string') || t.includes('text')) return 't'
  if (t.includes('date') || t.includes('time')) return 'd'
  if (t.includes('number') || t.includes('int') || t.includes('float') || t.includes('double')) return '#'
  if (t.includes('array')) return '[ ]'
  if (t.includes('objectid') || t.includes('uuid')) return 'id'
  if (t.includes('bool')) return 'b'
  return 't'
}

export function MongoNode({ data }: NodeProps) {
  const { tableName, columns: rawCols, color, isSubDocument, isArray } = data as MongoNodeData
  const columns: Column[] = Array.isArray(rawCols) ? rawCols : []
  
  // Theme inspired by the reference image
  const headerBg = color ?? (isSubDocument ? '#374151' : '#1f2937')

  return (
    <div className="min-w-[180px] overflow-hidden rounded-lg bg-[#111827] shadow-xl text-sm font-sans border border-[#374151]">
      <div className="px-3 py-2 flex items-center justify-between" style={{ background: headerBg, borderBottom: '1px solid #374151' }}>
        <span className="text-white font-semibold text-[13px] tracking-wide truncate pr-2">
          {tableName}
        </span>
        {isSubDocument && (
          <span className="text-[#FBBF24] font-mono text-xs shrink-0">{isArray ? '[]' : '{}'}</span>
        )}
      </div>

      <div className="py-1.5 flex flex-col">
        {columns.length === 0 ? (
          <div className="text-[#6b7280] text-xs italic px-3 py-1">No fields</div>
        ) : (
          columns.map((col, idx) => {
            const typeSym = getTypeSymbol(col.type)
            return (
              <div key={idx} className="relative flex items-center justify-between px-3 py-1 hover:bg-[#1f2937] group">
                <Handle
                  type="target"
                  position={Position.Left}
                  id={`${col.name}-target`}
                  className="!w-2 !h-2 !bg-[#3B82F6] !border-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ left: '-4px' }}
                />

                <div className="flex items-center gap-1.5 overflow-hidden">
                  {col.isPrimaryKey ? (
                    <span className="text-[#FBBF24] shrink-0 text-xs font-bold leading-none select-none">🔑</span>
                  ) : col.isForeignKey ? (
                    <span className="text-[#3B82F6] shrink-0 text-xs font-bold leading-none select-none">🔗</span>
                  ) : (
                    <span className="w-3 shrink-0" />
                  )}
                  
                  <span className="text-[#D1D5DB] text-[12px] truncate">
                    {col.name}
                  </span>
                </div>

                <span className="text-[#6B7280] text-[11px] font-mono shrink-0 ml-3">
                  {col.isArray ? '[ ]' : typeSym}
                </span>

                <Handle
                  type="source"
                  position={Position.Right}
                  id={`${col.name}-source`}
                  className="!w-2 !h-2 !bg-[#3B82F6] !border-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ right: '-4px' }}
                />
              </div>
            )
          })
        )}
      </div>
      
      {/* Central handles for Obj/Arr connections */}
      <Handle type="target" position={Position.Top} id="header-target" className="opacity-0" />
      <Handle type="source" position={Position.Bottom} id="header-source" className="opacity-0" />
    </div>
  )
}
