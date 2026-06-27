"use client"

import { useState, useEffect } from 'react'
import { 
  FolderOpen, 
  Plus, 
  Save, 
  Trash2, 
  RotateCcw, 
  UserPlus, 
  Download, 
  Clock 
} from 'lucide-react'
import { getActivityHistory, ActivityItem, ActivityAction } from '@/lib/backend/actions/activity/logActivity'

interface HistorialSectionProps {
  userId: string
}

export function HistorialSection({ userId }: HistorialSectionProps) {
  const [activities, setActivities] = useState<ActivityItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadActivities = async () => {
      try {
        const history = await getActivityHistory(userId)
        setActivities(history)
      } catch (error) {
        console.error('Error al cargar historial:', error)
      } finally {
        setLoading(false)
      }
    }

    loadActivities()
  }, [userId])

  const getActionIcon = (action: ActivityAction) => {
    const iconProps = { size: 16 }
    switch (action) {
      case 'project_opened':
        return <FolderOpen {...iconProps} style={{ color: '#3b82f6' }} />
      case 'project_created':
        return <Plus {...iconProps} style={{ color: '#22c55e' }} />
      case 'project_saved':
        return <Save {...iconProps} style={{ color: '#22c55e' }} />
      case 'project_deleted':
        return <Trash2 {...iconProps} style={{ color: '#ef4444' }} />
      case 'project_restored':
        return <RotateCcw {...iconProps} style={{ color: '#eab308' }} />
      case 'collaborator_invited':
        return <UserPlus {...iconProps} style={{ color: '#a855f7' }} />
      case 'schema_exported':
        return <Download {...iconProps} style={{ color: '#6b7280' }} />
      default:
        return <Clock {...iconProps} style={{ color: '#6b7280' }} />
    }
  }

  const getActionText = (item: ActivityItem) => {
    const { projectName } = item.metadata as { projectName?: string }
    const { invitedEmail } = item.metadata as { invitedEmail?: string }

    switch (item.action) {
      case 'project_opened':
        return `Abriste "${projectName || 'Proyecto sin nombre'}"`
      case 'project_created':
        return `Creaste "${projectName || 'Proyecto sin nombre'}"`
      case 'project_saved':
        return `Guardaste cambios en "${projectName || 'Proyecto sin nombre'}"`
      case 'project_deleted':
        return `Moviste "${projectName || 'Proyecto sin nombre'}" a la papelera`
      case 'project_restored':
        return `Restauraste "${projectName || 'Proyecto sin nombre'}"`
      case 'collaborator_invited':
        return `Invitaste a ${invitedEmail || 'un usuario'} en "${projectName || 'Proyecto sin nombre'}"`
      case 'schema_exported':
        return `Exportaste el esquema de "${projectName || 'Proyecto sin nombre'}"`
      default:
        return 'Actividad desconocida'
    }
  }

  const relativeTime = (dateStr: string): string => {
    const date = new Date(dateStr)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMinutes = Math.floor(diffMs / (1000 * 60))
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
    const diffMonths = Math.floor(diffDays / 30)

    if (diffMinutes < 60) {
      return `Hace ${diffMinutes} ${diffMinutes === 1 ? 'minuto' : 'minutos'}`
    } else if (diffHours < 24) {
      return `Hace ${diffHours} ${diffHours === 1 ? 'hora' : 'horas'}`
    } else if (diffDays < 30) {
      return `Hace ${diffDays} ${diffDays === 1 ? 'día' : 'días'}`
    } else {
      return `Hace ${diffMonths} ${diffMonths === 1 ? 'mes' : 'meses'}`
    }
  }

  if (loading) {
    return (
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <Clock size={18} />
          Historial de actividad
        </h3>
        {/* Skeleton loaders */}
        {Array.from({ length: 5 }).map((_, index) => (
          <div key={index} className="animate-pulse">
            <div className="flex items-center gap-3 p-3 rounded-lg" style={{ backgroundColor: '#111827' }}>
              <div className="w-4 h-4 rounded" style={{ backgroundColor: '#374151' }}></div>
              <div className="flex-1">
                <div className="h-4 w-3/4 rounded mb-2" style={{ backgroundColor: '#374151' }}></div>
                <div className="h-3 w-1/4 rounded" style={{ backgroundColor: '#4B5563' }}></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (activities.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <Clock size={48} style={{ color: '#6B7280' }} className="mb-4" />
        <p className="text-white font-medium mb-1">Aún no hay actividad registrada</p>
        <p className="text-sm" style={{ color: '#6B7280' }}>
          Comienza creando o abriendo un proyecto
        </p>
      </div>
    )
  }

  return (
    <div>
      <h3 className="text-lg font-semibold text-white flex items-center gap-2 mb-4">
        <Clock size={18} />
        Historial de actividad
      </h3>
      
      <div className="space-y-2">
        {activities.map((item) => (
          <div
            key={item.id}
            className="flex items-start gap-3 p-3 rounded-lg transition-colors hover:bg-opacity-50"
            style={{ backgroundColor: '#111827' }}
          >
            <div className="flex-shrink-0 mt-0.5">
              {getActionIcon(item.action)}
            </div>
            
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-medium">
                {getActionText(item)}
              </p>
              <p className="text-xs" style={{ color: '#6B7280' }}>
                {relativeTime(item.createdAt)}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
