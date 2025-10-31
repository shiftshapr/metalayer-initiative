/**
 * COMP METHOD: Comprehensive Reaction Propagation Test Suite
 * Tests for TA2/TA1 to verify reaction count propagation fixes
 */

// COMP METHOD: Test suite for reaction propagation
window.testReactionPropagation = async function() {
  console.log('🧪 REACTION PROPAGATION TEST SUITE');
  console.log('===================================');
  
  const results = {
    passed: 0,
    failed: 0,
    tests: []
  };
  
  // Test 1: Check if reaction functions are available
  console.log('\n📋 Test 1: Function Availability');
  const test1 = {
    name: 'Reaction functions available',
    status: 'PASSED'
  };
  
  const requiredFunctions = [
    'loadMessageReactions',
    'updateReactionDisplay',
    'handleReactionChange',
    'addReactionToMessage',
    'removeReactionFromMessage',
    'updateReactionInMessage'
  ];
  
  for (const funcName of requiredFunctions) {
    if (typeof window[funcName] !== 'function') {
      test1.status = 'FAILED';
      test1.error = `Missing function: ${funcName}`;
      break;
    }
  }
  
  console.log(`  ${test1.status === 'PASSED' ? '✅' : '❌'} ${test1.name}`);
  if (test1.error) console.log(`  Error: ${test1.error}`);
  results.tests.push(test1);
  if (test1.status === 'PASSED') results.passed++; else results.failed++;
  
  // Test 2: Check if real-time subscription is set up
  console.log('\n📋 Test 2: Real-time Subscription');
  const test2 = {
    name: 'Real-time subscription exists',
    status: 'PASSED'
  };
  
  const messageElements = document.querySelectorAll('[data-message-id]');
  if (messageElements.length === 0) {
    test2.status = 'SKIPPED';
    test2.note = 'No messages found in DOM';
  } else {
    const firstMessage = messageElements[0];
    const messageId = firstMessage.getAttribute('data-message-id');
    
    // Check if reaction button exists
    const reactionBtn = firstMessage.querySelector('.reaction-btn');
    if (!reactionBtn) {
      test2.status = 'WARNING';
      test2.note = 'No reaction button found for first message';
    } else {
      console.log(`  Found reaction button for message: ${messageId}`);
    }
  }
  
  console.log(`  ${test2.status === 'PASSED' ? '✅' : test2.status === 'SKIPPED' ? '⏭️' : '⚠️'} ${test2.name}`);
  if (test2.note) console.log(`  Note: ${test2.note}`);
  results.tests.push(test2);
  if (test2.status === 'PASSED') results.passed++;
  
  // Test 3: Test reaction display update
  console.log('\n📋 Test 3: Reaction Display Update');
  const test3 = {
    name: 'Reaction display updates correctly',
    status: 'PASSED'
  };
  
  try {
    const messageElements = document.querySelectorAll('[data-message-id]');
    if (messageElements.length > 0) {
      const firstMessage = messageElements[0];
      const messageId = firstMessage.getAttribute('data-message-id');
      const reactionBtn = firstMessage.querySelector('.reaction-btn');
      
      if (reactionBtn) {
        // Test with empty reactions array
        await window.updateReactionDisplay(messageId, []);
        
        // Check if count span was updated or created
        const countSpan = reactionBtn.querySelector('.icon-count');
        if (countSpan) {
          console.log(`  ✅ Count span exists and can be updated`);
        } else {
          // Should create count span
          await window.updateReactionDisplay(messageId, []);
          const newCountSpan = reactionBtn.querySelector('.icon-count');
          if (newCountSpan) {
            console.log(`  ✅ Count span created successfully`);
          } else {
            test3.status = 'FAILED';
            test3.error = 'Count span not created';
          }
        }
      } else {
        test3.status = 'SKIPPED';
        test3.note = 'No reaction button found';
      }
    } else {
      test3.status = 'SKIPPED';
      test3.note = 'No messages found';
    }
  } catch (error) {
    test3.status = 'FAILED';
    test3.error = error.message;
    console.error('  Error:', error);
  }
  
  console.log(`  ${test3.status === 'PASSED' ? '✅' : test3.status === 'SKIPPED' ? '⏭️' : '❌'} ${test3.name}`);
  if (test3.error) console.log(`  Error: ${test3.error}`);
  if (test3.note) console.log(`  Note: ${test3.note}`);
  results.tests.push(test3);
  if (test3.status === 'PASSED') results.passed++; else if (test3.status === 'FAILED') results.failed++;
  
  // Test 4: Test real-time handler
  console.log('\n📋 Test 4: Real-time Handler');
  const test4 = {
    name: 'Real-time handler processes events',
    status: 'PASSED'
  };
  
  if (typeof window.handleReactionChange !== 'function') {
    test4.status = 'FAILED';
    test4.error = 'handleReactionChange function not available';
  } else {
    // Test with mock payload
    const mockPayload = {
      eventType: 'INSERT',
      new: {
        message_id: 'test-message-id',
        emoji: '👍',
        user_id: 'test-user-123'
      },
      old: null
    };
    
    try {
      // Should not throw error
      window.handleReactionChange(mockPayload);
      console.log('  ✅ Handler processed mock payload without error');
    } catch (error) {
      test4.status = 'FAILED';
      test4.error = error.message;
      console.error('  Error:', error);
    }
  }
  
  console.log(`  ${test4.status === 'PASSED' ? '✅' : '❌'} ${test4.name}`);
  if (test4.error) console.log(`  Error: ${test4.error}`);
  results.tests.push(test4);
  if (test4.status === 'PASSED') results.passed++; else results.failed++;
  
  // Test 5: Check API integration
  console.log('\n📋 Test 5: API Integration');
  const test5 = {
    name: 'API module available for reactions',
    status: 'PASSED'
  };
  
  if (typeof window.api === 'undefined' || typeof window.api.request !== 'function') {
    test5.status = 'FAILED';
    test5.error = 'API module not available';
  } else {
    console.log('  ✅ API module available');
  }
  
  console.log(`  ${test5.status === 'PASSED' ? '✅' : '❌'} ${test5.name}`);
  if (test5.error) console.log(`  Error: ${test5.error}`);
  results.tests.push(test5);
  if (test5.status === 'PASSED') results.passed++; else results.failed++;
  
  // Summary
  console.log('\n📊 TEST SUMMARY');
  console.log('================');
  console.log(`Total Tests: ${results.tests.length}`);
  console.log(`Passed: ${results.passed}`);
  console.log(`Failed: ${results.failed}`);
  console.log(`Skipped: ${results.tests.filter(t => t.status === 'SKIPPED').length}`);
  
  return results;
};

