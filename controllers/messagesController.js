const { PrismaClient } = require('../generated/prisma');
const { Prisma } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Parse cursor from string format: "createdAt|id"
 * Returns { createdAt, id } or null if invalid
 */
function parseCursor(cursor) {
  if (!cursor) return null;
  try {
    const [createdAt, id] = cursor.split('|');
    if (!createdAt || !id) return null;
    return { createdAt: new Date(createdAt), id };
  } catch (error) {
    return null;
  }
}

/**
 * Generate cursor from message: "createdAt|id"
 */
function generateCursor(message) {
  if (!message || !message.created_at || !message.id) return null;
  return `${message.created_at.toISOString()}|${message.id}`;
}

/**
 * Build status filter clause for message queries
 */
function buildStatusFilter(messageStatus, userId, alias = 'm') {
  const column = Prisma.raw(alias);

  switch (messageStatus) {
    case 'draft': {
      if (!userId) {
        throw new Error('userId is required when fetching drafts');
      }
      return Prisma.sql`AND ${column}.status = 'draft' AND ${column}.user_id::UUID = ${userId}::UUID`;
    }
    case 'deleted':
      return Prisma.sql`AND ${column}.status = 'deleted'`;
    case 'all':
      return Prisma.sql``;
    case 'published':
    default:
      return Prisma.sql`AND (${column}.status IS NULL OR ${column}.status = 'published')`;
  }
}

/**
 * GET /api/messages
 * 
 * Query params:
 * - pageId: required - Page ID (normalized URL)
 * - parentId: optional - Parent message ID (null for top-level)
 * - limit: optional - Max items per page (default: 10, max: 100)
 * - cursor: optional - Keyset cursor from previous response
 * - includeTopReply: optional - Include best reply chain (default: true for parentId=null)
 * - focusContextId: optional - When entering focus mode, allows bundling parent
 */
