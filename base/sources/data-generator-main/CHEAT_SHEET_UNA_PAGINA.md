# 🎯 Cheat Sheet: Conexiones a Bases de Datos (Una Página)

## Regla de Oro
**Backend solo se conecta a lo que PUEDA ALCANZAR desde su ubicación de red**

---

## ¿Dónde estoy? → ¿Configuración correcta?

```
LOCAL (PC):
  localhost:5432 ✅ Funciona | No necesita internet

DOCKER LOCAL:
  postgres_main:5432 ✅ (desde dentro)
  localhost:5433 ✅ (desde PC - puerto publicado)

SERVIDOR REMOTO → BD REMOTA:
  db.supabase.co:5432 ✅ SSL requerido
  mydb.rds.amazonaws.com:5432 ✅ SSL requerido
  
SERVIDOR REMOTO → BD LOCAL (tu PC):
  192.168.1.100:5432 ❌ NO FUNCIONA
  (IP privada no alcanzable)
```

---

## Llenar el Formulario: 5 Casos

### 1. PostgreSQL en Tu PC
```
Host: localhost
Puerto: 5432
Usuario: postgres
Contraseña: tu_password
BD: testdb
SSL: No
```

### 2. MySQL en XAMPP
```
Host: localhost
Puerto: 3306
Usuario: root
Contraseña: (vacío)
BD: testdb
SSL: No
```

### 2B. SQL Server Local (Windows/Linux)
```
Host: localhost
Puerto: 1433
Usuario: sa
Contraseña: tu_password_sa
BD: testdb
SSL: No
```

### 3. PostgreSQL en Docker Local
```
Host: postgres_main (desde dentro)
      localhost (desde tu PC)
Puerto: 5432 (desde dentro)
        5433 (desde tu PC)
Usuario: admin
Contraseña: admin123
BD: smartgen_db
SSL: No
```

### 4. Supabase/AWS RDS
```
Host: db.xyz.supabase.co
      mydb.rds.amazonaws.com
Puerto: 5432
Usuario: postgres / admin
Contraseña: (del dashboard)
BD: postgres / mydb
SSL: {"sslmode": "require"}
```

### 4B. Azure SQL Server
```
Host: server.database.windows.net
Puerto: 1433
Usuario: azureadmin
Contraseña: (del portal)
BD: mydb
SSL: {"Encrypt": "yes", "TrustServerCertificate": "no"}
```

### 5. MongoDB Atlas
```
Opción A (recomendado):
Parámetros: {"uri": "mongodb+srv://user:pwd@cluster0..."}

Opción B:
Host: cluster0.mongodb.net
Puerto: 27017
Usuario: admin
Contraseña: password
BD: mydb
SSL: {"ssl": true}
```

---

## Troubleshooting Rápido

| Error | Solución |
|-------|----------|
| "Connection refused" | ¿Servicio corriendo? `docker ps` |
| "Name not known" | ¿Host correcto? Copia del dashboard |
| "Auth failed" | ¿Usuario/pass correctos? |
| "Connection timeout" | ¿Firewall abierto? ¿SSL requerido? |
| "No route to host" | ¿BD es IP privada? Mueve a nube |

---

## Comandos de Validación

```bash
# PostgreSQL
psql -h host -p puerto -U usuario -d base_datos

# MySQL
mysql -h host -p puerto -u usuario -p base_datos

# SQL Server (desde Windows)
sqlcmd -S host,puerto -U usuario -P contraseña

# MongoDB
mongosh "mongodb://host:puerto"

# Docker - dentro del contenedor
docker exec smartgen_backend psql -h postgres_main -U admin
```

---

## Checklist: ¿Por qué no funciona?

- [ ] ¿Host es correcto? (especialmente si es IP)
- [ ] ¿Puerto es correcto? (5432 ≠ 5433)
- [ ] ¿Usuario/contraseña exacto?
- [ ] ¿BD existe?
- [ ] ¿Servicio está corriendo?
- [ ] ¿Firewall permite?
- [ ] ¿Si es nube, necesita SSL?
- [ ] ¿Si es Docker, uso nombre servicio o puerto?

---

## Matriz Rápida

| Ubicación Backend | Ubicación BD | ¿Funciona? |
|------------------|-------------|-----------|
| PC local | PC local | ✅ |
| PC local | Docker PC | ✅ |
| PC local | Supabase/AWS/Azure | ✅ |
| Docker PC | Otro contenedor | ✅ |
| Docker PC | Supabase/AWS/Azure | ✅ |
| Servidor remoto | Docker servidor | ✅ |
| Servidor remoto | Supabase/AWS/Azure | ✅ |
| Servidor remoto | BD PC local | ❌ |
| Servidor A | BD Servidor B | ❌* |

*Funciona si tiene IP pública o VPN

---

## Reglas Clave

1. **localhost = Solo tu máquina**
   - No funciona desde otro servidor

2. **Nombres DNS resuelven en su contexto**
   - Dentro Docker: usar nombre del servicio
   - Fuera Docker: usar localhost o IP

3. **Puertos publicados solo para acceso externo**
   - Interno (5432) para inter-contenedor
   - Publicado (5433) para desde tu PC

4. **SSL obligatorio si cruzas internet**
   - Supabase: sí
   - AWS RDS: sí
   - MongoDB Atlas: sí

5. **IP privada nunca es alcanzable de fuera**
   - 192.168.x.x: solo local
   - 10.x.x.x: solo local
   - Solución: Nube o VPN

---

## Mejores Prácticas

✅ Desarrollo: localhost, sin SSL
✅ Testing: Docker local, volúmenes persistidos
✅ Producción: BD en nube O mismo servidor Docker, SSL obligatorio
❌ NUNCA exponer BD directamente a internet
❌ NUNCA usar IP privada desde servidor remoto

---

## Una Línea por Caso

**Local:** `localhost:5432` (usuario, password simple)
**Docker:** `postgres_main:5432` (desde dentro) o `localhost:5433` (desde PC)
**Nube:** `db.cloud.com:5432` + `{"sslmode":"require"}`

---

## Documentación Completa

- **RESUMEN_EJECUTIVO.md** - Respuestas directas (5 min)
- **GUIA_COMPORTAMIENTO_CONEXIONES.md** - Conceptos profundos (20 min)
- **GUIA_REFERENCIA_RAPIDA.md** - Árbol decisión + errores (consulta)
- **GUIA_EJEMPLOS_PASO_A_PASO.md** - 7 ejemplos reales (hands-on)
- **GUIA_DIAGRAMAS_TOPOLOGIA.md** - 9 diagramas de red (visual)
- **INDICE_MAESTRO.md** - Navegación (este archivo)

**Comienza por:** RESUMEN_EJECUTIVO.md

---

**Imprime esto y tenlo a mano mientras configuras conexiones** 📋
