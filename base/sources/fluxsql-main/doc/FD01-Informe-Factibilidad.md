

<center>


![logo UPT](./media/logo-upt.png)


**UNIVERSIDAD PRIVADA DE TACNA**

**FACULTAD DE INGENIERÍA**

**Escuela Profesional de Ingeniería de Sistemas**

**Proyecto *DBCanvas — Generador de Diagramas de Base de Datos***

Curso: *Base de Datos II*

Docente: *Mag. Patrick Cuadros Quiroga*

Integrantes:

***Zapana Murillo, Kiara Holly (2023077087)***

***Vargas Espinoza, Jefferson Alfonso (2023076820)***

**Tacna – Perú**

***2026***

</center>

***

## 7. Complemento de Factibilidad según Plantilla de Referencia

El documento de referencia FD01 incorpora matrices explícitas de riesgos, recursos técnicos, costos operativos, costos de ambiente, costos de personal y flujo de caja. Para alinear este informe con esa estructura, se agrega la siguiente evidencia complementaria del proyecto FluxSQL.

### 7.1 Matriz ampliada de riesgos

| Código | Riesgo identificado | Impacto / descripción | Mitigación propuesta |
| :-- | :-- | :-- | :-- |
| R-01 | Dependencia de servicios externos para autenticación y base de datos | Si Supabase o el proveedor PostgreSQL presenta indisponibilidad, la Web App puede quedar limitada para login, guardado o colaboración. | Configurar variables por entorno, respaldos de base de datos y documentación de restauración. |
| R-02 | Complejidad de soportar múltiples dialectos SQL y NoSQL | PostgreSQL, MySQL, SQL Server, MongoDB y Neo4j tienen sintaxis y modelos distintos. | Mantener parsers aislados por dialecto y usar `SchemaModel` como contrato común. |
| R-03 | Riesgo de exponer credenciales en funciones de conexión directa | La variante Desktop trabaja con credenciales reales de BD del usuario. | Ejecutar conectores en backend local, no subir `.env`, no persistir credenciales sin cifrado y documentar buenas prácticas. |
| R-04 | Acumulación de archivos generados o binarios pesados | Builds de Tauri, sidecars y bases SQLite pueden inflar el repositorio. | Reglas `.gitignore`, eliminación de binarios generados y reconstrucción local mediante scripts. |
| R-05 | Desfase entre documentación académica y ramas técnicas | La evolución Web/Desktop puede dejar documentos antiguos con arquitectura obsoleta. | Mantener FD01-FD05 en `main`, documentación específica Desktop en `desktop` y notas de trazabilidad. |

### 7.2 Recursos de hardware y software

| Recurso | Uso principal | Característica recomendada |
| :-- | :-- | :-- |
| Equipo de desarrollo | Desarrollo Web, Desktop, parsers y documentación | CPU 4 núcleos, 8 GB RAM mínimo, Node.js 20+, pnpm, Git |
| Servicio PostgreSQL/Supabase | Persistencia de usuarios, proyectos, diagramas y versiones | Base PostgreSQL gestionada, backups automáticos, acceso por variables de entorno |
| Vercel | Despliegue de la Web App | Proyecto conectado al fork `iovargasjeff/fluxsql`, root `frontend-app` |
| Equipo usuario Desktop | Ejecución local de FluxSQL Desktop | Windows 10/11, instalador NSIS, almacenamiento en AppData |
| GitHub | Evidencia académica y control de versiones | Repo oficial UPT + fork personal para despliegue y PRs |

### 7.3 Costos complementarios del proyecto

| Componente de inversión | Tipo | Monto estimado |
| :-- | :-- | --: |
| Desarrollo Web y Desktop por equipo estudiantil | Personal académico | S/ 0.00 |
| Conectividad e internet | Operativo | S/ 200.00 |
| Energía eléctrica y uso de equipos propios | Operativo | S/ 100.00 |
| Servicios cloud en plan gratuito o educativo | Ambiente | S/ 0.00 |
| Dominio personalizado opcional | Ambiente | S/ 60.00 |
| Total estimado mínimo |  | S/ 360.00 |

### 7.4 Flujo de caja referencial

| Concepto | Periodo 0 | Año 1 | Año 2 | Año 3 |
| :-- | --: | --: | --: | --: |
| Inversión inicial | -S/ 360.00 | S/ 0.00 | S/ 0.00 | S/ 0.00 |
| Ahorro por uso de herramientas open source | S/ 0.00 | S/ 700.00 | S/ 700.00 | S/ 700.00 |
| Ahorro por reducción de documentación manual | S/ 0.00 | S/ 900.00 | S/ 900.00 | S/ 900.00 |
| Costos operativos anuales | S/ 0.00 | -S/ 120.00 | -S/ 120.00 | -S/ 120.00 |
| Flujo neto | -S/ 360.00 | S/ 1,480.00 | S/ 1,480.00 | S/ 1,480.00 |

### 7.5 Interpretación financiera complementaria

| Indicador | Interpretación |
| :-- | :-- |
| VAN | El proyecto mantiene valor positivo al reducir dependencia de herramientas comerciales y acelerar documentación técnica. |
| TIR | Es favorable por la baja inversión monetaria directa y alto reaprovechamiento académico/técnico. |
| B/C | La relación beneficio/costo es positiva porque la inversión principal es tiempo de desarrollo ya evidenciado en GitHub. |

Sistema *DBCanvas — Database Diagram Generator*

Informe de Factibilidad

Versión *1.0*


| CONTROL DE VERSIONES |  |  |  |  |  |
| :--: | :-- | :-- | :-- | :-- | :-- |
| Versión | Hecha por | Revisada por | Aprobada por | Fecha | Motivo |
| 1.0 | KHZM / JAVE |  |  | Marzo 2026 | Versión Original |
| 1.1 | KHZM / JAVE |  |  | Junio 2026 | Actualización de alcance final Web/Desktop |


***

## Nota de Actualización - Junio 2026

El análisis de factibilidad se mantiene como evidencia de la planificación inicial del proyecto. Para la entrega final, el repositorio oficial conserva dos variantes: la **Web App** en la rama `main`, basada en Next.js, Supabase/Drizzle y despliegue en Vercel; y la **Desktop App** en la rama `desktop`, basada en Tauri, frontend estático y backend local FastAPI. Las referencias históricas a Electron, Go, `Turborepo` o paquetes `@dbcanvas/*` corresponden a la arquitectura prevista en la fase de factibilidad y fueron reemplazadas por la implementación final documentada en FD04 y FD05.

