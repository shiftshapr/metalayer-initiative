// ===== COMP METHOD FIX: TEXTAREA MESSAGE INPUT =====
// This script fixes the textarea message input that's in reply mode

console.log('🔧 TEXTAREA FIX: Starting textarea message input fix...');

function fixTextareaMessageInput() {
  console.log('�� TEXTAREA FIX: Fixing textarea message input...');
  
  // Find the existing textarea
  const textarea = document.querySelector('#chat-textarea');
  if (textarea) {
    console.log('✅ TEXTAREA FIX: Found textarea:', textarea);
    console.log('🔍 TEXTAREA FIX: Current state:', {
      id: textarea.id,
      placeholder: textarea.placeholder,
      editingMessageId: textarea.dataset.editingMessageId,
      replyingTo: textarea.dataset.replyingTo,
      replyAuthor: textarea.dataset.replyAuthor
    });
    
    // Check if it's in reply mode
    if (textarea.dataset.replyingTo) {
      console.log('🔧 TEXTAREA FIX: Textarea is in reply mode, clearing reply state...');
      
      // Clear reply state
      textarea.removeAttribute('data-replying-to');
      textarea.removeAttribute('data-reply-author');
      textarea.removeAttribute('data-editing-message-id');
      textarea.placeholder = 'Type your message...';
      
      console.log('✅ TEXTAREA FIX: Reply state cleared');
    }
    
    // Check if it's in edit mode
    if (textarea.dataset.editingMessageId) {
      console.log('🔧 TEXTAREA FIX: Textarea is in edit mode, clearing edit state...');
      
      // Clear edit state
      textarea.removeAttribute('data-editing-message-id');
      textarea.placeholder = 'Type your message...';
      
      console.log('✅ TEXTAREA FIX: Edit state cleared');
    }
    
    // Make sure it's ready for new messages
    textarea.value = '';
    textarea.placeholder = 'Type your message...';
    
    console.log('✅ TEXTAREA FIX: Textarea is now ready for new messages');
    
    // Test the textarea
    textarea.value = 'Test message from textarea fix';
    console.log('🔧 TEXTAREA FIX: Test message set:', textarea.value);
    
    return textarea;
  } else {
    console.error('❌ TEXTAREA FIX: No textarea found');
    return null;
  }
}

function createNewMessageInput() {
  console.log('🔧 TEXTAREA FIX: Creating new message input...');
  
  // Find the chat container
  const chatContainer = document.querySelector('.chat-messages') || document.querySelector('#canopi-live-chat');
  if (!chatContainer) {
    console.error('❌ TEXTAREA FIX: No chat container found');
    return null;
  }
  
  // Create a new textarea for new messages
  const newTextarea = document.createElement('textarea');
  newTextarea.id = 'chat-input';
  newTextarea.placeholder = 'Type your message...';
  newTextarea.className = 'message-input';
  newTextarea.style.cssText = `
    width: 100%;
    padding: 12px;
    border: 2px solid #4ECDC4;
    border-radius: 0px;
    font-size: 14px;
    resize: none;
    min-height: 20px;
    font-family: inherit;
    box-sizing: border-box;
    margin: 0px;
    overflow-y: hidden;
    background-color: #f0f8ff;
  `;
  
  // Create send button
  const sendButton = document.createElement('button');
  sendButton.id = 'chat-send-button';
  sendButton.textContent = 'Send';
  sendButton.className = 'send-button';
  sendButton.style.cssText = `
    padding: 10px 20px;
    background: #4ECDC4;
    color: white;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    margin-left: 10px;
    margin-top: 10px;
  `;
  
  // Create input container
  const inputContainer = document.createElement('div');
  inputContainer.className = 'message-input-container';
  inputContainer.style.cssText = `
    display: flex;
    flex-direction: column;
    padding: 10px;
    border-top: 1px solid #eee;
  `;
  
  inputContainer.appendChild(newTextarea);
  inputContainer.appendChild(sendButton);
  
  // Add to chat container
  chatContainer.appendChild(inputContainer);
  
  console.log('✅ TEXTAREA FIX: New message input created');
  
  // Add event listeners
  addTextareaEventListeners(newTextarea, sendButton);
  
  return newTextarea;
}

