/**
 * DIAGNOSTIC: All Message Display Problems - Comprehensive Root Cause Analysis
 * 
 * Covers ALL identified problems:
 * 
 * TRIPLE LOADING:
 * 1. Messages load THREE times (one in reverse, two in correct order)
 * 2. All messages persist (duplicates)
 * 
 * TABS & SCROLL:
 * 3. Loading messages hides tabs
 * 4. Scroll substrate needs better treatment in dark mode
 * 
 * MESSAGE DISPLAY BUGS:
 * 5. Too much space under text
 * 6. Reactions and Bookmarks don't work
 * 7. Can't edit/delete own messages
 * 8. Messages are repeated
 * 9. New quote displays wrong (bottom, no quoted content, no avatar)
 * 10. Reply count not shown/updated
 * 11. Reply shows at bottom, should open Focus mode
 * 12. New message at top without avatar
 * 
 * Root cause analysis before fixing.
 */

/**
 * Run all diagnostics
 */
function runAllMessageDiagnostics() {
  const diagnostics = [];
  
  // TRIPLE LOADING ISSUES
  diagnostics.push(diagnoseMultipleLoadCalls());
  diagnostics.push(diagnoseRealtimeDuringLoad());
  diagnostics.push(diagnoseDuplicateDetection());
  diagnostics.push(diagnoseModuleUsage());
  diagnostics.push(diagnoseContainerClearing());
  
  // TABS & SCROLL ISSUES
  diagnostics.push(diagnoseTabsHiddenIssue());
  diagnostics.push(diagnoseScrollSubstrateIssue());
  
  // MESSAGE DISPLAY BUGS
  diagnostics.push(diagnoseSpacingIssue());
  diagnostics.push(diagnoseActionButtonsIssue());
  diagnostics.push(diagnoseEditDeleteIssue());
  diagnostics.push(diagnoseDuplicateMessagesIssue());
  diagnostics.push(diagnoseQuoteDisplayIssue());
  diagnostics.push(diagnoseReplyCountIssue());
  diagnostics.push(diagnoseReplyHandlingIssue());
  diagnostics.push(diagnoseNewMessageIssue());
  
  const critical = diagnostics.filter(d => d.severity === 'critical').length;
  const high = diagnostics.filter(d => d.severity === 'high').length;
  const medium = diagnostics.filter(d => d.severity === 'medium').length;
  
  console.log('=== ALL MESSAGE PROBLEMS - COMPREHENSIVE DIAGNOSTICS ===\n');
  
  diagnostics.forEach((diag, i) => {
    const severityIcon = diag.severity === 'critical' ? '🔴' : diag.severity === 'high' ? '🟡' : '🟢';
    console.log(`${i + 1}. ${severityIcon} ${diag.issue}`);
    console.log(`   Root Cause: ${diag.rootCause}`);
    console.log(`   Location: ${diag.location}`);
    console.log(`   Evidence:`);
    diag.evidence.forEach(ev => console.log(`     - ${ev}`));
    if (diag.codePath && diag.codePath.length > 0) {
      console.log(`   Code Path:`);
      diag.codePath.forEach(path => console.log(`     - ${path}`));
    }
    console.log(`   Recommendation: ${diag.recommendation}`);
    console.log('');
  });
  
  console.log(`=== SUMMARY ===`);
  console.log(`🔴 Critical: ${critical}`);
  console.log(`🟡 High: ${high}`);
  console.log(`🟢 Medium: ${medium}`);
  console.log(`Total Issues: ${diagnostics.length}`);
  
  return { diagnostics, summary: { critical, high, medium } };
}

// ============================================================================
// TRIPLE LOADING DIAGNOSTICS
// ============================================================================

