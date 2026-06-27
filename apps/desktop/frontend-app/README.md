# Fluxy Desktop Frontend

Frontend Next.js usado por la aplicacion de escritorio Fluxy Desktop. En desarrollo se sirve con hot reload; en produccion se exporta como archivos estaticos y Tauri los carga desde `out/`.

## Equipo

- Jefferson Alfonso Vargas Espinoza.
- Kiara Holly Zapana Murillo.

## Desarrollo

```powershell
pnpm install
pnpm desktop:dev
```

Durante desarrollo, Next.js usa `http://localhost:3002` exclusivamente para hot reload. Tauri ejecuta `backend-python/main.py` con el Python local y administra su ciclo de vida.

## Instalador Windows

```powershell
pnpm desktop:build
```

El comando reconstruye el sidecar PyInstaller, exporta Next.js a `out/` y genera el instalador NSIS `.exe`.

Salida esperada:

```text
src-tauri/target/release/bundle/nsis/Fluxy Desktop_0.1.0_x64-setup.exe
```

El instalador final no requiere Node.js, pnpm ni Python y no levanta un servidor Next.js. Los datos locales se guardan en AppData bajo `com.fluxy.desktop`.

## Pruebas manuales

1. Ejecutar `pnpm desktop:dev`.
2. Conectar una base de datos local.
3. Generar un diagrama desde el esquema real.
4. Refrescar el diagrama desde la base de datos.
5. Cerrar la ventana varias veces.
6. Confirmar en el Administrador de tareas que no queden procesos `python`, `cdcart-backend` o `fluxy-desktop` iniciados por Fluxy.
7. Ejecutar `pnpm desktop:build`.
8. Instalar `src-tauri/target/release/bundle/nsis/Fluxy Desktop_0.1.0_x64-setup.exe`.
9. Abrir la app instalada y confirmar que no necesita Node.js, pnpm, Python ni `localhost:3002`.
10. Confirmar que los datos sobreviven al reinicio y estan bajo `%APPDATA%\com.fluxy.desktop`.

## Componentes relevantes

| Ruta | Descripcion |
| :-- | :-- |
| `app/(protected)/connect/` | Conexion a bases de datos |
| `app/(protected)/diagrams/new/` | Creacion de diagramas |
| `app/(protected)/analyzer/` | Analisis de consultas |
| `components/editor/` | Editor visual y paneles de diagrama |
| `components/generator/` | Generacion de datos y exportacion |
| `lib/api/` | Cliente de comunicacion con el backend local |
