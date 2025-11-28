/**
 * RealtimeSubscriptionService - Handles Supabase real-time subscriptions only
 *
 * Separated from write logic for cleaner architecture.
 * Uses anon key + RLS for secure, filtered subscriptions.
 */
import { messageStore } from './MessageStore.js';
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
            console.error('RealtimeSubscriptionService: Supabase client not available');
            return false;
        }
        this.isInitialized = true;
        console.log('✅ RealtimeSubscriptionService: Initialized');
        return true;
    }
    /**
     * Subscribe to messages for a page
     */
    async subscribeToPage(config) {
        const { pageId, communityId = 'comm-001', onError } = config;
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
            const channelBase = this.supabase.channel(channelName);
            const channelChain = channelBase
                .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'messages',
                filter: `page_id=eq.${pageId}`
            }, (payload) => {
                const p = payload;
                this.handleMessageInsert(p.new);
            });
            const channel = channelChain
                .on('postgres_changes', {
                event: 'UPDATE',
                schema: 'public',
                table: 'messages',
                filter: `page_id=eq.${pageId}`
            }, (payload) => {
                const p = payload;
                this.handleMessageUpdate(p.new);
            })
                .on('postgres_changes', {
                event: 'DELETE',
                schema: 'public',
                table: 'messages',
                filter: `page_id=eq.${pageId}`
            }, (payload) => {
                const p = payload;
                this.handleMessageDelete(p.old);
            });
            channel.subscribe((status, err) => {
                if (err) {
                    console.error('RealtimeSubscriptionService: Subscription error:', err);
                    if (onError) {
                        onError(err);
                    }
                    this.showNotification('Real-time connection error. Some updates may be delayed.');
                }
                else if (status === 'SUBSCRIBED') {
                    console.log(`✅ RealtimeSubscriptionService: Subscribed to ${channelName}`);
                }
            });
            this.channels.set(pageId, channelBase);
            return true;
        }
        catch (error) {
            console.error('RealtimeSubscriptionService: Error subscribing:', error);
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
            const supabaseWithRemove = this.supabase;
            supabaseWithRemove.removeChannel?.(channel);
            this.channels.delete(pageId);
            console.log(`✅ RealtimeSubscriptionService: Unsubscribed from ${pageId}`);
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
        console.log('📨 RealtimeSubscriptionService: New message:', message.id);
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
        console.log('✏️ RealtimeSubscriptionService: Message updated:', message.id);
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
        console.log('🗑️ RealtimeSubscriptionService: Message deleted:', message.id);
        if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('realtime-message-deleted', {
                detail: message
            }));
        }
        // Update MessageStore
        messageStore['handleRealtimeDelete'](message);
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
