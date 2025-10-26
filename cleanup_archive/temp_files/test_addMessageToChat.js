// Test script to check if addMessageToChat is working
console.log('🔍 TEST: Testing addMessageToChat function...');

// Check if function exists
console.log('🔍 TEST: window.addMessageToChat type:', typeof window.addMessageToChat);
console.log('🔍 TEST: window.addMessageToChat function:', window.addMessageToChat);

if (typeof window.addMessageToChat !== 'function') {
  console.error('❌ TEST: window.addMessageToChat is not a function');
} else {
  console.log('✅ TEST: window.addMessageToChat is a function');
  
  // Test calling it with a simple message
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
  
  console.log('🔍 TEST: About to call addMessageToChat with:', testMessage.id);
  
  try {
    const result = window.addMessageToChat(testMessage);
    console.log('🔍 TEST: addMessageToChat call returned:', result);
    
    // Check if it's a promise
    if (result && typeof result.then === 'function') {
      console.log('🔍 TEST: addMessageToChat returned a promise, awaiting...');
      await result;
      console.log('✅ TEST: addMessageToChat promise resolved');
    } else {
      console.log('🔍 TEST: addMessageToChat returned synchronously:', result);
    }
  } catch (error) {
    console.error('❌ TEST: Error calling addMessageToChat:', error);
    console.error('❌ TEST: Error stack:', error.stack);
  }
}

// Check if messages are in DOM
setTimeout(() => {
  const chatMessages = document.querySelector('.chat-messages');
  console.log('🔍 TEST: Chat messages container:', !!chatMessages);
  
  if (chatMessages) {
    const messages = chatMessages.querySelectorAll('.message');
    console.log('🔍 TEST: Messages in DOM:', messages.length);
    
    if (messages.length > 0) {
      console.log('🔍 TEST: First message:', messages[0]);
    }
  }
}, 1000);
