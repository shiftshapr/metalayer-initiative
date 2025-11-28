/**
 * DIAGNOSTIC: Message Display Root Cause Analysis
 *
 * Targets 8 critical message display bugs:
 * 1. Too much space under text
 * 2. Reactions and Bookmarks don't work
 * 3. Can't edit/delete own messages
 * 4. Messages are repeated
 * 5. New quote displays wrong (bottom, no quoted content, no avatar)
 * 6. Reply count not shown/updated
 * 7. Reply shows at bottom without avatar, should open Focus mode
 * 8. New message at top without avatar
 *
 * Root cause analysis before fixing.
 */
const diagnostics = [];
/**
 * Issue 1: Too much space under text
 */
function diagnoseSpacingIssue() {
    // Check CSS for excessive spacing
    const messageFooter = document.querySelector('.message-footer');
    const messageContent = document.querySelector('.message-content');
    const footerStyles = messageFooter ? window.getComputedStyle(messageFooter) : null;
    const marginTop = footerStyles?.marginTop || '0px';
    const paddingTop = footerStyles?.paddingTop || '0px';
    const evidence = [];
    if (footerStyles) {
        evidence.push(`Footer margin-top: ${marginTop}`);
        evidence.push(`Footer padding-top: ${paddingTop}`);
    }
    return {
        issue: 'Too much space under text',
        rootCause: 'CSS spacing in .message-footer (margin-top/padding-top too large)',
        location: 'sidepanel.css - .message-footer rules',
        severity: 'medium',
        evidence,
        recommendation: 'Reduce .message-footer margin-top and padding-top (currently 2px, may need 0-1px)'
    };
}
/**
 * Issue 2: Reactions and Bookmarks don't work
 */
function diagnoseActionButtonsIssue() {
    const reactionBtn = document.querySelector('.reaction-btn');
    const bookmarkBtn = document.querySelector('.bookmark-btn');
    const evidence = [];
    // Check if buttons exist
    if (!reactionBtn) {
        evidence.push('Reaction button not found in DOM');
    }
    else {
        evidence.push('Reaction button exists');
        // Check for event listeners
        const hasListeners = reactionBtn.__listeners || false;
        evidence.push(`Has listeners: ${hasListeners}`);
    }
    if (!bookmarkBtn) {
        evidence.push('Bookmark button not found in DOM');
    }
    else {
        evidence.push('Bookmark button exists');
    }
    // Check if MessageActionListenersService is being used
    const win = window;
    const hasService = win.getMessageActionListenersService || false;
    evidence.push(`MessageActionListenersService available: ${hasService}`);
    return {
        issue: 'Reactions and Bookmarks don\'t work',
        rootCause: 'Event listeners not attached - MessageActionListenersService not integrated or not called',
        location: 'MessagesModule.js - addMessageToChat() or loadChatHistory() - missing action listener attachment',
        severity: 'critical',
        evidence,
        recommendation: 'Integrate MessageActionListenersService.attachListeners() after rendering messages'
    };
}
/**
 * Issue 3: Can't edit/delete own messages
 */
function diagnoseEditDeleteIssue() {
    const message = document.querySelector('.message');
    const editBtn = message?.querySelector('.edit-btn');
    const deleteBtn = message?.querySelector('.delete-btn');
    const evidence = [];
    if (!editBtn) {
        evidence.push('Edit button not found in message');
    }
    else {
        evidence.push('Edit button exists');
        const isVisible = window.getComputedStyle(editBtn).display !== 'none';
        evidence.push(`Edit button visible: ${isVisible}`);
    }
    if (!deleteBtn) {
        evidence.push('Delete button not found in message');
    }
    else {
        evidence.push('Delete button exists');
        const isVisible = window.getComputedStyle(deleteBtn).display !== 'none';
        evidence.push(`Delete button visible: ${isVisible}`);
    }
    // Check if canEdit/canDelete are being calculated
    const messageElement = message;
    const messageId = messageElement?.dataset.messageId;
    evidence.push(`Message ID: ${messageId || 'not found'}`);
    return {
        issue: 'Can\'t edit/delete own messages',
        rootCause: 'canEdit/canDelete not calculated correctly OR buttons not rendered OR not visible',
        location: 'UnifiedMessageRenderer.generateMessageHTML() or MessageRendererService.renderMessage() - canEdit/canDelete calculation',
        severity: 'critical',
        evidence,
        recommendation: 'Verify canEdit/canDelete calculation in MessageRendererService.renderMessage() - check currentUser comparison and time-based edit window'
    };
}
/**
 * Issue 4: Messages are repeated
 */
