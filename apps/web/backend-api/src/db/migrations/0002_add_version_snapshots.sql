ALTER TABLE "diagram_versions"
ADD COLUMN IF NOT EXISTS "active_dialect" text NOT NULL DEFAULT 'postgresql';

ALTER TABLE "diagram_versions"
ADD COLUMN IF NOT EXISTS "snapshots" jsonb;