function diagnoseMultipleLoadCalls() {
  const evidence = [];
  
  const loadChatHistory = window.loadChatHistory || (window.MessagesModule && window.MessagesModule.loadChatHistory);
  evidence.push(`loadChatHistory available: ${!!loadChatHistory}`);
  
  const callers = ['TabController', 'ui-realtime-bindings', 'CommunitiesModule', 'UIManager', 'Sidepanel'];
  callers.forEach(caller => {
    const module = window[caller] || window[caller.toLowerCase()];
    evidence.push(`${caller} available: ${!!module}`);
  });
  
  const stateManager = window.stateManagerInstance;
  if (stateManager) {
    const currentUrlData = stateManager.getState('currentUrlData');
    evidence.push(`currentUrlData in state: ${currentUrlData ? 'set' : 'not set'}`);
    if (currentUrlData) {
      evidence.push(`  pageId: ${currentUrlData.pageId || 'not set'}`);
    }
  }
  
  evidence.push(`From logs: loadChatHistory called multiple times`);
  evidence.push(`From logs: Messages loaded in reverse order first, then correct order twice`);
  
  return {
    issue: 'Multiple loadChatHistory calls',
    rootCause: 'loadChatHistory called from multiple places without coordination, debouncing, or loading flags',
    location: 'Multiple callers - no coordination',
    severity: 'critical',
    evidence,
    recommendation: 'Add loading flag/guard: 1) Check if already loading, 2) Debounce calls, 3) Clear container BEFORE loading, 4) Use single source (MessageLoadingService)',
    codePath: ['TabController.js', 'ui-realtime-bindings.js', 'CommunitiesModule.js', 'UIManager.ts', 'StateManager subscriptions']
  };
}

function diagnoseRealtimeDuringLoad() {
  const evidence = [];
  
  const supabaseClient = window.supabaseRealtimeClient || window.supabase;
  evidence.push(`Supabase real-time client available: ${!!supabaseClient}`);
  
  const hasOnMessageUpdate = typeof window.onMessageUpdate === 'function' || 
                             (window.CanopiModule && typeof window.CanopiModule.onMessageUpdate === 'function');
  evidence.push(`onMessageUpdate handler available: ${!!hasOnMessageUpdate}`);
  
  evidence.push(`From logs: onMessageUpdate triggered twice with same 10 messages`);
  evidence.push(`From logs: 'Initial message loading, bypassing deduplication'`);
  evidence.push(`Real-time subscription fires during/after initial load, causing duplicates`);
  
  return {
    issue: 'Real-time subscription triggering during initial load',
    rootCause: 'Real-time subscription (onMessageUpdate) receives messages while loadChatHistory is loading, causing duplicate additions. No coordination between initial load and real-time updates.',
    location: 'CanopiModule.js - onMessageUpdate handler and real-time subscription setup',
    severity: 'critical',
    evidence,
    recommendation: 'Coordinate initial load and real-time: 1) Set loading flag during loadChatHistory, 2) Skip real-time updates during initial load, 3) Mark initial load complete before enabling real-time, 4) Deduplicate in onMessageUpdate using state (not DOM)',
    codePath: ['CanopiModule.js - onMessageUpdate()', 'SupabaseRealtimeClient.js - subscription', 'loadChatHistory() - loading flag']
  };
}

