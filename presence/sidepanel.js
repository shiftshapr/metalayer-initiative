// ===== ORIGINAL FUNCTIONALITY RESTORED =====

// Meta-Layer Initiative API Configuration - MODERNIZED
// Use environment-based configuration instead of hardcoded URLs
// MODERN CONFIGURATION: Use environment-based configuration
// MODERN CONFIGURATION: Fully environment-based, no hardcoded fallbacks

// SD1 FIX: Implement log level system to reduce runaway logging
const LOG_LEVELS = {
  ERROR: 0,
  WARN: 1,
  INFO: 2,
  DEBUG: 3
};

const CURRENT_LOG_LEVEL = LOG_LEVELS.INFO; // Only show ERROR, WARN, INFO by default

// CRITICAL FIX: Ensure Logger is available before using it
if (typeof Logger === 'undefined' || typeof window.Logger === 'undefined') {
  console.error('🚨 CRITICAL: Logger utility not loaded! Creating fallback Logger...');
  // Create comprehensive fallback Logger object with ALL methods
  window.Logger = {
    // Basic logging methods with level filtering
    debug: (msg, data, context) => {
      if (CURRENT_LOG_LEVEL >= LOG_LEVELS.DEBUG) {
        console.log(`🔍 [DEBUG] ${msg}`, data || '');
      }
    },
    info: (msg, data, context) => {
      if (CURRENT_LOG_LEVEL >= LOG_LEVELS.INFO) {
        console.log(`ℹ️ [INFO] ${msg}`, data || '');
      }
    },
    warn: (msg, data, context) => {
      if (CURRENT_LOG_LEVEL >= LOG_LEVELS.WARN) {
        console.warn(`⚠️ [WARN] ${msg}`, data || '');
      }
    },
    error: (msg, data, context) => {
      if (CURRENT_LOG_LEVEL >= LOG_LEVELS.ERROR) {
        console.error(`❌ [ERROR] ${msg}`, data || '');
      }
    },
    success: (msg, data, context) => {
      if (CURRENT_LOG_LEVEL >= LOG_LEVELS.INFO) {
        console.log(`✅ [SUCCESS] ${msg}`, data || '');
      }
    },
    
    // Context-specific methods with level filtering
    avatar: (msg, data) => {
      if (CURRENT_LOG_LEVEL >= LOG_LEVELS.DEBUG) {
        console.log(`🎨 [AVATAR] ${msg}`, data || '');
      }
    },
    presence: (msg, data) => {
      if (CURRENT_LOG_LEVEL >= LOG_LEVELS.DEBUG) {
        console.log(`👤 [PRESENCE] ${msg}`, data || '');
      }
    },
    auth: (msg, data) => {
      if (CURRENT_LOG_LEVEL >= LOG_LEVELS.INFO) {
        console.log(`🔐 [AUTH] ${msg}`, data || '');
      }
    },
    visibility: (msg, data) => {
      if (CURRENT_LOG_LEVEL >= LOG_LEVELS.DEBUG) {
        console.log(`👁️ [VISIBILITY] ${msg}`, data || '');
      }
    },
    realtime: (msg, data) => {
      if (CURRENT_LOG_LEVEL >= LOG_LEVELS.INFO) {
        console.log(`📡 [REALTIME] ${msg}`, data || '');
      }
    },
    
    // Flow methods with level filtering
    startFlow: (name, data) => {
      if (CURRENT_LOG_LEVEL >= LOG_LEVELS.DEBUG) {
        console.log(`▶️ [FLOW START] ${name}`, data || '');
      }
    },
    endFlow: (name, success, data) => {
      if (CURRENT_LOG_LEVEL >= LOG_LEVELS.DEBUG) {
        console.log(`⏸️ [FLOW END] ${name} (${success ? 'SUCCESS' : 'FAILED'})`, data || '');
      }
    },
    stepFlow: (name, step, data) => {
      if (CURRENT_LOG_LEVEL >= LOG_LEVELS.DEBUG) {
        console.log(`➡️ [FLOW STEP] ${name} - ${step}`, data || '');
      }
    },
    
    // Utility methods
    getHistory: () => [],
    clearHistory: () => {},
    exportLogs: () => '[]',
    setLevel: (level) => {
      window.CURRENT_LOG_LEVEL = level;
    },
    setEnabled: () => {}
  };
  console.log('✅ Fallback Logger created with log level filtering');
}

Logger.info("SIDEPANEL.JS LOADING STARTED", null, 'general');

// Immediate debug function - should be available right away
window.testScript = function() {
  Logger.success("Script is loading! This function works.", null, 'general');
  Logger.debug("Agent tab button found", { button: document.querySelector('[data-tab="agent-tab"]') }, 'general');
  Logger.debug("Agent tab content found", { content: document.getElementById('agent-tab') }, 'general');
  
  // Try to click agent tab
  const agentBtn = document.querySelector('[data-tab="agent-tab"]');
  if (agentBtn) {
    Logger.debug("Clicking agent tab", null, 'general');
    agentBtn.click();
  }
};

// Real Google auth will be loaded via script tag in HTML
const METALAYER_API_URL = window.METALAYER_API_URL || (window.configManager ? window.configManager.get('apiUrl') : null);
const METALAYER_WS_URL = window.METALAYER_WS_URL || (window.configManager ? window.configManager.get('wsUrl') : null);

// Agent API constants (from main branch)
const AGENT_API_URL = 'http://216.238.91.120:3002/api/agent';
const PEOPLE_API_URL = 'http://216.238.91.120:3002/people';

// Initialize comprehensive real-time logging
let realtimeLogger = null;
if (typeof window !== 'undefined' && window.realtimeLogger) {
  realtimeLogger = window.realtimeLogger;
} else {
  // Fallback logging if realtime-logger.js not loaded
  realtimeLogger = {
    websocket: (level, msg, data) => console.log(`[WEBSOCKET] ${msg}`, data),
    supabase: (level, msg, data) => console.log(`[SUPABASE] ${msg}`, data),
    aura: (level, msg, data) => console.log(`[AURA] ${msg}`, data),
    message: (level, msg, data) => console.log(`[MESSAGE] ${msg}`, data),
    visibility: (level, msg, data) => console.log(`[VISIBILITY] ${msg}`, data),
    presence: (level, msg, data) => console.log(`[PRESENCE] ${msg}`, data),
    error: (level, msg, data) => console.error(`[ERROR] ${msg}`, data),
    startTimer: (name) => ({ name, start: Date.now() }),
    endTimer: (timer) => Date.now() - timer.start,
    startFlow: (name, data) => console.log(`[FLOW START] ${name}`, data),
    endFlow: (name, success, data) => console.log(`[FLOW END] ${name} (${success ? 'SUCCESS' : 'FAILED'})`, data),
    stepFlow: (name, step, data) => console.log(`[FLOW STEP] ${name} - ${step}`, data)
  };
}

// Validate configuration is available
if (!METALAYER_API_URL || !METALAYER_WS_URL) {
  console.error('❌ CONFIG: Missing API configuration. Please ensure configManager is properly initialized.');
}

// ===== COMPLETE MODERN ARCHITECTURE INTEGRATION =====
// StateManager, EventBus, LifecycleManager, and Supabase integration

// Supabase configuration (using config system - NO HARDCODING)
const SUPABASE_URL = window.SUPABASE_URL;
const SUPABASE_ANON_KEY = window.SUPABASE_ANON_KEY;

// Initialize Supabase client globally with comprehensive error handling
if (typeof window !== 'undefined') {
  try {
    // Check if supabase is available
    if (typeof supabase === 'undefined') {
      console.error('❌ SUPABASE: supabase library not loaded');
      throw new Error('Supabase library not available');
    }
    
    window.supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    console.log('✅ SUPABASE: Global client initialized successfully');
    console.log('✅ SUPABASE: URL:', SUPABASE_URL);
    console.log('✅ SUPABASE: Key present:', !!SUPABASE_ANON_KEY);
    console.log('✅ SUPABASE: Client methods available:', Object.keys(window.supabase).slice(0, 10));
    
    // CRITICAL FIX: Set up Supabase authentication after user login
    console.log('🔧 SUPABASE: Setting up authentication listener...');
    window.supabase.auth.onAuthStateChange((event, session) => {
      console.log('🔔 SUPABASE AUTH: Auth state changed:', event);
      if (session) {
        console.log('✅ SUPABASE AUTH: User authenticated:', session.user.email);
        console.log('✅ SUPABASE AUTH: Session expires at:', new Date(session.expires_at * 1000));
        
        // Initialize RobustIntegration now that user is authenticated
        if (window.robustIntegration && !window.robustIntegration.isInitialized) {
          console.log('🔗 AUTH: Initializing RobustIntegration after authentication...');
          window.robustIntegration.initialize().then(success => {
            if (success) {
              console.log('✅ AUTH: RobustIntegration initialized successfully');
            } else {
              console.log('❌ AUTH: RobustIntegration initialization failed');
            }
          });
        }

        // Initialize VisibilityIntegration now that user is authenticated
        if (window.visibilityIntegration && !window.visibilityIntegration.isInitialized) {
          console.log('🔗 AUTH: Initializing VisibilityIntegration after authentication...');
          window.visibilityIntegration.initialize().then(success => {
            if (success) {
              console.log('✅ AUTH: VisibilityIntegration initialized successfully');
            } else {
              console.log('❌ AUTH: VisibilityIntegration initialization failed');
            }
          });
        }

        // Initialize ReactionsIntegration now that user is authenticated
        if (window.reactionsIntegration && !window.reactionsIntegration.isInitialized) {
          console.log('🔗 AUTH: Initializing ReactionsIntegration after authentication...');
          window.reactionsIntegration.initialize().then(success => {
            if (success) {
              console.log('✅ AUTH: ReactionsIntegration initialized successfully');
            } else {
              console.log('❌ AUTH: ReactionsIntegration initialization failed');
            }
          });
        }

        // Initialize AurasIntegration now that user is authenticated
        if (window.aurasIntegration && !window.aurasIntegration.isInitialized) {
          console.log('🔗 AUTH: Initializing AurasIntegration after authentication...');
          window.aurasIntegration.initialize().then(success => {
            if (success) {
              console.log('✅ AUTH: AurasIntegration initialized successfully');
            } else {
              console.log('❌ AUTH: AurasIntegration initialization failed');
            }
          });
        }
      } else {
        console.log('❌ SUPABASE AUTH: User not authenticated');
      }
    });
  } catch (error) {
    console.error('❌ SUPABASE: Failed to initialize global client:', error);
    console.error('❌ SUPABASE: Error details:', error.message);
  }
} else {
  console.error('❌ SUPABASE: Supabase library not available');
  console.error('❌ SUPABASE: typeof window:', typeof window);
  console.error('❌ SUPABASE: typeof supabase:', typeof supabase);
}

// Initialize all modern architecture components
let stateManager = null;
let eventBus = null;
let lifecycleManager = null;
let modernArchitectureInitialized = false;
let supabaseRealtimeClient = null;

// Initialize real Google auth for actual profile pictures
let realGoogleAuth = null;

async function initializeCompleteModernArchitecture() {
  try {
    // Prevent multiple initializations
    if (modernArchitectureInitialized) {
      console.log('🔄 MODERN: Architecture already initialized, skipping');
      return true;
    }
    
    console.log('🚀 MODERN: Initializing complete modern architecture...');
    
    // Check if StateManager is available
    if (typeof StateManager === 'undefined') {
      console.log('⚠️ MODERN: StateManager not available, skipping modern architecture');
      return true;
    }
    
    // Initialize StateManager
    stateManager = new StateManager();
    await stateManager.initialize({
      userAvatarBgColor: '#45B7D1',
      googleUser: null,
      supabaseUser: null,
      metalayerUser: null,
      activeCommunities: ['comm-001'],
      primaryCommunity: 'comm-001',
      currentCommunity: 'comm-001',
      communities: [],
      theme: 'auto',
      debugMode: false,
      customAvatarColor: null,
      lastMessageId: null,
      lastLoadedUri: null,
      currentUri: null,
      presenceData: null,
      chatData: [],
      messagePollingInterval: null,
      presenceHeartbeatInterval: null,
      isInitialized: false
    });
    
    // Initialize EventBus
    if (typeof EventBus !== 'undefined') {
      eventBus = new EventBus();
      setupModernEventHandling();
    }
    
    // Initialize LifecycleManager
    if (typeof LifecycleManager !== 'undefined' && !lifecycleManager) {
      try {
        lifecycleManager = new LifecycleManager();
        // Register the sidepanel component first
        lifecycleManager.register('sidepanel', {
          name: 'sidepanel',
          version: '1.0.0',
          dependencies: ['StateManager', 'EventBus'],
          initialize: () => {
            console.log('🔄 LifecycleManager: Sidepanel component initialized');
            return true;
          },
          destroy: () => {
            console.log('🔄 LifecycleManager: Sidepanel component destroyed');
            return true;
          }
        });
        // Then initialize it
        await lifecycleManager.initialize('sidepanel');
        console.log('✅ LifecycleManager: Initialized successfully');
      } catch (error) {
        console.error('❌ LifecycleManager: Error during initialization:', error);
        // Continue without LifecycleManager
        lifecycleManager = null;
      }
    } else if (lifecycleManager) {
      console.log('🔄 LifecycleManager: Already initialized, skipping');
    }
    
    console.log('✅ MODERN: Complete modern architecture initialized successfully');
    modernArchitectureInitialized = true;
    return true;
  } catch (error) {
    console.error('❌ MODERN: Error initializing modern architecture:', error);
    return false;
  }
}

function setupModernEventHandling() {
  console.log('🎯 MODERN: Setting up modern event handling...');
  
  // Check if EventBus is available
  if (!eventBus || !eventBus.on) {
    console.log('⚠️ MODERN: EventBus not available, using direct chrome.storage communication');
    return;
  }
  
  // Avatar events
  eventBus.on('avatar:colorChanged', (data) => {
    console.log('🎨 MODERN: Avatar color changed:', data.color);
    updateAvatarColor(data.color);
    if (supabaseRealtimeClient) {
      broadcastAuraColorChange(data.color);
    }
  });
  
  // Message events
  eventBus.on('message:send', (data) => {
    console.log('💬 MODERN: Sending message:', data.content);
    // Use Supabase real-time client instead of missing sendMessageToAPI
    if (window.supabaseRealtimeClient) {
      window.supabaseRealtimeClient.sendMessage(data.content);
    } else {
      console.error('❌ MODERN: No Supabase client available for message sending');
    }
  });
  
  // REMOVED: Duplicate handler - real-time messages handled by handleMessageChange()
  // eventBus.on('message:received', (data) => {
  //   console.log('📨 MODERN: Message received:', data.message);
  //   addMessageToChat(data.message);
  // });
  
  // Presence events
  eventBus.on('presence:userJoined', (data) => {
    console.log('👋 MODERN: User joined:', data.user);
    refreshVisibilityAvatars();
  });
  
  eventBus.on('presence:userLeft', (data) => {
    console.log('👋 MODERN: User left:', data.user);
    refreshVisibilityAvatars();
  });
  
  // Cross-profile events
  eventBus.on('crossProfile:auraChanged', (data) => {
    console.log('📡 MODERN: Cross-profile aura changed:', data.userEmail, data.color);
    updateUserAuraInUI(data.userEmail, data.color);
  });
  
  // REMOVED: Duplicate handler - cross-profile messages handled by real-time
  // eventBus.on('crossProfile:messageAdded', (data) => {
  //   console.log('📡 MODERN: Cross-profile message added:', data.message.content);
  //   addMessageToChat(data.message);
  // });
  
  console.log('✅ MODERN: Modern event handling setup complete');
}

function registerModernComponents() {
  console.log('🎯 MODERN: Registering modern components...');
  
  // Avatar Component
  lifecycleManager.registerComponent('avatar', {
    name: 'Avatar Component',
    autoInitialize: true,
    autoMount: true,
    priority: 1,
    init() {
      console.log('🎨 MODERN: Avatar component initialized');
      this.initialized = true;
    },
    mount() {
      console.log('🎨 MODERN: Avatar component mounted');
      this.mounted = true;
    },
    update(data) {
      console.log('🎨 MODERN: Avatar component updated:', data);
      if (data.auraColor) {
        this.updateAuraColor(data.auraColor);
      }
    },
    unmount() {
      console.log('🎨 MODERN: Avatar component unmounted');
      this.mounted = false;
    },
    destroy() {
      console.log('🎨 MODERN: Avatar component destroyed');
      this.initialized = false;
    },
    updateAuraColor(color) {
      // Profile avatar now uses unified avatar system - just update window.currentUser and refresh
      if (window.currentUser) {
        window.currentUser.auraColor = color;
        updateUI(window.currentUser);
      }
    }
  });
  
  // Chat Component
  lifecycleManager.registerComponent('chat', {
    name: 'Chat Component',
    autoInitialize: true,
    autoMount: true,
    priority: 2,
    init() {
      console.log('💬 MODERN: Chat component initialized');
      this.initialized = true;
    },
    mount() {
      console.log('💬 MODERN: Chat component mounted');
      this.mounted = true;
    },
    update(data) {
      console.log('💬 MODERN: Chat component updated:', data);
      if (data.message) {
        this.addMessage(data.message);
      }
    },
    unmount() {
      console.log('💬 MODERN: Chat component unmounted');
      this.mounted = false;
    },
    destroy() {
      console.log('💬 MODERN: Chat component destroyed');
      this.initialized = false;
    },
    addMessage(message) {
      console.log('💬 MODERN: Adding message to chat:', message);
    }
  });
  
  console.log('✅ MODERN: Modern components registered');
}

function setupSupabaseEventHandling() {
  if (!supabaseRealtimeClient) return;
  
  console.log('🎯 MODERN: Setting up Supabase event handling...');
  
  // SD1 FIX: Removed duplicate onUserUpdated handler - using window.supabaseRealtimeClient.onUserUpdated instead
  
  // SD1 FIX: Removed duplicate onNewMessage handler - using window.supabaseRealtimeClient.onNewMessage instead
  
  // SD1 FIX: Removed duplicate onVisibilityChanged handler - using window.supabaseRealtimeClient.onVisibilityChanged instead
  
  // SD1 FIX: Removed duplicate onUserJoined handler - using window.supabaseRealtimeClient.onUserJoined instead
  
  // SD1 FIX: Removed duplicate onUserLeft handler - using window.supabaseRealtimeClient.onUserLeft instead
  
  console.log('✅ MODERN: Supabase event handling setup complete');
}

async function migrateFromChromeStorage() {
  console.log('🔄 MODERN: Migrating from Chrome Storage...');
  
  try {
    const result = await chrome.storage.local.get([
      'userAvatarBgColor',
      'googleUser',
      'supabaseUser',
      'metalayerUser',
      'activeCommunities',
      'primaryCommunity',
      'currentCommunity',
      'communities',
      'theme',
      'debugMode',
      'customAvatarColor',
      'pendingMessageContent',
      'pendingMessageUri',
      'pendingVisibilityContent',
      'pendingVisibilityUri'
    ]);
    
    for (const [key, value] of Object.entries(result)) {
      if (value !== undefined && stateManager) {
        try {
          await stateManager.set(key, value);
          console.log('✅ MODERN: Migrated', key, '=', value);
        } catch (error) {
          console.error('❌ MODERN: Error migrating', key, ':', error);
        }
      }
    }
    
    console.log('✅ MODERN: Migration from Chrome Storage complete');
  } catch (error) {
    console.error('❌ MODERN: Error migrating from Chrome Storage:', error);
  }
}

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

// Modern cross-profile communication
async function setupModernCrossProfileCommunication() {
  console.log('📡 MODERN: Setting up modern cross-profile communication...');
  
  if (window.supabaseRealtimeClient) {
    await setupSupabaseEventHandling();
    console.log('✅ MODERN: Supabase cross-profile communication setup');
  } else {
    console.warn('⚠️ MODERN: Supabase not available, cross-profile communication limited');
  }
}

// ===== END COMPLETE MODERN ARCHITECTURE INTEGRATION =====

// ===== SUPABASE REAL-TIME INTEGRATION =====

// Initialize Supabase real-time client (already declared above)

// Removed duplicate initializeSupabaseRealtime() function
// Using initializeSupabaseRealtimeClient() instead

async function joinPageWithSupabase(pageId, pageUrl) {
  console.log('🌐 SUPABASE: Starting page join process...');
  console.log('🌐 SUPABASE: Page ID:', pageId);
  console.log('🌐 SUPABASE: Page URL:', pageUrl);
  
  const client = window.supabaseRealtimeClient || supabaseRealtimeClient;
  console.log('🌐 SUPABASE: Client available:', !!client);
  
  if (client) {
    try {
      const userEmail = await getCurrentUserEmail();
      const userId = await getCurrentUserId();
      
      console.log('🌐 SUPABASE: User email:', userEmail);
      console.log('🌐 SUPABASE: User ID:', userId);
      
      await client.setCurrentUser(userEmail, userId);
      console.log('✅ SUPABASE: User set successfully');
      
      await client.joinPage(pageId, pageUrl);
      console.log('✅ SUPABASE: Joined page with real-time updates');
      console.log('✅ SUPABASE: Real-time subscriptions should now be active');
    } catch (error) {
      console.error('❌ SUPABASE: Failed to join page:', error);
      console.error('❌ SUPABASE: Error details:', error.message);
      console.error('❌ SUPABASE: This will cause real-time features to fail');
    }
  } else {
    console.error('❌ SUPABASE: No real-time client available for page join');
    console.error('❌ SUPABASE: Real-time features will not work');
  }
}

async function broadcastAuraColorChange(color) {
  if (supabaseRealtimeClient) {
    await supabaseRealtimeClient.broadcastAuraColorChange(color);
    console.log('🎨 SUPABASE: Aura color change broadcasted');
  }
}

async function sendMessageViaSupabase(content) {
  console.log('🔥🔥🔥 ============================================');
  console.log('🔥🔥🔥 SEND_MESSAGE_VIA_SUPABASE: ENTRY POINT');
  console.log('🔥🔥🔥 ============================================');
  console.log('📡 SUPABASE_MESSAGE: Starting real-time message broadcast...');
  console.log('📡 SUPABASE_MESSAGE: Content:', content);
  console.log('📡 SUPABASE_MESSAGE: Content type:', typeof content);
  console.log('📡 SUPABASE_MESSAGE: Content length:', content?.length);
  
  // Use robust integration system if available
  console.log('📡 SUPABASE_MESSAGE: Checking robust integration...');
  console.log('📡 SUPABASE_MESSAGE: window.robustIntegration exists:', !!window.robustIntegration);
  console.log('📡 SUPABASE_MESSAGE: window.robustIntegration.isInitialized:', window.robustIntegration?.isInitialized);
  
  if (window.robustIntegration && window.robustIntegration.isInitialized) {
    console.log('📡 SUPABASE_MESSAGE: Using robust integration system...');
    try {
      const messageData = await window.robustIntegration.sendMessage(content);
      if (messageData) {
        console.log('📡 SUPABASE_MESSAGE: ✅ Robust integration message sent successfully');
        console.log('📡 SUPABASE_MESSAGE: Message data returned:', messageData);
        return messageData;
      } else {
        console.log('📡 SUPABASE_MESSAGE: ❌ Robust integration message failed');
        return false;
      }
    } catch (error) {
      console.log('📡 SUPABASE_MESSAGE: ❌ Robust integration error:', error);
      return false;
    }
  }
  
  // Fallback to legacy system
  console.log('📡 SUPABASE_MESSAGE: Using legacy system...');
  console.log('📡 SUPABASE_MESSAGE: Supabase client available:', !!supabaseRealtimeClient);
  console.log('📡 SUPABASE_MESSAGE: Window supabase client available:', !!window.supabaseRealtimeClient);
  console.log('📡 SUPABASE_MESSAGE: window.supabaseRealtimeClient type:', typeof window.supabaseRealtimeClient);
  
  const client = window.supabaseRealtimeClient || supabaseRealtimeClient;
  console.log('📡 SUPABASE_MESSAGE: Using client:', !!client);
  console.log('📡 SUPABASE_MESSAGE: Client type:', typeof client);
  console.log('📡 SUPABASE_MESSAGE: Client has sendMessage method:', typeof client?.sendMessage);
  
  if (client) {
    console.log('✅ SUPABASE_MESSAGE: Client is available');
    try {
      console.log('📡 SUPABASE_MESSAGE: About to call client.sendMessage...');
      console.log('📡 SUPABASE_MESSAGE: Timestamp before call:', new Date().toISOString());
      const messageData = await client.sendMessage(content);
      console.log('📡 SUPABASE_MESSAGE: Timestamp after call:', new Date().toISOString());
      console.log('💬 SUPABASE: ✅ Message sent via real-time');
      console.log('💬 SUPABASE: ✅ Returned messageData:', messageData);
      console.log('💬 SUPABASE: ✅ messageData type:', typeof messageData);
      console.log('💬 SUPABASE: ✅ messageData is null:', messageData === null);
      console.log('💬 SUPABASE: ✅ messageData id:', messageData?.id);
      return messageData; // Return the message with its UUID
    } catch (error) {
      console.log('💬 SUPABASE: ❌ Error sending via Supabase real-time:', error);
      console.log('💬 SUPABASE: ❌ Error type:', typeof error);
      console.log('💬 SUPABASE: ❌ Error message:', error?.message);
      console.log('💬 SUPABASE: ❌ Error stack:', error?.stack);
      console.log('💬 SUPABASE: ❌ Full error object:', JSON.stringify(error, null, 2));
      return null;
    }
  } else {
    console.log('❌ SUPABASE_MESSAGE: Client is NOT available');
    console.log('💬 SUPABASE: ❌ Supabase real-time client not available');
    console.log('💬 SUPABASE: ❌ supabaseRealtimeClient:', !!supabaseRealtimeClient);
    console.log('💬 SUPABASE: ❌ window.supabaseRealtimeClient:', !!window.supabaseRealtimeClient);
    return null;
  }
  
  // CRITICAL FIX: Use ONLY Supabase real-time for message propagation
  // Removed WebSocket system to prevent conflicts and duplicate messages
}

function updateUserAuraInUI(userEmail, auraColor) {
  try {
    const timer = realtimeLogger.startTimer('aura_ui_update');
    realtimeLogger.startFlow('aura_ui_update', { userEmail, auraColor, timestamp: Date.now() });
    
    realtimeLogger.aura('info', 'Starting aura color UI update', {
      userEmail,
      auraColor,
      isCurrentUser: window.currentUser?.email === userEmail
    });
    
    // Update message avatars for this user
    realtimeLogger.stepFlow('aura_ui_update', 'Updating message avatars');
    const messageContainers = document.querySelectorAll('.message');
    let messageAvatarsUpdated = 0;
    
    realtimeLogger.aura('debug', 'Found message containers', { count: messageContainers.length });
    
    messageContainers.forEach((messageContainer, index) => {
      const avatarContainer = messageContainer.querySelector('.avatar-container');
      if (avatarContainer) {
        const messageId = messageContainer.getAttribute('data-message-id');
        if (messageId) {
          const messageData = window.currentChatData?.find(msg => msg.id === messageId);
          if (messageData && messageData.author && messageData.author.email === userEmail) {
            // Update the author's aura color
            messageData.author.auraColor = auraColor;
            
            // Re-render the avatar
            const newAvatarHTML = getSenderAvatar(messageData.author);
            avatarContainer.innerHTML = newAvatarHTML;
            
            messageAvatarsUpdated++;
            realtimeLogger.aura('debug', 'Updated message avatar', {
              messageId,
              userEmail,
              auraColor,
              avatarIndex: index
            });
          }
        }
      }
    });
    
    realtimeLogger.aura('info', 'Message avatars update complete', {
      totalContainers: messageContainers.length,
      avatarsUpdated: messageAvatarsUpdated
    });
    
    // Update visibility avatars
    realtimeLogger.stepFlow('aura_ui_update', 'Refreshing visibility avatars');
    refreshVisibilityAvatars();
    
    // Update profile avatar if it's the current user
    const currentUser = window.currentUser || {};
    if (currentUser.email === userEmail) {
      realtimeLogger.stepFlow('aura_ui_update', 'Updating profile avatar for current user');
      const profileAvatarContainer = document.getElementById('user-avatar-container');
      if (profileAvatarContainer) {
        // Update profile avatar with new aura color
        const newProfileAvatarHTML = AvatarUtils.createUnifiedAvatar({
          id: currentUser.id || currentUser.email,
          userId: currentUser.id || currentUser.email,
          name: currentUser.name || currentUser.email,
          email: currentUser.email,
          avatarUrl: currentUser.avatarUrl,
          auraColor: auraColor,
        }, {
          size: 24,
          showAura: true,
          showStatus: false,
          context: 'profile'
        });
        
        // Set the HTML directly on the container
        profileAvatarContainer.innerHTML = newProfileAvatarHTML;
        realtimeLogger.aura('info', 'Profile avatar updated using unified avatar', {
          userEmail,
          auraColor
        });
        console.log('🎨 Updated profile avatar for current user with aura ' + auraColor);
      }
    }
    
    Logger.debug(`Aura color update complete: ${messageAvatarsUpdated} message avatars updated`, null, 'avatar');
    realtimeLogger.endFlow('aura_ui_update', true, { messageAvatarsUpdated });
  } catch (error) {
    console.error('❌ AURA_UI_UPDATE: Error updating aura in UI:', error);
    realtimeLogger.error('AURA_UI_UPDATE', 'Error updating aura in UI', { error: error.message, stack: error.stack });
    realtimeLogger.endFlow('aura_ui_update', false, { error: error.message });
  }
}

// Mutex to prevent multiple simultaneous visibility refreshes
let isRefreshingVisibility = false;

async function refreshVisibilityAvatars() {
  // Prevent multiple simultaneous refreshes
  if (isRefreshingVisibility) {
    console.log('🔄 REFRESH_VISIBILITY: Already refreshing, skipping duplicate call');
    return;
  }
  
  isRefreshingVisibility = true;
  console.log('🔄 REFRESH_VISIBILITY: === STARTING VISIBILITY REFRESH ===');
  
  // CRITICAL FIX: Use window variables for global access
  const client = window.supabaseRealtimeClient || supabaseRealtimeClient;
  const pageId = window.currentUrlData?.pageId || currentPageId;
  
  console.log('🔄 REFRESH_VISIBILITY: Client available:', !!client);
  console.log('🔄 REFRESH_VISIBILITY: Page ID:', pageId);
  console.log('🔄 REFRESH_VISIBILITY: Current URL data:', window.currentUrlData);
  
  // CRITICAL FIX: State synchronization check
  console.log('🔄 REFRESH_VISIBILITY: === STATE SYNCHRONIZATION CHECK ===');
  Logger.debug(`REFRESH_VISIBILITY: window.currentUrlData?.pageId: ${window.currentUrlData?.pageId}`, null, 'general');
  Logger.debug(`REFRESH_VISIBILITY: currentPageId: ${currentPageId}`, null, 'general');
  Logger.debug(`REFRESH_VISIBILITY: client.currentPage?.pageId: ${client?.currentPage?.pageId}`, null, 'general');
  
  // CRITICAL FIX: Synchronize state if inconsistent
  if (client && window.currentUrlData?.pageId && client.currentPage?.pageId !== window.currentUrlData.pageId) {
    console.log('🔄 REFRESH_VISIBILITY: 🔧 SYNCHRONIZING STATE - Updating client.currentPage');
    client.currentPage = {
      pageId: window.currentUrlData.pageId,
      pageUrl: window.currentUrlData.normalizedUrl
    };
    Logger.success(`🔄 REFRESH_VISIBILITY: State synchronized: ${client.currentPage.pageId}`, null, 'general');
  }
  
  if (client && pageId) {
    console.log('🔄 REFRESH_VISIBILITY: === STARTING ENHANCED VISIBILITY REFRESH ===');
    Logger.debug(`REFRESH_VISIBILITY: Page ID: ${pageId}`, null, 'general');
    Logger.debug(`REFRESH_VISIBILITY: Client: ${client ? 'Available' : 'Missing'}`, null, 'general');
    Logger.debug(`REFRESH_VISIBILITY: PageId: ${pageId ? 'Available' : 'Missing'}`, null, 'general');
    
    const users = await client.getPageUsers(pageId);
    console.log('👁️ REFRESH_VISIBILITY: Enhanced query returned users:', users.length);
    console.log('👁️ REFRESH_VISIBILITY: Users:', users.map(u => `${u.user_email} (${u.is_active ? 'ACTIVE' : 'INACTIVE'})`));
    
    if (users && users.length > 0) {
      // CRITICAL FIX: Use the enhanced query results directly instead of calling loadCombinedAvatars
      console.log('🔄 REFRESH_VISIBILITY: Processing enhanced query results...');
      
            // SD1 CRITICAL FIX: Use the EXACT same avatar system that works for profile avatars
            console.log('🔄 REFRESH_VISIBILITY: === USING PROFILE AVATAR SYSTEM ===');
            console.log('🔄 REFRESH_VISIBILITY: Using the SAME system that works for profile avatars...');
            
            const usersWithAvatars = await Promise.all(users.map(async (user) => {
              let avatarUrl = null;
              let userName = user.user_email.split('@')[0];
              let userHandle = user.user_email.split('@')[0];
              let avatarSource = 'none';
              
              Logger.debug(`SD1 AVATAR: Processing user ${user.user_email} using AvatarUtils`, null, 'general');
              
              try {
                // Use AvatarUtils for consistent avatar URL fetching
                const avatarData = AvatarUtils.getAvatarUrl(user, 'visibility');
                avatarUrl = avatarData.avatarUrl;
                userName = avatarData.userName;
                avatarSource = avatarData.source;
                
                Logger.debug(`SD1 AVATAR RESULT: ${user.user_email} - avatarUrl: ${avatarUrl}, source: ${avatarSource}, name: ${userName}`, null, 'general');
              } catch (error) {
                Logger.error(`❌ SD1 AVATAR: Exception processing ${user.user_email}:`, error, 'general');
                
                // Fallback if AvatarUtils fails
                avatarUrl = `https://lh3.googleusercontent.com/a/default-user=s96-c`;
                avatarSource = 'fallback';
                Logger.warn(`SD1 FALLBACK: Using generic avatar for ${user.user_email}: ${avatarUrl}`, null, 'general');
              }
              
              return {
                id: user.user_email,
                userId: user.user_email,
                email: user.user_email,
                name: userName,
                handle: userHandle,
                avatarUrl: avatarUrl,
                auraColor: user.aura_color || '#aaaaaa',
                communityId: 'comm-001',
                communityName: 'Community comm-001',
                lastSeen: user.last_seen,
                availability: null,
                customLabel: null,
                enterTime: user.enter_time,
                isActive: user.is_active,
                status: user.is_active ? 'online' : 'offline',
                avatarSource: avatarSource
              };
            }));
      
      console.log('🔄 REFRESH_VISIBILITY: Users with avatars fetched:', usersWithAvatars.length);
      const formattedUsers = usersWithAvatars;
      
      console.log('🔄 REFRESH_VISIBILITY: Formatted users for UI:', formattedUsers.length);
      
      // Store globally for profile avatar lookup
      window.currentVisibilityDataUnfiltered = formattedUsers;
      
      // Update the UI with enhanced query results
      if (typeof updateVisibleTab === 'function') {
        console.log('🔄 REFRESH_VISIBILITY: Calling updateVisibleTab with enhanced data...');
        console.log('🔄 REFRESH_VISIBILITY: Users to display:', formattedUsers.map(u => `${u.email} (${u.status})`));
        
        // SD1 ENHANCED: Verify DOM elements before and after update
        const beforeElements = document.querySelectorAll('.avatar-container, .user-avatar, .presence-avatar');
        console.log('🔄 REFRESH_VISIBILITY: DOM elements before update:', beforeElements.length);
        
        updateVisibleTab(formattedUsers);
        
        // SD1 ENHANCED: Verify DOM elements after update
        setTimeout(() => {
          const afterElements = document.querySelectorAll('.avatar-container, .user-avatar, .presence-avatar');
          console.log('🔄 REFRESH_VISIBILITY: DOM elements after update:', afterElements.length);
          console.log('🔄 REFRESH_VISIBILITY: Elements changed:', afterElements.length !== beforeElements.length);
          
          // Check if avatars are actually visible
          const visibleAvatars = document.querySelectorAll('.avatar-container:not([style*="display: none"])');
          console.log('🔄 REFRESH_VISIBILITY: Visible avatars:', visibleAvatars.length);
          
          if (visibleAvatars.length === 0 && formattedUsers.length > 0) {
            console.error('❌ REFRESH_VISIBILITY: CRITICAL - No avatars visible despite users found!');
            console.error('❌ REFRESH_VISIBILITY: This indicates a DOM update issue');
          } else {
            console.log('✅ REFRESH_VISIBILITY: UI updated successfully with enhanced query results');
          }
        }, 100);
      } else {
        console.error('❌ REFRESH_VISIBILITY: updateVisibleTab function not available');
      }
    } else {
      console.log('⚠️ REFRESH_VISIBILITY: No users found, clearing visibility');
      if (typeof updateVisibleTab === 'function') {
        updateVisibleTab([]);
      }
    }
    
    console.log('✅ REFRESH_VISIBILITY: Enhanced visibility refresh complete');
  } else {
    console.error('❌ REFRESH_VISIBILITY: Missing supabaseRealtimeClient or currentPageId');
    console.error(`❌ REFRESH_VISIBILITY: Client available: ${!!client}`);
    console.error(`❌ REFRESH_VISIBILITY: PageId available: ${!!pageId}`);
    console.error(`❌ REFRESH_VISIBILITY: window.supabaseRealtimeClient: ${!!window.supabaseRealtimeClient}`);
    console.error(`❌ REFRESH_VISIBILITY: window.currentUrlData: ${!!window.currentUrlData}`);
    console.error(`❌ REFRESH_VISIBILITY: window.currentUrlData?.pageId: ${window.currentUrlData?.pageId}`);
  }
  
  // Clear mutex
  isRefreshingVisibility = false;
}

// Make updateVisibleTab globally accessible
window.updateVisibleTab = updateVisibleTab;

// CRITICAL FIX: Expose refreshVisibilityAvatars globally for real-time handler
window.refreshVisibilityAvatars = refreshVisibilityAvatars;

// ===== USER SETTINGS FOR THRESHOLD CONFIGURATION =====

// Set Last Seen threshold (user-configurable)
window.setLastSeenThreshold = function(days) {
  try {
    if (window.configManager) {
      window.configManager.setLastSeenThreshold(days);
      Logger.info(`🔧 USER SETTINGS: Last seen threshold set to ${days} days`, null, 'general');
      
      // Refresh visibility to apply new threshold
      if (typeof window.refreshVisibilityAvatars === 'function') {
        window.refreshVisibilityAvatars();
        console.log('🔧 USER SETTINGS: Visibility refreshed with new threshold');
      }
    } else {
      console.error('❌ USER SETTINGS: ConfigManager not available');
    }
  } catch (error) {
    console.error('❌ USER SETTINGS: Error setting threshold:', error);
  }
};

// Get current Last Seen threshold
window.getLastSeenThreshold = function() {
  try {
    if (window.configManager) {
      const thresholdMs = window.configManager.getLastSeenThreshold();
      const days = Math.floor(thresholdMs / (24 * 60 * 60 * 1000));
      
      Logger.info(`🔧 USER SETTINGS: Current threshold: ${days} days`, null, 'general');
      return { days, totalMs: thresholdMs };
    } else {
      console.error('❌ USER SETTINGS: ConfigManager not available');
      return null;
    }
  } catch (error) {
    console.error('❌ USER SETTINGS: Error getting threshold:', error);
    return null;
  }
};

// Load user settings on startup
window.loadUserSettings = async function() {
  try {
    if (window.configManager) {
      await window.configManager.loadUserSettings();
      console.log('🔧 USER SETTINGS: User settings loaded');
    }
  } catch (error) {
    console.error('❌ USER SETTINGS: Error loading user settings:', error);
  }
};

// ===== END SUPABASE INTEGRATION =====

// ===== ERROR DIAGNOSTIC FUNCTIONS =====

// Diagnostic function to check for JavaScript errors
window.diagnoseJavaScriptErrors = function() {
  console.log('\n🔍 === JAVASCRIPT ERROR DIAGNOSTIC ===');
  
  // Check for common error sources
  const errorSources = [
    'websocket-diagnostic.js',
    'test-realtime-events.js', 
    'comprehensive-realtime-diagnostics.js',
    'sidepanel.js'
  ];
  
  console.log('🔍 Checking for error sources:', errorSources);
  
  // Check if critical functions are available
  const criticalFunctions = [
    'window.configManager',
    'window.refreshVisibilityAvatars',
    'window.setLastSeenThreshold',
    'window.getLastSeenThreshold'
  ];
  
  console.log('\n🔍 Checking critical functions:');
  criticalFunctions.forEach(func => {
    const available = eval(`typeof ${func} !== 'undefined'`);
    Logger.success(`   ${func}: ${available ? 'Available' : '❌ Missing'}`, null, 'general');
  });
  
  // Check for uncaught errors in console
  console.log('\n🔍 Checking console for errors...');
  console.log('   Look for "Uncaught" errors in the console above');
  console.log('   Check for missing dependencies or syntax errors');
  
  return {
    status: 'COMPLETE',
    errorSources: errorSources,
    criticalFunctions: criticalFunctions
  };
};

// Safe wrapper for all diagnostic functions
window.safeDiagnostic = function(diagnosticFunction, ...args) {
  try {
    Logger.debug(`Running diagnostic: ${diagnosticFunction.name}`, null, 'general');
    return diagnosticFunction(...args);
  } catch (error) {
    console.error(`❌ Diagnostic failed: ${diagnosticFunction.name}`, error);
    return { status: 'FAILED', error: error.message };
  }
};

// ===== DEBUGGING FUNCTIONS =====
// Test function to debug visibility issues
window.testVisibilitySystem = async function() {
  console.log('🔍 DEBUG: Testing visibility system...');
  
  try {
    // Get current user info
    const currentUser = await getCurrentUserEmail();
    console.log('🔍 DEBUG: Current user email:', currentUser);
    
    // Get current URL
    const urlData = await normalizeCurrentUrl();
    console.log('🔍 DEBUG: Current URL data:', urlData);
    
    // Test Supabase real-time query
    console.log('🔍 DEBUG: Testing Supabase real-time query...');
    const { data: presenceData, error } = await supabase
      .from('user_presence')
      .select('*')
      .eq('page_url', urlData.normalizedUrl)
      .eq('is_active', true);
    
    if (error) throw error;
    console.log('🔍 DEBUG: Supabase response:', JSON.stringify(presenceData, null, 2));
    
    if (presenceData && presenceData.length > 0) {
      console.log('🔍 DEBUG: Found', presenceData.length, 'active users');
      presenceData.forEach((user, index) => {
        Logger.debug(`DEBUG: User ${index + 1}:`, {
          id: user.id,
          userId: user.userId,
          name: user.name,
          email: user.email,
          avatarUrl: user.avatarUrl,
          isCurrentUser: user.userId === currentUser || user.email === currentUser
        }, 'general');
      });
    }
    
    // Test loadCombinedAvatars
    console.log('🔍 DEBUG: Testing loadCombinedAvatars...');
    await loadCombinedAvatars(['comm-001', 'comm-002']);
    
    console.log('🔍 DEBUG: Visibility system test complete');
  } catch (error) {
    console.error('🔍 DEBUG: Error testing visibility system:', error);
  }
};

// Test function to force refresh visibility
window.refreshVisibility = async function() {
  console.log('🔍 DEBUG: Force refreshing visibility...');
  try {
    const activeCommunities = ['comm-001', 'comm-002'];
    await loadCombinedAvatars(activeCommunities);
    console.log('🔍 DEBUG: Visibility refresh complete');
  } catch (error) {
    console.error('🔍 DEBUG: Error refreshing visibility:', error);
  }
};

// ===== EXTENSION RELOAD & BUILD TRACKING =====
const EXTENSION_BUILD = '2025-10-14-enhanced-logging'; // Updated: Enhanced logging for inactive user visibility debugging + avatar filter fix
const BACKEND_EXPECTED_VERSION = '1.2.4-urlnorm-fix';
const RELOAD_TIMESTAMP = new Date().toISOString();
console.log('🚀 EXTENSION RELOADED:', {
  build: EXTENSION_BUILD,
  timestamp: RELOAD_TIMESTAMP,
  expectedBackend: BACKEND_EXPECTED_VERSION,
  userAgent: navigator.userAgent,
  location: window.location.href
});
console.log('🔍 BUILD VERIFICATION: Extension version', EXTENSION_BUILD, 'loaded at', RELOAD_TIMESTAMP);
console.log('🔍 BUILD VERIFICATION: Expected backend version:', BACKEND_EXPECTED_VERSION);

// Clear URL normalization cache on extension reload to prevent stale data
// (Function will be defined later in the file)

// Avatar Background Color Configuration
const AVATAR_BG_CONFIG = {
  // Default background color for user's profile avatar when transparent
  defaultBgColor: null, // Will be set dynamically based on user's name
  
  // User's custom background color
  customBgColor: null,
  
  // Get the current background color (which should ALWAYS be the aura color)
  getBgColor() {
    if (this.customBgColor) {
      return this.customBgColor;
    }
    
    // If no custom color, get the current aura color from the user
    // The background color should ALWAYS match the aura color
    const currentUser = window.currentUser;
    if (currentUser && currentUser.auraColor) {
      return currentUser.auraColor;
    }
    
    // Fallback to default aura color
    // Use user's actual aura color from database, fallback to default
    const userAuraColor = window.currentUser?.auraColor || '#aa00aa';
    return userAuraColor;
  },
  
  // Set custom background color
  setBgColor(color) {
    this.customBgColor = color;
  },
  
  // Reset to default background color
  resetToDefault() {
    this.customBgColor = null;
  }
};

// API client for Meta-Layer Initiative
class MetaLayerAPI {
  constructor(baseURL) {
    this.baseURL = baseURL;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    
    // Get current user info to send in headers - use AuthManager
    const user = await authManager.getCurrentUser();
    
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...(user && {
          'X-User-Email': user.email,
          'X-User-Name': user.name || user.user_metadata?.full_name,
          'X-User-Avatar': user.user_metadata?.avatar_url || user.picture
        }),
        ...options.headers
      },
      ...options
    };

    try {
      const response = await fetch(url, config);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  async getCommunities() {
    // Get current user to filter communities by membership - use AuthManager
    const user = await authManager.getCurrentUser();
    const userId = user?.email || user?.id;
    
    const url = userId ? `/communities?userId=${encodeURIComponent(userId)}` : '/communities';
    return this.request(url);
  }

  async getAvatars(communityId) {
    return this.request(`/avatars/active?communityId=${communityId}`);
  }

  async getPresenceByUrl(url, communityIds = null) {
    console.log('🔍 API: getPresenceByUrl called with URL:', url, 'communities:', communityIds);
    const params = new URLSearchParams({ url });
    if (communityIds && communityIds.length > 0) {
      params.append('communityIds', communityIds.join(','));
    }
    
    // Get current user for authentication
    let user = await authManager.getCurrentUser();
    if (!user && typeof window.realGoogleAuth !== 'undefined' && window.realGoogleAuth.getCurrentUser) {
      user = await window.realGoogleAuth.getCurrentUser();
      console.log('🔍 API: Using realGoogleAuth user for authentication:', user?.email);
    } else {
      console.log('🔍 API: Using user for authentication:', user?.email);
    }
    
    const response = await this.request(`/v1/presence/url?${params.toString()}`, { user });
    console.log('🔍 API: getPresenceByUrl response:', JSON.stringify(response, null, 2));
    return response;
  }

  async getPresenceByCommunities(communityIds) {
    console.log('🔍 API: getPresenceByCommunities called with communities:', communityIds);
    const params = new URLSearchParams({ communityIds: communityIds.join(',') });
    
    // Get current user for authentication
    let user = await authManager.getCurrentUser();
    if (!user && typeof window.realGoogleAuth !== 'undefined' && window.realGoogleAuth.getCurrentUser) {
      user = await window.realGoogleAuth.getCurrentUser();
      console.log('🔍 API: Using realGoogleAuth user for authentication:', user?.email);
    } else {
      console.log('🔍 API: Using user for authentication:', user?.email);
    }
    
    const response = await this.request(`/v1/presence/communities?${params.toString()}`, { user });
    console.log('🔍 API: getPresenceByCommunities response:', JSON.stringify(response, null, 2));
    return response;
  }

  async login() {
    return this.request('/auth/login', { method: 'POST' });
  }

  async getMe() {
    return this.request('/auth/me');
  }

  async sendMessage(userEmail, communityId, content, uri = null, parentId = null, threadId = null, optionalContent = null) {
    // Simplified to use the working /chat/message endpoint with email-based identification
    return this.request('/chat/message', {
      method: 'POST',
      body: JSON.stringify({
        userEmail: userEmail,
        communityId: communityId,
        content: content,
        uri: uri,
        parentId: parentId
      })
    });
  }

  async getChatHistory(communityId, threadId = null, uri = null) {
    // Use Supabase directly instead of backend API
    Logger.debug(`CHAT_API: getChatHistory called with communityId=${communityId}, threadId=${threadId}, uri=${uri}`, null, 'general');
    Logger.debug(`CHAT_API: uri type: ${typeof uri}, value: ${JSON.stringify(uri)}`, null, 'general');
    
    if (!communityId) {
      console.error('❌ CHAT_API: communityId is required');
      return { conversations: [], messages: [] };
    }
    
    // Use Supabase directly instead of backend API
    if (!window.supabase || !window.supabase.from) {
      console.error('❌ CHAT_API: No Supabase client available');
      return { conversations: [], messages: [] };
    }
    
    try {
      // Get pageId from URI if provided
      let pageId = null;
      if (uri) {
        // Use the same URL normalization logic as the backend
        const normalizedUrl = await window.normalizeUrl(uri);
        pageId = normalizedUrl.pageId;
      }
      
      console.log(`🔍 CHAT_API: Querying Supabase messages table for pageId: ${pageId}`);
      
      // Query Supabase messages table directly
      let query = window.supabase.from('messages').select('*');
      if (pageId) {
        query = query.eq('page_id', pageId);
      }
      if (communityId) {
        query = query.eq('community_id', communityId);
      }
      const { data: messages, error: messagesError } = await query.order('created_at', { ascending: true });
      
      if (messagesError) {
        console.error('❌ CHAT_API: Supabase query failed:', messagesError);
        return { conversations: [], messages: [] };
      }
      
      console.log(`🔍 CHAT_API: Found ${messages?.length || 0} messages in Supabase`);
      
      // Convert Supabase messages to API format
      const msgs = messages?.map(msg => ({
        id: msg.id,
        body: msg.content, // Use content field, not body
        authorId: msg.user_email,
        conversationId: `conv-${communityId}-${pageId}`,
        createdAt: msg.created_at,
        updatedAt: msg.updated_at,
        author: {
          id: msg.user_email,
          name: msg.user_email,
          handle: msg.user_email.split('@')[0],
          avatarUrl: null,
          email: msg.user_email,
          auraColor: window.currentUser?.auraColor || '#aa00aa'
        },
        conversation: {
          id: `conv-${communityId}-${pageId}`,
          communityId: communityId
        }
      })) || [];
      
      console.log(`🔍 CHAT_API: Converted ${msgs.length} messages`);
      
      // Transform messages into conversation format expected by frontend
      const conversationsMap = new Map();
      
      for (const msg of msgs) {
        const convId = msg.conversationId;
        if (!conversationsMap.has(convId)) {
          conversationsMap.set(convId, {
            id: convId,
            communityId: msg.conversation.communityId,
            posts: []
          });
        }
        
        // Transform message to post format
        const post = {
          id: msg.id,
          parentId: null, // Supabase messages don't have parentId
          conversationId: msg.conversationId,
          authorId: msg.authorId,
          body: msg.body,
          createdAt: msg.createdAt,
          editedAt: msg.updatedAt,
          author: msg.author,
          conversation: msg.conversation
        };
        
        conversationsMap.get(convId).posts.push(post);
      }
      
      const conversations = Array.from(conversationsMap.values());
      console.log(`✅ CHAT_API: Returning ${conversations.length} conversations with ${msgs.length} total messages`);
      
      return { 
        conversations,
        timestamp: new Date().toISOString(),
        cacheBust: Date.now()
      };
      
    } catch (error) {
      console.error('❌ CHAT_API: Error fetching messages from Supabase:', error);
      return { conversations: [], messages: [] };
    }
  }

  async getThreads(communityId) {
    return this.request(`/chat/threads?communityId=${communityId}`);
  }

  async editMessage(messageId, newContent) {
    // Use new Canopi 2 post system
    return this.request(`/v1/posts/${messageId}`, {
      method: 'PUT',
      body: JSON.stringify({ body: newContent })
    });
  }

  async deleteMessage(messageId) {
    // Use new Canopi 2 post system
    return this.request(`/v1/posts/${messageId}`, {
      method: 'DELETE'
    });
  }

  async toggleReaction(kind, postId = null, conversationId = null, emoji = null) {
    // Use new Canopi 2 reaction system
    return this.request('/v1/reactions', {
      method: 'POST',
      body: JSON.stringify({ 
        kind, 
        postId, 
        conversationId,
        emoji 
      })
    });
  }

  async getReactions(postId = null, conversationId = null) {
    // Use new Canopi 2 reaction system
    const params = new URLSearchParams();
    if (postId) {
      params.append('targetId', postId);
      params.append('targetType', 'post');
    } else if (conversationId) {
      params.append('targetId', conversationId);
      params.append('targetType', 'conversation');
    }
    
    return this.request(`/v1/reactions?${params.toString()}`);
  }
}

// Initialize API client
const api = new MetaLayerAPI(METALAYER_API_URL);

// Initialize YouTube Transcription Service (from main branch)
const youtubeService = new YouTubeTranscriptionService();
// Make API globally available for debugging
window.api = api;

// Initialize Loosely Coupled Auth Manager
const authManager = new AuthManager(); 

// === DEBUGGING: Check API connection ===
console.log('Meta-Layer Initiative API initialized');
console.log('API URL:', METALAYER_API_URL);
// === END DEBUGGING ===

// Debug function (moved from HTML)
function debug(message) {
  const debugContent = document.getElementById('debug-content');
  if (debugContent) {
    const time = new Date().toLocaleTimeString();
    debugContent.innerHTML += `<div>${time}: ${message}</div>`;
    debugContent.scrollTop = debugContent.scrollHeight;
  }
  console.log(message); // Always log to console
}

function toggleDebugPanel() {
  const debugContent = document.getElementById('debug-content');
  const debugToggle = document.getElementById('debug-toggle');
  
  if (debugContent && debugToggle) {
    if (debugContent.style.display === 'none') {
      debugContent.style.display = 'block';
      debugToggle.textContent = '▲';
    } else {
      debugContent.style.display = 'none';
      debugToggle.textContent = '▼';
    }
  }
}

function autoResize(textarea) {
  // Reset height to auto to get the natural height
  textarea.style.height = 'auto';
  
  // Calculate the natural height needed
  const naturalHeight = textarea.scrollHeight;
  
  // Set maximum height based on viewport (leave room for context bar and other UI)
  const maxHeight = Math.min(200, window.innerHeight * 0.4); // Max 200px or 40% of viewport
  
  if (naturalHeight <= maxHeight) {
    // Content fits within max height - expand to natural height
    textarea.style.height = naturalHeight + 'px';
    textarea.style.overflowY = 'hidden';
  } else {
    // Content exceeds max height - set max height and enable scrolling
    textarea.style.height = maxHeight + 'px';
    textarea.style.overflowY = 'auto';
  }
}

// --- Authentication Check Functions ---
async function requireAuth(action, callback) {
  try {
    // Check window.currentUser from direct authentication
    const currentUser = window.currentUser;
    
    console.log('[AUTH] requireAuth called for:', action, 'currentUser:', currentUser);
    debug(`requireAuth called for: ${action}, currentUser: ${currentUser ? 'exists' : 'null'}`);
    
    if (!currentUser) {
      console.log('No user found, showing auth prompt');
      showAuthPrompt(action);
      return false;
    }
    console.log('User found, executing callback');
    if (callback) callback();
    return true;
  } catch (error) {
    console.log('Error checking auth, showing auth prompt');
    showAuthPrompt(action);
    return false;
  }
}

function showAuthPrompt(action) {
  console.log('showAuthPrompt called for:', action);
  const authPrompt = document.getElementById('auth-prompt-modal');
  if (!authPrompt) {
    console.log('Creating auth prompt modal');
    createAuthPromptModal();
  }
  
  const actionText = document.getElementById('auth-prompt-action');
  if (actionText) {
    actionText.textContent = action;
  }
  
  // Show which auth provider is available
  const providerName = authManager.currentProvider?.name || 'unknown';
  const providerInfo = document.getElementById('auth-prompt-provider');
  if (providerInfo) {
    providerInfo.textContent = `Using ${providerName} authentication`;
  }
  
  const modal = document.getElementById('auth-prompt-modal');
  if (modal) {
    modal.style.display = 'block';
    console.log('Auth prompt modal displayed');
  } else {
    console.error('Auth prompt modal not found!');
  }
  debug(`Auth required for: ${action} (provider: ${providerName})`);
}

function createAuthPromptModal() {
  const modal = document.createElement('div');
  modal.id = 'auth-prompt-modal';
  modal.className = 'modal';
  modal.style.display = 'none';
  
  modal.innerHTML = `
    <div class="modal-content">
      <div class="modal-header">
        <h3>Authentication Required</h3>
        <button id="close-auth-prompt" class="close-button">&times;</button>
      </div>
      <div class="modal-body">
        <p>You need to sign in to <span id="auth-prompt-action">perform this action</span>.</p>
        <p class="provider-info" id="auth-prompt-provider" style="font-size: 0.9em; color: #666; margin: 10px 0;"></p>
        <div class="auth-prompt-buttons">
          <button id="auth-prompt-google" class="auth-button google">Sign in with Google</button>
          <button id="auth-prompt-magic" class="auth-button magic">Sign in with Magic Link</button>
        </div>
        <button id="auth-prompt-cancel" class="cancel-button">Cancel</button>
      </div>
    </div>
  `;
  
  document.body.appendChild(modal);
  
  // Add event listeners
  document.getElementById('close-auth-prompt').addEventListener('click', () => {
    modal.style.display = 'none';
  });
  
  document.getElementById('auth-prompt-cancel').addEventListener('click', () => {
    modal.style.display = 'none';
  });
  
  document.getElementById('auth-prompt-google').addEventListener('click', () => {
    modal.style.display = 'none';
    signInWithGoogle();
  });
  
  document.getElementById('auth-prompt-magic').addEventListener('click', () => {
    modal.style.display = 'none';
    document.getElementById('magic-link-modal').style.display = 'block';
  });
  
  // Close modal if clicked outside
  modal.addEventListener('click', (event) => {
    if (event.target === modal) {
      modal.style.display = 'none';
    }
  });
}

// --- Community Management Functions ---
async function loadCommunities() {
  try {
    debug('Loading communities...');
    const response = await api.getCommunities();
    const communities = response.communities || response; // Handle both formats
    debug(`Loaded ${communities.length} communities`);
    
    // Update community dropdown
    updateCommunityDropdown(communities);
    
    // Set up active communities and primary community
    if (communities.length > 0) {
      // For now, all communities are active communities
      const activeCommunities = communities.map(c => c.id);
      const primaryCommunity = communities[0].id; // First community is primary
      
      // Store active communities and primary community
      chrome.storage.local.set({ 
        activeCommunities: activeCommunities,
        primaryCommunity: primaryCommunity,
        currentCommunity: primaryCommunity, // For backward compatibility
        communities: communities // Store communities for name lookup
      });
      
      // Normalize the current URL ONCE at startup
      const initialUrlData = await normalizeCurrentUrl();
      window.currentUrlData = initialUrlData; // CRITICAL: Set global state
      console.log('🔄 STARTUP: URL normalized for initial load');
      console.log('🔄 STARTUP: window.currentUrlData set to:', initialUrlData.pageId);
      
      // Wait for authentication before loading avatars
      console.log('🔍 INIT: Waiting for authentication before loading avatars...');
      let authAttempts = 0;
      const maxAuthAttempts = 10;
      
      while (authAttempts < maxAuthAttempts) {
        try {
          const currentUser = await getCurrentUserEmail();
          if (currentUser && currentUser !== 'undefined' && currentUser !== null) {
            console.log('🔍 INIT: Authentication confirmed, loading avatars...');
            break;
          }
        } catch (error) {
          Logger.debug(`INIT: Authentication not ready, attempt ${authAttempts + 1}/${maxAuthAttempts}... (${error.message})`, null, 'general');
        }
        await new Promise(resolve => setTimeout(resolve, 500)); // Wait 500ms
        authAttempts++;
      }
      
      // Load combined avatars from all active communities (uses normalized URL)
      try {
        await loadCombinedAvatars(activeCommunities);
      } catch (error) {
        console.log('🔍 INIT: loadCombinedAvatars failed - user needs to authenticate first');
        console.log('🔍 INIT: Skipping avatar loading until user signs in');
        // Don't retry - wait for user to authenticate
      }
      await loadChatHistory(primaryCommunity);
      
      // Update placeholder text with primary community name
      updatePlaceholderText(communities[0].name);
    }
  } catch (error) {
    console.error('Failed to load communities:', error);
    debug(`Failed to load communities: ${error.message}`);
    
    // Fallback: show default community
    updateCommunityDropdown([{ id: 'default', name: 'Main Community' }]);
  }
}

// Load avatars from multiple communities and combine them
async function loadCombinedAvatars(communityIds) {
  try {
    console.log('');
    console.log('═══════════════════════════════════════════════════════════');
    console.log('👥 LOAD_VISIBILITY: === LOADING COMBINED AVATARS ===');
    console.log('═══════════════════════════════════════════════════════════');
    console.log('👥 LOAD_VISIBILITY: Communities:', communityIds);
    console.log('👥 LOAD_VISIBILITY: Timestamp:', new Date().toISOString());
    debug(`Loading combined avatars from communities: ${communityIds.join(', ')}`);
    
    // Get normalized URL for visibility - SAME AS MESSAGES
    console.log('');
    console.log('📊 LOAD_VISIBILITY: Step 1 - Normalizing URL');
    console.log('───────────────────────────────────────────────────────────');
    const urlData = await normalizeCurrentUrl();
    const currentUri = urlData.normalizedUrl; // Use normalized URL for consistency
    console.log('✅ LOAD_VISIBILITY: Normalized URL:', currentUri);
    console.log('✅ LOAD_VISIBILITY: Raw URL:', urlData.rawUrl);
    console.log('✅ LOAD_VISIBILITY: Page ID:', urlData.pageId);
    
    // Try URL-based presence first (more accurate)
    let avatarResponses = [];
    try {
      console.log('');
      console.log('📊 LOAD_VISIBILITY: Step 2 - Fetching active users from backend');
      console.log('───────────────────────────────────────────────────────────');
      console.log('🌐 LOAD_VISIBILITY: Calling API with URL:', currentUri);
      const apiStartTime = Date.now();
      // Load initial presence data via API, then real-time updates will handle changes
      const urlResponse = await api.getPresenceByUrl(currentUri, communityIds);
      const apiEndTime = Date.now();
      Logger.success(`LOAD_VISIBILITY: API responded in ${apiEndTime - apiStartTime}ms`, null, 'general');
      console.log('🔍 LOAD_VISIBILITY: Response structure:', {
        hasActive: !!urlResponse?.active,
        activeCount: urlResponse?.active?.length || 0,
        pageId: urlResponse?.pageId,
        url: urlResponse?.url
      });
      
      if (urlResponse && urlResponse.active && urlResponse.active.length > 0) {
        avatarResponses = [urlResponse];
        console.log('');
        console.log('✅✅✅ LOAD_VISIBILITY: Found active users ✅✅✅');
        console.log('✅ LOAD_VISIBILITY: Count:', urlResponse.active.length);
        
        // Enhanced logging for each active user
        urlResponse.active.forEach((user, index) => {
          Logger.info(`👤 LOAD_VISIBILITY: User ${index + 1}/${urlResponse.active.length}:`, {
            email: user.email,
            name: user.name,
            isActive: user.isActive,
            status: user.status,
            lastSeen: user.lastSeen,
            enterTime: user.enterTime
          }, 'general');
        });
      } else {
        console.log('');
        console.log('⚠️⚠️⚠️ LOAD_VISIBILITY: No active users on this page ⚠️⚠️⚠️');
        console.log('⚠️ LOAD_VISIBILITY: This page has no currently active users');
        console.log('⚠️ LOAD_VISIBILITY: Response:', JSON.stringify(urlResponse, null, 2));
        console.log('🔍 LOAD_VISIBILITY DEBUG: Current user email:', window.currentUser?.email);
        console.log('🔍 LOAD_VISIBILITY DEBUG: Current page ID:', currentPageId);
        console.log('🔍 LOAD_VISIBILITY DEBUG: API URL called:', `https://api.themetalayer.org/presence/by-url?url=${encodeURIComponent(currentUri)}`);
        console.log('🔍 LOAD_VISIBILITY DEBUG: Community IDs:', communityIds);
        console.log('🔍 LOAD_VISIBILITY DEBUG: This suggests the presence tracking is not working properly');
        console.log('🔍 LOAD_VISIBILITY DEBUG: Current user should be present on this page');
        throw new Error('No active users found via URL-based presence');
      }
    } catch (urlError) {
      console.log('🔍 VISIBILITY: URL-based presence failed, falling back to community-based:', urlError.message);
      
          // If it's a 401 error, wait a bit and retry once
          if (urlError.message.includes('401')) {
            console.log('🔍 VISIBILITY: 401 error detected, waiting for authentication and retrying...');
            await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second

            try {
              console.log('🔍 VISIBILITY: Retrying URL-based presence API...');
              const retryResponse = await api.getPresenceByUrl(currentUri, communityIds);
              console.log('🔍 VISIBILITY: Retry response:', JSON.stringify(retryResponse, null, 2));

              if (retryResponse && retryResponse.length > 0) {
                console.log('🔍 VISIBILITY: Retry successful - found', retryResponse.length, 'active users');
                // Convert to expected format
                const formattedResponse = {
                  active: retryResponse.map(user => ({
                    id: user.user_email,
                    userId: user.user_email,
                    email: user.user_email,
                    name: user.user_email.split('@')[0],
                    handle: user.user_email.split('@')[0],
                    avatarUrl: user.avatar_url,
                    auraColor: user.aura_color || '#aaaaaa',
                    communityId: 'comm-001',
                    communityName: 'Community comm-001',
                    lastSeen: user.last_seen,
                    availability: null,
                    customLabel: null,
                    enterTime: user.enter_time,
                    isActive: user.is_active,
                    status: 'online'
                  })),
                  pageId: currentUri.replace(/[^a-zA-Z0-9]/g, '_'),
                  url: currentUri
                };
                avatarResponses = [formattedResponse];
              } else {
                console.log('🔍 VISIBILITY: Retry successful but no active users found');
                throw new Error('No active users found via URL-based presence retry');
              }
            } catch (retryError) {
              console.log('🔍 VISIBILITY: Retry also failed:', retryError.message);
            }
          }
      
      // REMOVED: Community-based presence fallback was causing 400 errors
      // The user_presence table doesn't have a community_id column
      // If URL-based presence fails, show empty list
      if (avatarResponses.length === 0) {
        console.log('🔍 VISIBILITY: URL-based presence failed - showing empty list');
        console.log('🔍 VISIBILITY: No presence data available');
        
        // CRITICAL FIX: Always call updateVisibleTab even with empty data
        if (typeof updateVisibleTab === 'function') {
          console.log('🔄 REFRESH_VISIBILITY: Calling updateVisibleTab with empty data...');
          updateVisibleTab([]);
        } else {
          console.error('❌ REFRESH_VISIBILITY: updateVisibleTab function not available');
        }
        
        return [];
      }
    }
    
    console.log('🔍 VISIBILITY: Final avatar responses from API:', avatarResponses);
    
    // Combine and deduplicate avatars
    const allAvatars = [];
    const seenUsers = new Set();
    
    avatarResponses.forEach((response, index) => {
      const communityId = communityIds[index];
      let avatars;
      
      Logger.debug(`VISIBILITY: Processing response for community ${communityId}:`, response, 'general');
      Logger.debug(`VISIBILITY: Response keys:`, response ? Object.keys(response) : 'null', 'general');
      Logger.debug(`VISIBILITY: Response type:`, typeof response, 'general');
      Logger.debug(`VISIBILITY: Is array:`, Array.isArray(response), 'general');
      
      // Handle different response formats
      if (response && response.avatars && Array.isArray(response.avatars)) {
        avatars = response.avatars;
        Logger.debug(`VISIBILITY: Found ${avatars.length} avatars in response.avatars for ${communityId}`, null, 'general');
      } else if (response && response.active && Array.isArray(response.active)) {
        avatars = response.active;
        Logger.debug(`VISIBILITY: Found ${avatars.length} avatars in response.active for ${communityId}`, null, 'general');
      } else if (Array.isArray(response)) {
        avatars = response;
        Logger.debug(`VISIBILITY: Found ${avatars.length} avatars in direct array for ${communityId}`, null, 'general');
      } else if (response && typeof response === 'object') {
        // Check for other possible structures
        Logger.debug(`VISIBILITY: Checking other object structures for ${communityId}`, null, 'general');
        if (response.users && Array.isArray(response.users)) {
          avatars = response.users;
          Logger.debug(`VISIBILITY: Found ${avatars.length} avatars in response.users for ${communityId}`, null, 'general');
        } else {
          avatars = [];
          Logger.debug(`VISIBILITY: No avatars found in object for ${communityId}, available keys:`, Object.keys(response), 'general');
        }
      } else {
        avatars = [];
        Logger.debug(`VISIBILITY: No avatars found for ${communityId}, response format:`, typeof response, 'general');
      }
      
      // Add community info to each avatar and deduplicate
      avatars.forEach((avatar, avatarIndex) => {
        Logger.debug(`VISIBILITY: Processing avatar ${avatarIndex + 1} from ${communityId}:`, {
          id: avatar.id,
          userId: avatar.userId,
          name: avatar.name,
          handle: avatar.handle,
          email: avatar.email || avatar.userId || avatar.id,
          avatarUrl: avatar.avatarUrl,
          auraColor: avatar.auraColor
        }, 'general');
        
        const userKey = `${avatar.userId || avatar.id}`;
        if (!seenUsers.has(userKey)) {
          seenUsers.add(userKey);
          allAvatars.push({
            ...avatar,
            communityId: communityId,
            communityName: avatar.communityName || `Community ${communityId}`
          });
          Logger.success(`VISIBILITY: Added unique avatar: ${avatar.name || avatar.handle || 'Unknown'} (${userKey}) from ${communityId}`, null, 'general');
        } else {
          Logger.info(`⏭️ VISIBILITY: Skipped duplicate avatar: ${avatar.name || avatar.handle || 'Unknown'} (${userKey}) from ${communityId}`, null, 'general');
        }
      });
    });
    
    Logger.debug(`VISIBILITY: Final combined avatars:`, allAvatars, 'general');
    Logger.debug(`VISIBILITY: Total unique avatars: ${allAvatars.length}`, null, 'general');
    debug(`Combined avatars from ${communityIds.length} communities:`, allAvatars);
    debug(`Total unique avatars: ${allAvatars.length}`);
    
    // Enhanced logging for final avatars before passing to updateVisibleTab
    console.log('🔍 VISIBILITY: Final avatars to be processed by updateVisibleTab:');
    allAvatars.forEach((avatar, index) => {
      Logger.debug(`VISIBILITY: Final avatar ${index + 1}:`, {
        id: avatar.id,
        userId: avatar.userId,
        name: avatar.name,
        handle: avatar.handle,
        email: avatar.email,
        avatarUrl: avatar.avatarUrl,
        auraColor: avatar.auraColor,
        communityId: avatar.communityId
      }, 'general');
    });
    
    // Update the visible tab with combined avatar data
    await updateVisibleTab(allAvatars);
    
    // CRITICAL FIX: Update profile avatar AFTER visibility data is loaded
    // This ensures the profile avatar can access the real avatar URL from window.currentVisibilityDataUnfiltered
    console.log('🔍 PROFILE_AVATAR_REFRESH: Refreshing profile avatar with real data from visibility...');
    if (window.currentUser) {
      console.log('🔍 PROFILE_AVATAR_REFRESH: Current user exists, calling updateUI()...');
      await updateUI(window.currentUser);
      console.log('✅ PROFILE_AVATAR_REFRESH: Profile avatar refreshed with real avatar data');
    } else {
      console.log('⚠️ PROFILE_AVATAR_REFRESH: No current user to refresh');
    }
  } catch (error) {
    console.error('❌ VISIBILITY: Failed to load combined avatars:', error);
    debug(`Failed to load combined avatars: ${error.message}`);
    await updateVisibleTab([]);
  }
}

// Legacy function for backward compatibility - now accepts array of community IDs
async function loadAvatars(communityIds) {
  try {
    // If single community ID passed, convert to array
    if (typeof communityIds === 'string') {
      communityIds = [communityIds];
    }
    
    // If no community IDs provided, get from storage
    if (!communityIds || communityIds.length === 0) {
      const result = await chrome.storage.local.get(['activeCommunities']);
      communityIds = result.activeCommunities || ['comm-001'];
    }
    
    debug(`Loading avatars for communities: ${communityIds.join(', ')}`);
    
    // Use the combined avatars function
    await loadCombinedAvatars(communityIds);
  } catch (error) {
    console.error('Failed to load avatars:', error);
    debug(`Failed to load avatars: ${error.message}`);
  }
}

function updateCommunityDropdown(communities) {
  const communityList = document.querySelector('.community-list');
  if (!communityList) return;
  
  // Clear existing communities
  communityList.innerHTML = '';
  
  // Add communities to the list
  communities.forEach((community, index) => {
    const li = document.createElement('li');
    li.innerHTML = `
      <img src="/images/community${index + 1}.png" alt="Community" data-community-fallback="true">
      <span>${community.name}</span>
      ${index === 0 ? '<span class="primary-tag">Primary</span>' : ''}
    `;
    
    // Add error handler for community image
    const communityImg = li.querySelector('img[data-community-fallback="true"]');
    if (communityImg) {
      communityImg.addEventListener('error', function() {
        this.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHZpZXdCb3g9IjAgMCAyMCAyMCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjIwIiBoZWlnaHQ9IjIwIiBmaWxsPSIjZGRkIi8+Cjx0ZXh0IHg9IjEwIiB5PSIxNCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjEyIiBmaWxsPSIjOTk5IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5DPC90ZXh0Pgo8L3N2Zz4K';
      });
    }
    
    // Add click handler to switch communities
    li.addEventListener('click', () => {
      switchCommunity(community);
    });
    
    communityList.appendChild(li);
  });
}

async function updateVisibleTab(avatars) {
  console.log('🔍 VISIBILITY: updateVisibleTab called with avatars:', JSON.stringify(avatars, null, 2));
  
  // CRITICAL FIX: Add current user to visibility list if not already present
  if (window.currentUser && window.currentUser.email) {
    const currentUserEmail = window.currentUser.email;
    const isCurrentUserInList = avatars.some(avatar => avatar.email === currentUserEmail);
    
    if (!isCurrentUserInList) {
      console.log('🔍 VISIBILITY: Adding current user to visibility list');
      const currentUserAvatar = {
        email: currentUserEmail,
        name: window.currentUser.name || currentUserEmail.split('@')[0],
        avatarUrl: window.currentUser.avatarUrl, // Use the real Google avatar URL
        auraColor: window.currentUser.auraColor || '#aaaaaa',
        status: 'online',
        enterTime: new Date().toISOString()
      };
      avatars.unshift(currentUserAvatar); // Add to beginning of list
    }
  }
  
  // CRITICAL DIAGNOSTIC: Check if API returned real Google avatars or fake ones
  console.log('🔍 AVATAR_URL_DIAGNOSTIC: Analyzing avatar URLs from API...');
  avatars.forEach((avatar, index) => {
    const isRealGoogle = avatar.avatarUrl && (
      avatar.avatarUrl.includes('lh3.googleusercontent.com') || 
      avatar.avatarUrl.includes('googleusercontent.com')
    );
    const isFake = avatar.avatarUrl && avatar.avatarUrl.includes('ui-avatars.com');
    
    Logger.debug(`AVATAR_URL_DIAGNOSTIC: User ${index + 1} (${avatar.name || avatar.email}):`, {
      avatarUrl: avatar.avatarUrl,
      isRealGoogle: isRealGoogle,
      isFake: isFake,
      auraColor: avatar.auraColor,
      enterTime: avatar.enterTime
    }, 'general');
  });
  
  // Store visibility data globally for real-time aura color access
  window.currentVisibilityData = { active: avatars };
  
  // Clear any existing visibility update timer
  if (window.visibilityUpdateTimer) {
    clearInterval(window.visibilityUpdateTimer);
  }
  
  // NO POLLING - Use Supabase real-time instead
  // Real-time updates will handle visibility changes
  console.log('🔄 VISIBILITY: Stored visibility data globally for real-time aura access');
  
    // Update profile avatar with real-time aura color if available
    // Only update if we have a real-time aura color, don't replace with unified avatar
    if (window.currentUser && window.currentUser.email && getLatestAuraColorFromPresence(window.currentUser.email)) {
      updateProfileAvatarWithRealTimeAura();
    }
  
  const visibleTab = document.getElementById('canopi-visible');
  if (!visibleTab) {
    console.log('❌ VISIBILITY: visibleTab element not found');
    return;
  }
  
  Logger.debug(`VISIBILITY: Updating visible tab with ${avatars.length} avatars`, null, 'general');
  
  // Get current user email for filtering
  const currentUserEmail = await getCurrentUserEmail();
  Logger.debug(`VISIBILITY: Current user email: ${currentUserEmail}`, null, 'general');
  
  // Enhanced logging for each avatar
  console.log('🔍 VISIBILITY: Processing avatars:');
  avatars.forEach((avatar, index) => {
    Logger.debug(`VISIBILITY: Avatar ${index + 1}:`, {
      userId: avatar.userId,
      name: avatar.name,
      handle: avatar.handle,
      avatarUrl: avatar.avatarUrl,
      email: avatar.email || 'no email field'
    }, 'general');
  });
  
  // CRITICAL FIX: Store ALL avatars (including current user) for profile avatar lookup
  // Store the UNFILTERED data globally BEFORE filtering out current user
  window.currentVisibilityDataUnfiltered = { active: avatars };
  Logger.debug(`VISIBILITY_UNFILTERED: Stored ${avatars.length} avatars (including current user) for profile avatar lookup`, null, 'general');
  
  // Filter out ONLY the current user - show all other users regardless of avatar status
  // CRITICAL FIX: Don't filter based on avatarUrl - users should be visible even if avatar hasn't loaded yet
  console.log('');
  console.log('📊 VISIBILITY: Enhanced Current User Detection Logging');
  console.log('───────────────────────────────────────────────────────────');
  Logger.debug(`VISIBILITY: Current user email: ${currentUserEmail}`, null, 'general');
  Logger.debug(`VISIBILITY: Total avatars to check: ${avatars.length}`, null, 'general');
  
  const usersWithAvatars = avatars.filter(avatar => {
    Logger.debug(`VISIBILITY: Checking avatar: ${avatar.name} (${avatar.userId})`, null, 'general');
    Logger.debug(`VISIBILITY: Avatar details:`, {
      userId: avatar.userId,
      handle: avatar.handle,
      name: avatar.name,
      email: avatar.email,
      avatarUrl: avatar.avatarUrl || 'null'
    }, 'general');
    
    // Enhanced current user detection with detailed logging
    const userIdMatch = avatar.userId === currentUserEmail;
    const handleMatch = avatar.handle === currentUserEmail.split('@')[0];
    const nameMatch = avatar.name === currentUserEmail.split('@')[0];
    const emailMatch = avatar.email === currentUserEmail;
    
    Logger.debug(`VISIBILITY: Current user detection:`, {
      userIdMatch,
      handleMatch,
      nameMatch,
      emailMatch
    }, 'general');
    
    const isCurrentUser = userIdMatch || handleMatch || nameMatch || emailMatch;
    
    if (isCurrentUser) {
      Logger.success(`🔍 VISIBILITY: CONFIRMED CURRENT USER - ${avatar.name} (${avatar.userId})`, null, 'general');
      Logger.debug(`VISIBILITY: Match reason: ${userIdMatch ? 'userId' : handleMatch ? 'handle' : nameMatch ? 'name' : 'email'}`, null, 'general');
      
      // CRITICAL FIX: Always filter out current user from their own visibility list
      // The current user should not see themselves in the "Visible" list
      Logger.debug(`VISIBILITY: 🚫 FILTERING OUT current user from their own visibility list`, null, 'general');
      return false;
    }
    
    Logger.success(`🔍 VISIBILITY: NOT CURRENT USER - Keeping avatar: ${avatar.name} (${avatar.userId}) [avatarUrl: ${avatar.avatarUrl || 'null - will use placeholder'}]`, null, 'general');
    return true;
  });
  
  Logger.debug(`VISIBILITY: Showing ${usersWithAvatars.length} users with real avatars (filtered from ${avatars.length} total)`, null, 'general');
  console.log('🔍 VISIBILITY: Final users to display:', usersWithAvatars.map(u => `${u.name} (${u.userId})`));
  
  // Create a compact header with search, count, and go invisible button
  visibleTab.innerHTML = `
    <div class="visible-users">
      <div class="visible-header" style="display: flex; align-items: center; gap: 10px; margin-bottom: 10px; padding: 8px; background: var(--background-secondary); border-radius: 6px;">
        <div class="visible-count" style="font-weight: bold; color: var(--text-primary);">
          ${usersWithAvatars.length} visible
        </div>
        <input type="text" id="visible-search" placeholder="Search users..." style="flex: 1; padding: 4px 8px; border: 1px solid var(--border-color); border-radius: 4px; background: var(--background-primary); color: var(--text-primary); font-size: 12px;">
        <button id="go-invisible-btn" style="padding: 4px 8px; background: var(--accent-color); color: white; border: none; border-radius: 4px; font-size: 12px; cursor: pointer;">Go Invisible</button>
      </div>
      <ul class="item-list">
        ${usersWithAvatars.map((avatar, index) => {
          // CRITICAL FIX: Use avatar.isActive from database (set by real-time events)
          // Don't calculate based on lastSeen timestamp - trust the database status
          const now = Date.now();
          const lastSeenTime = avatar.lastSeen ? new Date(avatar.lastSeen).getTime() : 0;
          const timeSinceLastSeen = now - lastSeenTime;
          
          // Use database isActive status - this is set by real-time presence events
          const isActive = avatar.isActive === true;
          
          // Check if user has explicitly left or is marked inactive in database
          const hasLeft = avatar.status === 'offline' || !isActive;
          
          // COMPREHENSIVE DIAGNOSTIC LOGGING
          console.log('');
          Logger.debug(`VISIBILITY_STATUS: ═══ User ${avatar.name} (${avatar.userId}) ═══`, null, 'general');
          Logger.debug(`VISIBILITY_STATUS:   Build: ${EXTENSION_BUILD}`, null, 'general');
          Logger.debug(`VISIBILITY_STATUS:   avatarUrl: ${avatar.avatarUrl || 'null (will use placeholder)'}`, null, 'general');
          Logger.debug(`VISIBILITY_STATUS:   enterTime: ${avatar.enterTime}`, null, 'general');
          Logger.debug(`VISIBILITY_STATUS:   lastSeen: ${avatar.lastSeen}`, null, 'general');
          Logger.debug(`VISIBILITY_STATUS:   timeSinceLastSeen: ${Math.floor(timeSinceLastSeen / 1000)}s`, null, 'general');
          Logger.debug(`VISIBILITY_STATUS:   isActive (from DB): ${isActive}`, null, 'general');
          Logger.debug(`VISIBILITY_STATUS:   hasLeft: ${hasLeft}`, null, 'general');
          Logger.debug(`VISIBILITY_STATUS:   avatar.status: ${avatar.status}`, null, 'general');
          Logger.debug(`VISIBILITY_STATUS:   avatar.isActive: ${avatar.isActive}`, null, 'general');
          Logger.debug(`VISIBILITY_STATUS:   avatar.availability: ${avatar.availability}`, null, 'general');
          
          // Use the user's availability setting for status dot color
          let statusDotColor = '#6b7280'; // Default gray (offline)
          let statusText = 'Offline';
          
          if (hasLeft) {
            // User has left - show "last seen" status
            statusDotColor = '#6b7280'; // Gray for inactive users
            statusText = formatLastSeenDisplay(avatar.lastSeen);
            Logger.debug(`VISIBILITY_STATUS:   DECISION: User has LEFT → Status: "${statusText}"`, null, 'general');
            Logger.debug(`VISIBILITY_STATUS:   DECISION: Showing INACTIVE user with "Last seen" status`, null, 'general');
          } else if (isActive) {
            // User is active - use their availability setting for status dot
            if (avatar.availability === 'AVAILABLE') {
              statusDotColor = '#22c55e'; // Green
              statusText = formatTimeDisplay(avatar.enterTime);
            } else if (avatar.availability === 'BUSY') {
              statusDotColor = '#eab308'; // Yellow (Working)
              statusText = formatTimeDisplay(avatar.enterTime);
            } else if (avatar.availability === 'AWAY') {
              statusDotColor = '#ef4444'; // Red (Unavailable)
              statusText = formatTimeDisplay(avatar.enterTime);
            } else {
              // Default to Available if no specific availability set
              statusDotColor = '#22c55e'; // Green (Available)
              statusText = formatTimeDisplay(avatar.enterTime);
            }
            Logger.debug(`VISIBILITY_STATUS:   DECISION: User is ACTIVE → Status: "${statusText}"`, null, 'general');
            Logger.debug(`VISIBILITY_STATUS:   DECISION: Showing ACTIVE user with time display`, null, 'general');
          }
          
          Logger.debug(`VISIBILITY_STATUS:   FINAL: statusText="${statusText}", dotColor=${statusDotColor}`, null, 'general');
          Logger.debug(`VISIBILITY_STATUS:   ═══════════════════════════════════════`, null, 'general');
          
          // Aura color is now handled by createUnifiedAvatar()
          Logger.debug(`AURA_DEBUG: User ${avatar.name} - auraColor: ${avatar.auraColor}`, null, 'general');
          
          return `
            <li class="user-item" data-user-id="${avatar.userId}" data-user-name="${avatar.name}" data-index="${index}">
              <div class="avatar-container" style="position: relative; width: 32px; height: 32px;">
                ${AvatarUtils.createUnifiedAvatar(avatar, {
                  size: 32,
                  showStatus: isActive,
                  showAura: true,
                  context: 'visibility',
                  statusColor: statusDotColor
                })}
              </div>
              <div class="item-details">
                <div class="item-name">${avatar.name}</div>
                <div class="item-status">${statusText}</div>
              </div>
            </li>
          `;
        }).join('')}
      </ul>
    </div>
  `;
  
  // Add event listeners to user items
  const userItems = visibleTab.querySelectorAll('.user-item');
  userItems.forEach(item => {
    item.addEventListener('click', () => {
      const userId = item.dataset.userId;
      const userName = item.dataset.userName;
      requireAuth('view user profiles', () => openUserProfile(userId, userName));
    });
  });
  
  // Add error handling for broken avatar images
  const avatarImages = visibleTab.querySelectorAll('.user-avatar-img[data-avatar-fallback="true"]');
  // CRITICAL FIX: Enhanced visibility avatar error handling with fallback
  avatarImages.forEach(img => {
    img.addEventListener('error', () => {
      console.log('❌ VISIBILITY: Avatar image failed to load, applying fallback instead of removing user');
      
      // Get user data from the user item
      const userItem = img.closest('.user-item');
      if (userItem) {
        const userEmail = userItem.dataset.userEmail;
        const userName = userItem.dataset.userName || userEmail?.split('@')[0] || 'User';
        const auraColor = userItem.dataset.auraColor || '#aaaaaa';
        
        // Hide the failed image
        img.style.display = 'none';
        
        // Create or show fallback avatar
        let fallbackDiv = userItem.querySelector('.avatar-fallback');
        if (!fallbackDiv) {
          fallbackDiv = document.createElement('div');
          fallbackDiv.className = 'avatar-fallback';
          fallbackDiv.style.cssText = `
            position: relative; 
            z-index: 2; 
            width: 24px; 
            height: 24px; 
            border-radius: 50%; 
            background-color: ${auraColor}; 
            display: flex; 
            align-items: center; 
            justify-content: center; 
            color: white; 
            font-weight: bold; 
            font-size: 12px;
            border: 2px solid ${auraColor};
          `;
          fallbackDiv.textContent = userName.charAt(0).toUpperCase();
          img.parentNode.insertBefore(fallbackDiv, img.nextSibling);
        } else {
          fallbackDiv.style.display = 'flex';
        }
      }
    });
    
    // Add load success handler to hide fallback if image loads
    img.addEventListener('load', () => {
      const userItem = img.closest('.user-item');
      if (userItem) {
        const fallbackDiv = userItem.querySelector('.avatar-fallback');
        if (fallbackDiv) {
          fallbackDiv.style.display = 'none';
        }
      }
    });
  });

  // Add search functionality
  const searchInput = visibleTab.querySelector('#visible-search');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      const searchTerm = e.target.value.toLowerCase();
      const userItems = visibleTab.querySelectorAll('.user-item');
      let visibleCount = 0;
      
      userItems.forEach(item => {
        const userName = item.dataset.userName.toLowerCase();
        const matches = userName.includes(searchTerm);
        item.style.display = matches ? 'flex' : 'none';
        if (matches) visibleCount++;
      });
      
      // Update count
      const countElement = visibleTab.querySelector('.visible-count');
      if (countElement) {
        countElement.textContent = `${visibleCount} visible${searchTerm ? ' (filtered)' : ''}`;
      }
    });
  }

  // Add go invisible functionality
  const goInvisibleBtn = visibleTab.querySelector('#go-invisible-btn');
  if (goInvisibleBtn) {
    goInvisibleBtn.addEventListener('click', async () => {
      console.log('🔍 VISIBILITY: User clicked Go Invisible');
      try {
        const currentUri = await getCurrentPageUri();
        const userId = await getCurrentUserId();
        
        // MODERN SUPABASE: Use Supabase real-time for visibility updates
        if (supabaseRealtimeClient) {
          const success = await supabaseRealtimeClient.setUserVisibility(false, currentUri);
          if (success) {
            await supabaseRealtimeClient.broadcastVisibilityChange(false, currentUri);
            console.log('🔍 VISIBILITY: Successfully set user invisible via Supabase real-time');
            // Reload the visible list
            const result = await chrome.storage.local.get(['activeCommunities']);
            const activeCommunities = result.activeCommunities || ['comm-001'];
            await loadCombinedAvatars(activeCommunities);
          } else {
            console.error('🔍 VISIBILITY: Failed to set user invisible via Supabase');
          }
        } else {
          console.error('🔍 VISIBILITY: Supabase real-time client not available');
        }
      } catch (error) {
        console.error('🔍 VISIBILITY: Error setting user invisible:', error);
      }
    });
  }

  // Add visibility settings button
  const settingsBtn = document.createElement('button');
  settingsBtn.textContent = '⚙️';
  settingsBtn.style.cssText = 'padding: 4px 8px; background: var(--background-secondary); color: var(--text-primary); border: 1px solid var(--border-color); border-radius: 4px; font-size: 12px; cursor: pointer; margin-left: 5px;';
  settingsBtn.title = 'Visibility Settings';
  
  // Insert settings button after go invisible button
  if (goInvisibleBtn && goInvisibleBtn.parentNode) {
    goInvisibleBtn.parentNode.insertBefore(settingsBtn, goInvisibleBtn.nextSibling);
  }
  
  // Add settings button click handler
  settingsBtn.addEventListener('click', () => {
    console.log('🔍 VISIBILITY: User clicked visibility settings');
    showVisibilitySettingsModal();
  });
}

function openUserProfile(userId, userName) {
  debug(`Opening profile for: ${userName} (${userId})`);
  // TODO: Implement user profile modal
}

// Get user's default visibility setting
async function getUserDefaultVisibility(userId) {
  try {
    console.log('🔍 VISIBILITY MODAL: Getting default visibility for user:', userId);
    const response = await fetch(`${METALAYER_API_URL}/v1/visibility/default`, {
      headers: {
        'x-user-email': await getCurrentUserEmail()
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('🔍 VISIBILITY MODAL: Default visibility response:', data);
      return data.defaultVisibility || false;
    } else {
      console.error('🔍 VISIBILITY MODAL: Failed to get default visibility:', await response.text());
      return false;
    }
  } catch (error) {
    console.error('🔍 VISIBILITY MODAL: Error getting default visibility:', error);
    return false;
  }
}

// Get user's display visibility after exit setting
async function getUserDisplayVisibilityAfterExit(userId) {
  try {
    console.log('🔍 VISIBILITY MODAL: Getting display visibility after exit for user:', userId);
    const response = await fetch(`${METALAYER_API_URL}/v1/users/${userId}/display-visibility-after-exit`, {
      headers: {
        'x-user-email': await getCurrentUserEmail()
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('🔍 VISIBILITY MODAL: Display visibility after exit response:', data);
      return data.user?.displayVisibilityAfterExit || 7;
    } else {
      console.error('🔍 VISIBILITY MODAL: Failed to get display visibility after exit:', await response.text());
      return 7;
    }
  } catch (error) {
    console.error('🔍 VISIBILITY MODAL: Error getting display visibility after exit:', error);
    return 7;
  }
}

// Get user's headline
async function getUserHeadline(userId) {
  try {
    console.log('🔍 VISIBILITY MODAL: Getting headline for user:', userId);
    const response = await fetch(`${METALAYER_API_URL}/v1/users/${userId}/headline`, {
      headers: {
        'x-user-email': await getCurrentUserEmail()
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('🔍 VISIBILITY MODAL: Headline response:', data);
      return data.user?.headline || '';
    } else {
      console.error('🔍 VISIBILITY MODAL: Failed to get headline:', await response.text());
      return '';
    }
  } catch (error) {
    console.error('🔍 VISIBILITY MODAL: Error getting headline:', error);
    return '';
  }
}

// Show visibility settings modal
async function showVisibilitySettingsModal() {
  console.log('🔍 VISIBILITY MODAL: Opening visibility settings modal');
  
  try {
    // Get current user data
    const userId = await getCurrentUserId();
    const userEmail = await getCurrentUserEmail();
    
    console.log('🔍 VISIBILITY MODAL: Current user data:', { userId, userEmail });
    
    // Create modal overlay (styled like color input modal)
    const modalOverlay = document.createElement('div');
    modalOverlay.id = 'visibility-settings-modal';
    modalOverlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.6);
      z-index: 10000;
      display: flex;
      align-items: center;
      justify-content: center;
      backdrop-filter: blur(4px);
    `;
    
    // Create modal content (styled like color input modal)
    const modalContent = document.createElement('div');
    modalContent.style.cssText = `
      background: var(--bg-primary);
      border: 1px solid var(--border-color);
      border-radius: 12px;
      padding: 0;
      max-width: 480px;
      width: 90%;
      max-height: 85vh;
      overflow: hidden;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
      backdrop-filter: blur(10px);
    `;
    
    // Get current user settings
    const [defaultVisibility, displayVisibilityAfterExit, headline] = await Promise.all([
      getUserDefaultVisibility(userId),
      getUserDisplayVisibilityAfterExit(userId),
      getUserHeadline(userId)
    ]);
    
    console.log('🔍 VISIBILITY MODAL: Current settings:', { defaultVisibility, displayVisibilityAfterExit, headline });
    
    modalContent.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; padding: 20px 24px; border-bottom: 1px solid var(--border-color); background: var(--bg-secondary);">
        <h3 style="margin: 0; color: var(--text-primary); font-size: 18px; font-weight: 600;">👁️ Visibility & Status</h3>
        <button id="close-visibility-modal" style="background: none; border: none; color: var(--text-secondary); font-size: 18px; cursor: pointer; padding: 4px 8px; border-radius: 6px;">✕</button>
      </div>
      
      <div style="padding: 24px; max-height: 60vh; overflow-y: auto;">
        <!-- Status Section -->
        <div style="margin-bottom: 24px;">
          <label style="display: block; margin-bottom: 12px; color: var(--text-primary); font-weight: 600; font-size: 14px;">Current Status</label>
          <div style="display: flex; gap: 12px; align-items: center;">
            <div style="display: flex; background: var(--bg-secondary); border-radius: 20px; padding: 2px; border: 1px solid var(--border-color);">
              <button id="status-available" style="padding: 8px 16px; border: none; border-radius: 18px; background: #22c55e; color: white; cursor: pointer; font-size: 13px; font-weight: 500;">🟢 Available</button>
              <button id="status-working" style="padding: 8px 16px; border: none; border-radius: 18px; background: transparent; color: var(--text-secondary); cursor: pointer; font-size: 13px; font-weight: 500;">🟡 Working</button>
              <button id="status-unavailable" style="padding: 8px 16px; border: none; border-radius: 18px; background: transparent; color: var(--text-secondary); cursor: pointer; font-size: 13px; font-weight: 500;">🔴 Unavailable</button>
            </div>
          </div>
          <p style="margin: 8px 0 0 0; color: var(--text-secondary); font-size: 12px;">Control your status dot color across all pages</p>
        </div>
        
        <!-- Default Visibility -->
        <div style="margin-bottom: 24px;">
          <label style="display: flex; align-items: center; gap: 12px; margin-bottom: 8px; color: var(--text-primary); font-weight: 600; font-size: 14px; cursor: pointer;">
            <input type="checkbox" id="default-visibility-toggle" style="width: 18px; height: 18px; accent-color: var(--accent-color);">
            <span>Default Visibility</span>
          </label>
          <p style="margin: 4px 0 0 30px; color: var(--text-secondary); font-size: 12px;">Show as visible by default on new tabs</p>
        </div>
        
        <!-- Display Visibility After Exit -->
        <div style="margin-bottom: 24px;">
          <label style="display: block; margin-bottom: 8px; color: var(--text-primary); font-weight: 600; font-size: 14px;">Display Visibility After Exit (days)</label>
          <input type="number" id="display-visibility-days" min="0" max="365" value="${displayVisibilityAfterExit || 7}" 
                 style="width: 100%; padding: 10px 12px; border: 1px solid var(--border-color); border-radius: 8px; background: var(--bg-secondary); color: var(--text-primary); font-size: 14px;">
          <p style="margin: 8px 0 0 0; color: var(--text-secondary); font-size: 12px;">How long to keep showing as visible after leaving a page</p>
        </div>
        
        <!-- Professional Headline -->
        <div style="margin-bottom: 24px;">
          <label style="display: block; margin-bottom: 8px; color: var(--text-primary); font-weight: 600; font-size: 14px;">Professional Headline</label>
          <input type="text" id="user-headline" placeholder="e.g., Software Engineer at Tech Corp" value="${headline || ''}" 
                 style="width: 100%; padding: 10px 12px; border: 1px solid var(--border-color); border-radius: 8px; background: var(--bg-secondary); color: var(--text-primary); font-size: 14px;">
          <p style="margin: 8px 0 0 0; color: var(--text-secondary); font-size: 12px;">A brief professional description (like LinkedIn headline)</p>
        </div>
      </div>
      
      <div style="display: flex; gap: 12px; justify-content: flex-end; padding: 20px 24px; border-top: 1px solid var(--border-color); background: var(--bg-secondary);">
        <button id="cancel-visibility-settings" style="padding: 10px 20px; border: 1px solid var(--border-color); border-radius: 8px; background: var(--bg-primary); color: var(--text-primary); cursor: pointer; font-size: 14px; font-weight: 500;">Cancel</button>
        <button id="save-visibility-settings" style="padding: 10px 20px; border: none; border-radius: 8px; background: var(--accent-color); color: white; cursor: pointer; font-size: 14px; font-weight: 600;">Save Settings</button>
      </div>
    `;
    
    modalOverlay.appendChild(modalContent);
    document.body.appendChild(modalOverlay);
    
    // Add event listeners
    setupVisibilityModalEventListeners(modalOverlay, userId);
    
  } catch (error) {
    console.error('🔍 VISIBILITY MODAL: Error opening modal:', error);
    alert('Failed to open visibility settings. Please try again.');
  }
}

// Setup event listeners for visibility settings modal
function setupVisibilityModalEventListeners(modalOverlay, userId) {
  console.log('🔍 VISIBILITY MODAL: Setting up event listeners for user:', userId);
  
  // Close modal handlers
  const closeBtn = modalOverlay.querySelector('#close-visibility-modal');
  const cancelBtn = modalOverlay.querySelector('#cancel-visibility-settings');
  const saveBtn = modalOverlay.querySelector('#save-visibility-settings');
  
  const closeModal = () => {
    console.log('🔍 VISIBILITY MODAL: Closing modal');
    document.body.removeChild(modalOverlay);
  };
  
  // Close button
  if (closeBtn) {
    closeBtn.addEventListener('click', closeModal);
  }
  
  // Cancel button
  if (cancelBtn) {
    cancelBtn.addEventListener('click', closeModal);
  }
  
  // Click outside to close
  modalOverlay.addEventListener('click', (e) => {
    if (e.target === modalOverlay) {
      closeModal();
    }
  });
  
  // Status button handlers
  const statusAvailable = modalOverlay.querySelector('#status-available');
  const statusWorking = modalOverlay.querySelector('#status-working');
  const statusUnavailable = modalOverlay.querySelector('#status-unavailable');
  
  const updateStatusButtons = (activeStatus) => {
    [statusAvailable, statusWorking, statusUnavailable].forEach(btn => {
      btn.style.background = 'transparent';
      btn.style.color = 'var(--text-secondary)';
    });
    
    if (activeStatus === 'available') {
      statusAvailable.style.background = '#22c55e';
      statusAvailable.style.color = 'white';
    } else if (activeStatus === 'working') {
      statusWorking.style.background = '#eab308';
      statusWorking.style.color = 'white';
    } else if (activeStatus === 'unavailable') {
      statusUnavailable.style.background = '#ef4444';
      statusUnavailable.style.color = 'white';
    }
  };
  
  if (statusAvailable) {
    statusAvailable.addEventListener('click', () => updateStatusButtons('available'));
  }
  if (statusWorking) {
    statusWorking.addEventListener('click', () => updateStatusButtons('working'));
  }
  if (statusUnavailable) {
    statusUnavailable.addEventListener('click', () => updateStatusButtons('unavailable'));
  }
  
  // Save button
  if (saveBtn) {
    saveBtn.addEventListener('click', async () => {
      console.log('🔍 VISIBILITY MODAL: User clicked save settings');
      
      try {
        // Get form values
        const defaultVisibility = modalOverlay.querySelector('#default-visibility-toggle').checked;
        const displayVisibilityDays = parseInt(modalOverlay.querySelector('#display-visibility-days').value);
        const headline = modalOverlay.querySelector('#user-headline').value.trim();
        
        // Get current status
        let currentStatus = 'available';
        if (statusAvailable.style.background === '#22c55e') currentStatus = 'available';
        else if (statusWorking.style.background === '#eab308') currentStatus = 'working';
        else if (statusUnavailable.style.background === '#ef4444') currentStatus = 'unavailable';
        
        console.log('🔍 VISIBILITY MODAL: Form values:', { defaultVisibility, displayVisibilityDays, headline, currentStatus });
        
        // Validate inputs
        if (displayVisibilityDays < 0 || displayVisibilityDays > 365) {
          alert('Display visibility days must be between 0 and 365');
          return;
        }
        
        // Show loading state
        saveBtn.textContent = 'Saving...';
        saveBtn.disabled = true;
        
        // Update settings
        const updatePromises = [];
        
        // Update default visibility
        updatePromises.push(
          fetch(`${METALAYER_API_URL}/v1/visibility/default`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'x-user-email': await getCurrentUserEmail()
            },
            body: JSON.stringify({ defaultVisibility })
          })
        );
        
        // Update display visibility after exit
        updatePromises.push(
          fetch(`${METALAYER_API_URL}/v1/users/${userId}/display-visibility-after-exit`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'x-user-email': await getCurrentUserEmail()
            },
            body: JSON.stringify({ days: displayVisibilityDays })
          })
        );
        
        // Update headline
        updatePromises.push(
          fetch(`${METALAYER_API_URL}/v1/users/${userId}/headline`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'x-user-email': await getCurrentUserEmail()
            },
            body: JSON.stringify({ headline })
          })
        );
        
        // Wait for all updates to complete
        const responses = await Promise.all(updatePromises);
        
        // Check if all updates were successful
        const allSuccessful = responses.every(response => response.ok);
        
        if (allSuccessful) {
          console.log('🔍 VISIBILITY MODAL: All settings saved successfully');
          closeModal();
          
          // Show success message
          const successMsg = document.createElement('div');
          successMsg.textContent = 'Settings saved successfully!';
          successMsg.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: var(--accent-color);
            color: white;
            padding: 10px 20px;
            border-radius: 4px;
            z-index: 10001;
          `;
          document.body.appendChild(successMsg);
          
          setTimeout(() => {
            document.body.removeChild(successMsg);
          }, 3000);
          
        } else {
          console.error('🔍 VISIBILITY MODAL: Some settings failed to save');
          alert('Some settings failed to save. Please try again.');
        }
        
      } catch (error) {
        console.error('🔍 VISIBILITY MODAL: Error saving settings:', error);
        alert('Failed to save settings. Please try again.');
      } finally {
        // Reset button state
        saveBtn.textContent = 'Save Settings';
        saveBtn.disabled = false;
      }
    });
  }
}

function switchCommunity(community) {
  debug(`Switching primary community to: ${community.name}`);
  
  // Update the current community name in the header
  const currentCommunityName = document.getElementById('current-community-name');
  if (currentCommunityName) {
    currentCommunityName.textContent = community.name;
  }
  
  // Update the placeholder text
  updatePlaceholderText(community.name);
  
  // Close the dropdown
  const communityDropdownPanel = document.getElementById('community-dropdown-panel');
  if (communityDropdownPanel) {
    communityDropdownPanel.style.display = 'none';
  }
  
  // Get current active communities and update primary community
  // Modernized: Use StateManager instead of Chrome Storage
  getState('activeCommunities').then((activeCommunities) => {
    const communities = activeCommunities || [community.id];
    
    // Store updated primary community
    // Modernized: Use StateManager instead of Chrome Storage
    getState('communities').then((communities) => {
      setState('communities', { 
        primaryCommunity: community.id,
        currentCommunity: community.id, // For backward compatibility
        communities: result.communities // Keep existing communities
      });
    });
    
    // Load chat history for the new primary community
    loadChatHistory(community.id);
    
    // Note: We don't reload avatars here because we want to show people from ALL active communities
    // The avatars are already loaded from all active communities in loadCombinedAvatars()
  });
}

// ===== UNIFIED AVATAR SYSTEM =====
// This system ensures consistent avatar rendering across all contexts:
// - Profile header avatars
// - Message avatars  
// - Visibility list avatars

function getAvatarColor(name) {
  // Generate a consistent color based on the name (for message avatars)
  const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F'];
  const index = name.charCodeAt(0) % colors.length;
  return colors[index];
}

/**
 * TRULY UNIFIED avatar display function - SAME implementation for ALL contexts
 * This function creates identical visual appearance regardless of context
 * @param {Object} user - User object with name, avatarUrl, auraColor, etc.
 * @param {Object} options - Rendering options
 * @param {number} options.size - Avatar size in pixels (default: 32)
 * @param {boolean} options.showStatus - Show status dot (default: true)
 * @param {boolean} options.showAura - Show aura border (default: true)
 * @param {string} options.context - Context: 'profile', 'message', 'visibility'
 * @returns {string} HTML string for the avatar
 */
// AvatarUtils is defined in utils/AvatarUtils.js and loaded globally

// DEPRECATED: Use AvatarUtils.createUnifiedAvatar() instead
function createUnifiedAvatar(user, options = {}) {
  Logger.warn('DEPRECATED: createUnifiedAvatar() is deprecated. Use AvatarUtils.createUnifiedAvatar() instead.', null, 'general');
  return AvatarUtils.createUnifiedAvatar(user, options);
}

// Global function to set custom avatar color for the current user
async function setCustomAvatarColor(color) {
  if (!color || !color.startsWith('#')) {
    console.error('❌ Invalid color. Please provide a hex color (e.g., #45B7D1)');
    return;
  }
  
  console.log('🎨 SD1 FIX: Setting aura color via Supabase real-time:', color);
  
  // SD1 FIX: Save to Supabase database and broadcast via real-time
  if (window.supabaseRealtimeClient && window.supabaseRealtimeClient.isInitialized) {
    try {
      // Update user's aura color in Supabase database
      await window.supabaseRealtimeClient.broadcastAuraColorChange(color);
      console.log('✅ SD1 FIX: Aura color saved to Supabase and broadcasted');
      
      // Update local state
      await setState('customAvatarColor', color);
      
      // Refresh all avatars
      await refreshAllAvatars();
    } catch (error) {
      console.error('❌ SD1 FIX: Failed to save aura color to Supabase:', error);
    }
  } else {
    console.warn('⚠️ SD1 FIX: Supabase client not available, using local storage only');
    // Fallback to local storage
    await setState('customAvatarColor', color);
    await refreshAllAvatars();
  }
}

// Global function to reset to default avatar color
function resetCustomAvatarColor() {
  // Modernized: Use StateManager instead of Chrome Storage
  setState('customAvatarColor', null).then(() => {
    // Refresh the profile avatar
    refreshUserAvatar();
  });
}

// Get the avatar color for the current user (custom or default)
function getCurrentUserAvatarColor() {
  return new Promise((resolve) => {
    // Modernized: Use StateManager instead of Chrome Storage
    getState('customAvatarColor').then((customAvatarColor) => {
      if (result.customAvatarColor) {
        resolve(result.customAvatarColor);
      } else {
        // Use the same color system as message avatars
        getCurrentUserEmail().then(email => {
          resolve(getAvatarColor(email));
        }).catch(() => {
          resolve('#45B7D1'); // Default blue
        });
      }
    });
  });
}

function getUserAvatarBgColor() {
  // Get the user's custom background color for their profile avatar
  return AVATAR_BG_CONFIG.getBgColor();
}

// REMOVED - No separate background color function needed
// The aura color IS the background color - use aura color directly
// async function setUserAvatarBgColor(color) {
//   // MODERN SECURITY: Validate and sanitize input
//   if (window.securityManager) {
//     if (!window.securityManager.validateHexColor(color)) {
//       window.logger?.error('SECURITY', 'Invalid hex color format', { color });
//       console.error(`Invalid color format: ${color}. Must be a valid hex color (e.g., #FF6B6B)`);
//       return false;
//     }
//     
//     // Sanitize the color input
//     color = window.securityManager.sanitizeInput(color);
//   } else {
//     // Fallback validation
//     const hexColorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
//     if (!hexColorRegex.test(color)) {
//       console.error(`Invalid color format: ${color}. Must be a valid hex color (e.g., #FF6B6B)`);
//       return false;
//     }
//   }
  
  // MODERN LOGGING
  // window.logger?.info('AURA', 'Setting user avatar background color', { color });
  
  // AVATAR_BG_CONFIG.setBgColor(color);
  
  // Apply the aura color as BOTH border AND background - they should ALWAYS be the same
  // const userAvatar = document.getElementById('user-avatar');
  // if (userAvatar) {
  //   userAvatar.style.borderColor = color;
  //   userAvatar.style.borderWidth = '2px';
  //   userAvatar.style.borderStyle = 'solid';
  //   // The aura color IS the background color - they are the same thing
  //   userAvatar.style.backgroundColor = color;
  // }
  
  // Save to chrome storage for persistence
  // chrome.storage.local.set({ userAvatarBgColor: color });
  
  // Save to database
  // try {
  //   const result = await chrome.storage.local.get(['googleUser']);
  //   if (result.googleUser && result.googleUser.email) {
  //     // Use email-based approach - get the database user ID first
  //     console.log('🔍 Saving aura color for user:', { email: result.googleUser.email });
  //     
  //     // First, get the database user ID by email
  //     const userEmail = result.googleUser.email;
  //     const userLookupUrl = `${METALAYER_API_URL}/v1/users/me`;
  //     Logger.debug(`AURA_COLOR_SAVE: [BUILD ${EXTENSION_BUILD}] Looking up user by email: ${userEmail}`, null, 'general');
  //     Logger.debug(`AURA_COLOR_SAVE: [BUILD ${EXTENSION_BUILD}] API URL: ${userLookupUrl}`, null, 'general');
  //     
  //     const userResponse = await fetch(userLookupUrl, {
  //       headers: {
  //         'x-user-email': userEmail
  //       }
  //     });

async function resetUserAvatarBgColor() {
  AVATAR_BG_CONFIG.resetToDefault();
  
  // Remove from chrome storage
  chrome.storage.local.remove(['userAvatarBgColor']);
  
  // Refresh all avatars (profile, message, and visibility)
  await refreshAllAvatars();
  
  // Broadcast aura color reset to other profiles
  try {
    chrome.runtime.sendMessage({
      type: 'AURA_COLOR_CHANGED',
      color: 'reset',
      timestamp: Date.now()
    });
    console.log('📡 AURA: Broadcasted aura color reset to other profiles');
  } catch (error) {
    console.log('📡 AURA: Could not broadcast to other profiles:', error);
  }
}

function getCurrentUserAvatarBgColor() {
  return AVATAR_BG_CONFIG.getBgColor();
}

function refreshUserAvatar() {
  // Refresh only the profile avatar - use window.currentUser
  if (window.currentUser) {
    updateUI(window.currentUser);
  }
}

// Function to refresh all avatars when aura color changes
async function refreshAllAvatars() {
  console.log('🎨 Refreshing all avatars after aura color change...');
  
  // Refresh profile avatar
  refreshUserAvatar();
  
  // Refresh message avatars with current presence data
  await refreshMessageAvatarsWithCurrentPresence();
  
  // Refresh visibility avatars by reloading combined avatars
  const result = await chrome.storage.local.get(['activeCommunities']);
  const activeCommunities = result.activeCommunities || ['comm-001'];
  await loadCombinedAvatars(activeCommunities);
  
  console.log('✅ All avatars refreshed');
}

// Function to refresh message avatars with current presence data
async function refreshMessageAvatarsWithCurrentPresence() {
  console.log('🔄 MESSAGE_AVATAR: Refreshing message avatars with current presence data...');
  
  try {
    // Get current presence data to get updated aura colors
    const currentUrl = window.location.href;
    const normalizedUrl = await normalizeCurrentUrl();
    // Use Supabase real-time instead of API polling
    const { data: presenceData, error } = await supabase
      .from('user_presence')
      .select('*')
      .eq('page_url', normalizedUrl.normalizedUrl)
      .eq('is_active', true);
    
    if (error) throw error;
    
    // Store presence data globally for real-time aura color access
    window.currentPresenceData = presenceData;
    console.log('🔄 MESSAGE_AVATAR: Stored presence data globally for real-time aura access');
    
    if (presenceData && presenceData.active) {
      console.log('🔄 MESSAGE_AVATAR: Found presence data with', presenceData.active.length, 'active users');
      
      // Create a map of user emails to their current aura colors
      const auraColorMap = {};
      presenceData.active.forEach(user => {
        // Check both email and userId fields for user identification
        const userEmail = user.email || user.userId || user.id;
        if (userEmail && user.auraColor) {
          auraColorMap[userEmail] = user.auraColor;
          Logger.debug(`MESSAGE_AVATAR: Updated aura for ${userEmail}: ${user.auraColor}`, null, 'general');
        }
      });
      
      // Find all message containers and re-render their avatars with updated aura colors
      const messageContainers = document.querySelectorAll('.message');
      Logger.debug(`MESSAGE_AVATAR: Found ${messageContainers.length} message containers to update`, null, 'general');
      
      messageContainers.forEach(messageContainer => {
        const avatarContainer = messageContainer.querySelector('.avatar-container');
        if (avatarContainer) {
          // Get the message data to find the author
          const messageId = messageContainer.getAttribute('data-message-id');
          if (messageId) {
            // Find the message in the current chat data
            const messageData = window.currentChatData?.find(msg => msg.id === messageId);
            if (messageData && messageData.author) {
              const author = messageData.author;
              const userEmail = author.email;
              
              if (userEmail && auraColorMap[userEmail]) {
                Logger.debug(`MESSAGE_AVATAR: Re-rendering avatar for ${userEmail} with aura ${auraColorMap[userEmail]}`, null, 'general');
                
                // Update the author's aura color
                author.auraColor = auraColorMap[userEmail];
                
                // Re-render the avatar with the updated aura color
                const newAvatarHTML = getSenderAvatar(author);
                avatarContainer.innerHTML = newAvatarHTML;
                
                Logger.debug(`MESSAGE_AVATAR: Re-rendered avatar for ${userEmail}`, null, 'general');
              }
            }
          }
        }
      });
      
      console.log('✅ MESSAGE_AVATAR: Message avatars refreshed with current presence data');
    } else {
      console.log('⚠️ MESSAGE_AVATAR: No presence data found, skipping avatar refresh');
    }
  } catch (error) {
    console.error('❌ MESSAGE_AVATAR: Error refreshing message avatars:', error);
  }
}

async function loadUserAvatarBgConfig() {
  try {
    const result = await chrome.storage.local.get(['userAvatarBgColor']);
    if (result.userAvatarBgColor) {
      AVATAR_BG_CONFIG.setBgColor(result.userAvatarBgColor);
    }
  } catch (error) {
    console.error('❌ Error loading user avatar background color config:', error);
  }
}

// Global functions for user avatar background color configuration (accessible from browser console)
// REMOVED - No separate background color functions needed
// window.setUserAvatarBgColor = setUserAvatarBgColor;
// window.resetUserAvatarBgColor = resetUserAvatarBgColor;
window.getCurrentUserAvatarBgColor = getCurrentUserAvatarBgColor;

// Color Picker Modal Functions
// Global function for updating color preview
function updateColorPreview(hex) {
  console.log('🔍 Updating preview with hex:', hex);
  const previewCircle = document.getElementById('color-preview-circle');
  const previewText = document.getElementById('color-preview-text');
  
  if (!previewCircle) {
    console.error('❌ Preview circle not found');
    return;
  }
  
  if (!previewText) {
    console.error('❌ Preview text not found');
    return;
  }
  
  if (isValidHex(hex)) {
    const color = '#' + hex;
    previewCircle.style.backgroundColor = color;
    previewText.textContent = color;
    console.log('✅ Preview updated with color:', color);
  } else {
    previewCircle.style.backgroundColor = '#cccccc';
    previewText.textContent = 'Invalid color';
    console.log('❌ Invalid hex color:', hex);
  }
}

function isValidHex(hex) {
  return /^[A-Fa-f0-9]{6}$/.test(hex);
}

function showColorPickerModal() {
  console.log('🎨 Opening color picker modal...');
  
  // Check if modal already exists and is visible
  const existingModal = document.getElementById('color-picker-modal');
  if (existingModal) {
    console.log('🎨 Modal already exists, showing it');
    existingModal.style.display = 'flex';
    return;
  }
  
  // Create modal HTML
  const modalHTML = `
    <div class="color-picker-modal" id="color-picker-modal" style="display: flex;">
      <div class="color-picker-content">
        <div class="color-picker-header">
          <h3 class="color-picker-title">Change Aura Color</h3>
          <button class="color-picker-close" id="color-picker-close">&times;</button>
        </div>
        <div class="color-picker-input-group">
          <label class="color-picker-label" for="color-input">Hex Color (without #):</label>
          <input type="text" class="color-picker-input" id="color-input" placeholder="45B7D1" maxlength="6">
        </div>
        <div class="color-picker-preview">
          <div class="color-picker-preview-circle" id="color-preview-circle">D</div>
          <div class="color-picker-preview-text" id="color-preview-text">Preview</div>
        </div>
        <div class="color-picker-buttons">
          <button class="color-picker-btn" id="color-picker-reset">Reset to Default</button>
          <button class="color-picker-btn primary" id="color-picker-save">Save Color</button>
        </div>
      </div>
    </div>
  `;
  
  // Add modal to page
  document.body.insertAdjacentHTML('beforeend', modalHTML);
  
  // Wait for DOM to be ready before attaching event listeners
  setTimeout(() => {
    const modal = document.getElementById('color-picker-modal');
    const colorInput = document.getElementById('color-input');
    const previewCircle = document.getElementById('color-preview-circle');
    const previewText = document.getElementById('color-preview-text');
    const closeBtn = document.getElementById('color-picker-close');
    const resetBtn = document.getElementById('color-picker-reset');
    const saveBtn = document.getElementById('color-picker-save');
    
    if (!modal || !colorInput || !previewCircle || !previewText || !closeBtn || !resetBtn || !saveBtn) {
      console.error('❌ Modal elements not found after creation');
      return;
    }
    
    // Get current color and set initial values
    const currentColor = getCurrentUserAvatarBgColor();
    const currentHex = currentColor.replace('#', '');
    colorInput.value = currentHex;
    updateColorPreview(currentHex);
    
    // Remove any existing event listeners to prevent duplicates
    const newColorInput = colorInput.cloneNode(true);
    colorInput.parentNode.replaceChild(newColorInput, colorInput);
    
    // Event listeners
    newColorInput.addEventListener('input', (e) => {
      const hex = e.target.value.replace('#', '');
      updateColorPreview(hex);
    });
    
    closeBtn.addEventListener('click', closeColorPickerModal);
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeColorPickerModal();
    });
    
    resetBtn.addEventListener('click', () => {
      // Get the dynamic default color (based on user's name) - use window.currentUser
      let defaultColor = '#45B7D1'; // Fallback
      const user = window.currentUser;
      if (user) {
        const name = user.user_metadata?.full_name || user.name || user.email || 'User';
        defaultColor = getAvatarColor(name);
      }
      const defaultHex = defaultColor.replace('#', '');
      newColorInput.value = defaultHex;
      updateColorPreview(defaultHex);
    });
    
    saveBtn.addEventListener('click', async () => {
      const hex = newColorInput.value.replace('#', '');
      if (isValidHex(hex)) {
        console.log('🎨 Saving aura color:', '#' + hex);
        // Use aura color directly - no separate background color function needed
        const auraColor = '#' + hex;
        console.log('🎨 Setting aura color:', auraColor);
        
        // Apply aura color to profile avatar using unified system
        if (window.currentUser) {
          window.currentUser.auraColor = auraColor;
          updateUI(window.currentUser);
          
          // Update all message avatars with new aura color
          console.log('🔍 AURA DEBUG: Updating all message avatars with new aura color');
          updateAllMessageAvatars(window.currentUser.email, auraColor);
          
          // Update all visibility avatars with new aura color
          console.log('🔍 AURA DEBUG: Updating all visibility avatars with new aura color');
          updateAllVisibilityAvatars(window.currentUser.email, auraColor);
          
          // Send aura change via real-time system
          if (window.aurasIntegration && window.aurasIntegration.isInitialized) {
            window.aurasIntegration.setAura(window.currentUser.email, auraColor);
          }
        }
        
        // Save aura color to storage and database
        chrome.storage.local.set({ userAvatarBgColor: auraColor });
        
        // Update UI with new aura color
        updateUserAuraInUI(auraColor);
        
        // Broadcast aura change via WebSocket
        broadcastAuraChange(auraColor);
        
        closeColorPickerModal();
      } else {
        alert('Please enter a valid 6-digit hex color (e.g., 45B7D1)');
      }
    });
    
    // Add click outside to close modal
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        closeColorPickerModal();
      }
    });
    
    // Add escape key to close modal
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modal.style.display === 'flex') {
        closeColorPickerModal();
      }
    });
    
    // Focus the input
    newColorInput.focus();
    newColorInput.select();
    
    console.log('🎨 Modal setup complete');
  }, 50);
}

function closeColorPickerModal() {
  const modal = document.getElementById('color-picker-modal');
  if (modal) {
    modal.style.display = 'none';
  }
}

// Add click handler to profile avatar to show/hide user menu
// Global flag to track if click-outside listener has been added
let clickOutsideListenerAdded = false;

function addProfileAvatarClickHandler() {
  const userAvatarContainer = document.getElementById('user-avatar-container');
  const userMenu = document.getElementById('user-menu');
  if (userAvatarContainer && userMenu) {
    // Remove any existing click listeners to avoid duplicates
    userAvatarContainer.removeEventListener('click', handleAvatarClick);
    userAvatarContainer.addEventListener('click', handleAvatarClick);
    
    // Only add click-outside listener once
    if (!clickOutsideListenerAdded) {
      document.addEventListener('click', handleClickOutside);
      clickOutsideListenerAdded = true;
    }
  } else {
    console.error('❌ Profile avatar or menu not found!');
  }
}

function addVisibilitySettingsButtonClickHandler() {
  const visibilitySettingsBtn = document.getElementById('visibility-settings-btn');
  if (visibilitySettingsBtn) {
    console.log('🔍 VISIBILITY: Adding click handler for visibility settings button');
    visibilitySettingsBtn.addEventListener('click', () => {
      console.log('🔍 VISIBILITY: User clicked visibility settings from profile menu');
      // Hide the user menu
      const userMenu = document.getElementById('user-menu');
      if (userMenu) {
        userMenu.style.display = 'none';
      }
      // Show the visibility settings modal
      showVisibilitySettingsModal();
    });
  } else {
    console.log('🔍 VISIBILITY: Visibility settings button not found');
  }
}

function handleAvatarClick(e) {
  const userAvatarContainer = document.getElementById('user-avatar-container');
  const userMenu = document.getElementById('user-menu');
  
  console.log('👤 Profile avatar clicked!');
  console.log('🔍 Current menu display:', userMenu.style.display);
  e.stopPropagation();
  
  // Toggle menu visibility
  if (userMenu.style.display === 'none' || userMenu.style.display === '') {
    userMenu.style.display = 'block';
  } else {
    userMenu.style.display = 'none';
  }
}

function handleClickOutside(e) {
  const userAvatarContainer = document.getElementById('user-avatar-container');
  const userMenu = document.getElementById('user-menu');
  
  if (userAvatarContainer && userMenu && !userAvatarContainer.contains(e.target) && !userMenu.contains(e.target)) {
    console.log('🖱️ Clicked outside, hiding menu');
    userMenu.style.display = 'none';
  }
}

// Add click handler to aura button
function addAuraButtonClickHandler() {
  const auraBtn = document.getElementById('aura-btn');
  if (auraBtn) {
    auraBtn.addEventListener('click', (e) => {
      console.log('🎨 Aura button clicked!');
      e.stopPropagation(); // Prevent menu from closing
      showColorPickerModal();
    });
  } else {
    console.error('❌ Aura button not found!');
  }
}

// Global functions for custom avatar color configuration (accessible from browser console)
window.setCustomAvatarColor = setCustomAvatarColor;
window.resetCustomAvatarColor = resetCustomAvatarColor;
window.getCurrentUserAvatarColor = getCurrentUserAvatarColor;

// Global function for debugging visual hierarchy (accessible from browser console)
window.updateVisualHierarchy = updateMessageVisualHierarchy;
window.debugHierarchy = () => {
  console.log('🔧 DEBUG: Manually triggering visual hierarchy update');
  updateMessageVisualHierarchy();
};

window.forceRefreshCSS = () => {
  console.log('🔧 DEBUG: Force refreshing CSS');
  const link = document.querySelector('link[href*="sidepanel.css"]');
  if (link) {
    const href = link.href;
    link.href = href + '?v=' + Date.now();
  }
};

    // Function to update visual hierarchy of messages - TOP-line approach with vertical lines
    function updateMessageVisualHierarchy() {
      const chatMessages = document.querySelector('.chat-messages');
      if (!chatMessages) return;
      
      const allMessages = chatMessages.querySelectorAll('.message');
      const conversationGroups = {};
      
      // console.log('🔍 DEBUG: Updating message visual hierarchy, found', allMessages.length, 'messages');
      
      // Group messages by conversation
      allMessages.forEach(message => {
        const conversationId = message.dataset.conversationId;
        if (!conversationGroups[conversationId]) {
          conversationGroups[conversationId] = [];
        }
        conversationGroups[conversationId].push(message);
      });
      
      // Update visual hierarchy for each conversation
      Object.values(conversationGroups).forEach(messages => {
        const threadStarter = messages.find(msg => !msg.classList.contains('message-reply'));
        const replies = messages.filter(msg => msg.classList.contains('message-reply') && msg.classList.contains('visible'));
        
        if (threadStarter && replies.length > 0) {
          // Add has-replies class to thread starter for vertical line
          threadStarter.classList.add('has-replies');
          // console.log('🔍 LINE DEBUG: Thread starter', threadStarter.dataset.messageId, 'gets vertical line (has-replies class)');
          
          // Calculate vertical line height
          setTimeout(() => {
            updateVerticalLineHeight(threadStarter, replies);
          }, 10);
        } else if (threadStarter) {
          threadStarter.classList.remove('has-replies');
          // console.log('🔍 LINE DEBUG: Thread starter without replies', threadStarter.dataset.messageId, 'gets no vertical line');
        }
        
        // Remove any old inline styles that might interfere
        allMessages.forEach(msg => {
          msg.style.borderBottom = '';
          msg.style.setProperty('--short-line-width', '');
          msg.style.setProperty('--reply-line-width', '');
        });
      });
    }

// Function to calculate and set the height of the vertical line
function updateVerticalLineHeight(threadStarter, replies) {
  if (!threadStarter || replies.length === 0) return;
  
  const lastReply = replies[replies.length - 1];
  if (!lastReply) return;
  
  // Get the position of the thread starter and last reply
  const threadStarterRect = threadStarter.getBoundingClientRect();
  const lastReplyRect = lastReply.getBoundingClientRect();
  
  // Calculate the height from bottom of avatar (32px from top) to last reply bottom
  const avatarBottom = threadStarterRect.top + 32; // 32px is avatar height
  const height = lastReplyRect.bottom - avatarBottom;
  
  console.log('🔍 Vertical line calculation:', {
    threadStarterTop: threadStarterRect.top,
    avatarBottom: avatarBottom,
    lastReplyBottom: lastReplyRect.bottom,
    height
  });
  
  // Set the height on the thread starter's ::after pseudo-element
  threadStarter.style.setProperty('--vertical-line-height', `${height}px`);
}

async function getPrimaryCommunityName() {
  try {
    const result = await chrome.storage.local.get(['primaryCommunity', 'communities']);
    const primaryCommunityId = result.primaryCommunity;
    const communities = result.communities;
    
    if (primaryCommunityId && communities) {
      const primaryCommunity = communities.find(c => c.id === primaryCommunityId);
      return primaryCommunity ? primaryCommunity.name : '';
    }
    return '';
  } catch (error) {
    console.error('Failed to get primary community name:', error);
    return '';
  }
}


async function addMessageToChat(message) {
  console.log('🎯🎯🎯 ============================================');
  console.log('🎯🎯🎯 ADD_MESSAGE_TO_CHAT: ENTRY POINT');
  console.log('🎯🎯🎯 ============================================');
  console.log('🔍 ADD_MESSAGE: Starting addMessageToChat');
  console.log('🔍 ADD_MESSAGE: Timestamp:', new Date().toISOString());
  console.log('🔍 ADD_MESSAGE: Message:', message);
  console.log('🔍 ADD_MESSAGE: Message type:', typeof message);
  console.log('🔍 ADD_MESSAGE: Message id:', message?.id);
  console.log('🔍 ADD_MESSAGE: Message body:', message?.body);
  console.log('🔍 ADD_MESSAGE: Message content:', message?.content);
  console.log('🔍 ADD_MESSAGE: Message author:', message?.author);
  console.log('🔍 ADD_MESSAGE: Message author.name:', message?.author?.name);
  console.log('🔍 ADD_MESSAGE: Message author.avatarUrl:', message?.author?.avatarUrl);
  
  // CRITICAL DEBUG: Check if this is one of the missing messages
  if (message?.body === 'Google a' || message?.body === 'Google b') {
    console.log('🚨🚨🚨 CRITICAL DEBUG: addMessageToChat called for missing message:', message.body);
    // SD1 FIX: Avoid circular structure by logging safe properties only
    console.log('🚨🚨🚨 CRITICAL DEBUG: Message ID:', message.id);
    console.log('🚨🚨🚨 CRITICAL DEBUG: Message body:', message.body);
    console.log('🚨🚨🚨 CRITICAL DEBUG: Message author:', message.author?.name);
    console.log('🚨🚨🚨 CRITICAL DEBUG: Message conversation:', message.conversation?.id);
  }
  
  // CRITICAL: Filter out deleted messages without replies
  // Check both deletedAt field and [Deleted] body content
  const isDeleted = message.deletedAt || (message.body && message.body.trim() === '[Deleted]');
  console.log('🔍 ADD_MESSAGE: isDeleted:', isDeleted);
  console.log('🔍 ADD_MESSAGE: message.hasReplies:', message.hasReplies);
  
  if (isDeleted && !message.hasReplies) {
    console.log('🔍 ADD_MESSAGE: SKIPPING deleted message without replies:', message.id);
    return;
  }
  
  console.log('🔍 ADD_MESSAGE: === FINDING CHAT MESSAGES CONTAINER ===');
  const chatMessages = document.querySelector('.chat-messages');
  console.log('🔍 ADD_MESSAGE: chatMessages element:', !!chatMessages);
  console.log('🔍 ADD_MESSAGE: chatMessages type:', typeof chatMessages);
  
  if (!chatMessages) {
    console.log('❌❌❌ ADD_MESSAGE: No chat-messages element found - CANNOT ADD MESSAGE');
    return;
  }
  console.log('✅ ADD_MESSAGE: Found chat-messages element');
  console.log('✅ ADD_MESSAGE: chatMessages children count:', chatMessages.children.length);

  // Remove placeholder text if it exists
  const placeholder = chatMessages.querySelector('p[style*="text-align: center"]');
  if (placeholder) {
    console.log('🔍 ADD_MESSAGE: Removing placeholder text');
    placeholder.remove();
  }

  // Get the community name from the conversation
  let communityName = '';
  if (message.conversation) {
    // First try to use the communityName that was added during loadChatHistory
    if (message.conversation.communityName) {
      communityName = message.conversation.communityName;
    } else if (message.conversation.communityId) {
      // Fallback to looking up by communityId
      const result = await chrome.storage.local.get(['communities']);
      const communities = result.communities || [];
      const community = communities.find(c => c.id === message.conversation.communityId);
      communityName = community ? community.name : '';
    }
  }
  
  // Fallback to current primary community if no community found
  if (!communityName) {
    communityName = await getPrimaryCommunityName();
  }
  
  // Create message element
  console.log('🔍 ADD_MESSAGE: Creating message element for:', message.id);
  const messageDiv = document.createElement('div');
  
  // Determine message type and add appropriate classes
  if (message.isReply) {
    messageDiv.className = 'message message-reply thread-reply';
  } else {
    // This is a thread starter
    messageDiv.className = 'message thread-starter';
    
    // Check if this thread has replies
    if (message.hasReplies) {
      messageDiv.classList.add('has-replies');
    }
  }
  
  messageDiv.dataset.messageId = message.id;
  messageDiv.dataset.conversationId = message.conversationId;
  messageDiv.dataset.authorId = message.authorId || author.email || author.id;
  
  // Store reactions data for reactions loading (avoid circular reference)
  if (message.conversation && message.conversation.reactions) {
    // Filter reactions to only include those for this specific message
    const messageReactions = message.conversation.reactions.filter(reaction => 
      reaction.postId === message.id
    );
    messageDiv.dataset.reactions = JSON.stringify(messageReactions);
    // For new posts, ensure they start with no reactions
    messageDiv.dataset.reactions = JSON.stringify([]);
  }
  
  // If this is a reply, check if thread is expanded and add visible class
  if (message.isReply) {
    const threadToggle = document.querySelector(`[data-thread-id="${message.conversationId}"]`);
    if (threadToggle && threadToggle.dataset.expanded === 'true') {
      messageDiv.classList.add('visible');
    } else if (window.focusedMessage) {
      // If we're in focus mode, show all replies
      messageDiv.classList.add('visible');
    } else {
      // For replies, keep them collapsed by default (no visible class)
      // They will only be shown when the thread is expanded
      console.log('Reply added, keeping collapsed by default');
    }
  }
  
  // Convert URLs to clickable links
  const contentWithLinks = convertUrlsToLinks(message.body || message.content);
  
  // Get sender info - use author from Canopi 2 structure
  const author = message.author || { name: 'Unknown User', handle: 'unknown' };
  const senderName = author.name || author.handle || 'Unknown User';
  
  // Add reaction and reply buttons with counts
  const reactionCount = message.reactionCount || 0;
  const replyCount = message.replyCount || 0;
  const hasUnseenReplies = message.hasUnseenReplies || false;
  
  const reactionButton = `<button class="reaction-btn" data-message-id="${message.id}" title="Add reaction">🔘<span class="icon-count">${reactionCount > 0 ? reactionCount : ''}</span></button>`;
  const replyButton = `<button class="inline-reply-btn" data-message-id="${message.id}" title="Reply to message">💬</button>`;
  
  // Add thread toggle for first post in thread that has replies
  let threadToggleButton = '';
  if (message.hasReplies) {
    threadToggleButton = `<button class="thread-toggle-btn" data-thread-id="${message.conversationId}" title="Show thread replies" data-expanded="false">📂<span class="icon-count ${hasUnseenReplies ? 'unseen' : ''}">${replyCount}</span></button>`;
  }
  
  // Check if message is deleted
  if (message.deletedAt) {
    Logger.debug(`DELETED_MSG_DEBUG: [BUILD ${EXTENSION_BUILD}] === DELETED MESSAGE ANALYSIS ===`, null, 'general');
    Logger.debug(`DELETED_MSG_DEBUG: [BUILD ${EXTENSION_BUILD}] Message ID: ${message.id}`, null, 'general');
    Logger.debug(`DELETED_MSG_DEBUG: [BUILD ${EXTENSION_BUILD}] Message deletedAt: ${message.deletedAt}`, null, 'general');
    Logger.debug(`DELETED_MSG_DEBUG: [BUILD ${EXTENSION_BUILD}] Message hasReplies: ${message.hasReplies}`, null, 'general');
    Logger.debug(`DELETED_MSG_DEBUG: [BUILD ${EXTENSION_BUILD}] Message replyCount: ${message.replyCount}`, null, 'general');
    Logger.debug(`DELETED_MSG_DEBUG: [BUILD ${EXTENSION_BUILD}] Full message object:`, JSON.stringify(message, null, 2), 'general');
    
    // Only show deleted messages if they have replies
    if (!message.hasReplies) {
      Logger.debug(`DELETED_MSG_DEBUG: [BUILD ${EXTENSION_BUILD}] SKIPPING deleted message without replies: ${message.id}`, null, 'general');
      return;
    }
    
    Logger.debug(`DELETED_MSG_DEBUG: [BUILD ${EXTENSION_BUILD}] SHOWING deleted message WITH replies: ${message.id}`, null, 'general');
    
    // For deleted messages, use the same structure as regular messages
    // but with "This message was deleted" as content
    
    // Use the same message structure as regular messages
    messageDiv.innerHTML = `
      <div class="avatar-container">${getSenderAvatar(author)}</div>
      <div class="message-content-wrapper">
        <div class="message-header-new">
          <span class="message-sender-name">${senderName}${communityName ? ` • ${communityName}` : ''}</span>
          <span class="message-time-new">${formatMessageTime(message.createdAt)}</span>
          <div class="message-actions-new" style="opacity: 1 !important; display: flex !important; visibility: visible !important;">
            ${await getMessageActionMenu(message)}
          </div>
        </div>
        <div class="message-content">This message was deleted</div>
        <div class="message-footer">
          ${reactionButton}
          ${replyButton}
          ${threadToggleButton}
        </div>
      </div>
    `;
    
    messageDiv.classList.add('deleted');
    chatMessages.appendChild(messageDiv);
    
    // Add event listeners for deleted message
    addMessageActionListeners(messageDiv, message);
    
    chatMessages.scrollTop = chatMessages.scrollHeight;
    return;
  }
  
  // Check if user can edit/delete (within 1 hour and is the author)
  const canEdit = canUserEditMessage(message);
  const editDeleteButtons = canEdit ? `
    <div class="message-actions">
      <button class="message-action-btn edit-btn" data-message-id="${message.id}" title="Edit message">
        ✏️
      </button>
      <button class="message-action-btn delete-btn" data-message-id="${message.id}" title="Delete message">
        🗑️
      </button>
    </div>
  ` : '';
  
  
          // CRITICAL DEBUG: Check if this is one of the missing messages
          if (message?.body === 'Google a' || message?.body === 'Google b') {
            console.log('🚨🚨🚨 CRITICAL DEBUG: Creating HTML for missing message:', message.body);
            console.log('🚨🚨🚨 CRITICAL DEBUG: contentWithLinks:', contentWithLinks);
            console.log('🚨🚨🚨 CRITICAL DEBUG: senderName:', senderName);
            console.log('🚨🚨🚨 CRITICAL DEBUG: communityName:', communityName);
          }
          
          messageDiv.innerHTML = `
            <div class="avatar-container">${getSenderAvatar(author)}</div>
            <div class="message-content-wrapper">
              <div class="message-header-new">
                <span class="message-sender-name">${senderName}${communityName ? ` • ${communityName}` : ''}</span>
                <span class="message-time-new">${formatMessageTime(message.createdAt)}</span>
                <div class="message-actions-new" style="opacity: 1 !important; display: flex !important; visibility: visible !important;">
                  ${await getMessageActionMenu(message)}
                </div>
              </div>
              <div class="message-content">${contentWithLinks}</div>
              ${message.optionalContent ? `<div class="message-anchor">📍 ${message.optionalContent}</div>` : ''}
              <div class="message-footer">
                ${reactionButton}
                ${replyButton}
                ${threadToggleButton}
              </div>
            </div>
          `;
          
          // CRITICAL DEBUG: Verify HTML was created
          if (message?.body === 'Google a' || message?.body === 'Google b') {
            console.log('🚨🚨🚨 CRITICAL DEBUG: HTML created for missing message:', messageDiv.innerHTML.length, 'characters');
            console.log('🚨🚨🚨 CRITICAL DEBUG: HTML preview:', messageDiv.innerHTML.substring(0, 200) + '...');
          }
  
  // Add event listeners for action buttons
  addMessageActionListeners(messageDiv, message);
  
  
  
  // Add thread toggle listener
  if (threadToggleButton) {
    const toggleBtn = messageDiv.querySelector('.thread-toggle-btn');
    if (toggleBtn) {
      toggleBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        // For replies, focus the message instead of toggling
        if (message.isReply) {
          handleMessageFocus(message);
        } else {
          toggleThreadReplies(message.conversationId, messageDiv);
        }
      });
    }
  }
  
  console.log('🔍 ADD_MESSAGE: Adding message to DOM:', message.id);
  
  // CRITICAL DEBUG: Check if this is one of the missing messages
  if (message?.body === 'Google a' || message?.body === 'Google b') {
    console.log('🚨🚨🚨 CRITICAL DEBUG: About to append missing message to DOM:', message.body);
    console.log('🚨🚨🚨 CRITICAL DEBUG: Message div created:', !!messageDiv);
    console.log('🚨🚨🚨 CRITICAL DEBUG: Chat container found:', !!chatMessages);
    console.log('🚨🚨🚨 CRITICAL DEBUG: Message div innerHTML length:', messageDiv.innerHTML.length);
  }
  
  chatMessages.appendChild(messageDiv);
  console.log('✅ ADD_MESSAGE: Message added to DOM successfully');
  
  // CRITICAL DEBUG: Verify message was actually added
  if (message?.body === 'Google a' || message?.body === 'Google b') {
    const addedMessage = document.querySelector(`[data-message-id="${message.id}"]`);
    console.log('🚨🚨🚨 CRITICAL DEBUG: Message in DOM after appendChild:', !!addedMessage);
    console.log('🚨🚨🚨 CRITICAL DEBUG: Chat container children count:', chatMessages.children.length);
    if (addedMessage) {
      console.log('🚨🚨🚨 CRITICAL DEBUG: Message element offsetHeight:', addedMessage.offsetHeight);
      console.log('🚨🚨🚨 CRITICAL DEBUG: Message element style.display:', addedMessage.style.display);
      console.log('🚨🚨🚨 CRITICAL DEBUG: Message element computed style:', window.getComputedStyle(addedMessage).display);
    }
  }
  
  // Add message to global storage for avatar updates
  if (!window.currentChatData) {
    window.currentChatData = [];
  }
  // CRITICAL FIX: Check if message already exists in DOM to prevent duplicates
  const existingMessageElement = chatMessages.querySelector(`[data-message-id="${message.id}"]`);
  if (existingMessageElement) {
    console.log('🔍 ADD_MESSAGE: Message already exists in DOM, skipping duplicate:', message.id);
    console.log('🔍 ADD_MESSAGE: Existing message element:', existingMessageElement);
    return; // Skip adding duplicate message
  }
  
  // Check if message already exists in global storage
  const existingIndex = window.currentChatData.findIndex(m => m.id === message.id);
  if (existingIndex >= 0) {
    // Update existing message
    window.currentChatData[existingIndex] = message;
  } else {
    // Add new message
    window.currentChatData.push(message);
  }
  console.log('✅ ADD_MESSAGE: Message added to global storage, total:', window.currentChatData.length);
  
  // Log the current state of chat messages
  const allMessages = chatMessages.querySelectorAll('.message');
  console.log('🔍 ADD_MESSAGE: Total messages in chat now:', allMessages.length);
  console.log('🔍 ADD_MESSAGE: Message IDs in chat:', Array.from(allMessages).map(m => m.getAttribute('data-message-id')));
  
  // Update message count tracking
  lastMessageCount = allMessages.length;
  if (allMessages.length > 0) {
    const lastMessage = allMessages[allMessages.length - 1];
    lastMessageId = lastMessage.getAttribute('data-message-id');
    console.log('🔍 ADD_MESSAGE: Updated last message ID:', lastMessageId);
  }
  
  // CRITICAL FIX: Enhanced avatar error handling with proper fallback
  const avatarImg = messageDiv.querySelector('img[data-avatar-fallback="true"]');
  if (avatarImg) {
    avatarImg.addEventListener('error', function() {
      console.log('❌ MESSAGE_AVATAR: Avatar image failed to load, applying fallback');
      this.style.display = 'none';
      
      // Check if there's already a fallback div
      let fallbackDiv = this.nextElementSibling;
      if (!fallbackDiv || !fallbackDiv.classList.contains('avatar-fallback')) {
        // Create fallback div if it doesn't exist
        fallbackDiv = document.createElement('div');
        fallbackDiv.className = 'avatar-fallback';
        fallbackDiv.style.cssText = `
          position: relative; 
          z-index: 2; 
          width: 32px; 
          height: 32px; 
          border-radius: 50%; 
          background-color: ${author.auraColor || '#aaaaaa'}; 
          display: flex; 
          align-items: center; 
          justify-content: center; 
          color: white; 
          font-weight: bold; 
          font-size: 14px;
          border: 2px solid ${author.auraColor || '#aaaaaa'};
        `;
        fallbackDiv.textContent = (author.name || author.email || 'U').charAt(0).toUpperCase();
        this.parentNode.insertBefore(fallbackDiv, this.nextSibling);
      } else {
        fallbackDiv.style.display = 'flex';
      }
    });
    
    // Add load success handler to hide fallback if image loads
    avatarImg.addEventListener('load', function() {
      const fallbackDiv = this.nextElementSibling;
      if (fallbackDiv && fallbackDiv.classList.contains('avatar-fallback')) {
        fallbackDiv.style.display = 'none';
      }
    });
  }
  
  chatMessages.scrollTop = chatMessages.scrollHeight;
  
  // Update visual hierarchy immediately - no setTimeout needed
  updateMessageVisualHierarchy();
}

// CRITICAL FIX: Add missing updateMessageInChat function for real-time message updates
function updateMessageInChat(updatedMessage) {
  console.log('🔄 UPDATE_MESSAGE: Updating message in chat:', updatedMessage.id);
  
  const chatMessages = document.querySelector('.chat-messages');
  if (!chatMessages) {
    console.error('❌ UPDATE_MESSAGE: No chat-messages element found');
    return;
  }
  
  // Find the existing message element
  const messageElement = chatMessages.querySelector(`[data-message-id="${updatedMessage.id}"]`);
  if (!messageElement) {
    console.log('⚠️ UPDATE_MESSAGE: Message not found in DOM, adding as new message');
    addMessageToChat(updatedMessage);
    return;
  }
  
  // Update the message content
  const contentElement = messageElement.querySelector('.message-content');
  if (contentElement) {
    const contentWithLinks = convertUrlsToLinks(updatedMessage.body || updatedMessage.content);
    contentElement.innerHTML = contentWithLinks;
  }
  
  // Update the message time if it changed
  const timeElement = messageElement.querySelector('.message-time-new');
  if (timeElement && updatedMessage.updatedAt) {
    timeElement.textContent = formatMessageTime(updatedMessage.updatedAt);
  }
  
  // Update global storage
  if (window.currentChatData) {
    const existingIndex = window.currentChatData.findIndex(m => m.id === updatedMessage.id);
    if (existingIndex >= 0) {
      window.currentChatData[existingIndex] = updatedMessage;
    }
  }
  
  console.log('✅ UPDATE_MESSAGE: Message updated successfully');
}

// CRITICAL FIX: Add missing removeMessageFromChat function for real-time message deletions
function removeMessageFromChat(deletedMessage) {
  console.log('🗑️ REMOVE_MESSAGE: Removing message from chat:', deletedMessage.id);
  
  const chatMessages = document.querySelector('.chat-messages');
  if (!chatMessages) {
    console.error('❌ REMOVE_MESSAGE: No chat-messages element found');
    return;
  }
  
  // Find and remove the message element
  const messageElement = chatMessages.querySelector(`[data-message-id="${deletedMessage.id}"]`);
  if (messageElement) {
    messageElement.remove();
    console.log('✅ REMOVE_MESSAGE: Message element removed from DOM');
  } else {
    console.log('⚠️ REMOVE_MESSAGE: Message element not found in DOM');
  }
  
  // Remove from global storage
  if (window.currentChatData) {
    const existingIndex = window.currentChatData.findIndex(m => m.id === deletedMessage.id);
    if (existingIndex >= 0) {
      window.currentChatData.splice(existingIndex, 1);
      console.log('✅ REMOVE_MESSAGE: Message removed from global storage');
    }
  }
  
  // Update visual hierarchy
  updateMessageVisualHierarchy();
  
  console.log('✅ REMOVE_MESSAGE: Message removal completed');
}

// Check if a conversation has replies and add thread toggle if needed
async function checkAndAddThreadToggle(messageElement, conversationId) {
  try {
    // Get conversations for the current page to find replies
    const currentUri = window.location.href;
    // Messages arrive via Supabase real-time subscription
    // Real-time messages are handled by handleMessageChange()
    
    // Check for existing replies in the DOM
    const existingReplies = document.querySelectorAll(`[data-conversation-id="${conversationId}"] .message[data-parent-id]`);
    const replies = Array.from(existingReplies);
    
    // Only add thread toggle if there are replies
    if (replies.length > 0) {
      const footer = messageElement.querySelector('.message-footer');
      if (footer) {
        const threadToggleButton = `<button class="thread-toggle-btn" data-thread-id="${conversationId}" title="Toggle thread replies">📂</button>`;
        footer.insertAdjacentHTML('afterbegin', threadToggleButton);
        
        // Add event listener for the new toggle button
        const toggleBtn = messageElement.querySelector('.thread-toggle-btn');
        if (toggleBtn) {
          toggleBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleThreadReplies(conversationId, messageElement);
          });
        }
      }
    }
  } catch (error) {
    console.error('Failed to check for thread replies:', error);
  }
}


function convertUrlsToLinks(text) {
  // URL regex pattern
  if (!text) return '';
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  return text.replace(urlRegex, '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>');
}

function getSenderName(userId) {
  // For now, return a formatted version of the userId
  // Later this could be enhanced to fetch real user names from the API
  if (userId === 'test-user') return 'Test User';
  if (userId === 'test-user-2') return 'Test User 2';
  if (userId.startsWith('116467399993975200419')) return 'Dave Room';
  return `User ${userId.substring(0, 8)}...`;
}

function getSenderInitial(name) {
  return (name || 'U').charAt(0).toUpperCase();
}

// Update profile avatar with real-time aura color
function updateProfileAvatarWithRealTimeAura() {
  try {
    if (!window.currentUser || !window.currentUser.email) {
      console.log('🔍 PROFILE_AVATAR_UPDATE: No current user found');
      return;
    }

    const userEmail = window.currentUser.email;
    const realTimeAuraColor = getLatestAuraColorFromPresence(userEmail);
    
    if (realTimeAuraColor) {
      Logger.debug(`PROFILE_AVATAR_UPDATE: Found real-time aura color for profile: ${realTimeAuraColor}`, null, 'general');
      
      // Update the profile avatar with the real-time aura color
      const profileAvatar = document.querySelector('#user-avatar-container');
      if (profileAvatar) {
        Logger.debug(`PROFILE_AVATAR_UPDATE: Found profile avatar element:`, profileAvatar, 'general');
        Logger.debug(`PROFILE_AVATAR_UPDATE: Container innerHTML:`, profileAvatar.innerHTML, 'general');
        Logger.debug(`PROFILE_AVATAR_UPDATE: Container has children:`, profileAvatar.children.length, 'general');
        
        // Check if the container has any avatar element
        let avatarElement = profileAvatar.querySelector('img') || profileAvatar.querySelector('[style*="border-radius"]');
        
        // If no avatar element exists, check if there's a unified avatar structure
        const hasUnifiedStructure = profileAvatar.querySelector('div[style*="position: relative"]');
        
        if (hasUnifiedStructure) {
          console.log('🔍 PROFILE_AVATAR_UPDATE: Found unified avatar structure');
          // Update the aura on the unified avatar structure
          const auraRing = hasUnifiedStructure.querySelector('div[style*="border-radius: 50%"]');
          if (auraRing) {
            // Update the aura ring color
            auraRing.style.border = `2px solid ${realTimeAuraColor}`;
            Logger.debug(`PROFILE_AVATAR_UPDATE: Updated unified avatar aura to: ${realTimeAuraColor}`, null, 'general');
          }
        } else if (avatarElement) {
          console.log('🔍 PROFILE_AVATAR_UPDATE: Found simple avatar element');
          // Update the border on the simple avatar
          avatarElement.style.border = `2px solid ${realTimeAuraColor}`;
          Logger.debug(`PROFILE_AVATAR_UPDATE: Updated avatar border color to: ${realTimeAuraColor}`, null, 'general');
        } else {
          console.log('🔍 PROFILE_AVATAR_UPDATE: No avatar element found in container, applying border to container');
          // Apply border directly to container as fallback
          profileAvatar.style.borderColor = realTimeAuraColor;
          profileAvatar.style.borderWidth = '2px';
          profileAvatar.style.borderStyle = 'solid';
          profileAvatar.style.borderRadius = '50%';
          Logger.debug(`PROFILE_AVATAR_UPDATE: Updated container border color to: ${realTimeAuraColor}`, null, 'general');
        }
      } else {
        console.log('🔍 PROFILE_AVATAR_UPDATE: Profile avatar element not found');
      }
    } else {
      console.log('🔍 PROFILE_AVATAR_UPDATE: No real-time aura color found for profile');
    }
  } catch (error) {
    console.error('❌ PROFILE_AVATAR_UPDATE: Error updating profile avatar:', error);
  }
}

// Get the latest aura color from presence data for any user
function getLatestAuraColorFromPresence(userEmail) {
  try {
    // Check if we have presence data stored
    const presenceData = window.currentPresenceData || window.presenceData;
    if (presenceData && presenceData.active) {
      const user = presenceData.active.find(u => u.email === userEmail || u.id === userEmail || u.userId === userEmail);
      if (user && user.auraColor) {
        Logger.debug(`GET_LATEST_AURA: Found real-time aura color for ${userEmail}: ${user.auraColor}`, null, 'general');
        return user.auraColor;
      }
    }
    
    // Fallback: try to get from current visibility data
    const visibilityData = window.currentVisibilityData;
    if (visibilityData && visibilityData.active) {
      const user = visibilityData.active.find(u => u.email === userEmail || u.id === userEmail || u.userId === userEmail);
      if (user && user.auraColor) {
        Logger.debug(`GET_LATEST_AURA: Found visibility aura color for ${userEmail}: ${user.auraColor}`, null, 'general');
        return user.auraColor;
      }
    }
    
    // Additional fallback: check if this is the current user and get from stored aura color
    if (window.currentUser && window.currentUser.email === userEmail) {
      const storedAuraColor = window.currentUser.auraColor;
      if (storedAuraColor && storedAuraColor !== null && storedAuraColor !== 'null') {
        Logger.debug(`GET_LATEST_AURA: Found stored aura color for current user ${userEmail}: ${storedAuraColor}`, null, 'general');
        return storedAuraColor;
      }
    }
    
    Logger.debug(`GET_LATEST_AURA: No real-time aura color found for ${userEmail}`, null, 'general');
    return null;
  } catch (error) {
    console.error(`❌ GET_LATEST_AURA: Error getting latest aura color for ${userEmail}:`, error);
    return null;
  }
}

function getSenderAvatar(author) {
  if (!author) return getSenderInitial('Unknown');
  
  Logger.debug(`GET_SENDER_AVATAR: [BUILD ${EXTENSION_BUILD}] Creating message avatar for:`, {
    name: author.name,
    email: author.email,
    auraColor: author.auraColor
  }, 'general');
  
  // Always try to get the latest aura color from presence data
  // This ensures cross-profile updates work correctly for ALL users
  const currentUserEmail = getCurrentUserEmail();
  if (author.email === currentUserEmail) {
    // For current user's messages, use current aura color
    const currentAuraColor = getCurrentUserAvatarBgColor();
    if (currentAuraColor) {
      author.auraColor = currentAuraColor;
      Logger.debug(`GET_SENDER_AVATAR: [BUILD ${EXTENSION_BUILD}] Using current aura color for current user:`, currentAuraColor, 'general');
    }
  } else {
    // For other users' messages, try to get the latest aura color from presence data
    // This ensures real-time aura updates for all users
    const latestAuraColor = getLatestAuraColorFromPresence(author.email);
    if (latestAuraColor) {
      author.auraColor = latestAuraColor;
      Logger.debug(`GET_SENDER_AVATAR: [BUILD ${EXTENSION_BUILD}] Using real-time aura color for other user:`, latestAuraColor, 'general');
    } else {
      Logger.debug(`GET_SENDER_AVATAR: [BUILD ${EXTENSION_BUILD}] Using stored aura color for other user:`, author.auraColor, 'general');
    }
  }
  
  // Use unified avatar system for consistency
  const avatarHTML = AvatarUtils.createUnifiedAvatar(author, {
    size: 32,
    showStatus: true,
    showAura: true,
    context: 'message',
    statusColor: '#22c55e' // Default green for message avatars
  });
  
  // DIAGNOSTIC: Log avatar resolution
  if (window.messageDiagnostic) {
    // Extract avatar URL from the HTML to determine if it's real or generic
    const avatarUrlMatch = avatarHTML.match(/src="([^"]+)"/);
    const avatarUrl = avatarUrlMatch ? avatarUrlMatch[1] : 'unknown';
    const isReal = !avatarUrl.includes('default-user');
    
    window.messageDiagnostic.logAvatarResolution(
      author.email,
      avatarUrl,
      isReal ? 'real' : 'generic'
    );
  }
  
  Logger.debug(`GET_SENDER_AVATAR: [BUILD ${EXTENSION_BUILD}] Generated message avatar HTML:`, avatarHTML, 'general');
  return avatarHTML;
}

function formatMessageTime(createdAt) {
  const messageDate = new Date(createdAt);
  const now = new Date();
  const diffMs = now - messageDate;
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  // Same day - show hours since posted
  if (diffDays === 0) {
    if (diffHours === 0) {
      const diffMins = Math.floor(diffMs / (1000 * 60));
      return diffMins <= 1 ? 'now' : `${diffMins}m`;
    }
    return `${diffHours}h`;
  }
  
  // Same year - show month and day
  if (messageDate.getFullYear() === now.getFullYear()) {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${months[messageDate.getMonth()]} ${messageDate.getDate()}`;
  }
  
  // Different year - show month, day, year
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${months[messageDate.getMonth()]} ${messageDate.getDate()}, ${messageDate.getFullYear()}`;
}

async function getMessageActionMenu(message) {
  Logger.debug(`MESSAGE_OPTIONS_DEBUG: Getting action menu for message ${message.id}`, null, 'general');
  Logger.debug(`MESSAGE_OPTIONS_DEBUG: Message author: ${message.authorId}, createdAt: ${message.createdAt}`, null, 'general');
  Logger.debug(`MESSAGE_OPTIONS_DEBUG: Message author object:`, message.author, 'general');
  
  const now = new Date();
  const messageDate = new Date(message.createdAt);
  const diffMs = now - messageDate;
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  
  Logger.debug(`MESSAGE_OPTIONS_DEBUG: Time diff - minutes: ${diffMinutes}, hours: ${diffHours}`, null, 'general');
  
  // Get current user to check ownership - use window.currentUser from direct auth
  const currentUser = window.currentUser;
  
  Logger.debug(`MESSAGE_OPTIONS_DEBUG: Current user from window.currentUser:`, currentUser, 'general');
  Logger.debug(`MESSAGE_OPTIONS_DEBUG: Current user email: ${currentUser ? currentUser.email : 'none'}`, null, 'general');
  
  // Use email for user identification - NO UUIDs
  let isOwner = false;
  if (currentUser && currentUser.email) {
    // Compare by email - the message should have author email
    const authorEmail = message.authorEmail || (message.author && message.author.email);
    isOwner = (authorEmail === currentUser.email);
    Logger.debug(`MESSAGE_OPTIONS_DEBUG: Is owner check - author email: ${authorEmail}, current user email: ${currentUser.email}, isOwner: ${isOwner}`, null, 'general');
  }
  
  // Check if user can edit/delete (only if they own the message)
  const canEdit = isOwner && diffHours < 1; // Can edit within 1 hour
  const canDelete = isOwner; // User can only delete their own messages
  
  Logger.debug(`MESSAGE_OPTIONS_DEBUG: Permissions - canEdit: ${canEdit}, canDelete: ${canDelete}`, null, 'general');
  const silentEdit = diffMinutes <= 5; // Silent edit within 5 minutes
  
  return `
    <div class="message-actions-menu" style="opacity: 1 !important; display: inline-block !important; visibility: visible !important; position: relative !important;">
      <button class="action-dots-btn" data-message-id="${message.id}" title="Message actions" style="opacity: 1 !important; display: block !important; visibility: visible !important; background: none !important; border: none !important; padding: 0 !important; margin: 0 !important;">
        <span class="action-dots" style="opacity: 1 !important; display: inline-block !important; visibility: visible !important; font-size: 16px !important; color: var(--text-secondary) !important; background: none !important;">⋯</span>
      </button>
      <div class="action-dropdown" style="display: none;">
        ${canEdit ? `<button class="action-item edit-btn" data-message-id="${message.id}">✏️ Edit</button>` : ''}
        ${canDelete ? `<button class="action-item delete-btn" data-message-id="${message.id}">🗑️ Delete</button>` : ''}
        <button class="action-item copy-link-btn" data-message-id="${message.id}">🔗 Copy link</button>
        <button class="action-item share-navigate-btn" data-message-id="${message.id}">🧭 Go to message</button>
        <button class="action-item share-focus-btn" data-message-id="${message.id}">🎯 Focus here</button>
        <button class="action-item share-notify-btn" data-message-id="${message.id}">📌 Reference</button>
        <button class="action-item block-btn" data-message-id="${message.id}" style="display:none;">🚫 Block user</button>
      </div>
    </div>
  `;
}

function canUserEditMessage(message) {
  // Check if current user is the author and message is less than 1 hour old
  const messageTime = new Date(message.createdAt);
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
  
  // Check against stored user email (not ID) - use window.currentUser
  const currentUserEmail = window.currentUser?.email;
  
  const authorEmail = message.authorEmail || (message.author && message.author.email);
  return authorEmail === currentUserEmail && messageTime > oneHourAgo;
}

function addMessageActionListeners(messageDiv, message) {
  // Action dots button
  const dotsBtn = messageDiv.querySelector('.action-dots-btn');
  const dropdown = messageDiv.querySelector('.action-dropdown');
  
  if (dotsBtn && dropdown) {
    // Toggle dropdown on dots click
    dotsBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      // Close other dropdowns first
      document.querySelectorAll('.action-dropdown').forEach(d => {
        if (d !== dropdown) d.style.display = 'none';
      });
      // Toggle this dropdown
      const isVisible = dropdown.style.display === 'block';
      dropdown.style.display = isVisible ? 'none' : 'block';
      
      // Position the dropdown if showing
      if (!isVisible) {
        const rect = dotsBtn.getBoundingClientRect();
        dropdown.style.position = 'fixed';
        dropdown.style.left = `${rect.right - 140}px`; // Align to right edge
        dropdown.style.top = `${rect.bottom + 5}px`; // Below the button
        dropdown.style.zIndex = '10000';
      }
    });
    
    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
      if (!messageDiv.contains(e.target)) {
        dropdown.style.display = 'none';
      }
    });
  }
  
  // Edit button
  const editBtn = messageDiv.querySelector('.edit-btn');
  if (editBtn) {
    editBtn.addEventListener('click', () => {
      dropdown.style.display = 'none';
      handleEditMessage(message);
    });
  }
  
  // Delete button
  const deleteBtn = messageDiv.querySelector('.delete-btn');
  if (deleteBtn) {
    deleteBtn.addEventListener('click', () => {
      dropdown.style.display = 'none';
      handleDeleteMessage(message);
    });
  }
  
  // Copy link button
  const copyLinkBtn = messageDiv.querySelector('.copy-link-btn');
  if (copyLinkBtn) {
    copyLinkBtn.addEventListener('click', () => {
      dropdown.style.display = 'none';
      handleCopyLink(message);
    });
  }
  
  // Enhanced sharing buttons
  const shareNavigateBtn = messageDiv.querySelector('.share-navigate-btn');
  if (shareNavigateBtn) {
    shareNavigateBtn.addEventListener('click', () => {
      dropdown.style.display = 'none';
      handleShareMessage(message, 'navigate');
    });
  }
  
  const shareFocusBtn = messageDiv.querySelector('.share-focus-btn');
  if (shareFocusBtn) {
    shareFocusBtn.addEventListener('click', () => {
      dropdown.style.display = 'none';
      handleShareMessage(message, 'focus');
    });
  }
  
  const shareNotifyBtn = messageDiv.querySelector('.share-notify-btn');
  if (shareNotifyBtn) {
    shareNotifyBtn.addEventListener('click', () => {
      dropdown.style.display = 'none';
      handleShareMessage(message, 'notify');
    });
  }
  
  // Reaction button
  const reactionBtn = messageDiv.querySelector('.reaction-btn');
  if (reactionBtn) {
    reactionBtn.addEventListener('click', () => handleReaction(message));
    
    // Load existing reactions for this message
    loadMessageReactions(message.id, reactionBtn);
  }
  
  // Reply button
  const replyBtn = messageDiv.querySelector('.inline-reply-btn');
  if (replyBtn) {
    replyBtn.addEventListener('click', () => handleReplyToMessage(message));
  }
  
  // Message body click for focus
  const messageContent = messageDiv.querySelector('.message-content');
  if (messageContent) {
    messageContent.addEventListener('click', (e) => {
      // Don't trigger if clicking on buttons/links
      if (e.target.tagName === 'BUTTON' || e.target.tagName === 'A') return;
      handleMessageFocus(message);
    });
    messageContent.style.cursor = 'pointer';
  }
  
  // Thread button removed - every post is automatically a thread
}

async function handleEditMessage(message) {
  const chatTextarea = document.getElementById('chat-textarea');
  const contextBar = document.getElementById('context-bar');
  const contextText = document.getElementById('context-text');
  const sendButton = document.querySelector('.chat-input-area button, #chat-send-btn');
  
  if (!chatTextarea) {
    console.error('Chat textarea not found');
    return;
  }
  
  // Store original state
  const originalPlaceholder = chatTextarea.placeholder;
  const originalValue = chatTextarea.value;
  const originalButtonText = sendButton ? sendButton.textContent : '';
  
  // Show context bar for edit mode
  if (contextBar && contextText) {
    const messageContent = message.body || message.content || '';
    const editText = messageContent.length > 50 
      ? messageContent.substring(0, 50) + '...' 
      : messageContent;
    contextText.textContent = `Editing: "${editText}"`;
    contextBar.style.display = 'block';
    contextBar.style.visibility = 'visible';
    contextBar.style.opacity = '1';
    contextBar.style.zIndex = '1001';
    
    // Apply theme-aware styling
    const isDarkMode = document.body.getAttribute('data-theme') === 'dark';
    if (isDarkMode) {
      contextBar.style.background = 'var(--background-secondary)';
      contextBar.style.borderBottom = '1px solid var(--border-color)';
      contextBar.style.color = 'var(--text-primary)';
      contextText.style.color = 'var(--text-primary)';
      const cancelBtn = contextBar.querySelector('#cancel-context');
      if (cancelBtn) cancelBtn.style.color = 'var(--text-primary)';
    } else {
      contextBar.style.background = 'var(--background-secondary)';
      contextBar.style.borderBottom = '1px solid var(--border-color)';
      contextBar.style.color = 'var(--text-primary)';
      contextText.style.color = 'var(--text-primary)';
      const cancelBtn = contextBar.querySelector('#cancel-context');
      if (cancelBtn) cancelBtn.style.color = 'var(--text-primary)';
    }
    
    console.log('Context bar should be visible for edit mode');
  } else {
    console.error('❌ Context bar elements not found:', { contextBar, contextText });
  }
  
  // Set up edit mode
  chatTextarea.placeholder = 'Edit your message...';
  chatTextarea.value = message.body || message.content || '';
  chatTextarea.dataset.editingMessageId = message.id;
  
  // Apply theme-aware styling for edit mode
  const isDarkMode = document.body.getAttribute('data-theme') === 'dark';
  if (isDarkMode) {
    chatTextarea.style.backgroundColor = 'var(--background-secondary)';
    chatTextarea.style.borderColor = 'var(--border-color)';
    chatTextarea.style.color = 'var(--text-primary)';
  } else {
    chatTextarea.style.backgroundColor = 'var(--background-secondary)';
    chatTextarea.style.borderColor = 'var(--border-color)';
    chatTextarea.style.color = 'var(--text-primary)';
  }
  chatTextarea.dataset.contextMode = 'edit';
  chatTextarea.focus();
  
  // Update send button to show "Update" or "Save"
  if (sendButton) {
    sendButton.textContent = 'Update';
    sendButton.dataset.editing = 'true';
  }
  
  // Add visual indicator
  chatTextarea.style.borderColor = 'var(--border-color)';
  chatTextarea.style.backgroundColor = 'var(--background-secondary)';
  
  // Handle save on Enter key
  const handleKeyDown = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      saveEdit();
    } else if (event.key === 'Escape') {
      cancelEdit();
    }
  };
  
  // Handle save on button click
  const handleButtonClick = () => {
    if (sendButton && sendButton.dataset.editing === 'true') {
      saveEdit();
    }
  };
  
  // Save the edit
  const saveEdit = async () => {
    const newContent = chatTextarea.value.trim();
    if (newContent && newContent !== (message.body || message.content)) {
      try {
        // Use robust integration if available, fallback to legacy
        console.log('✏️ EDIT: Checking robust integration...');
        console.log('✏️ EDIT: window.robustIntegration exists:', !!window.robustIntegration);
        console.log('✏️ EDIT: window.robustIntegration.isInitialized:', window.robustIntegration?.isInitialized);
        
        if (window.robustIntegration && window.robustIntegration.isInitialized) {
          console.log('✏️ EDIT: Using robust integration system');
          await window.robustIntegration.editMessage(message.id, newContent);
          console.log('✅ Message updated via robust integration');
        } else {
          // Fallback to legacy system
          const client = window.supabaseRealtimeClient || supabaseRealtimeClient;
          if (client) {
            await client.editMessage(message.id, newContent);
            console.log('✅ Message updated via Supabase real-time (legacy)');
          } else {
            console.error('❌ Supabase client not available for message editing');
            showNotification('Failed to update message. Supabase client not available.');
            return;
          }
        }
        
        // Update the message in the UI
        const messageDiv = document.querySelector(`[data-message-id="${message.id}"]`);
        if (messageDiv) {
          const contentDiv = messageDiv.querySelector('.message-content');
          contentDiv.innerHTML = convertUrlsToLinks(newContent);
          // Add edited indicator
          const timeElement = messageDiv.querySelector('.message-time-new');
          if (timeElement && !timeElement.textContent.includes('(edited)')) {
            timeElement.textContent += ' (edited)';
          }
        }
        showNotification('Message updated successfully');
      } catch (error) {
        console.error('Failed to edit message:', error);
        showNotification('Failed to edit message');
      }
    }
    cancelEdit();
  };
  
  // Cancel the edit
  const cancelEdit = () => {
    // Use the centralized clearContext function
    clearContext();
    
    // Remove event listeners
    chatTextarea.removeEventListener('keydown', handleKeyDown);
    if (sendButton) {
      sendButton.removeEventListener('click', handleButtonClick);
    }
  };
  
  // Add event listeners
  chatTextarea.addEventListener('keydown', handleKeyDown);
  if (sendButton) {
    sendButton.addEventListener('click', handleButtonClick);
  }
}

async function handleDeleteMessage(message) {
  if (confirm('Are you sure you want to delete this message?')) {
    try {
      // Check if this is a UUID (Supabase) or legacy post ID (backend API)
      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(message.id);
      console.log('🗑️ DELETE: Message ID:', message.id, 'Is UUID:', isUUID);
      
      if (isUUID) {
        // Use robust integration if available, fallback to legacy
        if (window.robustIntegration && window.robustIntegration.isInitialized) {
          console.log('🗑️ DELETE: Using robust integration system');
          await window.robustIntegration.deleteMessage(message.id);
          console.log('✅ Message deleted via robust integration');
        } else {
          // Fallback to legacy system
          const client = window.supabaseRealtimeClient || supabaseRealtimeClient;
          if (client) {
            await client.deleteMessage(message.id);
            console.log('✅ Message deleted via Supabase real-time (legacy)');
          }
        }
      } else {
        // Use API for legacy post IDs
        console.log('🗑️ DELETE: Using API for legacy message');
        await api.deleteMessage(message.id);
        console.log('✅ Message deleted via API');
      }
      
      // Remove the message from the UI
      const messageDiv = document.querySelector(`[data-message-id="${message.id}"]`);
      if (messageDiv) {
        messageDiv.remove();
      }
      
      showNotification('Message deleted successfully');
    } catch (error) {
      console.error('Failed to delete message:', error);
      showNotification('Failed to delete message');
    }
  }
}

async function handleCopyLink(message) {
  try {
    console.log('🔗 SHARE: Creating shareable link for message:', message.id);
    
    // Create shareable URL for the message using the abstracted navigation system
    const baseUrl = window.location.origin + window.location.pathname;
    const messageUrl = `${baseUrl}#message=${message.id}&conversation=${message.conversationId}`;
    
    // Copy to clipboard
    await navigator.clipboard.writeText(messageUrl);
    
    // Show feedback
    const copyBtn = document.querySelector(`[data-message-id="${message.id}"].copy-link-btn`);
    if (copyBtn) {
      const originalText = copyBtn.title;
      copyBtn.title = 'Copied!';
      setTimeout(() => {
        copyBtn.title = originalText;
      }, 2000);
    }
    
    // Add to notification history for tracking
    if (window.notificationHistory) {
      await window.notificationHistory.addNotification({
        type: 'MESSAGE_SHARED',
        title: '🔗 Message link copied',
        message: `Link to message "${message.body?.substring(0, 50)}..." copied to clipboard`,
        url: messageUrl,
        target: `[data-message-id="${message.id}"]`,
        data: {
          messageId: message.id,
          conversationId: message.conversationId,
          authorName: message.author?.name || 'Unknown'
        }
      });
    }
    
    debug('Message link copied to clipboard');
    console.log('🔗 SHARE: Message link created and copied:', messageUrl);
  } catch (error) {
    console.error('🔗 SHARE: Failed to copy message link:', error);
    debug('Failed to copy link: ' + error.message);
  }
}

// Enhanced message sharing with navigation system
async function handleShareMessage(message, shareType = 'link') {
  try {
    console.log('🔗 SHARE: Sharing message via', shareType, ':', message.id);
    
    const baseUrl = window.location.origin + window.location.pathname;
    const messageUrl = `${baseUrl}#message=${message.id}&conversation=${message.conversationId}`;
    
    switch (shareType) {
      case 'link':
        await handleCopyLink(message);
        break;
        
      case 'navigate':
        // Use the abstracted navigation system to navigate to the message
        if (window.navigationManager) {
          await window.navigationManager.navigateToUrl(messageUrl, `[data-message-id="${message.id}"]`);
        } else {
          // Fallback: open in new tab
          await chrome.tabs.create({ url: messageUrl });
        }
        break;
        
      case 'focus':
        // Focus on the message in current view
        await focusOnMessage(message);
        break;
        
      case 'notify':
        // Create a notification about this message
        if (window.notificationHistory) {
          await window.notificationHistory.addNotification({
            type: 'MESSAGE_REFERENCE',
            title: `📌 Message reference`,
            message: `Referenced message from ${message.author?.name || 'Unknown'}`,
            url: messageUrl,
            target: `[data-message-id="${message.id}"]`,
            data: {
              messageId: message.id,
              conversationId: message.conversationId,
              authorName: message.author?.name,
              content: message.body
            }
          });
        }
        break;
    }
    
    console.log('🔗 SHARE: Message shared successfully via', shareType);
  } catch (error) {
    console.error('🔗 SHARE: Error sharing message:', error);
    showNotification('Failed to share message');
  }
}

// Focus on a specific message in the current view
async function focusOnMessage(message) {
  try {
    console.log('🎯 FOCUS: Focusing on message:', message.id);
    
    // Find the message element
    const messageElement = document.querySelector(`[data-message-id="${message.id}"]`);
    if (!messageElement) {
      console.warn('🎯 FOCUS: Message element not found:', message.id);
      return;
    }
    
    // Scroll to message with smooth animation
    messageElement.scrollIntoView({ 
      behavior: 'smooth', 
      block: 'center',
      inline: 'nearest'
    });
    
    // Highlight the message temporarily
    messageElement.style.transition = 'all 0.3s ease';
    messageElement.style.backgroundColor = 'rgba(0, 123, 255, 0.1)';
    messageElement.style.borderLeft = '3px solid #007bff';
    
    // Remove highlight after 3 seconds
    setTimeout(() => {
      messageElement.style.backgroundColor = '';
      messageElement.style.borderLeft = '';
    }, 3000);
    
    console.log('🎯 FOCUS: Message focused and highlighted');
  } catch (error) {
    console.error('🎯 FOCUS: Error focusing on message:', error);
  }
}

// Enhanced message URL parsing and navigation
function parseMessageUrl(url) {
  try {
    const urlObj = new URL(url);
    const messageId = urlObj.hash.match(/message=([^&]+)/)?.[1];
    const conversationId = urlObj.hash.match(/conversation=([^&]+)/)?.[1];
    
    return {
      messageId,
      conversationId,
      isValid: !!(messageId && conversationId)
    };
  } catch (error) {
    console.error('🔗 PARSE: Error parsing message URL:', error);
    return { isValid: false };
  }
}

// Handle incoming message URLs (e.g., from shared links)
async function handleIncomingMessageUrl() {
  try {
    const currentUrl = window.location.href;
    const messageData = parseMessageUrl(currentUrl);
    
    if (messageData.isValid) {
      console.log('🔗 INCOMING: Processing incoming message URL:', messageData);
      
      // Wait for messages to load
      setTimeout(async () => {
        // Find the message element
        const messageElement = document.querySelector(`[data-message-id="${messageData.messageId}"]`);
        if (messageElement) {
          // Focus and highlight the message
          await focusOnMessage({ id: messageData.messageId });
          
          // Add to notification history
          if (window.notificationHistory) {
            await window.notificationHistory.addNotification({
              type: 'MESSAGE_NAVIGATED',
              title: '🔗 Navigated to shared message',
              message: 'Opened via shared link',
              url: currentUrl,
              target: `[data-message-id="${messageData.messageId}"]`,
              data: {
                messageId: messageData.messageId,
                conversationId: messageData.conversationId,
                source: 'shared_link'
              }
            });
          }
        } else {
          console.warn('🔗 INCOMING: Message not found in current view:', messageData.messageId);
        }
      }, 2000); // Wait for messages to load
    }
  } catch (error) {
    console.error('🔗 INCOMING: Error handling incoming message URL:', error);
  }
}

// Initialize message URL handling
if (window.location.hash.includes('message=')) {
  handleIncomingMessageUrl();
}

// Test enhanced sharing system
window.testEnhancedSharing = async function() {
  try {
    console.log('🔗 SHARING TEST: Testing enhanced sharing system...');
    
    // Find the first message to test with
    const firstMessage = document.querySelector('[data-message-id]');
    if (!firstMessage) {
      console.error('🔗 SHARING TEST: No messages found to test with');
      return;
    }
    
    const messageId = firstMessage.dataset.messageId;
    const message = {
      id: messageId,
      body: 'Test message for sharing',
      author: { name: 'Test User' },
      conversationId: 'test-conversation'
    };
    
    console.log('🔗 SHARING TEST: Testing with message:', messageId);
    
    // Test different sharing methods
    console.log('🔗 SHARING TEST: Testing link sharing...');
    await handleShareMessage(message, 'link');
    
    console.log('🔗 SHARING TEST: Testing focus sharing...');
    await handleShareMessage(message, 'focus');
    
    console.log('🔗 SHARING TEST: Testing notification sharing...');
    await handleShareMessage(message, 'notify');
    
    console.log('🔗 SHARING TEST: Enhanced sharing system test completed');
    console.log('🔗 SHARING TEST: Check notification history for results');
    
  } catch (error) {
    console.error('🔗 SHARING TEST: Error testing enhanced sharing:', error);
  }
};

async function handleMessageFocus(message) {
  try {
    debug(`Focusing on message: ${message.id}`);
    
    // Clear the current chat display
    const chatMessages = document.querySelector('.chat-messages');
    if (!chatMessages) return;
    
    // Store current state for navigation
    window.focusedMessage = message;
    window.previousView = message.parentId ? 'thread' : 'all';
    
    // Clear messages
    chatMessages.innerHTML = '';
    
    // Get conversation title for the header
    let conversationTitle = 'Thread';
    try {
      // Get the community ID from the message or use the first active community
      const communityId = message.communityId || (window.activeCommunities && window.activeCommunities[0]) || 'comm-001';
      // Use Supabase real-time - query by page_id only (community_id and conversation_id don't exist)
      const { data: conversationResponse, error } = await supabase
        .from('messages')
        .select('*')
        .eq('page_id', message.pageId || 'default')
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      if (conversationResponse && conversationResponse.title) {
        conversationTitle = conversationResponse.title;
      }
    } catch (error) {
      console.log('Could not get conversation title, using default');
    }
    
    // Add back navigation
    const backNav = document.createElement('div');
    backNav.className = 'navigation-header';
    
    if (message.parentId) {
      // This is a reply - back goes to the thread
      backNav.innerHTML = `
        <button class="back-btn" data-action="back">&lt;</button>
        <span class="focus-title">thread</span>
      `;
    } else {
      // This is a thread - back goes to all threads
      backNav.innerHTML = `
        <button class="back-btn" data-action="back">&lt;</button>
      `;
    }
    
    // CRITICAL FIX: Enhanced back button event handling
    const backBtn = backNav.querySelector('.back-btn');
    if (backBtn) {
      // Ensure button is enabled and visible
      backBtn.style.pointerEvents = 'auto';
      backBtn.style.opacity = '1';
      backBtn.style.cursor = 'pointer';
      backBtn.disabled = false;
      
      // Add click event listener
      backBtn.addEventListener('click', async (e) => {
        e.preventDefault();
        e.stopPropagation();
        console.log('🔙 BACK_BUTTON: Back button clicked');
        await handleBackNavigation();
      });
      
      // Add visual feedback
      backBtn.addEventListener('mouseenter', () => {
        backBtn.style.backgroundColor = 'var(--accent-color)';
        backBtn.style.color = 'white';
      });
      
      backBtn.addEventListener('mouseleave', () => {
        backBtn.style.backgroundColor = '';
        backBtn.style.color = '';
      });
      
      console.log('✅ BACK_BUTTON: Back button event listeners added');
    } else {
      console.error('❌ BACK_BUTTON: Back button not found in DOM');
    }
    
    chatMessages.appendChild(backNav);
    
    // Get the full conversation data first
    const focusCommunityId = message.communityId || (window.activeCommunities && window.activeCommunities[0]) || 'comm-001';
    // Use Supabase real-time instead of API polling
    const { data: response, error } = await supabase
      .from('messages')
      .select('*')
      .eq('community_id', focusCommunityId)
      .eq('page_id', message.pageId || this.currentPage?.pageId)
      .order('created_at', { ascending: true });
    
    if (error) throw error;
    
    // Calculate reply count for the focused message
    let replyCount = 0;
    if (response && response.posts) {
      const replies = response.posts.filter(post => post.parentId === message.id && !post.deletedAt);
      replyCount = replies.length;
    }
    
    // Show the focused message (as a thread, not a reply) with correct reply count and conversation data
    const focusedMsg = { 
      ...message, 
      isReply: false, 
      hasReplies: replyCount > 0, 
      replyCount: replyCount,
      conversation: response // Include the full conversation data
    };
    await addMessageToChat(focusedMsg);
    
    // Load and show replies to this message (expanded by default)
    const replyCommunityId = message.communityId || (window.activeCommunities && window.activeCommunities[0]) || 'comm-001';
    await loadMessageReplies(message.id, message.conversationId, replyCommunityId);
    
  } catch (error) {
    console.error('Failed to focus on message:', error);
    debug('Failed to focus on message: ' + error.message);
  }
}

async function loadMessageReplies(messageId, conversationId, communityId = null) {
  try {
    // Get the community ID from parameter or use the first active community
    const resolvedCommunityId = communityId || (window.activeCommunities && window.activeCommunities[0]) || 'comm-001';
    
    // Get the full conversation to find replies to this specific message
    // Use Supabase real-time instead of API polling
    const { data: response, error } = await supabase
      .from('messages')
      .select('*')
      .eq('community_id', resolvedCommunityId)
      .eq('page_id', this.currentPage?.pageId)
      .order('created_at', { ascending: true });
    
    if (error) throw error;
    
    if (response && response.posts) {
      const replies = response.posts.filter(post => post.parentId === messageId);
      
      // Sort replies by creation time
      replies.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
      
      // Add each reply (they will be visible since we're in focus mode)
      for (const reply of replies) {
        // Check if this reply has its own replies (nested replies)
        const nestedReplies = response.posts.filter(post => post.parentId === reply.id);
        
        const replyMsg = { 
          ...reply, 
          conversationId, 
          isReply: true, 
          hasReplies: nestedReplies.length > 0 // Show thread toggle if it has nested replies
        };
        await addMessageToChat(replyMsg);
      }
    }
  } catch (error) {
    console.error('Failed to load message replies:', error);
  }
}

async function handleBackNavigation() {
  console.log('🔙 BACK_NAV: Starting back navigation');
  console.log('🔙 BACK_NAV: focusedMessage:', !!window.focusedMessage);
  console.log('🔙 BACK_NAV: previousView:', window.previousView);
  
  if (window.focusedMessage && window.previousView) {
    // Store the current state before clearing
    const focusedMessage = window.focusedMessage;
    const previousView = window.previousView;
    
    console.log('🔙 BACK_NAV: Navigating back from', previousView, 'for message', focusedMessage.id);
    
    // Clear focus state
    delete window.focusedMessage;
    delete window.previousView;
    
    if (previousView === 'thread') {
      // This was a reply - go back to the thread view
      // We need to find the parent message and focus on it
      try {
        // Get the conversation to find the parent message
        const parentCommunityId = focusedMessage.communityId || (window.activeCommunities && window.activeCommunities[0]) || 'comm-001';
        // Use Supabase real-time
        const { data: response, error } = await supabase
          .from('messages')
          .select('*')
          .eq('community_id', parentCommunityId)
          .eq('page_id', this.currentPage?.pageId)
          .order('created_at', { ascending: true });
        
        if (error) throw error;
        if (response && response.conversations && response.conversations.length > 0) {
          const conversation = response.conversations[0];
          const parentMessage = conversation.posts.find(post => post.id === focusedMessage.parentId);
          if (parentMessage) {
            // Add conversation context to the parent message
            parentMessage.conversationId = conversation.id;
            parentMessage.conversationTitle = conversation.title;
            
            // Calculate proper counts for the parent message
            const directReplies = conversation.posts.filter(p => p.parentId === parentMessage.id);
            parentMessage.hasReplies = directReplies.filter(r => !r.deletedAt && r.body && r.body.trim() !== '[Deleted]').length > 0;
            parentMessage.replyCount = directReplies.filter(r => !r.deletedAt && r.body && r.body.trim() !== '[Deleted]').length;
            // Calculate reaction count for this specific message
            const parentReactions = conversation.reactions ? conversation.reactions.filter(r => r.postId === parentMessage.id) : [];
            parentMessage.reactionCount = parentReactions.length;
            
            // Focus on the parent message (which should be a thread)
            await handleMessageFocus(parentMessage);
            return;
          }
        }
      } catch (error) {
        console.error('Failed to navigate back to parent thread:', error);
      }
    }
    
    // Fallback: go back to all threads view
    console.log('🔙 BACK_NAV: Using fallback - loading chat history');
    await loadChatHistory();
  } else {
    console.log('🔙 BACK_NAV: No focus state found, loading chat history');
    await loadChatHistory();
  }
}

// Theme management functions
function initializeTheme() {
  // Load saved theme from storage or default to light
  // Modernized: Use StateManager instead of Chrome Storage
  getState('theme').then((theme) => {
    const savedTheme = theme || 'light';
    setTheme(savedTheme);
  });
}

function setTheme(theme) {
  const body = document.body;
  const themeIcon = document.getElementById('theme-icon');
  const themeText = document.getElementById('theme-text');
  
  if (theme === 'dark') {
    body.setAttribute('data-theme', 'dark');
    if (themeIcon) themeIcon.textContent = '☀️';
    if (themeText) themeText.textContent = 'Light mode';
  } else {
    body.setAttribute('data-theme', 'light');
    if (themeIcon) themeIcon.textContent = '🌙';
    if (themeText) themeText.textContent = 'Dark mode';
  }
  
  // Save theme preference
  chrome.storage.local.set({ theme: theme });
  debug(`Theme set to: ${theme}`);
}

function toggleTheme() {
  const currentTheme = document.body.getAttribute('data-theme') || 'light';
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
  setTheme(newTheme);
}

async function loadMessageReactions(messageId, reactionBtn) {
  try {
    // First try to get reactions from the stored reactions data if available
    let reactions = [];
    // Find the parent message div (not the button itself)
    const messageDiv = reactionBtn.closest('.message');
    if (messageDiv) {
      Logger.debug(`Message div found:`, messageDiv, 'general');
      Logger.debug(`Message div dataset:`, messageDiv.dataset, 'general');
      const reactionsData = messageDiv.dataset.reactions;
      Logger.info(`📊 Stored reactions data:`, reactionsData, 'general');
      if (reactionsData) {
        reactions = JSON.parse(reactionsData);
      }
    } else {
      Logger.error(`No message div found for reaction button`, null, 'general');
    }
    
    // Fallback to API call if no conversation data
    if (reactions.length === 0) {
      Logger.debug(`No stored reactions, calling API for message ${messageId}`, null, 'general');
      // NO POLLING - Reactions arrive via Supabase real-time subscription
      // Real-time reactions are handled by handleReactionChange()
      reactions = []; // Empty for now, will be populated by real-time events
      Logger.debug(`API returned reactions:`, reactions, 'realtime');
    }
    
    const countSpan = reactionBtn.querySelector('.icon-count');
    
    if (reactions && reactions.length > 0) {
      Logger.info(`📊 Found ${reactions.length} reactions`, null, 'general');
      
      // Update count
      if (countSpan) {
        countSpan.textContent = reactions.length;
        countSpan.style.display = 'inline';
        Logger.info(`📊 Updated count to: ${reactions.length}`, null, 'general');
      }
      
      // Check if current user has reacted - use window.currentUser
      const currentUser = window.currentUser;
      Logger.info(`👤 Current user:`, currentUser, 'general');
      
      if (currentUser) {
        // Generate the same UUID that the server uses
        const serverUserId = currentUser.id; // Use the user ID from the database
        Logger.info(`🆔 Generated server user ID: ${serverUserId}`, null, 'general');
        
        // Find user reaction by ID or email (fallback for existing data)
        Logger.info(`   Current user email: ${currentUser.email}`, null, 'general');
        Logger.info(`   All reaction user IDs:`, reactions.map(r => r.userId), 'general');
        
        const userReaction = reactions.find(r => 
          r.userId === serverUserId || 
          r.userId === currentUser.id || 
          r.user.email === currentUser.email
        );
        
        Logger.debug(`Looking for user reaction. Found:`, userReaction, 'general');
        Logger.debug(`All reactions:`, reactions.map(r => ({ userId: r.userId, emoji: r.emoji, kind: r.kind })), 'general');
        
        if (userReaction) {
          // Show the actual emoji from the database
          const emoji = userReaction.emoji || '👍';
          // Update the emoji but preserve the count span
          const countSpan = reactionBtn.querySelector('.icon-count');
          const countText = countSpan ? countSpan.textContent : '';
          reactionBtn.innerHTML = `${emoji}${countText ? `<span class="icon-count">${countText}</span>` : ''}`;
          reactionBtn.dataset.reaction = emoji;
        } else {
          Logger.error(`No user reaction found`, null, 'general');
        }
      } else {
        Logger.error(`No current user found`, null, 'general');
      }
    } else {
      Logger.info(`📊 No reactions found, setting default state`, null, 'general');
      // No reactions, hide count and set default state
      if (countSpan) {
        countSpan.textContent = '';
        countSpan.style.display = 'none';
      }
      reactionBtn.textContent = '🔘';
      delete reactionBtn.dataset.reaction;
    }
  } catch (error) {
    console.error('Failed to load reactions for message:', messageId, error);
  }
}

async function handleReaction(message) {
  const reactions = ['👍', '❓', '🔁', '🔗', '⚠️', '🙅'];
  
  // Find the reaction button that was clicked
  const reactionBtn = document.querySelector(`[data-message-id="${message.id}"].reaction-btn`);
  if (!reactionBtn) return;
  
  // Check if user is clicking on an existing reaction to remove it
  const currentReaction = reactionBtn.dataset.reaction;
  if (currentReaction && currentReaction !== '') {
    console.log('🔄 REACTION: User clicked existing reaction, removing it...');
    
    // Remove the reaction
    reactionBtn.textContent = '👍';
    reactionBtn.dataset.reaction = '';
    
    // Send remove reaction event
    try {
      const userEmail = await getCurrentUserEmail();
      const reactionData = {
        message_id: message.id,
        user_email: userEmail,
        reaction_type: 'REMOVE',
        emoji: '',
        timestamp: new Date().toISOString()
      };
      
      console.log('Reaction removed:', reactionData);
      
      // Emit real-time event for reaction removal
      if (window.reactionsIntegration && window.reactionsIntegration.isInitialized) {
        window.reactionsIntegration.removeReaction(message.id, currentReaction, userEmail);
      }
      
      return;
    } catch (error) {
      console.error('❌ REACTION: Failed to remove reaction:', error);
    }
  }
  
  // Create reaction modal
  const modal = document.createElement('div');
  modal.className = 'reaction-modal';
  modal.innerHTML = `
    <div class="reaction-options">
      ${reactions.map(reaction => `<button class="reaction-option" data-reaction="${reaction}">${reaction}</button>`).join('')}
    </div>
  `;
  
  // Position modal above the reaction button
  const rect = reactionBtn.getBoundingClientRect();
  modal.style.position = 'fixed';
  modal.style.left = `${rect.left}px`;
  modal.style.bottom = `${window.innerHeight - rect.top + 10}px`;
  modal.style.zIndex = '10000';
  
  // Add modal to page
  document.body.appendChild(modal);
  
  // Add click handlers for reaction options
  modal.querySelectorAll('.reaction-option').forEach(option => {
    option.addEventListener('click', async (e) => {
      const selectedReaction = e.target.dataset.reaction;
      
      // Update the reaction button with the selected reaction
      reactionBtn.textContent = selectedReaction;
      reactionBtn.dataset.reaction = selectedReaction;
      
      // Remove modal
      document.body.removeChild(modal);
      
      try {
        // Map emoji to semantically meaningful reaction kind (original mapping)
        const reactionMap = {
          '👍': 'AGREE',     // Thumbs up = agree
          '❓': 'QUESTION',  // Question mark = question
          '🔁': 'CLARIFY',      // Repeat = clarify
          '🔗': 'CITE',      // Link = cite
          '⚠️': 'FLAG',      // Warning = flag
          '🙅': 'DISAGREE'   // No gesture = disagree
        };
        
        const kind = reactionMap[selectedReaction] || 'AGREE';
        
        // Store the actual emoji clicked for later retrieval
        reactionBtn.dataset.selectedEmoji = selectedReaction;
        
        // Toggle reaction via API (store in message data)
        // Since reactions table doesn't exist, we'll use a simple approach
        const userEmail = await getCurrentUserEmail();
        const reactionData = {
          message_id: message.id,
          user_email: userEmail,
          reaction_type: kind,
          emoji: selectedReaction,
          timestamp: new Date().toISOString()
        };
        
        // For now, just log the reaction - in a real system, this would be stored
        console.log('Reaction added:', reactionData);
        
        // Simulate successful response
        const response = { success: true };
        
        // Update reaction count if available
        const countSpan = reactionBtn.querySelector('.icon-count');
        if (countSpan) {
          // Get current reactions to update count
          // NO POLLING - Reactions arrive via Supabase real-time subscription
          // Real-time reactions are handled by handleReactionChange()
          const reactions = []; // Will be populated by real-time events
          const count = reactions.length;
          
          if (count > 0) {
            countSpan.textContent = count;
            countSpan.style.display = 'inline';
          } else {
            countSpan.textContent = '';
            countSpan.style.display = 'none';
          }
        }
      } catch (error) {
        console.error('Failed to add reaction:', error);
        // Revert the button if API call failed
        reactionBtn.textContent = '🔘';
        delete reactionBtn.dataset.reaction;
      }
    });
  });
  
  // Close modal when clicking outside
  const closeModal = (e) => {
    if (!modal.contains(e.target)) {
      if (modal.parentNode) {
        document.body.removeChild(modal);
      }
      document.removeEventListener('click', closeModal);
    }
  };
  
  // Add click outside listener after a small delay to prevent immediate closure
  setTimeout(() => {
    document.addEventListener('click', closeModal);
  }, 100);
}

function handleReplyToMessage(message) {
  const chatInput = document.getElementById('chat-textarea');
  const contextBar = document.getElementById('context-bar');
  const contextText = document.getElementById('context-text');
  
  if (chatInput && contextBar && contextText) {
    // Show the actual message content instead of user name
    const messageContent = message.body || message.content || '';
    const replyText = messageContent.length > 50 
      ? messageContent.substring(0, 50) + '...' 
      : messageContent;
    
    // Show context bar
    contextText.textContent = `Replying to: "${replyText}"`;
    contextBar.style.display = 'block';
    contextBar.style.visibility = 'visible';
    contextBar.style.opacity = '1';
    contextBar.style.zIndex = '1001';
    
    // Apply theme-aware styling
    const isDarkMode = document.body.getAttribute('data-theme') === 'dark';
    if (isDarkMode) {
      contextBar.style.background = 'var(--background-secondary)';
      contextBar.style.borderBottom = '1px solid var(--border-color)';
      contextBar.style.color = 'var(--text-primary)';
      contextText.style.color = 'var(--text-primary)';
      const cancelBtn = contextBar.querySelector('#cancel-context');
      if (cancelBtn) cancelBtn.style.color = 'var(--text-primary)';
    } else {
      contextBar.style.background = 'var(--background-secondary)';
      contextBar.style.borderBottom = '1px solid var(--border-color)';
      contextBar.style.color = 'var(--text-primary)';
      contextText.style.color = 'var(--text-primary)';
      const cancelBtn = contextBar.querySelector('#cancel-context');
      if (cancelBtn) cancelBtn.style.color = 'var(--text-primary)';
    }
    
    console.log('Context bar should be visible for reply mode');
    
    // Clear input and focus
    chatInput.value = '';
    chatInput.placeholder = 'Type your reply...';
    chatInput.focus();
    autoResize(chatInput);
    
    // Store the parent message ID and conversation ID for when the reply is sent
    chatInput.dataset.replyTo = message.id;
    chatInput.dataset.replyToConversation = message.conversationId;
    chatInput.dataset.contextMode = 'reply';
  }
}

function clearContext() {
  console.log('🧹 Clearing context...');
  const chatInput = document.getElementById('chat-textarea');
  const contextBar = document.getElementById('context-bar');
  const sendButton = document.querySelector('.chat-input-area button, #chat-send-btn');
  
  console.log('🔍 Elements found:', { chatInput: !!chatInput, contextBar: !!contextBar, sendButton: !!sendButton });
  
  if (contextBar) {
    contextBar.style.display = 'none';
    contextBar.style.visibility = 'hidden';
    contextBar.style.opacity = '0';
    
    // Reset styling to default
    contextBar.style.background = '';
    contextBar.style.borderBottom = '';
    contextBar.style.color = '';
    const contextText = contextBar.querySelector('#context-text');
    if (contextText) contextText.style.color = '';
    const cancelBtn = contextBar.querySelector('#cancel-context');
    if (cancelBtn) cancelBtn.style.color = '';
    
  }
  
  if (chatInput) {
    // Clear all context data
    delete chatInput.dataset.replyTo;
    delete chatInput.dataset.replyToConversation;
    delete chatInput.dataset.editingMessageId;
    delete chatInput.dataset.contextMode;
    
    // Reset input to regular size
    chatInput.value = '';
    chatInput.placeholder = 'Start thread in Public Square';
    chatInput.style.borderColor = '';
    chatInput.style.backgroundColor = '';
    chatInput.style.color = '';
    
    // Reset height properly
    chatInput.style.height = 'auto';
    chatInput.style.overflowY = 'hidden';
    
    // Force a reflow to ensure the height resets
    chatInput.offsetHeight; // Force reflow
    
    // Ensure it's at natural height for empty content
    setTimeout(() => {
      if (chatInput.value === '') {
        chatInput.style.height = 'auto';
        // Let it naturally size to its content (empty = minimum height)
      }
    }, 10);
    
  }
  
  if (sendButton) {
    sendButton.textContent = 'Send';
    delete sendButton.dataset.editing;
  }
  
  console.log('🧹 Context cleared successfully');
}

function handleStartThread(message) {
  const chatInput = document.getElementById('chat-textarea');
  if (chatInput) {
    chatInput.value = `Starting thread on "${message.content.substring(0, 50)}...": `;
    chatInput.focus();
    autoResize(chatInput);
    
    // Store the thread message ID for when the thread message is sent
    chatInput.dataset.threadId = message.id;
  }
}

function updatePlaceholderText(communityName) {
  const chatTextarea = document.getElementById('chat-textarea');
  if (chatTextarea) {
    chatTextarea.placeholder = `Start thread in ${communityName}`;
  }
}

async function getCurrentPageUri() {
  try {
    // Get the active tab
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    const uri = tab && tab.url ? tab.url : null;
    console.log('Current page URI:', uri);
    debug(`Current page URI: ${uri}`);
    return uri;
  } catch (error) {
    console.error('Failed to get current page URI:', error);
    debug(`Failed to get current page URI: ${error.message}`);
    return null;
  }
}

async function handlePendingContent() {
  try {
    const result = await chrome.storage.local.get([
      'pendingMessageContent', 
      'pendingMessageUri',
      'pendingVisibilityContent',
      'pendingVisibilityUri'
    ]);

    // Handle pending message content
    if (result.pendingMessageContent) {
      const chatInput = document.getElementById('chat-textarea');
      if (chatInput) {
        // Pre-populate the message input with the selected content
        chatInput.value = `Commenting on: "${result.pendingMessageContent}"`;
        chatInput.focus();
        
        // Auto-resize the textarea
        autoResize(chatInput);
        
        // Clear the pending content
        await chrome.storage.local.remove(['pendingMessageContent', 'pendingMessageUri']);
        
        console.log('Pre-populated message input with selected content');
      }
    }

    // Handle pending visibility content
    if (result.pendingVisibilityContent) {
      // For now, we'll show a notification that visibility anchoring is not yet implemented
      // In the future, this could update the user's visibility status
      console.log('Pending visibility content:', result.pendingVisibilityContent);
      
      // Clear the pending content
      await chrome.storage.local.remove(['pendingVisibilityContent', 'pendingVisibilityUri']);
      
      // Show a temporary notification
      showNotification('Visibility anchoring feature coming soon!');
    }
  } catch (error) {
    console.error('Failed to handle pending content:', error);
  }
}

function showNotification(message) {
  // Create a temporary notification
  const notification = document.createElement('div');
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: #007bff;
    color: white;
    padding: 12px 16px;
    border-radius: 6px;
    font-size: 14px;
    z-index: 10000;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    animation: slideIn 0.3s ease-out;
  `;
  
  notification.textContent = message;
  document.body.appendChild(notification);
  
  // Remove after 3 seconds
  setTimeout(() => {
    notification.style.animation = 'slideOut 0.3s ease-in';
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 300);
  }, 3000);
}

// Guard to prevent duplicate loading
let isLoadingChatHistory = false;
let lastLoadedPageId = null;

async function loadChatHistory(communityId = null) {
  // Prevent duplicate loading
  if (isLoadingChatHistory) {
    console.log('🔍 CHAT_LOAD: Already loading chat history, skipping duplicate call');
    return;
  }
  
  const currentPageId = window.currentUrlData?.pageId;
  if (lastLoadedPageId === currentPageId) {
    console.log('🔍 CHAT_LOAD: Chat history already loaded for this page, skipping');
    return;
  }
  
  isLoadingChatHistory = true;
  lastLoadedPageId = currentPageId;
  
  try {
    // Get user's active communities
    const result = await chrome.storage.local.get(['activeCommunities', 'primaryCommunity', 'currentCommunity']);
    const activeCommunities = result.activeCommunities || [result.primaryCommunity || result.currentCommunity || 'comm-001'];
    
    // MODERN LOGGING: Structured logging for chat loading
    window.logger?.info('CHAT', 'Loading chat history for active communities', { 
      communities: activeCommunities,
      count: activeCommunities.length 
    });
    Logger.debug(`CHAT_LOAD: Loading chat history for active communities: ${activeCommunities.join(', ')}`, null, 'general');
    debug(`Loading chat history for active communities: ${activeCommunities.join(', ')}`);
    
    // Get normalized URL for page-specific messages - SAME AS VISIBILITY
    const urlData = await normalizeCurrentUrl();
    const currentUri = urlData.normalizedUrl; // Use normalized URL for consistency
    // MODERN LOGGING: Structured logging for URI processing
    window.logger?.info('CHAT', 'Loading chat history for normalized URI', { 
      normalizedUri: currentUri,
      rawUrl: urlData.rawUrl,
      communities: activeCommunities
    });
    Logger.debug(`CHAT_LOAD: Loading chat history for normalized URI: ${currentUri} (from raw: ${urlData.rawUrl})`, null, 'general');
    Logger.debug(`CHAT_LOAD: urlData object:`, JSON.stringify(urlData), 'general');
    Logger.debug(`CHAT_LOAD: currentUri before loop: ${currentUri}`, null, 'general');
    Logger.debug(`CHAT_LOAD: currentUri type: ${typeof currentUri}, value: ${JSON.stringify(currentUri)}`, null, 'general');
    debug(`Loading chat history for normalized URI: ${currentUri} (from raw: ${urlData.rawUrl})`);
    
    // Check if we're reloading the same URI unnecessarily
    if (lastLoadedUri === currentUri) {
      Logger.debug(`CHAT_LOAD: Same URI detected - checking if messages are still visible`, null, 'general');
      Logger.debug(`CHAT_LOAD: Last loaded URI: ${lastLoadedUri}, Current URI: ${currentUri}`, null, 'general');
      
      // CRITICAL FIX: Check if messages are still visible in the DOM
      const chatMessages = document.querySelector('.chat-messages');
      if (chatMessages) {
        const visibleMessages = chatMessages.querySelectorAll('.message:not([style*="display: none"])');
        const hasPlaceholder = chatMessages.innerHTML.includes('No messages yet');
        
        if (visibleMessages.length > 0) {
          Logger.debug(`CHAT_LOAD: Messages are still visible (${visibleMessages.length} messages), skipping reload`, null, 'general');
          return;
        } else if (!hasPlaceholder) {
          Logger.debug(`CHAT_LOAD: No visible messages but no placeholder - messages may have been cleared, reloading`, null, 'general');
          // Continue with reload to restore messages
        } else {
          Logger.debug(`CHAT_LOAD: Placeholder text present, skipping reload`, null, 'general');
          return;
        }
      } else {
        Logger.debug(`CHAT_LOAD: No chat messages element found, continuing with reload`, null, 'general');
      }
    }
    
    // Messages arrive via Supabase real-time
    
    Logger.debug(`CHAT_LOAD: URI changed - reloading chat history`, null, 'general');
    Logger.debug(`CHAT_LOAD: Last loaded URI: ${lastLoadedUri}, Current URI: ${currentUri}`, null, 'general');
    
    // Add a longer delay to ensure server has processed any recent messages
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Update last loaded URI
    lastLoadedUri = currentUri;
    
    // Load messages from all active communities
    const allConversations = [];
    const communitiesResult = await chrome.storage.local.get(['communities']);
    const communities = communitiesResult.communities || [];
    
    for (const communityId of activeCommunities) {
      try {
        Logger.debug(`CHAT_LOAD: === LOADING MESSAGES FOR COMMUNITY ${communityId} ===`, null, 'general');
        Logger.debug(`CHAT_LOAD: Requesting chat history for community ${communityId} with URI: ${currentUri}`, null, 'general');
        Logger.debug(`CHAT_LOAD: currentUri type: ${typeof currentUri}, value: ${JSON.stringify(currentUri)}`, null, 'general');
        Logger.debug(`CHAT_LOAD: About to call api.getChatHistory with communityId=${communityId}, threadId=null, uri=${currentUri}`, null, 'general');
        Logger.debug(`CHAT_LOAD: currentUri in loop: ${currentUri}`, null, 'general');
        
        // Load initial chat history via API, then real-time updates will handle new messages
        const response = await api.getChatHistory(communityId, null, currentUri);
        
        Logger.debug(`CHAT_LOAD: === API RESPONSE FOR COMMUNITY ${communityId} ===`, null, 'general');
        Logger.debug(`CHAT_LOAD: Response object:`, JSON.stringify(response, null, 2), 'general');
        Logger.debug(`CHAT_LOAD: Has conversations: ${!!response.conversations}`, null, 'general');
        Logger.debug(`CHAT_LOAD: Conversations count: ${response.conversations ? response.conversations.length : 0}`, null, 'general');
        
        if (response.conversations && response.conversations.length > 0) {
          Logger.success(`CHAT_LOAD: Found ${response.conversations.length} conversations for community ${communityId}`, null, 'general');
          response.conversations.forEach((conv, index) => {
            Logger.debug(`CHAT_LOAD: Conversation ${index + 1}:`, {
              id: conv.id,
              messageCount: conv.messages ? conv.messages.length : 0,
              firstMessage: conv.messages && conv.messages.length > 0 ? conv.messages[0].body.substring(0, 50) : 'N/A'
            }, 'general');
          });
          
          // Find community name
          const community = communities.find(c => c.id === communityId);
          const communityName = community ? community.name : `Community ${communityId}`;
          
          // Add community info to each conversation
          const conversationsWithCommunity = response.conversations.map(conv => ({
            ...conv,
            communityId: communityId,
            communityName: communityName
          }));
          allConversations.push(...conversationsWithCommunity);
          Logger.success(`CHAT_LOAD: Added ${conversationsWithCommunity.length} conversations from ${communityName}`, null, 'general');
        } else {
          console.warn(`⚠️ CHAT_LOAD: No conversations found for community ${communityId} - Empty or no messages on this page`);
        }
      } catch (error) {
        console.error(`❌ CHAT_LOAD: Failed to load chat history for community ${communityId}:`, error);
        console.error(`❌ CHAT_LOAD: Error details:`, {
          name: error.name,
          message: error.message,
          stack: error.stack
        });
      }
    }
    
    console.log('🔍 CHAT_LOAD: === FINAL COMBINED RESULTS ===');
    Logger.debug(`CHAT_LOAD: Total conversations from all communities: ${allConversations.length}`, null, 'general');
    console.log('🔍 CHAT_LOAD: Combined chat history from all communities:', allConversations);
    debug(`Combined chat history from all communities: ${JSON.stringify(allConversations)}`);
    
    const chatMessages = document.querySelector('.chat-messages');
    if (!chatMessages) {
      console.error('❌ CHAT_LOAD: No .chat-messages element found in DOM!');
      return;
    }
    console.log('✅ CHAT_LOAD: Found .chat-messages element');
    
    // Log current messages before clearing
    const currentMessages = chatMessages.querySelectorAll('.message');
    Logger.debug(`CHAT_LOAD: Current messages before clearing: ${currentMessages.length}`, null, 'general');
    console.log('🔍 CHAT_LOAD: Current message IDs:', Array.from(currentMessages).map(m => m.getAttribute('data-message-id')));
    
    // CRITICAL FIX: Don't clear real-time messages - merge them instead
    console.log('🔍 CHAT_LOAD: Preserving real-time messages and merging with API data');
    
    // Store existing real-time messages before clearing
    const existingMessageElements = Array.from(chatMessages.querySelectorAll('.message')).map(msg => ({
      id: msg.dataset.messageId,
      element: msg
    }));
    
    // CRITICAL FIX: Only clear messages if we have new data AND no existing messages
    const existingMessages = chatMessages.querySelectorAll('.message');
    if (allConversations.length > 0 && existingMessages.length === 0) {
      console.log('🔍 CHAT_LOAD: No existing messages, loading new data');
      chatMessages.innerHTML = '';
      // Clear global chat data storage
      window.currentChatData = [];
      console.log('✅ CHAT_LOAD: Messages cleared and global storage reset');
    } else if (allConversations.length > 0 && existingMessages.length > 0) {
      console.log('🔍 CHAT_LOAD: Existing messages found, merging with new data instead of clearing');
      console.log('🔍 CHAT_LOAD: Existing message count:', existingMessages.length);
      console.log('🔍 CHAT_LOAD: New conversation count:', allConversations.length);
      // Don't clear existing messages, just add new ones
    } else {
      console.log('🔍 CHAT_LOAD: No new data to load, preserving existing messages');
    }
    
    if (allConversations.length === 0) {
      console.warn('⚠️ CHAT_LOAD: NO MESSAGES TO DISPLAY - No conversations found for any active community on this page');
      console.warn('⚠️ CHAT_LOAD: Leaving placeholder text in place');
      chatMessages.innerHTML = '<p style="text-align: center; color: var(--text-secondary); padding: 20px;">No messages yet. Start a conversation!</p>';
      return;
    }
    
    Logger.debug(`CHAT_LOAD: Processing ${allConversations.length} conversations for display`, null, 'general');
    
    // Handle combined conversations from all communities
    if (allConversations.length > 0) {
      // Process each conversation as a thread
      for (const conversation of allConversations) {
        if (conversation.posts && conversation.posts.length > 0) {
          console.log('🔍 CHAT_LOAD: Processing conversation with posts:', conversation.posts.length);
          console.log('🔍 CHAT_LOAD: All posts in conversation:', conversation.posts.map(p => ({ id: p.id, body: p.body, createdAt: p.createdAt, parentId: p.parentId })));
          
          // Sort posts within each conversation by creation time
          const sortedPosts = conversation.posts.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
          console.log('🔍 CHAT_LOAD: Sorted posts:', sortedPosts.map(p => ({ id: p.id, body: p.body, createdAt: p.createdAt, parentId: p.parentId })));
          
          // Find ALL main thread posts (parentId === null) - not just the first one
          const mainThreadPosts = sortedPosts.filter(p => p.parentId === null);
          console.log('🔍 CHAT_LOAD: Found main thread posts:', mainThreadPosts.length);
          console.log('🔍 CHAT_LOAD: Main thread posts:', mainThreadPosts.map(p => ({ id: p.id, body: p.body, createdAt: p.createdAt })));
          
          if (mainThreadPosts.length === 0) return; // Skip if no main thread posts
          
          // Add ALL main thread posts in chronological order
          for (let i = 0; i < mainThreadPosts.length; i++) {
            const mainThreadPost = mainThreadPosts[i];
            
            // Find direct replies to this specific main thread post
            const directReplies = sortedPosts.filter(p => p.parentId === mainThreadPost.id);
            
            // Add conversation info to main thread post
            mainThreadPost.conversationId = conversation.id;
            mainThreadPost.conversationTitle = conversation.title;
            mainThreadPost.conversation = conversation; // Include full conversation data
            mainThreadPost.isReply = false;
            mainThreadPost.isFirstInThread = (i === 0); // Only the first post is "first in thread"
            const nonDeletedReplies = directReplies.filter(r => !r.deletedAt && r.body && r.body.trim() !== '[Deleted]');
            mainThreadPost.hasReplies = nonDeletedReplies.length > 0; // Only count NON-DELETED replies
            mainThreadPost.replyCount = nonDeletedReplies.length; // Count only non-deleted replies for display
            
            // COMPREHENSIVE DELETED MESSAGE DEBUGGING
            Logger.debug(`DELETED_MSG_DEBUG: [BUILD ${EXTENSION_BUILD}] === MAIN THREAD MESSAGE ANALYSIS ===`, null, 'general');
            Logger.debug(`DELETED_MSG_DEBUG: [BUILD ${EXTENSION_BUILD}] Message ID: ${mainThreadPost.id}`, null, 'general');
            Logger.debug(`DELETED_MSG_DEBUG: [BUILD ${EXTENSION_BUILD}] Message deletedAt: ${mainThreadPost.deletedAt}`, null, 'general');
            Logger.debug(`DELETED_MSG_DEBUG: [BUILD ${EXTENSION_BUILD}] Total direct replies: ${directReplies.length}`, null, 'general');
            Logger.debug(`DELETED_MSG_DEBUG: [BUILD ${EXTENSION_BUILD}] Non-deleted replies: ${nonDeletedReplies.length}`, null, 'general');
            Logger.debug(`DELETED_MSG_DEBUG: [BUILD ${EXTENSION_BUILD}] hasReplies: ${mainThreadPost.hasReplies}`, null, 'general');
            Logger.debug(`DELETED_MSG_DEBUG: [BUILD ${EXTENSION_BUILD}] replyCount: ${mainThreadPost.replyCount}`, null, 'general');
            if (directReplies.length > 0) {
              Logger.debug(`DELETED_MSG_DEBUG: [BUILD ${EXTENSION_BUILD}] Direct replies details:`, directReplies.map(r => ({ id: r.id, deletedAt: r.deletedAt, body: r.body })), 'general');
            }
            
            // Check if this message should be skipped
            if (mainThreadPost.deletedAt && !mainThreadPost.hasReplies) {
              Logger.debug(`DELETED_MSG_DEBUG: [BUILD ${EXTENSION_BUILD}] SKIPPING deleted main thread without replies: ${mainThreadPost.id}`, null, 'general');
              continue;
            } else if (mainThreadPost.deletedAt && mainThreadPost.hasReplies) {
              Logger.debug(`DELETED_MSG_DEBUG: [BUILD ${EXTENSION_BUILD}] SHOWING deleted main thread WITH replies: ${mainThreadPost.id}`, null, 'general');
            }
            // Calculate reaction count for this specific message
            const messageReactions = conversation.reactions ? conversation.reactions.filter(r => r.postId === mainThreadPost.id) : [];
            mainThreadPost.reactionCount = messageReactions.length;
            
            // Skip deleted main thread unless it has NON-DELETED replies
            // Check both deletedAt field and [Deleted] body content
            const isMainThreadDeleted = mainThreadPost.deletedAt || (mainThreadPost.body && mainThreadPost.body.trim() === '[Deleted]');
            if (isMainThreadDeleted && !mainThreadPost.hasReplies) {
              console.log('Skipping deleted main thread without NON-DELETED replies:', mainThreadPost.id, 'hasReplies:', mainThreadPost.hasReplies, 'totalReplies:', directReplies.length, 'nonDeletedReplies:', directReplies.filter(r => !r.deletedAt).length);
              continue; // Skip this deleted main thread, but continue with others
            }
            
            // Debug: Log when deleted main thread has non-deleted replies
            if (mainThreadPost.deletedAt && mainThreadPost.hasReplies) {
              console.log('Deleted main thread WITH non-deleted replies:', mainThreadPost.id, 'hasReplies:', mainThreadPost.hasReplies, 'totalReplies:', directReplies.length, 'nonDeletedReplies:', directReplies.filter(r => !r.deletedAt).length);
            }
            
            // Add the main thread post to chat
            console.log('🔍 CHAT_LOAD: Adding main thread post:', mainThreadPost.id);
            console.log('🔍 CHAT_LOAD: Main thread post details:', { id: mainThreadPost.id, body: mainThreadPost.body, createdAt: mainThreadPost.createdAt });
            
            // CRITICAL DEBUG: Check if this is one of the missing messages
            if (mainThreadPost.body === 'Google a' || mainThreadPost.body === 'Google b') {
              console.log('🚨🚨🚨 CRITICAL DEBUG: Processing missing message:', mainThreadPost.body);
              console.log('🚨🚨🚨 CRITICAL DEBUG: Message ID:', mainThreadPost.id);
              console.log('🚨🚨🚨 CRITICAL DEBUG: Message object:', mainThreadPost);
            }
            
            try {
              await addMessageToChat(mainThreadPost);
              console.log('✅ CHAT_LOAD: Main thread post added');
              
              // CRITICAL DEBUG: Verify message was added to DOM
              if (mainThreadPost.body === 'Google a' || mainThreadPost.body === 'Google b') {
                const addedMessage = document.querySelector(`[data-message-id="${mainThreadPost.id}"]`);
                console.log('🚨🚨🚨 CRITICAL DEBUG: Message in DOM after addMessageToChat:', !!addedMessage);
                if (addedMessage) {
                  console.log('🚨🚨🚨 CRITICAL DEBUG: Message element:', addedMessage);
                  console.log('🚨🚨🚨 CRITICAL DEBUG: Message visible:', addedMessage.offsetHeight > 0);
                }
              }
            } catch (error) {
              console.error('❌ CHAT_LOAD: Error adding main thread post:', error);
              if (mainThreadPost.body === 'Google a' || mainThreadPost.body === 'Google b') {
                console.log('🚨🚨🚨 CRITICAL DEBUG: ERROR adding missing message:', error);
              }
            }
            
            // Add direct replies to this main thread post (but not nested replies)
            for (const reply of directReplies) {
            // Count nested replies for this reply (only non-deleted ones)
            const nestedReplies = sortedPosts.filter(p => p.parentId === reply.id && !p.deletedAt);
            
            reply.conversationId = conversation.id;
            reply.conversationTitle = conversation.title;
            reply.conversation = conversation; // Include full conversation data
            reply.isReply = true;
            reply.isFirstInThread = false;
            reply.hasReplies = nestedReplies.filter(r => !r.deletedAt && r.body && r.body.trim() !== '[Deleted]').length > 0; // Only count NON-DELETED nested replies
            reply.replyCount = nestedReplies.filter(r => !r.deletedAt && r.body && r.body.trim() !== '[Deleted]').length; // Count only non-deleted nested replies
            // Calculate reaction count for this specific reply
            const replyReactions = conversation.reactions ? conversation.reactions.filter(r => r.postId === reply.id) : [];
            reply.reactionCount = replyReactions.length;
            
            // Skip deleted replies unless they have nested replies
            // Check both deletedAt field and [Deleted] body content
            const isReplyDeleted = reply.deletedAt || (reply.body && reply.body.trim() === '[Deleted]');
            if (isReplyDeleted && !reply.hasReplies) {
              console.log('Skipping deleted reply without nested replies:', reply.id);
              continue;
            }
            
            await addMessageToChat(reply);
            }
          }
          
          // Update message count tracking after processing all messages in this conversation
          const allMessages = document.querySelectorAll('.message');
          lastMessageCount = allMessages.length;
          if (allMessages.length > 0) {
            const lastMessage = allMessages[allMessages.length - 1];
            lastMessageId = lastMessage.getAttribute('data-message-id');
            console.log('🔍 CHAT_LOAD: Updated last message ID:', lastMessageId);
          }
        }
      }
    } else {
      chatMessages.innerHTML = '<p style="text-align: center; color: var(--text-secondary); padding: 20px;">Chat history appears here.</p>';
    }
  } catch (error) {
    console.error('Failed to load chat history:', error);
    debug(`Failed to load chat history: ${error.message}`);
  } finally {
    // Reset loading flag
    isLoadingChatHistory = false;
  }
}

// --- Supabase Real-time Client Initialization ---
async function initializeSupabaseRealtimeClient() {
  try {
    console.log('🚀 SUPABASE: Starting comprehensive real-time client initialization...');
    console.log('🚀 SUPABASE: Current window.supabase status:', typeof window.supabase);
    console.log('🚀 SUPABASE: Current window.supabaseRealtimeClient status:', typeof window.supabaseRealtimeClient);
    
    // Wait for Supabase library to load
    const waitForSupabase = () => {
      return new Promise((resolve) => {
        let attempts = 0;
        const maxAttempts = 50; // 5 seconds max wait
        
        const checkSupabase = () => {
          attempts++;
          
          console.log(`🔍 SUPABASE CHECK: Attempt ${attempts}/${maxAttempts}`);
          console.log(`🔍 SUPABASE CHECK: window.supabase type: ${typeof window.supabase}`);
          console.log(`🔍 SUPABASE CHECK: window.supabase.from type: ${typeof window.supabase?.from}`);
          
          // Check if window.supabase client is available (already initialized at top of file)
          // window.supabase is the CLIENT instance, not the library, so check for .from method
          if (typeof window.supabase !== 'undefined' && window.supabase && typeof window.supabase.from === 'function') {
            console.log('✅ SUPABASE CLIENT: Loaded and initialized successfully');
            console.log('✅ SUPABASE CLIENT: Available methods:', Object.keys(window.supabase).slice(0, 10));
            console.log('✅ SUPABASE CLIENT: Client ready for real-time operations');
            resolve(true);
          } else if (attempts >= maxAttempts) {
            console.error('❌ SUPABASE LIBRARY: Failed to load after 5 seconds');
            console.error('❌ SUPABASE LIBRARY: window.supabase:', typeof window.supabase);
            console.error('❌ SUPABASE LIBRARY: Available window keys:', Object.keys(window).filter(k => k.toLowerCase().includes('supabase')));
            console.error('❌ SUPABASE LIBRARY: This is a CRITICAL FAILURE - real-time will not work');
            resolve(false);
          } else {
            if (attempts % 10 === 0) {
              Logger.info(`⏳ SUPABASE LIBRARY: Waiting... (attempt ${attempts}/${maxAttempts})`, null, 'general');
            }
            setTimeout(checkSupabase, 100);
          }
        };
        
        checkSupabase();
      });
    };
    
    // Wait for library to load
    const loaded = await waitForSupabase();
    
    if (!loaded) {
      console.error('❌ SUPABASE: Cannot initialize without Supabase library');
      return;
    }
    
    console.log('🚀 SUPABASE: Initializing Supabase real-time client...');
    
    // Initialize Supabase real-time client
    console.log('🔍 SUPABASE_DEBUG: Checking SupabaseRealtimeClient availability...');
    console.log('🔍 SUPABASE_DEBUG: typeof SupabaseRealtimeClient:', typeof SupabaseRealtimeClient);
    console.log('🔍 SUPABASE_DEBUG: window.SupabaseRealtimeClient:', typeof window.SupabaseRealtimeClient);
    
    if (typeof SupabaseRealtimeClient !== 'undefined') {
      console.log('✅ SUPABASE_DEBUG: SupabaseRealtimeClient class found, creating instance...');
      window.supabaseRealtimeClient = new SupabaseRealtimeClient();
      console.log('✅ SUPABASE_DEBUG: Instance created:', !!window.supabaseRealtimeClient);
      
      // Initialize with Supabase credentials
      const supabaseUrl = SUPABASE_URL;
      const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp3eG9temttbmN3endyeXZ1ZHd1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk2Njg2ODQsImV4cCI6MjA3NTI0NDY4NH0.CoceGOzumiF6aYVGQSWily93snNYh9N9C4p8lrjrTyM';
      
      console.log('🔍 SUPABASE_DEBUG: Calling initialize method...');
      const success = await window.supabaseRealtimeClient.initialize(supabaseUrl, supabaseKey);
      console.log('🔍 SUPABASE_DEBUG: Initialize result:', success);
      
      if (success) {
        console.log('✅ SUPABASE: Real-time client initialized successfully');
        console.log('✅ SUPABASE: Supabase client:', window.supabaseRealtimeClient.supabase);
        console.log('✅ SUPABASE: isInitialized:', window.supabaseRealtimeClient.isInitialized);
        
        // CRITICAL FIX: Ensure real-time client is properly connected
        console.log('🔧 SUPABASE: Ensuring real-time connection...');
        window.supabaseRealtimeClient.isConnected = true;
        
        // Setup event handlers
        setupSupabaseEventHandlers();
        
        // CRITICAL FIX: Test the connection immediately
        console.log('🔧 SUPABASE: Testing real-time connection...');
        try {
          const testResult = await window.supabaseRealtimeClient.supabase
            .from('user_presence')
            .select('count')
            .limit(1);
          console.log('✅ SUPABASE: Connection test successful:', testResult);
        } catch (testError) {
          console.error('❌ SUPABASE: Connection test failed:', testError);
        }
      } else {
        console.error('❌ SUPABASE: Failed to initialize real-time client');
        console.error('❌ SUPABASE: This will cause ALL real-time features to fail');
      }
    } else {
      console.error('❌ SUPABASE: SupabaseRealtimeClient not available');
      console.error('❌ SUPABASE: Available window keys:', Object.keys(window).filter(k => k.toLowerCase().includes('supabase')));
    }
    
  } catch (error) {
    console.error('❌ SUPABASE: Error initializing real-time client:', error);
  }
}

function initializeRealGoogleAuth() {
  try {
    console.log('🚀 REAL_GOOGLE_AUTH: Initializing for actual Google profile pictures...');
    
    // Initialize real Google auth
    if (typeof RealGoogleAuth !== 'undefined') {
      realGoogleAuth = new RealGoogleAuth();
      realGoogleAuth.initialize().then(success => {
        if (success) {
          console.log('✅ REAL_GOOGLE_AUTH: Real Google Auth initialized successfully');
          console.log('✅ REAL_GOOGLE_AUTH: Will now use actual Google profile pictures');
        } else {
          console.error('❌ REAL_GOOGLE_AUTH: Failed to initialize');
        }
      });
    } else {
      console.warn('⚠️ REAL_GOOGLE_AUTH: RealGoogleAuth not available - check if script is loaded');
    }
  } catch (error) {
    console.error('❌ REAL_GOOGLE_AUTH: Error initializing:', error);
  }
}

// SD1 FIX: Convert Supabase message format to API format for addMessageToChat
async function convertSupabaseMessageToAPIFormat(supabaseMessage) {
  console.log('🔄 CONVERT_MESSAGE: Converting Supabase message to API format');
  console.log('🔄 CONVERT_MESSAGE: Supabase message:', supabaseMessage);
  
  // Extract user info from email
  const userEmail = supabaseMessage.user_email;
  const userName = userEmail.split('@')[0];
  const userHandle = userEmail.split('@')[0];
  
  // CRITICAL FIX: Fetch author data from user_presence table to get avatar and aura
  let authorData = {
    name: userName,
    handle: userHandle,
    email: userEmail,
    avatarUrl: null,
    auraColor: window.currentUser?.auraColor || '#aa00aa' // Use user's actual aura color
  };
  
  try {
    console.log('🔄 CONVERT_MESSAGE: Fetching author data from user_presence...');
    console.log('🔍 REMOTE AVATAR DEBUG: User email:', userEmail);
    console.log('🔍 REMOTE AVATAR DEBUG: Page ID:', supabaseMessage.page_id);
    
    const { data: presenceData, error } = await window.supabase
      .from('user_presence')
      .select('avatar_url, aura_color, user_name')
      .eq('user_email', userEmail)
      .eq('page_id', supabaseMessage.page_id)
      .limit(1);
    
    console.log('🔍 REMOTE AVATAR DEBUG: Presence query result:', { presenceData, error });
    
    if (error) {
      console.warn('⚠️ CONVERT_MESSAGE: Could not fetch author data:', error);
      console.log('🔍 REMOTE AVATAR DEBUG: Trying fallback query without page_id filter...');
      
      // Try fallback query without page_id filter
      const { data: fallbackData, error: fallbackError } = await window.supabase
        .from('user_presence')
        .select('avatar_url, aura_color, user_name')
        .eq('user_email', userEmail)
        .order('updated_at', { ascending: false })
        .limit(1);
      
      console.log('🔍 REMOTE AVATAR DEBUG: Fallback query result:', { fallbackData, fallbackError });
      
      if (fallbackData && fallbackData.length > 0) {
        console.log('✅ CONVERT_MESSAGE: Found author data via fallback:', fallbackData[0]);
        authorData.avatarUrl = fallbackData[0].avatar_url;
        authorData.auraColor = fallbackData[0].aura_color || window.currentUser?.auraColor || '#aa00aa';
        authorData.name = fallbackData[0].user_name || authorData.name;
        console.log('🔍 REMOTE AVATAR DEBUG: Updated author data with fallback:', {
          avatarUrl: authorData.avatarUrl,
          auraColor: authorData.auraColor,
          name: authorData.name
        });
      } else {
        console.log('🔍 REMOTE AVATAR DEBUG: No fallback data found, trying to get from visibility data...');
        // Try to get avatar from current visibility data
        if (window.currentVisibilityDataUnfiltered && window.currentVisibilityDataUnfiltered.active) {
          const userInVisibility = window.currentVisibilityDataUnfiltered.active.find(u => u.email === userEmail);
          if (userInVisibility && userInVisibility.avatarUrl) {
            console.log('🔍 REMOTE AVATAR DEBUG: Found avatar in visibility data:', userInVisibility.avatarUrl);
            authorData.avatarUrl = userInVisibility.avatarUrl;
            authorData.auraColor = userInVisibility.auraColor || '#aa00aa';
            authorData.name = userInVisibility.name || authorData.name;
          }
        }
        
        // If still no avatar, try to get from UnifiedPresenceManager if available
        if (!authorData.avatarUrl && window.UnifiedPresenceManager) {
          console.log('🔍 REMOTE AVATAR DEBUG: Trying UnifiedPresenceManager...');
          // This would need to be implemented in UnifiedPresenceManager
          // For now, we'll use a generic avatar as fallback
          console.log('🔍 REMOTE AVATAR DEBUG: Using generic avatar as final fallback');
        }
      }
    } else if (presenceData && presenceData.length > 0) {
      console.log('✅ CONVERT_MESSAGE: Found author data:', presenceData[0]);
      authorData.avatarUrl = presenceData[0].avatar_url;
      authorData.auraColor = presenceData[0].aura_color || window.currentUser?.auraColor || '#aa00aa';
      authorData.name = presenceData[0].user_name || authorData.name;
    } else {
      console.log('⚠️ CONVERT_MESSAGE: No presence data found for user');
    }
  } catch (error) {
    console.warn('⚠️ CONVERT_MESSAGE: Exception fetching author data:', error);
  }
  
  // Convert to API format that addMessageToChat expects
  const apiMessage = {
    id: supabaseMessage.id,
    body: supabaseMessage.content,
    content: supabaseMessage.content, // Also include content field
    author: authorData,
    createdAt: supabaseMessage.created_at,
    created_at: supabaseMessage.created_at, // Also include created_at field
    conversationId: `conv-${supabaseMessage.page_id}`, // Generate conversation ID from page_id
    conversation: {
      communityName: 'Current Community', // Will be updated by addMessageToChat
      reactions: [] // Start with no reactions
    },
    isReply: false, // Supabase messages are typically not replies
    hasReplies: false,
    replyCount: 0,
    reactionCount: 0,
    hasUnseenReplies: false,
    deletedAt: null,
    optionalContent: null
  };
  
  console.log('🔄 CONVERT_MESSAGE: Converted to API format with author data:', apiMessage);
  return apiMessage;
}

// SD1 Working Console Diagnostic Functions
window.quickStatus = function() {
  console.log('⚡ QUICK STATUS CHECK:');
  console.log('⚡ window.supabase:', !!window.supabase);
  console.log('⚡ window.supabaseRealtimeClient:', !!window.supabaseRealtimeClient);
  console.log('⚡ window.currentUser:', !!window.currentUser);
  console.log('⚡ window.currentUrlData:', !!window.currentUrlData);
  console.log('⚡ Channels active:', window.supabaseRealtimeClient?.channels?.size || 0);
  console.log('⚡ Is connected:', window.supabaseRealtimeClient?.isConnected || false);
  console.log('⚡ Current page:', window.currentUrlData?.pageId || 'NOT SET - CRITICAL ERROR');
  console.log('⚡ Current URL (raw):', window.currentUrlData?.rawUrl || 'NOT SET');
  console.log('⚡ Current URL (normalized):', window.currentUrlData?.normalizedUrl || 'NOT SET');
  console.log('⚡ Current user:', window.currentUser?.email || 'null');
  console.log('⚡ Current user avatar:', window.currentUser?.avatarUrl || 'null');
  console.log('⚡ Current user aura:', window.currentUser?.auraColor || 'null');
  
  // CRITICAL: Check if currentUrlData is null and warn
  if (!window.currentUrlData) {
    console.error('❌ CRITICAL ERROR: window.currentUrlData is null!');
    console.error('❌ This should NEVER happen in a browser extension!');
    console.error('❌ The extension should always know what page it\'s on.');
  }
};

window.testMessage = async function() {
  console.log('📝 Testing message sending...');
  if (window.supabaseRealtimeClient) {
    try {
      await window.supabaseRealtimeClient.sendMessage('TEST MESSAGE ' + Date.now());
      console.log('✅ Message sent successfully');
    } catch (error) {
      console.error('❌ Message sending failed:', error);
    }
  } else {
    console.log('❌ No real-time client available');
  }
};

window.testAura = function(color = '#ff0000') {
  console.log('🎨 Testing aura color change...');
  if (window.currentUser) {
    updateUserAuraInUI(window.currentUser.email, color);
    console.log('✅ Aura color change triggered');
  } else {
    console.log('❌ No current user available');
  }
};

window.testMessageSystem = async function() {
  console.log('');
  console.log('═══════════════════════════════════════════════════════════');
  console.log('🧪 MESSAGE SYSTEM TEST');
  console.log('═══════════════════════════════════════════════════════════');
  console.log('');
  
  // Test 1: Prerequisites
  console.log('📋 TEST 1: Prerequisites');
  console.log('  ✓ Supabase client:', !!window.supabase);
  console.log('  ✓ Realtime client:', !!window.supabaseRealtimeClient);
  console.log('  ✓ Current user:', !!window.currentUser);
  console.log('  ✓ Current page:', !!window.currentUrlData);
  console.log('  ✓ User email:', window.currentUser?.email || 'MISSING');
  console.log('  ✓ Page ID:', window.currentUrlData?.pageId || 'MISSING');
  console.log('');
  
  if (!window.supabaseRealtimeClient || !window.currentUser || !window.currentUrlData) {
    console.error('❌ Prerequisites not met. Cannot test message system.');
    return;
  }
  
  // Test 2: Send message
  console.log('📋 TEST 2: Sending test message');
  const testContent = `TEST MESSAGE ${Date.now()}`;
  console.log('  Content:', testContent);
  
  try {
    const message = await window.supabaseRealtimeClient.sendMessage(testContent);
    console.log('  ✅ Message sent successfully');
    console.log('  ✅ Message ID:', message?.id);
    console.log('  ✅ Is UUID:', /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(message?.id));
    console.log('');
    
    // Test 3: Check UI
    console.log('📋 TEST 3: Checking UI');
    await new Promise(resolve => setTimeout(resolve, 1000));
    const messageDiv = document.querySelector(`[data-message-id="${message.id}"]`);
    console.log('  ✓ Message in DOM:', !!messageDiv);
    if (messageDiv) {
      const authorElement = messageDiv.querySelector('[data-avatar-source]');
      const avatarSource = authorElement?.dataset.avatarSource;
      console.log('  ✓ Avatar source:', avatarSource);
      console.log('  ✓ Has delete button:', !!messageDiv.querySelector('[data-action="delete"]'));
    }
    console.log('');
    
    // Test 4: Delete message
    if (message?.id) {
      console.log('📋 TEST 4: Deleting test message');
      await window.supabaseRealtimeClient.deleteMessage(message.id);
      console.log('  ✅ Delete command sent');
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      const stillExists = document.querySelector(`[data-message-id="${message.id}"]`);
      console.log('  ✓ Message removed from UI:', !stillExists);
    }
    console.log('');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
  
  console.log('═══════════════════════════════════════════════════════════');
  console.log('🏁 MESSAGE SYSTEM TEST COMPLETED');
  console.log('═══════════════════════════════════════════════════════════');
  console.log('');
};

window.testVisibility = async function() {
  console.log('👁️ Testing visibility system...');
  try {
    await refreshVisibilityAvatars();
    console.log('✅ Visibility refresh completed');
  } catch (error) {
    console.error('❌ Visibility test failed:', error);
  }
};

window.checkSubscriptions = function() {
  console.log('📡 Checking real-time subscriptions...');
  if (window.supabaseRealtimeClient) {
    const channels = Array.from(window.supabaseRealtimeClient.channels.keys());
    console.log('📡 Active channels:', channels);
    console.log('📡 Channel count:', window.supabaseRealtimeClient.channels.size);
    
    if (channels.length > 0) {
      console.log('✅ Real-time subscriptions are active');
    } else {
      console.log('❌ No active real-time subscriptions');
    }
  } else {
    console.log('❌ No real-time client available');
  }
};

window.testDatabase = async function() {
  console.log('🗄️ Testing database connection...');
  if (window.supabase) {
    try {
      const { data, error } = await window.supabase
        .from('user_presence')
        .select('count')
        .limit(1);
      
      if (error) {
        console.error('❌ Database error:', error);
      } else {
        console.log('✅ Database connection successful');
      }
    } catch (error) {
      console.error('❌ Database test failed:', error);
    }
  } else {
    console.log('❌ No Supabase client available');
  }
};

window.testEventHandlers = function() {
  console.log('🔧 Testing event handlers...');
  if (window.supabaseRealtimeClient) {
    const handlers = {
      onUserJoined: typeof window.supabaseRealtimeClient.onUserJoined,
      onUserLeft: typeof window.supabaseRealtimeClient.onUserLeft,
      onUserUpdated: typeof window.supabaseRealtimeClient.onUserUpdated,
      onNewMessage: typeof window.supabaseRealtimeClient.onNewMessage,
      onMessageDeleted: typeof window.supabaseRealtimeClient.onMessageDeleted,
      onVisibilityChanged: typeof window.supabaseRealtimeClient.onVisibilityChanged
    };
    
    console.log('📊 Event handlers status:', handlers);
    
    const allHandlers = Object.values(handlers).every(h => h === 'function');
    if (allHandlers) {
      console.log('✅ All event handlers are properly set up');
    } else {
      console.log('❌ Some event handlers are missing');
    }
  } else {
    console.log('❌ No real-time client available');
  }
};

window.testMessagePropagation = async function() {
  console.log('💬 Testing message propagation UI...');
  try {
    // Test the conversion function
    const testSupabaseMessage = {
      id: 'test-uuid-123',
      user_email: 'test@example.com',
      content: 'Test message for propagation',
      created_at: new Date().toISOString(),
      page_id: 'test-page'
    };
    
    console.log('💬 Test Supabase message:', testSupabaseMessage);
    const converted = convertSupabaseMessageToAPIFormat(testSupabaseMessage);
    console.log('💬 Converted message:', converted);
    
    // Test addMessageToChat with converted message
    console.log('💬 Testing addMessageToChat with converted message...');
    await addMessageToChat(converted);
    console.log('✅ Message propagation test completed');
  } catch (error) {
    console.error('❌ Message propagation test failed:', error);
  }
};

window.testVisibilityUI = async function() {
  console.log('👁️ Testing visibility UI updates...');
  try {
    // Check current DOM state
    const beforeAvatars = document.querySelectorAll('.avatar-container, .user-avatar, .presence-avatar');
    console.log('👁️ Avatars before refresh:', beforeAvatars.length);
    
    // Force visibility refresh
    await refreshVisibilityAvatars();
    
    // Check DOM state after refresh
    setTimeout(() => {
      const afterAvatars = document.querySelectorAll('.avatar-container, .user-avatar, .presence-avatar');
      console.log('👁️ Avatars after refresh:', afterAvatars.length);
      console.log('👁️ DOM update successful:', afterAvatars.length > 0);
    }, 200);
    
    console.log('✅ Visibility UI test completed');
  } catch (error) {
    console.error('❌ Visibility UI test failed:', error);
  }
};

window.runFullTest = async function() {
  console.log('🚀 SD1: Running Full Diagnostic Test');
  
  quickStatus();
  await testDatabase();
  checkSubscriptions();
  testEventHandlers();
  await testMessage();
  testAura('#00ff00');
  await testVisibility();
  await testMessagePropagation();
  await testVisibilityUI();
  
  console.log('🏁 SD1: Full diagnostic completed');
};

console.log('🧪 SD1: Console diagnostic functions loaded. Available commands:');
console.log('🧪 quickStatus() - Quick status check');
console.log('🧪 testMessage() - Test message sending');
console.log('🧪 testAura(color) - Test aura color change');
console.log('🧪 testVisibility() - Test visibility system');
console.log('🧪 testMessagePropagation() - Test message UI propagation');
console.log('🧪 testVisibilityUI() - Test visibility UI updates');
console.log('🧪 checkSubscriptions() - Check real-time subscriptions');
console.log('🧪 testDatabase() - Test database connection');
console.log('🧪 testEventHandlers() - Test event handlers');
console.log('🧪 runFullTest() - Run comprehensive test');

// Setup Supabase real-time event handlers
function setupSupabaseEventHandlers() {
  if (!window.supabaseRealtimeClient) return;
  
  // Set up event handlers with comprehensive logging
  window.supabaseRealtimeClient.onUserJoined = (user) => {
    console.log('👋 SUPABASE: User joined:', user.user_email);
    console.log('👋 SUPABASE: Triggering visibility refresh...');
    refreshVisibilityAvatars().catch(err => console.error('Error refreshing visibility after user joined:', err));
  };
  
  window.supabaseRealtimeClient.onUserLeft = (user) => {
    console.log('👋 SUPABASE: User left:', user.user_email);
    console.log('👋 SUPABASE: Triggering visibility refresh...');
    refreshVisibilityAvatars().catch(err => console.error('Error refreshing visibility after user left:', err));
  };
  
  window.supabaseRealtimeClient.onUserUpdated = (user) => {
    console.log('🔄 SUPABASE: User updated:', user.user_email);
    console.log('🔄 SUPABASE: Aura color:', user.aura_color);
    // Update aura color if changed
    if (user.aura_color) {
      console.log('🎨 SUPABASE: Updating aura color in UI...');
      updateUserAuraInUI(user.user_email, user.aura_color);
    }
    // Also refresh visibility to show any other changes
    refreshVisibilityAvatars().catch(err => console.error('Error refreshing visibility after user update:', err));
  };
  
  window.supabaseRealtimeClient.onNewMessage = async (message) => {
    console.log('💬 SUPABASE: New message received:', message);
    console.log('💬 SUPABASE: From:', message.user_email);
    console.log('💬 SUPABASE: Content:', message.content?.substring(0, 50) + '...');
    
    // SD1 FIX: Convert Supabase message format to API format for addMessageToChat
    const convertedMessage = await convertSupabaseMessageToAPIFormat(message);
    console.log('💬 SUPABASE: Converted message:', convertedMessage);
    
    // Add message to chat immediately
    await addMessageToChat(convertedMessage);
    
    // Show notification for new message
    if (window.showNotification) {
      window.showNotification(`New message from ${message.user_email}`);
    }
  };
  
  window.supabaseRealtimeClient.onVisibilityChanged = (visibility) => {
    console.log('👁️ SUPABASE: Visibility changed:', visibility.user_email, visibility.is_visible);
    console.log('👁️ SUPABASE: Triggering visibility refresh...');
    refreshVisibilityAvatars().catch(err => console.error('Error refreshing visibility after visibility change:', err));
  };
  
  window.supabaseRealtimeClient.onMessageUpdated = async (message) => {
    console.log('✏️ SUPABASE: Message updated:', message);
    console.log('✏️ SUPABASE: Message ID:', message.id);
    console.log('✏️ SUPABASE: New content:', message.content?.substring(0, 50) + '...');
    
    // Convert Supabase message format to API format for updateMessageInChat
    const convertedMessage = await convertSupabaseMessageToAPIFormat(message);
    console.log('✏️ SUPABASE: Converted message:', convertedMessage);
    
    // Update message in chat
    updateMessageInChat(convertedMessage);
    console.log('✏️ SUPABASE: Message updated in UI');
  };
  
  window.supabaseRealtimeClient.onMessageDeleted = (deletion) => {
    console.log('🗑️ SUPABASE: Message deleted:', deletion);
    // Remove the deleted message from the UI
    const messageElement = document.querySelector(`[data-message-id="${deletion.message_id}"]`);
    if (messageElement) {
      messageElement.remove();
      console.log('✅ SUPABASE: Deleted message removed from UI');
    } else {
      console.log('⚠️ SUPABASE: Message element not found for deletion');
    }
  };
  
  console.log('✅ SUPABASE: Event handlers configured');
}

// CHROME EXTENSION WEBSOCKET FIX: Handle WebSocket messages from background service worker
function handleWebSocketMessage(data) {
  console.log('[WEBSOCKET] Handling message in side panel:', data);
  
  switch (data.type) {
    case 'MESSAGE_NEW':
      console.log('[WEBSOCKET] New message received:', data.message);
      // Real-time message already handled by handleMessageChange() - no need to reload
      
      // Show notification for new message
      if (window.notificationManager) {
        window.notificationManager.showNotification('MESSAGE_NEW', {
          authorName: data.message?.author?.name || 'Someone',
          content: data.message?.content || 'New message',
          authorEmail: data.message?.author?.email
        });
        
        // Show notification badge
        showNotificationBadge();
      }
      break;
      
    // REMOVED: AURA_COLOR_CHANGED case - now handled by Supabase real-time only
    // Aura changes are received via supabaseRealtimeClient.onUserUpdated
    // This prevents dual pathways (Supabase + chrome.runtime.onMessage)
      
    case 'PRESENCE_UPDATE':
      console.log('[WEBSOCKET] Presence update:', data.userEmail, data.availability);
      // Reload visible avatars
      loadCombinedAvatars().catch(err => console.error('[WEBSOCKET] Error loading avatars after presence update:', err));
      break;
      
    case 'VISIBILITY_UPDATE':
      console.log('[WEBSOCKET] Visibility update:', data.userEmail, data.is_visible);
      // Reload visible avatars
      loadCombinedAvatars().catch(err => console.error('[WEBSOCKET] Error loading avatars after visibility update:', err));
      break;
      
    case 'CONNECTION_ESTABLISHED':
      console.log('[WEBSOCKET] Connection established:', data.message);
      // Subscribe to current page for real-time updates
      subscribeToCurrentPage();
      break;
      
    case 'CONNECTION_ACKNOWLEDGED':
      console.log('[WEBSOCKET] Connection acknowledged:', data.message);
      // Connection is fully ready, start real-time features
      startRealTimeFeatures();
      break;
      
    default:
      console.log('[WEBSOCKET] Unknown message type:', data.type);
  }
}

// Subscribe to current page for real-time updates
async function subscribeToCurrentPage() {
  try {
    console.log('[WEBSOCKET] Subscribing to current page for real-time updates...');
    
    // Get current page info
    const urlData = await normalizeCurrentUrl();
    const user = window.currentUser;
    
    if (!user) {
      console.warn('[WEBSOCKET] No user found, cannot subscribe to page');
      return;
    }
    
    // Send subscription message
    await sendSupabaseMessage({
      type: 'PAGE_SUBSCRIPTION',
      userEmail: user.email,
      userId: user.id || user.email,
      pageId: urlData.pageId,
      url: urlData.normalizedUrl,
      timestamp: Date.now()
    });
    
    console.log('[WEBSOCKET] Page subscription sent for:', urlData.pageId);
  } catch (error) {
    console.error('[WEBSOCKET] Error subscribing to current page:', error);
  }
}

// Start real-time features after WebSocket connection is established
function startRealTimeFeatures() {
  console.log('[WEBSOCKET] Starting real-time features...');
  
  // Supabase handles reconnection automatically
  
  // CRITICAL FIX: Removed periodic connection check to prevent interference with Supabase real-time
  // Supabase handles connection management automatically
  
  console.log('[WEBSOCKET] Real-time features started');
}

// Initialize notification settings UI
async function initializeNotificationSettings() {
  try {
    console.log('🔔 SETTINGS: Initializing notification settings UI...');
    
    const settingsContainer = document.getElementById('notification-settings');
    if (!settingsContainer) {
      console.warn('🔔 SETTINGS: Notification settings container not found');
      return;
    }
    
    if (!window.notificationManager) {
      console.warn('🔔 SETTINGS: Notification manager not available');
      return;
    }
    
    // Wait for notification manager to initialize
    await window.notificationManager.initialize();
    
    // Get all notification types
    const notificationTypes = window.notificationManager.getAllNotificationTypes();
    
    // Clear existing content
    settingsContainer.innerHTML = '';
    
    // Create notification items
    notificationTypes.forEach(notification => {
      const notificationItem = document.createElement('div');
      notificationItem.className = 'notification-item';
      notificationItem.innerHTML = `
        <div class="notification-info">
          <div class="notification-icon">${notification.icon}</div>
          <div class="notification-details">
            <h5>${notification.name}</h5>
            <p>${notification.description}</p>
          </div>
        </div>
        <label class="notification-toggle">
          <input type="checkbox" ${notification.enabled ? 'checked' : ''} 
                 data-notification-type="${notification.id}">
          <span class="notification-slider"></span>
        </label>
      `;
      
      settingsContainer.appendChild(notificationItem);
    });
    
    // Add event listeners for toggles
    const toggles = settingsContainer.querySelectorAll('.notification-toggle input');
    toggles.forEach(toggle => {
      toggle.addEventListener('change', async (e) => {
        const notificationType = e.target.dataset.notificationType;
        const enabled = e.target.checked;
        
        Logger.info(`🔔 SETTINGS: ${notificationType} ${enabled ? 'enabled' : 'disabled'}`, null, 'general');
        
        await window.notificationManager.setEnabled(notificationType, enabled);
      });
    });
    
    console.log('🔔 SETTINGS: Notification settings UI initialized');
  } catch (error) {
    console.error('🔔 SETTINGS: Error initializing notification settings:', error);
  }
}

// Initialize notification icon in header
function initializeNotificationIcon() {
  try {
    console.log('🔔 ICON: Initializing notification icon...');
    
    const notificationIcon = document.getElementById('notification-icon');
    if (!notificationIcon) {
      console.warn('🔔 ICON: Notification icon not found');
      return;
    }
    
    // Add click handler to open settings
    notificationIcon.addEventListener('click', () => {
      console.log('🔔 ICON: Notification icon clicked');
      
      // Switch to Settings tab
      const settingsTab = document.querySelector('[data-tab="settings-tab"]');
      if (settingsTab) {
        settingsTab.click();
      }
    });
    
    // Add hover effect
    notificationIcon.addEventListener('mouseenter', () => {
      notificationIcon.style.backgroundColor = 'rgba(0, 0, 0, 0.1)';
      notificationIcon.style.borderRadius = '4px';
    });
    
    notificationIcon.addEventListener('mouseleave', () => {
      notificationIcon.style.backgroundColor = 'transparent';
    });
    
    console.log('🔔 ICON: Notification icon initialized');
  } catch (error) {
    console.error('🔔 ICON: Error initializing notification icon:', error);
  }
}

// Show notification badge
function showNotificationBadge() {
  try {
    const badge = document.getElementById('notification-badge');
    if (badge) {
      badge.style.display = 'block';
      
      // Auto-hide after 5 seconds
      setTimeout(() => {
        badge.style.display = 'none';
      }, 5000);
    }
  } catch (error) {
    console.error('🔔 BADGE: Error showing notification badge:', error);
  }
}

// Test notification system (for debugging)
window.testNotification = async function(type = 'MESSAGE_NEW') {
  try {
    console.log('🔔 TEST: Testing notification system...');
    
    if (!window.notificationManager) {
      console.error('🔔 TEST: Notification manager not available');
      return;
    }
    
    const testData = {
      MESSAGE_NEW: {
        authorName: 'Test User',
        content: 'This is a test message notification',
        authorEmail: 'test@example.com'
      },
      FRIEND_AURA_CHANGE: {
        userName: 'Test Friend',
        auraColor: '#ff0000',
        userEmail: 'friend@example.com'
      }
    };
    
    await window.notificationManager.showNotification(type, testData[type] || testData.MESSAGE_NEW);
    showNotificationBadge();
    
    console.log('🔔 TEST: Test notification sent');
  } catch (error) {
    console.error('🔔 TEST: Error testing notification:', error);
  }
};

// Test notification icon visibility
window.testNotificationIcon = function() {
  try {
    console.log('🔔 ICON TEST: Testing notification icon visibility...');
    
    const notificationIcon = document.getElementById('notification-icon');
    if (!notificationIcon) {
      console.error('🔔 ICON TEST: Notification icon not found in DOM');
      return;
    }
    
    console.log('🔔 ICON TEST: Notification icon found:', notificationIcon);
    console.log('🔔 ICON TEST: Icon display style:', notificationIcon.style.display);
    console.log('🔔 ICON TEST: Icon computed style:', window.getComputedStyle(notificationIcon).display);
    
    // Make sure it's visible
    notificationIcon.style.display = 'block';
    notificationIcon.style.visibility = 'visible';
    
    // Test badge
    const badge = document.getElementById('notification-badge');
    if (badge) {
      badge.style.display = 'block';
      badge.textContent = '1';
      console.log('🔔 ICON TEST: Badge shown');
    }
    
    console.log('🔔 ICON TEST: Notification icon should now be visible');
  } catch (error) {
    console.error('🔔 ICON TEST: Error testing notification icon:', error);
  }
};

// Comprehensive notification system test
window.testFullNotificationSystem = async function() {
  try {
    console.log('🔔 FULL TEST: Testing complete notification system...');
    
    // 1. Test notification icon visibility
    console.log('🔔 FULL TEST: Step 1 - Testing notification icon...');
    window.testNotificationIcon();
    
    // 2. Test Chrome desktop notification
    console.log('🔔 FULL TEST: Step 2 - Testing Chrome desktop notification...');
    await window.testNotification('MESSAGE_NEW');
    
    // 3. Test notification badge
    console.log('🔔 FULL TEST: Step 3 - Testing notification badge...');
    showNotificationBadge();
    
    // 4. Test notification history modal
    console.log('🔔 FULL TEST: Step 4 - Testing notification history modal...');
    window.openNotificationsModal();
    
    console.log('🔔 FULL TEST: Complete notification system test finished');
    console.log('🔔 FULL TEST: You should see:');
    console.log('  - A Chrome desktop notification popup');
    console.log('  - A red badge on the notification icon');
    console.log('  - The notifications modal should be open');
    console.log('  - Click the notification icon to open notifications');
    
  } catch (error) {
    console.error('🔔 FULL TEST: Error testing notification system:', error);
  }
};

// Enhanced Notification History System
class NotificationHistoryManager {
  constructor() {
    this.notifications = [];
    this.maxNotifications = 100;
    this.storageKey = 'notificationHistory';
    this.initialize();
  }
  
  async initialize() {
    try {
      // Load existing notifications from storage
      const result = await chrome.storage.local.get([this.storageKey]);
      this.notifications = result[this.storageKey] || [];
      console.log('🔔 HISTORY: Loaded', this.notifications.length, 'notifications from storage');
    } catch (error) {
      console.error('🔔 HISTORY: Error loading notifications:', error);
      this.notifications = [];
    }
  }
  
  async addNotification(notification) {
    try {
      const notificationData = {
        id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        type: notification.type,
        title: notification.title,
        message: notification.message,
        url: notification.url,
        target: notification.target, // Element selector or ID to highlight
        timestamp: Date.now(),
        read: false,
        data: notification.data || {}
      };
      
      // Add to beginning of array (most recent first)
      this.notifications.unshift(notificationData);
      
      // Keep only max notifications
      if (this.notifications.length > this.maxNotifications) {
        this.notifications = this.notifications.slice(0, this.maxNotifications);
      }
      
      // Save to storage
      await this.saveNotifications();
      
      // Update UI if modal is open
      this.updateNotificationsUI();
      
      // Update badge
      this.updateBadge();
      
      console.log('🔔 HISTORY: Added notification:', notificationData.title);
    } catch (error) {
      console.error('🔔 HISTORY: Error adding notification:', error);
    }
  }
  
  async markAsRead(notificationId) {
    try {
      const notification = this.notifications.find(n => n.id === notificationId);
      if (notification) {
        notification.read = true;
        await this.saveNotifications();
        this.updateNotificationsUI();
        this.updateBadge();
        console.log('🔔 HISTORY: Marked notification as read:', notificationId);
      }
    } catch (error) {
      console.error('🔔 HISTORY: Error marking notification as read:', error);
    }
  }
  
  async markAllAsRead() {
    try {
      this.notifications.forEach(notification => {
        notification.read = true;
      });
      await this.saveNotifications();
      this.updateNotificationsUI();
      this.updateBadge();
      console.log('🔔 HISTORY: Marked all notifications as read');
    } catch (error) {
      console.error('🔔 HISTORY: Error marking all notifications as read:', error);
    }
  }
  
  async clearAll() {
    try {
      this.notifications = [];
      await this.saveNotifications();
      this.updateNotificationsUI();
      this.updateBadge();
      console.log('🔔 HISTORY: Cleared all notifications');
    } catch (error) {
      console.error('🔔 HISTORY: Error clearing notifications:', error);
    }
  }
  
  async saveNotifications() {
    try {
      await chrome.storage.local.set({ [this.storageKey]: this.notifications });
    } catch (error) {
      console.error('🔔 HISTORY: Error saving notifications:', error);
    }
  }
  
  updateNotificationsUI() {
    const notificationsList = document.getElementById('notifications-list');
    const noNotifications = document.getElementById('no-notifications');
    
    if (!notificationsList) return;
    
    if (this.notifications.length === 0) {
      notificationsList.style.display = 'none';
      noNotifications.style.display = 'block';
      return;
    }
    
    notificationsList.style.display = 'block';
    noNotifications.style.display = 'none';
    
    // Clear existing notifications
    notificationsList.innerHTML = '';
    
    // Add each notification
    this.notifications.forEach((notification, index) => {
      const notificationElement = this.createNotificationElement(notification, index);
      notificationsList.appendChild(notificationElement);
    });
  }
  
  createNotificationElement(notification, index) {
    const element = document.createElement('div');
    element.className = `notification-item ${notification.read ? 'read' : 'unread'}`;
    element.dataset.notificationId = notification.id;
    
    // Add slide-in animation for new notifications
    if (index < 3) { // Only animate first 3 notifications
      element.classList.add('notification-slide-in');
    }
    
    const timeAgo = this.getTimeAgo(notification.timestamp);
    const icon = this.getNotificationIcon(notification.type);
    
    element.innerHTML = `
      <div class="notification-icon">${icon}</div>
      <div class="notification-content">
        <div class="notification-title">${notification.title}</div>
        <div class="notification-message">${notification.message}</div>
        <div class="notification-meta">
          <span class="notification-time">${timeAgo}</span>
          ${notification.url ? `<span class="notification-url" title="${notification.url}">${this.truncateUrl(notification.url)}</span>` : ''}
        </div>
        <div class="notification-actions">
          ${notification.url ? `<button class="notification-action-btn primary" data-action="navigate" data-url="${notification.url}" data-target="${notification.target || ''}">Go to Page</button>` : ''}
          <button class="notification-action-btn" data-action="mark-read" data-id="${notification.id}">Mark Read</button>
          <button class="notification-action-btn" data-action="dismiss" data-id="${notification.id}">Dismiss</button>
        </div>
      </div>
    `;
    
    // Add click handlers
    this.addNotificationHandlers(element, notification);
    
    return element;
  }
  
  addNotificationHandlers(element, notification) {
    // Click on notification item
    element.addEventListener('click', (e) => {
      if (e.target.closest('.notification-action-btn')) return; // Don't trigger on buttons
      
      this.handleNotificationClick(notification);
    });
    
    // Action buttons
    element.querySelectorAll('.notification-action-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const action = btn.dataset.action;
        
        switch (action) {
          case 'navigate':
            this.navigateToUrl(btn.dataset.url, btn.dataset.target);
            break;
          case 'mark-read':
            this.markAsRead(btn.dataset.id);
            break;
          case 'dismiss':
            this.dismissNotification(btn.dataset.id);
            break;
        }
      });
    });
  }
  
  async handleNotificationClick(notification) {
    try {
      // Mark as read
      await this.markAsRead(notification.id);
      
      // Navigate if URL exists
      if (notification.url) {
        this.navigateToUrl(notification.url, notification.target);
      }
    } catch (error) {
      console.error('🔔 HISTORY: Error handling notification click:', error);
    }
  }
  
  async navigateToUrl(url, target) {
    try {
      console.log('🔔 NAVIGATION: Navigating to:', url, 'target:', target);
      
      // Use the abstracted navigation system
      if (window.navigationManager) {
        await window.navigationManager.navigateToUrl(url, target);
      } else {
        // Fallback: simple navigation
        await chrome.tabs.create({ url: url });
      }
    } catch (error) {
      console.error('🔔 NAVIGATION: Error navigating to URL:', error);
    }
  }
  
  async dismissNotification(notificationId) {
    try {
      this.notifications = this.notifications.filter(n => n.id !== notificationId);
      await this.saveNotifications();
      this.updateNotificationsUI();
      this.updateBadge();
      console.log('🔔 HISTORY: Dismissed notification:', notificationId);
    } catch (error) {
      console.error('🔔 HISTORY: Error dismissing notification:', error);
    }
  }
  
  updateBadge() {
    const unreadCount = this.notifications.filter(n => !n.read).length;
    const badge = document.getElementById('notification-badge');
    const userMenuBadge = document.getElementById('user-menu-notification-badge');
    
    if (badge) {
      if (unreadCount > 0) {
        badge.style.display = 'block';
        badge.textContent = unreadCount > 99 ? '99+' : unreadCount.toString();
      } else {
        badge.style.display = 'none';
      }
    }
    
    if (userMenuBadge) {
      if (unreadCount > 0) {
        userMenuBadge.style.display = 'block';
        userMenuBadge.textContent = unreadCount > 99 ? '99+' : unreadCount.toString();
      } else {
        userMenuBadge.style.display = 'none';
      }
    }
  }
  
  getTimeAgo(timestamp) {
    const now = Date.now();
    const diff = now - timestamp;
    
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  }
  
  getNotificationIcon(type) {
    const icons = {
      'MESSAGE_NEW': '💬',
      'MENTION': '🗣️',
      'COMMUNITY_JOIN': '👥',
      'FRIEND_AURA_CHANGE': '✨',
      'default': '🔔'
    };
    return icons[type] || icons.default;
  }
  
  truncateUrl(url) {
    if (url.length <= 30) return url;
    return url.substring(0, 27) + '...';
  }
}

// Abstracted Navigation System
class NavigationManager {
  constructor() {
    this.initialize();
  }
  
  async initialize() {
    console.log('🧭 NAVIGATION: Navigation manager initialized');
  }
  
  async navigateToUrl(url, target) {
    try {
      console.log('🧭 NAVIGATION: Navigating to URL:', url, 'with target:', target);
      
      // Get current active tab
      const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true });
      
      if (activeTab && activeTab.url === url) {
        // Already on the target page, just focus and highlight
        await this.focusAndHighlight(target);
      } else {
        // Navigate to the URL
        await chrome.tabs.update(activeTab.id, { url: url });
        
        // Wait for page to load, then highlight
        setTimeout(() => {
          this.focusAndHighlight(target);
        }, 2000);
      }
    } catch (error) {
      console.error('🧭 NAVIGATION: Error navigating:', error);
    }
  }
  
  async focusAndHighlight(target) {
    try {
      if (!target) return;
      
      console.log('🧭 NAVIGATION: Focusing and highlighting target:', target);
      
      // Send message to content script to highlight the target
      const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true });
      
      if (activeTab) {
        await chrome.tabs.sendMessage(activeTab.id, {
          type: 'HIGHLIGHT_TARGET',
          target: target
        });
      }
    } catch (error) {
      console.error('🧭 NAVIGATION: Error focusing target:', error);
    }
  }
}

// Initialize notification history system
window.notificationHistory = new NotificationHistoryManager();
window.navigationManager = new NavigationManager();

// Open notifications modal
window.openNotificationsModal = function() {
  try {
    console.log('🔔 MODAL: Opening notifications modal...');
    
    const modal = document.getElementById('notifications-modal');
    if (!modal) {
      console.error('🔔 MODAL: Notifications modal not found');
      return;
    }
    
    // Show modal
    modal.style.display = 'flex';
    
    // Update notifications UI
    window.notificationHistory.updateNotificationsUI();
    
    // Add event listeners for modal actions
    const markAllReadBtn = document.getElementById('mark-all-read-btn');
    const clearAllBtn = document.getElementById('clear-all-btn');
    const closeBtn = modal.querySelector('.close-button');
    
    if (markAllReadBtn) {
      markAllReadBtn.onclick = () => window.notificationHistory.markAllAsRead();
    }
    
    if (clearAllBtn) {
      clearAllBtn.onclick = () => window.notificationHistory.clearAll();
    }
    
    if (closeBtn) {
      closeBtn.onclick = () => {
        modal.style.display = 'none';
      };
    }
    
    // Close modal when clicking outside
    modal.onclick = (e) => {
      if (e.target === modal) {
        modal.style.display = 'none';
      }
    };
    
    console.log('🔔 MODAL: Notifications modal opened');
  } catch (error) {
    console.error('🔔 MODAL: Error opening notifications modal:', error);
  }
};

// Enhanced notification system integration
function initializeEnhancedNotifications() {
  try {
    console.log('🔔 ENHANCED: Initializing enhanced notification system...');
    
    // Add notifications button to profile dropdown
    const notificationsBtn = document.getElementById('notifications-btn');
    if (notificationsBtn) {
      notificationsBtn.addEventListener('click', () => {
        window.openNotificationsModal();
      });
    }
    
    // Override the existing showNotification function to also add to history
    const originalShowNotification = window.showNotification;
    window.showNotification = function(message, type = 'info', url = null, target = null) {
      // Call original function
      if (originalShowNotification) {
        originalShowNotification(message);
      }
      
      // Add to notification history
      window.notificationHistory.addNotification({
        type: type,
        title: type === 'info' ? 'Notification' : type.charAt(0).toUpperCase() + type.slice(1),
        message: message,
        url: url,
        target: target
      });
    };
    
    // Enhanced WebSocket message handling
    const originalHandleWebSocketMessage = window.handleWebSocketMessage;
    window.handleWebSocketMessage = function(data) {
      // Call original function
      if (originalHandleWebSocketMessage) {
        originalHandleWebSocketMessage(data);
      }
      
      // Add to notification history based on message type
      switch (data.type) {
        case 'MESSAGE_NEW':
          window.notificationHistory.addNotification({
            type: 'MESSAGE_NEW',
            title: `💬 New message from ${data.message?.author?.name || 'Someone'}`,
            message: data.message?.content || 'New message',
            url: data.url || window.location.href,
            target: `[data-message-id="${data.message?.id}"]`
          });
          break;
          
        case 'AURA_COLOR_CHANGED':
          if (data.userEmail !== window.currentUser?.email) {
            window.notificationHistory.addNotification({
              type: 'FRIEND_AURA_CHANGE',
              title: `✨ ${data.userName || data.userEmail} changed their aura`,
              message: `Their new aura color is ${data.auraColor}`,
              url: data.url || window.location.href,
              target: `[data-user-email="${data.userEmail}"]`
            });
          }
          break;
      }
    };
    
    console.log('🔔 ENHANCED: Enhanced notification system initialized');
  } catch (error) {
    console.error('🔔 ENHANCED: Error initializing enhanced notifications:', error);
  }
}

// Initialize enhanced notifications when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeEnhancedNotifications);
} else {
  initializeEnhancedNotifications();
}

// Broadcast aura color change to all users on the same page
async function broadcastAuraChange(auraColor) {
  try {
    console.log('[WEBSOCKET] Broadcasting aura color change:', auraColor);
    
    const user = window.currentUser;
    if (!user) {
      console.warn('[WEBSOCKET] No user found, cannot broadcast aura change');
      return;
    }
    
    // Get current page info
    const urlData = await normalizeCurrentUrl();
    
    // Send aura change message
    await sendSupabaseMessage({
      type: 'AURA_COLOR_CHANGED',
      userEmail: user.email,
      userId: user.id || user.email,
      auraColor: auraColor,
      pageId: urlData.pageId,
      url: urlData.normalizedUrl,
      timestamp: Date.now()
    });
    
    console.log('[WEBSOCKET] Aura color change broadcast sent');
  } catch (error) {
    console.error('[WEBSOCKET] Error broadcasting aura change:', error);
  }
}

// CHROME EXTENSION WEBSOCKET FIX: Send WebSocket message via background service worker
// SUPABASE REAL-TIME: Send message via Supabase real-time
async function sendSupabaseMessage(message) {
  const timer = realtimeLogger.startTimer('supabase_send');
  realtimeLogger.startFlow('supabase_send', { messageType: message.type, timestamp: Date.now() });
  
  try {
    if (!window.aurasIntegration || !window.aurasIntegration.isInitialized) {
      console.error('❌ SUPABASE: Auras integration not initialized');
      return false;
    }
    
    realtimeLogger.supabase('info', 'Sending message via Supabase real-time', {
      type: message.type,
      hasContent: !!message.content,
      hasUserEmail: !!message.userEmail,
      hasAuraColor: !!message.auraColor,
      timestamp: message.timestamp
    });
    
    realtimeLogger.stepFlow('supabase_send', 'Preparing Supabase real-time message');
    
    let success = false;
    
    switch (message.type) {
      case 'MESSAGE_NEW':
        success = await window.supabaseRealtimeClient.sendMessage(message.content);
        break;
      case 'AURA_COLOR_CHANGED':
        success = await window.supabaseRealtimeClient.broadcastAuraColorChange(message.color);
        break;
      case 'PRESENCE_UPDATE':
        success = await window.supabaseRealtimeClient.updatePresence(
          message.pageId, 
          message.pageUrl, 
          message.auraColor
        );
        break;
      case 'VISIBILITY_UPDATE':
        success = await window.supabaseRealtimeClient.setUserVisibility(
          message.isVisible, 
          message.pageUrl
        );
        break;
      default:
        console.warn('❓ SUPABASE: Unknown message type:', message.type);
        return false;
    }
    
    realtimeLogger.stepFlow('supabase_send', 'Received response from Supabase');
    
    if (success) {
      realtimeLogger.supabase('info', 'Message sent successfully via Supabase', {
        messageType: message.type,
        responseTime: realtimeLogger.endTimer(timer)
      });
      realtimeLogger.endFlow('supabase_send', true, { success });
      return true;
    } else {
      realtimeLogger.supabase('error', 'Failed to send message via Supabase', {
        messageType: message.type,
        responseTime: realtimeLogger.endTimer(timer)
      });
      realtimeLogger.endFlow('supabase_send', false, { success });
      return false;
    }
  } catch (error) {
    realtimeLogger.supabase('error', 'Error sending message via Supabase', {
      messageType: message.type,
      error: error.message,
      stack: error.stack,
      responseTime: realtimeLogger.endTimer(timer)
    });
    realtimeLogger.endFlow('supabase_send', false, { error: error.message });
    return false;
  }
}

// --- UI Update Function ---
async function updateUI(user) {
  console.log('[UPDATE_UI] === START updateUI ===');
  console.log('[UPDATE_UI] User object:', user);
  
  const userInfoDiv = document.getElementById('user-info');
  const userMenuName = document.getElementById('user-menu-name');
  const userAvatarContainer = document.getElementById('user-avatar-container');
  
  console.log('[UPDATE_UI] DOM elements found:');
  console.log('[UPDATE_UI]   userInfoDiv:', !!userInfoDiv, userInfoDiv);
  console.log('[UPDATE_UI]   userMenuName:', !!userMenuName, userMenuName);
  console.log('[UPDATE_UI]   userAvatarContainer:', !!userAvatarContainer, userAvatarContainer);

  if (user) {
    console.log('[UPDATE_UI] User is authenticated, updating UI...');
    // Store current user globally for aura color access
    window.currentUser = {
      email: user.email,
      name: user.user_metadata?.full_name || user.email,
      id: user.id,
      auraColor: user.auraColor || null,
      avatarUrl: user.avatarUrl || user.user_metadata?.avatar_url,
      communityId: 'comm-001'
    };
    
    // Fetch user's aura color from database
    console.log('🔍 AURA DEBUG: Fetching user aura color from database...');
    try {
      // Try user_presence table first (where aura colors are actually stored)
      const { data: presenceData, error: presenceError } = await window.supabase
        .from('user_presence')
        .select('aura_color')
        .eq('user_email', user.email)
        .order('updated_at', { ascending: false })
        .limit(1);
      
      if (presenceError) {
        console.log('🔍 AURA DEBUG: Error fetching from user_presence:', presenceError);
        console.log('🔍 AURA DEBUG: Trying app_users table...');
        
        // Fallback to app_users table
        const { data: userData, error: userError } = await window.supabase
          .from('app_users')
          .select('aura_color')
          .eq('email', user.email)
          .single();
        
        if (userError) {
          console.log('🔍 AURA DEBUG: Error fetching from app_users:', userError);
          console.log('🔍 AURA DEBUG: Using fallback aura color');
        } else if (userData && userData.aura_color) {
          console.log('🔍 AURA DEBUG: Found user aura color in app_users:', userData.aura_color);
          window.currentUser.auraColor = userData.aura_color;
        }
      } else if (presenceData && presenceData.length > 0 && presenceData[0].aura_color) {
        console.log('🔍 AURA DEBUG: Found user aura color in user_presence:', presenceData[0].aura_color);
        window.currentUser.auraColor = presenceData[0].aura_color;
        console.log('🔍 AURA DEBUG: Updated window.currentUser.auraColor to:', window.currentUser.auraColor);
      } else {
        console.log('🔍 AURA DEBUG: No aura color found in database, using fallback');
      }
    } catch (error) {
      console.log('🔍 AURA DEBUG: Exception fetching user aura color:', error);
    }
    
    // Old WebSocket code removed - now using Supabase real-time for all real-time features
    
    // User is logged in - show user info
    console.log('[UPDATE_UI] Setting userInfoDiv display to flex');
    if (userInfoDiv) {
      userInfoDiv.style.display = 'flex';
      console.log('[UPDATE_UI] userInfoDiv.style.display set to:', userInfoDiv.style.display);
    }
    
    console.log('[UPDATE_UI] Setting userMenuName text');
    if (userMenuName) {
      userMenuName.textContent = user.user_metadata?.full_name || user.email;
      console.log('[UPDATE_UI] userMenuName.textContent set to:', userMenuName.textContent);
    }
    
    console.log('[UPDATE_UI] Setting up user avatar using UNIFIED createUnifiedAvatar()');
    if (userAvatarContainer) {
      // Use UNIFIED avatar system for profile avatar - SAME CODE AS MESSAGE/VISIBILITY AVATARS
      // IMPORTANT: Get the user's aura color using the same logic as message avatars
      let userAuraColor = null;
      
      // First try to get from stored aura color (same as message avatars)
      if (user.auraColor && user.auraColor !== null && user.auraColor !== 'null') {
        userAuraColor = user.auraColor;
        Logger.debug(`PROFILE_AVATAR: [BUILD ${EXTENSION_BUILD}] Using stored aura color: ${userAuraColor}`, null, 'general');
      } else {
        // Try to get from real-time presence data (same as message avatars)
        userAuraColor = getLatestAuraColorFromPresence(user.email);
        if (userAuraColor) {
          Logger.debug(`PROFILE_AVATAR: [BUILD ${EXTENSION_BUILD}] Using real-time aura color: ${userAuraColor}`, null, 'general');
        } else {
          Logger.debug(`PROFILE_AVATAR: [BUILD ${EXTENSION_BUILD}] No real-time aura color found, will use generated color`, null, 'general');
        }
      }
      
      // CRITICAL FIX: Get the REAL avatar URL from presence/visibility data
      // The auth system generates fake ui-avatars.com URLs, but we need the REAL Google avatar
      // that's stored in the database and returned by the presence API
      let realAvatarUrl = user.user_metadata?.avatar_url || user.picture;
      
      // Try to get the real avatar from UNFILTERED visibility data (which includes current user)
      // We use the unfiltered data because the filtered data excludes the current user
      if (window.currentVisibilityDataUnfiltered && window.currentVisibilityDataUnfiltered.active) {
        const currentUserInVisibility = window.currentVisibilityDataUnfiltered.active.find(
          u => u.email === user.email || u.userId === user.email || u.id === user.email
        );
        if (currentUserInVisibility && currentUserInVisibility.avatarUrl) {
          Logger.debug(`PROFILE_AVATAR_FIX: Found REAL avatar in UNFILTERED visibility data: ${currentUserInVisibility.avatarUrl}`, null, 'general');
          Logger.debug(`PROFILE_AVATAR_FIX: Replacing fake avatar: ${realAvatarUrl}`, null, 'general');
          Logger.debug(`PROFILE_AVATAR_FIX: User found in unfiltered data:`, {
            email: currentUserInVisibility.email,
            userId: currentUserInVisibility.userId,
            avatarUrl: currentUserInVisibility.avatarUrl
          }, 'general');
          realAvatarUrl = currentUserInVisibility.avatarUrl;
        } else {
          Logger.debug(`PROFILE_AVATAR_FIX: Current user NOT found in UNFILTERED visibility data`, null, 'general');
          Logger.debug(`PROFILE_AVATAR_FIX: Looking for: ${user.email}`, null, 'general');
          Logger.debug(`PROFILE_AVATAR_FIX: Available users:`, window.currentVisibilityDataUnfiltered.active.map(u => ({
            email: u.email,
            userId: u.userId,
            id: u.id
          })), 'general');
          
          // PROFILE_AVATAR_FIX: Use auth avatar as fallback
          if (user.avatarUrl && user.avatarUrl !== 'https://lh3.googleusercontent.com/a/default-user=s96-c') {
            Logger.debug(`PROFILE_AVATAR_FIX: Using auth avatar as fallback: ${user.avatarUrl}`, null, 'general');
            realAvatarUrl = user.avatarUrl;
          }
        }
      } else {
        Logger.debug(`PROFILE_AVATAR_FIX: No UNFILTERED visibility data available, using auth avatar`, null, 'general');
      }
      
      const userData = {
        id: user.id || user.email,
        userId: user.id || user.email,
        name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
        email: user.email,
        avatarUrl: realAvatarUrl,  // USE THE REAL AVATAR URL FROM DATABASE
        auraColor: userAuraColor // Use aura color from presence API
      };
      
      Logger.debug(`PROFILE_AVATAR: [BUILD ${EXTENSION_BUILD}] Creating UNIFIED avatar for profile:`, {
        name: userData.name,
        email: userData.email,
        avatarUrl: userData.avatarUrl,
        auraColor: userData.auraColor,
        source: realAvatarUrl === (user.user_metadata?.avatar_url || user.picture) ? 'auth' : 'visibility-data'
      }, 'general');
      
      // ✅ CREATE UNIFIED AVATAR HTML - SAME AS MESSAGE/VISIBILITY AVATARS
      // CRITICAL: USE SAME SIZE AS VISIBILITY/MESSAGE AVATARS (32px) FOR CONSISTENCY
      const avatarHTML = AvatarUtils.createUnifiedAvatar(userData, {
        size: 32,  // MUST MATCH visibility (32px) and message (32px)
        showStatus: false,  // No status dot on profile avatar
        showAura: true,     // Show aura color
        context: 'profile'
      });
      
      console.log('[UPDATE_UI] Setting avatar HTML using createUnifiedAvatar() - UNIFIED RENDERING');
      userAvatarContainer.innerHTML = avatarHTML;
      
      console.log('[UPDATE_UI] ✅ Avatar configured using UNIFIED createUnifiedAvatar() system');
    } else {
      console.error('[UPDATE_UI] ERROR: userAvatarContainer element not found!');
    }
    
    debug(`User logged in: ${userMenuName?.textContent}`);
    console.log('[UPDATE_UI] UI updated: User authenticated, showing user info');
    console.log('[UPDATE_UI] === END updateUI ===');
    
  // Add click handlers immediately - DOM is ready
  addAuraButtonClickHandler();
  addProfileAvatarClickHandler();
  addVisibilitySettingsButtonClickHandler();
  } else {
    // User is logged out - hide user info but DON'T destroy the HTML structure
    console.log('[UPDATE_UI] User is null - hiding user info but preserving HTML structure');
    if (userInfoDiv) {
      userInfoDiv.style.display = 'none';
    }
    debug('User logged out or not logged in.');
    console.log('UI updated: User not authenticated, hiding user info');
  }
}

// --- Auth Functions ---

// CRITICAL FIX: Authenticate user with Supabase after Google auth
async function authenticateWithSupabase(user) {
  try {
    console.log('🔧 SUPABASE AUTH: Authenticating user with Supabase...');
    console.log('🔧 SUPABASE AUTH: User email:', user.email);
    
    if (!window.supabase) {
      console.error('❌ SUPABASE AUTH: Supabase client not available');
      return;
    }
    
    // Check if user is already authenticated
    const { data: { session }, error: sessionError } = await window.supabase.auth.getSession();
    if (session && session.user && session.user.email === user.email) {
      console.log('✅ SUPABASE AUTH: User already authenticated with Supabase');
      console.log('✅ SUPABASE AUTH: Session expires at:', new Date(session.expires_at * 1000));
      return;
    }
    
    // CRITICAL FIX: Use unified authentication system for real-time
    console.log('🔧 SUPABASE AUTH: Authenticating user with unified auth system...');
    
    // Initialize unified auth if not already done
    if (!window.unifiedAuth) {
      console.error('❌ SUPABASE AUTH: Unified auth system not available');
      return;
    }
    
    // Authenticate user with unified system
    const authSuccess = await window.authenticateUserForRealtime(user.email, user.name);
    
    if (authSuccess) {
      console.log('✅ SUPABASE AUTH: User authenticated for real-time');
      
      // Test real-time connection
      const testResult = await window.testRealtimeWithUnifiedAuth('test-page-123');
      if (testResult) {
        console.log('🎉 SUPABASE AUTH: Real-time is working!');
      } else {
        console.warn('⚠️ SUPABASE AUTH: Real-time test failed');
      }
    } else {
      console.warn('⚠️ SUPABASE AUTH: Authentication failed, real-time may not work');
    }
    
    // Set the current user in the real-time client for context
    if (window.supabaseRealtimeClient) {
      await window.supabaseRealtimeClient.setCurrentUser(user.email, user.id, 'comm-001');
      console.log('✅ SUPABASE AUTH: Real-time client user set');
    }
    
    // Update global user context with additional data
    if (window.currentUser) {
      window.currentUser.id = user.id;
      window.currentUser.communityId = 'comm-001';
    }
    
    console.log('✅ SUPABASE AUTH: User context set globally');
    console.log('✅ SUPABASE AUTH: Authentication process completed');
    
  } catch (error) {
    console.error('❌ SUPABASE AUTH: Exception during authentication:', error);
  }
}

// CRITICAL FIX: Test real-time with authenticated user
async function testRealtimeAfterAuth(pageId) {
  console.log('🧪 REALTIME TEST: Testing real-time with authenticated user...');
  
  if (!window.supabase) {
    console.error('❌ REALTIME TEST: Supabase client not available');
    return false;
  }
  
  try {
    const result = await testRealtimeWithAuth(window.supabase, pageId);
    
    if (result.success) {
      console.log('🎉 REALTIME TEST: Real-time is working with authenticated user!');
      console.log('🎉 REALTIME TEST: Events received:', result.eventReceived);
      return true;
    } else {
      console.error('❌ REALTIME TEST: Real-time still not working');
      console.error('❌ REALTIME TEST: Status:', result.status);
      return false;
    }
  } catch (error) {
    console.error('❌ REALTIME TEST: Exception during test:', error);
    return false;
  }
}

// CRITICAL FIX: Complete OTP verification for real-time
async function completeOTPForRealtime(otpCode) {
  console.log('🔐 OTP VERIFICATION: Completing OTP verification for real-time...');
  
  if (!window.supabase) {
    console.error('❌ OTP VERIFICATION: Supabase client not available');
    return false;
  }
  
  try {
    const result = await completeOTPVerification(window.supabase, otpCode);
    
    if (result.success) {
      console.log('✅ OTP VERIFICATION: OTP verified successfully');
      console.log('✅ OTP VERIFICATION: User authenticated:', result.user.email);
      console.log('✅ OTP VERIFICATION: Session expires at:', new Date(result.session.expires_at * 1000));
      
      // Now test real-time with authenticated user
      const testResult = await testRealtimeAfterAuth('00000000-0000-0000-0000-000000000001');
      if (testResult) {
        console.log('🎉 OTP VERIFICATION: Real-time is now working!');
      }
      
      return true;
    } else {
      console.error('❌ OTP VERIFICATION: OTP verification failed:', result.error);
      return false;
    }
  } catch (error) {
    console.error('❌ OTP VERIFICATION: Exception during OTP verification:', error);
    return false;
  }
}

async function signInWithGoogle() {
  try {
    debug('Attempting Google sign-in for REAL profile pictures...');
    
    // Use real Google auth for actual profile pictures
    if (realGoogleAuth) {
      const result = await realGoogleAuth.signInWithGoogle();
      debug('Real Google sign-in successful:', result);
      
      // Update UI with the authenticated user
      if (result && result.user) {
        // CRITICAL FIX: Authenticate with Supabase after Google auth
        await authenticateWithSupabase(result.user);
        await updateUI(result.user);
        debug(`User authenticated with REAL profile picture: ${result.user.email}`);
        console.log('🔍 REAL_GOOGLE_AUTH: Real avatar URL:', result.user.user_metadata?.avatar_url);
      }
    } else {
      // Fallback to AuthManager
      const result = await authManager.signIn('google');
      debug('Google sign-in successful (fallback):', result);
      
      // Update UI with the authenticated user
      if (result && result.user) {
        // CRITICAL FIX: Authenticate with Supabase after Google auth
        await authenticateWithSupabase(result.user);
        await updateUI(result.user);
        debug(`User authenticated (fallback): ${result.user.email}`);
      }
    }
  } catch (error) {
    console.error('Google sign-in failed:', error);
    debug(`Google sign-in error: ${error.message}`);
    
    // Show error to user
    const statusElement = document.getElementById('magic-link-status');
    if (statusElement) {
      statusElement.textContent = `Sign-in failed: ${error.message}`;
      statusElement.style.color = 'red';
    }
  }
}

async function sendMagicLink() {
  try {
    const email = document.getElementById('magic-link-email').value;
    if (!email) {
      document.getElementById('magic-link-status').textContent = 'Please enter an email address';
      return;
    }

    document.getElementById('magic-link-status').textContent = 'Sending magic link...';
    debug(`Attempting magic link sign-in for: ${email}`);
    
    const result = await authManager.signIn('magic_link', email);
    
    if (result && result.user) {
      document.getElementById('magic-link-status').textContent = 'Magic link sent! Check your email.';
      await updateUI(result.user);
      debug(`Magic link successful: ${result.user.email}`);
    } else {
      document.getElementById('magic-link-status').textContent = 'Magic link sent! Check your email.';
    }
    document.getElementById('magic-link-modal').style.display = 'none';
  } catch (error) {
    console.error('Magic link sign-in failed:', error);
    document.getElementById('magic-link-status').textContent = `Error: ${error.message}`;
    debug(`Magic link error: ${error.message}`);
  }
}

async function signOut() {
  try {
    debug('Attempting sign-out...');
    await authManager.signOut();
    debug('Sign-out successful');
  } catch (error) {
    console.error('Sign-out failed:', error);
    debug(`Sign-out error: ${error.message}`);
  }
}

// JavaScript for the Collaborative Sidebar

// Setup cross-profile communication for real-time updates
function setupCrossProfileCommunication() {
  console.log('📡 Setting up cross-profile communication...');
  
  // Listen for messages from other profiles
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log('📡 Received cross-profile message:', message);
    
    if (message.type === 'MESSAGE_DELETED') {
      console.log('📡 DELETION: Received deletion notification for message:', message.messageId);
      
      // Remove the deleted message from this profile's UI
      const messageDiv = document.querySelector(`[data-message-id="${message.messageId}"]`);
      if (messageDiv) {
        messageDiv.remove();
        console.log('📡 DELETION: Removed message from UI');
      }
      
      // Real-time deletion already handled by handleMessageDeletion() - no need to reload
    }
    
    if (message.type === 'AURA_COLOR_CHANGED') {
      console.log('📡 AURA: Received aura color change notification');
      
      // Refresh message avatars with current presence data to get updated aura colors
      console.log('📡 AURA: Refreshing message avatars with current presence data');
      refreshMessageAvatarsWithCurrentPresence().then(() => {
        console.log('📡 AURA: Message avatars refreshed with updated aura colors');
      });
      
      // Also refresh visibility avatars
      const result = chrome.storage.local.get(['activeCommunities']);
      result.then(({ activeCommunities }) => {
        const communities = activeCommunities || ['comm-001'];
        loadCombinedAvatars(communities).then(() => {
          console.log('📡 AURA: Refreshed visibility avatars after cross-profile aura change');
        });
      });
      
      // Force refresh of all message avatars to use current presence data
      setTimeout(() => {
        console.log('📡 AURA: Forcing message avatar refresh with current presence data');
        refreshMessageAvatarsWithCurrentPresence();
      }, 1000);
    }
    
    if (message.type === 'NEW_MESSAGE_ADDED') {
      console.log('📡 MESSAGE: Received new message notification');
      
      // Add the new message to this profile's chat
      if (message.message) {
        console.log('📡 MESSAGE: Adding new message to chat:', message.messageId);
        addMessageToChat(message.message).then(() => {
          console.log('📡 MESSAGE: New message added to remote profile');
        });
      }
    }
    
    sendResponse({ received: true });
  });
  
  // REMOVED: chrome.storage.onChanged listener for aura changes
  // Aura changes are now handled exclusively via Supabase real-time subscriptions
  // This prevents dual pathways that could cause race conditions
  // See: supabaseRealtimeClient.onUserUpdated handler above
  
  console.log('✅ Cross-profile communication setup complete');
}

document.addEventListener('DOMContentLoaded', async () => {
  // MODERN INITIALIZATION
  console.log('🚀 MODERN: Initializing fully modernized extension...');
  
  // Initialize modern systems
  if (window.logger) {
    window.logger.info('INIT', 'Modern extension initialization started');
  }
  
  if (window.performanceOptimizer) {
    window.performanceOptimizer.startOperation('extension_init');
  }
  
  if (window.securityManager) {
    console.log('🔒 SECURITY: Security manager available');
  }
  
  debug("DOMContentLoaded event fired.");
  Logger.info("DOMContentLoaded event fired.", null, 'general');

  try {
    // === Initialize Complete Modern Architecture ===
    console.log('🚀 INIT: Initializing complete modern architecture...');
    await initializeCompleteModernArchitecture();
    console.log('✅ INIT: Complete modern architecture initialized');
    
    // === Setup Real-time Event Listeners ===
    console.log('🔔 REALTIME: Setting up real-time event listeners...');
    
    // Listen for real-time messages
    window.addEventListener('realtime-message', (event) => {
      console.log('📨 REALTIME: Received real-time message:', event.detail);
      const message = event.detail;
      if (message && message.content) {
        // Add the message to the chat UI
        addMessageToChat({
          id: message.id || `realtime-${Date.now()}`,
          body: message.content,
          author: {
            name: message.author?.name || message.authorId || 'Unknown',
            avatarUrl: message.author?.avatarUrl,
            email: message.authorId
          },
          createdAt: message.createdAt || new Date().toISOString(),
          isDeleted: false
        });
      }
    });
    
    // Listen for real-time message deletions
    window.addEventListener('realtime-message-deleted', (event) => {
      console.log('🗑️ REALTIME: Received message deletion:', event.detail);
      const messageId = event.detail.messageId;
      if (messageId) {
        // Remove the message from the chat UI
        const messageElement = document.querySelector(`[data-message-id="${messageId}"]`);
        if (messageElement) {
          messageElement.remove();
        }
      }
    });
    
    // Listen for real-time message edits
    window.addEventListener('realtime-message-edited', (event) => {
      console.log('✏️ REALTIME: Received message edit:', event.detail);
      const message = event.detail;
      if (message && message.id) {
        // Update the message in the chat UI
        const messageElement = document.querySelector(`[data-message-id="${message.id}"]`);
        if (messageElement) {
          const bodyElement = messageElement.querySelector('.message-body');
          if (bodyElement) {
            bodyElement.textContent = message.content;
          }
        }
      }
    });
    
    // Listen for real-time presence updates
    window.addEventListener('realtime-presence-update', (event) => {
      console.log('👥 REALTIME: Received presence update:', event.detail);
      // Handle presence updates here if needed
    });
    
    console.log('✅ REALTIME: Real-time event listeners setup complete');
    
  } catch (error) {
    console.error('❌ INIT: Failed to initialize modern architecture:', error);
    console.error('❌ INIT: Error stack:', error.stack);
  }
  
  try {
    // === Setup Modern Cross-Profile Communication ===
    console.log('🚀 INIT: Setting up modern cross-profile communication...');
    await setupModernCrossProfileCommunication();
    console.log('✅ INIT: Modern cross-profile communication setup complete');
  } catch (error) {
    console.error('❌ INIT: Failed to setup cross-profile communication:', error);
    console.error('❌ INIT: Error stack:', error.stack);
  }

  try {
    // === Initialize Unified System ===
    console.log('🚀 INIT: Initializing unified system...');
    
    // Use UnifiedInitializationManager to coordinate all systems
    if (window.unifiedInitManager) {
      const unifiedInitSuccess = await window.unifiedInitManager.initialize();
      if (unifiedInitSuccess) {
        console.log('✅ INIT: Unified system initialized successfully');
        
        // Enable debug logging for CleanRealtimeManager (if available)
        if (typeof CleanRealtimeManager !== 'undefined' && window.cleanRealtimeManager) {
          window.cleanRealtimeManager.setLogLevel('DEBUG');
        }
      } else {
        console.warn('⚠️ INIT: Unified system initialization failed, falling back to legacy system');
        await initializeSupabaseRealtimeClient();
      }
    } else {
      console.warn('⚠️ INIT: UnifiedInitializationManager not available, using legacy system');
      await initializeSupabaseRealtimeClient();
    }
    
    console.log('✅ INIT: Real-time system initialized');
  } catch (error) {
    console.error('❌ INIT: Failed to initialize real-time system:', error);
    console.error('❌ INIT: Error stack:', error.stack);
  }
  
  try {
    // === Initialize Real Google Auth for Actual Profile Pictures ===
    console.log('🚀 INIT: Initializing real Google auth...');
    initializeRealGoogleAuth();
    console.log('✅ INIT: Real Google auth initialized');
  } catch (error) {
    console.error('❌ INIT: Failed to initialize real Google auth:', error);
    console.error('❌ INIT: Error stack:', error.stack);
  }

  // === Initialize Theme ===
  initializeTheme();
  
  // === Load User Avatar Background Color Configuration ===
  await loadUserAvatarBgConfig();
  
  // Note: Aura button click handler will be set up after user authentication
  
  // === Update Visual Hierarchy for Existing Messages ===
  updateMessageVisualHierarchy();
  
  // === Add Window Resize Listener for Visual Hierarchy ===
  window.addEventListener('resize', () => {
    updateMessageVisualHierarchy();
  });

  // === Register Auth Providers ===
  // Check if auth providers are available before registering
  if (typeof SupabaseAuthProvider !== 'undefined' && typeof MetalayerAuthProvider !== 'undefined' && typeof OfflineAuthProvider !== 'undefined') {
    // Check if authManager has registerProvider method
    if (typeof authManager !== 'undefined' && typeof authManager.registerProvider === 'function') {
      authManager.registerProvider('supabase', new SupabaseAuthProvider());
      authManager.registerProvider('metalayer', new MetalayerAuthProvider());
      authManager.registerProvider('offline', new OfflineAuthProvider());
    } else {
      console.log('🔧 AuthManager missing registerProvider method, adding it...');
      // Add registerProvider method to authManager
      if (typeof authManager !== 'undefined') {
        authManager.registerProvider = function(name, provider) {
          console.log(`🔧 Registering provider: ${name}`);
          if (!this.providers) {
            this.providers = new Map();
          }
          this.providers.set(name, provider);
          console.log(`✅ Provider ${name} registered successfully`);
        };
        // Now register the providers
        authManager.registerProvider('supabase', new SupabaseAuthProvider());
        authManager.registerProvider('metalayer', new MetalayerAuthProvider());
        authManager.registerProvider('offline', new OfflineAuthProvider());
      } else {
        console.error('❌ AuthManager not available');
      }
    }
  } else {
    console.error('❌ Auth providers not available. SupabaseAuthProvider:', typeof SupabaseAuthProvider, 'MetalayerAuthProvider:', typeof MetalayerAuthProvider, 'OfflineAuthProvider:', typeof OfflineAuthProvider);
    // Retry after a short delay
    setTimeout(() => {
      if (typeof SupabaseAuthProvider !== 'undefined' && typeof MetalayerAuthProvider !== 'undefined' && typeof OfflineAuthProvider !== 'undefined') {
        // Check if authManager has registerProvider method
        if (typeof authManager !== 'undefined' && typeof authManager.registerProvider === 'function') {
          authManager.registerProvider('supabase', new SupabaseAuthProvider());
          authManager.registerProvider('metalayer', new MetalayerAuthProvider());
          authManager.registerProvider('offline', new OfflineAuthProvider());
          console.log('✅ Auth providers registered after retry');
        } else {
          console.log('🔧 AuthManager missing registerProvider method in retry, adding it...');
          if (typeof authManager !== 'undefined') {
            authManager.registerProvider = function(name, provider) {
              console.log(`🔧 Registering provider: ${name}`);
              if (!this.providers) {
                this.providers = new Map();
              }
              this.providers.set(name, provider);
              console.log(`✅ Provider ${name} registered successfully`);
            };
            authManager.registerProvider('supabase', new SupabaseAuthProvider());
            authManager.registerProvider('metalayer', new MetalayerAuthProvider());
            authManager.registerProvider('offline', new OfflineAuthProvider());
            console.log('✅ Auth providers registered after retry with added method');
          } else {
            console.error('❌ AuthManager not available in retry');
          }
        }
      } else {
        console.error('❌ Auth providers still not available after retry');
      }
    }, 100);
  }
  
  // === Initialize Auth Manager ===
  console.log('Starting auth manager initialization...');
  
  // Fix authManager.initialize method if missing
  if (typeof authManager !== 'undefined' && typeof authManager.initialize !== 'function') {
    console.log('🔧 Adding initialize method to authManager...');
    authManager.initialize = function() {
      console.log('🔧 AuthManager initialize called');
      return Promise.resolve();
    };
  }
  
  // Try to initialize with timeout
  try {
    const authReady = await Promise.race([
      authManager.initialize(),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Auth initialization timeout')), 3000)
      )
    ]);
    
    console.log('Auth manager initialization result:', authReady);
    
    if (authReady) {
      console.log('Auth Manager ready');
      console.log('Current provider:', authManager.currentProvider?.name);
      
      // Set up auth state listener
      authManager.onAuthStateChange(async (event, data) => {
        console.log('Auth state changed:', event, data);
        // data IS the user object, not { user: ... }
        await updateUI(data);
        
        // Initialize RobustIntegration now that user is authenticated
        if (event === 'SIGNED_IN' && window.robustIntegration && !window.robustIntegration.isInitialized) {
          console.log('🔗 AUTH: Initializing RobustIntegration after authentication...');
          window.robustIntegration.initialize().then(success => {
            if (success) {
              console.log('✅ AUTH: RobustIntegration initialized successfully');
            } else {
              console.log('❌ AUTH: RobustIntegration initialization failed');
            }
          });
        }

        // Initialize VisibilityIntegration now that user is authenticated
        if (event === 'SIGNED_IN' && window.visibilityIntegration && !window.visibilityIntegration.isInitialized) {
          console.log('🔗 AUTH: Initializing VisibilityIntegration after authentication...');
          window.visibilityIntegration.initialize().then(success => {
            if (success) {
              console.log('✅ AUTH: VisibilityIntegration initialized successfully');
            } else {
              console.log('❌ AUTH: VisibilityIntegration initialization failed');
            }
          });
        }

        // Initialize ReactionsIntegration now that user is authenticated
        if (event === 'SIGNED_IN' && window.reactionsIntegration && !window.reactionsIntegration.isInitialized) {
          console.log('🔗 AUTH: Initializing ReactionsIntegration after authentication...');
          window.reactionsIntegration.initialize().then(success => {
            if (success) {
              console.log('✅ AUTH: ReactionsIntegration initialized successfully');
            } else {
              console.log('❌ AUTH: ReactionsIntegration initialization failed');
            }
          });
        }

        // Initialize AurasIntegration now that user is authenticated
        if (event === 'SIGNED_IN' && window.aurasIntegration && !window.aurasIntegration.isInitialized) {
          console.log('🔗 AUTH: Initializing AurasIntegration after authentication...');
          window.aurasIntegration.initialize().then(success => {
            if (success) {
              console.log('✅ AUTH: AurasIntegration initialized successfully');
            } else {
              console.log('❌ AUTH: AurasIntegration initialization failed');
            }
          });
        }
      });
      
      // Check initial auth state
      const user = await authManager.getCurrentUser();
      console.log('Initial user:', user);
      
      // Update UI with current user
      await updateUI(user);
      
      // Check for pending content from selection widget
      await handlePendingContent();
    } else {
      console.log('Auth system failed to initialize');
    }
  } catch (error) {
    console.error('Auth initialization failed:', error.message);
    
    // Don't fall back to offline mode - force real auth
    console.log('Forcing real authentication - no offline fallback');
    // Don't clear UI here - let the auth state listener handle it
  }
  
  // Use Supabase authentication only - no hardcoded auth

  // Load communities and initialize the interface
  try {
    console.log('🔍 INIT: Loading communities...');
    const result = await loadCommunities();
    console.log('🔍 INIT: Communities loaded:', result);
    
    // Also load chat history for the current page
    console.log('🔍 INIT: Setting up chat history timeout (1 second)...');
    setTimeout(async () => {
      try {
        console.log('🔍 INIT: Chat history timeout executed');
        await loadChatHistory();
        console.log('🔍 INIT: Chat history loaded for current page');
      } catch (error) {
        console.error('❌ INIT: Error loading chat history:', error);
      }
    }, 1000); // Small delay to ensure communities are loaded first
    
    // Start presence tracking
    console.log('🔍 INIT: Setting up presence tracking timeout (2 seconds)...');
    setTimeout(async () => {
      try {
        console.log('🔍 INIT: Timeout executed - about to call startPresenceTracking()');
        const currentUser = await getCurrentUserEmail();
        console.log('🔍 INIT: Current user before presence tracking:', currentUser);
        
        if (!currentUser) {
          console.log('🔍 INIT: No authenticated user, skipping presence tracking');
          console.log('🔍 INIT: Authentication prompt should be visible - user needs to sign in');
          return;
        }
        
        await startPresenceTracking();
        console.log('🔍 INIT: startPresenceTracking() completed successfully');
      } catch (error) {
        console.error('❌ INIT: Error starting presence tracking:', error);
        console.error('❌ INIT: Error stack:', error.stack);
      }
    }, 2000); // Delay to ensure auth is complete
  } catch (error) {
    console.error('Error loading communities:', error);
  }
  
  // UI will be updated by auth state listener
  console.log('UI will be updated by auth state listener');
  
  console.log('=== END Initialization ===');

  // Add unload handler to stop presence tracking
  window.addEventListener('beforeunload', () => {
    // Send EXIT event synchronously (fire and forget)
    if (currentPageId) {
      sendPresenceEvent('EXIT').catch(error => {
        console.error('❌ PRESENCE: Error sending EXIT event:', error);
      });
    }
    
    // Stop intervals
    if (presenceHeartbeatInterval) {
      clearInterval(presenceHeartbeatInterval);
      presenceHeartbeatInterval = null;
    }
    
    if (visibleListPollingInterval) {
      clearInterval(visibleListPollingInterval);
      visibleListPollingInterval = null;
    }
  });

  // --- Now proceed with the rest of the setup ---
  debug("Document loaded (from JS)");
  Logger.info("Sidebar JS Loaded", null, 'general');

  // Add debug listeners (moved from HTML)
  document.querySelectorAll('.main-nav-tab').forEach(tab => {
    debug(`Found main tab: ${tab.textContent}`);
    tab.addEventListener('click', () => {
      debug(`Main tab clicked: ${tab.textContent}`);
    });
  });

  document.querySelectorAll('.sub-nav-tab').forEach(tab => {
    debug(`Found sub tab: ${tab.textContent}`);
    tab.addEventListener('click', () => {
      debug(`Sub tab clicked: ${tab.textContent}`);
    });
  });

  // --- Element References ---
  const mainTabs = document.querySelectorAll('.main-nav-tab');
  const mainTabContents = document.querySelectorAll('.main-tab-content');
  
  const communityDropdownTrigger = document.querySelector('.community-dropdown-trigger');
  const communityDropdownPanel = document.getElementById('community-dropdown-panel');
  const closeCommunityDropdownButton = document.getElementById('close-community-dropdown');
  const closeSidebarButton = document.getElementById('close-sidebar-btn');

  const modal = document.getElementById('mini-profile-modal');
  const closeModalButton = modal?.querySelector('.close-button');

  // --- Main Tab Switching Logic ---
  mainTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const targetTabId = tab.getAttribute('data-tab');
      Logger.info(`Switching to main tab: ${targetTabId}`, null, 'general');

      // Deactivate all main tabs and content
      mainTabs.forEach(t => t.classList.remove('active'));
      mainTabContents.forEach(c => c.classList.remove('active'));

      // Activate the clicked tab and its corresponding content
      tab.classList.add('active');
      const targetTabContent = document.getElementById(targetTabId);
      if (targetTabContent) {
        targetTabContent.classList.add('active');
        Logger.info(`Activated content: #${targetTabId}`, null, 'general');
        
        // Initialize specific tab functionality
        if (targetTabId === 'agent-tab') {
          console.log('🎯 Agent tab activated! Initializing agent...');
          try {
            initializeAgentTab();
            console.log('✅ Agent tab initialization completed successfully');
          } catch (error) {
            console.error('❌ Error initializing agent tab:', error);
            console.error('Error stack:', error.stack);
          }
        } else if (targetTabId === 'people-tab') {
          console.log('People tab activated! Loading people data...');
          initializePeopleTab();
        }
      } else {
        console.error(`Content for main tab #${targetTabId} not found!`);
      }
    });
  });

  // --- Sub-Tab Switching Logic ---
  // Get all sub-tab buttons and add click listeners to them directly
  document.querySelectorAll('.sub-nav-tab').forEach(subTab => {
    subTab.addEventListener('click', () => {
      const targetSubTabId = subTab.getAttribute('data-subtab');
      Logger.info(`Switching to sub-tab: ${targetSubTabId}`, null, 'general');

      // Find the parent tab content
      const parentMainContent = subTab.closest('.main-tab-content');
      if (!parentMainContent) {
        console.error("Could not find parent main content for sub-tab.");
        return;
      }

      // Deactivate all sub-tabs in this tab group
      const subTabGroup = subTab.closest('.sidebar-nav-sub');
      subTabGroup.querySelectorAll('.sub-nav-tab').forEach(st => {
        st.classList.remove('active');
      });
      
      // Deactivate all content panels in this tab content
      parentMainContent.querySelectorAll('.sub-tab-content').forEach(stc => {
        stc.classList.remove('active');
      });

      // Activate this sub-tab and its content
      subTab.classList.add('active');
      const targetSubContent = document.getElementById(targetSubTabId);
      if (targetSubContent) {
        targetSubContent.classList.add('active');
        Logger.info(`Activated sub-content: #${targetSubTabId}`, null, 'general');
      } else {
        console.error(`Sub-content #${targetSubTabId} not found!`);
      }
    });
  });

  // --- Community Dropdown Logic ---
  if (communityDropdownTrigger) {
    communityDropdownTrigger.addEventListener('click', (event) => {
      console.log('Community dropdown clicked');
      event.stopPropagation(); // Prevent click from immediately closing dropdown
      
      // Require authentication to access community selector
      if (!requireAuth('access community settings', () => {
        console.log('Auth passed, toggling community dropdown');
      if (communityDropdownPanel) {
        // Toggle visibility
        if (communityDropdownPanel.style.display === 'block') {
          communityDropdownPanel.style.display = 'none';
          Logger.info("Community dropdown hidden", null, 'general');
        } else {
          communityDropdownPanel.style.display = 'block';
          Logger.info("Community dropdown shown", null, 'general');
        }
        }
      })) {
        console.log('Auth failed for community dropdown');
        return; // Stop execution if not authenticated
      }
    });
  }

  if (closeCommunityDropdownButton && communityDropdownPanel) {
    closeCommunityDropdownButton.addEventListener('click', () => {
      communityDropdownPanel.style.display = 'none';
      Logger.info("Community dropdown closed via button", null, 'general');
    });
  }

  // Close dropdown if clicking outside
  document.addEventListener('click', (event) => {
    if (communityDropdownPanel && communityDropdownPanel.style.display === 'block') {
      if (!communityDropdownPanel.contains(event.target) && 
          !communityDropdownTrigger.contains(event.target)) {
        communityDropdownPanel.style.display = 'none';
        Logger.info("Community dropdown closed via outside click", null, 'general');
      }
    }
  });

  // --- Sidebar Close Button ---
  if (closeSidebarButton) {
    closeSidebarButton.addEventListener('click', () => {
      Logger.info("Close sidebar button clicked", null, 'general');
      // For Chrome side panel, we can't close it from within the panel itself
      // You would need to send a message to background.js
    });
  }

  // --- Mini Profile Modal Logic ---
  if (modal && closeModalButton) {
    // Function to open the modal
    function openModal(name, status) {
      const modalName = document.getElementById('modal-name');
      const modalStatus = document.getElementById('modal-status');
      if (modalName) modalName.textContent = name || 'N/A';
      if (modalStatus) modalStatus.textContent = status || 'Unknown';
      modal.style.display = 'flex';
      Logger.info(`Modal opened for ${name}`, null, 'general');
    }

    // Function to close the modal
    function closeModal() {
      modal.style.display = 'none';
      Logger.info("Modal closed", null, 'general');
    }

    closeModalButton.addEventListener('click', closeModal);

    // Close modal if clicked outside the content area
    modal.addEventListener('click', (event) => {
      if (event.target === modal) {
        closeModal();
      }
    });

    // Temporary: Add click listeners to list items to open modal
    document.querySelectorAll('.item-list li').forEach(item => {
      item.addEventListener('click', (e) => {
        // Don't open modal if clicking on a button
        if (e.target.closest('button')) {
          return;
        }
        
        const nameElement = item.querySelector('.item-name');
        const statusElement = item.querySelector('.item-status, .item-last-message');
        const name = nameElement ? nameElement.textContent : 'Unknown User';
        const status = statusElement ? statusElement.textContent : 'Status unavailable';
        
        // Don't open modal for friend requests
        if (item.closest('.request-list')) return;
        
        openModal(name, status);
      });
    });
  }

  // Get auth elements (auth buttons removed, only logout remains)
  const logoutBtn = document.getElementById('logout-btn');
  const themeToggleBtn = document.getElementById('theme-toggle-btn');
  const userAvatar = document.getElementById('user-avatar');
  const userMenu = document.getElementById('user-menu');
  const magicLinkModal = document.getElementById('magic-link-modal');
  const closeMagicLinkModal = document.getElementById('close-magic-link-modal');
  const sendMagicLinkBtn = document.getElementById('send-magic-link');
  const magicLinkEmail = document.getElementById('magic-link-email');

  // Note: User avatar click handling is now done in addProfileAvatarClickHandler()
  // which is called from updateUI() to avoid duplicate event listeners
  
  // Test background script communication
  const testBackgroundBtn = document.getElementById('test-background-btn');
  if (testBackgroundBtn) {
    testBackgroundBtn.addEventListener('click', () => {
      console.log('Test background button clicked');
      chrome.runtime.sendMessage({ type: 'TEST_MESSAGE' }, (response) => {
        console.log('Test response from background:', response);
        if (chrome.runtime.lastError) {
          console.error('Test error:', chrome.runtime.lastError);
        }
      });
    });
  }
  // Magic Link button removed from HTML, so no event listener needed
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      debug('Logout button clicked');
      signOut();
      // Close the user menu after logout
      if (userMenu) userMenu.style.display = 'none';
    });
  }
  
  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
      debug('Theme toggle button clicked');
      toggleTheme();
    });
  }
  if (closeMagicLinkModal) {
    closeMagicLinkModal.addEventListener('click', () => {
      magicLinkModal.style.display = 'none';
    });
  }

  // Add cancel context button event listener
  const cancelContextBtn = document.getElementById('cancel-context');
  if (cancelContextBtn) {
    cancelContextBtn.addEventListener('click', clearContext);
  }
  if (sendMagicLinkBtn) {
    sendMagicLinkBtn.addEventListener('click', () => sendMagicLink());
  }

  // --- Chat Input Authentication ---
  const chatInput = document.getElementById('chat-textarea');
  
  // Add auto-resize functionality to textarea
  if (chatInput) {
    chatInput.addEventListener('input', function() {
      autoResize(this);
    });
    
    // Handle window resize to recalculate max height
    window.addEventListener('resize', function() {
      autoResize(chatInput);
    });
  }
  
  // Add debug panel toggle functionality
  const debugHeader = document.getElementById('debug-header');
  if (debugHeader) {
    debugHeader.addEventListener('click', toggleDebugPanel);
  }
  
  // Initialize notification settings UI
  initializeNotificationSettings();
  
  // Initialize notification icon
  initializeNotificationIcon();
  
  // Handle notification clicks from background
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'NOTIFICATION_CLICKED') {
      console.log('🔔 SIDEPANEL: Notification clicked:', message.notificationId, message.buttonIndex);
      
      if (window.notificationManager) {
        window.notificationManager.handleNotificationClick(message.notificationId, message.buttonIndex);
      }
    }
  });
  
  if (chatInput) {
    chatInput.addEventListener('focus', () => {
      if (!requireAuth('send messages', () => {
        chatInput.focus();
      })) {
        chatInput.blur();
      }
    });
  }
  
  // Send button removed - using Enter key only
  
  // Add Enter key support for sending messages
  if (chatInput) {
    chatInput.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        sendChatMessage();
      }
    });
  }
  
  function sendChatMessage() {
    console.log('🚀🚀🚀 ============================================');
    console.log('🚀🚀🚀 SEND_CHAT_MESSAGE: ENTRY POINT');
    console.log('🚀🚀🚀 ============================================');
    console.log('🚀 SEND_CHAT_MESSAGE: Chat send button clicked');
    console.log('🚀 SEND_CHAT_MESSAGE: Timestamp:', new Date().toISOString());
    console.log('🚀 SEND_CHAT_MESSAGE: chatInput element:', !!chatInput);
    console.log('🚀 SEND_CHAT_MESSAGE: chatInput value:', chatInput?.value);
    console.log('🚀 SEND_CHAT_MESSAGE: chatInput value length:', chatInput?.value?.length);
    
    // DIAGNOSTIC: Log message send attempt
    if (window.messageDiagnostic) {
      window.messageDiagnostic.logMessageSend({
        content: chatInput?.value,
        user: window.currentUser,
        community: 'comm-001',
        url: window.currentUrlData
      });
    }
    
    // GLOBAL DIAGNOSTIC FUNCTIONS
    window.getMessageDiagnostics = () => {
      if (window.messageDiagnostic) {
        return window.messageDiagnostic.getDiagnosticReport();
      }
      return { error: 'Message diagnostic not available' };
    };
    
    window.clearMessageDiagnostics = () => {
      if (window.messageDiagnostic) {
        window.messageDiagnostic.clearHistory();
        return 'Diagnostic history cleared';
      }
      return 'Message diagnostic not available';
    };
    
    requireAuth('send messages', async () => {
      console.log('🔐 SEND_CHAT_MESSAGE: Auth check passed');
      console.log('🔐 SEND_CHAT_MESSAGE: window.currentUser:', window.currentUser);
      console.log('🔐 SEND_CHAT_MESSAGE: window.currentUser.email:', window.currentUser?.email);
      
      // Check if we're in edit mode
      if (chatInput.dataset.editingMessageId) {
        console.log('✏️ SEND_CHAT_MESSAGE: In edit mode, skipping send');
        // Handle edit mode - this will be handled by the edit function's event listeners
        return;
      }
      
      let message = chatInput?.value?.trim();
      console.log('📝 SEND_CHAT_MESSAGE: Message after trim:', message);
      console.log('📝 SEND_CHAT_MESSAGE: Message length:', message?.length);
      console.log('📝 SEND_CHAT_MESSAGE: Message is truthy:', !!message);
      
      if (message) {
        console.log('✅ SEND_CHAT_MESSAGE: Message validation passed');
        debug(`Sending message: ${message}`);
        console.log('Sending message:', message);
        
        try {
          console.log('🔍 SEND_CHAT_MESSAGE: === STEP 1: GETTING USER AND COMMUNITY ===');
          // Get current user and primary community - use window.currentUser for user
          const result = await chrome.storage.local.get(['primaryCommunity', 'currentCommunity']);
          console.log('🔍 SEND_CHAT_MESSAGE: Chrome storage result:', result);
          
          const user = window.currentUser;
          console.log('🔍 SEND_CHAT_MESSAGE: User from window.currentUser:', user);
          console.log('🔍 SEND_CHAT_MESSAGE: User type:', typeof user);
          console.log('🔍 SEND_CHAT_MESSAGE: User is null:', user === null);
          console.log('🔍 SEND_CHAT_MESSAGE: User is undefined:', user === undefined);
          
          const communityId = result.primaryCommunity || result.currentCommunity || 'comm-001';
          console.log('🔍 SEND_CHAT_MESSAGE: Community ID:', communityId);
          
          Logger.debug(`MESSAGE_SEND: User object structure:`, user, 'general');
          Logger.debug(`MESSAGE_SEND: User has id: ${!!user?.id}, email: ${!!user?.email}`, null, 'general');
          
          console.log('🔍 SEND_CHAT_MESSAGE: User validation check...');
          console.log('🔍 SEND_CHAT_MESSAGE: user exists:', !!user);
          console.log('🔍 SEND_CHAT_MESSAGE: user.id:', user?.id);
          console.log('🔍 SEND_CHAT_MESSAGE: user.email:', user?.email);
          console.log('🔍 SEND_CHAT_MESSAGE: user.id || user.email:', !!(user?.id || user?.email));
          
          if (user && (user.id || user.email)) {
            console.log('✅ SEND_CHAT_MESSAGE: User validation PASSED');
            try {
              console.log('🔍 SEND_CHAT_MESSAGE: === STEP 2: GETTING URL DATA ===');
              // Get normalized URL for consistency with presence and visibility
              const urlData = await normalizeCurrentUrl();
              console.log('🔍 SEND_CHAT_MESSAGE: urlData:', urlData);
              const currentUri = urlData.normalizedUrl;
              console.log('🔍 SEND_CHAT_MESSAGE: currentUri:', currentUri);
              debug(`Current page URI: ${currentUri}`);
              
              console.log('🔍 SEND_CHAT_MESSAGE: === STEP 3: CHECKING FOR OPTIONAL CONTENT ===');
              // Check if this is a message with selected content
              let optionalContent = null;
              if (message.startsWith('Commenting on: "')) {
                console.log('🔍 SEND_CHAT_MESSAGE: Message has "Commenting on:" prefix');
                // Extract the selected content from the pre-populated message
                const match = message.match(/^Commenting on: "(.+)"$/);
                if (match) {
                  optionalContent = match[1];
                  console.log('🔍 SEND_CHAT_MESSAGE: Extracted optional content:', optionalContent);
                  // Remove the prefix from the actual message content
                  message = message.replace(/^Commenting on: ".+":\s*/, '');
                  console.log('🔍 SEND_CHAT_MESSAGE: Message after removing prefix:', message);
                }
              } else {
                console.log('🔍 SEND_CHAT_MESSAGE: No optional content detected');
              }
              
              console.log('🔍 SEND_CHAT_MESSAGE: === STEP 4: CHECKING FOR REPLY/THREAD ===');
              // Check if this is a reply or thread
              let parentId = null;
              let threadId = null;
              
              if (chatInput.dataset.replyTo) {
                parentId = chatInput.dataset.replyTo;
                threadId = chatInput.dataset.replyToConversation; // Use the conversation ID as thread ID
                console.log('🔍 SEND_CHAT_MESSAGE: Reply detected:', { parentId, threadId });
                debug(`Reply detected: parentId=${parentId}, threadId=${threadId}`);
                console.log('Reply detected:', { parentId, threadId });
                // Clear the reply data
                delete chatInput.dataset.replyTo;
                delete chatInput.dataset.replyToConversation;
                delete chatInput.dataset.contextMode;
              } else if (chatInput.dataset.threadId) {
                threadId = chatInput.dataset.threadId;
                console.log('🔍 SEND_CHAT_MESSAGE: Thread detected:', threadId);
                // Remove the thread prefix from the message
                message = message.replace(/^Starting thread on ".+":\s*/, '');
                console.log('🔍 SEND_CHAT_MESSAGE: Message after removing thread prefix:', message);
                // Clear the thread data
                delete chatInput.dataset.threadId;
              } else {
                console.log('🔍 SEND_CHAT_MESSAGE: Not a reply or thread');
              }
              
              console.log('🔍 SEND_CHAT_MESSAGE: === STEP 5: GETTING USER EMAIL ===');
              // Use email for user identification (consistent with presence API)
              const userEmail = await getCurrentUserEmail();
              console.log('🔍 SEND_CHAT_MESSAGE: userEmail:', userEmail);
              Logger.debug(`CHAT_SEND: Sending message for user ${userEmail} in community ${communityId} on URI ${currentUri}`, null, 'general');
              Logger.debug(`CHAT_SEND: Message content: "${message}"`, null, 'general');
              
              console.log('🔍 SEND_CHAT_MESSAGE: === STEP 6: SENDING VIA SUPABASE ===');
              // Send message via Supabase real-time ONLY
              console.log('📡 MESSAGE_CREATE: Sending message via Supabase real-time...');
              console.log('📡 MESSAGE_CREATE: Message content:', message);
              console.log('📡 MESSAGE_CREATE: Message length:', message.length);
              let supabaseMessage = null;
              try {
                console.log('📡 MESSAGE_CREATE: Calling sendMessageViaSupabase...');
                supabaseMessage = await sendMessageViaSupabase(message);
        console.log('📡 MESSAGE_CREATE: ✅ sendMessageViaSupabase returned');
        console.log('📡 MESSAGE_CREATE: Supabase returned message:', supabaseMessage);
        console.log('📡 MESSAGE_CREATE: Supabase message type:', typeof supabaseMessage);
        console.log('📡 MESSAGE_CREATE: Supabase message is null:', supabaseMessage === null);
        console.log('📡 MESSAGE_CREATE: Supabase message id:', supabaseMessage?.id);
        
        // DIAGNOSTIC: Log message persistence result
        if (window.messageDiagnostic) {
          const success = supabaseMessage && supabaseMessage.id;
          window.messageDiagnostic.logMessagePersist(
            supabaseMessage?.id || 'NO_ID',
            success,
            success ? null : new Error('No message ID returned from Supabase')
          );
        }
                Logger.success(`CHAT_SEND: Message sent via Supabase real-time`, null, 'general');
              } catch (error) {
                console.log('📡 MESSAGE_CREATE: ❌ Supabase real-time send failed:', error);
                console.log('📡 MESSAGE_CREATE: ❌ Error type:', typeof error);
                console.log('📡 MESSAGE_CREATE: ❌ Error message:', error?.message);
                console.log('📡 MESSAGE_CREATE: ❌ Error stack:', error?.stack);
                Logger.error(`CHAT_SEND: Failed to send message via Supabase`, error, 'general');
              }
              
              console.log('🔍 SEND_CHAT_MESSAGE: === STEP 7: BUILDING NEW POST OBJECT ===');
              // CRITICAL FIX: Add message to chat display with FULL author information
              // The Supabase message only has user_email, but the UI needs full author details
              const currentUserData = window.currentUser || await authManager.getCurrentUser();
              console.log('🔍 SEND_CHAT_MESSAGE: currentUserData:', currentUserData);
              console.log('🔍 SEND_CHAT_MESSAGE: currentUserData type:', typeof currentUserData);
              console.log('🔍 SEND_CHAT_MESSAGE: currentUserData.avatarUrl:', currentUserData?.avatarUrl);
              console.log('🔍 SEND_CHAT_MESSAGE: currentUserData.user_metadata:', currentUserData?.user_metadata);
              
              let newPost = {
                id: supabaseMessage?.id || `post-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                content: message,
                body: message, // Some parts of code expect 'body' instead of 'content'
                user_email: userEmail,
                authorId: userEmail,
                created_at: supabaseMessage?.created_at || new Date().toISOString(),
                createdAt: supabaseMessage?.created_at || new Date().toISOString(),
                community_id: communityId,
                uri: currentUri,
                parent_id: parentId,
                parentId: parentId,
                thread_id: threadId,
                // CRITICAL: Add full author object so UI can display avatar and name
                author: {
                  id: userEmail,
                  email: userEmail,
                  name: currentUserData?.name || currentUserData?.displayName || 'You',
                  handle: currentUserData?.handle || currentUserData?.name?.toLowerCase().replace(/\s+/g, '') || 'user',
                  avatarUrl: currentUserData?.avatarUrl || currentUserData?.photoURL || currentUserData?.avatar_url || currentUserData?.user_metadata?.avatar_url,
                  auraColor: currentUserData?.auraColor || window.currentUser?.auraColor || '#aa00aa'
                }
              };
              
              console.log('📡 MESSAGE_CREATE: Created newPost with ID:', newPost.id);
              console.log('📡 MESSAGE_CREATE: Using Supabase UUID:', !!supabaseMessage?.id);
              console.log('📡 MESSAGE_CREATE: Author info:', newPost.author);
              console.log('📡 MESSAGE_CREATE: Full newPost object:', newPost);
              
              console.log('🔍 SEND_CHAT_MESSAGE: === STEP 8: SETTING POST FLAGS ===');
              // Set proper flags for the new post
              newPost.isReply = !!newPost.parentId;
              console.log('🔍 SEND_CHAT_MESSAGE: isReply:', newPost.isReply);
              
              // Store the original community name for this message
              const currentCommunityName = await getPrimaryCommunityName();
              console.log('🔍 SEND_CHAT_MESSAGE: currentCommunityName:', currentCommunityName);
              newPost.originalCommunityName = currentCommunityName;
              
              // Ensure the new post has conversation data with empty reactions (new posts shouldn't inherit reactions)
              newPost.conversation = {
                reactions: [] // New posts start with no reactions
              };
              console.log('🔍 SEND_CHAT_MESSAGE: Set conversation data with empty reactions');
                
              console.log('🔍 SEND_CHAT_MESSAGE: === STEP 9: SKIPPING CLIENT-SIDE ADD ===');
              console.log('🔍 SEND_CHAT_MESSAGE: Real-time system will handle UI updates via Postgres Changes');
              console.log('🔍 SEND_CHAT_MESSAGE: Avoiding duplicate adds by letting real-time handle it');
              console.log('✅ SEND_CHAT_MESSAGE: Message will appear via real-time propagation');
                
                // Broadcast new message to other profiles
                try {
                  chrome.runtime.sendMessage({
                    type: 'NEW_MESSAGE_ADDED',
                    messageId: newPost.id,
                    message: newPost,
                    timestamp: Date.now()
                  });
                  console.log('📡 MESSAGE: Broadcasted new message to other profiles');
                } catch (error) {
                  console.log('📡 MESSAGE: Could not broadcast to other profiles:', error);
                }
                
                // Reset last loaded URI to force reload on next loadChatHistory call
                Logger.debug(`CHAT_SEND: Resetting lastLoadedUri from ${lastLoadedUri} to null`, null, 'general');
                lastLoadedUri = null;
                
                // Update last message count
                lastMessageCount = document.querySelectorAll('.message').length;
                Logger.debug(`CHAT_SEND: Updated last message count to ${lastMessageCount}`, null, 'general');
                
                // CRITICAL FIX: DO NOT call loadChatHistory() here!
                // The message is already added to UI via addMessageToChat() above.
                // loadChatHistory() fetches from the backend API, which is a DIFFERENT database than Supabase.
                // Calling it will CLEAR the UI and reload messages from the backend API, which doesn't have
                // the Supabase message we just sent, making it appear like the message failed to send.
                // Real-time subscriptions will handle propagation to other users.
                Logger.debug(`CHAT_SEND: Message added to UI, real-time sync will handle propagation`, null, 'general');
                console.log('🚫 CHAT_SEND: NOT calling loadChatHistory() - would clear Supabase message from UI');
                console.log('✅ CHAT_SEND: Message successfully added and will propagate via real-time');
                
                // If this was a reply, expand the thread after adding the message
                if (newPost.parentId && newPost.conversationId) {
                  // Use setTimeout to ensure DOM is updated before trying to expand
                  setTimeout(() => {
                    // First, ensure the parent message has a thread toggle
                    const parentMessage = document.querySelector(`[data-message-id="${newPost.parentId}"]`);
                    if (parentMessage) {
                      let threadToggle = parentMessage.querySelector('.thread-toggle-btn');
                      if (!threadToggle) {
                        // Create thread toggle if it doesn't exist
                        console.log('Creating thread toggle for parent message');
                        const footer = parentMessage.querySelector('.message-footer');
                        if (footer) {
                          const threadToggleHTML = `<button class="thread-toggle-btn" data-thread-id="${newPost.conversationId}" title="Show thread replies" data-expanded="false">📂<span class="icon-count">1</span></button>`;
                          footer.insertAdjacentHTML('afterbegin', threadToggleHTML);
                          threadToggle = parentMessage.querySelector('.thread-toggle-btn');
                          
                          // Add event listener for the new thread toggle
                          threadToggle.addEventListener('click', (e) => {
                            e.stopPropagation();
                            toggleThreadReplies(newPost.conversationId, parentMessage);
                          });
                        }
                      }
                    }
                    
                    // Update thread toggle count but don't auto-expand
                    const threadToggle = document.querySelector(`[data-thread-id="${newPost.conversationId}"]`);
                    console.log('Looking for thread toggle:', `[data-thread-id="${newPost.conversationId}"]`);
                    console.log('Found thread toggle:', threadToggle);
                    if (threadToggle) {
                      // Update the count on the toggle button
                      const countSpan = threadToggle.querySelector('.icon-count');
                      if (countSpan) {
                        const currentCount = parseInt(countSpan.textContent) || 0;
                        countSpan.textContent = currentCount + 1;
                      }
                      console.log('New reply added, thread toggle count updated but not auto-expanded');
                    }
                  }, 100);
                }
              
              // Clear input and reset height
              Logger.debug(`CHAT_CLEAR: [BUILD ${EXTENSION_BUILD}] Clearing input field and resetting styling`, null, 'general');
              Logger.debug(`CHAT_CLEAR: [BUILD ${EXTENSION_BUILD}] Input field current height:`, chatInput.style.height, 'general');
              Logger.debug(`CHAT_CLEAR: [BUILD ${EXTENSION_BUILD}] Input field computed height:`, window.getComputedStyle(chatInput).height, 'general');
              Logger.debug(`CHAT_CLEAR: [BUILD ${EXTENSION_BUILD}] Input field value before clear:`, chatInput.value, 'general');
              
              // Clear the input value
              chatInput.value = '';
              
              // Clear context bar and reset input styling
              const contextBar = document.getElementById('context-bar');
              if (contextBar) {
                contextBar.style.display = 'none';
                Logger.debug(`CHAT_CLEAR: Context bar hidden`, null, 'general');
              }
              chatInput.placeholder = 'Start thread in Public Square';
              chatInput.style.borderColor = '';
              chatInput.style.backgroundColor = '';
              
              // Reset height and overflow properties
              chatInput.style.height = 'auto';
              chatInput.style.maxHeight = 'none';
              chatInput.style.minHeight = 'auto';
              chatInput.style.overflowY = 'hidden';
              Logger.debug(`CHAT_CLEAR: Input field height set to auto`, null, 'general');
              
              // Force a reflow and then set to natural height
              chatInput.offsetHeight; // Force reflow
              chatInput.style.height = 'auto';
              chatInput.style.maxHeight = '120px'; // Allow expansion up to 120px
              chatInput.style.minHeight = '40px'; // Minimum reasonable height
              Logger.debug(`CHAT_CLEAR: [BUILD ${EXTENSION_BUILD}] Input field cleared and styling reset`, null, 'general');
              Logger.debug(`CHAT_CLEAR: [BUILD ${EXTENSION_BUILD}] Final input field height:`, chatInput.style.height, 'general');
              Logger.debug(`CHAT_CLEAR: [BUILD ${EXTENSION_BUILD}] Final computed height:`, window.getComputedStyle(chatInput).height, 'general');
              Logger.debug(`CHAT_CLEAR: [BUILD ${EXTENSION_BUILD}] Input field value after clear:`, chatInput.value, 'general');
              Logger.debug(`CHAT_CLEAR: [BUILD ${EXTENSION_BUILD}] Message field reset completed successfully`, null, 'general');
            } catch (error) {
              debug(`Failed to send message: ${error.message}`);
              console.error('Failed to send message:', error);
            }
  } else {
            debug('No user found for sending message');
          }
        } catch (error) {
          debug(`Failed to send message: ${error.message}`);
          console.error('Failed to send message:', error);
        }
      }
    });
  }

  // --- Agent Input Authentication ---
  const agentInput = document.getElementById('agent-input');
  const agentSendButton = document.getElementById('agent-send-btn');
  
  if (agentInput) {
    agentInput.addEventListener('focus', () => {
      if (!requireAuth('interact with AI agents', () => {
        agentInput.focus();
      })) {
        agentInput.blur();
      }
    });
  }
  
  if (agentSendButton) {
    agentSendButton.addEventListener('click', () => {
      console.log('Agent send button clicked');
      requireAuth('interact with AI agents', () => {
        const message = agentInput?.value;
        if (message) {
          debug(`Sending to agent: ${message}`);
          console.log('Sending to agent:', message);
          // TODO: Implement actual agent interaction
          agentInput.value = '';
        }
      });
    });
  }

  // --- Add Friend Functionality ---
  function addFriend(userId, userName) {
    requireAuth('add friends', () => {
      debug(`Adding friend: ${userName} (${userId})`);
      // TODO: Implement actual friend adding
    });
  }

  // --- Update People Tab with Add Friend Buttons ---
  function updatePeopleTabWithAuth() {
    const peopleTab = document.getElementById('people-tab');
    if (!peopleTab) return;
    
    peopleTab.innerHTML = `
      <ul class="item-list">
        <!-- NO MOCK USERS - Only real presence data -->
      </ul>
    `;
    
    // Add event listeners to add friend buttons
    const addFriendBtns = peopleTab.querySelectorAll('.add-friend-btn');
    addFriendBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const userId = btn.dataset.userId;
        const userName = btn.dataset.userName;
        addFriend(userId, userName);
      });
    });
  }

  // Update people tab
  updatePeopleTabWithAuth();

  // Initial UI state will be set by auth manager

  // Make functions globally accessible for onclick handlers
  window.requireAuth = requireAuth;
  window.addFriend = addFriend;
  window.openUserProfile = openUserProfile;

  // Direct authentication already happened above - no need to repeat
  Logger.info("Sidebar setup complete", null, 'general');
  debug("Sidebar setup complete (from JS)");
});

// Listen for messages from background script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'TAB_CHANGED') {
    console.log('Tab changed to:', message.tabId);
    handleTabChange(message.tabId);
    return true;
  }
  
  if (message.type === 'TAB_UPDATED') {
    console.log('Tab updated:', message.tabId, message.url);
    handleTabUpdate(message.tabId, message.url);
    return true;
  }
  
  if (message.type === 'TAB_CLOSED') {
    console.log('Tab closed:', message.tabId);
    handleTabClosed(message.tabId);
    return true;
  }
  
  return false;
});

// Handle tab changes
async function handleTabChange(tabId) {
  console.log('🔄 TAB_CHANGE: === HANDLING TAB CHANGE ===');
  console.log('🔄 TAB_CHANGE: Tab ID:', tabId);
  debug(`Handling tab change for tab: ${tabId}`);
  try {
    // CRITICAL FIX: Leave current page BEFORE switching to new page
    // This prevents "ghost presence" where user appears on old page for 30 seconds
    if (window.supabaseRealtimeClient) {
      console.log('🚪 TAB_CHANGE: Leaving current page before switching...');
      await window.supabaseRealtimeClient.leaveCurrentPage();
      console.log('✅ TAB_CHANGE: Left current page successfully');
    }
    
    // Get the SPECIFIC tab URL (not active tab, but the tab that changed)
    const tab = await chrome.tabs.get(tabId);
    if (tab && tab.url) {
      console.log('🔄 TAB_CHANGE: New tab URL:', tab.url);
      debug(`New tab URL: ${tab.url}`);
      
      // CRITICAL FIX: Normalize the SPECIFIC tab URL, not the active tab
      console.log('🔄 TAB_CHANGE: Normalizing SPECIFIC tab URL:', tab.url);
      const newUrlData = await window.normalizeUrl(tab.url);
      window.currentUrlData = newUrlData; // Update global state
      console.log('🔄 TAB_CHANGE: Updated currentUrlData to:', newUrlData.pageId);
      
      // CRITICAL FIX: Ensure real-time subscription is active before loading chat
      if (window.supabaseRealtimeClient && window.supabaseRealtimeClient.currentPage) {
        console.log('🔄 TAB_CHANGE: Ensuring real-time subscription is active for new page...');
        await window.supabaseRealtimeClient.subscribeToPageUpdates(window.supabaseRealtimeClient.currentPage.pageId);
        console.log('✅ TAB_CHANGE: Real-time subscription ensured');
      }
      
      // Reload chat history for the new page (uses normalized URL)
      await loadChatHistory();
      // Update visibility list for the new page (uses normalized URL)
      const result = await chrome.storage.local.get(['activeCommunities']);
      const activeCommunities = result.activeCommunities || ['comm-001'];
      await loadCombinedAvatars(activeCommunities);
      // Start presence tracking for the new URL (uses normalized URL)
      await startPresenceTracking();
      console.log('✅ TAB_CHANGE: Tab change complete');
    } else {
      console.log('⚠️ TAB_CHANGE: No tab or URL found for tab:', tabId);
      debug(`No tab or URL found for tab: ${tabId}`);
    }
  } catch (error) {
    console.error('❌ TAB_CHANGE: Error handling tab change:', error);
    debug(`Error handling tab change: ${error.message}`);
  }
}

// Handle tab closed
async function handleTabClosed(tabId) {
  console.log('🔄 TAB_CLOSED: === HANDLING TAB CLOSURE ===');
  console.log('🔄 TAB_CLOSED: Tab ID:', tabId);
  debug(`Handling tab closure for tab: ${tabId}`);
  try {
    // CRITICAL FIX: Leave current page when tab is closed
    // This immediately marks user as inactive on the closed page
    if (window.supabaseRealtimeClient) {
      console.log('🚪 TAB_CLOSED: Leaving page from closed tab...');
      await window.supabaseRealtimeClient.leaveCurrentPage();
      console.log('✅ TAB_CLOSED: Left page successfully');
    }
    
    console.log('✅ TAB_CLOSED: Tab closure handled successfully');
  } catch (error) {
    console.error('❌ TAB_CLOSED: Error handling tab closure:', error);
    debug(`Error handling tab closure: ${error.message}`);
  }
}

// Handle tab updates (URL changes)
async function handleTabUpdate(tabId, url) {
  console.log('');
  console.log('═══════════════════════════════════════════════════════════');
  console.log('🔄 TAB_UPDATE: === HANDLING TAB UPDATE ===');
  console.log('═══════════════════════════════════════════════════════════');
  console.log('🔄 TAB_UPDATE: Tab ID:', tabId);
  console.log('🔄 TAB_UPDATE: New URL:', url);
  console.log('🔄 TAB_UPDATE: Timestamp:', new Date().toISOString());
  debug(`Handling tab update for tab: ${tabId}, URL: ${url}`);
  
  try {
    // === STEP 1: LOG CURRENT STATE ===
    console.log('');
    console.log('📊 TAB_UPDATE: STEP 1 - Current State Before Leaving');
    console.log('───────────────────────────────────────────────────────────');
    console.log('🔍 TAB_UPDATE: window.currentUrlData:', JSON.stringify(window.currentUrlData, null, 2));
    console.log('🔍 TAB_UPDATE: supabaseRealtimeClient exists:', !!window.supabaseRealtimeClient);
    console.log('🔍 TAB_UPDATE: supabaseRealtimeClient.currentPage:', JSON.stringify(window.supabaseRealtimeClient?.currentPage, null, 2));
    console.log('🔍 TAB_UPDATE: supabaseRealtimeClient.currentUser:', window.supabaseRealtimeClient?.currentUser?.userEmail);
    console.log('🔍 TAB_UPDATE: supabaseRealtimeClient.isLeavingPage:', window.supabaseRealtimeClient?.isLeavingPage);
    
    // Store old page ID BEFORE leaving (leaveCurrentPage clears it)
    const oldPageId = window.supabaseRealtimeClient?.currentPage?.pageId;
    const oldPageUrl = window.supabaseRealtimeClient?.currentPage?.pageUrl;
    console.log('🔍 TAB_UPDATE: Stored old page ID:', oldPageId);
    console.log('🔍 TAB_UPDATE: Stored old page URL:', oldPageUrl);
    
    // CRITICAL FIX: If currentPage is undefined, try to restore it from window.currentUrlData
    if (!oldPageId && window.currentUrlData) {
      console.log('🔧 TAB_UPDATE: currentPage is undefined, attempting to restore from window.currentUrlData');
      console.log('🔧 TAB_UPDATE: window.currentUrlData:', JSON.stringify(window.currentUrlData, null, 2));
      
      // Try to restore currentPage state
      if (window.supabaseRealtimeClient && window.currentUrlData.pageId) {
        window.supabaseRealtimeClient.currentPage = {
          pageId: window.currentUrlData.pageId,
          pageUrl: window.currentUrlData.normalizedUrl
        };
        console.log('🔧 TAB_UPDATE: Restored currentPage:', JSON.stringify(window.supabaseRealtimeClient.currentPage, null, 2));
      }
    }
    
    // === STEP 2: LEAVE CURRENT PAGE ===
    console.log('');
    console.log('📊 TAB_UPDATE: STEP 2 - Leaving Current Page');
    console.log('───────────────────────────────────────────────────────────');
    if (window.supabaseRealtimeClient) {
      if (oldPageId) {
        console.log('🚪 TAB_UPDATE: Calling leaveCurrentPage() for:', oldPageId);
        const leaveStartTime = Date.now();
        await window.supabaseRealtimeClient.leaveCurrentPage();
        const leaveEndTime = Date.now();
        Logger.success(`TAB_UPDATE: leaveCurrentPage() completed in ${leaveEndTime - leaveStartTime}ms`, null, 'general');
        console.log('✅ TAB_UPDATE: currentPage after leaving:', window.supabaseRealtimeClient.currentPage);
      } else {
        console.log('⚠️ TAB_UPDATE: No old page to leave (oldPageId is null)');
      }
    } else {
      console.error('❌ TAB_UPDATE: supabaseRealtimeClient not available!');
    }
    
    // === STEP 3: NORMALIZE NEW URL ===
    console.log('');
    console.log('📊 TAB_UPDATE: STEP 3 - Normalizing New URL');
    console.log('───────────────────────────────────────────────────────────');
    console.log('🔄 TAB_UPDATE: Input URL from event:', url);
    console.log('🔄 TAB_UPDATE: Calling normalizeUrl()...');
    const normalizeStartTime = Date.now();
    const newUrlData = await window.normalizeUrl(url);
    const normalizeEndTime = Date.now();
    Logger.success(`TAB_UPDATE: normalizeUrl() completed in ${normalizeEndTime - normalizeStartTime}ms`, null, 'general');
    console.log('🔍 TAB_UPDATE: Normalized result:', JSON.stringify(newUrlData, null, 2));
    
    // === STEP 4: COMPARE PAGE IDs ===
    console.log('');
    console.log('📊 TAB_UPDATE: STEP 4 - Comparing Page IDs');
    console.log('───────────────────────────────────────────────────────────');
    console.log('🔍 TAB_UPDATE: Old page ID:', oldPageId);
    console.log('🔍 TAB_UPDATE: New page ID:', newUrlData.pageId);
    console.log('🔍 TAB_UPDATE: Are they equal?', oldPageId === newUrlData.pageId);
    console.log('🔍 TAB_UPDATE: Old page ID type:', typeof oldPageId);
    console.log('🔍 TAB_UPDATE: New page ID type:', typeof newUrlData.pageId);
    
    if (oldPageId === newUrlData.pageId) {
      console.log('');
      console.log('⚠️⚠️⚠️ TAB_UPDATE: SAME PAGE DETECTED ⚠️⚠️⚠️');
      console.log('⚠️ TAB_UPDATE: Skipping presence re-join to avoid reactivation');
      console.log('⚠️ TAB_UPDATE: This prevents marking inactive then immediately active again');
      console.log('✅ TAB_UPDATE: Tab update complete (same page, no action needed)');
      console.log('═══════════════════════════════════════════════════════════');
      console.log('');
      return;
    }
    
    // === STEP 5: UPDATE GLOBAL STATE ===
    console.log('');
    console.log('📊 TAB_UPDATE: STEP 5 - Updating Global State');
    console.log('───────────────────────────────────────────────────────────');
    console.log('🔄 TAB_UPDATE: Setting window.currentUrlData to new page:', newUrlData.pageId);
    window.currentUrlData = newUrlData;
    console.log('✅ TAB_UPDATE: Global state updated');
    
    // === STEP 6: RELOAD CHAT HISTORY ===
    console.log('');
    console.log('📊 TAB_UPDATE: STEP 6 - Reloading Chat History');
    console.log('───────────────────────────────────────────────────────────');
    const chatStartTime = Date.now();
    await loadChatHistory();
    const chatEndTime = Date.now();
    Logger.success(`TAB_UPDATE: Chat history loaded in ${chatEndTime - chatStartTime}ms`, null, 'general');
    
    // === STEP 7: UPDATE VISIBILITY LIST ===
    console.log('');
    console.log('📊 TAB_UPDATE: STEP 7 - Updating Visibility List');
    console.log('───────────────────────────────────────────────────────────');
    const result = await chrome.storage.local.get(['activeCommunities']);
    const activeCommunities = result.activeCommunities || ['comm-001'];
    console.log('🔍 TAB_UPDATE: Active communities:', activeCommunities);
    const visibilityStartTime = Date.now();
    await loadCombinedAvatars(activeCommunities);
    const visibilityEndTime = Date.now();
    Logger.success(`TAB_UPDATE: Visibility list updated in ${visibilityEndTime - visibilityStartTime}ms`, null, 'general');
    
    // === STEP 8: START PRESENCE TRACKING ===
    console.log('');
    console.log('📊 TAB_UPDATE: STEP 8 - Starting Presence Tracking');
    console.log('───────────────────────────────────────────────────────────');
    console.log('🔄 TAB_UPDATE: Calling startPresenceTracking() for new page:', newUrlData.pageId);
    const presenceStartTime = Date.now();
    await startPresenceTracking();
    const presenceEndTime = Date.now();
    Logger.success(`TAB_UPDATE: Presence tracking started in ${presenceEndTime - presenceStartTime}ms`, null, 'general');
    
    // === FINAL STATE ===
    console.log('');
    console.log('📊 TAB_UPDATE: FINAL STATE');
    console.log('───────────────────────────────────────────────────────────');
    console.log('🔍 TAB_UPDATE: window.currentUrlData:', JSON.stringify(window.currentUrlData, null, 2));
    console.log('🔍 TAB_UPDATE: supabaseRealtimeClient.currentPage:', JSON.stringify(window.supabaseRealtimeClient?.currentPage, null, 2));
    console.log('🔍 TAB_UPDATE: supabaseRealtimeClient.isLeavingPage:', window.supabaseRealtimeClient?.isLeavingPage);
    
    console.log('');
    console.log('✅✅✅ TAB_UPDATE: COMPLETE ✅✅✅');
    console.log('═══════════════════════════════════════════════════════════');
    console.log('');
  } catch (error) {
    console.log('');
    console.log('❌❌❌ TAB_UPDATE: ERROR ❌❌❌');
    console.log('═══════════════════════════════════════════════════════════');
    console.error('❌ TAB_UPDATE: Error details:', error);
    console.error('❌ TAB_UPDATE: Error message:', error.message);
    console.error('❌ TAB_UPDATE: Error stack:', error.stack);
    console.log('═══════════════════════════════════════════════════════════');
    console.log('');
    debug(`Error handling tab update: ${error.message}`);
  }
}

// Toggle thread replies visibility
async function toggleThreadReplies(threadId, messageElement) {
  const toggleBtn = messageElement.querySelector('.thread-toggle-btn');
  if (!toggleBtn) return;
  
  const isExpanded = toggleBtn.dataset.expanded === 'true';
  const chatMessages = document.querySelector('.chat-messages');
  
  // Find all reply messages for this thread
  const replyMessages = chatMessages.querySelectorAll(`.message-reply[data-conversation-id="${threadId}"]`);
  
  if (isExpanded) {
    // Collapse - hide reply messages
    replyMessages.forEach(reply => {
      reply.classList.remove('visible');
    });
    // Update icon but preserve count
    const countSpan = toggleBtn.querySelector('.icon-count');
    const count = countSpan ? countSpan.outerHTML : '';
    toggleBtn.innerHTML = `📂${count}`;
    toggleBtn.dataset.expanded = 'false';
    toggleBtn.title = 'Show thread replies';
  } else {
    // Expand - show reply messages
    replyMessages.forEach(reply => {
      reply.classList.add('visible');
    });
    // Update icon but preserve count
    const countSpan = toggleBtn.querySelector('.icon-count');
    const count = countSpan ? countSpan.outerHTML : '';
    toggleBtn.innerHTML = `📁${count}`;
    toggleBtn.dataset.expanded = 'true';
    toggleBtn.title = 'Hide thread replies';
  }
  
  // Update visual hierarchy after toggling thread
  updateMessageVisualHierarchy();
}

// ===== PRESENCE TRACKING =====
// Using Supabase real-time only

let currentPageId = null;

// Start presence tracking for the current page
// NOW USES: RealtimePresenceHandler
async function startPresenceTracking() {
  console.log('🔍 PRESENCE_FUNCTION: === startPresenceTracking() called ===');
  
  try {
    // Get normalized URL data
    const urlData = await normalizeCurrentUrl();
    currentPageId = urlData.pageId;
    
    console.log('🔍 PRESENCE: Starting for page:', currentPageId);
    console.log('🔍 PRESENCE: URL:', urlData.normalizedUrl);
    console.log('🔍 PRESENCE: User:', await getCurrentUserEmail());
    
    // Use robust integration system if available
    if (window.robustIntegration && window.robustIntegration.isInitialized) {
      console.log('🔧 PRESENCE: Using robust integration system...');
      const joinSuccess = await window.robustIntegration.joinPage(urlData.normalizedUrl);
      if (joinSuccess) {
        console.log('✅ PRESENCE: Robust integration system configured with user and page');
      } else {
        console.warn('⚠️ PRESENCE: Robust integration failed, falling back to legacy system');
        await joinPageWithSupabase(currentPageId, urlData.normalizedUrl);
      }
    } else {
      // Fallback to legacy system
      console.log('🔧 PRESENCE: Using legacy SupabaseRealtimeClient system...');
      await joinPageWithSupabase(currentPageId, urlData.normalizedUrl);
      console.log('✅ PRESENCE: Legacy SupabaseRealtimeClient configured with user and page');
    }

    // Join page with visibility system if available
    if (window.visibilityIntegration && window.visibilityIntegration.isInitialized) {
      console.log('🔧 PRESENCE: Using visibility integration system...');
      const visibilityJoinSuccess = await window.visibilityIntegration.joinPage(urlData.normalizedUrl);
      if (visibilityJoinSuccess) {
        console.log('✅ PRESENCE: Visibility integration system configured with user and page');
      } else {
        console.warn('⚠️ PRESENCE: Visibility integration failed');
      }
    }

    // Join page with reactions system if available
    if (window.reactionsIntegration && window.reactionsIntegration.isInitialized) {
      console.log('🔧 PRESENCE: Using reactions integration system...');
      const reactionsJoinSuccess = await window.reactionsIntegration.joinPage(urlData.normalizedUrl);
      if (reactionsJoinSuccess) {
        console.log('✅ PRESENCE: Reactions integration system configured with user and page');
      } else {
        console.warn('⚠️ PRESENCE: Reactions integration failed');
      }
    }

    // Join page with auras system if available
    if (window.aurasIntegration && window.aurasIntegration.isInitialized) {
      console.log('🔧 PRESENCE: Using auras integration system...');
      const aurasJoinSuccess = await window.aurasIntegration.joinPage(urlData.normalizedUrl);
      if (aurasJoinSuccess) {
        console.log('✅ PRESENCE: Auras integration system configured with user and page');
      } else {
        console.warn('⚠️ PRESENCE: Auras integration failed');
      }
    }

        // Use UnifiedPresenceManager if available, otherwise fallback to existing system
        if (window.UnifiedPresenceManager) {
          console.log('🔧 PRESENCE: Using UnifiedPresenceManager...');
          console.log('🔍 PRESENCE DEBUG: UnifiedPresenceManager available:', !!window.UnifiedPresenceManager);
          console.log('🔍 PRESENCE DEBUG: window.supabase available:', !!window.supabase);
          console.log('🔍 PRESENCE DEBUG: Current user email:', await getCurrentUserEmail());
          console.log('🔍 PRESENCE DEBUG: Current page ID:', currentPageId);
          
          try {
            const unifiedPresence = new window.UnifiedPresenceManager(window.supabase);
            console.log('🔍 PRESENCE DEBUG: UnifiedPresenceManager instance created:', !!unifiedPresence);
            
            const initSuccess = await unifiedPresence.initialize(
              { email: await getCurrentUserEmail() }, 
              currentPageId
            );
            
            console.log('🔍 PRESENCE DEBUG: Initialization result:', initSuccess);
            
            if (initSuccess) {
              console.log('✅ PRESENCE: UnifiedPresenceManager initialized successfully');
              
              // CRITICAL FIX: Send initial presence event to backend
              console.log('🔍 PRESENCE DEBUG: Sending initial presence event to backend...');
              try {
                const presenceResult = await sendPresenceEvent('ENTER');
                console.log('✅ PRESENCE DEBUG: Initial presence event sent successfully:', presenceResult);
              } catch (error) {
                console.error('❌ PRESENCE DEBUG: Failed to send initial presence event:', error);
              }
              
              // Listen for presence updates
              window.addEventListener('presenceUpdate', (event) => {
                console.log('🔍 PRESENCE: Received presence update:', event.detail);
                console.log('🔍 PRESENCE DEBUG: Event detail type:', typeof event.detail);
                console.log('🔍 PRESENCE DEBUG: Event detail activeUsers:', event.detail?.activeUsers);
                console.log('🔍 PRESENCE DEBUG: Active users count:', event.detail?.activeUsers?.length || 0);
                // Update visibility UI with active users
                updateVisibleTab(event.detail.activeUsers);
              });
              
              // Store the unified presence manager globally for cleanup
              window.unifiedPresenceManager = unifiedPresence;
              console.log('🔍 PRESENCE DEBUG: UnifiedPresenceManager stored globally:', !!window.unifiedPresenceManager);
            } else {
              console.error('❌ PRESENCE: UnifiedPresenceManager initialization failed');
              console.log('🔍 PRESENCE DEBUG: Initialization failed, falling back to existing system');
            }
          } catch (error) {
            console.error('❌ PRESENCE: Error with UnifiedPresenceManager:', error);
            console.log('🔍 PRESENCE DEBUG: Error details:', error.message, error.stack);
          }
        } else {
      // Fallback to existing system
      console.log('🔧 PRESENCE: Using existing presence system...');
      try {
        const presenceResult = await sendPresenceEvent('ENTER');
        console.log('✅ PRESENCE: Initial presence event sent successfully');
        console.log('🔍 PRESENCE DEBUG: Presence event result:', presenceResult);
        
        // Wait a moment for the presence to be processed, then refresh visibility
        setTimeout(async () => {
          console.log('🔍 PRESENCE DEBUG: Refreshing visibility after presence event...');
          console.log('🔍 PRESENCE DEBUG: About to call refreshVisibilityAvatars()');
          console.log('🔍 PRESENCE DEBUG: window.supabaseRealtimeClient available:', !!window.supabaseRealtimeClient);
          console.log('🔍 PRESENCE DEBUG: window.currentUrlData available:', !!window.currentUrlData);
          console.log('🔍 PRESENCE DEBUG: window.currentUrlData.pageId:', window.currentUrlData?.pageId);
          console.log('🔍 PRESENCE DEBUG: window.supabase available:', !!window.supabase);
          
          try {
            await refreshVisibilityAvatars();
            console.log('✅ PRESENCE DEBUG: Visibility refreshed after presence event');
          } catch (error) {
            console.error('❌ PRESENCE DEBUG: Failed to refresh visibility:', error);
            console.log('🔍 PRESENCE DEBUG: Error details:', error.message, error.stack);
          }
        }, 2000);
      } catch (error) {
        console.error('❌ PRESENCE: Failed to send initial presence event:', error);
        console.error('🔍 PRESENCE DEBUG: Error details:', error.message, error.stack);
      }
    }
    
    // Set up single comprehensive Supabase real-time subscription for this page
    console.log('🔔 REALTIME: Setting up page-based real-time subscription...');
    console.log('🔔 REALTIME: Page URL:', urlData.normalizedUrl);
    
    // Single channel that handles all real-time events for this page
    const pageChannel = supabase
      .channel(`page-${currentPageId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'user_presence',
        filter: `page_url=eq.${urlData.normalizedUrl}`
      }, (payload) => {
        console.log('🔔 PAGE_PRESENCE: Real-time update received:', payload);
        handlePresenceChange(payload);
      })
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'messages',
        filter: `page_url=eq.${urlData.normalizedUrl}`
      }, (payload) => {
        console.log('🔔 PAGE_MESSAGES: Real-time update received:', payload);
        handleMessageChange(payload);
      })
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'reactions',
        filter: `page_url=eq.${urlData.normalizedUrl}`
      }, (payload) => {
        console.log('🔔 PAGE_REACTIONS: Real-time update received:', payload);
        handleReactionChange(payload);
      })
      .subscribe((status, err) => {
        if (err) {
          console.error('❌ REALTIME: Subscription error:', err);
        } else {
          console.log('✅ REALTIME: Subscription status:', status);
        }
      });
    
    console.log('✅ REALTIME: All Supabase real-time subscriptions started');
    
    // Make real-time functions globally accessible for testing
    window.handlePresenceChange = handlePresenceChange;
    window.handleMessageChange = handleMessageChange;
    window.handleReactionChange = handleReactionChange;
    window.handleAuraChange = handleAuraChange;
    
    console.log('✅ REALTIME: Real-time functions made globally accessible');
    
    // Add comprehensive test function
    window.testRealtimeSystem = function() {
      console.log('🧪 REALTIME SYSTEM TEST');
      console.log('========================');
      
      // Test 1: Function access
      const functions = ['handlePresenceChange', 'handleMessageChange', 'handleReactionChange', 'handleAuraChange'];
      let accessible = 0;
      functions.forEach(func => {
        if (typeof window[func] === 'function') {
          console.log(`✅ ${func}: Available`);
          accessible++;
        } else {
          console.log(`❌ ${func}: Missing`);
        }
      });
      console.log(`📊 Functions accessible: ${accessible}/${functions.length}`);
      
      // Test 2: Supabase client
      if (typeof window.supabase !== 'undefined' && window.supabase) {
        console.log('✅ Supabase client available');
        console.log('   - URL:', window.supabase.supabaseUrl);
        console.log('   - Key present:', !!window.supabase.supabaseKey);
      } else {
        console.log('❌ Supabase client not available');
      }
      
      // Test 3: Current page data
      if (window.currentUrlData) {
        console.log('✅ Current page data available:', window.currentUrlData.pageId);
      } else {
        console.log('❌ No current page data found');
      }
      
      // Test 4: Active subscriptions
      if (window.supabase && window.supabase.realtime) {
        const channels = window.supabase.realtime.channels;
        console.log('📊 Active channels:', Object.keys(channels).length);
        Object.keys(channels).forEach(channelName => {
          const channel = channels[channelName];
          console.log(`   - ${channelName}: ${channel.state}`);
        });
      }
      
      // Test 5: Simulate real-time events
      console.log('🧪 Testing real-time event handlers...');
      
      // Test presence handler
      if (typeof window.handlePresenceChange === 'function') {
        const testPresencePayload = {
          eventType: 'INSERT',
          new: {
            user_email: 'test@example.com',
            page_url: window.currentUrlData?.normalizedUrl || 'test-page',
            aura_color: '#ff0000',
            is_active: true
          }
        };
        try {
          window.handlePresenceChange(testPresencePayload);
          console.log('✅ Presence handler test passed');
        } catch (error) {
          console.log('❌ Presence handler test failed:', error);
        }
      }
      
      console.log('🏁 REALTIME TEST COMPLETED');
    };
    
    // Add comprehensive diagnostic functions
    window.deepRealtimeDiagnostic = function() {
      console.log('🔍 DEEP REALTIME DIAGNOSTIC');
      console.log('============================');
      
      // Test 1: Supabase Library Loading
      console.log('📊 TEST 1: Supabase Library');
      console.log('  - typeof supabase:', typeof supabase);
      console.log('  - supabase.createClient:', typeof supabase?.createClient);
      console.log('  - supabase.realtime:', typeof supabase?.realtime);
      
      // Test 2: Client Creation
      console.log('📊 TEST 2: Client Creation');
      if (window.supabase) {
        console.log('  ✅ window.supabase exists');
        console.log('  - URL:', window.supabase.supabaseUrl);
        console.log('  - Key present:', !!window.supabase.supabaseKey);
        console.log('  - Realtime available:', !!window.supabase.realtime);
      } else {
        console.log('  ❌ window.supabase missing');
      }
      
      // Test 3: Realtime Connection
      console.log('📊 TEST 3: Realtime Connection');
      if (window.supabase?.realtime) {
        console.log('  - Connection state:', window.supabase.realtime.connectionState);
        console.log('  - Channels:', Object.keys(window.supabase.realtime.channels));
        console.log('  - Active channels:', Object.keys(window.supabase.realtime.channels).length);
      } else {
        console.log('  ❌ Realtime not available');
      }
      
      // Test 4: Test Simple Subscription
      console.log('📊 TEST 4: Test Simple Subscription');
      if (window.supabase?.realtime) {
        try {
          const testChannel = window.supabase
            .channel('diagnostic-test')
            .on('postgres_changes', {
              event: '*',
              schema: 'public',
              table: 'user_presence'
            }, (payload) => {
              console.log('🎉 DIAGNOSTIC: Received test payload:', payload);
            })
            .subscribe((status, err) => {
              console.log('🎉 DIAGNOSTIC: Test subscription status:', status);
              if (err) {
                console.error('🎉 DIAGNOSTIC: Test subscription error:', err);
              }
            });
          
          // Clean up after 5 seconds
          setTimeout(() => {
            testChannel.unsubscribe();
            console.log('🧹 DIAGNOSTIC: Test subscription cleaned up');
          }, 5000);
          
        } catch (error) {
          console.error('❌ DIAGNOSTIC: Test subscription failed:', error);
        }
      }
      
      console.log('🏁 DEEP DIAGNOSTIC COMPLETE');
    };
    
    window.emergencyRealtimeFix = async function() {
      console.log('🚨 EMERGENCY REALTIME FIX STARTING...');
      console.log('=====================================');
      
      // Step 1: Check if Supabase library is loaded
      if (typeof window.supabase === 'undefined') {
        console.error('❌ CRITICAL: window.supabase not available');
        console.log('🔧 FIX: Check if Supabase client is properly initialized');
        return;
      }
      
      // Step 2: Check current Supabase client
      console.log('🔧 STEP 2: Checking current Supabase client...');
      console.log('  - Current client exists:', !!window.supabase);
      console.log('  - Client URL:', window.supabase?.supabaseUrl);
      console.log('  - Client key present:', !!window.supabase?.supabaseKey);
      console.log('  - Realtime available:', !!window.supabase?.realtime);
      
      // Step 3: Test current client
      console.log('🔧 STEP 3: Testing current client...');
      try {
        const { data, error } = await window.supabase
          .from('user_presence')
          .select('*')
          .limit(1);
        
        if (error) {
          console.error('❌ Current client test failed:', error);
          console.log('🔧 This suggests RLS or authentication issues');
        } else {
          console.log('✅ Current client working:', data);
        }
      } catch (error) {
        console.error('❌ Current client test error:', error);
      }
      
      // Step 4: Test real-time subscription with minimal setup
      console.log('🔧 STEP 4: Testing minimal real-time subscription...');
      try {
        const testChannel = window.supabase
          .channel('emergency-test')
          .on('postgres_changes', {
            event: '*',
            schema: 'public',
            table: 'user_presence'
          }, (payload) => {
            console.log('🎉 EMERGENCY FIX: Received real-time event:', payload);
          })
          .subscribe((status, err) => {
            console.log('🎉 EMERGENCY FIX: Subscription status:', status);
            if (err) {
              console.error('❌ EMERGENCY FIX: Subscription error:', err);
              console.log('🔧 POSSIBLE FIXES:');
              console.log('  1. Check if real-time is enabled in Supabase dashboard');
              console.log('  2. Check RLS policies for real-time access');
              console.log('  3. Check if WebSocket connections are allowed');
              console.log('  4. Check browser network tab for WebSocket errors');
            } else if (status === 'SUBSCRIBED') {
              console.log('✅ EMERGENCY FIX: Real-time subscription working!');
            }
          });
        
        // Clean up after 10 seconds
        setTimeout(() => {
          testChannel.unsubscribe();
          console.log('🧹 Emergency test cleaned up');
        }, 10000);
        
      } catch (error) {
        console.error('❌ Emergency real-time test failed:', error);
      }
      
      console.log('🏁 EMERGENCY FIX COMPLETED');
    };
    
    window.checkRLSStatus = async function() {
      console.log('🔍 CHECKING RLS STATUS...');
      
      if (!window.supabase) {
        console.log('❌ No Supabase client available');
        return;
      }
      
      try {
        // Test 1: Basic table access
        console.log('📊 TEST 1: Basic table access');
        const { data, error } = await window.supabase
          .from('user_presence')
          .select('*')
          .limit(1);
        
        if (error) {
          console.error('❌ Basic access failed:', error);
          console.log('🔧 Error details:', error.message);
          console.log('🔧 Error code:', error.code);
        } else {
          console.log('✅ Basic access successful:', data);
        }
        
        // Test 2: Community filter (the failing query)
        console.log('📊 TEST 2: Community filter query');
        const { data: communityData, error: communityError } = await window.supabase
          .from('user_presence')
          .select('*')
          .in('community_id', ['comm-001', 'comm-002'])
          .eq('is_active', true);
        
        if (communityError) {
          console.error('❌ Community filter failed:', communityError);
          console.log('🔧 This is the 400 error source');
          console.log('🔧 Error details:', communityError.message);
          console.log('🔧 Error code:', communityError.code);
        } else {
          console.log('✅ Community filter successful:', communityData);
        }
        
        // Test 3: Authentication status
        console.log('📊 TEST 3: Authentication status');
        const { data: authData, error: authError } = await window.supabase.auth.getUser();
        if (authError) {
          console.log('❌ Not authenticated:', authError.message);
        } else {
          console.log('✅ Authenticated user:', authData.user?.email);
        }
        
      } catch (error) {
        console.error('❌ RLS Check error:', error);
      }
    };
    
    // Add comprehensive 400 error fix
    window.fix400Error = async function() {
      console.log('🔧 FIXING 400 ERROR...');
      console.log('======================');
      
      if (!window.supabase) {
        console.log('❌ No Supabase client available');
        return;
      }
      
      try {
        // Fix 1: Check if user is authenticated
        console.log('🔧 FIX 1: Checking authentication...');
        const { data: authData, error: authError } = await window.supabase.auth.getUser();
        
        if (authError || !authData.user) {
          console.log('❌ User not authenticated - this causes 400 errors');
          console.log('🔧 SOLUTION: User needs to be authenticated for RLS policies');
          
          // Try to get current user from session
          const { data: sessionData } = await window.supabase.auth.getSession();
          if (sessionData.session) {
            console.log('✅ Session found, user should be authenticated');
          } else {
            console.log('❌ No session found - user needs to log in');
          }
        } else {
          console.log('✅ User authenticated:', authData.user.email);
        }
        
        // Fix 2: Test with simpler query
        console.log('🔧 FIX 2: Testing simpler query...');
        const { data: simpleData, error: simpleError } = await window.supabase
          .from('user_presence')
          .select('*')
          .limit(1);
        
        if (simpleError) {
          console.error('❌ Simple query failed:', simpleError);
          console.log('🔧 This suggests RLS policies are blocking all access');
        } else {
          console.log('✅ Simple query successful');
        }
        
        // Fix 3: Test community filter with different approach
        console.log('🔧 FIX 3: Testing community filter...');
        const { data: communityData, error: communityError } = await window.supabase
          .from('user_presence')
          .select('*')
          .eq('community_id', 'comm-001')
          .eq('is_active', true);
        
        if (communityError) {
          console.error('❌ Community filter failed:', communityError);
          console.log('🔧 POSSIBLE SOLUTIONS:');
          console.log('  1. Check RLS policies allow community_id filtering');
          console.log('  2. Verify community_id column exists');
          console.log('  3. Check if user has access to comm-001');
        } else {
          console.log('✅ Community filter successful');
        }
        
        // Fix 4: Check table structure
        console.log('🔧 FIX 4: Checking table structure...');
        const { data: structureData, error: structureError } = await window.supabase
          .from('user_presence')
          .select('community_id, is_active, user_email')
          .limit(1);
        
        if (structureError) {
          console.error('❌ Structure check failed:', structureError);
          console.log('🔧 This suggests column names might be wrong');
        } else {
          console.log('✅ Table structure accessible');
        }
        
      } catch (error) {
        console.error('❌ Fix 400 error failed:', error);
      }
      
      console.log('🏁 400 ERROR FIX COMPLETED');
    };
    
    // Add URL verification function
    window.verifySupabaseURL = function() {
      console.log('🔍 VERIFYING SUPABASE URL...');
      console.log('============================');
      
      if (window.supabase) {
        console.log('✅ Supabase client available');
        console.log('  - Current URL:', window.supabase.supabaseUrl);
        console.log('  - Expected URL:', window.SUPABASE_URL);
        
        if (window.supabase.supabaseUrl === window.SUPABASE_URL) {
          console.log('✅ URL is correct!');
        } else {
          console.log('❌ URL is wrong! This will cause 400 errors');
        }
      } else {
        console.log('❌ No Supabase client available');
      }
      
      console.log('🏁 URL VERIFICATION COMPLETE');
    };
    
    // Add API diagnostic function
    window.testAPI = async function() {
      console.log('🔍 TESTING API CALLS...');
      console.log('======================');
      
      // Test 1: Check API URL
      console.log('📊 TEST 1: API URL');
      console.log('  - METALAYER_API_URL:', METALAYER_API_URL);
      console.log('  - window.METALAYER_API_URL:', window.METALAYER_API_URL);
      
      // Test 2: Check API object
      console.log('📊 TEST 2: API Object');
      console.log('  - api object exists:', !!api);
      console.log('  - api.baseURL:', api?.baseURL);
      console.log('  - api methods:', Object.getOwnPropertyNames(Object.getPrototypeOf(api)));
      
      // Test 3: Test API call
      console.log('📊 TEST 3: API Call Test');
      try {
        const response = await api.getCommunities();
        console.log('✅ API call successful:', response);
      } catch (error) {
        console.error('❌ API call failed:', error);
        console.log('🔧 This suggests API server issues or authentication problems');
      }
      
      console.log('🏁 API TEST COMPLETED');
    };
    
    // Add dynamic CSP management
    window.updateCSP = function() {
      console.log('🔧 UPDATING CSP DYNAMICALLY...');
      
      if (window.SUPABASE_URL) {
        const supabaseUrl = window.SUPABASE_URL;
        const supabaseWsUrl = supabaseUrl.replace('https://', 'wss://');
        
        console.log('🔧 Adding Supabase URLs to CSP:', {
          https: supabaseUrl,
          wss: supabaseWsUrl
        });
        
        // Update the page's CSP dynamically
        const meta = document.createElement('meta');
        meta.httpEquiv = 'Content-Security-Policy';
        meta.content = `script-src 'self'; object-src 'self'; connect-src 'self' ${supabaseUrl} ${supabaseWsUrl} http://localhost:3001 ws://localhost:3001 http://216.238.91.120:3002 ws://216.238.91.120:3002 https://app.themetalayer.org https://api.themetalayer.org https://www.googleapis.com wss://echo.websocket.org https://www.youtube.com;`;
        
        // Remove existing CSP meta tag if any
        const existingMeta = document.querySelector('meta[http-equiv="Content-Security-Policy"]');
        if (existingMeta) {
          existingMeta.remove();
        }
        
        document.head.appendChild(meta);
        console.log('✅ CSP updated dynamically with Supabase URLs');
      } else {
        console.log('❌ No SUPABASE_URL available for CSP update');
      }
    };
    
    // Call CSP update immediately
    window.updateCSP();
    
    // Add CSP diagnostic function
    window.testCSP = function() {
      console.log('🔍 TESTING CSP...');
      console.log('=================');
      
      // Test 1: Check current CSP
      const metaCSP = document.querySelector('meta[http-equiv="Content-Security-Policy"]');
      if (metaCSP) {
        console.log('📊 Current CSP meta tag:', metaCSP.content);
      } else {
        console.log('📊 No CSP meta tag found');
      }
      
      // Test 2: Check manifest CSP
      console.log('📊 Manifest CSP should allow *.supabase.co');
      
      // Test 3: Test Supabase connection
      if (window.SUPABASE_URL) {
        console.log('📊 Testing Supabase connection to:', window.SUPABASE_URL);
        console.log('📊 This should now work with wildcard CSP');
      }
      
      console.log('🏁 CSP TEST COMPLETED');
    };
    
    // Test function to verify message addition fix
    window.testMessageAdditionFix = async function() {
      console.log('🧪🧪🧪 ============================================');
      console.log('🧪🧪🧪 TEST MESSAGE ADDITION FIX');
      console.log('🧪🧪🧪 ============================================');
      
      const testMessage = `TEST MESSAGE ${Date.now()}`;
      console.log('📝 Test message:', testMessage);
      
      // Get current message count
      const messagesBefore = document.querySelectorAll('.message').length;
      console.log('📊 Messages before:', messagesBefore);
      
      try {
        // Send test message
        console.log('📡 Sending test message via Supabase...');
        const result = await window.supabaseRealtimeClient.sendMessage(testMessage);
        console.log('✅ Message sent:', result);
        
        // Wait a moment for UI to update
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Check message count after
        const messagesAfter = document.querySelectorAll('.message').length;
        console.log('📊 Messages after:', messagesAfter);
        
        // Verify the message is visible
        const allMessages = Array.from(document.querySelectorAll('.message'));
        const testMessageElement = allMessages.find(msg => 
          msg.textContent.includes(testMessage)
        );
        
        if (testMessageElement) {
          console.log('✅✅✅ TEST PASSED: Message is visible in UI');
          console.log('✅ Message element:', testMessageElement);
          return true;
        } else {
          console.error('❌❌❌ TEST FAILED: Message not found in UI');
          console.error('❌ All message texts:', allMessages.map(m => m.textContent.substring(0, 50)));
          return false;
        }
      } catch (error) {
        console.error('❌❌❌ TEST FAILED: Error during test');
        console.error('❌ Error:', error);
        return false;
      }
    };

    // Test function to verify real-time propagation
    window.testRealTimePropagation = async function() {
      console.log('📡📡📡 ============================================');
      console.log('📡📡📡 TEST REAL-TIME PROPAGATION');
      console.log('📡📡📡 ============================================');
      
      console.log('🔍 PROPAGATION_TEST: Checking real-time connection status...');
      console.log('🔍 PROPAGATION_TEST: SupabaseRealtimeClient available:', !!window.supabaseRealtimeClient);
      console.log('🔍 PROPAGATION_TEST: Connection status:', window.supabaseRealtimeClient?.isConnected);
      console.log('🔍 PROPAGATION_TEST: Active channels:', window.supabaseRealtimeClient?.channels?.size);
      console.log('🔍 PROPAGATION_TEST: Current user:', window.supabaseRealtimeClient?.currentUser);
      console.log('🔍 PROPAGATION_TEST: Current page:', window.supabaseRealtimeClient?.currentPage);
      
      if (!window.supabaseRealtimeClient) {
        console.error('❌❌❌ PROPAGATION_TEST: No SupabaseRealtimeClient available');
        return false;
      }
      
      if (!window.supabaseRealtimeClient.isConnected) {
        console.warn('⚠️⚠️⚠️ PROPAGATION_TEST: Real-time connection is NOT active');
        console.warn('⚠️ PROPAGATION_TEST: This will prevent message propagation to other users');
        console.warn('⚠️ PROPAGATION_TEST: Attempting to reconnect...');
        
        // Try to reconnect
        const currentPage = window.supabaseRealtimeClient.currentPage;
        if (currentPage) {
          console.log('🔄 PROPAGATION_TEST: Reconnecting to page:', currentPage.pageId);
          await window.supabaseRealtimeClient.subscribeToPageUpdates(currentPage.pageId);
          
          // Wait a moment for connection
          await new Promise(resolve => setTimeout(resolve, 2000));
          
          console.log('🔍 PROPAGATION_TEST: Connection status after reconnect:', window.supabaseRealtimeClient.isConnected);
        }
      }
      
      const testMessage = `PROPAGATION TEST ${Date.now()}`;
      console.log('📝 PROPAGATION_TEST: Sending test message:', testMessage);
      
      try {
        const result = await window.supabaseRealtimeClient.sendMessage(testMessage);
        console.log('✅ PROPAGATION_TEST: Message sent successfully:', result);
        console.log('✅ PROPAGATION_TEST: Message should now propagate to other users via real-time');
        console.log('✅ PROPAGATION_TEST: Check other browser instances to verify propagation');
        return true;
      } catch (error) {
        console.error('❌❌❌ PROPAGATION_TEST: Failed to send message');
        console.error('❌ PROPAGATION_TEST: Error:', error);
        return false;
      }
    };
    
        console.log('✅ REALTIME: All diagnostic functions added - call deepRealtimeDiagnostic() to test');
        console.log('✅ MESSAGE FIX: Call testMessageAdditionFix() to verify message addition works');
        console.log('✅ PROPAGATION: Call testRealTimePropagation() to test real-time message propagation');
        console.log('✅ COMPREHENSIVE: Call testCompleteMessageSystem() to test all message functionality');
    
  } catch (error) {
    console.error('❌ PRESENCE: Failed to start:', error);
  }
}

// Handle real-time presence changes from Supabase
function handlePresenceChange(payload) {
  console.log('🔔 PRESENCE_CHANGE: Processing real-time update:', payload);
  
  const { eventType, new: newRecord, old: oldRecord } = payload;
  
  switch (eventType) {
    case 'INSERT':
      console.log('👋 PRESENCE: User joined:', newRecord);
      addUserToVisibility(newRecord);
      break;
      
    case 'UPDATE':
      console.log('🔄 PRESENCE: User updated:', newRecord);
      updateUserInVisibility(newRecord);
      break;
      
    case 'DELETE':
      console.log('👋 PRESENCE: User left:', oldRecord);
      removeUserFromVisibility(oldRecord);
      break;
      
    default:
      console.log('❓ PRESENCE: Unknown event type:', eventType);
  }
}

// Handle real-time message changes from Supabase
function handleMessageChange(payload) {
  console.log('🔔 MESSAGE_CHANGE: Processing real-time update:', payload);
  
  const { eventType, new: newRecord, old: oldRecord } = payload;
  
  switch (eventType) {
    case 'INSERT':
      console.log('💬 MESSAGE: New message received:', newRecord);
      addMessageToChat(newRecord);
      break;
      
    case 'UPDATE':
      console.log('🔄 MESSAGE: Message updated:', newRecord);
      updateMessageInChat(newRecord);
      break;
      
    case 'DELETE':
      console.log('🗑️ MESSAGE: Message deleted:', oldRecord);
      removeMessageFromChat(oldRecord);
      break;
      
    default:
      console.log('❓ MESSAGE: Unknown event type:', eventType);
  }
}

// Handle real-time reaction changes from Supabase
function handleReactionChange(payload) {
  console.log('🔔 REACTION_CHANGE: Processing real-time update:', payload);
  
  const { eventType, new: newRecord, old: oldRecord } = payload;
  
  switch (eventType) {
    case 'INSERT':
      console.log('👍 REACTION: New reaction added:', newRecord);
      addReactionToMessage(newRecord);
      break;
      
    case 'UPDATE':
      console.log('🔄 REACTION: Reaction updated:', newRecord);
      updateReactionInMessage(newRecord);
      break;
      
    case 'DELETE':
      console.log('👎 REACTION: Reaction removed:', oldRecord);
      removeReactionFromMessage(oldRecord);
      break;
      
    default:
      console.log('❓ REACTION: Unknown event type:', eventType);
  }
}

// Handle real-time aura color changes from Supabase
function handleAuraChange(payload) {
  console.log('🔔 AURA_CHANGE: Processing real-time update:', payload);
  
  const { eventType, new: newRecord, old: oldRecord } = payload;
  
  if (eventType === 'UPDATE' && newRecord.aura_color !== oldRecord.aura_color) {
    console.log('🎨 AURA: Color changed for user:', newRecord.user_email, 'from', oldRecord.aura_color, 'to', newRecord.aura_color);
    updateUserAuraInUI(newRecord.user_email, newRecord.aura_color);
  }
}

// Stop presence tracking
async function stopPresenceTracking() {
  console.log('🛑 PRESENCE: Stopping');
  
  // Use new real-time handler
  if (window.realtimePresenceHandler) {
    await window.realtimePresenceHandler.stop();
    console.log('✅ PRESENCE: Stopped via RealtimePresenceHandler');
  }
  
  currentPageId = null;
}

// Send a presence event to the server
async function sendPresenceEvent(kind, availability = null, customLabel = null) {
  console.log('🔍 PRESENCE EVENT DEBUG: Starting sendPresenceEvent');
  console.log('🔍 PRESENCE EVENT DEBUG: Kind:', kind);
  console.log('🔍 PRESENCE EVENT DEBUG: Availability:', availability);
  console.log('🔍 PRESENCE EVENT DEBUG: Custom label:', customLabel);
  
  try {
    if (!currentPageId) {
      console.warn('❌ PRESENCE EVENT: No current pageId for presence event');
      console.log('🔍 PRESENCE EVENT DEBUG: currentPageId is null/undefined');
      return;
    }
    
    console.log('🔍 PRESENCE EVENT DEBUG: Current page ID:', currentPageId);
    
    // Get normalized URL data - SAME AS MESSAGES AND VISIBILITY
    const urlData = await normalizeCurrentUrl();
    console.log('🔍 PRESENCE EVENT DEBUG: URL data:', urlData);
    
    const userEmail = await getCurrentUserEmail();
    console.log('🔍 PRESENCE EVENT DEBUG: User email:', userEmail);
    
    const userId = await getCurrentUserId();
    console.log('🔍 PRESENCE EVENT DEBUG: User ID:', userId);
    
    const requestBody = {
      pageId: currentPageId,
      kind,
      availability,
      customLabel,
      pageUrl: urlData.rawUrl // Use the raw URL from urlData
    };
    
    console.log('🔍 PRESENCE EVENT DEBUG: Request body:', requestBody);
    console.log('🔍 PRESENCE EVENT DEBUG: API URL:', `${METALAYER_API_URL}/v1/presence/event`);
    
    const response = await fetch(`${METALAYER_API_URL}/v1/presence/event`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-email': userEmail,
        'x-user-id': userId
      },
      body: JSON.stringify(requestBody)
    });
    
    console.log('🔍 PRESENCE EVENT DEBUG: Response status:', response.status);
    console.log('🔍 PRESENCE EVENT DEBUG: Response ok:', response.ok);
    
    if (response.ok) {
      const responseData = await response.json();
      console.log('🔍 PRESENCE EVENT DEBUG: Response data:', responseData);
      Logger.success(`PRESENCE: ${kind} event sent successfully`, null, 'general');
      
           // CHROME EXTENSION WEBSOCKET FIX: Send via background service worker
           await sendSupabaseMessage({
             type: 'PRESENCE_UPDATE',
             kind: kind,
             availability: availability,
             customLabel: customLabel,
             pageId: currentPageId,
             userEmail: userEmail,
             timestamp: Date.now()
           });
           Logger.info(`👥 WEBSOCKET: ${kind} event broadcast via background service worker`, null, 'general');
    } else {
      console.warn(`❌ PRESENCE: Failed to send ${kind} event:`, response.status);
      const errorText = await response.text();
      console.error('❌ PRESENCE: Error response:', errorText);
      console.log('🔍 PRESENCE EVENT DEBUG: Full error details:', {
        status: response.status,
        statusText: response.statusText,
        errorText: errorText,
        requestBody: requestBody
      });
    }
  } catch (error) {
    console.log('🔍 PRESENCE EVENT DEBUG: Exception details:', {
      message: error.message,
      stack: error.stack,
      requestBody: requestBody
    });
    
    if (error.message.includes('Failed to fetch') || error.message.includes('ERR_CONNECTION_REFUSED')) {
      console.warn(`⚠️ PRESENCE: Connection refused for ${kind} event - server may be overloaded`);
    } else {
      console.error(`❌ PRESENCE: Error sending ${kind} event:`, error);
    }
  }
}

// URL normalization cache and current state
const urlNormalizationCache = new Map();
let currentNormalizedUrl = null;
let currentRawUrl = null;

// Function to update all message avatars with new aura color
function updateAllMessageAvatars(userEmail, auraColor) {
  console.log('🔍 AURA DEBUG: Updating message avatars for user:', userEmail, 'with color:', auraColor);
  
  // Find all message avatars for this user - try multiple selectors
  const messageAvatars = document.querySelectorAll(`
    .message-avatar[data-user-email="${userEmail}"],
    .message-avatar[data-user-id="${userEmail}"],
    .avatar[data-user-email="${userEmail}"],
    .avatar[data-user-id="${userEmail}"],
    .message[data-author-id="${userEmail}"] .message-avatar,
    .message[data-author-id="${userEmail}"] .avatar,
    .message[data-author-id="${userEmail}"] img[src*="googleusercontent.com"]
  `);
  console.log('🔍 AURA DEBUG: Found message avatars:', messageAvatars.length);
  
  // Also try to find avatars in messages by user email
  const allMessages = document.querySelectorAll('.message');
  let foundInMessages = 0;
  
  allMessages.forEach(message => {
    const authorEmail = message.dataset.authorId || message.querySelector('[data-user-email]')?.dataset.userEmail;
    if (authorEmail === userEmail) {
      const avatar = message.querySelector('.message-avatar, .avatar');
      if (avatar) {
        foundInMessages++;
        console.log('🔍 AURA DEBUG: Found avatar in message:', avatar);
        updateAvatarAura(avatar, auraColor);
      }
    }
  });
  
  console.log('🔍 AURA DEBUG: Found avatars in messages:', foundInMessages);
  
  messageAvatars.forEach(avatar => {
    console.log('🔍 AURA DEBUG: Updating message avatar:', avatar);
    updateAvatarAura(avatar, auraColor);
  });
}

// Helper function to update a single avatar's aura
function updateAvatarAura(avatar, auraColor) {
  // Update the aura color in the avatar's data attribute
  avatar.setAttribute('data-aura-color', auraColor);
  
  // Update the avatar's aura visual effect
  const auraElement = avatar.querySelector('.aura-effect');
  if (auraElement) {
    auraElement.style.boxShadow = `0 0 10px 3px ${auraColor}`;
  } else {
    // Create aura effect if it doesn't exist
    const aura = document.createElement('div');
    aura.className = 'aura-effect';
    aura.style.cssText = `
      position: absolute;
      top: -3px;
      left: -3px;
      right: -3px;
      bottom: -3px;
      border-radius: 50%;
      box-shadow: 0 0 10px 3px ${auraColor};
      pointer-events: none;
      z-index: -1;
    `;
    avatar.style.position = 'relative';
    avatar.appendChild(aura);
  }
}

// Function to update all visibility avatars with new aura color
function updateAllVisibilityAvatars(userEmail, auraColor) {
  console.log('🔍 AURA DEBUG: Updating visibility avatars for user:', userEmail, 'with color:', auraColor);
  
  // Find all visibility avatars for this user - try multiple selectors
  const visibilityAvatars = document.querySelectorAll(`
    .avatar[data-user-email="${userEmail}"],
    .user-avatar[data-user-email="${userEmail}"],
    .avatar[data-user-id="${userEmail}"],
    .user-avatar[data-user-id="${userEmail}"]
  `);
  console.log('🔍 AURA DEBUG: Found visibility avatars:', visibilityAvatars.length);
  
  // Also try to find avatars in visibility containers
  const visibilityContainers = document.querySelectorAll('.visibility-container, .avatars-container, #canopi-visible');
  let foundInVisibility = 0;
  
  visibilityContainers.forEach(container => {
    const avatars = container.querySelectorAll('.avatar, .user-avatar');
    avatars.forEach(avatar => {
      const avatarEmail = avatar.dataset.userEmail || avatar.dataset.userId;
      if (avatarEmail === userEmail) {
        foundInVisibility++;
        console.log('🔍 AURA DEBUG: Found avatar in visibility container:', avatar);
        updateAvatarAura(avatar, auraColor);
      }
    });
  });
  
  console.log('🔍 AURA DEBUG: Found avatars in visibility containers:', foundInVisibility);
  
  visibilityAvatars.forEach(avatar => {
    console.log('🔍 AURA DEBUG: Updating visibility avatar:', avatar);
    updateAvatarAura(avatar, auraColor);
  });
}

// Add cache invalidation function to prevent stale data
function clearUrlNormalizationCache() {
  console.log('🧹 URL_CACHE: Clearing URL normalization cache');
  urlNormalizationCache.clear();
  currentNormalizedUrl = null;
  currentRawUrl = null;
  currentPageId = null;
}

// Clear cache on extension startup to prevent stale data
clearUrlNormalizationCache();

// Track last loaded URI to prevent unnecessary reloads
let lastLoadedUri = null;

// Global storage for current chat data (for avatar updates)
window.currentChatData = [];

// REMOVED: Message polling code (replaced with Supabase real-time)
// All messages now received via supabaseRealtimeClient.onNewMessage
// No polling intervals - messages arrive instantly via WebSocket subscriptions

// Centralized URL normalization - call this once at startup and when tabs change
async function normalizeCurrentUrl() {
  try {
    const rawUri = await getCurrentPageUri();
    Logger.debug(`URL_NORMALIZE: Normalizing current URL: ${rawUri}`, null, 'general');
    
    // CRITICAL FIX: Cache busting - detect if pageId uses triple underscores (old bug)
    // If it does, invalidate the cache and force re-normalization from backend
    const hasBadCache = currentPageId && currentPageId.includes('___');
    if (hasBadCache) {
      console.error(`❌ CACHE_BUG_DETECTED: Found triple underscores in cached pageId: ${currentPageId}`);
      console.error(`❌ CACHE_BUG_DETECTED: Invalidating cache and forcing backend re-normalization...`);
      currentRawUrl = null;
      currentNormalizedUrl = null;
      currentPageId = null;
      urlNormalizationCache.delete(rawUri);
    }
    
    // Check if URL has changed
    if (currentRawUrl === rawUri && currentNormalizedUrl && currentPageId && !hasBadCache) {
      Logger.debug(`URL_NORMALIZE: URL unchanged, using cached values`, null, 'general');
      Logger.debug(`URL_NORMALIZE: Cached urlData:`, JSON.stringify({ rawUrl: currentRawUrl, normalizedUrl: currentNormalizedUrl, pageId: currentPageId }), 'general');
      return { rawUrl: currentRawUrl, normalizedUrl: currentNormalizedUrl, pageId: currentPageId };
    }
    
    // Check cache first
    if (urlNormalizationCache.has(rawUri) && !hasBadCache) {
      const cached = urlNormalizationCache.get(rawUri);
      
      // CRITICAL FIX: Validate cached pageId doesn't have triple underscores
      if (cached.pageId && cached.pageId.includes('___')) {
        console.error(`❌ CACHE_BUG_DETECTED: Cached pageId has triple underscores: ${cached.pageId}`);
        console.error(`❌ CACHE_BUG_DETECTED: Invalidating this cache entry...`);
        urlNormalizationCache.delete(rawUri);
        // Fall through to backend API call
      } else {
        Logger.debug(`URL_CACHE: Using cached result for ${rawUri}: ${cached.pageId}`, null, 'general');
        currentRawUrl = rawUri;
        currentNormalizedUrl = cached.normalizedUrl;
        currentPageId = cached.pageId;
        Logger.debug(`URL_CACHE: Cache urlData:`, JSON.stringify({ rawUrl: currentRawUrl, normalizedUrl: currentNormalizedUrl, pageId: currentPageId }), 'general');
        return { rawUrl: currentRawUrl, normalizedUrl: currentNormalizedUrl, pageId: currentPageId };
      }
    }
    
    Logger.debug(`URL_NORMALIZE: Calling backend API for ${rawUri}`, null, 'general');
    
    // Call backend normalization API
    const response = await fetch(`${METALAYER_API_URL}/v1/presence/normalize-url`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ url: rawUri })
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const result = await response.json();
    
    // Cache the result
    urlNormalizationCache.set(rawUri, result);
    
    // Update current state
    currentRawUrl = rawUri;
    currentNormalizedUrl = result.normalizedUrl;
    currentPageId = result.pageId;
    
    Logger.success(`URL_NORMALIZE: Backend API result - Raw: ${rawUri}, Normalized: ${currentNormalizedUrl}, PageId: ${currentPageId}`, null, 'general');
    Logger.debug(`URL_NORMALIZE: Returning urlData:`, JSON.stringify({ rawUrl: currentRawUrl, normalizedUrl: currentNormalizedUrl, pageId: currentPageId }), 'general');
    return { rawUrl: currentRawUrl, normalizedUrl: currentNormalizedUrl, pageId: currentPageId };
  } catch (error) {
    console.error('❌ URL_NORMALIZE: Error calling backend API:', error);
    
    // Fallback to simple normalization
    const rawUri = await getCurrentPageUri();
    // CRITICAL FIX: Collapse multiple underscores to match backend logic
    const fallbackPageId = rawUri
      .replace(/[^a-zA-Z0-9]/g, '_')  // Replace non-alphanumeric with _
      .replace(/_+/g, '_')             // Collapse multiple _ into single _
      .substring(0, 100);
    
    // Update current state
    currentRawUrl = rawUri;
    currentNormalizedUrl = rawUri; // Use raw URL as normalized in fallback
    currentPageId = fallbackPageId;
    
    Logger.debug(`URL_NORMALIZE: Using fallback for ${rawUri}: ${fallbackPageId}`, null, 'general');
    Logger.debug(`URL_NORMALIZE: Fallback urlData:`, JSON.stringify({ rawUrl: currentRawUrl, normalizedUrl: currentNormalizedUrl, pageId: currentPageId }), 'general');
    return { rawUrl: currentRawUrl, normalizedUrl: currentNormalizedUrl, pageId: currentPageId };
  }
}

// Expose normalizeCurrentUrl globally for diagnostic tools
window.normalizeUrl = async function(url) {
  // Temporarily store the URL to normalize
  const originalGetter = getCurrentPageUri;
  getCurrentPageUri = async () => url;
  
  try {
    const result = await normalizeCurrentUrl();
    return result;
  } finally {
    getCurrentPageUri = originalGetter;
  }
};

// Legacy function for backward compatibility - now uses centralized normalization
async function generatePageId(uri) {
  const urlData = await normalizeCurrentUrl();
  return urlData.pageId;
}

// Get current user ID for presence tracking
async function getCurrentUserId() {
  try {
    // Use window.currentUser from direct authentication
    const user = window.currentUser;
    if (user && user.id) {
      return user.id; // Use the actual user ID
    } else {
      // Fallback to email if no ID is stored
      const email = await getCurrentUserEmail();
      return email;
    }
  } catch (error) {
    console.error('Error getting user ID:', error);
    // Fallback to email
    const email = await getCurrentUserEmail();
    return email;
  }
}

// Get current user email for presence tracking
async function getCurrentUserEmail() {
  try {
    // FIRST: Try real Google auth for actual profile pictures
    if (realGoogleAuth) {
      const user = await realGoogleAuth.getCurrentUser();
      console.log('[AUTH] Real Google Auth returned user:', user);
      
      if (user && user.email) {
        console.log('[AUTH] Found authenticated user with REAL profile picture:', user.email);
        console.log('[AUTH] Real avatar URL:', user.user_metadata?.avatar_url);
        return user.email;
      }
    }
    
    // SECOND: Fallback to AuthManager
    const user = await authManager.getCurrentUser();
    console.log('[AUTH] AuthManager returned user:', user);
    
    if (user && user.email) {
      console.log('[AUTH] Found authenticated user (fallback):', user.email);
      return user.email;
    }
    
    console.error('[AUTH] No authenticated user found via any method');
    
    // Show authentication prompt for proper OAuth flow
    console.log('[AUTH] No user found, showing authentication prompt...');
    showAuthPrompt('access presence features');
    
    // Return null instead of throwing error to allow graceful handling
    return null;
  } catch (error) {
    console.error('[AUTH] Error getting current user:', error.message);
    throw new Error('User not authenticated');
  }
}

// Duplicate function removed - using the one above

// DIAGNOSTIC FUNCTIONS - Run in browser console for debugging
window.debugAvatar = function() {
  Logger.info("=== AVATAR DIAGNOSTIC ===", null, 'general');
  Logger.info("Current user:", window.currentUser, 'general');
  Logger.info("User avatar_url:", window.currentUser?.user_metadata?.avatar_url, 'general');
  Logger.info("Profile avatar container:", document.getElementById("user-avatar-container"), 'general');
  Logger.info("Profile avatar HTML:", document.getElementById("user-avatar-container")?.innerHTML, 'general');
  Logger.info("AuthManager user:", authManager.getCurrentUser(), 'general');
};

window.debugVisibility = function() {
  Logger.info("=== VISIBILITY DIAGNOSTIC ===", null, 'general');
  Logger.info("Current visibility data:", window.currentVisibilityData, 'general');
  Logger.info("Visibility timer:", window.visibilityUpdateTimer, 'general');
  Logger.info("User elements:", document.querySelectorAll(".user-item"), 'general');
  Logger.info("Status elements:", document.querySelectorAll(".user-status"), 'general');
  Logger.info("Status texts:", Array.from(document.querySelectorAll(".user-status")).map(el => el.textContent), 'general');
};

window.testTimeUpdate = function() {
  Logger.info("=== MANUAL TIME UPDATE TEST ===", null, 'general');
  updateVisibilityTimes();
  Logger.info("Time update triggered manually", null, 'general');
};

window.forceAvatarRefresh = function() {
  Logger.info("=== FORCE AVATAR REFRESH ===", null, 'general');
  const user = window.currentUser;
  if (user) {
    updateUI(user);
    Logger.info("Avatar refresh triggered", null, 'general');
  } else {
    Logger.info("No current user found", null, 'general');
  }
};

window.restartVisibilityTimer = function() {
  Logger.info("=== RESTART VISIBILITY TIMER ===", null, 'general');
  if (window.visibilityUpdateTimer) {
    clearInterval(window.visibilityUpdateTimer);
  }
  // NO POLLING - Use Supabase real-time instead
  Logger.info("Timer restarted", null, 'general');
};

// Update visibility times for all visible users
function updateVisibilityTimes() {
  console.log('🔄 VISIBILITY: === STARTING TIME UPDATE ===');
  console.log('🔄 VISIBILITY: Current data:', window.currentVisibilityData);
  
  if (!window.currentVisibilityData || !window.currentVisibilityData.active) {
    console.log('🔄 VISIBILITY: No visibility data available for time update');
    return;
  }
  
  const visibleUsers = window.currentVisibilityData.active;
  Logger.debug(`VISIBILITY: Updating times for ${visibleUsers.length} users`, null, 'general');
  console.log('🔄 VISIBILITY: Visible users:', visibleUsers.map(u => ({ name: u.name, enterTime: u.enterTime })));
  
  // Find all user status elements in the DOM and update their times
  const userElements = document.querySelectorAll('.user-item');
  console.log('🔄 VISIBILITY: Found', userElements.length, 'user elements in DOM');
  
  userElements.forEach((element, index) => {
    Logger.debug(`VISIBILITY: Processing element ${index}:`, element, 'general');
    
    // CRITICAL FIX: Use data-user-id to find the correct user, NOT array index!
    // Array index doesn't work because window.currentVisibilityData.active includes ALL users
    // but the DOM only shows FILTERED users (excluding current user)
    const userId = element.getAttribute('data-user-id');
    const userName = element.getAttribute('data-user-name');
    Logger.debug(`VISIBILITY: Element ${index} - userId: ${userId}, userName: ${userName}`, null, 'general');
    
    // Find the matching user in the visibility data by userId
    const user = visibleUsers.find(u => u.userId === userId || u.email === userId || u.id === userId);
    
    if (!user) {
      Logger.warn(`🔄 VISIBILITY: Could not find user data for userId: ${userId}`, null, 'general');
      return;
    }
    
    Logger.debug(`VISIBILITY: Found matching user:`, { name: user.name, enterTime: user.enterTime, userId: user.userId }, 'general');
    
    // FIX: Visibility avatars use .item-status NOT .user-status!
    const statusElement = element.querySelector('.item-status');
    Logger.debug(`VISIBILITY: Status element for ${userName}:`, statusElement, 'general');
    
    if (statusElement && user.enterTime) {
      const oldText = statusElement.textContent;
      const newStatusText = formatTimeDisplay(user.enterTime);
      statusElement.textContent = newStatusText;
      Logger.success(`🔄 VISIBILITY: Updated time for ${user.name}: "${oldText}" → "${newStatusText}"`, null, 'general');
    } else {
      Logger.warn(`🔄 VISIBILITY: Skipping user ${user.name} - no status element (${!!statusElement}) or enterTime (${!!user.enterTime})`, null, 'general');
    }
  });
  
  console.log('🔄 VISIBILITY: === TIME UPDATE COMPLETE ===');
}

// Format time display for visibility list - calculates time since enterTime
function formatTimeDisplay(enterTime) {
  // REDUCED LOGGING - Only log when time changes categories (Now -> minutes -> hours -> days)
  const now = new Date();
  
  if (!enterTime) {
    return 'Now';
  }
  
  const enterTimeDate = new Date(enterTime);
  const diffMs = now - enterTimeDate;
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);
  
  // Log time calculations for debugging
  const timeInfo = {
    enterTime: enterTime,
    now: now.toISOString(),
    enterTimeDate: enterTimeDate.toISOString(),
    diffSeconds: diffSeconds,
    diffMinutes: diffMinutes,
    diffHours: diffHours,
    diffDays: diffDays
  };
  
  // Only log if seconds > 55 (approaching minute threshold) or if already in minutes/hours/days
  if (diffSeconds > 55 || diffMinutes > 0) {
    console.log('🕒 TIME_CALC:', timeInfo);
  }
  
  // If the difference is negative, it means the timestamp is in the future
  if (diffMs < 0) {
    console.log('🕒 TIME_DEBUG: Negative time difference detected - enterTime is in the future!');
    return 'Now';
  }
  
  // User requirements: 
  // a) If user is still on tab, show "Now" for under 60 seconds, then minutes, hours, days
  // b) If user has left tab, show "Last seen X minutes ago"
  // c) After 1 month threshold, don't show last seen
  // d) If someone leaves and comes back, reset ENTER and null EXIT
  
  if (diffSeconds < 60) {
    return 'Now'; // Don't show seconds, show "Now"
  } else if (diffMinutes < 60) {
    return `Online for ${diffMinutes} minute${diffMinutes === 1 ? '' : 's'}`;
  } else if (diffHours < 24) {
    return `Online for ${diffHours} hour${diffHours === 1 ? '' : 's'}`;
  } else if (diffDays < 30) { // 1 month threshold
    return `Online for ${diffDays} day${diffDays === 1 ? '' : 's'}`;
  } else {
    return 'Last seen over a month ago'; // Don't show after 1 month
  }
}

function formatLastSeenDisplay(lastSeen) {
  if (!lastSeen) return 'Last seen unknown';
  
  const now = new Date();
  const lastSeenDate = new Date(lastSeen);
  const diffMs = now - lastSeenDate;
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);
  
  // If the difference is negative, it means the timestamp is in the future
  if (diffMs < 0) {
    return 'Last seen just now';
  }
  
  if (diffSeconds < 60) {
    return `Last seen ${diffSeconds} second${diffSeconds === 1 ? '' : 's'} ago`;
  } else if (diffMinutes < 60) {
    return `Last seen ${diffMinutes} minute${diffMinutes === 1 ? '' : 's'} ago`;
  } else if (diffHours < 24) {
    return `Last seen ${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;
  } else {
    return `Last seen ${diffDays} day${diffDays === 1 ? '' : 's'} ago`;
  }
}

// ===== AGENT FUNCTIONALITY =====
// Agent tab functionality for AI-powered page analysis


let pageContentCache = null;
let contentHash = null;
let cachedChunks = [];

// --- Agent Functions ---
async function testAgent(message) {
  Logger.info("🤖 testAgent called with message:", message, 'general');
  if (!message.trim()) return;
  
  // Add user message to output
  addMessageToAgentOutput('You', message, true);
  
  // Show loading
  const loadingId = addMessageToAgentOutput('Agent', 'Thinking...', false, true);
  Logger.info("🤖 Loading message added with ID:", loadingId, 'general');
  
  try {
    // Check if we have page content, if not try to load it
    if (!pageContentCache) {
      await loadPageContent();
      
      // Wait a bit for content to load
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    // Debug: Log page content cache
    console.log('🔍 Page content cache:', pageContentCache);
    console.log('🔍 Is YouTube:', pageContentCache?.isYouTube);
    console.log('🔍 Video data:', pageContentCache?.videoData);
    console.log('🔍 Current URL:', window.location.href);
    console.log('🔍 Page title:', document.title);
    
    // Check if this is a YouTube video and handle accordingly
    if (pageContentCache && pageContentCache.isYouTube && pageContentCache.videoData) {
      console.log('🎥 Processing YouTube video request...');
      const response = await handleYouTubeVideoRequest(message, pageContentCache.videoData);
      removeLoadingMessage(loadingId);
      addMessageToAgentOutput('Agent', response, false);
    } else {
      // Fallback: Check if we're on a YouTube page even if content script didn't detect it
      const isYouTubeFallback = window.location.hostname.includes('youtube.com') && window.location.pathname.includes('/watch');
      if (isYouTubeFallback) {
        console.log('🎥 YouTube fallback detection - processing as YouTube video...');
        const videoId = new URLSearchParams(window.location.search).get('v');
        if (videoId) {
          const fallbackVideoData = {
            videoId: videoId,
            title: document.title.replace(' - YouTube', ''),
            description: 'YouTube video',
            channel: { name: 'YouTube' },
            duration: 'Unknown',
            views: 'Unknown',
            likes: 'Unknown',
            publishedDate: 'Unknown',
            tags: []
          };
          const response = await handleYouTubeVideoRequest(message, fallbackVideoData);
          removeLoadingMessage(loadingId);
          addMessageToAgentOutput('Agent', response, false);
          return;
        }
      }
      
      console.log('📄 Processing regular page content...');
      // Regular page content processing
      const response = await callDeepSeekAPI(message);
      removeLoadingMessage(loadingId);
      addMessageToAgentOutput('Agent', response, false);
    }
  } catch (error) {
    removeLoadingMessage(loadingId);
    addMessageToAgentOutput('Agent', `Error: ${error.message}`, false);
  }
}

// Handle YouTube video requests
async function handleYouTubeVideoRequest(message, videoData) {
  try {
    console.log('🎥 Processing YouTube video:', videoData.title);
    
    // First, try to get transcript and process the video
    const processedVideo = await youtubeService.processYouTubeVideo(videoData);
    
    // Create context for AI with video information
    const context = {
      videoTitle: videoData.title,
      videoDescription: videoData.description,
      channelName: videoData.channel?.name,
      duration: videoData.duration,
      views: videoData.views,
      transcript: processedVideo.transcript,
      summary: processedVideo.summary,
      keyPoints: processedVideo.keyPoints,
      questions: processedVideo.questions,
      userQuestion: message,
      timestamp: new Date().toISOString()
    };

    // Debug: Log what we're sending to the AI
    console.log('🤖 Sending to AI agent:', {
      message: message,
      context: context,
      type: 'youtube_analysis',
      hasTranscript: !!context.transcript,
      transcriptLength: context.transcript?.length || 0
    });
    
    // Send to AI agent with YouTube context
    const response = await fetch(AGENT_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message: message,
        context: context,
        type: 'youtube_analysis',
        videoData: videoData
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `API error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    return data.response;
  } catch (error) {
    console.error('❌ Error processing YouTube video:', error);
    
    // Fallback response if transcription fails
    return `I detected this is a YouTube video: "${videoData.title}" by ${videoData.channel?.name || 'Unknown Channel'}.

However, I'm having trouble accessing the video transcript at the moment. This could be because:
- The video doesn't have captions available
- The transcription service is temporarily unavailable
- The video is private or restricted

You can still ask me general questions about the video based on the title and description, or try refreshing the page and asking again.`;
  }
}

async function callDeepSeekAPI(userMessage) {
  Logger.info("🤖 callDeepSeekAPI called with message:", userMessage, 'general');
  // Find relevant content chunks using RAG
  const relevantChunks = findRelevantChunks(userMessage);
  Logger.info("🤖 Found relevant chunks:", relevantChunks.length, 'general');
  
  // Prepare context for the AI
  const context = {
    pageTitle: pageContentCache?.title || 'Current Page',
    pageUrl: pageContentCache?.url || '',
    relevantContent: relevantChunks,
    userQuestion: userMessage,
    timestamp: new Date().toISOString()
  };
  
  // If no page content is available, provide a helpful message
  if (!pageContentCache) {
    return `I'm unable to access the current page content to determine what it's about. The system indicates that no page content is available for me to analyze.

You might want to:
- Refresh the page to see if content loads
- Check if there are any loading errors
- Navigate to a different page
- Or you could tell me what page you're viewing and I can try to help based on that information

Is there a specific topic or question I can assist you with directly?`;
  }
  
  // Create a limited version of page content to avoid payload size issues
  const limitedPageContent = {
    title: pageContentCache.title,
    url: pageContentCache.url,
    content: {
      full: limitContentSize(pageContentCache.content.full, 2000),
      chunks: pageContentCache.content.chunks.slice(0, 3) // Only send top 3 chunks
    },
    metadata: pageContentCache.metadata
  };

  Logger.info("🤖 Making fetch request to:", AGENT_API_URL, 'general');
  Logger.info("🤖 Request payload:", {
    message: userMessage,
    context: context,
    pageContent: limitedPageContent
  }, 'general');
  
  const response = await fetch(AGENT_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      message: userMessage,
      context: context,
      pageContent: limitedPageContent
    })
  });
  
  Logger.info("🤖 API response status:", response.status, response.statusText, 'general');
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `API error: ${response.status} ${response.statusText}`);
  }
  
  const data = await response.json();
  return data.response;
}

function findRelevantChunks(userMessage) {
  if (!cachedChunks || cachedChunks.length === 0) {
    return [];
  }
  
  // Simple keyword-based relevance scoring
  const messageWords = userMessage.toLowerCase().split(/\s+/);
  const relevantChunks = [];
  
  cachedChunks.forEach((chunk, index) => {
    const chunkText = chunk.toLowerCase();
    let relevanceScore = 0;
    
    // Count keyword matches
    messageWords.forEach(word => {
      if (word.length > 2) { // Ignore short words
        const matches = (chunkText.match(new RegExp(word, 'g')) || []).length;
        relevanceScore += matches;
      }
    });
    
    // Boost score for chunks with question words
    const questionWords = ['what', 'how', 'why', 'when', 'where', 'who'];
    questionWords.forEach(qWord => {
      if (chunkText.includes(qWord) && messageWords.includes(qWord)) {
        relevanceScore += 2;
      }
    });
    
    if (relevanceScore > 0) {
      relevantChunks.push({
        chunk: chunk,
        score: relevanceScore,
        index: index
      });
    }
  });
  
  // Sort by relevance score and return top 3-5 chunks
  return relevantChunks
    .sort((a, b) => b.score - a.score)
    .slice(0, 5)
    .map(item => item.chunk);
}

// Helper function to limit content size for API calls
function limitContentSize(content, maxLength = 2000) {
  if (!content) return '';
  if (content.length <= maxLength) return content;
  return content.substring(0, maxLength) + '...';
}

function addMessageToAgentOutput(sender, message, isUser = false, isLoading = false) {
  const agentOutput = document.getElementById('agent-output');
  if (!agentOutput) return null;
  
  const messageDiv = document.createElement('div');
  messageDiv.className = `agent-message ${isUser ? 'user-message' : ''}`;
  
  if (isLoading) {
    messageDiv.className += ' agent-loading';
    messageDiv.id = 'loading-' + Date.now();
  }
  
  const timestamp = new Date().toLocaleTimeString();
  
  messageDiv.innerHTML = `
    <div class="message-header">
      <span class="sender">${sender}</span>
      <span class="timestamp">${timestamp}</span>
      </div>
    <div class="message-content">${formatMarkdown(message)}</div>
  `;
  
  agentOutput.appendChild(messageDiv);
  agentOutput.scrollTop = agentOutput.scrollHeight;
  
  return messageDiv.id;
}

function removeLoadingMessage(loadingId) {
  if (loadingId) {
    const loadingElement = document.getElementById(loadingId);
    if (loadingElement) {
      loadingElement.remove();
    }
  }
}

function formatMarkdown(text) {
  return text
    .replace(/### (.*$)/gim, '<h3>$1</h3>')
    .replace(/## (.*$)/gim, '<h2>$1</h2>')
    .replace(/# (.*$)/gim, '<h1>$1</h1>')
    .replace(/\*\*(.*)\*\*/gim, '<strong>$1</strong>')
    .replace(/\*(.*)\*/gim, '<em>$1</em>')
    .replace(/\n/gim, '<br>');
}

async function loadPageContent() {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    console.log('Loading page content for tab:', tab?.url);
    
    if (tab && tab.url && !tab.url.startsWith('chrome://') && !tab.url.startsWith('chrome-extension://')) {
      // Try to inject content script if it's not already loaded
      try {
        await chrome.scripting.executeScript({
          target: { tabId: tab.id },
          files: ['content.js']
        });
        console.log('Content script injected successfully');
      } catch (injectError) {
        console.log('Content script injection failed (may already be loaded):', injectError.message);
      }
      
      // Wait a bit for content script to load
      setTimeout(() => {
        chrome.tabs.sendMessage(tab.id, { action: 'extractPageContent' }, (response) => {
          if (chrome.runtime.lastError) {
            console.log('Error getting page content:', chrome.runtime.lastError);
            // Set a fallback page content for pages where content script can't run
            setFallbackPageContent(tab);
            return;
          }
          
          if (response && response.content) {
            console.log('Page content loaded successfully:', response.content.title);
            // Check if content has changed (different hash)
            const newHash = response.content.contentHash;
            if (contentHash !== newHash) {
              contentHash = newHash;
              pageContentCache = response.content;
              cachedChunks = response.content.content.chunks || [];
              
              // Update agent welcome message with page info
              updateAgentWelcomeWithPageInfo(response.content);
            }
          } else {
            console.log('No content received, using fallback');
            setFallbackPageContent(tab);
          }
        });
      }, 500);
    } else {
      // For chrome:// pages or extension pages, set fallback content
      console.log('Using fallback content for:', tab?.url);
      setFallbackPageContent(tab);
    }
  } catch (error) {
    console.log('Error loading page content:', error);
    setFallbackPageContent(null);
  }
}

function setFallbackPageContent(tab) {
  const fallbackContent = {
    title: tab ? tab.title : 'Current Page',
    url: tab ? tab.url : 'unknown',
    content: {
      full: tab ? `This page is titled "${tab.title}" and is located at ${tab.url}. The page content is not available for detailed analysis, but I can still help you with general questions about the page or assist with other topics.` : 'Page content is not available for analysis.',
      chunks: tab ? [`Page title: ${tab.title}`, `Page URL: ${tab.url}`, 'Content analysis limited'] : ['Page content not available']
    },
    metadata: {
      description: 'Page content analysis is limited'
    },
    contentHash: 'fallback-' + Date.now()
  };
  
  pageContentCache = fallbackContent;
  cachedChunks = fallbackContent.content.chunks;
  
  // Update agent welcome message
  updateAgentWelcomeWithPageInfo(fallbackContent);
}

function updateAgentWelcomeWithPageInfo(pageData) {
  const agentOutput = document.getElementById('agent-output');
  if (!agentOutput) return;
  
  // Update welcome message with page-specific info
  const welcomeElement = agentOutput.querySelector('.agent-welcome');
  if (welcomeElement) {
    const isFallback = pageData.contentHash && pageData.contentHash.startsWith('fallback-');
    const isYouTube = pageData.isYouTube && pageData.videoData;
    
    if (isYouTube) {
      // YouTube-specific welcome message
      welcomeElement.innerHTML = `
        <h4>🎥 YouTube Video Detected!</h4>
        <p>I can analyze this YouTube video and provide summaries, key points, and answer questions about its content.</p>
        <div class="youtube-info">
          <strong>📺 ${pageData.videoData.title}</strong>
          <p><strong>Channel:</strong> ${pageData.videoData.channel?.name || 'Unknown'}</p>
          <p><strong>Duration:</strong> ${pageData.videoData.duration || 'Unknown'}</p>
          <p><strong>Views:</strong> ${pageData.videoData.views || 'Unknown'}</p>
        </div>
        <div class="agent-suggestions">
          <button class="suggestion-btn youtube-btn" data-question="Summarize this video">📝 Summarize this video</button>
          <button class="suggestion-btn youtube-btn" data-question="What are the key points in this video?">🔑 Key points</button>
          <button class="suggestion-btn youtube-btn" data-question="What questions should I ask about this video?">❓ Generate questions</button>
          <button class="suggestion-btn youtube-btn" data-question="Explain the main concepts in this video">💡 Main concepts</button>
          <button class="suggestion-btn youtube-btn" data-question="What is this video about?">🎯 What's this about?</button>
        </div>
      `;
    } else {
      // Regular page welcome message
      welcomeElement.innerHTML = `
        <h4>🤖 AI Agent Ready</h4>
        <p>I can help you understand and discuss the content on this page. Ask me anything!</p>
        <div class="page-info">
          <strong>📄 ${pageData.title}</strong>
          <p>${pageData.content.full.substring(0, 200)}...</p>
          ${isFallback ? '<p style="color: #ffc107; font-size: 0.9em;">⚠️ Page content analysis is limited on this page.</p>' : ''}
        </div>
        <div class="agent-suggestions">
          <button class="suggestion-btn" data-question="What is this page about?">What is this page about?</button>
          <button class="suggestion-btn" data-question="Summarize the main points">Summarize the main points</button>
          <button class="suggestion-btn" data-question="What are the key takeaways?">What are the key takeaways?</button>
          <button class="suggestion-btn" data-question="Explain this in simple terms">Explain this in simple terms</button>
          <button class="suggestion-btn" data-question="What questions should I ask about this?">What questions should I ask?</button>
        </div>
      `;
    }
    
    // Re-add event listeners to suggestion buttons
    const suggestionButtons = agentOutput.querySelectorAll('.suggestion-btn');
    suggestionButtons.forEach(button => {
      button.addEventListener('click', () => {
        const question = button.getAttribute('data-question');
        Logger.info("Suggestion button clicked:", question, 'general');
        testAgent(question);
      });
    });
  }
}

function initializeAgentTab() {
  Logger.info("=== INITIALIZING AGENT TAB ===", null, 'general');
  Logger.debug("Current URL:", window.location.href, 'general');
  Logger.debug("Document ready state:", document.readyState, 'general');
  
  // Load page content for the agent
  Logger.info("📄 Loading page content...", null, 'general');
  loadPageContent();
  
  // Get agent element references
  Logger.debug("Getting agent element references...", null, 'general');
  const agentInput = document.getElementById('agent-input');
  const agentSendButton = document.getElementById('agent-send-btn');
  const agentOutput = document.getElementById('agent-output');
  const agentClearButton = document.getElementById('agent-clear-btn');
  const agentRefreshButton = document.getElementById('agent-refresh-btn');
  
  Logger.debug("Agent elements found:", {
    agentInput: !!agentInput,
    agentSendButton: !!agentSendButton,
    agentOutput: !!agentOutput,
    agentClearButton: !!agentClearButton,
    agentRefreshButton: !!agentRefreshButton
  }, 'general');
  
  // Check if elements exist
  if (!agentInput) console.error("❌ agent-input element not found!");
  if (!agentSendButton) console.error("❌ agent-send-btn element not found!");
  if (!agentOutput) console.error("❌ agent-output element not found!");
  if (!agentClearButton) console.error("❌ agent-clear-btn element not found!");
  if (!agentRefreshButton) console.error("❌ agent-refresh-btn element not found!");
  
  // Initialize agent output if not already done
  if (agentOutput && !agentOutput.querySelector('.agent-welcome')) {
    Logger.info("Setting up agent output...", null, 'general');
    agentOutput.innerHTML = `
      <div class="agent-welcome">
        <h4>🤖 AI Agent Ready</h4>
        <p>I can help you understand and discuss the content on this page. Ask me anything!</p>
        <div class="agent-suggestions">
          <button class="suggestion-btn" data-question="What is this page about?">What is this page about?</button>
          <button class="suggestion-btn" data-question="Summarize the main points">Summarize the main points</button>
          <button class="suggestion-btn" data-question="What are the key takeaways?">What are the key takeaways?</button>
          <button class="suggestion-btn" data-question="Explain this in simple terms">Explain this in simple terms</button>
          <button class="suggestion-btn" data-question="What questions should I ask about this?">What questions should I ask?</button>
              </div>
    </div>
  `;
  
    // Add event listeners to suggestion buttons
    const suggestionButtons = agentOutput.querySelectorAll('.suggestion-btn');
    suggestionButtons.forEach(button => {
      button.addEventListener('click', () => {
        const question = button.getAttribute('data-question');
        Logger.info("Suggestion button clicked:", question, 'general');
        testAgent(question);
    });
  });
    Logger.info("Agent welcome message set up!", null, 'general');
  }
  
  // Set up send button if not already done
  if (agentSendButton && !agentSendButton.hasAttribute('data-initialized')) {
    Logger.info("🔘 Setting up send button...", null, 'general');
    agentSendButton.addEventListener('click', () => {
      console.log('🔘 Send button clicked!');
      const message = agentInput.value.trim();
      if (message) {
        console.log('📤 Sending message:', message);
        testAgent(message);
        agentInput.value = '';
      } else {
        console.log('⚠️ No message to send');
      }
    });
    agentSendButton.setAttribute('data-initialized', 'true');
    Logger.success("Send button event listener attached", null, 'general');
  } else if (agentSendButton) {
    Logger.info("ℹ️ Send button already initialized", null, 'general');
  }
  
  // Set up input field if not already done
  if (agentInput && !agentInput.hasAttribute('data-initialized')) {
    agentInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        const message = agentInput.value.trim();
        if (message) {
          testAgent(message);
          agentInput.value = '';
        }
      }
    });
    agentInput.setAttribute('data-initialized', 'true');
  }
  
  // Set up Clear button
  if (agentClearButton && !agentClearButton.hasAttribute('data-initialized')) {
    agentClearButton.addEventListener('click', () => {
      console.log('Clear button clicked!');
      if (agentOutput) {
        agentOutput.innerHTML = `
          <div class="agent-welcome">
            <h4>🤖 AI Agent Ready</h4>
            <p>I can help you understand and discuss the content on this page. Ask me anything!</p>
            <div class="agent-suggestions">
              <button class="suggestion-btn" data-question="What is this page about?">What is this page about?</button>
              <button class="suggestion-btn" data-question="Summarize the main points">Summarize the main points</button>
              <button class="suggestion-btn" data-question="What are the key takeaways?">What are the key takeaways?</button>
              <button class="suggestion-btn" data-question="Explain this in simple terms">Explain this in simple terms</button>
              <button class="suggestion-btn" data-question="What questions should I ask about this?">What questions should I ask?</button>
              </div>
    </div>
  `;
  
        // Re-add event listeners to suggestion buttons
        const suggestionButtons = agentOutput.querySelectorAll('.suggestion-btn');
        suggestionButtons.forEach(button => {
          button.addEventListener('click', () => {
            const question = button.getAttribute('data-question');
            testAgent(question);
    });
    });
    agentClearButton.setAttribute('data-initialized', 'true');
  }
  
  // Set up Refresh button
  if (agentRefreshButton && !agentRefreshButton.hasAttribute('data-initialized')) {
    agentRefreshButton.addEventListener('click', () => {
      console.log('Refresh button clicked!');
      // Reload page content
      loadPageContent();
      // Show a brief message
      if (agentOutput) {
        const refreshMessage = document.createElement('div');
        refreshMessage.className = 'agent-message';
        refreshMessage.innerHTML = `
          <div class="message-header">
            <span class="sender">Agent</span>
            <span class="timestamp">${new Date().toLocaleTimeString()}</span>
          </div>
          <div class="message-content">Page content refreshed! I now have the latest information from this page.</div>
        `;
        agentOutput.appendChild(refreshMessage);
        agentOutput.scrollTop = agentOutput.scrollHeight;
      }
    });
    agentRefreshButton.setAttribute('data-initialized', 'true');
  }
  
  // Load page content
  loadPageContent();
  
  console.log('=== AGENT TAB INITIALIZATION COMPLETE ===');
  })
}
}

// Debug function for testing agent functionality
function debugAgentTab() {
  Logger.debug("DEBUG: Agent Tab Status", null, 'general');
  Logger.debug("Current tab:", document.querySelector('.main-nav-tab.active')?.getAttribute('data-tab'), 'general');
  Logger.debug("Agent tab element:", document.getElementById('agent-tab'), 'general');
  Logger.debug("Agent tab visible:", document.getElementById('agent-tab')?.classList.contains('active'), 'general');
  Logger.debug("Agent input:", document.getElementById('agent-input'), 'general');
  Logger.debug("Agent output:", document.getElementById('agent-output'), 'general');
  Logger.debug("Agent send button:", document.getElementById('agent-send-btn'), 'general');
  Logger.debug("YouTube service:", typeof youtubeService, 'general');
  Logger.debug("AGENT_API_URL:", AGENT_API_URL, 'general');
  
  // Test if we can manually initialize
  try {
    Logger.info("🧪 Testing manual initialization...", null, 'general');
    initializeAgentTab();
    Logger.success("Manual initialization successful", null, 'general');
  } catch (error) {
    console.error("❌ Manual initialization failed:", error);
  }
}

// Make debug function globally available
window.debugAgentTab = debugAgentTab;

// Alternative simple debug function
window.debugAgent = function() {
  Logger.debug("Simple Agent Debug:", null, 'general');
  Logger.info("Agent tab element:", document.getElementById('agent-tab'), 'general');
  Logger.info("Agent input:", document.getElementById('agent-input'), 'general');
  Logger.info("Agent output:", document.getElementById('agent-output'), 'general');
  Logger.info("Current active tab:", document.querySelector('.main-nav-tab.active')?.getAttribute('data-tab'), 'general');
  Logger.info("Agent tab visible:", document.getElementById('agent-tab')?.classList.contains('active'), 'general');
  
  // Try to manually switch to agent tab
  const agentTab = document.querySelector('[data-tab="agent-tab"]');
  if (agentTab) {
    Logger.debug("Found agent tab button, clicking...", null, 'general');
    agentTab.click();
  } else {
    console.error("❌ Agent tab button not found!");
  }
};

Logger.info("🔧 Debug functions loaded: debugAgentTab(), debugAgent()", null, 'general');

// Immediate debug function that works even if script isn't fully loaded
window.quickDebug = function() {
  Logger.info("Quick Debug - Agent Tab Status:", null, 'general');
  Logger.info("Document ready:", document.readyState, 'general');
  Logger.info("Agent tab button:", document.querySelector('[data-tab="agent-tab"]'), 'general');
  Logger.info("Agent tab content:", document.getElementById('agent-tab'), 'general');
  Logger.info("Active tab:", document.querySelector('.main-nav-tab.active')?.textContent, 'general');
  
  // Check if we can find the agent tab button and click it
  const agentButton = document.querySelector('[data-tab="agent-tab"]');
  if (agentButton) {
    Logger.success("Agent button found, attempting click...", null, 'general');
    agentButton.click();
  } else {
    console.error("❌ Agent button not found!");
  }
};

// Auto-run quick debug when script loads
setTimeout(() => {
  Logger.info("🔧 Auto-running quick debug...", null, 'general');
  if (typeof window.quickDebug === 'function') {
    window.quickDebug();
  }
}, 1000);

// ===== MOCK DATA FOR TESTING MULTI-USER SCENARIOS =====
// Use these functions in the browser console to test different user perspectives

// NO MOCK USERS - Only real data

// NO MOCK MESSAGES - Only real data

// NO MOCK TESTING - Only real data
