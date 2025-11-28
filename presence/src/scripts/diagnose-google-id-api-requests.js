/**
 * Diagnostic Script: Find Google ID API Requests
 * 
 * Purpose: Identify where Google IDs (non-UUIDs) are being sent to /v1/users/:id endpoints
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
  
  console.log('🔍 DIAGNOSTIC: Starting Google ID API Request Detection...');
  
  const results = {
    timestamp: new Date().toISOString(),
    issues: [],
    warnings: [],
    recommendations: []
  };
  
  // UUID validation regex
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  
  // Google ID pattern (long numeric string, typically 19-21 digits)
  const googleIdPattern = /^\d{15,21}$/;
  
  // Check current user ID
  function checkCurrentUserId() {
    console.log('🔍 Checking currentUser.id...');
    
    const currentUser = window.stateManager?.getState?.('currentUser') || 
                       window.currentUser || null;
    
    if (!currentUser) {
      results.warnings.push({
        type: 'no_current_user',
        message: 'No currentUser found - cannot check user ID format'
      });
      return;
    }
    
    const userId = currentUser.id;
    
    if (!userId) {
      results.warnings.push({
        type: 'no_user_id',
        message: 'currentUser exists but has no id property'
      });
      return;
    }
    
    const isUuid = uuidRegex.test(userId);
    const isGoogleId = googleIdPattern.test(userId);
    
    console.log('🔍 currentUser.id:', userId);
    console.log('🔍 Is UUID?', isUuid);
    console.log('🔍 Is Google ID?', isGoogleId);
    
    if (!isUuid && isGoogleId) {
      results.issues.push({
        type: 'google_id_in_current_user',
        severity: 'high',
        message: `currentUser.id is a Google ID (${userId}) instead of UUID`,
        location: 'window.currentUser.id or stateManager.currentUser.id',
        impact: 'API requests to /v1/users/:id will fail with 400 Bad Request',
        recommendation: 'Ensure handleUserChange() converts Google ID to UUID before setting currentUser'
      });
    } else if (!isUuid && !isGoogleId) {
      results.warnings.push({
        type: 'unknown_id_format',
        message: `currentUser.id has unknown format: ${userId}`
      });
    }
  }
  
  // Intercept API requests to detect Google IDs
  function interceptApiRequests() {
    console.log('🔍 Setting up API request interception...');
    
    if (!window.api || !window.api.request) {
      results.warnings.push({
        type: 'no_api_client',
        message: 'window.api.request not available - cannot intercept requests'
      });
      return;
    }
    
    // Store original request method
    const originalRequest = window.api.request.bind(window.api);
    
    // Wrap request method
    window.api.request = function(endpoint, options) {
      // Check if endpoint contains /v1/users/ with an ID
      const userEndpointMatch = endpoint.match(/\/v1\/users\/([^\/\?]+)/);
      
      if (userEndpointMatch) {
        const userId = userEndpointMatch[1];
        const isUuid = uuidRegex.test(userId);
        const isGoogleId = googleIdPattern.test(userId);
        
        if (!isUuid && isGoogleId) {
          results.issues.push({
            type: 'google_id_in_api_request',
            severity: 'critical',
            message: `API request to /v1/users/${userId} uses Google ID instead of UUID`,
            endpoint: endpoint,
            method: options?.method || 'GET',
            stackTrace: new Error().stack,
            recommendation: 'Convert Google ID to UUID before making API request'
          });
          
          console.error('❌ DIAGNOSTIC: Google ID detected in API request:', {
            endpoint,
            userId,
            method: options?.method || 'GET'
          });
        } else if (!isUuid && !isGoogleId && userId !== 'me' && !userId.includes('@')) {
          // Not a UUID, not a Google ID, not 'me', not an email
          results.warnings.push({
            type: 'unexpected_id_format',
            message: `Unexpected ID format in API request: ${userId}`,
            endpoint: endpoint
          });
        }
      }
      
      // Call original request
      return originalRequest(endpoint, options);
    };
    
    console.log('✅ API request interception active');
  }
  
  // Check network requests from performance API
  function checkNetworkRequests() {
    console.log('🔍 Checking network requests...');
    
    if (typeof PerformanceObserver === 'undefined') {
      results.warnings.push({
        type: 'no_performance_observer',
        message: 'PerformanceObserver not available - cannot check network requests'
      });
      return;
    }
    
    try {
      const entries = performance.getEntriesByType('resource');
      const userApiRequests = entries.filter(entry => 
        entry.name && entry.name.includes('/v1/users/')
      );
      
      userApiRequests.forEach(entry => {
        const match = entry.name.match(/\/v1\/users\/([^\/\?]+)/);
        if (match) {
          const userId = match[1];
          const isUuid = uuidRegex.test(userId);
          const isGoogleId = googleIdPattern.test(userId);
          
          if (!isUuid && isGoogleId) {
            results.issues.push({
              type: 'google_id_in_network_request',
              severity: 'high',
              message: `Network request to /v1/users/${userId} uses Google ID`,
              url: entry.name,
              timestamp: entry.startTime
            });
          }
        }
      });
    } catch (error) {
      results.warnings.push({
        type: 'network_check_error',
        message: `Error checking network requests: ${error.message}`
      });
    }
  }
  
  // Check code locations that might send Google IDs
  function checkCodeLocations() {
    console.log('🔍 Checking code locations...');
    
    // Check if handleUserChange exists and is being called
    if (typeof window.handleUserChange === 'function') {
      results.recommendations.push({
        type: 'handleUserChange_available',
        message: 'window.handleUserChange is available - ensure it converts Google IDs to UUIDs'
      });
    } else {
      results.warnings.push({
        type: 'no_handleUserChange',
        message: 'window.handleUserChange not found - UUID conversion may not be happening'
      });
    }
    
    // Check AuthModule
    if (window.authManager || window.authManagerInstance) {
      results.recommendations.push({
        type: 'auth_manager_available',
        message: 'AuthManager is available - check if it properly converts Google IDs to UUIDs'
      });
    }
  }
  
  // Generate report
  function generateReport() {
    console.log('\n📊 DIAGNOSTIC REPORT: Google ID API Request Detection');
    console.log('='.repeat(60));
    
    console.log('\n🔴 CRITICAL ISSUES:', results.issues.length);
    results.issues.forEach((issue, index) => {
      console.log(`\n${index + 1}. [${issue.severity.toUpperCase()}] ${issue.type}`);
      console.log(`   Message: ${issue.message}`);
      if (issue.location) console.log(`   Location: ${issue.location}`);
      if (issue.endpoint) console.log(`   Endpoint: ${issue.endpoint}`);
      if (issue.recommendation) console.log(`   Fix: ${issue.recommendation}`);
    });
    
    console.log('\n⚠️  WARNINGS:', results.warnings.length);
    results.warnings.forEach((warning, index) => {
      console.log(`\n${index + 1}. ${warning.type}`);
      console.log(`   ${warning.message}`);
    });
    
    console.log('\n💡 RECOMMENDATIONS:', results.recommendations.length);
    results.recommendations.forEach((rec, index) => {
      console.log(`\n${index + 1}. ${rec.message}`);
    });
    
    console.log('\n' + '='.repeat(60));
    console.log('✅ Diagnostic complete');
    
    return results;
  }
  
  // Run all checks
  function runDiagnostic() {
    checkCurrentUserId();
    interceptApiRequests();
    checkNetworkRequests();
    checkCodeLocations();
    return generateReport();
  }
  
  // Export to window for manual execution
  window.diagnoseGoogleIdApiRequests = runDiagnostic;
  
  // Auto-run if in browser console
  if (typeof window !== 'undefined') {
    // Wait a bit for extension to initialize
    setTimeout(() => {
      runDiagnostic();
    }, 1000);
  }
  
  return results;
})();






