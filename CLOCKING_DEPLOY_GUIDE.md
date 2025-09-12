# 🚀 Event Clocking System - Deploy Immediato

## 📋 Resumen del Sistema

Sistema completo de clocking de eventos integrado con CRM y automatización de ventas. Incluye:

- **API de Clocking en Tiempo Real**: Endpoints para registrar eventos de leads, ventas, conversiones y pagos
- **Dashboard Premium**: Monitoreo en tiempo real de métricas de negocio
- **Integración Bot**: Scripts listos para MELANIA BOT y sistemas externos
- **Base de Datos**: Esquemas optimizados en Supabase para escalabilidad
- **WebSockets**: Actualizaciones en tiempo real para el dashboard

## ⚡ Deploy Rápido (5 minutos)

### 1. Configuración de Variables de Entorno

```bash
# Copiar archivo de configuración
cp .env.example .env

# Editar variables requeridas
nano .env
```

Variables críticas:
```env
# Base de datos Supabase
DATABASE_URL=postgresql://user:pass@host:5432/database
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key

# Redis (opcional para cache)
REDIS_HOST=localhost
REDIS_PORT=6379

# Puerto del servidor
PORT=3000

# API Key para integraciones (opcional)
CLOCKING_API_KEY=your-secure-key
```

### 2. Instalación y Migración

```bash
# Instalar dependencias
npm install

# Ejecutar migraciones de base de datos
# Las migraciones están en supabase/migrations/
# Se aplican automáticamente en Supabase

# Iniciar servidor
npm start
```

### 3. Verificación

```bash
# Test de salud del sistema
curl http://localhost:3000/health

# Test de API de clocking
curl -X POST http://localhost:3000/api/clocking \
  -H "Content-Type: application/json" \
  -d '{
    "event_type": "lead_captured",
    "customer_email": "test@example.com",
    "customer_name": "Test Lead",
    "source_name": "WEBSITE"
  }'
```

## 🔗 Endpoints de Clocking

### POST /api/clocking
Registrar nuevo evento:
```json
{
  "event_type": "lead_captured|payment_completed|demo_scheduled",
  "customer_email": "cliente@ejemplo.com",
  "customer_name": "Nombre Cliente",
  "customer_phone": "+34123456789",
  "event_value": 2500,
  "currency": "EUR",
  "source_name": "MELANIA_BOT",
  "external_id": "bot_lead_123",
  "event_data": {
    "custom_field": "valor"
  }
}
```

### GET /api/clocking/recent
Obtener eventos recientes:
```bash
curl "http://localhost:3000/api/clocking/recent?limit=10&source=MELANIA_BOT"
```

### GET /api/clocking/dashboard
Dashboard en tiempo real:
```bash
curl "http://localhost:3000/api/clocking/dashboard"
```

### GET /api/clocking/stream
Stream de eventos en tiempo real (Server-Sent Events):
```javascript
const eventSource = new EventSource('/api/clocking/stream');
eventSource.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log('Nuevo evento:', data);
};
```

## 🤖 Integración con Bots

### Script Python para MELANIA BOT

```python
# examples/melania_bot_integration.py
from event_tracker import MelaniaBotEventTracker

# Configurar tracker
tracker = MelaniaBotEventTracker('http://localhost:3000')

# Registrar lead capturado
tracker.track_lead_captured({
    "email": "cliente@ejemplo.com",
    "name": "Cliente Potencial",
    "phone": "+34123456789",
    "source": "WHATSAPP_BOT"
})

# Registrar pago completado
tracker.track_payment_completed({
    "amount": 8500,
    "currency": "EUR",
    "email": "cliente@ejemplo.com",
    "paymentId": "pay_123456",
    "provider": "stripe"
})
```

### Script JavaScript para CRM

```javascript
// examples/crm_integration.js
const { EventClockingClient } = require('./lib/event-clocking-client');

const client = new EventClockingClient('http://localhost:3000');

// Sincronizar lead desde CRM
await client.clockLeadCaptured({
  email: 'lead@crm.com',
  name: 'CRM Lead',
  source: 'EXTERNAL_CRM',
  formData: { budget: '10000-50000' }
});
```

### Webhook para Sistemas Externos

```bash
# Webhook desde Zapier, Make.com, etc.
curl -X POST http://localhost:3000/api/clocking \
  -H "Content-Type: application/json" \
  -d '{
    "event_type": "payment_completed",
    "customer_email": "{{customer_email}}",
    "event_value": {{amount}},
    "source_name": "ZAPIER_WEBHOOK",
    "external_id": "{{transaction_id}}"
  }'
```

## 📊 Dashboard de Monitoreo

### Acceso al Dashboard
- URL: `http://localhost:3000`
- Login con credenciales de Supabase
- Panel Premium disponible para usuarios con suscripción activa

### Métricas en Tiempo Real
- **Eventos Hoy**: Total de eventos registrados
- **Leads Capturados**: Nuevos leads del día
- **Ventas Completadas**: Pagos confirmados
- **Ingresos**: Revenue total del día
- **Fuentes Top**: Rendimiento por canal
- **Leads Calientes**: Lista priorizada por score

### Stream de Eventos
- Eventos en tiempo real
- Filtros por tipo de evento
- Notificaciones para eventos críticos
- Historial de actividad reciente

## 🔧 Configuraciones Avanzadas

### Base de Datos Personalizada

Para usar PostgreSQL local en lugar de Supabase:

```bash
# Instalar PostgreSQL
sudo apt-get install postgresql postgresql-contrib

# Crear base de datos
sudo -u postgres createdb luxia_clocking

# Configurar .env
DATABASE_URL=postgresql://postgres:password@localhost:5432/luxia_clocking

# Ejecutar migraciones manualmente
psql -d luxia_clocking -f supabase/migrations/20250913000000_event_clocking_system.sql
```

### Redis para Cache (Opcional)

```bash
# Instalar Redis
sudo apt-get install redis-server

# Configurar en .env
REDIS_HOST=localhost
REDIS_PORT=6379

# El sistema funciona sin Redis, pero mejora el rendimiento
```

### Autenticación API

Para proteger los endpoints con API Key:

```bash
# Generar API Key
export CLOCKING_API_KEY=$(openssl rand -hex 32)

# Usar en requests
curl -X POST http://localhost:3000/api/clocking \
  -H "Authorization: Bearer $CLOCKING_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"event_type": "lead_captured", ...}'
```

## 🌍 Deploy en Producción

### VPS/Cloud (DigitalOcean, AWS, etc.)

```bash
# Clonar repositorio
git clone https://github.com/MELANOINC/luxia-bot-landing2.git
cd luxia-bot-landing2

# Configurar variables de entorno
cp .env.example .env
nano .env

# Instalar dependencias
npm install

# Usar PM2 para producción
npm install -g pm2
pm2 start server.js --name "luxia-clocking"
pm2 startup
pm2 save

# Nginx reverse proxy
sudo nano /etc/nginx/sites-available/luxia-clocking
```

Configuración Nginx:
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### Docker Deployment

```bash
# Build y run con Docker
docker build -t luxia-clocking .
docker run -d -p 3000:3000 --env-file .env luxia-clocking

# O usar docker-compose
docker-compose up -d
```

### Vercel/Netlify (Solo Frontend)

Para deploy de frontend en Vercel:

```bash
# Instalar Vercel CLI
npm i -g vercel

# Deploy
vercel --prod

# Configurar variables de entorno en Vercel dashboard
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-anon-key
```

## 🔍 Monitoreo y Logs

### Logs del Sistema

```bash
# Ver logs en tiempo real
pm2 logs luxia-clocking

# Logs del sistema
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log
```

### Métricas de Performance

```bash
# Status de PM2
pm2 status

# Monitoreo de recursos
pm2 monit

# Restart si es necesario
pm2 restart luxia-clocking
```

### Alertas y Notificaciones

El sistema incluye:
- Notificaciones en tiempo real para eventos críticos
- Dashboard de salud del sistema en `/health`
- Logs estructurados para debugging
- Métricas de performance automáticas

## 🎯 Casos de Uso Comunes

### 1. Bot de WhatsApp registra lead
```python
tracker.track_whatsapp_message({
    "phone": "+34123456789",
    "email": "lead@example.com", 
    "content": "Hola, quiero información",
    "conversation_stage": "initial_contact"
})
```

### 2. Pago completado desde Stripe
```javascript
// Webhook de Stripe
await client.clockPaymentCompleted({
    amount: event.data.object.amount / 100,
    currency: event.data.object.currency,
    email: event.data.object.customer_email,
    paymentId: event.data.object.id,
    provider: 'stripe'
});
```

### 3. Lead calificado desde CRM
```bash
curl -X POST http://localhost:3000/api/clocking \
  -H "Content-Type: application/json" \
  -d '{
    "event_type": "lead_qualified",
    "customer_email": "qualified@example.com",
    "source_name": "SALESFORCE_CRM",
    "event_data": {
      "score": 85,
      "budget": "10000-50000",
      "timeline": "immediate"
    }
  }'
```

### 4. Demo agendada via Calendly
```javascript
// Webhook de Calendly
await client.clockDemoScheduled({
    email: invitee.email,
    name: invitee.name,
    demoDate: event.start_time,
    source: 'CALENDLY_INTEGRATION'
});
```

## 🆘 Troubleshooting

### Problemas Comunes

**Error de conexión a base de datos:**
```bash
# Verificar conexión
psql $DATABASE_URL -c "SELECT 1;"

# Verificar migraciones
# Revisar supabase/migrations/ aplicadas
```

**Redis no disponible:**
```bash
# El sistema funciona sin Redis
# Verificar logs: Warning sobre Redis es normal
redis-cli ping  # Debería responder PONG
```

**WebSockets no funcionan:**
```bash
# Verificar proxy de Nginx incluye upgrade headers
# Ver configuración Nginx arriba
```

**API endpoints retornan 500:**
```bash
# Verificar logs del servidor
pm2 logs luxia-clocking

# Verificar variables de entorno
echo $DATABASE_URL
```

### Logs de Debug

```bash
# Activar modo debug
export DEBUG=true
npm start

# O en PM2
pm2 start server.js --name luxia-clocking --env development
```

## 📞 Soporte

Para soporte técnico:
- GitHub Issues: [Crear issue](https://github.com/MELANOINC/luxia-bot-landing2/issues)
- Email: contacto@brunomelano.com
- WhatsApp: +54 9 223 550 6585

## 🔄 Updates y Mantenimiento

```bash
# Actualizar código
git pull origin main
npm install
pm2 restart luxia-clocking

# Backup de base de datos
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d).sql

# Revisar métricas periódicamente
curl http://localhost:3000/api/clocking/dashboard
```

---

**🚀 ¡Sistema listo para producción en menos de 5 minutos!**

El sistema está optimizado para alta disponibilidad, escalabilidad y facilidad de integración con cualquier bot, CRM o sistema externo.