function diagnoseDuplicateDetection() {
  const evidence = [];
  
  const stateManager = window.stateManagerInstance;
  if (stateManager) {
    const chatData = stateManager.getState('chat.data');
    if (Array.isArray(chatData)) {
      const messageIds = chatData.map(m => m.id);
      const uniqueIds = new Set(messageIds);
      const duplicates = messageIds.filter((id, index) => messageIds.indexOf(id) !== index);
      
      evidence.push(`State messages: ${chatData.length}`);
      evidence.push(`Unique message IDs: ${uniqueIds.size}`);
      evidence.push(`Duplicate IDs in state: ${duplicates.length}`);
      if (duplicates.length > 0) {
        evidence.push(`  Duplicate IDs: ${duplicates.slice(0, 5).join(', ')}`);
      }
    }
  }
  
  const chatMessages = document.querySelector('.chat-messages');
  if (chatMessages) {
    const messageElements = chatMessages.querySelectorAll('[data-message-id]');
    const domIds = Array.from(messageElements).map(el => el.getAttribute('data-message-id'));
    const uniqueDomIds = new Set(domIds);
    const domDuplicates = domIds.filter((id, index) => domIds.indexOf(id) !== index);
    
    evidence.push(`DOM message elements: ${messageElements.length}`);
    evidence.push(`Unique DOM IDs: ${uniqueDomIds.size}`);
    evidence.push(`Duplicate IDs in DOM: ${domDuplicates.length}`);
    if (domDuplicates.length > 0) {
      evidence.push(`  Duplicate DOM IDs: ${domDuplicates.slice(0, 5).join(', ')}`);
    }
  }
  
  evidence.push(`From logs: 'Initial message loading, bypassing deduplication'`);
  evidence.push(`From logs: 'UnifiedMessageDisplay: Rendered 10 new messages, 30 actual message elements in container'`);
  evidence.push(`⚠️ Container has 3x more messages than expected!`);
  
  return {
    issue: 'Duplicate detection failing',
    rootCause: 'Duplicate detection bypassed during initial load, checks DOM instead of state, or container not cleared before loading, allowing duplicates to accumulate',
    location: 'CanopiModule.js - addMessageToChat() or onMessageUpdate() - duplicate detection',
    severity: 'critical',
    evidence,
    recommendation: 'Fix duplicate detection: 1) Always check state FIRST (not DOM), 2) Never bypass deduplication, 3) Clear container BEFORE loading, 4) Use state as single source of truth',
    codePath: ['CanopiModule.js - addMessageToChat()', 'CanopiModule.js - onMessageUpdate()', 'MessageLoadingService.ts - addMessage()', 'UnifiedMessageDisplay.ts - renderDefault()']
  };
}

function diagnoseModuleUsage() {
  const evidence = [];
  
  const messageLoadingService = window.getMessageLoadingService || 
                                (window.MessageLoadingService && typeof window.MessageLoadingService === 'function');
  evidence.push(`MessageLoadingService available: ${!!messageLoadingService}`);
  
  const canopiModule = window.CanopiModule || window.loadChatHistory;
  evidence.push(`CanopiModule/loadChatHistory available: ${!!canopiModule}`);
  
  const hasNewSystem = typeof window.initializeNewMessageSystem === 'function' ||
                       (window.CanopiModule && window.CanopiModule.initializeNewMessageSystem);
  evidence.push(`initializeNewMessageSystem available: ${!!hasNewSystem}`);
  
  evidence.push(`From logs: 'New message system not initialized, initializing now...'`);
  evidence.push(`From logs: 'Using new message system'`);
  evidence.push(`But then: 'onMessageUpdate' and 'addMessageToChat' from CanopiModule.js still used`);
  evidence.push(`⚠️ MIXED USAGE: New system initialized but old CanopiModule.js code still handling messages`);
  
  return {
    issue: 'Old vs new module usage - mixed',
    rootCause: 'New MessageLoadingService initialized but old CanopiModule.js code (onMessageUpdate, addMessageToChat) still being used. Creates two parallel message handling paths, causing duplicates.',
    location: 'CanopiModule.js - still using old addMessageToChat/onMessageUpdate instead of MessageLoadingService',
    severity: 'critical',
    evidence,
    recommendation: 'Migrate fully to new module: 1) Replace all CanopiModule.js message handling with MessageLoadingService, 2) Remove old onMessageUpdate/addMessageToChat, 3) Use MessageLoadingService.loadChatHistory() instead of old loadChatHistory, 4) Ensure real-time updates use MessageLoadingService.addMessage()',
    codePath: ['CanopiModule.js - loadChatHistory()', 'CanopiModule.js - onMessageUpdate()', 'CanopiModule.js - addMessageToChat()', 'ui-realtime-bindings.js']
  };
}

