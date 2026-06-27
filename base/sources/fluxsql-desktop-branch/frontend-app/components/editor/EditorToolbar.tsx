'use client'

import { useState } from 'react'
import { useReactFlow } from '@xyflow/react'
import { toast } from 'sonner'
import { saveDiagramAction } from '@/lib/backend/actions/diagrams/save'
import { useEditorStore } from '@/store/useEditorStore'
import { ExportMenu } from './ExportMenu'
import { CommitModal } from './CommitModal'
import { VersionHistorySheet } from './VersionHistorySheet'
import { restoreVersionAction } from '@/lib/backend/actions/versions/restore'
import { DiffViewerModal } from './DiffViewerModal'
import { PublicShareToggle } from './PublicShareToggle'
import { ThemeToggle } from '@/components/ThemeToggle'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { Save } from 'lucide-react'
import { toFlowJson } from '@/lib/flow-types'

interface EditorToolbarProps {
  projectId: string
  projectName: string
  dialect?: string
  initialIsPublic?: boolean
}

function ToolbarButton({
  icon: Icon,
  label,
  onClick,
  disabled = false,
  variant = 'default',
  shortcut,
}: {
  icon: React.ElementType
  label: string
  onClick?: () => void
  disabled?: boolean
  variant?: 'default' | 'primary' | 'danger'
  shortcut?: string
}) {
  const colorMap = {
    default: 'text-[#6B7280] hover:text-white hover:bg-[#1E2A45]',
    primary: 'text-[#1A6CF6] hover:text-blue-400 hover:bg-[#1A6CF6]/10',
    danger:  'text-[#EF4444] hover:text-red-400 hover:bg-[#EF4444]/10',
  }
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          onClick={onClick}
          disabled={disabled}
          className={`p-2 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed min-w-8 min-h-8 sm:min-w-10 sm:min-h-10 flex items-center justify-center ${colorMap[variant]}`}
        >
          <Icon size={16} />
        </button>
      </TooltipTrigger>
      <TooltipContent side="bottom" className="text-xs">
        <span>{label}</span>
        {shortcut && <span className="ml-1 opacity-60 font-mono">{shortcut}</span>}
      </TooltipContent>
    </Tooltip>
  )
}

export function EditorToolbar({ projectId, projectName, initialIsPublic = false }: EditorToolbarProps) {
  const { toObject } = useReactFlow()
  const [saving, setSaving] = useState(false)

  const [diffModal, setDiffModal] = useState<{ open: boolean; initialVersionId?: string } | null>(null)

  const handleSave = async () => {
    setSaving(true)
    try {
      const flowObject = toObject()
      
      const result = await saveDiagramAction({
        projectId,
        flowJson: flowObject,
      })

      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success('Diagrama guardado exitosamente')
      }
    } catch {
      toast.error('Ocurrió un error inesperado al guardar')
    } finally {
      setSaving(false)
    }
  }

  const handleRestore = async (versionId: string) => {
    const ok = window.confirm('⚠️ Se perderán los cambios no guardados. ¿Restaurar esta versión?')
    if (!ok) return

    try {
      const result = await restoreVersionAction(versionId, projectId)
      if (result.error) {
        toast.error(result.error)
        return
      }

      // Aplicar estado restaurado al store (SIN reload de página)
      const flow = toFlowJson(result.data?.flowJson)
      useEditorStore.getState().setSqlValue(result.data?.sqlContent ?? '')
      useEditorStore.getState().setNodesAndEdges(flow.nodes ?? [], flow.edges ?? [])

      toast.success(`Versión v${result.data?.versionNumber || '?'} restaurada correctamente`)
    } catch {
      toast.error('Ocurrió un error inesperado al restaurar la versión')
    }
  }

  const handleCompare = (versionId: string) => {
    setDiffModal({ open: true, initialVersionId: versionId })
  }

  return (
    <TooltipProvider delayDuration={200}>
      <header className="shrink-0 border-b border-[#1E2A45] bg-[#111827] h-12 flex items-center px-4 gap-4">
        <a href="/dashboard" className="text-[#94A3B8] hover:text-white transition-colors text-sm">
          ← Dashboard
        </a>
        <span className="text-[#1E2A45]">|</span>
        <h1 className="font-semibold text-[#E2E8F0] truncate">{projectName}</h1>
        <span className="ml-auto text-xs text-[#94A3B8] font-mono hidden md:block">{projectId}</span>
        
        <span className="hidden sm:flex items-center gap-1 text-[#6B7280] text-xs ml-4">
          <kbd className="px-1.5 py-0.5 bg-[#1E2A45] rounded text-[10px]">Ctrl</kbd>
          <span>+</span>
          <kbd className="px-1.5 py-0.5 bg-[#1E2A45] rounded text-[10px]">K</kbd>
        </span>
        
        <div className="flex items-center gap-2 ml-4">
          <PublicShareToggle diagramId={projectId} initialIsPublic={initialIsPublic} />
          <VersionHistorySheet projectId={projectId} onRestore={handleRestore} onCompare={handleCompare} />
          <CommitModal projectId={projectId} />
          <ToolbarButton
            icon={Save}
            label="Guardar"
            shortcut="Ctrl+S"
            onClick={handleSave}
            disabled={saving}
          />
          <ExportMenu projectName={projectName} />
          <ThemeToggle />
        </div>
      </header>

      <DiffViewerModal
        open={diffModal?.open ?? false}
        onClose={() => setDiffModal(null)}
        projectId={projectId}
        initialVersionId={diffModal?.initialVersionId}
      />
    </TooltipProvider>
  )
}
