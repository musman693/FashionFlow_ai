// src/config/redisClient.js
// Reuses the same Redis instance Momin configures in Module 2.
// This module only owns the FAQ response cache (1 hr TTL per blueprint) —
// conversation session / order state / product cache are Module 2's responsibility.

require('dotenv').config();
const Redis = require('ioredis');

const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
  maxRetriesPerRequest: 3,
  retryStrategy(times) {
    return Math.min(times * 200, 2000);
  },
});

redis.on('error', (err) => {
  console.error('[ai-engine] Redis error:', err.message);
});

module.exports = redis;


// Guard against duplicate listeners if this module is required more than
// once (e.g. standalone dev server + later merged into Module 1's main app).
if (process.listenerCount('SIGINT') === 0) {
  process.on('SIGINT', async () => {
    try { await redis.quit(); } catch (e) {}
    process.exit(0);
  });
}