function diagnoseContainerClearing() {
  const evidence = [];
  
  const chatMessages = document.querySelector('.chat-messages');
  if (chatMessages) {
    const messageCount = chatMessages.querySelectorAll('[data-message-id]').length;
    evidence.push(`Current messages in container: ${messageCount}`);
  }
  
  evidence.push(`From logs: 'UnifiedMessageDisplay: Removed 0 message elements'`);
  evidence.push(`From logs: 'UnifiedMessageDisplay: Rendered 10 new messages, 30 actual message elements in container'`);
  evidence.push(`⚠️ Container clearing removed 0 elements but container has 30 messages!`);
  
  return {
    issue: 'Container not cleared before loading',
    rootCause: 'Container (.chat-messages) not cleared before loadChatHistory runs, or clearing happens after messages are already added, allowing old messages to persist alongside new ones',
    location: 'loadChatHistory() or MessageLoadingService.loadChatHistory() - container clearing logic',
    severity: 'high',
    evidence,
    recommendation: 'Clear container first: 1) Clear container at START of loadChatHistory, 2) Clear state chat.data before loading, 3) Ensure UnifiedMessageDisplay.render() clears container, 4) Use state-first approach',
    codePath: ['CanopiModule.js - loadChatHistory()', 'MessageLoadingService.ts - loadChatHistory()', 'UnifiedMessageDisplay.ts - render()']
  };
}

// ============================================================================
// TABS & SCROLL DIAGNOSTICS
// ============================================================================

function diagnoseTabsHiddenIssue() {
  const evidence = [];
  
  const tabsContainer = document.querySelector('.sidebar-nav-main');
  if (!tabsContainer) {
    evidence.push('Tabs container (.sidebar-nav-main) not found in DOM');
    return {
      issue: 'Loading messages hides tabs',
      rootCause: 'Tabs container missing from DOM',
      location: 'sidepanel.html - .sidebar-nav-main',
      severity: 'critical',
      evidence,
      recommendation: 'Verify tabs container exists in HTML'
    };
  }
  
  const tabsComputed = window.getComputedStyle(tabsContainer);
  const display = tabsComputed.display;
  const visibility = tabsComputed.visibility;
  const opacity = tabsComputed.opacity;
  const height = tabsComputed.height;
  
  evidence.push(`Display: ${display}`);
  evidence.push(`Visibility: ${visibility}`);
  evidence.push(`Opacity: ${opacity}`);
  evidence.push(`Height: ${height}`);
  
  const isHidden = display === 'none' || visibility === 'hidden' || opacity === '0' || height === '0px';
  if (isHidden) {
    evidence.push('⚠️ Tabs are currently HIDDEN');
  } else {
    evidence.push('✅ Tabs are visible');
  }
  
  const tabButtons = tabsContainer.querySelectorAll('.main-nav-tab');
  evidence.push(`Tab buttons found: ${tabButtons.length}`);
  
  const parent = tabsContainer.parentElement;
  if (parent) {
    const parentComputed = window.getComputedStyle(parent);
    if (parentComputed.display === 'none' || parentComputed.visibility === 'hidden') {
      evidence.push('⚠️ Parent container is hidden');
    }
  }
  
  const overlays = document.querySelectorAll('[class*="loading"], [class*="overlay"]');
  evidence.push(`Loading/overlay elements found: ${overlays.length}`);
  overlays.forEach((overlay, i) => {
    if (i < 3) {
      const computed = window.getComputedStyle(overlay);
      const zIndex = computed.zIndex;
      if (computed.display !== 'none' && (zIndex === 'auto' || parseInt(zIndex) > 100)) {
        evidence.push(`  ⚠️ Overlay ${i + 1} might cover tabs (z-index: ${zIndex})`);
      }
    }
  });
  
  return {
    issue: 'Loading messages hides tabs',
    rootCause: isHidden 
      ? 'Tabs hidden via CSS or parent container hidden'
      : 'Tabs may be hidden during message loading via JavaScript (class manipulation, style changes, or loading overlay covering tabs)',
    location: 'UIManager.ts or CSS - tab visibility logic during message loading',
    severity: 'critical',
    evidence,
    recommendation: 'Ensure tabs container (.sidebar-nav-main) is NEVER hidden. Check: 1) CSS rules, 2) JavaScript class/style manipulation during loadChatHistory, 3) Parent container visibility, 4) Loading overlay z-index',
    codePath: ['UIManager.ts - tab switching', 'MessageLoadingService.ts - loadChatHistory()', 'UnifiedMessageDisplay.ts - render()', 'sidepanel.css - .sidebar-nav-main']
  };
}

