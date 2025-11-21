/**
 * MESSAGE VISIBILITY DIAGNOSTIC
 * 
 * Comprehensive diagnostic to find why messages aren't visible
 * This will check DOM, styles, computed styles, and all possible blockers
 */

interface InlineStyles {
  display: string;
  visibility: string;
  opacity: string;
  position?: string;
}

interface ComputedStyles extends InlineStyles {
  width: string;
  height: string;
}

interface ChatMessagesContainer {
  exists: boolean;
  id: string;
  className: string;
  innerHTML: string;
  childrenCount: number;
  inlineStyles: InlineStyles;
  computedStyles: ComputedStyles;
}

interface MessageInfo {
  id: string;
  element: string;
  className: string;
  hasContent: boolean;
  inlineStyles: {
    display: string;
    visibility: string;
    opacity: string;
  };
  computedStyles: ComputedStyles;
  dimensions: {
    offsetWidth: number;
    offsetHeight: number;
    clientWidth: number;
    clientHeight: number;
  };
  isVisible: boolean;
}

interface CssIssue {
  selector: string;
  rule: string;
  sheetIndex: number;
  ruleIndex: number;
}

interface DiagnosticResults {
  timestamp: string;
  chatMessagesContainer: ChatMessagesContainer | null;
  messages: MessageInfo[];
  visibilityIssues: string[];
  styleIssues: string[];
  cssIssues: CssIssue[];
  recommendations: string[];
}

console.log('🔍 MESSAGE_VISIBILITY_DIAGNOSTIC: Starting comprehensive diagnostic...');

