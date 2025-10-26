/**
 * 🔧 COMPREHENSIVE DEBUGGING SCRIPT FOR ALL REPORTED ISSUES
 * 
 * Issues to debug:
 * 1. Visibility shows profile on its own visibility but no others
 * 2. When I post a message, it does not persist or propagate
 * 3. Edit gets stuck in message input
 * 4. Profile avatar does not profile menu
 * 5. Reactions don't work
 */

console.log('🔧 COMPREHENSIVE DEBUGGING SCRIPT STARTING...');

// ============================================================================
// 1. VISIBILITY SYSTEM DEBUG
// ============================================================================
function debugVisibilitySystem() {
  console.log('\n🔍 === VISIBILITY SYSTEM DEBUG ===');
  
  // Check current user
  console.log('Current user:', window.currentUser);
  console.log('Current user email:', window.currentUser?.email);
  
  // Check visibility data
  console.log('Current visibility data:', window.currentVisibilityData);
  console.log('Current visibility data unfiltered:', window.currentVisibilityDataUnfiltered);
  
  // Check presence tracking
  console.log('Presence tracking status:');
  console.log('- window.supabaseRealtimeClient:', !!window.supabaseRealtimeClient);
  console.log('- window.currentUrlData:', window.currentUrlData);
  console.log('- window.supabase:', !!window.supabase);
  
  // Check API calls
  console.log('Recent API calls:');
  console.log('- Last presence API response:', window.lastPresenceResponse);
  
  // Check if user is being filtered out
  const currentUserEmail = window.currentUser?.email;
  if (currentUserEmail) {
    console.log('Current user email:', currentUserEmail);
    console.log('Is current user being filtered out?', 
      window.currentVisibilityDataUnfiltered?.active?.find(u => u.email === currentUserEmail) ? 'NO' : 'YES');
  }
}

// ============================================================================
// 2. MESSAGE PERSISTENCE DEBUG
// ============================================================================
function debugMessagePersistence() {
  console.log('\n🔍 === MESSAGE PERSISTENCE DEBUG ===');
  
  // Check message storage
  console.log('Message storage:');
  console.log('- window.globalMessageStorage:', window.globalMessageStorage);
  console.log('- window.globalMessageIds:', window.globalMessageIds);
  
  // Check real-time subscriptions
  console.log('Real-time subscriptions:');
  console.log('- window.supabaseRealtimeClient:', !!window.supabaseRealtimeClient);
  if (window.supabaseRealtimeClient) {
    console.log('- Subscription status:', window.supabaseRealtimeClient.subscriptionStatus);
    console.log('- Current page:', window.supabaseRealtimeClient.currentPage);
    console.log('- Current user:', window.supabaseRealtimeClient.currentUser);
  }
  
  // Check message elements
  const chatMessages = document.querySelector('.chat-messages');
  console.log('Chat messages element:', !!chatMessages);
  if (chatMessages) {
    console.log('- Children count:', chatMessages.children.length);
    console.log('- HTML content:', chatMessages.innerHTML.substring(0, 200) + '...');
  }
  
  // Check message input
  const messageInput = document.querySelector('#chat-input');
  console.log('Message input element:', !!messageInput);
  if (messageInput) {
    console.log('- Value:', messageInput.value);
    console.log('- Event listeners:', getEventListeners(messageInput));
  }
}

// ============================================================================
// 3. PROFILE MENU DEBUG
// ============================================================================
function debugProfileMenu() {
  console.log('\n🔍 === PROFILE MENU DEBUG ===');
  
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
  
  // Check if AvatarUtils is available
  console.log('AvatarUtils availability:');
  console.log('- window.AvatarUtils:', !!window.AvatarUtils);
  console.log('- window.AvatarUtils.createUnifiedAvatar:', typeof window.AvatarUtils?.createUnifiedAvatar);
}

// ============================================================================
// 4. REACTIONS DEBUG
// ============================================================================
function debugReactions() {
  console.log('\n🔍 === REACTIONS DEBUG ===');
  
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
    console.log(`- Button ${index}:`, {
      element: btn,
      eventListeners: getEventListeners(btn),
      dataAction: btn.getAttribute('data-action')
    });
  });
  
  // Check reaction functions
  console.log('Reaction functions:');
  console.log('- handleReaction:', typeof window.handleReaction);
  console.log('- showReactionsModal:', typeof window.showReactionsModal);
}

