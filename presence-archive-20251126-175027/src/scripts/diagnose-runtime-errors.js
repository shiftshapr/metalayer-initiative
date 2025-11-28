/**
 * Diagnostic Script: Runtime Errors Investigation
 * 
 * This script diagnoses three types of runtime errors:
 * 1. .build-info.json ERR_FILE_NOT_FOUND
 * 2. ThemeChangeTracker ERR_FILE_NOT_FOUND
 * 3. 216.238.91.120:3002/v1/users/... 400 Bad Request and ERR_CONNECTION_REFUSED
 * 
 * Usage: Run in browser console
 */

(function() {
  console.log('🔍 DIAGNOSTIC: Runtime Errors Investigation');
  console.log('=========================================\n');

  const results = {
    timestamp: new Date().toISOString(),
    issues: [],
    warnings: [],
    checks: {}
  };

  // ==========================================
  // CHECK 1: .build-info.json availability
  // ==========================================
  console.log('📋 CHECK 1: .build-info.json availability');
  console.log('----------------------------------------');
  
  if (typeof chrome === 'undefined' || !chrome.runtime) {
    results.issues.push('Chrome runtime API not available - cannot check .build-info.json');
    results.checks.buildInfo = { available: false, reason: 'Chrome runtime API not available' };
  } else {
    try {
      const buildInfoUrl = chrome.runtime.getURL('.build-info.json');
      results.checks.buildInfo = { url: buildInfoUrl, available: null };
      console.log('✅ Build info URL:', buildInfoUrl);
      
      // Try to fetch
      (async function() {
        try {
          const response = await fetch(buildInfoUrl, { cache: 'no-cache' });
          if (response.ok) {
            const buildInfo = await response.json();
            results.checks.buildInfo.available = true;
            results.checks.buildInfo.data = buildInfo;
            console.log('✅ .build-info.json loaded successfully:', buildInfo);
          } else {
            results.checks.buildInfo.available = false;
            results.checks.buildInfo.status = response.status;
            results.warnings.push(`.build-info.json returned HTTP ${response.status} - may have fallback in BuildTracker`);
            console.log(`⚠️ .build-info.json returned HTTP ${response.status} (non-critical if BuildTracker has fallback)`);
          }
        } catch (error) {
          results.checks.buildInfo.available = false;
          results.checks.buildInfo.error = error.message;
          results.warnings.push(`.build-info.json fetch failed: ${error.message} - may have fallback in BuildTracker`);
          console.log(`⚠️ .build-info.json fetch failed: ${error.message} (non-critical if BuildTracker has fallback)`);
        }
      })();
    } catch (error) {
      results.issues.push('Failed to get URL for .build-info.json: ' + error.message);
      results.checks.buildInfo = { available: false, error: error.message };
      console.error('❌ Failed to get build info URL:', error);
    }
  }

  // ==========================================
  // CHECK 2: ThemeChangeTracker availability
  // ==========================================
  console.log('\n📋 CHECK 2: ThemeChangeTracker availability');
  console.log('----------------------------------------');
  
  // Check if ThemeChangeTracker is expected to be available
  // Based on code analysis, it's loaded dynamically with a catch block
  // that logs a warning - it's explicitly non-critical
  results.checks.themeChangeTracker = {
    expected: 'Dynamically loaded with catch block - non-critical',
    status: 'optional'
  };
  results.warnings.push('ThemeChangeTracker ERR_FILE_NOT_FOUND is expected and non-critical (theme tracking is optional for debugging)');
  console.log('✅ ThemeChangeTracker is loaded dynamically with error handling - ERR_FILE_NOT_FOUND is expected and non-critical');

  // ==========================================
  // CHECK 3: API Configuration and 400 errors
  // ==========================================
  console.log('\n📋 CHECK 3: API Configuration and 400 errors');
  console.log('----------------------------------------');
  
  // Check API configuration
  const apiBaseUrl = window.API_BASE_URL || window.METALAYER_API_URL || window.CANOPI_API_URL;
  const apiConfig = window.API_CONFIG || (window.configManager ? window.configManager.get('apiUrl') : null);
  const currentEnvironment = window.configManager ? window.configManager.currentEnvironment : 'unknown';
  
  results.checks.apiConfig = {
    apiBaseUrl: apiBaseUrl,
    apiConfig: apiConfig,
    environment: currentEnvironment,
    hardcodedIP: apiBaseUrl && apiBaseUrl.includes('216.238.91.120:3002')
  };
  
  console.log('API Base URL:', apiBaseUrl || 'not set');
  console.log('API Config:', apiConfig || 'not set');
  console.log('Environment:', currentEnvironment);
  
  if (results.checks.apiConfig.hardcodedIP) {
    results.warnings.push('Using hardcoded IP 216.238.91.120:3002 (development mode)');
    console.log('⚠️ Using hardcoded IP 216.238.91.120:3002 (development mode)');
  }
  
  // Check if API service is available
  if (window.api && typeof window.api.request === 'function') {
    results.checks.apiService = { available: true };
    console.log('✅ API service available');
    
    // Try a test request to see what happens
    if (window.currentUser && window.currentUser.id) {
      const testUserId = window.currentUser.id;
      console.log(`\n🧪 Testing API request to /v1/users/${testUserId}...`);
      
      (async function() {
        try {
          const response = await window.api.request(`/v1/users/${testUserId}`, { method: 'GET' });
          results.checks.apiTest = {
            success: true,
            status: response.status,
            hasData: !!response.data
          };
          console.log('✅ API test request succeeded:', response.status);
        } catch (error) {
          results.checks.apiTest = {
            success: false,
            error: error.message || String(error)
          };
          results.warnings.push(`API test request failed: ${error.message || String(error)} - this may explain 400 errors`);
          console.log(`⚠️ API test request failed: ${error.message || String(error)}`);
        }
      })();
    } else {
      results.checks.apiTest = { skipped: true, reason: 'No currentUser.id available' };
      console.log('⚠️ Skipping API test - no currentUser.id available');
    }
  } else {
    results.checks.apiService = { available: false };
    results.warnings.push('API service not available on window.api');
    console.log('⚠️ API service not available on window.api');
  }
  
  // Check network requests from console
  console.log('\n📋 CHECK 4: Network Request Analysis');
  console.log('----------------------------------------');
  console.log('Review browser Network tab for:');
  console.log('  - 400 Bad Request responses from 216.238.91.120:3002/v1/users/...');
  console.log('  - ERR_CONNECTION_REFUSED errors');
  console.log('  - Request headers and payloads');
  console.log('  - Response bodies (if available)');
  
  results.checks.networkAnalysis = {
    note: 'Manual review required in browser Network tab',
    commonCauses: [
      'Missing or incorrect request headers',
      'Server-side validation rejecting requests',
      'Server not running or not accessible',
      'CORS issues',
      'Authentication/authorization problems'
    ]
  };

  // ==========================================
  // SUMMARY
  // ==========================================
  setTimeout(() => {
    console.log('\n=========================================');
    console.log('📊 DIAGNOSTIC SUMMARY');
    console.log('=========================================');
    console.log('Issues Found:', results.issues.length);
    results.issues.forEach((issue, i) => {
      console.log(`  ❌ ${i + 1}. ${issue}`);
    });
    
    console.log('\nWarnings Found:', results.warnings.length);
    results.warnings.forEach((warning, i) => {
      console.log(`  ⚠️ ${i + 1}. ${warning}`);
    });
    
    console.log('\n📋 ASSESSMENT:');
    console.log('----------------------------------------');
    
    if (results.issues.length === 0 && results.warnings.length <= 2) {
      console.log('✅ MOSTLY NON-CRITICAL:');
      console.log('  - .build-info.json: May have fallback in BuildTracker');
      console.log('  - ThemeChangeTracker: Explicitly non-critical (optional debugging feature)');
      console.log('  - API 400 errors: Need investigation - check Network tab for details');
      console.log('\n🔍 RECOMMENDATION:');
      console.log('  - Review Network tab for API request/response details');
      console.log('  - Check if server at 216.238.91.120:3002 is running and accessible');
      console.log('  - Verify request headers and payload format');
    } else if (results.issues.length > 0) {
      console.log('❌ CRITICAL ISSUES DETECTED:');
      console.log('  - Some errors may be blocking functionality');
      console.log('\n🔍 RECOMMENDATION:');
      console.log('  - Address critical issues first');
      console.log('  - Review Network tab for API errors');
    } else {
      console.log('⚠️ WARNINGS DETECTED:');
      console.log('  - Most appear to be non-critical');
      console.log('  - API errors need investigation');
    }
    
    console.log('\n📋 DETAILED RESULTS:');
    console.log(JSON.stringify(results, null, 2));
    
    return results;
  }, 2000); // Wait 2 seconds for async checks to complete
  
  return results;
})();

