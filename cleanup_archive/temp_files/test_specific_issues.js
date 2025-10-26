/**
 * 🧪 SPECIFIC ISSUES TEST SCRIPT
 * 
 * Test the exact issues reported:
 * 1. Visibility shows profile on its own visibility but no others
 * 2. When I post a message, it does not persist or propagate  
 * 3. Edit gets stuck in message input
 * 4. Profile avatar does not profile menu
 * 5. Reactions don't work
 */

console.log('🧪 TESTING SPECIFIC ISSUES...');

// ============================================================================
// ISSUE 1: VISIBILITY SHOWS PROFILE ON ITS OWN VISIBILITY BUT NO OTHERS
// ============================================================================
function testVisibilityIssue() {
  console.log('\n🔍 TESTING: Visibility shows profile on its own visibility but no others');
  
  // Check current visibility data
  console.log('Current visibility data:', window.currentVisibilityData);
  console.log('Current visibility data unfiltered:', window.currentVisibilityDataUnfiltered);
  
  // Check if current user is being filtered out
  const currentUserEmail = window.currentUser?.email;
  console.log('Current user email:', currentUserEmail);
  
  if (window.currentVisibilityDataUnfiltered?.active) {
    const currentUserInData = window.currentVisibilityDataUnfiltered.active.find(u => u.email === currentUserEmail);
    console.log('Current user found in unfiltered data:', !!currentUserInData);
    if (currentUserInData) {
      console.log('Current user data:', currentUserInData);
    }
  }
  
  // Check API response
  console.log('Last presence API response:', window.lastPresenceResponse);
  
  // Check if presence tracking is working
  console.log('Presence tracking status:');
  console.log('- Supabase realtime client:', !!window.supabaseRealtimeClient);
  console.log('- Current page ID:', window.currentUrlData?.pageId);
  console.log('- Current user:', window.supabaseRealtimeClient?.currentUser);
  
  // Test: Try to refresh visibility
  console.log('Testing visibility refresh...');
  if (typeof window.refreshVisibilityAvatars === 'function') {
    window.refreshVisibilityAvatars();
    console.log('✅ Visibility refresh called');
  } else {
    console.log('❌ refreshVisibilityAvatars function not available');
  }
}

// ============================================================================
// ISSUE 2: WHEN I POST A MESSAGE, IT DOES NOT PERSIST OR PROPAGATE
// ============================================================================
function testMessagePersistence() {
  console.log('\n🔍 TESTING: When I post a message, it does not persist or propagate');
  
  // Check message input
  const messageInput = document.querySelector('#chat-input');
  console.log('Message input element:', !!messageInput);
  if (messageInput) {
    console.log('Message input value:', messageInput.value);
    console.log('Message input event listeners:', getEventListeners(messageInput));
  }
  
  // Check real-time subscriptions
  console.log('Real-time subscription status:');
  if (window.supabaseRealtimeClient) {
    console.log('- Subscription status:', window.supabaseRealtimeClient.subscriptionStatus);
    console.log('- Current page:', window.supabaseRealtimeClient.currentPage);
    console.log('- Current user:', window.supabaseRealtimeClient.currentUser);
  }
  
  // Check message storage
  console.log('Message storage:');
  console.log('- Global message storage:', window.globalMessageStorage);
  console.log('- Global message IDs:', window.globalMessageIds);
  
  // Check chat messages container
  const chatMessages = document.querySelector('.chat-messages');
  console.log('Chat messages container:', !!chatMessages);
  if (chatMessages) {
    console.log('- Children count:', chatMessages.children.length);
    console.log('- HTML content length:', chatMessages.innerHTML.length);
  }
  
  // Test: Try to send a test message
  console.log('Testing message sending...');
  if (messageInput) {
    messageInput.value = 'Test message for persistence';
    console.log('✅ Test message set in input');
    
    // Try to trigger send
    const sendButton = document.querySelector('#send-button, [data-action="send"]');
    if (sendButton) {
      console.log('✅ Send button found');
      // Don't actually click it, just check if it exists
    } else {
      console.log('❌ Send button not found');
    }
  } else {
    console.log('❌ Message input not found');
  }
}

// ============================================================================
// ISSUE 3: EDIT GETS STUCK IN MESSAGE INPUT
// ============================================================================
function testEditStuck() {
  console.log('\n🔍 TESTING: Edit gets stuck in message input');
  
  // Check edit buttons
  const editButtons = document.querySelectorAll('[data-action="edit"]');
  console.log('Edit buttons found:', editButtons.length);
  
  editButtons.forEach((btn, index) => {
    console.log(`Edit button ${index}:`, {
      element: btn,
      eventListeners: getEventListeners(btn),
      dataAction: btn.getAttribute('data-action')
    });
  });
  
  // Check edit functions
  console.log('Edit functions available:');
  console.log('- handleEditMessage:', typeof window.handleEditMessage);
  console.log('- handleSaveEdit:', typeof window.handleSaveEdit);
  console.log('- handleCancelEdit:', typeof window.handleCancelEdit);
  
  // Check message input event listeners
  const messageInput = document.querySelector('#chat-input');
  if (messageInput) {
    console.log('Message input event listeners:', getEventListeners(messageInput));
    
    // Test: Try to enter edit mode
    if (editButtons.length > 0) {
      console.log('Testing edit mode...');
      // Don't actually click, just check if it would work
      console.log('✅ Edit button available for testing');
    }
  }
}

