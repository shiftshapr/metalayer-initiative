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
      // TODO: Initialize real-time systems here
      
      this.isInitialized = true;
      this.log('INFO', 'RealtimeManager initialized successfully');
    } catch (error) {
      this.log('ERROR', 'Failed to initialize RealtimeManager:', error);
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
      console.log(`[RealtimeManager] [${level}] ${message}`, ...args);
    }
  }
}

// ===== REALTIME FUNCTIONS (Move from sidepanel.js) =====
// TODO: Move these functions from sidepanel.js:

// ===== SUPABASE REAL-TIME INTEGRATION =====
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

// Removed duplicate initializeSupabaseRealtime() function
// Using initializeSupabaseRealtimeClient() instead

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

// Export for global access
window.RealtimeManager = RealtimeManager;
