/**
 * WebSocket Event Tracer (SD1 + TE2)
 * 
 * This tool intercepts and logs ALL WebSocket messages between the client
 * and Supabase Realtime to help diagnose why events aren't being received.
 * 
 * Root Cause Hypothesis:
 * - Client is subscribed ✅
 * - Database updates happen ✅
 * - BUT: No events arrive ❌
 * 
 * This could mean:
 * 1. Supabase is not sending events (backend issue - likely REPLICA IDENTITY)
 * 2. Events are sent but client doesn't receive them (WebSocket issue)
 * 3. Events are received but not processed (client callback issue)
 * 
 * This tool helps distinguish between these scenarios.
 */

window.traceWebSocketMessages = function() {
  console.log('');
  console.log('📡📡📡═══════════════════════════════════════════════════════');
  console.log('📡📡📡 WEBSOCKET MESSAGE TRACER');
  console.log('📡📡📡═══════════════════════════════════════════════════════');
  console.log('');
  
  if (!window.supabaseRealtimeClient) {
    console.error('❌ SupabaseRealtimeClient not initialized');
    return;
  }
  
  const client = window.supabaseRealtimeClient;
  const pageId = client.currentPage?.pageId;
  
  if (!pageId) {
    console.error('❌ No current page');
    return;
  }
  
  const channel = client.channels.get(pageId);
  
  if (!channel) {
    console.error('❌ No active channel for current page:', pageId);
    console.error('❌ Active channels:', Array.from(client.channels.keys()));
    return;
  }
  
  console.log('✅ Found channel:', channel.topic);
  console.log('✅ Channel state:', channel.state);
  console.log('');
  
  // Try to access the underlying Phoenix socket
  // Supabase JS client uses Phoenix Channels under the hood
  const socket = channel.socket;
  
  if (!socket) {
    console.error('❌ Could not access underlying WebSocket');
    console.log('');
    console.log('💡 Alternative approach: Monitor channel events');
    console.log('   The channel object has event bindings we can inspect');
    console.log('');
    console.log('📊 Channel bindings:', channel.bindings);
    return;
  }
  
  console.log('✅ Found underlying socket');
  console.log('📊 Socket connection state:', socket.connectionState());
  console.log('📊 Socket info:', {
    connectionState: socket.connectionState(),
    endPoint: socket.endPoint || 'N/A',
    channels: socket.channels?.length || 0
  });
  console.log('');
  
  // Try to intercept WebSocket onmessage
  const conn = socket.conn;
  
  if (!conn) {
    console.warn('⚠️ Could not access socket.conn');
    console.log('');
    console.log('💡 ALTERNATIVE: Monitor via channel events instead');
    console.log('   The channel has its own event system we can tap into');
    console.log('');
    
    // Alternative: Monitor channel-level events
    monitorChannelEvents(channel, pageId);
    return;
  }
  
  const originalOnMessage = conn.onmessage;
  
  if (!originalOnMessage) {
    console.warn('⚠️ socket.conn exists but onmessage handler not found');
    console.log('   This might mean the WebSocket isn\'t fully initialized');
    console.log('');
    console.log('💡 Falling back to channel event monitoring');
    console.log('');
    monitorChannelEvents(channel, pageId);
    return;
  }
  
  console.log('✅ Intercepting WebSocket messages...');
  console.log('');
  console.log('🔍 ALL WebSocket messages will be logged below');
  console.log('🔍 Look for messages with topic:', `realtime:page-${pageId}`);
  console.log('🔍 Look for event type: "postgres_changes"');
  console.log('');
  console.log('⏳ Monitoring for 60 seconds...');
  console.log('⏳ Perform a database update to trigger an event');
  console.log('   (Navigate to different page in other profile)');
  console.log('');
  
  let messagesReceived = 0;
  let relevantMessages = 0;
  let postgresChangesReceived = 0;
  
  conn.onmessage = function(event) {
    messagesReceived++;
    
    try {
      const data = JSON.parse(event.data);
      
      // Log ALL messages (with filtering option)
      console.log('');
      console.log('📨 WEBSOCKET MESSAGE #' + messagesReceived);
      console.log('───────────────────────────────────────────────────────────');
      console.log('📨 Topic:', data.topic);
      console.log('📨 Event:', data.event);
      console.log('📨 Ref:', data.ref);
      
      // Check if this is relevant to our page
      if (data.topic && data.topic.includes(pageId)) {
        relevantMessages++;
        console.log('🎯 RELEVANT MESSAGE FOR CURRENT PAGE!');
        console.log('🎯 Full payload:', JSON.stringify(data, null, 2));
        
        if (data.event === 'postgres_changes') {
          postgresChangesReceived++;
          console.log('');
          console.log('🔔🔔🔔 THIS IS A POSTGRES_CHANGES EVENT! 🔔🔔🔔');
          console.log('🔔 Event #' + postgresChangesReceived);
          console.log('🔔 This should trigger the presence update callback');
          console.log('🔔 Payload:', JSON.stringify(data.payload, null, 2));
          console.log('');
        }
      } else {
        console.log('📊 Payload preview:', JSON.stringify(data).substring(0, 200) + '...');
      }
    } catch (e) {
      console.log('📨 Raw data (not JSON):', event.data);
    }
    
    // Call original handler
    if (originalOnMessage) {
      originalOnMessage.call(socket.conn, event);
    }
  };
  
  // Restore after 60 seconds
  setTimeout(() => {
    socket.conn.onmessage = originalOnMessage;
    
    console.log('');
    console.log('📊📊📊═══════════════════════════════════════════════════════');
    console.log('📊📊📊 WEBSOCKET TRACE SUMMARY');
    console.log('📊📊📊═══════════════════════════════════════════════════════');
    console.log('');
    console.log('📊 Total messages received:', messagesReceived);
    console.log('📊 Relevant messages (for your page):', relevantMessages);
    console.log('📊 postgres_changes events:', postgresChangesReceived);
    console.log('');
    
    if (messagesReceived === 0) {
      console.error('❌❌❌ NO WebSocket messages received at all!');
      console.error('');
      console.error('🔧 DIAGNOSIS: WebSocket connection issue');
      console.error('   - Check if Supabase Realtime is enabled in dashboard');
      console.error('   - Check browser console for WebSocket errors');
      console.error('   - Check network tab for WebSocket connection');
    } else if (relevantMessages === 0) {
      console.error('❌❌❌ NO relevant messages for your page!');
      console.error('');
      console.error('🔧 DIAGNOSIS: Supabase is NOT broadcasting events');
      console.error('   - This confirms REPLICA IDENTITY issue');
      console.error('   - Run: ALTER TABLE public.user_presence REPLICA IDENTITY FULL;');
    } else {
      console.log('✅✅✅ WebSocket messages ARE being received!');
      console.log('');
      console.log('🔍 If callbacks aren\'t firing, check:');
      console.log('   1. Channel event bindings');
      console.log('   2. Callback function registration');
      console.log('   3. Error in callback function');
    }
    
    console.log('');
    console.log('📡 WebSocket tracer stopped');
    console.log('📊📊📊═══════════════════════════════════════════════════════');
    console.log('');
  }, 60000);
};

