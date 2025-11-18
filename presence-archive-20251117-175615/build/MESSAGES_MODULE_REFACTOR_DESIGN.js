/**
 * MESSAGES MODULE REFACTOR DESIGN
 * 
 * This is a design document and prototype for refactoring message display
 * into a dedicated MessagesModule if current fixes don't work.
 * 
 * DO NOT USE IN PRODUCTION - This is reference code only
 */

// ============================================================================
// PROPOSED: MessagesModule.js
// ============================================================================

class MessagesModule {
  constructor() {
    this.activeMessages = new Map(); // Track active message IDs to prevent duplicates
    this.isInitialized = false;
  }

  async initialize() {
    if (this.isInitialized) return;
    
    this.log('INFO', 'Initializing MessagesModule...');
    
    // Setup global event delegation if needed
    this.setupGlobalEventDelegation();
    
    this.isInitialized = true;
    this.log('INFO', 'MessagesModule initialized');
  }

  /**
   * Unified message display function
   * Handles both default view and focus mode
   */
  async displayMessage(message, options = {}) {
    const {
      container = null,
      isReply = false,
      isFocusMode = false,
      focusModeTarget = null
    } = options;

    // Step 1: Prevent duplicates
    const existingElement = this.preventDuplicates(message.id, container || focusModeTarget);
    if (existingElement) {
      this.log('DEBUG', `Message ${message.id} already exists, reactivating icons`);
      await this.activateMessageIcons(existingElement, message);
      return existingElement;
    }

    // Step 2: Determine target container
    const targetContainer = this.getTargetContainer(container, focusModeTarget, isFocusMode);
    if (!targetContainer) {
      this.log('ERROR', 'No target container found');
      return null;
    }

    // Step 3: Render message HTML
    const messageHTML = this.renderMessageHTML(message, isReply, isFocusMode);

    // Step 4: Create and insert element
    const messageElement = this.createMessageElement(messageHTML, message, isReply, isFocusMode);
    targetContainer.appendChild(messageElement);

    // Step 5: Activate icons and attach listeners
    await this.activateMessageIcons(messageElement, message);

    // Step 6: Track message
    this.activeMessages.set(message.id, {
      element: messageElement,
      container: targetContainer,
      isFocusMode,
      timestamp: Date.now()
    });

    this.log('INFO', `Message ${message.id} displayed successfully`);
    return messageElement;
  }

  /**
   * Single source of truth for duplicate prevention
   */
  preventDuplicates(messageId, targetContainer) {
    // Check target container first
    if (targetContainer) {
      const existing = targetContainer.querySelector(`[data-message-id="${messageId}"]`);
      if (existing) {
        this.log('DEBUG', `Duplicate found in target container: ${messageId}`);
        return existing;
      }
    }

    // Check document-wide (but only if not in focus mode)
    const isFocusMode = targetContainer?.classList.contains('focus-messages-container') || 
                        targetContainer?.dataset.focusMode === 'true';
    
    if (!isFocusMode) {
      const existing = document.querySelector(`[data-message-id="${messageId}"]`);
      if (existing) {
        this.log('DEBUG', `Duplicate found document-wide: ${messageId}`);
        return existing;
      }
    }

    // Check our tracking map
    const tracked = this.activeMessages.get(messageId);
    if (tracked && tracked.element && document.contains(tracked.element)) {
      this.log('DEBUG', `Duplicate found in tracking map: ${messageId}`);
      return tracked.element;
    }

    return null;
  }

  /**
   * Unified icon activation
   * All buttons get the same treatment - no special cases
   */
  async activateMessageIcons(messageElement, message) {
    if (!messageElement) return;

    const buttonSelectors = [
      '.inline-reply-btn',
      '.reaction-btn',
      '.bookmark-btn',
      '.share-btn',
      '.repost-btn',
      '.edit-btn',
      '.delete-btn'
    ];

    // Step 1: Clone all buttons to remove old listeners
    buttonSelectors.forEach(selector => {
      const btn = messageElement.querySelector(selector);
      if (btn && (btn.onclick || btn.dataset.hasListener === 'true')) {
        const newBtn = btn.cloneNode(true);
        btn.parentNode.replaceChild(newBtn, btn);
        this.log('DEBUG', `Cloned ${selector} for ${message.id}`);
      }
    });

    // Step 2: Activate all buttons with same styles
    buttonSelectors.forEach(selector => {
      const btn = messageElement.querySelector(selector);
      if (btn) {
        btn.style.setProperty('pointer-events', 'auto', 'important');
        btn.style.setProperty('cursor', 'pointer', 'important');
        btn.style.setProperty('opacity', '1', 'important');
        btn.style.setProperty('visibility', 'visible', 'important');
        btn.style.setProperty('z-index', '5', 'important');
        btn.style.setProperty('position', 'relative', 'important');
        btn.disabled = false;
      }
    });

    // Step 3: Attach event listeners
    this.attachMessageListeners(messageElement, message);

    // Step 4: Ensure parent containers allow pointer events
    const containers = [
      '.message-content-wrapper',
      '.message-header-new',
      '.message-footer'
    ];
    
    containers.forEach(selector => {
      const container = messageElement.querySelector(selector);
      if (container) {
        container.style.setProperty('pointer-events', 'auto', 'important');
      }
    });

    this.log('INFO', `Icons activated for message ${message.id}`);
  }

