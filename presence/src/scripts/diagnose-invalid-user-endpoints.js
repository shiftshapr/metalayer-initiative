/**
 * Diagnostic Script: Trace Invalid /v1/users/ Endpoint Requests
 * 
 * Purpose: Identify where email/Google ID requests to /v1/users/:id are coming from
 * 
 * Usage: Run in browser console after extension loads
 * 
 * CRITICAL: This is a pure JavaScript file (.js) - NO TypeScript syntax
 * - NO type annotations
 * - NO ES6 imports/exports
 * - Use window.* for accessing modules
 */

(function() {
  'use strict';
  
  console.log('🔍 DIAGNOSTIC: Starting Invalid User Endpoint Detection...');
  
  const results = {
    timestamp: new Date().toISOString(),
    invalidRequests: [],
    validRequests: [],
    interceptors: {
      apiRequest: false,
      fetch: false,
      xhr: false
    }
  };
  
  // UUID validation regex
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  
  // Google ID pattern (long numeric string, typically 19-21 digits)
  const googleIdPattern = /^\d{15,21}$/;
  
  // Check if endpoint is invalid
  function isInvalidUserEndpoint(endpoint, method) {
    const userEndpointMatch = endpoint.match(/^\/v1\/users\/([^\/\?]+)/);
    if (!userEndpointMatch) {
      return false; // Not a /v1/users/ endpoint
    }
    
    const userId = userEndpointMatch[1];
    
    // Special endpoints are always valid
    if (userId === 'me' || userId === 'preferences' || userId === 'update-avatar' || userId === 'update-preferences') {
      return false;
    }
    
    // Email endpoints are ONLY valid for POST
    if (userId.includes('@')) {
      if (method === 'POST') {
        return false; // Valid - POST /v1/users/:email is allowed
      } else {
        return true; // Invalid - GET/PATCH/PUT/DELETE with email
      }
    }
    
    // Google ID or non-UUID is invalid for GET/PATCH/PUT/DELETE
    if (!uuidRegex.test(userId)) {
      if (method === 'POST') {
        return false; // POST might be creating user, allow it
      } else {
        return true; // Invalid - non-UUID for non-POST methods
      }
    }
    
    return false; // Valid UUID
  }
  
  // Intercept window.api.request
  function interceptApiRequest() {
    if (!window.api || !window.api.request) {
      console.warn('⚠️ window.api.request not available');
      return;
    }
    
    const originalRequest = window.api.request.bind(window.api);
    
    window.api.request = function(endpoint, options) {
      const method = (options && options.method) || 'GET';
      const isInvalid = isInvalidUserEndpoint(endpoint, method);
      
      if (isInvalid) {
        const userId = endpoint.match(/^\/v1\/users\/([^\/\?]+)/)[1];
        const isEmail = userId.includes('@');
        const isGoogleId = googleIdPattern.test(userId);
        
        results.invalidRequests.push({
          type: 'api.request',
          endpoint: endpoint,
          method: method,
          userId: userId,
          isEmail: isEmail,
          isGoogleId: isGoogleId,
          stackTrace: new Error().stack,
          timestamp: new Date().toISOString()
        });
        
        console.error('❌ INVALID REQUEST DETECTED:', {
          source: 'window.api.request',
          endpoint: endpoint,
          method: method,
          userId: userId,
          type: isEmail ? 'EMAIL' : (isGoogleId ? 'GOOGLE_ID' : 'INVALID_FORMAT')
        });
      } else {
        results.validRequests.push({
          type: 'api.request',
          endpoint: endpoint,
          method: method,
          timestamp: new Date().toISOString()
        });
      }
      
      return originalRequest(endpoint, options);
    };
    
    results.interceptors.apiRequest = true;
    console.log('✅ Intercepted window.api.request');
  }
  
  // Intercept fetch
  function interceptFetch() {
    if (typeof window.fetch === 'undefined') {
      console.warn('⚠️ window.fetch not available');
      return;
    }
    
    const originalFetch = window.fetch;
    
    window.fetch = function(url, options) {
      let endpoint = '';
      if (typeof url === 'string') {
        endpoint = url.replace(/^https?:\/\/[^\/]+/, '');
      } else if (url instanceof Request) {
        endpoint = url.url.replace(/^https?:\/\/[^\/]+/, '');
      } else if (url instanceof URL) {
        endpoint = url.pathname + url.search;
      }
      
      if (endpoint.startsWith('/v1/users/')) {
        const method = (options && options.method) || 'GET';
        const isInvalid = isInvalidUserEndpoint(endpoint, method);
        
        if (isInvalid) {
          const userId = endpoint.match(/^\/v1\/users\/([^\/\?]+)/)[1];
          const isEmail = userId.includes('@');
          const isGoogleId = googleIdPattern.test(userId);
          
          results.invalidRequests.push({
            type: 'fetch',
            endpoint: endpoint,
            method: method,
            userId: userId,
            isEmail: isEmail,
            isGoogleId: isGoogleId,
            stackTrace: new Error().stack,
            timestamp: new Date().toISOString()
          });
          
          console.error('❌ INVALID FETCH REQUEST:', {
            source: 'window.fetch',
            endpoint: endpoint,
            method: method,
            userId: userId,
            type: isEmail ? 'EMAIL' : (isGoogleId ? 'GOOGLE_ID' : 'INVALID_FORMAT')
          });
        }
      }
      
      return originalFetch.apply(this, arguments);
    };
    
    results.interceptors.fetch = true;
    console.log('✅ Intercepted window.fetch');
  }
  
  // Intercept XMLHttpRequest
  function interceptXHR() {
    if (typeof XMLHttpRequest === 'undefined') {
      console.warn('⚠️ XMLHttpRequest not available');
      return;
    }
    
    const originalOpen = XMLHttpRequest.prototype.open;
    
    XMLHttpRequest.prototype.open = function(method, url, async, username, password) {
      if (typeof url === 'string') {
        const endpoint = url.replace(/^https?:\/\/[^\/]+/, '');
        
        if (endpoint.startsWith('/v1/users/')) {
          const isInvalid = isInvalidUserEndpoint(endpoint, method);
          
          if (isInvalid) {
            const userId = endpoint.match(/^\/v1\/users\/([^\/\?]+)/)[1];
            const isEmail = userId.includes('@');
            const isGoogleId = googleIdPattern.test(userId);
            
            results.invalidRequests.push({
              type: 'XMLHttpRequest',
              endpoint: endpoint,
              method: method,
              userId: userId,
              isEmail: isEmail,
              isGoogleId: isGoogleId,
              stackTrace: new Error().stack,
              timestamp: new Date().toISOString()
            });
            
            console.error('❌ INVALID XHR REQUEST:', {
              source: 'XMLHttpRequest',
              endpoint: endpoint,
              method: method,
              userId: userId,
              type: isEmail ? 'EMAIL' : (isGoogleId ? 'GOOGLE_ID' : 'INVALID_FORMAT')
            });
          }
        }
      }
      
      return originalOpen.apply(this, arguments);
    };
    
    results.interceptors.xhr = true;
    console.log('✅ Intercepted XMLHttpRequest');
  }
  
  // Generate report
  function generateReport() {
    console.log('\n📊 DIAGNOSTIC REPORT: Invalid User Endpoint Detection');
    console.log('='.repeat(60));
    
    console.log('\n🔴 INVALID REQUESTS:', results.invalidRequests.length);
    results.invalidRequests.forEach((req, index) => {
      console.log(`\n${index + 1}. [${req.type.toUpperCase()}] ${req.method} ${req.endpoint}`);
      console.log(`   User ID: ${req.userId}`);
      console.log(`   Type: ${req.isEmail ? 'EMAIL' : (req.isGoogleId ? 'GOOGLE_ID' : 'INVALID_FORMAT')}`);
      console.log(`   Timestamp: ${req.timestamp}`);
      if (req.stackTrace) {
        const stackLines = req.stackTrace.split('\n').slice(0, 5);
        console.log(`   Stack trace (first 5 lines):`);
        stackLines.forEach(line => console.log(`     ${line.trim()}`));
      }
    });
    
    console.log('\n✅ VALID REQUESTS:', results.validRequests.length);
    if (results.validRequests.length > 0) {
      console.log('   (Valid requests are being properly validated)');
    }
    
    console.log('\n🔧 INTERCEPTORS STATUS:');
    console.log(`   window.api.request: ${results.interceptors.apiRequest ? '✅ Active' : '❌ Not active'}`);
    console.log(`   window.fetch: ${results.interceptors.fetch ? '✅ Active' : '❌ Not active'}`);
    console.log(`   XMLHttpRequest: ${results.interceptors.xhr ? '✅ Active' : '❌ Not active'}`);
    
    console.log('\n' + '='.repeat(60));
    console.log('✅ Diagnostic complete');
    console.log('\n💡 TIP: Check the stack traces above to find the source of invalid requests');
    
    return results;
  }
  
  // Setup interceptors
  function setupInterceptors() {
    interceptApiRequest();
    interceptFetch();
    interceptXHR();
    
    console.log('✅ All interceptors setup complete');
    console.log('📋 Monitoring for invalid /v1/users/ requests...');
    console.log('📋 Run generateReport() or wait for requests to see results');
  }
  
  // Export to window
  window.diagnoseInvalidUserEndpoints = {
    results: results,
    generateReport: generateReport,
    setupInterceptors: setupInterceptors
  };
  
  // Auto-setup
  setupInterceptors();
  
  // Auto-generate report after 5 seconds
  setTimeout(() => {
    if (results.invalidRequests.length > 0 || results.validRequests.length > 0) {
      generateReport();
    } else {
      console.log('ℹ️ No requests detected yet. Run generateReport() manually after making requests.');
    }
  }, 5000);
  
  return results;
})();






