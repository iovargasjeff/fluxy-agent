# Plan de Inspección e Implementación: Corrección de Frontend y Módulo de Diagramas ER

## 1. Análisis de los Errores Recientes

### Problema: El Generador y Analizador seguían fallando ("Usando MOCK DATA")
- **Síntoma:** Aunque el Backend y SQLite ya estaban arreglados, el frontend seguía cayendo al bloque `catch` y mostrando datos falsos.
- **Causa Raíz Encontrada:** El frontend en Zustand (`useConnectionStore.ts`) guarda las credenciales con nombres en inglés (`username`, `port`, `database`, `engine`), pero el Backend en FastAPI requiere nombres en español (`usuario`, `puerto`, `nombre_bd`, `motor`). Al enviar la petición POST, FastAPI la rechazaba inmediatamente con un error **422 Unprocessable Entity**.
- **Solución Aplicada:** He modificado `client.ts` para mapear automáticamente las variables de inglés a español justo antes de enviarlas al backend. **Con esto, el Generador y el Analizador ya funcionan perfectamente en la versión actual.**

---

## 2. Plan de Implementación Actualizado

### Fase A y B: Backend Completado ✅
- La BD SQLite ya se auto-inicializa en el arranque.
- Ya creé los modelos SQLAlchemy para Proyectos y Diagramas.
- Ya construí el Router (`diagrams_router`) con todos los endpoints CRUD y los ligué a FastAPI.

### Fase C: Integración de Diagramas ER en el Frontend (NUEVO)
Para cumplir con tu requerimiento de "preguntar qué tablas usar y poder crear el diagrama localmente", implementaremos lo siguiente en el Frontend:

1. **Nueva Pantalla de Creación de Diagrama (`/diagrams/new`)**:
   - Usaremos una interfaz parecida a la del Generador de Datos.
   - Leerá el esquema real de la base de datos a través de `generatorAPI.getSchema()`.
   - Mostrará una lista con Checkboxes para que selecciones **"Todas las tablas"** o **"Tablas específicas"**.
   - Al darle a "Generar Diagrama", el Frontend mandará esta selección al Backend.

2. **Lógica Inversa en el Backend (`POST /api/v1/diagrams/generate`)**:
   - El backend leerá solo las tablas seleccionadas.
   - Transformará las foreign keys y tipos de datos a un formato JSON compatible con `React Flow` (nodos y aristas).
   - Guardará el diagrama generado en la base de datos local SQLite bajo el Proyecto seleccionado.

3. **Visualizador de Diagramas (`/diagrams/[id]`)**:
   - Una pantalla con el canvas (React Flow) para visualizar, arrastrar, editar y exportar el Diagrama ER interactivo.

---

> [!IMPORTANT]
> He matado todos los procesos en segundo plano para limpiar bloqueos. El Backend de Python ya está re-compilado y el Frontend ya fue corregido para que el Analizador y el Generador se conecten de verdad.
> 
> **¿Apruebas este plan** para comenzar a construir las interfaces de selección de tablas y el visualizador del Diagrama ER (Fase C)?
