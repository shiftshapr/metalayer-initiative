/**
 * REACTIONS REALTIME MANAGER - Following Working Message Pattern
 * Extends the working message system pattern for reactions features
 */
import { Logger } from './Logger.js';
export class ReactionsRealtimeManager {
    constructor() {
        this.isConnected = false;
        this.isConnecting = false;
        this.currentPageId = null;
        this.user = null;
        this.supabase = null;
        this.channels = new Map();
        this._processedEvents = new Set();
        this.logger = this._createLogger();
    }
    /**
     * Initialize with Supabase client
     */
    async initialize(supabaseClient) {
        if (!supabaseClient) {
            this.logger.error('Supabase client required');
            return false;
        }
        this.supabase = supabaseClient;
        this.logger.info('ReactionsRealtimeManager initialized');
        return true;
    }
    /**
     * Set user for real-time operations
     */
    setUser(userId, communityId = 'comm-001') {
        if (!userId) {
            this.logger.error('User ID is required');
            return false;
        }
        this.user = {
            id: userId,
            communityId: communityId,
        };
        this.logger.info(`User set: ${userId}`);
        return true;
    }
    /**
     * Join a page for real-time reactions updates
     */
    async joinPage(pageUrl) {
        if (!this.user) {
            this.logger.error('User must be set before joining page');
            return false;
        }
        if (this.isConnecting) {
            this.logger.warn('Already connecting to page');
            return false;
        }
        try {
            this.isConnecting = true;
            this.logger.info(`Joining page for reactions: ${pageUrl}`);
            // Normalize page URL (same as message system)
            const normalizedUrl = await this._normalizeUrl(pageUrl);
            this.currentPageId = normalizedUrl;
            // Subscribe to Postgres Changes for reactions
            await this._setupReactionsSubscription(normalizedUrl);
            this.isConnected = true;
            this.isConnecting = false;
            this.logger.info('Page joined for reactions successfully');
            return true;
        }
        catch (error) {
            this.logger.error('Failed to join page for reactions:', error);
            this.isConnecting = false;
            return false;
        }
    }
    /**
     * Setup Postgres Changes subscription for reactions
     */
    async _setupReactionsSubscription(pageId) {
        try {
            const channelName = `reactions-${pageId}`;
            if (!this.supabase) {
                this.logger.error('Supabase client not initialized');
                return;
            }
            const channel = this.supabase
                .channel(channelName)
                .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'reactions',
            }, (payload) => {
                if (payload) {
                    this._handleReactionChange(payload);
                }
            })
                .subscribe();
            this.channels.set(channelName, channel);
            this.logger.info(`Reactions subscription started for page: ${pageId}`);
        }
        catch (error) {
            this.logger.error('Failed to setup reactions subscription:', error);
            throw error;
        }
    }
    /**
     * Handle reaction changes from Postgres
     */
    _handleReactionChange(payload) {
        const eventId = `reaction-${payload.new?.id || payload.old?.id}-${Date.now()}`;
        // Prevent duplicate processing
        if (this._processedEvents.has(eventId)) {
            return;
        }
        this._processedEvents.add(eventId);
        this.logger.info('Reaction change received:', payload);
        this.logger.info(`Real-time ${payload.eventType || 'UNKNOWN'} event for reaction:`, payload.new?.id || payload.old?.id);
        // COMP METHOD: Delegate to the existing global handler
        const windowWithHandler = window;
        if (typeof windowWithHandler.handleReactionChange === 'function') {
            this.logger.info('Delegating to window.handleReactionChange');
            windowWithHandler.handleReactionChange(payload);
        }
        else {
            this.logger.warn('window.handleReactionChange not available, emitting event');
            this._emitReactionEvent(payload);
        }
    }
    /**
     * Emit reaction event
     */
    _emitReactionEvent(payload) {
        // Use the same pattern as the working message system
        // Try ES6 import first, fallback to window for legacy code
        // Note: Using window fallback here to avoid potential circular dependencies
        // This is safe as realtimeFoundation is initialized early in the lifecycle
        let realtimeFoundation = null;
        const windowWithRealtime = window;
        if (windowWithRealtime.realtimeFoundation) {
            realtimeFoundation = windowWithRealtime.realtimeFoundation;
        }
        if (realtimeFoundation && typeof realtimeFoundation.emit === 'function') {
            realtimeFoundation.emit('reaction-realtime-update', {
                type: payload.eventType || 'UPDATE',
                data: payload.new || payload.old,
                pageId: this.currentPageId,
                timestamp: Date.now(),
            });
        }
    }
    /**
     * Add a reaction to a message
     */
    async addReaction(messageId, reactionType) {
        if (!this.isConnected) {
            this.logger.error('Not connected to any page');
            return false;
        }
        if (!this.user) {
            this.logger.error('User not set');
            return false;
        }
        try {
            this.logger.info(`Adding reaction: ${reactionType} to message: ${messageId}`);
            // COMP METHOD: Use API instead of direct Supabase calls
            // Backend uses authenticated user from headers - don't send user_id in body
            const windowWithApi = window;
            if (typeof windowWithApi.api !== 'undefined' && windowWithApi.api?.request) {
                const result = await windowWithApi.api.request('/v1/reactions', {
                    method: 'POST',
                    body: JSON.stringify({
                        messageId: messageId,
                        emoji: reactionType,
                    }),
                });
                if (result.success || result.action) {
                    this.logger.info('Reaction added successfully via API:', result);
                    return true;
                }
                else {
                    this.logger.error('API failed to add reaction:', result);
                    return false;
                }
            }
            else {
                this.logger.error('API module not available');
                return false;
            }
        }
        catch (error) {
            this.logger.error('Error adding reaction:', error);
            return false;
        }
    }
    /**
     * Remove a reaction from a message
     */
    async removeReaction(messageId, reactionType) {
        if (!this.isConnected) {
            this.logger.error('Not connected to any page');
            return false;
        }
        if (!this.user) {
            this.logger.error('User not set');
            return false;
        }
        try {
            this.logger.info(`Removing reaction: ${reactionType} from message: ${messageId}`);
            // COMP METHOD: Use API instead of direct Supabase calls
            // Backend uses authenticated user from headers - don't send user_id in body
            const windowWithApi = window;
            if (typeof windowWithApi.api !== 'undefined' && windowWithApi.api?.request) {
                const result = await windowWithApi.api.request('/v1/reactions', {
                    method: 'POST',
                    body: JSON.stringify({
                        messageId: messageId,
                        emoji: reactionType,
                    }),
                });
                if (result.success || result.action) {
                    this.logger.info('Reaction removed successfully via API:', result);
                    return true;
                }
                else {
                    this.logger.error('API failed to remove reaction:', result);
                    return false;
                }
            }
            else {
                this.logger.error('API module not available');
                return false;
            }
        }
        catch (error) {
            this.logger.error('Error removing reaction:', error);
            return false;
        }
    }
    /**
     * Get reactions for a message
     */
    async getReactions(messageId) {
        if (!this.isConnected) {
            this.logger.error('Not connected to any page');
            return false;
        }
        if (!this.supabase) {
            this.logger.error('Supabase client not initialized');
            return false;
        }
        try {
            this.logger.info(`Getting reactions for message: ${messageId}`);
            const { data, error } = await this.supabase
                .from('message_reactions')
                .select('*')
                .eq('message_id', messageId);
            if (error) {
                this.logger.error('Failed to get reactions:', error);
                return false;
            }
            this.logger.info('Reactions retrieved successfully:', data);
            return data;
        }
        catch (error) {
            this.logger.error('Error getting reactions:', error);
            return false;
        }
    }
    /**
     * Normalize URL (same as message system)
     */
    async _normalizeUrl(url) {
        try {
            // Use the same normalization as the working message system
            const windowWithNormalize = window;
            if (typeof windowWithNormalize.normalizeUrl === 'function') {
                const result = await windowWithNormalize.normalizeUrl(url);
                return result.pageId || url;
            }
            // Fallback normalization
            const urlObj = new URL(url);
            const normalized = urlObj.hostname + urlObj.pathname;
            return normalized.replace(/[.\/]/g, '_');
        }
        catch (_error) {
            this.logger.warn('Failed to normalize URL, using as-is:', url);
            return url;
        }
    }
    /**
     * Create logger
     */
    _createLogger() {
        return {
            info: (message, data) => Logger.info(`[ReactionsRealtimeManager] ${message}`, data, 'reactions-realtime'),
            warn: (message, data) => Logger.warn(`[ReactionsRealtimeManager] ${message}`, data, 'reactions-realtime'),
            error: (message, data) => Logger.error(`[ReactionsRealtimeManager] ${message}`, data, 'reactions-realtime'),
            debug: (message, data) => Logger.debug(`[ReactionsRealtimeManager] ${message}`, data, 'reactions-realtime'),
        };
    }
    /**
     * Get connection status
     */
    getStatus() {
        return {
            isConnected: this.isConnected,
            isConnecting: this.isConnecting,
            currentPageId: this.currentPageId,
            user: this.user ? this.user.email || this.user.id : null,
            channels: Array.from(this.channels.keys()),
        };
    }
}
// Export for use
if (typeof window !== 'undefined') {
    const windowWithReactions = window;
    windowWithReactions.ReactionsRealtimeManager = ReactionsRealtimeManager;
}
