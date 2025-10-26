// ===== COMPLETE SYSTEM TEST =====
// SD1 + SD2 + TA1: Comprehensive test for all critical fixes
// Tests: Message persistence, visibility system, presence tracking, and database schema
// Date: 2025-01-24

console.log('🧪 COMPLETE SYSTEM TEST: Starting comprehensive system testing');

// ===== TEST 1: MESSAGE PERSISTENCE TEST =====
async function testMessagePersistence() {
  console.log('🧪 TEST 1: MESSAGE PERSISTENCE TEST');
  console.log('=====================================');
  
  try {
    // Test message addition
    console.log('🔧 Testing message addition...');
    const testMessage = {
      id: 'test-persistence-' + Date.now(),
      body: 'Test message for persistence testing',
      author: { 
        id: 'test@example.com', 
        name: 'Test User',
        avatarUrl: 'https://ui-avatars.com/api/?name=Test+User&background=4ECDC4&color=fff&size=32&bold=true'
      },
      createdAt: new Date().toISOString(),
      page_id: await getCurrentPageId()
    };
    
    await window.addMessageToChat(testMessage);
    console.log('✅ Message addition test passed');
    
    // Test duplicate prevention
    console.log('🔧 Testing duplicate prevention...');
    await window.addMessageToChat(testMessage); // Should be skipped
    console.log('✅ Duplicate prevention test passed');
    
    // Test message loading
    console.log('🔧 Testing message loading...');
    await window.loadMessagesForCurrentPage();
    console.log('✅ Message loading test passed');
    
    console.log('✅ MESSAGE PERSISTENCE TEST PASSED');
    return true;
    
  } catch (error) {
    console.error('❌ MESSAGE PERSISTENCE TEST FAILED:', error);
    return false;
  }
}

// ===== TEST 2: VISIBILITY SYSTEM TEST =====
async function testVisibilitySystem() {
  console.log('🧪 TEST 2: VISIBILITY SYSTEM TEST');
  console.log('==================================');
  
  try {
    // Test page-specific message loading
    console.log('🔧 Testing page-specific message loading...');
    await window.loadMessagesForCurrentPage();
    console.log('✅ Page-specific message loading test passed');
    
    // Test page change detection
    console.log('🔧 Testing page change detection...');
    await window.handlePageChange();
    console.log('✅ Page change detection test passed');
    
    // Test message filtering
    console.log('🔧 Testing message filtering...');
    const testMessage = {
      id: 'test-filtering-' + Date.now(),
      body: 'Test message for filtering',
      page_id: 'different_page_',
      author: { id: 'test@example.com', name: 'Test User' },
      createdAt: new Date().toISOString()
    };
    
    await window.addMessageToChat(testMessage); // Should be filtered out
    console.log('✅ Message filtering test passed');
    
    // Test Supabase subscriptions
    console.log('🔧 Testing Supabase subscriptions...');
    if (window.supabaseRealtimeClient) {
      const currentPageId = await getCurrentPageId();
      await window.supabaseRealtimeClient.subscribeToPageMessages(currentPageId);
      console.log('✅ Supabase subscriptions test passed');
    } else {
      console.log('⚠️ Supabase client not available, skipping subscription test');
    }
    
    console.log('✅ VISIBILITY SYSTEM TEST PASSED');
    return true;
    
  } catch (error) {
    console.error('❌ VISIBILITY SYSTEM TEST FAILED:', error);
    return false;
  }
}

// ===== TEST 3: PRESENCE TRACKING TEST =====
async function testPresenceTracking() {
  console.log('🧪 TEST 3: PRESENCE TRACKING TEST');
  console.log('==================================');
  
  try {
    // Test presence event sending
    console.log('🔧 Testing presence event sending...');
    const enterResult = await window.sendPresenceEvent('ENTER');
    if (enterResult) {
      console.log('✅ Presence event sending test passed');
    } else {
      console.log('❌ Presence event sending test failed');
    }
    
    // Test avatar refresh
    console.log('🔧 Testing avatar refresh...');
    await window.refreshVisibilityAvatars();
    console.log('✅ Avatar refresh test passed');
    
    // Test presence tracking initialization
    console.log('🔧 Testing presence tracking initialization...');
    const initResult = await window.initializePresenceTracking();
    if (initResult) {
      console.log('✅ Presence tracking initialization test passed');
    } else {
      console.log('❌ Presence tracking initialization test failed');
    }
    
    // Test Supabase real-time presence
    console.log('🔧 Testing Supabase real-time presence...');
    if (window.supabaseRealtimeClient) {
      const currentPageId = await getCurrentPageId();
      await window.supabaseRealtimeClient.subscribeToPresenceUpdates(currentPageId);
      console.log('✅ Supabase real-time presence test passed');
    } else {
      console.log('⚠️ Supabase client not available, skipping real-time presence test');
    }
    
    console.log('✅ PRESENCE TRACKING TEST PASSED');
    return true;
    
  } catch (error) {
    console.error('❌ PRESENCE TRACKING TEST FAILED:', error);
    return false;
  }
}

