// Supabase Real-time Client for Chrome Extension
// Replaces custom WebSocket implementation with Supabase real-time

class SupabaseRealtimeClient {
  constructor() {
    this.supabase = null;
    this.channels = new Map(); // pageId -> channel
    this.currentUser = null;
    this.currentPage = null;
    this.isConnected = false;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    
    console.log('🚀 Supabase Real-time Client initialized');
  }

  async initialize(supabaseUrl, supabaseKey) {
    try {
      console.log('🔍 SUPABASE_CLIENT: Initializing with window.supabase...');
      console.log('🔍 SUPABASE_CLIENT: window.supabase available:', typeof window !== 'undefined' && typeof window.supabase !== 'undefined');
      console.log('🔍 SUPABASE_CLIENT: window.supabase.createClient:', typeof window !== 'undefined' && window.supabase ? typeof window.supabase.createClient : 'N/A');
      
      // window.supabase is already the client instance (created in sidepanel.js)
      // NOT the library, so we just assign it directly
      if (typeof window !== 'undefined' && window.supabase && typeof window.supabase.from === 'function') {
        this.supabase = window.supabase;  // Use the existing client instance
        console.log('✅ SUPABASE_CLIENT: Using existing client instance from window.supabase');
        console.log('✅ SUPABASE_CLIENT: Client methods:', Object.keys(this.supabase).slice(0, 10));
      } else {
        console.error('❌ SUPABASE_CLIENT: window.supabase not available');
        console.error('❌ SUPABASE_CLIENT: typeof window:', typeof window);
        console.error('❌ SUPABASE_CLIENT: window.supabase:', typeof window !== 'undefined' ? typeof window.supabase : 'N/A');
        console.error('❌ SUPABASE_CLIENT: Available window keys:', typeof window !== 'undefined' ? Object.keys(window).filter(key => key.toLowerCase().includes('supabase')) : []);
        return false;
      }
      
      console.log('✅ Supabase client initialized');
      
      // Test connection
      const { data, error } = await this.supabase
        .from('user_presence')
        .select('count');
      
      if (error) {
        console.error('❌ Supabase connection failed:', error);
        return false;
      }
      
      this.isConnected = true;
      console.log('✅ Supabase Real-time Client connected');
      return true;
    } catch (error) {
      console.error('❌ Failed to initialize Supabase Real-time Client:', error);
      return false;
    }
  }

  async setCurrentUser(userEmail, userId) {
    this.currentUser = { userEmail, userId };
    console.log('👤 Current user set:', userEmail);
  }

  async joinPage(pageId, pageUrl) {
    console.log('🌐 JOIN_PAGE: === STARTING JOIN PAGE ===');
    console.log('🌐 JOIN_PAGE: Page ID:', pageId);
    console.log('🌐 JOIN_PAGE: Page URL:', pageUrl);
    console.log('🌐 JOIN_PAGE: Current user:', this.currentUser?.userEmail);
    
    if (!this.currentUser) {
      console.error('❌ JOIN_PAGE: No current user set - cannot join page');
      return;
    }

    this.currentPage = { pageId, pageUrl };
    console.log('🌐 JOIN_PAGE: Set currentPage:', this.currentPage);
    
    // Update user presence (sends INSERT/UPDATE to database)
    console.log('🌐 JOIN_PAGE: Step 1 - Updating presence in database...');
    await this.updatePresence(pageId, pageUrl);
    console.log('🌐 JOIN_PAGE: Step 1 - Presence updated ✅');
    
    // Subscribe to real-time updates for this page (WebSocket subscription)
    console.log('🌐 JOIN_PAGE: Step 2 - Subscribing to real-time updates...');
    await this.subscribeToPageUpdates(pageId);
    console.log('🌐 JOIN_PAGE: Step 2 - Subscribed to updates ✅');
    
    console.log('✅ JOIN_PAGE: === COMPLETED JOIN PAGE ===');
    console.log('✅ JOIN_PAGE: Joined page:', pageUrl);
    console.log('✅ JOIN_PAGE: Now listening for presence/message changes on page:', pageId);
  }