exports.getMessages = async (req, res) => {
  try {
    const {
      pageId,
      parentId,
      limit = 10,
      cursor,
      includeTopReply,
      focusContextId,
      status, // Filter by status (draft, published, deleted)
      userId // For filtering drafts by user
    } = req.query;

    // Validation
    if (!pageId) {
      return res.status(400).json({ error: 'pageId is required' });
    }

    const limitNum = Math.min(parseInt(limit) || 10, 100);
    const shouldIncludeTopReply = (includeTopReply !== 'false') && (parentId === null || parentId === 'null');
    const parsedCursor = parseCursor(cursor);

    console.log('📊 GET_MESSAGES:', {
      pageId,
      parentId: parentId || null,
      limit: limitNum,
      cursor: cursor || null,
      includeTopReply: shouldIncludeTopReply
    });

    // Build query with conditional WHERE clauses
    const communityId = req.query.communityId || 'comm-001';
    const messageStatus = status || 'published';
    
    let statusFilter;
    try {
      statusFilter = buildStatusFilter(messageStatus, userId);
    } catch (error) {
      console.error('❌ STATUS_FILTER:', error);
      return res.status(400).json({ error: error.message });
    }
    
    let messages;
    if (parentId && parentId !== 'null') {
      // Fetch replies to a specific parent
      if (parsedCursor) {
        messages = await prisma.$queryRaw`
          SELECT 
            m.id,
            m.content,
            m.created_at,
            m.updated_at,
            m.parent_id,
            m.community_id,
            m.user_id,
            m.status,
            u.name as author_name,
            u.handle as author_handle,
            u."avatarUrl" as author_avatar_url,
            u."auraColor" as author_aura_color
          FROM messages m
          JOIN "AppUser" u ON m.user_id = u.id
          WHERE m.page_id = ${pageId}
            AND m.parent_id::UUID = ${parentId}::UUID
            AND m.community_id = ${communityId}
            ${statusFilter}
            AND NOT EXISTS (
              SELECT 1 FROM message_deletions md 
              WHERE md.message_id::UUID = m.id
            )
            AND (
              m.created_at < ${parsedCursor.createdAt}::TIMESTAMPTZ
              OR (m.created_at = ${parsedCursor.createdAt}::TIMESTAMPTZ AND m.id::TEXT < ${parsedCursor.id})
            )
          ORDER BY m.created_at DESC, m.id DESC
          LIMIT ${limitNum + 1}
        `;
      } else {
        messages = await prisma.$queryRaw`
          SELECT 
            m.id,
            m.content,
            m.created_at,
            m.updated_at,
            m.parent_id,
            m.community_id,
            m.user_id,
            m.status,
            u.name as author_name,
            u.handle as author_handle,
            u."avatarUrl" as author_avatar_url,
            u."auraColor" as author_aura_color
          FROM messages m
          JOIN "AppUser" u ON m.user_id = u.id
          WHERE m.page_id = ${pageId}
            AND m.parent_id::UUID = ${parentId}::UUID
            AND m.community_id = ${communityId}
            ${statusFilter}
            AND NOT EXISTS (
              SELECT 1 FROM message_deletions md 
              WHERE md.message_id::UUID = m.id
            )
          ORDER BY m.created_at DESC, m.id DESC
          LIMIT ${limitNum + 1}
        `;
      }
    } else {
      // Fetch top-level messages
      if (parsedCursor) {
        messages = await prisma.$queryRaw`
          SELECT 
            m.id,
            m.content,
            m.created_at,
            m.updated_at,
            m.parent_id,
            m.community_id,
            m.user_id,
            m.status,
            u.name as author_name,
            u.handle as author_handle,
            u."avatarUrl" as author_avatar_url,
            u."auraColor" as author_aura_color
          FROM messages m
          JOIN "AppUser" u ON m.user_id = u.id
          WHERE m.page_id = ${pageId}
            AND (m.parent_id IS NULL OR m.parent_id = '')
            AND m.community_id = ${communityId}
            ${statusFilter}
            AND NOT EXISTS (
              SELECT 1 FROM message_deletions md 
              WHERE md.message_id::UUID = m.id
            )
            AND (
              m.created_at < ${parsedCursor.createdAt}::TIMESTAMPTZ
              OR (m.created_at = ${parsedCursor.createdAt}::TIMESTAMPTZ AND m.id::TEXT < ${parsedCursor.id})
            )
          ORDER BY m.created_at DESC, m.id DESC
          LIMIT ${limitNum + 1}
        `;
      } else {
        messages = await prisma.$queryRaw`
          SELECT 
            m.id,
            m.content,
            m.created_at,
            m.updated_at,
            m.parent_id,
            m.community_id,
            m.user_id,
            m.status,
            u.name as author_name,
            u.handle as author_handle,
            u."avatarUrl" as author_avatar_url,
            u."auraColor" as author_aura_color
          FROM messages m
          JOIN "AppUser" u ON m.user_id = u.id
          WHERE m.page_id = ${pageId}
            AND (m.parent_id IS NULL OR m.parent_id = '')
            AND m.community_id = ${communityId}
            ${statusFilter}
            AND NOT EXISTS (
              SELECT 1 FROM message_deletions md 
              WHERE md.message_id::UUID = m.id
            )
          ORDER BY m.created_at DESC, m.id DESC
          LIMIT ${limitNum + 1}
        `;
      }
    }

    // Check if there are more results
    const hasMore = messages.length > limitNum;
    const items = hasMore ? messages.slice(0, limitNum) : messages;

    // Generate next cursor
    const nextCursor = hasMore && items.length > 0
      ? generateCursor(items[items.length - 1])
      : null;

    // Get reply chain data for top-level messages if requested
    let itemsWithChains = items;
    if (shouldIncludeTopReply && parentId === null || parentId === 'null') {
      console.log('📊 Getting reply chains for top-level messages...');
      
      // Get reply chains for each message
      const itemsWithChainData = await Promise.all(
        items.map(async (message) => {
          try {
            const chains = await prisma.$queryRaw`
              SELECT * FROM get_top_reply_chains(
                ${message.id}::UUID,
                ${pageId}::TEXT,
                ${message.community_id}::TEXT,
                5::INTEGER,  -- threshold
                1::INTEGER   -- limit per child
              )
            `;

            // Get reply count
            const replyCountResult = await prisma.$queryRaw`
              SELECT COUNT(*)::INTEGER as count
              FROM messages r
              WHERE r.parent_id::UUID = ${message.id}::UUID
                AND NOT EXISTS (
                  SELECT 1 FROM message_deletions md 
                  WHERE md.message_id::UUID = r.id
                )
            `;
            const replyCount = replyCountResult[0]?.count || 0;

            // Get top chain if exists
            const topChain = chains && chains.length > 0 ? chains[0] : null;

            return {
              ...message,
              thread: {
                replyCount,
                topReply: topChain ? {
                  id: topChain.first_reply_id,
                  content: topChain.first_reply_content,
                  reactions: {}, // Would need to fetch separately if needed
                  createdAt: topChain.first_reply_created_at,
                  author: {
                    id: topChain.first_reply_author_id,
                    name: topChain.first_reply_author_name,
                    avatarUrl: topChain.first_reply_author_avatar_url
                  },
                  hasMoreReplies: topChain.has_more_replies
                } : null
              }
            };
          } catch (error) {
            console.error(`Error getting chain for message ${message.id}:`, error);
            return {
              ...message,
              thread: {
                replyCount: 0,
                topReply: null
              }
            };
          }
        })
      );

      itemsWithChains = itemsWithChainData;
    } else {
      // For replies, just add empty thread data
      itemsWithChains = items.map(msg => ({
        ...msg,
        thread: null
      }));
    }

    // Get parent message if focusContextId is provided
    let parent = null;
    if (focusContextId && parentId && parentId !== 'null') {
      try {
        const parentResult = await prisma.$queryRaw`
          SELECT 
            m.id,
            m.content,
            m.created_at,
            m.updated_at,
            m.user_id,
            u.name as author_name,
            u.handle as author_handle,
            u."avatarUrl" as author_avatar_url,
            u."auraColor" as author_aura_color
          FROM messages m
          JOIN "AppUser" u ON m.user_id = u.id
          WHERE m.id::UUID = ${parentId}::UUID
            AND NOT EXISTS (
              SELECT 1 FROM message_deletions md 
              WHERE md.message_id::UUID = m.id
            )
          LIMIT 1
        `;
        parent = parentResult.length > 0 ? parentResult[0] : null;
      } catch (error) {
        console.error('Error fetching parent message:', error);
      }
    }

    // Format response
    const response = {
      pageId,
      parentId: parentId && parentId !== 'null' ? parentId : null,
      items: itemsWithChains.map(msg => ({
        id: msg.id,
        messageKind: 'TEXT', // Default for now, will be extended later
        content: msg.content,
        attachments: [],
        emojiMetadata: null,
        author: {
          id: msg.user_id,
          name: msg.author_name,
          handle: msg.author_handle,
          avatarUrl: msg.author_avatar_url,
          auraColor: msg.author_aura_color
        },
        createdAt: msg.created_at,
        updatedAt: msg.updated_at,
        parentId: msg.parent_id,
        thread: msg.thread,
        focusContext: { mode: 'default' }
      })),
      parent,
      nextCursor,
      hasMore: !!nextCursor,
      metadata: {
        pageTitle: null, // Could be fetched from Page table if needed
        totalCountApprox: null // Could be calculated if needed
      }
    };

    console.log(`✅ GET_MESSAGES: Returning ${response.items.length} messages, hasMore: ${response.hasMore}`);
    res.json(response);

  } catch (error) {
    console.error('❌ GET_MESSAGES: Error:', error);
    res.status(500).json({
      error: 'Failed to fetch messages',
      details: error.message
    });
  }
};

