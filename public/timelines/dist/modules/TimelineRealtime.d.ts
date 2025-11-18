/**
 * Timeline Real-time Manager
 * Manages Supabase real-time subscriptions for timeline updates
 */
import type { SupabaseClient, SupabaseChannel } from '../types';
import type { TimelineManager } from './TimelineManager';
export declare class TimelineRealtime {
    private client;
    private timelineManager;
    private subscriptions;
    constructor(supabaseClient: SupabaseClient | null, timelineManager: TimelineManager);
    /**
     * Subscribe to real-time updates for a user
     */
    subscribeToUser(userId: string): Promise<void>;
    /**
     * Unsubscribe from user updates
     */
    unsubscribeFromUser(userId: string): void;
    /**
     * Subscribe to messages
     */
    subscribeToMessages(userId: string): Promise<SupabaseChannel | null>;
    /**
     * Subscribe to reactions
     */
    subscribeToReactions(userId: string): Promise<SupabaseChannel | null>;
    /**
     * Subscribe to bookmarks
     */
    subscribeToBookmarks(userId: string): Promise<SupabaseChannel | null>;
    /**
     * Subscribe to profile updates
     */
    subscribeToProfileUpdates(userId: string): Promise<SupabaseChannel | null>;
    /**
     * Subscribe to community joins
     */
    subscribeToCommunityJoins(userId: string): Promise<SupabaseChannel | null>;
    /**
     * Handle message event
     */
    private handleMessageEvent;
    /**
     * Handle reaction event
     */
    private handleReactionEvent;
    /**
     * Handle bookmark event
     */
    private handleBookmarkEvent;
    /**
     * Handle profile update event
     */
    private handleProfileUpdateEvent;
    /**
     * Handle community join event
     */
    private handleCommunityJoinEvent;
    /**
     * Normalize message event to timeline activity
     */
    private normalizeMessageEvent;
    /**
     * Normalize reaction event
     */
    private normalizeReactionEvent;
    /**
     * Normalize bookmark event
     */
    private normalizeBookmarkEvent;
    /**
     * Normalize profile update event
     */
    private normalizeProfileUpdateEvent;
    /**
     * Normalize community join event
     */
    private normalizeCommunityJoinEvent;
    /**
     * Determine message visibility
     */
    private determineMessageVisibility;
    /**
     * Determine profile update visibility
     */
    private determineProfileUpdateVisibility;
    /**
     * Cleanup all subscriptions
     */
    cleanup(): void;
}
//# sourceMappingURL=TimelineRealtime.d.ts.map