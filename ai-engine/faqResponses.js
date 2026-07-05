/**
 * Static FAQ replies for the intents that don't need a DB lookup.
 * Product-related intents (availability/size/color when a product is
 * already in context) are enriched further in conversationEngine.js.
 */

const FAQ_RESPONSES = {
  price: 'Our prices vary by product — could you tell me which item you\'re interested in? You can also type "New Arrivals" to browse.',
  availability: 'Most items are in stock! Tell me the product name and I\'ll confirm availability for you.',
  size: 'We carry Small, Medium, Large and XL. Reply with a product name and I can confirm exact sizes in stock.',
  color: 'Available colors depend on the product — send me the item name (e.g. "black dress") and I\'ll show you the color options.',
  delivery: 'Delivery within Islamabad/Lahore usually takes 2-3 working days, and 3-5 days elsewhere in Pakistan. Delivery charges are calculated at checkout.',
  exchange_return: 'We offer exchange/return within 7 days of delivery for unused items with tags intact. If you received a damaged item, please share a photo and your order ID.',
  tracking: 'Please share your Order ID and I\'ll fetch the latest status for you.',
  discount: 'Check out our current sale items by typing "Sale" — I\'ll list discounted products for you.',
};

function getFaqResponse(intent) {
  return FAQ_RESPONSES[intent] || null;
}

module.exports = { getFaqResponse };
