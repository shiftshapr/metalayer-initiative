/**
 * Comprehensive Supabase Fix Test Script
 * Run this in the browser console to test Supabase URL preservation
 */

async function testSupabaseFix() {
  console.log('🧪 Testing Supabase URL preservation fix...');
  
  // Test 1: Check if fetch override preserves Supabase URLs
  console.log('\n🔍 Test 1: Supabase URL preservation');
  const supabaseTests = [
    'https://zwxomzkmncwzwryvudwu.supabase.co/rest/v1/messages',
    'https://zwxomzkmncwzwryvudwu.supabase.co/rest/v1/user_presence',
    '/messages?select=count&limit=1',
    '/user_presence?select=count&limit=1',
    '/rest/v1/messages?select=*&page_id=eq.test'
  ];
  
  for (const url of supabaseTests) {
    try {
      console.log(`📡 Testing Supabase URL: ${url}`);
      const response = await fetch(url, { method: 'GET' });
      console.log(`✅ ${url}: ${response.status} - ${response.url}`);
      
      if (response.url.includes('supabase.co')) {
        console.log('✅ SUCCESS: Supabase URL preserved');
      } else if (response.url.includes('216.238.91.120:3002')) {
        console.log('❌ FAILURE: Supabase URL redirected to VPS server');
      } else {
        console.log('✅ SUCCESS: URL preserved (not redirected)');
      }
    } catch (error) {
      console.log(`✅ ${url}: ${error.message} (expected for Supabase URLs)`);
    }
  }
  
  // Test 2: Check if VPS API URLs still redirect properly
  console.log('\n🔍 Test 2: VPS API redirection');
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
  
  // Test 3: Check if api.themetalayer.org still redirects
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
  
  // Test 4: Check Supabase client availability
  console.log('\n🔍 Test 4: Supabase client check');
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
  
  // Test 5: Check SUPABASE_URL configuration
  console.log('\n🔍 Test 5: SUPABASE_URL configuration');
  if (typeof window.SUPABASE_URL !== 'undefined') {
    console.log(`✅ SUPABASE_URL: ${window.SUPABASE_URL}`);
    
    if (window.SUPABASE_URL.includes('supabase.co')) {
      console.log('✅ SUCCESS: SUPABASE_URL points to Supabase');
    } else {
      console.log('❌ FAILURE: SUPABASE_URL not pointing to Supabase');
    }
  } else {
    console.log('❌ SUPABASE_URL not defined');
  }
  
  console.log('\n📊 Test Summary:');
  console.log('- Supabase URLs should NOT be redirected to VPS server');
  console.log('- VPS API URLs (/v1/, /communities/, /avatars/) should be redirected');
  console.log('- api.themetalayer.org should be redirected to VPS server');
  console.log('- Supabase client should use correct Supabase URL');
  console.log('- No more 404 errors for Supabase queries');
}

// Run the tests
testSupabaseFix();

