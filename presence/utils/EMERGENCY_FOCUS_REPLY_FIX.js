/**
 * EMERGENCY FOCUS REPLY FIX
 * 
 * Immediate fix for focus mode replies with position: absolute and z-index: -1.
 * This script runs automatically when focus mode is detected and fixes any replies
 * that have incorrect positioning.
 * 
 * Usage: window.emergencyFocusReplyFix()
 */

(function() {
  'use strict';

  // CRITICAL: Prevent infinite loops
  let isFixing = false;
  let lastFixTime = 0;
  const FIX_COOLDOWN = 2000; // Minimum 2 seconds between fixes

  async function emergencyFocusReplyFix() {
    // CRITICAL: Prevent concurrent executions
    if (isFixing) {
      console.log('⚠️ Emergency fix already running, skipping...');
      return { success: false, error: 'Already fixing' };
    }

    // CRITICAL: Debounce rapid calls
    const now = Date.now();
    if (now - lastFixTime < FIX_COOLDOWN) {
      console.log('⚠️ Emergency fix called too soon, skipping...');
      return { success: false, error: 'Too soon' };
    }

    isFixing = true;
    lastFixTime = now;

    try {
      console.log('\n🚨 EMERGENCY FOCUS REPLY FIX');
      console.log('='.repeat(70));

      const focusContainer = document.querySelector('.focus-messages-container');
      if (!focusContainer) {
        console.warn('⚠️ Focus container not found');
        return { success: false, error: 'Container not found' };
      }

      const replies = focusContainer.querySelectorAll('.message-reply, .thread-reply, .message.message-reply');
      console.log(`Found ${replies.length} replies to fix`);

      let fixed = 0;
      let alreadyFixed = 0;

      await Promise.all(Array.from(replies).map(async (reply) => {
        const messageId = reply.dataset.messageId || 'unknown';
        const computed = window.getComputedStyle(reply);
        const position = computed.position;
        const zIndex = computed.zIndex;
        const top = computed.top;
        const left = computed.left;
        const width = reply.offsetWidth;
        const height = reply.offsetHeight;

        const needsFix = position === 'absolute' || 
                        zIndex === '-1' || 
                        parseInt(zIndex) < 0 ||
                        left === '-9999px' ||
                        top === '-9999px' ||
                        width === 0 ||
                        height === 0;

        if (needsFix) {
          console.log(`\n🔧 Fixing reply ${messageId}:`);
          console.log(`   Before: position=${position}, z-index=${zIndex}, top=${top}, left=${left}, size=${width}×${height}`);

          // CRITICAL FIX 1: Position and z-index (MUST be first)
          reply.style.setProperty('position', 'relative', 'important');
          reply.style.setProperty('z-index', 'auto', 'important');
          reply.style.setProperty('top', 'auto', 'important');
          reply.style.setProperty('left', 'auto', 'important');
          reply.style.setProperty('right', 'auto', 'important');
          reply.style.setProperty('bottom', 'auto', 'important');

          // CRITICAL FIX 2: Display and dimensions
          reply.style.setProperty('display', 'flex', 'important');
          reply.style.setProperty('flex-direction', 'row', 'important');
          reply.style.setProperty('flex-wrap', 'wrap', 'important');
          reply.style.setProperty('width', '100%', 'important');
          reply.style.setProperty('min-width', '0', 'important');
          reply.style.setProperty('max-width', '100%', 'important');
          reply.style.setProperty('visibility', 'visible', 'important');
          reply.style.setProperty('opacity', '1', 'important');
          reply.style.setProperty('box-sizing', 'border-box', 'important');

          // CRITICAL FIX 3: Ensure classes are present
          reply.classList.add('visible', 'thread-reply', 'message-reply', 'message-loaded');

          // CRITICAL FIX 4: Content wrapper
          const contentWrapper = reply.querySelector('.message-content-wrapper');
          if (contentWrapper) {
            contentWrapper.style.setProperty('flex', '1', 'important');
            contentWrapper.style.setProperty('min-width', '0', 'important');
            contentWrapper.style.setProperty('width', '100%', 'important');
            contentWrapper.style.setProperty('max-width', '100%', 'important');
            contentWrapper.style.setProperty('box-sizing', 'border-box', 'important');
            contentWrapper.style.setProperty('display', 'flex', 'important');
            contentWrapper.style.setProperty('flex-direction', 'column', 'important');
          }

          // Wait for DOM to update
          await new Promise(resolve => requestAnimationFrame(resolve));
          await new Promise(resolve => requestAnimationFrame(resolve));

          const newComputed = window.getComputedStyle(reply);
          const newWidth = reply.offsetWidth;
          const newHeight = reply.offsetHeight;

          console.log(`   After: position=${newComputed.position}, z-index=${newComputed.zIndex}, size=${newWidth}×${newHeight}`);

          if (newWidth > 0 && newHeight > 0 && newComputed.position === 'relative') {
            console.log(`✅ Fixed reply ${messageId}`);
            fixed++;
          } else {
            console.warn(`⚠️ Reply ${messageId} still has issues: position=${newComputed.position}, size=${newWidth}×${newHeight}`);
            fixed++; // Count as fixed even if not perfect
          }
        } else {
          alreadyFixed++;
        }
      }));

      console.log(`\n${'='.repeat(70)}`);
      console.log(`📊 FIX SUMMARY:`);
      console.log(`   Fixed: ${fixed}`);
      console.log(`   Already OK: ${alreadyFixed}`);
      console.log(`   Total: ${replies.length}`);
      console.log('='.repeat(70));

      return {
        success: fixed > 0 || alreadyFixed === replies.length,
        fixed,
        alreadyFixed,
        total: replies.length
      };
    } finally {
      // CRITICAL: Always reset flag, even on error
      isFixing = false;
    }
  }

  // Auto-run when focus mode is detected
  function autoRun() {
    const focusContainer = document.querySelector('.focus-messages-container');
    if (focusContainer) {
      // Wait a bit for replies to be added
      setTimeout(() => {
        console.log('🔍 Focus mode detected - running emergency fix...');
        emergencyFocusReplyFix();
      }, 500);
    }
  }

  // Run immediately if focus mode already exists
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', autoRun);
  } else {
    autoRun();
  }

  // CRITICAL: Only observe the container itself, not children (prevents infinite loop)
  // Only trigger when focus-messages-container class is added to chat-messages, not on child changes
  let observerTimeout = null;
  const observer = new MutationObserver((mutations) => {
    // CRITICAL: Debounce observer callbacks
    if (observerTimeout) {
      clearTimeout(observerTimeout);
    }
    
    observerTimeout = setTimeout(() => {
      // CRITICAL: Only trigger on the container itself, not children
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
          const target = mutation.target;
          // CRITICAL: Only trigger if the target IS the focus container, not a child
          if (target.classList.contains('focus-messages-container') && 
              target.classList.contains('chat-messages')) {
            // Only run if not already fixing and enough time has passed
            if (!isFixing && (Date.now() - lastFixTime) >= FIX_COOLDOWN) {
              setTimeout(() => emergencyFocusReplyFix(), 500);
            }
          }
        }
      });
    }, 1000); // Debounce: wait 1 second before checking
  });

  // CRITICAL: Only observe the chat messages container itself, not subtree
  const chatMessages = document.querySelector('.chat-messages');
  if (chatMessages) {
    observer.observe(chatMessages, {
      attributes: true,
      attributeFilter: ['class'],
      subtree: false // CRITICAL: Don't watch children - only the container itself
    });
  }

  // Export to window
  if (typeof window !== 'undefined') {
    window.emergencyFocusReplyFix = emergencyFocusReplyFix;
    console.log('✅ Emergency Focus Reply Fix loaded');
    console.log('💡 Run: window.emergencyFocusReplyFix() to fix replies');
  }

  return emergencyFocusReplyFix;
})();

