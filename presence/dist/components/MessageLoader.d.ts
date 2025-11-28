import type { Message } from '../types/index.js';
interface BaseOptions {
    pageId: string;
    communityId?: string;
    showSpinner?: boolean;
    onUpdate?: (messages: Message[]) => void;
    onError?: (error: Error) => void;
}
export interface LoadDefaultOptions extends BaseOptions {
    limit?: number;
    includeTopReply?: boolean;
}
export interface LoadFocusOptions extends BaseOptions {
    focusParentId: string;
    limit?: number;
}
export declare class MessageLoader {
    private sentinelObserver;
    private sentinelElement;
    private isLoading;
    /**
     * Load messages for the default (top-level) view.
     */
    loadDefault(options: LoadDefaultOptions): Promise<Message[]>;
    /**
     * Load messages for focus mode (replies to a parent).
     */
    loadFocus(options: LoadFocusOptions): Promise<{
        parent: Message | null;
        replies: Message[];
    }>;
    /**
     * Configure IntersectionObserver to lazy load additional pages.
     */
    private setupLazyLoading;
    /**
     * Clean up lazy loading observers.
     */
    cleanupLazyLoading(): void;
    /**
     * Destroy loader resources.
     */
    destroy(): void;
}
export declare const messageLoader: MessageLoader;
export {};
//# sourceMappingURL=MessageLoader.d.ts.map