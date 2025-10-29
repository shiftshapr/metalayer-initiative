/**
 * COMP METHOD: Console Diagnostic Code Block
 * 
 * Copy and paste this entire block into the browser console to diagnose reaction issues
 * This code is self-contained and can be run without any external dependencies
 * 
 * UPDATED: Added checks for reaction propagation and modal border issues
 */

(function() {
  'use strict';
  
  console.log('🔍 REACTION DIAGNOSTICS - STARTING');
  console.log('===================================');
  
  const diagnostics = {
    timestamp: new Date().toISOString(),
    functions: {},
    dom: {},
    realtime: {},
    api: {},
    css: {},
    errors: []
  };
  
  // Check functions
  console.log('\n📋 1. Function Availability:');
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
    try {
      const available = typeof window[funcName] === 'function';
      diagnostics.functions[funcName] = available;
      console.log(`  ${available ? '✅' : '❌'} ${funcName}: ${available ? 'Available' : 'Missing'}`);
    } catch (e) {
      diagnostics.errors.push(`Error checking ${funcName}: ${e.message}`);
      console.log(`  ⚠️ ${funcName}: Error checking - ${e.message}`);
    }
  });
  
  // Check DOM elements
  console.log('\n📋 2. DOM Elements:');
  try {
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
        
        // Check reaction button state
        diagnostics.dom.reactionButtonInnerHTML = reactionBtn.innerHTML;
        diagnostics.dom.reactionButtonDataset = { ...reactionBtn.dataset };
        console.log(`  Button innerHTML: ${reactionBtn.innerHTML.substring(0, 50)}...`);
        console.log(`  Button dataset:`, reactionBtn.dataset);
      }
    } else {
      console.log('  ⚠️ No messages found in DOM');
    }
  } catch (e) {
    diagnostics.errors.push(`Error checking DOM: ${e.message}`);
    console.error('  ❌ Error checking DOM:', e);
  }
  
  // Check CSS styles
  console.log('\n📋 2.5. CSS Styles:');
  try {
    // Check if reaction-modal styles are correct
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
        diagnostics.css.modalBackground = modalStyles.backgroundColor || 'not set';
        diagnostics.css.modalBorder = modalStyles.border || 'not set';
        console.log(`  .reaction-modal background: ${diagnostics.css.modalBackground}`);
        console.log(`  .reaction-modal border: ${diagnostics.css.modalBorder}`);
      }
      
      if (optionsRule) {
        const optionsStyles = optionsRule.style;
        diagnostics.css.optionsBackground = optionsStyles.backgroundColor || 'not set';
        diagnostics.css.optionsBorder = optionsStyles.border || 'not set';
        console.log(`  .reaction-options background: ${diagnostics.css.optionsBackground}`);
        console.log(`  .reaction-options border: ${diagnostics.css.optionsBorder}`);
      }
    }
  } catch (e) {
    diagnostics.errors.push(`Error checking CSS: ${e.message}`);
    console.error('  ❌ Error checking CSS:', e);
  }
  
  // Check real-time
  console.log('\n📋 3. Real-time System:');
  try {
    diagnostics.realtime.handleReactionChangeAvailable = typeof window.handleReactionChange === 'function';
    diagnostics.realtime.supabaseAvailable = typeof window.supabase !== 'undefined';
    diagnostics.realtime.supabaseRealtimeClientAvailable = typeof window.supabaseRealtimeClient !== 'undefined';
    
    console.log(`  handleReactionChange available: ${diagnostics.realtime.handleReactionChangeAvailable}`);
    console.log(`  Supabase client available: ${diagnostics.realtime.supabaseAvailable}`);
    console.log(`  SupabaseRealtimeClient available: ${diagnostics.realtime.supabaseRealtimeClientAvailable}`);
    
    if (window.supabaseRealtimeClient) {
      console.log(`  SupabaseRealtimeClient type: ${typeof window.supabaseRealtimeClient}`);
    }
  } catch (e) {
    diagnostics.errors.push(`Error checking real-time: ${e.message}`);
    console.error('  ❌ Error checking real-time:', e);
  }
  
  // Check API
  console.log('\n📋 4. API Module:');
  try {
    diagnostics.api.moduleAvailable = typeof window.api !== 'undefined';
    diagnostics.api.requestAvailable = typeof window.api?.request === 'function';
    
    console.log(`  API module available: ${diagnostics.api.moduleAvailable}`);
    console.log(`  API.request available: ${diagnostics.api.requestAvailable}`);
    
    if (window.api) {
      diagnostics.api.apiUrl = window.api.baseUrl || 'unknown';
      console.log(`  API base URL: ${diagnostics.api.apiUrl}`);
    }
  } catch (e) {
    diagnostics.errors.push(`Error checking API: ${e.message}`);
    console.error('  ❌ Error checking API:', e);
  }
  
  // Check current user
  console.log('\n📋 5. Current User:');
  try {
    if (window.currentUser) {
      diagnostics.user = {
        email: window.currentUser.email,
        name: window.currentUser.name,
        id: window.currentUser.id
      };
      console.log(`  Email: ${window.currentUser.email}`);
      console.log(`  Name: ${window.currentUser.name}`);
      console.log(`  ID: ${window.currentUser.id}`);
    } else {
      console.log('  ⚠️ No current user found');
      diagnostics.user = null;
    }
  } catch (e) {
    diagnostics.errors.push(`Error checking user: ${e.message}`);
    console.error('  ❌ Error checking user:', e);
  }
  
  // Test reaction propagation
  console.log('\n📋 6. Reaction Propagation Test:');
  try {
    const messageElements = document.querySelectorAll('[data-message-id]');
    if (messageElements.length > 0 && diagnostics.functions.updateReactionDisplay) {
      const testMessageId = messageElements[0].getAttribute('data-message-id');
      console.log(`  Testing with message: ${testMessageId}`);
      
      // Test with mock reactions
      const mockReactions = [
        { emoji: '👍', user_email: 'test1@example.com' },
        { emoji: '👍', user_email: diagnostics.user?.email || 'test2@example.com' }
      ];
      
      console.log('  Running updateReactionDisplay test...');
      // Fix: Remove await since this is not an async function
      window.updateReactionDisplay(testMessageId, mockReactions);
      console.log('  ✅ Update test completed');
      
      // Check if count updated
      const reactionBtn = document.querySelector(`[data-message-id="${testMessageId}"] .reaction-btn`);
      if (reactionBtn) {
        const countSpan = reactionBtn.querySelector('.icon-count');
        if (countSpan && countSpan.textContent === '2') {
          console.log('  ✅ Reaction count updated correctly');
        } else {
          console.log(`  ⚠️ Reaction count may not have updated (current: ${countSpan?.textContent || 'none'})`);
        }
      }
    } else {
      console.log('  ⏭️ Skipping test (missing requirements)');
    }
  } catch (e) {
    diagnostics.errors.push(`Reaction propagation test failed: ${e.message}`);
    console.error('  ❌ Reaction propagation test failed:', e.message);
  }
  
  // Check for errors in console
  console.log('\n📋 7. Recent Errors:');
  if (diagnostics.errors.length > 0) {
    console.log(`  Found ${diagnostics.errors.length} errors during diagnostics:`);
    diagnostics.errors.forEach((error, index) => {
      console.log(`  ${index + 1}. ${error}`);
    });
  } else {
    console.log('  ✅ No errors found during diagnostics');
  }
  
  // Summary
  console.log('\n📊 DIAGNOSTICS SUMMARY');
  console.log('======================');
  console.log(`Timestamp: ${diagnostics.timestamp}`);
  console.log(`Functions available: ${Object.values(diagnostics.functions).filter(f => f).length}/${functions.length}`);
  console.log(`Messages in DOM: ${diagnostics.dom.messageCount || 0}`);
  console.log(`Errors: ${diagnostics.errors.length}`);
  console.log(`Modal CSS fixed: ${diagnostics.css.modalBorder === 'none' || diagnostics.css.modalBorder === 'not set' ? '✅' : '⚠️'}`);
  
  // Save to window for programmatic access
  window.reactionDiagnostics = diagnostics;
  console.log('\n💾 Full diagnostics saved to window.reactionDiagnostics');
  console.log('   Access with: window.reactionDiagnostics');
  
  console.log('\n✅ DIAGNOSTICS COMPLETE');
  console.log('========================');
  
  // Add test functions to window for console access
  window.testReactionPropagation = async function() {
    console.log('🧪 TESTING REACTION PROPAGATION');
    console.log('===============================');
    
    try {
      const messageElements = document.querySelectorAll('[data-message-id]');
      if (messageElements.length === 0) {
        console.log('❌ No messages found in DOM');
        return false;
      }
      
      const testMessageId = messageElements[0].getAttribute('data-message-id');
      console.log(`Testing with message: ${testMessageId}`);
      
      // Test 1: Check if functions are available
      if (!window.updateReactionDisplay) {
        console.log('❌ updateReactionDisplay function not available');
        return false;
      }
      
      // Test 2: Test with mock reactions
      const mockReactions = [
        { emoji: '👍', user_email: 'test1@example.com' },
        { emoji: '👍', user_email: window.currentUser?.email || 'test2@example.com' },
        { emoji: '❤️', user_email: 'test3@example.com' }
      ];
      
      console.log('Running updateReactionDisplay test...');
      window.updateReactionDisplay(testMessageId, mockReactions);
      
      // Wait a bit for DOM updates
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Check results
      const reactionBtn = document.querySelector(`[data-message-id="${testMessageId}"] .reaction-btn`);
      if (!reactionBtn) {
        console.log('❌ Reaction button not found');
        return false;
      }
      
      const countSpan = reactionBtn.querySelector('.icon-count');
      if (!countSpan) {
        console.log('❌ Count span not found');
        return false;
      }
      
      console.log(`Reaction count: ${countSpan.textContent}`);
      console.log(`Button innerHTML: ${reactionBtn.innerHTML}`);
      
      // Test 3: Test real-time propagation simulation
      console.log('Testing real-time propagation simulation...');
      const mockPayload = {
        new: {
          message_id: testMessageId,
          emoji: '🚀',
          user_email: 'realtime-test@example.com'
        }
      };
      
      if (window.handleReactionChange) {
        window.handleReactionChange(mockPayload);
        console.log('✅ Real-time handler called successfully');
      } else {
        console.log('⚠️ Real-time handler not available');
      }
      
      console.log('✅ Reaction propagation test completed');
      return true;
      
    } catch (error) {
      console.error('❌ Reaction propagation test failed:', error);
      return false;
    }
  };
  
  window.diagnoseReactionIssues = function() {
    console.log('🔍 DIAGNOSING REACTION ISSUES');
    console.log('=============================');
    
    const issues = [];
    
    // Check function availability
    const requiredFunctions = ['updateReactionDisplay', 'handleReactionChange', 'loadMessageReactions'];
    requiredFunctions.forEach(func => {
      if (typeof window[func] !== 'function') {
        issues.push(`Missing function: ${func}`);
      }
    });
    
    // Check DOM elements
    const messageElements = document.querySelectorAll('[data-message-id]');
    if (messageElements.length === 0) {
      issues.push('No messages found in DOM');
    }
    
    // Check real-time system
    if (!window.supabaseRealtimeClient) {
      issues.push('Supabase real-time client not available');
    }
    
    // Check API
    if (!window.api || !window.api.request) {
      issues.push('API module not available');
    }
    
    if (issues.length === 0) {
      console.log('✅ No issues found');
    } else {
      console.log('❌ Issues found:');
      issues.forEach((issue, index) => {
        console.log(`  ${index + 1}. ${issue}`);
      });
    }
    
    return issues;
  };
  
  console.log('\n💾 Test functions added to window:');
  console.log('   testReactionPropagation() - Test reaction propagation');
  console.log('   diagnoseReactionIssues() - Diagnose common issues');
  
  return diagnostics;
})();

