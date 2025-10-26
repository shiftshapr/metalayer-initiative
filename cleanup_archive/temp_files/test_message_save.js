// Test script to verify message saving
console.log('🧪 TESTING: Message saving verification');

async function testMessageSave() {
  console.log('🧪 TESTING: Testing message save functionality...');
  
  if (!window.supabaseRealtimeClient) {
    console.error('❌ TESTING: SupabaseRealtimeClient not available');
    return;
  }
  
  try {
    // Send a test message
    const testMessage = 'Test Message Save ' + Date.now();
    console.log('🧪 TESTING: Sending test message:', testMessage);
    
    const result = await window.supabaseRealtimeClient.sendMessage(testMessage);
    console.log('🧪 TESTING: Send result:', result);
    
    if (result && result.id) {
      console.log('✅ TESTING: Message saved successfully with ID:', result.id);
      
      // Wait a moment for the message to propagate
      setTimeout(async () => {
        console.log('🔄 TESTING: Checking if message appears in chat...');
        
        // Check if the message appears in the DOM
        const messages = document.querySelectorAll('.message');
        console.log('🧪 TESTING: Found', messages.length, 'messages in DOM');
        
        // Check if our test message is visible
        const testMessageElement = Array.from(messages).find(msg => 
          msg.textContent.includes(testMessage)
        );
        
        if (testMessageElement) {
          console.log('✅ TESTING: Test message found in DOM');
        } else {
          console.log('❌ TESTING: Test message NOT found in DOM');
        }
        
        // Reload chat history to see if it persists
        if (typeof window.loadChatHistory === 'function') {
          console.log('🔄 TESTING: Reloading chat history...');
          await window.loadChatHistory();
          console.log('✅ TESTING: Chat history reloaded');
        }
        
      }, 2000);
      
    } else {
      console.log('❌ TESTING: Message save failed');
    }
    
  } catch (error) {
    console.error('❌ TESTING: Error during test:', error);
  }
}

// Run the test
testMessageSave();
