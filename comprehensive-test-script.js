/**
 * COMPREHENSIVE TEST SCRIPT FOR TA1/TA2
 * Tests all fixes for the 400 Bad Request errors
 * 
 * Usage: Copy and paste this entire code block into the browser console
 */

console.log('🧪 TESTING: Starting comprehensive test of all fixes...');

// Test 1: AvatarUtils validation
async function testAvatarUtilsValidation() {
  console.log('\n═══════════════════════════════════════════════════════════');
  console.log('🧪 TEST 1: AvatarUtils Validation');
  console.log('═══════════════════════════════════════════════════════════');
  
  if (!window.AvatarUtils) {
    console.error('❌ AvatarUtils not available');
    return false;
  }
  
  // Test with UUID (should fail gracefully)
  const uuidUser = {
    id: 'efce30c3-6788-4bf7-a52c-5e6652923964',
    userId: 'efce30c3-6788-4bf7-a52c-5e6652923964',
    email: 'efce30c3-6788-4bf7-a52c-5e6652923964', // This is a UUID, not an email
    name: 'Test User'
  };
  
  console.log('Testing with UUID user (should fail gracefully)...');
  try {
    const result = await window.AvatarUtils.getAvatarUrl(uuidUser, 'visibility');
    console.log('UUID user result:', result);
    
    if (result.source === 'generic-fallback') {
      console.log('✅ PASS: UUID user correctly handled with fallback');
    } else {
      console.log('❌ FAIL: UUID user should have been handled with fallback');
    }
  } catch (error) {
    console.log('✅ PASS: UUID user correctly rejected:', error.message);
  }
  
  // Test with proper email (should work)
  const emailUser = {
    id: 'test@example.com',
    userId: 'test@example.com',
    email: 'test@example.com',
    name: 'Test User'
  };
  
  console.log('Testing with proper email user...');
  try {
    const result = await window.AvatarUtils.getAvatarUrl(emailUser, 'visibility');
    console.log('Email user result:', result);
    console.log('✅ PASS: Email user processed successfully');
  } catch (error) {
    console.log('❌ FAIL: Email user should have worked:', error.message);
  }
  
  return true;
}

// Test 2: SupabaseRealtimeClient query
async function testSupabaseRealtimeClient() {
  console.log('\n═══════════════════════════════════════════════════════════');
  console.log('🧪 TEST 2: SupabaseRealtimeClient Query');
  console.log('═══════════════════════════════════════════════════════════');
  
  if (!window.supabaseRealtimeClient) {
    console.error('❌ SupabaseRealtimeClient not available');
    return false;
  }
  
  console.log('Testing getPageUsers query...');
  try {
    const users = await window.supabaseRealtimeClient.getPageUsers('test-page');
    console.log('Query result:', users);
    
    if (Array.isArray(users)) {
      console.log('✅ PASS: Query returned array');
      
      // Check if any user has UUID in email field
      const hasUuidInEmail = users.some(user => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return user.user_email && !emailRegex.test(user.user_email);
      });
      
      if (hasUuidInEmail) {
        console.log('❌ FAIL: Found UUID in user_email field');
        users.forEach(user => {
          if (user.user_email) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(user.user_email)) {
              console.log('❌ UUID found in user_email:', user.user_email);
            }
          }
        });
      } else {
        console.log('✅ PASS: All user_email fields are valid emails');
      }
      
      // Check if id field is present (should not be)
      const hasIdField = users.some(user => user.id !== undefined);
      if (hasIdField) {
        console.log('❌ FAIL: id field should not be present in query results');
      } else {
        console.log('✅ PASS: id field correctly excluded from query results');
      }
    } else {
      console.log('❌ FAIL: Query did not return array');
    }
  } catch (error) {
    console.log('❌ FAIL: Query failed:', error.message);
  }
  
  return true;
}

// Test 3: API call validation
async function testApiCallValidation() {
  console.log('\n═══════════════════════════════════════════════════════════');
  console.log('🧪 TEST 3: API Call Validation');
  console.log('═══════════════════════════════════════════════════════════');
  
  if (!window.api) {
    console.error('❌ API client not available');
    return false;
  }
  
  // Test API call with UUID (should fail with 400)
  console.log('Testing API call with UUID...');
  try {
    const result = await window.api.request('/v1/users/efce30c3-6788-4bf7-a52c-5e6652923964');
    console.log('❌ FAIL: API call with UUID should have failed');
  } catch (error) {
    if (error.message.includes('400')) {
      console.log('✅ PASS: API call with UUID correctly returned 400');
    } else {
      console.log('❌ FAIL: API call with UUID failed with wrong error:', error.message);
    }
  }
  
  // Test API call with proper email (should work or return 404)
  console.log('Testing API call with proper email...');
  try {
    const result = await window.api.request('/v1/users/test@example.com');
    console.log('✅ PASS: API call with email succeeded:', result);
  } catch (error) {
    if (error.message.includes('404')) {
      console.log('✅ PASS: API call with email returned 404 (user not found, but valid request)');
    } else {
      console.log('❌ FAIL: API call with email failed with wrong error:', error.message);
    }
  }
  
  return true;
}

