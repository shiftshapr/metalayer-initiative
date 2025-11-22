/**
 * UnifiedMessageDisplay - Renders messages with support for focus modes
 *
 * Handles:
 * - Default display (standard message list)
 * - Parent in focus (emphasizes parent, collapses children)
 * - Child in focus (highlights child, shows parent as header)
 */
import { stateManagerInstance } from '../core/StateManager.js';
import { UnifiedMessageRenderer } from '../utils/UnifiedMessageRenderer.js';
const PUBLIC_SQUARE_COMMUNITY_ID = 'abe5ec85-4ba6-456f-adaf-03d7d51cecf4';
export class UnifiedMessageDisplay {
    constructor() {
        this.container = null;
    }
    /**
     * Get current container (for renderMessageElement)
     */
    getCurrentContainer() {
        return this.container;
    }
    /**
     * Render messages in the container
     * ROOT CAUSE FIX: Ensure container is cleared and messages are properly appended
     */
    async render(messages, container, options = {}) {
        this.container = container;
        const { focusContext = 'default', parentMessage = null, highlightMessageId = null, onMessageClick, onReplyClick, onFocusClick } = options;
        // ROOT CAUSE FIX: ALWAYS clear container completely before rendering to prevent duplicates
        // The previous logic was keeping messages when focus context was the same, causing duplicates
        // Now we always clear to ensure a clean state
        // CRITICAL FIX: Only count actual message elements, not buttons
        const actualMessages = Array.from(container.querySelectorAll('.message, [data-message-id]')).filter(el => {
            return el.classList.contains('message') ||
                el.querySelector('.message-content-wrapper') !== null ||
                (el.querySelector('.message-footer-actions') !== null && el.querySelector('.message-content') !== null);
        });
        const existingMessageCount = actualMessages.length;
        const existingFocusContext = container.className.match(/focus-mode-(\w+)/)?.[1];
        // CRITICAL FIX: Only clear message elements, not other content (like tabs)
        // Remove only .message elements and elements with data-message-id that are actual messages
        const messageElementsToRemove = Array.from(container.querySelectorAll('.message, [data-message-id]')).filter(el => {
            return el.classList.contains('message') ||
                el.querySelector('.message-content-wrapper') !== null ||
                (el.querySelector('.message-footer-actions') !== null && el.querySelector('.message-content') !== null);
        });
        messageElementsToRemove.forEach(el => el.remove());
        console.log(`🔍 UnifiedMessageDisplay: Removed ${messageElementsToRemove.length} message elements (${existingMessageCount} existing messages, context: ${existingFocusContext} -> ${focusContext})`);
        console.log(`🔍 UnifiedMessageDisplay: Rendering ${messages.length} messages to container:`, container.id || container.className);
        // Apply focus mode class
        container.classList.remove('focus-mode-parent', 'focus-mode-child', 'focus-mode-default');
        container.classList.add(`focus-mode-${focusContext}`);
        // Render based on focus context
        switch (focusContext) {
            case 'parent':
                await this.renderParentFocus(messages, container, {
                    parentMessage,
                    highlightMessageId,
                    onMessageClick,
                    onReplyClick,
                    onFocusClick
                });
                break;
            case 'child':
                await this.renderChildFocus(messages, container, {
                    parentMessage,
                    highlightMessageId,
                    onMessageClick,
                    onReplyClick,
                    onFocusClick
                });
                break;
            default:
                await this.renderDefault(messages, container, {
                    highlightMessageId,
                    onMessageClick,
                    onReplyClick,
                    onFocusClick
                });
                break;
        }
    }
    /**
     * Render default view (standard message list)
     * ROOT CAUSE FIX: Check for duplicates before appending
     */
    async renderDefault(messages, container, options) {
        // CRITICAL FIX: Only check actual message elements, not buttons
        // Buttons have data-message-id but are not messages themselves
        const allChatContainers = document.querySelectorAll('.chat-messages');
        const allExistingIds = new Set();
        allChatContainers.forEach(cont => {
            // Only count elements with .message class or .message-content-wrapper (actual messages)
            const messageElements = Array.from(cont.querySelectorAll('.message, [data-message-id]')).filter(el => {
                return el.classList.contains('message') ||
                    el.querySelector('.message-content-wrapper') !== null ||
                    (el.querySelector('.message-footer-actions') !== null && el.querySelector('.message-content') !== null);
            });
            messageElements.forEach(el => {
                const id = el.getAttribute('data-message-id');
                if (id)
                    allExistingIds.add(id);
            });
        });
        // Filter out messages that already exist in ANY container
        const newMessages = messages.filter(msg => !allExistingIds.has(msg.id));
        if (newMessages.length !== messages.length) {
            console.warn(`⚠️ UnifiedMessageDisplay: Filtered out ${messages.length - newMessages.length} duplicate messages already in DOM`);
        }
        for (const message of newMessages) {
            const messageEl = await this.createMessageElement(message, {
                isHighlighted: message.id === options.highlightMessageId,
                onMessageClick: options.onMessageClick,
                onReplyClick: options.onReplyClick,
                onFocusClick: options.onFocusClick
            });
            // ROOT CAUSE FIX: Ensure data-message-id is set for reaction updates
            if (!messageEl.dataset.messageId) {
                messageEl.dataset.messageId = message.id;
            }
            // ROOT CAUSE FIX: Ensure message is actually appended to DOM
            try {
                container.appendChild(messageEl);
                allExistingIds.add(message.id); // Track added message
                console.log(`✅ UnifiedMessageDisplay: Appended message ${message.id} to DOM`);
            }
            catch (error) {
                console.error(`❌ UnifiedMessageDisplay: Failed to append message ${message.id}:`, error);
            }
        }
        // CRITICAL FIX: Verify actual message elements (not buttons)
        const actualMessages = Array.from(container.querySelectorAll('.message, [data-message-id]')).filter(el => {
            return el.classList.contains('message') ||
                el.querySelector('.message-content-wrapper') !== null ||
                (el.querySelector('.message-footer-actions') !== null && el.querySelector('.message-content') !== null);
        });
        const finalCount = actualMessages.length;
        console.log(`🔍 UnifiedMessageDisplay: Rendered ${newMessages.length} new messages, ${finalCount} actual message elements in container`);
        if (finalCount > newMessages.length) {
            console.warn(`⚠️ UnifiedMessageDisplay: Container has more messages than expected! Expected ${newMessages.length} new, found ${finalCount} total`);
        }
    }
    /**
     * Render parent-in-focus view
     */
    async renderParentFocus(messages, container, options) {
        // Render parent message prominently
        if (options.parentMessage) {
            const parentEl = await this.createMessageElement(options.parentMessage, {
                isParent: true,
                isHighlighted: options.parentMessage.id === options.highlightMessageId,
                onMessageClick: options.onMessageClick,
                onReplyClick: options.onReplyClick,
                onFocusClick: options.onFocusClick
            });
            parentEl.classList.add('parent-in-focus');
            container.appendChild(parentEl);
        }
        // Render children as collapsed/summary
        const childrenContainer = document.createElement('div');
        childrenContainer.className = 'children-collapsed';
        for (const message of messages) {
            const childEl = await this.createMessageElement(message, {
                isCollapsed: true,
                isHighlighted: message.id === options.highlightMessageId,
                onMessageClick: options.onMessageClick,
                onReplyClick: options.onReplyClick,
                onFocusClick: options.onFocusClick
            });
            childrenContainer.appendChild(childEl);
        }
        container.appendChild(childrenContainer);
    }
    /**
     * Render child-in-focus view
     */
    async renderChildFocus(messages, container, options) {
        // Render parent as compact header
        if (options.parentMessage) {
            const parentHeader = await this.createParentHeader(options.parentMessage, {
                onMessageClick: options.onMessageClick,
                onFocusClick: options.onFocusClick
            });
            container.appendChild(parentHeader);
        }
        // Render focused child prominently
        const focusedChild = messages.find(m => m.id === options.highlightMessageId);
        if (focusedChild) {
            const childEl = await this.createMessageElement(focusedChild, {
                isFocused: true,
                isHighlighted: true,
                onMessageClick: options.onMessageClick,
                onReplyClick: options.onReplyClick,
                onFocusClick: options.onFocusClick
            });
            childEl.classList.add('child-in-focus');
            container.appendChild(childEl);
        }
        // Render other children normally
        for (const message of messages) {
            if (message.id !== options.highlightMessageId) {
                const messageEl = await this.createMessageElement(message, {
                    isHighlighted: false,
                    onMessageClick: options.onMessageClick,
                    onReplyClick: options.onReplyClick,
                    onFocusClick: options.onFocusClick
                });
                container.appendChild(messageEl);
            }
        }
    }
    /**
     * Create message element using full rendering pipeline
     */
    async createMessageElement(message, options) {
        const container = this.getCurrentContainer();
        const messageEl = await this.renderWithUnifiedRenderer(message, container);
        this.applyFocusClasses(messageEl, options);
        this.ensureDataAttributes(messageEl, message);
        this.attachFocusHandler(messageEl, message, options);
        // CRITICAL FIX: Add message-loaded class so footer is visible
        messageEl.classList.add('message-loaded');
        const win = typeof window !== 'undefined'
            ? window
            : undefined;
        if (win?.addMessageActionListeners) {
            try {
                win.addMessageActionListeners(messageEl, message);
            }
            catch (error) {
                console.warn('⚠️ UnifiedMessageDisplay: Failed to attach action listeners', error);
            }
        }
        if (win?.loadMessageReactions && typeof win.loadMessageReactions === 'function') {
            const loadMessageReactions = win.loadMessageReactions;
            setTimeout(async () => {
                try {
                    await loadMessageReactions(message.id);
                }
                catch (error) {
                    console.warn('⚠️ UnifiedMessageDisplay: Failed to load reactions:', error);
                }
            }, 100);
        }
        // CRITICAL FIX: Attach avatar hover handlers for user hover modal
        const avatarContainer = messageEl.querySelector('.avatar-container');
        if (avatarContainer && message.author) {
            const userHoverModal = win.userHoverModal;
            if (userHoverModal && userHoverModal.show) {
                const showFn = userHoverModal.show;
                avatarContainer.addEventListener('mouseenter', (e) => {
                    e.stopPropagation();
                    try {
                        showFn(message.author, avatarContainer);
                    }
                    catch (error) {
                        console.warn('⚠️ UnifiedMessageDisplay: Failed to show user hover modal:', error);
                    }
                });
                avatarContainer.addEventListener('mouseleave', (e) => {
                    e.stopPropagation();
                    // Hover modal should handle hiding on mouseleave
                });
            }
        }
        return messageEl;
    }
    applyFocusClasses(messageEl, options) {
        if (options.isParent) {
            messageEl.classList.add('parent-in-focus');
        }
        if (options.isFocused) {
            messageEl.classList.add('child-in-focus');
        }
        if (options.isHighlighted) {
            messageEl.classList.add('highlighted');
        }
        if (options.isCollapsed) {
            messageEl.classList.add('collapsed');
        }
    }
    ensureDataAttributes(messageEl, message) {
        if (!messageEl.dataset.messageId) {
            messageEl.dataset.messageId = message.id;
        }
        if (message.parentId && !messageEl.dataset.parentId) {
            messageEl.dataset.parentId = message.parentId;
        }
    }
    attachFocusHandler(messageEl, message, options) {
        if (!options.onMessageClick && !options.onFocusClick) {
            return;
        }
        const clickHandler = (e) => {
            const target = e.target;
            if (target.closest('.action-dots-btn, .action-dropdown, .reaction-btn, .reply-btn, .bookmark-btn, .share-btn, a')) {
                return;
            }
            if (options.onFocusClick) {
                options.onFocusClick(message);
            }
            else if (options.onMessageClick) {
                options.onMessageClick(message);
            }
        };
        messageEl.addEventListener('click', clickHandler);
        messageEl.style.cursor = 'pointer';
    }
    async renderWithUnifiedRenderer(message, container) {
        const typed = message;
        // CRITICAL FIX: Ensure communityId is available - check message.communityId first, then fallback to state
        if (!typed.communityId) {
            // Try to get from message data directly
            const messageData = message;
            if (messageData.communityId) {
                typed.communityId = messageData.communityId;
            }
            else {
                // Fallback: Try to get from stateManager chat.data
                const chatData = stateManagerInstance.getState('chat.data');
                if (chatData) {
                    const messageInState = chatData.find(m => m.id === message.id);
                    if (messageInState?.communityId) {
                        typed.communityId = messageInState.communityId;
                    }
                }
            }
        }
        const reactionCount = typeof typed.reactionCount === 'number'
            ? typed.reactionCount
            : Array.isArray(typed.reactions)
                ? typed.reactions.length
                : 0;
        const replyCount = typeof typed.replyCount === 'number'
            ? typed.replyCount
            : typed.hasReplies
                ? 1
                : 0;
        const bookmarkCount = typeof typed.bookmarkCount === 'number' ? typed.bookmarkCount : 0;
        const communityName = typed.communityName || (await this.resolveCommunityName(typed.communityId));
        // Counts and community name are now properly resolved
        return UnifiedMessageRenderer.renderMessage(message, {
            isReply: !!message.parentId,
            isFocusMode: this.isFocusModeContainer(container),
            author: message.author,
            communityName,
            reactionCount,
            replyCount,
            bookmarkCount,
            isBookmarked: Boolean(typed.isBookmarked),
            hasUserReplied: Boolean(typed.hasUserReplied),
            hasUserReposted: Boolean(typed.hasUserReposted),
            hasUserShared: Boolean(typed.hasUserShared),
            canEdit: Boolean(typed.canEdit),
            canDelete: Boolean(typed.canDelete)
        });
    }
    isFocusModeContainer(container) {
        if (!container)
            return false;
        return container.classList.contains('focus-mode-child') || container.classList.contains('focus-mode-parent');
    }
    async resolveCommunityName(communityId) {
        if (!communityId) {
            return '';
        }
        if (typeof window !== 'undefined') {
            const win = window;
            const module = win.CommunitiesModule;
            if (module?.getCommunityName) {
                const result = module.getCommunityName(communityId);
                if (typeof result === 'string') {
                    return result;
                }
                if (result && typeof result.then === 'function') {
                    try {
                        return await result;
                    }
                    catch {
                        // Ignore and fall back to state
                    }
                }
            }
        }
        const communities = stateManagerInstance.getState('communities');
        if (communities && communities[communityId]?.name) {
            return communities[communityId].name;
        }
        if (communityId === PUBLIC_SQUARE_COMMUNITY_ID) {
            return 'Public Square';
        }
        return '';
    }
    /**
     * Create parent header (compact view for child-in-focus)
     */
    async createParentHeader(parent, options) {
        const header = document.createElement('div');
        header.className = 'parent-header-compact';
        const parentAuthor = parent.author || { name: 'Unknown' };
        header.innerHTML = `
      <div class="parent-header-content">
        <span class="parent-author">${this.escapeHtml(parentAuthor.name || 'Unknown')}</span>
        <span class="parent-content-preview">${this.escapeHtml((parent.content || '').substring(0, 100))}${(parent.content || '').length > 100 ? '...' : ''}</span>
      </div>
      ${options.onFocusClick ? `<button class="focus-parent-btn" data-message-id="${parent.id}">Focus on parent</button>` : ''}
    `;
        if (options.onMessageClick) {
            header.addEventListener('click', () => options.onMessageClick(parent));
        }
        const focusBtn = header.querySelector('.focus-parent-btn');
        if (focusBtn && options.onFocusClick) {
            focusBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                options.onFocusClick(parent);
            });
        }
        return header;
    }
    /**
     * Render top reply in chain
     */
    renderTopReply(topReply) {
        if (!topReply)
            return '';
        return `
      <div class="top-reply-chain">
        <div class="reply-chain-line"></div>
        <div class="top-reply-content">
          <div class="top-reply-author">${this.escapeHtml(topReply.author.name)}</div>
          <div class="top-reply-text">${this.escapeHtml(topReply.content.substring(0, 150))}${topReply.content.length > 150 ? '...' : ''}</div>
          ${topReply.hasMoreReplies ? `<button class="show-more-replies-btn">Show replies</button>` : ''}
        </div>
      </div>
    `;
    }
    /**
     * Format timestamp
     */
    formatTime(timestamp) {
        const date = typeof timestamp === 'string' ? new Date(timestamp) : timestamp;
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);
        if (minutes < 1)
            return 'just now';
        if (minutes < 60)
            return `${minutes}m ago`;
        if (hours < 24)
            return `${hours}h ago`;
        if (days < 7)
            return `${days}d ago`;
        return date.toLocaleDateString();
    }
    /**
     * Escape HTML
     */
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}
// Export singleton instance
export const unifiedMessageDisplay = new UnifiedMessageDisplay();
