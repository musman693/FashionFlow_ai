// src/routes/aiRoutes.js
// These are INTERNAL endpoints — not exposed directly to WhatsApp/Instagram.
// Module 5 (WhatsApp) and Module 6 (Instagram) call these from the shared
// conversation flow engine after receiving a webhook event.
//
// Mount in the main app (Usman's Module 1 server) like:
//   const aiRoutes = require('./ai/routes/aiRoutes');
//   app.use('/ai', aiRoutes);

const express = require('express');
const router = express.Router();
const {
  handleIntent,
  handleSentiment,
  handleGenerateReply,
} = require('../controllers/aiController');

router.post('/intent', handleIntent);
router.post('/sentiment', handleSentiment);
router.post('/generate-reply', handleGenerateReply);

module.exports = router;
