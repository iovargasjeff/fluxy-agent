'use client'

import { Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { EditorLayout } from '@/components/editor/EditorLayout'
import { diagramsAPI } from '@/lib/api/client'
import { toFlowJson } from '@/lib/flow-types'

function EditorPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const projectId = searchParams?.get('projectId') as string

  const [diagramData, setDiagramData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!projectId) {
      router.push('/dashboard')
      return
    }

    async function load() {
      try {
        const data = await diagramsAPI.load(projectId)
        setDiagramData(data)
      } catch (error) {
        console.error('Failed to load diagram', error)
        router.push('/dashboard')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [projectId, router])

  if (loading) {
    return <div className="h-dvh flex items-center justify-center bg-[#07101F] text-white">Cargando editor...</div>
  }

  if (!diagramData) {
    return (
      <div className="h-dvh flex flex-col items-center justify-center gap-3 bg-[#07101F] px-6 text-center text-white">
        <p className="text-lg font-semibold">No se pudo cargar el editor</p>
        <p className="max-w-md text-sm text-[#94A3B8]">
          El proyecto no tiene un diagrama disponible. Vuelve al dashboard y crea uno nuevo.
        </p>
        <button
          type="button"
          onClick={() => router.push('/dashboard')}
          className="rounded-lg bg-[#1A6CF6] px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          Volver al dashboard
        </button>
      </div>
    )
  }

  const savedFlow = toFlowJson(diagramData.flowJson)
  const initialNodes = savedFlow.nodes ?? []
  const initialEdges = savedFlow.edges ?? []

  return (
    <div className="h-dvh min-h-0 overflow-hidden bg-[#07101F]">
      <EditorLayout
        projectName={diagramData.projectName ?? diagramData.name ?? 'Proyecto'}
        projectId={projectId}
        initialSQL={diagramData.sourceCode ?? ''}
        initialNodes={initialNodes}
        initialEdges={initialEdges}
        dialect={diagramData.dialect ?? 'postgresql'}
        initialIsPublic={diagramData.isPublic ?? false}
        initialShareAccess={(diagramData.shareAccess as 'view' | 'edit') ?? 'view'}
      />
    </div>
  )
}

export default function EditorPage() {
  return (
    <Suspense fallback={<div className="h-dvh flex items-center justify-center bg-[#07101F] text-white">Cargando...</div>}>
      <EditorPageContent />
    </Suspense>
  )
}
