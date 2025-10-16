/**
 * Supabase Real-Time Broadcast Diagnostic Tool (SD1 + TE2)
 * 
 * This script tests whether Supabase is correctly configured to BROADCAST
 * real-time events to clients.
 * 
 * The Problem:
 * - Subscription shows as "SUBSCRIBED" ✅
 * - Database updates are happening (heartbeat logs) ✅
 * - Callbacks are registered ✅
 * - BUT: No 🔔🔔🔔 REALTIME_EVENT_ARRIVED logs ❌
 * 
 * Root Cause Hypotheses (SD1):
 * 1. Supabase Realtime Publication Issue
 *    - Table might not be properly added to publication
 *    - Publication might not be active
 * 
 * 2. Database REPLICA IDENTITY Issue
 *    - PostgreSQL needs REPLICA IDENTITY FULL to broadcast all column changes
 *    - Without this, Supabase doesn't know what changed
 * 
 * 3. Supabase Realtime Service Not Enabled
 *    - The real-time service might be disabled on Supabase dashboard
 * 
 * 4. RLS Policy Blocking Broadcasts (even after fix)
 *    - SELECT policy for 'public' might not be enough
 *    - Need to check if 'anon' role has access
 * 
 * Usage:
 *   1. Open sidepanel on BOTH profiles
 *   2. Navigate to the same page
 *   3. In ONE console, run: checkRealtimeBroadcast()
 *   4. It will perform a test update and monitor for events
 */

