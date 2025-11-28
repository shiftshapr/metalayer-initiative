/**
 * DIAGNOSTIC SCRIPT: AuraColor Infinite Loop
 * 
 * This script diagnoses the recursive API call issue in APIService.js
 * where auraColor fetching creates infinite loops.
 * 
 * Run in browser console on extension page to diagnose the issue.
 */

(function() {
  console.log('🔍 DIAGNOSTIC: Starting AuraColor Loop Diagnosis');
  
  const diagnostics = {
    timestamp: new Date().toISOString(),
    findings: [],
    errors: [],
    recommendations: []
  };

  // Check 1: window.currentUser state
  try {
    if (window.currentUser) {
      diagnostics.findings.push({
        check: 'window.currentUser exists',
        status: 'PASS',
        data: {
          id: window.currentUser.id,
          email: window.currentUser.email,
          hasAuraColor: !!window.currentUser.auraColor,
          auraColor: window.currentUser.auraColor,
          auraColorType: typeof window.currentUser.auraColor
        }
      });
    } else {
      diagnostics.findings.push({
        check: 'window.currentUser exists',
        status: 'FAIL',
        message: 'window.currentUser is null/undefined'
      });
    }
  } catch (error) {
    diagnostics.errors.push({
      check: 'window.currentUser check',
      error: error.message
    });
  }

  // Check 2: window.api state
  try {
    if (window.api) {
      diagnostics.findings.push({
        check: 'window.api exists',
        status: 'PASS',
        data: {
          hasRequestMethod: typeof window.api.request === 'function',
          baseURL: window.api.baseURL
        }
      });
    } else {
      diagnostics.findings.push({
        check: 'window.api exists',
        status: 'FAIL',
        message: 'window.api is null/undefined'
      });
    }
  } catch (error) {
    diagnostics.errors.push({
      check: 'window.api check',
      error: error.message
    });
  }

  // Check 3: Recursive call detection
  try {
    let callCount = 0;
    const originalRequest = window.api?.request;
    if (originalRequest) {
      const wrappedRequest = function(...args) {
        callCount++;
        if (callCount > 10) {
          diagnostics.errors.push({
            check: 'Recursive call detection',
            error: `Detected ${callCount} recursive calls - infinite loop confirmed`,
            stack: new Error().stack
          });
          return Promise.reject(new Error('Infinite loop detected'));
        }
        return originalRequest.apply(this, args);
      };
      // Temporarily wrap (for testing only)
      console.warn('⚠️ DIAGNOSTIC: Would wrap request() to detect recursion');
    }
  } catch (error) {
    diagnostics.errors.push({
      check: 'Recursive call detection setup',
      error: error.message
    });
  }

  // Check 4: APIService.js code analysis
  diagnostics.findings.push({
    check: 'Code pattern analysis',
    status: 'INFO',
    message: 'Lines 59-87 in APIService.js show recursive pattern',
    pattern: {
      line59: 'if (!user.auraColor && user.id && window.api)',
      line62: 'await window.api.request(`/v1/users/${user.id}`)',
      issue: 'This creates recursion: request() → check auraColor → request() → ...'
    }
  });

  // Recommendations
  diagnostics.recommendations.push({
    priority: 'HIGH',
    fix: 'Add recursion guard flag to prevent nested auraColor fetches',
    code: `
      // Add at class level
      private _fetchingAuraColor = false;
      
      // In request() method, before line 59:
      if (!user.auraColor && user.id && window.api && !this._fetchingAuraColor) {
        this._fetchingAuraColor = true;
        try {
          // ... fetch logic ...
        } finally {
          this._fetchingAuraColor = false;
        }
      }
    `
  });

  diagnostics.recommendations.push({
    priority: 'HIGH',
    fix: 'Check window.currentUser.auraColor directly before API call',
    code: `
      // Before line 59, add:
      if (!user.auraColor && window.currentUser?.auraColor) {
        user.auraColor = window.currentUser.auraColor;
      }
    `
  });

  diagnostics.recommendations.push({
    priority: 'CRITICAL',
    fix: 'Use direct fetch() instead of window.api.request() to break recursion',
    code: `
      // Replace line 62 with:
      const response = await fetch(\`http://216.238.91.120:3002/v1/users/\${user.id}\`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      const userResponse = await response.json();
    `
  });

  // Output results
  console.log('📊 DIAGNOSTIC RESULTS:', diagnostics);
  console.table(diagnostics.findings);
  if (diagnostics.errors.length > 0) {
    console.error('❌ DIAGNOSTIC ERRORS:', diagnostics.errors);
  }
  console.log('💡 RECOMMENDATIONS:', diagnostics.recommendations);

  return diagnostics;
})();

