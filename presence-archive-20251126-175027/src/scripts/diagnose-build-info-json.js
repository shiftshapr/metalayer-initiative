/**
 * Diagnostic Script: Build Info JSON Availability
 * 
 * This script diagnoses whether .build-info.json is available in the extension
 * and can be loaded via chrome.runtime.getURL().
 * 
 * Usage: Run in browser console
 */

(function() {
  console.log('🔍 DIAGNOSTIC: Build Info JSON Availability');
  console.log('=========================================\n');

  const results = {
    timestamp: new Date().toISOString(),
    issues: [],
    checks: {}
  };

  // Check 1: Chrome runtime API availability
  if (typeof chrome === 'undefined' || !chrome.runtime) {
    results.issues.push('Chrome runtime API not available');
    results.checks.chromeRuntime = false;
  } else {
    results.checks.chromeRuntime = true;
    console.log('✅ Chrome runtime API available');
  }

  // Check 2: Get URL for .build-info.json
  if (results.checks.chromeRuntime) {
    try {
      const buildInfoUrl = chrome.runtime.getURL('.build-info.json');
      results.checks.buildInfoUrl = buildInfoUrl;
      console.log('✅ Build info URL:', buildInfoUrl);
    } catch (error) {
      results.issues.push('Failed to get URL for .build-info.json: ' + error.message);
      results.checks.buildInfoUrl = null;
      console.error('❌ Failed to get build info URL:', error);
    }
  }

  // Check 3: Try to fetch .build-info.json
  if (results.checks.buildInfoUrl) {
    (async function() {
      try {
        const response = await fetch(results.checks.buildInfoUrl, { cache: 'no-cache' });
        results.checks.fetchStatus = response.status;
        results.checks.fetchOk = response.ok;
        
        if (response.ok) {
          const buildInfo = await response.json();
          results.checks.buildInfo = buildInfo;
          console.log('✅ .build-info.json loaded successfully:', buildInfo);
        } else {
          results.issues.push(`Failed to load .build-info.json: HTTP ${response.status}`);
          console.error('❌ Failed to load .build-info.json: HTTP', response.status);
        }
      } catch (error) {
        results.issues.push('Error fetching .build-info.json: ' + error.message);
        results.checks.fetchError = error.message;
        console.error('❌ Error fetching .build-info.json:', error);
      }

      // Summary
      console.log('\n=========================================');
      console.log('📊 DIAGNOSTIC SUMMARY');
      console.log('=========================================');
      console.log('Issues Found:', results.issues.length);
      results.issues.forEach((issue, i) => {
        console.log(`  ${i + 1}. ${issue}`);
      });
      
      if (results.issues.length === 0) {
        console.log('✅ All checks passed - .build-info.json is available');
      } else {
        console.log('❌ Issues detected - .build-info.json may be missing from extension/ directory');
      }
      
      return results;
    })();
  } else {
    // Summary if chrome runtime not available
    console.log('\n=========================================');
    console.log('📊 DIAGNOSTIC SUMMARY');
    console.log('=========================================');
    console.log('Issues Found:', results.issues.length);
    results.issues.forEach((issue, i) => {
      console.log(`  ${i + 1}. ${issue}`);
    });
    
    return results;
  }
})();

