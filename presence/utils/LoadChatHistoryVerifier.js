/**
 * LoadChatHistoryVerifier.js
 * Moved from inline script to fix CSP violation
 * Verifies loadChatHistory is exported immediately after CanopiModule.js loads
 */

(function() {
  'use strict';
  
  // Verify loadChatHistory is exported immediately after CanopiModule.js loads
  if (typeof window.loadChatHistory !== 'function') {
    console.warn('⚠️ INIT: loadChatHistory not immediately available after CanopiModule.js load');
    // Wait a bit and check again
    setTimeout(() => {
      if (typeof window.loadChatHistory === 'function') {
        console.log('✅ INIT: loadChatHistory available after delay');
      } else {
        console.error('❌ INIT: loadChatHistory STILL not available - check CanopiModule.js for errors');
      }
    }, 100);
  } else {
    console.log('✅ INIT: loadChatHistory available immediately after CanopiModule.js load');
  }
})();


