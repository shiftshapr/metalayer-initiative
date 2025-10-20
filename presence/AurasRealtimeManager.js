/**
 * AURAS REALTIME MANAGER - Following Working Message Pattern
 * Extends the working message system pattern for auras features
 * 
 * PATTERN:
 * - Same structure as CleanRealtimeManager
 * - Same real-time subscription approach
 * - Same UI binding pattern
 * - Incremental, not revolutionary
 */

class AurasRealtimeManager {
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
    this.logger.info('AurasRealtimeManager initialized');
    return true;
  }

  /**
   * Set user for real-time operations
   */
  setUser(userEmail, userId = null, communityId = 'comm-001') {
    if (!userEmail) {
      this.logger.error('User email is required');
      return false;
    }
    
    this.user = {
      email: userEmail,
      id: userId || userEmail,
      communityId: communityId
    };
    
    this.logger.info(`User set: ${userEmail}`);
    return true;
  }

  /**
   * Join a page for real-time auras updates
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
      this.logger.info(`Joining page for auras: ${pageUrl}`);
      
      // Normalize page URL (same as message system)
      const normalizedUrl = this._normalizeUrl(pageUrl);
      this.currentPageId = normalizedUrl;
      
      // Subscribe to Postgres Changes for auras
      await this._setupAurasSubscription(normalizedUrl);
      
      this.isConnected = true;
      this.isConnecting = false;
      
      this.logger.info('Page joined for auras successfully');
      return true;
      
    } catch (error) {
      this.logger.error('Failed to join page for auras:', error);
      this.isConnecting = false;
      return false;
    }
  }

  /**
   * Setup Postgres Changes subscription for auras
   */
  async _setupAurasSubscription(pageId) {
    try {
      const channelName = `auras-${pageId}`;
      
      const channel = this.supabase
        .channel(channelName)
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'user_auras',
          filter: `page_id=eq.${pageId}`
        }, (payload) => {
          this._handleAuraChange(payload);
        })
        .subscribe();

      this.channels.set(channelName, channel);
      this.logger.info(`Auras subscription started for page: ${pageId}`);
      
    } catch (error) {
      this.logger.error('Failed to setup auras subscription:', error);
      throw error;
    }
  }

  /**
   * Handle aura changes from Postgres
   */
  _handleAuraChange(payload) {
    const eventId = `aura-${payload.new?.id || payload.old?.id}-${Date.now()}`;
    
    // Prevent duplicate processing
    if (this._processedEvents.has(eventId)) {
      return;
    }
    this._processedEvents.add(eventId);

    this.logger.debug('Aura change received:', payload);
    this.logger.info(`Real-time ${payload.eventType} event for aura:`, payload.new?.id || payload.old?.id);

    // Emit event for UI handling
    this._emitAuraEvent(payload);
  }

  /**
   * Emit aura event
   */
  _emitAuraEvent(payload) {
    // Use the same pattern as the working message system
    if (typeof window.realtimeFoundation !== 'undefined') {
      window.realtimeFoundation.emit('aura-realtime-update', {
        type: payload.eventType,
        data: payload.new || payload.old,
        pageId: this.currentPageId,
        timestamp: Date.now()
      });
    }
  }

  /**
   * Update user aura
   */
  async updateAura(auraColor, auraIntensity = 1.0) {
    if (!this.isConnected) {
      this.logger.error('Not connected to any page');
      return false;
    }

    if (!this.user) {
      this.logger.error('User not set');
      return false;
    }

    try {
      this.logger.info(`Updating aura: ${auraColor} with intensity: ${auraIntensity}`);
      
      const auraData = {
        user_email: this.user.email,
        page_id: this.currentPageId,
        aura_color: auraColor,
        aura_intensity: auraIntensity,
        community_id: this.user.communityId,
        updated_at: new Date().toISOString()
      };

      // Upsert aura record
      const { data, error } = await this.supabase
        .from('user_auras')
        .upsert([auraData])
        .select()
        .single();

      if (error) {
        this.logger.error('Failed to update aura:', error);
        return false;
      }

      this.logger.info('Aura updated successfully:', data);
      return data;
      
    } catch (error) {
      this.logger.error('Error updating aura:', error);
      return false;
    }
  }

  /**
   * Get auras for current page
   */
  async getAuras() {
    if (!this.isConnected) {
      this.logger.error('Not connected to any page');
      return false;
    }

    try {
      this.logger.info(`Getting auras for page: ${this.currentPageId}`);
      
      const { data, error } = await this.supabase
        .from('user_auras')
        .select('*')
        .eq('page_id', this.currentPageId);

      if (error) {
        this.logger.error('Failed to get auras:', error);
        return false;
      }

      this.logger.info('Auras retrieved successfully:', data);
      return data;
      
    } catch (error) {
      this.logger.error('Error getting auras:', error);
      return false;
    }
  }

  /**
   * Get user's current aura
   */
  async getUserAura() {
    if (!this.isConnected) {
      this.logger.error('Not connected to any page');
      return false;
    }

    if (!this.user) {
      this.logger.error('User not set');
      return false;
    }

    try {
      this.logger.info(`Getting user aura for: ${this.user.email}`);
      
      const { data, error } = await this.supabase
        .from('user_auras')
        .select('*')
        .eq('user_email', this.user.email)
        .eq('page_id', this.currentPageId)
        .single();

      if (error) {
        this.logger.error('Failed to get user aura:', error);
        return false;
      }

      this.logger.info('User aura retrieved successfully:', data);
      return data;
      
    } catch (error) {
      this.logger.error('Error getting user aura:', error);
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
      info: (message, data) => console.log(`[AurasRealtimeManager] [INFO] ${message}`, data || ''),
      warn: (message, data) => console.warn(`[AurasRealtimeManager] [WARN] ${message}`, data || ''),
      error: (message, data) => console.error(`[AurasRealtimeManager] [ERROR] ${message}`, data || ''),
      debug: (message, data) => console.log(`[AurasRealtimeManager] [DEBUG] ${message}`, data || '')
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
  window.AurasRealtimeManager = AurasRealtimeManager;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = AurasRealtimeManager;
}
