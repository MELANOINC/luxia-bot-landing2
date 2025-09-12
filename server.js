import dotenv from 'dotenv';
import express from 'express';
import pg from 'pg';
import Redis from 'ioredis';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';

dotenv.config();
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = process.env.PORT || 3000;

// Database connection
const pool = new pg.Pool({ 
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Redis connection with error handling
const redis = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379,
  retryDelayOnFailover: 100,
  maxRetriesPerRequest: 3,
  lazyConnect: true
});

// Handle Redis connection errors gracefully
redis.on('error', (err) => {
  console.warn('Redis connection error (will continue without Redis):', err.message);
});

const app = express();
const server = createServer(app);
const io = new SocketIOServer(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

app.use(express.json());
app.use(express.static(__dirname));

// CORS middleware for API endpoints
app.use('/api', (req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

// Health check endpoint
app.get('/health', async (_req, res) => {
  try {
    await pool.query('SELECT 1');
    try {
      await redis.ping();
    } catch (redisErr) {
      console.warn('Redis unavailable:', redisErr.message);
    }
    res.status(200).send('OK');
  } catch (err) {
    console.error('Health check failed:', err);
    res.status(500).json({
      status: 'FAIL',
      error: err && err.message ? err.message : String(err)
    });
  }
});

// Event Clocking System Endpoints
// ==============================

// Helper function to get or create source
async function getOrCreateSource(sourceName, sourceType = 'external_api') {
  try {
    const result = await pool.query(
      'SELECT id FROM clocking_sources WHERE source_name = $1',
      [sourceName]
    );
    
    if (result.rows.length > 0) {
      return result.rows[0].id;
    }
    
    const insertResult = await pool.query(
      'INSERT INTO clocking_sources (source_name, source_type, description) VALUES ($1, $2, $3) RETURNING id',
      [sourceName, sourceType, `Auto-created source: ${sourceName}`]
    );
    
    return insertResult.rows[0].id;
  } catch (err) {
    console.error('Error getting/creating source:', err);
    return null;
  }
}

// POST /api/clocking - Record new event
app.post('/api/clocking', async (req, res) => {
  try {
    const {
      event_type,
      event_value,
      currency = 'EUR',
      customer_email,
      customer_name,
      customer_phone,
      source_name = 'EXTERNAL_API',
      source_type = 'external_api',
      external_id,
      event_data = {},
      session_id,
      utm_source,
      utm_medium,
      utm_campaign,
      country,
      city
    } = req.body;

    // Validation
    if (!event_type) {
      return res.status(400).json({ error: 'event_type is required' });
    }

    // Get or create source
    const sourceId = await getOrCreateSource(source_name, source_type);
    if (!sourceId) {
      return res.status(500).json({ error: 'Failed to create/get source' });
    }

    // Get client info
    const clientIP = req.ip || req.connection.remoteAddress;
    const userAgent = req.get('User-Agent');

    // Insert event
    const insertQuery = `
      INSERT INTO clocking_events (
        event_type, event_value, currency, customer_email, customer_name, 
        customer_phone, source_id, source_name, external_id, event_data,
        session_id, user_agent, ip_address, utm_source, utm_medium, 
        utm_campaign, country, city, event_timestamp
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19)
      RETURNING id, event_timestamp
    `;

    const result = await pool.query(insertQuery, [
      event_type, event_value, currency, customer_email, customer_name,
      customer_phone, sourceId, source_name, external_id, JSON.stringify(event_data),
      session_id, userAgent, clientIP, utm_source, utm_medium,
      utm_campaign, country, city, new Date()
    ]);

    const eventId = result.rows[0].id;
    const timestamp = result.rows[0].event_timestamp;

    // Emit real-time update via WebSocket
    io.emit('new_event', {
      id: eventId,
      event_type,
      event_value,
      customer_email,
      customer_name,
      source_name,
      timestamp
    });

    // Cache recent events in Redis
    try {
      const eventData = {
        id: eventId,
        event_type,
        event_value,
        customer_email,
        customer_name,
        source_name,
        timestamp
      };
      await redis.lpush('recent_events', JSON.stringify(eventData));
      await redis.ltrim('recent_events', 0, 99); // Keep last 100 events
    } catch (redisErr) {
      console.warn('Redis cache update failed:', redisErr.message);
    }

    res.status(201).json({
      success: true,
      event_id: eventId,
      timestamp,
      message: 'Event recorded successfully'
    });

  } catch (err) {
    console.error('Error recording event:', err);
    res.status(500).json({ 
      error: 'Failed to record event',
      details: err.message 
    });
  }
});

// GET /api/clocking/recent - Get recent events for dashboard
app.get('/api/clocking/recent', async (req, res) => {
  try {
    const { limit = 50, source = null, event_type = null } = req.query;

    let query = `
      SELECT 
        e.*,
        s.source_type,
        s.description as source_description
      FROM clocking_events e
      LEFT JOIN clocking_sources s ON e.source_id = s.id
      WHERE 1=1
    `;
    const params = [];
    let paramCount = 0;

    if (source) {
      paramCount++;
      query += ` AND e.source_name = $${paramCount}`;
      params.push(source);
    }

    if (event_type) {
      paramCount++;
      query += ` AND e.event_type = $${paramCount}`;
      params.push(event_type);
    }

    query += ` ORDER BY e.event_timestamp DESC LIMIT $${paramCount + 1}`;
    params.push(parseInt(limit));

    const result = await pool.query(query, params);

    res.json({
      success: true,
      events: result.rows,
      count: result.rows.length
    });

  } catch (err) {
    console.error('Error fetching recent events:', err);
    res.status(500).json({ 
      error: 'Failed to fetch events',
      details: err.message 
    });
  }
});

// GET /api/clocking/analytics - Get aggregated analytics
app.get('/api/clocking/analytics', async (req, res) => {
  try {
    const { period = 'daily', source = null } = req.query;

    let query = `
      SELECT 
        period_type,
        period_start,
        period_end,
        source_name,
        total_events,
        leads_captured,
        leads_qualified,
        demos_scheduled,
        payments_completed,
        total_revenue,
        conversion_rate,
        event_breakdown
      FROM clocking_analytics
      WHERE period_type = $1
    `;
    const params = [period];
    let paramCount = 1;

    if (source) {
      paramCount++;
      query += ` AND source_name = $${paramCount}`;
      params.push(source);
    }

    query += ` ORDER BY period_start DESC LIMIT 30`;

    const result = await pool.query(query, params);

    res.json({
      success: true,
      analytics: result.rows,
      period,
      source
    });

  } catch (err) {
    console.error('Error fetching analytics:', err);
    res.status(500).json({ 
      error: 'Failed to fetch analytics',
      details: err.message 
    });
  }
});

// GET /api/clocking/dashboard - Get dashboard summary
app.get('/api/clocking/dashboard', async (req, res) => {
  try {
    // Get today's stats
    const todayQuery = `
      SELECT 
        COUNT(*) as total_events,
        COUNT(*) FILTER (WHERE event_type = 'lead_captured') as leads_today,
        COUNT(*) FILTER (WHERE event_type = 'payment_completed') as sales_today,
        COALESCE(SUM(event_value) FILTER (WHERE event_type = 'payment_completed'), 0) as revenue_today
      FROM clocking_events
      WHERE event_timestamp >= CURRENT_DATE
    `;

    // Get top sources today
    const sourcesQuery = `
      SELECT 
        source_name,
        COUNT(*) as events,
        COUNT(*) FILTER (WHERE event_type = 'lead_captured') as leads,
        COUNT(*) FILTER (WHERE event_type = 'payment_completed') as sales
      FROM clocking_events
      WHERE event_timestamp >= CURRENT_DATE
      GROUP BY source_name
      ORDER BY events DESC
      LIMIT 5
    `;

    // Get top leads by score
    const leadsQuery = `
      SELECT 
        customer_email,
        customer_name,
        score,
        lead_status,
        last_interaction
      FROM lead_scores
      WHERE score > 50
      ORDER BY score DESC, last_interaction DESC
      LIMIT 10
    `;

    const [todayResult, sourcesResult, leadsResult] = await Promise.all([
      pool.query(todayQuery),
      pool.query(sourcesQuery),
      pool.query(leadsQuery)
    ]);

    res.json({
      success: true,
      today: todayResult.rows[0],
      top_sources: sourcesResult.rows,
      hot_leads: leadsResult.rows,
      timestamp: new Date()
    });

  } catch (err) {
    console.error('Error fetching dashboard data:', err);
    res.status(500).json({ 
      error: 'Failed to fetch dashboard data',
      details: err.message 
    });
  }
});

// POST /api/clocking/aggregate - Manually trigger analytics aggregation
app.post('/api/clocking/aggregate', async (req, res) => {
  try {
    const { period = 'daily', source_id = null } = req.body;

    await pool.query('SELECT aggregate_analytics($1, $2)', [period, source_id]);

    res.json({
      success: true,
      message: 'Analytics aggregation completed',
      period,
      source_id
    });

  } catch (err) {
    console.error('Error aggregating analytics:', err);
    res.status(500).json({ 
      error: 'Failed to aggregate analytics',
      details: err.message 
    });
  }
});

// WebSocket connection for real-time updates
io.on('connection', (socket) => {
  console.log('Client connected for real-time events');

  socket.on('subscribe_events', (data) => {
    console.log('Client subscribed to events:', data);
    socket.join('events');
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

// GET /api/clocking/stream - Server-Sent Events for real-time dashboard
app.get('/api/clocking/stream', (req, res) => {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Cache-Control'
  });

  // Send initial connection message
  res.write('data: {"type": "connected", "message": "Real-time stream connected"}\n\n');

  // Send periodic updates (every 30 seconds)
  const interval = setInterval(async () => {
    try {
      const result = await pool.query(`
        SELECT COUNT(*) as count, MAX(event_timestamp) as last_event
        FROM clocking_events 
        WHERE event_timestamp >= NOW() - INTERVAL '5 minutes'
      `);
      
      res.write(`data: ${JSON.stringify({
        type: 'stats_update',
        recent_events: result.rows[0].count,
        last_event: result.rows[0].last_event,
        timestamp: new Date()
      })}\n\n`);
    } catch (err) {
      console.error('Stream update error:', err);
    }
  }, 30000);

  // Handle client disconnect
  req.on('close', () => {
    clearInterval(interval);
    console.log('Client disconnected from stream');
  });
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`WebSocket server enabled for real-time events`);
});
