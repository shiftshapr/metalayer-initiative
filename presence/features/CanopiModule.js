/**
 * CANOPI MODULE - Messages and Chat
 * Handles all message and chat functionality
 */

class CanopiModule {
  constructor() {
    this.logLevel = 'INFO';
    this.isInitialized = false;
  }

  /**
   * Initialize Canopi module
   */
  async initialize() {
    if (this.isInitialized) {
      this.log('WARN', 'CanopiModule already initialized');
      return;
    }

    this.log('INFO', 'Initializing CanopiModule...');
    
    try {
      // TODO: Initialize message and chat systems here
      
      this.isInitialized = true;
      this.log('INFO', 'CanopiModule initialized successfully');
    } catch (error) {
      this.log('ERROR', 'Failed to initialize CanopiModule:', error);
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
      console.log(`[CanopiModule] [${level}] ${message}`, ...args);
    }
  }

  logComputedStyles(element, label) {
    if (!element) {
      this.log('WARN', `Cannot log styles for null element: ${label}`);
      return;
    }

    const computed = window.getComputedStyle(element);
    const relevantStyles = {
      display: computed.display,
      visibility: computed.visibility,
      opacity: computed.opacity,
      position: computed.position,
      top: computed.top,
      left: computed.left,
      right: computed.right,
      bottom: computed.bottom,
      width: computed.width,
      height: computed.height,
      minWidth: computed.minWidth,
      minHeight: computed.minHeight,
      maxWidth: computed.maxWidth,
      maxHeight: computed.maxHeight,
      margin: computed.margin,
      marginTop: computed.marginTop,
      marginRight: computed.marginRight,
      marginBottom: computed.marginBottom,
      marginLeft: computed.marginLeft,
      padding: computed.padding,
      paddingTop: computed.paddingTop,
      paddingRight: computed.paddingRight,
      paddingBottom: computed.paddingBottom,
      paddingLeft: computed.paddingLeft,
      border: computed.border,
      borderTop: computed.borderTop,
      borderRight: computed.borderRight,
      borderBottom: computed.borderBottom,
      borderLeft: computed.borderLeft,
      flexDirection: computed.flexDirection,
      flexWrap: computed.flexWrap,
      alignItems: computed.alignItems,
      justifyContent: computed.justifyContent,
      boxSizing: computed.boxSizing,
      zIndex: computed.zIndex,
      overflow: computed.overflow,
      overflowX: computed.overflowX,
      overflowY: computed.overflowY
    };

    this.log('INFO', `=== COMPUTED STYLES FOR ${label} ===`);
    Object.entries(relevantStyles).forEach(([prop, value]) => {
      this.log('INFO', `${prop}: ${value}`);
    });
    this.log('INFO', `=== END STYLES FOR ${label} ===`);
  }

}

// ===== MESSAGE AND CHAT FUNCTIONS (Move from sidepanel.js) =====

async function sendMessageViaSupabase(content, parentId = null) {
  console.log('🔥🔥🔥 ============================================');
  console.log('🔥🔥🔥 SEND_MESSAGE_VIA_SUPABASE: ENTRY POINT');
  console.log('🔥🔥🔥 ============================================');
  console.log('📡 SUPABASE_MESSAGE: Starting real-time message broadcast...');
  console.log('📡 SUPABASE_MESSAGE: Content:', content);
  console.log('📡 SUPABASE_MESSAGE: Content type:', typeof content);
  console.log('📡 SUPABASE_MESSAGE: Content length:', content?.length);
  console.log('📡 SUPABASE_MESSAGE: ParentId:', parentId);
  
  // Use robust integration system if available
  console.log('📡 SUPABASE_MESSAGE: Checking robust integration...');
  console.log('📡 SUPABASE_MESSAGE: window.robustIntegration exists:', !!window.robustIntegration);
  console.log('📡 SUPABASE_MESSAGE: window.robustIntegration.isInitialized:', window.robustIntegration?.isInitialized);
  
  if (window.robustIntegration && window.robustIntegration.isInitialized) {
    console.log('📡 SUPABASE_MESSAGE: Using robust integration system...');
    try {
      // CRITICAL FIX: Pass parentId to robust integration if available
      const messageData = await window.robustIntegration.sendMessage(content, parentId);
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
      // CRITICAL FIX: Pass parentId to sendMessage for replies
      const messageData = await client.sendMessage(content, parentId);
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


// REMOVED: Duplicate addMessageToChat function - keeping only COMP method implementation

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

function getSenderName(userId) {
  // For now, return a formatted version of the userId
  // Later this could be enhanced to fetch real user names from the API
  if (userId === 'test-user') return 'Test User';
  if (userId === 'test-user-2') return 'Test User 2';
  if (userId.startsWith('116467399993975200419')) return 'Dave Room';
  return `User ${userId.substring(0, 8)}...`;
}

// REMOVED: Duplicate getSenderInitial - using HTML version at line 2595

// Convert URLs to clickable links
function convertUrlsToLinks(text) {
  // URL regex pattern
  if (!text) return '';
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  return text.replace(urlRegex, '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>');
}

async function getSenderAvatar(author) {
  // Use HTML version of getSenderInitial (defined at line 2595)
  if (!author) {
    const initial = 'U';
    // CLEAN HTML REFACTOR: Only keep dynamic background-color inline
    return `<div class="avatar-initial" style="background-color: ${window.AVATAR_FALLBACK_COLOR || '#ccc'};"><span>${initial}</span></div>`;
  }
  
  // COMP METHOD: Always try to get the latest aura color from presence data
  // This ensures cross-profile updates work correctly for ALL users
  const currentUserId = window.currentUser?.id || window.currentUser?.user_id;
  if ((author.id || author.user_id) === (window.currentUser?.id || window.currentUser?.user_id)) {
    // For current user's messages, use current aura color
    const currentAuraColor = getCurrentUserAvatarBgColor();
    if (currentAuraColor && currentAuraColor !== window.AVATAR_FALLBACK_COLOR) {
      author.auraColor = currentAuraColor;
      console.log('🔧 AURA: Using current user aura color:', currentAuraColor);
      }
  } else {
    // For other users' messages, try to get the latest aura color from presence data
    // This ensures real-time aura updates for all users
    const latestAuraColor = getLatestAuraColorFromPresence(author.id || author.user_id);
    if (latestAuraColor && latestAuraColor !== window.AVATAR_FALLBACK_COLOR) {
      author.auraColor = latestAuraColor;
      console.log('🔧 AURA: Using real-time aura color for', author.name || author.id, ':', latestAuraColor);
      } else {
      // Fallback to generated color if no real-time color available
      console.log('🔧 AURA: No real-time color found for', author.name || author.id, ', using generated color');
      }
  }
  
  // COMP METHOD: Use unified avatar system for consistency (same as COMP)
  let avatarHTML;
  const avatarUtils = window.AvatarUtils || (typeof AvatarUtils !== 'undefined' ? AvatarUtils : null);
  if (avatarUtils && typeof avatarUtils.createUnifiedAvatar === 'function') {
    avatarHTML = await avatarUtils.createUnifiedAvatar(author, 'message', {
    size: 32,
    showStatus: true,
    showAura: true,
    allowGenericOnDeleted: false,
    statusColor: '#22c55e' // Default green for message avatars
  });
  } else {
    console.warn('⚠️ COMP AVATAR: AvatarUtils not available, using fallback');
    // Fallback avatar HTML (same style as COMP)
    // CLEAN HTML REFACTOR: Only keep dynamic background-color inline
    avatarHTML = `<div class="avatar" style="background-color: ${window.AVATAR_FALLBACK_COLOR};">${(author.name || 'U').charAt(0).toUpperCase()}</div>`;
  }
  
  // DIAGNOSTIC: Log avatar resolution
  if (window.messageDiagnostic) {
    // Extract avatar URL from the HTML to determine if it's real or generic
    const avatarUrlMatch = avatarHTML.match(/src="([^"]+)"/);
    const avatarUrl = avatarUrlMatch ? avatarUrlMatch[1] : 'unknown';
    const isReal = !avatarUrl.includes('default-user');
    
    window.messageDiagnostic.logAvatarResolution(
      author.id || author.user_id,
      avatarUrl,
      isReal ? 'real' : 'generic'
    );
  }
  
  return avatarHTML;
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
      
      // Create a map of user IDs to their current aura colors
      const auraColorMap = {};
      presenceData.active.forEach(user => {
        // Use userId for identification (privacy-safe)
        const userId = user.id || user.userId;
        if (userId && user.auraColor) {
          auraColorMap[userId] = user.auraColor;
          }
      });
      
      // Find all message containers and re-render their avatars with updated aura colors
      const messageContainers = document.querySelectorAll('.message');
      for (const messageContainer of messageContainers) {
        const avatarContainer = messageContainer.querySelector('.avatar-container');
        if (avatarContainer) {
          // Get the message data to find the author
          const messageId = messageContainer.getAttribute('data-message-id');
          if (messageId) {
            // Find the message in the current chat data
            const messageData = window.currentChatData?.find(msg => msg.id === messageId);
            if (messageData && messageData.author) {
              const author = messageData.author;
              const userId = author.id || author.user_id;
              
              if (userId && auraColorMap[userId]) {
                // Update the author's aura color
                author.auraColor = auraColorMap[userId];
                
                // Re-render the avatar with the updated aura color
                const newAvatarHTML = await getSenderAvatar(author);
                avatarContainer.innerHTML = newAvatarHTML;
                
                }
            }
          }
        }
      }
      
      console.log('✅ MESSAGE_AVATAR: Message avatars refreshed with current presence data');
    } else {
      console.log('⚠️ MESSAGE_AVATAR: No presence data found, skipping avatar refresh');
    }
  } catch (error) {
    console.error('❌ MESSAGE_AVATAR: Error refreshing message avatars:', error);
  }
}

// CHROME EXTENSION WEBSOCKET FIX: Send WebSocket message via background service worker
// SUPABASE REAL-TIME: Send message via Supabase real-time
async function sendSupabaseMessage(message) {
  const timer = Date.now();
  console.log('Starting Supabase send flow:', { messageType: message.type, timestamp: Date.now() });
  
  try {
    if (!window.aurasIntegration || !window.aurasIntegration.isInitialized) {
      console.error('❌ SUPABASE: Auras integration not initialized');
      return false;
    }
    
    console.log('Sending message via Supabase real-time:', {
      type: message.type,
      hasContent: !!message.content,
      hasUserId: !!(message.userId || message.user_id),
      hasAuraColor: !!message.auraColor,
      timestamp: message.timestamp
    });
    
    console.log('Preparing Supabase real-time message');
    
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
    
    console.log('Received response from Supabase');
    
    if (success) {
      console.log('Message sent successfully via Supabase:', {
        messageType: message.type,
        responseTime: Date.now() - timer
      });
      return true;
    } else {
      console.error('Failed to send message via Supabase:', {
        messageType: message.type,
        responseTime: Date.now() - timer
      });
      return false;
    }
  } catch (error) {
    console.error('Error sending message via Supabase:', {
      messageType: message.type,
      error: error.message,
      stack: error.stack,
      responseTime: Date.now() - timer
    });
    return false;
  }
}
// SD1 FIX: Convert Supabase message format to API format for addMessageToChat
async function convertSupabaseMessageToAPIFormat(supabaseMessage) {
  console.log('🔄 CONVERT_MESSAGE: Converting Supabase message to API format');
  console.log('🔄 CONVERT_MESSAGE: Supabase message:', supabaseMessage);
  
  // Extract user info - UUID-only format (privacy-safe)
  const userId = supabaseMessage.user_id || supabaseMessage.AppUser?.id || supabaseMessage.authorId;
  
  // ROOT CAUSE FIX: Do NOT use Supabase AppUser or author data as source of truth
  // Always fetch from backend /v1/users/:id to get correct author
  // Start with minimal data - will be enriched from backend
  let authorData = {
    name: supabaseMessage.AppUser?.name || supabaseMessage.author?.name || 'User',
    handle: supabaseMessage.AppUser?.handle || supabaseMessage.AppUser?.name || 'User',
    id: userId,
    user_id: userId,
    avatarUrl: supabaseMessage.author?.avatarUrl || supabaseMessage.AppUser?.avatar_url || null,
    auraColor: null // Will be set from backend or visibility data
  };
  try {
    console.log('🔄 CONVERT_MESSAGE: Fetching author data from user_presence...');
    console.log('🔍 REMOTE AVATAR DEBUG: User ID:', userId);
    console.log('🔍 REMOTE AVATAR DEBUG: Page ID:', supabaseMessage.page_id);
    
    // ROOT CAUSE FIX: Always fetch author data from backend to get correct author
    // DO NOT assume matching user_id means current user - always use actual author from database
    let avatarFound = false;
    
    // First try: Fetch author from backend /v1/users/:id (source of truth)
    if (window.api && userId) {
      try {
        const resp = await window.api.request(`/v1/users/${encodeURIComponent(userId)}`, { method: 'GET', allow404: true });
        if (resp) {
          // ROOT CAUSE FIX: Always use backend response for author data (correct author)
          authorData.avatarUrl = resp.avatarUrl || authorData.avatarUrl;
          authorData.name = resp.name || authorData.name;
          authorData.handle = resp.handle || authorData.handle;
          avatarFound = true;
          console.log('✅ CONVERT_MESSAGE: Fetched author from backend /v1/users:', resp.name, resp.avatarUrl);
        }
      } catch (e) {
        console.log('⚠️ CONVERT_MESSAGE: /v1/users lookup failed:', e);
      }
    }
    
    // Second try: Check if we have this user in our current visibility data (fallback)
    if (!avatarFound && window.currentVisibilityDataUnfiltered && window.currentVisibilityDataUnfiltered.active) {
      const userInVisibility = window.currentVisibilityDataUnfiltered.active.find(u => u.id === userId || u.userId === userId);
      if (userInVisibility && userInVisibility.avatarUrl) {
        console.log('✅ CONVERT_MESSAGE: Found avatar in current visibility data:', userInVisibility.avatarUrl);
        authorData.avatarUrl = userInVisibility.avatarUrl;
        authorData.auraColor = userInVisibility.auraColor || window.currentUser?.auraColor || window.AVATAR_FALLBACK_COLOR;
        authorData.name = userInVisibility.name || authorData.name;
        avatarFound = true;
      }
    }
    
    // Last resort: Only use current user data if userId matches AND we still haven't found author
    // This should rarely happen - backend should always return author data
    if (!avatarFound && window.currentUser && (userId === window.currentUser.id || userId === window.currentUser.user_id)) {
      console.warn('⚠️ CONVERT_MESSAGE: Using current user data as fallback - backend author lookup failed');
      authorData.avatarUrl = authorData.avatarUrl || window.currentUser.avatarUrl || window.currentUser.picture;
      authorData.name = authorData.name || window.currentUser.name || 'User';
      avatarFound = true;
    }
    
    // No synthetic fallback here; leave avatarUrl null if not found
  } catch (error) {
    console.warn('⚠️ CONVERT_MESSAGE: Exception fetching author data:', error);
  }
  
  // Convert to API format that addMessageToChat expects
  // Handle both Supabase format (content) and API format (body)
  const messageText = supabaseMessage.body || supabaseMessage.content || '';
  const apiMessage = {
    id: supabaseMessage.id,
    body: messageText,
    content: messageText, // Also include content field for compatibility
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
// Guard to prevent duplicate loading
let isLoadingChatHistory = false;
let lastLoadedPageId = null;

// CRITICAL FIX: Export loadChatHistory immediately so it's available when tab changes
async function loadChatHistory(communityId = null) {
  // COMP METHOD: Enhanced duplicate prevention
  if (isLoadingChatHistory) {
    console.log('🔍 CHAT_LOAD: Already loading chat history, skipping duplicate call');
    return;
  }
  
  // CRITICAL FIX: Don't load chat history if we're in focus mode
  const chatMessages = document.querySelector('.chat-messages');
  if (chatMessages && chatMessages.dataset.focusMode === 'true') {
    console.log('🔒 CHAT_LOAD: Focus mode active, skipping chat history load');
    return;
  }
  
  // COMP METHOD: Check if messages are already loaded for this page - return BEFORE any clearing
  const currentPageId = window.currentUrlData?.pageId;
  const existingMessages = document.querySelectorAll('.message');
  
  // CRITICAL FIX: Only skip if page hasn't changed AND messages exist
  // If page changed, we should reload even if messages exist
  const pageChanged = lastLoadedPageId !== currentPageId;
  if (!pageChanged && lastLoadedPageId === currentPageId && existingMessages.length > 0) {
    console.log('🔍 CHAT_LOAD: Messages already loaded for this page, skipping reload');
    console.log('🔍 CHAT_LOAD: Existing messages:', existingMessages.length);
    return;
  }
  
  // CRITICAL FIX: If page changed, clear the flag to allow reload
  if (pageChanged) {
    console.log(`🔍 CHAT_LOAD: Page changed from ${lastLoadedPageId} to ${currentPageId}, will reload messages`);
  }
  
  // CRITICAL FIX: Check if this page might have messages (not chrome:// pages)
  // NOTE: pageChanged is already calculated above
  // Get current URI once (used for both Chrome internal check and mightHaveMessages check)
  const currentUri = window.currentUrlData?.rawUrl || '';
  
  // COMP METHOD: Chrome internal pages work normally (like COMP)
  if (currentUri && (currentUri.startsWith('chrome://') || currentUri.startsWith('chrome-extension://'))) {
    console.log('🔍 CHAT_LOAD: Chrome internal page detected - processing normally like COMP');
    // Continue with normal message loading like COMP method
  }
  const mightHaveMessages = currentUri && 
    !currentUri.startsWith('chrome://') && 
    !currentUri.startsWith('chrome-extension://') &&
    !currentUri.startsWith('about:') &&
    !currentUri.startsWith('moz-extension://');
  
  if (pageChanged && mightHaveMessages) {
    console.log(`🔍 CHAT_LOAD: Page changed from ${lastLoadedPageId} to ${currentPageId}, clearing messages`);
    if (chatMessages) {
      // CRITICAL FIX: Hide all existing messages while loading (both default and focus mode)
      const existingMessages = chatMessages.querySelectorAll('.message, .message-reply, .focus-messages-container, .focus-back-row');
      existingMessages.forEach(msg => {
        msg.style.display = 'none';
        msg.style.visibility = 'hidden';
      });
      
      // Show loading indicator ONLY on pages that might have messages
      chatMessages.innerHTML = `
        <div class="chat-loading-indicator">
          <div class="loading-spinner"></div>
          <div class="loading-text">Loading messages...</div>
        </div>
      `;
      
      // Add spinner animation if not already in CSS
      if (!document.querySelector('#loading-spinner-style')) {
        const style = document.createElement('style');
        style.id = 'loading-spinner-style';
        style.textContent = `
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          .chat-loading-indicator {
            display: flex !important;
            flex-direction: column !important;
            align-items: center !important;
            justify-content: center !important;
            padding: 40px !important;
            min-height: 200px !important;
          }
        `;
        document.head.appendChild(style);
      }
    }
    // Clear global chat data
    if (window.currentChatData) {
      window.currentChatData = null;
    }
    // Reset last loaded URI to force reload
    lastLoadedUri = null;
  }
  isLoadingChatHistory = true;
  lastLoadedPageId = currentPageId;
  
  // Only clear messages if page changed (already cleared above) OR if we need a fresh load
  // DO NOT clear if messages already exist and page didn't change
  if (chatMessages && pageChanged) {
    // Already cleared above, just log
    console.log('🔍 CHAT_LOAD: Messages cleared due to page change');
  } else if (chatMessages && chatMessages.children.length === 0) {
    // Container is empty, safe to clear (though it's already empty)
    console.log('🔍 CHAT_LOAD: Container is empty, ready to load messages');
  } else if (chatMessages && chatMessages.children.length > 0) {
    // Messages exist and page didn't change - DO NOT CLEAR
    console.log('🔍 CHAT_LOAD: Messages already exist on same page, preserving them');
  }
  try {
    // Get user's active communities
    const activeCommunitiesData = await getState('activeCommunities');
    const primaryCommunity = await getState('primaryCommunity');
    const currentCommunity = await getState('currentCommunity');
    const activeCommunities = activeCommunitiesData || [primaryCommunity || currentCommunity || 'comm-001'];
    
    // MODERN LOGGING: Structured logging for chat loading
    window.logger?.info('CHAT', 'Loading chat history for active communities', { 
      communities: activeCommunities,
      count: activeCommunities.length 
    });
    
    // Get normalized URL for page-specific messages - SAME AS VISIBILITY
    const urlData = await normalizeCurrentUrl();
    const currentUri = urlData.normalizedUrl; // Use normalized URL for consistency
    // MODERN LOGGING: Structured logging for URI processing
    window.logger?.info('CHAT', 'Loading chat history for normalized URI', { 
      normalizedUri: currentUri,
      rawUrl: urlData.rawUrl,
      communities: activeCommunities
    });
    console.log('CHAT_LOAD: Loading chat history for active communities');
    console.log('CHAT_LOAD: Processing URI and communities');
    
    // CRITICAL FIX: If page changed, always reload (even if URI is same, pageId changed)
    // Only skip if page hasn't changed AND URI is same AND messages exist
    if (!pageChanged && lastLoadedUri === currentUri) {
      // CRITICAL FIX: Check if messages are still visible in the DOM
      const chatMessages = document.querySelector('.chat-messages');
      if (chatMessages) {
        const visibleMessages = chatMessages.querySelectorAll('.message:not([style*="display: none"])');
        const hasPlaceholder = chatMessages.innerHTML.includes('No messages yet');
        
        if (visibleMessages.length > 0) {
          console.log('CHAT_LOAD: Messages are still visible, skipping reload');
          isLoadingChatHistory = false;
          return;
        } else if (!hasPlaceholder) {
          // Continue with reload to restore messages
          console.log('CHAT_LOAD: No visible messages, will reload');
        } else {
          isLoadingChatHistory = false;
          return;
        }
      }
    }
    
    // CRITICAL FIX: If page changed, reset lastLoadedUri to force reload
    if (pageChanged) {
      console.log('CHAT_LOAD: Page changed, resetting lastLoadedUri to force reload');
      lastLoadedUri = null;
    }
    
    // Messages arrive via Supabase real-time
    
    // Add a longer delay to ensure server has processed any recent messages
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // CRITICAL FIX: Update lastLoadedUri after successful loading (at end of function)
    // For now, we proceed with loading messages
    
    // Load messages from all active communities
    const allConversations = [];
    const communitiesData = await getState('communities');
    const communities = communitiesData || [];
    
    for (const communityId of activeCommunities) {
      try {
        console.log('CHAT_LOAD: Requesting chat history from API');
        // Load initial chat history via API, then real-time updates will handle new messages
        const response = await api.getChatHistory(communityId, null, currentUri);
        
        console.log('CHAT_LOAD: API response received');
        if (response.conversations && response.conversations.length > 0) {
          console.log(`CHAT_LOAD: Found ${response.conversations.length} conversations for community ${communityId}`);
          response.conversations.forEach((conv, index) => {
            console.log(`CHAT_LOAD: Conversation ${index + 1}:`, {
              id: conv.id,
              posts: conv.posts?.length || 0,
              communityId: conv.communityId || 'N/A'
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
          console.log(`CHAT_LOAD: Added ${conversationsWithCommunity.length} conversations from ${communityName}`);
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
        // CRITICAL FIX: Continue even if API fails - messages will come via Supabase real-time
        console.log(`⚠️ CHAT_LOAD: Backend API offline for ${communityId}, but real-time messages will still work`);
      }
    }
    
    console.log('🔍 CHAT_LOAD: === FINAL COMBINED RESULTS ===');
    console.log('🔍 CHAT_LOAD: Combined chat history from all communities:', allConversations);
    
    const chatMessages = document.querySelector('.chat-messages');
    if (!chatMessages) {
      console.error('❌ CHAT_LOAD: No .chat-messages element found in DOM!');
      return;
    }
    console.log('✅ CHAT_LOAD: Found .chat-messages element');
    
    // Log current messages before adding new ones
    const currentMessages = chatMessages.querySelectorAll('.message');
    console.log('🔍 CHAT_LOAD: Current message IDs:', Array.from(currentMessages).map(m => m.getAttribute('data-message-id')));
    console.log('🔍 CHAT_LOAD: Adding messages to existing chat container (messages already cleared at start if needed)');
    
    if (allConversations.length === 0) {
      console.warn('⚠️ CHAT_LOAD: NO MESSAGES TO DISPLAY - No conversations found for any active community on this page');
      console.warn('⚠️ CHAT_LOAD: Leaving placeholder text in place');
      // CRITICAL FIX: Remove loading indicator before showing empty state
      const loadingIndicator = chatMessages.querySelector('.chat-loading-indicator');
      if (loadingIndicator) {
        loadingIndicator.remove();
      }
      chatMessages.innerHTML = '<p style="text-align: center; color: var(--text-secondary); padding: 20px;">No messages yet. Start a conversation!</p>';
      return;
    }
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
            if (directReplies.length > 0) {
              console.log('DELETED_MSG_DEBUG: Found direct replies for deleted message');
            }
            
            // Check if this message should be skipped
            if (mainThreadPost.deletedAt && !mainThreadPost.hasReplies) {
              continue;
            } else if (mainThreadPost.deletedAt && mainThreadPost.hasReplies) {
              }
            // Calculate reaction count for this specific message
            const messageReactions = conversation.reactions ? conversation.reactions.filter(r => r.postId === mainThreadPost.id) : [];
            mainThreadPost.reactionCount = messageReactions.length;
            
            // COMP METHOD: Use exact COMP filtering logic
            // COMP METHOD: Comprehensive debugging exactly as COMP does
            console.log('🔍 COMP DEBUG: === MAIN THREAD MESSAGE ANALYSIS ===');
            console.log('🔍 COMP DEBUG: Message ID:', mainThreadPost.id);
            console.log('🔍 COMP DEBUG: Message deletedAt:', mainThreadPost.deletedAt);
            console.log('🔍 COMP DEBUG: Message body:', JSON.stringify(mainThreadPost.body));
            console.log('🔍 COMP DEBUG: Message body trimmed:', mainThreadPost.body ? mainThreadPost.body.trim() : 'NO_BODY');
            console.log('🔍 COMP DEBUG: Body equals [Deleted]:', mainThreadPost.body ? mainThreadPost.body.trim() === '[Deleted]' : 'NO_BODY');
            console.log('🔍 COMP DEBUG: Total direct replies:', directReplies.length);
            console.log('🔍 COMP DEBUG: Non-deleted replies:', directReplies.filter(r => !r.deletedAt).length);
            console.log('🔍 COMP DEBUG: hasReplies:', mainThreadPost.hasReplies);
            console.log('🔍 COMP DEBUG: replyCount:', mainThreadPost.replyCount);
            if (directReplies.length > 0) {
              console.log('🔍 COMP DEBUG: Direct replies details:', directReplies.map(r => ({ id: r.id, deletedAt: r.deletedAt, body: r.body })));
            }
            
            // COMP METHOD: First check - only deletedAt field (EXACT COMP LOGIC)
            if (mainThreadPost.deletedAt && !mainThreadPost.hasReplies) {
              console.log('🔍 COMP DEBUG: SKIPPING deleted main thread without replies (deletedAt check):', mainThreadPost.id);
              continue;
            } else if (mainThreadPost.deletedAt && mainThreadPost.hasReplies) {
              console.log('🔍 COMP DEBUG: SHOWING deleted main thread WITH replies (deletedAt check):', mainThreadPost.id);
            }
            
            // COMP METHOD: Second check - Skip deleted main thread unless it has NON-DELETED replies (EXACT COMP LOGIC)
            // Check both deletedAt field and [Deleted] body content
            const isMainThreadDeleted = mainThreadPost.deletedAt || (mainThreadPost.body && mainThreadPost.body.trim() === '[Deleted]');
            if (isMainThreadDeleted && !mainThreadPost.hasReplies) {
              console.log('🔍 COMP DEBUG: SKIPPING deleted main thread without NON-DELETED replies:', mainThreadPost.id, 'hasReplies:', mainThreadPost.hasReplies, 'totalReplies:', directReplies.length, 'nonDeletedReplies:', directReplies.filter(r => !r.deletedAt).length);
              continue; // Skip this deleted main thread, but continue with others
            }
            
            // COMP METHOD: Debug when deleted main thread has non-deleted replies (EXACT COMP LOGIC)
            if (mainThreadPost.deletedAt && mainThreadPost.hasReplies) {
              console.log('🔍 COMP DEBUG: Deleted main thread WITH non-deleted replies:', mainThreadPost.id, 'hasReplies:', mainThreadPost.hasReplies, 'totalReplies:', directReplies.length, 'nonDeletedReplies:', directReplies.filter(r => !r.deletedAt).length);
            }
            
            // Add the main thread post to chat
            console.log('🔍 CHAT_LOAD: Adding main thread post:', mainThreadPost.id);
            console.log('🔍 CHAT_LOAD: Main thread post details:', { id: mainThreadPost.id, body: mainThreadPost.body, createdAt: mainThreadPost.createdAt });
            
            // COMP METHOD: Add message to chat using window.addMessageToChat
            try {
              console.log('🔍 CHAT_LOAD: About to call window.addMessageToChat with:', mainThreadPost.id);
              console.log('🔍 CHAT_LOAD: window.addMessageToChat type:', typeof window.addMessageToChat);
              console.log('🔍 CHAT_LOAD: window.addMessageToChat function:', window.addMessageToChat);
              
              // CRITICAL DEBUG: Check if message already exists in DOM
              const existingMessage = document.querySelector(`.message[data-message-id="${mainThreadPost.id}"]`);
              console.log('🔍 CHAT_LOAD: Existing message in DOM:', !!existingMessage);
              if (existingMessage) {
                console.log('🔍 CHAT_LOAD: Message already exists, wrapper will dedupe:', mainThreadPost.id);
              }
              
              if (typeof window.addMessageToChat !== 'function') {
                console.error('❌ CHAT_LOAD: window.addMessageToChat is not a function:', typeof window.addMessageToChat);
                return;
              }
              
              console.log('🔍 CHAT_LOAD: Calling window.addMessageToChat now...');
              
              // CRITICAL FIX: Remove loading indicator before adding first message
              // This ensures messages are hidden until loaded
              const loadingIndicator = chatMessages.querySelector('.chat-loading-indicator');
              if (loadingIndicator) {
                loadingIndicator.remove();
                console.log('✅ CHAT_LOAD: Removed loading indicator before first message');
              }

              // ROOT CAUSE FIX: Ensure createdAt and hasReplies are preserved
              if (!mainThreadPost.createdAt && mainThreadPost.created_at) {
                mainThreadPost.createdAt = mainThreadPost.created_at;
              }
              
              // Ensure author enrichment for history path before render
              let postForRender = mainThreadPost;
              try {
                const needsEnrichment = !postForRender?.author || !postForRender?.author?.avatarUrl;
                if (needsEnrichment && typeof convertSupabaseMessageToAPIFormat === 'function') {
                  postForRender = await convertSupabaseMessageToAPIFormat(postForRender);
                  // Preserve hasReplies and replyCount after conversion
                  postForRender.hasReplies = mainThreadPost.hasReplies;
                  postForRender.replyCount = mainThreadPost.replyCount;
                  postForRender.createdAt = postForRender.createdAt || postForRender.created_at || mainThreadPost.createdAt || mainThreadPost.created_at;
                }
              } catch (_) {}
              
              // Call addMessageToChat with enriched message
              const result = await window.addMessageToChat(postForRender);
              console.log('🔍 CHAT_LOAD: addMessageToChat returned:', result);
              console.log('✅ CHAT_LOAD: Main thread post added to chat');
            } catch (error) {
              console.error('❌ CHAT_LOAD: Error adding main thread post:', error);
              console.error('❌ CHAT_LOAD: Error stack:', error.stack);
              console.error('❌ CHAT_LOAD: Error message:', error.message);
            }
              
              // CRITICAL DEBUG: Verify message was added to DOM
              if (mainThreadPost.body === 'Google a' || mainThreadPost.body === 'Google b') {
                const addedMessage = document.querySelector(`[data-message-id="${mainThreadPost.id}"]`);
                console.log('🚨🚨🚨 CRITICAL DEBUG: Message in DOM after addMessageToChat:', !!addedMessage);
                if (addedMessage) {
                  console.log('🚨🚨🚨 CRITICAL DEBUG: Message element:', addedMessage);
                  console.log('🚨🚨🚨 CRITICAL DEBUG: Message visible:', addedMessage.offsetHeight > 0);
              }
            }
            
            // CRITICAL FIX: DO NOT add replies in default mode - replies should ONLY show in focus mode
            // Replies are loaded when user clicks on a message to enter focus mode
            // This prevents replies from appearing in the default chat view
            console.log(`ℹ️ CHAT_LOAD: Skipping ${directReplies.length} replies in default mode (replies only show in focus mode)`);
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
      // CRITICAL FIX: Remove loading indicator before showing placeholder
      const loadingIndicator = chatMessages.querySelector('.chat-loading-indicator');
      if (loadingIndicator) {
        loadingIndicator.remove();
      }
      chatMessages.innerHTML = '<p style="text-align: center; color: var(--text-secondary); padding: 20px;">Chat history appears here.</p>';
    }
    
    // CRITICAL FIX: Update lastLoadedUri after successfully loading messages
    // This prevents reloading the same page unnecessarily
    const finalUri = window.currentUrlData?.normalizedUrl || currentUri;
    if (finalUri) {
      lastLoadedUri = finalUri;
      console.log('CHAT_LOAD: Updated lastLoadedUri to:', finalUri);
    }
  } catch (error) {
    console.error('Failed to load chat history:', error);
    // CRITICAL FIX: Still update lastLoadedUri even on error to prevent infinite retries
    const finalUri = window.currentUrlData?.normalizedUrl || currentUri;
    if (finalUri) {
      lastLoadedUri = finalUri;
      console.log('CHAT_LOAD: Updated lastLoadedUri after error to:', finalUri);
    }
  } finally {
    // Reset loading flag
    isLoadingChatHistory = false;
  }
}

// CRITICAL FIX: Export loadChatHistory immediately after function definition
// This ensures it's available when tab change handlers run
if (typeof window !== 'undefined') {
  window.loadChatHistory = loadChatHistory;
  console.log('✅ CANOPI: loadChatHistory exported to window immediately:', typeof window.loadChatHistory);
}

// NOTE: handleMessageFocus is defined later in the file (around line 4417)
// It will be exported to window at the end of the file
// COMP METHOD: Show reaction modal for message
// Make reaction functions globally available (will be assigned after function definitions)

// COMP METHOD: Set up real-time reaction subscription for a message
// NOTE: This function is deprecated - reactions are now handled by the global ReactionsIntegration
function setupReactionSubscription(messageId) {
  console.log('🔧 REACTIONS: COMP METHOD - Per-message subscriptions deprecated, using global ReactionsIntegration');
  
  // COMP METHOD: Ensure global reactions integration is initialized
  if (window.reactionsIntegration && !window.reactionsIntegration.isInitialized) {
    console.log('🔧 REACTIONS: COMP METHOD - Initializing global reactions integration...');
    window.reactionsIntegration.initialize().then(success => {
      if (success) {
        console.log('✅ REACTIONS: COMP METHOD - Global reactions integration initialized');
        // Join current page
        const currentUrl = window.location.href;
        window.reactionsIntegration.joinPage(currentUrl);
      } else {
        console.warn('⚠️ REACTIONS: COMP METHOD - Global reactions integration initialization failed');
      }
    });
  }
}

// COMP METHOD: Handle real-time reaction changes
window.handleReactionChange = window.handleReactionChange || async function(payload) {
  console.log('🔔 REACTIONS: COMP METHOD - Processing real-time reaction change:', payload);
  
  const { eventType, new: newRecord, old: oldRecord } = payload;
  const messageId = newRecord?.message_id || oldRecord?.message_id;
  
  if (!messageId) {
    console.warn('⚠️ REACTIONS: COMP METHOD - No message ID in reaction change payload');
    return;
  }
  
  console.log('🔔 REACTIONS: COMP METHOD - Event type:', eventType);
  console.log('🔔 REACTIONS: COMP METHOD - Message ID:', messageId);
  
    // COMP METHOD: Always reload reactions from database for accurate state
    // Use proper selector to find reaction button within message element
    const messageElement = document.querySelector(`[data-message-id="${messageId}"]`);
    const reactionBtn = messageElement?.querySelector('.reaction-btn');
    
    if (reactionBtn) {
      console.log('🔧 REACTIONS: COMP METHOD - Reloading reactions after real-time change');
      
      // COMP METHOD: Reload immediately - no delays needed
      try {
        await window.loadMessageReactions(messageId, reactionBtn);
        console.log('✅ REACTIONS: COMP METHOD - Reactions reloaded after real-time update');
      } catch (error) {
        console.error('❌ REACTIONS: COMP METHOD - Error reloading reactions:', error);
      }
    } else {
      console.warn('⚠️ REACTIONS: COMP METHOD - Reaction button not found for message:', messageId);
    }
};

// COMP METHOD: Add reaction to message display
function addReactionToMessage(reaction) {
  // ROOT CAUSE FIX: Extract messageId from various possible payload structures
  // Real-time INSERT events may have message_id in different locations
  let messageId = reaction?.message_id || 
                  reaction?.messageId ||
                  reaction?.new?.message_id || 
                  reaction?.old?.message_id ||
                  reaction?.new?.messageId || 
                  reaction?.old?.messageId;
  
  // If we have a _payload (from RealtimeManager), try extracting from there
  if (!messageId && reaction?._payload) {
    const payload = reaction._payload;
    messageId = payload?.new?.message_id || 
                payload?.new?.messageId ||
                payload?.old?.message_id ||
                payload?.old?.messageId;
  }
  
  if (!messageId) {
    console.warn('⚠️ REACTIONS: COMP METHOD - Cannot extract messageId from reaction:', reaction);
    console.warn('⚠️ REACTIONS: Reaction object keys:', Object.keys(reaction || {}));
    if (reaction?._payload) {
      console.warn('⚠️ REACTIONS: Payload keys:', Object.keys(reaction._payload || {}));
      console.warn('⚠️ REACTIONS: Payload.new keys:', Object.keys(reaction._payload?.new || {}));
    }
    return;
  }
  
  const messageElement = document.querySelector(`[data-message-id="${messageId}"]`);
  const reactionBtn = messageElement?.querySelector('.reaction-btn');
  
  if (reactionBtn) {
    console.log('🔔 REACTIONS: COMP METHOD - Adding reaction to message:', messageId, reaction);
    
    // ROOT CAUSE FIX: Always reload reactions for accurate count (like delete flow)
    // This ensures counts propagate when OTHER users add reactions via real-time events
    // Use same delay as delete flow (300ms) for consistency
    setTimeout(async () => {
      try {
        await window.loadMessageReactions(messageId, reactionBtn);
        console.log('✅ REACTIONS: COMP METHOD - Reaction added to message display, count updated:', messageId);
      } catch (error) {
        console.error('❌ REACTIONS: COMP METHOD - Error reloading reactions:', error);
      }
    }, 300); // COMP METHOD: Same delay as delete flow for consistency
  } else {
    console.warn('⚠️ REACTIONS: COMP METHOD - Reaction button not found for message:', messageId);
  }
}
// COMP METHOD: Update reaction in message display
function updateReactionInMessage(reaction) {
  console.log('🔄 REACTIONS: COMP METHOD - Updating reaction in message:', reaction);
  const messageId = reaction.message_id;
  const messageElement = document.querySelector(`[data-message-id="${messageId}"]`);
  const reactionBtn = messageElement?.querySelector('.reaction-btn');
  
  if (reactionBtn) {
    // COMP METHOD: Reload reactions for this message to get accurate count
    // Increase delay for better propagation
    setTimeout(async () => {
      try {
        await window.loadMessageReactions(messageId, reactionBtn);
        console.log('✅ REACTIONS: COMP METHOD - Reaction updated in message display');
      } catch (error) {
        console.error('❌ REACTIONS: COMP METHOD - Error reloading reactions:', error);
      }
    }, 200); // COMP METHOD: Increased delay for better propagation
  } else {
    console.warn('⚠️ REACTIONS: COMP METHOD - Reaction button not found for message:', messageId);
  }
}
// COMP METHOD: Remove reaction from message display
async function removeReactionFromMessage(reaction) {
  // ROOT CAUSE FIX: Extract messageId from various possible payload structures
  // Supabase realtime DELETE events may have message_id in different locations
  let messageId = reaction?.message_id || 
                  reaction?.messageId ||
                  reaction?.new?.message_id || 
                  reaction?.old?.message_id ||
                  reaction?.new?.messageId || 
                  reaction?.old?.messageId;
  
  // If we have a _payload, try extracting from there
  if (!messageId && reaction?._payload) {
    const payload = reaction._payload;
    messageId = payload?.old?.message_id || 
                payload?.old?.messageId ||
                payload?.new?.message_id ||
                payload?.new?.messageId;
    // ROOT CAUSE FIX: For DELETE events, oldRecord might be nested differently
    // Supabase realtime DELETE events have old in payload.old, but message_id might be at payload.old.message_id
    if (!messageId && payload?.old && typeof payload.old === 'object') {
      // Try direct access to message_id in old record
      messageId = payload.old.message_id || payload.old.messageId;
    }
  }
  
  // ROOT CAUSE FIX: For DELETE events, if messageId is missing, query backend using reaction.id
  // NOTE: If reaction was already deleted, this will 404 - that's expected, skip lookup
  if (!messageId && reaction?.id) {
    try {
      console.log('🔍 REACTIONS: Querying backend for messageId from reaction.id:', reaction.id);
      // CRITICAL FIX: Use correct endpoint - /v1/reactions/by-id/:id requires authentication
      // If not authenticated, skip this lookup (404 is expected for deleted reactions anyway)
      const reactionData = await window.api.request(`/v1/reactions/by-id/${reaction.id}`, { 
        method: 'GET', 
        allow404: true,
        allow401: true // Allow 401 (unauthorized) - just skip lookup if not authenticated
      });
      if (reactionData && reactionData.message_id) {
        messageId = reactionData.message_id;
        console.log('✅ REACTIONS: Retrieved messageId from backend:', messageId);
      } else {
        // Reaction already deleted (404) - this is expected, messageId lookup not needed
        console.log('🔍 REACTIONS: Reaction already deleted (404), messageId lookup not needed');
      }
    } catch (error) {
      // 404 is expected for deleted reactions - don't log as error
      if (error.status === 404 || (error.message && error.message.includes('404'))) {
        console.log('🔍 REACTIONS: Reaction already deleted (404), skipping messageId lookup');
      } else {
        console.warn('⚠️ REACTIONS: Could not query backend for messageId:', error);
      }
    }
  }
  // Last resort: If still no messageId, reload all reactions
  if (!messageId) {
    console.warn('⚠️ REACTIONS: COMP METHOD - Cannot extract messageId from reaction:', reaction);
    console.warn('⚠️ REACTIONS: Reaction object keys:', Object.keys(reaction || {}));
    if (reaction?._payload) {
      console.warn('⚠️ REACTIONS: Payload keys:', Object.keys(reaction._payload || {}));
      console.warn('⚠️ REACTIONS: Payload.old:', reaction._payload?.old);
      console.warn('⚠️ REACTIONS: Payload.old keys:', Object.keys(reaction._payload?.old || {}));
      console.warn('⚠️ REACTIONS: Payload.old values:', JSON.stringify(reaction._payload?.old, null, 2));
    }
    // Fallback: reload all reactions (inefficient but ensures sync)
    console.warn('⚠️ REACTIONS: Falling back to reloading all reactions');
    setTimeout(() => window.refreshAllReactionDisplays(), 500);
    return;
  }
  
  const messageElement = document.querySelector(`[data-message-id="${messageId}"]`);
  const reactionBtn = messageElement?.querySelector('.reaction-btn');
  
  if (reactionBtn) {
    console.log('🔔 REACTIONS: COMP METHOD - Removing reaction from message:', messageId);
    
    // COMP METHOD: Reload reactions to get accurate state from database
    // Increase delay to ensure database has updated and propagated
    setTimeout(async () => {
      try {
        await window.loadMessageReactions(messageId, reactionBtn);
        console.log('✅ REACTIONS: COMP METHOD - Reaction removed from message display:', messageId);
      } catch (error) {
        console.error('❌ REACTIONS: COMP METHOD - Error reloading reactions:', error);
      }
    }, 300); // Increased delay for better propagation
  } else {
    console.warn('⚠️ REACTIONS: COMP METHOD - Reaction button not found for message:', messageId);
  }
}

  /**
   * Handle reaction button click - COMP METHOD
   */
  async function handleReactionClick(messageId, reactionType) {
    try {
      console.log('🔧 REACTIONS: COMP METHOD - Handling reaction click for message:', messageId);
      
      // COMP METHOD: Show reaction modal for new reactions
      if (!reactionType) {
        console.log('🔧 REACTIONS: COMP METHOD - Showing reaction modal');
        showReactionModal(messageId);
        return;
      }
      
      if (window.reactionsIntegration) {
        // Check if user already reacted with this type
        const existingReactions = await window.reactionsIntegration.reactionsManager.getReactions(messageId);
        const userReaction = existingReactions.find(r => 
          (r.AppUser?.id || r.user_id) === (window.currentUser?.id || window.currentUser?.user_id) && r.emoji === selectedReaction
        );
        
        if (userReaction) {
          // Remove reaction
          console.log('🔧 REACTIONS: COMP METHOD - Removing reaction');
          await window.reactionsIntegration.removeReaction(messageId, reactionType);
        } else {
          // Add reaction
          console.log('🔧 REACTIONS: COMP METHOD - Adding reaction');
          await window.reactionsIntegration.addReaction(messageId, reactionType);
        }
      } else {
        // COMP METHOD: Fallback reaction handling
        console.log('🔧 REACTIONS: COMP METHOD - Using fallback reaction handling');
        await window.handleReaction({ id: messageId, reactions: [] });
      }
    } catch (error) {
      console.error('❌ UI REACTIONS: COMP METHOD - Error handling reaction click:', error);
      }
    }

      /**
   * Update reactions display
   */
  function updateReactionsDisplay(container, reactions) {
    const reactionsList = container.querySelector('.reactions-list');
    if (!reactionsList) return;

    // Group reactions by type
    const reactionGroups = {};
    reactions.forEach(reaction => {
      if (!reactionGroups[reaction.emoji]) {
        reactionGroups[reaction.emoji] = [];
      }
      reactionGroups[reaction.emoji].push(reaction);
    });

    // Clear existing reactions
    reactionsList.innerHTML = '';

    // Add reaction buttons
    Object.keys(reactionGroups).forEach(reactionType => {
      const reactionGroup = reactionGroups[reactionType];
      const reactionButton = createReactionButton(reactionType, reactionGroup);
      reactionsList.appendChild(reactionButton);
    });

    console.log('✅ UI REACTIONS: Reactions display updated');
  }

  /**
   * Create a reaction button
   */
  function createReactionButton(reactionType, reactions) {
    const button = document.createElement('button');
    button.className = 'reaction-button';
    button.setAttribute('data-reaction-type', reactionType);
    button.setAttribute('data-message-id', reactions[0].message_id);
    
    // Set button content
    button.innerHTML = `
      <span class="reaction-emoji">${getReactionEmoji(reactionType)}</span>
      <span class="reaction-count">${reactions.length}</span>
    `;
    
    // Add click handler
    button.addEventListener('click', () => {
      handleReactionClick(reactions[0].message_id, reactionType);
    });
    
    return button;
  }

  /**
   * Get emoji for reaction type
   */
  function getReactionEmoji(reactionType) {
    const emojiMap = {
      'like': '👍',
      'love': '❤️',
      'laugh': '😂',
      'wow': '😮',
      'sad': '😢',
      'angry': '😠',
      'thumbs_up': '👍',
      'thumbs_down': '👎',
      'heart': '❤️',
      'fire': '🔥'
    };
    
    return emojiMap[reactionType] || '👍';
  }


  /**
   * Update reaction counts
   */
  function updateReactionCounts() {
    // Update any global reaction counters
    const counters = document.querySelectorAll('.reaction-count');
    counters.forEach(counter => {
      // Trigger a refresh of the counter
      counter.style.opacity = '0.5';
      setTimeout(() => {
        counter.style.opacity = '1';
      }, 100);
    });
  }
  // REMOVED: Duplicate handleReplyToMessage function - keeping only COMP method implementation

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

  // COMP METHOD: Make handleDeleteMessage globally accessible
  window.handleDeleteMessage = handleDeleteMessage;
  
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
    
    // CRITICAL FIX: Remove the conflicting new message handler during edit mode
    const existingHandler = chatTextarea.getAttribute('data-message-handler');
    if (existingHandler && window[existingHandler]) {
      console.log('✏️ EDIT: Removing conflicting new message handler during edit mode');
      chatTextarea.removeEventListener('keydown', window[existingHandler]);
    }
    
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
      
      // CRITICAL FIX: Restore the new message handler after edit mode
      console.log('✏️ EDIT: Restoring new message handler after edit mode');
      const handlerId = 'messageInputHandler_' + Date.now();
      window[handlerId] = (event) => {
        if (event.key === 'Enter' && !event.shiftKey) {
          event.preventDefault();
          console.log('💬 MESSAGE_INPUT: Enter key pressed, sending message');
          sendChatMessage();
        }
      };
      chatTextarea.addEventListener('keydown', window[handlerId]);
      chatTextarea.setAttribute('data-message-handler', handlerId);
    };
    
    // Add event listeners
    chatTextarea.addEventListener('keydown', handleKeyDown);
    if (sendButton) {
      sendButton.addEventListener('click', handleButtonClick);
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
// REMOVED: Duplicate formatMessageTime function - keeping only COMP method implementation

async function getMessageActionMenu(message) {
  const now = new Date();
  const messageDate = new Date(message.createdAt);
  const diffMs = now - messageDate;
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  
  // Get current user to check ownership - use window.currentUser from direct auth
  const currentUser = window.currentUser;
  
  // Use ID for user identification - UUIDs only
  let isOwner = false;
  if (currentUser && (currentUser.id || currentUser.user_id)) {
    // Compare by ID - the message should have author ID
    const authorId = message.authorId || (message.author && (message.author.id || message.author.user_id));
    isOwner = (authorId === (currentUser.id || currentUser.user_id));
    }
  
  // Check if user can edit/delete (only if they own the message)
  const canEdit = isOwner && diffHours < 1; // Can edit within 1 hour
  const canDelete = isOwner; // User can only delete their own messages
  
  const silentEdit = diffMinutes <= 5; // Silent edit within 5 minutes
  
  return `
    <div class="message-actions-menu">
      <button class="action-dots-btn" data-message-id="${message.id}" title="Message actions">
        <span class="action-dots">⋯</span>
      </button>
      <div class="action-dropdown">
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
  
  // Check against stored user ID - use window.currentUser
  const currentUserId = window.currentUser?.id || window.currentUser?.user_id;
  
  const authorId = message.authorId || (message.author && (message.author.id || message.author.user_id));
  return authorId === currentUserId && messageTime > oneHourAgo;
}
// Helper function to show disappearing tooltip
function showTooltip(element, message, duration = 2000) {
  // Remove any existing tooltip
  const existingTooltip = document.querySelector('.share-tooltip');
  if (existingTooltip) {
    existingTooltip.remove();
  }
  
  // Create tooltip element
  const tooltip = document.createElement('div');
  tooltip.className = 'share-tooltip';
  tooltip.textContent = message;
  tooltip.style.cssText = `
    position: absolute;
    background: #1f2937;
    color: white;
    padding: 8px 12px;
    border-radius: 6px;
    font-size: 12px;
    font-weight: 500;
    white-space: nowrap;
    z-index: 10000;
    pointer-events: none;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    animation: tooltipFadeIn 0.2s ease-out;
  `;
  
  // Add animation
  if (!document.querySelector('#tooltip-styles')) {
    const style = document.createElement('style');
    style.id = 'tooltip-styles';
    style.textContent = `
      @keyframes tooltipFadeIn {
        from { opacity: 0; transform: translateY(-4px); }
        to { opacity: 1; transform: translateY(0); }
      }
      @keyframes tooltipFadeOut {
        from { opacity: 1; transform: translateY(0); }
        to { opacity: 0; transform: translateY(-4px); }
      }
    `;
    document.head.appendChild(style);
  }
  
  // Position tooltip above the button
  document.body.appendChild(tooltip);
  const rect = element.getBoundingClientRect();
  tooltip.style.left = `${rect.left + (rect.width / 2) - (tooltip.offsetWidth / 2)}px`;
  tooltip.style.top = `${rect.top - tooltip.offsetHeight - 8}px`;
  
  // Adjust if tooltip goes off screen
  const tooltipRect = tooltip.getBoundingClientRect();
  if (tooltipRect.left < 8) {
    tooltip.style.left = '8px';
  }
  if (tooltipRect.right > window.innerWidth - 8) {
    tooltip.style.left = `${window.innerWidth - tooltipRect.width - 8}px`;
  }
  if (tooltipRect.top < 8) {
    tooltip.style.top = `${rect.bottom + 8}px`;
  }
  
  // Remove tooltip after duration
  setTimeout(() => {
    tooltip.style.animation = 'tooltipFadeOut 0.2s ease-out';
    setTimeout(() => {
      tooltip.remove();
    }, 200);
  }, duration);
}
async function handleCopyLink(message) {
  try {
    console.log('🔗 SHARE: Creating shareable link for message:', message.id);
    
    // CRITICAL FIX: Use resolver-based share link architecture
    // Get the actual page URL where the message exists
    let pageUrl = null;
    
    // Try to get page URL from message data first
    if (message.pageUrl || message.conversation?.page?.url) {
      pageUrl = message.pageUrl || message.conversation.page.url;
      console.log('🔗 SHARE: Using page URL from message data:', pageUrl);
    } else if (window.currentUrlData?.rawUrl || window.currentUrlData?.canonicalUrl) {
      pageUrl = window.currentUrlData.rawUrl || window.currentUrlData.canonicalUrl;
      console.log('🔗 SHARE: Using page URL from currentUrlData:', pageUrl);
    } else {
      // Fallback: Try to get from active tab
      try {
        if (typeof chrome !== 'undefined' && chrome.tabs) {
          const tabs = await new Promise((resolve) => {
            chrome.tabs.query({ active: true, currentWindow: true }, resolve);
          });
          if (tabs && tabs.length > 0 && tabs[0].url) {
            // Remove hash from tab URL to get base page URL
            const tabUrl = new URL(tabs[0].url);
            tabUrl.hash = '';
            pageUrl = tabUrl.toString();
            console.log('🔗 SHARE: Using page URL from active tab:', pageUrl);
          }
        }
      } catch (tabError) {
        console.warn('🔗 SHARE: Could not get active tab URL:', tabError);
      }
      
      // Last fallback: use window.location if not in extension context
      if (!pageUrl && !window.location.href.includes('chrome-extension://')) {
        const urlObj = new URL(window.location.href);
        urlObj.hash = '';
        pageUrl = urlObj.toString();
        console.log('🔗 SHARE: Using window.location as fallback:', pageUrl);
      }
    }
    
    if (!pageUrl) {
      throw new Error('Could not determine page URL for share link');
    }
    
    // CRITICAL FIX: Generate resolver URL instead of direct page URL
    // Format: share.canopi.live?message=ID&page=ENCODED_PAGE_URL&conversation=ID
    const resolverBase = 'https://share.canopi.live';
    const encodedPageUrl = encodeURIComponent(pageUrl);
    const shareUrl = `${resolverBase}?message=${message.id}&page=${encodedPageUrl}&conversation=${encodeURIComponent(message.conversationId || '')}`;
    
    console.log('🔗 SHARE: Generated resolver URL:', shareUrl);
    
    // Copy the share URL to clipboard
    await navigator.clipboard.writeText(shareUrl);
    
    // CRITICAL FIX: Show disappearing tooltip on the share button
    const shareBtn = document.querySelector(`.share-btn[data-message-id="${message.id}"]`);
    if (shareBtn) {
      showTooltip(shareBtn, 'Share link copied to clipboard', 2000);
    }
    
    // Add to notification history for tracking
    if (window.notificationHistory) {
      await window.notificationHistory.addNotification({
        type: 'MESSAGE_SHARED',
        title: '🔗 Message link copied',
        message: `Link to message "${message.body?.substring(0, 50)}..." copied to clipboard`,
        url: shareUrl,
        target: `[data-message-id="${message.id}"]`,
        data: {
          messageId: message.id,
          conversationId: message.conversationId,
          authorName: message.author?.name || 'Unknown',
          pageUrl: pageUrl,
          resolverUrl: shareUrl
        }
      });
    }
    
    console.log('🔗 SHARE: Message link created and copied:', shareUrl);
  } catch (error) {
    console.error('🔗 SHARE: Failed to copy message link:', error);
    
    // Show error tooltip if available
    const shareBtn = document.querySelector(`.share-btn[data-message-id="${message.id}"]`);
    if (shareBtn) {
      showTooltip(shareBtn, 'Failed to copy link', 2000);
    }
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
      
      // Wait for messages to load and sidebar to be ready
      const maxAttempts = 10;
      let attempts = 0;
      
      const findAndFocusMessage = async () => {
        attempts++;
        
        // Find the message element
        const messageElement = document.querySelector(`[data-message-id="${messageData.messageId}"]`);
        if (messageElement) {
          console.log('🔗 INCOMING: Message found, focusing and highlighting');
          
          // Scroll to message with smooth animation
          messageElement.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'center',
            inline: 'nearest'
          });
          
          // Highlight the message temporarily
          messageElement.style.transition = 'all 0.3s ease';
          messageElement.style.backgroundColor = 'rgba(0, 123, 255, 0.15)';
          messageElement.style.borderLeft = '4px solid #007bff';
          messageElement.style.boxShadow = '0 0 8px rgba(0, 123, 255, 0.3)';
          
          // Remove highlight after 3 seconds
          setTimeout(() => {
            messageElement.style.backgroundColor = '';
            messageElement.style.borderLeft = '';
            messageElement.style.boxShadow = '';
          }, 3000);
          
          // Also try to enter focus mode if available
          if (typeof handleMessageFocus === 'function') {
            try {
              // Get message data to pass to handleMessageFocus
              const message = window.currentChatData?.find(m => m.id === messageData.messageId);
              if (message) {
                await handleMessageFocus(message);
              }
            } catch (focusError) {
              console.warn('🔗 INCOMING: Could not enter focus mode:', focusError);
            }
          }
          
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
          
          console.log('✅ INCOMING: Message focused and highlighted successfully');
        } else if (attempts < maxAttempts) {
          // Message not found yet, wait and try again
          console.log(`🔗 INCOMING: Message not found yet (attempt ${attempts}/${maxAttempts}), retrying...`);
          setTimeout(findAndFocusMessage, 500);
        } else {
          console.warn('🔗 INCOMING: Message not found after max attempts:', messageData.messageId);
          // Try to load the message if it's not in current view
          if (messageData.messageId && typeof loadMessageReplies === 'function') {
            console.log('🔗 INCOMING: Attempting to load message data...');
            // This will be handled by the message loading system
          }
        }
      };
      
      // Start trying to find the message
      setTimeout(findAndFocusMessage, 1000); // Initial delay for sidebar to initialize
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
// DEPRECATED: This function should NOT be used - replies are only loaded in focus mode
// Replies should NEVER be added in default mode
async function loadMessageReplies(messageId, conversationId, communityId = null) {
  console.warn('⚠️ DEPRECATED: loadMessageReplies should not be called - replies are only loaded in focus mode');
  console.warn('⚠️ DEPRECATED: Use addMessageToFocus instead for focus mode reply loading');
  // DO NOT load replies - this function is deprecated
  // Replies should only be loaded when entering focus mode via addMessageToFocus
  return;
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


// REMOVED: Duplicate handleReaction function - keeping only COMP method implementation

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


// Toggle thread replies visibility
async function toggleThreadReplies(threadId, messageElement) {
  const toggleBtn = messageElement.querySelector('.thread-toggle-btn');
  if (!toggleBtn) {
    console.log('🔘 TOGGLE_THREAD: No toggle button found');
    return;
  }
  
  // CRITICAL FIX: Check current state from data attribute, not just button
  const currentExpanded = messageElement.getAttribute('data-thread-expanded') === 'true';
  const isExpanded = toggleBtn.dataset.expanded === 'true' || currentExpanded;
  const chatMessages = getDiscussTabChatMessages();
  if (!chatMessages) {
    console.log('🔘 TOGGLE_THREAD: No chat messages container found');
    return;
  }
  
  // Find all reply messages for this thread
  const replyMessages = chatMessages.querySelectorAll(`.message-reply.thread-reply[data-conversation-id="${threadId}"]`);
  console.log(`🔘 TOGGLE_THREAD: Current expanded state: ${isExpanded}, Found ${replyMessages.length} replies`);
  
  if (isExpanded) {
    // Collapse - hide reply messages
    replyMessages.forEach(reply => {
      reply.classList.remove('visible');
      console.log('🔘 TOGGLE_THREAD: Hiding reply:', reply.getAttribute('data-message-id'));
    });
    // ARCHITECTURE FIX: Update data attribute to hide vertical line
    messageElement.setAttribute('data-thread-expanded', 'false');
    // Update icon but preserve count
    const countSpan = toggleBtn.querySelector('.icon-count');
    const count = countSpan ? countSpan.outerHTML : '';
    toggleBtn.innerHTML = `📂${count}`;
    toggleBtn.dataset.expanded = 'false';
    toggleBtn.setAttribute('aria-expanded', 'false');
    toggleBtn.title = 'Show thread replies';
    console.log('🔘 TOGGLE_THREAD: Thread collapsed');
  } else {
    // Expand - show reply messages
    replyMessages.forEach(reply => {
      reply.classList.add('visible');
      console.log('🔘 TOGGLE_THREAD: Showing reply:', reply.getAttribute('data-message-id'));
    });
    // ARCHITECTURE FIX: Update data attribute to show vertical line
    messageElement.setAttribute('data-thread-expanded', 'true');
    // Update icon but preserve count
    const countSpan = toggleBtn.querySelector('.icon-count');
    const count = countSpan ? countSpan.outerHTML : '';
    toggleBtn.innerHTML = `📁${count}`;
    toggleBtn.dataset.expanded = 'true';
    toggleBtn.setAttribute('aria-expanded', 'true');
    toggleBtn.title = 'Hide thread replies';
    console.log('🔘 TOGGLE_THREAD: Thread expanded');
  }
  
  // Update visual hierarchy after toggling
  updateMessageVisualHierarchy();
}
// ===== MESSAGE INPUT EVENT LISTENERS (FROM COMP) =====
function setupMessageInputEventListeners() {
  console.log('💬 MESSAGE_INPUT: Setting up message input event listeners...');
  
  const chatInput = document.getElementById('chat-textarea');
  if (!chatInput) {
    console.log('❌ MESSAGE_INPUT: chat-textarea not found');
    return;
  }
  
  // COMP FIX: Remove existing listeners to prevent duplicates
  const existingHandler = chatInput.getAttribute('data-message-handler');
  if (existingHandler) {
    console.log('💬 MESSAGE_INPUT: Removing existing handler to prevent duplicates');
    chatInput.removeEventListener('keydown', window[existingHandler]);
  }
  
  // Create unique handler function
  const handlerId = 'messageInputHandler_' + Date.now();
  window[handlerId] = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      console.log('💬 MESSAGE_INPUT: Enter key pressed, sending message');
      sendChatMessage();
    }
  };
  
  // Add Enter key support for sending messages
  chatInput.addEventListener('keydown', window[handlerId]);
  chatInput.setAttribute('data-message-handler', handlerId);
  
  console.log('✅ MESSAGE_INPUT: Message input event listeners added');
}

function sendChatMessage() {
  console.log('🚀🚀🚀 ============================================');
  console.log('🚀🚀🚀 SEND_CHAT_MESSAGE: ENTRY POINT');
  console.log('🚀🚀🚀 ============================================');
  console.log('🚀 SEND_CHAT_MESSAGE: Chat send button clicked');
  console.log('🚀 SEND_CHAT_MESSAGE: Timestamp:', new Date().toISOString());
  
  const chatInput = document.getElementById('chat-textarea');
  if (!chatInput) {
    console.log('❌ SEND_CHAT_MESSAGE: chat-textarea not found');
    return;
  }
  
  console.log('🚀 SEND_CHAT_MESSAGE: Chat send triggered');
  console.log('🚀 SEND_CHAT_MESSAGE: chatInput element:', !!chatInput);
  console.log('🚀 SEND_CHAT_MESSAGE: chatInput value:', chatInput?.value);
  console.log('🚀 SEND_CHAT_MESSAGE: chatInput value length:', chatInput?.value?.length);
  
  // COMP RESTORATION: Add diagnostic logging
  if (window.messageDiagnostic) {
    window.messageDiagnostic.logMessageSend({
      content: chatInput?.value,
      user: window.currentUser,
      community: 'comm-001',
      url: window.currentUrlData
    });
  }
  
  // COMP RESTORATION: Add auth check
  if (typeof window.requireAuth === 'function') {
    window.requireAuth('send messages', async () => {
      console.log('🔐 SEND_CHAT_MESSAGE: Auth check passed');
      console.log('🔐 SEND_CHAT_MESSAGE: window.currentUser:', window.currentUser);
      console.log('🔐 SEND_CHAT_MESSAGE: window.currentUser.id:', window.currentUser?.id);
      
      // COMP METHOD: Check if we're in edit mode and handle it properly
  if (chatInput.dataset.editingMessageId) {
        console.log('✏️ SEND_CHAT_MESSAGE: In edit mode, handling edit save');
        // COMP METHOD: Handle edit mode by calling the edit save function
        const messageId = chatInput.dataset.editingMessageId;
        const newContent = chatInput.value.trim();
        
        if (newContent) {
          console.log('✏️ SEND_CHAT_MESSAGE: Saving edit for message:', messageId);
          // COMP METHOD: Use existing edit message logic
          try {
            if (window.robustIntegration && window.robustIntegration.isInitialized) {
              console.log('✏️ EDIT: Using robust integration system');
              await window.robustIntegration.editMessage(messageId, newContent);
              console.log('✅ Message updated via robust integration');
            } else {
              // Fallback to legacy system
              const client = window.supabaseRealtimeClient;
              if (client) {
                await client.editMessage(messageId, newContent);
                console.log('✅ Message updated via Supabase real-time (legacy)');
              } else {
                console.error('❌ Supabase client not available for message editing');
              }
            }
            
            // Clear edit mode after successful edit
            chatInput.dataset.editingMessageId = '';
            chatInput.placeholder = 'Type a message...';
            chatInput.value = '';
            
            const sendButton = document.querySelector('#sendButton, .send-button');
            if (sendButton) {
              sendButton.textContent = 'Send';
              delete sendButton.dataset.editing;
            }
            
            console.log('✅ COMP METHOD: Edit completed and mode cleared');
          } catch (error) {
            console.error('❌ COMP METHOD: Error editing message:', error);
          }
        }
    return;
  }
  
  let message = chatInput?.value?.trim();
  console.log('📝 SEND_CHAT_MESSAGE: Message after trim:', message);
  console.log('📝 SEND_CHAT_MESSAGE: Message length:', message?.length);
  
  if (!message) {
    console.log('❌ SEND_CHAT_MESSAGE: No message content');
    return;
  }
  
  // Use the existing sendMessageViaSupabase function
  if (typeof window.sendMessageViaSupabase === 'function') {
    console.log('📡 SEND_CHAT_MESSAGE: Calling sendMessageViaSupabase...');
        
        // Check for reply context
        const chatInput = document.getElementById('chat-textarea');
        const parentId = chatInput?.dataset?.replyingTo || null;
        console.log('📡 SEND_CHAT_MESSAGE: ParentId from reply context:', parentId);
        
        try {
          const result = await window.sendMessageViaSupabase(message, parentId);
      console.log('📡 SEND_CHAT_MESSAGE: Message sent successfully:', result);
          
          // Reply hierarchy is now handled by database parent_id field
          if (parentId) {
            console.log('🔧 REPLY HIERARCHY: COMP METHOD - Reply sent with parentId:', parentId);
            console.log('🔧 REPLY HIERARCHY: COMP METHOD - Database will handle hierarchy via parent_id field');
          }
          
          // COMP RESTORATION: Add diagnostic logging for message persistence
          if (window.messageDiagnostic) {
            const success = result && result.id;
            window.messageDiagnostic.logMessagePersist(
              result?.id || 'NO_ID',
              success,
              message
            );
          }
          
      // Clear the input
      chatInput.value = '';
        } catch (error) {
      console.error('❌ SEND_CHAT_MESSAGE: Failed to send message:', error);
        }
  } else {
    console.log('❌ SEND_CHAT_MESSAGE: sendMessageViaSupabase not available');
      }
    });
  } else {
    console.log('❌ SEND_CHAT_MESSAGE: requireAuth not available');
  }
}
// Function to update visual hierarchy of messages - DISABLED for default view (no hierarchy)
// UNIFIED: Default view shows all messages as standalone, no hierarchical display
function updateMessageVisualHierarchy() {
  const chatMessages = document.querySelector('.chat-messages');
  if (!chatMessages) return;
  
  // UNIFIED: Check if we're in focus mode - only apply hierarchy in focus mode
  const isFocusMode = chatMessages.dataset.focusMode === 'true' || 
                     chatMessages.classList.contains('focus-mode-active');
  
  // UNIFIED: Default view has no hierarchy - all messages are standalone
  if (!isFocusMode) {
    // Remove any existing hierarchy classes from default view
    const allMessages = chatMessages.querySelectorAll('.message');
    allMessages.forEach(msg => {
      msg.classList.remove('has-replies');
      msg.removeAttribute('data-thread-expanded');
    });
    return; // Exit early - no hierarchy in default view
  }
  
  // FOCUS MODE ONLY: Apply hierarchy (if needed in future)
  const allMessages = chatMessages.querySelectorAll('.message');
  const conversationGroups = {};
  
  // Group messages by conversation
  allMessages.forEach(message => {
    const conversationId = message.dataset.conversationId;
    if (!conversationGroups[conversationId]) {
      conversationGroups[conversationId] = [];
    }
    conversationGroups[conversationId].push(message);
  });
  
  // Update visual hierarchy for each conversation (FOCUS MODE ONLY)
  Object.values(conversationGroups).forEach(messages => {
    const threadStarter = messages.find(msg => !msg.classList.contains('message-reply'));
    const allReplies = messages.filter(msg => msg.classList.contains('message-reply'));
    const visibleReplies = messages.filter(msg => msg.classList.contains('message-reply') && msg.classList.contains('visible'));
    
    if (threadStarter && allReplies.length > 0) {
      // Add has-replies class to thread starter for vertical line (FOCUS MODE ONLY)
      threadStarter.classList.add('has-replies');
      // ARCHITECTURE FIX: Set thread-expanded based on whether replies are visible
      const isExpanded = visibleReplies.length > 0;
      const currentExpanded = threadStarter.getAttribute('data-thread-expanded');
      // Only update if state changed or not set
      if (currentExpanded !== (isExpanded ? 'true' : 'false')) {
        threadStarter.setAttribute('data-thread-expanded', isExpanded ? 'true' : 'false');
        console.log(`🔧 VISUAL_HIERARCHY: Set thread ${threadStarter.getAttribute('data-conversation-id')} expanded=${isExpanded}, visible replies=${visibleReplies.length}, total replies=${allReplies.length}`);
      }
      
      // Calculate vertical line height only if expanded
      if (isExpanded && visibleReplies.length > 0) {
        setTimeout(() => {
          updateVerticalLineHeight(threadStarter, visibleReplies);
        }, 10);
      }
    } else if (threadStarter) {
      threadStarter.classList.remove('has-replies');
      threadStarter.removeAttribute('data-thread-expanded');
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

// ===== COMP METHOD: addMessageToChat Function =====
// This is the COMP version of addMessageToChat with all proper functionality
/**
 * UNIFIED MESSAGE RENDERING: Wait for message to be fully loaded, then show it
 * This ensures messages are hidden until all content is rendered
 */
async function waitForMessageLoaded(messageDiv, messageId) {
  const maxWaitTime = 3000;
  const startTime = Date.now();
  
  return new Promise((resolve) => {
    const checkLoaded = () => {
      // Enhanced checks for unified message structure
      const hasContent = messageDiv.querySelector('.message-content') !== null;
      const hasAvatar = messageDiv.querySelector('.avatar-wrapper, .avatar-container') !== null;
      const hasHeader = messageDiv.querySelector('.message-header-new') !== null;
      const hasFooter = messageDiv.querySelector('.message-footer') !== null;
      const hasReplyBtn = messageDiv.querySelector('.reply-btn') !== null;
      const hasReactionBtn = messageDiv.querySelector('.reaction-btn') !== null;
      const hasBookmarkBtn = messageDiv.querySelector('.bookmark-btn') !== null;
      const hasDimensions = messageDiv.offsetHeight > 0 && messageDiv.offsetWidth > 0;
      const isInDOM = document.body.contains(messageDiv);
      const isVisible = isInDOM && hasDimensions && 
                       window.getComputedStyle(messageDiv).display !== 'none' &&
                       window.getComputedStyle(messageDiv).visibility !== 'hidden';
      
      const isLoaded = hasContent && hasHeader && hasFooter && 
                      hasReplyBtn && hasReactionBtn && hasBookmarkBtn &&
                      (hasAvatar || true) && isVisible;
      
      const timeElapsed = Date.now() - startTime;
      
      if (isLoaded || timeElapsed > maxWaitTime) {
        // Mark as loaded and show
        messageDiv.classList.add('message-loaded');
        messageDiv.style.cssText = ''; // Remove inline hiding styles
        
        if (isLoaded) {
          console.log(`✅ MESSAGE_LOADED: Enhanced check passed for ${messageId} in ${timeElapsed}ms`);
        } else {
          console.warn(`⚠️ MESSAGE_LOADED: Timeout for ${messageId} after ${timeElapsed}ms - forcing visibility`);
          forceShowMessage(messageDiv, messageId);
        }
        
        resolve(messageDiv);
      } else {
        requestAnimationFrame(checkLoaded);
      }
    };
    
    // Start checking immediately
    requestAnimationFrame(checkLoaded);
  });
}

/**
 * Force show message as fallback when enhanced checks timeout
 */
function forceShowMessage(messageDiv, messageId) {
  try {
    messageDiv.classList.add('message-loaded');
    messageDiv.style.display = 'flex';
    messageDiv.style.visibility = 'visible';
    messageDiv.style.opacity = '1';
    messageDiv.style.height = 'auto';
    messageDiv.style.overflow = 'visible';
    messageDiv.style.transform = 'translateY(0)';
    
    // Ensure child elements are visible
    const inner = messageDiv.querySelector('.message-inner');
    if (inner) inner.style.display = 'flex';
    
    const content = messageDiv.querySelector('.message-content');
    if (content) content.style.display = 'block';
    
    const footer = messageDiv.querySelector('.message-footer');
    if (footer) footer.style.display = 'flex';
    
    // Make buttons clickable
    const buttons = messageDiv.querySelectorAll('button');
    buttons.forEach(btn => {
      btn.style.pointerEvents = 'auto';
      btn.style.cursor = 'pointer';
    });
    
    console.log(`🔧 MESSAGE_LOADED: Force showed ${messageId}`);
  } catch (error) {
    console.error(`❌ MESSAGE_LOADED: Error forcing show ${messageId}:`, error);
  }
}

/**
 * Enhanced batch loading for multiple messages
 */
async function batchLoadMessages(messageElements, messageIds) {
  if (!messageElements?.length) return;
  
  console.log(`📦 BATCH_LOAD: Loading ${messageElements.length} messages`);
  
  const loadPromises = messageElements.map((el, i) => 
    waitForMessageLoaded(el, messageIds[i] || 'batch-' + i)
  );
  
  try {
    await Promise.allSettled(loadPromises);
    console.log(`✅ BATCH_LOAD: Completed ${messageElements.length} messages`);
  } catch (error) {
    console.error('❌ BATCH_LOAD: Error:', error);
  }
}

/**
 * Update waitForAllRepliesLoaded to use enhanced waiting and batch loading
 */
async function waitForAllRepliesLoaded(focusContainer = null) {
  const maxWaitTime = 2000;
  const startTime = Date.now();
  
  if (!focusContainer) {
    focusContainer = document.querySelector('.focus-messages-container');
  }
  
  if (!focusContainer) {
    console.warn('⚠️ REPLIES_LOAD: No focus container');
    return false;
  }

  const replies = focusContainer.querySelectorAll('.message-reply');
  const ids = Array.from(replies).map(r => r.dataset.messageId || 'unknown');
  
  if (replies.length === 0) {
    console.log('ℹ️ REPLIES_LOAD: No replies');
    return true;
  }

  console.log(`⏳ REPLIES_LOAD: Batch loading ${replies.length} replies`);
  await batchLoadMessages(Array.from(replies), ids);

  // Final verification
  const allLoaded = Array.from(replies).every(r => 
    r.classList.contains('message-loaded') && 
    r.offsetHeight > 0 && 
    r.querySelector('.message-content')
  );

  const elapsed = Date.now() - startTime;
  console.log(`✅ REPLIES_LOAD: ${replies.length} replies processed in ${elapsed}ms, all loaded: ${allLoaded}`);
  
  // Make visible
  makeRepliesVisible(focusContainer);
  return allLoaded;
}

/**
 * Update waitForAllMessagesLoaded to use batch loading
 */
async function waitForAllMessagesLoaded(container, maxWaitTime = 5000) {
  if (!container) return false;
  
  const messages = container.querySelectorAll('.message');
  const ids = Array.from(messages).map(m => m.dataset.messageId || 'unknown');
  
  if (messages.length === 0) {
    console.log('ℹ️ ALL_MSGS: No messages');
    return true;
  }

  await batchLoadMessages(Array.from(messages), ids);
  
  const allLoaded = Array.from(messages).every(m => 
    m.classList.contains('message-loaded') && 
    m.offsetHeight > 0 && 
    m.querySelector('.message-content') && 
    m.querySelector('.message-header-new')
  );

  console.log(`✅ ALL_MSGS: ${messages.length} messages processed, all loaded: ${allLoaded}`);
  return allLoaded;
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
  
  // CRITICAL: Filter out deleted messages without replies
  const isDeleted = message.deletedAt || (message.body && message.body.trim() === '[Deleted]');
  console.log('🔍 ADD_MESSAGE: isDeleted:', isDeleted);
  console.log('🔍 ADD_MESSAGE: message.hasReplies:', message.hasReplies);
  
  if (isDeleted && !message.hasReplies) {
    console.log('🔍 ADD_MESSAGE: SKIPPING deleted message without replies:', message.id);
    return;
  }
  
  console.log('🔍 ADD_MESSAGE: === FINDING CHAT MESSAGES CONTAINER ===');
  // UNIFIED: Always use main chat-messages container (no nested containers)
  // Focus mode is indicated by dataset flags on the main container
  let chatMessages = document.querySelector('.chat-messages');
  
  // Clean up any _focusModeTarget if present (legacy support)
  if (message._focusModeTarget) {
    delete message._focusModeTarget;
  }
  console.log('🔍 ADD_MESSAGE: chatMessages element:', !!chatMessages);
  console.log('🔍 ADD_MESSAGE: chatMessages type:', typeof chatMessages);
  
  if (!chatMessages) {
    console.log('❌❌❌ ADD_MESSAGE: No chat-messages element found - CANNOT ADD MESSAGE');
    return;
  }
  console.log('✅ ADD_MESSAGE: Found chat-messages element');
  console.log('✅ ADD_MESSAGE: chatMessages children count:', chatMessages.children.length);

  // FOCUS MODE ONLY: Check if we're in focus mode - if so, only add messages that are the focused message or its children
  // DEFAULT MODE: Skip all reply hierarchy filtering - show all messages normally
  const isFocusMode = chatMessages.dataset.focusMode === 'true' ||
                      chatMessages.classList.contains('focus-messages-container') ||
                      chatMessages.closest('#discuss-tab .chat-messages')?.dataset.focusMode === 'true';

  if (isFocusMode) {
    // FOCUS MODE: Apply reply hierarchy filtering
    let focusMessageId = chatMessages.dataset.focusMessageId ||
                         chatMessages.closest('#discuss-tab .chat-messages')?.dataset.focusMessageId;

    // UNIFIED: Focus mode flags are set on main chatMessages container
    // No need to check focusModeTarget - it's been removed

    if (focusMessageId) {
      // In focus mode - only allow the focused message or its replies (including nested replies)
      const isFocusedMessage = message.id === focusMessageId;
      const isDirectReplyToFocused = message.parentId === focusMessageId;

      // CRITICAL FIX: Check if this is a nested reply (reply to a reply of the focused message)
      let isNestedReply = false;
      if (message.parentId && !isDirectReplyToFocused) {
        // UNIFIED: No nested containers - use main chatMessages container
        const focusContainer = chatMessages.dataset.focusMode === 'true' ? chatMessages : null;
        if (focusContainer) {
          const parentInFocus = focusContainer.querySelector(`[data-message-id="${message.parentId}"]`);
          if (parentInFocus) {
            isNestedReply = true;
            console.log(`✅ FOCUS_MODE: Detected nested reply ${message.id} - parent ${message.parentId} is in focus container`);
          }
        }
      }

      if (!isFocusedMessage && !isDirectReplyToFocused && !isNestedReply) {
        // CRITICAL FIX: Check if this is a new reply being added - if parent exists in focus, allow it
        if (message.parentId) {
          // CRITICAL FIX: Check for focus mode using correct selectors (data-focus-mode or focus-mode-active)
          const isInFocusMode = chatMessages.dataset.focusMode === 'true' || 
                               chatMessages.classList.contains('focus-mode-active') ||
                               chatMessages.classList.contains('focus-messages-container');
          
          if (isInFocusMode) {
            // Check if parent message exists in the focus container
            const parentInFocus = chatMessages.querySelector(`[data-message-id="${message.parentId}"]`);
            if (parentInFocus) {
              console.log(`✅ FOCUS_MODE: Allowing new reply ${message.id} - parent ${message.parentId} is in focus container`);
              // Allow the reply to be added
            } else {
              // Parent not found, but if this is a direct reply to the focused message, allow it
              if (message.parentId === focusMessageId) {
                console.log(`✅ FOCUS_MODE: Allowing direct reply ${message.id} to focused message ${focusMessageId}`);
                // Allow the reply
              } else {
                console.log(`🔒 FOCUS_MODE: Blocking message ${message.id} - parent ${message.parentId} not in focus container`);
                return;
              }
            }
          } else {
            console.log(`🔒 FOCUS_MODE: Blocking message ${message.id} - not in focus mode`);
            return;
          }
        } else {
          console.log(`🔒 FOCUS_MODE: Blocking message ${message.id} - not focused message (${focusMessageId}), not direct reply, and not nested reply`);
          return;
        }
      }
      console.log(`✅ FOCUS_MODE: Allowing message ${message.id} - isFocused=${isFocusedMessage}, isDirectReply=${isDirectReplyToFocused}, isNestedReply=${isNestedReply}`);
    }
  } else {
    // DEFAULT MODE: No reply hierarchy filtering - all messages are allowed
    console.log(`📝 DEFAULT_MODE: Allowing message ${message.id} - no hierarchy filtering in default mode`);
  }

  // Remove placeholder text if it exists
  const placeholder = chatMessages.querySelector('p[style*="text-align: center"]');
  if (placeholder) {
    console.log('🔍 ADD_MESSAGE: Removing placeholder text');
    placeholder.remove();
  }

  // Get the community name from the conversation
  let communityName = '';
  if (message.conversation) {
    if (message.conversation.communityName) {
      communityName = message.conversation.communityName;
    } else if (message.conversation.communityId) {
      const result = await chrome.storage.local.get(['communities']);
      const communities = result.communities || [];
      const community = communities.find(c => c.id === message.conversation.communityId);
      communityName = community ? community.name : '';
    }
  }
  
  // Fallback to current primary community if no community found
  if (!communityName && typeof window.getPrimaryCommunityName === 'function') {
    communityName = await window.getPrimaryCommunityName();
  }
  
  // Create message element
  console.log('🔍 ADD_MESSAGE: Creating message element for:', message.id);
  const messageDiv = document.createElement('div');
  
  // UNIFIED: Determine if we're in focus mode (check main container flags)
  const isMessageInFocusMode = chatMessages.dataset.focusMode === 'true' ||
                        chatMessages.classList.contains('focus-mode-active');

  // UNIFIED MESSAGE DISPLAY: All messages (default and focus mode) use SAME structure
  // No inline styles, no special classes - CSS handles everything
  if (message.isReply || message.parentId) {
    // Reply messages - same structure as default, just with reply classes
    messageDiv.className = 'message message-reply thread-reply message-loaded';
  } else {
    // Main messages - same structure for both default and focus mode
    messageDiv.className = 'message thread-starter message-loaded';
  }
  
  // UNIFIED: No inline styles - CSS handles all styling
  // CSS classes are sufficient for proper display
  
  // UNIFIED: All messages start hidden until loaded (CSS handles this)
  // In focus mode, replies are marked as loaded immediately
  // In default mode, message-loaded class is added after content is ready
  
  messageDiv.dataset.messageId = message.id;
  messageDiv.dataset.conversationId = message.conversationId;
  messageDiv.dataset.authorId = message.authorId || message.author?.id || message.author?.user_id;

  // FOCUS MODE ONLY: Store parent ID for reply positioning
  if (isMessageInFocusMode && message.parentId) {
    messageDiv.dataset.parentId = message.parentId;
  }
  
  // ROOT CAUSE FIX: Always fetch author data from backend (source of truth)
  // convertSupabaseMessageToAPIFormat might have wrong data, so double-check here
  let author = message.author;
  const messageUserId = message.user_id || message.AppUser?.id || message.author?.id || message.authorId;
  
  // COMP METHOD: Get aura color from visibility data (most up-to-date source)
  function getAuraColorFromVisibility(userId) {
    if (!userId) return null;
    
    // Check visibility data first (most up-to-date)
    if (window.currentVisibilityDataUnfiltered?.active) {
      const user = window.currentVisibilityDataUnfiltered.active.find(u => 
        String(u.id || u.userId || u.user_id) === String(userId)
      );
      if (user && user.auraColor && user.auraColor !== window.AVATAR_FALLBACK_COLOR) {
        return user.auraColor;
      }
    }
    
    // Check filtered visibility data
    if (window.currentVisibilityData?.active) {
      const user = window.currentVisibilityData.active.find(u => 
        String(u.id || u.userId || u.user_id) === String(userId)
      );
      if (user && user.auraColor && user.auraColor !== window.AVATAR_FALLBACK_COLOR) {
        return user.auraColor;
      }
    }
    
    return null;
  }
  // ROOT CAUSE FIX: Always fetch from backend if we have userId - backend is source of truth
  if (window.api && messageUserId && messageUserId !== 'unknown') {
    try {
      // CRITICAL FIX: Skip test/non-existent user IDs to avoid 500 errors
      if (messageUserId === 'test-user-id' || messageUserId === 'test@example.com' || 
          messageUserId === 'undefined' || messageUserId === 'null' || !messageUserId) {
        console.log(`⚠️ AUTHOR_FETCH: Skipping test/invalid user ID: ${messageUserId}`);
        if (!author) {
          author = {
            id: messageUserId,
            user_id: messageUserId,
            name: 'Unknown',
            avatarUrl: null,
            auraColor: null
          };
        }
      } else {
        const resp = await window.api.request(`/v1/users/${encodeURIComponent(messageUserId)}`, { method: 'GET', allow404: true });
        if (resp) {
          console.log('✅ ADD_MESSAGE: Fetched author from backend (source of truth):', resp.name);
          
          // COMP METHOD: Get aura color from visibility data (preferred) or backend response
          const visibilityAuraColor = getAuraColorFromVisibility(messageUserId);
          const auraColor = visibilityAuraColor || resp.auraColor || author?.auraColor || null;
          
          // Always use backend data - it's the correct author
          author = {
            name: resp.name || 'Unknown',
            handle: resp.handle || resp.name || 'Unknown',
            id: resp.id || messageUserId,
            user_id: resp.id || messageUserId,
            avatarUrl: resp.avatarUrl || null,
            auraColor: auraColor // COMP METHOD: Prefer visibility data, fallback to backend, then existing
          };
          
          if (visibilityAuraColor) {
            console.log(`✅ ADD_MESSAGE: Using aura color from visibility data: ${visibilityAuraColor}`);
          } else if (resp.auraColor) {
            console.log(`✅ ADD_MESSAGE: Using aura color from backend: ${resp.auraColor}`);
          }
        } else {
          // User not found - create fallback author
          console.log(`⚠️ AUTHOR_FETCH: User ${messageUserId} not found, using fallback`);
          if (!author) {
            author = {
              id: messageUserId,
              user_id: messageUserId,
              name: 'Unknown',
              avatarUrl: null,
              auraColor: null
            };
          }
        }
      }
    } catch (err) {
      console.error('❌ AUTHOR_FETCH: Error fetching author:', err);
      // Create fallback author on error
      if (!author) {
        author = {
          id: messageUserId,
          user_id: messageUserId,
          name: 'Unknown',
          avatarUrl: null,
          auraColor: null
        };
      }
    }
  }
  // COMP METHOD: If author still doesn't have aura color, try to get it from visibility data
  if (author && messageUserId && !author.auraColor) {
    const visibilityAuraColor = getAuraColorFromVisibility(messageUserId);
    if (visibilityAuraColor) {
      author.auraColor = visibilityAuraColor;
      console.log(`✅ ADD_MESSAGE: Added aura color from visibility data: ${visibilityAuraColor}`);
    }
  }
  
  // If still no author data, create minimal author from message data
  if (!author) {
    const senderName = message.AppUser?.name || message.author?.name || 'Unknown';
    const senderId = messageUserId || 'unknown';
    author = {
      name: senderName,
      id: senderId,
      user_id: senderId,
      avatarUrl: null // Never use current user data as fallback - fetch from backend if needed
    };
  }
  
  const senderName = author.name || 'Unknown User';
  
  // COMP RESTORATION: Log resolved author data
  console.log('🔍 ADD_MESSAGE: Resolved author data:');
  console.log('  Author name:', senderName);
  console.log('  Author ID:', author.id || author.user_id);
  console.log('  Author avatar:', author.avatarUrl);
  console.log('  Message user_id:', messageUserId || message.user_id || message.AppUser?.id || 'N/A');
  console.log('  Current user ID:', window.currentUser?.id);
  console.log('  Cross-profile issue:', (author.id || author.user_id) !== (window.currentUser?.id || window.currentUser?.user_id));
  
  // Add reaction and reply buttons with counts
  const reactionCount = message.reactionCount || 0;
  const replyCount = message.replyCount || 0;
  const hasUnseenReplies = message.hasUnseenReplies || false;
  
  // ROOT CAUSE FIX: Use SVG icons instead of emoji
  const blankReactIcon = `<svg viewBox="0 0 24 24" aria-hidden="true" style="width: 18px; height: 18px; fill: currentColor;"><g><path d="M16.697 5.5c-1.222-.06-2.679.51-3.89 2.16l-.805 1.09-.806-1.09C9.984 6.01 8.526 5.44 7.304 5.5c-1.243.07-2.349.78-2.91 1.91-.552 1.12-.633 2.78.479 4.82 1.074 1.97 3.257 4.27 7.129 6.61 3.87-2.34 6.052-4.64 7.126-6.61 1.111-2.04 1.03-3.7.477-4.82-.561-1.13-1.666-1.84-2.908-1.91zm4.187 7.69c-1.351 2.48-4.001 5.12-8.379 7.67l-.503.3-.504-.3c-4.379-2.55-7.029-5.19-8.382-7.67-1.36-2.5-1.41-4.86-.514-6.67.887-1.79 2.647-2.91 4.601-3.01 1.651-.09 3.368.56 4.798 2.01 1.429-1.45 3.146-2.1 4.796-2.01 1.954.1 3.714 1.22 4.601 3.01.896 1.81.846 4.17-.514 6.67z"></path></g></svg>`;
  
  const replyIcon = `<svg viewBox="0 0 24 24" aria-hidden="true" style="width: 18px; height: 18px; fill: currentColor;"><g><path d="M1.751 10c0-4.42 3.584-8 8.005-8h4.366c4.49 0 8.129 3.64 8.129 8.13 0 2.96-1.607 5.68-4.196 7.11l-8.054 4.46v-3.69h-.067c-4.49.1-8.183-3.51-8.183-8.01zm8.005-6c-3.317 0-6.005 2.69-6.005 6 0 3.37 2.77 6.08 6.138 6.01l.351-.01h1.761v2.3l5.087-2.81c1.951-1.08 3.163-3.13 3.163-5.36 0-3.39-2.744-6.13-6.129-6.13H9.756z"></path></g></svg>`;
  
  const repostIcon = `<svg viewBox="0 0 24 24" aria-hidden="true" style="width: 18px; height: 18px; fill: currentColor;"><g><path d="M4.5 3.88l4.432 4.14-1.364 1.46L5.5 7.55V16c0 1.1.896 2 2 2H13v2H7.5c-2.209 0-4-1.79-4-4V7.55L1.432 9.48.068 8.02 4.5 3.88zM16.5 6H11V4h5.5c2.209 0 4 1.79 4 4v8.45l2.068-1.93 1.364 1.46-4.432 4.14-4.432-4.14 1.364-1.46 2.068 1.93V8c0-1.1-.896-2-2-2z"></path></g></svg>`;
  
  // Bookmark icons - inactive (outline) and active (filled)
  const bookmarkIconInactive = `<svg viewBox="0 0 24 24" aria-hidden="true" style="width: 18px; height: 18px; fill: currentColor;"><g><path d="M4 4.5C4 3.12 5.119 2 6.5 2h11C18.881 2 20 3.12 20 4.5v18.44l-8-5.71-8 5.71V4.5zM6.5 4c-.276 0-.5.22-.5.5v14.56l6-4.29 6 4.29V4.5c0-.28-.224-.5-.5-.5h-11z"></path></g></svg>`;
  const bookmarkIconActive = `<svg viewBox="0 0 24 24" aria-hidden="true" style="width: 18px; height: 18px; fill: currentColor;"><g><path d="M4 4.5C4 3.12 5.119 2 6.5 2h11C18.881 2 20 3.12 20 4.5v18.44l-8-5.71-8 5.71V4.5z"></path></g></svg>`;
  
  const shareIcon = `<svg viewBox="0 0 24 24" aria-hidden="true" style="width: 18px; height: 18px; fill: currentColor;"><g><path d="M12 2.59l5.7 5.7-1.41 1.42L13 6.41V16h-2V6.41l-3.3 3.3-1.41-1.42L12 2.59zM21 15l-.02 3.51c0 1.38-1.12 2.49-2.5 2.49H5.5C4.11 21 3 19.88 3 18.5V15h2v3.5c0 .28.22.5.5.5h12.98c.28 0 .5-.22.5-.5L19 15h2z"></path></g></svg>`;
  
  // Get reply count for display next to reply icon
  const hasRepliesValue = message.hasReplies || message.replyCount > 0;
  const replyCountValue = message.replyCount || (hasRepliesValue ? 1 : 0);
  // CLEAN HTML REFACTOR: Removed inline styles from icon counts
  const replyCountDisplay = replyCountValue > 0 ? `<span class="icon-count">${replyCountValue}</span>` : '';
  
  // Get bookmark count and status (will be loaded async)
  const bookmarkCount = message.bookmarkCount || 0;
  const isBookmarked = message.isBookmarked || false;
  const bookmarkCountDisplay = bookmarkCount > 0 ? `<span class="icon-count bookmark-count">${bookmarkCount}</span>` : '';
  const bookmarkIconToUse = isBookmarked ? bookmarkIconActive : bookmarkIconInactive;
  const bookmarkButtonClass = isBookmarked ? 'bookmark-btn active' : 'bookmark-btn';
  // Use CSS variable for active color instead of hardcoded value
  const bookmarkButtonColor = isBookmarked ? 'var(--icon-active-color, #1da1f2)' : '#666';
  
  // CRITICAL: Check if current user has replied/reposted/shared to this message
  const currentUserId = window.currentUser?.id || window.currentUser?.user_id;
  let hasUserReplied = false;
  let hasUserReposted = false;
  let hasUserShared = false;
  
  // Check if user has replied - look for replies in currentChatData where parentId matches and user_id matches current user
  if (currentUserId && window.currentChatData && Array.isArray(window.currentChatData)) {
    hasUserReplied = window.currentChatData.some(m => 
      m.parentId === message.id && 
      (m.user_id === currentUserId || m.AppUser?.id === currentUserId || m.authorId === currentUserId)
    );
    console.log(`🔍 ADD_MESSAGE: Checked for user reply - hasUserReplied: ${hasUserReplied} for message ${message.id}`);
  }
  
  // Check if user has reposted - check message.reposts array or repost data
  if (currentUserId && message.reposts && Array.isArray(message.reposts)) {
    hasUserReposted = message.reposts.some(repost => 
      repost.user_id === currentUserId || repost.userId === currentUserId
    );
  } else if (message.isReposted) {
    hasUserReposted = message.isReposted === true;
  }
  
  // Check if user has shared - check message.shares array or share data
  if (currentUserId && message.shares && Array.isArray(message.shares)) {
    hasUserShared = message.shares.some(share => 
      share.user_id === currentUserId || share.userId === currentUserId
    );
  } else if (message.isShared) {
    hasUserShared = message.isShared === true;
  }
  // Apply active classes and colors when user has interacted
  const replyButtonClass = hasUserReplied ? 'inline-reply-btn active' : 'inline-reply-btn';
  const repostButtonClass = hasUserReposted ? 'repost-btn active' : 'repost-btn';
  const shareButtonClass = hasUserShared ? 'share-btn active' : 'share-btn';
  
  // Order: replies, repost, reactions, bookmarks, share
  // CLEAN HTML REFACTOR: Removed inline styles, using CSS classes
  const replyButton = `<button class="${replyButtonClass}" data-message-id="${message.id}" data-has-replied="${hasUserReplied}" title="Reply in community">${replyIcon}${replyCountDisplay}</button>`;
  const repostButton = `<button class="${repostButtonClass}" data-message-id="${message.id}" data-has-reposted="${hasUserReposted}" title="Repost">${repostIcon}</button>`;
  const reactionButton = `<button class="reaction-btn" data-message-id="${message.id}" title="Add reaction">${blankReactIcon}<span class="icon-count" style="display: none;"></span></button>`;
  const bookmarkButton = `<button class="${bookmarkButtonClass}" data-message-id="${message.id}" data-is-bookmarked="${isBookmarked}" title="Bookmark">${bookmarkIconToUse}${bookmarkCountDisplay}</button>`;
  const shareButton = `<button class="${shareButtonClass}" data-message-id="${message.id}" data-has-shared="${hasUserShared}" title="Share">${shareIcon}</button>`;
  
  // COMP METHOD: Use dropdown menu instead of separate edit/delete buttons
  const canEdit = messageUserId === (window.currentUser?.id || window.currentUser?.user_id) || 
                  message.user_id === window.currentUser?.id ||
                  message.authorId === window.currentUser?.id || 
                  message.authorId === window.currentUser?.user_id ||
                  (message.author?.id || message.author?.user_id) === (window.currentUser?.id || window.currentUser?.user_id) ||
                  (message.AppUser?.id || message.AppUser?.user_id) === (window.currentUser?.id || window.currentUser?.user_id);
  
  // Use getMessageActionsMenu function to create dropdown menu
  let messageActionButtons = '';
  if (typeof getMessageActionsMenu === 'function') {
    messageActionButtons = getMessageActionsMenu(message, canEdit, messageUserId === (window.currentUser?.id || window.currentUser?.user_id));
  } else {
    // Fallback: create dropdown menu inline
    const canDelete = messageUserId === (window.currentUser?.id || window.currentUser?.user_id);
    messageActionButtons = `
      <div class="message-actions-menu">
        <button class="action-dots-btn" data-message-id="${message.id}" title="Message actions">
          <span class="action-dots">⋯</span>
        </button>
        <div class="action-dropdown">
          ${canEdit ? `<button class="action-item edit-btn" data-message-id="${message.id}">✏️ Edit</button>` : ''}
          ${canDelete ? `<button class="action-item delete-btn" data-message-id="${message.id}">🗑️ Delete</button>` : ''}
          <button class="action-item flag-btn" data-message-id="${message.id}" disabled>🚩 Flag</button>
        </div>
      </div>
    `;
  }
  
  // Convert URLs to clickable links
  const contentWithLinks = convertUrlsToLinks(message.body || message.content);
  
  // COMP METHOD: Use unified avatar structure with aura ring behind image
  let avatarHTML = '';
  try {
    if (window.AvatarUtils && typeof window.AvatarUtils.createUnifiedAvatar === 'function') {
      // Use AvatarUtils to create unified avatar with aura ring
      // CRITICAL FIX: Ensure auraColor is passed correctly to AvatarUtils
      // Log author object before passing to AvatarUtils
      console.log(`🔍 ADD_MESSAGE: Author object before AvatarUtils:`, {
        id: author.id,
        name: author.name,
        auraColor: author.auraColor,
        aura_color: author.aura_color
      });
      
      avatarHTML = await window.AvatarUtils.createUnifiedAvatar(author, 'message', {
        size: 32,
        showAura: true,
        showStatus: false
      });
      console.log('✅ ADD_MESSAGE: Created unified avatar with aura ring for', senderName);
    } else {
      // Fallback to simple img if AvatarUtils not available
      const resolvedAvatarUrl = author.avatarUrl || '';
      // CLEAN HTML REFACTOR: Only keep dynamic border-color inline
      avatarHTML = `<div class="avatar-container"><img src="${resolvedAvatarUrl}" alt="${senderName}" class="avatar-img" style="border-color: ${author.auraColor || window.AVATAR_FALLBACK_COLOR};" referrerpolicy="no-referrer" data-author-id="${author.id || author.user_id || ''}"></div>`;
    }
  } catch (error) {
    console.error('❌ ADD_MESSAGE: Error creating unified avatar:', error);
    // Fallback to simple img on error
    const resolvedAvatarUrl = author.avatarUrl || '';
    // CLEAN HTML REFACTOR: Only keep dynamic border-color inline
    avatarHTML = `<div class="avatar-container"><img src="${resolvedAvatarUrl}" alt="${senderName}" class="avatar-img" style="border-color: ${author.auraColor || window.AVATAR_FALLBACK_COLOR};" referrerpolicy="no-referrer" data-author-id="${author.id || author.user_id || ''}"></div>`;
  }

  // COMP METHOD: avatarHTML from createUnifiedAvatar already includes wrapper div with position relative
  // So we don't need another wrapper, just use the HTML directly
  // REMOVED: reply-context-row is not in COMP - removed to match COMP exactly
  let replyContextHTML = '';
  
  // UNIFIED: Check if we're in focus mode for date format and placement
  const isDateInFocusMode = chatMessages.dataset.focusMode === 'true' ||
                        chatMessages.classList.contains('focus-mode-active');
  
  // CRITICAL FIX: Focus mode replies should use SAME date format as default mode (not focus mode format)
  const isReplyMessage = !!(message.parentId || message.isReply);
  // For replies in focus mode, use default format (pass false), for main message use focus format
  const useDefaultFormat = isDateInFocusMode && isReplyMessage;
  const formattedTime = formatMessageTime(message.createdAt || message.created_at, !useDefaultFormat && isDateInFocusMode);
  
  // CRITICAL FIX: Date placement based on mode
  // Focus mode parent: Date in footer (same format as before)
  // Default mode and replies: Date in header row between community and action icons
  const isFocusModeParent = isDateInFocusMode && !isReplyMessage;
  const dateInHeader = isFocusModeParent ? '' : `<span class="message-time-new">${formattedTime}</span>`;
  const dateInFooter = isFocusModeParent ? `<div class="focus-date-row"><span class="message-time-new">${formattedTime}</span></div>` : '';
  
  // UNIFIED MESSAGE RENDERING: Direct children structure (no .message-inner wrapper)
  // This matches the CSS expectations for flex layout
  // CRITICAL: Always render full content - CSS classes control visibility, not display:none
  messageDiv.innerHTML = `
    ${replyContextHTML}
    <div class="avatar-container">${avatarHTML}</div>
    <div class="message-content-wrapper">
      <div class="message-header-new">
        <span class="message-sender-name">${senderName}${communityName ? ` • ${communityName}` : ''}</span>
        ${dateInHeader}
        <div class="message-actions-new">
          ${messageActionButtons}
        </div>
      </div>
      <div class="message-content">${contentWithLinks}</div>
      ${message.optionalContent ? `<div class="message-anchor">📍 ${message.optionalContent}</div>` : ''}
    </div>
    <div class="message-footer">
      ${dateInFooter}
      <div class="message-footer-actions">
        ${replyButton}
        ${repostButton}
        ${reactionButton}
        ${bookmarkButton}
        ${shareButton}
      </div>
    </div>
  `;
  
  // CRITICAL FIX: Ensure content wrapper has proper dimensions to prevent zero-height collapse
  // This must be done AFTER innerHTML is set
  await new Promise(resolve => requestAnimationFrame(resolve));
  const contentWrapper = messageDiv.querySelector('.message-content-wrapper');
  if (contentWrapper) {
    // Force layout calculation - ensure content has dimensions
    contentWrapper.style.setProperty('display', 'flex', 'important');
    contentWrapper.style.setProperty('flex-direction', 'column', 'important');
    contentWrapper.style.setProperty('min-height', '1px', 'important'); // Prevent zero-height collapse
    contentWrapper.style.setProperty('width', '100%', 'important');
    contentWrapper.style.setProperty('min-width', '0', 'important');
    contentWrapper.style.setProperty('box-sizing', 'border-box', 'important');
  }
  
  // CRITICAL FIX: Ensure message content has proper dimensions and is visible
  const messageContent = messageDiv.querySelector('.message-content');
  if (messageContent) {
    messageContent.style.setProperty('display', 'block', 'important');
    messageContent.style.setProperty('min-height', '1px', 'important'); // Prevent zero-height collapse
    messageContent.style.setProperty('width', '100%', 'important');
    messageContent.style.setProperty('min-width', '0', 'important');
    messageContent.style.setProperty('box-sizing', 'border-box', 'important');
    messageContent.style.setProperty('visibility', 'visible', 'important');
    messageContent.style.setProperty('opacity', '1', 'important');
    // CRITICAL: Ensure content is actually set - if empty, set it from message body/content
    if (!messageContent.innerHTML || messageContent.innerHTML.trim() === '') {
      const fallbackContent = message.body || message.content || '';
      if (fallbackContent) {
        messageContent.innerHTML = convertUrlsToLinks(fallbackContent);
        console.log('✅ ADD_MESSAGE: Fixed empty message content:', fallbackContent);
      }
    }
  }
  
  // CRITICAL FIX: In focus mode, ensure reply has proper dimensions immediately
  if (isMessageInFocusMode && message.isReply) {
    messageDiv.style.setProperty('display', 'flex', 'important');
    messageDiv.style.setProperty('flex-direction', 'row', 'important');
    messageDiv.style.setProperty('flex-wrap', 'wrap', 'important');
    messageDiv.style.setProperty('width', '100%', 'important');
    messageDiv.style.setProperty('min-width', '0', 'important');
    messageDiv.style.setProperty('min-height', '1px', 'important'); // Prevent zero-height collapse
    messageDiv.style.setProperty('visibility', 'visible', 'important');
    messageDiv.style.setProperty('opacity', '1', 'important');
    messageDiv.style.setProperty('position', 'relative', 'important');
    messageDiv.style.setProperty('z-index', 'auto', 'important');
    
    // CRITICAL FIX: Ensure actions menu is active on replies
    const actionsMenu = messageDiv.querySelector('.message-actions-new');
    if (actionsMenu) {
      actionsMenu.style.setProperty('pointer-events', 'auto', 'important');
      actionsMenu.style.setProperty('cursor', 'pointer', 'important');
      actionsMenu.style.setProperty('opacity', '1', 'important');
      actionsMenu.style.setProperty('visibility', 'visible', 'important');
      actionsMenu.style.setProperty('z-index', '20', 'important');
      actionsMenu.style.setProperty('position', 'relative', 'important');
      
      // Also fix all buttons in actions menu
      const buttons = actionsMenu.querySelectorAll('button');
      buttons.forEach(btn => {
        btn.style.setProperty('pointer-events', 'auto', 'important');
        btn.style.setProperty('cursor', 'pointer', 'important');
        btn.style.setProperty('opacity', '1', 'important');
        btn.style.setProperty('visibility', 'visible', 'important');
      });
    }
  }
  
  // CRITICAL FIX: Remove white line from parent message in focus mode using inline styles
  if (isMessageInFocusMode && !message.isReply && !message.parentId) {
    // This is the parent message in focus mode
    messageDiv.style.setProperty('border-bottom', 'none', 'important');
    messageDiv.style.setProperty('border-top', 'none', 'important');
    messageDiv.style.setProperty('border', 'none', 'important');
    messageDiv.style.setProperty('outline', 'none', 'important');
    messageDiv.style.setProperty('box-shadow', 'none', 'important');
    
    // Remove ::before pseudo-element using a style tag if needed
    const styleId = 'remove-white-line-' + message.id;
    if (!document.getElementById(styleId)) {
      const style = document.createElement('style');
      style.id = styleId;
      style.textContent = `
        .chat-messages[data-focus-mode="true"] [data-message-id="${message.id}"]::before,
        .chat-messages.focus-mode-active [data-message-id="${message.id}"]::before {
          display: none !important;
          content: none !important;
          height: 0 !important;
          width: 0 !important;
          background: transparent !important;
          opacity: 0 !important;
          visibility: hidden !important;
          pointer-events: none !important;
          border: none !important;
          margin: 0 !important;
          padding: 0 !important;
        }
      `;
      document.head.appendChild(style);
    }
  }
  
  // Store author name in data attribute
  messageDiv.dataset.authorName = senderName;

  // FOCUS MODE ONLY: Make message body clickable to enter focus mode (only for main messages)
  // DEFAULT MODE: No focus mode entry on click
  // CRITICAL FIX: Check focus mode flag from container, not from message
  const chatMessagesContainer = document.querySelector('.chat-messages');
  const isContainerInFocusMode = chatMessagesContainer?.dataset.focusMode === 'true';
  const messageContentWrapper = messageDiv.querySelector('.message-content-wrapper');
  if (messageContentWrapper && !isContainerInFocusMode && !isMessageInFocusMode && !message.parentId && !message.isReply) {
    // DEFAULT MODE: Allow focus mode entry for main messages
    // CRITICAL FIX: Remove any existing click listeners to prevent duplicates
    const newWrapper = messageContentWrapper.cloneNode(true);
    messageContentWrapper.parentNode.replaceChild(newWrapper, messageContentWrapper);
    const freshWrapper = messageDiv.querySelector('.message-content-wrapper');
    
    freshWrapper.style.cursor = 'pointer';
    freshWrapper.addEventListener('click', (e) => {
      // Don't trigger if clicking on buttons, links, or footer
      if (e.target.closest('.message-actions-new') ||
          e.target.closest('.message-footer') ||
          e.target.closest('.message-footer-actions') ||
          e.target.closest('.inline-reply-btn') ||
          e.target.closest('.reaction-btn') ||
          e.target.closest('.bookmark-btn') ||
          e.target.closest('.share-btn') ||
          e.target.closest('.repost-btn') ||
          e.target.closest('button') ||
          e.target.closest('a') ||
          e.target.closest('svg') ||
          e.target.closest('.icon-count')) {
        console.log('🔘 FOCUS: Click intercepted - button/icon clicked');
        return;
      }
      e.stopPropagation();
      console.log('🔘 FOCUS: Message content clicked, entering focus mode for:', message.id);
      if (typeof handleMessageFocus === 'function') {
        handleMessageFocus(message);
      } else if (window.handleMessageFocus && typeof window.handleMessageFocus === 'function') {
        window.handleMessageFocus(message);
      } else {
        console.error('❌ FOCUS: handleMessageFocus not available');
      }
    });
  }
  // Add event listeners for action buttons
  // CRITICAL FIX: Always attach listeners, but check flag to prevent duplicates
  // ROOT CAUSE FIX: Reset flag if we're going to clone buttons (buttons might have been cloned elsewhere)
  if (!messageDiv.dataset.listenersAttached) {
    console.log(`🔧 ADD_MESSAGE: Attaching event listeners to message ${message.id}`);
    addMessageActionListeners(messageDiv, message);
    messageDiv.dataset.listenersAttached = 'true';
  } else {
    console.log(`⚠️ ADD_MESSAGE: Listeners already marked as attached for ${message.id}, but verifying...`);
    // CRITICAL FIX: Check if buttons exist and might need fresh listeners (if cloned)
    const replyBtn = messageDiv.querySelector('.inline-reply-btn');
    const reactionBtn = messageDiv.querySelector('.reaction-btn');
    const bookmarkBtn = messageDiv.querySelector('.bookmark-btn');
    
    // If buttons exist but might have been cloned (no onclick handler), reset flag and re-attach
    if (replyBtn || reactionBtn || bookmarkBtn) {
      const needsReattach = !replyBtn?.onclick && !reactionBtn?.onclick && !bookmarkBtn?.onclick;
      
      if (needsReattach) {
        console.log(`🔧 ADD_MESSAGE: Buttons exist but have no handlers, re-attaching listeners for ${message.id}`);
        // CRITICAL FIX: Reset flag before re-attaching
        messageDiv.dataset.listenersAttached = 'false';
        addMessageActionListeners(messageDiv, message);
        messageDiv.dataset.listenersAttached = 'true';
      } else {
        console.log(`✅ ADD_MESSAGE: Buttons already have handlers, skipping re-attachment for ${message.id}`);
      }
    }
  }
  
  // ROOT CAUSE FIX: Reply button behavior - if message has replies, clicking reply icon expands/collapses them
  // For replies, clicking message body opens focus mode
  // CRITICAL FIX: This handler is now handled in addMessageActionListeners() to avoid duplication
  // Removed duplicate handler - reply button is handled in addMessageActionListeners()
  
  // Repost button handler - CRITICAL: Update active state after reposting
  const repostBtn = messageDiv.querySelector('.repost-btn');
  if (repostBtn) {
    repostBtn.addEventListener('click', async (e) => {
      e.preventDefault();
      e.stopPropagation();
      console.log('🔄 REPOST: Repost button clicked for message:', message.id);
      
      // Call repost handler
      if (typeof handleRepost === 'function') {
        await handleRepost(message);
      } else if (typeof window.handleRepost === 'function') {
        await window.handleRepost(message);
      }
      
      // CRITICAL: Set active state after successful repost
      repostBtn.classList.add('active');
      repostBtn.dataset.hasReposted = 'true';
      repostBtn.querySelector('svg')?.setAttribute('style', 'fill: var(--icon-active-color, #1da1f2);');
      console.log('✅ REPOST: Button set to active state for message:', message.id);
    });
  }
  
  // Bookmark button handler - CRITICAL FIX: Clone button to remove old listeners (like other buttons)
  const bookmarkBtn = messageDiv.querySelector('.bookmark-btn');
  if (bookmarkBtn) {
    // CRITICAL FIX: Clone button to remove old listeners if needed (same pattern as other buttons)
    const existingHandler = bookmarkBtn.onclick;
    let actualBookmarkBtn = bookmarkBtn;
    
    if (existingHandler || bookmarkBtn.dataset.hasListener === 'true') {
      const newBookmarkBtn = bookmarkBtn.cloneNode(true);
      bookmarkBtn.parentNode.replaceChild(newBookmarkBtn, bookmarkBtn);
      console.log(`🔧 MESSAGE_ACTIONS: Cloned bookmark button to remove old listeners for ${message.id}`);
      // Get the new button reference
      actualBookmarkBtn = messageDiv.querySelector('.bookmark-btn');
    }
    
    // Always attach listener (even if already attached, cloning ensures fresh listener)
    actualBookmarkBtn.addEventListener('click', async (e) => {
      e.preventDefault();
      e.stopPropagation();
      console.log('🔘 BOOKMARK: Bookmark button clicked for message:', message.id);
      console.log('🔘 BOOKMARK: Event target:', e.target);
      console.log('🔘 BOOKMARK: Button element:', actualBookmarkBtn);
      
      // CRITICAL FIX: Verify handleBookmarkToggle exists and call it
      console.log('🔘 BOOKMARK: Button clicked, checking for handleBookmarkToggle...');
      console.log('🔘 BOOKMARK: window.handleBookmarkToggle type:', typeof window.handleBookmarkToggle);
      console.log('🔘 BOOKMARK: handleBookmarkToggle type:', typeof handleBookmarkToggle);
      
      if (typeof window.handleBookmarkToggle === 'function') {
        console.log('🔘 BOOKMARK: Calling window.handleBookmarkToggle...');
        try {
          await window.handleBookmarkToggle(message.id, actualBookmarkBtn);
          console.log('✅ BOOKMARK: handleBookmarkToggle completed');
        } catch (error) {
          console.error('❌ BOOKMARK: Error in handleBookmarkToggle:', error);
        }
      } else if (typeof handleBookmarkToggle === 'function') {
        console.log('🔘 BOOKMARK: Calling local handleBookmarkToggle...');
        try {
          await handleBookmarkToggle(message.id, actualBookmarkBtn);
          console.log('✅ BOOKMARK: handleBookmarkToggle completed');
        } catch (error) {
          console.error('❌ BOOKMARK: Error in handleBookmarkToggle:', error);
        }
      } else {
        console.error('❌ BOOKMARK: handleBookmarkToggle function not found');
        console.error('❌ BOOKMARK: Available functions:', Object.keys(window).filter(k => k.includes('bookmark')));
      }
    });
    
    // CRITICAL FIX: Explicitly activate bookmark button
    actualBookmarkBtn.style.setProperty('pointer-events', 'auto', 'important');
    actualBookmarkBtn.style.setProperty('cursor', 'pointer', 'important');
    actualBookmarkBtn.style.setProperty('opacity', '1', 'important');
    actualBookmarkBtn.style.setProperty('visibility', 'visible', 'important');
    actualBookmarkBtn.style.setProperty('z-index', '20', 'important'); // CRITICAL FIX: Higher z-index for clicks
    actualBookmarkBtn.style.setProperty('position', 'relative', 'important');
    actualBookmarkBtn.disabled = false;
    actualBookmarkBtn.dataset.hasListener = 'true';
    
  // CRITICAL FIX: Load bookmark status AFTER a delay to ensure message is in DOM
  // In focus mode, wait longer for container to be appended
  const isInFocusMode = messageDiv.closest('.focus-messages-container') !== null ||
                       document.querySelector('.focus-messages-container') !== null ||
                       chatMessages?.dataset.focusMode === 'true';
  // CRITICAL FIX: Ensure bookmark button is properly activated in focus mode
  if (isInFocusMode && actualBookmarkBtn) {
    // Re-verify handleBookmarkToggle is available
    if (typeof window.handleBookmarkToggle === 'function') {
      console.log(`✅ FOCUS: handleBookmarkToggle available for bookmark button on message ${message.id}`);
    } else {
      console.warn(`⚠️ FOCUS: handleBookmarkToggle not available yet for message ${message.id}, will retry`);
      setTimeout(async () => {
        if (typeof window.handleBookmarkToggle === 'function') {
          console.log(`✅ FOCUS: handleBookmarkToggle now available for message ${message.id}`);
        } else {
          console.error(`❌ FOCUS: handleBookmarkToggle still not available for message ${message.id}`);
        }
      }, 1000);
    }
  }
  
  const delay = isInFocusMode ? 750 : 150; // Longer delay in focus mode for container append
    setTimeout(async () => {
      // Re-query button to ensure it's still in DOM
      const currentBtn = messageDiv.querySelector('.bookmark-btn');
      if (currentBtn) {
        await window.loadMessageBookmarks(message.id, currentBtn);
      } else {
        console.warn(`⚠️ MESSAGE_ACTIONS: Bookmark button not found for ${message.id} after delay`);
      }
    }, delay);
  }
  
  console.log('🔍 ADD_MESSAGE: Adding message to DOM:', message.id);
  
  // CRITICAL FIX: Force layout calculation after setting dimensions
  // This ensures browser calculates proper height before appending to DOM
  await new Promise(resolve => requestAnimationFrame(resolve));
  
  // FOCUS MODE ONLY: Apply reply hierarchy positioning
  if (isMessageInFocusMode && (message.parentId || message.isReply)) {
    const parentElement = chatMessages.querySelector(`[data-message-id="${message.parentId}"]`);
    if (parentElement) {
      // CRITICAL FIX: Find the input field for this parent (should be after parent)
      const inputField = chatMessages.querySelector('.focus-message-input-container');
      
      // Find all existing replies for this parent (they should be after input field in DOM)
      const parentReplies = Array.from(chatMessages.children).filter(child => {
        const childParentId = child.getAttribute('data-parent-id');
        return childParentId === message.parentId && 
               child !== parentElement && 
               child !== inputField &&
               child.classList.contains('message-reply');
      });

      if (parentReplies.length > 0) {
        // Newest at top - insert BEFORE the first existing reply (after input field)
        const firstReply = parentReplies[0];
        chatMessages.insertBefore(messageDiv, firstReply);
        console.log('✅ ADD_MESSAGE: Reply inserted BEFORE first sibling (newest at top, after input field)');
      } else if (inputField) {
        // CRITICAL FIX: Always insert AFTER input field, not before
        // Find all siblings after input field to determine correct position
        const inputIndex = Array.from(chatMessages.children).indexOf(inputField);
        const siblingsAfterInput = Array.from(chatMessages.children).slice(inputIndex + 1);
        
        // Find the first reply sibling (if any) to maintain chronological order
        const firstReplyAfterInput = siblingsAfterInput.find(sibling => 
          sibling.classList.contains('message-reply') || 
          sibling.classList.contains('thread-reply')
        );
        
        if (firstReplyAfterInput) {
          // Insert before first existing reply (maintains chronological order)
          chatMessages.insertBefore(messageDiv, firstReplyAfterInput);
          console.log('✅ ADD_MESSAGE: Reply inserted after input field, before first existing reply');
        } else if (inputField.nextSibling) {
          // Insert after input field, before next sibling
          chatMessages.insertBefore(messageDiv, inputField.nextSibling);
          console.log('✅ ADD_MESSAGE: Reply inserted AFTER input field (first reply)');
        } else {
          // Input field is last - append reply after it
          chatMessages.appendChild(messageDiv);
          console.log('✅ ADD_MESSAGE: Reply appended after input field (input is last)');
        }
      } else {
        // CRITICAL FIX: No input field yet - wait for it or insert at end
        // This should not happen if input field is created before replies are loaded
        console.warn(`⚠️ ADD_MESSAGE: No input field found for reply ${message.id} - input should be created first!`);
        // Insert at end - input field will be created later and replies will be reordered
        chatMessages.appendChild(messageDiv);
        console.log('✅ ADD_MESSAGE: Reply appended to container (no input field yet - will be reordered)');
        
        // CRITICAL FIX: Try to reorder after a short delay to allow input field to be created
        setTimeout(() => {
          const inputFieldAfter = chatMessages.querySelector('.focus-message-input-container');
          if (inputFieldAfter && messageDiv.parentNode === chatMessages) {
            const inputIndex = Array.from(chatMessages.children).indexOf(inputFieldAfter);
            const replyIndex = Array.from(chatMessages.children).indexOf(messageDiv);
            if (replyIndex < inputIndex) {
              // Reply is before input - move it after
              const siblingsAfterInput = Array.from(chatMessages.children).slice(inputIndex + 1);
              const firstReplyAfterInput = siblingsAfterInput.find(sibling => 
                sibling.classList.contains('message-reply') || 
                sibling.classList.contains('thread-reply')
              );
              if (firstReplyAfterInput) {
                chatMessages.insertBefore(messageDiv, firstReplyAfterInput);
              } else {
                chatMessages.insertBefore(messageDiv, inputFieldAfter.nextSibling || null);
              }
              console.log(`✅ ADD_MESSAGE: Reordered reply ${message.id} to after input field`);
            }
          }
        }, 200);
      }
    } else {
      // Parent not found - append to end
      chatMessages.appendChild(messageDiv);
      console.log('⚠️ ADD_MESSAGE: Parent not found, appended to end');
    }
  }
  // DEFAULT MODE: Simple chronological ordering
  else {
    // FOCUS MODE: In focus mode, check if back button exists and insert after it
    const backRow = chatMessages.querySelector('.focus-back-row');
    if (backRow && backRow.nextSibling) {
      // Insert after back button in focus mode
      chatMessages.insertBefore(messageDiv, backRow.nextSibling);
      console.log('✅ ADD_MESSAGE: Main message added after back button in focus mode');
    } else if (backRow) {
      // Back button exists but no next sibling - append after it
      chatMessages.insertBefore(messageDiv, chatMessages.children[1] || null);
      console.log('✅ ADD_MESSAGE: Main message added after back button (no next sibling)');
    } else {
      // DEFAULT MODE: Simple prepend to start (newest first)
      chatMessages.insertBefore(messageDiv, chatMessages.firstChild);
      console.log('✅ ADD_MESSAGE: New message prepended to top (default mode)');
    }
  }
  console.log('✅ ADD_MESSAGE: Message added to DOM successfully');

  // DEBUG: Log computed styles for message display comparison
  if (window.canopiModule && typeof window.canopiModule.logComputedStyles === 'function') {
    // Determine if this is a focus mode reply or regular message
    const isInFocusMode = chatMessages.classList.contains('focus-messages-container');
    const isReply = message.parentId || messageDiv.classList.contains('message-reply');

    console.log('🔍 MESSAGE DEBUG:', {
      containerClasses: chatMessages.className,
      messageClasses: messageDiv.className,
      isInFocusMode,
      isReply,
      messageId: message.id,
      parentId: message.parentId
    });

    if (isInFocusMode && isReply) {
      console.log('🎯 FOCUS MODE REPLY: Logging computed styles for focus mode reply');
      window.canopiModule.logComputedStyles(messageDiv, 'FOCUS_MODE_REPLY');
    } else if (!isInFocusMode && !isReply) {
      console.log('📝 DEFAULT MESSAGE: Logging computed styles for default view main message');
      window.canopiModule.logComputedStyles(messageDiv, 'DEFAULT_MAIN_MESSAGE');
    }
  }

  // MODULAR ARCHITECTURE: Use MessageVisibilityManager for dimension verification
  if (isMessageInFocusMode && message.isReply) {
    if (window.MessageVisibilityManager && typeof window.MessageVisibilityManager.verifyDimensions === 'function') {
      await window.MessageVisibilityManager.verifyDimensions(messageDiv, message.id);
    } else {
      console.warn('⚠️ ADD_MESSAGE: MessageVisibilityManager not available for dimension verification');
    }
  }
  
  // REFACTOR: Messages appear immediately - no waiting, no timeouts
  messageDiv.classList.add('message-loaded');
  
  // CRITICAL FIX: Don't clear ALL inline styles - preserve dimension fixes for focus mode replies
  if (isMessageInFocusMode && message.isReply) {
    // Keep dimension-related styles, only remove hiding styles
    if (messageDiv.style.display === 'none') {
      messageDiv.style.removeProperty('display');
    }
    if (messageDiv.style.visibility === 'hidden') {
      messageDiv.style.removeProperty('visibility');
    }
    // Keep all other inline styles (dimensions, positioning, etc.)
  } else {
    // For non-focus replies, clear all inline styles
    messageDiv.style.cssText = ''; // Remove any inline hiding styles
  }
  
  // ROOT CAUSE FIX: Remove all inline styling and reply indicator for COMP alignment
  if (message.parentId || message.isReply) {
    console.log('🔧 COMP_REPLY_FIX: Message is a reply, removing inline styles and indicator');
    
    // UNIFIED RENDERING: Remove padding/margin styles but preserve dimension fixes for focus mode
    if (!isMessageInFocusMode) {
      // Default mode: remove all inline styles
      messageDiv.style.marginLeft = '';
      messageDiv.style.marginRight = '';
      messageDiv.style.paddingLeft = '';
      messageDiv.style.paddingRight = '';
      messageDiv.style.paddingTop = '';
      messageDiv.style.marginBottom = '';
      messageDiv.style.padding = '';
      messageDiv.style.background = '';
      messageDiv.style.borderRadius = '';
      messageDiv.style.borderLeft = '';
      messageDiv.style.border = '';
      messageDiv.style.backgroundColor = '';
    }
    // Focus mode: preserve dimension-related styles (display, min-height, width, etc.)
    
    // Check if we're in focus mode
    const isFocusMode = isMessageInFocusMode || 
                       chatMessages.classList.contains('focus-messages-container') || 
                       chatMessages.classList.contains('focus-mode-active') ||
                       chatMessages.closest('.focus-messages-container') !== null ||
                       chatMessages.querySelector('.focus-back-row') !== null ||
                       chatMessages.dataset.focusMode === 'true';
    
    console.log(`🔍 COMP_REPLY_FIX: Checking focus mode for reply ${message.id}:`, {
      isFocusMode,
      isMessageInFocusMode,
      containerIsFocus: chatMessages.classList.contains('focus-messages-container'),
      hasBackRow: chatMessages.querySelector('.focus-back-row') !== null,
      hasFocusData: chatMessages.dataset.focusMode === 'true'
    });
    
    if (!isFocusMode) {
      // Default mode: hide replies
      if (!messageDiv.classList.contains('visible')) {
        messageDiv.classList.remove('visible');
        messageDiv.style.display = 'none';
        messageDiv.style.pointerEvents = 'none';
        console.log(`🔧 COMP_REPLY_FIX: Reply ${message.id} hidden (normal mode)`);
      }
    } else {
      // FOCUS MODE: Immediately make reply visible
      // CRITICAL: Set visibility BEFORE any other code can hide it
      messageDiv.style.setProperty('display', 'flex', 'important');
      messageDiv.style.setProperty('visibility', 'visible', 'important');
      messageDiv.style.setProperty('opacity', '1', 'important');
      // CRITICAL: Set width constraints to prevent zero-width collapse
      messageDiv.style.setProperty('width', '100%', 'important');
      messageDiv.style.setProperty('min-width', '0', 'important');
      messageDiv.style.setProperty('max-width', '100%', 'important');
      messageDiv.style.setProperty('box-sizing', 'border-box', 'important');
      messageDiv.classList.add('visible', 'message-loaded');
      
      // MODULAR ARCHITECTURE: Use MessageVisibilityManager to verify and fix dimensions
      if (window.MessageVisibilityManager && typeof window.MessageVisibilityManager.showReply === 'function') {
        await window.MessageVisibilityManager.showReply(messageDiv, message.id);
        console.log(`✅ FOCUS_MODE: Reply ${message.id} made visible using MessageVisibilityManager`);
      } else {
        // Fallback: Ensure classes are present
        messageDiv.classList.add('thread-reply', 'message-reply');
        console.warn('⚠️ FOCUS_MODE: MessageVisibilityManager not available, using fallback');
      }
    }
    
    // Remove reply-indicator if it exists
    const existingIndicator = messageDiv.querySelector('.reply-indicator');
    if (existingIndicator) {
      existingIndicator.remove();
      console.log('✅ COMP_REPLY_FIX: Removed reply-indicator');
    }
    
    // UNIFIED: No hierarchical display in default view
    // Only add has-replies class in focus mode
    const isInFocusMode = chatMessages.dataset.focusMode === 'true' || 
                         chatMessages.classList.contains('focus-mode-active');
    
    if (isInFocusMode) {
      // FOCUS MODE ONLY: Add visual connection to parent
      const parentElement = chatMessages.querySelector(`[data-message-id="${message.parentId}"]`);
      if (parentElement) {
        parentElement.classList.add('has-replies');
        // Remove inline border - let CSS handle it
        parentElement.style.borderBottom = '';
      }
    }
    // DEFAULT MODE: No has-replies class - all messages are standalone
    
    // FOCUS MODE FIX: Update log message to reflect actual visibility state
    const visibilityState = isFocusMode ? 'visible in focus mode' : 'hidden by default';
    console.log(`✅ COMP_REPLY_FIX: Removed inline styles and indicator from reply ${message.id}, ${visibilityState}`);
  }
  
  // Add message to global storage for avatar updates
  if (!window.currentChatData) {
    window.currentChatData = [];
  }
  
  // CRITICAL FIX: Store/update message in currentChatData with ALL properties including hasReplies and replyCount
  const existingDataIndex = window.currentChatData.findIndex(m => m.id === message.id);
  if (existingDataIndex >= 0) {
    // Update existing message data - preserve hasReplies and replyCount if they exist
    const existingData = window.currentChatData[existingDataIndex];
    window.currentChatData[existingDataIndex] = {
      ...existingData,
      ...message,
      // CRITICAL: Preserve hasReplies and replyCount from existing data if message doesn't have them
      hasReplies: message.hasReplies !== undefined ? message.hasReplies : existingData.hasReplies,
      replyCount: message.replyCount !== undefined ? message.replyCount : existingData.replyCount
    };
    console.log(`✅ ADD_MESSAGE: Updated message data in currentChatData for ${message.id}`, {
      hasReplies: window.currentChatData[existingDataIndex].hasReplies,
      replyCount: window.currentChatData[existingDataIndex].replyCount
    });
  } else {
    // Add new message to currentChatData
    window.currentChatData.push(message);
    console.log(`✅ ADD_MESSAGE: Added message to currentChatData: ${message.id}`, {
      hasReplies: message.hasReplies,
      replyCount: message.replyCount
    });
  }
  
  // CRITICAL FIX: Check if message already exists in DOM to prevent duplicates
  // SD3 FIX: Check target container first, then document-wide
  // ROOT CAUSE FIX: Only check document-wide if not found in target container
  // NEVER remove messages from main container - they should stay there
  let existingMessageElement = chatMessages.querySelector(`[data-message-id="${message.id}"]`);
  
  // Only check document-wide if not found in target container
  if (!existingMessageElement) {
    const isInFocusMode = chatMessages?.classList.contains('focus-messages-container') || 
                          chatMessages?.dataset.focusMode === 'true';
    
    // If we're in focus mode, check if message exists in main container
    // If it does, we should NOT remove it - just skip adding duplicate to focus
    if (isInFocusMode) {
      const mainContainer = document.querySelector('.chat-messages:not(.focus-messages-container)');
      if (mainContainer) {
        const existingInMain = mainContainer.querySelector(`[data-message-id="${message.id}"]`);
        if (existingInMain) {
          console.log('⚠️ ADD_MESSAGE: Message exists in main container, skipping duplicate in focus mode:', message.id);
          console.log('⚠️ ADD_MESSAGE: NOT removing from main container - preserving icons');
          return; // Skip adding duplicate to focus mode, but keep it in main container
        }
      }
    }
    
    // Last resort: check entire document (but only if we're in same container)
    existingMessageElement = document.querySelector(`[data-message-id="${message.id}"]`);
    if (existingMessageElement) {
      const existingContainer = existingMessageElement.closest('.chat-messages, .focus-messages-container');
      // Only treat as duplicate if it's in the same container we're adding to
      if (existingContainer !== chatMessages) {
        existingMessageElement = null; // Different container, allow adding
      }
    }
  }
  if (existingMessageElement) {
    console.log('🔍 ADD_MESSAGE: Message already exists in DOM, skipping duplicate:', message.id);
    console.log('🔍 ADD_MESSAGE: Existing message container:', existingMessageElement.closest('.chat-messages, .focus-messages-container')?.className || 'unknown');
    
    // CRITICAL FIX: Only ensure listeners are attached, NEVER remove or move the element
    // This preserves icons on all messages
    console.log('✅ ADD_MESSAGE: Message exists in same container, ensuring listeners attached');
    
    // CRITICAL FIX: Clone ALL buttons to remove old listeners before re-attaching
    const buttonsToClone = [
      { selector: '.inline-reply-btn', name: 'reply' },
      { selector: '.edit-btn', name: 'edit' },
      { selector: '.delete-btn', name: 'delete' },
      { selector: '.reaction-btn', name: 'reaction' },
      { selector: '.bookmark-btn', name: 'bookmark' },
      { selector: '.share-btn', name: 'share' },
      { selector: '.repost-btn', name: 'repost' }
    ];
    
    buttonsToClone.forEach(({ selector, name }) => {
      const btn = existingMessageElement.querySelector(selector);
      if (btn && (btn.onclick || btn.dataset.hasListener === 'true')) {
        const newBtn = btn.cloneNode(true);
        btn.parentNode.replaceChild(newBtn, btn);
        console.log(`🔧 ADD_MESSAGE: Cloned ${name} button to remove old listeners for ${message.id}`);
      }
    });
    
    // CRITICAL FIX: Explicitly activate all icon buttons (preserve existing icons)
    const iconButtons = [
      { selector: '.inline-reply-btn', name: 'reply' },
      { selector: '.reaction-btn', name: 'reaction' },
      { selector: '.bookmark-btn', name: 'bookmark' },
      { selector: '.share-btn', name: 'share' },
      { selector: '.repost-btn', name: 'repost' },
      { selector: '.edit-btn', name: 'edit' },
      { selector: '.delete-btn', name: 'delete' }
    ];
    
    iconButtons.forEach(({ selector, name }) => {
      const btn = existingMessageElement.querySelector(selector);
      if (btn) {
        btn.style.setProperty('pointer-events', 'auto', 'important');
        btn.style.setProperty('cursor', 'pointer', 'important');
        btn.style.setProperty('opacity', '1', 'important');
        btn.style.setProperty('visibility', 'visible', 'important');
        btn.style.setProperty('z-index', '20', 'important'); // CRITICAL FIX: Higher z-index for clicks
        btn.style.setProperty('position', 'relative', 'important');
        btn.disabled = false;
        console.log(`✅ ADD_MESSAGE: Activated ${name} button for existing message ${message.id}`);
      }
    });
    
    // CRITICAL FIX: Reset listenersAttached flag before re-attaching (buttons were cloned, need fresh listeners)
    existingMessageElement.dataset.listenersAttached = 'false';
    
    // Always re-attach listeners to ensure they work
    addMessageActionListeners(existingMessageElement, message);
    existingMessageElement.dataset.listenersAttached = 'true';
    console.log(`✅ ADD_MESSAGE: Re-attached event listeners to existing message ${message.id}`);
    
    return; // Skip adding duplicate message
  }
  
  // ROOT CAUSE FIX: With normal column direction, newest messages are at top
  // Keep scroll at top to show newest messages
  chatMessages.scrollTop = 0;
  
  console.log('✅ ADD_MESSAGE: Message added to chat successfully');
}

// ===== COMP METHOD: Helper Functions =====

// Function to get sender avatar with proper styling - REMOVED DUPLICATE
// Using the main getSenderAvatar function above that uses AvatarUtils.createUnifiedAvatar

// Function to get sender initial if no avatar
function getSenderInitial(name) {
  const initial = (name || 'U').charAt(0).toUpperCase();
  return `
    <div class="avatar-initial" style="width: 32px; height: 32px; border-radius: 50%; background: ${window.AVATAR_FALLBACK_COLOR}; color: white; display: flex; align-items: center; justify-content: center; font-weight: bold;">
      ${initial}
    </div>
  `;
}

// Function to format message time
function formatMessageTime(createdAt, focusMode = false) {
  // ROOT CAUSE FIX: Handle both createdAt and created_at, and check message object
  if (createdAt && typeof createdAt === 'object' && createdAt.created_at) {
    createdAt = createdAt.created_at;
  } else if (createdAt && typeof createdAt === 'object' && createdAt.createdAt) {
    createdAt = createdAt.createdAt;
  }
  
  if (!createdAt) {
    // CRITICAL FIX: For newly created messages without a date, show "Now"
    return 'Now';
  }
  
  const messageDate = new Date(createdAt);
  const now = new Date();
  
  // CRITICAL FIX: Check if date is valid
  if (isNaN(messageDate.getTime())) {
    return 'Now';
  }
  
  // Calculate time difference once
  const diffMs = now - messageDate;
  
  // CRITICAL FIX: If message is less than 5 seconds old, show "Now"
  if (diffMs >= 0 && diffMs < 5000) {
    return 'Now';
  }
  
  // CRITICAL FIX: Focus mode uses different format: "3:39 PM · Nov 5, 2025"
  if (focusMode) {
    const hours = messageDate.getHours();
    const minutes = messageDate.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    const displayMinutes = minutes.toString().padStart(2, '0');
    const timeStr = `${displayHours}:${displayMinutes} ${ampm}`;
    
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const month = months[messageDate.getMonth()];
    const day = messageDate.getDate();
    const year = messageDate.getFullYear();
    
    return `${timeStr} · ${month} ${day}, ${year}`;
  }
  
  // CRITICAL FIX: Default mode - use dynamic format:
  // Same year: Xs, Xm, Xh, Xd (relative time) - ALWAYS show relative time for same year
  // Different year: "Jun 5, 2025" format
  const sameYear = messageDate.getFullYear() === now.getFullYear();
  
  // Use already calculated diffMs
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);
  
  // Same year - ALWAYS show relative time (Xs, Xm, Xh, Xd) regardless of days
  if (sameYear) {
    if (diffSeconds < 60) {
      return `${diffSeconds}s`;
    } else if (diffMinutes < 60) {
      return `${diffMinutes}m`;
    } else if (diffHours < 24) {
      return `${diffHours}h`;
    } else {
      // For same year, always show "Xd" format regardless of how many days
      return `${diffDays}d`;
    }
  }
  
  // Different year - show "Jun 5, 2025" format
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const month = months[messageDate.getMonth()];
  const day = messageDate.getDate();
  const year = messageDate.getFullYear();
  return `${month} ${day}, ${year}`;
}
// REMOVED: Duplicate canUserEditMessage and getMessageActionMenu functions
// Using the complete versions defined earlier (lines 1666 and 1624)

// Function to add message action listeners
function addMessageActionListeners(messageDiv, message) {
  // CRITICAL FIX: In focus mode, always re-attach listeners (they may have been cloned)
  // Check if we're in focus mode - if so, allow re-attachment even if marked as attached
  const isInFocusMode = messageDiv.closest('.focus-messages-container') !== null ||
                        messageDiv.closest('.focus-mode-active') !== null ||
                        document.querySelector('.focus-messages-container') !== null;
  
  // CRITICAL FIX: Always attach listeners - buttons may have been cloned, removing listeners
  // Don't skip based on flag alone - buttons might have been cloned after flag was set
  // Only skip if we're NOT in focus mode AND buttons have onclick handlers (not just flag)
  const replyBtn = messageDiv.querySelector('.inline-reply-btn');
  const reactionBtn = messageDiv.querySelector('.reaction-btn');
  const bookmarkBtn = messageDiv.querySelector('.bookmark-btn');
  
  // Check if buttons have actual onclick handlers (cloning removes addEventListener listeners)
  const hasOnclickHandlers = replyBtn?.onclick || reactionBtn?.onclick || bookmarkBtn?.onclick;
  
  if (messageDiv.dataset.listenersAttached === 'true' && hasOnclickHandlers && !isInFocusMode) {
    console.log('🔧 MESSAGE_ACTIONS: Event listeners already attached to message:', message.id);
    // CRITICAL FIX: Still ensure buttons are clickable even if listeners are attached
    const allButtons = messageDiv.querySelectorAll('.message-actions-new button, .message-footer button');
    allButtons.forEach(btn => {
      btn.style.setProperty('pointer-events', 'auto', 'important');
      btn.style.setProperty('cursor', 'pointer', 'important');
      btn.style.setProperty('opacity', '1', 'important');
      btn.style.setProperty('visibility', 'visible', 'important');
      btn.style.setProperty('z-index', '20', 'important');
    });
    return;
  }
  
  // CRITICAL FIX: If in focus mode or buttons don't have handlers, always attach
  if (isInFocusMode || !hasOnclickHandlers) {
    if (messageDiv.dataset.listenersAttached === 'true') {
      console.log('🔧 MESSAGE_ACTIONS: Re-attaching listeners (focus mode or cloned buttons) for message:', message.id);
    }
  }
  
  console.log('🔧 MESSAGE_ACTIONS: Adding event listeners for message:', message.id);
  
  // Reaction button (already declared above, reuse the variable)
  // CRITICAL FIX: Re-query button in case it was cloned
  let actualReactionBtn = messageDiv.querySelector('.reaction-btn');
  if (actualReactionBtn) {
    // CRITICAL FIX: Clone button to remove old listeners if needed
    const existingHandler = actualReactionBtn.onclick;
    if (existingHandler || actualReactionBtn.dataset.hasListener === 'true') {
      const newReactionBtn = actualReactionBtn.cloneNode(true);
      actualReactionBtn.parentNode.replaceChild(newReactionBtn, actualReactionBtn);
      console.log(`🔧 MESSAGE_ACTIONS: Cloned reaction button to remove old listeners for ${message.id}`);
      actualReactionBtn = messageDiv.querySelector('.reaction-btn');
    }
    
    console.log('🔧 REACTIONS: Adding click handler to reaction button for message:', message.id);
    actualReactionBtn.addEventListener('click', async (e) => {
      e.preventDefault();
      e.stopPropagation();
      console.log('🔘 REACTION: Reaction button clicked for message:', message.id);
      console.log('🔘 REACTION: Event target:', e.target);
      console.log('🔘 REACTION: Button element:', actualReactionBtn);
      
      // COMP METHOD: Show reaction modal (exact COMP approach)
      // CRITICAL FIX: Check both window and local scope
      if (typeof window.showReactionModal === 'function') {
        console.log('🔘 REACTION: Calling window.showReactionModal...');
        window.showReactionModal(message.id);
      } else if (typeof showReactionModal === 'function') {
        console.log('🔘 REACTION: Calling local showReactionModal...');
        showReactionModal(message.id);
      } else {
        console.error('❌ REACTIONS: showReactionModal function not found');
        console.error('❌ REACTIONS: window.showReactionModal:', typeof window.showReactionModal);
        console.error('❌ REACTIONS: showReactionModal (local):', typeof showReactionModal);
      }
    });
    
    // CRITICAL FIX: Explicitly activate reaction button
    actualReactionBtn.style.setProperty('pointer-events', 'auto', 'important');
    actualReactionBtn.style.setProperty('cursor', 'pointer', 'important');
    actualReactionBtn.style.setProperty('opacity', '1', 'important');
    actualReactionBtn.style.setProperty('visibility', 'visible', 'important');
    actualReactionBtn.style.setProperty('z-index', '20', 'important');
    actualReactionBtn.style.setProperty('position', 'relative', 'important');
    actualReactionBtn.disabled = false;
    actualReactionBtn.dataset.hasListener = 'true';
    
    // CRITICAL FIX: Load existing reactions AFTER a delay to ensure message is in DOM
    // In focus mode, wait longer for container to be appended
    const isInFocusMode = messageDiv.closest('.focus-messages-container') !== null ||
                         document.querySelector('.focus-messages-container') !== null;
    const delay = isInFocusMode ? 700 : 100; // Longer delay in focus mode for container append
    setTimeout(async () => {
      // Re-query button to ensure it's still in DOM
      const currentBtn = messageDiv.querySelector('.reaction-btn');
      if (currentBtn) {
        await window.loadMessageReactions(message.id, currentBtn);
      } else {
        console.warn(`⚠️ MESSAGE_ACTIONS: Reaction button not found for ${message.id} after delay`);
      }
    }, delay);
    
    // COMP METHOD: Set up real-time reaction subscription for this message
    setupReactionSubscription(message.id);
    console.log('✅ REACTIONS: Reaction button activated for message:', message.id);
  } else {
    console.warn('⚠️ REACTIONS: Reaction button not found for message:', message.id);
  }
  // Reply button - COMP METHOD (already declared above, reuse the variable)
  if (replyBtn) {
    // CRITICAL FIX: Remove any existing listeners by cloning the button first
    const existingHandler = replyBtn.onclick;
    let actualReplyBtn = replyBtn;
    
    if (existingHandler || replyBtn.dataset.hasListener === 'true') {
      const newReplyBtn = replyBtn.cloneNode(true);
      replyBtn.parentNode.replaceChild(newReplyBtn, replyBtn);
      console.log(`🔧 MESSAGE_ACTIONS: Cloned reply button to remove old listeners for ${message.id}`);
      // Get the new button reference
      actualReplyBtn = messageDiv.querySelector('.inline-reply-btn');
    }
    
    // Attach event listener to the button (either original or cloned)
    actualReplyBtn.addEventListener('click', async (e) => {
      e.preventDefault();
      e.stopPropagation();
      console.log('💬 REPLY: COMP METHOD - Reply button clicked for message:', message.id);
      console.log('💬 REPLY: Event target:', e.target);
      console.log('💬 REPLY: Button element:', actualReplyBtn);
      
      // CRITICAL FIX: Get fresh message data from currentChatData
      let messageData = message;
      if (window.currentChatData) {
        const freshData = window.currentChatData.find(m => m.id === message.id);
        if (freshData) {
          messageData = { ...message, ...freshData };
        }
      }
      
      // FIX: Always show reply modal (never toggle thread replies on reply button click)
      console.log('💬 REPLY: Showing reply modal for message:', messageData.id);
      if (typeof showReplyModal === 'function') {
        console.log('💬 REPLY: Calling local showReplyModal...');
        showReplyModal(messageData);
      } else if (typeof window.showReplyModal === 'function') {
        console.log('💬 REPLY: Calling window.showReplyModal...');
        window.showReplyModal(messageData);
      } else {
        console.error('❌ REPLY: showReplyModal function not found');
        console.error('❌ REPLY: showReplyModal (local):', typeof showReplyModal);
        console.error('❌ REPLY: window.showReplyModal:', typeof window.showReplyModal);
      }
    });
    
    // CRITICAL FIX: Ensure reply button is active and clickable (enhanced with !important)
    actualReplyBtn.style.setProperty('pointer-events', 'auto', 'important');
    actualReplyBtn.style.setProperty('cursor', 'pointer', 'important');
    actualReplyBtn.style.setProperty('opacity', '1', 'important');
    actualReplyBtn.style.setProperty('visibility', 'visible', 'important');
    actualReplyBtn.style.setProperty('z-index', '20', 'important'); // CRITICAL FIX: Higher z-index for clicks
    actualReplyBtn.style.setProperty('position', 'relative', 'important');
    actualReplyBtn.disabled = false;
    actualReplyBtn.dataset.hasListener = 'true';
    // CRITICAL FIX: Add test click handler to debug
    actualReplyBtn.addEventListener('mousedown', (e) => {
      console.log('🔘 REPLY_DEBUG: Mouse down on reply button for message:', message.id);
    });
    console.log('✅ REPLY: Reply button activated for message:', message.id);
  } else {
    console.warn('⚠️ REPLY: Reply button not found for message:', message.id);
  }
  
  // Thread toggle button
  const threadToggleBtn = messageDiv.querySelector('.thread-toggle-btn');
  if (threadToggleBtn) {
    threadToggleBtn.addEventListener('click', (e) => {
      e.preventDefault();
      console.log('📂 THREAD: Thread toggle clicked for message:', message.id);
      // TODO: Implement thread toggle functionality
    });
  }
  
  // Dropdown menu toggle handler - replaces edit/delete buttons
  const actionDotsBtn = messageDiv.querySelector('.action-dots-btn');
  if (actionDotsBtn) {
    // CRITICAL FIX: Clone to remove old listeners
    const existingHandler = actionDotsBtn.onclick;
    let actualDotsBtn = actionDotsBtn;
    
    if (existingHandler || actionDotsBtn.dataset.hasListener === 'true') {
      const newDotsBtn = actionDotsBtn.cloneNode(true);
      actionDotsBtn.parentNode.replaceChild(newDotsBtn, actionDotsBtn);
      console.log(`🔧 MESSAGE_ACTIONS: Cloned dropdown button to remove old listeners for ${message.id}`);
      actualDotsBtn = messageDiv.querySelector('.action-dots-btn');
    }
    
    actualDotsBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      console.log('⋯ DROPDOWN: Dropdown button clicked for message:', message.id);
      
      const dropdown = messageDiv.querySelector('.action-dropdown');
      if (dropdown) {
        // Close all other dropdowns first
        document.querySelectorAll('.action-dropdown').forEach(d => {
          if (d !== dropdown) {
            d.style.setProperty('display', 'none', 'important');
            d.classList.remove('visible');
          }
        });
        
        // CRITICAL FIX: Check if dropdown is visible using class or computed style
        const isVisible = dropdown.classList.contains('visible') || 
                         getComputedStyle(dropdown).display === 'block';
        
        if (isVisible) {
          // Hide dropdown
          // CRITICAL FIX: Use setProperty with !important to ensure it hides
          dropdown.style.setProperty('display', 'none', 'important');
          dropdown.classList.remove('visible');
          console.log('⋯ DROPDOWN: Hiding dropdown for message:', message.id);
        } else {
          // Show dropdown
          // CRITICAL FIX: Move dropdown to body to escape stacking context
          if (dropdown.parentElement !== document.body) {
            // Store message ID on dropdown for reference
            dropdown.dataset.messageId = message.id;
            document.body.appendChild(dropdown);
          }
          
          // CRITICAL FIX: Add visible class FIRST, then set display
          dropdown.classList.add('visible');
          
          // CRITICAL FIX: Use setProperty with !important to override CSS
          dropdown.style.setProperty('display', 'block', 'important');
          dropdown.style.setProperty('visibility', 'visible', 'important');
          dropdown.style.setProperty('opacity', '1', 'important');
          dropdown.style.setProperty('z-index', '999999', 'important'); // CRITICAL: Use !important for z-index
          
          // Position dropdown relative to button
          const rect = actualDotsBtn.getBoundingClientRect();
          dropdown.style.position = 'fixed';
          dropdown.style.top = `${rect.bottom + 5}px`;
          dropdown.style.right = `${window.innerWidth - rect.right}px`;
          
          console.log('⋯ DROPDOWN: Showing dropdown for message:', message.id);
        }
      } else {
        console.error('❌ DROPDOWN: Dropdown element not found for message:', message.id);
      }
    });
    
    // Close dropdown when clicking outside
    if (!window.dropdownClickHandler) {
      window.dropdownClickHandler = (e) => {
        if (!e.target.closest('.action-dots-btn') && !e.target.closest('.action-dropdown')) {
          document.querySelectorAll('.action-dropdown').forEach(d => {
            d.style.setProperty('display', 'none', 'important');
            d.classList.remove('visible');
          });
        }
      };
      document.addEventListener('click', window.dropdownClickHandler);
    }
    actualDotsBtn.style.setProperty('pointer-events', 'auto', 'important');
    actualDotsBtn.style.setProperty('cursor', 'pointer', 'important');
    actualDotsBtn.style.setProperty('opacity', '1', 'important');
    actualDotsBtn.style.setProperty('visibility', 'visible', 'important');
    actualDotsBtn.dataset.hasListener = 'true';
    console.log('✅ DROPDOWN: Dropdown button activated for message:', message.id);
  }
  
  // Edit button handler (inside dropdown)
  // CRITICAL FIX: Re-query and clone if needed, ensure listener is attached
  let editBtn = messageDiv.querySelector('.action-item.edit-btn');
  if (editBtn) {
    // CRITICAL FIX: Clone button to remove old listeners if needed
    const existingHandler = editBtn.onclick;
    if (existingHandler || editBtn.dataset.hasListener === 'true') {
      const newEditBtn = editBtn.cloneNode(true);
      editBtn.parentNode.replaceChild(newEditBtn, editBtn);
      console.log(`🔧 MESSAGE_ACTIONS: Cloned edit button to remove old listeners for ${message.id}`);
      editBtn = messageDiv.querySelector('.action-item.edit-btn');
    }
    
    editBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      console.log('✏️ EDIT: Edit button clicked for message:', message.id);
      
      // Close dropdown
      const dropdown = messageDiv.querySelector('.action-dropdown');
      if (dropdown) {
        dropdown.style.setProperty('display', 'none', 'important');
        dropdown.classList.remove('visible');
      }
      
      // COMP RESTORATION: Implement edit functionality
      const messageContent = messageDiv.querySelector('.message-content');
      const chatInput = document.getElementById('chat-textarea');
      
      if (messageContent && chatInput) {
        chatInput.value = messageContent.textContent;
        chatInput.dataset.editingMessageId = message.id;
        chatInput.focus();
        chatInput.placeholder = 'Edit your message...';
        console.log('✏️ EDIT: Entered edit mode for message:', message.id);
      }
    });
    
    // CRITICAL FIX: Explicitly activate edit button
    editBtn.style.setProperty('pointer-events', 'auto', 'important');
    editBtn.style.setProperty('cursor', 'pointer', 'important');
    editBtn.style.setProperty('opacity', '1', 'important');
    editBtn.style.setProperty('visibility', 'visible', 'important');
    editBtn.style.setProperty('z-index', '20', 'important');
    editBtn.style.setProperty('position', 'relative', 'important');
    editBtn.disabled = false;
    editBtn.dataset.hasListener = 'true';
    console.log('✅ EDIT: Edit button activated for message:', message.id);
  }
  
  // Delete button handler (inside dropdown)
  // CRITICAL FIX: Re-query and clone if needed, ensure listener is attached
  let deleteBtn = messageDiv.querySelector('.action-item.delete-btn');
  if (deleteBtn) {
    // CRITICAL FIX: Clone button to remove old listeners if needed
    const existingHandler = deleteBtn.onclick;
    if (existingHandler || deleteBtn.dataset.hasListener === 'true') {
      const newDeleteBtn = deleteBtn.cloneNode(true);
      deleteBtn.parentNode.replaceChild(newDeleteBtn, deleteBtn);
      console.log(`🔧 MESSAGE_ACTIONS: Cloned delete button to remove old listeners for ${message.id}`);
      deleteBtn = messageDiv.querySelector('.action-item.delete-btn');
    }
    
    deleteBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      console.log('🗑️ DELETE: Delete button clicked for message:', message.id);
      
      // Close dropdown
      const dropdown = messageDiv.querySelector('.action-dropdown');
      if (dropdown) {
        dropdown.style.setProperty('display', 'none', 'important');
        dropdown.classList.remove('visible');
      }
      
      // COMP METHOD: Use the proper handleDeleteMessage function
      if (typeof handleDeleteMessage === 'function') {
        handleDeleteMessage(message);
      } else if (typeof window.handleDeleteMessage === 'function') {
        window.handleDeleteMessage(message);
      } else {
        console.error('❌ DELETE: handleDeleteMessage function not found');
      }
    });
    
    // CRITICAL FIX: Explicitly activate delete button
    deleteBtn.style.setProperty('pointer-events', 'auto', 'important');
    deleteBtn.style.setProperty('cursor', 'pointer', 'important');
    deleteBtn.style.setProperty('opacity', '1', 'important');
    deleteBtn.style.setProperty('visibility', 'visible', 'important');
    deleteBtn.style.setProperty('z-index', '20', 'important');
    deleteBtn.style.setProperty('position', 'relative', 'important');
    deleteBtn.disabled = false;
    deleteBtn.dataset.hasListener = 'true';
    console.log('✅ DELETE: Delete button activated for message:', message.id);
  }
  
  // Flag button handler (inside dropdown)
  // CRITICAL FIX: Always attach listener (even if disabled) so diagnostic detects it
  let flagBtn = messageDiv.querySelector('.action-item.flag-btn');
  if (flagBtn) {
    // CRITICAL FIX: Clone button to remove old listeners if needed
    const existingHandler = flagBtn.onclick;
    if (existingHandler || flagBtn.dataset.hasListener === 'true') {
      const newFlagBtn = flagBtn.cloneNode(true);
      flagBtn.parentNode.replaceChild(newFlagBtn, flagBtn);
      console.log(`🔧 MESSAGE_ACTIONS: Cloned flag button to remove old listeners for ${message.id}`);
      flagBtn = messageDiv.querySelector('.action-item.flag-btn');
    }
    
    // CRITICAL FIX: Always attach listener, but check disabled state inside handler
    flagBtn.addEventListener('click', (e) => {
      // Check if button is disabled and return early if so
      if (flagBtn.disabled) {
        console.log('⚠️ FLAG: Flag button is disabled, ignoring click for message:', message.id);
        return;
      }
      
      e.preventDefault();
      e.stopPropagation();
      console.log('🚩 FLAG: Flag button clicked for message:', message.id);
      
      // Close dropdown
      const dropdown = messageDiv.querySelector('.action-dropdown');
      if (dropdown) {
        dropdown.style.setProperty('display', 'none', 'important');
        dropdown.classList.remove('visible');
      }
      
      // TODO: Implement flag functionality
      console.log('🚩 FLAG: Flag functionality not yet implemented');
    });
    
    // CRITICAL FIX: Explicitly activate flag button (but respect disabled state for pointer-events)
    if (!flagBtn.disabled) {
      flagBtn.style.setProperty('pointer-events', 'auto', 'important');
      flagBtn.style.setProperty('cursor', 'pointer', 'important');
    } else {
      flagBtn.style.setProperty('pointer-events', 'none', 'important');
      flagBtn.style.setProperty('cursor', 'not-allowed', 'important');
    }
    flagBtn.style.setProperty('opacity', flagBtn.disabled ? '0.5' : '1', 'important');
    flagBtn.style.setProperty('visibility', 'visible', 'important');
    flagBtn.style.setProperty('z-index', '20', 'important');
    flagBtn.style.setProperty('position', 'relative', 'important');
    flagBtn.dataset.hasListener = 'true';
    console.log(`✅ FLAG: Flag button activated for message: ${message.id} (disabled: ${flagBtn.disabled})`);
  }
  
  // Share button - CRITICAL FIX: Add missing event listener and update active state
  let shareBtn = messageDiv.querySelector('.share-btn');
  if (shareBtn) {
    // CRITICAL FIX: Clone button to remove old listeners if needed
    const existingHandler = shareBtn.onclick;
    if (existingHandler || shareBtn.dataset.hasListener === 'true') {
      const newShareBtn = shareBtn.cloneNode(true);
      shareBtn.parentNode.replaceChild(newShareBtn, shareBtn);
      console.log(`🔧 MESSAGE_ACTIONS: Cloned share button to remove old listeners for ${message.id}`);
      shareBtn = messageDiv.querySelector('.share-btn');
    }
    
    shareBtn.addEventListener('click', async (e) => {
      e.preventDefault();
      e.stopPropagation();
      console.log('🔗 SHARE: Share button clicked for message:', message.id);
      
      // COMP METHOD: Use handleCopyLink to share message
      let shareSuccess = false;
      if (typeof handleCopyLink === 'function') {
        await handleCopyLink(message);
        shareSuccess = true;
      } else if (typeof window.handleCopyLink === 'function') {
        await window.handleCopyLink(message);
        shareSuccess = true;
      } else {
        console.error('❌ SHARE: handleCopyLink function not found');
        // Fallback: try handleShareMessage
        if (typeof handleShareMessage === 'function') {
          await handleShareMessage(message, 'link');
          shareSuccess = true;
        } else if (typeof window.handleShareMessage === 'function') {
          await window.handleShareMessage(message, 'link');
          shareSuccess = true;
        } else {
          console.error('❌ SHARE: handleShareMessage function not found');
        }
      }
      
      // CRITICAL: Set active state after successful share
      if (shareSuccess) {
        shareBtn.classList.add('active');
        shareBtn.dataset.hasShared = 'true';
        shareBtn.querySelector('svg')?.setAttribute('style', 'fill: var(--icon-active-color, #1da1f2);');
        console.log('✅ SHARE: Button set to active state for message:', message.id);
      }
    });
    
    // CRITICAL FIX: Ensure share button is active and clickable
    shareBtn.style.setProperty('pointer-events', 'auto', 'important');
    shareBtn.style.setProperty('cursor', 'pointer', 'important');
    shareBtn.style.setProperty('opacity', '1', 'important');
    shareBtn.style.setProperty('visibility', 'visible', 'important');
    shareBtn.style.setProperty('display', 'flex', 'important');
    shareBtn.style.setProperty('z-index', '20', 'important'); // CRITICAL FIX: Higher z-index for clicks
    shareBtn.style.setProperty('position', 'relative', 'important');
    shareBtn.disabled = false;
    shareBtn.dataset.hasListener = 'true';
    console.log('✅ SHARE: Share button activated for message:', message.id);
  } else {
    console.warn('⚠️ SHARE: Share button not found for message:', message.id);
  }
  
  // CRITICAL FIX: Reaction button activation is now handled above after cloning
  // CRITICAL FIX: Bookmark button handler - must be in addMessageActionListeners so it's attached in focus mode
  // USER FIX: Bookmark handler was missing from addMessageActionListeners, causing bookmarks to not work in focus mode
  // bookmarkBtn already declared above, reuse the variable
  if (bookmarkBtn) {
    // CRITICAL FIX: Clone button to remove old listeners if needed
    const existingHandler = bookmarkBtn.onclick;
    let actualBookmarkBtn = bookmarkBtn;
    
    if (existingHandler || bookmarkBtn.dataset.hasListener === 'true') {
      const newBookmarkBtn = bookmarkBtn.cloneNode(true);
      bookmarkBtn.parentNode.replaceChild(newBookmarkBtn, bookmarkBtn);
      console.log(`🔧 MESSAGE_ACTIONS: Cloned bookmark button to remove old listeners for ${message.id}`);
      actualBookmarkBtn = messageDiv.querySelector('.bookmark-btn');
    }
    
    // Always attach listener (even if already attached, cloning ensures fresh listener)
    actualBookmarkBtn.addEventListener('click', async (e) => {
      e.preventDefault();
      e.stopPropagation();
      console.log('🔘 BOOKMARK: Bookmark button clicked for message:', message.id);
      console.log('🔘 BOOKMARK: Event target:', e.target);
      console.log('🔘 BOOKMARK: Button element:', actualBookmarkBtn);
      
      // CRITICAL FIX: Verify handleBookmarkToggle exists and call it
      console.log('🔘 BOOKMARK: Button clicked, checking for handleBookmarkToggle...');
      console.log('🔘 BOOKMARK: window.handleBookmarkToggle type:', typeof window.handleBookmarkToggle);
      
      if (typeof window.handleBookmarkToggle === 'function') {
        console.log('🔘 BOOKMARK: Calling window.handleBookmarkToggle...');
        try {
          await window.handleBookmarkToggle(message.id, actualBookmarkBtn);
          console.log('✅ BOOKMARK: handleBookmarkToggle completed');
        } catch (error) {
          console.error('❌ BOOKMARK: Error in handleBookmarkToggle:', error);
        }
      } else {
        console.error('❌ BOOKMARK: handleBookmarkToggle function not found');
        console.error('❌ BOOKMARK: Available functions:', Object.keys(window).filter(k => k.includes('bookmark')));
      }
    });
    
    // CRITICAL FIX: Explicitly activate bookmark button
    actualBookmarkBtn.style.setProperty('pointer-events', 'auto', 'important');
    actualBookmarkBtn.style.setProperty('cursor', 'pointer', 'important');
    actualBookmarkBtn.style.setProperty('opacity', '1', 'important');
    actualBookmarkBtn.style.setProperty('visibility', 'visible', 'important');
    actualBookmarkBtn.style.setProperty('z-index', '20', 'important');
    actualBookmarkBtn.style.setProperty('position', 'relative', 'important');
    actualBookmarkBtn.disabled = false;
    actualBookmarkBtn.dataset.hasListener = 'true';
    
    // CRITICAL FIX: Load bookmark status AFTER a delay to ensure message is in DOM
    const isInFocusMode = messageDiv.closest('.focus-messages-container') !== null ||
                         document.querySelector('.focus-messages-container') !== null;
    const delay = isInFocusMode ? 750 : 150;
    setTimeout(async () => {
      const currentBtn = messageDiv.querySelector('.bookmark-btn');
      if (currentBtn && typeof window.loadMessageBookmarks === 'function') {
        await window.loadMessageBookmarks(message.id, currentBtn);
      } else {
        console.warn(`⚠️ MESSAGE_ACTIONS: Bookmark button not found or loadMessageBookmarks not available for ${message.id}`);
      }
    }, delay);
    
    console.log('✅ BOOKMARK: Bookmark button activated for message:', message.id);
  } else {
    console.warn('⚠️ BOOKMARK: Bookmark button not found for message:', message.id);
  }
  // CRITICAL FIX: Ensure repost button is explicitly activated
  // SD3 FIX: Always attach listener (button may have been cloned, removing old listeners)
  const repostBtn = messageDiv.querySelector('.repost-btn');
  if (repostBtn) {
    // CRITICAL FIX: Clone button to remove old listeners if needed
    const existingHandler = repostBtn.onclick;
    let actualRepostBtn = repostBtn;
    
    if (existingHandler || repostBtn.dataset.hasListener === 'true') {
      const newRepostBtn = repostBtn.cloneNode(true);
      repostBtn.parentNode.replaceChild(newRepostBtn, repostBtn);
      console.log(`🔧 MESSAGE_ACTIONS: Cloned repost button to remove old listeners for ${message.id}`);
      actualRepostBtn = messageDiv.querySelector('.repost-btn');
    }
    
    // Always attach listener (even if already attached, cloning ensures fresh listener)
    actualRepostBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      console.log('🔄 REPOST: Repost button clicked for message:', message.id);
      if (typeof handleRepost === 'function') {
        handleRepost(message);
      } else if (typeof window.handleRepost === 'function') {
        window.handleRepost(message);
      } else {
        console.error('❌ REPOST: handleRepost function not found');
      }
    });
    
    actualRepostBtn.style.setProperty('pointer-events', 'auto', 'important');
    actualRepostBtn.style.setProperty('cursor', 'pointer', 'important');
    actualRepostBtn.style.setProperty('opacity', '1', 'important');
    actualRepostBtn.style.setProperty('visibility', 'visible', 'important');
    actualRepostBtn.style.setProperty('z-index', '20', 'important'); // CRITICAL FIX: Higher z-index for clicks
    actualRepostBtn.style.setProperty('position', 'relative', 'important');
    actualRepostBtn.disabled = false;
    actualRepostBtn.dataset.hasListener = 'true';
    console.log('✅ REPOST: Repost button activated for message:', message.id);
  }
  
  // CRITICAL FIX: Ensure parent containers allow pointer events
  const contentWrapper = messageDiv.querySelector('.message-content-wrapper');
  if (contentWrapper) {
    contentWrapper.style.setProperty('pointer-events', 'auto', 'important');
  }
  const header = messageDiv.querySelector('.message-header-new');
  if (header) {
    header.style.setProperty('pointer-events', 'auto', 'important');
  }
  const footer = messageDiv.querySelector('.message-footer');
  if (footer) {
    footer.style.setProperty('pointer-events', 'auto', 'important');
  }
  
  // Add hover effects for message actions
  messageDiv.addEventListener('mouseenter', () => {
    const messageActions = messageDiv.querySelector('.message-actions');
    if (messageActions) {
      messageActions.style.opacity = '1';
    }
  });
  
  messageDiv.addEventListener('mouseleave', () => {
    const messageActions = messageDiv.querySelector('.message-actions');
    if (messageActions) {
      messageActions.style.opacity = '0';
    }
  });
  
  // CRITICAL FIX: Final pass - ensure ALL buttons are clickable (in case any were missed)
  // Include dropdown items (edit, delete, flag) in the final pass
  const allActionButtons = messageDiv.querySelectorAll('.message-actions-new button, .message-footer button, .action-icon, .inline-reply-btn, .reaction-btn, .bookmark-btn, .share-btn, .repost-btn, .action-dots-btn, .action-item.edit-btn, .action-item.delete-btn, .action-item.flag-btn');
  allActionButtons.forEach(btn => {
    btn.style.setProperty('pointer-events', 'auto', 'important');
    btn.style.setProperty('cursor', 'pointer', 'important');
    btn.style.setProperty('opacity', '1', 'important');
    btn.style.setProperty('visibility', 'visible', 'important');
    btn.style.setProperty('z-index', '20', 'important');
    btn.style.setProperty('position', 'relative', 'important');
    // Don't enable disabled buttons (like flag button)
    if (!btn.hasAttribute('disabled')) {
      btn.disabled = false;
    }
  });
  
  // CRITICAL FIX: Mark listeners as attached to prevent duplicates
  messageDiv.dataset.listenersAttached = 'true';
  
  console.log('✅ MESSAGE_ACTIONS: Event listeners added successfully');
  console.log(`✅ MESSAGE_ACTIONS: Activated ${allActionButtons.length} action buttons for message:`, message.id);
}
// Function to handle message focus - displays in same container instead of modal
async function handleMessageFocus(message) {
  console.log('🎯 FOCUS: Focusing message:', message.id);
  
  if (!message || !message.id) {
    console.error('❌ FOCUS: Invalid message provided');
    return;
  }
  
  // Find the chat messages container
  const chatMessages = document.querySelector('#discuss-tab .chat-messages');
  if (!chatMessages) {
    console.error('❌ FOCUS: Chat messages container not found');
    return;
  }
  
  // CRITICAL FIX: Set focus mode flag BEFORE clearing to prevent loadChatHistory from interfering
  chatMessages.dataset.focusMode = 'true';
  chatMessages.dataset.focusMessageId = message.id;
  
  // CRITICAL FIX: Hide default input field at top in focus mode
  const chatInputArea = document.querySelector('.chat-input-area');
  if (chatInputArea) {
    chatInputArea.style.display = 'none';
    console.log('✅ FOCUS: Hidden default input field at top');
  }
  
  // OPTIMIZATION: Don't store full HTML in data attribute (bloated and inefficient)
  // Instead, rely on window.loadChatHistory() to restore default view when exiting focus mode
  // This is more efficient and cleaner - messages are already in window.currentChatData
  
  // Clear container and add focus header
  chatMessages.innerHTML = '';
  
  // Back button row (at top of focus messages) - CRITICAL FIX: Use CSS variables for dark mode
  const backRow = document.createElement('div');
  backRow.className = 'focus-back-row';
  // Remove inline styles - use CSS classes for proper dark mode support
  backRow.style.cssText = 'display: flex; align-items: center; padding: 12px 16px; border-bottom: 1px solid var(--border-color, #eee); background: var(--background-primary, white); position: sticky; top: 0; z-index: 100;';
  
  const backButton = document.createElement('button');
  backButton.innerHTML = '← Back';
  backButton.className = 'focus-back-btn';
  backButton.style.cssText = 'background: none; border: none; color: #007bff; cursor: pointer; font-size: 14px; font-weight: 600; padding: 4px 8px;';
  backButton.addEventListener('click', () => {
    console.log('🔙 BACK_BUTTON: Back button clicked, resetting to default messages view');
    
    // CRITICAL FIX: Clear focus mode flags FIRST to prevent interference
    delete chatMessages.dataset.focusMode;
    delete chatMessages.dataset.focusMessageId;
    chatMessages.classList.remove('focus-mode-active');
    
    // OPTIMIZATION: Removed data-original-messages storage (was bloated with full HTML)
    // No longer needed - we use loadChatHistory() to restore default view
    
    // Remove focus container if it exists
    const focusContainer = chatMessages.querySelector('.focus-messages-container');
    if (focusContainer) {
      focusContainer.remove();
      console.log('🔙 BACK_BUTTON: Removed focus container');
    }
    
    // Remove back row
    const backRow = chatMessages.querySelector('.focus-back-row');
    if (backRow) {
      backRow.remove();
      console.log('🔙 BACK_BUTTON: Removed back row');
    }
    
    // Remove focus input field
    const focusInputField = chatMessages.querySelector('.focus-message-input-container');
    if (focusInputField) {
      focusInputField.remove();
      console.log('🔙 BACK_BUTTON: Removed focus input field');
    }
    
    // CRITICAL FIX: Show default input field again when exiting focus mode
    const chatInputArea = document.querySelector('.chat-input-area');
    if (chatInputArea) {
      chatInputArea.style.display = '';
      console.log('✅ BACK_BUTTON: Restored default input field at top');
    }
    
    // CRITICAL FIX: Always reload chat history to ensure proper default view
    // This ensures all messages are loaded correctly and event listeners are attached
    // OPTIMIZATION: This is more efficient than storing full HTML in data attribute
    if (window.loadChatHistory) {
      console.log('🔙 BACK_BUTTON: Reloading chat history to restore default view');
      chatMessages.innerHTML = ''; // Clear container first
      // CRITICAL FIX: Ensure focus mode flags are cleared before reload
      delete chatMessages.dataset.focusMode;
      delete chatMessages.dataset.focusMessageId;
      chatMessages.classList.remove('focus-mode-active');
      window.loadChatHistory();
    } else {
      console.error('❌ BACK_BUTTON: loadChatHistory not available - cannot restore default view');
    }
  });
  backRow.appendChild(backButton);
  chatMessages.appendChild(backRow);
  
  // UNIFIED FOCUS MODE: Use main chat-messages container, not nested container
  // Mark main container as focus mode for visibility detection
  chatMessages.dataset.focusMode = 'true';
  chatMessages.dataset.focusMessageId = message.id; // CRITICAL: Set focusMessageId on main container
  chatMessages.classList.add('focus-mode-active');
  
  // Add the focused message and its children using the same addMessageToChat function
  // UNIFIED: Replies go directly to main chat-messages container (standalone, not nested)
  const addMessageToFocus = async (msg, isReply = false) => {
    // Convert message to format expected by addMessageToChat
    // For replies in focus mode, ensure parentId is set correctly to the parent message
    const parentIdForReply = isReply ? (msg.parentId || msg.parent_id || message.id) : undefined;
    const messageForAdd = {
      ...msg,
      isReply: isReply || msg.isReply || !!msg.parentId,
      parentId: parentIdForReply, // Only set parentId for replies
      author: msg.author || { name: 'Unknown' },
      user_id: msg.user_id || msg.author?.id || msg.author?.user_id,
      createdAt: msg.createdAt || msg.created_at,
      created_at: msg.created_at || msg.createdAt,
      body: msg.body || msg.content || '',
      content: msg.body || msg.content || '',
      communityId: msg.communityId || message.communityId || (window.activeCommunities && window.activeCommunities[0]) || 'comm-001',
      conversationId: msg.conversationId || message.conversationId || `conv-${msg.communityId || 'comm-001'}-${window.currentUrlData?.pageId || 'default'}`,
      hasReplies: msg.hasReplies || false,
      replyCount: msg.replyCount || 0
      // UNIFIED: No _focusModeTarget - replies go directly to main chat-messages container
    };
    
    // UNIFIED: Use the same addMessageToChat function - replies go to main container
    if (window.addMessageToChat && typeof window.addMessageToChat === 'function') {
      try {
        // Call addMessageToChat - it will append to main chat-messages container
        await window.addMessageToChat(messageForAdd);
        console.log('✅ FOCUS: Added message to main container using addMessageToChat (unified display)');
        
        // UNIFIED: Replies use same structure as default messages - no special handling needed
        if (isReply) {
          await new Promise(resolve => requestAnimationFrame(resolve));
          
          // Find reply in main chat-messages container (not nested)
          const addedReply = chatMessages.querySelector(`[data-message-id="${msg.id}"]`);
          if (addedReply) {
            // UNIFIED: Reply already has correct classes and structure from addMessageToChat
            // No inline styles needed - CSS handles everything
            console.log(`✅ FOCUS: Reply ${msg.id} added to main container with unified structure`);
          } else {
            console.warn(`⚠️ FOCUS: Reply ${msg.id} not found in DOM after addMessageToChat`);
          }
        }
      } catch (err) {
        console.error('❌ FOCUS: Error adding message to main container using addMessageToChat:', err);
        // CRITICAL FIX: Don't create malformed fallback - log error and skip
        // Malformed divs cause display issues - better to skip than show broken HTML
        console.error('❌ FOCUS: Skipping malformed reply creation - addMessageToChat failed');
      }
    } else {
      // CRITICAL FIX: Don't create malformed fallback - log error and skip
      console.error('❌ FOCUS: addMessageToChat not available - cannot create reply without proper structure');
    }
    
    // CRITICAL FIX: Always load replies for the main focused message
    // For nested replies, load if they have hasReplies flag or replyCount > 0
    // CRITICAL: Use focusMessageId from main container to check if this is the main message
    const focusMessageId = chatMessages?.dataset.focusMessageId || message?.id;
    const isMainMessage = msg.id === focusMessageId || msg.id === message?.id;
    const shouldLoadReplies = isMainMessage || (msg.hasReplies || msg.replyCount > 0);
    
    console.log(`🔍 FOCUS: Reply loading check for ${msg.id}:`, {
      isMainMessage,
      focusMessageId,
      messageId: message?.id,
      hasReplies: msg.hasReplies,
      replyCount: msg.replyCount,
      shouldLoadReplies
    });
    
    if (shouldLoadReplies) {
      try {
        // Load replies from Supabase
        const currentPageId = window.currentUrlData?.pageId || window.currentPage?.pageId;
        const communityId = msg.communityId || message.communityId || (window.activeCommunities && window.activeCommunities[0]) || 'comm-001';
        console.log(`🔍 FOCUS: Loading replies for message ${msg.id} (isMain: ${msg.id === message.id})`);
        
        if (currentPageId && window.supabase) {
          // MODULAR ARCHITECTURE: Use ReplyLoader utility for reply loading
          if (window.ReplyLoader && typeof window.ReplyLoader.loadAllReplies === 'function') {
            const allRepliesData = await window.ReplyLoader.loadAllReplies(msg.id, currentPageId, communityId);
            
            if (allRepliesData && allRepliesData.length > 0) {
              console.log(`✅ FOCUS: Found ${allRepliesData.length} replies for message ${msg.id}`);
              
              for (const replyData of allRepliesData) {
                // MODULAR ARCHITECTURE: Use ReplyLoader to format reply
                const reply = await window.ReplyLoader.formatReply(replyData, msg, currentPageId, communityId);
                
                // CRITICAL FIX: Check if reply already exists before adding
                const existingReply = chatMessages.querySelector(`[data-message-id="${reply.id}"]`);
                if (!existingReply) {
                  await addMessageToFocus(reply, true);
                } else {
                  // CRITICAL FIX: If reply exists but has zero dimensions, make it visible
                  const width = existingReply.offsetWidth;
                  const height = existingReply.offsetHeight;
                  if (width === 0 || height === 0) {
                    console.log(`⚠️ FOCUS: Reply ${reply.id} exists but has zero dimensions (${width}px × ${height}px), making visible`);
                    if (window.MessageVisibilityManager && typeof window.MessageVisibilityManager.showReply === 'function') {
                      await window.MessageVisibilityManager.showReply(existingReply, reply.id);
                    }
                  } else {
                    console.log(`⚠️ FOCUS: Reply ${reply.id} already exists with dimensions (${width}px × ${height}px), skipping duplicate`);
                  }
                }
              }
            } else {
              console.log(`ℹ️ FOCUS: No replies found for message ${msg.id}`);
            }
          } else {
            console.warn(`⚠️ FOCUS: ReplyLoader utility not available, falling back to inline logic`);
            // Fallback to inline logic if utility not loaded
            const { data: directReplies, error } = await window.supabase
              .from('messages')
              .select('*')
              .eq('parent_id', msg.id)
              .eq('page_id', currentPageId)
              .eq('community_id', communityId)
              .order('created_at', { ascending: true });
            
            if (error) {
              console.error(`❌ FOCUS: Error loading replies for ${msg.id}:`, error);
            } else if (directReplies && directReplies.length > 0) {
              console.log(`✅ FOCUS: Found ${directReplies.length} direct replies (fallback mode)`);
              for (const replyData of directReplies) {
                const reply = await window.ReplyLoader?.formatReply(replyData, msg, currentPageId, communityId) || {
                  id: replyData.id,
                  body: replyData.body || replyData.content,
                  content: replyData.body || replyData.content,
                  author: { id: replyData.user_id, user_id: replyData.user_id, name: 'Unknown' },
                  user_id: replyData.user_id,
                  createdAt: replyData.created_at,
                  created_at: replyData.created_at,
                  parentId: replyData.parent_id || msg.id,
                  conversationId: msg.conversationId || message.conversationId,
                  isReply: true,
                  hasReplies: false,
                  replyCount: 0,
                  communityId: communityId
                };
                const existingReply = chatMessages.querySelector(`[data-message-id="${reply.id}"]`);
                if (!existingReply) {
                  await addMessageToFocus(reply, true);
                }
              }
            }
          }
        } else {
          console.warn(`⚠️ FOCUS: Cannot load replies - missing pageId or supabase client`);
        }
      } catch (err) {
        console.error('❌ FOCUS: Error loading replies:', err);
      }
    } else {
      console.log(`ℹ️ FOCUS: Skipping reply load for ${msg.id} (not main message and no hasReplies flag)`);
    }
  };
  
  // UNIFIED: Clear existing messages in main container before adding focus mode messages
  // This ensures clean state for focus mode
  const existingMessages = chatMessages.querySelectorAll('.message:not(.focus-back-row)');
  if (existingMessages.length > 0) {
    console.log(`🔧 FOCUS: Clearing ${existingMessages.length} existing messages from main container`);
    existingMessages.forEach(msg => msg.remove());
  }
  
  // Start adding the main message (parent/top level)
  // The clicked message should be the top level, so it's not a reply
  // CRITICAL FIX: Always load replies for main message in focus mode
  const mainMessage = {
    ...message,
    isReply: false,
    parentId: undefined, // Clear parentId for top-level display
    // CRITICAL: Always set hasReplies to true for main message to ensure replies are loaded
    hasReplies: true, // Always load replies for main message in focus mode
    replyCount: message.replyCount || 0 // Preserve reply count if available
    // UNIFIED: No _focusModeTarget - messages go directly to main chat-messages container
  };
  console.log(`🎯 FOCUS: Starting focus mode for message ${mainMessage.id}, hasReplies: ${mainMessage.hasReplies}, replyCount: ${mainMessage.replyCount}`);
  
  // CRITICAL FIX: Add main message WITHOUT loading replies first
  // This ensures input field is created before replies are loaded
  // CRITICAL: Ensure main message is NOT marked as reply for date placement
  const mainMessageWithoutReplies = {
    ...mainMessage,
    hasReplies: false, // Temporarily disable to prevent reply loading
    replyCount: 0, // Temporarily disable to prevent reply loading
    isReply: false, // CRITICAL: Ensure main message is not treated as reply
    parentId: undefined // CRITICAL: Clear parentId to ensure it's treated as parent
  };
  await addMessageToFocus(mainMessageWithoutReplies, false);
  console.log(`✅ FOCUS: Main message added to main container (without loading replies yet)`);
  
  // CRITICAL FIX: Create and insert input field BEFORE loading replies
  // This ensures replies will be inserted AFTER the input field
  // UX FIX: Add message input field between parent and children (like X/Twitter)
  const messageInputContainer = document.createElement('div');
  messageInputContainer.className = 'focus-message-input-container';
  // CRITICAL FIX: Don't set border-bottom in inline style - let CSS handle it with proper dark mode support
  messageInputContainer.style.cssText = 'display: flex; align-items: flex-start; padding: 12px 16px; gap: 12px;';
  
  // CRITICAL FIX: Use AvatarUtils for reply input avatar with aura
  const avatarContainer = document.createElement('div');
  avatarContainer.style.cssText = 'flex-shrink: 0;';

  // CRITICAL FIX: Create focus reply avatar that listens for aura color updates
  const createFocusReplyAvatar = async () => {
    if (window.AvatarUtils && typeof window.AvatarUtils.createUnifiedAvatar === 'function') {
      const currentUser = window.currentUser || {};
      // CRITICAL FIX: Use same data source as ProfileManager - prefer profileData if available, then currentUser
      const userDataSource = window.profileManager?.profileData || currentUser;

      // CRITICAL FIX: Get aura color with same fallback logic as ProfileManager
      // Priority: PreRenderInitializer (database) > profileData > currentUser > API fetch
      let auraColorValue = null;

      // CRITICAL FIX: Check pre-render data as PRIMARY source (database value)
      if (window.preRenderInitializer?.getPreRenderData) {
        const preRenderData = window.preRenderInitializer.getPreRenderData();
        if (preRenderData.auraColor) {
          auraColorValue = preRenderData.auraColor;
          console.log('🎨 FOCUS: Using aura color from pre-render data (DATABASE):', auraColorValue);
        }
      }

      // Fallback to profileData or currentUser if pre-render data not available
      if (!auraColorValue) {
        auraColorValue = userDataSource.auraColor || userDataSource.aura_color;
        if (auraColorValue) {
          console.log('🎨 FOCUS: Using aura color from userDataSource:', auraColorValue);
        }
      }

      // CRITICAL FIX: Resolve Promise if auraColor is a Promise
      if (auraColorValue && typeof auraColorValue === 'object' && typeof auraColorValue.then === 'function') {
        console.log('🔧 FOCUS: auraColor is a Promise, awaiting resolution...');
        try {
          auraColorValue = await auraColorValue;
          console.log(`✅ FOCUS: Resolved auraColor Promise: ${auraColorValue}`);
        } catch (e) {
          console.warn(`⚠️ FOCUS: Error resolving auraColor Promise:`, e);
          auraColorValue = null; // Treat as missing, will fetch from API
        }
      }

      // CRITICAL FIX: Validate auraColor - treat #ffffff as missing
      if (auraColorValue === '#ffffff' || auraColorValue === 'white' || auraColorValue === '#fff') {
        console.log('⚠️ FOCUS: auraColor is fallback white, treating as missing (will fetch from API)');
        auraColorValue = null;
      }

      // CRITICAL FIX: Fetch from API if still missing (same as ProfileManager)
      if (!auraColorValue && userDataSource.id && window.api) {
        console.log('🔍 FOCUS: Fetching auraColor from API for reply avatar...');
        try {
          const userResponse = await window.api.request(`/v1/users/${userDataSource.id}`, {
            method: 'GET'
          });

          if (userResponse && (userResponse.auraColor || userResponse.aura_color)) {
            const apiAuraColor = userResponse.auraColor || userResponse.aura_color;
            
            // Validate API response - treat #ffffff as missing
            if (apiAuraColor !== '#ffffff' && apiAuraColor !== 'white' && apiAuraColor !== '#fff') {
              auraColorValue = apiAuraColor;
              
              // Update window.currentUser for consistency
              if (window.currentUser) {
                window.currentUser.auraColor = apiAuraColor;
                window.currentUser.aura_color = apiAuraColor;
              }
              
              // Update profileData if available
              if (window.profileManager?.profileData) {
                window.profileManager.profileData.auraColor = apiAuraColor;
                window.profileManager.profileData.aura_color = apiAuraColor;
              }
              
              console.log('✅ FOCUS: Fetched auraColor from API for reply avatar:', apiAuraColor);
            } else {
              console.log('⚠️ FOCUS: API returned fallback white, treating as missing');
            }
          }
        } catch (error) {
          console.warn('⚠️ FOCUS: Could not fetch auraColor from API for reply avatar:', error);
        }
      }

      // Final fallback to white if still missing
      if (!auraColorValue) {
        auraColorValue = window.AVATAR_FALLBACK_COLOR || '#ffffff';
        console.log('⚠️ FOCUS: Using fallback color for reply avatar:', auraColorValue);
      }

      const userForAvatar = {
        id: userDataSource.id || userDataSource.user_id,
        name: userDataSource.name || userDataSource.email || 'User',
        avatarUrl: userDataSource.avatarUrl || userDataSource.avatar,
        auraColor: auraColorValue,
        email: userDataSource.email || userDataSource.name // Email might be in name field
      };

      console.log('🎨 FOCUS: Creating reply avatar with data:', {
        userId: userForAvatar.id,
        auraColor: userForAvatar.auraColor,
        dataSource: window.profileManager?.profileData ? 'profileData' : 'currentUser'
      });

      try {
        const avatarHTML = await window.AvatarUtils.createUnifiedAvatar(userForAvatar, 'profile', {
          size: 32,
          showAura: true,
          showStatus: false
        });
        avatarContainer.innerHTML = avatarHTML;
        console.log('✅ FOCUS: Created reply input avatar with correct aura using AvatarUtils');
      } catch (err) {
        console.error('❌ FOCUS: Error creating avatar with AvatarUtils:', err);
        // Fallback to simple img
        const userAvatar = userDataSource.avatarUrl || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(userForAvatar.name) + '&background=random&color=fff&size=32';
        avatarContainer.innerHTML = `<img src="${userAvatar}" style="width: 32px; height: 32px; border-radius: 50%; object-fit: cover;">`;
      }
    } else {
      // Fallback if AvatarUtils not available
      const userDataSource = window.profileManager?.profileData || window.currentUser || {};
      const userAvatar = userDataSource.avatarUrl || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(userDataSource.name || 'User') + '&background=random&color=fff&size=32';
      avatarContainer.innerHTML = `<img src="${userAvatar}" style="width: 32px; height: 32px; border-radius: 50%; object-fit: cover;">`;
    }
  };

  // Create initial avatar
  await createFocusReplyAvatar();

  // CRITICAL FIX: Listen for aura color updates and refresh focus reply avatar
  const updateFocusReplyAvatar = async (event) => {
    console.log('🎨 FOCUS: Aura color updated, refreshing focus reply avatar');
    await createFocusReplyAvatar();
  };

  document.addEventListener('auraColorUpdated', updateFocusReplyAvatar);

  // CRITICAL FIX: Clean up listener when focus mode exits
  const cleanupListener = () => {
    document.removeEventListener('auraColorUpdated', updateFocusReplyAvatar);
  };

  // Store cleanup function for when focus mode exits
  if (!window.focusModeCleanups) {
    window.focusModeCleanups = [];
  }
  window.focusModeCleanups.push(cleanupListener);
  
  // CRITICAL FIX: Restructure input container - "replying to" text in its own row above avatar and input
  // DYNAMIC HEIGHT: Container will adjust based on content, with minimum to hold all components
  messageInputContainer.style.cssText = 'display: flex; flex-direction: column; padding: 0; gap: 0; height: auto; min-height: auto; border-top: none !important; border-bottom: none !important; border-left: none !important; border-right: none !important; border: none !important; outline: none !important; box-shadow: none !important;';
  
  // CRITICAL FIX: Add "replying to [parent name]" text in its own row at the top, aligned with input field left edge
  const replyingToText = document.createElement('div');
  replyingToText.className = 'focus-replying-to-text';
  const parentAuthorName = message.author?.name || message.authorName || 'this message';
  replyingToText.textContent = `replying to ${parentAuthorName}`;
  // CRITICAL FIX: Align with input field left edge
  // CALCULATION: inputRow padding-left (16px) + avatar (32px) + gap (12px) + inputWrapper padding-left (16px) = 76px
  replyingToText.style.cssText = 'font-size: 12px; color: var(--text-secondary, #999); padding: 12px 16px 8px 76px !important; margin: 0; width: 100%; box-sizing: border-box; border-top: none !important; border-bottom: none !important; border-left: none !important; border-right: none !important; border: none !important; flex-shrink: 0;';
  messageInputContainer.appendChild(replyingToText);
  
  // CRITICAL FIX: Create row container for avatar and input field with more vertical space
  const inputRow = document.createElement('div');
  inputRow.style.cssText = 'display: flex; align-items: flex-start; padding: 0 16px 16px; gap: 12px; width: 100%; box-sizing: border-box; flex-shrink: 0;';
  inputRow.appendChild(avatarContainer);
  
  // Input field - CRITICAL FIX: Increased height for better usability
  const inputWrapper = document.createElement('div');
  inputWrapper.style.cssText = 'flex: 1; display: flex; align-items: center; background: var(--background-secondary, #f5f5f5); border-radius: 24px; padding: 12px 16px; min-height: 60px;';
  const inputField = document.createElement('div');
  inputField.className = 'focus-reply-input';
  inputField.setAttribute('contenteditable', 'true');
  inputField.setAttribute('role', 'textbox');
  inputField.setAttribute('aria-label', 'Post your reply');
  inputField.style.cssText = 'flex: 1; outline: none; border: none; background: transparent; color: var(--text-primary, #333); font-size: 15px; min-height: 36px; max-height: 200px; overflow-y: auto; line-height: 1.5;';
  inputField.textContent = 'Post your reply';
  inputField.style.color = 'var(--text-secondary, #999)';
  
  // Store original placeholder behavior
  let isPlaceholder = true;
  inputField.addEventListener('focus', () => {
    if (isPlaceholder) {
      inputField.textContent = '';
      inputField.style.color = 'var(--text-primary, #333)';
      isPlaceholder = false;
    }
  });
  inputField.addEventListener('blur', () => {
    if (inputField.textContent.trim() === '') {
      inputField.textContent = 'Post your reply';
      inputField.style.color = 'var(--text-secondary, #999)';
      isPlaceholder = true;
    }
  });
  
  // Reply button
  const replyButton = document.createElement('button');
  replyButton.textContent = 'Reply';
  replyButton.className = 'focus-reply-button';
  replyButton.style.cssText = 'background: var(--accent-color, #007bff); color: white; border: none; border-radius: 20px; padding: 8px 16px; font-size: 14px; font-weight: 600; cursor: pointer; margin-left: 12px;';
  replyButton.disabled = true;
  replyButton.style.opacity = '0.5';
  
  // Enable button when text is entered
  inputField.addEventListener('input', () => {
    const hasText = inputField.textContent.trim().length > 0 && !isPlaceholder;
    replyButton.disabled = !hasText;
    replyButton.style.opacity = hasText ? '1' : '0.5';
  });
  // Handle reply button click
  replyButton.addEventListener('click', async () => {
    const replyText = inputField.textContent.trim();
    if (replyText && replyText !== 'Post your reply') {
      console.log('💬 FOCUS: Sending reply:', replyText);
      // CRITICAL FIX: Use sendMessageViaSupabase directly with parentId
      try {
        // Get conversation ID from message
        const conversationId = message.conversationId || message.conversation?.id || null;
        
        // Send reply using sendMessageViaSupabase with parentId
        let newReplyId = null;
        if (typeof sendMessageViaSupabase === 'function') {
          const result = await sendMessageViaSupabase(replyText, message.id);
          newReplyId = result?.id || result?.messageId || null;
          console.log('✅ FOCUS: Reply sent successfully, ID:', newReplyId);
        } else if (window.sendChatMessage && typeof window.sendChatMessage === 'function') {
          // Fallback: Set reply context
          window.currentReplyContext = {
            parentId: message.id,
            parentMessage: message,
            conversationId: conversationId
          };
          const result = await window.sendChatMessage(replyText);
          newReplyId = result?.id || result?.messageId || null;
          delete window.currentReplyContext;
        } else {
          console.error('❌ FOCUS: No send function available');
          return;
        }
        
        // CRITICAL FIX: Immediately create and show reply at the top of replies list
        if (newReplyId || (typeof result === 'object' && result)) {
          const replyData = typeof result === 'object' && result ? result : { id: newReplyId };
          
          // Create reply object for immediate display
          const currentPageId = window.currentUrlData?.pageId || window.currentPage?.pageId;
          const communityId = message.communityId || (window.activeCommunities && window.activeCommunities[0]) || 'comm-001';
          
          // Format reply using ReplyLoader if available
          let formattedReply = null;
          if (window.ReplyLoader && typeof window.ReplyLoader.formatReply === 'function') {
            formattedReply = await window.ReplyLoader.formatReply(replyData, message, currentPageId, communityId);
          } else {
            // CRITICAL FIX: Ensure author data is complete with all required fields
            const currentUser = window.currentUser || {};
            formattedReply = {
              id: replyData.id || newReplyId,
              body: replyText,
              content: replyText,
              author: {
                id: currentUser.id || currentUser.user_id || 'unknown',
                name: currentUser.name || currentUser.email || 'You',
                avatarUrl: currentUser.avatarUrl || currentUser.picture || null,
                handle: currentUser.handle || currentUser.name || 'You',
                user_id: currentUser.id || currentUser.user_id || 'unknown'
              },
              createdAt: new Date().toISOString(),
              created_at: new Date().toISOString(),
              parentId: message.id,
              communityId: communityId,
              conversationId: message.conversationId || `conv-${communityId}-${currentPageId}`
            };
          }
          
          // CRITICAL FIX: Ensure author data and content are set correctly even if ReplyLoader returns incomplete data
          if (formattedReply) {
            // CRITICAL FIX: Ensure body/content are set from replyText
            if (!formattedReply.body && !formattedReply.content) {
              formattedReply.body = replyText;
              formattedReply.content = replyText;
              console.log('✅ FOCUS: Fixed body/content for immediate reply:', replyText);
            }
            
            // CRITICAL FIX: Ensure author data is complete
            if (!formattedReply.author || !formattedReply.author.id || formattedReply.author.name === 'Unknown') {
              const currentUser = window.currentUser || {};
              formattedReply.author = {
                id: currentUser.id || currentUser.user_id || formattedReply.author?.id || 'unknown',
                name: currentUser.name || currentUser.email || formattedReply.author?.name || 'You',
                avatarUrl: currentUser.avatarUrl || currentUser.picture || formattedReply.author?.avatarUrl || null,
                handle: currentUser.handle || currentUser.name || formattedReply.author?.handle || 'You',
                user_id: currentUser.id || currentUser.user_id || formattedReply.author?.user_id || 'unknown'
              };
              console.log('✅ FOCUS: Fixed author data for immediate reply:', formattedReply.author);
            }
          }
          
          // Immediately add reply to DOM at the top (right after input field)
          if (formattedReply) {
            const inputContainer = chatMessages.querySelector('.focus-message-input-container');
            if (inputContainer) {
              // Add reply using addMessageToFocus
              await addMessageToFocus(formattedReply, true);
              
              // Find the newly added reply and move it to top
              await new Promise(resolve => requestAnimationFrame(resolve));
              const newReply = chatMessages.querySelector(`[data-message-id="${formattedReply.id}"]`);
              if (newReply && inputContainer.nextSibling !== newReply) {
                // Move to top of replies (right after input field)
                chatMessages.insertBefore(newReply, inputContainer.nextSibling);
                console.log('✅ FOCUS: New reply added at top of replies list');
              }
            }
          }
        }
        
        // Clear input
        inputField.textContent = '';
        inputField.style.color = 'var(--text-secondary, #999)';
        isPlaceholder = true;
        replyButton.disabled = true;
        replyButton.style.opacity = '0.5';
      } catch (error) {
        console.error('❌ FOCUS: Error sending reply:', error);
      }
    }
  });
  
  // Handle Enter key
  inputField.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!replyButton.disabled) {
        replyButton.click();
      }
    }
  });
  
  inputWrapper.appendChild(inputField);
  inputRow.appendChild(inputWrapper);
  inputRow.appendChild(replyButton);
  messageInputContainer.appendChild(inputRow);
  
  // CRITICAL FIX: Calculate and set minimum height after all components are added
  // This ensures the container is tall enough for all components but can grow if needed
  // Wait for layout to calculate actual heights
  requestAnimationFrame(() => {
    const replyingToHeight = replyingToText.offsetHeight || 32; // Fallback: ~32px (12px padding-top + 12px text + 8px padding-bottom)
    const inputRowHeight = inputRow.offsetHeight || 78; // Fallback: ~78px (32px avatar + 46px input + 16px padding-bottom)
    const calculatedMinHeight = Math.max(110, replyingToHeight + inputRowHeight); // Ensure minimum 110px
    
    // Set minimum height to accommodate all components, but allow growth
    messageInputContainer.style.minHeight = `${calculatedMinHeight}px`;
    console.log(`✅ FOCUS: Input container min-height dynamically set to ${calculatedMinHeight}px (replying-to: ${replyingToHeight}px + input-row: ${inputRowHeight}px)`);
  });
  
  // CRITICAL FIX: Insert input field RIGHT AFTER the main message element, not just appended to container
  // This ensures it's between parent and children even if replies are loaded asynchronously
  const mainMessageElement = chatMessages.querySelector('.message:not(.message-reply)');
  if (mainMessageElement && mainMessageElement.nextSibling) {
    // Insert after main message, before any existing replies
    chatMessages.insertBefore(messageInputContainer, mainMessageElement.nextSibling);
    console.log(`✅ FOCUS: Message input field inserted right after parent message element`);
  } else if (mainMessageElement) {
    // Main message is the last child, append input after it
    mainMessageElement.parentNode.insertBefore(messageInputContainer, mainMessageElement.nextSibling);
    console.log(`✅ FOCUS: Message input field inserted after parent message (last child)`);
  } else {
    // Fallback: append to main container
    chatMessages.appendChild(messageInputContainer);
    console.log(`⚠️ FOCUS: Main message element not found, appended input to main container`);
  }
  
  // UNIFIED: Input field is already in main chat-messages container
  // No nested container needed - replies are standalone in main container
  
  // CRITICAL FIX: NOW load replies for the main message (input field is already in place)
  // This ensures replies will be inserted AFTER the input field
  console.log(`🔍 FOCUS: Loading replies for main message ${mainMessage.id} (input field is now in place)`);
  const currentPageId = window.currentUrlData?.pageId || window.currentPage?.pageId;
  const communityId = mainMessage.communityId || message.communityId || (window.activeCommunities && window.activeCommunities[0]) || 'comm-001';
  
  if (currentPageId && window.supabase && (mainMessage.hasReplies || mainMessage.replyCount > 0)) {
    try {
      // MODULAR ARCHITECTURE: Use ReplyLoader utility for reply loading
      if (window.ReplyLoader && typeof window.ReplyLoader.loadAllReplies === 'function') {
        const allRepliesData = await window.ReplyLoader.loadAllReplies(mainMessage.id, currentPageId, communityId);
        
        if (allRepliesData && allRepliesData.length > 0) {
          console.log(`✅ FOCUS: Found ${allRepliesData.length} replies for main message ${mainMessage.id}`);
          
          for (const replyData of allRepliesData) {
            // MODULAR ARCHITECTURE: Use ReplyLoader to format reply
            const reply = await window.ReplyLoader.formatReply(replyData, mainMessage, currentPageId, communityId);
            
            // CRITICAL FIX: Ensure input field exists before loading any replies
            const inputField = chatMessages.querySelector('.focus-message-input-container');
            if (!inputField) {
              console.warn(`⚠️ FOCUS: Input field not ready, skipping reply ${reply.id} - will load after input is ready`);
              continue; // Skip this reply, will be loaded when input is ready
            }
            
            // CRITICAL FIX: Check if reply already exists
            const existingReply = chatMessages.querySelector(`[data-message-id="${reply.id}"]`);
            if (!existingReply) {
              // CRITICAL FIX: Hide reply initially, will be shown after input field is confirmed ready
              await addMessageToFocus(reply, true);
              // Find the reply element after adding it
              await new Promise(resolve => requestAnimationFrame(resolve));
              const replyElement = chatMessages.querySelector(`[data-message-id="${reply.id}"]`);
              if (replyElement) {
                // Hide reply until input field is confirmed ready
                replyElement.style.display = 'none';
                replyElement.dataset.pendingVisibility = 'true';
                console.log(`⏸️ FOCUS: Reply ${reply.id} hidden pending input field confirmation`);
              }
            } else {
              // CRITICAL FIX: If reply exists, ensure it's hidden until input is ready
              if (existingReply.dataset.pendingVisibility === 'true') {
                // Keep it hidden, will be shown later
                console.log(`⏸️ FOCUS: Existing reply ${reply.id} still pending visibility`);
              } else {
                // Check dimensions and make visible if input is ready
                const width = existingReply.offsetWidth;
                const height = existingReply.offsetHeight;
                if (width === 0 || height === 0) {
                  console.log(`⚠️ FOCUS: Reply ${reply.id} exists but has zero dimensions (${width}px × ${height}px), making visible`);
                  if (window.MessageVisibilityManager && typeof window.MessageVisibilityManager.showReply === 'function') {
                    await window.MessageVisibilityManager.showReply(existingReply, reply.id);
                  }
                }
              }
            }
          }
        } else {
          console.log(`ℹ️ FOCUS: No replies found for main message ${mainMessage.id}`);
        }
      } else {
        console.warn(`⚠️ FOCUS: ReplyLoader utility not available, falling back to inline logic`);
        // Fallback to inline logic if utility not loaded
        const { data: directReplies, error } = await window.supabase
          .from('messages')
          .select('*')
          .eq('parent_id', mainMessage.id)
          .eq('page_id', currentPageId)
          .eq('community_id', communityId)
          .order('created_at', { ascending: true });
        
        if (error) {
          console.error(`❌ FOCUS: Error loading replies for ${mainMessage.id}:`, error);
        } else if (directReplies && directReplies.length > 0) {
          console.log(`✅ FOCUS: Found ${directReplies.length} direct replies (fallback mode)`);
          for (const replyData of directReplies) {
            const reply = await window.ReplyLoader?.formatReply(replyData, mainMessage, currentPageId, communityId) || {
              id: replyData.id,
              body: replyData.body || replyData.content,
              content: replyData.body || replyData.content,
              author: { id: replyData.user_id, user_id: replyData.user_id, name: 'Unknown' },
              user_id: replyData.user_id,
              createdAt: replyData.created_at,
              created_at: replyData.created_at,
              parentId: replyData.parent_id || mainMessage.id,
              conversationId: mainMessage.conversationId || message.conversationId,
              isReply: true,
              hasReplies: false,
              replyCount: 0,
              communityId: communityId
            };
            const existingReply = chatMessages.querySelector(`[data-message-id="${reply.id}"]`);
            if (!existingReply) {
              await addMessageToFocus(reply, true);
            } else {
              // CRITICAL FIX: If reply exists but has zero dimensions, make it visible
              const width = existingReply.offsetWidth;
              const height = existingReply.offsetHeight;
              if (width === 0 || height === 0) {
                console.log(`⚠️ FOCUS: Reply ${reply.id} exists but has zero dimensions (${width}px × ${height}px), making visible`);
                if (window.MessageVisibilityManager && typeof window.MessageVisibilityManager.showReply === 'function') {
                  await window.MessageVisibilityManager.showReply(existingReply, reply.id);
                }
              } else {
                console.log(`⚠️ FOCUS: Reply ${reply.id} already exists with dimensions (${width}px × ${height}px), skipping duplicate`);
              }
            }
          }
        }
      }
    } catch (err) {
      console.error('❌ FOCUS: Error loading replies for main message:', err);
    }
    
    // CRITICAL FIX: Make all pending replies visible now that input field is confirmed ready
    // Don't wait for optimizeReplies - make them visible right away
    console.log('🔍 FOCUS: Making all loaded replies visible immediately (input field is ready)');
    const allReplies = chatMessages.querySelectorAll('.message-reply, .message-reply.thread-reply, .thread-reply, [data-message-id].message[class*="reply"]');
    if (allReplies.length > 0) {
      await Promise.all(Array.from(allReplies).map(async reply => {
        const messageId = reply.dataset.messageId || reply.getAttribute('data-message-id') || 'unknown';
        
        // CRITICAL FIX: If reply was hidden pending input field, show it now
        if (reply.dataset.pendingVisibility === 'true') {
          reply.style.display = 'flex';
          reply.removeAttribute('data-pending-visibility');
          console.log(`✅ FOCUS: Showing pending reply ${messageId} (input field is ready)`);
        }
        
        const width = reply.offsetWidth;
        const height = reply.offsetHeight;
        if (width === 0 || height === 0) {
          console.log(`🔍 FOCUS: Making reply ${messageId} visible (zero dimensions: ${width}px × ${height}px)`);
          if (window.MessageVisibilityManager && typeof window.MessageVisibilityManager.showReply === 'function') {
            await window.MessageVisibilityManager.showReply(reply, messageId);
          }
        }
      }));
    }
  } else {
    console.log(`ℹ️ FOCUS: Skipping reply load for main message (no hasReplies flag or missing dependencies)`);
  }
  
  // CRITICAL FIX: Ensure all replies in focus mode are visible (with multiple checks to catch async additions)
  // Use a function that can be called multiple times to catch replies added asynchronously
  // CRITICAL FIX: Track processing to prevent duplicate work
  const processingReplies = new Set();
  const makeRepliesVisible = async () => {
    // CRITICAL FIX: Ensure input field exists before showing replies
    const inputField = chatMessages.querySelector('.focus-message-input-container');
    if (!inputField) {
      console.warn('⚠️ FOCUS: Input field not found - cannot show replies yet');
      return;
    }
    
    // UNIFIED: Replies are in main chat-messages container, not nested
    const repliesInFocus = chatMessages.querySelectorAll('.message-reply, .message-reply.thread-reply, .thread-reply, [data-message-id].message[class*="reply"]');
      console.log(`🔍 FOCUS: Found ${repliesInFocus.length} replies to make visible`);
      
      // MODULAR ARCHITECTURE: Use MessageVisibilityManager.showReply (which includes dimension verification)
      await Promise.all(Array.from(repliesInFocus).map(async reply => {
        const messageId = reply.dataset.messageId || reply.getAttribute('data-message-id') || 'unknown';
        
        // CRITICAL FIX: Prevent duplicate processing
        if (processingReplies.has(messageId)) {
          console.log(`⏭️ FOCUS: Skipping ${messageId} - already being processed`);
          return;
        }
        
        processingReplies.add(messageId);
        
        try {
          // CRITICAL FIX: Check dimensions BEFORE making visible
          const width = reply.offsetWidth;
          const height = reply.offsetHeight;
          console.log(`🔍 FOCUS: Reply ${messageId} dimensions before fix: ${width}px × ${height}px`);
          
          if (window.MessageVisibilityManager && typeof window.MessageVisibilityManager.showReply === 'function') {
            // showReply internally calls verifyDimensions, so we only need one call
            await window.MessageVisibilityManager.showReply(reply, messageId);
            
            // CRITICAL FIX: Verify dimensions AFTER fix
            await new Promise(resolve => requestAnimationFrame(resolve));
            const finalWidth = reply.offsetWidth;
            const finalHeight = reply.offsetHeight;
            console.log(`🔍 FOCUS: Reply ${messageId} dimensions after fix: ${finalWidth}px × ${finalHeight}px`);
            
            // CRITICAL FIX: If still zero dimensions, force visibility
            if (finalWidth === 0 || finalHeight === 0) {
              console.warn(`⚠️ FOCUS: Reply ${messageId} still has zero dimensions after fix, forcing visibility`);
              reply.style.setProperty('display', 'flex', 'important');
              reply.style.setProperty('visibility', 'visible', 'important');
              reply.style.setProperty('opacity', '1', 'important');
              reply.style.setProperty('min-height', '93px', 'important');
              reply.style.setProperty('width', '100%', 'important');
            }
            
            console.log(`✅ FOCUS: Made reply ${messageId} visible using MessageVisibilityManager`);
          } else {
            // Fallback if utility not loaded
            console.warn(`⚠️ FOCUS: MessageVisibilityManager not available, using fallback`);
            reply.classList.add('visible', 'thread-reply', 'message-reply', 'message-loaded');
            reply.style.setProperty('display', 'flex', 'important');
            reply.style.setProperty('visibility', 'visible', 'important');
            reply.style.setProperty('opacity', '1', 'important');
          }
        } finally {
          // Remove from processing set after a delay to allow for re-processing if needed
          setTimeout(() => processingReplies.delete(messageId), 1000);
        }
      }));
      // CRITICAL FIX: Also ensure event listeners are attached to all messages including PARENT and replies
      // Force re-attach even if already marked as attached (fixes stale listeners)
      // SD3 FIX: Include parent message (thread-starter) AND child replies (message-reply) in activation
      const allFocusMessages = chatMessages.querySelectorAll('.message[data-message-id], .thread-starter[data-message-id], .message-reply[data-message-id], .message-reply.thread-reply[data-message-id]');
      console.log(`🔧 FOCUS: Activating icons for ${allFocusMessages.length} messages (including parent and child replies)`);
      
      // CRITICAL FIX: Parallelize listener attachment to reduce delay
      await Promise.all(Array.from(allFocusMessages).map(async (msgElement) => {
        const messageId = msgElement.dataset.messageId;
        if (messageId) {
          // CRITICAL FIX: Try to find message data from currentChatData, but if not found, use message object
          let msg = window.currentChatData?.find(m => m.id === messageId);
          if (!msg) {
            // If not in currentChatData, try to construct from element
            msg = {
              id: messageId,
              // Try to get other data from element attributes if needed
            };
          }
          
          if (msg) {
            // CRITICAL FIX: Always re-attach listeners in focus mode (remove old ones first)
            // Clone ALL buttons to remove old listeners (reply, edit, delete, reaction, bookmark, share, repost)
            const buttonsToClone = [
              { selector: '.inline-reply-btn', name: 'reply' },
              { selector: '.edit-btn', name: 'edit' },
              { selector: '.delete-btn', name: 'delete' },
              { selector: '.reaction-btn', name: 'reaction' },
              { selector: '.bookmark-btn', name: 'bookmark' },
              { selector: '.share-btn', name: 'share' },
              { selector: '.repost-btn', name: 'repost' }
            ];
            
            buttonsToClone.forEach(({ selector, name }) => {
              const btn = msgElement.querySelector(selector);
              if (btn && (btn.onclick || btn.dataset.hasListener === 'true')) {
                const newBtn = btn.cloneNode(true);
                btn.parentNode.replaceChild(newBtn, btn);
                console.log(`🔧 FOCUS: Cloned ${name} button to remove old listeners for ${messageId}`);
              }
            });
            
            // CRITICAL FIX: Ensure message-actions-new container is visible for own messages
            const authorId = msgElement.dataset.authorId;
            const currentUserId = window.currentUser?.id || window.currentUser?.user_id;
            if (authorId === currentUserId) {
              const actionsContainer = msgElement.querySelector('.message-actions-new');
              if (actionsContainer) {
                actionsContainer.style.setProperty('display', 'flex', 'important');
                actionsContainer.style.setProperty('opacity', '1', 'important');
                actionsContainer.style.setProperty('visibility', 'visible', 'important');
                actionsContainer.style.setProperty('margin-left', 'auto', 'important');
                actionsContainer.style.setProperty('position', 'relative', 'important');
                actionsContainer.style.setProperty('z-index', '10', 'important');
                actionsContainer.style.setProperty('pointer-events', 'auto', 'important');
                console.log(`✅ FOCUS: Made actions container visible for own message ${messageId}`);
              }
              
              // CRITICAL FIX: Ensure edit/delete buttons are visible and clickable
              const editBtn = msgElement.querySelector('.edit-btn');
              const deleteBtn = msgElement.querySelector('.delete-btn');
              if (editBtn) {
                editBtn.style.setProperty('display', 'inline-block', 'important');
                editBtn.style.setProperty('opacity', '1', 'important');
                editBtn.style.setProperty('visibility', 'visible', 'important');
                editBtn.style.setProperty('pointer-events', 'auto', 'important');
                editBtn.style.setProperty('z-index', '10', 'important');
                editBtn.style.setProperty('cursor', 'pointer', 'important');
                editBtn.disabled = false;
              }
              if (deleteBtn) {
                deleteBtn.style.setProperty('display', 'inline-block', 'important');
                deleteBtn.style.setProperty('opacity', '1', 'important');
                deleteBtn.style.setProperty('visibility', 'visible', 'important');
                deleteBtn.style.setProperty('pointer-events', 'auto', 'important');
                deleteBtn.style.setProperty('z-index', '10', 'important');
                deleteBtn.style.setProperty('cursor', 'pointer', 'important');
                deleteBtn.disabled = false;
              }
            }
            
            // CRITICAL FIX: Ensure all footer buttons are clickable in focus mode
            const footerButtons = msgElement.querySelectorAll('.message-footer button');
            footerButtons.forEach(btn => {
              btn.style.setProperty('pointer-events', 'auto', 'important');
              btn.style.setProperty('opacity', '1', 'important');
              btn.style.setProperty('visibility', 'visible', 'important');
              btn.style.setProperty('cursor', 'pointer', 'important');
              btn.style.setProperty('z-index', '20', 'important'); // CRITICAL FIX: Higher z-index for clicks
              btn.style.setProperty('position', 'relative', 'important');
              btn.disabled = false;
            });
            
            // CRITICAL FIX: Explicitly activate all icon buttons with proper styles
            const iconButtons = [
              { selector: '.inline-reply-btn', name: 'reply' },
              { selector: '.reaction-btn', name: 'reaction' },
              { selector: '.bookmark-btn', name: 'bookmark' },
              { selector: '.share-btn', name: 'share' },
              { selector: '.repost-btn', name: 'repost' },
              { selector: '.edit-btn', name: 'edit' },
              { selector: '.delete-btn', name: 'delete' }
            ];
            
            iconButtons.forEach(({ selector, name }) => {
              const btn = msgElement.querySelector(selector);
              if (btn) {
                // CRITICAL FIX: Clone button to remove old listeners before activating
                const newBtn = btn.cloneNode(true);
                btn.parentNode.replaceChild(newBtn, btn);
                
                // Get the new button reference
                const actualBtn = msgElement.querySelector(selector);
                if (actualBtn) {
                  actualBtn.style.setProperty('pointer-events', 'auto', 'important');
                  actualBtn.style.setProperty('cursor', 'pointer', 'important');
                  actualBtn.style.setProperty('opacity', '1', 'important');
                  actualBtn.style.setProperty('visibility', 'visible', 'important');
                  actualBtn.style.setProperty('z-index', '20', 'important'); // CRITICAL FIX: Higher z-index for clicks
                  actualBtn.style.setProperty('position', 'relative', 'important');
                  actualBtn.disabled = false;
                  actualBtn.dataset.hasListener = 'false'; // Reset to allow re-attachment
                  console.log(`✅ FOCUS: Activated ${name} button for ${messageId} (cloned to remove old listeners)`);
                }
              }
            });
            
            // CRITICAL FIX: Ensure parent containers allow pointer events
            const contentWrapper = msgElement.querySelector('.message-content-wrapper');
            if (contentWrapper) {
              contentWrapper.style.setProperty('pointer-events', 'auto', 'important');
            }
            const header = msgElement.querySelector('.message-header-new');
            if (header) {
              header.style.setProperty('pointer-events', 'auto', 'important');
            }
            
            // CRITICAL FIX: Reset listenersAttached flag before re-attaching (buttons were cloned, need fresh listeners)
            msgElement.dataset.listenersAttached = 'false';
            
            // Always attach fresh listeners
            addMessageActionListeners(msgElement, msg);
            msgElement.dataset.listenersAttached = 'true';
            console.log(`✅ FOCUS: Attached event listeners to message ${messageId}`);
            
            // CRITICAL FIX: Ensure bookmark handler is available and working
            const bookmarkBtn = msgElement.querySelector('.bookmark-btn');
            if (bookmarkBtn) {
              // Verify handleBookmarkToggle is available
              if (typeof window.handleBookmarkToggle !== 'function') {
                console.warn(`⚠️ FOCUS: handleBookmarkToggle not available for message ${messageId}, waiting...`);
                setTimeout(() => {
                  if (typeof window.handleBookmarkToggle === 'function') {
                    console.log(`✅ FOCUS: handleBookmarkToggle now available for message ${messageId}`);
                  } else {
                    console.error(`❌ FOCUS: handleBookmarkToggle still not available for message ${messageId}`);
                  }
                }, 500);
              }
            }
          }
        }
      }));
    };
    // CRITICAL FIX: Don't block UI - run visibility fixes in background
    // Show container immediately, then optimize replies asynchronously
    const optimizeReplies = async () => {
      const repliesInFocus = chatMessages.querySelectorAll('.message-reply, .message-reply.thread-reply, .thread-reply');
      if (repliesInFocus.length > 0) {
        await makeRepliesVisible();
        console.log(`✅ FOCUS: ${repliesInFocus.length} replies marked as visible`);
        
        // MODULAR ARCHITECTURE: Use MessageVisibilityManager to fix all zero-dimension replies
        if (window.MessageVisibilityManager && typeof window.MessageVisibilityManager.fixAllZeroDimensionReplies === 'function') {
          console.log('🔧 FOCUS: Running MessageVisibilityManager fix for zero-dimension replies');
          const stats = await window.MessageVisibilityManager.fixAllZeroDimensionReplies(chatMessages);
          console.log(`✅ FOCUS: Fixed ${stats.fixed} replies, ${stats.failed} failed, ${stats.total} total`);
        }
      }
    };
    
    // Run optimization in background - don't block UI rendering
    optimizeReplies().catch(err => console.error('⚠️ FOCUS: Error optimizing replies:', err));
    // REFACTOR: Load reactions and bookmarks immediately - no waiting
    const allMessages = chatMessages.querySelectorAll('.message[data-message-id], .message-reply[data-message-id]');
    console.log(`🔧 FOCUS: Loading reactions/bookmarks for ${allMessages.length} messages immediately`);
    
    // Load reactions and bookmarks in parallel (no sequential waiting)
    const loadPromises = Array.from(allMessages).map(async (msgElement) => {
      const messageId = msgElement.dataset.messageId;
      if (!messageId) return;
      
      const reactionBtn = msgElement.querySelector('.reaction-btn');
      const bookmarkBtn = msgElement.querySelector('.bookmark-btn');
      
      // Load both in parallel for each message
      const promises = [];
      if (reactionBtn && window.loadMessageReactions) {
        promises.push(window.loadMessageReactions(messageId, reactionBtn).catch(err => 
          console.warn(`⚠️ FOCUS: Error loading reactions for ${messageId}:`, err)
        ));
      }
      if (bookmarkBtn && window.loadMessageBookmarks) {
        promises.push(window.loadMessageBookmarks(messageId, bookmarkBtn).catch(err => 
          console.warn(`⚠️ FOCUS: Error loading bookmarks for ${messageId}:`, err)
        ));
      }
      
      await Promise.allSettled(promises);
    });
    
    // Wait for all to complete (but don't block UI)
    Promise.allSettled(loadPromises).then(() => {
      console.log(`✅ FOCUS: Reactions and bookmarks loading initiated for all messages`);
    });
}

// Function to toggle thread replies
// FOCUS MODE ONLY: Toggle thread replies (disabled in default mode)
function toggleThreadReplies(conversationId, messageDiv) {
  console.log('📂 THREAD: Toggling thread replies for:', conversationId);

  if (!messageDiv) {
    console.error('❌ THREAD: No messageDiv provided');
    return;
  }

  // DEFAULT MODE: No reply toggling - all messages visible
  const chatMessages = messageDiv.closest('.chat-messages');
  const isInFocusMode = chatMessages && chatMessages.classList.contains('focus-messages-container');
  if (!isInFocusMode) {
    console.log('📝 DEFAULT MODE: Reply toggling disabled - all messages visible');
    return;
  }

  // FOCUS MODE: Apply reply toggling
  const isExpanded = messageDiv.dataset.threadExpanded === 'true';
  const threadId = messageDiv.dataset.messageId || conversationId;

  // Find all replies for this message
  const replies = document.querySelectorAll(`.message-reply[data-parent-id="${threadId}"]`);

  if (isExpanded) {
    // Collapse - hide replies
    replies.forEach(reply => {
      reply.classList.remove('visible');
      reply.style.display = 'none';
    });
    messageDiv.dataset.threadExpanded = 'false';
    const toggleBtn = messageDiv.querySelector('.thread-toggle-btn');
    if (toggleBtn) {
      toggleBtn.dataset.expanded = 'false';
    }
  } else {
    // Expand - show replies
    replies.forEach(reply => {
      reply.classList.add('visible');
      reply.style.display = 'flex';
    });
    messageDiv.dataset.threadExpanded = 'true';
    const toggleBtn = messageDiv.querySelector('.thread-toggle-btn');
    if (toggleBtn) {
      toggleBtn.dataset.expanded = 'true';
    }
  }
}
// Function to show reply modal with context
async function showReplyModal(message) {
  console.log('💬 REPLY MODAL: Showing reply modal for message:', message.id);
  
  if (!message || !message.id) {
    console.error('❌ REPLY MODAL: Invalid message provided');
    return;
  }
  
  // Create or get modal container - append to sidepanel document, not main document
  const sidepanelDoc = document;
  let modalContainer = sidepanelDoc.getElementById('reply-modal-container');
  if (!modalContainer) {
    modalContainer = sidepanelDoc.createElement('div');
    modalContainer.id = 'reply-modal-container';
    modalContainer.style.cssText = 'position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.8); z-index: 10000; overflow-y: auto; display: flex; align-items: center; justify-content: center;';
    // Append to sidepanel body, or fallback to document.body
    const targetBody = sidepanelDoc.body || sidepanelDoc.querySelector('body') || document.body;
    targetBody.appendChild(modalContainer);
  }
  
  modalContainer.style.display = 'flex';
  modalContainer.style.visibility = 'visible';
  modalContainer.style.opacity = '1';
  
  // Create modal content first - with dark mode support
  const isDarkMode = document.documentElement.getAttribute('data-theme') === 'dark' || 
                     document.body.getAttribute('data-theme') === 'dark';
  const modalBg = isDarkMode ? '#2a2a2a' : 'white';
  const modalText = isDarkMode ? '#e0e0e0' : '#333';
  const modalBorder = isDarkMode ? '#444' : '#eee';
  
  const modalContent = document.createElement('div');
  modalContent.className = 'reply-modal-content';
  modalContent.style.cssText = `max-width: 600px; width: 90%; background: ${modalBg}; color: ${modalText}; border-radius: 16px; padding: 0; overflow: hidden; max-height: 90vh; display: flex; flex-direction: column;`;
  
  // Header with close button - with dark mode support
  const modalHeader = document.createElement('div');
  modalHeader.style.cssText = `padding: 16px; border-bottom: 1px solid ${modalBorder}; display: flex; align-items: center; justify-content: space-between;`;
  const closeBtn = document.createElement('button');
  closeBtn.innerHTML = '×';
  closeBtn.style.cssText = `background: none; border: none; font-size: 28px; cursor: pointer; color: ${isDarkMode ? '#c0c0c0' : '#666'}; padding: 0; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center;`;
  closeBtn.addEventListener('click', () => {
    modalContainer.style.display = 'none';
  });
  modalHeader.appendChild(closeBtn);
  
  // Message context area (like Twitter shows parent tweet) - will be populated asynchronously - with dark mode
  const contextArea = document.createElement('div');
  contextArea.className = 'reply-context-area';
  const contextBg = isDarkMode ? '#1a1a1a' : '#f9f9f9';
  contextArea.style.cssText = `padding: 16px; border-bottom: 1px solid ${modalBorder}; background: ${contextBg}; max-height: 300px; overflow-y: auto;`;
  contextArea.innerHTML = `<div style="padding: 12px; text-align: center; color: ${isDarkMode ? '#c0c0c0' : '#666'};">Loading context...</div>`;
  
  // Function to update context area with loaded messages
  const updateContextArea = (parentMsg, quotedMsg) => {
    contextArea.innerHTML = '';
    
    // CRITICAL FIX: Define isReplyingToChild to check if we're replying to a child message
    const isReplyingToChild = message.parentId && message.parentId !== (parentMsg?.id);
    
    // Show quoted message if exists (quote posts show the quoted message) - dark mode support
    if (quotedMsg) {
      const quotedBg = isDarkMode ? '#1a1a1a' : 'white';
      const quotedText = isDarkMode ? '#e0e0e0' : '#333';
      const quotedSecondaryText = isDarkMode ? '#c0c0c0' : '#666';
      const quotedDiv = document.createElement('div');
      quotedDiv.style.cssText = `padding: 12px; margin-bottom: 8px; border-left: 3px solid #1da1f2; background: ${quotedBg}; border-radius: 8px;`;
      const quotedAuthorName = quotedMsg.author?.name || 'Unknown';
      const quotedBody = quotedMsg.body || quotedMsg.content || '';
      quotedDiv.innerHTML = `
        <div style="display: flex; gap: 12px;">
          <div style="flex: 1;">
            <div style="font-size: 12px; color: ${quotedSecondaryText}; margin-bottom: 4px;">Quoting</div>
            <strong style="color: ${quotedText};">${quotedAuthorName}</strong>
            <div style="margin-top: 4px; color: ${quotedText};">${quotedBody}</div>
          </div>
        </div>
      `;
      contextArea.appendChild(quotedDiv);
    }
    
    // CRITICAL FIX: Reply modal should ONLY show the message being replied to, NOT the parent
    // Removed parent message display - user requested only the message being replied to
    
    // Show message being replied to (main message or child in focus mode) - dark mode support
    const messageDiv = document.createElement('div');
    const msgBg = isDarkMode ? '#1a1a1a' : 'white';
    const msgText = isDarkMode ? '#e0e0e0' : '#333';
    const msgSecondaryText = isDarkMode ? '#c0c0c0' : '#666';
    messageDiv.style.cssText = `padding: 12px; border-left: 2px solid #1da1f2; background: ${msgBg}; border-radius: 8px;`;
    
    const authorName = message.author?.name || message.authorName || 'Unknown';
    const messageBody = message.body || message.content || '';
    
    messageDiv.innerHTML = `
      <div style="display: flex; gap: 12px;">
        <div style="flex: 1;">
          ${isReplyingToChild ? `<div style="font-size: 12px; color: ${msgSecondaryText}; margin-bottom: 4px;">Replying to</div>` : ''}
          <strong style="color: ${msgText};">${authorName}</strong>
          <div style="margin-top: 4px; color: ${msgText};">${messageBody}</div>
        </div>
      </div>
    `;
    contextArea.appendChild(messageDiv);
  };
  
  // Load parent and quoted messages asynchronously
  (async () => {
    let parentMessage = null;
    let quotedMessage = null;
    
    // Load parent message if this is a reply
    if (message.parentId) {
      try {
        // First try to find parent in currentChatData
        const parentFromData = window.currentChatData?.find(m => m.id === message.parentId);
        if (parentFromData) {
          parentMessage = {
            id: parentFromData.id,
            body: parentFromData.body || parentFromData.content || '',
            content: parentFromData.body || parentFromData.content || '',
            author: parentFromData.author || { name: parentFromData.authorName || 'Unknown' },
            createdAt: parentFromData.createdAt || parentFromData.created_at
          };
        } else {
          // Fallback: Find parent in DOM
          const parentElement = document.querySelector(`.message[data-message-id="${message.parentId}"]`);
          if (parentElement) {
            const parentAuthorName = parentElement.dataset.authorName || 'Unknown';
            const parentBody = parentElement.querySelector('.message-content')?.textContent || '';
            parentMessage = {
              id: message.parentId,
              body: parentBody,
              content: parentBody,
              author: { name: parentAuthorName },
              createdAt: null
            };
          } else {
            // Fetch from API
            try {
              const currentPageId = window.currentUrlData?.pageId || window.currentPage?.pageId;
              const communityId = message.communityId || 'comm-001';
              if (currentPageId && window.supabase) {
                const { data: parentData, error } = await window.supabase
                  .from('messages')
                  .select('*')
                  .eq('id', message.parentId)
                  .eq('page_id', currentPageId)
                  .eq('community_id', communityId)
                  .single();
                
                if (!error && parentData) {
                  // Fetch parent author
                  let parentAuthor = { name: 'Unknown' };
                  if (parentData.user_id) {
                    try {
                      const authorResp = await window.api.request(`/v1/users/${encodeURIComponent(parentData.user_id)}`, { method: 'GET', allow404: true });
                      if (authorResp) {
                        parentAuthor = {
                          name: authorResp.name || 'Unknown',
                          avatarUrl: authorResp.avatarUrl || null
                        };
                      }
                    } catch (err) {
                      console.error('Error fetching parent author:', err);
                    }
                  }
                  
                  parentMessage = {
                    id: parentData.id,
                    body: parentData.body || parentData.content || '',
                    content: parentData.body || parentData.content || '',
                    author: parentAuthor,
                    createdAt: parentData.created_at
                  };
                }
              }
            } catch (fetchErr) {
              console.error('Error fetching parent message from API:', fetchErr);
            }
          }
        }
      } catch (err) {
        console.error('Error loading parent message:', err);
      }
    }
    // Load quoted message if this message quotes another
    if (message.quote_id) {
      try {
        const quotedFromData = window.currentChatData?.find(m => m.id === message.quote_id);
        if (quotedFromData) {
          quotedMessage = {
            id: quotedFromData.id,
            body: quotedFromData.body || quotedFromData.content || '',
            content: quotedFromData.body || quotedFromData.content || '',
            author: quotedFromData.author || { name: quotedFromData.authorName || 'Unknown' },
            createdAt: quotedFromData.createdAt || quotedFromData.created_at
          };
        } else {
          // Fetch from API
          try {
            const currentPageId = window.currentUrlData?.pageId || window.currentPage?.pageId;
            const communityId = message.communityId || 'comm-001';
            if (currentPageId && window.supabase) {
              const { data: quotedData, error } = await window.supabase
                .from('messages')
                .select('*')
                .eq('id', message.quote_id)
                .eq('page_id', currentPageId)
                .eq('community_id', communityId)
                .single();
              
              if (!error && quotedData) {
                let quotedAuthor = { name: 'Unknown' };
                if (quotedData.user_id) {
                  try {
                    const authorResp = await window.api.request(`/v1/users/${encodeURIComponent(quotedData.user_id)}`, { method: 'GET', allow404: true });
                    if (authorResp) {
                      quotedAuthor = {
                        name: authorResp.name || 'Unknown',
                        avatarUrl: authorResp.avatarUrl || null
                      };
                    }
                  } catch (err) {
                    console.error('Error fetching quoted author:', err);
                  }
                }
                
                quotedMessage = {
                  id: quotedData.id,
                  body: quotedData.body || quotedData.content || '',
                  content: quotedData.body || quotedData.content || '',
                  author: quotedAuthor,
                  createdAt: quotedData.created_at
                };
              }
            }
          } catch (fetchErr) {
            console.error('Error fetching quoted message from API:', fetchErr);
          }
        }
      } catch (err) {
        console.error('Error loading quoted message:', err);
      }
    }
    
    // Update context area with loaded messages
    updateContextArea(parentMessage, quotedMessage);
  })();
  
  // Reply input area
  const inputArea = document.createElement('div');
  inputArea.style.cssText = 'padding: 16px; flex: 1; display: flex; flex-direction: column;';
  
  const replyInput = document.createElement('textarea');
  replyInput.id = 'reply-modal-input';
  replyInput.placeholder = 'Reply in the community...';
  // CRITICAL FIX: Dark mode support for reply input
  const inputBg = isDarkMode ? '#1a1a1a' : 'white';
  const inputText = isDarkMode ? '#e0e0e0' : '#333';
  const inputBorder = isDarkMode ? '#444' : '#ddd';
  replyInput.style.cssText = `width: 100%; min-height: 120px; padding: 12px; border: 1px solid ${inputBorder}; background: ${inputBg}; color: ${inputText}; border-radius: 8px; font-size: 14px; resize: none; font-family: inherit;`;
  replyInput.focus();
  
  // Action buttons
  const actionBar = document.createElement('div');
  actionBar.style.cssText = 'margin-top: 12px; display: flex; justify-content: flex-end; gap: 8px;';
  
  const cancelBtn = document.createElement('button');
  cancelBtn.textContent = 'Cancel';
  // CRITICAL FIX: Dark mode support for cancel button
  const cancelBg = isDarkMode ? '#2a2a2a' : 'white';
  const cancelText = isDarkMode ? '#e0e0e0' : '#333';
  const cancelBorder = isDarkMode ? '#444' : '#ddd';
  cancelBtn.style.cssText = `padding: 8px 16px; border: 1px solid ${cancelBorder}; background: ${cancelBg}; color: ${cancelText}; border-radius: 20px; cursor: pointer; font-weight: 600;`;
  cancelBtn.addEventListener('click', () => {
    modalContainer.style.display = 'none';
  });
  
  const sendBtn = document.createElement('button');
  sendBtn.textContent = 'Reply';
  sendBtn.style.cssText = 'padding: 8px 16px; border: none; background: #1da1f2; color: white; border-radius: 20px; cursor: pointer; font-weight: 600;';
  sendBtn.addEventListener('click', async () => {
    const replyText = replyInput.value.trim();
    if (!replyText) {
      alert('Please enter a reply');
      return;
    }
    
    // Send reply
    try {
      await sendReplyMessage(message.id, replyText, message.communityId || 'comm-001');
      modalContainer.style.display = 'none';
      
      // CRITICAL: Update reply button active state after successful reply
      const replyBtn = document.querySelector(`.inline-reply-btn[data-message-id="${message.id}"]`);
      if (replyBtn) {
        replyBtn.classList.add('active');
        replyBtn.dataset.hasReplied = 'true';
        const svg = replyBtn.querySelector('svg');
        if (svg) {
          svg.setAttribute('style', 'fill: var(--icon-active-color, #1da1f2);');
        }
        console.log('✅ REPLY: Button set to active state for message:', message.id);
      }
    } catch (err) {
      console.error('Error sending reply:', err);
      alert('Failed to send reply. Please try again.');
    }
  });
  
  actionBar.appendChild(cancelBtn);
  actionBar.appendChild(sendBtn);
  
  inputArea.appendChild(replyInput);
  inputArea.appendChild(actionBar);
  
  // Assemble modal
  modalContent.appendChild(modalHeader);
  modalContent.appendChild(contextArea);
  modalContent.appendChild(inputArea);
  modalContainer.innerHTML = '';
  modalContainer.appendChild(modalContent);
  
  // Close on background click
  modalContainer.addEventListener('click', (e) => {
    if (e.target === modalContainer) {
      modalContainer.style.display = 'none';
    }
  });
}

// Helper function to send reply message
async function sendReplyMessage(parentId, replyText, communityId) {
  console.log('💬 SEND REPLY: Sending reply to message:', parentId);
  console.log('💬 SEND REPLY: Reply text length:', replyText.length);
  console.log('💬 SEND REPLY: Community ID:', communityId);
  
  const currentPageId = window.currentUrlData?.pageId || window.currentPage?.pageId;
  if (!currentPageId) {
    console.error('❌ SEND REPLY: No current page ID available');
    throw new Error('No current page ID available');
  }
  
  console.log('💬 SEND REPLY: Page ID:', currentPageId);
  
  // Use the same send message function but with parentId
  if (window.sendChatMessage) {
    try {
      console.log('💬 SEND REPLY: Calling sendChatMessage with parentId:', parentId);
      await window.sendChatMessage(replyText, {
        parentId: parentId,
        communityId: communityId,
        pageId: currentPageId
      });
      console.log('✅ SEND REPLY: Reply sent successfully');
    } catch (error) {
      console.error('❌ SEND REPLY: Error sending reply:', error);
      throw error;
    }
  } else {
    console.error('❌ SEND REPLY: sendChatMessage function not available');
    throw new Error('sendChatMessage function not available');
  }
}
// Repost handler - shows modal to choose repost type (repost or quote)
function handleRepost(message) {
  console.log('🔄 REPOST: Opening repost modal for message:', message.id);
  
  // CRITICAL FIX: Add dark mode support for repost modal
  const isDarkMode = document.documentElement.getAttribute('data-theme') === 'dark' || 
                     document.body.getAttribute('data-theme') === 'dark';
  const modalBg = isDarkMode ? '#2a2a2a' : 'white';
  const modalText = isDarkMode ? '#e0e0e0' : '#333';
  const modalBorder = isDarkMode ? '#444' : '#eee';
  const modalSecondaryText = isDarkMode ? '#c0c0c0' : '#666';
  const modalHoverBorder = isDarkMode ? '#555' : '#1da1f2';
  
  // Create modal container
  const modalContainer = document.createElement('div');
  modalContainer.id = 'repost-modal-container';
  modalContainer.style.cssText = 'position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.8); z-index: 10000; display: flex; align-items: center; justify-content: center;';
  
  const modalContent = document.createElement('div');
  modalContent.style.cssText = `background: ${modalBg}; color: ${modalText}; border-radius: 16px; width: 90%; max-width: 600px; max-height: 80vh; overflow-y: auto; display: flex; flex-direction: column;`;
  
  // Header with close button - dark mode support
  const modalHeader = document.createElement('div');
  modalHeader.style.cssText = `padding: 16px; border-bottom: 1px solid ${modalBorder}; display: flex; align-items: center; justify-content: space-between;`;
  const headerTitle = document.createElement('h3');
  headerTitle.textContent = 'Repost';
  headerTitle.style.cssText = `margin: 0; font-size: 20px; font-weight: 700; color: ${modalText};`;
  const closeBtn = document.createElement('button');
  closeBtn.innerHTML = '×';
  closeBtn.style.cssText = `background: none; border: none; font-size: 28px; cursor: pointer; color: ${modalSecondaryText}; padding: 0; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center;`;
  closeBtn.addEventListener('click', () => {
    modalContainer.remove();
  });
  modalHeader.appendChild(headerTitle);
  modalHeader.appendChild(closeBtn);
  
  // Message preview - dark mode support
  const messagePreview = document.createElement('div');
  messagePreview.style.cssText = `padding: 16px; border-bottom: 1px solid ${modalBorder};`;
  const authorName = message.author?.name || message.user_email || 'Unknown';
  const messageBody = message.body || message.content || '';
  messagePreview.innerHTML = `
    <div style="display: flex; gap: 12px;">
      <div style="flex: 1;">
        <strong style="color: ${modalText};">${authorName}</strong>
        <div style="margin-top: 8px; color: ${modalText};">${messageBody}</div>
      </div>
    </div>
  `;
  
  // Repost type selection
  const typeSelection = document.createElement('div');
  typeSelection.style.cssText = 'padding: 16px; display: flex; flex-direction: column; gap: 12px;';
  
  // Repost option (repost to another community) - dark mode support
  const repostOption = document.createElement('button');
  repostOption.style.cssText = `padding: 16px; border: 2px solid ${modalBorder}; border-radius: 12px; background: ${modalBg}; cursor: pointer; text-align: left; transition: border-color 0.2s; color: ${modalText};`;
  repostOption.innerHTML = `
    <div style="font-weight: 600; margin-bottom: 4px; color: ${modalText};">Repost to another community</div>
    <div style="font-size: 14px; color: ${modalSecondaryText};">Share this message to another community</div>
  `;
  repostOption.addEventListener('mouseenter', () => {
    repostOption.style.borderColor = modalHoverBorder;
  });
  repostOption.addEventListener('mouseleave', () => {
    repostOption.style.borderColor = modalBorder;
  });
  repostOption.addEventListener('click', () => {
    showRepostToCommunityModal(message);
    modalContainer.remove();
  });
  
  // Quote post option - dark mode support
  const quoteOption = document.createElement('button');
  quoteOption.style.cssText = `padding: 16px; border: 2px solid ${modalBorder}; border-radius: 12px; background: ${modalBg}; cursor: pointer; text-align: left; transition: border-color 0.2s; color: ${modalText};`;
  quoteOption.innerHTML = `
    <div style="font-weight: 600; margin-bottom: 4px; color: ${modalText};">Quote post</div>
    <div style="font-size: 14px; color: ${modalSecondaryText};">Create a new message with a quote of this message</div>
  `;
  quoteOption.addEventListener('mouseenter', () => {
    quoteOption.style.borderColor = modalHoverBorder;
  });
  quoteOption.addEventListener('mouseleave', () => {
    quoteOption.style.borderColor = modalBorder;
  });
  quoteOption.addEventListener('click', () => {
    showQuotePostModal(message);
    modalContainer.remove();
  });
  
  typeSelection.appendChild(repostOption);
  typeSelection.appendChild(quoteOption);
  
  // Assemble modal
  modalContent.appendChild(modalHeader);
  modalContent.appendChild(messagePreview);
  modalContent.appendChild(typeSelection);
  modalContainer.appendChild(modalContent);
  document.body.appendChild(modalContainer);
  
  // Close on background click
  modalContainer.addEventListener('click', (e) => {
    if (e.target === modalContainer) {
      modalContainer.remove();
    }
  });
}

// Show repost to community modal
function showRepostToCommunityModal(message) {
  console.log('🔄 REPOST: Showing repost to community modal');
  // TODO: Implement community selection and repost
  alert('Repost to community functionality coming soon');
}

// Show quote post modal
function showQuotePostModal(message) {
  console.log('💬 QUOTE: Showing quote post modal for message:', message.id);
  
  // Create modal similar to reply modal but for quoting
  const modalContainer = document.createElement('div');
  modalContainer.id = 'quote-modal-container';
  modalContainer.style.cssText = 'position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); z-index: 10000; display: flex; align-items: center; justify-content: center;';
  
  const modalContent = document.createElement('div');
  modalContent.style.cssText = 'background: white; border-radius: 16px; width: 90%; max-width: 600px; max-height: 80vh; overflow-y: auto; display: flex; flex-direction: column;';
  
  // Header
  const modalHeader = document.createElement('div');
  modalHeader.style.cssText = 'padding: 16px; border-bottom: 1px solid #eee; display: flex; align-items: center; justify-content: space-between;';
  const closeBtn = document.createElement('button');
  closeBtn.innerHTML = '×';
  closeBtn.style.cssText = 'background: none; border: none; font-size: 28px; cursor: pointer; color: #666; padding: 0; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center;';
  closeBtn.addEventListener('click', () => {
    modalContainer.remove();
  });
  modalHeader.appendChild(closeBtn);
  
  // Message to quote (preview)
  const quotePreview = document.createElement('div');
  quotePreview.style.cssText = 'padding: 16px; border-bottom: 1px solid #eee; background: #f9f9f9;';
  const authorName = message.author?.name || message.user_email || 'Unknown';
  const messageBody = message.body || message.content || '';
  quotePreview.innerHTML = `
    <div style="padding: 12px; border-left: 3px solid #1da1f2; background: white; border-radius: 8px;">
      <div style="font-size: 12px; color: #666; margin-bottom: 4px;">Quoting</div>
      <strong>${authorName}</strong>
      <div style="margin-top: 4px; color: #333;">${messageBody}</div>
    </div>
  `;
  
  // Quote input area
  const inputArea = document.createElement('div');
  inputArea.style.cssText = 'padding: 16px; flex: 1; display: flex; flex-direction: column;';
  
  const quoteInput = document.createElement('textarea');
  quoteInput.id = 'quote-modal-input';
  quoteInput.placeholder = 'Add a comment...';
  quoteInput.style.cssText = 'width: 100%; min-height: 120px; padding: 12px; border: 1px solid #ddd; border-radius: 8px; font-size: 14px; resize: none; font-family: inherit;';
  quoteInput.focus();
  
  // Action buttons
  const actionBar = document.createElement('div');
  actionBar.style.cssText = 'margin-top: 12px; display: flex; justify-content: flex-end; gap: 8px;';
  
  const cancelBtn = document.createElement('button');
  cancelBtn.textContent = 'Cancel';
  cancelBtn.style.cssText = 'padding: 8px 16px; border: 1px solid #ddd; background: white; border-radius: 20px; cursor: pointer; font-weight: 600;';
  cancelBtn.addEventListener('click', () => {
    modalContainer.remove();
  });
  const sendBtn = document.createElement('button');
  sendBtn.textContent = 'Quote';
  sendBtn.style.cssText = 'padding: 8px 16px; border: none; background: #1da1f2; color: white; border-radius: 20px; cursor: pointer; font-weight: 600;';
  sendBtn.addEventListener('click', async () => {
    const quoteText = quoteInput.value.trim();
    
    if (!quoteText) {
      alert('Please enter a comment for your quote post');
      quoteInput.focus();
      return;
    }
    
    console.log('💬 QUOTE: Quote text from input:', quoteText);
    console.log('💬 QUOTE: Quote text length:', quoteText.length);
    
    try {
      await sendQuotePost(message.id, quoteText, message.community_id || message.communityId || 'comm-001');
      modalContainer.remove();
    } catch (err) {
      console.error('Error sending quote post:', err);
      alert('Failed to send quote post. Please try again.');
    }
  });
  actionBar.appendChild(cancelBtn);
  actionBar.appendChild(sendBtn);
  
  inputArea.appendChild(quoteInput);
  inputArea.appendChild(actionBar);
  
  // Assemble modal
  modalContent.appendChild(modalHeader);
  modalContent.appendChild(quotePreview);
  modalContent.appendChild(inputArea);
  modalContainer.innerHTML = '';
  modalContainer.appendChild(modalContent);
  
  // Close on background click
  modalContainer.addEventListener('click', (e) => {
    if (e.target === modalContainer) {
      modalContainer.remove();
    }
  });
  
  document.body.appendChild(modalContainer);
}

// Helper function to send quote post
async function sendQuotePost(quotedMessageId, quoteText, communityId) {
  console.log('💬 QUOTE: Sending quote post for message:', quotedMessageId);
  console.log('💬 QUOTE: Quote text length:', quoteText.length);
  
  const currentPageId = window.currentUrlData?.pageId || window.currentPage?.pageId;
  if (!currentPageId) {
    console.error('❌ QUOTE: No current page ID available');
    throw new Error('No current page ID available');
  }
  
  // Use sendChatMessage with quote_id
  if (window.sendChatMessage) {
    try {
      await window.sendChatMessage(quoteText, {
        quoteId: quotedMessageId,
        communityId: communityId,
        pageId: currentPageId
      });
      console.log('✅ QUOTE: Quote post sent successfully');
    } catch (error) {
      console.error('❌ QUOTE: Error sending quote post:', error);
      throw error;
    }
  } else {
    console.error('❌ QUOTE: sendChatMessage function not available');
    throw new Error('sendChatMessage function not available');
  }
}

// Export functions to window for diagnostic access
if (typeof window !== 'undefined') {
  window.showReplyModal = showReplyModal;
  window.sendReplyMessage = sendReplyMessage;
  window.handleRepost = handleRepost;
  window.sendQuotePost = sendQuotePost;
  console.log('✅ REPLY MODAL: Exported showReplyModal, sendReplyMessage, handleRepost, and sendQuotePost to window');
}

// Function to convert URLs to clickable links
function convertUrlsToLinks(text) {
  if (!text) return text;
  
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  return text.replace(urlRegex, '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>');
}
// COMP METHOD: Exact COMP reaction implementation
async function handleReaction(message) {
  const reactions = ['👍', '❓', '🔁', '🔗', '⚠️', '🙅'];
  
  // Find the reaction button that was clicked
  const reactionBtn = document.querySelector(`[data-message-id="${message.id}"].reaction-btn`);
  if (!reactionBtn) return;
  
  // Check if user is clicking on an existing reaction to remove it
  const currentReaction = reactionBtn.dataset.reaction;
  if (currentReaction && currentReaction !== '') {
    console.log('🔄 REACTION: User clicked existing reaction, removing it...');
    
    // Remove the reaction (preserve count span)
    const countSpan = reactionBtn.querySelector('.icon-count');
    const existingCountText = countSpan ? countSpan.outerHTML : '';
    const blankReactIcon = `<svg viewBox="0 0 24 24" aria-hidden="true" style="width: 18px; height: 18px; fill: currentColor;"><g><path d="M16.697 5.5c-1.222-.06-2.679.51-3.89 2.16l-.805 1.09-.806-1.09C9.984 6.01 8.526 5.44 7.304 5.5c-1.243.07-2.349.78-2.91 1.91-.552 1.12-.633 2.78.479 4.82 1.074 1.97 3.257 4.27 7.129 6.61 3.87-2.34 6.052-4.64 7.126-6.61 1.111-2.04 1.03-3.7.477-4.82-.561-1.13-1.666-1.84-2.908-1.91zm4.187 7.69c-1.351 2.48-4.001 5.12-8.379 7.67l-.503.3-.504-.3c-4.379-2.55-7.029-5.19-8.382-7.67-1.36-2.5-1.41-4.86-.514-6.67.887-1.79 2.647-2.91 4.601-3.01 1.651-.09 3.368.56 4.798 2.01 1.429-1.45 3.146-2.1 4.796-2.01 1.954.1 3.714 1.22 4.601 3.01.896 1.81.846 4.17-.514 6.67z"></path></g></svg>`;
    reactionBtn.innerHTML = blankReactIcon + existingCountText;
    reactionBtn.dataset.reaction = '';
    
    // CRITICAL FIX: Reload reactions to get accurate count from database
    console.log('🔧 REACTIONS: COMP METHOD - Reloading reactions after removal for accurate count');
    window.loadMessageReactions(message.id, reactionBtn);
    
    // Send remove reaction event
    try {
      const userId = window.currentUser?.id || window.currentUser?.user_id;
      const reactionData = {
        message_id: message.id,
        user_id: userId,
        emoji: '',
        timestamp: new Date().toISOString()
      };
      
      console.log('Reaction removed:', reactionData);
      
      // Emit real-time event for reaction removal
      if (window.reactionsIntegration && window.reactionsIntegration.isInitialized) {
        window.reactionsIntegration.removeReaction(message.id, currentReaction);
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
  modal.style.top = `${rect.top - 60}px`; // Position above button
  modal.style.zIndex = '99999'; // Higher z-index
  modal.style.display = 'block';
  modal.style.background = 'white';
  modal.style.border = '2px solid #007bff'; // More visible border
  modal.style.borderRadius = '8px';
  modal.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.3)'; // Stronger shadow
  modal.style.padding = '12px';
  modal.style.minWidth = '200px';
  modal.style.maxWidth = '300px';
  
  console.log('🔧 REACTIONS: COMP METHOD - Creating modal with reactions:', reactions);
  console.log('🔧 REACTIONS: COMP METHOD - Modal HTML:', modal.innerHTML);
  console.log('🔧 REACTIONS: COMP METHOD - Button rect:', rect);
  console.log('🔧 REACTIONS: COMP METHOD - Modal position:', modal.style.left, modal.style.top);
  
  // Add modal to page
  document.body.appendChild(modal);
  
  console.log('🔧 REACTIONS: COMP METHOD - Modal added to DOM, checking visibility...');
  console.log('🔧 REACTIONS: COMP METHOD - Modal display:', modal.style.display);
  console.log('🔧 REACTIONS: COMP METHOD - Modal position:', modal.style.position);
  console.log('🔧 REACTIONS: COMP METHOD - Modal z-index:', modal.style.zIndex);
  console.log('🔧 REACTIONS: COMP METHOD - Modal computed style:', window.getComputedStyle(modal).display);
  // Add click handlers for reaction options
  modal.querySelectorAll('.reaction-option').forEach(option => {
    option.addEventListener('click', async (e) => {
      const selectedReaction = e.target.dataset.reaction;
      
      console.log('🔧 REACTIONS: COMP METHOD - Selected reaction:', selectedReaction);
      
      // Update the reaction button with the selected reaction
      reactionBtn.textContent = selectedReaction;
      reactionBtn.dataset.reaction = selectedReaction;
      
      // Remove modal
      if (modal.parentNode) {
        document.body.removeChild(modal);
      }
      
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
        const userId = window.currentUser?.id || window.currentUser?.user_id;
        const reactionData = {
          message_id: message.id,
          user_id: userId,
          emoji: selectedReaction,
          timestamp: new Date().toISOString()
        };
        
        // For now, just log the reaction - in a real system, this would be stored
        console.log('Reaction added:', reactionData);
        
        // Emit real-time event for reaction addition
        if (window.reactionsIntegration && window.reactionsIntegration.isInitialized) {
          window.reactionsIntegration.addReaction(message.id, selectedReaction);
        }
        
      } catch (error) {
        console.error('❌ REACTION: Failed to add reaction:', error);
      }
    });
  });
  
  // Add click-outside handler to close modal
  setTimeout(() => {
    document.addEventListener('click', function closeModal(e) {
      if (!modal.contains(e.target) && e.target !== reactionBtn) {
        console.log('🔧 REACTIONS: COMP METHOD - Clicking outside modal, closing...');
        if (modal.parentNode) {
          document.body.removeChild(modal);
        }
        document.removeEventListener('click', closeModal);
      }
    });
  }, 100);
}

// COMP METHOD: Add CSS for reply styling
const replyStyle = document.createElement('style');
replyStyle.textContent = `
  .reply-message {
    position: relative;
  }
  .reply-message::before {
    content: '';
    position: absolute;
    left: -4px;
    top: 0;
    bottom: 0;
    width: 4px;
    background: ${window.AVATAR_FALLBACK_COLOR};
    border-radius: 2px;
  }
  .has-replies {
    position: relative;
  }
  .has-replies::after {
    content: '';
    position: absolute;
    left: 0;
    bottom: -2px;
    width: 100%;
    height: 2px;
    background: #e9ecef;
  }
`;
document.head.appendChild(replyStyle);

// Export for global access - CRITICAL: Export immediately when module loads
console.log('🔍 CANOPI: About to export functions to window');
window.CanopiModule = CanopiModule;
window.loadChatHistory = loadChatHistory;
console.log('✅ CANOPI: loadChatHistory exported to window:', typeof window.loadChatHistory);
window.addMessageToChat = addMessageToChat;
window.sendMessageViaSupabase = sendMessageViaSupabase;
window.updateMessageInChat = updateMessageInChat;

// Ensure loadChatHistory is available immediately
console.log('✅ CANOPI: loadChatHistory exported to window:', typeof window.loadChatHistory);
console.log('✅ CANOPI: loadChatHistory function available:', !!window.loadChatHistory);
window.removeMessageFromChat = removeMessageFromChat;
window.checkAndAddThreadToggle = checkAndAddThreadToggle;
window.setupMessageInputEventListeners = setupMessageInputEventListeners;
window.sendChatMessage = sendChatMessage;
window.convertUrlsToLinks = convertUrlsToLinks;
window.updateMessageVisualHierarchy = updateMessageVisualHierarchy;

// NOTE: addMessageActionListeners and handleMessageFocus are defined later in the file
// They will be exported at the end of the file after they are defined

// COMP METHOD: Add reply handling functions
window.handleReply = function(message) {
  console.log('🔧 REPLIES: COMP METHOD - Handling reply for message:', message.id);
  
  // Focus the message input
  const messageInput = document.querySelector('#message-input, .message-input, input[type="text"], #chat-textarea');
  if (messageInput) {
    messageInput.focus();
    messageInput.value = `@${message.author?.name || 'User'} `;
    console.log('✅ REPLIES: COMP METHOD - Message input focused for reply');
  } else {
    console.error('❌ REPLIES: COMP METHOD - Message input not found');
  }
};

// COMP METHOD: Add thread toggle function
// FOCUS MODE ONLY: Toggle thread replies (disabled in default mode)
window.toggleThreadReplies = function(conversationId, messageDiv) {
  console.log('🔧 REPLIES: COMP METHOD - Toggling thread replies for conversation:', conversationId);

  // DEFAULT MODE: No reply toggling - replies are always visible in default mode
  const chatMessages = messageDiv.closest('.chat-messages');
  const isInFocusMode = chatMessages && chatMessages.classList.contains('focus-messages-container');
  if (!isInFocusMode) {
    console.log('📝 DEFAULT MODE: Reply toggling disabled - all messages visible');
    return;
  }

  // FOCUS MODE: Apply reply toggling
  const toggleBtn = messageDiv.querySelector('.thread-toggle-btn');
  if (!toggleBtn) return;

  const isExpanded = toggleBtn.dataset.expanded === 'true';
  toggleBtn.dataset.expanded = !isExpanded;

  if (isExpanded) {
    // Hide replies
    const replies = messageDiv.querySelectorAll('.thread-reply');
    replies.forEach(reply => reply.style.display = 'none');
    toggleBtn.innerHTML = '📂<span class="icon-count">' + (toggleBtn.querySelector('.icon-count')?.textContent || '0') + '</span>';
  } else {
    // Show replies
    const replies = messageDiv.querySelectorAll('.thread-reply');
    replies.forEach(reply => reply.style.display = 'block');
    toggleBtn.innerHTML = '📂<span class="icon-count">' + (toggleBtn.querySelector('.icon-count')?.textContent || '0') + '</span>';
  }

  console.log('✅ REPLIES: COMP METHOD - Thread toggled:', !isExpanded);
};
// COMP METHOD: Add reaction handling function
window.handleReaction = async function(message) {
  console.log('🔧 REACTIONS: COMP METHOD - Handling reaction for message:', message.id);
  
  try {
    // Get current user
    const currentUser = window.currentUser || { id: 'unknown', user_id: 'unknown' };
    
    // Check if user already reacted
    const existingReactions = message.reactions || [];
    const userReaction = existingReactions.find(r => (r.AppUser?.id || r.user_id) === (currentUser.id || currentUser.user_id));
    
    if (userReaction) {
      // Remove reaction
      console.log('🔧 REACTIONS: COMP METHOD - Removing reaction');
      await window.removeReaction(message.id, userReaction.emoji);
    } else {
      // Add reaction
      console.log('🔧 REACTIONS: COMP METHOD - Adding reaction');
      await window.addReaction(message.id, 'like');
    }
    
  } catch (error) {
    console.error('❌ REACTIONS: COMP METHOD - Error handling reaction:', error);
  }
};
// COMP METHOD: Add reaction function
window.addReaction = async function(messageId, reactionType) {
  console.log('🔧 REACTIONS: COMP METHOD - Adding reaction:', reactionType, 'to message:', messageId);
  
  try {
    const currentUser = window.currentUser || { id: 'unknown', user_id: 'unknown' };
    
    // Use centralized API client (adds identity headers)
    const response = await window.api.request('/v1/reactions', {
      method: 'POST',
      body: JSON.stringify({
        messageId: messageId,
        emoji: reactionType
      })
    });
    
    if (response.ok) {
      const result = await response.json();
      console.log('✅ REACTIONS: COMP METHOD - Reaction added successfully:', result);
      
      // Refresh message reactions
      await window.loadMessageReactions(messageId);
    } else {
      console.error('❌ REACTIONS: COMP METHOD - Failed to add reaction:', response.status);
    }
    
  } catch (error) {
    console.error('❌ REACTIONS: COMP METHOD - Error adding reaction:', error);
    throw error;
  }
};

// COMP METHOD: Remove reaction function
window.removeReaction = async function(messageId, reactionType) {
  console.log('🔧 REACTIONS: COMP METHOD - Removing reaction:', reactionType, 'from message:', messageId);
  
  try {
    const currentUser = window.currentUser || { id: 'unknown', user_id: 'unknown' };
    
    // Use centralized API client (adds identity headers)
    const response = await window.api.request('/v1/reactions', {
      method: 'POST',
      body: JSON.stringify({
        messageId: messageId,
        emoji: reactionType
      })
    });
    
    if (response.ok) {
      const result = await response.json();
      console.log('✅ REACTIONS: COMP METHOD - Reaction toggled successfully:', result);
      
      // Refresh message reactions
      await window.loadMessageReactions(messageId);
    } else {
      console.error('❌ REACTIONS: COMP METHOD - Failed to toggle reaction:', response.status);
    }
    
  } catch (error) {
    console.error('❌ REACTIONS: COMP METHOD - Error removing reaction:', error);
  }
};

// COMP METHOD: Load message reactions from database (exact COMP approach)
window.loadMessageReactions = async function(messageId, reactionBtn = null) {
  console.log('🔧 REACTIONS: COMP METHOD - Loading reactions for message:', messageId);

  try {
    // Load reactions from backend API (bypasses RLS)
    console.log('🔧 REACTIONS: Loading reactions from backend API');
    
    const result = await window.api.request(`/v1/reactions/${messageId}`);
    const reactions = result.reactions || [];
    
    console.log('✅ REACTIONS: Loaded reactions from backend API:', reactions);

    // Update reaction display with loaded reactions
    await window.updateReactionDisplay(messageId, reactions);

  } catch (error) {
    // Only log as error if it's not a connection error (connection errors already handled by APIModule)
    const isConnectionError = error.message && (
      error.message.includes('Failed to fetch') || 
      error.message.includes('ERR_CONNECTION_REFUSED') ||
      error.name === 'TypeError' && error.message.includes('fetch')
    );
    
    if (!isConnectionError) {
      console.error('❌ REACTIONS: COMP METHOD - Error loading reactions:', error);
    } else {
      // Connection error - backend offline, use fallback gracefully
      console.log('⚠️ REACTIONS: Backend offline, using empty reactions');
    }
    // COMP METHOD: Fallback to empty array (works offline)
    await window.updateReactionDisplay(messageId, []);
  }
};

/**
 * COMP METHOD: Update reaction display
 * CanopiModule: Updates reaction display for a message
 * SD3: Enhanced to search focus mode container first, then fallback to main container
 * 
 * @param {string} messageId - Message ID to update
 * @param {Array} reactions - Array of reaction objects
 * @param {HTMLElement|null} reactionBtn - Optional reaction button element
 */
window.updateReactionDisplay = async function(messageId, reactions, reactionBtn = null) {
  console.log('🔧 REACTIONS: COMP METHOD - Updating reaction display for message:', messageId);
  console.log('🔧 REACTIONS: Reactions to display:', reactions);
  
  // CRITICAL FIX: Search in focus mode container first, then fallback to main container
  // SD3: Enhanced search strategy for focus mode compatibility with retry logic
  let messageElement = null;
    
    // Try focus mode container first
    const focusContainer = document.querySelector('.focus-messages-container');
    if (focusContainer) {
      messageElement = focusContainer.querySelector(`[data-message-id="${messageId}"]`);
      if (messageElement) {
        console.log(`✅ REACTIONS: Found message in focus container: ${messageId}`);
      }
    }
    
    // Fallback to main container
    if (!messageElement) {
      const mainContainer = document.querySelector('#discuss-tab .chat-messages');
      if (mainContainer) {
        messageElement = mainContainer.querySelector(`[data-message-id="${messageId}"]`);
        if (messageElement) {
          console.log(`✅ REACTIONS: Found message in main container: ${messageId}`);
        }
      }
    }
    
    // Last resort: search entire document
    if (!messageElement) {
      messageElement = document.querySelector(`[data-message-id="${messageId}"]`);
      if (messageElement) {
        console.log(`✅ REACTIONS: Found message via document query: ${messageId}`);
      }
    }
    
    // SD3 FIX: Retry logic if message not found (timing issue - DOM not ready yet)
    if (!messageElement) {
      console.warn(`⚠️ REACTIONS: Message element not found for ${messageId}, retrying in 200ms...`);
      setTimeout(async () => {
        let retryElement = null;
        if (focusContainer) {
          retryElement = focusContainer.querySelector(`[data-message-id="${messageId}"]`);
        }
        if (!retryElement) {
          retryElement = document.querySelector(`[data-message-id="${messageId}"]`);
        }
        if (retryElement && typeof window.updateReactionDisplay === 'function') {
          console.log(`✅ REACTIONS: Found message on retry: ${messageId}`);
          await window.updateReactionDisplay(messageId, reactions, reactionBtn);
        } else {
          console.warn(`⚠️ REACTIONS: Message still not found after retry: ${messageId}`);
        }
      }, 200);
      return; // Return early, retry will handle it
    }
  
  // CRITICAL FIX: Use provided reactionBtn or find it
  if (!reactionBtn) {
    reactionBtn = messageElement.querySelector('.reaction-btn');
  }
  if (!reactionBtn) {
    console.warn('⚠️ REACTIONS: Reaction button not found for:', messageId);
    return;
  }
  
  // COMP METHOD: Find current user's reaction (only one per user)
  const currentUserId = window.currentUser?.id || window.currentUser?.user_id;
  const currentUserEmail = window.currentUser?.email;
  
  // ROOT CAUSE FIX: Enhanced debugging for user ID mismatch issues
  // CRITICAL: Warn if currentUserId is the same across different profiles
  if (currentUserEmail && currentUserId) {
    const storedEmailKey = `lastUserEmail_${currentUserId}`;
    const lastEmail = sessionStorage.getItem(storedEmailKey);
    if (lastEmail && lastEmail !== currentUserEmail) {
      console.error('🚨 REACTIONS: USER ID MISMATCH DETECTED!');
      console.error('🚨 Same user ID', currentUserId, 'used by different emails:');
      console.error('   Previous email:', lastEmail);
      console.error('   Current email:', currentUserEmail);
      console.error('🚨 This causes reactions to display identically across profiles!');
    }
    sessionStorage.setItem(storedEmailKey, currentUserEmail);
  }
  // Debug: Log all reaction user IDs for comparison
  console.log('🔧 REACTIONS: Current user ID:', currentUserId);
  console.log('🔧 REACTIONS: Current user ID type:', typeof currentUserId);
  console.log('🔧 REACTIONS: Current user email:', currentUserEmail);
  console.log('🔧 REACTIONS: Reaction user IDs:', reactions.map(r => {
    const reactionUserId = r.AppUser?.id || r.user_id;
    const matches = currentUserId && reactionUserId ? String(reactionUserId) === String(currentUserId) : false;
    return {
      AppUser_id: r.AppUser?.id,
      user_id: r.user_id,
      AppUser_email: r.AppUser?.email,
      emoji: r.emoji,
      reactionUserId: reactionUserId,
      currentUserId: currentUserId,
      matches: matches
    };
  }));
  
  // ROOT CAUSE FIX: Find user reaction by ID - must match exactly
  // Ensure strict UUID comparison - no fuzzy matching
  const userReaction = reactions.find(r => {
    const reactionUserId = r.AppUser?.id || r.user_id;
    // Normalize both IDs to strings for comparison
    if (!reactionUserId || !currentUserId) {
      return false;
    }
    const reactionIdStr = String(reactionUserId).trim();
    const currentIdStr = String(currentUserId).trim();
    const matches = reactionIdStr === currentIdStr;
    if (matches) {
      console.log('🔧 REACTIONS: MATCH FOUND - Reaction user ID matches current user ID:', reactionIdStr);
    }
    return matches;
  });
  
  console.log('🔧 REACTIONS: User reaction found:', userReaction ? 'YES' : 'NO');
  console.log('🔧 REACTIONS: User reaction emoji:', userReaction?.emoji);
  if (!userReaction && currentUserId) {
    console.log('🔧 REACTIONS: No match found - current user ID:', currentUserId, 'did not match any reaction user IDs');
  }
  
  // Aggregate reactions by emoji type
  const reactionCounts = {};
  reactions.forEach(reaction => {
    if (!reactionCounts[reaction.emoji]) {
      reactionCounts[reaction.emoji] = 0;
    }
    reactionCounts[reaction.emoji]++;
  });
  
  console.log('🔧 REACTIONS: Reaction counts by emoji:', reactionCounts);
  
  // Calculate total reaction count
  const totalReactionCount = reactions.length;
  
  // CRITICAL USER PREFERENCE: Show user's own reaction if they have one, otherwise ALWAYS blank (heart SVG)
  // NEVER show other users' reactions when current user has no reaction - user explicitly does not want this
  const blankReactIcon = `<svg viewBox="0 0 24 24" aria-hidden="true" style="width: 18px; height: 18px; fill: currentColor;"><g><path d="M16.697 5.5c-1.222-.06-2.679.51-3.89 2.16l-.805 1.09-.806-1.09C9.984 6.01 8.526 5.44 7.304 5.5c-1.243.07-2.349.78-2.91 1.91-.552 1.12-.633 2.78.479 4.82 1.074 1.97 3.257 4.27 7.129 6.61 3.87-2.34 6.052-4.64 7.126-6.61 1.111-2.04 1.03-3.7.477-4.82-.561-1.13-1.666-1.84-2.908-1.91zm4.187 7.69c-1.351 2.48-4.001 5.12-8.379 7.67l-.503.3-.504-.3c-4.379-2.55-7.029-5.19-8.382-7.67-1.36-2.5-1.41-4.86-.514-6.67.887-1.79 2.647-2.91 4.601-3.01 1.651-.09 3.368.56 4.798 2.01 1.429-1.45 3.146-2.1 4.796-2.01 1.954.1 3.714 1.22 4.601 3.01.896 1.81.846 4.17-.514 6.67z"></path></g></svg>`;
  let displayEmoji = blankReactIcon; // Default blank state
  if (userReaction) {
    // User has a reaction - show it
    displayEmoji = userReaction.emoji;
    console.log('🔧 REACTIONS: COMP METHOD - Showing user\'s own reaction:', displayEmoji);
  } else {
    // User has NO reaction - ALWAYS show blank (heart SVG), regardless of other users' reactions
    displayEmoji = blankReactIcon;
    console.log('🔧 REACTIONS: COMP METHOD - User has no reaction, showing blank (heart SVG)');
  }
  
  // ROOT CAUSE FIX: Preserve user's optimistic selection only if they JUST added a reaction
  // Do NOT preserve if they removed a reaction (should show blank)
  // CRITICAL: Only check userSelectedEmoji if userReaction doesn't exist (DB hasn't synced yet)
  const userSelectedEmoji = reactionBtn.dataset.selectedEmoji;
  const lastUpdated = parseInt(reactionBtn.dataset.lastUpdated) || 0;
  const timeSinceUpdate = Date.now() - lastUpdated;
  const shouldPreserveUserSelection = userSelectedEmoji && !userReaction && timeSinceUpdate < 3000;
  
  // ROOT CAUSE FIX: Preserve optimistic selection only if user just added (not removed) a reaction
  // CRITICAL: Only override displayEmoji if userReaction doesn't exist (user hasn't reacted yet in DB)
  // We already set displayEmoji to '🔘' above if no userReaction - only override for optimistic updates
  if (!userReaction) {
    // No user reaction in DB - check if we should preserve optimistic selection (user just added)
    if (shouldPreserveUserSelection) {
      displayEmoji = userSelectedEmoji;
      console.log('🔧 REACTIONS: Preserving user selection', userSelectedEmoji, 'while DB syncs');
    }
    // Otherwise displayEmoji is already '🔘' from above (user preference: never show others' reactions)
  }
  // CRITICAL: If userReaction exists, displayEmoji is already correctly set to userReaction.emoji above
  // DO NOT override it!
  
  const countSpan = reactionBtn.querySelector('.icon-count');
  const existingCountText = countSpan ? countSpan.outerHTML : '';
  
  // Update the emoji while preserving the count span
  reactionBtn.innerHTML = displayEmoji;
  if (countSpan) {
    reactionBtn.appendChild(countSpan);
  } else if (totalReactionCount > 0) {
    const newCountSpan = document.createElement('span');
    newCountSpan.className = 'icon-count';
    newCountSpan.style.cssText = 'font-size: 9px; margin-left: 2px; font-weight: normal; color: #666;';
    newCountSpan.textContent = totalReactionCount;
    newCountSpan.style.display = 'inline';
    reactionBtn.appendChild(newCountSpan);
  }
  
  // CRITICAL FIX: Always preserve user's selected emoji if they just selected it
  if (userReaction) {
    // User reaction found in DB - use it
    reactionBtn.dataset.reaction = userReaction.emoji;
    reactionBtn.dataset.selectedEmoji = userReaction.emoji;
    console.log('✅ REACTIONS: Using user reaction from DB:', userReaction.emoji);
  } else if (userSelectedEmoji && (Date.now() - (parseInt(reactionBtn.dataset.lastUpdated) || 0)) < 3000) {
    // User just selected - preserve it even if not in DB yet
    reactionBtn.dataset.selectedEmoji = userSelectedEmoji;
    reactionBtn.dataset.reaction = userSelectedEmoji;
    console.log('✅ REACTIONS: Preserving user selection:', userSelectedEmoji);
  } else {
    // No user reaction and no recent selection - clear
    reactionBtn.dataset.reaction = '';
    reactionBtn.dataset.selectedEmoji = '';
  }
  reactionBtn.dataset.lastUpdated = Date.now().toString();
  
  // Update reaction count - show total count of all reactions
  const updatedCountSpan = reactionBtn.querySelector('.icon-count');
  if (updatedCountSpan) {
    updatedCountSpan.textContent = totalReactionCount > 0 ? totalReactionCount : '';
    updatedCountSpan.style.display = totalReactionCount > 0 ? 'inline' : 'none';
    console.log('🔧 REACTIONS: Updated count span - text:', updatedCountSpan.textContent, 'display:', updatedCountSpan.style.display);
  } else {
    // COMP METHOD: Create count span if it doesn't exist
    const countSpan = document.createElement('span');
    countSpan.className = 'icon-count';
    countSpan.style.cssText = 'font-size: 9px; margin-left: 2px; font-weight: normal; color: #666;';
    countSpan.textContent = totalReactionCount > 0 ? totalReactionCount : '';
    countSpan.style.display = totalReactionCount > 0 ? 'inline' : 'none';
    reactionBtn.appendChild(countSpan);
    console.log('🔧 REACTIONS: Created new count span - text:', countSpan.textContent, 'display:', countSpan.style.display);
  }
  
  console.log('🔧 REACTIONS: Updated display - emoji:', displayEmoji, 'count:', totalReactionCount);
  console.log('🔧 REACTIONS: User reaction:', userReaction ? userReaction.emoji : 'none');
  
  console.log('✅ REACTIONS: COMP METHOD - Reaction display updated');
};

// BOOKMARK FUNCTIONS
// Load bookmarks for a message (count and user's bookmark status)
window.loadMessageBookmarks = async function(messageId, bookmarkBtn = null) {
  console.log('🔧 BOOKMARKS: Loading bookmarks for message:', messageId);

  try {
    if (!window.api) {
      console.warn('⚠️ BOOKMARKS: API module not available');
      return;
    }

    const result = await window.api.request(`/v1/bookmarks/${messageId}`);
    
    if (!result) {
      console.warn('⚠️ BOOKMARKS: No result from API (backend may be offline)');
      return;
    }

    const bookmarkCount = result.count || 0;
    const isBookmarked = result.isBookmarked || false;

    console.log('✅ BOOKMARKS: Loaded bookmarks - count:', bookmarkCount, 'isBookmarked:', isBookmarked);

    // Update bookmark display
    await window.updateBookmarkDisplay(messageId, bookmarkCount, isBookmarked);

  } catch (error) {
    const isConnectionError = error.message && (
      error.message.includes('Failed to fetch') || 
      error.message.includes('ERR_CONNECTION_REFUSED') ||
      error.name === 'TypeError' && error.message.includes('fetch')
    );
    
    if (!isConnectionError) {
      console.error('❌ BOOKMARKS: Error loading bookmarks:', error);
    } else {
      console.log('⚠️ BOOKMARKS: Backend offline, using default state');
    }
    // Fallback to default state (not bookmarked, count 0)
    await window.updateBookmarkDisplay(messageId, 0, false);
  }
};
/**
 * Update bookmark display
 * CanopiModule: Updates bookmark display for a message
 * SD3: Enhanced to search focus mode container first, then fallback to main container
 * 
 * @param {string} messageId - Message ID to update
 * @param {number} bookmarkCount - Number of bookmarks
 * @param {boolean} isBookmarked - Whether the message is bookmarked by current user
 */
window.updateBookmarkDisplay = async function(messageId, bookmarkCount, isBookmarked) {
  console.log('🔧 BOOKMARKS: Updating bookmark display for message:', messageId, 'count:', bookmarkCount, 'isBookmarked:', isBookmarked);
  
  // CRITICAL FIX: Search in focus mode container first, then fallback to main container
  // SD3: Enhanced search strategy for focus mode compatibility with retry logic
  let messageElement = null;
    
    // Try focus mode container first
    const focusContainer = document.querySelector('.focus-messages-container');
    if (focusContainer) {
      messageElement = focusContainer.querySelector(`[data-message-id="${messageId}"]`);
      if (messageElement) {
        console.log(`✅ BOOKMARKS: Found message in focus container: ${messageId}`);
      }
    }
    
    // Fallback to main container
    if (!messageElement) {
      const mainContainer = document.querySelector('#discuss-tab .chat-messages');
      if (mainContainer) {
        messageElement = mainContainer.querySelector(`[data-message-id="${messageId}"]`);
        if (messageElement) {
          console.log(`✅ BOOKMARKS: Found message in main container: ${messageId}`);
        }
      }
    }
    
    // Last resort: search entire document
    if (!messageElement) {
      messageElement = document.querySelector(`[data-message-id="${messageId}"]`);
      if (messageElement) {
        console.log(`✅ BOOKMARKS: Found message via document query: ${messageId}`);
      }
    }
    
    // SD3 FIX: Retry logic if message not found (timing issue - DOM not ready yet)
    if (!messageElement) {
      console.warn(`⚠️ BOOKMARKS: Message element not found for ${messageId}, retrying in 200ms...`);
      setTimeout(async () => {
        let retryElement = null;
        if (focusContainer) {
          retryElement = focusContainer.querySelector(`[data-message-id="${messageId}"]`);
        }
        if (!retryElement) {
          retryElement = document.querySelector(`[data-message-id="${messageId}"]`);
        }
        if (retryElement && typeof window.updateBookmarkDisplay === 'function') {
          console.log(`✅ BOOKMARKS: Found message on retry: ${messageId}`);
          await window.updateBookmarkDisplay(messageId, bookmarkCount, isBookmarked);
        } else {
          console.warn(`⚠️ BOOKMARKS: Message still not found after retry: ${messageId}`);
        }
      }, 200);
      return; // Return early, retry will handle it
    }
  
  const bookmarkBtn = messageElement.querySelector('.bookmark-btn');
  if (!bookmarkBtn) {
    console.warn('⚠️ BOOKMARKS: Bookmark button not found for message:', messageId);
    return;
  }

  // Bookmark icons
  const bookmarkIconInactive = `<svg viewBox="0 0 24 24" aria-hidden="true" style="width: 18px; height: 18px; fill: currentColor;"><g><path d="M4 4.5C4 3.12 5.119 2 6.5 2h11C18.881 2 20 3.12 20 4.5v18.44l-8-5.71-8 5.71V4.5zM6.5 4c-.276 0-.5.22-.5.5v14.56l6-4.29 6 4.29V4.5c0-.28-.224-.5-.5-.5h-11z"></path></g></svg>`;
  const bookmarkIconActive = `<svg viewBox="0 0 24 24" aria-hidden="true" style="width: 18px; height: 18px; fill: currentColor;"><g><path d="M4 4.5C4 3.12 5.119 2 6.5 2h11C18.881 2 20 3.12 20 4.5v18.44l-8-5.71-8 5.71V4.5z"></path></g></svg>`;

  // Update icon
  const iconToUse = isBookmarked ? bookmarkIconActive : bookmarkIconInactive;
  const bookmarkIconElement = bookmarkBtn.querySelector('svg');
  if (bookmarkIconElement) {
    bookmarkIconElement.outerHTML = iconToUse;
  } else {
    // Icon not found, replace entire button content
    bookmarkBtn.innerHTML = iconToUse;
  }

  // Update count display
  let countSpan = bookmarkBtn.querySelector('.bookmark-count');
  if (bookmarkCount > 0) {
    if (!countSpan) {
      countSpan = document.createElement('span');
      countSpan.className = 'icon-count bookmark-count';
      countSpan.style.cssText = 'font-size: 10px; margin-left: 2px; font-weight: 500; color: #666;';
      bookmarkBtn.appendChild(countSpan);
    }
    countSpan.textContent = bookmarkCount;
    countSpan.style.display = 'inline';
  } else {
    if (countSpan) {
      countSpan.remove();
    }
  }

  // Update button state
  if (isBookmarked) {
    bookmarkBtn.classList.add('active');
    bookmarkBtn.dataset.isBookmarked = 'true';
    bookmarkBtn.style.color = '#1da1f2';
  } else {
    bookmarkBtn.classList.remove('active');
    bookmarkBtn.dataset.isBookmarked = 'false';
    bookmarkBtn.style.color = '#666';
  }

  console.log('✅ BOOKMARKS: Bookmark display updated');
};

// Handle bookmark toggle
async function handleBookmarkToggle(messageId, bookmarkBtn) {
  console.log('🔧 BOOKMARKS: Toggling bookmark for message:', messageId);

  if (!window.api) {
    console.error('❌ BOOKMARKS: API module not available');
    return;
  }

  const currentIsBookmarked = bookmarkBtn.dataset.isBookmarked === 'true';
  
  // Optimistic update - toggle immediately in UI
  const newIsBookmarked = !currentIsBookmarked;
  bookmarkBtn.dataset.isBookmarked = newIsBookmarked.toString();
  
  // Update UI optimistically
  const bookmarkIconInactive = `<svg viewBox="0 0 24 24" aria-hidden="true" style="width: 18px; height: 18px; fill: currentColor;"><g><path d="M4 4.5C4 3.12 5.119 2 6.5 2h11C18.881 2 20 3.12 20 4.5v18.44l-8-5.71-8 5.71V4.5zM6.5 4c-.276 0-.5.22-.5.5v14.56l6-4.29 6 4.29V4.5c0-.28-.224-.5-.5-.5h-11z"></path></g></svg>`;
  const bookmarkIconActive = `<svg viewBox="0 0 24 24" aria-hidden="true" style="width: 18px; height: 18px; fill: currentColor;"><g><path d="M4 4.5C4 3.12 5.119 2 6.5 2h11C18.881 2 20 3.12 20 4.5v18.44l-8-5.71-8 5.71V4.5z"></path></g></svg>`;
  
  const iconToUse = newIsBookmarked ? bookmarkIconActive : bookmarkIconInactive;
  const bookmarkIconElement = bookmarkBtn.querySelector('svg');
  if (bookmarkIconElement) {
    bookmarkIconElement.outerHTML = iconToUse;
  }

  if (newIsBookmarked) {
    bookmarkBtn.classList.add('active');
    bookmarkBtn.style.color = '#1da1f2';
  } else {
    bookmarkBtn.classList.remove('active');
    bookmarkBtn.style.color = '#666';
  }

  try {
    // Call API to toggle bookmark
    const result = await window.api.request('/v1/bookmarks/toggle', {
      method: 'POST',
      body: JSON.stringify({ messageId: messageId })
    });

    if (!result) {
      console.warn('⚠️ BOOKMARKS: No result from API (backend may be offline), reverting optimistic update');
      // Revert optimistic update
      await window.loadMessageBookmarks(messageId, bookmarkBtn);
      return;
    }

    console.log('✅ BOOKMARKS: Toggle result:', result);
    
    // Update with actual result from server
    await window.updateBookmarkDisplay(messageId, result.count || 0, result.isBookmarked || false);
    
  } catch (error) {
    console.error('❌ BOOKMARKS: Error toggling bookmark:', error);
    // Revert optimistic update on error
    await window.loadMessageBookmarks(messageId, bookmarkBtn);
  }
}

// Make function globally available
window.handleBookmarkToggle = handleBookmarkToggle;

// COMP METHOD: Force refresh all reaction displays
window.refreshAllReactionDisplays = async function() {
  console.log('🔧 REACTIONS: COMP METHOD - Force refreshing all reaction displays');
  
  const reactionButtons = document.querySelectorAll('.reaction-btn');
  console.log('🔧 REACTIONS: Found', reactionButtons.length, 'reaction buttons to refresh');
  
  for (const reactionBtn of reactionButtons) {
    const messageId = reactionBtn.dataset.messageId;
    if (messageId) {
      console.log('🔧 REACTIONS: Refreshing display for message:', messageId);
      await window.loadMessageReactions(messageId, reactionBtn);
    }
  }
  
  console.log('✅ REACTIONS: COMP METHOD - All reaction displays refreshed');
};
// COMP METHOD: Refresh all reaction counts on page load
window.refreshAllReactionCounts = async function() {
  console.log('🔧 REACTIONS: COMP METHOD - Refreshing all reaction counts');
  
  const reactionButtons = document.querySelectorAll('.reaction-btn');
  console.log('🔧 REACTIONS: Found', reactionButtons.length, 'reaction buttons');
  
  for (const reactionBtn of reactionButtons) {
    const messageId = reactionBtn.dataset.messageId;
    if (messageId) {
      console.log('🔧 REACTIONS: Refreshing reactions for message:', messageId);
      await window.loadMessageReactions(messageId, reactionBtn);
    }
  }
  
  console.log('✅ REACTIONS: COMP METHOD - All reaction counts refreshed');
};

// ===== COMP METHOD: API ERROR HANDLING AND LOCAL STORAGE FALLBACKS =====

// COMP METHOD: Override addReaction with local storage fallback
if (typeof window.addReaction === 'function') {
  const originalAddReaction = window.addReaction;
  
  window.addReaction = async function(messageId, reactionType) {
    console.log('🔧 REACTIONS API: COMP METHOD - Adding reaction with fallback');
    
    try {
      // Try API first
      const result = await originalAddReaction.call(this, messageId, reactionType);
      console.log('✅ REACTIONS API: COMP METHOD - API call succeeded');
      return result;
      
    } catch (error) {
      console.log('❌ REACTIONS API: COMP METHOD - API failed, using local storage');
      
      // COMP METHOD: Store reaction locally
      return storeReactionLocally(messageId, reactionType);
    }
  };
  
  console.log('✅ REACTIONS API: COMP METHOD - Local storage fallback implemented');
}

// COMP METHOD: Store reaction locally
function storeReactionLocally(messageId, reactionType) {
  console.log('🔧 REACTIONS API: COMP METHOD - Storing reaction locally');
  
  const currentUser = window.currentUser || { email: 'user@example.com' };
  const reactionData = {
    messageId: messageId,
    userId: currentUser.id || currentUser.user_id,
    reactionType: reactionType,
    timestamp: new Date().toISOString(),
    local: true
  };
  
  // Store in local storage
  chrome.storage.local.get(['local_reactions'], (result) => {
    const reactions = result.local_reactions || [];
    reactions.push(reactionData);
    chrome.storage.local.set({ local_reactions: reactions });
  });
  
  // Update UI immediately
  updateReactionDisplayLocally(messageId, reactionType);
  
  console.log('✅ REACTIONS API: COMP METHOD - Reaction stored locally');
  return { success: true, local: true };
}
// COMP METHOD: Update reaction display locally
function updateReactionDisplayLocally(messageId, reactionType) {
  console.log('🔧 REACTIONS API: COMP METHOD - Updating reaction display locally');
  
  const messageElement = document.querySelector(`[data-message-id="${messageId}"]`);
  if (!messageElement) return;
  
  const reactionBtn = messageElement.querySelector('.reaction-btn');
  if (!reactionBtn) return;
  
  // Update reaction count
  const countSpan = reactionBtn.querySelector('.icon-count');
  if (countSpan) {
    const currentCount = parseInt(countSpan.textContent) || 0;
    countSpan.textContent = currentCount + 1;
  }
  
  // Add visual feedback
  reactionBtn.style.background = '#e3f2fd';
  setTimeout(() => {
    reactionBtn.style.background = '';
  }, 1000);
  
  console.log('✅ REACTIONS API: COMP METHOD - Reaction display updated locally');
}

// ===== COMP METHOD: REPLY HIERARCHY FIXES =====

// COMP METHOD: Override addMessageToChat to handle reply hierarchy
if (typeof window.addMessageToChat === 'function') {
  const originalAddMessageToChat = window.addMessageToChat;
  
  window.addMessageToChat = function(message) {
    console.log('🔧 REPLY HIERARCHY: COMP METHOD - Adding message with reply hierarchy:', message.id);
    
    // Call original function
    const result = originalAddMessageToChat.call(this, message);
    
    // ROOT CAUSE FIX: Do NOT call addReplyToParentThread - it creates unwanted thread-reply structure
    // Replies are handled directly in addMessageToChat, not via separate thread container
    // setTimeout(() => {
    //   if (message.parentId && message.parentId !== null) {
    //     console.log('🔧 REPLY HIERARCHY: COMP METHOD - Message is a reply, adding to parent thread');
    //     addReplyToParentThread(message);
    //   }
    // }, 100);
    
    return result;
  };
  
  console.log('✅ REPLY HIERARCHY: COMP METHOD - Reply hierarchy handler added');
}

// COMP METHOD: Update user aura color in UI (from COMP)
async function updateUserAuraInUI(userId, auraColor) {
  console.log('🔧 AURA: COMP METHOD - Updating aura color in UI:', userId, auraColor);

  try {
    // Update message avatars for this user
    const messageContainers = document.querySelectorAll('.message');
    let messageAvatarsUpdated = 0;

    for (const messageContainer of messageContainers) {
      const avatarContainer = messageContainer.querySelector('.avatar-container');
      if (avatarContainer) {
        const messageId = messageContainer.getAttribute('data-message-id');
        if (messageId) {
          const messageData = window.currentChatData?.find(msg => msg.id === messageId);
          if (messageData && messageData.author && (messageData.author.id === userId || messageData.author.user_id === userId)) {
            // Update the author's aura color
            messageData.author.auraColor = auraColor;

            // Re-render the avatar
            const newAvatarHTML = await getSenderAvatar(messageData.author);
            avatarContainer.innerHTML = newAvatarHTML;

            messageAvatarsUpdated++;
            console.log('🔧 AURA: Updated message avatar for', userId, 'with color', auraColor);
          }
        }
      }
    }

    console.log('🔧 AURA: Updated', messageAvatarsUpdated, 'message avatars for', userId);

    // Update visibility avatars
    const visibilityAvatars = document.querySelectorAll('.user-avatar');
    let visibilityAvatarsUpdated = 0;

    visibilityAvatars.forEach((avatarElement) => {
      const userIdAttr = avatarElement.getAttribute('data-user-id');
      if (userIdAttr === userId) {
        // Update the aura ring color
        const auraRing = avatarElement.querySelector('.aura-ring');
        if (auraRing) {
          auraRing.style.borderColor = auraColor;
          auraRing.style.backgroundColor = auraColor;
        }

        // Update the avatar border
        avatarElement.style.borderColor = auraColor;

        visibilityAvatarsUpdated++;
        console.log('🔧 AURA: Updated visibility avatar for', userId, 'with color', auraColor);
      }
    });

    console.log('🔧 AURA: Updated', visibilityAvatarsUpdated, 'visibility avatars for', userId);

  } catch (error) {
    console.error('❌ AURA: Error updating aura color in UI:', error);
  }
}
// Make function globally available
window.updateUserAuraInUI = updateUserAuraInUI;

// COMP METHOD: Add reply to parent thread
function addReplyToParentThread(replyMessage) {
  console.log('🔧 REPLY HIERARCHY: COMP METHOD - Adding reply to parent thread:', replyMessage.parentId);
  
  const parentMessage = document.querySelector(`[data-message-id="${replyMessage.parentId}"]`);
  if (!parentMessage) {
    console.log('❌ REPLY HIERARCHY: COMP METHOD - Parent message not found:', replyMessage.parentId);
    return;
  }
  
  // ROOT CAUSE FIX: Create reply container WITHOUT inline styles
  let replyContainer = parentMessage.querySelector('.thread-replies');
  if (!replyContainer) {
    replyContainer = document.createElement('div');
    replyContainer.className = 'thread-replies';
    // NO inline styles - let CSS handle everything
    parentMessage.appendChild(replyContainer);
  }
  
  // ROOT CAUSE FIX: Create reply element WITHOUT inline styles (let CSS handle styling)
  const replyElement = document.createElement('div');
  replyElement.className = 'thread-reply';
  replyElement.setAttribute('data-message-id', replyMessage.id);
  // NO inline styles - let CSS handle everything
  
  // ROOT CAUSE FIX: Use normal message structure, not special reply structure
  // Remove all inline styles from innerHTML
  replyElement.innerHTML = `
    <div class="reply-content">
      <div class="reply-author">
        ${replyMessage.author?.name || 'User'}
      </div>
      <div class="reply-body">
        ${replyMessage.body || replyMessage.content || ''}
      </div>
    </div>
  `;
  
  replyContainer.appendChild(replyElement);
  console.log('✅ REPLY HIERARCHY: COMP METHOD - Reply added to parent thread');
}
// COMP METHOD: Show reaction modal for message (GLOBAL VERSION)
async function showReactionModalGlobal(messageId) {
  console.log('🔧 REACTIONS: COMP METHOD - Showing reaction modal for message:', messageId);
  
  const reactions = ['👍', '❓', '🔁', '🔗', '⚠️', '🙅'];
  
  // Find the reaction button for this message
  const reactionBtn = document.querySelector(`[data-message-id="${messageId}"].reaction-btn`);
  if (!reactionBtn) {
    console.error('❌ REACTIONS: Reaction button not found for message:', messageId);
    return;
  }
  
  // COMP METHOD: Check actual database state for user's current reaction
  console.log('🔍 REACTIONS: COMP METHOD - Checking database for current user reaction...');
  const userId = window.currentUser?.id || window.currentUser?.user_id;
  if (!userId) {
    console.warn('⚠️ REACTIONS: No authenticated user found');
    return;
  }
  
  try {
    // Fetch current reactions from database
    const data = await window.api.request(`/v1/reactions/${messageId}`);
    
    if (data.success && data.reactions) {
      // Find current user's reaction (handle both new AppUser structure and legacy user_email)
      const userReaction = data.reactions.find(r => (r.AppUser?.id || r.user_id) === userId);
      
      if (userReaction) {
        // User has an existing reaction - remove it (toggle off)
        console.log('🔄 REACTION: COMP METHOD - User has existing reaction, removing it...', userReaction.emoji);
        
        // COMP METHOD: Use ReactionsIntegration for removal
        let removeResult;
        if (window.reactionsIntegration && window.reactionsIntegration.isInitialized) {
          console.log('🔧 REACTIONS: COMP METHOD - Using ReactionsIntegration for removal...');
          const success = await window.reactionsIntegration.removeReaction(messageId, userReaction.emoji);
          removeResult = { success: success, action: success ? 'removed' : 'failed' };
        } else {
          console.log('🔧 REACTIONS: COMP METHOD - ReactionsIntegration not available, using direct API...');
          removeResult = await window.api.request('/v1/reactions', {
            method: 'POST',
            body: JSON.stringify({
              messageId: messageId,
              emoji: userReaction.emoji
            })
          });
        }
        console.log('✅ REACTION: COMP METHOD - Reaction removed:', removeResult);
        
        // ROOT CAUSE FIX: Clear user selection immediately so updateReactionDisplay shows blank
        reactionBtn.dataset.reaction = '';
        reactionBtn.dataset.selectedEmoji = '';
        reactionBtn.dataset.lastUpdated = Date.now().toString();
        
        // Update UI optimistically - show blank (heart SVG) immediately
        const blankReactIcon = `<svg viewBox="0 0 24 24" aria-hidden="true" style="width: 18px; height: 18px; fill: currentColor;"><g><path d="M16.697 5.5c-1.222-.06-2.679.51-3.89 2.16l-.805 1.09-.806-1.09C9.984 6.01 8.526 5.44 7.304 5.5c-1.243.07-2.349.78-2.91 1.91-.552 1.12-.633 2.78.479 4.82 1.074 1.97 3.257 4.27 7.129 6.61 3.87-2.34 6.052-4.64 7.126-6.61 1.111-2.04 1.03-3.7.477-4.82-.561-1.13-1.666-1.84-2.908-1.91zm4.187 7.69c-1.351 2.48-4.001 5.12-8.379 7.67l-.503.3-.504-.3c-4.379-2.55-7.029-5.19-8.382-7.67-1.36-2.5-1.41-4.86-.514-6.67.887-1.79 2.647-2.91 4.601-3.01 1.651-.09 3.368.56 4.798 2.01 1.429-1.45 3.146-2.1 4.796-2.01 1.954.1 3.714 1.22 4.601 3.01.896 1.81.846 4.17-.514 6.67z"></path></g></svg>`;
        const countSpan = reactionBtn.querySelector('.icon-count');
        if (countSpan) {
          // Keep count span for now, will be updated by reload
          reactionBtn.innerHTML = blankReactIcon;
          reactionBtn.appendChild(countSpan);
        } else {
          reactionBtn.innerHTML = blankReactIcon;
        }
        
        // CRITICAL FIX: Reload reactions to get accurate count from database
        console.log('🔧 REACTIONS: COMP METHOD - Reloading reactions after removal for accurate count');
        setTimeout(() => {
          window.loadMessageReactions(messageId, reactionBtn);
        }, 300); // Delay to ensure DB has updated
        
        return; // Don't show modal, just remove reaction
      }
    }
  } catch (error) {
    console.error('❌ REACTIONS: Error checking database state:', error);
    // Fall back to local state check
  }
  
  // COMP METHOD: No existing reaction - show modal to select one
  console.log('🔧 REACTIONS: COMP METHOD - No existing reaction, showing modal');
  
  // Create modal HTML positioned over the message (COMP METHOD)
  const reactionBtnRect = reactionBtn.getBoundingClientRect();
  const modalHTML = `
    <div class="reaction-modal" style="position: fixed; top: ${reactionBtnRect.top - 60}px; left: ${reactionBtnRect.left}px; z-index: 99999;">
      <div class="reaction-options">
        ${reactions.map(reaction => `<button class="reaction-option" data-reaction="${reaction}">${reaction}</button>`).join('')}
      </div>
    </div>
  `;
  
  console.log('🔧 REACTIONS: COMP METHOD - Creating modal with reactions:', reactions);
  console.log('🔧 REACTIONS: COMP METHOD - Modal HTML:', modalHTML);
  
  // Position modal near the reaction button
  const buttonRect = reactionBtn.getBoundingClientRect();
  const modal = document.createElement('div');
  modal.innerHTML = modalHTML;
  const modalElement = modal.firstElementChild;
  
  // Position modal above the button
  modalElement.style.position = 'fixed';
  modalElement.style.top = `${buttonRect.top - 60}px`;
  modalElement.style.left = `${buttonRect.left}px`;
  modalElement.style.zIndex = '99999';
  
  console.log('🔧 REACTIONS: COMP METHOD - Button rect:', buttonRect);
  console.log('🔧 REACTIONS: COMP METHOD - Modal position:', modalElement.style.top, modalElement.style.left);
  
  // CRITICAL FIX: Close any existing modals before opening a new one (prevents modal on reload)
  const existingModals = document.querySelectorAll('.reaction-modal');
  existingModals.forEach(modal => {
    if (modal.parentNode) {
      modal.parentNode.removeChild(modal);
      console.log('🔧 REACTIONS: Removed existing modal to prevent duplicates');
    }
  });
  
  // CRITICAL FIX: Store modal state to prevent reopening on reload
  sessionStorage.setItem(`reactionModal_${messageId}`, Date.now().toString());
  
  document.body.appendChild(modalElement);
  
  console.log('🔧 REACTIONS: COMP METHOD - Modal added to DOM, checking visibility...');
  console.log('🔧 REACTIONS: COMP METHOD - Modal display:', modalElement.style.display);
  console.log('🔧 REACTIONS: COMP METHOD - Modal position:', modalElement.style.position);
  console.log('🔧 REACTIONS: COMP METHOD - Modal z-index:', modalElement.style.zIndex);
  
  // Force visibility
  const computedStyle = window.getComputedStyle(modalElement);
  console.log('🔧 REACTIONS: COMP METHOD - Modal computed style:', computedStyle.display);
  
  if (computedStyle.display === 'none') {
    modalElement.style.display = 'block';
    console.log('🔧 REACTIONS: COMP METHOD - Modal visibility forced');
  }
  // Add click handlers
  const reactionOptions = modalElement.querySelectorAll('.reaction-option');
  reactionOptions.forEach(option => {
    option.addEventListener('click', async (e) => {
      e.stopPropagation();
      const selectedReaction = e.target.dataset.reaction;
      console.log('🔧 REACTIONS: COMP METHOD - Selected reaction:', selectedReaction);
      
      // Remove modal
      modalElement.remove();
      
      // Get Chrome profile avatar URL
      let chromeAvatarUrl = null;
      try {
        if (typeof chrome !== 'undefined' && chrome.identity && chrome.identity.getProfileUserInfo) {
          const profileInfo = await new Promise((resolve, reject) => {
            chrome.identity.getProfileUserInfo((profileInfo) => {
              if (chrome.runtime.lastError) {
                reject(chrome.runtime.lastError);
              } else {
                resolve(profileInfo);
              }
            });
          });
          
          if (profileInfo && profileInfo.picture) {
            chromeAvatarUrl = profileInfo.picture;
            console.log('🔍 REACTIONS: Using Chrome profile avatar:', chromeAvatarUrl);
          }
        }
      } catch (error) {
        console.log('🔍 REACTIONS: Error getting Chrome profile info:', error);
      }
      
      console.log('🔧 REACTIONS: COMP METHOD - Using ReactionsIntegration for reaction:', selectedReaction);
      
      // COMP METHOD: Use ReactionsIntegration instead of direct API calls
      let result;
      if (window.reactionsIntegration && window.reactionsIntegration.isInitialized) {
        console.log('🔧 REACTIONS: COMP METHOD - Using ReactionsIntegration...');
        const success = await window.reactionsIntegration.addReaction(messageId, selectedReaction);
        result = { success: success, action: success ? 'added' : 'failed' };
      } else {
        console.log('🔧 REACTIONS: COMP METHOD - ReactionsIntegration not available, using direct API...');
        // Backend uses authenticated user from headers - only send messageId and emoji
        result = await window.api.request('/v1/reactions', {
          method: 'POST',
          body: JSON.stringify({
            messageId: messageId,
            emoji: selectedReaction
          })
        });
      }
      console.log('✅ REACTIONS: COMP METHOD - API response:', result);
      console.log('🔍 REACTIONS: COMP METHOD - API response success:', result.success);
      console.log('🔍 REACTIONS: COMP METHOD - API response action:', result.action);
      console.log('🔍 REACTIONS: COMP METHOD - API response keys:', Object.keys(result));
      
      // Update UI based on API response
      if (result.success || result.action) {
        console.log('🔧 REACTIONS: COMP METHOD - Processing successful API response, action:', result.action);
        if (result.action === 'removed') {
          // COMP METHOD: Reaction was removed - reset UI to default state
          console.log('🔧 REACTIONS: COMP METHOD - Reaction removed, resetting UI to default state');
          
          // Reset to default reaction button state
          const blankReactIcon = `<svg viewBox="0 0 24 24" aria-hidden="true" style="width: 18px; height: 18px; fill: currentColor;"><g><path d="M16.697 5.5c-1.222-.06-2.679.51-3.89 2.16l-.805 1.09-.806-1.09C9.984 6.01 8.526 5.44 7.304 5.5c-1.243.07-2.349.78-2.91 1.91-.552 1.12-.633 2.78.479 4.82 1.074 1.97 3.257 4.27 7.129 6.61 3.87-2.34 6.052-4.64 7.126-6.61 1.111-2.04 1.03-3.7.477-4.82-.561-1.13-1.666-1.84-2.908-1.91zm4.187 7.69c-1.351 2.48-4.001 5.12-8.379 7.67l-.503.3-.504-.3c-4.379-2.55-7.029-5.19-8.382-7.67-1.36-2.5-1.41-4.86-.514-6.67.887-1.79 2.647-2.91 4.601-3.01 1.651-.09 3.368.56 4.798 2.01 1.429-1.45 3.146-2.1 4.796-2.01 1.954.1 3.714 1.22 4.601 3.01.896 1.81.846 4.17-.514 6.67z"></path></g></svg>`;
          reactionBtn.innerHTML = blankReactIcon + '<span class="icon-count" style="font-size: 9px; margin-left: 2px; font-weight: normal; color: #666; display: none;"></span>';
          reactionBtn.dataset.reaction = '';
          reactionBtn.dataset.selectedEmoji = '';
          
          // CRITICAL FIX: Reload reactions to get accurate count from database
          console.log('🔧 REACTIONS: COMP METHOD - Reloading reactions after removal for accurate count');
          // Add delay to ensure database has updated
          setTimeout(() => {
            window.loadMessageReactions(messageId, reactionBtn);
          }, 200); // COMP METHOD: Delay for database propagation
        } else if (result.action === 'added' || result.action === 'replaced') {
          // Reaction was added or replaced - update UI immediately
          const countSpan = reactionBtn.querySelector('.icon-count');
          
          // CRITICAL FIX: Show user's own reaction immediately with count
          // Store the selected emoji in dataset so reload preserves it
          reactionBtn.dataset.selectedEmoji = selectedReaction;
          reactionBtn.dataset.reaction = selectedReaction;
          reactionBtn.dataset.lastUpdated = Date.now().toString();
          
          // Update emoji immediately
          const currentCount = parseInt(countSpan?.textContent) || 0;
          const newCount = result.action === 'replaced' ? currentCount : currentCount + 1;
          
          // Create count span if it doesn't exist
          if (!countSpan) {
            const newCountSpan = document.createElement('span');
            newCountSpan.className = 'icon-count';
            newCountSpan.style.cssText = 'font-size: 9px; margin-left: 2px; font-weight: normal; color: #666;';
            reactionBtn.appendChild(newCountSpan);
          }
          
          // Update display immediately
          const updatedCountSpan = reactionBtn.querySelector('.icon-count');
          reactionBtn.innerHTML = selectedReaction;
          if (updatedCountSpan) {
            updatedCountSpan.textContent = newCount;
            updatedCountSpan.style.display = 'inline';
            reactionBtn.appendChild(updatedCountSpan);
          }
          
          console.log('✅ REACTIONS: COMP METHOD - Updated UI immediately with:', selectedReaction, 'count:', newCount);
          
          // ROOT CAUSE FIX #2: Track reaction ID if returned from API, so we can ignore its DELETE event
          if (result.reaction?.id) {
            if (!window.userCreatedReactionIds) {
              window.userCreatedReactionIds = new Set();
            }
            window.userCreatedReactionIds.add(result.reaction.id);
            setTimeout(() => window.userCreatedReactionIds.delete(result.reaction.id), 5000);
          }
          
          // Real-time handler will reload reactions when event arrives
          // Only reload if real-time doesn't fire within reasonable time
          setTimeout(() => {
            const currentBtn = document.querySelector(`[data-message-id="${messageId}"] .reaction-btn`);
            // Only reload if UI still shows optimistic update (real-time didn't fire)
            if (currentBtn && currentBtn.dataset.selectedEmoji === selectedReaction && 
                Date.now() - parseInt(currentBtn.dataset.lastUpdated) < 500) {
              console.log('🔧 REACTIONS: COMP METHOD - Real-time event didn\'t arrive, reloading for sync');
              window.loadMessageReactions(messageId, currentBtn);
            }
          }, 400);
        } else {
          console.log('⚠️ REACTIONS: COMP METHOD - Unknown action in API response:', result.action);
        }
      } else {
        console.log('❌ REACTIONS: COMP METHOD - API response not successful:', result);
      }
      
    });
  });
  
  // COMP METHOD: Close modal when clicking outside (same as COMP)
  const closeModal = (e) => {
    if (!modalElement.contains(e.target)) {
      if (modalElement.parentNode) {
        document.body.removeChild(modalElement);
      }
      document.removeEventListener('click', closeModal);
      console.log('✅ REACTIONS: COMP METHOD - Modal closed by clicking outside');
    }
  };
  
  // Add click outside listener after a small delay to prevent immediate closure
  setTimeout(() => {
    document.addEventListener('click', closeModal);
  }, 100);
  
  console.log('✅ REACTIONS: COMP METHOD - Reaction modal created and displayed');
}

// Make functions globally available
window.showReactionModal = showReactionModalGlobal;
// Duplicate definition removed - using the one defined earlier

// Duplicate definition removed - using the main function defined above (line 1128)

window.updateReactionInMessage = window.updateReactionInMessage || function(reaction) {
  console.log('🔄 REACTIONS: COMP METHOD - Updating reaction in message:', reaction);
  // Reload reactions for this message to get accurate count
  const reactionBtn = document.querySelector(`[data-message-id="${reaction.message_id}"].reaction-btn`);
  if (reactionBtn) {
    window.loadMessageReactions(reaction.message_id, reactionBtn);
  }
};
window.removeReactionFromMessage = window.removeReactionFromMessage || function(reaction) {
  // CRITICAL FIX: Handle different payload structures
  const messageId = reaction?.message_id || reaction?.messageId || reaction?.message_id || 
                    (reaction?.old && reaction.old.message_id) ||
                    (reaction?.new && reaction.new.message_id);
  
  if (!messageId) {
    console.warn('⚠️ REACTIONS: COMP METHOD - No message ID in reaction payload:', reaction);
    return;
  }
  
  const messageElement = document.querySelector(`[data-message-id="${messageId}"]`);
  const reactionBtn = messageElement?.querySelector('.reaction-btn');
  
  if (reactionBtn) {
    console.log('🔔 REACTIONS: COMP METHOD - Removing reaction from message:', messageId);
    
    // COMP METHOD: Reload reactions to get accurate state from database
    console.log('🔧 REACTIONS: COMP METHOD - Reloading reactions after real-time removal');
    setTimeout(() => {
      window.loadMessageReactions(messageId, reactionBtn);
    }, 300);
    
    console.log('✅ REACTIONS: COMP METHOD - Reaction removed from message display:', messageId);
  } else {
    console.warn('⚠️ REACTIONS: COMP METHOD - Reaction button not found for message:', messageId);
  }
};

// ROOT CAUSE FIX: Track reaction IDs user just created to ignore their DELETE events from replace operations
if (!window.userCreatedReactionIds) {
  window.userCreatedReactionIds = new Set();
}

window.handleReactionChange = window.handleReactionChange || async function(payload) {
  console.log('🔔 REACTIONS: COMP METHOD - Processing real-time reaction change:', payload);
  
  const { eventType, new: newRecord, old: oldRecord } = payload;
  const messageId = newRecord?.message_id || oldRecord?.message_id;
  
  if (!messageId) {
    console.warn('⚠️ REACTIONS: COMP METHOD - No message ID in reaction change payload');
    return;
  }
  
  const currentUserId = window.currentUser?.id || window.currentUser?.user_id;
  const reactionUserId = newRecord?.user_id || oldRecord?.user_id;
  const deletedReactionId = oldRecord?.id;
  const newReactionId = newRecord?.id;
  
  // ROOT CAUSE FIX: Backend REPLACE operation does UPDATE, not DELETE+INSERT
  // But if we see DELETE for a reaction user just created, it's from a replace - ignore it
  if (eventType === 'DELETE' && deletedReactionId && window.userCreatedReactionIds.has(deletedReactionId)) {
    console.log('🔧 REACTIONS: COMP METHOD - Ignoring DELETE for replaced reaction:', deletedReactionId);
    window.userCreatedReactionIds.delete(deletedReactionId);
    return;
  }
  
  // Track newly created reactions from current user
  if (eventType === 'INSERT' && newReactionId && reactionUserId && currentUserId && 
      String(reactionUserId) === String(currentUserId)) {
    window.userCreatedReactionIds.add(newReactionId);
    setTimeout(() => window.userCreatedReactionIds.delete(newReactionId), 3000);
  }
  
  const messageElement = document.querySelector(`[data-message-id="${messageId}"]`);
  const reactionBtn = messageElement?.querySelector('.reaction-btn');
  
  if (!reactionBtn) {
    console.log('🔧 REACTIONS: COMP METHOD - No reaction button found, skipping');
    return;
  }
  
  // If user just acted and this is their INSERT/UPDATE event, skip (UI already updated)
  const lastUpdated = parseInt(reactionBtn.dataset.lastUpdated) || 0;
  if (Date.now() - lastUpdated < 500 && (eventType === 'INSERT' || eventType === 'UPDATE') && 
      reactionUserId && currentUserId && String(reactionUserId) === String(currentUserId)) {
    console.log('🔧 REACTIONS: COMP METHOD - User action just happened, UI updated, skipping', eventType);
    return;
  }
  
  // Process all events normally
  console.log('🔧 REACTIONS: COMP METHOD - Reloading reactions after real-time change');
  window.loadMessageReactions(messageId, reactionBtn);
};

window.refreshAllReactionDisplays = window.refreshAllReactionDisplays || async function() {
  console.log('🔧 REACTIONS: COMP METHOD - Force refreshing all reaction displays');
  
  const reactionButtons = document.querySelectorAll('.reaction-btn');
  console.log('🔧 REACTIONS: Found', reactionButtons.length, 'reaction buttons to refresh');
  
  for (const reactionBtn of reactionButtons) {
    const messageId = reactionBtn.dataset.messageId;
    if (messageId) {
      console.log('🔧 REACTIONS: Refreshing display for message:', messageId);
      await window.loadMessageReactions(messageId, reactionBtn);
    }
  }
  
  console.log('✅ REACTIONS: COMP METHOD - All reaction displays refreshed');
};
// COMP METHOD: Force refresh all message avatars when visibility data becomes available
  window.refreshAllMessageAvatars = window.refreshAllMessageAvatars || async function() {
    console.log('🔧 AVATARS: COMP METHOD - Force refreshing all message avatars');
    
    const messageElements = document.querySelectorAll('[data-message-id]');
    console.log('🔧 AVATARS: Found', messageElements.length, 'message elements to refresh');
    
    // COMP METHOD: Helper function to get aura color for a user ID from visibility data
    // COMP METHOD: Prioritizes updated visibility data (real-time) over database values
    function getAuraColorForUserId(userId) {
      if (!userId) return null;
      
      // COMP METHOD: Check visibility data first (most up-to-date, includes real-time updates)
      if (window.currentVisibilityDataUnfiltered?.active) {
        const user = window.currentVisibilityDataUnfiltered.active.find(u => 
          String(u.id || u.userId || u.user_id) === String(userId)
        );
        if (user) {
          // COMP METHOD: Use aura_color (snake_case) to match COMP standard
          const auraColor = user.aura_color;
          if (auraColor && auraColor !== window.AVATAR_FALLBACK_COLOR && auraColor !== '#ffffff' && auraColor !== 'ffffff') {
            return auraColor;
          }
        }
      }
      
      // COMP METHOD: Check filtered visibility data
      if (window.currentVisibilityData?.active) {
        const user = window.currentVisibilityData.active.find(u => 
          String(u.id || u.userId || u.user_id) === String(userId)
        );
        if (user) {
          // COMP METHOD: Use aura_color (snake_case) to match COMP standard
          const auraColor = user.aura_color;
          if (auraColor && auraColor !== window.AVATAR_FALLBACK_COLOR && auraColor !== '#ffffff' && auraColor !== 'ffffff') {
            return auraColor;
          }
        }
      }
      
      // COMP METHOD: Check current user
      const currentUserId = window.currentUser?.id || window.currentUser?.user_id;
      if (String(userId) === String(currentUserId) && window.currentUser) {
        // COMP METHOD: Use aura_color (snake_case) to match COMP standard
        const auraColor = window.currentUser.aura_color;
        if (auraColor && auraColor !== window.AVATAR_FALLBACK_COLOR && auraColor !== '#ffffff' && auraColor !== 'ffffff') {
          return auraColor;
        }
      }
      
      return null;
    }
    for (const messageElement of messageElements) {
      const messageId = messageElement.dataset.messageId;
      const authorId = messageElement.dataset.authorId;
      const avatarContainer = messageElement.querySelector('.avatar-container');
      
      if (avatarContainer && authorId) {
        try {
          // COMP METHOD: Get user data from visibility for unified avatar recreation
          let userData = null;
          if (window.currentVisibilityDataUnfiltered?.active) {
            userData = window.currentVisibilityDataUnfiltered.active.find(u => 
              String(u.id || u.userId || u.user_id) === String(authorId)
            );
          }
          
          if (!userData && window.currentVisibilityData?.active) {
            userData = window.currentVisibilityData.active.find(u => 
              String(u.id || u.userId || u.user_id) === String(authorId)
            );
          }
          
          // If no user data found, try to construct minimal user object
          if (!userData) {
            const authorElement = messageElement.querySelector('.message-sender-name');
            const authorName = authorElement ? authorElement.textContent.split(' • ')[0] : 'Unknown';
            userData = {
              id: authorId,
              user_id: authorId,
              userId: authorId,
              name: authorName,
              auraColor: getAuraColorForUserId(authorId) || window.AVATAR_FALLBACK_COLOR
            };
            
            // Try to get avatar URL from existing image
            const existingImg = avatarContainer.querySelector('img');
            if (existingImg) {
              userData.avatarUrl = existingImg.src;
            }
          }
          
          // COMP METHOD: Get aura color with priority: userData > visibility data > fallback
          // COMP METHOD: Use aura_color (snake_case) to match COMP standard
          const auraColor = userData.aura_color || getAuraColorForUserId(authorId) || window.AVATAR_FALLBACK_COLOR;
          // COMP METHOD: Set aura_color to match COMP
          userData.aura_color = auraColor;
          
          console.log(`🔧 AVATARS: Refreshing avatar for message ${messageId}, author ${authorId}, aura color: ${auraColor}`);
          
          // COMP METHOD: Recreate unified avatar with aura ring behind image
          if (window.AvatarUtils && typeof window.AvatarUtils.createUnifiedAvatar === 'function') {
            const newAvatarHTML = await window.AvatarUtils.createUnifiedAvatar(userData, 'message', {
              size: 32,
              showAura: true,
              showStatus: false
            });
            avatarContainer.innerHTML = newAvatarHTML;
            console.log(`✅ AVATARS: Recreated unified avatar with aura ring for message ${messageId}`);
          } else {
            // Fallback: update border color only
            const avatarImg = avatarContainer.querySelector('img');
            if (avatarImg) {
              avatarImg.style.borderColor = auraColor;
              avatarImg.style.border = `2px solid ${auraColor}`;
            }
            
            // Update aura ring if it exists
            const auraRing = avatarContainer.querySelector('[style*="background-color"]');
            if (auraRing && auraColor !== window.AVATAR_FALLBACK_COLOR) {
              auraRing.style.backgroundColor = auraColor;
              auraRing.style.borderColor = auraColor;
            }
            
            console.log(`✅ AVATARS: Updated aura color for message ${messageId}`);
          }
        } catch (error) {
          console.error(`❌ AVATARS: Error refreshing avatar for message ${messageId}:`, error);
        }
      }
    }
    
    console.log('✅ AVATARS: COMP METHOD - All message avatars refreshed');
  }
  
  // ROOT CAUSE FIX: Comprehensive diagnostic function for reaction display issues
  window.diagnoseReactionDisplayIssue = async function(messageId) {
    console.log('🔍 === REACTION DISPLAY DIAGNOSTIC START ===');
    
    if (!messageId) {
      const firstMsg = document.querySelector('[data-message-id]');
      if (firstMsg) {
        messageId = firstMsg.dataset.messageId;
        console.log('📌 Using first message ID:', messageId);
      } else {
        console.error('❌ No message ID provided and no messages found');
        return;
      }
    }
    
    const msgEl = document.querySelector(`[data-message-id="${messageId}"]`);
    if (!msgEl) {
      console.error('❌ Message not found:', messageId);
      return;
    }
    
    const btn = msgEl.querySelector('.reaction-btn');
    if (!btn) {
      console.error('❌ Reaction button not found');
      return;
    }
    
    const currentUserId = window.currentUser?.id || window.currentUser?.user_id;
    const currentUserEmail = window.currentUser?.email;
    
    console.log('\n--- Current User Context ---');
    console.log('User ID:', currentUserId, `(Type: ${typeof currentUserId})`);
    console.log('User Email:', currentUserEmail);
    console.log('window.currentUser object:', window.currentUser);
    
    console.log('\n--- UI State ---');
    const uiEmoji = btn.textContent.trim().replace(/\d+/, '').trim();
    const uiCount = parseInt(btn.querySelector('.icon-count')?.textContent) || 0;
    console.log('Displayed Emoji:', uiEmoji);
    console.log('Displayed Count:', uiCount);
    console.log('data-reaction:', btn.dataset.reaction);
    console.log('data-selected-emoji:', btn.dataset.selectedEmoji);
    console.log('data-last-updated:', btn.dataset.lastUpdated);
    
    console.log('\n--- Backend State ---');
    try {
      const resp = await window.api.request(`/v1/reactions/${messageId}`);
      const reactions = resp?.reactions || [];
      
      console.log('Total reactions:', reactions.length);
      console.log('All reactions:', reactions.map(r => ({
        id: r.id,
        emoji: r.emoji,
        user_id: r.user_id || r.AppUser?.id,
        user_email: r.AppUser?.email,
        created_at: r.created_at
      })));
      
      const userReaction = reactions.find(r => {
        const rId = r.AppUser?.id || r.user_id;
        return rId && String(rId) === String(currentUserId);
      });
      
      console.log('Current user\'s reaction:', userReaction ? userReaction.emoji : 'NONE');
      
      const reactionCounts = {};
      reactions.forEach(r => {
        reactionCounts[r.emoji] = (reactionCounts[r.emoji] || 0) + 1;
      });
      console.log('Reaction counts by emoji:', reactionCounts);
      
      console.log('\n--- User ID Matching Analysis ---');
      reactions.forEach(r => {
        const rId = r.AppUser?.id || r.user_id;
        const matches = rId && String(rId) === String(currentUserId);
        console.log(`  Reaction ${r.emoji}: User ID ${rId} ${matches ? '✅ MATCHES' : '❌ DOES NOT MATCH'} current user ${currentUserId}`);
        if (r.AppUser?.email) {
          console.log(`    Email: ${r.AppUser.email}`);
        }
      });
      
      console.log('\n--- Expected vs Actual ---');
      const blankReactIcon = `<svg viewBox="0 0 24 24" aria-hidden="true" style="width: 18px; height: 18px; fill: currentColor;"><g><path d="M16.697 5.5c-1.222-.06-2.679.51-3.89 2.16l-.805 1.09-.806-1.09C9.984 6.01 8.526 5.44 7.304 5.5c-1.243.07-2.349.78-2.91 1.91-.552 1.12-.633 2.78.479 4.82 1.074 1.97 3.257 4.27 7.129 6.61 3.87-2.34 6.052-4.64 7.126-6.61 1.111-2.04 1.03-3.7.477-4.82-.561-1.13-1.666-1.84-2.908-1.91zm4.187 7.69c-1.351 2.48-4.001 5.12-8.379 7.67l-.503.3-.504-.3c-4.379-2.55-7.029-5.19-8.382-7.67-1.36-2.5-1.41-4.86-.514-6.67.887-1.79 2.647-2.91 4.601-3.01 1.651-.09 3.368.56 4.798 2.01 1.429-1.45 3.146-2.1 4.796-2.01 1.954.1 3.714 1.22 4.601 3.01.896 1.81.846 4.17-.514 6.67z"></path></g></svg>`;
      const expectedEmoji = userReaction ? userReaction.emoji : blankReactIcon;
      const expectedCount = reactions.length;
      console.log('Expected emoji:', expectedEmoji, uiEmoji === expectedEmoji ? '✅' : '❌');
      console.log('Actual emoji:', uiEmoji);
      console.log('Expected count:', expectedCount, String(expectedCount) === String(uiCount) ? '✅' : '❌');
      console.log('Actual count:', uiCount);
      
      if (uiEmoji !== expectedEmoji || String(expectedCount) !== String(uiCount)) {
        console.log('\n🔧 Attempting to fix display...');
        await window.loadMessageReactions(messageId, btn);
        setTimeout(() => {
          const newEmoji = btn.textContent.trim().replace(/\d+/, '').trim();
          const newCount = parseInt(btn.querySelector('.icon-count')?.textContent) || 0;
          console.log('✅ After fix - Emoji:', newEmoji, newEmoji === expectedEmoji ? '✅' : '❌');
          console.log('✅ After fix - Count:', newCount, newCount === expectedCount ? '✅' : '❌');
        }, 500);
      }
      
      return {
        messageId,
        currentUser: { id: currentUserId, email: currentUserEmail },
        ui: { emoji: uiEmoji, count: uiCount },
        backend: { userReaction: userReaction?.emoji || null, totalCount: expectedCount, allReactions: reactions },
        issuesFound: uiEmoji !== expectedEmoji || String(expectedCount) !== String(uiCount)
      };
    } catch (error) {
      console.error('❌ Error fetching reactions:', error);
      return { error: error.message };
    }
  };
  
  console.log('✅ Diagnostic function loaded: window.diagnoseReactionDisplayIssue(messageId)');

// COMP METHOD: Ensure all functions are globally available
window.addReactionToMessage = addReactionToMessage;
window.updateReactionInMessage = updateReactionInMessage;
window.removeReactionFromMessage = removeReactionFromMessage;
window.handleReactionChange = handleReactionChange;
// CRITICAL FIX: Export bookmark functions to window
// NOTE: updateReactionDisplay and updateBookmarkDisplay are already exported inline above (lines 6736 and 7019)
// Do not try to export them again as variables - they are defined as window properties directly
window.handleBookmarkToggle = handleBookmarkToggle;
// window.updateBookmarkDisplay is already exported at line 7019 as inline function
window.loadMessageBookmarks = loadMessageBookmarks;
window.refreshAllReactionDisplays = refreshAllReactionDisplays;
window.refreshAllMessageAvatars = refreshAllMessageAvatars;

// CRITICAL FIX: Export missing functions that orchestration is looking for
// These functions are defined earlier in the file, so we can export them directly
try {
  window.addMessageActionListeners = addMessageActionListeners;
  console.log('✅ CANOPI: addMessageActionListeners exported to window');
} catch (e) {
  console.warn('⚠️ CANOPI: addMessageActionListeners not available for export:', e.message);
}

// Create global CanopiModule instance for debugging
window.canopiModule = new CanopiModule();

// Global function to compare message styles
window.compareMessageStyles = function() {
  console.log('🔍 COMPARING MESSAGE STYLES');

  // Find default messages
  const defaultMessages = document.querySelectorAll('.chat-messages:not(.focus-messages-container) .message:not(.message-reply)');
  if (defaultMessages.length > 0) {
    console.log(`📝 Found ${defaultMessages.length} default messages`);
    const firstDefault = defaultMessages[0];
    window.canopiModule.logComputedStyles(firstDefault, 'DEFAULT_MESSAGE_SAMPLE');
  } else {
    console.log('❌ No default messages found');
  }

  // Find focus mode replies
  const focusReplies = document.querySelectorAll('.focus-messages-container .message-reply');
  if (focusReplies.length > 0) {
    console.log(`🎯 Found ${focusReplies.length} focus mode replies`);
    const firstReply = focusReplies[0];
    window.canopiModule.logComputedStyles(firstReply, 'FOCUS_REPLY_SAMPLE');
  } else {
    console.log('❌ No focus mode replies found');
  }

  console.log('🔍 Style comparison complete. Check console for detailed computed styles.');
};

// Global function to force visibility of focus mode replies
window.forceFocusReplyVisibility = function() {
  console.log('🔧 FORCING FOCUS REPLY VISIBILITY');

  const focusReplies = document.querySelectorAll('.focus-messages-container .message-reply');
  let fixed = 0;

  focusReplies.forEach(reply => {
    const computed = window.getComputedStyle(reply);
    if (computed.display === 'none' || computed.visibility === 'hidden') {
      reply.style.setProperty('display', 'flex', 'important');
      reply.style.setProperty('visibility', 'visible', 'important');
      reply.style.setProperty('opacity', '1', 'important');
      reply.style.setProperty('height', 'auto', 'important');
      reply.style.setProperty('min-height', '50px', 'important');
      fixed++;
      console.log(`✅ Fixed visibility for reply: ${reply.dataset.messageId}`);
    }
  });

  console.log(`🔧 Fixed ${fixed} out of ${focusReplies.length} focus mode replies`);
};

// UNIFIED MESSAGE DISPLAY FUNCTION - Exact same structure for both main messages and replies
window.createUnifiedMessageElement = function(message, options = {}) {
  console.log('🎯 UNIFIED MESSAGE DISPLAY: Creating EXACT same structure as default messages', {
    messageId: message.id,
    isReply: options.isReply,
    isInFocusMode: options.isInFocusMode
  });

  const {
    isReply = false,
    isInFocusMode = false,
    showCommunity = true,
    container = null
  } = options;

  // Get current user for ownership checks
  const currentUserId = window.currentUser?.id || window.currentUser?.user_id;

  // Resolve author data
  const author = message.author || {};
  const authorName = author.name || author.handle || 'Unknown';
  const authorId = author.id || author.user_id || message.user_id;
  const isOwnMessage = authorId === currentUserId;

  // Resolve community data - ensure we have a community name
  const communityId = message.communityId || message.community_id || 'comm-001';
  const communityName = message.communityName || `@${communityId}`;

  console.log('📋 Message data resolved:', {
    authorName,
    authorId,
    communityId,
    communityName,
    isOwnMessage
  });

  // Resolve avatar data
  const avatarData = window.AvatarUtils && typeof window.AvatarUtils.getAvatar === 'function' ?
    window.AvatarUtils.getAvatar(authorId, 'message') :
    { avatarUrl: author.avatarUrl || author.avatar_url || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(authorName) + '&background=random&color=fff&size=32' };

  // Create unified message container - EXACT same structure as default messages
  const messageDiv = document.createElement('div');
  messageDiv.className = 'message thread-starter message-loaded'; // EXACT same classes as default
  messageDiv.dataset.messageId = message.id;
  messageDiv.dataset.conversationId = message.conversationId || message.conversation_id || 'conv-undefined';
  messageDiv.dataset.authorId = authorId;
  messageDiv.dataset.authorName = authorName;
  messageDiv.dataset.listenersAttached = 'false'; // Will be set to true when listeners are attached

  // EXACT HTML structure matching default messages
  messageDiv.innerHTML = `
    <div class="avatar-container">
      <div style="position: relative; width: 32px; height: 32px;" data-user-id="${authorId}">
        <div class="avatar-aura" style="position: absolute; top: -2px; left: -2px; width: 36px; height: 36px; border-radius: 50%; background-color: #ffffff; z-index: 1; border: 2px solid #ffffff; box-sizing: border-box;"></div>
        <img src="${avatarData.avatarUrl}" alt="${authorName}" style="position: relative; z-index: 2; width: 32px; height: 32px; border-radius: 50%; object-fit: cover; border: none !important;" data-avatar-source="user_object_avatarUrl" data-user-id="${authorId}">
      </div>
    </div>
    <div class="message-content-wrapper" style="display: flex !important; flex-direction: column !important; min-height: 1px !important; width: 100% !important; min-width: 0px !important; box-sizing: border-box !important; cursor: pointer; pointer-events: auto !important;">
      <div class="message-header-new" style="pointer-events: auto !important;">
        <span class="message-sender-name">${authorName} • Current Community</span>
        <span class="message-time-new">${window.formatMessageTime ? window.formatMessageTime(message.createdAt || message.created_at, isInFocusMode) : ''}</span>
        <div class="message-actions-new">
          <div class="message-actions-menu">
            <button class="action-dots-btn" data-message-id="${message.id}" title="Message actions" data-has-listener="true" style="pointer-events: auto !important; cursor: pointer !important; opacity: 1 !important; visibility: visible !important;">
              <span class="action-dots">⋯</span>
            </button>
            <div class="action-dropdown">
              ${isOwnMessage ? `
                <button class="action-item edit-btn" data-message-id="${message.id}" style="pointer-events: auto !important; cursor: pointer !important; opacity: 1 !important; visibility: visible !important; z-index: 20 !important; position: relative !important;">✏️ Edit</button>
                <button class="action-item delete-btn" data-message-id="${message.id}" style="pointer-events: auto !important; cursor: pointer !important; opacity: 1 !important; visibility: visible !important; z-index: 20 !important; position: relative !important;">🗑️ Delete</button>
              ` : ''}
              <button class="action-item flag-btn" data-message-id="${message.id}" disabled="">🚩 Flag</button>
            </div>
          </div>
        </div>
      </div>
      <div class="message-content" style="display: block !important; min-height: 1px !important; width: 100% !important; min-width: 0px !important; box-sizing: border-box !important;">${message.body || message.content || ''}</div>
    </div>
    <div class="message-footer" style="pointer-events: auto !important;">
      <div class="message-footer-actions">
        <button class="inline-reply-btn" data-message-id="${message.id}" data-has-replied="false" title="Reply in community" data-has-listener="true" style="pointer-events: auto !important; cursor: pointer !important; opacity: 1 !important; visibility: visible !important; z-index: 20 !important; position: relative !important;"><svg viewBox="0 0 24 24" aria-hidden="true" style="width: 18px; height: 18px; fill: currentColor;"><g><path d="M1.751 10c0-4.42 3.584-8 8.005-8h4.366c4.49 0 8.129 3.64 8.129 8.13 0 2.96-1.607 5.68-4.196 7.11l-8.054 4.46v-3.69h-.067c-4.49.1-8.183-3.51-8.183-8.01zm8.005-6c-3.317 0-6.005 2.69-6.005 6 0 3.37 2.77 6.08 6.138 6.01l.351-.01h1.761v2.3l5.087-2.81c1.951-1.08 3.163-3.13 3.163-5.36 0-3.39-2.744-6.13-6.129-6.13H9.756z"></path></g></svg><span class="icon-count">${message.replyCount || 0}</span></button>
        <button class="repost-btn" data-message-id="${message.id}" data-has-reposted="false" title="Repost" data-has-listener="true" style="pointer-events: auto !important; cursor: pointer !important; opacity: 1 !important; visibility: visible !important; z-index: 20 !important; position: relative !important;"><svg viewBox="0 0 24 24" aria-hidden="true" style="width: 18px; height: 18px; fill: currentColor;"><g><path d="M4.5 3.88l4.432 4.14-1.364 1.46L5.5 7.55V16c0 1.1.896 2 2 2H13v2H7.5c-2.209 0-4-1.79-4-4V7.55L1.432 9.48.068 8.02 4.5 3.88zM16.5 6H11V4h5.5c2.209 0 4 1.79 4 4v8.45l2.068-1.93 1.364 1.46-4.432 4.14-4.432-4.14 1.364-1.46 2.068 1.93V8c0-1.1-.896-2-2-2z"></path></g></svg></button>
        <button class="reaction-btn" data-message-id="${message.id}" title="Add reaction" data-has-listener="true" style="pointer-events: auto !important; cursor: pointer !important; opacity: 1 !important; visibility: visible !important; z-index: 20 !important; position: relative !important;" data-reaction="" data-selected-emoji="" data-last-updated=""><svg viewBox="0 0 24 24" aria-hidden="true" style="width: 18px; height: 18px; fill: currentColor;"><g><path d="M16.697 5.5c-1.222-.06-2.679.51-3.89 2.16l-.805 1.09-.806-1.09C9.984 6.01 8.526 5.44 7.304 5.5c-1.243.07-2.349.78-2.91 1.91-.552 1.12-.633 2.78.479 4.82 1.074 1.97 3.257 4.27 7.129 6.61 3.87-2.34 6.052-4.64 7.126-6.61 1.111-2.04 1.03-3.7.477-4.82-.561-1.13-1.666-1.84-2.908-1.91zm4.187 7.69c-1.351 2.48-4.001 5.12-8.379 7.67l-.503.3-.504-.3c-4.379-2.55-7.029-5.19-8.382-7.67-1.36-2.5-1.41-4.86-.514-6.67.887-1.79 2.647-2.91 4.601-3.01 1.651-.09 3.368.56 4.798 2.01 1.429-1.45 3.146-2.1 4.796-2.01 1.954.1 3.714 1.22 4.601 3.01.896 1.81.846 4.17-.514 6.67z"></path></g></svg><span class="icon-count" style="display: none;"></span></button>
        <button class="bookmark-btn" data-message-id="${message.id}" data-is-bookmarked="false" title="Bookmark" data-has-listener="true" style="pointer-events: auto !important; cursor: pointer !important; opacity: 1 !important; visibility: visible !important; z-index: 20 !important; position: relative !important; color: rgb(102, 102, 102);"><svg viewBox="0 0 24 24" aria-hidden="true" style="width: 18px; height: 18px; fill: currentColor;"><g><path d="M4 4.5C4 3.12 5.119 2 6.5 2h11C18.881 2 20 3.12 20 4.5v18.44l-8-5.71-8 5.71V4.5zM6.5 4c-.276 0-.5.22-.5.5v14.56l6-4.29 6 4.29V4.5c0-.28-.224-.5-.5-.5h-11z"></path></g></svg></button>
        <button class="share-btn" data-message-id="${message.id}" data-has-shared="false" title="Share" data-has-listener="true" style="pointer-events: auto !important; cursor: pointer !important; opacity: 1 !important; visibility: visible !important; display: flex !important; z-index: 20 !important; position: relative !important;"><svg viewBox="0 0 24 24" aria-hidden="true" style="width: 18px; height: 18px; fill: currentColor;"><g><path d="M12 2.59l5.7 5.7-1.41 1.42L13 6.41V16h-2V6.41l-3.3 3.3-1.41-1.42L12 2.59zM21 15l-.02 3.51c0 1.38-1.12 2.49-2.5 2.49H5.5C4.11 21 3 19.88 3 18.5V15h2v3.5c0 .28.22.5.5.5h12.98c.28 0 .5-.22.5-.5L19 15h2z"></path></g></svg></button>
      </div>
    </div>
  `;

  console.log('📄 Generated HTML structure:', {
    hasCommunity: !!communityDisplay,
    communityName,
    authorName,
    messageLength: (message.body || message.content || '').length
  });

  // Apply appropriate CSS classes - EXACT same as default messages
  messageDiv.classList.add('thread-starter'); // Always use thread-starter like default messages
  if (message.replyCount > 0) {
    messageDiv.classList.add('has-replies'); // Only add if message has replies
  }
  messageDiv.classList.add('message-loaded');

  console.log(`✅ UNIFIED MESSAGE DISPLAY: Created ${isReply ? 'reply' : 'main'} message element for ${message.id}`);
  return messageDiv;
};

// Function to unify focus mode reply styling with default messages
window.unifyFocusReplyStyling = function() {
  console.log('🎨 UNIFYING FOCUS REPLY STYLING');

  // Get a sample default message for comparison
  const defaultMessages = document.querySelectorAll('.chat-messages:not(.focus-messages-container) .message:not(.message-reply)');
  const focusReplies = document.querySelectorAll('.focus-messages-container .message-reply');

  if (defaultMessages.length === 0) {
    console.log('❌ No default messages found for comparison');
    return;
  }

  if (focusReplies.length === 0) {
    console.log('❌ No focus mode replies found');
    return;
  }

  const defaultMessage = defaultMessages[0];
  const defaultComputed = window.getComputedStyle(defaultMessage);

  console.log('📝 DEFAULT MESSAGE STYLES:');
  console.log(`  display: ${defaultComputed.display}`);
  console.log(`  flexDirection: ${defaultComputed.flexDirection}`);
  console.log(`  alignItems: ${defaultComputed.alignItems}`);
  console.log(`  margin: ${defaultComputed.margin}`);
  console.log(`  padding: ${defaultComputed.padding}`);
  console.log(`  width: ${defaultComputed.width}`);
  console.log(`  minWidth: ${defaultComputed.minWidth}`);
  console.log(`  maxWidth: ${defaultComputed.maxWidth}`);

  // Apply the same styling to focus mode replies
  focusReplies.forEach(reply => {
    // Clear any conflicting inline styles first
    reply.style.cssText = '';

    // Apply unified styling to match default messages
    reply.style.setProperty('display', defaultComputed.display, 'important');
    reply.style.setProperty('flex-direction', defaultComputed.flexDirection, 'important');
    reply.style.setProperty('align-items', defaultComputed.alignItems, 'important');
    reply.style.setProperty('width', defaultComputed.width, 'important');
    reply.style.setProperty('min-width', defaultComputed.minWidth, 'important');
    reply.style.setProperty('max-width', defaultComputed.maxWidth, 'important');
    reply.style.setProperty('box-sizing', defaultComputed.boxSizing, 'important');

    // Use consistent margins/padding - no extra spacing for replies
    reply.style.setProperty('margin', '0', 'important');
    reply.style.setProperty('margin-top', '0', 'important');
    reply.style.setProperty('margin-bottom', '0', 'important');
    reply.style.setProperty('margin-left', '0', 'important');
    reply.style.setProperty('margin-right', '0', 'important');

    reply.style.setProperty('padding', '0', 'important');
    reply.style.setProperty('padding-top', '0', 'important');
    reply.style.setProperty('padding-bottom', '0', 'important');
    reply.style.setProperty('padding-left', '0', 'important');
    reply.style.setProperty('padding-right', '0', 'important');

    // Ensure visibility
    reply.style.setProperty('visibility', 'visible', 'important');
    reply.style.setProperty('opacity', '1', 'important');
    reply.style.setProperty('height', 'auto', 'important');
    reply.style.setProperty('min-height', '50px', 'important');

    console.log(`✅ Unified styling for focus reply: ${reply.dataset.messageId}`);
  });

  console.log(`🎨 Unified styling for ${focusReplies.length} focus mode replies`);
};

// Function to regenerate focus mode messages using unified display
window.regenerateFocusModeMessages = async function() {
  console.log('🔄 REGENERATING FOCUS MODE MESSAGES with unified display');

  const focusContainer = document.querySelector('.focus-messages-container');
  if (!focusContainer) {
    console.log('❌ No focus mode container found');
    return 0;
  }

  // Get all messages in focus mode (main message + replies)
  const focusMessages = Array.from(focusContainer.querySelectorAll('.message'));
  if (focusMessages.length === 0) {
    console.log('❌ No messages found in focus mode');
    return 0;
  }

  console.log(`📝 Found ${focusMessages.length} messages to regenerate`);
  let regenerated = 0;

  // Clear any existing inline styles that might interfere
  focusMessages.forEach(msg => {
    msg.style.cssText = '';
    msg.className = msg.className.replace(/\s*unified-message-display\s*/g, '');
  });

  // Regenerate each message using unified display
  for (let i = 0; i < focusMessages.length; i++) {
    const oldMessageDiv = focusMessages[i];
    const messageId = oldMessageDiv.dataset.messageId;

    if (!messageId) continue;

    // Find the message data
    const messageData = window.currentChatData?.find(m => m.id === messageId);
    if (!messageData) {
      console.log(`⚠️ No data found for message ${messageId}, skipping`);
      continue;
    }

    // Determine if this is a reply - check multiple indicators
    const isReply = oldMessageDiv.classList.contains('message-reply') ||
                   messageData.parentId ||
                   messageData.parent_id ||
                   messageData.isReply ||
                   (messageData.conversationId && messageData.conversationId !== `conv-${messageData.communityId || 'comm-001'}-${window.currentUrlData?.pageId || 'default'}`);

    console.log(`🔍 Message analysis for ${messageId}:`, {
      oldClassReply: oldMessageDiv.classList.contains('message-reply'),
      parentId: messageData.parentId || messageData.parent_id,
      isReplyFlag: messageData.isReply,
      conversationId: messageData.conversationId,
      determinedIsReply: isReply
    });

    try {
      // Create new unified message element
      const newMessageDiv = window.createUnifiedMessageElement(messageData, {
        isReply,
        isInFocusMode: true,
        showCommunity: true
      });

      // Replace the old element
      oldMessageDiv.parentNode.replaceChild(newMessageDiv, oldMessageDiv);

      // Re-attach event listeners
      if (window.addMessageActionListeners) {
        window.addMessageActionListeners(newMessageDiv, messageData);
        newMessageDiv.dataset.listenersAttached = 'true';
      }

      regenerated++;
      console.log(`✅ Regenerated ${isReply ? 'reply' : 'main'} message: ${messageId}`);
    } catch (error) {
      console.error(`❌ Failed to regenerate message ${messageId}:`, error);
    }
  }

  console.log(`🎯 Successfully regenerated ${regenerated}/${focusMessages.length} focus mode messages`);
  return regenerated;
};

// Enhanced function to force complete message formatting fix
window.fixFocusModeFormatting = async function() {
  console.log('🔧 COMPLETE FOCUS MODE FORMATTING FIX');

  // Step 1: Regenerate with unified display
  const regenerated = await window.regenerateFocusModeMessages();
  console.log(`📝 Regenerated ${regenerated} messages`);

  // Step 2: Force CSS application by triggering reflow
  const focusContainer = document.querySelector('.focus-messages-container');
  if (focusContainer) {
    // Trigger CSS reflow
    focusContainer.offsetHeight;

    console.log(`🎨 Applied fixes to focus container`);
  }

  // Step 3: Verify the fix
  setTimeout(() => {
    window.compareMessageStyles();
  }, 100);

  return regenerated;
};

// DIAGNOSTIC FUNCTION: Check if focus mode messages are visible
window.diagnoseFocusModeVisibility = function() {
  console.log('🔍 DIAGNOSTIC: Checking focus mode message visibility');
  
  const focusContainer = document.querySelector('.focus-messages-container');
  if (!focusContainer) {
    console.log('❌ No focus mode container found');
    return { total: 0, visible: 0, hidden: 0 };
  }
  
  const allMessages = focusContainer.querySelectorAll('.message');
  let visible = 0;
  let hidden = 0;
  
  allMessages.forEach((msg, index) => {
    const computed = window.getComputedStyle(msg);
    const display = computed.display;
    const visibility = computed.visibility;
    const opacity = computed.opacity;
    const width = msg.offsetWidth;
    const height = msg.offsetHeight;
    const inlineDisplay = msg.style.display;
    const inlineVisibility = msg.style.visibility;
    
    const isVisible = display !== 'none' && visibility !== 'hidden' && opacity !== '0' && width > 0 && height > 0;
    
    if (isVisible) {
      visible++;
      console.log(`✅ Message ${index + 1} (${msg.dataset.messageId?.substring(0, 8)}...): VISIBLE - display: ${display}, visibility: ${visibility}, size: ${width}px × ${height}px`);
    } else {
      hidden++;
      console.log(`❌ Message ${index + 1} (${msg.dataset.messageId?.substring(0, 8)}...): HIDDEN - display: ${display}, visibility: ${visibility}, opacity: ${opacity}, size: ${width}px × ${height}px, inline: display=${inlineDisplay}, visibility=${inlineVisibility}`);
    }
  });
  
  const result = { total: allMessages.length, visible, hidden };
  console.log(`\n📊 SUMMARY: ${visible}/${allMessages.length} messages visible, ${hidden} hidden`);
  return result;
};

// DIAGNOSTIC FUNCTION: Prove that default messages and focus mode replies are identical
window.diagnoseMessageFormatting = function() {
  console.log('🔍 DIAGNOSTIC: Comparing default messages vs focus mode replies');

  // Get samples
  const defaultMessages = document.querySelectorAll('.chat-messages:not(.focus-messages-container) .message');
  const focusReplies = document.querySelectorAll('.focus-messages-container .message');

  if (defaultMessages.length === 0) {
    console.error('❌ No default messages found');
    return false;
  }

  if (focusReplies.length === 0) {
    console.error('❌ No focus mode replies found');
    return false;
  }

  const defaultMsg = defaultMessages[0];
  const focusReply = focusReplies[0];

  console.log('📊 COMPARISON RESULTS:');
  console.log('='.repeat(80));

  // Compare classes
  const defaultClasses = defaultMsg.className;
  const focusClasses = focusReply.className;
  const classesMatch = defaultClasses === focusClasses;

  console.log(`📋 CLASSES:`);
  console.log(`  Default: "${defaultClasses}"`);
  console.log(`  Focus:   "${focusClasses}"`);
  console.log(`  Match:   ${classesMatch ? '✅' : '❌'}`);

  // Compare HTML structure (simplified)
  const defaultHTML = defaultMsg.innerHTML.replace(/\s+/g, ' ').trim();
  const focusHTML = focusReply.innerHTML.replace(/\s+/g, ' ').trim();
  const htmlMatch = defaultHTML === focusHTML;

  console.log(`\\n🏗️ HTML STRUCTURE:`);
  console.log(`  Match: ${htmlMatch ? '✅' : '❌'}`);
  if (!htmlMatch) {
    console.log(`  Default length: ${defaultHTML.length}`);
    console.log(`  Focus length:   ${focusHTML.length}`);
  }

  // Compare key elements
  const comparisons = [
    { selector: '.message-sender-name', name: 'Sender Name' },
    { selector: '.message-time-new', name: 'Time' },
    { selector: '.message-content', name: 'Content' },
    { selector: '.inline-reply-btn', name: 'Reply Button' },
    { selector: '.reaction-btn', name: 'Reaction Button' },
    { selector: '.bookmark-btn', name: 'Bookmark Button' },
    { selector: '.share-btn', name: 'Share Button' }
  ];

  let allElementsMatch = true;
  console.log(`\\n🔧 ELEMENTS:`);

  comparisons.forEach(comp => {
    const defaultEl = defaultMsg.querySelector(comp.selector);
    const focusEl = focusReply.querySelector(comp.selector);

    const defaultExists = !!defaultEl;
    const focusExists = !!focusEl;
    const bothExist = defaultExists && focusExists;

    let textMatch = false;
    if (bothExist) {
      const defaultText = defaultEl.textContent?.trim();
      const focusText = focusEl.textContent?.trim();
      textMatch = defaultText === focusText;
    }

    const elementMatch = bothExist && textMatch;
    if (!elementMatch) allElementsMatch = false;

    console.log(`  ${comp.name}: ${elementMatch ? '✅' : '❌'} (${bothExist ? (textMatch ? 'text match' : 'text differs') : (defaultExists ? 'missing in focus' : 'missing in default')})`);
  });

  // Compare computed styles
  const styleProps = ['padding', 'margin', 'position', 'display', 'flex-direction', 'align-items'];
  let allStylesMatch = true;
  console.log(`\\n🎨 COMPUTED STYLES:`);

  styleProps.forEach(prop => {
    const defaultStyle = window.getComputedStyle(defaultMsg)[prop];
    const focusStyle = window.getComputedStyle(focusReply)[prop];
    const styleMatch = defaultStyle === focusStyle;

    if (!styleMatch) allStylesMatch = false;
    console.log(`  ${prop}: ${styleMatch ? '✅' : '❌'} (${defaultStyle} vs ${focusStyle})`);
  });

  // Final result
  const overallMatch = classesMatch && htmlMatch && allElementsMatch && allStylesMatch;

  console.log('\\n' + '='.repeat(80));
  console.log(`🎯 FINAL RESULT: ${overallMatch ? '✅ IDENTICAL FORMATTING' : '❌ DIFFERENT FORMATTING'}`);
  console.log('='.repeat(80));

  return overallMatch;
};

try {
  window.handleMessageFocus = handleMessageFocus;
  console.log('✅ CANOPI: handleMessageFocus exported to window');
} catch (e) {
  console.warn('⚠️ CANOPI: handleMessageFocus not available for export:', e.message);
}

console.log('✅ CanopiModule loaded with COMP method fixes');
console.log('✅ CanopiModule loaded with COMP method fixes');