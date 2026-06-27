"use server"

import { createClient } from '@/lib/backend/supabase/server'

export async function inviteCollaborator(
  projectId: string,
  email: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, error: 'No autenticado' }

    const { data: project } = await supabase
      .from('projects')
      .select('name, owner_id')
      .eq('id', projectId)
      .single()

    if (!project) return { 
      success: false, error: 'Proyecto no encontrado' 
    }

    const { data: existing } = await supabase
      .from('project_invitations')
      .select('id')
      .eq('project_id', projectId)
      .eq('email', email)
      .is('accepted_at', null)
      .maybeSingle()

    if (existing) return {
      success: false,
      error: 'Ya existe una invitación pendiente para este correo'
    }

    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .maybeSingle()

    const { data: invitation, error: insertError } = await supabase
      .from('project_invitations')
      .insert({
        project_id: projectId,
        email: email,
        invited_by: user.id
      })
      .select('token')
      .single()

    if (insertError || !invitation) return {
      success: false, error: 'Error al crear la invitación'
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL 
      ?? 'http://localhost:3000'

    const inviteLink = existingUser
      ? baseUrl + '/invite/' + invitation.token
      : baseUrl + '/register?inviteToken=' + invitation.token

    await sendInviteEmail(
      email,
      project.name,
      inviteLink,
      !!existingUser
    )

    return { success: true }

  } catch (err) {
    console.error('inviteCollaborator error:', err)
    return { 
      success: false, 
      error: 'Error inesperado al enviar la invitación' 
    }
  }
}

async function sendInviteEmail(
  to: string,
  projectName: string,
  inviteLink: string,
  hasAccount: boolean
): Promise<void> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL 
      ?? 'http://localhost:3000'
    await fetch(baseUrl + '/api/send-invite', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ to, projectName, inviteLink, hasAccount })
    })
  } catch (err) {
    console.error('sendInviteEmail error:', err)
  }
}
