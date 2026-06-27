'use client'

import { usePresence } from '@/hooks/usePresence'

interface PresenceDotProps {
  projectId: string
  currentUser: { id: string; name: string } | null
}

export function PresenceDot({ projectId, currentUser }: PresenceDotProps) {
  const presenceUsers = usePresence(projectId, currentUser)
  const others = presenceUsers.filter(u => u.user_id !== currentUser?.id)

  if (others.length === 0) return null

  return (
    <div className="flex items-center gap-1.5">
      <span className="relative flex h-2 w-2">
        <span
          className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
          style={{ backgroundColor: '#10B981' }}
        />
        <span
          className="relative inline-flex rounded-full h-2 w-2"
          style={{ backgroundColor: '#10B981' }}
        />
      </span>
      <span className="text-xs" style={{ color: '#10B981' }}>
        {others.length === 1 ? '1 activo ahora' : `${others.length} activos ahora`}
      </span>
    </div>
  )
}
