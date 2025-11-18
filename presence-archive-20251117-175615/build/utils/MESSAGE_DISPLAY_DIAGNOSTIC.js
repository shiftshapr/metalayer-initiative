/**
 * MESSAGE DISPLAY DIAGNOSTIC
 * 
 * Diagnoses why messages are not displaying after loadChatHistory completes
 */

(function() {
  console.log('🔍 MESSAGE_DIAG: Starting message display diagnostic...');
  
  function diagnoseMessageDisplay() {
    const results = {
      timestamp: new Date().toISOString(),
      chatMessages: null,
      overlay: null,
      messages: [],
      isLoading: null,
      conversations: null,
      apiResponse: null
    };
    
    // Check chat messages container
    const chatMessages = document.querySelector('.chat-messages');
    results.chatMessages = {
      exists: !!chatMessages,
      visible: chatMessages ? window.getComputedStyle(chatMessages).visibility : null,
      opacity: chatMessages ? window.getComputedStyle(chatMessages).opacity : null,
      display: chatMessages ? window.getComputedStyle(chatMessages).display : null,
      isLoading: chatMessages ? chatMessages.classList.contains('is-loading') : null,
      focusMode: chatMessages ? chatMessages.dataset.focusMode : null,
      childrenCount: chatMessages ? chatMessages.children.length : null
    };
    
    // Check overlay
    if (chatMessages) {
      const overlay = chatMessages.querySelector('.chat-loading-overlay');
      results.overlay = {
        exists: !!overlay,
        hidden: overlay ? overlay.classList.contains('hidden') : null,
        visible: overlay ? window.getComputedStyle(overlay).display !== 'none' : null
      };
    }
    
    // Check messages in DOM
    if (chatMessages) {
      const messageElements = chatMessages.querySelectorAll('.message');
      results.messages = {
        count: messageElements.length,
        ids: Array.from(messageElements).map(el => el.dataset.messageId || el.id).filter(Boolean),
        visible: Array.from(messageElements).map(el => {
          const style = window.getComputedStyle(el);
          return {
            id: el.dataset.messageId || el.id,
            visibility: style.visibility,
            opacity: style.opacity,
            display: style.display
          };
        })
      };
    }
    
    // Check loading state
    results.isLoading = {
      flag: window.__isLoadingChatHistory ? window.__isLoadingChatHistory() : 'function not available',
      isLoadingChatHistory: typeof window.isLoadingChatHistory !== 'undefined' ? window.isLoadingChatHistory : 'not exposed'
    };
    
    // Check currentChatData
    results.currentChatData = {
      exists: !!window.currentChatData,
      count: window.currentChatData ? window.currentChatData.length : 0,
      messages: window.currentChatData ? window.currentChatData.map(m => ({
        id: m.id,
        body: m.body?.substring(0, 50),
        hasReplies: m.hasReplies,
        replyCount: m.replyCount
      })) : []
    };
    
    // Check last loaded URI
    results.lastLoadedUri = {
      value: typeof window.lastLoadedUri !== 'undefined' ? window.lastLoadedUri : 'not exposed',
      currentPageId: window.currentUrlData?.pageId || null
    };
    
    console.log('🔍 MESSAGE_DIAG: Diagnostic results:', results);
    
    // Analysis
    const analysis = [];
    
    if (!results.chatMessages.exists) {
      analysis.push('❌ CRITICAL: .chat-messages container not found in DOM');
    }
    
    if (results.chatMessages.isLoading) {
      analysis.push('⚠️ WARNING: chat-messages has is-loading class - overlay may be blocking');
    }
    
    if (results.overlay && !results.overlay.hidden && results.overlay.visible) {
      analysis.push('⚠️ WARNING: Loading overlay is visible and not hidden - blocking messages');
    }
    
    if (results.messages.count === 0 && results.currentChatData.count > 0) {
      analysis.push('❌ CRITICAL: Messages exist in currentChatData but not in DOM');
    }
    
    if (results.messages.count === 0 && results.currentChatData.count === 0) {
      analysis.push('ℹ️ INFO: No messages in DOM or currentChatData - empty state expected');
    }
    
    if (results.isLoading.flag === true) {
      analysis.push('⚠️ WARNING: isLoadingChatHistory is still true - loading may not have completed');
    }
    
    if (results.messages.count > 0) {
      const hiddenMessages = results.messages.visible.filter(m => 
        m.visibility === 'hidden' || m.opacity === '0' || m.display === 'none'
      );
      if (hiddenMessages.length > 0) {
        analysis.push(`⚠️ WARNING: ${hiddenMessages.length} messages are hidden in DOM`);
      }
    }
    
    console.log('🔍 MESSAGE_DIAG: Analysis:', analysis);
    
    return { results, analysis };
  }
  
  // Run diagnostic
  const diagnostic = diagnoseMessageDisplay();
  
  // Export function for manual calls
  window.diagnoseMessageDisplay = diagnoseMessageDisplay;
  
  console.log('✅ MESSAGE_DIAG: Diagnostic complete. Call diagnoseMessageDisplay() to run again.');
})();

