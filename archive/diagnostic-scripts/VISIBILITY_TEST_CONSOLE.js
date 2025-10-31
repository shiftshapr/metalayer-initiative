// ============================================================
// VISIBILITY TEST CODE - Run after fixes to verify
// ============================================================
// Test that both profiles can see each other and status displays correctly

(async function() {
  console.log('🧪 === VISIBILITY FIX TEST ===\n');
  
  let testResults = {
    apiReturnsUsers: false,
    bothUsersVisible: false,
    statusDisplaysCorrectly: false,
    currentUserFiltered: false,
    issues: []
  };
  
  // 1. Test: API should return users
  console.log('1️⃣ Testing: API returns users from backend');
  try {
    const pageUrl = window.currentUrlData?.rawUrl || location.href;
    const presenceResp = await window.api.request(`/v1/presence/url?url=${encodeURIComponent(pageUrl)}`);
    const userCount = presenceResp?.active?.length || 0;
    console.log(`   Users returned: ${userCount}`);
    
    if (userCount > 0) {
      testResults.apiReturnsUsers = true;
      console.log('   ✅ PASS: API returns users');
      
      // Check status fields
      presenceResp.active.forEach((user, idx) => {
        console.log(`   User ${idx + 1}: ${user.name} - isActive: ${user.isActive}, status: ${user.status}, lastSeen: ${user.lastSeen}`);
      });
    } else {
      testResults.issues.push('API returns 0 users - fix not working');
      console.log('   ❌ FAIL: API returns 0 users');
    }
  } catch (error) {
    testResults.issues.push(`API call failed: ${error.message}`);
    console.error('   ❌ FAIL: API call error:', error);
  }
  
  // 2. Test: Both users should be visible (excluding current user)
  console.log('\n2️⃣ Testing: Visibility list shows other users');
  const visibleTab = document.getElementById('canopi-visible');
  if (visibleTab) {
    const visibleCount = parseInt(visibleTab.querySelector('.visible-count')?.textContent?.replace('visible', '').trim()) || 0;
    const visibleUsers = visibleTab.querySelectorAll('.item');
    console.log(`   Visible count: ${visibleCount}, DOM users: ${visibleUsers.length}`);
    
    if (visibleCount > 0 && visibleUsers.length > 0) {
      testResults.bothUsersVisible = true;
      console.log('   ✅ PASS: Other users are visible');
      visibleUsers.forEach((user, idx) => {
        const name = user.querySelector('.user-name')?.textContent;
        const status = user.querySelector('.user-status')?.textContent;
        console.log(`   User ${idx + 1}: ${name} (${status})`);
      });
    } else {
      testResults.issues.push('No users visible in UI');
      console.log('   ❌ FAIL: No users visible');
    }
  } else {
    testResults.issues.push('Visible tab element not found');
    console.log('   ❌ FAIL: Visible tab not found');
  }
  
  // 3. Test: Status should display correctly (not just "offline")
  console.log('\n3️⃣ Testing: Status displays correctly');
  if (visibleTab) {
    const visibleUsers = visibleTab.querySelectorAll('.item');
    let allStatusesCorrect = true;
    
    visibleUsers.forEach((user, idx) => {
      const status = user.querySelector('.user-status')?.textContent?.toLowerCase();
      const isOfflineOnly = status === 'offline';
      const hasLastSeen = status?.includes('last seen') || status?.includes('online');
      
      if (isOfflineOnly && !hasLastSeen) {
        allStatusesCorrect = false;
        const name = user.querySelector('.user-name')?.textContent;
        console.log(`   ⚠️ User ${name} shows only "offline" (expected "Last seen X ago" or "Online for X")`);
      }
    });
    
    if (allStatusesCorrect && visibleUsers.length > 0) {
      testResults.statusDisplaysCorrectly = true;
      console.log('   ✅ PASS: Status displays correctly');
    } else if (visibleUsers.length === 0) {
      console.log('   ⚠️ SKIP: No users to check status');
    } else {
      testResults.issues.push('Some users show incorrect status');
      console.log('   ❌ FAIL: Some statuses incorrect');
    }
  }
  
  // 4. Test: Current user should be filtered out
  console.log('\n4️⃣ Testing: Current user is filtered out');
  const currentUserId = window.currentUser?.id || window.currentUser?.user_id;
  const visibleTab2 = document.getElementById('canopi-visible');
  if (visibleTab2) {
    const visibleUsers = visibleTab2.querySelectorAll('.item');
    let currentUserFound = false;
    
    visibleUsers.forEach((user) => {
      // Check if any visible user matches current user
      // This is approximate - actual filtering uses UUID
      const name = user.querySelector('.user-name')?.textContent;
      if (name === window.currentUser?.name || name === window.currentUser?.email) {
        currentUserFound = true;
      }
    });
    
    if (!currentUserFound) {
      testResults.currentUserFiltered = true;
      console.log('   ✅ PASS: Current user is filtered out');
    } else {
      testResults.issues.push('Current user appears in visibility list');
      console.log('   ❌ FAIL: Current user appears in list');
    }
  }
  
  // Summary
  console.log('\n📊 === TEST SUMMARY ===');
  console.log(`API Returns Users: ${testResults.apiReturnsUsers ? '✅' : '❌'}`);
  console.log(`Both Users Visible: ${testResults.bothUsersVisible ? '✅' : '❌'}`);
  console.log(`Status Displays Correctly: ${testResults.statusDisplaysCorrectly ? '✅' : '❌'}`);
  console.log(`Current User Filtered: ${testResults.currentUserFiltered ? '✅' : '❌'}`);
  
  if (testResults.issues.length > 0) {
    console.log('\n⚠️ Issues found:');
    testResults.issues.forEach((issue, idx) => {
      console.log(`   ${idx + 1}. ${issue}`);
    });
  } else {
    console.log('\n✅ All tests passed!');
  }
  
  return testResults;
})();

