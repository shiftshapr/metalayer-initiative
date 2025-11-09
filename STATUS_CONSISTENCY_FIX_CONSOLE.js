// ROOT CAUSE FIX DIAGNOSTIC: Status Display Consistency Issue
(async function diagnoseStatusConsistency() {
  console.log('🔍 === STATUS CONSISTENCY DIAGNOSTIC ===');
  
  const targetUserId = 'c94c7594-3004-4790-bf95-cb50fe58e220'; // shambhavigoyal88
  const currentUserId = window.currentUser?.id || window.currentUser?.user_id;
  const currentPageId = window.currentUrlData?.pageId;
  
  console.log('\n--- Step 1: Check Backend API Response ---');
  try {
    const apiResp = await window.api.request(`/v1/presence/url?url=${encodeURIComponent(window.currentUrlData?.normalizedUrl || window.currentUrlData?.rawUrl || '')}`, {
      method: 'GET'
    });
    
    const targetUser = apiResp?.active?.find(u => (u.id || u.userId) === targetUserId);
    if (targetUser) {
      console.log('Target user from API:', {
        id: targetUser.id || targetUser.userId,
        name: targetUser.name || targetUser.handle,
        isActive: targetUser.isActive || targetUser.is_active,
        status: targetUser.status,
        enterTime: targetUser.enterTime || targetUser.enter_time,
        lastSeen: targetUser.lastSeen || targetUser.last_seen
      });
      
      console.log('\n--- Step 2: Check Visibility Data ---');
      if (window.currentVisibilityDataUnfiltered?.active) {
        const filteredUser = window.currentVisibilityDataUnfiltered.active.find(u => (u.id || u.userId) === targetUserId);
        if (filteredUser) {
          console.log('Target user in visibility data:', {
            id: filteredUser.id || filteredUser.userId,
            name: filteredUser.name || filteredUser.handle,
            isActive: filteredUser.isActive,
            status: filteredUser.status,
            enterTime: filteredUser.enterTime,
            lastSeen: filteredUser.lastSeen
          });
        }
      }
      
      console.log('\n--- Step 3: Check UI Display ---');
      const visibleItems = document.querySelectorAll('#canopi-visible .item-list .item');
      visibleItems.forEach((item, idx) => {
        const userId = item.getAttribute('data-user-id');
        const name = item.querySelector('.user-name')?.textContent || 'Unknown';
        const status = item.querySelector('.user-status')?.textContent || 'Unknown';
        
        if (userId === targetUserId) {
          console.log(`Found target user in UI (item ${idx + 1}):`);
          console.log(`   Name: ${name}`);
          console.log(`   Status: ${status}`);
          console.log(`   Data attributes: userId=${userId}`);
        }
      });
      
      console.log('\n--- Step 4: Status Logic Analysis ---');
      const now = new Date();
      const lastSeenDate = targetUser.lastSeen || targetUser.last_seen ? new Date(targetUser.lastSeen || targetUser.last_seen) : null;
      const enterTimeDate = targetUser.enterTime || targetUser.enter_time ? new Date(targetUser.enterTime || targetUser.enter_time) : null;
      
      if (lastSeenDate) {
        const hoursSinceLastSeen = (now - lastSeenDate) / (1000 * 60 * 60);
        console.log(`Hours since last_seen: ${hoursSinceLastSeen.toFixed(2)}`);
        console.log(`Is within 24h: ${hoursSinceLastSeen < 24}`);
      }
      
      if (enterTimeDate) {
        const hoursSinceEnter = (now - enterTimeDate) / (1000 * 60 * 60);
        console.log(`Hours since enter_time: ${hoursSinceEnter.toFixed(2)}`);
      }
      
      console.log('\nExpected behavior:');
      console.log('- If isActive=true OR status="online": Show "Online for X" (using enterTime)');
      console.log('- If status="recently_seen" OR (isActive=false AND lastSeen exists): Show "Last seen X ago"');
      console.log('- Else: Show "offline"');
      
      console.log('\n--- Summary ---');
      if (targetUser.status === 'offline' && lastSeenDate && (now - lastSeenDate) / (1000 * 60 * 60) < 24) {
        console.warn('⚠️ ISSUE: Backend returned status="offline" but user was seen within 24h');
        console.warn('   Backend should return status="recently_seen" for users within 24h');
        console.warn('   Frontend will handle this gracefully by checking lastSeen');
      } else if (targetUser.status === 'recently_seen') {
        console.log('✅ Backend correctly returns status="recently_seen"');
      } else if (targetUser.status === 'online') {
        console.log('✅ Backend correctly returns status="online"');
      }
      
    } else {
      console.warn('⚠️ Target user not found in API response');
    }
  } catch (error) {
    console.error('❌ Error checking status:', error);
  }
  
  console.log('\n🔍 === DIAGNOSTIC END ===');
})();

