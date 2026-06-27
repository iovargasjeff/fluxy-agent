'use client'

import { ProjectCard } from './ProjectCard'

interface ProjectData {
  project: {
    id: string
    name: string
    description: string | null
    updatedAt: Date
    ownerId: string
    tags?: string[] | null
    deleted_at?: string | Date | null
  }
  role: string
  members?: { id: string; name: string }[]
}

interface ProjectGridProps {
  projects: ProjectData[]
  currentUserId: string
  currentUser?: { id: string; name: string } | null
  onCreateProject?: () => void
}

export function ProjectGrid({ projects, currentUserId, currentUser }: ProjectGridProps) {
  if (projects.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="text-5xl mb-4">🗂️</div>
          <h3 className="text-white font-semibold mb-2">No tienes proyectos aún</h3>
          <p className="text-[#6B7280] text-sm">
            Crea tu primer diagrama haciendo clic en &quot;Nuevo proyecto&quot;
          </p>
        </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {projects.map(({ project, role, members }) => (
          <ProjectCard
            key={project.id}
            project={project}
            role={role}
            isOwner={project.ownerId === currentUserId}
            members={members ?? []}
            tags={project.tags ?? []}
            currentUser={currentUser}
          />
        ))}

    </div>
  )
}
