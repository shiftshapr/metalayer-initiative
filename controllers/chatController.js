const { PrismaClient } = require('../generated/prisma');
const prisma = new PrismaClient();

// Public Square community UUID - default community for all users
const PUBLIC_SQUARE_UUID = 'abe5ec85-4ba6-456f-adaf-03d7d51cecf4';

// POST /chat/message
exports.postMessage = async (req, res) => {
  try {
    const { user_id, communityId, content, uri, parentId, threadId, optionalContent } = req.body;
    if (!user_id || !content) {
      return res.status(400).json({ error: 'user_id & content are required' });
    }
    
    // RED-LINE: No hardcoded fallback - require communityId
    if (!communityId) {
      console.log(`⚠️ CHAT_CREATE: No communityId provided - returning 400 error`);
      return res.status(400).json({ error: 'communityId is required' });
    }
    const resolvedCommunityId = communityId;

    console.log(`✅ CHAT: Creating message for user ${user_id} in community ${resolvedCommunityId} on URI ${uri}`);
    console.log(`🔍 CHAT_CREATE: Message content: "${content}"`);

    // Look up user by email to get database user ID
    const user = await prisma.appUser.findUnique({
      where: { id: user_id }
    });

    if (!user) {
      console.log(`❌ CHAT_CREATE: User not found for ID: ${user_id}`);
      return res.status(404).json({ error: 'User not found' });
    }

    const userId = user.id;
    console.log(`🔍 CHAT_CREATE: Found user ${userId}`);

    // Generate unique IDs
    const postId = `post-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const conversationId = `conv-${resolvedCommunityId}-${uri || 'general'}`;
    
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
        communityId: resolvedCommunityId
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

    // FIXED: Use Supabase messages table (not Prisma post table)
    const { createClient } = require('@supabase/supabase-js');
    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_ANON_KEY
    );
    
    // Get pageId from URI if provided
    let pageId = null;
    if (uri) {
      const UrlNormalizationService = require('../services/urlNormalizationService');
      const urlNormalization = new UrlNormalizationService();
      const normalizedUrl = await urlNormalization.normalizeUrl(uri);
      pageId = normalizedUrl.pageId;
    }
    
    console.log(`🔍 CHAT_API: Querying Supabase messages table for pageId: ${pageId}`);
    
    // COMP METHOD: Join with AppUser table to get user information
    let query = supabase.from('messages').select(`
      *,
      AppUser:user_id (
        id,
        name,
        handle,
        email,
        avatarUrl
      )
    `);
    if (pageId) {
      query = query.eq('page_id', pageId);
    }
    const { data: messages, error: messagesError } = await query.order('created_at', { ascending: true });
    
    if (messagesError) {
      console.error('❌ CHAT_API: Supabase query failed:', messagesError);
      return res.status(500).json({ error: 'Failed to fetch messages', details: messagesError.message });
    }
    
    console.log(`🔍 CHAT_API: Found ${messages?.length || 0} messages in Supabase`);
    
    // Convert Supabase messages to API format
    const msgs = messages?.map(msg => ({
      id: msg.id,
      body: msg.content,
      authorId: msg.user_id || msg.AppUser?.id,
      conversationId: `conv-${communityId}-${pageId}`,
      createdAt: msg.created_at,
      updatedAt: msg.updated_at,
      author: {
        id: msg.AppUser?.id || msg.user_id,
        name: msg.AppUser?.name || 'Unknown',
        handle: msg.AppUser?.handle || 'unknown',
        avatarUrl: msg.AppUser?.avatarUrl || null,
        auraColor: '#aa00aa'
      },
      conversation: {
        id: `conv-${communityId}-${pageId}`,
        communityId: communityId
      }
    })) || [];

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
        parentId: null, // Supabase messages don't have parentId
        conversationId: msg.conversationId,
        authorId: msg.authorId,
        body: msg.body,
        createdAt: msg.createdAt,
        editedAt: msg.updatedAt,
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
    
    // Add cache-busting headers to prevent browser caching
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    
    res.json({ 
      conversations,
      timestamp: new Date().toISOString(),
      cacheBust: Date.now()
    });
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

    // REMOVED: Old Prisma fallback - using Supabase-only system
    // This was causing the API to return old data instead of new Supabase messages
  } catch (error) {
    console.error('❌ CHAT: Error fetching threads:', error);
    res.status(500).json({ error: 'Failed to fetch threads', details: error.message });
  }
};