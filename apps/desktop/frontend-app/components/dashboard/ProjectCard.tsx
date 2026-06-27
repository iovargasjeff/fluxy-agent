'use client'

import { Card, CardContent, CardFooter } from '@/components/ui/card'
import Link from 'next/link'
import { Clock, MoreVertical, Trash2, RotateCcw } from 'lucide-react'
import { getRelativeDate } from '@/lib/relativeDate'
import { getTagColor } from '@/components/ui/TagInput'
import { useState, useRef, useEffect } from 'react'
import { deleteProjectAction, restoreProjectAction, permanentlyDeleteProjectAction } from '@/lib/backend/actions/projects/delete'
import { toast } from 'sonner'

interface Project {
  id: string
  name: string
  description: string | null
  updatedAt: Date
  createdAt?: Date
  ownerId: string
  deleted_at?: string | Date | null
}

interface ProjectCardProps {
  project: Project
  role: string
  isOwner?: boolean
  members: { id: string; name: string }[]
  tags?: string[]
  currentUser?: { id: string; name: string } | null
  onProjectsChanged?: () => void
}

export function ProjectCard({ project, role, isOwner = false, tags, onProjectsChanged }: ProjectCardProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const isDeleted = Boolean(project.deleted_at)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false)
      }
    }

    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isMenuOpen])

  const handleDelete = async () => {
    if (!window.confirm(`¿Mover "${project.name}" a la papelera?`)) return
    const result = await deleteProjectAction(project.id)
    if (result.error) {
      toast.error(result.error)
      return
    }
    toast.success('Proyecto movido a la papelera')
    onProjectsChanged?.()
  }

  const handleRestore = async () => {
    const result = await restoreProjectAction(project.id)
    if (result.error) {
      toast.error(result.error)
      return
    }
    toast.success('Proyecto restaurado')
    onProjectsChanged?.()
  }

  const handlePermanentDelete = async () => {
    if (!window.confirm(`¿Estás seguro de que deseas eliminar definitivamente "${project.name}"? Esta acción no se puede deshacer.`)) return
    const result = await permanentlyDeleteProjectAction(project.id)
    if (result.error) {
      toast.error(result.error)
      return
    }
    toast.success('Proyecto eliminado definitivamente')
    onProjectsChanged?.()
  }

  return (
    <Link href={isDeleted ? '#' : `/editor?projectId=${project.id}`} onClick={(event) => { if (isDeleted) event.preventDefault() }} className="block h-full">
      <Card className={`h-full flex flex-col bg-gray-900 group relative rounded-xl border border-gray-800 transition-all duration-200 ${isDeleted ? 'cursor-default opacity-80' : 'cursor-pointer hover:border-blue-500 hover:shadow-xl hover:shadow-blue-500/20'}`}>
        <div className="relative h-28 bg-gradient-to-br from-blue-900 via-purple-900 to-gray-900 flex items-end p-3 rounded-t-xl">
          <div
            className="absolute inset-0 rounded-t-xl"
            style={{
              backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.08) 1px, transparent 1px)',
              backgroundSize: '20px 20px',
              opacity: 0.3,
            }}
          />

          <div className="absolute top-2 right-2 z-20" ref={menuRef}>
            <button
              onClick={(event) => {
                event.preventDefault()
                event.stopPropagation()
                setIsMenuOpen(!isMenuOpen)
              }}
              className="p-1.5 rounded-full bg-black/40 hover:bg-black/60 transition-colors text-gray-300 hover:text-white"
            >
              <MoreVertical size={16} />
            </button>

            {isMenuOpen && (
              <div className="absolute right-0 top-8 z-50 min-w-44 rounded-lg bg-gray-900 border border-gray-700 shadow-xl py-1">
                {isDeleted ? (
                  <>
                    <button
                      onClick={(event) => {
                        event.preventDefault()
                        event.stopPropagation()
                        setIsMenuOpen(false)
                        handleRestore()
                      }}
                      className="w-full flex items-center gap-2 px-4 py-2 text-sm text-emerald-300 hover:bg-emerald-950/40 transition-colors rounded-t-lg"
                    >
                      <RotateCcw size={16} />
                      Restaurar
                    </button>
                    <button
                      onClick={(event) => {
                        event.preventDefault()
                        event.stopPropagation()
                        setIsMenuOpen(false)
                        handlePermanentDelete()
                      }}
                      className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-400 hover:bg-red-950/40 transition-colors rounded-b-lg border-t border-gray-800"
                    >
                      <Trash2 size={16} />
                      Eliminar definitivamente
                    </button>
                  </>
                ) : (
                  <button
                    onClick={(event) => {
                      event.preventDefault()
                      event.stopPropagation()
                      setIsMenuOpen(false)
                      handleDelete()
                    }}
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-400 hover:bg-red-950/40 transition-colors rounded-lg"
                  >
                    <Trash2 size={16} />
                    Eliminar
                  </button>
                )}
              </div>
            )}
          </div>

          <h3 className="text-white font-bold text-base leading-tight z-10 relative">
            {project.name}
          </h3>
          {isDeleted && (
            <span className="absolute bottom-3 right-3 z-10 rounded-full border border-red-500/30 bg-red-500/15 px-2 py-0.5 text-xs font-medium text-red-200">
              Papelera
            </span>
          )}
        </div>

        <CardContent className="flex-grow pb-2 px-3 pt-3">
          {project.description && (
            <p className="text-sm text-gray-400 line-clamp-2 mb-2">
              {project.description}
            </p>
          )}

          {tags && tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {tags.slice(0, 2).map(tag => (
                <span
                  key={tag}
                  className="text-xs px-2 py-0.5 rounded-full"
                  style={{
                    backgroundColor: getTagColor(tag) + '22',
                    color: getTagColor(tag),
                    border: `1px solid ${getTagColor(tag)}33`,
                  }}
                >
                  {tag}
                </span>
              ))}
              {tags.length > 2 && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-gray-800 text-gray-400">
                  +{tags.length - 2}
                </span>
              )}
            </div>
          )}
        </CardContent>

        <CardFooter className="p-3 bg-gray-800/50 border-t border-gray-700 mt-auto rounded-b-xl">
          <div className="flex items-center justify-between w-full">
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${isOwner ? 'bg-green-900/50 text-green-300 border-green-800' : 'bg-purple-900/50 text-purple-300 border-purple-800'}`}>
              {isOwner ? 'Propietario' : 'Proyecto'}
            </span>

            <div className="flex items-center gap-1 text-gray-400 text-xs">
              <Clock size={14} />
              <span>Hace {getRelativeDate(project.updatedAt ?? project.createdAt)}</span>
            </div>
          </div>
        </CardFooter>
      </Card>
    </Link>
  )
}
