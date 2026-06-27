'use server'

import { db } from '../../db'
import { users } from '../../db/schema'
import { eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'

export async function updateUserProfile({
  userId,
  name,
  avatarUrl,
}: {
  userId: string
  name?: string
  avatarUrl?: string
}) {
  const update: { name?: string; avatarUrl?: string } = {}
  if (name !== undefined) update.name = name
  if (avatarUrl !== undefined) update.avatarUrl = avatarUrl

  await db.update(users).set(update).where(eq(users.id, userId))
  revalidatePath('/dashboard')
  revalidatePath('/profile')
}
