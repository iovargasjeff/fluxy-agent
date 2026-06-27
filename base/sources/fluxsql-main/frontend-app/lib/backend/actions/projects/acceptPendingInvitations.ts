'use server'

import { db } from '../../db'
import { collaborators, projectInvitations } from '../../db/schema'
import { and, eq, isNull } from 'drizzle-orm'

export async function acceptPendingInvitations(userId: string, email: string) {
  const normalizedEmail = email.trim().toLowerCase()
  if (!normalizedEmail) return

  const invitations = await db
    .select()
    .from(projectInvitations)
    .where(and(eq(projectInvitations.email, normalizedEmail), isNull(projectInvitations.acceptedAt)))

  for (const invitation of invitations) {
    await db
      .insert(collaborators)
      .values({
        projectId: invitation.projectId,
        userId,
        role: invitation.role,
      })
      .onConflictDoNothing()

    await db
      .update(projectInvitations)
      .set({ acceptedAt: new Date() })
      .where(eq(projectInvitations.id, invitation.id))
  }
}