/**
 * Quick check: Are ANY WebSocket messages being received?
 */
window.quickWebSocketCheck = function() {
  console.log('');
  console.log('⚡⚡⚡ QUICK WEBSOCKET CHECK ⚡⚡⚡');
  console.log('');
  
  if (!window.supabaseRealtimeClient) {
    console.error('❌ SupabaseRealtimeClient not initialized');
    return;
  }
  
  const client = window.supabaseRealtimeClient;
  const pageId = client.currentPage?.pageId;
  const channel = pageId ? client.channels.get(pageId) : null;
  
  if (!channel) {
    console.error('❌ No active channel');
    return;
  }
  
  const socket = channel.socket;
  
  if (!socket) {
    console.error('❌ No socket found');
    return;
  }
  
  console.log('✅ Channel state:', channel.state);
  console.log('✅ Socket state:', socket.connectionState());
  console.log('');
  
  if (socket.connectionState() !== 'open') {
    console.error('❌ WebSocket is NOT open!');
    console.error('   Current state:', socket.connectionState());
    console.error('');
    console.error('🔧 FIX: WebSocket connection issue');
    console.error('   - Check network connectivity');
    console.error('   - Check if Supabase Realtime is enabled');
    console.error('   - Try reloading the extension');
  } else {
    console.log('✅ WebSocket is OPEN and connected');
    console.log('');
    console.log('💡 Next step: Run traceWebSocketMessages() to monitor traffic');
  }
  
  console.log('');
};

/**
 * Inspect channel event bindings
 */
