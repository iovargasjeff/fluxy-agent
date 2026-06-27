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
<div style="page-break-after: always; visibility: hidden">\pagebreak</div>

## 10. Complemento de Visión según Plantilla de Referencia

El documento de referencia FD02 detalla interesados, perfiles de usuarios, necesidades, capacidades, costos, licenciamiento y estándares. Para completar la visión de FluxSQL se agregan las siguientes matrices.

### 10.1 Definiciones, siglas y abreviaturas ampliadas

| Término / sigla | Definición |
| :-- | :-- |
| ERD | Diagrama entidad-relación que representa tablas, campos, llaves y relaciones. |
| DDL | Lenguaje de definición de datos usado para crear estructuras de base de datos. |
| SchemaModel | Modelo intermedio usado por FluxSQL para desacoplar entradas de diagramación. |
| Parser | Componente que transforma SQL, JSON o modelos NoSQL en nodos y relaciones. |
| Snapshot | Versión guardada del diagrama y del SQL asociado para historial/restauración. |
| Tauri | Contenedor nativo usado por la variante Desktop. |
| Supabase | Plataforma usada para autenticación y persistencia de la variante Web. |

### 10.2 Resumen de interesados

| Interesado | Descripción | Necesidad principal |
| :-- | :-- | :-- |
| Docente del curso | Evalúa evidencia, avance, documentación y funcionamiento del proyecto. | Revisar trazabilidad, commits, arquitectura y entregables FD. |
| Equipo desarrollador | Jefferson Vargas y Kiara Zapana como responsables de implementación/documentación. | Mantener Web/Desktop sincronizados y desplegables. |
| Estudiantes usuarios | Usuarios que necesitan entender y documentar modelos de BD. | Generar diagramas desde SQL o conexiones reales. |
| Revisores académicos | Personas que revisan documentos FD01-FD05. | Encontrar estructura formal, diagramas y matrices de requerimientos. |
| Usuarios técnicos | Desarrolladores que documentan proyectos propios. | Exportar diagramas y compartirlos. |

### 10.3 Perfiles de usuario

| Perfil | Objetivo | Responsabilidades | Restricciones |
| :-- | :-- | :-- | :-- |
| Administrador Web | Gestionar proyectos, diagramas, invitaciones y versiones. | Crear proyectos, compartir enlaces, restaurar versiones. | Requiere autenticación. |
| Colaborador | Editar o visualizar diagramas compartidos. | Revisar cambios, aportar al modelo, consultar historial. | Permisos según rol `editor` o `viewer`. |
| Visitante público | Ver un diagrama compartido por enlace. | Consultar el diagrama en modo lectura. | No accede a datos privados ni dashboard. |
| Usuario Desktop | Conectar bases locales y generar diagramas sin subir credenciales. | Configurar conexión, inspeccionar esquema, exportar resultados. | Debe ejecutar la app localmente. |

### 10.4 Necesidades de interesados y usuarios

| Necesidad | Prioridad | Preocupación | Solución actual | Solución propuesta |
| :-- | :--: | :-- | :-- | :-- |
| Evidencia académica clara | Alta | Historial disperso en forks/repos | Revisar varios repositorios | Consolidación en UPT + fork `iovargasjeff/fluxsql` |
| Diagramación rápida | Alta | Crear ERD manualmente consume tiempo | Draw.io, capturas o diagramas manuales | Parser SQL/NoSQL + canvas React Flow |
| Colaboración | Media | Compartir capturas no permite edición | Envío de archivos | Proyectos, invitaciones y enlaces públicos |
| Privacidad en conexiones reales | Alta | No conviene subir credenciales a la nube | Configuración manual local | Variante Desktop con backend local |
| Despliegue flexible | Alta | Vercel en organización puede bloquear | Deploy directo desde org | Fork personal conectado a Vercel |

### 10.5 Capacidades y beneficios

| Beneficio para el usuario | Característica que lo soporta |
| :-- | :-- |
| Menos tiempo documentando BD | Parser SQL, MongoDB, Neo4j y exportación visual |
| Mejor evidencia para sustentación | Commits preservados, FD actualizados y diagramas Mermaid |
| Trabajo colaborativo | Invitaciones, roles y vista pública |
| Independencia de herramientas comerciales | Stack open source y despliegue en planes gratuitos |
| Mayor seguridad en Desktop | Sidecar local y credenciales fuera del repositorio |

