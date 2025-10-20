/**
 * UNIFIED INITIALIZATION MANAGER
 * 
 * SINGLE ROBUST SOLUTION: Coordinates all system initialization
 * Prevents conflicts between competing systems
 * 
 * Architecture-First Approach:
 * - Single entry point for all initialization
 * - Proper sequencing of system startup
 * - Comprehensive error handling
 * - Production-ready logging
 */

class UnifiedInitializationManager {
  constructor() {
    this.isInitialized = false;
    this.initializationSteps = [];
    this.currentStep = 0;
    this.errors = [];
    
    // System dependencies
    this.supabase = null;
    this.authManager = null;
    this.realtimeManager = null;
    this.integration = null;
    this.messageOperations = null;
    
    // Configuration
    this.config = {
      maxRetries: 3,
      retryDelay: 1000,
      timeout: 30000
    };
    
    console.log('🚀 UnifiedInitializationManager: Initialized');
  }

  /**
   * Initialize all systems in proper sequence
   */
  async initialize() {
    if (this.isInitialized) {
      console.log('✅ UnifiedInitializationManager: Already initialized');
      return true;
    }

    try {
      console.log('🚀 UnifiedInitializationManager: Starting unified initialization...');
      
      // Step 1: Wait for Supabase
      await this._waitForSupabase();
      
      // Step 2: Initialize Auth Manager
      await this._initializeAuthManager();
      
      // Step 3: Initialize Realtime Manager
      await this._initializeRealtimeManager();
      
      // Step 4: Initialize Integration (will be completed when user authenticates)
      await this._initializeIntegration();
      
      // Step 5: Initialize Message Operations
      await this._initializeMessageOperations();
      
      // Step 6: Finalize
      await this._finalize();
      
      this.isInitialized = true;
      console.log('✅ UnifiedInitializationManager: All systems initialized successfully');
      return true;
      
    } catch (error) {
      console.error('❌ UnifiedInitializationManager: Initialization failed', error);
      this.errors.push(error);
      return false;
    }
  }

  /**
   * Wait for Supabase to be available
   */
  async _waitForSupabase() {
    console.log('🔍 UnifiedInitializationManager: Waiting for Supabase...');
    
    let attempts = 0;
    const maxAttempts = 30; // 30 seconds max wait
    
    while (attempts < maxAttempts) {
      if (window.supabase && typeof window.supabase.from === 'function') {
        this.supabase = window.supabase;
        console.log('✅ UnifiedInitializationManager: Supabase available');
        return true;
      }
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      attempts++;
    }
    
    throw new Error('Supabase not available after 30 seconds');
  }

  /**
   * Initialize Auth Manager
   */
  async _initializeAuthManager() {
    console.log('🔐 UnifiedInitializationManager: Initializing Auth Manager...');
    
    // Auth is handled by CleanRealtimeManager - no separate auth manager needed
    console.log('✅ UnifiedInitializationManager: Auth handled by CleanRealtimeManager');
  }

  /**
   * Wait for user authentication to complete
   */
  async _waitForAuthentication() {
    console.log('⏳ UnifiedInitializationManager: Waiting for user authentication...');
    
    // Wait for window.currentUser to be available (up to 10 seconds)
    const maxWait = 10000; // 10 seconds
    const checkInterval = 100; // Check every 100ms
    let waited = 0;
    
    while (!window.currentUser && waited < maxWait) {
      await new Promise(resolve => setTimeout(resolve, checkInterval));
      waited += checkInterval;
    }
    
    if (window.currentUser) {
      console.log(`✅ UnifiedInitializationManager: User authenticated: ${window.currentUser.email}`);
    } else {
      console.warn('⚠️ UnifiedInitializationManager: Authentication timeout - proceeding without user');
    }
  }

  /**
   * Initialize Realtime Manager
   */
  async _initializeRealtimeManager() {
    console.log('🔔 UnifiedInitializationManager: Initializing Realtime Manager...');
    
    // Use CleanRealtimeManager for real-time functionality
    if (typeof window.CleanRealtimeManager !== 'undefined') {
      this.realtimeManager = new window.CleanRealtimeManager();
      await this.realtimeManager.initialize(window.supabase);
      console.log('✅ UnifiedInitializationManager: Clean Realtime Manager initialized');
    } else {
      console.warn('⚠️ UnifiedInitializationManager: CleanRealtimeManager not available');
    }
  }

  /**
   * Initialize Integration
   */
  async _initializeIntegration() {
    console.log('🔗 UnifiedInitializationManager: Initializing Integration...');
    
    if (window.robustIntegration) {
      this.integration = window.robustIntegration;
      const success = await this.integration.initialize();
      if (success) {
        console.log('✅ UnifiedInitializationManager: Integration initialized');
      } else {
        console.log('⏳ UnifiedInitializationManager: Integration will be initialized when user authenticates');
      }
    } else {
      console.warn('⚠️ UnifiedInitializationManager: RobustIntegration not available');
    }
  }

  /**
   * Initialize Message Operations Manager
   */
  async _initializeMessageOperations() {
    console.log('💬 UnifiedInitializationManager: Initializing Message Operations...');
    
    if (window.robustMessageOperations) {
      this.messageOperations = window.robustMessageOperations;
      await this.messageOperations.initialize(this.supabase, this.realtimeManager);
      console.log('✅ UnifiedInitializationManager: Message Operations initialized');
    } else {
      console.warn('⚠️ UnifiedInitializationManager: RobustMessageOperations not available');
    }
  }

  /**
   * Finalize initialization
   */
  async _finalize() {
    console.log('🎯 UnifiedInitializationManager: Finalizing initialization...');
    
    // Set global references
    window.unifiedInitManager = this;
    
    // Disable competing systems
    if (window.simpleRealtimeManager) {
      console.log('🔧 UnifiedInitializationManager: Using CleanRealtimeManager architecture');
      window.simpleRealtimeManager.isInitialized = true; // Prevent auto-init
    }
    
    console.log('✅ UnifiedInitializationManager: Initialization complete');
  }

  /**
   * Get system status
   */
  getStatus() {
    return {
      isInitialized: this.isInitialized,
      currentStep: this.currentStep,
      errors: this.errors,
      systems: {
        supabase: !!this.supabase,
        authManager: !!this.authManager,
        realtimeManager: !!this.realtimeManager,
        integration: !!this.integration
      }
    };
  }

  /**
   * Reset for re-initialization
   */
  reset() {
    this.isInitialized = false;
    this.currentStep = 0;
    this.errors = [];
    console.log('🔄 UnifiedInitializationManager: Reset for re-initialization');
  }
}

// Create global instance
window.unifiedInitManager = new UnifiedInitializationManager();

console.log('✅ UnifiedInitializationManager: Loaded and ready');
console.log('📋 UnifiedInitializationManager: Use window.unifiedInitManager.initialize() to start all systems');
