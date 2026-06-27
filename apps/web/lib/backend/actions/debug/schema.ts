'use server'

import { createClient } from '../../supabase/server'

export async function debugSchemaAction() {
  try {
    const supabase = await createClient()
    await supabase.rpc('query_schema', {}).select()
    
    // Use raw SQL via RPC isn't available easily, so let's use the Supabase client directly
    const result = await supabase
      .from('diagram_versions')
      .select('*')
      .limit(0)
    
    // The column names are in the error or response headers
    return { 
      error: result.error?.message,
      status: result.status,
      statusText: result.statusText,
    }
  } catch (e: unknown) {
    return { error: e instanceof Error ? e.message : 'Error desconocido' }
  }
}
