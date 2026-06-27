![C:\Users\EPIS\Documents\upt.png](media/image1.png){width="1.6949004811898514in" height="2.2815977690288713in"}

**UNIVERSIDAD PRIVADA DE TACNA**

**FACULTAD DE INGENIERÍA**

**Escuela Profesional de Ingeniería de Sistemas**

**Generador de Base de datos**

Curso: *Base de datos II*

Docente: Ing. Patrick Cuadros

Integrantes:

**Ramos Loza, Mariela Estefany (2023077478)**

**Calloticona Chambilla, Marymar D. (2023076791)**

**Tacna -- Perú**

***2025***

[Generador de Base de datos]{.mark}

Informe de Factibilidad

Versión *1.0*

| CONTROL DE VERSIONES |           |              |              |            |                  |
|----------------------|-----------|--------------|--------------|------------|------------------|
| Versión              | Hecha por | Revisada por | Aprobada por | Fecha      | Motivo           |
| 1.0                  |           |              |              | 19/08/2025 | Versión Original |

**ÍNDICE GENERAL**

[**1. DESCRIPCIÓN DEL PROYECTO 4**](#descripción-del-proyecto)

> [1.1. NOMBRE DEL PROYECTO 4](#nombre-del-proyecto)
>
> [1.2. DURACIÓN DEL PROYECTO 4](#_7fcpz5jou3o1)
>
> [1.3. OBJETIVOS 4](#objetivos)
>
> [1.3.1. OBJETIVO GENERAL 4](#objetivo-general)
>
> [1.3.2. OBJETIVOS ESPECÍFICOS 5](#objetivos-específicos)

[**2. RIESGOS 6**](#riesgos)

[**3. ANÁLISIS DE LA SITUACIÓN ACTUAL 6**](#análisis-de-la-situación-actual)

> [3.1. PLANTEAMIENTO DEL PROBLEMA 6](#planteamiento-del-problema)
>
> [4. CONSIDERACIONES DE HARDWARE Y SOFTWARE 9](#consideraciones-de-hardware-y-software)
>
> [4.1. Stack Tecnológico Completo 9](#_gf0wxe50v33)

[**5. VIABILIDAD TÉCNICA 12**](#viabilidad-técnica)

> [Medidas de Seguridad Implementadas 17](#_ctv6b0bj9xpt)
>
> [Matriz de Evaluación Técnica 18](#_usp5npg8t7ze)

[**7. ESTUDIO DE FACTIBILIDAD 20**](#_7g4z1c7cd346)

> [7.1. FACTIBILIDAD TÉCNICA 20](#factibilidad-técnica)
>
> [7.2. FACTIBILIDAD ECONÓMICA 20](#factibilidad-económica)
>
> [7.2.1. Definición de Costos 20](#_8ladzq2q055w)
>
> [7.2.2. Costos Generales de desarrollo 20](#_4iynyoinsyjj)
>
> [7.4. FACTIBILIDAD LEGAL 30](#factibilidad-legal)
>
> [7.5. FACTIBILIDAD SOCIAL 31](#factibilidad-social)
>
> [7.6. FACTIBILIDAD AMBIENTAL 32](#factibilidad-ambiental)

[**8. ANÁLISIS FINANCIERO 32**](#análisis-financiero)

> [8.2. JUSTIFICACIÓN DE LA INVERSIÓN 34](#justificación-de-la-inversión)
>
> [8.3. BENEFICIOS DEL PROYECTO 35](#beneficios-del-proyecto)
>
> [Para los Negocios Locales: 35](#_x3whqkfxmaiu)
>
> [Para la Comunidad y Economía Local: 36](#_b5w3h94a9q8)
>
> [8.4. CRITERIOS DE INVERSIÓN 37](#criterios-de-inversión)
>
> [8.4.1. RELACIÓN BENEFICIO/COSTO (B/C) 37](#relación-beneficiocosto-bc)
>
> [B/C \> 1 → el proyecto es muy rentable. 37](#_o1xufleojajt)
>
> [8.4.2. VALOR ACTUAL NETO (VAN) 37](#valor-actual-neto-van-se-ha-calculado-un-van-positivo-considerando-una-tasa-de-descuento-del-12.-esto-indica-que-el-proyecto-generará-valor-por-encima-de-la-rentabilidad-exigida-cubriendo-todos-los-costos-operativos-y-de-capital.)
>
> [8.4.3. TASA INTERNA DE RETORNO (TIR) 38](#tasa-interna-de-retorno-tir)

[**9. CONCLUSIONES 38**](#conclusiones)

# **DESCRIPCIÓN DEL PROYECTO**

## NOMBRE DEL PROYECTO

> [Plataforma Web "Generador de datos\"]{.mark}
>
> DURACIÓN DEL PROYECTO

- **Tiempo total de desarrollo:** 1mes (4 semanas)

| **Fase**                        | **Duración** | **Actividades Clave**                                                     |
|---------------------------------|--------------|---------------------------------------------------------------------------|
| **Análisis y Diseño**           | 3 días       | Levantamiento de requerimientos, diseño de arquitectura, prototipos UI/UX |
| **Diseño del Sistema**          | 4 días       | Modelo de base de datos, API design, sistema de seguridad                 |
| **Desarrollo**                  | 2 semana     | Codificación frontend/backend, integración de APIs, testing unitario      |
| **Pruebas e Integración**       | 3 días       | Testing, corrección de bugs, optimización de performance.                 |
| **Implementación y Despliegue** | 4 días       | Despliegue a producción, configuración de servidores, capacitación        |

## OBJETIVOS

### OBJETIVO GENERAL

> Desarrollar una plataforma web que permita la generación masiva de datos, con la capacidad de persistirlos en múltiples motores de bases de datos (Relacionales, Documentales, Grafos, Key-Value y Series de Tiempo).

### OBJETIVOS ESPECÍFICOS

- Implementar un núcleo de generación en .NET 8/9 capaz de producir datos coherentes (Bogus).

- Desarrollar una interfaz en Angular para la configuración dinámica de esquemas.

- Crear adaptadores específicos para al menos 5 tipos de bases de datos (MySQL, MongoDB, Neo4j, Redis, InfluxDB).

- Garantizar la integridad referencial en entornos SQL y la flexibilidad de esquemas en NoSQL.

# **RIESGOS**

> **Complejidad Técnica:** Dificultad para mapear un mismo set de datos a estructuras tan dispares como Grafos y Tablas.
>
> **Rendimiento:** Latencia en la inserción masiva (Bulk Insert) en motores distribuidos.
>
> **Curva de Aprendizaje:** Necesidad de dominar múltiples drivers y protocolos de conexión en C#.

# **ANÁLISIS DE LA SITUACIÓN ACTUAL**

## PLANTEAMIENTO DEL PROBLEMA

> [En el desarrollo de software actual, las empresas utilizan arquitecturas de microservicios donde conviven múltiples bases de datos. Probar estos sistemas requiere datos realistas, pero generarlos manualmente para cada motor (SQL para usuarios, NoSQL para logs, Grafos para recomendaciones) es costoso, lento y propenso a errores humanos, retrasando los ciclos de QA y DevOps.]{.mark}

## CONSIDERACIONES DE HARDWARE Y SOFTWARE

## Stack Tecnológico Completo

> Frontend: Angular 17+, PrimeNG (para UI de tablas y formularios).
>
> Backend: C# (.NET 8/9), ASP.NET Core Web API.
>
> Librerías Core: Bogus (generación de datos), Automapper.
>
> Persistencia de Configuración: PostgreSQL (para guardar proyectos de generación).
>
> Contenedores: Docker (para levantar instancias de prueba de los diferentes motores).

# **VIABILIDAD TÉCNICA**

> El proyecto es viable dado que el equipo cuenta con experiencia en C# y Angular. El uso del Patrón Estrategia (Strategy Pattern) permite aislar la lógica de cada base de datos, mitigando la complejidad.

- Medidas de Seguridad Implementadas

> Data Masking: Asegurar que los patrones de generación no contengan datos sensibles reales.
>
> Encriptación AES-256: Para el almacenamiento de las cadenas de conexión (Connection Strings) de los usuarios.

| **Factor**             | **Disponibilidad**             | **Calificación (1-5)** |
|------------------------|--------------------------------|------------------------|
| Personal Capacitado    | Alta (Expertos en C#/Angular)  | 5                      |
| Herramientas (IDE/SDK) | Gratuito (VS Code / .NET SDK)  | 5                      |
| Soporte de Terceros    | Alto (Drivers oficiales de DB) | 4                      |

# **Viabilidad Económica y Financiera**

1.  **Definición de costos**

> Se consideran costos de licencias de desarrollo (nulas por uso de Open Source) y costos de infraestructura cloud para el prototipo.

### Costos de Desarrollo  {#costos-de-desarrollo}

> La inversión inicial contempla el despliegue de la infraestructura necesaria para soportar el motor de generación en .NET y el frontend en Angular, así como el capital humano especializado.
>
> Infraestructura de Desarrollo

| **Concepto**                 | **Detalle**                                  | **Costo Mensual** | **Meses** | **Total** |
|------------------------------|----------------------------------------------|-------------------|-----------|-----------|
| Azure App Service            | MongoDB Atlas                                | S/0               | 1         | **S/0**   |
| Azure SQL Database           | Hobby (100GB bandwidth, SSL)                 | S/20              | 1         | **S/20**  |
| MongoDB Atlas                | Free (750h/mes, 512MB RAM)                   | S/0               | 1         | **S/0**   |
| Neo4j AuraDB                 | Instancia Free (Pruebas de adaptador Grafos) | S/0               | 1         | **S/0**   |
| Vercel                       | Hosting para Frontend Angular                | S/0               | 1         | **S/0**   |
| **Dominio .pe**              | Registro anual (aquita.pe)                   | \-                | \-        | **S/110** |
| **SUBTOTAL INFRAESTRUCTURA** |                                              |                   |           | **S/130** |

####  Herramienta de Desarrollo {#herramienta-de-desarrollo .unnumbered}

| **Concepto**              | **Detalle**                                 | **Costo** |
|---------------------------|---------------------------------------------|-----------|
| Visual Studio Community   | IDE para desarrollo C# .NET                 | S/0       |
| DBeaver Community         | Gestión multibase de datos (SQL/NoSQL)      | S/0       |
| Postman / Insomnia        | Pruebas de API Endpoints                    | S/0       |
| Docker Desktop            | Orquestación de contenedores locales        | S/0       |
| Bogus Library             | Generador de datos sintéticos (MIT License) | S/0       |
| GitHub / GitLab           | Repositorio de código y CI/CD               | S/0       |
| **SUBTOTAL HERRAMIENTAS** |                                             | **S/0**   |

####  {#section .unnumbered}

#### Costos Operativos Durante Desarrollo {#costos-operativos-durante-desarrollo .unnumbered}

| **Concepto**                                      | **Costo/mes** | **Meses** | **Total** |
|---------------------------------------------------|---------------|-----------|-----------|
| **Energía eléctrica** (Equipos de desarrollo)     | S/100         | 1         | **S/100** |
| **Internet Fibra Óptica** (200 Mbps)              | S/130         | 1         | **S/130** |
| **Suscripción Copilot/IA (Asistencia de código)** | S/40          | 1         | **S/ 40** |
| **SUBTOTAL OPERATIVO**                            |               |           | **S/270** |

#### Recursos Humanos - Desarrollo {#recursos-humanos---desarrollo .unnumbered}

| **Rol**                           | **Cant.** | **Pago/mes** | **Meses** | **Total**   |
|-----------------------------------|-----------|--------------|-----------|-------------|
| **Desarrollador Full Stack Lead** | 1         | S/1,500      | 1         | **S/1,500** |
| **Desarrollador Full Stack**      | 1         | S/1,000      | 1         | **S/1,000** |
| **SUBTOTAL PERSONAL**             |           |              |           | **S/2,500** |

### INVERSIÓN INICIAL TOTAL: S/2,900 {#inversión-inicial-total-s2900 .unnumbered}

## COSTOS OPERATIVOS  {#costos-operativos}

> Durante los primeros meses, se utiliza el Free Tier de los servicios para validar el producto con usuarios beta, migrando a planes de pago en el último cuatrimestre para soportar el escalado de inserciones de datos.

| **Categoría**             | **Concepto**              | **Detalle de Escalado**          | **Total Anual (M6-12)** |
|---------------------------|---------------------------|----------------------------------|-------------------------|
| **Infraestructura Cloud** | Supabase, Vercel, Render  | Migración de Free a Pro (Mes 9)  | **S/ 792**              |
| **Personal Operativo**    | Dev, CM, Soporte          | 3 roles Part-time                | **S/ 11,200**           |
| **Marketing Digital**     | Ads y Material            | Campañas enfocadas en Tacna/Perú | **S/ 2,200**            |
| **Otros Gastos**          | Servicios y Contingencias | Electricidad e imprevistos       | **S/ 1,550**            |
| **TOTAL OPEX AÑO 1**      |                           |                                  | **S/ 15,742**           |

## FACTIBILIDAD TÉCNICA

> El proyecto presenta una viabilidad técnica Alta. La combinación de .NET 8/9 y Angular 17+ es el estándar de la industria para aplicaciones empresariales robustas.
>
> Capacidad de Integración: C# cuenta con SDKs oficiales y maduros para todos los motores mencionados (SQL Server, MongoDB, Neo4j, InfluxDB).
>
> Escalabilidad: El uso del Pattern Strategy asegura que el núcleo del sistema no se vea afectado al añadir nuevos tipos de bases de datos.
>
> Disponibilidad de Recursos: El uso de bibliotecas como Bogus reduce el tiempo de desarrollo de algoritmos de generación en un 70%.

## FACTIBILIDAD ECONÓMICA

> Basado en los cuadros de inversión previos:
>
> Inversión Inicial: S/ 2,900 (Monto controlado mediante el uso de herramientas Open Source y Free Tiers).
>
> Costo Total Año 1 (CAPEX + OPEX): S/ 18,642.
>
> Sostenibilidad: El modelo de costos escalonados permite que el proyecto crezca orgánicamente conforme aumenta la base de usuarios y la carga de datos.

1.  **FACTIBILIDAD OPERATIVA**

> La plataforma está diseñada para ser autoservicio. Un desarrollador o analista de QA puede configurar un esquema de datos en menos de 10 minutos a través de la interfaz de Angular. No se requiere personal técnico especializado para operar la herramienta una vez desplegada, lo que garantiza una adopción rápida en equipos de desarrollo locales.

## FACTIBILIDAD LEGAL

> Privacidad: Al generar datos sintéticos, el proyecto elimina el riesgo legal de manejar datos personales reales (evitando infracciones a la Ley de Protección de Datos Personales de Perú).
>
> Licenciamiento: El stack tecnológico utilizado posee licencias MIT y Apache 2.0, lo que permite el uso comercial sin regalías.

## FACTIBILIDAD SOCIAL

> El proyecto impacta positivamente en la comunidad tecnológica de Tacna y el Perú, facilitando el acceso a herramientas de nivel profesional para estudiantes y pequeñas empresas que no pueden costear licencias internacionales de generadores de datos costosos (como Redgate o Mockaroo Enterprise).

## FACTIBILIDAD AMBIENTAL

> El desarrollo bajo .NET Core permite una alta eficiencia en el uso de memoria y CPU, lo que se traduce en un menor consumo energético en los servidores de la nube (Green IT).

# ANÁLISIS FINANCIERO

## JUSTIFICACIÓN DE LA INVERSIÓN

> La inversión de S/ 2,900 se justifica al comparar el costo de desarrollo contra el costo de oportunidad. Un equipo de 3 desarrolladores ahorra un promedio de 15 horas mensuales en creación de datos de prueba; a un costo de S/ 25/hora, el ahorro operativo anual por empresa usuaria supera los S/ 4,500, recuperando la inversión en menos de un año.

## BENEFICIOS DEL PROYECTO

> Reducción del Time-to-Market: Pruebas de software más rápidas.
>
> Calidad del Software: Detección temprana de errores al probar con volúmenes reales de datos.
>
> Versatilidad: Un solo software sirve para infraestructuras SQL, NoSQL y Grafos.

## CRITERIOS DE INVERSIÓN

### RELACIÓN BENEFICIO/COSTO (B/C)

> Considerando los ahorros proyectados y el potencial de comercialización como SaaS:
>
> B/C = 1.45. Por cada sol invertido, se obtiene un retorno de 0.45 céntimos adicionales en el primer ciclo operativo.

### VALOR ACTUAL NETO (VAN) Se ha calculado un VAN Positivo (considerando una tasa de descuento del 12%). Esto indica que el proyecto generará valor por encima de la rentabilidad exigida, cubriendo todos los costos operativos y de capital. {#valor-actual-neto-van-se-ha-calculado-un-van-positivo-considerando-una-tasa-de-descuento-del-12.-esto-indica-que-el-proyecto-generará-valor-por-encima-de-la-rentabilidad-exigida-cubriendo-todos-los-costos-operativos-y-de-capital.}

> VAN Positivo por lo tanto el proyecto es rentable

### TASA INTERNA DE RETORNO (TIR)

> La TIR proyectada es del 24%, lo cual supera ampliamente la tasa de interés de mercado para proyectos tecnológicos de riesgo moderado, confirmando la rentabilidad del proyecto.

# **CONCLUSIONES**

> Viabilidad Integral: El proyecto es técnica y financieramente sólido. La inversión inicial es baja gracias a la optimización de recursos y el uso de software libre.
>
> Innovación Políglota: A diferencia de competidores, el soporte para los distintos tipos de bases de datos (especialmente Grafos y Series de Tiempo) nos otorga una ventaja competitiva única en el mercado local.
>
> Impacto Legal y Seguro: La herramienta se posiciona como una solución definitiva para el cumplimiento normativo de privacidad de datos en empresas peruanas.
>
> Recomendación: Se recomienda proceder con la fase de Codificación del Core en C# (Issue \#05) de inmediato, aprovechando el bajo costo de los Free Tiers configurados.
