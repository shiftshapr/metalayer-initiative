/**
 * 🧪 SD2 COMP MIMETIC TEST SCRIPT
 * Test the message display fixes
 * Run this in the browser console after the fixes are applied
 */

console.log('🧪 SD2 COMP MIMETIC TEST SCRIPT LOADED');

// Test function to simulate a cross-profile message
function testCrossProfileMessage() {
  console.log('🧪 TESTING CROSS-PROFILE MESSAGE...');
  
  // Simulate a message from a different user
  const testMessage = {
    id: 'test-cross-profile-' + Date.now(),
    content: 'Test message from different user',
    body: 'Test message from different user',
    user_email: 'themetalayer@gmail.com', // Different from current user
    page_id: 'google_com_',
    created_at: new Date().toISOString(),
    author: undefined, // This should trigger our fix
    authorId: undefined
  };
  
  console.log('📝 Test message:', testMessage);
  console.log('👤 Current user:', window.currentUser?.email);
  console.log('🔍 Cross-profile check:', testMessage.user_email !== window.currentUser?.email);
  
  // Test the addMessageToChat function
  if (typeof window.addMessageToChat === 'function') {
    console.log('✅ addMessageToChat function available');
    console.log('🧪 Calling addMessageToChat with test message...');
    window.addMessageToChat(testMessage);
  } else {
    console.log('❌ addMessageToChat function not available');
  }
}

// Test function to check UI components
function testUIComponents() {
  console.log('🧪 TESTING UI COMPONENTS...');
  
  const chatMessages = document.querySelector('.chat-messages');
  if (!chatMessages) {
    console.log('❌ No .chat-messages element found');
    return;
  }
  
  const messages = chatMessages.querySelectorAll('.message');
  console.log(`📊 Found ${messages.length} messages`);
  
  messages.forEach((msg, index) => {
    console.log(`\n📝 MESSAGE ${index + 1} UI CHECK:`);
    
    // Check author display
    const authorName = msg.querySelector('.message-sender-name');
    const avatar = msg.querySelector('img');
    console.log('  👤 Author name:', authorName?.textContent || 'MISSING');
    console.log('  🖼️ Avatar URL:', avatar?.src || 'MISSING');
    
    // Check UI components
    const reactions = msg.querySelector('.reaction-btn');
    const replies = msg.querySelector('.inline-reply-btn');
    const actions = msg.querySelector('.message-actions');
    
    console.log('  🔘 Reactions:', !!reactions);
    console.log('  💬 Replies:', !!replies);
    console.log('  ⚙️ Actions:', !!actions);
    
    // Test button functionality
    if (reactions) {
      console.log('  🔘 Testing reaction button...');
      reactions.click();
    }
    
    if (replies) {
      console.log('  💬 Testing reply button...');
      replies.click();
    }
  });
  
  console.log('\n✅ UI COMPONENTS TEST COMPLETE');
}

// Test function to check author data resolution
function testAuthorResolution() {
  console.log('🧪 TESTING AUTHOR RESOLUTION...');
  
  // Test different scenarios
  const testCases = [
    {
      name: 'Message with user_email',
      message: {
        id: 'test-1',
        content: 'Test message',
        user_email: 'themetalayer@gmail.com',
        author: undefined
      }
    },
    {
      name: 'Message with author data',
      message: {
        id: 'test-2',
        content: 'Test message',
        author: {
          name: 'Test User',
          email: 'test@example.com',
          avatarUrl: 'https://example.com/avatar.jpg'
        }
      }
    },
    {
      name: 'Message without author data',
      message: {
        id: 'test-3',
        content: 'Test message',
        user_email: 'unknown@example.com'
      }
    }
  ];
  
  testCases.forEach((testCase, index) => {
    console.log(`\n🧪 TEST CASE ${index + 1}: ${testCase.name}`);
    console.log('  Message:', testCase.message);
    
    // Simulate the author resolution logic
    let author = testCase.message.author;
    
    if (!author && testCase.message.user_email) {
      const senderEmail = testCase.message.user_email;
      const senderName = senderEmail.split('@')[0];
      const senderAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(senderName)}&background=random`;
      
      author = {
        name: senderName,
        email: senderEmail,
        avatarUrl: senderAvatar
      };
    }
    
    console.log('  Resolved author:', author);
    console.log('  Author name:', author?.name);
    console.log('  Author email:', author?.email);
    console.log('  Author avatar:', author?.avatarUrl);
  });
  
  console.log('\n✅ AUTHOR RESOLUTION TEST COMPLETE');
}

// Main test function
function runAllTests() {
  console.log('🚀🚀🚀 ============================================');
  console.log('🚀🚀🚀 RUNNING ALL TESTS');
  console.log('🚀🚀🚀 ============================================');
  
  testAuthorResolution();
  console.log('\n' + '='.repeat(50) + '\n');
  
  testUIComponents();
  console.log('\n' + '='.repeat(50) + '\n');
  
  testCrossProfileMessage();
  
  console.log('\n🎯🎯🎯 ============================================');
  console.log('🎯🎯🎯 ALL TESTS COMPLETE');
  console.log('🎯🎯🎯 ============================================');
}

// Make functions globally available
window.testCrossProfileMessage = testCrossProfileMessage;
window.testUIComponents = testUIComponents;
window.testAuthorResolution = testAuthorResolution;
window.runAllTests = runAllTests;

console.log('✅ SD2 COMP MIMETIC TEST SCRIPT READY');
console.log('📋 Run: runAllTests() for complete testing');
