// TE2: Comprehensive Test Suite for Visibility Timing & Messages Fix
// Run this in the Chrome DevTools console to verify fixes

console.log('🧪 TE2: === VISIBILITY TIMING & MESSAGES TEST SUITE ===');

// TEST 1: Verify visibility timing threshold is 30 seconds
window.testVisibilityThreshold = function() {
  console.log('\n🧪 TE2: TEST 1 - Visibility Timing Threshold');
  console.log('Expected: isActive threshold should be 30 seconds, not 5 minutes');
  console.log('Action: Check logs for "isActive: ... (threshold: 30s)"');
  console.log('Result: If you see "(threshold: 30s)" in logs, test PASSES');
  console.log('\nTo verify: Switch tabs, wait 31 seconds, return. User should show "Last seen X ago"');
};

// TEST 2: Monitor visibility timing for state flipping
window.testVisibilityStateFlipping = async function() {
  console.log('\n🧪 TE2: TEST 2 - Monitor Visibility State Flipping');
  console.log('Purpose: Verify timing does NOT flip between "Last seen" and "Online for"');
  
  if (!window.currentVisibilityData || !window.currentVisibilityData.active) {
    console.error('❌ TEST FAILED: No visibility data available');
    return;
  }
  
  const users = window.currentVisibilityData.active;
  console.log(`Found ${users.length} users to monitor`);
  
  if (users.length === 0) {
    console.warn('⚠️  No other users online to test with');
    return;
  }
  
  // Monitor user status over 60 seconds
  const userToMonitor = users[0];
  console.log(`Monitoring user: ${userToMonitor.name}`);
  console.log('Will check every 5 seconds for 60 seconds...');
  
  let previousStatus = null;
  let flipCount = 0;
  
  for (let i = 0; i < 12; i++) {
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    const currentData = window.currentVisibilityData.active.find(u => u.userId === userToMonitor.userId);
    if (!currentData) {
      console.warn(`⚠️  User ${userToMonitor.name} no longer in visibility list`);
      break;
    }
    
    const statusElement = document.querySelector(`[data-user-id="${userToMonitor.userId}"] .item-status`);
    const currentStatus = statusElement ? statusElement.textContent : 'N/A';
    
    console.log(`Check ${i + 1}/12: "${currentStatus}"`);
    
    if (previousStatus && previousStatus !== currentStatus) {
      // Check if this is a state flip (between "Last seen" and "Online for")
      const isFlip = (previousStatus.includes('Last seen') && currentStatus.includes('Online for')) ||
                     (previousStatus.includes('Online for') && currentStatus.includes('Last seen'));
      
      if (isFlip) {
        flipCount++;
        console.error(`❌ STATE FLIP DETECTED: "${previousStatus}" → "${currentStatus}"`);
      }
    }
    
    previousStatus = currentStatus;
  }
  
  console.log('\n🧪 TE2: TEST 2 RESULTS:');
  console.log(`Total state flips detected: ${flipCount}`);
  if (flipCount === 0) {
    console.log('✅ TEST PASSED: No state flipping detected');
  } else {
    console.error(`❌ TEST FAILED: ${flipCount} state flips detected`);
  }
};

// TEST 3: Verify messages are loaded
window.testMessagesLoaded = function() {
  console.log('\n🧪 TE2: TEST 3 - Messages Loaded');
  
  const chatMessages = document.querySelector('.chat-messages');
  if (!chatMessages) {
    console.error('❌ TEST FAILED: No .chat-messages element found');
    return;
  }
  
  const messages = chatMessages.querySelectorAll('.message');
  const placeholder = chatMessages.querySelector('p[style*="text-align: center"]');
  
  console.log(`Messages found: ${messages.length}`);
  console.log(`Placeholder exists: ${!!placeholder}`);
  
  if (messages.length > 0) {
    console.log('✅ TEST PASSED: Messages are displayed');
    console.log(`Message details:`);
    Array.from(messages).slice(0, 5).forEach((msg, index) => {
      const messageId = msg.getAttribute('data-message-id');
      const body = msg.querySelector('.message-body')?.textContent.substring(0, 50);
      console.log(`  ${index + 1}. ID: ${messageId}, Body: ${body}...`);
    });
  } else if (placeholder) {
    console.warn('⚠️  TEST WARNING: Placeholder text shown - No messages exist on this page');
    console.warn('   This may be expected if no messages have been sent yet');
  } else {
    console.error('❌ TEST FAILED: No messages and no placeholder - UI is broken');
  }
  
  // Check for errors in loadChatHistory logs
  console.log('\nChecking for loadChatHistory errors...');
  console.log('Look in console for "❌ CHAT_LOAD: Failed to load" messages');
};

