/**
 * CANOPI MODULE - Messages and Chat
 * TypeScript + ES6 Module
 * Handles all message and chat functionality
 */
import { User, Message, Reaction } from '../types/index.js';
type MessagePayload = Partial<Message> & Record<string, any>;
type LogLevel = 'ERROR' | 'WARN' | 'INFO' | 'DEBUG' | 'SILENT';
declare class CanopiModule {
    private logLevel;
    private isInitialized;
    private logger;
    constructor();
    /**
     * Initialize Canopi module
     */
    initialize(): Promise<void>;
    /**
     * Logging utility
     */
    private log;
    /**
     * Log computed styles for debugging
     */
    logComputedStyles(element: HTMLElement | null, label: string): void;
    /**
     * Set log level
     */
    setLogLevel(level: LogLevel): void;
    /**
     * Get initialization status
     */
    getIsInitialized(): boolean;
}
/**
 * Update message in chat
 * COMP METHOD: Matches original implementation with full DOM updates
 */
declare function updateMessageInChat(updatedMessage: Message): void;
/**
 * Remove message from chat
 * COMP METHOD: Matches original implementation with full DOM removal
 */
declare function removeMessageFromChat(deletedMessage: Message): void;
/**
 * Add or update a single message in the chat container
 */
declare function addMessageToChat(rawMessage: MessagePayload): Promise<void>;
/**
 * Get sender name from user ID
 */
declare function getSenderName(userId: string): string;
/**
 * Get sender initial from name
 * COMP METHOD: Matches original implementation
 */
declare function getSenderInitial(name: string | null | undefined): string;
/**
 * Convert URLs to links in text
 * Uses the same implementation as UnifiedMessageRenderer for consistency
 */
declare function convertUrlsToLinks(text: string): string;
/**
 * Format message time display
 * COMP METHOD: Matches original implementation
 */
declare function formatMessageTime(createdAt: string | null | undefined): string;
/**
 * Check if user can edit message
 * COMP METHOD: Matches original implementation
 */
declare function canUserEditMessage(message: Message): boolean;
/**
 * Create unified message element
 * Uses UnifiedMessageRenderer for consistent rendering
 */
declare function createUnifiedMessageElement(message: Message): Promise<HTMLElement>;
/**
 * Update reaction display for a message
 */
declare function updateReactionDisplay(messageId: string, reactions: Reaction[]): void;
/**
 * Load message reactions from API
 * COMP METHOD: Matches original implementation - accepts messageId and optional reactionBtn
 */
declare function loadMessageReactions(messageId: string, reactionBtn?: HTMLElement | null): Promise<void>;
/**
 * Add message action listeners (reply, reaction, bookmark, etc.)
 */
declare function addMessageActionListeners(messageDiv: HTMLElement, message: Message): void;
/**
 * Handle message focus
 * COMP METHOD: Matches original implementation - accepts message object or messageId string for backward compatibility
 */
declare function handleMessageFocus(messageOrId: Message | string): Promise<void>;
/**
 * Load chat history for a page
 * COMP METHOD: Matches original signature - accepts communityId (optional) for backward compatibility
 * Also supports new signature with rawUrl and activeCommunities
 * CRITICAL: This function must be exported to window for tab change handlers
 */
declare function loadChatHistory(communityIdOrRawUrl?: string | null, activeCommunitiesOrUndefined?: string[]): Promise<void>;
/**
 * Check and add thread toggle button
 * COMP METHOD: Matches original implementation
 */
declare function checkAndAddThreadToggle(messageElement: HTMLElement, conversationId: string): Promise<void>;
/**
 * Toggle thread replies visibility
 * COMP METHOD: Matches original implementation
 */
declare function toggleThreadReplies(threadId: string, messageElement: HTMLElement): Promise<void>;
/**
 * Send message via Supabase
 * COMP METHOD: Matches original implementation
 */
declare function sendMessageViaSupabase(content: string, parentId?: string | null, conversationId?: string | null): Promise<Message | null>;
/**
 * Get sender avatar HTML
 * COMP METHOD: Matches original implementation
 */
declare function getSenderAvatar(author: User | null | undefined): Promise<string>;
/**
 * Handle share message
 * COMP METHOD: Matches original implementation
 */
declare function handleShareMessage(message: Message, shareType?: string): Promise<void>;
/**
 * Handle start thread
 * COMP METHOD: Matches original implementation
 */
declare function handleStartThread(message: Message): void;
/**
 * Handle copy link
 * COMP METHOD: Matches original implementation
 */
declare function handleCopyLink(message: Message): Promise<void>;
/**
 * Focus on message
 * COMP METHOD: Matches original implementation
 */
declare function focusOnMessage(message: Message): Promise<void>;
/**
 * Parse message URL
 * COMP METHOD: Matches original implementation
 */
declare function parseMessageUrl(url: string): {
    messageId: string | null;
    conversationId: string | null;
    isValid?: boolean;
};
/**
 * Handle incoming message URL
 * COMP METHOD: Matches original implementation
 */
declare function handleIncomingMessageUrl(): Promise<void>;
/**
 * Handle back navigation
 * COMP METHOD: Matches original implementation
 */
declare function handleBackNavigation(): Promise<void>;
/**
 * Handle reaction
 * COMP METHOD: Matches original implementation
 */
declare function handleReaction(message: Message): Promise<void>;
/**
 * Setup message input event listeners
 * COMP METHOD: Matches original implementation
 */
declare function setupMessageInputEventListeners(): void;
/**
 * Send chat message
 * COMP METHOD: Matches original implementation
 */
declare function sendChatMessage(): Promise<void>;
export { CanopiModule, addMessageToChat, createUnifiedMessageElement, updateReactionDisplay, addMessageActionListeners, loadMessageReactions, handleMessageFocus, loadChatHistory, // CRITICAL: Export for module imports
updateMessageInChat, removeMessageFromChat, getSenderName, convertUrlsToLinks, formatMessageTime, getSenderInitial, canUserEditMessage, checkAndAddThreadToggle, toggleThreadReplies, sendMessageViaSupabase, getSenderAvatar, handleShareMessage, handleStartThread, handleCopyLink, focusOnMessage, parseMessageUrl, handleIncomingMessageUrl, handleBackNavigation, handleReaction, setupMessageInputEventListeners, sendChatMessage };
declare const _default: {
    CanopiModule: typeof CanopiModule;
    addMessageToChat: typeof addMessageToChat;
    createUnifiedMessageElement: typeof createUnifiedMessageElement;
    updateReactionDisplay: typeof updateReactionDisplay;
    addMessageActionListeners: typeof addMessageActionListeners;
    loadMessageReactions: typeof loadMessageReactions;
    handleMessageFocus: typeof handleMessageFocus;
    loadChatHistory: typeof loadChatHistory;
};
export default _default;
//# sourceMappingURL=CanopiModule.d.ts.map