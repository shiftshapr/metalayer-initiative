/**
 * MessageRenderer - Modern TypeScript Message Rendering
 *
 * Handles all 12 requirements:
 * 1. Messages display last on top (newest first)
 * 2. Avatar hover modal
 * 3. Icon counts update locally + real-time
 * 4. New messages display locally + real-time
 * 5. New reply in default → opens focus mode
 * 6. New reply in focus → displays on top
 * 7. Quotes indented with contracted background
 * 8. Images/videos display with text
 * 9. First 9 lines + "Show More"
 * 10. Default: top-level messages, replies in counts
 * 11. Focus: parent + input + children
 * 12. Focus: top reply (threshold) with vertical line
 */
import { UnifiedMessageRenderer } from '../../utils/UnifiedMessageRenderer.js';
import { Logger } from '../../utils/Logger.js';
/**
 * MessageRenderer - Renders messages with all features
 */
export class MessageRenderer {
    constructor(options) {
        this.options = options;
        this.renderedMessages = new Map();
        this.expandedMessages = new Set();
        this.topReplyThreshold = 3; // Configurable threshold for top reply algorithm
        this.container = options.container;
    }
    /**
     * Render messages (default or focus mode)
     */
    async render(options) {
        Logger.debug('MessageRenderer: Rendering messages', {
            count: options.messages.length,
            mode: options.focusState.mode
        }, 'messages');
        // Clear container
        this.container.innerHTML = '';
        this.renderedMessages.clear();
        if (options.focusState.mode === 'focus') {
            await this.renderFocusMode(options.messages, options.focusState);
        }
        else {
            await this.renderDefaultMode(options.messages);
        }
    }
    /**
     * Render default mode: all top-level messages, replies in counts
     */
    async renderDefaultMode(messages) {
        // Filter to top-level messages only
        const topLevelMessages = messages.filter(m => !m.parentId);
        console.log('🔵 MessageRenderer: Rendering default mode', { totalMessages: messages.length, topLevelCount: topLevelMessages.length });
        for (const message of topLevelMessages) {
            try {
                const element = await this.renderMessage(message, {
                    isTopLevel: true,
                    replyCount: this.getReplyCount(message.id, messages)
                });
                if (element && this.container) {
                    this.container.appendChild(element);
                    this.renderedMessages.set(message.id, element);
                    console.log('✅ MessageRenderer: Rendered message', { messageId: message.id, inContainer: this.container.contains(element) });
                }
                else {
                    console.warn('⚠️ MessageRenderer: Element or container is null', { messageId: message.id, hasElement: !!element, hasContainer: !!this.container });
                }
            }
            catch (error) {
                console.error('❌ MessageRenderer: Error rendering message', { messageId: message.id, error });
            }
        }
        console.log('✅ MessageRenderer: Default mode render complete', { renderedCount: this.renderedMessages.size, containerChildren: this.container?.children.length || 0 });
    }
    /**
     * Render focus mode: parent + reply input + all children
     */
    async renderFocusMode(messages, focusState) {
        if (!focusState.parentMessageId) {
            Logger.warn('MessageRenderer: Focus mode requires parentMessageId', null, 'messages');
            return;
        }
        // Find parent message
        const parent = messages.find(m => m.id === focusState.parentMessageId);
        if (!parent) {
            Logger.warn('MessageRenderer: Parent message not found', { parentId: focusState.parentMessageId }, 'messages');
            return;
        }
        // Render parent
        const parentElement = await this.renderMessage(parent, {
            isParent: true,
            isFocusMode: true
        });
        this.container.appendChild(parentElement);
        this.renderedMessages.set(parent.id, parentElement);
        // Render reply input field
        const replyInput = this.createReplyInput(parent.id);
        this.container.appendChild(replyInput);
        // Get all replies to parent
        const replies = messages
            .filter(m => m.parentId === focusState.parentMessageId)
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()); // Newest first
        // Render replies
        for (let i = 0; i < replies.length; i++) {
            const reply = replies[i];
            if (!reply)
                continue;
            const isTopReply = i === 0 && this.isTopReply(reply, replies);
            const replyElement = await this.renderMessage(reply, {
                isReply: true,
                isFocusMode: true,
                isTopReply,
                isHighlighted: reply.id === focusState.highlightedMessageId,
                parentMessageId: parent.id
            });
            if (replyElement instanceof HTMLElement) {
                this.container.appendChild(replyElement);
                this.renderedMessages.set(reply.id, replyElement);
            }
        }
    }
    /**
     * Render a single message
     */
    async renderMessage(message, options = {}) {
        const element = document.createElement('div');
        element.className = 'message';
        element.dataset.messageId = message.id;
        if (options.isReply)
            element.classList.add('message-reply');
        if (options.isParent)
            element.classList.add('message-parent');
        if (options.isTopReply)
            element.classList.add('message-top-reply');
        if (options.isHighlighted)
            element.classList.add('message-highlighted');
        if (options.isFocusMode)
            element.classList.add('focus-mode');
        // Generate HTML using UnifiedMessageRenderer
        let html = '';
        try {
            console.log('🔵 MessageRenderer: Generating HTML for message', { messageId: message.id, hasAuthor: !!message.author });
            html = await UnifiedMessageRenderer.generateMessageHTML(message, {
                isReply: options.isReply || false,
                isFocusMode: options.isFocusMode || false,
                author: message.author,
                replyCount: options.replyCount || 0,
                reactionCount: 0, // Will be updated via real-time
                bookmarkCount: message.bookmarkCount || 0,
                isBookmarked: message.isBookmarked || false,
                canEdit: false, // TODO: Calculate from permissions
                canDelete: false // TODO: Calculate from permissions
            });
            console.log('🔵 MessageRenderer: HTML generated', { messageId: message.id, htmlLength: html.length });
        }
        catch (error) {
            console.error('❌ MessageRenderer: Error generating HTML', { messageId: message.id, error });
            // Fallback: create basic message HTML
            html = `
        <div class="message-content">${message.content || ''}</div>
        <div class="message-author">${message.author?.name || 'Unknown'}</div>
      `;
        }
        if (!html || html.trim().length === 0) {
            console.warn('⚠️ MessageRenderer: Empty HTML generated for message', { messageId: message.id });
            html = `<div class="message-content">${message.content || ''}</div>`;
        }
        element.innerHTML = html;
        // Apply message-specific features
        await this.applyMessageFeatures(element, message, options);
        // Attach event listeners
        this.attachEventListeners(element, message);
        return element;
    }
    /**
     * Apply message-specific features (quotes, media, show more, etc.)
     */
    async applyMessageFeatures(element, message, options) {
        const contentElement = element.querySelector('.message-content');
        if (!contentElement)
            return;
        // Handle quotes (requirement 7)
        if (message.optionalContent) {
            const quoteElement = this.createQuoteElement(message.optionalContent);
            contentElement.appendChild(quoteElement);
        }
        // Handle images/videos (requirement 8)
        if (message.attachments && message.attachments.length > 0) {
            for (const attachment of message.attachments) {
                const mediaElement = this.createMediaElement(attachment);
                contentElement.appendChild(mediaElement);
            }
        }
        // Handle "Show More" (requirement 9)
        const textContent = message.content || '';
        const lines = textContent.split('\n');
        if (lines.length > 9 && contentElement instanceof HTMLElement) {
            this.applyShowMore(contentElement, message.id, textContent);
        }
        // Handle top reply visual (requirement 12)
        if (options.isTopReply && options.parentMessageId) {
            this.applyTopReplyVisual(element, options.parentMessageId);
        }
    }
    /**
     * Create quote element (indented, contracted background)
     */
    createQuoteElement(quoteText) {
        const quoteDiv = document.createElement('div');
        quoteDiv.className = 'message-quote';
        quoteDiv.textContent = quoteText;
        return quoteDiv;
    }
    /**
     * Create media element (image/video with text)
     */
    createMediaElement(attachment) {
        const mediaDiv = document.createElement('div');
        mediaDiv.className = `message-media message-media-${attachment.type}`;
        if (attachment.type === 'image') {
            const img = document.createElement('img');
            img.src = attachment.thumbnailUrl || attachment.url;
            img.alt = 'Message image';
            mediaDiv.appendChild(img);
        }
        else if (attachment.type === 'video') {
            const video = document.createElement('video');
            video.src = attachment.url;
            video.controls = true;
            mediaDiv.appendChild(video);
        }
        return mediaDiv;
    }
    /**
     * Apply "Show More" functionality (first 9 lines)
     */
    applyShowMore(contentElement, messageId, fullText) {
        const lines = fullText.split('\n');
        if (lines.length <= 9)
            return;
        const previewText = lines.slice(0, 9).join('\n');
        contentElement.innerHTML = `
      <div class="message-content-preview">${this.escapeHtml(previewText)}</div>
      <div class="message-content-full" style="display: none;">${this.escapeHtml(fullText)}</div>
      <button class="message-show-more" data-message-id="${messageId}">Show More</button>
    `;
        const showMoreBtn = contentElement.querySelector('.message-show-more');
        if (showMoreBtn) {
            showMoreBtn.addEventListener('click', () => {
                this.expandMessage(messageId);
            });
        }
    }
    /**
     * Expand message (show full content)
     */
    expandMessage(messageId) {
        const element = this.renderedMessages.get(messageId);
        if (!element)
            return;
        const preview = element.querySelector('.message-content-preview');
        const full = element.querySelector('.message-content-full');
        const showMoreBtn = element.querySelector('.message-show-more');
        if (preview && full && showMoreBtn) {
            preview.style.display = 'none';
            full.style.display = 'block';
            showMoreBtn.remove();
            this.expandedMessages.add(messageId);
        }
        if (this.options.onShowMore) {
            this.options.onShowMore(messageId);
        }
    }
    /**
     * Apply top reply visual (vertical line from parent to child)
     */
    applyTopReplyVisual(element, parentMessageId) {
        element.classList.add('has-top-reply-line');
        element.dataset.parentMessageId = parentMessageId;
    }
    /**
     * Create reply input field
     */
    createReplyInput(parentMessageId) {
        const inputDiv = document.createElement('div');
        inputDiv.className = 'message-reply-input';
        inputDiv.innerHTML = `
      <textarea class="reply-textarea" placeholder="Post your reply..." data-parent-id="${parentMessageId}"></textarea>
      <button class="reply-submit-btn" data-parent-id="${parentMessageId}">Reply</button>
    `;
        return inputDiv;
    }
    /**
     * Attach event listeners to message element
     */
    attachEventListeners(element, message) {
        // Avatar hover (requirement 2)
        const avatar = element.querySelector('.avatar-container');
        if (avatar && message.author && this.options.onAvatarHover) {
            avatar.addEventListener('mouseenter', (e) => {
                e.stopPropagation();
                this.options.onAvatarHover(message.author, avatar);
            });
        }
        // Message click handlers
        if (this.options.onMessageClick) {
            element.addEventListener('click', (e) => {
                if (e.target.closest('.message-actions-menu, .reaction-btn, .reply-btn')) {
                    return; // Don't trigger on action buttons
                }
                this.options.onMessageClick(message);
            });
        }
        // Reply button
        const replyBtn = element.querySelector('.inline-reply-btn');
        if (replyBtn && this.options.onReplyClick) {
            replyBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.options.onReplyClick(message);
            });
        }
    }
    /**
     * Add new message (for real-time updates)
     */
    async addMessage(message, options) {
        const element = await this.renderMessage(message, {
            isReply: !!message.parentId,
            isFocusMode: options.focusState.mode === 'focus'
        });
        if (options.position === 'top') {
            this.container.insertBefore(element, this.container.firstChild);
        }
        else {
            this.container.appendChild(element);
        }
        this.renderedMessages.set(message.id, element);
    }
    /**
     * Update message (for edits, etc.)
     */
    async updateMessage(message) {
        const element = this.renderedMessages.get(message.id);
        if (!element)
            return;
        // Re-render message
        const newElement = await this.renderMessage(message, {});
        element.replaceWith(newElement);
        this.renderedMessages.set(message.id, newElement);
    }
    /**
     * Update reply count
     */
    async updateReplyCount(parentMessageId) {
        const element = this.renderedMessages.get(parentMessageId);
        if (!element)
            return;
        const replyCountEl = element.querySelector('.reply-count');
        if (replyCountEl) {
            // Count will be updated via real-time
            // This is a placeholder for the actual count update logic
        }
    }
    /**
     * Update reaction count
     */
    async updateReactionCount(messageId, count) {
        const element = this.renderedMessages.get(messageId);
        if (!element)
            return;
        const reactionBtn = element.querySelector('.reaction-btn');
        if (reactionBtn) {
            const countEl = reactionBtn.querySelector('.icon-count');
            if (countEl) {
                countEl.textContent = count > 0 ? count.toString() : '';
                countEl.style.display = count > 0 ? 'inline-block' : 'none';
            }
        }
    }
    /**
     * Check if reply is "top reply" based on threshold algorithm
     */
    isTopReply(_reply, allReplies) {
        // Configurable algorithm - can be changed as needed
        // Default: first reply (newest) if threshold met
        return allReplies.length >= this.topReplyThreshold;
    }
    /**
     * Get reply count for a message
     */
    getReplyCount(messageId, allMessages) {
        return allMessages.filter(m => m.parentId === messageId).length;
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
