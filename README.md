# luxia-bot-landing2

Servidor Express con conexión a Postgres (Supabase) y Smart Contracts ERC-20.

## Nuevas Características 🚀

### Smart Contracts ERC-20
- **LuxiaToken (LUXIA)**: Token estándar con minting y burning
- **NotoriusToken (NOTORIOUS)**: Token avanzado con fees, blacklist y pausable
- API endpoints para interactuar con los contratos
- Tests completos para ambos tokens

## Requisitos
- Node.js 18+

## Configuración
1. Copia `.env.example` a `.env` y edita `DATABASE_URL` con tu contraseña real de Supabase.
   - Ejemplo: `postgres://postgres:YOUR_PASSWORD@db.qgisablesklaoydfbljg.supabase.co:5432/postgres?sslmode=require`
2. Instala dependencias:

```powershell
npm install
```

## Ejecutar
- Iniciar servidor:

```powershell
npm start
```

- Probar ping a la base de datos (desde script):

```powershell
npm run db:ping
```

- Probar ping a la base desde el servidor:
  - Abre `http://127.0.0.1:5678/db-ping`

Si ves `{ ok: true, result: { ok: 1 } }`, la conexión está funcionando.

## Notas
- Supabase requiere SSL. El código configura `ssl: { rejectUnauthorized: false }` para evitar errores de certificado autofirmado.
- Nunca subas tu `.env` al repositorio.

## Endpoint de ejemplo: `/items`
- Lista hasta 20 filas de `public.items` si la tabla existe.
- Si no existe, devuelve 404 con una guía para crearla.

SQL de ejemplo para crear la tabla:
```sql
create extension if not exists pgcrypto; -- para gen_random_uuid()
create table if not exists public.items (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz default now()
);
```

### POST `/items`
- Inserta un nuevo ítem en `public.items`.
- Requiere body JSON con campo `name` (string no vacío).
- Responde con el registro creado (201) o error (400/404/500).

Ejemplo de request:
```bash
curl -X POST http://127.0.0.1:3000/items \
  -H "Content-Type: application/json" \
  -d '{"name":"Nuevo ítem"}'
```

Respuesta exitosa:
```json
{
  "ok": true,
  "item": {
    "id": "uuid-generado",
    "name": "Nuevo ítem",
    "created_at": "2025-09-15T12:00:00.000Z"
  }
}
```

## Autenticación con Google OAuth

El servidor incluye autenticación OAuth con Google para proteger rutas.

### Configuración
Asegúrate de tener en `.env`:
```
# Servidor
PORT=3000

# Database (opción 1: variables separadas - recomendado)
PGHOST=db.qgisablesklaoydfbljg.supabase.co
PGPORT=5432
PGUSER=postgres
PGPASSWORD=YOUR_PASSWORD
PGDATABASE=postgres
PGSSLMODE=require

# Database (opción 2: URL completa - requiere URL encoding para caracteres especiales)
# Para @ usar %40, para % usar %25
# DATABASE_URL=postgres://postgres:YOUR_PASSWORD@db.qgisablesklaoydfbljg.supabase.co:5432/postgres?sslmode=require

# Google OAuth
GOOGLE_CLIENT_ID=tu-client-id
GOOGLE_CLIENT_SECRET=tu-client-secret
GOOGLE_API_KEY=tu-api-key
SESSION_SECRET=tu-secreto-para-sesiones

# N8N Webhook
N8N_WEBHOOK_TOKEN=tu-token-de-n8n
```

**Importante**: Si tu contraseña contiene caracteres especiales (`@`, `%`, etc.), usa variables separadas (`PGPASSWORD`) o aplica URL encoding en la cadena de conexión.

### Endpoints de autenticación
- `GET /auth/google`: Inicia el flujo de autenticación con Google.
- `GET /auth/google/callback`: Callback de Google (redirige a `/profile` si exitoso).
- `GET /profile`: Ruta protegida que muestra info del usuario autenticado.
- `GET /logout`: Cierra la sesión y redirige a `/`.

