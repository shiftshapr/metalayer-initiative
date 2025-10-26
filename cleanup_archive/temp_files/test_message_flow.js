// SD1 ROOT CAUSE ANALYSIS: Message Flow Diagnostic
console.log('🔍 SD1 ROOT CAUSE ANALYSIS: Testing message flow');

async function testMessageFlow() {
  console.log('🔍 SD1: Starting comprehensive message flow test...');
  
  // Test 1: Check if sendMessageViaSupabase is available
  console.log('🔍 SD1 TEST 1: Checking sendMessageViaSupabase availability');
  console.log('🔍 SD1: window.sendMessageViaSupabase exists:', typeof window.sendMessageViaSupabase);
  
  if (typeof window.sendMessageViaSupabase !== 'function') {
    console.error('❌ SD1: sendMessageViaSupabase not available - ROOT CAUSE FOUND');
    return;
  }
  
  // Test 2: Check SupabaseRealtimeClient
  console.log('🔍 SD1 TEST 2: Checking SupabaseRealtimeClient');
  console.log('🔍 SD1: window.supabaseRealtimeClient exists:', !!window.supabaseRealtimeClient);
  console.log('🔍 SD1: window.supabaseRealtimeClient.sendMessage exists:', typeof window.supabaseRealtimeClient?.sendMessage);
  
  // Test 3: Check current user and page data
  console.log('🔍 SD1 TEST 3: Checking user and page data');
  console.log('🔍 SD1: window.currentUser:', window.currentUser);
  console.log('🔍 SD1: window.currentUrlData:', window.currentUrlData);
  
  // Test 4: Send a test message
  console.log('🔍 SD1 TEST 4: Sending test message');
  const testMessage = 'SD1 Test Message ' + Date.now();
  console.log('🔍 SD1: Test message:', testMessage);
  
  try {
    const result = await window.sendMessageViaSupabase(testMessage);
    console.log('🔍 SD1: Send result:', result);
    
    if (result && result.id) {
      console.log('✅ SD1: Message sent successfully with ID:', result.id);
      
      // Test 5: Check if message appears in database
      console.log('🔍 SD1 TEST 5: Checking database for new message');
      setTimeout(async () => {
        try {
          const { data: messages, error } = await window.supabase
            .from('messages')
            .select('*')
            .eq('content', testMessage)
            .order('created_at', { ascending: false })
            .limit(1);
          
          if (error) {
            console.error('❌ SD1: Database query failed:', error);
            return;
          }
          
          console.log('🔍 SD1: Database query result:', messages);
          
          if (messages && messages.length > 0) {
            console.log('✅ SD1: Message found in database:', messages[0]);
          } else {
            console.log('❌ SD1: Message NOT found in database - ROOT CAUSE FOUND');
          }
          
        } catch (error) {
          console.error('❌ SD1: Database check failed:', error);
        }
      }, 2000);
      
    } else {
      console.log('❌ SD1: Message send failed - ROOT CAUSE FOUND');
    }
    
  } catch (error) {
    console.error('❌ SD1: Message send error:', error);
  }
}

// Run the test
testMessageFlow();
