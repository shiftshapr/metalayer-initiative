/**
 * Diagnostic Tool: Last Seen Status Issue
 * 
 * This tool helps diagnose why "Last seen X ago" is not showing
 * when a user navigates to a page where another user was previously active.
 * 
 * Usage:
 * 1. Load this script in the sidepanel console
 * 2. Run: await diagnoseLastSeenIssue()
 */

window.diagnoseLastSeenIssue = async function() {
  console.log('');
  console.log('🔬🔬🔬═══════════════════════════════════════════════════════');
  console.log('🔬🔬🔬 LAST SEEN DIAGNOSTIC TOOL');
  console.log('🔬🔬🔬═══════════════════════════════════════════════════════');
  console.log('');
  
  const results = {
    timestamp: new Date().toISOString(),
    tests: [],
    summary: {}
  };
  
  // TEST 1: Check current page and user
  console.log('📋 TEST 1: Current State');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  const currentUser = window.supabaseRealtimeClient?.currentUser?.userEmail;
  const currentPage = window.supabaseRealtimeClient?.currentPage;
  
  console.log('Current user:', currentUser);
  console.log('Current page:', currentPage);
  
  if (!currentUser || !currentPage) {
    console.error('❌ TEST 1 FAILED: No current user or page!');
    results.tests.push({
      name: 'Current State',
      passed: false,
      error: 'No current user or page'
    });
    return results;
  }
  
  results.tests.push({
    name: 'Current State',
    passed: true,
    data: { currentUser, currentPage }
  });
  console.log('✅ TEST 1 PASSED');
  console.log('');
  
  // TEST 2: Query database directly for ALL users on this page
  console.log('📋 TEST 2: Database Query - All Users on This Page');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  const { data: allUsers, error: allUsersError } = await window.supabase
    .from('user_presence')
    .select('*')
    .eq('page_id', currentPage.pageId)
    .order('last_seen', { ascending: false });
  
  if (allUsersError) {
    console.error('❌ TEST 2 FAILED:', allUsersError);
    results.tests.push({
      name: 'Database Query - All Users',
      passed: false,
      error: allUsersError
    });
  } else {
    console.log(`✅ Found ${allUsers.length} total presence records for this page:`);
    allUsers.forEach((user, index) => {
      const minutesAgo = (Date.now() - new Date(user.last_seen).getTime()) / 1000 / 60;
      console.log(`   ${index + 1}. ${user.user_email}`);
      console.log(`      is_active: ${user.is_active}`);
      console.log(`      last_seen: ${user.last_seen} (${minutesAgo.toFixed(1)} minutes ago)`);
      console.log(`      enter_time: ${user.enter_time}`);
    });
    
    results.tests.push({
      name: 'Database Query - All Users',
      passed: true,
      data: allUsers
    });
  }
  console.log('');
  
  // TEST 3: Query active users (backend logic simulation)
  console.log('📋 TEST 3: Active Users Query (Backend Logic)');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  const activeThreshold = new Date(Date.now() - 5 * 60 * 1000); // 5 minutes ago
  
  const { data: activeUsers, error: activeError } = await window.supabase
    .from('user_presence')
    .select('*')
    .eq('page_id', currentPage.pageId)
    .eq('is_active', true)
    .gte('last_seen', activeThreshold.toISOString())
    .order('last_seen', { ascending: false });
  
  if (activeError) {
    console.error('❌ TEST 3 FAILED:', activeError);
    results.tests.push({
      name: 'Active Users Query',
      passed: false,
      error: activeError
    });
  } else {
    console.log(`✅ Found ${activeUsers.length} active users:`);
    activeUsers.forEach((user, index) => {
      console.log(`   ${index + 1}. ${user.user_email} - last_seen: ${user.last_seen}`);
    });
    
    results.tests.push({
      name: 'Active Users Query',
      passed: true,
      data: activeUsers
    });
  }
  console.log('');
  
  // TEST 4: Query recently inactive users (backend logic simulation)
  console.log('📋 TEST 4: Recently Inactive Users Query (Backend Logic)');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  const recentThreshold = new Date(Date.now() - 30 * 60 * 1000); // 30 minutes ago
  
  const { data: recentUsers, error: recentError } = await window.supabase
    .from('user_presence')
    .select('*')
    .eq('page_id', currentPage.pageId)
    .eq('is_active', false)
    .gte('last_seen', recentThreshold.toISOString())
    .order('last_seen', { ascending: false });
  
  if (recentError) {
    console.error('❌ TEST 4 FAILED:', recentError);
    results.tests.push({
      name: 'Recently Inactive Users Query',
      passed: false,
      error: recentError
    });
  } else {
    console.log(`✅ Found ${recentUsers.length} recently inactive users:`);
    recentUsers.forEach((user, index) => {
      const minutesAgo = (Date.now() - new Date(user.last_seen).getTime()) / 1000 / 60;
      console.log(`   ${index + 1}. ${user.user_email}`);
      console.log(`      last_seen: ${user.last_seen} (${minutesAgo.toFixed(1)} minutes ago)`);
    });
    
    results.tests.push({
      name: 'Recently Inactive Users Query',
      passed: true,
      data: recentUsers
    });
  }
  console.log('');
  
  // TEST 5: Call backend API and compare
  console.log('📋 TEST 5: Backend API Response');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  try {
    const response = await fetch(`https://zwxomzkmncwzwryvudwu.supabase.co/functions/v1/getPresenceByUrl`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${window.supabase.supabaseKey}`
      },
      body: JSON.stringify({
        url: currentPage.pageUrl,
        communities: ['comm-001', 'comm-002']
      })
    });
    
    const apiData = await response.json();
    
    console.log(`✅ Backend API returned ${apiData.active?.length || 0} users:`);
    console.log('API Response:', JSON.stringify(apiData, null, 2));
    
    results.tests.push({
      name: 'Backend API Response',
      passed: true,
      data: apiData
    });
  } catch (error) {
    console.error('❌ TEST 5 FAILED:', error);
    results.tests.push({
      name: 'Backend API Response',
      passed: false,
      error: error.message
    });
  }
  console.log('');
  
  // TEST 6: Check for duplicate records
  console.log('📋 TEST 6: Check for Duplicate Records');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  const { data: duplicates, error: dupError } = await window.supabase
    .rpc('check_duplicate_presence', {
      p_page_id: currentPage.pageId
    });
  
  if (dupError) {
    // RPC might not exist, so let's do it manually
    console.log('⚠️ RPC not available, checking manually...');
    
    const userCounts = {};
    allUsers.forEach(user => {
      userCounts[user.user_email] = (userCounts[user.user_email] || 0) + 1;
    });
    
    const hasDuplicates = Object.values(userCounts).some(count => count > 1);
    
    if (hasDuplicates) {
      console.error('❌ TEST 6 FAILED: Duplicate records found!');
      console.log('User counts:', userCounts);
      results.tests.push({
        name: 'Check for Duplicates',
        passed: false,
        data: userCounts
      });
    } else {
      console.log('✅ No duplicate records found');
      results.tests.push({
        name: 'Check for Duplicates',
        passed: true,
        data: userCounts
      });
    }
  } else {
    console.log('✅ Duplicate check complete:', duplicates);
    results.tests.push({
      name: 'Check for Duplicates',
      passed: true,
      data: duplicates
    });
  }
  console.log('');
  
  // SUMMARY
  console.log('📊 SUMMARY');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  const passedTests = results.tests.filter(t => t.passed).length;
  const totalTests = results.tests.length;
  
  results.summary = {
    totalTests,
    passedTests,
    failedTests: totalTests - passedTests,
    allTestsPassed: passedTests === totalTests
  };
  
  console.log(`Tests passed: ${passedTests}/${totalTests}`);
  
  if (allUsers && recentUsers) {
    const expectedUsers = activeUsers.length + recentUsers.length;
    const actualUsers = results.tests.find(t => t.name === 'Backend API Response')?.data?.active?.length || 0;
    
    console.log('');
    console.log('🔍 ANALYSIS:');
    console.log(`   Database has ${allUsers.length} total records for this page`);
    console.log(`   - ${activeUsers.length} active users`);
    console.log(`   - ${recentUsers.length} recently inactive users`);
    console.log(`   Expected backend to return: ${expectedUsers} users`);
    console.log(`   Backend actually returned: ${actualUsers} users`);
    
    if (expectedUsers !== actualUsers) {
      console.error('');
      console.error('❌❌❌ DISCREPANCY FOUND! ❌❌❌');
      console.error(`Backend is missing ${expectedUsers - actualUsers} users!`);
      console.error('');
      console.error('Possible causes:');
      console.error('1. Backend query logic is filtering out users incorrectly');
      console.error('2. Backend is querying a different page_id');
      console.error('3. Backend has additional filtering logic not shown here');
      console.error('4. Timing issue - records changed between queries');
      
      results.summary.discrepancy = {
        expected: expectedUsers,
        actual: actualUsers,
        missing: expectedUsers - actualUsers
      };
    } else {
      console.log('');
      console.log('✅ Backend response matches database queries!');
    }
  }
  
  console.log('');
  console.log('🔬🔬🔬═══════════════════════════════════════════════════════');
  console.log('🔬🔬🔬 DIAGNOSTIC COMPLETE');
  console.log('🔬🔬🔬═══════════════════════════════════════════════════════');
  console.log('');
  
  return results;
};

console.log('✅ diagnoseLastSeenIssue() loaded! Run it from the console to diagnose the issue.');


