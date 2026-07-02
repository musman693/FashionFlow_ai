// src/index.js
// Standalone server so you (Shayan) can test/demo Module 3 independently
// before Usman wires it into the main Module 1 Express app.
// In the final integrated app, only aiRoutes.js gets mounted — this file
// is just a dev convenience.

require('dotenv').config();
const express = require('express');
const aiRoutes = require('./routes/aiRoutes');

const app = express();
app.use(express.json());

app.use('/ai', aiRoutes);

app.get('/health', (req, res) => res.json({ status: 'ok', module: 'ai-intent-sentiment' }));

const PORT = process.env.PORT || 5003;
app.listen(PORT, () => {
  console.log(`[ai-engine] Module 3 standalone server running on port ${PORT}`);
});