## ÍNDICE GENERAL

1. Descripción del Proyecto
2. Riesgos
3. Análisis de la Situación Actual
4. Estudio de Factibilidad
    - 4.1 Factibilidad Técnica
    - 4.2 Factibilidad Económica
    - 4.3 Factibilidad Operativa
    - 4.4 Factibilidad Legal
    - 4.5 Factibilidad Social
    - 4.6 Factibilidad Ambiental
5. Análisis Financiero
6. Conclusiones

***

# Informe de Factibilidad


***

## 1. Descripción del Proyecto

### 1.1. Nombre del Proyecto

**DBCanvas — Generador de Diagramas de Base de Datos**
Herramienta monorepo web + desktop para generar diagramas ERD automáticamente a partir de conexiones reales a bases de datos, sentencias SQL DDL y esquemas JSON Schema.

***

### 1.2. Duración del Proyecto

| Elemento | Detalle |
| :-- | :-- |
| Fecha de inicio | Milestone v0.1 — Setup del monorepo y arquitectura base |
| Fecha de término estimada | Milestone v1.0 — Release con instaladores para Win/Mac/Linux |
| Total de issues planificados | 38 issues distribuidos en 4 milestones |
| Estimación total de desarrollo | 30 días (~4 semanas a ritmo de 4–5 horas/día) |
| Metodología | Desarrollo incremental por fases con tablero Kanban en GitHub Projects |

#### Distribución de fases y esfuerzo

| Milestone | Descripción | Issues | Días estimados |
| :-- | :-- | :--: | :--: |
| **v0.1** | Setup del monorepo, packages compartidos, CI/CD y contrato de API | \#1 – \#8 | 7 d |
| **v0.2** | Backend Go: servidor HTTP, conectores BD, generador Mermaid y endpoints REST | \#9 – \#18 | 7 d |
| **v0.3** | Web App React: editor Monaco, renderer Mermaid, parsers, export y templates | \#19 – \#28 | 7 d |
| **v1.0** | Desktop Electron, empaquetado del binary Go, instaladores y release final | \#29 – \#38 | 9 d |
| **Total** |  | **38** | **~30 días** |


***

### 1.3. Descripción

**DBCanvas** es una herramienta de software de código abierto orientada a desarrolladores, arquitectos de software y estudiantes de bases de datos que necesitan visualizar y documentar el esquema de sus bases de datos sin esfuerzo manual. El proyecto nace como iniciativa académica con proyección de convertirse en una herramienta de productividad distribuible como aplicación de escritorio multiplataforma y como aplicación web accesible desde el navegador.

La herramienta se materializa en **dos superficies complementarias**:

- **Web App (React + Vite + TypeScript):** accesible desde el navegador sin instalación. Permite pegar sentencias SQL DDL o un JSON Schema y obtener el diagrama ERD renderizado en tiempo real, con export a PNG, SVG y `.mmd`.
- **Desktop App (Electron):** aplicación nativa para Windows, macOS y Linux. Se conecta directamente a bases de datos reales (PostgreSQL, MySQL, SQLite, MongoDB), extrae el schema automáticamente mediante un backend Go embebido y genera el diagrama ERD con selección visual de tablas.

El contexto en que se desarrolla es el de la creciente necesidad de documentación ágil en equipos de desarrollo modernos, donde la falta de diagramas ERD actualizados genera deuda técnica y dificulta el onboarding de nuevos desarrolladores. La arquitectura del proyecto es un **monorepo** gestionado con `pnpm workspaces` y `Turborepo`, con un backend API en Go y paquetes TypeScript compartidos (`@dbcanvas/ui` y `@dbcanvas/parsers`) reutilizados en ambas apps.

La herramienta se distingue por los siguientes atributos:

- **Multi-fuente:** genera diagramas desde tres fuentes distintas — conexión real a BD (4 motores), SQL DDL pegado manualmente, y JSON Schema / documento de ejemplo MongoDB.
- **Backend en Go:** servidor HTTP ultraligero con conectores nativos para PostgreSQL, MySQL, SQLite y MongoDB, capaz de ejecutarse como proceso hijo embebido dentro de Electron sin que el usuario instale Go ni ningún runtime externo.
- **Parsers TypeScript puros:** los parsers de SQL DDL y JSON Schema se ejecutan completamente en el cliente (browser), sin necesidad de backend, garantizando privacidad total de los datos del usuario.
- **Render en tiempo real:** el diagrama ERD se actualiza automáticamente con debounce de 300 ms mientras el usuario escribe, sin recargas ni esperas.
- **Exportación completa:** PNG, SVG, `.mmd` (Mermaid) y SQL DDL formateado, descargables con un solo clic.
- **Distribución lista:** instaladores nativos `.exe` (Windows), `.dmg` (macOS) y `.AppImage` (Linux) con el backend Go empaquetado internamente, sin dependencias para el usuario final.

***

### 1.4. Objetivos

#### 1.4.1. Objetivo General

Desarrollar una herramienta de código abierto en arquitectura monorepo (Go + React + Electron) que permita generar diagramas ERD de bases de datos relacionales y NoSQL de forma automática a partir de conexiones reales o de entradas de texto estructurado, consolidando competencias en diseño de APIs REST, parsers de lenguajes formales y desarrollo de aplicaciones de escritorio multiplataforma.

#### 1.4.2. Objetivos Específicos

