// Test script to debug reaction loading issues
console.log('🔍 TESTING: Reaction loading functionality');

// Test 1: Check if loadMessageReactions function exists
console.log('🔍 TEST 1: window.loadMessageReactions exists:', typeof window.loadMessageReactions);

// Test 2: Check if updateReactionDisplay function exists  
console.log('🔍 TEST 2: window.updateReactionDisplay exists:', typeof window.updateReactionDisplay);

// Test 3: Check current user
console.log('🔍 TEST 3: window.currentUser:', window.currentUser);

// Test 4: Check reaction buttons in DOM
const reactionButtons = document.querySelectorAll('.reaction-btn');
console.log('🔍 TEST 4: Found reaction buttons:', reactionButtons.length);

reactionButtons.forEach((btn, index) => {
  const messageId = btn.dataset.messageId;
  const countSpan = btn.querySelector('.icon-count');
  console.log(`🔍 TEST 4: Button ${index}:`, {
    messageId: messageId,
    hasCountSpan: !!countSpan,
    countText: countSpan ? countSpan.textContent : 'no span',
    buttonText: btn.textContent
  });
});

// Test 5: Try to load reactions for first message
if (reactionButtons.length > 0) {
  const firstButton = reactionButtons[0];
  const messageId = firstButton.dataset.messageId;
  console.log('🔍 TEST 5: Testing loadMessageReactions for message:', messageId);
  
  if (typeof window.loadMessageReactions === 'function') {
    window.loadMessageReactions(messageId, firstButton).then(() => {
      console.log('✅ TEST 5: loadMessageReactions completed');
      const countSpan = firstButton.querySelector('.icon-count');
      console.log('🔍 TEST 5: After load - count span:', countSpan ? countSpan.textContent : 'no span');
    }).catch(error => {
      console.error('❌ TEST 5: loadMessageReactions failed:', error);
    });
  } else {
    console.error('❌ TEST 5: loadMessageReactions function not available');
  }
}

console.log('🔍 TESTING: Complete');

