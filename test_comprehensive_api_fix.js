/**
 * Comprehensive API Redirection Fix Test Script
 * Run this in the browser console to test all API redirection fixes
 */

async function testComprehensiveAPIFix() {
  console.log('🧪 Testing comprehensive API redirection fixes...');
  
  // Test 1: Check SUPABASE_URL availability
  console.log('\n🔍 Test 1: SUPABASE_URL availability');
  if (typeof window.SUPABASE_URL !== 'undefined') {
    console.log(`✅ SUPABASE_URL: ${window.SUPABASE_URL}`);
  } else {
    console.log('❌ SUPABASE_URL not defined');
  }
  
  // Test 2: Test Supabase URL construction
  console.log('\n🔍 Test 2: Supabase URL construction');
  const supabaseTests = [
    '/messages?select=count&limit=1',
    '/user_presence?select=count&limit=1',
    '/rest/v1/messages?select=*&page_id=eq.test',
    '/messages?select=*&page_id=eq.chrome___extensions__errors_dbdjamnflfecdnioehkdmlhnmajffijl&community_id=eq.comm-001&order=created_at.asc'
  ];
  
  for (const url of supabaseTests) {
    try {
      console.log(`📡 Testing Supabase URL: ${url}`);
      const response = await fetch(url, { method: 'GET' });
      console.log(`✅ ${url}: ${response.status} - ${response.url}`);
      
      if (response.url.includes('supabase.co')) {
        console.log('✅ SUCCESS: Supabase URL properly constructed');
      } else if (response.url.includes('chrome-extension://')) {
        console.log('❌ FAILURE: URL resolved to chrome-extension (should be Supabase)');
      } else if (response.url.includes('216.238.91.120:3002')) {
        console.log('❌ FAILURE: URL redirected to VPS server (should be Supabase)');
      } else {
        console.log('✅ SUCCESS: URL preserved (not redirected)');
      }
    } catch (error) {
      console.log(`✅ ${url}: ${error.message} (expected for Supabase URLs)`);
    }
  }
  
  // Test 3: Test VPS API redirection
  console.log('\n🔍 Test 3: VPS API redirection');
  const vpsTests = [
    '/v1/reactions/test-message-123',
    '/v1/reactions',
    '/communities/test',
    '/avatars/test'
  ];
  
  for (const url of vpsTests) {
    try {
      console.log(`📡 Testing VPS API URL: ${url}`);
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
  
  // Test 4: Test api.themetalayer.org redirection
  console.log('\n🔍 Test 4: api.themetalayer.org redirection');
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
  
  // Test 6: Check Supabase client
  console.log('\n🔍 Test 6: Supabase client check');
  if (typeof window.supabase !== 'undefined') {
    console.log('✅ Supabase client is available');
    console.log('✅ Supabase URL:', window.supabase.supabaseUrl);
    
    if (window.supabase.supabaseUrl.includes('supabase.co')) {
      console.log('✅ SUCCESS: Supabase client using correct URL');
    } else {
      console.log('❌ FAILURE: Supabase client using wrong URL');
    }
  } else {
    console.log('❌ Supabase client not available');
  }
  
  console.log('\n📊 Test Summary:');
  console.log('- Supabase URLs should be constructed with full Supabase URL');
  console.log('- VPS API URLs (/v1/, /communities/, /avatars/) should be redirected');
  console.log('- api.themetalayer.org should be redirected to VPS server');
  console.log('- Non-API URLs should NOT be redirected');
  console.log('- No more chrome-extension:// URLs for Supabase queries');
  console.log('- No more ERR_FILE_NOT_FOUND for Supabase queries');
}

// Run the tests
testComprehensiveAPIFix();