| \# | Objetivo Específico | Milestone | Issues | Logro Esperado |
| :-- | :-- | :--: | :-- | :-- |
| OE1 | Diseñar e implementar la arquitectura base del monorepo con `pnpm workspaces`, `Turborepo`, paquetes compartidos `@dbcanvas/ui` y `@dbcanvas/parsers`, pipeline CI/CD en GitHub Actions y el contrato de API Go ↔ TypeScript documentado | v0.1 | \#1–\#8 | El monorepo está operativo. `pnpm dev` desde la raíz levanta todos los servicios sin errores. `docs/api-contract.md` describe el JSON de intercambio entre backend y frontend. |
| OE2 | Implementar el servidor HTTP en Go con puerto dinámico, los conectores para PostgreSQL, MySQL, SQLite y MongoDB, el generador de strings Mermaid ERD y los endpoints REST `/connect`, `/schemas`, `/tables`, `/generate` y `/disconnect` | v0.2 | \#9–\#18 | `POST /generate` con un `sessionId` válido devuelve un string Mermaid ERD correcto y renderizable para los 4 motores de BD soportados. |
| OE3 | Desarrollar la Web App React con editor Monaco con syntax highlighting, renderer Mermaid.js con debounce, parsers SQL DDL → ERD y JSON Schema → ERD en tiempo real, funcionalidad de export en 4 formatos y galería de 6 templates, validados con tests E2E en Playwright | v0.3 | \#19–\#28 | Pegar un `CREATE TABLE` real en el editor actualiza el diagrama en menos de 500 ms. Los 4 formatos de export descargan archivos válidos. Los tests E2E pasan en CI. |
| OE4 | Desarrollar la Desktop App Electron con spawn del backend Go como proceso hijo, pantallas de conexión (ConnectionForm), selección de tablas (TableSelector) y vista de diagrama con export; empaquetar el binary Go compilado para 3 SO dentro del installer y generar releases descargables en GitHub | v1.0 | \#29–\#38 | El flujo completo Conectar → Seleccionar Tablas → Generar Diagrama → Exportar funciona en Windows, macOS y Linux sin instalar Go. El release v1.0.0 en GitHub incluye `.exe`, `.dmg` y `.AppImage` como assets descargables. |


***

## 2. Riesgos

Los siguientes riesgos han sido identificados como factores que podrían afectar el éxito del proyecto:


| \# | Riesgo | Milestone | Probabilidad | Impacto | Estrategia de Mitigación |
| :-- | :-- | :--: | :--: | :--: | :-- |
| R1 | **Heterogeneidad de APIs de schema entre motores:** `information_schema` tiene diferencias entre PostgreSQL, MySQL y SQLite (usa `PRAGMA`), y MongoDB no tiene schema fijo. Normalizar todos al mismo modelo `[]Table` puede resultar más complejo de lo estimado. | v0.2 | Alta | Alto | Cada conector encapsula su lógica internamente. El backend expone una interfaz `Connector` en Go con métodos comunes. El conector MongoDB usa sampling de 100 documentos con `$sample` para inferir tipos por frecuencia. |
| R2 | **Sincronización del spawn Go–Electron:** el proceso hijo Go debe iniciar, imprimir `READY:{port}` en stdout y ser capturado antes de que React intente hacer fetch. Un timing incorrecto produce errores de "connection refused". | v1.0 | Alta | Alto | Implementar espera activa en el main process de Electron leyendo stdout línea a línea. Continuar solo al detectar el prefijo `READY:`. Reintentar el spawn hasta 3 veces antes de mostrar error al usuario. |
| R3 | **Parser SQL DDL incompleto:** el parser TypeScript puede no cubrir todas las variantes sintácticas de `CREATE TABLE` (MySQL vs PostgreSQL, PK inline vs constraint, tipos con parámetros como `VARCHAR(255)`, `DECIMAL(10,2)`). | v0.3 | Media | Alto | Cubrir las variantes más frecuentes con mínimo 10 tests unitarios con Vitest. Las variantes no soportadas muestran un error descriptivo debajo del editor sin crashear la app. Extensible en versiones futuras. |
| R4 | **Inferencia de tipos inconsistente en MongoDB:** colecciones con documentos de estructura heterogénea pueden producir ERDs de baja calidad o con columnas incorrectas. | v0.2 | Media | Medio | Aplicar regla de frecuencia: un campo se incluye si aparece en ≥20% de los documentos del sample. El tipo se asigna por mayoría (si ≥80% son strings → `string`). Documentar la limitación en el README. |
| R5 | **Scope de 30 días insuficiente:** el alcance cubre backend Go + Web App React + Desktop Electron, lo cual es ambicioso para un equipo de dos personas en 1 mes a ritmo parcial. | Todas | Media | Alto | La Web App (v0.3) es completamente funcional de forma independiente al Desktop. Si el tiempo es insuficiente, la Desktop App puede reducirse a conexión y generación básica, posponiendo empaquetado de instaladores multiplataforma. |
| R6 | **Empaquetado multiplataforma con electron-builder:** compilar el binary Go para Win/Mac/Linux y empaquetarlo correctamente dentro del installer puede requerir cross-compilation o configuración de CI compleja. | v1.0 | Media | Medio | Configurar GitHub Actions con matrix de runners (`ubuntu-latest`, `windows-latest`, `macos-latest`). Cada runner compila su binary nativo y sube el artifact al release automáticamente. |
| R7 | **Fuga de credenciales de bases de datos:** el formulario de conexión solicita usuario y contraseña. Un error de implementación podría exponerlas en logs, `localStorage` o en consola. | v0.2 / v1.0 | Baja | Crítico | Nunca almacenar contraseñas en `localStorage`. Guardar en "conexiones recientes" solo host y nombre de BD. El backend Go no incluye la connection string completa en logs, solo tipo de motor y host. |
| R8 | **Cambios de API en mermaid.js entre versiones mayores:** actualizaciones de la librería pueden romper el componente `DiagramViewer` si cambia la forma de inicialización o la API de render. | v0.3 | Baja | Medio | Fijar la versión de `mermaid` en `package.json`. Encapsular toda la lógica de render dentro del componente `DiagramViewer` de `@dbcanvas/ui` para aislar el impacto de futuros cambios. |


***

## 3. Análisis de la Situación Actual

### 3.1. Planteamiento del Problema

#### Antecedentes

La documentación del esquema de una base de datos mediante diagramas Entidad-Relación (ERD) es una práctica esencial en el ciclo de vida del desarrollo de software. Sin embargo, en la práctica real, los equipos frecuentemente trabajan con bases de datos cuyos diagramas están desactualizados, son inexistentes o requieren herramientas costosas y dependientes de licencias comerciales para generarse.

Herramientas establecidas como **MySQL Workbench**, **pgAdmin**, **DBeaver** o **DataGrip** ofrecen capacidades de ingeniería inversa del schema, pero presentan limitaciones importantes: son aplicaciones pesadas que requieren instalación compleja, suelen estar ligadas a un motor específico de base de datos, o en el caso de DataGrip, requieren una suscripción de pago (USD 229/año). Por su parte, herramientas web como **dbdiagram.io** o **QuickDBD** operan en la nube, lo que implica que el schema de la base de datos —información sensible— se transmite a servidores externos fuera del control del desarrollador.

