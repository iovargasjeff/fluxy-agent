'use client'

import { useEffect, useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { createProjectAction } from '@/lib/backend/actions/projects/create'
import { TagInput } from '@/components/ui/TagInput'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { useConnectionStore } from '@/lib/store/useConnectionStore'
import { generatorAPI, diagramsAPI, projectsAPI } from '@/lib/api/client'
import { Database, FileEdit, Loader2 } from 'lucide-react'

interface CreateProjectModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreated?: () => void
}

type CreationMode = 'blank' | 'database'

export function CreateProjectModal({ open, onOpenChange, onCreated }: CreateProjectModalProps) {
  const router = useRouter()
  const { activeConnection } = useConnectionStore()
  const [error, setError] = useState<string | null>(null)
  const [isPending, setIsPending] = useState(false)
  const [tags, setTags] = useState<string[]>([])
  const [creationMode, setCreationMode] = useState<CreationMode>('blank')
  const [tables, setTables] = useState<string[]>([])
  const [selectedTables, setSelectedTables] = useState<string[]>([])
  const [isLoadingSchema, setIsLoadingSchema] = useState(false)

  useEffect(() => {
    if (!open) return
    setError(null)

    if (creationMode !== 'database') {
      setTables([])
      setSelectedTables([])
      return
    }

    if (!activeConnection) {
      setTables([])
      setSelectedTables([])
      return
    }

    const fetchSchema = async () => {
      setIsLoadingSchema(true)
      try {
        const schemaData = await generatorAPI.getSchema(activeConnection)
        const tableNames = (schemaData.tables ?? []).map((table) => typeof table === 'string' ? table : table.name)
        setTables(tableNames)
        setSelectedTables(tableNames)
      } catch (err) {
        console.warn('Error fetching schema', err)
        setError('No se pudo leer el esquema de la base de datos.')
      } finally {
        setIsLoadingSchema(false)
      }
    }

    void fetchSchema()
  }, [activeConnection, creationMode, open])

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (creationMode === 'database' && (!activeConnection || selectedTables.length === 0)) {
      setError('Conecta una base de datos y selecciona al menos una tabla, o usa Diagrama libre.')
      return
    }

    setIsPending(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    const name = formData.get('name') as string
    const description = formData.get('description') as string
    const result = await createProjectAction(name, description)

    if (result?.error) {
      setError(result.error)
      setIsPending(false)
      return
    }

    const projectId = String(result.id)
    toast.success('Proyecto creado')

    try {
      if (creationMode === 'database' && activeConnection) {
        toast.info('Generando diagrama desde la base de datos...')
        await diagramsAPI.generate(projectId, {
          connection: activeConnection,
          selected_tables: selectedTables,
          name,
        })
        toast.success('Diagrama generado')
      } else {
        await diagramsAPI.create({
          project_id: Number(projectId),
          name: 'Diagrama Principal',
          schema_json: JSON.stringify({ nodes: [], edges: [] }),
          sql_content: '',
          active_dialect: 'postgresql',
        })
        toast.success('Diagrama libre creado')
      }
    } catch (err) {
      await projectsAPI.permanentlyDelete(projectId).catch(() => undefined)
      setError(err instanceof Error ? err.message : 'No se pudo preparar el diagrama.')
      setIsPending(false)
      return
    }

    onOpenChange(false)
    setIsPending(false)
    setTags([])
    setTables([])
    setSelectedTables([])
    setCreationMode('blank')
    onCreated?.()
    router.push(`/editor?projectId=${projectId}`)
  }

  const toggleTable = (tableName: string) => {
    setSelectedTables((prev) => prev.includes(tableName) ? prev.filter((item) => item !== tableName) : [...prev, tableName])
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[90vh] flex-col border-[#1E2A45] bg-[#111827] p-6 text-[#E2E8F0] shadow-xl shadow-black/50 sm:max-w-[560px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Nuevo Proyecto ER</DialogTitle>
          <DialogDescription className="text-[#94A3B8]">
            Crea un diagrama libre o genera uno desde una base de datos local.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex-1 space-y-5 overflow-y-auto pt-4 pr-2">
          <div className="space-y-2">
            <Label htmlFor="name" className="font-medium text-[#94A3B8]">Nombre <span className="text-red-400">*</span></Label>
            <Input
              id="name"
              name="name"
              required
              maxLength={50}
              placeholder="Ej. Sistema de Ventas"
              className="border-[#1E2A45] bg-[#0A0F1E] text-white focus-visible:border-[#1A6CF6] focus-visible:ring-[#1A6CF6]"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="font-medium text-[#94A3B8]">Descripcion (opcional)</Label>
            <Textarea
              id="description"
              name="description"
              maxLength={200}
              placeholder="Un breve resumen del proyecto..."
              className="resize-none border-[#1E2A45] bg-[#0A0F1E] text-white focus-visible:border-[#1A6CF6] focus-visible:ring-[#1A6CF6]"
              rows={2}
            />
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <ModeButton
              active={creationMode === 'blank'}
              icon={FileEdit}
              title="Diagrama libre"
              description="Disena tablas y relaciones sin conectarte a una BD."
              onClick={() => setCreationMode('blank')}
            />
            <ModeButton
              active={creationMode === 'database'}
              icon={Database}
              title="Desde base de datos"
              description="Lee el esquema real y crea el canvas desde tablas existentes."
              onClick={() => setCreationMode('database')}
            />
          </div>

          {creationMode === 'database' && (
            <div className="space-y-2 rounded-lg border border-[#1E2A45] bg-[#0A0F1E] p-3">
              <div className="mb-2 flex items-center justify-between">
                <Label className="font-medium text-[#94A3B8]">Tablas a incluir</Label>
                {isLoadingSchema && <Loader2 className="h-4 w-4 animate-spin text-blue-500" />}
              </div>
              {tables.length > 0 ? (
                <div className="max-h-40 space-y-1.5 overflow-y-auto pr-2">
                  <label className="mb-2 flex items-center gap-2 border-b border-[#1E2A45] pb-2">
                    <input
                      type="checkbox"
                      checked={selectedTables.length === tables.length}
                      onChange={(e) => setSelectedTables(e.target.checked ? tables : [])}
                      className="h-4 w-4 rounded border-gray-600 bg-gray-700 text-blue-500 focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-white">Seleccionar todas</span>
                  </label>
                  {tables.map((table) => (
                    <label key={table} className="flex cursor-pointer items-center gap-2 rounded p-1 hover:bg-[#1E2A45]">
                      <input
                        type="checkbox"
                        checked={selectedTables.includes(table)}
                        onChange={() => toggleTable(table)}
                        className="h-4 w-4 rounded border-gray-600 bg-gray-700 text-blue-500 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-300">{table}</span>
                    </label>
                  ))}
                </div>
              ) : (
                <div className="p-2 text-center text-sm text-gray-500">
                  {isLoadingSchema ? 'Cargando...' : 'Conectate a una base de datos para ver las tablas.'}
                </div>
              )}
            </div>
          )}

          <div className="space-y-2">
            <Label className="font-medium text-[#94A3B8]">
              Tags <span className="text-[#6B7280]">(opcional)</span>
            </Label>
            <TagInput value={tags} onChange={setTags} />
          </div>

          {error && (
            <div className="rounded-md border border-red-900/50 bg-red-900/20 p-3">
              <p className="text-sm font-medium text-red-400">{error}</p>
            </div>
          )}

          <div className="mt-6 flex justify-end gap-3 border-t border-[#1E2A45] pt-4">
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
              className="text-[#94A3B8] hover:bg-[#1E2A45] hover:text-white"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isPending}
              className="min-w-[140px] bg-[#1A6CF6] text-white hover:bg-blue-700"
            >
              {isPending ? 'Creando...' : 'Crear Proyecto'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function ModeButton({
  active,
  icon: Icon,
  title,
  description,
  onClick,
}: {
  active: boolean
  icon: typeof FileEdit
  title: string
  description: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-lg border p-3 text-left transition ${
        active
          ? 'border-[#1A6CF6] bg-[#1A6CF6]/15 text-white'
          : 'border-[#1E2A45] bg-[#0A0F1E] text-[#94A3B8] hover:bg-[#111827]'
      }`}
    >
      <Icon className="mb-2 h-5 w-5" />
      <p className="text-sm font-semibold">{title}</p>
      <p className="mt-1 text-xs text-[#94A3B8]">{description}</p>
    </button>
  )
}
