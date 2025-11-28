/**
 * Diagnostic Script: Build Info JSON Loading Issue
 * 
 * This script diagnoses why .build-info.json fails to load.
 * Run in browser console to see what Chrome actually sees.
 * 
 * Usage: Run in browser console
 */

(function() {
  console.log('🔍 DIAGNOSTIC: Build Info JSON Loading');
  console.log('=========================================\n');

  const results = {
    timestamp: new Date().toISOString(),
    issues: [],
    checks: {}
  };

  // Check 1: Chrome runtime API
  if (typeof chrome === 'undefined' || !chrome.runtime) {
    results.issues.push('Chrome runtime API not available');
    results.checks.chromeRuntime = false;
    console.error('❌ Chrome runtime API not available');
    return results;
  } else {
    results.checks.chromeRuntime = true;
    console.log('✅ Chrome runtime API available');
  }

  // Check 2: Get extension ID
  try {
    const extensionId = chrome.runtime.id;
    results.checks.extensionId = extensionId;
    console.log('✅ Extension ID:', extensionId);
  } catch (error) {
    results.issues.push('Failed to get extension ID: ' + error.message);
    console.error('❌ Failed to get extension ID:', error);
  }

  // Check 3: Get URL for .build-info.json
  try {
    const buildInfoUrl = chrome.runtime.getURL('.build-info.json');
    results.checks.buildInfoUrl = buildInfoUrl;
    console.log('✅ Build info URL from chrome.runtime.getURL():', buildInfoUrl);
    
    // Parse the URL to see the path
    try {
      const urlObj = new URL(buildInfoUrl);
      results.checks.urlPath = urlObj.pathname;
      console.log('   URL path:', urlObj.pathname);
      console.log('   Expected: /.build-info.json or /extension/.build-info.json');
    } catch (e) {
      console.log('   Could not parse URL');
    }
  } catch (error) {
    results.issues.push('Failed to get URL: ' + error.message);
    console.error('❌ Failed to get URL:', error);
  }

  // Check 4: Try to fetch the file
  if (results.checks.buildInfoUrl) {
    (async function() {
      try {
        console.log('\n🔄 Attempting to fetch .build-info.json...');
        const response = await fetch(results.checks.buildInfoUrl, { 
          cache: 'no-cache',
          method: 'GET'
        });
        
        results.checks.fetchStatus = response.status;
        results.checks.fetchOk = response.ok;
        results.checks.fetchStatusText = response.statusText;
        
        console.log('   Status:', response.status, response.statusText);
        console.log('   Headers:', Object.fromEntries(response.headers.entries()));
        
        if (response.ok) {
          const buildInfo = await response.json();
          results.checks.buildInfo = buildInfo;
          console.log('✅ .build-info.json loaded successfully:', buildInfo);
        } else {
          results.issues.push(`Failed to load: HTTP ${response.status} ${response.statusText}`);
          console.error('❌ Failed to load .build-info.json');
          console.error('   Status:', response.status);
          console.error('   Status Text:', response.statusText);
          
          // Try to get response text for more info
          try {
            const text = await response.text();
            console.error('   Response body:', text.substring(0, 200));
          } catch (e) {
            console.error('   Could not read response body');
          }
        }
      } catch (error) {
        results.issues.push('Error fetching: ' + error.message);
        results.checks.fetchError = error.message;
        console.error('❌ Error fetching .build-info.json:', error);
        console.error('   Error type:', error.constructor.name);
        console.error('   Error message:', error.message);
      }

      // Check 5: Verify manifest.json web_accessible_resources
      try {
        const manifestUrl = chrome.runtime.getURL('manifest.json');
        console.log('\n🔄 Checking manifest.json...');
        const manifestResponse = await fetch(manifestUrl, { cache: 'no-cache' });
        if (manifestResponse.ok) {
          const manifest = await manifestResponse.json();
          const webAccessible = manifest.web_accessible_resources || [];
          results.checks.manifestWebAccessible = webAccessible;
          
          let found = false;
          for (const resource of webAccessible) {
            if (resource.resources && Array.isArray(resource.resources)) {
              if (resource.resources.includes('.build-info.json')) {
                found = true;
                break;
              }
            }
          }
          
          if (found) {
            console.log('✅ manifest.json declares .build-info.json in web_accessible_resources');
            results.checks.manifestDeclares = true;
          } else {
            console.error('❌ manifest.json does NOT declare .build-info.json in web_accessible_resources');
            results.issues.push('manifest.json missing .build-info.json in web_accessible_resources');
            results.checks.manifestDeclares = false;
            console.log('   Current web_accessible_resources:', JSON.stringify(webAccessible, null, 2));
          }
        } else {
          console.error('❌ Could not load manifest.json:', manifestResponse.status);
          results.issues.push('Could not load manifest.json');
        }
      } catch (error) {
        console.error('❌ Error checking manifest:', error);
        results.issues.push('Error checking manifest: ' + error.message);
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
        console.log('✅ All checks passed - .build-info.json should be loadable');
      } else {
        console.log('❌ Issues detected:');
        console.log('   1. Check if Chrome extension is loaded from correct directory');
        console.log('   2. Verify manifest.json declares .build-info.json');
        console.log('   3. Ensure .build-info.json exists in extension root');
        console.log('   4. Try reloading the extension in chrome://extensions');
      }
      
      return results;
    })();
  } else {
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




