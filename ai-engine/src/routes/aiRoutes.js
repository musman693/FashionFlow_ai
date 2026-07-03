const express = require('express');
const router = express.Router();
const {
  handleIntent,
  handleSentiment,
  handleGenerateReply,
} = require('../controllers/aiController');
const { handleProductRecommendation } = require('../controllers/recommendController');

router.post('/intent', handleIntent);
router.post('/sentiment', handleSentiment);
router.post('/generate-reply', handleGenerateReply);

// Module 4 - Seamless integration point
router.post('/recommend', handleProductRecommendation);

module.exports = router;