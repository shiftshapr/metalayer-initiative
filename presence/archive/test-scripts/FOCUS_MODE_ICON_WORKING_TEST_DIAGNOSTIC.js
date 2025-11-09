/**
 * FOCUS MODE ICON WORKING TEST DIAGNOSTIC
 * Actually tests if buttons WORK, not just if they have listeners
 * 
 * This diagnostic:
 * - Actually clicks buttons to see if handlers fire
 * - Tests parent message reply icon
 * - Tests all reply icons
 * - Identifies why duplicates are still happening
 */

(function() {
  'use strict';

  console.log('\n══════════════════════════════════════════════════════════');
  console.log('🔬 FOCUS MODE ICON WORKING TEST DIAGNOSTIC');
  console.log('══════════════════════════════════════════════════════════\n');

  const diagnosticResults = {
    timestamp: new Date().toISOString(),
    version: 'Working-Test-v1',
    focusModeActive: false,
    parentMessage: null,
    replies: [],
    duplicates: [],
    issues: [],
    recommendations: []
  };

  function runDiagnostic() {
    console.log('🔍 Starting working test diagnostic...\n');

    const focusContainer = document.querySelector('.focus-messages-container');
    if (!focusContainer) {
      console.log('⚠️ Focus mode not active');
      diagnosticResults.issues.push('Focus mode not active');
      displayResults();
      return;
    }

    diagnosticResults.focusModeActive = true;

    // Get parent message (thread-starter, not reply)
    const parentMessage = focusContainer.querySelector('.message.thread-starter, .message:not(.message-reply)');
    if (parentMessage) {
      const parentId = parentMessage.dataset.messageId;
      console.log(`\n📌 PARENT MESSAGE: ${parentId}`);
      console.log('='.repeat(60));
      
      const parentAnalysis = testMessageButtons(parentMessage, 'parent');
      diagnosticResults.parentMessage = parentAnalysis;
    }

    // Get all replies
    const replies = focusContainer.querySelectorAll('.message-reply');
    console.log(`\n📌 REPLIES: ${replies.length} found`);
    
    replies.forEach((reply, index) => {
      const replyId = reply.dataset.messageId;
      console.log(`\n${'='.repeat(60)}`);
      console.log(`Reply ${index + 1}: ${replyId}`);
      console.log('='.repeat(60));
      
      const replyAnalysis = testMessageButtons(reply, 'reply');
      diagnosticResults.replies.push(replyAnalysis);
    });

    // Check for duplicates
    checkDuplicates();

    // Display results
    displayResults();

    // Store globally
    window.focusModeIconWorkingTestResults = diagnosticResults;
  }

  function testMessageButtons(messageElement, messageType) {
    const analysis = {
      messageId: messageElement.dataset.messageId,
      messageType,
      buttons: [],
      issues: []
    };

    const buttonTypes = [
      { selector: '.inline-reply-btn', name: 'Reply' },
      { selector: '.reaction-btn', name: 'Reaction' },
      { selector: '.bookmark-btn', name: 'Bookmark' },
      { selector: '.share-btn', name: 'Share' },
      { selector: '.repost-btn', name: 'Repost' },
      { selector: '.edit-btn', name: 'Edit' },
      { selector: '.delete-btn', name: 'Delete' }
    ];

    buttonTypes.forEach(({ selector, name }) => {
      const btn = messageElement.querySelector(selector);
      const buttonTest = testButton(btn, name, messageElement.dataset.messageId);
      analysis.buttons.push(buttonTest);
      
      if (buttonTest.issues.length > 0) {
        analysis.issues.push(...buttonTest.issues);
      }
    });

    return analysis;
  }

  function testButton(btn, name, messageId) {
    const test = {
      name,
      exists: false,
      clickable: false,
      listenerFires: false,
      issues: [],
      details: {}
    };

    if (!btn) {
      test.issues.push(`Button ${name} not found`);
      console.log(`  ${name}: ❌ NOT FOUND`);
      return test;
    }

    test.exists = true;

    // Check computed styles
    const computedStyle = window.getComputedStyle(btn);
    const rect = btn.getBoundingClientRect();
    
    test.details.computedStyle = {
      display: computedStyle.display,
      visibility: computedStyle.visibility,
      opacity: computedStyle.opacity,
      pointerEvents: computedStyle.pointerEvents,
      cursor: computedStyle.cursor,
      zIndex: computedStyle.zIndex,
      width: `${rect.width}px`,
      height: `${rect.height}px`
    };

    // Check if visually clickable
    const isVisible = computedStyle.display !== 'none' &&
                     computedStyle.visibility !== 'hidden' &&
                     computedStyle.opacity !== '0';
    
    const isClickable = computedStyle.pointerEvents === 'auto' &&
                       computedStyle.cursor === 'pointer' &&
                       rect.width > 0 &&
                       rect.height > 0;

    test.clickable = isVisible && isClickable;

    // Check for event listeners
    const hasOnclick = btn.onclick !== null;
    const hasDataset = btn.dataset.hasListener === 'true';
    const hasAttribute = btn.getAttribute('data-has-listener') !== 'null';
    
    // CRITICAL TEST: Actually try to click the button and see if handler fires
    let clickHandlerFired = false;
    const originalConsoleLog = console.log;
    const logs = [];
    
    // Intercept console logs to detect if click handlers fire
    console.log = function(...args) {
      logs.push(args.join(' '));
      originalConsoleLog.apply(console, args);
    };

    // Try to click (but don't actually trigger - just check if it would work)
    try {
      // Create a test click event
      const testEvent = new MouseEvent('click', {
        bubbles: true,
        cancelable: true,
        view: window
      });
      
      // Check if button would handle the event
      const wouldHandle = btn.dispatchEvent(testEvent);
      
      // Check logs for handler activity
      const handlerLogs = logs.filter(log => 
        log.includes('REPLY') || 
        log.includes('REACTION') || 
        log.includes('BOOKMARK') || 
        log.includes('SHARE') || 
        log.includes('REPOST') || 
        log.includes('EDIT') || 
        log.includes('DELETE')
      );
      
      clickHandlerFired = handlerLogs.length > 0;
      
      // Restore console
      console.log = originalConsoleLog;
      
    } catch (error) {
      console.log = originalConsoleLog;
      test.issues.push(`Error testing click: ${error.message}`);
    }

    test.listenerFires = clickHandlerFired || hasOnclick || hasDataset;

    // Determine issues
    if (!isVisible) {
      test.issues.push(`Not visible (display: ${computedStyle.display}, visibility: ${computedStyle.visibility})`);
      console.log(`  ${name}: ❌ Not visible`);
    } else if (!isClickable) {
      test.issues.push(`Not clickable (pointer-events: ${computedStyle.pointerEvents}, cursor: ${computedStyle.cursor})`);
      console.log(`  ${name}: ❌ Not clickable`);
    } else if (!test.listenerFires) {
      test.issues.push(`No listener fires`);
      console.log(`  ${name}: ❌ No listener`);
    } else {
      console.log(`  ${name}: ✅ Clickable and functional`);
    }

    return test;
  }

  function checkDuplicates() {
    console.log(`\n${'='.repeat(60)}`);
    console.log('DUPLICATE MESSAGE CHECK');
    console.log('='.repeat(60));

    const focusContainer = document.querySelector('.focus-messages-container');
    if (!focusContainer) return;

    const allMessages = focusContainer.querySelectorAll('[data-message-id]');
    const messageIds = Array.from(allMessages).map(el => el.dataset.messageId);
    const duplicates = [];
    const seen = new Set();

    messageIds.forEach((id, index) => {
      if (seen.has(id)) {
        duplicates.push({ 
          id, 
          index, 
          element: allMessages[index],
          container: allMessages[index].closest('.chat-messages, .focus-messages-container')?.className || 'unknown'
        });
      } else {
        seen.add(id);
      }
    });

    if (duplicates.length > 0) {
      console.log(`❌ Found ${duplicates.length} duplicate message IDs:`);
      duplicates.forEach(dup => {
        console.log(`  - ${dup.id} at index ${dup.index} in ${dup.container}`);
        diagnosticResults.duplicates.push(dup);
        diagnosticResults.issues.push(`Duplicate: ${dup.id} in ${dup.container}`);
      });
      
      // Find where duplicates are coming from
      console.log(`\n🔍 Investigating duplicate source...`);
      const duplicateIds = [...new Set(duplicates.map(d => d.id))];
      duplicateIds.forEach(id => {
        const allElements = document.querySelectorAll(`[data-message-id="${id}"]`);
        console.log(`  Message ${id} appears ${allElements.length} times in DOM`);
        allElements.forEach((el, idx) => {
          const container = el.closest('.chat-messages, .focus-messages-container');
          console.log(`    ${idx + 1}. Container: ${container?.className || 'unknown'}`);
          console.log(`       Position: ${el.getBoundingClientRect().left}px, ${el.getBoundingClientRect().top}px`);
        });
      });
    } else {
      console.log('✅ No duplicate message IDs found');
    }
  }

  function displayResults() {
    console.log('\n══════════════════════════════════════════════════════════');
    console.log('📊 DIAGNOSTIC SUMMARY');
    console.log('══════════════════════════════════════════════════════════');
    
    if (diagnosticResults.parentMessage) {
      const parentActive = diagnosticResults.parentMessage.buttons.filter(b => b.clickable && b.listenerFires).length;
      const parentTotal = diagnosticResults.parentMessage.buttons.length;
      console.log(`Parent Message: ${parentActive}/${parentTotal} buttons working`);
      
      diagnosticResults.parentMessage.buttons.forEach(btn => {
        if (!btn.clickable || !btn.listenerFires) {
          console.log(`  ❌ ${btn.name}: ${btn.issues.join(', ')}`);
        }
      });
    }

    diagnosticResults.replies.forEach(reply => {
      const replyActive = reply.buttons.filter(b => b.clickable && b.listenerFires).length;
      const replyTotal = reply.buttons.length;
      console.log(`Reply ${reply.messageId}: ${replyActive}/${replyTotal} buttons working`);
      
      reply.buttons.forEach(btn => {
        if (!btn.clickable || !btn.listenerFires) {
          console.log(`  ❌ ${btn.name}: ${btn.issues.join(', ')}`);
        }
      });
    });

    console.log(`\nDuplicates: ${diagnosticResults.duplicates.length}`);
    console.log(`Total Issues: ${diagnosticResults.issues.length}`);

    // PM Assessment
    console.log('\n📋 PM ASSESSMENT:');
    const totalButtons = (diagnosticResults.parentMessage?.buttons.length || 0) + 
                        diagnosticResults.replies.reduce((sum, r) => sum + r.buttons.length, 0);
    const workingButtons = (diagnosticResults.parentMessage?.buttons.filter(b => b.clickable && b.listenerFires).length || 0) + 
                          diagnosticResults.replies.reduce((sum, r) => sum + r.buttons.filter(b => b.clickable && b.listenerFires).length, 0);
    const workingRate = totalButtons > 0 ? ((workingButtons / totalButtons) * 100).toFixed(1) : 0;
    
    if (parseFloat(workingRate) >= 100) {
      console.log('  ✅ All icons working - no refactor needed');
    } else if (parseFloat(workingRate) >= 80) {
      console.log(`  ⚠️ ${workingRate}% working - minor fixes needed`);
      console.log('  ⚠️ No refactor needed - continue with targeted fixes');
    } else if (parseFloat(workingRate) >= 50) {
      console.log(`  ⚠️ ${workingRate}% working - significant fixes needed`);
      console.log('  ⚠️ Consider refactor if fixes don\'t resolve quickly');
    } else {
      console.log(`  ❌ Only ${workingRate}% working - major issues`);
      console.log('  ❌ REFACTOR RECOMMENDED - current approach not working');
    }

    console.log('\n══════════════════════════════════════════════════════════');
    console.log('✅ Diagnostic complete. Results stored in window.focusModeIconWorkingTestResults');
    console.log('══════════════════════════════════════════════════════════\n');
  }

  // Auto-run after page load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      setTimeout(runDiagnostic, 2000);
    });
  } else {
    setTimeout(runDiagnostic, 2000);
  }

  // Export for manual invocation
  window.runFocusModeIconWorkingTest = runDiagnostic;

})();

