/**
 * Diagnostic Script: Find ALL API Calls with Invalid User IDs
 * 
 * Purpose: Trace every single API call to /v1/users/:id to find where Google IDs and emails are being sent
 * 
 * Usage: Run in browser console after extension loads
 * 
 * CRITICAL: This is a pure JavaScript file (.js) - NO TypeScript syntax
 */

(function() {
  'use strict';
  
  console.log('🔍 DIAGNOSTIC: Starting comprehensive API call tracing...');
  
  const results = {
    timestamp: new Date().toISOString(),
    calls: [],
    googleIdCalls: [],
    emailCalls: [],
    stackTraces: {}
  };
  
  // UUID validation regex
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  const googleIdPattern = /^\d{15,21}$/;
  
  // Intercept ALL network requests
  function interceptNetworkRequests() {
    console.log('🔍 Setting up network request interception...');
    
    // Intercept fetch
    const originalFetch = window.fetch;
    window.fetch = function(url, options) {
      const fullUrl = typeof url === 'string' ? url : (url instanceof Request ? url.url : url.href);
      
      if (fullUrl && fullUrl.includes('/v1/users/')) {
        const match = fullUrl.match(/\/v1\/users\/([^\/\?]+)/);
        if (match) {
          const userId = match[1];
          const method = options?.method || (url instanceof Request ? url.method : 'GET');
          const isUuid = uuidRegex.test(userId);
          const isGoogleId = googleIdPattern.test(userId);
          const isEmail = userId.includes('@');
          
          const callInfo = {
            type: 'fetch',
            url: fullUrl,
            endpoint: `/v1/users/${userId}`,
            userId: userId,
            method: method,
            isUuid: isUuid,
            isGoogleId: isGoogleId,
            isEmail: isEmail,
            timestamp: Date.now(),
            stackTrace: new Error().stack
          };
          
          results.calls.push(callInfo);
          
          if (isGoogleId) {
            results.googleIdCalls.push(callInfo);
            console.error('❌ GOOGLE ID FETCH:', callInfo);
          } else if (isEmail && method !== 'POST') {
            results.emailCalls.push(callInfo);
            console.error('❌ EMAIL GET FETCH:', callInfo);
          }
        }
      }
      
      return originalFetch.apply(this, arguments);
    };
    
    // Intercept XMLHttpRequest
    const originalXHROpen = XMLHttpRequest.prototype.open;
    XMLHttpRequest.prototype.open = function(method, url) {
      if (typeof url === 'string' && url.includes('/v1/users/')) {
        const match = url.match(/\/v1\/users\/([^\/\?]+)/);
        if (match) {
          const userId = match[1];
          const isUuid = uuidRegex.test(userId);
          const isGoogleId = googleIdPattern.test(userId);
          const isEmail = userId.includes('@');
          
          const callInfo = {
            type: 'xhr',
            url: url,
            endpoint: `/v1/users/${userId}`,
            userId: userId,
            method: method,
            isUuid: isUuid,
            isGoogleId: isGoogleId,
            isEmail: isEmail,
            timestamp: Date.now(),
            stackTrace: new Error().stack
          };
          
          results.calls.push(callInfo);
          
          if (isGoogleId) {
            results.googleIdCalls.push(callInfo);
            console.error('❌ GOOGLE ID XHR:', callInfo);
          } else if (isEmail && method !== 'POST') {
            results.emailCalls.push(callInfo);
            console.error('❌ EMAIL GET XHR:', callInfo);
          }
        }
      }
      
      return originalXHROpen.apply(this, arguments);
    };
    
    // Intercept window.api.request
    if (window.api && window.api.request) {
      const originalRequest = window.api.request.bind(window.api);
      window.api.request = function(endpoint, options) {
        if (endpoint && endpoint.includes('/v1/users/')) {
          const match = endpoint.match(/\/v1\/users\/([^\/\?]+)/);
          if (match) {
            const userId = match[1];
            const method = options?.method || 'GET';
            const isUuid = uuidRegex.test(userId);
            const isGoogleId = googleIdPattern.test(userId);
            const isEmail = userId.includes('@');
            
            const callInfo = {
              type: 'api.request',
              endpoint: endpoint,
              userId: userId,
              method: method,
              isUuid: isUuid,
              isGoogleId: isGoogleId,
              isEmail: isEmail,
              timestamp: Date.now(),
              stackTrace: new Error().stack
            };
            
            results.calls.push(callInfo);
            
            if (isGoogleId) {
              results.googleIdCalls.push(callInfo);
              console.error('❌ GOOGLE ID API.REQUEST:', callInfo);
            } else if (isEmail && method !== 'POST') {
              results.emailCalls.push(callInfo);
              console.error('❌ EMAIL GET API.REQUEST:', callInfo);
            }
          }
        }
        
        return originalRequest(endpoint, options);
      };
    }
    
    console.log('✅ Network interception active');
  }
  
  // Check current user ID
  function checkCurrentUser() {
    console.log('🔍 Checking currentUser.id...');
    
    const currentUser = window.stateManager?.getState?.('currentUser') || 
                       window.currentUser || null;
    
    if (currentUser && currentUser.id) {
      const isUuid = uuidRegex.test(currentUser.id);
      const isGoogleId = googleIdPattern.test(currentUser.id);
      
      console.log('🔍 currentUser.id:', currentUser.id);
      console.log('🔍 Is UUID?', isUuid);
      console.log('🔍 Is Google ID?', isGoogleId);
      
      if (!isUuid && isGoogleId) {
        console.error('❌ CRITICAL: currentUser.id is still a Google ID!', currentUser.id);
        results.currentUserHasGoogleId = true;
        results.currentUserId = currentUser.id;
      }
    }
  }
  
  // Generate report
  function generateReport() {
    console.log('\n📊 DIAGNOSTIC REPORT: All User API Calls');
    console.log('='.repeat(60));
    
    console.log('\n📞 TOTAL API CALLS:', results.calls.length);
    console.log('🔴 GOOGLE ID CALLS:', results.googleIdCalls.length);
    console.log('🔴 EMAIL GET CALLS:', results.emailCalls.length);
    
    if (results.googleIdCalls.length > 0) {
      console.log('\n❌ GOOGLE ID CALLS FOUND:');
      results.googleIdCalls.forEach((call, index) => {
        console.log(`\n${index + 1}. ${call.type.toUpperCase()} ${call.method} ${call.endpoint}`);
        console.log('   User ID:', call.userId);
        console.log('   Stack trace:', call.stackTrace.split('\n').slice(1, 4).join('\n'));
      });
    }
    
    if (results.emailCalls.length > 0) {
      console.log('\n❌ EMAIL GET CALLS FOUND:');
      results.emailCalls.forEach((call, index) => {
        console.log(`\n${index + 1}. ${call.type.toUpperCase()} ${call.method} ${call.endpoint}`);
        console.log('   Email:', call.userId);
        console.log('   Stack trace:', call.stackTrace.split('\n').slice(1, 4).join('\n'));
      });
    }
    
    if (results.currentUserHasGoogleId) {
      console.log('\n❌ CRITICAL: currentUser.id is still a Google ID:', results.currentUserId);
      console.log('   This means UUID conversion is not working!');
    }
    
    console.log('\n' + '='.repeat(60));
    console.log('✅ Diagnostic complete');
    
    return results;
  }
  
  // Run all checks
  function runDiagnostic() {
    interceptNetworkRequests();
    checkCurrentUser();
    
    // Wait a bit then generate report
    setTimeout(() => {
      generateReport();
    }, 2000);
    
    return results;
  }
  
  // Export to window for manual execution
  window.diagnoseAllUserApiCalls = runDiagnostic;
  
  // Auto-run if in browser console
  if (typeof window !== 'undefined') {
    setTimeout(() => {
      runDiagnostic();
    }, 1000);
  }
  
  return results;
})();






