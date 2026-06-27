<center>

![logo UPT](./media/logo-upt.png)

**UNIVERSIDAD PRIVADA DE TACNA**

**FACULTAD DE INGENIERIA**

**Escuela Profesional de Ingenieria de Sistemas**

**Proyecto *FluxSQL - Generador de Diagramas de Base de Datos***

Curso: *Base de Datos II*

Docente: *Mag. Patrick Cuadros Quiroga*

Integrantes:

***Zapana Murillo, Kiara Holly (2023077087)***

***Vargas Espinoza, Jefferson Alfonso (2023076820)***

**Tacna - Peru**

***2026***

</center>

***

Sistema *FluxSQL - Database Diagram Generator*

Informe de Proyecto

Version *1.1*

| CONTROL DE VERSIONES | | | | | |
| :-: | :- | :- | :- | :- | :- |
| Version | Hecha por | Revisada por | Aprobada por | Fecha | Motivo |
| 1.0 | KHZM / JAVE | | | Abril 2026 | Version original |
| 1.1 | KHZM / JAVE | | | Junio 2026 | Actualizacion final Web/Desktop, despliegue y metricas |

***

## 1. Resumen Ejecutivo

**FluxSQL** es una herramienta para generar diagramas de base de datos a partir de esquemas SQL, modelos JSON y conexiones reales. El producto se organiza en dos entregables complementarios:

- **FluxSQL Web**: aplicacion Next.js orientada al trabajo colaborativo, con autenticacion, dashboard, editor visual, versiones, invitaciones, enlaces publicos y exportacion.
- **FluxSQL Desktop**: aplicacion local basada en Tauri y backend FastAPI para inspeccionar bases de datos desde el equipo del usuario sin exponer credenciales a internet.

El sistema aplica un pipeline de transformacion unidireccional:

```text
Entrada -> SchemaModel -> Diagrama -> Exportacion
```

Este enfoque desacopla las fuentes de entrada de la capa visual, permite extender conectores y mantiene una representacion intermedia comun para Web y Desktop.

## 2. Objetivos Logrados

| Objetivo | Estado | Evidencia |
| :-- | :--: | :-- |
| Implementar editor visual de diagramas | Logrado | Canvas React Flow, nodos de tablas, relaciones y toolbar de edicion |
| Soportar entrada por SQL DDL y JSON Schema | Logrado | Parsers PostgreSQL, MySQL, SQL Server y modelo `SchemaModel` |
| Guardar proyectos en la Web App | Logrado | Acciones backend, Drizzle ORM, migraciones y dashboard de proyectos |
| Incorporar autenticacion y perfiles | Logrado | Login, registro, perfil de usuario y sesiones Supabase |
| Implementar historial de versiones | Logrado | Version snapshots, restauracion y detalle de versiones |
| Permitir colaboracion y enlaces publicos | Logrado | Invitaciones, acceso de lectura, presencia y vista publica |
| Exportar diagramas | Logrado | Exportacion PNG, SVG y Mermaid `.mmd` |
| Preparar variante Desktop | Logrado en rama `desktop` | Tauri, backend FastAPI, sidecar local, conectores y empaquetado Windows |
| Documentar factibilidad, vision, requerimientos, arquitectura y proyecto | Logrado | FD01, FD02, FD03, FD04 y FD05 en `doc/` |

## 3. Alcance Entregado

### 3.1 Web App

La rama `main` contiene la version web limpia del producto. Sus componentes principales son:

- `frontend-app/`: aplicacion Next.js con App Router.
- `frontend-app/lib/backend/`: acciones server-side, persistencia y migraciones.
- `frontend-app/components/editor/`: editor visual de diagramas.
- `frontend-app/components/dashboard/`: gestion de proyectos, historial y tarjetas.
- `backend-app/`: backend NestJS conservado como soporte academico y de arquitectura.

Funcionalidades destacadas:

- Registro, login y actualizacion de perfil.
- Creacion, listado, eliminacion logica y restauracion de proyectos.
- Editor de diagramas con tabla, columnas, relaciones y panel inspector.
- Historial de versiones con restauracion.
- Exportacion de diagramas a formatos visuales y Mermaid.
- Compartir diagramas por enlace publico.

### 3.2 Desktop App

La rama `desktop` contiene la variante de escritorio. Sus componentes principales son:

- `frontend-app/`: interfaz Next.js exportada como sitio estatico.
- `frontend-app/src-tauri/`: contenedor nativo Tauri.
- `backend-python/`: sidecar FastAPI para conectores, diagramas, generacion de datos y analisis de consultas.

Funcionalidades destacadas:

- Ejecucion local sin depender de Node.js, pnpm ni Python en el equipo final.
- Inicio automatico del backend local como sidecar.
- Conexion a PostgreSQL, MySQL, SQL Server, MongoDB, Neo4j y Cassandra.
- Inspeccion de esquemas reales.
- Generacion de diagramas desde conexiones locales.
- Analisis de consultas y deteccion de patrones de rendimiento.
- Empaquetado Windows mediante instalador NSIS.

