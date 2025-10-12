// Test Suite: Notifications System Verification
// Tests for notification manager and real-time backend notifications
// Run in browser console: window.testNotifications.testAll()

window.testNotifications = {
  // Test notification manager initialization
  testInit: async () => {
    console.log('🧪 ========================================');
    console.log('🧪 TEST: Notification Manager Init');
    console.log('🧪 ========================================\n');
    
    if (!window.notificationManager) {
      console.error('❌ FAIL: window.notificationManager not found');
      return 'fail';
    }
    
    console.log('✅ window.notificationManager exists');
    console.log(`   Initialized: ${window.notificationManager.initialized}`);
    
    const types = window.notificationManager.getAllNotificationTypes();
    console.log(`\n📋 Notification Types (${types.length}):`);
    console.table(types.map(t => ({
      Type: t.type,
      Name: t.name,
      Enabled: t.enabled ? '✅' : '❌',
      Icon: t.icon
    })));
    
    return 'pass';
  },
  
  // Test local notification delivery
  testLocalNotification: async () => {
    console.log('\n🧪 ========================================');
    console.log('🧪 TEST: Local Notification Delivery');
    console.log('🧪 ========================================\n');
    
    if (!window.notificationManager) {
      console.error('❌ FAIL: window.notificationManager not found');
      return 'fail';
    }
    
    console.log('📤 Sending test notification...');
    
    await window.notificationManager.showNotification('MESSAGE_NEW', {
      authorName: 'Test User',
      content: 'This is a test notification from the test suite'
    });
    
    console.log('✅ Notification sent (check Chrome notifications)');
    console.log('   If you see a notification, local delivery works');
    
    return 'pass';
  },
  
  // Check for backend notification subscription
  testBackendSubscription: () => {
    console.log('\n🧪 ========================================');
    console.log('🧪 TEST: Backend Notification Subscription');
    console.log('🧪 ========================================\n');
    
    if (!window.supabaseRealtimeClient) {
      console.error('❌ FAIL: window.supabaseRealtimeClient not found');
      return 'fail';
    }
    
    console.log('🔍 Checking for notifications table subscription...');
    
    // Check all channels
    const channels = window.supabaseRealtimeClient.channels;
    let hasNotificationSubscription = false;
    let channelCount = 0;
    
    if (channels && channels.size > 0) {
      console.log(`\n📡 Found ${channels.size} active channels:`);
      
      for (const [pageId, channel] of channels) {
        channelCount++;
        console.log(`\n  Channel: ${pageId}`);
        
        // Check channel bindings
        if (channel.bindings && channel.bindings.postgres_changes) {
          const subscriptions = channel.bindings.postgres_changes;
          console.log(`    Subscriptions: ${subscriptions.length}`);
          
          subscriptions.forEach((sub, i) => {
            console.log(`      ${i+1}. Table: ${sub.filter?.table || 'unknown'}, Event: ${sub.filter?.event || '*'}`);
            
            if (sub.filter?.table === 'notifications') {
              hasNotificationSubscription = true;
              console.log('        ✅ Notifications subscription found!');
            }
          });
        } else {
          console.log('    No postgres_changes bindings');
        }
      }
    } else {
      console.log('   No active channels found');
    }
    
    console.log('\n📊 RESULTS:');
    console.log('─────────────────────────────────────────');
    
    if (hasNotificationSubscription) {
      console.log('✅ PASS: Backend notification subscription found');
      console.log('   Real-time notifications from backend are enabled');
      return 'pass';
    } else {
      console.error('❌ FAIL: NO backend notification subscription');
      console.error('   Notifications will only work for local events');
      console.error('   Cannot receive:');
      console.error('     - System announcements');
      console.error('     - Admin messages');
      console.error('     - Friend requests');
      console.error('     - Offline message notifications');
      console.error('\n🔧 FIX: Add this to supabase-realtime-client.js:');
      console.error('   .on(\'postgres_changes\', {');
      console.error('     event: \'INSERT\',');
      console.error('     schema: \'public\',');
      console.error('     table: \'notifications\',');
      console.error('     filter: `recipient_email=eq.${this.currentUser.userEmail}`');
      console.error('   }, (payload) => {');
      console.error('     this.handleNotificationReceived(payload);');
      console.error('   })');
      return 'fail';
    }
  },
  
  // Test notification preferences
  testPreferences: async () => {
    console.log('\n🧪 ========================================');
    console.log('🧪 TEST: Notification Preferences');
    console.log('🧪 ========================================\n');
    
    if (!window.notificationManager) {
      console.error('❌ FAIL: window.notificationManager not found');
      return 'fail';
    }
    
    console.log('🔍 Current preferences:');
    const types = window.notificationManager.getAllNotificationTypes();
    
    types.forEach(type => {
      const enabled = window.notificationManager.isEnabled(type.id);
      console.log(`  ${type.name}: ${enabled ? '✅ Enabled' : '❌ Disabled'}`);
    });
    
    console.log('\n✅ PASS: Preferences loaded');
    return 'pass';
  },
  
  // Test notification permission
  testPermission: async () => {
    console.log('\n🧪 ========================================');
    console.log('🧪 TEST: Chrome Notification Permission');
    console.log('🧪 ========================================\n');
    
    try {
      const permission = await chrome.notifications.getPermissionLevel();
      console.log(`🔐 Permission level: ${permission}`);
      
      if (permission === 'granted') {
        console.log('✅ PASS: Notifications are allowed');
        return 'pass';
      } else if (permission === 'denied') {
        console.error('❌ FAIL: Notifications are denied by user');
        console.error('   User must enable notifications in Chrome settings');
        return 'fail';
      } else {
        console.warn('⚠️  WARNING: Permission status unknown');
        return 'warning';
      }
    } catch (error) {
      console.error('❌ FAIL: Error checking notification permission:', error);
      return 'fail';
    }
  },
  
  // Simulate notification from backend
  simulateBackendNotification: async () => {
    console.log('\n🧪 ========================================');
    console.log('🧪 TEST: Simulate Backend Notification');
    console.log('🧪 ========================================\n');
    
    console.log('⚠️  NOTE: This simulates what SHOULD happen when');
    console.log('   a backend notification is received via Supabase');
    console.log('   Currently NOT implemented (see testBackendSubscription)');
    console.log('');
    
    // Simulate a notification payload from Supabase
    const simulatedPayload = {
      eventType: 'INSERT',
      new: {
        id: 'notif-' + Date.now(),
        type: 'SYSTEM_ANNOUNCEMENT',
        recipient_email: await window.getCurrentUserEmail(),
        title: 'System Announcement',
        message: 'This is a simulated backend notification',
        data: {
          url: 'https://example.com',
          timestamp: Date.now()
        },
        created_at: new Date().toISOString()
      }
    };
    
    console.log('📥 Simulated payload:');
    console.log(JSON.stringify(simulatedPayload, null, 2));
    
    // This is what the handler SHOULD do
    console.log('\n💡 Expected behavior:');
    console.log('   1. handleNotificationReceived() called');
    console.log('   2. notificationManager.showNotification() called');
    console.log('   3. Chrome notification appears');
    
    // Actually show the notification
    console.log('\n📤 Simulating notification display...');
    await window.notificationManager.showNotification('MESSAGE_NEW', {
      authorName: 'System',
      content: simulatedPayload.new.message
    });
    
    console.log('✅ Simulation complete (check Chrome notifications)');
  },
  
  // Run all tests
  testAll: async () => {
    console.log('🧪 ════════════════════════════════════════');
    console.log('🧪 NOTIFICATIONS - COMPREHENSIVE TEST SUITE');
    console.log('🧪 ════════════════════════════════════════\n');
    
    const results = {
      passed: 0,
      failed: 0,
      warnings: 0
    };
    
    // Test 1: Init
    const test1 = await window.testNotifications.testInit();
    if (test1 === 'pass') results.passed++;
    else if (test1 === 'fail') results.failed++;
    
    // Test 2: Permission
    const test2 = await window.testNotifications.testPermission();
    if (test2 === 'pass') results.passed++;
    else if (test2 === 'fail') results.failed++;
    else if (test2 === 'warning') results.warnings++;
    
    // Test 3: Preferences
    const test3 = await window.testNotifications.testPreferences();
    if (test3 === 'pass') results.passed++;
    else if (test3 === 'fail') results.failed++;
    
    // Test 4: Backend subscription (CRITICAL)
    const test4 = await window.testNotifications.testBackendSubscription();
    if (test4 === 'pass') results.passed++;
    else if (test4 === 'fail') results.failed++;
    
    // Test 5: Local notification
    const test5 = await window.testNotifications.testLocalNotification();
    if (test5 === 'pass') results.passed++;
    else if (test5 === 'fail') results.failed++;
    
    // Test 6: Simulate backend
    await window.testNotifications.simulateBackendNotification();
    
    // Final report
    console.log('\n🧪 ════════════════════════════════════════');
    console.log('🧪 FINAL RESULTS');
    console.log('🧪 ════════════════════════════════════════');
    console.log(`✅ Passed:   ${results.passed}`);
    console.log(`❌ Failed:   ${results.failed}`);
    console.log(`⚠️  Warnings: ${results.warnings}`);
    console.log('🧪 ════════════════════════════════════════\n');
    
    if (results.failed > 0) {
      console.error('❌ CRITICAL ISSUES FOUND');
      console.error('   Review failed tests above for details');
    }
    
    return results;
  }
};

console.log('✅ Notifications test suite loaded');
console.log('   Run: window.testNotifications.testAll()');