## Webhook N8N

El servidor incluye un endpoint para recibir webhooks de N8N.

### Configuración del Webhook

Asegúrate de tener en `.env`:

```bash
N8N_WEBHOOK_TOKEN=tu-token-de-n8n-aqui
```

### Endpoint del Webhook

- `POST /webhook/n8n`: Recibe datos de N8N con autenticación Bearer token.

### Uso en N8N

1. Crea un nodo "HTTP Request" en tu workflow de N8N.
2. Configura:
   - Method: POST
   - URL: `http://tu-servidor:puerto/webhook/n8n`
   - Headers: `Authorization: Bearer TU_TOKEN_N8N`
   - Body: Los datos que quieres enviar

### Ejemplo de Request

```bash
curl -X POST http://127.0.0.1:3000/webhook/n8n \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{"message": "Datos desde N8N", "data": {"key": "value"}}'
```

## Configuración de Base de Datos (SQL)

Para configurar la base de datos PostgreSQL (Supabase), ejecuta el script `init.sql` en tu panel de Supabase o usando psql:

1. En Supabase: Ve a SQL Editor y pega el contenido de `init.sql`.
2. Localmente: `psql -U postgres -d tu_base_de_datos -f init.sql`

Esto creará las tablas `public.items` y `public.users`, índices y triggers necesarios.

## Despliegue (Deploy)

Para desplegar la aplicación en un servidor:

1. **Requisitos del servidor**:
   - Node.js 18+
   - PM2 (instala con `npm install -g pm2`)
   - Git (opcional, para actualizaciones)

2. **Configurar variables de entorno**:
   - Copia `.env` al servidor y configura las credenciales reales.

3. **Ejecutar despliegue**:

   ```bash
   chmod +x deploy.sh
   ./deploy.sh
   ```

4. **Verificar**:

   ```bash
   pm2 status
   pm2 logs luxia-bot-landing2
   ```

El script detendrá la app actual, actualizará el código, instalará dependencias y reiniciará con PM2.

### Despliegue en plataformas en la nube

- **Railway**: Conecta tu repo de GitHub, configura variables de entorno.
- **Render**: Usa el Dockerfile si tienes uno, o configura como web service.
- **Heroku**: `git push heroku main` (necesitas Heroku CLI).

Asegúrate de configurar las variables de entorno en la plataforma de despliegue.

## Pruebas y Solución de Problemas

### Verificar conexión a base de datos
```bash
npm run db:ping
```
Resultado esperado: `DB ping ok: { ok: 1 }`

### Errores comunes

1. **"Faltan credenciales"**: Asegúrate de que `.env` existe y contiene `DATABASE_URL` o las variables `PG*`.

2. **"password must be a string"**: 
   - Si usas URL, verifica que la contraseña esté correctamente codificada (`@` → `%40`, `%` → `%25`)
   - Mejor usa variables separadas (`PGPASSWORD`) para evitar problemas de encoding

3. **"server does not support SSL"**: Agrega `?sslmode=require` a la URL o `PGSSLMODE=require`

4. **"EADDRINUSE"**: El puerto está ocupado. Cambia el puerto:
   ```bash
   PORT=3001 npm start
   ```

### Endpoints de prueba
- `GET /` → "Hola desde {puerto}"
- `GET /db-ping` → `{ ok: true, result: { ok: 1 } }`
- `GET /items` → Lista de items o 404 si la tabla no existe
- `POST /items` → Crear nuevo item con `{"name":"..."}`
- `GET /auth/google` → Redirige a Google OAuth
- `POST /webhook/n8n` → Webhook para N8N (requiere Bearer token)

## Smart Contracts ERC-20 🚀

Este proyecto ahora incluye smart contracts ERC-20 para tokens LUXIA y NOTORIOUS.