function diagnoseScrollSubstrateIssue() {
  const evidence = [];
  
  const html = document.documentElement;
  const isDarkMode = html.classList.contains('dark') || 
                     html.getAttribute('data-theme') === 'dark' ||
                     window.matchMedia('(prefers-color-scheme: dark)').matches;
  evidence.push(`Dark mode active: ${isDarkMode}`);
  
  const chatMessages = document.querySelector('.chat-messages');
  if (chatMessages) {
    const computed = window.getComputedStyle(chatMessages);
    const scrollbarColor = computed.scrollbarColor || 'not set';
    const overflowY = computed.overflowY;
    
    evidence.push(`Chat messages overflow-y: ${overflowY}`);
    evidence.push(`Chat messages scrollbar-color: ${scrollbarColor}`);
    
    if (isDarkMode) {
      const bgColor = computed.backgroundColor;
      const rgbMatch = bgColor.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
      if (rgbMatch) {
        const r = parseInt(rgbMatch[1]);
        const g = parseInt(rgbMatch[2]);
        const b = parseInt(rgbMatch[3]);
        const brightness = (r * 299 + g * 587 + b * 114) / 1000;
        evidence.push(`Background brightness: ${brightness.toFixed(1)} (0=black, 255=white)`);
        if (brightness < 50) {
          evidence.push('⚠️ Background is too dark (may need subtle contrast)');
        }
      }
    }
  }
  
  const stylesheets = Array.from(document.styleSheets);
  let darkModeScrollbarRules = 0;
  stylesheets.forEach((sheet) => {
    try {
      const rules = Array.from(sheet.cssRules || []);
      rules.forEach((rule) => {
        if (rule.selectorText && (
          rule.selectorText.includes('scrollbar') ||
          rule.selectorText.includes('dark')
        )) {
          if (rule.selectorText.includes('dark') || rule.selectorText.includes('.dark')) {
            darkModeScrollbarRules++;
          }
        }
      });
    } catch (e) {}
  });
  
  evidence.push(`Dark mode scrollbar rules: ${darkModeScrollbarRules}`);
  
  return {
    issue: 'Scroll substrate needs better treatment in dark mode',
    rootCause: isDarkMode
      ? 'Scrollbar styling and/or substrate background not optimized for dark mode - may be too light, too dark, or missing contrast'
      : 'Scrollbar styling exists but may not have dark mode variants',
    location: 'sidepanel.css - scrollbar styling and dark mode rules',
    severity: 'high',
    evidence,
    recommendation: 'Add dark mode scrollbar styling: 1) Use CSS variables for scrollbar colors, 2) Style ::-webkit-scrollbar-track and ::-webkit-scrollbar-thumb for dark mode, 3) Ensure substrate background has appropriate contrast in dark mode',
    codePath: ['sidepanel.css - scrollbar styling', 'sidepanel.css - dark mode rules', 'UserPreferencesManager.ts - theme switching']
  };
}

// ============================================================================
// MESSAGE DISPLAY BUG DIAGNOSTICS
// ============================================================================

function diagnoseSpacingIssue() {
  const evidence = [];
  
  const messageFooter = document.querySelector('.message-footer');
  if (messageFooter) {
    const footerStyles = window.getComputedStyle(messageFooter);
    const marginTop = footerStyles.marginTop;
    const paddingTop = footerStyles.paddingTop;
    evidence.push(`Footer margin-top: ${marginTop}`);
    evidence.push(`Footer padding-top: ${paddingTop}`);
  }
  
  return {
    issue: 'Too much space under text',
    rootCause: 'CSS spacing in .message-footer (margin-top/padding-top too large)',
    location: 'sidepanel.css - .message-footer rules',
    severity: 'medium',
    evidence,
    recommendation: 'Reduce .message-footer margin-top and padding-top (currently may be too large)'
  };
}