  async updatePresence(pageId, pageUrl, auraColor = null) {
    if (!this.currentUser) {
      console.log('❌ PRESENCE_UPDATE: No current user, skipping presence update');
      return;
    }

    // Check if Supabase client is initialized
    if (!this.supabase) {
      console.error('❌ PRESENCE_UPDATE: Supabase client not initialized. Call initialize() first.');
      console.error('❌ PRESENCE_UPDATE: this.supabase:', this.supabase);
      return;
    }

    console.log(`🔍 PRESENCE_UPDATE: === STARTING PRESENCE UPDATE ===`);
    console.log(`🔍 PRESENCE_UPDATE: Supabase client:`, this.supabase);
    console.log(`🔍 PRESENCE_UPDATE: User: ${this.currentUser.userEmail} (${this.currentUser.userId})`);
    console.log(`🔍 PRESENCE_UPDATE: Page: ${pageId}`);
    console.log(`🔍 PRESENCE_UPDATE: URL: ${pageUrl}`);
    console.log(`🔍 PRESENCE_UPDATE: Aura: ${auraColor || 'none'}`);

    // CRITICAL FIX: Check if this is a new session (user entering for the first time OR re-entering after leaving)
    // Query existing presence to see if enter_time exists AND if user was previously inactive
    // NOTE: Removed .single() to avoid HTTP 406 errors when record doesn't exist yet
    const { data: existingPresence, error: queryError } = await this.supabase
      .from('user_presence')
      .select('enter_time, is_active')
      .eq('user_email', this.currentUser.userEmail)
      .eq('page_id', pageId);
    
    // CRITICAL FIX: Detect extension reload by checking sessionStorage
    // This allows enter_time to reset when user reloads extension, even if they were continuously active
    const sessionKey = `extension_session_${this.currentUser.userEmail}_${pageId}`;
    const currentSessionId = sessionStorage.getItem(sessionKey);
    const newSessionId = Date.now().toString();
    
    if (!currentSessionId) {
      // First time this session - mark it
      sessionStorage.setItem(sessionKey, newSessionId);
      console.log(`🔄 PRESENCE_UPDATE: NEW EXTENSION SESSION detected - will reset enter_time`);
    }
    
    const isExtensionReload = !currentSessionId; // True if extension just reloaded
    
    // Check if this is a new session (no record, no enter_time, was previously inactive, OR extension just reloaded)
    const hasExistingRecord = existingPresence && existingPresence.length > 0;
    const existingEnterTime = hasExistingRecord ? existingPresence[0].enter_time : null;
    const wasInactive = hasExistingRecord ? !existingPresence[0].is_active : true;
    const isNewSession = !hasExistingRecord || !existingEnterTime || wasInactive || isExtensionReload;
    
    console.log(`🔍 PRESENCE_UPDATE: Is new session: ${isNewSession}, existing enter_time: ${existingEnterTime}, was inactive: ${wasInactive}, extension reload: ${isExtensionReload}`);

    const presenceData = {
      user_email: this.currentUser.userEmail,
      page_id: pageId,
      page_url: pageUrl,
      is_active: true,
      last_seen: new Date().toISOString()
    };
    
    // CRITICAL FIX: Only set enter_time on first ENTER, not on every heartbeat!
    if (isNewSession) {
      presenceData.enter_time = new Date().toISOString();
      console.log(`🔍 PRESENCE_UPDATE: Setting enter_time (NEW SESSION): ${presenceData.enter_time}`);
    } else {
      console.log(`🔍 PRESENCE_UPDATE: Keeping existing enter_time (HEARTBEAT): ${existingEnterTime}`);
    }

    if (auraColor) {
      presenceData.aura_color = auraColor;
    }

    console.log(`🔍 PRESENCE_UPDATE: Data being sent:`, JSON.stringify(presenceData, null, 2));

    try {
      const { error } = await this.supabase
        .from('user_presence')
        .upsert(presenceData, { 
          onConflict: 'user_email,page_id',
          ignoreDuplicates: false 
        });

      if (error) {
        console.error('❌ Failed to update presence:', error);
        console.error('❌ Error details:', JSON.stringify(error, null, 2));
      } else {
        console.log('✅ Presence updated for page:', pageId);
        console.log(`✅ PRESENCE_UPDATE: Successfully updated presence for ${this.currentUser.userEmail} on ${pageId}`);
      }
    } catch (error) {
      console.error('❌ Error updating presence:', error);
      console.error('❌ Error stack:', error.stack);
    }
  }