La necesidad de una herramienta **local, ligera, multiplataforma, multi-motor y de código abierto** que genere diagramas ERD tanto desde conexiones reales como desde texto estructurado constituye el vacío que **DBCanvas** viene a cubrir.

#### Situación Actual

Actualmente, un desarrollador que necesita documentar el schema de una base de datos sigue uno de estos procesos ineficientes:

1. **Proceso manual con herramientas visuales (pgAdmin, MySQL Workbench):** conectarse a la herramienta, navegar para encontrar la opción de "reverse engineering", exportar el diagrama en formato propietario (`.mwb`, `.pgerd`) y convertirlo a imagen compartible. El proceso consume entre 15 y 45 minutos y produce un archivo que se desactualiza con el primer `ALTER TABLE`.
2. **Proceso semi-manual con dbdiagram.io:** exportar el DDL desde el cliente de la BD, pegarlo en la herramienta web, corregir errores de parseo manualmente y descargar la imagen. Requiere enviar el schema a servidores externos y no tiene integración directa con la base de datos.
3. **Proceso CLI con mermerd:** usar la herramienta de código abierto que genera Mermaid ERD desde la línea de comandos. Requiere tener Go instalado, carece de interfaz gráfica, no soporta parseo de SQL DDL ni JSON Schema, y su curva de aprendizaje desalienta a desarrolladores que no son usuarios avanzados de terminal.

Ninguno de estos procesos integra en una sola herramienta las tres fuentes de input (conexión real, SQL DDL, JSON Schema), una interfaz visual amigable, render en tiempo real y distribución como aplicación de escritorio instalable sin dependencias externas.

#### Problemática que resuelve el proyecto

**DBCanvas** centraliza y simplifica este proceso al proveer:

- **Conexión directa a 4 motores de BD** (PostgreSQL, MySQL, SQLite, MongoDB) con interfaz visual, sin línea de comandos ni instalación de runtimes adicionales.
- **Parsers de texto en tiempo real** para SQL DDL y JSON Schema, ejecutados localmente en el navegador, sin enviar datos a servidores externos.
- **Render inmediato** del diagrama ERD con mermaid.js, actualizado con cada cambio del usuario (debounce 300 ms).
- **Exportación en múltiples formatos** (PNG, SVG, `.mmd`, SQL DDL formateado) con un solo clic.
- **Distribución como app de escritorio** con instaladores nativos para Windows, macOS y Linux, con el backend Go empaquetado internamente para que el usuario final no necesite instalar Go ni Node.js.

***

### 3.2. Consideraciones de Hardware y Software

#### Hardware disponible y requerido

| Componente | Mínimo (usuario final) | Recomendado (desarrollo) |
| :-- | :-- | :-- |
| CPU | Dual-core 1.8 GHz | Quad-core 2.5 GHz o superior |
| RAM | 512 MB (Web App en navegador) + ~150 MB (Desktop con backend Go) | 8 GB (para correr múltiples instancias de BD en Docker simultáneamente) |
| Almacenamiento | < 250 MB (app instalada con binary Go incluido) | 20 GB (imágenes Docker de BD + dependencias pnpm + módulos Go) |
| Sistema Operativo | Windows 10+, macOS 11+, Ubuntu 20.04+ | Ubuntu 22.04 LTS o macOS 13+ |
| Red | Acceso a la BD objetivo (local o remota) | Acceso a internet para descarga de dependencias |
| Node.js | No requerido (usuario final de Desktop) | 20 LTS (desarrollo del monorepo) |
| Go | No requerido (usuario final — binary embebido) | 1.22+ (desarrollo del backend) |

No se requiere servidor dedicado, infraestructura cloud ni hardware especializado para el uso de la herramienta en producción.

#### Software seleccionado para la implementación

| Categoría | Tecnología | Justificación Técnica |
| :-- | :-- | :-- |
| Gestión del monorepo | `pnpm workspaces` + `Turborepo` | pnpm reduce duplicación de `node_modules`. Turborepo habilita builds incrementales y pipelines paralelas entre los paquetes. |
| Backend API | Go 1.22 + `net/http` stdlib | Go compila a binary estático sin dependencias externas, ideal para embeber en Electron. Consume menos de 10 MB de RAM en reposo. |
| Conector PostgreSQL | `github.com/lib/pq` | Driver maduro compatible con `database/sql` de Go stdlib. Soporte completo de `information_schema`. |
| Conector MySQL | `github.com/go-sql-driver/mysql` | Driver estándar para Go con DSN format compatible con MySQL 8 y MariaDB. |
| Conector SQLite | `github.com/mattn/go-sqlite3` | Soporte completo de `PRAGMA table_info`, `PRAGMA foreign_key_list` y `PRAGMA table_list`. |
| Conector MongoDB | `go.mongodb.org/mongo-driver` | Driver oficial de MongoDB para Go con soporte del Aggregation Framework para sampling de documentos. |
| Frontend Web | React 18 + Vite 5 + TypeScript | Stack estándar de la industria para SPAs. Vite provee HMR ultrarrápido en desarrollo y builds optimizados para producción. |
| UI Components | Tailwind CSS + shadcn/ui | Diseño consistente y accesible. shadcn/ui provee componentes sin dependencia de runtime en producción. |
| Editor de código | Monaco Editor (`@monaco-editor/react`) | El mismo motor de VS Code. Syntax highlighting nativo para SQL y JSON. Extensible para Mermaid mediante lenguaje custom. |
| Renderer de diagramas | mermaid.js | Librería de referencia para renderizar diagramas Mermaid en el navegador como SVG interactivo. |
| Package compartido UI | `@dbcanvas/ui` (Vite library mode ESM) | Componentes React (`DiagramViewer`, `CodeEditor`, `TableSelector`, `ConnectionForm`) compartidos entre Web App y Desktop. |
| Package compartido parsers | `@dbcanvas/parsers` (TypeScript puro) | Parsers sin dependencias de browser ni Node.js. Testeables con Vitest de forma completamente aislada. |
| Desktop App | Electron 29 + `electron-vite` | Empaqueta la Web App React como aplicación nativa con acceso al sistema de archivos. electron-vite habilita HMR en desarrollo. |
| Empaquetado | `electron-builder` | Genera instaladores nativos (`.exe`, `.dmg`, `.AppImage`) con un único script de build. |
| Testing unitario | Vitest | Framework de testing nativo para proyectos Vite con el mismo API que Jest. |
| Testing E2E | Playwright | Framework moderno para tests end-to-end con soporte de múltiples navegadores e integración nativa con CI. |
| CI/CD | GitHub Actions | Pipeline automático con matrix de runners para compilar el binary Go nativo en los 3 SO. |
| Control de versiones | Git + GitHub Projects | Tablero Kanban con 4 milestones y 38 issues con criterios de aceptación detallados y verificables. |

