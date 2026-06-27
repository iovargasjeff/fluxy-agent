CREATE TABLE IF NOT EXISTS user_activity (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  -- Valores posibles de action:
  -- 'project_opened'     → Abrió el proyecto en el editor
  -- 'project_created'    → Creó un nuevo proyecto
  -- 'project_saved'      → Guardó cambios en el proyecto
  -- 'project_deleted'    → Movió proyecto a papelera
  -- 'project_restored'   → Restauró desde papelera
  -- 'collaborator_invited' → Invitó a un colaborador
  -- 'schema_exported'    → Exportó el esquema SQL
  metadata JSONB DEFAULT '{}',
  -- metadata puede contener: { projectName, tablesCount, exportFormat }
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_activity_user_id 
  ON user_activity(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_activity_project_id 
  ON user_activity(project_id);

ALTER TABLE user_activity ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuario ve solo su actividad"
  ON user_activity FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Sistema puede insertar actividad"
  ON user_activity FOR INSERT
  WITH CHECK (user_id = auth.uid());
