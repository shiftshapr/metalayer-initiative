const express = require('express');
const router = express.Router();
const { postMessage, getChatHistory, getThreads, editMessage, deleteMessage } = require('../controllers/chatController');

// POST message
router.post('/message', postMessage);

// GET history (bonus, prepares for next)
router.get('/history', getChatHistory);

// GET threads
router.get('/threads', getThreads);

// PUT message (edit)
router.put('/message/:id', editMessage);

// DELETE message
router.delete('/message/:id', deleteMessage);

module.exports = router;
