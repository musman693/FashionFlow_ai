// src/controllers/aiController.js

const { detectIntent } = require('../intent/intentDetector');
const { analyzeSentiment } = require('../sentiment/sentimentAnalyzer');
const { generateReply } = require('../intent/replyGenerator');
const { looksLikeInjectionAttempt } = require('../security/promptInjectionGuard');

async function handleIntent(req, res) {
  try {
    const { message } = req.body;
    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'message (string) is required' });
    }

    const flagged = looksLikeInjectionAttempt(message);
    const result = await detectIntent(message);

    return res.json({ ...result, flagged_injection_attempt: flagged });
  } catch (err) {
    console.error('[ai-engine] /ai/intent error:', err);
    return res.status(500).json({ error: 'intent detection failed' });
  }
}

async function handleSentiment(req, res) {
  try {
    const { message } = req.body;
    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'message (string) is required' });
    }

    const result = await analyzeSentiment(message);
    return res.json(result);
  } catch (err) {
    console.error('[ai-engine] /ai/sentiment error:', err);
    return res.status(500).json({ error: 'sentiment analysis failed' });
  }
}

async function handleGenerateReply(req, res) {
  try {
    const { message, intent, sentiment, productContext, customerName } = req.body;
    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'message (string) is required' });
    }

    const reply = await generateReply(message, {
      intent,
      sentiment,
      productContext,
      customerName,
    });

    return res.json({ reply });
  } catch (err) {
    console.error('[ai-engine] /ai/generate-reply error:', err);
    return res.status(500).json({ error: 'reply generation failed' });
  }
}

module.exports = { handleIntent, handleSentiment, handleGenerateReply };
