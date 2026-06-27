# FD01 - Informe de Factibilidad

<center>

![logo UPT](./media/logo-upt.png)

**UNIVERSIDAD PRIVADA DE TACNA**  
**FACULTAD DE INGENIERIA**  
**Escuela Profesional de Ingenieria de Sistemas**

**Proyecto: FluxSQL Desktop - Generador Local de Diagramas de Base de Datos**

Curso: Base de Datos II  
Docente: Mag. Patrick Cuadros Quiroga

Integrantes:

**Zapana Murillo, Kiara Holly (2023077087)**  
**Vargas Espinoza, Jefferson Alfonso (2023076820)**

Tacna - Peru, 2026

</center>

## Control de versiones

| Version | Hecha por | Fecha | Motivo |
| :-- | :-- | :-- | :-- |
| 1.0 | KHZM / JAVE | Junio 2026 | Adaptacion de factibilidad para la rama `desktop` |

## 1. Descripcion del proyecto

FluxSQL Desktop es una aplicacion de escritorio para inspeccionar bases de datos desde el equipo del usuario, generar diagramas desde esquemas reales, producir datos de prueba y analizar consultas sin exponer credenciales a servicios externos.

La rama `desktop` implementa una arquitectura local compuesta por:

- `frontend-app/`: interfaz Next.js exportada como archivos estaticos.
- `frontend-app/src-tauri/`: contenedor nativo Tauri e instalador.
- `backend-python/`: API FastAPI ejecutada como sidecar local.
- `backend-python/backend/connectors/`: conectores a motores de base de datos.
- `backend-python/query_analyzer/`: analizador de consultas.

## 2. Problema identificado

Los estudiantes y desarrolladores suelen necesitar diagramar bases de datos reales, pero muchas herramientas requieren licencias, configuraciones complejas o envio de credenciales a servicios externos. Esto genera riesgos de seguridad, baja trazabilidad y perdida de tiempo al documentar esquemas.

FluxSQL Desktop resuelve este problema ejecutando el procesamiento de conexiones y analisis en la maquina local del usuario.

## 3. Factibilidad tecnica

| Elemento | Evaluacion |
| :-- | :-- |
| Frontend | Factible con Next.js exportado estaticamente para uso dentro de Tauri |
| Contenedor nativo | Factible con Tauri por su bajo peso y control del ciclo de vida local |
| Backend local | Factible con FastAPI como sidecar administrado por la aplicacion |
| Conectores | Factible para PostgreSQL, MySQL, SQL Server, MongoDB, Neo4j y Cassandra |
| Empaquetado | Factible en Windows mediante instalador NSIS |
| Persistencia local | Factible usando almacenamiento bajo `%APPDATA%\\com.fluxsql.desktop` |

## 4. Factibilidad operativa

La aplicacion puede ser utilizada por estudiantes, docentes y desarrolladores con conocimientos basicos de bases de datos. El flujo operativo principal es:

1. Abrir FluxSQL Desktop.
2. Registrar o seleccionar una conexion local.
3. Inspeccionar el esquema.
4. Generar un diagrama.
5. Exportar o analizar la informacion obtenida.

## 5. Factibilidad economica

El proyecto utiliza herramientas de codigo abierto: Tauri, Next.js, FastAPI, React, Python y librerias de conectividad. Esto reduce costos de licencias y permite que el producto sea mantenible en un entorno universitario.

## 6. Factibilidad legal y seguridad

La principal ventaja legal y de seguridad es que las credenciales de bases de datos no necesitan salir del equipo del usuario. El backend local se ejecuta como proceso controlado por Tauri y puede cerrarse junto con la aplicacion.

## 7. Riesgos

| Riesgo | Probabilidad | Impacto | Mitigacion |
| :-- | :--: | :--: | :-- |
| Binarios grandes en la rama Desktop | Media | Medio | Documentar y evaluar Git LFS si el repositorio crece |
| Dependencias nativas de Tauri/Rust | Media | Medio | Documentar requisitos de build |
| Diferencias entre motores de base de datos | Alta | Alto | Mantener conectores separados y modelo intermedio comun |
| Procesos backend residuales | Media | Alto | Validar cierre del sidecar en pruebas manuales |

## 8. Conclusion

FluxSQL Desktop es factible tecnica, operativa y economicamente. La solucion es adecuada para el contexto academico porque permite documentar bases de datos reales, preservar la privacidad de credenciales y generar evidencia de arquitectura local.

## 9. Relacion con la version anterior

La rama `desktop` nace como evolucion del proyecto web consolidado en `main`. El repositorio oficial preserva la evidencia de:

| Origen | Relacion |
| :-- | :-- |
| `UPT-FAING-EPIS/proyecto-si783-2026-i-u1-generador-de-diagramas-de-base` | Repositorio oficial universitario |
| `iovargasjeff/fluxsql` | Fork historico con 65 commits integrados |
| `iovargasjeff/fluxsql-web` | Version web limpia y origen de ramas `desktop` y `redesign-ui` |
| `main` | Version Web y documentacion academica general |
| `desktop` | Variante local Tauri + FastAPI documentada en estos FD |
