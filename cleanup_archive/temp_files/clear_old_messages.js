// Script to clear old deleted messages from database
console.log('🧹 CLEARING: Old deleted messages from database');

async function clearOldMessages() {
  console.log('🧹 CLEARING: Starting database cleanup...');
  
  if (!window.supabase) {
    console.error('❌ CLEARING: Supabase not available');
    return;
  }
  
  try {
    // Delete all messages with [Deleted] body content
    const { data, error } = await window.supabase
      .from('messages')
      .delete()
      .eq('content', '[Deleted]');
    
    if (error) {
      console.error('❌ CLEARING: Error deleting old messages:', error);
      return;
    }
    
    console.log('✅ CLEARING: Deleted old messages:', data);
    console.log('✅ CLEARING: Database cleanup complete');
    
    // Reload chat history
    if (typeof window.loadChatHistory === 'function') {
      console.log('🔄 CLEARING: Reloading chat history...');
      await window.loadChatHistory();
      console.log('✅ CLEARING: Chat history reloaded');
    }
    
  } catch (error) {
    console.error('❌ CLEARING: Error during cleanup:', error);
  }
}

// Run the cleanup
clearOldMessages();
