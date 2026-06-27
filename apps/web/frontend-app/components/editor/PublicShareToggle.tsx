'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { Copy, Link, Loader2 } from 'lucide-react'
import { togglePublicAction } from '@/lib/backend/actions/projects/togglePublic'

interface PublicShareToggleProps {
  diagramId: string
  initialIsPublic: boolean
  initialShareAccess?: 'view' | 'edit'
}

export function PublicShareToggle({ diagramId, initialIsPublic, initialShareAccess = 'view' }: PublicShareToggleProps) {
  const [isPublic, setIsPublic] = useState(initialIsPublic)
  const [shareAccess, setShareAccess] = useState<'view' | 'edit'>(initialShareAccess)
  const [loading, setLoading] = useState(false)

  const publicUrl =
    typeof window === 'undefined'
      ? `/public/${diagramId}`
      : `${window.location.origin}/public/${diagramId}`

  async function persist(nextPublic: boolean, nextAccess = shareAccess) {
    if (loading) return
    setLoading(true)
    try {
      const result = await togglePublicAction(diagramId, nextPublic, nextAccess)
      if (result.error) {
        toast.error(result.error)
        return
      }
      setIsPublic(nextPublic)
      setShareAccess(nextAccess)
      toast.success(nextPublic ? 'Link protegido actualizado' : 'El enlace compartido fue desactivado')
    } catch {
      toast.error('Error inesperado al cambiar privacidad')
    } finally {
      setLoading(false)
    }
  }

  function handleCopy() {
    navigator.clipboard.writeText(publicUrl).catch(() => {})
    toast.success('Link copiado. El usuario deberá iniciar sesión para verlo.')
  }

  return (
    <div className="relative flex items-center gap-2 rounded-xl border border-[#1E2A45] bg-[#0A0F1E] px-2 py-1 z-40">
      <button
        type="button"
        role="switch"
        aria-checked={isPublic}
        disabled={loading}
        onClick={() => persist(!isPublic)}
        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A6CF6] disabled:opacity-50 ${
          isPublic ? 'bg-[#1A6CF6]' : 'bg-[#374151]'
        }`}
        title="Activar enlace protegido"
      >
        <span className="sr-only">Habilitar enlace compartido protegido</span>
        <span
          className={`pointer-events-none flex h-5 w-5 items-center justify-center rounded-full bg-white shadow-lg transition-transform ${
            isPublic ? 'translate-x-5' : 'translate-x-0.5'
          }`}
        >
          {loading ? <Loader2 className="h-3 w-3 animate-spin text-gray-500" /> : isPublic ? <Link className="h-3 w-3 text-[#1A6CF6]" /> : null}
        </span>
      </button>

      <select
        value={shareAccess}
        disabled={!isPublic || loading}
        onChange={(event) => persist(true, event.target.value as 'view' | 'edit')}
        className="relative h-7 rounded-lg border border-[#1E2A45] bg-[#111827] px-2 text-xs text-[#E2E8F0] outline-none disabled:opacity-50 z-50"
        title="Permiso del enlace"
      >
        <option value="view">Solo ver</option>
        <option value="edit">Puede editar</option>
      </select>

      <button
        onClick={handleCopy}
        disabled={!isPublic}
        title="Copiar link"
        className="rounded-lg p-1.5 text-[#1A6CF6] transition hover:bg-[#1A6CF6]/10 disabled:text-[#475569]"
      >
        <Copy size={14} />
      </button>
    </div>
  )
}
