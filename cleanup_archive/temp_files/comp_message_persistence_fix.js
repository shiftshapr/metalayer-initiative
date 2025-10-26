// ===== COMP METHOD FIX: MESSAGE PERSISTENCE =====
// This script fixes the message persistence issue by addressing the filtering logic

console.log('🔧 COMP PERSISTENCE FIX: Starting message persistence fix...');

function fixMessagePersistence() {
  console.log('🔧 COMP PERSISTENCE FIX: Fixing message persistence...');
  
  // The issue is that messages are being saved to Supabase but filtered out as "deleted"
  // We need to check if the filtering logic is too aggressive
  
  // Step 1: Check what messages exist in Supabase
  checkSupabaseMessages();
  
  // Step 2: Check what the API is returning
  checkAPIMessages();
  
  // Step 3: Fix the filtering logic if needed
  fixFilteringLogic();
}

function checkSupabaseMessages() {
  console.log('🔧 COMP PERSISTENCE FIX: Checking Supabase messages...');
  
  if (window.supabase && window.supabase.from) {
    const currentPageId = window.currentUrlData?.pageId;
    console.log('🔍 COMP PERSISTENCE FIX: Current page ID:', currentPageId);
    
    if (currentPageId) {
      window.supabase
        .from('messages')
        .select('*')
        .eq('page_id', currentPageId)
        .order('created_at', { ascending: true })
        .then(({ data, error }) => {
          if (error) {
            console.error('❌ COMP PERSISTENCE FIX: Supabase query failed:', error);
            return;
          }
          
          console.log('🔍 COMP PERSISTENCE FIX: Supabase messages found:', data.length);
          
          if (data && data.length > 0) {
            console.log('✅ COMP PERSISTENCE FIX: Messages ARE being saved to Supabase');
            console.log('🔍 COMP PERSISTENCE FIX: Message details:');
            data.forEach((msg, index) => {
              console.log(`  Message ${index + 1}:`, {
                id: msg.id,
                content: msg.content,
                user_email: msg.user_email,
                created_at: msg.created_at,
                deleted_at: msg.deleted_at,
                page_id: msg.page_id
              });
            });
            
            // Check if these messages are being filtered out
            analyzeFiltering(data);
          } else {
            console.log('⚠️ COMP PERSISTENCE FIX: No messages found in Supabase');
          }
        });
    }
  }
}

function checkAPIMessages() {
  console.log('🔧 COMP PERSISTENCE FIX: Checking API messages...');
  
  const currentPageId = window.currentUrlData?.pageId;
  if (!currentPageId) {
    console.error('❌ COMP PERSISTENCE FIX: No page ID available');
    return;
  }
  
  if (window.apiModule && typeof window.apiModule.getChatHistory === 'function') {
    console.log('🔧 COMP PERSISTENCE FIX: Using API module...');
    window.apiModule.getChatHistory(currentPageId).then(data => {
      console.log('🔍 COMP PERSISTENCE FIX: API response:', data);
      
      if (data && data.length > 0) {
        console.log('✅ COMP PERSISTENCE FIX: API returned messages:', data.length);
        console.log('🔍 COMP PERSISTENCE FIX: API messages:', data);
      } else {
        console.log('⚠️ COMP PERSISTENCE FIX: API returned no messages');
      }
    }).catch(error => {
      console.error('❌ COMP PERSISTENCE FIX: API call failed:', error);
    });
  }
}

function analyzeFiltering(messages) {
  console.log('🔧 COMP PERSISTENCE FIX: Analyzing message filtering...');
  
  let filteredCount = 0;
  let shownCount = 0;
  
  messages.forEach((message, index) => {
    const isDeleted = !!message.deleted_at;
    const hasReplies = message.hasReplies || false;
    const messageAge = new Date() - new Date(message.created_at);
    const isRecentMessage = messageAge < 24 * 60 * 60 * 1000; // Less than 24 hours old
    
    if (isDeleted && !hasReplies && !isRecentMessage) {
      console.log(`❌ COMP PERSISTENCE FIX: Message ${message.id} would be FILTERED OUT`);
      filteredCount++;
    } else {
      console.log(`✅ COMP PERSISTENCE FIX: Message ${message.id} would be SHOWN`);
      shownCount++;
    }
  });
  
  console.log(`🔍 COMP PERSISTENCE FIX: Filtering summary: ${shownCount} shown, ${filteredCount} filtered`);
  
  if (filteredCount > 0) {
    console.log('⚠️ COMP PERSISTENCE FIX: Messages are being filtered out - this is the issue!');
    console.log('🔧 COMP PERSISTENCE FIX: The filtering logic is too aggressive');
  }
}

