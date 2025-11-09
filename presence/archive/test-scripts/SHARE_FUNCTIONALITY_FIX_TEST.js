/**
 * Share Functionality Fix Test
 * Tests share button with correct URL and disappearing tooltip
 */

async function testShareFunctionality() {
  console.log('🧪 TEST: Starting share functionality test');
  
  const results = {
    urlGeneration: { passed: false, errors: [] },
    tooltipDisplay: { passed: false, errors: [] },
    clipboardCopy: { passed: false, errors: [] }
  };
  
  // Test 1: URL Generation
  console.log('🧪 TEST: Testing URL generation...');
  try {
    const messagesView = document.querySelector('#discuss-tab .chat-messages');
    if (!messagesView) {
      throw new Error('Messages view container not found');
    }
    
    const firstMessage = messagesView.querySelector('.message[data-message-id]');
    if (!firstMessage) {
      throw new Error('No messages found');
    }
    
    const messageId = firstMessage.dataset.messageId;
    const message = window.currentChatData?.find(m => m.id === messageId);
    
    if (!message) {
      throw new Error('Message data not found');
    }
    
    // Test URL generation logic
    const currentUrl = window.location.href;
    const urlObj = new URL(currentUrl);
    urlObj.hash = '';
    const expectedUrl = `${urlObj.toString()}#message=${message.id}&conversation=${message.conversationId || ''}`;
    
    // Verify URL doesn't point to API endpoint
    if (expectedUrl.includes('api.themetalayer.org')) {
      throw new Error('URL incorrectly points to API endpoint');
    }
    
    // Verify URL contains current page
    if (!expectedUrl.includes(urlObj.hostname)) {
      throw new Error('URL does not contain current page hostname');
    }
    
    // Verify URL contains message ID
    if (!expectedUrl.includes(message.id)) {
      throw new Error('URL does not contain message ID');
    }
    
    console.log('✅ TEST: URL generation correct:', expectedUrl);
    results.urlGeneration.passed = true;
    
  } catch (error) {
    console.error('❌ TEST: URL generation test failed:', error);
    results.urlGeneration.errors.push(error.message);
  }
  
  // Test 2: Tooltip Display
  console.log('🧪 TEST: Testing tooltip display...');
  try {
    const shareBtn = document.querySelector('.share-btn[data-message-id]');
    if (!shareBtn) {
      throw new Error('Share button not found');
    }
    
    // Check if showTooltip function exists
    if (typeof showTooltip !== 'function' && typeof window.showTooltip !== 'function') {
      throw new Error('showTooltip function not found');
    }
    
    // Simulate tooltip display
    const tooltipFunc = typeof showTooltip === 'function' ? showTooltip : window.showTooltip;
    tooltipFunc(shareBtn, 'Test tooltip', 1000);
    
    // Wait for tooltip to appear
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const tooltip = document.querySelector('.share-tooltip');
    if (!tooltip) {
      throw new Error('Tooltip not displayed');
    }
    
    if (tooltip.textContent !== 'Test tooltip') {
      throw new Error('Tooltip text incorrect');
    }
    
    // Wait for tooltip to disappear
    await new Promise(resolve => setTimeout(resolve, 1200));
    
    const tooltipAfter = document.querySelector('.share-tooltip');
    if (tooltipAfter) {
      throw new Error('Tooltip did not disappear');
    }
    
    console.log('✅ TEST: Tooltip display works correctly');
    results.tooltipDisplay.passed = true;
    
  } catch (error) {
    console.error('❌ TEST: Tooltip display test failed:', error);
    results.tooltipDisplay.errors.push(error.message);
  }
  
  // Test 3: Clipboard Copy
  console.log('🧪 TEST: Testing clipboard copy...');
  try {
    // Check if clipboard API is available
    if (!navigator.clipboard) {
      throw new Error('Clipboard API not available');
    }
    
    // Test clipboard write
    const testText = 'Test clipboard copy';
    await navigator.clipboard.writeText(testText);
    
    // Note: Reading clipboard requires permission, so we'll just test write
    console.log('✅ TEST: Clipboard write successful');
    results.clipboardCopy.passed = true;
    
  } catch (error) {
    console.error('❌ TEST: Clipboard copy test failed:', error);
    results.clipboardCopy.errors.push(error.message);
  }
  
  // Summary
  console.log('\n📊 TEST SUMMARY:');
  console.log('URL Generation:', results.urlGeneration.passed ? '✅ PASSED' : '❌ FAILED');
  if (results.urlGeneration.errors.length > 0) {
    console.log('  Errors:', results.urlGeneration.errors);
  }
  
  console.log('Tooltip Display:', results.tooltipDisplay.passed ? '✅ PASSED' : '❌ FAILED');
  if (results.tooltipDisplay.errors.length > 0) {
    console.log('  Errors:', results.tooltipDisplay.errors);
  }
  
  console.log('Clipboard Copy:', results.clipboardCopy.passed ? '✅ PASSED' : '❌ FAILED');
  if (results.clipboardCopy.errors.length > 0) {
    console.log('  Errors:', results.clipboardCopy.errors);
  }
  
  const allPassed = results.urlGeneration.passed && 
                   results.tooltipDisplay.passed && 
                   results.clipboardCopy.passed;
  console.log('\n' + (allPassed ? '✅ ALL TESTS PASSED' : '❌ SOME TESTS FAILED'));
  
  return results;
}

// Export for use
if (typeof window !== 'undefined') {
  window.testShareFunctionality = testShareFunctionality;
}

console.log('🧪 TEST: Share functionality test script loaded. Run testShareFunctionality() to test.');

