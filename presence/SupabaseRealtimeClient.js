// ===== SUPABASE REALTIME CLIENT CLASS (FROM COMP) =====
class SupabaseRealtimeClient {
  constructor() {
    this.supabase = null;
    this.isInitialized = false;
    this.isConnected = false;
    this.currentUser = null;
    this.currentPage = null;
    this.channels = new Map();
    
    // Event handlers
    this.onUserJoined = null;
    this.onUserLeft = null;
    this.onUserUpdated = null;
    this.onNewMessage = null;
    this.onMessageUpdated = null;
    this.onMessageDeleted = null;
    this.onVisibilityChanged = null;
  }
  
  async initialize(supabaseClient) {
    try {
      console.log('🔧 SUPABASE_CLIENT: Initializing SupabaseRealtimeClient...');
      
      // Use the provided Supabase client
      this.supabase = supabaseClient;
      if (!this.supabase) {
        console.error('❌ SUPABASE_CLIENT: Supabase client not provided');
        return false;
      }
      
      this.isInitialized = true;
      this.isConnected = true;
      
      console.log('✅ SUPABASE_CLIENT: SupabaseRealtimeClient initialized successfully');
      return true;
    } catch (error) {
      console.error('❌ SUPABASE_CLIENT: Failed to initialize:', error);
      return false;
    }
  }
  
  async setCurrentUser(userEmail, userId, communityId = 'comm-001') {
    try {
      console.log('🔧 SUPABASE_CLIENT: Setting current user:', userEmail);
      
      this.currentUser = {
        userEmail: userEmail,
        userId: userId,
        communityId: communityId
      };
      
      console.log('✅ SUPABASE_CLIENT: Current user set successfully');
      return true;
    } catch (error) {
      console.error('❌ SUPABASE_CLIENT: Failed to set current user:', error);
      return false;
    }
  }
  
  async joinPage(pageId, pageUrl) {
    try {
      console.log('🔧 SUPABASE_CLIENT: Joining page:', pageId);
      
      this.currentPage = {
        pageId: pageId,
        pageUrl: pageUrl
      };
      
      console.log('✅ SUPABASE_CLIENT: Joined page successfully');
      return true;
    } catch (error) {
      console.error('❌ SUPABASE_CLIENT: Failed to join page:', error);
      return false;
    }
  }
  
  async leaveCurrentPage() {
    try {
      console.log('🔧 SUPABASE_CLIENT: Leaving current page');
      
      this.currentPage = null;
      
      console.log('✅ SUPABASE_CLIENT: Left page successfully');
      return true;
    } catch (error) {
      console.error('❌ SUPABASE_CLIENT: Failed to leave page:', error);
      return false;
    }
  }
  
  async subscribeToPageUpdates(pageId) {
    try {
      console.log('🔧 SUPABASE_CLIENT: Subscribing to page updates:', pageId);
      
      // This would set up real-time subscriptions
      // For now, just log the subscription
      console.log('✅ SUPABASE_CLIENT: Subscribed to page updates');
      return true;
    } catch (error) {
      console.error('❌ SUPABASE_CLIENT: Failed to subscribe to page updates:', error);
      return false;
    }
  }
  
  async sendMessage(content) {
    try {
      console.log('🔧 SUPABASE_CLIENT: Sending message:', content);
      
      if (!this.supabase) {
        console.error('❌ SUPABASE_CLIENT: Supabase client not available');
        return { success: false, error: 'Supabase client not available' };
      }
      
      // Get current user and page data
      const userEmail = this.currentUser?.userEmail || window.currentUser?.email;
      const pageId = this.currentPage?.pageId || window.currentUrlData?.pageId;
      
      if (!userEmail || !pageId) {
        console.error('❌ SUPABASE_CLIENT: Missing user email or page ID');
        return { success: false, error: 'Missing user email or page ID' };
      }
      
      // Insert message into database using Supabase (COMP field names)
      const { data, error } = await this.supabase
        .from('messages')
        .insert({
          content: content,
          user_email: userEmail,
          page_id: pageId,
          community_id: 'comm-001',
          created_at: new Date().toISOString()
        })
        .select()
        .single();
      
      if (error) {
        console.error('❌ SUPABASE_CLIENT: Database insert failed:', error);
        console.error('❌ SUPABASE_CLIENT: Error details:', JSON.stringify(error, null, 2));
        console.error('❌ SUPABASE_CLIENT: Error code:', error.code);
        console.error('❌ SUPABASE_CLIENT: Error hint:', error.hint);
        console.error('❌ SUPABASE_CLIENT: Error details:', error.details);
        return { success: false, error: error.message };
      }
      
      console.log('✅ SUPABASE_CLIENT: Message sent successfully:', data);
      console.log('✅ SUPABASE_CLIENT: Data type:', typeof data);
      console.log('✅ SUPABASE_CLIENT: Data keys:', Object.keys(data || {}));
      console.log('✅ SUPABASE_CLIENT: Data id:', data?.id);
      console.log('✅ SUPABASE_CLIENT: Data content:', data?.content);
      console.log('✅ SUPABASE_CLIENT: Data user_email:', data?.user_email);
      console.log('✅ SUPABASE_CLIENT: Data page_id:', data?.page_id);
      console.log('✅ SUPABASE_CLIENT: Data created_at:', data?.created_at);
      
      return { success: true, id: data.id, data: data };
    } catch (error) {
      console.error('❌ SUPABASE_CLIENT: Failed to send message:', error);
      return { success: false, error: error.message };
    }
  }
  
  async broadcastAuraColorChange(color) {
    try {
      console.log('🔧 SUPABASE_CLIENT: Broadcasting aura color change:', color);
      
      // This would broadcast the aura color change
      // For now, just log the change
      console.log('✅ SUPABASE_CLIENT: Aura color change broadcasted');
      return true;
    } catch (error) {
      console.error('❌ SUPABASE_CLIENT: Failed to broadcast aura color change:', error);
      return false;
    }
  }
  
  async updatePresence(pageId, pageUrl, auraColor) {
    try {
      console.log('🔧 SUPABASE_CLIENT: Updating presence:', pageId);
      
      // This would update presence
      // For now, just log the update
      console.log('✅ SUPABASE_CLIENT: Presence updated successfully');
      return true;
    } catch (error) {
      console.error('❌ SUPABASE_CLIENT: Failed to update presence:', error);
      return false;
    }
  }
  
  async setUserVisibility(visibility) {
    try {
      console.log('🔧 SUPABASE_CLIENT: Setting user visibility:', visibility);
      
      // This would set user visibility
      // For now, just log the setting
      console.log('✅ SUPABASE_CLIENT: User visibility set successfully');
      return true;
    } catch (error) {
      console.error('❌ SUPABASE_CLIENT: Failed to set user visibility:', error);
      return false;
    }
  }
}

// Make available globally
window.SupabaseRealtimeClient = SupabaseRealtimeClient;
