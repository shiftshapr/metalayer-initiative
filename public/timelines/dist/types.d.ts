/**
 * Timeline Feature Type Definitions
 * Complete type definitions for the timeline feature
 */
export type ActivityType = 'message' | 'reaction' | 'bookmark' | 'profileUpdate' | 'communityJoin' | 'statusChange' | 'auraChange' | 'messageEdit' | 'messageDelete' | 'threadCreate' | 'login' | 'streak';
export type VisibilityType = 'public' | 'community' | 'group' | 'private';
export type PersistenceType = 'all' | '1y' | '30d' | '7d' | '1d';
export type ViewMode = 'single' | 'multi' | 'merged';
export interface User {
    id?: string;
    user_id?: string;
    uuid?: string;
    name?: string;
    handle?: string;
    email?: string;
    avatarUrl?: string;
    avatar_url?: string;
    auraColor?: string;
    aura_color?: string;
    auraIntensity?: number;
    aura_intensity?: number;
    is_active?: boolean;
    [key: string]: any;
}
export interface Activity {
    id: string;
    type: ActivityType;
    userId: string;
    timestamp: string | Date;
    visibility: VisibilityType;
    data: ActivityData;
    sourceUserId?: string;
}
export interface ActivityData {
    user?: User;
    content?: string;
    messageId?: string;
    message?: MessageData;
    emoji?: string;
    reactionCount?: number;
    reactions?: Reaction[];
    replyCount?: number;
    communityId?: string;
    community?: CommunityData;
    fieldName?: string;
    oldValue?: string;
    newValue?: string;
    availability?: string;
    customLabel?: string;
    pageId?: string;
    pageUrl?: string;
    isActive?: boolean;
    [key: string]: any;
}
export interface MessageData {
    id: string;
    body?: string;
    content?: string;
    createdAt?: string | Date;
    created_at?: string | Date;
    user_id?: string;
    communityId?: string;
    community_id?: string;
    author?: User;
    replyCount?: number;
    reactionCount?: number;
    reactions?: Reaction[];
    parentId?: string;
    quoteId?: string;
    pageId?: string;
}
export interface Reaction {
    id: string;
    emoji: string;
    user_id: string;
    message_id?: string;
    AppUser?: User;
}
export interface CommunityData {
    id: string;
    name: string;
    description?: string;
    [key: string]: any;
}
export interface TimelineData {
    activities: Activity[];
    pagination: PaginationData;
    userId?: string;
    metadata?: TimelineMetadata;
}
export interface PaginationData {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}
export interface TimelineMetadata {
    userId: string;
    userName?: string;
    userHandle?: string;
    createdAt?: string;
    updatedAt?: string;
}
export interface TimelineFilters {
    persistence: PersistenceType;
    community: string | null;
    activityTypes: ActivityType[];
    search: string | null;
}
export interface TimelineQueryOptions {
    persistence?: PersistenceType;
    community?: string | null;
    search?: string | null;
    activityTypes?: ActivityType[];
    page?: number;
    limit?: number;
}
export interface TimelineApiResponse {
    success: boolean;
    userId: string;
    timeline: TimelineData;
    pagination?: PaginationData;
    filters?: TimelineQueryOptions;
}
export interface MultipleTimelinesApiResponse {
    success: boolean;
    profiles: string[];
    timelines: Record<string, TimelineData>;
    filters?: TimelineQueryOptions;
}
export type TimelineEvent = 'timeline:loaded' | 'timeline:updated' | 'timeline:error' | 'filters:changed' | 'activity:added' | 'activity:removed' | 'activity:updated';
export interface TimelineEventData {
    userId?: string;
    timeline?: TimelineData;
    activity?: Activity;
    activityId?: string;
    error?: Error;
    filters?: TimelineFilters;
}
export interface TimelineViewOptions {
    mode?: ViewMode;
    profileId?: string;
    isReply?: boolean;
    isInFocusMode?: boolean;
    showCommunity?: boolean;
}
export interface RenderActivityOptions {
    showAvatar?: boolean;
    showTimestamp?: boolean;
    showVisibility?: boolean;
    [key: string]: any;
}
export interface SupabaseClient {
    channel: (name: string) => SupabaseChannel;
    from: (table: string) => any;
    auth: {
        onAuthStateChange: (callback: (event: string, session: any) => void) => void;
        getSession: () => Promise<any>;
    };
    [key: string]: any;
}
export interface SupabaseChannel {
    on: (event: string, config: any, callback: (payload: any) => void) => SupabaseChannel;
    subscribe: () => Promise<'SUBSCRIBED' | 'TIMED_OUT' | 'CLOSED'>;
    unsubscribe: () => Promise<'OK' | 'TIMED_OUT' | 'CLOSED'>;
}
export interface SupabaseRealtimePayload {
    eventType: 'INSERT' | 'UPDATE' | 'DELETE';
    new?: Record<string, any>;
    old?: Record<string, any>;
    [key: string]: any;
}
export interface CacheEntry<T> {
    data: T;
    timestamp: number;
    expiresAt: number;
}
export interface DateRange {
    start: Date;
    end: Date;
}
declare global {
    interface Window {
        timelineApp?: any;
        timelineDiagnostics?: any;
        timelineDiagnosticsResults?: any;
        currentUser?: User;
        AVATAR_FALLBACK_COLOR?: string;
        createUnifiedMessageElement?: (message: MessageData, options?: TimelineViewOptions) => HTMLElement;
        updateReactionDisplay?: (messageId: string, reactions: Reaction[], reactionBtn?: HTMLElement | null) => Promise<void>;
        addMessageActionListeners?: (messageDiv: HTMLElement, message: MessageData) => void;
        loadMessageReactions?: (messageId: string, reactionBtn?: HTMLElement | null) => Promise<void>;
    }
}
//# sourceMappingURL=types.d.ts.map