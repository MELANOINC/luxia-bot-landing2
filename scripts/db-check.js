require('dotenv').config();
const { pool } = require('../db/pool');

function hasCredentials() {
  const { DATABASE_URL, PGHOST, PGUSER, PGPASSWORD, PGDATABASE } = process.env;
  if (DATABASE_URL) {
    return true;
  }
  return Boolean(PGHOST && PGUSER && PGPASSWORD && PGDATABASE);
}

(async () => {
  try {
    if (!hasCredentials()) {
      console.error('Faltan credenciales. Configura `.env` con `DATABASE_URL` o variables separadas (PGHOST, PGUSER, PGPASSWORD, PGDATABASE).');
      process.exitCode = 1;
      return;
    }
    const res = await pool.query('select 1 as ok');
    console.log('DB ping ok:', res.rows[0]);
  } catch (err) {
    console.error('DB ping failed:', err.message);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
})();
