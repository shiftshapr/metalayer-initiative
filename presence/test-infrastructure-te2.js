// ==========================================
// TE2: COMPREHENSIVE TEST INFRASTRUCTURE
// For Chrome Extension Presence System
// ==========================================

console.log('🧪 TE2: Loading comprehensive test infrastructure...');

// ==========================================
// TEST 1: AVATAR VERIFICATION
// ==========================================

window.te2_testAvatarDisplay = async function() {
  console.log('\n=== TE2: AVATAR DISPLAY TEST ===\n');
  
  let passed = 0;
  let failed = 0;
  const issues = [];
  
  // Test 1.1: Profile avatar exists and has real image
  console.log('TEST 1.1: Profile avatar exists and has real image');
  const userAvatarContainer = document.getElementById('user-avatar-container');
  const currentUser = window.currentUser;
  
  if (!userAvatarContainer) {
    console.error('   ❌ FAIL: Profile avatar container not found');
    failed++;
    issues.push('Profile avatar container missing');
  } else if (!userAvatarContainer.innerHTML.trim()) {
    console.error('   ❌ FAIL: Profile avatar container is empty');
    failed++;
    issues.push('Profile avatar container empty');
  } else {
    const imgElement = userAvatarContainer.querySelector('img');
    if (!imgElement) {
      console.error('   ❌ FAIL: No img element in profile avatar');
      failed++;
      issues.push('Profile avatar has no img element - showing only aura color');
    } else {
      const isRealGoogle = imgElement.src.includes('googleusercontent.com');
      if (isRealGoogle) {
        console.log('   ✅ PASS: Profile avatar has real Google image');
        passed++;
      } else {
        console.error('   ❌ FAIL: Profile avatar using fake/fallback image:', imgElement.src);
        failed++;
        issues.push('Profile avatar not using real Google image');
      }
    }
  }
  
  // Test 1.2: Visibility avatars exist and have real images
  console.log('\nTEST 1.2: Visibility avatars exist and have real images');
  const userItems = document.querySelectorAll('.user-item');
  
  if (userItems.length === 0) {
    console.warn('   ⚠️ SKIP: No visibility users to test (might be expected)');
  } else {
    let visibilityPassed = 0;
    let visibilityFailed = 0;
    
    userItems.forEach((item, index) => {
      const avatarContainer = item.querySelector('.avatar-container');
      const imgElement = avatarContainer?.querySelector('img');
      const userName = item.dataset.userName;
      
      if (!imgElement) {
        console.error(`   ❌ FAIL: User ${index + 1} (${userName}) has no img element`);
        visibilityFailed++;
        issues.push(`Visibility avatar ${index + 1} (${userName}) has no img element`);
      } else {
        const isRealGoogle = imgElement.src.includes('googleusercontent.com');
        if (isRealGoogle) {
          console.log(`   ✅ PASS: User ${index + 1} (${userName}) has real Google image`);
          visibilityPassed++;
        } else {
          console.error(`   ❌ FAIL: User ${index + 1} (${userName}) using fake image:`, imgElement.src);
          visibilityFailed++;
          issues.push(`Visibility avatar ${index + 1} (${userName}) not using real Google image`);
        }
      }
    });
    
    passed += visibilityPassed;
    failed += visibilityFailed;
  }
  
  // Test 1.3: Aura colors are present
  console.log('\nTEST 1.3: Aura colors are present');
  const visibilityData = window.currentVisibilityData;
  
  if (visibilityData && visibilityData.active) {
    let auraPass = 0;
    let auraFail = 0;
    
    visibilityData.active.forEach((user, index) => {
      if (user.auraColor && user.auraColor !== '#45B7D1') {
        console.log(`   ✅ PASS: User ${user.name} has custom aura color: ${user.auraColor}`);
        auraPass++;
      } else {
        console.warn(`   ⚠️ WARN: User ${user.name} using default aura color`);
        // Not a failure, just a warning
      }
    });
    
    passed += auraPass;
  }
  
  // Summary
  console.log('\n📊 AVATAR TEST SUMMARY:');
  console.log(`   ✅ Passed: ${passed}`);
  console.log(`   ❌ Failed: ${failed}`);
  
  if (issues.length > 0) {
    console.log('\n🔍 ISSUES FOUND:');
    issues.forEach((issue, index) => {
      console.log(`   ${index + 1}. ${issue}`);
    });
  }
  
  return { passed, failed, issues };
};

