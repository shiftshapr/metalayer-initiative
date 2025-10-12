/**
 * Metalayer Extension - New Architecture Sidepanel
 * 
 * This is the new modular architecture version that runs alongside
 * the existing sidepanel.js to ensure zero risk of breaking functionality.
 * 
 * @version 2.0.0
 * @author Metalayer Development Team
 */

// ===== EXTENSION RELOAD & BUILD TRACKING =====
const EXTENSION_BUILD = '2025-01-24-020-NEW-ARCH';
const RELOAD_TIMESTAMP = new Date().toISOString();
console.log('🚀 NEW ARCHITECTURE EXTENSION RELOADED:', {
  build: EXTENSION_BUILD,
  timestamp: RELOAD_TIMESTAMP,
  userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'Node.js',
  location: typeof window !== 'undefined' ? window.location.href : 'Node.js'
});

// ===== CORE ARCHITECTURE COMPONENTS =====
let stateManager = null;
let eventBus = null;
let lifecycleManager = null;

// ===== INITIALIZATION =====
async function initializeNewArchitecture() {
  console.log('🏗️ NEW ARCHITECTURE: Initializing...');
  
  try {
    // Load core components
    const StateManager = require('./src/core/StateManager-working.js');
    const EventBus = require('./src/core/EventBus-working.js');
    const LifecycleManager = require('./src/core/LifecycleManager-working.js');
    
    // Initialize core components
    stateManager = new StateManager();
    eventBus = new EventBus();
    lifecycleManager = new LifecycleManager();
    
    console.log('✅ NEW ARCHITECTURE: Core components initialized');
    
    // Set up cross-component communication
    setupCrossComponentCommunication();
    
    // Initialize new architecture features
    await initializeNewFeatures();
    
    console.log('✅ NEW ARCHITECTURE: Initialization complete');
    return true;
    
  } catch (error) {
    console.error('❌ NEW ARCHITECTURE: Initialization failed:', error);
    return false;
  }
}

/**
 * Set up communication between core components
 */
function setupCrossComponentCommunication() {
  console.log('🔗 NEW ARCHITECTURE: Setting up cross-component communication...');
  
  // State changes should emit events
  stateManager.subscribe('*', (newValue, oldValue, path) => {
    eventBus.emit('state:changed', { path, newValue, oldValue });
  });
  
  // Component lifecycle events
  eventBus.on('component:registered', (component) => {
    console.log(`🎯 NEW ARCHITECTURE: Component registered: ${component.name}`);
  });
  
  eventBus.on('component:destroyed', (component) => {
    console.log(`🎯 NEW ARCHITECTURE: Component destroyed: ${component.name}`);
  });
  
  console.log('✅ NEW ARCHITECTURE: Cross-component communication setup complete');
}

/**
 * Initialize new architecture features
 */
async function initializeNewFeatures() {
  console.log('🎨 NEW ARCHITECTURE: Initializing new features...');
  
  // Initialize state with current values from old system
  await initializeStateFromOldSystem();
  
  // Set up event listeners for new architecture
  setupNewEventListeners();
  
  // Register components with lifecycle manager
  registerNewComponents();
  
  console.log('✅ NEW ARCHITECTURE: New features initialized');
}

/**
 * Initialize state with current values from old system
 */
async function initializeStateFromOldSystem() {
  console.log('🔄 NEW ARCHITECTURE: Initializing state from old system...');
  
  try {
    // Get current values from old system if available
    if (typeof window !== 'undefined') {
      // Chat state
      if (window.currentChatData) {
        stateManager.setState('chat.data', window.currentChatData);
      }
      if (window.lastLoadedUri) {
        stateManager.setState('chat.lastLoadedUri', window.lastLoadedUri);
      }
      if (window.focusedMessage) {
        stateManager.setState('chat.focusedMessage', window.focusedMessage);
      }
      if (window.previousView) {
        stateManager.setState('chat.previousView', window.previousView);
      }
    }
    
    // Load from Chrome storage (with fallback for Node.js)
    let result = {};
    if (typeof chrome !== 'undefined' && chrome.storage) {
      result = await chrome.storage.local.get([
        'userAvatarBgColor',
        'activeCommunities',
        'primaryCommunity',
        'currentCommunity',
        'debugMode',
        'theme'
      ]);
    } else {
      // Fallback for Node.js testing
      result = {
        userAvatarBgColor: '#45B7D1',
        activeCommunities: ['comm-001'],
        primaryCommunity: 'comm-001',
        currentCommunity: 'comm-001',
        debugMode: false,
        theme: 'auto'
      };
    }
    
    // Set state from Chrome storage
    if (result.userAvatarBgColor) {
      stateManager.setState('avatars.user.customColor', result.userAvatarBgColor);
    }
    if (result.activeCommunities) {
      stateManager.setState('ui.activeCommunities', result.activeCommunities);
    }
    if (result.primaryCommunity) {
      stateManager.setState('ui.primaryCommunity', result.primaryCommunity);
    }
    if (result.currentCommunity) {
      stateManager.setState('ui.currentCommunity', result.currentCommunity);
    }
    if (result.debugMode !== undefined) {
      stateManager.setState('ui.debugMode', result.debugMode);
    }
    if (result.theme) {
      stateManager.setState('ui.theme', result.theme);
    }
    
    console.log('✅ NEW ARCHITECTURE: State initialized from old system');
    
  } catch (error) {
    console.error('❌ NEW ARCHITECTURE: Failed to initialize state from old system:', error);
  }
}

/**
 * Set up event listeners for new architecture
 */
