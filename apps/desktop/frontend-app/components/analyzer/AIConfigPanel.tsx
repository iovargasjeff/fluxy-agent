'use client'

import { useEffect, useState } from 'react'
import { Bot, Settings2, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { analyzerAPI } from '@/lib/api/client'

interface Provider { id: string; name: string; provider: string; protocol: string; base_url: string; model: string; has_api_key: boolean }
interface Preset { id: string; name: string; protocol: string; base_url: string; model: string }
interface Props {
  onSaveConfig: (config: { providerId: string }) => void
  onAnalyzeWithAI: () => void
  isAnalyzingAI: boolean
  disabled: boolean
}

export function AIConfigPanel({ onSaveConfig, onAnalyzeWithAI, isAnalyzingAI, disabled }: Props) {
  const [isOpen, setIsOpen] = useState(false)
  const [providers, setProviders] = useState<Provider[]>([])
  const [presets, setPresets] = useState<Preset[]>([])
  const [selectedId, setSelectedId] = useState('')
  const [form, setForm] = useState({ name: '', provider: 'openai', protocol: 'openai', base_url: '', model: '', api_key: '' })

  async function loadProviders() {
    const result = await analyzerAPI.listProviders()
    setProviders(result.providers)
    setPresets(result.presets)
    if (!selectedId && result.providers[0]) selectProvider(result.providers[0])
  }

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadProviders().catch(() => toast.error('No se pudieron cargar los proveedores de IA.'))
    }, 0)
    return () => window.clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function selectProvider(provider: Provider) {
    setSelectedId(provider.id)
    setForm({ ...provider, api_key: '' })
    onSaveConfig({ providerId: provider.id })
  }

  function selectPreset(id: string) {
    const preset = presets.find((item) => item.id === id)
    if (!preset) return
    setSelectedId('')
    setForm({ name: preset.name, provider: preset.id, protocol: preset.protocol, base_url: preset.base_url, model: preset.model, api_key: '' })
  }

  async function handleSave() {
    if (!form.name.trim() || !form.base_url.trim() || !form.model.trim()) return toast.error('Completa nombre, URL y modelo.')
    const saved = selectedId
      ? await analyzerAPI.updateProvider(selectedId, form)
      : await analyzerAPI.createProvider(form)
    setSelectedId(saved.id)
    onSaveConfig({ providerId: saved.id })
    await loadProviders()
    toast.success('Proveedor guardado de forma cifrada.')
  }

  async function handleDelete(id: string) {
    await analyzerAPI.deleteProvider(id)
    if (selectedId === id) setSelectedId('')
    await loadProviders()
    toast.success('Proveedor eliminado.')
  }

  async function handleTest() {
    if (!selectedId) return
    const result = await analyzerAPI.testProvider(selectedId)
    toast[result.success ? 'success' : 'error'](result.success ? 'Proveedor conectado correctamente.' : 'El proveedor no respondio.')
  }

  return (
    <div className="overflow-hidden rounded-lg border border-slate-200 bg-white dark:border-gray-800 dark:bg-gray-900">
      <button className="flex w-full items-center justify-between bg-slate-50 p-4 hover:bg-slate-100 dark:bg-gray-800/50 dark:hover:bg-gray-800" onClick={() => setIsOpen(!isOpen)}>
        <span className="flex items-center gap-2 font-semibold"><Bot className="h-5 w-5 text-blue-400" />Asistente IA</span>
        <Settings2 className="h-4 w-4 text-slate-400 dark:text-gray-400" />
      </button>
      {isOpen && (
        <div className="flex flex-col gap-3 border-t border-slate-200 p-4 dark:border-gray-800">
          <select value={form.provider} onChange={(event) => selectPreset(event.target.value)} className="rounded border border-slate-200 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-950 dark:text-white">
            {presets.map((preset) => <option key={preset.id} value={preset.id}>{preset.name}</option>)}
          </select>
          <input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="Nombre" className="rounded border border-slate-200 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-950 dark:text-white" />
          <input value={form.base_url} onChange={(event) => setForm({ ...form, base_url: event.target.value })} placeholder="URL base" className="rounded border border-slate-200 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-950 dark:text-white" />
          <input value={form.model} onChange={(event) => setForm({ ...form, model: event.target.value })} placeholder="Modelo" className="rounded border border-slate-200 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-950 dark:text-white" />
          <input type="password" value={form.api_key} onChange={(event) => setForm({ ...form, api_key: event.target.value })} placeholder={selectedId ? 'Nueva API key (opcional)' : 'API key'} className="rounded border border-slate-200 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-950 dark:text-white" />
          <button onClick={() => void handleSave()} className="rounded bg-[#1A6CF6] py-2 text-sm font-medium text-white hover:bg-[#1559d1]">Guardar proveedor</button>
          {selectedId && <button onClick={() => void handleTest()} className="rounded border border-blue-500/30 py-2 text-sm font-medium text-blue-600 dark:text-blue-300">Probar proveedor</button>}
          {providers.map((provider) => (
            <div key={provider.id} className={`flex items-center gap-2 rounded border p-2 ${selectedId === provider.id ? 'border-blue-500 bg-blue-500/10' : 'border-slate-200 dark:border-gray-800'}`}>
              <button className="min-w-0 flex-1 text-left" onClick={() => selectProvider(provider)}>
                <div className="truncate text-sm">{provider.name}</div>
                <div className="truncate text-xs text-slate-500 dark:text-gray-500">{provider.model}</div>
              </button>
              <button title="Eliminar proveedor" onClick={() => void handleDelete(provider.id)} className="p-2 text-red-400"><Trash2 size={15} /></button>
            </div>
          ))}
        </div>
      )}
      {selectedId && (
        <div className="border-t border-slate-200 p-4 dark:border-gray-800">
          <button onClick={onAnalyzeWithAI} disabled={disabled || isAnalyzingAI} className="flex w-full items-center justify-center gap-2 rounded-lg border border-blue-500/30 bg-blue-600/10 py-2 text-sm font-medium text-blue-600 disabled:opacity-50 dark:bg-blue-600/20 dark:text-blue-400">
            <Bot className="h-4 w-4" />
            {isAnalyzingAI ? 'Analizando...' : 'Explicar con IA'}
          </button>
        </div>
      )}
    </div>
  )
}
