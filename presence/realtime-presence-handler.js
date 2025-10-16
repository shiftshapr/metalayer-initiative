// Real-time Presence Handler - Supabase Only, No Polling
// This replaces ALL polling mechanisms with Supabase real-time subscriptions

class RealtimePresenceHandler {
  constructor() {
    this.currentPageId = null;
    this.currentPageUrl = null;
    this.heartbeatInterval = null;
    this.isActive = false;
    
    console.log('🚀 RealtimePresenceHandler initialized');
  }
  
  /**
   * Start presence tracking for current page
   * Sets up Supabase subscriptions and heartbeat
   */
  async start(pageId, pageUrl) {
    console.log('🟢 REALTIME_PRESENCE: Starting for page:', pageId);
    
    // Stop any existing tracking
    await this.stop();
    
    this.currentPageId = pageId;
    this.currentPageUrl = pageUrl;
    this.isActive = true;
    
    // Initialize Supabase real-time client if not already done
    if (!window.supabaseRealtimeClient) {
      console.error('❌ REALTIME_PRESENCE: Supabase client not initialized');
      return;
    }
    
    // Set current user
    const userEmail = await window.getCurrentUserEmail();
    const userId = await window.getCurrentUserId();
    await window.supabaseRealtimeClient.setCurrentUser(userEmail, userId);
    
    // Join page (this subscribes to real-time updates)
    await window.supabaseRealtimeClient.joinPage(pageId, pageUrl);
    
    // Wire up event handlers
    this.setupEventHandlers();
    
    // Start heartbeat (Supabase requires periodic updates)
    this.startHeartbeat();
    
    // Load initial visibility list
    await this.loadInitialVisibility();
    
    console.log('✅ REALTIME_PRESENCE: Started successfully');
  }
  
  /**
   * Stop presence tracking
   */
  async stop() {
    console.log('🛑 REALTIME_PRESENCE: Stopping');
    
    this.isActive = false;
    
    // Stop heartbeat
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
    
    // Leave current page (marks as inactive in Supabase)
    if (window.supabaseRealtimeClient && this.currentPageId) {
      await window.supabaseRealtimeClient.leaveCurrentPage();
    }
    
    this.currentPageId = null;
    this.currentPageUrl = null;
    
    console.log('✅ REALTIME_PRESENCE: Stopped');
  }
  
  /**
   * Setup Supabase real-time event handlers
   * These are called automatically when presence changes
   */
  setupEventHandlers() {
    console.log('');
    console.log('🔌🔌🔌═══════════════════════════════════════════════════════');
    console.log('🔌🔌🔌 SETUP_HANDLERS: Registering event callbacks');
    console.log('🔌🔌🔌═══════════════════════════════════════════════════════');
    console.log('🔌 supabaseRealtimeClient exists:', !!window.supabaseRealtimeClient);
    console.log('🔌 Timestamp:', new Date().toISOString());
    
    // User joined page
    window.supabaseRealtimeClient.onUserJoined = (presenceRecord) => {
      console.log('🟢🟢🟢 CALLBACK_INVOKED: onUserJoined called!');
      console.log('🟢 User:', presenceRecord.user_email);
      this.handleUserJoined(presenceRecord);
    };
    console.log('✅ SETUP_HANDLERS: onUserJoined registered');
    
    // User left page
    window.supabaseRealtimeClient.onUserLeft = (presenceRecord) => {
      console.log('🔴🔴🔴 CALLBACK_INVOKED: onUserLeft called!');
      console.log('🔴 User:', presenceRecord.user_email);
      this.handleUserLeft(presenceRecord);
    };
    console.log('✅ SETUP_HANDLERS: onUserLeft registered');
    
    // User updated (aura color, status, etc.)
    window.supabaseRealtimeClient.onUserUpdated = (presenceRecord) => {
      console.log('');
      console.log('🔵🔵🔵═══════════════════════════════════════════════════════');
      console.log('🔵🔵🔵 CALLBACK_INVOKED: onUserUpdated called!');
      console.log('🔵🔵🔵═══════════════════════════════════════════════════════');
      console.log('🔵 User:', presenceRecord.user_email);
      console.log('🔵 is_active:', presenceRecord.is_active);
      console.log('🔵 page_id:', presenceRecord.page_id);
      console.log('🔵 Timestamp:', new Date().toISOString());
      console.log('🔵 Now calling handleUserUpdated()...');
      this.handleUserUpdated(presenceRecord);
      console.log('🔵 handleUserUpdated() completed');
      console.log('🔵🔵🔵═══════════════════════════════════════════════════════');
      console.log('');
    };
    console.log('✅ SETUP_HANDLERS: onUserUpdated registered');
    
    // Verify callbacks are registered
    console.log('');
    console.log('🔍 SETUP_HANDLERS: Verifying callback registration:');
    console.log('   onUserJoined type:', typeof window.supabaseRealtimeClient.onUserJoined);
    console.log('   onUserLeft type:', typeof window.supabaseRealtimeClient.onUserLeft);
    console.log('   onUserUpdated type:', typeof window.supabaseRealtimeClient.onUserUpdated);
    console.log('✅✅✅ SETUP_HANDLERS: All event handlers setup complete');
    console.log('🔌🔌🔌═══════════════════════════════════════════════════════');
    console.log('');
  }
  