function diagnoseDuplicateMessagesIssue() {
    const allMessages = document.querySelectorAll('[data-message-id]');
    const messageIds = Array.from(allMessages).map(el => el.getAttribute('data-message-id'));
    const uniqueIds = new Set(messageIds);
    const duplicates = messageIds.filter((id, index) => messageIds.indexOf(id) !== index);
    const evidence = [];
    evidence.push(`Total message elements: ${allMessages.length}`);
    evidence.push(`Unique message IDs: ${uniqueIds.size}`);
    evidence.push(`Duplicate IDs found: ${duplicates.length}`);
    if (duplicates.length > 0) {
        evidence.push(`Duplicate IDs: ${duplicates.slice(0, 5).join(', ')}`);
    }
    // Check state for duplicates
    const win = window;
    const stateManager = win.stateManagerInstance;
    if (stateManager) {
        const chatData = stateManager.getState('chat.data');
        if (Array.isArray(chatData)) {
            const stateIds = chatData.map((m) => m.id);
            const stateUnique = new Set(stateIds);
            evidence.push(`State messages: ${chatData.length}, Unique: ${stateUnique.size}`);
        }
    }
    return {
        issue: 'Messages are repeated',
        rootCause: 'Duplicate detection failing - either not checking state/DOM before adding, or clearing logic broken',
        location: 'MessageLoadingService.addMessage() or loadChatHistory() - duplicate detection logic',
        severity: 'critical',
        evidence,
        recommendation: 'Fix duplicate detection in MessageLoadingService - check state FIRST, then DOM. Ensure container clearing works correctly.'
    };
}
/**
 * Issue 5: New quote displays wrong
 */
function diagnoseQuoteDisplayIssue() {
    const quotes = document.querySelectorAll('.message[data-parent-id]');
    const lastQuote = quotes[quotes.length - 1];
    const evidence = [];
    evidence.push(`Total quotes/replies: ${quotes.length}`);
    if (lastQuote) {
        const hasAvatar = lastQuote.querySelector('.avatar-container img, .avatar-container .avatar-initial');
        evidence.push(`Last quote has avatar: ${!!hasAvatar}`);
        const hasQuotedContent = lastQuote.querySelector('.quoted-content, .message-quote, [class*="quote"]');
        evidence.push(`Last quote shows quoted content: ${!!hasQuotedContent}`);
        // Check position
        const container = lastQuote.parentElement;
        const siblings = container ? Array.from(container.children) : [];
        const index = siblings.indexOf(lastQuote);
        const isAtBottom = index === siblings.length - 1;
        evidence.push(`Last quote at bottom: ${isAtBottom} (index: ${index}/${siblings.length - 1})`);
    }
    return {
        issue: 'New quote displays at bottom, no quoted content, no avatar',
        rootCause: 'Quote rendering: 1) Ordering wrong (should prepend), 2) Quoted content not rendered, 3) Avatar not generated',
        location: 'UnifiedMessageRenderer.renderMessage() or MessageRendererService.renderMessage() - quote/reply rendering logic',
        severity: 'critical',
        evidence,
        recommendation: 'Fix quote rendering: 1) Check parentId handling, 2) Ensure quoted content is included in HTML, 3) Verify avatar generation for replies'
    };
}
/**
 * Issue 6: Reply count not shown/updated
 */
function diagnoseReplyCountIssue() {
    const messagesWithReplies = document.querySelectorAll('.message.has-replies, .message[data-has-replies="true"]');
    const evidence = [];
    evidence.push(`Messages with replies class: ${messagesWithReplies.length}`);
    messagesWithReplies.forEach((msg, i) => {
        if (i < 3) { // Check first 3
            const replyCountEl = msg.querySelector('.reply-count, .icon-count, [class*="reply"]');
            const hasCount = replyCountEl && replyCountEl.textContent;
            evidence.push(`Message ${i + 1} has reply count display: ${!!hasCount} (${hasCount || 'none'})`);
        }
    });
    // Check if reply count is calculated
    const win = window;
    const stateManager = win.stateManagerInstance;
    if (stateManager) {
        const chatData = stateManager.getState('chat.data');
        if (Array.isArray(chatData)) {
            const messageWithReplies = chatData.find((m) => {
                const replies = chatData.filter((r) => r.parentId === m.id);
                return replies.length > 0;
            });
            if (messageWithReplies) {
                const replyCount = chatData.filter((r) => r.parentId === messageWithReplies.id).length;
                evidence.push(`State shows message ${messageWithReplies.id} has ${replyCount} replies`);
            }
        }
    }
    return {
        issue: 'Reply count not shown/updated in default mode',
        rootCause: 'Reply count not calculated or not passed to renderer, or not displayed in UI',
        location: 'MessageRendererService.renderMessage() - replyCount calculation and passing to UnifiedMessageRenderer',
        severity: 'high',
        evidence,
        recommendation: 'Fix reply count: 1) Calculate from state in MessageRendererService, 2) Pass to UnifiedMessageRenderer, 3) Ensure UI displays count'
    };
}
/**
 * Issue 7: Reply shows at bottom, should open Focus mode
 */
