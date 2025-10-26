// ===== COMP METHOD VERIFICATION: CHECKING CURRENT STATUS =====
// Verify that messages are displaying correctly with all UI elements

console.log('🔍 COMP METHOD VERIFICATION: Starting verification of current status...');

function verifyMessageDisplay() {
  console.log('🔍 COMP METHOD VERIFICATION: Verifying message display...');
  
  // Check how many messages are visible
  const messages = document.querySelectorAll('.message');
  console.log('🔍 COMP METHOD VERIFICATION: Total messages visible:', messages.length);
  
  if (messages.length > 0) {
    console.log('✅ COMP METHOD VERIFICATION: Messages are visible!');
    
    // Check the first message for UI elements
    const firstMessage = messages[0];
    console.log('�� COMP METHOD VERIFICATION: First message structure:');
    console.log('  - Message element:', firstMessage);
    console.log('  - Message ID:', firstMessage.id);
    console.log('  - Message content:', firstMessage.textContent?.substring(0, 100));
    
    // Check for avatar
    const avatar = firstMessage.querySelector('.message-avatar img');
    console.log('  - Avatar found:', !!avatar);
    if (avatar) {
      console.log('  - Avatar src:', avatar.src);
    }
    
    // Check for author name
    const authorName = firstMessage.querySelector('.message-author');
    console.log('  - Author name found:', !!authorName);
    if (authorName) {
      console.log('  - Author name text:', authorName.textContent);
    }
    
    // Check for message content
    const content = firstMessage.querySelector('.message-content');
    console.log('  - Content found:', !!content);
    if (content) {
      console.log('  - Content text:', content.textContent?.substring(0, 100));
    }
    
    // Check for reactions
    const reactions = firstMessage.querySelector('.message-reactions');
    console.log('  - Reactions found:', !!reactions);
    
    // Check for replies
    const replies = firstMessage.querySelector('.message-replies');
    console.log('  - Replies found:', !!replies);
    
    // Check for message menu (three dots)
    const menu = firstMessage.querySelector('.message-menu');
    console.log('  - Message menu found:', !!menu);
    
    // Check for community info
    const community = firstMessage.querySelector('.message-community');
    console.log('  - Community info found:', !!community);
    
  } else {
    console.log('⚠️ COMP METHOD VERIFICATION: No messages visible');
  }
}

function verifyVisibleTab() {
  console.log('🔍 COMP METHOD VERIFICATION: Verifying visible tab...');
  
  const visibleTab = document.querySelector('#visible-tab');
  if (visibleTab) {
    console.log('✅ COMP METHOD VERIFICATION: Visible tab found');
    
    const profiles = visibleTab.querySelectorAll('.profile-item');
    console.log('🔍 COMP METHOD VERIFICATION: Profiles in visible tab:', profiles.length);
    
    if (profiles.length > 0) {
      console.log('✅ COMP METHOD VERIFICATION: Profiles are visible in visible tab');
      profiles.forEach((profile, index) => {
        console.log(`  - Profile ${index + 1}:`, profile.textContent?.trim());
      });
    } else {
      console.log('⚠️ COMP METHOD VERIFICATION: No profiles in visible tab');
    }
  } else {
    console.log('❌ COMP METHOD VERIFICATION: Visible tab not found');
  }
}

function verifyProfileMenu() {
  console.log('🔍 COMP METHOD VERIFICATION: Verifying profile menu...');
  
  const profileMenu = document.querySelector('.profile-menu');
  if (profileMenu) {
    console.log('✅ COMP METHOD VERIFICATION: Profile menu found');
    console.log('  - Profile menu visible:', profileMenu.style.display !== 'none');
    console.log('  - Profile menu content:', profileMenu.textContent?.trim());
  } else {
    console.log('❌ COMP METHOD VERIFICATION: Profile menu not found');
  }
}

function verifyMessageInput() {
  console.log('🔍 COMP METHOD VERIFICATION: Verifying message input...');
  
  const messageInput = document.querySelector('#messageInput, #chat-textarea');
  if (messageInput) {
    console.log('✅ COMP METHOD VERIFICATION: Message input found');
    console.log('  - Input type:', messageInput.tagName);
    console.log('  - Input placeholder:', messageInput.placeholder);
    console.log('  - Input value:', messageInput.value);
    console.log('  - Input disabled:', messageInput.disabled);
  } else {
    console.log('❌ COMP METHOD VERIFICATION: Message input not found');
  }
}

function verifyRealtimeStatus() {
  console.log('🔍 COMP METHOD VERIFICATION: Verifying realtime status...');
  
  console.log('  - Supabase client:', typeof window.supabase);
  console.log('  - RealtimeManager:', typeof window.realtimeManager);
  console.log('  - Current user:', window.currentUser);
  console.log('  - Current page ID:', window.currentUrlData?.pageId);
}

function runCOMPMethodVerification() {
  console.log('🚀 COMP METHOD VERIFICATION: Starting comprehensive verification...');
  
  verifyMessageDisplay();
  verifyVisibleTab();
  verifyProfileMenu();
  verifyMessageInput();
  verifyRealtimeStatus();
  
  console.log('✅ COMP METHOD VERIFICATION: Verification completed');
}

// Export functions
window.verifyMessageDisplay = verifyMessageDisplay;
window.verifyVisibleTab = verifyVisibleTab;
window.verifyProfileMenu = verifyProfileMenu;
window.verifyMessageInput = verifyMessageInput;
window.verifyRealtimeStatus = verifyRealtimeStatus;
window.runCOMPMethodVerification = runCOMPMethodVerification;

// Auto-run verification
console.log('🔍 COMP METHOD VERIFICATION: Auto-running verification...');
runCOMPMethodVerification();

console.log('🔍 COMP METHOD VERIFICATION: Script loaded. Available functions:');
console.log('  - verifyMessageDisplay()');
console.log('  - verifyVisibleTab()');
console.log('  - verifyProfileMenu()');
console.log('  - verifyMessageInput()');
console.log('  - verifyRealtimeStatus()');
console.log('  - runCOMPMethodVerification()');
