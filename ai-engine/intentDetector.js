/**
 * Lightweight keyword-based intent detector.
 *
 * This covers exactly the QAs listed in the SRS. It's deliberately simple
 * (no OpenAI/LangChain call) so Module 5 can ship standalone; swap the body
 * of detectIntent() for an OpenAI/LangChain classifier later without
 * touching any WhatsApp code, since conversationEngine only depends on the
 * returned intent string.
 */

const INTENT_KEYWORDS = {
  greeting: ['hi', 'hello', 'salam', 'assalam', 'asalam', 'hey'],
  price: ['price', 'rate', 'cost', 'how much'],
  availability: ['available', 'in stock', 'is this available', 'stock hai'],
  size: ['size', 'sizes', 'medium', 'small', 'large', 'xl', 'size chart'],
  color: ['color', 'colour', 'colors', 'colours'],
  delivery: ['delivery', 'shipping', 'charges', 'how long', 'days', 'islamabad', 'lahore'],
  exchange_return: ['exchange', 'return', 'refund', 'damaged'],
  order_placement: ['order', 'place order', 'buy', 'purchase', 'i want to buy', 'i need'],
  tracking: ['track', 'tracking', 'parcel', 'order status'],
  discount: ['discount', 'sale', 'cheapest', 'under rs'],
};

function detectIntent(rawText = '') {
  const text = rawText.trim().toLowerCase();
  if (!text) return 'unknown';

  // "1".."5" style replies to the greeting menu are handled by the
  // conversation engine directly, not here.
  for (const [intent, keywords] of Object.entries(INTENT_KEYWORDS)) {
    if (keywords.some((kw) => text.includes(kw))) {
      return intent;
    }
  }
  return 'product_search'; // fallback: treat unmatched text as a product query
}

module.exports = { detectIntent };