## 4. Manual de Despliegue y Ejecucion

### 4.1 Requisitos Web

- Node.js 20 LTS o superior.
- pnpm 9 o superior.
- Variables de entorno para Supabase o base de datos compatible.
- Cuenta de Vercel para despliegue.

### 4.2 Ejecucion Web en Desarrollo

```bash
cd frontend-app
pnpm install
pnpm dev
```

La aplicacion queda disponible en:

```text
http://localhost:3000
```

### 4.3 Despliegue Web en Vercel

```bash
cd frontend-app
pnpm install
pnpm build
```

Configuracion recomendada:

- Framework: Next.js.
- Root Directory: `frontend-app`.
- Build Command: `pnpm build`.
- Install Command: `pnpm install`.
- Output: administrado por Next.js.

### 4.4 Requisitos Desktop

- Node.js y pnpm para desarrollo.
- Rust y Cargo para compilar Tauri.
- Python para ejecutar o reconstruir el backend local durante desarrollo.
- Windows para generar el instalador NSIS validado.

### 4.5 Ejecucion Desktop en Desarrollo

```powershell
git switch desktop
cd frontend-app
pnpm install
pnpm desktop:dev
```

Durante desarrollo, Tauri usa `localhost:3000` para hot reload y ejecuta el backend Python local.

### 4.6 Construccion del Instalador Desktop

```powershell
git switch desktop
cd frontend-app
pnpm desktop:build
```

El instalador se genera en:

```text
frontend-app/src-tauri/target/release/bundle/nsis/FluxSQL Desktop_0.1.0_x64-setup.exe
```

## 5. Metricas y Validacion

| Metrica | Objetivo | Resultado |
| :-- | :-- | :-- |
| Tiempo de carga inicial Web | Menor a 3 s en entorno local | Cumplido en desarrollo local |
| Parseo DDL de esquemas pequenos y medianos | Menor a 1 s | Cumplido para scripts de prueba |
| Persistencia de proyectos | Guardado y recuperacion sin perdida de datos | Cumplido con acciones backend y migraciones |
| Exportacion de diagrama | Generar archivo descargable | Cumplido para PNG/SVG/Mermaid |
| Vista publica | Acceso por enlace sin exponer editor privado | Cumplido |
| Desktop sin dependencias finales | Instalador funcional sin Node.js/pnpm/Python | Cumplido en rama `desktop` |
| Preservacion de historial Git | Mantener evidencia de commits antiguos y nuevos | Cumplido en repo oficial con historiales combinados |

## 6. Riesgos Tratados

| Riesgo | Mitigacion aplicada |
| :-- | :-- |
| Bloqueo de despliegue en Vercel por organizacion/fork | Consolidacion del historial en el repositorio oficial y version web limpia en `main` |
| Mezcla de monorepo antiguo con estructura nueva | Separacion de documentacion Web/Desktop y limpieza del arbol final de `main` |
| Perdida de evidencia de commits | Merge de historiales `fluxsql` y `fluxsql-web` en el repo oficial |
| Exposicion de credenciales de bases de datos en Desktop | Backend local ejecutado como sidecar, con datos bajo AppData |
| Complejidad de multiples motores de BD | Uso de conectores y modelo intermedio comun |

## 7. Repositorio y Ramas

Repositorio oficial:

```text
https://github.com/UPT-FAING-EPIS/proyecto-si783-2026-i-u1-generador-de-diagramas-de-base
```

| Rama | Descripcion |
| :-- | :-- |
| `main` | Version web limpia, documentacion academica y evidencias principales |
| `desktop` | Variante de escritorio con Tauri + FastAPI |
| `redesign-ui` | Evolucion visual y redisenio de interfaz |

## 8. Conclusiones

El proyecto cumple con el objetivo principal de generar diagramas de base de datos a partir de esquemas y conexiones, proporcionando una experiencia web colaborativa y una variante desktop para ejecucion local. La arquitectura basada en `SchemaModel` facilita la extensibilidad hacia nuevos motores y formatos de exportacion.

La consolidacion del historial Git en el repositorio oficial permite conservar la evidencia de trabajo solicitada academicamente, incluyendo los commits del repositorio historico, la version web limpia y las ramas de evolucion desktop/UI.

Como mejora futura se propone fortalecer pruebas automatizadas de parsers, agregar mas conectores NoSQL, mejorar observabilidad de despliegue y completar instaladores para macOS y Linux.

## 9. Complemento de Informe Final según Plantilla de Referencia

El FD05 de referencia incorpora antecedentes, planteamiento del problema, marco teórico, tecnología, metodología, cronograma, presupuesto, recomendaciones y anexos. Se agregan estas secciones para completar el informe final de FluxSQL.

### 9.1 Antecedentes

Durante el desarrollo del proyecto se trabajó inicialmente con repositorios separados y forks para resolver problemas de despliegue y organización del código. Posteriormente, se consolidó el historial en el repositorio oficial de UPT-FAING-EPIS, preservando evidencia académica de commits, ramas y evolución técnica.

