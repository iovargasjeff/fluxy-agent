# Guía Rápida: Tabla de Decisión y Solución de Problemas

## 🚀 Árbol de Decisión: ¿Qué configuración usar?

```
¿Dónde está ejecutándose tu Backend?
│
├─ EN TU PC (localhost)
│  │
│  ├─ ¿Dónde está la BD?
│  │  ├─ En mi PC (XAMPP/instalación local)
  │  │  └─ ✅ USA: Host = localhost, Puerto = 5432/3306/27017/1433
│  │  │
│  │  ├─ En Docker en mi PC
│  │  │  ├─ ¿Accedo DESDE fuera del contenedor?
│  │  │  │  └─ ✅ USA: Host = localhost, Puerto = PUBLICADO (5433)
│  │  │  └─ ¿Accedo DESDE dentro del contenedor del backend?
│  │  │     └─ ✅ USA: Host = NOMBRE_SERVICIO, Puerto = INTERNO (5432)
│  │  │
│  │  └─ En un servidor remoto
│  │     ├─ ¿Es pública/DNS resuelve?
│  │     │  └─ ✅ USA: Host = dominio.com, Puerto = 5432
│  │     └─ ¿Es privada?
│  │        └─ ⚠️ POSIBLE (pero inseguro): Port-forwarding, luego Host = IP_publica:puerto_reenviado
│  │
│  └─ EN UN SERVIDOR REMOTO (Docker/VPS/AWS/Heroku)
│     │
│     ├─ ¿Dónde está la BD?
│     │  ├─ En OTRO contenedor en el MISMO servidor Docker
│     │  │  └─ ✅ USA: Host = NOMBRE_SERVICIO, Puerto = INTERNO (5432)
│     │  │     Ejemplo: "postgres_main", 5432
│     │  │
│     │  ├─ En la NUBE (Supabase/AWS RDS/MongoDB Atlas)
│     │  │  └─ ✅ USA: Host = DOMINIO_PUBLICO, Puerto = 5432
│     │  │     Ejemplo: "db.xyz.supabase.co", 5432
│     │  │     Agrega: {"sslmode": "require"}
│     │  │
│     │  ├─ En otro servidor remoto (diferente máquina)
│     │  │  ├─ ¿Es accesible públicamente?
│     │  │  │  └─ ✅ USA: Host = IP_publica_o_DNS, Puerto = 5432
│     │  │  └─ ¿Es privada?
│     │  │     └─ ❌ NO FUNCIONA (diferente red privada)
│     │  │        → Solución: Usar peering de red o tunneling VPN
│     │  │
│     │  └─ En tu PC local
│     │     └─ ❌ NO FUNCIONA (diferente red, IP privada no alcanzable)
│     │
│     └─ ⚠️ NUNCA confundas:
│        - Puerto PUBLICADO (del docker-compose: 5433)
│        - Puerto INTERNO (dentro del contenedor: 5432)
│        - Usa INTERNO dentro de Docker
│        - Usa PUBLICADO desde fuera
```

---

## 🔧 Tabla de Configuración por Escenario

| Escenario | Host | Puerto | Usuario | Base Datos | SSL | Notas |
|-----------|------|--------|---------|------------|-----|-------|
| **PostgreSQL local (PC)** | `localhost` | `5432` | `postgres` | `testdb` | No | Si XAMPP, puede ser 5433 |
| **MySQL local (PC)** | `localhost` | `3306` | `root` | `testdb` | No | XAMPP usa 3306 por defecto |
| **SQL Server local (PC)** | `localhost` | `1433` | `sa` | `testdb` | No | Express es gratis |
| **MongoDB local (PC)** | `localhost` | `27017` | - | `testdb` | No | Sin usuario si MongoDB local sin auth |
| **PostgreSQL Docker (desde PC)** | `localhost` | `5433` | `admin` | `smartgen_db` | No | Puerto PUBLICADO |
| **PostgreSQL Docker (desde Backend en Docker)** | `postgres_main` | `5432` | `admin` | `smartgen_db` | No | Puerto INTERNO |
| **Supabase PostgreSQL** | `db.xyz.supabase.co` | `5432` | `postgres` | `postgres` | **Sí** | SSL obligatorio |
| **AWS RDS PostgreSQL** | `mydb.xxx.rds.amazonaws.com` | `5432` | `admin` | `mydb` | **Sí** | Firewall: agrega IP del backend |
| **Azure SQL Database** | `server.database.windows.net` | `1433` | `admin` | `mydb` | **Sí** | Requiere parámetros SSL |
| **MongoDB Atlas** | `cluster0.mongodb.net` | `27017` | `admin_user` | `mydb` | **Sí** | Usa URI en parámetros extra |
| **Servidor remoto custom** | `52.14.20.50` | `5432` | `admin` | `testdb` | Depende | Verifica firewall + seguridad |

