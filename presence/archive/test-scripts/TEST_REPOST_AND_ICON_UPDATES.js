/**
 * COMPREHENSIVE TEST: Repost and Icon Updates
 * Tests all icon updates, repost functionality, and database changes
 */

(function() {
  'use strict';
  
  const results = {
    timestamp: new Date().toISOString(),
    tests: {},
    summary: {
      passed: 0,
      failed: 0,
      warnings: 0
    }
  };
  
  console.log('🧪 === REPOST AND ICON UPDATES TEST ===');
  
  // Test 1: Verify icon ordering and presence
  function testIconOrdering() {
    console.log('\n📋 TEST 1: Icon Ordering and Presence');
    console.log('─────────────────────────────────────────────────────────');
    
    const testResults = {
      name: 'Icon Ordering and Presence',
      passed: true,
      issues: []
    };
    
    try {
      const messageFooters = document.querySelectorAll('.message-footer');
      if (messageFooters.length === 0) {
        testResults.passed = false;
        testResults.issues.push('No message footers found');
        console.log('⚠️  No message footers found');
      } else {
        console.log(`✅ Found ${messageFooters.length} message footer(s)`);
        
        let testedCount = 0;
        messageFooters.forEach((footer, index) => {
          const buttons = footer.querySelectorAll('button');
          const buttonTypes = Array.from(buttons).map(btn => {
            if (btn.classList.contains('inline-reply-btn')) return 'reply';
            if (btn.classList.contains('repost-btn')) return 'repost';
            if (btn.classList.contains('reaction-btn')) return 'reaction';
            if (btn.classList.contains('bookmark-btn')) return 'bookmark';
            if (btn.classList.contains('share-btn')) return 'share';
            return 'unknown';
          }).filter(Boolean);
          
          // Check order: reply, repost, reaction, bookmark, share
          const expectedOrder = ['reply', 'repost', 'reaction', 'bookmark', 'share'];
          const actualOrder = buttonTypes;
          
          console.log(`\n  Footer ${index + 1}:`);
          console.log(`    Buttons found: ${actualOrder.join(', ')}`);
          console.log(`    Expected order: ${expectedOrder.join(', ')}`);
          
          // Check if all expected buttons are present
          const hasAllButtons = expectedOrder.every(type => actualOrder.includes(type));
          if (!hasAllButtons) {
            testResults.passed = false;
            testResults.issues.push(`Footer ${index + 1}: Missing expected buttons`);
            console.log(`    ❌ Missing expected buttons`);
          } else {
            console.log(`    ✅ All expected buttons present`);
          }
          
          // Check order (allow for missing buttons but order must be correct for present ones)
          const filteredOrder = actualOrder.filter(type => expectedOrder.includes(type));
          const isOrdered = filteredOrder.every((type, idx) => {
            const expectedIdx = expectedOrder.indexOf(type);
            return idx <= expectedIdx || !expectedOrder.slice(0, idx).includes(type);
          });
          
          if (!isOrdered && hasAllButtons) {
            testResults.passed = false;
            testResults.issues.push(`Footer ${index + 1}: Buttons not in correct order`);
            console.log(`    ❌ Buttons not in correct order`);
          } else if (hasAllButtons) {
            console.log(`    ✅ Buttons in correct order`);
          }
          
          testedCount++;
        });
        
        console.log(`\n✅ Tested ${testedCount} message footer(s)`);
      }
    } catch (error) {
      testResults.passed = false;
      testResults.issues.push(`Error: ${error.message}`);
      console.error('❌ Error testing icon ordering:', error);
    }
    
    results.tests.iconOrdering = testResults;
    if (testResults.passed) {
      results.summary.passed++;
    } else {
      results.summary.failed++;
    }
    
    return testResults;
  }
  
  // Test 2: Verify replies count display
  function testRepliesCount() {
    console.log('\n📋 TEST 2: Replies Count Display');
    console.log('─────────────────────────────────────────────────────────');
    
    const testResults = {
      name: 'Replies Count Display',
      passed: true,
      issues: []
    };
    
    try {
      const replyButtons = document.querySelectorAll('.inline-reply-btn');
      if (replyButtons.length === 0) {
        testResults.passed = false;
        testResults.issues.push('No reply buttons found');
        console.log('⚠️  No reply buttons found');
      } else {
        console.log(`✅ Found ${replyButtons.length} reply button(s)`);
        
        let withCount = 0;
        replyButtons.forEach((btn, index) => {
          const countSpan = btn.querySelector('.icon-count');
          const hasCount = countSpan !== null;
          
          if (hasCount) {
            const countValue = countSpan.textContent;
            console.log(`  Button ${index + 1}: Count = ${countValue}`);
            withCount++;
          } else {
            console.log(`  Button ${index + 1}: No count displayed`);
          }
        });
        
        console.log(`\n✅ Found ${withCount} button(s) with reply count`);
        
        // Check that thread toggle button is NOT present
        const threadToggleButtons = document.querySelectorAll('.thread-toggle-btn');
        if (threadToggleButtons.length > 0) {
          testResults.passed = false;
          testResults.issues.push(`Found ${threadToggleButtons.length} thread toggle button(s) - should be removed`);
          console.log(`❌ Found ${threadToggleButtons.length} thread toggle button(s) - should be removed`);
        } else {
          console.log(`✅ No thread toggle buttons found (correct)`);
        }
      }
    } catch (error) {
      testResults.passed = false;
      testResults.issues.push(`Error: ${error.message}`);
      console.error('❌ Error testing replies count:', error);
    }
    
    results.tests.repliesCount = testResults;
    if (testResults.passed) {
      results.summary.passed++;
    } else {
      results.summary.failed++;
    }
    
    return testResults;
  }
  
  // Test 3: Verify reaction icon (heart SVG)
  function testReactionIcon() {
    console.log('\n📋 TEST 3: Reaction Icon (Heart SVG)');
    console.log('─────────────────────────────────────────────────────────');
    
    const testResults = {
      name: 'Reaction Icon (Heart SVG)',
      passed: true,
      issues: []
    };
    
    try {
      const reactionButtons = document.querySelectorAll('.reaction-btn');
      if (reactionButtons.length === 0) {
        testResults.passed = false;
        testResults.issues.push('No reaction buttons found');
        console.log('⚠️  No reaction buttons found');
      } else {
        console.log(`✅ Found ${reactionButtons.length} reaction button(s)`);
        
        let withHeartIcon = 0;
        let withEmoji = 0;
        reactionButtons.forEach((btn, index) => {
          const html = btn.innerHTML;
          const hasSVG = html.includes('<svg') && html.includes('viewBox="0 0 24 24"');
          const hasEmoji = /[🔘👍❓🔁🔗⚠️🙅]/.test(html);
          
          if (hasSVG) {
            console.log(`  Button ${index + 1}: ✅ Has SVG icon`);
            withHeartIcon++;
          } else if (hasEmoji) {
            console.log(`  Button ${index + 1}: ⚠️  Still using emoji`);
            withEmoji++;
            testResults.passed = false;
            testResults.issues.push(`Button ${index + 1}: Still using emoji instead of SVG`);
          } else {
            console.log(`  Button ${index + 1}: ⚠️  No icon found`);
          }
        });
        
        console.log(`\n✅ ${withHeartIcon} button(s) with SVG icon`);
        if (withEmoji > 0) {
          console.log(`⚠️  ${withEmoji} button(s) still using emoji`);
        }
      }
    } catch (error) {
      testResults.passed = false;
      testResults.issues.push(`Error: ${error.message}`);
      console.error('❌ Error testing reaction icon:', error);
    }
    
    results.tests.reactionIcon = testResults;
    if (testResults.passed) {
      results.summary.passed++;
    } else {
      results.summary.failed++;
    }
    
    return testResults;
  }
  
  // Test 4: Verify repost button presence and handler
  function testRepostButton() {
    console.log('\n📋 TEST 4: Repost Button');
    console.log('─────────────────────────────────────────────────────────');
    
    const testResults = {
      name: 'Repost Button',
      passed: true,
      issues: []
    };
    
    try {
      const repostButtons = document.querySelectorAll('.repost-btn');
      if (repostButtons.length === 0) {
        testResults.passed = false;
        testResults.issues.push('No repost buttons found');
        console.log('⚠️  No repost buttons found');
      } else {
        console.log(`✅ Found ${repostButtons.length} repost button(s)`);
        
        repostButtons.forEach((btn, index) => {
          const hasSVG = btn.innerHTML.includes('<svg');
          const hasIcon = btn.innerHTML.includes('viewBox="0 0 24 24"');
          
          if (hasSVG && hasIcon) {
            console.log(`  Button ${index + 1}: ✅ Has repost SVG icon`);
          } else {
            console.log(`  Button ${index + 1}: ⚠️  Missing SVG icon`);
            testResults.passed = false;
            testResults.issues.push(`Button ${index + 1}: Missing SVG icon`);
          }
          
          // Check if handler function exists
          const messageId = btn.dataset.messageId;
          if (messageId) {
            console.log(`    Message ID: ${messageId}`);
          }
        });
        
        // Check if handler function exists
        if (typeof window.handleRepost === 'function') {
          console.log(`✅ handleRepost function exists`);
        } else {
          console.log(`⚠️  handleRepost function not found`);
          testResults.passed = false;
          testResults.issues.push('handleRepost function not found');
        }
      }
    } catch (error) {
      testResults.passed = false;
      testResults.issues.push(`Error: ${error.message}`);
      console.error('❌ Error testing repost button:', error);
    }
    
    results.tests.repostButton = testResults;
    if (testResults.passed) {
      results.summary.passed++;
    } else {
      results.summary.failed++;
    }
    
    return testResults;
  }
  
  // Test 5: Verify CSS spacing
  function testIconSpacing() {
    console.log('\n📋 TEST 5: Icon Spacing (CSS)');
    console.log('─────────────────────────────────────────────────────────');
    
    const testResults = {
      name: 'Icon Spacing',
      passed: true,
      issues: []
    };
    
    try {
      const messageFooter = document.querySelector('.message-footer');
      if (!messageFooter) {
        testResults.passed = false;
        testResults.issues.push('No message footer found');
        console.log('⚠️  No message footer found');
      } else {
        const styles = window.getComputedStyle(messageFooter);
        const justifyContent = styles.justifyContent;
        const display = styles.display;
        
        console.log(`  Footer styles:`);
        console.log(`    display: ${display}`);
        console.log(`    justify-content: ${justifyContent}`);
        
        if (justifyContent === 'space-between' || justifyContent === 'space-around') {
          console.log(`✅ Icons spaced evenly (${justifyContent})`);
        } else {
          console.log(`⚠️  Icons not evenly spaced (${justifyContent})`);
          testResults.passed = false;
          testResults.issues.push(`justify-content is ${justifyContent}, expected space-between or space-around`);
        }
        
        // Check button flex properties
        const buttons = messageFooter.querySelectorAll('button');
        if (buttons.length > 0) {
          const firstButtonStyles = window.getComputedStyle(buttons[0]);
          const flex = firstButtonStyles.flex;
          
          console.log(`    Button flex: ${flex}`);
          if (flex === '1' || flex === '1 1 0%') {
            console.log(`✅ Buttons have flex: 1`);
          } else {
            console.log(`⚠️  Buttons flex is ${flex}, expected 1`);
          }
        }
      }
    } catch (error) {
      testResults.passed = false;
      testResults.issues.push(`Error: ${error.message}`);
      console.error('❌ Error testing icon spacing:', error);
    }
    
    results.tests.iconSpacing = testResults;
    if (testResults.passed) {
      results.summary.passed++;
    } else {
      results.summary.failed++;
    }
    
    return testResults;
  }
  
  // Test 6: Verify quote post functionality
  function testQuotePost() {
    console.log('\n📋 TEST 6: Quote Post Functionality');
    console.log('─────────────────────────────────────────────────────────');
    
    const testResults = {
      name: 'Quote Post Functionality',
      passed: true,
      issues: []
    };
    
    try {
      // Check if functions exist
      const functions = {
        'handleRepost': typeof window.handleRepost === 'function',
        'sendQuotePost': typeof window.sendQuotePost === 'function',
        'showQuotePostModal': typeof window.showQuotePostModal === 'function'
      };
      
      console.log('  Function availability:');
      Object.entries(functions).forEach(([name, exists]) => {
        if (exists) {
          console.log(`    ✅ ${name} exists`);
        } else {
          console.log(`    ❌ ${name} not found`);
          testResults.passed = false;
          testResults.issues.push(`${name} function not found`);
        }
      });
      
    } catch (error) {
      testResults.passed = false;
      testResults.issues.push(`Error: ${error.message}`);
      console.error('❌ Error testing quote post:', error);
    }
    
    results.tests.quotePost = testResults;
    if (testResults.passed) {
      results.summary.passed++;
    } else {
      results.summary.failed++;
    }
    
    return testResults;
  }
  
  // Run all tests
  function runAllTests() {
    console.log('🧪 Running comprehensive tests...\n');
    
    testIconOrdering();
    testRepliesCount();
    testReactionIcon();
    testRepostButton();
    testIconSpacing();
    testQuotePost();
    
    // Summary
    console.log('\n═══════════════════════════════════════════════════════════');
    console.log('📊 TEST SUMMARY');
    console.log('═══════════════════════════════════════════════════════════');
    console.log(`\n✅ Passed: ${results.summary.passed}`);
    console.log(`❌ Failed: ${results.summary.failed}`);
    console.log(`⚠️  Warnings: ${results.summary.warnings}`);
    
    if (results.summary.failed > 0) {
      console.log(`\n⚠️  ${results.summary.failed} test(s) failed - see issues above`);
      
      Object.entries(results.tests).forEach(([name, test]) => {
        if (!test.passed && test.issues.length > 0) {
          console.log(`\n  ${name}:`);
          test.issues.forEach(issue => console.log(`    - ${issue}`));
        }
      });
    }
    
    console.log('\n═══════════════════════════════════════════════════════════');
    
    return results;
  }
  
  // Auto-run if DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      setTimeout(() => runAllTests(), 1000);
    });
  } else {
    setTimeout(() => runAllTests(), 1000);
  }
  
  // Export for manual use
  window.testRepostAndIconUpdates = runAllTests;
  window.repostAndIconTestResults = results;
  
})();


