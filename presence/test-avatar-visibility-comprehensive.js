/**
 * Comprehensive Test Suite for Avatar & Visibility Issues
 * To be run in the browser console
 * 
 * Created: 2025-10-11
 * For: TE2 (Test Engineer) to diagnose and verify fixes
 */

// ============================================
// TEST 1: Avatar URL Diagnostic
// ============================================
window.testAvatarURLs = function() {
  console.log('🧪 TEST 1: Avatar URL Diagnostic');
  console.log('='.repeat(60));
  
  // Check current user avatar
  const currentUser = window.currentUser;
  console.log('📋 Current User:', {
    email: currentUser?.email,
    avatarUrl: currentUser?.avatarUrl,
    isRealGoogle: currentUser?.avatarUrl?.includes('googleusercontent.com') || currentUser?.avatarUrl?.includes('lh3.google'),
    isFake: currentUser?.avatarUrl?.includes('ui-avatars.com')
  });
  
  // Check visibility data avatars
  const visibilityData = window.currentVisibilityDataUnfiltered;
  if (visibilityData && visibilityData.active) {
    console.log(`📋 Visibility Data Users (${visibilityData.active.length}):`);
    visibilityData.active.forEach((user, index) => {
      const isReal = user.avatarUrl && (
        user.avatarUrl.includes('googleusercontent.com') ||
        user.avatarUrl.includes('lh3.google')
      );
      const isFake = user.avatarUrl && user.avatarUrl.includes('ui-avatars.com');
      
      console.log(`   User ${index + 1}: ${user.name} (${user.email})`);
      console.log(`      Avatar URL: ${user.avatarUrl}`);
      console.log(`      Is Real Google: ${isReal} ✓` + (isReal ? '' : ' ❌'));
      console.log(`      Is Fake ui-avatars: ${isFake}` + (isFake ? ' ❌' : ' ✓'));
      console.log(`      Aura Color: ${user.auraColor}`);
    });
  } else {
    console.error('❌ No visibility data found!');
  }
  
  // Check profile avatar in DOM
  const profileAvatarContainer = document.getElementById('user-avatar-container');
  if (profileAvatarContainer) {
    const img = profileAvatarContainer.querySelector('img');
    console.log('📋 Profile Avatar (DOM):', {
      src: img?.src,
      isRealGoogle: img?.src?.includes('googleusercontent.com') || img?.src?.includes('lh3.google'),
      isFake: img?.src?.includes('ui-avatars.com')
    });
  } else {
    console.error('❌ Profile avatar container not found in DOM!');
  }
  
  // Check visibility list avatars in DOM
  const visibilityList = document.querySelectorAll('.user-item');
  console.log(`📋 Visibility List Avatars (${visibilityList.length}):`);
  visibilityList.forEach((item, index) => {
    const img = item.querySelector('img');
    const userName = item.getAttribute('data-user-name');
    console.log(`   User ${index + 1}: ${userName}`);
    console.log(`      src: ${img?.src}`);
    console.log(`      Is Real: ${img?.src?.includes('googleusercontent.com') || img?.src?.includes('lh3.google')}`);
  });
  
  console.log('='.repeat(60));
  console.log('✅ TEST 1 COMPLETE');
  
  return {
    currentUserAvatarReal: currentUser?.avatarUrl?.includes('googleusercontent.com') || currentUser?.avatarUrl?.includes('lh3.google'),
    visibilityDataUsersReal: visibilityData?.active?.every(u => u.avatarUrl?.includes('googleusercontent.com') || u.avatarUrl?.includes('lh3.google')),
    allAvatarsReal: true // Will be set based on checks
  };
};

