// src/intent/replyGenerator.js
// Generates the final natural-language reply, given intent + sentiment + optional
// product/context data (e.g. passed in from Module 4's recommendation engine).

const { chatModel } = require('../config/openai');
const { REPLY_SYSTEM_PROMPT } = require('../prompts/systemPrompts');
const { wrapAsUntrustedData } = require('../security/promptInjectionGuard');

/**
 * @param {string} message - raw customer message
 * @param {object} context - { intent, sentiment, productContext, customerName }
 * @returns {Promise<string>}
 */
async function generateReply(message, context = {}) {
  const { intent, sentiment, productContext, customerName } = context;

  const contextBlock = `<context>
intent: ${intent || 'unknown'}
sentiment: ${sentiment || 'unknown'}
customer_name: ${customerName || 'unknown'}
product_context: ${productContext ? JSON.stringify(productContext) : 'none provided'}
</context>`;

  const userContent = `${wrapAsUntrustedData(message)}\n${contextBlock}`;

  const response = await chatModel.invoke([
    { role: 'system', content: REPLY_SYSTEM_PROMPT },
    { role: 'user', content: userContent },
  ]);

  const rawText = typeof response.content === 'string'
    ? response.content
    : JSON.stringify(response.content);

  return rawText.trim();
}

module.exports = { generateReply };
