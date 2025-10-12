// Test Suite: Verify All Polling Removed
// Run in browser console: window.testPollingRemoval()

window.testPollingRemoval = async function() {
  console.log('🧪 ========================================');
  console.log('🧪 POLLING REMOVAL TEST SUITE');
  console.log('🧪 ========================================\n');
  
  let passed = 0;
  let failed = 0;
  
  // Test 1: Check for polling intervals
  console.log('📋 Test 1: Verify no polling intervals exist');
  try {
    const hasPresenceInterval = typeof presenceHeartbeatInterval !== 'undefined' && presenceHeartbeatInterval !== null;
    const hasVisibilityInterval = typeof visibleListPollingInterval !== 'undefined' && visibleListPollingInterval !== null;
    const hasPageInterval = typeof window.pageSubscriptionInterval !== 'undefined' && window.pageSubscriptionInterval !== null;
    
    if (!hasPresenceInterval && !hasVisibilityInterval && !hasPageInterval) {
      console.log('✅ PASS: No polling intervals found');
      passed++;
    } else {
      console.error('❌ FAIL: Found polling intervals:');
      if (hasPresenceInterval) console.error('  - presenceHeartbeatInterval');
      if (hasVisibilityInterval) console.error('  - visibleListPollingInterval');
      if (hasPageInterval) console.error('  - pageSubscriptionInterval');
      failed++;
    }
  } catch (error) {
    console.log('✅ PASS: Polling intervals not defined (good!)');
    passed++;
  }
  
  // Test 2: Check RealtimePresenceHandler exists
  console.log('\n📋 Test 2: Verify RealtimePresenceHandler loaded');
  if (window.realtimePresenceHandler) {
    console.log('✅ PASS: RealtimePresenceHandler exists');
    console.log('   isActive:', window.realtimePresenceHandler.isActive);
    console.log('   currentPageId:', window.realtimePresenceHandler.currentPageId);
    passed++;
  } else {
    console.error('❌ FAIL: RealtimePresenceHandler not found');
    failed++;
  }
  
  // Test 3: Check Supabase real-time client
  console.log('\n📋 Test 3: Verify Supabase real-time client');
  if (window.supabaseRealtimeClient) {
    console.log('✅ PASS: Supabase real-time client exists');
    console.log('   isConnected:', window.supabaseRealtimeClient.isConnected);
    console.log('   channels:', window.supabaseRealtimeClient.channels.size);
    passed++;
  } else {
    console.error('❌ FAIL: Supabase real-time client not found');
    failed++;
  }
  
  // Test 4: Check event handlers wired up
  console.log('\n📋 Test 4: Verify event handlers wired up');
  if (window.supabaseRealtimeClient) {
    const hasJoinHandler = typeof window.supabaseRealtimeClient.onUserJoined === 'function';
    const hasLeaveHandler = typeof window.supabaseRealtimeClient.onUserLeft === 'function';
    const hasUpdateHandler = typeof window.supabaseRealtimeClient.onUserUpdated === 'function';
    
    if (hasJoinHandler && hasLeaveHandler && hasUpdateHandler) {
      console.log('✅ PASS: All event handlers wired up');
      console.log('   onUserJoined:', hasJoinHandler);
      console.log('   onUserLeft:', hasLeaveHandler);
      console.log('   onUserUpdated:', hasUpdateHandler);
      passed++;
    } else {
      console.error('❌ FAIL: Missing event handlers:');
      if (!hasJoinHandler) console.error('  - onUserJoined');
      if (!hasLeaveHandler) console.error('  - onUserLeft');
      if (!hasUpdateHandler) console.error('  - onUserUpdated');
      failed++;
    }
  } else {
    console.error('❌ FAIL: Cannot check handlers (client not found)');
    failed++;
  }
  
  // Test 5: Monitor network requests for polling
  console.log('\n📋 Test 5: Monitor network requests (10 second test)');
  console.log('   Monitoring for REST API polling...');
  
  let pollingDetected = false;
  const startTime = Date.now();
  const requestCounts = {};
  
  // Monitor fetch calls
  const originalFetch = window.fetch;
  window.fetch = function(...args) {
    const url = args[0];
    if (typeof url === 'string') {
      if (url.includes('/v1/presence/url') || url.includes('/v1/presence/active')) {
        requestCounts[url] = (requestCounts[url] || 0) + 1;
        if (requestCounts[url] > 1) {
          pollingDetected = true;
          console.warn('⚠️ POLLING DETECTED:', url, 'called', requestCounts[url], 'times');
        }
      }
    }
    return originalFetch.apply(this, args);
  };
  
  // Wait 10 seconds
  await new Promise(resolve => setTimeout(resolve, 10000));
  
  // Restore original fetch
  window.fetch = originalFetch;
  
  if (!pollingDetected) {
    console.log('✅ PASS: No polling detected in 10 seconds');
    passed++;
  } else {
    console.error('❌ FAIL: Polling detected!');
    console.error('   Request counts:', requestCounts);
    failed++;
  }
  
  // Test 6: Check subscriptions
  console.log('\n📋 Test 6: Verify Supabase subscriptions active');
  if (window.supabaseRealtimeClient && window.supabaseRealtimeClient.channels.size > 0) {
    console.log('✅ PASS: Subscriptions active');
    console.log('   Active channels:', window.supabaseRealtimeClient.channels.size);
    for (const [pageId, channel] of window.supabaseRealtimeClient.channels) {
      console.log('   -', pageId, ':', channel.state);
    }
    passed++;
  } else {
    console.error('❌ FAIL: No active subscriptions');
    console.error('   This means real-time updates will NOT work!');
    failed++;
  }
  
  // Final Summary
  console.log('\n🧪 ========================================');
  console.log('🧪 TEST SUMMARY');
  console.log('🧪 ========================================');
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`📊 Total: ${passed + failed}`);
  
  if (failed === 0) {
    console.log('\n🎉 ALL TESTS PASSED! Polling completely removed!');
    console.log('💡 Real-time updates should work instantly now.');
  } else {
    console.log('\n⚠️ SOME TESTS FAILED. Please review above.');
  }
  
  console.log('\n💡 Additional diagnostics:');
  console.log('   window.realtimeDiagnostics.fullReport()');
  console.log('   window.realtimeDiagnostics.performanceTest()');
  
  return { passed, failed, total: passed + failed };
};

console.log('✅ Polling removal test suite loaded!');
console.log('💡 Run: window.testPollingRemoval()');