  // CRITICAL FIX: Add explicit EXIT method to mark user as inactive on old page
  // This prevents "ghost presence" where user appears on old page for 30 seconds
  async leaveCurrentPage() {
    console.log('🚪 LEAVE_PAGE: === STARTING LEAVE PAGE ===');
    console.log('🚪 LEAVE_PAGE: Current user:', this.currentUser?.userEmail);
    console.log('🚪 LEAVE_PAGE: Current page:', this.currentPage?.pageId);
    
    if (!this.currentUser || !this.currentPage) {
      console.log('🔍 LEAVE_PAGE: No current user or page, skipping EXIT');
      return;
    }

    if (!this.supabase) {
      console.error('❌ LEAVE_PAGE: Supabase client not initialized');
      return;
    }

    const { pageId, pageUrl } = this.currentPage;

    console.log(`🚪 LEAVE_PAGE: Leaving page: ${pageId}`);
    console.log(`🚪 LEAVE_PAGE: User: ${this.currentUser.userEmail}`);
    console.log(`🚪 LEAVE_PAGE: URL: ${pageUrl}`);

    try {
      // Mark user as inactive on this page
      console.log('🚪 LEAVE_PAGE: Step 1 - Marking user as inactive in database...');
      const { error } = await this.supabase
        .from('user_presence')
        .update({
          is_active: false,
          last_seen: new Date().toISOString()
        })
        .eq('user_email', this.currentUser.userEmail)
        .eq('page_id', pageId);

      if (error) {
        console.error('❌ LEAVE_PAGE: Failed to mark as inactive:', error);
        console.error('❌ LEAVE_PAGE: Error details:', JSON.stringify(error, null, 2));
      } else {
        console.log(`✅ LEAVE_PAGE: Marked ${this.currentUser.userEmail} as inactive on ${pageId}`);
        console.log('✅ LEAVE_PAGE: Database UPDATE sent - other users will receive postgres_changes event');
      }
    } catch (error) {
      console.error('❌ LEAVE_PAGE: Error leaving page:', error);
      console.error('❌ LEAVE_PAGE: Error stack:', error.stack);
    }

    // Unsubscribe from this page's channel
    console.log('🚪 LEAVE_PAGE: Step 2 - Unsubscribing from page channel...');
    if (this.channels.has(pageId)) {
      const channel = this.channels.get(pageId);
      await this.supabase.removeChannel(channel);
      this.channels.delete(pageId);
      console.log('✅ LEAVE_PAGE: Unsubscribed from channel:', `page-${pageId}`);
    } else {
      console.log('⚠️ LEAVE_PAGE: No active channel found for page:', pageId);
    }
    
    console.log('🚪 LEAVE_PAGE: Active channels after leaving:', Array.from(this.channels.keys()));

    // Clear current page reference
    this.currentPage = null;
    console.log('✅ LEAVE_PAGE: === COMPLETED LEAVE PAGE ===');
  }