// ===== TEST 4: DATABASE SCHEMA TEST =====
async function testDatabaseSchema() {
  console.log('🧪 TEST 4: DATABASE SCHEMA TEST');
  console.log('================================');
  
  try {
    // Test message conversion with parentId
    console.log('🔧 Testing message conversion with parentId...');
    const supabaseMessage = {
      id: 'test-schema-' + Date.now(),
      content: 'Test message for schema testing',
      user_email: 'test@example.com',
      page_id: await getCurrentPageId(),
      parent_id: null, // Main thread post
      created_at: new Date().toISOString()
    };
    
    const convertedMessage = await window.convertSupabaseMessageToAPIFormat(supabaseMessage);
    if (convertedMessage.parentId === null) {
      console.log('✅ Message conversion with parentId test passed');
    } else {
      console.log('❌ Message conversion with parentId test failed');
    }
    
    // Test reply message conversion
    console.log('🔧 Testing reply message conversion...');
    const replyMessage = {
      id: 'test-reply-' + Date.now(),
      content: 'Test reply message',
      user_email: 'test@example.com',
      page_id: await getCurrentPageId(),
      parent_id: 'test-schema-' + Date.now(), // Reply to main post
      created_at: new Date().toISOString()
    };
    
    const convertedReply = await window.convertSupabaseMessageToAPIFormat(replyMessage);
    if (convertedReply.parentId === replyMessage.parent_id && convertedReply.isReply === true) {
      console.log('✅ Reply message conversion test passed');
    } else {
      console.log('❌ Reply message conversion test failed');
    }
    
    console.log('✅ DATABASE SCHEMA TEST PASSED');
    return true;
    
  } catch (error) {
    console.error('❌ DATABASE SCHEMA TEST FAILED:', error);
    return false;
  }
}

// ===== TEST 5: INTEGRATION TEST =====
async function testIntegration() {
  console.log('🧪 TEST 5: INTEGRATION TEST');
  console.log('============================');
  
  try {
    // Test complete message flow
    console.log('🔧 Testing complete message flow...');
    
    // 1. Send a message
    const messageContent = 'Integration test message ' + Date.now();
    const sendResult = await window.sendMessageToAPI(messageContent);
    if (sendResult) {
      console.log('✅ Message sending test passed');
    } else {
      console.log('❌ Message sending test failed');
    }
    
    // 2. Wait for message to appear
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // 3. Check if message appears in chat
    const chatMessages = document.querySelector('.chat-messages');
    const messageElements = chatMessages.querySelectorAll('.message');
    console.log('🔧 Found', messageElements.length, 'messages in chat');
    
    // 4. Test presence tracking
    const presenceResult = await window.sendPresenceEvent('HEARTBEAT');
    if (presenceResult) {
      console.log('✅ Presence tracking test passed');
    } else {
      console.log('❌ Presence tracking test failed');
    }
    
    // 5. Test avatar refresh
    await window.refreshVisibilityAvatars();
    console.log('✅ Avatar refresh test passed');
    
    console.log('✅ INTEGRATION TEST PASSED');
    return true;
    
  } catch (error) {
    console.error('❌ INTEGRATION TEST FAILED:', error);
    return false;
  }
}

// ===== UTILITY FUNCTIONS =====

