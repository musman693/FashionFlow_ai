/**
 * Talks to the WhatsApp Cloud API. Every outbound message goes through here.
 */

const axios = require('axios');
const config = require('./whatsapp.config');

const client = axios.create({
  baseURL: config.baseUrl,
  headers: {
    Authorization: `Bearer ${config.token}`,
    'Content-Type': 'application/json',
  },
});

async function sendText(to, body) {
  return client.post('', {
    messaging_product: 'whatsapp',
    to,
    type: 'text',
    text: { body },
  });
}

/**
 * Numbered-list style menu. WhatsApp free-text numbers ("1", "2"...) are
 * matched back to these options in conversationEngine.js — this keeps the
 * bot simple and avoids relying on interactive message templates that need
 * pre-approval.
 */
async function sendMenu(to, heading, options) {
  const lines = options.map((opt, i) => `${i + 1}. ${opt}`).join('\n');
  return sendText(to, `${heading}\n\n${lines}`);
}

async function sendProductCards(to, products) {
  const lines = products
    .map((p) => `*${p.name}*\nPrice: Rs ${p.price}`)
    .join('\n\n');
  return sendText(to, `I found these options for you:\n\n${lines}\n\nWould you like to place an order? (yes/no)`);
}

module.exports = { sendText, sendMenu, sendProductCards };
