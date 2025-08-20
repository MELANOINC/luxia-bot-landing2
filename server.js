import dotenv from 'dotenv';
import express from 'express';
import pg from 'pg';
import Redis from 'ioredis';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = process.env.PORT || 3000;

// Database connection (optional for basic functionality)
// const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
// const redis = new Redis({
//   host: process.env.REDIS_HOST || 'redis',
//   port: process.env.REDIS_PORT || 6379,
// });

const app = express();
app.use(express.json());
app.use(express.static(__dirname));

app.get('/health', async (_req, res) => {
  try {
    // Basic health check - just verify the app is responding
    res.status(200).json({
      status: 'OK',
      timestamp: new Date().toISOString(),
      uptime: process.uptime()
    });
  } catch (err) {
    console.error('Health check failed:', err);
    res.status(500).json({
      status: 'FAIL',
      error: err && err.message ? err.message : String(err)
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
