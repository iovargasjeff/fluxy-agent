'use server'

import { and, eq } from 'drizzle-orm'
import { db } from '@/lib/backend/db'
import { createClient } from '@/lib/backend/supabase/server'
import { skillCatalog, userSkills, users } from '@/lib/backend/db/schema'

export interface SkillStoreItem {
  id: string
  name: string
  description: string
  version: string
  author: string
  license: string
  category: string
  engines: string[]
  tags: string[]
  riskLevel: string
  requiresApproval: boolean
  requiresBackup: boolean
  requiresSandbox: boolean
  installed: boolean
  enabled: boolean
}

async function getCurrentDbUserId() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const [dbUser] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.authId, user.id))
    .limit(1)

  return dbUser?.id ?? null
}

export async function listSkillStore(): Promise<SkillStoreItem[]> {
  const userId = await getCurrentDbUserId()
  const rows = await db.select().from(skillCatalog).orderBy(skillCatalog.category, skillCatalog.name)
  const installed = userId
    ? await db.select().from(userSkills).where(eq(userSkills.userId, userId))
    : []
  const installedBySkill = new Map(installed.map((item) => [item.skillId, item]))

  return rows.map((skill) => {
    const userSkill = installedBySkill.get(skill.id)
    return {
      id: skill.id,
      name: skill.name,
      description: skill.description,
      version: skill.version,
      author: skill.author,
      license: skill.license,
      category: skill.category,
      engines: skill.engines ?? [],
      tags: skill.tags ?? [],
      riskLevel: skill.riskLevel,
      requiresApproval: skill.requiresApproval,
      requiresBackup: skill.requiresBackup,
      requiresSandbox: skill.requiresSandbox,
      installed: Boolean(userSkill),
      enabled: Boolean(userSkill?.enabled),
    }
  })
}

export async function installSkillAction(skillId: string) {
  const userId = await getCurrentDbUserId()
  if (!userId) throw new Error('Debes iniciar sesion para instalar skills.')

  const [skill] = await db.select().from(skillCatalog).where(eq(skillCatalog.id, skillId)).limit(1)
  if (!skill) throw new Error('Skill no encontrada.')

  const [existing] = await db
    .select()
    .from(userSkills)
    .where(and(eq(userSkills.userId, userId), eq(userSkills.skillId, skillId)))
    .limit(1)

  if (existing) {
    await db
      .update(userSkills)
      .set({ enabled: true, installedVersion: skill.version, updatedAt: new Date() })
      .where(eq(userSkills.id, existing.id))
    return
  }

  await db.insert(userSkills).values({
    userId,
    skillId,
    installedVersion: skill.version,
    enabled: true,
  })
}

export async function setSkillEnabledAction(skillId: string, enabled: boolean) {
  const userId = await getCurrentDbUserId()
  if (!userId) throw new Error('Debes iniciar sesion para administrar skills.')

  await db
    .update(userSkills)
    .set({ enabled, updatedAt: new Date() })
    .where(and(eq(userSkills.userId, userId), eq(userSkills.skillId, skillId)))
}
