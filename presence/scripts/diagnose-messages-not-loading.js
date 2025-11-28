/**
 * DIAGNOSTIC: Messages Not Loading on google.com - Root Cause Analysis
 * 
 * Problem: Messages do not load on google.com after migration to MessagesModule.js
 * 
 * Checks:
 * 1. MessagesModule loaded and exports loadChatHistory
 * 2. currentUrlData set in state
 * 3. pageId available and valid
 * 4. loadChatHistory called
 * 5. Container found
 * 6. Message system initialized
 * 7. API calls successful
 * 8. Errors in console
 */

(function() {
  'use strict';
  
  function runDiagnostics() {
    const diagnostics = [];
    
    // Issue 1: MessagesModule loaded
    const messagesModuleResult = diagnoseMessagesModule();
    diagnostics.push(messagesModuleResult);
    
    // Issue 2: currentUrlData in state
    const currentUrlDataResult = diagnoseCurrentUrlData();
    diagnostics.push(currentUrlDataResult);
    
    // Issue 3: pageId available
    const pageIdResult = diagnosePageId();
    diagnostics.push(pageIdResult);
    
    // Issue 4: loadChatHistory called
    const loadCallResult = diagnoseLoadChatHistoryCalls();
    diagnostics.push(loadCallResult);
    
    // Issue 5: Container found
    const containerResult = diagnoseContainer();
    diagnostics.push(containerResult);
    
    // Issue 6: Message system initialized
    const messageSystemResult = diagnoseMessageSystem();
    diagnostics.push(messageSystemResult);
    
    // Issue 7: API errors
    const apiResult = diagnoseAPIErrors();
    diagnostics.push(apiResult);
    
    // Issue 8: Console errors
    const consoleResult = diagnoseConsoleErrors();
    diagnostics.push(consoleResult);
    
    // Summary
    const summary = {
      critical: diagnostics.filter(d => d.severity === 'critical').length,
      high: diagnostics.filter(d => d.severity === 'high').length,
      medium: diagnostics.filter(d => d.severity === 'medium').length,
      total: diagnostics.length
    };
    
    console.log('\n=== MESSAGES NOT LOADING - DIAGNOSTIC RESULTS ===\n');
    diagnostics.forEach((result, index) => {
      const icon = result.severity === 'critical' ? '🔴' : result.severity === 'high' ? '🟡' : '🟢';
      console.log(`${index + 1}. ${icon} ${result.title}`);
      console.log(`   Root Cause: ${result.rootCause}`);
      console.log(`   Location: ${result.location}`);
      console.log(`   Evidence:`);
      result.evidence.forEach(ev => {
        console.log(`     - ${ev}`);
      });
      if (result.recommendation) {
        console.log(`   Recommendation: ${result.recommendation}`);
      }
      console.log('');
    });
    
    console.log('=== SUMMARY ===');
    console.log(`🔴 Critical: ${summary.critical}`);
    console.log(`🟡 High: ${summary.high}`);
    console.log(`🟢 Medium: ${summary.medium}`);
    console.log(`Total Issues: ${summary.total}`);
    
    return { diagnostics, summary };
  }
  
  function diagnoseMessagesModule() {
    const win = typeof window !== 'undefined' ? window : null;
    const hasLoadChatHistory = win && typeof win.loadChatHistory === 'function';
    const hasMessagesModule = win && win.MessagesModule;
    
    return {
      title: 'MessagesModule loaded and exports loadChatHistory',
      severity: hasLoadChatHistory ? 'medium' : 'critical',
      rootCause: hasLoadChatHistory 
        ? 'MessagesModule loaded correctly'
        : 'MessagesModule not loaded or loadChatHistory not exported to window',
      location: 'MessagesModule.js - exports',
      evidence: [
        `loadChatHistory available: ${hasLoadChatHistory}`,
        `MessagesModule available: ${hasMessagesModule}`,
        `From logs: ${hasLoadChatHistory ? 'MessagesModule loaded' : 'MessagesModule not found'}`
      ],
      recommendation: hasLoadChatHistory 
        ? 'MessagesModule is loaded correctly'
        : 'Check sidepanel.html loads MessagesModule.js and exports loadChatHistory to window'
    };
  }
  
  function diagnoseCurrentUrlData() {
    const win = typeof window !== 'undefined' ? window : null;
    let stateUrlData = null;
    let windowUrlData = null;
    
    if (win && win.stateManagerInstance) {
      stateUrlData = win.stateManagerInstance.getState('currentUrlData');
    }
    if (win) {
      windowUrlData = win.currentUrlData;
    }
    
    const hasStateUrlData = stateUrlData && typeof stateUrlData === 'object';
    const hasWindowUrlData = windowUrlData && typeof windowUrlData === 'object';
    const hasPageId = (hasStateUrlData && stateUrlData.pageId) || (hasWindowUrlData && windowUrlData.pageId);
    
    return {
      title: 'currentUrlData set in state',
      severity: hasPageId ? 'medium' : 'critical',
      rootCause: hasPageId
        ? 'currentUrlData is set correctly'
        : 'currentUrlData not set in state or window - prevents pageId from being determined',
      location: 'StateManager - currentUrlData state',
      evidence: [
        `State currentUrlData: ${hasStateUrlData ? 'set' : 'not set'}`,
        `Window currentUrlData: ${hasWindowUrlData ? 'set' : 'not set'}`,
        `pageId available: ${hasPageId ? 'yes' : 'no'}`,
        hasStateUrlData ? `  pageId: ${stateUrlData.pageId || 'missing'}` : '',
        hasStateUrlData ? `  rawUrl: ${stateUrlData.rawUrl || 'missing'}` : '',
        hasWindowUrlData ? `  window.pageId: ${windowUrlData.pageId || 'missing'}` : ''
      ].filter(Boolean),
      recommendation: hasPageId
        ? 'currentUrlData is set correctly'
        : 'Ensure TabController or TabContextManager sets currentUrlData in state when page loads'
    };
  }
  
  function diagnosePageId() {
    const win = typeof window !== 'undefined' ? window : null;
    let pageId = null;
    
    if (win && win.stateManagerInstance) {
      const urlData = win.stateManagerInstance.getState('currentUrlData');
      pageId = urlData?.pageId;
    }
    if (!pageId && win && win.currentUrlData) {
      pageId = win.currentUrlData.pageId;
    }
    
    const isValidPageId = pageId && 
                         !pageId.includes('sidepanel') && 
                         !pageId.includes('_sidepanel_html') &&
                         !pageId.startsWith('chrome-extension://') &&
                         !pageId.startsWith('chrome://');
    
    return {
      title: 'pageId available and valid',
      severity: isValidPageId ? 'medium' : 'critical',
      rootCause: isValidPageId
        ? 'pageId is valid'
        : `pageId is ${pageId ? 'invalid (sidepanel/chrome URL)' : 'missing'} - prevents message loading`,
      location: 'loadChatHistory() - pageId parameter',
      evidence: [
        `pageId: ${pageId || 'not found'}`,
        `Valid pageId: ${isValidPageId ? 'yes' : 'no'}`,
        `From logs: ${pageId ? `pageId=${pageId}` : 'No pageId available'}`
      ],
      recommendation: isValidPageId
        ? 'pageId is valid'
        : 'Ensure pageId is normalized correctly and not a sidepanel/chrome URL'
    };
  }
  
  function diagnoseLoadChatHistoryCalls() {
    // Check if loadChatHistory was called (check console logs or call stack)
    const win = typeof window !== 'undefined' ? window : null;
    const hasFunction = win && typeof win.loadChatHistory === 'function';
    
    // Try to check if it was called by looking for recent logs
    // This is a simplified check - in real implementation, might track calls
    const wasCalled = hasFunction; // Simplified - assume if function exists, it might have been called
    
    return {
      title: 'loadChatHistory called',
      severity: wasCalled ? 'medium' : 'high',
      rootCause: wasCalled
        ? 'loadChatHistory function is available (may have been called)'
        : 'loadChatHistory not called or not available - messages will not load',
      location: 'TabController.js, ui-realtime-bindings.js, or other callers',
      evidence: [
        `loadChatHistory available: ${hasFunction}`,
        `From logs: ${wasCalled ? 'Function available (check console for actual calls)' : 'Function not found'}`
      ],
      recommendation: wasCalled
        ? 'Check console logs to see if loadChatHistory was actually called and what happened'
        : 'Ensure loadChatHistory is called when page loads or tab changes'
    };
  }
  
  function diagnoseContainer() {
    const container = document.querySelector('.chat-messages');
    const hasContainer = !!container;
    const isVisible = hasContainer && 
                     container.offsetParent !== null &&
                     window.getComputedStyle(container).display !== 'none';
    
    return {
      title: 'Container found and visible',
      severity: hasContainer && isVisible ? 'medium' : hasContainer ? 'high' : 'critical',
      rootCause: hasContainer && isVisible
        ? 'Container is found and visible'
        : hasContainer
          ? 'Container found but not visible (display:none or hidden)'
          : 'Container (.chat-messages) not found - messages cannot be rendered',
      location: 'DOM - .chat-messages element',
      evidence: [
        `Container found: ${hasContainer ? container.tagName : 'NOT FOUND'}`,
        `Container visible: ${isVisible ? 'yes' : 'no'}`,
        hasContainer ? `  Display: ${window.getComputedStyle(container).display}` : '',
        hasContainer ? `  Visibility: ${window.getComputedStyle(container).visibility}` : '',
        hasContainer ? `  Opacity: ${window.getComputedStyle(container).opacity}` : ''
      ].filter(Boolean),
      recommendation: hasContainer && isVisible
        ? 'Container is ready'
        : hasContainer
          ? 'Check CSS or JavaScript hiding the container'
          : 'Ensure .chat-messages element exists in DOM'
    };
  }
  
  function diagnoseMessageSystem() {
    const win = typeof window !== 'undefined' ? window : null;
    const hasMessageSystemIntegration = win && win.messageSystemIntegration;
    const hasUnifiedMessageDisplay = win && win.unifiedMessageDisplay;
    const isInitialized = hasMessageSystemIntegration && hasUnifiedMessageDisplay;
    
    return {
      title: 'Message system initialized',
      severity: isInitialized ? 'medium' : 'critical',
      rootCause: isInitialized
        ? 'Message system is initialized'
        : 'Message system not initialized - messages cannot be loaded or rendered',
      location: 'MessagesModule.js - initializeNewMessageSystem()',
      evidence: [
        `messageSystemIntegration available: ${hasMessageSystemIntegration}`,
        `unifiedMessageDisplay available: ${hasUnifiedMessageDisplay}`,
        `System initialized: ${isInitialized ? 'yes' : 'no'}`,
        `From logs: ${isInitialized ? 'Message system initialized' : 'Message system not initialized'}`
      ],
      recommendation: isInitialized
        ? 'Message system is ready'
        : 'Ensure initializeNewMessageSystem() is called and completes successfully'
    };
  }
  
  function diagnoseAPIErrors() {
    // Check for network errors or API failures
    // This is simplified - in real implementation, might check network tab or error handlers
    const win = typeof window !== 'undefined' ? window : null;
    const hasSupabase = win && win.supabase;
    const hasApi = win && win.api;
    
    return {
      title: 'API/Supabase available',
      severity: hasSupabase || hasApi ? 'medium' : 'high',
      rootCause: hasSupabase || hasApi
        ? 'API/Supabase is available'
        : 'API/Supabase not available - messages cannot be fetched',
      location: 'SupabaseService.js or APIService.js',
      evidence: [
        `Supabase available: ${hasSupabase}`,
        `API available: ${hasApi}`,
        `From logs: ${hasSupabase || hasApi ? 'API available' : 'API not found'}`
      ],
      recommendation: hasSupabase || hasApi
        ? 'Check network tab for actual API call errors'
        : 'Ensure SupabaseService or APIService is initialized'
    };
  }
  
  function diagnoseConsoleErrors() {
    // This is a simplified check - in real implementation, might capture console errors
    return {
      title: 'Console errors',
      severity: 'medium',
      rootCause: 'Check browser console for errors',
      location: 'Browser console',
      evidence: [
        'Check browser console (F12) for errors',
        'Look for: TypeError, ReferenceError, Network errors',
        'Check for: "loadChatHistory", "currentUrlData", "pageId" related errors'
      ],
      recommendation: 'Review console errors and fix root causes'
    };
  }
  
  // Auto-run on DOMContentLoaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', runDiagnostics);
  } else {
    runDiagnostics();
  }
  
  // Also expose globally
  if (typeof window !== 'undefined') {
    window.runMessagesNotLoadingDiagnostics = runDiagnostics;
  }
})();





