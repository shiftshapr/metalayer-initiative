/**
 * FIX ZERO DIMENSION REPLIES
 * 
 * Emergency fix script to fix replies with zero dimensions in focus mode.
 * This script should be run immediately after entering focus mode.
 * 
 * Usage: window.fixZeroDimensionReplies()
 */

(function() {
  'use strict';

  async function fixZeroDimensionReplies() {
    console.log('\n🔧 FIXING ZERO DIMENSION REPLIES');
    console.log('='.repeat(70));

    const focusContainer = document.querySelector('.focus-messages-container');
    if (!focusContainer) {
      console.error('❌ Focus container not found');
      return { success: false, error: 'Container not found' };
    }

    const replies = focusContainer.querySelectorAll('.message-reply, .thread-reply');
    console.log(`Found ${replies.length} replies to fix`);

    let fixed = 0;
    let failed = 0;

    await Promise.all(Array.from(replies).map(async (reply) => {
      const messageId = reply.dataset.messageId || 'unknown';
      const width = reply.offsetWidth;
      const height = reply.offsetHeight;

      if (width === 0 || height === 0) {
        console.log(`\n🔧 Fixing reply ${messageId} (${width}px × ${height}px)`);

        // CRITICAL FIX 1: Position and z-index
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

        // CRITICAL FIX 3: Content wrapper - MUST have min-height to prevent collapse
        const contentWrapper = reply.querySelector('.message-content-wrapper');
        if (contentWrapper) {
          contentWrapper.style.setProperty('flex', '1', 'important');
          contentWrapper.style.setProperty('min-width', '0', 'important');
          contentWrapper.style.setProperty('width', '100%', 'important');
          contentWrapper.style.setProperty('max-width', '100%', 'important');
          contentWrapper.style.setProperty('box-sizing', 'border-box', 'important');
          contentWrapper.style.setProperty('display', 'flex', 'important');
          contentWrapper.style.setProperty('flex-direction', 'column', 'important');
          // CRITICAL: Set min-height to prevent zero-height collapse
          contentWrapper.style.setProperty('min-height', '20px', 'important');
          contentWrapper.style.setProperty('height', 'auto', 'important');
        }

        // CRITICAL FIX 4: Message content - MUST have min-height to prevent collapse
        const messageContent = reply.querySelector('.message-content');
        if (messageContent) {
          messageContent.style.setProperty('display', 'block', 'important');
          messageContent.style.setProperty('width', '100%', 'important');
          messageContent.style.setProperty('min-width', '0', 'important');
          messageContent.style.setProperty('max-width', '100%', 'important');
          messageContent.style.setProperty('box-sizing', 'border-box', 'important');
          // CRITICAL: Set min-height to prevent zero-height collapse
          messageContent.style.setProperty('min-height', '10px', 'important');
          messageContent.style.setProperty('height', 'auto', 'important');
          messageContent.style.setProperty('word-wrap', 'break-word', 'important');
          messageContent.style.setProperty('overflow-wrap', 'break-word', 'important');
        }

        // CRITICAL FIX 5: Set min-height on reply itself
        reply.style.setProperty('min-height', '1px', 'important');
        reply.style.setProperty('height', 'auto', 'important');

        // Wait for DOM to update
        await new Promise(resolve => requestAnimationFrame(resolve));
        await new Promise(resolve => requestAnimationFrame(resolve));
        await new Promise(resolve => requestAnimationFrame(resolve));

        const newWidth = reply.offsetWidth;
        const newHeight = reply.offsetHeight;

        if (newWidth > 0 && newHeight > 0) {
          console.log(`✅ Fixed reply ${messageId}: ${newWidth}px × ${newHeight}px`);
          fixed++;
        } else {
          // Last resort: Use scrollHeight to force height
          const scrollHeight = reply.scrollHeight;
          if (scrollHeight > 0) {
            reply.style.setProperty('height', `${scrollHeight}px`, 'important');
            await new Promise(resolve => requestAnimationFrame(resolve));
            const finalHeight = reply.offsetHeight;
            if (finalHeight > 0) {
              console.log(`✅ Fixed reply ${messageId} using scrollHeight: ${newWidth}px × ${finalHeight}px`);
              fixed++;
            } else {
              console.warn(`⚠️ Reply ${messageId} still has zero dimensions: ${newWidth}px × ${newHeight}px`);
              failed++;
            }
          } else {
            console.warn(`⚠️ Reply ${messageId} still has zero dimensions: ${newWidth}px × ${newHeight}px (scrollHeight: ${scrollHeight})`);
            failed++;
          }
        }
      } else {
        console.log(`✅ Reply ${messageId} already has dimensions: ${width}px × ${height}px`);
      }
    }));

    console.log(`\n${'='.repeat(70)}`);
    console.log(`📊 FIX SUMMARY:`);
    console.log(`   Fixed: ${fixed}`);
    console.log(`   Failed: ${failed}`);
    console.log(`   Total: ${replies.length}`);
    console.log('='.repeat(70));

    return {
      success: failed === 0,
      fixed,
      failed,
      total: replies.length
    };
  }

  // Export to window
  if (typeof window !== 'undefined') {
    window.fixZeroDimensionReplies = fixZeroDimensionReplies;
    console.log('✅ Fix Zero Dimension Replies script loaded');
    console.log('💡 Run: window.fixZeroDimensionReplies() to fix replies');
  }

  return fixZeroDimensionReplies;
})();

