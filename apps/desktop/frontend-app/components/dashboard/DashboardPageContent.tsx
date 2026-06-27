'use client'

import { useState } from 'react'
import { DatabaseZap } from 'lucide-react'
import { DashboardSidebar } from './DashboardSidebar'
import { DashboardClient } from './DashboardClient'

interface ProjectItem {
  project: {
    id: string
    name: string
    description: string | null
    updatedAt: Date
    createdAt?: Date
    ownerId: string
    deleted_at?: string | Date | null
  }
  role: string
  members?: { id: string; name: string }[]
}

interface DashboardPageContentProps {
  userName: string
  userEmail?: string
  userAvatarUrl?: string | null
  projects: ProjectItem[]
  loading: boolean
  error: string | null
  onRetry: () => void
  onProjectsChanged: () => void
  currentUserId: string
  currentUser?: { id: string; name: string } | null
}

export function DashboardPageContent({
  userName,
  userEmail,
  userAvatarUrl,
  projects,
  loading,
  error,
  onRetry,
  onProjectsChanged,
  currentUserId,
  currentUser,
}: DashboardPageContentProps) {
  const [activeSection, setActiveSection] = useState('proyectos')

  return (
    <>
      <DashboardSidebar
        userName={userName}
        userEmail={userEmail}
        userAvatarUrl={userAvatarUrl}
        activeSection={activeSection}
        onSectionChange={setActiveSection}
      />
      <main className="flex-1 flex flex-col">
        <header className="border-b border-[#1E2A45] bg-[#111827] sticky top-0 z-10 shadow-sm">
          <div className="container mx-auto px-4 h-16 flex items-center">
            <DatabaseZap className="w-5 h-5 text-[#1A6CF6] mr-2" />
            <span className="text-sm font-medium text-[#94A3B8]">CDCart — Local</span>
          </div>
        </header>
        <div className="flex-1 overflow-auto">
          <div className="container mx-auto px-4 py-10 max-w-6xl">
            <DashboardClient
              projects={projects}
              loading={loading}
              error={error}
              onRetry={onRetry}
              onProjectsChanged={onProjectsChanged}
              currentUserId={currentUserId}
              currentUser={currentUser}
              activeSection={activeSection}
              onSectionChange={setActiveSection}
            />
          </div>
        </div>
      </main>
    </>
  )
}
