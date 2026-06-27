'use client'

import { useState } from 'react'
import { registerAction } from '@/lib/backend/actions/auth/register'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'

export function RegisterForm() {
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [isPending, setIsPending] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsPending(true)
    setError(null)
    setSuccess(null)

    const formData = new FormData(e.currentTarget)
    const result = await registerAction(formData)

    if (result?.error) {
      setError(result.error)
      setIsPending(false)
    } else if (result?.success) {
      setSuccess(result.message)
      setIsPending(false)
    }
  }

  return (
    <Card className="w-full max-w-md bg-[#111827] border-[#1E2A45] text-[#E2E8F0]">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center">Registro</CardTitle>
        <CardDescription className="text-center text-[#94A3B8]">
          Crea una cuenta nueva en FluxSQL
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-[#94A3B8]">Correo Electrónico</Label>
            <Input 
              id="email" 
              name="email" 
              type="email" 
              required 
              placeholder="correo@ejemplo.com"
              className="bg-[#0A0F1E] border-[#1E2A45] focus-visible:ring-[#1A6CF6] text-white"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password" className="text-[#94A3B8]">Contraseña</Label>
            <Input 
              id="password" 
              name="password" 
              type="password" 
              required 
              placeholder="Mínimo 6 caracteres"
              className="bg-[#0A0F1E] border-[#1E2A45] focus-visible:ring-[#1A6CF6] text-white"
            />
          </div>
          {error && (
            <div className="text-red-400 text-sm font-medium">
              {error}
            </div>
          )}
          {success && (
            <div className="text-emerald-300 text-sm font-medium">
              {success}
            </div>
          )}
        </CardContent>
        <CardFooter>
          <Button 
            type="submit" 
            disabled={isPending}
            className="w-full bg-[#1A6CF6] hover:bg-blue-700 text-white"
          >
            {isPending ? 'Registrando...' : 'Registrarse'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
