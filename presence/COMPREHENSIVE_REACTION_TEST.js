/**
 * COMP METHOD: Comprehensive Reaction System Test
 * 
 * This script tests all reaction functionality including:
 * - Reaction propagation
 * - Modal display and border
 * - Real-time updates
 * - API integration
 * 
 * Run this in the browser console to test all fixes
 */

(function() {
  'use strict';
  
  console.log('🧪 COMPREHENSIVE REACTION SYSTEM TEST');
  console.log('=====================================');
  
  const testResults = {
    timestamp: new Date().toISOString(),
    tests: {},
    errors: [],
    summary: {}
  };
  
  // Test 1: Function Availability
  console.log('\n📋 Test 1: Function Availability');
  const requiredFunctions = [
    'loadMessageReactions',
    'updateReactionDisplay', 
    'handleReactionChange',
    'addReactionToMessage',
    'removeReactionFromMessage',
    'updateReactionInMessage'
  ];
  
  let functionsAvailable = 0;
  requiredFunctions.forEach(func => {
    const available = typeof window[func] === 'function';
    testResults.tests[`function_${func}`] = available;
    console.log(`  ${available ? '✅' : '❌'} ${func}: ${available ? 'Available' : 'Missing'}`);
    if (available) functionsAvailable++;
  });
  
  testResults.summary.functionsAvailable = `${functionsAvailable}/${requiredFunctions.length}`;
  
  // Test 2: DOM Elements
  console.log('\n📋 Test 2: DOM Elements');
  const messageElements = document.querySelectorAll('[data-message-id]');
  testResults.tests.domMessages = messageElements.length > 0;
  console.log(`  Messages in DOM: ${messageElements.length}`);
  
  if (messageElements.length > 0) {
    const firstMessage = messageElements[0];
    const messageId = firstMessage.getAttribute('data-message-id');
    const reactionBtn = firstMessage.querySelector('.reaction-btn');
    
    testResults.tests.domReactionButton = !!reactionBtn;
    console.log(`  First message ID: ${messageId}`);
    console.log(`  Has reaction button: ${!!reactionBtn}`);
    
    if (reactionBtn) {
      const countSpan = reactionBtn.querySelector('.icon-count');
      testResults.tests.domCountSpan = !!countSpan;
      console.log(`  Has count span: ${!!countSpan}`);
      
      if (countSpan) {
        console.log(`  Count span text: "${countSpan.textContent}"`);
        console.log(`  Count span display: ${window.getComputedStyle(countSpan).display}`);
      }
    }
  }
  
  // Test 3: CSS Styles (Modal Border Fix)
  console.log('\n📋 Test 3: CSS Styles (Modal Border Fix)');
  try {
    const styleSheet = Array.from(document.styleSheets).find(sheet => {
      try {
        return Array.from(sheet.cssRules || []).some(rule => 
          rule.selectorText && rule.selectorText.includes('.reaction-modal')
        );
      } catch (e) {
        return false;
      }
    });
    
    if (styleSheet) {
      const rules = Array.from(styleSheet.cssRules || []);
      const modalRule = rules.find(r => r.selectorText === '.reaction-modal');
      const optionsRule = rules.find(r => r.selectorText === '.reaction-options');
      
      if (modalRule) {
        const modalStyles = modalRule.style;
        const modalBorder = modalStyles.border || 'not set';
        const modalBackground = modalStyles.backgroundColor || 'not set';
        
        testResults.tests.cssModalBorderFixed = modalBorder === 'none' || modalBorder === 'not set';
        console.log(`  .reaction-modal border: ${modalBorder}`);
        console.log(`  .reaction-modal background: ${modalBackground}`);
        console.log(`  Modal border fixed: ${testResults.tests.cssModalBorderFixed ? '✅' : '❌'}`);
      }
      
      if (optionsRule) {
        const optionsStyles = optionsRule.style;
        const optionsBorder = optionsStyles.border || 'not set';
        const optionsBackground = optionsStyles.backgroundColor || 'not set';
        
        testResults.tests.cssOptionsStyled = optionsBorder !== 'not set' && optionsBackground !== 'not set';
        console.log(`  .reaction-options border: ${optionsBorder}`);
        console.log(`  .reaction-options background: ${optionsBackground}`);
        console.log(`  Options properly styled: ${testResults.tests.cssOptionsStyled ? '✅' : '❌'}`);
      }
    }
  } catch (e) {
    testResults.errors.push(`CSS test error: ${e.message}`);
    console.error('  ❌ CSS test error:', e);
  }
  
  // Test 4: Real-time System
  console.log('\n📋 Test 4: Real-time System');
  const realtimeAvailable = typeof window.supabaseRealtimeClient !== 'undefined';
  const handleReactionChangeAvailable = typeof window.handleReactionChange === 'function';
  
  testResults.tests.realtimeClient = realtimeAvailable;
  testResults.tests.realtimeHandler = handleReactionChangeAvailable;
  
  console.log(`  SupabaseRealtimeClient available: ${realtimeAvailable}`);
  console.log(`  handleReactionChange available: ${handleReactionChangeAvailable}`);
  
  // Test 5: API Module
  console.log('\n📋 Test 5: API Module');
  const apiAvailable = typeof window.api !== 'undefined';
  const apiRequestAvailable = typeof window.api?.request === 'function';
  
  testResults.tests.apiModule = apiAvailable;
  testResults.tests.apiRequest = apiRequestAvailable;
  
  console.log(`  API module available: ${apiAvailable}`);
  console.log(`  API.request available: ${apiRequestAvailable}`);
  
  if (window.api) {
    console.log(`  API base URL: ${window.api.baseUrl || 'unknown'}`);
  }
  
  // Test 6: Reaction Propagation Test
  console.log('\n📋 Test 6: Reaction Propagation Test');
  if (messageElements.length > 0 && window.updateReactionDisplay) {
    const testMessageId = messageElements[0].getAttribute('data-message-id');
    console.log(`  Testing with message: ${testMessageId}`);
    
    try {
      // Test with mock reactions
      const mockReactions = [
        { emoji: '👍', user_email: 'test1@example.com' },
        { emoji: '👍', user_email: window.currentUser?.email || 'test2@example.com' },
        { emoji: '❤️', user_email: 'test3@example.com' }
      ];
      
      console.log('  Running updateReactionDisplay test...');
      window.updateReactionDisplay(testMessageId, mockReactions);
      
      // Wait for DOM updates
      setTimeout(() => {
        const reactionBtn = document.querySelector(`[data-message-id="${testMessageId}"] .reaction-btn`);
        if (reactionBtn) {
          const countSpan = reactionBtn.querySelector('.icon-count');
          if (countSpan) {
            const count = countSpan.textContent;
            testResults.tests.reactionPropagation = count === '3';
            console.log(`  Reaction count after test: ${count}`);
            console.log(`  Propagation test: ${testResults.tests.reactionPropagation ? '✅' : '❌'}`);
          }
        }
      }, 100);
      
    } catch (e) {
      testResults.errors.push(`Reaction propagation test error: ${e.message}`);
      console.error('  ❌ Reaction propagation test error:', e);
    }
  } else {
    console.log('  ⏭️ Skipping test (missing requirements)');
  }
  
  // Test 7: Modal Display Test
  console.log('\n📋 Test 7: Modal Display Test');
  if (messageElements.length > 0 && window.showReactionModal) {
    const testMessageId = messageElements[0].getAttribute('data-message-id');
    const reactionBtn = document.querySelector(`[data-message-id="${testMessageId}"] .reaction-btn`);
    
    if (reactionBtn) {
      try {
        console.log('  Testing modal display...');
        window.showReactionModal(testMessageId);
        
        // Check if modal was created
        setTimeout(() => {
          const modal = document.querySelector('.reaction-modal');
          const options = document.querySelector('.reaction-options');
          
          testResults.tests.modalCreated = !!modal;
          testResults.tests.modalOptions = !!options;
          
          console.log(`  Modal created: ${!!modal}`);
          console.log(`  Modal options: ${!!options}`);
          
          if (modal) {
            const modalStyles = window.getComputedStyle(modal);
            const optionsStyles = window.getComputedStyle(options);
            
            console.log(`  Modal border: ${modalStyles.border}`);
            console.log(`  Modal background: ${modalStyles.backgroundColor}`);
            console.log(`  Options border: ${optionsStyles.border}`);
            console.log(`  Options background: ${optionsStyles.backgroundColor}`);
            
            // Clean up modal
            modal.remove();
          }
        }, 100);
        
      } catch (e) {
        testResults.errors.push(`Modal test error: ${e.message}`);
        console.error('  ❌ Modal test error:', e);
      }
    }
  } else {
    console.log('  ⏭️ Skipping test (missing requirements)');
  }
  
  // Summary
  console.log('\n📊 TEST SUMMARY');
  console.log('================');
  console.log(`Timestamp: ${testResults.timestamp}`);
  console.log(`Functions available: ${testResults.summary.functionsAvailable}`);
  console.log(`Tests passed: ${Object.values(testResults.tests).filter(t => t === true).length}/${Object.keys(testResults.tests).length}`);
  console.log(`Errors: ${testResults.errors.length}`);
  
  if (testResults.errors.length > 0) {
    console.log('\n❌ Errors found:');
    testResults.errors.forEach((error, index) => {
      console.log(`  ${index + 1}. ${error}`);
    });
  }
  
  // Save results
  window.reactionTestResults = testResults;
  console.log('\n💾 Test results saved to window.reactionTestResults');
  
  console.log('\n✅ COMPREHENSIVE TEST COMPLETE');
  console.log('==============================');
  
  return testResults;
})();
