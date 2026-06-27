import { projectsAPI } from '@/lib/api/client';

export async function togglePublicAction(projectId: string, isPublic: boolean, access?: string) {
  try {
    const data = await projectsAPI.togglePublic(projectId, isPublic, access);
    return { success: true, isPublic: data.is_public };
  } catch (error: any) {
    console.error('Error toggling public state:', error);
    return { error: error.message || 'Error interno al cambiar la visibilidad' };
  }
}