/**
 * GET /api/messages/:id
 * Get a single message with context
 */
exports.getMessage = async (req, res) => {
  try {
    const { id } = req.params;

    const messageResult = await prisma.$queryRaw`
      SELECT 
        m.id,
        m.content,
        m.created_at,
        m.updated_at,
        m.parent_id,
        m.community_id,
        m.user_id,
        u.name as author_name,
        u.handle as author_handle,
        u."avatarUrl" as author_avatar_url,
        u."auraColor" as author_aura_color
      FROM messages m
      JOIN "AppUser" u ON m.user_id = u.id
      WHERE m.id::UUID = ${id}::UUID
        AND NOT EXISTS (
          SELECT 1 FROM message_deletions md 
          WHERE md.message_id::UUID = m.id
        )
      LIMIT 1
    `;

    if (messageResult.length === 0) {
      return res.status(404).json({ error: 'Message not found' });
    }

    const message = messageResult[0];
    res.json({
      id: message.id,
      messageKind: 'TEXT',
      content: message.content,
      attachments: [],
      emojiMetadata: null,
      author: {
        id: message.user_id,
        name: message.author_name,
        handle: message.author_handle,
        avatarUrl: message.author_avatar_url,
        auraColor: message.author_aura_color
      },
      createdAt: message.created_at,
      updatedAt: message.updated_at,
      parentId: message.parent_id
    });

  } catch (error) {
    console.error('❌ GET_MESSAGE: Error:', error);
    res.status(500).json({
      error: 'Failed to fetch message',
      details: error.message
    });
  }
};