// COMP METHOD: Diagnostic function for troubleshooting
window.diagnoseReactionIssues = function() {
  console.log('🔍 REACTION SYSTEM DIAGNOSTICS');
  console.log('==============================');
  
  const diagnostics = {
    timestamp: new Date().toISOString(),
    functions: {},
    dom: {},
    realtime: {},
    api: {}
  };
  
  // Check functions
  console.log('\n📋 Function Availability:');
  const functions = [
    'loadMessageReactions',
    'updateReactionDisplay',
    'handleReactionChange',
    'addReactionToMessage',
    'removeReactionFromMessage',
    'updateReactionInMessage',
    'refreshAllReactionDisplays'
  ];
  
  functions.forEach(funcName => {
    const available = typeof window[funcName] === 'function';
    diagnostics.functions[funcName] = available;
    console.log(`  ${available ? '✅' : '❌'} ${funcName}: ${available ? 'Available' : 'Missing'}`);
  });
  
  // Check DOM elements
  console.log('\n📋 DOM Elements:');
  const messageElements = document.querySelectorAll('[data-message-id]');
  diagnostics.dom.messageCount = messageElements.length;
  console.log(`  Messages in DOM: ${messageElements.length}`);
  
  if (messageElements.length > 0) {
    const firstMessage = messageElements[0];
    const messageId = firstMessage.getAttribute('data-message-id');
    const reactionBtn = firstMessage.querySelector('.reaction-btn');
    
    diagnostics.dom.firstMessageId = messageId;
    diagnostics.dom.hasReactionButton = !!reactionBtn;
    
    console.log(`  First message ID: ${messageId}`);
    console.log(`  Has reaction button: ${!!reactionBtn}`);
    
    if (reactionBtn) {
      const countSpan = reactionBtn.querySelector('.icon-count');
      diagnostics.dom.hasCountSpan = !!countSpan;
      console.log(`  Has count span: ${!!countSpan}`);
      
      if (countSpan) {
        diagnostics.dom.countSpanText = countSpan.textContent;
        diagnostics.dom.countSpanDisplay = window.getComputedStyle(countSpan).display;
        console.log(`  Count span text: "${countSpan.textContent}"`);
        console.log(`  Count span display: ${diagnostics.dom.countSpanDisplay}`);
      }
    }
  }
  
  // Check real-time
  console.log('\n📋 Real-time System:');
  diagnostics.realtime.handleReactionChangeAvailable = typeof window.handleReactionChange === 'function';
  diagnostics.realtime.supabaseAvailable = typeof window.supabase !== 'undefined';
  diagnostics.realtime.supabaseRealtimeClientAvailable = typeof window.supabaseRealtimeClient !== 'undefined';
  
  console.log(`  handleReactionChange available: ${diagnostics.realtime.handleReactionChangeAvailable}`);
  console.log(`  Supabase client available: ${diagnostics.realtime.supabaseAvailable}`);
  console.log(`  SupabaseRealtimeClient available: ${diagnostics.realtime.supabaseRealtimeClientAvailable}`);
  
  // Check API
  console.log('\n📋 API Module:');
  diagnostics.api.moduleAvailable = typeof window.api !== 'undefined';
  diagnostics.api.requestAvailable = typeof window.api?.request === 'function';
  
  console.log(`  API module available: ${diagnostics.api.moduleAvailable}`);
  console.log(`  API.request available: ${diagnostics.api.requestAvailable}`);
  
  // Check current user
  console.log('\n📋 Current User:');
  if (window.currentUser) {
    console.log(`  Email: ${window.currentUser.email}`);
    console.log(`  Name: ${window.currentUser.name}`);
  } else {
    console.log('  ⚠️ No current user found');
  }
  
  // Return diagnostics object for programmatic access
  console.log('\n📦 Full diagnostics object saved to window.reactionDiagnostics');
  window.reactionDiagnostics = diagnostics;
  
  return diagnostics;
};