window.checkRealtimeBroadcast = async function() {
  console.log('');
  console.log('🔬🔬🔬═══════════════════════════════════════════════════════');
  console.log('🔬🔬🔬 SUPABASE REALTIME BROADCAST DIAGNOSTIC');
  console.log('🔬🔬🔬═══════════════════════════════════════════════════════');
  console.log('');

  // Step 1: Verify Supabase client
  console.log('📋 Step 1: Verifying Supabase client...');
  if (!window.supabaseRealtimeClient) {
    console.error('❌ SupabaseRealtimeClient not initialized');
    return;
  }
  console.log('✅ SupabaseRealtimeClient exists');
  
  const client = window.supabaseRealtimeClient;
  const supabase = client.supabase;
  const currentUser = client.currentUser?.userEmail;
  const currentPage = client.currentPage;
  
  if (!currentUser) {
    console.error('❌ No current user');
    return;
  }
  
  if (!currentPage) {
    console.error('❌ No current page');
    return;
  }
  
  console.log('✅ Current user:', currentUser);
  console.log('✅ Current page:', currentPage.pageId);
  console.log('');

  // Step 2: Check subscription status
  console.log('📋 Step 2: Checking subscription status...');
  const pageId = currentPage.pageId;
  const channel = client.channels.get(pageId);
  if (!channel) {
    console.error('❌ No active channel for current page');
    console.error('❌ Active channels:', Array.from(client.channels.keys()));
    return;
  }
  console.log('✅ Channel exists:', channel.topic);
  console.log('✅ Channel state:', channel.state);
  console.log('');

  // Step 3: Set up event monitor
  console.log('📋 Step 3: Setting up event monitor...');
  let eventReceived = false;
  let monitoringStartTime = Date.now();
  
  // Wrap the callback to detect if it gets called
  const originalCallback = client.onUserUpdated;
  client.onUserUpdated = function(presenceRecord) {
    console.log('');
    console.log('🎉🎉🎉═══════════════════════════════════════════════════════');
    console.log('🎉🎉🎉 TEST SUCCESS: Real-time event WAS received!');
    console.log('🎉🎉🎉═══════════════════════════════════════════════════════');
    console.log('🎉 User:', presenceRecord.user_email);
    console.log('🎉 Time to receive:', Date.now() - monitoringStartTime, 'ms');
    console.log('');
    eventReceived = true;
    
    // Call original callback
    if (originalCallback && typeof originalCallback === 'function') {
      originalCallback.apply(this, arguments);
    }
  };
  console.log('✅ Event monitor installed');
  console.log('');

  // Step 4: Perform test update
  console.log('📋 Step 4: Performing test database update...');
  console.log('🔬 TEST: Updating presence record with test marker...');
  console.log('🔬 TEST: This UPDATE should trigger a real-time event');
  console.log('');
  
  const testTimestamp = new Date().toISOString();
  const { data: updateData, error: updateError } = await supabase
    .from('user_presence')
    .update({
      last_seen: testTimestamp,
      // Add a test field to make the update more visible
      // (assuming aura_color exists in your schema)
    })
    .eq('user_email', currentUser)
    .eq('page_id', currentPage.pageId)
    .select();

  if (updateError) {
    console.error('❌ TEST: Update failed:', updateError);
    client.onUserUpdated = originalCallback; // Restore callback
    return;
  }
  
  console.log('✅ TEST: Update successful');
  console.log('✅ TEST: Updated last_seen to:', testTimestamp);
  console.log('✅ TEST: Returned data:', updateData);
  console.log('');

  // Step 5: Wait for event
  console.log('📋 Step 5: Waiting for real-time event (10 seconds)...');
  console.log('⏳ Monitoring for 🔔🔔🔔 REALTIME_EVENT_ARRIVED logs...');
  console.log('');
  
  await new Promise(resolve => setTimeout(resolve, 10000));
  
  // Restore original callback
  client.onUserUpdated = originalCallback;
  
  console.log('');
  console.log('📊📊📊═══════════════════════════════════════════════════════');
  console.log('📊📊📊 DIAGNOSTIC RESULTS');
  console.log('📊📊📊═══════════════════════════════════════════════════════');
  console.log('');
  
  if (eventReceived) {
    console.log('✅✅✅ SUCCESS: Real-time events ARE working!');
    console.log('✅ Supabase correctly broadcast the database change');
    console.log('✅ The client received and processed the event');
    console.log('');
    console.log('💡 If you\'re not seeing other users, the problem is elsewhere:');
    console.log('   - Check if other profile has sidepanel open');
    console.log('   - Check if both are on the exact same page URL');
    console.log('   - Run checkBothProfiles() to verify');
  } else {
    console.error('❌❌❌ FAILURE: Real-time events are NOT working!');
    console.error('');
    console.error('🔍 DIAGNOSIS: Supabase is NOT broadcasting database changes');
    console.error('');
    console.error('🔧 POSSIBLE ROOT CAUSES:');
    console.error('');
    console.error('1️⃣  REPLICA IDENTITY NOT SET');
    console.error('   PostgreSQL needs REPLICA IDENTITY FULL to broadcast changes');
    console.error('   Run this in Supabase SQL Editor:');
    console.error('');
    console.error('   ALTER TABLE public.user_presence REPLICA IDENTITY FULL;');
    console.error('');
    console.error('2️⃣  TABLE NOT IN PUBLICATION');
    console.error('   Even though publication shows table, might need to recreate:');
    console.error('');
    console.error('   ALTER PUBLICATION supabase_realtime DROP TABLE public.user_presence;');
    console.error('   ALTER PUBLICATION supabase_realtime ADD TABLE public.user_presence;');
    console.error('');
    console.error('3️⃣  SUPABASE REALTIME SERVICE DISABLED');
    console.error('   Check Supabase Dashboard > Settings > API');
    console.error('   Ensure "Realtime" is enabled');
    console.error('');
    console.error('4️⃣  RLS POLICY ISSUE (ANON ROLE)');
    console.error('   Realtime uses \'anon\' role, not \'public\'');
    console.error('   Run this in Supabase SQL Editor:');
    console.error('');
    console.error('   CREATE POLICY "Enable SELECT for anon (realtime)"');
    console.error('   ON public.user_presence');
    console.error('   FOR SELECT');
    console.error('   TO anon');
    console.error('   USING (true);');
    console.error('');
  }
  
  console.log('📊📊📊═══════════════════════════════════════════════════════');
  console.log('');
};

/**
 * Check Replica Identity Setting
 * 
 * This will tell you if REPLICA IDENTITY is set correctly
 */