export function runMessageVisibilityDiagnostic(): DiagnosticResults {
  const results: DiagnosticResults = {
    timestamp: new Date().toISOString(),
    chatMessagesContainer: null,
    messages: [],
    visibilityIssues: [],
    styleIssues: [],
    cssIssues: [],
    recommendations: []
  };
  
  // 1. Check chat-messages container
  const chatMessages = document.querySelector('.chat-messages') as HTMLElement | null;
  if (!chatMessages) {
    results.visibilityIssues.push('❌ CRITICAL: .chat-messages container not found in DOM');
    results.recommendations.push('The chat container element is missing. Check if HTML is loaded correctly.');
    console.error('❌ MESSAGE_VISIBILITY_DIAGNOSTIC: .chat-messages container not found');
    return results;
  }
  
  const computed = window.getComputedStyle(chatMessages);
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
      display: computed.display,
      visibility: computed.visibility,
      opacity: computed.opacity,
      position: computed.position,
      width: computed.width,
      height: computed.height
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
    const element = msg as HTMLElement;
    const messageId = element.getAttribute('data-message-id') || element.dataset.messageId || `message-${index}`;
    const msgComputed = window.getComputedStyle(element);
    
    const messageInfo: MessageInfo = {
      id: messageId,
      element: element.tagName,
      className: element.className,
      hasContent: element.textContent?.trim().length ? element.textContent.trim().length > 0 : false,
      inlineStyles: {
        display: element.style.display,
        visibility: element.style.visibility,
        opacity: element.style.opacity
      },
      computedStyles: {
        display: msgComputed.display,
        visibility: msgComputed.visibility,
        opacity: msgComputed.opacity,
        width: msgComputed.width,
        height: msgComputed.height,
        position: msgComputed.position
      },
      dimensions: {
        offsetWidth: element.offsetWidth,
        offsetHeight: element.offsetHeight,
        clientWidth: element.clientWidth,
        clientHeight: element.clientHeight
      },
      isVisible: msgComputed.display !== 'none' && 
                msgComputed.visibility !== 'hidden' && 
                msgComputed.opacity !== '0' &&
                element.offsetWidth > 0 &&
                element.offsetHeight > 0
    };
    
    results.messages.push(messageInfo);
    
    // Check for visibility issues
    if (msgComputed.display === 'none') {
      results.visibilityIssues.push(`❌ Message ${messageId}: display is none`);
    }
    if (msgComputed.visibility === 'hidden') {
      results.visibilityIssues.push(`❌ Message ${messageId}: visibility is hidden`);
    }
    if (msgComputed.opacity === '0') {
      results.visibilityIssues.push(`❌ Message ${messageId}: opacity is 0`);
    }
    if (element.offsetWidth === 0 || element.offsetHeight === 0) {
      results.visibilityIssues.push(`❌ Message ${messageId}: has zero dimensions (${element.offsetWidth}x${element.offsetHeight})`);
    }
  });
  
  // 3. Check for CSS rules that might be hiding messages
  const stylesheets = Array.from(document.styleSheets);
  stylesheets.forEach((sheet, sheetIndex) => {
    try {
      const rules = Array.from(sheet.cssRules || (sheet as any).rules || []);
      rules.forEach((rule: CSSRule, ruleIndex) => {
        const styleRule = rule as CSSStyleRule;
        if (styleRule.selectorText) {
          const selectors = styleRule.selectorText.split(',').map(s => s.trim());
          selectors.forEach(selector => {
            if (selector.includes('.message') || selector.includes('.chat-messages')) {
              if (styleRule.style && (styleRule.style.display === 'none' || 
                  styleRule.style.visibility === 'hidden' || 
                  styleRule.style.opacity === '0')) {
                results.cssIssues.push({
                  selector: selector,
                  rule: styleRule.cssText,
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
      const overlayElement = overlay as HTMLElement;
      const overlayComputed = window.getComputedStyle(overlayElement);
      if (overlayComputed.display !== 'none' && overlayComputed.visibility !== 'hidden') {
        results.visibilityIssues.push(`⚠️ Overlay still visible: ${overlayElement.className}`);
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
    if (results.chatMessagesContainer && 
        (results.chatMessagesContainer.computedStyles.visibility === 'hidden' || 
         results.chatMessagesContainer.computedStyles.opacity === '0')) {
      chatMessages.style.setProperty('visibility', 'visible', 'important');
      chatMessages.style.setProperty('opacity', '1', 'important');
      console.log('✅ MESSAGE_VISIBILITY_DIAGNOSTIC: Fixed container visibility');
    }
    
    // Fix all messages
    allMessages.forEach(msg => {
      const element = msg as HTMLElement;
      const msgComputed = window.getComputedStyle(element);
      if (msgComputed.display === 'none' || msgComputed.visibility === 'hidden' || msgComputed.opacity === '0') {
        element.style.setProperty('display', 'flex', 'important');
        element.style.setProperty('visibility', 'visible', 'important');
        element.style.setProperty('opacity', '1', 'important');
        console.log(`✅ MESSAGE_VISIBILITY_DIAGNOSTIC: Fixed message ${element.getAttribute('data-message-id') || 'unknown'}`);
      }
    });
    
    // Remove overlays
    overlays.forEach(overlay => {
      const overlayElement = overlay as HTMLElement;
      overlayElement.style.setProperty('display', 'none', 'important');
      overlayElement.style.setProperty('visibility', 'hidden', 'important');
      overlayElement.remove();
      console.log('✅ MESSAGE_VISIBILITY_DIAGNOSTIC: Removed overlay');
    });
    
    console.log('✅ MESSAGE_VISIBILITY_DIAGNOSTIC: Auto-fix complete. Re-run diagnostic to verify.');
  }
  
  return results;
}

// Run immediately if in browser context
if (typeof document !== 'undefined') {
  const results = runMessageVisibilityDiagnostic();
  
  // Auto-run every 2 seconds for 10 seconds to catch timing issues
  let runCount = 0;
  const interval = setInterval(() => {
    runCount++;
    if (runCount <= 5) {
      console.log(`🔍 MESSAGE_VISIBILITY_DIAGNOSTIC: Auto-check ${runCount}/5...`);
      runMessageVisibilityDiagnostic();
    } else {
      clearInterval(interval);
      console.log('✅ MESSAGE_VISIBILITY_DIAGNOSTIC: Auto-checks complete. Call runMessageVisibilityDiagnostic() manually to re-run.');
    }
  }, 2000);
  
  console.log('✅ MESSAGE_VISIBILITY_DIAGNOSTIC: Diagnostic loaded. Call runMessageVisibilityDiagnostic() to re-run.');
}



