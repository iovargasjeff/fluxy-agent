"use server"

import { createClient } from '../../supabase/server'

export type ActivityAction =
  | 'project_opened'
  | 'project_created'
  | 'project_saved'
  | 'project_deleted'
  | 'project_restored'
  | 'collaborator_invited'
  | 'schema_exported'

export async function logActivity(
  userId: string,
  action: ActivityAction,
  projectId?: string,
  metadata?: Record<string, unknown>
): Promise<void> {
  try {
    const supabase = await createClient()
    
    await supabase
      .from('user_activity')
      .insert({
        user_id: userId,
        project_id: projectId || null,
        action,
        metadata: metadata || {}
      })
  } catch (error) {
    // Silencioso - nunca rompe el flujo principal
    console.error('Error al registrar actividad:', error)
  }
}

export async function getActivityHistory(
  userId: string,
  limit = 50
): Promise<ActivityItem[]> {
  try {
    const supabase = await createClient()
    
    const { data, error } = await supabase
      .from('user_activity')
      .select(`
        id,
        action,
        project_id,
        metadata,
        created_at,
        projects (
          name
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('Error al obtener historial:', error)
      return []
    }

    return (data || []).map((item: Record<string, unknown>) => ({
      id: item.id as string,
      action: item.action as ActivityAction,
      projectId: item.project_id as string,
      projectName: (item.projects as { name?: string })?.name,
      metadata: item.metadata as Record<string, unknown>,
      createdAt: item.created_at as string
    }))
  } catch (error: unknown) {
    console.error('Error al obtener historial:', error)
    return []
  }
}

export interface ActivityItem {
  id: string
  action: ActivityAction
  projectId?: string
  projectName?: string
  metadata: Record<string, unknown>
  createdAt: string
}
