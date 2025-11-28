/**
 * MessageStore - Centralized message cache and state management
 *
 * Features:
 * - Per pageId + parentId cache keys
 * - Keyset pagination support
 * - Event emitter for UI updates
 * - Real-time event merging
 */
import type { Message } from '../types/index.js';
export interface StoreMessage extends Partial<Message> {
    page_id?: string;
    parent_id?: string;
    [key: string]: unknown;
}
interface CacheEntry {
    items: StoreMessage[];
    nextCursor: string | null;
    status: 'idle' | 'loading' | 'ready' | 'exhausted' | 'error';
    lastFetched: number;
    parent: StoreMessage | null;
}
interface LoadOptions {
    limit?: number;
    cursor?: string | null;
    includeTopReply?: boolean;
    communityId?: string;
}
export declare function resolveMessagesEndpoint(path?: string): string;
declare class MessageStore {
    private cache;
    private listeners;
    private apiBaseUrl;
    constructor(apiBaseUrl?: string);
    getCacheKey(pageId: string, parentId: string | null): string;
    on(event: string, listener: (data: unknown) => void): () => void;
    private emit;
    setupEventListeners(): void;
    get(pageId: string, parentId: string | null): CacheEntry | null;
    getStatus(pageId: string, parentId: string | null): string;
    load(pageId: string, parentId?: string | null, options?: LoadOptions): Promise<{
        items: StoreMessage[];
        nextCursor: string | null;
        hasMore: boolean;
        parent?: StoreMessage | null;
    }>;
    loadNextPage(pageId: string, parentId?: string | null): Promise<{
        items: StoreMessage[];
        nextCursor: string | null;
        hasMore: boolean;
    } | null>;
    handleRealtimeMessage(message: Partial<Message> & {
        page_id?: string;
        parent_id?: string;
    }): void;
    handleRealtimeUpdate(message: Partial<Message> & {
        updated_at?: string;
    }): void;
    handleRealtimeDelete(messageId: string): void;
    private normalizeMessage;
}
export declare const messageStore: MessageStore;
export { MessageStore };
//# sourceMappingURL=MessageStore.d.ts.map