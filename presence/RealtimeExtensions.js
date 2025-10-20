/**
 * Real-time Extensions - Extend working message pattern to visibility, reactions, and auras
 * Based on the successful CleanRealtimeManager pattern for messages
 */

class RealtimeExtensions {
  constructor() {
    this.logLevel = 'ERROR';
    this.isInitialized = false;
    this.supabase = null;
    this.user = null;
    this.currentPageId = null;
    
    // Track processed events to prevent duplicates
    this._processedVisibility = new Set();
    this._processedReactions = new Set();
    this._processedAuras = new Set();
  }

  log(level, message, data = null) {
    const levels = { DEBUG: 0, INFO: 1, WARN: 2, ERROR: 3, SILENT: 4 };
    if (levels[level] >= levels[this.logLevel]) {
      console.log(`[RealtimeExtensions] [${level}] ${message}`, data || '');
    }
  }

  setLogLevel(level) {
    this.logLevel = level;
  }

  async initialize(supabaseClient, user, pageId) {
    try {
      this.supabase = supabaseClient;
      this.user = user;
      this.currentPageId = pageId;
      this.isInitialized = true;
      
      this.log('INFO', 'RealtimeExtensions initialized');
      return true;
    } catch (error) {
      this.log('ERROR', 'Initialization failed:', error);
      return false;
    }
  }

  /**
   * VISIBILITY REAL-TIME PATTERN
   * Follows same pattern as messages: Postgres Changes + Custom Events
   */
  async setupVisibilityRealtime() {
    if (!this.isInitialized) {
      this.log('ERROR', 'Not initialized');
      return false;
    }

    try {
      // Subscribe to user_presence table changes
      const presenceChannel = this.supabase
        .channel('user-presence-changes')
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'user_presence',
          filter: `page_id=eq.${this.currentPageId}`
        }, (payload) => {
          this.handleVisibilityChange(payload);
        })
        .subscribe();

      this.log('INFO', 'Visibility real-time subscription started');
      return true;
    } catch (error) {
      this.log('ERROR', 'Failed to setup visibility real-time:', error);
      return false;
    }
  }

  handleVisibilityChange(payload) {
    const eventId = `visibility-${payload.new?.id || payload.old?.id}-${Date.now()}`;
    
    // Prevent duplicate processing
    if (this._processedVisibility.has(eventId)) {
      return;
    }
    this._processedVisibility.add(eventId);

    this.log('DEBUG', 'Visibility change received:', payload);

    // Dispatch custom event for UI binding
    const event = new CustomEvent('realtime-visibility-update', {
      detail: {
        type: payload.eventType,
        data: payload.new || payload.old,
        pageId: this.currentPageId
      }
    });
    window.dispatchEvent(event);
  }

  /**
   * REACTIONS REAL-TIME PATTERN
   * Follows same pattern as messages: Postgres Changes + Custom Events
   */
  async setupReactionsRealtime() {
    if (!this.isInitialized) {
      this.log('ERROR', 'Not initialized');
      return false;
    }

    try {
      // Subscribe to reactions table changes
      const reactionsChannel = this.supabase
        .channel('reactions-changes')
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'reactions',
          filter: `page_id=eq.${this.currentPageId}`
        }, (payload) => {
          this.handleReactionChange(payload);
        })
        .subscribe();

      this.log('INFO', 'Reactions real-time subscription started');
      return true;
    } catch (error) {
      this.log('ERROR', 'Failed to setup reactions real-time:', error);
      return false;
    }
  }

  handleReactionChange(payload) {
    const eventId = `reaction-${payload.new?.id || payload.old?.id}-${Date.now()}`;
    
    // Prevent duplicate processing
    if (this._processedReactions.has(eventId)) {
      return;
    }
    this._processedReactions.add(eventId);

    this.log('DEBUG', 'Reaction change received:', payload);

    // Dispatch custom event for UI binding
    const event = new CustomEvent('realtime-reaction-update', {
      detail: {
        type: payload.eventType,
        data: payload.new || payload.old,
        messageId: payload.new?.message_id || payload.old?.message_id,
        pageId: this.currentPageId
      }
    });
    window.dispatchEvent(event);
  }

  /**
   * AURAS REAL-TIME PATTERN
   * Follows same pattern as messages: Postgres Changes + Custom Events
   */
  async setupAurasRealtime() {
    if (!this.isInitialized) {
      this.log('ERROR', 'Not initialized');
      return false;
    }

    try {
      // Subscribe to user_aura table changes
      const aurasChannel = this.supabase
        .channel('user-aura-changes')
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'user_aura',
          filter: `user_email=neq.${this.user.email}`
        }, (payload) => {
          this.handleAuraChange(payload);
        })
        .subscribe();

      this.log('INFO', 'Auras real-time subscription started');
      return true;
    } catch (error) {
      this.log('ERROR', 'Failed to setup auras real-time:', error);
      return false;
    }
  }

  handleAuraChange(payload) {
    const eventId = `aura-${payload.new?.user_email || payload.old?.user_email}-${Date.now()}`;
    
    // Prevent duplicate processing
    if (this._processedAuras.has(eventId)) {
      return;
    }
    this._processedAuras.add(eventId);

    this.log('DEBUG', 'Aura change received:', payload);

    // Dispatch custom event for UI binding
    const event = new CustomEvent('realtime-aura-update', {
      detail: {
        type: payload.eventType,
        data: payload.new || payload.old,
        userEmail: payload.new?.user_email || payload.old?.user_email,
        pageId: this.currentPageId
      }
    });
    window.dispatchEvent(event);
  }

  /**
   * SETUP ALL REAL-TIME EXTENSIONS
   * Initialize all real-time subscriptions following the working message pattern
   */
  async setupAllRealtime() {
    if (!this.isInitialized) {
      this.log('ERROR', 'Not initialized');
      return false;
    }

    try {
      // Setup all real-time subscriptions
      await this.setupVisibilityRealtime();
      await this.setupReactionsRealtime();
      await this.setupAurasRealtime();

      this.log('INFO', 'All real-time extensions setup complete');
      return true;
    } catch (error) {
      this.log('ERROR', 'Failed to setup all real-time extensions:', error);
      return false;
    }
  }

  /**
   * CLEANUP
   * Remove all subscriptions
   */
  async cleanup() {
    try {
      if (this.supabase) {
        await this.supabase.removeAllChannels();
      }
      this.log('INFO', 'RealtimeExtensions cleanup complete');
      return true;
    } catch (error) {
      this.log('ERROR', 'Cleanup failed:', error);
      return false;
    }
  }
}

// Export for use in other modules
if (typeof window !== 'undefined') {
  window.RealtimeExtensions = RealtimeExtensions;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = RealtimeExtensions;
}
