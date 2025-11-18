/**
 * Shared Type Definitions
 * Common types used across the application
 */
export interface User {
    id: string;
    name?: string;
    email?: string;
    avatarUrl?: string;
    handle?: string;
    communityId?: string;
    lastSeen?: string | Date;
    status?: 'online' | 'offline' | 'inactive' | 'AVAILABLE' | 'BUSY' | 'AWAY';
    auraColor?: string;
    auraIntensity?: number;
    isActive?: boolean;
    userMetadata?: any;
    isVisible?: boolean;
    visibilityEnabled?: boolean;
    displayName?: string;
    availability?: string;
}
export interface Message {
    id: string;
    content: string;
    parentId?: string | null;
    author?: User;
    authorId: string;
    communityId: string;
    conversationId?: string;
    pageId?: string;
    rawUrl?: string | null;
    normalizedUrl?: string | null;
    createdAt: string | Date;
    updatedAt?: string | Date;
    reactions?: Reaction[];
    optionalContent?: string | null;
    uri?: string | null;
    threadId?: string | null;
    deletedAt?: string | Date | null;
    bookmarks?: Bookmark[];
    bookmarkCount?: number;
    isBookmarked?: boolean;
    shares?: Share[];
    shareCount?: number;
    isShared?: boolean;
}
export interface Reaction {
    id: string;
    emoji: string;
    messageId: string;
    AppUser?: User;
}
export interface Bookmark {
    id: string;
    userId: string;
    messageId: string;
    categoryId?: string;
    comments?: string;
    isPrivate?: boolean;
    tags?: string[];
    priority?: number;
    sortOrder?: number;
    archived?: boolean;
    createdAt?: string | Date;
    updatedAt?: string | Date;
    deletedAt?: string | Date | null;
    AppUser?: User;
    message?: Message;
}
export type ShareType = 'link' | 'twitter' | 'navigate' | 'focus' | 'notify' | 'reference';
export interface Share {
    id?: string;
    messageId: string;
    userId?: string;
    shareType: ShareType;
    shareUrl?: string;
    createdAt?: string | Date;
    pageUrl?: string;
    conversationId?: string;
    messageUrl?: string;
    message?: Message;
    user?: User;
}
export interface VisibilityData {
    id: string;
    userId: string;
    pageId: string;
    isVisible: boolean;
    enterTime?: string;
    lastSeen?: string;
}
export interface UrlData {
    pageId: string;
    rawUrl: string;
    normalizedUrl: string;
}
export interface ChatData {
    messages: Message[];
    communityId: string;
    pageId: string;
}
export interface StateData {
    [key: string]: any;
}
export interface StateManager {
    initialize(initialState: StateData): Promise<void>;
    get(key: string): Promise<any>;
    set(key: string, value: any): Promise<void>;
    getAll(): Promise<StateData>;
}
export type EventCallback = (data?: any) => void | Promise<void>;
export type EventType = string;
export interface EventBus {
    on(event: EventType, callback: EventCallback): string;
    off(event: EventType, listenerId: string): void;
    emit(event: EventType, data?: any): void;
}
export interface SupabaseClient {
    channel: (name: string) => SupabaseChannel;
    from: (table: string) => SupabaseQueryBuilder;
    auth: {
        getUser: () => Promise<any>;
        signInWithOAuth: (options: any) => Promise<any>;
        signOut: () => Promise<any>;
        onAuthStateChange: (callback: (event: string, session: any) => void) => {
            data: {
                subscription: any;
            };
            unsubscribe: () => void;
        };
    };
    [key: string]: any;
}
export interface SupabaseChannel {
    on: (event: string, callback: (payload: any) => void) => SupabaseChannel;
    subscribe: (callback: (status: string) => void) => SupabaseChannel;
    unsubscribe: () => void;
}
export interface SupabaseQueryBuilder {
    select: (columns?: string) => SupabaseQueryBuilder;
    insert: (data: any) => Promise<any>;
    update: (data: any) => SupabaseQueryBuilder;
    delete: () => SupabaseQueryBuilder;
    eq: (column: string, value: any) => SupabaseQueryBuilder;
    [key: string]: any;
}
export interface APIRequestOptions {
    method?: string;
    headers?: Record<string, string>;
    body?: any;
    allow404?: boolean;
}
export interface APIResponse<T = any> {
    data?: T;
    error?: string;
    status?: number;
}
export type LogLevel = 'ERROR' | 'WARN' | 'INFO' | 'DEBUG' | 'SUCCESS';
export interface Logger {
    error(message: string, ...args: any[]): void;
    warn(message: string, ...args: any[]): void;
    info(message: string, ...args: any[]): void;
    debug(message: string, ...args: any[]): void;
    setLevel(level: LogLevel): void;
}
export * from './provenance';
export * from './anchors';
//# sourceMappingURL=index.d.ts.map