// ============================================
// TEST 2: Enter Time & Visibility Time Diagnostic
// ============================================
window.testVisibilityTimes = function() {
  console.log('🧪 TEST 2: Enter Time & Visibility Time Diagnostic');
  console.log('='.repeat(60));
  
  const visibilityData = window.currentVisibilityDataUnfiltered;
  if (!visibilityData || !visibilityData.active) {
    console.error('❌ No visibility data found!');
    return;
  }
  
  const now = new Date();
  console.log(`📋 Current Time: ${now.toISOString()}`);
  console.log('');
  
  visibilityData.active.forEach((user, index) => {
    console.log(`👤 User ${index + 1}: ${user.name} (${user.email})`);
    console.log(`   enter_time: ${user.enterTime}`);
    console.log(`   last_seen: ${user.lastSeen}`);
    
    if (!user.enterTime) {
      console.error(`   ❌ enter_time is ${user.enterTime}! This will cause time to reset!`);
    } else {
      const enterTime = new Date(user.enterTime);
      const diffMs = now - enterTime;
      const diffSeconds = Math.floor(diffMs / 1000);
      const diffMinutes = Math.floor(diffSeconds / 60);
      const diffHours = Math.floor(diffMinutes / 60);
      
      console.log(`   Time on page:`);
      console.log(`      Seconds: ${diffSeconds}`);
      console.log(`      Minutes: ${diffMinutes}`);
      console.log(`      Hours: ${diffHours}`);
      
      // Check what the UI should display
      let expectedDisplay;
      if (diffSeconds < 60) {
        expectedDisplay = 'Now';
      } else if (diffMinutes < 60) {
        expectedDisplay = `Online for ${diffMinutes} minute${diffMinutes === 1 ? '' : 's'}`;
      } else if (diffHours < 24) {
        expectedDisplay = `Online for ${diffHours} hour${diffHours === 1 ? '' : 's'}`;
      } else {
        expectedDisplay = `Online for ${Math.floor(diffHours / 24)} days`;
      }
      
      console.log(`   Expected Display: "${expectedDisplay}"`);
      
      // Check actual DOM display
      const userItem = document.querySelector(`.user-item[data-user-id="${user.email}"]`);
      if (userItem) {
        const statusElement = userItem.querySelector('.item-status');
        const actualDisplay = statusElement?.textContent;
        console.log(`   Actual Display: "${actualDisplay}"`);
        
        if (actualDisplay !== expectedDisplay) {
          console.error(`   ❌ MISMATCH! Expected "${expectedDisplay}" but got "${actualDisplay}"`);
        } else {
          console.log(`   ✅ Display matches expected value`);
        }
      }
    }
    console.log('');
  });
  
  console.log('='.repeat(60));
  console.log('✅ TEST 2 COMPLETE');
};

// ============================================
// TEST 3: Backend API Response Diagnostic
// ============================================
window.testBackendAPIResponse = async function() {
  console.log('🧪 TEST 3: Backend API Response Diagnostic');
  console.log('='.repeat(60));
  
  try {
    // Get current page URL
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    const currentTab = tabs[0];
    const url = currentTab.url;
    
    console.log(`📋 Current URL: ${url}`);
    
    // Call the presence API
    console.log('🔍 Calling getPresenceByUrl API...');
    const response = await window.MetaLayerAPI.getPresenceByUrl(url, ['comm-001', 'comm-002']);
    
    console.log('📋 API Response:', response);
    
    if (response && response.active) {
      console.log(`📋 Active Users from API (${response.active.length}):`);
      response.active.forEach((user, index) => {
        const isReal = user.avatarUrl && (
          user.avatarUrl.includes('googleusercontent.com') ||
          user.avatarUrl.includes('lh3.google')
        );
        const isFake = user.avatarUrl && user.avatarUrl.includes('ui-avatars.com');
        
        console.log(`   User ${index + 1}: ${user.name} (${user.email})`);
        console.log(`      avatarUrl: ${user.avatarUrl}`);
        console.log(`      Is Real Google: ${isReal}` + (isReal ? ' ✓' : ' ❌'));
        console.log(`      Is Fake: ${isFake}` + (isFake ? ' ❌' : ' ✓'));
        console.log(`      enterTime: ${user.enterTime}`);
        console.log(`      lastSeen: ${user.lastSeen}`);
        console.log(`      auraColor: ${user.auraColor}`);
        
        if (!user.enterTime) {
          console.error(`      ❌ enter_time is ${user.enterTime}!`);
        }
        if (isFake) {
          console.error(`      ❌ Avatar is FAKE ui-avatars.com URL!`);
        }
      });
    }
    
    console.log('='.repeat(60));
    console.log('✅ TEST 3 COMPLETE');
    
    return response;
  } catch (error) {
    console.error('❌ TEST 3 FAILED:', error);
    throw error;
  }
};