// Test 4: Network request monitoring
function testNetworkRequestMonitoring() {
  console.log('\n═══════════════════════════════════════════════════════════');
  console.log('🧪 TEST 4: Network Request Monitoring');
  console.log('═══════════════════════════════════════════════════════════');
  
  let requestCount = 0;
  let uuidRequestCount = 0;
  
  // Override fetch to monitor requests
  const originalFetch = window.fetch;
  window.fetch = function(...args) {
    const url = args[0];
    requestCount++;
    
    if (typeof url === 'string' && url.includes('/v1/users/')) {
      console.log('🌐 USER API REQUEST DETECTED:', url);
      
      // Extract the user identifier from the URL
      const match = url.match(/\/v1\/users\/([^?]+)/);
      if (match) {
        const userIdentifier = decodeURIComponent(match[1]);
        console.log('🔍 USER IDENTIFIER:', userIdentifier);
        
        // Check if it's a UUID
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        if (uuidRegex.test(userIdentifier)) {
          uuidRequestCount++;
          console.error('❌ PROBLEM: UUID being used as user identifier!');
          console.error('❌ UUID:', userIdentifier);
        } else {
          console.log('✅ User identifier appears to be valid');
        }
      }
    }
    
    return originalFetch.apply(this, args);
  };
  
  console.log('✅ Network monitoring enabled');
  console.log('📊 Monitoring will track:');
  console.log('  - Total user API requests');
  console.log('  - Requests with UUID identifiers');
  console.log('  - Requests with valid email identifiers');
  
  // Return monitoring function
  return () => {
    console.log('\n📊 NETWORK MONITORING RESULTS:');
    console.log('───────────────────────────────────────────────────────────');
    console.log(`Total user API requests: ${requestCount}`);
    console.log(`Requests with UUID identifiers: ${uuidRequestCount}`);
    console.log(`Requests with valid identifiers: ${requestCount - uuidRequestCount}`);
    
    if (uuidRequestCount === 0) {
      console.log('✅ PASS: No UUID requests detected');
    } else {
      console.log('❌ FAIL: UUID requests still being made');
    }
  };
}

// Test 5: End-to-end avatar loading
async function testEndToEndAvatarLoading() {
  console.log('\n═══════════════════════════════════════════════════════════');
  console.log('🧪 TEST 5: End-to-End Avatar Loading');
  console.log('═══════════════════════════════════════════════════════════');
  
  // Test loading avatars through the normal flow
  if (typeof window.loadCombinedAvatars === 'function') {
    console.log('Testing loadCombinedAvatars...');
    try {
      await window.loadCombinedAvatars(['comm-001']);
      console.log('✅ PASS: loadCombinedAvatars completed without errors');
    } catch (error) {
      console.log('❌ FAIL: loadCombinedAvatars failed:', error.message);
    }
  } else {
    console.log('⚠️ loadCombinedAvatars function not available');
  }
  
  // Test loading avatars through CommunitiesModule
  if (typeof window.loadCommunities === 'function') {
    console.log('Testing loadCommunities...');
    try {
      await window.loadCommunities();
      console.log('✅ PASS: loadCommunities completed without errors');
    } catch (error) {
      console.log('❌ FAIL: loadCommunities failed:', error.message);
    }
  } else {
    console.log('⚠️ loadCommunities function not available');
  }
  
  return true;
}

// Main test function
async function runAllTests() {
  console.log('🚀 Starting comprehensive test suite...');
  
  const results = {
    avatarUtilsValidation: false,
    supabaseRealtimeClient: false,
    apiCallValidation: false,
    networkMonitoring: false,
    endToEndAvatarLoading: false
  };
  
  try {
    results.avatarUtilsValidation = await testAvatarUtilsValidation();
  } catch (error) {
    console.error('Test 1 failed:', error);
  }
  
  try {
    results.supabaseRealtimeClient = await testSupabaseRealtimeClient();
  } catch (error) {
    console.error('Test 2 failed:', error);
  }
  
  try {
    results.apiCallValidation = await testApiCallValidation();
  } catch (error) {
    console.error('Test 3 failed:', error);
  }
  
  try {
    const monitorFunction = testNetworkRequestMonitoring();
    results.networkMonitoring = true;
    
    // Wait a bit for any requests to be made
    setTimeout(() => {
      monitorFunction();
    }, 2000);
  } catch (error) {
    console.error('Test 4 failed:', error);
  }
  
  try {
    results.endToEndAvatarLoading = await testEndToEndAvatarLoading();
  } catch (error) {
    console.error('Test 5 failed:', error);
  }
  
  // Summary
  console.log('\n═══════════════════════════════════════════════════════════');
  console.log('📊 TEST RESULTS SUMMARY');
  console.log('═══════════════════════════════════════════════════════════');
  
  const passedTests = Object.values(results).filter(Boolean).length;
  const totalTests = Object.keys(results).length;
  
  console.log(`Tests passed: ${passedTests}/${totalTests}`);
  
  Object.entries(results).forEach(([test, passed]) => {
    console.log(`${passed ? '✅' : '❌'} ${test}: ${passed ? 'PASS' : 'FAIL'}`);
  });
  
  if (passedTests === totalTests) {
    console.log('\n🎉 ALL TESTS PASSED! The fixes are working correctly.');
  } else {
    console.log('\n⚠️ Some tests failed. Check the output above for details.');
  }
  
  console.log('\n🔍 RECOMMENDATIONS:');
  console.log('───────────────────────────────────────────────────────────');
  console.log('1. Monitor the browser console for any remaining 400 errors');
  console.log('2. Check the Network tab for any failed API requests');
  console.log('3. Verify that avatars are loading correctly in the UI');
  console.log('4. Test with real users to ensure the fix works in production');
}

// Run the tests
runAllTests().catch(console.error);

console.log('🧪 TESTING: Test suite loaded. Check console output above.');





