'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { Check, ChevronDown, Copy, Eye, Link, Loader2, Pencil } from 'lucide-react'
import { togglePublicAction } from '@/lib/backend/actions/projects/togglePublic'

interface PublicShareToggleProps {
  diagramId: string
  initialIsPublic: boolean
  initialShareAccess?: 'view' | 'edit'
}

const ACCESS_OPTIONS = [
  { value: 'view' as const, label: 'Solo ver', icon: Eye },
  { value: 'edit' as const, label: 'Puede editar', icon: Pencil },
]

export function PublicShareToggle({ diagramId, initialIsPublic, initialShareAccess = 'view' }: PublicShareToggleProps) {
  const [isPublic, setIsPublic] = useState(initialIsPublic)
  const [shareAccess, setShareAccess] = useState<'view' | 'edit'>(initialShareAccess)
  const [loading, setLoading] = useState(false)
  const [accessOpen, setAccessOpen] = useState(false)
  const activeAccess = ACCESS_OPTIONS.find((option) => option.value === shareAccess) ?? ACCESS_OPTIONS[0]
  const ActiveAccessIcon = activeAccess.icon

  const publicUrl =
    typeof window === 'undefined'
      ? `/public?id=${diagramId}`
      : `${window.location.origin}/public?id=${diagramId}`

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
    navigator.clipboard.writeText(publicUrl).catch(() => { })
    toast.success('Link copiado. El usuario deberá iniciar sesión para verlo.')
  }

  return (
    <div className="flex shrink-0 items-center gap-2 rounded-xl border border-[#1E2A45] bg-[#0A0F1E] px-2 py-1">
      <button
        type="button"
        role="switch"
        aria-checked={isPublic}
        disabled={loading}
        onClick={() => persist(!isPublic)}
        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A6CF6] disabled:opacity-50 ${isPublic ? 'bg-[#1A6CF6]' : 'bg-[#374151]'
          }`}
        title="Activar enlace protegido"
      >
        <span className="sr-only">Habilitar enlace compartido protegido</span>
        <span
          className={`pointer-events-none flex h-5 w-5 items-center justify-center rounded-full bg-white shadow-lg transition-transform ${isPublic ? 'translate-x-5' : 'translate-x-0.5'
            }`}
        >
          {loading ? <Loader2 className="h-3 w-3 animate-spin text-gray-500" /> : isPublic ? <Link className="h-3 w-3 text-[#1A6CF6]" /> : null}
        </span>
      </button>

      <div
        className="relative"
        onBlur={(event) => {
          const nextFocus = event.relatedTarget
          if (!(nextFocus instanceof Node) || !event.currentTarget.contains(nextFocus)) {
            setAccessOpen(false)
          }
        }}
      >
        <button
          type="button"
          disabled={!isPublic || loading}
          onClick={() => setAccessOpen((value) => !value)}
          className="flex h-7 min-w-32 items-center justify-between gap-2 rounded-lg border border-[#1E2A45] bg-[#111827] px-2 text-xs text-[#E2E8F0] outline-none transition hover:border-[#1A6CF6] disabled:opacity-50"
          title="Permiso del enlace"
        >
          <span className="flex items-center gap-1.5">
            <ActiveAccessIcon size={13} />
            {activeAccess.label}
          </span>
          <ChevronDown size={13} className={`transition-transform ${accessOpen ? 'rotate-180' : ''}`} />
        </button>

        {accessOpen && isPublic && !loading && (
          <div className="absolute right-0 top-9 z-[120] w-40 overflow-hidden rounded-lg border border-[#1E2A45] bg-[#0B1322] p-1 shadow-2xl shadow-black/50">
            {ACCESS_OPTIONS.map(({ value, label, icon: Icon }) => (
              <button
                key={value}
                type="button"
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => {
                  setAccessOpen(false)
                  if (value !== shareAccess) void persist(true, value)
                }}
                className={`flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-xs transition ${
                  value === shareAccess
                    ? 'bg-[#123A79] text-[#BFDBFE]'
                    : 'text-[#CBD5E1] hover:bg-[#111827] hover:text-white'
                }`}
              >
                <Icon size={13} />
                <span className="flex-1">{label}</span>
                {value === shareAccess && <Check size={13} />}
              </button>
            ))}
          </div>
        )}
      </div>

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
