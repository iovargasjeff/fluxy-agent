'use client'

import { useState, useMemo } from 'react'
import { Search, LayoutGrid, List, X, Plus } from 'lucide-react'
import { getProjectsByUser, getDeletedProjects } from '@/lib/backend/actions/projects/list'
import { ProjectGrid } from './ProjectGrid'
import { ProjectListView } from './ProjectListView'
import { CreateProjectModal } from './CreateProjectModal'
import { HistorialSection } from './HistorialSection'
import { Trash2 } from 'lucide-react'

interface ProjectItem {
  project: {
    id: string
    name: string
    description: string | null
    updatedAt: Date
    createdAt?: Date
    ownerId: string
    engineFamily?: string
    deleted_at?: string | Date | null
  }
  role: string
  members?: { id: string; name: string }[]
}

interface DashboardClientProps {
  projects: ProjectItem[]
  currentUserId: string
  currentUser?: { id: string; name: string } | null
  activeSection: string
  onSectionChange: (section: string) => void
}

export function DashboardClient({ projects, currentUserId, currentUser, activeSection }: DashboardClientProps) {
  const [query, setQuery] = useState('')
  const [isCreateProjectOpen, setIsCreateProjectOpen] = useState(false)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>(() => {
    try {
      if (typeof window === 'undefined') return 'grid'
      const saved = localStorage.getItem('dbcanvas_view_mode')
      return saved === 'grid' || saved === 'list' ? saved : 'grid'
    } catch {
      return 'grid'
    }
  })

  function handleViewMode(mode: 'grid' | 'list') {
    setViewMode(mode)
    try { localStorage.setItem('dbcanvas_view_mode', mode) } catch {}
  }

  // Filtrado según sección activa + búsqueda
  const filtered = useMemo(() => {
    let result = projects

    // Filtrar según sección
    switch (activeSection) {
      case 'proyectos':
        result = result.filter(item => !item.project.deleted_at)
        break
      case 'recientes':
        result = result
          .filter(item => !item.project.deleted_at)
          .sort((a, b) => new Date(b.project.updatedAt).getTime() - new Date(a.project.updatedAt).getTime())
          .slice(0, 5)
        break
      case 'compartidos':
        result = result.filter(item => item.role !== 'owner' && !item.project.deleted_at)
        break
      case 'papelera':
        result = result.filter(item => item.project.deleted_at)
        break
      case 'historial':
        result = []
        break
      default:
        result = result.filter(item => !item.project.deleted_at)
    }

    // Aplicar búsqueda
    return result.filter(item =>
      item.project.name.toLowerCase().includes(query.toLowerCase())
    )
  }, [projects, query, activeSection])

  return (
    <div>
      {/* Header: título + acciones */}
      {activeSection === 'papelera' ? (
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Papelera
            </h1>
            <p className="text-slate-500 text-sm mt-1">
              {filtered.length} proyecto{filtered.length !== 1 ? 's' : ''} eliminado{filtered.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold text-slate-900">Mis Proyectos</h2>
          <button
            onClick={() => setIsCreateProjectOpen(true)}
            className="bg-gradient-to-r from-[#1A6CF6] to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white shadow-lg shadow-blue-500/25 transition-all hover:-translate-y-[1px] flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium"
          >
            <Plus className="w-4 h-4" />
            Crear Proyecto
          </button>
        </div>
      )}
      <CreateProjectModal open={isCreateProjectOpen} onOpenChange={setIsCreateProjectOpen} />

      {/* Toolbar: búsqueda + toggle */}
      <div className="flex items-center gap-3 mb-6">

        {/* Campo de búsqueda */}
        <div className="relative flex-1 max-w-xs">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
            style={{ color: '#6B7280' }}
          />
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Buscar proyectos..."
            className="w-full pl-9 pr-8 py-2 rounded-lg text-sm text-slate-900 placeholder-slate-400 outline-none transition-all shadow-sm focus:ring-2 focus:ring-[#1A6CF6]/20"
            style={{ backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0' }}
            onFocus={e => (e.currentTarget.style.borderColor = '#1A6CF6')}
            onBlur={e => (e.currentTarget.style.borderColor = '#E2E8F0')}
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2"
              style={{ color: '#6B7280' }}
            >
              <X size={13} />
            </button>
          )}
        </div>

        {/* Toggle grid/lista */}
        <div
          className="flex items-center rounded-lg overflow-hidden flex-shrink-0"
          style={{ border: '1px solid #E2E8F0' }}
        >
          <button
            onClick={() => handleViewMode('grid')}
            className="p-2 transition-colors"
            style={{
              backgroundColor: viewMode === 'grid' ? '#F1F5F9' : 'transparent',
              color: viewMode === 'grid' ? '#0F172A' : '#64748B',
            }}
            title="Vista de grilla"
          >
            <LayoutGrid size={15} />
          </button>
          <button
            onClick={() => handleViewMode('list')}
            className="p-2 transition-colors"
            style={{
              backgroundColor: viewMode === 'list' ? '#F1F5F9' : 'transparent',
              color: viewMode === 'list' ? '#0F172A' : '#64748B',
            }}
            title="Vista de lista"
          >
            <List size={15} />
          </button>
        </div>
      </div>

      {/* Contenido */}
      {activeSection === 'historial' ? (
        <HistorialSection userId={currentUserId} />
      ) : activeSection === 'papelera' && filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
            <Trash2 className="w-8 h-8 text-slate-400" />
          </div>
          <p className="text-slate-900 font-medium text-lg">
            La papelera está vacía
          </p>
          <p className="text-slate-500 text-sm mt-2 max-w-xs">
            Los proyectos eliminados aparecerán aquí. 
            Puedes restaurarlos cuando quieras.
          </p>
        </div>
      ) : filtered.length === 0 && query ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <p className="text-slate-900 font-medium mb-1">
            Sin resultados para &ldquo;{query}&rdquo;
          </p>
          <p className="text-sm text-slate-500 mb-4">
            Intenta con otro nombre de proyecto
          </p>
          <button
            onClick={() => setQuery('')}
            className="text-sm transition-colors hover:opacity-80 text-[#1A6CF6]"
          >
            Limpiar búsqueda
          </button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <p className="text-slate-900 font-medium mb-1">
            Sin proyectos en esta sección
          </p>
          <p className="text-sm text-slate-500">
            Crea un nuevo proyecto para comenzar
          </p>
        </div>
      ) : viewMode === 'grid' ? (
        <ProjectGrid
          projects={filtered}
          currentUserId={currentUserId}
          currentUser={currentUser}
          onCreateProject={() => document.getElementById('create-project-btn')?.click()}
        />
      ) : (
        <ProjectListView
          projects={filtered}
          currentUserId={currentUserId}
        />
      )}
    </div>
  )
}
