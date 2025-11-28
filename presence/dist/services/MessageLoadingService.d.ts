/**
 * MESSAGE LOADING SERVICE - Tab-Aware Message Loading
 *
 * Centralized service that enforces visibility tab separation.
 * Makes it impossible to load messages on visibility tab.
 *
 * Integration Layer Fix: All code should use this service instead of
 * calling loadChatHistory() directly.
 */
type LoadChatHistoryFn = (pageIdOrRawUrl?: string | null, activeCommunities?: string[]) => Promise<void>;
interface MessageLoadingServiceOptions {
    loadChatHistory?: LoadChatHistoryFn;
    messageRenderer?: unknown;
    messageSystemIntegration?: unknown;
    container?: HTMLElement | null;
}
/**
 * MessageLoadingService
 *
 * Enforces that messages can ONLY be loaded on discuss-tab.
 * Visibility tab and other tabs will never trigger message loading.
 */
export declare class MessageLoadingService {
    private loadChatHistoryFn;
    constructor(options: MessageLoadingServiceOptions);
    /**
     * Set the container element
     */
    setContainer(_container: HTMLElement | null): void;
    /**
     * Load messages for a page
     * ONLY loads if on discuss-tab or null (initial load)
     * NEVER loads on visibility-tab or other tabs
     *
     * @param pageIdOrRawUrl - Page ID or raw URL
     * @param activeCommunities - Active communities (optional)
     * @returns Promise that resolves when loading completes or is skipped
     */
    loadMessages(pageIdOrRawUrl?: string | null, activeCommunities?: string[]): Promise<void>;
    /**
     * Alias for loadMessages (for compatibility)
     */
    loadChatHistory(pageIdOrRawUrl?: string | null, activeCommunities?: string[]): Promise<void>;
    /**
     * Add a message to the chat
     */
    addMessage(_message: unknown, _container?: HTMLElement | null): Promise<void>;
    /**
     * Check if messages can be loaded for current tab
     *
     * @returns true if messages can be loaded, false otherwise
     */
    canLoadMessages(): boolean;
    /**
     * Get the current active tab
     *
     * @returns Active tab ID or null
     */
    getActiveTab(): string | null;
}
/**
 * Initialize the service with dependencies
 */
export declare function initializeMessageLoadingService(options: MessageLoadingServiceOptions): MessageLoadingService;
/**
 * Get the service instance
 */
export declare function getMessageLoadingService(): MessageLoadingService;
export {};
//# sourceMappingURL=MessageLoadingService.d.ts.map