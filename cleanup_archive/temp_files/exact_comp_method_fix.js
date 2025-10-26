// ===== EXACT COMP METHOD FIX: FOLLOWING COMP EXACTLY =====
// This script implements the exact COMP method for message persistence

console.log('🔧 EXACT COMP FIX: Starting exact COMP method implementation...');

function implementExactCOMPMethod() {
  console.log('🔧 EXACT COMP FIX: Implementing exact COMP method...');
  
  // COMP METHOD: The issue is that messages are being saved to Supabase but not displayed
  // The COMP method uses addMessageToChat to display messages
  // We need to ensure this function is called properly
  
  // Step 1: Check if addMessageToChat is available
  if (typeof window.addMessageToChat === 'function') {
    console.log('✅ EXACT COMP FIX: addMessageToChat function is available');
    
    // Step 2: Force load messages using COMP method
    forceLoadMessagesCOMP();
  } else {
    console.error('❌ EXACT COMP FIX: addMessageToChat function not available');
    console.log('🔧 EXACT COMP FIX: This is the core issue - COMP method requires addMessageToChat');
  }
}

function forceLoadMessagesCOMP() {
  console.log('🔧 EXACT COMP FIX: Force loading messages using COMP method...');
  
  // COMP METHOD: Clear all skip logic
  if (window.lastLoadedPageId) {
    console.log('🔧 EXACT COMP FIX: Clearing lastLoadedPageId:', window.lastLoadedPageId);
    window.lastLoadedPageId = null;
  }
  
  if (window.lastLoadedUri) {
    console.log('🔧 EXACT COMP FIX: Clearing lastLoadedUri:', window.lastLoadedUri);
    window.lastLoadedUri = null;
  }
  
  if (window.isLoadingChatHistory) {
    console.log('🔧 EXACT COMP FIX: Resetting isLoadingChatHistory flag');
    window.isLoadingChatHistory = false;
  }
  
  // COMP METHOD: Call loadChatHistory which should call addMessageToChat
  if (typeof window.loadChatHistory === 'function') {
    console.log('🔧 EXACT COMP FIX: Calling loadChatHistory using COMP method...');
    window.loadChatHistory().then(() => {
      console.log('✅ EXACT COMP FIX: loadChatHistory completed');
      
      // Check if messages are now visible
      const messages = document.querySelectorAll('.message');
      console.log('🔍 EXACT COMP FIX: Messages visible after COMP method:', messages.length);
      
      if (messages.length === 0) {
        console.log('⚠️ EXACT COMP FIX: Still no messages - checking if they exist in database');
        checkDatabaseAndDisplayCOMP();
      } else {
        console.log('✅ EXACT COMP FIX: Messages are now visible using COMP method!');
      }
    }).catch(error => {
      console.error('❌ EXACT COMP FIX: loadChatHistory failed:', error);
    });
  } else {
    console.error('❌ EXACT COMP FIX: loadChatHistory function not available');
  }
}

function checkDatabaseAndDisplayCOMP() {
  console.log('🔧 EXACT COMP FIX: Checking database and displaying using COMP method...');
  
  const currentPageId = window.currentUrlData?.pageId;
  if (!currentPageId) {
    console.error('❌ EXACT COMP FIX: No page ID available');
    return;
  }
  
  // COMP METHOD: Query Supabase directly and use addMessageToChat
  if (window.supabase && window.supabase.from) {
    console.log('�� EXACT COMP FIX: Querying Supabase directly...');
    
    window.supabase
      .from('messages')
      .select('*')
      .eq('page_id', currentPageId)
      .order('created_at', { ascending: true })
      .then(({ data, error }) => {
        if (error) {
          console.error('❌ EXACT COMP FIX: Supabase query failed:', error);
          return;
        }
        
        console.log('🔍 EXACT COMP FIX: Supabase messages found:', data.length);
        
        if (data && data.length > 0) {
          console.log('✅ EXACT COMP FIX: Messages found in database');
          console.log('🔧 EXACT COMP FIX: Displaying messages using COMP method addMessageToChat...');
          
          // COMP METHOD: Use addMessageToChat for each message
          data.forEach((message, index) => {
            console.log(`🔧 EXACT COMP FIX: Adding message ${index + 1} using addMessageToChat:`, message.id);
            
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
              console.error('❌ EXACT COMP FIX: addMessageToChat not available for message:', message.id);
            }
          });
          
          console.log('✅ EXACT COMP FIX: All messages added using COMP method');
        } else {
          console.log('⚠️ EXACT COMP FIX: No messages found in database');
        }
      });
  } else {
    console.error('❌ EXACT COMP FIX: Supabase client not available');
  }
}

function testCOMPMethod() {
  console.log('🔧 EXACT COMP FIX: Testing COMP method...');
  
  // Test 1: Check if COMP functions are available
  console.log('🔍 EXACT COMP FIX: COMP function availability:');
  console.log('  - addMessageToChat:', typeof window.addMessageToChat);
  console.log('  - loadChatHistory:', typeof window.loadChatHistory);
  console.log('  - supabase:', typeof window.supabase);
  
  // Test 2: Check current state
  const messages = document.querySelectorAll('.message');
  console.log('🔍 EXACT COMP FIX: Current visible messages:', messages.length);
  
  // Test 3: Check page ID
  const currentPageId = window.currentUrlData?.pageId;
  console.log('🔍 EXACT COMP FIX: Current page ID:', currentPageId);
  
  // Test 4: Check skip logic
  console.log('🔍 EXACT COMP FIX: Skip logic state:');
  console.log('  - lastLoadedPageId:', window.lastLoadedPageId);
  console.log('  - lastLoadedUri:', window.lastLoadedUri);
  console.log('  - isLoadingChatHistory:', window.isLoadingChatHistory);
}

function runExactCOMPMethodFix() {
  console.log('🚀 EXACT COMP FIX: Starting exact COMP method fix...');
  
  // Step 1: Test the current state
  testCOMPMethod();
  
  // Step 2: Implement the exact COMP method
  implementExactCOMPMethod();
  
  console.log('✅ EXACT COMP FIX: Exact COMP method fix completed');
}

// Export functions
window.implementExactCOMPMethod = implementExactCOMPMethod;
window.forceLoadMessagesCOMP = forceLoadMessagesCOMP;
window.checkDatabaseAndDisplayCOMP = checkDatabaseAndDisplayCOMP;
window.testCOMPMethod = testCOMPMethod;
window.runExactCOMPMethodFix = runExactCOMPMethodFix;

// Auto-run the fix
console.log('🔧 EXACT COMP FIX: Auto-running exact COMP method fix...');
runExactCOMPMethodFix();

console.log('🔧 EXACT COMP FIX: Script loaded. Available functions:');
console.log('  - implementExactCOMPMethod()');
console.log('  - forceLoadMessagesCOMP()');
console.log('  - checkDatabaseAndDisplayCOMP()');
console.log('  - testCOMPMethod()');
console.log('  - runExactCOMPMethodFix()');
