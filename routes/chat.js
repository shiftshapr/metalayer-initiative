const express = require('express');
const router = express.Router();
const { postMessage, getChatHistory, getThreads } = require('../controllers/chatController');

// POST message
router.post('/message', postMessage);

// GET history (bonus, prepares for next)
router.get('/history', getChatHistory);

// GET threads
router.get('/threads', getThreads);

module.exports = router;
