# Guía Completa: Comportamiento del Sistema de Conexiones a Bases de Datos en Diferentes Entornos

## 📋 Índice
1. [Conceptos Fundamentales de Red](#conceptos-fundamentales)
2. [Entorno Local (Desarrollo)](#entorno-local)
3. [Entorno Desplegado (Producción)](#entorno-desplegado)
4. [Ejemplos Reales de Configuración](#ejemplos-reales)
5. [Resumen de Limitaciones](#resumen-limitaciones)

---

## Conceptos Fundamentales de Red {#conceptos-fundamentales}

Antes de responder tus preguntas, necesitas entender estos conceptos clave:

### **Topología de Red: "El Backend es un Cliente Más"**

Cuando tu backend se conecta a una base de datos, **el backend actúa como cliente**:

```
Tu Backend (Cliente)  →  Red  →  Servidor de BD (Servidor)
```

**Regla de Oro**: El backend solo puede conectarse a direcciones que **pueda alcanzar desde su ubicación de red**.

### **Direcciones especiales de red:**

- **`localhost` o `127.0.0.1`**: "Yo MISMO" (solo funciona si la BD está en el mismo proceso/contenedor)
- **`0.0.0.0`**: "Escuchar en todas las interfaces" (solo para servidores, nunca para conexiones salientes)
- **IP privada (ej: `192.168.1.x`, `10.0.0.x`)**: Solo alcanzable desde la misma red local
- **IP pública o dominio público**: Alcanzable desde cualquier lugar en internet (si no hay firewall)

---

## Entorno Local (Desarrollo) {#entorno-local}

### Escenario 1: Todo en tu PC (sin Docker)

**Topología:**
```
┌─────────────────────────────────────┐
│         Tu PC local                 │
│  ┌──────────────┐  ┌────────────┐  │
│  │ App Backend  │→ │ Base de    │  │
│  │ (localhost)  │  │ Datos Local│  │
│  │ Puerto 8000  │  │ XAMPP      │  │
│  └──────────────┘  └────────────┘  │
└─────────────────────────────────────┘
```

**Configuración del formulario:**

```yaml
Host: localhost
Puerto: 3306 (o el que uses)
Usuario: root
Contraseña: (tu contraseña de XAMPP)
Base de datos: tu_bd
```

**¿Por qué funciona?**
- Ambos procesos están en el mismo PC
- `localhost` resuelve a `127.0.0.1` (loopback)
- No hay barrera de red

---

### Escenario 2: Todo en Docker local (recomendado)

**Tu `docker-compose.yml` actual:**

```yaml
services:
  postgres_main:
    image: postgres:16
    container_name: smartgen_postgres_main
    environment:
      POSTGRES_DB: smartgen_db
      POSTGRES_USER: admin
      POSTGRES_PASSWORD: admin123
    ports:
      - "5433:5432"  # Mapa puerto local 5433 → Puerto 5432 en contenedor
    volumes:
      - postgres_main_data:/var/lib/postgresql/data
```

**Topología - CONEXIÓN DESDE FUERA (tu PC):**

```
┌────────────────────────────────────────────────┐
│ Tu PC                                          │
│ ┌──────────────┐                              │
│ │ Browser/     │ "localhost:5433"             │
│ │ Postman      │────────────────┐             │
│ └──────────────┘                │             │
│                              ┌──────────────┐ │
│                              │ Docker       │ │
│                              │ (contenedor) │ │
│                              │ Puerto 5432  │ │
│                              └──────────────┘ │
└────────────────────────────────────────────────┘
       ↑
  Necesita: localhost:5433
```

**Topología - CONEXIÓN DESDE BACKEND (dentro de Docker):**

```
┌────────────────────────────────────────────────────┐
│ Docker Network (smartgen)                          │
│ ┌──────────────────┐        ┌──────────────────┐  │
│ │ Backend Service  │        │ Postgres Service │  │
│ │ (otro contenedor)│ ──────→│ (otro contenedor)│  │
│ │ Puerto 8000      │        │ Puerto 5432      │  │
│ └──────────────────┘        └──────────────────┘  │
│         ↑                           ↑              │
│    dns: "api"            dns: "postgres_main"    │
│                                                   │
│    Los nombres de servicio del docker-compose    │
│    se resuelven automáticamente en la red        │
└────────────────────────────────────────────────────┘
```

**Configuración del formulario (DESDE BACKEND EN DOCKER):**

```yaml
Host: postgres_main          # Nombre del servicio en docker-compose
Puerto: 5432                 # Puerto interno del contenedor (NO 5433)
Usuario: admin
Contraseña: admin123
Base de datos: smartgen_db
```

**¿Por qué funciona?**
- Docker crea una red interna llamada `smartgen` (por el nombre del directorio)
- Dentro de esa red, cada servicio es alcanzable por su nombre (`postgres_main`, `mysql_test`, etc.)
- NO usas `localhost` porque el backend está en OTRO contenedor
- Los puertos publicados (`-p 5433:5432`) son SOLO para acceso desde tu PC, no para inter-contenedor

**Importante**: Si intentas usar `localhost:5433` DESDE EL BACKEND, fallará porque:
- `localhost` dentro del contenedor del backend = el contenedor del backend mismo
- No hay base de datos dentro de ese contenedor

---

## Entorno Desplegado (Producción) {#entorno-desplegado}

### Escenario 3: Backend desplegado en servidor, BD local en tu PC

**Topología:**

```
┌──────────────────┐
│ Tu PC (en casa)  │
│ ┌──────────────┐ │
│ │ PostgreSQL   │ │ IP privada: 192.168.1.100
│ │ Local (XAMPP)│ │ Puerto: 5432
│ └──────────────┘ │
└──────────────────┘
         ↓ ¿Conexión posible?
    Internet (router)
         ↓
┌──────────────────────────────────────┐
│ Servidor remoto (AWS/Heroku/VPS)    │
│ ┌──────────────────────────────────┐ │
│ │ Backend (contenedor Docker)      │ │
│ │ Puerto: 8000                     │ │
│ └──────────────────────────────────┘ │
│ IP pública: 52.14.20.50             │
└──────────────────────────────────────┘
```

**Configuración del formulario:**

```yaml
Host: ???  # ¿Qué ponemos aquí?
Puerto: 5432
Usuario: admin
Contraseña: password123
Base de datos: testdb
```

**RESPUESTA: ❌ NO FUNCIONA**

**Razones:**

1. **IP privada no es accesible desde internet**
   - Tu PC tiene IP privada `192.168.1.100` (asignada por tu router)
   - Desde un servidor remoto, no puede alcanzar esa dirección
   - Es como intentar llamar a un teléfono de oficina privada desde otro país

2. **Tu router no expone la BD al internet**
   - Incluso si hicieras port-forwarding (algo muy inseguro), necesitarías:
     - Configurar port-forwarding en tu router
     - Saber tu IP pública (que cambia con el ISP)
     - Exponerías tu BD directamente a internet (¡MUY INSEGURO!)

**Conclusión:**
- ❌ No puedes conectarte a bases de datos locales desde un backend desplegado
- ⚠️ Incluso si fuera técnicamente posible, sería un **problema de seguridad grave**

---

### Escenario 4: Backend desplegado, BD en Docker del servidor

**Topología:**

```
┌──────────────────────────────────────┐
│ Servidor remoto (AWS/Heroku/VPS)    │
│                                      │
│ ┌──────────────┐   ┌──────────────┐ │
│ │ Backend      │→→→│ PostgreSQL   │ │
│ │ (contenedor) │   │ (contenedor) │ │
│ │ Puerto 8000  │   │ Puerto 5432  │ │
│ └──────────────┘   └──────────────┘ │
│                                      │
│ IP pública: 52.14.20.50             │
│ Docker Network: smartgen            │
└──────────────────────────────────────┘
```

**Configuración del formulario:**

```yaml
Host: postgres_main       # Nombre del servicio en docker-compose
Puerto: 5432              # Puerto interno (no el publicado)
Usuario: admin
Contraseña: admin123
Base de datos: smartgen_db
```

**¿Por qué funciona?**
- Ambos contenedores están en la MISMA red Docker
- El nombre `postgres_main` se resuelve automáticamente dentro de la red
- No necesitas IP ni puerto publicado

**¿Cómo accede alguien desde fuera?**
- Solo el Backend (dentro de Docker) accede a la BD
- La BD NO está publicada en un puerto (no hay `-p 5433:5432`)
- Los usuarios acceden al Backend vía API REST en el puerto 8000

---

### Escenario 5: Backend desplegado, BD en la nube (Supabase, AWS RDS, etc.)

**Topología:**

```
┌──────────────────────────────────────┐
│ Servidor remoto (AWS/Heroku/VPS)    │
│                                      │
│ ┌──────────────┐                    │
│ │ Backend      │                    │
│ │ (contenedor) │                    │
│ │ Puerto 8000  │                    │
│ └──────────────┘                    │
│        │                            │
│        │ Conexión TCP a BD pública  │
│        ↓                            │
└──────────────────────────────────────┘
         │
         │ Internet (seguro con SSL/TLS)
         │
         ↓
    ┌────────────────────────────────┐
    │ Proveedor en la nube            │
    │ (Supabase / AWS RDS)            │
    │ Host: db.123abc.supabase.co     │
    │ Puerto: 5432 (publicado)        │
    │ SSL/TLS requerido               │
    └────────────────────────────────┘
```

**Configuración del formulario:**

```yaml
Host: db.123abc.supabase.co      # Dominio DNS público
Puerto: 5432
Usuario: postgres
Contraseña: TuPasswordSuperSegura123!
Base de datos: postgres
```

**¿Por qué funciona?**
- El servidor en la nube tiene DNS público (`db.123abc.supabase.co`)
- Puerto está publicado y accesible desde internet
- Usa SSL/TLS para encriptar la conexión
- Es SEGURO porque:
  - Solo acepta conexiones autenticadas
  - Encripta los datos en tránsito
  - Puedes configurar firewall de IP

---

## Ejemplos Reales de Configuración {#ejemplos-reales}

### ✅ Caso 1: PostgreSQL local en tu PC (XAMPP o instalación directa)

**Entorno:** Tu PC local, Backend también en tu PC

```yaml
Motor: PostgreSQL
Host: localhost
Puerto: 5432
Usuario: postgres
Contraseña: tu_password
Base de datos: mi_base_datos
```

**Cómo verificar:**
```bash
# En tu terminal local
psql -h localhost -p 5432 -U postgres -d mi_base_datos
# Si funciona este comando, el formulario también funcionará
```

---

### ✅ Caso 2: MySQL en XAMPP local

**Entorno:** Tu PC local, Backend también en tu PC

```yaml
Motor: MySQL
Host: localhost
Puerto: 3306
Usuario: root
Contraseña: (dejar vacío o "root")
Base de datos: testdb
```

**Cómo verificar:**
```bash
# En tu terminal local
mysql -h localhost -u root -p testdb
```

---

### ✅ Caso 3: PostgreSQL en Docker local

**Entorno:** Tu PC, todo en Docker local

```yaml
Motor: PostgreSQL
Host: postgres_main          # Nombre del servicio
Puerto: 5432                 # Puerto INTERNO del contenedor
Usuario: admin
Contraseña: admin123
Base de datos: smartgen_db
```

**Cómo verificar (desde tu PC):**
```bash
# Usa el puerto PUBLICADO (5433) para acceder desde tu PC
psql -h localhost -p 5433 -U admin -d smartgen_db

# Dentro del contenedor del backend, usa:
# Host: postgres_main, Puerto: 5432 (puerto interno)
```

---

### ✅ Caso 4: PostgreSQL en Docker del servidor (producción)

**Entorno:** Servidor remoto, Backend y BD en Docker

```yaml
Motor: PostgreSQL
Host: postgres_main          # Nombre del servicio en el docker-compose remoto
Puerto: 5432                 # Puerto INTERNO
Usuario: admin
Contraseña: admin123
Base de datos: smartgen_db
```

**Cómo verificar (desde el servidor):**
```bash
# SSH al servidor, dentro del contenedor del backend:
docker exec smartgen_backend psql -h postgres_main -U admin -d smartgen_db
```

---

### ✅ Caso 5: Supabase (PostgreSQL gestionado en la nube)

**Entorno:** Tu PC o servidor remoto, BD en Supabase

Obtén estos datos de tu dashboard de Supabase:

```yaml
Motor: PostgreSQL
Host: db.xyzabc123.supabase.co
Puerto: 5432
Usuario: postgres
Contraseña: Tu_contraseña_supabase_super_larga
Base de datos: postgres
```

**Parámetros extra (JSON):**
```json
{
  "sslmode": "require"
}
```

**Cómo verificar (desde tu PC):**
```bash
psql -h db.xyzabc123.supabase.co -p 5432 -U postgres -d postgres
```

---

### ✅ Caso 6: AWS RDS PostgreSQL

**Entorno:** Servidor remoto, BD en AWS RDS

```yaml
Motor: PostgreSQL
Host: mydb.c9akciq32.us-east-1.rds.amazonaws.com
Puerto: 5432
Usuario: admin
Contraseña: MyPassword123!
Base de datos: myappdb
```

**Parámetros extra (JSON):**
```json
{
  "sslmode": "require"
}
```

---

### ✅ Caso 7: MongoDB Atlas (NoSQL gestionado en la nube)

**Entorno:** Cualquier lugar, BD en MongoDB Atlas

```yaml
Motor: MongoDB
Host: cluster0.mongodb.net
Puerto: 27017
Usuario: admin_user
Contraseña: MyPasswordMongo123!
Base de datos: myappdb
```

**O usa la cadena de conexión en Parámetros extra:**
```json
{
  "uri": "mongodb+srv://admin_user:MyPasswordMongo123!@cluster0.mongodb.net/myappdb?retryWrites=true&w=majority"
}
```

---

## Resumen de Limitaciones {#resumen-limitaciones}

### Matriz de Conectividad

| Escenario | Backend Ubicación | BD Ubicación | ¿Funciona? | Razón |
|-----------|------------------|--------------|-----------|-------|
| Desarrollo | PC Local | PC Local | ✅ Sí | Mismo PC, localhost funciona |
| Docker Local | PC (Docker) | PC (Docker) | ✅ Sí | Red Docker interna |
| Cloud Testing | PC Local | Servidor Remoto | ⚠️ Depende* | Solo si BD está publicada públicamente |
| Producción | Servidor Remoto | BD Local del dev | ❌ No | IP privada no alcanzable |
| Producción | Servidor Remoto | Docker del servidor | ✅ Sí | Red Docker local del servidor |
| Producción | Servidor Remoto | BD en la nube | ✅ Sí | Dominio público + SSL |

*Depende: Solo funciona si la base de datos está publicada en internet (no recomendado para producción)

---

### Reglas Clave

**1. Regla de Red:**
```
Backend solo puede conectarse a hosts que pueda "ver" desde su posición en la red
```

**2. Regla de Docker:**
```
Dentro de Docker: Usa nombre del servicio + puerto interno
Fuera de Docker: Usa localhost/IP + puerto publicado
```

**3. Regla de Topología:**
```
Base de datos local (IP privada) 
  ↓
Solo accesible desde la misma red local
  ↓
Si backend está en otra red (servidor remoto) 
  ↓
❌ NO FUNCIONA
```

**4. Regla de Producción Segura:**
```
Backend (servidor remoto en Docker)
  ↓
BD en nube (Supabase, AWS RDS, etc.)
  ↓
Conexión segura con SSL/TLS
  ↓
✅ RECOMENDADO
```

---

## Recomendaciones de Arquitectura

### Para Desarrollo Local
```
Tu PC:
├── Backend (FastAPI en localhost:8000)
└── Bases de datos (PostgreSQL, MySQL, MongoDB)
    ├── XAMPP
    └── O Docker local
```

**Configuración en formulario:**
- Host: `localhost`
- Puertos: Estándar (5432, 3306, 27017)

---

### Para Testing de Conexión
```
Tu PC (Backend):
├── Frontend (Angular en localhost:3000)
└── Backend (FastAPI en localhost:8000)

Servidor Remoto (testing):
├── PostgreSQL, MySQL, MongoDB (en Docker)
└── Puerto 5432, 3306, 27017 publicados
```

**Configuración:**
- Desde tu PC: Usa `localhost` o `127.0.0.1`
- Desde servidor remoto: Usa nombre del servicio Docker

---

### Para Producción
```
Servidor Remoto (AWS/Heroku/DigitalOcean):
├── Frontend (estático servido por Nginx)
├── Backend (FastAPI en Docker)
└── Bases de datos:
    ├── PostgreSQL principal (docker-compose, no publicado)
    ├── Caché Redis (docker-compose, no publicado)
    └── Bases de datos externas (Supabase/AWS RDS si es necesario)

Usuarios externos:
└── Acceden vía API REST (puerto 80/443)
    └── NO directo a la BD
```

**Configuración:**
- Backend ↔ BD Local: Usar nombres de servicio Docker
- Backend ↔ BD Remota: Usar DNS público + SSL

---

## Cómo Hacer Pruebas en Tu Sistema

### Prueba 1: Conexión Local

1. En tu PC, abre el formulario de conexión
2. Ingresa:
   ```
   Motor: PostgreSQL
   Host: localhost
   Puerto: 5432
   Usuario: tu_usuario
   Contraseña: tu_contraseña
   Base de datos: tu_base
   ```
3. Haz clic en "Probar Conexión"
4. Si funciona, aparecerá: "Conexión exitosa" con versión de la BD

### Prueba 2: Conexión Docker Local

1. Ejecuta: `docker-compose up -d`
2. En el formulario:
   ```
   Motor: PostgreSQL
   Host: localhost        ← Desde tu PC (acceso externo)
   Puerto: 5433           ← Puerto PUBLICADO (del docker-compose)
   Usuario: admin
   Contraseña: admin123
   Base de datos: smartgen_db
   ```
3. Si el backend está DENTRO de Docker:
   ```
   Motor: PostgreSQL
   Host: postgres_main    ← Nombre del servicio (acceso interno)
   Puerto: 5432           ← Puerto INTERNO
   Usuario: admin
   Contraseña: admin123
   Base de datos: smartgen_db
   ```

### Prueba 3: Conexión a Supabase

1. Crea proyecto en [supabase.com](https://supabase.com)
2. Copia los datos de conexión desde Dashboard
3. En el formulario:
   ```
   Motor: PostgreSQL
   Host: db.xxxxx.supabase.co
   Puerto: 5432
   Usuario: postgres
   Contraseña: [tu_password]
   Base de datos: postgres
   Parámetros extra: {"sslmode": "require"}
   ```
4. Prueba la conexión

---

## Conclusiones y Respuestas Directas

### ¿Mi sistema permite conectarse a bases de datos locales cuando está desplegado?

**No**, a menos que:
- La BD esté en el MISMO servidor donde está desplegado el backend (en el mismo Docker)
- O la BD esté publicada públicamente en internet (NO recomendado)

### ¿O solo puede conectarse a bases de datos públicamente accesibles?

Más o menos. Puede conectarse a:
1. BD en la MISMA red (ej: Docker local)
2. BD con DNS resuelto y puerto accesible (ej: Supabase)
3. BD en servidor privado SI se configura port-forwarding (NO seguro)

### ¿Qué restricciones existen?

**Restricción Principal: Topología de Red**
- El backend está donde está
- Solo puede conectarse a lo que pueda "ver" desde esa ubicación
- Las IPs privadas solo son visibles dentro de su red local

### ¿Cómo debería configurarse?

Depende de tu entorno (ve la matriz de conectividad arriba)

### ¿Qué datos ingresar en el formulario?

Ve los "Casos Reales" en esta guía para tu escenario específico

---

## Referencias Técnicas

### Código Relevante en el Backend

**Conectores** (`backend/connectors/`):
- `postgresql_connector.py`: Usa `psycopg2.connect(host, port, user, password, dbname)`
- `mysql_connector.py`: Usa `pymysql.connect(host, port, user, password, database)`
- `mongodb_connector.py`: Usa `MongoClient(f"mongodb://{host}:{port}")`

**El backend intenta conectar usando los valores exactos que ingreses en el formulario**:
- Si el host no existe o no es alcanzable → Error de conexión
- Si el puerto está cerrado → Timeout
- Si usuario/contraseña son incorrectos → Error de autenticación

**Docker Compose actual** (`docker-compose.yml`):
- `postgres_main` (5433:5432) - BD principal del sistema
- `postgres_test` (5432:5432) - BD de testing
- `mysql_test` (3306:3306) - MySQL de testing
- `mongodb_test` (27017:27017) - MongoDB de testing

Cada uno está en la red Docker `smartgen`, accesible por nombre de servicio.

---

**Última actualización:** Mayo 2026  
**Para:** Sistema DataGenerator con soporte multi-BD  
**Autor:** Análisis técnico del backend
