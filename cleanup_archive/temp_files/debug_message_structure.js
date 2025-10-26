// SD1 + TA2 + JAUmemory: Debug Message Structure Analysis
console.log('🔍 SD1+TA2+JAUmemory: Analyzing message structure to find deviation from COMP');

async function debugMessageStructure() {
  console.log('🔍 DEBUG: Starting message structure analysis...');
  
  if (!window.supabase) {
    console.error('❌ DEBUG: Supabase not available');
    return;
  }
  
  try {
    // Query all messages to see their structure
    const { data: messages, error } = await window.supabase
      .from('messages')
      .select('*')
      .eq('page_id', 'google_com_')
      .order('created_at', { ascending: true })
      .limit(10);
    
    if (error) {
      console.error('❌ DEBUG: Database query failed:', error);
      return;
    }
    
    console.log('🔍 DEBUG: Found messages:', messages?.length || 0);
    console.log('🔍 DEBUG: Message structure analysis:');
    
    if (messages && messages.length > 0) {
      messages.forEach((msg, index) => {
        console.log(`🔍 DEBUG: Message ${index + 1}:`, {
          id: msg.id,
          content: msg.content,
          user_email: msg.user_email,
          page_id: msg.page_id,
          community_id: msg.community_id,
          created_at: msg.created_at,
          // Check if these fields exist
          parent_id: msg.parent_id,
          parentId: msg.parentId,
          thread_id: msg.thread_id,
          threadId: msg.threadId,
          deleted_at: msg.deleted_at,
          deletedAt: msg.deletedAt
        });
      });
      
      // Check for parentId field specifically
      const hasParentId = messages.some(msg => msg.parentId !== undefined);
      const hasParent_id = messages.some(msg => msg.parent_id !== undefined);
      const hasThreadId = messages.some(msg => msg.threadId !== undefined);
      const hasThread_id = messages.some(msg => msg.thread_id !== undefined);
      
      console.log('🔍 DEBUG: Field analysis:');
      console.log('🔍 DEBUG: Has parentId field:', hasParentId);
      console.log('🔍 DEBUG: Has parent_id field:', hasParent_id);
      console.log('🔍 DEBUG: Has threadId field:', hasThreadId);
      console.log('🔍 DEBUG: Has thread_id field:', hasThread_id);
      
      // Check actual parentId values
      const parentIdValues = messages.map(msg => ({
        id: msg.id,
        parentId: msg.parentId,
        parent_id: msg.parent_id,
        content: msg.content?.substring(0, 50)
      }));
      
      console.log('🔍 DEBUG: ParentId values:', parentIdValues);
      
      // Count main thread vs replies
      const mainThreadCount = messages.filter(msg => 
        (msg.parentId === null || msg.parentId === undefined) && 
        (msg.parent_id === null || msg.parent_id === undefined)
      ).length;
      
      const replyCount = messages.filter(msg => 
        msg.parentId !== null && msg.parentId !== undefined
      ).length;
      
      console.log('🔍 DEBUG: Main thread posts (parentId === null):', mainThreadCount);
      console.log('🔍 DEBUG: Reply posts (parentId !== null):', replyCount);
      
    } else {
      console.log('❌ DEBUG: No messages found');
    }
    
  } catch (error) {
    console.error('❌ DEBUG: Error during analysis:', error);
  }
}

// Run the analysis
debugMessageStructure();