// ============================================================================
// ISSUE 4: PROFILE AVATAR DOES NOT PROFILE MENU
// ============================================================================
function testProfileMenu() {
  console.log('\n🔍 TESTING: Profile avatar does not profile menu');
  
  // Check profile avatar container
  const userAvatarContainer = document.getElementById('user-avatar-container');
  console.log('User avatar container:', !!userAvatarContainer);
  if (userAvatarContainer) {
    console.log('- HTML content:', userAvatarContainer.innerHTML);
    console.log('- Event listeners:', getEventListeners(userAvatarContainer));
    console.log('- Click handler attached:', userAvatarContainer.onclick !== null);
  }
  
  // Check user menu
  const userMenu = document.getElementById('user-menu');
  console.log('User menu element:', !!userMenu);
  if (userMenu) {
    console.log('- Display style:', userMenu.style.display);
    console.log('- Visibility:', userMenu.style.visibility);
    console.log('- HTML content:', userMenu.innerHTML);
  }
  
  // Check profile manager functions
  console.log('Profile manager functions:');
  console.log('- addProfileAvatarClickHandler:', typeof window.addProfileAvatarClickHandler);
  console.log('- addAllProfileMenuHandlers:', typeof window.addAllProfileMenuHandlers);
  
  // Test: Try to click profile avatar
  if (userAvatarContainer) {
    console.log('Testing profile avatar click...');
    userAvatarContainer.click();
    console.log('✅ Profile avatar clicked');
    
    // Check if menu appeared
    if (userMenu) {
      console.log('User menu display after click:', userMenu.style.display);
    }
  } else {
    console.log('❌ Profile avatar container not found');
  }
}

// ============================================================================
// ISSUE 5: REACTIONS DON'T WORK
// ============================================================================
function testReactions() {
  console.log('\n🔍 TESTING: Reactions don\'t work');
  
  // Check reactions modal
  const reactionsModal = document.getElementById('reactions-modal');
  console.log('Reactions modal element:', !!reactionsModal);
  if (reactionsModal) {
    console.log('- Display style:', reactionsModal.style.display);
    console.log('- HTML content:', reactionsModal.innerHTML);
  }
  
  // Check reaction buttons
  const reactionButtons = document.querySelectorAll('[data-action="reaction"]');
  console.log('Reaction buttons found:', reactionButtons.length);
  
  reactionButtons.forEach((btn, index) => {
    console.log(`Reaction button ${index}:`, {
      element: btn,
      eventListeners: getEventListeners(btn),
      dataAction: btn.getAttribute('data-action')
    });
  });
  
  // Check reaction functions
  console.log('Reaction functions:');
  console.log('- handleReaction:', typeof window.handleReaction);
  console.log('- showReactionsModal:', typeof window.showReactionsModal);
  
  // Test: Try to click reaction button
  if (reactionButtons.length > 0) {
    console.log('Testing reaction button click...');
    reactionButtons[0].click();
    console.log('✅ Reaction button clicked');
    
    // Check if modal appeared
    if (reactionsModal) {
      console.log('Reactions modal display after click:', reactionsModal.style.display);
    }
  } else {
    console.log('❌ No reaction buttons found');
  }
}

// ============================================================================
// COMPREHENSIVE TEST
// ============================================================================
function testAllIssues() {
  console.log('🧪 TESTING ALL REPORTED ISSUES...');
  
  testVisibilityIssue();
  testMessagePersistence();
  testEditStuck();
  testProfileMenu();
  testReactions();
  
  console.log('\n✅ ALL ISSUES TESTED');
  console.log('📋 Check the output above for specific problems');
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================
function getEventListeners(element) {
  // Simplified event listener detection
  const listeners = {};
  if (element.onclick) listeners.click = ['onclick'];
  if (element.onkeydown) listeners.keydown = ['onkeydown'];
  if (element.onkeyup) listeners.keyup = ['onkeyup'];
  return listeners;
}

// ============================================================================
// EXPORT FUNCTIONS
// ============================================================================
window.testAllIssues = testAllIssues;
window.testVisibility = testVisibilityIssue;
window.testMessages = testMessagePersistence;
window.testEdit = testEditStuck;
window.testProfile = testProfileMenu;
window.testReactions = testReactions;

console.log('🧪 SPECIFIC ISSUES TEST SCRIPT LOADED');
console.log('📋 Available functions:');
console.log('   - testAllIssues() - Test all reported issues');
console.log('   - testVisibility() - Test visibility issue');
console.log('   - testMessages() - Test message persistence issue');
console.log('   - testEdit() - Test edit stuck issue');
console.log('   - testProfile() - Test profile menu issue');
console.log('   - testReactions() - Test reactions issue');
console.log('\n🚀 Run testAllIssues() to test all reported issues');
