# FluxSQL

FluxSQL es un generador de diagramas de base de datos desarrollado para el curso de Base de Datos II de la Universidad Privada de Tacna. El proyecto conserva dos superficies de producto:

- **Web App**: aplicacion Next.js desplegable en Vercel, con autenticacion, dashboard, editor visual, historial de versiones, colaboracion, enlaces publicos y exportacion de diagramas.
- **Desktop App**: variante Tauri + FastAPI para inspeccion local de bases de datos, generacion de diagramas desde conexiones reales, generacion de datos y analisis de consultas.

## Roadmap

| Version | Estado | Descripcion |
| :--: | :--: | :-- |
| v0.1 | Completado | Setup base, Drizzle schema, Supabase Auth y CI/CD |
| v0.2 | Completado | Parsers SQL (PostgreSQL/MySQL/SQL Server), JSON Schema y canvas React Flow |
| v0.3 | Completado | Control de versiones, colaboracion en tiempo real, exportacion PNG/SVG/Mermaid y link publico |
| v0.4 | Completado | Landing page, dark mode, toolbar, despliegue Vercel y SonarQube |
| v1.0 | En desarrollo | Desktop App con Tauri, backend Python y conexiones directas a bases de datos |

## Equipo

| Integrante | Rol | GitHub |
| :-- | :-- | :-- |
| Vargas Espinoza, Jefferson Alfonso (2023076820) | Arquitectura, parsers, editor, API, backend, integracion Web/Desktop y despliegue | [@iovargasjeff](https://github.com/iovargasjeff) |
| Zapana Murillo, Kiara Holly (2023077087) | UI/UX, dashboard, landing, dark mode, onboarding, pruebas y documentacion | [@KiaraZapana](https://github.com/KiaraZapana) |

## Documentacion academica

| Documento | Descripcion |
| :-- | :-- |
| [FD01 - Informe de Factibilidad](./doc/FD01-Informe-Factibilidad.md) | Analisis tecnico, economico, operativo, legal, social y ambiental del proyecto |
| [FD02 - Informe de Vision de Producto](./doc/FD02-Informe-Vision.md) | Vision, posicionamiento, stakeholders, capacidades y restricciones |
| [FD03 - Informe de Especificacion de Requerimientos](./doc/FD03-Informe-Especificacion-Requerimientos.md) | Requisitos funcionales, no funcionales, interfaces y modelo logico |
| [FD04 - Informe de Arquitectura](./doc/FD04-Informe-Arquitectura-Software.md) | Arquitectura, vistas logica/procesos/despliegue y decisiones tecnicas |
| [FD05 - Informe de Proyecto](./doc/FD05-Informe-ProyectoFinal.md) | Resumen final, objetivos logrados, despliegue, metricas y conclusiones |

Documentacion complementaria:

- [Indice de documentacion](./doc/README.md)
- [Guia Web App](./doc/WEB.md)
- [Guia Desktop App](./doc/DESKTOP.md)
- [Frontend Web](./frontend-app/README.md)

## Ramas principales

| Rama | Proposito |
| :-- | :-- |
| `main` | Version web limpia y documentacion academica principal |
| `desktop` | Variante Desktop con Tauri, frontend estatico y backend FastAPI local |
| `redesign-ui` | Rama de redisenio visual y evolucion de UI |

## Licencia

MIT (c) 2026 - Zapana Murillo, Kiara Holly y Vargas Espinoza, Jefferson Alfonso.

Universidad Privada de Tacna - Escuela Profesional de Ingenieria de Sistemas - Base de Datos II.
