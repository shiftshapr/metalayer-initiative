// In-memory store for now
const chatMessages = [];

// POST /chat/message
exports.postMessage = (req, res) => {
  const { userId, communityId, content, uri, parentId, threadId, optionalContent } = req.body;
  if (!userId || !communityId || !content) {
    return res.status(400).json({ error: 'userId, communityId & content are required' });
  }

  const msg = {
    id: `msg-${Date.now()}`,
    userId,
    communityId,
    content,
    uri: uri || null,
    parentId: parentId || null, // For replies
    threadId: threadId || null, // For threading
    optionalContent: optionalContent || null, // For anchoring comments
    created_at: new Date().toISOString()
  };
  chatMessages.push(msg);

  res.json({ message: 'Message sent', msg });
};

// GET /chat/history
exports.getChatHistory = (req, res) => {
  const { communityId, threadId, uri } = req.query;
  if (!communityId) {
    return res.status(400).json({ error: 'communityId query is required' });
  }

  let msgs = chatMessages.filter(m => m.communityId === communityId);
  
  // If threadId is specified, filter by thread
  if (threadId) {
    msgs = msgs.filter(m => m.threadId === threadId || m.id === threadId);
  }
  
  // If uri is specified, filter by URI (page-specific messages)
  if (uri) {
    msgs = msgs.filter(m => m.uri === uri);
  }
  
  // Sort by creation time
  msgs.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
  
  res.json({ communityId, threadId, messages: msgs });
};

// GET /chat/threads - Get all threads in a community
exports.getThreads = (req, res) => {
  const { communityId } = req.query;
  if (!communityId) {
    return res.status(400).json({ error: 'communityId query is required' });
  }

  // Get all top-level messages (no parentId) and group by threadId
  const topLevelMessages = chatMessages.filter(m => 
    m.communityId === communityId && !m.parentId
  );
  
  const threads = topLevelMessages.map(msg => ({
    id: msg.threadId || msg.id,
    rootMessage: msg,
    replyCount: chatMessages.filter(m => 
      m.communityId === communityId && 
      (m.threadId === msg.id || m.parentId === msg.id)
    ).length
  }));
  
  res.json({ communityId, threads });
};

// PUT /chat/message/:id - Edit a message
exports.editMessage = (req, res) => {
  const { id } = req.params;
  const { content } = req.body;
  
  if (!content) {
    return res.status(400).json({ error: 'content is required' });
  }
  
  const messageIndex = chatMessages.findIndex(m => m.id === id);
  if (messageIndex === -1) {
    return res.status(404).json({ error: 'Message not found' });
  }
  
  // Check if message is less than 1 hour old
  const messageTime = new Date(chatMessages[messageIndex].created_at);
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
  
  if (messageTime <= oneHourAgo) {
    return res.status(403).json({ error: 'Message is too old to edit (1 hour limit)' });
  }
  
  // Update the message
  chatMessages[messageIndex].content = content;
  chatMessages[messageIndex].edited_at = new Date().toISOString();
  
  res.json({ success: true, message: chatMessages[messageIndex] });
};

// DELETE /chat/message/:id - Delete a message
exports.deleteMessage = (req, res) => {
  const { id } = req.params;
  
  const messageIndex = chatMessages.findIndex(m => m.id === id);
  if (messageIndex === -1) {
    return res.status(404).json({ error: 'Message not found' });
  }
  
  // Check if message is less than 1 hour old
  const messageTime = new Date(chatMessages[messageIndex].created_at);
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
  
  if (messageTime <= oneHourAgo) {
    return res.status(403).json({ error: 'Message is too old to delete (1 hour limit)' });
  }
  
  // Mark as deleted instead of actually removing (for reply integrity)
  chatMessages[messageIndex].deleted = true;
  chatMessages[messageIndex].deleted_at = new Date().toISOString();
  
  res.json({ success: true });
};

// PUT /chat/message/:id/uri - Update message URI
exports.updateMessageUri = (req, res) => {
  const { id } = req.params;
  const { uri } = req.body;
  
  if (!uri) {
    return res.status(400).json({ error: 'uri is required' });
  }
  
  const messageIndex = chatMessages.findIndex(m => m.id === id);
  if (messageIndex === -1) {
    return res.status(404).json({ error: 'Message not found' });
  }
  
  // Update the message URI
  chatMessages[messageIndex].uri = uri;
  
  res.json({ success: true, message: chatMessages[messageIndex] });
};
