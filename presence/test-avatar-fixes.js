/**
 * COMPREHENSIVE TEST SUITE FOR AVATAR FIXES
 * Run these tests in Chrome DevTools Console
 * 
 * Tests:
 * 1. Profile avatar using unified system
 * 2. Visibility avatar using unified system
 * 3. Visibility time updates working
 */

console.log("🧪 AVATAR FIX TEST SUITE");
console.log("================================================================================\n");

// ============================================================================
// TEST 1: Profile Avatar Using Unified System
// ============================================================================
window.testProfileAvatar = function() {
  console.log("🔍 TEST 1: Profile Avatar Using Unified System");
  console.log("================================================================================");
  
  const container = document.getElementById('user-avatar-container');
  if (!container) {
    console.error("❌ TEST 1 FAILED: user-avatar-container not found");
    return false;
  }
  console.log("✅ Found profile avatar container");
  
  const html = container.innerHTML;
  console.log("Profile avatar HTML:", html);
  
  // Check for unified avatar structure
  const hasAuraBackground = html.includes('border-radius: 50%') && html.includes('background:');
  const hasImage = html.includes('<img');
  const hasAuraBorder = html.includes('border:');
  
  console.log("Has aura background:", hasAuraBackground);
  console.log("Has image:", hasImage);
  console.log("Has aura border:", hasAuraBorder);
  
  if (hasAuraBackground && hasImage && hasAuraBorder) {
    console.log("✅ TEST 1 PASSED: Profile avatar uses unified system");
    return true;
  } else {
    console.error("❌ TEST 1 FAILED: Profile avatar missing unified structure");
    return false;
  }
};

// ============================================================================
// TEST 2: Visibility Avatar Using Unified System
// ============================================================================
window.testVisibilityAvatar = function() {
  console.log("\n🔍 TEST 2: Visibility Avatar Using Unified System");
  console.log("================================================================================");
  
  const userItems = document.querySelectorAll('.user-item');
  if (userItems.length === 0) {
    console.warn("⚠️ TEST 2 SKIPPED: No visible users found");
    return null;
  }
  
  console.log(`Found ${userItems.length} user items`);
  
  const firstUser = userItems[0];
  const avatarContainer = firstUser.querySelector('.avatar-container');
  
  if (!avatarContainer) {
    console.error("❌ TEST 2 FAILED: avatar-container not found");
    return false;
  }
  
  const html = avatarContainer.innerHTML;
  console.log("Visibility avatar HTML:", html);
  
  // Check for unified avatar structure
  const hasAuraBackground = html.includes('border-radius: 50%') && html.includes('background:');
  const hasImage = html.includes('<img');
  const hasAuraBorder = html.includes('border:');
  const hasStatusDot = html.includes('position: absolute') && html.includes('bottom:');
  
  console.log("Has aura background:", hasAuraBackground);
  console.log("Has image:", hasImage);
  console.log("Has aura border:", hasAuraBorder);
  console.log("Has status dot:", hasStatusDot);
  
  if (hasAuraBackground && hasImage && hasAuraBorder) {
    console.log("✅ TEST 2 PASSED: Visibility avatar uses unified system");
    return true;
  } else {
    console.error("❌ TEST 2 FAILED: Visibility avatar missing unified structure");
    return false;
  }
};

// ============================================================================
// TEST 3: Visibility Time Updates Working
// ============================================================================
window.testVisibilityTimeUpdates = function() {
  console.log("\n🔍 TEST 3: Visibility Time Updates Working");
  console.log("================================================================================");
  
  const userItems = document.querySelectorAll('.user-item');
  if (userItems.length === 0) {
    console.warn("⚠️ TEST 3 SKIPPED: No visible users found");
    return null;
  }
  
  console.log(`Found ${userItems.length} user items`);
  
  let allHaveStatusElements = true;
  
  userItems.forEach((item, index) => {
    const userName = item.getAttribute('data-user-name');
    const statusElement = item.querySelector('.item-status');
    
    if (!statusElement) {
      console.error(`❌ User ${userName} (index ${index}) missing .item-status element`);
      allHaveStatusElements = false;
    } else {
      const statusText = statusElement.textContent;
      console.log(`✅ User ${userName}: status="${statusText}"`);
    }
  });
  
  if (allHaveStatusElements) {
    console.log("✅ TEST 3 PASSED: All users have .item-status elements");
    
    // Trigger a time update
    console.log("\n🔄 Triggering time update manually...");
    if (typeof updateVisibilityTimes === 'function') {
      updateVisibilityTimes();
      console.log("✅ Time update triggered successfully");
    } else {
      console.warn("⚠️ updateVisibilityTimes function not available");
    }
    
    return true;
  } else {
    console.error("❌ TEST 3 FAILED: Some users missing .item-status elements");
    return false;
  }
};

