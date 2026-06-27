# Fluxy Web

Aplicacion web de Fluxy para crear, editar, guardar, versionar y compartir diagramas de base de datos desde el navegador.

## Stack

- Next.js con App Router.
- TypeScript.
- React Flow para el editor visual.
- Drizzle ORM para esquema y migraciones.
- Supabase para autenticacion y persistencia.
- Tailwind CSS y componentes UI propios.

## Funcionalidades principales

- Autenticacion de usuarios.
- Dashboard de proyectos.
- Editor visual de diagramas.
- Parsers SQL para PostgreSQL, MySQL y SQL Server.
- Historial de versiones.
- Invitaciones y colaboracion.
- Enlaces publicos.
- Exportacion de diagramas.

## Desarrollo

```bash
pnpm install
pnpm dev
```

La aplicacion se ejecuta en:

```text
http://localhost:3000
```

## Build

```bash
pnpm build
```

## Estructura relevante

| Ruta | Descripcion |
| :-- | :-- |
| `app/` | Rutas publicas, protegidas y layout principal |
| `components/dashboard/` | Dashboard y gestion de proyectos |
| `components/editor/` | Editor visual de diagramas |
| `lib/backend/` | Acciones server-side, base de datos y migraciones |
| `lib/parsers/` | Parsers SQL y utilidades de layout |
| `store/` | Estado del editor |
| `e2e/` | Pruebas Playwright |

## Documentacion

La documentacion academica y tecnica se encuentra en:

```text
../doc/
```

Documento especifico de la variante web:

```text
../doc/WEB.md
```
