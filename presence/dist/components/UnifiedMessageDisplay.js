/**
 * UnifiedMessageDisplay - Renders messages with support for focus modes
 *
 * Handles:
 * - Default display (standard message list)
 * - Parent in focus (emphasizes parent, collapses children)
 * - Child in focus (highlights child, shows parent as header)
 */
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
        // ROOT CAUSE FIX: Clear container completely before rendering
        // This prevents duplicates from previous renders
        // BUT: Only clear if we're rendering a different focus context or if container is empty
        const existingMessageCount = container.querySelectorAll('[data-message-id]').length;
        const existingFocusContext = container.className.match(/focus-mode-(\w+)/)?.[1];
        const shouldClear = existingMessageCount === 0 || existingFocusContext !== focusContext;
        if (shouldClear) {
            while (container.firstChild) {
                container.removeChild(container.firstChild);
            }
            container.innerHTML = '';
            console.log(`🔍 UnifiedMessageDisplay: Cleared container (${existingMessageCount} existing messages, context: ${existingFocusContext} -> ${focusContext})`);
        }
        else {
            console.log(`🔍 UnifiedMessageDisplay: Keeping existing messages (${existingMessageCount} messages, same context: ${focusContext})`);
        }
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
        // ROOT CAUSE FIX: Track existing message IDs to prevent duplicates
        const existingIds = new Set(Array.from(container.querySelectorAll('[data-message-id]')).map(el => el.getAttribute('data-message-id')));
        for (const message of messages) {
            // Skip if message already exists in DOM
            if (existingIds.has(message.id)) {
                console.log(`⚠️ UnifiedMessageDisplay: Skipping duplicate message ${message.id}`);
                continue;
            }
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
                existingIds.add(message.id); // Track added message
                console.log(`✅ UnifiedMessageDisplay: Appended message ${message.id} to DOM`);
            }
            catch (error) {
                console.error(`❌ UnifiedMessageDisplay: Failed to append message ${message.id}:`, error);
            }
        }
        // ROOT CAUSE FIX: Verify messages are in DOM after rendering
        const finalCount = container.querySelectorAll('[data-message-id]').length;
        console.log(`🔍 UnifiedMessageDisplay: Rendered ${messages.length} messages, ${finalCount} found in DOM`);
        if (finalCount !== messages.length) {
            console.warn(`⚠️ UnifiedMessageDisplay: Message count mismatch! Expected ${messages.length}, found ${finalCount} in DOM`);
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
        // ROOT CAUSE FIX: Use renderMessageElement from CanopiModule for full UI (icons, action menu, etc.)
        if (typeof window !== 'undefined') {
            const win = window;
            if (win.renderMessageElement && typeof win.renderMessageElement === 'function') {
                // ROOT CAUSE FIX: Get the actual container from the render context
                // UnifiedMessageDisplay.render() passes container, but we need to get it here
                const container = this.getCurrentContainer();
                const messageEl = await win.renderMessageElement(message, container);
                // Apply focus context classes
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
                // ROOT CAUSE FIX: Ensure message element has data-message-id for reaction updates
                if (!messageEl.dataset.messageId) {
                    messageEl.dataset.messageId = message.id;
                }
                // ROOT CAUSE FIX: Attach click handler for focus mode
                if (options.onMessageClick || options.onFocusClick) {
                    const clickHandler = (e) => {
                        // Don't trigger if clicking on action buttons or links
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
                // Attach action listeners (icons, action menu, etc.)
                if (win.addMessageActionListeners) {
                    win.addMessageActionListeners(messageEl, message);
                }
                // Load reactions
                if (win.loadMessageReactions && typeof win.loadMessageReactions === 'function') {
                    // Use setTimeout to ensure message is appended to DOM first
                    setTimeout(async () => {
                        try {
                            if (typeof win.loadMessageReactions === 'function') {
                                await win.loadMessageReactions(message.id);
                            }
                        }
                        catch (error) {
                            console.warn('⚠️ UnifiedMessageDisplay: Failed to load reactions:', error);
                        }
                    }, 100);
                }
                return messageEl;
            }
        }
        // Fallback: Create basic message structure (should not happen if CanopiModule is loaded)
        const messageDiv = document.createElement('div');
        messageDiv.className = 'message';
        messageDiv.dataset.messageId = message.id;
        const author = message.author || { name: 'Unknown', handle: 'unknown', avatarUrl: '' };
        messageDiv.innerHTML = `
      <div class="message-header">
        <div class="message-avatar">
          <img src="${author.avatarUrl || ''}" alt="${author.name}" />
        </div>
        <div class="message-author">
          <span class="author-name">${author.name}</span>
          <span class="author-handle">@${author.handle}</span>
        </div>
        <div class="message-time">${this.formatTime(message.createdAt)}</div>
      </div>
      <div class="message-content">${this.escapeHtml(message.content || '')}</div>
    `;
        return messageDiv;
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