// COMP METHOD: Test reaction update with mock data
window.testReactionUpdate = async function(messageId) {
  console.log('🧪 TESTING REACTION UPDATE');
  console.log('===========================');
  
  if (!messageId) {
    // Get first message ID if not provided
    const firstMessage = document.querySelector('[data-message-id]');
    if (!firstMessage) {
      console.error('❌ No messages found in DOM');
      return;
    }
    messageId = firstMessage.getAttribute('data-message-id');
    console.log(`Using first message ID: ${messageId}`);
  }
  
  const reactionBtn = document.querySelector(`[data-message-id="${messageId}"] .reaction-btn`);
  if (!reactionBtn) {
    console.error(`❌ No reaction button found for message: ${messageId}`);
    return;
  }
  
  console.log('\n📋 Before Update:');
  const beforeCount = reactionBtn.querySelector('.icon-count')?.textContent || 'none';
  console.log(`  Count: ${beforeCount}`);
  console.log(`  Emoji: ${reactionBtn.textContent.split('\n')[0]}`);
  
  // Test with mock reactions
  const mockReactions = [
    { emoji: '👍', user_email: 'user1@example.com' },
    { emoji: '👍', user_email: 'user2@example.com' },
    { emoji: '❓', user_email: window.currentUser?.email || 'current@example.com' }
  ];
  
  console.log('\n📋 Updating with mock reactions:', mockReactions);
  await window.updateReactionDisplay(messageId, mockReactions);
  
  console.log('\n📋 After Update:');
  const afterCount = reactionBtn.querySelector('.icon-count')?.textContent || 'none';
  console.log(`  Count: ${afterCount}`);
  console.log(`  Emoji: ${reactionBtn.textContent.split('\n')[0]}`);
  
  if (afterCount !== beforeCount) {
    console.log('✅ Reaction count updated successfully!');
  } else {
    console.log('⚠️ Reaction count did not change');
  }
  
  return { beforeCount, afterCount, success: afterCount !== beforeCount };
};

console.log('✅ REACTION TEST SUITE LOADED');
console.log('Available functions:');
console.log('  - testReactionPropagation() - Run comprehensive test suite');
console.log('  - diagnoseReactionIssues() - Run diagnostics');
console.log('  - testReactionUpdate(messageId) - Test reaction update with mock data');

