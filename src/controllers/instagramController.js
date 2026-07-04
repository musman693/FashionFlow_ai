// src/controllers/instagramController.js

// Meta Webhook Verification (GET Request)
const verifyWebhook = async (req, res) => {
    try {
        const mode = req.query['hub.mode'];
        const token = req.query['hub.verify_token'];
        const challenge = req.query['hub.challenge'];

        const VERIFY_TOKEN = process.env.INSTAGRAM_VERIFY_TOKEN || 'my_secret_token_123';

        if (mode && token) {
            if (mode === 'subscribe' && token === VERIFY_TOKEN) {
                console.log('=== INSTAGRAM WEBHOOK VERIFIED SUCCESSFULLY ===');
                return res.status(200).send(challenge);
            } else {
                return res.status(403).json({ message: 'Verification token mismatch' });
            }
        }
        
        return res.status(400).json({ message: 'Missing parameters' });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

// Incoming Messages Handler (POST Request)
const handleWebhookEvent = async (req, res) => {
    console.log('Instagram Event Received:', JSON.stringify(req.body, null, 2));
    return res.status(200).send('EVENT_RECEIVED');
};

module.exports = {
    verifyWebhook,
    handleWebhookEvent
};