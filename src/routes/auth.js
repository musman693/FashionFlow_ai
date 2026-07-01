const express = require('express');
const { body } = require('express-validator');
const { login, refreshToken } = require('../controllers/authController');
const { validateRequest } = require('../middleware/validateRequest');

const router = express.Router();

router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 6 }).withMessage('Password is required')
  ],
  validateRequest,
  login
);

router.post('/refresh', refreshToken);

module.exports = router;
