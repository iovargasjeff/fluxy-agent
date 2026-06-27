import { projectsAPI } from '@/lib/api/client';

export async function deleteProjectAction(projectId: string) {
  try {
    await projectsAPI.delete(projectId);
    return { success: true, message: 'Proyecto movido a la papelera' };
  } catch (error: any) {
    console.error('Error deleting project:', error);
    return { error: error.message || 'Error interno al eliminar el proyecto' };
  }
}

export async function restoreProjectAction(projectId: string) {
  try {
    await projectsAPI.restore(projectId);
    return { success: true, message: 'Proyecto restaurado con éxito' };
  } catch (error: any) {
    console.error('Error restoring project:', error);
    return { error: error.message || 'Error interno al restaurar el proyecto' };
  }
}

export async function permanentlyDeleteProjectAction(projectId: string) {
  try {
    await projectsAPI.permanentlyDelete(projectId);
    return { success: true, message: 'Proyecto eliminado definitivamente' };
  } catch (error: any) {
    console.error('Error permanently deleting project:', error);
    return { error: error.message || 'Error interno al eliminar el proyecto' };
  }
}
