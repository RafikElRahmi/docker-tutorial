const express = require('express');
const { Pool } = require('pg');
const Redis = require('ioredis');

const app = express();
const PORT = process.env.PORT || 3000;

// PostgreSQL connection
const pgPool = new Pool({
  host: process.env.POSTGRES_HOST || 'postgres',
  port: parseInt(process.env.POSTGRES_PORT, 10) || 5432,
  user: process.env.POSTGRES_USER || 'dockeruser',
  password: process.env.POSTGRES_PASSWORD || 'dockerpass',
  database: process.env.POSTGRES_DB || 'tutorialdb',
});

// Redis connection
const redis = new Redis({
  host: process.env.REDIS_HOST || 'redis',
  port: parseInt(process.env.REDIS_PORT, 10) || 6379,
});

app.get('/', async (req, res) => {
  try {
    // Record visit in PostgreSQL
    const ip = req.ip || req.connection.remoteAddress;
    await pgPool.query(
      'INSERT INTO visits (visitor_ip) VALUES ($1)',
      [ip]
    );

    // Increment visit counter in Redis
    await redis.incr('visit_count');
    const count = await redis.get('visit_count');

    // Get total visits from PostgreSQL
    const result = await pgPool.query('SELECT COUNT(*) FROM visits');
    const totalVisits = result.rows[0].count;

    res.json({
      message: 'Hello from Docker with PostgreSQL and Redis!',
      timestamp: new Date().toISOString(),
      redisVisitCount: parseInt(count, 10),
      postgresTotalVisits: parseInt(totalVisits, 10),
    });
  } catch (err) {
    res.status(500).json({
      error: 'Database error',
      message: err.message,
    });
  }
});

app.get('/health', async (req, res) => {
  try {
    await pgPool.query('SELECT 1');
    await redis.ping();
    res.status(200).json({ status: 'ok', services: ['postgres', 'redis'] });
  } catch (err) {
    res.status(503).json({ status: 'unhealthy', error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
