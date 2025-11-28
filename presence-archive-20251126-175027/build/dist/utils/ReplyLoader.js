/**
 * REPLY LOADER MODULE - TypeScript Version
 *
 * Handles loading and managing replies for messages in focus mode.
 * Separates reply loading logic from message rendering.
 */
import { supabaseServiceInstance } from '../services/SupabaseService.js';
import { handleError } from './ErrorHandler.js';
import { Logger } from './Logger.js';
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
            const supabaseQuery = supabase;
            const queryResult = await supabaseQuery.from('messages').select('id').eq('parent_id', messageId).eq('page_id', pageId).eq('community_id', communityId);
            const { data: nestedReplies, error } = queryResult;
            if (error) {
                Logger.warn(`⚠️ ReplyLoader: Error checking nested replies for ${messageId}:`, error, 'messages');
                return { hasReplies: false, replyCount: 0 };
            }
            const hasReplies = nestedReplies !== null && nestedReplies !== undefined && nestedReplies.length > 0;
            const replyCount = nestedReplies !== null && nestedReplies !== undefined ? nestedReplies.length : 0;
            return { hasReplies: hasReplies || false, replyCount };
        }
        catch (err) {
            handleError(err, {
                log: true,
                logLevel: 'warn',
                context: {
                    operation: 'checkForReplies',
                    component: 'ReplyLoader',
                    messageId
                }
            });
            return { hasReplies: false, replyCount: 0 };
        }
    }
    /**
     * Load all replies for a message (recursively)
     */
    static async loadAllReplies(messageId, pageId, communityId) {
        const supabase = window.supabase || supabaseServiceInstance.getClient();
        if (!supabase || !pageId || !communityId) {
            Logger.warn(`⚠️ ReplyLoader: Cannot load replies - missing dependencies`, null, 'messages');
            return [];
        }
        try {
            // Load direct replies - using snake_case for Supabase (boundary normalization)
            const supabaseQuery = supabase;
            const queryResult = await supabaseQuery.from('messages').select('*').eq('parent_id', messageId).eq('page_id', pageId).eq('community_id', communityId).order('created_at', { ascending: true });
            const { data: directReplies, error } = queryResult;
            if (error) {
                Logger.error(`❌ ReplyLoader: Error loading direct replies for ${messageId}:`, error, 'messages');
                return [];
            }
            if (!directReplies || directReplies.length === 0) {
                return [];
            }
            // Recursively load nested replies
            const allReplies = [];
            for (const directReply of directReplies) {
                if (directReply && typeof directReply === 'object' && 'id' in directReply) {
                    allReplies.push(directReply);
                    // Recursively load nested replies
                    const loadNestedReplies = async (parentMsg) => {
                        const supabaseQuery = supabase;
                        const queryResult = await supabaseQuery.from('messages').select('*').eq('parent_id', parentMsg.id).eq('page_id', pageId).eq('community_id', communityId).order('created_at', { ascending: true });
                        const { data: nestedReplies, error: nestedError } = queryResult;
                        if (!nestedError && nestedReplies && nestedReplies.length > 0) {
                            for (const nestedReply of nestedReplies) {
                                if (nestedReply && typeof nestedReply === 'object' && 'id' in nestedReply) {
                                    allReplies.push(nestedReply);
                                    // Recursively load deeper nested replies
                                    await loadNestedReplies(nestedReply);
                                }
                            }
                        }
                    };
                    await loadNestedReplies(directReply);
                }
            }
            return allReplies;
        }
        catch (err) {
            handleError(err, {
                log: true,
                logLevel: 'error',
                context: {
                    operation: 'loadReplies',
                    component: 'ReplyLoader',
                    pageId,
                    communityId
                }
            });
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
                    const respData = resp;
                    return {
                        id: (typeof respData?.id === 'string' ? respData.id : null) || userId,
                        name: (typeof respData?.name === 'string' ? respData.name : null) || 'Unknown',
                        avatarUrl: (typeof respData?.avatarUrl === 'string' ? respData.avatarUrl : undefined) || undefined,
                        auraColor: (typeof respData?.auraColor === 'string' ? respData.auraColor : undefined) || undefined
                    };
                }
            }
        }
        catch (err) {
            handleError(err, {
                log: true,
                logLevel: 'error',
                context: {
                    operation: 'getUserInfo',
                    component: 'ReplyLoader',
                    userId
                }
            });
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
        if (!replyAuthor && replyUserId) {
            replyAuthor = { id: replyUserId, name: 'Unknown' };
        }
        // Check for nested replies
        const { hasReplies, replyCount } = await this.checkForNestedReplies(replyData.id, pageId, communityId);
        // Normalize to camelCase (boundary normalization from Supabase)
        const formatted = {
            id: replyData.id,
            content: replyData.body || replyData.content || '',
            author: replyAuthor,
            authorId: replyUserId || '',
            createdAt: replyData.created_at || replyData.createdAt || new Date().toISOString(),
            updatedAt: replyData.created_at || replyData.createdAt || new Date().toISOString(),
            parentId: replyData.parent_id || parentMessage.id || null,
            conversationId: typeof parentMessage.conversationId === 'string' ? parentMessage.conversationId : undefined,
            communityId: communityId,
            pageId: pageId,
            isReply: true,
            hasReplies: hasReplies,
            replyCount: replyCount
        };
        return formatted;
    }
}
// Export to window for backward compatibility
if (typeof window !== 'undefined') {
    window.ReplyLoader = ReplyLoader;
    Logger.debug('✅ ReplyLoader: Exported to window', null, 'messages');
}
export default ReplyLoader;
//# sourceMappingURL=ReplyLoader.js.map