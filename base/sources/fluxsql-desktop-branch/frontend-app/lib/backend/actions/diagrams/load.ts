import { diagramsAPI } from '@/lib/api/client'

export async function loadDiagramAction(projectId: string) {
  try {
    const data = await diagramsAPI.load(projectId);
    return { error: null, data }
  } catch (error: any) {
    console.error('Error loading diagram via API:', error)
    return { error: error.message || 'Error al cargar el diagrama', data: null }
  }
}
