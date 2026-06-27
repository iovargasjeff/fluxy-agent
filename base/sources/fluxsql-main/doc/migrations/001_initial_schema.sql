-- ============================================
-- DBCanvas — Migración Inicial
-- Fecha: Abril 2026
-- Descripción: Tablas para persistencia de diagramas en la Web App
-- ============================================

-- Tabla de usuarios propios (anti vendor lock-in)
CREATE TABLE IF NOT EXISTS public.usuarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  nombre TEXT NOT NULL,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Tabla de proyectos / workspaces
CREATE TABLE IF NOT EXISTS public.proyectos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID NOT NULL REFERENCES public.usuarios(id) ON DELETE CASCADE,
  nombre TEXT NOT NULL,
  descripcion TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Tabla de diagramas generados
CREATE TABLE IF NOT EXISTS public.diagramas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  proyecto_id UUID NOT NULL REFERENCES public.proyectos(id) ON DELETE CASCADE,
  usuario_id UUID NOT NULL REFERENCES public.usuarios(id) ON DELETE CASCADE,
  nombre TEXT NOT NULL,
  tipo_fuente TEXT NOT NULL DEFAULT 'sql_ddl',
  contenido_fuente TEXT NOT NULL DEFAULT '',
  schema_json JSONB,
  mermaid_code TEXT,
  config JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Tabla de colaboradores por diagrama
CREATE TABLE IF NOT EXISTS public.colaboradores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  diagrama_id UUID NOT NULL REFERENCES public.diagramas(id) ON DELETE CASCADE,
  usuario_id UUID NOT NULL REFERENCES public.usuarios(id) ON DELETE CASCADE,
  permiso TEXT NOT NULL DEFAULT 'read',
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(diagrama_id, usuario_id)
);

-- Índices para rendimiento
CREATE INDEX IF NOT EXISTS idx_proyectos_usuario ON public.proyectos(usuario_id);
CREATE INDEX IF NOT EXISTS idx_diagramas_proyecto ON public.diagramas(proyecto_id);
CREATE INDEX IF NOT EXISTS idx_diagramas_usuario ON public.diagramas(usuario_id);
CREATE INDEX IF NOT EXISTS idx_colaboradores_diagrama ON public.colaboradores(diagrama_id);
CREATE INDEX IF NOT EXISTS idx_colaboradores_usuario ON public.colaboradores(usuario_id);
