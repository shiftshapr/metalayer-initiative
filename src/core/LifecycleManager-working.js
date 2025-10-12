/**
 * LifecycleManager - Working Version
 */

class LifecycleManager {
  constructor() {
    this.components = new Map();
    this.lifecycleHooks = new Map();
    this.isInitialized = false;
    this.cleanupQueue = [];
    
    console.log('🔄 LifecycleManager: Initialized');
  }
  
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
    
    if (lifecycleComponent.options.autoInitialize) {
      this.initialize(name);
    }
  }
  
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
      if (!this.checkDependencies(component)) {
        console.error(`❌ LifecycleManager: Dependencies not met for '${name}'`);
        return false;
      }
      
      if (typeof component.component.init === 'function') {
        component.component.init();
      }
      
      if (component.hooks.onInit) {
        component.hooks.onInit(component.component);
      }
      
      component.state.isInitialized = true;
      component.state.initTime = Date.now();
      
      console.log(`✅ LifecycleManager: Initialized '${name}'`);
      
      if (component.options.autoMount) {
        this.mount(name);
      }
      
      return true;
    } catch (error) {
      console.error(`❌ LifecycleManager: Failed to initialize '${name}':`, error);
      return false;
    }
  }
  
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
      if (typeof component.component.mount === 'function') {
        component.component.mount();
      }
      
      if (component.hooks.onMount) {
        component.hooks.onMount(component.component);
      }
      
      component.state.isMounted = true;
      component.state.mountTime = Date.now();
      
      console.log(`✅ LifecycleManager: Mounted '${name}'`);
      return true;
    } catch (error) {
      console.error(`❌ LifecycleManager: Failed to mount '${name}':`, error);
      return false;
    }
  }
  
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
      if (typeof component.component.update === 'function') {
        component.component.update(data);
      }
      
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
      if (typeof component.component.unmount === 'function') {
        component.component.unmount();
      }
      
      if (component.hooks.onUnmount) {
        component.hooks.onUnmount(component.component);
      }
      
      component.state.isMounted = false;
      
      console.log(`✅ LifecycleManager: Unmounted '${name}'`);
      return true;
    } catch (error) {
      console.error(`❌ LifecycleManager: Failed to unmount '${name}':`, error);
      return false;
    }
  }
  
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
      if (component.state.isMounted) {
        this.unmount(name);
      }
      
      if (typeof component.component.destroy === 'function') {
        component.component.destroy();
      }
      
      if (component.hooks.onDestroy) {
        component.hooks.onDestroy(component.component);
      }
      
      component.state.isDestroyed = true;
      component.state.destroyTime = Date.now();
      
      this.components.delete(name);
      
      console.log(`✅ LifecycleManager: Destroyed '${name}'`);
      return true;
    } catch (error) {
      console.error(`❌ LifecycleManager: Failed to destroy '${name}':`, error);
      return false;
    }
  }
  
  checkDependencies(component) {
    for (const dep of component.options.dependencies) {
      const depComponent = this.components.get(dep);
      if (!depComponent || !depComponent.state.isInitialized) {
        return false;
      }
    }
    return true;
  }
  
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
  
  getAllStatuses() {
    return Array.from(this.components.keys()).map(name => this.getStatus(name));
  }
  
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
  
  getSortedComponents() {
    return Array.from(this.components.values())
      .sort((a, b) => b.options.priority - a.options.priority);
  }
  
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
  window.LifecycleManager = LifecycleManager;
} else {
  global.LifecycleManager = LifecycleManager;
}













