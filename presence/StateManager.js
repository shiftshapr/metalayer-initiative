/**
 * StateManager - Centralized State Management for Metalayer Extension
 * 
 * Replaces global variables with a structured, lifecycle-managed state system.
 * Provides reactive state updates and proper cleanup mechanisms.
 * 
 * @version 1.0.0
 * @author Metalayer Development Team
 */

class StateManager {
  constructor() {
    this.state = {
      // Chat state
      chat: {
        data: [],                    // window.currentChatData
        lastLoadedUri: null,         // window.lastLoadedUri
        focusedMessage: null,        // window.focusedMessage
        previousView: null,          // window.previousView
        lastMessageCount: 0,         // lastMessageCount
        lastMessageId: null,         // lastMessageId
        pollingInterval: null,       // messagePollingInterval
        isPolling: false
      },
      
      // Avatar state
      avatars: {
        user: {
          current: null,             // Current user avatar data
          customColor: null,         // Custom aura color
          defaultColor: null         // Default aura color
        },
        visibility: [],              // Visibility avatars
        message: [],                 // Message avatars cache
        combined: []                 // Combined avatars
      },
      
      // UI state
      ui: {
        activeModal: null,           // Currently active modal
        debugMode: false,            // Debug panel state
        theme: 'auto',               // Current theme
        activeCommunities: [],       // Active communities
        primaryCommunity: null,      // Primary community
        currentCommunity: null       // Current community
      },
      
      // Cross-profile communication
      sync: {
        isConnected: false,          // Cross-profile connection status
        lastSyncTime: null,          // Last successful sync
        pendingMessages: [],         // Pending cross-profile messages
        retryCount: 0                // Retry count for failed syncs
      },
      
      // API state
      api: {
        baseUrl: 'http://216.238.91.120:3003',
        isOnline: true,             // Network connectivity
        lastRequestTime: null,       // Last API request
        requestCount: 0,             // Request counter
        errorCount: 0               // Error counter
      },
      
      // Extension state
      extension: {
        build: '2025-01-24-010',
        reloadTimestamp: null,
        isInitialized: false,
        version: '1.0.0'
      }
    };
    
    // Subscribers for reactive updates
    this.subscribers = new Map();
    
    // State change history for debugging
    this.history = [];
    this.maxHistorySize = 100;
    
    // Initialize
    this.initialize();
  }
  
  /**
   * Initialize the state manager
   */
  initialize() {
    console.log('🏗️ StateManager: Initializing...');
    
    // Set extension info
    this.setState('extension.reloadTimestamp', new Date().toISOString());
    this.setState('extension.isInitialized', true);
    
    // Load persisted state from Chrome storage
    this.loadPersistedState();
    
    console.log('✅ StateManager: Initialized successfully');
  }
  
  /**
   * Get state value by path
   * @param {string} path - Dot notation path (e.g., 'chat.data', 'ui.activeModal')
   * @returns {any} State value
   */
  getState(path) {
    const keys = path.split('.');
    let current = this.state;
    
    for (const key of keys) {
      if (current && typeof current === 'object' && key in current) {
        current = current[key];
      } else {
//         return undefined;
      }
    }
    
//     return current;
  }
  
  /**
   * Set state value by path
   * @param {string} path - Dot notation path
   * @param {any} value - New value
   * @param {boolean} persist - Whether to persist to Chrome storage
   */
  setState(path, value, persist = false) {
    const keys = path.split('.');
    const lastKey = keys.pop();
    let current = this.state;
    
    // Navigate to parent object
    for (const key of keys) {
      if (!(key in current)) {
        current[key] = {};
      }
      current = current[key];
    }
    
    // Store old value for history
    const oldValue = current[lastKey];
    
    // Set new value
    current[lastKey] = value;
    
    // Add to history
    this.addToHistory(path, oldValue, value);
    
    // Notify subscribers
    this.notifySubscribers(path, value, oldValue);
    
    // Persist to Chrome storage if requested
    if (persist) {
      this.persistState(path, value);
    }
    
    console.log(`🔄 StateManager: ${path} = ${JSON.stringify(value)}`);
  }
  
