/**
 * UnifiedPresenceManager - Single source of truth for presence tracking
 * 
 * ARCHITECTURE PRINCIPLES:
 * - Single Responsibility: Only handles presence tracking
 * - Self-contained: No external dependencies beyond Supabase
 * - Configurable logging: DEBUG/INFO/WARN/ERROR levels
 * - Error handling: Comprehensive error management
 * - State management: Centralized presence state
 */

class UnifiedPresenceManager {
  constructor(supabaseClient) {
    this.supabase = supabaseClient;
    this.currentUser = null;
    this.currentPageId = null;
    this.isConnected = false;
    this.presenceChannel = null;
    this.logLevel = 'INFO';
    this.logPrefix = '[UnifiedPresenceManager]';
    
    // State management
    this.activeUsers = new Map(); // email -> user data
    this.presenceEvents = new Map(); // event tracking
    
    // Configuration
    this.config = {
      reconnectAttempts: 3,
      reconnectDelay: 2000,
      presenceTimeout: 30000, // 30 seconds
      heartbeatInterval: 10000 // 10 seconds
    };
  }

  setLogLevel(level) {
    this.logLevel = level;
  }

  log(level, ...args) {
    const levels = ['DEBUG', 'INFO', 'WARN', 'ERROR'];
    if (levels.indexOf(level) >= levels.indexOf(this.logLevel)) {
      console.log(`${this.logPrefix} [${level}]`, ...args);
    }
  }

  /**
   * Initialize the presence manager
   */
  async initialize(user, pageId) {
    this.log('INFO', 'Initializing UnifiedPresenceManager...');
    
    if (!user || !pageId) {
      this.log('ERROR', 'User or pageId not provided for initialization');
      return false;
    }

    this.currentUser = user;
    this.currentPageId = pageId;
    
    try {
      // Set up presence tracking
      await this._setupPresenceTracking();
      
      // Send initial presence event
      await this._sendPresenceEvent('ENTER');
      
      // Start heartbeat
      this._startHeartbeat();
      
      this.isConnected = true;
      this.log('INFO', 'UnifiedPresenceManager initialized successfully');
      return true;
    } catch (error) {
      this.log('ERROR', 'Failed to initialize UnifiedPresenceManager:', error);
      return false;
    }
  }

  /**
   * Set up presence tracking with Supabase real-time
   */
  async _setupPresenceTracking() {
    this.log('DEBUG', 'Setting up presence tracking...');
    
    if (!this.presenceChannel) {
      this.presenceChannel = this.supabase.channel(`presence:${this.currentPageId}`);
      
      // Listen for presence changes
      this.presenceChannel.on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_presence',
          filter: `page_id=eq.${this.currentPageId}`
        },
        (payload) => this._handlePresenceChange(payload)
      );

      // Subscribe to channel
      const { status } = await this.presenceChannel.subscribe();
      this.log('INFO', `Presence channel subscription status: ${status}`);
      
