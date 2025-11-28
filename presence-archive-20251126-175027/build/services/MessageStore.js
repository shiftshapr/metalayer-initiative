/**
 * MessageStore - Centralized message cache and state management
 *
 * Features:
 * - Per pageId + parentId cache keys
 * - Keyset pagination support
 * - Event emitter for UI updates
 * - Real-time event merging
 */
class MessageStore {
    constructor(apiBaseUrl = '/api/messages') {
        this.cache = new Map();
        this.listeners = new Map();
        this.apiBaseUrl = apiBaseUrl;
        this.setupEventListeners();
    }
    /**
     * Generate cache key from pageId and parentId
     */
    getCacheKey(pageId, parentId) {
        return `${pageId}|${parentId || 'null'}`;
    }
    /**
     * Subscribe to store events
     */
    on(event, listener) {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, new Set());
        }
        this.listeners.get(event).add(listener);
        // Return unsubscribe function
        return () => {
            this.listeners.get(event)?.delete(listener);
        };
    }
    /**
     * Emit store events
     */
    emit(event, data) {
        this.listeners.get(event)?.forEach(listener => {
            try {
                listener(data);
            }
            catch (error) {
                console.error(`Error in store event listener:`, error);
            }
        });
    }
    /**
     * Setup event listeners (for real-time updates, etc.)
     */
    setupEventListeners() {
        // Listen for real-time message events
        if (typeof window !== 'undefined') {
            window.addEventListener('realtime-message', (event) => {
                const customEvent = event;
                this.handleRealtimeMessage(customEvent.detail || {});
            });
            window.addEventListener('realtime-message-updated', (event) => {
                const customEvent = event;
                this.handleRealtimeUpdate(customEvent.detail || {});
            });
            window.addEventListener('realtime-message-deleted', (event) => {
                const customEvent = event;
                this.handleRealtimeDelete(customEvent.detail || {});
            });
        }
    }
    /**
     * Get cached entry
     */
    get(pageId, parentId) {
        const key = this.getCacheKey(pageId, parentId);
        return this.cache.get(key) || null;
    }
    /**
     * Get status for a cache entry
     */
    getStatus(pageId, parentId) {
        const entry = this.get(pageId, parentId);
        return entry?.status || 'idle';
    }
    /**
     * Load messages from API
     */
    async load(pageId, parentId = null, options = {}) {
        const key = this.getCacheKey(pageId, parentId);
        const { limit = 10, cursor = null, includeTopReply = parentId === null, communityId = 'comm-001' } = options;
        // Update status to loading
        const existingEntry = this.cache.get(key);
        if (existingEntry) {
            existingEntry.status = 'loading';
            this.emit('statusChange', { key, status: 'loading' });
        }
        try {
            // Build query params
            const params = new URLSearchParams({
                pageId,
                limit: limit.toString(),
                includeTopReply: includeTopReply.toString(),
                communityId
            });
            if (parentId) {
                params.append('parentId', parentId);
            }
            else {
                params.append('parentId', 'null');
            }
            if (cursor) {
                params.append('cursor', cursor);
            }
            // Fetch from API
            const response = await fetch(`${this.apiBaseUrl}?${params.toString()}`);
            if (!response.ok) {
                throw new Error(`API error: ${response.status} ${response.statusText}`);
            }
            const data = await response.json();
            // Update cache
            const entry = {
                items: cursor ? [...(existingEntry?.items || []), ...data.items] : data.items,
                nextCursor: data.nextCursor,
                status: data.hasMore ? 'ready' : 'exhausted',
                lastFetched: Date.now(),
                parent: data.parent || existingEntry?.parent || null
            };
            this.cache.set(key, entry);
            this.emit('update', { key, data: entry });
            this.emit('statusChange', { key, status: entry.status });
            return data;
        }
        catch (error) {
            console.error('MessageStore.load error:', error);
            // Update status to error
            if (existingEntry) {
                existingEntry.status = 'error';
                this.emit('statusChange', { key, status: 'error' });
            }
            this.emit('error', { key, error });
            throw error;
        }
    }
    /**
     * Load next page (lazy loading)
     */
    async loadNextPage(pageId, parentId = null) {
        const entry = this.get(pageId, parentId);
        if (!entry || !entry.nextCursor || entry.status === 'exhausted') {
            return null;
        }
        return this.load(pageId, parentId, {
            cursor: entry.nextCursor,
            includeTopReply: parentId === null
        });
    }
    /**
     * Invalidate cache entry
     */
    invalidate(pageId, parentId) {
        const key = this.getCacheKey(pageId, parentId);
        this.cache.delete(key);
        this.emit('update', { key, data: null });
    }
    /**
     * Clear all cache
     */
    clear() {
        this.cache.clear();
        this.emit('update', { key: null, data: null });
    }
    /**
     * Handle real-time message insert
     */
    handleRealtimeMessage(message) {
        // Find matching cache entries and merge
        for (const [key, entry] of this.cache.entries()) {
            const [cachedPageId, cachedParentId] = key.split('|');
            const messageParentId = message.parent_id || 'null';
            // Check if message belongs to this cache entry
            if (message.page_id === cachedPageId &&
                (messageParentId === cachedParentId ||
                    (cachedParentId === 'null' && !message.parent_id))) {
                // Check if message already exists (avoid duplicates)
                const exists = entry.items.some(m => m.id === message.id);
                if (!exists) {
                    // Add to beginning (newest first)
                    entry.items.unshift(this.normalizeMessage(message));
                    this.emit('update', { key, data: entry });
                }
            }
        }
    }
    /**
     * Handle real-time message update
     */
    handleRealtimeUpdate(message) {
        for (const [key, entry] of this.cache.entries()) {
            const index = entry.items.findIndex(m => m.id === message.id);
            if (index !== -1) {
                // Update existing message (prefer real-time data, but use timestamp for conflict resolution)
                const existing = entry.items[index];
                const existingTime = existing.updatedAt ? new Date(existing.updatedAt).getTime() : 0;
                const newTime = (message.updated_at || message.updatedAt) ? new Date(message.updated_at || message.updatedAt || '').getTime() : 0;
                if (newTime >= existingTime) {
                    entry.items[index] = this.normalizeMessage(message);
                    this.emit('update', { key, data: entry });
                }
            }
        }
    }
    /**
     * Handle real-time message deletion
     */
    handleRealtimeDelete(message) {
        for (const [key, entry] of this.cache.entries()) {
            const index = entry.items.findIndex(m => m.id === message.id || m.id === message.message_id);
            if (index !== -1) {
                entry.items.splice(index, 1);
                this.emit('update', { key, data: entry });
            }
        }
    }
    /**
     * Normalize message from API format
     */
    normalizeMessage(message) {
        const normalized = {
            id: message.id || '',
            authorId: (message.authorId || message.user_id || ''),
            communityId: message.communityId || '',
            content: message.content || '',
            createdAt: message.createdAt || message.created_at || new Date().toISOString(),
            messageKind: message.messageKind || 'TEXT',
            attachments: message.attachments || [],
            emojiMetadata: message.emojiMetadata || null,
            parentId: message.parentId || message.parent_id || null,
            updatedAt: message.updatedAt || message.updated_at,
            ...(message.author && { author: message.author }),
            ...(message.thread && { thread: message.thread }),
            ...(message.focusContext && { focusContext: message.focusContext })
        };
        // If no author object, create minimal one
        if (!normalized.author && message.user_id) {
            normalized.author = {
                id: message.user_id,
                name: message.author_name || 'Unknown',
                handle: message.author_handle || 'unknown',
                avatarUrl: message.author_avatar_url || '',
                ...(message.author_aura_color && { auraColor: message.author_aura_color })
            };
        }
        return normalized;
    }
}
// Export singleton instance
export const messageStore = new MessageStore();
// Also export class for testing
export { MessageStore };
