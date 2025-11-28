/**
 * COMPREHENSIVE DIAGNOSTIC: Profile Avatar Display Root Causes
 * 
 * This script diagnoses why profile avatar is not displaying correctly:
 * 1. Checks DOM elements for avatar
 * 2. Checks aura color in stateManager vs displayed color
 * 3. Tests API endpoints (GET, PATCH)
 * 4. Checks ProfileManager state
 * 5. Verifies avatar HTML structure
 * 
 * Run in browser console on extension sidepanel
 */

async function diagnoseProfileAvatarDisplay() {
  console.log('🔍 ===== PROFILE AVATAR DISPLAY DIAGNOSTIC =====');
  const results = {
    timestamp: new Date().toISOString(),
    checks: {},
    apiTests: {},
    rootCauses: [],
    recommendations: []
  };

  // CHECK 1: Frontend State - currentUser and auraColor
  console.log('\n1️⃣ Checking Frontend State (currentUser & auraColor)...');
  results.checks.frontendState = {
    stateManagerAvailable: typeof window.stateManagerInstance !== 'undefined',
    currentUser: null,
    currentUserEmail: null,
    currentUserId: null,
    currentUserAuraColor: null,
    currentUserPicture: null,
    currentUserAvatarUrl: null
  };

  if (results.checks.frontendState.stateManagerAvailable) {
    try {
      const currentUser = window.stateManagerInstance.getState('currentUser');
      results.checks.frontendState.currentUser = currentUser;
      if (currentUser) {
        results.checks.frontendState.currentUserEmail = currentUser.email;
        results.checks.frontendState.currentUserId = currentUser.id;
        results.checks.frontendState.currentUserAuraColor = currentUser.auraColor || null;
        results.checks.frontendState.currentUserPicture = currentUser.picture || null;
        results.checks.frontendState.currentUserAvatarUrl = currentUser.avatarUrl || null;
        console.log(`   ✅ currentUser: ${currentUser.email}`);
        console.log(`   📋 User ID: ${currentUser.id}`);
        console.log(`   📋 Aura Color (stateManager): ${results.checks.frontendState.currentUserAuraColor || 'MISSING'}`);
        console.log(`   📋 Picture: ${results.checks.frontendState.currentUserPicture || 'MISSING'}`);
        console.log(`   📋 Avatar URL: ${results.checks.frontendState.currentUserAvatarUrl || 'MISSING'}`);
      } else {
        console.log('   ❌ currentUser is null/undefined');
        results.rootCauses.push('currentUser is null/undefined in stateManager');
      }
    } catch (error) {
      console.log(`   ❌ Error: ${error.message}`);
      results.rootCauses.push(`Error accessing stateManager: ${error.message}`);
    }
  } else {
    console.log('   ❌ window.stateManagerInstance is not available');
    results.rootCauses.push('window.stateManagerInstance is not available');
  }

  // CHECK 2: DOM Elements - Avatar Container and Avatar
  console.log('\n2️⃣ Checking DOM Elements...');
  results.checks.dom = {
    userAvatarContainer: !!document.getElementById('user-avatar-container'),
    userAvatar: !!document.querySelector('#user-avatar-container .user-avatar'),
    avatarContainer: !!document.querySelector('#user-avatar-container .avatar-container'),
    avatarImg: null,
    avatarInitial: null,
    auraElement: null,
    auraBackgroundColor: null,
    avatarImgSrc: null
  };

  const avatarContainer = document.getElementById('user-avatar-container');
  if (avatarContainer) {
    const userAvatarElement = avatarContainer.querySelector('.user-avatar');
    if (userAvatarElement) {
      const avatarContainerElement = userAvatarElement.querySelector('.avatar-container');
      if (avatarContainerElement) {
        const avatarImg = avatarContainerElement.querySelector('img');
        results.checks.dom.avatarImg = !!avatarImg;
        if (avatarImg) {
          results.checks.dom.avatarImgSrc = avatarImg.src;
          console.log(`   📋 Avatar img src: ${avatarImg.src}`);
        } else {
          const avatarInitial = avatarContainerElement.querySelector('.avatar-initial');
          results.checks.dom.avatarInitial = !!avatarInitial;
          if (avatarInitial) {
            console.log('   📋 Avatar initial element found (fallback avatar)');
          }
        }
        
        // Check aura element
        const auraElement = avatarContainerElement.querySelector('.avatar-aura-background');
        results.checks.dom.auraElement = !!auraElement;
        if (auraElement) {
          const computedStyle = window.getComputedStyle(auraElement);
          results.checks.dom.auraBackgroundColor = computedStyle.backgroundColor;
          console.log(`   📋 Aura element found with background: ${results.checks.dom.auraBackgroundColor}`);
          
          // Check if aura color matches stateManager
          if (results.checks.frontendState.currentUserAuraColor) {
            const expectedRgb = hexToRgb(results.checks.frontendState.currentUserAuraColor);
            const actualRgb = results.checks.dom.auraBackgroundColor;
            if (expectedRgb && actualRgb !== expectedRgb) {
              console.log(`   ⚠️ Aura color mismatch! Expected: ${expectedRgb}, Actual: ${actualRgb}`);
              results.rootCauses.push(`Aura color mismatch: Expected ${results.checks.frontendState.currentUserAuraColor} (${expectedRgb}), but DOM shows ${actualRgb}`);
            } else if (expectedRgb && actualRgb === expectedRgb) {
              console.log(`   ✅ Aura color matches stateManager: ${results.checks.frontendState.currentUserAuraColor}`);
            }
          }
        } else {
          console.log('   ⚠️ Aura element not found in avatar container');
          results.rootCauses.push('Aura element (.avatar-aura-background) not found in DOM');
        }
      }
    }
  }

  console.log(`   ${results.checks.dom.userAvatarContainer ? '✅' : '❌'} user-avatar-container: ${results.checks.dom.userAvatarContainer ? 'Found' : 'Missing'}`);
  console.log(`   ${results.checks.dom.userAvatar ? '✅' : '❌'} .user-avatar element: ${results.checks.dom.userAvatar ? 'Found' : 'Missing'}`);
  console.log(`   ${results.checks.dom.avatarContainer ? '✅' : '❌'} .avatar-container element: ${results.checks.dom.avatarContainer ? 'Found' : 'Missing'}`);
  console.log(`   ${results.checks.dom.avatarImg ? '✅' : '❌'} Avatar img element: ${results.checks.dom.avatarImg ? 'Found' : 'Missing'}`);
  console.log(`   ${results.checks.dom.auraElement ? '✅' : '❌'} Aura element: ${results.checks.dom.auraElement ? 'Found' : 'Missing'}`);

  // CHECK 3: ProfileManager State
  console.log('\n3️⃣ Checking ProfileManager State...');
  results.checks.profileManager = {
    available: typeof window.profileManager !== 'undefined',
    isAuthenticated: null,
    profileData: null
  };

  if (results.checks.profileManager.available) {
    try {
      results.checks.profileManager.isAuthenticated = window.profileManager.isAuthenticated;
      results.checks.profileManager.profileData = window.profileManager.profileData;
      console.log(`   ✅ ProfileManager.isAuthenticated: ${results.checks.profileManager.isAuthenticated}`);
      console.log(`   ✅ ProfileManager.profileData: ${results.checks.profileManager.profileData ? 'Set' : 'null/undefined'}`);
    } catch (error) {
      console.log(`   ❌ Error accessing ProfileManager: ${error.message}`);
    }
  } else {
    console.log('   ❌ window.profileManager is not available');
  }

  // CHECK 4: API Endpoints
  const testEmail = results.checks.frontendState.currentUserEmail;
  const testUserId = results.checks.frontendState.currentUserId;
  const isGoogleId = testUserId && /^\d+$/.test(String(testUserId));

  if (testEmail && testUserId) {
    console.log('\n4️⃣ Testing API Endpoints...');
    
    // Test 4.1: GET /v1/users/:userId
    console.log(`\n   4.1 Testing GET /v1/users/${testUserId}...`);
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
      
      results.apiTests.getUser = {
        status: response.status,
        ok: response.ok,
        body: null
      };

      if (response.ok) {
        const data = await response.json();
        results.apiTests.getUser.body = data;
        console.log(`      ✅ SUCCESS: ${response.status} ${response.statusText}`);
        console.log(`      📋 User: ${data.email}, UUID: ${data.id}`);
        console.log(`      📋 Aura Color: ${data.auraColor || 'not set'}`);
        console.log(`      📋 Theme: ${data.theme || 'not set'}`);
        
        // Check if API aura color matches stateManager
        if (data.auraColor && results.checks.frontendState.currentUserAuraColor) {
          if (data.auraColor !== results.checks.frontendState.currentUserAuraColor) {
            console.log(`      ⚠️ Aura color mismatch: API has ${data.auraColor}, stateManager has ${results.checks.frontendState.currentUserAuraColor}`);
            results.rootCauses.push(`Aura color mismatch between API (${data.auraColor}) and stateManager (${results.checks.frontendState.currentUserAuraColor})`);
          }
        }
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        results.apiTests.getUser.body = errorData;
        console.log(`      ❌ FAILED: ${response.status} ${response.statusText}`);
        console.log(`      📋 Error: ${JSON.stringify(errorData)}`);
        results.rootCauses.push(`GET /v1/users/${testUserId} returned ${response.status}`);
      }
    } catch (error) {
      results.apiTests.getUser = { error: error.message, failed: true };
      console.log(`      ❌ ERROR: ${error.message}`);
      results.rootCauses.push(`GET /v1/users/${testUserId} failed: ${error.message}`);
    }

    // Test 4.2: PATCH /v1/users/:userId (theme update)
    console.log(`\n   4.2 Testing PATCH /v1/users/${testUserId} (theme update)...`);
    try {
      const response = await fetch(`http://216.238.91.120:3002/v1/users/${testUserId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-user-email': testEmail,
          'x-user-id': testUserId
        },
        body: JSON.stringify({ theme: 'light' })
      });
      
      results.apiTests.patchUser = {
        status: response.status,
        ok: response.ok,
        body: null
      };

      if (response.ok) {
        const data = await response.json();
        results.apiTests.patchUser.body = data;
        console.log(`      ✅ SUCCESS: ${response.status} ${response.statusText}`);
        console.log(`      📋 Updated user: ${data.user?.email || 'N/A'}`);
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        results.apiTests.patchUser.body = errorData;
        console.log(`      ❌ FAILED: ${response.status} ${response.statusText}`);
        console.log(`      📋 Error: ${JSON.stringify(errorData)}`);
        results.rootCauses.push(`PATCH /v1/users/${testUserId} returned ${response.status} - ${errorData.error || 'Unknown error'}`);
      }
    } catch (error) {
      results.apiTests.patchUser = { error: error.message, failed: true };
      console.log(`      ❌ ERROR: ${error.message}`);
      results.rootCauses.push(`PATCH /v1/users/${testUserId} failed: ${error.message}`);
    }
  }

  // ROOT CAUSE ANALYSIS
  console.log('\n🔍 ===== ROOT CAUSE ANALYSIS =====');
  if (results.rootCauses.length === 0) {
    console.log('   ✅ No root causes identified - avatar should be displaying correctly');
  } else {
    results.rootCauses.forEach((cause, i) => {
      console.log(`\n   ${i + 1}. ${cause}`);
    });
  }

  // RECOMMENDATIONS
  console.log('\n💡 ===== RECOMMENDATIONS =====');
  if (results.rootCauses.length === 0) {
    results.recommendations.push('All checks passed. Avatar should be displaying correctly. If not, check browser console for runtime errors.');
  } else {
    if (results.rootCauses.some(c => c.includes('PATCH'))) {
      results.recommendations.push('Fix PATCH /v1/users/:userId endpoint to handle Google IDs correctly (use x-user-email header to resolve to UUID)');
    }
    if (results.rootCauses.some(c => c.includes('Aura color'))) {
      results.recommendations.push('Fix aura color synchronization: Ensure ProfileManager uses auraColor from stateManager, not default white (#ffffff)');
    }
    if (results.rootCauses.some(c => c.includes('Aura element'))) {
      results.recommendations.push('Verify AvatarUtils.createUnifiedAvatar is generating aura element with correct color');
    }
  }
  
  results.recommendations.forEach((rec, i) => {
    console.log(`\n   ${i + 1}. ${rec}`);
  });

  console.log('\n✅ ===== DIAGNOSTIC COMPLETE =====');
  return results;
}

// Helper function to convert hex to rgb
function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return null;
  const r = parseInt(result[1], 16);
  const g = parseInt(result[2], 16);
  const b = parseInt(result[3], 16);
  return `rgb(${r}, ${g}, ${b})`;
}

// Export for use
if (typeof window !== 'undefined') {
  window.diagnoseProfileAvatarDisplay = diagnoseProfileAvatarDisplay;
  console.log('✅ Profile Avatar Display Diagnostic loaded! Run: window.diagnoseProfileAvatarDisplay()');
}


