/**
 * VISIBILITY INTEGRATION - Following Working Message Pattern
 * Integrates visibility real-time with the working message system
 * 
 * PATTERN:
 * - Same structure as RobustIntegration.js
 * - Same initialization approach
 * - Same error handling
 * - Incremental, not revolutionary
 */

class VisibilityIntegration {
  constructor() {
    this.isInitialized = false;
    this.visibilityManager = null;
    this.currentUser = null;
    this.currentPage = null;
    this.logger = this._createLogger();
  }

  /**
   * Initialize visibility integration
   */
  async initialize() {
    if (this.isInitialized) {
      this.logger.info('Visibility integration already initialized');
      return true;
    }

    try {
      this.logger.info('Initializing visibility integration...');
      
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
      
      // Step 3: Initialize visibility manager
      if (typeof window.VisibilityRealtimeManager === 'undefined') {
        this.logger.error('VisibilityRealtimeManager not available');
        return false;
      }

      this.visibilityManager = new window.VisibilityRealtimeManager();
      
      // Initialize with Supabase
      if (window.supabase) {
        await this.visibilityManager.initialize(window.supabase);
        this.logger.info('Visibility manager initialized with Supabase');
      } else {
        this.logger.error('Supabase not available');
        return false;
      }
      
      // Step 4: Set user in visibility manager
      await this.visibilityManager.setUser(
        this.currentUser.email,
        this.currentUser.email,
        'comm-001'
      );
      
      this.isInitialized = true;
      this.logger.info('Visibility integration initialized successfully');
      return true;
      
    } catch (error) {
      this.logger.error('Failed to initialize visibility integration:', error);
      return false;
    }
  }

  /**
   * Join page for visibility tracking
   */
  async joinPage(pageUrl) {
    if (!this.isInitialized) {
      this.logger.warn('Visibility integration not initialized, attempting late initialization...');
      const initSuccess = await this.initialize();
      if (!initSuccess) {
        this.logger.error('Late initialization failed');
        return false;
      }
    }
    
    try {
      this.logger.info(`Joining page for visibility: ${pageUrl}`);
      
      const success = await this.visibilityManager.joinPage(pageUrl);
      if (success) {
        this.currentPage = pageUrl;
        this.logger.info('Page joined for visibility tracking');
      }
      
      return success;
      
    } catch (error) {
      this.logger.error('Failed to join page for visibility:', error);
      return false;
    }
  }

  /**
   * Update user visibility
   */
  async updateVisibility(isVisible) {
    if (!this.isInitialized) {
      this.logger.warn('Visibility integration not initialized, attempting late initialization...');
      const initSuccess = await this.initialize();
      if (!initSuccess) {
        this.logger.error('Late initialization failed');
        return false;
      }
    }
    
    try {
      this.logger.info(`Updating visibility: ${isVisible}`);
      
      const success = await this.visibilityManager.updateVisibility(isVisible);
      if (success) {
        this.logger.info('Visibility updated successfully');
      } else {
        this.logger.warn('Failed to update visibility');
      }
      
      return success;
      
    } catch (error) {
      this.logger.error('Failed to update visibility:', error);
      return false;
    }
  }

  /**
   * Get visibility status
   */
  getStatus() {
    return {
      isInitialized: this.isInitialized,
      currentUser: this.currentUser ? this.currentUser.email : null,
      currentPage: this.currentPage,
      visibilityManager: this.visibilityManager ? this.visibilityManager.getStatus() : null
    };
  }

  /**
   * Create logger
   */
  _createLogger() {
    return {
      info: (message, data) => console.log(`[VisibilityIntegration] [INFO] ${message}`, data || ''),
      warn: (message, data) => console.warn(`[VisibilityIntegration] [WARN] ${message}`, data || ''),
      error: (message, data) => console.error(`[VisibilityIntegration] [ERROR] ${message}`, data || ''),
      debug: (message, data) => console.log(`[VisibilityIntegration] [DEBUG] ${message}`, data || '')
    };
  }
}

// Create global instance
if (typeof window !== 'undefined') {
  window.visibilityIntegration = new VisibilityIntegration();
}

// Export for use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = VisibilityIntegration;
}
