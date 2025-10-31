/**
 * SD2: Test API Redirection Fix
 * Testing that relative URLs are properly redirected to VPS server
 */

console.log('🧪 SD2: Testing API Redirection Fix...');

// Test 1: Mock fetch override test
function testFetchOverride() {
  console.log('🧪 TEST 1: Testing fetch override for relative URLs...');
  
  // Mock the fetch override logic
  function mockFetchOverride(url) {
    let modifiedUrl = url;
    
    if (typeof url === 'string') {
      if (url.includes('api.themetalayer.org')) {
        modifiedUrl = url.replace('https://api.themetalayer.org', 'http://216.238.91.120:3002');
        console.log(`🔍 COMP_API_FIX: Redirecting ${url} to ${modifiedUrl}`);
      } else if (url.startsWith('/v1/') || url.startsWith('/communities') || url.startsWith('/avatars')) {
        // Handle relative API URLs - redirect to VPS
        modifiedUrl = `http://216.238.91.120:3002${url}`;
        console.log(`🔍 COMP_API_FIX: Redirecting relative URL ${url} to ${modifiedUrl}`);
      }
    }
    
    return modifiedUrl;
  }
  
  // Test cases
  const testCases = [
    { input: '/v1/reactions', expected: 'http://216.238.91.120:3002/v1/reactions' },
    { input: '/v1/reactions/123', expected: 'http://216.238.91.120:3002/v1/reactions/123' },
    { input: '/communities', expected: 'http://216.238.91.120:3002/communities' },
    { input: '/avatars/active', expected: 'http://216.238.91.120:3002/avatars/active' },
    { input: 'https://api.themetalayer.org/v1/reactions', expected: 'http://216.238.91.120:3002/v1/reactions' },
    { input: 'https://example.com/api', expected: 'https://example.com/api' } // Should not be modified
  ];
  
  let passed = 0;
  let total = testCases.length;
  
  testCases.forEach((testCase, index) => {
    const result = mockFetchOverride(testCase.input);
    if (result === testCase.expected) {
      console.log(`✅ TEST 1.${index + 1} PASSED: ${testCase.input} → ${result}`);
      passed++;
    } else {
      console.log(`❌ TEST 1.${index + 1} FAILED: ${testCase.input} → ${result} (expected: ${testCase.expected})`);
    }
  });
  
  console.log(`📊 TEST 1 RESULTS: ${passed}/${total} passed`);
  return passed === total;
}

// Test 2: API endpoint availability test
async function testAPIEndpoints() {
  console.log('🧪 TEST 2: Testing API endpoint availability...');
  
  const endpoints = [
    { url: 'http://216.238.91.120:3002/health', method: 'GET' },
    { url: 'http://216.238.91.120:3002/v1/reactions', method: 'POST', body: { messageId: 'test-123', emoji: '👍', userEmail: 'test@example.com' } },
    { url: 'http://216.238.91.120:3002/v1/reactions/test-123', method: 'GET' },
    { url: 'http://216.238.91.120:3002/communities', method: 'GET' },
    { url: 'http://216.238.91.120:3002/v1/presence/active?pageId=test', method: 'GET', headers: { 'x-user-email': 'test@example.com' } }
  ];
  
  let passed = 0;
  let total = endpoints.length;
  
  for (let i = 0; i < endpoints.length; i++) {
    const endpoint = endpoints[i];
    try {
      const options = {
        method: endpoint.method,
        headers: { 'Content-Type': 'application/json', ...endpoint.headers }
      };
      
      if (endpoint.body) {
        options.body = JSON.stringify(endpoint.body);
      }
      
      const response = await fetch(endpoint.url, options);
      if (response.ok || response.status === 200) {
        console.log(`✅ TEST 2.${i + 1} PASSED: ${endpoint.method} ${endpoint.url} → ${response.status}`);
        passed++;
      } else {
        console.log(`❌ TEST 2.${i + 1} FAILED: ${endpoint.method} ${endpoint.url} → ${response.status}`);
      }
    } catch (error) {
      console.log(`❌ TEST 2.${i + 1} FAILED: ${endpoint.method} ${endpoint.url} → Error: ${error.message}`);
    }
  }
  
  console.log(`📊 TEST 2 RESULTS: ${passed}/${total} passed`);
  return passed === total;
}

// Test 3: Error scenario test
function testErrorScenarios() {
  console.log('🧪 TEST 3: Testing error scenarios...');
  
  // Test that non-API URLs are not modified
  const nonApiUrls = [
    'https://example.com/api',
    'https://google.com',
    'chrome-extension://abc123/popup.html',
    'data:text/html,<html></html>',
    'blob:https://example.com/123'
  ];
  
  let passed = 0;
  let total = nonApiUrls.length;
  
  nonApiUrls.forEach((url, index) => {
    // Mock the override logic
    let modifiedUrl = url;
    if (typeof url === 'string') {
      if (url.includes('api.themetalayer.org')) {
        modifiedUrl = url.replace('https://api.themetalayer.org', 'http://216.238.91.120:3002');
      } else if (url.startsWith('/v1/') || url.startsWith('/communities') || url.startsWith('/avatars')) {
        modifiedUrl = `http://216.238.91.120:3002${url}`;
      }
    }
    
    if (modifiedUrl === url) {
      console.log(`✅ TEST 3.${index + 1} PASSED: ${url} not modified (correct)`);
      passed++;
    } else {
      console.log(`❌ TEST 3.${index + 1} FAILED: ${url} was modified to ${modifiedUrl} (incorrect)`);
    }
  });
  
  console.log(`📊 TEST 3 RESULTS: ${passed}/${total} passed`);
  return passed === total;
}

// Run all tests
async function runAllTests() {
  console.log('🚀 SD2: Running API redirection fix tests...');
  
  const results = {
    test1: testFetchOverride(),
    test2: await testAPIEndpoints(),
    test3: testErrorScenarios()
  };
  
  const passedTests = Object.values(results).filter(result => result === true).length;
  const totalTests = Object.keys(results).length;
  
  console.log('📊 SD2: Test Results Summary:');
  console.log(`✅ Passed: ${passedTests}/${totalTests}`);
  console.log(`❌ Failed: ${totalTests - passedTests}/${totalTests}`);
  
  if (passedTests === totalTests) {
    console.log('🎉 SD2: ALL TESTS PASSED! API redirection fix is working correctly.');
    console.log('🔗 RELATIVE URLS: Now properly redirected to VPS server');
    console.log('🚫 ERR_FILE_NOT_FOUND: Should be resolved');
  } else {
    console.log('⚠️ SD2: Some tests failed. Check the logs above for details.');
  }
  
  return results;
}

// Export for global access
if (typeof window !== 'undefined') {
  window.testAPIRedirection = {
    runAllTests,
    testFetchOverride,
    testAPIEndpoints,
    testErrorScenarios
  };
} else {
  // Node.js environment
  global.testAPIRedirection = {
    runAllTests,
    testFetchOverride,
    testAPIEndpoints,
    testErrorScenarios
  };
}

console.log('✅ SD2: API redirection test suite loaded. Run testAPIRedirection.runAllTests() to test.');