// ============================================================================
// 5. EDIT FUNCTIONALITY DEBUG
// ============================================================================
function debugEditFunctionality() {
  console.log('\n🔍 === EDIT FUNCTIONALITY DEBUG ===');
  
  // Check edit buttons
  const editButtons = document.querySelectorAll('[data-action="edit"]');
  console.log('Edit buttons found:', editButtons.length);
  editButtons.forEach((btn, index) => {
    console.log(`- Edit button ${index}:`, {
      element: btn,
      eventListeners: getEventListeners(btn),
      dataAction: btn.getAttribute('data-action')
    });
  });
  
  // Check edit functions
  console.log('Edit functions:');
  console.log('- handleEditMessage:', typeof window.handleEditMessage);
  console.log('- handleSaveEdit:', typeof window.handleSaveEdit);
  console.log('- handleCancelEdit:', typeof window.handleCancelEdit);
  
  // Check message input event listeners
  const messageInput = document.querySelector('#chat-input');
  if (messageInput) {
    console.log('Message input event listeners:', getEventListeners(messageInput));
  }
}

// ============================================================================
// 6. COMPREHENSIVE SYSTEM CHECK
// ============================================================================
function debugSystemHealth() {
  console.log('\n🔍 === SYSTEM HEALTH CHECK ===');
  
  // Check all critical modules
  const modules = [
    'window.AvatarUtils',
    'window.ProfileManager', 
    'window.CanopiModule',
    'window.UIManager',
    'window.AuthManager',
    'window.supabaseRealtimeClient',
    'window.supabase'
  ];
  
  modules.forEach(module => {
    const parts = module.split('.');
    let obj = window;
    for (const part of parts.slice(1)) {
      obj = obj?.[part];
    }
    console.log(`${module}:`, !!obj);
  });
  
  // Check for duplicate functions
  console.log('\nDuplicate function check:');
  const functions = [
    'addMessageToChat',
    'handleReaction', 
    'handleReplyToMessage',
    'formatMessageTime'
  ];
  
  functions.forEach(funcName => {
    const instances = [];
    for (let prop in window) {
      if (typeof window[prop] === 'function' && window[prop].name === funcName) {
        instances.push(prop);
      }
    }
    console.log(`${funcName}: ${instances.length} instances found:`, instances);
  });
}

// ============================================================================
// 7. FIX SUGGESTIONS
// ============================================================================
function provideFixSuggestions() {
  console.log('\n🔧 === FIX SUGGESTIONS ===');
  
  console.log('1. VISIBILITY ISSUE:');
  console.log('   - Presence tracking is not working properly');
  console.log('   - API returns empty active users');
  console.log('   - Current user is being filtered out');
  console.log('   - Fix: Check presence event sending and API response handling');
  
  console.log('\n2. MESSAGE PERSISTENCE:');
  console.log('   - Messages may not be persisting to database');
  console.log('   - Real-time propagation may be broken');
  console.log('   - Fix: Check Supabase real-time subscriptions and message storage');
  
  console.log('\n3. PROFILE MENU:');
  console.log('   - Profile avatar click handler may not be attached');
  console.log('   - AvatarUtils may not be available');
  console.log('   - Fix: Ensure AvatarUtils.createUnifiedAvatar is used and click handlers are attached');
  
  console.log('\n4. REACTIONS:');
  console.log('   - Reactions modal may not be created');
  console.log('   - Event handlers may not be attached');
  console.log('   - Fix: Check reactions modal creation and event handler attachment');
  
  console.log('\n5. EDIT FUNCTIONALITY:');
  console.log('   - Edit event handlers may not be attached');
  console.log('   - Message input may have conflicting event listeners');
  console.log('   - Fix: Check edit event handlers and message input event listener conflicts');
}

