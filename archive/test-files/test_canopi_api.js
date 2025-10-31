/**
 * Comprehensive CanopiModule API Test Script
 * Run this in the browser console to test CanopiModule API calls
 */

async function testCanopiModuleAPI() {
  console.log('🧪 Testing CanopiModule API calls...');
  
  // Test 1: Check if APIModule is loaded and available
  console.log('\n🔍 Test 1: APIModule availability');
  if (typeof window.api !== 'undefined') {
    console.log('✅ APIModule is available');
    console.log('✅ window.api:', window.api);
  } else {
    console.log('❌ APIModule not available');
  }
  
  // Test 2: Check if fetch redirection is working
  console.log('\n🔍 Test 2: Fetch redirection test');
  try {
    const testUrl = '/v1/reactions/test-message-123';
    console.log(`📡 Testing URL: ${testUrl}`);
    
    const response = await fetch(testUrl);
    console.log(`✅ Response status: ${response.status}`);
    console.log(`✅ Response URL: ${response.url}`);
    
    if (response.url.includes('216.238.91.120:3002')) {
      console.log('✅ SUCCESS: Request redirected to VPS server');
    } else {
      console.log('❌ FAILURE: Request not redirected to VPS server');
    }
  } catch (error) {
    console.log(`❌ Error: ${error.message}`);
  }
  
  // Test 3: Check METALAYER_API_URL configuration
  console.log('\n🔍 Test 3: METALAYER_API_URL configuration');
  if (typeof window.METALAYER_API_URL !== 'undefined') {
    console.log(`✅ METALAYER_API_URL: ${window.METALAYER_API_URL}`);
    if (window.METALAYER_API_URL.includes('216.238.91.120:3002')) {
      console.log('✅ SUCCESS: METALAYER_API_URL points to VPS server');
    } else {
      console.log('❌ FAILURE: METALAYER_API_URL not pointing to VPS server');
    }
  } else {
    console.log('❌ METALAYER_API_URL not defined');
  }
  
  // Test 4: Test specific CanopiModule API patterns
  console.log('\n🔍 Test 4: CanopiModule API patterns');
  const testPatterns = [
    '/v1/reactions/test-message-123',
    '/v1/reactions',
    'https://api.themetalayer.org/v1/presence/event'
  ];
  
  for (const pattern of testPatterns) {
    try {
      console.log(`📡 Testing pattern: ${pattern}`);
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
  
  // Test 5: Check if CanopiModule functions are available
  console.log('\n🔍 Test 5: CanopiModule function availability');
  const canopiFunctions = [
    'window.loadMessageReactions',
    'window.showReactionModal',
    'window.updateReactionDisplay'
  ];
  
  for (const func of canopiFunctions) {
    if (typeof eval(func) === 'function') {
      console.log(`✅ ${func} is available`);
    } else {
      console.log(`❌ ${func} is not available`);
    }
  }
  
  console.log('\n📊 Test Summary:');
  console.log('- Check console logs above for individual test results');
  console.log('- All API calls should be redirected to http://216.238.91.120:3002');
  console.log('- No more ERR_FILE_NOT_FOUND errors should occur');
  console.log('- CanopiModule should be able to load reactions properly');
}

// Run the tests
testCanopiModuleAPI();