// TEST 4: Test message creation (if authenticated)
window.testMessageCreation = async function() {
  console.log('\n🧪 TE2: TEST 4 - Message Creation');
  
  const chatInput = document.querySelector('#chat-input');
  if (!chatInput) {
    console.error('❌ TEST FAILED: No chat input found');
    return;
  }
  
  console.log('Test message creation by:');
  console.log('1. Type a message in the chat input');
  console.log('2. Press Enter or click Send');
  console.log('3. Message should appear in the chat');
  console.log('4. Check logs for "✅ CHAT_LOAD: Found X conversations"');
  console.log('\nRecommendation: Send a test message and run window.testMessagesLoaded() again');
};

// TEST 5: Check API connectivity
window.testAPIConnectivity = async function() {
  console.log('\n🧪 TE2: TEST 5 - API Connectivity');
  
  try {
    const user = await authManager.getCurrentUser();
    if (!user) {
      console.error('❌ TEST FAILED: No authenticated user');
      return;
    }
    
    console.log(`Testing API with user: ${user.email}`);
    
    // Test presence API
    console.log('Testing presence API...');
    const urlData = await normalizeCurrentUrl();
    const presenceResponse = await api.getPresenceByUrl(urlData.normalizedUrl);
    console.log(`✅ Presence API: ${presenceResponse.active.length} users found`);
    
    // Test chat API
    console.log('Testing chat API...');
    const result = await chrome.storage.local.get(['activeCommunities']);
    const communities = result.activeCommunities || ['comm-001'];
    const chatResponse = await api.getChatHistory(communities[0], null, urlData.normalizedUrl);
    console.log(`✅ Chat API: ${chatResponse.conversations ? chatResponse.conversations.length : 0} conversations found`);
    
    console.log('\n✅ TEST PASSED: All APIs are accessible');
  } catch (error) {
    console.error('❌ TEST FAILED: API error:', error.message);
    console.error('Error details:', error);
  }
};

// TEST 6: Comprehensive diagnostic run
window.runFullVisibilityMessageTests = async function() {
  console.log('\n🧪 TE2: === RUNNING FULL TEST SUITE ===\n');
  
  await window.testVisibilityThreshold();
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  await window.testMessagesLoaded();
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  await window.testAPIConnectivity();
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  console.log('\n🧪 TE2: === TEST SUITE COMPLETE ===');
  console.log('\n📋 NEXT STEPS:');
  console.log('1. If messages are empty, try sending a test message');
  console.log('2. Run window.testVisibilityStateFlipping() to monitor for 60 seconds');
  console.log('3. Check console logs for any ❌ CHAT_LOAD errors');
  console.log('4. Report results to senior developer');
};

// Auto-log available commands
console.log('\n📋 Available TE2 Test Commands:');
console.log('• window.testVisibilityThreshold() - Check 30-second threshold');
console.log('• window.testVisibilityStateFlipping() - Monitor for state flips (60s)');
console.log('• window.testMessagesLoaded() - Verify messages are displayed');
console.log('• window.testMessageCreation() - Instructions for testing message sending');
console.log('• window.testAPIConnectivity() - Test presence and chat APIs');
console.log('• window.runFullVisibilityMessageTests() - Run all tests');
console.log('\n✅ TE2: Test suite loaded successfully');

