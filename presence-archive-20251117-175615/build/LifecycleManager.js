/**
 * LifecycleManager - Component Lifecycle Management for Metalayer Extension
 * 
 * Manages the lifecycle of components to prevent memory leaks and ensure
 * proper cleanup. Provides initialization, mounting, updating, and cleanup phases.
 * 
 * @version 1.0.0
 * @author Metalayer Development Team
 */

class LifecycleManager {
  constructor() {
    this.components = new Map();
    this.lifecycleHooks = new Map();
    this.isInitialized = false;
    this.cleanupQueue = [];
    
    // Bind methods
    this.register = this.register.bind(this);
    this.initialize = this.initialize.bind(this);
    this.mount = this.mount.bind(this);
    this.update = this.update.bind(this);
    this.unmount = this.unmount.bind(this);
    this.cleanup = this.cleanup.bind(this);
    
    console.log('🔄 LifecycleManager: Initialized');
  }
  
  /**
   * Register a component with lifecycle management
   * @param {string} name - Component name
   * @param {Object} component - Component object
   * @param {Object} options - Lifecycle options
   */
  register(name, component, options = {}) {
    if (this.components.has(name)) {
      console.warn(`⚠️ LifecycleManager: Component '${name}' already registered`);
      return;
    }
    
    const lifecycleComponent = {
      name,
      component,
      options: {
        autoInitialize: options.autoInitialize !== false,
        autoMount: options.autoMount !== false,
        autoCleanup: options.autoCleanup !== false,
        priority: options.priority || 0,
        dependencies: options.dependencies || [],
        ...options
      },
      state: {
        isInitialized: false,
        isMounted: false,
        isDestroyed: false,
        initTime: null,
        mountTime: null,
        destroyTime: null
      },
      hooks: {
        onInit: options.onInit || null,
        onMount: options.onMount || null,
        onUpdate: options.onUpdate || null,
        onUnmount: options.onUnmount || null,
        onDestroy: options.onDestroy || null
      }
    };
    
    this.components.set(name, lifecycleComponent);
    console.log(`🔄 LifecycleManager: Registered component '${name}'`);
    
    // Auto-initialize if enabled
    if (lifecycleComponent.options.autoInitialize) {
      this.initialize(name);
    }
  }
  
  /**
   * Initialize a component
   * @param {string} name - Component name
   * @returns {boolean} Success status
   */
  initialize(name) {
    const component = this.components.get(name);
    if (!component) {
      console.error(`❌ LifecycleManager: Component '${name}' not found`);
      return false;
    }
    
    if (component.state.isInitialized) {
      console.warn(`⚠️ LifecycleManager: Component '${name}' already initialized`);
      return true;
    }
    
    try {
      // Check dependencies
      if (!this.checkDependencies(component)) {
        console.error(`❌ LifecycleManager: Dependencies not met for '${name}'`);
        return false;
      }
      
      // Call component's init method if it exists
      if (typeof component.component.init === 'function') {
        component.component.init();
      }
      
      // Call lifecycle hook
      if (component.hooks.onInit) {
        component.hooks.onInit(component.component);
      }
      
      // Update state
      component.state.isInitialized = true;
      component.state.initTime = Date.now();
      
      console.log(`✅ LifecycleManager: Initialized '${name}'`);
      
      // Auto-mount if enabled
      if (component.options.autoMount) {
        this.mount(name);
      }
      
      return true;
    } catch (error) {
      console.error(`❌ LifecycleManager: Failed to initialize '${name}':`, error);
      return false;
    }
  }
  
  /**
   * Mount a component
   * @param {string} name - Component name
   * @returns {boolean} Success status
   */
  mount(name) {
    const component = this.components.get(name);
    if (!component) {
      console.error(`❌ LifecycleManager: Component '${name}' not found`);
      return false;
    }
    
    if (!component.state.isInitialized) {
      console.error(`❌ LifecycleManager: Component '${name}' not initialized`);
      return false;
    }
    
    if (component.state.isMounted) {
      console.warn(`⚠️ LifecycleManager: Component '${name}' already mounted`);
      return true;
    }
    
    try {
      // Call component's mount method if it exists
      if (typeof component.component.mount === 'function') {
        component.component.mount();
      }
      
      // Call lifecycle hook
      if (component.hooks.onMount) {
        component.hooks.onMount(component.component);
      }
      
      // Update state
      component.state.isMounted = true;
      component.state.mountTime = Date.now();
      
      console.log(`✅ LifecycleManager: Mounted '${name}'`);
      return true;
    } catch (error) {
      console.error(`❌ LifecycleManager: Failed to mount '${name}':`, error);
      return false;
    }
  }
  
  /**
   * Update a component
   * @param {string} name - Component name
   * @param {Object} data - Update data
   * @returns {boolean} Success status
   */
  update(name, data = {}) {
    const component = this.components.get(name);
    if (!component) {
      console.error(`❌ LifecycleManager: Component '${name}' not found`);
      return false;
    }
    
    if (!component.state.isMounted) {
      console.error(`❌ LifecycleManager: Component '${name}' not mounted`);
      return false;
    }
    
    try {
      // Call component's update method if it exists
      if (typeof component.component.update === 'function') {
        component.component.update(data);
      }
      
      // Call lifecycle hook
      if (component.hooks.onUpdate) {
        component.hooks.onUpdate(component.component, data);
      }
      
      console.log(`✅ LifecycleManager: Updated '${name}'`);
      return true;
    } catch (error) {
      console.error(`❌ LifecycleManager: Failed to update '${name}':`, error);
      return false;
    }
  }
  
