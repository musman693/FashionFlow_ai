// src/routes/instagramRoutes.js
const express = require('express');
const { verifyWebhook, handleWebhookEvent } = require('../controllers/instagramController');

const router = express.Router();

// Meta verification route
router.get('/instagram', verifyWebhook);

// Instagram incoming messages route
router.post('/instagram', handleWebhookEvent);

module.exports = router;