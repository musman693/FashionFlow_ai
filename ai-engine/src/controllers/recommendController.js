// src/controllers/recommendController.js

const { processRecommendation } = require('../recommendation/recommendEngine');

async function handleProductRecommendation(req, res) {
  try {
    const { message } = req.body;
    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'message string is required for recommendation' });
    }

    const output = await processRecommendation(message);
    return res.json(output);
  } catch (err) {
    console.error('[ai-engine] /ai/recommend critical error:', err);
    return res.status(500).json({ error: 'Recommendation generation pipeline failed.' });
  }
}

module.exports = { handleProductRecommendation };