#### Tecnologías por milestone y motor

| Milestone | Motor / Capa | Tipo | Tecnología |
| :--: | :-- | :-- | :-- |
| v0.2 | PostgreSQL 16 | SQL Relacional | `github.com/lib/pq` |
| v0.2 | MySQL 8 / MariaDB | SQL Relacional | `github.com/go-sql-driver/mysql` |
| v0.2 | SQLite 3 | SQL Embebido | `github.com/mattn/go-sqlite3` |
| v0.2 | MongoDB 7 | Documental NoSQL | `go.mongodb.org/mongo-driver` |
| v0.3 | Parser SQL DDL | TypeScript cliente | `@dbcanvas/parsers` |
| v0.3 | Parser JSON Schema | TypeScript cliente | `@dbcanvas/parsers` |
| v1.0 | Desktop nativa | Electron + Go binary | `electron-builder` + `go build` |


***

## 4. Estudio de Factibilidad

El presente estudio de factibilidad fue elaborado para determinar si el proyecto es viable desde las perspectivas técnica, económica, operativa, legal, social y ambiental. La evaluación fue realizada durante el milestone v0.1 por los integrantes Zapana Murillo, Kiara Holly y Vargas Espinoza, Jefferson Alfonso, y aprobada por el docente asesor del curso Base de Datos II.

***

### 4.1. Factibilidad Técnica

El estudio de viabilidad técnica evalúa los recursos tecnológicos disponibles actualmente y su aplicabilidad a las necesidades esperadas del proyecto.

#### Evaluación de la arquitectura

El sistema se estructura en **cinco capas** desarrolladas progresivamente a lo largo de los cuatro milestones:


| Capa | Responsabilidad | Tecnología | Milestone |
| :-- | :-- | :-- | :--: |
| Presentación Desktop | UI nativa: formularios de conexión, selección de tablas y diagrama interactivo | Electron 29 + React + `@dbcanvas/ui` | v1.0 |
| Presentación Web | SPA con editor de código y renderer Mermaid en tiempo real | React 18 + Vite + `@dbcanvas/ui` | v0.3 |
| Parsers cliente | Conversión SQL DDL / JSON Schema → Mermaid ERD en el browser, sin backend | `@dbcanvas/parsers` (TypeScript puro) | v0.3 |
| API REST | Endpoints de conexión, exploración de schema y generación de diagramas desde BD real | Go `net/http` stdlib | v0.2 |
| Conectores BD | Extracción de schema desde 4 motores de bases de datos con interfaz común `Connector` | Drivers Go nativos | v0.2 |

#### Evaluación por componente técnico

| Componente | Tecnología | Disponible y gratuito | Factibilidad |
| :-- | :-- | :--: | :--: |
| Monorepo manager | pnpm workspaces + Turborepo | ✅ Open source | ✅ Factible |
| Backend HTTP con puerto dinámico | Go `net/http` stdlib | ✅ Open source | ✅ Factible |
| Conector PostgreSQL | `lib/pq` | ✅ MIT | ✅ Factible |
| Conector MySQL | `go-sql-driver/mysql` | ✅ MPL 2.0 | ✅ Factible |
| Conector SQLite | `go-sqlite3` (cgo) | ✅ MIT | ✅ Factible |
| Conector MongoDB con schema inference | `mongo-driver` oficial | ✅ Apache 2.0 | ✅ Factible |
| Generador Mermaid ERD | Go puro (string generation) | ✅ Stdlib | ✅ Factible |
| SPA React + Vite + TypeScript | React 18 + Vite 5 | ✅ MIT | ✅ Factible |
| Editor Monaco | `@monaco-editor/react` | ✅ MIT | ✅ Factible |
| Renderer Mermaid con zoom/pan | mermaid.js | ✅ MIT | ✅ Factible |
| Parser SQL DDL → Mermaid ERD | TypeScript puro (`@dbcanvas/parsers`) | ✅ Open source | ✅ Factible |
| Parser JSON Schema → Mermaid ERD | TypeScript puro (`@dbcanvas/parsers`) | ✅ Open source | ✅ Factible |
| UI Components compartidos | shadcn/ui + Tailwind CSS | ✅ MIT | ✅ Factible |
| Desktop App nativa | Electron 29 + electron-vite | ✅ MIT | ✅ Factible |
| Spawn proceso hijo Go en Electron | Node.js `child_process` (Electron main) | ✅ MIT | ✅ Factible |
| IPC bridge Electron (contextBridge) | Electron preload API | ✅ MIT | ✅ Factible |
| Empaquetado multiplataforma | electron-builder | ✅ MIT | ✅ Factible |
| Tests unitarios (parsers) | Vitest | ✅ MIT | ✅ Factible |
| Tests E2E Web App | Playwright | ✅ Apache 2.0 | ✅ Factible |
| CI/CD con matrix de runners | GitHub Actions | ✅ Gratuito (plan Free) | ✅ Factible |

**Conclusión técnica:** el proyecto es **técnicamente factible**. El 100% de las tecnologías requeridas son de código abierto, gratuitas y ampliamente documentadas. La arquitectura monorepo en capas con packages compartidos garantiza desarrollo paralelo entre los dos integrantes, reutilización de código y extensibilidad futura. La decisión de compilar el backend Go a un binary estático resuelve completamente el problema de distribución de la Desktop App sin dependencias de runtime para el usuario final.

***

### 4.2. Factibilidad Económica

#### 4.2.1. Costos Generales

| Concepto | Cantidad | Costo unitario (S/.) | Costo total (S/.) |
| :-- | :--: | :--: | :--: |
| Material de escritorio (cuaderno, lapiceros) | 1 kit | 15.00 | 15.00 |
| Impresión del informe de factibilidad | 25 páginas | 0.20 | 5.00 |
| **Total costos generales** |  |  | **20.00** |

#### 4.2.2. Costos Operativos Durante el Desarrollo

La duración del proyecto es de aproximadamente 1 mes (30 días calendario).


