// src/intent/keywordRules.js
// Fast, free, deterministic intent matching. This runs FIRST.
// Only queries that don't match anything here fall through to GPT (cost control).

const RULES = [
  {
    intent: 'greeting',
    patterns: [
      /\b(hi|hello|hey|salam|assalam|asalam|aoa|hola)\b/i,
      /\bgood (morning|afternoon|evening)\b/i,
    ],
  },
  {
    // Checked BEFORE price_query: a message that names a product/category
    // (even alongside a price/budget) is a search/recommendation request,
    // not a plain price question. e.g. "black dresses under Rs 5000" must
    // route to Module 4's recommendation engine, not a bare price answer.
    intent: 'product_recommendation',
    patterns: [
      /\b(dress(es)?|shirt(s)?|kurta|outfit|trending|bestselling|casual|formal|under\s?rs)\b/i,
    ],
  },
  {
    intent: 'price_query',
    patterns: [
      // Removed the old bare "rs\.?\s?\d+" catch-all — it matched budget
      // mentions like "under Rs 5000" inside product searches. A standalone
      // price question uses one of these phrasings instead.
      /\b(price|cost|kitne|kitna|how much|price of|kitne (ka|ki|ke))\b/i,
      /\b(rate)\b/i,
      /\bpkr\b/i,
    ],
  },
  {
    intent: 'delivery_query',
    patterns: [
      /\b(deliver|delivery|shipping|ship|kab tak|arrive|tracking|track my order)\b/i,
    ],
  },
  {
    intent: 'size_query',
    patterns: [
      // "fit" narrowed to size-context phrasing to avoid false positives on
      // unrelated compliments/questions containing the word "fit".
      /\b(size|sizes|small|medium|large|xl|xxl|measurement|chart)\b/i,
      /\bfit(s)?\s+(me|well|true to size|small|large|tight|loose)\b/i,
      /\btrue to size\b/i,
    ],
  },
  {
    intent: 'color_query',
    patterns: [
      /\b(colou?r|colou?rs|available in|shade)\b/i,
    ],
  },
  {
    intent: 'exchange_return',
    patterns: [
      /\b(exchange|return|refund|replace)\b/i,
    ],
  },
  {
    // Split cancellation from status lookup — they need different downstream
    // handling even though both mention "my order".
    intent: 'order_cancel',
    patterns: [
      /\b(cancel (my )?order|order cancellation)\b/i,
    ],
  },
  {
    intent: 'order_status',
    patterns: [
      /\b(order status|my order|where is my order|order number)\b/i,
    ],
  },
];

/**
 * Attempts rule-based intent classification.
 * @param {string} message - raw customer message
 * @returns {{intent: string, confidence: number, method: 'rule'} | null}
 */
function matchKeywordIntent(message) {
  if (!message || typeof message !== 'string') return null;
  const normalized = message.trim();

  for (const rule of RULES) {
    for (const pattern of rule.patterns) {
      if (pattern.test(normalized)) {
        return { intent: rule.intent, confidence: 0.9, method: 'rule' };
      }
    }
  }
  return null; // no match -> caller should fall back to GPT
}

module.exports = { matchKeywordIntent, RULES };


// Suggested additional keywords:
// delivery: ["ship","shipping","cash on delivery","cod","dispatch"]
// size: ["xs","s","m","l","xl","xxl","medium","large","small"]
// products: ["hoodie","jeans","kurta","abaya","cargo","polo"]
