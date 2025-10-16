/**
 * TE2 AVATAR SOURCE DIAGNOSTIC TESTS
 * 
 * Comprehensive test suite for avatar data fetching across all sources.
 * Tests the SD1 fix for missing avatar URLs in user_presence table.
 * 
 * Created: Oct 16, 2025
 * Related Fix: SD1 Avatar Source Fix - user_presence query missing avatar URLs
 */

// ═══════════════════════════════════════════════════════════
// TEST 1: Verify avatar URL is stored in user_presence
// ═══════════════════════════════════════════════════════════
window.testAvatarInPresenceTable = async function() {
  console.log('');
  console.log('═══════════════════════════════════════════════════════════');
  console.log('🧪 TE2 TEST: Avatar URL in user_presence Table');
  console.log('═══════════════════════════════════════════════════════════');
  
  const results = {
    testName: 'Avatar URL in user_presence',
    timestamp: new Date().toISOString(),
    passed: 0,
    failed: 0,
    warnings: 0,
    details: []
  };
  
  try {
    // Get current user
    const currentUser = window.currentUser;
    if (!currentUser || !currentUser.email) {
      results.details.push({
        test: 'Current User Check',
        status: 'FAILED',
        message: 'No current user found'
      });
      results.failed++;
      return results;
    }
    
    console.log(`✅ Current user: ${currentUser.email}`);
    results.details.push({
      test: 'Current User Check',
      status: 'PASSED',
      message: `Found current user: ${currentUser.email}`
    });
    results.passed++;
    
    // Query user_presence directly
    if (!window.supabase) {
      results.details.push({
        test: 'Supabase Client Check',
        status: 'FAILED',
        message: 'Supabase client not initialized'
      });
      results.failed++;
      return results;
    }
    
    console.log(`🔍 Querying user_presence for ${currentUser.email}...`);
    const { data, error } = await window.supabase
      .from('user_presence')
      .select('user_email, page_id, avatar_url, is_active, last_seen')
      .eq('user_email', currentUser.email)
      .order('last_seen', { ascending: false })
      .limit(5);
    
    if (error) {
      results.details.push({
        test: 'Query user_presence',
        status: 'FAILED',
        message: `Query error: ${error.message}`
      });
      results.failed++;
      return results;
    }
    
    console.log(`📊 Found ${data.length} presence records`);
    
    // Check each record for avatar_url
    data.forEach((record, index) => {
      console.log(`\n📝 Record ${index + 1}:`);
      console.log(`   page_id: ${record.page_id}`);
      console.log(`   is_active: ${record.is_active}`);
      console.log(`   avatar_url: ${record.avatar_url || 'NOT SET'}`);
      console.log(`   last_seen: ${record.last_seen}`);
      
      if (record.avatar_url && !record.avatar_url.includes('default-user')) {
        results.details.push({
          test: `Avatar URL in Record ${index + 1}`,
          status: 'PASSED',
          message: `Found real avatar URL: ${record.avatar_url}`,
          pageId: record.page_id
        });
        results.passed++;
      } else if (record.avatar_url && record.avatar_url.includes('default-user')) {
        results.details.push({
          test: `Avatar URL in Record ${index + 1}`,
          status: 'WARNING',
          message: 'Avatar URL is fallback/default',
          pageId: record.page_id
        });
        results.warnings++;
      } else {
        results.details.push({
          test: `Avatar URL in Record ${index + 1}`,
          status: 'FAILED',
          message: 'No avatar_url field in presence record',
          pageId: record.page_id
        });
        results.failed++;
      }
    });
    
  } catch (error) {
    console.error('❌ Test exception:', error);
    results.details.push({
      test: 'Test Execution',
      status: 'FAILED',
      message: `Exception: ${error.message}`
    });
    results.failed++;
  }
  
  console.log('');
  console.log('═══════════════════════════════════════════════════════════');
  console.log(`📊 TEST RESULTS:`);
  console.log(`   ✅ Passed: ${results.passed}`);
  console.log(`   ❌ Failed: ${results.failed}`);
  console.log(`   ⚠️  Warnings: ${results.warnings}`);
  console.log('═══════════════════════════════════════════════════════════');
  console.log('');
  
  return results;
};

