# FluxSQL Desktop

FluxSQL Desktop es la variante local de FluxSQL para inspeccionar bases de datos, generar diagramas desde esquemas reales, producir datos y analizar consultas sin exponer credenciales a servicios externos.

## Equipo

| Integrante | Rol |
| :-- | :-- |
| Jefferson Alfonso Vargas Espinoza (2023076820) | Integracion Tauri, backend FastAPI, conectores, empaquetado y arquitectura |
| Kiara Holly Zapana Murillo (2023077087) | UI/UX, validacion visual, dashboard, pruebas manuales y documentacion |

## Arquitectura

| Capa | Ruta | Responsabilidad |
| :-- | :-- | :-- |
| Frontend | `frontend-app/` | Interfaz Next.js exportada como archivos estaticos |
| Shell nativo | `frontend-app/src-tauri/` | Contenedor Tauri, ciclo de vida del backend e instalador |
| Backend local | `backend-python/` | API FastAPI, conectores, generacion de diagramas, generacion de datos y analisis |
| Conectores | `backend-python/backend/connectors/` | PostgreSQL, MySQL, SQL Server, MongoDB, Neo4j y Cassandra |
| Analizador | `backend-python/query_analyzer/` | Metricas, perfiles y deteccion de patrones de consultas |

En desarrollo, `localhost:3000` se usa solamente para hot reload. El instalador final carga el frontend estatico desde `out/` y no inicia un servidor Next.js.

Tauri inicia el backend en un puerto local dinamico, espera su endpoint `/health` y lo termina al cerrar FluxSQL. SQLite, logs y exportaciones se guardan bajo `%APPDATA%\com.fluxsql.desktop`.

## Desarrollo

Requisitos:

- Node.js.
- pnpm.
- Rust y Cargo.
- Python.

```powershell
cd frontend-app
pnpm install
pnpm desktop:dev
```

Durante desarrollo, Tauri ejecuta directamente `backend-python/main.py`; no es necesario reconstruir PyInstaller en cada inicio.

## Instalador Windows

```powershell
cd frontend-app
pnpm desktop:build
```

Este comando instala las dependencias de build Python, reconstruye el sidecar con PyInstaller, exporta Next.js y genera exclusivamente un instalador NSIS:

```text
frontend-app/src-tauri/target/release/bundle/nsis/FluxSQL Desktop_0.1.0_x64-setup.exe
```

El instalador final incluye el backend y no requiere Node.js, pnpm ni Python.

Los binarios generados en `frontend-app/src-tauri/binaries/`, la carpeta `target/` de Tauri y las bases SQLite locales no se versionan. Se reconstruyen con `pnpm desktop:build` para evitar subir archivos pesados o datos locales al repositorio.

## Pruebas manuales

Consulta el checklist en `frontend-app/README.md`. Para validar el flujo principal, conecta una base local, genera su diagrama y usa la opcion de refrescar desde la base de datos.

## Documentacion

- [Indice de documentacion](./doc/README.md)
- [FD01 - Informe de Factibilidad](./doc/FD01-Informe-Factibilidad.md)
- [FD02 - Informe de Vision de Producto](./doc/FD02-Informe-Vision.md)
- [FD03 - Informe de Especificacion de Requerimientos](./doc/FD03-Informe-Especificacion-Requerimientos.md)
- [FD04 - Informe de Arquitectura](./doc/FD04-Informe-Arquitectura-Software.md)
- [FD05 - Informe de Proyecto](./doc/FD05-Informe-ProyectoFinal.md)
- [Guia Desktop](./doc/DESKTOP.md)

La rama `desktop` conserva tambien la trazabilidad de integracion con los repositorios `iovargasjeff/fluxsql` y `iovargasjeff/fluxsql-web`, documentada en los informes FD y en `doc/README.md`.
