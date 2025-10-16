/**
 * TE2 Visibility Test Suite
 * Console-callable functions to test visibility and "Last Seen" functionality
 * 
 * Usage: Run these functions in the sidepanel console
 */

// ═══════════════════════════════════════════════════════════════
// TEST 1: Check Backend API Directly
// ═══════════════════════════════════════════════════════════════
window.te2TestBackendAPI = async function() {
  console.log('');
  console.log('🧪🧪🧪═══════════════════════════════════════════════════════');
  console.log('🧪🧪🧪 TE2 TEST 1: Backend API Direct Test');
  console.log('🧪🧪🧪═══════════════════════════════════════════════════════');
  console.log('');
  
  const currentPage = window.supabaseRealtimeClient?.currentPage;
  if (!currentPage) {
    console.error('❌ No current page!');
    return;
  }
  
  console.log('📋 Testing backend API for page:', currentPage.pageUrl);
  console.log('📋 Page ID:', currentPage.pageId);
  console.log('');
  
  try {
    // Use the correct backend API endpoint (not Supabase Edge Functions!)
    const apiUrl = window.METALAYER_API_URL || 'https://api.themetalayer.org';
    const params = new URLSearchParams({ 
      url: currentPage.pageUrl,
      communityIds: 'comm-001,comm-002'
    });
    
    // Get current user for authentication
    const user = await authManager.getCurrentUser();
    
    const response = await fetch(`${apiUrl}/v1/presence/url?${params.toString()}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'x-user-email': user?.email || 'unknown'
      }
    });
    
    const data = await response.json();
    
    console.log('✅ Backend API Response:');
    console.log(JSON.stringify(data, null, 2));
    console.log('');
    console.log(`📊 Total users returned: ${data.active?.length || 0}`);
    
    if (data.active) {
      data.active.forEach((user, index) => {
        console.log(`   ${index + 1}. ${user.email || user.userId}`);
        console.log(`      isActive: ${user.isActive}`);
        console.log(`      status: ${user.status}`);
        console.log(`      lastSeen: ${user.lastSeen}`);
      });
    }
    
    console.log('');
    console.log('🧪 TEST 1 COMPLETE');
    console.log('');
    
    return data;
  } catch (error) {
    console.error('❌ TEST 1 FAILED:', error);
    return null;
  }
};

// ═══════════════════════════════════════════════════════════════
// TEST 2: Compare Database vs Backend
// ═══════════════════════════════════════════════════════════════
window.te2CompareDBvsBackend = async function() {
  console.log('');
  console.log('🧪🧪🧪═══════════════════════════════════════════════════════');
  console.log('🧪🧪🧪 TE2 TEST 2: Database vs Backend Comparison');
  console.log('🧪🧪🧪═══════════════════════════════════════════════════════');
  console.log('');
  
  const currentPage = window.supabaseRealtimeClient?.currentPage;
  if (!currentPage) {
    console.error('❌ No current page!');
    return;
  }
  
  // Query database directly
  console.log('📋 Step 1: Querying database directly...');
  const { data: dbUsers, error: dbError } = await window.supabase
    .from('user_presence')
    .select('*')
    .eq('page_id', currentPage.pageId)
    .order('last_seen', { ascending: false });
  
  if (dbError) {
    console.error('❌ Database query failed:', dbError);
    return;
  }
  
  console.log(`✅ Database has ${dbUsers.length} users:`);
  dbUsers.forEach((user, index) => {
    const minutesAgo = (Date.now() - new Date(user.last_seen).getTime()) / 1000 / 60;
    console.log(`   ${index + 1}. ${user.user_email}`);
    console.log(`      is_active: ${user.is_active}`);
    console.log(`      last_seen: ${minutesAgo.toFixed(1)} minutes ago`);
  });
  console.log('');
  
  // Query backend API
  console.log('📋 Step 2: Querying backend API...');
  const backendData = await te2TestBackendAPI();
  
  if (!backendData) {
    console.error('❌ Backend query failed!');
    return;
  }
  
  // Compare
  console.log('📊 COMPARISON:');
  console.log(`   Database: ${dbUsers.length} users`);
  console.log(`   Backend:  ${backendData.active?.length || 0} users`);
  
  const missing = dbUsers.length - (backendData.active?.length || 0);
  if (missing > 0) {
    console.error('');
    console.error(`❌❌❌ DISCREPANCY: Backend is missing ${missing} users! ❌❌❌`);
    console.error('');
    
    // Find which users are missing
    const backendEmails = new Set(backendData.active?.map(u => u.email || u.userId) || []);
    const missingUsers = dbUsers.filter(u => !backendEmails.has(u.user_email));
    
    console.error('Missing users:');
    missingUsers.forEach(user => {
      const minutesAgo = (Date.now() - new Date(user.last_seen).getTime()) / 1000 / 60;
      console.error(`   - ${user.user_email}`);
      console.error(`     is_active: ${user.is_active}`);
      console.error(`     last_seen: ${minutesAgo.toFixed(1)} minutes ago`);
      
      if (minutesAgo > 30) {
        console.error(`     ⚠️ REASON: last_seen is older than 30 minutes!`);
      }
    });
  } else {
    console.log('✅ No discrepancy - database and backend match!');
  }
  
  console.log('');
  console.log('🧪 TEST 2 COMPLETE');
  console.log('');
  
  return { dbUsers, backendData, missing };
};

// ═══════════════════════════════════════════════════════════════
// TEST 3: Test Visibility Filtering
// ═══════════════════════════════════════════════════════════════
window.te2TestVisibilityFiltering = async function() {
  console.log('');
  console.log('🧪🧪🧪═══════════════════════════════════════════════════════');
  console.log('🧪🧪🧪 TE2 TEST 3: Visibility Filtering Test');
  console.log('🧪🧪🧪═══════════════════════════════════════════════════════');
  console.log('');
  
  const currentUser = window.supabaseRealtimeClient?.currentUser?.userEmail;
  if (!currentUser) {
    console.error('❌ No current user!');
    return;
  }
  
  console.log('📋 Current user:', currentUser);
  console.log('');
  
  // Get backend data
  const backendData = await te2TestBackendAPI();
  if (!backendData || !backendData.active) {
    console.error('❌ No backend data!');
    return;
  }
  
  console.log('📋 Testing visibility filtering logic...');
  console.log('');
  
  const allUsers = backendData.active;
  console.log(`Input: ${allUsers.length} users from backend`);
  
  // Simulate the filtering logic from sidepanel.js
  const filteredUsers = allUsers.filter(user => {
    const userEmail = user.email || user.userId;
    const isCurrentUser = userEmail === currentUser ||
                         user.handle === currentUser.split('@')[0] ||
                         user.name === currentUser.split('@')[0];
    
    console.log(`   Checking: ${user.name || userEmail}`);
    console.log(`      Email: ${userEmail}`);
    console.log(`      Is current user: ${isCurrentUser}`);
    console.log(`      Keep: ${!isCurrentUser}`);
    
    return !isCurrentUser;
  });
  
  console.log('');
  console.log(`Output: ${filteredUsers.length} users after filtering`);
  console.log('');
  
  if (filteredUsers.length === 0 && allUsers.length > 0) {
    console.error('❌❌❌ PROBLEM: All users were filtered out! ❌❌❌');
    console.error('This means the backend only returned the current user.');
    console.error('Other users are missing from the backend response!');
  } else if (filteredUsers.length > 0) {
    console.log('✅ Visibility filtering working correctly');
    console.log('Users to display:');
    filteredUsers.forEach(user => {
      console.log(`   - ${user.name || user.email || user.userId}`);
    });
  }
  
  console.log('');
  console.log('🧪 TEST 3 COMPLETE');
  console.log('');
  
  return { allUsers, filteredUsers };
};

// ═══════════════════════════════════════════════════════════════
// TEST 4: Full Diagnostic Suite
// ═══════════════════════════════════════════════════════════════
window.te2RunAllTests = async function() {
  console.log('');
  console.log('🧪🧪🧪═══════════════════════════════════════════════════════');
  console.log('🧪🧪🧪 TE2 FULL DIAGNOSTIC SUITE');
  console.log('🧪🧪🧪═══════════════════════════════════════════════════════');
  console.log('');
  
  const results = {
    test1: null,
    test2: null,
    test3: null,
    summary: {}
  };
  
  // Test 1
  console.log('Running Test 1: Backend API...');
  results.test1 = await te2TestBackendAPI();
  
  // Test 2
  console.log('Running Test 2: Database vs Backend...');
  results.test2 = await te2CompareDBvsBackend();
  
  // Test 3
  console.log('Running Test 3: Visibility Filtering...');
  results.test3 = await te2TestVisibilityFiltering();
  
  // Summary
  console.log('');
  console.log('📊📊📊 SUMMARY 📊📊📊');
  console.log('');
  
  const backendUserCount = results.test1?.active?.length || 0;
  const dbUserCount = results.test2?.dbUsers?.length || 0;
  const filteredUserCount = results.test3?.filteredUsers?.length || 0;
  
  console.log(`Database users:     ${dbUserCount}`);
  console.log(`Backend users:      ${backendUserCount}`);
  console.log(`Filtered users:     ${filteredUserCount}`);
  console.log('');
  
  if (dbUserCount > backendUserCount) {
    console.error('❌ ISSUE: Backend is missing users from database!');
    console.error('   → Check backend query logic in presenceService.js');
    console.error('   → Run URGENT-RUN-THIS-SQL-NOW.sql in Supabase');
  } else if (backendUserCount > 0 && filteredUserCount === 0) {
    console.error('❌ ISSUE: All users filtered out on frontend!');
    console.error('   → Backend only returning current user');
    console.error('   → Other users missing from backend response');
  } else if (filteredUserCount > 0) {
    console.log('✅ System working correctly!');
  }
  
  console.log('');
  console.log('🧪 ALL TESTS COMPLETE');
  console.log('');
  
  return results;
};

console.log('✅ TE2 Visibility Test Suite loaded!');
console.log('');
console.log('Available functions:');
console.log('  - te2TestBackendAPI()         - Test backend API directly');
console.log('  - te2CompareDBvsBackend()     - Compare database vs backend');
console.log('  - te2TestVisibilityFiltering() - Test frontend filtering logic');
console.log('  - te2RunAllTests()            - Run all tests');
console.log('');

