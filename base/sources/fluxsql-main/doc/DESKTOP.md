# FluxSQL Desktop App

## Proposito

FluxSQL Desktop es la variante local del generador de diagramas. Permite inspeccionar bases de datos desde el equipo del usuario, generar diagramas desde conexiones reales y analizar consultas sin publicar credenciales en servicios externos.

## Ubicacion en la rama `desktop`

| Ruta | Descripcion |
| :-- | :-- |
| `frontend-app/` | Interfaz Next.js exportada como archivos estaticos |
| `frontend-app/src-tauri/` | Contenedor nativo Tauri, configuracion e instalador |
| `backend-python/` | Backend FastAPI local ejecutado como sidecar |
| `backend-python/backend/connectors/` | Conectores a motores de base de datos |
| `backend-python/query_analyzer/` | Analizador de consultas y metricas |

## Equipo Desktop

| Integrante | Rol |
| :-- | :-- |
| Jefferson Alfonso Vargas Espinoza | Integracion Tauri, backend local, conectores, empaquetado y arquitectura |
| Kiara Holly Zapana Murillo | Interfaz, experiencia de usuario, validacion visual y documentacion |

## Funcionalidades

- Ejecucion como aplicacion de escritorio.
- Backend local administrado por Tauri.
- Conexion a PostgreSQL, MySQL, SQL Server, MongoDB, Neo4j y Cassandra.
- Inspeccion de esquemas.
- Generacion de diagramas.
- Generacion de datos.
- Analisis de consultas con metricas.
- Persistencia local bajo `%APPDATA%\com.fluxsql.desktop`.
- Instalador Windows NSIS.

## Ejecucion en desarrollo

```powershell
git switch desktop
cd frontend-app
pnpm install
pnpm desktop:dev
```

Durante desarrollo, Next.js usa `localhost:3000` para hot reload y Tauri ejecuta el backend Python local.

## Construccion del instalador

```powershell
git switch desktop
cd frontend-app
pnpm desktop:build
```

Salida esperada:

```text
frontend-app/src-tauri/target/release/bundle/nsis/FluxSQL Desktop_0.1.0_x64-setup.exe
```

## Pruebas manuales recomendadas

1. Ejecutar `pnpm desktop:dev`.
2. Conectar una base de datos local.
3. Generar un diagrama desde el esquema real.
4. Refrescar el diagrama desde la base de datos.
5. Cerrar la ventana y confirmar que no quedan procesos residuales del backend.
6. Construir el instalador con `pnpm desktop:build`.
7. Instalar la aplicacion y validar que no requiere Node.js, pnpm ni Python.

## Relacion con la documentacion academica

La variante Desktop se referencia en:

- FD01 - Factibilidad, por el analisis tecnico y operativo.
- FD03 - Requerimientos, por los requisitos de conexion local.
- FD04 - Arquitectura, por la vista de despliegue y el backend local.
- FD05 - Proyecto, por el alcance final y manual de ejecucion.