/**
 * POST /api/messages
 * Create a new message
 */
exports.createMessage = async (req, res) => {
  try {
    const {
      content,
      pageId,
      parentId,
      quoteId,
      communityId = 'comm-001',
      messageKind = 'TEXT',
      attachments = [],
      emojiMetadata = null,
      focusContext = null,
      status = 'published' // draft, published, deleted
    } = req.body;

    // Validation
    if (!content || !pageId) {
      return res.status(400).json({ error: 'content and pageId are required' });
    }

    // TODO: Get user from auth/session
    // For now, using a placeholder - this should come from authenticated session
    const userId = req.body.userId || req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    console.log('📝 CREATE_MESSAGE:', { content, pageId, parentId, userId });

    // Insert message
    // Handle nullable UUIDs properly for Prisma
    const parentIdValue = parentId ? Prisma.sql`${parentId}::UUID` : Prisma.sql`NULL`;
    const quoteIdValue = quoteId ? Prisma.sql`${quoteId}::UUID` : Prisma.sql`NULL`;
    
    const messageResult = await prisma.$queryRaw`
      INSERT INTO messages (
        page_id,
        user_id,
        content,
        parent_id,
        quote_id,
        community_id,
        status,
        created_at,
        updated_at
      )
      VALUES (
        ${pageId},
        ${userId}::UUID,
        ${content},
        ${parentIdValue},
        ${quoteIdValue},
        ${communityId},
        ${status},
        NOW(),
        NOW()
      )
      RETURNING 
        id,
        content,
        created_at,
        updated_at,
        parent_id,
        quote_id,
        community_id,
        user_id,
        status
    `;

    const message = messageResult[0];

    // Get author info
    const authorResult = await prisma.$queryRaw`
      SELECT 
        id,
        name,
        handle,
        "avatarUrl",
        "auraColor"
      FROM "AppUser"
      WHERE id = ${userId}::UUID
      LIMIT 1
    `;

    const author = authorResult[0];

    const response = {
      id: message.id,
      messageKind,
      content: message.content,
      parentId: message.parent_id,
      quoteId: message.quote_id,
      attachments,
      emojiMetadata,
      author: {
        id: author.id,
        name: author.name,
        handle: author.handle,
        avatarUrl: author.avatarUrl,
        auraColor: author.auraColor
      },
      createdAt: message.created_at,
      updatedAt: message.updated_at,
      focusContext: focusContext || { mode: 'default' },
      status: message.status
    };

    console.log(`✅ CREATE_MESSAGE: Created message ${message.id}`);
    res.status(201).json(response);

  } catch (error) {
    console.error('❌ CREATE_MESSAGE: Error:', error);
    res.status(500).json({
      error: 'Failed to create message',
      details: error.message
    });
  }
};

