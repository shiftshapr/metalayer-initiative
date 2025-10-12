// Meta-Layer Initiative API Configuration - MODERNIZED
// Use environment-based configuration instead of hardcoded URLs
// MODERN CONFIGURATION: Use environment-based configuration
// MODERN CONFIGURATION: Fully environment-based, no hardcoded fallbacks

// Real Google auth will be loaded via script tag in HTML
const METALAYER_API_URL = window.METALAYER_API_URL || (window.configManager ? window.configManager.get('apiUrl') : null);
const METALAYER_WS_URL = window.METALAYER_WS_URL || (window.configManager ? window.configManager.get('wsUrl') : null);

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
    startFlow: (name, data) => console.log(`[FLOW_START] ${name}`, data),
    endFlow: (name, success, data) => console.log(`[FLOW_END] ${name} (success: ${success})`, data),
    stepFlow: (name, step, data) => console.log(`[FLOW_STEP] ${name} - ${step}`, data)
  };
}

// Validate configuration is available
if (!METALAYER_API_URL || !METALAYER_WS_URL) {
  console.error('❌ CONFIG: Missing API configuration. Please ensure configManager is properly initialized.');
}

// ===== COMPLETE MODERN ARCHITECTURE INTEGRATION =====
// StateManager, EventBus, LifecycleManager, and Supabase integration

// Supabase configuration (using real credentials)
const SUPABASE_URL = 'https://zwxomzkmncwzwryvudwu.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp3eG9temttbmN3endyeXZ1ZHd1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk2Njg2ODQsImV4cCI6MjA3NTI0NDY4NH0.CoceGOzumiF6aYVGQSWily93snNYh9N9C4p8lrjrTyM';

// Initialize Supabase client globally
if (typeof window !== 'undefined' && typeof supabase !== 'undefined') {
  window.supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  console.log('🔍 SUPABASE: Global client initialized for Real Google Auth');
} else {
  console.error('🔍 SUPABASE: Failed to initialize global client');
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
    sendMessageToAPI(data.content);
  });
  
  eventBus.on('message:received', (data) => {
    console.log('📨 MODERN: Message received:', data.message);
    addMessageToChat(data.message);
  });
  
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
  
  eventBus.on('crossProfile:messageAdded', (data) => {
    console.log('📡 MODERN: Cross-profile message added:', data.message.content);
    addMessageToChat(data.message);
  });
  
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
  
  supabaseRealtimeClient.onUserUpdated = (user) => {
    console.log('📡 MODERN: Supabase user updated:', user.user_email);
    // EventBus was removed - use direct chrome.storage communication instead
    if (eventBus && eventBus.emit) {
      eventBus.emit('crossProfile:auraChanged', {
        userEmail: user.user_email,
        color: user.aura_color,
        timestamp: Date.now()
      });
    } else {
      console.log('📡 MODERN: EventBus not available, using direct storage communication');
      // Direct chrome.storage communication for cross-profile updates
      chrome.storage.local.set({
        'crossProfile:auraChanged': {
          userEmail: user.user_email,
          color: user.aura_color,
          timestamp: Date.now()
        }
      });
    }
  };
  
  supabaseRealtimeClient.onNewMessage = (message) => {
    console.log('📡 MODERN: Supabase new message:', message.content);
    if (eventBus && eventBus.emit) {
      eventBus.emit('crossProfile:messageAdded', {
        message: message,
        timestamp: Date.now()
      });
    } else {
      console.log('📡 MODERN: EventBus not available, using direct storage communication');
      chrome.storage.local.set({
        'crossProfile:messageAdded': {
          message: message,
          timestamp: Date.now()
        }
      });
    }
  };
  
  supabaseRealtimeClient.onVisibilityChanged = (visibility) => {
    console.log('👁️ MODERN: Supabase visibility changed:', visibility.user_email, 'visible:', visibility.is_visible);
    if (eventBus && eventBus.emit) {
      eventBus.emit('presence:visibilityChanged', {
        user: visibility,
        timestamp: Date.now()
      });
    } else {
      console.log('👁️ MODERN: EventBus not available, using direct storage communication');
      chrome.storage.local.set({
        'presence:visibilityChanged': {
          user: visibility,
          timestamp: Date.now()
        }
      });
    }
    // Refresh visibility avatars
    refreshVisibilityAvatars();
  };
  
  supabaseRealtimeClient.onUserJoined = (user) => {
    console.log('📡 MODERN: Supabase user joined:', user.user_email);
    if (eventBus && eventBus.emit) {
      eventBus.emit('presence:userJoined', {
        user: user,
        timestamp: Date.now()
      });
    } else {
      console.log('📡 MODERN: EventBus not available, using direct storage communication');
      chrome.storage.local.set({
        'presence:userJoined': {
          user: user,
          timestamp: Date.now()
        }
      });
    }
  };
  
  supabaseRealtimeClient.onUserLeft = (user) => {
    console.log('📡 MODERN: Supabase user left:', user.user_email);
    if (eventBus && eventBus.emit) {
      eventBus.emit('presence:userLeft', {
        user: user,
        timestamp: Date.now()
      });
    } else {
      console.log('📡 MODERN: EventBus not available, using direct storage communication');
      chrome.storage.local.set({
        'presence:userLeft': {
          user: user,
          timestamp: Date.now()
        }
      });
    }
  };
  
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

async function initializeSupabaseRealtime() {
  try {
    console.log('🚀 SUPABASE: Initializing real-time client...');
    
    // Load Supabase client (you'll need to add the CDN script to your HTML)
    if (typeof window !== 'undefined' && window.supabase) {
      supabaseRealtimeClient = new SupabaseRealtimeClient();
      const success = await supabaseRealtimeClient.initialize(SUPABASE_URL, SUPABASE_ANON_KEY);
      
      if (success) {
        console.log('✅ SUPABASE: Real-time client initialized');
        
        // Set up event handlers
        supabaseRealtimeClient.onUserJoined = (user) => {
          console.log('👋 SUPABASE: User joined:', user.user_email);
          // Refresh visibility avatars
          refreshVisibilityAvatars();
        };
        
        supabaseRealtimeClient.onUserUpdated = (user) => {
          console.log('🔄 SUPABASE: User updated:', user.user_email);
          // Update user's aura color in real-time
          if (user.aura_color) {
            updateUserAuraInUI(user.user_email, user.aura_color);
          }
        };
        
        supabaseRealtimeClient.onUserLeft = (user) => {
          console.log('👋 SUPABASE: User left:', user.user_email);
          // Refresh visibility avatars
          refreshVisibilityAvatars();
        };
        
        supabaseRealtimeClient.onNewMessage = (message) => {
          console.log('💬 SUPABASE: New message:', message.content);
          // Add message to chat
          addMessageToChat(message);
        };
        
        return true;
      } else {
        console.error('❌ SUPABASE: Failed to initialize real-time client');
        return false;
      }
    } else {
      console.warn('⚠️ SUPABASE: Supabase client not available, skipping real-time features');
      return false;
    }
  } catch (error) {
    console.error('❌ SUPABASE: Error initializing real-time client:', error);
    return false;
  }
}

async function joinPageWithSupabase(pageId, pageUrl) {
  if (supabaseRealtimeClient) {
    const userEmail = await getCurrentUserEmail();
    const userId = await getCurrentUserId();
    
    await supabaseRealtimeClient.setCurrentUser(userEmail, userId);
    await supabaseRealtimeClient.joinPage(pageId, pageUrl);
    console.log('🌐 SUPABASE: Joined page with real-time updates');
  }
}

async function broadcastAuraColorChange(color) {
  if (supabaseRealtimeClient) {
    await supabaseRealtimeClient.broadcastAuraColorChange(color);
    console.log('🎨 SUPABASE: Aura color change broadcasted');
  }
}

async function sendMessageViaSupabase(content) {
  if (supabaseRealtimeClient) {
    await supabaseRealtimeClient.sendMessage(content);
    console.log('💬 SUPABASE: Message sent via real-time');
  }
  
  // CHROME EXTENSION WEBSOCKET FIX: Send via background service worker
  try {
    const user = window.currentUser;
    const urlData = await normalizeCurrentUrl();
    
    await sendSupabaseMessage({
      type: 'MESSAGE_NEW',
      content: content,
      userEmail: user?.email,
      userId: user?.id || user?.email,
      pageId: urlData.pageId,
      url: urlData.normalizedUrl,
      timestamp: Date.now()
    });
    console.log('💬 WEBSOCKET: Message broadcast via background service worker');
  } catch (error) {
    console.error('💬 WEBSOCKET: Error broadcasting message:', error);
  }
}

