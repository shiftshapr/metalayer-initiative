/**
 * DIAGNOSTIC: Triple Message Loading Root Cause Analysis
 * 
 * Problem: Messages load THREE times:
 * 1. Once in reverse order
 * 2. Twice in correct order
 * All messages persist (duplicates)
 * 
 * Root cause analysis before fixing.
 */

/**
 * Run all diagnostics
 */
function runTripleLoadingDiagnostics() {
  const diagnostics = [];
  
  // Issue 1: Multiple loadChatHistory calls
  const loadCallsResult = diagnoseMultipleLoadCalls();
  diagnostics.push(loadCallsResult);
  
  // Issue 2: Real-time subscription triggering during initial load
  const realtimeResult = diagnoseRealtimeDuringLoad();
  diagnostics.push(realtimeResult);
  
  // Issue 3: Duplicate detection failing
  const duplicateResult = diagnoseDuplicateDetection();
  diagnostics.push(duplicateResult);
  
  // Issue 4: Old vs new module usage
  const moduleResult = diagnoseModuleUsage();
  diagnostics.push(moduleResult);
  
  // Issue 5: Container not cleared before loading
  const containerResult = diagnoseContainerClearing();
  diagnostics.push(containerResult);
  
  const critical = diagnostics.filter(d => d.severity === 'critical').length;
  const high = diagnostics.filter(d => d.severity === 'high').length;
  const medium = diagnostics.filter(d => d.severity === 'medium').length;
  
  console.log('=== TRIPLE MESSAGE LOADING ROOT CAUSE DIAGNOSTICS ===\n');
  
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

/**
 * Issue 1: Multiple loadChatHistory calls
 */
function diagnoseMultipleLoadCalls() {
  const evidence = [];
  
  // Check if loadChatHistory is being called multiple times
  const loadChatHistory = window.loadChatHistory || (window.MessagesModule && window.MessagesModule.loadChatHistory);
  evidence.push(`loadChatHistory available: ${!!loadChatHistory}`);
  
  // Check for callers of loadChatHistory
  const callers = [
    'TabController',
    'ui-realtime-bindings',
    'CommunitiesModule',
    'UIManager',
    'Sidepanel'
  ];
  
  callers.forEach(caller => {
    const module = window[caller] || window[caller.toLowerCase()];
    if (module) {
      evidence.push(`${caller} available: true`);
    } else {
      evidence.push(`${caller} available: false`);
    }
  });
  
  // Check for event listeners that might trigger loadChatHistory
  const events = [
    'url-changed',
    'tab-changed',
    'community-changed',
    'page-changed',
    'currentUrlData-changed'
  ];
  
  evidence.push(`Checking for event listeners that might trigger loading...`);
  events.forEach(eventName => {
    // Can't directly check listeners, but can check if events are dispatched
    evidence.push(`Event '${eventName}' may trigger loadChatHistory`);
  });
  
  // Check StateManager for currentUrlData changes
  const stateManager = window.stateManagerInstance;
  if (stateManager) {
    const currentUrlData = stateManager.getState('currentUrlData');
    evidence.push(`currentUrlData in state: ${currentUrlData ? 'set' : 'not set'}`);
    if (currentUrlData) {
      evidence.push(`  pageId: ${currentUrlData.pageId || 'not set'}`);
      evidence.push(`  rawUrl: ${currentUrlData.rawUrl || 'not set'}`);
    }
  }
  
  // Check for multiple subscriptions to StateManager
  evidence.push(`StateManager subscriptions: Cannot directly check, but multiple subscriptions could trigger multiple loads`);
  
  return {
    issue: 'Multiple loadChatHistory calls',
    rootCause: 'loadChatHistory is being called from multiple places (TabController, ui-realtime-bindings, CommunitiesModule, UIManager, or StateManager subscriptions) without debouncing or loading flags',
    location: 'Multiple callers of loadChatHistory - no coordination',
    severity: 'critical',
    evidence,
    recommendation: 'Add loading flag/guard: 1) Check if already loading before calling loadChatHistory, 2) Debounce loadChatHistory calls, 3) Clear container BEFORE loading, 4) Use single source of truth (MessageLoadingService)',
    codePath: [
      'TabController.js - loadChatHistory call',
      'ui-realtime-bindings.js - loadChatHistory call',
      'CommunitiesModule.js - loadChatHistory call',
      'UIManager.ts - loadChatHistory call',
      'StateManager subscriptions - may trigger loads'
    ]
  };
}

/**
 * Issue 2: Real-time subscription triggering during initial load
 */
function diagnoseRealtimeDuringLoad() {
  const evidence = [];
  
  // Check if real-time subscription is active
  const supabaseClient = window.supabaseRealtimeClient || window.supabase;
  evidence.push(`Supabase real-time client available: ${!!supabaseClient}`);
  
  // Check for onMessageUpdate handler
  const hasOnMessageUpdate = typeof window.onMessageUpdate === 'function' || 
                             (window.CanopiModule && typeof window.CanopiModule.onMessageUpdate === 'function');
  evidence.push(`onMessageUpdate handler available: ${!!hasOnMessageUpdate}`);
  
  // Check if subscription is set up before loadChatHistory completes
  evidence.push(`Real-time subscription may be receiving initial messages while loadChatHistory is still loading`);
  
  // Check for message deduplication in onMessageUpdate
  const win = window;
  if (win.onMessageUpdate) {
    // Can't inspect function body, but can check if it exists
    evidence.push(`onMessageUpdate exists - check if it has proper deduplication`);
  }
  
  // Check logs for evidence
  evidence.push(`From logs: onMessageUpdate triggered twice with same 10 messages`);
  evidence.push(`This suggests real-time subscription fires during/after initial load`);
  
  return {
    issue: 'Real-time subscription triggering during initial load',
    rootCause: 'Real-time subscription (onMessageUpdate) is receiving messages while loadChatHistory is loading, causing duplicate additions. No coordination between initial load and real-time updates.',
    location: 'CanopiModule.js - onMessageUpdate handler and real-time subscription setup',
    severity: 'critical',
    evidence,
    recommendation: 'Coordinate initial load and real-time: 1) Set loading flag during loadChatHistory, 2) Skip real-time updates during initial load, 3) Mark initial load complete before enabling real-time updates, 4) Deduplicate in onMessageUpdate using state (not DOM)',
    codePath: [
      'CanopiModule.js - onMessageUpdate()',
      'SupabaseRealtimeClient.js - subscription setup',
      'loadChatHistory() - should set loading flag',
      'Message deduplication logic'
    ]
  };
}

/**
 * Issue 3: Duplicate detection failing
 */
function diagnoseDuplicateDetection() {
  const evidence = [];
  
  // Check current state
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
    } else {
      evidence.push(`State chat.data is not an array: ${typeof chatData}`);
    }
  } else {
    evidence.push(`StateManager not available`);
  }
  
  // Check DOM for duplicates
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
  } else {
    evidence.push(`Chat messages container not found`);
  }
  
  // Check if duplicate detection checks state or DOM
  evidence.push(`From logs: 'Initial message loading, bypassing deduplication'`);
  evidence.push(`This suggests deduplication is being bypassed during initial load`);
  
  return {
    issue: 'Duplicate detection failing',
    rootCause: 'Duplicate detection is bypassed during initial load ("bypassing deduplication"), or checks DOM instead of state, or container is not cleared before loading, allowing duplicates to accumulate',
    location: 'CanopiModule.js - addMessageToChat() or onMessageUpdate() - duplicate detection logic',
    severity: 'critical',
    evidence,
    recommendation: 'Fix duplicate detection: 1) Always check state FIRST (not DOM), 2) Never bypass deduplication, 3) Clear container BEFORE loading, 4) Use state as single source of truth, 5) Check state in addMessageToChat before adding',
    codePath: [
      'CanopiModule.js - addMessageToChat()',
      'CanopiModule.js - onMessageUpdate()',
      'MessageLoadingService.ts - addMessage() (if using new module)',
      'UnifiedMessageDisplay.ts - renderDefault()'
    ]
  };
}

