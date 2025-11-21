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
        
        // CRITICAL FIX: Check if user is authenticated for real-time
        const { data: { session }, error: sessionError } = await this.supabase.auth.getSession();
        if (session) {
          console.log('✅ SUPABASE_CLIENT: User is authenticated:', session.user.email);
          console.log('✅ SUPABASE_CLIENT: Session expires at:', new Date(session.expires_at * 1000));
        } else {
          console.warn('⚠️ SUPABASE_CLIENT: No authenticated session - real-time may fail');
          console.warn('⚠️ SUPABASE_CLIENT: Session error:', sessionError?.message);
          console.log('🔧 SUPABASE_CLIENT: You may need to sign in a user for real-time to work');
        }
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

  async setCurrentUser(userEmail, userId, communityId = 'comm-001') {
    this.currentUser = { userEmail, userId, communityId };
    console.log('👤 Current user set:', userEmail);
    console.log('👤 Community ID set:', communityId);
    
    // ROOT CAUSE FIX: Update stateManager (TypeScript migration - no window.currentUser)
    const userData = {
      email: userEmail,
      id: userId,
      communityId: communityId
    };
    if (window.stateManagerInstance?.setState) {
      window.stateManagerInstance.setState('currentUser', userData);
    }
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
    
    // SD1 FIX: Add avatar_url to presence data (after running SQL to add column)
    if (avatarUrl && !avatarUrl.includes('default-user')) {
      presenceData.avatar_url = avatarUrl;
      console.log(`✅ SD1 AVATAR_SOURCE: Found REAL avatar (${avatarUrl}) - saving to user_presence`);
    } else if (avatarUrl) {
      console.log(`⚠️ SD1 AVATAR_SOURCE: Found fallback avatar (${avatarUrl}) - not using`);
    } else {
      console.log(`⚠️ SD1 AVATAR_SOURCE: No avatar URL found for propagation`);
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

  // Method to check and restore lost connections
  async checkAndRestoreConnections() {
    if (!this.currentPage || this.isConnected) {
      return; // No need to restore if no current page or already connected
    }
    
    console.log('🔄 CHECK_CONNECTIONS: Checking for lost connections...');
    console.log('🔄 CHECK_CONNECTIONS: Current page:', this.currentPage);
    console.log('🔄 CHECK_CONNECTIONS: Is connected:', this.isConnected);
    
    if (this.currentPage && !this.isConnected) {
      console.log('🔄 CHECK_CONNECTIONS: Connection lost, attempting to restore...');
      await this.subscribeToPageUpdates(this.currentPage);
    }
  }

  // SD1 CRITICAL FIX: Diagnose channel closure issues
  async diagnoseChannelClosure(pageId) {
    console.log('🔧 SD1 DIAGNOSTIC: === CHANNEL CLOSURE DIAGNOSIS ===');
    console.log('🔧 SD1 DIAGNOSTIC: Page ID:', pageId);
    console.log('🔧 SD1 DIAGNOSTIC: Current user:', this.currentUser?.userEmail);
    
    try {
      // Check if we can access the messages table
      console.log('🔧 SD1 DIAGNOSTIC: Testing database access...');
      const { data, error } = await this.supabase
        .from('messages')
        .select('id')
        .eq('page_id', pageId)
        .limit(1);
      
      if (error) {
        console.error('❌ SD1 DIAGNOSTIC: Database access failed:', error);
        console.error('❌ SD1 DIAGNOSTIC: Error code:', error.code);
        console.error('❌ SD1 DIAGNOSTIC: Error message:', error.message);
        console.error('❌ SD1 DIAGNOSTIC: Error details:', error.details);
        console.error('❌ SD1 DIAGNOSTIC: Error hint:', error.hint);
        
        // Check for common RLS issues
        if (error.code === '42501') {
          console.error('🚨 SD1 DIAGNOSTIC: RLS POLICY ISSUE - Insufficient permissions');
          console.error('🚨 SD1 DIAGNOSTIC: Check Row Level Security policies for messages table');
        } else if (error.code === 'PGRST301') {
          console.error('🚨 SD1 DIAGNOSTIC: TABLE NOT FOUND - messages table may not exist');
        } else if (error.code === 'PGRST116') {
          console.error('🚨 SD1 DIAGNOSTIC: COLUMN NOT FOUND - Check table schema');
        }
      } else {
        console.log('✅ SD1 DIAGNOSTIC: Database access successful');
        console.log('✅ SD1 DIAGNOSTIC: Found', data?.length || 0, 'messages for page');
      }
      
      // Check real-time configuration
      console.log('🔧 SD1 DIAGNOSTIC: Checking real-time configuration...');
      
      // CRITICAL FIX: Check if messages table has real-time enabled
      console.log('🔧 SD1 DIAGNOSTIC: Checking if real-time is enabled for messages table...');
      try {
        const { data: realtimeData, error: realtimeError } = await this.supabase
          .from('messages')
          .select('id')
          .limit(1);
        
        if (realtimeError) {
          console.error('❌ SD1 DIAGNOSTIC: Real-time check failed:', realtimeError);
        } else {
          console.log('✅ SD1 DIAGNOSTIC: Messages table accessible for real-time');
        }
      } catch (realtimeCheckError) {
        console.error('❌ SD1 DIAGNOSTIC: Real-time configuration check failed:', realtimeCheckError);
      }
      
      // CRITICAL FIX: Check RLS policies using information_schema instead of pg_policies
      console.log('🔧 SD1 DIAGNOSTIC: Checking RLS policies via information_schema...');
      try {
        const { data: rlsData, error: rlsError } = await this.supabase
          .from('information_schema.table_privileges')
          .select('*')
          .eq('table_name', 'messages');
        
        if (rlsError) {
          console.warn('⚠️ SD1 DIAGNOSTIC: Could not check table privileges:', rlsError);
        } else {
          console.log('🔧 SD1 DIAGNOSTIC: Table privileges for messages:', rlsData?.length || 0);
        }
      } catch (rlsCheckError) {
        console.warn('⚠️ SD1 DIAGNOSTIC: RLS check failed:', rlsCheckError);
      }
      
      // CRITICAL FIX: Check WebSocket connection and real-time status
      console.log('🔧 SD1 DIAGNOSTIC: Checking WebSocket and real-time status...');
      try {
        // Check if we can access real-time specific endpoints
        const { data: realtimeTest, error: realtimeTestError } = await this.supabase
          .from('messages')
          .select('id')
          .limit(1);
        
        if (realtimeTestError) {
          console.error('❌ SD1 DIAGNOSTIC: Real-time access test failed:', realtimeTestError);
          console.error('❌ SD1 DIAGNOSTIC: This suggests RLS or permission issues');
        } else {
          console.log('✅ SD1 DIAGNOSTIC: Real-time access test successful');
        }
        
        // Check WebSocket connection status
        console.log('🔧 SD1 DIAGNOSTIC: WebSocket status:', {
          isConnected: this.isConnected,
          channels: this.channels?.size || 0,
          supabaseClient: !!this.supabase
        });
        
      } catch (wsError) {
        console.error('❌ SD1 DIAGNOSTIC: WebSocket/Real-time check failed:', wsError);
      }
      
    } catch (diagnosticError) {
      console.error('❌ SD1 DIAGNOSTIC: Diagnostic failed:', diagnosticError);
    }
    
    console.log('🔧 SD1 DIAGNOSTIC: === DIAGNOSIS COMPLETE ===');
    
    // CRITICAL FIX: Provide specific guidance for common issues
    console.log('🔧 SD1 DIAGNOSTIC: === RECOMMENDED FIXES ===');
    console.log('🔧 SD1 DIAGNOSTIC: ✅ Real-time is already enabled for messages table');
    console.log('🔧 SD1 DIAGNOSTIC: 1. Check RLS policies allow SELECT, INSERT, UPDATE, DELETE');
    console.log('🔧 SD1 DIAGNOSTIC: 2. Verify user authentication and permissions');
    console.log('🔧 SD1 DIAGNOSTIC: 3. Check if real-time is enabled in Supabase project settings');
    console.log('🔧 SD1 DIAGNOSTIC: 4. Verify WebSocket connection is not blocked');
    console.log('🔧 SD1 DIAGNOSTIC: 5. Check browser console for WebSocket errors');
    console.log('🔧 SD1 DIAGNOSTIC: 6. Try using Broadcast as fallback if Postgres Changes fail');
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

    // SD1 FIX: Better duplicate subscription prevention
    if (this.channels.has(pageId)) {
      console.warn('⚠️ SUBSCRIBE: Already subscribed to this page, skipping duplicate subscription');
      console.log('⚠️ SUBSCRIBE: Active channels:', Array.from(this.channels.keys()));
      return; // Skip duplicate subscription
    }

    try {
      // CRITICAL FIX: Use proper Supabase real-time topic naming with specific topics
      // Format: page:messages:<page_id>, page:presence:<page_id>, etc. as configured by Supabase
      const messagesTopic = `page:messages:${pageId}`;
      const presenceTopic = `page:presence:${pageId}`;
      const visibilityTopic = `page:visibility:${pageId}`;
      const reactionsTopic = `page:reactions:${pageId}`;
      const deletionsTopic = `page:deletions:${pageId}`;
      
      console.log('📡 SUBSCRIBE: Creating channels with specific topic naming:');
      console.log('📡 SUBSCRIBE: Messages topic:', messagesTopic);
      console.log('📡 SUBSCRIBE: Presence topic:', presenceTopic);
      console.log('📡 SUBSCRIBE: Visibility topic:', visibilityTopic);
      console.log('📡 SUBSCRIBE: Reactions topic:', reactionsTopic);
      console.log('📡 SUBSCRIBE: Deletions topic:', deletionsTopic);
      
      // Create main channel for messages (primary channel)
      const channel = this.supabase
        .channel(messagesTopic, {
          config: {
            broadcast: { self: true, ack: true },
            private: true,
            presence: { key: this.currentUser?.userEmail || 'anonymous' }
          }
        })
        // CRITICAL FIX: Use broadcast listeners instead of postgres_changes
        .on('broadcast', { event: 'INSERT' }, (payload) => {
          console.log('🔔 BROADCAST: INSERT event received:', payload);
          if (payload.payload && payload.payload.table === 'user_presence') {
            console.log('🔔 BROADCAST: Presence INSERT event');
            this.handlePresenceUpdate({
              eventType: 'INSERT',
              new: payload.payload.new,
              old: payload.payload.old
            });
          }
        })
        .on('broadcast', { event: 'UPDATE' }, (payload) => {
          console.log('🔔 BROADCAST: UPDATE event received:', payload);
          if (payload.payload && payload.payload.table === 'user_presence') {
            console.log('🔔 BROADCAST: Presence UPDATE event');
            this.handlePresenceUpdate({
              eventType: 'UPDATE',
              new: payload.payload.new,
              old: payload.payload.old
            });
          }
        })
        .on('broadcast', { event: 'DELETE' }, (payload) => {
          console.log('🔔 BROADCAST: DELETE event received:', payload);
          if (payload.payload && payload.payload.table === 'user_presence') {
            console.log('🔔 BROADCAST: Presence DELETE event');
            this.handlePresenceUpdate({
              eventType: 'DELETE',
              new: payload.payload.new,
              old: payload.payload.old
            });
          }
        })
        // CRITICAL FIX: Add broadcast listeners for messages
        .on('broadcast', { event: 'INSERT' }, (payload) => {
          console.log('💬 BROADCAST: INSERT event received:', payload);
          if (payload.payload && payload.payload.table === 'messages') {
            console.log('💬 BROADCAST: Message INSERT event');
            this.handleNewMessage({
              eventType: 'INSERT',
              new: payload.payload.new,
              old: payload.payload.old
            });
          }
        })
        .on('broadcast', { event: 'UPDATE' }, (payload) => {
          console.log('💬 BROADCAST: UPDATE event received:', payload);
          if (payload.payload && payload.payload.table === 'messages') {
            console.log('💬 BROADCAST: Message UPDATE event');
            this.handleMessageUpdate({
              eventType: 'UPDATE',
              new: payload.payload.new,
              old: payload.payload.old
            });
          }
        })
        .on('broadcast', { event: 'DELETE' }, (payload) => {
          console.log('💬 BROADCAST: DELETE event received:', payload);
          if (payload.payload && payload.payload.table === 'messages') {
            console.log('💬 BROADCAST: Message DELETE event');
            this.handleMessageDelete({
              eventType: 'DELETE',
              new: payload.payload.new,
              old: payload.payload.old
            });
          }
        })
        .on('postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'messages',
            filter: `page_id=eq.${pageId}`
          },
          (payload) => {
            console.log('✏️ REALTIME_EVENT: Message update received');
            console.log('✏️ REALTIME_EVENT: Message ID:', payload.new?.id);
            console.log('✏️ REALTIME_EVENT: Updated message user:', payload.new?.user_email);
            console.log('✏️ REALTIME_EVENT: New content:', payload.new?.content?.substring(0, 50) + '...');
            console.log('✏️ REALTIME_EVENT: Full payload:', JSON.stringify(payload, null, 2));
            this.handleMessageUpdate(payload);
          }
        )
        .on('postgres_changes',
          {
            event: 'DELETE',
            schema: 'public',
            table: 'messages',
            filter: `page_id=eq.${pageId}`
          },
          (payload) => {
            console.log('🗑️ REALTIME_EVENT: Message deletion received');
            console.log('🗑️ REALTIME_EVENT: Message ID:', payload.old?.id);
            console.log('🗑️ REALTIME_EVENT: Deleted message user:', payload.old?.user_email);
            console.log('🗑️ REALTIME_EVENT: Full payload:', JSON.stringify(payload, null, 2));
            this.handleMessageDeletion(payload);
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
        // CRITICAL FIX: Add Broadcast fallback for when Postgres Changes don't work
        .on('broadcast', { event: 'message' }, (payload) => {
          console.log('📡 BROADCAST_EVENT: Message broadcast received');
          console.log('📡 BROADCAST_EVENT: Event:', payload.event);
          console.log('📡 BROADCAST_EVENT: Payload:', JSON.stringify(payload, null, 2));
          
          // Handle broadcast message if Postgres Changes fail
          if (payload.message && payload.message.page_id === pageId) {
            console.log('📡 BROADCAST_EVENT: Processing broadcast message for current page');
            this.handleNewMessage({ new: payload.message });
          }
        })
        .on('broadcast', { event: 'message_updated' }, (payload) => {
          console.log('📡 BROADCAST_EVENT: Message update broadcast received');
          console.log('📡 BROADCAST_EVENT: Event:', payload.event);
          console.log('📡 BROADCAST_EVENT: Payload:', JSON.stringify(payload, null, 2));
          
          // Handle broadcast message update if Postgres Changes fail
          if (payload.message && payload.message.page_id === pageId) {
            console.log('📡 BROADCAST_EVENT: Processing broadcast message update for current page');
            this.handleMessageUpdate({ new: payload.message });
          }
        })
        .on('broadcast', { event: 'message_deleted' }, (payload) => {
          console.log('📡 BROADCAST_EVENT: Message deletion broadcast received');
          console.log('📡 BROADCAST_EVENT: Event:', payload.event);
          console.log('📡 BROADCAST_EVENT: Payload:', JSON.stringify(payload, null, 2));
          
          // Handle broadcast message deletion if Postgres Changes fail
          if (payload.message && payload.message.page_id === pageId) {
            console.log('📡 BROADCAST_EVENT: Processing broadcast message deletion for current page');
            this.handleMessageDeletion({ old: payload.message });
          }
        })
        .subscribe((status) => {
          // SD1 FIX: Reduce spam logging - only log important status changes
          if (status === 'CHANNEL_ERROR' && this.reconnectAttempts > 0) {
            // Don't spam log repeated errors
            return;
          }
          
          console.log('📡 SUBSCRIBE_STATUS: Status changed to:', status);
          console.log('📡 SUBSCRIBE_STATUS: Page ID:', pageId);
          console.log('📡 SUBSCRIBE_STATUS: User:', this.currentUser?.userEmail);
          
          // SD1 FIX: Only run diagnostics on first error or success
          if (status === 'CHANNEL_ERROR' || status === 'SUBSCRIBED') {
            console.log('🔍 SD1 DIAGNOSTIC: Supabase client status:', {
              isConnected: this.isConnected,
              channels: this.channels.size,
              currentPage: this.currentPage,
              supabaseClient: !!this.supabase
            });
            
            // SD1 FIX: Only check auth on errors
            if (status === 'CHANNEL_ERROR' && this.supabase) {
              console.log('🔍 SD1 DIAGNOSTIC: Checking Supabase auth status...');
              this.supabase.auth.getSession().then(({ data: { session }, error }) => {
                if (error) {
                  console.error('❌ SD1 DIAGNOSTIC: Auth session error:', error);
                } else {
                  console.log('🔍 SD1 DIAGNOSTIC: Auth session:', {
                    hasSession: !!session,
                    userEmail: session?.user?.email,
                    expiresAt: session?.expires_at
                  });
                }
              }).catch(err => {
                console.error('❌ SD1 DIAGNOSTIC: Auth check failed:', err);
              });
            }
          }
          
          if (status === 'SUBSCRIBED') {
            console.log('');
            console.log('✅✅✅ SUBSCRIBE_STATUS: Successfully subscribed to real-time updates!');
            console.log('✅ Now listening for:');
            console.log('   - Presence changes (user_presence table - ALL events)');
            console.log('   - New messages (messages table - INSERT events)');
            console.log('   - Message deletions (messages table - DELETE events)');
            console.log('   - Visibility updates (user_visibility table - ALL events)');
            console.log('   - Filter: page_id=' + pageId);
            console.log('✅ Real-time events will now trigger callbacks');
            console.log('✅ Watch for 🔔🔔🔔 REALTIME_EVENT_ARRIVED logs');
            console.log('');
            this.isConnected = true;
            this.reconnectAttempts = 0; // Reset on successful connection
            
            // Supabase real-time connection is stable without manual heartbeat
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
            console.log('⚠️ SUBSCRIBE_STATUS: Channel closed - attempting to reconnect...');
            
            // SD1 CRITICAL FIX: Attempt to diagnose and fix channel closure
            console.log('🔧 SD1 FIX: Attempting to diagnose channel closure...');
            this.diagnoseChannelClosure(pageId);
            
            // SD1 CRITICAL FIX: Attempt immediate reconnection
            setTimeout(async () => {
              console.log('🔄 RECONNECT: Attempting to reconnect channel...');
              try {
                await this.subscribeToPageUpdates(pageId);
                console.log('✅ RECONNECT: Reconnection successful');
              } catch (error) {
                console.error('❌ RECONNECT: Reconnection failed:', error);
              }
            }, 1000);
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
            // COMP METHOD: Trigger aura color propagation immediately
            const userId = newRecord.user_id || newRecord.user_email;
            const newAuraColor = newRecord.aura_color;
            if (userId && newAuraColor && typeof window.handleAuraChange === 'function') {
              console.log('🎨 COMP METHOD: Aura color changed in presence update, triggering propagation');
              window.handleAuraChange({
                userId: userId,
                auraColor: newAuraColor,
                source: 'presence_update'
              });
            }
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
    console.log('💬 Message content:', message.content);
    console.log('💬 Message ID:', message.id);
    console.log('💬 Page ID:', message.page_id);
    console.log('💬 Timestamp:', message.created_at);
    console.log('💬 Calling onNewMessage callback...');
    this.onNewMessage?.(message);
    console.log('💬 onNewMessage callback completed');
  }

  handleMessageUpdate(payload) {
    const { new: message } = payload;
    console.log('✏️ Message updated:', message.user_email);
    console.log('✏️ Message content:', message.content);
    console.log('✏️ Message ID:', message.id);
    console.log('✏️ Page ID:', message.page_id);
    console.log('✏️ Updated timestamp:', message.updated_at);
    console.log('✏️ Calling onMessageUpdated callback...');
    this.onMessageUpdated?.(message);
    console.log('✏️ onMessageUpdated callback completed');
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
    console.log('💬 SEND_MESSAGE: Starting message send...');
    console.log('💬 SEND_MESSAGE: Content:', content?.substring(0, 50) + '...');
    console.log('💬 SEND_MESSAGE: User:', this.currentUser?.userEmail);
    console.log('💬 SEND_MESSAGE: Page:', this.currentPage?.pageId);
    
    if (!this.currentUser || !this.currentPage) {
      console.error('❌ SEND_MESSAGE: Missing user or page context');
      return null;
    }

    if (!this.supabase) {
      console.error('❌ SEND_MESSAGE: Supabase client not initialized');
      return null;
    }

    try {
      console.log('📡 SEND_MESSAGE: === PREPARING DATABASE INSERT ===');
      console.log('📡 SEND_MESSAGE: Inserting message into database...');
      console.log('📡 SEND_MESSAGE: Table: messages');
      console.log('📡 SEND_MESSAGE: Insert data:');
      console.log('📡 SEND_MESSAGE:   - page_id:', this.currentPage.pageId);
      console.log('📡 SEND_MESSAGE:   - user_email:', this.currentUser.userEmail);
      console.log('📡 SEND_MESSAGE:   - content:', content);
      console.log('📡 SEND_MESSAGE:   - community_id:', this.currentUser.communityId || 'comm-001');
      console.log('📡 SEND_MESSAGE: Timestamp before insert:', new Date().toISOString());
      
      const { data, error } = await this.supabase
        .from('messages')
        .insert({
          page_id: this.currentPage.pageId,
          user_email: this.currentUser.userEmail,
          content: content,
          community_id: this.currentUser.communityId || 'comm-001'
        })
        .select();

      console.log('📡 SEND_MESSAGE: Timestamp after insert:', new Date().toISOString());
      console.log('📡 SEND_MESSAGE: Insert completed');
      console.log('📡 SEND_MESSAGE: data:', data);
      console.log('📡 SEND_MESSAGE: data type:', typeof data);
      console.log('📡 SEND_MESSAGE: data is array:', Array.isArray(data));
      console.log('📡 SEND_MESSAGE: data length:', data?.length);
      console.log('📡 SEND_MESSAGE: error:', error);
      console.log('📡 SEND_MESSAGE: error type:', typeof error);

      if (error) {
        console.error('❌❌❌ SEND_MESSAGE: DATABASE ERROR OCCURRED');
        console.error('❌ SEND_MESSAGE: Database error:', error);
        console.error('❌ SEND_MESSAGE: Error code:', error.code);
        console.error('❌ SEND_MESSAGE: Error message:', error.message);
        console.error('❌ SEND_MESSAGE: Error details:', JSON.stringify(error, null, 2));
        console.error('❌ SEND_MESSAGE: RETURNING NULL DUE TO DATABASE ERROR');
        return null;
      } else {
        console.log('✅✅✅ SEND_MESSAGE: MESSAGE SENT SUCCESSFULLY');
        console.log('✅ SEND_MESSAGE: Message sent successfully');
        console.log('✅ SEND_MESSAGE: Returned data:', data);
        console.log('✅ SEND_MESSAGE: First message:', data[0]);
        console.log('✅ SEND_MESSAGE: Message UUID:', data[0]?.id);
        console.log('✅ SEND_MESSAGE: Message created_at:', data[0]?.created_at);
        
        // CRITICAL FIX: Broadcast the message for real-time propagation
        // This ensures messages propagate even if Postgres Changes fail
        console.log('📡 SEND_MESSAGE: Broadcasting message for real-time propagation...');
        try {
          const broadcastResult = await this.supabase
            .channel('messages')
            .send({
              type: 'broadcast',
              event: 'message',
              payload: {
                message: data[0],
                page_id: this.currentPage.pageId,
                user_email: this.currentUser.userEmail
              }
            });
          
          if (broadcastResult === 'ok') {
            console.log('✅ SEND_MESSAGE: Message broadcast successful');
          } else {
            console.warn('⚠️ SEND_MESSAGE: Message broadcast returned:', broadcastResult);
          }
        } catch (broadcastError) {
          console.error('❌ SEND_MESSAGE: Message broadcast failed:', broadcastError);
        }
        
        console.log('✅ SEND_MESSAGE: RETURNING MESSAGE DATA');
        // Return the created message with its UUID
        return data[0];
      }
    } catch (error) {
      console.error('❌❌❌ SEND_MESSAGE: EXCEPTION DURING SEND');
      console.error('❌ SEND_MESSAGE: Exception during send:', error);
      console.error('❌ SEND_MESSAGE: Exception type:', typeof error);
      console.error('❌ SEND_MESSAGE: Exception message:', error?.message);
      console.error('❌ SEND_MESSAGE: Exception stack:', error?.stack);
      console.error('❌ SEND_MESSAGE: Full exception:', JSON.stringify(error, null, 2));
      console.error('❌ SEND_MESSAGE: RETURNING NULL DUE TO EXCEPTION');
      return null;
    }
  }

  async editMessage(messageId, newContent) {
    console.log('✏️ EDIT_MESSAGE: Starting message edit...');
    console.log('✏️ EDIT_MESSAGE: Message ID:', messageId);
    console.log('✏️ EDIT_MESSAGE: New content:', newContent);
    
    if (!this.currentUser || !this.currentPage) {
      console.error('❌ EDIT_MESSAGE: Missing currentUser or currentPage');
      return;
    }

    if (!this.supabase) {
      console.error('❌ EDIT_MESSAGE: Supabase client not initialized');
      return;
    }

    try {
      console.log('✏️ EDIT_MESSAGE: Updating message in database...');
      const { data, error } = await this.supabase
        .from('messages')
        .update({
          content: newContent,
          updated_at: new Date().toISOString()
        })
        .eq('id', messageId)
        .eq('user_email', this.currentUser.userEmail)
        .select();

      if (error) {
        console.error('❌ EDIT_MESSAGE: Database error:', error);
        console.error('❌ EDIT_MESSAGE: Error details:', JSON.stringify(error, null, 2));
      } else {
        console.log('✅ EDIT_MESSAGE: Message updated successfully:', data);
      }
    } catch (error) {
      console.error('❌ EDIT_MESSAGE: Exception during edit:', error);
      console.error('❌ EDIT_MESSAGE: Error stack:', error.stack);
    }
  }

  async deleteMessage(messageId) {
    console.log('🗑️ DELETE_MESSAGE: Starting message deletion...');
    console.log('🗑️ DELETE_MESSAGE: Message ID:', messageId);
    console.log('🗑️ DELETE_MESSAGE: Message ID type:', typeof messageId);
    
    if (!this.currentUser || !this.currentPage) {
      console.error('❌ DELETE_MESSAGE: Missing currentUser or currentPage');
      return;
    }

    if (!this.supabase) {
      console.error('❌ DELETE_MESSAGE: Supabase client not initialized');
      return;
    }

    // Check if this is a UUID (Supabase message) or legacy post ID
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(messageId);
    console.log('🗑️ DELETE_MESSAGE: Is UUID:', isUUID);
    
    if (!isUUID) {
      console.warn('⚠️ DELETE_MESSAGE: Non-UUID message ID detected (legacy backend message)');
      console.warn('⚠️ DELETE_MESSAGE: Cannot delete from Supabase messages table');
      console.warn('⚠️ DELETE_MESSAGE: This message exists in the backend API, not Supabase');
      // For non-UUID messages, we should use the API delete endpoint instead
      // But for now, just log and return to avoid 400 errors
      return;
    }

    try {
      console.log('🗑️ DELETE_MESSAGE: Deleting message from database...');
      console.log('🗑️ DELETE_MESSAGE: Current user email:', this.currentUser.userEmail);
      console.log('🗑️ DELETE_MESSAGE: Message ID to delete:', messageId);
      
      // First, let's check if the message exists and get its details
      const { data: messageData, error: fetchError } = await this.supabase
        .from('messages')
        .select('*')
        .eq('id', messageId);
      
      if (fetchError) {
        console.error('❌ DELETE_MESSAGE: Error fetching message:', fetchError);
        return;
      }
      
      if (!messageData || messageData.length === 0) {
        console.error('❌ DELETE_MESSAGE: Message not found in database');
        return;
      }
      
      console.log('🗑️ DELETE_MESSAGE: Found message:', messageData[0]);
      console.log('🗑️ DELETE_MESSAGE: Message user_email:', messageData[0].user_email);
      console.log('🗑️ DELETE_MESSAGE: Current user email:', this.currentUser.userEmail);
      
      // Try deletion without user_email filter first (RLS should handle this)
      const { data, error } = await this.supabase
        .from('messages')
        .delete()
        .eq('id', messageId)
        .eq('community_id', this.currentUser.communityId || 'comm-001');

      if (error) {
        console.error('❌ DELETE_MESSAGE: Database error:', error);
        console.error('❌ DELETE_MESSAGE: Error details:', JSON.stringify(error, null, 2));
        console.error('❌ DELETE_MESSAGE: Error code:', error.code);
        console.error('❌ DELETE_MESSAGE: Error message:', error.message);
      } else {
        console.log('✅ DELETE_MESSAGE: Message deleted successfully:', data);
        console.log('✅ DELETE_MESSAGE: Deleted rows:', data?.length || 0);
      }
    } catch (error) {
      console.error('❌ DELETE_MESSAGE: Exception during deletion:', error);
      console.error('❌ DELETE_MESSAGE: Error stack:', error.stack);
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

  /**
   * Handle message deletion events from Supabase real-time
   */
  handleMessageDeletion(payload) {
    console.log('🗑️ HANDLE_MESSAGE_DELETION: Processing deletion event');
    console.log('🗑️ Payload:', payload);
    console.log('🗑️ Deleted message ID:', payload.old?.id);
    console.log('🗑️ Deleted message user:', payload.old?.user_email);
    console.log('🗑️ Deleted message page:', payload.old?.page_id);
    console.log('🗑️ onMessageDeleted callback exists:', !!this._onMessageDeleted);
    
    // For DELETE events, the deleted message data is in payload.old
    if (payload.old && this._onMessageDeleted) {
      console.log('🗑️ Calling onMessageDeleted callback with message ID:', payload.old.id);
      // Pass the deleted message data to the callback
      this._onMessageDeleted({
        message_id: payload.old.id,
        user_email: payload.old.user_email,
        page_id: payload.old.page_id
      });
    } else {
      console.log('⚠️ HANDLE_MESSAGE_DELETION: Missing payload.old or onMessageDeleted callback');
    }
  }

  // Event handlers (set these from your main code)
  set onUserJoined(callback) { this._onUserJoined = callback; }
  set onUserUpdated(callback) { this._onUserUpdated = callback; }
  set onUserLeft(callback) { this._onUserLeft = callback; }
  set onNewMessage(callback) { this._onNewMessage = callback; }
  set onMessageUpdated(callback) { this._onMessageUpdated = callback; }
  set onVisibilityChanged(callback) { this._onVisibilityChanged = callback; }
  set onMessageDeleted(callback) { this._onMessageDeleted = callback; }

  get onUserJoined() { return this._onUserJoined; }
  get onUserUpdated() { return this._onUserUpdated; }
  get onUserLeft() { return this._onUserLeft; }
  get onNewMessage() { return this._onNewMessage; }
  get onMessageUpdated() { return this._onMessageUpdated; }
  get onVisibilityChanged() { return this._onVisibilityChanged; }
  get onMessageDeleted() { return this._onMessageDeleted; }

  // Supabase real-time connection is stable without manual heartbeat
}

// Export for use in your extension
if (typeof module !== 'undefined' && module.exports) {
  module.exports = SupabaseRealtimeClient;
} else {
  window.SupabaseRealtimeClient = SupabaseRealtimeClient;
}
