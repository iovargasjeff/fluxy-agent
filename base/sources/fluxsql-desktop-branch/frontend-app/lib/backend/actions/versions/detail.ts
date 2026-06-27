import { versionsAPI } from '@/lib/api/client'

export async function getVersionDetailAction(versionId: string) {
  try {
    const data = await versionsAPI.detail(versionId);
    return { data, error: null }
  } catch (error: any) {
    console.error('Error fetching version detail via API:', error)
    return { data: null, error: error.message || 'Error al cargar detalles de la versión' }
  }
}