// ==========================================
// TEST 2: VISIBILITY TIMING VERIFICATION
// ==========================================

window.te2_testVisibilityTiming = async function(durationSeconds = 60) {
  console.log(`\n=== TE2: VISIBILITY TIMING TEST (${durationSeconds}s) ===\n`);
  
  console.log('This test will monitor visibility timing for', durationSeconds, 'seconds');
  console.log('Keep the sidepanel open and watch for timing issues...\n');
  
  const issues = [];
  const statusChanges = new Map();
  
  // Record initial state
  const userItems = document.querySelectorAll('.user-item');
  userItems.forEach(item => {
    const userId = item.dataset.userId;
    const statusElement = item.querySelector('.item-status');
    const statusText = statusElement?.textContent;
    
    statusChanges.set(userId, [{
      time: new Date(),
      status: statusText
    }]);
    
    console.log(`📝 Initial status for ${item.dataset.userName}: "${statusText}"`);
  });
  
  // Monitor for changes
  let checkCount = 0;
  const intervalId = setInterval(() => {
    checkCount++;
    console.log(`\n🔍 Check ${checkCount} (${checkCount * 5}s elapsed):`);
    
    const userItems = document.querySelectorAll('.user-item');
    userItems.forEach(item => {
      const userId = item.dataset.userId;
      const userName = item.dataset.userName;
      const statusElement = item.querySelector('.item-status');
      const statusText = statusElement?.textContent;
      
      const history = statusChanges.get(userId) || [];
      const lastStatus = history[history.length - 1]?.status;
      
      if (lastStatus !== statusText) {
        console.log(`   📊 ${userName}: "${lastStatus}" → "${statusText}"`);
        
        // Check for problematic changes
        if (lastStatus && lastStatus.includes('minute') && statusText === 'Now') {
          console.error(`   ❌ ISSUE: Time reset from "${lastStatus}" to "Now"!`);
          issues.push({
            user: userName,
            issue: 'Time reset to Now',
            from: lastStatus,
            to: statusText,
            time: new Date()
          });
        }
        
        if (lastStatus && lastStatus.includes('Online for') && statusText.includes('Last seen')) {
          console.error(`   ❌ ISSUE: Status flipped from active to inactive!`);
          issues.push({
            user: userName,
            issue: 'Status flipped to inactive',
            from: lastStatus,
            to: statusText,
            time: new Date()
          });
        }
        
        history.push({
          time: new Date(),
          status: statusText
        });
        statusChanges.set(userId, history);
      }
    });
  }, 5000); // Check every 5 seconds
  
  // Wait for test duration
  return new Promise(resolve => {
    setTimeout(() => {
      clearInterval(intervalId);
      
      console.log('\n📊 VISIBILITY TIMING TEST SUMMARY:');
      console.log(`   Duration: ${durationSeconds}s`);
      console.log(`   Checks performed: ${checkCount}`);
      console.log(`   Issues found: ${issues.length}`);
      
      if (issues.length > 0) {
        console.log('\n🔍 TIMING ISSUES:');
        issues.forEach((issue, index) => {
          console.log(`   ${index + 1}. ${issue.user}: ${issue.issue}`);
          console.log(`      From: "${issue.from}"`);
          console.log(`      To: "${issue.to}"`);
          console.log(`      Time: ${issue.time.toLocaleTimeString()}`);
        });
      } else {
        console.log('   ✅ No timing issues detected!');
      }
      
      // Show status change history
      console.log('\n📜 STATUS CHANGE HISTORY:');
      statusChanges.forEach((history, userId) => {
        if (history.length > 1) {
          console.log(`   ${userId}:`);
          history.forEach((entry, index) => {
            console.log(`      ${index + 1}. ${entry.time.toLocaleTimeString()}: "${entry.status}"`);
          });
        }
      });
      
      resolve({ issues, statusChanges: Array.from(statusChanges.entries()) });
    }, durationSeconds * 1000);
  });
};

// ==========================================
// TEST 3: GHOST PRESENCE VERIFICATION
// ==========================================

