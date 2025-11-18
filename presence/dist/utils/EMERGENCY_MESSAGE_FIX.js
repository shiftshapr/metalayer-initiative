/**
 * EMERGENCY MESSAGE FIX
 *
 * Run this immediately to force messages to show
 * Call: window.emergencyMessageFix()
 */
/**
 * Emergency fix function to force messages to show
 */
export function emergencyMessageFix() {
    console.log('🚨 EMERGENCY_MESSAGE_FIX: Starting emergency fix...');
    const chatMessages = document.querySelector('.chat-messages');
    if (!chatMessages) {
        console.error('❌ EMERGENCY_MESSAGE_FIX: .chat-messages container not found');
        return false;
    }
    // 1. Remove ALL overlays
    const allOverlays = chatMessages.querySelectorAll('.chat-loading-overlay, .chat-loading-indicator, .loading-spinner, [class*="loading"]');
    console.log(`🔧 EMERGENCY_MESSAGE_FIX: Removing ${allOverlays.length} overlays...`);
    allOverlays.forEach(overlay => {
        overlay.style.setProperty('display', 'none', 'important');
        overlay.style.setProperty('visibility', 'hidden', 'important');
        overlay.style.setProperty('opacity', '0', 'important');
        overlay.remove();
    });
    // 2. Remove loading classes
    chatMessages.classList.remove('is-loading');
    chatMessages.removeAttribute('aria-busy');
    // 3. Force container visible
    const chatMessagesElement = chatMessages;
    chatMessagesElement.style.setProperty('visibility', 'visible', 'important');
    chatMessagesElement.style.setProperty('opacity', '1', 'important');
    chatMessagesElement.style.setProperty('display', 'block', 'important');
    // 4. Force ALL messages visible
    const allMessages = chatMessages.querySelectorAll('.message, [data-message-id]');
    console.log(`🔧 EMERGENCY_MESSAGE_FIX: Making ${allMessages.length} messages visible...`);
    allMessages.forEach((msg, index) => {
        const messageElement = msg;
        messageElement.style.setProperty('display', 'flex', 'important');
        messageElement.style.setProperty('visibility', 'visible', 'important');
        messageElement.style.setProperty('opacity', '1', 'important');
        console.log(`✅ EMERGENCY_MESSAGE_FIX: Made message ${index + 1} visible:`, msg.getAttribute('data-message-id') || 'unknown');
    });
    // 5. Check if messages exist
    if (allMessages.length === 0) {
        console.warn('⚠️ EMERGENCY_MESSAGE_FIX: No messages found in DOM. Messages may not have loaded from API.');
        console.log('🔍 EMERGENCY_MESSAGE_FIX: Container HTML:', chatMessages.innerHTML.substring(0, 500));
        // Try to reload
        if (typeof window.loadChatHistory === 'function') {
            console.log('🔄 EMERGENCY_MESSAGE_FIX: Attempting to reload messages...');
            window.loadChatHistory().catch(err => {
                console.error('❌ EMERGENCY_MESSAGE_FIX: Error reloading:', err);
            });
        }
    }
    else {
        console.log(`✅ EMERGENCY_MESSAGE_FIX: Successfully made ${allMessages.length} messages visible`);
    }
    return true;
}
// Auto-run after 1 second if in browser environment
if (typeof window !== 'undefined') {
    // Expose globally for backward compatibility
    window.emergencyMessageFix = emergencyMessageFix;
    // Auto-run after 1 second
    setTimeout(() => {
        console.log('🚨 EMERGENCY_MESSAGE_FIX: Auto-running emergency fix...');
        emergencyMessageFix();
    }, 1000);
    console.log('✅ EMERGENCY_MESSAGE_FIX: Loaded. Call window.emergencyMessageFix() to run manually.');
}
//# sourceMappingURL=EMERGENCY_MESSAGE_FIX.js.map