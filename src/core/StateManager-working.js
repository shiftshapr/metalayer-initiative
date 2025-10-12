/**
 * StateManager - Working Version
 */

class StateManager {
  constructor() {
    this.state = {
      chat: {
        data: [],
        lastLoadedUri: null,
        focusedMessage: null,
        previousView: null
      },
      avatars: {
        user: {
          current: null,
          customColor: null,
          defaultColor: null
        },
        visibility: [],
        message: [],
        combined: []
      },
      ui: {
        activeModal: null,
        debugMode: false,
        theme: 'auto',
        activeCommunities: [],
        primaryCommunity: null,
        currentCommunity: null
      }
    };
    
    this.subscribers = new Map();
    this.history = [];
    this.maxHistorySize = 100;
    
    console.log('🏗️ StateManager: Initialized');
  }
  
  getState(path) {
    const keys = path.split('.');
    let current = this.state;
    
    for (const key of keys) {
      if (current && typeof current === 'object' && key in current) {
        current = current[key];
      } else {
        return undefined;
      }
    }
    
    return current;
  }
  
  setState(path, value, persist = false) {
    const keys = path.split('.');
    const lastKey = keys.pop();
    let current = this.state;
    
    for (const key of keys) {
      if (!(key in current)) {
        current[key] = {};
      }
      current = current[key];
    }
    
    const oldValue = current[lastKey];
    current[lastKey] = value;
    
    this.addToHistory(path, oldValue, value);
    this.notifySubscribers(path, value, oldValue);
    
    if (persist) {
      this.persistState(path, value);
    }
    
    console.log(`🔄 StateManager: ${path} = ${JSON.stringify(value)}`);
  }
  
  subscribe(path, callback) {
    if (!this.subscribers.has(path)) {
      this.subscribers.set(path, new Set());
    }
    
    this.subscribers.get(path).add(callback);
    
    return () => {
      const pathSubscribers = this.subscribers.get(path);
      if (pathSubscribers) {
        pathSubscribers.delete(callback);
        if (pathSubscribers.size === 0) {
          this.subscribers.delete(path);
        }
      }
    };
  }
  
  notifySubscribers(path, newValue, oldValue) {
    const pathSubscribers = this.subscribers.get(path);
    if (pathSubscribers) {
      pathSubscribers.forEach(callback => {
        try {
          callback(newValue, oldValue, path);
        } catch (error) {
          console.error('❌ StateManager: Subscriber error:', error);
        }
      });
    }
    
    const wildcardSubscribers = this.subscribers.get('*');
    if (wildcardSubscribers) {
      wildcardSubscribers.forEach(callback => {
        try {
          callback(newValue, oldValue, path);
        } catch (error) {
          console.error('❌ StateManager: Wildcard subscriber error:', error);
        }
      });
    }
  }
  
  addToHistory(path, oldValue, newValue) {
    const entry = {
      timestamp: Date.now(),
      path,
      oldValue,
      newValue
    };
    
    this.history.unshift(entry);
    
    if (this.history.length > this.maxHistorySize) {
      this.history = this.history.slice(0, this.maxHistorySize);
    }
  }
  
  getHistory(path = null) {
    if (path) {
      return this.history.filter(entry => entry.path.startsWith(path));
    }
    return [...this.history];
  }
  
  persistState(path, value) {
    console.log(`💾 StateManager: Would persist ${path} to storage`);
  }
  
  getSnapshot() {
    return {
      state: JSON.parse(JSON.stringify(this.state)),
      subscribers: Array.from(this.subscribers.keys()),
      historySize: this.history.length,
      timestamp: Date.now()
    };
  }
  
  cleanup() {
    console.log('🧹 StateManager: Cleaning up...');
    this.subscribers.clear();
    this.history = [];
    this.state = {};
    console.log('✅ StateManager: Cleanup complete');
  }
}

// Export for module system
if (typeof module !== 'undefined' && module.exports) {
  module.exports = StateManager;
} else if (typeof window !== 'undefined') {
  window.StateManager = StateManager;
} else {
  global.StateManager = StateManager;
}













