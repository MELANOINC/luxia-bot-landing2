# 🚀 DEPLOY AUTOMÁTICO A VPS - GUÍA EJECUTIVA

## 📋 RESUMEN EJECUTIVO

Este workflow automatiza completamente el despliegue de **Luxia Bot Landing** a cualquier servidor VPS (Hostinger, DigitalOcean, AWS EC2, etc.) usando Docker y GitHub Actions.

### ✅ LO QUE SE AUTOMATIZA:
- ✅ Construcción de imagen Docker multi-arquitectura
- ✅ Push automático a DockerHub
- ✅ Despliegue a servidor VPS via SSH
- ✅ Health checks y verificación de estado
- ✅ Rollback automático en caso de fallo
- ✅ Limpieza del sistema post-despliegue

---

## 🎯 CONFIGURACIÓN INICIAL (Una sola vez)

### **1. Secrets de GitHub (OBLIGATORIO)**

Ve a **Settings → Secrets and variables → Actions** de tu repositorio y agrega:

```bash
DOCKERHUB_USERNAME=tu_usuario_dockerhub
DOCKERHUB_TOKEN=tu_token_dockerhub
SERVER_HOST=tu_ip_o_dominio_vps
SERVER_USER=root  # o ubuntu, depende del VPS
SERVER_SSH_KEY=tu_clave_privada_ssh
```

### **2. Preparación del VPS**

**Hostinger VPS:**
```bash
# Conectar por SSH
ssh root@tu_hostinger_ip

# Instalar Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Configurar firewall
ufw allow 80/tcp
ufw allow 443/tcp
ufw allow 22/tcp
ufw --force enable
```

**DigitalOcean Droplet:**
```bash
# Conectar por SSH
ssh root@tu_droplet_ip

# Docker ya suele estar instalado, si no:
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Configurar firewall
ufw allow 80/tcp
ufw allow 443/tcp
ufw allow 22/tcp
ufw --force enable
```

---

## 🚀 CÓMO FUNCIONA EL DESPLIEGUE

### **Automático en cada Push a `main`:**
1. GitHub detecta cambios en rama `main`
2. Se construye imagen Docker optimizada
3. Se sube a DockerHub automáticamente
4. Se conecta a tu VPS via SSH
5. Descarga la nueva imagen
6. Detiene versión anterior (con backup)
7. Inicia nueva versión
8. Verifica que funcione correctamente
9. Limpia archivos temporales

### **Manual cuando necesites:**
1. Ve a **Actions → 🚀 CI/CD Docker - Despliegue Automático a VPS**
2. Click **Run workflow**
3. Selecciona entorno (production/staging)
4. Click **Run workflow**
5. ¡Espera 3-5 minutos y listo!

---

## 🔍 MONITOREO Y VERIFICACIÓN

### **Verificar que funciona:**
```bash
# Verificar aplicación online
curl -I http://TU_IP_VPS

# Ver logs de la aplicación
ssh root@TU_IP_VPS "docker logs luxia-bot-landing2"

# Verificar health check
ssh root@TU_IP_VPS "docker exec luxia-bot-landing2 curl -f http://localhost:3000/health"
```

### **Estado del contenedor:**
```bash
ssh root@TU_IP_VPS "docker ps"
```

---

## 🆘 SOLUCIÓN DE PROBLEMAS

### **❌ Error: "Connection refused"**
- Verificar que tu VPS tiene puerto 80 abierto
- Confirmar IP correcta en secrets
- Revisar que Docker esté instalado

### **❌ Error: "SSH authentication failed"**
- Verificar clave SSH privada en secrets
- Confirmar usuario correcto (root/ubuntu)
- Probar conexión manual: `ssh root@TU_IP`

### **❌ Error: "Health check failed"**
- Ver logs: `docker logs luxia-bot-landing2`
- Verificar puerto 3000 disponible en contenedor
- Revisar que la aplicación inicie correctamente

### **🔄 Rollback manual si algo falla:**
```bash
ssh root@TU_IP_VPS
docker ps -a  # Ver contenedores
docker stop luxia-bot-landing2
docker rm luxia-bot-landing2
docker images | grep backup  # Ver backups disponibles
docker run -d --name luxia-bot-landing2 --restart unless-stopped -p 80:3000 IMAGEN_BACKUP
```

---

## 💰 COSTOS Y RECOMENDACIONES

### **VPS Recomendados:**

| Proveedor | Plan | Costo/mes | Specs | Ideal para |
|-----------|------|-----------|-------|------------|
| **Hostinger** | VPS 1 | $3.95 | 1 CPU, 4GB RAM | Testing/Staging |
| **Hostinger** | VPS 2 | $8.95 | 2 CPU, 8GB RAM | Producción |
| **DigitalOcean** | Basic | $6 | 1 CPU, 1GB RAM | Testing |
| **DigitalOcean** | Basic | $12 | 1 CPU, 2GB RAM | Producción |

### **Configuración Recomendada Producción:**
- ✅ **CPU:** Mínimo 1 core, recomendado 2 cores
- ✅ **RAM:** Mínimo 2GB, recomendado 4GB
- ✅ **Storage:** Mínimo 20GB SSD
- ✅ **Bandwidth:** Mínimo 1TB/mes

---

## 🎯 BENEFICIOS EJECUTIVOS

### **⚡ Velocidad:**
- **Deploy manual anterior:** 30-60 minutos
- **Deploy automático ahora:** 3-5 minutos
- **Rollback:** 1-2 minutos

### **🛡️ Seguridad:**
- Health checks automáticos
- Backups antes de cada deploy
- Rollback automático en fallos
- Limpieza de sistema automatizada

### **💼 Profesionalismo:**
- Zero downtime deployments
- Monitoreo continuo
- Logs estructurados
- Compatibilidad multi-VPS

---

## 📞 SOPORTE RÁPIDO

**Si tienes problemas:**
1. ✅ Revisar Actions tab en GitHub para logs detallados
2. ✅ Verificar que todos los secrets estén configurados
3. ✅ Probar conexión SSH manual a tu VPS
4. ✅ Verificar que Docker esté corriendo: `docker --version`

**¡Tu CRM inmobiliario se despliega automáticamente en cada cambio!** 🎉

---

*Workflow optimizado para VPS estándar: Hostinger, DigitalOcean, AWS EC2, Vultr, Linode, etc.*