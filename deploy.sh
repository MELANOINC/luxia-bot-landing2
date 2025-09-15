#!/bin/bash

#!/bin/bash

# Script de despliegue para el proyecto Node.js con PostgreSQL
# Asegúrate de tener Node.js, npm y PM2 instalados en el servidor
# También configura las variables de entorno (.env) antes de ejecutar

echo "Iniciando despliegue..."

# Detener la aplicación actual si está corriendo
echo "Deteniendo aplicación actual..."
pm2 stop luxia-bot-landing2 || echo "No hay aplicación corriendo"

# Actualizar código desde git (si usas git)
echo "Actualizando código..."
git pull origin main || echo "No se pudo actualizar desde git (asegúrate de tener git configurado)"

# Instalar dependencias
echo "Instalando dependencias..."
npm install

# Ejecutar migraciones de base de datos si es necesario
echo "Configurando base de datos..."
# Si tienes un script para migraciones, ejecutalo aquí
# Ejemplo: npm run migrate
# O ejecuta el SQL manualmente en Supabase

# Construir si hay build (opcional)
# echo "Construyendo aplicación..."
# npm run build

# Iniciar la aplicación con PM2
echo "Iniciando aplicación..."
pm2 start server.js --name luxia-bot-landing2

# Guardar configuración de PM2
pm2 save

echo "Despliegue completado. La aplicación debería estar corriendo en el puerto configurado."
echo "Verifica con: pm2 status"
echo "Logs: pm2 logs luxia-bot-landing2"
