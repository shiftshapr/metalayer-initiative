/**
 * Comprehensive API Redirection Test Script
 * Run this in the browser console to test all API redirection fixes
 */

async function testAPIRedirection() {
  console.log('🧪 Starting comprehensive API redirection tests...');
  
  const tests = [
    {
      name: 'Test relative v1/reactions endpoint',
      url: '/v1/reactions/test-message-123',
      method: 'GET'
    },
    {
      name: 'Test api.themetalayer.org redirection',
      url: 'https://api.themetalayer.org/v1/presence/event',
      method: 'POST',
      body: JSON.stringify({ test: true })
    },
    {
      name: 'Test METALAYER_API_URL configuration',
      url: `${window.METALAYER_API_URL}/v1/presence/event`,
      method: 'POST',
      body: JSON.stringify({ test: true })
    }
  ];
  
  for (const test of tests) {
    console.log(`\n🔍 Testing: ${test.name}`);
    console.log(`📡 URL: ${test.url}`);
    
    try {
      const options = {
        method: test.method,
        headers: {
          'Content-Type': 'application/json'
        }
      };
      
      if (test.body) {
        options.body = test.body;
      }
      
      const response = await fetch(test.url, options);
      console.log(`✅ Response status: ${response.status}`);
      console.log(`✅ Response URL: ${response.url}`);
      
      if (response.url.includes('216.238.91.120:3002')) {
        console.log('✅ SUCCESS: Request redirected to VPS server');
      } else {
        console.log('❌ FAILURE: Request not redirected to VPS server');
      }
      
    } catch (error) {
      console.log(`❌ Error: ${error.message}`);
      
      if (error.message.includes('Failed to fetch')) {
        console.log('❌ FAILURE: Network error - likely not redirected');
      }
    }
  }
  
  // Test XMLHttpRequest redirection
  console.log('\n🔍 Testing XMLHttpRequest redirection...');
  
  const xhrTest = new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('GET', '/v1/reactions/test-message-123');
    xhr.onload = () => {
      console.log(`✅ XHR Response status: ${xhr.status}`);
      console.log(`✅ XHR Response URL: ${xhr.responseURL}`);
      if (xhr.responseURL.includes('216.238.91.120:3002')) {
        console.log('✅ SUCCESS: XHR request redirected to VPS server');
      } else {
        console.log('❌ FAILURE: XHR request not redirected to VPS server');
      }
      resolve();
    };
    xhr.onerror = () => {
      console.log('❌ XHR Error: Network error');
      resolve();
    };
    xhr.send();
  });
  
  await xhrTest;
  
  console.log('\n📊 Test Summary:');
  console.log('- Check console logs above for individual test results');
  console.log('- All requests should be redirected to http://216.238.91.120:3002');
  console.log('- No requests should go to api.themetalayer.org');
}

// Run the tests
testAPIRedirection();

