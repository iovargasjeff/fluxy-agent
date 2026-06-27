'use client'

import { useCallback, useEffect, useRef } from 'react'
import type { Edge, Node, XYPosition } from '@xyflow/react'
import { createClient } from '@/lib/backend/supabase/client'
import { useEditorStore } from '@/store/useEditorStore'

type NodeMovePayload = {
  nodeId: string
  position: XYPosition
  senderId: string
}

type SqlChangePayload = {
  nodes: Node[]
  edges: Edge[]
  senderId: string
}

export function useRealtimeSync(projectId: string, userId: string) {
  const channelRef = useRef<ReturnType<ReturnType<typeof createClient>['channel']>>(null)
  const remoteSchemaUpdateRef = useRef(false)

  useEffect(() => {
    const supabase = createClient()
    const channel = supabase.channel(`schema-${projectId}`)
    channelRef.current = channel

    channel
      .on('broadcast', { event: 'node_move' }, ({ payload }: { payload: NodeMovePayload }) => {
        if (payload.senderId === userId) return

        const localNodes = useEditorStore.getState().nodes
        const localEdges = useEditorStore.getState().edges
        const updatedNodes = localNodes.map((node) =>
          node.id === payload.nodeId ? { ...node, position: payload.position } : node
        )

        useEditorStore.getState().setNodesAndEdges(updatedNodes, localEdges)
      })
      .on('broadcast', { event: 'sql_change' }, ({ payload }: { payload: SqlChangePayload }) => {
        if (payload.senderId === userId) return

        const localNodes = useEditorStore.getState().nodes
        const positionMap = new Map(localNodes.map((node) => [node.id, node.position]))
        const mergedNodes: Node[] = payload.nodes.map((node: Node) => ({
          ...node,
          position: positionMap.get(node.id) ?? node.position,
        }))

        remoteSchemaUpdateRef.current = true
        useEditorStore.getState().setNodesAndEdges(mergedNodes, payload.edges)
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [projectId, userId])

  const emitNodeMove = useCallback((nodeId: string, position: { x: number, y: number }) => {
    channelRef.current?.send({
      type: 'broadcast',
      event: 'node_move',
      payload: { nodeId, position, senderId: userId },
    })
  }, [userId])

  const emitSqlChange = useCallback((nodes: Node[], edges: Edge[]) => {
    channelRef.current?.send({
      type: 'broadcast',
      event: 'sql_change',
      payload: { nodes, edges, senderId: userId },
    })
  }, [userId])

  const consumeRemoteSchemaUpdate = useCallback(() => {
    if (!remoteSchemaUpdateRef.current) return false
    remoteSchemaUpdateRef.current = false
    return true
  }, [])

  return { emitNodeMove, emitSqlChange, consumeRemoteSchemaUpdate }
}
