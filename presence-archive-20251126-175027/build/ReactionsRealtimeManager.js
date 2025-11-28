/**
 * REACTIONS REALTIME MANAGER - Following Working Message Pattern
 * Extends the working message system pattern for reactions features
 * 
 * PATTERN:
 * - Same structure as CleanRealtimeManager
 * - Same real-time subscription approach
 * - Same UI binding pattern
 * - Incremental, not revolutionary
 */

class ReactionsRealtimeManager {
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
    this.logger.info('ReactionsRealtimeManager initialized');
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
   * Join a page for real-time reactions updates
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
      this.logger.info(`Joining page for reactions: ${pageUrl}`);
      
      // Normalize page URL (same as message system)
      const normalizedUrl = this._normalizeUrl(pageUrl);
      this.currentPageId = normalizedUrl;
      
      // Subscribe to Postgres Changes for reactions
      await this._setupReactionsSubscription(normalizedUrl);
      
      this.isConnected = true;
      this.isConnecting = false;
      
      this.logger.info('Page joined for reactions successfully');
      return true;
      
    } catch (error) {
      this.logger.error('Failed to join page for reactions:', error);
      this.isConnecting = false;
      return false;
    }
  }

  /**
   * Setup Postgres Changes subscription for reactions
   */
  async _setupReactionsSubscription(pageId) {
    try {
      const channelName = `reactions-${pageId}`;
      
      const channel = this.supabase
        .channel(channelName)
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'reactions'
        }, (payload) => {
          this._handleReactionChange(payload);
        })
        .subscribe();

      this.channels.set(channelName, channel);
      this.logger.info(`Reactions subscription started for page: ${pageId}`);
      
    } catch (error) {
      this.logger.error('Failed to setup reactions subscription:', error);
      throw error;
    }
  }

  /**
   * Get message IDs for a page (simplified approach)
   */
  _getMessageIdsForPage(pageId) {
    // For now, use a wildcard approach - subscribe to all reactions
    // In production, this should query the messages table for the page
    return '*';
  }

  /**
   * Handle reaction changes from Postgres
   */
  _handleReactionChange(payload) {
    const eventId = `reaction-${payload.new?.id || payload.old?.id}-${Date.now()}`;
    
    // Prevent duplicate processing
    if (this._processedEvents.has(eventId)) {
      return;
    }
    this._processedEvents.add(eventId);

    this.logger.info('Reaction change received:', payload);
    this.logger.info(`Real-time ${payload.eventType} event for reaction:`, payload.new?.id || payload.old?.id);

    // COMP METHOD: Delegate to the existing global handler
    if (typeof window.handleReactionChange === 'function') {
      this.logger.info('Delegating to window.handleReactionChange');
      window.handleReactionChange(payload);
    } else {
      this.logger.warn('window.handleReactionChange not available, emitting event');
      this._emitReactionEvent(payload);
    }
  }

  /**
   * Emit reaction event
   */
  _emitReactionEvent(payload) {
    // Use the same pattern as the working message system
    if (typeof window.realtimeFoundation !== 'undefined') {
      window.realtimeFoundation.emit('reaction-realtime-update', {
        type: payload.eventType,
        data: payload.new || payload.old,
        pageId: this.currentPageId,
        timestamp: Date.now()
      });
    }
  }

  /**
   * Add a reaction to a message
   */
  async addReaction(messageId, reactionType) {
    if (!this.isConnected) {
      this.logger.error('Not connected to any page');
      return false;
    }

    if (!this.user) {
      this.logger.error('User not set');
      return false;
    }

    try {
      this.logger.info(`Adding reaction: ${reactionType} to message: ${messageId}`);
      
      // COMP METHOD: Use API instead of direct Supabase calls
      // Backend uses authenticated user from headers - don't send user_id in body
      if (typeof window.api !== 'undefined' && window.api.request) {
        const result = await window.api.request('/v1/reactions', {
          method: 'POST',
          body: JSON.stringify({
            messageId: messageId,
            emoji: reactionType
          })
        });
        
        if (result.success || result.action) {
          this.logger.info('Reaction added successfully via API:', result);
          return true;
        } else {
          this.logger.error('API failed to add reaction:', result);
          return false;
        }
      } else {
        this.logger.error('API module not available');
        return false;
      }
      
    } catch (error) {
      this.logger.error('Error adding reaction:', error);
      return false;
    }
  }

  /**
   * Remove a reaction from a message
   */
  async removeReaction(messageId, reactionType) {
    if (!this.isConnected) {
      this.logger.error('Not connected to any page');
      return false;
    }

    if (!this.user) {
      this.logger.error('User not set');
      return false;
    }

    try {
      this.logger.info(`Removing reaction: ${reactionType} from message: ${messageId}`);
      
      // COMP METHOD: Use API instead of direct Supabase calls
      // Backend uses authenticated user from headers - don't send user_id in body
      if (typeof window.api !== 'undefined' && window.api.request) {
        const result = await window.api.request('/v1/reactions', {
          method: 'POST',
          body: JSON.stringify({
            messageId: messageId,
            emoji: reactionType
          })
        });
        
        if (result.success || result.action) {
          this.logger.info('Reaction removed successfully via API:', result);
          return true;
        } else {
          this.logger.error('API failed to remove reaction:', result);
          return false;
        }
      } else {
        this.logger.error('API module not available');
        return false;
      }
      
    } catch (error) {
      this.logger.error('Error removing reaction:', error);
      return false;
    }
  }

  /**
   * Get reactions for a message
   */
  async getReactions(messageId) {
    if (!this.isConnected) {
      this.logger.error('Not connected to any page');
      return false;
    }

    try {
      this.logger.info(`Getting reactions for message: ${messageId}`);
      
      const { data, error } = await this.supabase
        .from('message_reactions')
        .select('*')
        .eq('message_id', messageId);

      if (error) {
        this.logger.error('Failed to get reactions:', error);
        return false;
      }

      this.logger.info('Reactions retrieved successfully:', data);
      return data;
      
    } catch (error) {
      this.logger.error('Error getting reactions:', error);
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
      info: (message, data) => console.log(`[ReactionsRealtimeManager] [INFO] ${message}`, data || ''),
      warn: (message, data) => console.warn(`[ReactionsRealtimeManager] [WARN] ${message}`, data || ''),
      error: (message, data) => console.error(`[ReactionsRealtimeManager] [ERROR] ${message}`, data || ''),
      debug: (message, data) => console.log(`[ReactionsRealtimeManager] [DEBUG] ${message}`, data || '')
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
  window.ReactionsRealtimeManager = ReactionsRealtimeManager;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = ReactionsRealtimeManager;
}
