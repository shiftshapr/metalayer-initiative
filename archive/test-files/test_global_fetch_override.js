/**
 * Comprehensive Global Fetch Override Test Script
 * Run this in the browser console to test global fetch redirection
 */

async function testGlobalFetchOverride() {
  console.log('🧪 Testing global fetch override...');
  
  // Test 1: Check if fetch is overridden
  console.log('\n🔍 Test 1: Fetch override check');
  if (window.fetch.toString().includes('COMP_API_FIX')) {
    console.log('✅ Global fetch is overridden with COMP_API_FIX');
  } else {
    console.log('❌ Global fetch is NOT overridden');
    console.log('Current fetch:', window.fetch.toString().substring(0, 100) + '...');
  }
  
  // Test 2: Test relative URL redirection
  console.log('\n🔍 Test 2: Relative URL redirection');
  const relativeTests = [
    '/v1/reactions/test-message-123',
    '/v1/reactions',
    '/communities/test',
    '/avatars/test'
  ];
  
  for (const url of relativeTests) {
    try {
      console.log(`📡 Testing relative URL: ${url}`);
      const response = await fetch(url, { method: 'GET' });
      console.log(`✅ ${url}: ${response.status} - ${response.url}`);
      
      if (response.url.includes('216.238.91.120:3002')) {
        console.log('✅ SUCCESS: Redirected to VPS server');
      } else {
        console.log('❌ FAILURE: Not redirected to VPS server');
      }
    } catch (error) {
      console.log(`❌ ${url}: ${error.message}`);
    }
  }
  
  // Test 3: Test api.themetalayer.org redirection
  console.log('\n🔍 Test 3: api.themetalayer.org redirection');
  try {
    const apiUrl = 'https://api.themetalayer.org/v1/presence/event';
    console.log(`📡 Testing api.themetalayer.org: ${apiUrl}`);
    const response = await fetch(apiUrl, { method: 'POST', body: '{}' });
    console.log(`✅ api.themetalayer.org: ${response.status} - ${response.url}`);
    
    if (response.url.includes('216.238.91.120:3002')) {
      console.log('✅ SUCCESS: Redirected to VPS server');
    } else {
      console.log('❌ FAILURE: Not redirected to VPS server');
    }
  } catch (error) {
    console.log(`❌ api.themetalayer.org: ${error.message}`);
  }
  
  // Test 4: Test CanopiModule specific patterns
  console.log('\n🔍 Test 4: CanopiModule specific patterns');
  const canopiPatterns = [
    '/v1/reactions/43dbb2d7-669e-464b-a227-38afb063492d',
    '/v1/reactions/1b9b2b39-e168-44e7-baeb-dbbfb8df677d',
    '/v1/reactions/12c72d07-ec8e-4e66-a372-0f975a71baa2'
  ];
  
  for (const pattern of canopiPatterns) {
    try {
      console.log(`📡 Testing CanopiModule pattern: ${pattern}`);
      const response = await fetch(pattern, { method: 'GET' });
      console.log(`✅ ${pattern}: ${response.status} - ${response.url}`);
      
      if (response.url.includes('216.238.91.120:3002')) {
        console.log('✅ SUCCESS: Redirected to VPS server');
      } else {
        console.log('❌ FAILURE: Not redirected to VPS server');
      }
    } catch (error) {
      console.log(`❌ ${pattern}: ${error.message}`);
    }
  }
  
  // Test 5: Test non-API URLs (should not be redirected)
  console.log('\n🔍 Test 5: Non-API URLs (should not be redirected)');
  const nonApiTests = [
    'https://www.google.com',
    'https://www.googleapis.com/oauth2/v2/userinfo',
    '/some/local/path'
  ];
  
  for (const url of nonApiTests) {
    try {
      console.log(`📡 Testing non-API URL: ${url}`);
      const response = await fetch(url, { method: 'GET' });
      console.log(`✅ ${url}: ${response.status} - ${response.url}`);
      
      if (response.url.includes('216.238.91.120:3002')) {
        console.log('❌ UNEXPECTED: Non-API URL redirected to VPS server');
      } else {
        console.log('✅ SUCCESS: Non-API URL not redirected (as expected)');
      }
    } catch (error) {
      console.log(`✅ ${url}: ${error.message} (expected for non-API URLs)`);
    }
  }
  
  console.log('\n📊 Test Summary:');
  console.log('- Check console logs above for individual test results');
  console.log('- All /v1/ API calls should be redirected to http://216.238.91.120:3002');
  console.log('- api.themetalayer.org calls should be redirected to VPS server');
  console.log('- Non-API URLs should NOT be redirected');
  console.log('- No more ERR_FILE_NOT_FOUND errors should occur');
}

// Run the tests
testGlobalFetchOverride();

