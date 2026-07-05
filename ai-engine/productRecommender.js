/**
 * Bridges free-text product queries ("I need a black dress for Eid") to the
 * existing Product module that another intern already built.
 *
 * ASSUMPTION: src/modules/products/product.service.js exports
 *   searchProducts({ color, category, maxPrice, keyword }) -> Promise<Product[]>
 * Adjust the import path / function signature below to match your actual
 * Products module — this file is the ONLY place that needs to change.
 */

const { searchProducts } = require('../src/modules/products/product.service');

const COLOR_WORDS = ['black', 'white', 'red', 'blue', 'green', 'beige', 'pink', 'yellow', 'maroon'];
const CATEGORY_WORDS = {
  dress: 'dresses',
  shirt: 'shirts',
  handbag: 'handbags',
  shoes: 'shoes',
  jeans: 'jeans',
};

function extractFilters(text) {
  const lower = text.toLowerCase();
  const filters = {};

  const color = COLOR_WORDS.find((c) => lower.includes(c));
  if (color) filters.color = color;

  const categoryWord = Object.keys(CATEGORY_WORDS).find((c) => lower.includes(c));
  if (categoryWord) filters.category = CATEGORY_WORDS[categoryWord];

  const underMatch = lower.match(/under\s*rs\.?\s*(\d+)/);
  if (underMatch) filters.maxPrice = Number(underMatch[1]);

  filters.keyword = text;
  return filters;
}

async function recommendProducts(text, limit = 3) {
  const filters = extractFilters(text);
  try {
    const results = await searchProducts(filters);
    return results.slice(0, limit);
  } catch (err) {
    console.error('[productRecommender] search failed:', err.message);
    return [];
  }
}

module.exports = { recommendProducts, extractFilters };