function updateUserAuraInUI(userEmail, auraColor) {
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
      const newProfileAvatarHTML = createUnifiedAvatar({
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
  
  console.log(`🎨 Aura color update complete: ${messageAvatarsUpdated} message avatars updated`);
}

async function refreshVisibilityAvatars() {
  if (supabaseRealtimeClient && currentPageId) {
    const users = await supabaseRealtimeClient.getPageUsers(currentPageId);
    console.log('👁️ SUPABASE: Refreshing visibility with real-time users:', users.length);
    
    // Update combined avatars with real-time data
    const activeCommunities = await chrome.storage.local.get(['activeCommunities']);
    const communities = activeCommunities.activeCommunities || ['comm-001'];
    await loadCombinedAvatars(communities);
  }
}

// ===== END SUPABASE INTEGRATION =====

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
    
    // Test API call
    console.log('🔍 DEBUG: Testing getPresenceByUrl API...');
    const presenceData = await api.getPresenceByUrl(urlData.normalizedUrl, ['comm-001', 'comm-002']);
    console.log('🔍 DEBUG: API response:', JSON.stringify(presenceData, null, 2));
    
    if (presenceData && presenceData.active) {
      console.log('🔍 DEBUG: Found', presenceData.active.length, 'active users');
      presenceData.active.forEach((user, index) => {
        console.log(`🔍 DEBUG: User ${index + 1}:`, {
          id: user.id,
          userId: user.userId,
          name: user.name,
          email: user.email,
          avatarUrl: user.avatarUrl,
          isCurrentUser: user.userId === currentUser || user.email === currentUser
        });
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
const EXTENSION_BUILD = '2025-10-12-ghost-fix'; // Updated: Fixed ghost presence on tab moves + EXIT events
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
    return '#aa00aa'; // Default aura color
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
    const user = await authManager.getCurrentUser();
    console.log('🔍 API: Using user for authentication:', user?.email);
    
    const response = await this.request(`/v1/presence/url?${params.toString()}`, { user });
    console.log('🔍 API: getPresenceByUrl response:', JSON.stringify(response, null, 2));
    return response;
  }

  async getPresenceByCommunities(communityIds) {
    console.log('🔍 API: getPresenceByCommunities called with communities:', communityIds);
    const params = new URLSearchParams({ communityIds: communityIds.join(',') });
    
    // Get current user for authentication
    const user = await authManager.getCurrentUser();
    console.log('🔍 API: Using user for authentication:', user?.email);
    
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
    // Use the existing chat API
    console.log(`🔍 CHAT_API: getChatHistory called with communityId=${communityId}, threadId=${threadId}, uri=${uri}`);
    console.log(`🔍 CHAT_API: uri type: ${typeof uri}, value: ${JSON.stringify(uri)}`);
    
    if (!communityId) {
      console.error('❌ CHAT_API: communityId is required');
      return { conversations: [], messages: [] };
    }
    
    // Build query parameters
    const params = new URLSearchParams();
    params.append('communityId', communityId);
    if (threadId) {
      params.append('threadId', threadId);
    }
    if (uri) {
      params.append('uri', uri);
    }
    
    const url = `/chat/history?${params.toString()}`;
    console.log(`🔍 CHAT_API: Requesting ${url}`);
    
    try {
      const response = await this.request(url);
      console.log(`✅ CHAT_API: Response:`, response);
      
      // The backend now returns conversations directly
      if (response.conversations) {
        return {
          conversations: response.conversations,
          messages: response.conversations.flatMap(conv => conv.posts || [])
        };
      }
      
      // Fallback for empty response
      return {
        conversations: [],
        messages: []
      };
    } catch (error) {
      console.error('❌ CHAT_API: Error fetching chat history:', error);
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
      await normalizeCurrentUrl();
      console.log('🔄 STARTUP: URL normalized for initial load');
      
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
          console.log(`🔍 INIT: Authentication not ready, attempt ${authAttempts + 1}/${maxAuthAttempts}... (${error.message})`);
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
    console.log('🔍 VISIBILITY: Starting loadCombinedAvatars with communities:', communityIds);
    debug(`Loading combined avatars from communities: ${communityIds.join(', ')}`);
    
    // Get normalized URL for visibility - SAME AS MESSAGES
    const urlData = await normalizeCurrentUrl();
    const currentUri = urlData.normalizedUrl; // Use normalized URL for consistency
    console.log('🔍 VISIBILITY: Current normalized URI:', currentUri, '(from raw:', urlData.rawUrl, ')');
    
    // Try URL-based presence first (more accurate)
    let avatarResponses = [];
    try {
      console.log('🔍 VISIBILITY: Trying URL-based presence API for URL:', currentUri);
      const urlResponse = await api.getPresenceByUrl(currentUri, communityIds);
      console.log('🔍 VISIBILITY: URL-based presence response:', JSON.stringify(urlResponse, null, 2));
      
      if (urlResponse && urlResponse.active && urlResponse.active.length > 0) {
        avatarResponses = [urlResponse];
        console.log('🔍 VISIBILITY: Using URL-based presence data - found', urlResponse.active.length, 'active users');
        
        // Enhanced logging for each active user
        urlResponse.active.forEach((user, index) => {
          console.log(`🔍 VISIBILITY: Active user ${index + 1}:`, {
            id: user.id,
            userId: user.userId,
            name: user.name,
            handle: user.handle,
            email: user.email,
            avatarUrl: user.avatarUrl,
            auraColor: user.auraColor,
            isActive: user.isActive,
            status: user.status
          });
        });
      } else {
        console.log('🔍 VISIBILITY: No active users found via URL-based presence');
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

              if (retryResponse && retryResponse.active && retryResponse.active.length > 0) {
                console.log('🔍 VISIBILITY: Retry successful - found', retryResponse.active.length, 'active users');
                avatarResponses = [retryResponse];
              } else {
                console.log('🔍 VISIBILITY: Retry successful but no active users found');
                throw new Error('No active users found via URL-based presence retry');
              }
            } catch (retryError) {
              console.log('🔍 VISIBILITY: Retry also failed:', retryError.message);
            }
          }
      
      // If retry didn't work or wasn't a 401, fall back to community-based presence
      if (avatarResponses.length === 0) {
        try {
          console.log('🔍 VISIBILITY: Trying community-based presence API');
          const communityResponse = await api.getPresenceByCommunities(communityIds);
          console.log('🔍 VISIBILITY: Community-based presence response:', JSON.stringify(communityResponse, null, 2));
          avatarResponses = [communityResponse];
        } catch (communityError) {
          console.log('🔍 VISIBILITY: Community-based presence failed, using legacy avatars API:', communityError.message);
          
          // NO FALLBACK - If presence fails, show empty list
          console.log('🔍 VISIBILITY: No presence data available - showing empty list');
          return [];
        }
      }
    }
    
    console.log('🔍 VISIBILITY: Final avatar responses from API:', avatarResponses);
    
    // Combine and deduplicate avatars
    const allAvatars = [];
    const seenUsers = new Set();
    
    avatarResponses.forEach((response, index) => {
      const communityId = communityIds[index];
      let avatars;
      
      console.log(`🔍 VISIBILITY: Processing response for community ${communityId}:`, response);
      console.log(`🔍 VISIBILITY: Response keys:`, response ? Object.keys(response) : 'null');
      console.log(`🔍 VISIBILITY: Response type:`, typeof response);
      console.log(`🔍 VISIBILITY: Is array:`, Array.isArray(response));
      
      // Handle different response formats
      if (response && response.avatars && Array.isArray(response.avatars)) {
        avatars = response.avatars;
        console.log(`🔍 VISIBILITY: Found ${avatars.length} avatars in response.avatars for ${communityId}`);
      } else if (response && response.active && Array.isArray(response.active)) {
        avatars = response.active;
        console.log(`🔍 VISIBILITY: Found ${avatars.length} avatars in response.active for ${communityId}`);
      } else if (Array.isArray(response)) {
        avatars = response;
        console.log(`🔍 VISIBILITY: Found ${avatars.length} avatars in direct array for ${communityId}`);
      } else if (response && typeof response === 'object') {
        // Check for other possible structures
        console.log(`🔍 VISIBILITY: Checking other object structures for ${communityId}`);
        if (response.users && Array.isArray(response.users)) {
          avatars = response.users;
          console.log(`🔍 VISIBILITY: Found ${avatars.length} avatars in response.users for ${communityId}`);
        } else {
          avatars = [];
          console.log(`🔍 VISIBILITY: No avatars found in object for ${communityId}, available keys:`, Object.keys(response));
        }
      } else {
        avatars = [];
        console.log(`🔍 VISIBILITY: No avatars found for ${communityId}, response format:`, typeof response);
      }
      
      // Add community info to each avatar and deduplicate
      avatars.forEach((avatar, avatarIndex) => {
        console.log(`🔍 VISIBILITY: Processing avatar ${avatarIndex + 1} from ${communityId}:`, {
          id: avatar.id,
          userId: avatar.userId,
          name: avatar.name,
          handle: avatar.handle,
          email: avatar.email || avatar.userId || avatar.id,
          avatarUrl: avatar.avatarUrl,
          auraColor: avatar.auraColor
        });
        
        const userKey = `${avatar.userId || avatar.id}`;
        if (!seenUsers.has(userKey)) {
          seenUsers.add(userKey);
          allAvatars.push({
            ...avatar,
            communityId: communityId,
            communityName: avatar.communityName || `Community ${communityId}`
          });
          console.log(`✅ VISIBILITY: Added unique avatar: ${avatar.name || avatar.handle || 'Unknown'} (${userKey}) from ${communityId}`);
        } else {
          console.log(`⏭️ VISIBILITY: Skipped duplicate avatar: ${avatar.name || avatar.handle || 'Unknown'} (${userKey}) from ${communityId}`);
        }
      });
    });
    
    console.log(`🔍 VISIBILITY: Final combined avatars:`, allAvatars);
    console.log(`🔍 VISIBILITY: Total unique avatars: ${allAvatars.length}`);
    debug(`Combined avatars from ${communityIds.length} communities:`, allAvatars);
    debug(`Total unique avatars: ${allAvatars.length}`);
    
    // Enhanced logging for final avatars before passing to updateVisibleTab
    console.log('🔍 VISIBILITY: Final avatars to be processed by updateVisibleTab:');
    allAvatars.forEach((avatar, index) => {
      console.log(`🔍 VISIBILITY: Final avatar ${index + 1}:`, {
        id: avatar.id,
        userId: avatar.userId,
        name: avatar.name,
        handle: avatar.handle,
        email: avatar.email,
        avatarUrl: avatar.avatarUrl,
        auraColor: avatar.auraColor,
        communityId: avatar.communityId
      });
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
  
  // CRITICAL DIAGNOSTIC: Check if API returned real Google avatars or fake ones
  console.log('🔍 AVATAR_URL_DIAGNOSTIC: Analyzing avatar URLs from API...');
  avatars.forEach((avatar, index) => {
    const isRealGoogle = avatar.avatarUrl && (
      avatar.avatarUrl.includes('lh3.googleusercontent.com') || 
      avatar.avatarUrl.includes('googleusercontent.com')
    );
    const isFake = avatar.avatarUrl && avatar.avatarUrl.includes('ui-avatars.com');
    
    console.log(`🔍 AVATAR_URL_DIAGNOSTIC: User ${index + 1} (${avatar.name || avatar.email}):`, {
      avatarUrl: avatar.avatarUrl,
      isRealGoogle: isRealGoogle,
      isFake: isFake,
      auraColor: avatar.auraColor,
      enterTime: avatar.enterTime
    });
  });
  
  // Store visibility data globally for real-time aura color access
  window.currentVisibilityData = { active: avatars };
  
  // Clear any existing visibility update timer
  if (window.visibilityUpdateTimer) {
    clearInterval(window.visibilityUpdateTimer);
  }
  
  // Set up a timer to update visibility times every 10 seconds
  if (avatars && avatars.length > 0) {
    window.visibilityUpdateTimer = setInterval(() => {
      console.log('🔄 VISIBILITY: Updating visibility times...');
      updateVisibilityTimes();
    }, 10000); // Update every 10 seconds
  }
  console.log('🔄 VISIBILITY: Stored visibility data globally for real-time aura access');
  
    // Update profile avatar with real-time aura color if available
    // Only update if we have a real-time aura color, don't replace with unified avatar
    if (getLatestAuraColorFromPresence(window.currentUser.email)) {
      updateProfileAvatarWithRealTimeAura();
    }
  
  const visibleTab = document.getElementById('canopi-visible');
  if (!visibleTab) {
    console.log('❌ VISIBILITY: visibleTab element not found');
    return;
  }
  
  console.log(`🔍 VISIBILITY: Updating visible tab with ${avatars.length} avatars`);
  
  // Get current user email for filtering
  const currentUserEmail = await getCurrentUserEmail();
  console.log(`🔍 VISIBILITY: Current user email: ${currentUserEmail}`);
  
  // Enhanced logging for each avatar
  console.log('🔍 VISIBILITY: Processing avatars:');
  avatars.forEach((avatar, index) => {
    console.log(`🔍 VISIBILITY: Avatar ${index + 1}:`, {
      userId: avatar.userId,
      name: avatar.name,
      handle: avatar.handle,
      avatarUrl: avatar.avatarUrl,
      email: avatar.email || 'no email field'
    });
  });
  
  // CRITICAL FIX: Store ALL avatars (including current user) for profile avatar lookup
  // Store the UNFILTERED data globally BEFORE filtering out current user
  window.currentVisibilityDataUnfiltered = { active: avatars };
  console.log(`🔍 VISIBILITY_UNFILTERED: Stored ${avatars.length} avatars (including current user) for profile avatar lookup`);
  
  // Filter out users without avatars and current user - only show users with real avatar images
  const usersWithAvatars = avatars.filter(avatar => {
    console.log(`🔍 VISIBILITY: Checking avatar: ${avatar.name} (${avatar.userId})`);
    
    // Filter out users without valid avatars
    if (!avatar.avatarUrl || 
        avatar.avatarUrl === 'null' || 
        avatar.avatarUrl === '' ||
        !avatar.avatarUrl.startsWith('http')) {
      console.log(`🔍 VISIBILITY: Filtering out ${avatar.name} - invalid avatar URL: ${avatar.avatarUrl}`);
      return false;
    }
    
    // Check if this is the current user
    const isCurrentUser = avatar.userId === currentUserEmail || 
                         avatar.handle === currentUserEmail.split('@')[0] ||
                         avatar.name === currentUserEmail.split('@')[0] ||
                         avatar.email === currentUserEmail;
    
    if (isCurrentUser) {
      console.log(`🔍 VISIBILITY: Filtering out current user ${avatar.name} (${avatar.userId})`);
      return false;
    }
    
    console.log(`🔍 VISIBILITY: Keeping avatar: ${avatar.name} (${avatar.userId})`);
    return true;
  });
  
  console.log(`🔍 VISIBILITY: Showing ${usersWithAvatars.length} users with real avatars (filtered from ${avatars.length} total)`);
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
          // CRITICAL FIX: Use 30-second threshold for real-time accuracy, not 5 minutes!
          // User is "active" if they have a heartbeat within the last 30 seconds
          const now = Date.now();
          const lastSeenTime = avatar.lastSeen ? new Date(avatar.lastSeen).getTime() : 0;
          const timeSinceLastSeen = now - lastSeenTime;
          const isActive = timeSinceLastSeen < (30 * 1000); // 30 seconds threshold
          
          // Check if user has explicitly left (EXIT event) or is inactive
          const hasLeft = avatar.status === 'left' || !isActive;
          
          // COMPREHENSIVE DIAGNOSTIC LOGGING
          console.log(`🔍 VISIBILITY_TIMING_FIX: === User ${avatar.name} ===`);
          console.log(`🔍 VISIBILITY_TIMING_FIX:   enterTime: ${avatar.enterTime}`);
          console.log(`🔍 VISIBILITY_TIMING_FIX:   lastSeen: ${avatar.lastSeen}`);
          console.log(`🔍 VISIBILITY_TIMING_FIX:   timeSinceLastSeen: ${Math.floor(timeSinceLastSeen / 1000)}s`);
          console.log(`🔍 VISIBILITY_TIMING_FIX:   isActive: ${isActive} (threshold: 30s)`);
          console.log(`🔍 VISIBILITY_TIMING_FIX:   hasLeft: ${hasLeft}`);
          console.log(`🔍 VISIBILITY_TIMING_FIX:   avatar.status: ${avatar.status}`);
          console.log(`🔍 VISIBILITY_TIMING_FIX:   avatar.isActive: ${avatar.isActive}`);
          console.log(`🔍 VISIBILITY_TIMING_FIX:   avatar.availability: ${avatar.availability}`);
          
          // Use the user's availability setting for status dot color
          let statusDotColor = '#6b7280'; // Default gray (offline)
          let statusText = 'Offline';
          
          if (hasLeft) {
            // User has left - show "last seen" status
            statusDotColor = '#6b7280'; // Gray for inactive users
            statusText = formatLastSeenDisplay(avatar.lastSeen);
            console.log(`🔍 VISIBILITY_TIMING_FIX:   DECISION: User has LEFT → "${statusText}"`);
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
            console.log(`🔍 VISIBILITY_TIMING_FIX:   DECISION: User is ACTIVE → "${statusText}"`);
          }
          
          console.log(`🔍 VISIBILITY_TIMING_FIX:   FINAL: statusText="${statusText}", dotColor=${statusDotColor}`);
          
          // Aura color is now handled by createUnifiedAvatar()
          console.log(`🔍 AURA_DEBUG: User ${avatar.name} - auraColor: ${avatar.auraColor}`);
          
          return `
            <li class="user-item" data-user-id="${avatar.userId}" data-user-name="${avatar.name}" data-index="${index}">
              <div class="avatar-container" style="position: relative; width: 32px; height: 32px;">
                ${createUnifiedAvatar(avatar, {
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
  avatarImages.forEach(img => {
    img.addEventListener('error', () => {
      console.log('❌ VISIBILITY: Avatar image failed to load, removing user from visible list');
      // Remove the entire user item if avatar fails to load
      const userItem = img.closest('.user-item');
      if (userItem) {
        userItem.remove();
        // Update the count
        const countElement = visibleTab.querySelector('.visible-count');
        if (countElement) {
          const currentCount = visibleTab.querySelectorAll('.user-item').length;
          countElement.textContent = `${currentCount} visible`;
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
function createUnifiedAvatar(user, options = {}) {
  const {
    size = 32,
    showStatus = true,
    showAura = true,
    context = 'message',
    statusColor = null
  } = options;
  
  const name = user.name || user.handle || user.email || 'Unknown';
  const avatarUrl = user.avatarUrl;
  
  // Debug logging
  console.log(`🔍 UNIFIED_AVATAR: [BUILD ${EXTENSION_BUILD}] Creating avatar for user:`, {
    name: name,
    email: user.email,
    id: user.id,
    userId: user.userId,
    auraColor: user.auraColor,
    context: context
  });
  
  // COMPREHENSIVE AURA COLOR DEBUGGING
  console.log(`🔍 AURA_DEBUG: [BUILD ${EXTENSION_BUILD}] === AURA COLOR ANALYSIS ===`);
  console.log(`🔍 AURA_DEBUG: [BUILD ${EXTENSION_BUILD}] Context: ${context}`);
  console.log(`🔍 AURA_DEBUG: [BUILD ${EXTENSION_BUILD}] user.auraColor: ${user.auraColor}`);
  console.log(`🔍 AURA_DEBUG: [BUILD ${EXTENSION_BUILD}] user.auraColor type: ${typeof user.auraColor}`);
  console.log(`🔍 AURA_DEBUG: [BUILD ${EXTENSION_BUILD}] user.auraColor === null: ${user.auraColor === null}`);
  console.log(`🔍 AURA_DEBUG: [BUILD ${EXTENSION_BUILD}] user.auraColor === 'null': ${user.auraColor === 'null'}`);
  console.log(`🔍 AURA_DEBUG: [BUILD ${EXTENSION_BUILD}] user.auraColor === undefined: ${user.auraColor === undefined}`);
  console.log(`🔍 AURA_DEBUG: [BUILD ${EXTENSION_BUILD}] Full user object:`, JSON.stringify(user, null, 2));
  
  // Ensure consistent aura color for the same user across all contexts
  let auraColor;
  if (user.auraColor && user.auraColor !== null && user.auraColor !== 'null') {
    auraColor = user.auraColor;
    console.log(`🔍 UNIFIED_AVATAR: Using provided aura color: ${auraColor}`);
  } else {
    // Use a consistent color based on user ID or email for the same user
    const userIdentifier = user.id || user.userId || user.email || name;
    auraColor = getAvatarColor(userIdentifier);
    console.log(`🔍 UNIFIED_AVATAR: [BUILD ${EXTENSION_BUILD}] Generated aura color for ${userIdentifier}: ${auraColor}`);
  }
  
  // Determine status dot color - use provided statusColor or default to green
  const dotColor = statusColor || '#22c55e'; // Default to green if no status color provided
  console.log(`🔍 UNIFIED_AVATAR: [BUILD ${EXTENSION_BUILD}] Status dot color: ${dotColor}`);
  
  // UNIFIED VISUAL IMPLEMENTATION - SAME FOR ALL CONTEXTS
  // Always use the same structure: aura background + img with border + status dot
  if (avatarUrl && avatarUrl !== 'null' && avatarUrl !== '' && avatarUrl.startsWith('http')) {
    const avatarHTML = `<div style="position: relative; width: ${size}px; height: ${size}px;">
      ${showAura ? `<div style="position: absolute; top: -2px; left: -2px; width: ${size + 4}px; height: ${size + 4}px; border-radius: 50%; background-color: ${auraColor}; z-index: 1;"></div>` : ''}
      <img src="${avatarUrl}" alt="${name}" style="position: relative; z-index: 2; width: ${size}px; height: ${size}px; border-radius: 50%; object-fit: cover; border: 2px solid ${auraColor};" data-avatar-fallback="true">
      ${showStatus ? `<div style="position: absolute; bottom: -2px; right: -2px; width: 8px; height: 8px; border-radius: 50%; background-color: ${dotColor}; border: 2px solid white; z-index: 3;"></div>` : ''}
    </div>`;
    console.log(`🔍 UNIFIED_AVATAR: [BUILD ${EXTENSION_BUILD}] Generated UNIFIED avatar with image - auraColor: ${auraColor}, showAura: ${showAura}`);
    return avatarHTML;
  }
  
  // UNIFIED FALLBACK - SAME structure for all contexts
  const initial = name.charAt(0).toUpperCase();
  const fontSize = Math.max(10, size * 0.4);
  
  const avatarHTML = `<div style="position: relative; width: ${size}px; height: ${size}px;">
    ${showAura ? `<div style="position: absolute; top: -2px; left: -2px; width: ${size + 4}px; height: ${size + 4}px; border-radius: 50%; background-color: ${auraColor}; z-index: 1;"></div>` : ''}
    <div style="position: relative; z-index: 2; width: ${size}px; height: ${size}px; border-radius: 50%; background-color: ${auraColor}; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: ${fontSize}px; border: 2px solid ${auraColor};">${initial}</div>
    ${showStatus ? `<div style="position: absolute; bottom: -2px; right: -2px; width: 8px; height: 8px; border-radius: 50%; background-color: ${dotColor}; border: 2px solid white; z-index: 3;"></div>` : ''}
  </div>`;
  console.log(`🔍 UNIFIED_AVATAR: [BUILD ${EXTENSION_BUILD}] Generated UNIFIED avatar with initial - auraColor: ${auraColor}, showAura: ${showAura}`);
  return avatarHTML;
}

// Global function to set custom avatar color for the current user
function setCustomAvatarColor(color) {
  if (!color || !color.startsWith('#')) {
    console.error('❌ Invalid color. Please provide a hex color (e.g., #45B7D1)');
    return;
  }
  
  // Store the custom color
  // Modernized: Use StateManager instead of Chrome Storage
  setState('customAvatarColor', color).then(() => {
    // Refresh the profile avatar
    refreshUserAvatar();
  });
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
  //     console.log(`🔍 AURA_COLOR_SAVE: [BUILD ${EXTENSION_BUILD}] Looking up user by email: ${userEmail}`);
  //     console.log(`🔍 AURA_COLOR_SAVE: [BUILD ${EXTENSION_BUILD}] API URL: ${userLookupUrl}`);
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
    const presenceData = await api.getPresenceByUrl(normalizedUrl.normalizedUrl);
    
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
          console.log(`🔄 MESSAGE_AVATAR: Updated aura for ${userEmail}: ${user.auraColor}`);
        }
      });
      
      // Find all message containers and re-render their avatars with updated aura colors
      const messageContainers = document.querySelectorAll('.message');
      console.log(`🔄 MESSAGE_AVATAR: Found ${messageContainers.length} message containers to update`);
      
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
                console.log(`🔄 MESSAGE_AVATAR: Re-rendering avatar for ${userEmail} with aura ${auraColorMap[userEmail]}`);
                
                // Update the author's aura color
                author.auraColor = auraColorMap[userEmail];
                
                // Re-render the avatar with the updated aura color
                const newAvatarHTML = getSenderAvatar(author);
                avatarContainer.innerHTML = newAvatarHTML;
                
                console.log(`🔄 MESSAGE_AVATAR: Re-rendered avatar for ${userEmail}`);
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
  console.log('🔍 ADD_MESSAGE: Starting addMessageToChat with message:', message);
  
  // CRITICAL: Filter out deleted messages without replies
  // Check both deletedAt field and [Deleted] body content
  const isDeleted = message.deletedAt || (message.body && message.body.trim() === '[Deleted]');
  if (isDeleted && !message.hasReplies) {
    console.log('🔍 ADD_MESSAGE: SKIPPING deleted message without replies:', message.id);
    return;
  }
  
  const chatMessages = document.querySelector('.chat-messages');
  if (!chatMessages) {
    console.log('❌ ADD_MESSAGE: No chat-messages element found');
    return;
  }
  console.log('✅ ADD_MESSAGE: Found chat-messages element');

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
    console.log(`🔍 DELETED_MSG_DEBUG: [BUILD ${EXTENSION_BUILD}] === DELETED MESSAGE ANALYSIS ===`);
    console.log(`🔍 DELETED_MSG_DEBUG: [BUILD ${EXTENSION_BUILD}] Message ID: ${message.id}`);
    console.log(`🔍 DELETED_MSG_DEBUG: [BUILD ${EXTENSION_BUILD}] Message deletedAt: ${message.deletedAt}`);
    console.log(`🔍 DELETED_MSG_DEBUG: [BUILD ${EXTENSION_BUILD}] Message hasReplies: ${message.hasReplies}`);
    console.log(`🔍 DELETED_MSG_DEBUG: [BUILD ${EXTENSION_BUILD}] Message replyCount: ${message.replyCount}`);
    console.log(`🔍 DELETED_MSG_DEBUG: [BUILD ${EXTENSION_BUILD}] Full message object:`, JSON.stringify(message, null, 2));
    
    // Only show deleted messages if they have replies
    if (!message.hasReplies) {
      console.log(`🔍 DELETED_MSG_DEBUG: [BUILD ${EXTENSION_BUILD}] SKIPPING deleted message without replies: ${message.id}`);
      return;
    }
    
    console.log(`🔍 DELETED_MSG_DEBUG: [BUILD ${EXTENSION_BUILD}] SHOWING deleted message WITH replies: ${message.id}`);
    
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
  chatMessages.appendChild(messageDiv);
  console.log('✅ ADD_MESSAGE: Message added to DOM successfully');
  
  // Add message to global storage for avatar updates
  if (!window.currentChatData) {
    window.currentChatData = [];
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
  
  // Update polling tracking
  lastMessageCount = allMessages.length;
  if (allMessages.length > 0) {
    const lastMessage = allMessages[allMessages.length - 1];
    lastMessageId = lastMessage.getAttribute('data-message-id');
    console.log('🔍 ADD_MESSAGE: Updated last message ID:', lastMessageId);
  }
  
  // Add avatar error handlers for CSP compliance
  const avatarImg = messageDiv.querySelector('img[data-avatar-fallback="true"]');
  if (avatarImg) {
    avatarImg.addEventListener('error', function() {
      this.style.display = 'none';
      const fallbackDiv = this.nextElementSibling;
      if (fallbackDiv) {
        fallbackDiv.style.display = 'flex';
      }
    });
  }
  
  chatMessages.scrollTop = chatMessages.scrollHeight;
  
  // Update visual hierarchy after adding message
  setTimeout(() => {
    updateMessageVisualHierarchy();
  }, 10);
}

// Check if a conversation has replies and add thread toggle if needed
async function checkAndAddThreadToggle(messageElement, conversationId) {
  try {
    // Get conversations for the current page to find replies
    const currentUri = window.location.href;
    const response = await api.getChatHistory(currentUri);
    
    // Filter for replies to this specific conversation
    const replies = response.conversations?.flatMap(conv => 
      conv.posts?.filter(post => post.parentId && post.conversationId === conversationId) || []
    ) || [];
    
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
      console.log(`🔍 PROFILE_AVATAR_UPDATE: Found real-time aura color for profile: ${realTimeAuraColor}`);
      
      // Update the profile avatar with the real-time aura color
      const profileAvatar = document.querySelector('#user-avatar');
      if (profileAvatar) {
        console.log(`🔍 PROFILE_AVATAR_UPDATE: Found profile avatar element:`, profileAvatar);
        
        // Check if the profile avatar has been replaced with unified avatar structure
        const hasUnifiedStructure = profileAvatar.querySelector('div[style*="position: relative"]');
        
        if (hasUnifiedStructure) {
          // If it's been replaced with unified avatar, restore the original structure
          console.log('🔍 PROFILE_AVATAR_UPDATE: Restoring original profile avatar structure');
          
          // Get the original image source
          const img = profileAvatar.querySelector('img');
          const originalSrc = img ? img.src : 'https://lh3.googleusercontent.com/a/ACg8ocLF_0TdjZoB2Bx_dBmaVxeuLl5fqbsJrYWi7zFYSTycnLXT57s=s96-c';
          
          // Restore the original structure
          profileAvatar.innerHTML = `<img src="${originalSrc}" alt="Profile Avatar" style="width: 24px; height: 24px; border-radius: 50%; object-fit: cover;">`;
        }
        
        // Update the border color
        profileAvatar.style.borderColor = realTimeAuraColor;
        profileAvatar.style.borderWidth = '2px';
        profileAvatar.style.borderStyle = 'solid';
        console.log(`🔍 PROFILE_AVATAR_UPDATE: Updated profile avatar border color to: ${realTimeAuraColor}`);
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
        console.log(`🔍 GET_LATEST_AURA: Found real-time aura color for ${userEmail}: ${user.auraColor}`);
        return user.auraColor;
      }
    }
    
    // Fallback: try to get from current visibility data
    const visibilityData = window.currentVisibilityData;
    if (visibilityData && visibilityData.active) {
      const user = visibilityData.active.find(u => u.email === userEmail || u.id === userEmail || u.userId === userEmail);
      if (user && user.auraColor) {
        console.log(`🔍 GET_LATEST_AURA: Found visibility aura color for ${userEmail}: ${user.auraColor}`);
        return user.auraColor;
      }
    }
    
    // Additional fallback: check if this is the current user and get from stored aura color
    if (window.currentUser && window.currentUser.email === userEmail) {
      const storedAuraColor = window.currentUser.auraColor;
      if (storedAuraColor && storedAuraColor !== null && storedAuraColor !== 'null') {
        console.log(`🔍 GET_LATEST_AURA: Found stored aura color for current user ${userEmail}: ${storedAuraColor}`);
        return storedAuraColor;
      }
    }
    
    console.log(`🔍 GET_LATEST_AURA: No real-time aura color found for ${userEmail}`);
    return null;
  } catch (error) {
    console.error(`❌ GET_LATEST_AURA: Error getting latest aura color for ${userEmail}:`, error);
    return null;
  }
}

function getSenderAvatar(author) {
  if (!author) return getSenderInitial('Unknown');
  
  console.log(`🔍 GET_SENDER_AVATAR: [BUILD ${EXTENSION_BUILD}] Creating message avatar for:`, {
    name: author.name,
    email: author.email,
    auraColor: author.auraColor
  });
  
  // Always try to get the latest aura color from presence data
  // This ensures cross-profile updates work correctly for ALL users
  const currentUserEmail = getCurrentUserEmail();
  if (author.email === currentUserEmail) {
    // For current user's messages, use current aura color
    const currentAuraColor = getCurrentUserAvatarBgColor();
    if (currentAuraColor) {
      author.auraColor = currentAuraColor;
      console.log(`🔍 GET_SENDER_AVATAR: [BUILD ${EXTENSION_BUILD}] Using current aura color for current user:`, currentAuraColor);
    }
  } else {
    // For other users' messages, try to get the latest aura color from presence data
    // This ensures real-time aura updates for all users
    const latestAuraColor = getLatestAuraColorFromPresence(author.email);
    if (latestAuraColor) {
      author.auraColor = latestAuraColor;
      console.log(`🔍 GET_SENDER_AVATAR: [BUILD ${EXTENSION_BUILD}] Using real-time aura color for other user:`, latestAuraColor);
    } else {
      console.log(`🔍 GET_SENDER_AVATAR: [BUILD ${EXTENSION_BUILD}] Using stored aura color for other user:`, author.auraColor);
    }
  }
  
  // Use unified avatar system for consistency
  const avatarHTML = createUnifiedAvatar(author, {
    size: 32,
    showStatus: true,
    showAura: true,
    context: 'message',
    statusColor: '#22c55e' // Default green for message avatars
  });
  
  console.log(`🔍 GET_SENDER_AVATAR: [BUILD ${EXTENSION_BUILD}] Generated message avatar HTML:`, avatarHTML);
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
  console.log(`🔍 MESSAGE_OPTIONS_DEBUG: Getting action menu for message ${message.id}`);
  console.log(`🔍 MESSAGE_OPTIONS_DEBUG: Message author: ${message.authorId}, createdAt: ${message.createdAt}`);
  console.log(`🔍 MESSAGE_OPTIONS_DEBUG: Message author object:`, message.author);
  
  const now = new Date();
  const messageDate = new Date(message.createdAt);
  const diffMs = now - messageDate;
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  
  console.log(`🔍 MESSAGE_OPTIONS_DEBUG: Time diff - minutes: ${diffMinutes}, hours: ${diffHours}`);
  
  // Get current user to check ownership - use window.currentUser from direct auth
  const currentUser = window.currentUser;
  
  console.log(`🔍 MESSAGE_OPTIONS_DEBUG: Current user from window.currentUser:`, currentUser);
  console.log(`🔍 MESSAGE_OPTIONS_DEBUG: Current user email: ${currentUser ? currentUser.email : 'none'}`);
  
  // Use email for user identification - NO UUIDs
  let isOwner = false;
  if (currentUser && currentUser.email) {
    // Compare by email - the message should have author email
    const authorEmail = message.authorEmail || (message.author && message.author.email);
    isOwner = (authorEmail === currentUser.email);
    console.log(`🔍 MESSAGE_OPTIONS_DEBUG: Is owner check - author email: ${authorEmail}, current user email: ${currentUser.email}, isOwner: ${isOwner}`);
  }
  
  // Check if user can edit/delete (only if they own the message)
  const canEdit = isOwner && diffHours < 1; // Can edit within 1 hour
  const canDelete = isOwner; // User can only delete their own messages
  
  console.log(`🔍 MESSAGE_OPTIONS_DEBUG: Permissions - canEdit: ${canEdit}, canDelete: ${canDelete}`);
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
        const response = await api.editMessage(message.id, newContent);
        if (response && response.body) {
          // Update the message in the UI
          const messageDiv = document.querySelector(`[data-message-id="${message.id}"]`);
          if (messageDiv) {
            const contentDiv = messageDiv.querySelector('.message-content');
            contentDiv.innerHTML = convertUrlsToLinks(response.body);
            // Add edited indicator
            const timeElement = messageDiv.querySelector('.message-time-new');
            if (timeElement && !timeElement.textContent.includes('(edited)')) {
              timeElement.textContent += ' (edited)';
            }
          }
          showNotification('Message updated successfully');
        }
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
      const response = await api.deleteMessage(message.id);
      // Server returns { message: 'Post deleted', id } on success
      if (response.message && response.message.includes('deleted')) {
        // Remove the message from the UI
        const messageDiv = document.querySelector(`[data-message-id="${message.id}"]`);
        if (messageDiv) {
          messageDiv.remove();
        }
        
        // Broadcast deletion to other profiles
        try {
          chrome.runtime.sendMessage({
            type: 'MESSAGE_DELETED',
            messageId: message.id,
            timestamp: Date.now()
          });
          console.log('📡 DELETION: Broadcasted deletion to other profiles');
        } catch (error) {
          console.log('📡 DELETION: Could not broadcast to other profiles:', error);
        }
        
        // Force refresh the chat to ensure all profiles see the deletion
        console.log('🔄 DELETION: Refreshing chat after message deletion');
        await loadChatHistory();
        
        // Broadcast deletion to other profiles via chrome.runtime
        try {
          chrome.runtime.sendMessage({
            type: 'MESSAGE_DELETED',
            messageId: message.id,
            timestamp: Date.now()
          });
          console.log('📡 DELETION: Broadcasted deletion to other profiles');
        } catch (error) {
          console.log('📡 DELETION: Could not broadcast to other profiles:', error);
        }
        
        showNotification('Message deleted successfully');
      }
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
      const conversationResponse = await api.getChatHistory(communityId, message.conversationId);
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
    
    // Add event listener for back button
    const backBtn = backNav.querySelector('.back-btn');
    if (backBtn) {
      backBtn.addEventListener('click', handleBackNavigation);
    }
    
    chatMessages.appendChild(backNav);
    
    // Get the full conversation data first
    const focusCommunityId = message.communityId || (window.activeCommunities && window.activeCommunities[0]) || 'comm-001';
    const response = await api.getChatHistory(focusCommunityId, message.conversationId);
    
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
    const response = await api.getChatHistory(resolvedCommunityId, conversationId);
    
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
  if (window.focusedMessage && window.previousView) {
    // Store the current state before clearing
    const focusedMessage = window.focusedMessage;
    const previousView = window.previousView;
    
    // Clear focus state
    delete window.focusedMessage;
    delete window.previousView;
    
    if (previousView === 'thread') {
      // This was a reply - go back to the thread view
      // We need to find the parent message and focus on it
      try {
        // Get the conversation to find the parent message
        const parentCommunityId = focusedMessage.communityId || (window.activeCommunities && window.activeCommunities[0]) || 'comm-001';
        const response = await api.getChatHistory(parentCommunityId, focusedMessage.conversationId);
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
      console.log(`🔍 Message div found:`, messageDiv);
      console.log(`🔍 Message div dataset:`, messageDiv.dataset);
      const reactionsData = messageDiv.dataset.reactions;
      console.log(`📊 Stored reactions data:`, reactionsData);
      if (reactionsData) {
        reactions = JSON.parse(reactionsData);
      }
    } else {
      console.log(`❌ No message div found for reaction button`);
    }
    
    // Fallback to API call if no conversation data
    if (reactions.length === 0) {
      console.log(`🔄 No stored reactions, calling API for message ${messageId}`);
      reactions = await api.getReactions(messageId);
      console.log(`📡 API returned reactions:`, reactions);
    }
    
    const countSpan = reactionBtn.querySelector('.icon-count');
    
    if (reactions && reactions.length > 0) {
      console.log(`📊 Found ${reactions.length} reactions`);
      
      // Update count
      if (countSpan) {
        countSpan.textContent = reactions.length;
        countSpan.style.display = 'inline';
        console.log(`📊 Updated count to: ${reactions.length}`);
      }
      
      // Check if current user has reacted - use window.currentUser
      const currentUser = window.currentUser;
      console.log(`👤 Current user:`, currentUser);
      
      if (currentUser) {
        // Generate the same UUID that the server uses
        const serverUserId = currentUser.id; // Use the user ID from the database
        console.log(`🆔 Generated server user ID: ${serverUserId}`);
        
        // Find user reaction by ID or email (fallback for existing data)
        console.log(`   Current user email: ${currentUser.email}`);
        console.log(`   All reaction user IDs:`, reactions.map(r => r.userId));
        
        const userReaction = reactions.find(r => 
          r.userId === serverUserId || 
          r.userId === currentUser.id || 
          r.user.email === currentUser.email
        );
        
        console.log(`🔍 Looking for user reaction. Found:`, userReaction);
        console.log(`🔍 All reactions:`, reactions.map(r => ({ userId: r.userId, emoji: r.emoji, kind: r.kind })));
        
        if (userReaction) {
          // Show the actual emoji from the database
          const emoji = userReaction.emoji || '👍';
          // Update the emoji but preserve the count span
          const countSpan = reactionBtn.querySelector('.icon-count');
          const countText = countSpan ? countSpan.textContent : '';
          reactionBtn.innerHTML = `${emoji}${countText ? `<span class="icon-count">${countText}</span>` : ''}`;
          reactionBtn.dataset.reaction = emoji;
        } else {
          console.log(`❌ No user reaction found`);
        }
      } else {
        console.log(`❌ No current user found`);
      }
    } else {
      console.log(`📊 No reactions found, setting default state`);
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
        
        // Toggle reaction via API (store both kind and emoji)
        const response = await api.toggleReaction(kind, message.id, message.conversationId, selectedReaction);
        
        // Update reaction count if available
        const countSpan = reactionBtn.querySelector('.icon-count');
        if (countSpan) {
          // Get current reactions to update count
          const reactions = await api.getReactions(message.id);
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

async function loadChatHistory(communityId = null) {
  try {
    // Get user's active communities
    const result = await chrome.storage.local.get(['activeCommunities', 'primaryCommunity', 'currentCommunity']);
    const activeCommunities = result.activeCommunities || [result.primaryCommunity || result.currentCommunity || 'comm-001'];
    
    // MODERN LOGGING: Structured logging for chat loading
    window.logger?.info('CHAT', 'Loading chat history for active communities', { 
      communities: activeCommunities,
      count: activeCommunities.length 
    });
    console.log(`🔍 CHAT_LOAD: Loading chat history for active communities: ${activeCommunities.join(', ')}`);
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
    console.log(`🔍 CHAT_LOAD: Loading chat history for normalized URI: ${currentUri} (from raw: ${urlData.rawUrl})`);
    console.log(`🔍 CHAT_LOAD: urlData object:`, JSON.stringify(urlData));
    console.log(`🔍 CHAT_LOAD: currentUri before loop: ${currentUri}`);
    console.log(`🔍 CHAT_LOAD: currentUri type: ${typeof currentUri}, value: ${JSON.stringify(currentUri)}`);
    debug(`Loading chat history for normalized URI: ${currentUri} (from raw: ${urlData.rawUrl})`);
    
    // Check if we're reloading the same URI unnecessarily
    if (lastLoadedUri === currentUri) {
      console.log(`🔍 CHAT_LOAD: Skipping reload - same URI as last load: ${currentUri}`);
      console.log(`🔍 CHAT_LOAD: Last loaded URI: ${lastLoadedUri}, Current URI: ${currentUri}`);
      return;
    }
    
    // NOTE: No polling needed - messages arrive via Supabase real-time
    
    console.log(`🔍 CHAT_LOAD: URI changed - reloading chat history`);
    console.log(`🔍 CHAT_LOAD: Last loaded URI: ${lastLoadedUri}, Current URI: ${currentUri}`);
    
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
        console.log(`🔍 CHAT_LOAD: === LOADING MESSAGES FOR COMMUNITY ${communityId} ===`);
        console.log(`🔍 CHAT_LOAD: Requesting chat history for community ${communityId} with URI: ${currentUri}`);
        console.log(`🔍 CHAT_LOAD: currentUri type: ${typeof currentUri}, value: ${JSON.stringify(currentUri)}`);
        console.log(`🔍 CHAT_LOAD: About to call api.getChatHistory with communityId=${communityId}, threadId=null, uri=${currentUri}`);
        console.log(`🔍 CHAT_LOAD: currentUri in loop: ${currentUri}`);
        
        const response = await api.getChatHistory(communityId, null, currentUri); // Use current URI for URL-specific messages
        
        console.log(`🔍 CHAT_LOAD: === API RESPONSE FOR COMMUNITY ${communityId} ===`);
        console.log(`🔍 CHAT_LOAD: Response object:`, JSON.stringify(response, null, 2));
        console.log(`🔍 CHAT_LOAD: Has conversations: ${!!response.conversations}`);
        console.log(`🔍 CHAT_LOAD: Conversations count: ${response.conversations ? response.conversations.length : 0}`);
        
        if (response.conversations && response.conversations.length > 0) {
          console.log(`✅ CHAT_LOAD: Found ${response.conversations.length} conversations for community ${communityId}`);
          response.conversations.forEach((conv, index) => {
            console.log(`🔍 CHAT_LOAD: Conversation ${index + 1}:`, {
              id: conv.id,
              messageCount: conv.messages ? conv.messages.length : 0,
              firstMessage: conv.messages && conv.messages.length > 0 ? conv.messages[0].body.substring(0, 50) : 'N/A'
            });
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
          console.log(`✅ CHAT_LOAD: Added ${conversationsWithCommunity.length} conversations from ${communityName}`);
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
    console.log(`🔍 CHAT_LOAD: Total conversations from all communities: ${allConversations.length}`);
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
    console.log(`🔍 CHAT_LOAD: Current messages before clearing: ${currentMessages.length}`);
    console.log('🔍 CHAT_LOAD: Current message IDs:', Array.from(currentMessages).map(m => m.getAttribute('data-message-id')));
    
    // Clear existing messages
    console.log('🔍 CHAT_LOAD: Clearing existing messages');
    chatMessages.innerHTML = '';
    // Clear global chat data storage
    window.currentChatData = [];
    console.log('✅ CHAT_LOAD: Messages cleared and global storage reset');
    
    if (allConversations.length === 0) {
      console.warn('⚠️ CHAT_LOAD: NO MESSAGES TO DISPLAY - No conversations found for any active community on this page');
      console.warn('⚠️ CHAT_LOAD: Leaving placeholder text in place');
      chatMessages.innerHTML = '<p style="text-align: center; color: var(--text-secondary); padding: 20px;">No messages yet. Start a conversation!</p>';
      return;
    }
    
    console.log(`🔍 CHAT_LOAD: Processing ${allConversations.length} conversations for display`);
    
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
            console.log(`🔍 DELETED_MSG_DEBUG: [BUILD ${EXTENSION_BUILD}] === MAIN THREAD MESSAGE ANALYSIS ===`);
            console.log(`🔍 DELETED_MSG_DEBUG: [BUILD ${EXTENSION_BUILD}] Message ID: ${mainThreadPost.id}`);
            console.log(`🔍 DELETED_MSG_DEBUG: [BUILD ${EXTENSION_BUILD}] Message deletedAt: ${mainThreadPost.deletedAt}`);
            console.log(`🔍 DELETED_MSG_DEBUG: [BUILD ${EXTENSION_BUILD}] Total direct replies: ${directReplies.length}`);
            console.log(`🔍 DELETED_MSG_DEBUG: [BUILD ${EXTENSION_BUILD}] Non-deleted replies: ${nonDeletedReplies.length}`);
            console.log(`🔍 DELETED_MSG_DEBUG: [BUILD ${EXTENSION_BUILD}] hasReplies: ${mainThreadPost.hasReplies}`);
            console.log(`🔍 DELETED_MSG_DEBUG: [BUILD ${EXTENSION_BUILD}] replyCount: ${mainThreadPost.replyCount}`);
            if (directReplies.length > 0) {
              console.log(`🔍 DELETED_MSG_DEBUG: [BUILD ${EXTENSION_BUILD}] Direct replies details:`, directReplies.map(r => ({ id: r.id, deletedAt: r.deletedAt, body: r.body })));
            }
            
            // Check if this message should be skipped
            if (mainThreadPost.deletedAt && !mainThreadPost.hasReplies) {
              console.log(`🔍 DELETED_MSG_DEBUG: [BUILD ${EXTENSION_BUILD}] SKIPPING deleted main thread without replies: ${mainThreadPost.id}`);
              continue;
            } else if (mainThreadPost.deletedAt && mainThreadPost.hasReplies) {
              console.log(`🔍 DELETED_MSG_DEBUG: [BUILD ${EXTENSION_BUILD}] SHOWING deleted main thread WITH replies: ${mainThreadPost.id}`);
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
            await addMessageToChat(mainThreadPost);
            console.log('✅ CHAT_LOAD: Main thread post added');
            
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
          
          // Update polling tracking after processing all messages in this conversation
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
  }
}

// --- Supabase Real-time Client Initialization ---
async function initializeSupabaseRealtimeClient() {
  try {
    console.log('🚀 SUPABASE: Waiting for Supabase library to load...');
    
    // Wait for Supabase library to load
    const waitForSupabase = () => {
      return new Promise((resolve) => {
        let attempts = 0;
        const maxAttempts = 50; // 5 seconds max wait
        
        const checkSupabase = () => {
          attempts++;
          
          // Check if window.supabase client is available (already initialized at top of file)
          // window.supabase is the CLIENT instance, not the library, so check for .from method
          if (typeof window.supabase !== 'undefined' && window.supabase && typeof window.supabase.from === 'function') {
            console.log('✅ SUPABASE CLIENT: Loaded and initialized successfully');
            console.log('✅ SUPABASE CLIENT: Available methods:', Object.keys(window.supabase).slice(0, 10));
            resolve(true);
          } else if (attempts >= maxAttempts) {
            console.error('❌ SUPABASE LIBRARY: Failed to load after 5 seconds');
            console.error('❌ SUPABASE LIBRARY: window.supabase:', typeof window.supabase);
            console.error('❌ SUPABASE LIBRARY: Available window keys:', Object.keys(window).filter(k => k.toLowerCase().includes('supabase')));
            resolve(false);
          } else {
            if (attempts % 10 === 0) {
              console.log(`⏳ SUPABASE LIBRARY: Waiting... (attempt ${attempts}/${maxAttempts})`);
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
    if (typeof SupabaseRealtimeClient !== 'undefined') {
      window.supabaseRealtimeClient = new SupabaseRealtimeClient();
      
      // Initialize with Supabase credentials
      const supabaseUrl = 'https://zwxomzkmncwzwryvudwu.supabase.co';
      const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp3eG9temttbmN3endyeXZ1ZHd1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk2Njg2ODQsImV4cCI6MjA3NTI0NDY4NH0.CoceGOzumiF6aYVGQSWily93snNYh9N9C4p8lrjrTyM';
      
      const success = await window.supabaseRealtimeClient.initialize(supabaseUrl, supabaseKey);
      
      if (success) {
        console.log('✅ SUPABASE: Real-time client initialized successfully');
        console.log('✅ SUPABASE: Supabase client:', window.supabaseRealtimeClient.supabase);
        setupSupabaseEventHandlers();
      } else {
        console.error('❌ SUPABASE: Failed to initialize real-time client');
      }
    } else {
      console.error('❌ SUPABASE: SupabaseRealtimeClient not available');
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

// Setup Supabase real-time event handlers
function setupSupabaseEventHandlers() {
  if (!window.supabaseRealtimeClient) return;
  
  // Set up event handlers
  window.supabaseRealtimeClient.onUserJoined = (user) => {
    console.log('👋 SUPABASE: User joined:', user.user_email);
    // Reload avatars to show new user
    loadCombinedAvatars().catch(err => console.error('Error loading avatars after user joined:', err));
  };
  
  window.supabaseRealtimeClient.onUserLeft = (user) => {
    console.log('👋 SUPABASE: User left:', user.user_email);
    // Reload avatars to hide user
    loadCombinedAvatars().catch(err => console.error('Error loading avatars after user left:', err));
  };
  
  window.supabaseRealtimeClient.onUserUpdated = (user) => {
    console.log('🔄 SUPABASE: User updated:', user.user_email);
    // Update aura color if changed
    if (user.aura_color) {
      updateUserAuraInUI(user.user_email, user.aura_color);
    }
  };
  
  window.supabaseRealtimeClient.onNewMessage = (message) => {
    console.log('💬 SUPABASE: New message:', message);
    // Reload chat history to show new message
    loadChatHistory().catch(err => console.error('Error loading chat after new message:', err));
    
    // Show notification for new message
    if (window.showNotification) {
      window.showNotification(`New message from ${message.user_email}`);
    }
  };
  
  window.supabaseRealtimeClient.onVisibilityChanged = (visibility) => {
    console.log('👁️ SUPABASE: Visibility changed:', visibility.user_email, visibility.is_visible);
    // Reload avatars to reflect visibility change
    loadCombinedAvatars().catch(err => console.error('Error loading avatars after visibility change:', err));
  };
  
  console.log('✅ SUPABASE: Event handlers configured');
}

// CHROME EXTENSION WEBSOCKET FIX: Handle WebSocket messages from background service worker
function handleWebSocketMessage(data) {
  console.log('[WEBSOCKET] Handling message in side panel:', data);
  
  switch (data.type) {
    case 'MESSAGE_NEW':
      console.log('[WEBSOCKET] New message received:', data.message);
      // Reload chat history to show new message
      loadChatHistory().catch(err => console.error('[WEBSOCKET] Error loading chat after new message:', err));
      
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
  
  // NOTE: Removed pageSubscriptionInterval polling
  // Supabase handles reconnection automatically
  
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
        
        console.log(`🔔 SETTINGS: ${notificationType} ${enabled ? 'enabled' : 'disabled'}`);
        
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
    if (!window.supabaseRealtimeClient) {
      console.error('❌ SUPABASE: Real-time client not initialized');
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
      auraColor: user.auraColor || null
    };
    
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
        console.log(`🔍 PROFILE_AVATAR: [BUILD ${EXTENSION_BUILD}] Using stored aura color: ${userAuraColor}`);
      } else {
        // Try to get from real-time presence data (same as message avatars)
        userAuraColor = getLatestAuraColorFromPresence(user.email);
        if (userAuraColor) {
          console.log(`🔍 PROFILE_AVATAR: [BUILD ${EXTENSION_BUILD}] Using real-time aura color: ${userAuraColor}`);
        } else {
          console.log(`🔍 PROFILE_AVATAR: [BUILD ${EXTENSION_BUILD}] No real-time aura color found, will use generated color`);
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
          console.log(`🔍 PROFILE_AVATAR_FIX: Found REAL avatar in UNFILTERED visibility data: ${currentUserInVisibility.avatarUrl}`);
          console.log(`🔍 PROFILE_AVATAR_FIX: Replacing fake avatar: ${realAvatarUrl}`);
          console.log(`🔍 PROFILE_AVATAR_FIX: User found in unfiltered data:`, {
            email: currentUserInVisibility.email,
            userId: currentUserInVisibility.userId,
            avatarUrl: currentUserInVisibility.avatarUrl
          });
          realAvatarUrl = currentUserInVisibility.avatarUrl;
        } else {
          console.log(`🔍 PROFILE_AVATAR_FIX: Current user NOT found in UNFILTERED visibility data`);
          console.log(`🔍 PROFILE_AVATAR_FIX: Looking for: ${user.email}`);
          console.log(`🔍 PROFILE_AVATAR_FIX: Available users:`, window.currentVisibilityDataUnfiltered.active.map(u => ({
            email: u.email,
            userId: u.userId,
            id: u.id
          })));
        }
      } else {
        console.log(`🔍 PROFILE_AVATAR_FIX: No UNFILTERED visibility data available, using auth avatar`);
      }
      
      const userData = {
        id: user.id || user.email,
        userId: user.id || user.email,
        name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
        email: user.email,
        avatarUrl: realAvatarUrl,  // USE THE REAL AVATAR URL FROM DATABASE
        auraColor: userAuraColor // Use aura color from presence API
      };
      
      console.log(`🔍 PROFILE_AVATAR: [BUILD ${EXTENSION_BUILD}] Creating UNIFIED avatar for profile:`, {
        name: userData.name,
        email: userData.email,
        avatarUrl: userData.avatarUrl,
        auraColor: userData.auraColor,
        source: realAvatarUrl === (user.user_metadata?.avatar_url || user.picture) ? 'auth' : 'visibility-data'
      });
      
      // ✅ CREATE UNIFIED AVATAR HTML - SAME AS MESSAGE/VISIBILITY AVATARS
      // CRITICAL: USE SAME SIZE AS VISIBILITY/MESSAGE AVATARS (32px) FOR CONSISTENCY
      const avatarHTML = createUnifiedAvatar(userData, {
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
    
    // Add click handlers after UI update (with small delay to ensure DOM is ready)
    setTimeout(() => {
      addAuraButtonClickHandler();
      addProfileAvatarClickHandler();
      addVisibilitySettingsButtonClickHandler();
    }, 100);
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
async function signInWithGoogle() {
  try {
    debug('Attempting Google sign-in for REAL profile pictures...');
    
    // Use real Google auth for actual profile pictures
    if (realGoogleAuth) {
      const result = await realGoogleAuth.signInWithGoogle();
      debug('Real Google sign-in successful:', result);
      
      // Update UI with the authenticated user
      if (result && result.user) {
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
      
      // Force refresh chat to ensure consistency
      loadChatHistory().then(() => {
        console.log('📡 DELETION: Refreshed chat after cross-profile deletion');
      });
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
  console.log("DOMContentLoaded event fired.");

  try {
    // === Initialize Complete Modern Architecture ===
    console.log('🚀 INIT: Initializing complete modern architecture...');
    await initializeCompleteModernArchitecture();
    console.log('✅ INIT: Complete modern architecture initialized');
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
    // === Initialize Supabase Real-time Client ===
    console.log('🚀 INIT: Initializing Supabase real-time client...');
    await initializeSupabaseRealtimeClient();
    console.log('✅ INIT: Supabase real-time client initialized');
  } catch (error) {
    console.error('❌ INIT: Failed to initialize Supabase real-time client:', error);
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
  setTimeout(() => {
    updateMessageVisualHierarchy();
  }, 100);
  
  // === Add Window Resize Listener for Visual Hierarchy ===
  window.addEventListener('resize', () => {
    setTimeout(() => {
      updateMessageVisualHierarchy();
    }, 100);
  });

  // === Register Auth Providers ===
  authManager.registerProvider('supabase', new SupabaseAuthProvider());
  authManager.registerProvider('metalayer', new MetalayerAuthProvider());
  authManager.registerProvider('offline', new OfflineAuthProvider());
  
  // === Initialize Auth Manager ===
  console.log('Starting auth manager initialization...');
  
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
  console.log("Sidebar JS Loaded");

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
      console.log(`Switching to main tab: ${targetTabId}`);

      // Deactivate all main tabs and content
      mainTabs.forEach(t => t.classList.remove('active'));
      mainTabContents.forEach(c => c.classList.remove('active'));

      // Activate the clicked tab and its corresponding content
      tab.classList.add('active');
      const targetTabContent = document.getElementById(targetTabId);
      if (targetTabContent) {
        targetTabContent.classList.add('active');
        console.log(`Activated content: #${targetTabId}`);
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
      console.log(`Switching to sub-tab: ${targetSubTabId}`);

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
        console.log(`Activated sub-content: #${targetSubTabId}`);
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
          console.log("Community dropdown hidden");
        } else {
          communityDropdownPanel.style.display = 'block';
          console.log("Community dropdown shown");
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
      console.log("Community dropdown closed via button");
    });
  }

  // Close dropdown if clicking outside
  document.addEventListener('click', (event) => {
    if (communityDropdownPanel && communityDropdownPanel.style.display === 'block') {
      if (!communityDropdownPanel.contains(event.target) && 
          !communityDropdownTrigger.contains(event.target)) {
        communityDropdownPanel.style.display = 'none';
        console.log("Community dropdown closed via outside click");
      }
    }
  });

  // --- Sidebar Close Button ---
  if (closeSidebarButton) {
    closeSidebarButton.addEventListener('click', () => {
      console.log("Close sidebar button clicked");
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
      console.log(`Modal opened for ${name}`);
    }

    // Function to close the modal
    function closeModal() {
      modal.style.display = 'none';
      console.log("Modal closed");
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
    console.log('Chat send button clicked');
    requireAuth('send messages', async () => {
      // Check if we're in edit mode
      if (chatInput.dataset.editingMessageId) {
        // Handle edit mode - this will be handled by the edit function's event listeners
        return;
      }
      
      let message = chatInput?.value?.trim();
      if (message) {
        debug(`Sending message: ${message}`);
        console.log('Sending message:', message);
        
        try {
          // Get current user and primary community - use window.currentUser for user
          const result = await chrome.storage.local.get(['primaryCommunity', 'currentCommunity']);
          const user = window.currentUser;
          const communityId = result.primaryCommunity || result.currentCommunity || 'comm-001';
          
          if (user && user.id) {
            try {
              // Get normalized URL for consistency with presence and visibility
              const urlData = await normalizeCurrentUrl();
              const currentUri = urlData.normalizedUrl;
              debug(`Current page URI: ${currentUri}`);
              
              // Check if this is a message with selected content
              let optionalContent = null;
              if (message.startsWith('Commenting on: "')) {
                // Extract the selected content from the pre-populated message
                const match = message.match(/^Commenting on: "(.+)"$/);
                if (match) {
                  optionalContent = match[1];
                  // Remove the prefix from the actual message content
                  message = message.replace(/^Commenting on: ".+":\s*/, '');
                }
              }
              
              // Check if this is a reply or thread
              let parentId = null;
              let threadId = null;
              
              if (chatInput.dataset.replyTo) {
                parentId = chatInput.dataset.replyTo;
                threadId = chatInput.dataset.replyToConversation; // Use the conversation ID as thread ID
                debug(`Reply detected: parentId=${parentId}, threadId=${threadId}`);
                console.log('Reply detected:', { parentId, threadId });
                // Clear the reply data
                delete chatInput.dataset.replyTo;
                delete chatInput.dataset.replyToConversation;
                delete chatInput.dataset.contextMode;
              } else if (chatInput.dataset.threadId) {
                threadId = chatInput.dataset.threadId;
                // Remove the thread prefix from the message
                message = message.replace(/^Starting thread on ".+":\s*/, '');
                // Clear the thread data
                delete chatInput.dataset.threadId;
              }
              
              // Use email for user identification (consistent with presence API)
              const userEmail = await getCurrentUserEmail();
              console.log(`🔍 CHAT_SEND: Sending message for user ${userEmail} in community ${communityId} on URI ${currentUri}`);
              console.log(`🔍 CHAT_SEND: Message content: "${message}"`);
              const response = await api.sendMessage(userEmail, communityId, message, currentUri, parentId, threadId, optionalContent);
              console.log(`✅ CHAT_SEND: Message sent successfully: ${response?.msg?.id || response?.id}`);
              debug(`Message sent successfully: ${response?.msg?.id || response?.id}`);
              console.log('Message sent:', response);
              
              // Send message via Supabase real-time
              await sendMessageViaSupabase(message);
              
              // Add message to chat display - handle both conversation and post responses
              let newPost = null;
              if (response && (response.id || response.msg)) {
                // Check if this is a server response with msg field
                if (response.msg && response.msg.id) {
                  // This is the new server response format with msg field
                  newPost = response.msg;
                } else if (response.posts && response.posts.length > 0) {
                  // This is a conversation response - get the first post
                  newPost = response.posts[0];
                  newPost.conversationId = response.id;
                } else if (response.id) {
                  // This is a post response - use it directly
                  newPost = response;
                }
                
                // Set proper flags for the new post
                newPost.isReply = !!newPost.parentId;
                
                // Store the original community name for this message
                const currentCommunityName = await getPrimaryCommunityName();
                newPost.originalCommunityName = currentCommunityName;
                
                // Ensure the new post has conversation data with empty reactions (new posts shouldn't inherit reactions)
                newPost.conversation = {
                  reactions: [] // New posts start with no reactions
                };
                
                console.log('Adding new post to chat:', newPost);
                console.log('New post conversation data:', newPost.conversation);
                
                await addMessageToChat(newPost);
                console.log('New post added to chat successfully');
                
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
                console.log(`🔍 CHAT_SEND: Resetting lastLoadedUri from ${lastLoadedUri} to null`);
                lastLoadedUri = null;
                
                // Update last message count for polling
                lastMessageCount = document.querySelectorAll('.message').length;
                console.log(`🔍 CHAT_SEND: Updated last message count to ${lastMessageCount}`);
                
                // Force a reload to ensure other users see the new message
                console.log(`🔍 CHAT_SEND: Forcing chat history reload for real-time sync`);
                await loadChatHistory();
                
                // Verify the message is in the database by checking the server response
                console.log(`🔍 CHAT_SEND: Verifying message exists in database...`);
                try {
                  const verifyResponse = await api.getChatHistory('comm-001', null, currentUri);
                  const messageExists = verifyResponse.conversations?.[0]?.posts?.some(post => post.id === newPost.id);
                  console.log(`🔍 CHAT_SEND: Message verification result:`, messageExists ? 'FOUND' : 'NOT FOUND');
                  if (!messageExists) {
                    console.log(`⚠️ CHAT_SEND: Message not found in database, adding additional delay...`);
                    await new Promise(resolve => setTimeout(resolve, 1000));
                  }
                } catch (error) {
                  console.log(`⚠️ CHAT_SEND: Error verifying message in database:`, error);
                }
                
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
  } else {
                console.log('No valid post in response:', response);
                console.log('Response structure:', {
                  hasResponse: !!response,
                  hasId: !!(response && response.id),
                  responseKeys: response ? Object.keys(response) : []
                });
              }
              
              // Clear input and reset height
              console.log(`🔍 CHAT_CLEAR: [BUILD ${EXTENSION_BUILD}] Clearing input field and resetting styling`);
              console.log(`🔍 CHAT_CLEAR: [BUILD ${EXTENSION_BUILD}] Input field current height:`, chatInput.style.height);
              console.log(`🔍 CHAT_CLEAR: [BUILD ${EXTENSION_BUILD}] Input field computed height:`, window.getComputedStyle(chatInput).height);
              console.log(`🔍 CHAT_CLEAR: [BUILD ${EXTENSION_BUILD}] Input field value before clear:`, chatInput.value);
              
              // Clear the input value
              chatInput.value = '';
              
              // Clear context bar and reset input styling
              const contextBar = document.getElementById('context-bar');
              if (contextBar) {
                contextBar.style.display = 'none';
                console.log(`🔍 CHAT_CLEAR: Context bar hidden`);
              }
              chatInput.placeholder = 'Start thread in Public Square';
              chatInput.style.borderColor = '';
              chatInput.style.backgroundColor = '';
              
              // Reset height and overflow properties
              chatInput.style.height = 'auto';
              chatInput.style.maxHeight = 'none';
              chatInput.style.minHeight = 'auto';
              chatInput.style.overflowY = 'hidden';
              console.log(`🔍 CHAT_CLEAR: Input field height set to auto`);
              
              // Force a reflow and then set to natural height
              chatInput.offsetHeight; // Force reflow
              chatInput.style.height = 'auto';
              chatInput.style.maxHeight = '120px'; // Allow expansion up to 120px
              chatInput.style.minHeight = '40px'; // Minimum reasonable height
              console.log(`🔍 CHAT_CLEAR: [BUILD ${EXTENSION_BUILD}] Input field cleared and styling reset`);
              console.log(`🔍 CHAT_CLEAR: [BUILD ${EXTENSION_BUILD}] Final input field height:`, chatInput.style.height);
              console.log(`🔍 CHAT_CLEAR: [BUILD ${EXTENSION_BUILD}] Final computed height:`, window.getComputedStyle(chatInput).height);
              console.log(`🔍 CHAT_CLEAR: [BUILD ${EXTENSION_BUILD}] Input field value after clear:`, chatInput.value);
              console.log(`🔍 CHAT_CLEAR: [BUILD ${EXTENSION_BUILD}] Message field reset completed successfully`);
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
  console.log("Sidebar setup complete");
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
    
    // Get the current tab URL
    const tab = await chrome.tabs.get(tabId);
    if (tab && tab.url) {
      console.log('🔄 TAB_CHANGE: New tab URL:', tab.url);
      debug(`New tab URL: ${tab.url}`);
      
      // Normalize the new URL ONCE at the top
      await normalizeCurrentUrl();
      console.log('🔄 TAB_CHANGE: URL normalized for new tab');
      
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

// Handle tab updates (URL changes)
async function handleTabUpdate(tabId, url) {
  console.log('🔄 TAB_UPDATE: === HANDLING TAB UPDATE ===');
  console.log('🔄 TAB_UPDATE: Tab ID:', tabId, 'URL:', url);
  debug(`Handling tab update for tab: ${tabId}, URL: ${url}`);
  try {
    // CRITICAL FIX: Leave current page BEFORE switching to new URL
    // This prevents "ghost presence" where user appears on old URL for 30 seconds
    if (window.supabaseRealtimeClient) {
      console.log('🚪 TAB_UPDATE: Leaving current page before URL change...');
      await window.supabaseRealtimeClient.leaveCurrentPage();
      console.log('✅ TAB_UPDATE: Left current page successfully');
    }
    
    // Normalize the new URL ONCE at the top
    await normalizeCurrentUrl();
    console.log('🔄 TAB_UPDATE: URL normalized for updated tab');
    
    // Reload chat history for the new URL (uses normalized URL)
    await loadChatHistory();
    // Update visibility list for the new URL (uses normalized URL)
    const result = await chrome.storage.local.get(['activeCommunities']);
    const activeCommunities = result.activeCommunities || ['comm-001'];
    await loadCombinedAvatars(activeCommunities);
    // Start presence tracking for the new URL (uses normalized URL)
    await startPresenceTracking();
    console.log('✅ TAB_UPDATE: Tab update complete');
  } catch (error) {
    console.error('❌ TAB_UPDATE: Error handling tab update:', error);
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
  setTimeout(() => {
    updateMessageVisualHierarchy();
  }, 10);
}

// ===== PRESENCE TRACKING =====
// NOTE: All polling removed - now using Supabase real-time only
// See realtime-presence-handler.js for implementation

let currentPageId = null;

// Start presence tracking for the current page
// NOW USES: RealtimePresenceHandler (no polling!)
async function startPresenceTracking() {
  console.log('🔍 PRESENCE_FUNCTION: === startPresenceTracking() called ===');
  
  try {
    // Get normalized URL data
    const urlData = await normalizeCurrentUrl();
    currentPageId = urlData.pageId;
    
    console.log('🔍 PRESENCE: Starting for page:', currentPageId);
    console.log('🔍 PRESENCE: URL:', urlData.normalizedUrl);
    console.log('🔍 PRESENCE: User:', await getCurrentUserEmail());
    
    // Use new real-time handler (no polling!)
    if (window.realtimePresenceHandler) {
      await window.realtimePresenceHandler.start(currentPageId, urlData.normalizedUrl);
      console.log('✅ PRESENCE: Started via RealtimePresenceHandler');
    } else {
      console.error('❌ PRESENCE: RealtimePresenceHandler not available');
    }
  } catch (error) {
    console.error('❌ PRESENCE: Failed to start:', error);
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
  try {
    if (!currentPageId) {
      console.warn('No current pageId for presence event');
      return;
    }
    
    // Get normalized URL data - SAME AS MESSAGES AND VISIBILITY
    const urlData = await normalizeCurrentUrl();
    const userEmail = await getCurrentUserEmail();
    const userId = await getCurrentUserId();
    
    const response = await fetch(`${METALAYER_API_URL}/v1/presence/event`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-email': userEmail,
        'x-user-id': userId
      },
      body: JSON.stringify({
        pageId: currentPageId,
        kind,
        availability,
        customLabel,
        pageUrl: urlData.rawUrl // Use the raw URL from urlData
      })
    });
    
    if (response.ok) {
      console.log(`✅ PRESENCE: ${kind} event sent successfully`);
      
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
           console.log(`👥 WEBSOCKET: ${kind} event broadcast via background service worker`);
    } else {
      console.warn(`❌ PRESENCE: Failed to send ${kind} event:`, response.status);
    }
  } catch (error) {
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
    console.log(`🔍 URL_NORMALIZE: Normalizing current URL: ${rawUri}`);
    
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
      console.log(`🔍 URL_NORMALIZE: URL unchanged, using cached values`);
      console.log(`🔍 URL_NORMALIZE: Cached urlData:`, JSON.stringify({ rawUrl: currentRawUrl, normalizedUrl: currentNormalizedUrl, pageId: currentPageId }));
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
        console.log(`🔍 URL_CACHE: Using cached result for ${rawUri}: ${cached.pageId}`);
        currentRawUrl = rawUri;
        currentNormalizedUrl = cached.normalizedUrl;
        currentPageId = cached.pageId;
        console.log(`🔍 URL_CACHE: Cache urlData:`, JSON.stringify({ rawUrl: currentRawUrl, normalizedUrl: currentNormalizedUrl, pageId: currentPageId }));
        return { rawUrl: currentRawUrl, normalizedUrl: currentNormalizedUrl, pageId: currentPageId };
      }
    }
    
    console.log(`🔍 URL_NORMALIZE: Calling backend API for ${rawUri}`);
    
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
    
    console.log(`✅ URL_NORMALIZE: Backend API result - Raw: ${rawUri}, Normalized: ${currentNormalizedUrl}, PageId: ${currentPageId}`);
    console.log(`🔍 URL_NORMALIZE: Returning urlData:`, JSON.stringify({ rawUrl: currentRawUrl, normalizedUrl: currentNormalizedUrl, pageId: currentPageId }));
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
    
    console.log(`🔄 URL_NORMALIZE: Using fallback for ${rawUri}: ${fallbackPageId}`);
    console.log(`🔍 URL_NORMALIZE: Fallback urlData:`, JSON.stringify({ rawUrl: currentRawUrl, normalizedUrl: currentNormalizedUrl, pageId: currentPageId }));
    return { rawUrl: currentRawUrl, normalizedUrl: currentNormalizedUrl, pageId: currentPageId };
  }
}

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
  console.log("=== AVATAR DIAGNOSTIC ===");
  console.log("Current user:", window.currentUser);
  console.log("User avatar_url:", window.currentUser?.user_metadata?.avatar_url);
  console.log("Profile avatar container:", document.getElementById("user-avatar-container"));
  console.log("Profile avatar HTML:", document.getElementById("user-avatar-container")?.innerHTML);
  console.log("AuthManager user:", authManager.getCurrentUser());
};

window.debugVisibility = function() {
  console.log("=== VISIBILITY DIAGNOSTIC ===");
  console.log("Current visibility data:", window.currentVisibilityData);
  console.log("Visibility timer:", window.visibilityUpdateTimer);
  console.log("User elements:", document.querySelectorAll(".user-item"));
  console.log("Status elements:", document.querySelectorAll(".user-status"));
  console.log("Status texts:", Array.from(document.querySelectorAll(".user-status")).map(el => el.textContent));
};

window.testTimeUpdate = function() {
  console.log("=== MANUAL TIME UPDATE TEST ===");
  updateVisibilityTimes();
  console.log("Time update triggered manually");
};

window.forceAvatarRefresh = function() {
  console.log("=== FORCE AVATAR REFRESH ===");
  const user = window.currentUser;
  if (user) {
    updateUI(user);
    console.log("Avatar refresh triggered");
  } else {
    console.log("No current user found");
  }
};

window.restartVisibilityTimer = function() {
  console.log("=== RESTART VISIBILITY TIMER ===");
  if (window.visibilityUpdateTimer) {
    clearInterval(window.visibilityUpdateTimer);
  }
  window.visibilityUpdateTimer = setInterval(updateVisibilityTimes, 10000);
  console.log("Timer restarted");
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
  console.log(`🔄 VISIBILITY: Updating times for ${visibleUsers.length} users`);
  console.log('🔄 VISIBILITY: Visible users:', visibleUsers.map(u => ({ name: u.name, enterTime: u.enterTime })));
  
  // Find all user status elements in the DOM and update their times
  const userElements = document.querySelectorAll('.user-item');
  console.log('🔄 VISIBILITY: Found', userElements.length, 'user elements in DOM');
  
  userElements.forEach((element, index) => {
    console.log(`🔄 VISIBILITY: Processing element ${index}:`, element);
    
    // CRITICAL FIX: Use data-user-id to find the correct user, NOT array index!
    // Array index doesn't work because window.currentVisibilityData.active includes ALL users
    // but the DOM only shows FILTERED users (excluding current user)
    const userId = element.getAttribute('data-user-id');
    const userName = element.getAttribute('data-user-name');
    console.log(`🔄 VISIBILITY: Element ${index} - userId: ${userId}, userName: ${userName}`);
    
    // Find the matching user in the visibility data by userId
    const user = visibleUsers.find(u => u.userId === userId || u.email === userId || u.id === userId);
    
    if (!user) {
      console.log(`🔄 VISIBILITY: ⚠️ Could not find user data for userId: ${userId}`);
      return;
    }
    
    console.log(`🔄 VISIBILITY: Found matching user:`, { name: user.name, enterTime: user.enterTime, userId: user.userId });
    
    // FIX: Visibility avatars use .item-status NOT .user-status!
    const statusElement = element.querySelector('.item-status');
    console.log(`🔄 VISIBILITY: Status element for ${userName}:`, statusElement);
    
    if (statusElement && user.enterTime) {
      const oldText = statusElement.textContent;
      const newStatusText = formatTimeDisplay(user.enterTime);
      statusElement.textContent = newStatusText;
      console.log(`🔄 VISIBILITY: ✅ Updated time for ${user.name}: "${oldText}" → "${newStatusText}"`);
    } else {
      console.log(`🔄 VISIBILITY: ⚠️ Skipping user ${user.name} - no status element (${!!statusElement}) or enterTime (${!!user.enterTime})`);
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

// ===== MOCK DATA FOR TESTING MULTI-USER SCENARIOS =====
// Use these functions in the browser console to test different user perspectives

// NO MOCK USERS - Only real data

// NO MOCK MESSAGES - Only real data

// NO MOCK TESTING - Only real data