/**
 * Issue 4: Old vs new module usage
 */
function diagnoseModuleUsage() {
  const evidence = [];
  
  // Check if new MessageLoadingService is available
  const messageLoadingService = window.getMessageLoadingService || 
                                (window.MessageLoadingService && typeof window.MessageLoadingService === 'function');
  evidence.push(`MessageLoadingService available: ${!!messageLoadingService}`);
  
  // Check if old CanopiModule is being used
  const canopiModule = window.CanopiModule || window.loadChatHistory;
  evidence.push(`CanopiModule/loadChatHistory available: ${!!canopiModule}`);
  
  // Check which loadChatHistory is being called
  if (canopiModule) {
    const source = canopiModule.toString ? canopiModule.toString().substring(0, 200) : 'unknown';
    evidence.push(`loadChatHistory source preview: ${source.substring(0, 100)}...`);
  }
  
  // Check for initializeNewMessageSystem
  const hasNewSystem = typeof window.initializeNewMessageSystem === 'function' ||
                       (window.CanopiModule && window.CanopiModule.initializeNewMessageSystem);
  evidence.push(`initializeNewMessageSystem available: ${!!hasNewSystem}`);
  
  // Check logs
  evidence.push(`From logs: 'New message system not initialized, initializing now...'`);
  evidence.push(`From logs: 'initializeNewMessageSystem: MessageLoader instance created'`);
  evidence.push(`From logs: 'Using new message system'`);
  evidence.push(`But then: 'onMessageUpdate' and 'addMessageToChat' from CanopiModule.js are still being used`);
  
  evidence.push(`⚠️ MIXED USAGE: New system initialized but old CanopiModule.js code still handling messages`);
  
  return {
    issue: 'Old vs new module usage - mixed',
    rootCause: 'New MessageLoadingService is initialized but old CanopiModule.js code (onMessageUpdate, addMessageToChat) is still being used. This creates two parallel message handling paths, causing duplicates.',
    location: 'CanopiModule.js - still using old addMessageToChat/onMessageUpdate instead of MessageLoadingService',
    severity: 'critical',
    evidence,
    recommendation: 'Migrate fully to new module: 1) Replace all CanopiModule.js message handling with MessageLoadingService, 2) Remove old onMessageUpdate/addMessageToChat from CanopiModule, 3) Use MessageLoadingService.loadChatHistory() instead of old loadChatHistory, 4) Ensure real-time updates use MessageLoadingService.addMessage()',
    codePath: [
      'CanopiModule.js - loadChatHistory() - should use MessageLoadingService',
      'CanopiModule.js - onMessageUpdate() - should use MessageLoadingService',
      'CanopiModule.js - addMessageToChat() - should use MessageLoadingService',
      'ui-realtime-bindings.js - should use MessageLoadingService'
    ]
  };
}

