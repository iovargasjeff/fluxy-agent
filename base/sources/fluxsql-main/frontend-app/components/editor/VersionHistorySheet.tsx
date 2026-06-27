'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { History, Clock, ArrowRight } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'
import { listVersionsAction } from '@/lib/backend/actions/versions/list'
import { toast } from 'sonner'

interface VersionHistorySheetProps {
  projectId: string
  onRestore?: (versionId: string) => void
  onCompare?: (versionId: string, versionNumber: number) => void
  children?: React.ReactNode
}

interface VersionData {
  id: string
  versionNumber: number
  message: string
  userId: string
  createdAt: Date | null
  authorName: string | null
}

export function VersionHistorySheet({ projectId, onRestore, onCompare, children }: VersionHistorySheetProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [versions, setVersions] = useState<VersionData[]>([])

  useEffect(() => {
    if (!open) return

    let isMounted = true
    const fetchVersions = async () => {
      setLoading(true)
      const result = await listVersionsAction(projectId)
      if (isMounted) {
        if (result.error) {
          toast.error(result.error)
        } else if (result.data) {
          setVersions(result.data)
        }
        setLoading(false)
      }
    }

    fetchVersions()

    return () => {
      isMounted = false
    }
  }, [open, projectId])

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        {children ? (
          children
        ) : (
          <Button
            variant="outline"
            size="sm"
            className="bg-[#111827] border-[#1E2A45] text-[#E2E8F0] hover:bg-[#1E2A45] hover:text-white"
          >
            <History className="w-4 h-4 mr-2 text-[#94A3B8]" />
            Historial
          </Button>
        )}
      </SheetTrigger>
      <SheetContent 
        side="right" 
        className="w-80 bg-[#111827] border-l border-[#1E2A45] text-white p-0 flex flex-col"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: -8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -8 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="flex-1 flex flex-col overflow-hidden"
        >
          <SheetHeader className="p-6 pb-4 border-b border-[#1E2A45]">
            <SheetTitle className="text-[#E2E8F0]">Historial de Versiones</SheetTitle>
            <SheetDescription className="text-[#94A3B8]">
              Explora o restaura snapshots anteriores de tu esquema.
            </SheetDescription>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
            {loading ? (
              // Skeleton Loading
              [1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse bg-[#1E2A45] rounded-lg p-4 h-24"></div>
              ))
            ) : versions.length === 0 ? (
              // Empty State
              <div className="flex flex-col items-center justify-center h-48 text-center px-4">
                <Clock className="w-10 h-10 text-[#1E2A45] mb-3" />
                <p className="text-sm font-medium text-[#E2E8F0]">
                  Aún no hay versiones guardadas
                </p>
                <p className="text-xs text-[#94A3B8] mt-1">
                  Usa &apos;Commit&apos; para guardar un snapshot
                </p>
              </div>
            ) : (
              // Lista de Versiones
              versions.map((version) => (
                <div
                  key={version.id}
                  className="group relative bg-[#0A0F1E] border border-[#1E2A45] rounded-lg p-4 hover:border-[#1A6CF6]/50 transition-all flex flex-col gap-2"
                >
                  <div className="flex justify-between items-start">
                    <span className="text-[#1A6CF6] font-mono font-bold text-sm">
                      v{version.versionNumber}
                    </span>
                    <span className="text-[10px] text-[#94A3B8]">
                      {version.createdAt
                        ? formatDistanceToNow(new Date(version.createdAt), {
                            addSuffix: true,
                            locale: es,
                          })
                        : 'Fecha desconocida'}
                    </span>
                  </div>
                  
                  <p className="text-sm text-[#E2E8F0] leading-snug break-words">
                    {version.message}
                  </p>

                  <div className="text-xs text-[#64748B] flex items-center mt-1">
                    Por: {version.authorName ?? version.userId.substring(0, 8)}
                  </div>

                  <div className="absolute bottom-2 right-2 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    {onCompare && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          onCompare(version.id, version.versionNumber)
                        }}
                        className="h-7 px-2 text-xs bg-[#1E2A45] text-white hover:bg-[#1E2A45]/80 hover:text-white transition-opacity"
                      >
                        Comparar ↔
                      </Button>
                    )}

                    {onRestore && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          onRestore(version.id)
                          setOpen(false)
                        }}
                        className="h-7 px-2 text-xs bg-[#1A6CF6] text-white hover:bg-[#1A6CF6]/80 hover:text-white transition-opacity"
                      >
                        Restaurar <ArrowRight className="w-3 h-3 ml-1" />
                      </Button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </motion.div>
      </SheetContent>
    </Sheet>
  )
}
