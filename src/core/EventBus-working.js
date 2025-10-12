/**
 * EventBus - Working Version
 */

class EventBus {
  constructor() {
    this.listeners = new Map();
    this.onceListeners = new Map();
    this.eventHistory = [];
    this.maxHistorySize = 100;
    this.isDestroyed = false;
    
    console.log('🎯 EventBus: Initialized');
  }
  
  on(event, callback, options = {}) {
    if (this.isDestroyed) {
      console.warn('⚠️ EventBus: Cannot add listener after destruction');
      return () => {};
    }
    
    if (typeof callback !== 'function') {
      console.error('❌ EventBus: Callback must be a function');
      return () => {};
    }
    
    const listener = {
      callback,
      priority: options.priority || 0,
      context: options.context || null,
      id: this.generateId(),
      timestamp: Date.now()
    };
    
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    
    this.listeners.get(event).push(listener);
    this.listeners.get(event).sort((a, b) => b.priority - a.priority);
    
    console.log(`🎯 EventBus: Added listener for '${event}' (${listener.id})`);
    
    return () => this.off(event, callback);
  }
  
  once(event, callback, options = {}) {
    if (this.isDestroyed) {
      console.warn('⚠️ EventBus: Cannot add listener after destruction');
      return () => {};
    }
    
    const onceCallback = (...args) => {
      callback(...args);
      this.off(event, onceCallback);
    };
    
    return this.on(event, onceCallback, options);
  }
  
  off(event, callback) {
    if (this.isDestroyed) return;
    
    const eventListeners = this.listeners.get(event);
    if (!eventListeners) return;
    
    const index = eventListeners.findIndex(listener => listener.callback === callback);
    if (index !== -1) {
      const removed = eventListeners.splice(index, 1)[0];
      console.log(`🎯 EventBus: Removed listener for '${event}' (${removed.id})`);
      
      if (eventListeners.length === 0) {
        this.listeners.delete(event);
      }
    }
  }
  
  emit(event, ...args) {
    if (this.isDestroyed) {
      console.warn('⚠️ EventBus: Cannot emit after destruction');
      return false;
    }
    
    const eventListeners = this.listeners.get(event);
    if (!eventListeners || eventListeners.length === 0) {
      console.log(`🎯 EventBus: No listeners for '${event}'`);
      return false;
    }
    
    this.addToHistory(event, args);
    
    let calledCount = 0;
    const errors = [];
    
    for (const listener of eventListeners) {
      try {
        if (listener.context) {
          listener.callback.call(listener.context, ...args);
        } else {
          listener.callback(...args);
        }
        calledCount++;
      } catch (error) {
        console.error(`❌ EventBus: Listener error for '${event}':`, error);
        errors.push({
          event,
          error,
          listener: listener.id,
          timestamp: Date.now()
        });
      }
    }
    
    console.log(`🎯 EventBus: Emitted '${event}' to ${calledCount} listeners`);
    
    if (errors.length > 0) {
      this.emit('eventbus:error', { event, errors });
    }
    
    return calledCount > 0;
  }
  
  addToHistory(event, args) {
    const entry = {
      timestamp: Date.now(),
      event,
      args: args.length > 0 ? args : undefined,
      listenerCount: this.listeners.get(event)?.length || 0
    };
    
    this.eventHistory.unshift(entry);
    
    if (this.eventHistory.length > this.maxHistorySize) {
      this.eventHistory = this.eventHistory.slice(0, this.maxHistorySize);
    }
  }
  
  getHistory(event = null) {
    if (event) {
      return this.eventHistory.filter(entry => entry.event === event);
    }
    return [...this.eventHistory];
  }
  
  getEvents() {
    return Array.from(this.listeners.keys());
  }
  
  getListenerCount(event) {
    return this.listeners.get(event)?.length || 0;
  }
  
  hasListeners(event) {
    return this.getListenerCount(event) > 0;
  }
  
  removeAllListeners(event) {
    if (this.isDestroyed) return;
    
    const count = this.getListenerCount(event);
    this.listeners.delete(event);
    console.log(`🎯 EventBus: Removed all ${count} listeners for '${event}'`);
  }
  
  removeAllListeners() {
    if (this.isDestroyed) return;
    
    const totalListeners = Array.from(this.listeners.values())
      .reduce((sum, listeners) => sum + listeners.length, 0);
    
    this.listeners.clear();
    console.log(`🎯 EventBus: Removed all ${totalListeners} listeners`);
  }
  
  generateId() {
    return `listener_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
  
  getStats() {
    const totalListeners = Array.from(this.listeners.values())
      .reduce((sum, listeners) => sum + listeners.length, 0);
    
    return {
      totalEvents: this.listeners.size,
      totalListeners,
      historySize: this.eventHistory.length,
      isDestroyed: this.isDestroyed,
      events: this.getEvents()
    };
  }
  
  createNamespace(namespace) {
    return {
      on: (event, callback, options) => this.on(`${namespace}:${event}`, callback, options),
      off: (event, callback) => this.off(`${namespace}:${event}`, callback),
      emit: (event, ...args) => this.emit(`${namespace}:${event}`, ...args),
      once: (event, callback, options) => this.once(`${namespace}:${event}`, callback, options)
    };
  }
  
  cleanup() {
    if (this.isDestroyed) return;
    
    console.log('🧹 EventBus: Cleaning up...');
    this.removeAllListeners();
    this.eventHistory = [];
    this.isDestroyed = true;
    console.log('✅ EventBus: Cleanup complete');
  }
  
  destroy() {
    this.cleanup();
  }
}

// Export for module system
if (typeof module !== 'undefined' && module.exports) {
  module.exports = EventBus;
} else if (typeof window !== 'undefined') {
  window.EventBus = EventBus;
} else {
  global.EventBus = EventBus;
}













