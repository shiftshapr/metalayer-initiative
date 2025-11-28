/**
 * COMPREHENSIVE PROFILE AVATAR DIAGNOSTIC SCRIPT
 * Targets root causes of profile avatar not displaying
 * 
 * Run in browser console: window.runProfileAvatarDiagnostic()
 */

(function() {
  'use strict';

  async function runProfileAvatarDiagnostic() {
    console.log('🔍 ===== PROFILE AVATAR COMPREHENSIVE DIAGNOSTIC =====');
    console.log('Timestamp:', new Date().toISOString());
    console.log('');

    const results = {
      timestamp: new Date().toISOString(),
      errors: [],
      warnings: [],
      findings: [],
      recommendations: []
    };

    // 1. Check Logger.js availability
    console.log('1️⃣ CHECKING Logger.js...');
    if (typeof window.Logger !== 'undefined') {
      console.log('✅ Logger.js is available');
      results.findings.push('Logger.js is loaded and available');
    } else {
      console.error('❌ Logger.js is NOT available');
      results.errors.push('Logger.js not found - check extension/utils/Logger.js exists and is loaded in sidepanel.html');
    }
    console.log('');

    // 2. Check AvatarUtils availability
    console.log('2️⃣ CHECKING AvatarUtils...');
    const avatarUtilsChecks = {
      window: typeof window.AvatarUtils !== 'undefined',
      globalThis: typeof globalThis.AvatarUtils !== 'undefined',
      legacyContext: typeof (window.legacyContext?.AvatarUtils) !== 'undefined'
    };
    
    console.log('  - window.AvatarUtils:', avatarUtilsChecks.window ? '✅ Available' : '❌ Missing');
    console.log('  - globalThis.AvatarUtils:', avatarUtilsChecks.globalThis ? '✅ Available' : '❌ Missing');
    console.log('  - legacyContext.AvatarUtils:', avatarUtilsChecks.legacyContext ? '✅ Available' : '❌ Missing');
    
    if (avatarUtilsChecks.window) {
      console.log('  - window.AvatarUtils.createUnifiedAvatar:', typeof window.AvatarUtils.createUnifiedAvatar === 'function' ? '✅ Function exists' : '❌ Function missing');
      results.findings.push('AvatarUtils is available on window');
    } else {
      results.errors.push('AvatarUtils not available on window - check src/utils/AvatarUtils.ts exports to window');
    }
    
    if (!avatarUtilsChecks.legacyContext && avatarUtilsChecks.window) {
      results.warnings.push('AvatarUtils available on window but not on legacyContext - ProfileManager may not find it');
    }
    console.log('');

    // 3. Check currentUser in stateManager
    console.log('3️⃣ CHECKING currentUser in stateManager...');
    try {
      const stateManager = window.stateManagerInstance || window.stateManager;
      if (stateManager) {
        const currentUser = await stateManager.getState('currentUser');
        if (currentUser) {
          console.log('✅ currentUser found in stateManager:');
          console.log('  - Email:', currentUser.email);
          console.log('  - Name:', currentUser.name);
          console.log('  - ID:', currentUser.id);
          console.log('  - Avatar URL:', currentUser.avatarUrl || currentUser.picture || 'MISSING');
          console.log('  - Aura Color:', currentUser.auraColor || 'MISSING');
          results.findings.push(`currentUser found: ${currentUser.email || currentUser.id}`);
          
          if (!currentUser.avatarUrl && !currentUser.picture) {
            results.warnings.push('currentUser has no avatarUrl or picture');
          }
          if (!currentUser.auraColor) {
            results.warnings.push('currentUser has no auraColor');
          }
        } else {
          console.error('❌ currentUser is null/undefined in stateManager');
          results.errors.push('currentUser is null in stateManager - authentication may have failed');
        }
      } else {
        console.error('❌ stateManager not found');
        results.errors.push('stateManager not available - check StateManager.js is loaded');
      }
    } catch (error) {
      console.error('❌ Error checking stateManager:', error);
      results.errors.push(`Error checking stateManager: ${error.message}`);
    }
    console.log('');

    // 4. Check ProfileManager state
    console.log('4️⃣ CHECKING ProfileManager state...');
    const profileManager = window.profileManager || window.ProfileManager;
    if (profileManager) {
      console.log('✅ ProfileManager instance found');
      if (profileManager.profileData) {
        console.log('  - profileData exists:', Object.keys(profileManager.profileData));
        results.findings.push('ProfileManager has profileData');
      } else {
        console.warn('⚠️ ProfileManager.profileData is missing');
        results.warnings.push('ProfileManager.profileData is missing');
      }
    } else {
      console.warn('⚠️ ProfileManager instance not found on window');
      results.warnings.push('ProfileManager instance not accessible on window');
    }
    console.log('');

    // 5. Check DOM elements
    console.log('5️⃣ CHECKING DOM elements...');
    const avatarContainer = document.getElementById('user-avatar-container');
    if (avatarContainer) {
      console.log('✅ user-avatar-container found');
      console.log('  - Inner HTML length:', avatarContainer.innerHTML.length);
      console.log('  - Has children:', avatarContainer.children.length > 0);
      console.log('  - Inner HTML preview:', avatarContainer.innerHTML.substring(0, 100));
      
      if (avatarContainer.innerHTML.length === 0) {
        results.errors.push('user-avatar-container exists but is empty - avatar was not rendered');
      } else {
        results.findings.push('user-avatar-container has content');
      }
    } else {
      console.error('❌ user-avatar-container not found in DOM');
      results.errors.push('user-avatar-container DOM element not found');
    }
    console.log('');

    // 6. Check module loading order
    console.log('6️⃣ CHECKING module loading order...');
    const scripts = Array.from(document.querySelectorAll('script[type="module"]'));
    const avatarUtilsScript = scripts.find(s => s.src.includes('AvatarUtils'));
    const profileManagerScript = scripts.find(s => s.src.includes('ProfileManager'));
    
    if (avatarUtilsScript && profileManagerScript) {
      const avatarUtilsIndex = scripts.indexOf(avatarUtilsScript);
      const profileManagerIndex = scripts.indexOf(profileManagerScript);
      console.log('  - AvatarUtils script index:', avatarUtilsIndex);
      console.log('  - ProfileManager script index:', profileManagerIndex);
      
      if (avatarUtilsIndex < profileManagerIndex) {
        console.log('✅ AvatarUtils loads before ProfileManager (correct order)');
        results.findings.push('Module loading order is correct');
      } else {
        console.warn('⚠️ ProfileManager loads before AvatarUtils (potential timing issue)');
        results.warnings.push('ProfileManager may load before AvatarUtils - timing issue possible');
      }
    }
    console.log('');

    // 7. Test AvatarUtils.createUnifiedAvatar if available
    console.log('7️⃣ TESTING AvatarUtils.createUnifiedAvatar...');
    if (window.AvatarUtils && typeof window.AvatarUtils.createUnifiedAvatar === 'function') {
      try {
        const testUser = {
          id: 'test-user',
          email: 'test@example.com',
          name: 'Test User',
          avatarUrl: null,
          auraColor: '#ff0000'
        };
        const avatarHTML = await window.AvatarUtils.createUnifiedAvatar(testUser, 'profile', {
          showAura: true,
          showStatus: true,
          size: 32
        });
        console.log('✅ AvatarUtils.createUnifiedAvatar works');
        console.log('  - Generated HTML length:', avatarHTML.length);
        console.log('  - HTML preview:', avatarHTML.substring(0, 150));
        results.findings.push('AvatarUtils.createUnifiedAvatar function works correctly');
      } catch (error) {
        console.error('❌ AvatarUtils.createUnifiedAvatar failed:', error);
        results.errors.push(`AvatarUtils.createUnifiedAvatar error: ${error.message}`);
      }
    } else {
      console.warn('⚠️ Cannot test AvatarUtils.createUnifiedAvatar - not available');
      results.warnings.push('AvatarUtils.createUnifiedAvatar not available for testing');
    }
    console.log('');

    // 8. Check for timing issues
    console.log('8️⃣ CHECKING for timing issues...');
    const checkTiming = () => {
      const hasAvatarUtils = typeof window.AvatarUtils !== 'undefined';
      const hasCurrentUser = window.stateManagerInstance && 
        window.stateManagerInstance.getState('currentUser').then(u => !!u).catch(() => false);
      
      return { hasAvatarUtils, hasCurrentUser };
    };
    
    // Check immediately
    const timingCheck1 = checkTiming();
    console.log('  - Immediate check - AvatarUtils:', timingCheck1.hasAvatarUtils ? '✅' : '❌');
    
    // Check after delay
    setTimeout(async () => {
      const timingCheck2 = checkTiming();
      console.log('  - After 500ms - AvatarUtils:', timingCheck2.hasAvatarUtils ? '✅' : '❌');
      
      if (!timingCheck1.hasAvatarUtils && timingCheck2.hasAvatarUtils) {
        results.warnings.push('AvatarUtils loads asynchronously - ProfileManager may need to wait longer');
      }
    }, 500);
    console.log('');

    // Summary
    console.log('📊 ===== DIAGNOSTIC SUMMARY =====');
    console.log('Errors:', results.errors.length);
    results.errors.forEach((e, i) => console.log(`  ${i + 1}. ${e}`));
    console.log('');
    console.log('Warnings:', results.warnings.length);
    results.warnings.forEach((w, i) => console.log(`  ${i + 1}. ${w}`));
    console.log('');
    console.log('Findings:', results.findings.length);
    results.findings.forEach((f, i) => console.log(`  ${i + 1}. ${f}`));
    console.log('');

    // Recommendations
    console.log('💡 RECOMMENDATIONS:');
    if (results.errors.some(e => e.includes('AvatarUtils'))) {
      console.log('  1. Ensure AvatarUtils.ts exports to window.AvatarUtils AND legacyContext.AvatarUtils');
      results.recommendations.push('Fix AvatarUtils export to legacyContext');
    }
    if (results.errors.some(e => e.includes('Logger.js'))) {
      console.log('  2. Verify Logger.js exists in extension/utils/ and is loaded in sidepanel.html');
      results.recommendations.push('Fix Logger.js loading');
    }
    if (results.warnings.some(w => w.includes('timing'))) {
      console.log('  3. Increase retry count/delay in ProfileManager for AvatarUtils availability');
      results.recommendations.push('Fix timing issues with AvatarUtils loading');
    }
    if (results.errors.some(e => e.includes('currentUser is null'))) {
      console.log('  4. Check authentication flow - ensure currentUser is set in stateManager');
      results.recommendations.push('Fix currentUser not being set in stateManager');
    }
    if (results.errors.some(e => e.includes('user-avatar-container'))) {
      console.log('  5. Ensure ProfileManager calls createUserAvatar() after authentication');
      results.recommendations.push('Fix avatar container not being populated');
    }

    // Store results for later analysis
    window.profileAvatarDiagnosticResults = results;
    console.log('');
    console.log('✅ Diagnostic complete. Results stored in window.profileAvatarDiagnosticResults');
    console.log('');

    return results;
  }

  // Export to window
  if (typeof window !== 'undefined') {
    window.runProfileAvatarDiagnostic = runProfileAvatarDiagnostic;
    console.log('✅ Profile Avatar Diagnostic script loaded. Run: window.runProfileAvatarDiagnostic()');
  }
})();

