/**
 * MessagePaginationService - Handles message pagination
 *
 * Maintains cursor-based pagination for default and focus modes.
 */
import { Logger } from '../../utils/Logger.js';
/**
 * MessagePaginationService - Manages message pagination
 */
export class MessagePaginationService {
    constructor(options) {
        this.options = options;
    }
    /**
     * Load a page of messages
     */
    async loadPage(opts) {
        console.log('🔵 MessagePaginationService: Loading page', {
            pageId: this.options.pageId,
            mode: opts.focusState.mode,
            limit: opts.limit
        });
        Logger.debug('MessagePaginationService: Loading page', {
            pageId: this.options.pageId,
            mode: opts.focusState.mode,
            limit: opts.limit
        }, 'messages');
        // Get API instance from window (set by APIModule)
        const api = typeof window !== 'undefined' ? window.api : undefined;
        if (!api || typeof api.request !== 'function') {
            console.warn('⚠️ MessagePaginationService: API not available', {
                apiExists: !!api,
                hasRequest: api && typeof api.request === 'function'
            });
            Logger.warn('MessagePaginationService: API not available', null, 'messages');
            return [];
        }
        try {
            const endpoint = this.buildEndpoint(opts);
            console.log('🔵 MessagePaginationService: Calling API', { endpoint });
            Logger.debug('MessagePaginationService: Calling API', { endpoint }, 'messages');
            const response = await api.request(endpoint, { method: 'GET' });
            console.log('🔵 MessagePaginationService: API response received', {
                hasData: !!response?.data,
                isArray: Array.isArray(response?.data),
                hasItems: !!response?.data?.items,
                responseKeys: response ? Object.keys(response) : []
            });
            Logger.debug('MessagePaginationService: API response received', {
                hasData: !!response?.data,
                isArray: Array.isArray(response?.data),
                hasItems: !!response?.data?.items
            }, 'messages');
            if (response?.data) {
                // Check if response.data has items property
                const dataWithItems = response.data;
                if (dataWithItems.items && Array.isArray(dataWithItems.items)) {
                    console.log('🔵 MessagePaginationService: Found items array, count:', dataWithItems.items.length);
                    const messages = this.transformApiMessages(dataWithItems.items);
                    console.log(`✅ MessagePaginationService: Transformed ${messages.length} messages`);
                    Logger.debug(`MessagePaginationService: Loaded ${messages.length} messages from items array`, null, 'messages');
                    return messages;
                }
                // Handle case where response.data is the items array directly
                if (Array.isArray(response.data)) {
                    console.log('🔵 MessagePaginationService: Response.data is array, count:', response.data.length);
                    const messages = this.transformApiMessages(response.data);
                    console.log(`✅ MessagePaginationService: Transformed ${messages.length} messages`);
                    Logger.debug(`MessagePaginationService: Loaded ${messages.length} messages (direct array)`, null, 'messages');
                    return messages;
                }
                console.warn('⚠️ MessagePaginationService: response.data exists but is not array and has no items property', {
                    dataType: typeof response.data,
                    dataKeys: response.data ? Object.keys(response.data) : []
                });
            }
            console.warn('⚠️ MessagePaginationService: No messages in response', {
                response: response ? 'exists' : 'null',
                data: response?.data ? 'exists' : 'null'
            });
            Logger.warn('MessagePaginationService: No messages in response', {
                response: response ? 'exists' : 'null',
                data: response?.data ? 'exists' : 'null'
            }, 'messages');
            return [];
        }
        catch (error) {
            console.error('❌ MessagePaginationService: Error loading page', error);
            Logger.error('MessagePaginationService: Error loading page', error, 'messages');
            console.error('MessagePaginationService: Full error details:', error);
            return [];
        }
    }
    /**
     * Transform API response messages to Message format
     * Backend returns: { items: [...], nextCursor, hasMore }
     * Each item has: { id, content, author: {...}, createdAt, updatedAt, parentId, thread: {...} }
     */
    transformApiMessages(apiMessages) {
        return apiMessages.map((msg) => {
            const author = msg.author;
            const thread = msg.thread;
            const parentIdValue = msg.parent_id || msg.parentId;
            const parentId = parentIdValue === null || parentIdValue === undefined || parentIdValue === 'null'
                ? null
                : String(parentIdValue);
            const createdAtValue = msg.created_at || msg.createdAt;
            const createdAt = createdAtValue instanceof Date
                ? createdAtValue.toISOString()
                : typeof createdAtValue === 'string'
                    ? createdAtValue
                    : new Date().toISOString();
            const updatedAtValue = msg.updated_at || msg.updatedAt;
            const updatedAt = updatedAtValue instanceof Date
                ? updatedAtValue.toISOString()
                : typeof updatedAtValue === 'string'
                    ? updatedAtValue
                    : new Date().toISOString();
            const optionalContentValue = msg.optional_content || msg.optionalContent;
            const optionalContent = optionalContentValue === null || optionalContentValue === undefined
                ? null
                : String(optionalContentValue);
            // Transform attachments to proper Attachment format
            const attachmentsRaw = msg.attachments;
            const attachments = attachmentsRaw?.map(att => ({
                id: att.id || `att-${Date.now()}-${Math.random()}`,
                type: att.type,
                url: att.url,
                thumbnailUrl: att.thumbnailUrl,
                filename: att.filename || 'attachment',
                size: att.size || 0,
                mimeType: att.mimeType || 'application/octet-stream'
            }));
            return {
                id: String(msg.id || ''),
                content: String(msg.content || ''),
                authorId: author?.id || String(msg.user_id || msg.userId || ''),
                communityId: String(msg.community_id || msg.communityId || this.options.communityId),
                pageId: String(msg.page_id || msg.pageId || this.options.pageId),
                parentId,
                author: author ? {
                    id: author.id,
                    name: author.name,
                    handle: author.handle,
                    avatarUrl: author.avatarUrl,
                    auraColor: author.auraColor
                } : undefined,
                createdAt,
                updatedAt,
                optionalContent,
                attachments,
                replyCount: thread?.replyCount || 0,
                bookmarkCount: typeof msg.bookmarkCount === 'number' ? msg.bookmarkCount : 0,
                isBookmarked: typeof msg.isBookmarked === 'boolean' ? msg.isBookmarked : false,
                hasReplies: (thread?.replyCount || 0) > 0
            };
        });
    }
    /**
     * Build API endpoint for message query
     * Uses /api/messages endpoint (backend route)
     */
    buildEndpoint(opts) {
        const params = new URLSearchParams({
            pageId: this.options.pageId,
            communityId: this.options.communityId,
            limit: opts.limit.toString(),
            parentId: opts.focusState.mode === 'focus' && opts.focusState.parentMessageId
                ? opts.focusState.parentMessageId
                : 'null',
            includeTopReply: 'true' // Include top reply chains for default mode
        });
        if (opts.cursor) {
            params.append('cursor', opts.cursor);
        }
        // Use /api/messages endpoint (backend Express route)
        return `/api/messages?${params.toString()}`;
    }
}
