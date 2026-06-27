# Guía Especial: VPS + SQL Server en tu PC Local

## 🎯 Tu Escenario

```
Tu PC (En casa)
├── SQL Server Express
│   └── Base de datos: testdb
│   └── Puerto: 1433
│   └── Usuario: sa
│   └── Contraseña: TuPassword123!
│
Tu VPS (en Internet, por ejemplo DigitalOcean, AWS, etc.)
├── Backend DataGenerator
│   └── Desplegado con Docker
│   └── Accesible en: https://tudominio.com
│   └── Quiere conectarse a → tu BD local
```

**El problema:** La BD local tiene IP privada (192.168.x.x) que NO es alcanzable desde internet.

---

## ❌ Solución Naïve (NO FUNCIONA)

```yaml
Motor: SQL Server
Host: 192.168.1.100        # Tu IP privada local
Puerto: 1433
Usuario: sa
Contraseña: TuPassword123!
Base de datos: testdb
```

**Resultado:**
```
Conexión desde VPS a 192.168.1.100
↓
✗ "No route to host" 
  o
✗ "Connection timeout"

Razón: 192.168.1.100 es privada, solo existe en tu red local
       VPS está en otra red (internet)
       No hay ruta entre ellas
```

---

## ✅ Soluciones Viables

### Opción 1: Port Forwarding en tu Router (⚠️ Posible pero INSEGURO)

**Cómo funciona:**

```
Tu PC (192.168.1.100:1433)
         ↓ (red privada)
Tu Router
         ↓ (mapea puerto)
Internet (Tu IP pública: 203.45.67.89:15433)
         ↓
VPS recibe conexión
```

**Pasos:**

1. **Obtén tu IP pública:**
   ```bash
   # En tu PC, en PowerShell:
   (Invoke-WebRequest -Uri "https://api.ipify.org?format=text").Content
   
   # O simplemente visita: https://www.cualesmiip.com
   # Resultado: 203.45.67.89
   ```

2. **Configura port-forwarding en tu router:**
   - Accede a: http://192.168.1.1 (tu router)
   - Usuario/contraseña: admin/admin (por defecto)
   - Busca: Port Forwarding o Reenvío de Puertos
   - Configura:
     ```
     Tráfico entrante:  203.45.67.89:15433 (puerto público diferente)
     Reenvía a:         192.168.1.100:1433 (tu PC, puerto SQL Server)
     Protocolo: TCP
     ```

3. **Llena el formulario en tu VPS:**
   ```yaml
   Motor: SQL Server
   Host: 203.45.67.89         # Tu IP pública
   Puerto: 15433              # Puerto mapeado en router
   Usuario: sa
   Contraseña: TuPassword123!
   Base de datos: testdb
   Parámetros extra: {
     "TrustServerCertificate": "yes"
   }
   ```

4. **Prueba:**
   ```bash
   # Desde tu VPS:
   sqlcmd -S 203.45.67.89,15433 -U sa -P TuPassword123! -d testdb
   ```

**⚠️ PROBLEMAS:**

- ❌ **Tu IP pública cambia periódicamente** (según tu ISP)
  - Solución: Usa DDNS (Dynamic DNS)
  
- ❌ **Muy inseguro**
  - SQL Server expuesto directamente a internet
  - Hackers pueden atacar el puerto
  - Solución: Firewall restrictivo + VPN

- ❌ **No funciona si cambias de PC o red**
  - El port-forwarding apunta a una IP específica
  
- ⚠️ **SQL Server no es fácil de securizar en internet**
  - Sin SSL/TLS nativo en SQL Server Express
  - Contraseñas viajan en texto plano

---

### Opción 2: VPN Entre tu PC y VPS (✅ RECOMENDADA)

**Idea:** Conecta tu PC a la VPS mediante VPN, para que ambos estén en la misma red privada.

```
Tu PC (192.168.1.100)
         ↓ VPN Tunnel
Tu VPS (10.0.0.1)
         ↓
Ambos en red privada 10.0.0.0/24
↓
BD local alcanzable desde VPS
```

**Implementación fácil con Wireguard:**

