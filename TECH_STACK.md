# 🛠️ LUXIA BOT - Stack Tecnológico

Documentación técnica completa de la arquitectura, tecnologías y infraestructura de LUXIA BOT.

---

## 🏗️ Arquitectura General

```
┌─────────────────────────────────────────────────┐
│              FRONTEND LAYER                      │
│  ┌──────────────┐  ┌────────────┐  ┌─────────┐ │
│  │ Landing Page │  │  Dashboard │  │ Chat UI │ │
│  │  (Next.js)   │  │ (Next.js)  │  │(Widget) │ │
│  └──────────────┘  └────────────┘  └─────────┘ │
└─────────────────────────────────────────────────┘
                       ↕ REST/GraphQL
┌─────────────────────────────────────────────────┐
│               API GATEWAY                        │
│             (Node.js + Express)                  │
└─────────────────────────────────────────────────┘
         ↕              ↕             ↕
┌─────────────┐  ┌──────────┐  ┌─────────────┐
│  AI Engine  │  │   CRM    │  │ Integration │
│(LangChain)  │  │ Service  │  │   Service   │
└─────────────┘  └──────────┘  └─────────────┘
         ↕              ↕             ↕
┌─────────────────────────────────────────────────┐
│               DATA LAYER                         │
│  ┌──────────┐  ┌───────┐  ┌──────────────────┐ │
│  │PostgreSQL│  │ Redis │  │ Pinecone (Vector)│ │
│  └──────────┘  └───────┘  └──────────────────┘ │
└─────────────────────────────────────────────────┘
         ↕
┌─────────────────────────────────────────────────┐
│          EXTERNAL SERVICES                       │
│  OpenAI | Twilio | SendGrid | Meta | Stripe    │
└─────────────────────────────────────────────────┘
```

---

## 🎨 Frontend

### Landing Page y Marketing Site

#### Framework Principal
- **Next.js 14** (App Router)
  - Server Side Rendering (SSR) para SEO
  - Static Site Generation (SSG) para páginas marketing
  - Incremental Static Regeneration (ISR) para blog
  - API Routes para forms y newsletter

#### Lenguaje
- **TypeScript 5.0+**
  - Type safety end-to-end
  - Mejora DX (Developer Experience)
  - Reduce bugs en producción

#### Styling
- **Tailwind CSS 3.4**
  - Utility-first approach
  - Custom design system
  - Dark mode support
  - Responsive por defecto

- **shadcn/ui**
  - Componentes accesibles (a11y)
  - Customizables con Tailwind
  - Headless UI primitives
  - Radix UI bajo el hood

#### Animaciones
- **Framer Motion**
  - Animaciones smooth 60fps
  - Page transitions
  - Scroll-triggered animations
  - Interactive hover effects

#### Icons
- **Lucide React**
  - +1,000 iconos consistentes
  - Tree-shakeable
  - Customizables

### Dashboard de Usuario

#### Data Fetching
- **TanStack Query (React Query) 5.0**
  - Caching inteligente
  - Optimistic updates
  - Background refetching
  - Server state management

#### State Management
- **Zustand** para estado global
  - Lightweight (1kb)
  - DevTools integration
  - Middleware support

#### Forms
- **React Hook Form**
  - Performance optimizado
  - Validación con Zod
  - Menor re-renders

#### Charts y Analytics
- **Recharts**
  - Componible y customizable
  - Built on D3.js
  - Responsive charts

- **Tremor**
  - Dashboard components
  - Pre-built analytics widgets

#### Tables
- **TanStack Table**
  - Sorting, filtering, pagination
  - Virtual scrolling
  - Row selection

### Chat Widget (Embeddable)

#### Tecnología
- **Preact** (para tamaño reducido)
  - 3kb en lugar de 40kb (React)
  - API compatible con React
  - Ideal para widget embeddable

#### Comunicación Real-time
- **WebSockets** (Socket.io)
  - Mensajes instantáneos
  - Typing indicators
  - Read receipts
  - Presencia online

---

## ⚙️ Backend

### API Server

#### Runtime y Framework
- **Node.js 20 LTS**
  - Async/await native
  - Performance mejorado
  - Mejor manejo de memoria

- **Express 4.18**
  - Middleware ecosystem
  - RESTful API
  - Routing flexible

#### Validación
- **Zod**
  - Schema validation
  - Type inference
  - Runtime safety

#### Autenticación
- **Supabase Auth**
  - JWT tokens
  - OAuth providers (Google, GitHub)
  - Magic links
  - Row Level Security (RLS)

#### Rate Limiting
- **express-rate-limit**
  - Previene abuse
  - Configurable por endpoint
  - Redis store

### Queue System