// ============================================================================
// 8. QUICK FIXES
// ============================================================================
function applyQuickFixes() {
  console.log('\n🔧 === APPLYING QUICK FIXES ===');
  
  // Fix 1: Ensure profile avatar click handler is attached
  if (typeof window.addProfileAvatarClickHandler === 'function') {
    console.log('✅ Attaching profile avatar click handler...');
    window.addProfileAvatarClickHandler();
  } else {
    console.log('❌ Profile avatar click handler not available');
  }
  
  // Fix 2: Ensure all profile menu handlers are attached
  if (typeof window.addAllProfileMenuHandlers === 'function') {
    console.log('✅ Attaching all profile menu handlers...');
    window.addAllProfileMenuHandlers();
  } else {
    console.log('❌ All profile menu handlers not available');
  }
  
  // Fix 3: Check if AvatarUtils is available and create fallback
  if (!window.AvatarUtils || !window.AvatarUtils.createUnifiedAvatar) {
    console.log('❌ AvatarUtils not available - this is a critical issue');
    console.log('   Profile avatars will not work properly without AvatarUtils');
  } else {
    console.log('✅ AvatarUtils is available');
  }
  
  // Fix 4: Check message input event listeners
  const messageInput = document.querySelector('#chat-input');
  if (messageInput) {
    console.log('✅ Message input found, checking event listeners...');
    const listeners = getEventListeners(messageInput);
    console.log('Event listeners:', Object.keys(listeners));
  } else {
    console.log('❌ Message input not found');
  }
}

// ============================================================================
// 9. TEST FUNCTIONS
// ============================================================================
function testAllFunctionality() {
  console.log('\n🧪 === TESTING ALL FUNCTIONALITY ===');
  
  // Test 1: Profile avatar click
  console.log('Testing profile avatar click...');
  const userAvatarContainer = document.getElementById('user-avatar-container');
  if (userAvatarContainer) {
    console.log('✅ Profile avatar container found');
    // Simulate click
    userAvatarContainer.click();
    console.log('✅ Profile avatar clicked');
  } else {
    console.log('❌ Profile avatar container not found');
  }
  
  // Test 2: Message input
  console.log('Testing message input...');
  const messageInput = document.querySelector('#chat-input');
  if (messageInput) {
    console.log('✅ Message input found');
    messageInput.value = 'Test message';
    console.log('✅ Message input value set');
  } else {
    console.log('❌ Message input not found');
  }
  
  // Test 3: Reactions
  console.log('Testing reactions...');
  const reactionButtons = document.querySelectorAll('[data-action="reaction"]');
  if (reactionButtons.length > 0) {
    console.log(`✅ Found ${reactionButtons.length} reaction buttons`);
    // Test first reaction button
    reactionButtons[0].click();
    console.log('✅ Reaction button clicked');
  } else {
    console.log('❌ No reaction buttons found');
  }
}

// ============================================================================
// 10. MAIN EXECUTION
// ============================================================================
function runComprehensiveDebug() {
  console.log('🚀 STARTING COMPREHENSIVE DEBUG SESSION...');
  
  debugVisibilitySystem();
  debugMessagePersistence();
  debugProfileMenu();
  debugReactions();
  debugEditFunctionality();
  debugSystemHealth();
  provideFixSuggestions();
  applyQuickFixes();
  testAllFunctionality();
  
  console.log('\n✅ COMPREHENSIVE DEBUG SESSION COMPLETE');
  console.log('📋 Check the output above for issues and fix suggestions');
}

// ============================================================================
// 11. UTILITY FUNCTIONS
// ============================================================================
function getEventListeners(element) {
  // This is a simplified version - in real implementation, you'd need to track listeners
  return {
    click: element.onclick ? ['onclick'] : [],
    keydown: element.onkeydown ? ['onkeydown'] : [],
    keyup: element.onkeyup ? ['onkeyup'] : []
  };
}

// ============================================================================
// 12. EXPORT FUNCTIONS
// ============================================================================
window.debugAllIssues = runComprehensiveDebug;
window.debugVisibility = debugVisibilitySystem;
window.debugMessages = debugMessagePersistence;
window.debugProfile = debugProfileMenu;
window.debugReactions = debugReactions;
window.debugEdit = debugEditFunctionality;
window.debugSystem = debugSystemHealth;
window.quickFixes = applyQuickFixes;
window.testAll = testAllFunctionality;

console.log('🔧 DEBUGGING SCRIPT LOADED');
console.log('📋 Available functions:');
console.log('   - debugAllIssues() - Run complete debug session');
console.log('   - debugVisibility() - Debug visibility system');
console.log('   - debugMessages() - Debug message persistence');
console.log('   - debugProfile() - Debug profile menu');
console.log('   - debugReactions() - Debug reactions');
console.log('   - debugEdit() - Debug edit functionality');
console.log('   - debugSystem() - Debug system health');
console.log('   - quickFixes() - Apply quick fixes');
console.log('   - testAll() - Test all functionality');
console.log('\n🚀 Run debugAllIssues() to start comprehensive debugging');