function diagnoseActionButtonsIssue() {
  const evidence = [];
  
  const reactionBtn = document.querySelector('.reaction-btn');
  const bookmarkBtn = document.querySelector('.bookmark-btn');
  
  if (!reactionBtn) {
    evidence.push('Reaction button not found in DOM');
  } else {
    evidence.push('Reaction button exists');
  }
  
  if (!bookmarkBtn) {
    evidence.push('Bookmark button not found in DOM');
  } else {
    evidence.push('Bookmark button exists');
  }
  
  const hasService = window.getMessageActionListenersService || false;
  evidence.push(`MessageActionListenersService available: ${hasService}`);
  
  const hasWindowFallback = typeof window.addMessageActionListeners === 'function';
  evidence.push(`window.addMessageActionListeners available: ${hasWindowFallback}`);
  
  evidence.push(`From logs: '⚠️ UnifiedMessageDisplay: Using window fallback for action listeners'`);
  evidence.push(`⚠️ MessageActionListenersService not being used, falling back to window`);
  
  return {
    issue: 'Reactions and Bookmarks don\'t work',
    rootCause: 'Event listeners not attached - MessageActionListenersService not integrated or not called, falling back to window.addMessageActionListeners which may not exist',
    location: 'MessagesModule.js - addMessageToChat() or loadChatHistory() - missing action listener attachment',
    severity: 'critical',
    evidence,
    recommendation: 'Integrate MessageActionListenersService.attachListeners() after rendering messages. Remove window fallback.',
    codePath: ['UnifiedMessageDisplay.ts - createMessageElement()', 'MessageLoadingService.ts - addMessage()', 'CanopiModule.js - addMessageToChat()']
  };
}

function diagnoseEditDeleteIssue() {
  const evidence = [];
  
  const message = document.querySelector('.message');
  const actionMenu = message?.querySelector('.message-actions-menu');
  const editBtn = actionMenu?.querySelector('.edit-btn');
  const deleteBtn = actionMenu?.querySelector('.delete-btn');
  
  if (!actionMenu) {
    evidence.push('Action menu not found in message');
  } else {
    evidence.push('Action menu exists');
  }
  
  if (!editBtn) {
    evidence.push('Edit button not found in action menu');
  } else {
    const isVisible = window.getComputedStyle(editBtn).display !== 'none';
    evidence.push(`Edit button visible: ${isVisible}`);
  }
  
  if (!deleteBtn) {
    evidence.push('Delete button not found in action menu');
  } else {
    const isVisible = window.getComputedStyle(deleteBtn).display !== 'none';
    evidence.push(`Delete button visible: ${isVisible}`);
  }
  
  const messageElement = message;
  const messageId = messageElement?.dataset.messageId;
  evidence.push(`Message ID: ${messageId || 'not found'}`);
  
  return {
    issue: 'Can\'t edit/delete own messages',
    rootCause: 'canEdit/canDelete not calculated correctly OR buttons not rendered OR not visible OR listeners not attached',
    location: 'UnifiedMessageRenderer.generateMessageHTML() or MessageRendererService.renderMessage() - canEdit/canDelete calculation',
    severity: 'critical',
    evidence,
    recommendation: 'Verify canEdit/canDelete calculation in MessageRendererService.renderMessage() - check currentUser comparison and time-based edit window. Ensure buttons visible and listeners attached.'
  };
}

