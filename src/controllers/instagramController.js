// src/controllers/instagramController.js
const axios = require('axios');

// 1. Verification Endpoint
const verifyWebhook = (req, res) => {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    // Yahan apni .env file wali token use karen
    const VERIFY_TOKEN = process.env.INSTAGRAM_VERIFY_TOKEN || 'my_secret_token_123';

    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
        return res.status(200).send(challenge);
    }
    return res.sendStatus(403);
};

// 2. Incoming Message Handler
const handleWebhookEvent = async (req, res) => {
    const body = req.body;

    if (body.object === 'instagram') {
        for (const entry of body.entry) {
            if (entry.messaging) {
                for (const messagingEvent of entry.messaging) {
                    const senderId = messagingEvent.sender.id;
                    
                    if (messagingEvent.message && messagingEvent.message.text) {
                        const messageText = messagingEvent.message.text;
                        
                        console.log(`\n=== NAYA MESSAGE: ${messageText} ===`);

                        // Yahan wo URL jo aapne n8n mein 'Production' ke liye copy kiya tha
                        const N8N_URL = "https://noorulain2799.app.n8n.cloud/webhook/instagram"; 

                        try {
                            await axios.post(N8N_URL, {
                                sender_id: senderId,
                                message_text: messageText,
                                platform: 'instagram'
                            });
                        } catch (error) {
                            console.error('n8n error:', error.message);
                        }
                    }
                }
            }
        }
        return res.status(200).send('EVENT_RECEIVED');
    }
    return res.sendStatus(404);
};

module.exports = {
    verifyWebhook,
    handleWebhookEvent
};