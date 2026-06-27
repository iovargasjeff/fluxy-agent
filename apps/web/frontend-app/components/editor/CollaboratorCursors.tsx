'use client'

import { useReactFlow } from '@xyflow/react'
import { motion } from 'framer-motion'
import type { CursorState } from '@/hooks/useCollaboratorCursors'
import { useEditorStore } from '@/store/useEditorStore'
import { isEditorNode } from '@/lib/editor-schema'

interface CollaboratorCursorsProps {
  cursors: Map<string, CursorState>
}

export function CollaboratorCursors({ cursors }: CollaboratorCursorsProps) {
  const { flowToScreenPosition } = useReactFlow()
  const nodes = useEditorStore((state) => state.nodes)

  return (
    <>
      {Array.from(cursors.values()).map((cursor) => {
        // Convertir coordenadas del Canvas a coordenadas de pantalla
        const screenPos = flowToScreenPosition({ x: cursor.x, y: cursor.y })
        const selected = nodes.find((node) => node.id === cursor.selectedNodeId)
        const selectedLabel = selected && isEditorNode(selected) ? ` · ${selected.data.tableName}` : ''

        return (
          <motion.div
            key={cursor.userId}
            animate={{ x: screenPos.x - 2, y: screenPos.y - 2 }}
            transition={{ type: 'spring', stiffness: 500, damping: 40, mass: 0.5 }}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              zIndex: 9999,
              pointerEvents: 'none',
            }}
          >
            <svg width="16" height="24" viewBox="0 0 16 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path 
                d="M0 0 L0 14 L4 10 L7 16 L9 15 L6 9 L11 9 Z" 
                fill={cursor.color} 
                stroke="white" 
                strokeWidth="1"
              />
            </svg>
            <span
              className="absolute left-4 top-4 rounded px-2 py-0.5 text-xs font-semibold whitespace-nowrap shadow-md"
              style={{
                backgroundColor: cursor.color,
                color: '#0A0F1E',
              }}
            >
              {cursor.name}{selectedLabel}
            </span>
          </motion.div>
        )
      })}
    </>
  )
}
