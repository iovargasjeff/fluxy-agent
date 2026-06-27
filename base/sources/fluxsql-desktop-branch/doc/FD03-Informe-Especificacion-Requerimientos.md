# FD03 - Informe de Especificacion de Requerimientos

<center>

![logo UPT](./media/logo-upt.png)

**UNIVERSIDAD PRIVADA DE TACNA**  
**FluxSQL Desktop - Especificacion de Requerimientos**

Integrantes: Kiara Zapana Murillo y Jefferson Vargas Espinoza  
Tacna - Peru, 2026

</center>

## Control de versiones

| Version | Hecha por | Fecha | Motivo |
| :-- | :-- | :-- | :-- |
| 1.0 | KHZM / JAVE | Junio 2026 | Requerimientos especificos para `desktop` |

## 1. Introduccion

Este documento define los requerimientos funcionales y no funcionales de FluxSQL Desktop, variante local del generador de diagramas de base de datos.

## 2. Requerimientos funcionales

| Codigo | Requerimiento | Prioridad |
| :-- | :-- | :--: |
| RF01 | La aplicacion debe iniciar como programa de escritorio mediante Tauri | Alta |
| RF02 | La aplicacion debe iniciar el backend FastAPI local como sidecar | Alta |
| RF03 | La aplicacion debe comprobar el endpoint `/health` del backend antes de operar | Alta |
| RF04 | El usuario debe poder configurar conexiones a bases de datos soportadas | Alta |
| RF05 | El sistema debe inspeccionar esquemas de bases de datos conectadas | Alta |
| RF06 | El sistema debe generar diagramas a partir del esquema inspeccionado | Alta |
| RF07 | El sistema debe refrescar el diagrama desde la base de datos | Media |
| RF08 | El sistema debe permitir analizar consultas | Media |
| RF09 | El sistema debe generar datos de prueba cuando el esquema lo permita | Media |
| RF10 | El sistema debe guardar datos locales bajo el directorio de aplicacion | Media |
| RF11 | El sistema debe cerrar el backend local al cerrar la aplicacion | Alta |
| RF12 | El sistema debe generar un instalador Windows NSIS | Alta |

## 3. Requerimientos no funcionales

| Codigo | Requerimiento | Criterio |
| :-- | :-- | :-- |
| RNF01 | Seguridad | Las credenciales no deben enviarse a servicios externos |
| RNF02 | Portabilidad | El instalador final no debe requerir Node.js, pnpm ni Python |
| RNF03 | Rendimiento | La app debe responder de forma fluida durante inspeccion y diagramacion |
| RNF04 | Mantenibilidad | Los conectores deben mantenerse separados por motor |
| RNF05 | Trazabilidad | La documentacion debe explicar relacion con `main`, `fluxsql` y `fluxsql-web` |
| RNF06 | Usabilidad | Los flujos principales deben poder validarse con checklist manual |

## 4. Interfaces

| Interfaz | Descripcion |
| :-- | :-- |
| Interfaz grafica | Next.js dentro de Tauri |
| API local | FastAPI ejecutado como sidecar |
| Conectores BD | Adaptadores por motor |
| Sistema operativo | Windows como objetivo principal de empaquetado |

## 5. Casos de uso

### CU01 - Generar diagrama desde base local

1. El usuario abre FluxSQL Desktop.
2. Configura una conexion.
3. El backend valida la conexion.
4. El sistema inspecciona el esquema.
5. El frontend muestra el diagrama.

### CU02 - Analizar consulta

1. El usuario ingresa una consulta.
2. El sistema identifica el motor.
3. El backend obtiene metricas o aplica analisis.
4. El frontend muestra resultados y recomendaciones.

### CU03 - Construir instalador

1. El desarrollador ejecuta `pnpm desktop:build`.
2. Se exporta el frontend.
3. Se reconstruye el sidecar Python.
4. Tauri genera el instalador NSIS.

## 6. Relacion con la version anterior

Los requerimientos Web del proyecto quedan documentados en `main`. Esta especificacion corresponde a la rama `desktop`, que usa la base visual y conceptual del proyecto anterior, pero cambia el objetivo hacia ejecucion local, privacidad de credenciales y empaquetado nativo.
