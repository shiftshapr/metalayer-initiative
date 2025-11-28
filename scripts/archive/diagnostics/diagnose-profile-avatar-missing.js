/**
 * DIAGNOSTIC: Profile Avatar Not Displaying
 * 
 * This script diagnoses why the profile avatar is not displaying at all:
 * 1. Checks if DOM container exists
 * 2. Checks if ProfileManager is initialized
 * 3. Checks if avatar HTML is being generated
 * 4. Checks for errors in avatar creation
 * 5. Checks timing issues
 * 
 * Run in browser console on extension sidepanel
 */

async function diagnoseProfileAvatarMissing() {
  console.log('🔍 ===== PROFILE AVATAR MISSING DIAGNOSTIC =====');
  const results = {
    timestamp: new Date().toISOString(),
    checks: {},
    errors: [],
    rootCauses: [],
    recommendations: []
  };

  // CHECK 1: DOM Container
  console.log('\n1️⃣ Checking DOM Container...');
  results.checks.dom = {
    userAvatarContainer: !!document.getElementById('user-avatar-container'),
    userAvatarContainerVisible: false,
    userAvatarContainerInnerHTML: null,
    userAvatarElement: !!document.querySelector('#user-avatar-container .user-avatar'),
    avatarContainerElement: !!document.querySelector('#user-avatar-container .avatar-container'),
    avatarImg: !!document.querySelector('#user-avatar-container img'),
    containerStyle: null
  };

  const avatarContainer = document.getElementById('user-avatar-container');
  if (avatarContainer) {
    const computedStyle = window.getComputedStyle(avatarContainer);
    results.checks.dom.userAvatarContainerVisible = computedStyle.display !== 'none' && computedStyle.visibility !== 'hidden';
    results.checks.dom.userAvatarContainerInnerHTML = avatarContainer.innerHTML;
    results.checks.dom.containerStyle = {
      display: computedStyle.display,
      visibility: computedStyle.visibility,
      width: computedStyle.width,
      height: computedStyle.height,
      position: computedStyle.position
    };
    console.log(`   ${results.checks.dom.userAvatarContainer ? '✅' : '❌'} user-avatar-container: ${results.checks.dom.userAvatarContainer ? 'Found' : 'Missing'}`);
    console.log(`   📋 Container visible: ${results.checks.dom.userAvatarContainerVisible}`);
    console.log(`   📋 Container innerHTML length: ${avatarContainer.innerHTML.length}`);
    console.log(`   📋 Container innerHTML preview: ${avatarContainer.innerHTML.substring(0, 200)}...`);
    console.log(`   📋 Container styles:`, results.checks.dom.containerStyle);
  } else {
    console.log('   ❌ user-avatar-container NOT FOUND in DOM');
    results.rootCauses.push('user-avatar-container element does not exist in DOM');
  }

  // CHECK 2: ProfileManager State
  console.log('\n2️⃣ Checking ProfileManager State...');
  results.checks.profileManager = {
    available: typeof window.profileManager !== 'undefined',
    isAuthenticated: null,
    profileData: null,
    initialized: null
  };

  if (results.checks.profileManager.available) {
    try {
      results.checks.profileManager.isAuthenticated = window.profileManager.isAuthenticated;
      results.checks.profileManager.profileData = window.profileManager.profileData;
      results.checks.profileManager.initialized = window.profileManager.isInitialized || (window.profileManager.profileData !== null);
      console.log(`   ✅ ProfileManager available`);
      console.log(`   📋 isAuthenticated: ${results.checks.profileManager.isAuthenticated}`);
      console.log(`   📋 profileData: ${results.checks.profileManager.profileData ? 'Set' : 'null/undefined'}`);
      console.log(`   📋 initialized: ${results.checks.profileManager.initialized}`);
    } catch (error) {
      console.log(`   ❌ Error accessing ProfileManager: ${error.message}`);
      results.errors.push(`Error accessing ProfileManager: ${error.message}`);
    }
  } else {
    console.log('   ❌ window.profileManager is not available');
    results.rootCauses.push('window.profileManager is not available');
  }

  // CHECK 3: StateManager currentUser
  console.log('\n3️⃣ Checking StateManager currentUser...');
  results.checks.stateManager = {
    available: typeof window.stateManagerInstance !== 'undefined',
    currentUser: null,
    currentUserEmail: null,
    currentUserId: null,
    currentUserHasPicture: null
  };

  if (results.checks.stateManager.available) {
    try {
      const currentUser = window.stateManagerInstance.getState('currentUser');
      results.checks.stateManager.currentUser = currentUser;
      if (currentUser) {
        results.checks.stateManager.currentUserEmail = currentUser.email;
        results.checks.stateManager.currentUserId = currentUser.id;
        results.checks.stateManager.currentUserHasPicture = !!(currentUser.picture || currentUser.avatarUrl);
        console.log(`   ✅ currentUser: ${currentUser.email}`);
        console.log(`   📋 User ID: ${currentUser.id}`);
        console.log(`   📋 Has picture: ${results.checks.stateManager.currentUserHasPicture}`);
      } else {
        console.log('   ❌ currentUser is null/undefined');
        results.rootCauses.push('currentUser is null/undefined in stateManager');
      }
    } catch (error) {
      console.log(`   ❌ Error accessing stateManager: ${error.message}`);
      results.errors.push(`Error accessing stateManager: ${error.message}`);
    }
  } else {
    console.log('   ❌ window.stateManagerInstance is not available');
    results.rootCauses.push('window.stateManagerInstance is not available');
  }

  // CHECK 4: AvatarUtils
  console.log('\n4️⃣ Checking AvatarUtils...');
  results.checks.avatarUtils = {
    available: typeof window.AvatarUtils !== 'undefined',
    createUnifiedAvatar: null,
    globalThisAvailable: typeof globalThis !== 'undefined' && typeof globalThis.AvatarUtils !== 'undefined'
  };

  if (results.checks.avatarUtils.available) {
    results.checks.avatarUtils.createUnifiedAvatar = typeof window.AvatarUtils.createUnifiedAvatar === 'function';
    console.log(`   ✅ AvatarUtils available`);
    console.log(`   📋 createUnifiedAvatar: ${results.checks.avatarUtils.createUnifiedAvatar ? 'Function' : 'Not a function'}`);
  } else if (results.checks.avatarUtils.globalThisAvailable) {
    console.log(`   ⚠️ AvatarUtils not on window, but found on globalThis`);
    results.checks.avatarUtils.available = true;
  } else {
    console.log('   ❌ AvatarUtils is not available');
    results.rootCauses.push('AvatarUtils is not available');
  }

  // CHECK 5: Try to manually create avatar
  console.log('\n5️⃣ Testing Manual Avatar Creation...');
  if (results.checks.stateManager.currentUser && results.checks.avatarUtils.available && avatarContainer) {
    try {
      const currentUser = results.checks.stateManager.currentUser;
      const testUser = {
        id: currentUser.id,
        email: currentUser.email,
        name: currentUser.name,
        avatarUrl: currentUser.picture || currentUser.avatarUrl,
        auraColor: currentUser.auraColor || '#33aa33'
      };
      
      console.log(`   🔧 Attempting to create avatar with:`, testUser);
      
      if (window.AvatarUtils && typeof window.AvatarUtils.createUnifiedAvatar === 'function') {
        const avatarHTML = await window.AvatarUtils.createUnifiedAvatar(testUser, 'profile', {
          showAura: true,
          showStatus: true,
          size: 32
        });
        
        console.log(`   ✅ Avatar HTML generated (length: ${avatarHTML.length})`);
        console.log(`   📋 Avatar HTML preview: ${avatarHTML.substring(0, 200)}...`);
        
        // Try to insert it
        avatarContainer.innerHTML = `<div class="user-avatar">${avatarHTML}</div>`;
        console.log(`   ✅ Avatar HTML inserted into container`);
        
        // Check if it's visible now
        const checkAvatar = document.querySelector('#user-avatar-container .user-avatar');
        if (checkAvatar) {
          console.log(`   ✅ Avatar element found after insertion`);
          results.checks.manualAvatarCreation = { success: true, avatarHTML };
        } else {
          console.log(`   ❌ Avatar element NOT found after insertion`);
          results.checks.manualAvatarCreation = { success: false, error: 'Avatar element not found after insertion' };
          results.rootCauses.push('Avatar HTML inserted but element not found in DOM');
        }
      } else {
        console.log(`   ❌ AvatarUtils.createUnifiedAvatar is not a function`);
        results.rootCauses.push('AvatarUtils.createUnifiedAvatar is not a function');
      }
    } catch (error) {
      console.log(`   ❌ Error creating avatar manually: ${error.message}`);
      console.error(error);
      results.errors.push(`Error creating avatar manually: ${error.message}`);
      results.rootCauses.push(`Avatar creation failed: ${error.message}`);
    }
  } else {
    console.log('   ⚠️ Cannot test manual creation - missing prerequisites');
    if (!results.checks.stateManager.currentUser) {
      results.rootCauses.push('Cannot create avatar: currentUser is missing');
    }
    if (!results.checks.avatarUtils.available) {
      results.rootCauses.push('Cannot create avatar: AvatarUtils is not available');
    }
    if (!avatarContainer) {
      results.rootCauses.push('Cannot create avatar: user-avatar-container is missing');
    }
  }

  // CHECK 6: Console Errors
  console.log('\n6️⃣ Checking for Console Errors...');
  // Note: This is a best-effort check - actual errors should be visible in console
  results.checks.consoleErrors = {
    note: 'Check browser console for errors related to ProfileManager, AvatarUtils, or avatar creation'
  };
  console.log('   📋 Check browser console for any errors');

  // ROOT CAUSE ANALYSIS
  console.log('\n🔍 ===== ROOT CAUSE ANALYSIS =====');
  if (results.rootCauses.length === 0) {
    console.log('   ✅ No obvious root causes identified');
    console.log('   📋 Avatar should be displaying. Check browser console for runtime errors.');
  } else {
    results.rootCauses.forEach((cause, i) => {
      console.log(`\n   ${i + 1}. ${cause}`);
    });
  }

  // RECOMMENDATIONS
  console.log('\n💡 ===== RECOMMENDATIONS =====');
  if (results.rootCauses.length === 0 && results.checks.manualAvatarCreation?.success) {
    results.recommendations.push('Manual avatar creation succeeded. ProfileManager may not be calling avatar creation. Check ProfileManager initialization.');
  } else if (results.rootCauses.some(c => c.includes('user-avatar-container'))) {
    results.recommendations.push('Add user-avatar-container element to sidepanel.html if missing');
  } else if (results.rootCauses.some(c => c.includes('AvatarUtils'))) {
    results.recommendations.push('Ensure AvatarUtils is loaded and exported to window before ProfileManager initializes');
  } else if (results.rootCauses.some(c => c.includes('currentUser'))) {
    results.recommendations.push('Ensure authentication completes and currentUser is set in stateManager before ProfileManager creates avatar');
  } else if (results.rootCauses.some(c => c.includes('ProfileManager'))) {
    results.recommendations.push('Check ProfileManager initialization - ensure setupProfileMenuAndAuraModal() is called');
  }
  
  results.recommendations.forEach((rec, i) => {
    console.log(`\n   ${i + 1}. ${rec}`);
  });

  console.log('\n✅ ===== DIAGNOSTIC COMPLETE =====');
  return results;
}

// Export for use
if (typeof window !== 'undefined') {
  window.diagnoseProfileAvatarMissing = diagnoseProfileAvatarMissing;
  console.log('✅ Profile Avatar Missing Diagnostic loaded! Run: window.diagnoseProfileAvatarMissing()');
}

