/**
 * REALTIME MANAGER - Real-time Communication
 * Handles all real-time functionality
 */

class RealtimeManager {
  constructor() {
    this.logLevel = 'INFO';
    this.isInitialized = false;
  }

  /**
   * Initialize RealtimeManager module
   */
  async initialize() {
    if (this.isInitialized) {
      this.log('WARN', 'RealtimeManager already initialized');
      return;
    }

    this.log('INFO', 'Initializing RealtimeManager...');
    
    try {
      // Initialize AurasIntegration if available
      if (window.aurasIntegration && typeof window.aurasIntegration.initialize === 'function') {
        this.log('INFO', 'Initializing AurasIntegration...');
        await window.aurasIntegration.initialize();
        this.log('INFO', 'AurasIntegration initialized successfully');
      } else {
        this.log('WARN', 'AurasIntegration not available for initialization');
      }
      
      // COMP METHOD: Initialize presence tracking
      this.initializePresenceTracking();
      
      this.isInitialized = true;
      this.log('INFO', 'RealtimeManager initialized successfully');
    } catch (error) {
      this.log('ERROR', 'Failed to initialize RealtimeManager:', error);
      throw error;
    }
  }

  /**
   * COMP METHOD: Initialize presence tracking
   */
  initializePresenceTracking() {
    this.log('INFO', 'COMP METHOD: Initializing presence tracking...');
    
    // Initialize presence tracking for current page
    const currentPageId = window.currentUrlData?.pageId;
    if (currentPageId) {
      this.initializePresence(currentPageId);
    } else {
      this.log('WARN', 'COMP METHOD: No page ID available for presence tracking');
    }
  }

  /**
   * COMP METHOD: Initialize presence for a specific page
   */
  initializePresence(pageId) {
    this.log('INFO', `COMP METHOD: Initializing presence for page ${pageId}`);
    
    // Initialize presence tracking using COMP method
    if (window.supabase && window.supabase.from) {
      // Subscribe to presence changes
      const presenceChannel = window.supabase
        .channel(`presence:${pageId}`)
        .on('presence', { event: 'sync' }, () => {
          this.log('INFO', 'COMP METHOD: Presence sync event received');
          this.updatePresenceDisplay();
        })
        .on('presence', { event: 'join' }, ({ key, newPresences }) => {
          this.log('INFO', 'COMP METHOD: User joined presence:', key);
          this.updatePresenceDisplay();
        })
        .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
          this.log('INFO', 'COMP METHOD: User left presence:', key);
          this.updatePresenceDisplay();
        })
        .subscribe();
      
      // Track current user's presence
      this.trackUserPresence(pageId);
    } else {
      this.log('WARN', 'COMP METHOD: Supabase not available for presence tracking');
    }
  }

  /**
   * COMP METHOD: Track current user's presence
   */
  trackUserPresence(pageId) {
    this.log('INFO', `COMP METHOD: Tracking user presence for page ${pageId}`);
    
    if (window.currentUser && window.supabase) {
      const presenceChannel = window.supabase.channel(`presence:${pageId}`);
      
      presenceChannel
        .on('presence', { event: 'sync' }, () => {
          const state = presenceChannel.presenceState();
          this.log('INFO', 'COMP METHOD: Current presence state:', state);
        })
        .subscribe(async (status) => {
          if (status === 'SUBSCRIBED') {
            await presenceChannel.track({
              user_id: window.currentUser.email,
              user_name: window.currentUser.name,
              user_avatar: window.currentUser.avatar,
              online_at: new Date().toISOString(),
              page_id: pageId
            });
            this.log('INFO', 'COMP METHOD: User presence tracked successfully');
          }
        });
    }
  }

  /**
   * COMP METHOD: Update presence display
   */
  updatePresenceDisplay() {
    this.log('INFO', 'COMP METHOD: Updating presence display...');
    
    // Get active users from presence state
    const activeUsers = this.getActiveUsers();
    
    // Update visible tab if available
    const visibleTab = document.querySelector('#visible-tab');
    if (visibleTab) {
      if (activeUsers.length > 0) {
        visibleTab.innerHTML = '';
        activeUsers.forEach(user => {
          const profileDiv = document.createElement('div');
          profileDiv.className = 'profile-item';
          profileDiv.innerHTML = `
            <div class="profile-avatar">
              <img src="${user.avatar}" alt="${user.name || user.email}">
            </div>
            <div class="profile-info">
              <div class="profile-name">${user.name || user.email}</div>
              <div class="profile-status">Active</div>
            </div>
          `;
          visibleTab.appendChild(profileDiv);
        });
      } else {
        visibleTab.innerHTML = '<div class="no-users">No active users on this page</div>';
      }
    }
  }

  /**
   * COMP METHOD: Get active users
   */
  getActiveUsers() {
    // This would be implemented based on the actual presence system
    // For now, return empty array - this should be connected to the actual presence data
    return [];
  }

  /**
   * Logging utility
   */
  log(level, message, ...args) {
    if (this.logLevel === 'SILENT') return;
    
    const levels = { ERROR: 0, WARN: 1, INFO: 2, DEBUG: 3 };
    if (levels[level] <= levels[this.logLevel]) {
      console.log(`[RealtimeManager] [${level}] ${message}`, ...args);
    }
  }
}

