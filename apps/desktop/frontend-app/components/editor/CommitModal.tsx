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
import { serializeVersionSnapshots } from '@/lib/version-snapshots'
import { GitCommit } from 'lucide-react'

export function CommitModal({ projectId, children }: { projectId: string; children?: React.ReactNode }) {
  const [open, setOpen] = useState(false)
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  const { toObject } = useReactFlow()
  const sqlValue = useEditorStore((state) => state.sqlValue)
  const dialect = useEditorStore((state) => state.dialect)

  const handleCommit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!message.trim() || loading) return

    setLoading(true)
    
    // Obtener snapshot del estado actual del canvas
    const rawFlow = toObject()
    // ✅ Serializar y deserializar para limpiar referencias circulares
    const flowJson = JSON.parse(JSON.stringify(rawFlow))
    
    const snapshots = serializeVersionSnapshots(flowJson.nodes ?? [], flowJson.edges ?? [])
    const result = await createVersionAction({
      projectId,
      flowJson,
      sqlContent: sqlValue,
      message: message.trim(),
      activeDialect: dialect,
      snapshots
    })
    
    setLoading(false)

    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success(`Versión v${result.data?.versionNumber || '?'} guardada correctamente`)
      setOpen(false)
      setMessage('')
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button 
            variant="outline" 
            size="sm" 
            className="bg-[#111827] border-[#1E2A45] text-[#E2E8F0] hover:bg-[#1E2A45] hover:text-white"
          >
            <GitCommit className="w-4 h-4 mr-2 text-[#00D4FF]" />
            Commit
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="bg-[#111827] border-[#1E2A45] text-white sm:max-w-[425px]">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: -8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -8 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        >
          <DialogHeader>
            <DialogTitle>Guardar Versión (Commit)</DialogTitle>
            <DialogDescription className="text-[#94A3B8]">
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
                  className="bg-[#0A0F1E] border-[#1E2A45] focus-visible:ring-[#1A6CF6]"
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
