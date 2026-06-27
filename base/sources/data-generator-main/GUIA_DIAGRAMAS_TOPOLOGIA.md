# Diagramas de Topología de Red: Visualización de Conectividad

## 📊 Diagrama 1: Topología Local (Tu PC)

```
┌──────────────────────────────────────────────────────────┐
│                        Tu PC                             │
│                    192.168.1.100                         │
│                                                          │
│  ┌─────────────────────────────────────────────────┐   │
│  │            localhost / 127.0.0.1                │   │
│  │                                                 │   │
│  │  ┌──────────────┐                               │   │
│  │  │  Browser     │                               │   │
│  │  │ localhost:  │                               │   │
│  │  │  3000       │───┐                           │   │
│  │  └──────────────┘   │                           │   │
│  │                     │                           │   │
│  │  ┌──────────────┐   │                           │   │
│  │  │  Backend     │   │                           │   │
│  │  │  FastAPI    │◄──┤   localhost               │   │
│  │  │ localhost:  │   │   SOLO AQUÍ DENTRO        │   │
│  │  │  8000       │   │                           │   │
│  │  └──────┬───────┘   │                           │   │
│  │         │           │                           │   │
│  │         │ conecta a localhost:5432              │   │
│  │         │                                       │   │
│  │         ↓                                       │   │
│  │  ┌──────────────┐                               │   │
│  │  │ PostgreSQL   │                               │   │
│  │  │ (Process)    │                               │   │
│  │  │ puerto 5432  │                               │   │
│  │  └──────────────┘                               │   │
│  │                                                 │   │
│  └─────────────────────────────────────────────────┘   │
│                                                          │
│  ┌─────────────────────────────────────────────────┐   │
│  │           Acceso desde router                   │   │
│  │      (XAMPP, WAMP, LAMP, etc.)                 │   │
│  │      Puerto 3306 / 5433                        │   │
│  └─────────────────────────────────────────────────┘   │
│                                                          │
└──────────────────────────────────────────────────────────┘

IMPORTANTE: localhost SOLO dentro de tu PC
Si intentas acceder desde otro lugar, ¡NO FUNCIONA!
```

---

## 📊 Diagrama 1B: SQL Server Local (Tu PC)

```
┌──────────────────────────────────────────────────────────┐
│                        Tu PC                             │
│                    192.168.1.100                         │
│                                                          │
│  ┌─────────────────────────────────────────────────┐   │
│  │            localhost / 127.0.0.1                │   │
│  │                                                 │   │
│  │  ┌──────────────┐                               │   │
│  │  │  SSMS        │  (SQL Server Management       │   │
│  │  │  Studio      │   Studio - GUI)              │   │
│  │  └──────────────┘                               │   │
│  │                                                 │   │
│  │  ┌──────────────┐                               │   │
│  │  │  Backend     │                               │   │
│  │  │  FastAPI    │                               │   │
│  │  │ localhost:  │                               │   │
│  │  │  8000       │                               │   │
│  │  └──────┬───────┘                               │   │
│  │         │                                       │   │
│  │         │ conecta a localhost:1433              │   │
│  │         │ (user: sa)                           │   │
│  │         ↓                                       │   │
│  │  ┌──────────────┐                               │   │
│  │  │ SQL Server   │                               │   │
│  │  │ Express      │                               │   │
│  │  │ puerto 1433  │                               │   │
│  │  │ (Process)    │                               │   │
│  │  └──────────────┘                               │   │
│  │                                                 │   │
│  └─────────────────────────────────────────────────┘   │
│                                                          │
└──────────────────────────────────────────────────────────┘

IMPORTANTE: SQL Server por defecto usa puerto 1433
En Windows: Verifica "SQL Server Configuration Manager"
En Linux:   systemctl status mssql-server
```

---

## 📊 Diagrama 2: Docker Local (Tu PC)

