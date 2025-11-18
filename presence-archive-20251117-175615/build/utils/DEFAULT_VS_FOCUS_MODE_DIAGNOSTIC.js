/**
 * DEFAULT VS FOCUS MODE DIAGNOSTIC
 * 
 * Compares default mode (where replies are detected) vs focus mode (where replies don't display)
 * to identify why replies show in default but not in focus mode.
 */

(function() {
  console.log('🔍 DEFAULT_VS_FOCUS: Starting diagnostic...');
  
  let diagnosticState = {
    defaultMode: null,
    focusMode: null,
    comparisons: []
  };
  
  function captureDefaultModeState() {
    const state = {
      timestamp: new Date().toISOString(),
      mode: 'default',
      chatMessages: null,
      messages: [],
      replies: [],
      currentChatData: null,
      replyCounts: {},
      hasReplies: {}
    };
    
    const chatMessages = document.querySelector('.chat-messages');
    if (chatMessages) {
      state.chatMessages = {
        exists: true,
        focusMode: chatMessages.dataset.focusMode || 'false',
        isLoading: chatMessages.classList.contains('is-loading'),
        childrenCount: chatMessages.children.length
      };
      
      // Get all messages
      const messageElements = chatMessages.querySelectorAll('.message');
      state.messages = Array.from(messageElements).map(el => {
        const messageId = el.dataset.messageId || el.id;
        const isReply = el.classList.contains('message-reply');
        const hasRepliesIndicator = el.querySelector('.reply-count, .has-replies');
        
        return {
          id: messageId,
          isReply,
          hasRepliesIndicator: !!hasRepliesIndicator,
          replyCountText: hasRepliesIndicator?.textContent || null,
          visible: window.getComputedStyle(el).visibility !== 'hidden',
          display: window.getComputedStyle(el).display
        };
      });
      
      // Check for reply indicators
      messageElements.forEach(el => {
        const messageId = el.dataset.messageId || el.id;
        if (messageId) {
          const replyCountEl = el.querySelector('.reply-count');
          const hasRepliesEl = el.querySelector('.has-replies');
          
          if (replyCountEl || hasRepliesEl) {
            state.replies.push({
              messageId,
              replyCount: replyCountEl?.textContent || null,
              hasReplies: !!hasRepliesEl,
              replyCountText: replyCountEl?.textContent || hasRepliesEl?.textContent
            });
          }
        }
      });
    }
    
    // Check currentChatData
    if (window.currentChatData) {
      state.currentChatData = window.currentChatData.map(m => ({
        id: m.id,
        hasReplies: m.hasReplies,
        replyCount: m.replyCount,
        parentId: m.parentId,
        isReply: m.isReply
      }));
      
      // Build reply counts
      window.currentChatData.forEach(m => {
        if (!m.isReply && (m.hasReplies || m.replyCount > 0)) {
          state.replyCounts[m.id] = {
            hasReplies: m.hasReplies,
            replyCount: m.replyCount
          };
        }
      });
    }
    
    return state;
  }
  
  function captureFocusModeState() {
    const state = {
      timestamp: new Date().toISOString(),
      mode: 'focus',
      chatMessages: null,
      focusedMessage: null,
      messages: [],
      replies: [],
      replyLoader: null,
      currentChatData: null
    };
    
    const chatMessages = document.querySelector('.chat-messages');
    if (chatMessages) {
      state.chatMessages = {
        exists: true,
        focusMode: chatMessages.dataset.focusMode || 'false',
        isLoading: chatMessages.classList.contains('is-loading'),
        childrenCount: chatMessages.children.length
      };
      
      // Get focused message
      const focusedMessageEl = chatMessages.querySelector('.message:not(.message-reply)');
      if (focusedMessageEl) {
        const focusedId = focusedMessageEl.dataset.messageId || focusedMessageEl.id;
        state.focusedMessage = {
          id: focusedId,
          hasRepliesIndicator: !!focusedMessageEl.querySelector('.reply-count, .has-replies'),
          replyCountText: focusedMessageEl.querySelector('.reply-count')?.textContent || null
        };
      }
      
      // Get all messages (including replies)
      const messageElements = chatMessages.querySelectorAll('.message');
      state.messages = Array.from(messageElements).map(el => {
        const messageId = el.dataset.messageId || el.id;
        const isReply = el.classList.contains('message-reply');
        
        return {
          id: messageId,
          isReply,
          visible: window.getComputedStyle(el).visibility !== 'hidden',
          display: window.getComputedStyle(el).display,
          parentId: el.dataset.parentId || null
        };
      });
      
      // Get replies
      const replyElements = chatMessages.querySelectorAll('.message-reply');
      state.replies = Array.from(replyElements).map(el => ({
        id: el.dataset.messageId || el.id,
        parentId: el.dataset.parentId || null,
        visible: window.getComputedStyle(el).visibility !== 'hidden',
        display: window.getComputedStyle(el).display
      }));
    }
    
    // Check ReplyLoader
    if (window.ReplyLoader) {
      state.replyLoader = {
        available: true,
        loadAllReplies: typeof window.ReplyLoader.loadAllReplies === 'function'
      };
    }
    
    // Check currentChatData
    if (window.currentChatData) {
      state.currentChatData = window.currentChatData.map(m => ({
        id: m.id,
        hasReplies: m.hasReplies,
        replyCount: m.replyCount,
        parentId: m.parentId,
        isReply: m.isReply
      }));
    }
    
    return state;
  }
  
  function compareStates(defaultState, focusState) {
    const comparisons = [];
    
    // Compare reply detection
    if (defaultState.replyCounts && Object.keys(defaultState.replyCounts).length > 0) {
      const defaultReplyMessages = Object.keys(defaultState.replyCounts);
      comparisons.push({
        type: 'reply_detection',
        default: `Found ${defaultReplyMessages.length} messages with replies in default mode`,
        focus: `Found ${focusState.replies.length} replies in DOM in focus mode`,
        issue: defaultReplyMessages.length > 0 && focusState.replies.length === 0 ? 
          '❌ Replies detected in default mode but not displayed in focus mode' : 
          '✅ Reply counts match'
      });
      
      // Check specific messages
      defaultReplyMessages.forEach(msgId => {
        const defaultInfo = defaultState.replyCounts[msgId];
        const focusReply = focusState.replies.find(r => r.parentId === msgId);
        
        comparisons.push({
          type: 'message_reply_check',
          messageId: msgId,
          default: `hasReplies: ${defaultInfo.hasReplies}, replyCount: ${defaultInfo.replyCount}`,
          focus: focusReply ? `Reply found in DOM (visible: ${focusReply.visible})` : '❌ No reply in DOM',
          issue: !focusReply ? `❌ Message ${msgId} has replies in default mode but no replies in focus mode DOM` : '✅ Reply found'
        });
      });
    }
    
    // Compare currentChatData
    if (defaultState.currentChatData && focusState.currentChatData) {
      const defaultWithReplies = defaultState.currentChatData.filter(m => m.hasReplies || m.replyCount > 0);
      const focusWithReplies = focusState.currentChatData.filter(m => m.hasReplies || m.replyCount > 0);
      
      comparisons.push({
        type: 'chat_data_comparison',
        default: `${defaultWithReplies.length} messages with replies in currentChatData`,
        focus: `${focusWithReplies.length} messages with replies in currentChatData`,
        issue: defaultWithReplies.length !== focusWithReplies.length ? 
          '❌ Reply counts differ between modes' : 
          '✅ Reply counts match in currentChatData'
      });
    }
    
    // Compare DOM state
    comparisons.push({
      type: 'dom_state',
      default: `${defaultState.messages.length} messages in DOM`,
      focus: `${focusState.messages.length} messages in DOM (${focusState.replies.length} replies)`,
      issue: focusState.replies.length === 0 && defaultState.replyCounts && Object.keys(defaultState.replyCounts).length > 0 ?
        '❌ Replies exist in default mode but not in focus mode DOM' :
        '✅ DOM state consistent'
    });
    
    return comparisons;
  }
  
  function runDiagnostic() {
    console.log('🔍 DEFAULT_VS_FOCUS: Capturing default mode state...');
    const defaultState = captureDefaultModeState();
    diagnosticState.defaultMode = defaultState;
    
    console.log('🔍 DEFAULT_VS_FOCUS: Default mode state:', defaultState);
    
    // Wait for focus mode if not already in it
    if (!document.querySelector('.chat-messages')?.dataset.focusMode === 'true') {
      console.log('ℹ️ DEFAULT_VS_FOCUS: Not in focus mode. Click a message to enter focus mode, then call compareWithFocusMode()');
      return defaultState;
    }
    
    console.log('🔍 DEFAULT_VS_FOCUS: Capturing focus mode state...');
    const focusState = captureFocusModeState();
    diagnosticState.focusMode = focusState;
    
    console.log('🔍 DEFAULT_VS_FOCUS: Focus mode state:', focusState);
    
    const comparisons = compareStates(defaultState, focusState);
    diagnosticState.comparisons = comparisons;
    
    console.log('🔍 DEFAULT_VS_FOCUS: Comparisons:', comparisons);
    
    // Print summary
    console.log('\n═══════════════════════════════════════════════════════════');
    console.log('📊 DEFAULT VS FOCUS MODE DIAGNOSTIC SUMMARY');
    console.log('═══════════════════════════════════════════════════════════');
    comparisons.forEach(comp => {
      console.log(`\n${comp.type.toUpperCase()}:`);
      console.log(`  Default: ${comp.default}`);
      console.log(`  Focus: ${comp.focus}`);
      console.log(`  ${comp.issue}`);
    });
    console.log('\n═══════════════════════════════════════════════════════════\n');
    
    return { defaultState, focusState, comparisons };
  }
  
  function compareWithFocusMode() {
    if (!diagnosticState.defaultMode) {
      console.log('⚠️ DEFAULT_VS_FOCUS: Default mode state not captured. Call runDiagnostic() first in default mode.');
      return;
    }
    
    const focusState = captureFocusModeState();
    diagnosticState.focusMode = focusState;
    
    const comparisons = compareStates(diagnosticState.defaultMode, focusState);
    diagnosticState.comparisons = comparisons;
    
    console.log('🔍 DEFAULT_VS_FOCUS: Focus mode comparison:', comparisons);
    
    // Print summary
    console.log('\n═══════════════════════════════════════════════════════════');
    console.log('📊 DEFAULT VS FOCUS MODE COMPARISON');
    console.log('═══════════════════════════════════════════════════════════');
    comparisons.forEach(comp => {
      console.log(`\n${comp.type.toUpperCase()}:`);
      console.log(`  Default: ${comp.default}`);
      console.log(`  Focus: ${comp.focus}`);
      console.log(`  ${comp.issue}`);
    });
    console.log('\n═══════════════════════════════════════════════════════════\n');
    
    return { defaultState: diagnosticState.defaultMode, focusState, comparisons };
  }
  
  // Export functions
  window.defaultVsFocusDiagnostic = {
    run: runDiagnostic,
    compare: compareWithFocusMode,
    getState: () => diagnosticState
  };
  
  // Auto-run if in default mode
  function autoRunDiagnostic() {
    const chatMessages = document.querySelector('.chat-messages');
    if (!chatMessages) {
      // Retry if chat messages container not ready yet
      setTimeout(autoRunDiagnostic, 1000);
      return;
    }
    
    if (chatMessages.dataset.focusMode !== 'true') {
      // In default mode - capture state
      console.log('🔍 DEFAULT_VS_FOCUS: Auto-running diagnostic in default mode...');
      runDiagnostic();
    } else {
      // In focus mode - compare if we have default state
      if (diagnosticState.defaultMode) {
        console.log('🔍 DEFAULT_VS_FOCUS: Auto-comparing with focus mode...');
        compareWithFocusMode();
      }
    }
  }
  
  // Watch for focus mode changes
  let lastFocusMode = null;
  function watchFocusMode() {
    const chatMessages = document.querySelector('.chat-messages');
    if (chatMessages) {
      const currentFocusMode = chatMessages.dataset.focusMode === 'true';
      if (currentFocusMode !== lastFocusMode) {
        lastFocusMode = currentFocusMode;
        if (currentFocusMode && diagnosticState.defaultMode) {
          // Just entered focus mode - auto-compare
          setTimeout(() => {
            console.log('🔍 DEFAULT_VS_FOCUS: Detected focus mode entry, auto-comparing...');
            compareWithFocusMode();
          }, 1000);
        } else if (!currentFocusMode) {
          // Just exited focus mode - capture default state again
          setTimeout(() => {
            console.log('🔍 DEFAULT_VS_FOCUS: Detected exit from focus mode, capturing default state...');
            runDiagnostic();
          }, 500);
        }
      }
    }
    setTimeout(watchFocusMode, 500);
  }
  
  // Initial run
  if (document.readyState === 'complete') {
    setTimeout(autoRunDiagnostic, 2000);
    watchFocusMode();
  } else {
    window.addEventListener('load', () => {
      setTimeout(autoRunDiagnostic, 2000);
      watchFocusMode();
    });
  }
  
  console.log('✅ DEFAULT_VS_FOCUS: Diagnostic ready and auto-running. State captured automatically.');
})();

