/**
 * Diagnostic Script: loadChatHistory Execution Trace
 * 
 * PURPOSE: Trace loadChatHistory execution to see why messages aren't loading
 * 
 * USAGE: Copy this entire script and paste into browser console on a page with Canopi extension loaded
 * 
 * OUTPUT: Console logs with execution trace, API calls, errors, and recommendations
 * 
 * CRITICAL: This is pure JavaScript - NO TypeScript syntax, NO imports/exports
 */

(function() {
  'use strict';
  
  console.log('🔍 DIAGNOSTIC: loadChatHistory Execution Trace');
  console.log('==============================================================');
  
  const results = {
    timestamp: new Date().toISOString(),
    checks: {},
    issues: [],
    recommendations: []
  };
  
  // Check 1: loadChatHistory function
  console.log('\n📋 Check 1: loadChatHistory Function');
  const loadChatHistory = window.loadChatHistory;
  const hasLoadChatHistory = typeof loadChatHistory === 'function';
  console.log('  loadChatHistory available:', hasLoadChatHistory);
  results.checks.loadChatHistory = { available: hasLoadChatHistory };
  
  if (!hasLoadChatHistory) {
    results.issues.push('loadChatHistory function not available');
    console.log('\n❌ Cannot proceed - loadChatHistory not available');
    return results;
  }
  
  // Check 2: Current state
  console.log('\n📋 Check 2: Current State');
  const stateManager = window.stateManager || window.stateManagerInstance;
  let currentUrlData = null;
  let chatData = null;
  
  if (stateManager && typeof stateManager.getState === 'function') {
    currentUrlData = stateManager.getState('currentUrlData');
    chatData = stateManager.getState('chat.data');
  }
  
  const pageId = currentUrlData?.pageId || 'unknown';
  console.log('  pageId:', pageId);
  console.log('  currentUrlData:', currentUrlData);
  console.log('  chat.data count:', Array.isArray(chatData) ? chatData.length : 0);
  results.checks.state = {
    pageId: pageId,
    hasCurrentUrlData: !!currentUrlData,
    chatDataCount: Array.isArray(chatData) ? chatData.length : 0
  };
  
  // Check 3: API module
  console.log('\n📋 Check 3: API Module');
  const api = window.api;
  const apiInfo = {
    available: !!api,
    hasRequest: api && typeof api.request === 'function'
  };
  console.log('  API info:', apiInfo);
  results.checks.api = apiInfo;
  
  // Check 4: Container
  console.log('\n📋 Check 4: Container');
  const container = document.querySelector('.chat-messages');
  const containerInfo = {
    exists: !!container,
    childCount: container ? container.children.length : 0,
    hasMessages: container ? container.querySelectorAll('.message, [data-message-id]').length > 0 : false
  };
  console.log('  Container info:', containerInfo);
  results.checks.container = containerInfo;
  
  // Check 5: Test loadChatHistory call
  console.log('\n📋 Check 5: Testing loadChatHistory Call');
  console.log('  Calling loadChatHistory with pageId:', pageId);
  
  // Wrap loadChatHistory to trace execution
  const originalLoadChatHistory = loadChatHistory;
  let callCount = 0;
  let lastCallTime = null;
  let lastCallError = null;
  let lastCallSuccess = false;
  
  // Intercept calls
  window.loadChatHistory = function(pageIdOrRawUrl, activeCommunities) {
    callCount++;
    lastCallTime = new Date().toISOString();
    lastCallSuccess = false;
    lastCallError = null;
    
    console.log('🔔 loadChatHistory CALLED:', {
      callNumber: callCount,
      pageIdOrRawUrl: pageIdOrRawUrl,
      activeCommunities: activeCommunities,
      timestamp: lastCallTime
    });
    
    const result = originalLoadChatHistory.call(this, pageIdOrRawUrl, activeCommunities);
    
    // Handle promise
    if (result && typeof result.then === 'function') {
      result.then(() => {
        lastCallSuccess = true;
        console.log('✅ loadChatHistory COMPLETED:', {
          callNumber: callCount,
          timestamp: new Date().toISOString()
        });
        
        // Check if messages appeared
        setTimeout(() => {
          const messagesInContainer = document.querySelector('.chat-messages')?.children.length || 0;
          const messagesInState = Array.isArray(stateManager?.getState('chat.data')) ? stateManager.getState('chat.data').length : 0;
          console.log('📊 After loadChatHistory:', {
            messagesInContainer: messagesInContainer,
            messagesInState: messagesInState
          });
        }, 1000);
      }).catch((error) => {
        lastCallError = error;
        lastCallSuccess = false;
        console.error('❌ loadChatHistory ERROR:', {
          callNumber: callCount,
          error: error,
          errorMessage: error?.message,
          stack: error?.stack
        });
      });
    }
    
    return result;
  };
  
  // Now call it
  try {
    const callResult = loadChatHistory(pageId);
    console.log('  Call initiated, result:', callResult);
    results.checks.testCall = {
      initiated: true,
      isPromise: callResult && typeof callResult.then === 'function'
    };
  } catch (error) {
    console.error('  ❌ Error calling loadChatHistory:', error);
    results.issues.push('Error calling loadChatHistory: ' + (error?.message || String(error)));
    results.checks.testCall = {
      initiated: false,
      error: error?.message || String(error)
    };
  }
  
  // Check 6: Network requests (after a delay)
  console.log('\n📋 Check 6: Network Requests');
  console.log('  Waiting 2 seconds to check for API calls...');
  
  setTimeout(() => {
    // Check if there were any network requests to /api/messages
    console.log('  Note: Check Network tab in DevTools for requests to /api/messages');
    console.log('  Look for:');
    console.log('    - GET /api/messages?pageId=...');
    console.log('    - Response status (200, 404, 500, etc.)');
    console.log('    - Response body (should have items array)');
  }, 2000);
  
  // Check 7: Console errors
  console.log('\n📋 Check 7: Console Errors');
  console.log('  Check browser console for any errors during loadChatHistory');
  console.log('  Look for errors from:');
  console.log('    - MessageFeed');
  console.log('    - MessagePaginationService');
  console.log('    - MessageRenderer');
  console.log('    - API calls');
  
  // Summary
  console.log('\n📊 DIAGNOSTIC SUMMARY');
  console.log('====================');
  console.log('Issues found:', results.issues.length);
  results.issues.forEach((issue, idx) => {
    console.log('  ' + (idx + 1) + '. ' + issue);
  });
  
  console.log('\n💡 Next Steps:');
  console.log('  1. Watch console for loadChatHistory execution logs');
  console.log('  2. Check Network tab for /api/messages requests');
  console.log('  3. Check for any error messages in console');
  console.log('  4. Wait 3-5 seconds and check if messages appear');
  console.log('  5. Check stateManager.getState("chat.data") after call');
  
  console.log('\n📋 Full Results:');
  console.log(JSON.stringify(results, null, 2));
  
  return results;
})();



