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
  constructor(realtimeFoundation) {
    this.realtimeFoundation = realtimeFoundation;
    this.isInitialized = false;
    this.currentUser = null;
    this.currentPage = null;
    this.logger = this._createLogger();
    
    // If realtimeFoundation isn't available yet, we'll initialize later
    if (!this.realtimeFoundation) {
      this.logger.warn('AurasIntegration created without realtimeFoundation - will initialize later');
    }
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
      
      // Step 1: Check if foundation is available (optional - aura can work via Supabase directly)
      if (!this.realtimeFoundation) {
        // Try to get the realtime foundation from global scope if not provided in constructor
        if (window.realtimeFoundation) {
          this.logger.info('Using global realtimeFoundation');
          this.realtimeFoundation = window.realtimeFoundation;
        } else {
          this.logger.warn('RealtimeFoundation not available - aura will work via Supabase directly');
          // COMP METHOD: Don't fail - RealtimeFoundation is optional, Supabase is the requirement
        }
      }

      // Step 2: Get current user
      this.currentUser = window.currentUser;
      if (!this.currentUser) {
        this.logger.warn('No authenticated user found - initialization should be deferred until after authentication');
        return false;
      }
      
      this.logger.info(`User authenticated: ${this.currentUser.email}`);
      
      // Step 3: Verify Supabase is available (required)
      if (!window.supabase) {
        this.logger.error('Supabase not available - required for aura integration');
        return false;
      }
      
      this.logger.info('Auras integration initialized with Supabase');
      
      // COMP METHOD: Mark as initialized if we have Supabase (required) and user (required)
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
   * COMP METHOD: Tracks page for aura context
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
      this.currentPage = pageUrl;
      this.logger.info('Page tracked for auras');
      return true;
      
    } catch (error) {
      this.logger.error('Failed to join page for auras:', error);
      return false;
    }
  }

  /**
   * Set user aura color
   * COMP METHOD: Emits event via realtimeFoundation if available
   */
  async setAura(userId, auraColor) {
    if (!this.isInitialized) {
      this.logger.warn('Auras integration not initialized, attempting late initialization...');
      const initSuccess = await this.initialize();
      if (!initSuccess) {
        this.logger.error('Late initialization failed');
        return false;
      }
    }
    
    try {
      this.logger.info(`Setting aura for user ${userId} to ${auraColor}`);
      
      // COMP METHOD: Call handleAuraChange directly for immediate local propagation
      // This ensures visibility data and DOM update even if events fail
      if (typeof window.handleAuraChange === 'function') {
        try {
          await window.handleAuraChange({
            userId: userId,
            auraColor: auraColor,
            source: 'aurasIntegration'
          });
          this.logger.info('handleAuraChange called for immediate propagation');
        } catch (handleError) {
          this.logger.warn('handleAuraChange failed (non-blocking):', handleError);
        }
      }
      
      // COMP METHOD: Emit event via realtimeFoundation if available (for other listeners)
      const realtimeFoundation = this.realtimeFoundation || window.realtimeFoundation;
      if (realtimeFoundation && typeof realtimeFoundation.emit === 'function') {
        const eventData = {
          type: 'UPDATE',
          data: { user_id: userId, aura_color: auraColor, updated_at: new Date().toISOString() },
          pageId: this.currentPage || window.currentUrlData?.pageId || 'unknown',
          timestamp: Date.now()
        };
        
        try {
          realtimeFoundation.emit('aura-realtime-update', eventData);
          this.logger.info('Aura change event emitted via realtimeFoundation');
        } catch (emitError) {
          // COMP METHOD: Don't fail completely if event emission fails
          // handleAuraChange already called above for local propagation
          this.logger.warn('Event emission failed (non-blocking):', emitError);
          this.logger.info('handleAuraChange already called for local propagation');
        }
      } else {
        this.logger.warn('No realtime foundation available for event emission');
        this.logger.info('handleAuraChange already called for local propagation');
      }
      
      this.logger.info('Aura set successfully');
      return true;
      
    } catch (error) {
      // COMP METHOD: Log error but don't throw - allow Supabase propagation to continue
      this.logger.error('Failed to set aura (non-blocking):', error);
      // Return false but don't throw - Supabase can still handle propagation
      return false;
    }
  }

  /**
   * Update user aura
   * COMP METHOD: Delegates to setAura
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
      
      const userId = this.currentUser?.id || this.currentUser?.user_id;
      if (!userId) {
        this.logger.warn('No user ID available for aura update');
        return false;
      }
      
      return await this.setAura(userId, auraColor);
      
    } catch (error) {
      this.logger.error('Failed to update aura:', error);
      return false;
    }
  }

  /**
   * Get auras for current page
   * COMP METHOD: Returns empty array (auras retrieved via Supabase directly if needed)
   */
  async getAuras() {
    if (!this.isInitialized) {
      this.logger.warn('Auras integration not initialized, attempting late initialization...');
      const initSuccess = await this.initialize();
      if (!initSuccess) {
        this.logger.warn('Late initialization failed - returning empty auras list');
        return [];
      }
    }
    
    this.logger.info('Getting auras for current page - use Supabase directly for aura data');
    return [];
  }

  /**
   * Get user's current aura
   * COMP METHOD: Gets from currentUser
   */
  async getUserAura() {
    if (!this.isInitialized) {
      this.logger.warn('Auras integration not initialized, attempting late initialization...');
      const initSuccess = await this.initialize();
      if (!initSuccess) {
        this.logger.error('Late initialization failed');
        return null;
      }
    }
    
    try {
      this.logger.info('Getting user aura');
      
      if (this.currentUser) {
        const auraColor = this.currentUser.aura_color || this.currentUser.auraColor;
        if (auraColor) {
          this.logger.info('User aura retrieved from currentUser');
          return { color: auraColor, intensity: 1.0 };
        }
      }
      
      this.logger.warn('No user aura found');
      return null;
      
    } catch (error) {
      this.logger.error('Failed to get user aura:', error);
      return null;
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
      realtimeFoundation: !!this.realtimeFoundation
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
  // Initialize with realtimeFoundation if available
  window.aurasIntegration = new AurasIntegration(
    window.realtimeFoundation || null
  );
}

// Export for use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = AurasIntegration;
}