  async subscribeToPageUpdates(pageId) {
    console.log('📡 SUBSCRIBE: === STARTING SUBSCRIPTION SETUP ===');
    console.log('📡 SUBSCRIBE: Page ID:', pageId);
    console.log('📡 SUBSCRIBE: Current page:', this.currentPage);
    
    if (!this.currentPage) {
      console.error('❌ SUBSCRIBE: No current page set - cannot subscribe');
      return;
    }

    // Check if already subscribed to this page
    if (this.channels.has(pageId)) {
      console.warn('⚠️ SUBSCRIBE: Already subscribed to this page, unsubscribing old channel first');
      const oldChannel = this.channels.get(pageId);
      await this.supabase.removeChannel(oldChannel);
      this.channels.delete(pageId);
      console.log('🗑️ SUBSCRIBE: Removed old subscription');
    }

    try {
      console.log('📡 SUBSCRIBE: Creating channel:', `page-${pageId}`);
      const channel = this.supabase
        .channel(`page-${pageId}`)
        .on('postgres_changes', 
          { 
            event: '*', 
            schema: 'public', 
            table: 'user_presence',
            filter: `page_id=eq.${pageId}`
          },
          (payload) => {
            console.log('👁️ REALTIME_EVENT: Presence update received');
            console.log('👁️ REALTIME_EVENT: Event type:', payload.eventType);
            console.log('👁️ REALTIME_EVENT: User:', payload.new?.user_email || payload.old?.user_email);
            console.log('👁️ REALTIME_EVENT: Full payload:', JSON.stringify(payload, null, 2));
            this.handlePresenceUpdate(payload);
          }
        )
        .on('postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'messages',
            filter: `page_id=eq.${pageId}`
          },
          (payload) => {
            console.log('💬 REALTIME_EVENT: New message received');
            console.log('💬 REALTIME_EVENT: From:', payload.new?.user_email);
            console.log('💬 REALTIME_EVENT: Content:', payload.new?.content?.substring(0, 50) + '...');
            console.log('💬 REALTIME_EVENT: Full payload:', JSON.stringify(payload, null, 2));
            this.handleNewMessage(payload);
          }
        )
        .on('postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'user_visibility',
            filter: `page_id=eq.${pageId}`
          },
          (payload) => {
            console.log('👁️ REALTIME_EVENT: Visibility update received');
            console.log('👁️ REALTIME_EVENT: User:', payload.new?.user_email || payload.old?.user_email);
            console.log('👁️ REALTIME_EVENT: Full payload:', JSON.stringify(payload, null, 2));
            this.handleVisibilityUpdate(payload);
          }
        )
        .subscribe((status) => {
          console.log('📡 SUBSCRIBE_STATUS: Subscription status changed:', status);
          
          if (status === 'SUBSCRIBED') {
            console.log('✅ SUBSCRIBE_STATUS: Successfully subscribed to real-time updates');
            console.log('✅ SUBSCRIBE_STATUS: Now listening for:');
            console.log('   - Presence changes (user_presence table)');
            console.log('   - New messages (messages table)');
            console.log('   - Visibility updates (user_visibility table)');
            console.log('   - Filter: page_id=' + pageId);
            this.isConnected = true;
          } else if (status === 'CHANNEL_ERROR') {
            console.error('❌ SUBSCRIBE_STATUS: Channel error - subscription failed');
            this.isConnected = false;
          } else if (status === 'TIMED_OUT') {
            console.error('❌ SUBSCRIBE_STATUS: Subscription timed out');
            this.isConnected = false;
          } else if (status === 'CLOSED') {
            console.warn('⚠️ SUBSCRIBE_STATUS: Channel closed');
            this.isConnected = false;
          } else {
            console.log('📡 SUBSCRIBE_STATUS: Status:', status);
            this.isConnected = status === 'SUBSCRIBED';
          }
        });

