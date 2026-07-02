// src/intent/intentDetector.js
// Flow: rule-based keyword match FIRST -> only if no match, GPT fallback.
// This keeps costs down since most FAQ-style messages get caught by regex.

const { matchKeywordIntent } = require('./keywordRules');
const { chatModel } = require('../config/openai');
const { INTENT_SYSTEM_PROMPT } = require('../prompts/systemPrompts');
const { wrapAsUntrustedData } = require('../security/promptInjectionGuard');
const { getCached, setCached } = require('../cache/responseCache');

function safeParseJSON(text) {
  try {
    // strip accidental markdown fences just in case
    const cleaned = text.replace(/```json|```/g, '').trim();
    return JSON.parse(cleaned);
  } catch {
    return null;
  }
}

async function classifyWithGPT(message) {
  const userContent = wrapAsUntrustedData(message);

  const response = await chatModel.invoke([
    { role: 'system', content: INTENT_SYSTEM_PROMPT },
    { role: 'user', content: userContent },
  ]);

  // response.content is usually a string, but LangChain allows it to be an
  // array of content blocks depending on model/response shape — guard against
  // that instead of assuming .replace() exists.
  const rawText = typeof response.content === 'string'
    ? response.content
    : JSON.stringify(response.content);

  const parsed = safeParseJSON(rawText);
  if (!parsed || !parsed.intent) {
    return { intent: 'general_question', confidence: 0.3, method: 'gpt_fallback_parse_error' };
  }
  return { intent: parsed.intent, confidence: parsed.confidence ?? 0.7, method: 'gpt' };
}

/**
 * Detects intent for a customer message.
 * @param {string} message
 * @returns {Promise<{intent: string, confidence: number, method: string}>}
 */
async function detectIntent(message) {
  if (!message || !message.trim()) {
    return { intent: 'general_question', confidence: 0, method: 'empty_input' };
  }

  // 1. Rule-based first — free and instant.
  const ruleMatch = matchKeywordIntent(message);
  if (ruleMatch) return ruleMatch;

  // 2. Check FAQ cache before spending an API call.
  const cached = await getCached('intent', message);
  if (cached) return { ...cached, method: `${cached.method}_cached` };

  // 3. GPT fallback for open-ended queries.
  const result = await classifyWithGPT(message);
  // Don't cache parse-error fallbacks — a transient bad response shouldn't
  // poison the FAQ cache for this message for a full hour.
  if (result.method !== 'gpt_fallback_parse_error') {
    await setCached('intent', message, result);
  }
  return result;
}

module.exports = { detectIntent };
