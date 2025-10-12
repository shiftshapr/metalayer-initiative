// WebSocket Connection Diagnostic Tool
// Created by TE2 (Test Engineer 2)
// Purpose: Diagnose why Supabase real-time events aren't being received

window.websocketDiagnostic = {
  /**
   * Check WebSocket connection status
   */
  checkConnection: function() {
    console.log('\n📡 WEBSOCKET_DIAGNOSTIC: === CONNECTION STATUS ===');
    
    const client = window.supabaseRealtimeClient;
    
    if (!client) {
      console.error('❌ DIAGNOSTIC: supabaseRealtimeClient not found');
      console.error('❌ Extension may not be properly initialized');
      return {
        status: 'error',
        message: 'supabaseRealtimeClient not found'
      };
    }
    
    // Check Supabase client
    console.log('✅ DIAGNOSTIC: supabaseRealtimeClient found');
    console.log('📊 DIAGNOSTIC: Supabase URL:', client.supabase?.supabaseUrl);
    console.log('📊 DIAGNOSTIC: Realtime URL:', client.supabase?.realtime Url);
    
    // Check channels
    if (!client.channels || client.channels.size === 0) {
      console.warn('⚠️ DIAGNOSTIC: NO CHANNELS FOUND');
      console.warn('⚠️ User may not be subscribed to any page');
      return {
        status: 'warning',
        message: 'No active channels',
        channels: []
      };
    }
    
    console.log(`📊 DIAGNOSTIC: Total channels: ${client.channels.size}`);
    
    const channelStatuses = [];
    let channelIndex = 0;
    
    for (const [pageId, channel] of client.channels.entries()) {
      channelIndex++;
      console.log(`\n📡 DIAGNOSTIC: Channel ${channelIndex}:`);
      console.log(`   Page ID: ${pageId}`);
      console.log(`   Topic: ${channel.topic || 'unknown'}`);
      console.log(`   State: ${channel.state || 'unknown'}`);
      
      // Check if subscribed
      const isSubscribed = channel.state === 'joined' || channel.state === 'connected';
      console.log(`   Subscribed: ${isSubscribed ? '✅' : '❌'}`);
      
      // Check socket
      if (channel.socket) {
        try {
          const socketConnected = channel.socket.isConnected ? channel.socket.isConnected() : 'unknown';
          const socketState = channel.socket.connectionState ? channel.socket.connectionState() : 'unknown';
          console.log(`   Socket connected: ${socketConnected}`);
          console.log(`   Socket state: ${socketState}`);
        } catch (e) {
          console.warn(`   ⚠️ Could not check socket status: ${e.message}`);
        }
      } else {
        console.warn(`   ⚠️ No socket object found`);
      }
      
      // Check bindings (event listeners)
      const bindingCount = channel.bindings?.length || (channel._events ? Object.keys(channel._events).length : 0);
      console.log(`   Event bindings: ${bindingCount}`);
      
      channelStatuses.push({
        pageId,
        state: channel.state,
        isSubscribed,
        bindingCount
      });
    }
    
    console.log('\n📡 WEBSOCKET_DIAGNOSTIC: === END ===\n');
    
    return {
      status: 'success',
      channelCount: client.channels.size,
      channels: channelStatuses
    };
  },
  
  /**
   * Test if postgres_changes events are being received
   * @param {number} duration - How long to monitor (ms), default 15 seconds
   */
  testEventReception: function(duration = 15000) {
    console.log('\n🧪 WEBSOCKET_TEST: === TESTING EVENT RECEPTION ===');
    console.log(`🧪 WEBSOCKET_TEST: Monitoring for ${duration / 1000} seconds...`);
    console.log('🧪 WEBSOCKET_TEST: Now have the OTHER user:');
    console.log('   1. Change their aura color');
    console.log('   2. Navigate to a different page');
    console.log('   3. Navigate back to this page');
    console.log('   4. Send a message\n');
    
    const eventsReceived = {
      presence: [],
      messages: [],
      visibility: [],
      other: []
    };
    
    // Hook into event handlers temporarily
    const client = window.supabaseRealtimeClient;
    
    if (!client) {
      console.error('❌ WEBSOCKET_TEST: supabaseRealtimeClient not found');
      return;
    }
    
    // Store original handlers
    const originalHandlers = {
      onUserJoined: client._onUserJoined,
      onUserUpdated: client._onUserUpdated,
      onUserLeft: client._onUserLeft,
      onNewMessage: client._onNewMessage,
      onVisibilityChanged: client._onVisibilityChanged
    };
    
    // Wrap handlers to log events
    client.onUserJoined = (user) => {
      console.log('🟢 WEBSOCKET_TEST: USER_JOINED event received!', user.user_email);
      eventsReceived.presence.push({ type: 'join', user: user.user_email, time: new Date() });
      if (originalHandlers.onUserJoined) originalHandlers.onUserJoined(user);
    };
    
    client.onUserUpdated = (user) => {
      console.log('🔵 WEBSOCKET_TEST: USER_UPDATED event received!', user.user_email);
      eventsReceived.presence.push({ type: 'update', user: user.user_email, time: new Date() });
      if (originalHandlers.onUserUpdated) originalHandlers.onUserUpdated(user);
    };
    
    client.onUserLeft = (user) => {
      console.log('🔴 WEBSOCKET_TEST: USER_LEFT event received!', user.user_email);
      eventsReceived.presence.push({ type: 'leave', user: user.user_email, time: new Date() });
      if (originalHandlers.onUserLeft) originalHandlers.onUserLeft(user);
    };
    
    client.onNewMessage = (message) => {
      console.log('💬 WEBSOCKET_TEST: NEW_MESSAGE event received!', message.user_email);
      eventsReceived.messages.push({ from: message.user_email, time: new Date() });
      if (originalHandlers.onNewMessage) originalHandlers.onNewMessage(message);
    };
    
    client.onVisibilityChanged = (visibility) => {
      console.log('👁️ WEBSOCKET_TEST: VISIBILITY_CHANGED event received!', visibility.user_email);
      eventsReceived.visibility.push({ user: visibility.user_email, time: new Date() });
      if (originalHandlers.onVisibilityChanged) originalHandlers.onVisibilityChanged(visibility);
    };
    
    // Report after duration
    setTimeout(() => {
      console.log('\n🧪 WEBSOCKET_TEST: === TEST RESULTS ===');
      console.log(`🧪 Duration: ${duration / 1000}s`);
      console.log(`🧪 Presence events: ${eventsReceived.presence.length}`);
      eventsReceived.presence.forEach((event, i) => {
        console.log(`   ${i + 1}. ${event.type}: ${event.user}`);
      });
      console.log(`🧪 Message events: ${eventsReceived.messages.length}`);
      eventsReceived.messages.forEach((event, i) => {
        console.log(`   ${i + 1}. from: ${event.from}`);
      });
      console.log(`🧪 Visibility events: ${eventsReceived.visibility.length}`);
      
      if (eventsReceived.presence.length === 0 && eventsReceived.messages.length === 0) {
        console.error('\n❌ WEBSOCKET_TEST: NO EVENTS RECEIVED!');
        console.error('❌ This indicates a CRITICAL problem:');
        console.error('   1. WebSocket connection is not established');
        console.error('   2. OR Supabase table replication is disabled');
        console.error('   3. OR Event handlers are not properly attached');
        console.error('   4. OR Network/firewall is blocking WSS traffic');
        console.error('\n🔧 RECOMMENDED ACTIONS:');
        console.error('   1. Check Supabase dashboard → Database → Replication');
        console.error('   2. Verify user_presence table has replication enabled');
        console.error('   3. Check browser console for WebSocket errors');
        console.error('   4. Try: window.websocketDiagnostic.forceReconnect()');
      } else {
        console.log('\n✅ WEBSOCKET_TEST: Events received successfully!');
        console.log('✅ Real-time system is working correctly');
      }
      
      console.log('\n🧪 WEBSOCKET_TEST: === END ===\n');
      
      // Restore original handlers
      client.onUserJoined = originalHandlers.onUserJoined;
      client.onUserUpdated = originalHandlers.onUserUpdated;
      client.onUserLeft = originalHandlers.onUserLeft;
      client.onNewMessage = originalHandlers.onNewMessage;
      client.onVisibilityChanged = originalHandlers.onVisibilityChanged;
      
      return eventsReceived;
    }, duration);
    
    return {
      message: `Monitoring for ${duration / 1000} seconds...`,
      checkResultsAfter: `${duration / 1000}s`
    };
  },
  
  /**
   * Force reconnect to Supabase real-time
   */
  forceReconnect: async function() {
    console.log('\n🔄 WEBSOCKET_RECONNECT: Forcing reconnection...');
    
    const client = window.supabaseRealtimeClient;
    
    if (!client) {
      console.error('❌ RECONNECT: supabaseRealtimeClient not found');
      return;
    }
    
    // Unsubscribe from all channels
    for (const [pageId, channel] of client.channels.entries()) {
      console.log(`📡 RECONNECT: Unsubscribing from ${pageId}...`);
      await channel.unsubscribe();
      client.channels.delete(pageId);
    }
    
    console.log('✅ RECONNECT: All channels unsubscribed');
    
    // Wait a moment
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Re-join current page
    if (client.currentPage) {
      console.log(`📡 RECONNECT: Re-joining current page: ${client.currentPage.pageId}`);
      await client.joinPage(
        client.currentPage.pageId,
        client.currentPage.pageUrl
      );
      console.log('✅ RECONNECT: Reconnection complete');
    } else {
      console.warn('⚠️ RECONNECT: No current page to rejoin');
    }
  },
  
  /**
   * Get full diagnostic report
   */
  fullReport: function() {
    console.log('\n📊 FULL_DIAGNOSTIC_REPORT: ==================');
    
    // 1. Connection status
    const connectionStatus = this.checkConnection();
    
    // 2. Current user
    const client = window.supabaseRealtimeClient;
    if (client && client.currentUser) {
      console.log('\n👤 Current User:');
      console.log(`   Email: ${client.currentUser.userEmail}`);
      console.log(`   ID: ${client.currentUser.userId}`);
    }
    
    // 3. Current page
    if (client && client.currentPage) {
      console.log('\n📄 Current Page:');
      console.log(`   Page ID: ${client.currentPage.pageId}`);
      console.log(`   URL: ${client.currentPage.pageUrl}`);
    }
    
    // 4. Recommendations
    console.log('\n💡 Recommendations:');
    if (connectionStatus.status === 'error') {
      console.log('   ❌ Initialize extension properly');
    } else if (connectionStatus.status === 'warning') {
      console.log('   ⚠️ Subscribe to a page first');
    } else if (connectionStatus.channelCount > 0) {
      const allSubscribed = connectionStatus.channels.every(c => c.isSubscribed);
      if (allSubscribed) {
        console.log('   ✅ All channels subscribed correctly');
        console.log('   🧪 Run: window.websocketDiagnostic.testEventReception(15000)');
      } else {
        console.log('   ⚠️ Some channels not subscribed');
        console.log('   🔧 Try: window.websocketDiagnostic.forceReconnect()');
      }
    }
    
    console.log('\n📊 FULL_DIAGNOSTIC_REPORT: ==================\n');
    
    return connectionStatus;
  }
};

console.log('✅ WebSocket Diagnostic Tool loaded');
console.log('   Check connection: window.websocketDiagnostic.checkConnection()');
console.log('   Test events:      window.websocketDiagnostic.testEventReception(15000)');
console.log('   Force reconnect:  window.websocketDiagnostic.forceReconnect()');
console.log('   Full report:      window.websocketDiagnostic.fullReport()');

// Auto-run diagnostic on load (after a delay)
setTimeout(() => {
  console.log('\n🤖 AUTO-DIAGNOSTIC: Running automatic check...');
  window.websocketDiagnostic.checkConnection();
}, 3000);

