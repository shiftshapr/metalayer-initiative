/**
 * Core Module - Centralized Core Components for Metalayer Extension
 * 
 * Provides the foundational architecture components:
 * - StateManager: Centralized state management
 * - EventBus: Event system
 * - LifecycleManager: Component lifecycle management
 * 
 * @version 1.0.0
 * @author Metalayer Development Team
 */

// Import core components (CommonJS for Node.js compatibility)
const StateManager = require('./StateManager.js');
const EventBus = require('./EventBus.js');
const LifecycleManager = require('./LifecycleManager.js');

/**
 * Core module factory
 * Creates and initializes all core components
 */
class CoreModule {
  constructor() {
    this.stateManager = null;
    this.eventBus = null;
    this.lifecycleManager = null;
    this.isInitialized = false;
  }
  
  /**
   * Initialize the core module
   * @returns {Promise<boolean>} Success status
   */
  async initialize() {
    if (this.isInitialized) {
      console.warn('⚠️ CoreModule: Already initialized');
      return true;
    }
    
    try {
      console.log('🏗️ CoreModule: Initializing...');
      
      // Initialize StateManager
      this.stateManager = new StateManager();
      console.log('✅ CoreModule: StateManager initialized');
      
      // Initialize EventBus
      this.eventBus = new EventBus();
      console.log('✅ CoreModule: EventBus initialized');
      
      // Initialize LifecycleManager
      this.lifecycleManager = new LifecycleManager();
      console.log('✅ CoreModule: LifecycleManager initialized');
      
      // Set up cross-component communication
      this.setupCrossComponentCommunication();
      
      this.isInitialized = true;
      console.log('✅ CoreModule: Initialization complete');
      
      return true;
    } catch (error) {
      console.error('❌ CoreModule: Initialization failed:', error);
      return false;
    }
  }
  
  /**
   * Set up communication between core components
   */
  setupCrossComponentCommunication() {
    // State changes should emit events
    this.stateManager.subscribe('*', (newValue, oldValue, path) => {
      this.eventBus.emit('state:changed', { path, newValue, oldValue });
    });
    
    // Component lifecycle events
    this.eventBus.on('component:registered', (component) => {
      console.log(`🎯 CoreModule: Component registered: ${component.name}`);
    });
    
    this.eventBus.on('component:destroyed', (component) => {
      console.log(`🎯 CoreModule: Component destroyed: ${component.name}`);
    });
  }
  
  /**
   * Get StateManager instance
   * @returns {StateManager} StateManager instance
   */
  getStateManager() {
    if (!this.isInitialized) {
      throw new Error('CoreModule not initialized');
    }
    return this.stateManager;
  }
  
  /**
   * Get EventBus instance
   * @returns {EventBus} EventBus instance
   */
  getEventBus() {
    if (!this.isInitialized) {
      throw new Error('CoreModule not initialized');
    }
    return this.eventBus;
  }
  
  /**
   * Get LifecycleManager instance
   * @returns {LifecycleManager} LifecycleManager instance
   */
  getLifecycleManager() {
    if (!this.isInitialized) {
      throw new Error('CoreModule not initialized');
    }
    return this.lifecycleManager;
  }
  
  /**
   * Register a component with lifecycle management
   * @param {string} name - Component name
   * @param {Object} component - Component object
   * @param {Object} options - Lifecycle options
   */
  registerComponent(name, component, options = {}) {
    if (!this.isInitialized) {
      throw new Error('CoreModule not initialized');
    }
    
    this.lifecycleManager.register(name, component, options);
    this.eventBus.emit('component:registered', { name, component, options });
  }
  
  /**
   * Get core module statistics
   * @returns {Object} Statistics
   */
  getStats() {
    if (!this.isInitialized) {
      return { initialized: false };
    }
    
    return {
      initialized: this.isInitialized,
      stateManager: this.stateManager.getSnapshot(),
      eventBus: this.eventBus.getStats(),
      lifecycleManager: this.lifecycleManager.getStats()
    };
  }
  
  /**
   * Cleanup all core components
   */
  cleanup() {
    if (!this.isInitialized) return;
    
    console.log('🧹 CoreModule: Cleaning up...');
    
    // Cleanup in reverse order
    if (this.lifecycleManager) {
      this.lifecycleManager.cleanup();
    }
    
    if (this.eventBus) {
      this.eventBus.cleanup();
    }
    
    if (this.stateManager) {
      this.stateManager.cleanup();
    }
    
    this.isInitialized = false;
    console.log('✅ CoreModule: Cleanup complete');
  }
}

// Create singleton instance
const coreModule = new CoreModule();

// Export for module system
if (typeof module !== 'undefined' && module.exports) {
  module.exports = coreModule;
} else {
  // Make available globally for Chrome extension
  window.CoreModule = coreModule;
}
