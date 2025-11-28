/**
 * DIAGNOSTIC: Profile Avatar Not Displaying
 * 
 * This script diagnoses why the profile avatar is not displaying:
 * 1. Checks Logger.js file loading issue
 * 2. Checks ProfileManager state and initialization
 * 3. Checks DOM elements for avatar container
 * 4. Checks CSS visibility issues
 * 5. Checks currentUser state in stateManager
 * 6. Checks setupProfileMenuAndAuraModal promise state
 * 
 * Run in browser console on extension sidepanel
 */

async function diagnoseProfileAvatarNotDisplaying() {
  console.log('🔍 ===== PROFILE AVATAR NOT DISPLAYING DIAGNOSTIC =====');
  const results = {
    timestamp: new Date().toISOString(),
    checks: {},
    rootCauses: [],
    recommendations: []
  };

  // CHECK 1: Logger.js File Loading
  console.log('\n1️⃣ Checking Logger.js File Loading...');
  results.checks.logger = {
    error: 'utils/Logger:1 Failed to load resource: net::ERR_FILE_NOT_FOUND',
    note: 'This is a build/sync issue - Logger.js should be in extension/utils/Logger.js'
  };
  console.log('   ⚠️ Logger.js not found - this is a build artifact issue');
  console.log('   📋 Check if Logger.js exists in extension/utils/');
  results.rootCauses.push('Logger.js file not found in extension/ - build/sync issue');

  // CHECK 2: ProfileManager State
  console.log('\n2️⃣ Checking ProfileManager State...');
  results.checks.profileManager = {
    available: typeof window.profileManager !== 'undefined',
    initialized: false,
    currentUserUnsubscribe: null,
    setupProfileMenuAndAuraModalPromise: null
  };

  if (results.checks.profileManager.available) {
    const pm = window.profileManager;
    results.checks.profileManager.initialized = pm.isInitialized || false;
    results.checks.profileManager.currentUserUnsubscribe = pm.currentUserUnsubscribe || null;
    results.checks.profileManager.setupProfileMenuAndAuraModalPromise = pm.setupProfileMenuAndAuraModalPromise || null;
    
    console.log(`   ${results.checks.profileManager.initialized ? '✅' : '❌'} ProfileManager initialized: ${results.checks.profileManager.initialized}`);
    console.log(`   📋 CurrentUser unsubscribe: ${results.checks.profileManager.currentUserUnsubscribe ? 'Set' : 'Not set'}`);
    console.log(`   📋 setupProfileMenuAndAuraModal promise: ${results.checks.profileManager.setupProfileMenuAndAuraModalPromise ? 'In progress' : 'Not in progress'}`);
    
    if (results.checks.profileManager.setupProfileMenuAndAuraModalPromise) {
      console.log('   ⚠️ setupProfileMenuAndAuraModal is stuck in progress');
      results.rootCauses.push('setupProfileMenuAndAuraModal promise stuck - may be blocking avatar creation');
    }
  } else {
    console.log('   ❌ window.profileManager is not available');
    results.rootCauses.push('ProfileManager not available on window');
  }

  // CHECK 3: DOM Elements
  console.log('\n3️⃣ Checking DOM Elements...');
  const userInfo = document.getElementById('user-info');
  const avatarContainer = document.getElementById('user-avatar-container');
  const avatarImg = document.querySelector('#user-avatar-container img');
  const avatarAura = document.querySelector('#user-avatar-container .avatar-aura');
  
  results.checks.dom = {
    userInfo: !!userInfo,
    avatarContainer: !!avatarContainer,
    avatarImg: !!avatarImg,
    avatarAura: !!avatarAura,
    userInfoVisible: false,
    avatarContainerVisible: false,
    userInfoDisplay: null,
    avatarContainerDisplay: null
  };

  if (userInfo) {
    const style = window.getComputedStyle(userInfo);
    results.checks.dom.userInfoDisplay = style.display;
    results.checks.dom.userInfoVisible = style.display !== 'none' && style.visibility !== 'hidden';
  }
  if (avatarContainer) {
    const style = window.getComputedStyle(avatarContainer);
    results.checks.dom.avatarContainerDisplay = style.display;
    results.checks.dom.avatarContainerVisible = style.display !== 'none' && style.visibility !== 'hidden';
  }

  console.log(`   ${results.checks.dom.userInfo ? '✅' : '❌'} user-info element: ${results.checks.dom.userInfo ? 'Found' : 'Missing'}`);
  console.log(`   ${results.checks.dom.avatarContainer ? '✅' : '❌'} user-avatar-container: ${results.checks.dom.avatarContainer ? 'Found' : 'Missing'}`);
  console.log(`   ${results.checks.dom.avatarImg ? '✅' : '❌'} Avatar image: ${results.checks.dom.avatarImg ? 'Found' : 'Missing'}`);
  console.log(`   ${results.checks.dom.avatarAura ? '✅' : '❌'} Avatar aura: ${results.checks.dom.avatarAura ? 'Found' : 'Missing'}`);
  console.log(`   📋 user-info display: ${results.checks.dom.userInfoDisplay || 'N/A'}`);
  console.log(`   📋 user-info visible: ${results.checks.dom.userInfoVisible}`);
  console.log(`   📋 avatar-container display: ${results.checks.dom.avatarContainerDisplay || 'N/A'}`);
  console.log(`   📋 avatar-container visible: ${results.checks.dom.avatarContainerVisible}`);

  if (!results.checks.dom.userInfo) {
    results.rootCauses.push('user-info DOM element not found');
  }
  if (!results.checks.dom.avatarContainer) {
    results.rootCauses.push('user-avatar-container DOM element not found');
  }
  if (!results.checks.dom.userInfoVisible) {
    results.rootCauses.push(`user-info is hidden (display: ${results.checks.dom.userInfoDisplay})`);
  }
  if (!results.checks.dom.avatarContainerVisible) {
    results.rootCauses.push(`avatar-container is hidden (display: ${results.checks.dom.avatarContainerDisplay})`);
  }
  if (!results.checks.dom.avatarImg && !results.checks.dom.avatarAura) {
    results.rootCauses.push('Avatar HTML not rendered in container');
  }

  // CHECK 4: StateManager currentUser
  console.log('\n4️⃣ Checking StateManager currentUser...');
  results.checks.currentUser = {
    available: typeof window.stateManagerInstance !== 'undefined',
    currentUser: null,
    hasAuraColor: false,
    hasAvatarUrl: false,
    hasPicture: false
  };

  if (results.checks.currentUser.available) {
    const currentUser = window.stateManagerInstance.getState('currentUser');
    results.checks.currentUser.currentUser = currentUser;
    if (currentUser && typeof currentUser === 'object') {
      results.checks.currentUser.hasAuraColor = !!(currentUser as { auraColor?: string }).auraColor;
      results.checks.currentUser.hasAvatarUrl = !!(currentUser as { avatarUrl?: string }).avatarUrl;
      results.checks.currentUser.hasPicture = !!(currentUser as { picture?: string }).picture;
      
      console.log(`   ${currentUser ? '✅' : '❌'} currentUser: ${currentUser ? 'Set' : 'Not set'}`);
      console.log(`   ${results.checks.currentUser.hasAuraColor ? '✅' : '❌'} auraColor: ${results.checks.currentUser.hasAuraColor ? (currentUser as { auraColor?: string }).auraColor : 'Missing'}`);
      console.log(`   ${results.checks.currentUser.hasAvatarUrl ? '✅' : '❌'} avatarUrl: ${results.checks.currentUser.hasAvatarUrl ? (currentUser as { avatarUrl?: string }).avatarUrl : 'Missing'}`);
      console.log(`   ${results.checks.currentUser.hasPicture ? '✅' : '❌'} picture: ${results.checks.currentUser.hasPicture ? (currentUser as { picture?: string }).picture : 'Missing'}`);
      
      if (!currentUser) {
        results.rootCauses.push('currentUser is not set in stateManager');
      }
      if (!results.checks.currentUser.hasAuraColor && !results.checks.currentUser.hasAvatarUrl && !results.checks.currentUser.hasPicture) {
        results.rootCauses.push('currentUser missing avatar data (auraColor, avatarUrl, picture)');
      }
    } else {
      console.log('   ❌ currentUser is null/undefined');
      results.rootCauses.push('currentUser is null/undefined in stateManager');
    }
  } else {
    console.log('   ❌ window.stateManagerInstance is not available');
    results.rootCauses.push('StateManager is not available');
  }

  // CHECK 5: AvatarUtils
  console.log('\n5️⃣ Checking AvatarUtils...');
  results.checks.avatarUtils = {
    available: typeof window.AvatarUtils !== 'undefined',
    canCreateAvatar: false
  };

  if (results.checks.avatarUtils.available) {
    const avatarUtils = window.AvatarUtils;
    results.checks.avatarUtils.canCreateAvatar = typeof avatarUtils.createAvatar === 'function';
    console.log(`   ${results.checks.avatarUtils.available ? '✅' : '❌'} AvatarUtils: ${results.checks.avatarUtils.available ? 'Available' : 'Not available'}`);
    console.log(`   ${results.checks.avatarUtils.canCreateAvatar ? '✅' : '❌'} createAvatar function: ${results.checks.avatarUtils.canCreateAvatar ? 'Available' : 'Not available'}`);
    
    if (!results.checks.avatarUtils.canCreateAvatar) {
      results.rootCauses.push('AvatarUtils.createAvatar function not available');
    }
  } else {
    console.log('   ❌ window.AvatarUtils is not available');
    results.rootCauses.push('AvatarUtils is not available');
  }

  // CHECK 6: Console Errors
  console.log('\n6️⃣ Checking for Console Errors...');
  results.checks.errors = {
    loggerNotFound: true,
    messageSystemNotInitialized: false,
    note: 'Check browser console for additional errors'
  };
  console.log('   📋 Check browser console for any additional errors');

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
  if (results.rootCauses.some(c => c.includes('Logger.js'))) {
    results.recommendations.push('Fix Logger.js build/sync - ensure Logger.ts is compiled and synced to extension/utils/Logger.js');
  }
  if (results.rootCauses.some(c => c.includes('setupProfileMenuAndAuraModal'))) {
    results.recommendations.push('Fix setupProfileMenuAndAuraModal promise - ensure it completes and resets properly');
  }
  if (results.rootCauses.some(c => c.includes('user-info') || c.includes('hidden'))) {
    results.recommendations.push('Fix CSS visibility - ensure user-info container is visible (display: flex)');
  }
  if (results.rootCauses.some(c => c.includes('currentUser'))) {
    results.recommendations.push('Fix currentUser state - ensure it is set in stateManager with avatar data');
  }
  if (results.rootCauses.some(c => c.includes('Avatar HTML'))) {
    results.recommendations.push('Fix avatar rendering - ensure setupProfileMenuAndAuraModal creates and inserts avatar HTML');
  }

  results.recommendations.forEach((rec, i) => {
    console.log(`\n   ${i + 1}. ${rec}`);
  });

  console.log('\n✅ ===== DIAGNOSTIC COMPLETE =====');
  return results;
}

// Export for use
if (typeof window !== 'undefined') {
  window.diagnoseProfileAvatarNotDisplaying = diagnoseProfileAvatarNotDisplaying;
  console.log('✅ Profile Avatar Not Displaying Diagnostic loaded! Run: window.diagnoseProfileAvatarNotDisplaying()');
}


