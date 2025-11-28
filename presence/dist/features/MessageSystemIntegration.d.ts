/**
 * MessageSystemIntegration - Wires together MessageStore, MessageLoader, and UI
 *
 * Integrates with existing CanopiModule and message display code
 */
import type { Message } from '../types/index.js';
import type { SupabaseClient } from '../types/index.js';
interface MessageLoader {
    loadDefault: (options: LoadDefaultOptions) => Promise<Message[]>;
    loadFocus: (options: LoadFocusOptions) => Promise<Message[] | {
        parent: Message | null;
        replies: Message[];
    }>;
    cleanupLazyLoading: () => void;
    destroy: () => void;
}
interface LoadDefaultOptions {
    pageId: string;
    parentId: string | null;
    limit?: number;
    includeTopReply?: boolean;
    communityId?: string;
    showSpinner?: boolean;
    onUpdate?: (messages: Message[]) => void;
    onError?: (error: Error) => void;
}
interface LoadFocusOptions {
    pageId: string;
    focusParentId: string;
    limit?: number;
    communityId?: string;
    showSpinner?: boolean;
    onUpdate?: (messages: Message[]) => void;
    onError?: (error: Error) => void;
}
interface RealtimeService {
    initialize: () => Promise<boolean | void>;
    subscribeToPage: (options: {
        pageId: string;
        communityId: string;
        onError?: (error: Error) => void;
    }) => Promise<boolean | void>;
    unsubscribeFromPage: (pageId: string) => void;
    unsubscribeAll: () => void;
    setErrorNotificationCallback: (callback: (message: string) => void) => void;
}
interface MessageSystemIntegrationConfig {
    supabaseClient: SupabaseClient;
    showNotification?: (message: string) => void;
    onMessageUpdate?: (messages: Message[]) => void;
    onError?: (error: Error) => void;
    messageLoader?: MessageLoader;
    initializeRealtimeSubscriptionService?: (client: SupabaseClient) => RealtimeService;
}
export declare class MessageSystemIntegration {
    private currentPageId;
    private currentParentId;
    private realtimeService;
    private onMessageUpdateCallback?;
    private onErrorCallback?;
    private messageLoader;
    private initialized;
    private messageStoreListenersAttached;
    private readonly cleanupStoreListeners;
    constructor();
    private readonly handleMessageStoreUpdate;
    private readonly handleMessageStoreError;
    private attachMessageStoreListeners;
    initialize(config: MessageSystemIntegrationConfig): Promise<boolean>;
    isReady(): boolean;
    loadDefaultView(pageId: string, options?: {
        limit?: number;
        communityId?: string;
    }): Promise<Message[]>;
    loadFocusMode(pageId: string, focusParentId: string, options?: {
        limit?: number;
        communityId?: string;
    }): Promise<Message[] | {
        replies: Message[];
        parent: Message | null;
    }>;
    handlePageChange(newPageId: string, communityId?: string): Promise<void>;
    destroy(): void;
}
export declare function getMessageSystemIntegration(): MessageSystemIntegration | null;
export declare function initializeMessageSystemIntegration(config: MessageSystemIntegrationConfig): Promise<MessageSystemIntegration>;
export declare function destroyMessageSystemIntegration(): void;
declare const messageSystemIntegrationApi: {
    getMessageSystemIntegration: typeof getMessageSystemIntegration;
    initializeMessageSystemIntegration: typeof initializeMessageSystemIntegration;
    destroyMessageSystemIntegration: typeof destroyMessageSystemIntegration;
};
export { messageSystemIntegrationApi };
export default messageSystemIntegrationApi;
export type MessageSystemIntegrationType = MessageSystemIntegration;
//# sourceMappingURL=MessageSystemIntegration.d.ts.map