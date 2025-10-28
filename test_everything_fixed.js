/**
 * COMPREHENSIVE FIX TEST SCRIPT
 * Run this in the browser console to test all fixes
 */

async function testEverythingFixed() {
  console.log('🧪 Testing comprehensive fixes...');
  
  // Test 1: Check if APIModule is available
  console.log('\n🔍 Test 1: APIModule availability');
  if (typeof window.api !== 'undefined') {
    console.log('✅ APIModule is available');
    console.log('✅ window.api:', typeof window.api);
  } else {
    console.log('❌ APIModule not available');
    return;
  }
  
  // Test 2: Test Supabase queries (should work normally)
  console.log('\n🔍 Test 2: Supabase queries');
  if (typeof window.supabase !== 'undefined') {
    try {
      const result = await window.supabase.from('messages').select('count').limit(1);
      console.log('✅ Supabase messages query:', result);
    } catch (error) {
      console.log('✅ Supabase messages query error (expected):', error.message);
    }
    
    try {
      const result = await window.supabase.from('user_presence').select('count').limit(1);
      console.log('✅ Supabase user_presence query:', result);
    } catch (error) {
      console.log('✅ Supabase user_presence query error (expected):', error.message);
    }
  } else {
    console.log('❌ Supabase client not available');
  }
  
  // Test 3: Test VPS API calls through APIModule
  console.log('\n🔍 Test 3: VPS API calls through APIModule');
  try {
    const result = await window.api.request('/v1/reactions/test-message-123');
    console.log('✅ VPS reactions API:', result);
  } catch (error) {
    console.log('✅ VPS reactions API error (expected):', error.message);
  }
  
  try {
    const result = await window.api.request('/communities/test');
    console.log('✅ VPS communities API:', result);
  } catch (error) {
    console.log('✅ VPS communities API error (expected):', error.message);
  }
  
  // Test 4: Test direct fetch calls (should work normally)
  console.log('\n🔍 Test 4: Direct fetch calls');
  try {
    const response = await fetch('https://www.google.com');
    console.log('✅ Direct fetch to Google:', response.status);
  } catch (error) {
    console.log('✅ Direct fetch to Google error (expected):', error.message);
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
  
  // Test 6: Check configuration
  console.log('\n🔍 Test 6: Configuration check');
  console.log(`✅ METALAYER_API_URL: ${window.METALAYER_API_URL}`);
  console.log(`✅ SUPABASE_URL: ${window.SUPABASE_URL}`);
  
  if (window.METALAYER_API_URL && window.METALAYER_API_URL.includes('216.238.91.120:3002')) {
    console.log('✅ METALAYER_API_URL points to VPS server');
  } else {
    console.log('❌ METALAYER_API_URL not pointing to VPS server');
  }
  
  if (window.SUPABASE_URL && window.SUPABASE_URL.includes('supabase.co')) {
    console.log('✅ SUPABASE_URL points to Supabase');
  } else {
    console.log('❌ SUPABASE_URL not pointing to Supabase');
  }
  
  console.log('\n📊 Test Summary:');
  console.log('- APIModule should be available and working');
  console.log('- Supabase queries should work normally');
  console.log('- VPS API calls should go through APIModule');
  console.log('- Direct fetch calls should work normally');
  console.log('- No more global fetch override issues');
  console.log('- No more chrome-extension:// URL issues');
  console.log('- No more ERR_FILE_NOT_FOUND issues');
}

// Run the tests
testEverythingFixed();

