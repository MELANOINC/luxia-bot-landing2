# 🚀 Workflow CI/CD Docker + Deploy VPS - Guía de Configuración

## 📋 Descripción General

Este workflow automatiza completamente el proceso de build, push y deployment de la aplicación **Luxia Bot Landing2** a un VPS (Hostinger, DigitalOcean, etc.) utilizando Docker y GitHub Actions.

## ✨ Características

- ✅ **Build automatizado** de imagen Docker multi-arquitectura (AMD64/ARM64)
- ✅ **Push automático** a DockerHub con cache optimizado
- ✅ **Deploy inmediato** vía SSH a VPS Linux
- ✅ **Health checks** automatizados post-deployment
- ✅ **Rollback automático** en caso de fallos
- ✅ **Limpieza automática** de imágenes antiguas
- ✅ **Notificaciones** de estado del deployment
- ✅ **Pruebas post-deployment** automatizadas

## 🔧 Configuración de Secrets

Para que el workflow funcione correctamente, configura los siguientes secrets en tu repositorio GitHub:

### Secrets de DockerHub
```
DOCKERHUB_USERNAME=tu_usuario_dockerhub
DOCKERHUB_TOKEN=tu_token_de_acceso_dockerhub
```

### Secrets del VPS
```
SERVER_HOST=tu_servidor.com (o IP del VPS)
SERVER_USER=root (o tu usuario SSH)
SERVER_SSH_KEY=-----BEGIN PRIVATE KEY----- (tu clave SSH privada)
SERVER_PORT=22 (opcional, por defecto 22)
```

## 🖥️ Preparación del VPS

### 1. Instalar Docker en el VPS

**Ubuntu/Debian:**
```bash
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER
```

**CentOS/RHEL:**
```bash
sudo yum install -y docker
sudo systemctl start docker
sudo systemctl enable docker
sudo usermod -aG docker $USER
```

### 2. Configurar SSH Key

```bash
# En tu máquina local, generar SSH key si no tienes una
ssh-keygen -t rsa -b 4096 -C "deployment@luxia-bot"

# Copiar la clave pública al VPS
ssh-copy-id usuario@tu_servidor.com

# Copiar la clave PRIVADA al secret SERVER_SSH_KEY en GitHub
cat ~/.ssh/id_rsa
```

### 3. Configurar Firewall (opcional pero recomendado)

```bash
# Ubuntu/Debian
sudo ufw allow 22
sudo ufw allow 80
sudo ufw allow 443
sudo ufw enable

# CentOS/RHEL
sudo firewall-cmd --permanent --add-port=22/tcp
sudo firewall-cmd --permanent --add-port=80/tcp
sudo firewall-cmd --permanent --add-port=443/tcp
sudo firewall-cmd --reload
```

## 🚀 Uso del Workflow

### Deployment Automático
El workflow se ejecuta automáticamente cuando:
- ✅ Se hace push a la rama `main`
- ✅ Se crea un Pull Request hacia `main`

### Deployment Manual
También puedes ejecutar el workflow manualmente:
1. Ve a **Actions** en tu repositorio GitHub
2. Selecciona **🚀 CI/CD Docker + Deploy VPS (Producción)**
3. Haz clic en **Run workflow**
4. Selecciona el entorno (production/staging)

## 📊 Variables de Entorno del Workflow

El workflow utiliza las siguientes variables estandarizadas:

```yaml
DOCKER_IMAGE_NAME: ${{ secrets.DOCKERHUB_USERNAME }}/luxia-bot-landing2
DOCKER_TAG: latest
CONTAINER_NAME: luxia-bot-landing2
APP_PORT: 3000
HOST_PORT: 80
```

## 🔄 Proceso de Deployment

1. **🏗️ Build & Push Docker Image**
   - Checkout del código
   - Setup de Docker Buildx
   - Login a DockerHub
   - Build multi-arquitectura con cache
   - Push a DockerHub

2. **🌐 Deploy a VPS**
   - Conexión SSH al VPS
   - Pull de la nueva imagen
   - Backup del contenedor actual
   - Stop y remove del contenedor existente
   - Inicio del nuevo contenedor
   - Health checks automatizados
   - Rollback automático si falla

3. **🧪 Pruebas Post-Deployment**
   - Verificación de endpoints
   - Pruebas de conectividad
   - Generación de reportes

## 🛡️ Características de Seguridad

- ✅ **Health checks** con timeouts configurables
- ✅ **Rollback automático** en caso de fallos
- ✅ **Backup automático** del contenedor anterior
- ✅ **Validaciones** de Docker y conectividad
- ✅ **Limpieza automática** de recursos

## 📈 Monitoreo y Logs

### Ver logs del contenedor:
```bash
docker logs luxia-bot-landing2 -f
```

### Ver estado del contenedor:
```bash
docker ps -f name=luxia-bot-landing2
```

### Ver estadísticas de recursos:
```bash
docker stats luxia-bot-landing2
```

## 🐛 Troubleshooting

### Error: No se puede conectar al VPS
```bash
# Verificar conectividad SSH
ssh -i ~/.ssh/id_rsa usuario@servidor.com

# Verificar que Docker esté corriendo
sudo systemctl status docker
```

### Error: Imagen no se puede descargar
```bash
# Verificar login en DockerHub
docker login

# Verificar que la imagen existe
docker pull usuario/luxia-bot-landing2:latest
```

### Error: Puerto ocupado
```bash
# Ver qué proceso usa el puerto 80
sudo lsof -i :80

# Detener el proceso si es necesario
sudo kill -9 <PID>
```

## 🎯 Configuración para Diferentes Proveedores

### Hostinger VPS
- Puerto SSH: `22`
- Usuario: `root`
- Configuración estándar

### DigitalOcean Droplet
- Puerto SSH: `22`
- Usuario: `root` o usuario creado
- Firewall: Configurar en panel de control

### AWS EC2
- Puerto SSH: `22`
- Usuario: `ubuntu` (Ubuntu AMI) o `ec2-user` (Amazon Linux)
- Security Groups: Abrir puertos 22, 80, 443

### Google Cloud Compute Engine
- Puerto SSH: `22`
- Usuario: Configurado en metadata
- Firewall: Configurar en VPC

## 📞 Soporte

Para issues o dudas sobre el workflow:
1. Revisar los logs en GitHub Actions
2. Verificar la configuración de secrets
3. Comprobar conectividad SSH al VPS
4. Verificar que Docker esté instalado y corriendo

---

**🎉 ¡Tu aplicación estará disponible en `http://TU_SERVIDOR.com` una vez completado el deployment!**