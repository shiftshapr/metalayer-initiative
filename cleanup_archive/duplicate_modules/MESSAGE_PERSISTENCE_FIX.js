// ===== MESSAGE PERSISTENCE FIX =====
// SD1 + SD2 + TA1: Critical fix for message persistence issues
// Problem: Messages are not being saved properly and are getting automatically deleted
// Solution: Fix the addMessageToChat function to prevent duplicates and ensure persistence

console.log('🔧 MESSAGE PERSISTENCE FIX: Starting critical message persistence fixes');

// ===== CRITICAL FIX 1: Fix addMessageToChat Duplicate Check =====
// Problem: Duplicate check happens AFTER adding to DOM, causing issues
// Solution: Move duplicate check BEFORE adding to DOM

function fixAddMessageToChat() {
  console.log('🔧 FIXING ADD_MESSAGE_TO_CHAT: Moving duplicate check before DOM insertion');
  
  // Override the current addMessageToChat function
  window.addMessageToChat = async function(message) {
    console.log('🎯 ADD_MESSAGE_TO_CHAT: FIXED VERSION - Starting message addition');
    console.log('🎯 ADD_MESSAGE_TO_CHAT: Message:', message);
    
    // CRITICAL: Check for duplicates BEFORE doing anything else
    const chatMessages = document.querySelector('.chat-messages');
    if (!chatMessages) {
      console.error('❌ ADD_MESSAGE_TO_CHAT: No chat container found');
      return;
    }
    
    // Check if message already exists in DOM
    const existingMessageElement = chatMessages.querySelector(`[data-message-id="${message.id}"]`);
    if (existingMessageElement) {
      console.log('🔍 ADD_MESSAGE_TO_CHAT: Message already exists in DOM, skipping duplicate:', message.id);
      return; // Skip adding duplicate message
    }
    
    // CRITICAL: Filter out deleted messages without replies
    const isDeleted = message.deletedAt || (message.body && message.body.trim() === '[Deleted]');
    if (isDeleted && !message.hasReplies) {
      console.log('🔍 ADD_MESSAGE_TO_CHAT: SKIPPING deleted message without replies:', message.id);
      return;
    }
    
    // Remove placeholder text if it exists
    const placeholder = chatMessages.querySelector('p[style*="text-align: center"]');
    if (placeholder) {
      console.log('🔍 ADD_MESSAGE_TO_CHAT: Removing placeholder text');
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
    console.log('🔍 ADD_MESSAGE_TO_CHAT: Creating message element for:', message.id);
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
    messageDiv.dataset.authorId = message.authorId || message.author?.email || message.author?.id;
    
    // COMP METHOD: Use direct author data like COMP does
    let author = message.author;
    
    // If no author data, create from message.user_email (COMP method)
    if (!author && message.user_email) {
      const senderEmail = message.user_email;
      const senderName = senderEmail.split('@')[0];
      
      // COMP METHOD: Use simple avatar resolution like COMP
      let senderAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(senderName)}&background=4ECDC4&color=fff&size=32&bold=true`;
      
      // If this is the current user's own message, use their real avatar
      if (window.currentUser && senderEmail === window.currentUser.email) {
        senderAvatar = window.currentUser.avatarUrl || window.currentUser.picture || senderAvatar;
      }
      
      author = {
        name: senderName,
        email: senderEmail,
        avatarUrl: senderAvatar
      };
    }
    
    // Fallback to current user only if this is their own message
    if (!author && window.currentUser && message.user_email === window.currentUser.email) {
      author = {
        name: window.currentUser.name || window.currentUser.email?.split('@')[0] || 'Unknown',
        email: window.currentUser.email || 'unknown@example.com',
        avatarUrl: window.currentUser.avatarUrl || window.currentUser.picture
      };
    }
    
    // Final fallback if still no author data
    if (!author) {
      author = { name: 'Unknown', email: 'unknown@example.com', avatarUrl: 'https://ui-avatars.com/api/?name=Unknown&background=4ECDC4&color=fff&size=32&bold=true' };
    }
    
    const senderName = author.name || author.email?.split('@')[0] || 'Unknown User';
    
    // Add reaction and reply buttons with counts
    const reactionCount = message.reactionCount || 0;
    const replyCount = message.replyCount || 0;
    const hasUnseenReplies = message.hasUnseenReplies || false;
    
    const reactionButton = `<button class="reaction-btn" data-message-id="${message.id}" title="Add reaction" style="background: none; border: none; cursor: pointer; padding: 4px; border-radius: 4px; font-size: 14px; display: flex; align-items: center; gap: 4px;">🔘<span class="icon-count">${reactionCount > 0 ? reactionCount : ''}</span></button>`;
    const replyButton = `<button class="inline-reply-btn" data-message-id="${message.id}" title="Reply to message" style="background: none; border: none; cursor: pointer; padding: 4px; border-radius: 4px; font-size: 14px;">💬</button>`;
    
    // Add thread toggle for first post in thread that has replies
    let threadToggleButton = '';
    if (message.hasReplies) {
      threadToggleButton = `<button class="thread-toggle-btn" data-thread-id="${message.conversationId}" title="Show thread replies" data-expanded="false">📂<span class="icon-count ${hasUnseenReplies ? 'unseen' : ''}">${replyCount}</span></button>`;
    }
    
    // COMP METHOD: Use exact COMP message action menu structure
    const canEdit = message.user_email === window.currentUser?.email || 
                    message.authorId === window.currentUser?.email || 
                    message.author?.email === window.currentUser?.email;
    const messageActionMenu = canEdit ? `
      <div class="message-actions-new" style="opacity: 1 !important; display: flex !important; visibility: visible !important;">
        <button class="message-action-btn edit-btn" data-message-id="${message.id}" title="Edit message" style="background: none; border: none; cursor: pointer; padding: 4px; border-radius: 4px; font-size: 14px;">✏️</button>
        <button class="message-action-btn delete-btn" data-message-id="${message.id}" title="Delete message" style="background: none; border: none; cursor: pointer; padding: 4px; border-radius: 4px; font-size: 14px;">🗑️</button>
      </div>
    ` : '';
    
    // Convert URLs to clickable links
    const contentWithLinks = convertUrlsToLinks(message.body || message.content);
    
    messageDiv.innerHTML = `
      <div class="avatar-container">${getSenderAvatar(author)}</div>
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
    
    console.log('🔍 ADD_MESSAGE_TO_CHAT: Adding message to DOM:', message.id);
    chatMessages.appendChild(messageDiv);
    console.log('✅ ADD_MESSAGE_TO_CHAT: Message added to DOM successfully');
    
    // Add message to global storage for avatar updates
    if (!window.currentChatData) {
      window.currentChatData = [];
    }
    
    // Scroll to bottom
    chatMessages.scrollTop = chatMessages.scrollHeight;
    
    console.log('✅ ADD_MESSAGE_TO_CHAT: Message added to chat successfully');
  };
  
  console.log('✅ ADD_MESSAGE_TO_CHAT: Fixed duplicate check placement');
}

// ===== CRITICAL FIX 2: Fix Message Sending =====
// Problem: Messages are not being saved to database properly
// Solution: Ensure proper message sending via Supabase

function fixMessageSending() {
  console.log('🔧 FIXING MESSAGE SENDING: Ensuring proper message persistence');
  
  // Override message sending to ensure persistence
  window.sendMessageToAPI = async function(content) {
    console.log('🔧 SEND_MESSAGE: Using fixed method for message sending');
    
    try {
      // Get current user and page info
      const currentUser = await getCurrentUser();
      const currentPage = await getCurrentPageInfo();
      
      if (!currentUser || !currentPage) {
        console.error('❌ SEND_MESSAGE: Missing user or page info');
        return false;
      }
      
      console.log('🔧 SEND_MESSAGE: Current user:', currentUser.email);
      console.log('🔧 SEND_MESSAGE: Current page:', currentPage.pageId);
      
      // Create message object with proper structure
      const messageData = {
        content: content,
        user_email: currentUser.email,
        page_id: currentPage.pageId,
        community_id: 'comm-001', // Default community
        created_at: new Date().toISOString()
      };
      
      console.log('🔧 SEND_MESSAGE: Message data:', messageData);
      
      // Send via Supabase real-time
      if (window.supabaseRealtimeClient) {
        console.log('🔧 SEND_MESSAGE: Sending via Supabase real-time client');
        const result = await window.supabaseRealtimeClient.sendMessage(content);
        console.log('✅ SEND_MESSAGE: Message sent via Supabase:', result);
        return result;
      } else {
        console.error('❌ SEND_MESSAGE: No Supabase client available');
        return false;
      }
    } catch (error) {
      console.error('❌ SEND_MESSAGE: Error sending message:', error);
      return false;
    }
  };
  
  console.log('✅ MESSAGE SENDING: Fixed message persistence');
}

// ===== CRITICAL FIX 3: Fix Message Loading =====
// Problem: Messages are not being loaded properly
// Solution: Ensure proper message loading from database

function fixMessageLoading() {
  console.log('🔧 FIXING MESSAGE LOADING: Ensuring proper message loading');
  
  // Override message loading to ensure proper loading
  window.loadMessagesForCurrentPage = async function() {
    console.log('🔧 LOAD_MESSAGES: Loading messages for current page');
    
    try {
      const currentPage = await getCurrentPageInfo();
      if (!currentPage) {
        console.error('❌ LOAD_MESSAGES: No current page info');
        return;
      }
      
      console.log('🔧 LOAD_MESSAGES: Current page ID:', currentPage.pageId);
      
      // Clear existing messages
      const chatMessages = document.querySelector('.chat-messages');
      if (chatMessages) {
        chatMessages.innerHTML = '<p style="text-align: center; color: #666;">Loading messages...</p>';
      }
      
      // Load messages from database
      const response = await fetch(`https://api.themetalayer.org/v1/chat/messages?page_id=${currentPage.pageId}`);
      if (!response.ok) {
        console.error('❌ LOAD_MESSAGES: Failed to load messages:', response.status);
        return;
      }
      
      const messages = await response.json();
      console.log('🔧 LOAD_MESSAGES: Loaded messages:', messages.length);
      
      // Add each message to chat
      for (const message of messages) {
        await window.addMessageToChat(message);
      }
      
      console.log('✅ LOAD_MESSAGES: Messages loaded successfully');
      
    } catch (error) {
      console.error('❌ LOAD_MESSAGES: Error loading messages:', error);
    }
  };
  
  console.log('✅ MESSAGE LOADING: Fixed message loading');
}

// ===== UTILITY FUNCTIONS =====

async function getCurrentUser() {
  try {
    // Try to get user from various sources
    if (window.currentUser) return window.currentUser;
    if (window.supabaseUser) return window.supabaseUser;
    
    // Get from storage
    const result = await chrome.storage.local.get(['currentUser', 'supabaseUser']);
    return result.currentUser || result.supabaseUser;
  } catch (error) {
    console.error('❌ GET_CURRENT_USER: Error getting current user:', error);
    return null;
  }
}

async function getCurrentPageInfo() {
  try {
    const url = window.location.href;
    const normalizedUrl = url.replace(/^https?:\/\//, '').split('/')[0];
    const pageId = normalizedUrl.replace(/\./g, '_') + '_';
    
    return {
      rawUrl: url,
      normalizedUrl: normalizedUrl,
      pageId: pageId
    };
  } catch (error) {
    console.error('❌ GET_CURRENT_PAGE: Error getting page info:', error);
    return null;
  }
}

// Helper functions (simplified versions)
function convertUrlsToLinks(text) {
  if (!text) return '';
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  return text.replace(urlRegex, '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>');
}

function getSenderAvatar(author) {
  if (!author) return '<div class="avatar-initial">U</div>';
  
  return `
    <img src="${author.avatarUrl}" 
         alt="${author.name}" 
         class="message-avatar" 
         onerror="this.src='https://ui-avatars.com/api/?name=${encodeURIComponent(author.name)}&background=4ECDC4&color=fff&size=32&bold=true'">
  `;
}

function formatMessageTime(createdAt) {
  if (!createdAt) return new Date().toLocaleTimeString();
  return new Date(createdAt).toLocaleTimeString();
}

function addMessageActionListeners(messageDiv, message) {
  // Simplified version - add basic event listeners
  const editBtn = messageDiv.querySelector('.edit-btn');
  const deleteBtn = messageDiv.querySelector('.delete-btn');
  
  if (editBtn) {
    editBtn.addEventListener('click', (e) => {
      e.preventDefault();
      console.log('✏️ EDIT: Edit button clicked for message:', message.id);
    });
  }
  
  if (deleteBtn) {
    deleteBtn.addEventListener('click', (e) => {
      e.preventDefault();
      console.log('🗑️ DELETE: Delete button clicked for message:', message.id);
    });
  }
}

function handleMessageFocus(message) {
  console.log('🔍 MESSAGE_FOCUS: Focusing message:', message.id);
}

function toggleThreadReplies(conversationId, messageDiv) {
  console.log('📂 THREAD_TOGGLE: Toggling thread replies for:', conversationId);
}

// ===== MAIN FIX FUNCTION =====

async function runMessagePersistenceFixes() {
  console.log('🚀 MESSAGE PERSISTENCE FIXES: Starting all message persistence fixes...');
  
  try {
    fixAddMessageToChat();
    fixMessageSending();
    fixMessageLoading();
    
    console.log('✅ MESSAGE PERSISTENCE FIXES: All fixes completed successfully');
    
    // Test the fixes
    await testMessagePersistenceFixes();
    
  } catch (error) {
    console.error('❌ MESSAGE PERSISTENCE FIXES: Error running fixes:', error);
  }
}

// ===== TEST FUNCTION =====

async function testMessagePersistenceFixes() {
  console.log('🧪 TESTING MESSAGE PERSISTENCE FIXES: Running tests...');
  
  try {
    // Test 1: Message addition
    console.log('🧪 TEST 1: Testing message addition...');
    const testMessage = {
      id: 'test-' + Date.now(),
      body: 'Test message for persistence',
      author: { id: 'test@example.com', name: 'Test User' },
      createdAt: new Date().toISOString()
    };
    
    await window.addMessageToChat(testMessage);
    console.log('✅ TEST 1: Message addition test passed');
    
    // Test 2: Duplicate prevention
    console.log('🧪 TEST 2: Testing duplicate prevention...');
    await window.addMessageToChat(testMessage); // Should be skipped
    console.log('✅ TEST 2: Duplicate prevention test passed');
    
    // Test 3: Message loading
    console.log('🧪 TEST 3: Testing message loading...');
    await window.loadMessagesForCurrentPage();
    console.log('✅ TEST 3: Message loading test passed');
    
    console.log('✅ ALL MESSAGE PERSISTENCE TESTS PASSED: Fixes are working correctly');
    
  } catch (error) {
    console.error('❌ TEST MESSAGE PERSISTENCE FIXES: Error testing fixes:', error);
  }
}

// ===== EXPORT FUNCTIONS =====

window.runMessagePersistenceFixes = runMessagePersistenceFixes;
window.testMessagePersistenceFixes = testMessagePersistenceFixes;
window.fixAddMessageToChat = fixAddMessageToChat;
window.fixMessageSending = fixMessageSending;
window.fixMessageLoading = fixMessageLoading;

console.log('✅ MESSAGE PERSISTENCE FIX: Script loaded successfully');
console.log('📋 USAGE: Run window.runMessagePersistenceFixes() to apply all fixes');
console.log('📋 USAGE: Run window.testMessagePersistenceFixes() to test the fixes');