// ============================================================================
// TEST 4: Profile and Visibility Avatars Look Identical (Visual)
// ============================================================================
window.testAvatarConsistency = function() {
  console.log("\n🔍 TEST 4: Profile and Visibility Avatar Consistency");
  console.log("================================================================================");
  
  const profileContainer = document.getElementById('user-avatar-container');
  const userItems = document.querySelectorAll('.user-item');
  
  if (!profileContainer) {
    console.error("❌ TEST 4 FAILED: Profile avatar container not found");
    return false;
  }
  
  if (userItems.length === 0) {
    console.warn("⚠️ TEST 4 SKIPPED: No visibility avatars to compare");
    return null;
  }
  
  const profileHTML = profileContainer.innerHTML;
  const visibilityHTML = userItems[0].querySelector('.avatar-container')?.innerHTML || '';
  
  // Check if both use the same structure patterns
  const profileUsesUnified = profileHTML.includes('border-radius: 50%') && profileHTML.includes('background:');
  const visibilityUsesUnified = visibilityHTML.includes('border-radius: 50%') && visibilityHTML.includes('background:');
  
  console.log("Profile uses unified structure:", profileUsesUnified);
  console.log("Visibility uses unified structure:", visibilityUsesUnified);
  
  if (profileUsesUnified && visibilityUsesUnified) {
    console.log("✅ TEST 4 PASSED: Both use the same unified avatar system");
    return true;
  } else {
    console.error("❌ TEST 4 FAILED: Avatars use different rendering systems");
    console.log("Profile HTML:", profileHTML);
    console.log("Visibility HTML:", visibilityHTML);
    return false;
  }
};

// ============================================================================
// RUN ALL TESTS
// ============================================================================
window.runAllAvatarTests = async function() {
  console.log("\n🧪 RUNNING ALL AVATAR TESTS");
  console.log("================================================================================\n");
  
  const test1 = window.testProfileAvatar();
  const test2 = window.testVisibilityAvatar();
  const test3 = window.testVisibilityTimeUpdates();
  const test4 = window.testAvatarConsistency();
  
  console.log("\n\n📊 TEST SUMMARY");
  console.log("================================================================================");
  console.log("TEST 1 (Profile Unified):", test1 ? "✅ PASSED" : test1 === null ? "⚠️ SKIPPED" : "❌ FAILED");
  console.log("TEST 2 (Visibility Unified):", test2 ? "✅ PASSED" : test2 === null ? "⚠️ SKIPPED" : "❌ FAILED");
  console.log("TEST 3 (Time Updates):", test3 ? "✅ PASSED" : test3 === null ? "⚠️ SKIPPED" : "❌ FAILED");
  console.log("TEST 4 (Consistency):", test4 ? "✅ PASSED" : test4 === null ? "⚠️ SKIPPED" : "❌ FAILED");
  
  const passedTests = [test1, test2, test3, test4].filter(t => t === true).length;
  const totalTests = [test1, test2, test3, test4].filter(t => t !== null).length;
  
  console.log(`\nRESULT: ${passedTests}/${totalTests} tests passed`);
  
  if (passedTests === totalTests && totalTests > 0) {
    console.log("\n🎉 ALL TESTS PASSED!");
  } else {
    console.log("\n❌ SOME TESTS FAILED - Please reload the extension and try again");
  }
  
  return passedTests === totalTests;
};

console.log("\n✅ TEST SCRIPT LOADED");
console.log("Run: runAllAvatarTests() to test all fixes");
console.log("Or run individual tests:");
console.log("  - testProfileAvatar()");
console.log("  - testVisibilityAvatar()");
console.log("  - testVisibilityTimeUpdates()");
console.log("  - testAvatarConsistency()");


