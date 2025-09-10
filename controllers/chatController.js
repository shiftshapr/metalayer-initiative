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
  const { communityId, threadId } = req.query;
  if (!communityId) {
    return res.status(400).json({ error: 'communityId query is required' });
  }

  let msgs = chatMessages.filter(m => m.communityId === communityId);
  
  // If threadId is specified, filter by thread
  if (threadId) {
    msgs = msgs.filter(m => m.threadId === threadId || m.id === threadId);
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
