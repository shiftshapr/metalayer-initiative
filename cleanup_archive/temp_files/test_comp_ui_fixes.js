// test_comp_ui_fixes.js
// Test script to verify COMP method UI fixes

async function testCOMPUIFixes() {
    console.log("--- Testing COMP Method UI Fixes ---");
    
    if (typeof window.addMessageToChat !== 'function') {
        console.error("❌ Test Failed: window.addMessageToChat is not available.");
        return false;
    }
    
    const chatMessagesContainer = document.querySelector('.chat-messages');
    if (!chatMessagesContainer) {
        console.error("❌ Test Failed: .chat-messages container not found.");
        return false;
    }
    
    // Test 1: Current User Message (should show Google profile picture)
    const currentUserMessage = {
        id: 'test-current-user-123',
        content: 'This is a test message from current user',
        user_email: window.currentUser?.email,
        conversationId: 'test-conv-1',
        reactionCount: 0,
        replyCount: 0,
        hasReplies: false,
        createdAt: new Date().toISOString()
    };
    
    console.log("Testing current user message...");
    await window.addMessageToChat(currentUserMessage);
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const currentUserMsg = chatMessagesContainer.querySelector(`[data-message-id="${currentUserMessage.id}"]`);
    if (currentUserMsg) {
        const avatar = currentUserMsg.querySelector('.avatar-container img')?.src;
        const messageMenu = currentUserMsg.querySelector('.message-actions');
        const reactionBtn = currentUserMsg.querySelector('.reaction-btn');
        const replyBtn = currentUserMsg.querySelector('.inline-reply-btn');
        
        console.log("✅ Current User Message:");
        console.log("   Avatar:", avatar);
        console.log("   Message Menu:", !!messageMenu);
        console.log("   Reaction Button:", !!reactionBtn);
        console.log("   Reply Button:", !!replyBtn);
        
        // Test reaction functionality
        if (reactionBtn) {
            console.log("Testing reaction button...");
            reactionBtn.click();
            const countSpan = reactionBtn.querySelector('.icon-count');
            console.log("   Reaction count after click:", countSpan?.textContent);
        }
        
        // Test reply functionality
        if (replyBtn) {
            console.log("Testing reply button...");
            replyBtn.click();
            const chatInput = document.getElementById('chat-textarea');
            console.log("   Input placeholder after reply:", chatInput?.placeholder);
        }
        
        // Test edit functionality
        if (messageMenu) {
            const editBtn = messageMenu.querySelector('.edit-btn');
            if (editBtn) {
                console.log("Testing edit button...");
                editBtn.click();
                const chatInput = document.getElementById('chat-textarea');
                console.log("   Input value after edit:", chatInput?.value);
                console.log("   Input placeholder after edit:", chatInput?.placeholder);
            }
        }
    }
    
    // Test 2: Remote User Message (should show fallback avatar)
    const remoteUserMessage = {
        id: 'test-remote-user-456',
        content: 'This is a test message from remote user',
        user_email: 'daveroom@gmail.com',
        conversationId: 'test-conv-1',
        reactionCount: 0,
        replyCount: 0,
        hasReplies: false,
        createdAt: new Date().toISOString()
    };
    
    console.log("Testing remote user message...");
    await window.addMessageToChat(remoteUserMessage);
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const remoteUserMsg = chatMessagesContainer.querySelector(`[data-message-id="${remoteUserMessage.id}"]`);
    if (remoteUserMsg) {
        const avatar = remoteUserMsg.querySelector('.avatar-container img')?.src;
        const messageMenu = remoteUserMsg.querySelector('.message-actions');
        const authorName = remoteUserMsg.querySelector('.message-sender-name')?.textContent;
        
        console.log("✅ Remote User Message:");
        console.log("   Author Name:", authorName);
        console.log("   Avatar:", avatar);
        console.log("   Message Menu (should be empty for remote user):", !!messageMenu);
        
        // Remote user messages should not have edit/delete menu
        if (!messageMenu) {
            console.log("✅ Remote user message correctly has no edit/delete menu");
        } else {
            console.log("❌ Remote user message incorrectly has edit/delete menu");
        }
    }
    
    console.log("--- COMP Method UI Fixes Test Complete ---");
    return true;
}

// Expose to window for easy access
window.testCOMPUIFixes = testCOMPUIFixes;

console.log("✅ TEST SCRIPT: test_comp_ui_fixes.js loaded. Use testCOMPUIFixes() in console.");