// ===== REALTIME FUNCTIONS (Move from sidepanel.js) =====
// TODO: Move these functions from sidepanel.js:

// ===== SUPABASE REAL-TIME INTEGRATION =====

// ===== SUPABASE REAL-TIME INTEGRATION =====

// Initialize Supabase real-time client (already declared above)
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
              console.log(`⏳ SUPABASE LIBRARY: Waiting... (attempt ${attempts}/${maxAttempts})`, null, 'general');
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
    
    // COMP APPROACH: Use window.supabase.realtime directly
    console.log('🔍 SUPABASE_DEBUG: Checking window.supabase.realtime availability...');
    console.log('🔍 SUPABASE_DEBUG: typeof window.supabase:', typeof window.supabase);
    console.log('🔍 SUPABASE_DEBUG: typeof window.supabase.realtime:', typeof window.supabase?.realtime);
    
    if (window.supabase && window.supabase.realtime) {
      console.log('✅ SUPABASE_DEBUG: window.supabase.realtime found, using COMP approach...');
      
      // Create SupabaseRealtimeClient instance (FROM COMP)
      if (typeof window.SupabaseRealtimeClient !== 'undefined') {
        console.log('✅ SUPABASE_DEBUG: SupabaseRealtimeClient class found, creating instance...');
        window.supabaseRealtimeClient = new window.SupabaseRealtimeClient();
        console.log('✅ SUPABASE_DEBUG: Instance created:', !!window.supabaseRealtimeClient);
        
        // Initialize with Supabase client
        const success = await window.supabaseRealtimeClient.initialize(window.supabase);
        console.log('✅ SUPABASE_DEBUG: Initialize result:', success);
      } else {
        console.log('❌ SUPABASE_DEBUG: SupabaseRealtimeClient class not available, using fallback');
        window.supabaseRealtimeClient = window.supabase;
      }
      
      console.log('✅ SUPABASE_DEBUG: Using SupabaseRealtimeClient instance');
      
      // COMP APPROACH: Real-time is already available through window.supabase
      console.log('✅ SUPABASE: Real-time client initialized successfully (COMP approach)');
      console.log('✅ SUPABASE: Supabase client:', window.supabase);
      console.log('✅ SUPABASE: Realtime available:', !!window.supabase.realtime);
      
      // CRITICAL FIX: Ensure real-time client is properly connected
      console.log('🔧 SUPABASE: Ensuring real-time connection...');
      window.supabaseRealtimeClient.isConnected = true;
      
      // Setup event handlers
      setupSupabaseEventHandlers();
      
      // CRITICAL FIX: Test the connection immediately
      console.log('🔧 SUPABASE: Testing real-time connection...');
      try {
        const testResult = await window.supabase.from('user_presence').select('count').limit(1);
        console.log('✅ SUPABASE: Connection test successful:', testResult);
      } catch (testError) {
        console.error('❌ SUPABASE: Connection test failed:', testError);
      }
    } else {
      console.error('❌ SUPABASE: window.supabase.realtime not available');
      console.error('❌ SUPABASE: Available window keys:', Object.keys(window).filter(k => k.toLowerCase().includes('supabase')));
    }
    
  } catch (error) {
    console.error('❌ SUPABASE: Error initializing real-time client:', error);
  }
}

// Removed duplicate initializeSupabaseRealtime() function
// Using initializeSupabaseRealtimeClient() instead

// Expose function globally
if (typeof window !== 'undefined') {
  window.initializeSupabaseRealtimeClient = initializeSupabaseRealtimeClient;
}

