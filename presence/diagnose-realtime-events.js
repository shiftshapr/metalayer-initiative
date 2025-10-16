/**
 * Real-Time Event Diagnostic Tool
 * Run these functions in the DevTools console to diagnose real-time event issues
 * Build: 2025-10-13-realtime-diagnostic-logging
 */

// Check if callbacks are properly registered
window.checkCallbacks = function() {
  console.log('');
  console.log('🔍 DIAGNOSTIC: Checking callback registration');
  console.log('═══════════════════════════════════════════════════════');
  
  const client = window.supabaseRealtimeClient;
  if (!client) {
    console.error('❌ supabaseRealtimeClient not found!');
    return;
  }
  
  console.log('✅ supabaseRealtimeClient exists');
  console.log('');
  console.log('Callback Status:');
  console.log('  onUserJoined:', typeof client.onUserJoined, client.onUserJoined ? '✅' : '❌');
  console.log('  onUserUpdated:', typeof client.onUserUpdated, client.onUserUpdated ? '✅' : '❌');
  console.log('  onUserLeft:', typeof client.onUserLeft, client.onUserLeft ? '✅' : '❌');
  console.log('');
  console.log('Connection Status:');
  console.log('  isConnected:', client.isConnected);
  console.log('  currentPage:', client.currentPage);
  console.log('  currentUser:', client.currentUser?.userEmail);
  console.log('');
  console.log('Active Channels:');
  const channels = Array.from(client.channels?.keys() || []);
  console.log('  Count:', channels.length);
  channels.forEach((ch, i) => console.log(`  ${i + 1}. ${ch}`));
  console.log('═══════════════════════════════════════════════════════');
};

// Check handler status
window.checkHandler = function() {
  console.log('');
  console.log('🔍 DIAGNOSTIC: Checking handler status');
  console.log('═══════════════════════════════════════════════════════');
  
  const handler = window.realtimePresenceHandler;
  if (!handler) {
    console.error('❌ realtimePresenceHandler not found!');
    return;
  }
  
  console.log('✅ realtimePresenceHandler exists');
  console.log('');
  console.log('Handler Status:');
  console.log('  currentPageId:', handler.currentPageId);
  console.log('  currentPageUrl:', handler.currentPageUrl);
  console.log('  isActive:', handler.isActive);
  console.log('  heartbeatInterval:', handler.heartbeatInterval ? 'Running' : 'Stopped');
  console.log('═══════════════════════════════════════════════════════');
};

// Check visibility data
window.checkVisibility = function() {
  console.log('');
  console.log('🔍 DIAGNOSTIC: Checking visibility data');
  console.log('═══════════════════════════════════════════════════════');
  
  const data = window.currentVisibilityData;
  if (!data) {
    console.error('❌ currentVisibilityData not found!');
    return;
  }
  
  console.log('✅ currentVisibilityData exists');
  console.log('');
  console.log('Active Users:', data.active?.length || 0);
  data.active?.forEach((user, i) => {
    console.log(`  ${i + 1}. ${user.email}`);
    console.log(`     isActive: ${user.isActive}`);
    console.log(`     status: ${user.status}`);
    console.log(`     lastSeen: ${user.lastSeen}`);
  });
  console.log('═══════════════════════════════════════════════════════');
};

// Manually trigger a test UPDATE event
window.testInactiveEvent = function() {
  console.log('');
  console.log('🧪 TEST: Simulating inactive user event');
  console.log('═══════════════════════════════════════════════════════');
  
  const client = window.supabaseRealtimeClient;
  const handler = window.realtimePresenceHandler;
  
  if (!client || !handler) {
    console.error('❌ Required components not found!');
    return;
  }
  
  const testEmail = 'test-inactive@example.com';
  const currentPage = handler.currentPageId;
  
  console.log('Creating test event:');
  console.log('  User:', testEmail);
  console.log('  Page:', currentPage);
  console.log('  Action: User became inactive (is_active: true → false)');
  console.log('');
  
  const payload = {
    eventType: 'UPDATE',
    new: {
      user_email: testEmail,
      page_id: currentPage,
      is_active: false,
      last_seen: new Date().toISOString(),
      enter_time: new Date(Date.now() - 300000).toISOString(), // 5 minutes ago
      aura_color: '#ff0000'
    },
    old: {
      user_email: testEmail,
      page_id: currentPage,
      is_active: true,
      last_seen: new Date(Date.now() - 1000).toISOString(),
      enter_time: new Date(Date.now() - 300000).toISOString(),
      aura_color: '#ff0000'
    }
  };
  
  console.log('Calling handlePresenceUpdate()...');
  client.handlePresenceUpdate(payload);
  console.log('');
  console.log('✅ Test event processed');
  console.log('Check console for event flow logs');
  console.log('═══════════════════════════════════════════════════════');
};

