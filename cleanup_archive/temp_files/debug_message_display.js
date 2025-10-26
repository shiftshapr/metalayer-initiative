// Debug script to check why messages aren't displaying
console.log('🔍 DEBUG: Checking message display issues...');

// Check if addMessageToChat is available
console.log('🔍 DEBUG: window.addMessageToChat available:', typeof window.addMessageToChat);

// Check if messages are in the DOM
const chatMessages = document.querySelector('.chat-messages');
console.log('🔍 DEBUG: Chat messages container:', chatMessages);

if (chatMessages) {
  const messages = chatMessages.querySelectorAll('.message');
  console.log('🔍 DEBUG: Messages in DOM:', messages.length);
  
  if (messages.length > 0) {
    console.log('🔍 DEBUG: First message:', messages[0]);
    console.log('🔍 DEBUG: First message visible:', messages[0].offsetHeight > 0);
    console.log('🔍 DEBUG: First message style:', messages[0].style.display);
  }
}

// Check if there are any errors in the console
console.log('🔍 DEBUG: Checking for errors...');

// Test adding a message manually
if (typeof window.addMessageToChat === 'function') {
  console.log('🔍 DEBUG: Testing manual message addition...');
  const testMessage = {
    id: 'test-' + Date.now(),
    body: 'Test Message from Debug Script',
    authorId: 'test@example.com',
    createdAt: new Date().toISOString(),
    author: {
      id: 'test@example.com',
      name: 'Test User',
      handle: 'testuser',
      avatarUrl: null,
      email: 'test@example.com',
      auraColor: '#aa00aa'
    }
  };
  
  try {
    window.addMessageToChat(testMessage);
    console.log('✅ DEBUG: Test message added successfully');
  } catch (error) {
    console.error('❌ DEBUG: Error adding test message:', error);
  }
}