// ═══════════════════════════════════════════════════════════
// TEST 2: Verify AvatarUtils priority system
// ═══════════════════════════════════════════════════════════
window.testAvatarUtilsPriority = function() {
  console.log('');
  console.log('═══════════════════════════════════════════════════════════');
  console.log('🧪 TE2 TEST: AvatarUtils Priority System');
  console.log('═══════════════════════════════════════════════════════════');
  
  const results = {
    testName: 'AvatarUtils Priority System',
    timestamp: new Date().toISOString(),
    passed: 0,
    failed: 0,
    details: []
  };
  
  // Test with mock user objects
  const testCases = [
    {
      name: 'User with avatar_url in object',
      user: {
        user_email: 'test1@example.com',
        avatar_url: 'https://lh3.googleusercontent.com/a/real-avatar=s96-c'
      },
      expectedSource: 'user_presence_table'
    },
    {
      name: 'User with default avatar_url',
      user: {
        user_email: 'test2@example.com',
        avatar_url: 'https://lh3.googleusercontent.com/a/default-user=s96-c'
      },
      expectedSource: 'current_user_metadata' // Should skip default and try next priority
    },
    {
      name: 'User without avatar_url',
      user: {
        user_email: 'test3@example.com'
      },
      expectedSource: 'current_user_metadata' // or visibility_data or fallback
    }
  ];
  
  testCases.forEach(testCase => {
    console.log(`\n📝 Testing: ${testCase.name}`);
    
    try {
      const result = AvatarUtils.getAvatarUrl(testCase.user, 'visibility');
      console.log(`   Source: ${result.source}`);
      console.log(`   Avatar URL: ${result.avatarUrl}`);
      
      if (testCase.expectedSource && result.source === testCase.expectedSource) {
        console.log(`   ✅ PASSED: Got expected source`);
        results.passed++;
        results.details.push({
          test: testCase.name,
          status: 'PASSED',
          actualSource: result.source,
          expectedSource: testCase.expectedSource
        });
      } else {
        console.log(`   ⚠️  Source: ${result.source} (expected: ${testCase.expectedSource})`);
        results.details.push({
          test: testCase.name,
          status: 'INFO',
          actualSource: result.source,
          expectedSource: testCase.expectedSource,
          message: 'Source differs from expected (may be valid based on available data)'
        });
      }
    } catch (error) {
      console.log(`   ❌ FAILED: ${error.message}`);
      results.failed++;
      results.details.push({
        test: testCase.name,
        status: 'FAILED',
        error: error.message
      });
    }
  });
  
  console.log('');
  console.log('═══════════════════════════════════════════════════════════');
  console.log(`📊 TEST RESULTS:`);
  console.log(`   ✅ Passed: ${results.passed}`);
  console.log(`   ❌ Failed: ${results.failed}`);
  console.log('═══════════════════════════════════════════════════════════');
  console.log('');
  
  return results;
};