      if (status === 'CHANNEL_ERROR' || status === 'CLOSED') {
        throw new Error(`Presence channel failed: ${status}`);
      }
    }
  }

  /**
   * Handle presence changes from Supabase
   */
  _handlePresenceChange(payload) {
    this.log('DEBUG', 'Presence change received:', payload);
    
    const { eventType, new: newRecord, old: oldRecord } = payload;
    const userEmail = newRecord?.user_email || oldRecord?.user_email;
    
    if (!userEmail) {
      this.log('WARN', 'No user email in presence change');
      return;
    }

    switch (eventType) {
      case 'INSERT':
        this._handleUserJoined(newRecord);
        break;
      case 'UPDATE':
        this._handleUserUpdated(newRecord);
        break;
      case 'DELETE':
        this._handleUserLeft(oldRecord);
        break;
    }
  }

  /**
   * Handle user joined event
   */
  _handleUserJoined(userData) {
    this.log('INFO', `User joined: ${userData.user_email}`);
    this.activeUsers.set(userData.user_email, {
      email: userData.user_email,
      name: userData.user_name || userData.user_email,
      avatarUrl: userData.avatar_url,
      auraColor: userData.aura_color || '#aa00aa',
      joinedAt: new Date().toISOString(),
      lastSeen: new Date().toISOString()
    });
    
    // Emit event for UI updates
    this._emitPresenceEvent('userJoined', this.activeUsers.get(userData.user_email));
  }

  /**
   * Handle user updated event
   */
  _handleUserUpdated(userData) {
    this.log('INFO', `User updated: ${userData.user_email}`);
    const existingUser = this.activeUsers.get(userData.user_email);
    if (existingUser) {
      existingUser.avatarUrl = userData.avatar_url || existingUser.avatarUrl;
      existingUser.auraColor = userData.aura_color || existingUser.auraColor;
      existingUser.lastSeen = new Date().toISOString();
      this.activeUsers.set(userData.user_email, existingUser);
      
      // Emit event for UI updates
      this._emitPresenceEvent('userUpdated', existingUser);
    }
  }

  /**
   * Handle user left event
   */
  _handleUserLeft(userData) {
    this.log('INFO', `User left: ${userData.user_email}`);
    this.activeUsers.delete(userData.user_email);
    
    // Emit event for UI updates
    this._emitPresenceEvent('userLeft', { email: userData.user_email });
  }

  /**
   * Send presence event to backend
   */
  async _sendPresenceEvent(kind, availability = null, customLabel = null) {
    this.log('DEBUG', `Sending presence event: ${kind}`);
    
    try {
      const response = await fetch(`${window.METALAYER_API_URL || 'https://api.themetalayer.org'}/v1/presence/event`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-email': this.currentUser.email,
          'x-user-id': this.currentUser.email
        },
        body: JSON.stringify({
          pageId: this.currentPageId,
          kind,
          availability,
          customLabel,
          pageUrl: window.location.href
        })
      });

      if (response.ok) {
        this.log('INFO', `Presence event ${kind} sent successfully`);
        return true;
      } else {
        this.log('ERROR', `Failed to send presence event: ${response.status}`);
        return false;
      }
    } catch (error) {
      this.log('ERROR', `Error sending presence event:`, error);
      return false;
    }
  }

  /**
   * Start heartbeat to maintain presence
   */
  _startHeartbeat() {
    this.heartbeatInterval = setInterval(async () => {
      if (this.isConnected) {
        await this._sendPresenceEvent('HEARTBEAT');
      }
    }, this.config.heartbeatInterval);
  }

  /**
   * Emit presence events for UI updates
   */
  _emitPresenceEvent(type, data) {
    // Create custom event
    const event = new CustomEvent('presenceUpdate', {
      detail: { type, data, activeUsers: Array.from(this.activeUsers.values()) }
    });
    window.dispatchEvent(event);
    
    this.log('DEBUG', `Presence event emitted: ${type}`, data);
  }

  /**
   * Get active users
   */
  getActiveUsers() {
    return Array.from(this.activeUsers.values());
  }

  /**
   * Get user by email
   */
  getUserByEmail(email) {
    return this.activeUsers.get(email);
  }

  /**
   * Update user aura color
   */
  async updateUserAura(email, auraColor) {
    this.log('INFO', `Updating aura for ${email} to ${auraColor}`);
    
    const user = this.activeUsers.get(email);
    if (user) {
      user.auraColor = auraColor;
      this.activeUsers.set(email, user);
      
      // Emit update event
      this._emitPresenceEvent('userUpdated', user);
    }
  }

  /**
   * Leave page and cleanup
   */
  async leavePage() {
    this.log('INFO', 'Leaving page and cleaning up...');
    
    if (this.isConnected) {
      await this._sendPresenceEvent('LEAVE');
    }
    
    if (this.presenceChannel) {
      await this.presenceChannel.unsubscribe();
      this.presenceChannel = null;
    }
    
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
    
    this.activeUsers.clear();
    this.isConnected = false;
    
    this.log('INFO', 'Presence manager cleaned up');
  }

  /**
   * Get connection status
   */
  getStatus() {
    return {
      isConnected: this.isConnected,
      activeUsersCount: this.activeUsers.size,
      currentPageId: this.currentPageId,
      currentUser: this.currentUser?.email
    };
  }
}

// Export for use
if (typeof window !== 'undefined') {
  window.UnifiedPresenceManager = UnifiedPresenceManager;
}
