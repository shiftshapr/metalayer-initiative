/**
 * DIAGNOSTIC SCRIPT: Profile Avatar Not Working
 * 
 * This script diagnoses why profile avatar is not rendering.
 * Root cause: stateManager.currentUser is null even though window.currentUser is set.
 * 
 * Run in browser console on extension page to diagnose the issue.
 */

(function() {
  console.log('🔍 DIAGNOSTIC: Starting Profile Avatar Diagnosis');
  
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
          name: window.currentUser.name,
          avatarUrl: window.currentUser.avatarUrl,
          auraColor: window.currentUser.auraColor
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

  // Check 2: stateManagerInstance state
  try {
    if (window.stateManagerInstance) {
      const stateManagerUser = window.stateManagerInstance.getState('currentUser');
      diagnostics.findings.push({
        check: 'stateManagerInstance exists',
        status: 'PASS',
        data: {
          hasStateManager: true,
          currentUserInState: !!stateManagerUser,
          currentUserData: stateManagerUser ? {
            id: stateManagerUser.id,
            email: stateManagerUser.email,
            name: stateManagerUser.name,
            avatarUrl: stateManagerUser.avatarUrl,
            auraColor: stateManagerUser.auraColor
          } : null
        }
      });
      
      if (!stateManagerUser) {
        diagnostics.errors.push({
          check: 'stateManager.currentUser',
          error: 'stateManagerInstance.getState("currentUser") returns null even though window.currentUser exists',
          severity: 'CRITICAL'
        });
      }
    } else {
      diagnostics.findings.push({
        check: 'stateManagerInstance exists',
        status: 'FAIL',
        message: 'window.stateManagerInstance is null/undefined'
      });
    }
  } catch (error) {
    diagnostics.errors.push({
      check: 'stateManagerInstance check',
      error: error.message
    });
  }

  // Check 3: ProfileManager state
  try {
    const profileAvatar = document.querySelector('#user-avatar-container, .profile-avatar, [data-profile-avatar]');
    if (profileAvatar) {
      diagnostics.findings.push({
        check: 'Profile avatar DOM element',
        status: 'PASS',
        data: {
          found: true,
          hasImage: !!profileAvatar.querySelector('img'),
          hasFallback: profileAvatar.textContent.includes('?') || profileAvatar.textContent.length === 1
        }
      });
    } else {
      diagnostics.findings.push({
        check: 'Profile avatar DOM element',
        status: 'FAIL',
        message: 'Profile avatar DOM element not found'
      });
    }
  } catch (error) {
    diagnostics.errors.push({
      check: 'Profile avatar DOM check',
      error: error.message
    });
  }

  // Check 4: API authentication
  try {
    if (window.api) {
      // Check if API can get user
      diagnostics.findings.push({
        check: 'API instance',
        status: 'PASS',
        data: {
          hasApi: true,
          baseURL: window.api.baseURL
        }
      });
    } else {
      diagnostics.findings.push({
        check: 'API instance',
        status: 'FAIL',
        message: 'window.api is null/undefined'
      });
    }
  } catch (error) {
    diagnostics.errors.push({
      check: 'API instance check',
      error: error.message
    });
  }

  // Recommendations
  diagnostics.recommendations.push({
    priority: 'CRITICAL',
    fix: 'Update real-google-auth.js to set stateManager.currentUser when setting window.currentUser',
    code: `
      // After setting window.currentUser, also update stateManager
      if (window.stateManagerInstance) {
        window.stateManagerInstance.setState('currentUser', chromeUser);
      }
    `
  });

  diagnostics.recommendations.push({
    priority: 'HIGH',
    fix: 'Update all authentication flows to use stateManager instead of window.currentUser',
    files: [
      'real-google-auth.js',
      'SupabaseService.js',
      'AuthModule.js'
    ]
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

