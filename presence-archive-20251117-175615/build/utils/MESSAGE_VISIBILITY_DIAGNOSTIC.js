/**
 * MESSAGE VISIBILITY DIAGNOSTIC
 * 
 * Comprehensive diagnostic to find why messages aren't visible
 * This will check DOM, styles, computed styles, and all possible blockers
 */

(function() {
  console.log('🔍 MESSAGE_VISIBILITY_DIAGNOSTIC: Starting comprehensive diagnostic...');
  
  function runDiagnostic() {
    const results = {
      timestamp: new Date().toISOString(),
      chatMessagesContainer: null,
      messages: [],
      visibilityIssues: [],
      styleIssues: [],
      cssIssues: [],
      recommendations: []
    };
    
    // 1. Check chat-messages container
    const chatMessages = document.querySelector('.chat-messages');
    if (!chatMessages) {
      results.visibilityIssues.push('❌ CRITICAL: .chat-messages container not found in DOM');
      results.recommendations.push('The chat container element is missing. Check if HTML is loaded correctly.');
      console.error('❌ MESSAGE_VISIBILITY_DIAGNOSTIC: .chat-messages container not found');
      return results;
    }
    
    results.chatMessagesContainer = {
      exists: true,
      id: chatMessages.id,
      className: chatMessages.className,
      innerHTML: chatMessages.innerHTML.substring(0, 200),
      childrenCount: chatMessages.children.length,
      inlineStyles: {
        display: chatMessages.style.display,
        visibility: chatMessages.style.visibility,
        opacity: chatMessages.style.opacity,
        position: chatMessages.style.position
      },
      computedStyles: {
        display: window.getComputedStyle(chatMessages).display,
        visibility: window.getComputedStyle(chatMessages).visibility,
        opacity: window.getComputedStyle(chatMessages).opacity,
        position: window.getComputedStyle(chatMessages).position,
        width: window.getComputedStyle(chatMessages).width,
        height: window.getComputedStyle(chatMessages).height
      }
    };
    
    // Check container visibility
    if (results.chatMessagesContainer.computedStyles.visibility === 'hidden') {
      results.visibilityIssues.push(`❌ Container visibility is hidden (computed: ${results.chatMessagesContainer.computedStyles.visibility})`);
    }
    if (results.chatMessagesContainer.computedStyles.opacity === '0') {
      results.visibilityIssues.push(`❌ Container opacity is 0 (computed: ${results.chatMessagesContainer.computedStyles.opacity})`);
    }
    if (results.chatMessagesContainer.computedStyles.display === 'none') {
      results.visibilityIssues.push(`❌ Container display is none (computed: ${results.chatMessagesContainer.computedStyles.display})`);
    }
    
    // 2. Check all message elements
    const allMessages = chatMessages.querySelectorAll('.message, [data-message-id]');
    console.log(`🔍 MESSAGE_VISIBILITY_DIAGNOSTIC: Found ${allMessages.length} message elements`);
    
    allMessages.forEach((msg, index) => {
      const messageId = msg.getAttribute('data-message-id') || msg.dataset.messageId || `message-${index}`;
      const computed = window.getComputedStyle(msg);
      
      const messageInfo = {
        id: messageId,
        element: msg.tagName,
        className: msg.className,
        hasContent: msg.textContent.trim().length > 0,
        inlineStyles: {
          display: msg.style.display,
          visibility: msg.style.visibility,
          opacity: msg.style.opacity
        },
        computedStyles: {
          display: computed.display,
          visibility: computed.visibility,
          opacity: computed.opacity,
          width: computed.width,
          height: computed.height,
          position: computed.position
        },
        dimensions: {
          offsetWidth: msg.offsetWidth,
          offsetHeight: msg.offsetHeight,
          clientWidth: msg.clientWidth,
          clientHeight: msg.clientHeight
        },
        isVisible: computed.display !== 'none' && 
                  computed.visibility !== 'hidden' && 
                  computed.opacity !== '0' &&
                  msg.offsetWidth > 0 &&
                  msg.offsetHeight > 0
      };
      
      results.messages.push(messageInfo);
      
      // Check for visibility issues
      if (computed.display === 'none') {
        results.visibilityIssues.push(`❌ Message ${messageId}: display is none`);
      }
      if (computed.visibility === 'hidden') {
        results.visibilityIssues.push(`❌ Message ${messageId}: visibility is hidden`);
      }
      if (computed.opacity === '0') {
        results.visibilityIssues.push(`❌ Message ${messageId}: opacity is 0`);
      }
      if (msg.offsetWidth === 0 || msg.offsetHeight === 0) {
        results.visibilityIssues.push(`❌ Message ${messageId}: has zero dimensions (${msg.offsetWidth}x${msg.offsetHeight})`);
      }
    });
    
    // 3. Check for CSS rules that might be hiding messages
    const stylesheets = Array.from(document.styleSheets);
    stylesheets.forEach((sheet, sheetIndex) => {
      try {
        const rules = Array.from(sheet.cssRules || sheet.rules || []);
        rules.forEach((rule, ruleIndex) => {
          if (rule.selectorText) {
            const selectors = rule.selectorText.split(',').map(s => s.trim());
            selectors.forEach(selector => {
              if (selector.includes('.message') || selector.includes('.chat-messages')) {
                if (rule.style && (rule.style.display === 'none' || 
                    rule.style.visibility === 'hidden' || 
                    rule.style.opacity === '0')) {
                  results.cssIssues.push({
                    selector: selector,
                    rule: rule.cssText,
                    sheetIndex: sheetIndex,
                    ruleIndex: ruleIndex
                  });
                }
              }
            });
          }
        });
      } catch (e) {
        // Cross-origin stylesheet, skip
      }
    });
    
    // 4. Check for overlay blocking
    const overlays = chatMessages.querySelectorAll('.chat-loading-overlay, .chat-loading-indicator, .loading-spinner');
    if (overlays.length > 0) {
      overlays.forEach(overlay => {
        const computed = window.getComputedStyle(overlay);
        if (computed.display !== 'none' && computed.visibility !== 'hidden') {
          results.visibilityIssues.push(`⚠️ Overlay still visible: ${overlay.className}`);
        }
      });
    }
    
    // 5. Generate recommendations
    if (results.visibilityIssues.length === 0 && results.messages.length === 0) {
      results.recommendations.push('✅ No visibility issues found, but no messages in DOM. Check if messages are being loaded from API.');
    } else if (results.visibilityIssues.length > 0) {
      results.recommendations.push('🔧 FIX: Force visibility on all messages and container');
      results.recommendations.push('🔧 FIX: Check CSS rules that might be hiding messages');
      results.recommendations.push('🔧 FIX: Ensure loading overlay is removed');
    }
    
    // 6. Print comprehensive report
    console.group('🔍 MESSAGE_VISIBILITY_DIAGNOSTIC: Complete Report');
    console.log('Container:', results.chatMessagesContainer);
    console.log(`Messages found: ${results.messages.length}`);
    console.log('Messages:', results.messages);
    console.log('Visibility Issues:', results.visibilityIssues);
    console.log('CSS Issues:', results.cssIssues);
    console.log('Recommendations:', results.recommendations);
    console.groupEnd();
    
    // 7. Auto-fix if possible
    if (results.visibilityIssues.length > 0) {
      console.log('🔧 MESSAGE_VISIBILITY_DIAGNOSTIC: Attempting auto-fix...');
      
      // Fix container
      if (results.chatMessagesContainer.computedStyles.visibility === 'hidden' || 
          results.chatMessagesContainer.computedStyles.opacity === '0') {
        chatMessages.style.setProperty('visibility', 'visible', 'important');
        chatMessages.style.setProperty('opacity', '1', 'important');
        console.log('✅ MESSAGE_VISIBILITY_DIAGNOSTIC: Fixed container visibility');
      }
      
      // Fix all messages
      allMessages.forEach(msg => {
        const computed = window.getComputedStyle(msg);
        if (computed.display === 'none' || computed.visibility === 'hidden' || computed.opacity === '0') {
          msg.style.setProperty('display', 'flex', 'important');
          msg.style.setProperty('visibility', 'visible', 'important');
          msg.style.setProperty('opacity', '1', 'important');
          console.log(`✅ MESSAGE_VISIBILITY_DIAGNOSTIC: Fixed message ${msg.getAttribute('data-message-id') || 'unknown'}`);
        }
      });
      
      // Remove overlays
      overlays.forEach(overlay => {
        overlay.style.setProperty('display', 'none', 'important');
        overlay.style.setProperty('visibility', 'hidden', 'important');
        overlay.remove();
        console.log('✅ MESSAGE_VISIBILITY_DIAGNOSTIC: Removed overlay');
      });
      
      console.log('✅ MESSAGE_VISIBILITY_DIAGNOSTIC: Auto-fix complete. Re-run diagnostic to verify.');
    }
    
    return results;
  }
  
  // Run immediately
  const results = runDiagnostic();
  
  // Expose for manual calls
  window.messageVisibilityDiagnostic = runDiagnostic;
  
  // Auto-run every 2 seconds for 10 seconds to catch timing issues
  let runCount = 0;
  const interval = setInterval(() => {
    runCount++;
    if (runCount <= 5) {
      console.log(`🔍 MESSAGE_VISIBILITY_DIAGNOSTIC: Auto-check ${runCount}/5...`);
      runDiagnostic();
    } else {
      clearInterval(interval);
      console.log('✅ MESSAGE_VISIBILITY_DIAGNOSTIC: Auto-checks complete. Call window.messageVisibilityDiagnostic() manually to re-run.');
    }
  }, 2000);
  
  console.log('✅ MESSAGE_VISIBILITY_DIAGNOSTIC: Diagnostic loaded. Call window.messageVisibilityDiagnostic() to re-run.');
})();

