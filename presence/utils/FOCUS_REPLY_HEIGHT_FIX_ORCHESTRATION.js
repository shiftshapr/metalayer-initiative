/**
 * FOCUS REPLY HEIGHT FIX ORCHESTRATION
 * 
 * Comprehensive diagnostic and fix for zero-height replies in focus mode.
 * This script identifies the root cause and applies fixes.
 * 
 * Usage: window.runFocusReplyHeightFixOrchestration()
 */

(function() {
  'use strict';

  async function runFocusReplyHeightFixOrchestration() {
    console.log('\n🚀 =====================================================');
    console.log('🚀 FOCUS REPLY HEIGHT FIX ORCHESTRATION');
    console.log('🚀 =====================================================');
    console.log('⏰ Started:', new Date().toISOString());
    console.log('');

    const results = {
      diagnostic: {},
      fixes: {},
      test: {},
      summary: {}
    };

    // ============================================
    // PHASE 1: DIAGNOSTIC
    // ============================================
    console.log('📋 PHASE 1: DIAGNOSTIC');
    console.log('─'.repeat(70));

    const focusContainer = document.querySelector('.focus-messages-container');
    if (!focusContainer) {
      console.error('❌ Focus container not found');
      results.diagnostic.containerFound = false;
      return results;
    }
    results.diagnostic.containerFound = true;

    const replies = focusContainer.querySelectorAll('.message-reply, .thread-reply');
    console.log(`✅ Found ${replies.length} replies in focus mode`);
    results.diagnostic.replyCount = replies.length;

    // Check each reply
    const replyDetails = [];
    Array.from(replies).forEach((reply, index) => {
      const messageId = reply.dataset.messageId || `reply-${index}`;
      const width = reply.offsetWidth;
      const height = reply.offsetHeight;
      const computedDisplay = window.getComputedStyle(reply).display;
      const computedVisibility = window.getComputedStyle(reply).visibility;
      const computedPosition = window.getComputedStyle(reply).position;
      const computedZIndex = window.getComputedStyle(reply).zIndex;

      // Check content wrapper
      const contentWrapper = reply.querySelector('.message-content-wrapper');
      const contentWrapperWidth = contentWrapper ? contentWrapper.offsetWidth : 0;
      const contentWrapperHeight = contentWrapper ? contentWrapper.offsetHeight : 0;
      const contentWrapperDisplay = contentWrapper ? window.getComputedStyle(contentWrapper).display : 'none';

      // Check message content
      const messageContent = reply.querySelector('.message-content');
      const messageContentWidth = messageContent ? messageContent.offsetWidth : 0;
      const messageContentHeight = messageContent ? messageContent.offsetHeight : 0;
      const messageContentText = messageContent ? messageContent.textContent?.trim() : '';
      const messageContentHasText = messageContentText && messageContentText.length > 0;

      // Check classes
      const classes = Array.from(reply.classList);

      const detail = {
        messageId,
        reply: {
          width,
          height,
          display: computedDisplay,
          visibility: computedVisibility,
          position: computedPosition,
          zIndex: computedZIndex,
          classes
        },
        contentWrapper: {
          exists: !!contentWrapper,
          width: contentWrapperWidth,
          height: contentWrapperHeight,
          display: contentWrapperDisplay
        },
        messageContent: {
          exists: !!messageContent,
          width: messageContentWidth,
          height: messageContentHeight,
          hasText: messageContentHasText,
          textLength: messageContentText?.length || 0
        },
        hasZeroHeight: height === 0
      };

      replyDetails.push(detail);

      if (height === 0) {
        console.log(`⚠️ Reply ${messageId}: ${width}px × ${height}px`);
        console.log(`   Display: ${computedDisplay}, Visibility: ${computedVisibility}`);
        console.log(`   Position: ${computedPosition}, Z-Index: ${computedZIndex}`);
        console.log(`   Content Wrapper: ${contentWrapperWidth}px × ${contentWrapperHeight}px, Display: ${contentWrapperDisplay}`);
        console.log(`   Message Content: ${messageContentWidth}px × ${messageContentHeight}px, Has Text: ${messageContentHasText}`);
      } else {
        console.log(`✅ Reply ${messageId}: ${width}px × ${height}px`);
      }
    });

    results.diagnostic.replyDetails = replyDetails;
    const zeroHeightCount = replyDetails.filter(r => r.hasZeroHeight).length;
    console.log(`\n📊 Summary: ${zeroHeightCount} out of ${replies.length} replies have zero height`);
    results.diagnostic.zeroHeightCount = zeroHeightCount;

    // ============================================
    // PHASE 2: ROOT CAUSE ANALYSIS
    // ============================================
    console.log('\n🔍 PHASE 2: ROOT CAUSE ANALYSIS');
    console.log('─'.repeat(70));

    const rootCauses = [];

    // Check if content wrapper is collapsing
    const collapsingContentWrappers = replyDetails.filter(r => 
      r.hasZeroHeight && r.contentWrapper.exists && r.contentWrapper.height === 0
    );
    if (collapsingContentWrappers.length > 0) {
      rootCauses.push({
        issue: 'Content wrapper collapsing',
        count: collapsingContentWrappers.length,
        details: 'Content wrapper has zero height even though reply has width'
      });
      console.log(`⚠️ Root Cause: ${collapsingContentWrappers.length} content wrappers are collapsing`);
    }

    // Check if message content is empty
    const emptyContent = replyDetails.filter(r => 
      r.hasZeroHeight && r.messageContent.exists && !r.messageContent.hasText
    );
    if (emptyContent.length > 0) {
      rootCauses.push({
        issue: 'Message content is empty',
        count: emptyContent.length,
        details: 'Message content element exists but has no text'
      });
      console.log(`⚠️ Root Cause: ${emptyContent.length} message contents are empty`);
    }

    // Check if display is none
    const hiddenReplies = replyDetails.filter(r => 
      r.hasZeroHeight && r.reply.display === 'none'
    );
    if (hiddenReplies.length > 0) {
      rootCauses.push({
        issue: 'Replies have display: none',
        count: hiddenReplies.length,
        details: 'Replies are hidden with display: none'
      });
      console.log(`⚠️ Root Cause: ${hiddenReplies.length} replies have display: none`);
    }

    // Check if position is absolute
    const absolutePositioned = replyDetails.filter(r => 
      r.hasZeroHeight && r.reply.position === 'absolute'
    );
    if (absolutePositioned.length > 0) {
      rootCauses.push({
        issue: 'Replies have position: absolute',
        count: absolutePositioned.length,
        details: 'Replies are positioned absolutely, causing layout issues'
      });
      console.log(`⚠️ Root Cause: ${absolutePositioned.length} replies have position: absolute`);
    }

    results.diagnostic.rootCauses = rootCauses;

    // ============================================
    // PHASE 3: APPLY FIXES
    // ============================================
    console.log('\n🔧 PHASE 3: APPLYING FIXES');
    console.log('─'.repeat(70));

    let fixedCount = 0;
    let failedCount = 0;

    await Promise.all(Array.from(replies).map(async (reply) => {
      const messageId = reply.dataset.messageId || 'unknown';
      const initialHeight = reply.offsetHeight;

      if (initialHeight === 0) {
        console.log(`\n🔧 Fixing reply ${messageId}...`);

        // FIX 1: Ensure reply element has proper display and dimensions
        reply.style.setProperty('display', 'flex', 'important');
        reply.style.setProperty('flex-direction', 'row', 'important');
        reply.style.setProperty('flex-wrap', 'wrap', 'important');
        reply.style.setProperty('width', '100%', 'important');
        reply.style.setProperty('min-width', '0', 'important');
        reply.style.setProperty('max-width', '100%', 'important');
        reply.style.setProperty('visibility', 'visible', 'important');
        reply.style.setProperty('opacity', '1', 'important');
        reply.style.setProperty('position', 'relative', 'important');
        reply.style.setProperty('z-index', 'auto', 'important');
        reply.style.setProperty('top', 'auto', 'important');
        reply.style.setProperty('left', 'auto', 'important');
        reply.style.setProperty('right', 'auto', 'important');
        reply.style.setProperty('bottom', 'auto', 'important');
        reply.style.setProperty('box-sizing', 'border-box', 'important');
        // CRITICAL: Set min-height to prevent collapse
        reply.style.setProperty('min-height', '1px', 'important');
        reply.style.setProperty('height', 'auto', 'important');

        // FIX 2: Ensure content wrapper has proper dimensions
        const contentWrapper = reply.querySelector('.message-content-wrapper');
        if (contentWrapper) {
          contentWrapper.style.setProperty('display', 'flex', 'important');
          contentWrapper.style.setProperty('flex-direction', 'column', 'important');
          contentWrapper.style.setProperty('flex', '1', 'important');
          contentWrapper.style.setProperty('min-width', '0', 'important');
          contentWrapper.style.setProperty('width', '100%', 'important');
          contentWrapper.style.setProperty('max-width', '100%', 'important');
          contentWrapper.style.setProperty('box-sizing', 'border-box', 'important');
          // CRITICAL: Set min-height to prevent collapse
          contentWrapper.style.setProperty('min-height', '20px', 'important');
          contentWrapper.style.setProperty('height', 'auto', 'important');
        }

        // FIX 3: Ensure message content has proper dimensions
        const messageContent = reply.querySelector('.message-content');
        if (messageContent) {
          messageContent.style.setProperty('display', 'block', 'important');
          messageContent.style.setProperty('width', '100%', 'important');
          messageContent.style.setProperty('min-width', '0', 'important');
          messageContent.style.setProperty('max-width', '100%', 'important');
          messageContent.style.setProperty('box-sizing', 'border-box', 'important');
          // CRITICAL: Set min-height to prevent collapse
          messageContent.style.setProperty('min-height', '10px', 'important');
          messageContent.style.setProperty('height', 'auto', 'important');
          messageContent.style.setProperty('word-wrap', 'break-word', 'important');
          messageContent.style.setProperty('overflow-wrap', 'break-word', 'important');
        }

        // FIX 4: Ensure avatar container has proper dimensions
        const avatarContainer = reply.querySelector('.avatar-container');
        if (avatarContainer) {
          avatarContainer.style.setProperty('flex-shrink', '0', 'important');
          avatarContainer.style.setProperty('width', 'auto', 'important');
          avatarContainer.style.setProperty('height', 'auto', 'important');
        }

        // FIX 5: Ensure message footer has proper dimensions
        const messageFooter = reply.querySelector('.message-footer');
        if (messageFooter) {
          messageFooter.style.setProperty('width', '100%', 'important');
          messageFooter.style.setProperty('flex-basis', '100%', 'important');
          messageFooter.style.setProperty('display', 'flex', 'important');
          messageFooter.style.setProperty('visibility', 'visible', 'important');
          messageFooter.style.setProperty('opacity', '1', 'important');
        }

        // Wait for DOM to update
        await new Promise(resolve => requestAnimationFrame(resolve));
        await new Promise(resolve => requestAnimationFrame(resolve));
        await new Promise(resolve => requestAnimationFrame(resolve));

        // Verify fix
        const newHeight = reply.offsetHeight;
        const newWidth = reply.offsetWidth;

        if (newHeight > 0) {
          console.log(`✅ Fixed reply ${messageId}: ${newWidth}px × ${newHeight}px`);
          fixedCount++;
        } else {
          console.warn(`⚠️ Reply ${messageId} still has zero height: ${newWidth}px × ${newHeight}px`);
          
          // Last resort: Force height calculation by setting explicit height
          const scrollHeight = reply.scrollHeight;
          if (scrollHeight > 0) {
            reply.style.setProperty('height', `${scrollHeight}px`, 'important');
            await new Promise(resolve => requestAnimationFrame(resolve));
            const finalHeight = reply.offsetHeight;
            if (finalHeight > 0) {
              console.log(`✅ Fixed reply ${messageId} using scrollHeight: ${newWidth}px × ${finalHeight}px`);
              fixedCount++;
            } else {
              console.error(`❌ Failed to fix reply ${messageId} even with scrollHeight`);
              failedCount++;
            }
          } else {
            failedCount++;
          }
        }
      } else {
        console.log(`✅ Reply ${messageId} already has height: ${reply.offsetWidth}px × ${initialHeight}px`);
      }
    }));

    results.fixes.fixedCount = fixedCount;
    results.fixes.failedCount = failedCount;
    results.fixes.totalCount = replies.length;

    // ============================================
    // PHASE 4: VERIFICATION
    // ============================================
    console.log('\n✅ PHASE 4: VERIFICATION');
    console.log('─'.repeat(70));

    const finalReplies = focusContainer.querySelectorAll('.message-reply, .thread-reply');
    let visibleCount = 0;
    let zeroHeightCount = 0;

    Array.from(finalReplies).forEach((reply) => {
      const height = reply.offsetHeight;
      const width = reply.offsetWidth;
      const computedDisplay = window.getComputedStyle(reply).display;
      const computedVisibility = window.getComputedStyle(reply).visibility;

      if (height > 0 && width > 0 && computedDisplay !== 'none' && computedVisibility !== 'hidden') {
        visibleCount++;
      } else {
        zeroHeightCount++;
        const messageId = reply.dataset.messageId || 'unknown';
        console.warn(`⚠️ Reply ${messageId} still not visible: ${width}px × ${height}px, display: ${computedDisplay}, visibility: ${computedVisibility}`);
      }
    });

    results.test.visibleCount = visibleCount;
    results.test.zeroHeightCount = zeroHeightCount;
    results.test.totalCount = finalReplies.length;

    // ============================================
    // PHASE 5: SUMMARY
    // ============================================
    console.log('\n📊 PHASE 5: SUMMARY');
    console.log('─'.repeat(70));
    console.log(`Total Replies: ${finalReplies.length}`);
    console.log(`Visible Replies: ${visibleCount}`);
    console.log(`Zero Height Replies: ${zeroHeightCount}`);
    console.log(`Fixed: ${fixedCount}`);
    console.log(`Failed: ${failedCount}`);
    console.log('');

    results.summary = {
      totalReplies: finalReplies.length,
      visibleReplies: visibleCount,
      zeroHeightReplies: zeroHeightCount,
      fixed: fixedCount,
      failed: failedCount,
      success: zeroHeightCount === 0
    };

    if (results.summary.success) {
      console.log('✅ SUCCESS: All replies are visible!');
    } else {
      console.log('❌ FAILURE: Some replies still have zero height');
      console.log('💡 Recommendation: Check CSS rules that might be overriding inline styles');
    }

    console.log('\n🚀 =====================================================');
    console.log('🚀 ORCHESTRATION COMPLETE');
    console.log('🚀 =====================================================\n');

    // Store results globally
    if (typeof window !== 'undefined') {
      window.focusReplyHeightFixResults = results;
    }

    return results;
  }

  // Export to window
  if (typeof window !== 'undefined') {
    window.runFocusReplyHeightFixOrchestration = runFocusReplyHeightFixOrchestration;
    console.log('✅ Focus Reply Height Fix Orchestration loaded');
    console.log('💡 Run: window.runFocusReplyHeightFixOrchestration() to fix replies');
  }

  return runFocusReplyHeightFixOrchestration;
})();

