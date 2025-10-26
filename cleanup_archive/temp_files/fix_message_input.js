// ===== COMP METHOD FIX: MESSAGE INPUT ISSUE =====
// This script fixes the message input not being found issue

console.log('🔧 MESSAGE INPUT FIX: Starting message input fix...');

function findMessageInput() {
  console.log('🔧 MESSAGE INPUT FIX: Searching for message input...');
  
  // Try different selectors
  const selectors = [
    '#chat-input',
    '#message-input', 
    '.chat-input',
    '.message-input',
    'input[type="text"]',
    'input[placeholder*="message"]',
    'input[placeholder*="chat"]',
    'textarea',
    'input'
  ];
  
  for (const selector of selectors) {
    const element = document.querySelector(selector);
    if (element) {
      console.log('✅ MESSAGE INPUT FIX: Found input with selector:', selector);
      console.log('🔍 MESSAGE INPUT FIX: Element:', element);
      console.log('🔍 MESSAGE INPUT FIX: Element type:', element.tagName);
      console.log('🔍 MESSAGE INPUT FIX: Element placeholder:', element.placeholder);
      return element;
    }
  }
  
  console.error('❌ MESSAGE INPUT FIX: No message input found');
  return null;
}

function createMessageInput() {
  console.log('🔧 MESSAGE INPUT FIX: Creating message input...');
  
  // Find the chat container
  const chatContainer = document.querySelector('.chat-messages') || document.querySelector('#canopi-live-chat');
  if (!chatContainer) {
    console.error('❌ MESSAGE INPUT FIX: No chat container found');
    return null;
  }
  
  // Create message input
  const messageInput = document.createElement('input');
  messageInput.id = 'chat-input';
  messageInput.type = 'text';
  messageInput.placeholder = 'Type your message...';
  messageInput.className = 'message-input';
  messageInput.style.cssText = `
    width: 100%;
    padding: 10px;
    border: 1px solid #ccc;
    border-radius: 5px;
    margin: 10px 0;
    font-size: 14px;
  `;
  
  // Create send button
  const sendButton = document.createElement('button');
  sendButton.id = 'chat-send-button';
  sendButton.textContent = 'Send';
  sendButton.className = 'send-button';
  sendButton.style.cssText = `
    padding: 10px 20px;
    background: #007bff;
    color: white;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    margin-left: 10px;
  `;
  
  // Create input container
  const inputContainer = document.createElement('div');
  inputContainer.className = 'message-input-container';
  inputContainer.style.cssText = `
    display: flex;
    align-items: center;
    padding: 10px;
    border-top: 1px solid #eee;
  `;
  
  inputContainer.appendChild(messageInput);
  inputContainer.appendChild(sendButton);
  
  // Add to chat container
  chatContainer.appendChild(inputContainer);
  
  console.log('✅ MESSAGE INPUT FIX: Message input created');
  
  // Add event listeners
  addMessageInputListeners(messageInput, sendButton);
  
  return messageInput;
}

function addMessageInputListeners(messageInput, sendButton) {
  console.log('🔧 MESSAGE INPUT FIX: Adding event listeners...');
  
  // Send button click
  sendButton.addEventListener('click', () => {
    console.log('🔧 MESSAGE INPUT FIX: Send button clicked');
    sendMessage(messageInput.value);
  });
  
  // Enter key press
  messageInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      console.log('🔧 MESSAGE INPUT FIX: Enter key pressed');
      sendMessage(messageInput.value);
    }
  });
  
  console.log('✅ MESSAGE INPUT FIX: Event listeners added');
}

function sendMessage(messageText) {
  console.log('🔧 MESSAGE INPUT FIX: Sending message:', messageText);
  
  if (!messageText.trim()) {
    console.log('⚠️ MESSAGE INPUT FIX: Empty message, not sending');
    return;
  }
  
  // Check if sendMessageViaSupabase is available
  if (typeof window.sendMessageViaSupabase === 'function') {
    console.log('🔧 MESSAGE INPUT FIX: Using sendMessageViaSupabase...');
    window.sendMessageViaSupabase(messageText);
  } else if (typeof window.addMessageToChat === 'function') {
    console.log('🔧 MESSAGE INPUT FIX: Using addMessageToChat...');
    // Create a mock message object
    const mockMessage = {
      id: 'temp-' + Date.now(),
      content: messageText,
      user_email: window.currentUser?.email || 'unknown@example.com',
      created_at: new Date().toISOString()
    };
    window.addMessageToChat(mockMessage);
  } else {
    console.error('❌ MESSAGE INPUT FIX: No send message function available');
  }
}

function fixMessageInput() {
  console.log('🔧 MESSAGE INPUT FIX: Starting message input fix...');
  
  // First, try to find existing input
  let messageInput = findMessageInput();
  
  if (!messageInput) {
    console.log('🔧 MESSAGE INPUT FIX: No existing input found, creating new one...');
    messageInput = createMessageInput();
  }
  
  if (messageInput) {
    console.log('✅ MESSAGE INPUT FIX: Message input is now available');
    
    // Test the input
    messageInput.value = 'Test message from input fix';
    console.log('🔧 MESSAGE INPUT FIX: Test message set:', messageInput.value);
    
    return messageInput;
  } else {
    console.error('❌ MESSAGE INPUT FIX: Failed to create message input');
    return null;
  }
}

// Export functions
window.findMessageInput = findMessageInput;
window.createMessageInput = createMessageInput;
window.addMessageInputListeners = addMessageInputListeners;
window.sendMessage = sendMessage;
window.fixMessageInput = fixMessageInput;

// Auto-run the fix
console.log('🔧 MESSAGE INPUT FIX: Auto-running message input fix...');
fixMessageInput();

console.log('🔧 MESSAGE INPUT FIX: Script loaded. Available functions:');
console.log('  - findMessageInput()');
console.log('  - createMessageInput()');
console.log('  - addMessageInputListeners(input, button)');
console.log('  - sendMessage(text)');
console.log('  - fixMessageInput()');