| Concepto | Meses | Costo mensual (S/.) | Costo total (S/.) |
| :-- | :--: | :--: | :--: |
| Servicio de internet (2 integrantes) | 1 | 120.00 | 120.00 |
| Energía eléctrica (2 equipos de cómputo, ~5 h/día) | 1 | 60.00 | 60.00 |
| **Total costos operativos** |  |  | **180.00** |

#### 4.2.3. Costos del Ambiente

| Concepto | Licencia | Costo (S/.) |
| :-- | :-- | :--: |
| Go 1.22 | BSD 3-Clause | 0.00 |
| Node.js 20 LTS + pnpm | MIT | 0.00 |
| Turborepo | MIT | 0.00 |
| React 18 + Vite 5 + TypeScript | MIT | 0.00 |
| Tailwind CSS + shadcn/ui | MIT | 0.00 |
| Monaco Editor (`@monaco-editor/react`) | MIT | 0.00 |
| mermaid.js | MIT | 0.00 |
| Electron 29 + electron-vite + electron-builder | MIT | 0.00 |
| Vitest + Playwright | MIT / Apache 2.0 | 0.00 |
| Drivers Go (`lib/pq`, `go-sqlite3`, `mongo-driver`, `go-sql-driver`) | MIT / Apache 2.0 | 0.00 |
| Docker Desktop | Gratuito (uso académico) | 0.00 |
| GitHub — repositorio + Actions + Projects | Gratuito (plan Free, 2,000 min/mes) | 0.00 |
| VS Code u otro IDE | Gratuito | 0.00 |
| **Total costos del ambiente** |  | **0.00** |

#### 4.2.4. Costos de Personal

El proyecto es desarrollado por dos integrantes que asumen roles complementarios de desarrollo full-stack.


| Nombre | Rol | Horas/día | Días | Total horas | Costo/hora (S/.) | Costo total (S/.) |
| :-- | :-- | :--: | :--: | :--: | :--: | :--: |
| Zapana Murillo, Kiara Holly | Desarrolladora Frontend / Parsers | 4.5 | 30 | 135 h | 15.00 | 2,025.00 |
| Vargas Espinoza, Jefferson Alfonso | Desarrollador Backend Go / Electron | 4.5 | 30 | 135 h | 15.00 | 2,025.00 |
| **Total costos de personal** |  |  |  | **270 h** |  | **4,050.00** |

> El costo por hora es un costo de oportunidad estimado según el mercado laboral para desarrolladores junior en Tacna, Perú (S/. 15/hora).

#### 4.2.5. Costos Totales del Desarrollo del Sistema

| Categoría | Costo (S/.) | % del total |
| :-- | :--: | :--: |
| Costos generales | 20.00 | 0.4% |
| Costos operativos durante el desarrollo | 180.00 | 3.9% |
| Costos del ambiente | 0.00 | 0.0% |
| Costos de personal | 4,050.00 | 95.7% |
| **TOTAL INVERSIÓN INICIAL** | **4,250.00** | **100%** |


***

### 4.3. Factibilidad Operativa

**DBCanvas** presenta alta factibilidad operativa por las siguientes razones:

**Beneficios concretos para los usuarios:**

- **Desarrolladores de software:** reducen el tiempo de documentación del schema de 30–60 minutos (proceso manual) a menos de 2 minutos con DBCanvas.
- **Estudiantes de Ingeniería de Sistemas:** disponen de una herramienta gratuita y de código abierto para visualizar el schema de sus proyectos académicos sin licencias comerciales.
- **Arquitectos de software:** generan diagramas ERD actualizados directamente desde la BD de producción para presentaciones y revisiones de diseño.
- **Docentes:** utilizan la herramienta como material didáctico para enseñar modelado de bases de datos con ejemplos reales de sistemas activos.

**Lista de interesados (stakeholders):**


| Interesado | Rol | Interés en el proyecto |
| :-- | :-- | :-- |
| Zapana Murillo, Kiara Holly | Desarrolladora y co-propietaria del producto | Entrega académica y aprendizaje de tecnologías modernas |
| Vargas Espinoza, Jefferson Alfonso | Desarrollador y co-propietario del producto | Entrega académica y aprendizaje de tecnologías modernas |
| Mag. Patrick Cuadros Quiroga | Docente asesor y evaluador | Calidad del producto y cumplimiento del plan de desarrollo |
| Comunidad open source en GitHub | Usuarios potenciales y colaboradores | Herramienta gratuita de productividad para documentación de BD |
| Equipos de desarrollo de software | Usuarios finales | Ahorro de tiempo en documentación y onboarding |
| Estudiantes de la carrera | Usuarios académicos | Apoyo visual para aprendizaje de modelado de datos |

**Capacidad de mantenimiento:** al ser código abierto en GitHub con arquitectura modular (interfaz `Connector` en Go para agregar nuevos motores, paquetes TypeScript independientes para agregar nuevos parsers), cualquier contribuidor puede extender la herramienta sin modificar el código existente. Los criterios de aceptación definidos en cada uno de los 38 issues garantizan que el sistema es verificable y mantenible a largo plazo.

***

### 4.4. Factibilidad Legal

**DBCanvas** es **legalmente viable** por las siguientes razones:

- **Licencias de software:** el 100% de las dependencias utilizadas poseen licencias de código abierto compatibles entre sí (MIT, Apache 2.0, BSD 3-Clause, MPL 2.0). No se utiliza ningún software propietario ni con restricciones comerciales. La herramienta puede distribuirse bajo licencia MIT sin conflicto legal.
- **Protección de datos personales:** la herramienta opera completamente de forma local. Los parsers de SQL DDL y JSON Schema se ejecutan en el navegador del usuario (client-side). El backend Go se ejecuta en la máquina local del usuario como proceso hijo de Electron. **Ningún dato del schema de la base de datos se transmite a servidores externos**, siendo plenamente compatible con la **Ley N° 29733 de Protección de Datos Personales del Perú** y con el **GDPR** para usuarios internacionales.
- **Manejo de credenciales:** la herramienta no almacena contraseñas en texto plano ni en `localStorage`. Las conexiones recientes guardan únicamente host y nombre de BD. Las credenciales solo existen en memoria RAM durante la sesión activa y se descartan al cerrar la aplicación.
- **Propiedad intelectual del output:** los diagramas Mermaid ERD generados son derivados del schema de la base de datos propia del usuario. No existen conflictos de propiedad intelectual sobre el output de la herramienta.
- **Uso académico:** el proyecto no tiene fines comerciales en su versión inicial. Su publicación en GitHub bajo licencia MIT es compatible con las políticas de uso académico de la Universidad Privada de Tacna.

