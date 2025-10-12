/**
 * COMPREHENSIVE DIAGNOSTIC SUITE FOR AVATAR & VISIBILITY ISSUES
 * 
 * Run these in the Chrome DevTools Console:
 * - window.diagnoseCriticalIssues() - Full diagnostic report
 * - window.testProfileAvatarFlow() - Test profile avatar rendering
 * - window.testVisibilityAvatarFlow() - Test visibility avatar rendering
 * - window.testVisibilityTimeFlow() - Test visibility time updates
 * - window.forceReloadAvatars() - Force reload all avatars and update UI
 */

// ============================================================================
// DIAGNOSTIC 1: Profile Avatar Flow
// ============================================================================
window.testProfileAvatarFlow = function() {
  console.log("🔍 DIAGNOSTIC 1: Profile Avatar Flow");
  console.log("================================================================================");
  
  console.log("1. Current User:");
  console.log("   window.currentUser:", window.currentUser);
  
  console.log("\n2. Unfiltered Visibility Data:");
  console.log("   window.currentVisibilityDataUnfiltered:", window.currentVisibilityDataUnfiltered);
  
  if (window.currentVisibilityDataUnfiltered && window.currentVisibilityDataUnfiltered.active) {
    console.log(`   Found ${window.currentVisibilityDataUnfiltered.active.length} users in unfiltered data`);
    
    if (window.currentUser && window.currentUser.email) {
      const currentUserInVisibility = window.currentVisibilityDataUnfiltered.active.find(
        u => u.email === window.currentUser.email || u.userId === window.currentUser.email || u.id === window.currentUser.email
      );
      
      if (currentUserInVisibility) {
        console.log("   ✅ FOUND current user in unfiltered data:");
        console.log("      Email:", currentUserInVisibility.email);
        console.log("      Avatar URL:", currentUserInVisibility.avatarUrl);
        console.log("      Aura Color:", currentUserInVisibility.auraColor);
        console.log("      Is Real Google Avatar:", currentUserInVisibility.avatarUrl?.includes('lh3.googleusercontent.com') || 
                    currentUserInVisibility.avatarUrl?.includes('googleusercontent.com'));
      } else {
        console.error("   ❌ PROBLEM: Current user NOT found in unfiltered data!");
        console.error("      Looking for:", window.currentUser.email);
        console.error("      Available users:", window.currentVisibilityDataUnfiltered.active.map(u => u.email || u.userId || u.id));
      }
    }
  } else {
    console.error("   ❌ PROBLEM: window.currentVisibilityDataUnfiltered is undefined!");
    console.error("      This means updateVisibleTab() hasn't been called yet.");
  }
  
  console.log("\n3. Profile Avatar DOM:");
  const profileContainer = document.getElementById('user-avatar-container');
  if (profileContainer) {
    console.log("   ✅ Profile container found");
    console.log("   HTML:", profileContainer.innerHTML.substring(0, 200) + "...");
    
    const img = profileContainer.querySelector('img');
    if (img) {
      console.log("   Image src:", img.src);
      console.log("   Is Real Google Avatar:", img.src.includes('lh3.googleusercontent.com') || img.src.includes('googleusercontent.com'));
    } else {
      console.error("   ❌ PROBLEM: No img element found in profile container!");
    }
    
    const auraDiv = profileContainer.querySelector('div[style*="background-color"]');
    if (auraDiv) {
      const auraColor = window.getComputedStyle(auraDiv, null).getPropertyValue('background-color');
      console.log("   Aura background color:", auraColor);
    } else {
      console.error("   ❌ PROBLEM: No aura div found in profile container!");
    }
  } else {
    console.error("   ❌ PROBLEM: Profile container (#user-avatar-container) not found!");
  }
  
  console.log("\n📊 DIAGNOSIS:");
  console.log("================================================================================");
  if (!window.currentVisibilityDataUnfiltered || !window.currentVisibilityDataUnfiltered.active) {
    console.error("❌ ROOT CAUSE: Visibility data not loaded yet when profile avatar was rendered");
    console.error("   SOLUTION: Need to call updateUI() AFTER loadCombinedAvatars() completes");
  } else if (window.currentUser && !window.currentVisibilityDataUnfiltered.active.find(u => 
    u.email === window.currentUser.email || u.userId === window.currentUser.email || u.id === window.currentUser.email
  )) {
    console.error("❌ ROOT CAUSE: Current user not present in visibility data");
    console.error("   SOLUTION: API should return ALL users including current user");
  } else {
    console.log("✅ Data looks correct - may be a rendering issue");
  }
};

