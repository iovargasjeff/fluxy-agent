import { createClient } from '@/lib/backend/supabase/server'
import { redirect } from 'next/navigation'
import { db } from '@/lib/backend/db'
import { collaborators, users } from '@/lib/backend/db/schema'
import { eq } from 'drizzle-orm'

export const dynamic = 'force-dynamic'

interface InvitePageProps {
  params: Promise<{ token: string }>
}

export default async function InvitePage({ params }: InvitePageProps) {
  const { token } = await params
  let dbUser = null;
  let errorState = null;
  let invitation = null;
  
  try {
    const supabase = await createClient()

    // 1. Buscar token en project_invitations
    const { data, error: inviteError } = await supabase
      .from('project_invitations')
      .select('*')
      .eq('token', token)
      .single()

    if (inviteError || !data) {
      errorState = 'invite_not_found';
    } else if (data.accepted_at) {
      errorState = 'invite_accepted';
    } else {
      invitation = data;
    }

    if (!errorState) {
      // 3. Verificar autenticación
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        // Si NO autenticado: redirect a /login?returnUrl=/invite/[token]
        redirect(`/login?returnUrl=/invite/${token}`)
      }

      // a. UPDATE project_invitations SET accepted_at = now()
      const { error: updateError } = await supabase
        .from('project_invitations')
        .update({ accepted_at: new Date().toISOString() })
        .eq('token', token)

      if (updateError) {
        errorState = 'general_error';
      } else {
        // b. Obtener el usuario local
        const [foundUser] = await db
          .select()
          .from(users)
          .where(eq(users.authId, user.id))
          .limit(1)
        
        if (!foundUser) {
          errorState = 'profile_not_found';
        } else {
          dbUser = foundUser;
        }
      }
    }
  } catch (error) {
    console.error('Error processing invitation:', error)
    errorState = 'general_error';
  }

  if (errorState === 'invite_not_found') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0D1117]">
        <div className="text-center p-8">
          <h1 className="text-2xl font-bold text-white mb-4">Invitación inválida o expirada</h1>
          <p className="text-[#94A3B8]">El enlace de invitación no es válido o ha expirado.</p>
        </div>
      </div>
    )
  }

  if (errorState === 'invite_accepted') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0D1117]">
        <div className="text-center p-8">
          <h1 className="text-2xl font-bold text-white mb-4">Invitación ya utilizada</h1>
          <p className="text-[#94A3B8]">Esta invitación ya fue aceptada anteriormente.</p>
        </div>
      </div>
    )
  }

  if (errorState === 'profile_not_found') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0D1117]">
        <div className="text-center p-8">
          <h1 className="text-2xl font-bold text-white mb-4">Usuario no encontrado</h1>
          <p className="text-[#94A3B8]">No se encontró tu perfil en el sistema.</p>
        </div>
      </div>
    )
  }

  if (errorState === 'general_error') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0D1117]">
        <div className="text-center p-8">
          <h1 className="text-2xl font-bold text-white mb-4">Error inesperado</h1>
          <p className="text-[#94A3B8]">Ocurrió un error al procesar la invitación.</p>
        </div>
      </div>
    )
  }

  // c. INSERT INTO collaborators ON CONFLICT DO NOTHING
  let insertSuccess = false;
  if (invitation && dbUser) {
    try {
      await db
        .insert(collaborators)
        .values({
          projectId: invitation.project_id,
          userId: dbUser.id,
          role: 'viewer'
        })
        .onConflictDoNothing({
          target: [collaborators.projectId, collaborators.userId]
        })
      insertSuccess = true;
    } catch (error) {
      console.error('Error inserting collaborator:', error)
      return (
        <div className="min-h-screen flex items-center justify-center bg-[#0D1117]">
          <div className="text-center p-8">
            <h1 className="text-2xl font-bold text-white mb-4">Error inesperado</h1>
            <p className="text-[#94A3B8]">Ocurrió un error al unirse al proyecto.</p>
          </div>
        </div>
      )
    }
  }

  if (insertSuccess && invitation) {
    redirect(`/editor/${invitation.project_id}`)
  }
}
