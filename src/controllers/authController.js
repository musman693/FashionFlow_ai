const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { env } = require('../config/env');

function signToken(payload, secret, expiresIn) {
  return jwt.sign(payload, secret, { expiresIn });
}

function createTokens(user) {
  const accessToken = signToken({ sub: user.id, role: user.role }, env.JWT_SECRET, env.JWT_EXPIRES_IN);
  const refreshToken = signToken({ sub: user.id, type: 'refresh' }, env.JWT_REFRESH_SECRET, env.JWT_REFRESH_EXPIRES_IN);
  return { accessToken, refreshToken };
}

async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const tokens = createTokens(user);
    res.json({ ...tokens, expiresIn: env.JWT_EXPIRES_IN });
  } catch (error) {
    next(error);
  }
}

async function refreshToken(req, res, next) {
  try {
    const { refreshToken: token } = req.body;
    if (!token) {
      return res.status(400).json({ message: 'Refresh token is required' });
    }

    let payload;
    try {
      payload = jwt.verify(token, env.JWT_REFRESH_SECRET);
    } catch (err) {
      return res.status(401).json({ message: 'Invalid or expired refresh token' });
    }

    if (payload.type !== 'refresh') {
      return res.status(401).json({ message: 'Invalid refresh token' });
    }

    const user = await User.findById(payload.sub);
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    const tokens = createTokens(user);
    res.json({ ...tokens, expiresIn: env.JWT_EXPIRES_IN });
  } catch (error) {
    next(error);
  }
}

module.exports = { login, refreshToken };
