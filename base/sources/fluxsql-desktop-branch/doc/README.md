# Documentacion FluxSQL Desktop

Esta carpeta contiene la documentacion academica y tecnica especifica de la rama `desktop`. Los informes FD01-FD05 fueron adaptados desde la plantilla academica del proyecto para describir la variante local Tauri + FastAPI.

## Informes academicos

| Codigo | Documento | Estado |
| :-- | :-- | :-- |
| FD01 | [Informe de Factibilidad](./FD01-Informe-Factibilidad.md) | Completo |
| FD02 | [Informe de Vision de Producto](./FD02-Informe-Vision.md) | Completo |
| FD03 | [Informe de Especificacion de Requerimientos](./FD03-Informe-Especificacion-Requerimientos.md) | Completo |
| FD04 | [Informe de Arquitectura](./FD04-Informe-Arquitectura-Software.md) | Completo |
| FD05 | [Informe de Proyecto](./FD05-Informe-ProyectoFinal.md) | Completo |

## Documentacion por variante

| Variante | Documento | Rama relacionada |
| :-- | :-- | :-- |
| Web App anterior | [WEB.md](./WEB.md) | `main` |
| Desktop App | [DESKTOP.md](./DESKTOP.md) | `desktop` |

## Trazabilidad de integracion de repositorios

El repositorio oficial consolidado es:

```text
UPT-FAING-EPIS/proyecto-si783-2026-i-u1-generador-de-diagramas-de-base
```

La evidencia de historial se preservo integrando:

| Origen | Proposito | Historial conservado |
| :-- | :-- | :-- |
| `UPT-FAING-EPIS/proyecto-si783-2026-i-u1-generador-de-diagramas-de-base` | Repositorio oficial universitario | Base oficial y rama `main` |
| `iovargasjeff/fluxsql` | Fork historico usado para trabajo y despliegue alterno | 65 commits |
| `iovargasjeff/fluxsql-web` | Version web limpia reconstruida | 4 commits principales y ramas `desktop` / `redesign-ui` |

La rama `desktop` conserva la implementacion local empaquetable con Tauri + FastAPI. La rama `main` conserva la version web limpia y la documentacion academica general anterior. Ambas ramas viven ahora en el repositorio oficial para no perder evidencia de commits.

## Equipo

| Integrante | Codigo | Responsabilidades |
| :-- | :-- | :-- |
| Jefferson Alfonso Vargas Espinoza | 2023076820 | Arquitectura, parsers, backend, integracion Web/Desktop, Tauri, conectores y despliegue |
| Kiara Holly Zapana Murillo | 2023077087 | UI/UX, dashboard, landing, pruebas, validacion visual y documentacion |
