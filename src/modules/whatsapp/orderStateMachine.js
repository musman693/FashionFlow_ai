/**
 * Drives the order-placement flow described in Section 2.4:
 *   size -> color -> address -> confirmation message
 *
 * State lives in Redis (via redisClient) keyed by customer phone number so
 * the bot survives restarts and works across multiple n8n/webhook calls.
 *
 * ASSUMPTION: src/modules/orders/order.service.js exports
 *   createOrder({ customerPhone, productId, size, color, address }) -> Order
 * Adjust the import to match your real Orders module.
 */

const { getSession, saveSession, clearSession } = require('./redisClient');
const { createOrder } = require('../orders/order.service');

const STEPS = {
  AWAITING_SIZE: 'AWAITING_SIZE',
  AWAITING_COLOR: 'AWAITING_COLOR',
  AWAITING_ADDRESS: 'AWAITING_ADDRESS',
  CONFIRMING: 'CONFIRMING',
};

/** Kick off the order flow for a chosen product. */
async function startOrder(phone, product) {
  const session = {
    step: STEPS.AWAITING_SIZE,
    order: { productId: product.id || product._id, productName: product.name },
  };
  await saveSession(phone, session);
  return `Great choice! What size would you like — S, M, L or XL?`;
}

/** Feed the next customer reply into whichever step we're on. Returns the bot's reply text, or null if this session isn't in an order flow. */
async function handleOrderStep(phone, text) {
  const session = await getSession(phone);
  if (!session || !session.step || !STEPS[session.step]) return null;

  switch (session.step) {
    case STEPS.AWAITING_SIZE:
      session.order.size = text.trim().toUpperCase();
      session.step = STEPS.AWAITING_COLOR;
      await saveSession(phone, session);
      return 'Got it. Which color would you like?';

    case STEPS.AWAITING_COLOR:
      session.order.color = text.trim();
      session.step = STEPS.AWAITING_ADDRESS;
      await saveSession(phone, session);
      return 'Please share your complete delivery address (house/street, city).';

    case STEPS.AWAITING_ADDRESS:
      session.order.address = text.trim();
      session.step = STEPS.CONFIRMING;
      await saveSession(phone, session);
      return buildConfirmationPrompt(session.order);

    case STEPS.CONFIRMING:
      if (/^(yes|confirm|haan|ok)/i.test(text.trim())) {
        const order = await createOrder({
          customerPhone: phone,
          productId: session.order.productId,
          size: session.order.size,
          color: session.order.color,
          address: session.order.address,
        });
        await clearSession(phone);
        return `Your order is confirmed! ✅\nOrder ID: ${order.id || order._id}\nWe'll notify you once it ships. Thank you for shopping with FashionHub ❤`;
      }
      await clearSession(phone);
      return 'No problem, I\'ve cancelled that order. Let me know if you\'d like to start over.';

    default:
      return null;
  }
}

function buildConfirmationPrompt(order) {
  return (
    `Please confirm your order:\n\n` +
    `Product: ${order.productName}\n` +
    `Size: ${order.size}\n` +
    `Color: ${order.color}\n` +
    `Address: ${order.address}\n\n` +
    `Reply "yes" to confirm or "no" to cancel.`
  );
}

async function isInOrderFlow(phone) {
  const session = await getSession(phone);
  return !!(session && session.step && STEPS[session.step]);
}

module.exports = { startOrder, handleOrderStep, isInOrderFlow, STEPS };