```
┌─────────────────────────────────────────────────────────────────┐
│                           Tu PC                                 │
│                      192.168.1.100                              │
│                                                                 │
│  ╔═════════════════════════════════════════════════════════╗  │
│  ║            Docker Engine                               ║  │
│  ║                                                         ║  │
│  ║  ┌────────────────────────────────────────────────┐   ║  │
│  ║  │    Docker Network "smartgen"                   │   ║  │
│  ║  │    (Red interna solo para contenedores)        │   ║  │
│  ║  │                                                │   ║  │
│  ║  │  ┌──────────────────┐  ┌──────────────────┐   │   ║  │
│  ║  │  │   frontend       │  │   backend        │   │   ║  │
│  ║  │  │  (contenedor)    │  │  (contenedor)    │   │   ║  │
│  ║  │  │  DNS: frontend   │  │  DNS: api        │   │   ║  │
│  ║  │  │  port: 3000      │  │  port: 8000      │   │   ║  │
│  ║  │  └──────────────────┘  └────────┬─────────┘   │   ║  │
│  ║  │                                  │              │   ║  │
│  ║  │                                  │ DNS lookup   │   ║  │
│  ║  │                                  │ postgres_main│   ║  │
│  ║  │                                  │              │   ║  │
│  ║  │  ┌──────────────────────────────┴───────────┐  │   ║  │
│  ║  │  │   postgres_main                          │  │   ║  │
│  ║  │  │  (contenedor)                            │  │   ║  │
│  ║  │  │  DNS: postgres_main                      │  │   ║  │
│  ║  │  │  Puerto INTERNO: 5432                    │  │   ║  │
│  ║  │  └──────────────────────────────────────────┘  │   ║  │
│  ║  │                                                │   ║  │
│  ║  │  ┌──────────────────┐  ┌──────────────────┐   │   ║  │
│  ║  │  │   mysql_test     │  │   mongodb_test   │   │   ║  │
│  ║  │  │  (contenedor)    │  │  (contenedor)    │   │   ║  │
│  ║  │  │  DNS: mysql_test │  │  DNS: mongodb_test│  │   ║  │
│  ║  │  │  Puerto: 3306    │  │  Puerto: 27017   │   │   ║  │
│  ║  │  └──────────────────┘  └──────────────────┘   │   ║  │
│  ║  │                                                │   ║  │
│  ║  └────────────────────────────────────────────────┘   ║  │
│  ║                                                         ║  │
│  ║  Puertos publicados (acceso desde tu PC):              ║  │
│  ║  - 3000:3000 (Frontend)                               ║  │
│  ║  - 8000:8000 (Backend)                                ║  │
│  ║  - 5433:5432 (PostgreSQL ← Port mapping!)             ║  │
│  ║  - 3306:3306 (MySQL)                                  ║  │
│  ║  - 27017:27017 (MongoDB)                              ║  │
│  ║                                                         ║  │
│  ╚═════════════════════════════════════════════════════════╝  │
│                                                                 │
│  Acceso desde tu PC (localhost):                               │
│  ✓ curl localhost:3000/  (Frontend)                           │
│  ✓ curl localhost:8000/api  (Backend)                         │
│  ✓ psql localhost:5433 -U admin  (PostgreSQL - puerto pub.)  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘

CLAVE: Dentro de la red Docker, usa NOMBRES DE SERVICIO (postgres_main)
       Desde fuera (tu PC), usa PUERTOS PUBLICADOS (5433)
```

---

## 📊 Diagrama 3: Servidor Remoto + BD Local del Dev (❌ NO FUNCIONA)