### 10.6 Estándares aplicables

| Estándar / criterio | Aplicación en FluxSQL |
| :-- | :-- |
| GitFlow simplificado | `main` estable, `desktop` para variante local y PRs desde fork personal. |
| Markdown académico | FD01-FD05 en `.md` con tablas, diagramas Mermaid y trazabilidad. |
| OWASP básico | No subir `.env`, usar variables de entorno y controlar accesos. |
| SQL estándar | Entrada DDL para PostgreSQL, MySQL y SQL Server. |
| UML/Mermaid | Diagramas de caso de uso, componentes, secuencia y despliegue representables en Markdown. |

| CONTROL DE VERSIONES | | | | | |
| :-: | :- | :- | :- | :- | :- |
| Versión | Hecha por | Revisada por | Aprobada por | Fecha | Motivo |
| 1.0 | KHZM / JAVE | | | Marzo 2026 | Versión Original basada en FD01 |
| 1.1 | KHZM / JAVE | | | Junio 2026 | Actualización de visión Web/Desktop |

<br><br><br><br><br><br><br><br><br>

**Sistema *DBCanvas — Database Diagram Generator***

**Documento de Visión**

**Versión *1.0***

<div style="page-break-after: always; visibility: hidden">\pagebreak</div>

## Nota de Actualización - Junio 2026

La visión del producto se actualiza para reflejar la consolidación final del repositorio oficial. La rama `main` representa la **Web App** colaborativa de FluxSQL, mientras que la rama `desktop` representa la **Desktop App** local. Ambas variantes mantienen el mismo propósito de producto: generar diagramas de base de datos a partir de esquemas, scripts SQL o conexiones reales. Las referencias a la arquitectura preliminar se conservan como trazabilidad de planificación.

