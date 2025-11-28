/**
 * COMPREHENSIVE DIAGNOSTIC: Auth and Profile Avatar Root Causes
 * 
 * This script diagnoses all root causes preventing auth and profile avatar from working:
 * 1. Backend API user lookup/creation failures
 * 2. Google ID to UUID mapping issues
 * 3. User creation flow on first login
 * 4. API endpoint compatibility
 * 5. Frontend state management
 * 6. Database state
 * 
 * Run in browser console on extension sidepanel
 */

async function diagnoseAuthProfileAvatarComprehensive() {
  console.log('🔍 ===== COMPREHENSIVE AUTH & PROFILE AVATAR DIAGNOSTIC =====');
  const results = {
    timestamp: new Date().toISOString(),
    checks: {},
    rootCauses: [],
    recommendations: [],
    apiTests: {}
  };

  // CHECK 1: Frontend State - currentUser
  console.log('\n1️⃣ Checking Frontend State (currentUser)...');
  results.checks.frontendState = {
    stateManagerAvailable: typeof window.stateManagerInstance !== 'undefined',
    currentUser: null,
    currentUserEmail: null,
    currentUserId: null,
    currentUserIsGoogleId: null,
    currentUserPicture: null,
    currentUserAuraColor: null
  };

  if (results.checks.frontendState.stateManagerAvailable) {
    try {
      const currentUser = window.stateManagerInstance.getState('currentUser');
      results.checks.frontendState.currentUser = currentUser;
      if (currentUser) {
        results.checks.frontendState.currentUserEmail = currentUser.email;
        results.checks.frontendState.currentUserId = currentUser.id;
        results.checks.frontendState.currentUserIsGoogleId = /^\d+$/.test(String(currentUser.id));
        results.checks.frontendState.currentUserPicture = currentUser.picture || currentUser.avatarUrl;
        results.checks.frontendState.currentUserAuraColor = currentUser.auraColor;
        
        console.log(`   ✅ currentUser found: ${currentUser.email}`);
        console.log(`   📋 User ID: ${currentUser.id} (${results.checks.frontendState.currentUserIsGoogleId ? 'Google ID' : 'UUID'})`);
        console.log(`   📋 Picture: ${results.checks.frontendState.currentUserPicture || 'missing'}`);
        console.log(`   📋 Aura Color: ${results.checks.frontendState.currentUserAuraColor || 'missing'}`);
      } else {
        console.log('   ❌ currentUser is null/undefined');
      }
    } catch (error) {
      console.log(`   ❌ Error getting currentUser: ${error.message}`);
    }
  } else {
    console.log('   ❌ window.stateManagerInstance not available');
  }

  // CHECK 2: API Service Configuration
  console.log('\n2️⃣ Checking API Service Configuration...');
  results.checks.apiConfig = {
    apiAvailable: typeof window.api !== 'undefined',
    apiBaseURL: null,
    apiMethods: null
  };

  if (results.checks.apiConfig.apiAvailable) {
    try {
      results.checks.apiConfig.apiBaseURL = window.api?.baseURL;
      results.checks.apiConfig.apiMethods = Object.keys(window.api || {});
      console.log(`   ✅ API available: ${results.checks.apiConfig.apiBaseURL}`);
    } catch (error) {
      console.log(`   ❌ Error checking API: ${error.message}`);
    }
  } else {
    console.log('   ❌ window.api not available');
  }

  // CHECK 3: Backend API Tests
  console.log('\n3️⃣ Testing Backend API Endpoints...');
  const currentUser = results.checks.frontendState.currentUser;
  const testEmail = currentUser?.email;
  const testUserId = currentUser?.id;
  const isGoogleId = testUserId && /^\d+$/.test(String(testUserId));

  // Test 3a: GET /v1/users/:userId with Google ID
  if (testUserId && isGoogleId && testEmail) {
    console.log(`\n   3a. Testing GET /v1/users/${testUserId} (Google ID) with email header...`);
    try {
      const response = await fetch(`http://216.238.91.120:3002/v1/users/${testUserId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'x-user-email': testEmail
        }
      });
      
      results.apiTests.getUserByGoogleId = {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
        body: null
      };

      if (response.ok) {
        const data = await response.json();
        results.apiTests.getUserByGoogleId.body = data;
        console.log(`   ✅ GET /v1/users/${testUserId}: ${response.status} ${response.statusText}`);
        console.log(`   📋 User found: ${data.email}, ID: ${data.id}, AuraColor: ${data.auraColor || 'missing'}`);
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        results.apiTests.getUserByGoogleId.body = errorData;
        console.log(`   ❌ GET /v1/users/${testUserId}: ${response.status} ${response.statusText}`);
        console.log(`   📋 Error: ${JSON.stringify(errorData)}`);
      }
    } catch (error) {
      results.apiTests.getUserByGoogleId = {
        error: error.message,
        failed: true
      };
      console.log(`   ❌ GET /v1/users/${testUserId} failed: ${error.message}`);
    }
  }

  // Test 3b: GET /v1/users/:email with email
  if (testEmail) {
    console.log(`\n   3b. Testing GET /v1/users/${testEmail} (email)...`);
    try {
      const response = await fetch(`http://216.238.91.120:3002/v1/users/${encodeURIComponent(testEmail)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      results.apiTests.getUserByEmail = {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
        body: null
      };

      if (response.ok) {
        const data = await response.json();
        results.apiTests.getUserByEmail.body = data;
        console.log(`   ✅ GET /v1/users/${testEmail}: ${response.status} ${response.statusText}`);
        console.log(`   📋 User found: ${data.email}, ID: ${data.id}, AuraColor: ${data.auraColor || 'missing'}`);
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        results.apiTests.getUserByEmail.body = errorData;
        console.log(`   ❌ GET /v1/users/${testEmail}: ${response.status} ${response.statusText}`);
        console.log(`   📋 Error: ${JSON.stringify(errorData)}`);
      }
    } catch (error) {
      results.apiTests.getUserByEmail = {
        error: error.message,
        failed: true
      };
      console.log(`   ❌ GET /v1/users/${testEmail} failed: ${error.message}`);
    }
  }

  // Test 3c: POST /v1/users/:email (create user)
  if (testEmail) {
    console.log(`\n   3c. Testing POST /v1/users/${testEmail} (create user)...`);
    try {
      const response = await fetch(`http://216.238.91.120:3002/v1/users/${encodeURIComponent(testEmail)}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: currentUser?.name || testEmail.split('@')[0],
          avatarUrl: currentUser?.picture || currentUser?.avatarUrl,
          auraColor: currentUser?.auraColor
        })
      });
      
      results.apiTests.createUserByEmail = {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
        body: null
      };

      if (response.ok) {
        const data = await response.json();
        results.apiTests.createUserByEmail.body = data;
        console.log(`   ✅ POST /v1/users/${testEmail}: ${response.status} ${response.statusText}`);
        console.log(`   📋 User created/found: ${data.email}, ID: ${data.id}`);
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        results.apiTests.createUserByEmail.body = errorData;
        console.log(`   ❌ POST /v1/users/${testEmail}: ${response.status} ${response.statusText}`);
        console.log(`   📋 Error: ${JSON.stringify(errorData)}`);
      }
    } catch (error) {
      results.apiTests.createUserByEmail = {
        error: error.message,
        failed: true
      };
      console.log(`   ❌ POST /v1/users/${testEmail} failed: ${error.message}`);
    }
  }

  // Test 3d: GET /v1/users/preferences
  if (testUserId) {
    console.log(`\n   3d. Testing GET /v1/users/preferences with userId...`);
    try {
      const headers = {
        'Content-Type': 'application/json'
      };
      
      // Add email header if Google ID
      if (isGoogleId && testEmail) {
        headers['x-user-email'] = testEmail;
      } else {
        headers['x-user-id'] = testUserId;
      }

      const response = await fetch(`http://216.238.91.120:3002/v1/users/preferences`, {
        method: 'GET',
        headers
      });
      
      results.apiTests.getPreferences = {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
        body: null
      };

      if (response.ok) {
        const data = await response.json();
        results.apiTests.getPreferences.body = data;
        console.log(`   ✅ GET /v1/users/preferences: ${response.status} ${response.statusText}`);
        console.log(`   📋 Preferences: ${JSON.stringify(data.preferences || {})}`);
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        results.apiTests.getPreferences.body = errorData;
        console.log(`   ❌ GET /v1/users/preferences: ${response.status} ${response.statusText}`);
        console.log(`   📋 Error: ${JSON.stringify(errorData)}`);
      }
    } catch (error) {
      results.apiTests.getPreferences = {
        error: error.message,
        failed: true
      };
      console.log(`   ❌ GET /v1/users/preferences failed: ${error.message}`);
    }
  }

  // CHECK 4: Profile Avatar DOM State
  console.log('\n4️⃣ Checking Profile Avatar DOM State...');
  results.checks.dom = {
    userAvatarContainer: !!document.getElementById('user-avatar-container'),
    userAvatar: !!document.querySelector('#user-avatar-container .user-avatar'),
    avatarImg: null,
    avatarInitial: null,
    avatarSrc: null,
    innerHTML: null
  };

  const avatarContainer = document.getElementById('user-avatar-container');
  if (avatarContainer) {
    const avatarImg = avatarContainer.querySelector('img');
    const avatarInitial = avatarContainer.querySelector('.avatar-initial');
    results.checks.dom.avatarImg = !!avatarImg;
    results.checks.dom.avatarInitial = !!avatarInitial;
    
    if (avatarImg) {
      results.checks.dom.avatarSrc = avatarImg.src;
      console.log(`   ✅ Avatar img found: ${avatarImg.src}`);
    } else if (avatarInitial) {
      console.log(`   ⚠️ Avatar initial found (fallback avatar)`);
    }
    
    results.checks.dom.innerHTML = avatarContainer.innerHTML.substring(0, 200);
    console.log(`   📋 Container innerHTML length: ${avatarContainer.innerHTML.length}`);
  } else {
    console.log('   ❌ user-avatar-container not found');
  }

  // CHECK 5: ProfileManager State
  console.log('\n5️⃣ Checking ProfileManager State...');
  results.checks.profileManager = {
    available: typeof window.profileManager !== 'undefined',
    isAuthenticated: null,
    profileData: null
  };

  if (results.checks.profileManager.available) {
    try {
      results.checks.profileManager.isAuthenticated = window.profileManager.isAuthenticated;
      results.checks.profileManager.profileData = window.profileManager.profileData;
      console.log(`   ✅ ProfileManager available`);
      console.log(`   📋 isAuthenticated: ${results.checks.profileManager.isAuthenticated}`);
      console.log(`   📋 profileData: ${results.checks.profileManager.profileData ? 'Set' : 'null'}`);
    } catch (error) {
      console.log(`   ❌ Error checking ProfileManager: ${error.message}`);
    }
  } else {
    console.log('   ❌ window.profileManager not available');
  }

  // ROOT CAUSE ANALYSIS
  console.log('\n🔍 ===== ROOT CAUSE ANALYSIS =====');

  // Root Cause 1: User not found in database
  if (results.apiTests.getUserByGoogleId && !results.apiTests.getUserByGoogleId.ok) {
    results.rootCauses.push('Backend API returns 404 for Google ID - user not found in database. getOrCreateUser may not be creating user when email header provided.');
    results.recommendations.push('Fix backend GET /v1/users/:userId route to ensure getOrCreateUser is called correctly when email header is provided for Google IDs.');
  }

  // Root Cause 2: User creation not happening
  if (results.apiTests.createUserByEmail && !results.apiTests.createUserByEmail.ok) {
    results.rootCauses.push('POST /v1/users/:email fails to create user - user creation endpoint may have issues.');
    results.recommendations.push('Fix POST /v1/users/:email endpoint to properly create users on first login.');
  }

  // Root Cause 3: Preferences endpoint rejects Google IDs
  if (results.apiTests.getPreferences && !results.apiTests.getPreferences.ok && results.apiTests.getPreferences.body?.error?.includes('UUID')) {
    results.rootCauses.push('GET /v1/users/preferences rejects Google IDs - expects UUID format only.');
    results.recommendations.push('Fix GET /v1/users/preferences to handle Google IDs via email header lookup.');
  }

  // Root Cause 4: Missing user data
  if (!results.checks.frontendState.currentUser) {
    results.rootCauses.push('currentUser is null in stateManager - authentication may not have completed.');
    results.recommendations.push('Check authentication flow - ensure stateManager.setState("currentUser", user) is called after successful auth.');
  }

  // Root Cause 5: Avatar not displaying
  if (!results.checks.dom.avatarImg && !results.checks.dom.avatarInitial) {
    results.rootCauses.push('Profile avatar not rendered in DOM - ProfileManager.setupProfileMenuAndAuraModal() may have failed.');
    results.recommendations.push('Check ProfileManager initialization - ensure setupProfileMenuAndAuraModal() is called and completes successfully.');
  }

  // Print results
  results.rootCauses.forEach((cause, i) => {
    console.log(`\n   ${i + 1}. ${cause}`);
  });

  console.log('\n💡 ===== RECOMMENDATIONS =====');
  results.recommendations.forEach((rec, i) => {
    console.log(`\n   ${i + 1}. ${rec}`);
  });

  console.log('\n✅ ===== DIAGNOSTIC COMPLETE =====');
  console.log('\n📊 Full Results:', JSON.stringify(results, null, 2));
  
  return results;
}

// Export for use
if (typeof window !== 'undefined') {
  window.diagnoseAuthProfileAvatarComprehensive = diagnoseAuthProfileAvatarComprehensive;
  console.log('✅ Comprehensive Auth & Profile Avatar Diagnostic loaded! Run: window.diagnoseAuthProfileAvatarComprehensive()');
}


