/**
 * Diagnostic: Duplicate Messages and Missing Footer Actions
 * 
 * Checks:
 * 1. Duplicate message IDs in DOM
 * 2. Messages missing footer-actions
 * 3. Message rendering paths
 */

(function() {
  'use strict';

  function diagnoseDuplicateMessages() {
    // CRITICAL FIX: Only check full message elements, not button fragments
    const allElements = document.querySelectorAll('[data-message-id]');
    const messages = Array.from(allElements).filter(el => {
      return el.classList.contains('message') || 
             el.querySelector('.message-content-wrapper') !== null ||
             (el.querySelector('.message-footer-actions') !== null && el.querySelector('.message-content') !== null);
    });
    
    const messageIds = new Map();
    const duplicates = [];
    const missingFooter = [];
    const hasFooter = [];
    
    messages.forEach((msgEl, index) => {
      const messageId = msgEl.getAttribute('data-message-id');
      const footerActions = msgEl.querySelector('.message-footer-actions');
      const hasFooterActions = !!footerActions;
      
      if (messageIds.has(messageId)) {
        duplicates.push({
          index: index + 1,
          messageId: messageId?.substring(0, 20),
          previousIndex: messageIds.get(messageId),
          hasFooterActions
        });
      } else {
        messageIds.set(messageId, index + 1);
      }
      
      if (!hasFooterActions) {
        missingFooter.push({
          index: index + 1,
          messageId: messageId?.substring(0, 20),
          htmlLength: msgEl.innerHTML.length,
          hasMessageFooter: !!msgEl.querySelector('.message-footer'),
          hasMessageContent: !!msgEl.querySelector('.message-content'),
          className: msgEl.className
        });
      } else {
        hasFooter.push({
          index: index + 1,
          messageId: messageId?.substring(0, 20)
        });
      }
    });
    
    console.log('\n🔍 Duplicate Messages Diagnostic\n');
    console.log(`Total messages in DOM: ${messages.length}`);
    console.log(`Unique message IDs: ${messageIds.size}`);
    console.log(`Duplicate messages: ${duplicates.length}`);
    console.log(`Messages with footer-actions: ${hasFooter.length}`);
    console.log(`Messages missing footer-actions: ${missingFooter.length}`);
    
    if (duplicates.length > 0) {
      console.log('\n❌ Duplicate Messages Found:');
      duplicates.slice(0, 10).forEach(dup => {
        console.log(`  Message ${dup.index}: ${dup.messageId} (also at index ${dup.previousIndex})`);
      });
    }
    
    if (missingFooter.length > 0) {
      console.log('\n❌ Messages Missing Footer-Actions:');
      missingFooter.slice(0, 10).forEach(msg => {
        console.log(`  Message ${msg.index}: ${msg.messageId}`);
        console.log(`    HTML length: ${msg.htmlLength}, Has .message-footer: ${msg.hasMessageFooter}, Class: ${msg.className}`);
      });
      
      // Show first missing footer message's HTML structure
      if (missingFooter.length > 0) {
        const firstMissing = messages[missingFooter[0].index - 1];
        console.log('\n🔍 First message missing footer-actions:');
        console.log('Full HTML:', firstMissing.innerHTML.substring(0, 500));
        console.log('Has .message-footer:', !!firstMissing.querySelector('.message-footer'));
        console.log('Has .message-content-wrapper:', !!firstMissing.querySelector('.message-content-wrapper'));
      }
    }
    
    // Check if messages are being added through different paths
    const containers = document.querySelectorAll('.chat-messages');
    console.log(`\n📦 Containers found: ${containers.length}`);
    containers.forEach((container, idx) => {
      const containerMessages = container.querySelectorAll('[data-message-id]');
      console.log(`  Container ${idx + 1}: ${containerMessages.length} messages, className: ${container.className}`);
    });
    
    return {
      total: messages.length,
      unique: messageIds.size,
      duplicates: duplicates.length,
      withFooter: hasFooter.length,
      missingFooter: missingFooter.length,
      duplicateDetails: duplicates,
      missingFooterDetails: missingFooter
    };
  }

  // Export to window
  if (typeof window !== 'undefined') {
    window.diagnoseDuplicateMessages = diagnoseDuplicateMessages;
    console.log('✅ Duplicate messages diagnostic loaded. Run: diagnoseDuplicateMessages()');
  }

})();