window.te2_testGhostPresence = async function() {
  console.log('\n=== TE2: GHOST PRESENCE TEST ===\n');
  
  console.log('📋 MANUAL TEST INSTRUCTIONS:');
  console.log('   1. Open this sidepanel on Page A (e.g., google.com)');
  console.log('   2. Open another Chrome profile and navigate to the same Page A');
  console.log('   3. Verify both profiles see each other in the Visible list');
  console.log('   4. In Profile 1, navigate to Page B (e.g., youtube.com)');
  console.log('   5. Immediately check Profile 2\'s Visible list');
  console.log('   6. Profile 1 should disappear within 5-10 seconds (not 30+ seconds)');
  console.log('   7. Watch console for "🚪 TAB_CHANGE: Leaving current page" messages');
  console.log('');
  
  // Automated checks
  const issues = [];
  
  // Check 1: leaveCurrentPage function exists
  console.log('CHECK 1: leaveCurrentPage function exists');
  const hasLeaveFunction = window.supabaseRealtimeClient && 
                          typeof window.supabaseRealtimeClient.leaveCurrentPage === 'function';
  
  if (hasLeaveFunction) {
    console.log('   ✅ PASS: leaveCurrentPage function exists');
  } else {
    console.error('   ❌ FAIL: leaveCurrentPage function not found!');
    issues.push('leaveCurrentPage function missing');
  }
  
  // Check 2: Test leave function
  console.log('\nCHECK 2: Test leave function manually');
  if (hasLeaveFunction) {
    console.log('   Run this command to test:');
    console.log('   await window.supabaseRealtimeClient.leaveCurrentPage()');
    console.log('   Then check if your presence disappears from other profiles');
  }
  
  // Check 3: Monitor for automatic leave on tab change
  console.log('\nCHECK 3: Monitor for automatic leave on tab change');
  console.log('   Navigate to a different page and watch for:');
  console.log('   - "🚪 TAB_CHANGE: Leaving current page" log');
  console.log('   - "✅ TAB_CHANGE: Left current page successfully" log');
  console.log('   - Your presence should disappear from other profiles within 5-10s');
  
  return { issues, manual: true };
};

// ==========================================
// TEST 4: EMPTY VISIBILITY VERIFICATION
// ==========================================

window.te2_testEmptyVisibility = async function() {
  console.log('\n=== TE2: EMPTY VISIBILITY TEST ===\n');
  
  const issues = [];
  
  // Test 1: Check if users are on the same page
  console.log('TEST 1: Page ID consistency');
  try {
    const urlData = await window.normalizeCurrentUrl();
    const pageId = urlData.pageId;
    
    console.log('   Current pageId:', pageId);
    
    if (pageId.includes('___')) {
      console.error('   ❌ FAIL: pageId contains triple underscores (cache bug)');
      issues.push('PageId has triple underscores - cache poisoning detected');
    } else {
      console.log('   ✅ PASS: pageId format is correct');
    }
  } catch (error) {
    console.error('   ❌ FAIL: Error getting pageId:', error);
    issues.push('Failed to get pageId');
  }
  
  // Test 2: Check backend returns users
  console.log('\nTEST 2: Backend returns active users');
  try {
    const urlData = await window.normalizeCurrentUrl();
    const pageId = urlData.pageId;
    const response = await window.api.getPresenceByUrl(pageId);
    
    if (!response || !response.active) {
      console.error('   ❌ FAIL: Backend returned no response or no active array');
      issues.push('Backend returned invalid response');
    } else if (response.active.length === 0) {
      console.warn('   ⚠️ WARN: Backend returned 0 active users');
      console.warn('   This might be expected if no other users are on this page');
    } else {
      console.log(`   ✅ PASS: Backend returned ${response.active.length} active users`);
    }
  } catch (error) {
    console.error('   ❌ FAIL: Backend API error:', error);
    issues.push('Backend API error');
  }
  
  // Test 3: Check filtering logic
  console.log('\nTEST 3: Filtering logic');
  const visibilityDataUnfiltered = window.currentVisibilityDataUnfiltered;
  const visibilityData = window.currentVisibilityData;
  
  if (!visibilityDataUnfiltered || !visibilityDataUnfiltered.active) {
    console.error('   ❌ FAIL: No unfiltered visibility data');
    issues.push('No unfiltered visibility data');
  } else {
    const unfilteredCount = visibilityDataUnfiltered.active.length;
    const filteredCount = visibilityData?.active?.length || 0;
    
    console.log(`   Unfiltered: ${unfilteredCount} users`);
    console.log(`   Filtered: ${filteredCount} users`);
    console.log(`   Difference: ${unfilteredCount - filteredCount} (should be 1 for current user)`);
    
    if (unfilteredCount - filteredCount === 1) {
      console.log('   ✅ PASS: Filtering correctly removes only current user');
    } else if (unfilteredCount === filteredCount) {
      console.error('   ❌ FAIL: No filtering applied (current user not removed)');
      issues.push('Current user not filtered out');
    } else {
      console.error('   ❌ FAIL: Too many users filtered out');
      issues.push('Excessive filtering - removing other users');
    }
  }
  
  return { issues };
};