1. **En la VPS, instala Wireguard:**
   ```bash
   # Ubuntu/Debian
   sudo apt install wireguard wireguard-tools
   
   # Genera keys
   wg genkey | tee privatekey | wg pubkey > publickey
   ```

2. **Configura Wireguard en VPS:**
   ```
   /etc/wireguard/wg0.conf
   
   [Interface]
   Address = 10.0.0.1/24
   ListenPort = 51820
   PrivateKey = [tu clave privada]
   
   [Peer]
   PublicKey = [clave pública de tu PC]
   AllowedIPs = 10.0.0.2/32
   ```

3. **Configura Wireguard en tu PC:**
   - Descarga: https://www.wireguard.com/install/
   - Crea configuración:
     ```
     [Interface]
     Address = 10.0.0.2/24
     PrivateKey = [tu clave privada]
     DNS = 8.8.8.8
     
     [Peer]
     PublicKey = [clave pública de VPS]
     Endpoint = tudominio.com:51820
     AllowedIPs = 10.0.0.0/24
     ```
   - Conecta

4. **Ahora en la VPS, SQL Server es accesible:**
   ```yaml
   Motor: SQL Server
   Host: 10.0.0.2          # Tu PC dentro de VPN
   Puerto: 1433
   Usuario: sa
   Contraseña: TuPassword123!
   Base de datos: testdb
   Parámetros extra: {
     "TrustServerCertificate": "yes"
   }
   ```

**Ventajas:**
- ✅ Seguro (encriptado)
- ✅ Rápido (conexión directa)
- ✅ No expone a internet
- ✅ Funciona incluso si IP cambia (conexión VPN persistente)

---

### Opción 3: Mover BD a la Nube (✅ LA MEJOR PARA PRODUCCIÓN)

**Idea:** Usa SQL Server en la nube en lugar de tu PC local.

```
Tu PC (desarrollo)
     ↓
Azure SQL Database
     ↓
Tu VPS (producción)
```

**Proveedores:**

- **Azure SQL Database** (Microsoft)
- **AWS RDS SQL Server**
- **DigitalOcean Managed Databases** (si soporta)
- **Heroku**

**Configuración ejemplo (Azure SQL):**

1. **Crea DB en Azure:**
   - Portal: https://portal.azure.com
   - SQL databases → Create
   - Resultado: `myserver.database.windows.net`

2. **Obtén credenciales:**
   - Usuario: adminuser
   - Contraseña: AzurePassword123!
   - Base datos: mydatabase

3. **Llena formulario en VPS:**
   ```yaml
   Motor: SQL Server
   Host: myserver.database.windows.net
   Puerto: 1433
   Usuario: adminuser
   Contraseña: AzurePassword123!
   Base de datos: mydatabase
   Parámetros extra: {
     "Encrypt": "yes",
     "TrustServerCertificate": "no"
   }
   ```

**Ventajas:**
- ✅ Seguro por defecto
- ✅ Escalable
- ✅ Backups automáticos
- ✅ No requiere VPN ni port-forwarding
- ✅ Funciona desde cualquier lugar
- ❌ Costo (pero hay opciones free tier)

---

### Opción 4: SSH Tunnel (✅ ALTERNATIVA SEGURA)

**Idea:** Usa SSH para crear un túnel seguro desde VPS a tu PC.

```
Tu VPS
  ↓ SSH al router/PC
  ↓ Túnel encriptado
Tu PC (SQL Server)
```

**Implementación:**

1. **En tu PC, activa SSH:**
   - Windows 10+: `Settings → Apps → Optional Features → OpenSSH Server`
   - O instala PuTTY SSH
   - Linux/Mac: SSH ya viene

2. **Desde VPS, crea túnel:**
   ```bash
   ssh -L 1433:127.0.0.1:1433 tu_usuario@tu_pc_ip
   
   # Esto redirige puerto 1433 de VPS → tu PC
   ```

3. **Llena formulario en VPS:**
   ```yaml
   Motor: SQL Server
   Host: localhost      # El túnel lo redirige a tu PC
   Puerto: 1433
   Usuario: sa
   Contraseña: TuPassword123!
   Base de datos: testdb
   ```

