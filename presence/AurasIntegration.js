/**
 * AURAS INTEGRATION - Following Working Message Pattern
 * Integrates auras real-time with the working message system
 * 
 * PATTERN:
 * - Same structure as RobustIntegration.js
 * - Same initialization approach
 * - Same error handling
 * - Incremental, not revolutionary
 */

class AurasIntegration {
  constructor() {
    this.isInitialized = false;
    this.aurasManager = null;
    this.currentUser = null;
    this.currentPage = null;
    this.logger = this._createLogger();
  }

  /**
   * Initialize auras integration
   */
  async initialize() {
    if (this.isInitialized) {
      this.logger.info('Auras integration already initialized');
      return true;
    }

    try {
      this.logger.info('Initializing auras integration...');
      
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
      
      // Step 3: Initialize auras manager
      if (typeof window.AurasRealtimeManager === 'undefined') {
        this.logger.error('AurasRealtimeManager not available');
        return false;
      }

      this.aurasManager = new window.AurasRealtimeManager();
      
      // Initialize with Supabase
      if (window.supabase) {
        await this.aurasManager.initialize(window.supabase);
        this.logger.info('Auras manager initialized with Supabase');
      } else {
        this.logger.error('Supabase not available');
        return false;
      }
      
      // Step 4: Set user in auras manager
      await this.aurasManager.setUser(
        this.currentUser.email,
        this.currentUser.email,
        'comm-001'
      );
      
      this.isInitialized = true;
      this.logger.info('Auras integration initialized successfully');
      return true;
      
    } catch (error) {
      this.logger.error('Failed to initialize auras integration:', error);
      return false;
    }
  }

  /**
   * Join page for auras tracking
   */
  async joinPage(pageUrl) {
    if (!this.isInitialized) {
      this.logger.warn('Auras integration not initialized, attempting late initialization...');
      const initSuccess = await this.initialize();
      if (!initSuccess) {
        this.logger.error('Late initialization failed');
        return false;
      }
    }
    
    try {
      this.logger.info(`Joining page for auras: ${pageUrl}`);
      
      const success = await this.aurasManager.joinPage(pageUrl);
      if (success) {
        this.currentPage = pageUrl;
        this.logger.info('Page joined for auras tracking');
      }
      
      return success;
      
    } catch (error) {
      this.logger.error('Failed to join page for auras:', error);
      return false;
    }
  }

  /**
   * Update user aura
   */
  async updateAura(auraColor, auraIntensity = 1.0) {
    if (!this.isInitialized) {
      this.logger.warn('Auras integration not initialized, attempting late initialization...');
      const initSuccess = await this.initialize();
      if (!initSuccess) {
        this.logger.error('Late initialization failed');
        return false;
      }
    }
    
    try {
      this.logger.info(`Updating aura: ${auraColor} with intensity: ${auraIntensity}`);
      
      const success = await this.aurasManager.updateAura(auraColor, auraIntensity);
      if (success) {
        this.logger.info('Aura updated successfully');
      } else {
        this.logger.warn('Failed to update aura');
      }
      
      return success;
      
    } catch (error) {
      this.logger.error('Failed to update aura:', error);
      return false;
    }
  }

  /**
   * Get auras for current page
   */
  async getAuras() {
    if (!this.isInitialized) {
      this.logger.warn('Auras integration not initialized, attempting late initialization...');
      const initSuccess = await this.initialize();
      if (!initSuccess) {
        this.logger.error('Late initialization failed');
        return false;
      }
    }
    
    try {
      this.logger.info('Getting auras for current page');
      
      const auras = await this.aurasManager.getAuras();
      if (auras) {
        this.logger.info('Auras retrieved successfully');
      } else {
        this.logger.warn('Failed to get auras');
      }
      
      return auras;
      
    } catch (error) {
      this.logger.error('Failed to get auras:', error);
      return false;
    }
  }

  /**
   * Get user's current aura
   */
  async getUserAura() {
    if (!this.isInitialized) {
      this.logger.warn('Auras integration not initialized, attempting late initialization...');
      const initSuccess = await this.initialize();
      if (!initSuccess) {
        this.logger.error('Late initialization failed');
        return false;
      }
    }
    
    try {
      this.logger.info('Getting user aura');
      
      const aura = await this.aurasManager.getUserAura();
      if (aura) {
        this.logger.info('User aura retrieved successfully');
      } else {
        this.logger.warn('Failed to get user aura');
      }
      
      return aura;
      
    } catch (error) {
      this.logger.error('Failed to get user aura:', error);
      return false;
    }
  }

  /**
   * Get auras status
   */
  getStatus() {
    return {
      isInitialized: this.isInitialized,
      currentUser: this.currentUser ? this.currentUser.email : null,
      currentPage: this.currentPage,
      aurasManager: this.aurasManager ? this.aurasManager.getStatus() : null
    };
  }

  /**
   * Create logger
   */
  _createLogger() {
    return {
      info: (message, data) => console.log(`[AurasIntegration] [INFO] ${message}`, data || ''),
      warn: (message, data) => console.warn(`[AurasIntegration] [WARN] ${message}`, data || ''),
      error: (message, data) => console.error(`[AurasIntegration] [ERROR] ${message}`, data || ''),
      debug: (message, data) => console.log(`[AurasIntegration] [DEBUG] ${message}`, data || '')
    };
  }
}

// Create global instance
if (typeof window !== 'undefined') {
  window.aurasIntegration = new AurasIntegration();
}

// Export for use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = AurasIntegration;
}
