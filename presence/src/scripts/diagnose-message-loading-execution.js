/**
 * Diagnostic Script: Message Loading Execution Trace
 * 
 * PURPOSE: Trace the complete message loading execution to find where it fails
 * 
 * USAGE: Copy this entire script and paste into browser console
 * 
 * CRITICAL: This is pure JavaScript - NO TypeScript syntax, NO imports/exports
 */

(function() {
  'use strict';
  
  console.log('🔍 DIAGNOSTIC: Message Loading Execution Trace');
  console.log('==============================================================');
  
  const results = {
    timestamp: new Date().toISOString(),
    execution: [],
    errors: [],
    recommendations: []
  };
  
  // Step 1: Check prerequisites
  console.log('\n📋 Step 1: Prerequisites');
  const loadChatHistory = window.loadChatHistory;
  const stateManager = window.stateManager || window.stateManagerInstance;
  const api = window.api;
  const container = document.querySelector('.chat-messages');
  
  const prereqs = {
    loadChatHistory: typeof loadChatHistory === 'function',
    stateManager: !!stateManager,
    api: !!api && typeof api.request === 'function',
    container: !!container
  };
  
  console.log('  Prerequisites:', prereqs);
  results.execution.push({ step: 'prerequisites', result: prereqs });
  
  if (!prereqs.loadChatHistory) {
    results.errors.push('loadChatHistory not available');
    console.log('\n❌ Cannot proceed - loadChatHistory not available');
    return results;
  }
  
  // Step 2: Get current state
  console.log('\n📋 Step 2: Current State');
  let currentUrlData = null;
  let pageId = null;
  
  if (stateManager && typeof stateManager.getState === 'function') {
    currentUrlData = stateManager.getState('currentUrlData');
    pageId = currentUrlData?.pageId;
  }
  
  console.log('  currentUrlData:', currentUrlData);
  console.log('  pageId:', pageId);
  results.execution.push({ step: 'currentState', currentUrlData: currentUrlData, pageId: pageId });
  
  // Step 3: Try to get pageId from active tab if missing
  if (!pageId || pageId === 'unknown') {
    console.log('\n📋 Step 3: Getting pageId from active tab');
    try {
      if (typeof chrome !== 'undefined' && chrome.tabs) {
        chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
          if (tabs && tabs.length > 0 && tabs[0] && tabs[0].url) {
            const tabUrl = tabs[0].url;
            console.log('  Active tab URL:', tabUrl);
            
            if (tabUrl && !tabUrl.startsWith('chrome://') && !tabUrl.startsWith('chrome-extension://')) {
              // Simple pageId generation
              const simplePageId = tabUrl.replace(/[^a-zA-Z0-9]/g, '_');
              console.log('  Generated pageId:', simplePageId);
              results.execution.push({ step: 'getPageIdFromTab', url: tabUrl, pageId: simplePageId });
              
              // Step 4: Call loadChatHistory
              console.log('\n📋 Step 4: Calling loadChatHistory');
              console.log('  Calling with pageId:', simplePageId);
              
              const startTime = Date.now();
              loadChatHistory(simplePageId).then(function() {
                const duration = Date.now() - startTime;
                console.log('✅ loadChatHistory completed in', duration, 'ms');
                results.execution.push({ step: 'loadChatHistory', status: 'completed', duration: duration });
                
                // Step 5: Check results
                setTimeout(function() {
                  console.log('\n📋 Step 5: Checking Results');
                  const messagesInContainer = container ? container.children.length : 0;
                  const messagesInState = stateManager && typeof stateManager.getState === 'function' 
                    ? (Array.isArray(stateManager.getState('chat.data')) ? stateManager.getState('chat.data').length : 0)
                    : 0;
                  
                  console.log('  Messages in container:', messagesInContainer);
                  console.log('  Messages in state:', messagesInState);
                  results.execution.push({ 
                    step: 'results', 
                    messagesInContainer: messagesInContainer,
                    messagesInState: messagesInState
                  });
                  
                  if (messagesInContainer === 0 && messagesInState === 0) {
                    results.errors.push('No messages loaded after loadChatHistory');
                    results.recommendations.push('Check console for errors during loadChatHistory');
                    results.recommendations.push('Check Network tab for /api/messages requests');
                    results.recommendations.push('Verify API is returning messages');
                  }
                  
                  console.log('\n📊 FINAL RESULTS:');
                  console.log(JSON.stringify(results, null, 2));
                }, 2000);
              }).catch(function(error) {
                console.error('❌ loadChatHistory failed:', error);
                results.errors.push('loadChatHistory error: ' + (error.message || String(error)));
                results.execution.push({ step: 'loadChatHistory', status: 'error', error: error.message || String(error) });
              });
            } else {
              console.warn('  Invalid tab URL (chrome:// or chrome-extension://)');
              results.errors.push('Invalid tab URL');
            }
          } else {
            console.warn('  No active tab found');
            results.errors.push('No active tab');
          }
        });
      } else {
        console.warn('  chrome.tabs API not available');
        results.errors.push('chrome.tabs API not available');
      }
    } catch (error) {
      console.error('  Error getting tab:', error);
      results.errors.push('Error getting tab: ' + error.message);
    }
  } else {
    // pageId exists, call loadChatHistory directly
    console.log('\n📋 Step 3: Calling loadChatHistory with existing pageId');
    console.log('  pageId:', pageId);
    
    const startTime = Date.now();
    loadChatHistory(pageId).then(function() {
      const duration = Date.now() - startTime;
      console.log('✅ loadChatHistory completed in', duration, 'ms');
      results.execution.push({ step: 'loadChatHistory', status: 'completed', duration: duration });
      
      setTimeout(function() {
        console.log('\n📋 Step 4: Checking Results');
        const messagesInContainer = container ? container.children.length : 0;
        const messagesInState = stateManager && typeof stateManager.getState === 'function' 
          ? (Array.isArray(stateManager.getState('chat.data')) ? stateManager.getState('chat.data').length : 0)
          : 0;
        
        console.log('  Messages in container:', messagesInContainer);
        console.log('  Messages in state:', messagesInState);
        results.execution.push({ 
          step: 'results', 
          messagesInContainer: messagesInContainer,
          messagesInState: messagesInState
        });
        
        console.log('\n📊 FINAL RESULTS:');
        console.log(JSON.stringify(results, null, 2));
      }, 2000);
    }).catch(function(error) {
      console.error('❌ loadChatHistory failed:', error);
      results.errors.push('loadChatHistory error: ' + (error.message || String(error)));
      results.execution.push({ step: 'loadChatHistory', status: 'error', error: error.message || String(error) });
    });
  }
  
  console.log('\n💡 Watch the console for execution steps...');
  console.log('💡 Also check Network tab for /api/messages requests');
  
  return results;
})();



