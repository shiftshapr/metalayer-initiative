// ============================================================
// VISIBILITY BLANK PROFILE DEBUG - Run in browser console
// ============================================================
// Debug why one profile shows blank (0 visible)

(async function() {
  console.log('🔍 === BLANK PROFILE DEBUG ===\n');
  
  const currentUserId = window.currentUser?.id || window.currentUser?.user_id;
  const currentUserEmail = window.currentUser?.email;
  
  console.log('Current User:');
  console.log('  ID:', currentUserId);
  console.log('  Email:', currentUserEmail);
  console.log('  Name:', window.currentUser?.name);
  
  // 1. Check API response
  console.log('\n1️⃣ API Response:');
  const pageUrl = window.currentUrlData?.rawUrl || location.href;
  const presenceResp = await window.api.request(`/v1/presence/url?url=${encodeURIComponent(pageUrl)}`);
  console.log('  Users returned:', presenceResp?.active?.length || 0);
  console.log('  Page ID:', presenceResp?.pageId);
  
  if (presenceResp?.active) {
    presenceResp.active.forEach((user, idx) => {
      console.log(`\n  User ${idx + 1}: ${user.name}`);
      console.log('    id:', user.id);
      console.log('    userId:', user.userId);
      console.log('    email:', user.email);
      console.log('    isActive:', user.isActive);
      console.log('    status:', user.status);
      console.log('    lastSeen:', user.lastSeen);
      
      // Check if this is the current user
      const isCurrentUser = (currentUserId && user.id && String(user.id) === String(currentUserId)) ||
                           (currentUserEmail && user.email && user.email.toLowerCase() === currentUserEmail.toLowerCase());
      console.log('    Is current user:', isCurrentUser ? '✅ YES (will be filtered)' : '❌ NO (should be visible)');
    });
  }
  
  // 2. Check visibility data
  console.log('\n2️⃣ Visibility Data:');
  console.log('  Unfiltered count:', window.currentVisibilityDataUnfiltered?.active?.length || 0);
  console.log('  Filtered count:', window.currentVisibilityData?.active?.length || 0);
  
  if (window.currentVisibilityDataUnfiltered?.active) {
    window.currentVisibilityDataUnfiltered.active.forEach((avatar, idx) => {
      const avatarId = avatar.id || avatar.userId || avatar.user_id;
      const isCurrentUser = (currentUserId && avatarId && String(avatarId) === String(currentUserId));
      console.log(`\n  Avatar ${idx + 1}: ${avatar.name} (ID: ${avatarId})`);
      console.log('    Will be filtered:', isCurrentUser ? '✅ YES' : '❌ NO');
      console.log('    isActive:', avatar.isActive);
      console.log('    status:', avatar.status);
    });
  }
  
  // 3. Check UI
  console.log('\n3️⃣ UI State:');
  const visibleTab = document.getElementById('canopi-visible');
  if (visibleTab) {
    const visibleCount = parseInt(visibleTab.querySelector('.visible-count')?.textContent?.replace('visible', '').trim()) || 0;
    const visibleUsers = visibleTab.querySelectorAll('.item');
    console.log('  Visible count displayed:', visibleCount);
    console.log('  Users in DOM:', visibleUsers.length);
    
    if (visibleCount === 0 && visibleUsers.length === 0) {
      console.log('  ❌ BLANK PROFILE: No users visible');
      console.log('  Possible causes:');
      console.log('    1. API only returned current user (which gets filtered out)');
      console.log('    2. Other user not in database for this page');
      console.log('    3. Other user\'s last_seen is older than 24 hours');
    }
  }
  
  // 4. Direct database query (if Supabase available)
  console.log('\n4️⃣ Direct Database Query:');
  if (window.supabase) {
    try {
      const pageId = window.currentUrlData?.pageId;
      if (pageId) {
        const { data, error } = await window.supabase
          .from('user_presence')
          .select('*, AppUser(id, email, name)')
          .eq('page_id', pageId)
          .order('last_seen', { ascending: false });
        
        if (error) {
          console.error('  ❌ Query error:', error);
        } else {
          console.log('  Total users in DB:', data?.length || 0);
          data?.forEach((presence, idx) => {
            const appUserId = presence.AppUser?.id || presence.user_id;
            const isCurrentUser = currentUserId && appUserId && String(appUserId) === String(currentUserId);
            const now = new Date();
            const lastSeen = new Date(presence.last_seen);
            const diffMs = now - lastSeen;
            const within24h = diffMs < (24 * 60 * 60 * 1000);
            
            console.log(`\n  DB User ${idx + 1}: ${presence.AppUser?.name || 'Unknown'}`);
            console.log('    user_id:', presence.user_id);
            console.log('    AppUser.id:', presence.AppUser?.id);
            console.log('    email:', presence.AppUser?.email);
            console.log('    is_active:', presence.is_active);
            console.log('    last_seen:', presence.last_seen);
            console.log('    Minutes ago:', Math.floor(diffMs / 60000));
            console.log('    Within 24h:', within24h ? '✅' : '❌');
            console.log('    Is current user:', isCurrentUser ? '✅ YES' : '❌ NO');
          });
        }
      }
    } catch (error) {
      console.error('  ❌ Error:', error);
    }
  }
  
  console.log('\n=== DEBUG END ===');
  
  return {
    currentUser: { id: currentUserId, email: currentUserEmail },
    apiResponse: presenceResp,
    visibilityData: window.currentVisibilityDataUnfiltered,
    debugComplete: true
  };
})();

