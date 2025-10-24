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
      const communitiesData = await getState('communities');
      const communities = communitiesData || [];
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
    console.log(`DELETED_MSG_DEBUG: [BUILD v1.0] === DELETED MESSAGE ANALYSIS ===`, null, 'general');
    
    // Only show deleted messages if they have replies
    if (!message.hasReplies) {
      return;
    }
    
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

// Convert URLs to clickable links
function convertUrlsToLinks(text) {
  // URL regex pattern
  if (!text) return '';
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  return text.replace(urlRegex, '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>');
}

function getSenderAvatar(author) {
  if (!author) return getSenderInitial('Unknown');
  
  // Always try to get the latest aura color from presence data
  // This ensures cross-profile updates work correctly for ALL users
  const currentUserEmail = getCurrentUserEmail();
  if (author.email === currentUserEmail) {
    // For current user's messages, use current aura color
    const currentAuraColor = getCurrentUserAvatarBgColor();
    if (currentAuraColor) {
      author.auraColor = currentAuraColor;
      }
  } else {
    // For other users' messages, try to get the latest aura color from presence data
    // This ensures real-time aura updates for all users
    const latestAuraColor = getLatestAuraColorFromPresence(author.email);
    if (latestAuraColor) {
      author.auraColor = latestAuraColor;
      } else {
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
      
      // Create a map of user emails to their current aura colors
      const auraColorMap = {};
      presenceData.active.forEach(user => {
        // Check both email and userId fields for user identification
        const userEmail = user.email || user.userId || user.id;
        if (userEmail && user.auraColor) {
          auraColorMap[userEmail] = user.auraColor;
          }
      });
      
      // Find all message containers and re-render their avatars with updated aura colors
      const messageContainers = document.querySelectorAll('.message');
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
                // Update the author's aura color
                author.auraColor = auraColorMap[userEmail];
                
                // Re-render the avatar with the updated aura color
                const newAvatarHTML = getSenderAvatar(author);
                avatarContainer.innerHTML = newAvatarHTML;
                
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
      hasUserEmail: !!message.userEmail,
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
    
    // Log current messages before clearing
    const currentMessages = chatMessages.querySelectorAll('.message');
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

  /**
   * Handle reaction button click
   */
  async function handleReactionClick(messageId, reactionType) {
    try {
      if (window.reactionsIntegration) {
        // Check if user already reacted with this type
        const existingReactions = await window.reactionsIntegration.reactionsManager.getReactions(messageId);
        const userReaction = existingReactions.find(r => 
          r.user_email === window.currentUser?.email && r.reaction_type === reactionType
        );
        
        if (userReaction) {
          // Remove reaction
          await window.reactionsIntegration.removeReaction(messageId, reactionType);
        } else {
          // Add reaction
          await window.reactionsIntegration.addReaction(messageId, reactionType);
        }
      }
    } catch (error) {
      console.error('❌ UI REACTIONS: Error handling reaction click:', error);
    }
  }

    /**
   * Load reactions for a specific message
   */
    async function loadMessageReactions(messageId, container) {
      try {
        // Get reactions from the reactions manager
        if (window.reactionsIntegration && window.reactionsIntegration.reactionsManager) {
          const reactions = await window.reactionsIntegration.reactionsManager.getReactions(messageId);
          
          if (reactions) {
            updateReactionsDisplay(container, reactions);
          }
        }
      } catch (error) {
        console.error('❌ UI REACTIONS: Error loading reactions:', error);
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
      if (!reactionGroups[reaction.reaction_type]) {
        reactionGroups[reaction.reaction_type] = [];
      }
      reactionGroups[reaction.reaction_type].push(reaction);
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
  const now = new Date();
  const messageDate = new Date(message.createdAt);
  const diffMs = now - messageDate;
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  
  // Get current user to check ownership - use window.currentUser from direct auth
  const currentUser = window.currentUser;
  
  // Use email for user identification - NO UUIDs
  let isOwner = false;
  if (currentUser && currentUser.email) {
    // Compare by email - the message should have author email
    const authorEmail = message.authorEmail || (message.author && message.author.email);
    isOwner = (authorEmail === currentUser.email);
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


async function loadMessageReactions(messageId, reactionBtn) {
  try {
    // First try to get reactions from the stored reactions data if available
    let reactions = [];
    // Find the parent message div (not the button itself)
    const messageDiv = reactionBtn.closest('.message');
    if (messageDiv) {
      const reactionsData = messageDiv.dataset.reactions;
      console.log(`📊 Stored reactions data:`, reactionsData, 'general');
      if (reactionsData) {
        reactions = JSON.parse(reactionsData);
      }
    } else {
      console.error(`No message div found for reaction button`, null, 'general');
    }
    
    // Fallback to API call if no conversation data
    if (reactions.length === 0) {
      // NO POLLING - Reactions arrive via Supabase real-time subscription
      // Real-time reactions are handled by handleReactionChange()
      reactions = []; // Empty for now, will be populated by real-time events
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
        
        console.log('REACTION_DEBUG: User reaction found');
        
        if (userReaction) {
          // Show the actual emoji from the database
          const emoji = userReaction.emoji || '👍';
          // Update the emoji but preserve the count span
          const countSpan = reactionBtn.querySelector('.icon-count');
          const countText = countSpan ? countSpan.textContent : '';
          reactionBtn.innerHTML = `${emoji}${countText ? `<span class="icon-count">${countText}</span>` : ''}`;
          reactionBtn.dataset.reaction = emoji;
        } else {
          console.error(`No user reaction found`);
        }
      } else {
        console.error(`No current user found`);
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
  
  // Add Enter key support for sending messages
  chatInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      sendChatMessage();
    }
  });
  
  console.log('✅ MESSAGE_INPUT: Message input event listeners added');
}

function sendChatMessage() {
  console.log('🚀🚀🚀 ============================================');
  console.log('🚀🚀🚀 SEND_CHAT_MESSAGE: ENTRY POINT');
  console.log('🚀🚀🚀 ============================================');
  
  const chatInput = document.getElementById('chat-textarea');
  if (!chatInput) {
    console.log('❌ SEND_CHAT_MESSAGE: chat-textarea not found');
    return;
  }
  
  console.log('🚀 SEND_CHAT_MESSAGE: Chat send triggered');
  console.log('🚀 SEND_CHAT_MESSAGE: chatInput element:', !!chatInput);
  console.log('🚀 SEND_CHAT_MESSAGE: chatInput value:', chatInput?.value);
  console.log('🚀 SEND_CHAT_MESSAGE: chatInput value length:', chatInput?.value?.length);
  
  // Check if we're in edit mode
  if (chatInput.dataset.editingMessageId) {
    console.log('✏️ SEND_CHAT_MESSAGE: In edit mode, skipping send');
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
    window.sendMessageViaSupabase(message).then((result) => {
      console.log('📡 SEND_CHAT_MESSAGE: Message sent successfully:', result);
      // Clear the input
      chatInput.value = '';
    }).catch((error) => {
      console.error('❌ SEND_CHAT_MESSAGE: Failed to send message:', error);
    });
  } else {
    console.log('❌ SEND_CHAT_MESSAGE: sendMessageViaSupabase not available');
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

// Export for global access
window.CanopiModule = CanopiModule;
window.loadChatHistory = loadChatHistory;
window.addMessageToChat = addMessageToChat;
window.sendMessageViaSupabase = sendMessageViaSupabase;
window.updateMessageInChat = updateMessageInChat;
window.removeMessageFromChat = removeMessageFromChat;
window.checkAndAddThreadToggle = checkAndAddThreadToggle;
window.setupMessageInputEventListeners = setupMessageInputEventListeners;
window.sendChatMessage = sendChatMessage;
window.convertUrlsToLinks = convertUrlsToLinks;
window.updateMessageVisualHierarchy = updateMessageVisualHierarchy;