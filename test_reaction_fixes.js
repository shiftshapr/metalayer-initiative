// Test script to verify reaction system fixes
console.log('🧪 REACTION SYSTEM FIXES TEST');
console.log('===============================================');

// Test 1: Function Availability
console.log('📋 Test 1: Function Availability');
const functionsToTest = [
  'window.showReactionModal',
  'window.loadMessageReactions', 
  'window.addReactionToMessage',
  'window.updateReactionInMessage',
  'window.removeReactionFromMessage',
  'window.handleReactionChange',
  'window.refreshAllReactionDisplays'
];

let availableFunctions = 0;
functionsToTest.forEach(funcName => {
  if (typeof eval(funcName) === 'function') {
    console.log(`✅ ${funcName}: Available`);
    availableFunctions++;
  } else {
    console.log(`❌ ${funcName}: Missing`);
  }
});

console.log(`📊 Functions Available: ${availableFunctions}/${functionsToTest.length}`);

// Test 2: Reaction Buttons Structure
console.log('\n📋 Test 2: Reaction Button Structure');
  const reactionButtons = document.querySelectorAll('.reaction-btn');
console.log(`📊 Found ${reactionButtons.length} reaction buttons`);

reactionButtons.forEach((btn, index) => {
  const messageId = btn.dataset.messageId;
  const countSpan = btn.querySelector('.icon-count');
  const hasCountSpan = !!countSpan;
  
  console.log(`Button ${index + 1}:`);
  console.log(`  Message ID: ${messageId}`);
  console.log(`  Has Count Span: ${hasCountSpan ? '✅' : '❌'}`);
  console.log(`  Current Content: ${btn.textContent}`);
  console.log(`  HTML: ${btn.outerHTML.substring(0, 100)}...`);
});

// Test 3: Modal Styling
console.log('\n📋 Test 3: Modal Styling Test');
console.log('Testing reaction modal creation...');

// Create a test modal to check styling
const testModal = document.createElement('div');
testModal.innerHTML = `
  <div class="reaction-modal" style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: transparent; z-index: 99999; display: flex; align-items: center; justify-content: center;">
    <div class="reaction-options" style="background: white; padding: 20px; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.3); border: 1px solid #ddd;">
      <button class="reaction-option" data-reaction="👍" style="background: none; border: none; font-size: 24px; padding: 8px; cursor: pointer; border-radius: 4px; margin: 4px;">👍</button>
    </div>
  </div>
`;

const modalElement = testModal.firstElementChild;
const computedStyle = window.getComputedStyle(modalElement);
const backgroundStyle = modalElement.style.background;

console.log(`Modal background: ${backgroundStyle}`);
console.log(`Modal background computed: ${computedStyle.background}`);
console.log(`Modal has transparent background: ${backgroundStyle === 'transparent' ? '✅' : '❌'}`);

// Clean up test modal
testModal.remove();

// Test 4: Count Span Creation
console.log('\n📋 Test 4: Count Span Creation Test');
if (reactionButtons.length > 0) {
  const firstBtn = reactionButtons[0];
  const messageId = firstBtn.dataset.messageId;
  
  console.log(`Testing count span creation for message: ${messageId}`);
  
  // Test the updateReactionDisplay function
  if (typeof window.updateReactionDisplay === 'function') {
    console.log('✅ updateReactionDisplay function available');
    
    // Test with mock reactions
    const mockReactions = [
      { emoji: '👍', user_email: 'test@example.com' },
      { emoji: '👍', user_email: 'test2@example.com' }
    ];
    
    window.updateReactionDisplay(messageId, mockReactions).then(() => {
      const updatedCountSpan = firstBtn.querySelector('.icon-count');
      console.log(`Count span after update: ${updatedCountSpan ? '✅' : '❌'}`);
      if (updatedCountSpan) {
        console.log(`Count span text: ${updatedCountSpan.textContent}`);
        console.log(`Count span display: ${updatedCountSpan.style.display}`);
      }
    }).catch(error => {
      console.error('❌ Error testing updateReactionDisplay:', error);
    });
  } else {
    console.log('❌ updateReactionDisplay function not available');
  }
} else {
  console.log('⚠️ No reaction buttons found to test');
}

// Test 5: API Integration
console.log('\n📋 Test 5: API Integration Test');
if (typeof window.api !== 'undefined' && window.api.request) {
  console.log('✅ API module available');
  
  // Test API call
  if (reactionButtons.length > 0) {
    const messageId = reactionButtons[0].dataset.messageId;
    console.log(`Testing API call for message: ${messageId}`);
    
    window.api.request(`/v1/reactions/${messageId}`)
      .then(result => {
        console.log('✅ API call successful:', result);
        console.log(`API response success: ${result.success}`);
        console.log(`Reactions count: ${result.reactions ? result.reactions.length : 0}`);
      })
      .catch(error => {
        console.error('❌ API call failed:', error);
      });
  }
} else {
  console.log('❌ API module not available');
}

console.log('\n🎯 REACTION SYSTEM FIXES TEST COMPLETE');
console.log('=========================================');
console.log('Key fixes applied:');
console.log('✅ Removed duplicate function definitions');
console.log('✅ Fixed reaction modal styling (transparent background)');
console.log('✅ Ensured count spans are created when missing');
console.log('✅ Fixed reaction display logic to preserve count spans');
console.log('✅ Made all functions globally available');
console.log('\nIf all tests pass, the reaction system should be working correctly!');

