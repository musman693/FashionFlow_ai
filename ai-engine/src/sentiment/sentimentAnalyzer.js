// src/sentiment/sentimentAnalyzer.js
// Detects Happy / Angry / Frustrated / Interested / Neutral.
// Quick lexicon pass for unmistakable cases (saves API calls), GPT for everything else.

const { chatModel } = require('../config/openai');
const { SENTIMENT_SYSTEM_PROMPT } = require('../prompts/systemPrompts');
const { wrapAsUntrustedData } = require('../security/promptInjectionGuard');
const { getCached, setCached } = require('../cache/responseCache');

// Only catches VERY unambiguous signals — anything murky goes to GPT rather than
// risk misreading a customer's tone.
const QUICK_LEXICON = [
  { sentiment: 'Angry', pattern: /\b(scam|fraud|useless|worst|terrible|angry|disgusting|refund now)\b/i },
  { sentiment: 'Frustrated', pattern: /\b(still waiting|not working|no response|frustrated|annoyed|again\?+)\b/i },
  { sentiment: 'Happy', pattern: /\b(thank you|thanks|love it|great|awesome|perfect|😊|❤️|👍)\b/i },
];

function quickCheck(message) {
  for (const rule of QUICK_LEXICON) {
    if (rule.pattern.test(message)) {
      return { sentiment: rule.sentiment, confidence: 0.75, method: 'lexicon' };
    }
  }
  return null;
}

function safeParseJSON(text) {
  try {
    const cleaned = text.replace(/```json|```/g, '').trim();
    return JSON.parse(cleaned);
  } catch {
    return null;
  }
}

async function classifyWithGPT(message) {
  const userContent = wrapAsUntrustedData(message);

  const response = await chatModel.invoke([
    { role: 'system', content: SENTIMENT_SYSTEM_PROMPT },
    { role: 'user', content: userContent },
  ]);

  // Guard against response.content being an array of content blocks instead
  // of a plain string (LangChain allows either depending on response shape).
  const rawText = typeof response.content === 'string'
    ? response.content
    : JSON.stringify(response.content);

  const parsed = safeParseJSON(rawText);
  if (!parsed || !parsed.sentiment) {
    return { sentiment: 'Neutral', confidence: 0.3, method: 'gpt_fallback_parse_error' };
  }
  return { sentiment: parsed.sentiment, confidence: parsed.confidence ?? 0.7, method: 'gpt' };
}

/**
 * @param {string} message
 * @returns {Promise<{sentiment: string, confidence: number, method: string}>}
 */
async function analyzeSentiment(message) {
  if (!message || !message.trim()) {
    return { sentiment: 'Neutral', confidence: 0, method: 'empty_input' };
  }

  const quick = quickCheck(message);
  if (quick) return quick;

  const cached = await getCached('sentiment', message);
  if (cached) return { ...cached, method: `${cached.method}_cached` };

  const result = await classifyWithGPT(message);
  // Don't cache parse-error fallbacks — avoids poisoning the cache for an
  // hour on a transient bad GPT response.
  if (result.method !== 'gpt_fallback_parse_error') {
    await setCached('sentiment', message, result);
  }
  return result;
}

module.exports = { analyzeSentiment };


// Suggested vocabulary additions:
// interested: curious, looking, searching
// frustrated: waiting, delayed, no reply
// angry: terrible, awful, unacceptable
