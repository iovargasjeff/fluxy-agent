'use client'

import { useEffect } from 'react'
import type { Edge, Node } from '@xyflow/react'
import { parseSQL, parseJSON } from '@/lib/parsers'
import { useEditorStore, toReactFlowEdge } from '@/store/useEditorStore'
import { useDebounce } from './useDebounce'

export function useSyncEditor(
  mode: 'postgresql' | 'mysql' | 'sqlserver' | 'json' = 'postgresql',
  emitSqlChange?: (nodes: Node[], edges: Edge[]) => void
) {
  const sqlValue = useEditorStore((state) => state.sqlValue)
  const setNodesAndEdges = useEditorStore((state) => state.setNodesAndEdges)
  const syncPaused = useEditorStore((state) => state.syncPaused)
  const setSyncPaused = useEditorStore((state) => state.setSyncPaused)

  const debouncedSQL = useDebounce(sqlValue, 300)

  useEffect(() => {
    if (syncPaused) {
      setSyncPaused(false)
      return
    }
    if (!debouncedSQL.trim()) return

    try {
      const result = mode === 'json'
        ? parseJSON(debouncedSQL)
        : parseSQL(debouncedSQL, mode)

      // If parsing failed completely (errors + no nodes) — keep the canvas as-is
      if (result.errors.length > 0 && result.nodes.length === 0) return

      // Read current node positions WITHOUT subscribing (avoids infinite loop)
      const currentNodes = useEditorStore.getState().nodes
      const positionMap = new Map<string, { x: number; y: number }>()
      currentNodes.forEach((node) => positionMap.set(node.id, node.position))

      // Merge: preserve positions of existing nodes, use layout for new ones
      const newNodes: Node[] = result.nodes.map((parserNode) => ({
        ...parserNode,
        position: positionMap.get(parserNode.id) ?? parserNode.position,
      }))

      const newEdges = result.edges.map(toReactFlowEdge)

      setNodesAndEdges(newNodes, newEdges)
      emitSqlChange?.(newNodes, newEdges)
    } catch {
      // If parser throws unexpectedly, keep canvas intact
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSQL, mode, emitSqlChange, syncPaused, setSyncPaused])
  // CRITICAL: currentNodes must NOT be in deps — causes infinite loop
  // Use useEditorStore.getState().nodes to read without subscribing
}