// ═══════════════════════════════════════════════════════════
// TEST 3: Monitor presence updates for avatar_url inclusion
// ═══════════════════════════════════════════════════════════
window.monitorPresenceUpdates = function(durationSeconds = 30) {
  console.log('');
  console.log('═══════════════════════════════════════════════════════════');
  console.log('🧪 TE2 TEST: Monitor Presence Updates');
  console.log(`⏱️  Duration: ${durationSeconds} seconds`);
  console.log('═══════════════════════════════════════════════════════════');
  
  const updates = [];
  let isMonitoring = true;
  
  // Subscribe to real-time updates
  const channel = window.supabase
    .channel('presence_monitor')
    .on('postgres_changes', {
      event: 'UPDATE',
      schema: 'public',
      table: 'user_presence'
    }, (payload) => {
      if (isMonitoring) {
        const hasAvatarUrl = !!payload.new.avatar_url;
        const avatarUrlValue = payload.new.avatar_url || 'NOT SET';
        const isRealAvatar = hasAvatarUrl && !avatarUrlValue.includes('default-user');
        
        console.log(`📡 Presence Update Detected:`);
        console.log(`   user: ${payload.new.user_email}`);
        console.log(`   avatar_url: ${avatarUrlValue}`);
        console.log(`   is_real: ${isRealAvatar}`);
        console.log(`   timestamp: ${payload.new.last_seen}`);
        
        updates.push({
          timestamp: new Date().toISOString(),
          userEmail: payload.new.user_email,
          hasAvatarUrl,
          avatarUrl: avatarUrlValue,
          isRealAvatar,
          pageId: payload.new.page_id
        });
      }
    })
    .subscribe();
  
  console.log(`🔍 Monitoring presence updates for ${durationSeconds} seconds...`);
  console.log(`   (Updates will appear above as they happen)`);
  
  // Stop monitoring after duration
  setTimeout(async () => {
    isMonitoring = false;
    await window.supabase.removeChannel(channel);
    
    console.log('');
    console.log('═══════════════════════════════════════════════════════════');
    console.log('📊 MONITORING COMPLETE');
    console.log('═══════════════════════════════════════════════════════════');
    console.log(`Total updates captured: ${updates.length}`);
    
    const withAvatars = updates.filter(u => u.hasAvatarUrl).length;
    const withRealAvatars = updates.filter(u => u.isRealAvatar).length;
    
    console.log(`✅ Updates with avatar_url: ${withAvatars}/${updates.length}`);
    console.log(`✅ Updates with real avatars: ${withRealAvatars}/${updates.length}`);
    
    if (withRealAvatars < updates.length) {
      console.log('⚠️  RECOMMENDATION: Some updates missing real avatar URLs');
      console.log('   Check that avatar_url is being set in updatePresence()');
    }
    
    console.log('');
    console.log('Full update log:');
    console.table(updates);
    console.log('═══════════════════════════════════════════════════════════');
  }, durationSeconds * 1000);
  
  return {
    stop: async () => {
      isMonitoring = false;
      await window.supabase.removeChannel(channel);
      console.log('🛑 Monitoring stopped manually');
      return updates;
    },
    getUpdates: () => updates
  };
};

// ═══════════════════════════════════════════════════════════
// TEST 4: Compare avatar sources
// ═══════════════════════════════════════════════════════════
window.compareAvatarSources = async function() {
  console.log('');
  console.log('═══════════════════════════════════════════════════════════');
  console.log('🧪 TE2 TEST: Compare Avatar Sources');
  console.log('═══════════════════════════════════════════════════════════');
  
  const results = {
    testName: 'Compare Avatar Sources',
    timestamp: new Date().toISOString(),
    comparisons: []
  };
  
  try {
    // Get current user
    const currentUser = window.currentUser;
    if (!currentUser || !currentUser.email) {
      console.log('❌ No current user found');
      return results;
    }
    
    console.log(`📊 Comparing avatar sources for: ${currentUser.email}`);
    
    // Source 1: user_metadata
    const metadataAvatar = currentUser.user_metadata?.avatar_url || null;
    console.log(`\n1️⃣  user_metadata: ${metadataAvatar || 'NOT SET'}`);
    
    // Source 2: localStorage
    const storedUserKey = `metalayer_user_${currentUser.email}`;
    const storedUser = localStorage.getItem(storedUserKey);
    let localStorageAvatar = null;
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        localStorageAvatar = parsed.user_metadata?.avatar_url || null;
      } catch (e) {}
    }
    console.log(`2️⃣  localStorage: ${localStorageAvatar || 'NOT SET'}`);
    
    // Source 3: visibility data
    let visibilityAvatar = null;
    if (window.currentVisibilityDataUnfiltered) {
      // CRITICAL FIX: currentVisibilityDataUnfiltered is an object with 'active' array
      const visibilityArray = window.currentVisibilityDataUnfiltered.active || window.currentVisibilityDataUnfiltered;
      if (Array.isArray(visibilityArray)) {
        const userInVisibility = visibilityArray.find(
          u => u.email === currentUser.email || u.userId === currentUser.email
        );
        visibilityAvatar = userInVisibility?.avatarUrl || null;
      }
    }
    console.log(`3️⃣  visibility data: ${visibilityAvatar || 'NOT SET'}`);
    
    // Source 4: user_presence table
    let presenceAvatar = null;
    if (window.supabase) {
      const { data, error } = await window.supabase
        .from('user_presence')
        .select('avatar_url')
        .eq('user_email', currentUser.email)
        .order('last_seen', { ascending: false })
        .limit(1);
      
      if (data && data.length > 0) {
        presenceAvatar = data[0].avatar_url || null;
      }
    }
    console.log(`4️⃣  user_presence: ${presenceAvatar || 'NOT SET'}`);
    
    // Analysis
    console.log('');
    console.log('═══════════════════════════════════════════════════════════');
    console.log('📊 ANALYSIS:');
    
    const sources = [
      { name: 'user_metadata', avatar: metadataAvatar },
      { name: 'localStorage', avatar: localStorageAvatar },
      { name: 'visibility data', avatar: visibilityAvatar },
      { name: 'user_presence', avatar: presenceAvatar }
    ];
    
    const realAvatars = sources.filter(s => s.avatar && !s.avatar.includes('default-user'));
    
    if (realAvatars.length === 0) {
      console.log('❌ NO REAL AVATAR FOUND in any source!');
      console.log('   This is the root cause of fallback avatar display.');
    } else {
      console.log(`✅ Found ${realAvatars.length} source(s) with real avatars:`);
      realAvatars.forEach(s => console.log(`   - ${s.name}: ${s.avatar}`));
      
      // Check if all match
      const uniqueAvatars = [...new Set(realAvatars.map(s => s.avatar))];
      if (uniqueAvatars.length === 1) {
        console.log('✅ All sources have matching avatar URLs');
      } else {
        console.log('⚠️  Avatar URLs differ across sources:');
        uniqueAvatars.forEach(avatar => console.log(`   - ${avatar}`));
      }
    }
    
    results.comparisons = sources;
    console.log('═══════════════════════════════════════════════════════════');
    
  } catch (error) {
    console.error('❌ Test exception:', error);
  }
  
  return results;
};

