// Real-time Event Monitor - Track all Supabase real-time events
// Usage: window.realtimeEventMonitor.startMonitoring(60000)  // Monitor for 60 seconds

window.realtimeEventMonitor = {
  monitoringActive: false,
  events: null,
  startTime: null,
  monitoringInterval: null,
  originalHandlers: {},
  
  /**
   * Start monitoring all real-time events
   * @param {number} duration - How long to monitor (ms), default 60 seconds
   * @param {boolean} verbose - Show all events in console (default: true)
   */
  startMonitoring: function(duration = 60000, verbose = true) {
    if (this.monitoringActive) {
      console.warn('⚠️ EVENT_MONITOR: Already monitoring. Stop first with stopMonitoring()');
      return;
    }
    
    console.log('📡 EVENT_MONITOR: ========================================');
    console.log('📡 EVENT_MONITOR: Starting real-time event monitoring...');
    console.log(`📡 EVENT_MONITOR: Duration: ${duration / 1000}s`);
    console.log(`📡 EVENT_MONITOR: Verbose: ${verbose}`);
    console.log('📡 EVENT_MONITOR: ========================================\n');
    
    this.monitoringActive = true;
    this.startTime = Date.now();
    this.events = {
      presence: [],
      messages: [],
      visibility: [],
      subscriptions: []
    };
    
    // Hook into existing handlers
    this.hookHandlers(verbose);
    
    // Auto-stop after duration
    setTimeout(() => {
      this.stopMonitoring();
    }, duration);
    
    // Periodic status updates every 10 seconds
    this.monitoringInterval = setInterval(() => {
      const elapsed = ((Date.now() - this.startTime) / 1000).toFixed(0);
      console.log(`📊 EVENT_MONITOR: [${elapsed}s] Presence: ${this.events.presence.length}, Messages: ${this.events.messages.length}, Visibility: ${this.events.visibility.length}`);
    }, 10000);
  },
  
  /**
   * Hook into Supabase event handlers
   */
  hookHandlers: function(verbose) {
    if (!window.supabaseRealtimeClient) {
      console.error('❌ EVENT_MONITOR: supabaseRealtimeClient not found');
      return;
    }
    
    // Save original handlers
    this.originalHandlers = {
      onUserJoined: window.supabaseRealtimeClient._onUserJoined,
      onUserUpdated: window.supabaseRealtimeClient._onUserUpdated,
      onUserLeft: window.supabaseRealtimeClient._onUserLeft,
      onNewMessage: window.supabaseRealtimeClient._onNewMessage,
      onVisibilityChanged: window.supabaseRealtimeClient._onVisibilityChanged
    };
    
    // Hook onUserJoined
    window.supabaseRealtimeClient.onUserJoined = (user) => {
      const event = {
        timestamp: Date.now(),
        relativeTime: ((Date.now() - this.startTime) / 1000).toFixed(2),
        type: 'presence_join',
        user: user.user_email,
        data: {
          email: user.user_email,
          page_id: user.page_id,
          aura_color: user.aura_color,
          enter_time: user.enter_time
        }
      };
      this.events.presence.push(event);
      
      if (verbose) {
        console.log(`\n🟢 [${event.relativeTime}s] USER_JOINED: ${user.user_email}`);
        console.log(`   Page: ${user.page_id}`);
        console.log(`   Aura: ${user.aura_color}`);
      }
      
      // Call original handler
      if (this.originalHandlers.onUserJoined) {
        this.originalHandlers.onUserJoined(user);
      }
    };
    
    // Hook onUserUpdated
    window.supabaseRealtimeClient.onUserUpdated = (user) => {
      const event = {
        timestamp: Date.now(),
        relativeTime: ((Date.now() - this.startTime) / 1000).toFixed(2),
        type: 'presence_update',
        user: user.user_email,
        data: {
          email: user.user_email,
          page_id: user.page_id,
          aura_color: user.aura_color,
          is_active: user.is_active,
          last_seen: user.last_seen
        }
      };
      this.events.presence.push(event);
      
      if (verbose) {
        console.log(`\n🔵 [${event.relativeTime}s] USER_UPDATED: ${user.user_email}`);
        console.log(`   Active: ${user.is_active}`);
        console.log(`   Aura: ${user.aura_color}`);
      }
      
      if (this.originalHandlers.onUserUpdated) {
        this.originalHandlers.onUserUpdated(user);
      }
    };
    
    // Hook onUserLeft
    window.supabaseRealtimeClient.onUserLeft = (user) => {
      const event = {
        timestamp: Date.now(),
        relativeTime: ((Date.now() - this.startTime) / 1000).toFixed(2),
        type: 'presence_leave',
        user: user.user_email,
        data: {
          email: user.user_email,
          page_id: user.page_id
        }
      };
      this.events.presence.push(event);
      
      if (verbose) {
        console.log(`\n🔴 [${event.relativeTime}s] USER_LEFT: ${user.user_email}`);
        console.log(`   Page: ${user.page_id}`);
      }
      
      if (this.originalHandlers.onUserLeft) {
        this.originalHandlers.onUserLeft(user);
      }
    };
    
    // Hook onNewMessage
    window.supabaseRealtimeClient.onNewMessage = (message) => {
      const event = {
        timestamp: Date.now(),
        relativeTime: ((Date.now() - this.startTime) / 1000).toFixed(2),
        type: 'new_message',
        from: message.user_email,
        data: {
          id: message.id,
          from: message.user_email,
          page_id: message.page_id,
          content: message.content?.substring(0, 50) + (message.content?.length > 50 ? '...' : ''),
          created_at: message.created_at
        }
      };
      this.events.messages.push(event);
      
      if (verbose) {
        console.log(`\n💬 [${event.relativeTime}s] NEW_MESSAGE: ${message.user_email}`);
        console.log(`   Content: ${event.data.content}`);
      }
      
      if (this.originalHandlers.onNewMessage) {
        this.originalHandlers.onNewMessage(message);
      }
    };
    
    // Hook onVisibilityChanged
    window.supabaseRealtimeClient.onVisibilityChanged = (visibility) => {
      const event = {
        timestamp: Date.now(),
        relativeTime: ((Date.now() - this.startTime) / 1000).toFixed(2),
        type: 'visibility_change',
        user: visibility.user_email,
        data: {
          email: visibility.user_email,
          page_id: visibility.page_id,
          is_visible: visibility.is_visible
        }
      };
      this.events.visibility.push(event);
      
      if (verbose) {
        console.log(`\n👁️ [${event.relativeTime}s] VISIBILITY_CHANGED: ${visibility.user_email}`);
        console.log(`   Visible: ${visibility.is_visible}`);
      }
      
      if (this.originalHandlers.onVisibilityChanged) {
        this.originalHandlers.onVisibilityChanged(visibility);
      }
    };
    
    console.log('✅ EVENT_MONITOR: Event handlers hooked');
  },
  
  /**
   * Stop monitoring and generate report
   */
  stopMonitoring: function() {
    if (!this.monitoringActive) {
      console.warn('⚠️ EVENT_MONITOR: Not currently monitoring');
      return;
    }
    
    console.log('\n📡 EVENT_MONITOR: ========================================');
    console.log('📡 EVENT_MONITOR: Stopping monitoring...');
    console.log('📡 EVENT_MONITOR: ========================================\n');
    
    this.monitoringActive = false;
    
    // Stop periodic updates
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }
    
    // Restore original handlers
    if (window.supabaseRealtimeClient && this.originalHandlers) {
      window.supabaseRealtimeClient.onUserJoined = this.originalHandlers.onUserJoined;
      window.supabaseRealtimeClient.onUserUpdated = this.originalHandlers.onUserUpdated;
      window.supabaseRealtimeClient.onUserLeft = this.originalHandlers.onUserLeft;
      window.supabaseRealtimeClient.onNewMessage = this.originalHandlers.onNewMessage;
      window.supabaseRealtimeClient.onVisibilityChanged = this.originalHandlers.onVisibilityChanged;
    }
    
    // Generate report
    this.generateReport();
  },
  
  /**
   * Generate monitoring report
   */
  generateReport: function() {
    if (!this.events) {
      console.warn('⚠️ EVENT_MONITOR: No event data available');
      return;
    }
    
    const elapsed = (Date.now() - this.startTime) / 1000;
    
    console.log('📊 EVENT_MONITOR: === MONITORING REPORT ===');
    console.log(`📊 Duration: ${elapsed.toFixed(2)}s`);
    console.log(`📊 Total events: ${this.events.presence.length + this.events.messages.length + this.events.visibility.length}`);
    console.log('');
    console.log(`🟢 Presence events: ${this.events.presence.length}`);
    console.log(`   Joins: ${this.events.presence.filter(e => e.type === 'presence_join').length}`);
    console.log(`   Updates: ${this.events.presence.filter(e => e.type === 'presence_update').length}`);
    console.log(`   Leaves: ${this.events.presence.filter(e => e.type === 'presence_leave').length}`);
    console.log('');
    console.log(`💬 Message events: ${this.events.messages.length}`);
    console.log('');
    console.log(`👁️ Visibility events: ${this.events.visibility.length}`);
    console.log('');
    
    // Event timeline
    console.log('📅 Event Timeline:');
    const allEvents = [
      ...this.events.presence,
      ...this.events.messages,
      ...this.events.visibility
    ].sort((a, b) => a.timestamp - b.timestamp);
    
    if (allEvents.length === 0) {
      console.log('   (No events recorded)');
    } else {
      allEvents.forEach((event, i) => {
        let icon = '📡';
        if (event.type.includes('message')) icon = '💬';
        else if (event.type.includes('join')) icon = '🟢';
        else if (event.type.includes('leave')) icon = '🔴';
        else if (event.type.includes('update')) icon = '🔵';
        else if (event.type.includes('visibility')) icon = '👁️';
        
        console.log(`  ${i + 1}. ${icon} [${event.relativeTime}s] ${event.type}: ${event.user || event.from}`);
      });
    }
    
    console.log('\n📊 EVENT_MONITOR: Report complete');
    console.log('📊 Access full data: window.realtimeEventMonitor.events');
    
    return {
      duration: elapsed,
      events: this.events,
      summary: {
        total: allEvents.length,
        presence: this.events.presence.length,
        messages: this.events.messages.length,
        visibility: this.events.visibility.length
      }
    };
  },
  
  /**
   * Get current event data
   */
  getEvents: function() {
    return this.events;
  },
  
  /**
   * Clear event data
   */
  clearEvents: function() {
    this.events = {
      presence: [],
      messages: [],
      visibility: [],
      subscriptions: []
    };
    console.log('✅ EVENT_MONITOR: Event data cleared');
  }
};

console.log('✅ Real-time Event Monitor loaded');
console.log('   Usage: window.realtimeEventMonitor.startMonitoring(60000)');
console.log('   Stop:  window.realtimeEventMonitor.stopMonitoring()');

