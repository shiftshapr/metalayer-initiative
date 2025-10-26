// SD1 SOLUTION: Clear old deleted messages and test fresh message persistence
console.log('🧹 SD1 SOLUTION: Clearing old deleted messages and testing fresh persistence');

async function clearDatabaseAndTest() {
  console.log('🧹 SD1: Starting database cleanup and fresh test...');
  
  if (!window.supabase) {
    console.error('❌ SD1: Supabase not available');
    return;
  }
  
  try {
    // Step 1: Clear all old deleted messages
    console.log('🧹 SD1 STEP 1: Clearing old deleted messages...');
    const { data: deleteResult, error: deleteError } = await window.supabase
      .from('messages')
      .delete()
      .eq('content', '[Deleted]');
    
    if (deleteError) {
      console.error('❌ SD1: Error deleting old messages:', deleteError);
      return;
    }
    
    console.log('✅ SD1: Deleted old messages:', deleteResult);
    
    // Step 2: Check current message count
    console.log('🧹 SD1 STEP 2: Checking current message count...');
    const { data: currentMessages, error: countError } = await window.supabase
      .from('messages')
      .select('id, content, created_at')
      .order('created_at', { ascending: false });
    
    if (countError) {
      console.error('❌ SD1: Error counting messages:', countError);
      return;
    }
    
    console.log('🔍 SD1: Current messages in database:', currentMessages?.length || 0);
    console.log('🔍 SD1: Recent messages:', currentMessages?.slice(0, 5));
    
    // Step 3: Reload chat history
    console.log('🧹 SD1 STEP 3: Reloading chat history...');
    if (typeof window.loadChatHistory === 'function') {
      await window.loadChatHistory();
      console.log('✅ SD1: Chat history reloaded');
    }
    
    // Step 4: Test new message creation
    console.log('🧹 SD1 STEP 4: Testing new message creation...');
    const testMessage = 'Fresh Test Message ' + Date.now();
    console.log('🧹 SD1: Sending test message:', testMessage);
    
    const result = await window.sendMessageViaSupabase(testMessage);
    console.log('🧹 SD1: Send result:', result);
    
    if (result && result.id) {
      console.log('✅ SD1: Fresh message sent successfully with ID:', result.id);
      
      // Step 5: Verify message appears in chat
      setTimeout(() => {
        const messages = document.querySelectorAll('.message');
        console.log('🔍 SD1: Messages in DOM:', messages.length);
        
        const testMessageElement = Array.from(messages).find(msg => 
          msg.textContent.includes(testMessage)
        );
        
        if (testMessageElement) {
          console.log('✅ SD1: Fresh test message found in DOM');
          console.log('✅ SD1: SOLUTION SUCCESSFUL - Message persistence working correctly');
        } else {
          console.log('❌ SD1: Fresh test message NOT found in DOM');
        }
      }, 2000);
      
    } else {
      console.log('❌ SD1: Fresh message send failed');
    }
    
  } catch (error) {
    console.error('❌ SD1: Error during cleanup and test:', error);
  }
}

// Run the solution
clearDatabaseAndTest();
