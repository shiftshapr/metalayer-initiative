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
    
    // CRITICAL FIX: Mutex to prevent race condition between heartbeat and leaveCurrentPage()
    this.isLeavingPage = false;
    this.isUpdatingPresence = false;
    
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
    console.log('');
    console.log('═══════════════════════════════════════════════════════════');
    console.log('🌐 JOIN_PAGE: === STARTING JOIN PAGE ===');
    console.log('═══════════════════════════════════════════════════════════');
    console.log('🌐 JOIN_PAGE: Page ID:', pageId);
    console.log('🌐 JOIN_PAGE: Page URL:', pageUrl);
    console.log('🌐 JOIN_PAGE: Current user:', this.currentUser?.userEmail);
    console.log('🌐 JOIN_PAGE: Current user ID:', this.currentUser?.userId);
    console.log('🌐 JOIN_PAGE: Timestamp:', new Date().toISOString());
    
    if (!this.currentUser) {
      console.error('❌ JOIN_PAGE: No current user set - cannot join page');
      console.log('═══════════════════════════════════════════════════════════');
      console.log('');
      return;
    }

    console.log('');
    console.log('📊 JOIN_PAGE: Setting currentPage');
    console.log('───────────────────────────────────────────────────────────');
    this.currentPage = { pageId, pageUrl };
    console.log('✅ JOIN_PAGE: currentPage set:', JSON.stringify(this.currentPage, null, 2));
    
    // Update user presence (sends INSERT/UPDATE to database)
    console.log('');
    console.log('📊 JOIN_PAGE: Step 1 - Updating presence in database');
    console.log('───────────────────────────────────────────────────────────');
    const presenceStartTime = Date.now();
    await this.updatePresence(pageId, pageUrl);
    const presenceEndTime = Date.now();
    console.log(`✅ JOIN_PAGE: Presence updated in ${presenceEndTime - presenceStartTime}ms`);
    
    // Subscribe to real-time updates for this page (WebSocket subscription)
    console.log('');
    console.log('📊 JOIN_PAGE: Step 2 - Subscribing to real-time updates');
    console.log('───────────────────────────────────────────────────────────');
    const subscribeStartTime = Date.now();
    await this.subscribeToPageUpdates(pageId);
    const subscribeEndTime = Date.now();
    console.log(`✅ JOIN_PAGE: Subscribed in ${subscribeEndTime - subscribeStartTime}ms`);
    
    console.log('');
    console.log('✅✅✅ JOIN_PAGE: COMPLETE ✅✅✅');
    console.log('✅ JOIN_PAGE: Joined page:', pageUrl);
    console.log('✅ JOIN_PAGE: Now listening for presence/message changes on page:', pageId);
    console.log('✅ JOIN_PAGE: Active channels:', Array.from(this.channels.keys()));
    console.log('═══════════════════════════════════════════════════════════');
    console.log('');
  }

  async updatePresence(pageId, pageUrl, auraColor = null) {
    // CRITICAL FIX: Skip if we're in the process of leaving a page (prevents race condition)
    if (this.isLeavingPage) {
      console.log('⏭️ PRESENCE_UPDATE: SKIPPED - User is currently leaving a page (mutex active)');
      return;
    }
    
    // Set mutex to prevent concurrent updates
    if (this.isUpdatingPresence) {
      console.log('⏭️ PRESENCE_UPDATE: SKIPPED - Another update is already in progress');
      return;
    }
    
    this.isUpdatingPresence = true;
    
    if (!this.currentUser) {
      console.log('❌ PRESENCE_UPDATE: No current user, skipping presence update');
      this.isUpdatingPresence = false;
      return;
    }

    // Check if Supabase client is initialized
    if (!this.supabase) {
      console.error('❌ PRESENCE_UPDATE: Supabase client not initialized. Call initialize() first.');
      console.error('❌ PRESENCE_UPDATE: this.supabase:', this.supabase);
      this.isUpdatingPresence = false;
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

    // SD1 FIX: Include avatar_url in presence data for "Last seen" users
    // Check multiple sources for the real avatar URL
    let avatarUrl = null;
    
    // 1. Try currentUser object (from auth)
    if (this.currentUser.avatarUrl) {
      avatarUrl = this.currentUser.avatarUrl;
      console.log(`🔍 SD1 AVATAR_SOURCE: Found avatar in currentUser: ${avatarUrl}`);
    }
    
    // 2. Try localStorage (from auth)
    if (!avatarUrl) {
      const storedUserKey = `metalayer_user_${this.currentUser.userEmail}`;
      const storedUser = localStorage.getItem(storedUserKey);
      if (storedUser) {
        try {
          const parsed = JSON.parse(storedUser);
          if (parsed.user_metadata?.avatar_url) {
            avatarUrl = parsed.user_metadata.avatar_url;
            console.log(`🔍 SD1 AVATAR_SOURCE: Found avatar in localStorage: ${avatarUrl}`);
          }
        } catch (e) {
          console.warn(`⚠️ SD1 AVATAR_SOURCE: Failed to parse stored user:`, e);
        }
      }
    }
    
    // 3. Try window.currentUser (from sidepanel.js)
    if (!avatarUrl && typeof window !== 'undefined' && window.currentUser?.avatarUrl) {
      avatarUrl = window.currentUser.avatarUrl;
      console.log(`🔍 SD1 AVATAR_SOURCE: Found avatar in window.currentUser: ${avatarUrl}`);
    }
    
    // 4. Try unfiltered visibility data (might have avatar from previous session)
    if (!avatarUrl && typeof window !== 'undefined' && window.currentVisibilityDataUnfiltered) {
      // CRITICAL FIX: currentVisibilityDataUnfiltered is an OBJECT with 'active' array, not an array itself
      const visibilityArray = window.currentVisibilityDataUnfiltered.active || window.currentVisibilityDataUnfiltered;
      if (Array.isArray(visibilityArray)) {
        const userInVisibility = visibilityArray.find(u => 
          u.email === this.currentUser.userEmail || 
          u.userId === this.currentUser.userEmail
        );
        if (userInVisibility?.avatarUrl) {
          avatarUrl = userInVisibility.avatarUrl;
          console.log(`🔍 SD1 AVATAR_SOURCE: Found avatar in visibility data: ${avatarUrl}`);
        }
      } else {
        console.warn(`⚠️ SD1 AVATAR_SOURCE: currentVisibilityDataUnfiltered is not an array:`, typeof visibilityArray);
      }
    }
    
    // Only add avatar_url if we found a REAL one (not fallback/default)
    if (avatarUrl && !avatarUrl.includes('default-user')) {
      presenceData.avatar_url = avatarUrl;
      console.log(`✅ SD1 AVATAR_FIX: Including REAL avatar URL in presence: ${avatarUrl}`);
    } else if (avatarUrl) {
      console.log(`⚠️ SD1 AVATAR_FIX: Skipping fallback avatar URL: ${avatarUrl}`);
    } else {
      console.log(`⚠️ SD1 AVATAR_FIX: No avatar URL found - will need to fetch from auth later`);
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
    } finally {
      // CRITICAL FIX: Always clear the mutex, even if an error occurred
      this.isUpdatingPresence = false;
    }
  }

  // CRITICAL FIX: Add explicit EXIT method to mark user as inactive on old page
  // This prevents "ghost presence" where user appears on old page for 30 seconds
  async leaveCurrentPage() {
    console.log('🚪 LEAVE_PAGE: === STARTING LEAVE PAGE ===');
    console.log('🚪 LEAVE_PAGE: Current user:', this.currentUser?.userEmail);
    console.log('🚪 LEAVE_PAGE: Current page:', this.currentPage?.pageId);
    
    // CRITICAL FIX: Set mutex to prevent heartbeat from updating presence while we're leaving
    this.isLeavingPage = true;
    console.log('🔒 LEAVE_PAGE: Mutex set - heartbeat updates will be blocked');
    
    // ENHANCED LOGGING: Check why currentPage might be undefined
    if (!this.currentUser) {
      console.log('❌ LEAVE_PAGE: No current user found');
      this.isLeavingPage = false;
      return;
    }
    
    if (!this.currentPage) {
      console.log('❌ LEAVE_PAGE: No current page found - this indicates a state management issue');
      console.log('🔍 LEAVE_PAGE: Debug info - supabaseRealtimeClient state:', {
        hasCurrentUser: !!this.currentUser,
        hasCurrentPage: !!this.currentPage,
        isLeavingPage: this.isLeavingPage,
        isConnected: this.isConnected
      });
      this.isLeavingPage = false;
      return;
    }

    if (!this.supabase) {
      console.error('❌ LEAVE_PAGE: Supabase client not initialized');
      this.isLeavingPage = false;
      return;
    }

    // CRITICAL FIX: Store page info BEFORE clearing currentPage
    // We need these values for the database update
    const { pageId, pageUrl } = this.currentPage;
    
    // CRITICAL FIX: Clear currentPage IMMEDIATELY to stop heartbeat from running
    // This MUST happen BEFORE the database update to prevent race condition
    // The heartbeat checks `if (this.currentPage)` before updating
    const oldPage = this.currentPage;
    this.currentPage = null;
    console.log('🔒 LEAVE_PAGE: currentPage cleared - heartbeat will NOT run for old page');
    console.log('🔒 LEAVE_PAGE: Stored old page info:', { pageId, pageUrl });

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
        console.error('❌ LEAVE_PAGE: UPDATE FAILED - other users will NOT see you leave!');
      } else {
        console.log(`✅ LEAVE_PAGE: Marked ${this.currentUser.userEmail} as inactive on ${pageId}`);
        console.log('✅ LEAVE_PAGE: Database UPDATE sent - other users will receive postgres_changes event');
        
        // CRITICAL: Verify the update worked by querying back
        const { data: verifyData, error: verifyError } = await this.supabase
          .from('user_presence')
          .select('is_active, last_seen')
          .eq('user_email', this.currentUser.userEmail)
          .eq('page_id', pageId)
          .limit(1);
        
        if (verifyError) {
          console.error('❌ LEAVE_PAGE: Failed to verify inactive status:', verifyError);
        } else if (verifyData && verifyData.length > 0) {
          console.log(`🔍 LEAVE_PAGE: Verified status - is_active: ${verifyData[0].is_active}, last_seen: ${verifyData[0].last_seen}`);
          if (verifyData[0].is_active === false) {
            console.log('✅ LEAVE_PAGE: CONFIRMED - User is marked as inactive in database');
          } else {
            console.error('❌ LEAVE_PAGE: VERIFICATION FAILED - User is STILL marked as active!');
          }
        }
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

    // NOTE: currentPage was already cleared at the start of this function (line 240)
    // to prevent heartbeat race conditions
    
    // CRITICAL FIX: Clear mutex to allow new page's presence updates
    this.isLeavingPage = false;
    console.log('🔓 LEAVE_PAGE: Mutex cleared - heartbeat can resume on new page');
    
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
            console.log('');
            console.log('🔔🔔🔔═══════════════════════════════════════════════════════');
            console.log('🔔🔔🔔 REALTIME_EVENT_ARRIVED: Presence event received!');
            console.log('🔔🔔🔔═══════════════════════════════════════════════════════');
            console.log('🔔 Event type:', payload.eventType);
            console.log('🔔 User:', payload.new?.user_email || payload.old?.user_email);
            console.log('🔔 Page ID:', payload.new?.page_id || payload.old?.page_id);
            console.log('🔔 is_active changed:', payload.old?.is_active, '→', payload.new?.is_active);
            console.log('🔔 Timestamp:', new Date().toISOString());
            console.log('🔔 Callback registered:', typeof this.onUserUpdated);
            console.log('🔔 Full payload:', JSON.stringify(payload, null, 2));
            console.log('🔔 Now calling handlePresenceUpdate()...');
            this.handlePresenceUpdate(payload);
            console.log('🔔 handlePresenceUpdate() completed');
            console.log('🔔🔔🔔═══════════════════════════════════════════════════════');
            console.log('');
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
          console.log('');
          console.log('📡📡📡═══════════════════════════════════════════════════════');
          console.log('📡📡📡 SUBSCRIBE_STATUS: Subscription status changed!');
          console.log('📡📡📡═══════════════════════════════════════════════════════');
          console.log('📡 Status:', status);
          console.log('📡 Page ID:', pageId);
          console.log('📡 Channel name:', `page-${pageId}`);
          console.log('📡 Timestamp:', new Date().toISOString());
          console.log('📡 Current user:', this.currentUser?.userEmail);
          
          if (status === 'SUBSCRIBED') {
            console.log('');
            console.log('✅✅✅ SUBSCRIBE_STATUS: Successfully subscribed to real-time updates!');
            console.log('✅ Now listening for:');
            console.log('   - Presence changes (user_presence table)');
            console.log('   - New messages (messages table)');
            console.log('   - Visibility updates (user_visibility table)');
            console.log('   - Filter: page_id=' + pageId);
            console.log('✅ Real-time events will now trigger callbacks');
            console.log('✅ Watch for 🔔🔔🔔 REALTIME_EVENT_ARRIVED logs');
            console.log('');
            this.isConnected = true;
          } else if (status === 'CHANNEL_ERROR') {
            console.error('');
            console.error('❌❌❌ SUBSCRIBE_STATUS: Channel error - subscription FAILED!');
            console.error('❌ Real-time events will NOT be received');
            console.error('❌ Check Supabase real-time configuration');
            console.error('');
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
    console.log('');
    console.log('═══════════════════════════════════════════════════════════');
    console.log('🔔 HANDLE_PRESENCE_UPDATE: === PROCESSING REAL-TIME EVENT ===');
    console.log('═══════════════════════════════════════════════════════════');
    
    const { eventType, new: newRecord, old: oldRecord } = payload;
    const record = newRecord || oldRecord;
    
    console.log('🔔 HANDLE_PRESENCE_UPDATE: Event type:', eventType);
    console.log('🔔 HANDLE_PRESENCE_UPDATE: User:', record?.user_email);
    console.log('🔔 HANDLE_PRESENCE_UPDATE: Page ID:', record?.page_id);
    console.log('🔔 HANDLE_PRESENCE_UPDATE: Is active:', record?.is_active);
    console.log('🔔 HANDLE_PRESENCE_UPDATE: Last seen:', record?.last_seen);
    console.log('🔔 HANDLE_PRESENCE_UPDATE: Enter time:', record?.enter_time);
    console.log('🔔 HANDLE_PRESENCE_UPDATE: Timestamp:', new Date().toISOString());
    
    switch (eventType) {
      case 'INSERT':
        console.log('');
        console.log('📊 HANDLE_PRESENCE_UPDATE: Processing INSERT event');
        console.log('───────────────────────────────────────────────────────────');
        console.log('👋 User joined page:', newRecord.user_email);
        console.log('🔍 New record details:', JSON.stringify(newRecord, null, 2));
        console.log('🔍 Calling onUserJoined callback...');
        this.onUserJoined?.(newRecord);
        console.log('✅ onUserJoined callback completed');
        break;
        
      case 'UPDATE':
        console.log('');
        console.log('📊 HANDLE_PRESENCE_UPDATE: Processing UPDATE event');
        console.log('───────────────────────────────────────────────────────────');
        console.log('🔄 User presence updated:', newRecord.user_email);
        console.log('🔍 Old record:', JSON.stringify(oldRecord, null, 2));
        console.log('🔍 New record:', JSON.stringify(newRecord, null, 2));
        console.log('🔍 Changes:');
        if (oldRecord && newRecord) {
          if (oldRecord.is_active !== newRecord.is_active) {
            console.log(`   - is_active: ${oldRecord.is_active} → ${newRecord.is_active}`);
          }
          if (oldRecord.last_seen !== newRecord.last_seen) {
            console.log(`   - last_seen: ${oldRecord.last_seen} → ${newRecord.last_seen}`);
          }
          if (oldRecord.aura_color !== newRecord.aura_color) {
            console.log(`   - aura_color: ${oldRecord.aura_color} → ${newRecord.aura_color}`);
          }
        }
        console.log('🔍 Calling onUserUpdated callback...');
        this.onUserUpdated?.(newRecord);
        console.log('✅ onUserUpdated callback completed');
        break;
        
      case 'DELETE':
        console.log('');
        console.log('📊 HANDLE_PRESENCE_UPDATE: Processing DELETE event');
        console.log('───────────────────────────────────────────────────────────');
        console.log('👋 User left page:', oldRecord.user_email);
        console.log('🔍 Old record details:', JSON.stringify(oldRecord, null, 2));
        console.log('🔍 Calling onUserLeft callback...');
        this.onUserLeft?.(oldRecord);
        console.log('✅ onUserLeft callback completed');
        break;
        
      default:
        console.log('');
        console.log('⚠️ HANDLE_PRESENCE_UPDATE: Unknown event type:', eventType);
        break;
    }
    
    console.log('');
    console.log('✅ HANDLE_PRESENCE_UPDATE: Event processing complete');
    console.log('═══════════════════════════════════════════════════════════');
    console.log('');
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
      console.log('🔍 GET_PAGE_USERS: === STARTING PAGE USERS QUERY ===');
      console.log(`🔍 GET_PAGE_USERS: Page ID: ${pageId}`);
      
      // CRITICAL FIX: Query for BOTH active users AND recently inactive users
      // This enables "Last seen" functionality for users who have left the page
      // CONFIGURABLE THRESHOLD: Use user-configurable threshold (default: 1 month)
      const thresholdMs = window.configManager?.getLastSeenThreshold() || (30 * 24 * 60 * 60 * 1000); // Default: 30 days
      const recentThreshold = new Date(Date.now() - thresholdMs);
      console.log(`🔍 GET_PAGE_USERS: Recent threshold: ${recentThreshold.toISOString()}`);
      console.log(`🔍 GET_PAGE_USERS: Threshold duration: ${thresholdMs / (24 * 60 * 60 * 1000)} days`);
      
      const { data, error } = await this.supabase
        .from('user_presence')
        .select('*')
        .eq('page_id', pageId)
        .or(`is_active.eq.true,and(is_active.eq.false,last_seen.gte.${recentThreshold.toISOString()})`)
        .order('last_seen', { ascending: false });

      if (error) {
        console.error('❌ GET_PAGE_USERS: Failed to get page users:', error);
        console.error('❌ GET_PAGE_USERS: Error details:', JSON.stringify(error, null, 2));
        return [];
      }

      console.log(`✅ GET_PAGE_USERS: Found ${data?.length || 0} users (active + recently inactive)`);
      
      if (data && data.length > 0) {
        data.forEach((user, index) => {
          const minutesAgo = (Date.now() - new Date(user.last_seen).getTime()) / 1000 / 60;
          console.log(`🔍 GET_PAGE_USERS: User ${index + 1}: ${user.user_email}`);
          console.log(`   is_active: ${user.is_active}`);
          console.log(`   last_seen: ${minutesAgo.toFixed(1)} minutes ago`);
          console.log(`   status: ${user.is_active ? 'ACTIVE' : 'LAST SEEN'}`);
        });
      }

      return data || [];
    } catch (error) {
      console.error('❌ GET_PAGE_USERS: Error getting page users:', error);
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
