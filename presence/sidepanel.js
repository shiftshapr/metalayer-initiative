// API endpoint redirection is now handled by APIModule.js
// The MetaLayerAPI class in APIModule.js handles all API redirection logic
// This maintains modular architecture while providing the same functionality

// Initialize all modern architecture components (FROM COMP)
let stateManager = null;
let eventBus = null;
let lifecycleManager = null;
let supabaseRealtimeClient = null;

// Initialize real Google auth for actual profile pictures
let realGoogleAuth = null;

// Initialize Auth Manager (COMP METHOD)
let authManager;

// Wait for AuthManager to be available
if (typeof AuthManager !== 'undefined') {
  authManager = new AuthManager();
  window.authManager = authManager;
} else {
  console.error('❌ AUTH: AuthManager class not available');
  // Create fallback authManager
  authManager = {
    initialize: () => Promise.resolve(true),
    getCurrentUser: () => Promise.resolve(null),
    onAuthStateChange: (callback) => callback('SIGNED_OUT', null)
  };
  window.authManager = authManager;
}

// API is initialized by APIModule.js (COMP METHOD)

// Visibility refresh flag
let isRefreshingVisibility = false;

async function initializeCompleteModernArchitecture() {
  try {
    // Prevent multiple initializations (using StateManager's flag)
    if (stateManager && await stateManager.get('extension.isInitialized')) {
      console.log('🔄 MODERN: Architecture already initialized, skipping');
      return true;
    }
    
    console.log('🚀 MODERN: Initializing complete modern architecture...');
    
  // Check if StateManager is available
  if (typeof StateManager === 'undefined') {
    console.log('⚠️ MODERN: StateManager not available, waiting for it to load...');
    // Wait for StateManager to be loaded
    return new Promise((resolve) => {
      const checkStateManager = () => {
        if (typeof StateManager !== 'undefined') {
          console.log('✅ MODERN: StateManager now available');
          resolve(true);
        } else {
          setTimeout(checkStateManager, 50);
        }
      };
      checkStateManager();
    });
  }
    
    // Initialize StateManager
    stateManager = new StateManager();
    await stateManager.initialize({
      userAvatarBgColor: window.AVATAR_FALLBACK_COLOR,
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
      // COMP METHOD: No heartbeat intervals - removed per SD4 protocols
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
    
    // === SETUP MODERN EVENT HANDLING (FROM COMP) ===
    setupModernEventHandling();
    
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
    console.log('📡 MODERN: Cross-profile aura changed:', data.userId, data.color);
    updateUserAuraInUI(data.userId, data.color);
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



async function migrateFromChromeStorage() {
  console.log('🔄 MODERN: Migrating from Chrome Storage...');
  
  try {
    // Get individual state values like COMP method
    const userAvatarBgColor = await getState('userAvatarBgColor');
    const googleUser = await getState('googleUser');
    const supabaseUser = await getState('supabaseUser');
    const metalayerUser = await getState('metalayerUser');
    const activeCommunities = await getState('activeCommunities');
    const primaryCommunity = await getState('primaryCommunity');
    const currentCommunity = await getState('currentCommunity');
    const communities = await getState('communities');
    const theme = await getState('theme');
    const debugMode = await getState('debugMode');
    const customAvatarColor = await getState('customAvatarColor');
    const pendingMessageContent = await getState('pendingMessageContent');
    const pendingMessageUri = await getState('pendingMessageUri');
    const pendingVisibilityContent = await getState('pendingVisibilityContent');
    const pendingVisibilityUri = await getState('pendingVisibilityUri');
    
    const result = {
      userAvatarBgColor,
      googleUser,
      supabaseUser,
      metalayerUser,
      activeCommunities,
      primaryCommunity,
      currentCommunity,
      communities,
      theme,
      debugMode,
      customAvatarColor,
      pendingMessageContent,
      pendingMessageUri,
      pendingVisibilityContent,
      pendingVisibilityUri
    };
    
    for (const [key, value] of Object.entries(result)) {
      if (value !== undefined && stateManager) {
        try {
          await stateManager.setState(key, value);
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

async function getState(key) {
  if (stateManager && typeof stateManager.get === 'function') {
    try {
      return await stateManager.get(key);
    } catch (error) {
      console.error('❌ MODERN: Error getting state from StateManager:', error);
      // No fallback - StateManager is required
      console.error('❌ MODERN: StateManager is required for state management');
      return null;
    }
  } else {
    console.error('❌ MODERN: StateManager is required for state management');
    return null;
  }
}


async function setState(key, value) {
  if (stateManager) {
    try {
      await stateManager.setState(key, value);
      console.log('🔄 MODERN: State updated:', key, '=', value);
    } catch (error) {
      console.error('❌ MODERN: Error setting state in StateManager:', error);
      // No fallback - StateManager is required
      console.error('❌ MODERN: StateManager is required for state management');
    }
  } else {
    // No fallback - StateManager is required
    console.error('❌ MODERN: StateManager is required for state management');
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
    if (typeof window.setupSupabaseEventHandling === 'function') {
      await window.setupSupabaseEventHandling();
    }
    console.log('✅ MODERN: Supabase cross-profile communication setup');
  } else {
    console.warn('⚠️ MODERN: Supabase not available, cross-profile communication limited');
  }
}






// ===== HELPER FUNCTIONS: Time Display Formatting =====
function formatTimeDisplay(enterTime) {
  if (!enterTime) return 'offline';
  const enter = new Date(enterTime);
  const now = new Date();
  const diffMs = now - enter;
  const diffMins = Math.floor(diffMs / 60000);
  
  if (diffMins < 1) return 'Now';
  if (diffMins < 60) return `Online for ${diffMins} min${diffMins !== 1 ? 's' : ''}`;
  
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `Online for ${diffHours} hour${diffHours !== 1 ? 's' : ''}`;
  
  return enter.toLocaleTimeString();
}

function formatLastSeenDisplay(lastSeen) {
  if (!lastSeen) return 'offline';
  const seen = new Date(lastSeen);
  const now = new Date();
  const diffMs = now - seen;
  const diffMins = Math.floor(diffMs / 60000);
  
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} min${diffMins !== 1 ? 's' : ''} ago`;
  
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
  
  return seen.toLocaleTimeString();
}

// ===== REMOVED: updateVisibleTab moved to VisibilityManager.js per SD4 architecture =====
// This function has been consolidated into features/VisibilityManager.js
// All visibility tab logic is now in the VisibilityManager module
async function updateVisibleTab_DEPRECATED(avatars) {
  console.warn('⚠️ DEPRECATED: updateVisibleTab in sidepanel.js is deprecated. Use VisibilityManager.js version.');
  // Delegate to VisibilityManager version if available
  if (window.updateVisibleTab && window.updateVisibleTab !== updateVisibleTab_DEPRECATED) {
    return await window.updateVisibleTab(avatars);
  }
  console.error('❌ VISIBILITY: updateVisibleTab not available from VisibilityManager');
}

  // ROOT CAUSE FIX: Don't define updateVisibleTab here if VisibilityManager already has it
  // VisibilityManager.js loads before sidepanel.js, so it should already be available
  // Only define this as a fallback if VisibilityManager failed to load
  if (!window.updateVisibleTab) {
    console.warn('⚠️ VISIBILITY: VisibilityManager.updateVisibleTab not found - defining fallback');
    
    async function updateVisibleTab(avatars) {
      // Wait a moment for VisibilityManager to load
      let attempts = 0;
      while (attempts < 10 && (!window.updateVisibleTab || window.updateVisibleTab === updateVisibleTab)) {
        await new Promise(resolve => setTimeout(resolve, 100));
        attempts++;
      }

      // If VisibilityManager version exists now, use it
      if (window.updateVisibleTab && window.updateVisibleTab !== updateVisibleTab) {
        return await window.updateVisibleTab(avatars);
      }
      
      // Fallback: Minimal implementation (should not happen)
      console.error('❌ VISIBILITY: Fallback updateVisibleTab called - VisibilityManager failed to load');
      const visibleTab = document.getElementById('visibility-tab');
      if (!visibleTab) {
        console.error('❌ VISIBILITY: visibility-tab not found');
        return;
      }
      // Don't show "Loading" - just leave it empty
      if (visibleTab.innerHTML.trim() === '' || visibleTab.innerHTML.includes('Loading visibility data')) {
        visibleTab.innerHTML = '';
      }
    }
    
    window.updateVisibleTab = updateVisibleTab;
  }

// ===== COMP METHOD: Message handling moved to CanopiModule.js =====
// The addMessageToChat function has been moved to CanopiModule.js
// to follow proper modular architecture principles

// ===== REMOVED: updateVisibleTab moved to VisibilityManager.js per SD4 architecture =====
// updateVisibleTab is now exported from features/VisibilityManager.js
// Only set if VisibilityManager hasn't already set it
if (!window.updateVisibleTab) {
  window.updateVisibleTab = updateVisibleTab; // Fallback delegate
}

// ===== COMP METHOD: Real-time Aura Color Change Handler =====
// Handles aura color changes from real-time updates (presence or broadcast)
window.handleAuraChange = async function(auraChangeData) {
  console.log('🎨 COMP METHOD: handleAuraChange called:', auraChangeData);
  
  try {
    const { userId, auraColor, source } = auraChangeData;
    
    if (!userId || !auraColor) {
      console.warn('⚠️ COMP METHOD: Invalid aura change data:', auraChangeData);
      return;
    }
    
    console.log(`🎨 COMP METHOD: Processing aura color change for user ${userId}: ${auraColor} (source: ${source})`);
    
    // COMP METHOD: Update visibility data immediately (priority 1)
    // COMP METHOD: Use aura_color (snake_case) to match COMP standard
    if (window.currentVisibilityDataUnfiltered?.active) {
      const userInVisibility = window.currentVisibilityDataUnfiltered.active.find(u => 
        String(u.id || u.userId || u.user_id) === String(userId)
      );
      if (userInVisibility) {
        userInVisibility.aura_color = auraColor;
        console.log('✅ COMP METHOD: Updated aura color in unfiltered visibility data');
      }
    }
    
    if (window.currentVisibilityData?.active) {
      const userInVisibility = window.currentVisibilityData.active.find(u => 
        String(u.id || u.userId || u.user_id) === String(userId)
      );
      if (userInVisibility) {
        userInVisibility.aura_color = auraColor;
      }
    }
    
    // COMP METHOD: Update window.currentUser if it's the current user
    if (window.currentUser && (window.currentUser.id || window.currentUser.user_id) === String(userId)) {
      window.currentUser.aura_color = auraColor;
      console.log('✅ COMP METHOD: Updated window.currentUser.aura_color');
    }
    
    // COMP METHOD: Refresh all message avatars to propagate aura color
    if (typeof window.refreshAllMessageAvatars === 'function') {
      console.log('🔄 COMP METHOD: Refreshing all message avatars with new aura color');
      await window.refreshAllMessageAvatars();
    }
    
    // COMP METHOD: Refresh visibility avatars using updated data (don't re-fetch from DB)
    // COMP METHOD: Call updateVisibleTab directly with updated visibility data to avoid DB delay
    if (window.currentVisibilityDataUnfiltered?.active && typeof window.updateVisibleTab === 'function') {
      console.log('🔄 COMP METHOD: Updating visible tab with refreshed aura color data');
      // COMP METHOD: Use the updated visibility data directly (already has new aura color)
      await window.updateVisibleTab(window.currentVisibilityDataUnfiltered.active);
    } else if (typeof refreshVisibilityAvatars === 'function') {
      console.log('🔄 COMP METHOD: Refreshing visibility avatars with new aura color (fallback)');
      await refreshVisibilityAvatars();
    }
    
    // COMP METHOD: Refresh profile avatar if it's the current user
    // COMP METHOD: Skip visibility refresh since we already called updateVisibleTab above
    if (window.currentUser && (window.currentUser.id || window.currentUser.user_id) === String(userId)) {
      if (typeof window.updateUserAuraInUI === 'function') {
        console.log('🔄 COMP METHOD: Refreshing profile avatar for current user');
        await window.updateUserAuraInUI(userId, auraColor);
      }
    }
    
    console.log('✅ COMP METHOD: Aura color propagation complete for user:', userId);
  } catch (error) {
    console.error('❌ COMP METHOD: Error in handleAuraChange:', error);
  }
};

// ===== ORCHESTRATION FUNCTION: refreshVisibilityAvatars =====
async function refreshVisibilityAvatars() {
  // Prevent multiple simultaneous refreshes
  if (isRefreshingVisibility) {
    console.log('🔄 REFRESH_VISIBILITY: Already refreshing, skipping duplicate call');
    return;
  }
  
  isRefreshingVisibility = true;
  console.log('🔄 REFRESH_VISIBILITY: === STARTING VISIBILITY REFRESH ===');
  
  try {
    // CRITICAL FIX: Use window.supabase for database queries (not supabaseRealtimeClient)
    const client = window.supabase;
    const pageId = window.currentUrlData?.pageId || currentPageId;
    
    console.log('🔄 REFRESH_VISIBILITY: Client available:', !!client);
    console.log('🔄 REFRESH_VISIBILITY: Page ID:', pageId);
    console.log('🔄 REFRESH_VISIBILITY: Current URL data:', window.currentUrlData);
    
    if (client && pageId) {
      console.log('🔄 REFRESH_VISIBILITY: === STARTING ENHANCED VISIBILITY REFRESH ===');
      
      // COMP METHOD: Use client.getPageUsers() exactly like CommunitiesModule.js does
      // This ensures consistency with COMP implementation
      const client = window.supabaseRealtimeClient || window.supabase;
      if (!client || typeof client.getPageUsers !== 'function') {
        console.error('❌ REFRESH_VISIBILITY: Client or getPageUsers not available');
        return [];
      }
      
      // COMP METHOD: Before fetching, store current aura colors from visibility data
      // This ensures we preserve aura color updates that haven't been saved to DB yet
      // COMP METHOD: Exact same filter as CommunitiesModule for functional parity
      const auraColorCache = {};
      if (window.currentVisibilityDataUnfiltered?.active) {
        window.currentVisibilityDataUnfiltered.active.forEach(user => {
          const userId = String(user.id || user.userId || user.user_id);
          const auraColor = user.aura_color; // COMP METHOD: Use aura_color (snake_case)
          // COMP METHOD: Accept any valid aura color (including those that might be temporarily set)
          if (userId && auraColor && auraColor.trim() !== '') {
            auraColorCache[userId] = auraColor;
            console.log(`🔍 COMP DEBUG: Cached aura color for ${userId}: ${auraColor}`);
          }
        });
      }
      
      // COMP METHOD: Also check window.currentUser for current user's aura color
      // This ensures real-time updates to current user are preserved
      if (window.currentUser) {
        const currentUserId = String(window.currentUser.id || window.currentUser.user_id);
        const currentUserAuraColor = window.currentUser.aura_color;
        if (currentUserId && currentUserAuraColor && currentUserAuraColor.trim() !== '') {
          auraColorCache[currentUserId] = currentUserAuraColor;
          console.log(`🔍 COMP DEBUG: Cached aura color from currentUser for ${currentUserId}: ${currentUserAuraColor}`);
        }
      }
      
      console.log('🌐 REFRESH_VISIBILITY: Using COMP method - client.getPageUsers()');
      let users = [];
      try {
        users = await client.getPageUsers(pageId);
        console.log('✅ REFRESH_VISIBILITY: COMP method returned users:', users.length);
        console.log('👁️ REFRESH_VISIBILITY: Users:', users.map(u => `${u.user_id || u.user_email} (is_active:${u.is_active} status:${u.status})`));
      } catch (compError) {
        console.error('❌ REFRESH_VISIBILITY: COMP method failed:', compError);
        return [];
      }
      
      if (users && users.length > 0) {
        console.log('🔄 REFRESH_VISIBILITY: Processing enhanced query results...');
        
        // Use AvatarUtils for consistent avatar URL fetching
        const usersWithAvatars = await Promise.all(users.map(async (user) => {
          let avatarUrl = null;
          const userId = user.id || user.user_id || null;
          let userName = user.name || 'Unknown';
          let userHandle = user.handle || 'unknown';
          let avatarSource = 'none';
          
          // COMP METHOD: Skip known invalid UUIDs to prevent API calls
          const knownInvalidUUIDs = [
            '18ad77cb-222e-4485-a720-db39981a4099',
            '41266409-84e9-439e-b1b3-df44d0797581', 
            '60524d7d-da7d-4216-ba3b-475becaa2527',
            '6c89ce15-c4a4-45b7-82f8-9dae06418f00'
          ];
          
          if (userId && knownInvalidUUIDs.includes(userId)) {
            console.log(`⚠️ REFRESH_VISIBILITY: Skipping known invalid UUID ${userId}`);
            return {
              userId: userId,
              name: userName,
              handle: userHandle,
              avatarUrl: 'https://lh3.googleusercontent.com/a/default-user=s96-c',
              aura_color: '#ffffff', // COMP METHOD: Use aura_color (snake_case)
              isActive: user.is_active || false,
              enterTime: user.enter_time || null,
              lastSeen: user.last_seen || new Date().toISOString(),
              status: 'online'
            };
          }
          
          try {
            // Use AvatarUtils for consistent avatar URL fetching
            if (window.AvatarUtils) {
              const avatarData = await window.AvatarUtils.getAvatarUrl(user, 'visibility');
              avatarUrl = avatarData.avatarUrl;
              userName = avatarData.userName;
              avatarSource = avatarData.source;
            } else {
              // Fallback if AvatarUtils not available
              avatarUrl = user.avatar_url || null;
              userName = user.name || 'Unknown';
            }
          } catch (error) {
            console.error('❌ REFRESH_VISIBILITY: Error getting avatar for user:', userId, error);
          }
          
          // COMP METHOD: Preserve status from backend API response (via COMP client.getPageUsers)
          // Backend calculates status based on dual cutoff times (30s for active, 24h for recently seen)
          // COMP already preserves status field, so use it directly
          const finalStatus = user.status || 
                              (user.isActive !== undefined ? (user.isActive ? 'online' : 'recently_seen') :
                              (user.is_active ? 'online' :
                              (user.lastSeen || user.last_seen ? 'recently_seen' : 'offline')));
          
          // COMP METHOD: Map from COMP format to visibility format
          // COMP returns: { user_email, user_id, is_active, last_seen, enter_time, status, isActive, enterTime, lastSeen, name, avatar_url, aura_color }
          // COMP METHOD: Prioritize cached aura color (from real-time updates) over DB value
          // COMP METHOD: Use string normalization for reliable cache lookup
          const normalizedUserId = String(userId);
          const cachedAuraColor = auraColorCache[normalizedUserId];
          const dbAuraColor = user.aura_color; // COMP METHOD: COMP uses aura_color (snake_case) from DB
          const finalAuraColor = cachedAuraColor || dbAuraColor || window.AVATAR_FALLBACK_COLOR;
          
          // COMP METHOD: Always prefer cached color if it exists (real-time updates take precedence)
          if (cachedAuraColor) {
            if (cachedAuraColor !== dbAuraColor) {
              console.log(`🔍 COMP DEBUG: Using cached aura color for ${normalizedUserId}: ${cachedAuraColor} (DB had: ${dbAuraColor || 'none'})`);
            } else {
              console.log(`🔍 COMP DEBUG: Cached and DB aura colors match for ${normalizedUserId}: ${cachedAuraColor}`);
            }
          }
          
          return {
            userId: user.id || user.user_id || 'unknown',
            handle: userHandle,
            name: userName,
            id: userId,
            avatarUrl: avatarUrl,
            aura_color: finalAuraColor, // COMP METHOD: Use aura_color (snake_case) to match COMP
            // ROOT CAUSE FIX: Use isActive from COMP response (preserved from backend)
            isActive: user.isActive !== undefined ? user.isActive : (user.is_active !== undefined ? user.is_active : false),
            // ROOT CAUSE FIX: Include enterTime for "Online for X" display
            enterTime: user.enterTime || user.enter_time || user.lastSeen || user.last_seen,
            lastSeen: user.lastSeen || user.last_seen,
            // ROOT CAUSE FIX: Use status from COMP response (preserved from backend)
            status: user.status || finalStatus
          };
        }));
        
        console.log('🔄 REFRESH_VISIBILITY: Processed users with avatars:', usersWithAvatars.length);
        
        // Update visibility using the VisibilityManager
        if (typeof window.updateVisibleTab === 'function') {
          await window.updateVisibleTab(usersWithAvatars);
        } else {
          console.log('❌ REFRESH_VISIBILITY: updateVisibleTab function not available');
        }
      } else {
        console.log('👁️ REFRESH_VISIBILITY: No users found for page');
        // Clear visibility if no users
        if (typeof window.updateVisibleTab === 'function') {
          await window.updateVisibleTab([]);
        }
      }
    } else {
      console.log('❌ REFRESH_VISIBILITY: Missing client or pageId');
    }
  } catch (error) {
    console.error('❌ REFRESH_VISIBILITY: Error during visibility refresh:', error);
  } finally {
    isRefreshingVisibility = false;
    console.log('🔄 REFRESH_VISIBILITY: === VISIBILITY REFRESH COMPLETE ===');
  }
}

// CRITICAL FIX: Expose refreshVisibilityAvatars globally for real-time handler
window.refreshVisibilityAvatars = refreshVisibilityAvatars;


// ===== ORCHESTRATION FUNCTION: getCurrentPageUri =====
async function getCurrentPageUri() {
  try {
    // Get the active tab
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    const uri = tab && tab.url ? tab.url : null;
    console.log('Current page URI:', uri);
    
    // COMP METHOD: Chrome internal pages work normally (like COMP)
    if (uri && (uri.startsWith('chrome://') || uri.startsWith('chrome-extension://'))) {
      console.log('🔍 PAGE_ID: Detected Chrome internal page, using normal processing');
      // Continue with normal processing like COMP method
    }
    
    return uri;
  } catch (error) {
    console.error('Failed to get current page URI:', error);
    return null;
  }
}

// ===== ORCHESTRATION FUNCTION: normalizeCurrentUrl =====
async function normalizeCurrentUrl() {
  try {
    const rawUri = await window.getCurrentPageUri();
    console.log(`URL_NORMALIZE: Normalizing current URL: ${rawUri}`);
    
    // Use window.normalizeUrl if available (from UIManager)
    if (typeof window.normalizeUrl === 'function') {
      const urlData = await window.normalizeUrl(rawUri);
      console.log(`URL_NORMALIZE: Normalized URL data:`, urlData);
      return urlData;
    } else {
      console.log('❌ URL_NORMALIZE: window.normalizeUrl not available');
      // Fallback - create basic URL data
      return {
        rawUrl: rawUri,
        normalizedUrl: rawUri,
        pageId: rawUri.replace(/[^a-zA-Z0-9]/g, '_')
      };
    }
  } catch (error) {
    console.error('❌ URL_NORMALIZE: Error normalizing URL:', error);
    return {
      rawUrl: window.location.href,
      normalizedUrl: window.location.href,
      pageId: window.location.href.replace(/[^a-zA-Z0-9]/g, '_')
    };
  }
}

// ===== ORCHESTRATION: Profile menu functions moved to ProfileManager.js =====
// These functions are now in ProfileManager.js and exposed globally

// ===== ORCHESTRATION FUNCTION: updateUI (EXACT COMP COPY) =====
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
    // SD2 COMP MIMETIC FIX: Get avatar from StateManager that's already working
    let avatarUrl = user.avatarUrl || user.user_metadata?.avatar_url;
    if (!avatarUrl) {
      // Try to get from StateManager
      const storedUser = window.getState ? window.getState('supabaseUser') : null;
      const storedSession = window.getState ? window.getState('supabaseSession') : null;
      
      if (storedUser && storedUser.picture) {
        avatarUrl = storedUser.picture;
        console.log('🔐 UPDATE_UI: Using avatar from supabaseUser:', avatarUrl);
      } else if (storedSession && storedSession.user && storedSession.user.picture) {
        avatarUrl = storedSession.user.picture;
        console.log('🔐 UPDATE_UI: Using avatar from supabaseSession:', avatarUrl);
      }
    }
    
    // ROOT CAUSE FIX: Preserve existing UUID from window.currentUser (always a UUID from AppUser table)
    // user.id might be from Supabase auth (Google ID), so don't use it - AuthModule fetches AppUser UUID
    const existingUuid = window.currentUser?.id;
    
    window.currentUser = {
      id: existingUuid || null, // Keep existing UUID if set, otherwise null (AuthModule will fetch it)
      user_id: existingUuid || null,
      email: user.email,
      name: user.user_metadata?.full_name || user.email,
      auraColor: user.auraColor || null,
      avatarUrl: avatarUrl,
      communityId: 'comm-001'
    };
    
    // User is logged in - show user info
    console.log('[UPDATE_UI] Setting userInfoDiv display to flex');
    if (userInfoDiv) {
      userInfoDiv.style.display = 'flex';
      console.log('[UPDATE_UI] userInfoDiv.style.display set to:', userInfoDiv.style.display);
    }
    
    console.log('[UPDATE_UI] Setting userMenuName text');
    if (userMenuName) {
      // COMP METHOD: Display user name instead of email
      const displayName = user.user_metadata?.full_name || user.name || user.email?.split('@')[0] || 'User';
      userMenuName.textContent = displayName;
      console.log('[UPDATE_UI] userMenuName.textContent set to:', userMenuName.textContent);
    }
    
    console.log('[UPDATE_UI] Setting up user avatar using UNIFIED createUnifiedAvatar()');
    if (userAvatarContainer) {
      // Use UNIFIED avatar system for profile avatar - SAME CODE AS MESSAGE/VISIBILITY AVATARS
      // IMPORTANT: Get the user's aura color using the same logic as message avatars
      let userAuraColor = null;
      
      // COMP METHOD: Get database aura color first, not stored white color
      // COMP METHOD: Use aura_color (snake_case) to match COMP standard
      // Try to get from visibility data (database colors)
      if (window.currentVisibilityDataUnfiltered && window.currentVisibilityDataUnfiltered.active) {
        const userInVisibility = window.currentVisibilityDataUnfiltered.active.find(
          u => u.email === user.email || u.userId === user.email || u.id === user.id
        );
        if (userInVisibility && userInVisibility.aura_color && userInVisibility.aura_color !== window.AVATAR_FALLBACK_COLOR) {
          userAuraColor = userInVisibility.aura_color;
          console.log(`PROFILE_AVATAR: Using database aura color: ${userAuraColor}`);
        }
      }
      
      // Fallback to stored aura color only if no database color found
      // COMP METHOD: Use aura_color (snake_case) to match COMP standard
      if (!userAuraColor && window.currentUser && window.currentUser.aura_color && window.currentUser.aura_color !== null && window.currentUser.aura_color !== 'null' && window.currentUser.aura_color !== window.AVATAR_FALLBACK_COLOR) {
        userAuraColor = window.currentUser.aura_color;
        console.log(`PROFILE_AVATAR: Using stored aura color: ${userAuraColor}`);
      } else if (!userAuraColor) {
      // Try to get from real-time presence data (same as message avatars)
      try {
        userAuraColor = getLatestAuraColorFromPresence(user.email);
        if (userAuraColor) {
          console.log(`PROFILE_AVATAR: Using real-time aura color: ${userAuraColor}`);
        } else {
          console.log(`PROFILE_AVATAR: No real-time aura color found, will use generated color`);
        }
      } catch (error) {
        console.error(`PROFILE_AVATAR: Error getting aura color from presence: ${error}`);
        userAuraColor = null;
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
          console.log(`PROFILE_AVATAR_FIX: Found REAL avatar in UNFILTERED visibility data: ${currentUserInVisibility.avatarUrl}`);
          console.log(`PROFILE_AVATAR_FIX: Replacing fake avatar: ${realAvatarUrl}`);
          realAvatarUrl = currentUserInVisibility.avatarUrl;
        } else {
          console.log(`PROFILE_AVATAR_FIX: Current user NOT found in UNFILTERED visibility data`);
          console.log(`PROFILE_AVATAR_FIX: Looking for: ${user.email}`);
          console.log(`PROFILE_AVATAR_FIX: Available users:`, window.currentVisibilityDataUnfiltered.active.map(u => ({
            email: u.email,
            userId: u.userId,
            id: u.id
          })));
          
          // PROFILE_AVATAR_FIX: Use auth avatar as fallback
          if (user.avatarUrl && user.avatarUrl !== 'https://lh3.googleusercontent.com/a/default-user=s96-c') {
            console.log(`PROFILE_AVATAR_FIX: Using auth avatar as fallback: ${user.avatarUrl}`);
            realAvatarUrl = user.avatarUrl;
          }
        }
      } else {
        console.log(`PROFILE_AVATAR_FIX: No UNFILTERED visibility data available, using auth avatar`);
      }
      
      const userData = {
        id: user.id,
        user_id: user.id,
        userId: user.id,
        name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
        email: user.email,
        avatarUrl: realAvatarUrl,  // USE THE REAL AVATAR URL FROM DATABASE
        aura_color: userAuraColor || window.AVATAR_FALLBACK_COLOR // COMP METHOD: Use aura_color (snake_case) to match COMP
      };
      
      // ROOT CAUSE FIX: Ensure auraColor (camelCase) is set, prioritizing visibility data
      // Priority: 1) visibility data, 2) user object (camelCase), 3) user object (snake_case), 4) fallback
      if (!userData.auraColor) {
        // Try visibility data first (most reliable)
        if (userAuraColor) {
          userData.auraColor = userAuraColor;
        }
        // Then try userData.aura_color (snake_case)
        else if (userData.aura_color && userData.aura_color !== window.AVATAR_FALLBACK_COLOR) {
          userData.auraColor = userData.aura_color;
        }
        // Then try window.currentUser
        else if (window.currentUser?.auraColor) {
          userData.auraColor = window.currentUser.auraColor;
        }
        else if (window.currentUser?.aura_color) {
          userData.auraColor = window.currentUser.aura_color;
        }
        // Fallback to generated color
        else {
          userData.auraColor = userAuraColor || window.AVATAR_FALLBACK_COLOR;
        }
      }
      
      // ROOT CAUSE FIX: Wait for visibility data if not available yet (prevent white flash)
      if (userData.auraColor === window.AVATAR_FALLBACK_COLOR && (!window.currentVisibilityDataUnfiltered || !window.currentVisibilityDataUnfiltered.active)) {
        console.log('⚠️ PROFILE_AVATAR: Visibility data not loaded yet, waiting...');
        // Wait a moment for visibility data to load, then refresh
        setTimeout(async () => {
          if (window.currentVisibilityDataUnfiltered && window.currentVisibilityDataUnfiltered.active) {
            const currentUserInVisibility = window.currentVisibilityDataUnfiltered.active.find(
              u => u.email === user.email || u.userId === user.id || u.id === user.id
            );
            if (currentUserInVisibility && (currentUserInVisibility.auraColor || currentUserInVisibility.aura_color)) {
              const correctAuraColor = currentUserInVisibility.auraColor || currentUserInVisibility.aura_color;
              console.log(`✅ PROFILE_AVATAR: Updating aura color after visibility load: ${correctAuraColor}`);
              // Update the avatar with correct aura color
              userData.auraColor = correctAuraColor;
              userData.aura_color = correctAuraColor;
              // Recreate avatar with correct color
              if (typeof window.AvatarUtils !== 'undefined' && window.AvatarUtils.createUnifiedAvatar && userAvatarContainer) {
                const avatarHTML = await window.AvatarUtils.createUnifiedAvatar(userData, {
                  size: 32,
                  showStatus: false,
                  showAura: true,
                  context: 'profile'
                });
                userAvatarContainer.innerHTML = avatarHTML;
              }
            }
          }
        }, 500); // Wait 500ms for visibility data to load
      }
      
      console.log(`PROFILE_AVATAR: Creating UNIFIED avatar for profile:`, {
        name: userData.name,
        email: userData.email,
        avatarUrl: userData.avatarUrl,
        auraColor: userData.auraColor, // CRITICAL FIX: Use camelCase
        aura_color: userData.aura_color,
        source: realAvatarUrl === (user.user_metadata?.avatar_url || user.picture) ? 'auth' : 'visibility-data'
      });
      
      // ✅ CREATE UNIFIED AVATAR HTML - SAME AS MESSAGE/VISIBILITY AVATARS
      // CRITICAL: USE SAME SIZE AS VISIBILITY/MESSAGE AVATARS (32px) FOR CONSISTENCY
      try {
        if (typeof window.AvatarUtils !== 'undefined' && window.AvatarUtils.createUnifiedAvatar) {
          const avatarHTML = await window.AvatarUtils.createUnifiedAvatar(userData, {
            size: 32,  // MUST MATCH visibility (32px) and message (32px)
            showStatus: false,  // No status dot on profile avatar
            showAura: true,     // Show aura color
            context: 'profile'
          });
          
          console.log('[UPDATE_UI] Setting avatar HTML using AvatarUtils.createUnifiedAvatar() - UNIFIED RENDERING');
          userAvatarContainer.innerHTML = avatarHTML;
        } else {
          console.error('[UPDATE_UI] AvatarUtils.createUnifiedAvatar not available, using fallback');
          // FALLBACK: Create simple avatar HTML
          userAvatarContainer.innerHTML = `
            <div id="profile-avatar" class="profile-avatar" style="
              width: 32px;
              height: 32px;
              border-radius: 50%;
              border: 2px solid ${userData.auraColor || window.AVATAR_FALLBACK_COLOR};
              background: ${userData.auraColor || window.AVATAR_FALLBACK_COLOR};
              display: flex;
              align-items: center;
              justify-content: center;
              cursor: pointer;
              position: relative;
            ">
              ${userData.avatarUrl ? 
                `<img src="${userData.avatarUrl}" alt="Profile" style="width: 100%; height: 100%; border-radius: 50%; object-fit: cover;">` :
                `<span style="color: white; font-weight: bold; font-size: 14px;">${userData.name.charAt(0).toUpperCase()}</span>`
              }
            </div>
          `;
        }
      } catch (error) {
        console.error('[UPDATE_UI] Error creating unified avatar:', error);
        // FALLBACK: Create simple avatar HTML
        userAvatarContainer.innerHTML = `
          <div id="profile-avatar" class="profile-avatar" style="
            width: 32px;
            height: 32px;
            border-radius: 50%;
            border: 2px solid ${userData.auraColor || window.AVATAR_FALLBACK_COLOR};
            background: ${userData.auraColor || window.AVATAR_FALLBACK_COLOR};
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            position: relative;
          ">
            ${userData.avatarUrl ? 
              `<img src="${userData.avatarUrl}" alt="Profile" style="width: 100%; height: 100%; border-radius: 50%; object-fit: cover;">` :
              `<span style="color: white; font-weight: bold; font-size: 14px;">${userData.name.charAt(0).toUpperCase()}</span>`
            }
          </div>
        `;
      }
      
      console.log('[UPDATE_UI] ✅ Avatar configured using UNIFIED createUnifiedAvatar() system');
      
      // CRITICAL FIX: Add profile menu click handlers using ProfileManager module
      console.log('[UPDATE_UI] Adding profile menu click handlers...');
      if (typeof window.addProfileAvatarClickHandler === 'function') {
        window.addProfileAvatarClickHandler();
        console.log('[UPDATE_UI] ✅ Profile avatar click handler added via ProfileManager');
      } else {
        console.log('[UPDATE_UI] ⚠️ ProfileManager.addProfileAvatarClickHandler not available');
      }
      
      // Add all profile menu item handlers
      if (typeof window.addAllProfileMenuHandlers === 'function') {
        window.addAllProfileMenuHandlers();
        console.log('[UPDATE_UI] ✅ All profile menu handlers added via ProfileManager');
      } else {
        console.log('[UPDATE_UI] ⚠️ ProfileManager.addAllProfileMenuHandlers not available');
      }
    } else {
      console.error('[UPDATE_UI] ERROR: userAvatarContainer element not found!');
    }
    
    console.log('[UPDATE_UI] UI updated: User authenticated, showing user info');
    console.log('[UPDATE_UI] === END updateUI ===');
    
  } else {
    // User is logged out - hide user info but DON'T destroy the HTML structure
    console.log('[UPDATE_UI] User is null - hiding user info but preserving HTML structure');
    if (userInfoDiv) {
      userInfoDiv.style.display = 'none';
    }
    console.log('UI updated: User not authenticated, hiding user info');
  }
}


// ===== COMP HELPER FUNCTIONS =====
function getLatestAuraColorFromPresence(email) {
  // COMP METHOD: Use aura_color (snake_case) to match COMP standard
  // Try to get aura color from unfiltered visibility data
  if (window.currentVisibilityDataUnfiltered && window.currentVisibilityDataUnfiltered.active) {
    const user = window.currentVisibilityDataUnfiltered.active.find(
      u => u.email === email || u.userId === email || u.id === email
    );
    if (user && user.aura_color) {
      return user.aura_color;
    }
  }
  return null;
}

// Make functions globally accessible
window.getCurrentPageUri = getCurrentPageUri;
window.normalizeCurrentUrl = normalizeCurrentUrl;
window.updateUI = updateUI;
window.getLatestAuraColorFromPresence = getLatestAuraColorFromPresence;

// ===== DIAGNOSTIC FUNCTION =====
window.diagnoseSystem = function() {
  console.log('🔍 DIAGNOSTIC: === SYSTEM STATUS ===');
  console.log('🔍 DIAGNOSTIC: Current user:', window.currentUser);
  console.log('🔍 DIAGNOSTIC: Supabase client:', !!window.supabase);
  console.log('🔍 DIAGNOSTIC: Real-time client:', !!window.supabaseRealtimeClient);
  
  // Wait a moment for profile avatar to be created
  setTimeout(() => {
    console.log('🔍 DIAGNOSTIC: Profile avatar element:', !!document.querySelector('#profile-avatar'));
    console.log('🔍 DIAGNOSTIC: Profile avatar HTML:', document.querySelector('#profile-avatar')?.outerHTML);
  }, 100);
  
  console.log('🔍 DIAGNOSTIC: Messages container:', !!document.querySelector('.chat-messages'));
  console.log('🔍 DIAGNOSTIC: Visibility container:', !!document.querySelector('#visibility-tab'));
  console.log('🔍 DIAGNOSTIC: Current URL data:', window.currentUrlData);
  console.log('🔍 DIAGNOSTIC: === END DIAGNOSTIC ===');
};

// ===== TAB EVENT HANDLERS (CRITICAL FOR FUNCTIONALITY) =====
// CRITICAL FIX: Move tab listeners to setupTabListeners() function
// This ensures they only run AFTER CanopiModule.js is loaded
// DO NOT set up listeners here - they will be set up in initializeSidepanel()

function setupTabListeners() {
  if (typeof chrome === 'undefined' || !chrome.tabs) {
    console.warn('⚠️ TABS: Chrome tabs API not available');
    return;
  }
  
  console.log('🔗 TABS: Setting up tab event handlers...');
  
  // CRITICAL FIX: Check if loadChatHistory is available before setting up listeners
  if (typeof window.loadChatHistory !== 'function') {
    console.warn('⚠️ TABS: loadChatHistory not available yet, deferring tab listener setup...');
    // Retry after a delay
    setTimeout(() => {
      if (typeof window.loadChatHistory === 'function') {
        console.log('✅ TABS: loadChatHistory now available, setting up tab listeners');
        setupTabListeners();
      } else {
        console.error('❌ TABS: loadChatHistory still not available after delay');
      }
    }, 500);
    return;
  }
  
  // Listen for tab updates (URL changes, page loads)
  chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
    if (changeInfo.status === 'complete' && tab.url) {
      console.log('🔄 TAB_UPDATE: Tab updated:', tab.url);
      
      // Update current URL data
      if (typeof window.normalizeUrl === 'function') {
        try {
          const newUrlData = await window.normalizeUrl(tab.url);
          window.currentUrlData = newUrlData;
          console.log('🔄 TAB_UPDATE: URL data updated:', newUrlData);
          
          // Refresh visibility for new page
          if (typeof window.refreshVisibilityAvatars === 'function') {
            await window.refreshVisibilityAvatars();
            console.log('🔄 TAB_UPDATE: Visibility refreshed');
          }
          
        // Load messages for new page
        if (typeof window.loadChatHistory === 'function') {
          await window.loadChatHistory();
          console.log('🔄 TAB_UPDATE: Messages loaded');
        }
        
        // Setup message input event listeners
        if (typeof window.setupMessageInputEventListeners === 'function') {
          window.setupMessageInputEventListeners();
          console.log('🔄 TAB_UPDATE: Message input event listeners added');
        }
        
         // Setup tab navigation event listeners
         if (typeof window.setupTabNavigation === 'function') {
           window.setupTabNavigation();
           console.log('🔄 TAB_UPDATE: Tab navigation event listeners added');
         }
         
         // Setup message input event listeners
         if (typeof window.setupMessageInputEventListeners === 'function') {
           window.setupMessageInputEventListeners();
           console.log('🔄 TAB_UPDATE: Message input event listeners added');
         }
        } catch (error) {
          console.error('❌ TAB_UPDATE: Error updating for new tab:', error);
        }
      }
    }
  });
  
  // Listen for tab activation (switching between tabs)
  chrome.tabs.onActivated.addListener(async (activeInfo) => {
    console.log('🔄 TAB_ACTIVATED: Tab activated:', activeInfo.tabId);
    
    try {
      // Get the active tab
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (tab && tab.url) {
        console.log('🔄 TAB_ACTIVATED: Active tab URL:', tab.url);
        
        // Update current URL data
        if (typeof window.normalizeUrl === 'function') {
          const newUrlData = await window.normalizeUrl(tab.url);
          window.currentUrlData = newUrlData;
          console.log('🔄 TAB_ACTIVATED: URL data updated:', newUrlData);
          
          // Refresh visibility for active page
          if (typeof window.refreshVisibilityAvatars === 'function') {
            await window.refreshVisibilityAvatars();
            console.log('🔄 TAB_ACTIVATED: Visibility refreshed');
          }
          
          // Load messages for active page
          if (typeof window.loadChatHistory === 'function') {
            await window.loadChatHistory();
            console.log('🔄 TAB_ACTIVATED: Messages loaded');
          }
          
        // Setup message input event listeners
        if (typeof window.setupMessageInputEventListeners === 'function') {
          window.setupMessageInputEventListeners();
          console.log('🔄 TAB_ACTIVATED: Message input event listeners added');
        }
        
         // Setup tab navigation event listeners
         if (typeof window.setupTabNavigation === 'function') {
           window.setupTabNavigation();
           console.log('🔄 TAB_ACTIVATED: Tab navigation event listeners added');
         }
         
         // Setup message input event listeners
         if (typeof window.setupMessageInputEventListeners === 'function') {
           window.setupMessageInputEventListeners();
           console.log('🔄 TAB_ACTIVATED: Message input event listeners added');
         }
        }
      }
    } catch (error) {
      console.error('❌ TAB_ACTIVATED: Error handling tab activation:', error);
    }
  });
  
  console.log('✅ TABS: Tab event handlers set up successfully');
}

// ===== USER SETTINGS FOR THRESHOLD CONFIGURATION =====

// Set Last Seen threshold (user-configurable)
window.setLastSeenThreshold = function(days) {
  try {
    if (window.configManager) {
      window.configManager.setLastSeenThreshold(days);
      console.log(`🔧 USER SETTINGS: Last seen threshold set to ${days} days`, null, 'general');
      
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
      
      console.log(`🔧 USER SETTINGS: Current threshold: ${days} days`, null, 'general');
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

// Update profile avatar with real-time aura color
function updateProfileAvatarWithRealTimeAura() {
  try {
    if (!window.currentUser || !window.currentUser.email) {
      console.log('🔍 PROFILE_AVATAR_UPDATE: No current user found');
      return;
    }

    const userId = window.currentUser.id || window.currentUser.user_id;
    const realTimeAuraColor = getLatestAuraColorFromPresence(userId);
    
    if (realTimeAuraColor) {
      // Update the profile avatar with the real-time aura color
      const profileAvatar = document.querySelector('#user-avatar-container');
      if (profileAvatar) {
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
          }
        } else if (avatarElement) {
          console.log('🔍 PROFILE_AVATAR_UPDATE: Found simple avatar element');
          // Update the border on the simple avatar
          avatarElement.style.border = `2px solid ${realTimeAuraColor}`;
        } else {
          console.log('🔍 PROFILE_AVATAR_UPDATE: No avatar element found in container, applying border to container');
          // Apply border directly to container as fallback
          profileAvatar.style.borderColor = realTimeAuraColor;
          profileAvatar.style.borderWidth = '2px';
          profileAvatar.style.borderStyle = 'solid';
          profileAvatar.style.borderRadius = '50%';
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
    // COMP METHOD: Clear all context data - use replyingTo only
    delete chatInput.dataset.replyingTo;
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



async function handlePendingContent() {
  try {
    const pendingMessageContent = await getState('pendingMessageContent');
    const pendingMessageUri = await getState('pendingMessageUri');
    const pendingVisibilityContent = await getState('pendingVisibilityContent');
    const pendingVisibilityUri = await getState('pendingVisibilityUri');
    
    const result = {
      pendingMessageContent,
      pendingMessageUri,
      pendingVisibilityContent,
      pendingVisibilityUri
    };

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
        await removeStateMultiple(['pendingMessageContent', 'pendingMessageUri']);
        
        console.log('Pre-populated message input with selected content');
      }
    }

    // Handle pending visibility content
    if (result.pendingVisibilityContent) {
      // For now, we'll show a notification that visibility anchoring is not yet implemented
      // In the future, this could update the user's visibility status
      console.log('Pending visibility content:', result.pendingVisibilityContent);
      
      // Clear the pending content
      await removeStateMultiple(['pendingVisibilityContent', 'pendingVisibilityUri']);
      
      // Show a temporary notification
      showNotification('Visibility anchoring feature coming soon!');
    }
  } catch (error) {
    console.error('Failed to handle pending content:', error);
  }
}

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
      getState('activeCommunities').then((activeCommunities) => {
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
  
  // Handle shared message highlighting
  if (message.type === 'HIGHLIGHT_SHARED_MESSAGE') {
    console.log('🔗 SIDEPANEL: Received highlight request for message:', message.messageId);
    
    // Wait for sidebar to be ready, then highlight the message
    const highlightMessage = async () => {
      try {
        // Check if we're on the correct page (check URL hash)
        const currentUrl = window.location.href;
        if (!currentUrl.includes(`#message=${message.messageId}`)) {
          console.log('🔗 SIDEPANEL: Current page does not match message URL, waiting...');
          // The page should have the hash, but if not, we'll still try to find the message
        }
        
        // Wait for messages to load
        let attempts = 0;
        const maxAttempts = 20;
        
        const findAndHighlight = () => {
          attempts++;
          const messageElement = document.querySelector(`[data-message-id="${message.messageId}"]`);
          
          if (messageElement) {
            console.log('🔗 SIDEPANEL: Message found, highlighting');
            
            // Scroll to message
            messageElement.scrollIntoView({ 
              behavior: 'smooth', 
              block: 'center',
              inline: 'nearest'
            });
            
            // Add highlight class (defined in sidepanel.css) - this applies shake animation and styling
            // Note: This class is called 'shared-message-highlight', NOT 'message-reply'
            // 'message-reply' is a different class used for styling reply messages in threads
            messageElement.classList.add('shared-message-highlight');
            
            // Remove highlight and animation after 2.5 seconds (shake completes in ~2s)
            setTimeout(() => {
              messageElement.classList.remove('shared-message-highlight');
              messageElement.style.backgroundColor = '';
              messageElement.style.borderLeft = '';
              messageElement.style.boxShadow = '';
              messageElement.style.borderRadius = '';
            }, 2500);
            
            // Try to enter focus mode if available
            if (typeof handleMessageFocus === 'function' && window.currentChatData) {
              const messageData = window.currentChatData.find(m => m.id === message.messageId);
              if (messageData) {
                setTimeout(() => {
                  handleMessageFocus(messageData).catch(err => {
                    console.warn('🔗 SIDEPANEL: Could not enter focus mode:', err);
                  });
                }, 500);
              }
            }
            
            sendResponse({ success: true });
          } else if (attempts < maxAttempts) {
            setTimeout(findAndHighlight, 500);
          } else {
            console.warn('🔗 SIDEPANEL: Message not found after max attempts:', message.messageId);
            sendResponse({ success: false, error: 'Message not found' });
          }
        };
        
        // Start trying after initial delay
        setTimeout(findAndHighlight, 1000);
        
      } catch (error) {
        console.error('🔗 SIDEPANEL: Error highlighting message:', error);
        sendResponse({ success: false, error: error.message });
      }
    };
    
    highlightMessage();
    return true; // Keep channel open for async response
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
  console.log(`🔄 TAB_CHANGE: Handling tab change for tab: ${tabId}`);
  try {
    // CRITICAL FIX: Leave current page BEFORE switching to new page
    // This prevents "ghost presence" where user appears on old page for 30 seconds
    // COMP approach - no special leave function needed
    console.log('🚪 TAB_CHANGE: Using COMP approach - no special leave function needed');
    
    // Get the SPECIFIC tab URL (not active tab, but the tab that changed)
    const tab = await chrome.tabs.get(tabId);
    if (tab && tab.url) {
      console.log('🔄 TAB_CHANGE: New tab URL:', tab.url);
      console.log(`🔄 TAB_CHANGE: New tab URL: ${tab.url}`);
      
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
      
      // CRITICAL FIX: Clear focus mode if active when tab changes
      const chatMessages = document.querySelector('.chat-messages');
      if (chatMessages && chatMessages.dataset.focusMode === 'true') {
        console.log('🔄 TAB_CHANGE: Focus mode active, clearing it before tab change');
        chatMessages.dataset.focusMode = 'false';
        delete chatMessages.dataset.focusMessageId;
        // Clear focus container if it exists
        const focusContainer = chatMessages.querySelector('.focus-messages-container');
        if (focusContainer) {
          focusContainer.remove();
        }
        // Clear back row if it exists
        const backRow = chatMessages.querySelector('.focus-back-row');
        if (backRow) {
          backRow.remove();
        }
        // Clear messages container
        chatMessages.innerHTML = '';
        console.log('✅ TAB_CHANGE: Focus mode cleared, ready for new page messages');
      }
      
      // Reload chat history for the new page (uses normalized URL)
      console.log('🔍 TAB_CHANGE: Checking loadChatHistory availability...');
      console.log('🔍 TAB_CHANGE: typeof window.loadChatHistory:', typeof window.loadChatHistory);
      
      // CRITICAL FIX: Retry mechanism if loadChatHistory not immediately available
      // Increased retries and delay to handle async script loading
      let loadAttempts = 0;
      const maxAttempts = 10; // Increased from 5 to 10
      const retryDelay = 300; // Increased from 200ms to 300ms
      
      const tryLoadChatHistory = async () => {
        if (typeof window.loadChatHistory === 'function') {
          console.log('🔍 TAB_CHANGE: Calling window.loadChatHistory...');
          try {
            await window.loadChatHistory();
            console.log('✅ TAB_CHANGE: loadChatHistory completed');
            return true;
          } catch (error) {
            console.error('❌ TAB_CHANGE: Error calling loadChatHistory:', error);
            return false;
          }
        }
        return false;
      };
      
      let loaded = await tryLoadChatHistory();
      
      // Retry if not available - wait longer for script to load
      while (!loaded && loadAttempts < maxAttempts) {
        loadAttempts++;
        console.log(`⏳ TAB_CHANGE: loadChatHistory not available, retrying (${loadAttempts}/${maxAttempts})...`);
        console.log(`⏳ TAB_CHANGE: window.loadChatHistory type: ${typeof window.loadChatHistory}`);
        console.log(`⏳ TAB_CHANGE: CanopiModule loaded: ${!!window.CanopiModule}`);
        await new Promise(resolve => setTimeout(resolve, retryDelay));
        loaded = await tryLoadChatHistory();
      }
      
      if (!loaded) {
        console.error('❌ TAB_CHANGE: loadChatHistory not available after retries');
        console.error('❌ TAB_CHANGE: This may cause messages not to display');
        console.error('❌ TAB_CHANGE: Check if CanopiModule.js is loaded correctly');
        
        // CRITICAL FIX: Try to manually trigger loadChatHistory if CanopiModule exists
        if (window.CanopiModule && typeof window.CanopiModule.loadChatHistory === 'function') {
          console.log('🔧 TAB_CHANGE: Found loadChatHistory in CanopiModule, calling directly...');
          try {
            await window.CanopiModule.loadChatHistory();
            console.log('✅ TAB_CHANGE: loadChatHistory completed via CanopiModule');
            loaded = true;
          } catch (error) {
            console.error('❌ TAB_CHANGE: Error calling CanopiModule.loadChatHistory:', error);
          }
        }
        
        // Show error message if still not loaded
        if (!loaded) {
          const chatMessages = document.querySelector('.chat-messages');
          if (chatMessages) {
            chatMessages.innerHTML = `
              <div style="padding: 20px; text-align: center; color: var(--text-secondary);">
                <p>⚠️ Unable to load messages. Please refresh the page.</p>
                <p style="font-size: 12px; margin-top: 8px;">If this persists, check the console for errors.</p>
                <p style="font-size: 11px; margin-top: 4px; color: #999;">loadChatHistory not available after ${maxAttempts} retries</p>
              </div>
            `;
          }
        }
      }
      // Update visibility list for the new page (uses normalized URL)
      const activeCommunities = await getState('activeCommunities');
      const communities = activeCommunities || ['comm-001'];
      if (typeof window.loadCombinedAvatars === 'function') {
        await window.loadCombinedAvatars(communities);
      }
      // Start presence tracking for the new URL (uses normalized URL)
      if (typeof window.startPresenceTracking === 'function') {
        await window.startPresenceTracking();
      }
      console.log('✅ TAB_CHANGE: Tab change complete');
    } else {
      console.log('⚠️ TAB_CHANGE: No tab or URL found for tab:', tabId);
      console.log(`❌ TAB_CHANGE: No tab or URL found for tab: ${tabId}`);
    }
  } catch (error) {
    console.error('❌ TAB_CHANGE: Error handling tab change:', error);
    console.error(`❌ TAB_CHANGE: Error handling tab change: ${error.message}`);
  }
}

// Handle tab closed
async function handleTabClosed(tabId) {
  console.log('🔄 TAB_CLOSED: === HANDLING TAB CLOSURE ===');
  console.log('🔄 TAB_CLOSED: Tab ID:', tabId);
  console.log(`🔄 TAB_CLOSE: Handling tab closure for tab: ${tabId}`);
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
    console.error(`❌ TAB_CLOSE: Error handling tab closure: ${error.message}`);
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
  console.log(`🔄 TAB_UPDATE: Handling tab update for tab: ${tabId}, URL: ${url}`);
  
  try {
    // === STEP 1: LOG CURRENT STATE ===
    console.log('');
    console.log('📊 TAB_UPDATE: STEP 1 - Current State Before Leaving');
    console.log('───────────────────────────────────────────────────────────');
    console.log('🔍 TAB_UPDATE: window.currentUrlData:', JSON.stringify(window.currentUrlData, null, 2));
    console.log('🔍 TAB_UPDATE: supabaseRealtimeClient exists:', !!window.supabaseRealtimeClient);
    console.log('🔍 TAB_UPDATE: supabaseRealtimeClient.currentPage:', JSON.stringify(window.supabaseRealtimeClient?.currentPage, null, 2));
    console.log('🔍 TAB_UPDATE: supabaseRealtimeClient.currentUser:', window.supabaseRealtimeClient?.currentUser?.userId);
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
        console.log(`TAB_UPDATE: leaveCurrentPage() completed in ${leaveEndTime - leaveStartTime}ms`, null, 'general');
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
    console.log(`TAB_UPDATE: normalizeUrl() completed in ${normalizeEndTime - normalizeStartTime}ms`, null, 'general');
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
    console.log('🔍 TAB_UPDATE: Checking loadChatHistory availability...');
    console.log('🔍 TAB_UPDATE: typeof window.loadChatHistory:', typeof window.loadChatHistory);
    if (typeof window.loadChatHistory === 'function') {
      console.log('🔍 TAB_UPDATE: Calling window.loadChatHistory...');
      await window.loadChatHistory();
      console.log('✅ TAB_UPDATE: loadChatHistory completed');
    } else {
      console.log('❌ TAB_UPDATE: loadChatHistory not available');
    }
    const chatEndTime = Date.now();
    console.log(`TAB_UPDATE: Chat history loaded in ${chatEndTime - chatStartTime}ms`, null, 'general');
    
    // === STEP 7: UPDATE VISIBILITY LIST ===
    console.log('');
    console.log('📊 TAB_UPDATE: STEP 7 - Updating Visibility List');
    console.log('───────────────────────────────────────────────────────────');
    const activeCommunities = await getState('activeCommunities');
    const communities = activeCommunities || ['comm-001'];
    console.log('🔍 TAB_UPDATE: Active communities:', communities);
    const visibilityStartTime = Date.now();
    if (typeof window.loadCombinedAvatars === 'function') {
      await window.loadCombinedAvatars(communities);
    }
    const visibilityEndTime = Date.now();
    console.log(`TAB_UPDATE: Visibility list updated in ${visibilityEndTime - visibilityStartTime}ms`, null, 'general');
    
    // === STEP 8: START PRESENCE TRACKING ===
    console.log('');
    console.log('📊 TAB_UPDATE: STEP 8 - Starting Presence Tracking');
    console.log('───────────────────────────────────────────────────────────');
    console.log('🔄 TAB_UPDATE: Calling startPresenceTracking() for new page:', newUrlData.pageId);
    const presenceStartTime = Date.now();
    if (typeof window.startPresenceTracking === 'function') {
      await window.startPresenceTracking();
    }
    const presenceEndTime = Date.now();
    console.log(`TAB_UPDATE: Presence tracking started in ${presenceEndTime - presenceStartTime}ms`, null, 'general');
    
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
    console.error(`❌ TAB_UPDATE: Error handling tab update: ${error.message}`);
  }
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
    const urlData = await window.normalizeCurrentUrl();
    currentPageId = urlData.pageId;
    
    console.log('🔍 PRESENCE: Starting for page:', currentPageId);
    console.log('🔍 PRESENCE: URL:', urlData.normalizedUrl);
    console.log('🔍 PRESENCE: User:', await window.getCurrentUserEmail());
    
    // Use robust integration system if available
    if (window.robustIntegration && window.robustIntegration.isInitialized) {
      console.log('🔧 PRESENCE: Using robust integration system...');
      const joinSuccess = await window.robustIntegration.joinPage(urlData.normalizedUrl);
      if (joinSuccess) {
        console.log('✅ PRESENCE: Robust integration system configured with user and page');
      } else {
        console.warn('⚠️ PRESENCE: Robust integration failed, falling back to legacy system');
        if (typeof window.joinPageWithSupabase === 'function') {
          await window.joinPageWithSupabase(currentPageId, urlData.normalizedUrl);
        }
      }
    } else {
      // Fallback to legacy system
      console.log('🔧 PRESENCE: Using legacy SupabaseRealtimeClient system...');
      if (typeof window.joinPageWithSupabase === 'function') {
        await window.joinPageWithSupabase(currentPageId, urlData.normalizedUrl);
      }
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
    if (window.reactionsIntegration) {
      if (!window.reactionsIntegration.isInitialized) {
        console.log('🔧 PRESENCE: Initializing reactions integration system...');
        const initSuccess = await window.reactionsIntegration.initialize();
        if (!initSuccess) {
          console.warn('⚠️ PRESENCE: Reactions integration initialization failed');
        }
      }
      
      if (window.reactionsIntegration.isInitialized) {
        console.log('🔧 PRESENCE: Using reactions integration system...');
        const reactionsJoinSuccess = await window.reactionsIntegration.joinPage(urlData.normalizedUrl);
        if (reactionsJoinSuccess) {
          console.log('✅ PRESENCE: Reactions integration system configured with user and page');
        } else {
          console.warn('⚠️ PRESENCE: Reactions integration failed');
        }
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
          console.log('🔍 PRESENCE DEBUG: Current user email:', await window.getCurrentUserEmail());
          console.log('🔍 PRESENCE DEBUG: Current page ID:', currentPageId);
          
          try {
            const unifiedPresence = new window.UnifiedPresenceManager(window.supabase);
            console.log('🔍 PRESENCE DEBUG: UnifiedPresenceManager instance created:', !!unifiedPresence);
            
            const initSuccess = await unifiedPresence.initialize(
              { email: await window.getCurrentUserEmail() }, 
              currentPageId
            );
            
            console.log('🔍 PRESENCE DEBUG: Initialization result:', initSuccess);
            
            if (initSuccess) {
              console.log('✅ PRESENCE: UnifiedPresenceManager initialized successfully');
              
              // CRITICAL FIX: Send initial presence event to backend
              console.log('🔍 PRESENCE DEBUG: Sending initial presence event to backend...');
              try {
                if (typeof window.sendPresenceEvent === 'function') {
                  const presenceResult = await window.sendPresenceEvent('ENTER');
                  console.log('✅ PRESENCE DEBUG: Initial presence event sent successfully:', presenceResult);
                }
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
        if (typeof window.sendPresenceEvent === 'function') {
          const presenceResult = await window.sendPresenceEvent('ENTER');
          console.log('✅ PRESENCE: Initial presence event sent successfully');
          console.log('🔍 PRESENCE DEBUG: Presence event result:', presenceResult);
          
          // COMP METHOD: Wait for presence to be processed, then refresh visibility (EXACT COMP TIMING)
          setTimeout(async () => {
            console.log('🔍 PRESENCE DEBUG: Refreshing visibility after presence event...');
            console.log('🔍 PRESENCE DEBUG: About to call refreshVisibilityAvatars()');
            console.log('🔍 PRESENCE DEBUG: window.supabaseRealtimeClient available:', !!window.supabaseRealtimeClient);
            console.log('🔍 PRESENCE DEBUG: window.currentUrlData available:', !!window.currentUrlData);
            console.log('🔍 PRESENCE DEBUG: window.currentUrlData.pageId:', window.currentUrlData?.pageId);
            console.log('🔍 PRESENCE DEBUG: window.supabase available:', !!window.supabase);
            
            try {
              if (typeof window.refreshVisibilityAvatars === 'function') {
                await window.refreshVisibilityAvatars();
              }
              console.log('✅ PRESENCE DEBUG: Visibility refreshed after presence event');
            } catch (error) {
              console.error('❌ PRESENCE DEBUG: Failed to refresh visibility:', error);
              console.log('🔍 PRESENCE DEBUG: Error details:', error.message, error.stack);
            }
          }, 2000); // COMP METHOD: Use exact COMP timing (2 seconds)
        }
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
        if (typeof window.handlePresenceChange === 'function') {
          window.handlePresenceChange(payload);
        } else {
          console.error('❌ PRESENCE: handlePresenceChange not available');
        }
        // COMP METHOD: Check if aura color changed and propagate immediately
        if (payload.new) {
          const auraColor = payload.new.aura_color || payload.new.auraColor;
          if (auraColor) {
            console.log('🎨 COMP METHOD: Aura color detected in presence update:', auraColor);
            const userId = payload.new.user_id || payload.new.user_email || payload.new.id;
            if (userId && typeof window.handleAuraChange === 'function') {
              console.log(`🎨 COMP METHOD: Triggering handleAuraChange for user ${userId} with color ${auraColor}`);
              window.handleAuraChange({
                userId: userId,
                auraColor: auraColor,
                source: 'presence_update'
              }).catch(error => {
                console.error('❌ COMP METHOD: Error in handleAuraChange from presence update:', error);
              });
            } else {
              console.warn('⚠️ COMP METHOD: Cannot trigger handleAuraChange - missing userId or handler');
            }
          }
        }
      })
      .on('broadcast', { event: 'AURA_COLOR_CHANGED' }, (payload) => {
        console.log('🎨 COMP METHOD: Aura color change broadcast received:', payload);
        // COMP METHOD: Handle both direct payload and nested payload structure
        const auraData = payload.payload || payload;
        const userId = auraData.userId || payload.userId || auraData.user_id;
        const auraColor = auraData.auraColor || payload.auraColor || auraData.aura_color;
        
        console.log(`🎨 COMP METHOD: Extracted userId: ${userId}, auraColor: ${auraColor}`);
        
        if (userId && auraColor && typeof window.handleAuraChange === 'function') {
          console.log(`🎨 COMP METHOD: Triggering handleAuraChange from broadcast for user ${userId} with color ${auraColor}`);
          window.handleAuraChange({
            userId: userId,
            auraColor: auraColor,
            source: 'broadcast'
          }).catch(error => {
            console.error('❌ COMP METHOD: Error in handleAuraChange from broadcast:', error);
          });
        } else {
          console.warn('⚠️ COMP METHOD: Cannot trigger handleAuraChange - missing userId/auraColor or handler');
          console.warn('⚠️ COMP METHOD: Broadcast payload:', payload);
          console.warn('⚠️ COMP METHOD: Extracted userId:', userId, 'auraColor:', auraColor);
        }
      })
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'messages',
        filter: `page_url=eq.${urlData.normalizedUrl}`
      }, (payload) => {
        console.log('🔔 PAGE_MESSAGES: Real-time update received:', payload);
        if (typeof window.handleMessageChange === 'function') {
          window.handleMessageChange(payload);
        } else {
          console.error('❌ MESSAGES: handleMessageChange not available');
        }
      })
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'reactions',
        filter: `page_url=eq.${urlData.normalizedUrl}`
      }, (payload) => {
        console.log('🔔 PAGE_REACTIONS: Real-time update received:', payload);
        // COMP METHOD: Delegate to window.handleReactionChange if available (from CanopiModule)
        // Otherwise use RealtimeManager's handleReactionChange which will also delegate
        if (typeof window.handleReactionChange === 'function') {
          window.handleReactionChange(payload);
        } else {
          console.warn('⚠️ PAGE_REACTIONS: No handleReactionChange function available');
        }
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
    // COMP METHOD: Functions should already be available from RealtimeManager.js
    console.log('🔧 PRESENCE: Checking real-time function availability...');
    
    // COMP METHOD: Wait for RealtimeManager to load and export functions
    let retryCount = 0;
    const maxRetries = 10;
    
    const checkRealtimeFunctions = () => {
      const functions = ['handlePresenceChange', 'handleMessageChange', 'handleReactionChange', 'handleAuraChange'];
      const available = functions.filter(func => typeof window[func] === 'function');
      
      console.log('handlePresenceChange available:', typeof window.handlePresenceChange === 'function');
      console.log('handleMessageChange available:', typeof window.handleMessageChange === 'function');
      console.log('handleReactionChange available:', typeof window.handleReactionChange === 'function');
      console.log('handleAuraChange available:', typeof window.handleAuraChange === 'function');
      
      if (available.length === functions.length) {
        console.log('✅ REALTIME: All real-time functions available');
        return true;
      } else if (retryCount < maxRetries) {
        retryCount++;
        console.log(`⏳ REALTIME: Waiting for functions... (${retryCount}/${maxRetries})`);
        setTimeout(checkRealtimeFunctions, 100);
        return false;
      } else {
        console.log('⚠️ REALTIME: Some functions still not available after retries');
        return false;
      }
    };
    
    checkRealtimeFunctions();
    
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
            user_id: window.currentUser?.id || window.currentUser?.user_id || 'unknown-user',
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
          .select('community_id, is_active, user_id')
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
        meta.content = `script-src 'self'; object-src 'self'; connect-src 'self' ${supabaseUrl} ${supabaseWsUrl} http://216.238.91.120:3001 ws://216.238.91.120:3001 http://216.238.91.120:3002 ws://216.238.91.120:3002 https://app.themetalayer.org https://api.themetalayer.org https://www.googleapis.com wss://echo.websocket.org https://www.youtube.com;`;
        
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

// ===== CRITICAL WINDOW DECLARATIONS =====
// These are essential for the modular system to work properly

// Core system objects
window.Logger = window.Logger || console;
window.supabase = window.supabase || null;
window.api = window.api || null;
window.supabaseRealtimeClient = window.supabaseRealtimeClient || null;

// Global state variables
window.currentUser = window.currentUser || null;
window.currentUrlData = window.currentUrlData || null;
window.currentVisibilityData = window.currentVisibilityData || null;
window.currentVisibilityDataUnfiltered = window.currentVisibilityDataUnfiltered || null;
window.currentPresenceData = window.currentPresenceData || null;

// UI state
window.focusedMessage = window.focusedMessage || null;
window.previousView = window.previousView || null;

// Manager instances
window.notificationHistory = window.notificationHistory || null;
window.navigationManager = window.navigationManager || null;

// Avatar functions (from ProfileManager)
window.getCurrentUserAvatarBgColor = window.getCurrentUserAvatarBgColor || function() { return window.AVATAR_FALLBACK_COLOR; };
window.setCustomAvatarColor = window.setCustomAvatarColor || function() {};
window.resetCustomAvatarColor = window.resetCustomAvatarColor || function() {};
window.getCurrentUserAvatarColor = window.getCurrentUserAvatarColor || function() { return window.AVATAR_FALLBACK_COLOR; };

// UI functions (from UIManager)
window.updateVisualHierarchy = window.updateVisualHierarchy || function() {};
window.debugHierarchy = window.debugHierarchy || function() {};
window.forceRefreshCSS = window.forceRefreshCSS || function() {};

// Diagnostic functions (from Diagnostics)
window.getMessageDiagnostics = window.getMessageDiagnostics || function() { return {}; };
window.clearMessageDiagnostics = window.clearMessageDiagnostics || function() {};

// Additional diagnostic functions
window.diagnoseJavaScriptErrors = window.diagnoseJavaScriptErrors || function() {};
window.safeDiagnostic = window.safeDiagnostic || function() {};
window.testVisibilitySystem = window.testVisibilitySystem || function() {};
window.refreshVisibility = window.refreshVisibility || function() {};

// Testing functions
window.debugAvatar = window.debugAvatar || function() {};
window.debugVisibility = window.debugVisibility || function() {};
window.testTimeUpdate = window.testTimeUpdate || function() {};
window.forceAvatarRefresh = window.forceAvatarRefresh || function() {};
window.restartVisibilityTimer = window.restartVisibilityTimer || function() {};
window.quickDebug = window.quickDebug || function() {};

// Navigation functions
window.quickStatus = window.quickStatus || function() {};
window.testMessage = window.testMessage || function() {};
window.testAura = window.testAura || function() {};

// Background service functions
window.requireAuth = window.requireAuth || function() {};
window.addFriend = window.addFriend || function() {};
window.openUserProfile = window.openUserProfile || function() {};

// Module instances
window.CommunitiesModule = window.CommunitiesModule || null;
window.SettingsModule = window.SettingsModule || null;
window.AuraColorModal = window.AuraColorModal || null;
window.SupabaseService = window.SupabaseService || null;

console.log('✅ WINDOW DECLARATIONS: All critical window objects declared');

// ===== DOM READY INITIALIZATION =====
function initializeSidepanel() {
  console.log('🚀 SIDEPANEL: Initializing sidepanel after DOM ready...');
  
  // Initialize modern architecture if available
  if (typeof initializeCompleteModernArchitecture === 'function') {
    initializeCompleteModernArchitecture().then(async () => {
      console.log('✅ SIDEPANEL: Modern architecture initialized');
      
      // === COMP AUTH SEQUENCE (EXACT MATCH) ===
      console.log('🔐 AUTH: Starting COMP auth sequence...');
      
      // Fix authManager.initialize method if missing
      if (typeof authManager !== 'undefined' && typeof authManager.initialize !== 'function') {
        console.log('🔧 Adding initialize method to authManager...');
        authManager.initialize = function() {
          console.log('🔧 AuthManager initialize called');
          return Promise.resolve(true);
        };
      }
      
      // Try to initialize with timeout (COMP METHOD)
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
          
          // Set up auth state listener (COMP METHOD)
          authManager.onAuthStateChange(async (event, data) => {
            console.log('Auth state changed:', event, data);
            // data IS the user object, not { user: ... }
            await updateUI(data);
          });
          
          // Check initial auth state (COMP METHOD)
          const user = await authManager.getCurrentUser();
          console.log('Initial user:', user);
          
          // Update UI with current user (COMP METHOD)
          await updateUI(user);
          
          // Check for pending content from selection widget (COMP METHOD)
          await handlePendingContent();
          
        } else {
          console.log('Auth system failed to initialize');
        }
      } catch (error) {
        console.error('Auth initialization failed:', error.message);
        console.log('Forcing real authentication - no offline fallback');
      }
      
      // === LOAD COMMUNITIES AND CHAT HISTORY (COMP METHOD) ===
      // COMP METHOD: Communities will be loaded AFTER authentication
      console.log('🔍 INIT: Communities will be loaded after authentication');
      
      // === INITIALIZE MODULES (FROM COMP) ===
      console.log('🚀 MODULES: Initializing modules...');
      
      // Initialize unified system
      if (window.unifiedInitManager && typeof window.unifiedInitManager.initialize === 'function') {
        try {
          const unifiedInitSuccess = await window.unifiedInitManager.initialize();
          if (unifiedInitSuccess) {
            console.log('✅ MODULES: Unified system initialized successfully');
          }
        } catch (error) {
          console.error('❌ MODULES: Unified system initialization failed:', error);
        }
      }
      
      // Initialize Supabase real-time client
      if (typeof window.initializeSupabaseRealtimeClient === 'function') {
        try {
          await window.initializeSupabaseRealtimeClient();
          console.log('✅ MODULES: Supabase real-time client initialized');
        } catch (error) {
          console.error('❌ MODULES: Supabase real-time client initialization failed:', error);
        }
      }
      
         console.log('✅ MODULES: Module initialization complete');
         
         // === SETUP TAB NAVIGATION AND MESSAGE INPUT (FROM COMP) ===
         console.log('🔗 SETUP: Setting up tab navigation and message input...');
         if (typeof window.setupTabNavigation === 'function') {
           window.setupTabNavigation();
           console.log('✅ SETUP: Tab navigation event listeners added');
         }
         if (typeof window.setupMessageInputEventListeners === 'function') {
           window.setupMessageInputEventListeners();
           console.log('✅ SETUP: Message input event listeners added');
         }
         
         // === SETUP TAB EVENT LISTENERS (CRITICAL FIX) ===
         // CRITICAL FIX: Set up tab listeners AFTER CanopiModule is loaded
         console.log('🔗 SETUP: Setting up tab event listeners (after CanopiModule load)...');
         console.log('🔗 SETUP: Checking loadChatHistory availability:', typeof window.loadChatHistory);
         console.log('🔗 SETUP: CanopiModule available:', !!window.CanopiModule);
         
         // CRITICAL FIX: Wait for loadChatHistory if not immediately available
         if (typeof window.loadChatHistory !== 'function') {
           console.warn('⚠️ SETUP: loadChatHistory not available, waiting...');
           let waitAttempts = 0;
           const maxWaitAttempts = 10;
           const waitDelay = 200;
           
           while (typeof window.loadChatHistory !== 'function' && waitAttempts < maxWaitAttempts) {
             waitAttempts++;
             console.log(`⏳ SETUP: Waiting for loadChatHistory (${waitAttempts}/${maxWaitAttempts})...`);
             await new Promise(resolve => setTimeout(resolve, waitDelay));
           }
           
           if (typeof window.loadChatHistory !== 'function') {
             console.error('❌ SETUP: loadChatHistory still not available after waiting');
           } else {
             console.log('✅ SETUP: loadChatHistory now available');
           }
         }
         
         if (typeof setupTabListeners === 'function') {
           setupTabListeners();
           console.log('✅ SETUP: Tab event listeners added');
         } else {
           console.warn('⚠️ SETUP: setupTabListeners function not available');
         }
         
         // === INITIALIZE REAL GOOGLE AUTH (FROM COMP) ===
      console.log('🚀 INIT: Initializing real Google auth...');
      if (typeof window.initializeRealGoogleAuth === 'function') {
        window.initializeRealGoogleAuth();
        console.log('✅ INIT: Real Google auth initialized');
      } else {
        console.warn('⚠️ INIT: initializeRealGoogleAuth not available');
      }
      
      // === INITIALIZE THEME ===
      // Initialize theme after user authentication to prevent flash
      console.log('🎨 THEME: Initializing theme after user authentication...');
      const initThemeAfterAuth = async () => {
        // Wait for currentUser to be available (should be set by auth system)
        let attempts = 0;
        while (!window.currentUser?.id && attempts < 30) {
          await new Promise(resolve => setTimeout(resolve, 100));
          attempts++;
        }

        if (window.currentUser?.id) {
          console.log('🎨 THEME: User authenticated, loading theme...');
          if (typeof window.initializeTheme === 'function') {
            await window.initializeTheme();
            console.log('✅ THEME: Theme initialized successfully');
          } else {
            console.warn('⚠️ THEME: initializeTheme function not available');
          }
        } else {
          console.warn('⚠️ THEME: User not authenticated within timeout, using defaults');
        }
      };

      // Start theme initialization
      initThemeAfterAuth();
      
      
      // === UPDATE MESSAGE VISUAL HIERARCHY (FROM COMP) ===
      console.log('📐 HIERARCHY: Updating message visual hierarchy...');
      if (typeof window.updateMessageVisualHierarchy === 'function') {
        window.updateMessageVisualHierarchy();
        console.log('✅ HIERARCHY: Message visual hierarchy updated');
      } else {
        console.warn('⚠️ HIERARCHY: updateMessageVisualHierarchy not available');
        // Add the missing function
        window.updateMessageVisualHierarchy = function() {
          console.log('📐 HIERARCHY: updateMessageVisualHierarchy function called');
          // Basic message visual hierarchy update
          const chatMessages = document.querySelector('.chat-messages');
          if (chatMessages) {
            console.log('📐 HIERARCHY: Chat messages container found, updating hierarchy');
          }
        };
        window.updateMessageVisualHierarchy();
        console.log('✅ HIERARCHY: Message visual hierarchy function added and called');
      }
      
      // === ADD WINDOW RESIZE LISTENER (FROM COMP) ===
      console.log('📐 RESIZE: Adding window resize listener...');
      window.addEventListener('resize', () => {
        if (typeof window.updateMessageVisualHierarchy === 'function') {
          window.updateMessageVisualHierarchy();
        }
      });
      console.log('✅ RESIZE: Window resize listener added');
      
      // === CHECK FOR AUTHENTICATION (FROM COMP) ===
      console.log('🔐 AUTH: Checking for authenticated user...');
      const currentUserEmail = await window.getCurrentUserEmail();
      if (!currentUserEmail) {
        console.log('🔐 AUTH: No authenticated user found, showing auth prompt');
        showAuthPrompt('access presence features');
      } else {
        console.log('🔐 AUTH: User authenticated:', currentUserEmail);
        
        // COMPREHENSIVE USER IDENTITY LOGGING
        console.log('🔍 USER_IDENTITY: === AUTHENTICATION USER IDENTITY TRACE ===');
        console.log('🔍 USER_IDENTITY: Authenticated user email:', currentUserEmail);
        console.log('🔍 USER_IDENTITY: User email type:', typeof currentUserEmail);
        console.log('🔍 USER_IDENTITY: User email length:', currentUserEmail?.length);
        console.log('🔍 USER_IDENTITY: User email includes @:', currentUserEmail?.includes('@'));
        console.log('🔍 USER_IDENTITY: User email domain:', (currentUserEmail && currentUserEmail.includes('@')) ? currentUserEmail.split('@')[1] : 'unknown');
        console.log('🔍 USER_IDENTITY: === END AUTHENTICATION USER IDENTITY TRACE ===');
        
        // CRITICAL FIX: Set window.currentUser with full user data
        if (typeof window.getCurrentUserAvatarBgColor === 'function') {
          const avatarColor = window.getCurrentUserAvatarBgColor();
          
          // Get avatar from StateManager
          let realAvatarUrl = null;
          
          // SD2 COMP MIMETIC FIX: Get the ACTUAL Google profile picture from StateManager
          console.log('🔐 AUTH: Getting ACTUAL Google profile picture from StateManager');
          const storedUser = window.getState ? window.getState('supabaseUser') : null;
          const storedSession = window.getState ? window.getState('supabaseSession') : null;
          
          if (storedUser && storedUser.picture) {
            realAvatarUrl = storedUser.picture;
            console.log('🔐 AUTH: Using ACTUAL Google profile picture from supabaseUser:', realAvatarUrl);
          } else if (storedSession && storedSession.user && storedSession.user.picture) {
            realAvatarUrl = storedSession.user.picture;
            console.log('🔐 AUTH: Using ACTUAL Google profile picture from supabaseSession:', realAvatarUrl);
          } else {
            console.log('🔐 AUTH: No stored user picture found, using fallback');
            realAvatarUrl = "https://www.gravatar.com/avatar/ZGF2ZXJvb21AZ21haWwuY29t?d=identicon&s=200";
          }
          
          // ROOT CAUSE FIX: Start with null - backend will return AppUser UUID after first API call
          // APIModule will validate UUID format before sending as header
          window.currentUser = {
            id: null, // Will be set to real AppUser UUID after first API call returns it
            user_id: null,
            email: currentUserEmail,
            name: currentUserEmail ? currentUserEmail.split('@')[0] : 'User',
            avatarUrl: realAvatarUrl,
            auraColor: avatarColor,
            user_metadata: storedUser?.user_metadata || storedSession?.user?.user_metadata || null
          };
          
          // COMPREHENSIVE USER IDENTITY LOGGING
          console.log('🔍 USER_IDENTITY: === WINDOW.CURRENTUSER ASSIGNMENT TRACE ===');
          console.log('🔍 USER_IDENTITY: window.currentUser assigned:');
          console.log('🔍 USER_IDENTITY: window.currentUser.email:', window.currentUser.email);
          console.log('🔍 USER_IDENTITY: window.currentUser.name:', window.currentUser.name);
          console.log('🔍 USER_IDENTITY: window.currentUser.id:', window.currentUser.id);
          console.log('🔍 USER_IDENTITY: window.currentUser.avatarUrl:', window.currentUser.avatarUrl);
          console.log('🔍 USER_IDENTITY: Full window.currentUser object:', window.currentUser);
          console.log('🔍 USER_IDENTITY: === END WINDOW.CURRENTUSER ASSIGNMENT TRACE ===');
          
          console.log('🔐 AUTH: Set window.currentUser with real Google data:');
          console.log('  email:', window.currentUser.email);
          console.log('  avatarUrl:', window.currentUser.avatarUrl);
          console.log('  user_metadata:', window.currentUser.user_metadata);
          console.log('  Full window.currentUser:', JSON.stringify(window.currentUser, null, 2));
          
          // CRITICAL FIX: Update UI with user data (COMP approach)
          console.log('🔐 AUTH: Updating UI with user data...');
          if (typeof window.updateUI === 'function') {
            await window.updateUI(window.currentUser);
            console.log('🔐 AUTH: UI updated with user data');
          }
          
          // CRITICAL FIX: Set current URL data before loading profile and messages
          console.log('🔐 AUTH: Setting current URL data...');
          if (typeof window.normalizeCurrentUrl === 'function') {
            window.currentUrlData = await window.normalizeCurrentUrl();
            console.log('🔐 AUTH: Current URL data set:', window.currentUrlData);
          }
          
          // CRITICAL FIX: Load profile and messages after authentication
          console.log('🔐 AUTH: Loading profile and messages after authentication...');
          if (typeof window.loadChatHistory === 'function') {
            await window.loadChatHistory();
            console.log('🔐 AUTH: Chat history loaded');
          }
          if (typeof window.refreshVisibilityAvatars === 'function') {
            await window.refreshVisibilityAvatars();
            console.log('🔐 AUTH: Visibility avatars refreshed');
          }
          
          // COMP METHOD: Start presence tracking after authentication
          console.log('🔐 AUTH: Starting presence tracking after authentication...');
          if (typeof window.startPresenceTracking === 'function') {
            await window.startPresenceTracking();
            console.log('🔐 AUTH: Presence tracking started');
          }
          
          // COMP METHOD: Load communities AFTER authentication with user context
          console.log('🔍 INIT: Loading communities with user context...');
          try {
            // Initialize CommunitiesModule (SD3: Integrated community dropdown activation)
            if (typeof CommunitiesModule !== 'undefined') {
              try {
                if (!window.communitiesModule) {
                  window.communitiesModule = new CommunitiesModule();
                }
                if (!window.communitiesModule.isInitialized) {
                  await window.communitiesModule.initialize();
                  console.log('✅ INIT: CommunitiesModule initialized');
                }
              } catch (error) {
                console.error('❌ INIT: Failed to initialize CommunitiesModule:', error);
              }
            }

            // Ensure loadCommunities is available (CommunitiesModule.js must be loaded)
            if (typeof window.loadCommunities === 'function') {
              const result = await window.loadCommunities();
              console.log('🔍 INIT: Communities loaded with user context:', result);
            } else {
              console.warn('⚠️ INIT: loadCommunities not available yet, retrying...');
              // Retry after a short delay
              setTimeout(async () => {
                if (typeof window.loadCommunities === 'function') {
                  try {
                    const result = await window.loadCommunities();
                    console.log('🔍 INIT: Communities loaded with user context (retry):', result);
                  } catch (error) {
                    console.error('❌ INIT: Error loading communities with user context (retry):', error);
                  }
                } else {
                  console.error('❌ INIT: loadCommunities still not available after retry');
                }
              }, 500);
            }
          } catch (error) {
            console.error('❌ INIT: Error loading communities with user context:', error);
          }
          
          // COMP METHOD: Mark initialization as complete to enable auth prompts
          if (typeof window.markInitializationComplete === 'function') {
            window.markInitializationComplete();
            console.log('🔐 AUTH: Initialization marked as complete');
          }
        }
      }
    }).catch(error => {
      console.error('❌ SIDEPANEL: Modern architecture initialization failed:', error);
    });
  }
  
  // Initialize other components that need DOM
  
  // === Real-time Event Listeners ===
  // Note: Real-time event listeners are handled by ui-realtime-bindings.js
  console.log('🔔 REALTIME: Real-time event listeners handled by ui-realtime-bindings.js');
  
  console.log('✅ SIDEPANEL: Sidepanel initialization complete');
}

// Make key functions globally available (COMP METHOD)
window.handlePendingContent = handlePendingContent;
window.migrateFromChromeStorage = migrateFromChromeStorage;
window.startPresenceTracking = startPresenceTracking;

// Make StateManager and its methods globally available (COMP METHOD)
window.stateManager = stateManager;
window.getState = (key) => stateManager.getState(key);
window.setState = (key, value) => stateManager.setState(key, value);

// COMP METHOD: Format time display for active users (Online for X mins)
function formatTimeDisplay(enterTime) {
  if (!enterTime) return 'Now';
  
  const now = new Date();
  const enterTimeDate = new Date(enterTime);
  const diffMs = now - enterTimeDate;
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);
  
  // If the difference is negative, it means the timestamp is in the future
  if (diffMs < 0) {
    return 'Now';
  }
  
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

// COMP METHOD: Format last seen display for inactive users (Last seen X ago)
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

// Initialize ProfileManager
let profileManager = null;
if (typeof ProfileManager !== 'undefined') {
  profileManager = new ProfileManager();
  console.log('✅ ProfileManager initialized (will set up profile avatar after authentication)');
} else {
  console.log('⚠️ ProfileManager not available');
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeSidepanel);
} else {
  // DOM is already loaded
  initializeSidepanel();
}
