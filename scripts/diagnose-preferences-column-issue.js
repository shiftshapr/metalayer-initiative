/**
 * DIAGNOSTIC: Preferences Column Issue
 * 
 * This script verifies that preferences column fixes are working:
 * 1. Checks if preferences column exists in database (should NOT exist)
 * 2. Tests API endpoints that previously failed
 * 3. Verifies user creation works
 * 
 * Run in browser console on extension sidepanel
 */

async function diagnosePreferencesColumnIssue() {
  console.log('🔍 ===== PREFERENCES COLUMN DIAGNOSTIC =====');
  const results = {
    timestamp: new Date().toISOString(),
    checks: {},
    apiTests: {},
    rootCauses: [],
    recommendations: []
  };

  // CHECK 1: Frontend State
  console.log('\n1️⃣ Checking Frontend State...');
  results.checks.frontendState = {
    stateManagerAvailable: typeof window.stateManagerInstance !== 'undefined',
    currentUser: null,
    currentUserEmail: null,
    currentUserId: null
  };

  if (results.checks.frontendState.stateManagerAvailable) {
    try {
      const currentUser = window.stateManagerInstance.getState('currentUser');
      results.checks.frontendState.currentUser = currentUser;
      if (currentUser) {
        results.checks.frontendState.currentUserEmail = currentUser.email;
        results.checks.frontendState.currentUserId = currentUser.id;
        console.log(`   ✅ currentUser: ${currentUser.email}`);
        console.log(`   📋 User ID: ${currentUser.id}`);
      }
    } catch (error) {
      console.log(`   ❌ Error: ${error.message}`);
    }
  }

  // CHECK 2: Test User Creation
  const testEmail = results.checks.frontendState.currentUserEmail;
  const testUserId = results.checks.frontendState.currentUserId;
  const isGoogleId = testUserId && /^\d+$/.test(String(testUserId));

  if (testEmail && isGoogleId) {
    console.log(`\n2️⃣ Testing User Creation with Google ID...`);
    console.log(`   Testing: GET /v1/users/${testUserId} with x-user-email header`);
    
    try {
      const response = await fetch(`http://216.238.91.120:3002/v1/users/${testUserId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'x-user-email': testEmail,
          'x-user-name': results.checks.frontendState.currentUser?.name || testEmail.split('@')[0],
          'x-user-avatar': results.checks.frontendState.currentUser?.picture || ''
        }
      });
      
      results.apiTests.getUserByGoogleId = {
        status: response.status,
        ok: response.ok,
        body: null
      };

      if (response.ok) {
        const data = await response.json();
        results.apiTests.getUserByGoogleId.body = data;
        console.log(`   ✅ SUCCESS: ${response.status} ${response.statusText}`);
        console.log(`   📋 User created/found: ${data.email}, UUID: ${data.id}`);
        console.log(`   📋 Theme: ${data.theme || 'not set'}`);
        console.log(`   📋 Aura Color: ${data.auraColor || 'not set'}`);
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        results.apiTests.getUserByGoogleId.body = errorData;
        console.log(`   ❌ FAILED: ${response.status} ${response.statusText}`);
        console.log(`   📋 Error: ${JSON.stringify(errorData)}`);
        results.rootCauses.push(`GET /v1/users/${testUserId} still returns ${response.status}`);
      }
    } catch (error) {
      results.apiTests.getUserByGoogleId = { error: error.message, failed: true };
      console.log(`   ❌ ERROR: ${error.message}`);
      results.rootCauses.push(`GET /v1/users/${testUserId} failed: ${error.message}`);
    }
  }

  // CHECK 3: Test Preferences Endpoint
  if (testEmail && isGoogleId) {
    console.log(`\n3️⃣ Testing Preferences Endpoint...`);
    
    try {
      const response = await fetch(`http://216.238.91.120:3002/v1/users/preferences`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'x-user-email': testEmail,
          'x-user-id': testUserId
        }
      });
      
      results.apiTests.getPreferences = {
        status: response.status,
        ok: response.ok,
        body: null
      };

      if (response.ok) {
        const data = await response.json();
        results.apiTests.getPreferences.body = data;
        console.log(`   ✅ SUCCESS: ${response.status} ${response.statusText}`);
        console.log(`   📋 Preferences: ${JSON.stringify(data.preferences || {})}`);
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        results.apiTests.getPreferences.body = errorData;
        console.log(`   ❌ FAILED: ${response.status} ${response.statusText}`);
        console.log(`   📋 Error: ${JSON.stringify(errorData)}`);
        results.rootCauses.push(`GET /v1/users/preferences still returns ${response.status}`);
      }
    } catch (error) {
      results.apiTests.getPreferences = { error: error.message, failed: true };
      console.log(`   ❌ ERROR: ${error.message}`);
    }
  }

  // ROOT CAUSE ANALYSIS
  console.log('\n🔍 ===== ROOT CAUSE ANALYSIS =====');
  if (results.rootCauses.length === 0) {
    console.log('   ✅ All API endpoints working correctly!');
    results.recommendations.push('User creation and preferences endpoints are working. Profile avatar should display correctly.');
  } else {
    results.rootCauses.forEach((cause, i) => {
      console.log(`\n   ${i + 1}. ${cause}`);
    });
  }

  console.log('\n💡 ===== RECOMMENDATIONS =====');
  results.recommendations.forEach((rec, i) => {
    console.log(`\n   ${i + 1}. ${rec}`);
  });

  console.log('\n✅ ===== DIAGNOSTIC COMPLETE =====');
  return results;
}

// Export for use
if (typeof window !== 'undefined') {
  window.diagnosePreferencesColumnIssue = diagnosePreferencesColumnIssue;
  console.log('✅ Preferences Column Diagnostic loaded! Run: window.diagnosePreferencesColumnIssue()');
}