// ============================================================================
// DIAGNOSTIC 2: Visibility Avatar Flow
// ============================================================================
window.testVisibilityAvatarFlow = function() {
  console.log("🔍 DIAGNOSTIC 2: Visibility Avatar Flow");
  console.log("================================================================================");
  
  console.log("1. Filtered Visibility Data:");
  console.log("   window.currentVisibilityData:", window.currentVisibilityData);
  
  if (window.currentVisibilityData && window.currentVisibilityData.active) {
    console.log(`   Found ${window.currentVisibilityData.active.length} users in filtered data`);
    
    window.currentVisibilityData.active.forEach((user, index) => {
      console.log(`\n   User ${index + 1}:`);
      console.log("      Name:", user.name);
      console.log("      Email:", user.email);
      console.log("      Avatar URL:", user.avatarUrl);
      console.log("      Aura Color:", user.auraColor);
      console.log("      Is Real Google Avatar:", user.avatarUrl?.includes('lh3.googleusercontent.com') || 
                  user.avatarUrl?.includes('googleusercontent.com'));
    });
  } else {
    console.error("   ❌ PROBLEM: window.currentVisibilityData is undefined!");
  }
  
  console.log("\n2. Visibility List DOM:");
  const visibleTab = document.getElementById('canopi-visible');
  if (visibleTab) {
    const userItems = visibleTab.querySelectorAll('.user-item');
    console.log(`   Found ${userItems.length} user items in DOM`);
    
    userItems.forEach((item, index) => {
      const userId = item.getAttribute('data-user-id');
      const userName = item.getAttribute('data-user-name');
      const img = item.querySelector('img');
      const auraDiv = item.querySelector('div[style*="background-color"]');
      
      console.log(`\n   DOM User ${index + 1}:`);
      console.log("      User ID:", userId);
      console.log("      User Name:", userName);
      if (img) {
        console.log("      Image src:", img.src);
        console.log("      Is Real Google Avatar:", img.src.includes('lh3.googleusercontent.com') || img.src.includes('googleusercontent.com'));
      } else {
        console.error("      ❌ No img element found!");
      }
      if (auraDiv) {
        const auraColor = window.getComputedStyle(auraDiv, null).getPropertyValue('background-color');
        console.log("      Aura color:", auraColor);
      } else {
        console.error("      ❌ No aura div found!");
      }
    });
  } else {
    console.error("   ❌ PROBLEM: Visibility list (#canopi-visible) not found!");
  }
  
  console.log("\n📊 DIAGNOSIS:");
  console.log("================================================================================");
  if (!window.currentVisibilityData || !window.currentVisibilityData.active) {
    console.error("❌ ROOT CAUSE: Visibility data not loaded");
  } else {
    const realAvatars = window.currentVisibilityData.active.filter(u => 
      u.avatarUrl && (u.avatarUrl.includes('lh3.googleusercontent.com') || u.avatarUrl.includes('googleusercontent.com'))
    ).length;
    const fakeAvatars = window.currentVisibilityData.active.filter(u => 
      u.avatarUrl && u.avatarUrl.includes('ui-avatars.com')
    ).length;
    
    console.log(`✅ Avatar URL Analysis:`);
    console.log(`   Real Google Avatars: ${realAvatars}/${window.currentVisibilityData.active.length}`);
    console.log(`   Fake Avatars (ui-avatars.com): ${fakeAvatars}/${window.currentVisibilityData.active.length}`);
    
    if (fakeAvatars > 0) {
      console.error("❌ ROOT CAUSE: API is returning fake avatar URLs (ui-avatars.com)");
      console.error("   SOLUTION: Backend must return REAL Google profile picture URLs from database");
    }
  }
};

