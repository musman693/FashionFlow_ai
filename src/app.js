const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const { env } = require('./config/env');
const authRoutes = require('./routes/auth');
const instagramRoutes = require('./routes/instagram');
const { errorHandler } = require('./middleware/errorHandler');
const { redisClient } = require('./config/redis');
const { rateLimiter } = require('./middleware/rateLimit');

function rawBodySaver(req, res, buf) {
  if (buf && buf.length) {
    req.rawBody = buf.toString('utf8');
  }
}

const app = express();

app.use(helmet());
app.use(cors());
app.use(morgan('tiny'));
app.use(cookieParser());
app.use(express.json({ verify: rawBodySaver }));
app.use(express.urlencoded({ extended: false }));

app.use(rateLimiter);

app.use('/api/auth', authRoutes);
app.use('/api/webhooks', instagramRoutes);


app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', env: env.NODE_ENV });
});

app.use(errorHandler);

async function start() {
 await redisClient.connect();
  return app;
}

module.exports = { app, start };
