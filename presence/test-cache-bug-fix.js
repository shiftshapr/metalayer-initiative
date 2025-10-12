// TE2: Comprehensive Test Suite for Cache Bug Fix
// This tests the page_id normalization and ensures no triple underscores

window.testCacheBugFix = async function() {
  console.log('🧪 TE2: === CACHE BUG FIX TEST SUITE ===');
  console.log('🧪 TE2: Testing URL normalization and cache invalidation...');
  console.log('');
  
  // Test 1: Check current cached page_id
  console.log('🧪 TE2: TEST 1 - Check Current Cached PageId');
  console.log(`   Current pageId: ${window.currentPageId}`);
  console.log(`   Current normalizedUrl: ${window.currentNormalizedUrl}`);
  console.log(`   Current rawUrl: ${window.currentRawUrl}`);
  
  if (window.currentPageId && window.currentPageId.includes('___')) {
    console.error('   ❌ FAIL: Cache contains triple underscores!');
    console.error('   ❌ FAIL: This will cause page_id mismatch!');
  } else if (window.currentPageId && window.currentPageId.includes('_')) {
    console.log('   ✅ PASS: Cache uses single underscores (correct)');
  } else {
    console.log('   ⚠️  WARN: No page_id cached yet');
  }
  console.log('');
  
  // Test 2: Force normalization and check result
  console.log('🧪 TE2: TEST 2 - Force URL Normalization');
  const urlData = await normalizeCurrentUrl();
  console.log(`   Normalized pageId: ${urlData.pageId}`);
  console.log(`   Normalized URL: ${urlData.normalizedUrl}`);
  console.log(`   Raw URL: ${urlData.rawUrl}`);
  
  if (urlData.pageId.includes('___')) {
    console.error('   ❌ FAIL: Normalization returned triple underscores!');
    console.error('   ❌ FAIL: Backend normalization is broken!');
  } else {
    console.log('   ✅ PASS: Normalization uses single underscores');
  }
  
  // Count underscores
  const underscoreCount = (urlData.pageId.match(/_/g) || []).length;
  const tripleUnderscoreCount = (urlData.pageId.match(/___/g) || []).length;
  console.log(`   Total underscores: ${underscoreCount}`);
  console.log(`   Triple underscores: ${tripleUnderscoreCount}`);
  console.log('');
  
  // Test 3: Check if backend and frontend agree
  console.log('🧪 TE2: TEST 3 - Backend/Frontend PageId Agreement');
  try {
    const response = await fetch(`${METALAYER_API_URL}/v1/presence/normalize-url`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: urlData.rawUrl })
    });
    const backendResult = await response.json();
    
    console.log(`   Frontend pageId: ${urlData.pageId}`);
    console.log(`   Backend pageId:  ${backendResult.pageId}`);
    
    if (urlData.pageId === backendResult.pageId) {
      console.log('   ✅ PASS: Frontend and backend agree on page_id!');
    } else {
      console.error('   ❌ FAIL: Frontend and backend DISAGREE on page_id!');
      console.error('   ❌ FAIL: This will cause avatar/visibility issues!');
    }
  } catch (error) {
    console.error('   ❌ ERROR: Could not test backend agreement:', error.message);
  }
  console.log('');
  
  // Test 4: Check Supabase records
  console.log('🧪 TE2: TEST 4 - Supabase User Presence Records');
  try {
    const user = await getCurrentUserEmail();
    if (!user) {
      console.error('   ❌ ERROR: No authenticated user');
      return;
    }
    
    const { data, error } = await window.supabase
      .from('user_presence')
      .select('*')
      .eq('user_email', user);
    
    if (error) {
      console.error('   ❌ ERROR: Could not query Supabase:', error.message);
    } else {
      console.log(`   Found ${data.length} presence records for ${user}`);
      data.forEach((record, index) => {
        const hasBadPageId = record.page_id.includes('___');
        console.log(`   Record ${index + 1}:`);
        console.log(`     page_id: ${record.page_id}`);
        console.log(`     last_seen: ${record.last_seen}`);
        console.log(`     enter_time: ${record.enter_time}`);
        console.log(`     is_active: ${record.is_active}`);
        
        if (hasBadPageId) {
          console.error(`     ❌ FAIL: Has triple underscores!`);
        } else {
          console.log(`     ✅ PASS: Uses single underscores`);
        }
      });
    }
  } catch (error) {
    console.error('   ❌ ERROR: Could not check Supabase records:', error.message);
  }
  console.log('');
  
  // Test 5: Check backend API response
  console.log('🧪 TE2: TEST 5 - Backend API Avatar Response');
  try {
    const user = await authManager.getCurrentUser();
    const response = await fetch(`${METALAYER_API_URL}/v1/presence/url?uri=${encodeURIComponent(urlData.normalizedUrl)}`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${user?.email || 'none'}`
      }
    });
    
    if (!response.ok) {
      console.error(`   ❌ ERROR: API returned ${response.status}`);
    } else {
      const result = await response.json();
      console.log(`   Found ${result.active?.length || 0} active users`);
      
      if (result.active && result.active.length > 0) {
        result.active.forEach((avatar, index) => {
          const isRealGoogleAvatar = avatar.avatarUrl && (
            avatar.avatarUrl.includes('googleusercontent.com') ||
            avatar.avatarUrl.includes('lh3.google')
          );
          const isFakeAvatar = avatar.avatarUrl && avatar.avatarUrl.includes('ui-avatars.com');
          const hasGenericAura = avatar.auraColor === '#45B7D1';
          
          console.log(`   User ${index + 1}: ${avatar.name}`);
          console.log(`     avatarUrl: ${avatar.avatarUrl}`);
          console.log(`     auraColor: ${avatar.auraColor}`);
          console.log(`     enterTime: ${avatar.enterTime}`);
          
          if (isFakeAvatar) {
            console.error(`     ❌ FAIL: Using fake ui-avatars.com URL!`);
          } else if (isRealGoogleAvatar) {
            console.log(`     ✅ PASS: Using real Google avatar`);
          } else {
            console.warn(`     ⚠️  WARN: Unknown avatar source`);
          }
          
          if (hasGenericAura) {
            console.error(`     ❌ FAIL: Using generic fallback aura color!`);
          } else {
            console.log(`     ✅ PASS: Using user-specific aura color`);
          }
        });
      } else {
        console.error('   ❌ FAIL: No active users returned by API!');
        console.error('   ❌ FAIL: This means page_id mismatch persists!');
      }
    }
  } catch (error) {
    console.error('   ❌ ERROR: Could not test backend API:', error.message);
  }
  console.log('');
  
  console.log('🧪 TE2: === TEST SUITE COMPLETE ===');
  console.log('');
  console.log('📋 RECOMMENDATIONS:');
  console.log('   1. If any tests FAIL, hard refresh the Chrome extension');
  console.log('   2. Wait 5-10 seconds after refresh for heartbeats to create new records');
  console.log('   3. Run this test again to verify fix');
  console.log('   4. Check visibility tab to confirm avatars and timing');
};

// Test function for backend health check
window.checkBackendHealth = async function() {
  console.log('🏥 TE2: === BACKEND HEALTH CHECK ===');
  
  try {
    const response = await fetch(`${METALAYER_API_URL}/health`);
    const health = await response.json();
    
    console.log('Backend Health:', health);
    console.log('');
    
    // Check uptime
    const uptimeDays = health.uptimeDays || 0;
    const uptimeHours = Math.floor((health.uptime || 0) / 3600);
    const uptimeMinutes = Math.floor(((health.uptime || 0) % 3600) / 60);
    
    console.log(`📊 Server Info:`);
    console.log(`   Version: ${health.version}`);
    console.log(`   Started: ${health.startTime}`);
    console.log(`   Uptime: ${uptimeDays}d ${uptimeHours}h ${uptimeMinutes}m`);
    console.log(`   Node.js: ${health.nodeVersion}`);
    console.log('');
    
    // Warning if uptime is too old
    if (uptimeDays > 1) {
      console.warn(`⚠️  WARNING: Backend has been running for ${uptimeDays} days`);
      console.warn(`⚠️  WARNING: Server may have stale code cached in memory`);
      console.warn(`⚠️  WARNING: Consider restarting if recent code changes were deployed`);
    } else if (uptimeHours < 1) {
      console.log(`✅ Backend was recently restarted (${uptimeMinutes}m ago)`);
      console.log(`✅ Code should be fresh`);
    } else {
      console.log(`✅ Backend uptime is reasonable (${uptimeHours}h)`);
    }
    console.log('');
    
    // Check expected version
    const EXPECTED_VERSION = '1.2.4-urlnorm-fix';
    if (health.version !== EXPECTED_VERSION) {
      console.error(`❌ VERSION MISMATCH!`);
      console.error(`   Backend version: ${health.version}`);
      console.error(`   Expected version: ${EXPECTED_VERSION}`);
      console.error(`   Backend needs restart!`);
    } else {
      console.log(`✅ Backend version matches expected: ${EXPECTED_VERSION}`);
    }
    
  } catch (error) {
    console.error('❌ ERROR: Could not check backend health:', error.message);
  }
  
  console.log('🏥 TE2: === HEALTH CHECK COMPLETE ===');
};

console.log('✅ TE2: Test suite loaded.');
console.log('📋 Available commands:');
console.log('   • window.testCacheBugFix() - Full cache bug test suite');
console.log('   • window.checkBackendHealth() - Check backend version and uptime');

