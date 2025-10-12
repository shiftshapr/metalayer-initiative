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
    console.log(`🔍 CHAT_CREATE: Message content: "${content}"`);

    // Look up user by email to get database user ID
    const user = await prisma.appUser.findUnique({
      where: { email: userEmail }
    });

    if (!user) {
      console.log(`❌ CHAT_CREATE: User not found for email: ${userEmail}`);
      return res.status(404).json({ error: 'User not found' });
    }

    const userId = user.id;
    console.log(`🔍 CHAT_CREATE: Found user ${userId} for email ${userEmail}`);

    // Generate unique IDs
    const postId = `post-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const conversationId = `conv-${communityId}-${uri || 'general'}`;
    
    // Normalize the URI to get pageId
    const UrlNormalizationService = require('../services/urlNormalizationService');
    const urlNormalization = new UrlNormalizationService();
    const normalizedUrl = await urlNormalization.normalizeUrl(uri || 'general');
    const pageId = normalizedUrl.pageId;
    console.log(`🔍 CHAT_CREATE: Normalized URI: ${normalizedUrl.normalizedUrl}, PageId: ${pageId}`);
    
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
    console.log(`🔍 CHAT_CREATE: Page upserted with ID: ${pageId}`);
    
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
    console.log(`🔍 CHAT_CREATE: Conversation upserted with ID: ${conversationId}`);

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

    // Find conversations for this community, optionally filtered by URI
    const whereClause = {
      communityId: communityId
    };
    
    // If URI is provided, filter by page URL
    if (uri) {
      // Get the pageId for this URI
      const UrlNormalizationService = require('../services/urlNormalizationService');
      const urlNormalization = new UrlNormalizationService();
      const normalizedUrl = await urlNormalization.normalizeUrl(uri);
      const pageId = normalizedUrl.pageId;
      
      whereClause.pageId = pageId;
      console.log(`🔍 CHAT_FILTER: Filtering conversations by pageId: ${pageId} for URI: ${uri}`);
      console.log(`🔍 CHAT_FILTER: Normalized URI: ${normalizedUrl.normalizedUrl}`);
    } else {
      console.log(`🔍 CHAT_FILTER: No URI filter applied - getting all conversations for community`);
    }
    
    // DIAGNOSTIC: Check all conversations before filtering
    const allConversationsForCommunity = await prisma.conversation.findMany({
      where: { communityId: communityId },
      select: {
        id: true,
        pageId: true,
        page: {
          select: {
            url: true,
            canonicalUrl: true
          }
        }
      }
    });
    
    console.log(`🔍 CHAT_DIAGNOSTIC: Total conversations in community ${communityId}: ${allConversationsForCommunity.length}`);
    if (allConversationsForCommunity.length > 0) {
      console.log(`🔍 CHAT_DIAGNOSTIC: All conversations:`, JSON.stringify(allConversationsForCommunity, null, 2));
    }
    
    const dbConversations = await prisma.conversation.findMany({
      where: whereClause,
      select: {
        id: true
      }
    });

    const conversationIds = dbConversations.map(c => c.id);
    console.log(`🔍 CHAT: Found ${conversationIds.length} conversations for community ${communityId} (after filtering)`);
    console.log(`🔍 CHAT: Conversation IDs:`, conversationIds);

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
            avatarUrl: true,
            email: true,
            auraColor: true
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

    console.log(`🔍 CHAT: Found ${msgs.length} messages for community ${communityId}`);
    console.log(`🔍 CHAT: Messages found:`, msgs.map(m => ({ id: m.id, body: m.body, createdAt: m.createdAt, conversationId: m.conversationId })));
    if (uri) {
      console.log(`🔍 CHAT: URI-filtered messages for ${uri}: ${msgs.length} messages`);
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
    console.log(`✅ CHAT_RESULT: Returning ${conversations.length} conversations with ${msgs.length} total messages`);
    if (uri) {
      console.log(`🔍 CHAT_RESULT: URI-filtered results for ${uri}: ${conversations.length} conversations`);
    }
    
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