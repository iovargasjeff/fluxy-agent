'use client'

import { useEffect, useState } from 'react'
import { getProjectsByUser, type ProjectListItem } from '@/lib/backend/actions/projects/list'
import { DashboardPageContent } from '@/components/dashboard/DashboardPageContent'

export default function DashboardPage() {
  const [projects, setProjects] = useState<ProjectListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  async function fetchProjects() {
    setLoading(true)
    setError(null)
    try {
      setProjects(await getProjectsByUser())
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'No se pudieron cargar los proyectos.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void fetchProjects()
  }, [])

  return (
    <div className="flex min-h-screen" style={{ backgroundColor: '#0A0F1E' }}>
      <DashboardPageContent
        userName="Usuario Local"
        userEmail={undefined}
        userAvatarUrl={null}
        projects={projects}
        loading={loading}
        error={error}
        onRetry={() => void fetchProjects()}
        onProjectsChanged={() => void fetchProjects()}
        currentUserId="local"
        currentUser={null}
      />
    </div>
  )
}
