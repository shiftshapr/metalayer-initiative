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
    return `<div class="avatar-initial" style="width: 32px; height: 32px; border-radius: 50%; background: ${window.AVATAR_FALLBACK_COLOR || '#ccc'}; color: white; display: flex; align-items: center; justify-content: center; font-weight: bold;">${initial}</div>`;
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
    avatarHTML = `<div class="avatar" style="width: 32px; height: 32px; border-radius: 50%; background: ${window.AVATAR_FALLBACK_COLOR}; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 14px;">${(author.name || 'U').charAt(0).toUpperCase()}</div>`;
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

async function loadChatHistory(communityId = null) {
  // COMP METHOD: Enhanced duplicate prevention
  if (isLoadingChatHistory) {
    console.log('🔍 CHAT_LOAD: Already loading chat history, skipping duplicate call');
    return;
  }
  
  // COMP METHOD: Check if messages are already loaded for this page - return BEFORE any clearing
  const currentPageId = window.currentUrlData?.pageId;
  const existingMessages = document.querySelectorAll('.message');
  if (lastLoadedPageId === currentPageId && existingMessages.length > 0) {
    console.log('🔍 CHAT_LOAD: Messages already loaded for this page, skipping reload');
    console.log('🔍 CHAT_LOAD: Existing messages:', existingMessages.length);
    return;
  }
  
  // COMP METHOD: Chrome internal pages work normally (like COMP)
  const currentUri = window.currentUrlData?.rawUrl;
  if (currentUri && (currentUri.startsWith('chrome://') || currentUri.startsWith('chrome-extension://'))) {
    console.log('🔍 CHAT_LOAD: Chrome internal page detected - processing normally like COMP');
    // Continue with normal message loading like COMP method
  }
  
  // COMP METHOD FIX: Clear messages ONLY ONCE when switching pages
  const chatMessages = document.querySelector('.chat-messages');
  const pageChanged = lastLoadedPageId !== currentPageId;
  
  if (pageChanged) {
    console.log(`🔍 CHAT_LOAD: Page changed from ${lastLoadedPageId} to ${currentPageId}, clearing messages`);
    if (chatMessages) {
      chatMessages.innerHTML = '';
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
    
    // Check if we're reloading the same URI unnecessarily
    if (lastLoadedUri === currentUri) {
      // CRITICAL FIX: Check if messages are still visible in the DOM
      const chatMessages = document.querySelector('.chat-messages');
      if (chatMessages) {
        const visibleMessages = chatMessages.querySelectorAll('.message:not([style*="display: none"])');
        const hasPlaceholder = chatMessages.innerHTML.includes('No messages yet');
        
        if (visibleMessages.length > 0) {
          console.log('CHAT_LOAD: Messages are still visible, skipping reload');
          return;
        } else if (!hasPlaceholder) {
          // Continue with reload to restore messages
        } else {
          return;
        }
      } else {
        }
    }
    
    // Messages arrive via Supabase real-time
    
    // Add a longer delay to ensure server has processed any recent messages
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Update last loaded URI
    lastLoadedUri = currentUri;
    
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

              // Ensure author enrichment for history path before render
              let postForRender = mainThreadPost;
              try {
                const needsEnrichment = !postForRender?.author || !postForRender?.author?.avatarUrl;
                if (needsEnrichment && typeof convertSupabaseMessageToAPIFormat === 'function') {
                  postForRender = await convertSupabaseMessageToAPIFormat(postForRender);
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
  } finally {
    // Reset loading flag
    isLoadingChatHistory = false;
  }
}



async function handleMessageFocus(message) {
  try {
    
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
  }
}

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
      const reactionData = await window.api.request(`/v1/reactions/by-id/${reaction.id}`, { method: 'GET', allow404: true });
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
  
  // Check against stored user ID - use window.currentUser
  const currentUserId = window.currentUser?.id || window.currentUser?.user_id;
  
  const authorId = message.authorId || (message.author && (message.author.id || message.author.user_id));
  return authorId === currentUserId && messageTime > oneHourAgo;
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
    
    console.log('🔗 SHARE: Message link created and copied:', messageUrl);
  } catch (error) {
    console.error('🔗 SHARE: Failed to copy message link:', error);
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

// Function to update visual hierarchy of messages - TOP-line approach with vertical lines
function updateMessageVisualHierarchy() {
  const chatMessages = document.querySelector('.chat-messages');
  if (!chatMessages) return;
  
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
  
  // Update visual hierarchy for each conversation
  Object.values(conversationGroups).forEach(messages => {
    const threadStarter = messages.find(msg => !msg.classList.contains('message-reply'));
    const replies = messages.filter(msg => msg.classList.contains('message-reply') && msg.classList.contains('visible'));
    
    if (threadStarter && replies.length > 0) {
      // Add has-replies class to thread starter for vertical line
      threadStarter.classList.add('has-replies');
      
      // Calculate vertical line height
      setTimeout(() => {
        updateVerticalLineHeight(threadStarter, replies);
      }, 10);
    } else if (threadStarter) {
      threadStarter.classList.remove('has-replies');
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
  
  // Determine message type and add appropriate classes
  if (message.isReply) {
    messageDiv.className = 'message message-reply thread-reply';
  } else {
    messageDiv.className = 'message thread-starter';
    
    if (message.hasReplies) {
      messageDiv.classList.add('has-replies');
    }
  }
  
  messageDiv.dataset.messageId = message.id;
  messageDiv.dataset.conversationId = message.conversationId;
  messageDiv.dataset.authorId = message.authorId || message.author?.id || message.author?.user_id;
  
  // ROOT CAUSE FIX: Always fetch author data from backend (source of truth)
  // convertSupabaseMessageToAPIFormat might have wrong data, so double-check here
  let author = message.author;
  const messageUserId = message.user_id || message.AppUser?.id || message.author?.id || message.authorId;
  
  // ROOT CAUSE FIX: Always fetch from backend if we have userId - backend is source of truth
  if (window.api && messageUserId && messageUserId !== 'unknown') {
    try {
      const resp = await window.api.request(`/v1/users/${encodeURIComponent(messageUserId)}`, { method: 'GET', allow404: true });
      if (resp) {
        console.log('✅ ADD_MESSAGE: Fetched author from backend (source of truth):', resp.name);
        // Always use backend data - it's the correct author
        author = {
          name: resp.name || 'Unknown',
          handle: resp.handle || resp.name || 'Unknown',
          id: resp.id || messageUserId,
          user_id: resp.id || messageUserId,
          avatarUrl: resp.avatarUrl || null,
          auraColor: author?.auraColor || null // Keep aura color from convertSupabaseMessageToAPIFormat if set
        };
      } else {
        console.warn('⚠️ ADD_MESSAGE: Backend returned no author data for userId:', messageUserId);
      }
    } catch (e) {
      console.warn('⚠️ ADD_MESSAGE: Backend author fetch failed, using existing author data:', e);
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
  
  const reactionButton = `<button class="reaction-btn" data-message-id="${message.id}" title="Add reaction" style="background: none; border: none; cursor: pointer; padding: 4px; border-radius: 4px; font-size: 14px; display: flex; align-items: center; gap: 4px;">🔘<span class="icon-count" style="font-size: 9px; margin-left: 2px; font-weight: normal; color: #666; display: none;"></span></button>`;
  const replyButton = `<button class="inline-reply-btn" data-message-id="${message.id}" title="Reply to message" style="background: none; border: none; cursor: pointer; padding: 4px; border-radius: 4px; font-size: 14px;">💬</button>`;
  
  // Add thread toggle for first post in thread that has replies
  let threadToggleButton = '';
  if (message.hasReplies) {
    threadToggleButton = `<button class="thread-toggle-btn" data-thread-id="${message.conversationId}" title="Show thread replies" data-expanded="false">📂<span class="icon-count ${hasUnseenReplies ? 'unseen' : ''}">${replyCount}</span></button>`;
  }
  
  // COMP METHOD: Use exact COMP message action menu structure
  const canEdit = messageUserId === (window.currentUser?.id || window.currentUser?.user_id) || 
                  message.user_id === window.currentUser?.id ||
                  message.authorId === window.currentUser?.id || 
                  message.authorId === window.currentUser?.user_id ||
                  (message.author?.id || message.author?.user_id) === (window.currentUser?.id || window.currentUser?.user_id) ||
                  (message.AppUser?.id || message.AppUser?.user_id) === (window.currentUser?.id || window.currentUser?.user_id);
  const messageActionMenu = canEdit ? `
    <div class="message-actions-new" style="opacity: 1 !important; display: flex !important; visibility: visible !important;">
      <button class="message-action-btn edit-btn" data-message-id="${message.id}" title="Edit message" style="background: none; border: none; cursor: pointer; padding: 4px; border-radius: 4px; font-size: 14px;">✏️</button>
      <button class="message-action-btn delete-btn" data-message-id="${message.id}" title="Delete message" style="background: none; border: none; cursor: pointer; padding: 4px; border-radius: 4px; font-size: 14px;">🗑️</button>
    </div>
  ` : '';
  
  // Convert URLs to clickable links
  const contentWithLinks = convertUrlsToLinks(message.body || message.content);
  
  // Always render an <img> for the avatar to keep layout stable; fill with real URL
  let resolvedAvatarUrl = null;
  try {
    if (window.AvatarUtils && typeof window.AvatarUtils.getAvatarUrl === 'function') {
      const data = await window.AvatarUtils.getAvatarUrl(author, 'message');
      resolvedAvatarUrl = data?.avatarUrl || null;
    }
  } catch (_) {}
  // Last-mile enrichment if still missing: try visibility/AppUser directly
  if (!resolvedAvatarUrl) {
    try {
      const authorId = author?.id || author?.user_id || message.user_id || message.authorId;
      if (authorId && window.currentVisibilityDataUnfiltered?.active) {
        const v = window.currentVisibilityDataUnfiltered.active.find(u => u.id === authorId || u.userId === authorId);
        if (v?.avatarUrl && !v.avatarUrl.includes('default-user')) {
          resolvedAvatarUrl = v.avatarUrl;
        }
      }
      // Final attempt: backend API resolver (joins AppUser)
      if (!resolvedAvatarUrl && authorId && window.api?.request) {
        try {
          const userResp = await window.api.request(`/v1/users/${encodeURIComponent(authorId)}`, { method: 'GET', allow404: true });
          if (userResp && userResp.avatarUrl) {
            resolvedAvatarUrl = userResp.avatarUrl;
          }
        } catch (_) {}
      }
    } catch (_) {}
  }
  resolvedAvatarUrl = resolvedAvatarUrl || author.avatarUrl || '';

  messageDiv.innerHTML = `
    <div class="avatar-container"><img src="${resolvedAvatarUrl}" alt="${senderName}" style="width: 32px; height: 32px; border-radius: 50%; object-fit: cover; border: 2px solid ${author.auraColor || window.AVATAR_FALLBACK_COLOR};" referrerpolicy="no-referrer" data-author-id="${author.id || author.user_id || ''}"></div>
    <div class="message-content-wrapper">
      <div class="message-header-new">
        <span class="message-sender-name">${senderName}${communityName ? ` • ${communityName}` : ''}</span>
        <span class="message-time-new">${formatMessageTime(message.createdAt)}</span>
        <div class="message-actions-new" style="opacity: 1 !important; display: flex !important; visibility: visible !important;">
          ${messageActionMenu}
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
  
  // COMP METHOD: Handle reply indenting after DOM update
  if (message.parentId || message.isReply) {
    console.log('🔧 COMP_REPLY_FIX: Message is a reply, adding indentation');
    
    // Add COMP-style reply styling and indentation
    messageDiv.style.marginLeft = '30px';
    messageDiv.style.borderLeft = `4px solid ${window.AVATAR_FALLBACK_COLOR}`;
    messageDiv.style.paddingLeft = '15px';
    messageDiv.style.backgroundColor = '#f8f9fa';
    messageDiv.classList.add('reply-message');
    
    // Add reply indicator like COMP
    const replyIndicator = document.createElement('div');
    replyIndicator.className = 'reply-indicator';
    replyIndicator.style.cssText = `
      font-size: 12px;
      color: ${window.AVATAR_FALLBACK_COLOR};
      margin-bottom: 8px;
      font-weight: 500;
      display: flex;
      align-items: center;
    `;
    replyIndicator.innerHTML = `
      <span style="margin-right: 5px;">↳</span>
      <span>Reply to ${message.parentAuthor || 'previous message'}</span>
    `;
    
    messageDiv.insertBefore(replyIndicator, messageDiv.firstChild);
    
    // Add visual connection to parent like COMP
    const parentElement = document.querySelector(`[data-message-id="${message.parentId}"]`);
    if (parentElement) {
      parentElement.classList.add('has-replies');
      parentElement.style.borderBottom = '2px solid #e9ecef';
    }
    
    console.log(`✅ COMP_REPLY_FIX: Added proper reply indentation to message ${message.id}`);
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
  
  // Scroll to bottom
  chatMessages.scrollTop = chatMessages.scrollHeight;
  
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
function formatMessageTime(createdAt) {
  if (!createdAt) return new Date().toLocaleTimeString();
  return new Date(createdAt).toLocaleTimeString();
}

// REMOVED: Duplicate canUserEditMessage and getMessageActionMenu functions
// Using the complete versions defined earlier (lines 1666 and 1624)

// Function to add message action listeners
function addMessageActionListeners(messageDiv, message) {
  console.log('🔧 MESSAGE_ACTIONS: Adding event listeners for message:', message.id);
  
  // Reaction button
  const reactionBtn = messageDiv.querySelector('.reaction-btn');
  if (reactionBtn) {
    console.log('🔧 REACTIONS: Adding click handler to reaction button for message:', message.id);
    reactionBtn.addEventListener('click', async (e) => {
      e.preventDefault();
      e.stopPropagation();
      console.log('🔘 REACTION: Reaction button clicked for message:', message.id);
      console.log('🔘 REACTION: Event target:', e.target);
      console.log('🔘 REACTION: Button element:', reactionBtn);
      
      // COMP METHOD: Show reaction modal (exact COMP approach)
      if (window.showReactionModal) {
        console.log('🔘 REACTION: Calling showReactionModal...');
        window.showReactionModal(message.id);
      } else {
        console.error('❌ REACTIONS: showReactionModal function not found');
      }
    });
    
    // Load existing reactions for this message
    window.loadMessageReactions(message.id, reactionBtn);
    
    // COMP METHOD: Set up real-time reaction subscription for this message
    setupReactionSubscription(message.id);
  }
  
  // Reply button - COMP METHOD
  const replyBtn = messageDiv.querySelector('.inline-reply-btn');
  if (replyBtn) {
    replyBtn.addEventListener('click', (e) => {
      e.preventDefault();
      console.log('💬 REPLY: COMP METHOD - Reply button clicked for message:', message.id);
      
      // COMP METHOD: Implement reply functionality
      window.handleReply(message);
      const chatInput = document.getElementById('chat-textarea');
      if (chatInput) {
        // Focus the input and add reply indicator
        chatInput.focus();
        chatInput.placeholder = `Reply to ${message.author?.name || 'message'}...`;
        
        // Set reply context for message sending
        chatInput.dataset.replyingTo = message.id;
        chatInput.dataset.replyAuthor = message.author?.name || 'message';
        
        // Add visual indicator
        chatInput.style.border = '2px solid #4ECDC4';
        chatInput.style.backgroundColor = '#f0f8ff';
        
        console.log('💬 REPLY: Set reply context for message:', message.id);
        console.log('💬 REPLY: Reply author:', message.author?.name);
      }
    });
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
  
  // Edit button
  const editBtn = messageDiv.querySelector('.edit-btn');
  if (editBtn) {
    editBtn.addEventListener('click', (e) => {
      e.preventDefault();
      console.log('✏️ EDIT: Edit button clicked for message:', message.id);
      
      // COMP RESTORATION: Implement edit functionality
      const messageContent = messageDiv.querySelector('.message-content');
      const chatInput = document.getElementById('chat-textarea');
      
      if (messageContent && chatInput) {
        // Set the input to edit mode
        chatInput.value = messageContent.textContent;
        chatInput.dataset.editingMessageId = message.id;
        chatInput.focus();
        
        // Update placeholder
        chatInput.placeholder = 'Edit your message...';
        
        console.log('✏️ EDIT: Entered edit mode for message:', message.id);
      }
    });
  }
  
  // Delete button
  const deleteBtn = messageDiv.querySelector('.delete-btn');
  if (deleteBtn) {
    deleteBtn.addEventListener('click', (e) => {
      e.preventDefault();
      console.log('🗑️ DELETE: Delete button clicked for message:', message.id);
      
      // COMP METHOD: Use the proper handleDeleteMessage function
      handleDeleteMessage(message);
    });
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
  
  console.log('✅ MESSAGE_ACTIONS: Event listeners added successfully');
}

// Function to handle message focus
function handleMessageFocus(message) {
  console.log('🎯 FOCUS: Focusing message:', message.id);
  // TODO: Implement message focus functionality
}

// Function to toggle thread replies
function toggleThreadReplies(conversationId, messageDiv) {
  console.log('📂 THREAD: Toggling thread replies for:', conversationId);
  // TODO: Implement thread toggle functionality
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
    reactionBtn.innerHTML = '🔘' + existingCountText;
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

// Export for global access
console.log('🔍 CANOPI: About to export loadChatHistory to window');
window.CanopiModule = CanopiModule;
window.loadChatHistory = loadChatHistory;
console.log('🔍 CANOPI: loadChatHistory exported to window:', typeof window.loadChatHistory);
window.addMessageToChat = addMessageToChat;
window.sendMessageViaSupabase = sendMessageViaSupabase;
window.updateMessageInChat = updateMessageInChat;

// Ensure loadChatHistory is available immediately
console.log('🔍 CANOPI: loadChatHistory exported to window:', typeof window.loadChatHistory);
window.removeMessageFromChat = removeMessageFromChat;
window.checkAndAddThreadToggle = checkAndAddThreadToggle;
window.setupMessageInputEventListeners = setupMessageInputEventListeners;
window.sendChatMessage = sendChatMessage;
window.convertUrlsToLinks = convertUrlsToLinks;
window.updateMessageVisualHierarchy = updateMessageVisualHierarchy;

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
window.toggleThreadReplies = function(conversationId, messageDiv) {
  console.log('🔧 REPLIES: COMP METHOD - Toggling thread replies for conversation:', conversationId);
  
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
    console.error('❌ REACTIONS: COMP METHOD - Error loading reactions:', error);
    // COMP METHOD: Fallback to empty array
    await window.updateReactionDisplay(messageId, []);
  }
};

// COMP METHOD: Update reaction display
window.updateReactionDisplay = async function(messageId, reactions) {
  console.log('🔧 REACTIONS: COMP METHOD - Updating reaction display for message:', messageId);
  console.log('🔧 REACTIONS: Reactions to display:', reactions);
  
  const messageElement = document.querySelector(`[data-message-id="${messageId}"]`);
  if (!messageElement) return;
  
  const reactionBtn = messageElement.querySelector('.reaction-btn');
  if (!reactionBtn) return;
  
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
  
  // CRITICAL USER PREFERENCE: Show user's own reaction if they have one, otherwise ALWAYS blank (🔘)
  // NEVER show other users' reactions when current user has no reaction - user explicitly does not want this
  let displayEmoji = '🔘'; // Default blank state
  if (userReaction) {
    // User has a reaction - show it
    displayEmoji = userReaction.emoji;
    console.log('🔧 REACTIONS: COMP METHOD - Showing user\'s own reaction:', displayEmoji);
  } else {
    // User has NO reaction - ALWAYS show blank (🔘), regardless of other users' reactions
    displayEmoji = '🔘';
    console.log('🔧 REACTIONS: COMP METHOD - User has no reaction, showing blank (🔘)');
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
    
    // COMP METHOD: Handle reply hierarchy after DOM update
    setTimeout(() => {
      if (message.parentId && message.parentId !== null) {
        console.log('🔧 REPLY HIERARCHY: COMP METHOD - Message is a reply, adding to parent thread');
        addReplyToParentThread(message);
      }
    }, 100);
    
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
  
  // Create reply container if it doesn't exist
  let replyContainer = parentMessage.querySelector('.thread-replies');
  if (!replyContainer) {
    replyContainer = document.createElement('div');
    replyContainer.className = 'thread-replies';
    replyContainer.style.cssText = `
      margin-left: 20px;
      border-left: 2px solid #e0e0e0;
      padding-left: 10px;
      margin-top: 5px;
    `;
    parentMessage.appendChild(replyContainer);
  }
  
  // Create reply element
  const replyElement = document.createElement('div');
  replyElement.className = 'thread-reply';
  replyElement.setAttribute('data-message-id', replyMessage.id);
  replyElement.style.cssText = `
    margin-bottom: 8px;
    padding: 8px;
    background: #f5f5f5;
    border-radius: 4px;
    border-left: 3px solid #007bff;
  `;
  
  // Add reply content
  replyElement.innerHTML = `
    <div class="reply-content" style="display: flex; align-items: center; gap: 8px;">
      <div class="reply-avatar" style="width: 24px; height: 24px; border-radius: 50%; background: #ddd;"></div>
      <div class="reply-text" style="flex: 1;">
        <div class="reply-author" style="font-weight: bold; font-size: 12px; color: #666;">
          ${replyMessage.author?.name || 'User'}
        </div>
        <div class="reply-body" style="font-size: 14px;">
          ${replyMessage.body || replyMessage.content || ''}
        </div>
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
        
        // Update UI optimistically - show blank (🔘) immediately
        const countSpan = reactionBtn.querySelector('.icon-count');
        if (countSpan) {
          // Keep count span for now, will be updated by reload
          reactionBtn.innerHTML = '🔘';
          reactionBtn.appendChild(countSpan);
        } else {
          reactionBtn.innerHTML = '🔘';
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
          reactionBtn.innerHTML = '🔘<span class="icon-count" style="font-size: 9px; margin-left: 2px; font-weight: normal; color: #666; display: none;"></span>';
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
    
    for (const messageElement of messageElements) {
      const messageId = messageElement.dataset.messageId;
      const avatarElement = messageElement.querySelector('.message-avatar');
      
      if (avatarElement) {
        // Extract user email from the message element
        const authorElement = messageElement.querySelector('.message-author');
        if (authorElement) {
          const userId = authorElement.getAttribute('data-author-id') || authorElement.textContent.trim();
          console.log('🔧 AVATARS: Refreshing avatar for user:', userId);
          
          // COMP METHOD: Use the same avatar resolution logic as message creation
          try {
            const author = {
              id: userId,
              user_id: userId,
              name: userId,
              avatarUrl: null
            };
            
            // Get the latest aura color from presence data
            const currentUserId = window.currentUser?.id || window.currentUser?.user_id;
            if ((author.id || author.user_id) === (window.currentUser?.id || window.currentUser?.user_id)) {
              const currentAuraColor = getCurrentUserAvatarBgColor();
              if (currentAuraColor && currentAuraColor !== window.AVATAR_FALLBACK_COLOR) {
                author.auraColor = currentAuraColor;
                console.log('🔧 AVATARS: Using current user aura color:', currentAuraColor);
              }
            } else {
              const latestAuraColor = getLatestAuraColorFromPresence(author.id || author.user_id);
              if (latestAuraColor && latestAuraColor !== window.AVATAR_FALLBACK_COLOR) {
                author.auraColor = latestAuraColor;
                console.log('🔧 AVATARS: Using real-time aura color for', author.id || author.user_id, ':', latestAuraColor);
              }
            }
            
            // Recreate avatar with updated data
            const newAvatarHTML = await getSenderAvatar(author);
            avatarElement.innerHTML = newAvatarHTML;
            console.log('✅ AVATARS: Updated avatar for', userId);
          } catch (error) {
            console.error('❌ AVATARS: Error refreshing avatar for', userId, ':', error);
          }
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
      const expectedEmoji = userReaction ? userReaction.emoji : '🔘';
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
window.refreshAllReactionDisplays = refreshAllReactionDisplays;
window.refreshAllMessageAvatars = refreshAllMessageAvatars;

console.log('✅ CanopiModule loaded with COMP method fixes');