/**
 * Issue 5: Container not cleared before loading
 */
function diagnoseContainerClearing() {
  const evidence = [];
  
  // Check if container is cleared
  const chatMessages = document.querySelector('.chat-messages');
  if (chatMessages) {
    const messageCount = chatMessages.querySelectorAll('[data-message-id]').length;
    evidence.push(`Current messages in container: ${messageCount}`);
    
    // Check if container has clear/empty logic
    const hasClearMethod = chatMessages.innerHTML === '' || chatMessages.children.length === 0;
    evidence.push(`Container appears empty: ${hasClearMethod}`);
  } else {
    evidence.push(`Chat messages container not found`);
  }
  
  // Check logs for clearing
  evidence.push(`From logs: 'UnifiedMessageDisplay: Removed 0 message elements'`);
  evidence.push(`This suggests container clearing happens but may be too late or not effective`);
  
  // Check if loadChatHistory clears container
  evidence.push(`Need to verify: Does loadChatHistory clear container BEFORE loading?`);
  
  return {
    issue: 'Container not cleared before loading',
    rootCause: 'Container (.chat-messages) is not cleared before loadChatHistory runs, or clearing happens after messages are already added, allowing old messages to persist alongside new ones',
    location: 'loadChatHistory() or MessageLoadingService.loadChatHistory() - container clearing logic',
    severity: 'high',
    evidence,
    recommendation: 'Clear container first: 1) Clear container at START of loadChatHistory (before any loading), 2) Clear state chat.data before loading, 3) Ensure UnifiedMessageDisplay.render() clears container, 4) Use state-first approach (clear state, then DOM)',
    codePath: [
      'CanopiModule.js - loadChatHistory()',
      'MessageLoadingService.ts - loadChatHistory()',
      'UnifiedMessageDisplay.ts - render()',
      'Container clearing logic'
    ]
  };
}

// Make function available globally for browser console
if (typeof window !== 'undefined') {
  window.runTripleLoadingDiagnostics = runTripleLoadingDiagnostics;
  
  // Auto-run if script is loaded directly
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', runTripleLoadingDiagnostics);
  } else {
    runTripleLoadingDiagnostics();
  }
}





