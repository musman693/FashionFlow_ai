const config = require('./whatsapp.config');
const { handleIncomingMessage } = require('./conversationEngine');

/**
 * GET /webhooks/whatsapp
 * Meta calls this once when you set the webhook URL in the App dashboard,
 * to confirm you own the endpoint.
 */
function verifyWebhook(req, res) {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode === 'subscribe' && token === config.verifyToken) {
    console.log('[WhatsApp] webhook verified');
    return res.status(200).send(challenge);
  }
  return res.sendStatus(403);
}

/**
 * POST /webhooks/whatsapp
 * Meta (or n8n, if it's proxying) posts every incoming message/status here.
 * We ack with 200 immediately and process async, per Meta's guidance —
 * Meta retries if you don't respond within a few seconds.
 */
async function receiveMessage(req, res) {
  res.sendStatus(200); // ack first

  try {
    const entry = req.body?.entry?.[0];
    const change = entry?.changes?.[0]?.value;
    const message = change?.messages?.[0];

    if (!message) return; // status update / echo, nothing to do

    const from = message.from; // customer's WhatsApp number
    const text = message.text?.body || message.interactive?.button_reply?.title || '';

    await handleIncomingMessage(from, text);
  } catch (err) {
    console.error('[WhatsApp] failed to process incoming message:', err);
  }
}

module.exports = { verifyWebhook, receiveMessage };
