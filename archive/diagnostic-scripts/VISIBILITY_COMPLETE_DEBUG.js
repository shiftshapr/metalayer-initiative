// ============================================================
// VISIBILITY COMPLETE DEBUG - Run in browser console
// ============================================================
// Comprehensive debug for visibility issues

(async function() {
  console.log('🔍 === VISIBILITY COMPLETE DEBUG ===\n');
  
  const results = {
    currentPageId: null,
    apiUsers: [],
    filteredUsers: [],
    issues: []
  };
  
  // 1. Check current page
  console.log('1️⃣ Current Page:');
  results.currentPageId = window.currentUrlData?.pageId;
  console.log('   Page ID:', results.currentPageId);
  console.log('   Normalized URL:', window.currentUrlData?.normalizedUrl);
  console.log('   Raw URL:', window.currentUrlData?.rawUrl);
  
  // 2. Check current user
  console.log('\n2️⃣ Current User:');
  const currentUserId = window.currentUser?.id || window.currentUser?.user_id;
  const currentUserEmail = window.currentUser?.email;
  console.log('   ID:', currentUserId);
  console.log('   Email:', currentUserEmail);
  console.log('   Name:', window.currentUser?.name);
  
  // 3. Query API directly
  console.log('\n3️⃣ Direct API Query:');
  try {
    const pageUrl = window.currentUrlData?.rawUrl || location.href;
    const apiResp = await window.api.request(`/v1/presence/url?url=${encodeURIComponent(pageUrl)}`);
    results.apiUsers = apiResp?.active || [];
    console.log('   Users returned:', results.apiUsers.length);
    
    results.apiUsers.forEach((user, idx) => {
      const isCurrentUser = (user.id && currentUserId && String(user.id) === String(currentUserId)) ||
                           (user.email === currentUserEmail);
      console.log(`\n   User ${idx + 1}: ${user.name}`);
      console.log('     id:', user.id);
      console.log('     email:', user.email);
      console.log('     isActive:', user.isActive);
      console.log('     status:', user.status);
      console.log('     pageId:', user.pageId);
      console.log('     Is current user:', isCurrentUser ? '✅ YES' : '❌ NO');
    });
  } catch (error) {
    console.error('   ❌ API query failed:', error);
    results.issues.push('API query failed: ' + error.message);
  }
  
  // 4. Check COMP method getPageUsers
  console.log('\n4️⃣ COMP Method getPageUsers:');
  let compUsers = []; // ROOT CAUSE FIX: Declare at function scope to avoid ReferenceError
  const client = window.supabaseRealtimeClient || window.supabase;
  if (client && typeof client.getPageUsers === 'function') {
    try {
      compUsers = await client.getPageUsers(results.currentPageId);
      console.log('   Users returned:', compUsers.length);
      compUsers.forEach((user, idx) => {
        const isCurrent = (user.user_id && currentUserId && String(user.user_id) === String(currentUserId));
        console.log(`   User ${idx + 1}: ${user.user_email || user.name} (ID: ${user.user_id}) - ${isCurrent ? 'CURRENT USER' : 'OTHER USER'}`);
      });
    } catch (error) {
      console.error('   ❌ getPageUsers failed:', error);
      results.issues.push('getPageUsers failed: ' + error.message);
    }
  } else {
    console.log('   ❌ client.getPageUsers not available');
    results.issues.push('client.getPageUsers not available');
  }
  
  // 5. Check filtering logic
  console.log('\n5️⃣ Filtering Logic:');
  if (results.apiUsers.length > 0) {
    const filtered = results.apiUsers.filter(user => {
      const userId = user.id || user.userId || user.user_id;
      const isCurrentUser = (currentUserId && userId && String(userId) === String(currentUserId)) ||
                           (!currentUserId && user.email === currentUserEmail);
      return !isCurrentUser;
    });
    results.filteredUsers = filtered;
    console.log('   Before filter:', results.apiUsers.length);
    console.log('   After filter:', filtered.length);
    console.log('   Filtered users:', filtered.map(u => u.name || u.email));
    
    if (filtered.length === 0 && results.apiUsers.length > 0) {
      results.issues.push('All users filtered out - only current user returned');
    }
  } else {
    results.issues.push('No users returned from API');
  }
  
  // 6. Check visibility data
  console.log('\n6️⃣ Visibility Data:');
  console.log('   currentVisibilityData:', window.currentVisibilityData);
  console.log('   Active users:', window.currentVisibilityData?.active?.length || 0);
  
  // 7. Check UI
  console.log('\n7️⃣ UI State:');
  const visibleTab = document.getElementById('canopi-visible');
  if (visibleTab) {
    const visibleCount = parseInt(visibleTab.querySelector('.visible-count')?.textContent?.replace('visible', '').trim()) || 0;
    const visibleUsers = visibleTab.querySelectorAll('.item');
    console.log('   Displayed count:', visibleCount);
    console.log('   DOM users:', visibleUsers.length);
    
    if (visibleCount === 0 && results.apiUsers.length > 1) {
      results.issues.push('UI shows 0 but API returned ' + results.apiUsers.length + ' users');
    }
  }
  
  // Summary
  console.log('\n📊 === DEBUG SUMMARY ===');
  console.log('Issues found:', results.issues.length);
  results.issues.forEach((issue, idx) => {
    console.log(`   ${idx + 1}. ${issue}`);
  });
  
  if (results.issues.length === 0) {
    console.log('\n✅ No issues detected');
  } else {
    console.log('\n⚠️ Issues detected - see above');
  }
  
  return {
    ...results,
    compUsers: compUsers.length,
    currentPageId: results.currentPageId,
    currentUserId: currentUserId
  };
})();

