/**
 * Diagnostic: Button Extraction Issue
 * 
 * Checks if buttons are being extracted from messages and rendered separately
 */

(function() {
  'use strict';

  function diagnoseButtonExtraction() {
    const allElements = document.querySelectorAll('[data-message-id]');
    const results = {
      totalElements: allElements.length,
      fullMessages: [],
      buttonFragments: [],
      orphanedButtons: []
    };
    
    allElements.forEach((el, index) => {
      const messageId = el.getAttribute('data-message-id');
      const className = el.className;
      const htmlLength = el.innerHTML.length;
      const hasMessageClass = className.includes('message') && !className.includes('message-');
      const hasButtonClass = className.includes('-btn') || className.includes('action-');
      const hasFooterActions = !!el.querySelector('.message-footer-actions');
      const hasContentWrapper = !!el.querySelector('.message-content-wrapper');
      const isFullMessage = hasFooterActions && hasContentWrapper;
      
      // Check if this is just a button fragment
      const isButtonFragment = hasButtonClass && !hasMessageClass && htmlLength < 1000;
      
      // Check if this is an orphaned button (button with data-message-id but not inside a message)
      const parentMessage = el.closest('.message');
      const isOrphaned = hasButtonClass && !parentMessage && el.hasAttribute('data-message-id');
      
      const elementInfo = {
        index: index + 1,
        messageId: messageId?.substring(0, 20),
        className,
        htmlLength,
        isFullMessage,
        isButtonFragment,
        isOrphaned,
        hasFooterActions,
        hasContentWrapper,
        parent: parentMessage ? 'inside message' : 'orphaned'
      };
      
      if (isFullMessage) {
        results.fullMessages.push(elementInfo);
      } else if (isButtonFragment || isOrphaned) {
        results.buttonFragments.push(elementInfo);
        if (isOrphaned) {
          results.orphanedButtons.push(elementInfo);
        }
      }
    });
    
    console.log('\n🔍 Button Extraction Diagnostic\n');
    console.log(`Total elements with data-message-id: ${results.totalElements}`);
    console.log(`Full messages: ${results.fullMessages.length}`);
    console.log(`Button fragments: ${results.buttonFragments.length}`);
    console.log(`Orphaned buttons: ${results.orphanedButtons.length}`);
    
    if (results.buttonFragments.length > 0) {
      console.log('\n❌ Button Fragments Found:');
      results.buttonFragments.slice(0, 10).forEach(frag => {
        console.log(`  Element ${frag.index}: ${frag.className}`);
        console.log(`    Message ID: ${frag.messageId}, HTML length: ${frag.htmlLength}`);
        console.log(`    Parent: ${frag.parent}`);
      });
    }
    
    if (results.orphanedButtons.length > 0) {
      console.log('\n❌ Orphaned Buttons (buttons with data-message-id but not in message container):');
      results.orphanedButtons.slice(0, 10).forEach(btn => {
        console.log(`  Button ${btn.index}: ${btn.className}`);
        console.log(`    Message ID: ${btn.messageId}`);
        console.log(`    HTML: ${btn.htmlLength} chars`);
      });
    }
    
    // Check container structure
    const containers = document.querySelectorAll('.chat-messages');
    console.log(`\n📦 Containers: ${containers.length}`);
    containers.forEach((container, idx) => {
      const directChildren = Array.from(container.children);
      const messageChildren = directChildren.filter(child => 
        child.classList.contains('message') || child.hasAttribute('data-message-id')
      );
      const buttonChildren = directChildren.filter(child => 
        child.className.includes('-btn') || child.className.includes('action-')
      );
      console.log(`  Container ${idx + 1}: ${directChildren.length} direct children`);
      console.log(`    Messages: ${messageChildren.length}, Buttons: ${buttonChildren.length}`);
    });
    
    return results;
  }

  // Export to window
  if (typeof window !== 'undefined') {
    window.diagnoseButtonExtraction = diagnoseButtonExtraction;
    console.log('✅ Button extraction diagnostic loaded. Run: diagnoseButtonExtraction()');
  }

})();