function diagnoseDuplicateMessagesIssue() {
  const evidence = [];
  
  const allMessages = document.querySelectorAll('[data-message-id]');
  const messageIds = Array.from(allMessages).map(el => el.getAttribute('data-message-id'));
  const uniqueIds = new Set(messageIds);
  const duplicates = messageIds.filter((id, index) => messageIds.indexOf(id) !== index);
  
  evidence.push(`Total message elements: ${allMessages.length}`);
  evidence.push(`Unique message IDs: ${uniqueIds.size}`);
  evidence.push(`Duplicate IDs found: ${duplicates.length}`);
  if (duplicates.length > 0) {
    evidence.push(`Duplicate IDs: ${duplicates.slice(0, 5).join(', ')}`);
  }
  
  const stateManager = window.stateManagerInstance;
  if (stateManager) {
    const chatData = stateManager.getState('chat.data');
    if (Array.isArray(chatData)) {
      const stateIds = chatData.map(m => m.id);
      const stateUnique = new Set(stateIds);
      evidence.push(`State messages: ${chatData.length}, Unique: ${stateUnique.size}`);
    }
  }
  
  evidence.push(`From logs: 'UnifiedMessageDisplay: Rendered 10 new messages, 30 actual message elements in container'`);
  evidence.push(`⚠️ Container has 3x more messages than expected!`);
  
  return {
    issue: 'Messages are repeated',
    rootCause: 'Duplicate detection failing - either not checking state/DOM before adding, or clearing logic broken, or multiple loads adding same messages',
    location: 'MessageLoadingService.addMessage() or loadChatHistory() - duplicate detection logic',
    severity: 'critical',
    evidence,
    recommendation: 'Fix duplicate detection in MessageLoadingService - check state FIRST, then DOM. Ensure container clearing works correctly. Prevent multiple loads.'
  };
}

function diagnoseQuoteDisplayIssue() {
  const evidence = [];
  
  const quotes = document.querySelectorAll('.message[data-parent-id]');
  const lastQuote = quotes[quotes.length - 1];
  
  evidence.push(`Total quotes/replies: ${quotes.length}`);
  
  if (lastQuote) {
    const hasAvatar = lastQuote.querySelector('.avatar-container img, .avatar-container .avatar-initial');
    evidence.push(`Last quote has avatar: ${!!hasAvatar}`);
    
    const hasQuotedContent = lastQuote.querySelector('.quoted-content, .message-quote, [class*="quote"]');
    evidence.push(`Last quote shows quoted content: ${!!hasQuotedContent}`);
    
    const container = lastQuote.parentElement;
    const siblings = container ? Array.from(container.children) : [];
    const index = siblings.indexOf(lastQuote);
    const isAtBottom = index === siblings.length - 1;
    evidence.push(`Last quote at bottom: ${isAtBottom} (index: ${index}/${siblings.length - 1})`);
  }
  
  return {
    issue: 'New quote displays at bottom, no quoted content, no avatar',
    rootCause: 'Quote rendering: 1) Ordering wrong (should prepend), 2) Quoted content not rendered, 3) Avatar not generated',
    location: 'UnifiedMessageRenderer.renderMessage() or MessageRendererService.renderMessage() - quote/reply rendering logic',
    severity: 'critical',
    evidence,
    recommendation: 'Fix quote rendering: 1) Check parentId handling, 2) Ensure quoted content is included in HTML, 3) Verify avatar generation for replies, 4) Fix insertion order (prepend for replies)'
  };
}

function diagnoseReplyCountIssue() {
  const evidence = [];
  
  const messagesWithReplies = document.querySelectorAll('.message.has-replies, .message[data-has-replies="true"]');
  evidence.push(`Messages with replies class: ${messagesWithReplies.length}`);
  
  messagesWithReplies.forEach((msg, i) => {
    if (i < 3) {
      const replyCountEl = msg.querySelector('.reply-count, .icon-count, [class*="reply"]');
      const hasCount = replyCountEl && replyCountEl.textContent;
      evidence.push(`Message ${i + 1} has reply count display: ${!!hasCount} (${hasCount || 'none'})`);
    }
  });
  
  const stateManager = window.stateManagerInstance;
  if (stateManager) {
    const chatData = stateManager.getState('chat.data');
    if (Array.isArray(chatData)) {
      const messageWithReplies = chatData.find((m) => {
        const replies = chatData.filter((r) => r.parentId === m.id);
        return replies.length > 0;
      });
      if (messageWithReplies) {
        const replyCount = chatData.filter((r) => r.parentId === messageWithReplies.id).length;
        evidence.push(`State shows message ${messageWithReplies.id} has ${replyCount} replies`);
      }
    }
  }
  
  return {
    issue: 'Reply count not shown/updated in default mode',
    rootCause: 'Reply count not calculated or not passed to renderer, or not displayed in UI',
    location: 'MessageRendererService.renderMessage() - replyCount calculation and passing to UnifiedMessageRenderer',
    severity: 'high',
    evidence,
    recommendation: 'Fix reply count: 1) Calculate from state in MessageRendererService, 2) Pass to UnifiedMessageRenderer, 3) Ensure UI displays count, 4) Update count when reply added'
  };
}

