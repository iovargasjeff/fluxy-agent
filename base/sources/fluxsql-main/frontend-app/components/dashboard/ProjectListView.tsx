'use client'

import { getRelativeDate } from '@/lib/relativeDate'

interface ProjectItem {
  project: {
    id: string
    name: string
    description: string | null
    updatedAt: Date
    createdAt?: Date
    ownerId: string
  }
  role: string
  members?: { id: string; name: string }[]
}

interface ProjectListViewProps {
  projects: ProjectItem[]
  currentUserId: string
}

export function ProjectListView({ projects }: ProjectListViewProps) {
  return (
    <div className="flex flex-col gap-1">
      {projects.map(item => (
        <a
          key={item.project.id}
          href={`/editor/${item.project.id}`}
          className="flex items-center gap-4 px-4 py-3 rounded-lg transition-all group"
          style={{ backgroundColor: '#0D1117', border: '1px solid #1E2A45' }}
          onMouseEnter={e => (e.currentTarget.style.borderColor = '#1A6CF6')}
          onMouseLeave={e => (e.currentTarget.style.borderColor = '#1E2A45')}
        >
          {/* Miniatura */}
          <div
            className="w-9 h-9 rounded-lg flex-shrink-0 flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #1A6CF6 0%, #7C3AED 100%)' }}
          >
            <span className="text-white text-xs font-bold">
              {item.project.name.slice(0, 2).toUpperCase()}
            </span>
          </div>

          {/* Nombre + descripción */}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white">{item.project.name}</p>
            {item.project.description && (
              <p className="text-xs truncate" style={{ color: '#6B7280' }}>
                {item.project.description}
              </p>
            )}
          </div>

          {/* Badge rol */}
          <span
            className="text-xs px-2 py-0.5 rounded-full flex-shrink-0"
            style={{
              backgroundColor: item.role === 'owner' ? 'rgba(26,108,246,0.15)' : 'rgba(16,185,129,0.15)',
              color: item.role === 'owner' ? '#1A6CF6' : '#10B981',
            }}
          >
            {item.role === 'owner' ? 'Propietario' : 'Colaborador'}
          </span>

          {/* Fecha */}
          <span className="text-xs flex-shrink-0" style={{ color: '#6B7280' }}>
            {getRelativeDate(item.project.updatedAt ?? item.project.createdAt ?? new Date())}
          </span>
        </a>
      ))}
    </div>
  )
}
