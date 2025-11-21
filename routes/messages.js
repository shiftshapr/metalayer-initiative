const express = require('express');
const router = express.Router();
const messagesController = require('../controllers/messagesController');

// GET /api/messages - Get messages with keyset pagination
router.get('/', messagesController.getMessages);

// GET /api/messages/:id - Get a single message with context
router.get('/:id', messagesController.getMessage);

// POST /api/messages - Create a new message
router.post('/', messagesController.createMessage);

module.exports = router;






