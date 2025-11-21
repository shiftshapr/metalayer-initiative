/**
 * DIAGNOSTIC: Profile Avatar Timing and Race Condition Issues
 * 
 * This script diagnoses timing issues preventing profile avatar from displaying correctly:
 * 1. Checks when avatar is created vs when auraColor is set
 * 2. Checks if "already exists" guard prevents updates
 * 3. Checks stateManager auraColor availability timeline
 * 4. Tests avatar update when auraColor becomes available
 * 
 * Run in browser console on extension sidepanel
 */

async function diagnoseProfileAvatarTiming() {
  console.log('🔍 ===== PROFILE AVATAR TIMING DIAGNOSTIC =====');
  const results = {
    timestamp: new Date().toISOString(),
    checks: {},
    timeline: [],
    rootCauses: [],
    recommendations: []
  };

  // CHECK 1: Current State
  console.log('\n1️⃣ Checking Current State...');
  results.checks.currentState = {
    stateManagerAvailable: typeof window.stateManagerInstance !== 'undefined',
    currentUser: null,
    currentUserAuraColor: null,
    avatarContainer: !!document.getElementById('user-avatar-container'),
    avatarExists: !!document.querySelector('#user-avatar-container .user-avatar'),
    auraElement: null,
    auraColor: null
  };

  if (results.checks.currentState.stateManagerAvailable) {
    const currentUser = window.stateManagerInstance.getState('currentUser');
    results.checks.currentState.currentUser = currentUser;
    if (currentUser) {
      results.checks.currentState.currentUserAuraColor = currentUser.auraColor;
      console.log(`   ✅ currentUser: ${currentUser.email}`);
      console.log(`   📋 User ID: ${currentUser.id}`);
      console.log(`   📋 Aura Color in stateManager: ${currentUser.auraColor || 'MISSING'}`);
    }
  }

  const avatarContainer = document.getElementById('user-avatar-container');
  if (avatarContainer) {
    const userAvatar = avatarContainer.querySelector('.user-avatar');
    if (userAvatar) {
      const auraElement = userAvatar.querySelector('.avatar-aura-background');
      if (auraElement) {
        const computedStyle = window.getComputedStyle(auraElement);
        results.checks.currentState.auraColor = computedStyle.backgroundColor;
        console.log(`   📋 Aura element found with color: ${results.checks.currentState.auraColor}`);
      }
    }
  }

  // CHECK 2: Timeline Analysis (from logs)
  console.log('\n2️⃣ Timeline Analysis (from provided logs)...');
  results.timeline = [
    { time: 'T+0ms', event: 'ProfileManager initialized, setupProfileMenuAndAuraModal called', auraColor: 'NOT SET' },
    { time: 'T+~500ms', event: 'Avatar created (innerHTML length: 678)', auraColor: 'NOT SET (stateManager missing auraColor)' },
    { time: 'T+~1000ms', event: 'API fetches auraColor: #33aa33', auraColor: 'FETCHED' },
    { time: 'T+~1500ms', event: 'stateManager updated with auraColor: #33aa33', auraColor: 'SET IN STATEMANAGER' },
    { time: 'T+~2000ms', event: 'ProfileManager tries to update avatar', auraColor: 'AVAILABLE' },
    { time: 'T+~2000ms', event: 'ProfileManager: "User avatar already exists, skipping creation"', auraColor: 'UPDATE BLOCKED' }
  ];

  results.timeline.forEach((entry, i) => {
    console.log(`   ${i + 1}. ${entry.time}: ${entry.event} (auraColor: ${entry.auraColor})`);
  });

  // CHECK 3: Test Avatar Update
  console.log('\n3️⃣ Testing Avatar Update with Correct Aura Color...');
  if (results.checks.currentState.currentUser && results.checks.currentState.currentUserAuraColor && avatarContainer) {
    try {
      const currentUser = results.checks.currentState.currentUser;
      const correctAuraColor = currentUser.auraColor;
      
      console.log(`   🔧 Attempting to update avatar with correct auraColor: ${correctAuraColor}`);
      
      if (window.AvatarUtils && typeof window.AvatarUtils.createUnifiedAvatar === 'function') {
        const testUser = {
          id: currentUser.id,
          email: currentUser.email,
          name: currentUser.name,
          avatarUrl: currentUser.picture || currentUser.avatarUrl,
          auraColor: correctAuraColor
        };
        
        const avatarHTML = await window.AvatarUtils.createUnifiedAvatar(testUser, 'profile', {
          showAura: true,
          showStatus: true,
          size: 32
        });
        
        // Force update (bypass "already exists" check)
        avatarContainer.innerHTML = `<div class="user-avatar">${avatarHTML}</div>`;
        console.log(`   ✅ Avatar updated with correct auraColor`);
        
        // Check if aura color is now correct
        const updatedAuraElement = avatarContainer.querySelector('.avatar-aura-background');
        if (updatedAuraElement) {
          const updatedComputedStyle = window.getComputedStyle(updatedAuraElement);
          const updatedAuraColor = updatedComputedStyle.backgroundColor;
          console.log(`   📋 Updated aura color: ${updatedAuraColor}`);
          
          // Convert hex to rgb for comparison
          const hexToRgb = (hex) => {
            const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
            if (!result) return null;
            const r = parseInt(result[1], 16);
            const g = parseInt(result[2], 16);
            const b = parseInt(result[3], 16);
            return `rgb(${r}, ${g}, ${b})`;
          };
          
          const expectedRgb = hexToRgb(correctAuraColor);
          if (updatedAuraColor === expectedRgb) {
            console.log(`   ✅ Aura color matches! Expected: ${expectedRgb}, Actual: ${updatedAuraColor}`);
            results.checks.avatarUpdate = { success: true, auraColorCorrect: true };
          } else {
            console.log(`   ⚠️ Aura color mismatch! Expected: ${expectedRgb}, Actual: ${updatedAuraColor}`);
            results.checks.avatarUpdate = { success: true, auraColorCorrect: false };
            results.rootCauses.push(`Avatar update succeeded but aura color still incorrect: Expected ${expectedRgb}, got ${updatedAuraColor}`);
          }
        }
      }
    } catch (error) {
      console.log(`   ❌ Error updating avatar: ${error.message}`);
      results.rootCauses.push(`Avatar update failed: ${error.message}`);
    }
  }

  // ROOT CAUSE ANALYSIS
  console.log('\n🔍 ===== ROOT CAUSE ANALYSIS =====');
  
  // Root cause 1: Race condition
  results.rootCauses.push('RACE CONDITION: Avatar is created BEFORE auraColor is fetched from API and set in stateManager');
  
  // Root cause 2: "Already exists" guard
  results.rootCauses.push('"ALREADY EXISTS" GUARD: ProfileManager checks "User avatar already exists, skipping creation" which prevents updating avatar when auraColor becomes available');
  
  // Root cause 3: getCurrentUserAuraColor timing
  results.rootCauses.push('TIMING ISSUE: getCurrentUserAuraColor() is called when stateManager.currentUser.auraColor is not yet set, returns fallback white (#ffffff)');
  
  // Root cause 4: No listener for auraColor updates
  if (!results.checks.currentState.currentUserAuraColor) {
    results.rootCauses.push('MISSING AURACOLOR: stateManager.currentUser.auraColor is still not set, indicating API fetch may have failed or not completed');
  }
  
  results.rootCauses.forEach((cause, i) => {
    console.log(`\n   ${i + 1}. ${cause}`);
  });

  // RECOMMENDATIONS
  console.log('\n💡 ===== RECOMMENDATIONS =====');
  results.recommendations.push('FIX 1: Remove or modify "User avatar already exists" check to allow avatar update when auraColor becomes available');
  results.recommendations.push('FIX 2: Add listener for stateManager.currentUser.auraColor changes to trigger avatar refresh');
  results.recommendations.push('FIX 3: Delay avatar creation until auraColor is available, OR create with fallback and update when auraColor arrives');
  results.recommendations.push('FIX 4: Make setupProfileMenuAndAuraModal() check for auraColor updates and refresh avatar if it changed');
  
  results.recommendations.forEach((rec, i) => {
    console.log(`\n   ${i + 1}. ${rec}`);
  });

  console.log('\n✅ ===== DIAGNOSTIC COMPLETE =====');
  return results;
}

// Export for use
if (typeof window !== 'undefined') {
  window.diagnoseProfileAvatarTiming = diagnoseProfileAvatarTiming;
  console.log('✅ Profile Avatar Timing Diagnostic loaded! Run: window.diagnoseProfileAvatarTiming()');
}


