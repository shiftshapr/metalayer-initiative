// Test if Supabase real-time events are actually firing
// Run in console: testRealtimeEvents()

window.testRealtimeEvents = async function testRealtimeEvents() {
  console.log('🧪 === TESTING SUPABASE REALTIME EVENTS ===');
  
  if (!window.supabase) {
    console.error('❌ window.supabase not found!');
    return;
  }
  
  console.log('✅ Supabase client found');
  console.log('📊 Supabase URL:', window.supabase.supabaseUrl);
  
  // Test 1: Check if we can SELECT from user_presence
  console.log('\n🧪 TEST 1: Can we SELECT from user_presence?');
  try {
    const { data, error } = await window.supabase
      .from('user_presence')
      .select('*')
      .limit(5);
    
    if (error) {
      console.error('❌ SELECT failed:', error);
      console.log('💡 This means RLS is blocking reads!');
      return { test1: 'FAILED - RLS blocking' };
    }
    
    console.log('✅ SELECT works, got', data.length, 'records');
    console.log('📊 Sample record:', data[0]);
  } catch (err) {
    console.error('❌ SELECT threw error:', err);
    return { test1: 'FAILED - Exception' };
  }
  
  // Test 2: Create a test subscription
  console.log('\n🧪 TEST 2: Setting up test subscription...');
  
  let eventReceived = false;
  const testChannel = window.supabase
    .channel('test-realtime-diagnostic')
    .on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'user_presence'
    }, (payload) => {
      console.log('🎉 EVENT RECEIVED!', payload);
      eventReceived = true;
    })
    .subscribe((status) => {
      console.log('📡 Subscription status:', status);
    });
  
  // Wait for subscription
  await new Promise(r => setTimeout(r, 2000));
  
  // Test 3: Trigger an update
  console.log('\n🧪 TEST 3: Triggering update to test if event fires...');
  
  try {
    const { data: updateData, error: updateError } = await window.supabase
      .from('user_presence')
      .update({ last_seen: new Date().toISOString() })
      .eq('user_email', window.currentUser?.userEmail || 'themetalayer@gmail.com')
      .eq('page_id', 'chrome_extensions_errors_dbdjamnflfecdnioehkdmlhnmajffijl');
    
    if (updateError) {
      console.error('❌ UPDATE failed:', updateError);
    } else {
      console.log('✅ UPDATE sent to database');
    }
  } catch (err) {
    console.error('❌ UPDATE threw error:', err);
  }
  
  // Wait to see if event fires
  console.log('⏳ Waiting 5 seconds for event...');
  await new Promise(r => setTimeout(r, 5000));
  
  if (eventReceived) {
    console.log('✅✅✅ SUCCESS! Realtime events ARE working!');
    console.log('💡 The issue must be in the subscription setup');
  } else {
    console.log('❌❌❌ FAILURE! NO realtime event received!');
    console.log('💡 Possible causes:');
    console.log('   1. Table replication not enabled (check Supabase Dashboard)');
    console.log('   2. RLS policies blocking real-time (even though SELECT works)');
    console.log('   3. WAL (Write-Ahead Logging) not enabled');
    console.log('   4. Supabase plan doesn't include realtime');
  }
  
  // Cleanup
  await window.supabase.removeChannel(testChannel);
  
  return {
    test1_select: 'PASSED',
    test2_subscription: 'PASSED',
    test3_event_received: eventReceived ? 'PASSED' : 'FAILED'
  };
};

console.log('✅ testRealtimeEvents() loaded! You can now run it from the console.');

