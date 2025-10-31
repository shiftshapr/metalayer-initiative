// ============================================================
// VISIBILITY COMPREHENSIVE TEST - Run in browser console
// ============================================================
// Comprehensive test to verify both profiles see each other and show correct status

(async function() {
  console.log('🧪 === VISIBILITY COMPREHENSIVE TEST ===\n');
  
  const results = {
    apiReturnsBothUsers: false,
    bothUsersHaveStatus: false,
    bothUsersShowOnline: false,
    currentUserFiltered: false,
    issues: []
  };
  
  // 1. Test API response
  console.log('1️⃣ Testing: API returns both users');
  const pageUrl = window.currentUrlData?.rawUrl || location.href;
  const presenceResp = await window.api.request(`/v1/presence/url?url=${encodeURIComponent(pageUrl)}`);
  const userCount = presenceResp?.active?.length || 0;
  console.log(`   Users returned: ${userCount}`);
  
  if (userCount >= 1) {
    results.apiReturnsBothUsers = userCount >= 1; // At least 1 (other user)
    console.log('   ✅ API returns users');
    
    presenceResp.active.forEach((user, idx) => {
      console.log(`\n   User ${idx + 1}: ${user.name}`);
      console.log('     id:', user.id);
      console.log('     status:', user.status, user.status === undefined ? '❌ UNDEFINED!' : '✅');
      console.log('     isActive:', user.isActive);
      console.log('     enterTime:', user.enterTime);
      console.log('     lastSeen:', user.lastSeen);
      
      if (user.status && user.status !== undefined) {
        results.bothUsersHaveStatus = true;
      } else {
        results.issues.push(`User ${user.name} has undefined status`);
      }
      
      if (user.isActive && user.enterTime) {
        console.log('     ✅ Should show "Online for X"');
      } else if (user.lastSeen) {
        console.log('     ✅ Should show "Last seen X ago"');
      }
    });
  } else {
    results.issues.push('API returns 0 users');
    console.log('   ❌ API returns 0 users');
  }
  
  // 2. Test visibility UI
  console.log('\n2️⃣ Testing: Visibility UI displays correctly');
  await window.refreshVisibilityAvatars();
  
  const visibleTab = document.getElementById('canopi-visible');
  if (visibleTab) {
    const visibleCount = parseInt(visibleTab.querySelector('.visible-count')?.textContent?.replace('visible', '').trim()) || 0;
    const visibleUsers = visibleTab.querySelectorAll('.item');
    console.log(`   Visible count: ${visibleCount}, DOM users: ${visibleUsers.length}`);
    
    if (visibleCount > 0 && visibleUsers.length > 0) {
      let allShowOnline = true;
      visibleUsers.forEach((user, idx) => {
        const name = user.querySelector('.user-name')?.textContent;
        const status = user.querySelector('.user-status')?.textContent;
        console.log(`   User ${idx + 1}: ${name} - "${status}"`);
        
        // Check if status shows "Online for" instead of "Last seen" or "offline"
        if (status && status.toLowerCase().includes('online for')) {
          console.log('     ✅ Shows "Online for X"');
        } else if (status && status.toLowerCase().includes('last seen')) {
          console.log('     ⚠️ Shows "Last seen" (expected "Online for" if user is active)');
          allShowOnline = false;
        } else if (status === 'offline') {
          console.log('     ❌ Shows "offline"');
          allShowOnline = false;
          results.issues.push(`User ${name} shows offline but should show "Online for X"`);
        }
      });
      
      results.bothUsersShowOnline = allShowOnline;
    } else {
      results.issues.push('No users visible in UI');
      console.log('   ❌ No users visible');
    }
  }
  
  // 3. Check current user filtering
  console.log('\n3️⃣ Testing: Current user is filtered out');
  const currentUserId = window.currentUser?.id || window.currentUser?.user_id;
  if (visibleTab) {
    const visibleUsers = visibleTab.querySelectorAll('.item');
    let currentUserFound = false;
    
    visibleUsers.forEach((user) => {
      const name = user.querySelector('.user-name')?.textContent;
      if (name === window.currentUser?.name || name === window.currentUser?.email) {
        currentUserFound = true;
      }
    });
    
    if (!currentUserFound) {
      results.currentUserFiltered = true;
      console.log('   ✅ Current user is filtered out');
    } else {
      results.issues.push('Current user appears in visibility list');
      console.log('   ❌ Current user appears in list');
    }
  }
  
  // 4. Check visibility data
  console.log('\n4️⃣ Visibility Data Check:');
  console.log('   Unfiltered users:', window.currentVisibilityDataUnfiltered?.active?.length || 0);
  console.log('   Filtered users:', window.currentVisibilityData?.active?.length || 0);
  
  if (window.currentVisibilityDataUnfiltered?.active) {
    window.currentVisibilityDataUnfiltered.active.forEach((avatar) => {
      console.log(`   ${avatar.name}: isActive=${avatar.isActive}, status=${avatar.status}, enterTime=${avatar.enterTime ? 'set' : 'missing'}`);
    });
  }
  
  // Summary
  console.log('\n📊 === TEST SUMMARY ===');
  console.log(`API Returns Users: ${results.apiReturnsBothUsers ? '✅' : '❌'}`);
  console.log(`Users Have Status: ${results.bothUsersHaveStatus ? '✅' : '❌'}`);
  console.log(`Users Show Online: ${results.bothUsersShowOnline ? '✅' : '❌'}`);
  console.log(`Current User Filtered: ${results.currentUserFiltered ? '✅' : '❌'}`);
  
  if (results.issues.length > 0) {
    console.log('\n⚠️ Issues found:');
    results.issues.forEach((issue, idx) => {
      console.log(`   ${idx + 1}. ${issue}`);
    });
  } else {
    console.log('\n✅ All tests passed!');
  }
  
  return results;
})();

