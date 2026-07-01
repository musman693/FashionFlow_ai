const crypto = require('crypto');
const { env } = require('../config/env');

function verifySignature(rawBody, signatureHeader) {
  if (!env.WEBHOOK_SECRET) {
    throw new Error('WEBHOOK_SECRET is not configured');
  }

  const expectedSignature = crypto
    .createHmac('sha256', env.WEBHOOK_SECRET)
    .update(rawBody || '')
    .digest('hex');

  return signatureHeader === expectedSignature;
}

module.exports = { verifySignature };