      this.channels.set(pageId, channel);
      console.log('✅ SUBSCRIBE: Channel stored in channels map');
      console.log('✅ SUBSCRIBE: Active channels:', Array.from(this.channels.keys()));
      console.log('✅ SUBSCRIBE: === COMPLETED SUBSCRIPTION SETUP ===');
    } catch (error) {
      console.error('❌ SUBSCRIBE: Error subscribing to page updates:', error);
      console.error('❌ SUBSCRIBE: Error stack:', error.stack);
    }
  }

  handlePresenceUpdate(payload) {
    const { eventType, new: newRecord, old: oldRecord } = payload;
    
    switch (eventType) {
      case 'INSERT':
        console.log('👋 User joined page:', newRecord.user_email);
        this.onUserJoined?.(newRecord);
        break;
      case 'UPDATE':
        console.log('🔄 User presence updated:', newRecord.user_email);
        this.onUserUpdated?.(newRecord);
        break;
      case 'DELETE':
        console.log('👋 User left page:', oldRecord.user_email);
        this.onUserLeft?.(oldRecord);
        break;
    }
  }

  handleNewMessage(payload) {
    const { new: message } = payload;
    console.log('💬 New message from:', message.user_email);
    this.onNewMessage?.(message);
  }

  handleVisibilityUpdate(payload) {
    const { new: visibility } = payload;
    console.log('👁️ Visibility update for:', visibility.user_email, 'visible:', visibility.is_visible);
    this.onVisibilityChanged?.(visibility);
  }

  async broadcastAuraColorChange(color) {
    if (!this.currentUser || !this.currentPage) return;

    try {
      const { error } = await this.supabase
        .from('user_presence')
        .update({ 
          aura_color: color,
          updated_at: new Date().toISOString()
        })
        .eq('user_email', this.currentUser.userEmail)
        .eq('page_id', this.currentPage.pageId);

      if (error) {
        console.error('❌ Failed to broadcast aura color:', error);
      } else {
        console.log('🎨 Aura color broadcasted:', color);
      }
    } catch (error) {
      console.error('❌ Error broadcasting aura color:', error);
    }
  }

  async sendMessage(content) {
    if (!this.currentUser || !this.currentPage) return;

    try {
      const { error } = await this.supabase
        .from('messages')
        .insert({
          page_id: this.currentPage.pageId,
          user_email: this.currentUser.userEmail,
          content: content
        });

      if (error) {
        console.error('❌ Failed to send message:', error);
      } else {
        console.log('💬 Message sent:', content);
      }
    } catch (error) {
      console.error('❌ Error sending message:', error);
    }
  }

  async getPageUsers(pageId) {
    try {
      const { data, error } = await this.supabase
        .from('user_presence')
        .select('*')
        .eq('page_id', pageId)
        .eq('is_active', true);

      if (error) {
        console.error('❌ Failed to get page users:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('❌ Error getting page users:', error);
      return [];
    }
  }

  async setUserVisibility(isVisible, pageUrl = null) {
    if (!this.currentUser) {
      console.error('❌ No current user set for visibility update');
      return;
    }

    try {
      const { error } = await this.supabase
        .from('user_visibility')
        .upsert({
          user_email: this.currentUser.userEmail,
          page_id: pageUrl || this.currentPage?.pageId,
          is_visible: isVisible,
          last_updated: new Date().toISOString()
        }, {
          onConflict: 'user_email,page_id',
          ignoreDuplicates: false
        });

      if (error) {
        console.error('❌ Failed to update visibility:', error);
        return false;
      } else {
        console.log(`👁️ User ${isVisible ? 'visible' : 'invisible'} via Supabase real-time`);
        return true;
      }
    } catch (error) {
      console.error('❌ Error updating visibility:', error);
      return false;
    }
  }

  async leavePage() {
    if (!this.currentUser || !this.currentPage) return;

    try {
      // Mark user as inactive
      const { error } = await this.supabase
        .from('user_presence')
        .update({ 
          is_active: false,
          updated_at: new Date().toISOString()
        })
        .eq('user_email', this.currentUser.userEmail)
        .eq('page_id', this.currentPage.pageId);

      if (error) {
        console.error('❌ Failed to leave page:', error);
      } else {
        console.log('👋 Left page:', this.currentPage.pageUrl);
      }
    } catch (error) {
      console.error('❌ Error leaving page:', error);
    }

    // Unsubscribe from channels
    for (const [pageId, channel] of this.channels) {
      await this.supabase.removeChannel(channel);
    }
    this.channels.clear();

    this.currentPage = null;
  }

  // Event handlers (set these from your main code)
  set onUserJoined(callback) { this._onUserJoined = callback; }
  set onUserUpdated(callback) { this._onUserUpdated = callback; }
  set onUserLeft(callback) { this._onUserLeft = callback; }
  set onNewMessage(callback) { this._onNewMessage = callback; }
  set onVisibilityChanged(callback) { this._onVisibilityChanged = callback; }

  get onUserJoined() { return this._onUserJoined; }
  get onUserUpdated() { return this._onUserUpdated; }
  get onUserLeft() { return this._onUserLeft; }
  get onNewMessage() { return this._onNewMessage; }
  get onVisibilityChanged() { return this._onVisibilityChanged; }
}

// Export for use in your extension
if (typeof module !== 'undefined' && module.exports) {
  module.exports = SupabaseRealtimeClient;
} else {
  window.SupabaseRealtimeClient = SupabaseRealtimeClient;
}
