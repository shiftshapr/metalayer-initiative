/**
 * SD2: Test Reactions Modal Fix
 * Testing the showReactionModal function implementation
 */

console.log('🧪 SD2: Testing Reactions Modal Fix...');

// Test 1: Check if showReactionModal function exists
function testShowReactionModalExists() {
  console.log('🧪 TEST 1: Checking if showReactionModal function exists...');
  
  if (typeof window.showReactionModal === 'function') {
    console.log('✅ TEST 1 PASSED: showReactionModal function is available');
    return true;
  } else {
    console.log('❌ TEST 1 FAILED: showReactionModal function not found');
    return false;
  }
}

// Test 2: Check if function can be called without errors
function testShowReactionModalCallable() {
  console.log('🧪 TEST 2: Testing if showReactionModal can be called...');
  
  try {
    // Create a mock reaction button for testing
    const mockReactionBtn = document.createElement('button');
    mockReactionBtn.className = 'reaction-btn';
    mockReactionBtn.setAttribute('data-message-id', 'test-message-123');
    mockReactionBtn.textContent = '🔘';
    document.body.appendChild(mockReactionBtn);
    
    // Call the function
    window.showReactionModal('test-message-123');
    
    // Check if modal was created
    const modal = document.getElementById('reactions-modal');
    if (modal) {
      console.log('✅ TEST 2 PASSED: showReactionModal created modal successfully');
      console.log('✅ Modal HTML:', modal.innerHTML);
      console.log('✅ Modal display style:', modal.style.display);
      console.log('✅ Modal position:', modal.style.position);
      console.log('✅ Modal z-index:', modal.style.zIndex);
      
      // Clean up
      modal.remove();
      mockReactionBtn.remove();
      return true;
    } else {
      console.log('❌ TEST 2 FAILED: Modal was not created');
      mockReactionBtn.remove();
      return false;
    }
  } catch (error) {
    console.log('❌ TEST 2 FAILED: Error calling showReactionModal:', error);
    return false;
  }
}

// Test 3: Check modal functionality
function testModalFunctionality() {
  console.log('🧪 TEST 3: Testing modal functionality...');
  
  try {
    // Create a mock reaction button
    const mockReactionBtn = document.createElement('button');
    mockReactionBtn.className = 'reaction-btn';
    mockReactionBtn.setAttribute('data-message-id', 'test-message-456');
    mockReactionBtn.textContent = '🔘';
    document.body.appendChild(mockReactionBtn);
    
    // Show modal
    window.showReactionModal('test-message-456');
    
    const modal = document.getElementById('reactions-modal');
    if (!modal) {
      console.log('❌ TEST 3 FAILED: Modal not found');
      mockReactionBtn.remove();
      return false;
    }
    
    // Check if reaction options are present
    const reactionOptions = modal.querySelectorAll('.reaction-option');
    const expectedReactions = ['👍', '❓', '🔁', '🔗', '⚠️', '🙅'];
    
    if (reactionOptions.length === expectedReactions.length) {
      console.log('✅ TEST 3 PASSED: All reaction options present');
      console.log('✅ Reaction options count:', reactionOptions.length);
      
      // Test clicking a reaction
      const firstOption = reactionOptions[0];
      const originalText = firstOption.textContent;
      console.log('✅ Testing click on reaction:', originalText);
      
      // Simulate click
      firstOption.click();
      
      // Check if modal was removed after click
      setTimeout(() => {
        const modalAfterClick = document.getElementById('reactions-modal');
        if (!modalAfterClick) {
          console.log('✅ TEST 3 PASSED: Modal removed after reaction selection');
        } else {
          console.log('❌ TEST 3 FAILED: Modal not removed after click');
        }
        
        // Clean up
        mockReactionBtn.remove();
      }, 100);
      
      return true;
    } else {
      console.log('❌ TEST 3 FAILED: Incorrect number of reaction options');
      console.log('Expected:', expectedReactions.length, 'Found:', reactionOptions.length);
      mockReactionBtn.remove();
      return false;
    }
  } catch (error) {
    console.log('❌ TEST 3 FAILED: Error testing modal functionality:', error);
    return false;
  }
}

// Test 4: Check CSS classes and styling
function testModalStyling() {
  console.log('🧪 TEST 4: Testing modal styling...');
  
  try {
    // Create a mock reaction button
    const mockReactionBtn = document.createElement('button');
    mockReactionBtn.className = 'reaction-btn';
    mockReactionBtn.setAttribute('data-message-id', 'test-message-789');
    mockReactionBtn.textContent = '🔘';
    document.body.appendChild(mockReactionBtn);
    
    // Show modal
    window.showReactionModal('test-message-789');
    
    const modal = document.getElementById('reactions-modal');
    if (!modal) {
      console.log('❌ TEST 4 FAILED: Modal not found');
      mockReactionBtn.remove();
      return false;
    }
    
    // Check CSS classes
    const hasReactionModalClass = modal.classList.contains('reaction-modal');
    const hasReactionOptions = modal.querySelector('.reaction-options') !== null;
    
    if (hasReactionModalClass && hasReactionOptions) {
      console.log('✅ TEST 4 PASSED: Modal has correct CSS classes');
      console.log('✅ Modal classes:', modal.className);
      console.log('✅ Modal background:', modal.style.background);
      console.log('✅ Modal border:', modal.style.border);
      console.log('✅ Modal border-radius:', modal.style.borderRadius);
      console.log('✅ Modal box-shadow:', modal.style.boxShadow);
      
      // Clean up
      modal.remove();
      mockReactionBtn.remove();
      return true;
    } else {
      console.log('❌ TEST 4 FAILED: Modal missing CSS classes');
      console.log('Has reaction-modal class:', hasReactionModalClass);
      console.log('Has reaction-options:', hasReactionOptions);
      modal.remove();
      mockReactionBtn.remove();
      return false;
    }
  } catch (error) {
    console.log('❌ TEST 4 FAILED: Error testing modal styling:', error);
    return false;
  }
}

// Run all tests
function runAllTests() {
  console.log('🚀 SD2: Running all reactions modal tests...');
  
  const results = {
    test1: testShowReactionModalExists(),
    test2: testShowReactionModalCallable(),
    test3: testModalFunctionality(),
    test4: testModalStyling()
  };
  
  const passedTests = Object.values(results).filter(result => result === true).length;
  const totalTests = Object.keys(results).length;
  
  console.log('📊 SD2: Test Results Summary:');
  console.log(`✅ Passed: ${passedTests}/${totalTests}`);
  console.log(`❌ Failed: ${totalTests - passedTests}/${totalTests}`);
  
  if (passedTests === totalTests) {
    console.log('🎉 SD2: ALL TESTS PASSED! Reactions modal fix is working correctly.');
  } else {
    console.log('⚠️ SD2: Some tests failed. Check the logs above for details.');
  }
  
  return results;
}

// Export for global access
window.testReactionsModal = {
  runAllTests,
  testShowReactionModalExists,
  testShowReactionModalCallable,
  testModalFunctionality,
  testModalStyling
};

console.log('✅ SD2: Reactions modal test suite loaded. Run window.testReactionsModal.runAllTests() to test.');

