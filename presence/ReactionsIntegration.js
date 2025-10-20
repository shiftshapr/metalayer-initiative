/**
 * REACTIONS INTEGRATION - Following Working Message Pattern
 * Integrates reactions real-time with the working message system
 * 
 * PATTERN:
 * - Same structure as RobustIntegration.js
 * - Same initialization approach
 * - Same error handling
 * - Incremental, not revolutionary
 */

class ReactionsIntegration {
  constructor() {
    this.isInitialized = false;
    this.reactionsManager = null;
    this.currentUser = null;
    this.currentPage = null;
    this.logger = this._createLogger();
  }

  /**
   * Initialize reactions integration
   */
  async initialize() {
    if (this.isInitialized) {
      this.logger.info('Reactions integration already initialized');
      return true;
    }

    try {
      this.logger.info('Initializing reactions integration...');
      
      // Step 1: Check if foundation is available
      if (typeof window.realtimeFoundation === 'undefined') {
        this.logger.error('RealtimeFoundation not available');
        return false;
      }

      // Step 2: Get current user
      this.currentUser = window.currentUser;
      if (!this.currentUser) {
        this.logger.warn('No authenticated user found - initialization should be deferred until after authentication');
        return false;
      }
      
      this.logger.info(`User authenticated: ${this.currentUser.email}`);
      
      // Step 3: Initialize reactions manager
      if (typeof window.ReactionsRealtimeManager === 'undefined') {
        this.logger.error('ReactionsRealtimeManager not available');
        return false;
      }

      this.reactionsManager = new window.ReactionsRealtimeManager();
      
      // Initialize with Supabase
      if (window.supabase) {
        await this.reactionsManager.initialize(window.supabase);
        this.logger.info('Reactions manager initialized with Supabase');
      } else {
        this.logger.error('Supabase not available');
        return false;
      }
      
      // Step 4: Set user in reactions manager
      await this.reactionsManager.setUser(
        this.currentUser.email,
        this.currentUser.email,
        'comm-001'
      );
      
      this.isInitialized = true;
      this.logger.info('Reactions integration initialized successfully');
      return true;
      
    } catch (error) {
      this.logger.error('Failed to initialize reactions integration:', error);
      return false;
    }
  }

  /**
   * Join page for reactions tracking
   */
  async joinPage(pageUrl) {
    if (!this.isInitialized) {
      this.logger.warn('Reactions integration not initialized, attempting late initialization...');
      const initSuccess = await this.initialize();
      if (!initSuccess) {
        this.logger.error('Late initialization failed');
        return false;
      }
    }
    
    try {
      this.logger.info(`Joining page for reactions: ${pageUrl}`);
      
      const success = await this.reactionsManager.joinPage(pageUrl);
      if (success) {
        this.currentPage = pageUrl;
        this.logger.info('Page joined for reactions tracking');
      }
      
      return success;
      
    } catch (error) {
      this.logger.error('Failed to join page for reactions:', error);
      return false;
    }
  }

  /**
   * Add a reaction to a message
   */
  async addReaction(messageId, reactionType) {
    if (!this.isInitialized) {
      this.logger.warn('Reactions integration not initialized, attempting late initialization...');
      const initSuccess = await this.initialize();
      if (!initSuccess) {
        this.logger.error('Late initialization failed');
        return false;
      }
    }
    
    try {
      this.logger.info(`Adding reaction: ${reactionType} to message: ${messageId}`);
      
      const success = await this.reactionsManager.addReaction(messageId, reactionType);
      if (success) {
        this.logger.info('Reaction added successfully');
      } else {
        this.logger.warn('Failed to add reaction');
      }
      
      return success;
      
    } catch (error) {
      this.logger.error('Failed to add reaction:', error);
      return false;
    }
  }

  /**
   * Remove a reaction from a message
   */
  async removeReaction(messageId, reactionType) {
    if (!this.isInitialized) {
      this.logger.warn('Reactions integration not initialized, attempting late initialization...');
      const initSuccess = await this.initialize();
      if (!initSuccess) {
        this.logger.error('Late initialization failed');
        return false;
      }
    }
    
    try {
      this.logger.info(`Removing reaction: ${reactionType} from message: ${messageId}`);
      
      const success = await this.reactionsManager.removeReaction(messageId, reactionType);
      if (success) {
        this.logger.info('Reaction removed successfully');
      } else {
        this.logger.warn('Failed to remove reaction');
      }
      
      return success;
      
    } catch (error) {
      this.logger.error('Failed to remove reaction:', error);
      return false;
    }
  }

  /**
   * Get reactions for a message
   */
  async getReactions(messageId) {
    if (!this.isInitialized) {
      this.logger.warn('Reactions integration not initialized, attempting late initialization...');
      const initSuccess = await this.initialize();
      if (!initSuccess) {
        this.logger.error('Late initialization failed');
        return false;
      }
    }
    
    try {
      this.logger.info(`Getting reactions for message: ${messageId}`);
      
      const reactions = await this.reactionsManager.getReactions(messageId);
      if (reactions) {
        this.logger.info('Reactions retrieved successfully');
      } else {
        this.logger.warn('Failed to get reactions');
      }
      
      return reactions;
      
    } catch (error) {
      this.logger.error('Failed to get reactions:', error);
      return false;
    }
  }

  /**
   * Get reactions status
   */
  getStatus() {
    return {
      isInitialized: this.isInitialized,
      currentUser: this.currentUser ? this.currentUser.email : null,
      currentPage: this.currentPage,
      reactionsManager: this.reactionsManager ? this.reactionsManager.getStatus() : null
    };
  }

  /**
   * Create logger
   */
  _createLogger() {
    return {
      info: (message, data) => console.log(`[ReactionsIntegration] [INFO] ${message}`, data || ''),
      warn: (message, data) => console.warn(`[ReactionsIntegration] [WARN] ${message}`, data || ''),
      error: (message, data) => console.error(`[ReactionsIntegration] [ERROR] ${message}`, data || ''),
      debug: (message, data) => console.log(`[ReactionsIntegration] [DEBUG] ${message}`, data || '')
    };
  }
}

// Create global instance
if (typeof window !== 'undefined') {
  window.reactionsIntegration = new ReactionsIntegration();
}

// Export for use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ReactionsIntegration;
}
