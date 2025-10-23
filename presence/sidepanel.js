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
window.getCurrentUserAvatarBgColor = window.getCurrentUserAvatarBgColor || function() { return '#ffffff'; };
window.setCustomAvatarColor = window.setCustomAvatarColor || function() {};
window.resetCustomAvatarColor = window.resetCustomAvatarColor || function() {};
window.getCurrentUserAvatarColor = window.getCurrentUserAvatarColor || function() { return '#ffffff'; };

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