window.checkReplicaIdentity = async function() {
  console.log('');
  console.log('🔍🔍🔍═══════════════════════════════════════════════════════');
  console.log('🔍🔍🔍 REPLICA IDENTITY CHECK');
  console.log('🔍🔍🔍═══════════════════════════════════════════════════════');
  console.log('');
  
  if (!window.supabaseRealtimeClient) {
    console.error('❌ SupabaseRealtimeClient not initialized');
    return;
  }
  
  const supabase = window.supabaseRealtimeClient.supabase;
  
  console.log('📋 Querying pg_class for replica identity setting...');
  console.log('');
  
  // This query checks the replica identity setting for user_presence table
  const { data, error } = await supabase
    .rpc('exec_sql', {
      sql: `
        SELECT
          c.relname AS table_name,
          c.relreplident AS replica_identity
        FROM
          pg_class c
        JOIN
          pg_namespace n ON n.oid = c.relnamespace
        WHERE
          n.nspname = 'public'
          AND c.relname = 'user_presence';
      `
    });
  
  if (error) {
    console.error('❌ Query failed:', error);
    console.error('');
    console.error('💡 This RPC function might not exist. That\'s okay.');
    console.error('   You need to run this query directly in Supabase SQL Editor:');
    console.error('');
    console.error('   SELECT');
    console.error('     c.relname AS table_name,');
    console.error('     c.relreplident AS replica_identity');
    console.error('   FROM');
    console.error('     pg_class c');
    console.error('   JOIN');
    console.error('     pg_namespace n ON n.oid = c.relnamespace');
    console.error('   WHERE');
    console.error('     n.nspname = \'public\'');
    console.error('     AND c.relname = \'user_presence\';');
    console.error('');
    console.error('   If replica_identity is \'d\' (default), change to \'f\' (full):');
    console.error('');
    console.error('   ALTER TABLE public.user_presence REPLICA IDENTITY FULL;');
    console.error('');
    return;
  }
  
  console.log('✅ Query successful');
  console.log('📊 Results:', data);
  console.log('');
  
  if (data && data.length > 0) {
    const replicaIdentity = data[0].replica_identity;
    console.log('📊 Replica Identity:', replicaIdentity);
    console.log('');
    
    if (replicaIdentity === 'f') {
      console.log('✅✅✅ REPLICA IDENTITY IS SET TO FULL');
      console.log('✅ This is correct for Supabase Realtime');
    } else if (replicaIdentity === 'd') {
      console.error('❌❌❌ REPLICA IDENTITY IS SET TO DEFAULT');
      console.error('❌ This will prevent real-time broadcasts!');
      console.error('');
      console.error('🔧 FIX: Run this in Supabase SQL Editor:');
      console.error('');
      console.error('   ALTER TABLE public.user_presence REPLICA IDENTITY FULL;');
      console.error('');
    } else {
      console.warn('⚠️ Unknown replica identity:', replicaIdentity);
    }
  }
  
  console.log('🔍🔍🔍═══════════════════════════════════════════════════════');
  console.log('');
};

/**
 * Force a real-time test by doing multiple rapid updates
 */
window.stressTestRealtime = async function() {
  console.log('');
  console.log('💪💪💪═══════════════════════════════════════════════════════');
  console.log('💪💪💪 REALTIME STRESS TEST');
  console.log('💪💪💪═══════════════════════════════════════════════════════');
  console.log('');
  console.log('🔬 This will perform 5 rapid updates and check if ANY trigger events');
  console.log('');
  
  if (!window.supabaseRealtimeClient) {
    console.error('❌ SupabaseRealtimeClient not initialized');
    return;
  }
  
  const client = window.supabaseRealtimeClient;
  const supabase = client.supabase;
  const currentUser = client.currentUser?.userEmail;
  const currentPage = client.currentPage;
  
  if (!currentUser || !currentPage) {
    console.error('❌ No current user or page');
    return;
  }
  
  let eventsReceived = 0;
  const originalCallback = client.onUserUpdated;
  
  client.onUserUpdated = function(presenceRecord) {
    eventsReceived++;
    console.log(`🎉 STRESS_TEST: Event #${eventsReceived} received!`);
    if (originalCallback && typeof originalCallback === 'function') {
      originalCallback.apply(this, arguments);
    }
  };
  
  console.log('🔬 Performing 5 updates in 5 seconds...');
  
  for (let i = 1; i <= 5; i++) {
    console.log(`🔬 Update ${i}/5...`);
    await supabase
      .from('user_presence')
      .update({
        last_seen: new Date().toISOString()
      })
      .eq('user_email', currentUser)
      .eq('page_id', currentPage.pageId);
    
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log('');
  console.log('⏳ Waiting 5 seconds for events...');
  await new Promise(resolve => setTimeout(resolve, 5000));
  
  client.onUserUpdated = originalCallback;
  
  console.log('');
  console.log('📊 STRESS TEST RESULTS:');
  console.log('   Updates sent: 5');
  console.log('   Events received:', eventsReceived);
  console.log('');
  
  if (eventsReceived === 0) {
    console.error('❌❌❌ ZERO events received - real-time is BROKEN');
    console.error('     Run checkRealtimeBroadcast() for diagnosis');
  } else if (eventsReceived < 5) {
    console.warn('⚠️ Only received', eventsReceived, '/ 5 events - real-time is UNRELIABLE');
  } else {
    console.log('✅✅✅ All events received - real-time is WORKING');
  }
  
  console.log('💪💪💪═══════════════════════════════════════════════════════');
  console.log('');
};

console.log('');
console.log('🔬 Supabase Realtime Broadcast Diagnostic Loaded');
console.log('');
console.log('📋 Available commands:');
console.log('   checkRealtimeBroadcast()  - Full diagnostic test');
console.log('   checkReplicaIdentity()    - Check REPLICA IDENTITY setting');
console.log('   stressTestRealtime()      - Send 5 rapid updates and monitor');
console.log('');