El proyecto evolucionó desde una Web App colaborativa hasta incluir una variante Desktop con ejecución local. Esta evolución permitió cubrir dos escenarios: despliegue web para colaboración y ejecución local para conexiones reales a bases de datos.

### 9.2 Planteamiento del problema

La documentación de esquemas de base de datos suele hacerse manualmente y queda rápidamente desactualizada. Además, el uso de servicios externos para inspeccionar bases reales puede generar preocupación por credenciales y datos sensibles.

FluxSQL responde a este problema mediante:

- generación de diagramas desde SQL/NoSQL;
- edición visual en canvas;
- historial de versiones;
- exportación de evidencias;
- despliegue Web mediante fork personal;
- variante Desktop para conexión local.

### 9.3 Marco teórico

| Concepto | Aplicación en FluxSQL |
| :-- | :-- |
| Modelado entidad-relación | Representación visual de tablas, columnas, llaves y relaciones. |
| Ingeniería inversa de BD | Extracción de estructura desde DDL o conexiones reales. |
| Control de versiones | Snapshots de diagramas y SQL para restauración. |
| Arquitectura cliente-servidor | Web App con Next.js, Server Actions y PostgreSQL/Supabase. |
| Aplicaciones de escritorio ligeras | Tauri + FastAPI local en la rama `desktop`. |
| Diagramación como código | Mermaid para representar casos de uso, secuencia, despliegue y ER. |

### 9.4 Tecnología de desarrollo

| Capa | Tecnología | Propósito |
| :-- | :-- | :-- |
| Frontend Web | Next.js, React, TypeScript, Tailwind CSS | Dashboard, landing, editor y vistas públicas. |
| Editor visual | React Flow / XYFlow | Canvas interactivo de nodos y relaciones. |
| Persistencia | PostgreSQL, Drizzle ORM, Supabase | Usuarios, proyectos, diagramas, versiones e invitaciones. |
| Parsers | TypeScript | Transformación de SQL, MongoDB y Neo4j a nodos. |
| Desktop | Tauri, FastAPI, Python | Conexiones locales y empaquetado nativo. |
| Despliegue | Vercel + GitHub | Publicación desde fork personal y PR hacia organización. |

### 9.5 Metodología de implementación

| Fase | Actividades principales | Producto esperado |
| :-- | :-- | :-- |
| Concepción | Definición del problema, alcance, factibilidad y repositorios. | FD01, FD02 y backlog inicial. |
| Elaboración | Diseño de arquitectura, requerimientos, modelos y vistas. | FD03, FD04 y prototipo funcional. |
| Construcción | Implementación de Web App, editor, parsers, versiones y colaboración. | Incrementos funcionales en `main`. |
| Integración | Consolidación de historiales, merge de `redesign-ui`, documentación Desktop. | Repo oficial limpio con `main` y `desktop`. |
| Transición | Deploy en Vercel desde fork, revisión final y anexos. | Entrega final y evidencia GitHub. |

### 9.6 Cronograma resumido

| Actividad / fase | Sem. 1-2 | Sem. 3-4 | Sem. 5-6 | Sem. 7-8 | Sem. 9-10 |
| :-- | :--: | :--: | :--: | :--: | :--: |
| Factibilidad y visión | X |  |  |  |  |
| Requerimientos y arquitectura |  | X |  |  |  |
| Web App y editor |  | X | X |  |  |
| Versiones, colaboración y exportación |  |  | X | X |  |
| Desktop y conectores locales |  |  |  | X | X |
| Consolidación de repositorios y documentación |  |  |  |  | X |

### 9.7 Presupuesto consolidado

| Componente de inversión | Tipo | Monto estimado |
| :-- | :-- | --: |
| Desarrollo académico del equipo | Personal | S/ 0.00 |
| Conectividad, energía y equipo propio | Operativo | S/ 300.00 |
| Herramientas open source | Software | S/ 0.00 |
| Servicios cloud en planes gratuitos | Infraestructura | S/ 0.00 |
| Dominio o recursos opcionales | Opcional | S/ 60.00 |
| Total estimado |  | S/ 360.00 |

### 9.8 Recomendaciones

1. Mantener el fork `iovargasjeff/fluxsql` como repositorio de trabajo y despliegue Vercel.
2. Enviar cambios estables mediante Pull Request hacia el repositorio oficial UPT.
3. No versionar `.env`, bases SQLite locales, binarios de Tauri ni builds generados.
4. Mantener `main` como versión Web estable y `desktop` como variante local documentada.
5. Agregar pruebas automatizadas para parsers MongoDB/Neo4j y flujos de invitaciones.

### 9.9 Anexos

| Anexo | Contenido |
| :-- | :-- |
| Anexo 01 | FD01 - Informe de Factibilidad |
| Anexo 02 | FD02 - Informe de Visión de Producto |
| Anexo 03 | FD03 - Especificación de Requerimientos |
| Anexo 04 | FD04 - Arquitectura de Software |
| Anexo 05 | Documentación Web/Desktop y README del repositorio |