  /**
   * Start heartbeat to keep presence alive
   * Supabase requires periodic updates to maintain presence
   */
  startHeartbeat() {
    console.log('💓 REALTIME_PRESENCE: Starting heartbeat (every 5s)');
    
    // Clear any existing heartbeat
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
    }
    
    // Send heartbeat every 5 seconds
    this.heartbeatInterval = setInterval(async () => {
      if (!this.isActive) {
        console.log('⏭️ HEARTBEAT: SKIPPED - Handler not active');
        return;
      }
      
      if (!this.currentPageId) {
        console.log('⏭️ HEARTBEAT: SKIPPED - No current page');
        return;
      }
      
      // Check if we're in the middle of leaving a page
      if (window.supabaseRealtimeClient?.isLeavingPage) {
        console.log('⏭️ HEARTBEAT: SKIPPED - Currently leaving a page (mutex active)');
        return;
      }
      
      // Check if supabaseRealtimeClient has a current page
      if (!window.supabaseRealtimeClient?.currentPage) {
        console.log('⏭️ HEARTBEAT: SKIPPED - supabaseRealtimeClient has no current page');
        return;
      }
      
      try {
        console.log('💓 HEARTBEAT: Sending for page:', this.currentPageId);
        await window.supabaseRealtimeClient.updatePresence(
          this.currentPageId,
          this.currentPageUrl,
          window.currentUser?.auraColor
        );
        console.log('💓 HEARTBEAT: Sent via Supabase real-time');
      } catch (error) {
        console.error('❌ HEARTBEAT: Error:', error);
      }
    }, 5000);
  }
  
  /**
   * Load initial visibility list from backend
   * This is called ONCE on page load, then real-time updates take over
   */
  async loadInitialVisibility() {
    console.log('📊 REALTIME_PRESENCE: Loading initial visibility list');
    
    try {
      // Get active communities
      const result = await chrome.storage.local.get(['activeCommunities']);
      const activeCommunities = result.activeCommunities || ['comm-001'];
      
      // Load avatars (this calls the backend API)
      if (typeof window.loadCombinedAvatars === 'function') {
        await window.loadCombinedAvatars(activeCommunities);
        console.log('✅ REALTIME_PRESENCE: Initial visibility loaded');
      }
    } catch (error) {
      console.error('❌ REALTIME_PRESENCE: Error loading initial visibility:', error);
    }
  }
  
  /**
   * Handle user joined event
   * Called automatically by Supabase when a user enters the page
   */
  async handleUserJoined(presenceRecord) {
    console.log('🟢 HANDLE_JOIN: Processing user join:', presenceRecord.user_email);
    console.log('🟢 HANDLE_JOIN: Event page_id:', presenceRecord.page_id);
    console.log('🟢 HANDLE_JOIN: Current page_id:', this.currentPageId);
    
    // CRITICAL FIX: Ignore events for other pages
    if (presenceRecord.page_id !== this.currentPageId) {
      console.log('⚠️ HANDLE_JOIN: Ignoring event - user is on different page');
      console.log(`   Event page: ${presenceRecord.page_id}`);
      console.log(`   Current page: ${this.currentPageId}`);
      return;
    }
    
    // Get current visibility data
    if (!window.currentVisibilityData) {
      window.currentVisibilityData = { active: [] };
    }
    
    // Check if user already in list
    const existingIndex = window.currentVisibilityData.active.findIndex(
      u => u.email === presenceRecord.user_email
    );
    
    if (existingIndex === -1) {
      // Add new user to visibility list
      const newUser = {
        id: presenceRecord.user_email,
        userId: presenceRecord.user_email,
        email: presenceRecord.user_email,
        name: presenceRecord.user_email.split('@')[0],
        handle: presenceRecord.user_email.split('@')[0],
        avatarUrl: presenceRecord.avatar_url || null,
        auraColor: presenceRecord.aura_color || '#aaaaaa',
        lastSeen: presenceRecord.last_seen,
        enterTime: presenceRecord.enter_time,
        isActive: presenceRecord.is_active,
        status: 'online'
      };
      
      window.currentVisibilityData.active.push(newUser);
      console.log('✅ HANDLE_JOIN: Added user to visibility list');
      
      // CRITICAL FIX: Use refreshVisibilityAvatars() to get enhanced query data
      if (typeof window.refreshVisibilityAvatars === 'function') {
        await window.refreshVisibilityAvatars();
      }
    } else {
      console.log('ℹ️ HANDLE_JOIN: User already in list, updating instead');
      this.handleUserUpdated(presenceRecord);
    }
  }
  
  /**
   * Handle user left event
   * Called automatically by Supabase when a user leaves the page
   */
  async handleUserLeft(presenceRecord) {
    console.log('🔴 HANDLE_LEAVE: Processing user leave:', presenceRecord.user_email);
    console.log('🔴 HANDLE_LEAVE: Event page_id:', presenceRecord.page_id);
    console.log('🔴 HANDLE_LEAVE: Current page_id:', this.currentPageId);
    
    // CRITICAL FIX: Ignore events for other pages
    if (presenceRecord.page_id !== this.currentPageId) {
      console.log('⚠️ HANDLE_LEAVE: Ignoring event - user left different page');
      console.log(`   Event page: ${presenceRecord.page_id}`);
      console.log(`   Current page: ${this.currentPageId}`);
      return;
    }
    
    if (!window.currentVisibilityData) {
      return;
    }
    
    // Remove user from visibility list
    window.currentVisibilityData.active = window.currentVisibilityData.active.filter(
      u => u.email !== presenceRecord.user_email
    );
    
    console.log('✅ HANDLE_LEAVE: Removed user from visibility list');
    
    // CRITICAL FIX: Use refreshVisibilityAvatars() to get enhanced query data
    if (typeof window.refreshVisibilityAvatars === 'function') {
      await window.refreshVisibilityAvatars();
    }
  }
  
  /**
   * Handle user updated event
   * Called automatically by Supabase when a user's presence changes
   */
  async handleUserUpdated(presenceRecord) {
    console.log('');
    console.log('🟦🟦🟦═══════════════════════════════════════════════════════');
    console.log('🟦🟦🟦 HANDLER_ENTRY: handleUserUpdated ENTERED');
    console.log('🟦🟦🟦═══════════════════════════════════════════════════════');
    console.log('🟦 User:', presenceRecord.user_email);
    console.log('🟦 is_active:', presenceRecord.is_active);
    console.log('🟦 Current page:', this.currentPageId);
    console.log('🟦 Event page:', presenceRecord.page_id);
    console.log('🟦 Handler active:', this.isActive);
    console.log('🟦 Timestamp:', new Date().toISOString());
    console.log('');
    console.log('═══════════════════════════════════════════════════════════');
    console.log('🔵 HANDLE_UPDATE: === PROCESSING USER UPDATE ===');
    console.log('═══════════════════════════════════════════════════════════');
    console.log('🔵 HANDLE_UPDATE: User:', presenceRecord.user_email);
    console.log('🔵 HANDLE_UPDATE: Event page_id:', presenceRecord.page_id);
    console.log('🔵 HANDLE_UPDATE: Current page_id:', this.currentPageId);
    console.log('🔵 HANDLE_UPDATE: Is active:', presenceRecord.is_active);
    console.log('🔵 HANDLE_UPDATE: Last seen:', presenceRecord.last_seen);
    console.log('🔵 HANDLE_UPDATE: Enter time:', presenceRecord.enter_time);
    console.log('🔵 HANDLE_UPDATE: Aura color:', presenceRecord.aura_color);
    console.log('🔵 HANDLE_UPDATE: Timestamp:', new Date().toISOString());
    
    // === PAGE ID COMPARISON ===
    console.log('');
    console.log('📊 HANDLE_UPDATE: Page ID Comparison');
    console.log('───────────────────────────────────────────────────────────');
    console.log('🔍 HANDLE_UPDATE: Event page_id:', presenceRecord.page_id);
    console.log('🔍 HANDLE_UPDATE: Current page_id:', this.currentPageId);
    console.log('🔍 HANDLE_UPDATE: Are they equal?', presenceRecord.page_id === this.currentPageId);
    console.log('🔍 HANDLE_UPDATE: Event page_id type:', typeof presenceRecord.page_id);
    console.log('🔍 HANDLE_UPDATE: Current page_id type:', typeof this.currentPageId);
    
    // CRITICAL FIX: Process is_active: false events for current page (user leaving)
    // But ignore events for other pages
    if (presenceRecord.page_id !== this.currentPageId) {
      console.log('');
      console.log('⚠️⚠️⚠️ HANDLE_UPDATE: DIFFERENT PAGE DETECTED ⚠️⚠️⚠️');
      console.log('⚠️ HANDLE_UPDATE: Ignoring event - user updated on different page');
      console.log(`   Event page: ${presenceRecord.page_id}`);
      console.log(`   Current page: ${this.currentPageId}`);
      
      // CRITICAL FIX: If user is in our list but they're on a different page now, REMOVE them
      console.log('');
      console.log('📊 HANDLE_UPDATE: Checking if user needs to be removed from visibility');
      console.log('───────────────────────────────────────────────────────────');
      
      if (window.currentVisibilityData && window.currentVisibilityData.active) {
        console.log('🔍 HANDLE_UPDATE: Current visibility data exists');
        console.log('🔍 HANDLE_UPDATE: Active users count:', window.currentVisibilityData.active.length);
        
        const userIndex = window.currentVisibilityData.active.findIndex(
          u => u.email === presenceRecord.user_email
        );
        
        console.log('🔍 HANDLE_UPDATE: User index in visibility list:', userIndex);
        
        if (userIndex !== -1) {
          console.log('🚪 HANDLE_UPDATE: User found in visibility list - UPDATING to show "last seen"');
          console.log('🚪 HANDLE_UPDATE: User was on our page but moved to different page');
          
          // Update user to inactive status so they show "Last seen X ago"
          window.currentVisibilityData.active[userIndex] = {
            ...window.currentVisibilityData.active[userIndex],
            lastSeen: presenceRecord.last_seen,
            enterTime: presenceRecord.enter_time,
            isActive: false,
            auraColor: presenceRecord.aura_color || window.currentVisibilityData.active[userIndex].auraColor,
            status: 'offline'
          };
          
          console.log('✅ HANDLE_UPDATE: Updated user to inactive status (moved to different page)');
          console.log('🔍 HANDLE_UPDATE: Updated data:', JSON.stringify(window.currentVisibilityData.active[userIndex], null, 2));
          
          // Update UI to reflect inactive status
          if (typeof window.updateVisibleTab === 'function') {
            console.log('🔄 HANDLE_UPDATE: Calling updateVisibleTab to refresh UI...');
            window.updateVisibleTab(window.currentVisibilityData.active);
            console.log('✅ HANDLE_UPDATE: UI updated');
          } else {
            console.error('❌ HANDLE_UPDATE: updateVisibleTab function not available!');
          }
        } else {
          console.log('✓ HANDLE_UPDATE: User not in visibility list (already removed or never added)');
        }
      } else {
        console.log('⚠️ HANDLE_UPDATE: No visibility data available');
      }
      
      console.log('');
      console.log('✅ HANDLE_UPDATE: Different page handling complete');
      console.log('═══════════════════════════════════════════════════════════');
      console.log('');
      return;
    }
    
    // === SAME PAGE - UPDATE USER DATA ===
    console.log('');
    console.log('✅✅✅ HANDLE_UPDATE: SAME PAGE - Processing Update ✅✅✅');
    console.log('───────────────────────────────────────────────────────────');
    
    if (!window.currentVisibilityData) {
      console.log('⚠️ HANDLE_UPDATE: No visibility data available - cannot update');
      console.log('═══════════════════════════════════════════════════════════');
      console.log('');
      return;
    }
    
    console.log('🔍 HANDLE_UPDATE: Current visibility data exists');
    console.log('🔍 HANDLE_UPDATE: Active users count:', window.currentVisibilityData.active.length);
    console.log('🔍 HANDLE_UPDATE: Active users:', window.currentVisibilityData.active.map(u => u.email));
    
    // Find user in visibility list
    const userIndex = window.currentVisibilityData.active.findIndex(
      u => u.email === presenceRecord.user_email
    );
    
    console.log('🔍 HANDLE_UPDATE: User index in visibility list:', userIndex);
    
    if (userIndex !== -1) {
      console.log('');
      console.log('📊 HANDLE_UPDATE: User found in list - Checking activity status');
      console.log('───────────────────────────────────────────────────────────');
      
      const oldData = { ...window.currentVisibilityData.active[userIndex] };
      console.log('🔍 HANDLE_UPDATE: Old data:', JSON.stringify(oldData, null, 2));
      
      // CRITICAL FIX: If user became inactive on THIS page, UPDATE them to show "last seen" status
      // Keep them in the list but mark as inactive so UI can show "Last seen X ago"
      if (presenceRecord.is_active === false) {
        console.log('');
        console.log('🚪🚪🚪 HANDLE_UPDATE: USER BECAME INACTIVE ON THIS PAGE 🚪🚪🚪');
        console.log('🚪 HANDLE_UPDATE: User left the page - UPDATING to show "last seen" status');
        console.log('🚪 HANDLE_UPDATE: User:', presenceRecord.user_email);
        console.log('🚪 HANDLE_UPDATE: Page:', presenceRecord.page_id);
        console.log('🚪 HANDLE_UPDATE: Last seen:', presenceRecord.last_seen);
        
        // Update user data to reflect inactive status
        window.currentVisibilityData.active[userIndex] = {
          ...window.currentVisibilityData.active[userIndex],
          lastSeen: presenceRecord.last_seen,
          enterTime: presenceRecord.enter_time,
          isActive: false,
          auraColor: presenceRecord.aura_color || window.currentVisibilityData.active[userIndex].auraColor,
          status: 'offline'
        };
        
        console.log('✅ HANDLE_UPDATE: Updated user to inactive status (will show "Last seen X ago")');
        console.log('🔍 HANDLE_UPDATE: Updated data:', JSON.stringify(window.currentVisibilityData.active[userIndex], null, 2));
        
        // CRITICAL FIX: Use refreshVisibilityAvatars() to get enhanced query data
        console.log('');
        console.log('📊 HANDLE_UPDATE: Updating UI to show "last seen" status');
        console.log('───────────────────────────────────────────────────────────');
        if (typeof window.refreshVisibilityAvatars === 'function') {
          console.log('🔄 HANDLE_UPDATE: Calling refreshVisibilityAvatars() to get enhanced query data');
          const uiStartTime = Date.now();
          await window.refreshVisibilityAvatars();
          const uiEndTime = Date.now();
          console.log(`✅ HANDLE_UPDATE: UI updated with enhanced query in ${uiEndTime - uiStartTime}ms`);
        } else {
          console.error('❌ HANDLE_UPDATE: refreshVisibilityAvatars function not available!');
        }
        
        console.log('');
        console.log('✅✅✅ HANDLE_UPDATE: COMPLETE (User Marked Inactive) ✅✅✅');
        console.log('═══════════════════════════════════════════════════════════');
        console.log('');
        return;
      }
      
      // User is still active - update their data
      console.log('🔄 HANDLE_UPDATE: User still active - updating data');
      
      // Update user data
      window.currentVisibilityData.active[userIndex] = {
        ...window.currentVisibilityData.active[userIndex],
        lastSeen: presenceRecord.last_seen,
        enterTime: presenceRecord.enter_time,
        isActive: presenceRecord.is_active,
        auraColor: presenceRecord.aura_color || window.currentVisibilityData.active[userIndex].auraColor,
        status: presenceRecord.is_active ? 'online' : 'offline'
      };
      
      const newData = window.currentVisibilityData.active[userIndex];
      console.log('🔍 HANDLE_UPDATE: New data:', JSON.stringify(newData, null, 2));
      console.log('🔍 HANDLE_UPDATE: Changes:');
      if (oldData.isActive !== newData.isActive) {
        console.log(`   - isActive: ${oldData.isActive} → ${newData.isActive}`);
      }
      if (oldData.lastSeen !== newData.lastSeen) {
        console.log(`   - lastSeen: ${oldData.lastSeen} → ${newData.lastSeen}`);
      }
      if (oldData.enterTime !== newData.enterTime) {
        console.log(`   - enterTime: ${oldData.enterTime} → ${newData.enterTime}`);
      }
      if (oldData.auraColor !== newData.auraColor) {
        console.log(`   - auraColor: ${oldData.auraColor} → ${newData.auraColor}`);
      }
      if (oldData.status !== newData.status) {
        console.log(`   - status: ${oldData.status} → ${newData.status}`);
      }
      
      console.log('✅ HANDLE_UPDATE: User data updated in visibility list');
      
      // Update UI
      console.log('');
      // CRITICAL FIX: Use refreshVisibilityAvatars() to get enhanced query data
      console.log('📊 HANDLE_UPDATE: Updating UI');
      console.log('───────────────────────────────────────────────────────────');
      if (typeof window.refreshVisibilityAvatars === 'function') {
        console.log('🔄 HANDLE_UPDATE: Calling refreshVisibilityAvatars() to get enhanced query data');
        const uiStartTime = Date.now();
        await window.refreshVisibilityAvatars();
        const uiEndTime = Date.now();
        console.log(`✅ HANDLE_UPDATE: UI updated with enhanced query in ${uiEndTime - uiStartTime}ms`);
      } else {
        console.error('❌ HANDLE_UPDATE: refreshVisibilityAvatars function not available!');
      }
    } else {
      console.log('');
      console.log('📊 HANDLE_UPDATE: User not in list - Adding as new user');
      console.log('───────────────────────────────────────────────────────────');
      console.log('ℹ️ HANDLE_UPDATE: Calling handleUserJoined...');
      this.handleUserJoined(presenceRecord);
      console.log('✅ HANDLE_UPDATE: handleUserJoined completed');
    }
    
    console.log('');
    console.log('✅✅✅ HANDLE_UPDATE: COMPLETE ✅✅✅');
    console.log('═══════════════════════════════════════════════════════════');
    console.log('');
  }
}

// Create global instance
window.realtimePresenceHandler = new RealtimePresenceHandler();

console.log('✅ RealtimePresenceHandler loaded and ready');