### Características de los Tokens

#### LuxiaToken (LUXIA)
- **Supply inicial**: 1,000,000 LUXIA
- **Supply máximo**: 10,000,000 LUXIA
- **Características**:
  - ERC-20 estándar
  - Burnable (quemable)
  - Minting controlado por owner
  - Límite de supply

#### NotoriusToken (NOTORIOUS)
- **Supply inicial**: 500,000 NOTORIOUS
- **Supply máximo**: 5,000,000 NOTORIOUS
- **Características**:
  - ERC-20 estándar
  - Burnable (quemable)
  - Pausable
  - Transfer fees (1% por defecto)
  - Sistema de blacklist
  - Minting controlado por owner

### Comandos de Smart Contracts

```bash
# Compilar contratos
npm run compile

# Ejecutar tests
npm test

# Iniciar nodo local
npm run node

# Desplegar contratos
npm run deploy
```

### API Endpoints para Smart Contracts

#### Web3 Status
- `GET /web3/status` → Estado del servicio Web3

#### LUXIA Token
- `GET /tokens/luxia/info` → Información del token
- `GET /tokens/luxia/balance/:address` → Balance de una dirección
- `POST /tokens/luxia/transfer` → Transferir tokens
- `POST /tokens/luxia/mint` → Crear nuevos tokens (solo owner)

#### NOTORIOUS Token
- `GET /tokens/notorious/info` → Información del token
- `GET /tokens/notorious/balance/:address` → Balance de una dirección
- `POST /tokens/notorious/transfer` → Transferir tokens (con fees)
- `POST /tokens/notorious/set-fee` → Configurar fee de transferencia
- `POST /tokens/notorious/blacklist` → Blacklistear dirección
- `POST /tokens/notorious/pause` → Pausar transfers

#### Configuración
- `POST /web3/initialize` → Inicializar servicio Web3
- `POST /web3/load-contracts` → Cargar contratos

### Ejemplo de Uso

```bash
# 1. Inicializar Web3
curl -X POST http://localhost:5678/web3/initialize \
  -H "Content-Type: application/json" \
  -d '{"providerUrl": "http://localhost:8545"}'

# 2. Cargar contratos (después del deploy)
curl -X POST http://localhost:5678/web3/load-contracts \
  -H "Content-Type: application/json" \
  -d '{
    "luxiaAddress": "0x...",
    "notoriusAddress": "0x..."
  }'

# 3. Obtener información de tokens
curl http://localhost:5678/tokens/luxia/info
curl http://localhost:5678/tokens/notorious/info

# 4. Transferir tokens
curl -X POST http://localhost:5678/tokens/luxia/transfer \
  -H "Content-Type: application/json" \
  -d '{"to": "0x...", "amount": 100}'
```

### Desarrollo con Smart Contracts

1. **Terminal 1**: Iniciar blockchain local
   ```bash
   npx hardhat node
   ```

2. **Terminal 2**: Desplegar contratos
   ```bash
   npx hardhat run scripts/deploy.js --network localhost
   ```

3. **Terminal 3**: Iniciar servidor
   ```bash
   npm start
   ```

4. **Inicializar API**: Usar endpoints `/web3/initialize` y `/web3/load-contracts`

### Tests

Los contratos incluyen tests completos que cubren:
- Deployment y configuración inicial
- Funcionalidad de transferencias
- Minting y burning
- Sistema de fees (NOTORIOUS)
- Funcionalidad de blacklist (NOTORIOUS)
- Sistema pausable (NOTORIOUS)
- Control de acceso
- Casos edge y manejo de errores

```bash
# Ejecutar todos los tests
npm test

# Tests específicos
npx hardhat test test/LuxiaToken.test.js
npx hardhat test test/NotoriusToken.test.js
```

Para más detalles sobre los smart contracts, consulta [contracts/README.md](contracts/README.md).