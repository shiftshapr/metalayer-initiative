/**
 * Inspect Message HTML - Debug script to see what HTML is actually generated
 */

(function() {
  'use strict';

  function inspectMessageHTML() {
    const messages = document.querySelectorAll('[data-message-id]');
    console.log(`\n🔍 Inspecting ${messages.length} messages...\n`);
    
    const results = [];
    
    messages.forEach((msgEl, index) => {
      const messageId = msgEl.getAttribute('data-message-id');
      const footerActions = msgEl.querySelector('.message-footer-actions');
      const buttons = footerActions ? footerActions.querySelectorAll('button') : [];
      const iconCounts = msgEl.querySelectorAll('.icon-count');
      const senderName = msgEl.querySelector('.message-sender-name');
      const senderNameText = senderName ? senderName.textContent : '';
      
      const hasCommunityName = senderNameText && (senderNameText.includes('•') || senderNameText.includes('|'));
      
      const result = {
        index: index + 1,
        messageId: messageId?.substring(0, 8) + '...',
        hasFooterActions: !!footerActions,
        buttonCount: buttons.length,
        buttonClasses: Array.from(buttons).map(btn => btn.className),
        iconCountCount: iconCounts.length,
        hasCommunityName,
        senderNameText: senderNameText?.substring(0, 50),
        footerHTML: footerActions ? footerActions.innerHTML.substring(0, 200) : 'NO FOOTER'
      };
      
      results.push(result);
      
      if (index < 5) {
        console.log(`Message ${index + 1}:`, result);
      }
    });
    
    console.log('\n📊 Summary:');
    console.log(`Total messages: ${messages.length}`);
    console.log(`Messages with footer-actions: ${results.filter(r => r.hasFooterActions).length}`);
    console.log(`Messages with buttons: ${results.filter(r => r.buttonCount > 0).length}`);
    console.log(`Messages with icon-counts: ${results.filter(r => r.iconCountCount > 0).length}`);
    console.log(`Messages with community name: ${results.filter(r => r.hasCommunityName).length}`);
    
    // Show first message's full HTML structure
    if (messages.length > 0) {
      const firstMsg = messages[0];
      console.log('\n🔍 First message HTML structure:');
      console.log('Full HTML length:', firstMsg.innerHTML.length);
      console.log('Footer actions HTML:', firstMsg.querySelector('.message-footer-actions')?.innerHTML || 'NOT FOUND');
      console.log('Sender name HTML:', firstMsg.querySelector('.message-sender-name')?.outerHTML || 'NOT FOUND');
    }
    
    return results;
  }

  // Export to window
  if (typeof window !== 'undefined') {
    window.inspectMessageHTML = inspectMessageHTML;
    console.log('✅ Message HTML inspector loaded. Run: inspectMessageHTML()');
  }

})();





