/**
 * REACTION REAL-TIME DIAGNOSTIC
 * Tests why reaction counts are not propagating in real-time
 * 
 * Usage: Copy and paste this entire code block into browser console
 * Then call: runReactionRealtimeDiagnostic()
 */

console.log('🔍 REACTION REAL-TIME DIAGNOSTIC');
console.log('=================================');

class ReactionRealtimeDiagnostic {
  constructor() {
    this.results = [];
    this.testMessageId = null;
    this.originalHandler = null;
  }

  log(status, message, details = '') {
    const timestamp = new Date().toLocaleTimeString();
    const logEntry = `[${timestamp}] [${status.toUpperCase()}] ${message} ${details}`;
    console.log(logEntry);
    this.results.push(logEntry);
  }

  async setup() {
    this.log('INFO', 'Setting up reaction real-time diagnostic...');
    
    // Check if user is authenticated
    if (!window.currentUser || !window.currentUser.email) {
      this.log('ERROR', 'User not authenticated. Please log in first.');
      return false;
    }
    
    this.log('SUCCESS', `Authenticated as: ${window.currentUser.email}`);
    
    // Check if SupabaseRealtimeClient exists
    if (!window.supabaseRealtimeClient) {
      this.log('ERROR', 'SupabaseRealtimeClient not available');
      return false;
    }
    
    // Check if reaction channel exists
    if (!window.supabaseRealtimeClient.reactionChannel) {
      this.log('ERROR', 'Reaction channel not established');
      return false;
    }
    
    // Check channel state
    const channel = window.supabaseRealtimeClient.reactionChannel;
    const state = channel.state;
    this.log('INFO', `Reaction channel state: ${state}`);
    
    if (state !== 'joined' && state !== 'joined') {
      this.log('ERROR', `Reaction channel not active, state: ${state}`);
      return false;
    }
    
    // Find a test message
    const reactionBtns = document.querySelectorAll('.reaction-btn[data-message-id]');
    if (reactionBtns.length === 0) {
      this.log('ERROR', 'No reaction buttons found. Please ensure messages are loaded.');
      return false;
    }
    
    this.testMessageId = reactionBtns[0].dataset.messageId;
    this.log('SUCCESS', `Found test message: ${this.testMessageId}`);
    
    return true;
  }

  async testRealtimeSubscription() {
    this.log('INFO', 'Testing real-time subscription...');
    
    try {
      const channel = window.supabaseRealtimeClient.reactionChannel;
      
      // Check if we can see the subscription
      const subscriptions = channel.subscriptions || [];
      this.log('INFO', `Channel subscriptions: ${subscriptions.length}`);
      
      // Check if handleReactionChange exists
      if (typeof window.handleReactionChange !== 'function') {
        this.log('ERROR', 'handleReactionChange is not a function');
        return false;
      }
      
      this.log('SUCCESS', 'handleReactionChange function exists');
      
      // Test if we can call it directly
      const testPayload = {
        eventType: 'INSERT',
        new: {
          id: 'test-reaction-' + Date.now(),
          message_id: this.testMessageId,
          user_email: window.currentUser.email,
          emoji: '🧪',
          created_at: new Date().toISOString()
        }
      };
      
      this.log('INFO', 'Testing handleReactionChange directly...');
      window.handleReactionChange(testPayload);
      this.log('SUCCESS', 'handleReactionChange called successfully');
      
      return true;
      
    } catch (error) {
      this.log('ERROR', `Error testing real-time subscription: ${error.message}`);
      return false;
    }
  }

  async testDatabaseQuery() {
    this.log('INFO', 'Testing database query for reactions...');
    
    try {
      // Test if we can query reactions directly
      const { data, error } = await window.supabase
        .from('reactions')
        .select('*')
        .eq('message_id', this.testMessageId);
      
      if (error) {
        this.log('ERROR', `Database query failed: ${error.message}`);
        return false;
      }
      
      this.log('SUCCESS', `Found ${data.length} reactions for message ${this.testMessageId}`);
      this.log('INFO', 'Reactions:', data);
      
      return true;
      
    } catch (error) {
      this.log('ERROR', `Error testing database query: ${error.message}`);
      return false;
    }
  }

  async testMessageQuery() {
    this.log('INFO', 'Testing message query for page_id...');
    
    try {
      // Test if we can query the message to get page_id
      const { data, error } = await window.supabase
        .from('messages')
        .select('page_id')
        .eq('id', this.testMessageId)
        .single();
      
      if (error) {
        this.log('ERROR', `Message query failed: ${error.message}`);
        return false;
      }
      
      this.log('SUCCESS', `Message page_id: ${data.page_id}`);
      
      // Check if this matches current page
      const currentPageId = window.supabaseRealtimeClient.currentPage?.pageId;
      this.log('INFO', `Current page ID: ${currentPageId}`);
      
      if (data.page_id === currentPageId) {
        this.log('SUCCESS', 'Message belongs to current page');
        return true;
      } else {
        this.log('ERROR', 'Message does not belong to current page');
        return false;
      }
      
    } catch (error) {
      this.log('ERROR', `Error testing message query: ${error.message}`);
      return false;
    }
  }

