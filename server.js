import dotenv from 'dotenv';
import express from 'express';
import pg from 'pg';
import Redis from 'ioredis';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = process.env.PORT || 3000;

// Database connection
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const redis = new Redis({
  host: process.env.REDIS_HOST || 'redis',
  port: process.env.REDIS_PORT || 6379,
});

const app = express();
app.use(express.json());
app.use(express.static(__dirname));

app.get('/health', async (_req, res) => {
  try {
    await pool.query('SELECT 1');
    await redis.ping();
    res.status(200).send('OK');
  } catch (err) {
    res.status(500).send('FAIL');
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
