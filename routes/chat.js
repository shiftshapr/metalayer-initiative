const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');

// POST message
router.post('/message', chatController.postMessage);

// GET history
router.get('/history', chatController.getChatHistory);

// GET threads
router.get('/threads', chatController.getChatThreads);

module.exports = router;
