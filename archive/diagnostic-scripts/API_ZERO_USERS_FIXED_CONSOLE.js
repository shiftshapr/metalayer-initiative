// ============================================================
// API ZERO USERS FIX VERIFICATION - Run in browser console
// ============================================================
// Verify the fix for API returning 0 users when database has users

(async function() {
  console.log('🔍 === API ZERO USERS FIX VERIFICATION ===\n');
  
  const pageUrl = window.currentUrlData?.rawUrl || location.href;
  const pageId = window.currentUrlData?.pageId;
  
  // 1. Check API response
  console.log('1️⃣ API Response:');
  const apiResp = await window.api.request(`/v1/presence/url?url=${encodeURIComponent(pageUrl)}`);
  console.log('   Users returned:', apiResp?.active?.length || 0);
  console.log('   Page ID:', apiResp?.pageId);
  
  if (apiResp?.active?.length === 0) {
    console.log('   ⚠️ API still returns 0 users');
    console.log('   📋 Check backend server logs for:');
    console.log('      - "Query WITHOUT date filter found X users"');
    console.log('      - "Date filter is excluding all users"');
    console.log('      - User last_seen values and filter comparison');
  } else {
    console.log('   ✅ API returns users:', apiResp?.active?.length);
    apiResp.active.forEach((u, idx) => {
      console.log(`      ${idx + 1}. ${u.name} (${u.id}) - ${u.status}`);
    });
  }
  
  // 2. Direct DB comparison
  console.log('\n2️⃣ Database Comparison:');
  if (window.supabase) {
    const { data } = await window.supabase
      .from('user_presence')
      .select('*, AppUser(id, email, name)')
      .eq('page_id', pageId)
      .order('last_seen', { ascending: false });
    
    console.log('   Users in DB:', data?.length || 0);
    
    if (data && data.length > 0) {
      data.forEach((u, idx) => {
        const lastSeen = u.last_seen ? new Date(u.last_seen) : null;
        const diffMs = lastSeen ? (Date.now() - lastSeen.getTime()) : null;
        const diffHours = diffMs ? Math.floor(diffMs / (60 * 60 * 1000)) : null;
        const within24h = diffMs && diffMs < (24 * 60 * 60 * 1000);
        console.log(`   User ${idx + 1}: ${u.AppUser?.name || 'Unknown'}`);
        console.log(`     last_seen: ${u.last_seen}`);
        console.log(`     Hours ago: ${diffHours}, Within 24h: ${within24h ? '✅' : '❌'}`);
      });
    }
    
    // Diagnosis
    if (data && data.length > 0 && apiResp?.active?.length === 0) {
      console.log('\n⚠️ ISSUE PERSISTS:');
      console.log('   Database has', data.length, 'users but API returns 0');
      console.log('   Backend logs should show:');
      console.log('     - Query WITHOUT date filter results');
      console.log('     - Date filter comparison');
      console.log('     - Fallback mechanism activation');
    } else if (apiResp?.active?.length > 0) {
      console.log('\n✅ FIX WORKING: API now returns users');
    }
  }
  
  return {
    apiUsers: apiResp?.active?.length || 0,
    dbUsers: data?.length || 0,
    pageId,
    fixWorking: apiResp?.active?.length > 0
  };
})();

