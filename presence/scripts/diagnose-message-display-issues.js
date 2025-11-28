/**
 * Diagnostic: Message Display Issues
 * 
 * Checks:
 * 1. Icons/counts visibility
 * 2. Display name and community name display
 * 3. Click-through to focus mode
 * 4. Action modal background
 */

(function() {
  'use strict';

  function diagnoseMessageDisplay() {
    const results = [];
    
  // CRITICAL FIX: Only check full message elements, not button fragments
  // Buttons have data-message-id but are not messages themselves
  const allElements = document.querySelectorAll('[data-message-id]');
  const messages = Array.from(allElements).filter(el => {
    // A message element should have .message class or .message-content-wrapper
    return el.classList.contains('message') || 
           el.querySelector('.message-content-wrapper') !== null ||
           (el.querySelector('.message-footer-actions') !== null && el.querySelector('.message-content') !== null);
  });
  
  if (messages.length === 0) {
      results.push({
        category: 'Message Elements',
        issue: 'No messages found in DOM',
        status: 'WARN',
        details: 'No elements with data-message-id attribute found',
        recommendation: 'Ensure messages are being rendered to the DOM'
      });
      return results;
    }

    let messagesWithIcons = 0;
    let messagesWithCounts = 0;
    let messagesWithCommunityName = 0;
    let messagesWithClickHandler = 0;
    let messagesWithActionModal = 0;
    let actionModalsWithSolidBg = 0;

    messages.forEach((msgEl) => {
      const messageDiv = msgEl;
      
      // Check for icons
      const hasIcons = messageDiv.querySelector('.message-footer-actions button, .reaction-btn, .reply-btn, .bookmark-btn, .share-btn');
      if (hasIcons) messagesWithIcons++;
      
      // Check for counts
      const hasCounts = messageDiv.querySelectorAll('.icon-count').length > 0;
      if (hasCounts) messagesWithCounts++;
      
      // Check for community name in sender name
      const senderName = messageDiv.querySelector('.message-sender-name');
      if (senderName) {
        const text = senderName.textContent || '';
        // Check if community name is present (format: "Name • Community" or "[Display | Name] • Community")
        if (text.includes('•') || text.includes('|')) {
          messagesWithCommunityName++;
        }
      }
      
      // Check for click handler (cursor pointer indicates click handler)
      const hasClickHandler = messageDiv.style.cursor === 'pointer' || 
                             window.getComputedStyle(messageDiv).cursor === 'pointer' ||
                             messageDiv.classList.contains('clickable') ||
                             messageDiv.getAttribute('data-clickable') === 'true';
      if (hasClickHandler) messagesWithClickHandler++;
      
      // Check for action modal
      const actionModal = messageDiv.querySelector('.action-dropdown');
      if (actionModal) {
        messagesWithActionModal++;
        const bg = window.getComputedStyle(actionModal).backgroundColor;
        // Check if background is solid (not transparent)
        if (bg && bg !== 'transparent' && bg !== 'rgba(0, 0, 0, 0)' && !bg.includes('rgba(0, 0, 0, 0)')) {
          actionModalsWithSolidBg++;
        }
      }
    });

    // Report results
    results.push({
      category: 'Icons Visibility',
      issue: 'Message action icons present',
      status: messagesWithIcons === messages.length ? 'PASS' : 'FAIL',
      details: `${messagesWithIcons} of ${messages.length} messages have icons`,
      recommendation: messagesWithIcons < messages.length ? 'Ensure UnifiedMessageRenderer generates footer action buttons' : undefined
    });

    // Check if counts exist OR if all counts are 0 (which is valid - counts only show when > 0)
    const messagesWithButtons = Array.from(messages).filter(msg => {
      return msg.querySelector('.message-footer-actions button') !== null;
    }).length;
    const allCountsZero = messagesWithCounts === 0 && messagesWithButtons === messages.length;
    
    results.push({
      category: 'Counts Visibility',
      issue: 'Icon counts (reactions, replies, bookmarks) visible',
      status: messagesWithCounts === messages.length ? 'PASS' : allCountsZero ? 'PASS' : messagesWithCounts > 0 ? 'WARN' : 'FAIL',
      details: `${messagesWithCounts} of ${messages.length} messages have counts${allCountsZero ? ' (all counts are 0, which is valid - counts only display when > 0)' : ''}`,
      recommendation: messagesWithCounts < messages.length && !allCountsZero ? 'Ensure icon-count spans are generated when counts > 0' : undefined
    });

    results.push({
      category: 'Community Name Display',
      issue: 'Community name shown in message header',
      status: messagesWithCommunityName === messages.length ? 'PASS' : messagesWithCommunityName > 0 ? 'WARN' : 'FAIL',
      details: `${messagesWithCommunityName} of ${messages.length} messages show community name`,
      recommendation: messagesWithCommunityName < messages.length ? 'Ensure communityName is passed to UnifiedMessageRenderer and displayed in message-sender-name' : undefined
    });

    results.push({
      category: 'Click-Through to Focus Mode',
      issue: 'Messages have click handlers for focus mode',
      status: messagesWithClickHandler === messages.length ? 'PASS' : messagesWithClickHandler > 0 ? 'WARN' : 'FAIL',
      details: `${messagesWithClickHandler} of ${messages.length} messages have click handlers`,
      recommendation: messagesWithClickHandler < messages.length ? 'Ensure attachFocusHandler is called in UnifiedMessageDisplay.createMessageElement' : undefined
    });

    results.push({
      category: 'Action Modal Background',
      issue: 'Action dropdown has solid background',
      status: actionModalsWithSolidBg === messagesWithActionModal ? 'PASS' : messagesWithActionModal > 0 ? 'WARN' : 'FAIL',
      details: `${actionModalsWithSolidBg} of ${messagesWithActionModal} action modals have solid backgrounds`,
      recommendation: actionModalsWithSolidBg < messagesWithActionModal ? 'Ensure .action-dropdown has background: var(--background-primary) or solid color, not transparent' : undefined
    });

    // Check CSS visibility
    const firstMessage = messages[0];
    if (firstMessage) {
      const footerActions = firstMessage.querySelector('.message-footer-actions');
      if (footerActions) {
        const computed = window.getComputedStyle(footerActions);
        results.push({
          category: 'CSS Visibility',
          issue: 'Message footer actions visible',
          status: computed.display !== 'none' && computed.visibility !== 'hidden' ? 'PASS' : 'FAIL',
          details: `Footer actions display: ${computed.display}, visibility: ${computed.visibility}`,
          recommendation: computed.display === 'none' || computed.visibility === 'hidden' ? 'Fix CSS to show .message-footer-actions' : undefined
        });
      }
    }

    return results;
  }

  // Export to window for console access
  if (typeof window !== 'undefined') {
    window.diagnoseMessageDisplay = diagnoseMessageDisplay;
    console.log('✅ Message display diagnostic loaded. Run: diagnoseMessageDisplay()');
  }

})();

