#!/usr/bin/env node

console.log('🧪 REACTIONS DEBUG TEST');
console.log('========================');

// Test 1: Check if reaction buttons exist in DOM
console.log('\n1. Checking reaction buttons in DOM...');
if (typeof document !== 'undefined') {
  const reactionButtons = document.querySelectorAll('.reaction-btn');
  console.log(`Found ${reactionButtons.length} reaction buttons`);
  
  reactionButtons.forEach((btn, index) => {
    console.log(`Button ${index + 1}:`, {
      messageId: btn.dataset.messageId,
      visible: btn.offsetParent !== null,
      display: window.getComputedStyle(btn).display,
      visibility: window.getComputedStyle(btn).visibility,
      opacity: window.getComputedStyle(btn).opacity,
      zIndex: window.getComputedStyle(btn).zIndex
    });
  });
} else {
  console.log('❌ Document not available (Node.js environment)');
}

// Test 2: Check if showReactionModal function exists
console.log('\n2. Checking showReactionModal function...');
if (typeof window !== 'undefined' && window.showReactionModal) {
  console.log('✅ showReactionModal function exists');
  console.log('Function type:', typeof window.showReactionModal);
} else {
  console.log('❌ showReactionModal function not found');
}

// Test 3: Check if Supabase client is available
console.log('\n3. Checking Supabase client...');
if (typeof window !== 'undefined' && window.supabase) {
  console.log('✅ Supabase client available');
  console.log('Client type:', typeof window.supabase);
  console.log('Has from method:', typeof window.supabase.from === 'function');
} else {
  console.log('❌ Supabase client not available');
}

// Test 4: Check current user authentication
console.log('\n4. Checking user authentication...');
if (typeof window !== 'undefined' && window.currentUser) {
  console.log('✅ Current user available');
  console.log('User email:', window.currentUser.email);
  console.log('User name:', window.currentUser.name);
} else {
  console.log('❌ No current user found');
}

// Test 5: Test reaction modal creation
console.log('\n5. Testing reaction modal creation...');
if (typeof window !== 'undefined' && window.showReactionModal) {
  try {
    // Find first message ID
    const firstMessage = document.querySelector('.message');
    if (firstMessage) {
      const messageId = firstMessage.dataset.messageId || firstMessage.id;
      console.log('Testing with message ID:', messageId);
      
      // Test modal creation
      window.showReactionModal(messageId);
      console.log('✅ Modal creation test completed');
      
      // Check if modal was created
      const modal = document.getElementById('reactions-modal');
      if (modal) {
        console.log('✅ Modal created successfully');
        console.log('Modal display:', window.getComputedStyle(modal).display);
        console.log('Modal position:', modal.style.position);
        console.log('Modal z-index:', modal.style.zIndex);
        
        // Clean up
        modal.remove();
        console.log('✅ Modal cleaned up');
      } else {
        console.log('❌ Modal not found after creation');
      }
    } else {
      console.log('❌ No messages found to test with');
    }
  } catch (error) {
    console.log('❌ Error testing modal creation:', error.message);
  }
} else {
  console.log('❌ Cannot test modal creation - showReactionModal not available');
}

console.log('\n🧪 REACTIONS DEBUG TEST COMPLETE');