```
┌──────────────────────────────────────┐
│   Tu PC en Casa                      │
│   IP privada: 192.168.1.100          │
│                                      │
│  ┌────────────────────────────────┐ │
│  │  PostgreSQL Local              │ │
│  │  puerto 5432                   │ │
│  └────────────────────────────────┘ │
│                                      │
└──────────────────────────────────────┘
           ↑
     192.168.1.1 (router)
     ¿Puede el backend acceder aquí?
           │
    NO - Es una red PRIVADA
    Solo visible dentro de la red local
    No ruteada en internet
           │
           ↓
┌──────────────────────────────────────────────────┐
│  Servidor Remoto (AWS/Heroku/DigitalOcean)     │
│  IP pública: 52.14.20.50                        │
│                                                  │
│  ┌────────────────────────────────────────────┐ │
│  │  Docker                                    │ │
│  │  ┌──────────────┐                          │ │
│  │  │   Backend    │                          │ │
│  │  │  (container) │                          │ │
│  │  │              │                          │ │
│  │  │ Intenta llegar a:                      │ │
│  │  │ 192.168.1.100:5432                     │ │
│  │  │           ↓                             │ │
│  │  │ ✗ Error: IP no alcanzable               │ │
│  │  │ "No route to host"                     │ │
│  │  │ or "Connection refused"                 │ │
│  │  └──────────────┘                          │ │
│  └────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────┘

¿Por qué no funciona?
- 192.168.1.100 es una IP privada
- Solo existe dentro de tu red local
- El servidor remoto está en una red DIFERENTE
- No hay ruta de internet entre ellas
- Aunque expusieras el puerto via port-forwarding,
  sería EXTREMADAMENTE INSEGURO

SOLUCIÓN: Mueve la BD a la nube (Supabase, AWS RDS, etc.)
```

---

## 📊 Diagrama 4: Servidor Remoto + BD en el Mismo Servidor (✅ FUNCIONA)

```
┌───────────────────────────────────────────────────────────────┐
│  Servidor Remoto (AWS/Heroku)                                │
│  IP pública: 52.14.20.50                                     │
│                                                               │
│  ╔══════════════════════════════════════════════════════╗   │
│  ║  Docker Engine                                       ║   │
│  ║                                                      ║   │
│  ║  ┌────────────────────────────────────────────────┐ ║   │
│  ║  │   Docker Network "smartgen" (local)           │ ║   │
│  ║  │                                                │ ║   │
│  ║  │  ┌──────────────┐     ┌────────────────────┐  │ ║   │
│  ║  │  │   Backend    │────→│  PostgreSQL        │  │ ║   │
│  ║  │  │  (container) │     │  (otro container)  │  │ ║   │
│  ║  │  │  puerto 8000 │     │  puerto 5432       │  │ ║   │
│  ║  │  │              │     │ (no publicado)     │  │ ║   │
│  ║  │  │ "Conecta a   │     │                    │  │ ║   │
│  ║  │  │  postgres_main"    │ DNS: postgres_main │  │ ║   │
│  ║  │  │  puerto 5432 │     │                    │  │ ║   │
│  ║  │  └──────────────┘     └────────────────────┘  │ ║   │
│  ║  │        ✓ ✓ ✓ Dentro de la misma red Docker   │ ║   │
│  ║  │                                                │ ║   │
│  ║  └────────────────────────────────────────────────┘ ║   │
│  ║                                                      ║   │
│  ║  Puerto 8000 publicado:                             ║   │
│  ║  52.14.20.50:8000  ← Usuarios acceden aquí         ║   │
│  ║                                                      ║   │
│  ║  Puerto 5432 NO publicado:                          ║   │
│  ║  Solo el Backend (otro container) lo puede ver      ║   │
│  ║                                                      ║   │
│  ╚══════════════════════════════════════════════════════╝   │
│                                                               │
└───────────────────────────────────────────────────────────────┘

¿Por qué funciona?
- Backend y PostgreSQL están en MISMA red Docker
- DNS "postgres_main" se resuelve dentro de la red
- No necesitan puertos publicados entre ellos
- Comunicación es rápida y segura (sin internet)
- Solo el Backend accede a la BD
- Usuarios acceden al Backend via API REST (puerto 8000)

CONFIGURACIÓN EN FORMULARIO:
Host: postgres_main
Puerto: 5432  ← INTERNO, no publicado
Usuario: admin
Contraseña: admin123
```

