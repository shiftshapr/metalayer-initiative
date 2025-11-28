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
import { convertUrlsToLinksSafely } from './HtmlSanitizer.js';
export class UnifiedMessageRenderer {
    /**
     * Generate HTML for a message
     */
    static async generateMessageHTML(message, options = {}) {
        const { isReply = false, isFocusMode = false, author = null, communityName = '', formattedTime = '', reactionCount = 0, replyCount = 0, bookmarkCount = 0, isBookmarked = false, hasUserReplied = false, hasUserReposted = false, hasUserShared = false, canEdit = false, canDelete = false } = options;
        // Get author data - Format: [displayName | name]
        const authorObj = author || message.author;
        const name = authorObj?.name || 'Unknown User';
        // Try to get displayName from multiple sources
        let displayName = authorObj?.displayName || authorObj?.display_name;
        if (!displayName && typeof window !== 'undefined') {
            // Try to get from DisplayNameManager if available
            const displayNameManager = window.DisplayNameManager;
            if (displayNameManager?.getDisplayName && authorObj?.id) {
                const displayNameResult = displayNameManager.getDisplayName(authorObj.id);
                if (typeof displayNameResult === 'string') {
                    displayName = displayNameResult;
                }
                else if (displayNameResult instanceof Promise) {
                    // For async, we'd need to await, but for now use sync approach
                    // This will be handled in a future update if needed
                }
            }
        }
        const senderName = displayName && displayName !== name
            ? `[${displayName} | ${name}]`
            : name;
        // Convert URLs to clickable links
        const contentWithLinks = this.convertUrlsToLinks(message.content || '');
        // ROOT CAUSE FIX: Generate avatar HTML - ensure it's always generated, even for replies
        let avatarHTML = '';
        const avatarUser = author || message.author;
        if (avatarUser) {
            try {
                avatarHTML = await AvatarUtils.createUnifiedAvatar(avatarUser, 'message', {
                    size: 32,
                    showAura: true,
                    showStatus: false
                });
                // ROOT CAUSE FIX: Verify avatar was generated (not empty)
                if (!avatarHTML || avatarHTML.trim().length === 0) {
                    throw new Error('Avatar generation returned empty string');
                }
            }
            catch (error) {
                console.error('❌ UnifiedMessageRenderer: Error creating avatar, using fallback:', error);
                // ROOT CAUSE FIX: Always provide fallback avatar
                const resolvedAvatarUrl = avatarUser.avatarUrl || '';
                const auraColor = avatarUser.auraColor || AVATAR_FALLBACK_COLOR || '#ccc';
                const userInitial = (avatarUser.name || avatarUser.displayName || '?')[0].toUpperCase();
                avatarHTML = `<div class="avatar-container">
          ${resolvedAvatarUrl ? `<img src="${resolvedAvatarUrl}" alt="${senderName}" class="avatar-img" style="border-color: ${auraColor};" referrerpolicy="no-referrer" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
          <div class="avatar-initial" style="display: none; background-color: ${auraColor}; border-color: ${auraColor};">${userInitial}</div>` :
                    `<div class="avatar-initial" style="background-color: ${auraColor}; border-color: ${auraColor};">${userInitial}</div>`}
        </div>`;
            }
        }
        else {
            // ROOT CAUSE FIX: Even if no author, provide placeholder avatar
            avatarHTML = `<div class="avatar-container">
        <div class="avatar-initial" style="background-color: ${AVATAR_FALLBACK_COLOR || '#ccc'}; border-color: ${AVATAR_FALLBACK_COLOR || '#ccc'};">?</div>
      </div>`;
        }
        // CRITICAL FIX: Generate action buttons using X icons - ensure XIcons is available
        if (!XIcons || typeof XIcons.reply !== 'function') {
            console.error('❌ UnifiedMessageRenderer: XIcons not available!', {
                XIcons: !!XIcons,
                hasReply: XIcons && typeof XIcons.reply === 'function',
                XIconsKeys: XIcons ? Object.keys(XIcons) : []
            });
            throw new Error('XIcons is required for message rendering');
        }
        // DEBUG: Log icon generation
        console.log('🔍 UnifiedMessageRenderer: Generating icons...', {
            hasXIcons: !!XIcons,
            hasReply: typeof XIcons.reply === 'function',
            messageId: message.id.substring(0, 8)
        });
        const replyIcon = XIcons.reply({ width: 18, height: 18 });
        const repostIcon = XIcons.repost({ width: 18, height: 18 });
        const likeIcon = reactionCount > 0 ? XIcons.likeFilled({ width: 18, height: 18 }) : XIcons.like({ width: 18, height: 18 });
        const shareIcon = XIcons.share({ width: 18, height: 18 });
        const bookmarkIcon = isBookmarked ? XIcons.bookmarkFilled({ width: 18, height: 18 }) : XIcons.bookmark({ width: 18, height: 18 });
        // DEBUG: Log generated icons
        console.log('🔍 UnifiedMessageRenderer: Icons generated', {
            replyIconLength: replyIcon?.length || 0,
            repostIconLength: repostIcon?.length || 0,
            likeIconLength: likeIcon?.length || 0,
            shareIconLength: shareIcon?.length || 0,
            bookmarkIconLength: bookmarkIcon?.length || 0,
            replyIconPreview: replyIcon?.substring(0, 50) || 'EMPTY'
        });
        // CRITICAL FIX: Verify icons are generated (not empty strings)
        if (!replyIcon || !repostIcon || !likeIcon || !shareIcon || !bookmarkIcon) {
            console.error('❌ UnifiedMessageRenderer: Icon generation failed!', {
                replyIcon: !!replyIcon,
                repostIcon: !!repostIcon,
                likeIcon: !!likeIcon,
                shareIcon: !!shareIcon,
                bookmarkIcon: !!bookmarkIcon,
                replyIconValue: replyIcon,
                repostIconValue: repostIcon
            });
            throw new Error('Icon generation failed - XIcons functions returned empty or invalid');
        }
        // ROOT CAUSE FIX: Always show reply count if > 0, ensure it's visible
        const replyCountDisplay = replyCount > 0 ? `<span class="icon-count reply-count">${replyCount}</span>` : '';
        const bookmarkCountDisplay = bookmarkCount > 0 ? `<span class="icon-count bookmark-count">${bookmarkCount}</span>` : '';
        const reactionCountDisplay = reactionCount > 0 ? `<span class="icon-count">${reactionCount}</span>` : '';
        const replyButtonClass = hasUserReplied ? 'inline-reply-btn active' : 'inline-reply-btn';
        const repostButtonClass = hasUserReposted ? 'repost-btn active' : 'repost-btn';
        const shareButtonClass = hasUserShared ? 'share-btn active' : 'share-btn';
        const bookmarkButtonClass = isBookmarked ? 'bookmark-btn active' : 'bookmark-btn';
        // CRITICAL FIX: Always generate buttons - they should always be present
        const replyButton = `<button class="${replyButtonClass}" data-message-id="${message.id}" data-has-replied="${hasUserReplied}" title="Reply">${replyIcon}${replyCountDisplay}</button>`;
        const repostButton = `<button class="${repostButtonClass}" data-message-id="${message.id}" data-has-reposted="${hasUserReposted}" title="Repost" style="display: flex; align-items: center; gap: 0;">${repostIcon}</button>`;
        const reactionButton = `<button class="reaction-btn" data-message-id="${message.id}" title="Like">${likeIcon}${reactionCountDisplay}</button>`;
        const bookmarkButton = `<button class="${bookmarkButtonClass}" data-message-id="${message.id}" data-is-bookmarked="${isBookmarked}" title="Bookmark">${bookmarkIcon}${bookmarkCountDisplay}</button>`;
        const shareButton = `<button class="${shareButtonClass}" data-message-id="${message.id}" data-has-shared="${hasUserShared}" title="Share">${shareIcon}</button>`;
        // DEBUG: Verify buttons contain icons
        console.log('🔍 UnifiedMessageRenderer: Buttons generated', {
            replyButtonHasIcon: replyButton.includes('<svg'),
            repostButtonHasIcon: repostButton.includes('<svg'),
            reactionButtonHasIcon: reactionButton.includes('<svg'),
            bookmarkButtonHasIcon: bookmarkButton.includes('<svg'),
            shareButtonHasIcon: shareButton.includes('<svg'),
            replyButtonLength: replyButton.length,
            replyButtonPreview: replyButton.substring(0, 100)
        });
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
        // ACCEPTABLE: Optional check for window.getMessageActionsMenu - graceful degradation pattern
        // If the function is not available, falls back to default action buttons
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
            // ROOT CAUSE FIX: Ensure edit/delete buttons are always rendered when canEdit/canDelete is true
            messageActionButtons = `
        <div class="message-actions-menu">
          <button class="action-dots-btn" data-message-id="${message.id}" title="Message actions">
            <span class="action-dots">⋯</span>
          </button>
          <div class="action-dropdown">
            ${canEdit ? `<button class="action-item edit-btn" data-message-id="${message.id}" style="display: block !important; visibility: visible !important; opacity: 1 !important;">✏️ Edit</button>` : ''}
            ${canDelete ? `<button class="action-item delete-btn" data-message-id="${message.id}" style="display: block !important; visibility: visible !important; opacity: 1 !important;">🗑️ Delete</button>` : ''}
            <button class="action-item flag-btn" data-message-id="${message.id}" disabled>🚩 Flag</button>
          </div>
        </div>
      `;
        }
        // Date formatting - in focus mode, replies show date in header (like default mode)
        const isReplyMessage = isReply || !!message.parentId;
        const showHeaderDate = !isFocusMode || (isFocusMode && isReplyMessage);
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
        // Buttons are always generated in the HTML template
        return html;
    }
    /**
     * Convert URLs in text to clickable links
     */
    static convertUrlsToLinks(text) {
        // SECURITY FIX: Use sanitized version to prevent XSS attacks
        return convertUrlsToLinksSafely(text);
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
    static formatMessageTime(timestamp, _isFocusMode = false) {
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
