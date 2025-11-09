// Quick Status Display Diagnostic - Run in Browser Console
(async function quickStatusDebug() {
  console.log('🔍 Quick Status Display Debug:');
  
  const targetUserId = 'c94c7594-3004-4790-bf95-cb50fe58e220'; // shambhavigoyal88
  
  // Check API
  try {
    const apiResp = await window.api.request(`/v1/presence/url?url=${encodeURIComponent(window.currentUrlData?.normalizedUrl || 'google.com/')}`, {
      method: 'GET'
    });
    
    const user = apiResp?.active?.find(u => (u.id || u.userId) === targetUserId);
    if (user) {
      console.log('\nBackend API Data:');
      console.log('  isActive:', user.isActive || user.is_active);
      console.log('  status:', user.status);
      console.log('  enterTime:', user.enterTime || user.enter_time);
      console.log('  lastSeen:', user.lastSeen || user.last_seen);
      
      const now = new Date();
      const lastSeen = user.lastSeen || user.last_seen ? new Date(user.lastSeen || user.last_seen) : null;
      if (lastSeen) {
        const hoursAgo = (now - lastSeen) / (1000 * 60 * 60);
        console.log('  Hours since lastSeen:', hoursAgo.toFixed(2));
      }
    }
  } catch (error) {
    console.error('API Error:', error);
  }
  
  // Check Visibility Data
  if (window.currentVisibilityDataUnfiltered?.active) {
    const visibilityUser = window.currentVisibilityDataUnfiltered.active.find(u => (u.id || u.userId) === targetUserId);
    if (visibilityUser) {
      console.log('\nVisibility Data:');
      console.log('  isActive:', visibilityUser.isActive);
      console.log('  status:', visibilityUser.status);
      console.log('  enterTime:', visibilityUser.enterTime);
      console.log('  lastSeen:', visibilityUser.lastSeen);
    }
  }
  
  // Check UI
  const uiItems = document.querySelectorAll('#canopi-visible .item[data-user-id="' + targetUserId + '"]');
  if (uiItems.length > 0) {
    console.log('\nUI Display:');
    uiItems.forEach((item, idx) => {
      const name = item.querySelector('.user-name')?.textContent;
      const status = item.querySelector('.user-status')?.textContent;
      console.log(`  Item ${idx + 1}: ${name} - ${status}`);
    });
  } else {
    console.log('\nUI: User not found in visible list (may be filtered)');
  }
  
  console.log('\nExpected:');
  console.log('  - If status="online" and enterTime exists: "Online for X"');
  console.log('  - If status="recently_seen" or (isActive=false and lastSeen exists): "Last seen X ago"');
  console.log('  - Else: "offline"');
})();

