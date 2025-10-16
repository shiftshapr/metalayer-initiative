/**
 * Sidepanel Core - Main Application Controller
 * Orchestrates all services and features
 * 
 * Responsibilities:
 * - Service initialization
 * - Dependency injection
 * - Application lifecycle
 * - Event coordination
 */

class SidepanelCore {
  constructor() {
    this.services = {};
    this.features = {};
    this.isInitialized = false;
    this.logger = null;
  }

  /**
   * Initialize the application
   */
  async initialize(config = {}) {
    try {
      console.log('🚀 SIDEPANEL CORE: Starting initialization...');
      
      // Step 1: Initialize Logger
      await this.initializeLogger(config.logger);
      
      // Step 2: Initialize Services
      await this.initializeServices(config.services);
      
      // Step 3: Initialize Features
      await this.initializeFeatures(config.features);
      
      // Step 4: Set up event coordination
      this.setupEventCoordination();
      
      this.isInitialized = true;
      this.logger.info('CORE', 'Application initialized successfully');
      
      return { success: true };
    } catch (error) {
      console.error('❌ SIDEPANEL CORE: Initialization failed:', error);
      throw error;
    }
  }

  /**
   * Initialize Logger service
   */
  async initializeLogger(config = {}) {
    try {
      // Load Logger if not already available
      if (!window.Logger) {
        // Logger should be loaded via script tag
        await this.loadScript('/utils/Logger.js');
      }
      
      this.logger = window.Logger;
      this.logger.configure(config);
      
      this.logger.info('CORE', 'Logger initialized');
    } catch (error) {
      console.error('Failed to initialize Logger:', error);
      // Fallback to console
      this.logger = console;
    }
  }

  /**
   * Initialize all services
   */
  async initializeServices(config = {}) {
    try {
      this.logger.startFlow('SERVICES_INIT');
      
      // Initialize SupabaseService
      if (!window.SupabaseService) {
        await this.loadScript('/services/SupabaseService.js');
      }
      
      this.services.supabase = new window.SupabaseService(config.supabase);
      await this.services.supabase.initialize();
      
      this.logger.endFlow('SERVICES_INIT', true);
    } catch (error) {
      this.logger.endFlow('SERVICES_INIT', false, { error: error.message });
      throw error;
    }
  }

  /**
   * Initialize all features
   */
  async initializeFeatures(config = {}) {
    try {
      this.logger.startFlow('FEATURES_INIT');
      
      // Initialize VisibilityManager
      if (!window.VisibilityManager) {
        await this.loadScript('/features/VisibilityManager.js');
      }
      
      this.features.visibility = new window.VisibilityManager(
        this.services.supabase,
        this.logger
      );
      
      // Get current user for visibility manager
      const currentUser = await this.services.supabase.getCurrentUser();
      if (currentUser) {
        await this.features.visibility.initialize(currentUser.email);
      }
      
      this.logger.endFlow('FEATURES_INIT', true);
    } catch (error) {
      this.logger.endFlow('FEATURES_INIT', false, { error: error.message });
      throw error;
    }
  }

  /**
   * Set up event coordination between services and features
   */
  setupEventCoordination() {
    try {
      this.logger.startFlow('EVENT_COORDINATION');
      
      // Set up global event handlers
      this.setupGlobalEventHandlers();
      
      // Set up service coordination
      this.setupServiceCoordination();
      
      this.logger.endFlow('EVENT_COORDINATION', true);
    } catch (error) {
      this.logger.endFlow('EVENT_COORDINATION', false, { error: error.message });
    }
  }

  /**
   * Set up global event handlers
   */
  setupGlobalEventHandlers() {
    // Tab change events
    if (typeof chrome !== 'undefined' && chrome.tabs) {
      chrome.tabs.onActivated.addListener((activeInfo) => {
        this.handleTabChange(activeInfo);
      });
    }
    
    // Window focus events
    window.addEventListener('focus', () => {
      this.handleWindowFocus();
    });
    
    window.addEventListener('blur', () => {
      this.handleWindowBlur();
    });
  }

  /**
   * Set up service coordination
   */
  setupServiceCoordination() {
    // Coordinate between Supabase and Visibility
    this.services.supabase.on('presence', (eventType, newRecord, oldRecord) => {
      if (this.features.visibility) {
        this.features.visibility.handlePresenceEvent(eventType, newRecord, oldRecord);
      }
    });
  }

  /**
   * Handle tab changes
   */
  async handleTabChange(activeInfo) {
    try {
      this.logger.debug('CORE', 'Tab changed', { tabId: activeInfo.tabId });
      
      // Get current page info
      const currentPage = await this.getCurrentPageInfo();
      if (currentPage) {
        // Update visibility manager with new page
        this.features.visibility.setCurrentPage(currentPage.pageId);
        
        // Subscribe to new page
        await this.services.supabase.subscribeToPage(currentPage.pageId, currentPage.url);
        
        // Refresh visibility
        await this.features.visibility.refreshVisibilityAvatars(currentPage.pageId);
      }
    } catch (error) {
      this.logger.error('CORE', 'Failed to handle tab change', { error: error.message });
    }
  }

  /**
   * Handle window focus
   */
  handleWindowFocus() {
    this.logger.debug('CORE', 'Window focused');
    // Resume real-time updates if needed
  }

  /**
   * Handle window blur
   */
  handleWindowBlur() {
    this.logger.debug('CORE', 'Window blurred');
    // Pause non-essential updates if needed
  }

  /**
   * Get current page information
   */
  async getCurrentPageInfo() {
    try {
      // This would integrate with the existing URL normalization system
      if (typeof normalizeCurrentUrl === 'function') {
        return await normalizeCurrentUrl();
      }
      
      // Fallback to basic page detection
      return {
        pageId: window.location.hostname.replace(/\./g, '_'),
        url: window.location.href
      };
    } catch (error) {
      this.logger.error('CORE', 'Failed to get current page info', { error: error.message });
      return null;
    }
  }

  /**
   * Load external script
   */
  async loadScript(src) {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = src;
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  /**
   * Get service instance
   */
  getService(serviceName) {
    return this.services[serviceName];
  }

  /**
   * Get feature instance
   */
  getFeature(featureName) {
    return this.features[featureName];
  }

  /**
   * Get application status
   */
  getStatus() {
    return {
      isInitialized: this.isInitialized,
      services: Object.keys(this.services),
      features: Object.keys(this.features),
      supabaseStatus: this.services.supabase?.getStatus(),
      visibilityStatus: this.features.visibility?.getStatus()
    };
  }

  /**
   * Cleanup resources
   */
  async cleanup() {
    try {
      this.logger.info('CORE', 'Starting cleanup...');
      
      // Cleanup features
      for (const [name, feature] of Object.entries(this.features)) {
        if (feature && typeof feature.cleanup === 'function') {
          await feature.cleanup();
        }
      }
      
      // Cleanup services
      for (const [name, service] of Object.entries(this.services)) {
        if (service && typeof service.cleanup === 'function') {
          await service.cleanup();
        }
      }
      
      this.isInitialized = false;
      this.logger.info('CORE', 'Cleanup completed');
    } catch (error) {
      this.logger.error('CORE', 'Cleanup failed', { error: error.message });
    }
  }
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = SidepanelCore;
}

// Make available globally
if (typeof window !== 'undefined') {
  window.SidepanelCore = SidepanelCore;
}

console.log('✅ SidepanelCore initialized');

