'use client'

import { useState } from 'react'
import { LogOut, Database } from 'lucide-react'
import { logoutAction } from '@/lib/backend/actions/auth/logout'
import { Button } from '@/components/ui/button'
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
  currentUserId: string
  currentUser?: { id: string; name: string } | null
}

export function DashboardPageContent({
  userName,
  userEmail,
  userAvatarUrl,
  projects,
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
        <header className="border-b border-slate-200 bg-white sticky top-0 z-10 shadow-sm">
          <div className="container mx-auto px-4 h-16 flex items-center justify-between">
            <div className="flex items-center gap-3 lg:hidden">
              <div className="w-9 h-9 rounded-lg bg-[#1A6CF6]/10 flex items-center justify-center">
                <Database className="w-5 h-5 text-[#1A6CF6]" />
              </div>
              <span className="font-bold text-xl tracking-tight text-slate-900">FluxSQL</span>
            </div>
            <form action={logoutAction}>
              <Button type="submit" variant="ghost" size="sm" className="text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors">
                <LogOut className="w-4 h-4 mr-2" />
                Salir
              </Button>
            </form>
          </div>
        </header>
        <div className="flex-1 overflow-auto">
          <div className="container mx-auto px-4 py-10 max-w-6xl">
            <DashboardClient
              projects={projects}
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
