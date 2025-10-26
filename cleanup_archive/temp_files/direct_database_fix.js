// ===== COMP METHOD FIX: DIRECT DATABASE ACCESS =====
// This script directly accesses the database to load messages, bypassing all skip logic

console.log('🔧 DIRECT DB FIX: Starting direct database access fix...');

function forceLoadMessagesFromDatabase() {
  console.log('🔧 DIRECT DB FIX: Forcing load messages from database...');
  
  // Get current page data
  const currentPageId = window.currentUrlData?.pageId;
  console.log('🔍 DIRECT DB FIX: Current page ID:', currentPageId);
  
  if (!currentPageId) {
    console.error('❌ DIRECT DB FIX: No page ID available');
    return;
  }
  
  // Try to access the API directly through different paths
  const apiPaths = [
    'window.apiModule',
    'window.MetaLayerAPI',
    'window.api',
    'window.APIModule'
  ];
  
  let apiModule = null;
  for (const path of apiPaths) {
    try {
      const module = eval(path);
      if (module && typeof module.getChatHistory === 'function') {
        apiModule = module;
        console.log('✅ DIRECT DB FIX: Found API module at:', path);
        break;
      }
    } catch (e) {
      // Continue to next path
    }
  }
  
  if (!apiModule) {
    console.log('🔧 DIRECT DB FIX: No API module found, trying direct Supabase access...');
    tryDirectSupabaseAccess();
    return;
  }
  
  // Call the API directly
  console.log('🔧 DIRECT DB FIX: Calling API directly...');
  apiModule.getChatHistory(currentPageId)
    .then(data => {
      console.log('🔍 DIRECT DB FIX: API response:', data);
      
      if (data && data.length > 0) {
        console.log('✅ DIRECT DB FIX: Found', data.length, 'messages in database');
        displayMessagesDirectly(data);
      } else {
        console.log('⚠️ DIRECT DB FIX: No messages found in database');
        // Try to get messages from a different endpoint
        tryAlternativeEndpoints();
      }
    })
    .catch(error => {
      console.error('❌ DIRECT DB FIX: API call failed:', error);
      tryDirectSupabaseAccess();
    });
}

function tryDirectSupabaseAccess() {
  console.log('🔧 DIRECT DB FIX: Trying direct Supabase access...');
  
  if (window.supabase && window.supabase.from) {
    console.log('🔧 DIRECT DB FIX: Using direct Supabase client...');
    
    const currentPageId = window.currentUrlData?.pageId;
    const currentUser = window.currentUser?.email;
    
    if (!currentPageId || !currentUser) {
      console.error('❌ DIRECT DB FIX: Missing page ID or user email');
      return;
    }
    
    // Query messages directly from Supabase
    window.supabase
      .from('messages')
      .select('*')
      .eq('page_id', currentPageId)
      .order('created_at', { ascending: true })
      .then(({ data, error }) => {
        if (error) {
          console.error('❌ DIRECT DB FIX: Supabase query failed:', error);
          return;
        }
        
        console.log('🔍 DIRECT DB FIX: Supabase response:', data);
        
        if (data && data.length > 0) {
          console.log('✅ DIRECT DB FIX: Found', data.length, 'messages in Supabase');
          displayMessagesDirectly(data);
        } else {
          console.log('⚠️ DIRECT DB FIX: No messages found in Supabase');
        }
      });
  } else {
    console.error('❌ DIRECT DB FIX: Supabase client not available');
  }
}

function tryAlternativeEndpoints() {
  console.log('🔧 DIRECT DB FIX: Trying alternative endpoints...');
  
  // Try to get messages from the API using different endpoints
  const endpoints = [
    '/api/messages',
    '/api/chat/history',
    '/api/messages/by-page',
    '/v1/messages'
  ];
  
  const currentPageId = window.currentUrlData?.pageId;
  const baseUrl = 'https://api.themetalayer.org';
  
  for (const endpoint of endpoints) {
    console.log(`🔧 DIRECT DB FIX: Trying endpoint: ${endpoint}`);
    
    fetch(`${baseUrl}${endpoint}?pageId=${currentPageId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${window.currentUser?.email || 'anonymous'}`
      }
    })
    .then(response => response.json())
    .then(data => {
      console.log(`🔍 DIRECT DB FIX: Endpoint ${endpoint} response:`, data);
      
      if (data && (data.messages || data.data || Array.isArray(data))) {
        const messages = data.messages || data.data || data;
        if (messages.length > 0) {
          console.log(`✅ DIRECT DB FIX: Found ${messages.length} messages from ${endpoint}`);
          displayMessagesDirectly(messages);
          return;
        }
      }
    })
    .catch(error => {
      console.log(`⚠️ DIRECT DB FIX: Endpoint ${endpoint} failed:`, error.message);
    });
  }
}

