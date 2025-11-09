// VISIBILITY STATUS COMPREHENSIVE DIAGNOSTIC
// Run this in browser console to diagnose visibility status issues

(async function() {
  console.log('🔍 === VISIBILITY STATUS DIAGNOSTIC START ===');
  
  const currentUrlData = window.currentUrlData || {};
  const pageId = currentUrlData.pageId || 'google_com_';
  const pageUrl = currentUrlData.normalizedUrl || 'google.com/';
  const currentUserId = window.currentUser?.id || window.currentUser?.user_id;
  const currentUserEmail = window.currentUser?.email;
  
  console.log('\n--- Current Context ---');
  console.log('Page ID:', pageId);
  console.log('Page URL:', pageUrl);
  console.log('Current User ID:', currentUserId);
  console.log('Current User Email:', currentUserEmail);
  
  console.log('\n--- Step 1: Check API Response ---');
  try {
    const apiResponse = await window.api.request(`/v1/presence/url?url=${encodeURIComponent(pageUrl)}`, { method: 'GET' });
    console.log('✅ API Response:', apiResponse);
    console.log('✅ Users returned:', apiResponse?.active?.length || 0);
    
    if (apiResponse?.active && apiResponse.active.length > 0) {
      console.log('\n--- User Status Details ---');
      apiResponse.active.forEach((user, idx) => {
        const lastSeen = user.lastSeen ? new Date(user.lastSeen) : null;
        const enterTime = user.enterTime ? new Date(user.enterTime) : null;
        const now = new Date();
        
        const lastSeenDiffMs = lastSeen ? (now.getTime() - lastSeen.getTime()) : null;
        const lastSeenMinutes = lastSeenDiffMs ? Math.floor(lastSeenDiffMs / 60000) : null;
        const lastSeenHours = lastSeenDiffMs ? Math.floor(lastSeenDiffMs / (60 * 60 * 1000)) : null;
        
        const enterTimeDiffMs = enterTime ? (now.getTime() - enterTime.getTime()) : null;
        const enterTimeMinutes = enterTimeDiffMs ? Math.floor(enterTimeDiffMs / 60000) : null;
        const enterTimeHours = enterTimeDiffMs ? Math.floor(enterTimeDiffMs / (60 * 60 * 1000)) : null;
        const enterTimeDays = enterTimeDiffMs ? Math.floor(enterTimeDiffMs / (24 * 60 * 60 * 1000)) : null;
        
        const isOnSamePage = user.pageId === pageId;
        
        console.log(`\nUser ${idx + 1}: ${user.name} (${user.id})`);
        console.log(`  Status: ${user.status || 'undefined'}`);
        console.log(`  isActive: ${user.isActive}`);
        console.log(`  pageId: ${user.pageId} (matches current: ${isOnSamePage ? '✅ YES' : '❌ NO'})`);
        console.log(`  lastSeen: ${user.lastSeen}`);
        console.log(`  Last seen: ${lastSeenMinutes} minutes ago (${lastSeenHours} hours)`);
        console.log(`  enterTime: ${user.enterTime}`);
        console.log(`  Enter time: ${enterTimeMinutes} minutes ago (${enterTimeDays} days)`);
        console.log(`  Expected display:`);
        if (user.isActive && isOnSamePage && enterTime) {
          if (enterTimeMinutes < 1) {
            console.log(`    "Now" (should be)`);
          } else if (enterTimeMinutes < 60) {
            console.log(`    "Online for ${enterTimeMinutes} mins"`);
          } else if (enterTimeHours < 24) {
            console.log(`    "Online for ${enterTimeHours} hours"`);
          } else {
            console.log(`    "Online for ${enterTimeDays} days" ⚠️ (likely stale enterTime)`);
          }
        } else if (user.status === 'recently_seen' && lastSeen) {
          if (lastSeenMinutes < 60) {
            console.log(`    "Last seen ${lastSeenMinutes} mins ago"`);
          } else if (lastSeenHours < 24) {
            console.log(`    "Last seen ${lastSeenHours} hours ago"`);
          } else {
            console.log(`    "Last seen ${Math.floor(lastSeenHours / 24)} days ago"`);
          }
        } else {
          console.log(`    "offline"`);
        }
        
        // Check for issues
        if (isOnSamePage && !user.isActive && lastSeenMinutes > 30) {
          console.log(`  ⚠️ ISSUE: User on same page but inactive and last_seen > 30 mins old`);
          console.log(`     This suggests heartbeat is not working or EXIT was sent incorrectly`);
        }
        if (user.isActive && enterTimeDays > 0) {
          console.log(`  ⚠️ ISSUE: Active user but enterTime is ${enterTimeDays} days old`);
          console.log(`     This suggests enter_time is not being reset on ENTER events`);
        }
      });
    }
  } catch (error) {
    console.error('❌ API Call failed:', error);
  }
  
  console.log('\n--- Step 2: Check Heartbeat Status ---');
  if (window.presenceHeartbeatInterval) {
    console.log('✅ Heartbeat interval is active');
    console.log('   Interval ID:', window.presenceHeartbeatInterval);
  } else {
    console.warn('⚠️ Heartbeat interval is NOT active');
    console.warn('   This means last_seen will not update while user is on page');
  }
  
  console.log('\n--- Step 3: Check Current Page State ---');
  if (window.supabaseRealtimeClient) {
    console.log('✅ SupabaseRealtimeClient available');
    console.log('   Current Page:', window.supabaseRealtimeClient.currentPage);
    console.log('   Current User:', window.supabaseRealtimeClient.currentUser);
  } else {
    console.warn('⚠️ SupabaseRealtimeClient not available');
  }
  
  console.log('\n--- Step 4: Test Heartbeat Manually ---');
  console.log('To manually trigger a heartbeat update, run:');
  console.log('  window.sendPresenceEvent("AVAILABILITY", "AVAILABLE")');
  
  console.log('\n🔍 === VISIBILITY STATUS DIAGNOSTIC END ===');
  
  return {
    pageId,
    pageUrl,
    currentUserId,
    heartbeatActive: !!window.presenceHeartbeatInterval,
    timestamp: new Date().toISOString()
  };
})();

