'use client'

import { useState, useEffect } from 'react'
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
import { Loader2 } from 'lucide-react'

interface CreateProjectModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreated?: () => void
}

export function CreateProjectModal({ open, onOpenChange, onCreated }: CreateProjectModalProps) {
  const router = useRouter()
  const { activeConnection } = useConnectionStore()
  const [error, setError] = useState<string | null>(null)
  const [isPending, setIsPending] = useState(false)
  const [tags, setTags] = useState<string[]>([])
  
  // Table selection state
  const [tables, setTables] = useState<string[]>([])
  const [selectedTables, setSelectedTables] = useState<string[]>([])
  const [isLoadingSchema, setIsLoadingSchema] = useState(false)

  // Fetch schema when modal opens
  useEffect(() => {
    if (open && activeConnection) {
      const fetchSchema = async () => {
        setIsLoadingSchema(true)
        try {
          const schemaData = await generatorAPI.getSchema(activeConnection)
          if (schemaData.tables) {
            const tableNames = schemaData.tables.map((table) => typeof table === 'string' ? table : table.name)
            setTables(tableNames)
            setSelectedTables(tableNames) // Select all by default
          }
        } catch (err) {
          console.warn("Error fetching schema", err)
        } finally {
          setIsLoadingSchema(false)
        }
      }
      fetchSchema()
    }
  }, [open, activeConnection])

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!activeConnection || selectedTables.length === 0) {
      setError('Conecta una base de datos y selecciona al menos una tabla.')
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
    } else {
      const projectId = String(result.id)
      toast.success('Proyecto creado')

      toast.info('Generando diagrama...')
      try {
        await diagramsAPI.generate(projectId, {
          connection: activeConnection,
          selected_tables: selectedTables,
          name: name
        })
        toast.success('Diagrama generado')
      } catch (err) {
        await projectsAPI.permanentlyDelete(projectId).catch(() => undefined)
        setError(err instanceof Error ? err.message : 'No se pudo generar el diagrama desde la base de datos.')
        setIsPending(false)
        return
      }
      
      onOpenChange(false)
      setIsPending(false)
      setTags([])
      setTables([])
      setSelectedTables([])
      onCreated?.()
      
      // Navigate directly to the editor
      router.push(`/editor?projectId=${projectId}`)
    }
  }

  const toggleTable = (t: string) => {
    setSelectedTables(prev => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t])
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] bg-[#111827] border-[#1E2A45] text-[#E2E8F0] p-6 shadow-xl shadow-black/50 flex flex-col max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Nuevo Proyecto ER</DialogTitle>
          <DialogDescription className="text-[#94A3B8]">
            Ingresa los detalles y selecciona las tablas para generar el diagrama de base de datos.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-5 pt-4 flex-1 overflow-y-auto pr-2">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-[#94A3B8] font-medium">Nombre <span className="text-red-400">*</span></Label>
            <Input 
              id="name" 
              name="name" 
              required 
              maxLength={50}
              placeholder="Ej. Sistema de Ventas"
              className="bg-[#0A0F1E] border-[#1E2A45] focus-visible:ring-[#1A6CF6] focus-visible:border-[#1A6CF6] text-white"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description" className="text-[#94A3B8] font-medium">Descripción (opcional)</Label>
            <Textarea 
              id="description" 
              name="description" 
              maxLength={200}
              placeholder="Un breve resumen del proyecto..."
              className="bg-[#0A0F1E] border-[#1E2A45] focus-visible:ring-[#1A6CF6] focus-visible:border-[#1A6CF6] text-white resize-none"
              rows={2}
            />
          </div>
          
          {/* Table selection area */}
          <div className="space-y-2 border border-[#1E2A45] rounded-lg p-3 bg-[#0A0F1E]">
            <div className="flex items-center justify-between mb-2">
              <Label className="text-[#94A3B8] font-medium">Tablas a incluir en el Diagrama</Label>
              {isLoadingSchema && <Loader2 className="w-4 h-4 animate-spin text-blue-500" />}
            </div>
            {tables.length > 0 ? (
              <div className="max-h-40 overflow-y-auto space-y-1.5 custom-scrollbar pr-2">
                <div className="flex items-center gap-2 mb-2 pb-2 border-b border-[#1E2A45]">
                  <input 
                    type="checkbox" 
                    checked={selectedTables.length === tables.length}
                    onChange={(e) => setSelectedTables(e.target.checked ? tables : [])}
                    className="w-4 h-4 rounded border-gray-600 bg-gray-700 text-blue-500 focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-white">Seleccionar todas</span>
                </div>
                {tables.map(t => (
                  <label key={t} className="flex items-center gap-2 cursor-pointer hover:bg-[#1E2A45] p-1 rounded">
                    <input 
                      type="checkbox" 
                      checked={selectedTables.includes(t)}
                      onChange={() => toggleTable(t)}
                      className="w-4 h-4 rounded border-gray-600 bg-gray-700 text-blue-500 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-300">{t}</span>
                  </label>
                ))}
              </div>
            ) : (
              <div className="text-sm text-gray-500 p-2 text-center">
                {!isLoadingSchema ? "Conéctate a una base de datos para ver las tablas." : "Cargando..."}
              </div>
            )}
          </div>
          <div className="space-y-2">
            <Label className="text-[#94A3B8] font-medium">
              Tags <span style={{ color: '#6B7280' }}>(opcional)</span>
            </Label>
            <TagInput value={tags} onChange={setTags} />
          </div>
          {error && (
            <div className="bg-red-900/20 border border-red-900/50 p-3 rounded-md">
              <p className="text-red-400 text-sm font-medium">{error}</p>
            </div>
          )}
          <div className="flex justify-end gap-3 pt-4 border-t border-[#1E2A45] mt-6">
            <Button 
              type="button" 
              variant="ghost" 
              onClick={() => onOpenChange(false)}
              className="hover:bg-[#1E2A45] hover:text-white text-[#94A3B8]"
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={isPending}
              className="bg-[#1A6CF6] hover:bg-blue-700 text-white min-w-[140px]"
            >
              {isPending ? 'Creando...' : 'Crear Proyecto'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