function diagnoseReplyHandlingIssue() {
  const evidence = [];
  
  const replies = document.querySelectorAll('.message[data-parent-id]');
  const lastReply = replies[replies.length - 1];
  
  evidence.push(`Total replies: ${replies.length}`);
  
  if (lastReply) {
    const hasAvatar = lastReply.querySelector('.avatar-container img, .avatar-container .avatar-initial');
    evidence.push(`Last reply has avatar: ${!!hasAvatar}`);
    
    const container = lastReply.closest('.chat-messages');
    const isFocusMode = container?.classList.contains('focus-mode-parent') || container?.classList.contains('focus-mode-child');
    evidence.push(`Container in focus mode: ${isFocusMode}`);
    
    const parentId = lastReply.getAttribute('data-parent-id');
    const parentReplies = Array.from(document.querySelectorAll(`[data-parent-id="${parentId}"]`));
    const replyIndex = parentReplies.indexOf(lastReply);
    evidence.push(`Reply position in replies list: ${replyIndex + 1}/${parentReplies.length}`);
  }
  
  return {
    issue: 'Reply shows at bottom without avatar, should open parent in Focus mode',
    rootCause: 'Reply handling: 1) Not triggering Focus mode, 2) Appending instead of prepending, 3) Avatar not rendered',
    location: 'MessagesModule.js - handleReplyToMessage() or addMessageToChat() - reply handling and focus mode triggering',
    severity: 'critical',
    evidence,
    recommendation: 'Fix reply handling: 1) Trigger handleMessageFocus() when reply added, 2) Use Focus mode for parent, 3) Ensure avatar rendered for replies, 4) Insert reply after parent (not at bottom)'
  };
}

function diagnoseNewMessageIssue() {
  const evidence = [];
  
  const messages = document.querySelectorAll('.message');
  const firstMessage = messages[0];
  
  evidence.push(`Total messages: ${messages.length}`);
  
  if (firstMessage) {
    const hasAvatar = firstMessage.querySelector('.avatar-container img, .avatar-container .avatar-initial');
    evidence.push(`First message has avatar: ${!!hasAvatar}`);
    
    if (hasAvatar) {
      const avatarImg = firstMessage.querySelector('.avatar-container img');
      const avatarInitial = firstMessage.querySelector('.avatar-container .avatar-initial');
      evidence.push(`Avatar type: ${avatarImg ? 'image' : avatarInitial ? 'initial' : 'none'}`);
    }
    
    const messageId = firstMessage.getAttribute('data-message-id');
    evidence.push(`First message ID: ${messageId}`);
  }
  
  const container = document.querySelector('.chat-messages');
  if (container) {
    const children = Array.from(container.children);
    const messageElements = children.filter(el => el.classList.contains('message'));
    evidence.push(`Messages in container: ${messageElements.length}`);
  }
  
  return {
    issue: 'New message at top without avatar',
    rootCause: 'Message rendering: 1) Ordering wrong (should append, not prepend), 2) Avatar not generated or not included in HTML',
    location: 'MessageRendererService.renderMessage() or UnifiedMessageRenderer.renderMessage() - avatar generation and message ordering',
    severity: 'critical',
    evidence,
    recommendation: 'Fix new message: 1) Ensure appendChild() not insertBefore() at index 0, 2) Verify avatar generation in UnifiedMessageRenderer, 3) Check avatar HTML inclusion'
  };
}

// Make function available globally for browser console
if (typeof window !== 'undefined') {
  window.runAllMessageDiagnostics = runAllMessageDiagnostics;
  
  // Auto-run if script is loaded directly
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', runAllMessageDiagnostics);
  } else {
    runAllMessageDiagnostics();
  }
}





