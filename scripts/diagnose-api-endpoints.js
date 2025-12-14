// API Endpoints Diagnostic Script
// Tests the fixed preferences and reactions APIs
// Run this in browser console on the canopi app

console.log('🔍 API ENDPOINTS DIAGNOSTIC - Testing fixed endpoints');

// Test data - replace with real user/message IDs from your session
const testUserId = 'test-user-id'; // Replace with actual UUID
const testMessageId = 'b9f20f22-9251-46de-906f-c0aece519ed1'; // Use one from the error logs

// Test 1: Preferences API
async function testPreferencesAPI() {
  console.log('\n📋 Testing Preferences API: /v1/users/preferences');

  try {
    const response = await fetch('/v1/users/preferences', {
      method: 'GET',
      headers: {
        'x-user-id': testUserId,
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();

    console.log(`Status: ${response.status}`);
    console.log('Response:', data);

    if (response.status === 200 && data.success) {
      console.log('✅ Preferences API: SUCCESS');
      return true;
    } else {
      console.log('❌ Preferences API: FAILED');
      return false;
    }
  } catch (error) {
    console.error('❌ Preferences API: ERROR', error);
    return false;
  }
}

// Test 2: Reactions API with URL parameter (correct format)
async function testReactionsAPI() {
  console.log('\n😀 Testing Reactions API: /v1/reactions/' + testMessageId);

  try {
    const response = await fetch('/v1/reactions/' + testMessageId, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();

    console.log(`Status: ${response.status}`);
    console.log('Response:', data);

    if (response.status === 200 && data.success !== undefined) {
      console.log('✅ Reactions API (URL param): SUCCESS');
      return true;
    } else {
      console.log('❌ Reactions API (URL param): FAILED');
      return false;
    }
  } catch (error) {
    console.error('❌ Reactions API (URL param): ERROR', error);
    return false;
  }
}

// Run all tests
async function runAllTests() {
  console.log('🚀 Starting API Endpoint Diagnostics...\n');

  const results = await Promise.all([
    testPreferencesAPI(),
    testReactionsAPI()
  ]);

  const passed = results.filter(r => r).length;
  const total = results.length;

  console.log(`\n📊 RESULTS: ${passed}/${total} tests passed`);

  if (passed === total) {
    console.log('🎉 ALL API ENDPOINTS WORKING CORRECTLY!');
  } else {
    console.log('⚠️  SOME API ENDPOINTS STILL HAVE ISSUES');
  }

  return { passed, total, results };
}

// Make functions available globally for manual testing
window.testPreferencesAPI = testPreferencesAPI;
window.testReactionsAPI = testReactionsAPI;
window.runAllTests = runAllTests;

// Auto-run tests
runAllTests();


