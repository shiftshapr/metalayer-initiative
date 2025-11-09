/**
 * COMP FIX VERIFICATION TEST
 * Tests all fixes applied in this session:
 * 1. Reply display (COMP version - show by default)
 * 2. Visibility tab functionality
 * 3. Avatar aura colors
 * 4. Message alignment
 * 5. Vertical line behavior
 */

(function() {
  'use strict';

  console.log('═══════════════════════════════════════════════════════════');
  console.log('🧪 COMP FIX VERIFICATION TEST');
  console.log('═══════════════════════════════════════════════════════════');
  console.log('');

  const results = {
    replyDisplay: { pass: false, issues: [], logs: [] },
    visibilityTab: { pass: false, issues: [], logs: [] },
    avatarAura: { pass: false, issues: [], logs: [] },
    messageAlignment: { pass: false, issues: [], logs: [] },
    verticalLine: { pass: false, issues: [], logs: [] }
  };

  // TEST 1: Reply Display (COMP Version)
  function testReplyDisplay() {
    console.log('📋 TEST 1: Reply Display (COMP Version)');
    console.log('─────────────────────────────────────────────────────────');
    
    const chatMessages = document.querySelector('#discuss-tab .chat-messages');
    if (!chatMessages) {
      results.replyDisplay.issues.push('Chat messages container not found');
      results.replyDisplay.logs.push('❌ Chat messages container not found');
      return;
    }

    const replies = chatMessages.querySelectorAll('.message-reply.thread-reply');
    results.replyDisplay.logs.push(`Found ${replies.length} reply messages`);

    // Check CSS: replies should have display: flex (COMP version)
    replies.forEach((reply, index) => {
      const computedStyle = window.getComputedStyle(reply);
      const display = computedStyle.display;
      const isVisible = display !== 'none' && reply.offsetHeight > 0;
      
      results.replyDisplay.logs.push(`  Reply ${index + 1}: display=${display}, visible=${isVisible}`);
      
      if (!isVisible && display === 'none') {
        results.replyDisplay.issues.push(`Reply ${index + 1} is hidden (display: none)`);
      }
    });

    // Check if replies have visible class (should be optional in COMP)
    const repliesWithVisible = chatMessages.querySelectorAll('.message-reply.thread-reply.visible');
    results.replyDisplay.logs.push(`Replies with .visible class: ${repliesWithVisible.length}`);

    // Check CSS rule
    const testReply = replies[0];
    if (testReply) {
      const computedStyle = window.getComputedStyle(testReply);
      results.replyDisplay.logs.push(`  First reply display: ${computedStyle.display}`);
      results.replyDisplay.logs.push(`  First reply margin-left: ${computedStyle.marginLeft}`);
      
      if (computedStyle.display === 'none') {
        results.replyDisplay.issues.push('CSS is hiding replies (should show by default in COMP)');
      } else {
        results.replyDisplay.pass = true;
        results.replyDisplay.logs.push('✅ Replies displaying correctly (COMP version)');
      }
    }

    if (replies.length === 0) {
      results.replyDisplay.logs.push('⚠️ No replies found to test');
    }

    console.log(results.replyDisplay.logs.join('\n'));
    console.log('');
  }

  // TEST 2: Visibility Tab
  async function testVisibilityTab() {
    console.log('📋 TEST 2: Visibility Tab Functionality');
    console.log('─────────────────────────────────────────────────────────');

    const visibilityTab = document.getElementById('visibility-tab');
    if (!visibilityTab) {
      results.visibilityTab.issues.push('Visibility tab element not found');
      results.visibilityTab.logs.push('❌ Visibility tab element not found');
      return;
    }

    // Check if updateVisibleTab function exists
    if (typeof window.updateVisibleTab === 'function') {
      results.visibilityTab.logs.push('✅ window.updateVisibleTab function exists');
      
      // Check if it's from VisibilityManager or fallback
      const isFromManager = window.updateVisibleTab.toString().includes('VisibilityManager') || 
                           !window.updateVisibleTab.toString().includes('fallback');
      if (isFromManager) {
        results.visibilityTab.logs.push('✅ updateVisibleTab from VisibilityManager (correct)');
      } else {
        results.visibilityTab.issues.push('Using fallback updateVisibleTab instead of VisibilityManager');
        results.visibilityTab.logs.push('⚠️ Using fallback updateVisibleTab');
      }
    } else {
      results.visibilityTab.issues.push('window.updateVisibleTab function not found');
      results.visibilityTab.logs.push('❌ window.updateVisibleTab function not found');
    }

    // CRITICAL FIX: Check if visibility tab is active first
    const isVisibilityTabActive = visibilityTab.classList.contains('active');
    results.visibilityTab.logs.push(`Visibility tab active: ${isVisibilityTabActive}`);
    
    if (!isVisibilityTabActive) {
      results.visibilityTab.logs.push('⚠️ Visibility tab is not active - content may not be rendered');
      // Try activating it temporarily for the test
      visibilityTab.classList.add('active');
      visibilityTab.style.display = 'flex';
    }

    // Check visibility tab content
    const visibleUsers = visibilityTab.querySelector('.visible-users');
    const visibleHeader = visibilityTab.querySelector('.visible-header');
    const itemList = visibilityTab.querySelector('.item-list');
    const visibleCount = visibilityTab.querySelector('.visible-count');

    if (visibleUsers) {
      results.visibilityTab.logs.push('✅ .visible-users container found');
    } else {
      results.visibilityTab.issues.push('.visible-users container not found');
      results.visibilityTab.logs.push('❌ .visible-users container not found');
      // Try calling updateVisibleTab if data is available
      if (window.currentVisibilityData?.active && window.updateVisibleTab) {
        results.visibilityTab.logs.push('⚠️ Attempting to populate visibility tab...');
        try {
          await window.updateVisibleTab(window.currentVisibilityData.active);
          // Re-check after update
          const visibleUsersAfter = visibilityTab.querySelector('.visible-users');
          if (visibleUsersAfter) {
            results.visibilityTab.logs.push('✅ .visible-users container found after update');
            results.visibilityTab.issues = results.visibilityTab.issues.filter(i => i !== '.visible-users container not found');
          }
        } catch (e) {
          results.visibilityTab.logs.push(`❌ Error updating visibility tab: ${e.message}`);
        }
      }
    }

    if (visibleHeader) {
      results.visibilityTab.logs.push('✅ .visible-header found');
    }

    if (itemList) {
      const itemCount = itemList.querySelectorAll('.item').length;
      results.visibilityTab.logs.push(`✅ .item-list found with ${itemCount} items`);
      
      if (itemCount > 0) {
        results.visibilityTab.pass = true;
        results.visibilityTab.logs.push('✅ Visibility tab populated with users');
      } else {
        results.visibilityTab.issues.push('Visibility tab has no user items');
        results.visibilityTab.logs.push('⚠️ Visibility tab empty (no user items)');
      }
    } else {
      results.visibilityTab.issues.push('.item-list not found');
    }

    if (visibleCount) {
      const countText = visibleCount.textContent.trim();
      results.visibilityTab.logs.push(`Visible count text: "${countText}"`);
      
      if (countText === '0 visible' && itemList && itemList.querySelectorAll('.item').length === 0) {
        // This is OK if there are actually no users
        results.visibilityTab.logs.push('⚠️ Showing "0 visible" - check if users are actually present');
      }
    }

    console.log(results.visibilityTab.logs.join('\n'));
    console.log('');
  }

  // TEST 3: Avatar Aura Colors
  function testAvatarAura() {
    console.log('📋 TEST 3: Avatar Aura Colors');
    console.log('─────────────────────────────────────────────────────────');

    const chatMessages = document.querySelector('#discuss-tab .chat-messages');
    if (!chatMessages) {
      results.avatarAura.issues.push('Chat messages container not found');
      return;
    }

    const avatars = chatMessages.querySelectorAll('.avatar-container [style*="background-color"]');
    results.avatarAura.logs.push(`Found ${avatars.length} avatar aura elements`);

    let whiteAuras = 0;
    let coloredAuras = 0;

    avatars.forEach((avatar, index) => {
      const style = avatar.getAttribute('style') || '';
      const bgColorMatch = style.match(/background-color:\s*([^;]+)/);
      
      if (bgColorMatch) {
        const bgColor = bgColorMatch[1].trim();
        const isWhite = bgColor.toLowerCase() === '#ffffff' || bgColor.toLowerCase() === 'rgb(255, 255, 255)';
        
        results.avatarAura.logs.push(`  Avatar ${index + 1}: ${bgColor} ${isWhite ? '(WHITE - ISSUE!)' : '(OK)'}`);
        
        if (isWhite) {
          whiteAuras++;
        } else {
          coloredAuras++;
        }
      }
    });

    // Check AvatarUtils aura color priority
    if (window.AvatarUtils && typeof window.AvatarUtils.createUnifiedAvatar === 'function') {
      results.avatarAura.logs.push('✅ AvatarUtils.createUnifiedAvatar available');
      
      // Check source code for priority order
      const source = window.AvatarUtils.createUnifiedAvatar.toString();
      const camelCaseFirst = source.includes('user.auraColor || user.aura_color') || 
                             source.includes('auraColor || user.aura_color');
      
      if (camelCaseFirst) {
        results.avatarAura.logs.push('✅ AvatarUtils checks camelCase first (correct)');
      } else {
        results.avatarAura.issues.push('AvatarUtils may not check camelCase first');
        results.avatarAura.logs.push('⚠️ AvatarUtils aura color priority may be incorrect');
      }
    }

    if (whiteAuras > 0) {
      results.avatarAura.issues.push(`${whiteAuras} avatars have white aura (#ffffff) - should have colors`);
      results.avatarAura.logs.push(`⚠️ Found ${whiteAuras} white auras (ISSUE)`);
    }

    if (coloredAuras > 0 && whiteAuras === 0) {
      results.avatarAura.pass = true;
      results.avatarAura.logs.push('✅ All avatar auras have colors (not white)');
    } else if (coloredAuras === 0) {
      results.avatarAura.issues.push('No colored auras found');
      results.avatarAura.logs.push('❌ No colored auras found');
    }

    console.log(results.avatarAura.logs.join('\n'));
    console.log('');
  }

  // TEST 4: Message Alignment
  function testMessageAlignment() {
    console.log('📋 TEST 4: Message Alignment');
    console.log('─────────────────────────────────────────────────────────');

    const chatMessages = document.querySelector('#discuss-tab .chat-messages');
    if (!chatMessages) {
      results.messageAlignment.issues.push('Chat messages container not found');
      return;
    }

    const computedStyle = window.getComputedStyle(chatMessages);
    
    results.messageAlignment.logs.push(`Padding: ${computedStyle.padding}`);
    results.messageAlignment.logs.push(`Margin: ${computedStyle.margin}`);
    results.messageAlignment.logs.push(`Padding-top: ${computedStyle.paddingTop}`);
    results.messageAlignment.logs.push(`Margin-top: ${computedStyle.marginTop}`);
    results.messageAlignment.logs.push(`Flex-direction: ${computedStyle.flexDirection}`);
    results.messageAlignment.logs.push(`Align-content: ${computedStyle.alignContent}`);

    // Check for zero padding/margin
    const hasPadding = computedStyle.paddingTop !== '0px' || computedStyle.padding !== '0px';
    const hasMargin = computedStyle.marginTop !== '0px' || computedStyle.margin !== '0px';

    if (hasPadding) {
      results.messageAlignment.issues.push(`Chat messages has padding: ${computedStyle.padding}`);
    }

    if (hasMargin) {
      results.messageAlignment.issues.push(`Chat messages has margin: ${computedStyle.margin}`);
    }

    // Check first message (visually at top with column-reverse)
    const messages = chatMessages.querySelectorAll('.message');
    if (messages.length > 0) {
      const lastMessage = messages[messages.length - 1]; // Last in DOM = first visually
      const msgStyle = window.getComputedStyle(lastMessage);
      results.messageAlignment.logs.push(`First visible message margin-top: ${msgStyle.marginTop}`);
      results.messageAlignment.logs.push(`First visible message padding-top: ${msgStyle.paddingTop}`);
      
      if (msgStyle.marginTop !== '0px') {
        results.messageAlignment.issues.push(`First message has margin-top: ${msgStyle.marginTop}`);
      }
    }

    if (!hasPadding && !hasMargin) {
      results.messageAlignment.pass = true;
      results.messageAlignment.logs.push('✅ Messages have zero padding/margin (top-aligned)');
    } else {
      results.messageAlignment.logs.push('⚠️ Messages have spacing that prevents top alignment');
    }

    console.log(results.messageAlignment.logs.join('\n'));
    console.log('');
  }

  // TEST 5: Vertical Line
  function testVerticalLine() {
    console.log('📋 TEST 5: Vertical Line Behavior');
    console.log('─────────────────────────────────────────────────────────');

    const chatMessages = document.querySelector('#discuss-tab .chat-messages');
    if (!chatMessages) {
      results.verticalLine.issues.push('Chat messages container not found');
      return;
    }

    const threadStarters = chatMessages.querySelectorAll('.message.thread-starter.has-replies');
    results.verticalLine.logs.push(`Found ${threadStarters.length} thread starters with has-replies class`);

    threadStarters.forEach((starter, index) => {
      const msgId = starter.getAttribute('data-message-id');
      const threadExpanded = starter.getAttribute('data-thread-expanded');
      const replies = chatMessages.querySelectorAll(
        `.message-reply.thread-reply[data-conversation-id="${starter.getAttribute('data-conversation-id')}"]`
      );
      const visibleReplies = chatMessages.querySelectorAll(
        `.message-reply.thread-reply[data-conversation-id="${starter.getAttribute('data-conversation-id')}"].visible`
      );

      results.verticalLine.logs.push(`  Thread ${index + 1} (${msgId}):`);
      results.verticalLine.logs.push(`    data-thread-expanded: ${threadExpanded}`);
      results.verticalLine.logs.push(`    Total replies: ${replies.length}`);
      results.verticalLine.logs.push(`    Visible replies: ${visibleReplies.length}`);

      // Check if vertical line should be visible
      const shouldShowLine = threadExpanded === 'true';
      
      // Check computed style of ::after pseudo-element
      try {
        const computedStyle = window.getComputedStyle(starter, '::after');
        const lineContent = computedStyle.content;
        const lineDisplay = computedStyle.display;
        const lineVisible = lineContent !== 'none' && lineDisplay !== 'none';
        
        results.verticalLine.logs.push(`    Line computed content: ${lineContent}`);
        results.verticalLine.logs.push(`    Line computed display: ${lineDisplay}`);
        results.verticalLine.logs.push(`    Line should be visible: ${shouldShowLine}`);
        results.verticalLine.logs.push(`    Line is visible: ${lineVisible}`);

        if (shouldShowLine && !lineVisible) {
          results.verticalLine.issues.push(`Thread ${msgId}: Should show line but it's hidden`);
        } else if (!shouldShowLine && lineVisible) {
          results.verticalLine.issues.push(`Thread ${msgId}: Should hide line but it's visible`);
        } else if (shouldShowLine && lineVisible) {
          results.verticalLine.logs.push(`    ✅ Line correctly visible`);
        } else {
          results.verticalLine.logs.push(`    ✅ Line correctly hidden`);
        }
      } catch (e) {
        results.verticalLine.logs.push(`    ⚠️ Could not check computed style: ${e.message}`);
      }
    });

    if (threadStarters.length === 0) {
      results.verticalLine.logs.push('⚠️ No thread starters found to test');
    } else if (results.verticalLine.issues.length === 0) {
      results.verticalLine.pass = true;
    }

    console.log(results.verticalLine.logs.join('\n'));
    console.log('');
  }

  // Run all tests
  async function runAllTests() {
    testReplyDisplay();
    await testVisibilityTab(); // Make async since it may call updateVisibleTab
    testAvatarAura();
    testMessageAlignment();
    testVerticalLine();

    // Summary
    console.log('═══════════════════════════════════════════════════════════');
    console.log('📊 TEST SUMMARY');
    console.log('═══════════════════════════════════════════════════════════');
    console.log('');

    const tests = [
      { name: 'Reply Display (COMP)', result: results.replyDisplay },
      { name: 'Visibility Tab', result: results.visibilityTab },
      { name: 'Avatar Aura Colors', result: results.avatarAura },
      { name: 'Message Alignment', result: results.messageAlignment },
      { name: 'Vertical Line', result: results.verticalLine }
    ];

    tests.forEach(test => {
      const status = test.result.pass ? '✅ PASS' : '❌ FAIL';
      console.log(`${status}: ${test.name}`);
      if (test.result.issues.length > 0) {
        test.result.issues.forEach(issue => {
          console.log(`  ❌ ${issue}`);
        });
      }
    });

    console.log('');
    const passedCount = tests.filter(t => t.result.pass).length;
    const totalCount = tests.length;
    console.log(`📊 Results: ${passedCount}/${totalCount} tests passed`);

    if (passedCount === totalCount) {
      console.log('✅✅✅ ALL TESTS PASSED ✅✅✅');
    } else {
      console.log(`⚠️ ${totalCount - passedCount} test(s) failed - see issues above`);
    }

    console.log('');
    console.log('═══════════════════════════════════════════════════════════');

    return results;
  }

  // Export to window FIRST (before auto-run)
  if (typeof window !== 'undefined') {
    window.fixVerificationTest = {
      run: runAllTests,
      results: results
    };
    console.log('✅ Test script loaded. Run: window.fixVerificationTest.run()');
    
    // Auto-run after a delay to ensure DOM is ready
    if (window.location) {
      setTimeout(() => {
        console.log('🧪 Auto-running verification tests...');
        runAllTests();
      }, 2000); // Wait 2 seconds for DOM to be ready
    }
  }

})();

