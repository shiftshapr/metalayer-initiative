// MINIMAL REAL-TIME SYSTEM
// This is a simplified, working real-time implementation
// Goal: Get basic real-time working first, then build up

class MinimalRealtimeSystem {
  constructor() {
    this.supabase = null;
    this.isConnected = false;
    this.currentPage = null;
    this.user = null;
    this.channels = new Map();
    
    console.log('🚀 MinimalRealtimeSystem: Initialized');
  }

  // Step 1: Simple initialization with hardcoded credentials
  async initialize() {
    try {
      console.log('🔧 MINIMAL: Starting simple initialization...');
      
      // Use hardcoded credentials for now (we'll fix this later)
      const SUPABASE_URL = 'https://zwxomzkmncwzwryvudwu.supabase.co';
      const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp3eG9temttbmN3endyeXZ1ZHd1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk2Njg2ODQsImV4cCI6MjA3NTI0NDY4NH0.CoceGOzumiF6aYVGQSWily93snNYh9N9C4p8lrjrTyM';
      
      // Always create a fresh Supabase client to avoid conflicts
      console.log('🔧 MINIMAL: Creating fresh Supabase client...');
      console.log('🔧 MINIMAL: Supabase library available:', typeof supabase);
      console.log('🔧 MINIMAL: createClient available:', typeof supabase?.createClient);
      
      // Check if supabase is properly loaded
      if (typeof supabase === 'undefined') {
        throw new Error('Supabase library not loaded. Make sure the CDN script is loaded.');
      }
      
      if (typeof supabase.createClient !== 'function') {
        throw new Error('supabase.createClient is not a function. Supabase library may not be loaded correctly.');
      }
      
      // Create new client instance
      this.supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
      window.supabase = this.supabase; // Store globally for compatibility
      
      console.log('✅ MINIMAL: Supabase client created');
      console.log('✅ MINIMAL: Client methods:', Object.keys(this.supabase).slice(0, 10));
      console.log('✅ MINIMAL: from method available:', typeof this.supabase.from);
      
      // Test connection
      const { data, error } = await this.supabase.from('messages').select('id').limit(1);
      if (error) {
        console.error('❌ MINIMAL: Database connection failed:', error);
        return false;
      }
      
      console.log('✅ MINIMAL: Database connection successful');
      this.isConnected = true;
      return true;
      
    } catch (error) {
      console.error('❌ MINIMAL: Initialization failed:', error);
      return false;
    }
  }

  // Step 2: Simple page join
  async joinPage(pageUrl) {
    try {
      console.log('🔧 MINIMAL: Joining page:', pageUrl);
      
      if (!this.isConnected) {
        console.error('❌ MINIMAL: Not connected to Supabase');
        return false;
      }
      
      // Create a simple channel name
      const channelName = `page-${btoa(pageUrl).replace(/[^a-zA-Z0-9]/g, '')}`;
      
      // Subscribe to real-time updates
      const channel = this.supabase
        .channel(channelName)
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'messages'
        }, (payload) => {
          console.log('📡 MINIMAL: Real-time message received:', payload);
          this.handleRealtimeMessage(payload);
        })
        .subscribe();
      
      this.channels.set(pageUrl, channel);
      this.currentPage = pageUrl;
      
      console.log('✅ MINIMAL: Joined page channel:', channelName);
      return true;
      
    } catch (error) {
      console.error('❌ MINIMAL: Failed to join page:', error);
      return false;
    }
  }

  // Step 3: Simple message sending
  async sendMessage(message) {
    try {
      console.log('🔧 MINIMAL: Sending message:', message);
      
      if (!this.isConnected) {
        console.error('❌ MINIMAL: Not connected to Supabase');
        return false;
      }
      
      // Insert message into database using correct schema
      const messageData = {
        content: message.content,
        user_email: message.userEmail || 'anonymous',
        user_id: message.userId || 'anonymous-user',
        page_id: this.currentPage
      };
      
      console.log('🔧 MINIMAL: Inserting message data:', messageData);
      
      const { data, error } = await this.supabase
        .from('messages')
        .insert([messageData]);
      
      if (error) {
        console.error('❌ MINIMAL: Failed to send message:', error);
        console.error('❌ MINIMAL: Error details:', {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint
        });
        return false;
      }
      
      console.log('✅ MINIMAL: Message inserted successfully:', data);
      
      console.log('✅ MINIMAL: Message sent successfully');
      return true;
      
    } catch (error) {
      console.error('❌ MINIMAL: Send message failed:', error);
      return false;
    }
  }

  // Step 4: Handle real-time messages
  handleRealtimeMessage(payload) {
    console.log('📡 MINIMAL: Handling real-time message:', payload);
    
    // Simple message display
    if (payload.eventType === 'INSERT') {
      const message = payload.new;
      console.log('📨 MINIMAL: New message:', message.content);
      
      // Trigger a simple event for the UI
      window.dispatchEvent(new CustomEvent('minimal-realtime-message', {
        detail: message
      }));
    }
  }

  // Step 5: Simple cleanup
  async leavePage() {
    try {
      console.log('🔧 MINIMAL: Leaving current page...');
      
      if (this.currentPage && this.channels.has(this.currentPage)) {
        const channel = this.channels.get(this.currentPage);
        await this.supabase.removeChannel(channel);
        this.channels.delete(this.currentPage);
      }
      
      this.currentPage = null;
      console.log('✅ MINIMAL: Left page successfully');
      
    } catch (error) {
      console.error('❌ MINIMAL: Failed to leave page:', error);
    }
  }

  // Step 6: Get status
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
window.minimalRealtime = new MinimalRealtimeSystem();

// Simple test function
window.testMinimalRealtime = async function() {
  console.log('🧪 MINIMAL: Starting test...');
  
  // Initialize
  const initialized = await window.minimalRealtime.initialize();
  if (!initialized) {
    console.error('❌ MINIMAL: Initialization failed');
    return;
  }
  
  // Join page
  const joined = await window.minimalRealtime.joinPage(window.location.href);
  if (!joined) {
    console.error('❌ MINIMAL: Failed to join page');
    return;
  }
  
  // Send test message
  const sent = await window.minimalRealtime.sendMessage({
    content: 'Test message from minimal real-time system',
    userEmail: 'test@example.com',
    userId: 'test-user-123'
  });
  
  if (sent) {
    console.log('✅ MINIMAL: Test completed successfully!');
    console.log('📊 MINIMAL: Status:', window.minimalRealtime.getStatus());
  } else {
    console.error('❌ MINIMAL: Test failed');
  }
};

console.log('✅ MINIMAL: Minimal real-time system loaded. Run testMinimalRealtime() to test.');
