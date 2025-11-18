/**
 * UNIFIED MESSAGE RENDERER
 * 
 * Abstracts message rendering to ensure consistency between default view and focus mode.
 * This eliminates duplication and ensures padding, styling, and event handlers are identical.
 */

class MessageRenderer {
  /**
   * Render a message element with consistent styling and structure
   * @param {Object} message - Message object
   * @param {Object} options - Rendering options
   * @returns {Promise<HTMLElement>} Rendered message element
   */
  static async renderMessage(message, options = {}) {
    const {
      isReply = false,
      isFocusMode = false,
      container = null
    } = options;

    // Use the existing addMessageToChat function which already handles all rendering
    // This ensures consistency
    if (window.addMessageToChat && typeof window.addMessageToChat === 'function') {
      // Set focus mode target if provided
      if (isFocusMode && container) {
        message._focusModeTarget = container;
      }
      
      // Call existing function - it already handles all rendering, styling, and event handlers
      await window.addMessageToChat(message);
      
      // Find and return the rendered element
      const messageId = message.id;
      const renderedElement = container 
        ? container.querySelector(`[data-message-id="${messageId}"]`)
        : document.querySelector(`[data-message-id="${messageId}"]`);
      
      if (renderedElement) {
        console.log(`✅ MessageRenderer: Message ${messageId} rendered successfully`);
        return renderedElement;
      } else {
        console.warn(`⚠️ MessageRenderer: Message ${messageId} rendered but element not found`);
        return null;
      }
    } else {
      console.error('❌ MessageRenderer: addMessageToChat function not available');
      return null;
    }
  }

  /**
   * Ensure consistent padding for focus mode messages
   * @param {HTMLElement} messageElement - Message element
   * @param {Object} options - Padding options
   */
  static applyFocusModePadding(messageElement, options = {}) {
    const {
      paddingTop = '12px',
      paddingLeft = '16px',
      paddingBottom = '0',
      marginTop = '0',
      marginLeft = '0'
    } = options;

    if (messageElement) {
      messageElement.style.setProperty('padding-top', paddingTop, 'important');
      messageElement.style.setProperty('padding-left', paddingLeft, 'important');
      messageElement.style.setProperty('padding-bottom', paddingBottom, 'important');
      messageElement.style.setProperty('margin-top', marginTop, 'important');
      messageElement.style.setProperty('margin-left', marginLeft, 'important');
      console.log(`✅ MessageRenderer: Applied focus mode padding to message ${messageElement.dataset.messageId}`);
    }
  }

  /**
   * Ensure event listeners are attached to message buttons
   * @param {HTMLElement} messageElement - Message element
   * @param {Object} message - Message data
   */
  static ensureEventListeners(messageElement, message) {
    if (!messageElement || !message) return;

    // Use existing addMessageActionListeners function
    if (typeof addMessageActionListeners === 'function') {
      addMessageActionListeners(messageElement, message);
      messageElement.dataset.listenersAttached = 'true';
      console.log(`✅ MessageRenderer: Event listeners attached to message ${message.id}`);
    } else {
      console.warn(`⚠️ MessageRenderer: addMessageActionListeners function not available`);
    }
  }
}

// Export to window for global access
if (typeof window !== 'undefined') {
  window.MessageRenderer = MessageRenderer;
  console.log('✅ MessageRenderer: Exported to window');
}


