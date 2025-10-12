/**
 * EventBus - Centralized Event Management for Metalayer Extension
 * 
 * Provides a centralized event system to replace scattered event listeners
 * throughout the codebase. Includes proper cleanup and error handling.
 * 
 * @version 1.0.0
 * @author Metalayer Development Team
 */

class EventBus {
  constructor() {
    this.listeners = new Map();
    this.onceListeners = new Map();
    this.eventHistory = [];
    this.maxHistorySize = 100;
    this.isDestroyed = false;
    
    // Bind methods to preserve context
    this.on = this.on.bind(this);
    this.off = this.off.bind(this);
    this.emit = this.emit.bind(this);
    this.once = this.once.bind(this);
    this.cleanup = this.cleanup.bind(this);
    
    console.log('🎯 EventBus: Initialized');
  }
  
  /**
   * Register an event listener
   * @param {string} event - Event name
   * @param {function} callback - Callback function
   * @param {Object} options - Options (priority, context)
   * @returns {function} Unsubscribe function
   */
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
    
    // Sort by priority (higher priority first)
    this.listeners.get(event).sort((a, b) => b.priority - a.priority);
    
    console.log(`🎯 EventBus: Added listener for '${event}' (${listener.id})`);
    
    // Return unsubscribe function
    return () => this.off(event, callback);
  }
  
  /**
   * Register a one-time event listener
   * @param {string} event - Event name
   * @param {function} callback - Callback function
   * @param {Object} options - Options
   * @returns {function} Unsubscribe function
   */
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
  
  /**
   * Remove an event listener
   * @param {string} event - Event name
   * @param {function} callback - Callback function to remove
   */
  off(event, callback) {
    if (this.isDestroyed) return;
    
    const eventListeners = this.listeners.get(event);
    if (!eventListeners) return;
    
    const index = eventListeners.findIndex(listener => listener.callback === callback);
    if (index !== -1) {
      const removed = eventListeners.splice(index, 1)[0];
      console.log(`🎯 EventBus: Removed listener for '${event}' (${removed.id})`);
      
      // Clean up empty event arrays
      if (eventListeners.length === 0) {
        this.listeners.delete(event);
      }
    }
  }
  
  /**
   * Emit an event to all listeners
   * @param {string} event - Event name
   * @param {...any} args - Arguments to pass to listeners
   * @returns {boolean} Whether any listeners were called
   */
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
    
    // Add to history
    this.addToHistory(event, args);
    
    let calledCount = 0;
    const errors = [];
    
    // Call all listeners
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
    
    // Emit error event if there were errors
    if (errors.length > 0) {
      this.emit('eventbus:error', { event, errors });
    }
    
    return calledCount > 0;
  }
  
  /**
   * Add event to history
   * @param {string} event - Event name
   * @param {Array} args - Event arguments
   */
  addToHistory(event, args) {
    const entry = {
      timestamp: Date.now(),
      event,
      args: args.length > 0 ? args : undefined,
      listenerCount: this.listeners.get(event)?.length || 0
    };
    
    this.eventHistory.unshift(entry);
    
    // Limit history size
    if (this.eventHistory.length > this.maxHistorySize) {
      this.eventHistory = this.eventHistory.slice(0, this.maxHistorySize);
    }
  }
  
  /**
   * Get event history
   * @param {string} event - Optional event filter
   * @returns {Array} Event history
   */
  getHistory(event = null) {
    if (event) {
      return this.eventHistory.filter(entry => entry.event === event);
    }
    return [...this.eventHistory];
  }
  
  /**
   * Get all registered events
   * @returns {Array} Event names
   */
  getEvents() {
    return Array.from(this.listeners.keys());
  }
  
  /**
   * Get listener count for an event
   * @param {string} event - Event name
   * @returns {number} Listener count
   */
  getListenerCount(event) {
    return this.listeners.get(event)?.length || 0;
  }
  
  /**
   * Check if an event has listeners
   * @param {string} event - Event name
   * @returns {boolean} Whether event has listeners
   */
  hasListeners(event) {
    return this.getListenerCount(event) > 0;
  }
  
  /**
   * Remove all listeners for an event
   * @param {string} event - Event name
   */
  removeAllListeners(event) {
    if (this.isDestroyed) return;
    
    const count = this.getListenerCount(event);
    this.listeners.delete(event);
    console.log(`🎯 EventBus: Removed all ${count} listeners for '${event}'`);
  }
  
  /**
   * Remove all listeners
   */
  removeAllListeners() {
    if (this.isDestroyed) return;
    
    const totalListeners = Array.from(this.listeners.values())
      .reduce((sum, listeners) => sum + listeners.length, 0);
    
    this.listeners.clear();
    console.log(`🎯 EventBus: Removed all ${totalListeners} listeners`);
  }
  
  /**
   * Generate unique ID for listeners
   * @returns {string} Unique ID
   */
  generateId() {
    return `listener_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
  
  /**
   * Get event bus statistics
   * @returns {Object} Statistics
   */
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
  
  /**
   * Create a namespaced event bus
   * @param {string} namespace - Namespace prefix
   * @returns {Object} Namespaced event bus
   */
  createNamespace(namespace) {
    return {
      on: (event, callback, options) => this.on(`${namespace}:${event}`, callback, options),
      off: (event, callback) => this.off(`${namespace}:${event}`, callback),
      emit: (event, ...args) => this.emit(`${namespace}:${event}`, ...args),
      once: (event, callback, options) => this.once(`${namespace}:${event}`, callback, options)
    };
  }
  
  /**
   * Cleanup all resources
   */
  cleanup() {
    if (this.isDestroyed) return;
    
    console.log('🧹 EventBus: Cleaning up...');
    
    // Remove all listeners
    this.removeAllListeners();
    
    // Clear history
    this.eventHistory = [];
    
    // Mark as destroyed
    this.isDestroyed = true;
    
    console.log('✅ EventBus: Cleanup complete');
  }
  
  /**
   * Destroy the event bus (alias for cleanup)
   */
  destroy() {
    this.cleanup();
  }
}

// Export for module system
if (typeof module !== 'undefined' && module.exports) {
  module.exports = EventBus;
} else if (typeof window !== 'undefined') {
  // Make available globally for Chrome extension
  window.EventBus = EventBus;
} else {
  // Make available globally for Node.js
  global.EventBus = EventBus;
}
