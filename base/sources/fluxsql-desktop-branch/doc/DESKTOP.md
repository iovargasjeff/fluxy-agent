# FluxSQL Desktop

## Proposito

FluxSQL Desktop permite inspeccionar bases de datos desde el equipo del usuario, generar diagramas desde conexiones reales, producir datos y analizar consultas sin publicar credenciales en servicios externos.

## Equipo

| Integrante | Rol |
| :-- | :-- |
| Jefferson Alfonso Vargas Espinoza | Integracion Tauri, backend FastAPI, conectores, empaquetado y arquitectura |
| Kiara Holly Zapana Murillo | Interfaz, experiencia de usuario, validacion visual y documentacion |

## Arquitectura

```text
Tauri
  -> Frontend Next.js exportado
  -> Sidecar FastAPI local
  -> Conectores / Analizador / Generador
  -> Bases de datos locales o remotas configuradas por el usuario
```

| Ruta | Descripcion |
| :-- | :-- |
| `frontend-app/` | Interfaz Next.js |
| `frontend-app/src-tauri/` | Configuracion Tauri e instalador |
| `backend-python/` | API local FastAPI |
| `backend-python/backend/connectors/` | Conectores de base de datos |
| `backend-python/query_analyzer/` | Analisis de consultas |

## Motores soportados

- PostgreSQL.
- MySQL.
- SQL Server.
- MongoDB.
- Neo4j.
- Cassandra.

## Ejecucion en desarrollo

```powershell
cd frontend-app
pnpm install
pnpm desktop:dev
```

## Construccion del instalador

```powershell
cd frontend-app
pnpm desktop:build
```

Salida:

```text
frontend-app/src-tauri/target/release/bundle/nsis/FluxSQL Desktop_0.1.0_x64-setup.exe
```

## Validacion manual

1. Abrir la app en modo desarrollo.
2. Conectar una base local.
3. Inspeccionar el esquema.
4. Generar diagrama.
5. Refrescar datos desde la conexion.
6. Analizar una consulta.
7. Cerrar la app y confirmar que el backend local termina.
8. Construir e instalar el `.exe`.
9. Confirmar que la app instalada funciona sin Node.js, pnpm ni Python.

## Relacion con `main`

La rama `main` conserva la version web limpia y los informes academicos FD01-FD05. Esta rama `desktop` conserva la implementacion local empaquetable y su documentacion especifica.
