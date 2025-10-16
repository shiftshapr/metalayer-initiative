/**
 * Real-time Subscription Diagnostic Tool
 * 
 * This script helps diagnose why Supabase real-time events are not being received.
 * 
 * Usage:
 *   1. Open both Chrome profiles
 *   2. Open sidepanel on both
 *   3. Navigate to the same page (e.g., google.com)
 *   4. In ONE profile's console, run: testRealtimeSubscription()
 *   5. Watch BOTH consoles for real-time event logs
 */

// Test if real-time subscription is working
window.testRealtimeSubscription = async function() {
  console.log('');
  console.log('🧪🧪🧪═══════════════════════════════════════════════════════');
  console.log('🧪🧪🧪 REALTIME SUBSCRIPTION TEST');
  console.log('🧪🧪🧪═══════════════════════════════════════════════════════');
  console.log('');
  
  // Step 1: Check if Supabase client exists
  console.log('📋 Step 1: Checking Supabase client...');
  if (!window.supabaseRealtimeClient) {
    console.error('❌ supabaseRealtimeClient not found!');
    return;
  }
  console.log('✅ supabaseRealtimeClient exists');
  
  // Step 2: Check current page
  console.log('');
  console.log('📋 Step 2: Checking current page...');
  const currentPage = window.supabaseRealtimeClient.currentPage;
  if (!currentPage) {
    console.error('❌ No current page set!');
    return;
  }
  console.log('✅ Current page:', currentPage.pageId);
  console.log('   URL:', currentPage.url);
  
  // Step 3: Check if subscribed
  console.log('');
  console.log('📋 Step 3: Checking subscription status...');
  const channels = window.supabaseRealtimeClient.channels;
  console.log('   Active channels:', channels.size);
  
  if (channels.has(currentPage.pageId)) {
    console.log('✅ Subscribed to current page');
    const channel = channels.get(currentPage.pageId);
    console.log('   Channel:', channel);
    console.log('   Channel state:', channel.state);
  } else {
    console.error('❌ NOT subscribed to current page!');
    console.error('   This is the problem - subscription was not established');
    return;
  }
  
  // Step 4: Check connection status
  console.log('');
  console.log('📋 Step 4: Checking connection status...');
  console.log('   isConnected:', window.supabaseRealtimeClient.isConnected);
  
  // Step 5: Manually trigger a presence update
  console.log('');
  console.log('📋 Step 5: Manually triggering presence update...');
  console.log('   This will update the database and should trigger a real-time event');
  console.log('   Watch for 🔔🔔🔔 REALTIME_EVENT_ARRIVED in ALL open consoles');
  console.log('');
  
  try {
    const user = window.supabaseRealtimeClient.currentUser;
    const result = await window.supabaseRealtimeClient.updatePresence(
      currentPage.pageId,
      currentPage.url,
      '#ff0000' // Test color
    );
    
    console.log('✅ Presence update sent to database');
    console.log('');
    console.log('⏳ Now waiting 5 seconds for real-time event...');
    console.log('   If you see 🔔🔔🔔 REALTIME_EVENT_ARRIVED, real-time is working!');
    console.log('   If you DON\'T see it after 5 seconds, real-time is broken');
    console.log('');
    
    // Wait and check
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    console.log('');
    console.log('❓ Did you see 🔔🔔🔔 REALTIME_EVENT_ARRIVED above?');
    console.log('   YES → Real-time is working! The issue is elsewhere');
    console.log('   NO → Real-time is broken! Check Supabase configuration');
    console.log('');
    
  } catch (error) {
    console.error('❌ Error during test:', error);
  }
  
  console.log('🧪🧪🧪═══════════════════════════════════════════════════════');
  console.log('🧪🧪🧪 TEST COMPLETE');
  console.log('🧪🧪🧪═══════════════════════════════════════════════════════');
  console.log('');
};

// Check subscription health
window.checkSubscriptionHealth = function() {
  console.log('');
  console.log('🏥🏥🏥═══════════════════════════════════════════════════════');
  console.log('🏥🏥🏥 SUBSCRIPTION HEALTH CHECK');
  console.log('🏥🏥🏥═══════════════════════════════════════════════════════');
  console.log('');
  
  if (!window.supabaseRealtimeClient) {
    console.error('❌ supabaseRealtimeClient not found');
    return;
  }
  
  const client = window.supabaseRealtimeClient;
  
  console.log('📊 Current State:');
  console.log('   User:', client.currentUser?.userEmail);
  console.log('   Current page:', client.currentPage?.pageId);
  console.log('   Connected:', client.isConnected);
  console.log('   Active channels:', client.channels.size);
  console.log('');
  
  console.log('📋 Channel Details:');
  client.channels.forEach((channel, pageId) => {
    console.log(`   Page: ${pageId}`);
    console.log(`     State: ${channel.state}`);
    console.log(`     Topic: ${channel.topic}`);
  });
  console.log('');
  
  console.log('🔌 Callback Registration:');
  console.log('   onUserJoined:', typeof client.onUserJoined);
  console.log('   onUserLeft:', typeof client.onUserLeft);
  console.log('   onUserUpdated:', typeof client.onUserUpdated);
  console.log('   onNewMessage:', typeof client.onNewMessage);
  console.log('');
  
  console.log('🏥🏥🏥═══════════════════════════════════════════════════════');
  console.log('');
};

// Force resubscribe
window.forceResubscribe = async function() {
  console.log('');
  console.log('🔄🔄🔄═══════════════════════════════════════════════════════');
  console.log('🔄🔄🔄 FORCING RESUBSCRIPTION');
  console.log('🔄🔄🔄═══════════════════════════════════════════════════════');
  console.log('');
  
  if (!window.supabaseRealtimeClient || !window.supabaseRealtimeClient.currentPage) {
    console.error('❌ Cannot resubscribe - no current page');
    return;
  }
  
  const client = window.supabaseRealtimeClient;
  const pageId = client.currentPage.pageId;
  
  console.log('🗑️ Removing all existing subscriptions...');
  for (const [pid, channel] of client.channels.entries()) {
    console.log(`   Removing channel for page: ${pid}`);
    await client.supabase.removeChannel(channel);
    client.channels.delete(pid);
  }
  
  console.log('✅ All channels removed');
  console.log('');
  console.log('📡 Resubscribing to current page:', pageId);
  
  await client.subscribeToPageUpdates(pageId);
  
  console.log('');
  console.log('✅ Resubscription complete');
  console.log('   Watch for 📡📡📡 SUBSCRIBE_STATUS logs above');
  console.log('');
  console.log('🔄🔄🔄═══════════════════════════════════════════════════════');
  console.log('');
};

console.log('✅ Real-time subscription diagnostic tools loaded');
console.log('');
console.log('Available functions:');
console.log('  testRealtimeSubscription() - Test if real-time events are working');
console.log('  checkSubscriptionHealth() - Check subscription status');
console.log('  forceResubscribe() - Force resubscribe to current page');
console.log('');


