// ============================================================
// VISIBILITY CROSS-PROFILE TEST - Run in browser console
// ============================================================
// Test why one profile sees the other but not vice versa

(async function() {
  console.log('🔍 === CROSS-PROFILE VISIBILITY TEST ===\n');
  
  const results = {
    currentProfile: {
      id: null,
      email: null,
      pageId: null
    },
    apiResponse: null,
    allUsersInDB: [],
    presenceEvents: [],
    issues: []
  };
  
  // 1. Current profile info
  console.log('1️⃣ Current Profile:');
  results.currentProfile.id = window.currentUser?.id || window.currentUser?.user_id;
  results.currentProfile.email = window.currentUser?.email;
  results.currentProfile.pageId = window.currentUrlData?.pageId;
  console.log('   ID:', results.currentProfile.id);
  console.log('   Email:', results.currentProfile.email);
  console.log('   Page ID:', results.currentProfile.pageId);
  
  // 2. Check API response
  console.log('\n2️⃣ API Response:');
  try {
    const pageUrl = window.currentUrlData?.rawUrl || location.href;
    results.apiResponse = await window.api.request(`/v1/presence/url?url=${encodeURIComponent(pageUrl)}`);
    console.log('   Users returned:', results.apiResponse?.active?.length || 0);
    console.log('   Page ID in response:', results.apiResponse?.pageId);
    
    if (results.apiResponse?.active) {
      results.apiResponse.active.forEach((user, idx) => {
        const isCurrent = user.id === results.currentProfile.id;
        console.log(`\n   User ${idx + 1}: ${user.name} (${user.id})`);
        console.log('     Is current user:', isCurrent ? '✅ YES' : '❌ NO');
        console.log('     isActive:', user.isActive);
        console.log('     status:', user.status);
        console.log('     enterTime:', user.enterTime);
        console.log('     lastSeen:', user.lastSeen);
      });
      
      // Check if only current user is returned
      const onlyCurrentUser = results.apiResponse.active.length === 1 && 
                               results.apiResponse.active[0].id === results.currentProfile.id;
      if (onlyCurrentUser) {
        results.issues.push('API only returned current user - other users not found');
        console.log('   ⚠️ ISSUE: API only returned current user');
      }
    }
  } catch (error) {
    console.error('   ❌ API query failed:', error);
    results.issues.push('API query failed: ' + error.message);
  }
  
  // 3. Check direct database query (if Supabase available)
  console.log('\n3️⃣ Direct Database Query:');
  if (window.supabase) {
    try {
      const { data, error } = await window.supabase
        .from('user_presence')
        .select('*, AppUser(id, email, name)')
        .eq('page_id', results.currentProfile.pageId)
        .order('last_seen', { ascending: false });
      
      if (error) {
        console.error('   ❌ Database query error:', error);
        results.issues.push('Database query failed: ' + error.message);
      } else {
        results.allUsersInDB = data || [];
        console.log('   Total users in DB for this page:', results.allUsersInDB.length);
        
        results.allUsersInDB.forEach((presence, idx) => {
          const appUserId = presence.AppUser?.id || presence.user_id;
          const isCurrent = appUserId === results.currentProfile.id;
          const lastSeen = presence.last_seen ? new Date(presence.last_seen) : null;
          const diffMs = lastSeen ? (Date.now() - lastSeen.getTime()) : null;
          const diffMinutes = diffMs ? Math.floor(diffMs / 60000) : null;
          
          console.log(`\n   DB User ${idx + 1}: ${presence.AppUser?.name || 'Unknown'} (${appUserId})`);
          console.log('     Is current user:', isCurrent ? '✅ YES' : '❌ NO');
          console.log('     is_active:', presence.is_active);
          console.log('     last_seen:', diffMinutes !== null ? `${diffMinutes} minutes ago` : 'never');
          console.log('     enter_time:', presence.enter_time || 'not set');
          console.log('     page_id:', presence.page_id);
        });
        
        // Check if both users are in DB
        if (results.allUsersInDB.length < 2) {
          results.issues.push(`Only ${results.allUsersInDB.length} user(s) in database for this page - expected 2`);
          console.log('   ⚠️ ISSUE: Missing users in database');
        }
      }
    } catch (error) {
      console.error('   ❌ Database query failed:', error);
      results.issues.push('Database query exception: ' + error.message);
    }
  } else {
    console.log('   ⚠️ Supabase client not available');
    results.issues.push('Supabase client not available for direct DB query');
  }
  
  // Store data for return
  const dbData = data || [];
  
  // 4. Check presence event history (if available)
  console.log('\n4️⃣ Presence Event History:');
  if (window.supabase) {
    try {
      // Query recent presence events for this page
      const { data, error } = await window.supabase
        .from('user_presence')
        .select('user_id, AppUser(email, name), page_id, is_active, last_seen, enter_time')
        .eq('page_id', results.currentProfile.pageId)
        .order('last_seen', { ascending: false })
        .limit(10);
      
      if (!error && data) {
        console.log('   Recent presence events:', data.length);
        data.forEach((event, idx) => {
          console.log(`   Event ${idx + 1}: ${event.AppUser?.name || event.user_id} - last_seen: ${event.last_seen}`);
        });
        results.presenceEvents = data;
      }
    } catch (error) {
      console.log('   ⚠️ Could not query presence events');
    }
  }
  
  // 5. Verify page ID matching
  console.log('\n5️⃣ Page ID Verification:');
  const expectedPageId = results.currentProfile.pageId;
  console.log('   Expected page ID:', expectedPageId);
  
  if (results.allUsersInDB.length > 0) {
    const mismatchedPages = results.allUsersInDB.filter(u => u.page_id !== expectedPageId);
    if (mismatchedPages.length > 0) {
      results.issues.push(`${mismatchedPages.length} user(s) have different page_id`);
      console.log('   ⚠️ ISSUE: Some users have different page_id');
    } else {
      console.log('   ✅ All users have matching page_id');
    }
  }
  
  // 6. Recommendations
  console.log('\n📊 === DIAGNOSIS SUMMARY ===');
  console.log('Issues found:', results.issues.length);
  results.issues.forEach((issue, idx) => {
    console.log(`   ${idx + 1}. ${issue}`);
  });
  
  if (results.issues.length === 0) {
    console.log('\n✅ No issues detected - both users should see each other');
  } else {
    console.log('\n🔧 RECOMMENDATIONS:');
    if (results.issues.some(i => i.includes('only returned current user'))) {
      console.log('   - Ensure both profiles send ENTER presence events when loading the page');
      console.log('   - Check backend logs to verify both users\' presence is recorded');
      console.log('   - Verify both users have same normalized pageId');
    }
    if (results.issues.some(i => i.includes('Missing users in database'))) {
      console.log('   - Other user may not have sent presence ENTER event');
      console.log('   - Try refreshing the other profile\'s page');
      console.log('   - Check if presence tracking is enabled for other profile');
    }
  }
  
  return {
    ...results,
    dbUsers: dbData.length
  };
})();

