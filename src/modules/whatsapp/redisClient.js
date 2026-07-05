/**
 * Thin Redis wrapper used to persist each customer's conversation/order
 * state machine (Section 2.4 of the blueprint).
 * Key: whatsapp:session:<phoneNumber>   Value: JSON string of session object
 */

const { createClient } = require('redis');
const config = require('./whatsapp.config');

const client = createClient({ url: config.redisUrl });

client.on('error', (err) => console.error('[Redis] connection error:', err));

let connected = false;
async function ensureConnected() {
  if (!connected) {
    await client.connect();
    connected = true;
    console.log('[Redis] connected for WhatsApp session store');
  }
}

const sessionKey = (phone) => `whatsapp:session:${phone}`;

async function getSession(phone) {
  await ensureConnected();
  const raw = await client.get(sessionKey(phone));
  return raw ? JSON.parse(raw) : null;
}

async function saveSession(phone, session) {
  await ensureConnected();
  await client.set(sessionKey(phone), JSON.stringify(session), {
    EX: config.sessionTTLSeconds,
  });
}

async function clearSession(phone) {
  await ensureConnected();
  await client.del(sessionKey(phone));
}

module.exports = { getSession, saveSession, clearSession };