**ÍNDICE GENERAL**
#
[1. Introducción](#_Toc1)
1.1 Propósito
1.2 Alcance
1.3 Definiciones, Siglas y Abreviaturas
1.4 Referencias
1.5 Visión General

[2. Posicionamiento](#_Toc2)
2.1 Oportunidad de negocio
2.2 Definición del problema

[3. Descripción de los interesados y usuarios](#_Toc3)
3.1 Resumen de los interesados
3.2 Resumen de los usuarios
3.3 Entorno de usuario
3.4 Perfiles de los interesados
3.5 Perfiles de los Usuarios
3.6 Necesidades de los interesados y usuarios

[4. Vista General del Producto](#_Toc4)
4.1 Perspectiva del producto
4.2 Resumen de capacidades
4.3 Suposiciones y dependencias
4.4 Costos y precios
4.5 Licenciamiento e instalación

[5. Características del producto](#_Toc5)

[6. Restricciones](#_Toc6)

[7. Rangos de calidad](#_Toc7)

[8. Precedencia y Prioridad](#_Toc8)

[9. Otros requerimientos del producto](#_Toc9)

[CONCLUSIONES](#_Toc10)

[RECOMENDACIONES](#_Toc11)

[BIBLIOGRAFÍA](#_Toc12)

[WEBGRAFÍA](#_Toc13)

<div style="page-break-after: always; visibility: hidden">\pagebreak</div>

**<u>Informe de Visión</u>**

## 1. <span id="_Toc1" class="anchor"></span>**Introducción**

### 1.1 Propósito
El propósito del presente Documento de Visión es definir claramente las necesidades, características y objetivos del proyecto **DBCanvas — Generador de Diagramas de Base de Datos**. Este documento está orientado a alinear la comprensión del sistema entre los desarrolladores, el docente asesor y los usuarios finales, proporcionando una visión a alto nivel de los problemas que soluciona y de qué forma la herramienta agrega valor respecto a las alternativas del mercado.

### 1.2 Alcance
**DBCanvas** desarrollará una solución integral de tipo web y escritorio. El alcance incluye:
- Una **Web App** (React) que interpreta SQL DDL y esquemas JSON en tiempo real sin backend para visualizar diagramas de entidad-relación (ERD).
- Una **App de Escritorio** (Electron + Go) capaz de crear conexiones directas a motores de base de datos como PostgreSQL, MySQL, SQLite y MongoDB para inferir su esquema en tiempo real y mostrar el ERD directamente desde la base de datos de producción.
El alcance **excluye** la modificación o diseño visual bidireccional (actualización de la BD a partir de cambios gráficos del diagrama o Forward Engineering) y servicios de alojamiento en nube (Cloud/Database hosting).

### 1.3 Definiciones, Siglas y Abreviaturas
- **ERD:** Diagrama Entidad-Relación. Representación abstracta del esquema conceptual de bases de datos.
- **SQL DDL:** Data Definition Language, instrucciones SQL usadas para definir estructuras de datos (CREATE, ALTER).
- **SPA:** Single Page Application (Aplicación de Página Única).
- **Monorepo:** Repositorio único de control de versiones que almacena el código de múltiples proyectos o paquetes.
- **IPC:** Inter-Process Communication.
- **CI/CD:** Integración Continua y Despliegue Continuo.

### 1.4 Referencias
- *FD01 - Informe de Factibilidad de DBCanvas* (Versión 1.0)
- Documentación oficial de Mermaid.js
- Estándar de desarrollo web React/Vite/Go

### 1.5 Visión General
El documento comienza con el análisis y posicionamiento, identificando la oportunidad para un generador de esquemas automático sin envío de datos al exterior. A continuación, describe detalladamente los tipos de usuarios. Luego, resume las capacidades y características centrales que hacen que el producto sea innovador y útil, estableciendo las restricciones, prioridades y requisitos legales que deben respetarse, como la protección de datos y el licenciamiento.

<div style="page-break-after: always; visibility: hidden">\pagebreak</div>

## 2. <span id="_Toc2" class="anchor"></span>**Posicionamiento**

### 2.1 Oportunidad de negocio
Actualmente crear diagramas ERD es una labor fragmentada. Las herramientas potentes que se conectan directamente a bases de datos y permiten visualizar sus relaciones son corporativas, muy costosas y extremadamente pesadas, orientadas fundamentalmente a Database Administrators. Por el contrario, las herramientas web ligeras carecen de capacidades de conectividad en tiempo real o en su defecto obligan al usuario a cargar sus esquemas privados de bases de datos a servidores de terceros, lo cual representa una brecha de seguridad.
La oportunidad radica en proveer una herramienta "Zero Config" en local, ligera y de código abierto que reduzca de minutos a segundos el levantamiento de documentación base en el ciclo de desarrollo.

### 2.2 Definición del problema
| El problema de | la documentación de esquemas y diagramas ERD de bases de datos de forma tradicional (inaccesible, desactualizada o que compromete la privacidad). |
| :--- | :--- |
| **Afecta a** | Desarrolladores de software, arquitectos, estudiantes e ingenieros de datos. |
| **El impacto de este problema es** | Dificulta el _onboarding_ de nuevos desarrolladores en los proyectos (añade deuda técnica), obliga a usar software comercial de cientos de dólares, o exponer esquemas privados en herramientas web de terceros. |
| **Una solución exitosa sería** | Una herramienta única, instalable o usable vía web, que opere 100% de manera local, extraiga eficientemente los diagramas y no interfiera con datos sensibles. |

<div style="page-break-after: always; visibility: hidden">\pagebreak</div>

## 3. <span id="_Toc3" class="anchor"></span>**Descripción de los interesados y usuarios**

### 3.1 Resumen de los interesados
| Nombre | Descripción | Responsabilidades |
| :--- | :--- | :--- |
| **Equipo de Desarrollo** | Kiara Zapana y Jefferson Vargas | Desarrollar, integrar el backend Go con el frontend React/Electron. |
| **Docente Asesor** | Mag. Patrick Cuadros Quiroga | Validar la arquitectura, garantizar el seguimiento metodológico del proyecto y asegurar la calidad técnica en la entrega. |

### 3.2 Resumen de los usuarios
| Nombre | Descripción |
| :--- | :--- |
| **Desarrollador de Software** | Persona que implementa código y necesita conocer qué forma tiene la base de datos para crear consultas efectivas. |
| **Arquitecto de Software** | Responsable de analizar la estructura de los datos del sistema para plantear ampliaciones y diseñar la evolución del producto. |
| **Estudiantes/Docentes** | Integrantes del entorno educativo que utilicen la herramienta para agilizar la comprensión de base de datos. |

### 3.3 Entorno de usuario
El usuario no requiere infraestructura en nube. Puede acceder de dos formas directas desde cualquier ambiente doméstico u oficina corporativa:
- **Navegador web:** Accediendo a la Web App a través de un navegador para renderizado al vuelo de scripts SQL.
- **Entorno Nativo:** Instalando la app en escritorio bajo Windows 10+, macOS 11+, o Ubuntu 20.04+. 

### 3.4 Perfiles de los interesados
*   **Desarrolladores/Propietarios (KIARA/JEFFERSON):** Estudiantes universitarios de la UPT enfocados en lograr un producto funcional y optimizado que satisfaga los hitos del curso (Base de Datos II).

### 3.5 Perfiles de los Usuarios
*   **Perfil Técnico Medio/Alto:** Entusiasta o profesional informático que conoce de la interacción básica de bases de datos, que no tiene tiempo o presupuesto para grandes infraestructuras. Considera vital la privacidad de su esquema local y requiere fluidez en la exportación (SVG/PNG/Mermaid) para insertarlo en sus READMEs.

### 3.6 Necesidades de los interesados y usuarios
| Necesidad | Prioridad | Solución Actual | Solución Propuesta (DBCanvas) |
| :--- | :---: | :--- | :--- |
| Conexión sencilla | Alta | Descargar clientes pesados como DataGrip o PGAdmin | Backend embebido con interfaz minimalista. |
| Interpretar sintaxis SQL a la vista | Alta | dbdiagram.io (riesgo de nube pública) | Parser en cliente en tiempo real que convierte DDL a diagrama ERD local. |
| Exportar diagramas para documentación | Alta | Capturas de pantalla o reportes propietarios | Exportación de formatos estándares SVG/PNG y texto `.mmd`. |

<div style="page-break-after: always; visibility: hidden">\pagebreak</div>

## 4. <span id="_Toc4" class="anchor"></span>**Vista General del Producto**

### 4.1 Perspectiva del producto
DBCanvas es un sistema diseñado localmente como un componente desacoplado e independiente de cualquier servicio cloud, basado en una arquitectura monorepo. Desde la interfaz gráfica en React o Electron, el usuario provee sus credenciales o su script; en caso de credenciales, el backend en Go (corriendo invisiblemente en localhost o en background con Electron) se ocupa de obtener internamente el `schema_information` para ser renderizado sin un intermediario o red exterior de servidor.

### 4.2 Resumen de capacidades
| Capacidad | Descripción |
| :--- | :--- |
| **Conectividad Múltiple** | Se conecta directamente vía Go-Drivers a PostgreSQL, MySQL, SQLite y MongoDB para inferir esquemas en tiempo real. |
| **Parser a memoria (Client-side)** | Ejecución TypeScript pura en Web App para analizar DDL y JSON Schema en vivo (debounce de 300ms). |
| **Renderizado e Interacción** | Diagrama ERD visual interactivo con librería de referencias (Mermaid), capacidades de zoom y paneo. |
| **Exportación Un Clic** | Salida del resultado estético a PNG, SVG, sentencias formateadas SQL o código Mermaid. |

### 4.3 Suposiciones y dependencias
- **Suposición 1:** El usuario posee permisos de red y acceso a las credenciales válidas de la base de datos a la cual quiere conectarse.
- **Suposición 2:** Si el usuario utiliza MongoDB, sus colecciones poseen un grado razonable de homogeneidad para que el algoritmo de inferencia probabilística extraiga un esquema significativo.
- **Dependencia:** El producto requerirá de las últimas versiones modernas de navegadores web que soporten ES Modules; así como un hardware mínimo (512MB RAM en Web y aprox 200MB en Desktop).

### 4.4 Costos y precios
DBCanvas mantiene una filosofía libre y sin dependencias comerciales. Su adquisición, distribución, desarrollo de empaquetado y la operación a nivel de software por parte del usuario final es completamente **gratuita** ($0). Su rentabilidad financiera de viabilidad radica en el ahorro de horas/hombre frente a opciones de costo mensual en dólares.

### 4.5 Licenciamiento e instalación
El producto se liberará a través de repositorios públicos bajo licencia de código abierto **MIT**. 
La instalación de su App de Escritorio se proporcionará con instaladores precompilados de ejecución fluida: `.exe` para Windows, `.dmg` para MacOS y `.AppImage` para Linux, sin que el usuario esté obligado a instalar Go ni NodeJS en su respectivo sistema operativo.

<div style="page-break-after: always; visibility: hidden">\pagebreak</div>

## 5. <span id="_Toc5" class="anchor"></span>**Características del producto**

1. **Auto-descubrimiento en tiempo real:**
   Lectura de *Information Schema* para bases SQL y de análisis de muestreo de documentos (*Aggregations*) en MongoDB para generar representaciones visuales automáticas. Emplea un diseño asíncrono para no colgar la interfaz (UI Response continua). En milisegundos se pueden visualizar cientos de tablas.
   
2. **Interpretador DDL Offline (Browser):**
   El usuario puede pegar un volcado de miles de líneas usando sentencias complejas de CREATE TABLE. El monorepo analiza los AST (Abstract Syntax Trees) garantizando la privacidad de los datos bajo el paradigma *Client-Side Execution*.
   
3. **Selector modular y plantillas visuales:**
   Posibilita filtrar interactivamente qué tablas o relaciones proyectar con el componente `TableSelector`, así como la estilización y aplicación de 6 galerías de plantillas en la exportación para los reportes de usuario.

<div style="page-break-after: always; visibility: hidden">\pagebreak</div>

## 6. <span id="_Toc6" class="anchor"></span>**Restricciones**

- **Restricción Operativa (Scope):** Por las limitantes de estimación de esfuerzo en tiempo a lo largo de 30 días con dos personas, no se abarcará más que las 4 bases de datos dictaminadas, dejando Oracles, SQL Server o Cassandra para un alcance futuro.
- **Restricción de Flujo de Tareas:** El producto funciona de manera jerárquica Data \-\> Visión. No permite acciones estructurales en el camino contrario (visión \-\> persistir datos alterados).
- **Restricciones de Hardware/Compatibilidad:** El generador Mermaid está vinculado a cambios imprevistos en versiones, y su renderizado pesado con tablas gigantes (>500 tablas) puede experimentar caídas de FPS que restrinjan su operatividad si se visualizan simultáneamente en un equipo pobre en CPU/RAM.

<div style="page-break-after: always; visibility: hidden">\pagebreak</div>

## 7. <span id="_Toc7" class="anchor"></span>**Rangos de Calidad**

- **Desempeño y velocidad de respuesta:** El sistema web y desktop tiene una latencia esperada de *debounce* de \~300 a 500 ms al parsear manual. 
- **Fiabilidad en Parser TypeScript:** Se garantiza tolerancia de variantes de código DDL (como PK Inline vs Constraint) y fallas predecibles: ninguna falla en el sintagma del SQL debe hacer *crashear* la aplicación, debiendo emitir errores controlados visuales.
- **Seguridad en Integridad de Credenciales:** Absoluta inexistencia de rastros de texto plano en los Logs para las claves de bases de datos de producción; la información en local storage retiene explícitamente solo parámetros `host` y `database name`.

<div style="page-break-after: always; visibility: hidden">\pagebreak</div>

## 8. <span id="_Toc8" class="anchor"></span>**Precedencia y Prioridad**

El desarrollo atiende directamente a 4 Milestones críticos con dependencia secuencial técnica:
- **Prioridad 1 (Base - v0.1):** Despliegue del Monorepo con Turborepo, Pnpm, UI de diseño y Actions, conformando el esqueleto de intercambio técnico.
- **Prioridad 2 (Backend Core - v0.2):** Habilitar los Drivers en lenguaje Go (endpoints, algoritmos de inferencias para MongoDB, SQL) posibilitando que el back pueda operar autónomamente.
- **Prioridad 3 (Web View - v0.3):** Consumo del API, Monaco Editor del frontend, Parser de AST en TypeScript de los DDL. En este punto la Web App es 100% utilitaria libremente sin el empaquetado. 
- **Prioridad 4 (Runtime Nativo - v1.0):** Agregación del motor del frontend + motor Go en un IPC vía NodeJS Child_Process embebiéndolas dentro de la capa Electron y compilado a binarios.

<div style="page-break-after: always; visibility: hidden">\pagebreak</div>

## 9. <span id="_Toc9" class="anchor"></span>**Otros requerimientos del producto**

**a) Estándares Legales**
Se prioriza de manera activa el cumplimiento del GDPR y **Ley N° 29733 de Protección de Datos Personales del Perú**. Dado el manejo de información de arquitecturas potencialmente patentadas, la herramienta garantiza que de forma física o en caché persistente no sale NADA de lo evaluado y renderizado desde el software DBCanvas fuera del ordenador local.

**b) Estándares de comunicación**
Se utilizarán contratos API JSON rígidos con interfaces bien documentadas (`docs/api-contract.md`) para el intercambio entre las peticiones TypeScript cliente y respuesta de JSON del binario de Go con manejo estándar en código de status HTTP REST (200, 400, 500).

**c) Estándares de calidad y seguridad (Testing y Deploy)**
El desarrollo se acompaña de políticas de Testing exhaustivos usando `Vitest` (Pruebas unitarias de las transformaciones de código texto al parser Mermaid ERD) y de E2E a nivel visual (flujos correctos) usando `Playwright`.

<div style="page-break-after: always; visibility: hidden">\pagebreak</div>

<span id="_Toc10" class="anchor"></span>**CONCLUSIONES**

El sistema integral de generación de diagramas **DBCanvas** ofrece a los usuarios una alternativa que conjuga dos factores escasos en este ámbito: flexibilidad en origen (texto SQL o conexión viva local) con confidencialidad absoluta mediante ejecución autónoma del navegador o escritorio. Basado en su posicionamiento claro como software educativo y herramienta pragmática con arquitecturas punteras (Monorepo Go, Electron, React+Vite), el proyecto evidencia una innegable modernidad y soluciona eficazmente una dependencia constante hacia herramientas corporativas masivas.

<div style="page-break-after: always; visibility: hidden">\pagebreak</div>

<span id="_Toc11" class="anchor"></span>**RECOMENDACIONES**

1. Mantener un control de la compatibilidad frente a las dependencias de **Mermaid.js**, dado que es el núcleo visual del proyecto; fijar sus versiones en el `package.json` para evitar rupturas prematuras.
2. Seguir las recomendaciones metodológicas y pautadas del avance (Milestones) como prioridad para no interrumpir el testeo continuo del Backend (Go) antes de adosar Electron.
3. Para implementaciones futuras que queden fuera del *Scope* de v1.0, documentar un buen sistema para que la comunidad amplíe nativamente los `Connectors` visuales de bases de datos que no logren ser implementados.

<div style="page-break-after: always; visibility: hidden">\pagebreak</div>

<span id="_Toc12" class="anchor"></span>**BIBLIOGRAFÍA**

- Cuadros Quiroga, Patrick. (2026). *Material del Curso de Base de Datos II*. Universidad Privada de Tacna.
- Documento: *FD01_Informe_Factibilidad_DBCanvas_v1*. Zapana, K. & Vargas, J. (Marzo 2026).

<div style="page-break-after: always; visibility: hidden">\pagebreak</div>

<span id="_Toc13" class="anchor"></span>**WEBGRAFÍA**

- Go Standard Library Documentation. (2026). "net/http". *The Go Programming Language*. [Online].
- Electron JS. (2026). "Building a Cross Platform Desktop App". *Electron*. [Online].
- React. (2026). "Official Documentation React". *React*. [Online].
- Mermaid. (2026). "Entity Relationship Diagrams". *Mermaid.js*. [Online].

<div style="page-break-after: always; visibility: hidden">\pagebreak</div>
