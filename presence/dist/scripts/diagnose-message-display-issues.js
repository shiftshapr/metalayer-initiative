/**
 * Diagnostic: Message Display Issues
 *
 * Checks:
 * 1. Icons/counts visibility
 * 2. Display name and community name display
 * 3. Click-through to focus mode
 * 4. Action modal background
 */
function diagnoseMessageDisplay() {
    const results = [];
    // Check for message elements
    const messages = document.querySelectorAll('[data-message-id]');
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
        if (hasIcons)
            messagesWithIcons++;
        // Check for counts
        const hasCounts = messageDiv.querySelectorAll('.icon-count').length > 0;
        if (hasCounts)
            messagesWithCounts++;
        // Check for community name in sender name
        const senderName = messageDiv.querySelector('.message-sender-name');
        if (senderName) {
            const text = senderName.textContent || '';
            // Check if community name is present (format: "Name • Community")
            if (text.includes('•') || text.includes('|')) {
                messagesWithCommunityName++;
            }
        }
        // Check for click handler (cursor pointer indicates click handler)
        const hasClickHandler = messageDiv.style.cursor === 'pointer' ||
            window.getComputedStyle(messageDiv).cursor === 'pointer' ||
            messageDiv.classList.contains('clickable');
        if (hasClickHandler)
            messagesWithClickHandler++;
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
    results.push({
        category: 'Counts Visibility',
        issue: 'Icon counts (reactions, replies, bookmarks) visible',
        status: messagesWithCounts === messages.length ? 'PASS' : messagesWithCounts > 0 ? 'WARN' : 'FAIL',
        details: `${messagesWithCounts} of ${messages.length} messages have counts`,
        recommendation: messagesWithCounts < messages.length ? 'Ensure icon-count spans are generated and visible' : undefined
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
// Export for use in console
if (typeof window !== 'undefined') {
    window.diagnoseMessageDisplay = diagnoseMessageDisplay;
    console.log('✅ Message display diagnostic loaded. Run: diagnoseMessageDisplay()');
}
export { diagnoseMessageDisplay };
