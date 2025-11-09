/**
 * Share Button Functionality Test
 * Tests share button in both messages view and focus mode
 */

async function testShareButton() {
  console.log('🧪 TEST: Starting share button functionality test');
  
  const results = {
    messagesView: { passed: false, errors: [] },
    focusMode: { passed: false, errors: [] }
  };
  
  // Test 1: Messages View
  console.log('🧪 TEST: Testing share button in messages view...');
  try {
    const messagesView = document.querySelector('#discuss-tab .chat-messages');
    if (!messagesView) {
      throw new Error('Messages view container not found');
    }
    
    const firstMessage = messagesView.querySelector('.message[data-message-id]');
    if (!firstMessage) {
      throw new Error('No messages found in messages view');
    }
    
    const shareBtn = firstMessage.querySelector('.share-btn');
    if (!shareBtn) {
      throw new Error('Share button not found in message');
    }
    
    // Check if button is clickable
    if (shareBtn.disabled) {
      throw new Error('Share button is disabled');
    }
    
    if (shareBtn.style.pointerEvents === 'none') {
      throw new Error('Share button has pointer-events: none');
    }
    
    if (shareBtn.style.opacity === '0') {
      throw new Error('Share button has opacity: 0');
    }
    
    // Check if event listener is attached
    const messageId = firstMessage.dataset.messageId;
    const message = window.currentChatData?.find(m => m.id === messageId);
    
    if (!message) {
      throw new Error('Message data not found');
    }
    
    // Simulate click
    const clickEvent = new MouseEvent('click', {
      bubbles: true,
      cancelable: true,
      view: window
    });
    
    shareBtn.dispatchEvent(clickEvent);
    
    // Check if handleCopyLink was called (check console for logs)
    console.log('✅ TEST: Share button click dispatched in messages view');
    results.messagesView.passed = true;
    
  } catch (error) {
    console.error('❌ TEST: Messages view test failed:', error);
    results.messagesView.errors.push(error.message);
  }
  
  // Test 2: Focus Mode
  console.log('🧪 TEST: Testing share button in focus mode...');
  try {
    const focusContainer = document.querySelector('.focus-messages-container');
    if (!focusContainer) {
      // Try to enter focus mode
      const firstMessage = document.querySelector('#discuss-tab .message[data-message-id]');
      if (firstMessage) {
        const messageId = firstMessage.dataset.messageId;
        const message = window.currentChatData?.find(m => m.id === messageId);
        if (message && typeof handleMessageFocus === 'function') {
          console.log('🧪 TEST: Entering focus mode for testing...');
          await handleMessageFocus(message);
          
          // Wait for focus mode to initialize
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
    }
    
    const focusContainerAfter = document.querySelector('.focus-messages-container');
    if (!focusContainerAfter) {
      throw new Error('Focus mode container not found');
    }
    
    const focusedMessage = focusContainerAfter.querySelector('.message[data-message-id]');
    if (!focusedMessage) {
      throw new Error('No messages found in focus mode');
    }
    
    const shareBtn = focusedMessage.querySelector('.share-btn');
    if (!shareBtn) {
      throw new Error('Share button not found in focus mode message');
    }
    
    // Check if button is clickable
    if (shareBtn.disabled) {
      throw new Error('Share button is disabled in focus mode');
    }
    
    if (shareBtn.style.pointerEvents === 'none') {
      throw new Error('Share button has pointer-events: none in focus mode');
    }
    
    // Simulate click
    const clickEvent = new MouseEvent('click', {
      bubbles: true,
      cancelable: true,
      view: window
    });
    
    shareBtn.dispatchEvent(clickEvent);
    
    console.log('✅ TEST: Share button click dispatched in focus mode');
    results.focusMode.passed = true;
    
  } catch (error) {
    console.error('❌ TEST: Focus mode test failed:', error);
    results.focusMode.errors.push(error.message);
  }
  
  // Summary
  console.log('\n📊 TEST SUMMARY:');
  console.log('Messages View:', results.messagesView.passed ? '✅ PASSED' : '❌ FAILED');
  if (results.messagesView.errors.length > 0) {
    console.log('  Errors:', results.messagesView.errors);
  }
  
  console.log('Focus Mode:', results.focusMode.passed ? '✅ PASSED' : '❌ FAILED');
  if (results.focusMode.errors.length > 0) {
    console.log('  Errors:', results.focusMode.errors);
  }
  
  const allPassed = results.messagesView.passed && results.focusMode.passed;
  console.log('\n' + (allPassed ? '✅ ALL TESTS PASSED' : '❌ SOME TESTS FAILED'));
  
  return results;
}

// Export for use
if (typeof window !== 'undefined') {
  window.testShareButton = testShareButton;
}

console.log('🧪 TEST: Share button test script loaded. Run testShareButton() to test.');

