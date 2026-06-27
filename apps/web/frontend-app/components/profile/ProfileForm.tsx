'use client'

import { useState, useRef } from 'react'
import Image from 'next/image'
import { Camera } from 'lucide-react'
import { createClient } from '@/lib/backend/supabase/client'
import { updateUserProfile } from '@/lib/backend/actions/profile/update'
import { getInitials, getAvatarColor } from '@/lib/utils/avatar'
import { useRouter } from 'next/navigation'

interface ProfileFormProps {
  userId: string
  initialName: string
  initialEmail: string
  initialAvatarUrl: string | null
}

export function ProfileForm({ userId, initialName, initialEmail, initialAvatarUrl }: ProfileFormProps) {
  const [name, setName] = useState(initialName)
  const [avatarUrl, setAvatarUrl] = useState<string | null>(initialAvatarUrl)
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  async function handleAvatarUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type)) {
      setMessage({ type: 'error', text: 'Solo se aceptan PNG, JPG o WEBP' })
      return
    }
    setUploading(true)
    setMessage(null)
    try {
      const supabase = createClient()
      const ext = file.type === 'image/png' ? 'png' : file.type === 'image/jpeg' ? 'jpg' : 'webp'
      const path = `${userId}.${ext}`
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(path, file, { upsert: true, contentType: file.type })
      if (uploadError) throw uploadError
      const { data } = supabase.storage.from('avatars').getPublicUrl(path)
      const urlWithBust = `${data.publicUrl}?t=${Date.now()}`
      setAvatarUrl(urlWithBust)
      await updateUserProfile({ userId, avatarUrl: data.publicUrl })
      setMessage({ type: 'success', text: 'Foto actualizada correctamente' })
    } catch {
      setMessage({ type: 'error', text: 'Error al subir la foto. Intenta de nuevo.' })
    } finally {
      setUploading(false)
    }
  }

  async function handleSaveName(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    setSaving(true)
    setMessage(null)
    try {
      await updateUserProfile({ userId, name: name.trim() })
      setMessage({ type: 'success', text: 'Nombre actualizado correctamente' })
    } catch {
      setMessage({ type: 'error', text: 'Error al guardar. Intenta de nuevo.' })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="rounded-2xl p-8 bg-[#111827]/80 backdrop-blur-xl border border-gray-800 shadow-2xl relative overflow-hidden">
      {/* Decorative gradient top border */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500" />
      
      {/* Avatar */}
      <div className="flex flex-col sm:flex-row items-center gap-6 mb-10">
        <div className="relative group cursor-pointer shrink-0" onClick={() => fileInputRef.current?.click()}>
          {avatarUrl ? (
            <Image
              src={avatarUrl}
              alt="Avatar"
              width={100}
              height={100}
              unoptimized
              className="w-24 h-24 sm:w-28 sm:h-28 rounded-full object-cover shadow-lg shadow-black/50 ring-4 ring-gray-800/50 group-hover:ring-blue-500/50 transition-all"
            />
          ) : (
            <div
              className="w-24 h-24 sm:w-28 sm:h-28 rounded-full flex items-center justify-center text-white text-3xl font-bold shadow-lg shadow-black/50 ring-4 ring-gray-800/50 group-hover:ring-blue-500/50 transition-all"
              style={{ backgroundColor: getAvatarColor(name || initialName) }}
            >
              {getInitials(name || initialName)}
            </div>
          )}
          <div
            className="absolute inset-0 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/60 backdrop-blur-sm"
          >
            {uploading ? (
              <span className="text-white text-xs font-medium">Subiendo...</span>
            ) : (
              <Camera size={24} className="text-white" />
            )}
          </div>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          className="hidden"
          onChange={handleAvatarUpload}
        />
        <div className="text-center sm:text-left">
          <h3 className="text-lg font-semibold text-white mb-1">Foto de perfil</h3>
          <p className="text-sm text-gray-400 mb-3">
            Sube una imagen en formato PNG, JPG o WEBP. Tamaño máximo 2MB.
          </p>
          <button 
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="text-sm font-medium text-blue-400 hover:text-blue-300 transition-colors"
          >
            Cambiar foto
          </button>
        </div>
      </div>

      {/* Formulario nombre */}
      <form onSubmit={handleSaveName} className="flex flex-col gap-6">
        <div className="grid gap-6 sm:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">Nombre completo</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full px-4 py-3 rounded-xl text-sm text-white bg-gray-900/50 border border-gray-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all placeholder:text-gray-500"
              placeholder="Tu nombre"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">
              Correo electrónico
            </label>
            <input
              type="email"
              value={initialEmail}
              disabled
              className="w-full px-4 py-3 rounded-xl text-sm text-gray-400 bg-gray-900/30 border border-gray-800 cursor-not-allowed"
            />
            <p className="text-xs text-gray-500">El correo electrónico no se puede modificar.</p>
          </div>
        </div>

        {message && (
          <div
            className={`text-sm px-4 py-3 rounded-xl flex items-center gap-2 ${
              message.type === 'success' 
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                : 'bg-red-500/10 text-red-400 border border-red-500/20'
            }`}
          >
            <div className={`w-1.5 h-1.5 rounded-full ${message.type === 'success' ? 'bg-emerald-400' : 'bg-red-400'}`} />
            {message.text}
          </div>
        )}

        <div className="pt-4 mt-2 border-t border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-gray-500">
            Asegúrate de guardar los cambios antes de salir.
          </p>
          <div className="flex w-full sm:w-auto items-center gap-3">
            {message?.type === 'success' && (
              <button
                type="button"
                onClick={() => router.push('/dashboard')}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-sm font-medium text-gray-300 hover:text-white bg-gray-800 hover:bg-gray-700 border border-gray-700 transition-all"
              >
                Regresar al Dashboard
              </button>
            )}
            <button
              type="submit"
              disabled={saving || !name.trim() || name === initialName}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl text-sm font-medium text-white bg-blue-600 hover:bg-blue-500 disabled:bg-gray-800 disabled:text-gray-500 disabled:cursor-not-allowed transition-all shadow-lg shadow-blue-500/20 disabled:shadow-none"
            >
              {saving ? 'Guardando...' : 'Guardar cambios'}
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}
