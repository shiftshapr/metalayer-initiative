/**
 * UNIFIED MESSAGE RENDERER - TypeScript Version
 *
 * Single source of truth for message rendering in both default and focus modes.
 * Ensures consistent HTML structure and prevents zero-height issues.
 *
 * Key Principle: Always render content, use CSS classes for visibility control.
 */
import { AvatarUtils } from './AvatarUtils.js';
import { AVATAR_FALLBACK_COLOR } from '../core/ConfigModule.js';
import { XIcons } from './XIconLibrary.js';
export class UnifiedMessageRenderer {
    /**
     * Generate HTML for a message
     */
    static async generateMessageHTML(message, options = {}) {
        const { isReply = false, isFocusMode = false, author = null, communityName = '', formattedTime = '', reactionCount = 0, replyCount = 0, bookmarkCount = 0, isBookmarked = false, hasUserReplied = false, hasUserReposted = false, hasUserShared = false, canEdit = false, canDelete = false } = options;
        // Get author data - Format: [displayName | name]
        const authorObj = author || message.author;
        const displayName = authorObj?.displayName || authorObj?.display_name;
        const name = authorObj?.name || 'Unknown User';
        const senderName = displayName && displayName !== name
            ? `[${displayName} | ${name}]`
            : name;
        const messageUserId = message.author?.id || message.authorId;
        // Convert URLs to clickable links
        const contentWithLinks = this.convertUrlsToLinks(message.content || '');
        // Generate avatar HTML
        let avatarHTML = '';
        try {
            const avatarUser = author || message.author;
            if (avatarUser) {
                avatarHTML = await AvatarUtils.createUnifiedAvatar(avatarUser, 'message', {
                    size: 32,
                    showAura: true,
                    showStatus: false
                });
            }
        }
        catch (error) {
            console.error('❌ UnifiedMessageRenderer: Error creating avatar:', error);
            const resolvedAvatarUrl = (author || message.author)?.avatarUrl || '';
            const auraColor = (author || message.author)?.auraColor || AVATAR_FALLBACK_COLOR || '#ccc';
            avatarHTML = `<div class="avatar-container"><img src="${resolvedAvatarUrl}" alt="${senderName}" class="avatar-img" style="border-color: ${auraColor};" referrerpolicy="no-referrer"></div>`;
        }
        // CRITICAL FIX: Generate action buttons using X icons - ensure XIcons is available
        if (!XIcons || typeof XIcons.reply !== 'function') {
            console.error('❌ UnifiedMessageRenderer: XIcons not available!', { XIcons: !!XIcons });
            throw new Error('XIcons is required for message rendering');
        }
        const replyIcon = XIcons.reply({ width: 18, height: 18 });
        const repostIcon = XIcons.repost({ width: 18, height: 18 });
        const likeIcon = reactionCount > 0 ? XIcons.likeFilled({ width: 18, height: 18 }) : XIcons.like({ width: 18, height: 18 });
        const shareIcon = XIcons.share({ width: 18, height: 18 });
        const bookmarkIcon = isBookmarked ? XIcons.bookmarkFilled({ width: 18, height: 18 }) : XIcons.bookmark({ width: 18, height: 18 });
        const viewIcon = XIcons.view({ width: 18, height: 18 });
        // CRITICAL FIX: Verify icons are generated (not empty strings)
        if (!replyIcon || !repostIcon || !likeIcon || !shareIcon || !bookmarkIcon) {
            console.error('❌ UnifiedMessageRenderer: Icon generation failed!', {
                replyIcon: !!replyIcon,
                repostIcon: !!repostIcon,
                likeIcon: !!likeIcon,
                shareIcon: !!shareIcon,
                bookmarkIcon: !!bookmarkIcon
            });
            throw new Error('Icon generation failed - XIcons functions returned empty or invalid');
        }
        const replyCountDisplay = replyCount > 0 ? `<span class="icon-count">${replyCount}</span>` : '';
        const bookmarkCountDisplay = bookmarkCount > 0 ? `<span class="icon-count bookmark-count">${bookmarkCount}</span>` : '';
        const reactionCountDisplay = reactionCount > 0 ? `<span class="icon-count">${reactionCount}</span>` : '';
        const replyButtonClass = hasUserReplied ? 'inline-reply-btn active' : 'inline-reply-btn';
        const repostButtonClass = hasUserReposted ? 'repost-btn active' : 'repost-btn';
        const shareButtonClass = hasUserShared ? 'share-btn active' : 'share-btn';
        const bookmarkButtonClass = isBookmarked ? 'bookmark-btn active' : 'bookmark-btn';
        // CRITICAL FIX: Always generate buttons - they should always be present
        const replyButton = `<button class="${replyButtonClass}" data-message-id="${message.id}" data-has-replied="${hasUserReplied}" title="Reply">${replyIcon}${replyCountDisplay}</button>`;
        const repostButton = `<button class="${repostButtonClass}" data-message-id="${message.id}" data-has-reposted="${hasUserReposted}" title="Repost">${repostIcon}</button>`;
        const reactionButton = `<button class="reaction-btn" data-message-id="${message.id}" title="Like">${likeIcon}${reactionCountDisplay}</button>`;
        const bookmarkButton = `<button class="${bookmarkButtonClass}" data-message-id="${message.id}" data-is-bookmarked="${isBookmarked}" title="Bookmark">${bookmarkIcon}${bookmarkCountDisplay}</button>`;
        const shareButton = `<button class="${shareButtonClass}" data-message-id="${message.id}" data-has-shared="${hasUserShared}" title="Share">${shareIcon}</button>`;
        // CRITICAL FIX: Verify buttons are generated (not empty)
        if (!replyButton || !reactionButton || !bookmarkButton || !shareButton) {
            console.error('❌ UnifiedMessageRenderer: Button generation failed!', {
                replyButton: !!replyButton,
                reactionButton: !!reactionButton,
                bookmarkButton: !!bookmarkButton,
                shareButton: !!shareButton
            });
            throw new Error('Button generation failed');
        }
        // Generate action menu - CRITICAL FIX: await Promise if getMessageActionsMenu returns one
        let messageActionButtons = '';
        if (window.getMessageActionsMenu && typeof window.getMessageActionsMenu === 'function') {
            const actionMenuResult = window.getMessageActionsMenu(message, canEdit, canDelete);
            // Check if result is a Promise
            if (actionMenuResult instanceof Promise) {
                messageActionButtons = await actionMenuResult;
            }
            else {
                messageActionButtons = actionMenuResult;
            }
        }
        else {
            messageActionButtons = `
        <div class="message-actions-menu">
          <button class="action-dots-btn" data-message-id="${message.id}" title="Message actions">
            <span class="action-dots">⋯</span>
          </button>
          <div class="action-dropdown">
            ${canEdit ? `<button class="action-item edit-btn" data-message-id="${message.id}">✏️ Edit</button>` : ''}
            ${canDelete ? `<button class="action-item delete-btn" data-message-id="${message.id}">🗑️ Delete</button>` : ''}
            <button class="action-item flag-btn" data-message-id="${message.id}" disabled>🚩 Flag</button>
          </div>
        </div>
      `;
        }
        // Date formatting - in focus mode, replies show date in header (like default mode)
        const isReplyMessage = isReply || !!message.parentId;
        const showHeaderDate = !isFocusMode || (isFocusMode && isReplyMessage);
        const dateInHeader = showHeaderDate && formattedTime ? `<span class="message-time-new">${formattedTime}</span>` : '';
        const dateInFooter = !showHeaderDate && formattedTime && isFocusMode ? `<div class="focus-date-row"><span class="message-time-new focus-date">${formattedTime}</span></div>` : '';
        // CRITICAL: Always render full HTML structure - never hide content
        // CSS classes control visibility, not display:none
        // CRITICAL FIX: Ensure formattedTime is a string before using in template
        const safeFormattedTime = typeof formattedTime === 'string' ? formattedTime : '';
        const safeDateInHeader = showHeaderDate && safeFormattedTime ? `<span class="message-time-new">${safeFormattedTime}</span>` : '';
        const safeDateInFooter = !showHeaderDate && safeFormattedTime && isFocusMode ? `<div class="focus-date-row"><span class="message-time-new focus-date">${safeFormattedTime}</span></div>` : '';
        const html = `
      <div class="avatar-container">${avatarHTML}</div>
      <div class="message-content-wrapper">
        <div class="message-header-new">
          <span class="message-sender-name">${senderName}${communityName ? ` • ${communityName}` : ''}</span>
          ${safeDateInHeader}
          <div class="message-actions-new">
            ${messageActionButtons}
          </div>
        </div>
        <div class="message-content">${contentWithLinks}</div>
        ${message.optionalContent ? `<div class="message-anchor">📍 ${message.optionalContent}</div>` : ''}
      </div>
      <div class="message-footer">
        ${safeDateInFooter}
        <div class="message-footer-actions">
          ${replyButton}
          ${repostButton}
          ${reactionButton}
          ${bookmarkButton}
          ${shareButton}
        </div>
      </div>
    `;
        // CRITICAL DEBUG: Verify buttons are in HTML
        const hasButtons = html.includes('reaction-btn') && html.includes('inline-reply-btn') && html.includes('bookmark-btn');
        if (!hasButtons) {
            console.error('❌ UnifiedMessageRenderer: Buttons missing from generated HTML!', {
                messageId: message.id,
                hasReplyButton: html.includes('inline-reply-btn'),
                hasReactionButton: html.includes('reaction-btn'),
                hasBookmarkButton: html.includes('bookmark-btn'),
                htmlLength: html.length,
                htmlPreview: html.substring(0, 500)
            });
        }
        else {
            console.log(`✅ UnifiedMessageRenderer: Generated HTML for message ${message.id.substring(0, 8)} with buttons`);
        }
        return html;
    }
    /**
     * Convert URLs in text to clickable links
     */
    static convertUrlsToLinks(text) {
        if (!text)
            return '';
        const urlRegex = /(https?:\/\/[^\s]+)/g;
        return text.replace(urlRegex, '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>');
    }
    /**
     * Render a complete message element
     */
    static async renderMessage(message, options = {}) {
        const { isReply = false, isFocusMode = false, author = null, communityName = '', reactionCount = 0, replyCount = 0, bookmarkCount = 0, isBookmarked = false, hasUserReplied = false, hasUserReposted = false, hasUserShared = false, canEdit = false, canDelete = false } = options;
        // Format time - CRITICAL FIX: Focus mode replies should use SAME date format as default mode
        const isReplyMessage = isReply || !!message.parentId;
        const useDefaultFormat = isFocusMode && isReplyMessage;
        const formattedTime = this.formatMessageTime(message.createdAt, !useDefaultFormat && isFocusMode);
        // Generate HTML
        const html = await this.generateMessageHTML(message, {
            isReply,
            isFocusMode,
            author,
            communityName,
            formattedTime,
            reactionCount,
            replyCount,
            bookmarkCount,
            isBookmarked,
            hasUserReplied,
            hasUserReposted,
            hasUserShared,
            canEdit,
            canDelete
        });
        // Create element
        const messageDiv = document.createElement('div');
        // Set classes based on mode
        if (isReply) {
            messageDiv.className = 'message message-reply thread-reply';
            // CRITICAL: In focus mode, replies are visible immediately
            if (isFocusMode) {
                messageDiv.classList.add('visible', 'message-loaded');
            }
        }
        else {
            messageDiv.className = 'message thread-starter';
            // Check if message has replies (from options or message data)
            const hasReplies = replyCount > 0 || message.hasReplies;
            if (hasReplies) {
                messageDiv.classList.add('has-replies');
            }
        }
        // Set data attributes
        messageDiv.dataset.messageId = message.id;
        messageDiv.dataset.conversationId = message.conversationId || '';
        messageDiv.dataset.authorId = author?.id || message.author?.id || message.authorId || '';
        if (message.parentId) {
            messageDiv.dataset.parentId = message.parentId;
        }
        // CRITICAL: Set innerHTML - content is always rendered
        messageDiv.innerHTML = html;
        // CRITICAL: Ensure content wrapper has proper dimensions
        const contentWrapper = messageDiv.querySelector('.message-content-wrapper');
        if (contentWrapper) {
            // Force layout calculation
            contentWrapper.style.setProperty('min-height', '1px', 'important');
            contentWrapper.style.setProperty('display', 'flex', 'important');
            contentWrapper.style.setProperty('flex-direction', 'column', 'important');
        }
        return messageDiv;
    }
    /**
     * Format message time
     */
    static formatMessageTime(timestamp, isFocusMode = false) {
        if (!timestamp)
            return '';
        const date = new Date(timestamp);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);
        if (diffMins < 1)
            return 'now';
        if (diffMins < 60)
            return `${diffMins}m`;
        if (diffHours < 24)
            return `${diffHours}h`;
        if (diffDays < 7)
            return `${diffDays}d`;
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
}
// Export to window for backward compatibility
if (typeof window !== 'undefined') {
    window.UnifiedMessageRenderer = UnifiedMessageRenderer;
    console.log('✅ UnifiedMessageRenderer: Exported to window');
}
export default UnifiedMessageRenderer;