// ============================================
// TEST 4: Wait and Watch Time Updates
// ============================================
window.testWaitAndWatchTimeUpdates = function(durationSeconds = 70) {
  console.log(`🧪 TEST 4: Wait and Watch Time Updates (${durationSeconds} seconds)`);
  console.log('='.repeat(60));
  console.log('⏱️  Starting time watch test...');
  console.log(`⏱️  Will log updates every 10 seconds for ${durationSeconds} seconds`);
  console.log('');
  
  let elapsed = 0;
  const interval = setInterval(() => {
    elapsed += 10;
    console.log(`⏱️  ${elapsed} seconds elapsed...`);
    
    // Log current visibility times
    const visibilityList = document.querySelectorAll('.user-item');
    visibilityList.forEach(item => {
      const userName = item.getAttribute('data-user-name');
      const statusElement = item.querySelector('.item-status');
      const display = statusElement?.textContent;
      console.log(`   ${userName}: "${display}"`);
    });
    console.log('');
    
    if (elapsed >= durationSeconds) {
      clearInterval(interval);
      console.log('='.repeat(60));
      console.log('✅ TEST 4 COMPLETE');
      console.log('');
      console.log('📊 EXPECTED RESULTS:');
      console.log('   - Users should transition from "Now" to "Online for 1 minute" after 60 seconds');
      console.log('   - Times should continue incrementing every 10 seconds');
      console.log('   - Times should NOT reset back to "Now"');
    }
  }, 10000);
  
  console.log(`⏱️  Timer started. Will run for ${durationSeconds} seconds...`);
  return interval;
};

// ============================================
// TEST 5: Full Diagnostic Suite
// ============================================
window.runFullDiagnostics = async function() {
  console.log('🚀 RUNNING FULL DIAGNOSTIC SUITE');
  console.log('='.repeat(60));
  console.log('');
  
  // Test 1: Avatar URLs
  console.log('Running Test 1: Avatar URLs...');
  const test1Results = window.testAvatarURLs();
  console.log('');
  
  // Wait 2 seconds
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Test 2: Visibility Times
  console.log('Running Test 2: Visibility Times...');
  window.testVisibilityTimes();
  console.log('');
  
  // Wait 2 seconds
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Test 3: Backend API
  console.log('Running Test 3: Backend API...');
  const test3Results = await window.testBackendAPIResponse();
  console.log('');
  
  console.log('='.repeat(60));
  console.log('✅ DIAGNOSTIC SUITE COMPLETE');
  console.log('');
  console.log('📊 SUMMARY:');
  console.log(`   Current User Avatar Real: ${test1Results.currentUserAvatarReal ? '✓' : '❌'}`);
  console.log(`   All Visibility Avatars Real: ${test1Results.visibilityDataUsersReal ? '✓' : '❌'}`);
  console.log(`   Backend API Returning Real Avatars: ${test3Results?.active?.every(u => u.avatarUrl?.includes('googleusercontent.com') || u.avatarUrl?.includes('lh3.google')) ? '✓' : '❌'}`);
  console.log(`   Backend API Returning enter_time: ${test3Results?.active?.every(u => u.enterTime) ? '✓' : '❌'}`);
  console.log('');
  console.log('💡 RECOMMENDATIONS:');
  console.log('   1. Check backend logs for "AVATAR_FIX" and "ENTER_TIME_BUG" errors');
  console.log('   2. Verify appUser table has entries for all authenticated users');
  console.log('   3. Verify ADD-ENTER-TIME-COLUMN.sql migration was run in Supabase');
  console.log('   4. Run Test 4 (testWaitAndWatchTimeUpdates) to verify times don\'t reset');
  
  return {
    test1: test1Results,
    test3: test3Results
  };
};

// Export test suite
console.log('✅ Comprehensive Test Suite Loaded!');
console.log('');
console.log('Available Functions:');
console.log('  - window.testAvatarURLs() - Test avatar URLs in current state');
console.log('  - window.testVisibilityTimes() - Test visibility time calculations');
console.log('  - window.testBackendAPIResponse() - Test backend API response');
console.log('  - window.testWaitAndWatchTimeUpdates(70) - Watch time updates for 70 seconds');
console.log('  - window.runFullDiagnostics() - Run all tests');
console.log('');
console.log('🎯 Quick Start: Run window.runFullDiagnostics() to test everything');


