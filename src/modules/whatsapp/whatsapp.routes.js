const express = require('express');
const { verifyWebhook, receiveMessage } = require('./whatsapp.controller');

const router = express.Router();

router.get('/webhooks/whatsapp', verifyWebhook);
router.post('/webhooks/whatsapp', receiveMessage);

module.exports = router;
