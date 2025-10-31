// ============================================================
// BACKEND API DIAGNOSTIC - Run in browser console
// ============================================================
// Diagnostic to verify backend API is working correctly

(async function() {
  console.log('🔍 === BACKEND API DIAGNOSTIC ===\n');
  
  const results = {
    pageId: window.currentUrlData?.pageId,
    apiResponse: null,
    dbQuery: null,
    issues: []
  };
  
  // 1. Check page ID normalization
  console.log('1️⃣ Page ID Normalization:');
  console.log('   Frontend pageId:', results.pageId);
  
  // 2. Test API with explicit pageId check
  console.log('\n2️⃣ API Response:');
  try {
    const pageUrl = window.currentUrlData?.rawUrl || location.href;
    const apiResp = await window.api.request(`/v1/presence/url?url=${encodeURIComponent(pageUrl)}`);
    results.apiResponse = apiResp;
    console.log('   Response pageId:', apiResp?.pageId);
    console.log('   Users returned:', apiResp?.active?.length || 0);
    console.log('   Matches frontend pageId:', apiResp?.pageId === results.pageId ? '✅' : '❌');
    
    if (apiResp?.active?.length === 0) {
      results.issues.push('API returned 0 users');
    }
    
    if (apiResp?.pageId !== results.pageId) {
      results.issues.push(`PageId mismatch: API=${apiResp?.pageId}, Frontend=${results.pageId}`);
    }
  } catch (error) {
    console.error('   ❌ API failed:', error);
    results.issues.push('API call failed: ' + error.message);
  }
  
  // 3. Direct database query for comparison
  console.log('\n3️⃣ Direct Database Query (for comparison):');
  if (window.supabase) {
    try {
      const { data, error } = await window.supabase
        .from('user_presence')
        .select('*, AppUser(id, email, name, avatarUrl)')
        .eq('page_id', results.pageId)
        .order('last_seen', { ascending: false });
      
      if (error) {
        console.error('   ❌ DB query error:', error);
        results.issues.push('DB query failed: ' + error.message);
      } else {
        results.dbQuery = data || [];
        console.log('   Users in DB:', results.dbQuery.length);
        console.log('   Users with AppUser:', results.dbQuery.filter(u => u.AppUser).length);
        console.log('   Users without AppUser:', results.dbQuery.filter(u => !u.AppUser).length);
        
        if (results.dbQuery.length > 0 && results.apiResponse?.active?.length === 0) {
          results.issues.push(`Database has ${results.dbQuery.length} users but API returned 0`);
          console.log('   ⚠️ ISSUE: Database has users but API returns none');
          
          // Check if missing AppUser is the issue
          const usersWithoutAppUser = results.dbQuery.filter(u => !u.AppUser);
          if (usersWithoutAppUser.length > 0) {
            console.log('   ⚠️ Found users without AppUser join - this might cause filtering');
            usersWithoutAppUser.forEach(u => {
              console.log(`      User: ${u.user_id}, AppUser: ${u.AppUser ? 'present' : 'MISSING'}`);
            });
          }
        }
        
        results.dbQuery.forEach((u, idx) => {
          const appUserId = u.AppUser?.id || u.user_id;
          console.log(`   DB User ${idx + 1}: ${u.AppUser?.name || 'Unknown'} (${appUserId})`);
          console.log('     AppUser present:', u.AppUser ? '✅' : '❌');
          console.log('     page_id:', u.page_id);
        });
      }
    } catch (error) {
      console.error('   ❌ DB query exception:', error);
      results.issues.push('DB query exception: ' + error.message);
    }
  } else {
    console.log('   ⚠️ Supabase not available');
  }
  
  // 4. Recommendations
  console.log('\n📊 === DIAGNOSIS ===');
  if (results.issues.length === 0) {
    console.log('✅ No issues detected');
  } else {
    console.log('⚠️ Issues found:');
    results.issues.forEach((issue, idx) => {
      console.log(`   ${idx + 1}. ${issue}`);
    });
    
    console.log('\n🔧 RECOMMENDATIONS:');
    if (results.issues.some(i => i.includes('Database has') && i.includes('API returned 0'))) {
      console.log('   1. Check backend logs for getActiveUsers function');
      console.log('   2. Verify AppUser join is working (users without AppUser are filtered)');
      console.log('   3. Check if pageId normalization is consistent');
      console.log('   4. Verify all users have AppUser records in database');
    }
  }
  
  return results;
})();

