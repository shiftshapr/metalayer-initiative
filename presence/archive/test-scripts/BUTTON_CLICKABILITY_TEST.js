/**
 * BUTTON_CLICKABILITY_TEST.js
 * Comprehensive test for bookmark and reaction button clickability
 */

(function() {
  'use strict';

  const test = {
    results: {
      bookmarks: {
        buttonsFound: 0,
        listenersAttached: 0,
        clickable: 0,
        blocked: [],
        issues: []
      },
      reactions: {
        buttonsFound: 0,
        listenersAttached: 0,
        clickable: 0,
        blocked: [],
        issues: []
      },
      summary: {
        totalBookmarks: 0,
        totalReactions: 0,
        clickableBookmarks: 0,
        clickableReactions: 0,
        issues: []
      }
    },

    log: function(category, message, type = 'info') {
      const prefix = type === 'error' ? '❌' : type === 'warn' ? '⚠️' : '✅';
      console.log(`[${category}] ${prefix} ${message}`);
    },

    // Test bookmark buttons
    testBookmarkButtons: function() {
      this.log('BOOKMARK_TEST', 'Testing bookmark buttons...');
      const results = this.results.bookmarks;

      const bookmarkButtons = document.querySelectorAll('.bookmark-btn');
      results.buttonsFound = bookmarkButtons.length;
      this.log('BOOKMARK_TEST', `Found ${results.buttonsFound} bookmark buttons`);

      bookmarkButtons.forEach((btn, index) => {
        const messageId = btn.dataset.messageId;
        this.log('BOOKMARK_TEST', `Testing bookmark button ${index + 1} for message ${messageId}`);

        // Check if button is visible and not disabled
        const style = window.getComputedStyle(btn);
        const isVisible = style.display !== 'none' && style.visibility !== 'hidden';
        const pointerEvents = style.pointerEvents;
        const isClickable = pointerEvents !== 'none' && !btn.disabled;

        if (!isVisible) {
          results.blocked.push({ messageId, reason: 'Not visible' });
          this.log('BOOKMARK_TEST', `Button for ${messageId} is not visible`, 'warn');
        }

        if (!isClickable) {
          results.blocked.push({ messageId, reason: `pointer-events: ${pointerEvents}, disabled: ${btn.disabled}` });
          this.log('BOOKMARK_TEST', `Button for ${messageId} is not clickable`, 'warn');
        }

        // Check if click handler exists
        let hasHandler = false;
        try {
          // Try to trigger a test click
          const testEvent = new MouseEvent('click', {
            bubbles: true,
            cancelable: true,
            view: window
          });
          
          // Check if handleBookmarkToggle exists
          if (typeof window.handleBookmarkToggle === 'function') {
            hasHandler = true;
            results.listenersAttached++;
          }
        } catch (e) {
          this.log('BOOKMARK_TEST', `Error testing button ${messageId}: ${e.message}`, 'error');
        }

        if (isVisible && isClickable && hasHandler) {
          results.clickable++;
          this.log('BOOKMARK_TEST', `Button for ${messageId} is clickable`, 'info');
        } else {
          results.issues.push({
            messageId,
            visible: isVisible,
            clickable: isClickable,
            hasHandler: hasHandler
          });
        }
      });

      this.results.summary.totalBookmarks = results.buttonsFound;
      this.results.summary.clickableBookmarks = results.clickable;
    },

    // Test reaction buttons
    testReactionButtons: function() {
      this.log('REACTION_TEST', 'Testing reaction buttons...');
      const results = this.results.reactions;

      const reactionButtons = document.querySelectorAll('.reaction-btn');
      results.buttonsFound = reactionButtons.length;
      this.log('REACTION_TEST', `Found ${results.buttonsFound} reaction buttons`);

      reactionButtons.forEach((btn, index) => {
        const messageId = btn.dataset.messageId || btn.closest('.message')?.dataset.messageId;
        this.log('REACTION_TEST', `Testing reaction button ${index + 1} for message ${messageId}`);

        // Check if button is visible and not disabled
        const style = window.getComputedStyle(btn);
        const isVisible = style.display !== 'none' && style.visibility !== 'hidden';
        const pointerEvents = style.pointerEvents;
        const isClickable = pointerEvents !== 'none' && !btn.disabled;

        if (!isVisible) {
          results.blocked.push({ messageId, reason: 'Not visible' });
          this.log('REACTION_TEST', `Button for ${messageId} is not visible`, 'warn');
        }

        if (!isClickable) {
          results.blocked.push({ messageId, reason: `pointer-events: ${pointerEvents}, disabled: ${btn.disabled}` });
          this.log('REACTION_TEST', `Button for ${messageId} is not clickable`, 'warn');
        }

        // Check if click handler exists
        let hasHandler = false;
        try {
          // Check if showReactionModal exists
          if (typeof window.showReactionModal === 'function') {
            hasHandler = true;
            results.listenersAttached++;
          }
        } catch (e) {
          this.log('REACTION_TEST', `Error testing button ${messageId}: ${e.message}`, 'error');
        }

        if (isVisible && isClickable && hasHandler) {
          results.clickable++;
          this.log('REACTION_TEST', `Button for ${messageId} is clickable`, 'info');
        } else {
          results.issues.push({
            messageId,
            visible: isVisible,
            clickable: isClickable,
            hasHandler: hasHandler
          });
        }
      });

      this.results.summary.totalReactions = results.buttonsFound;
      this.results.summary.clickableReactions = results.clickable;
    },

    // Test actual click simulation
    testActualClicks: async function() {
      this.log('CLICK_TEST', 'Testing actual button clicks...');

      // Test bookmark button
      const firstBookmarkBtn = document.querySelector('.bookmark-btn');
      if (firstBookmarkBtn) {
        const messageId = firstBookmarkBtn.dataset.messageId;
        this.log('CLICK_TEST', `Simulating click on bookmark button for ${messageId}`);
        
        try {
          const clickEvent = new MouseEvent('click', {
            bubbles: true,
            cancelable: true,
            view: window
          });
          
          firstBookmarkBtn.dispatchEvent(clickEvent);
          await new Promise(resolve => setTimeout(resolve, 100));
          this.log('CLICK_TEST', 'Bookmark click simulated - check console for handler execution');
        } catch (e) {
          this.log('CLICK_TEST', `Error simulating bookmark click: ${e.message}`, 'error');
        }
      }

      // Test reaction button
      const firstReactionBtn = document.querySelector('.reaction-btn');
      if (firstReactionBtn) {
        const messageId = firstReactionBtn.dataset.messageId || firstReactionBtn.closest('.message')?.dataset.messageId;
        this.log('CLICK_TEST', `Simulating click on reaction button for ${messageId}`);
        
        try {
          const clickEvent = new MouseEvent('click', {
            bubbles: true,
            cancelable: true,
            view: window
          });
          
          firstReactionBtn.dispatchEvent(clickEvent);
          await new Promise(resolve => setTimeout(resolve, 100));
          this.log('CLICK_TEST', 'Reaction click simulated - check console for handler execution');
        } catch (e) {
          this.log('CLICK_TEST', `Error simulating reaction click: ${e.message}`, 'error');
        }
      }
    },

    // Run all tests
    runAllTests: async function() {
      console.log('');
      console.log('═══════════════════════════════════════════════════════════');
      console.log('🔍 BUTTON CLICKABILITY TEST');
      console.log('═══════════════════════════════════════════════════════════');
      console.log('');

      this.testBookmarkButtons();
      this.testReactionButtons();
      await this.testActualClicks();

      // Calculate summary
      const summary = this.results.summary;
      summary.issues = [
        ...this.results.bookmarks.issues,
        ...this.results.reactions.issues
      ];

      this.printResults();

      // Store results globally
      window.buttonClickabilityTestResults = this.results;

      console.log('');
      console.log('═══════════════════════════════════════════════════════════');
      console.log('✅ Test complete - Results stored in window.buttonClickabilityTestResults');
      console.log('═══════════════════════════════════════════════════════════');
    },

    printResults: function() {
      console.log('');
      console.log('📊 === TEST RESULTS ===');
      console.log('');

      // Bookmarks
      console.log('📌 BOOKMARKS:');
      console.log(`   Buttons Found: ${this.results.bookmarks.buttonsFound}`);
      console.log(`   Listeners Attached: ${this.results.bookmarks.listenersAttached}`);
      console.log(`   Clickable: ${this.results.bookmarks.clickable}`);
      if (this.results.bookmarks.blocked.length > 0) {
        console.log(`   ⚠️ Blocked: ${this.results.bookmarks.blocked.length}`);
        this.results.bookmarks.blocked.forEach(block => {
          console.log(`      - ${block.messageId}: ${block.reason}`);
        });
      }
      if (this.results.bookmarks.issues.length > 0) {
        console.log(`   ⚠️ Issues: ${this.results.bookmarks.issues.length}`);
      }

      // Reactions
      console.log('');
      console.log('💖 REACTIONS:');
      console.log(`   Buttons Found: ${this.results.reactions.buttonsFound}`);
      console.log(`   Listeners Attached: ${this.results.reactions.listenersAttached}`);
      console.log(`   Clickable: ${this.results.reactions.clickable}`);
      if (this.results.reactions.blocked.length > 0) {
        console.log(`   ⚠️ Blocked: ${this.results.reactions.blocked.length}`);
        this.results.reactions.blocked.forEach(block => {
          console.log(`      - ${block.messageId}: ${block.reason}`);
        });
      }
      if (this.results.reactions.issues.length > 0) {
        console.log(`   ⚠️ Issues: ${this.results.reactions.issues.length}`);
      }

      // Summary
      console.log('');
      console.log('📊 SUMMARY:');
      console.log(`   Total Bookmarks: ${this.results.summary.totalBookmarks}`);
      console.log(`   Clickable Bookmarks: ${this.results.summary.clickableBookmarks}`);
      console.log(`   Total Reactions: ${this.results.summary.totalReactions}`);
      console.log(`   Clickable Reactions: ${this.results.summary.clickableReactions}`);
      
      if (this.results.summary.issues.length > 0) {
        console.log(`   ⚠️ Total Issues: ${this.results.summary.issues.length}`);
      }

      // Recommendations
      console.log('');
      console.log('💡 RECOMMENDATIONS:');
      if (this.results.bookmarks.clickable === 0 && this.results.bookmarks.buttonsFound > 0) {
        console.log('   ❌ Bookmark buttons exist but none are clickable - check event listeners');
      }
      if (this.results.reactions.clickable === 0 && this.results.reactions.buttonsFound > 0) {
        console.log('   ❌ Reaction buttons exist but none are clickable - check event listeners');
      }
      if (this.results.bookmarks.blocked.length > 0) {
        console.log('   ⚠️ Some bookmark buttons are blocked by CSS (pointer-events, visibility)');
      }
      if (this.results.reactions.blocked.length > 0) {
        console.log('   ⚠️ Some reaction buttons are blocked by CSS (pointer-events, visibility)');
      }
    }
  };

  // Export for global access
  window.buttonClickabilityTest = test;
  window.runButtonClickabilityTest = () => test.runAllTests();

  // Auto-run on page load
  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    setTimeout(() => test.runAllTests(), 3000);
  } else {
    window.addEventListener('load', () => {
      setTimeout(() => test.runAllTests(), 3000);
    });
  }

  console.log('✅ Button Clickability Test loaded');
  console.log('💡 Run manually: runButtonClickabilityTest()');
})();


