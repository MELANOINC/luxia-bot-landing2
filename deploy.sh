#!/bin/sh
set -e

# 🚀 Deploy Script - Luxia Bot Landing (Compatible con VPS estándar)
# Optimizado para Hostinger, DigitalOcean y similares

echo "🚀 Iniciando despliegue de Luxia Bot Landing..."

# Variables de configuración
CONTAINER_NAME="luxia-bot-landing2"
IMAGE_NAME="luxia-bot-landing2"
HEALTH_CHECK_URL="http://localhost:3000/health"
MAX_RETRIES=30
RETRY_INTERVAL=10

# Verificar comandos requeridos
command -v docker >/dev/null 2>&1 || { 
  echo "❌ Error: Docker no está instalado. Instalando..."
  curl -fsSL https://get.docker.com -o get-docker.sh
  sudo sh get-docker.sh
  sudo usermod -aG docker $USER
  echo "✅ Docker instalado correctamente"
}

command -v docker compose >/dev/null 2>&1 || { 
  echo "❌ Error: Docker Compose no disponible. Instalando..."
  sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
  sudo chmod +x /usr/local/bin/docker-compose
  echo "✅ Docker Compose instalado correctamente"
}

# Función para verificar health check
check_health() {
  echo "🏥 Verificando health check..."
  for i in $(seq 1 $MAX_RETRIES); do
    if docker exec $CONTAINER_NAME curl -f $HEALTH_CHECK_URL >/dev/null 2>&1; then
      echo "✅ Health check exitoso"
      return 0
    fi
    echo "⏳ Health check intento $i/$MAX_RETRIES - reintentando en ${RETRY_INTERVAL}s..."
    sleep $RETRY_INTERVAL
  done
  echo "❌ Health check falló después de $MAX_RETRIES intentos"
  return 1
}

# Backup de contenedor anterior si existe
if docker ps -a | grep -q $CONTAINER_NAME; then
  echo "📦 Creando backup del contenedor anterior..."
  docker commit $CONTAINER_NAME ${IMAGE_NAME}:backup-$(date +%Y%m%d-%H%M%S) || true
fi

echo "📥 Descargando imágenes..."
if ! docker compose pull; then
  echo "❌ Error: Falló la descarga de imágenes"
  exit 1
fi

echo "🔨 Construyendo contenedores..."
if ! docker compose build --no-cache; then
  echo "❌ Error: Falló la construcción de contenedores"
  exit 1
fi

echo "⏹️ Deteniendo servicios actuales..."
docker compose down || true

echo "▶️ Iniciando servicios..."
if ! docker compose up -d; then
  echo "❌ Error: Falló el inicio de servicios"
  
  # Intentar rollback automático
  echo "🔄 Intentando rollback automático..."
  BACKUP_IMAGE=$(docker images --format "{{.Repository}}:{{.Tag}}" | grep "${IMAGE_NAME}:backup-" | head -1)
  if [ -n "$BACKUP_IMAGE" ]; then
    echo "🔄 Rollback a: $BACKUP_IMAGE"
    docker run -d --name $CONTAINER_NAME --restart unless-stopped -p 80:3000 $BACKUP_IMAGE
    echo "✅ Rollback completado"
  else
    echo "❌ No se encontró imagen de backup para rollback"
  fi
  exit 1
fi

# Verificar que los servicios estén funcionando
echo "🔍 Verificando estado de servicios..."
sleep 30  # Dar tiempo para que inicien los servicios

if check_health; then
  echo "🎉 Despliegue completado exitosamente"
  echo "📊 Estado de servicios:"
  docker compose ps
  
  # Limpieza opcional
  echo "🧹 Limpiando imágenes no utilizadas..."
  docker image prune -f || true
  
  echo "✅ Luxia Bot Landing está online y funcionando"
  echo "🌐 Accede a tu aplicación en: http://$(hostname -I | awk '{print $1}')"
else
  echo "❌ El despliegue falló - servicios no están saludables"
  docker compose logs
  exit 1
fi