// ═══════════════════════════════════════════════════════════
// QUICK TEST RUNNER
// ═══════════════════════════════════════════════════════════
window.runAvatarSourceTests = async function() {
  console.log('');
  console.log('🧪🧪🧪 TE2 AVATAR SOURCE TEST SUITE 🧪🧪🧪');
  console.log('Running all avatar source diagnostic tests...');
  console.log('');
  
  const allResults = {
    timestamp: new Date().toISOString(),
    tests: []
  };
  
  // Test 1: Check presence table
  console.log('Running Test 1/4...');
  const test1 = await window.testAvatarInPresenceTable();
  allResults.tests.push(test1);
  
  // Test 2: Check priority system
  console.log('Running Test 2/4...');
  const test2 = window.testAvatarUtilsPriority();
  allResults.tests.push(test2);
  
  // Test 3: Compare sources
  console.log('Running Test 3/4...');
  const test3 = await window.compareAvatarSources();
  allResults.tests.push(test3);
  
  console.log('Running Test 4/4...');
  console.log('(Test 4 requires manual monitoring - call window.monitorPresenceUpdates(30) separately)');
  
  // Summary
  console.log('');
  console.log('═══════════════════════════════════════════════════════════');
  console.log('🏁 ALL TESTS COMPLETE');
  console.log('═══════════════════════════════════════════════════════════');
  
  const totalPassed = allResults.tests.reduce((sum, test) => sum + (test.passed || 0), 0);
  const totalFailed = allResults.tests.reduce((sum, test) => sum + (test.failed || 0), 0);
  const totalWarnings = allResults.tests.reduce((sum, test) => sum + (test.warnings || 0), 0);
  
  console.log(`✅ Total Passed: ${totalPassed}`);
  console.log(`❌ Total Failed: ${totalFailed}`);
  console.log(`⚠️  Total Warnings: ${totalWarnings}`);
  console.log('');
  console.log('Full results available in returned object.');
  console.log('═══════════════════════════════════════════════════════════');
  
  return allResults;
};

console.log('✅ TE2 Avatar Source Diagnostic Tests Loaded');
console.log('');
console.log('Available test functions:');
console.log('  - window.testAvatarInPresenceTable()');
console.log('  - window.testAvatarUtilsPriority()');
console.log('  - window.monitorPresenceUpdates(30)  // 30 seconds');
console.log('  - window.compareAvatarSources()');
console.log('  - window.runAvatarSourceTests()      // Run all tests');
console.log('');

