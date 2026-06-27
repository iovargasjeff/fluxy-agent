ALTER TABLE "diagrams"
ADD COLUMN IF NOT EXISTS "share_access" text NOT NULL DEFAULT 'view';
