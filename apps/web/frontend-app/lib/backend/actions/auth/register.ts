'use server'

import { z } from 'zod'
import { createClient } from '../../supabase/server'
import { db } from '../../db'
import { users } from '../../db/schema'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { acceptPendingInvitations } from '../projects/acceptPendingInvitations'

const RegisterSchema = z.object({
  email: z.string().email("Correo inválido"),
  password: z.string().min(6, "Mínimo 6 caracteres"),
})

export async function registerAction(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  const result = RegisterSchema.safeParse({ email, password })
  if (!result.success) {
    return { error: result.error.issues[0].message }
  }

  const supabase = await createClient()

  const { data, error: authError } = await supabase.auth.signUp({
    email,
    password,
  })

  if (authError) {
    return { error: authError.message }
  }

  if (!data.user) {
    return { error: 'Error desconocido al registrar usuario.' }
  }

  try {
    const [dbUser] = await db.insert(users).values({
      authId: data.user.id,
      email,
    }).returning({ id: users.id })
    await acceptPendingInvitations(dbUser.id, email)
  } catch {
    // Rollback: eliminar el usuario de auth para mantener consistencia
    // Usamos service_role_key si está disponible para tener permisos admin.
    // Si no está, el deleteUser puede fallar, pero lo intentamos con service_role_key para mayor robustez
    const cookieStore = await cookies()
    const supabaseAdmin = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() { return cookieStore.getAll() },
          setAll() {},
        }
      }
    )
    
    await supabaseAdmin.auth.admin.deleteUser(data.user.id)
    return { error: 'Error al crear el perfil. Intenta de nuevo.' }
  }

  return {
    success: true,
    message: 'Cuenta creada. Verifica tu correo para activar tu cuenta antes de iniciar sesion.',
  }
}
