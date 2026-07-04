// src/controllers/instagramController.js

// 1. Verification Endpoint (Jo hum test kar chuke hain)
const verifyWebhook = (req, res) => {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    const VERIFY_TOKEN = process.env.INSTAGRAM_VERIFY_TOKEN || 'my_secret_token_123';

    if (mode && token) {
        if (mode === 'subscribe' && token === VERIFY_TOKEN) {
            console.log('=== INSTAGRAM WEBHOOK VERIFIED SUCCESSFULLY ===');
            return res.status(200).send(challenge);
        } else {
            return res.sendStatus(403);
        }
    }
};

// 2. Incoming Message Handler (Jis par ab hum kaam kar rahe hain)
const handleWebhookEvent = async (req, res) => {
    const body = req.body;

    // Check karen ke event instagram ka hi hai
    if (body.object === 'instagram') {
        
        // Meta ka data structure nested hota hai, is liye loops lagayenge
        body.entry.forEach((entry) => {
            // Check karen agar messaging entry maujood hai
            if (entry.messaging) {
                entry.messaging.forEach((messagingEvent) => {
                    const senderId = messagingEvent.sender.id; // Message bhejne wale ki ID
                    
                    // Check karen agar waqai koi text message aaya hai
                    if (messagingEvent.message && messagingEvent.message.text) {
                        const messageText = messagingEvent.message.text;
                        
                        console.log(`\n=== NAYA INSTAGRAM MESSAGE AAYA ===`);
                        console.log(`Sender ID: ${senderId}`);
                        console.log(`Message: ${messageText}`);
                        console.log(`==================================\n`);

                        // TODO: Yahan hum aglay step mein n8n flow ya AI engine ko trigger karenge
                    }
                });
            }
        });

        // Meta ko 200 OK response dena zaroori hota hai taake wo bar bar event na bheje
        return res.status(200).send('EVENT_RECEIVED');
    } else {
        // Agar event Instagram ka nahi hai toh 404
        return res.sendStatus(404);
    }
};

module.exports = {
    verifyWebhook,
    handleWebhookEvent
};