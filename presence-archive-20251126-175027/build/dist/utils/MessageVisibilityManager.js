/**
 * MESSAGE VISIBILITY MANAGER - TypeScript Version
 *
 * Handles CSS class management and visibility for messages in different modes.
 * Separates visibility logic from rendering logic.
 */
export class MessageVisibilityManager {
    /**
     * Ensure a reply has all required classes for focus mode visibility
     */
    static ensureFocusModeClasses(messageElement) {
        if (!messageElement) {
            return false;
        }
        // Ensure required classes are present
        if (!messageElement.classList.contains('message-loaded')) {
            messageElement.classList.add('message-loaded');
        }
        if (!messageElement.classList.contains('visible')) {
            messageElement.classList.add('visible');
        }
        // CRITICAL: Keep visibility and width styles - don't remove them!
        // Only remove other inline styles that might conflict
        const display = messageElement.style.display;
        const visibility = messageElement.style.visibility;
        const opacity = messageElement.style.opacity;
        const width = messageElement.style.width;
        const minWidth = messageElement.style.minWidth;
        const maxWidth = messageElement.style.maxWidth;
        const boxSizing = messageElement.style.boxSizing;
        // Remove all styles
        messageElement.style.cssText = '';
        // Restore critical visibility and width styles
        if (display)
            messageElement.style.setProperty('display', display, 'important');
        if (visibility)
            messageElement.style.setProperty('visibility', visibility, 'important');
        if (opacity)
            messageElement.style.setProperty('opacity', opacity, 'important');
        if (width)
            messageElement.style.setProperty('width', width, 'important');
        if (minWidth)
            messageElement.style.setProperty('min-width', minWidth, 'important');
        if (maxWidth)
            messageElement.style.setProperty('max-width', maxWidth, 'important');
        if (boxSizing)
            messageElement.style.setProperty('box-sizing', boxSizing, 'important');
        return true;
    }
    /**
     * Fix zero-height replies by applying comprehensive dimension fixes
     */
    static async fixZeroDimensions(messageElement, messageId) {
        if (!messageElement) {
            return false;
        }
        // Wait for DOM to settle
        await new Promise(resolve => requestAnimationFrame(resolve));
        await new Promise(resolve => requestAnimationFrame(resolve));
        const width = messageElement.offsetWidth;
        const height = messageElement.offsetHeight;
        if (width > 0 && height > 0) {
            return true; // Already has dimensions
        }
        console.warn(`⚠️ MessageVisibilityManager: Fixing zero dimensions for ${messageId}: ${width}px × ${height}px`);
        // CRITICAL FIX 1: Ensure parent container has proper width
        const parentContainer = messageElement.parentElement;
        if (parentContainer && parentContainer.classList.contains('focus-messages-container')) {
            parentContainer.style.setProperty('width', '100%', 'important');
            parentContainer.style.setProperty('min-width', '0', 'important');
            parentContainer.style.setProperty('max-width', '100%', 'important');
            parentContainer.style.setProperty('display', 'flex', 'important');
            parentContainer.style.setProperty('flex-direction', 'column', 'important');
        }
        // CRITICAL FIX 2: Ensure all required classes are present (same as default messages)
        this.ensureFocusModeClasses(messageElement);
        // CRITICAL FIX 3: Apply MINIMAL inline styles ONLY for zero-dimension fix
        // Use same approach as default messages - let CSS handle most styling
        messageElement.style.setProperty('display', 'flex', 'important');
        messageElement.style.setProperty('visibility', 'visible', 'important');
        messageElement.style.setProperty('opacity', '1', 'important');
        // CRITICAL: Set width constraints to prevent zero-width collapse
        messageElement.style.setProperty('width', '100%', 'important');
        messageElement.style.setProperty('min-width', '0', 'important');
        messageElement.style.setProperty('max-width', '100%', 'important');
        messageElement.style.setProperty('box-sizing', 'border-box', 'important');
        // CRITICAL FIX 4: Content wrapper - Ensure proper width and height
        const contentWrapper = messageElement.querySelector('.message-content-wrapper');
        if (contentWrapper) {
            if (contentWrapper.offsetWidth === 0) {
                contentWrapper.style.setProperty('width', '100%', 'important');
                contentWrapper.style.setProperty('min-width', '0', 'important');
                contentWrapper.style.setProperty('max-width', '100%', 'important');
                contentWrapper.style.setProperty('flex', '1 1 0%', 'important');
            }
            if (contentWrapper.offsetHeight === 0) {
                contentWrapper.style.setProperty('min-height', '1px', 'important');
            }
        }
        // CRITICAL FIX 5: Message content - Ensure proper width
        const messageContent = messageElement.querySelector('.message-content');
        if (messageContent) {
            if (messageContent.offsetWidth === 0) {
                messageContent.style.setProperty('width', '100%', 'important');
                messageContent.style.setProperty('min-width', '0', 'important');
                messageContent.style.setProperty('max-width', '100%', 'important');
            }
            if (messageContent.offsetHeight === 0) {
                messageContent.style.setProperty('min-height', '1px', 'important');
            }
        }
        // CRITICAL FIX 6: If scrollHeight > 0 but offsetHeight === 0, element has content but is collapsed
        // Use scrollHeight to set min-height on message element itself BEFORE waiting for layout
        const currentScrollHeight = messageElement.scrollHeight;
        if (currentScrollHeight > 0 && messageElement.offsetHeight === 0) {
            // Element has content but is collapsed - set min-height based on scrollHeight
            messageElement.style.setProperty('min-height', `${currentScrollHeight}px`, 'important');
            // Also ensure content wrapper and message content can expand
            const contentWrapper = messageElement.querySelector('.message-content-wrapper');
            if (contentWrapper && contentWrapper.offsetHeight === 0) {
                contentWrapper.style.setProperty('min-height', `${currentScrollHeight}px`, 'important');
            }
            const messageContent = messageElement.querySelector('.message-content');
            if (messageContent && messageContent.offsetHeight === 0) {
                messageContent.style.setProperty('min-height', `${Math.max(1, currentScrollHeight - 50)}px`, 'important');
            }
            console.log(`🔧 MessageVisibilityManager: Setting min-height to ${currentScrollHeight}px for collapsed element ${messageId}`);
        }
        // Wait for DOM to update and force layout recalculation
        await new Promise(resolve => requestAnimationFrame(resolve));
        await new Promise(resolve => requestAnimationFrame(resolve));
        await new Promise(resolve => requestAnimationFrame(resolve));
        // CRITICAL: Force layout recalculation by reading offsetHeight
        void messageElement.offsetHeight; // Force reflow
        // CRITICAL: Check if dimensions are now valid (CSS should handle height)
        // Don't set fixed heights - let CSS handle it like default messages
        const finalWidth = messageElement.offsetWidth;
        const finalHeight = messageElement.offsetHeight;
        if (finalWidth > 0 && finalHeight > 0) {
            console.log(`✅ MessageVisibilityManager: Fixed ${messageId}: ${finalWidth}px × ${finalHeight}px`);
            return true;
        }
        const newWidth = messageElement.offsetWidth;
        const newHeight = messageElement.offsetHeight;
        if (newWidth > 0 && newHeight > 0) {
            console.log(`✅ MessageVisibilityManager: Fixed ${messageId}: ${newWidth}px × ${newHeight}px`);
            return true;
        }
        // CRITICAL FIX: If still collapsed after all fixes, try one more time with explicit height
        if (currentScrollHeight > 0 && newHeight === 0) {
            messageElement.style.setProperty('height', `${currentScrollHeight}px`, 'important');
            await new Promise(resolve => requestAnimationFrame(resolve));
            const finalCheckHeight = messageElement.offsetHeight;
            if (finalCheckHeight > 0) {
                console.log(`✅ MessageVisibilityManager: Fixed ${messageId} with explicit height: ${finalCheckHeight}px`);
                return true;
            }
        }
        console.warn(`⚠️ MessageVisibilityManager: Could not fix zero dimensions for ${messageId} (scrollHeight: ${messageElement.scrollHeight}, offsetHeight: ${newHeight})`);
        return false;
    }
    /**
     * Verify message dimensions and apply fallback styles if needed
     */
    static async verifyDimensions(messageElement, messageId) {
        if (!messageElement) {
            return false;
        }
        // Wait for DOM to be ready
        await new Promise(resolve => requestAnimationFrame(resolve));
        const width = messageElement.offsetWidth;
        const height = messageElement.offsetHeight;
        const computedDisplay = window.getComputedStyle(messageElement).display;
        const computedVisibility = window.getComputedStyle(messageElement).visibility;
        if (width === 0 || height === 0) {
            console.warn(`⚠️ MessageVisibilityManager: Reply ${messageId} has zero dimensions: ${width}px × ${height}px, display: ${computedDisplay}, visibility: ${computedVisibility}`);
            // Use the comprehensive fix method
            const fixed = await this.fixZeroDimensions(messageElement, messageId);
            return fixed;
        }
        else {
            console.log(`✅ MessageVisibilityManager: Reply ${messageId} dimensions: ${width}px × ${height}px, display: ${computedDisplay}`);
            return true;
        }
    }
    /**
     * Ensure parent container has proper width (prevents zero-width cascade)
     */
    static ensureParentContainerWidth(messageElement) {
        if (!messageElement) {
            return;
        }
        const parentContainer = messageElement.parentElement;
        if (parentContainer && parentContainer.classList.contains('focus-messages-container')) {
            parentContainer.style.setProperty('width', '100%', 'important');
            parentContainer.style.setProperty('min-width', '0', 'important');
            parentContainer.style.setProperty('max-width', '100%', 'important');
        }
    }
    /**
     * Hide a reply (for default mode)
     */
    static hideReply(messageElement) {
        if (!messageElement) {
            return;
        }
        if (!messageElement.classList.contains('visible')) {
            messageElement.classList.remove('visible');
            messageElement.style.display = 'none';
            messageElement.style.pointerEvents = 'none';
        }
    }
    /**
     * Show a reply (for focus mode)
     */
    static async showReply(messageElement, messageId = '') {
        if (!messageElement) {
            return false;
        }
        // CRITICAL: Immediately set visibility BEFORE removing styles
        messageElement.style.setProperty('display', 'flex', 'important');
        messageElement.style.setProperty('visibility', 'visible', 'important');
        messageElement.style.setProperty('opacity', '1', 'important');
        // CRITICAL: Set width constraints to prevent zero-width collapse
        messageElement.style.setProperty('width', '100%', 'important');
        messageElement.style.setProperty('min-width', '0', 'important');
        messageElement.style.setProperty('max-width', '100%', 'important');
        messageElement.style.setProperty('box-sizing', 'border-box', 'important');
        // CRITICAL FIX: If element has scrollHeight but zero offsetHeight, set min-height immediately
        // This prevents the flash/disappear issue
        const scrollHeight = messageElement.scrollHeight;
        if (scrollHeight > 0 && messageElement.offsetHeight === 0) {
            messageElement.style.setProperty('min-height', `${scrollHeight}px`, 'important');
            console.log(`🔧 MessageVisibilityManager: Setting immediate min-height to ${scrollHeight}px for ${messageId}`);
        }
        this.ensureFocusModeClasses(messageElement);
        this.ensureParentContainerWidth(messageElement);
        // Verify and fix dimensions if needed
        if (messageId) {
            const hasDimensions = await this.verifyDimensions(messageElement, messageId);
            return hasDimensions;
        }
        return true;
    }
    /**
     * Fix all zero-dimension replies in a container
     */
    static async fixAllZeroDimensionReplies(container) {
        if (!container) {
            return { fixed: 0, failed: 0, total: 0 };
        }
        const replies = container.querySelectorAll('.message-reply, .thread-reply');
        const results = await Promise.allSettled(Array.from(replies).map(async (reply) => {
            const messageId = reply.dataset.messageId || 'unknown';
            const width = reply.offsetWidth;
            const height = reply.offsetHeight;
            if (width === 0 || height === 0) {
                const fixed = await this.fixZeroDimensions(reply, messageId);
                return { messageId, fixed };
            }
            return { messageId, fixed: true };
        }));
        let fixed = 0;
        let failed = 0;
        results.forEach((result) => {
            if (result.status === 'fulfilled') {
                if (result.value.fixed) {
                    fixed++;
                }
                else {
                    failed++;
                }
            }
            else {
                failed++;
            }
        });
        return {
            fixed,
            failed,
            total: replies.length
        };
    }
}
// Export to window for backward compatibility
if (typeof window !== 'undefined') {
    window.MessageVisibilityManager = MessageVisibilityManager;
    console.log('✅ MessageVisibilityManager: Exported to window');
}
export default MessageVisibilityManager;
