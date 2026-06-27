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

Sistema *DBCanvas — Database Diagram Generator*

Propuesta de Proyecto

Versión *1.0*

| CONTROL DE VERSIONES | | | | | |
| :-: | :- | :- | :- | :- | :- |
| Versión | Hecha por | Revisada por | Aprobada por | Fecha | Motivo |
| 1.0 | KHZM / JAVE | | | Abril 2026 | Versión Original |

***

## 1. Identificación del Proyecto

| Campo | Valor |
| :-- | :-- |
| Nombre | DBCanvas — Generador de Diagramas de Base de Datos |
| Estudiantes | Zapana Murillo, Kiara Holly (2023077087) / Vargas Espinoza, Jefferson Alfonso (2023076820) |
| Curso | Base de Datos II |
| Docente | Mag. Patrick Cuadros Quiroga |

## 2. Descripción

DBCanvas es un generador de diagramas que visualiza automáticamente la estructura de bases de datos. A diferencia de herramientas existentes que solo soportan un motor específico o requieren enviar datos a la nube, DBCanvas:

1. **Cubre 9 categorías de bases de datos** (Relacional, Document, Key-Value, Graph, Columnar, Time-Series, NewSQL, Spatial, Object-Oriented) mediante un modelo intermedio universal (`SchemaModel`).
2. **Ofrece dos superficies**: una Web App (React) para parseo de texto con persistencia en la nube, y una Desktop App (Electron + Go) para conexión directa a BDs locales sin envío de datos al exterior.
3. **Es de código abierto** y gratuito, publicado bajo licencia MIT.

## 3. Justificación

La documentación de esquemas de bases de datos es una práctica esencial pero frecuentemente descuidada porque las herramientas disponibles son pesadas (MySQL Workbench, DBeaver), costosas (DataGrip — USD 229/año) o comprometen la privacidad (dbdiagram.io). Además, ninguna herramienta existente cubre las 9 categorías de bases de datos en un solo producto.

DBCanvas resuelve esto siendo ligero (~200 MB con todo incluido), multiplataforma, multi-motor y de código abierto.

## 4. Stack Tecnológico

| Capa | Tecnología |
| :-- | :-- |
| Monorepo | pnpm workspaces + Turborepo |
| Frontend | React 18, Vite 5, TypeScript, TailwindCSS, Shadcn/UI |
| Editor | Monaco Editor |
| Diagramas | Mermaid.js |
| Parsers | TypeScript puro (`@dbcanvas/parsers`) |
| Backend local | Go 1.22 (`net/http` + drivers nativos) |
| Desktop | Electron 29 + electron-vite |
| Persistencia Web | PostgreSQL vía `@insforge/cli` (auth + real-time + DB) |
| Testing | Vitest (unitario) + Playwright (E2E) |
| CI/CD | GitHub Actions |

## 5. Cronograma

| Fase | Milestone | Descripción | Duración |
| :--: | :--: | :-- | :--: |
| 1 | v0.1 | Monorepo setup, SchemaModel, paquetes compartidos, migraciones DB nube | 5 días |
| 2 | v0.2 | Core engine: parsers DDL y JSON Schema + conectores Go para 5 motores | 8 días |
| 3 | v0.3 | Web App: UI completa, login, guardado, exportación, colaboración RT | 8 días |
| 4 | v1.0 | Desktop App: Electron + Go embebido, empaquetado multiplataforma | 9 días |
| | **Total** | | **~30 días** |

## 6. División de Trabajo

| Integrante | Responsabilidad Principal |
| :-- | :-- |
| **Vargas Espinoza, Jefferson** | Backend Go (conectores, API HTTP), parsers TypeScript, configuración del monorepo, migraciones DB, CI/CD |
| **Zapana Murillo, Kiara** | Frontend React (Web App + Desktop UI), componentes UI compartidos, diseño visual, tests E2E |
