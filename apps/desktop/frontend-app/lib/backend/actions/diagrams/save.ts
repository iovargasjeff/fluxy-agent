import { diagramsAPI } from '@/lib/api/client'
import type { FlowJson } from '@/lib/flow-types'
import type { EditorDialect } from '@/lib/editor-schema'

export async function saveDiagramAction({
  projectId,
  flowJson,
  sqlContent,
  activeDialect,
}: {
  projectId: string
  flowJson: FlowJson
  sqlContent?: string
  activeDialect?: EditorDialect
}) {
  try {
    await diagramsAPI.saveDiagramByProject(projectId, flowJson, { sqlContent, activeDialect });
    return { 
      success: true,
      flowJson,
      versionNumber: 1
    }
  } catch (error) {
    console.error('Error saving diagram via API:', error)
    return { error: 'Error interno al guardar' }
  }
}
