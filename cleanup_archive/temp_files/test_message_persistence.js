// Test script to verify message persistence
console.log('🧪 TESTING: Message Persistence Verification');
console.log('🧪 TESTING: This script will test if messages are being saved to the database');

// Test 1: Check if SupabaseRealtimeClient is working
async function testSupabaseRealtimeClient() {
  console.log('🧪 TEST 1: Checking SupabaseRealtimeClient...');
  
  if (!window.supabaseRealtimeClient) {
    console.error('❌ TEST 1: window.supabaseRealtimeClient not available');
    return false;
  }
  
  console.log('✅ TEST 1: window.supabaseRealtimeClient is available');
  console.log('🧪 TEST 1: Client type:', typeof window.supabaseRealtimeClient);
  console.log('🧪 TEST 1: Has sendMessage method:', typeof window.supabaseRealtimeClient.sendMessage);
  
  return true;
}

// Test 2: Check if Supabase client is available
async function testSupabaseClient() {
  console.log('🧪 TEST 2: Checking Supabase client...');
  
  if (!window.supabase) {
    console.error('❌ TEST 2: window.supabase not available');
    return false;
  }
  
  console.log('✅ TEST 2: window.supabase is available');
  console.log('🧪 TEST 2: Supabase type:', typeof window.supabase);
  console.log('🧪 TEST 2: Has from method:', typeof window.supabase.from);
  
  return true;
}

// Test 3: Check current user and page data
async function testCurrentData() {
  console.log('🧪 TEST 3: Checking current user and page data...');
  
  const userEmail = window.currentUser?.email;
  const pageId = window.currentUrlData?.pageId;
  
  console.log('🧪 TEST 3: User email:', userEmail);
  console.log('🧪 TEST 3: Page ID:', pageId);
  
  if (!userEmail || !pageId) {
    console.error('❌ TEST 3: Missing user email or page ID');
    return false;
  }
  
  console.log('✅ TEST 3: User and page data available');
  return true;
}

// Test 4: Test direct database insert
async function testDirectDatabaseInsert() {
  console.log('🧪 TEST 4: Testing direct database insert...');
  
  if (!window.supabase) {
    console.error('❌ TEST 4: No Supabase client');
    return false;
  }
  
  const testMessage = `TEST PERSISTENCE MESSAGE ${Date.now()}`;
  const userEmail = window.currentUser?.email;
  const pageId = window.currentUrlData?.pageId;
  
  try {
    console.log('🧪 TEST 4: Inserting test message:', testMessage);
    
    const { data, error } = await window.supabase
      .from('messages')
      .insert({
        content: testMessage,
        user_email: userEmail,
        page_id: pageId,
        community_id: 'comm-001',
        created_at: new Date().toISOString()
      })
      .select()
      .single();
    
    if (error) {
      console.error('❌ TEST 4: Database insert failed:', error);
      return false;
    }
    
    console.log('✅ TEST 4: Test message inserted successfully:', data);
    console.log('✅ TEST 4: Message ID:', data.id);
    
    return data;
  } catch (error) {
    console.error('❌ TEST 4: Database insert error:', error);
    return false;
  }
}

// Test 5: Test API retrieval
async function testAPIRetrieval() {
  console.log('🧪 TEST 5: Testing API retrieval...');
  
  if (!window.api) {
    console.error('❌ TEST 5: No API client');
    return false;
  }
  
  try {
    console.log('🧪 TEST 5: Calling api.getChatHistory...');
    const response = await window.api.getChatHistory('comm-001', null, window.currentUrlData?.uri);
    
    console.log('🧪 TEST 5: API response:', response);
    console.log('🧪 TEST 5: Conversations count:', response.conversations?.length || 0);
    
    if (response.conversations && response.conversations.length > 0) {
      const firstConv = response.conversations[0];
      console.log('🧪 TEST 5: First conversation posts:', firstConv.posts?.length || 0);
      
      if (firstConv.posts && firstConv.posts.length > 0) {
        console.log('🧪 TEST 5: First post:', firstConv.posts[0]);
      }
    }
    
    return response;
  } catch (error) {
    console.error('❌ TEST 5: API retrieval error:', error);
    return false;
  }
}

// Test 6: Test SupabaseRealtimeClient.sendMessage
async function testSupabaseRealtimeSendMessage() {
  console.log('🧪 TEST 6: Testing SupabaseRealtimeClient.sendMessage...');
  
  if (!window.supabaseRealtimeClient) {
    console.error('❌ TEST 6: No SupabaseRealtimeClient');
    return false;
  }
  
  const testMessage = `TEST REALTIME MESSAGE ${Date.now()}`;
  
  try {
    console.log('🧪 TEST 6: Sending test message via SupabaseRealtimeClient...');
    const result = await window.supabaseRealtimeClient.sendMessage(testMessage);
    
    console.log('🧪 TEST 6: SupabaseRealtimeClient result:', result);
    console.log('🧪 TEST 6: Success:', result?.success);
    console.log('🧪 TEST 6: Message ID:', result?.id);
    
    return result;
  } catch (error) {
    console.error('❌ TEST 6: SupabaseRealtimeClient error:', error);
    return false;
  }
}

// Run all tests
async function runAllTests() {
  console.log('🧪🧪🧪 ============================================');
  console.log('🧪🧪🧪 STARTING MESSAGE PERSISTENCE TESTS');
  console.log('🧪🧪🧪 ============================================');
  
  const results = {
    supabaseRealtimeClient: await testSupabaseRealtimeClient(),
    supabaseClient: await testSupabaseClient(),
    currentData: await testCurrentData(),
    directInsert: await testDirectDatabaseInsert(),
    apiRetrieval: await testAPIRetrieval(),
    realtimeSend: await testSupabaseRealtimeSendMessage()
  };
  
  console.log('🧪🧪🧪 ============================================');
  console.log('🧪🧪🧪 TEST RESULTS SUMMARY');
  console.log('🧪🧪🧪 ============================================');
  
  Object.entries(results).forEach(([test, result]) => {
    const status = result ? '✅ PASS' : '❌ FAIL';
    console.log(`🧪 ${status}: ${test}`);
  });
  
  console.log('🧪🧪🧪 ============================================');
  console.log('🧪🧪🧪 TESTS COMPLETE');
  console.log('🧪🧪🧪 ============================================');
  
  return results;
}

// Auto-run tests
runAllTests();