---

## 📊 Diagrama 5: Servidor Remoto + BD en la Nube (✅ FUNCIONA)

```
┌────────────────────────────────────────────────────┐
│  Servidor Remoto (AWS/Heroku/DigitalOcean)        │
│  IP pública: 52.14.20.50                          │
│                                                    │
│  ╔──────────────────────────────────────────────┐ │
│  ║  Docker                                      ║ │
│  ║                                              ║ │
│  ║  ┌─────────────────────────────────┐        ║ │
│  ║  │   Backend (container)           │        ║ │
│  ║  │   puerto 8000                   │        ║ │
│  ║  │                                 │        ║ │
│  ║  │   "Conecta a:                  │        ║ │
│  ║  │   db.xyz.supabase.co:5432"     │        ║ │
│  ║  │   Parámetros: {"sslmode":      │        ║ │
│  ║  │                "require"}       │        ║ │
│  ║  └────────────┬────────────────────┘        ║ │
│  ║               │ SSL/TLS                     ║ │
│  ║               │ (encriptado)                ║ │
│  ║               │                             ║ │
│  ╚───────────────┼─────────────────────────────┘ │
│                  │                               │
│                  │ Internet segura              │
│                  ↓                               │
│        ┌─────────────────────────────┐          │
│        │   Proveedor en la nube       │          │
│        │   (Supabase / AWS RDS)      │          │
│        │   DNS: db.xyz.supabase.co   │          │
│        │   IP pública: 3.21.45.67    │          │
│        │   Puerto: 5432 (publicado)  │          │
│        │   SSL/TLS: Requerido        │          │
│        │                             │          │
│        │   ┌─────────────────────┐   │          │
│        │   │   PostgreSQL        │   │          │
│        │   │   (gestionado)      │   │          │
│        │   │   Database & Backups│   │          │
│        │   └─────────────────────┘   │          │
│        └─────────────────────────────┘          │
│                                                  │
└────────────────────────────────────────────────┘

¿Por qué funciona?
- Supabase/AWS RDS tiene dominio DNS público
- Puerto 5432 está publicado y accesible
- SSL encripta la comunicación
- Cualquiera (con credenciales) puede conectar
- Es seguro porque:
  * Solo acepta conexiones autenticadas
  * Encripta datos en tránsito
  * Puedes configurar firewall de IP
  * Puedes rotar credenciales

CONFIGURACIÓN EN FORMULARIO:
Host: db.xyz.supabase.co
Puerto: 5432
Usuario: postgres
Contraseña: TuPassword123!
Parámetros: {"sslmode": "require"}
```

---

## 📊 Diagrama 6: Flujo Completo de Datos - Análisis de Schema