function addTextareaEventListeners(textarea, sendButton) {
  console.log('🔧 TEXTAREA FIX: Adding event listeners...');
  
  // Send button click
  sendButton.addEventListener('click', () => {
    console.log('🔧 TEXTAREA FIX: Send button clicked');
    sendMessageFromTextarea(textarea.value);
  });
  
  // Enter key press (but not Shift+Enter for new lines)
  textarea.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      console.log('🔧 TEXTAREA FIX: Enter key pressed');
      sendMessageFromTextarea(textarea.value);
    }
  });
  
  // Auto-resize textarea
  textarea.addEventListener('input', () => {
    textarea.style.height = 'auto';
    textarea.style.height = textarea.scrollHeight + 'px';
  });
  
  console.log('✅ TEXTAREA FIX: Event listeners added');
}

function sendMessageFromTextarea(messageText) {
  console.log('🔧 TEXTAREA FIX: Sending message from textarea:', messageText);
  
  if (!messageText.trim()) {
    console.log('⚠️ TEXTAREA FIX: Empty message, not sending');
    return;
  }
  
  // Clear the textarea
  const textarea = document.querySelector('#chat-input') || document.querySelector('#chat-textarea');
  if (textarea) {
    textarea.value = '';
    textarea.style.height = 'auto';
  }
  
  // Check if sendMessageViaSupabase is available
  if (typeof window.sendMessageViaSupabase === 'function') {
    console.log('🔧 TEXTAREA FIX: Using sendMessageViaSupabase...');
    window.sendMessageViaSupabase(messageText);
  } else if (typeof window.addMessageToChat === 'function') {
    console.log('🔧 TEXTAREA FIX: Using addMessageToChat...');
    // Create a mock message object
    const mockMessage = {
      id: 'temp-' + Date.now(),
      content: messageText,
      user_email: window.currentUser?.email || 'unknown@example.com',
      created_at: new Date().toISOString()
    };
    window.addMessageToChat(mockMessage);
  } else {
    console.error('❌ TEXTAREA FIX: No send message function available');
  }
}

function runTextareaFix() {
  console.log('🚀 TEXTAREA FIX: Starting textarea message input fix...');
  
  // First, try to fix the existing textarea
  let textarea = fixTextareaMessageInput();
  
  if (!textarea) {
    console.log('🔧 TEXTAREA FIX: No existing textarea found, creating new one...');
    textarea = createNewMessageInput();
  }
  
  if (textarea) {
    console.log('✅ TEXTAREA FIX: Message input is now available');
    
    // Test the input
    textarea.value = 'Test message from textarea fix';
    console.log('🔧 TEXTAREA FIX: Test message set:', textarea.value);
    
    return textarea;
  } else {
    console.error('❌ TEXTAREA FIX: Failed to create message input');
    return null;
  }
}

// Export functions
window.fixTextareaMessageInput = fixTextareaMessageInput;
window.createNewMessageInput = createNewMessageInput;
window.addTextareaEventListeners = addTextareaEventListeners;
window.sendMessageFromTextarea = sendMessageFromTextarea;
window.runTextareaFix = runTextareaFix;

// Auto-run the fix
console.log('🔧 TEXTAREA FIX: Auto-running textarea fix...');
runTextareaFix();

console.log('🔧 TEXTAREA FIX: Script loaded. Available functions:');
console.log('  - fixTextareaMessageInput()');
console.log('  - createNewMessageInput()');
console.log('  - addTextareaEventListeners(textarea, button)');
console.log('  - sendMessageFromTextarea(text)');
console.log('  - runTextareaFix()');
