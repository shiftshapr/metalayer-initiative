// ============================================================
// VISIBILITY REAL-TIME UPDATE DEBUG - Run in browser console
// ============================================================
// Debug why real-time visibility updates aren't working

(async function() {
  console.log('🔍 === VISIBILITY REAL-TIME DEBUG ===\n');
  
  // 1. Check real-time subscription status
  console.log('1️⃣ Real-time Subscription Status:');
  console.log('   window.handlePresenceChange:', typeof window.handlePresenceChange);
  console.log('   window.refreshVisibilityAvatars:', typeof window.refreshVisibilityAvatars);
  console.log('   window.currentUrlData:', window.currentUrlData);
  console.log('   Current page ID:', window.currentUrlData?.pageId);
  
  // 2. Check visibility data
  console.log('\n2️⃣ Current Visibility Data:');
  console.log('   window.currentVisibilityData:', window.currentVisibilityData);
  console.log('   Active users:', window.currentVisibilityData?.active?.length || 0);
  
  if (window.currentVisibilityData?.active) {
    window.currentVisibilityData.active.forEach((avatar, idx) => {
      const status = avatar.isActive && avatar.enterTime ? 
        (() => {
          const now = new Date();
          const enterTime = new Date(avatar.enterTime);
          const diffMs = now - enterTime;
          const diffMinutes = Math.floor(diffMs / 60000);
          if (diffMinutes < 1) return 'Now';
          return `Online for ${diffMinutes} min${diffMinutes === 1 ? '' : 's'}`;
        })() : 
        (avatar.lastSeen ? `Last seen ${Math.floor((Date.now() - new Date(avatar.lastSeen).getTime()) / 60000)} mins ago` : 'offline');
      console.log(`   User ${idx + 1}: ${avatar.name} - ${status}`);
      console.log(`     enterTime: ${avatar.enterTime}`);
      console.log(`     lastSeen: ${avatar.lastSeen}`);
      console.log(`     isActive: ${avatar.isActive}`);
      console.log(`     pageId: ${avatar.pageId}`);
    });
  }
  
  // 3. Check status refresh interval
  console.log('\n3️⃣ Status Refresh Interval:');
  console.log('   visibilityStatusRefreshInterval:', window.visibilityStatusRefreshInterval ? 'ACTIVE' : 'NOT SET');
  if (window.visibilityStatusRefreshInterval) {
    console.log('   ✅ Periodic refresh is active');
  } else {
    console.log('   ❌ Periodic refresh NOT active - status will stay on "Now"');
  }
  
  // 4. Test manual refresh
  console.log('\n4️⃣ Testing Manual Refresh:');
  if (typeof window.refreshVisibilityAvatars === 'function') {
    console.log('   Attempting manual refresh...');
    try {
      await window.refreshVisibilityAvatars();
      console.log('   ✅ Manual refresh completed');
    } catch (error) {
      console.error('   ❌ Manual refresh failed:', error);
    }
  } else {
    console.log('   ❌ refreshVisibilityAvatars not available');
  }
  
  // 5. Check Supabase real-time subscription
  console.log('\n5️⃣ Supabase Real-time Subscription:');
  if (window.supabaseRealtimeClient) {
    console.log('   supabaseRealtimeClient exists:', true);
    console.log('   currentPage:', window.supabaseRealtimeClient.currentPage);
    console.log('   currentUser:', window.supabaseRealtimeClient.currentUser);
  } else {
    console.log('   ❌ supabaseRealtimeClient not available');
  }
  
  // 6. Simulate presence change (for testing)
  console.log('\n6️⃣ Simulating Presence Change:');
  if (typeof window.handlePresenceChange === 'function') {
    const testPayload = {
      eventType: 'UPDATE',
      new: {
        user_id: window.currentUser?.id,
        page_id: window.currentUrlData?.pageId,
        is_active: true,
        last_seen: new Date().toISOString()
      },
      old: {
        user_id: window.currentUser?.id,
        page_id: 'google_com_', // Old page
        is_active: true
      }
    };
    console.log('   Test payload:', testPayload);
    console.log('   Calling handlePresenceChange...');
    await window.handlePresenceChange(testPayload);
    console.log('   ✅ handlePresenceChange called');
  } else {
    console.log('   ❌ handlePresenceChange not available');
  }
  
  console.log('\n=== DEBUG END ===');
  
  return {
    handlePresenceChange: typeof window.handlePresenceChange === 'function',
    refreshVisibilityAvatars: typeof window.refreshVisibilityAvatars === 'function',
    statusRefreshInterval: window.visibilityStatusRefreshInterval ? 'ACTIVE' : 'NOT SET',
    currentVisibilityData: window.currentVisibilityData,
    debugComplete: true
  };
})();

