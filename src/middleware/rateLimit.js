const { redisClient } = require('../config/redis');
const { env } = require('../config/env');

const rateLimitWindow = 60; // 60 seconds
const maxRequests = 100;

async function rateLimiter(req, res, next) {
  try {
    if (!env.REDIS_URL) {
      return next();
    }

    if (!redisClient.isOpen) {
      await redisClient.connect();
    }

    const key = `rate:${req.ip}`;
    const current = await redisClient.incr(key);
    if (current === 1) {
      await redisClient.expire(key, rateLimitWindow);
    }

    if (current > maxRequests) {
      return res.status(429).json({ message: 'Too many requests. Please try again later.' });
    }

    next();
  } catch (error) {
    console.error('Rate limiter failed', error);
    next();
  }
}

module.exports = { rateLimiter };
