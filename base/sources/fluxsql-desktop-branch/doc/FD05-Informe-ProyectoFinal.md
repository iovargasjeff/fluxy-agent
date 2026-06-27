# FD05 - Informe de Proyecto

<center>

![logo UPT](./media/logo-upt.png)

**UNIVERSIDAD PRIVADA DE TACNA**  
**FluxSQL Desktop - Informe de Proyecto**

Integrantes: Kiara Zapana Murillo y Jefferson Vargas Espinoza  
Tacna - Peru, 2026

</center>

## Control de versiones

| Version | Hecha por | Fecha | Motivo |
| :-- | :-- | :-- | :-- |
| 1.0 | KHZM / JAVE | Junio 2026 | Informe final especifico para `desktop` |

## 1. Resumen ejecutivo

FluxSQL Desktop es la variante de escritorio del generador de diagramas de base de datos. Su objetivo es permitir inspeccion local, diagramacion, generacion de datos y analisis de consultas sin exponer credenciales del usuario a internet.

La solucion usa Tauri como contenedor nativo, Next.js como interfaz exportada estaticamente y FastAPI como backend local empaquetado.

## 2. Alcance entregado

| Entregable | Estado | Evidencia |
| :-- | :--: | :-- |
| Aplicacion Tauri | Entregado | `frontend-app/src-tauri/` |
| Frontend estatico | Entregado | `frontend-app/` |
| Backend FastAPI local | Entregado | `backend-python/` |
| Conectores BD | Entregado | `backend-python/backend/connectors/` |
| Analizador de consultas | Entregado | `backend-python/query_analyzer/` |
| Build Windows | Entregado | `pnpm desktop:build` |
| Documentacion Desktop | Entregado | `doc/` en rama `desktop` |

## 3. Manual de ejecucion

### 3.1 Desarrollo

```powershell
cd frontend-app
pnpm install
pnpm desktop:dev
```

### 3.2 Build instalable

```powershell
cd frontend-app
pnpm desktop:build
```

Salida esperada:

```text
frontend-app/src-tauri/target/release/bundle/nsis/FluxSQL Desktop_0.1.0_x64-setup.exe
```

## 4. Pruebas manuales

1. Abrir la app en modo desarrollo.
2. Validar que el backend local responda.
3. Conectar una base local.
4. Inspeccionar esquema.
5. Generar diagrama.
6. Refrescar desde la conexion.
7. Analizar una consulta.
8. Cerrar la aplicacion y verificar que no queden procesos residuales.
9. Construir instalador.
10. Instalar y validar que no requiere Node.js, pnpm ni Python.

## 5. Resultados

| Resultado | Estado |
| :-- | :--: |
| Ejecucion local | Cumplido |
| Privacidad de credenciales | Cumplido |
| Generacion de diagramas | Cumplido |
| Soporte multi-motor | Cumplido |
| Empaquetado Windows | Cumplido |
| Documentacion academica Desktop | Cumplido |

## 6. Relacion con el proyecto anterior

La version Desktop no reemplaza la Web, sino que la complementa. El proyecto anterior en `main` queda como version web colaborativa; `desktop` queda como version local instalable.

La consolidacion del repositorio oficial preserva:

| Repositorio / Rama | Rol |
| :-- | :-- |
| `UPT-FAING-EPIS/proyecto-si783-2026-i-u1-generador-de-diagramas-de-base` | Repositorio oficial |
| `iovargasjeff/fluxsql` | Historial de 65 commits integrado |
| `iovargasjeff/fluxsql-web` | Version web limpia de 4 commits y origen de ramas |
| `main` | Entrega Web y documentacion general |
| `desktop` | Entrega Desktop documentada en estos FD |

## 7. Conclusiones

FluxSQL Desktop cumple el objetivo de llevar el generador de diagramas a un entorno local y seguro. La arquitectura Tauri + FastAPI facilita empaquetado, conectores directos y control del ciclo de vida del backend.

El trabajo conserva la trazabilidad academica del repositorio original y de los repositorios usados durante el desarrollo, de modo que los commits previos siguen disponibles como evidencia.