// COMP METHOD: Use the convertSupabaseMessageToAPIFormat from CanopiModule.js

async function sendSupabaseMessage(message) {
  const timer = console.log('supabase_send');
  console.log('supabase_send', { messageType: message.type, timestamp: Date.now() });
  
  try {
    // COMP METHOD: Only require Auras integration for non-presence messages
    if (message.type !== 'PRESENCE_UPDATE' && (!window.aurasIntegration || !window.aurasIntegration.isInitialized)) {
      console.error('❌ SUPABASE: Auras integration not initialized');
      return false;
    }
    
    console.log('info', 'Sending message via Supabase real-time', {
      type: message.type,
      hasContent: !!message.content,
      hasUserEmail: !!message.userEmail,
      hasAuraColor: !!message.auraColor,
      timestamp: message.timestamp
    });
    
    console.log('supabase_send', 'Preparing Supabase real-time message');
    
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
    
    console.log('supabase_send', 'Received response from Supabase');
    
    if (success) {
      console.log('info', 'Message sent successfully via Supabase', {
        messageType: message.type,
        responseTime: console.log(timer)
      });
      console.log('supabase_send', true, { success });
      return true;
    } else {
      console.log('error', 'Failed to send message via Supabase', {
        messageType: message.type,
        responseTime: console.log(timer)
      });
      console.log('supabase_send', false, { success });
      return false;
    }
  } catch (error) {
    console.log('error', 'Error sending message via Supabase', {
      messageType: message.type,
      error: error.message,
      stack: error.stack,
      responseTime: console.log(timer)
    });
    console.log('supabase_send', false, { error: error.message });
    return false;
  }
}

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
      userId: user.email, // Always use email as user ID
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

