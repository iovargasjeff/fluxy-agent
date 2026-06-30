'use client'

import { useState } from 'react'
import { DashboardSidebar } from '@/components/dashboard/DashboardSidebar'
import { SkillStoreClient } from '@/components/skills/SkillStoreClient'
import type { SkillStoreItem } from '@/lib/backend/actions/skills/list'

interface SkillStoreShellProps {
  userName: string
  userEmail?: string
  userAvatarUrl?: string | null
  skills: SkillStoreItem[]
}

export function SkillStoreShell({ userName, userEmail, userAvatarUrl, skills }: SkillStoreShellProps) {
  const [activeSection, setActiveSection] = useState('skills')

  return (
    <div className="flex min-h-screen bg-white">
      <DashboardSidebar
        userName={userName}
        userEmail={userEmail}
        userAvatarUrl={userAvatarUrl}
        activeSection={activeSection}
        onSectionChange={setActiveSection}
      />
      <main className="flex-1 overflow-auto bg-white">
        <SkillStoreClient skills={skills} />
      </main>
    </div>
  )
}
