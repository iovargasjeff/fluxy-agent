

![C:\Users\EPIS\Documents\upt.png](Aspose.Words.1099c4c5-f857-43c3-9b0f-88e2ff4a9f57.001.png)

**UNIVERSIDAD PRIVADA DE TACNA**

**FACULTAD DE INGENIERÍA**

**Escuela Profesional de Ingeniería de Sistemas**

` `**Proyecto *Generador de datos***

Curso: Base de datos II

Docente: 

Mag. Patrick Cuadros Quiroga



Integrantes:

Calloticona Chambilla, Marymar Danytza (2023076791) 

Ramos Loza, Mariela Estefany (2023077478)




**Tacna – Perú**

***2026***














**Sistema de Generador de datos**

**Versión *1.0***



|CONTROL DE VERSIONES||||||
| :-: | :- | :- | :- | :- | :- |
|Versión|Hecha por|Revisada por|Aprobada por|Fecha|Motivo|
|1\.0|MRL|MCC|SCM|20/08/2020|Versión Original|

**ÍNDICE GENERAL**

[**1. Introducción	4**](#_heading=h.v3s6g6xa6r5y)

[1.1. Propósito	4](#_heading=h.xqrpq021zhg9)

[1.2. Alcance	5](#_heading=h.wgbrjdd46xak)

[1.3. Definiciones, Siglas y Abreviaturas	6](#_heading=h.hf4cc989jx9v)

[1.4. Referencias	6](#_heading=h.a833yrncr3m0)

[1.5. Visión General	7](#_heading=h.mxv705eec67a)

[**2. Posicionamiento	8**](#_heading=h.olxxtd2rv3yu)

[2.1. Oportunidad de negocio	8](#_heading=h.yqcacglb9iie)

[2.2. Definición del problema	8](#_heading=h.fsg6064d47uj)

[**3. Descripción de los interesados y usuarios	9**](#_heading=h.iqcavii3rjbx)

[3.1. Resumen de los interesados	9](#_heading=h.neh9k727sxgu)

[3.2. Resumen de los usuarios	9](#_heading=h.bs4nhqbkcbzc)

[3.3. Entorno de usuario	11](#_heading=h.5t6nqjrx51oq)

[3.4. Perfiles de los interesados	11](#_heading=h.e6121abu4oag)

[3.5. Perfiles de los Usuarios	12](#_heading=h.e7n0rqz9hj7n)

[3.6. Necesidades de los interesados y usuarios	12](#_heading=h.ovy3k78ugd81)

[**4. Vista general del producto	13**](#_heading=h.tbmk3hamsrq)

[4.1. Perspectiva del producto	13](#_heading=h.2svwi4vqr9v2)

[4.2. Resumen de capacidades	14](#_heading=h.hykqdr36f0pt)

[4.3. Suposiciones y dependencias	15](#_heading=h.m5jp62movvd)

[4.4. Costos y precios	15](#_heading=h.qztiddmi8r7e)

[4.5. Licenciamiento e instalación	16](#_heading=h.bozpncqpe2na)

[**5. Características del producto	17**](#_heading=h.y358g8yb2lul)

[**6. Restricciones	17**](#_heading=h.h2un1m6r93qm)

[**7. Rangos de calidad	18**](#_heading=h.pohgx9ey6s9r)

[**8. Precedencia y Prioridad	18**](#_heading=h.zb5y3phvx28q)

[**9. Otros requerimientos del producto	19**](#_heading=h.o0i5d5jnwz2a)

[9.1. Estándares legales	19](#_heading=h.5pwccgk8deiy)

[9.2. Estándares de comunicación	19](#_heading=h.724eq5l9jton)

[9.3. Estándares de cumplimiento de la plataforma	20](#_heading=h.1gu2yz6ugmr0)

[9.4. Estándares de calidad y seguridad	20](#_heading=h.ydqof9g8xfo9)



1. # <a name="_heading=h.v3s6g6xa6r5y"></a>**Introducción**
   En el ámbito del desarrollo de software moderno, una de las tareas más frecuentes y a la vez más tediosas consiste en generar datos de prueba realistas y variados para validar aplicaciones, poblar bases de datos en entornos de desarrollo o ejecutar análisis preliminares. Esta necesidad se intensifica cuando los equipos deben trabajar con múltiples tecnologías de almacenamiento de datos relacionales, documentales, de grafos, columnares o de series temporales cada una con sus propias estructuras y convenciones.

   Ante esta problemática, se plantea el desarrollo del Generador de Datos Sintéticos, una aplicación web de uso general orientada a cualquier persona o equipo que requiera producir datos ficticios pero estructuralmente coherentes con los esquemas propios de distintos motores de bases de datos. La herramienta está especialmente dirigida a desarrolladores de software, analistas de datos y estudiantes de informática, quienes con frecuencia invierten tiempo valioso en la construcción manual de scripts de inserción o en la búsqueda de datasets públicos que no siempre se adaptan a sus necesidades específicas.

   El sistema propuesto aprovecha una arquitectura cliente-servidor moderna: un backend en C# con .NET 8 que implementa patrones de diseño sólidos (Strategy, Orchestrator, inyección de dependencias) y un frontend en Angular que ofrece una experiencia interactiva e intuitiva. Gracias a esta arquitectura, el sistema es extensible, permitiendo agregar soporte para nuevos motores de bases de datos sin afectar el código existente.
   1. ## <a name="_heading=h.xqrpq021zhg9"></a>Propósito
      El propósito principal de este documento es describir la visión del proyecto Generador de Datos Sintéticos, definiendo su alcance, los problemas que resuelve, los usuarios a los que va dirigido y las características clave del producto a desarrollar.

      Desde el punto de vista técnico, el sistema busca automatizar la generación de datos estructurados y coherentes para múltiples tipos de bases de datos, eliminando la necesidad de construir scripts manualmente. Al centralizar esta funcionalidad en una interfaz web accesible, se reduce significativamente el tiempo que los equipos técnicos dedican a tareas repetitivas de preparación de datos, permitiéndoles concentrarse en actividades de mayor valor como el diseño de arquitecturas, la implementación de lógica de negocio o el análisis de resultados.
   1. ## <a name="_heading=h.wgbrjdd46xak"></a>Alcance
      El sistema Generador de Datos Sintéticos contempla las siguientes capacidades en su versión inicial:

- Generación de datos para bases de datos relacionales (SQL Server, PostgreSQL) mediante sentencias INSERT parametrizadas.
- Generación de documentos JSON/BSON para bases de datos documentales (MongoDB, CouchDB).
- Generación de nodos y aristas con propiedades para bases de datos orientadas a grafos (Neo4j, Neptune).
- Generación de series de datos temporales (timestamp + valor) con frecuencia configurable para motores como InfluxDB o TimescaleDB.
- Interfaz web en Angular con formulario dinámico que adapta los campos de entrada según el tipo de base de datos seleccionado.
- API REST en .NET 8 que recibe un esquema de tabla/colección y devuelve los datos generados en formato JSON.

Quedan fuera del alcance de la versión actual:

- Inserción directa de datos en bases de datos reales (conexión directa a servidores de BD).
- Autenticación y gestión de usuarios.
- Almacenamiento persistente de esquemas definidos por el usuario.
  1. ## <a name="_heading=h.hf4cc989jx9v"></a>Definiciones, Siglas y Abreviaturas
- API (Application Programming Interface): Interfaz de programación que permite la comunicación entre el frontend y el backend mediante protocolo HTTP.
- DTO (Data Transfer Object): Objeto utilizado para transferir datos entre capas del sistema sin exponer la lógica de negocio.
- BD: Base de datos.
- SQL: Structured Query Language. Lenguaje estándar para gestión de bases de datos relacionales.
- NoSQL: Término que agrupa tecnologías de bases de datos no relacionales (documentales, de grafos, columnares, clave-valor, etc.).
- JSON: JavaScript Object Notation. Formato ligero de intercambio de datos.
- BSON: Binary JSON. Formato de serialización binaria utilizado por MongoDB.
- REST: Representational State Transfer. Estilo arquitectónico para servicios web.
- SPA: Single Page Application. Tipo de aplicación web que carga una sola página HTML y actualiza el contenido dinámicamente.
- DI: Dependency Injection. Patrón de diseño para gestionar dependencias entre componentes.
- ORM: Object-Relational Mapper. Herramienta que facilita la interacción con bases de datos mediante objetos.
- Dato sintético: Dato generado artificialmente que imita la estructura y el formato de datos reales sin contener información personal o sensible real.
  1. ## <a name="_heading=h.a833yrncr3m0"></a>Referencias
     Las tecnologías y frameworks empleados en el desarrollo del sistema son:

- Microsoft .NET 8 SDK — https://dotnet.microsoft.com
- ASP.NET Core Web API — Documentación oficial de Microsoft.
- Angular Framework (v17+) — https://angular.io
- Entity Framework Core — ORM para .NET utilizado en el contexto de datos (ApplicationDbContext).
- Bogus (NuGet) — Librería de generación de datos falsos para .NET, usada internamente por los generadores.
- Visual Studio Community 2022 — IDE de desarrollo principal.
- Visual Studio Code — Editor auxiliar para el frontend Angular.
- Node.js y npm — Entorno de ejecución y gestor de paquetes para Angular.

No se siguió un estándar técnico específico de documentación. El enfoque es práctico, orientado a resolver la necesidad de generación de datos de prueba de forma eficiente y extensible.
1. ## <a name="_heading=h.mxv705eec67a"></a>Visión General
   El Generador de Datos Sintéticos es una herramienta web de propósito general que simplifica y automatiza la creación de datos de prueba para distintos tipos de bases de datos. El sistema está compuesto por dos módulos principales que se comunican a través de una API REST:

•        Backend (.NET 8 / C#): Implementa la lógica de generación de datos mediante un patrón Strategy, donde cada tipo de base de datos cuenta con su propio generador especializado. Un orquestador central coordina la selección y ejecución del generador adecuado según el esquema recibido.

•        Frontend (Angular): Ofrece una interfaz web interactiva donde el usuario selecciona el tipo de base de datos, define el esquema de campos (nombre, tipo, restricciones) y solicita la generación. Los resultados se muestran en pantalla y pueden exportarse.

La arquitectura garantiza que agregar soporte para un nuevo motor de base de datos requiera únicamente implementar una nueva clase que cumpla la interfaz IDataGeneratorStrategy, sin modificar el código existente, siguiendo el principio Open/Closed de SOLID.
1. # <a name="_heading=h.olxxtd2rv3yu"></a>**Posicionamiento**
   1. ## <a name="_heading=h.yqcacglb9iie"></a>Oportunidad de negocio
      En el ciclo de vida del desarrollo de software, la disponibilidad de datos de prueba es un requisito transversal a múltiples etapas: desarrollo local, pruebas unitarias e integración, demostraciones a clientes, análisis exploratorio de datos y configuración de entornos de staging. Sin embargo, la mayoría de equipos técnicos carece de herramientas dedicadas para esta tarea y recurre a soluciones improvisadas como scripts SQL escritos a mano, datos reales anonimizados (con los riesgos de privacidad que conllevan) o herramientas de pago con licencias costosas.

      Esta brecha representa una oportunidad clara para desarrollar una solución open source, accesible vía web y extensible, que centralice la generación de datos sintéticos para múltiples tecnologías de bases de datos en un único punto de acceso. El Generador de Datos Sintéticos aprovecha esta oportunidad ofreciendo una herramienta gratuita, flexible y con una arquitectura moderna que permite adaptarse a las necesidades específicas de cada equipo de desarrollo.

      Adicionalmente, la creciente adopción de bases de datos NoSQL en la industria (MongoDB, Neo4j, InfluxDB, Cassandra) genera una necesidad adicional: las herramientas existentes suelen estar orientadas únicamente a bases relacionales, dejando desatendidos a equipos que trabajan con tecnologías de nueva generación. El sistema propuesto cubre explícitamente este espacio.
   1. ## <a name="_heading=h.fsg6064d47uj"></a>Definición del problema
      A continuación se presenta la definición estructurada del problema que motiva el desarrollo del sistema:

      |El problema de|La generación manual y repetitiva de datos de prueba para distintos motores de bases de datos, que consume tiempo del equipo técnico, introduce errores humanos y ralentiza los ciclos de desarrollo, pruebas y análisis.|
      | :- | :- |
      |Afecta a|Desarrolladores de software, analistas de datos, equipos de QA y estudiantes de informática que requieren conjuntos de datos realistas para desarrollo, pruebas o aprendizaje.|
      |El impacto asociado es|Retrasos en el ciclo de desarrollo, inconsistencias en los datos de prueba, dificultad para simular escenarios reales y pérdida de productividad del equipo técnico.|
      |Una solución adecuada sería|Una aplicación web que permita configurar esquemas de datos y generar automáticamente registros sintéticos y realistas para múltiples motores de bases de datos (SQL y NoSQL), exportables y listos para usar.|

1. # <a name="_heading=h.iqcavii3rjbx"></a>**Descripción de los interesados y usuarios**
   1. ## <a name="_heading=h.neh9k727sxgu"></a>Resumen de los interesados
      Los interesados del proyecto son aquellas personas o grupos que se ven afectados por el desarrollo o el resultado del sistema, aunque no necesariamente lo utilicen de forma directa:

      |Nombre|Descripción|Responsabilidades|
      | :- | :- | :- |
      |Equipo de desarrollo|Desarrolladores y arquitectos de software que implementan el sistema.|Diseño, desarrollo, pruebas y mantenimiento del sistema.|
      |Usuarios finales|Desarrolladores, analistas y estudiantes que utilizarán la herramienta.|Definir esquemas, generar datos y exportar resultados para sus proyectos.|

1. ## <a name="_heading=h.bs4nhqbkcbzc"></a>Resumen de los usuarios
   Los usuarios directos del sistema son aquellos que interactuarán con la interfaz Angular o consumirán la API REST para generar datos sintéticos:

   |Nombre|Descripción|Responsabilidades|Comentarios|
   | :- | :- | :- | :- |
   |Desarrollador de software|Profesional que construye aplicaciones y necesita datos para pruebas.|Configurar esquemas y generar datasets para entornos de desarrollo.|Usuario principal del sistema.|
   |Analista de datos|Profesional que analiza y procesa grandes volúmenes de datos.|Generar datos para validar pipelines y modelos analíticos.|Usa múltiples tipos de BD.|
   |Estudiante / Investigador|Persona en formación que necesita datos sintéticos para prácticas.|Generar datos para prácticas académicas o proyectos de investigación.|Uso ocasional.|

1. ## <a name="_heading=h.5t6nqjrx51oq"></a>Entorno de usuario
   El sistema está diseñado para operar en un entorno web estándar. Los usuarios acceden a la aplicación desde un navegador moderno (Chrome, Firefox, Edge) en equipos de escritorio o portátiles. No se requiere instalación de software adicional por parte del usuario final.

   El flujo de uso típico es el siguiente:

1. El usuario accede a la interfaz Angular desde su navegador.
1. Selecciona el tipo de base de datos para el que desea generar datos.
1. Define el esquema: nombre de la tabla/colección, campos, tipos de datos y cantidad de registros.
1. Hace clic en "Generar" y el frontend envía la solicitud al backend vía HTTP.
1. El backend procesa el esquema, selecciona el generador adecuado y devuelve los datos en JSON.
1. El usuario visualiza los datos en pantalla y puede copiarlos o exportarlos.

El entorno de desarrollo requiere .NET 8 SDK instalado para el backend, Node.js y Angular CLI para el frontend, y un navegador web moderno para la interfaz.
1. ## <a name="_heading=h.e6121abu4oag"></a>Perfiles de los interesados
   Equipo de desarrollo del proyecto: Responsable del diseño, implementación, pruebas y mantenimiento del sistema. Tiene acceso completo al código fuente y toma decisiones sobre la arquitectura y las tecnologías empleadas.

   Comunidad de desarrolladores y analistas: Usuarios potenciales de la herramienta una vez publicada. Su retroalimentación orienta las mejoras y la incorporación de nuevos generadores en versiones futuras.
1. ## <a name="_heading=h.e7n0rqz9hj7n"></a>Perfiles de los Usuarios
   Desarrollador de software:

   Rol: Usuario principal que genera datos para entornos de desarrollo y pruebas.

   Interacción: Define esquemas de tablas o colecciones, selecciona el motor de BD y solicita la generación.

   Necesidad principal: Obtener rápidamente conjuntos de datos coherentes con el esquema de su aplicación.

   Analista de datos:

   Rol: Usuario que necesita datos para validar pipelines de procesamiento y modelos analíticos.

   Interacción: Genera series temporales, datos columnares o documentos para pruebas de carga o análisis exploratorio.

   Necesidad principal: Datos con distribuciones realistas y estructuras compatibles con sus herramientas de análisis.

   Estudiante / Investigador:

   Rol: Usuario ocasional que necesita datos para prácticas académicas o proyectos de aprendizaje.

   Interacción: Usa la interfaz para generar datos básicos sin necesidad de conocimientos avanzados.

   Necesidad principal: Simplicidad de uso y variedad de tipos de bases de datos disponibles.
1. ## <a name="_heading=h.ovy3k78ugd81"></a>Necesidades de los interesados y usuarios

   |Necesidad|Prioridad|Inquietudes|Solución actual|Solución propuesta|
   | :- | :- | :- | :- | :- |
   |Generar datos para múltiples tipos de BD|Alta|Compatibilidad con diferentes motores|Scripts manuales o herramientas de pago especializadas.|Generadores automáticos para SQL, MongoDB, grafos, series temporales, etc.|
   |Definir esquemas personalizados|Alta|Flexibilidad de tipos de datos|Edición manual de scripts SQL o JSON.|Formulario dinámico en Angular para definir campos, tipos y restricciones.|
   |Exportar datos generados|Media|Formato compatible|Copiar y pegar desde consola o IDE.|Exportación en formato JSON, SQL o CSV desde la interfaz.|

1. # <a name="_heading=h.tbmk3hamsrq"></a>**Vista general del producto**
   El Generador de Datos Sintéticos es una aplicación web cliente-servidor que automatiza la creación de datos ficticios y estructuralmente coherentes para múltiples tipos de bases de datos. El producto está compuesto por dos módulos principales: un backend en C# (.NET 8) que implementa la lógica de generación mediante patrones de diseño sólidos, y un frontend en Angular que proporciona una interfaz web interactiva para la configuración y visualización de los datos generados.

   El sistema no requiere instalación por parte del usuario final, es accesible desde cualquier navegador moderno y está diseñado para ser extensible: agregar soporte para un nuevo motor de base de datos implica únicamente implementar una nueva clase generadora sin modificar el código existente.
   1. ## <a name="_heading=h.2svwi4vqr9v2"></a>Perspectiva del producto
      El Generador de Datos Sintéticos es una solución independiente que no depende de ningún sistema externo para su funcionamiento básico. Opera como una aplicación web de uso general, sin estar integrada a un sistema de gestión empresarial específico.

      La arquitectura del sistema sigue el patrón cliente-servidor clásico:

- El frontend Angular actúa como cliente, proporcionando la interfaz de usuario y enviando solicitudes HTTP al backend.
- El backend ASP.NET Core actúa como servidor, procesando los esquemas recibidos, aplicando la lógica de generación y devolviendo los datos en formato JSON.
- La comunicación se realiza mediante una API REST expuesta por el DataGeneratorController, con el endpoint principal POST /api/DataGenerator/generate.

En versiones futuras, el sistema podrá integrarse con bases de datos reales para insertar directamente los datos generados, utilizando el ApplicationDbContext de Entity Framework para SQL y el MongoDB.Driver para bases documentales.
1. ## <a name="_heading=h.hykqdr36f0pt"></a>Resumen de capacidades

   |Capacidad|Descripción|
   | :- | :- |
   |Generación SQL|Produce sentencias INSERT compatibles con SQL Server y PostgreSQL mediante SqlGenerator.|
   |Generación MongoDB|Crea documentos JSON/BSON listos para insertar en colecciones MongoDB mediante MongoDBGenerator.|
   |Generación de grafos|Genera nodos y aristas con propiedades configurables para bases de datos orientadas a grafos mediante GraphGenerator.|
   |Generación de series temporales|Produce secuencias de pares timestamp-valor configurables en frecuencia y rango mediante TimeSeriesGenerator.|
   |Orquestación dinámica|El GenerationOrchestrator selecciona automáticamente el generador adecuado según el tipo de BD indicado en el esquema.|
   |Formulario dinámico Angular|La interfaz adapta los campos de entrada según el tipo de base de datos seleccionado, guiando al usuario paso a paso.|
   |API REST|El DataGeneratorController expone el endpoint POST /api/DataGenerator/generate para comunicación frontend-backend.|

1. ## <a name="_heading=h.m5jp62movvd"></a>Suposiciones y dependencias
   El correcto funcionamiento del sistema se basa en las siguientes suposiciones y dependencias técnicas:

- Se asume que el entorno de ejecución del backend cuenta con .NET 8 Runtime instalado y que el puerto configurado en launchSettings.json está disponible (por defecto https://localhost:5001).
- Se asume que el entorno de desarrollo del frontend cuenta con Node.js (v18+) y Angular CLI instalados.
- El archivo proxy.conf.json de Angular debe estar correctamente configurado para redirigir las peticiones /api al backend en localhost:5001, evitando problemas de CORS en desarrollo.
- El backend debe tener habilitada la política de CORS para el origen http://localhost:4200 en Program.cs.
- Para la generación de datos con tipos complejos (fechas, UUIDs, emails), el backend puede hacer uso de la librería Bogus (disponible en NuGet), que proporciona datos falsos pero realistas en múltiples idiomas.
- No se requiere conexión a internet para el funcionamiento básico del sistema en el entorno local.
  1. ## <a name="_heading=h.qztiddmi8r7e"></a>Costos y precios
     El proyecto utiliza exclusivamente tecnologías open source y herramientas gratuitas, por lo que el costo de licenciamiento de software es cero. Los únicos costos asociados son los del hardware y la infraestructura necesaria para el desarrollo:

     |Recurso|Tipo|Costo|
     | :- | :- | :- |
     |.NET 8 SDK|Framework backend|Gratuito (open source)|
     |Angular CLI|Framework frontend|Gratuito (open source)|
     |Visual Studio Community 2022|IDE de desarrollo|Gratuito|
     |Visual Studio Code|Editor de código|Gratuito|
     |Equipo de desarrollo (laptop/PC)|Hardware|Costo propio del desarrollador|
     |Conexión a internet|Infraestructura|Costo propio del desarrollador|

1. ## <a name="_heading=h.bozpncqpe2na"></a>Licenciamiento e instalación
   Todas las tecnologías utilizadas en el proyecto son open source o de uso gratuito:

- .NET 8 SDK y ASP.NET Core: Licencia MIT (open source), disponibles en <https://dotnet.microsoft.com>.
- Angular Framework: Licencia MIT (open source), disponible en https://angular.io.
- Visual Studio Community 2022: Gratuito para uso académico y proyectos open source.
- Bogus (librería NuGet): Licencia Apache 2.0 (open source).

Para la instalación del sistema en un entorno local de desarrollo:

- Clonar el repositorio del proyecto.
- Instalar .NET 8 SDK desde https://dotnet.microsoft.com/download.
- En la carpeta BackendAPI, ejecutar: dotnet restore && dotnet build && dotnet run.
- Instalar Node.js (v18+) y Angular CLI: npm install -g @angular/cli.
- En la carpeta FrontendAngular, ejecutar: npm install && ng serve.
- Acceder a http://localhost:4200 desde el navegador.
1. # <a name="_heading=h.y358g8yb2lul"></a>**Características del producto**
- Generación de datos SQL: Produce sentencias INSERT compatibles con SQL Server y PostgreSQL para las tablas definidas por el usuario.
- Generación de documentos NoSQL: Crea documentos JSON/BSON para MongoDB y bases documentales, respetando el esquema de campos configurado.
- Generación de datos para grafos: Genera nodos y aristas con propiedades tipadas para bases de datos orientadas a grafos como Neo4j.
- Generación de series temporales: Produce secuencias de pares timestamp-valor con frecuencia e intervalo configurables para motores como InfluxDB o TimescaleDB.
- Formulario dinámico en Angular: La interfaz adapta los campos de entrada según el tipo de base de datos seleccionado, guiando al usuario de forma intuitiva.
- Orquestación automática: El sistema selecciona internamente el generador adecuado según el tipo de base de datos indicado en el esquema, sin intervención del usuario.
- API REST extensible: El endpoint POST /api/DataGenerator/generate acepta esquemas genéricos y devuelve los datos generados en formato JSON.
- Arquitectura extensible (Open/Closed): Agregar soporte para un nuevo motor requiere únicamente implementar IDataGeneratorStrategy, sin modificar el código existente.
1. # <a name="_heading=h.h2un1m6r93qm"></a>**Restricciones**
- La versión actual no soporta inserción directa en bases de datos reales; los datos se generan y devuelven como texto (JSON/SQL) para ser copiados o importados manualmente.
- No incluye autenticación ni gestión de usuarios; cualquier persona con acceso a la URL puede utilizar el sistema.
- Los tipos de datos soportados en la versión inicial son: string, integer, float, boolean, date/timestamp y UUID. Tipos complejos como objetos anidados profundos o arrays multidimensionales serán incorporados en versiones posteriores.
- El sistema requiere que el backend y el frontend estén ejecutándose en la misma red para comunicarse correctamente en entorno de desarrollo local.
- Los archivos de configuración de TypeScript duplicados (tsconfig.app.dts.json.map, etc.) presentes en la carpeta FrontendAngular son artefactos de compilación que deben ser limpiados antes del despliegue en producción.
- El sistema no almacena esquemas ni datos generados de forma persistente entre sesiones; cada solicitud es independiente.
1. # <a name="_heading=h.pohgx9ey6s9r"></a>**Rangos de calidad**

   |Atributo|Métrica|Valor objetivo|
   | :- | :- | :- |
   |Rendimiento|Tiempo de respuesta del API|< 2 segundos por solicitud de generación|
   |Disponibilidad|Uptime del sistema en producción|≥ 95%|
   |Exactitud|Datos generados conformes al esquema|100% de campos válidos|
   |Extensibilidad|Tiempo para agregar nuevo generador|< 4 horas (por patrón Strategy)|
   |Usabilidad|Pasos para generar primer dataset|≤ 3 pasos en la interfaz|

1. # <a name="_heading=h.zb5y3phvx28q"></a>**Precedencia y Prioridad**

   |Característica|Prioridad|Justificación|
   | :- | :- | :- |
   |Generación SQL y MongoDB|Alta|Son los motores más utilizados por los usuarios objetivo.|
   |Formulario dinámico Angular|Alta|Es el punto de entrada principal del usuario al sistema.|
   |Orquestación por tipo de BD|Alta|Permite escalabilidad sin modificar código existente.|
   |Generación de grafos y series temporales|Media|Amplía el alcance a usuarios más especializados.|
   |Exportación CSV/JSON descargable|Media|Mejora la experiencia pero no bloquea el uso básico.|
   |Persistencia directa en BD|Baja|Funcionalidad futura, no requerida en versión inicial.|

1. # <a name="_heading=h.o0i5d5jnwz2a"></a>**Otros requerimientos del producto**
   1. ## <a name="_heading=h.5pwccgk8deiy"></a>Estándares legales
- El sistema genera exclusivamente datos sintéticos, es decir, datos ficticios que no corresponden a personas reales ni contienen información personal sensible. Por lo tanto:
- No aplica la Ley de Protección de Datos Personales para los datos generados por el sistema, ya que no se procesan ni almacenan datos personales reales.
- El equipo de desarrollo deberá asegurarse de que el código fuente no incluya datos personales reales embebidos (nombres reales, correos reales, etc.) en ningún generador.
- Si en versiones futuras el sistema permite conectarse a bases de datos reales para insertar datos, deberán aplicarse las normativas de protección de datos vigentes.
  1. ## <a name="_heading=h.724eq5l9jton"></a>Estándares de comunicación
- La comunicación entre el frontend Angular y el backend .NET se realiza mediante el protocolo HTTP/HTTPS usando el estándar REST.
- Los datos se intercambian en formato JSON con codificación UTF-8.
- En entorno de desarrollo, el proxy de Angular redirige las peticiones /api al backend en localhost:5001, evitando problemas de CORS.
- En entorno de producción, se deberá configurar HTTPS con un certificado válido y una política de CORS apropiada.
  1. ## <a name="_heading=h.1gu2yz6ugmr0"></a>Estándares de cumplimiento de la plataforma
- Backend: Compatible con sistemas operativos Windows 10+, Linux (Ubuntu 20.04+) y macOS 12+, gracias al soporte multiplataforma de .NET 8.
- Frontend: Compatible con navegadores modernos (Chrome 90+, Firefox 88+, Edge 90+, Safari 14+).
- La API REST sigue las convenciones estándar de HTTP: uso de verbos correctos (GET, POST), códigos de estado apropiados (200, 400, 500) y respuestas JSON.
- El código del backend sigue las convenciones de nomenclatura de C# (PascalCase para clases y métodos, camelCase para variables locales).
- El código del frontend sigue las convenciones de Angular Style Guide oficiales.
  1. ## <a name="_heading=h.ydqof9g8xfo9"></a>Estándares de calidad y seguridad
- El backend valida los datos de entrada (TableSchema) antes de invocar al orquestador, devolviendo un error 400 si el esquema es inválido o incompleto.
- Los generadores están diseñados para no lanzar excepciones no controladas; cualquier error interno se encapsula en la respuesta GeneratedDataResponse.
- Se evita la exposición de rutas o endpoints internos que no sean necesarios para el funcionamiento del frontend.
- En versiones futuras, se implementará autenticación JWT para restringir el acceso a la API en entornos de producción.
- El código fuente debe mantenerse en un repositorio con control de versiones (Git), con commits descriptivos y ramas separadas para desarrollo, pruebas y producción.




