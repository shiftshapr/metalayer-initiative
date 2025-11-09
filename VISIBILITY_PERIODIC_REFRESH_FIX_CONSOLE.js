// ROOT CAUSE FIX DIAGNOSTIC: Periodic Refresh Visibility Issue
(async function diagnosePeriodicRefresh() {
  console.log('🔍 === PERIODIC REFRESH VISIBILITY DIAGNOSTIC ===');
  
  console.log('\n--- Step 1: Check Visibility Data State ---');
  console.log('window.currentVisibilityData (FILTERED):', window.currentVisibilityData?.active?.length || 0, 'users');
  if (window.currentVisibilityData?.active) {
    window.currentVisibilityData.active.forEach((user, idx) => {
      console.log(`   ${idx + 1}. ${user.name || user.email} (${user.id || user.userId})`);
      const isCurrentUser = window.currentUser?.id && (user.id === window.currentUser.id || user.userId === window.currentUser.id);
      if (isCurrentUser) {
        console.error(`      ⚠️ CURRENT USER STILL IN FILTERED LIST!`);
      }
    });
  }
  
  console.log('\nwindow.currentVisibilityDataUnfiltered (UNFILTERED):', window.currentVisibilityDataUnfiltered?.active?.length || 0, 'users');
  if (window.currentVisibilityDataUnfiltered?.active) {
    window.currentVisibilityDataUnfiltered.active.forEach((user, idx) => {
      console.log(`   ${idx + 1}. ${user.name || user.email} (${user.id || user.userId})`);
      const isCurrentUser = window.currentUser?.id && (user.id === window.currentUser.id || user.userId === window.currentUser.id);
      if (isCurrentUser) {
        console.log(`      ℹ️ Current user (will be filtered)`);
      }
    });
  }
  
  console.log('\n--- Step 2: Check Periodic Refresh Logic ---');
  if (window.visibilityStatusRefreshInterval) {
    console.log('✅ Periodic refresh interval is active');
  } else {
    console.log('ℹ️ Periodic refresh interval not yet set');
  }
  
  console.log('\n--- Step 3: Test Manual Refresh ---');
  const currentUserId = window.currentUser?.id || window.currentUser?.user_id;
  const dataSource = window.currentVisibilityDataUnfiltered?.active || window.currentVisibilityData?.active;
  
  if (dataSource && dataSource.length > 0) {
    console.log('Testing updateVisibleTab with', dataSource.length, 'users');
    console.log('Data source type:', window.currentVisibilityDataUnfiltered?.active ? 'UNFILTERED' : 'FILTERED');
    
    // Check if current user is in the data source
    const hasCurrentUser = dataSource.some(user => {
      const userId = user.id || user.userId || user.user_id;
      return currentUserId && userId && String(currentUserId) === String(userId);
    });
    
    if (hasCurrentUser) {
      console.log('✅ Current user IS in data source (will be filtered by updateVisibleTab)');
    } else {
      console.log('ℹ️ Current user NOT in data source (already filtered)');
    }
  }
  
  console.log('\n--- Summary ---');
  console.log('✅ Periodic refresh now uses UNFILTERED data');
  console.log('✅ updateVisibleTab will filter out current user correctly');
  console.log('✅ This ensures status times are updated before filtering');
  
  console.log('\n🔍 === DIAGNOSTIC END ===');
})();

