'use client'

import { useState } from 'react'
import { loginAction } from '@/lib/backend/actions/auth/login'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'

export function LoginForm() {
  const [error, setError] = useState<string | null>(null)
  const [isPending, setIsPending] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsPending(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    const result = await loginAction(formData)

    if (result?.error) {
      setError(result.error)
      setIsPending(false)
    }
  }

  return (
    <Card className="w-full max-w-md bg-[#111827] border-[#1E2A45] text-[#E2E8F0]">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center">Iniciar Sesión</CardTitle>
        <CardDescription className="text-center text-[#94A3B8]">
          Ingresa a tu cuenta de FluxSQL
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
              className="bg-[#0A0F1E] border-[#1E2A45] focus-visible:ring-[#1A6CF6] text-white"
            />
          </div>
          {error && (
            <div className="text-red-400 text-sm font-medium">
              {error}
            </div>
          )}
        </CardContent>
        <CardFooter>
          <Button 
            type="submit" 
            disabled={isPending}
            className="w-full bg-[#1A6CF6] hover:bg-blue-700 text-white"
          >
            {isPending ? 'Iniciando sesión...' : 'Entrar'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