  /**
   * Unmount a component
   * @param {string} name - Component name
   * @returns {boolean} Success status
   */
  unmount(name) {
    const component = this.components.get(name);
    if (!component) {
      console.error(`❌ LifecycleManager: Component '${name}' not found`);
      return false;
    }
    
    if (!component.state.isMounted) {
      console.warn(`⚠️ LifecycleManager: Component '${name}' not mounted`);
      return true;
    }
    
    try {
      // Call component's unmount method if it exists
      if (typeof component.component.unmount === 'function') {
        component.component.unmount();
      }
      
      // Call lifecycle hook
      if (component.hooks.onUnmount) {
        component.hooks.onUnmount(component.component);
      }
      
      // Update state
      component.state.isMounted = false;
      
      console.log(`✅ LifecycleManager: Unmounted '${name}'`);
      return true;
    } catch (error) {
      console.error(`❌ LifecycleManager: Failed to unmount '${name}':`, error);
      return false;
    }
  }
  
  /**
   * Destroy a component
   * @param {string} name - Component name
   * @returns {boolean} Success status
   */
  destroy(name) {
    const component = this.components.get(name);
    if (!component) {
      console.error(`❌ LifecycleManager: Component '${name}' not found`);
      return false;
    }
    
    if (component.state.isDestroyed) {
      console.warn(`⚠️ LifecycleManager: Component '${name}' already destroyed`);
      return true;
    }
    
    try {
      // Unmount first if mounted
      if (component.state.isMounted) {
        this.unmount(name);
      }
      
      // Call component's destroy method if it exists
      if (typeof component.component.destroy === 'function') {
        component.component.destroy();
      }
      
      // Call lifecycle hook
      if (component.hooks.onDestroy) {
        component.hooks.onDestroy(component.component);
      }
      
      // Update state
      component.state.isDestroyed = true;
      component.state.destroyTime = Date.now();
      
      // Remove from registry
      this.components.delete(name);
      
      console.log(`✅ LifecycleManager: Destroyed '${name}'`);
      return true;
    } catch (error) {
      console.error(`❌ LifecycleManager: Failed to destroy '${name}':`, error);
      return false;
    }
  }
  
  /**
   * Check if component dependencies are met
   * @param {Object} component - Component object
   * @returns {boolean} Whether dependencies are met
   */
  checkDependencies(component) {
    for (const dep of component.options.dependencies) {
      const depComponent = this.components.get(dep);
      if (!depComponent || !depComponent.state.isInitialized) {
        return false;
      }
    }
    return true;
  }
  
  /**
   * Get component status
   * @param {string} name - Component name
   * @returns {Object|null} Component status
   */
  getStatus(name) {
    const component = this.components.get(name);
    if (!component) return null;
    
    return {
      name: component.name,
      state: { ...component.state },
      options: { ...component.options },
      uptime: component.state.initTime ? Date.now() - component.state.initTime : 0
    };
  }
  
  /**
   * Get all component statuses
   * @returns {Array} All component statuses
   */
  getAllStatuses() {
    return Array.from(this.components.keys()).map(name => this.getStatus(name));
  }
  
  /**
   * Initialize all components
   * @returns {Array} Initialization results
   */
  initializeAll() {
    const results = [];
    const sortedComponents = this.getSortedComponents();
    
    for (const component of sortedComponents) {
      if (component.options.autoInitialize) {
        const result = this.initialize(component.name);
        results.push({ name: component.name, success: result });
      }
    }
    
    return results;
  }
  
  /**
   * Mount all components
   * @returns {Array} Mount results
   */
  mountAll() {
    const results = [];
    const sortedComponents = this.getSortedComponents();
    
    for (const component of sortedComponents) {
      if (component.options.autoMount && component.state.isInitialized) {
        const result = this.mount(component.name);
        results.push({ name: component.name, success: result });
      }
    }
    
    return results;
  }
  
  /**
   * Get components sorted by priority
   * @returns {Array} Sorted components
   */
  getSortedComponents() {
    return Array.from(this.components.values())
      .sort((a, b) => b.options.priority - a.options.priority);
  }
  
  /**
   * Cleanup all components
   */
  cleanup() {
    console.log('🧹 LifecycleManager: Cleaning up all components...');
    
    const sortedComponents = this.getSortedComponents();
    
    for (const component of sortedComponents) {
      if (component.options.autoCleanup) {
        this.destroy(component.name);
      }
    }
    
    this.components.clear();
    this.lifecycleHooks.clear();
    this.cleanupQueue = [];
    
    console.log('✅ LifecycleManager: Cleanup complete');
  }
  
  /**
   * Get lifecycle statistics
   * @returns {Object} Statistics
   */
  getStats() {
    const components = Array.from(this.components.values());
    
    return {
      totalComponents: components.length,
      initialized: components.filter(c => c.state.isInitialized).length,
      mounted: components.filter(c => c.state.isMounted).length,
      destroyed: components.filter(c => c.state.isDestroyed).length,
      averageUptime: components
        .filter(c => c.state.initTime)
        .reduce((sum, c) => sum + (Date.now() - c.state.initTime), 0) / components.length
    };
  }
}

// Export for module system
if (typeof module !== 'undefined' && module.exports) {
  module.exports = LifecycleManager;
} else if (typeof window !== 'undefined') {
  // Make available globally for Chrome extension
  window.LifecycleManager = LifecycleManager;
} else {
  // Make available globally for Node.js
  global.LifecycleManager = LifecycleManager;
}
