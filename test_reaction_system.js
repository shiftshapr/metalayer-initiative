// Test reaction system
console.log('🧪 TESTING REACTION SYSTEM');

// Test 1: Check if reaction buttons exist
const reactionButtons = document.querySelectorAll('.reaction-btn');
console.log(`Found ${reactionButtons.length} reaction buttons`);

if (reactionButtons.length > 0) {
  const firstButton = reactionButtons[0];
  console.log('First reaction button:', {
    messageId: firstButton.dataset.messageId,
    visible: firstButton.offsetParent !== null,
    display: window.getComputedStyle(firstButton).display,
    position: firstButton.getBoundingClientRect()
  });
  
  // Test 2: Simulate click
  console.log('Simulating click on first reaction button...');
  firstButton.click();
  
  // Test 3: Check if modal was created
  setTimeout(() => {
    const modal = document.getElementById('reactions-modal');
    if (modal) {
      console.log('✅ Modal created successfully');
      console.log('Modal styles:', {
        display: window.getComputedStyle(modal).display,
        position: window.getComputedStyle(modal).position,
        zIndex: window.getComputedStyle(modal).zIndex,
        visibility: window.getComputedStyle(modal).visibility,
        opacity: window.getComputedStyle(modal).opacity
      });
      
      // Clean up
      modal.remove();
      console.log('✅ Modal cleaned up');
    } else {
      console.log('❌ Modal not created');
    }
  }, 100);
} else {
  console.log('❌ No reaction buttons found');
}

console.log('🧪 REACTION SYSTEM TEST COMPLETE');

