/**
 * Core conversation logic for the WhatsApp bot.
 * Flow: greeting menu -> intent routing -> product reply -> order state machine
 *
 * Called once per incoming customer message by whatsapp.controller.js.
 */

const { sendText, sendMenu, sendProductCards } = require('./whatsapp.service');
const { startOrder, handleOrderStep, isInOrderFlow } = require('./orderStateMachine');
const { detectIntent } = require('../../../ai-engine/intentDetector');
const { getFaqResponse } = require('../../../ai-engine/faqResponses');
const { recommendProducts } = require('../../../ai-engine/productRecommender');

const MAIN_MENU = ['New Arrivals', "Women's Collection", "Men's Collection", 'Order Tracking', 'Delivery Information'];

async function handleIncomingMessage(phone, text) {
  const trimmed = (text || '').trim();

  // 1. If the customer is mid order-flow (size/color/address/confirm),
  //    that state machine owns the conversation until it finishes.
  if (await isInOrderFlow(phone)) {
    const reply = await handleOrderStep(phone, trimmed);
    if (reply) return sendText(phone, reply);
  }

  // 2. Menu numeral shortcuts ("1".."5") from the greeting menu.
  if (/^[1-5]$/.test(trimmed)) {
    return handleMenuSelection(phone, Number(trimmed));
  }

  // 3. Otherwise run intent detection.
  const intent = detectIntent(trimmed);

  switch (intent) {
    case 'greeting':
      return sendMenu(
        phone,
        'Welcome to FashionHub ❤\nThank you for contacting us.\nHow may I help you today?',
        MAIN_MENU
      );

    case 'order_placement':
      return handleProductLookupOrOrder(phone, trimmed, { forceOrder: true });

    case 'product_search':
      return handleProductLookupOrOrder(phone, trimmed);

    case 'tracking':
      return sendText(phone, getFaqResponse('tracking'));

    case 'price':
    case 'availability':
    case 'size':
    case 'color':
    case 'delivery':
    case 'exchange_return':
    case 'discount': {
      const faq = getFaqResponse(intent);
      return sendText(phone, faq);
    }

    default:
      return sendText(phone, "Sorry, I didn't quite get that. Type \"Hi\" to see the main menu.");
  }
}

async function handleMenuSelection(phone, choice) {
  const map = {
    1: () => handleProductLookupOrOrder(phone, 'new arrivals'),
    2: () => handleProductLookupOrOrder(phone, "women's collection"),
    3: () => handleProductLookupOrOrder(phone, "men's collection"),
    4: () => sendText(phone, getFaqResponse('tracking')),
    5: () => sendText(phone, getFaqResponse('delivery')),
  };
  return (map[choice] || (() => sendText(phone, 'Please choose a valid option (1-5).')))();
}

/**
 * Looks up products for the customer's query. If exactly one strong match
 * is found and the customer explicitly asked to order, jump straight into
 * the order state machine; otherwise show recommendations and let them
 * reply "yes"/product name to proceed.
 */
async function handleProductLookupOrOrder(phone, text, { forceOrder = false } = {}) {
  const products = await recommendProducts(text);

  if (!products.length) {
    return sendText(phone, "I couldn't find a matching product right now. Could you describe it differently (e.g. color, category, budget)?");
  }

  if (forceOrder && products.length === 1) {
    const prompt = await startOrder(phone, products[0]);
    return sendText(phone, prompt);
  }

  return sendProductCards(phone, products);
}

module.exports = { handleIncomingMessage };
