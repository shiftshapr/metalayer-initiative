/**
 * UNIFIED MESSAGE RENDERER
 * 
 * Single source of truth for message rendering in both default and focus modes.
 * Ensures consistent HTML structure and prevents zero-height issues.
 * 
 * Key Principle: Always render content, use CSS classes for visibility control.
 */

class UnifiedMessageRenderer {
  /**
   * Generate HTML for a message
   * @param {Object} message - Message data
   * @param {Object} options - Rendering options
   * @returns {Promise<string>} HTML string
   */
  static async generateMessageHTML(message, options = {}) {
    const {
      isReply = false,
      isFocusMode = false,
      author = null,
      communityName = '',
      formattedTime = '',
      reactionCount = 0,
      replyCount = 0,
      bookmarkCount = 0,
      isBookmarked = false,
      hasUserReplied = false,
      hasUserReposted = false,
      hasUserShared = false,
      canEdit = false,
      canDelete = false
    } = options;

    // Get author data
    const senderName = author?.name || message.author?.name || 'Unknown User';
    const messageUserId = message.user_id || message.author?.id || message.author?.user_id;
    
    // Convert URLs to clickable links
    const contentWithLinks = this.convertUrlsToLinks(message.body || message.content || '');
    
    // Generate avatar HTML
    let avatarHTML = '';
    try {
      if (window.AvatarUtils && typeof window.AvatarUtils.createUnifiedAvatar === 'function') {
        avatarHTML = await window.AvatarUtils.createUnifiedAvatar(author || message.author, 'message', {
          size: 32,
          showAura: true,
          showStatus: false
        });
      } else {
        const resolvedAvatarUrl = (author || message.author)?.avatarUrl || '';
        const auraColor = (author || message.author)?.auraColor || window.AVATAR_FALLBACK_COLOR || '#ccc';
        avatarHTML = `<div class="avatar-container"><img src="${resolvedAvatarUrl}" alt="${senderName}" class="avatar-img" style="border-color: ${auraColor};" referrerpolicy="no-referrer"></div>`;
      }
    } catch (error) {
      console.error('❌ UnifiedMessageRenderer: Error creating avatar:', error);
      avatarHTML = `<div class="avatar-container"><div class="avatar" style="background-color: ${window.AVATAR_FALLBACK_COLOR || '#ccc'};">${senderName.charAt(0).toUpperCase()}</div></div>`;
    }

    // Generate action buttons
    const replyIcon = `<svg viewBox="0 0 24 24" aria-hidden="true" style="width: 18px; height: 18px; fill: currentColor;"><g><path d="M1.751 10c0-4.42 3.584-8 8.005-8h4.366c4.49 0 8.129 3.64 8.129 8.13 0 2.96-1.607 5.68-4.196 7.11l-8.054 4.46v-3.69h-.067c-4.49.1-8.183-3.51-8.183-8.01zm8.005-6c-3.317 0-6.005 2.69-6.005 6 0 3.37 2.77 6.08 6.138 6.01l.351-.01h1.761v2.3l5.087-2.81c1.951-1.08 3.163-3.13 3.163-5.36 0-3.39-2.744-6.13-6.129-6.13H9.756z"></path></g></svg>`;
    const repostIcon = `<svg viewBox="0 0 24 24" aria-hidden="true" style="width: 18px; height: 18px; fill: currentColor;"><g><path d="M4.5 3.88l4.432 4.14-1.364 1.46L5.5 7.55V16c0 1.1.896 2 2 2H13v2H7.5c-2.209 0-4-1.79-4-4V7.55L1.432 9.48.068 8.02 4.5 3.88zM16.5 6H11V4h5.5c2.209 0 4 1.79 4 4v8.45l2.068-1.93 1.364 1.46-4.432 4.14-4.432-4.14 1.364-1.46 2.068 1.93V8c0-1.1-.896-2-2-2z"></path></g></svg>`;
    const blankReactIcon = `<svg viewBox="0 0 24 24" aria-hidden="true" style="width: 18px; height: 18px; fill: currentColor;"><g><path d="M16.697 5.5c-1.222-.06-2.679.51-3.89 2.16l-.805 1.09-.806-1.09C9.984 6.01 8.526 5.44 7.304 5.5c-1.243.07-2.349.78-2.91 1.91-.552 1.12-.633 2.78.479 4.82 1.074 1.97 3.257 4.27 7.129 6.61 3.87-2.34 6.052-4.64 7.126-6.61 1.111-2.04 1.03-3.7.477-4.82-.561-1.13-1.666-1.84-2.908-1.91zm4.187 7.69c-1.351 2.48-4.001 5.12-8.379 7.67l-.503.3-.504-.3c-4.379-2.55-7.029-5.19-8.382-7.67-1.36-2.5-1.41-4.86-.514-6.67.887-1.79 2.647-2.91 4.601-3.01 1.651-.09 3.368.56 4.798 2.01 1.429-1.45 3.146-2.1 4.796-2.01 1.954.1 3.714 1.22 4.601 3.01.896 1.81.846 4.17-.514 6.67z"></path></g></svg>`;
    const bookmarkIconInactive = `<svg viewBox="0 0 24 24" aria-hidden="true" style="width: 18px; height: 18px; fill: currentColor;"><g><path d="M4 4.5C4 3.12 5.119 2 6.5 2h11C18.881 2 20 3.12 20 4.5v18.44l-8-5.71-8 5.71V4.5zM6.5 4c-.276 0-.5.22-.5.5v14.56l6-4.29 6 4.29V4.5c0-.28-.224-.5-.5-.5h-11z"></path></g></svg>`;
    const bookmarkIconActive = `<svg viewBox="0 0 24 24" aria-hidden="true" style="width: 18px; height: 18px; fill: currentColor;"><g><path d="M4 4.5C4 3.12 5.119 2 6.5 2h11C18.881 2 20 3.12 20 4.5v18.44l-8-5.71-8 5.71V4.5z"></path></g></svg>`;
    const shareIcon = `<svg viewBox="0 0 24 24" aria-hidden="true" style="width: 18px; height: 18px; fill: currentColor;"><g><path d="M12 2.59l5.7 5.7-1.41 1.42L13 6.41V16h-2V6.41l-3.3 3.3-1.41-1.42L12 2.59zM21 15l-.02 3.51c0 1.38-1.12 2.49-2.5 2.49H5.5C4.11 21 3 19.88 3 18.5V15h2v3.5c0 .28.22.5.5.5h12.98c.28 0 .5-.22.5-.5L19 15h2z"></path></g></svg>`;

    const replyCountDisplay = replyCount > 0 ? `<span class="icon-count">${replyCount}</span>` : '';
    const bookmarkCountDisplay = bookmarkCount > 0 ? `<span class="icon-count bookmark-count">${bookmarkCount}</span>` : '';
    const bookmarkIconToUse = isBookmarked ? bookmarkIconActive : bookmarkIconInactive;
    
    const replyButtonClass = hasUserReplied ? 'inline-reply-btn active' : 'inline-reply-btn';
    const repostButtonClass = hasUserReposted ? 'repost-btn active' : 'repost-btn';
    const shareButtonClass = hasUserShared ? 'share-btn active' : 'share-btn';
    const bookmarkButtonClass = isBookmarked ? 'bookmark-btn active' : 'bookmark-btn';

    const replyButton = `<button class="${replyButtonClass}" data-message-id="${message.id}" data-has-replied="${hasUserReplied}" title="Reply">${replyIcon}${replyCountDisplay}</button>`;
    const repostButton = `<button class="${repostButtonClass}" data-message-id="${message.id}" data-has-reposted="${hasUserReposted}" title="Repost">${repostIcon}</button>`;
    const reactionButton = `<button class="reaction-btn" data-message-id="${message.id}" title="Add reaction">${blankReactIcon}<span class="icon-count" style="display: none;"></span></button>`;
    const bookmarkButton = `<button class="${bookmarkButtonClass}" data-message-id="${message.id}" data-is-bookmarked="${isBookmarked}" title="Bookmark">${bookmarkIconToUse}${bookmarkCountDisplay}</button>`;
    const shareButton = `<button class="${shareButtonClass}" data-message-id="${message.id}" data-has-shared="${hasUserShared}" title="Share">${shareIcon}</button>`;

    // Generate action menu
    let messageActionButtons = '';
    if (typeof getMessageActionsMenu === 'function') {
      messageActionButtons = getMessageActionsMenu(message, canEdit, canDelete);
    } else {
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
    // formattedTime is already passed from render() method with correct format
    const isReplyMessage = isReply || !!(message.parentId);
    const showHeaderDate = !isFocusMode || (isFocusMode && isReplyMessage);
    const dateInHeader = showHeaderDate && formattedTime ? `<span class="message-time-new">${formattedTime}</span>` : '';
    const dateInFooter = !showHeaderDate && formattedTime && isFocusMode ? `<div class="focus-date-row"><span class="message-time-new focus-date">${formattedTime}</span></div>` : '';

    // CRITICAL: Always render full HTML structure - never hide content
    // CSS classes control visibility, not display:none
    return `
      <div class="avatar-container">${avatarHTML}</div>
      <div class="message-content-wrapper">
        <div class="message-header-new">
          <span class="message-sender-name">${senderName}${communityName ? ` • ${communityName}` : ''}</span>
          ${dateInHeader}
          <div class="message-actions-new">
            ${messageActionButtons}
          </div>
        </div>
        <div class="message-content">${contentWithLinks}</div>
        ${message.optionalContent ? `<div class="message-anchor">📍 ${message.optionalContent}</div>` : ''}
      </div>
      <div class="message-footer">
        ${dateInFooter}
        <div class="message-footer-actions">
          ${replyButton}
          ${repostButton}
          ${reactionButton}
          ${bookmarkButton}
          ${shareButton}
        </div>
      </div>
    `;
  }

  /**
   * Convert URLs in text to clickable links
   * @param {string} text - Text with URLs
   * @returns {string} Text with clickable links
   */
  static convertUrlsToLinks(text) {
    if (!text) return '';
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    return text.replace(urlRegex, '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>');
  }

  /**
   * Render a complete message element
   * @param {Object} message - Message data
   * @param {Object} options - Rendering options
   * @returns {Promise<HTMLElement>} Rendered message element
   */
  static async renderMessage(message, options = {}) {
    const {
      isReply = false,
      isFocusMode = false,
      author = null,
      communityName = '',
      reactionCount = 0,
      replyCount = 0,
      bookmarkCount = 0,
      isBookmarked = false,
      hasUserReplied = false,
      hasUserReposted = false,
      hasUserShared = false,
      canEdit = false,
      canDelete = false
    } = options;

    // Format time - CRITICAL FIX: Focus mode replies should use SAME date format as default mode
    const isReplyMessage = isReply || !!(message.parentId);
    const useDefaultFormat = isFocusMode && isReplyMessage;
    const formattedTime = this.formatMessageTime(message.createdAt || message.created_at, !useDefaultFormat && isFocusMode);

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
    } else {
      messageDiv.className = 'message thread-starter';
      if (message.hasReplies) {
        messageDiv.classList.add('has-replies');
      }
    }

    // Set data attributes
    messageDiv.dataset.messageId = message.id;
    messageDiv.dataset.conversationId = message.conversationId || '';
    messageDiv.dataset.authorId = author?.id || author?.user_id || message.author?.id || '';
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
   * @param {string|Date} timestamp - Message timestamp
   * @param {boolean} isFocusMode - Whether in focus mode
   * @returns {string} Formatted time string
   */
  static formatMessageTime(timestamp, isFocusMode = false) {
    if (!timestamp) return '';
    
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'now';
    if (diffMins < 60) return `${diffMins}m`;
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays < 7) return `${diffDays}d`;
    
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }
}

// Export to window
if (typeof window !== 'undefined') {
  window.UnifiedMessageRenderer = UnifiedMessageRenderer;
  console.log('✅ UnifiedMessageRenderer: Exported to window');
}

