// SIMPLE REAL-TIME SYSTEM
// SD1 Senior Developer: Direct, working solution without complex diagnostics

class SimpleRealtimeSystem {
  constructor() {
    this.supabase = null;
    this.isConnected = false;
    this.currentPage = null;
    this.channels = new Map();
    
    console.log('🚀 SimpleRealtimeSystem: Initialized');
  }

  async initialize() {
    try {
      console.log('🔧 SIMPLE: Starting simple initialization...');
      
      // Create Supabase client directly
      const SUPABASE_URL = 'https://zwxomzkmncwzwryvudwu.supabase.co';
      const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp3eG9temttbmN3endyeXZ1ZHd1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk2Njg2ODQsImV4cCI6MjA3NTI0NDY4NH0.CoceGOzumiF6aYVGQSWily93snNYh9N9C4p8lrjrTyM';
      
      this.supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
      window.supabase = this.supabase;
      
      console.log('✅ SIMPLE: Supabase client created');
      
      // Test connection with known working schema
      const { data, error } = await this.supabase
        .from('messages')
        .select('id, content, user_email, page_id, created_at, updated_at, community_id')
        .limit(1);
      
      if (error) {
        console.error('❌ SIMPLE: Database connection failed:', error);
        return false;
      }
      
      this.isConnected = true;
      console.log('✅ SIMPLE: System initialized successfully');
      return true;
      
    } catch (error) {
      console.error('❌ SIMPLE: Initialization failed:', error);
      return false;
    }
  }

  async joinPage(pageUrl) {
    try {
      console.log('🔧 SIMPLE: Joining page:', pageUrl);
      
      if (!this.isConnected) {
        console.error('❌ SIMPLE: Not connected to Supabase');
        return false;
      }
      
      // Create channel name
      const channelName = `page-${btoa(pageUrl).replace(/[^a-zA-Z0-9]/g, '')}`;
      
      // Subscribe to real-time updates
      const channel = this.supabase
        .channel(channelName)
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'messages'
        }, (payload) => {
          console.log('📡 SIMPLE: Real-time message received:', payload);
          this.handleRealtimeMessage(payload);
        })
        .subscribe();
      
      this.channels.set(pageUrl, channel);
      this.currentPage = pageUrl;
      
      console.log('✅ SIMPLE: Joined page channel:', channelName);
      return true;
      
    } catch (error) {
      console.error('❌ SIMPLE: Failed to join page:', error);
      return false;
    }
  }

  async sendMessage(message) {
    try {
      console.log('🔧 SIMPLE: Sending message...');
      
      if (!this.isConnected) {
        console.error('❌ SIMPLE: Not connected to Supabase');
        return false;
      }
      
      // Use only the columns we know exist
      const messageData = {
        content: message.content,
        user_email: message.userEmail || 'anonymous',
        page_id: this.currentPage,
        community_id: 'comm-001'
      };
      
      console.log('🔧 SIMPLE: Inserting message data:', messageData);
      
      const { data, error } = await this.supabase
        .from('messages')
        .insert([messageData]);
      
      if (error) {
        console.error('❌ SIMPLE: Failed to send message:', error);
        console.error('❌ SIMPLE: Error details:', {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint
        });
        return false;
      }
      
      console.log('✅ SIMPLE: Message sent successfully:', data);
      return true;
      
    } catch (error) {
      console.error('❌ SIMPLE: Send message failed:', error);
      return false;
    }
  }

  handleRealtimeMessage(payload) {
    console.log('📡 SIMPLE: Handling real-time message:', payload);
    
    if (payload.eventType === 'INSERT') {
      const message = payload.new;
      console.log('📨 SIMPLE: New message:', message);
      
      // Trigger event for UI
      window.dispatchEvent(new CustomEvent('simple-realtime-message', {
        detail: message
      }));
    }
  }

  async leavePage() {
    try {
      console.log('🔧 SIMPLE: Leaving current page...');
      
      if (this.currentPage && this.channels.has(this.currentPage)) {
        const channel = this.channels.get(this.currentPage);
        await this.supabase.removeChannel(channel);
        this.channels.delete(this.currentPage);
      }
      
      this.currentPage = null;
      console.log('✅ SIMPLE: Left page successfully');
      
    } catch (error) {
      console.error('❌ SIMPLE: Failed to leave page:', error);
    }
  }

  getStatus() {
    return {
      isConnected: this.isConnected,
      currentPage: this.currentPage,
      channels: this.channels.size,
      supabase: !!this.supabase
    };
  }
}

// Global instance
window.simpleRealtime = new SimpleRealtimeSystem();

// Test function
window.testSimpleRealtime = async function() {
  console.log('🧪 SIMPLE: Starting simple real-time test...');
  
  // Initialize
  const initialized = await window.simpleRealtime.initialize();
  if (!initialized) {
    console.error('❌ SIMPLE: Initialization failed');
    return;
  }
  
  // Join page
  const joined = await window.simpleRealtime.joinPage(window.location.href);
  if (!joined) {
    console.error('❌ SIMPLE: Failed to join page');
    return;
  }
  
  // Send test message
  const sent = await window.simpleRealtime.sendMessage({
    content: 'Test message from simple real-time system',
    userEmail: 'test@example.com'
  });
  
  if (sent) {
    console.log('✅ SIMPLE: Test completed successfully!');
    console.log('📊 SIMPLE: Status:', window.simpleRealtime.getStatus());
  } else {
    console.error('❌ SIMPLE: Test failed');
  }
};

console.log('✅ SIMPLE: Simple real-time system loaded');
console.log('📋 SIMPLE: Run testSimpleRealtime() to test');
