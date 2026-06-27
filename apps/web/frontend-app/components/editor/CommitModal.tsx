'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import { useReactFlow } from '@xyflow/react'
import { useEditorStore } from '@/store/useEditorStore'
import { createVersionAction } from '@/lib/backend/actions/versions/create'
import { GitCommit } from 'lucide-react'

interface CommitModalProps {
  projectId: string
  asToolbarButton?: boolean
}

export function CommitModal({ projectId, asToolbarButton }: CommitModalProps) {
  const [open, setOpen] = useState(false)
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  const { toObject } = useReactFlow()
  const sqlValue = useEditorStore((state) => state.sqlValue)

  const handleCommit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!message.trim() || loading) return

    setLoading(true)
    
    // Obtener snapshot del estado actual del canvas
    const rawFlow = toObject()
    // ✅ Serializar y deserializar para limpiar referencias circulares
    const flowJson = JSON.parse(JSON.stringify(rawFlow))
    
    const result = await createVersionAction(projectId, flowJson, sqlValue, message.trim())
    
    setLoading(false)

    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success(`Versión v${result.versionNumber} guardada correctamente`)
      setOpen(false)
      setMessage('')
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {asToolbarButton ? (
          <button className="flex min-w-20 flex-col items-center gap-1 border-r border-[#1E2A45] px-3 py-2 text-[11px] last:border-r-0 text-[#94A3B8] hover:text-white">
            <GitCommit size={15} />
            Commit
          </button>
        ) : (
          <Button 
            variant="outline" 
            size="sm" 
            className="bg-[#0B1322] border-[#1E2A45] text-[#94A3B8] hover:bg-[#111827] hover:text-white"
          >
            <GitCommit className="w-4 h-4 mr-2 text-[#1A6CF6]" />
            Commit
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="bg-white border-slate-200 text-slate-900 sm:max-w-[425px]">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: -8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -8 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        >
          <DialogHeader>
            <DialogTitle>Guardar Versión (Commit)</DialogTitle>
            <DialogDescription className="text-slate-500">
              Guarda una instantánea del esquema y canvas actual para poder restaurarla en el futuro.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCommit}>
            <div className="grid gap-4 py-4">
              <div className="flex flex-col gap-2">
                <Input
                  id="message"
                  placeholder="Ej: Añadida tabla de productos"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  maxLength={100}
                  className="bg-white border-slate-200 text-slate-900 focus-visible:ring-[#1A6CF6]"
                  disabled={loading}
                />
              </div>
            </div>
            <DialogFooter>
              <Button 
                type="submit" 
                disabled={loading || message.trim() === ''}
                className="bg-[#1A6CF6] hover:bg-[#1A6CF6]/90 text-white w-full sm:w-auto"
              >
                {loading ? 'Guardando...' : 'Hacer Commit'}
              </Button>
            </DialogFooter>
          </form>
        </motion.div>
      </DialogContent>
    </Dialog>
  )
}
