"use client"

import { Clock } from 'lucide-react'

export function HistorialSection() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <Clock size={48} style={{ color: '#6B7280' }} className="mb-4" />
      <p className="text-white font-medium mb-1">Historial no disponible</p>
      <p className="text-sm" style={{ color: '#6B7280' }}>
        El historial de actividad fue eliminado en la versión local.
      </p>
    </div>
  )
}
