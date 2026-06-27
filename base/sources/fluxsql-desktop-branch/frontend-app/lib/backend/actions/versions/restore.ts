import { versionsAPI } from '@/lib/api/client'

export async function restoreVersionAction(versionId: string, _projectId: string) {
  try {
    const data = await versionsAPI.restore(versionId);
    return { success: true, data }
  } catch (error: any) {
    console.error('Error restoring version via API:', error)
    return { error: error.message || 'Error al restaurar la versión' }
  }
}
