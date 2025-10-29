/**
 * REACTION PROPAGATION DIAGNOSTIC - COMP METHOD
 * 
 * This script provides comprehensive diagnostics for reaction propagation issues:
 * 1. Checks ReactionsIntegration status and initialization
 * 2. Verifies real-time subscription setup
 * 3. Tests reaction operations through the integration
 * 4. Monitors real-time events
 * 5. Provides debugging information
 * 
 * Run this in the browser console to diagnose reaction propagation issues
 */

(function() {
  'use strict';
  
  console.log('🔍 REACTION PROPAGATION DIAGNOSTIC - COMP METHOD');
  console.log('===============================================');
  
  const diagnostic = {
    timestamp: new Date().toISOString(),
    status: {},
    tests: {},
    errors: [],
    recommendations: []
  };
  
  // Test 1: Check ReactionsIntegration Status
  console.log('\\n📋 Test 1: ReactionsIntegration Status');
  try {
    const hasIntegration = typeof window.reactionsIntegration !== 'undefined';
    const isInitialized = hasIntegration ? window.reactionsIntegration.isInitialized : false;
    const status = hasIntegration ? window.reactionsIntegration.getStatus() : null;
    
    diagnostic.status.reactionsIntegration = {
      available: hasIntegration,
      initialized: isInitialized,
      status: status
    };
    
    console.log(`  ${hasIntegration ? '✅' : '❌'} ReactionsIntegration available: ${hasIntegration}`);
    console.log(`  ${isInitialized ? '✅' : '❌'} ReactionsIntegration initialized: ${isInitialized}`);
    
    if (status) {
      console.log('  📊 Integration status:', status);
    }
    
    if (hasIntegration && !isInitialized) {
      diagnostic.recommendations.push('Initialize ReactionsIntegration: window.reactionsIntegration.initialize()');
    }
    
  } catch (error) {
    diagnostic.errors.push({ test: 'reactionsIntegration', error: error.message });
    console.log(`  ❌ Error: ${error.message}`);
  }
  
  // Test 2: Check Real-time Subscription
  console.log('\\n📋 Test 2: Real-time Subscription Status');
  try {
    const hasSupabase = typeof window.supabase !== 'undefined';
    const hasRealtimeClient = typeof window.supabaseRealtimeClient !== 'undefined';
    const hasHandleReactionChange = typeof window.handleReactionChange === 'function';
    
    diagnostic.status.realtime = {
      supabase: hasSupabase,
      realtimeClient: hasRealtimeClient,
      handleReactionChange: hasHandleReactionChange
    };
    
    console.log(`  ${hasSupabase ? '✅' : '❌'} Supabase available: ${hasSupabase}`);
    console.log(`  ${hasRealtimeClient ? '✅' : '❌'} RealtimeClient available: ${hasRealtimeClient}`);
    console.log(`  ${hasHandleReactionChange ? '✅' : '❌'} handleReactionChange available: ${hasHandleReactionChange}`);
    
    if (hasSupabase) {
      console.log('  🔍 Supabase URL:', window.supabase.supabaseUrl);
    }
    
    if (!hasHandleReactionChange) {
      diagnostic.recommendations.push('handleReactionChange function not available - check CanopiModule loading');
    }
    
  } catch (error) {
    diagnostic.errors.push({ test: 'realtime', error: error.message });
    console.log(`  ❌ Error: ${error.message}`);
  }
  
  // Test 3: Check API Module
  console.log('\\n📋 Test 3: API Module Status');
  try {
    const hasApi = typeof window.api !== 'undefined';
    const hasApiRequest = hasApi ? typeof window.api.request === 'function' : false;
    
    diagnostic.status.api = {
      available: hasApi,
      requestFunction: hasApiRequest
    };
    
    console.log(`  ${hasApi ? '✅' : '❌'} API module available: ${hasApi}`);
    console.log(`  ${hasApiRequest ? '✅' : '❌'} API request function available: ${hasApiRequest}`);
    
    if (!hasApi) {
      diagnostic.recommendations.push('API module not available - check APIModule.js loading');
    }
    
  } catch (error) {
    diagnostic.errors.push({ test: 'api', error: error.message });
    console.log(`  ❌ Error: ${error.message}`);
  }
  
  // Test 4: Check Current User
  console.log('\\n📋 Test 4: Current User Status');
  try {
    const hasCurrentUser = typeof window.currentUser !== 'undefined';
    const userEmail = hasCurrentUser ? window.currentUser.email : null;
    
    diagnostic.status.user = {
      available: hasCurrentUser,
      email: userEmail
    };
    
    console.log(`  ${hasCurrentUser ? '✅' : '❌'} Current user available: ${hasCurrentUser}`);
    if (userEmail) {
      console.log(`  📧 User email: ${userEmail}`);
    }
    
    if (!hasCurrentUser) {
      diagnostic.recommendations.push('Current user not available - authentication may be required');
    }
    
  } catch (error) {
    diagnostic.errors.push({ test: 'user', error: error.message });
    console.log(`  ❌ Error: ${error.message}`);
  }
  
  // Test 5: Check DOM Elements
  console.log('\\n📋 Test 5: DOM Elements');
  try {
    const messageElements = document.querySelectorAll('[data-message-id]');
    const reactionButtons = document.querySelectorAll('.reaction-btn');
    
    diagnostic.status.dom = {
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
      
      diagnostic.tests.testMessageId = messageId;
    }
    
  } catch (error) {
    diagnostic.errors.push({ test: 'dom', error: error.message });
    console.log(`  ❌ Error: ${error.message}`);
  }
  
  // Test 6: Test Reaction Integration (if available)
  console.log('\\n📋 Test 6: Reaction Integration Test');
  try {
    if (window.reactionsIntegration && window.reactionsIntegration.isInitialized) {
      console.log('  🧪 Testing reaction integration...');
      
      const testMessageId = diagnostic.tests.testMessageId;
      if (testMessageId) {
        console.log(`  🧪 Testing with message: ${testMessageId}`);
        
        // Test adding a reaction
        console.log('  🧪 Testing addReaction...');
        const addResult = await window.reactionsIntegration.addReaction(testMessageId, '🧪');
        console.log(`  ${addResult ? '✅' : '❌'} Add reaction result: ${addResult}`);
        
        // Wait a moment
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Test removing a reaction
        console.log('  🧪 Testing removeReaction...');
        const removeResult = await window.reactionsIntegration.removeReaction(testMessageId, '🧪');
        console.log(`  ${removeResult ? '✅' : '❌'} Remove reaction result: ${removeResult}`);
        
        diagnostic.tests.integrationTest = {
          addResult: addResult,
          removeResult: removeResult
        };
        
      } else {
        console.log('  ⚠️ No test message available');
      }
    } else {
      console.log('  ⚠️ ReactionsIntegration not available for testing');
    }
    
  } catch (error) {
    diagnostic.errors.push({ test: 'integrationTest', error: error.message });
    console.log(`  ❌ Error: ${error.message}`);
  }
  
  // Test 7: Monitor Real-time Events
  console.log('\\n📋 Test 7: Real-time Event Monitoring');
  try {
    if (typeof window.handleReactionChange === 'function') {
      console.log('  🔍 Setting up real-time event monitor...');
      
      // Store original function
      const originalHandler = window.handleReactionChange;
      let eventCount = 0;
      
      // Wrap the function to monitor calls
      window.handleReactionChange = function(payload) {
        eventCount++;
        console.log(`  🔔 Real-time event #${eventCount}:`, payload);
        console.log(`  🔔 Event type: ${payload.eventType}`);
        console.log(`  🔔 Message ID: ${payload.new?.message_id || payload.old?.message_id}`);
        console.log(`  🔔 Emoji: ${payload.new?.emoji || payload.old?.emoji}`);
        console.log(`  🔔 User: ${payload.new?.user_email || payload.old?.user_email}`);
        
        // Call original function
        return originalHandler(payload);
      };
      
      console.log('  ✅ Real-time event monitor active');
      console.log('  📝 Events will be logged as they occur');
      
      diagnostic.tests.realtimeMonitor = {
        active: true,
        eventCount: 0
      };
      
    } else {
      console.log('  ❌ handleReactionChange not available for monitoring');
    }
    
  } catch (error) {
    diagnostic.errors.push({ test: 'realtimeMonitor', error: error.message });
    console.log(`  ❌ Error: ${error.message}`);
  }
  
  // Summary
  console.log('\\n📊 DIAGNOSTIC SUMMARY');
  console.log('=====================');
  
  const totalChecks = Object.keys(diagnostic.status).length;
  const passedChecks = Object.values(diagnostic.status).filter(status => 
    Object.values(status).every(value => value === true || (typeof value === 'number' && value > 0))
  ).length;
  
  console.log(`  Total checks: ${totalChecks}`);
  console.log(`  Passed: ${passedChecks}`);
  console.log(`  Failed: ${totalChecks - passedChecks}`);
  console.log(`  Errors: ${diagnostic.errors.length}`);
  console.log(`  Recommendations: ${diagnostic.recommendations.length}`);
  
  if (diagnostic.errors.length > 0) {
    console.log('\\n❌ ERRORS:');
    diagnostic.errors.forEach((error, index) => {
      console.log(`  ${index + 1}. ${error.test}: ${error.error}`);
    });
  }
  
  if (diagnostic.recommendations.length > 0) {
    console.log('\\n💡 RECOMMENDATIONS:');
    diagnostic.recommendations.forEach((rec, index) => {
      console.log(`  ${index + 1}. ${rec}`);
    });
  }
  
  // Helper functions
  console.log('\\n🛠️ HELPER FUNCTIONS:');
  console.log('  - testReactionPropagation(): Run a full propagation test');
  console.log('  - initializeReactionsIntegration(): Initialize the reactions integration');
  console.log('  - checkRealTimeEvents(): Check for recent real-time events');
  
  // Add helper functions to window
  window.testReactionPropagation = async function() {
    console.log('🧪 Running full reaction propagation test...');
    const testMessageId = diagnostic.tests.testMessageId;
    if (!testMessageId) {
      console.log('❌ No test message available');
      return false;
    }
    
    if (!window.reactionsIntegration?.isInitialized) {
      console.log('❌ ReactionsIntegration not initialized');
      return false;
    }
    
    try {
      // Add reaction
      console.log('Adding test reaction...');
      const addResult = await window.reactionsIntegration.addReaction(testMessageId, '🧪');
      console.log(`Add result: ${addResult}`);
      
      // Wait for propagation
      console.log('Waiting for propagation...');
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Remove reaction
      console.log('Removing test reaction...');
      const removeResult = await window.reactionsIntegration.removeReaction(testMessageId, '🧪');
      console.log(`Remove result: ${removeResult}`);
      
      return addResult && removeResult;
    } catch (error) {
      console.error('Test failed:', error);
      return false;
    }
  };
  
  window.initializeReactionsIntegration = async function() {
    console.log('🔧 Initializing ReactionsIntegration...');
    if (window.reactionsIntegration) {
      const result = await window.reactionsIntegration.initialize();
      console.log(`Initialization result: ${result}`);
      return result;
    } else {
      console.log('❌ ReactionsIntegration not available');
      return false;
    }
  };
  
  window.checkRealTimeEvents = function() {
    console.log('🔍 Checking real-time event status...');
    const monitor = diagnostic.tests.realtimeMonitor;
    if (monitor?.active) {
      console.log(`Events received: ${monitor.eventCount}`);
    } else {
      console.log('Real-time monitor not active');
    }
  };
  
  console.log('\\n✅ DIAGNOSTIC COMPLETE');
  console.log('======================');
  
  // Store diagnostic results globally
  window.reactionPropagationDiagnostic = diagnostic;
  
  return diagnostic;
})();
