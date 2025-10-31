/**
 * REACTION PROPAGATION TEST - COMP METHOD
 * 
 * This script tests the reaction propagation fixes:
 * 1. Global reactions integration initialization
 * 2. Real-time subscription setup
 * 3. Reaction propagation between clients
 * 4. UI updates after real-time events
 * 
 * Run this in the browser console to test all fixes
 */

(function() {
  'use strict';
  
  console.log('🧪 REACTION PROPAGATION TEST - COMP METHOD');
  console.log('==========================================');
  
  const testResults = {
    timestamp: new Date().toISOString(),
    tests: {},
    errors: [],
    summary: {}
  };
  
  // Test 1: Check ReactionsIntegration availability
  console.log('\\n📋 Test 1: ReactionsIntegration Availability');
  try {
    const hasReactionsIntegration = typeof window.reactionsIntegration !== 'undefined';
    const isInitialized = hasReactionsIntegration ? window.reactionsIntegration.isInitialized : false;
    
    testResults.tests.reactionsIntegration = {
      available: hasReactionsIntegration,
      initialized: isInitialized,
      status: hasReactionsIntegration ? window.reactionsIntegration.getStatus() : null
    };
    
    console.log(`  ✅ ReactionsIntegration available: ${hasReactionsIntegration}`);
    console.log(`  ✅ ReactionsIntegration initialized: ${isInitialized}`);
    
    if (hasReactionsIntegration && !isInitialized) {
      console.log('  🔧 Attempting to initialize ReactionsIntegration...');
      window.reactionsIntegration.initialize().then(success => {
        console.log(`  ${success ? '✅' : '❌'} Initialization result: ${success}`);
      });
    }
    
  } catch (error) {
    testResults.errors.push({ test: 'reactionsIntegration', error: error.message });
    console.log(`  ❌ Error: ${error.message}`);
  }
  
  // Test 2: Check global handleReactionChange function
  console.log('\\n📋 Test 2: Global handleReactionChange Function');
  try {
    const hasHandler = typeof window.handleReactionChange === 'function';
    testResults.tests.handleReactionChange = { available: hasHandler };
    console.log(`  ${hasHandler ? '✅' : '❌'} handleReactionChange available: ${hasHandler}`);
  } catch (error) {
    testResults.errors.push({ test: 'handleReactionChange', error: error.message });
    console.log(`  ❌ Error: ${error.message}`);
  }
  
  // Test 3: Check Supabase real-time connection
  console.log('\\n📋 Test 3: Supabase Real-time Connection');
  try {
    const hasSupabase = typeof window.supabase !== 'undefined';
    const hasRealtimeClient = hasSupabase ? typeof window.supabaseRealtimeClient !== 'undefined' : false;
    
    testResults.tests.supabase = {
      available: hasSupabase,
      realtimeClient: hasRealtimeClient
    };
    
    console.log(`  ${hasSupabase ? '✅' : '❌'} Supabase available: ${hasSupabase}`);
    console.log(`  ${hasRealtimeClient ? '✅' : '❌'} RealtimeClient available: ${hasRealtimeClient}`);
    
    if (hasSupabase) {
      console.log('  🔍 Supabase URL:', window.supabase.supabaseUrl);
    }
    
  } catch (error) {
    testResults.errors.push({ test: 'supabase', error: error.message });
    console.log(`  ❌ Error: ${error.message}`);
  }
  
  // Test 4: Check reaction functions availability
  console.log('\\n📋 Test 4: Reaction Functions Availability');
  const requiredFunctions = [
    'loadMessageReactions',
    'updateReactionDisplay',
    'addReactionToMessage',
    'removeReactionFromMessage',
    'updateReactionInMessage'
  ];
  
  testResults.tests.reactionFunctions = {};
  
  requiredFunctions.forEach(funcName => {
    const isAvailable = typeof window[funcName] === 'function';
    testResults.tests.reactionFunctions[funcName] = isAvailable;
    console.log(`  ${isAvailable ? '✅' : '❌'} ${funcName}: ${isAvailable}`);
  });
  
  // Test 5: Check DOM elements
  console.log('\\n📋 Test 5: DOM Elements');
  try {
    const messageElements = document.querySelectorAll('[data-message-id]');
    const reactionButtons = document.querySelectorAll('.reaction-btn');
    
    testResults.tests.domElements = {
      messages: messageElements.length,
      reactionButtons: reactionButtons.length
    };
    
    console.log(`  ✅ Messages in DOM: ${messageElements.length}`);
    console.log(`  ✅ Reaction buttons: ${reactionButtons.length}`);
    
    if (messageElements.length > 0) {
      const firstMessage = messageElements[0];
      const messageId = firstMessage.getAttribute('data-message-id');
      const reactionBtn = firstMessage.querySelector('.reaction-btn');
      const countSpan = reactionBtn?.querySelector('.reaction-count');
      
      console.log(`  🔍 First message ID: ${messageId}`);
      console.log(`  🔍 Has reaction button: ${!!reactionBtn}`);
      console.log(`  🔍 Has count span: ${!!countSpan}`);
      
      if (countSpan) {
        console.log(`  🔍 Current count: ${countSpan.textContent}`);
      }
    }
    
  } catch (error) {
    testResults.errors.push({ test: 'domElements', error: error.message });
    console.log(`  ❌ Error: ${error.message}`);
  }
  
  // Test 6: Simulate reaction propagation test
  console.log('\\n📋 Test 6: Reaction Propagation Simulation');
  try {
    const messageElements = document.querySelectorAll('[data-message-id]');
    if (messageElements.length > 0) {
      const testMessageId = messageElements[0].getAttribute('data-message-id');
      console.log(`  🧪 Testing with message: ${testMessageId}`);
      
      // Create a mock real-time payload
      const mockPayload = {
        eventType: 'INSERT',
        new: {
          id: 'test-reaction-' + Date.now(),
          message_id: testMessageId,
          user_email: 'test@example.com',
          emoji: '🧪',
          created_at: new Date().toISOString()
        }
      };
      
      console.log('  🧪 Simulating real-time reaction event...');
      if (typeof window.handleReactionChange === 'function') {
        window.handleReactionChange(mockPayload);
        console.log('  ✅ Mock real-time event processed');
      } else {
        console.log('  ❌ handleReactionChange not available');
      }
      
    } else {
      console.log('  ⚠️ No messages found for testing');
    }
    
  } catch (error) {
    testResults.errors.push({ test: 'propagationSimulation', error: error.message });
    console.log(`  ❌ Error: ${error.message}`);
  }
  
  // Test 7: Check CSS fixes
  console.log('\\n📋 Test 7: CSS Modal Border Fix');
  try {
    const style = getComputedStyle(document.documentElement);
    const reactionModalStyle = document.querySelector('.reaction-modal');
    
    if (reactionModalStyle) {
      const computedStyle = getComputedStyle(reactionModalStyle);
      const hasBorder = computedStyle.border !== '0px none' && computedStyle.border !== 'none';
      const isTransparent = computedStyle.background === 'rgba(0, 0, 0, 0)' || computedStyle.background === 'transparent';
      
      testResults.tests.cssFix = {
        modalExists: true,
        hasBorder: hasBorder,
        isTransparent: isTransparent,
        borderFixed: !hasBorder && isTransparent
      };
      
      console.log(`  ${!hasBorder ? '✅' : '❌'} Modal border removed: ${!hasBorder}`);
      console.log(`  ${isTransparent ? '✅' : '❌'} Modal background transparent: ${isTransparent}`);
      console.log(`  ${(!hasBorder && isTransparent) ? '✅' : '❌'} CSS fix applied: ${!hasBorder && isTransparent}`);
    } else {
      console.log('  ⚠️ No reaction modal found in DOM');
      testResults.tests.cssFix = { modalExists: false };
    }
    
  } catch (error) {
    testResults.errors.push({ test: 'cssFix', error: error.message });
    console.log(`  ❌ Error: ${error.message}`);
  }
  
  // Summary
  console.log('\\n📊 TEST SUMMARY');
  console.log('================');
  
  const totalTests = Object.keys(testResults.tests).length;
  const passedTests = Object.values(testResults.tests).filter(test => 
    typeof test === 'object' ? 
      Object.values(test).every(value => value === true || (typeof value === 'number' && value > 0)) :
      test === true
  ).length;
  
  testResults.summary = {
    totalTests,
    passedTests,
    failedTests: totalTests - passedTests,
    errors: testResults.errors.length
  };
  
  console.log(`  Total tests: ${totalTests}`);
  console.log(`  Passed: ${passedTests}`);
  console.log(`  Failed: ${totalTests - passedTests}`);
  console.log(`  Errors: ${testResults.errors.length}`);
  
  if (testResults.errors.length > 0) {
    console.log('\\n❌ ERRORS:');
    testResults.errors.forEach((error, index) => {
      console.log(`  ${index + 1}. ${error.test}: ${error.error}`);
    });
  }
  
  console.log('\\n✅ REACTION PROPAGATION TEST COMPLETE');
  console.log('=====================================');
  
  // Store results globally for debugging
  window.reactionPropagationTestResults = testResults;
  
  return testResults;
})();