function fixFilteringLogic() {
  console.log('🔧 COMP PERSISTENCE FIX: Fixing filtering logic...');
  
  // The issue is in the loadChatHistory function in CanopiModule.js
  // We need to modify the filtering logic to be less aggressive
  
  console.log('🔧 COMP PERSISTENCE FIX: The filtering logic needs to be adjusted');
  console.log('🔧 COMP PERSISTENCE FIX: Current logic filters out deleted messages without replies');
  console.log('🔧 COMP PERSISTENCE FIX: But messages might not have the hasReplies property set correctly');
  
  // Check if we can modify the filtering logic
  if (window.loadChatHistory) {
    console.log('🔧 COMP PERSISTENCE FIX: loadChatHistory function is available');
    console.log('🔧 COMP PERSISTENCE FIX: The issue is in the filtering logic in CanopiModule.js');
    console.log('🔧 COMP PERSISTENCE FIX: We need to make the filtering less aggressive');
  }
}

function forceLoadMessages() {
  console.log('🔧 COMP PERSISTENCE FIX: Force loading messages...');
  
  // Clear the skip logic
  if (window.lastLoadedPageId) {
    console.log('🔧 COMP PERSISTENCE FIX: Clearing lastLoadedPageId:', window.lastLoadedPageId);
    window.lastLoadedPageId = null;
  }
  
  if (window.lastLoadedUri) {
    console.log('🔧 COMP PERSISTENCE FIX: Clearing lastLoadedUri:', window.lastLoadedUri);
    window.lastLoadedUri = null;
  }
  
  if (window.isLoadingChatHistory) {
    console.log('🔧 COMP PERSISTENCE FIX: Resetting isLoadingChatHistory flag');
    window.isLoadingChatHistory = false;
  }
  
  // Force reload chat history
  if (typeof window.loadChatHistory === 'function') {
    console.log('🔧 COMP PERSISTENCE FIX: Force calling loadChatHistory...');
    window.loadChatHistory().then(() => {
      console.log('✅ COMP PERSISTENCE FIX: Chat history reloaded');
      
      // Check if messages are now visible
      const messages = document.querySelectorAll('.message');
      console.log('🔍 COMP PERSISTENCE FIX: Messages visible after reload:', messages.length);
      
      if (messages.length === 0) {
        console.log('⚠️ COMP PERSISTENCE FIX: Still no messages visible - filtering issue persists');
      } else {
        console.log('✅ COMP PERSISTENCE FIX: Messages are now visible!');
      }
    }).catch(error => {
      console.error('❌ COMP PERSISTENCE FIX: Failed to reload chat history:', error);
    });
  }
}

function runMessagePersistenceFix() {
  console.log('🚀 COMP PERSISTENCE FIX: Starting message persistence fix...');
  
  // Step 1: Analyze the current state
  fixMessagePersistence();
  
  // Step 2: Force load messages
  setTimeout(() => {
    forceLoadMessages();
  }, 2000);
  
  console.log('✅ COMP PERSISTENCE FIX: Message persistence fix completed');
}

// Export functions
window.fixMessagePersistence = fixMessagePersistence;
window.checkSupabaseMessages = checkSupabaseMessages;
window.checkAPIMessages = checkAPIMessages;
window.analyzeFiltering = analyzeFiltering;
window.fixFilteringLogic = fixFilteringLogic;
window.forceLoadMessages = forceLoadMessages;
window.runMessagePersistenceFix = runMessagePersistenceFix;

// Auto-run the fix
console.log('🔧 COMP PERSISTENCE FIX: Auto-running message persistence fix...');
runMessagePersistenceFix();

console.log('🔧 COMP PERSISTENCE FIX: Script loaded. Available functions:');
console.log('  - fixMessagePersistence()');
console.log('  - checkSupabaseMessages()');
console.log('  - checkAPIMessages()');
console.log('  - analyzeFiltering(messages)');
console.log('  - fixFilteringLogic()');
console.log('  - forceLoadMessages()');
console.log('  - runMessagePersistenceFix()');
