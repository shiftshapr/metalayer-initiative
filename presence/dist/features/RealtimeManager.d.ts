/**
 * REALTIME MANAGER - Real-time Communication
 * Handles all real-time functionality
 */
type PresenceEventType = 'INSERT' | 'UPDATE' | 'DELETE';
type AvailabilityStatus = 'AVAILABLE' | 'BUSY' | 'AWAY' | 'OFFLINE';
type MessageType = 'MESSAGE_NEW' | 'AURA_COLOR_CHANGED' | 'PRESENCE_UPDATE' | 'VISIBILITY_UPDATE' | 'PAGE_SUBSCRIPTION';
type PresenceEventKind = 'ENTER' | 'LEAVE' | 'AVAILABILITY';
/**
 * Base structure for Supabase realtime payload records
 * Supports both snake_case and camelCase field names
 */
interface SupabaseRealtimeRecord {
    id?: string;
    page_id?: string;
    pageId?: string;
    user_id?: string;
    userId?: string;
    user_email?: string;
    userEmail?: string;
    is_active?: boolean;
    isActive?: boolean;
    last_seen?: string;
    lastSeen?: string;
    aura_color?: string;
    auraColor?: string;
    message_id?: string;
    messageId?: string;
    [key: string]: unknown;
}
/**
 * Presence change payload from Supabase realtime
 */
interface PresenceChangePayload {
    eventType: PresenceEventType;
    new: SupabaseRealtimeRecord | null;
    old: SupabaseRealtimeRecord | null;
}
/**
 * Message change payload from Supabase realtime
 * Can contain message fields in various formats
 */
interface MessageChangePayload {
    eventType: PresenceEventType;
    new: (SupabaseRealtimeRecord & {
        content?: string;
        author_id?: string;
        authorId?: string;
        community_id?: string;
        communityId?: string;
        parent_id?: string | null;
        parentId?: string | null;
        created_at?: string;
        createdAt?: string;
    }) | null;
    old: (SupabaseRealtimeRecord & {
        content?: string;
        author_id?: string;
        authorId?: string;
    }) | null;
}
/**
 * Reaction change payload from Supabase realtime
 */
interface ReactionChangePayload {
    eventType: PresenceEventType;
    new: (SupabaseRealtimeRecord & {
        emoji?: string;
        type?: string;
        value?: string;
        reaction?: string;
        created_at?: string;
        createdAt?: string;
    }) | null;
    old: (SupabaseRealtimeRecord & {
        emoji?: string;
        type?: string;
        value?: string;
        reaction?: string;
    }) | null;
}
/**
 * Aura color change payload from Supabase realtime
 */
interface AuraChangePayload {
    eventType?: PresenceEventType | string;
    new?: (SupabaseRealtimeRecord & {
        aura_color?: string;
        auraColor?: string;
        user_email?: string;
        userEmail?: string;
    }) | null;
    old?: (SupabaseRealtimeRecord & {
        aura_color?: string;
        auraColor?: string;
        user_email?: string;
        userEmail?: string;
    }) | null;
}
interface SupabaseMessage {
    type: MessageType;
    content?: string;
    userId?: string;
    user_id?: string;
    pageId?: string;
    pageUrl?: string;
    url?: string;
    auraColor?: string;
    color?: string;
    isVisible?: boolean;
    is_visible?: boolean;
    timestamp?: number;
    kind?: PresenceEventKind;
    availability?: AvailabilityStatus;
    customLabel?: string;
}
interface PresenceEventResponse {
    success: boolean;
    status?: number;
    data?: Record<string, unknown>;
    error?: string;
    local?: boolean;
}
declare class RealtimeManager {
    private logLevel;
    private isInitialized;
    private userPresenceChannel;
    private availabilityChannel;
    /**
     * Initialize RealtimeManager module
     */
    initialize(): Promise<void>;
    /**
     * COMP METHOD: Initialize presence tracking
     */
    private initializePresenceTracking;
    /**
     * COMP METHOD: Initialize presence for a specific page
     */
    private initializePresence;
    /**
     * COMP METHOD: Track current user's presence
     */
    private trackUserPresence;
    /**
     * COMP METHOD: Update presence display
     */
    private updatePresenceDisplay;
    /**
     * COMP METHOD: Get active users
     */
    private getActiveUsers;
    /**
     * Logging utility
     */
    private log;
    /**
     * FIX: Initialize real-time subscription for user_presence table changes
     * This ensures visibility updates when users join/leave pages
     */
    private initializeUserPresenceSubscription;
    /**
     * 4-STATE STATUS: Initialize real-time subscription for availability changes
     */
    private initializeAvailabilitySubscription;
    /**
     * 4-STATE STATUS: Handle availability change event
     */
    private handleAvailabilityChange;
    /**
     * 4-STATE STATUS: Update all status dots for a user in the DOM
     */
    private updateUserStatusDots;
    /**
     * Cleanup subscriptions
     */
    cleanup(): void;
}
declare function initializeSupabaseRealtimeClient(): Promise<void>;
declare function sendSupabaseMessage(message: SupabaseMessage): Promise<boolean>;
declare function joinPageWithSupabase(pageId: string, pageUrl: string): Promise<void>;
declare function handlePresenceChange(payload: PresenceChangePayload): Promise<void>;
declare function handleMessageChange(payload: MessageChangePayload): void;
declare function handleReactionChange(payload: ReactionChangePayload): Promise<void>;
declare function handleAuraChange(payload: AuraChangePayload): void;
declare function setupSupabaseEventHandlers(): void;
declare function sendPresenceEvent(kind: PresenceEventKind, availability?: AvailabilityStatus | null, customLabel?: string | null): Promise<PresenceEventResponse>;
declare function initializePresenceTracking(): Promise<boolean>;
export { RealtimeManager, handlePresenceChange, handleMessageChange, handleReactionChange, handleAuraChange, sendPresenceEvent, initializePresenceTracking, initializeSupabaseRealtimeClient, sendSupabaseMessage, joinPageWithSupabase, setupSupabaseEventHandlers };
export type { AuraChangePayload };
//# sourceMappingURL=RealtimeManager.d.ts.map