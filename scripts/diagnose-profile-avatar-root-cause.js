/**
 * DIAGNOSTIC SCRIPT: Profile Avatar Root Cause Analysis
 * 
 * This script diagnoses why the profile avatar is not displaying:
 * 1. Logger.js loading issues
 * 2. AvatarUtils availability and timing
 * 3. currentUser state in stateManager
 * 4. Module loading order
 * 
 * Run in browser console on extension sidepanel
 */

async function diagnoseProfileAvatarRootCause() {
  console.log('🔍 ===== PROFILE AVATAR ROOT CAUSE DIAGNOSTIC =====');
  const results = {
    timestamp: new Date().toISOString(),
    checks: {},
    rootCauses: [],
    recommendations: []
  };

  // CHECK 1: Logger.js availability
  console.log('\n1️⃣ Checking Logger.js...');
  results.checks.logger = {
    windowLogger: typeof window.Logger !== 'undefined',
    moduleImport: null,
    error: null
  };
  
  try {
    const LoggerModule = await import('../utils/Logger.js');
    results.checks.logger.moduleImport = LoggerModule !== null && typeof LoggerModule.Logger !== 'undefined';
    console.log(`   ✅ Logger module importable: ${results.checks.logger.moduleImport}`);
  } catch (error) {
    results.checks.logger.error = error.message;
    console.log(`   ❌ Logger module import failed: ${error.message}`);
  }
  
  console.log(`   ${results.checks.logger.windowLogger ? '✅' : '❌'} window.Logger: ${results.checks.logger.windowLogger ? 'Available' : 'Missing'}`);

  // CHECK 2: AvatarUtils availability
  console.log('\n2️⃣ Checking AvatarUtils...');
  results.checks.avatarUtils = {
    windowAvatarUtils: typeof window.AvatarUtils !== 'undefined',
    globalThisAvatarUtils: typeof globalThis.AvatarUtils !== 'undefined',
    moduleImport: null,
    createUnifiedAvatar: null,
    error: null
  };
  
  try {
    const AvatarUtilsModule = await import('../utils/AvatarUtils.js');
    results.checks.avatarUtils.moduleImport = AvatarUtilsModule !== null && typeof AvatarUtilsModule.AvatarUtils !== 'undefined';
    if (results.checks.avatarUtils.moduleImport) {
      results.checks.avatarUtils.createUnifiedAvatar = typeof AvatarUtilsModule.AvatarUtils.createUnifiedAvatar === 'function';
    }
    console.log(`   ✅ AvatarUtils module importable: ${results.checks.avatarUtils.moduleImport}`);
    console.log(`   ${results.checks.avatarUtils.createUnifiedAvatar ? '✅' : '❌'} createUnifiedAvatar function: ${results.checks.avatarUtils.createUnifiedAvatar ? 'Available' : 'Missing'}`);
  } catch (error) {
    results.checks.avatarUtils.error = error.message;
    console.log(`   ❌ AvatarUtils module import failed: ${error.message}`);
  }
  
  console.log(`   ${results.checks.avatarUtils.windowAvatarUtils ? '✅' : '❌'} window.AvatarUtils: ${results.checks.avatarUtils.windowAvatarUtils ? 'Available' : 'Missing'}`);
  console.log(`   ${results.checks.avatarUtils.globalThisAvatarUtils ? '✅' : '❌'} globalThis.AvatarUtils: ${results.checks.avatarUtils.globalThisAvatarUtils ? 'Available' : 'Missing'}`);

  // CHECK 3: StateManager and currentUser
  console.log('\n3️⃣ Checking StateManager and currentUser...');
  results.checks.stateManager = {
    windowStateManager: typeof window.stateManagerInstance !== 'undefined',
    moduleImport: null,
    currentUser: null,
    currentUserType: null,
    currentUserHasId: null,
    currentUserHasPicture: null,
    currentUserHasAuraColor: null,
    error: null
  };
  
  try {
    const StateManagerModule = await import('../core/StateManager.js');
    results.checks.stateManager.moduleImport = StateManagerModule !== null && typeof StateManagerModule.stateManagerInstance !== 'undefined';
    if (results.checks.stateManager.moduleImport) {
      results.checks.stateManager.currentUser = StateManagerModule.stateManagerInstance.getState('currentUser');
      results.checks.stateManager.currentUserType = typeof results.checks.stateManager.currentUser;
      if (results.checks.stateManager.currentUser) {
        results.checks.stateManager.currentUserHasId = !!results.checks.stateManager.currentUser.id;
        results.checks.stateManager.currentUserHasPicture = !!results.checks.stateManager.currentUser.picture;
        results.checks.stateManager.currentUserHasAuraColor = !!results.checks.stateManager.currentUser.auraColor;
      }
    }
    console.log(`   ✅ StateManager module importable: ${results.checks.stateManager.moduleImport}`);
    console.log(`   ${results.checks.stateManager.currentUser ? '✅' : '❌'} currentUser: ${results.checks.stateManager.currentUser ? 'Set' : 'null/undefined'}`);
    if (results.checks.stateManager.currentUser) {
      console.log(`   📋 currentUser.id: ${results.checks.stateManager.currentUser.id || 'missing'}`);
      console.log(`   📋 currentUser.picture: ${results.checks.stateManager.currentUser.picture || 'missing'}`);
      console.log(`   📋 currentUser.auraColor: ${results.checks.stateManager.currentUser.auraColor || 'missing'}`);
    }
  } catch (error) {
    results.checks.stateManager.error = error.message;
    console.log(`   ❌ StateManager module import failed: ${error.message}`);
  }
  
  console.log(`   ${results.checks.stateManager.windowStateManager ? '✅' : '❌'} window.stateManagerInstance: ${results.checks.stateManager.windowStateManager ? 'Available' : 'Missing'}`);

  // CHECK 4: ProfileManager state
  console.log('\n4️⃣ Checking ProfileManager...');
  results.checks.profileManager = {
    windowProfileManager: typeof window.profileManager !== 'undefined',
    windowProfileManagerClass: typeof window.ProfileManager !== 'undefined',
    profileData: null,
    isAuthenticated: null,
    error: null
  };
  
  if (results.checks.profileManager.windowProfileManager) {
    try {
      results.checks.profileManager.profileData = window.profileManager.profileData;
      results.checks.profileManager.isAuthenticated = window.profileManager.isAuthenticated;
      console.log(`   ✅ profileManager.profileData: ${results.checks.profileManager.profileData ? 'Set' : 'null/undefined'}`);
      console.log(`   ✅ profileManager.isAuthenticated: ${results.checks.profileManager.isAuthenticated}`);
    } catch (error) {
      results.checks.profileManager.error = error.message;
    }
  }
  
  console.log(`   ${results.checks.profileManager.windowProfileManager ? '✅' : '❌'} window.profileManager: ${results.checks.profileManager.windowProfileManager ? 'Available' : 'Missing'}`);
  console.log(`   ${results.checks.profileManager.windowProfileManagerClass ? '✅' : '❌'} window.ProfileManager: ${results.checks.profileManager.windowProfileManagerClass ? 'Available' : 'Missing'}`);

  // CHECK 5: DOM elements
  console.log('\n5️⃣ Checking DOM elements...');
  results.checks.dom = {
    userAvatarContainer: !!document.getElementById('user-avatar-container'),
    userAvatar: !!document.querySelector('#user-avatar-container .user-avatar'),
    avatarContainer: !!document.querySelector('#user-avatar-container .avatar-container'),
    avatarImg: null,
    avatarInitial: null
  };
  
  const avatarContainer = document.getElementById('user-avatar-container');
  if (avatarContainer) {
    const avatarImg = avatarContainer.querySelector('img');
    const avatarInitial = avatarContainer.querySelector('.avatar-initial');
    results.checks.dom.avatarImg = !!avatarImg;
    results.checks.dom.avatarInitial = !!avatarInitial;
    if (avatarImg) {
      console.log(`   📋 Avatar img src: ${avatarImg.src}`);
      console.log(`   📋 Avatar img onerror: ${avatarImg.onerror ? 'Has handler' : 'No handler'}`);
    }
    if (avatarInitial) {
      console.log(`   📋 Avatar initial element found (fallback avatar)`);
    }
    // Check innerHTML to see what's actually there
    console.log(`   📋 Container innerHTML length: ${avatarContainer.innerHTML.length}`);
    console.log(`   📋 Container innerHTML preview: ${avatarContainer.innerHTML.substring(0, 200)}...`);
  }
  
  console.log(`   ${results.checks.dom.userAvatarContainer ? '✅' : '❌'} user-avatar-container: ${results.checks.dom.userAvatarContainer ? 'Found' : 'Missing'}`);
  console.log(`   ${results.checks.dom.userAvatar ? '✅' : '❌'} .user-avatar element: ${results.checks.dom.userAvatar ? 'Found' : 'Missing'}`);
  console.log(`   ${results.checks.dom.avatarContainer ? '✅' : '❌'} .avatar-container element: ${results.checks.dom.avatarContainer ? 'Found' : 'Missing'}`);
  console.log(`   ${results.checks.dom.avatarImg ? '✅' : '❌'} Avatar img element: ${results.checks.dom.avatarImg ? 'Found' : 'Missing'}`);
  console.log(`   ${results.checks.dom.avatarInitial ? '✅' : '❌'} Avatar initial element: ${results.checks.dom.avatarInitial ? 'Found' : 'Missing'}`);

  // CHECK 6: Module loading order (check script tags)
  console.log('\n6️⃣ Checking module loading order...');
  const scripts = Array.from(document.querySelectorAll('script[type="module"]'));
  const loggerIndex = scripts.findIndex(s => s.src.includes('Logger.js'));
  const avatarUtilsIndex = scripts.findIndex(s => s.src.includes('AvatarUtils.js'));
  const stateManagerIndex = scripts.findIndex(s => s.src.includes('StateManager.js'));
  const profileManagerIndex = scripts.findIndex(s => s.src.includes('ProfileManager.js'));
  
  results.checks.loadingOrder = {
    loggerIndex,
    avatarUtilsIndex,
    stateManagerIndex,
    profileManagerIndex,
    correctOrder: loggerIndex < avatarUtilsIndex && avatarUtilsIndex < stateManagerIndex && stateManagerIndex < profileManagerIndex
  };
  
  console.log(`   📋 Logger.js index: ${loggerIndex >= 0 ? loggerIndex : 'Not found'}`);
  console.log(`   📋 AvatarUtils.js index: ${avatarUtilsIndex >= 0 ? avatarUtilsIndex : 'Not found'}`);
  console.log(`   📋 StateManager.js index: ${stateManagerIndex >= 0 ? stateManagerIndex : 'Not found'}`);
  console.log(`   📋 ProfileManager.js index: ${profileManagerIndex >= 0 ? profileManagerIndex : 'Not found'}`);
  console.log(`   ${results.checks.loadingOrder.correctOrder ? '✅' : '⚠️'} Loading order: ${results.checks.loadingOrder.correctOrder ? 'Correct' : 'May be incorrect'}`);

  // ROOT CAUSE ANALYSIS
  console.log('\n🔍 ===== ROOT CAUSE ANALYSIS =====');
  
  if (!results.checks.avatarUtils.createUnifiedAvatar && !results.checks.avatarUtils.windowAvatarUtils) {
    results.rootCauses.push('AvatarUtils.createUnifiedAvatar not available - AvatarUtils may not be exported to window/globalThis or module not loaded');
    results.recommendations.push('Ensure AvatarUtils.ts exports AvatarUtils to window and globalThis using Object.defineProperty');
  }
  
  if (!results.checks.stateManager.currentUser) {
    results.rootCauses.push('currentUser is null/undefined in stateManager - authentication may not have completed or stateManager not initialized');
    results.recommendations.push('Check authentication flow - ensure stateManager.setState("currentUser", user) is called after successful auth');
  }
  
  if (results.checks.stateManager.currentUser && !results.checks.stateManager.currentUserHasId) {
    results.rootCauses.push('currentUser exists but missing id property - user object may be incomplete');
    results.recommendations.push('Ensure user object has id property when setting currentUser in stateManager');
  }
  
  if (!results.checks.dom.userAvatarContainer) {
    results.rootCauses.push('user-avatar-container DOM element not found - ProfileManager.setupProfileMenuAndAuraModal() may not have been called');
    results.recommendations.push('Ensure ProfileManager.setupProfileMenuAndAuraModal() is called during initialization');
  }
  
  if (results.checks.dom.userAvatarContainer && !results.checks.dom.userAvatar && !results.checks.dom.avatarContainer) {
    results.rootCauses.push('user-avatar-container exists but neither .user-avatar nor .avatar-container element found - avatar creation may have failed');
    results.recommendations.push('Check ProfileManager.setupProfileMenuAndAuraModal() - ensure AvatarUtils HTML is wrapped in .user-avatar div');
  } else if (results.checks.dom.avatarContainer && !results.checks.dom.userAvatar) {
    results.rootCauses.push('AvatarUtils creates .avatar-container but ProfileManager expects .user-avatar - class name mismatch');
    results.recommendations.push('Wrap AvatarUtils HTML in .user-avatar div in ProfileManager.setupProfileMenuAndAuraModal()');
  }
  
  if (!results.checks.stateManager.windowStateManager) {
    results.rootCauses.push('window.stateManagerInstance not exported - diagnostic scripts cannot access it');
    results.recommendations.push('Export stateManagerInstance to window in StateManager.ts for diagnostic compatibility');
  }
  
  if (!results.checks.loadingOrder.correctOrder) {
    results.rootCauses.push('Module loading order may be incorrect - ProfileManager may load before AvatarUtils/StateManager');
    results.recommendations.push('Verify sidepanel.html script loading order - Logger -> AvatarUtils -> StateManager -> ProfileManager');
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
  return results;
}

// Export for use
if (typeof window !== 'undefined') {
  window.diagnoseProfileAvatarRootCause = diagnoseProfileAvatarRootCause;
  console.log('✅ Profile Avatar Root Cause Diagnostic loaded! Run: window.diagnoseProfileAvatarRootCause()');
}

