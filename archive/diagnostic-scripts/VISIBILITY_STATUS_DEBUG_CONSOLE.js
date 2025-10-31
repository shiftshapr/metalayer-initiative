// ============================================================
// VISIBILITY STATUS DEBUG CODE - Run in browser console
// ============================================================
// Debug why status shows "offline" instead of "Last seen X ago"

(async function() {
  console.log('🔍 === VISIBILITY STATUS DEBUG ===\n');
  
  // 1. Check API response
  console.log('1️⃣ API Response Check:');
  const pageUrl = window.currentUrlData?.rawUrl || location.href;
  const presenceResp = await window.api.request(`/v1/presence/url?url=${encodeURIComponent(pageUrl)}`);
  console.log('   API Response:', presenceResp);
  
  if (presenceResp?.active && presenceResp.active.length > 0) {
    presenceResp.active.forEach((user, idx) => {
      console.log(`\n   User ${idx + 1}: ${user.name}`);
      console.log('     id:', user.id);
      console.log('     isActive:', user.isActive);
      console.log('     status:', user.status);
      console.log('     lastSeen:', user.lastSeen);
      console.log('     lastSeen type:', typeof user.lastSeen);
      console.log('     lastSeen value:', user.lastSeen);
      
      // Calculate time since last seen
      if (user.lastSeen) {
        const lastSeenDate = new Date(user.lastSeen);
        const now = new Date();
        const diffMs = now - lastSeenDate;
        const diffMinutes = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMinutes / 60);
        console.log('     lastSeen calculated:', `${diffMinutes} minutes ago (${diffHours} hours)`);
        console.log('     Within 24h:', diffMs < (24 * 60 * 60 * 1000) ? '✅ YES' : '❌ NO');
        console.log('     Within 30s:', diffMs < (30 * 1000) ? '✅ YES' : '❌ NO');
      }
    });
  } else {
    console.log('   ❌ No users returned');
  }
  
  // 2. Check visibility data
  console.log('\n2️⃣ Visibility Data Check:');
  console.log('   window.currentVisibilityDataUnfiltered:', window.currentVisibilityDataUnfiltered);
  
  if (window.currentVisibilityDataUnfiltered?.active) {
    window.currentVisibilityDataUnfiltered.active.forEach((avatar, idx) => {
      console.log(`\n   Avatar ${idx + 1}: ${avatar.name}`);
      console.log('     id:', avatar.id);
      console.log('     isActive:', avatar.isActive);
      console.log('     status:', avatar.status);
      console.log('     lastSeen:', avatar.lastSeen);
      console.log('     enterTime:', avatar.enterTime);
    });
  }
  
  // 3. Check UI state
  console.log('\n3️⃣ UI State Check:');
  const visibleTab = document.getElementById('canopi-visible');
  if (visibleTab) {
    const visibleUsers = visibleTab.querySelectorAll('.item');
    console.log('   Visible users in DOM:', visibleUsers.length);
    visibleUsers.forEach((user, idx) => {
      const name = user.querySelector('.user-name')?.textContent;
      const status = user.querySelector('.user-status')?.textContent;
      console.log(`   User ${idx + 1}: ${name} - Status displayed: "${status}"`);
    });
  }
  
  // 4. Test backend status calculation
  console.log('\n4️⃣ Backend Status Calculation Test:');
  if (presenceResp?.active && presenceResp.active.length > 0) {
    presenceResp.active.forEach((user) => {
      if (user.lastSeen) {
        const lastSeenDate = new Date(user.lastSeen);
        const now = new Date();
        const activeCutoffTime = new Date(now - (30 * 1000)); // 30 seconds
        const recentlySeenCutoffTime = new Date(now - (24 * 60 * 60 * 1000)); // 24 hours
        
        const isActive = user.isActive && lastSeenDate >= activeCutoffTime;
        const isRecentlySeen = lastSeenDate >= recentlySeenCutoffTime;
        
        let expectedStatus = 'offline';
        if (isActive) {
          expectedStatus = 'online';
        } else if (isRecentlySeen) {
          expectedStatus = 'recently_seen';
        }
        
        console.log(`   User: ${user.name}`);
        console.log('     Expected status:', expectedStatus);
        console.log('     Actual status:', user.status);
        console.log('     Match:', expectedStatus === user.status ? '✅' : '❌');
        console.log('     isActive:', isActive);
        console.log('     isRecentlySeen:', isRecentlySeen);
        console.log('     lastSeenDate:', lastSeenDate);
        console.log('     activeCutoffTime:', activeCutoffTime);
        console.log('     recentlySeenCutoffTime:', recentlySeenCutoffTime);
      }
    });
  }
  
  console.log('\n=== DEBUG END ===');
  
  return {
    apiResponse: presenceResp,
    visibilityData: window.currentVisibilityDataUnfiltered,
    debugComplete: true
  };
})();

