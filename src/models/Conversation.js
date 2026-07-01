const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  role: { type: String, enum: ['user', 'assistant', 'system'], required: true },
  content: { type: String, required: true },
  timestamp: { type: Date, default: Date.now }
}, { _id: false });

const conversationSchema = new mongoose.Schema({
  sessionId: { type: String, required: true, index: true },
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer' },
  messages: [messageSchema],
  createdAt: { type: Date, default: Date.now }
});

// TTL Index to expire after 30 days (2592000 seconds)
conversationSchema.index({ createdAt: 1 }, { expireAfterSeconds: 2592000 });

const Conversation = mongoose.model('Conversation', conversationSchema);
module.exports = Conversation;
