/**
 * Comprehensive Diagnostic Script for Extension Errors
 * 
 * Diagnoses:
 * 1. Logger.js file not found errors
 * 2. API connection refused errors
 * 3. Failed to fetch errors
 * 
 * Run in browser console on extension sidepanel page
 */

(async function diagnoseExtensionErrors() {
  console.log('🔍 === EXTENSION ERROR DIAGNOSTIC SCRIPT ===');
  console.log('Timestamp:', new Date().toISOString());
  
  const results = {
    logger: { passed: false, issues: [], fixes: [] },
    api: { passed: false, issues: [], fixes: [] },
    errorHandling: { passed: false, issues: [], fixes: [] },
    filePaths: { passed: false, issues: [], fixes: [] }
  };

  // ============================================
  // 1. LOGGER.JS FILE CHECK
  // ============================================
  console.log('\n📋 1. Checking Logger.js file...');
  
  try {
    // Check if Logger is available
    if (typeof window.Logger !== 'undefined') {
      console.log('✅ Logger.js loaded successfully');
      results.logger.passed = true;
    } else {
      console.log('❌ Logger.js not loaded');
      results.logger.issues.push('Logger not available on window object');
      
      // Check script tag in HTML
      const loggerScript = document.querySelector('script[src*="Logger"]');
      if (loggerScript) {
        const src = loggerScript.getAttribute('src');
        console.log('📄 Found Logger script tag:', src);
        results.logger.issues.push(`Script tag found with src: ${src}`);
        
        // Try to fetch the file
        try {
          const response = await fetch(src);
          if (response.ok) {
            console.log('✅ Logger.js file exists and is accessible');
            results.logger.issues.push('File exists but not loaded - may be module loading issue');
            results.logger.fixes.push('Check if Logger.js exports properly to window');
          } else {
            console.log(`❌ Logger.js file not accessible: ${response.status}`);
            results.logger.issues.push(`File not accessible: HTTP ${response.status}`);
            results.logger.fixes.push(`Fix path in sidepanel.html: ${src}`);
          }
        } catch (fetchError) {
          console.log('❌ Error fetching Logger.js:', fetchError.message);
          results.logger.issues.push(`Fetch error: ${fetchError.message}`);
          results.logger.fixes.push(`Fix file path: ${src}`);
        }
      } else {
        console.log('❌ No Logger script tag found in HTML');
        results.logger.issues.push('No script tag for Logger.js in sidepanel.html');
        results.logger.fixes.push('Add script tag: <script type="module" src="utils/Logger.js"></script>');
      }
    }
  } catch (error) {
    console.error('❌ Error checking Logger:', error);
    results.logger.issues.push(`Error: ${error.message}`);
  }

  // ============================================
  // 2. API CONNECTIVITY CHECK
  // ============================================
  console.log('\n📋 2. Checking API connectivity...');
  
  const apiBaseUrl = 'http://216.238.91.120:3002';
  const testEndpoints = [
    '/v1/users/update-avatar',
    '/v1/users/test-user-id',
    '/v1/health' // If available
  ];

  for (const endpoint of testEndpoints) {
    const fullUrl = `${apiBaseUrl}${endpoint}`;
    console.log(`\n🔗 Testing: ${fullUrl}`);
    
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
      
      const response = await fetch(fullUrl, {
        method: 'GET',
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      clearTimeout(timeoutId);
      
      if (response.ok) {
        console.log(`✅ ${endpoint}: OK (${response.status})`);
        results.api.passed = true;
      } else {
        console.log(`⚠️ ${endpoint}: HTTP ${response.status}`);
        results.api.issues.push(`${endpoint}: HTTP ${response.status}`);
      }
    } catch (error) {
      if (error.name === 'AbortError') {
        console.log(`❌ ${endpoint}: Timeout (server not responding)`);
        results.api.issues.push(`${endpoint}: Timeout`);
      } else if (error.message.includes('Failed to fetch') || error.message.includes('ERR_CONNECTION_REFUSED')) {
        console.log(`❌ ${endpoint}: Connection refused (server may be down)`);
        results.api.issues.push(`${endpoint}: Connection refused`);
      } else {
        console.log(`❌ ${endpoint}: ${error.message}`);
        results.api.issues.push(`${endpoint}: ${error.message}`);
      }
    }
  }

  // Check if API service has error handling
  if (typeof window.api !== 'undefined' && window.api.request) {
    console.log('\n🔍 Checking APIService error handling...');
    results.api.fixes.push('APIService exists - check error handling implementation');
  } else {
    console.log('⚠️ APIService not available on window');
    results.api.issues.push('APIService not initialized');
  }

  // ============================================
  // 3. ERROR HANDLING CHECK
  // ============================================
  console.log('\n📋 3. Checking error handling patterns...');
  
  // Check if errors are being caught
  const originalError = console.error;
  let errorCaught = false;
  
  console.error = function(...args) {
    errorCaught = true;
    originalError.apply(console, args);
  };
  
  // Check APIService error handling
  if (window.api && typeof window.api.request === 'function') {
    try {
      // Try a request that will likely fail
      await window.api.request('/v1/test-endpoint-that-does-not-exist', {
        method: 'GET'
      });
    } catch (error) {
      console.log('✅ APIService catches errors:', error.message);
      results.errorHandling.passed = true;
    }
  }
  
  console.error = originalError;

  // ============================================
  // 4. FILE PATH VERIFICATION
  // ============================================
  console.log('\n📋 4. Verifying file paths...');
  
  const expectedFiles = [
    'utils/Logger.js',
    'services/APIService.js',
    'features/ProfileManager.js',
    'real-google-auth.js'
  ];
  
  for (const filePath of expectedFiles) {
    try {
      const response = await fetch(filePath);
      if (response.ok) {
        console.log(`✅ ${filePath}: Found`);
        results.filePaths.passed = true;
      } else {
        console.log(`❌ ${filePath}: Not found (${response.status})`);
        results.filePaths.issues.push(`${filePath}: HTTP ${response.status}`);
        results.filePaths.fixes.push(`Verify ${filePath} exists in extension/ directory`);
      }
    } catch (error) {
      console.log(`❌ ${filePath}: ${error.message}`);
      results.filePaths.issues.push(`${filePath}: ${error.message}`);
      results.filePaths.fixes.push(`Check file path: ${filePath}`);
    }
  }

  // ============================================
  // 5. SUMMARY REPORT
  // ============================================
  console.log('\n📊 === DIAGNOSTIC SUMMARY ===');
  
  const allPassed = Object.values(results).every(r => r.passed);
  
  console.log(`\nOverall Status: ${allPassed ? '✅ PASSED' : '❌ FAILED'}`);
  
  for (const [category, result] of Object.entries(results)) {
    console.log(`\n${category.toUpperCase()}:`);
    console.log(`  Status: ${result.passed ? '✅ PASSED' : '❌ FAILED'}`);
    if (result.issues.length > 0) {
      console.log('  Issues:');
      result.issues.forEach(issue => console.log(`    - ${issue}`));
    }
    if (result.fixes.length > 0) {
      console.log('  Recommended Fixes:');
      result.fixes.forEach(fix => console.log(`    - ${fix}`));
    }
  }

  // Return results for programmatic access
  window.diagnosticResults = results;
  console.log('\n✅ Diagnostic complete. Results stored in window.diagnosticResults');
  
  return results;
})();