  /**
   * Unified event listener attachment
   */
  attachMessageListeners(messageElement, message) {
    // Reply button
    const replyBtn = messageElement.querySelector('.inline-reply-btn');
    if (replyBtn) {
      replyBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.handleReply(message);
      });
      replyBtn.dataset.hasListener = 'true';
    }

    // Reaction button
    const reactionBtn = messageElement.querySelector('.reaction-btn');
    if (reactionBtn) {
      reactionBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.handleReaction(message);
      });
      reactionBtn.dataset.hasListener = 'true';
    }

    // Bookmark button
    const bookmarkBtn = messageElement.querySelector('.bookmark-btn');
    if (bookmarkBtn) {
      bookmarkBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.handleBookmark(message);
      });
      bookmarkBtn.dataset.hasListener = 'true';
    }

    // Share button
    const shareBtn = messageElement.querySelector('.share-btn');
    if (shareBtn) {
      shareBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.handleShare(message);
      });
      shareBtn.dataset.hasListener = 'true';
    }

    // Repost button
    const repostBtn = messageElement.querySelector('.repost-btn');
    if (repostBtn) {
      repostBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.handleRepost(message);
      });
      repostBtn.dataset.hasListener = 'true';
    }

    // Edit button
    const editBtn = messageElement.querySelector('.edit-btn');
    if (editBtn) {
      editBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.handleEdit(message);
      });
      editBtn.dataset.hasListener = 'true';
    }

    // Delete button
    const deleteBtn = messageElement.querySelector('.delete-btn');
    if (deleteBtn) {
      deleteBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.handleDelete(message);
      });
      deleteBtn.dataset.hasListener = 'true';
    }

    messageElement.dataset.listenersAttached = 'true';
  }

  /**
   * Helper methods (delegate to existing handlers)
   */
  handleReply(message) {
    if (typeof window.showReplyModal === 'function') {
      window.showReplyModal(message);
    }
  }

  handleReaction(message) {
    if (typeof window.showReactionModal === 'function') {
      window.showReactionModal(message.id);
    }
  }

  handleBookmark(message) {
    if (typeof window.handleBookmarkToggle === 'function') {
      window.handleBookmarkToggle(message.id);
    }
  }

  handleShare(message) {
    if (typeof window.handleCopyLink === 'function') {
      window.handleCopyLink(message);
    }
  }

  handleRepost(message) {
    if (typeof window.handleRepost === 'function') {
      window.handleRepost(message);
    }
  }

  handleEdit(message) {
    // Edit logic
  }

  handleDelete(message) {
    if (typeof window.handleDeleteMessage === 'function') {
      window.handleDeleteMessage(message);
    }
  }

  /**
   * Utility methods
   */
  getTargetContainer(container, focusModeTarget, isFocusMode) {
    if (focusModeTarget) return focusModeTarget;
    if (container) return container;
    
    if (isFocusMode) {
      return document.querySelector('.focus-messages-container');
    }
    
    return document.querySelector('.chat-messages');
  }

  renderMessageHTML(message, isReply, isFocusMode) {
    // This would call existing message rendering logic
    // or use a template system
    // For now, return placeholder
    return '<div>Message HTML</div>';
  }

  createMessageElement(html, message, isReply, isFocusMode) {
    const div = document.createElement('div');
    div.innerHTML = html;
    const messageElement = div.firstElementChild;
    
    messageElement.dataset.messageId = message.id;
    if (isReply) {
      messageElement.classList.add('message-reply', 'thread-reply');
    }
    
    return messageElement;
  }

  setupGlobalEventDelegation() {
    // Optionally use event delegation for better performance
    // This would be a future optimization
  }

  log(level, message, ...args) {
    console.log(`[MessagesModule] [${level}] ${message}`, ...args);
  }

  /**
   * Cleanup method
   */
  cleanup() {
    this.activeMessages.clear();
    this.isInitialized = false;
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = MessagesModule;
}

// Make globally available
window.MessagesModule = MessagesModule;