#### Message Queue
- **Bull (Redis-based)**
  - Job processing
  - Scheduled jobs
  - Retries automáticos
  - Prioridades

#### Casos de Uso
- Envío de emails masivos
- Procesamiento de webhooks
- Training de IA
- Generación de reportes

---

## 🗄️ Databases

### Primary Database

#### PostgreSQL 15 (via Supabase)
```sql
-- Principales tablas

users
├─ id (uuid)
├─ email (text)
├─ plan (enum: starter|growth|enterprise)
├─ created_at (timestamp)
└─ metadata (jsonb)

workspaces
├─ id (uuid)
├─ user_id (uuid → users)
├─ name (text)
├─ settings (jsonb)
└─ channels (text[])

contacts
├─ id (uuid)
├─ workspace_id (uuid → workspaces)
├─ name (text)
├─ phone (text)
├─ email (text)
├─ tags (text[])
├─ custom_fields (jsonb)
└─ last_interaction (timestamp)

conversations
├─ id (uuid)
├─ contact_id (uuid → contacts)
├─ channel (enum: whatsapp|email|instagram)
├─ status (enum: open|closed|pending)
├─ assigned_to (uuid → users, nullable)
└─ messages (→ messages table)

messages
├─ id (uuid)
├─ conversation_id (uuid → conversations)
├─ direction (enum: incoming|outgoing)
├─ content (text)
├─ sender (text)
├─ ai_generated (boolean)
├─ created_at (timestamp)
└─ metadata (jsonb)

automations
├─ id (uuid)
├─ workspace_id (uuid → workspaces)
├─ trigger (jsonb)
├─ conditions (jsonb)
├─ actions (jsonb)
└─ is_active (boolean)
```

#### Features Usadas
- **Row Level Security**: Seguridad a nivel de row
- **Realtime subscriptions**: Push de cambios
- **Full-text search**: Búsqueda en conversaciones
- **JSONB**: Datos flexibles (metadata, settings)

### Cache Layer

#### Redis 7
```redis
# Patrones de uso

# Session cache
session:{userId} → { plan, permissions, ... }
TTL: 1 hora

# Rate limiting
ratelimit:{ip}:{endpoint} → counter
TTL: 1 minuto

# Message queue (Bull)
bull:queue:emails
bull:queue:ai-training

# Temporary data
temp:otp:{email} → "123456"
TTL: 5 minutos

# Analytics cache
analytics:{workspaceId}:daily → aggregated_data
TTL: 1 día
```

### Vector Database

#### Pinecone
```
Uso: RAG (Retrieval Augmented Generation)

Index: workspace-{id}
├─ Dimensiones: 1536 (OpenAI embeddings)
├─ Métrica: cosine similarity
└─ Namespaces:
    ├─ faqs
    ├─ documentation
    └─ previous-conversations

Pipeline:
1. User query → Embedding (OpenAI)
2. Similarity search en Pinecone
3. Top 5 resultados → Context
4. Context + Query → GPT-4
5. Response personalizada
```

---

## 🤖 IA y NLP

### Modelos de Lenguaje

#### OpenAI GPT-4
```javascript
// Configuración
{
  model: "gpt-4-turbo-preview",
  temperature: 0.7,  // Balance creatividad/consistencia
  max_tokens: 500,   // Respuestas concisas
  presence_penalty: 0.6,  // Evita repetición
  frequency_penalty: 0.3
}

// Uso principal
- Conversaciones con clientes
- Generación de respuestas
- Sentiment analysis
- Intent classification
```

#### Anthropic Claude 3
```javascript
// Configuración
{
  model: "claude-3-opus-20240229",
  max_tokens: 2000  // Para análisis complejos
}

// Uso principal
- Análisis de documentos largos
- Training de IA con PDFs
- Resúmenes de conversaciones
- Tareas que requieren razonamiento profundo
```

#### Embeddings
- **text-embedding-3-small** (OpenAI)
  - 1536 dimensiones
  - Para búsqueda semántica
  - RAG pipeline

### Orchestration

#### LangChain
```typescript
// Ejemplo de chain

const conversationalChain = new ConversationalRetrievalQAChain({
  llm: new ChatOpenAI({ modelName: 'gpt-4' }),
  retriever: pineconeVectorStore.asRetriever(),
  memory: new BufferMemory(),
  returnSourceDocuments: true
});

// Features usadas
- Prompt templates
- Memory management (buffer, summary)
- RAG chains
- Agent executors
- Tool calling
```

### Clasificación y Análisis

#### Hugging Face Models
```python
# Sentiment Analysis
model: "cardiffnlp/twitter-xlm-roberta-base-sentiment"
Idiomas: Español, Inglés, Portugués

# Intent Classification
model: "facebook/bart-large-mnli"
Zero-shot classification

# NER (Named Entity Recognition)
model: "dccuchile/bert-base-spanish-wwm-cased"
Extrae: nombres, empresas, productos
```

