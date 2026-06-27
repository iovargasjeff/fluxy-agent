'use client'

import { useState } from 'react'
import { ProjectCard } from './ProjectCard'
import { EmptyState } from './EmptyState'
import { CreateProjectModal } from './CreateProjectModal'

interface ProjectData {
  project: {
    id: string
    name: string
    description: string | null
    updatedAt: Date
    ownerId: string
  }
  role: string
  members?: { id: string; name: string }[]
}

export function ProjectList({ projects }: { projects: ProjectData[] }) {
  const [isCreateProjectOpen, setIsCreateProjectOpen] = useState(false)

  if (projects.length === 0) {
    return <EmptyState />
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold text-[#E2E8F0]">Mis Proyectos</h2>
        <CreateProjectModal open={isCreateProjectOpen} onOpenChange={setIsCreateProjectOpen} />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map(({ project, role, members }) => (
          <ProjectCard key={project.id} project={project} role={role} members={members ?? []} />
        ))}
      </div>
    </div>
  )
}
