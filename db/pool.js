require('dotenv').config();
const { Pool } = require('pg');

// Construye la configuración desde DATABASE_URL o variables por separado
function buildConfig() {
  const {
    DATABASE_URL,
    PGHOST, PGPORT, PGDATABASE, PGUSER, PGPASSWORD, PGSSLMODE,
    SUPABASE_DB_URL, SUPABASE_DB_POOL_URL,
    POSTGRES_HOST, POSTGRES_PORT, POSTGRES_DB, POSTGRES_USER, POSTGRES_PASSWORD, POSTGRES_SSLMODE
  } = process.env;
  const URL_FROM_ENV = DATABASE_URL || SUPABASE_DB_URL || SUPABASE_DB_POOL_URL;
  if (URL_FROM_ENV) {
    try {
      const u = new URL(URL_FROM_ENV);
      const needSsl = /sslmode=require/i.test(URL_FROM_ENV) || /supabase\.co/i.test(u.hostname);
      return {
        host: u.hostname,
        port: Number(u.port || 5432),
        database: decodeURIComponent(u.pathname.replace(/^\//, '')),
        user: decodeURIComponent(u.username),
        password: decodeURIComponent(u.password),
        ssl: needSsl ? getSslOption('require') : getSslOption(PGSSLMODE || POSTGRES_SSLMODE)
      };
    } catch (e) {
      const needSsl = /sslmode=require/i.test(URL_FROM_ENV) || /supabase\.co/i.test(URL_FROM_ENV);
      return {
        connectionString: URL_FROM_ENV,
        ssl: needSsl ? getSslOption('require') : getSslOption(PGSSLMODE || POSTGRES_SSLMODE)
      };
    }
  }
  return {
    host: PGHOST || POSTGRES_HOST || 'localhost',
    port: Number(PGPORT || POSTGRES_PORT || 5432),
    database: PGDATABASE || POSTGRES_DB,
    user: PGUSER || POSTGRES_USER,
    password: PGPASSWORD || POSTGRES_PASSWORD,
    ssl: getSslOption(PGSSLMODE || POSTGRES_SSLMODE)
  };
}

function getSslOption(mode) {
  // Valores admitidos: 'require', 'disable'. Por defecto: SSL deshabilitado.
  const m = (mode || '').toLowerCase();
  if (m === 'disable' || m === 'false' || m === 'no') {
    return false;
  }
  if (m === 'require' || m === 'true' || m === 'yes') {
    // Para evitar error de certificado autofirmado, se puede usar { rejectUnauthorized: false }
    return { rejectUnauthorized: false };
  }
  return false; 
}

const pool = new Pool(buildConfig());

module.exports = { pool };