---

## 📱 Integraciones

### Mensajería

#### WhatsApp Business API
**Provider**: Twilio
```javascript
// Setup
const twilio = require('twilio');
const client = twilio(ACCOUNT_SID, AUTH_TOKEN);

// Enviar mensaje
await client.messages.create({
  from: 'whatsapp:+14155238886',
  to: `whatsapp:${contactPhone}`,
  body: messageContent,
  mediaUrl: imageUrl  // Opcional
});

// Webhook (recibir)
POST /webhooks/whatsapp/incoming
{
  From: "whatsapp:+1234567890",
  Body: "Mensaje del usuario",
  MediaUrl0: "https://..."
}
```

**Pricing**: 
- $0.005/mensaje (saliente)
- Gratis (entrante)

#### Email
**Provider**: SendGrid
```javascript
// Transactional email
const sgMail = require('@sendgrid/mail');

await sgMail.send({
  to: contact.email,
  from: 'bot@luxiabot.com',
  subject: 'Tu consulta',
  text: messageContent,
  html: htmlTemplate
});

// Email parsing (recibir)
POST /webhooks/sendgrid/inbound
{
  from: "user@example.com",
  subject: "...",
  text: "..."
}
```

**Pricing**:
- 100 emails/día gratis
- $0.00085/email después

#### Instagram/Facebook Messenger
**Provider**: Meta Graph API
```javascript
// Setup webhook
const FB_PAGE_TOKEN = process.env.FB_PAGE_TOKEN;

// Enviar mensaje
await axios.post(
  `https://graph.facebook.com/v18.0/me/messages`,
  {
    recipient: { id: userId },
    message: { text: messageContent }
  },
  {
    headers: { Authorization: `Bearer ${FB_PAGE_TOKEN}` }
  }
);
```

### CRM y E-commerce

#### Shopify
```javascript
// Shopify GraphQL API
const SHOPIFY_ADMIN_API = `https://${shop}.myshopify.com/admin/api/2024-01/graphql.json`;

// Sincronizar productos
query {
  products(first: 100) {
    edges {
      node {
        id
        title
        variants { price }
        images { url }
      }
    }
  }
}

// Crear orden desde conversación
mutation {
  draftOrderCreate(input: {
    lineItems: [{ variantId: "...", quantity: 1 }]
  }) {
    draftOrder { id }
  }
}
```

#### WooCommerce
```javascript
// REST API
const WooCommerce = require('woocommerce-api');

const woo = new WooCommerce({
  url: 'https://example.com',
  consumerKey: '...',
  consumerSecret: '...'
});

// Obtener productos
const products = await woo.get('products');

// Crear orden
await woo.post('orders', orderData);
```

### Automatización

#### Zapier
```javascript
// Webhook trigger
POST /webhooks/zapier/new-contact
{
  name: "...",
  email: "...",
  source: "whatsapp",
  workspace_id: "..."
}

// Disponible en Zapier:
- New Contact
- New Conversation
- Message Received
- Tag Added
- Deal Closed
```

### Pagos

#### Stripe
```javascript
const stripe = require('stripe')(process.env.STRIPE_SECRET);

// Crear suscripción
const subscription = await stripe.subscriptions.create({
  customer: customerId,
  items: [{ price: 'price_growth_plan' }],
  trial_period_days: 30
});

// Webhook events
POST /webhooks/stripe
{
  type: "customer.subscription.created",
  type: "invoice.payment_failed",
  type: "customer.subscription.deleted"
}
```

---

## ☁️ Infraestructura

### Hosting

#### Frontend (Vercel)
```yaml
# vercel.json
{
  "builds": [
    { "src": "package.json", "use": "@vercel/next" }
  ],
  "env": {
    "NEXT_PUBLIC_API_URL": "@api-url",
    "NEXT_PUBLIC_SUPABASE_URL": "@supabase-url"
  },
  "regions": ["iad1"],  # US East (baja latencia LATAM)
  "framework": "nextjs"
}
```

**Features**:
- Edge Network global
- Automatic HTTPS
- Preview deployments por PR
- Analytics integrado

**Pricing**: 
- Hobby: Gratis (suficiente para MVP)
- Pro: $20/mes (para producción)

#### Backend (Railway)
```yaml
# railway.toml
[build]
builder = "NIXPACKS"
buildCommand = "npm install && npm run build"

[deploy]
startCommand = "npm start"
restartPolicyType = "ON_FAILURE"
restartPolicyMaxRetries = 10