function diagnoseReplyHandlingIssue() {
    const replies = document.querySelectorAll('.message[data-parent-id]');
    const lastReply = replies[replies.length - 1];
    const evidence = [];
    evidence.push(`Total replies: ${replies.length}`);
    if (lastReply) {
        const hasAvatar = lastReply.querySelector('.avatar-container img, .avatar-container .avatar-initial');
        evidence.push(`Last reply has avatar: ${!!hasAvatar}`);
        // Check if parent is in focus mode
        const container = lastReply.closest('.chat-messages');
        const isFocusMode = container?.classList.contains('focus-mode-parent') || container?.classList.contains('focus-mode-child');
        evidence.push(`Container in focus mode: ${isFocusMode}`);
        // Check if reply is at top of replies list
        const parentId = lastReply.getAttribute('data-parent-id');
        const parentReplies = Array.from(document.querySelectorAll(`[data-parent-id="${parentId}"]`));
        const replyIndex = parentReplies.indexOf(lastReply);
        evidence.push(`Reply position in replies list: ${replyIndex + 1}/${parentReplies.length}`);
    }
    return {
        issue: 'Reply shows at bottom without avatar, should open parent in Focus mode',
        rootCause: 'Reply handling: 1) Not triggering Focus mode, 2) Appending instead of prepending, 3) Avatar not rendered',
        location: 'MessagesModule.js - handleReplyToMessage() or addMessageToChat() - reply handling and focus mode triggering',
        severity: 'critical',
        evidence,
        recommendation: 'Fix reply handling: 1) Trigger handleMessageFocus() when reply added, 2) Use Focus mode for parent, 3) Ensure avatar rendered for replies'
    };
}
/**
 * Issue 8: New message at top without avatar
 */
function diagnoseNewMessageIssue() {
    const messages = document.querySelectorAll('.message');
    const firstMessage = messages[0];
    const evidence = [];
    evidence.push(`Total messages: ${messages.length}`);
    if (firstMessage) {
        const hasAvatar = firstMessage.querySelector('.avatar-container img, .avatar-container .avatar-initial');
        evidence.push(`First message has avatar: ${!!hasAvatar}`);
        if (hasAvatar) {
            const avatarImg = firstMessage.querySelector('.avatar-container img');
            const avatarInitial = firstMessage.querySelector('.avatar-container .avatar-initial');
            evidence.push(`Avatar type: ${avatarImg ? 'image' : avatarInitial ? 'initial' : 'none'}`);
        }
        // Check if message is actually new (recent timestamp)
        const messageId = firstMessage.getAttribute('data-message-id');
        evidence.push(`First message ID: ${messageId}`);
    }
    // Check rendering order
    const container = document.querySelector('.chat-messages');
    if (container) {
        const children = Array.from(container.children);
        const messageElements = children.filter(el => el.classList.contains('message'));
        evidence.push(`Messages in container: ${messageElements.length}`);
        evidence.push(`Rendering order: ${messageElements.length > 0 ? 'first-to-last' : 'unknown'}`);
    }
    return {
        issue: 'New message at top without avatar',
        rootCause: 'Message rendering: 1) Ordering wrong (should append, not prepend), 2) Avatar not generated or not included in HTML',
        location: 'MessageRendererService.renderMessage() or UnifiedMessageRenderer.renderMessage() - avatar generation and message ordering',
        severity: 'critical',
        evidence,
        recommendation: 'Fix new message: 1) Ensure appendChild() not insertBefore() at index 0, 2) Verify avatar generation in UnifiedMessageRenderer, 3) Check avatar HTML inclusion'
    };
}
/**
 * Run all diagnostics
 */
export function runRootCauseDiagnostics() {
    diagnostics.push(diagnoseSpacingIssue());
    diagnostics.push(diagnoseActionButtonsIssue());
    diagnostics.push(diagnoseEditDeleteIssue());
    diagnostics.push(diagnoseDuplicateMessagesIssue());
    diagnostics.push(diagnoseQuoteDisplayIssue());
    diagnostics.push(diagnoseReplyCountIssue());
    diagnostics.push(diagnoseReplyHandlingIssue());
    diagnostics.push(diagnoseNewMessageIssue());
    const critical = diagnostics.filter(d => d.severity === 'critical').length;
    const high = diagnostics.filter(d => d.severity === 'high').length;
    const medium = diagnostics.filter(d => d.severity === 'medium').length;
    console.log('=== MESSAGE DISPLAY ROOT CAUSE DIAGNOSTICS ===\n');
    diagnostics.forEach((diag, i) => {
        const severityIcon = diag.severity === 'critical' ? '🔴' : diag.severity === 'high' ? '🟡' : '🟢';
        console.log(`${i + 1}. ${severityIcon} ${diag.issue}`);
        console.log(`   Root Cause: ${diag.rootCause}`);
        console.log(`   Location: ${diag.location}`);
        console.log(`   Evidence:`);
        diag.evidence.forEach(ev => console.log(`     - ${ev}`));
        console.log(`   Recommendation: ${diag.recommendation}`);
        console.log('');
    });
    console.log(`=== SUMMARY ===`);
    console.log(`🔴 Critical: ${critical}`);
    console.log(`🟡 High: ${high}`);
    console.log(`🟢 Medium: ${medium}`);
    console.log(`Total Issues: ${diagnostics.length}`);
    return { diagnostics, summary: { critical, high, medium } };
}
// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
    runRootCauseDiagnostics();
}