function displayMessagesDirectly(messages) {
  console.log('🔧 DIRECT DB FIX: Displaying messages directly...');
  
  const chatMessages = document.querySelector('.chat-messages');
  if (!chatMessages) {
    console.error('❌ DIRECT DB FIX: Chat messages container not found');
    return;
  }
  
  // Clear existing messages
  chatMessages.innerHTML = '';
  
  console.log('🔧 DIRECT DB FIX: Processing', messages.length, 'messages...');
  
  // Display each message
  messages.forEach((message, index) => {
    console.log(`🔧 DIRECT DB FIX: Processing message ${index + 1}:`, message);
    
    // Create message element
    const messageElement = document.createElement('div');
    messageElement.className = 'message thread-starter';
    messageElement.dataset.messageId = message.id;
    
    // Get user info
    const userName = message.user_name || message.user_email || 'Unknown User';
    const userAvatar = message.user_avatar || message.avatar_url || 'https://via.placeholder.com/24';
    const messageContent = message.content || message.body || 'No content';
    const messageTime = new Date(message.created_at).toLocaleTimeString();
    
    messageElement.innerHTML = `
      <div class="message-avatar">
        <img src="${userAvatar}" alt="${userName}" style="width: 24px; height: 24px; border-radius: 50%;" />
      </div>
      <div class="message-content">
        <div class="message-header">
          <span class="message-author">${userName}</span>
          <span class="message-time">${messageTime}</span>
        </div>
        <div class="message-body">${messageContent}</div>
        <div class="message-actions">
          <button class="message-action-btn" data-action="reply">Reply</button>
          <button class="message-action-btn" data-action="react">React</button>
          <button class="message-action-btn" data-action="edit">Edit</button>
          <button class="message-action-btn" data-action="delete">Delete</button>
        </div>
      </div>
    `;
    
    chatMessages.appendChild(messageElement);
  });
  
  console.log('✅ DIRECT DB FIX: Messages displayed directly from database');
  
  // Add event listeners to the new messages
  addMessageEventListeners();
}

function addMessageEventListeners() {
  console.log('🔧 DIRECT DB FIX: Adding event listeners to messages...');
  
  const messageElements = document.querySelectorAll('.message');
  messageElements.forEach(messageElement => {
    const actionButtons = messageElement.querySelectorAll('.message-action-btn');
    actionButtons.forEach(button => {
      button.addEventListener('click', (e) => {
        e.preventDefault();
        const action = button.dataset.action;
        const messageId = messageElement.dataset.messageId;
        console.log(`🔧 DIRECT DB FIX: Message action clicked: ${action} for message ${messageId}`);
        
        // Handle different actions
        switch (action) {
          case 'reply':
            console.log('🔧 DIRECT DB FIX: Reply action');
            break;
          case 'react':
            console.log('🔧 DIRECT DB FIX: React action');
            break;
          case 'edit':
            console.log('🔧 DIRECT DB FIX: Edit action');
            break;
          case 'delete':
            console.log('🔧 DIRECT DB FIX: Delete action');
            break;
        }
      });
    });
  });
  
  console.log('✅ DIRECT DB FIX: Event listeners added to messages');
}

function runDirectDatabaseFix() {
  console.log('🚀 DIRECT DB FIX: Starting direct database access fix...');
  
  // Step 1: Force load messages from database
  forceLoadMessagesFromDatabase();
  
  console.log('✅ DIRECT DB FIX: Direct database fix completed');
}

// Export functions
window.forceLoadMessagesFromDatabase = forceLoadMessagesFromDatabase;
window.tryDirectSupabaseAccess = tryDirectSupabaseAccess;
window.tryAlternativeEndpoints = tryAlternativeEndpoints;
window.displayMessagesDirectly = displayMessagesDirectly;
window.addMessageEventListeners = addMessageEventListeners;
window.runDirectDatabaseFix = runDirectDatabaseFix;

// Auto-run the fix
console.log('🔧 DIRECT DB FIX: Auto-running direct database fix...');
runDirectDatabaseFix();

console.log('🔧 DIRECT DB FIX: Script loaded. Available functions:');
console.log('  - forceLoadMessagesFromDatabase()');
console.log('  - tryDirectSupabaseAccess()');
console.log('  - tryAlternativeEndpoints()');
console.log('  - displayMessagesDirectly(messages)');
console.log('  - addMessageEventListeners()');
console.log('  - runDirectDatabaseFix()');
