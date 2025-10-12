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
    console.log('🔌 REALTIME_PRESENCE: Setting up event handlers');
    
    // User joined page
    window.supabaseRealtimeClient.onUserJoined = (presenceRecord) => {
      console.log('🟢 REALTIME: User joined:', presenceRecord.user_email);
      this.handleUserJoined(presenceRecord);
    };
    
    // User left page
    window.supabaseRealtimeClient.onUserLeft = (presenceRecord) => {
      console.log('🔴 REALTIME: User left:', presenceRecord.user_email);
      this.handleUserLeft(presenceRecord);
    };
    
    // User updated (aura color, status, etc.)
    window.supabaseRealtimeClient.onUserUpdated = (presenceRecord) => {
      console.log('🔵 REALTIME: User updated:', presenceRecord.user_email);
      this.handleUserUpdated(presenceRecord);
    };
    
    console.log('✅ REALTIME_PRESENCE: Event handlers setup complete');
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
      if (!this.isActive || !this.currentPageId) {
        return;
      }
      
      try {
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
      
      // Update UI
      if (typeof window.updateVisibleTab === 'function') {
        window.updateVisibleTab(window.currentVisibilityData.active);
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
    
    if (!window.currentVisibilityData) {
      return;
    }
    
    // Remove user from visibility list
    window.currentVisibilityData.active = window.currentVisibilityData.active.filter(
      u => u.email !== presenceRecord.user_email
    );
    
    console.log('✅ HANDLE_LEAVE: Removed user from visibility list');
    
    // Update UI
    if (typeof window.updateVisibleTab === 'function') {
      window.updateVisibleTab(window.currentVisibilityData.active);
    }
  }
  
  /**
   * Handle user updated event
   * Called automatically by Supabase when a user's presence changes
   */
  async handleUserUpdated(presenceRecord) {
    console.log('🔵 HANDLE_UPDATE: Processing user update:', presenceRecord.user_email);
    
    if (!window.currentVisibilityData) {
      return;
    }
    
    // Find user in visibility list
    const userIndex = window.currentVisibilityData.active.findIndex(
      u => u.email === presenceRecord.user_email
    );
    
    if (userIndex !== -1) {
      // Update user data
      window.currentVisibilityData.active[userIndex] = {
        ...window.currentVisibilityData.active[userIndex],
        lastSeen: presenceRecord.last_seen,
        enterTime: presenceRecord.enter_time,
        isActive: presenceRecord.is_active,
        auraColor: presenceRecord.aura_color || window.currentVisibilityData.active[userIndex].auraColor,
        status: presenceRecord.is_active ? 'online' : 'offline'
      };
      
      console.log('✅ HANDLE_UPDATE: Updated user in visibility list');
      
      // Update UI
      if (typeof window.updateVisibleTab === 'function') {
        window.updateVisibleTab(window.currentVisibilityData.active);
      }
    } else {
      console.log('ℹ️ HANDLE_UPDATE: User not in list, adding instead');
      this.handleUserJoined(presenceRecord);
    }
  }
}

// Create global instance
window.realtimePresenceHandler = new RealtimePresenceHandler();

console.log('✅ RealtimePresenceHandler loaded and ready');

