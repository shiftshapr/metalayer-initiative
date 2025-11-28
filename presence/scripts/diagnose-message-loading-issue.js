/**
 * Diagnostic Script: Message Loading Issue on google.com
 * 
 * Checks:
 * 1. pageId vs normalizedUrl mismatch
 * 2. API query parameters
 * 3. Message system initialization
 * 4. currentUrlData state
 */

(function() {
  'use strict';

  function diagnoseMessageLoading() {
    console.log('\n📋 Issue: Messages Not Loading on google.com');
    const results = {
      currentUrlData: null,
      pageId: null,
      normalizedUrl: null,
      messageSystemInitialized: false,
      loadChatHistoryExists: false,
      lastLoadParams: null,
      apiQuery: null
    };

    const win = window as any;
    
    // Check currentUrlData
    if (win.stateManagerInstance) {
      const urlData = win.stateManagerInstance.getState('currentUrlData');
      if (urlData) {
        results.currentUrlData = urlData;
        results.pageId = urlData.pageId || null;
        results.normalizedUrl = urlData.normalizedUrl || null;
      }
    }

    // Check message system
    results.messageSystemInitialized = !!(win.messageSystemIntegration && win.unifiedMessageDisplay);
    results.loadChatHistoryExists = typeof win.loadChatHistory === 'function';

    // Check if loadChatHistory was called
    if (results.loadChatHistoryExists) {
      // Try to infer from console logs or state
      const chatData = win.stateManagerInstance?.getState('chat.data');
      if (chatData) {
        results.lastLoadParams = {
          messageCount: Array.isArray(chatData) ? chatData.length : 0,
          messages: Array.isArray(chatData) ? chatData.slice(0, 3).map((m: any) => ({ id: m.id, pageId: m.pageId })) : []
        };
      }
    }

    // Check for pageId mismatch
    if (results.pageId && results.normalizedUrl) {
      const mismatch = results.pageId !== results.normalizedUrl;
      results.pageIdMismatch = mismatch;
      if (mismatch) {
        console.warn('⚠️ DIAGNOSTIC: pageId and normalizedUrl differ!', {
          pageId: results.pageId,
          normalizedUrl: results.normalizedUrl
        });
      }
    }

    console.log('  Results:', results);
    return results;
  }

  function runDiagnostic() {
    console.log('🔍 DIAGNOSTIC: Starting message loading diagnostic...');
    
    const results = {
      messageLoading: diagnoseMessageLoading(),
      timestamp: new Date().toISOString()
    };

    console.log('\n📊 SUMMARY:');
    console.log(JSON.stringify(results, null, 2));

    // Expose to window
    (window as any).messageLoadingDiagnosticResults = results;
    return results;
  }

  // Auto-run if in browser
  if (typeof window !== 'undefined') {
    (window as any).runMessageLoadingDiagnostic = runDiagnostic;
    
    // Auto-run after DOM is ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        setTimeout(runDiagnostic, 2000);
      });
    } else {
      setTimeout(runDiagnostic, 2000);
    }
  }

  console.log('✅ Message Loading Diagnostic script loaded. Run: window.runMessageLoadingDiagnostic()');
})();






