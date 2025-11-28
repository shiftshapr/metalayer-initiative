/**
 * Inspect Message Data - Check what data messages actually have
 */

(function() {
  'use strict';

  function inspectMessageData() {
    const allElements = document.querySelectorAll('[data-message-id]');
    const messages = Array.from(allElements).filter(el => {
      return el.classList.contains('message') || 
             el.querySelector('.message-content-wrapper') !== null ||
             (el.querySelector('.message-footer-actions') !== null && el.querySelector('.message-content') !== null);
    });
    
    console.log(`\n🔍 Inspecting ${messages.length} message elements...\n`);
    
    const results = [];
    
    messages.forEach((msgEl, index) => {
      const messageId = msgEl.getAttribute('data-message-id');
      const senderName = msgEl.querySelector('.message-sender-name');
      const senderNameText = senderName ? senderName.textContent : '';
      const footerActions = msgEl.querySelector('.message-footer-actions');
      const buttons = footerActions ? footerActions.querySelectorAll('button') : [];
      const iconCounts = msgEl.querySelectorAll('.icon-count');
      
      // Check for community name in sender name
      const hasCommunityName = senderNameText && (senderNameText.includes('•') || senderNameText.includes('|'));
      
      // Check button data attributes
      const reactionBtn = msgEl.querySelector('.reaction-btn');
      const replyBtn = msgEl.querySelector('.inline-reply-btn');
      const bookmarkBtn = msgEl.querySelector('.bookmark-btn');
      
      const result = {
        index: index + 1,
        messageId: messageId?.substring(0, 20),
        senderNameText: senderNameText?.substring(0, 60),
        hasCommunityName,
        buttonCount: buttons.length,
        iconCountCount: iconCounts.length,
        iconCountTexts: Array.from(iconCounts).map(el => el.textContent),
        reactionBtnData: reactionBtn ? {
          hasDataMessageId: reactionBtn.hasAttribute('data-message-id'),
          title: reactionBtn.getAttribute('title')
        } : null,
        replyBtnData: replyBtn ? {
          hasDataMessageId: replyBtn.hasAttribute('data-message-id'),
          title: replyBtn.getAttribute('title')
        } : null,
        bookmarkBtnData: bookmarkBtn ? {
          hasDataMessageId: bookmarkBtn.hasAttribute('data-message-id'),
          title: bookmarkBtn.getAttribute('title')
        } : null,
        footerHTML: footerActions ? footerActions.innerHTML.substring(0, 300) : 'NO FOOTER'
      };
      
      results.push(result);
      
      if (index < 3) {
        console.log(`Message ${index + 1}:`, result);
      }
    });
    
    console.log('\n📊 Summary:');
    console.log(`Total messages: ${messages.length}`);
    console.log(`Messages with community name: ${results.filter(r => r.hasCommunityName).length}`);
    console.log(`Messages with icon-counts: ${results.filter(r => r.iconCountCount > 0).length}`);
    console.log(`Total icon-count elements: ${results.reduce((sum, r) => sum + r.iconCountCount, 0)}`);
    
    // Show all icon-count texts
    const allCountTexts = results.flatMap(r => r.iconCountTexts);
    console.log(`Icon-count values found:`, allCountTexts);
    
    // Check if counts are 0 (which is why they might not show)
    const hasNonZeroCounts = allCountTexts.some(text => text && parseInt(text) > 0);
    console.log(`Has non-zero counts: ${hasNonZeroCounts}`);
    
    return results;
  }

  // Export to window
  if (typeof window !== 'undefined') {
    window.inspectMessageData = inspectMessageData;
    console.log('✅ Message data inspector loaded. Run: inspectMessageData()');
  }

})();





