// ===== AGGRESSIVE COMP METHOD FIX: FORCE MESSAGE PERSISTENCE =====
// This script forces the system to load historical messages by bypassing the skip logic

console.log('🔧 AGGRESSIVE FIX: Starting aggressive message persistence fix...');

function forceLoadChatHistory() {
  console.log('�� AGGRESSIVE FIX: Forcing chat history load...');
  
  // Clear the last loaded page ID to force reload
  if (window.lastLoadedPageId) {
    console.log('🔧 AGGRESSIVE FIX: Clearing lastLoadedPageId:', window.lastLoadedPageId);
    window.lastLoadedPageId = null;
  }
  
  // Clear the chat messages container
  const chatMessages = document.querySelector('.chat-messages');
  if (chatMessages) {
    console.log('🔧 AGGRESSIVE FIX: Clearing chat messages container');
    chatMessages.innerHTML = '';
  }
  
  // Force reload chat history
  if (typeof window.loadChatHistory === 'function') {
    console.log('🔧 AGGRESSIVE FIX: Calling loadChatHistory...');
    window.loadChatHistory().then(() => {
      console.log('✅ AGGRESSIVE FIX: Chat history loaded');
      
      // Check if messages are now visible
      const messages = document.querySelectorAll('.message');
      console.log('🔍 AGGRESSIVE FIX: Found', messages.length, 'messages after reload');
      
      if (messages.length === 0) {
        console.log('⚠️ AGGRESSIVE FIX: Still no messages found - checking database directly');
        checkDatabaseDirectly();
      }
    }).catch(error => {
      console.error('❌ AGGRESSIVE FIX: Failed to load chat history:', error);
    });
  } else {
    console.error('❌ AGGRESSIVE FIX: loadChatHistory function not available');
  }
}

function checkDatabaseDirectly() {
  console.log('�� AGGRESSIVE FIX: Checking database directly...');
  
  // Get current page data
  const currentPageId = window.currentUrlData?.pageId;
  console.log('🔍 AGGRESSIVE FIX: Current page ID:', currentPageId);
  
  // Check if we can access the API directly
  if (window.apiModule && window.apiModule.getChatHistory) {
    console.log('🔧 AGGRESSIVE FIX: Calling API directly...');
    window.apiModule.getChatHistory(currentPageId).then(data => {
      console.log('🔍 AGGRESSIVE FIX: API response:', data);
      
      if (data && data.length > 0) {
        console.log('✅ AGGRESSIVE FIX: Found', data.length, 'messages in database');
        // Force display these messages
        displayMessagesFromDatabase(data);
      } else {
        console.log('⚠️ AGGRESSIVE FIX: No messages found in database');
      }
    }).catch(error => {
      console.error('❌ AGGRESSIVE FIX: API call failed:', error);
    });
  } else {
    console.error('❌ AGGRESSIVE FIX: API module not available');
  }
}

function displayMessagesFromDatabase(messages) {
  console.log('🔧 AGGRESSIVE FIX: Displaying messages from database...');
  
  const chatMessages = document.querySelector('.chat-messages');
  if (!chatMessages) {
    console.error('❌ AGGRESSIVE FIX: Chat messages container not found');
    return;
  }
  
  // Clear existing messages
  chatMessages.innerHTML = '';
  
  // Display each message
  messages.forEach((message, index) => {
    console.log(`🔧 AGGRESSIVE FIX: Displaying message ${index + 1}:`, message);
    
    // Create message element
    const messageElement = document.createElement('div');
    messageElement.className = 'message thread-starter';
    messageElement.dataset.messageId = message.id;
    messageElement.innerHTML = `
      <div class="message-avatar">
        <img src="${message.user_avatar || 'https://via.placeholder.com/24'}" alt="${message.user_name || 'User'}" />
      </div>
      <div class="message-content">
        <div class="message-header">
          <span class="message-author">${message.user_name || 'Unknown User'}</span>
          <span class="message-time">${new Date(message.created_at).toLocaleTimeString()}</span>
        </div>
        <div class="message-body">${message.content}</div>
      </div>
    `;
    
    chatMessages.appendChild(messageElement);
  });
  
  console.log('✅ AGGRESSIVE FIX: Messages displayed from database');
}

function testMessageInput() {
  console.log('🔧 AGGRESSIVE FIX: Testing message input...');
  
  // Try different selectors for message input
  const selectors = ['#chat-input', '#message-input', '.chat-input', '.message-input', 'input[type="text"]'];
  
  for (const selector of selectors) {
    const element = document.querySelector(selector);
    if (element) {
      console.log('✅ AGGRESSIVE FIX: Found message input with selector:', selector);
      element.value = 'Test message from aggressive fix';
      console.log('🔧 AGGRESSIVE FIX: Test message set:', element.value);
      return element;
    }
  }
  
  console.error('❌ AGGRESSIVE FIX: No message input found with any selector');
  return null;
}

function runAggressiveFix() {
  console.log('🚀 AGGRESSIVE FIX: Starting aggressive message persistence fix...');
  
  // Step 1: Force load chat history
  forceLoadChatHistory();
  
  // Step 2: Test message input
  testMessageInput();
  
  // Step 3: Check visibility system
  if (typeof window.refreshVisibilityAvatars === 'function') {
    console.log('🔧 AGGRESSIVE FIX: Refreshing visibility...');
    window.refreshVisibilityAvatars();
  }
  
  console.log('✅ AGGRESSIVE FIX: Aggressive fix completed');
}

// Export functions
window.forceLoadChatHistory = forceLoadChatHistory;
window.checkDatabaseDirectly = checkDatabaseDirectly;
window.displayMessagesFromDatabase = displayMessagesFromDatabase;
window.testMessageInput = testMessageInput;
window.runAggressiveFix = runAggressiveFix;

// Auto-run the aggressive fix
console.log('🔧 AGGRESSIVE FIX: Auto-running aggressive fix...');
runAggressiveFix();

console.log('🔧 AGGRESSIVE FIX: Script loaded. Available functions:');
console.log('  - forceLoadChatHistory()');
console.log('  - checkDatabaseDirectly()');
console.log('  - displayMessagesFromDatabase(messages)');
console.log('  - testMessageInput()');
console.log('  - runAggressiveFix()');
