// VISIBILITY ROOT CAUSE DIAGNOSTIC (NO HEARTBEAT)
// Run this in browser console to diagnose visibility status issues
// Copy-paste entire block into console

(async function() {
  console.log('🔍 === VISIBILITY ROOT CAUSE DIAGNOSTIC ===');
  
  const currentUrlData = window.currentUrlData || {};
  const pageId = currentUrlData.pageId || 'google_com_';
  const pageUrl = currentUrlData.normalizedUrl || 'google.com/';
  const currentUserId = window.currentUser?.id || window.currentUser?.user_id;
  const currentUserEmail = window.currentUser?.email;
  
  console.log('\n--- 1. CURRENT CONTEXT ---');
  console.log('Page ID:', pageId);
  console.log('Page URL:', pageUrl);
  console.log('Current User ID:', currentUserId);
  console.log('Current User Email:', currentUserEmail);
  
  console.log('\n--- 2. API RESPONSE (/v1/presence/url) ---');
  let apiUsers = [];
  try {
    const apiResponse = await window.api.request(`/v1/presence/url?url=${encodeURIComponent(pageUrl)}`, { method: 'GET' });
    apiUsers = apiResponse?.active || [];
    console.log('✅ API returned:', apiUsers.length, 'users');
    
    if (apiUsers.length === 0) {
      console.error('🚨 CRITICAL: API returns 0 users - this is the problem!');
    } else {
      apiUsers.forEach((user, idx) => {
        const lastSeen = user.lastSeen ? new Date(user.lastSeen) : null;
        const enterTime = user.enterTime ? new Date(user.enterTime) : null;
        const now = Date.now();
        
        const lastSeenDiffMs = lastSeen ? (now - lastSeen.getTime()) : null;
        const lastSeenSeconds = lastSeenDiffMs ? Math.floor(lastSeenDiffMs / 1000) : null;
        const lastSeenMinutes = lastSeenDiffMs ? Math.floor(lastSeenDiffMs / 60000) : null;
        
        const enterTimeDiffMs = enterTime ? (now - enterTime.getTime()) : null;
        const enterTimeSeconds = enterTimeDiffMs ? Math.floor(enterTimeDiffMs / 1000) : null;
        const enterTimeMinutes = enterTimeDiffMs ? Math.floor(enterTimeDiffMs / 60000) : null;
        
        console.log(`\n📊 User ${idx + 1}: ${user.name} (${user.id})`);
        console.log(`   status: "${user.status || 'undefined'}"`);
        console.log(`   isActive: ${user.isActive}`);
        console.log(`   pageId: ${user.pageId} (current: ${pageId}) ${user.pageId === pageId ? '✅' : '❌'}`);
        console.log(`   enterTime: ${user.enterTime}`);
        console.log(`   → Time since enter: ${enterTimeMinutes} mins (${enterTimeSeconds} secs)`);
        console.log(`   lastSeen: ${user.lastSeen}`);
        console.log(`   → Time since last seen: ${lastSeenMinutes} mins (${lastSeenSeconds} secs)`);
        
        // ROOT CAUSE ANALYSIS
        console.log(`\n   🔍 ROOT CAUSE ANALYSIS:`);
        
        // Issue 1: Status undefined
        if (!user.status) {
          console.error(`   ❌ ISSUE: status is undefined - backend not setting status`);
        }
        
        // Issue 2: Stuck on "Now"
        if (user.isActive && enterTime && enterTimeSeconds < 60) {
          console.log(`   ⚠️ Should display "Now" (entered ${enterTimeSeconds}s ago)`);
          if (enterTimeMinutes >= 1) {
            console.error(`   ❌ ISSUE: Should display "Online for ${enterTimeMinutes} mins" but stuck on "Now"`);
            console.error(`      → Frontend periodic refresh may not be working`);
          }
        }
        
        // Issue 3: Old enter_time
        if (user.isActive && enterTime && enterTimeMinutes > 5) {
          const expectedMinutes = Math.floor(enterTimeMinutes);
          console.log(`   ✅ Should display "Online for ${expectedMinutes} mins"`);
          const enterTimeDays = Math.floor(enterTimeMinutes / 1440);
          if (enterTimeDays > 0) {
            console.error(`   ❌ ISSUE: enter_time is ${enterTimeDays} days old - not resetting on ENTER`);
          }
        }
        
        // Issue 4: Inactive but on same page
        if (user.pageId === pageId && !user.isActive && lastSeenMinutes > 5) {
          console.error(`   ❌ ISSUE: User on same page but inactive and last_seen is ${lastSeenMinutes} mins old`);
          console.error(`      → EXIT event may not have fired, or user re-entered without ENTER event`);
        }
        
        // Issue 5: Status mismatch
        const expectedStatus = 
          (user.isActive && lastSeenSeconds < 30) ? 'online' :
          (lastSeenMinutes < 1440) ? 'recently_seen' : 'offline';
        if (user.status !== expectedStatus) {
          console.error(`   ❌ ISSUE: Status mismatch - API has "${user.status}" but should be "${expectedStatus}"`);
        }
        
        // Issue 6: Real-time not updating
        console.log(`\n   🔍 REAL-TIME CHECK:`);
        if (user.pageId !== pageId) {
          console.error(`   ❌ ISSUE: User on different page (${user.pageId} vs ${pageId})`);
          console.error(`      → Real-time updates may not be firing when users move pages`);
        }
      });
    }
  } catch (error) {
    console.error('❌ API Call failed:', error);
  }
  
  console.log('\n--- 3. DIRECT DATABASE QUERY (Supabase) ---');
  let dbUsers = [];
  if (window.supabaseClient) {
    try {
      const { data, error } = await window.supabaseClient
        .from('user_presence')
        .select('*, AppUser(*)')
        .eq('page_id', pageId);
      
      if (error) throw error;
      dbUsers = data || [];
      console.log('✅ Database has:', dbUsers.length, 'presence records');
      
      if (dbUsers.length === 0) {
        console.error('🚨 CRITICAL: Database has 0 records for this pageId');
      } else {
        dbUsers.forEach((p, idx) => {
          const lastSeen = p.last_seen ? new Date(p.last_seen) : null;
          const enterTime = p.enter_time ? new Date(p.enter_time) : null;
          const now = Date.now();
          
          const lastSeenSeconds = lastSeen ? Math.floor((now - lastSeen.getTime()) / 1000) : null;
          const enterTimeSeconds = enterTime ? Math.floor((now - enterTime.getTime()) / 1000) : null;
          
          console.log(`\n📊 DB Record ${idx + 1}: ${p.AppUser?.name || p.user_name} (${p.user_id})`);
          console.log(`   is_active: ${p.is_active}`);
          console.log(`   last_seen: ${p.last_seen} (${lastSeenSeconds}s ago)`);
          console.log(`   enter_time: ${p.enter_time} (${enterTimeSeconds}s ago)`);
          
          // Compare with API
          const apiMatch = apiUsers.find(u => (u.id === p.user_id || u.id === p.AppUser?.id));
          if (!apiMatch) {
            console.error(`   ❌ ISSUE: User in DB but NOT in API response - backend filtering issue`);
          }
        });
      }
    } catch (error) {
      console.error('❌ Database query failed:', error);
    }
  } else {
    console.warn('⚠️ Supabase client not available');
  }
  
  console.log('\n--- 4. UI STATE CHECK ---');
  const visibleTab = document.getElementById('canopi-visible');
  if (visibleTab) {
    const userElements = visibleTab.querySelectorAll('.user-avatar-container');
    console.log('✅ UI shows', userElements.length, 'users');
    userElements.forEach((el, idx) => {
      const name = el.querySelector('.user-name')?.textContent.trim();
      const status = el.querySelector('.user-status')?.textContent.trim();
      console.log(`   UI User ${idx + 1}: ${name} - Status: "${status}"`);
      
      // Check if status matches API
      const apiMatch = apiUsers.find(u => u.name === name || u.id === currentUserId);
      if (apiMatch) {
        const expectedDisplay = 
          (apiMatch.isActive && apiMatch.enterTime) ? 
            (Math.floor((Date.now() - new Date(apiMatch.enterTime).getTime()) / 60000) < 1 ? 'Now' : 
             `Online for ${Math.floor((Date.now() - new Date(apiMatch.enterTime).getTime()) / 60000)} mins`) :
          (apiMatch.status === 'recently_seen' && apiMatch.lastSeen) ?
            `Last seen ${Math.floor((Date.now() - new Date(apiMatch.lastSeen).getTime()) / 60000)} mins ago` :
          'offline';
        
        if (status !== expectedDisplay) {
          console.error(`   ❌ ISSUE: UI shows "${status}" but should show "${expectedDisplay}"`);
        }
      }
    });
  } else {
    console.warn('⚠️ Canopi visible tab not found');
  }
  
  console.log('\n--- 5. REAL-TIME SUBSCRIPTION CHECK ---');
  if (window.supabaseRealtimeClient) {
    console.log('✅ SupabaseRealtimeClient available');
    console.log('   Current Page:', window.supabaseRealtimeClient.currentPage?.pageId);
    console.log('   Current User:', window.supabaseRealtimeClient.currentUser);
    
    // Check if real-time subscriptions are active
    if (window.supabaseRealtimeClient.currentPage) {
      console.log('✅ User is on a page - real-time should be active');
    } else {
      console.error('❌ ISSUE: No currentPage set - real-time may not be working');
    }
  } else {
    console.error('❌ ISSUE: SupabaseRealtimeClient not available');
  }
  
  console.log('\n--- 6. PERIODIC REFRESH CHECK ---');
  if (window.visibilityStatusRefreshInterval) {
    console.log('✅ Periodic status refresh interval is active');
    console.log('   Interval ID:', window.visibilityStatusRefreshInterval);
  } else {
    console.error('❌ ISSUE: Periodic status refresh interval NOT active');
    console.error('   → Status will be stuck on "Now" and never update to "Online for X mins"');
  }
  
  console.log('\n--- 7. SUMMARY ---');
  const issues = [];
  if (apiUsers.length === 0 && dbUsers.length > 0) {
    issues.push('API returns 0 users but DB has records');
  }
  if (!window.visibilityStatusRefreshInterval) {
    issues.push('Periodic refresh interval not active');
  }
  apiUsers.forEach(u => {
    if (!u.status) issues.push(`User ${u.name} has undefined status`);
    if (u.isActive && u.enterTime && (Date.now() - new Date(u.enterTime).getTime()) > 60000 && !window.visibilityStatusRefreshInterval) {
      issues.push(`User ${u.name} status stuck (no periodic refresh)`);
    }
  });
  
  if (issues.length === 0) {
    console.log('✅ No critical issues found');
  } else {
    console.error('🚨 CRITICAL ISSUES:');
    issues.forEach(issue => console.error(`   - ${issue}`));
  }
  
  console.log('\n🔍 === DIAGNOSTIC END ===');
  
  return {
    pageId,
    pageUrl,
    currentUserId,
    apiUsersCount: apiUsers.length,
    dbUsersCount: dbUsers.length,
    periodicRefreshActive: !!window.visibilityStatusRefreshInterval,
    issues,
    timestamp: new Date().toISOString()
  };
})();