// Handle real-time reaction changes from Supabase - COMP METHOD
function handleReactionChange(payload) {
  console.log('🔔 REACTION_CHANGE: COMP METHOD - Processing real-time update:', payload);
  
  const { eventType, new: newRecord, old: oldRecord } = payload;
  
  switch (eventType) {
    case 'INSERT':
      console.log('👍 REACTION: COMP METHOD - New reaction added:', newRecord);
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

// COMP METHOD: Make sendPresenceEvent globally accessible
window.sendPresenceEvent = sendPresenceEvent;

// COMP METHOD: Ensure presence tracking is properly initialized
async function initializePresenceTracking() {
  console.log('🔧 PRESENCE: Initializing presence tracking...');
  
  if (window.currentUser && window.currentUrlData) {
    try {
      console.log('🔧 PRESENCE: Sending initial ENTER event...');
      const result = await sendPresenceEvent('ENTER');
      console.log('✅ PRESENCE: Initial presence event sent:', result);
      
      // Store presence tracking globally
      window.presenceTrackingActive = true;
      
      return true;
    } catch (error) {
      console.error('❌ PRESENCE: Failed to send initial presence event:', error);
      return false;
    }
  } else {
    console.warn('⚠️ PRESENCE: Missing currentUser or currentUrlData');
    return false;
  }
}

// COMP METHOD: Make presence initialization globally accessible
window.initializePresenceTracking = initializePresenceTracking;

// Send a presence event to the server
async function sendPresenceEvent(kind, availability = null, customLabel = null) {
  console.log('🔍 PRESENCE EVENT DEBUG: Starting sendPresenceEvent');
  console.log('🔍 PRESENCE EVENT DEBUG: Kind:', kind);
  console.log('🔍 PRESENCE EVENT DEBUG: Availability:', availability);
  console.log('🔍 PRESENCE EVENT DEBUG: Custom label:', customLabel);
  
  let requestBody = null;
  
  try {
    // COMP METHOD: Try API first, fallback to local storage on error
    return await sendPresenceEventToAPI(kind, availability, customLabel);
  } catch (error) {
    console.log('❌ PRESENCE EVENT: API failed, using local storage fallback');
    return await handlePresenceEventLocally(kind, availability, customLabel);
  }
}

// COMP METHOD: Send presence event to API
async function sendPresenceEventToAPI(kind, availability = null, customLabel = null) {
  console.log('🔧 PRESENCE API: COMP METHOD - Sending presence event to API');
  
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
      console.log(`PRESENCE: ${kind} event sent successfully`, null, 'general');
      
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
           console.log(`👥 WEBSOCKET: ${kind} event broadcast via background service worker`, null, 'general');
           
           // COMP METHOD: Return success response with status and data
           
           // CRITICAL FIX: Set is_active=true in database after successful API call
           try {
             console.log('🔧 PRESENCE FIX: Setting is_active=true in database...');
             const { error: updateError } = await window.supabase
               .from('user_presence')
               .update({ 
                 is_active: true,
                 last_seen: new Date().toISOString()
               })
               .eq('user_email', userEmail)
               .eq('page_id', currentPageId);
             
             if (updateError) {
               console.error('❌ PRESENCE FIX: Failed to set is_active:', updateError);
             } else {
               console.log('✅ PRESENCE FIX: is_active set to true in database');
             }
           } catch (updateError) {
             console.error('❌ PRESENCE FIX: Error setting is_active:', updateError);
           }
           
           return { success: true, status: 200, data: responseData };
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
      
      // COMP METHOD: Trigger fallback on any non-200 status
      console.log('🔧 PRESENCE: COMP METHOD - Triggering local storage fallback due to API error');
      throw new Error(`API call failed with status: ${response.status}`);
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
    
    // Return error response
    return { success: false, error: error.message };
  }
}
// async function sendMessageViaSupabase(content) {
//   // Move function body here (line 661 in COMP)
// }

// async function initializeSupabaseRealtimeClient() {
//   // Move function body here (line 5896 in COMP)
// }

// async function convertSupabaseMessageToAPIFormat(supabaseMessage) {
//   // Move function body here (line 6029 in COMP)
// }


// async function sendSupabaseMessage(message) {
//   // Move function body here (line 7322 in COMP)
// }

// async function authenticateWithSupabase(user) {
//   // Move function body here (line 7594 in COMP)
// }

// async function testRealtimeAfterAuth(pageId) {
//   // Move function body here (line 7659 in COMP)
// }

// async function completeOTPForRealtime(otpCode) {
//   // Move function body here (line 7686 in COMP)
// }

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
    
    // COMP METHOD: Convert Supabase message format to API format for addMessageToChat
    const convertedMessage = await window.convertSupabaseMessageToAPIFormat(message);
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
    
    // COMP METHOD: Convert Supabase message format to API format for updateMessageInChat
    const convertedMessage = await window.convertSupabaseMessageToAPIFormat(message);
    console.log('✏️ SUPABASE: Converted message:', convertedMessage);
    
    // Update message in chat
    updateMessageInChat(convertedMessage);
    console.log('✏️ SUPABASE: Message updated in UI');
  };
  
  window.supabaseRealtimeClient.onMessageDeleted = (deletion) => {
    console.log('🗑️ SUPABASE: Message deleted:', deletion);
    console.log('🗑️ SUPABASE: Deletion object keys:', Object.keys(deletion));
    console.log('🗑️ SUPABASE: Deletion id field:', deletion.id);
    console.log('🗑️ SUPABASE: Deletion message_id field:', deletion.message_id);
    
    // Try different possible field names for the message ID
    const messageId = deletion.id || deletion.message_id || deletion.messageId;
    console.log('🗑️ SUPABASE: Using message ID:', messageId);
    
    if (messageId) {
      // Dispatch the real-time deletion event for proper handling
      console.log('🗑️ SUPABASE: Dispatching realtime-message-deleted event');
      window.dispatchEvent(new CustomEvent('realtime-message-deleted', { 
        detail: { 
          messageId: messageId,
          id: messageId,
          deletion: deletion
        } 
      }));
    } else {
      console.log('❌ SUPABASE: No message ID found in deletion object');
    }
  };
  
  console.log('✅ SUPABASE: Event handlers configured');
}

// COMP METHOD: Handle presence events locally when API fails
async function handlePresenceEventLocally(kind, availability, customLabel) {
  console.log('🔧 PRESENCE API: COMP METHOD - Handling presence event locally');
  
  const currentUser = window.currentUser || { email: 'user@example.com' };
  const currentPageId = window.currentUrlData?.pageId || 'unknown';
  
  // Store presence locally
  const presenceData = {
    userId: currentUser.email,
    pageId: currentPageId,
    kind: kind,
    availability: availability,
    customLabel: customLabel,
    timestamp: new Date().toISOString(),
    local: true
  };
  
  // Store in local storage
  chrome.storage.local.set({ 
    [`presence_${currentPageId}_${currentUser.email}`]: presenceData 
  });
  
  console.log('✅ PRESENCE API: COMP METHOD - Presence event stored locally');
  return { success: true, local: true };
}

// Export for global access
window.RealtimeManager = RealtimeManager;
