import { versionsAPI } from '@/lib/api/client'

export async function createVersionAction({
  projectId,
  message,
  flowJson,
  sqlContent,
  activeDialect,
  snapshots
}: {
  projectId: string
  message: string
  flowJson: any
  sqlContent: string
  activeDialect: string
  snapshots: any
}) {
  try {
    const data = await versionsAPI.create(projectId, {
      message,
      flowJson,
      sqlContent,
      activeDialect,
      snapshots
    });
    return { success: true, data }
  } catch (error: any) {
    console.error('Error creating version via API:', error)
    return { error: error.message || 'Error al crear la versión' }
  }
}
