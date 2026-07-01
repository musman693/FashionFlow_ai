require('dotenv').config();
const { redisClient } = require('../config/redis');
const CacheService = require('../services/cacheService');

async function testRedisLayer() {
  try {
    console.log('Connecting to Redis...');
    await redisClient.connect();
    console.log('Connected to Redis successfully.');

    // 1. Conversation Session (30 mins TTL)
    console.log('\n--- Testing Conversation Session ---');
    const sessionId = 'sess_12345';
    await CacheService.setSession(sessionId, { user: 'Momin', status: 'active' });
    const session = await CacheService.getSession(sessionId);
    console.log('Session retrieved:', session);

    // 2. Product Catalog Cache (10 mins TTL) & Invalidation
    console.log('\n--- Testing Product Catalog Cache & Invalidation ---');
    const category = 'Tops';
    await CacheService.setCatalogCategory(category, [{ id: 1, name: 'Shirt' }, { id: 2, name: 'Hoodie' }]);
    let catalog = await CacheService.getCatalogCategory(category);
    console.log('Catalog retrieved before invalidation:', catalog);
    
    // Admin updates a product, invalidate category cache
    console.log('Simulating admin updating product in Tops...');
    await CacheService.invalidateCategoryCache(category);
    catalog = await CacheService.getCatalogCategory(category);
    console.log('Catalog retrieved after invalidation (should be null):', catalog);

    // 3. Order State Machine (24 hr TTL)
    console.log('\n--- Testing Order State ---');
    const orderId = 'ord_9988';
    await CacheService.setOrderState(orderId, { status: 'processing', timestamp: Date.now() });
    const orderState = await CacheService.getOrderState(orderId);
    console.log('Order state retrieved:', orderState);

    // 4. FAQ Cache (1 hr TTL)
    console.log('\n--- Testing FAQ Cache ---');
    await CacheService.setFAQ('returns_policy', { answer: 'You can return within 30 days.' });
    const faq = await CacheService.getFAQ('returns_policy');
    console.log('FAQ retrieved:', faq);

  } catch (err) {
    console.error('Redis Test Error:', err);
  } finally {
    console.log('\nDisconnecting Redis...');
    await redisClient.quit();
  }
}

testRedisLayer();
