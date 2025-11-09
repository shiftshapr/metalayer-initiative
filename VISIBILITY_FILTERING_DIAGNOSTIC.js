// ROOT CAUSE DIAGNOSTIC: Visibility Filtering Issue
// Run this in the browser console to diagnose why current user appears in their own visibility list

(async function diagnoseVisibilityFiltering() {
  console.log('🔍 === VISIBILITY FILTERING DIAGNOSTIC ===');
  
  const currentUserId = window.currentUser?.id || window.currentUser?.user_id;
  const currentUserEmail = window.currentUser?.email;
  const currentUserName = window.currentUser?.name;
  
  console.log('\n--- Current User Context ---');
  console.log('window.currentUser:', window.currentUser);
  console.log('Current User ID:', currentUserId, `(Type: ${typeof currentUserId})`);
  console.log('Current User Email:', currentUserEmail);
  console.log('Current User Name:', currentUserName);
  
  console.log('\n--- Step 1: Check Visibility Data ---');
  const visibilityData = window.currentVisibilityData?.active || [];
  const unfilteredData = window.currentVisibilityDataUnfiltered?.active || [];
  
  console.log('Filtered visibility data (active):', visibilityData.length, 'users');
  visibilityData.forEach((user, idx) => {
    const userId = user.id || user.userId || user.user_id;
    const isCurrent = currentUserId && userId && String(userId) === String(currentUserId);
    console.log(`  ${idx + 1}. ${user.name || user.handle} (${userId}) ${isCurrent ? '❌ CURRENT USER - SHOULD BE FILTERED!' : '✅'}`);
  });
  
  console.log('\nUnfiltered visibility data (active):', unfilteredData.length, 'users');
  unfilteredData.forEach((user, idx) => {
    const userId = user.id || user.userId || user.user_id;
    const isCurrent = currentUserId && userId && String(userId) === String(currentUserId);
    console.log(`  ${idx + 1}. ${user.name || user.handle} (${userId}) ${isCurrent ? '⚠️ CURRENT USER' : ''}`);
  });
  
  console.log('\n--- Step 2: Test UUID Comparison Logic ---');
  unfilteredData.forEach((avatar) => {
    const avatarId = avatar.id || avatar.userId || avatar.user_id;
    const matchByUUID = currentUserId && avatarId && String(avatarId) === String(currentUserId);
    const matchByEmail = !currentUserId && avatar.email === currentUserEmail;
    const isCurrentUser = matchByUUID || matchByEmail;
    
    console.log(`\nAvatar: ${avatar.name || avatar.handle}`);
    console.log(`  Avatar ID: ${avatarId} (Type: ${typeof avatarId})`);
    console.log(`  Current User ID: ${currentUserId} (Type: ${typeof currentUserId})`);
    console.log(`  String comparison: "${String(avatarId)}" === "${String(currentUserId)}" = ${String(avatarId) === String(currentUserId)}`);
    console.log(`  matchByUUID: ${matchByUUID}`);
    console.log(`  matchByEmail: ${matchByEmail}`);
    console.log(`  isCurrentUser: ${isCurrentUser}`);
    if (isCurrentUser) {
      console.log(`  ❌ THIS USER SHOULD BE FILTERED OUT!`);
    } else {
      console.log(`  ✅ This user should appear in visibility list`);
    }
  });
  
  console.log('\n--- Step 3: Check UI State ---');
  const visibleTab = document.getElementById('canopi-visible');
  if (visibleTab) {
    const visibleItems = visibleTab.querySelectorAll('.item-list li');
    console.log('UI shows', visibleItems.length, 'visible users');
    visibleItems.forEach((item, idx) => {
      const nameEl = item.querySelector('.user-name');
      const name = nameEl ? nameEl.textContent.trim() : 'Unknown';
      console.log(`  ${idx + 1}. ${name}`);
      
      // Try to extract user ID from data attributes or text
      const dataId = item.dataset.userId || item.dataset.id;
      if (dataId) {
        const isCurrent = currentUserId && dataId && String(dataId) === String(currentUserId);
        if (isCurrent) {
          console.log(`     ❌ THIS IS THE CURRENT USER - SHOULD NOT BE VISIBLE!`);
        }
      }
    });
  } else {
    console.warn('⚠️ canopi-visible tab not found');
  }
  
  console.log('\n--- Step 4: Check API Response ---');
  try {
    const pageUrl = window.currentUrlData?.normalizedUrl || window.currentUrlData?.rawUrl || '';
    const apiResp = await window.api.request(`/v1/presence/url?url=${encodeURIComponent(pageUrl)}`, { method: 'GET' });
    const apiUsers = apiResp?.active || [];
    console.log('API returned', apiUsers.length, 'users');
    apiUsers.forEach((user, idx) => {
      const userId = user.id || user.userId || user.user_id;
      const isCurrent = currentUserId && userId && String(userId) === String(currentUserId);
      console.log(`  ${idx + 1}. ${user.name || user.handle} (${userId}) ${isCurrent ? '⚠️ CURRENT USER' : ''}`);
    });
    
    // Check if API response includes current user
    const currentUserInAPI = apiUsers.find(u => {
      const userId = u.id || u.userId || u.user_id;
      return currentUserId && userId && String(userId) === String(currentUserId);
    });
    if (currentUserInAPI) {
      console.log('\n⚠️ WARNING: API response includes current user - this is expected, but filtering should remove it');
    }
  } catch (error) {
    console.error('❌ Error fetching API response:', error);
  }
  
  console.log('\n--- Step 5: Manual Filter Test ---');
  const testAvatars = [
    { id: '550e8400-e29b-41d4-a716-446655440001', name: 'themetalayer', email: 'themetalayer@gmail.com' },
    { id: 'efce30c3-6788-4bf7-a52c-5e6652923964', name: 'daveroom', email: 'daveroom@gmail.com' },
    { id: 'c94c7594-3004-4790-bf95-cb50fe58e220', name: 'shambhavigoyal88', email: 'shambhavigoyal88@gmail.com' }
  ];
  
  const filtered = testAvatars.filter(avatar => {
    const avatarId = avatar.id || avatar.userId || avatar.user_id;
    const isCurrentUser = (currentUserId && avatarId && String(avatarId) === String(currentUserId)) ||
                        (!currentUserId && avatar.email === currentUserEmail);
    return !isCurrentUser;
  });
  
  console.log('Test filter result:');
  console.log('  Input:', testAvatars.length, 'users');
  console.log('  Output:', filtered.length, 'users');
  console.log('  Filtered out:', testAvatars.length - filtered.length, 'user(s)');
  filtered.forEach((user, idx) => {
    console.log(`    ${idx + 1}. ${user.name} (${user.id})`);
  });
  
  console.log('\n--- Summary ---');
  const currentUserInVisible = visibilityData.some(u => {
    const userId = u.id || u.userId || u.user_id;
    return currentUserId && userId && String(userId) === String(currentUserId);
  });
  
  if (currentUserInVisible) {
    console.error('❌ ISSUE FOUND: Current user IS in filtered visibility list!');
    console.error('   This means the filtering logic is not working correctly.');
    console.error('   Check: UUID format matching, type conversion, or window.currentUser.id being set incorrectly');
  } else {
    console.log('✅ Current user is correctly filtered out from visibility data');
    console.log('   But if UI still shows them, the problem is in rendering logic');
  }
  
  console.log('\n🔍 === DIAGNOSTIC END ===');
})();