```
┌─────────────────────────────────────────────────────────────┐
│                    USUARIO FINAL                           │
│          (Abre formulario en navegador)                    │
└────────────────────────────┬────────────────────────────────┘
                             │
                      Frontend Angular
                             │
                             ↓ POST /api/connections/test
┌─────────────────────────────────────────────────────────────┐
│                    BACKEND (FastAPI)                        │
│                                                             │
│  1. Recibe JSON:                                           │
│     {                                                       │
│       "host": "db.xyz.supabase.co",                        │
│       "port": 5432,                                        │
│       "username": "postgres",                              │
│       "password": "Password123!",  ← Encriptada luego      │
│       "database_name": "postgres",                         │
│       "engine": "postgresql"                               │
│     }                                                       │
│                                                             │
│  2. connection_router.py recibe request                    │
│     └─ POST /connections/test                             │
│                                                             │
│  3. connection_service.py procesa                          │
│     └─ Crea: ConnectionCreate(...)                         │
│                                                             │
│  4. factory.py selecciona conector                         │
│     └─ get_connector(config) →                            │
│        PostgreSQLConnector (porque engine=="postgresql") │
│                                                             │
│  5. PostgreSQLConnector.test_connection()                 │
│     └─ psycopg2.connect(                                  │
│          host="db.xyz.supabase.co",  ← DNS resuelve a IP │
│          port=5432,                  ← Conecta al puerto  │
│          user="postgres",                                 │
│          password="Password123!",                          │
│          dbname="postgres",                                │
│          connect_timeout=5,          ← Espera máx 5s     │
│          sslmode="require"           ← Usa SSL/TLS       │
│        )                                                   │
│                                                             │
│  6. Intenta conexión TCP                                  │
│     └─ DNS lookup: db.xyz.supabase.co → 3.21.45.67       │
│     └─ TCP connection: 3.21.45.67:5432                   │
│     └─ TLS handshake (SSL)                               │
│     └─ PostgreSQL authentication                         │
│     └─ Executa: SELECT version()                         │
│                                                             │
│  7. Retorna ConnectionTest:                               │
│     {                                                      │
│       "success": true,                                    │
│       "message": "Conexión exitosa",                      │
│       "engine_version": "PostgreSQL 15.1",                │
│       "latency_ms": 245.67                                │
│     }                                                      │
│                                                             │
└────────────────────────────┬────────────────────────────────┘
                             │
                             ↓ JSON response
                         Frontend Angular
                             │
                             ↓
                    ✓ Muestra mensaje de éxito
                    + Versión: PostgreSQL 15.1
                    + Latencia: 245.67 ms

═══════════════════════════════════════════════════════════════

FLUJO DE ERRORES:

1. Host no existe
   └─ DNS lookup falla → "Name or service not known"

2. Servidor no responde
   └─ TCP connection timeout → "Connection refused"

3. Firewall bloquea
   └─ TCP reset → "Connection refused" (confuso, igual error)

4. Usuario/password incorrectos
   └─ PostgreSQL rechaza → "FATAL: password authentication failed"

5. SSL requerido pero no configurado
   └─ TLS error → "SSL error: certificate_verify_failed"
```

---

## 📊 Diagrama 7: Matriz de Conectividad

```
                           BACKEND UBICACIÓN
                    ↓
BD UBICACIÓN    │  PC Local  │  Docker Local │  Servidor Remoto
────────────────┼────────────┼───────────────┼──────────────────
PC Local        │     ✅      │       ✅       │        ❌
                │  localhost  │  localhost:   │  IP privada
                │ :5432      │  5433 (pub)   │  NO alcanzable
────────────────┼────────────┼───────────────┼──────────────────
Docker Local    │     ✅      │       ✅       │        ❌
                │ localhost:  │ postgres_main │  Contenedores
                │  5433 (pub) │  :5432 (int)  │  no compartidos
────────────────┼────────────┼───────────────┼──────────────────
Docker Server   │     ❌      │       ❌       │        ✅
                │ Diferente   │ Diferente     │  postgres_main
                │ máquina     │  máquina      │  :5432 (int)
────────────────┼────────────┼───────────────┼──────────────────
Supabase/Cloud  │     ✅      │       ✅       │        ✅
                │ DNS público │ DNS público   │  DNS público
                │ Puerto 5432 │ Puerto 5432   │  Puerto 5432
                │ SSL req.    │ SSL req.      │  SSL req.
────────────────┼────────────┼───────────────┼──────────────────
AWS RDS         │     ✅      │       ✅       │        ✅
                │ Si público  │ Si público    │  Si público +
                │ + segurable │ + segurable   │  firewall OK
────────────────┼────────────┼───────────────┼──────────────────
MongoDB Atlas   │     ✅      │       ✅       │        ✅
                │ URI público │ URI público   │  URI público
                │ +auth       │  +auth        │  +auth

REGLA:
❌ Necesita "Ver" = accesibilidad de red
✅ = Conectar usando credenciales
```

