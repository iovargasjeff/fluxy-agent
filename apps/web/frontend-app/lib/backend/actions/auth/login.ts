'use server'

import { z } from 'zod'
import { createClient } from '../../supabase/server'
import { redirect } from 'next/navigation'
import { db } from '../../db'
import { users } from '../../db/schema'
import { eq } from 'drizzle-orm'
import { acceptPendingInvitations } from '../projects/acceptPendingInvitations'

const ERROR_MAP: Record<string, string> = {
  'Invalid login credentials': 'Correo o contraseña incorrectos',
  'Email not confirmed': 'Debes confirmar tu correo antes de iniciar sesión',
  'Too many requests': 'Demasiados intentos. Espera unos minutos.',
}

const LoginSchema = z.object({
  email: z.string().email("Correo inválido"),
  password: z.string().min(1, "La contraseña es obligatoria"),
})

export async function loginAction(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const next = formData.get('next') as string | null


  const result = LoginSchema.safeParse({ email, password })
  if (!result.success) {
    return { error: result.error.issues[0].message }
  }


  const supabase = await createClient()

  const { error: authError } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (authError) {
    const friendlyError = ERROR_MAP[authError.message] ?? 'Error al iniciar sesión. Intenta de nuevo.'
    return { error: friendlyError }
  }

  const { data: { user } } = await supabase.auth.getUser()
  if (user?.email) {
    const [dbUser] = await db.select({ id: users.id }).from(users).where(eq(users.authId, user.id)).limit(1)
    if (dbUser) await acceptPendingInvitations(dbUser.id, user.email)
  }

  redirect(next?.startsWith('/') ? next : '/dashboard')
}
