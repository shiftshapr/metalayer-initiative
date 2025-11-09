/**
 * REPLY LOADER MODULE
 * 
 * Handles loading and managing replies for messages in focus mode.
 * Separates reply loading logic from message rendering.
 */

class ReplyLoader {
  /**
   * Check if a message has nested replies
   * @param {string} messageId - Message ID to check
   * @param {string} pageId - Current page ID
   * @param {string} communityId - Community ID
   * @returns {Promise<{hasReplies: boolean, replyCount: number}>}
   */
  static async checkForNestedReplies(messageId, pageId, communityId) {
    if (!window.supabase || !pageId || !communityId) {
      return { hasReplies: false, replyCount: 0 };
    }

    try {
      const { data: nestedReplies, error } = await window.supabase
        .from('messages')
        .select('id')
        .eq('parent_id', messageId)
        .eq('page_id', pageId)
        .eq('community_id', communityId);

      if (error) {
        console.warn(`⚠️ ReplyLoader: Error checking nested replies for ${messageId}:`, error);
        return { hasReplies: false, replyCount: 0 };
      }

      const hasReplies = nestedReplies && nestedReplies.length > 0;
      const replyCount = nestedReplies ? nestedReplies.length : 0;

      return { hasReplies, replyCount };
    } catch (err) {
      console.warn(`⚠️ ReplyLoader: Error checking nested replies for ${messageId}:`, err);
      return { hasReplies: false, replyCount: 0 };
    }
  }

  /**
   * Load all replies for a message (recursively)
   * @param {string} messageId - Parent message ID
   * @param {string} pageId - Current page ID
   * @param {string} communityId - Community ID
   * @returns {Promise<Array>} Array of reply messages
   */
  static async loadAllReplies(messageId, pageId, communityId) {
    if (!window.supabase || !pageId || !communityId) {
      console.warn(`⚠️ ReplyLoader: Cannot load replies - missing dependencies`);
      return [];
    }

    try {
      // Load direct replies
      const { data: directReplies, error } = await window.supabase
        .from('messages')
        .select('*')
        .eq('parent_id', messageId)
        .eq('page_id', pageId)
        .eq('community_id', communityId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error(`❌ ReplyLoader: Error loading direct replies for ${messageId}:`, error);
        return [];
      }

      if (!directReplies || directReplies.length === 0) {
        return [];
      }

      // Recursively load nested replies
      const allReplies = [];
      for (const directReply of directReplies) {
        allReplies.push(directReply);

        // Recursively load nested replies
        const loadNestedReplies = async (parentMsg) => {
          const { data: nestedReplies, error: nestedError } = await window.supabase
            .from('messages')
            .select('*')
            .eq('parent_id', parentMsg.id)
            .eq('page_id', pageId)
            .eq('community_id', communityId)
            .order('created_at', { ascending: true });

          if (!nestedError && nestedReplies && nestedReplies.length > 0) {
            for (const nestedReply of nestedReplies) {
              allReplies.push(nestedReply);
              // Recursively load deeper nested replies
              await loadNestedReplies(nestedReply);
            }
          }
        };

        await loadNestedReplies(directReply);
      }

      return allReplies;
    } catch (err) {
      console.error(`❌ ReplyLoader: Error loading replies for ${messageId}:`, err);
      return [];
    }
  }

  /**
   * Fetch author data for a reply
   * @param {string} userId - User ID
   * @returns {Promise<Object>} Author object
   */
  static async fetchReplyAuthor(userId) {
    if (!userId) {
      return { id: userId, user_id: userId, name: 'Unknown' };
    }

    try {
      const resp = await window.api.request(`/v1/users/${encodeURIComponent(userId)}`, { 
        method: 'GET', 
        allow404: true 
      });

      if (resp) {
        return {
          id: resp.id || userId,
          user_id: resp.id || userId,
          name: resp.name || 'Unknown',
          avatarUrl: resp.avatarUrl || null,
          auraColor: resp.auraColor || resp.aura_color
        };
      }
    } catch (err) {
      console.error('❌ ReplyLoader: Error fetching reply author:', err);
    }

    return { id: userId, user_id: userId, name: 'Unknown' };
  }

  /**
   * Convert Supabase reply data to API format
   * @param {Object} replyData - Raw reply data from Supabase
   * @param {Object} parentMessage - Parent message object
   * @param {string} pageId - Current page ID
   * @param {string} communityId - Community ID
   * @returns {Promise<Object>} Formatted reply object
   */
  static async formatReply(replyData, parentMessage, pageId, communityId) {
    const replyUserId = replyData.user_id;
    let replyAuthor = replyData.author;

    // Fetch author if not present
    if (!replyAuthor && replyUserId) {
      replyAuthor = await this.fetchReplyAuthor(replyUserId);
    }

    if (!replyAuthor) {
      replyAuthor = { id: replyUserId, user_id: replyUserId, name: 'Unknown' };
    }

    // Check for nested replies
    const { hasReplies, replyCount } = await this.checkForNestedReplies(
      replyData.id,
      pageId,
      communityId
    );

    return {
      id: replyData.id,
      body: replyData.body || replyData.content,
      content: replyData.body || replyData.content,
      author: replyAuthor,
      user_id: replyUserId,
      createdAt: replyData.created_at || replyData.createdAt,
      created_at: replyData.created_at,
      parentId: replyData.parent_id || parentMessage.id,
      conversationId: parentMessage.conversationId,
      isReply: true,
      hasReplies: hasReplies,
      replyCount: replyCount,
      communityId: communityId
    };
  }
}

// Export to window for global access
if (typeof window !== 'undefined') {
  window.ReplyLoader = ReplyLoader;
  console.log('✅ ReplyLoader: Exported to window');
}

