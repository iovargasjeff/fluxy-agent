-- Tabla de invitaciones pendientes por email
CREATE TABLE IF NOT EXISTS project_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  token UUID NOT NULL DEFAULT gen_random_uuid(),
  invited_by UUID REFERENCES auth.users(id),
  accepted_at TIMESTAMPTZ DEFAULT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(project_id, email)
);

CREATE INDEX IF NOT EXISTS idx_invitations_token
  ON project_invitations(token);

CREATE INDEX IF NOT EXISTS idx_invitations_email
  ON project_invitations(email);

ALTER TABLE project_invitations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owner puede crear invitaciones"
  ON project_invitations FOR INSERT
  WITH CHECK (invited_by = auth.uid());

CREATE POLICY "Cualquiera puede leer por token"
  ON project_invitations FOR SELECT
  USING (true);

CREATE POLICY "Sistema puede actualizar accepted_at"
  ON project_invitations FOR UPDATE
  USING (true);
