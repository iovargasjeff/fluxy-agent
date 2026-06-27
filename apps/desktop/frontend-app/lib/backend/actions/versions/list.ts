import { versionsAPI } from '@/lib/api/client'

export async function listVersionsAction(projectId: string) {
  try {
    const versions = await versionsAPI.listByProject(projectId);
    return { data: versions, error: null }
  } catch (error: any) {
    console.error('Error fetching versions via API:', error)
    return { data: null, error: error.message || 'Error al obtener el historial' }
  }
}
