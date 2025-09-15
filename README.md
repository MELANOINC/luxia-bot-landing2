# luxia-bot-landing2

Servidor Express con conexión a Postgres (Supabase).

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
GOOGLE_CLIENT_ID=tu-client-id
GOOGLE_CLIENT_SECRET=tu-client-secret
GOOGLE_API_KEY=tu-api-key
SESSION_SECRET=tu-secreto-para-sesiones
```

### Endpoints de autenticación
- `GET /auth/google`: Inicia el flujo de autenticación con Google.
- `GET /auth/google/callback`: Callback de Google (redirige a `/profile` si exitoso).
- `GET /profile`: Ruta protegida que muestra info del usuario autenticado.
- `GET /logout`: Cierra la sesión y redirige a `/`.

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