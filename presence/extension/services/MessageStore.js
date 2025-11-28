/**
 * MessageStore - Centralized message cache and state management
 *
 * Features:
 * - Per pageId + parentId cache keys
 * - Keyset pagination support
 * - Event emitter for UI updates
 * - Real-time event merging
 */
import { stateManagerInstance } from '../core/StateManager.js';
import { API_CONFIG } from '../core/APIConfig.js';
import { handleError } from '../utils/ErrorHandler.js';
import { Logger } from '../utils/Logger.js';
const DEFAULT_MESSAGES_PATH = '/api/messages';
const FALLBACK_API_BASE = API_CONFIG.baseUrl;
function resolveApiBaseUrl() {
    const apiState = stateManagerInstance.getState('api');
    const baseFromState = apiState?.baseURL;
    const win = typeof window !== 'undefined'
        ? window
        : undefined;
    const baseFromWindow = win?.API_URL || win?.API_BASE_URL || win?.apiBaseURL || win?.config?.API_URL;
    const baseUrl = baseFromState || baseFromWindow || FALLBACK_API_BASE;
    return baseUrl.replace(/\/$/, '');
}
export function resolveMessagesEndpoint(path = DEFAULT_MESSAGES_PATH) {
    if (/^https?:\/\//i.test(path)) {
        return path;
    }
    const normalizedPath = path.startsWith('/') ? path : `/${path}`;
    return `${resolveApiBaseUrl()}${normalizedPath}`;
}
class MessageStore {
    constructor(apiBaseUrl = DEFAULT_MESSAGES_PATH) {
        this.cache = new Map();
        this.listeners = new Map();
        this.apiBaseUrl = apiBaseUrl;
        this.setupEventListeners();
    }
    getCacheKey(pageId, parentId) {
        return `${pageId}|${parentId || 'null'}`;
    }
    on(event, listener) {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, new Set());
        }
        this.listeners.get(event).add(listener);
        return () => {
            this.listeners.get(event)?.delete(listener);
        };
    }
    emit(event, data) {
        this.listeners.get(event)?.forEach(listener => {
            try {
                listener(data);
            }
            catch (error) {
                handleError(error, {
                    log: true,
                    logLevel: 'error',
                    context: {
                        operation: 'catch',
                        component: 'MessageStore'
                    }
                });
                ;
            }
        });
    }
    setupEventListeners() {
        if (typeof window !== 'undefined') {
            window.addEventListener('realtime-message', ((event) => {
                this.handleRealtimeMessage(event.detail || {});
            }));
            window.addEventListener('realtime-message-updated', ((event) => {
                this.handleRealtimeUpdate(event.detail || {});
            }));
            window.addEventListener('realtime-message-deleted', ((event) => {
                this.handleRealtimeDelete(event.detail || {});
            }));
        }
    }
    get(pageId, parentId) {
        const key = this.getCacheKey(pageId, parentId);
        return this.cache.get(key) || null;
    }
    getStatus(pageId, parentId) {
        const entry = this.get(pageId, parentId);
        return entry?.status || 'idle';
    }
    async load(pageId, parentId = null, options = {}) {
        const key = this.getCacheKey(pageId, parentId);
        const { limit = 10, cursor = null, includeTopReply = parentId === null, communityId = 'abe5ec85-4ba6-456f-adaf-03d7d51cecf4' } = options;
        const existingEntry = this.cache.get(key);
        if (existingEntry) {
            existingEntry.status = 'loading';
            this.emit('statusChange', { key, status: 'loading' });
        }
        try {
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
            const endpoint = resolveMessagesEndpoint(this.apiBaseUrl);
            const response = await fetch(`${endpoint}?${params.toString()}`);
            if (!response.ok) {
                throw new Error(`API error: ${response.status} ${response.statusText}`);
            }
            const data = await response.json();
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
            handleError(error, {
                log: true,
                logLevel: 'error',
                context: {
                    operation: 'catch',
                    component: 'MessageStore'
                }
            });
            ;
            if (existingEntry) {
                existingEntry.status = 'error';
                this.emit('statusChange', { key, status: 'error' });
            }
            this.emit('error', { key, error });
            throw error;
        }
    }
    async loadNextPage(pageId, parentId = null) {
        const entry = this.get(pageId, parentId);
        if (!entry || !entry.nextCursor || entry.status === 'exhausted') {
            return null;
        }
        return this.load(pageId, parentId, { cursor: entry.nextCursor });
    }
    handleRealtimeMessage(message) {
        const pageId = message.page_id || message.pageId;
        const parentId = message.parent_id || message.parentId || null;
        if (!pageId) {
            Logger.warn('⚠️ MessageStore.handleRealtimeMessage: Missing pageId', message, 'general');
            return;
        }
        const key = this.getCacheKey(pageId, parentId);
        let entry = this.cache.get(key);
        // If cache entry doesn't exist, create it
        if (!entry) {
            Logger.debug(`📝 MessageStore: Creating new cache entry for ${key}`, null, 'general');
            entry = {
                items: [],
                nextCursor: null,
                status: 'ready',
                lastFetched: Date.now(),
                parent: null
            };
            this.cache.set(key, entry);
        }
        const normalized = this.normalizeMessage(message);
        // Check if message already exists (prevent duplicates)
        const existingIndex = entry.items.findIndex(m => m.id === normalized.id);
        if (existingIndex >= 0) {
            Logger.debug(`📝 MessageStore: Message ${normalized.id} already in cache, updating`, 'general');
            entry.items[existingIndex] = normalized;
        }
        else {
            Logger.debug(`📝 MessageStore: Adding new message ${normalized.id} to cache (key: ${key})`, null, 'general');
            entry.items.unshift(normalized);
        }
        Logger.debug(`📝 MessageStore: Emitting update event for key ${key} with ${entry.items.length} messages`, null, 'general');
        this.emit('update', { key, data: entry });
    }
    handleRealtimeUpdate(message) {
        // Implementation for handling updates
        this.emit('messageUpdated', message);
    }
    handleRealtimeDelete(messageId) {
        // Implementation for handling deletes
        this.emit('messageDeleted', { id: messageId });
    }
    normalizeMessage(message) {
        // Handle Supabase format: user_id instead of authorId, and may need to fetch author
        const authorId = message.authorId || message.user_id || '';
        const normalized = {
            id: message.id || '',
            content: message.content || '',
            authorId,
            pageId: message.page_id || message.pageId,
            parentId: message.parent_id || message.parentId || null,
            author: message.author, // May be undefined for real-time messages - will need to be fetched
            createdAt: (message.createdAt || message.created_at || undefined),
            updatedAt: (message.updatedAt || message.updated_at || undefined),
            communityId: (message.communityId || message.community_id || undefined),
            status: message.status
        };
        // If author is missing but we have authorId, log a warning
        if (!normalized.author && authorId) {
            Logger.warn(`⚠️ MessageStore.normalizeMessage: Message ${normalized.id} missing author info (authorId: ${authorId})`, null, 'general');
        }
        return normalized;
    }
}
// Export singleton instance
export const messageStore = new MessageStore();
// Also export class for testing
export { MessageStore };