// ==========================================
// COMPREHENSIVE TEST SUITE
// ==========================================

window.te2_runAllTests = async function() {
  console.log('\n🧪 TE2: RUNNING COMPREHENSIVE TEST SUITE...\n');
  
  const results = {
    avatars: null,
    timing: null,
    ghostPresence: null,
    emptyVisibility: null
  };
  
  // Test 1: Avatars
  console.log('═══════════════════════════════════════');
  results.avatars = await window.te2_testAvatarDisplay();
  
  // Test 2: Empty Visibility (quick test)
  console.log('\n═══════════════════════════════════════');
  results.emptyVisibility = await window.te2_testEmptyVisibility();
  
  // Test 3: Ghost Presence (manual test)
  console.log('\n═══════════════════════════════════════');
  results.ghostPresence = await window.te2_testGhostPresence();
  
  // Test 4: Timing (ask user if they want to run it)
  console.log('\n═══════════════════════════════════════');
  console.log('⏱️ TIMING TEST AVAILABLE:');
  console.log('   Run window.te2_testVisibilityTiming(60) to test timing for 60 seconds');
  console.log('   (Skipping automatic timing test to save time)');
  
  // Summary
  console.log('\n═══════════════════════════════════════');
  console.log('📊 COMPREHENSIVE TEST SUMMARY:');
  console.log('');
  console.log('AVATAR TESTS:');
  console.log(`   ✅ Passed: ${results.avatars.passed}`);
  console.log(`   ❌ Failed: ${results.avatars.failed}`);
  
  console.log('\nEMPTY VISIBILITY TESTS:');
  console.log(`   Issues: ${results.emptyVisibility.issues.length}`);
  
  console.log('\nGHOST PRESENCE TESTS:');
  console.log(`   Issues: ${results.ghostPresence.issues.length}`);
  console.log(`   Manual testing required: ${results.ghostPresence.manual}`);
  
  // Recommendations
  console.log('\n═══════════════════════════════════════');
  console.log('💡 TE2 RECOMMENDATIONS:');
  console.log('');
  
  if (results.avatars.failed > 0) {
    console.log('🔧 AVATAR FIXES NEEDED:');
    results.avatars.issues.forEach((issue, index) => {
      console.log(`   ${index + 1}. ${issue}`);
    });
    console.log('   → Check if users exist in appUser table');
    console.log('   → Verify avatarUrl field is populated with real Google URLs');
    console.log('   → Check backend logs for "NO USERS FOUND IN appUser TABLE"');
    console.log('');
  }
  
  if (results.emptyVisibility.issues.length > 0) {
    console.log('🔧 VISIBILITY FIXES NEEDED:');
    results.emptyVisibility.issues.forEach((issue, index) => {
      console.log(`   ${index + 1}. ${issue}`);
    });
    console.log('   → Hard refresh Chrome extension if cache bug detected');
    console.log('   → Check backend API response');
    console.log('   → Verify filtering logic');
    console.log('');
  }
  
  if (results.ghostPresence.issues.length > 0) {
    console.log('🔧 GHOST PRESENCE FIXES NEEDED:');
    results.ghostPresence.issues.forEach((issue, index) => {
      console.log(`   ${index + 1}. ${issue}`);
    });
    console.log('   → Implement leaveCurrentPage() function');
    console.log('   → Call it in handleTabChange and handleTabUpdate');
    console.log('   → Verify EXIT events are sent to backend');
    console.log('');
  }
  
  console.log('📋 ADDITIONAL TESTS:');
  console.log('   - Run window.te2_testVisibilityTiming(60) for timing verification');
  console.log('   - Perform manual ghost presence test as described above');
  console.log('');
  
  return results;
};

console.log('✅ TE2: Test infrastructure loaded successfully!');
console.log('📋 Available functions:');
console.log('   - window.te2_runAllTests() - Run all automated tests');
console.log('   - window.te2_testAvatarDisplay() - Test avatar display');
console.log('   - window.te2_testVisibilityTiming(60) - Test timing for 60 seconds');
console.log('   - window.te2_testGhostPresence() - Test ghost presence (manual)');
console.log('   - window.te2_testEmptyVisibility() - Test empty visibility');

