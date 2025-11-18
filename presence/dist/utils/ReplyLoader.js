/**
 * REPLY LOADER MODULE - TypeScript Version
 *
 * Handles loading and managing replies for messages in focus mode.
 * Separates reply loading logic from message rendering.
 */
import { supabaseServiceInstance } from '../services/SupabaseService.js';
export class ReplyLoader {
    /**
     * Check if a message has nested replies
     */
    static async checkForNestedReplies(messageId, pageId, communityId) {
        const supabase = window.supabase || supabaseServiceInstance.getClient();
        if (!supabase || !pageId || !communityId) {
            return { hasReplies: false, replyCount: 0 };
        }
        try {
            // Note: Using snake_case for Supabase queries (boundary normalization)
            const { data: nestedReplies, error } = await supabase
                .from('messages')
                .select('id')
                .eq('parent_id', messageId) // Supabase column name
                .eq('page_id', pageId) // Supabase column name
                .eq('community_id', communityId); // Supabase column name
            if (error) {
                console.warn(`⚠️ ReplyLoader: Error checking nested replies for ${messageId}:`, error);
                return { hasReplies: false, replyCount: 0 };
            }
            const hasReplies = nestedReplies && nestedReplies.length > 0;
            const replyCount = nestedReplies ? nestedReplies.length : 0;
            return { hasReplies, replyCount };
        }
        catch (err) {
            console.warn(`⚠️ ReplyLoader: Error checking nested replies for ${messageId}:`, err);
            return { hasReplies: false, replyCount: 0 };
        }
    }
    /**
     * Load all replies for a message (recursively)
     */
    static async loadAllReplies(messageId, pageId, communityId) {
        const supabase = window.supabase || supabaseServiceInstance.getClient();
        if (!supabase || !pageId || !communityId) {
            console.warn(`⚠️ ReplyLoader: Cannot load replies - missing dependencies`);
            return [];
        }
        try {
            // Load direct replies - using snake_case for Supabase (boundary normalization)
            const { data: directReplies, error } = await supabase
                .from('messages')
                .select('*')
                .eq('parent_id', messageId) // Supabase column name
                .eq('page_id', pageId) // Supabase column name
                .eq('community_id', communityId) // Supabase column name
                .order('created_at', { ascending: true }); // Supabase column name
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
                    const { data: nestedReplies, error: nestedError } = await supabase
                        .from('messages')
                        .select('*')
                        .eq('parent_id', parentMsg.id) // Supabase column name
                        .eq('page_id', pageId) // Supabase column name
                        .eq('community_id', communityId) // Supabase column name
                        .order('created_at', { ascending: true }); // Supabase column name
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
        }
        catch (err) {
            console.error(`❌ ReplyLoader: Error loading replies for ${messageId}:`, err);
            return [];
        }
    }
    /**
     * Fetch author data for a reply
     */
    static async fetchReplyAuthor(userId) {
        if (!userId) {
            return { id: userId, name: 'Unknown' };
        }
        try {
            if (window.api && window.api.request) {
                const resp = await window.api.request(`/v1/users/${encodeURIComponent(userId)}`, {
                    method: 'GET',
                    allow404: true
                });
                if (resp) {
                    // Normalize to camelCase (boundary normalization)
                    return {
                        id: resp.id || userId,
                        name: resp.name || 'Unknown',
                        avatarUrl: resp.avatarUrl || null,
                        auraColor: resp.auraColor || null
                    };
                }
            }
        }
        catch (err) {
            console.error('❌ ReplyLoader: Error fetching reply author:', err);
        }
        return { id: userId, name: 'Unknown' };
    }
    /**
     * Convert Supabase reply data to API format
     */
    static async formatReply(replyData, parentMessage, pageId, communityId) {
        const replyUserId = replyData.user_id || replyData.userId; // Handle both formats
        let replyAuthor = replyData.author;
        // Fetch author if not present
        if (!replyAuthor && replyUserId) {
            replyAuthor = await this.fetchReplyAuthor(replyUserId);
        }
        if (!replyAuthor) {
            replyAuthor = { id: replyUserId, name: 'Unknown' };
        }
        // Check for nested replies
        const { hasReplies, replyCount } = await this.checkForNestedReplies(replyData.id, pageId, communityId);
        // Normalize to camelCase (boundary normalization from Supabase)
        return {
            id: replyData.id,
            content: replyData.body || replyData.content || '',
            author: replyAuthor,
            authorId: replyUserId,
            createdAt: replyData.created_at || replyData.createdAt || new Date().toISOString(),
            parentId: replyData.parent_id || parentMessage.id,
            conversationId: parentMessage.conversationId,
            communityId: communityId,
            pageId: pageId,
            isReply: true,
            hasReplies: hasReplies,
            replyCount: replyCount
        };
    }
}
// Export to window for backward compatibility
if (typeof window !== 'undefined') {
    window.ReplyLoader = ReplyLoader;
    console.log('✅ ReplyLoader: Exported to window');
}
export default ReplyLoader;
//# sourceMappingURL=ReplyLoader.js.map