---

## 📊 Diagrama 8: Arquitectura Recomendada de Producción

```
┌──────────────────────────────────────────────────────────────────────┐
│                      PRODUCCIÓN (Recomendado)                        │
│                                                                      │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │ Servidor Principal (AWS/Heroku/DigitalOcean/Vultr)        │   │
│  │ IP Pública: 52.14.20.50                                    │   │
│  │                                                            │   │
│  │  ┌────────────────┐           ┌────────────────────────┐  │   │
│  │  │  Nginx         │           │  Docker               │  │   │
│  │  │  (Proxy)       │───────────→ Backend (puerto 8000) │  │   │
│  │  │                │           │                      │  │   │
│  │  │ Puerto 80/443  │           │ (aplicación FastAPI) │  │   │
│  │  │ SSL/TLS        │           └──────────┬───────────┘  │   │
│  │  └────────────────┘                      │              │   │
│  │                                           │              │   │
│  │                                           ↓              │   │
│  │  Docker Network (local)                                 │   │
│  │  ┌──────────────────────────────────────────────────┐   │   │
│  │  │                                                  │   │   │
│  │  │  ┌──────────────────┐                           │   │   │
│  │  │  │ PostgreSQL       │                           │   │   │
│  │  │  │ (container)      │                           │   │   │
│  │  │  │ puerto 5432      │  ← LOCAL, no publicado    │   │   │
│  │  │  │ NO exposición    │                           │   │   │
│  │  │  │ (muy seguro)     │                           │   │   │
│  │  │  └──────────────────┘                           │   │   │
│  │  │                                                  │   │   │
│  │  │  ┌──────────────────┐                           │   │   │
│  │  │  │ Redis            │                           │   │   │
│  │  │  │ (cache/sessions) │                           │   │   │
│  │  │  │ puerto 6379      │  ← LOCAL, no publicado    │   │   │
│  │  │  └──────────────────┘                           │   │   │
│  │  │                                                  │   │   │
│  │  └──────────────────────────────────────────────────┘   │   │
│  │                                                            │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                      │
│  OPCIÓN A: BD Gestionada (Recomendada)                             │
│  ──────────────────────────────────────                            │
│  Backend conecta a Supabase/AWS RDS via SSL                        │
│  (Ver Diagrama 5 arriba)                                           │
│                                                                      │
│  OPCIÓN B: BD Autoconfigurable                                     │
│  ─────────────────────────────                                     │
│  Si necesitas múltiples BDs:                                       │
│                                                                      │
│  ┌──────────────────────────────────────────────────────┐          │
│  │ Servidor Secundario (Replicación/Backup)            │          │
│  │                                                      │          │
│  │ ┌──────────────────┐   ┌──────────────────┐        │          │
│  │ │ PostgreSQL       │   │ MongoDB Replica  │        │          │
│  │ │ (backup)         │   │ Set              │        │          │
│  │ │                  │   │                  │        │          │
│  │ └──────────────────┘   └──────────────────┘        │          │
│  │                                                      │          │
│  │ Sincronización entre servidores vía VPN/Private    │          │
│  │ Network                                              │          │
│  └──────────────────────────────────────────────────────┘          │
│                                                                      │
└──────────────────────────────────────────────────────────────────────┘

FLUJO DE USUARIO:

1. Usuario abre: https://52.14.20.50
   └─ Nginx (puerto 443) recibe
   └─ Redirecciona a Backend (puerto 8000, local)
   └─ Backend sirve Frontend Angular

2. Usuario crea tabla de datos
   └─ Frontend llama: POST /api/generation/execute
   └─ Backend recibe y procesa
   └─ Backend conecta a PostgreSQL (container local)
   └─ Datos se guardan

3. Backend necesita BD externa (opcional)
   └─ Conecta a Supabase vía SSL/TLS (cifrado)
   └─ Lee schema de usuario
   └─ Devuelve al Frontend

VENTAJAS:
✓ Bases de datos NO expuestas a internet
✓ Solo Backend accede a BDs (desde red Docker)
✓ Usuarios solo ven API REST del Backend
✓ Comunicación encriptada (SSL entre tiers)
✓ Fácil de escalar (agregar más contenedores)
✓ Fácil de respaldar (volúmenes Docker persistidos)
```

