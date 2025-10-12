// Comprehensive Real-time Test Suite
// Runs all real-time tests and generates a complete report
// Run in browser console: window.runRealtimeTests()

window.runRealtimeTests = async function() {
  console.log('🧪 ══════════════════════════════════════════════════════');
  console.log('🧪 COMPREHENSIVE REAL-TIME TEST SUITE');
  console.log('🧪 Chrome Extension - Supabase Real-time Verification');
  console.log('🧪 ══════════════════════════════════════════════════════\n');
  
  const startTime = performance.now();
  const allResults = {
    passed: 0,
    failed: 0,
    warnings: 0,
    testSuites: []
  };
  
  // ===== TEST SUITE 1: Polling Removal =====
  console.log('┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓');
  console.log('┃ TEST SUITE 1: Polling Removal Verification        ┃');
  console.log('┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛\n');
  
  if (typeof window.testPollingRemoval !== 'undefined' && window.testPollingRemoval.runTests) {
    try {
      const pollingResults = await window.testPollingRemoval.runTests();
      allResults.testSuites.push({
        name: 'Polling Removal',
        status: 'completed',
        results: pollingResults
      });
      if (pollingResults.passed) allResults.passed += pollingResults.passed;
      if (pollingResults.failed) allResults.failed += pollingResults.failed;
      if (pollingResults.warnings) allResults.warnings += pollingResults.warnings;
    } catch (error) {
      console.error('❌ Error running polling removal tests:', error);
      allResults.failed++;
      allResults.testSuites.push({
        name: 'Polling Removal',
        status: 'error',
        error: error.message
      });
    }
  } else {
    console.warn('⚠️  WARNING: testPollingRemoval not found, skipping...');
    allResults.warnings++;
    allResults.testSuites.push({
      name: 'Polling Removal',
      status: 'skipped',
      reason: 'test suite not loaded'
    });
  }
  
  // ===== TEST SUITE 2: Supabase Real-time Diagnostics =====
  console.log('\n┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓');
  console.log('┃ TEST SUITE 2: Supabase Real-time Diagnostics      ┃');
  console.log('┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛\n');
  
  if (typeof window.realtimeDiagnostics !== 'undefined') {
    try {
      // Run full diagnostics report
      console.log('📊 Running full diagnostics report...\n');
      const diagnostics = await window.realtimeDiagnostics.fullReport();
      
      allResults.testSuites.push({
        name: 'Real-time Diagnostics',
        status: 'completed',
        diagnostics: diagnostics
      });
      allResults.passed++;
      
      // Test subscriptions
      console.log('\n📋 Testing Supabase subscriptions...\n');
      const subTest = await window.realtimeDiagnostics.testSubscriptions();
      if (subTest && subTest.status === 'healthy') {
        allResults.passed++;
      } else {
        allResults.failed++;
      }
    } catch (error) {
      console.error('❌ Error running real-time diagnostics:', error);
      allResults.failed++;
      allResults.testSuites.push({
        name: 'Real-time Diagnostics',
        status: 'error',
        error: error.message
      });
    }
  } else {
    console.warn('⚠️  WARNING: realtimeDiagnostics not found, skipping...');
    allResults.warnings++;
    allResults.testSuites.push({
      name: 'Real-time Diagnostics',
      status: 'skipped',
      reason: 'diagnostics not loaded'
    });
  }
  
  // ===== TEST SUITE 3: Aura Changes =====
  console.log('\n┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓');
  console.log('┃ TEST SUITE 3: Aura Changes Real-time              ┃');
  console.log('┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛\n');
  
  if (typeof window.testAuraChanges !== 'undefined' && window.testAuraChanges.testAll) {
    try {
      const auraResults = await window.testAuraChanges.testAll();
      allResults.testSuites.push({
        name: 'Aura Changes',
        status: 'completed',
        results: auraResults
      });
      if (auraResults.passed) allResults.passed += auraResults.passed;
      if (auraResults.failed) allResults.failed += auraResults.failed;
      if (auraResults.warnings) allResults.warnings += auraResults.warnings;
    } catch (error) {
      console.error('❌ Error running aura change tests:', error);
      allResults.failed++;
      allResults.testSuites.push({
        name: 'Aura Changes',
        status: 'error',
        error: error.message
      });
    }
  } else {
    console.warn('⚠️  WARNING: testAuraChanges not found, skipping...');
    allResults.warnings++;
    allResults.testSuites.push({
      name: 'Aura Changes',
      status: 'skipped',
      reason: 'test suite not loaded'
    });
  }
  
  // ===== TEST SUITE 4: Notifications =====
  console.log('\n┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓');
  console.log('┃ TEST SUITE 4: Notifications System                ┃');
  console.log('┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛\n');
  
  if (typeof window.testNotifications !== 'undefined' && window.testNotifications.testAll) {
    try {
      const notifResults = await window.testNotifications.testAll();
      allResults.testSuites.push({
        name: 'Notifications',
        status: 'completed',
        results: notifResults
      });
      if (notifResults.passed) allResults.passed += notifResults.passed;
      if (notifResults.failed) allResults.failed += notifResults.failed;
      if (notifResults.warnings) allResults.warnings += notifResults.warnings;
    } catch (error) {
      console.error('❌ Error running notification tests:', error);
      allResults.failed++;
      allResults.testSuites.push({
        name: 'Notifications',
        status: 'error',
        error: error.message
      });
    }
  } else {
    console.warn('⚠️  WARNING: testNotifications not found, skipping...');
    allResults.warnings++;
    allResults.testSuites.push({
      name: 'Notifications',
      status: 'skipped',
      reason: 'test suite not loaded'
    });
  }
  
  // ===== FINAL REPORT =====
  const totalTime = performance.now() - startTime;
  
  console.log('\n\n🧪 ══════════════════════════════════════════════════════');
  console.log('🧪 COMPREHENSIVE TEST RESULTS');
  console.log('🧪 ══════════════════════════════════════════════════════\n');
  
  console.log('📊 Overall Statistics:');
  console.log('─────────────────────────────────────────────────────────');
  console.log(`  ✅ Passed:   ${allResults.passed}`);
  console.log(`  ❌ Failed:   ${allResults.failed}`);
  console.log(`  ⚠️  Warnings: ${allResults.warnings}`);
  console.log(`  ⏱️  Duration: ${(totalTime / 1000).toFixed(2)}s`);
  console.log('─────────────────────────────────────────────────────────\n');
  
  console.log('📋 Test Suite Summary:');
  console.log('─────────────────────────────────────────────────────────');
  allResults.testSuites.forEach((suite, i) => {
    const icon = suite.status === 'completed' ? '✅' : 
                 suite.status === 'error' ? '❌' : 
                 suite.status === 'skipped' ? '⏭️' : '❓';
    console.log(`  ${i+1}. ${icon} ${suite.name}: ${suite.status}`);
    if (suite.error) {
      console.log(`     Error: ${suite.error}`);
    }
    if (suite.reason) {
      console.log(`     Reason: ${suite.reason}`);
    }
  });
  console.log('─────────────────────────────────────────────────────────\n');
  
  // Overall verdict
  if (allResults.failed === 0 && allResults.warnings === 0) {
    console.log('✅ ALL TESTS PASSED - Real-time system is healthy!');
  } else if (allResults.failed === 0 && allResults.warnings > 0) {
    console.log('⚠️  ALL TESTS PASSED WITH WARNINGS - Review warnings above');
  } else {
    console.log('❌ SOME TESTS FAILED - Review failures above');
    console.log('\n🔧 Recommended Actions:');
    
    // Check specific failures and provide recommendations
    const failedSuites = allResults.testSuites.filter(s => s.status === 'error' || 
      (s.results && s.results.failed > 0));
    
    failedSuites.forEach(suite => {
      console.log(`\n  📌 ${suite.name}:`);
      if (suite.name === 'Aura Changes') {
        console.log('     - Remove chrome.storage.onChanged listener for auraColorChange');
        console.log('     - Remove chrome.runtime.onMessage handler for AURA_COLOR_CHANGED');
        console.log('     - Use only Supabase real-time path');
      } else if (suite.name === 'Notifications') {
        console.log('     - Add postgres_changes subscription for notifications table');
        console.log('     - Implement handleNotificationReceived() in supabase-realtime-client.js');
        console.log('     - Create notifications table in Supabase');
      } else if (suite.name === 'Polling Removal') {
        console.log('     - Remove messagePollingInterval and related functions');
        console.log('     - Verify no setInterval calls are fetching data');
      }
    });
  }
  
  console.log('\n🧪 ══════════════════════════════════════════════════════');
  console.log('🧪 END OF COMPREHENSIVE TEST SUITE');
  console.log('🧪 ══════════════════════════════════════════════════════\n');
  
  // Store results in window for later access
  window.lastTestResults = {
    timestamp: new Date().toISOString(),
    results: allResults,
    duration: totalTime
  };
  
  console.log('💾 Results saved to window.lastTestResults');
  console.log('   Access with: console.log(window.lastTestResults)');
  
  return allResults;
};

// Auto-run on load if URL parameter present
if (window.location.search.includes('runTests=true')) {
  console.log('🚀 Auto-running tests (URL parameter detected)...');
  window.addEventListener('load', () => {
    setTimeout(() => window.runRealtimeTests(), 2000);
  });
}

console.log('✅ Comprehensive real-time test suite loaded');
console.log('   Run: window.runRealtimeTests()');
console.log('   Or add ?runTests=true to URL for auto-run');