---

## ❌ Errores Comunes y Soluciones

### Error 1: "Connection refused" / "ECONNREFUSED"

**Causa más probable:** Host/Puerto incorrecto o servicio no está corriendo

**Solución:**
```bash
# 1. Verifica si el puerto está escuchando (en tu PC)
netstat -an | grep LISTEN | grep :5432

# 2. Si usas Docker, verifica si el contenedor está corriendo
docker ps | grep postgres

# 3. Si Docker no muestra el contenedor:
docker-compose up -d postgres_main

# 4. Si aun así falla, revisa los logs:
docker logs smartgen_postgres_main
```

**Checklist:**
- [ ] ¿El servicio de BD está realmente ejecutándose?
- [ ] ¿El puerto es el correcto? (5432 ≠ 5433)
- [ ] ¿Si es Docker, está corriendo `docker-compose up -d`?

---

### Error 2: "Name or service not known" / "No address associated with hostname"

**Causa:** Host no existe o no se puede resolver

**Solución si usas nombre de servicio Docker:**
```bash
# DENTRO del contenedor, el nombre del servicio debe ser conocido
# Si usas "postgres_main" pero el servicio se llama "postgres":
docker-compose logs  # Ver qué servicios hay

# Edita docker-compose.yml para que use el nombre correcto
# O cambia el host en el formulario al nombre correcto
```

**Solución si usas dominio:**
```bash
# En tu PC, verifica si el dominio se resuelve:
nslookup db.xyz.supabase.co

# Si no se resuelve:
# - Verifica conexión a internet
# - Verifica que sea el dominio correcto (copia del dashboard)
```

**Checklist:**
- [ ] ¿Deletraste mal el nombre del servicio? (`postgres_main` ≠ `postgres-main` ≠ `postgresql`)
- [ ] ¿Copiaste correctamente el dominio de Supabase/AWS?
- [ ] ¿Tienes conexión a internet?
- [ ] ¿Si es localhost, está definido en /etc/hosts?

---

### Error 3: "Authentication failed" / "Invalid user or password"

**Causa:** Usuario o contraseña incorrecta

**Solución:**
```bash
# 1. Verifica las credenciales en docker-compose.yml
grep -A 3 "POSTGRES_USER\|POSTGRES_PASSWORD" docker-compose.yml

# 2. Prueba la conexión directamente con psql:
psql -h localhost -p 5432 -U admin -W

# 3. Si es Supabase, copia exactamente del dashboard:
# Dashboard → Settings → Database → Connection String
```

**Checklist:**
- [ ] ¿Copiaste exactamente la contraseña (sin espacios)?
- [ ] ¿El usuario existe en la BD? (no es `root` si especificaste `admin`)
- [ ] ¿Has inicializado la BD después de cambiar credenciales?
- [ ] ¿El docker-compose tiene actualizado usuario/contraseña?

---

### Error 4: "Connection timeout" / "Unable to connect after 5 seconds"

**Causa:** Conexión muy lenta, puerto bloqueado o host lejano/inaccesible

**Soluciones por entorno:**

**Si es local:**
```bash
# Aumenta el timeout en parámetros extra:
{"connect_timeout": 10}

# O verifica firewall:
sudo ufw status  # Linux
# macOS: System Preferences → Security & Privacy → Firewall
```

**Si es servidor remoto:**
```bash
# Prueba si el puerto está abierto:
telnet 52.14.20.50 5432

# Si falla, verifica security group (AWS):
# EC2 → Security Groups → Edit inbound rules
# Debe permitir puerto 5432 desde tu IP

# O verifica firewall del servidor:
ssh user@52.14.20.50
sudo ufw status
sudo ufw allow 5432/tcp
```

