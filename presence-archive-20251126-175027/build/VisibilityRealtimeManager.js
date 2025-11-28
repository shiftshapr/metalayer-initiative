/**
 * VISIBILITY REALTIME MANAGER - Following Working Message Pattern
 * Extends the working message system pattern for visibility features
 * 
 * PATTERN:
 * - Same structure as CleanRealtimeManager
 * - Same real-time subscription approach
 * - Same UI binding pattern
 * - Incremental, not revolutionary
 */

class VisibilityRealtimeManager {
  constructor() {
    this.isConnected = false;
    this.isConnecting = false;
    this.currentPageId = null;
    this.user = null;
    this.supabase = null;
    this.channels = new Map();
    this._processedEvents = new Set();
    this.logger = this._createLogger();
  }

  /**
   * Initialize with Supabase client
   */
  async initialize(supabaseClient) {
    if (!supabaseClient) {
      this.logger.error('Supabase client required');
      return false;
    }

    this.supabase = supabaseClient;
    this.logger.info('VisibilityRealtimeManager initialized');
    return true;
  }

  /**
   * Set user for real-time operations
   */
  setUser(userId, communityId = 'comm-001') {
    if (!userId) {
      this.logger.error('User ID is required');
      return false;
    }

    this.user = {
      id: userId,
      communityId: communityId
    };
    
    this.logger.info(`User set: ${userId}`);
    return true;
  }

  /**
   * Join a page for real-time visibility updates
   */
  async joinPage(pageUrl) {
    if (!this.user) {
      this.logger.error('User must be set before joining page');
      return false;
    }

    if (this.isConnecting) {
      this.logger.warn('Already connecting to page');
      return false;
    }

    try {
      this.isConnecting = true;
      this.logger.info(`Joining page: ${pageUrl}`);
      
      // Normalize page URL (same as message system)
      const normalizedUrl = this._normalizeUrl(pageUrl);
      this.currentPageId = normalizedUrl;
      
      // Subscribe to Postgres Changes for visibility
      await this._setupVisibilitySubscription(normalizedUrl);
      
      this.isConnected = true;
      this.isConnecting = false;
      
      this.logger.info('Page joined successfully');
      return true;
      
    } catch (error) {
      this.logger.error('Failed to join page:', error);
      this.isConnecting = false;
      return false;
    }
  }

  /**
   * Setup Postgres Changes subscription for visibility
   */
  async _setupVisibilitySubscription(pageId) {
    try {
      const channelName = `visibility-${pageId}`;
      
      const channel = this.supabase
        .channel(channelName)
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'user_presence',
          filter: `page_id=eq.${pageId}`
        }, (payload) => {
          this._handleVisibilityChange(payload);
        })
        .subscribe();

      this.channels.set(channelName, channel);
      this.logger.info(`Visibility subscription started for page: ${pageId}`);
      
    } catch (error) {
      this.logger.error('Failed to setup visibility subscription:', error);
      throw error;
    }
  }

  /**
   * Handle visibility changes from Postgres
   */
  _handleVisibilityChange(payload) {
    const eventId = `visibility-${payload.new?.id || payload.old?.id}-${Date.now()}`;
    
    // Prevent duplicate processing
    if (this._processedEvents.has(eventId)) {
      return;
    }
    this._processedEvents.add(eventId);

    this.logger.console.log('Visibility change received:', payload);
    this.logger.info(`Real-time ${payload.eventType} event for visibility:`, payload.new?.id || payload.old?.id);

    // Emit event for UI handling
    this._emitVisibilityEvent(payload);
  }

  /**
   * Emit visibility event
   */
  _emitVisibilityEvent(payload) {
    // Use the same pattern as the working message system
    if (typeof window.realtimeFoundation !== 'undefined') {
      window.realtimeFoundation.emit('visibility-realtime-update', {
        type: payload.eventType,
        data: payload.new || payload.old,
        pageId: this.currentPageId,
        timestamp: Date.now()
      });
    }
  }

  /**
   * Update user visibility
   */
  async updateVisibility(isVisible) {
    if (!this.isConnected) {
      this.logger.error('Not connected to any page');
      return false;
    }

    if (!this.user) {
      this.logger.error('User not set');
      return false;
    }

    try {
      this.logger.info(`Updating visibility: ${isVisible}`);
      
      const visibilityData = {
        user_email: this.user.email,
        page_id: this.currentPageId,
        is_visible: isVisible,
        last_seen: new Date().toISOString(),
        community_id: this.user.communityId
      };

      // Upsert visibility record
      const { data, error } = await this.supabase
        .from('user_presence')
        .upsert([visibilityData])
        .select()
        .single();

      if (error) {
        this.logger.error('Failed to update visibility:', error);
        return false;
      }

      this.logger.info('Visibility updated successfully:', data);
      return data;
      
    } catch (error) {
      this.logger.error('Error updating visibility:', error);
      return false;
    }
  }

  /**
   * Normalize URL (same as message system)
   */
  _normalizeUrl(url) {
    try {
      // Use the same normalization as the working message system
      if (typeof window.normalizeUrl === 'function') {
        return window.normalizeUrl(url);
      }
      
      // Fallback normalization
      const urlObj = new URL(url);
      const normalized = urlObj.hostname + urlObj.pathname;
      return normalized.replace(/[.\/]/g, '_');
    } catch (error) {
      this.logger.warn('Failed to normalize URL, using as-is:', url);
      return url;
    }
  }

  /**
   * Create logger
   */
  _createLogger() {
    return {
      info: (message, data) => console.log(`[VisibilityRealtimeManager] [INFO] ${message}`, data || ''),
      warn: (message, data) => console.warn(`[VisibilityRealtimeManager] [WARN] ${message}`, data || ''),
      error: (message, data) => console.error(`[VisibilityRealtimeManager] [ERROR] ${message}`, data || ''),
      debug: (message, data) => console.log(`[VisibilityRealtimeManager] [DEBUG] ${message}`, data || '')
    };
  }

  /**
   * Get connection status
   */
  getStatus() {
    return {
      isConnected: this.isConnected,
      isConnecting: this.isConnecting,
      currentPageId: this.currentPageId,
      user: this.user ? this.user.email : null,
      channels: Array.from(this.channels.keys())
    };
  }
}

// Export for use
if (typeof window !== 'undefined') {
  window.VisibilityRealtimeManager = VisibilityRealtimeManager;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = VisibilityRealtimeManager;
}
