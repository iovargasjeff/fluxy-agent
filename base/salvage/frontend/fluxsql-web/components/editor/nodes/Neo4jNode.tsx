'use client'

import { Handle, Position, type NodeProps } from '@xyflow/react'

export interface Neo4jNodeData extends Record<string, unknown> {
  tableName: string
  displayValue?: string
  columns: Array<{ name: string; type: string; isPrimaryKey?: boolean; isForeignKey?: boolean }>
  color?: string
}

// Updated Palette: Blue/Slate tones instead of rainbow
const NEO4J_PALETTE = [
  '#3B82F6', // Blue 500
  '#0EA5E9', // Sky 500
  '#06B6D4', // Cyan 500
  '#6366F1', // Indigo 500
  '#60A5FA', // Blue 400
  '#38BDF8', // Sky 400
  '#22D3EE', // Cyan 400
  '#818CF8', // Indigo 400
]

function getLabelColor(label: string): string {
  let hash = 0
  for (let i = 0; i < label.length; i++) {
    hash = label.charCodeAt(i) + ((hash << 5) - hash)
  }
  return NEO4J_PALETTE[Math.abs(hash) % NEO4J_PALETTE.length]
}

// Determine if text should be dark or light based on background color
function getTextColor(hexColor: string): string {
  const r = parseInt(hexColor.slice(1, 3), 16)
  const g = parseInt(hexColor.slice(3, 5), 16)
  const b = parseInt(hexColor.slice(5, 7), 16)
  // Luminance formula
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255
  return luminance > 0.55 ? 'rgba(0,0,0,0.80)' : 'rgba(255,255,255,0.92)'
}

export function Neo4jNode({ data, selected }: NodeProps) {
  const { tableName, displayValue, columns: rawCols, color } = data as Neo4jNodeData
  const columns = Array.isArray(rawCols) ? rawCols : []
  const bgColor = color ?? getLabelColor(tableName)
  const textColor = getTextColor(bgColor)
  const displayText = displayValue ?? tableName

  return (
    <div
      className="relative flex items-center justify-center rounded-full shadow-lg transition-all duration-200"
      style={{
        width: 72,
        height: 72,
        backgroundColor: bgColor,
        border: selected ? '4px solid rgba(255, 255, 255, 0.8)' : `2px solid ${bgColor}`,
        transform: selected ? 'scale(1.1)' : 'scale(1)',
      }}
    >
      <span 
        className="text-center font-bold px-2 truncate w-full"
        style={{ 
          fontSize: '11px', 
          color: textColor,
          lineHeight: 1.25,
          maxWidth: 58,
          overflow: 'hidden',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          fontFamily: "'Inter', 'Segoe UI', sans-serif",
          userSelect: 'none',
          pointerEvents: 'none',
          wordBreak: 'break-word',
        }}
      >
        {displayText}
      </span>

      {/* Center handles — invisible, used for edge connections */}
      <Handle
        type="target"
        position={Position.Left}
        id="center-target"
        style={{
          width: 1, height: 1,
          left: '50%', top: '50%',
          transform: 'translate(-50%, -50%)',
          opacity: 0, border: 'none',
          background: 'transparent',
          pointerEvents: 'none',
        }}
      />
      <Handle
        type="source"
        position={Position.Right}
        id="center-source"
        style={{
          width: 1, height: 1,
          left: '50%', top: '50%',
          transform: 'translate(-50%, -50%)',
          opacity: 0, border: 'none',
          background: 'transparent',
          pointerEvents: 'none',
        }}
      />

      {/* Per-relation handles */}
      {columns
        .filter(col => col.type === 'Relation')
        .map(col => (
          <Handle
            key={col.name}
            type="source"
            position={Position.Right}
            id={`${col.name}-source`}
            style={{
              width: 1, height: 1,
              left: '50%', top: '50%',
              transform: 'translate(-50%, -50%)',
              opacity: 0, border: 'none',
              background: 'transparent',
              pointerEvents: 'none',
            }}
          />
        ))}
    </div>
  )
}
