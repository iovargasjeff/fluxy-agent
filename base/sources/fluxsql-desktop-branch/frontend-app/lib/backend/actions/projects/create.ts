import { projectsAPI } from '@/lib/api/client';

export async function createProjectAction(name: string, description?: string) {
  try {
    const data = await projectsAPI.create({ name, description });
    return { id: data.id };
  } catch (error: any) {
    console.error('Error creating project via API:', error);
    return { error: error.message || 'Error interno al crear el proyecto' };
  }
}