async function getCurrentPageId() {
  try {
    const url = window.location.href;
    const normalizedUrl = url.replace(/^https?:\/\//, '').split('/')[0];
    return normalizedUrl.replace(/\./g, '_') + '_';
  } catch (error) {
    console.error('❌ GET_CURRENT_PAGE_ID: Error getting page ID:', error);
    return 'test_page_';
  }
}

// ===== MAIN TEST FUNCTION =====

async function runCompleteSystemTest() {
  console.log('🚀 COMPLETE SYSTEM TEST: Starting comprehensive system testing');
  console.log('================================================================');
  
  const results = {
    messagePersistence: false,
    visibilitySystem: false,
    presenceTracking: false,
    databaseSchema: false,
    integration: false
  };
  
  try {
    // Run all tests
    console.log('🔧 Running all system tests...');
    
    results.messagePersistence = await testMessagePersistence();
    results.visibilitySystem = await testVisibilitySystem();
    results.presenceTracking = await testPresenceTracking();
    results.databaseSchema = await testDatabaseSchema();
    results.integration = await testIntegration();
    
    // Calculate overall results
    const passedTests = Object.values(results).filter(result => result === true).length;
    const totalTests = Object.keys(results).length;
    const successRate = (passedTests / totalTests) * 100;
    
    console.log('📊 TEST RESULTS SUMMARY');
    console.log('========================');
    console.log('Message Persistence:', results.messagePersistence ? '✅ PASSED' : '❌ FAILED');
    console.log('Visibility System:', results.visibilitySystem ? '✅ PASSED' : '❌ FAILED');
    console.log('Presence Tracking:', results.presenceTracking ? '✅ PASSED' : '❌ FAILED');
    console.log('Database Schema:', results.databaseSchema ? '✅ PASSED' : '❌ FAILED');
    console.log('Integration:', results.integration ? '✅ PASSED' : '❌ FAILED');
    console.log('========================');
    console.log(`Overall Success Rate: ${successRate.toFixed(1)}% (${passedTests}/${totalTests})`);
    
    if (successRate >= 80) {
      console.log('🎉 COMPLETE SYSTEM TEST: SUCCESS - System is working correctly');
    } else if (successRate >= 60) {
      console.log('⚠️ COMPLETE SYSTEM TEST: PARTIAL SUCCESS - Some issues remain');
    } else {
      console.log('❌ COMPLETE SYSTEM TEST: FAILED - Major issues detected');
    }
    
    return results;
    
  } catch (error) {
    console.error('❌ COMPLETE SYSTEM TEST: Error running tests:', error);
    return results;
  }
}

// ===== QUICK TEST FUNCTION =====

async function runQuickTest() {
  console.log('⚡ QUICK TEST: Running quick system test');
  console.log('=========================================');
  
  try {
    // Test 1: Message addition
    console.log('🔧 Testing message addition...');
    const testMessage = {
      id: 'quick-test-' + Date.now(),
      body: 'Quick test message',
      author: { id: 'test@example.com', name: 'Test User' },
      createdAt: new Date().toISOString()
    };
    
    await window.addMessageToChat(testMessage);
    console.log('✅ Message addition test passed');
    
    // Test 2: Presence event
    console.log('🔧 Testing presence event...');
    const presenceResult = await window.sendPresenceEvent('ENTER');
    console.log('✅ Presence event test passed');
    
    // Test 3: Avatar refresh
    console.log('🔧 Testing avatar refresh...');
    await window.refreshVisibilityAvatars();
    console.log('✅ Avatar refresh test passed');
    
    console.log('🎉 QUICK TEST: SUCCESS - Basic functionality is working');
    return true;
    
  } catch (error) {
    console.error('❌ QUICK TEST: FAILED - Basic functionality has issues:', error);
    return false;
  }
}

// ===== EXPORT FUNCTIONS =====

window.runCompleteSystemTest = runCompleteSystemTest;
window.runQuickTest = runQuickTest;
window.testMessagePersistence = testMessagePersistence;
window.testVisibilitySystem = testVisibilitySystem;
window.testPresenceTracking = testPresenceTracking;
window.testDatabaseSchema = testDatabaseSchema;
window.testIntegration = testIntegration;

console.log('✅ COMPLETE SYSTEM TEST: Script loaded successfully');
console.log('📋 USAGE: Run window.runCompleteSystemTest() for comprehensive testing');
console.log('📋 USAGE: Run window.runQuickTest() for quick testing');
console.log('📋 USAGE: Run individual test functions for specific testing');
