#!/usr/bin/env node

// Script para verificar la configuración completa del proyecto
require('dotenv').config();

const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m'
};

function log(color, message) {
  console.log(color + message + colors.reset);
}

function checkRequired(name, value, isSecret = false) {
  if (value) {
    log(colors.green, `✓ ${name}: ${isSecret ? '[SET]' : value}`);
    return true;
  } else {
    log(colors.red, `✗ ${name}: Not set`);
    return false;
  }
}

function checkOptional(name, value, isSecret = false) {
  if (value) {
    log(colors.green, `✓ ${name}: ${isSecret ? '[SET]' : value}`);
  } else {
    log(colors.yellow, `- ${name}: Not set (optional)`);
  }
}

async function testDatabaseConnection() {
  try {
    const { pool } = require('../db/pool');
    const res = await pool.query('SELECT 1 as ok');
    log(colors.green, '✓ Database connection: SUCCESS');
    log(colors.blue, `  Result: ${JSON.stringify(res.rows[0])}`);
    await pool.end();
    return true;
  } catch (error) {
    log(colors.red, `✗ Database connection: FAILED`);
    log(colors.red, `  Error: ${error.message}`);
    return false;
  }
}

async function testServerEndpoints() {
  const http = require('http');
  const port = process.env.PORT || 3000;
  
  return new Promise((resolve) => {
    const server = require('../server.js');
    
    setTimeout(async () => {
      try {
        // Test root endpoint
        const response = await fetch(`http://127.0.0.1:${port}/`);
        const text = await response.text();
        
        if (text.includes('Hola desde')) {
          log(colors.green, '✓ Server endpoints: ACCESSIBLE');
          log(colors.blue, `  Response: ${text}`);
          resolve(true);
        } else {
          log(colors.red, '✗ Server endpoints: UNEXPECTED RESPONSE');
          resolve(false);
        }
      } catch (error) {
        log(colors.red, `✗ Server endpoints: FAILED`);
        log(colors.red, `  Error: ${error.message}`);
        resolve(false);
      }
    }, 2000);
  });
}

async function main() {
  log(colors.blue, '🔍 Verificación de Configuración - Luxia Bot Landing');
  log(colors.blue, '=' .repeat(60));
  
  let allGood = true;
  
  // Check environment variables
  log(colors.blue, '\n📋 Variables de Entorno:');
  
  // Database config (at least one method required)
  const hasDbUrl = process.env.DATABASE_URL || process.env.SUPABASE_DB_URL;
  const hasDbVars = process.env.PGHOST && process.env.PGUSER && process.env.PGPASSWORD && process.env.PGDATABASE;
  
  if (hasDbUrl) {
    checkRequired('Database URL', hasDbUrl, true);
  } else if (hasDbVars) {
    checkRequired('PGHOST', process.env.PGHOST);
    checkRequired('PGUSER', process.env.PGUSER);
    checkRequired('PGPASSWORD', process.env.PGPASSWORD, true);
    checkRequired('PGDATABASE', process.env.PGDATABASE);
    checkOptional('PGSSLMODE', process.env.PGSSLMODE);
  } else {
    log(colors.red, '✗ Database configuration: Missing (need DATABASE_URL or PG* variables)');
    allGood = false;
  }
  
  // Google OAuth
  log(colors.blue, '\n🔐 Google OAuth:');
  if (!checkRequired('GOOGLE_CLIENT_ID', process.env.GOOGLE_CLIENT_ID, true)) allGood = false;
  if (!checkRequired('GOOGLE_CLIENT_SECRET', process.env.GOOGLE_CLIENT_SECRET, true)) allGood = false;
  checkOptional('GOOGLE_API_KEY', process.env.GOOGLE_API_KEY, true);
  
  // Other configs
  log(colors.blue, '\n⚙️  Otras Configuraciones:');
  checkRequired('PORT', process.env.PORT || '5678');
  if (!checkRequired('SESSION_SECRET', process.env.SESSION_SECRET, true)) allGood = false;
  checkOptional('N8N_WEBHOOK_TOKEN', process.env.N8N_WEBHOOK_TOKEN, true);
  
  // Test database connection
  log(colors.blue, '\n🗄️  Conexión a Base de Datos:');
  const dbOk = await testDatabaseConnection();
  if (!dbOk) {
    log(colors.yellow, '  💡 Tip: Verifica que el host de Supabase sea correcto y la contraseña esté bien configurada');
  }
  
  // Summary
  log(colors.blue, '\n📊 Resumen:');
  if (allGood && dbOk) {
    log(colors.green, '🎉 ¡Configuración completa y funcional!');
    log(colors.blue, `   Puedes ejecutar: npm start`);
    log(colors.blue, `   Y abrir: http://127.0.0.1:${process.env.PORT || 5678}`);
  } else if (allGood) {
    log(colors.yellow, '⚠️  Configuración básica OK, pero hay problemas de conexión a BD');
    log(colors.blue, '   El servidor puede iniciarse, pero las rutas de BD fallarán');
  } else {
    log(colors.red, '❌ Faltan configuraciones requeridas');
    log(colors.blue, '   Revisa el archivo .env y completa los campos faltantes');
  }
  
  process.exit(0);
}

// Handle errors
process.on('unhandledRejection', (error) => {
  log(colors.red, `Error no manejado: ${error.message}`);
  process.exit(1);
});

main().catch((error) => {
  log(colors.red, `Error en verificación: ${error.message}`);
  process.exit(1);
});