// ============================================================================
// DIAGNOSTIC 3: Visibility Time Flow
// ============================================================================
window.testVisibilityTimeFlow = function() {
  console.log("🔍 DIAGNOSTIC 3: Visibility Time Flow");
  console.log("================================================================================");
  
  console.log("1. Current Time:", new Date().toISOString());
  
  console.log("\n2. Visibility Data Times:");
  if (window.currentVisibilityData && window.currentVisibilityData.active) {
    window.currentVisibilityData.active.forEach((user, index) => {
      const enterTime = user.enterTime;
      const now = new Date();
      const enterTimeDate = enterTime ? new Date(enterTime) : null;
      const diffMs = enterTimeDate ? (now - enterTimeDate) : null;
      const diffSeconds = diffMs ? Math.floor(diffMs / 1000) : null;
      const diffMinutes = diffSeconds ? Math.floor(diffSeconds / 60) : null;
      
      console.log(`\n   User ${index + 1}: ${user.name}`);
      console.log("      enterTime:", enterTime);
      console.log("      enterTime (parsed):", enterTimeDate ? enterTimeDate.toISOString() : 'null');
      console.log("      Time diff (seconds):", diffSeconds);
      console.log("      Time diff (minutes):", diffMinutes);
      console.log("      Expected display:", diffSeconds < 60 ? "Now" : `Online for ${diffMinutes} minute${diffMinutes === 1 ? '' : 's'}`);
    });
  } else {
    console.error("   ❌ PROBLEM: window.currentVisibilityData is undefined!");
  }
  
  console.log("\n3. Visibility List DOM Times:");
  const visibleTab = document.getElementById('canopi-visible');
  if (visibleTab) {
    const userItems = visibleTab.querySelectorAll('.user-item');
    console.log(`   Found ${userItems.length} user items in DOM`);
    
    userItems.forEach((item, index) => {
      const userId = item.getAttribute('data-user-id');
      const userName = item.getAttribute('data-user-name');
      const statusElement = item.querySelector('.item-status');
      
      console.log(`\n   DOM User ${index + 1}:`);
      console.log("      User ID:", userId);
      console.log("      User Name:", userName);
      console.log("      Status text:", statusElement ? statusElement.textContent : 'element not found');
    });
  } else {
    console.error("   ❌ PROBLEM: Visibility list (#canopi-visible) not found!");
  }
  
  console.log("\n4. Visibility Timer:");
  console.log("   window.visibilityUpdateTimer:", window.visibilityUpdateTimer);
  console.log("   Timer active:", window.visibilityUpdateTimer !== null && window.visibilityUpdateTimer !== undefined);
  
  console.log("\n📊 DIAGNOSIS:");
  console.log("================================================================================");
  if (!window.currentVisibilityData || !window.currentVisibilityData.active) {
    console.error("❌ ROOT CAUSE: Visibility data not loaded");
  } else {
    const allNow = window.currentVisibilityData.active.every(u => {
      const enterTime = u.enterTime;
      if (!enterTime) return true;
      const now = new Date();
      const enterTimeDate = new Date(enterTime);
      const diffSeconds = Math.floor((now - enterTimeDate) / 1000);
      return diffSeconds < 60;
    });
    
    if (allNow) {
      console.warn("⚠️ All users have enterTime < 60 seconds - expected behavior is 'Now'");
      console.log("   Wait 60 seconds and run this test again to see minutes display");
    } else {
      const statusElements = document.querySelectorAll('.item-status');
      const allShowNow = Array.from(statusElements).every(el => el.textContent === 'Now');
      
      if (allShowNow) {
        console.error("❌ ROOT CAUSE: updateVisibilityTimes() is not working correctly");
        console.error("   SOLUTION: Check if .item-status selector is correct and function is being called");
      } else {
        console.log("✅ Times are updating correctly");
      }
    }
  }
};

// ============================================================================
// DIAGNOSTIC 4: Full System Diagnostic
// ============================================================================
window.diagnoseCriticalIssues = async function() {
  console.log("🚨 COMPREHENSIVE DIAGNOSTIC REPORT");
  console.log("================================================================================");
  console.log("Testing all avatar and visibility systems...\n");
  
  window.testProfileAvatarFlow();
  console.log("\n");
  window.testVisibilityAvatarFlow();
  console.log("\n");
  window.testVisibilityTimeFlow();
  
  console.log("\n\n🔧 RECOMMENDED ACTIONS:");
  console.log("================================================================================");
  console.log("1. If profile avatar shows ui-avatars.com:");
  console.log("   Run: window.forceReloadAvatars()");
  console.log("\n2. If visibility avatars show ui-avatars.com:");
  console.log("   Check backend API - it may not be returning real Google avatar URLs");
  console.log("\n3. If times are stuck on 'Now':");
  console.log("   Wait 60 seconds, then run: window.testVisibilityTimeFlow()");
  console.log("   If still stuck, run: window.testTimeUpdate()");
};

// ============================================================================
// FIX 1: Force Reload All Avatars and Update UI
// ============================================================================
window.forceReloadAvatars = async function() {
  console.log("🔧 FORCING AVATAR RELOAD AND UI UPDATE...");
  console.log("================================================================================");
  
  try {
    // Step 1: Reload avatars from API
    console.log("Step 1: Reloading avatars from API...");
    await loadCombinedAvatars();
    console.log("✅ Avatars reloaded");
    
    // Step 2: Wait a bit for data to be set
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Step 3: Update UI with current user
    if (window.currentUser) {
      console.log("Step 2: Updating UI with current user...");
      await updateUI(window.currentUser);
      console.log("✅ UI updated");
    } else {
      console.error("❌ No current user found!");
    }
    
    // Step 4: Force time update
    console.log("Step 3: Forcing time update...");
    if (typeof updateVisibilityTimes === 'function') {
      updateVisibilityTimes();
      console.log("✅ Times updated");
    } else {
      console.error("❌ updateVisibilityTimes function not found!");
    }
    
    console.log("\n✅ COMPLETE - Check avatars and times now");
  } catch (error) {
    console.error("❌ Error during forced reload:", error);
  }
};

console.log("✅ DIAGNOSTIC SUITE LOADED");
console.log("================================================================================");
console.log("Available commands:");
console.log("  - window.diagnoseCriticalIssues()  : Full diagnostic report");
console.log("  - window.testProfileAvatarFlow()   : Test profile avatar");
console.log("  - window.testVisibilityAvatarFlow(): Test visibility avatars");
console.log("  - window.testVisibilityTimeFlow()  : Test visibility times");
console.log("  - window.forceReloadAvatars()      : Force reload and update");
console.log("================================================================================");


