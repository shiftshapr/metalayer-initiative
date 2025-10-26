// ===== EXACT COMP METHOD FIX: API QUERY ISSUE =====
// The issue is that the API is returning old deleted messages instead of current messages

console.log('🔧 EXACT COMP API FIX: Starting exact COMP method fix for API query issue...');

function fixAPIQueryIssue() {
  console.log('🔧 EXACT COMP API FIX: Fixing API query issue...');
  
  // The issue is that the API is returning old deleted messages instead of current messages
  // We need to query Supabase directly for current messages
  
  const currentPageId = window.currentUrlData?.pageId;
  if (!currentPageId) {
    console.error('❌ EXACT COMP API FIX: No page ID available');
    return;
  }
  
  console.log('🔧 EXACT COMP API FIX: Current page ID:', currentPageId);
  
  // COMP METHOD: Query Supabase directly for current messages
  if (window.supabase && window.supabase.from) {
    console.log('🔧 EXACT COMP API FIX: Querying Supabase directly for current messages...');
    
    window.supabase
      .from('messages')
      .select('*')
      .eq('page_id', currentPageId)
      .is('deleted_at', null) // Only get non-deleted messages
      .order('created_at', { ascending: true })
      .then(({ data, error }) => {
        if (error) {
          console.error('❌ EXACT COMP API FIX: Supabase query failed:', error);
          return;
        }
        
        console.log('🔍 EXACT COMP API FIX: Current messages found:', data.length);
        
        if (data && data.length > 0) {
          console.log('✅ EXACT COMP API FIX: Found current messages in database');
          console.log('🔧 EXACT COMP API FIX: Displaying current messages using COMP method...');
          
          // Clear existing messages
          const chatMessages = document.querySelector('.chat-messages');
          if (chatMessages) {
            chatMessages.innerHTML = '';
            console.log('🔧 EXACT COMP API FIX: Cleared existing messages');
          }
          
          // COMP METHOD: Use addMessageToChat for each current message
          data.forEach((message, index) => {
            console.log(`🔧 EXACT COMP API FIX: Adding current message ${index + 1}:`, message.id);
            
            // Transform the message to match COMP method format
            const compMessage = {
              id: message.id,
              body: message.content,
              content: message.content,
              author: {
                name: message.user_name || message.user_email,
                avatarUrl: message.user_avatar || message.avatar_url
              },
              user_email: message.user_email,
              createdAt: message.created_at,
              updatedAt: message.updated_at,
              deletedAt: message.deleted_at,
              hasReplies: message.hasReplies || false,
              conversationId: message.conversation_id,
              pageId: message.page_id
            };
            
            // COMP METHOD: Call addMessageToChat exactly as COMP does
            if (typeof window.addMessageToChat === 'function') {
              window.addMessageToChat(compMessage);
            } else {
              console.error('❌ EXACT COMP API FIX: addMessageToChat not available for message:', message.id);
            }
          });
          
          console.log('✅ EXACT COMP API FIX: All current messages added using COMP method');
        } else {
          console.log('⚠️ EXACT COMP API FIX: No current messages found in database');
        }
      });
  } else {
    console.error('❌ EXACT COMP API FIX: Supabase client not available');
  }
}

function testCurrentMessages() {
  console.log('🔧 EXACT COMP API FIX: Testing current messages...');
  
  const currentPageId = window.currentUrlData?.pageId;
  console.log('🔍 EXACT COMP API FIX: Current page ID:', currentPageId);
  
  // Check what messages are currently visible
  const messages = document.querySelectorAll('.message');
  console.log('🔍 EXACT COMP API FIX: Currently visible messages:', messages.length);
  
  // Check if we have the right functions
  console.log('🔍 EXACT COMP API FIX: Function availability:');
  console.log('  - addMessageToChat:', typeof window.addMessageToChat);
  console.log('  - supabase:', typeof window.supabase);
}

function runExactCOMPAPIFix() {
  console.log('🚀 EXACT COMP API FIX: Starting exact COMP method fix for API query issue...');
  
  // Step 1: Test the current state
  testCurrentMessages();
  
  // Step 2: Fix the API query issue
  fixAPIQueryIssue();
  
  console.log('✅ EXACT COMP API FIX: Exact COMP method fix for API query issue completed');
}

// Export functions
window.fixAPIQueryIssue = fixAPIQueryIssue;
window.testCurrentMessages = testCurrentMessages;
window.runExactCOMPAPIFix = runExactCOMPAPIFix;

// Auto-run the fix
console.log('🔧 EXACT COMP API FIX: Auto-running exact COMP method fix for API query issue...');
runExactCOMPAPIFix();

console.log('🔧 EXACT COMP API FIX: Script loaded. Available functions:');
console.log('  - fixAPIQueryIssue()');
console.log('  - testCurrentMessages()');
console.log('  - runExactCOMPAPIFix()');