  /**
   * Subscribe to state changes
   * @param {string} path - Path to watch
   * @param {function} callback - Callback function
   * @returns {function} Unsubscribe function
   */
  subscribe(path, callback) {
    if (!this.subscribers.has(path)) {
      this.subscribers.set(path, new Set());
    }
    
    this.subscribers.get(path).add(callback);
    
    // Return unsubscribe function
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
  
  /**
   * Notify subscribers of state changes
   * @param {string} path - Changed path
   * @param {any} newValue - New value
   * @param {any} oldValue - Old value
   */
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
    
    // Also notify wildcard subscribers
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
  
  /**
   * Add state change to history
   * @param {string} path - Changed path
   * @param {any} oldValue - Old value
   * @param {any} newValue - New value
   */
  addToHistory(path, oldValue, newValue) {
    const entry = {
      timestamp: Date.now(),
      path,
      oldValue,
      newValue
    };
    
    this.history.unshift(entry);
    
    // Limit history size
    if (this.history.length > this.maxHistorySize) {
      this.history = this.history.slice(0, this.maxHistorySize);
    }
  }
  
  /**
   * Get state change history
   * @param {string} path - Optional path filter
   * @returns {Array} History entries
   */
  getHistory(path = null) {
    if (path) {
      return this.history.filter(entry => entry.path.startsWith(path));
    }
    return [...this.history];
  }
  
  /**
   * Load persisted state from Chrome storage
   */
  async loadPersistedState() {
    try {
      const result = await chrome.storage.local.get([
        'userAvatarBgColor',
        'activeCommunities',
        'primaryCommunity',
        'currentCommunity',
        'debugMode',
        'theme'
      ]);
      
      // Load avatar color
      if (result.userAvatarBgColor) {
        this.setState('avatars.user.customColor', result.userAvatarBgColor);
      }
      
      // Load community settings
      if (result.activeCommunities) {
        this.setState('ui.activeCommunities', result.activeCommunities);
      }
      if (result.primaryCommunity) {
        this.setState('ui.primaryCommunity', result.primaryCommunity);
      }
      if (result.currentCommunity) {
        this.setState('ui.currentCommunity', result.currentCommunity);
      }
      
      // Load UI settings
      if (result.debugMode !== undefined) {
        this.setState('ui.debugMode', result.debugMode);
      }
      if (result.theme) {
        this.setState('ui.theme', result.theme);
      }
      
      console.log('✅ StateManager: Persisted state loaded');
    } catch (error) {
      console.error('❌ StateManager: Failed to load persisted state:', error);
    }
  }
  
  /**
   * Persist state to Chrome storage
   * @param {string} path - Path to persist
   * @param {any} value - Value to persist
   */
  async persistState(path, value) {
    try {
      const storageKey = this.getStorageKey(path);
      if (storageKey) {
        await chrome.storage.local.set({ [storageKey]: value });
        console.log(`💾 StateManager: Persisted ${path} to storage`);
      }
    } catch (error) {
      console.error('❌ StateManager: Failed to persist state:', error);
    }
  }
  
  /**
   * Get Chrome storage key for a state path
   * @param {string} path - State path
   * @returns {string|null} Storage key
   */
  getStorageKey(path) {
    const keyMap = {
      'avatars.user.customColor': 'userAvatarBgColor',
      'ui.activeCommunities': 'activeCommunities',
      'ui.primaryCommunity': 'primaryCommunity',
      'ui.currentCommunity': 'currentCommunity',
      'ui.debugMode': 'debugMode',
      'ui.theme': 'theme'
    };
    
    return keyMap[path] || null;
  }
  
  /**
   * Reset state to initial values
   * @param {string} path - Optional path to reset (resets all if not provided)
   */
  resetState(path = null) {
    if (path) {
      // Reset specific path
      const keys = path.split('.');
      const lastKey = keys.pop();
      let current = this.state;
      
      for (const key of keys) {
        current = current[key];
      }
      
      delete current[lastKey];
      console.log(`🔄 StateManager: Reset ${path}`);
    } else {
      // Reset entire state
      this.state = this.getInitialState();
      console.log('🔄 StateManager: Reset entire state');
    }
  }
  
  /**
   * Get initial state structure
   * @returns {Object} Initial state
   */
  getInitialState() {
    return {
      chat: {
        data: [],
        lastLoadedUri: null,
        focusedMessage: null,
        previousView: null,
        lastMessageCount: 0,
        lastMessageId: null,
        pollingInterval: null,
        isPolling: false
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
      },
      sync: {
        isConnected: false,
        lastSyncTime: null,
        pendingMessages: [],
        retryCount: 0
      },
      api: {
        baseUrl: 'http://216.238.91.120:3003',
        isOnline: true,
        lastRequestTime: null,
        requestCount: 0,
        errorCount: 0
      },
      extension: {
        build: '2025-01-24-010',
        reloadTimestamp: null,
        isInitialized: false,
        version: '1.0.0'
      }
    };
  }
  
  /**
   * Get state snapshot for debugging
   * @returns {Object} State snapshot
   */
  getSnapshot() {
    return {
      state: JSON.parse(JSON.stringify(this.state)),
      subscribers: Array.from(this.subscribers.keys()),
      historySize: this.history.length,
      timestamp: Date.now()
    };
  }
  
  /**
   * Cleanup resources
   */
  cleanup() {
    console.log('🧹 StateManager: Cleaning up...');
    
    // Clear subscribers
    this.subscribers.clear();
    
    // Clear history
    this.history = [];
    
    // Reset state
    this.state = this.getInitialState();
    
    console.log('✅ StateManager: Cleanup complete');
  }
}

// Export for module system
if (typeof module !== 'undefined' && module.exports) {
  module.exports = StateManager;
} else if (typeof window !== 'undefined') {
  // Make available globally for Chrome extension
  window.StateManager = StateManager;
} else {
  // Make available globally for Node.js
  global.StateManager = StateManager;
}
