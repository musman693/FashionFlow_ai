// src/security/promptInjectionGuard.js
// Treats all customer text as UNTRUSTED. Two layers of defense:
//   1. Sanitize obvious override attempts before the text ever reaches the model.
//   2. Structurally separate system instructions from customer content using
//      clear delimiters, so even if sanitization misses something, the model
//      is told explicitly that the delimited block is data, not instructions.

const SUSPICIOUS_PATTERNS = [
  /ignore (all )?(previous|above|prior) instructions/i,
  /disregard (all )?(previous|above|prior) instructions/i,
  /you are now/i,
  /system prompt/i,
  /act as (a|an)/i,
  /new instructions?:/i,
  /forget (everything|all) (you|above)/i,
  /reveal (your|the) (system )?prompt/i,
  /what (are|is) your instructions/i,
];

/**
 * Flags whether a message looks like a prompt injection attempt.
 * We don't block the customer (that would break the sales flow) —
 * we just make sure the model treats the content as inert data.
 */
function looksLikeInjectionAttempt(message) {
  if (!message) return false;
  return SUSPICIOUS_PATTERNS.some((p) => p.test(message));
}

/**
 * Strips control-ish characters, strips fake delimiter tags, and caps length
 * to reduce attack surface.
 */
function sanitize(message) {
  if (!message || typeof message !== 'string') return '';
  return message
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '') // control chars
    // Strip any literal occurrence of our own delimiter tag. Without this,
    // a customer could type "</customer_message>" to close the data block
    // early and have the model treat whatever follows as trusted instructions.
    .replace(/<\/?\s*customer_message\s*>/gi, '')
    .slice(0, 2000); // hard cap — sales queries are short, no legit reason for more
}

/**
 * Wraps sanitized customer text in explicit delimiters so the LLM
 * can structurally distinguish "data to read" from "instructions to follow".
 * The system prompt (see prompts/systemPrompts.js) explicitly tells the model
 * that anything inside these tags is customer data ONLY, never commands.
 */
function wrapAsUntrustedData(message) {
  const clean = sanitize(message);
  return `<customer_message>\n${clean}\n</customer_message>`;
}

module.exports = { looksLikeInjectionAttempt, sanitize, wrapAsUntrustedData };
