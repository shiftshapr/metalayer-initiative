/**
 * RealtimeSubscriptionService - Handles Supabase real-time subscriptions only
 *
 * Separated from write logic for cleaner architecture.
 * Uses anon key + RLS for secure, filtered subscriptions.
 */
import { messageStore } from './MessageStore.js';
import { handleError } from '../utils/ErrorHandler.js';
import { Logger } from '../utils/Logger.js';
export class RealtimeSubscriptionService {
    constructor(supabaseClient) {
        this.channels = new Map();
        this.isInitialized = false;
        this.supabase = supabaseClient;
    }
    /**
     * Initialize the service
     */
    async initialize() {
        if (this.isInitialized) {
            return true;
        }
        if (!this.supabase || !this.supabase.realtime) {
            Logger.error('RealtimeSubscriptionService: Supabase client not available', null, 'general');
            return false;
        }
        this.isInitialized = true;
        Logger.debug('✅ RealtimeSubscriptionService: Initialized', null, 'general');
        return true;
    }
    /**
     * Subscribe to messages for a page
     */
    async subscribeToPage(config) {
        const { pageId, onError } = config;
        if (!this.isInitialized) {
            const initialized = await this.initialize();
            if (!initialized) {
                return false;
            }
        }
        // Unsubscribe from existing channel for this page if any
        this.unsubscribeFromPage(pageId);
        try {
            const channelName = `messages:${pageId}`;
            // Use proper Supabase channel type - channels support method chaining
            const channel = this.supabase.channel(channelName);
            // Set up INSERT listener
            channel.on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'messages',
                filter: `page_id=eq.${pageId}`
            }, (payload) => {
                const inserted = payload.new;
                if (inserted) {
                    this.handleMessageInsert(inserted);
                }
            });
            // Set up UPDATE listener
            channel.on('postgres_changes', {
                event: 'UPDATE',
                schema: 'public',
                table: 'messages',
                filter: `page_id=eq.${pageId}`
            }, (payload) => {
                const updated = payload.new;
                if (updated) {
                    this.handleMessageUpdate(updated);
                }
            });
            // Set up DELETE listener
            channel.on('postgres_changes', {
                event: 'DELETE',
                schema: 'public',
                table: 'messages',
                filter: `page_id=eq.${pageId}`
            }, (payload) => {
                const removed = payload.old;
                if (removed) {
                    this.handleMessageDelete(removed);
                }
            });
            channel.subscribe((status, err) => {
                if (err) {
                    Logger.error('RealtimeSubscriptionService: Subscription error:', err, 'general');
                    if (onError) {
                        onError(err);
                    }
                    this.showNotification('Real-time connection error. Some updates may be delayed.');
                }
                else if (status === 'SUBSCRIBED') {
                    Logger.debug(`✅ RealtimeSubscriptionService: Subscribed to ${channelName}`, null, 'general');
                }
            });
            this.channels.set(pageId, channel);
            return true;
        }
        catch (error) {
            handleError(error, {
                log: true,
                logLevel: 'error',
                context: {
                    operation: 'catch',
                    component: 'RealtimeSubscriptionService',
                    pageId
                }
            });
            ;
            if (onError) {
                onError(error instanceof Error ? error : new Error(String(error)));
            }
            return false;
        }
    }
    /**
     * Unsubscribe from a page
     */
    unsubscribeFromPage(pageId) {
        const channel = this.channels.get(pageId);
        if (channel) {
            // Supabase client has removeChannel method
            const supabaseWithRemove = this.supabase;
            if (supabaseWithRemove && typeof supabaseWithRemove.removeChannel === 'function') {
                supabaseWithRemove.removeChannel(channel);
            }
            else {
                // Fallback: unsubscribe from channel directly
                if (typeof channel.unsubscribe === 'function') {
                    channel.unsubscribe();
                }
            }
            this.channels.delete(pageId);
            Logger.debug(`✅ RealtimeSubscriptionService: Unsubscribed from ${pageId}`, null, 'general');
        }
    }
    /**
     * Unsubscribe from all pages
     */
    unsubscribeAll() {
        for (const [pageId] of this.channels) {
            this.unsubscribeFromPage(pageId);
        }
    }
    /**
     * Handle message insert (new message)
     */
    handleMessageInsert(message) {
        Logger.debug('📨 RealtimeSubscriptionService: New message:', message.id, 'general');
        // Dispatch event for MessageStore to handle
        if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('realtime-message', {
                detail: message
            }));
        }
        // Also update MessageStore directly
        messageStore['handleRealtimeMessage'](message);
    }
    /**
     * Handle message update
     */
    handleMessageUpdate(message) {
        Logger.debug('✏️ RealtimeSubscriptionService: Message updated:', message.id, 'general');
        if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('realtime-message-updated', {
                detail: message
            }));
        }
        // Update MessageStore
        messageStore['handleRealtimeUpdate'](message);
    }
    /**
     * Handle message delete
     */
    handleMessageDelete(message) {
        Logger.debug('🗑️ RealtimeSubscriptionService: Message deleted:', message.id, 'general');
        if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('realtime-message-deleted', {
                detail: message
            }));
        }
        // Update MessageStore
        const messageId = (message && typeof message === 'object' && 'id' in message ? message.id : undefined) || (message && typeof message === 'object' && 'message_id' in message ? message.message_id : undefined);
        if (messageId && typeof messageId === 'string') {
            messageStore['handleRealtimeDelete'](messageId);
        }
    }
    /**
     * Show notification (if callback is set)
     */
    showNotification(message) {
        if (this.errorNotificationCallback) {
            this.errorNotificationCallback(message);
        }
        else if (typeof window !== 'undefined' && window.showNotification) {
            window.showNotification(message);
        }
    }
    /**
     * Set error notification callback
     */
    setErrorNotificationCallback(callback) {
        this.errorNotificationCallback = callback;
    }
    /**
     * Get subscription status
     */
    getSubscriptionStatus(pageId) {
        return this.channels.has(pageId) ? 'subscribed' : 'unsubscribed';
    }
}
// Export singleton (will be initialized with Supabase client)
let realtimeSubscriptionService = null;
export function initializeRealtimeSubscriptionService(supabaseClient) {
    if (!realtimeSubscriptionService) {
        realtimeSubscriptionService = new RealtimeSubscriptionService(supabaseClient);
    }
    return realtimeSubscriptionService;
}
export function getRealtimeSubscriptionService() {
    return realtimeSubscriptionService;
}
export const supabaseRealtimeApi = {
    RealtimeSubscriptionService,
    initializeRealtimeSubscriptionService,
    getRealtimeSubscriptionService
};
export default supabaseRealtimeApi;
