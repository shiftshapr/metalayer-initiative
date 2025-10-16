// TE2: Comprehensive Real-time Diagnostics
// This diagnostic suite tests all aspects of Supabase Realtime
// Run in console: runFullDiagnostics()

window.runFullDiagnostics = async function() {
  console.log('🔬 === COMPREHENSIVE SUPABASE REALTIME DIAGNOSTICS ===');
  console.log('🏷️  By: TE2 (Test Engineer)');
  console.log('📅 Date:', new Date().toISOString());
  console.log('');
  
  const results = {
    timestamp: new Date().toISOString(),
    tests: [],
    summary: {}
  };
  
  // TEST 1: Environment Check
  console.log('📋 TEST 1: Environment Check');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  const envTest = {
    name: 'Environment Check',
    passed: true,
    details: {}
  };
  
  if (!window.supabase) {
    console.error('❌ window.supabase not found!');
    envTest.passed = false;
    envTest.details.supabase = 'NOT FOUND';
  } else {
    console.log('✅ window.supabase exists');
    envTest.details.supabase = 'FOUND';
    envTest.details.url = window.supabase.supabaseUrl;
  }
  
  if (!window.currentUser) {
    console.warn('⚠️  window.currentUser not found');
    envTest.details.currentUser = 'NOT FOUND';
  } else {
    console.log('✅ window.currentUser exists:', window.currentUser.userEmail);
    envTest.details.currentUser = window.currentUser.userEmail;
  }
  
  results.tests.push(envTest);
  console.log('');
  
  if (!window.supabase) {
    console.error('❌ Cannot continue without Supabase client');
    return results;
  }
  
  // TEST 2: Database Read Access (RLS Test)
  console.log('📋 TEST 2: Database Read Access (RLS Test)');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  const rlsTest = {
    name: 'RLS Read Access',
    passed: false,
    details: {}
  };
  
  try {
    const { data, error } = await window.supabase
      .from('user_presence')
      .select('*')
      .limit(5);
    
    if (error) {
      console.error('❌ SELECT failed:', error.message);
      console.log('💡 RLS is blocking SELECT for anon role!');
      rlsTest.details.error = error.message;
      rlsTest.details.diagnosis = 'RLS blocking SELECT';
    } else {
      console.log('✅ SELECT works! Got', data.length, 'records');
      rlsTest.passed = true;
      rlsTest.details.recordCount = data.length;
      rlsTest.details.sampleRecord = data[0];
      
      // Show what pages users are on
      if (data.length > 0) {
        console.log('📊 Current presence data:');
        data.forEach(record => {
          console.log(`   - ${record.user_email}: ${record.page_id} (active: ${record.is_active})`);
        });
      }
    }
  } catch (err) {
    console.error('❌ Exception during SELECT:', err);
    rlsTest.details.exception = err.message;
  }
  
  results.tests.push(rlsTest);
  console.log('');
  
  // TEST 3: WebSocket Connection
  console.log('📋 TEST 3: WebSocket Connection Test');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  const wsTest = {
    name: 'WebSocket Connection',
    passed: false,
    details: {}
  };
  
  let subscriptionStatus = 'pending';
  
  const testChannel = window.supabase
    .channel('diagnostic-connection-test')
    .subscribe((status) => {
      console.log('📡 Subscription status:', status);
      subscriptionStatus = status;
      wsTest.details.subscriptionStatus = status;
      
      if (status === 'SUBSCRIBED') {
        console.log('✅ WebSocket connection established!');
        wsTest.passed = true;
      } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
        console.error('❌ WebSocket connection failed:', status);
        wsTest.details.error = 'Connection failed: ' + status;
      }
    });
  
  // Wait for subscription
  await new Promise(r => setTimeout(r, 3000));
  
  if (subscriptionStatus !== 'SUBSCRIBED') {
    console.error('❌ Failed to establish WebSocket connection');
    wsTest.details.finalStatus = subscriptionStatus;
  }
  
  results.tests.push(wsTest);
  
  // Cleanup
  await window.supabase.removeChannel(testChannel);
  console.log('');
  
  // TEST 4: Real-time Event Reception
  console.log('📋 TEST 4: Real-time Event Reception (CRITICAL TEST)');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('💡 This test checks if postgres_changes events are actually firing');
  
  const eventTest = {
    name: 'Real-time Event Reception',
    passed: false,
    details: {}
  };
  
  let eventReceived = false;
  let receivedPayload = null;
  
  const eventChannel = window.supabase
    .channel('diagnostic-event-test')
    .on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'user_presence'
    }, (payload) => {
      console.log('🎉🎉🎉 EVENT RECEIVED!', payload);
      eventReceived = true;
      receivedPayload = payload;
    })
    .subscribe((status) => {
      console.log('📡 Event channel status:', status);
    });
  
  // Wait for subscription
  await new Promise(r => setTimeout(r, 2000));
  
  // Trigger an update
  console.log('🔄 Triggering UPDATE to test event firing...');
  
  const userEmail = window.currentUser?.userEmail || 'themetalayer@gmail.com';
  const testPageId = 'chrome_extensions_errors_dbdjamnflfecdnioehkdmlhnmajffijl';
  
  try {
    const { error: updateError } = await window.supabase
      .from('user_presence')
      .update({ 
        last_seen: new Date().toISOString(),
        aura_color: '#FF0000' // Use a distinctive color to identify our update
      })
      .eq('user_email', userEmail)
      .eq('page_id', testPageId);
    
    if (updateError) {
      console.error('❌ UPDATE failed:', updateError.message);
      eventTest.details.updateError = updateError.message;
    } else {
      console.log('✅ UPDATE sent successfully');
      eventTest.details.updateSent = true;
    }
  } catch (err) {
    console.error('❌ Exception during UPDATE:', err);
    eventTest.details.updateException = err.message;
  }
  
  // Wait for event
  console.log('⏳ Waiting 5 seconds for real-time event...');
  await new Promise(r => setTimeout(r, 5000));
  
  if (eventReceived) {
    console.log('✅✅✅ SUCCESS! Real-time event WAS received!');
    console.log('📦 Payload:', receivedPayload);
    eventTest.passed = true;
    eventTest.details.eventReceived = true;
    eventTest.details.payload = receivedPayload;
    console.log('💡 This means Realtime IS working! The issue is in the app subscription setup.');
  } else {
    console.log('❌❌❌ FAILURE! NO real-time event received!');
    console.log('');
    console.log('🔍 DIAGNOSIS:');
    console.log('   The update was sent, but NO postgres_changes event was received.');
    console.log('');
    console.log('💡 POSSIBLE CAUSES:');
    console.log('   1️⃣  WAL (Write-Ahead Logging) not set to "logical"');
    console.log('      → Check with: SHOW wal_level;');
    console.log('      → Should return: "logical"');
    console.log('');
    console.log('   2️⃣  RLS policies blocking realtime for anon role');
    console.log('      → Even though SELECT works, realtime has separate permissions');
    console.log('      → Need policy: CREATE POLICY "Enable realtime for anon" ON user_presence FOR SELECT TO anon USING (true);');
    console.log('');
    console.log('   3️⃣  Supabase plan limitations');
    console.log('      → Free tier has realtime limits');
    console.log('      → Check Supabase dashboard for plan details');
    console.log('');
    console.log('   4️⃣  Table not properly added to publication');
    console.log('      → Verify with: SELECT * FROM pg_publication_tables WHERE pubname = \'supabase_realtime\';');
    
    eventTest.details.eventReceived = false;
    eventTest.details.diagnosis = 'No postgres_changes event received despite successful UPDATE';
  }
  
  results.tests.push(eventTest);
  
  // Cleanup
  await window.supabase.removeChannel(eventChannel);
  console.log('');
  
  // TEST 5: Current Subscription Analysis
  console.log('📋 TEST 5: Current Subscription Analysis');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  const subAnalysis = {
    name: 'Current Subscription Analysis',
    passed: true,
    details: {}
  };
  
  if (window.supabaseRealtimeClient && window.supabaseRealtimeClient.channels) {
    console.log('📊 Active channels:', Object.keys(window.supabaseRealtimeClient.channels));
    subAnalysis.details.activeChannels = Object.keys(window.supabaseRealtimeClient.channels);
    
    for (const [channelName, channel] of Object.entries(window.supabaseRealtimeClient.channels)) {
      console.log(`   - ${channelName}:`, channel);
    }
  } else {
    console.log('⚠️  No supabaseRealtimeClient found or no channels');
    subAnalysis.details.note = 'No client or channels found';
  }
  
  results.tests.push(subAnalysis);
  console.log('');
  
  // SUMMARY
  console.log('');
  console.log('═════════════════════════════════════════');
  console.log('📊 DIAGNOSTIC SUMMARY');
  console.log('═════════════════════════════════════════');
  
  const passedTests = results.tests.filter(t => t.passed).length;
  const totalTests = results.tests.length;
  
  results.summary = {
    passedTests,
    totalTests,
    successRate: `${Math.round((passedTests / totalTests) * 100)}%`,
    criticalFailures: []
  };
  
  results.tests.forEach(test => {
    const status = test.passed ? '✅' : '❌';
    console.log(`${status} ${test.name}`);
    
    if (!test.passed) {
      results.summary.criticalFailures.push(test.name);
    }
  });
  
  console.log('');
  console.log(`Final Score: ${passedTests}/${totalTests} tests passed`);
  
  if (results.summary.criticalFailures.length > 0) {
    console.log('');
    console.log('🚨 CRITICAL FAILURES:');
    results.summary.criticalFailures.forEach(failure => {
      console.log(`   - ${failure}`);
    });
  }
  
  console.log('');
  console.log('💾 Full results stored in return value');
  console.log('═════════════════════════════════════════');
  
  return results;
};

