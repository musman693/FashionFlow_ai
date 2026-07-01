const Redis = require('redis');
const { env } = require('./env');

const redisClient = Redis.createClient({ url: env.REDIS_URL });

redisClient.on('error', (err) => {
  console.error('Redis client error', err);
});

module.exports = { redisClient };
