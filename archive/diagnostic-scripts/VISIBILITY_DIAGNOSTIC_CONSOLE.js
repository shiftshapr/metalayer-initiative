// ============================================================
// VISIBILITY DIAGNOSTIC CODE - Run in browser console
// ============================================================
// Diagnose why users are not seeing each other across browser profiles

(async function() {
  console.log('🔍 === VISIBILITY DIAGNOSTIC START ===\n');
  
  // 1. Check current user identity
  console.log('1️⃣ Current User Identity:');
  console.log('   window.currentUser.id:', window.currentUser?.id);
  console.log('   window.currentUser.user_id:', window.currentUser?.user_id);
  console.log('   window.currentUser.email:', window.currentUser?.email);
  console.log('   window.currentUser.name:', window.currentUser?.name);
  
  // 2. Check current page/URL
  console.log('\n2️⃣ Current Page Context:');
  console.log('   window.currentUrlData:', window.currentUrlData);
  console.log('   pageId:', window.currentUrlData?.pageId);
  console.log('   rawUrl:', window.currentUrlData?.rawUrl);
  console.log('   location.href:', location.href);
  
  // 3. Check presence API response
  console.log('\n3️⃣ Presence API Response:');
  try {
    const pageUrl = window.currentUrlData?.rawUrl || location.href;
    const presenceResp = await window.api.request(`/v1/presence/url?url=${encodeURIComponent(pageUrl)}`);
    console.log('   Response:', presenceResp);
    console.log('   Active users count:', presenceResp?.active?.length || 0);
    console.log('   Active users:', presenceResp?.active?.map(u => ({
      id: u.id,
      userId: u.userId,
      email: u.email,
      name: u.name,
      isActive: u.isActive,
      lastSeen: u.lastSeen
    })));
    
    // Check if current user is in the list
    const currentUserId = window.currentUser?.id || window.currentUser?.user_id;
    const currentUserInList = presenceResp?.active?.find(u => 
      String(u.id || u.userId) === String(currentUserId)
    );
    console.log('   Current user in active list:', currentUserInList ? '✅ YES' : '❌ NO');
    if (currentUserInList) {
      console.log('   Current user details:', currentUserInList);
    }
  } catch (error) {
    console.error('   ❌ Error fetching presence:', error);
  }
  
  // 4. Check visibility data
  console.log('\n4️⃣ Visibility Data:');
  console.log('   window.currentVisibilityData:', window.currentVisibilityData);
  console.log('   window.currentVisibilityDataUnfiltered:', window.currentVisibilityDataUnfiltered);
  console.log('   Filtered users count:', window.currentVisibilityData?.active?.length || 0);
  console.log('   Unfiltered users count:', window.currentVisibilityDataUnfiltered?.active?.length || 0);
  
  // 5. Check UI state
  console.log('\n5️⃣ UI State:');
  const visibleTab = document.getElementById('canopi-visible');
  if (visibleTab) {
    const visibleCount = visibleTab.querySelector('.visible-count')?.textContent;
    const visibleUsers = visibleTab.querySelectorAll('.item');
    console.log('   Visible count displayed:', visibleCount);
    console.log('   Visible users in DOM:', visibleUsers.length);
    visibleUsers.forEach((user, idx) => {
      const name = user.querySelector('.user-name')?.textContent;
      const status = user.querySelector('.user-status')?.textContent;
      console.log(`   User ${idx + 1}: ${name} (${status})`);
    });
  } else {
    console.log('   ❌ canopi-visible element not found');
  }
  
  // 6. Check user_presence table directly (via Supabase if available)
  console.log('\n6️⃣ Direct user_presence Query:');
  if (window.supabase) {
    try {
      const pageId = window.currentUrlData?.pageId;
      if (pageId) {
        // Query ALL users on this page (not just is_active=true) to see what's in DB
        const { data, error } = await window.supabase
          .from('user_presence')
          .select('*, AppUser(id, email, name)')
          .eq('page_id', pageId)
          .order('last_seen', { ascending: false });
        
        if (error) {
          console.error('   ❌ Supabase query error:', error);
        } else {
          console.log('   Direct query users count:', data?.length || 0);
          console.log('   Direct query users:', data?.map(u => {
            const now = new Date();
            const lastSeen = new Date(u.last_seen);
            const diffMs = now - lastSeen;
            const diffMinutes = Math.floor(diffMs / 60000);
            return {
              user_id: u.user_id,
              AppUser_id: u.AppUser?.id,
              AppUser_email: u.AppUser?.email,
              is_active: u.is_active,
              last_seen: u.last_seen,
              last_seen_minutes_ago: diffMinutes,
              within_24h: diffMs < (24 * 60 * 60 * 1000)
            };
          }));
        }
      } else {
        console.log('   ⚠️ No pageId available');
      }
    } catch (error) {
      console.error('   ❌ Error querying Supabase:', error);
    }
  } else {
    console.log('   ⚠️ Supabase client not available');
  }
  
  // 7. Check filtering logic
  console.log('\n7️⃣ Filtering Analysis:');
  const currentUserId = window.currentUser?.id || window.currentUser?.user_id;
  const currentUserEmail = window.currentUser?.email;
  console.log('   Current user ID for filtering:', currentUserId);
  console.log('   Current user email for filtering:', currentUserEmail);
  
  if (window.currentVisibilityDataUnfiltered?.active) {
    window.currentVisibilityDataUnfiltered.active.forEach((avatar, idx) => {
      const avatarId = avatar.id || avatar.userId || avatar.user_id;
      const matchesId = currentUserId && avatarId && String(avatarId) === String(currentUserId);
      const matchesEmail = !currentUserId && avatar.email === currentUserEmail;
      const isFiltered = matchesId || matchesEmail;
      console.log(`   Avatar ${idx + 1}: ${avatar.name} (ID: ${avatarId}) - ${isFiltered ? '🚫 FILTERED' : '✅ SHOWN'}`);
    });
  }
  
  // 8. Force refresh
  console.log('\n8️⃣ Force Refreshing Visibility...');
  if (typeof window.refreshVisibilityAvatars === 'function') {
    await window.refreshVisibilityAvatars();
    console.log('   ✅ Visibility refreshed');
  } else {
    console.error('   ❌ refreshVisibilityAvatars not available');
  }
  
  console.log('\n=== VISIBILITY DIAGNOSTIC END ===');
  console.log('💡 Issues to check:');
  console.log('   1. Are both profiles sending ENTER events?');
  console.log('   2. Are both profiles in user_presence table with is_active=true?');
  console.log('   3. Is filtering logic correctly identifying current user?');
  console.log('   4. Is presence API returning all active users?');
  
  return {
    currentUser: window.currentUser,
    pageId: window.currentUrlData?.pageId,
    diagnosticComplete: true
  };
})();