**Checklist:**
- [ ] ¿La red está funcionando? (`ping google.com` funciona?)
- [ ] ¿El servidor está arriba y corriendo?
- [ ] ¿Firewall permite conexiones al puerto?
- [ ] ¿Security group (AWS) permite inbound?
- [ ] ¿La ruta de red es válida (no hay proxy bloqueando)?

---

### Error 5: "SSL error: certificate_verify_failed"

**Causa:** BD requiere SSL pero no lo configuraste

**Solución:**
```json
// En "Parámetros Extra" del formulario, agrega:
{
  "sslmode": "require"
}

// Para AWS RDS, también puede ser:
{
  "sslmode": "verify-ca",
  "sslrootcert": "/path/to/ca-bundle.pem"
}
```

**Checklist:**
- [ ] ¿Es Supabase/AWS RDS? Estos requieren SSL
- [ ] ¿Agregaste `"sslmode": "require"`?
- [ ] ¿Si requiere CA, descargaste el certificado?

---

## 📋 Checklist Pre-Despliegue

Antes de desplegar a producción, verifica:

### Configuración de Host/Puerto
- [ ] Backend y BD están en el mismo servidor o red
- [ ] Si están en docker-compose, usan nombre del servicio (no localhost)
- [ ] Si están en servidores diferentes, BD tiene DNS público
- [ ] Puerto de BD no está bloqueado por firewall
- [ ] Security groups permiten conexión desde backend

### Credenciales
- [ ] Usuario/contraseña son correctos
- [ ] Base de datos existe
- [ ] Usuario tiene permisos para la BD

### Red y Seguridad
- [ ] BD no está publicada innecesariamente (solo para producción)
- [ ] SSL está habilitado si cruzas internet
- [ ] Firewall solo permite conexiones desde backend
- [ ] Backups están configurados

### Pruebas
- [ ] Conexión funciona desde backend
- [ ] Schema análisis funciona
- [ ] Insert de datos funciona
- [ ] Puedes conectarte con 2-3 BDs diferentes

---

## 🎯 Matriz Rápida de Diagnóstico

**¿Funciona en local pero no en producción?**

| Checklist | Local | Producción | Acción |
|-----------|-------|-----------|--------|
| BD está en Docker | ✓ | ? | En prod, ¿está en docker-compose? |
| Puerto es el correcto | ✓ | ? | ¿Confundiste publicado (5433) vs interno (5432)? |
| BD es accesible | ✓ | ? | En prod, BD debe estar en nube O en mismo docker |
| Firewall permite | ✓ | ? | En prod, ¿security group permite puerto? |
| SSL funciona | ✓ | ? | En prod, ¿agregaste {"sslmode": "require"}? |

**Solución típica:** Cambiar Host de `localhost` a nombre del servicio o dominio público

---

## 📚 Referencias

### Documentación Oficial
- PostgreSQL: https://www.postgresql.org/docs/
- MySQL: https://dev.mysql.com/doc/
- SQL Server: https://learn.microsoft.com/en-us/sql/
- MongoDB: https://docs.mongodb.com/
- Supabase: https://supabase.com/docs/guides/database/connecting-to-postgres
- Azure SQL: https://learn.microsoft.com/en-us/azure/azure-sql/

### En este Proyecto
- Conectores: `backend/connectors/`
- Configuración: `backend/core/config.py`
- Orquestación: `docker-compose.yml`
- API: `backend/api/connection_router.py`

### Herramientas Útiles
```bash
# Verifica conectividad de puerto
telnet hostname puerto

# Cliente CLI para PostgreSQL
psql -h HOST -p PUERTO -U USUARIO -d BASE_DATOS

# Cliente CLI para MySQL
mysql -h HOST -u USUARIO -p BASE_DATOS

# MongoDB shell
mongosh "mongodb://HOST:PUERTO"

# Verifica qué está escuchando en un puerto
lsof -i :5432  # macOS/Linux
netstat -ano | findstr :5432  # Windows

# Dentro de Docker, verifica conectividad
docker exec CONTAINER_NAME ping postgres_main
```

---

**Última actualización:** Mayo 2026