[[services]]
name = "api"
memoryLimit = "1GB"
cpuLimit = "1vCPU"
```

**Features**:
- Deploy desde GitHub
- Auto-scaling
- Logs centralizados
- PostgreSQL managed

**Pricing**:
- $5/mes base
- Pay-per-use después

### Database Hosting

#### Supabase (PostgreSQL + Auth + Storage)
```javascript
// Configuración
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

// Features usadas:
- Database: PostgreSQL 15
- Auth: JWT + OAuth
- Storage: Archivos adjuntos
- Realtime: Subscripciones
- Edge Functions: Serverless
```

**Pricing**:
- Free tier: 500MB DB, 1GB storage
- Pro: $25/mes (8GB DB, 100GB storage)

#### Redis (Upstash)
```javascript
// Serverless Redis
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN
});

// Features:
- Serverless (pay per request)
- Global replication
- REST API
```

**Pricing**:
- Free: 10K requests/day
- Pay-as-you-go: $0.2 per 100K requests

### CI/CD

#### GitHub Actions
```yaml
# .github/workflows/deploy.yml
name: Deploy Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Run tests
        run: npm test
      
      - name: Build
        run: npm run build
      
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
```

### Monitoring

#### Sentry (Error Tracking)
```javascript
// Configuración
Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 0.1,
  beforeSend(event) {
    // Filtrar datos sensibles
    return event;
  }
});
```

**Alerts**: Slack cuando >100 errors/hr

#### Uptime Robot (Monitoring)
```yaml
Monitores configurados:
- https://luxiabot.com (cada 5 min)
- https://api.luxiabot.com/health (cada 1 min)
- https://crm.luxiabot.com (cada 5 min)

Alerts via:
- Email
- Slack
- PagerDuty (Enterprise only)
```

#### Logging (Better Stack)
```javascript
// Structured logging
logger.info('Message sent', {
  workspaceId: '...',
  contactId: '...',
  channel: 'whatsapp',
  duration: 235
});

// Agregación en dashboard
- Mensajes enviados/hora
- Latencia promedio
- Error rate
- AI tokens usage
```

---

## 🔒 Seguridad

### Autenticación y Autorización
- JWT tokens con refresh
- OAuth 2.0 (Google, Microsoft)
- 2FA opcional (TOTP)
- API keys para integraciones

### Encriptación
- TLS 1.3 en tránsito
- AES-256 para datos sensibles en reposo
- Secrets en environment variables (no en código)

### Rate Limiting
```javascript
// Por IP
100 requests/minuto (anónimo)
1000 requests/minuto (autenticado)

// Por endpoint
/api/ai/chat: 10 requests/minuto
/api/messages/send: 100 requests/minuto
```

### Compliance
- **GDPR**: Right to deletion, data export
- **SOC 2**: En proceso (Q3 2026)
- **CCPA**: Cumplimiento para usuarios California

---

## 📊 Performance

### Métricas Objetivo

```
Landing Page:
├─ Lighthouse Score: >90
├─ First Contentful Paint: <1.5s
├─ Time to Interactive: <3.5s
└─ Core Web Vitals: ✅

Dashboard:
├─ Initial load: <2s
├─ Route transition: <200ms
└─ API response (p95): <500ms

AI Response:
├─ Simple query: <2s
├─ Complex query: <5s
└─ With RAG: <4s
```

### Optimizaciones
- Image optimization (Next.js Image)
- Code splitting automático
- Route prefetching
- Redis caching
- Database indexing
- CDN (Cloudflare)

---

## 💰 Costos Mensuales (Estimado)

```
INFRAESTRUCTURA:
├─ Vercel Pro: $20
├─ Railway: $25
├─ Supabase Pro: $25
├─ Upstash Redis: $10
├─ Pinecone Starter: $70
└─ Subtotal: $150

APIS:
├─ OpenAI (50K requests): $150
├─ Twilio (10K mensajes): $50
├─ SendGrid (50K emails): $40
└─ Subtotal: $240

TOOLS:
├─ Sentry: $26
├─ Better Stack: $20
└─ Subtotal: $46

TOTAL: ~$436/mes (para 100 clientes)
```

**Nota**: Escala con uso real. Con 1000 clientes estimado ~$2,500/mes.

---

## 🚀 Próximas Tecnologías (Roadmap)

### Q2 2026
- [ ] **Golang** para microservicios críticos (mejor performance)
- [ ] **GraphQL** como alternativa a REST
- [ ] **WebRTC** para llamadas de voz/video

### Q3 2026
- [ ] **React Native** para app móvil nativa
- [ ] **Python** para ML pipelines avanzados
- [ ] **Kubernetes** para orquestación (si alcanzamos 5K+ clientes)

---

<div align="center">

**[🏠 Volver al README](./README.md)** | **[🗺️ Ver Roadmap](./ROADMAP.md)**

*Actualizado: Enero 2026*

</div>
