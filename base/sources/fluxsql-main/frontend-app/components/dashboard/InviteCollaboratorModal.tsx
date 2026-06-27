'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import { inviteCollaborator } from '@/lib/backend/actions/projects/invite'
import { UserPlus } from 'lucide-react'

interface InviteCollaboratorModalProps {
  projectId: string
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export function InviteCollaboratorModal({ 
  projectId, 
  open: externalOpen, 
  onOpenChange 
}: InviteCollaboratorModalProps) {
  const [localOpen, setLocalOpen] = useState(false)
  const open = externalOpen !== undefined ? externalOpen : localOpen
  const setOpen = (newOpen: boolean) => {
    setLocalOpen(newOpen)
    onOpenChange?.(newOpen)
  }
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault()
    e.stopPropagation() // Prevent link navigation
    if (!email.trim() || loading) return

    setLoading(true)
    const result = await inviteCollaborator(projectId, email)
    setLoading(false)

    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success('Invitación enviada correctamente')
      setOpen(false)
      setEmail('')
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm" 
          className="text-[#94A3B8] hover:text-white hover:bg-[#1E2A45] px-2 h-7"
          onClick={(e) => e.stopPropagation()} // Prevent card link navigation
        >
          <UserPlus className="w-4 h-4 mr-1" />
          <span className="text-xs">Invitar</span>
        </Button>
      </DialogTrigger>
      <DialogContent 
        className="bg-[#111827] border-[#1E2A45] text-white sm:max-w-[425px]"
        onClick={(e) => e.stopPropagation()} // Prevent card link navigation
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: -8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -8 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        >
          <DialogHeader>
            <DialogTitle>Invitar Colaborador</DialogTitle>
            <DialogDescription className="text-[#94A3B8]">
              Ingresa el email del usuario que deseas invitar a este proyecto.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleInvite}>
            <div className="grid gap-4 py-4">
              <div className="flex flex-col gap-2">
                <Input
                  id="email"
                  type="email"
                  placeholder="usuario@ejemplo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-[#0A0F1E] border-[#1E2A45] focus-visible:ring-[#1A6CF6]"
                  disabled={loading}
                />
              </div>
            </div>
            <DialogFooter>
              <Button 
                type="submit" 
                disabled={loading || email.trim() === ''}
                className="bg-[#1A6CF6] hover:bg-[#1A6CF6]/90 text-white w-full sm:w-auto"
              >
                {loading ? 'Invitando...' : 'Invitar'}
              </Button>
            </DialogFooter>
          </form>
        </motion.div>
      </DialogContent>
    </Dialog>
  )
}
