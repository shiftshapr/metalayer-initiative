/**
 * Diagnostic Script: Modern MessageFeed System
 * 
 * PURPOSE: Diagnose why messages are not displaying with the new MessageFeed system
 * 
 * USAGE: Copy this entire script and paste into browser console on a page with Canopi extension loaded
 */

(async function() {
  'use strict';
  
  console.log('🔍 DIAGNOSTIC: Modern MessageFeed System');
  console.log('==============================================================');
  
  const results = {
    timestamp: new Date().toISOString(),
    checks: {},
    issues: [],
    recommendations: []
  };
  
  // Check 1: Container
  console.log('\n📋 Check 1: Chat Messages Container');
  const chatContainer = document.querySelector('.chat-messages');
  const containerInfo = {
    exists: !!chatContainer,
    visible: chatContainer ? window.getComputedStyle(chatContainer).display !== 'none' : false,
    childCount: chatContainer ? chatContainer.children.length : 0,
    hasMessages: chatContainer ? chatContainer.querySelectorAll('.message, [data-message-id]').length > 0 : false
  };
  console.log('  Container info:', containerInfo);
  results.checks.container = containerInfo;
  
  if (!containerInfo.exists) {
    results.issues.push('Chat container (.chat-messages) not found');
  }
  if (containerInfo.childCount === 0) {
    results.issues.push('Chat container has no child elements');
  }
  
  // Check 2: MessageFeed Integration
  console.log('\n📋 Check 2: MessageFeed Integration');
  let messageFeedIntegration = null;
  try {
    // Try to access via window if exported
    messageFeedIntegration = window.messageFeedIntegration || window.MessageFeedIntegration;
  } catch (e) {
    console.log('  MessageFeedIntegration not on window');
  }
  
  const integrationInfo = {
    available: !!messageFeedIntegration,
    hasLoadMessagesViaFeed: messageFeedIntegration && typeof messageFeedIntegration.loadMessagesViaFeed === 'function',
    hasGetActiveFeed: messageFeedIntegration && typeof messageFeedIntegration.getActiveMessageFeed === 'function'
  };
  console.log('  Integration info:', integrationInfo);
  results.checks.integration = integrationInfo;
  
  // Check 3: loadChatHistory function
  console.log('\n📋 Check 3: loadChatHistory Function');
  const loadChatHistory = window.loadChatHistory;
  const hasLoadChatHistory = typeof loadChatHistory === 'function';
  console.log(`  loadChatHistory available: ${hasLoadChatHistory}`);
  results.checks.loadChatHistory = { available: hasLoadChatHistory };
  
  if (!hasLoadChatHistory) {
    results.issues.push('loadChatHistory function not available on window');
  }
  
  // Check 4: StateManager
  console.log('\n📋 Check 4: StateManager');
  const stateManager = window.stateManager || window.stateManagerInstance;
  let chatData = null;
  let currentUrlData = null;
  
  if (stateManager && typeof stateManager.getState === 'function') {
    try {
      chatData = stateManager.getState('chat.data');
      currentUrlData = stateManager.getState('currentUrlData');
    } catch (e) {
      console.error('  Error accessing state:', e);
    }
  }
  
  const stateInfo = {
    available: !!stateManager,
    chatDataCount: Array.isArray(chatData) ? chatData.length : 0,
    hasCurrentUrl: !!currentUrlData,
    pageId: currentUrlData?.pageId || 'unknown'
  };
  console.log('  State info:', stateInfo);
  results.checks.state = stateInfo;
  
  if (stateInfo.chatDataCount === 0) {
    results.issues.push('No messages in stateManager chat.data');
  }
  
  // Check 5: API Module
  console.log('\n📋 Check 5: API Module');
  const api = window.api;
  const apiInfo = {
    available: !!api,
    hasRequest: api && typeof api.request === 'function',
    hasGet: api && typeof api.get === 'function'
  };
  console.log('  API info:', apiInfo);
  results.checks.api = apiInfo;
  
  if (!apiInfo.available) {
    results.issues.push('API module not available');
  } else if (!apiInfo.hasRequest && !apiInfo.hasGet) {
    results.issues.push('API module missing request/get methods');
  }
  
  // Check 6: Supabase Client
  console.log('\n📋 Check 6: Supabase Client');
  const supabase = window.supabase;
  const supabaseInfo = {
    available: !!supabase,
    hasChannel: supabase && typeof supabase.channel === 'function',
    hasFrom: supabase && typeof supabase.from === 'function'
  };
  console.log('  Supabase info:', supabaseInfo);
  results.checks.supabase = supabaseInfo;
  
  // Check 7: Active Tab
  console.log('\n📋 Check 7: Active Tab');
  const discussTab = document.getElementById('discuss-tab');
  const discussTabActive = discussTab && discussTab.classList.contains('active');
  console.log(`  Discuss tab active: ${discussTabActive}`);
  results.checks.tab = { discussTabActive };
  
  if (!discussTabActive) {
    results.issues.push('Discuss tab is not active - messages only load on discuss-tab');
  }
  
  // Check 8: Console Errors (recent)
  console.log('\n📋 Check 8: Recent Errors');
  const errorElements = document.querySelectorAll('[class*="error"], [id*="error"]');
  console.log(`  Error indicators: ${errorElements.length}`);
  results.checks.errors = errorElements.length;
  
  // Check 9: Try to manually trigger loadChatHistory
  console.log('\n📋 Check 9: Testing loadChatHistory');
  if (hasLoadChatHistory && stateInfo.hasCurrentUrl && discussTabActive) {
    try {
      console.log('  Attempting to call loadChatHistory...');
      const pageId = stateInfo.pageId;
      if (pageId && pageId !== 'unknown') {
        console.log(`  Would call: loadChatHistory('${pageId}')`);
        results.checks.testLoad = { canCall: true, pageId };
      } else {
        results.issues.push('Cannot test loadChatHistory - pageId unknown');
        results.checks.testLoad = { canCall: false, reason: 'pageId unknown' };
      }
    } catch (e) {
      console.error('  Error testing loadChatHistory:', e);
      results.issues.push('Error testing loadChatHistory: ' + e.message);
    }
  } else {
    results.checks.testLoad = { 
      canCall: false, 
      reason: !hasLoadChatHistory ? 'loadChatHistory not available' : 
              !stateInfo.hasCurrentUrl ? 'no currentUrlData' : 
              'discuss tab not active' 
    };
  }
  
  // Check 10: MessageFeed files in extension
  console.log('\n📋 Check 10: MessageFeed Files');
  // Check if compiled files exist (we can't directly check, but we can check if imports would work)
  const feedFiles = [
    'features/messages/MessageFeed.js',
    'features/messages/MessageRenderer.js',
    'features/messages/MessageFeedIntegration.js'
  ];
  console.log('  Expected files:', feedFiles);
  results.checks.files = { expected: feedFiles };
  
  // Summary
  console.log('\n📊 DIAGNOSTIC SUMMARY');
  console.log('====================');
  console.log(`Issues found: ${results.issues.length}`);
  results.issues.forEach((issue, idx) => {
    console.log(`  ${idx + 1}. ${issue}`);
  });
  
  console.log('\n💡 Recommendations:');
  if (results.issues.some(i => i.includes('container'))) {
    results.recommendations.push('Ensure .chat-messages container exists in sidepanel.html');
  }
  if (results.issues.some(i => i.includes('loadChatHistory'))) {
    results.recommendations.push('Check MessagesModule.ts - ensure loadChatHistory is exported to window');
    results.recommendations.push('Verify MessagesModule is loaded in build graph');
  }
  if (results.issues.some(i => i.includes('tab'))) {
    results.recommendations.push('Click on discuss-tab to activate it');
    results.recommendations.push('Messages only load when discuss-tab is active');
  }
  if (results.issues.some(i => i.includes('API'))) {
    results.recommendations.push('Check APIModule initialization');
    results.recommendations.push('Verify API base URL is configured');
  }
  if (results.issues.some(i => i.includes('state'))) {
    results.recommendations.push('Check if loadChatHistory is being called');
    results.recommendations.push('Verify API is returning messages');
    results.recommendations.push('Check browser console for errors during loadChatHistory');
  }
  if (results.issues.length === 0) {
    results.recommendations.push('No obvious issues - check browser console for runtime errors');
    results.recommendations.push('Check network tab for API requests to /api/messages');
    results.recommendations.push('Verify MessageFeed.initialize() is completing successfully');
  }
  
  results.recommendations.forEach((rec, idx) => {
    console.log(`  ${idx + 1}. ${rec}`);
  });
  
  console.log('\n📋 Full Results:');
  console.log(JSON.stringify(results, null, 2));
  
  // Try to manually trigger if everything looks good
  if (hasLoadChatHistory && stateInfo.hasCurrentUrl && discussTabActive && results.issues.length === 0) {
    console.log('\n🚀 Attempting to manually trigger loadChatHistory...');
    try {
      await loadChatHistory(stateInfo.pageId);
      console.log('✅ loadChatHistory called successfully');
    } catch (e) {
      console.error('❌ Error calling loadChatHistory:', e);
      results.issues.push('Error calling loadChatHistory: ' + e.message);
    }
  }
  
  return results;
})();



