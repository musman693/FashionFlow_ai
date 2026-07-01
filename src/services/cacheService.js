const { redisClient } = require('../config/redis');

// TTL values in seconds
const TTL = {
  SESSION: 30 * 60,       // 30 mins
  CATALOG: 10 * 60,       // 10 mins
  ORDER_STATE: 24 * 3600, // 24 hours
  FAQ: 60 * 60            // 1 hour
};

class CacheService {
  /**
   * Conversation session storage
   */
  static async setSession(sessionId, data) {
    await redisClient.set(`session:${sessionId}`, JSON.stringify(data), { EX: TTL.SESSION });
  }

  static async getSession(sessionId) {
    const data = await redisClient.get(`session:${sessionId}`);
    return data ? JSON.parse(data) : null;
  }

  /**
   * Product catalog cache (by category)
   */
  static async setCatalogCategory(category, products) {
    await redisClient.set(`catalog:${category}`, JSON.stringify(products), { EX: TTL.CATALOG });
  }

  static async getCatalogCategory(category) {
    const data = await redisClient.get(`catalog:${category}`);
    return data ? JSON.parse(data) : null;
  }

  /**
   * Invalidate category cache (e.g. when an admin updates a product)
   */
  static async invalidateCategoryCache(category) {
    await redisClient.del(`catalog:${category}`);
  }

  /**
   * Order state machine caching
   */
  static async setOrderState(orderId, state) {
    await redisClient.set(`order_state:${orderId}`, JSON.stringify(state), { EX: TTL.ORDER_STATE });
  }

  static async getOrderState(orderId) {
    const data = await redisClient.get(`order_state:${orderId}`);
    return data ? JSON.parse(data) : null;
  }

  /**
   * FAQ Cache
   */
  static async setFAQ(key, faqData) {
    await redisClient.set(`faq:${key}`, JSON.stringify(faqData), { EX: TTL.FAQ });
  }

  static async getFAQ(key) {
    const data = await redisClient.get(`faq:${key}`);
    return data ? JSON.parse(data) : null;
  }
}

module.exports = CacheService;