***

### 4.5. Factibilidad Social

**DBCanvas** tiene un impacto social positivo en los siguientes aspectos:

- **Democratización de herramientas:** pone a disposición de estudiantes y desarrolladores independientes una capacidad (ingeniería inversa visual de BD con conexión directa) anteriormente reservada a herramientas comerciales costosas como DataGrip (USD 229/año) o DbSchema (USD 145 licencia perpetua).
- **Fomento del código abierto:** al publicarse en GitHub con licencia MIT, contribuye al ecosistema de herramientas de productividad open source para la comunidad hispanohablante de desarrolladores, un segmento con escasa representación en el ecosistema de herramientas de BD.
- **Valor educativo:** la herramienta actúa simultáneamente como instrumento de productividad y como recurso de aprendizaje. Un estudiante que genera el diagrama ERD de una BD real puede comprender visualmente las relaciones entre tablas y las claves foráneas, reforzando el aprendizaje de modelado de datos de forma práctica.
- **Reducción de deuda técnica:** al facilitar la generación y actualización continua de diagramas ERD, contribuye a mejorar la calidad del software en los proyectos que adopten la herramienta.
- **Accesibilidad sin barreras:** al distribuirse como aplicación de escritorio con instalador nativo y como Web App accesible desde el navegador, no requiere conocimientos técnicos avanzados, ampliando su alcance a perfiles no técnicos como analistas de negocio o diseñadores de bases de datos.

***

### 4.6. Factibilidad Ambiental

El impacto ambiental del proyecto **DBCanvas** es mínimo y con tendencia positiva:

- **Impacto directo mínimo:** la herramienta es un proceso ligero que consume menos de 50 MB de RAM en la Web App y menos de 200 MB en la Desktop App (incluyendo el proceso Electron y el backend Go). No requiere servidor dedicado, infraestructura cloud ni centros de datos propios, eliminando completamente el consumo energético asociado a la operación de servidores.
- **Impacto indirecto positivo:** al eliminar la necesidad de usar herramientas pesadas como MySQL Workbench (aplicación Java que consume entre 300–500 MB de RAM) o de acceder a servicios en la nube como dbdiagram.io, la herramienta reduce el consumo energético tanto en el equipo del usuario como en los servidores de terceros.
- **Ciclo de vida sostenible:** al ser de código abierto sin dependencia de servicios de terceros ni suscripciones, la herramienta puede mantenerse y actualizarse indefinidamente por la comunidad, sin obsolescencia planificada ni necesidad de adquirir nuevas versiones comerciales.
- **Desarrollo digital:** el proyecto se desarrolla íntegramente en entornos digitales (GitHub, Docker, terminal). El backlog completo (38 issues), la documentación técnica y el código fuente residen en GitHub, minimizando el uso de papel y recursos físicos.

***

## 5. Análisis Financiero

El plan financiero analiza los ingresos y gastos asociados al proyecto desde el punto de vista temporal para detectar situaciones financieramente inadecuadas y estimar el resultado económico de la inversión.

### 5.1. Justificación de la Inversión

#### 5.1.1. Beneficios del Proyecto

**Beneficios tangibles:**


| Beneficio | Descripción | Estimación anual (S/.) |
| :-- | :-- | :--: |
| Reducción de tiempo de documentación de BD | De 30–60 min manual a < 2 min con DBCanvas. 2 diagramas/semana × 28 min ahorrados × 52 semanas × S/. 15/hora | 728.00 |
| Eliminación de herramientas comerciales de diagramado | Alternativa a dbdiagram.io Pro (USD 19/mes ≈ S/. 72/mes) o DbSchema (USD 145 perpetua ≈ S/. 551) | 432.00 |
| Reducción de tiempo de onboarding de nuevos desarrolladores | 1 sesión de onboarding/trimestre ahorrada (2 h × 4 × S/. 15/h) | 120.00 |
| Reducción de incidentes por documentación desactualizada | 2 incidentes/año evitados × 2 h/incidente × S/. 15/h | 60.00 |
| **Total beneficios tangibles anuales** |  | **1,340.00** |

**Beneficios intangibles:**

- **Portafolio técnico diferenciador:** un proyecto publicado en GitHub con monorepo, CI/CD, Electron, Go y TypeScript es un activo de alto valor en el perfil profesional de ambos integrantes.
- **Conocimiento profundo del stack moderno:** implementar parsers de SQL, conectores de BD en Go y una Desktop App con Electron genera competencias técnicas de alta demanda en el mercado laboral.
- **Trabajo en equipo y gestión de proyectos:** la experiencia de coordinar un monorepo con división de responsabilidades entre dos personas desarrolla habilidades de colaboración con control de versiones y CI/CD.
- **Contribución a la comunidad open source:** la herramienta queda disponible para la comunidad internacional, con potencial de generar colaboraciones y oportunidades profesionales futuras.
- **Disponibilidad inmediata de información del schema:** elimina la dependencia de que un DBA o arquitecto senior genere manualmente la documentación de la BD.


#### 5.1.2. Criterios de Inversión

**Parámetros del análisis:**


| Parámetro | Valor |
| :-- | :-- |
| Inversión inicial (I₀) | S/. 4,250.00 |
| Costo de Oportunidad del Capital (COK) | 12% anual |
| Horizonte de evaluación | 3 años |
| Beneficio neto año 1 (1 equipo adopta la herramienta) | S/. 980.00 (S/. 1,340.00 − S/. 360.00 mantenimiento) |
| Beneficio neto año 2 (3 equipos adoptan la herramienta) | S/. 3,660.00 (S/. 4,020.00 − S/. 360.00 mantenimiento) |
| Beneficio neto año 3 (5 equipos adoptan la herramienta) | S/. 6,340.00 (S/. 6,700.00 − S/. 360.00 mantenimiento) |
| Costo de mantenimiento anual | S/. 360.00 (~24 h/año × S/. 15/h para actualizaciones de compatibilidad) |

**Flujo de caja proyectado:**


| Periodo | Beneficio bruto (S/.) | Costo mantenimiento (S/.) | Flujo neto (S/.) |
| :--: | :--: | :--: | :--: |
| Año 0 (inversión inicial) | — | 4,250.00 | **-4,250.00** |
| Año 1 | 1,340.00 | 360.00 | **980.00** |
| Año 2 | 4,020.00 | 360.00 | **3,660.00** |
| Año 3 | 6,700.00 | 360.00 | **6,340.00** |


