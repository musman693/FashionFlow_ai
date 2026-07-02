// src/config/openai.js
// Central LangChain.js OpenAI client setup — gpt-4o-mini for cost control (per blueprint)

require('dotenv').config();
const { ChatOpenAI } = require('@langchain/openai');

if (!process.env.OPENAI_API_KEY) {
  console.warn('[ai-engine] WARNING: OPENAI_API_KEY is not set. GPT fallback calls will fail.');
}

// Low temperature — we want consistent, predictable classification/reply behavior,
// not creative variance, for a sales assistant.
const chatModel = new ChatOpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
  temperature: 0.3,
  maxTokens: 400,
});

module.exports = { chatModel };
