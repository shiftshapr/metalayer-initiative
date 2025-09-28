const { PrismaClient } = require('../generated/prisma');
const prisma = new PrismaClient();

// POST /chat/message
exports.postMessage = async (req, res) => {
  try {
    const { userEmail, communityId, content, uri, parentId, threadId, optionalContent } = req.body;
    if (!userEmail || !communityId || !content) {
      return res.status(400).json({ error: 'userEmail, communityId & content are required' });
    }

    console.log(`✅ CHAT: Creating message for user ${userEmail} in community ${communityId} on URI ${uri}`);

    // Look up user by email to get database user ID
    const user = await prisma.appUser.findUnique({
      where: { email: userEmail }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const userId = user.id;

    // Generate unique IDs
    const postId = `post-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const conversationId = `conv-${communityId}-${uri || 'general'}`;
    
    // Normalize the URI to get pageId
    const UrlNormalizationService = require('../services/urlNormalizationService');
    const urlNormalization = new UrlNormalizationService();
    const normalizedUrl = await urlNormalization.normalizeUrl(uri || 'general');
    const pageId = normalizedUrl.pageId;
    
    // Create or get the page
    await prisma.page.upsert({
      where: { id: pageId },
      update: {},
      create: {
        id: pageId,
        url: uri || 'general',
        canonicalUrl: normalizedUrl.normalizedUrl,
        spaceId: null
      }
    });
    
    // Create or get the conversation
    await prisma.conversation.upsert({
      where: { id: conversationId },
      update: {},
      create: {
        id: conversationId,
        pageId: pageId,
        visibility: 'PUBLIC',
        createdById: userId,
        communityId: communityId
      }
    });

    // Create message in database using Post table
    const msg = await prisma.post.create({
      data: {
        id: postId,
        body: content,
        authorId: userId,
        conversationId: conversationId,
        parentId: parentId || null,
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            handle: true,
            avatarUrl: true
          }
        }
      }
    });

    console.log(`✅ CHAT: Message created in database:`, msg.id);
    res.json({ message: 'Message sent', msg });
  } catch (error) {
    console.error('❌ CHAT: Error creating message:', error);
    res.status(500).json({ error: 'Failed to create message', details: error.message });
  }
};

// GET /chat/history
exports.getChatHistory = async (req, res) => {
  try {
    const { communityId, threadId, uri } = req.query;
    console.log('getChatHistory called with:', { communityId, threadId, uri });
    
    if (!communityId) {
      return res.status(400).json({ error: 'communityId query is required' });
    }

    // Find conversations for this community
    const dbConversations = await prisma.conversation.findMany({
      where: {
        communityId: communityId
      },
      select: {
        id: true
      }
    });

    const conversationIds = dbConversations.map(c => c.id);
    console.log(`🔍 CHAT: Found ${conversationIds.length} conversations for community ${communityId}`);

    if (conversationIds.length === 0) {
      console.log(`No conversations found for community ${communityId}`);
      res.json({ conversations: [] });
      return;
    }

    // Get messages from all conversations in this community
    const msgs = await prisma.post.findMany({
      where: {
        conversationId: {
          in: conversationIds
        }
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            handle: true,
            avatarUrl: true
          }
        },
        conversation: {
          select: {
            id: true,
            communityId: true
          }
        }
      },
      orderBy: {
        createdAt: 'asc'
      }
    });

    console.log(`Found ${msgs.length} messages for community ${communityId}`);
    if (uri) {
      console.log(`After URI filter (${uri}): ${msgs.length} messages`);
    }

    // Transform messages into conversation format expected by frontend
    const conversationsMap = new Map();
    
    for (const msg of msgs) {
      const convId = msg.conversationId;
      if (!conversationsMap.has(convId)) {
        conversationsMap.set(convId, {
          id: convId,
          communityId: msg.conversation.communityId,
          posts: []
        });
      }
      
      // Transform message to post format
      const post = {
        id: msg.id,
        parentId: msg.parentId,
        conversationId: msg.conversationId,
        authorId: msg.authorId,
        body: msg.body,
        createdAt: msg.createdAt,
        editedAt: msg.editedAt,
        author: msg.author,
        conversation: msg.conversation
      };
      
      conversationsMap.get(convId).posts.push(post);
    }
    
    const conversations = Array.from(conversationsMap.values());
    console.log(`Returning ${conversations.length} conversations with ${msgs.length} total messages`);
    
    res.json({ conversations });
  } catch (error) {
    console.error('❌ CHAT: Error fetching messages:', error);
    res.status(500).json({ error: 'Failed to fetch messages', details: error.message });
  }
};

// GET /chat/threads
exports.getChatThreads = async (req, res) => {
  try {
    const { communityId, uri } = req.query;
    
    if (!communityId) {
      return res.status(400).json({ error: 'communityId query is required' });
    }

    // Build query filters
    const where = {
      spaceId: communityId,
      parentId: null // Only root messages (thread starters)
    };
    
    if (uri) {
      where.url = uri;
    }

    const threads = await prisma.post.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            handle: true,
            avatarUrl: true
          }
        },
        _count: {
          select: {
            children: true // Count replies
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    console.log(`Found ${threads.length} threads for community ${communityId}`);
    res.json({ threads });
  } catch (error) {
    console.error('❌ CHAT: Error fetching threads:', error);
    res.status(500).json({ error: 'Failed to fetch threads', details: error.message });
  }
};