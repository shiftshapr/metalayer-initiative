// ===== COMP METHOD ANALYSIS: MESSAGE PERSISTENCE DIAGNOSTIC =====
// This script analyzes why messages are being saved but not persisting

console.log('🔧 COMP ANALYSIS: Starting message persistence analysis...');

function analyzeMessagePersistence() {
  console.log('🔧 COMP ANALYSIS: Analyzing message persistence issues...');
  
  // Check 1: Are messages being saved to Supabase?
  console.log('🔍 COMP ANALYSIS: Checking if messages are being saved to Supabase...');
  
  if (window.supabase && window.supabase.from) {
    console.log('✅ COMP ANALYSIS: Supabase client available');
    
    const currentPageId = window.currentUrlData?.pageId;
    console.log('🔍 COMP ANALYSIS: Current page ID:', currentPageId);
    
    if (currentPageId) {
      // Query messages directly from Supabase
      window.supabase
        .from('messages')
        .select('*')
        .eq('page_id', currentPageId)
        .order('created_at', { ascending: true })
        .then(({ data, error }) => {
          if (error) {
            console.error('❌ COMP ANALYSIS: Supabase query failed:', error);
            return;
          }
          
          console.log('🔍 COMP ANALYSIS: Supabase messages found:', data.length);
          console.log('🔍 COMP ANALYSIS: Supabase messages:', data);
          
          if (data && data.length > 0) {
            console.log('✅ COMP ANALYSIS: Messages ARE being saved to Supabase');
            console.log('🔍 COMP ANALYSIS: Message details:');
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
            
            // Check if messages are being filtered out
            analyzeMessageFiltering(data);
          } else {
            console.log('⚠️ COMP ANALYSIS: No messages found in Supabase');
            console.log('🔍 COMP ANALYSIS: This suggests messages are not being saved');
          }
        });
    } else {
      console.error('❌ COMP ANALYSIS: No page ID available');
    }
  } else {
    console.error('❌ COMP ANALYSIS: Supabase client not available');
  }
}

function analyzeMessageFiltering(messages) {
  console.log('🔧 COMP ANALYSIS: Analyzing message filtering...');
  
  // Check the filtering logic from the logs
  messages.forEach((message, index) => {
    console.log(`🔍 COMP ANALYSIS: Message ${index + 1} filtering analysis:`, {
      id: message.id,
      content: message.content,
      deleted_at: message.deleted_at,
      hasReplies: message.hasReplies || false,
      isDeleted: !!message.deleted_at,
      wouldBeFiltered: !!message.deleted_at && !message.hasReplies
    });
    
    // Check if this message would be filtered out
    const isDeleted = !!message.deleted_at;
    const hasReplies = message.hasReplies || false;
    const messageAge = new Date() - new Date(message.created_at);
    const isRecentMessage = messageAge < 24 * 60 * 60 * 1000; // Less than 24 hours old
    
    if (isDeleted && !hasReplies && !isRecentMessage) {
      console.log(`❌ COMP ANALYSIS: Message ${message.id} would be FILTERED OUT as deleted without replies`);
    } else if (isDeleted) {
      console.log(`✅ COMP ANALYSIS: Message ${message.id} would be SHOWN (deleted but has replies or is recent)`);
    } else {
      console.log(`✅ COMP ANALYSIS: Message ${message.id} would be SHOWN (not deleted)`);
    }
  });
}

function checkAPIMessages() {
  console.log('🔧 COMP ANALYSIS: Checking API messages...');
  
  const currentPageId = window.currentUrlData?.pageId;
  if (!currentPageId) {
    console.error('❌ COMP ANALYSIS: No page ID available for API check');
    return;
  }
  
  // Try to get messages from the API
  if (window.apiModule && typeof window.apiModule.getChatHistory === 'function') {
    console.log('🔧 COMP ANALYSIS: Using API module to get chat history...');
    window.apiModule.getChatHistory(currentPageId).then(data => {
      console.log('🔍 COMP ANALYSIS: API response:', data);
      
      if (data && data.length > 0) {
        console.log('✅ COMP ANALYSIS: API returned messages:', data.length);
        console.log('🔍 COMP ANALYSIS: API messages:', data);
        
        // Check if API messages match Supabase messages
        compareAPIVsSupabase(data);
      } else {
        console.log('⚠️ COMP ANALYSIS: API returned no messages');
      }
    }).catch(error => {
      console.error('❌ COMP ANALYSIS: API call failed:', error);
    });
  } else {
    console.log('⚠️ COMP ANALYSIS: API module not available');
  }
}

function compareAPIVsSupabase(apiMessages) {
  console.log('🔧 COMP ANALYSIS: Comparing API vs Supabase messages...');
  
  // This would need to be called after the Supabase query completes
  console.log('🔍 COMP ANALYSIS: API messages count:', apiMessages.length);
  console.log('🔍 COMP ANALYSIS: This suggests the issue might be in the API vs Supabase sync');
}

function runMessagePersistenceAnalysis() {
  console.log('🚀 COMP ANALYSIS: Starting message persistence analysis...');
  
  // Step 1: Check Supabase messages
  analyzeMessagePersistence();
  
  // Step 2: Check API messages
  setTimeout(() => {
    checkAPIMessages();
  }, 1000);
  
  console.log('✅ COMP ANALYSIS: Message persistence analysis completed');
}

// Export functions
window.analyzeMessagePersistence = analyzeMessagePersistence;
window.analyzeMessageFiltering = analyzeMessageFiltering;
window.checkAPIMessages = checkAPIMessages;
window.compareAPIVsSupabase = compareAPIVsSupabase;
window.runMessagePersistenceAnalysis = runMessagePersistenceAnalysis;

// Auto-run the analysis
console.log('🔧 COMP ANALYSIS: Auto-running message persistence analysis...');
runMessagePersistenceAnalysis();

console.log('🔧 COMP ANALYSIS: Script loaded. Available functions:');
console.log('  - analyzeMessagePersistence()');
console.log('  - analyzeMessageFiltering(messages)');
console.log('  - checkAPIMessages()');
console.log('  - compareAPIVsSupabase(apiMessages)');
console.log('  - runMessagePersistenceAnalysis()');
