// test_ui_components.js
// Test script to verify UI components are working

async function testUIComponents() {
    console.log("--- Testing UI Components ---");
    
    const chatMessagesContainer = document.querySelector('.chat-messages');
    if (!chatMessagesContainer) {
        console.error("❌ Test Failed: .chat-messages container not found.");
        return false;
    }
    
    // Find all messages
    const messages = chatMessagesContainer.querySelectorAll('.message');
    console.log(`Found ${messages.length} messages`);
    
    messages.forEach((message, index) => {
        console.log(`\n--- Message ${index + 1} ---`);
        
        // Check message ID
        const messageId = message.dataset.messageId;
        console.log("Message ID:", messageId);
        
        // Check author name
        const authorName = message.querySelector('.message-sender-name')?.textContent;
        console.log("Author Name:", authorName);
        
        // Check avatar
        const avatar = message.querySelector('.avatar-container img')?.src;
        console.log("Avatar URL:", avatar);
        
        // Check message action menu
        const messageActions = message.querySelector('.message-actions');
        console.log("Message Actions:", !!messageActions);
        if (messageActions) {
            const editBtn = messageActions.querySelector('.edit-btn');
            const deleteBtn = messageActions.querySelector('.delete-btn');
            console.log("  Edit Button:", !!editBtn);
            console.log("  Delete Button:", !!deleteBtn);
        }
        
        // Check reaction button
        const reactionBtn = message.querySelector('.reaction-btn');
        console.log("Reaction Button:", !!reactionBtn);
        if (reactionBtn) {
            const countSpan = reactionBtn.querySelector('.icon-count');
            console.log("  Reaction Count:", countSpan?.textContent || '0');
        }
        
        // Check reply button
        const replyBtn = message.querySelector('.inline-reply-btn');
        console.log("Reply Button:", !!replyBtn);
        
        // Check if buttons are clickable
        if (reactionBtn) {
            console.log("Testing reaction button click...");
            try {
                reactionBtn.click();
                console.log("  ✅ Reaction button click successful");
            } catch (error) {
                console.log("  ❌ Reaction button click failed:", error);
            }
        }
        
        if (replyBtn) {
            console.log("Testing reply button click...");
            try {
                replyBtn.click();
                console.log("  ✅ Reply button click successful");
            } catch (error) {
                console.log("  ❌ Reply button click failed:", error);
            }
        }
        
        if (messageActions) {
            const editBtn = messageActions.querySelector('.edit-btn');
            if (editBtn) {
                console.log("Testing edit button click...");
                try {
                    editBtn.click();
                    console.log("  ✅ Edit button click successful");
                } catch (error) {
                    console.log("  ❌ Edit button click failed:", error);
                }
            }
        }
    });
    
    console.log("\n--- UI Components Test Complete ---");
    return true;
}

// Expose to window for easy access
window.testUIComponents = testUIComponents;

console.log("✅ TEST SCRIPT: test_ui_components.js loaded. Use testUIComponents() in console.");