function setupNewEventListeners() {
  console.log('🎧 NEW ARCHITECTURE: Setting up event listeners...');
  
  // Listen for DOM ready
  eventBus.on('dom:ready', () => {
    console.log('🎯 NEW ARCHITECTURE: DOM ready event received');
  });
  
  // Listen for aura color changes
  eventBus.on('aura:colorChanged', (data) => {
    console.log('🎯 NEW ARCHITECTURE: Aura color changed:', data.color);
    // Update state
    stateManager.setState('avatars.user.customColor', data.color, true);
  });
  
  // Listen for cross-profile messages
  eventBus.on('crossProfile:messageDeleted', (data) => {
    console.log('🎯 NEW ARCHITECTURE: Cross-profile message deleted:', data.messageId);
  });
  
  eventBus.on('crossProfile:auraColorChanged', (data) => {
    console.log('🎯 NEW ARCHITECTURE: Cross-profile aura color changed:', data.color);
  });
  
  eventBus.on('crossProfile:newMessageAdded', (data) => {
    console.log('🎯 NEW ARCHITECTURE: Cross-profile new message:', data.messageId);
  });
  
  console.log('✅ NEW ARCHITECTURE: Event listeners setup complete');
}

/**
 * Register components with lifecycle manager
 */
function registerNewComponents() {
  console.log('📋 NEW ARCHITECTURE: Registering components...');
  
  // Register StateManager component
  lifecycleManager.register('stateManager', {
    init() {
      console.log('🏗️ StateManager component initialized');
    },
    mount() {
      console.log('🏗️ StateManager component mounted');
    },
    update(data) {
      console.log('🏗️ StateManager component updated:', data);
    },
    unmount() {
      console.log('🏗️ StateManager component unmounted');
    },
    destroy() {
      console.log('🏗️ StateManager component destroyed');
    }
  }, {
    autoInitialize: true,
    autoMount: true,
    priority: 1
  });
  
  // Register EventBus component
  lifecycleManager.register('eventBus', {
    init() {
      console.log('🎯 EventBus component initialized');
    },
    mount() {
      console.log('🎯 EventBus component mounted');
    },
    update(data) {
      console.log('🎯 EventBus component updated:', data);
    },
    unmount() {
      console.log('🎯 EventBus component unmounted');
    },
    destroy() {
      console.log('🎯 EventBus component destroyed');
    }
  }, {
    autoInitialize: true,
    autoMount: true,
    priority: 2
  });
  
  // Register LifecycleManager component
  lifecycleManager.register('lifecycleManager', {
    init() {
      console.log('🔄 LifecycleManager component initialized');
    },
    mount() {
      console.log('🔄 LifecycleManager component mounted');
    },
    update(data) {
      console.log('🔄 LifecycleManager component updated:', data);
    },
    unmount() {
      console.log('🔄 LifecycleManager component unmounted');
    },
    destroy() {
      console.log('🔄 LifecycleManager component destroyed');
    }
  }, {
    autoInitialize: true,
    autoMount: true,
    priority: 3
  });
  
  console.log('✅ NEW ARCHITECTURE: Components registered');
}

/**
 * Get state manager instance
 */
function getStateManager() {
  return stateManager;
}

/**
 * Get event bus instance
 */
function getEventBus() {
  return eventBus;
}

/**
 * Get lifecycle manager instance
 */
function getLifecycleManager() {
  return lifecycleManager;
}

/**
 * Get new architecture statistics
 */
function getNewArchitectureStats() {
  return {
    stateManager: stateManager ? stateManager.getSnapshot() : null,
    eventBus: eventBus ? eventBus.getStats() : null,
    lifecycleManager: lifecycleManager ? lifecycleManager.getStats() : null,
    timestamp: Date.now()
  };
}

/**
 * Cleanup new architecture
 */
function cleanupNewArchitecture() {
  console.log('🧹 NEW ARCHITECTURE: Cleaning up...');
  
  if (stateManager) {
    stateManager.cleanup();
  }
  
  if (eventBus) {
    eventBus.cleanup();
  }
  
  if (lifecycleManager) {
    lifecycleManager.cleanup();
  }
  
  console.log('✅ NEW ARCHITECTURE: Cleanup complete');
}

// ===== EXPORT FOR TESTING =====
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    initializeNewArchitecture,
    getStateManager,
    getEventBus,
    getLifecycleManager,
    getNewArchitectureStats,
    cleanupNewArchitecture
  };
} else {
  // Make available globally for Chrome extension
  window.NewArchitecture = {
    initializeNewArchitecture,
    getStateManager,
    getEventBus,
    getLifecycleManager,
    getNewArchitectureStats,
    cleanupNewArchitecture
  };
}

// ===== AUTO-INITIALIZATION =====
// Initialize when DOM is ready
if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      console.log('🎯 NEW ARCHITECTURE: DOM ready, initializing...');
      initializeNewArchitecture().then(success => {
        if (success) {
          console.log('✅ NEW ARCHITECTURE: Auto-initialization successful');
        } else {
          console.log('❌ NEW ARCHITECTURE: Auto-initialization failed');
        }
      });
    });
  } else {
    // DOM already ready
    console.log('🎯 NEW ARCHITECTURE: DOM already ready, initializing...');
    initializeNewArchitecture().then(success => {
      if (success) {
        console.log('✅ NEW ARCHITECTURE: Auto-initialization successful');
      } else {
        console.log('❌ NEW ARCHITECTURE: Auto-initialization failed');
      }
    });
  }
}

console.log('🔧 NEW ARCHITECTURE: Sidepanel loaded and ready');
