/**
 * REALTIME FOUNDATION - Minimal, Working Architecture
 * Builds on the working message system with a simple, extensible foundation
 * 
 * PRINCIPLES:
 * - Keep what works (messages)
 * - Add minimal, proven patterns
 * - Incremental, not revolutionary
 * - Testable and maintainable
 */

class RealtimeFoundation {
  constructor() {
    this.modules = new Map();
    this.eventBus = new EventTarget();
    this.isInitialized = false;
    this.logger = this._createLogger();
  }

  /**
   * Initialize the foundation
   */
  async initialize() {
    if (this.isInitialized) {
      this.logger.info('Foundation already initialized');
      return true;
    }

    try {
      this.logger.info('Initializing RealtimeFoundation...');
      
      // Initialize core services
      await this._initializeCoreServices();
      
      // Initialize working message system
      await this._initializeMessageSystem();
      
      this.isInitialized = true;
      this.logger.info('RealtimeFoundation initialized successfully');
      return true;
      
    } catch (error) {
      this.logger.error('Failed to initialize RealtimeFoundation:', error);
      return false;
    }
  }

  /**
   * Initialize core services
   */
  async _initializeCoreServices() {
    // Initialize Supabase if not already done
    if (!window.supabase) {
      this.logger.warn('Supabase not available');
      return false;
    }

    // Initialize current user if available
    if (window.currentUser) {
      this.logger.info(`User authenticated: ${window.currentUser.email}`);
    }

    return true;
  }

  /**
   * Initialize the working message system
   */
  async _initializeMessageSystem() {
    // The working message system is already initialized
    // We just need to ensure it's available
    if (typeof window.robustIntegration !== 'undefined') {
      this.logger.info('Working message system available');
      return true;
    }

    this.logger.warn('Working message system not available');
    return false;
  }

  /**
   * Register a module
   */
  registerModule(name, module) {
    if (this.modules.has(name)) {
      this.logger.warn(`Module ${name} already registered`);
      return false;
    }

    this.modules.set(name, module);
    this.logger.info(`Module ${name} registered`);
    return true;
  }

  /**
   * Get a module
   */
  getModule(name) {
    return this.modules.get(name);
  }

  /**
   * Emit an event
   */
  emit(eventName, data) {
    const event = new CustomEvent(eventName, { detail: data });
    this.eventBus.dispatchEvent(event);
    this.logger.console.log(`Event emitted: ${eventName}`, data);
  }

  /**
   * Listen to an event
   */
  on(eventName, callback) {
    this.eventBus.addEventListener(eventName, callback);
    this.logger.console.log(`Event listener added: ${eventName}`);
  }

  /**
   * Remove event listener
   */
  off(eventName, callback) {
    this.eventBus.removeEventListener(eventName, callback);
    this.logger.console.log(`Event listener removed: ${eventName}`);
  }

  /**
   * Create a simple logger
   */
  _createLogger() {
    return {
      info: (message, data) => console.log(`[RealtimeFoundation] [INFO] ${message}`, data || ''),
      warn: (message, data) => console.warn(`[RealtimeFoundation] [WARN] ${message}`, data || ''),
      error: (message, data) => console.error(`[RealtimeFoundation] [ERROR] ${message}`, data || ''),
      debug: (message, data) => console.log(`[RealtimeFoundation] [DEBUG] ${message}`, data || '')
    };
  }

  /**
   * Get status
   */
  getStatus() {
    return {
      isInitialized: this.isInitialized,
      modules: Array.from(this.modules.keys()),
      hasSupabase: !!window.supabase,
      hasUser: !!window.currentUser,
      hasMessageSystem: !!window.robustIntegration
    };
  }
}

// Create global instance
if (typeof window !== 'undefined') {
  window.realtimeFoundation = new RealtimeFoundation();
}

// Export for use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = RealtimeFoundation;
}
