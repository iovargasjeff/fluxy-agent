import { diagramsAPI } from '@/lib/api/client'
import type { FlowJson } from '@/lib/flow-types'

export async function saveDiagramAction({
  projectId,
  flowJson,
}: {
  projectId: string
  flowJson: FlowJson
}) {
  try {
    await diagramsAPI.saveLayoutByProject(projectId, flowJson);
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
