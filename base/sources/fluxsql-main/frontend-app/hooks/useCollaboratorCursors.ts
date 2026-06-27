'use client'

import { useEffect, useRef, useState } from 'react'
import { createClient } from '@/lib/backend/supabase/client'
import { useReactFlow } from '@xyflow/react'
import { useEditorStore } from '@/store/useEditorStore'

export interface CursorState {
  userId: string
  name: string
  color: string
  x: number
  y: number
  selectedNodeId?: string | null
}

// Genera un color basado en un hash del userId
function getCursorColor(userId: string) {
  const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F']
  let hash = 0
  for (let i = 0; i < userId.length; i++) {
    hash = (hash << 5) - hash + userId.charCodeAt(i)
    hash = hash & hash // Convert to 32bit integer
  }
  return colors[Math.abs(hash) % colors.length]
}

export function useCollaboratorCursors(projectId: string, currentUserId: string, currentUserName: string) {
  const [cursors, setCursors] = useState<Map<string, CursorState>>(new Map())
  const { screenToFlowPosition } = useReactFlow()
  const channelRef = useRef<ReturnType<ReturnType<typeof createClient>['channel']>>(null)
  const lastUpdateRef = useRef<number>(0)
  const myColor = getCursorColor(currentUserId)
  const selectedNodeId = useEditorStore((state) => state.selectedNodeId)
  const selectedNodeIdRef = useRef<string | null>(selectedNodeId)

  useEffect(() => {
    selectedNodeIdRef.current = selectedNodeId
  }, [selectedNodeId])

  useEffect(() => {
    const supabase = createClient()
    
    // Configurar canal Presence
    const channel = supabase.channel(`room-${projectId}`, {
      config: {
        presence: {
          key: currentUserId,
        },
      },
    })
    
    channelRef.current = channel

    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState() as Record<string, CursorState[]>
        const newCursors = new Map<string, CursorState>()
        
        // Iterar sobre los estados de presencia de otros usuarios
        for (const [key, presenceArray] of Object.entries(state)) {
          if (key !== currentUserId && presenceArray.length > 0) {
            newCursors.set(key, presenceArray[0])
          }
        }
        
        setCursors(newCursors)
      })
      .subscribe(async (status: string) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({
            userId: currentUserId,
            name: currentUserName,
            color: myColor,
            x: 0,
            y: 0,
            selectedNodeId: selectedNodeIdRef.current,
          })
        }
      })

    return () => {
      supabase.removeChannel(channel)
    }
  }, [projectId, currentUserId, currentUserName, myColor])

  // Mouse tracking con throttle de 50ms
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!channelRef.current) return
    
    const now = Date.now()
    if (now - lastUpdateRef.current < 50) return
    lastUpdateRef.current = now

    // Convertir coordenadas de pantalla a coordenadas del Canvas
    const flowPos = screenToFlowPosition({ x: e.clientX, y: e.clientY })

    channelRef.current.track({
      userId: currentUserId,
      name: currentUserName,
      color: myColor,
      x: flowPos.x,
      y: flowPos.y,
      selectedNodeId: selectedNodeIdRef.current,
    })
  }

  return { cursors, handleMouseMove }
}