**Ventajas:**
- ✅ Seguro (encriptado con SSH)
- ✅ Sin software adicional (SSH incluido)
- ❌ Requiere credenciales SSH
- ❌ Más complejo de automatizar

---

## 📊 Tabla Comparativa de Soluciones

| Solución | Seguridad | Complejidad | Costo | Mantenimiento | Recomendado |
|----------|-----------|-------------|-------|---------------|------------|
| **Port Forwarding** | ❌ Baja | ⭐ Fácil | $0 | 🟠 Alto | ❌ No |
| **VPN (Wireguard)** | ✅ Alta | ⭐⭐ Medio | $0 | 🟢 Bajo | ✅ Sí |
| **Nube (Azure)** | ✅✅ Muy Alta | ⭐ Fácil | 💰 Pago | 🟢 Bajo | ✅✅ Mejor |
| **SSH Tunnel** | ✅ Alta | ⭐⭐⭐ Complejo | $0 | 🟠 Alto | ⭐ Alternativa |

---

## 🚀 Configuración Recomendada para ti

### Escenario A: Desarrollo + Testing en Local

**En tu PC:**
```yaml
Motor: SQL Server
Host: localhost
Puerto: 1433
Usuario: sa
Contraseña: TuPassword123!
Base de datos: testdb
Parámetros extra: {}
```

**Función:**
- Desarrollas y testeas localmente
- Sin conexión a internet
- Rápido

---

### Escenario B: BD Local, Backend en VPS

**Opción B1: Con VPN (RECOMENDADA)** ✅

```yaml
Motor: SQL Server
Host: 10.0.0.2        # Tu PC en VPN
Puerto: 1433
Usuario: sa
Contraseña: TuPassword123!
Base de datos: testdb
Parámetros extra: {
  "TrustServerCertificate": "yes"
}
```

**Pasos:**
1. Instala Wireguard en tu PC y VPS
2. Ambos conectan a VPN
3. Usa IP VPN (10.0.0.2) en lugar de IP local

---

**Opción B2: Con Port Forwarding** ⚠️ (Si no quieres VPN)

```yaml
Motor: SQL Server
Host: tuipubblica.com  # Tu IP pública
Puerto: 15433          # Puerto mapeado en router
Usuario: sa
Contraseña: TuPassword123!
Base de datos: testdb
Parámetros extra: {
  "TrustServerCertificate": "yes"
}
```

**Pasos:**
1. Obtén tu IP pública: https://www.cualesmiip.com
2. Configura port-forwarding en router: 15433 → 192.168.1.100:1433
3. Usa IP pública en formulario

**⚠️ ADVERTENCIAS:**
- Tu IP cambia → configura DDNS
- Muy inseguro → considera firewall
- SQL Server expuesto → usa contraseña fuerte

---

### Escenario C: BD en Nube (PRODUCCIÓN) ✅

```yaml
Motor: SQL Server
Host: myserver.database.windows.net  # Azure SQL
Puerto: 1433
Usuario: adminuser
Contraseña: CloudPassword123!
Base de datos: mydatabase
Parámetros extra: {
  "Encrypt": "yes",
  "TrustServerCertificate": "no"
}
```

**Ventajas:**
- Seguro
- Escalable
- Mismo desde cualquier lugar
- Backups automáticos

---

## 🔧 Instalación de SQL Server Express en tu PC

Si no lo tienes aún, aquí cómo instalarlo:

### Windows

1. **Descarga SQL Server Express:**
   https://www.microsoft.com/en-us/sql-server/sql-server-downloads

2. **Instala:**
   - Expressu → (acepta todo por defecto)
   - Instancia: SQLEXPRESS
   - Usuario: sa
   - Contraseña: TuPassword123!

3. **Verifica que escucha en puerto 1433:**
   ```powershell
   # PowerShell como Admin
   Get-Service MSSQL$SQLEXPRESS | Select Status
   
   # Resultado: Running
   ```

4. **Conecta de prueba:**
   ```powershell
   sqlcmd -S localhost -U sa -P TuPassword123!
   
   # Resultado:
   # 1>
   # EXIT
   ```

