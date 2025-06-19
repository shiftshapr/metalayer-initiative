const express = require('express');
const router = express.Router();
const { login, getSessionInfo } = require('../controllers/authController');

// Simulated login with email passed in body
router.post('/login', login);

// Returns session info (stubbed for now)
router.get('/me', getSessionInfo);

module.exports = router;
