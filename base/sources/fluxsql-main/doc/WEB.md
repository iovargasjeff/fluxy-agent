# FluxSQL Web App

## Proposito

FluxSQL Web es la variante colaborativa del generador de diagramas. Esta pensada para equipos que necesitan crear, guardar, versionar y compartir diagramas de base de datos desde el navegador.

## Ubicacion en el repositorio

| Ruta | Descripcion |
| :-- | :-- |
| `frontend-app/` | Aplicacion Next.js principal |
| `frontend-app/app/` | Rutas publicas y protegidas |
| `frontend-app/components/editor/` | Canvas, toolbar, nodos, relaciones y panel inspector |
| `frontend-app/components/dashboard/` | Dashboard, proyectos, historial e invitaciones |
| `frontend-app/lib/backend/` | Acciones server-side, base de datos y migraciones |
| `backend-app/` | Backend NestJS conservado como soporte academico y de arquitectura |

## Funcionalidades

- Registro e inicio de sesion.
- Perfil de usuario.
- Creacion y administracion de proyectos.
- Editor visual de diagramas de base de datos.
- Parsers SQL para PostgreSQL, MySQL y SQL Server.
- Exportacion a PNG, SVG y Mermaid.
- Historial de versiones.
- Invitacion de colaboradores.
- Compartir diagramas por enlace publico.
- Dashboard con actividad reciente.

## Ejecucion local

```bash
cd frontend-app
pnpm install
pnpm dev
```

URL local:

```text
http://localhost:3000
```

## Despliegue

La variante web se despliega desde la rama `main`.

Configuracion recomendada para Vercel:

| Campo | Valor |
| :-- | :-- |
| Framework | Next.js |
| Root Directory | `frontend-app` |
| Install Command | `pnpm install` |
| Build Command | `pnpm build` |

## Variables de entorno

Las variables dependen del proveedor de base de datos y autenticacion usado en el entorno final. Como minimo se requiere configurar las credenciales de Supabase o del servicio compatible usado por la aplicacion.

## Evidencia academica

La documentacion formal relacionada con la Web App esta consolidada en:

- FD02 - Vision de Producto.
- FD03 - Especificacion de Requerimientos.
- FD04 - Arquitectura.
- FD05 - Proyecto.
