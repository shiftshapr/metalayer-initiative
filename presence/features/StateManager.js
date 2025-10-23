/**
 * STATE MANAGER - Application State Management
 * Handles all state and persistence functionality
 */

class StateManager {
  constructor() {
    this.logLevel = 'INFO';
    this.isInitialized = false;
  }

  /**
   * Initialize StateManager module
   */
  async initialize() {
    if (this.isInitialized) {
      this.log('WARN', 'StateManager already initialized');
      return;
    }

    this.log('INFO', 'Initializing StateManager...');
    
    try {
      // TODO: Initialize state management systems here
      
      this.isInitialized = true;
      this.log('INFO', 'StateManager initialized successfully');
    } catch (error) {
      this.log('ERROR', 'Failed to initialize StateManager:', error);
      throw error;
    }
  }

  /**
   * Logging utility
   */
  log(level, message, ...args) {
    if (this.logLevel === 'SILENT') return;
    
    const levels = { ERROR: 0, WARN: 1, INFO: 2, DEBUG: 3 };
    if (levels[level] <= levels[this.logLevel]) {
      console.log(`[StateManager] [${level}] ${message}`, ...args);
    }
  }
}

// ===== STATE MANAGEMENT FUNCTIONS (Move from sidepanel.js) =====
// TODO: Move these functions from sidepanel.js:

// Modern state management functions
async function getState(key) {
  if (stateManager && typeof stateManager.get === 'function') {
    try {
      return await stateManager.get(key);
    } catch (error) {
      console.error('❌ MODERN: Error getting state from StateManager:', error);
      console.error('❌ MODERN: Error details:', {
        message: error.message,
        stack: error.stack,
        key: key,
        stateManager: !!stateManager,
        stateManagerType: typeof stateManager,
        stateManagerGet: typeof stateManager.get
      });
      // Fallback to chrome.storage.local
      return new Promise((resolve) => {
        chrome.storage.local.get([key], (result) => {
          resolve(result[key] || null);
        });
      });
    }
  } else {
    console.log('🔄 MODERN: StateManager not available, using chrome.storage.local fallback');
    // Fallback to chrome.storage.local
    return new Promise((resolve) => {
      chrome.storage.local.get([key], (result) => {
        resolve(result[key] || null);
      });
    });
  }
}

async function setState(key, value) {
  if (stateManager) {
    try {
      await stateManager.set(key, value);
      console.log('🔄 MODERN: State updated:', key, '=', value);
    } catch (error) {
      console.error('❌ MODERN: Error setting state in StateManager:', error);
      // Fallback to chrome.storage.local
      chrome.storage.local.set({ [key]: value });
    }
  } else {
    // Fallback to chrome.storage.local
    chrome.storage.local.set({ [key]: value });
  }
}

function emitEvent(eventName, data = {}) {
  if (eventBus) {
    eventBus.emit(eventName, data);
    console.log('📡 MODERN: Emitted event:', eventName, data);
  }
}

function onEvent(eventName, callback) {
  if (eventBus) {
    eventBus.on(eventName, callback);
    console.log('👂 MODERN: Subscribed to event:', eventName);
  }
}


// Export for global access
window.StateManager = StateManager;