### Linux

```bash
# Ubuntu/Debian
sudo apt update
sudo apt install mssql-server

# Configura:
sudo /opt/mssql/bin/mssql-conf setup

# Selecciona:
# Edición: 3 (Express)
# Acepta licencia: Yes
# SA password: TuPassword123!

# Inicia servicio:
sudo systemctl start mssql-server
```

---

## 📋 Checklist: ¿Tu configuración es correcta?

### Para Local (tu PC)

- [ ] SQL Server está instalado y corriendo
- [ ] Puerto 1433 está escuchando
- [ ] Creaste usuario SA con contraseña
- [ ] Creaste base de datos (testdb)
- [ ] Puedes conectar localmente: `sqlcmd -S localhost -U sa`

### Para VPS + Port Forwarding

- [ ] Port-forwarding configurado en router
- [ ] Obtuviste IP pública correcta
- [ ] Puerto externo mapeado a 1433
- [ ] Firewall permite tráfico al puerto
- [ ] `TrustServerCertificate: "yes"` agregado

### Para VPS + VPN

- [ ] Wireguard instalado en VPS y PC
- [ ] Ambos conectados a VPN
- [ ] Puedes ping entre IPs VPN (10.0.0.1 ↔ 10.0.0.2)
- [ ] BD es accesible desde VPS via IP VPN

### Para VPS + Nube

- [ ] Base de datos creada en Azure/AWS/etc.
- [ ] Endpoint obtuviste (ej: myserver.database.windows.net)
- [ ] Usuario y contraseña son correctos
- [ ] Firewall de nube permite tu IP/VPS IP
- [ ] Puedes conectar: `sqlcmd -S endpoint -U user -P password`

---

## 🐛 Troubleshooting Específico para SQL Server

### Error: "Login failed for user 'sa'"

**Solución:**
```bash
# Verifica credenciales
sqlcmd -S localhost -U sa -P TuPassword123!

# Nota el @ si hay dominio:
sqlcmd -S localhost -U sa -P TuPassword123! -d master

# Si aún falla, resetea SA password:
# SQL Server Configuration Manager → Services
# Detén y reinicia MSSQL$SQLEXPRESS
```

---

### Error: "Cannot open database 'testdb'"

**Solución:**
```sql
-- Crea la BD primero
sqlcmd -S localhost -U sa -P TuPassword123! -Q "CREATE DATABASE testdb"

-- Verifica existe:
sqlcmd -S localhost -U sa -P TuPassword123! -Q "SELECT name FROM sys.databases"
```

---

### Error: "Network or instance-specific error"

**Causas y soluciones:**

1. **SQL Server no está corriendo:**
   ```powershell
   # Windows
   Get-Service MSSQL$SQLEXPRESS | Start-Service
   ```

2. **Puerto 1433 no está escuchando:**
   ```powershell
   netstat -an | find "1433"
   # Resultado: TCP    0.0.0.0:1433    0.0.0.0:0
   ```

3. **Firewall bloquea:**
   ```powershell
   # Abre puerto 1433 en Windows Defender Firewall
   New-NetFirewallRule -DisplayName "SQL Server" `
     -Direction Inbound -LocalPort 1433 -Protocol TCP -Action Allow
   ```

---

### Error: "A network-related or instance-specific error occurred"

**Solución:**
```bash
# Habilita TCP/IP en SQL Server
# SQL Server Configuration Manager
# → Protocols for SQLEXPRESS
# → TCP/IP → Enabled (debe estar en YES)
# → Reinicia SQL Server
```

---

## 📚 Documentación Oficial

- SQL Server Express: https://learn.microsoft.com/en-us/sql/sql-server/
- pyodbc: https://github.com/mkleehammer/pyodbc
- Wireguard: https://www.wireguard.com/
- Azure SQL Database: https://azure.microsoft.com/services/sql-database/

---

**Última actualización:** Mayo 2026  
**Para:** Usuarios con VPS + BD local  
**Recomendación:** Usa VPN (Opción 2) o Nube (Opción 3)