---

## 📊 Diagrama 9: Flujo de Encriptación de Contraseñas

```
┌─────────────────────────────────────────────────────────────┐
│         FORMULARIO DE CONEXIÓN                             │
│                                                             │
│  Usuario ingresa:                                           │
│  ┌────────────────────────────────────────────────────┐   │
│  │ Contraseña: MyPassword123!                         │   │
│  └────────────────────────────────────────────────────┘   │
│                   ↓                                         │
└───────────────────┼─────────────────────────────────────────┘
                    │
                    ↓ Se envía al Backend (puede ser HTTPS)
┌─────────────────────────────────────────────────────────────┐
│    BACKEND RECIBE LA CONTRASEÑA (core/encryption.py)        │
│                                                             │
│  from cryptography.fernet import Fernet                    │
│  from hashlib import sha256                               │
│                                                             │
│  1. Genera clave desde settings.secret_key:                │
│     secret_key = "mi-clave-super-secreta"                 │
│     hash = sha256(secret_key.encode()).digest()           │
│     cipher = Fernet(base64(hash))                         │
│                                                             │
│  2. Encripta contraseña:                                   │
│     password = "MyPassword123!"                            │
│     encrypted = cipher.encrypt(password.encode())         │
│     resultado: b'gAAAAABlnF3K...'                         │
│                                                             │
│  3. Guarda en BD:                                          │
│     INSERT INTO connections (encrypted_password)          │
│     VALUES ('gAAAAABlnF3K...')                            │
│                                                             │
└─────────────────────────────────────────────────────────────┘
                    ↓
          Base de datos PostgreSQL
          (smartgen_db en servidor)

═════════════════════════════════════════════════════════════

FLUJO INVERSO: Cuando necesita conectar

┌─────────────────────────────────────────────────────────────┐
│  USUARIO HACE CLIC EN "ANALIZAR SCHEMA"                    │
│                                                             │
│  API: GET /connections/{id}/analyze                        │
│       ↓                                                     │
│  Backend obtiene registro de BD:                           │
│  SELECT encrypted_password FROM connections WHERE id=...  │
│  resultado: 'gAAAAABlnF3K...'                             │
│       ↓                                                     │
│  connection_service.py desencripta:                        │
│  from core.encryption import decrypt_password              │
│  password = cipher.decrypt(encrypted_password)             │
│  resultado: b'MyPassword123!'                             │
│       ↓                                                     │
│  Factory crea conector con password:                       │
│  PostgreSQLConnector(config, password='MyPassword123!')   │
│       ↓                                                     │
│  Conector conecta a BD remota usando password              │
│  psycopg2.connect(..., password='MyPassword123!')         │
│       ↓                                                     │
│  ✓ Conexión exitosa, analiza schema                       │
│                                                             │
└─────────────────────────────────────────────────────────────┘

SEGURIDAD:
✓ Contraseña se encripta antes de guardarse
✓ Solo desencripta en memoria cuando es necesaria
✓ Nunca viaja en logs o backups sin encriptar
✓ Si alguien obtiene BD, las contraseñas no son útiles
  (están encriptadas con tu secret_key único)

POTENCIAL DEBILIDAD:
⚠️ El secret_key está en .env local
   Si server es comprometido y .env es leído,
   todas las contraseñas pueden ser desencriptadas
   
SOLUCIÓN: Usar Key Management Service (AWS KMS, Azure Key Vault, etc.)
```

---

**Última actualización:** Mayo 2026
