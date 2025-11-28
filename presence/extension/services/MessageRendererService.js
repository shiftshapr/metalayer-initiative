/**
 * MESSAGE RENDERER SERVICE
 *
 * Single source of truth for rendering messages.
 * Replaces multiple rendering paths with a unified service.
 *
 * Phase 1: Consolidate Rendering
 */
import { UnifiedMessageRenderer } from '../utils/UnifiedMessageRenderer.js';
import { UnifiedMessageDisplay } from '../components/UnifiedMessageDisplay.js';
import { Logger } from '../utils/Logger.js';
export class MessageRendererService {
    constructor(dependencies = {}) {
        // Core rendering dependencies
        this.unifiedMessageRenderer = dependencies.unifiedMessageRenderer || UnifiedMessageRenderer;
        this.unifiedMessageDisplay = dependencies.unifiedMessageDisplay || new UnifiedMessageDisplay();
        // Optional dependencies (for enhanced rendering)
        this.communitiesModule = dependencies.communitiesModule;
        this.getMessageActionsMenu = dependencies.getMessageActionsMenu;
        this.getCurrentUser = dependencies.getCurrentUser;
        this.getCurrentChatData = dependencies.getCurrentChatData;
        this.formatMessageTime = dependencies.formatMessageTime;
    }
    /**
     * Render a single message element
     */
    async renderMessage(message, options = {}) {
        const { isReply = false, isFocusMode = false, canEdit = null, canDelete = null, reactionCount = 0, replyCount = 0, bookmarkCount = 0, isBookmarked = false, hasUserReplied = false, hasUserReposted = false, hasUserShared = false } = options;
        // Calculate canEdit/canDelete if not provided
        let calculatedCanEdit = canEdit;
        let calculatedCanDelete = canDelete;
        if (calculatedCanEdit === null || calculatedCanDelete === null) {
            const currentUser = this.getCurrentUser ? this.getCurrentUser() : null;
            // CRITICAL FIX: Check multiple ways to identify owner
            // Diagnostic found buttons not rendering - ensure isOwner calculation is correct
            const isOwner = currentUser && (
            // UUID ONLY - no email matching
            currentUser.id === message.authorId ||
                currentUser.id === message.author?.id ||
                (message.author && currentUser.id === message.author.id));
            if (calculatedCanEdit === null) {
                const messageTime = new Date(message.createdAt || '');
                const diffHours = (Date.now() - messageTime.getTime()) / (1000 * 60 * 60);
                // Fix: Convert undefined to false to match boolean | null type
                calculatedCanEdit = (isOwner ?? false) && diffHours < 1; // Can edit within 1 hour
                // CRITICAL FIX: Log for debugging - diagnostic found buttons not rendering
                Logger.debug(`🔍 MessageRendererService: canEdit calculated for ${message.id}: ${calculatedCanEdit} (isOwner: ${isOwner}, currentUser.id: ${currentUser?.id}, message.authorId: ${message.authorId}, message.author?.id: ${message.author?.id}, diffHours: ${diffHours.toFixed(2)})`, null, 'general');
            }
            if (calculatedCanDelete === null) {
                // Fix: Convert undefined to false to match boolean | null type
                calculatedCanDelete = isOwner ?? false; // User can only delete their own messages
                // CRITICAL FIX: Log for debugging - diagnostic found buttons not rendering
                Logger.debug(`🔍 MessageRendererService: canDelete calculated for ${message.id}: ${calculatedCanDelete} (isOwner: ${isOwner}, currentUser.id: ${currentUser?.id}, message.authorId: ${message.authorId}, message.author?.id: ${message.author?.id})`, null, 'general');
            }
        }
        // Format time
        let formattedTime = '';
        if (this.formatMessageTime) {
            const createdAtStr = message.createdAt
                ? (typeof message.createdAt === 'string'
                    ? message.createdAt
                    : message.createdAt instanceof Date
                        ? message.createdAt.toISOString()
                        : String(message.createdAt))
                : null;
            formattedTime = this.formatMessageTime(createdAtStr) || '';
        }
        else {
            // Fallback to UnifiedMessageRenderer's formatMessageTime
            formattedTime = UnifiedMessageRenderer.formatMessageTime(message.createdAt, isFocusMode) || '';
        }
        // Get community name
        let communityName = '';
        if (message.communityId && this.communitiesModule?.getCommunityName) {
            const name = this.communitiesModule.getCommunityName(message.communityId);
            communityName = typeof name === 'string' ? name : (name instanceof Promise ? await name : '');
        }
        // Calculate reply count if not provided
        let calculatedReplyCount = replyCount;
        if (calculatedReplyCount === 0 && this.getCurrentChatData) {
            const currentChatData = this.getCurrentChatData();
            if (Array.isArray(currentChatData)) {
                calculatedReplyCount = currentChatData.filter(m => m.parentId === message.id).length;
            }
        }
        // Set up getMessageActionsMenu if available
        if (this.getMessageActionsMenu && typeof window !== 'undefined') {
            const win = window;
            if (!win.getMessageActionsMenu) {
                win.getMessageActionsMenu = async (msg, edit, del) => {
                    return await this.getMessageActionsMenu(msg, edit, del);
                };
            }
        }
        // Use UnifiedMessageRenderer to render the message
        const messageElement = await this.unifiedMessageRenderer.renderMessage(message, {
            isReply,
            isFocusMode,
            author: message.author || undefined,
            communityName,
            formattedTime,
            reactionCount: reactionCount || (Array.isArray(message.reactions) ? (message.reactions?.length || 0) : 0),
            replyCount: calculatedReplyCount,
            bookmarkCount: bookmarkCount || (typeof message.bookmarkCount === 'number' ? message.bookmarkCount : 0),
            isBookmarked: isBookmarked || (typeof message.isBookmarked === 'boolean' ? message.isBookmarked : false),
            hasUserReplied,
            hasUserReposted,
            hasUserShared,
            canEdit: calculatedCanEdit ?? false,
            canDelete: calculatedCanDelete ?? false
        });
        // Ensure data attributes are set
        if (!messageElement.dataset.messageId) {
            messageElement.dataset.messageId = message.id;
        }
        if (message.conversationId) {
            messageElement.dataset.conversationId = message.conversationId;
        }
        if (message.authorId || message.author?.id) {
            messageElement.dataset.authorId = message.authorId || (message.author?.id ?? '');
        }
        if (message.parentId) {
            messageElement.dataset.parentId = message.parentId;
            messageElement.classList.add('has-parent');
        }
        // Ensure content wrapper has proper dimensions
        const contentWrapper = messageElement.querySelector('.message-content-wrapper');
        if (contentWrapper) {
            contentWrapper.style.setProperty('min-height', '1px', 'important');
            contentWrapper.style.setProperty('display', 'flex', 'important');
            contentWrapper.style.setProperty('flex-direction', 'column', 'important');
        }
        // Add message-loaded class
        messageElement.classList.add('message-loaded');
        return messageElement;
    }
    /**
     * Render multiple messages (batch)
     */
    async renderMessages(messages, container, options = {}) {
        // Use UnifiedMessageDisplay for batch rendering
        // It handles duplicate detection, theme preservation, and focus modes
        await this.unifiedMessageDisplay.render(messages, container, options);
    }
    /**
     * Update existing message in DOM
     */
    async updateMessage(messageId, updates) {
        // Find message element
        const messageElement = document.querySelector(`[data-message-id="${messageId}"]`);
        if (!messageElement) {
            Logger.warn(`⚠️ MessageRendererService: Message ${messageId} not found in DOM`, null, 'general');
            return;
        }
        // If updates include full message object, re-render
        if (updates.message) {
            const newElement = await this.renderMessage(updates.message, {
                isReply: !!updates.message.parentId,
                isFocusMode: messageElement.closest('.focus-messages-container') !== null,
                container: messageElement.parentElement
            });
            // Replace old element with new one
            messageElement.replaceWith(newElement);
            return;
        }
        // Partial updates (reactions, bookmarks, etc.)
        if (updates.reactionCount !== undefined) {
            const reactionButton = messageElement.querySelector('.reaction-btn');
            if (reactionButton) {
                const countSpan = reactionButton.querySelector('.icon-count');
                if (updates.reactionCount > 0) {
                    if (!countSpan) {
                        reactionButton.insertAdjacentHTML('beforeend', `<span class="icon-count">${updates.reactionCount}</span>`);
                    }
                    else {
                        countSpan.textContent = String(updates.reactionCount);
                    }
                }
                else if (countSpan) {
                    countSpan.remove();
                }
            }
        }
        if (updates.isBookmarked !== undefined) {
            const bookmarkButton = messageElement.querySelector('.bookmark-btn');
            if (bookmarkButton) {
                bookmarkButton.classList.toggle('active', updates.isBookmarked);
                bookmarkButton.dataset.isBookmarked = String(updates.isBookmarked);
            }
        }
        if (updates.content !== undefined) {
            const contentElement = messageElement.querySelector('.message-content');
            if (contentElement) {
                contentElement.innerHTML = UnifiedMessageRenderer.convertUrlsToLinks(updates.content);
            }
        }
    }
    /**
     * Remove message from DOM
     */
    removeMessage(messageId) {
        const messageElement = document.querySelector(`[data-message-id="${messageId}"]`);
        if (messageElement) {
            // Remove event listeners by cloning (clean removal)
            const parent = messageElement.parentElement;
            if (parent) {
                messageElement.remove();
                Logger.debug(`✅ MessageRendererService: Removed message ${messageId} from DOM`, null, 'general');
            }
        }
        else {
            Logger.warn(`⚠️ MessageRendererService: Message ${messageId} not found in DOM`, null, 'general');
        }
    }
}
// Singleton instance (will be initialized with dependencies)
let messageRendererServiceInstance = null;
/**
 * Initialize the service with dependencies
 */
export function initializeMessageRendererService(dependencies) {
    messageRendererServiceInstance = new MessageRendererService(dependencies);
    return messageRendererServiceInstance;
}
/**
 * Get the service instance
 */
export function getMessageRendererService() {
    if (!messageRendererServiceInstance) {
        throw new Error('MessageRendererService not initialized. Call initializeMessageRendererService() first.');
    }
    return messageRendererServiceInstance;
}