***

##### 5.1.2.1. Relación Beneficio/Costo (B/C)

Valor presente de los flujos netos positivos durante el horizonte de 3 años:

$$
B_{VP} = \frac{980}{(1.12)^1} + \frac{3{,}660}{(1.12)^2} + \frac{6{,}340}{(1.12)^3}
$$

$$
B_{VP} = 875.00 + 2{,}918.37 + 4{,}511.65 = 8{,}305.02 \text{ S/.}
$$

$$
B/C = \frac{8{,}305.02}{4{,}250.00} = \mathbf{1.95}
$$

> **B/C = 1.95 > 1 → ✅ Se acepta el proyecto.**
> Por cada sol invertido se obtienen S/. 1.95 en beneficios durante el horizonte de 3 años.

***

##### 5.1.2.2. Valor Actual Neto (VAN)

$$
VAN = -4{,}250.00 + \frac{980}{(1.12)^1} + \frac{3{,}660}{(1.12)^2} + \frac{6{,}340}{(1.12)^3}
$$

$$
VAN = -4{,}250.00 + 875.00 + 2{,}918.37 + 4{,}511.65
$$

$$
VAN = \mathbf{S/.\; 4{,}055.02}
$$

> **VAN = S/. 4,055.02 > 0 → ✅ Se acepta el proyecto.**
> El proyecto genera un valor actual neto positivo de S/. 4,055.02 en el horizonte de evaluación de 3 años.

***

##### 5.1.2.3. Tasa Interna de Retorno (TIR)

Se determina la tasa `r` tal que el VAN sea igual a cero:

$$
0 = -4{,}250.00 + \frac{980}{(1+r)^1} + \frac{3{,}660}{(1+r)^2} + \frac{6{,}340}{(1+r)^3}
$$

Por interpolación numérica:


| Tasa | VAN (S/.) |
| :--: | :--: |
| 12% | 4,055.02 |
| 60% | 672.45 |
| 80% | 34.18 |
| 85% | −125.30 |

$$
TIR \approx 81\%
$$

> **TIR = 81% > COK (12%) → ✅ Se acepta el proyecto.**
> La TIR supera ampliamente el costo de oportunidad del 12%, confirmando la alta rentabilidad de la inversión.

***

**Resumen de indicadores financieros:**


| Indicador | Resultado | Criterio de aceptación | Decisión |
| :-- | :--: | :--: | :--: |
| Relación B/C | **1.95** | B/C > 1 | ✅ **Aceptar** |
| Valor Actual Neto (VAN) | **S/. 4,055.02** | VAN > 0 | ✅ **Aceptar** |
| Tasa Interna de Retorno (TIR) | **81%** | TIR > COK (12%) | ✅ **Aceptar** |


***

## 6. Conclusiones

El análisis de factibilidad del proyecto **DBCanvas — Generador de Diagramas de Base de Datos**, desarrollado por Zapana Murillo, Kiara Holly y Vargas Espinoza, Jefferson Alfonso, arroja los siguientes resultados por dimensión:

**Factibilidad Técnica — VIABLE**
El 100% de las tecnologías seleccionadas (Go, React, Electron, mermaid.js, Monaco Editor, pnpm + Turborepo) son de código abierto, gratuitas, maduras y ampliamente documentadas. La arquitectura monorepo en cinco capas con packages compartidos garantiza modularidad, reutilización de código entre Web App y Desktop App, y capacidad de extensión futura sin modificar el código existente.

**Factibilidad Económica — VIABLE**
El costo total del proyecto es de **S/. 4,250.00**, siendo el costo de personal de ambos integrantes (S/. 4,050.00) el rubro dominante, representado como costo de oportunidad del tiempo dedicado. El costo del ambiente es **S/. 0.00** al utilizarse exclusivamente tecnologías de código abierto y GitHub gratuito. La inversión es completamente accesible en el contexto de un proyecto académico de dos personas.

**Factibilidad Operativa — VIABLE**
La herramienta tiene usuarios claramente identificados con una necesidad real no cubierta adecuadamente por las alternativas actuales. Su interfaz visual amigable, la distribución como aplicación de escritorio instalable y la Web App sin instalación garantizan adopción sin fricción técnica. La arquitectura modular facilita el mantenimiento a largo plazo.

**Factibilidad Legal — VIABLE**
Todas las dependencias utilizan licencias compatibles con MIT. La herramienta opera de forma completamente local, sin transmitir datos a servidores externos, cumpliendo con la Ley N° 29733 de Protección de Datos Personales del Perú y el GDPR.

**Factibilidad Social — VIABLE**
El proyecto democratiza el acceso a herramientas de documentación de bases de datos anteriormente reservadas a software comercial costoso, generando valor educativo y de productividad para la comunidad de desarrolladores hispanohablantes y contribuyendo al ecosistema open source.

**Factibilidad Ambiental — VIABLE**
El impacto ambiental directo es mínimo (proceso ligero, sin infraestructura cloud propia). El impacto indirecto es positivo al reducir el consumo energético frente a las alternativas actuales basadas en aplicaciones pesadas o servicios en la nube.

**Análisis Financiero — VIABLE EN LOS TRES INDICADORES**


| Indicador | Resultado | Decisión |
| :-- | :--: | :--: |
| Relación B/C | 1.95 | ✅ Aceptar |
| VAN | S/. 4,055.02 | ✅ Aceptar |
| TIR | 81% | ✅ Aceptar |

**Conclusión general:** el proyecto **DBCanvas — Generador de Diagramas de Base de Datos** es **viable y factible** desde todas las perspectivas analizadas. Los tres indicadores financieros confirman la rentabilidad de la inversión sobre el costo de oportunidad del 12%. Se recomienda proceder con el desarrollo siguiendo el plan de 4 milestones (v0.1 → v1.0) y 38 issues definidos, priorizando los milestones v0.1 (arquitectura base del monorepo) y v0.2 (backend Go + conectores de BD) para garantizar la entrega de valor funcional desde las primeras dos semanas. En caso de restricción de tiempo, la Desktop App Electron puede reducirse a funcionalidad mínima sin comprometer la Web App, que es completamente independiente y entregable desde el milestone v0.3.

***

