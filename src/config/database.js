const mongoose = require('mongoose');
const { env } = require('./env');

async function connectDatabase() {
  if (!env.MONGO_URI) {
    throw new Error('MONGO_URI is not defined in environment variables');
  }

  await mongoose.connect(env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  });

  console.log('Connected to MongoDB');
}

module.exports = { connectDatabase };
