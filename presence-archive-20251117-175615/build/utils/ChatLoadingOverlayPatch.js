/**
 * CHAT LOADING OVERLAY PATCH
 * 
 * Provides persistent loading indicator that works across tab switches
 * and ensures minimum display duration for better UX.
 */

(function () {
  const PATCH_FLAG = '__chatLoadingOverlayPatched';
  const MIN_CHAT_LOADING_DURATION = 800;

  if (window[PATCH_FLAG]) {
    return;
  }
  window[PATCH_FLAG] = true;

  function ensureOverlayContainer(chatMessages) {
    if (!chatMessages) return null;
    
    // CRITICAL FIX: Remove any existing overlays first to prevent stuck overlays
    const existingOverlays = chatMessages.querySelectorAll(':scope > .chat-loading-overlay');
    existingOverlays.forEach(overlay => overlay.remove());
    
    // Create fresh overlay
    const overlay = document.createElement('div');
    overlay.className = 'chat-loading-overlay';
    overlay.innerHTML = `
      <div class="chat-loading-indicator">
        <div class="loading-spinner"></div>
        <div class="loading-text">Loading messages...</div>
      </div>
    `;
    // Ensure overlay is visible
    overlay.classList.remove('hidden');
    overlay.style.display = '';
    overlay.style.visibility = '';
    overlay.style.opacity = '';
    overlay.style.pointerEvents = '';
    chatMessages.appendChild(overlay);
    
    return overlay;
  }

  function showLoading(chatMessages) {
    if (!chatMessages) return null;
    
    // CRITICAL FIX: Remove empty state message before showing loading to prevent "no messages → loading" flicker
    const existingEmptyState = chatMessages.querySelector('.empty-state-message');
    if (existingEmptyState) {
      existingEmptyState.remove();
      console.log('🔧 CHAT_PATCH: Removed empty state before showing loading');
    }
    
    const overlay = ensureOverlayContainer(chatMessages);
    if (!overlay) return null;

    const startTime = performance.now();
    chatMessages.classList.add('is-loading');
    chatMessages.setAttribute('aria-busy', 'true');

    overlay.classList.remove('hidden');

    // CRITICAL FIX: Don't hide messages during loading - just show overlay on top
    // This prevents the "blank screen" issue where messages are hidden but overlay is removed
    // Messages will be visible behind the overlay, and overlay will be removed when loading completes

    return { overlay, startTime };
  }

  async function hideLoading(chatMessages, state) {
    if (!chatMessages || !state) {
      console.warn('⚠️ CHAT_PATCH: hideLoading called without required params, forcing cleanup');
      forceHideAllOverlays();
      return;
    }
    
    // CRITICAL FIX: Ensure minimum display duration for better UX
    const elapsed = performance.now() - state.startTime;
    const remainingTime = MIN_CHAT_LOADING_DURATION - elapsed;
    if (remainingTime > 0) {
      await new Promise(resolve => setTimeout(resolve, remainingTime));
    }

    // CRITICAL FIX: Always hide overlay IMMEDIATELY - don't wait for anything
    // Remove ALL overlays first
    const allOverlays = chatMessages.querySelectorAll('.chat-loading-overlay, .chat-loading-indicator, .loading-spinner');
    allOverlays.forEach(overlay => {
      overlay.classList.add('hidden');
      overlay.style.setProperty('display', 'none', 'important');
      overlay.style.setProperty('visibility', 'hidden', 'important');
      overlay.style.setProperty('opacity', '0', 'important');
      overlay.style.setProperty('pointer-events', 'none', 'important');
      overlay.remove(); // Remove immediately, don't wait
      console.log('✅ CHAT_PATCH: Removed overlay immediately');
    });

    // Remove loading classes
    chatMessages.classList.remove('is-loading');
    chatMessages.removeAttribute('aria-busy');

    // CRITICAL FIX: Make ALL messages visible immediately (they should already be visible since we don't hide them)
    const allMessages = chatMessages.querySelectorAll('.message, [data-message-id]');
    allMessages.forEach(msg => {
      msg.style.setProperty('display', 'flex', 'important');
      msg.style.setProperty('visibility', 'visible', 'important');
      msg.style.setProperty('opacity', '1', 'important');
    });
    
    // CRITICAL FIX: Ensure chatMessages container itself is visible with !important
    chatMessages.style.setProperty('visibility', 'visible', 'important');
    chatMessages.style.setProperty('opacity', '1', 'important');
    chatMessages.style.setProperty('display', 'block', 'important');
    
    // CRITICAL FIX: Remove any inline styles that might have hidden messages
    chatMessages.querySelectorAll('[style*="visibility: hidden"], [style*="opacity: 0"]').forEach(el => {
      if (!el.classList.contains('chat-loading-overlay') && !el.classList.contains('chat-loading-indicator')) {
        el.style.removeProperty('visibility');
        el.style.removeProperty('opacity');
      }
    });
    
    // CRITICAL FIX: Wait a bit before checking for empty state to avoid showing "no messages" too early
    // This prevents the "no messages → loading → blank → messages" flickering
    setTimeout(() => {
      // Check for empty state after a brief delay to ensure messages have time to render
      const allMessagesAfterDelay = chatMessages.querySelectorAll('.message, [data-message-id]');
      const hasMessages = allMessagesAfterDelay.length > 0;
      
      if (!hasMessages) {
        console.log('ℹ️ CHAT_PATCH: No messages found after delay - showing empty state');
        // Show empty state message
        const existingEmptyState = chatMessages.querySelector('.empty-state-message');
        if (!existingEmptyState) {
          const emptyState = document.createElement('p');
          emptyState.className = 'empty-state-message';
          emptyState.style.cssText = 'text-align: center; color: var(--text-secondary, #999); padding: 20px; visibility: visible !important; opacity: 1 !important; display: block !important;';
          emptyState.textContent = 'No messages yet. Be the first to start the conversation!';
          chatMessages.appendChild(emptyState);
        }
      } else {
        // Remove empty state if messages exist
        const emptyState = chatMessages.querySelector('.empty-state-message');
        if (emptyState) {
          emptyState.remove();
        }
      }
    }, 100); // Small delay to allow messages to render
    
    console.log('✅ CHAT_PATCH: Loading overlay hidden after', (performance.now() - state.startTime).toFixed(0), 'ms');
    console.log('✅ CHAT_PATCH: Made', allMessages.length, 'messages visible');
  }

  function waitForLoadChatHistory() {
    if (typeof window.loadChatHistory !== 'function') {
      return;
    }

    const originalLoadChatHistory = window.loadChatHistory;
    let activeLoadState = null;
    
    window.loadChatHistory = async function patchedLoadChatHistory(...args) {
      // CRITICAL FIX: Check if already loading via original function's flag
      const isAlreadyLoading = window.__isLoadingChatHistory ? window.__isLoadingChatHistory() : false;
      
      // CRITICAL FIX: Prevent concurrent calls - return immediately if already loading
      if (activeLoadState || isAlreadyLoading) {
        console.log('⚠️ CHAT_PATCH: Already loading, skipping duplicate call');
        return;
      }
      
      const chatMessages = document.querySelector('.chat-messages');
      const loadingState = showLoading(chatMessages);
      activeLoadState = loadingState;
      
      // CRITICAL FIX: Track load start time for stuck overlay detection
      window.__lastLoadStartTime = performance.now();
      
      try {
        const result = await originalLoadChatHistory.apply(this, args);
        // CRITICAL FIX: Don't add extra delay - messages are already loaded and visible
        // The minimum duration is already enforced in hideLoading
        return result;
      } catch (error) {
        console.error('❌ CHAT_PATCH: Error in loadChatHistory, forcing overlay cleanup:', error);
        // Force cleanup on error
        if (loadingState && chatMessages) {
          forceHideAllOverlays();
          // CRITICAL FIX: Also restore visibility on error
          chatMessages.style.visibility = 'visible';
          chatMessages.style.opacity = '1';
        }
        throw error;
      } finally {
        // CRITICAL FIX: Always cleanup overlay, even if there was an error
        // Use setTimeout to ensure this runs even if hideLoading hangs
        const cleanupTimeout = setTimeout(() => {
          console.warn('⚠️ CHAT_PATCH: Cleanup timeout - forcing immediate overlay removal');
          forceHideAllOverlays();
        }, 2000); // 2 second timeout
        
        if (loadingState && chatMessages) {
          try {
            await hideLoading(chatMessages, loadingState);
            clearTimeout(cleanupTimeout);
          } catch (cleanupError) {
            console.error('❌ CHAT_PATCH: Error hiding overlay, forcing cleanup:', cleanupError);
            clearTimeout(cleanupTimeout);
            forceHideAllOverlays();
          }
        } else {
          clearTimeout(cleanupTimeout);
          // No loading state but force cleanup anyway
          forceHideAllOverlays();
        }
        activeLoadState = null;
      }
    };
    console.log('✅ CHAT_PATCH: Wrapped loadChatHistory with loading overlay');
  }

  function waitForAddMessageToChat() {
    if (typeof window.addMessageToChat !== 'function') {
      return;
    }

    const originalAddMessageToChat = window.addMessageToChat;
    window.addMessageToChat = async function patchedAddMessageToChat(message) {
      const result = await originalAddMessageToChat.apply(this, arguments);
      ensureReplyVisible(message);
      return result;
    };
    console.log('✅ CHAT_PATCH: Wrapped addMessageToChat with reply visibility check');
  }

  function ensureReplyVisible(message) {
    if (!message || !message.isReply) return;
    const chatMessages = document.querySelector('.chat-messages');
    if (!chatMessages || chatMessages.dataset.focusMode !== 'true') {
      return;
    }

    const messageId = message.id || message.messageId;
    if (!messageId) return;

    const existing = chatMessages.querySelector(`[data-message-id="${CSS.escape(messageId)}"]`);
    if (existing) {
      return;
    }

    // Reply should have been added but wasn't - log for debugging
    console.warn(`⚠️ CHAT_PATCH: Reply ${messageId} not found in DOM after addMessageToChat`);
  }

  // CRITICAL FIX: Emergency cleanup function to force-hide stuck overlays
  function forceHideAllOverlays() {
    const chatMessages = document.querySelector('.chat-messages');
    if (!chatMessages) {
      console.warn('⚠️ CHAT_PATCH: forceHideAllOverlays called but .chat-messages not found');
      return;
    }
    
    // Remove ALL possible overlay elements
    const allOverlays = chatMessages.querySelectorAll('.chat-loading-overlay, .chat-loading-indicator, .loading-spinner, [class*="loading"]');
    allOverlays.forEach(overlay => {
      overlay.classList.add('hidden');
      overlay.style.setProperty('display', 'none', 'important');
      overlay.style.setProperty('visibility', 'hidden', 'important');
      overlay.style.setProperty('opacity', '0', 'important');
      overlay.style.setProperty('pointer-events', 'none', 'important');
      overlay.remove();
      console.log('🔧 CHAT_PATCH: Force-removed overlay:', overlay.className);
    });
    
    // Remove loading classes
    chatMessages.classList.remove('is-loading');
    chatMessages.removeAttribute('aria-busy');
    
    // CRITICAL FIX: Make container visible with !important
    chatMessages.style.setProperty('visibility', 'visible', 'important');
    chatMessages.style.setProperty('opacity', '1', 'important');
    chatMessages.style.setProperty('display', 'block', 'important');
    
    // CRITICAL FIX: Make ALL messages visible
    const allMessages = chatMessages.querySelectorAll('.message, [data-message-id]');
    allMessages.forEach(msg => {
      msg.style.setProperty('display', 'flex', 'important');
      msg.style.setProperty('visibility', 'visible', 'important');
      msg.style.setProperty('opacity', '1', 'important');
    });
    
    console.log('🔧 CHAT_PATCH: Force-hid all overlays and made', allMessages.length, 'messages visible');
  }

  // Expose cleanup function globally for emergency use
  window.forceHideChatLoadingOverlay = forceHideAllOverlays;

  // CRITICAL FIX: Auto-cleanup stuck overlays after 5 seconds
  // This catches cases where hideLoading never gets called
  function checkForStuckOverlay() {
    const chatMessages = document.querySelector('.chat-messages');
    if (!chatMessages) return;
    
    const hasOverlay = chatMessages.querySelector('.chat-loading-overlay, .chat-loading-indicator, .loading-spinner');
    const isStuck = chatMessages.classList.contains('is-loading') || hasOverlay;
    
    if (isStuck) {
      const stuckTime = performance.now() - (window.__lastLoadStartTime || 0);
      if (stuckTime > 5000) { // 5 seconds
        console.warn('⚠️ CHAT_PATCH: Detected stuck overlay after 5 seconds, forcing cleanup');
        forceHideAllOverlays();
      }
    }
  }
  
  // Run check every 2 seconds
  setInterval(checkForStuckOverlay, 2000);

  // Wait for DOM and functions to be available
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      waitForLoadChatHistory();
      waitForAddMessageToChat();
    });
  } else {
    waitForLoadChatHistory();
    waitForAddMessageToChat();
  }
})();