window.inspectChannelBindings = function() {
  console.log('');
  console.log('🔍🔍🔍 CHANNEL EVENT BINDINGS INSPECTOR 🔍🔍🔍');
  console.log('');
  
  if (!window.supabaseRealtimeClient) {
    console.error('❌ SupabaseRealtimeClient not initialized');
    return;
  }
  
  const client = window.supabaseRealtimeClient;
  const pageId = client.currentPage?.pageId;
  const channel = pageId ? client.channels.get(pageId) : null;
  
  if (!channel) {
    console.error('❌ No active channel');
    return;
  }
  
  console.log('📊 Channel topic:', channel.topic);
  console.log('📊 Channel state:', channel.state);
  console.log('');
  console.log('📋 Event bindings registered:');
  console.log('───────────────────────────────────────────────────────────');
  
  if (channel.bindings && Array.isArray(channel.bindings)) {
    console.log('📊 Total bindings:', channel.bindings.length);
    console.log('');
    
    channel.bindings.forEach((binding, index) => {
      console.log(`📌 Binding #${index + 1}:`);
      console.log('   Type:', binding.type);
      console.log('   Event:', binding.event);
      console.log('   Filter:', binding.filter);
      console.log('   Callback exists:', typeof binding.callback === 'function');
      console.log('');
    });
    
    // Check for postgres_changes bindings
    const postgresBindings = channel.bindings.filter(b => 
      b.type === 'postgres_changes' || b.event === 'postgres_changes'
    );
    
    console.log('');
    console.log('🔍 postgres_changes bindings:', postgresBindings.length);
    
    if (postgresBindings.length === 0) {
      console.error('❌ NO postgres_changes bindings found!');
      console.error('   This means events won\'t be processed even if received');
    } else {
      console.log('✅ postgres_changes bindings exist');
    }
  } else {
    console.log('📊 Bindings structure:', channel.bindings);
  }
  
  console.log('');
};

/**
 * Alternative monitoring via channel events
 * (Used when WebSocket interception isn't possible)
 */
function monitorChannelEvents(channel, pageId) {
  console.log('📡 CHANNEL EVENT MONITOR');
  console.log('═══════════════════════════════════════════════════════════');
  console.log('');
  console.log('📋 Monitoring channel-level events for 60 seconds...');
  console.log('📋 This is an alternative to WebSocket interception');
  console.log('');
  console.log('⏳ Perform a database update to trigger an event');
  console.log('   (Navigate to different page in other profile)');
  console.log('');
  
  let eventsReceived = 0;
  let postgresChanges = 0;
  
  // Try to tap into the channel's internal event system
  // Supabase channels use an event emitter pattern
  const originalTrigger = channel.trigger;
  
  if (originalTrigger && typeof originalTrigger === 'function') {
    channel.trigger = function(event, payload, ref) {
      eventsReceived++;
      console.log('');
      console.log('📨 CHANNEL EVENT #' + eventsReceived);
      console.log('───────────────────────────────────────────────────────────');
      console.log('📨 Event:', event);
      console.log('📨 Ref:', ref);
      
      if (event === 'postgres_changes' || payload?.type === 'postgres_changes') {
        postgresChanges++;
        console.log('🔔 POSTGRES_CHANGES EVENT!');
        console.log('🔔 Payload:', JSON.stringify(payload, null, 2));
      } else {
        console.log('📊 Payload:', JSON.stringify(payload).substring(0, 200) + '...');
      }
      
      // Call original
      return originalTrigger.apply(this, arguments);
    };
    
    console.log('✅ Channel event monitor installed');
    console.log('');
    
    // Restore after 60 seconds
    setTimeout(() => {
      channel.trigger = originalTrigger;
      
      console.log('');
      console.log('📊📊📊 CHANNEL EVENT MONITOR SUMMARY');
      console.log('═══════════════════════════════════════════════════════════');
      console.log('');
      console.log('📊 Total events:', eventsReceived);
      console.log('📊 postgres_changes events:', postgresChanges);
      console.log('');
      
      if (eventsReceived === 0) {
        console.error('❌ NO channel events received');
        console.error('   This suggests the channel isn\'t processing any events');
      } else if (postgresChanges === 0) {
        console.error('❌ NO postgres_changes events');
        console.error('   This confirms REPLICA IDENTITY issue');
        console.error('   Run: ALTER TABLE public.user_presence REPLICA IDENTITY FULL;');
      } else {
        console.log('✅ postgres_changes events ARE being received!');
        console.log('   If callbacks aren\'t firing, check callback registration');
      }
      
      console.log('');
    }, 60000);
  } else {
    console.error('❌ Could not install channel event monitor');
    console.error('   Channel trigger method not found or not a function');
    console.log('');
    console.log('💡 ALTERNATIVE: Use the backend-based diagnostic instead');
    console.log('   Run: checkRealtimeBroadcast()');
  }
}

console.log('');
console.log('📡 WebSocket Event Tracer Loaded');
console.log('');
console.log('📋 Available commands:');
console.log('   quickWebSocketCheck()     - Check WebSocket connection status');
console.log('   traceWebSocketMessages()  - Monitor ALL WebSocket messages (60s)');
console.log('   inspectChannelBindings()  - Show registered event handlers');
console.log('');