  async testRealtimeEvent() {
    this.log('INFO', 'Testing real-time event reception...');
    
    try {
      // Add a temporary listener to see if events are received
      const originalHandler = window.handleReactionChange;
      let eventReceived = false;
      
      window.handleReactionChange = function(payload) {
        console.log('🧪 TEST: Real-time event received!', payload);
        eventReceived = true;
        originalHandler(payload);
      };
      
      // Add a reaction to trigger real-time event
      this.log('INFO', 'Adding test reaction to trigger real-time event...');
      const result = await window.addReactionToMessage(this.testMessageId, '🧪');
      
      if (result && result.success) {
        this.log('SUCCESS', 'Reaction added successfully');
        
        // Wait for real-time event
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        if (eventReceived) {
          this.log('SUCCESS', 'Real-time event was received!');
        } else {
          this.log('ERROR', 'Real-time event was NOT received');
        }
        
        // Restore original handler
        window.handleReactionChange = originalHandler;
        
        return eventReceived;
      } else {
        this.log('ERROR', 'Failed to add reaction');
        window.handleReactionChange = originalHandler;
        return false;
      }
      
    } catch (error) {
      this.log('ERROR', `Error testing real-time event: ${error.message}`);
      return false;
    }
  }

  async testSupabaseConnection() {
    this.log('INFO', 'Testing Supabase connection...');
    
    try {
      // Test basic Supabase connection
      const { data, error } = await window.supabase
        .from('reactions')
        .select('count')
        .limit(1);
      
      if (error) {
        this.log('ERROR', `Supabase connection failed: ${error.message}`);
        return false;
      }
      
      this.log('SUCCESS', 'Supabase connection is working');
      
      // Test real-time connection
      const realtime = window.supabase.realtime;
      if (!realtime) {
        this.log('ERROR', 'Supabase realtime not available');
        return false;
      }
      
      this.log('SUCCESS', 'Supabase realtime is available');
      
      // Check real-time channels
      const channels = realtime.channels || [];
      this.log('INFO', `Active real-time channels: ${channels.length}`);
      
      return true;
      
    } catch (error) {
      this.log('ERROR', `Error testing Supabase connection: ${error.message}`);
      return false;
    }
  }

  async runAll() {
    this.results = [];
    this.log('INFO', 'Starting reaction real-time diagnostic...');
    
    if (!(await this.setup())) {
      this.log('CRITICAL', 'Setup failed. Aborting tests.');
      return;
    }
    
    const test1 = await this.testSupabaseConnection();
    const test2 = await this.testRealtimeSubscription();
    const test3 = await this.testDatabaseQuery();
    const test4 = await this.testMessageQuery();
    const test5 = await this.testRealtimeEvent();
    
    const passedTests = [test1, test2, test3, test4, test5].filter(Boolean).length;
    const totalTests = 5;
    
    this.log('INFO', '=== DIAGNOSTIC RESULTS ===');
    this.log('INFO', `Supabase Connection: ${test1 ? 'PASS' : 'FAIL'}`);
    this.log('INFO', `Real-time Subscription: ${test2 ? 'PASS' : 'FAIL'}`);
    this.log('INFO', `Database Query: ${test3 ? 'PASS' : 'FAIL'}`);
    this.log('INFO', `Message Query: ${test4 ? 'PASS' : 'FAIL'}`);
    this.log('INFO', `Real-time Event: ${test5 ? 'PASS' : 'FAIL'}`);
    this.log('INFO', `Overall: ${passedTests}/${totalTests} tests passed`);
    
    if (passedTests === totalTests) {
      this.log('SUCCESS', '✅ All tests passed! Real-time system is working correctly.');
    } else {
      this.log('FAIL', '❌ Some tests failed. Real-time system has issues.');
      
      // Provide specific recommendations
      if (!test1) {
        this.log('RECOMMEND', 'Fix Supabase connection: Check API keys and network');
      }
      if (!test2) {
        this.log('RECOMMEND', 'Fix real-time subscription: Check channel state and handlers');
      }
      if (!test3) {
        this.log('RECOMMEND', 'Fix database query: Check RLS policies and permissions');
      }
      if (!test4) {
        this.log('RECOMMEND', 'Fix message query: Check message table and page_id field');
      }
      if (!test5) {
        this.log('RECOMMEND', 'Fix real-time events: Check Supabase real-time configuration');
      }
    }
    
    return {
      supabaseConnection: test1,
      realtimeSubscription: test2,
      databaseQuery: test3,
      messageQuery: test4,
      realtimeEvent: test5,
      overallSuccess: passedTests === totalTests
    };
  }
}

// Make test function globally available
window.runReactionRealtimeDiagnostic = async function() {
  const diagnostic = new ReactionRealtimeDiagnostic();
  return await diagnostic.runAll();
};

console.log('✅ Reaction real-time diagnostic loaded. Call runReactionRealtimeDiagnostic() to start.');






