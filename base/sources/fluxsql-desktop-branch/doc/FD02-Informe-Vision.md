# FD02 - Informe de Vision de Producto

<center>

![logo UPT](./media/logo-upt.png)

**UNIVERSIDAD PRIVADA DE TACNA**  
**FACULTAD DE INGENIERIA**  
**Escuela Profesional de Ingenieria de Sistemas**

**FluxSQL Desktop - Vision de Producto**

Integrantes: Kiara Zapana Murillo y Jefferson Vargas Espinoza  
Tacna - Peru, 2026

</center>

## Control de versiones

| Version | Hecha por | Fecha | Motivo |
| :-- | :-- | :-- | :-- |
| 1.0 | KHZM / JAVE | Junio 2026 | Vision especifica para la rama `desktop` |

## 1. Proposito

Definir la vision de FluxSQL Desktop como una herramienta local para inspeccionar bases de datos, generar diagramas, producir datos y analizar consultas desde una aplicacion de escritorio.

## 2. Alcance

FluxSQL Desktop cubre:

- Conexion local a motores de base de datos.
- Inspeccion de esquemas reales.
- Generacion de diagramas a partir de estructuras existentes.
- Generacion de datos de prueba.
- Analisis de consultas.
- Empaquetado como instalador Windows.

No busca reemplazar un gestor completo de bases de datos ni ejecutar administracion avanzada de servidores.

## 3. Oportunidad

En cursos de bases de datos y proyectos de software, los equipos necesitan evidenciar la estructura de sus bases de datos. Una herramienta desktop reduce dependencia de servicios externos y facilita trabajar con bases locales o privadas.

## 4. Usuarios objetivo

| Usuario | Necesidad |
| :-- | :-- |
| Estudiante de Base de Datos | Generar diagramas para informes y sustentaciones |
| Docente | Revisar estructuras de proyectos sin configurar servicios cloud |
| Desarrollador | Inspeccionar una base local y documentarla rapidamente |
| Equipo academico | Mantener evidencia reproducible del proyecto |

## 5. Capacidades del producto

| Capacidad | Descripcion |
| :-- | :-- |
| Conexion local | Permite configurar conexiones a motores soportados |
| Inspeccion de esquema | Extrae tablas, colecciones, relaciones o metadatos |
| Diagramacion | Renderiza representaciones visuales del esquema |
| Analisis de consultas | Evalua consultas y muestra metricas o recomendaciones |
| Generacion de datos | Produce datos de prueba segun el esquema |
| Instalador | Entrega una app instalable sin depender de Node.js, pnpm ni Python en el equipo final |

## 6. Arquitectura de producto

```text
Usuario
  -> Tauri Desktop Shell
  -> Frontend Next.js estatico
  -> Backend FastAPI local
  -> Conectores / Analizador / Generador
  -> Bases de datos del usuario
```

## 7. Criterios de exito

- La app instalada abre sin requerir entorno de desarrollo.
- El backend local inicia y termina junto con Tauri.
- Se puede conectar al menos una base local y generar un diagrama.
- La documentacion de la rama `desktop` explica instalacion, arquitectura y pruebas.

## 8. Relacion con la version Web

La version Web vive en `main` y se enfoca en colaboracion, dashboard, usuarios y despliegue en Vercel. La version Desktop vive en `desktop` y se enfoca en ejecucion local, conectores directos y privacidad de credenciales. Ambas comparten la idea central de convertir esquemas en diagramas mediante un modelo intermedio.

## 9. Trazabilidad

El repositorio oficial conserva los historiales de `iovargasjeff/fluxsql` y `iovargasjeff/fluxsql-web`. Esta rama documenta la evolucion Desktop derivada de esa consolidacion.
