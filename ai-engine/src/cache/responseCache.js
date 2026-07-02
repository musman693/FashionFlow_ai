// src/cache/responseCache.js
// Caches GPT responses for repeated FAQ-style queries so we don't pay for the
// same "what are your delivery charges" question a hundred times. 1hr TTL (blueprint).

const crypto = require('crypto');
const redis = require('../config/redisClient');

const TTL = parseInt(process.env.FAQ_CACHE_TTL_SECONDS || '3600', 10);
const PREFIX = 'ai:faqcache:';

function buildKey(namespace, message) {
  // Normalize so "Price?" and "price?" and "  price? " hit the same cache entry.
  const normalized = message.trim().toLowerCase().replace(/\s+/g, ' ');
  const hash = crypto.createHash('sha1').update(normalized).digest('hex');
  return `${PREFIX}${namespace}:${hash}`;
}

async function getCached(namespace, message) {
  try {
    const key = buildKey(namespace, message);
    const value = await redis.get(key);
    return value ? JSON.parse(value) : null;
  } catch (err) {
    console.error('[ai-engine] cache read failed:', err.message);
    return null; // fail open — cache is an optimization, not a dependency
  }
}

async function setCached(namespace, message, data) {
  try {
    const key = buildKey(namespace, message);
    await redis.set(key, JSON.stringify(data), 'EX', TTL);
  } catch (err) {
    console.error('[ai-engine] cache write failed:', err.message);
  }
}

module.exports = { getCached, setCached };
