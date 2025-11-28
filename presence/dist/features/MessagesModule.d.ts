/**
 * MESSAGES MODULE - Message and Chat Functionality
 *
 * Complete implementation of all message and chat functionality.
 * This is the single source of truth for message handling.
 *
 * TypeScript + ES6 Module
 */
import type { Message, RawMessagePayload, User } from '../types/index.js';
/**
 * Update message in chat
 * COMP METHOD: Matches original implementation with full DOM updates
 */
declare function updateMessageInChat(updatedMessage: Message | Partial<Message>): void;
/**
 * Remove message from chat
 * COMP METHOD: Matches original implementation with full DOM removal
 */
declare function removeMessageFromChat(deletedMessage: Message | {
    id: string;
}): void;
/**
 * Add or update a single message in the chat container
 */
declare function addMessageToChat(rawMessage: RawMessagePayload | Message): Promise<void>;
/**
 * Get sender name from user ID
 */
declare function getSenderName(userId: string | undefined): string;
/**
 * Get sender initial from name
 * COMP METHOD: Matches original implementation
 */
declare function getSenderInitial(name: string | undefined): string;
declare function convertUrlsToLinks(text: string | undefined): string;
/**
 * Format message time display
 * COMP METHOD: Matches original implementation
 */
declare function formatMessageTime(createdAt: Date | string | null | undefined): string;
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
declare function updateReactionDisplay(messageId: string, reactions: Array<Record<string, unknown>> | unknown): void;
/**
 * Load message reactions from API
 * COMP METHOD: Matches original implementation - accepts messageId and optional reactionBtn
 */
declare function loadMessageReactions(messageId: string, reactionBtn: HTMLElement | null): Promise<void>;
/**
 * Add message action listeners (reply, reaction, bookmark, etc.)
 */
declare function addMessageActionListeners(messageDiv: HTMLElement, message: Message): void;
/**
 * Handle message focus
 * Accepts message object or messageId string
 */
declare function handleMessageFocus(messageOrId: Message | string): Promise<void>;
/**
 * Load chat history - accepts pageId (preferred) or rawUrl (will normalize)
 * Pattern: Prefer pageId (normalized), but can accept rawUrl and normalize internally
 * CRITICAL: This function must be exported to window for tab change handlers
 *
 * @param {string} pageIdOrRawUrl - Normalized page ID (e.g., "google_com_") OR raw URL (e.g., "https://google.com")
 *                                   If pageId, uses directly. If rawUrl, normalizes to get pageId.
 *                                   If not provided, uses currentUrlData.pageId
 * @param {string[]} activeCommunities - Active community IDs. If not provided, uses current active communities
 */
declare function loadChatHistory(pageIdOrRawUrl?: string | null, activeCommunities?: string[]): Promise<void>;
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
 * Get message action menu HTML
 * COMP METHOD: Matches original implementation
 */
declare function getMessageActionMenu(message: Message, canEdit?: boolean, canDelete?: boolean): Promise<string>;
/**
 * Handle reply to message
 * Uses UnifiedMessageModal exclusively
 */
declare function handleReplyToMessage(message: Message): Promise<void>;
/**
 * Handle quote message
 * Opens UnifiedMessageModal in quote mode
 */
declare function handleQuoteMessage(message: Message): Promise<void>;
/**
 * Handle delete message
 * COMP METHOD: Matches original implementation
 */
declare function handleDeleteMessage(message: Message): Promise<void>;
/**
 * Handle edit message
 * COMP METHOD: Matches original implementation
 */
declare function handleEditMessage(message: Message): Promise<void>;
type SendMessageViaSupabaseInput = string | {
    content: string;
    parentId?: string | null;
    conversationId?: string | null;
};
/**
 * Send message via Supabase
 * COMP METHOD: Matches original implementation
 */
declare function sendMessageViaSupabase(input: SendMessageViaSupabaseInput, parentId?: string | null, conversationId?: string | null): Promise<Message | null>;
/**
 * Get sender avatar HTML
 * COMP METHOD: Matches original implementation
 */
