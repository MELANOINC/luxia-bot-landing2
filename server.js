import dotenv from 'dotenv';
import express from 'express';
import pg from 'pg';
import Redis from 'ioredis';
import path from 'path';
import { fileURLToPath } from 'url';
import { generateLeadSummary } from './lib/ai.js';

dotenv.config();
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = process.env.PORT || 3000;

// Database connection - optional for demo
let pool = null;
let redis = null;

if (process.env.DATABASE_URL) {
  try {
    pool = new pg.Pool({ 
      connectionString: process.env.DATABASE_URL,
      // Add connection timeout to fail faster
      connectionTimeoutMillis: 2000
    });
    console.log('Database pool initialized');
  } catch (error) {
    console.warn('Database pool initialization failed:', error.message);
  }
}

if (process.env.REDIS_HOST) {
  try {
    redis = new Redis({
      host: process.env.REDIS_HOST,
      port: process.env.REDIS_PORT || 6379,
      // Don't auto-retry connections
      retryDelayOnFailover: 0,
      maxRetriesPerRequest: 1,
      lazyConnect: true
    });
    console.log('Redis client initialized');
  } catch (error) {
    console.warn('Redis client initialization failed:', error.message);
  }
}

const app = express();
app.use(express.json());
app.use(express.static(__dirname));

app.get('/health', async (_req, res) => {
  const status = { status: 'OK', database: false, redis: false };
  
  try {
    if (pool) {
      try {
        await pool.query('SELECT 1');
        status.database = true;
      } catch (dbErr) {
        console.warn('Database health check failed:', dbErr.message);
      }
    }
    
    if (redis) {
      try {
        await redis.ping();
        status.redis = true;
      } catch (redisErr) {
        console.warn('Redis health check failed:', redisErr.message);
      }
    }
    
    res.status(200).json(status);
  } catch (err) {
    console.error('Health check failed:', err);
    res.status(500).json({
      status: 'FAIL',
      error: err && err.message ? err.message : String(err)
    });
  }
});

// Generate AI-powered lead follow-up message
app.post('/lead-summary', async (req, res) => {
  try {
    const summary = await generateLeadSummary(req.body);
    res.json({ summary });
  } catch (err) {
    console.error('AI generation error:', err);
    res.status(500).json({ error: 'AI generation failed' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
