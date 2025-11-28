/**
 * RealtimeSubscriptionService - Handles Supabase real-time subscriptions only
 *
 * Separated from write logic for cleaner architecture.
 * Uses anon key + RLS for secure, filtered subscriptions.
 */
import type { SupabaseClient } from '@supabase/supabase-js';
export interface SubscriptionConfig {
    pageId: string;
    communityId?: string;
    onError?: (error: Error) => void;
}
export declare class RealtimeSubscriptionService {
    private supabase;
    private channels;
    private isInitialized;
    private errorNotificationCallback?;
    constructor(supabaseClient: SupabaseClient);
    /**
     * Initialize the service
     */
    initialize(): Promise<boolean>;
    /**
     * Subscribe to messages for a page
     */
    subscribeToPage(config: SubscriptionConfig): Promise<boolean>;
    /**
     * Unsubscribe from a page
     */
    unsubscribeFromPage(pageId: string): void;
    /**
     * Unsubscribe from all pages
     */
    unsubscribeAll(): void;
    /**
     * Handle message insert (new message)
     */
    private handleMessageInsert;
    /**
     * Handle message update
     */
    private handleMessageUpdate;
    /**
     * Handle message delete
     */
    private handleMessageDelete;
    /**
     * Show notification (if callback is set)
     */
    private showNotification;
    /**
     * Set error notification callback
     */
    setErrorNotificationCallback(callback: (message: string) => void): void;
    /**
     * Get subscription status
     */
    getSubscriptionStatus(pageId: string): 'subscribed' | 'unsubscribed' | 'error';
}
export declare function initializeRealtimeSubscriptionService(supabaseClient: SupabaseClient): RealtimeSubscriptionService;
export declare function getRealtimeSubscriptionService(): RealtimeSubscriptionService | null;
export declare const supabaseRealtimeApi: {
    RealtimeSubscriptionService: typeof RealtimeSubscriptionService;
    initializeRealtimeSubscriptionService: typeof initializeRealtimeSubscriptionService;
    getRealtimeSubscriptionService: typeof getRealtimeSubscriptionService;
};
export default supabaseRealtimeApi;
//# sourceMappingURL=RealtimeSubscriptionService.d.ts.map