declare function getSenderAvatar(author: User | Record<string, unknown> | null | undefined): Promise<string>;
/**
 * Handle repost message
 * Creates a repost of the message
 */
declare function handleRepostMessage(message: Message): Promise<void>;
/**
 * Handle bookmark message
 * Toggles bookmark status
 */
declare function handleBookmarkMessage(message: Message): Promise<void>;
/**
 * Handle share message
 * COMP METHOD: Matches original implementation
 */
declare function handleShareMessage(message: Message, shareType?: string): Promise<void>;
/**
 * Handle start thread
 * Uses UnifiedMessageModal for replies
 */
declare function handleStartThread(message: Message): Promise<void>;
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
    pageId?: string;
    messageId?: string;
    parentId?: string;
    isValid: boolean;
} | null;
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
 * COMP METHOD: Matches original implementation - uses reactionsIntegration if available, API fallback for Google ID conversion
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
declare const messagesModuleApi: {
    addMessageToChat: typeof addMessageToChat;
    createUnifiedMessageElement: typeof createUnifiedMessageElement;
    updateReactionDisplay: typeof updateReactionDisplay;
    addMessageActionListeners: typeof addMessageActionListeners;
    loadMessageReactions: typeof loadMessageReactions;
    handleMessageFocus: typeof handleMessageFocus;
    loadChatHistory: typeof loadChatHistory;
    updateMessageInChat: typeof updateMessageInChat;
    removeMessageFromChat: typeof removeMessageFromChat;
    getSenderName: typeof getSenderName;
    convertUrlsToLinks: typeof convertUrlsToLinks;
    formatMessageTime: typeof formatMessageTime;
    getSenderInitial: typeof getSenderInitial;
    canUserEditMessage: typeof canUserEditMessage;
    checkAndAddThreadToggle: typeof checkAndAddThreadToggle;
    toggleThreadReplies: typeof toggleThreadReplies;
    sendMessageViaSupabase: typeof sendMessageViaSupabase;
    getSenderAvatar: typeof getSenderAvatar;
    handleShareMessage: typeof handleShareMessage;
    handleStartThread: typeof handleStartThread;
    handleCopyLink: typeof handleCopyLink;
    focusOnMessage: typeof focusOnMessage;
    parseMessageUrl: typeof parseMessageUrl;
    handleIncomingMessageUrl: typeof handleIncomingMessageUrl;
    handleBackNavigation: typeof handleBackNavigation;
    handleReaction: typeof handleReaction;
    setupMessageInputEventListeners: typeof setupMessageInputEventListeners;
    sendChatMessage: typeof sendChatMessage;
    handleReplyToMessage: typeof handleReplyToMessage;
    handleQuoteMessage: typeof handleQuoteMessage;
    handleRepostMessage: typeof handleRepostMessage;
    handleBookmarkMessage: typeof handleBookmarkMessage;
    handleDeleteMessage: typeof handleDeleteMessage;
    handleEditMessage: typeof handleEditMessage;
    getMessageActionMenu: typeof getMessageActionMenu;
};
export { addMessageToChat, createUnifiedMessageElement, updateReactionDisplay, addMessageActionListeners, loadMessageReactions, handleMessageFocus, loadChatHistory, updateMessageInChat, removeMessageFromChat, getSenderName, convertUrlsToLinks, formatMessageTime, getSenderInitial, canUserEditMessage, checkAndAddThreadToggle, toggleThreadReplies, sendMessageViaSupabase, getSenderAvatar, handleShareMessage, handleStartThread, handleCopyLink, focusOnMessage, parseMessageUrl, handleIncomingMessageUrl, handleBackNavigation, handleReaction, setupMessageInputEventListeners, sendChatMessage, handleReplyToMessage, handleQuoteMessage, handleRepostMessage, handleBookmarkMessage, handleDeleteMessage, handleEditMessage, getMessageActionMenu };
export default messagesModuleApi;
export declare function initializeMessagesModule(): void;
//# sourceMappingURL=MessagesModule.d.ts.map