// Run full diagnostic check
window.runDiagnostics = function() {
  console.log('');
  console.log('🔬 RUNNING FULL DIAGNOSTICS');
  console.log('═══════════════════════════════════════════════════════');
  console.log('');
  
  window.checkCallbacks();
  console.log('');
  window.checkHandler();
  console.log('');
  window.checkVisibility();
  
  console.log('');
  console.log('✅ Diagnostics complete');
  console.log('');
  console.log('Next steps:');
  console.log('1. If callbacks are not registered, reload the extension');
  console.log('2. If handler is not active, check if presence tracking started');
  console.log('3. Run testInactiveEvent() to simulate a user leaving');
  console.log('═══════════════════════════════════════════════════════');
};

// Monitor real-time events (logs all events for 30 seconds)
window.monitorEvents = function(durationSeconds = 30) {
  console.log('');
  console.log('📡 MONITORING: Real-time events for', durationSeconds, 'seconds');
  console.log('═══════════════════════════════════════════════════════');
  console.log('Watching for:');
  console.log('  - 🔔 REALTIME_EVENT_ARRIVED (event received from Supabase)');
  console.log('  - 🔵 CALLBACK_INVOKED (callback function called)');
  console.log('  - 🟦 HANDLER_ENTRY (handler function entered)');
  console.log('  - 🚪 HANDLE_UPDATE (user removal logic)');
  console.log('');
  console.log('Monitoring started... (check console for events)');
  console.log('═══════════════════════════════════════════════════════');
  
  setTimeout(() => {
    console.log('');
    console.log('⏱️ MONITORING: Time expired');
    console.log('If no events appeared, the real-time subscription may not be working');
    console.log('═══════════════════════════════════════════════════════');
  }, durationSeconds * 1000);
};

// Check if both profiles are active (for multi-profile debugging)
window.checkBothProfiles = function() {
  console.log('');
  console.log('🔍 DIAGNOSTIC: Checking both profiles');
  console.log('═══════════════════════════════════════════════════════');
  
  const currentUser = window.supabaseRealtimeClient?.currentUser?.userEmail;
  const currentPage = window.realtimePresenceHandler?.currentPageId;
  const isActive = window.realtimePresenceHandler?.isActive;
  const visibilityCount = window.currentVisibilityData?.active?.length || 0;
  
  console.log('Current Profile:', currentUser);
  console.log('Current Page:', currentPage);
  console.log('Presence Active:', isActive);
  console.log('Visible Users:', visibilityCount);
  console.log('');
  
  if (visibilityCount === 0) {
    console.log('⚠️⚠️⚠️ NO OTHER USERS VISIBLE ⚠️⚠️⚠️');
    console.log('');
    console.log('This means the OTHER profile is not active!');
    console.log('');
    console.log('Make sure the OTHER profile has:');
    console.log('  1. ✅ Extension installed');
    console.log('  2. ✅ Sidepanel open (click extension icon)');
    console.log('  3. ✅ On the same page URL');
    console.log('  4. ✅ Console shows "🌐 JOIN_PAGE: === STARTING JOIN PAGE ==="');
    console.log('');
    console.log('Run this function on BOTH profiles to compare!');
  } else {
    console.log('✅ Other users are visible:', window.currentVisibilityData.active.map(u => u.email));
  }
  
  console.log('═══════════════════════════════════════════════════════');
};

// Export functions to window
console.log('✅ Real-Time Event Diagnostics loaded');
console.log('');
console.log('Available functions:');
console.log('  runDiagnostics()     - Run full diagnostic check');
console.log('  checkCallbacks()     - Check callback registration');
console.log('  checkHandler()       - Check handler status');
console.log('  checkVisibility()    - Check visibility data');
console.log('  testInactiveEvent()  - Simulate user becoming inactive');
console.log('  monitorEvents(30)    - Monitor events for 30 seconds');
console.log('  checkBothProfiles()  - Check if both profiles are active');
console.log('');
console.log('Quick start: runDiagnostics()');

