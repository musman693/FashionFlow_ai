/**
 * WhatsApp Cloud API configuration
 * Pull every secret from .env — never hardcode tokens.
 *
 * Required .env keys:
 *   WHATSAPP_TOKEN            -> Meta permanent/temporary access token
 *   WHATSAPP_PHONE_NUMBER_ID  -> Sender phone number id (from Meta App dashboard)
 *   WHATSAPP_VERIFY_TOKEN     -> Any string you choose, used for webhook GET verification
 *   WHATSAPP_API_VERSION      -> e.g. v20.0 (optional, defaults below)
 *   REDIS_URL                 -> e.g. redis://localhost:6379
 */

module.exports = {
  token: process.env.WHATSAPP_TOKEN,
  phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID,
  verifyToken: process.env.WHATSAPP_VERIFY_TOKEN,
  apiVersion: process.env.WHATSAPP_API_VERSION || 'v20.0',
  get baseUrl() {
    return `https://graph.facebook.com/${this.apiVersion}/${this.phoneNumberId}/messages`;
  },
  redisUrl: process.env.REDIS_URL || 'redis://localhost:6379',
  sessionTTLSeconds: 60 * 60 * 6, // 6 hours of inactivity clears the conversation state
};
