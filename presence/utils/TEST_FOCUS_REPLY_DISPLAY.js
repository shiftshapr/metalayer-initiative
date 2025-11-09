/**
 * TEST FOCUS MODE REPLY DISPLAY
 * 
 * Comprehensive test to verify replies are displaying correctly in focus mode:
 * - Replies have proper height (not 0px or 1px)
 * - Replies are stacked vertically (not overlapping)
 * - Proper spacing between replies
 * - Container layout is correct
 */

(function() {
  'use strict';

  async function testFocusReplyDisplay() {
    console.log('\n🧪 TESTING FOCUS MODE REPLY DISPLAY');
    console.log('='.repeat(70));

    const container = document.querySelector('.focus-messages-container');
    if (!container) {
      console.error('❌ Focus container not found');
      console.log('💡 Enter focus mode first by clicking on a message');
      return { success: false, error: 'Container not found' };
    }

    const replies = container.querySelectorAll('.message-reply, .thread-reply');
    console.log(`Found ${replies.length} replies to test`);

    if (replies.length === 0) {
      console.warn('⚠️ No replies found in focus mode');
      console.log('💡 Make sure you have replies to the focused message');
      return { success: false, error: 'No replies found' };
    }

    const results = {
      total: replies.length,
      passed: 0,
      failed: 0,
      tests: []
    };

    // Test 1: Check reply dimensions
    console.log('\n📏 TEST 1: Reply Dimensions');
    console.log('-'.repeat(70));
    let dimensionTests = 0;
    let dimensionPassed = 0;

    replies.forEach((reply, index) => {
      const messageId = reply.dataset.messageId || 'unknown';
      const width = reply.offsetWidth;
      const height = reply.offsetHeight;
      const scrollHeight = reply.scrollHeight;
      const computedStyle = window.getComputedStyle(reply);

      dimensionTests++;
      const hasValidDimensions = width > 0 && height > 0;
      const hasProperHeight = height >= 50; // Should be at least 50px due to min-height
      const heightMatchesContent = height >= scrollHeight * 0.9; // Allow 10% tolerance

      if (hasValidDimensions && hasProperHeight && heightMatchesContent) {
        dimensionPassed++;
        console.log(`✅ Reply ${index + 1} (${messageId}): ${width}px × ${height}px (scrollHeight: ${scrollHeight}px)`);
        results.tests.push({
          reply: messageId,
          test: 'dimensions',
          passed: true,
          width,
          height,
          scrollHeight
        });
      } else {
        console.error(`❌ Reply ${index + 1} (${messageId}): ${width}px × ${height}px (scrollHeight: ${scrollHeight}px)`);
        if (!hasValidDimensions) console.error(`   Issue: Invalid dimensions`);
        if (!hasProperHeight) console.error(`   Issue: Height too small (${height}px < 50px)`);
        if (!heightMatchesContent) console.error(`   Issue: Height doesn't match content (${height}px < ${scrollHeight * 0.9}px)`);
        results.tests.push({
          reply: messageId,
          test: 'dimensions',
          passed: false,
          width,
          height,
          scrollHeight,
          issues: [
            !hasValidDimensions && 'Invalid dimensions',
            !hasProperHeight && 'Height too small',
            !heightMatchesContent && 'Height doesn\'t match content'
          ].filter(Boolean)
        });
      }
    });

    if (dimensionPassed === dimensionTests) {
      results.passed++;
      console.log(`\n✅ TEST 1 PASSED: ${dimensionPassed}/${dimensionTests} replies have proper dimensions`);
    } else {
      results.failed++;
      console.log(`\n❌ TEST 1 FAILED: ${dimensionPassed}/${dimensionTests} replies have proper dimensions`);
    }

    // Test 2: Check reply stacking (no overlapping)
    console.log('\n📚 TEST 2: Reply Stacking (No Overlapping)');
    console.log('-'.repeat(70));
    let stackingTests = 0;
    let stackingPassed = 0;

    for (let i = 0; i < replies.length; i++) {
      const reply = replies[i];
      const messageId = reply.dataset.messageId || 'unknown';
      const rect = reply.getBoundingClientRect();

      if (i > 0) {
        const prevReply = replies[i - 1];
        const prevRect = prevReply.getBoundingClientRect();
        const spacing = rect.top - prevRect.bottom;

        stackingTests++;
        const noOverlap = spacing >= 0;
        const hasProperSpacing = spacing >= 5; // At least 5px spacing

        if (noOverlap && hasProperSpacing) {
          stackingPassed++;
          console.log(`✅ Reply ${i + 1} (${messageId}): Proper spacing (${spacing.toFixed(1)}px from previous)`);
          results.tests.push({
            reply: messageId,
            test: 'stacking',
            passed: true,
            spacing
          });
        } else {
          console.error(`❌ Reply ${i + 1} (${messageId}): Spacing issue (${spacing.toFixed(1)}px from previous)`);
          if (!noOverlap) console.error(`   Issue: Overlapping with previous reply`);
          if (!hasProperSpacing) console.error(`   Issue: Spacing too small (${spacing.toFixed(1)}px < 5px)`);
          results.tests.push({
            reply: messageId,
            test: 'stacking',
            passed: false,
            spacing,
            issues: [
              !noOverlap && 'Overlapping',
              !hasProperSpacing && 'Spacing too small'
            ].filter(Boolean)
          });
        }
      }
    }

    if (stackingPassed === stackingTests) {
      results.passed++;
      console.log(`\n✅ TEST 2 PASSED: ${stackingPassed}/${stackingTests} replies have proper spacing`);
    } else {
      results.failed++;
      console.log(`\n❌ TEST 2 FAILED: ${stackingPassed}/${stackingTests} replies have proper spacing`);
    }

    // Test 3: Check CSS properties
    console.log('\n🎨 TEST 3: CSS Properties');
    console.log('-'.repeat(70));
    let cssTests = 0;
    let cssPassed = 0;

    replies.forEach((reply, index) => {
      const messageId = reply.dataset.messageId || 'unknown';
      const computedStyle = window.getComputedStyle(reply);

      cssTests++;
      const checks = {
        display: computedStyle.display === 'flex',
        minHeight: parseInt(computedStyle.minHeight) >= 50,
        position: computedStyle.position === 'relative',
        visibility: computedStyle.visibility === 'visible',
        opacity: parseFloat(computedStyle.opacity) > 0.9,
        marginBottom: parseInt(computedStyle.marginBottom) >= 10
      };

      const allPassed = Object.values(checks).every(v => v === true);
      const failedChecks = Object.entries(checks)
        .filter(([_, passed]) => !passed)
        .map(([prop, _]) => prop);

      if (allPassed) {
        cssPassed++;
        console.log(`✅ Reply ${index + 1} (${messageId}): All CSS properties correct`);
        results.tests.push({
          reply: messageId,
          test: 'css',
          passed: true
        });
      } else {
        console.error(`❌ Reply ${index + 1} (${messageId}): CSS issues: ${failedChecks.join(', ')}`);
        results.tests.push({
          reply: messageId,
          test: 'css',
          passed: false,
          failedChecks
        });
      }
    });

    if (cssPassed === cssTests) {
      results.passed++;
      console.log(`\n✅ TEST 3 PASSED: ${cssPassed}/${cssTests} replies have correct CSS`);
    } else {
      results.failed++;
      console.log(`\n❌ TEST 3 FAILED: ${cssPassed}/${cssTests} replies have correct CSS`);
    }

    // Test 4: Check container layout
    console.log('\n📦 TEST 4: Container Layout');
    console.log('-'.repeat(70));
    const containerStyle = window.getComputedStyle(container);
    const containerChecks = {
      display: containerStyle.display === 'flex',
      flexDirection: containerStyle.flexDirection === 'column',
      width: container.offsetWidth > 0
    };

    const containerPassed = Object.values(containerChecks).every(v => v === true);
    const containerFailed = Object.entries(containerChecks)
      .filter(([_, passed]) => !passed)
      .map(([prop, _]) => prop);

    if (containerPassed) {
      results.passed++;
      console.log(`✅ Container layout correct`);
      console.log(`   Display: ${containerStyle.display}`);
      console.log(`   Flex-direction: ${containerStyle.flexDirection}`);
      console.log(`   Width: ${container.offsetWidth}px`);
    } else {
      results.failed++;
      console.error(`❌ Container layout issues: ${containerFailed.join(', ')}`);
    }

    // Summary
    console.log(`\n${'='.repeat(70)}`);
    console.log(`📊 TEST SUMMARY`);
    console.log(`${'='.repeat(70)}`);
    console.log(`Total Replies: ${results.total}`);
    console.log(`Tests Passed: ${results.passed}/4`);
    console.log(`Tests Failed: ${results.failed}/4`);
    console.log(`Overall: ${results.failed === 0 ? '✅ PASSED' : '❌ FAILED'}`);

    if (results.failed > 0) {
      console.log(`\n⚠️ FAILED TESTS:`);
      results.tests
        .filter(t => !t.passed)
        .forEach(t => {
          console.log(`   • ${t.reply} (${t.test}): ${t.issues ? t.issues.join(', ') : t.failedChecks?.join(', ') || 'Unknown issue'}`);
        });
    }

    return results;
  }

  // Export to window
  if (typeof window !== 'undefined') {
    window.testFocusReplyDisplay = testFocusReplyDisplay;
    console.log('✅ Focus Reply Display Test loaded');
    console.log('💡 Run: window.testFocusReplyDisplay() to test');
    
    // Auto-run if in focus mode
    if (document.querySelector('.focus-messages-container')) {
      console.log('🔍 Focus mode detected - auto-running test...');
      setTimeout(() => testFocusReplyDisplay(), 1000);
    }
  }

  return testFocusReplyDisplay;
})();