// Quick test for immediate event check
window.quickRealtimeTest = async function() {
  console.log('⚡ QUICK REALTIME TEST');
  console.log('Testing if ANY postgres_changes event fires...');
  
  let eventFired = false;
  
  const channel = window.supabase
    .channel('quick-test')
    .on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'user_presence'
    }, (payload) => {
      console.log('🎉 EVENT!', payload);
      eventFired = true;
    })
    .subscribe();
  
  await new Promise(r => setTimeout(r, 2000));
  
  // Trigger update
  const userEmail = window.currentUser?.userEmail || 'themetalayer@gmail.com';
  await window.supabase
    .from('user_presence')
    .update({ last_seen: new Date().toISOString() })
    .eq('user_email', userEmail)
    .limit(1);
  
  await new Promise(r => setTimeout(r, 3000));
  
  await window.supabase.removeChannel(channel);
  
  if (eventFired) {
    console.log('✅ Events ARE working!');
  } else {
    console.log('❌ Events NOT working - check WAL/RLS/Publication');
  }
  
  return { eventFired };
};

// Helper to check current page presence
window.checkCurrentPagePresence = async function() {
  console.log('📍 CURRENT PAGE PRESENCE CHECK');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  const pageId = 'chrome_extensions_errors_dbdjamnflfecdnioehkdmlhnmajffijl';
  
  const { data, error } = await window.supabase
    .from('user_presence')
    .select('*')
    .eq('page_id', pageId);
  
  if (error) {
    console.error('❌ Error:', error.message);
    return { error: error.message };
  }
  
  console.log(`📊 Found ${data.length} users on current page:`);
  data.forEach(record => {
    console.log(`   - ${record.user_email}`);
    console.log(`     Active: ${record.is_active}`);
    console.log(`     Last seen: ${record.last_seen}`);
    console.log(`     Enter time: ${record.enter_time}`);
    console.log('');
  });
  
  return { users: data };
};

console.log('✅ TE2 Diagnostics loaded!');
console.log('');
console.log('Available functions:');
console.log('  - runFullDiagnostics()     // Complete diagnostic suite');
console.log('  - quickRealtimeTest()      // Fast event test');
console.log('  - checkCurrentPagePresence() // Check who is on current page');



