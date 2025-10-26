// test_comp_method_fix.js
// Test script to verify COMP method author resolution fix

async function testCOMPMethodFix() {
    console.log("--- Testing COMP Method Author Resolution Fix ---");
    
    if (typeof window.addMessageToChat !== 'function') {
        console.error("❌ Test Failed: window.addMessageToChat is not available.");
        return false;
    }
    
    const chatMessagesContainer = document.querySelector('.chat-messages');
    if (!chatMessagesContainer) {
        console.error("❌ Test Failed: .chat-messages container not found.");
        return false;
    }
    
    // Test message with proper user_email (simulating real-time message)
    const testMessage = {
        id: 'test-comp-message-123',
        content: 'This is a test message from COMP method',
        user_email: window.currentUser?.email, // Use current user's email
        conversationId: 'test-conv-1',
        reactionCount: 0,
        replyCount: 0,
        hasReplies: false,
        createdAt: new Date().toISOString()
    };
    
    console.log("Testing message with user_email:", testMessage.user_email);
    console.log("Current user email:", window.currentUser?.email);
    
    // Clear existing messages for a clean test
    chatMessagesContainer.innerHTML = '';
    
    console.log("Attempting to add message with COMP method...");
    await window.addMessageToChat(testMessage);
    await new Promise(resolve => setTimeout(resolve, 100)); // Small delay for DOM update
    
    const addedMessage = chatMessagesContainer.querySelector(`[data-message-id="${testMessage.id}"]`);
    if (addedMessage) {
        console.log("✅ Message added successfully.");
        
        const authorName = addedMessage.querySelector('.message-sender-name')?.textContent;
        const authorAvatar = addedMessage.querySelector('.avatar-container img')?.src;
        const content = addedMessage.querySelector('.message-content')?.textContent;
        
        console.log("   Author Name:", authorName);
        console.log("   Author Avatar:", authorAvatar);
        console.log("   Content:", content);
        console.log("   Author ID:", addedMessage.dataset.authorId);
        
        // Check if author name is correct (not "Unknown User")
        if (authorName && !authorName.includes('Unknown')) {
            console.log("✅ SUCCESS: Author name is correctly resolved");
        } else {
            console.error("❌ FAILED: Author name is still 'Unknown User'");
            return false;
        }
        
        // Check if avatar is Google profile picture (not generic)
        if (authorAvatar && authorAvatar.includes('googleusercontent.com')) {
            console.log("✅ SUCCESS: Avatar is Google profile picture");
        } else {
            console.error("❌ FAILED: Avatar is not Google profile picture");
            return false;
        }
        
        // Check if content is correct
        if (content === testMessage.content) {
            console.log("✅ SUCCESS: Message content is correct");
        } else {
            console.error("❌ FAILED: Message content is incorrect");
            return false;
        }
        
    } else {
        console.error("❌ Test Failed: Message not found in DOM.");
        return false;
    }
    
    console.log("--- COMP Method Author Resolution Fix Test Complete ---");
    return true;
}

// Expose to window for easy access
window.testCOMPMethodFix = testCOMPMethodFix;

console.log("✅ TEST SCRIPT: test_comp_method_fix.js loaded. Use testCOMPMethodFix() in console.");
