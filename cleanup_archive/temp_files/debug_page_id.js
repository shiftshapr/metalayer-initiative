// SD1 + TA2 + JAUmemory: Debug pageId filtering
console.log('🔍 DEBUG: Checking pageId filtering in modular system');

async function debugPageId() {
  console.log('🔍 DEBUG: Current URL data:', window.currentUrlData);
  console.log('🔍 DEBUG: Current pageId:', window.currentUrlData?.pageId);
  
  if (!window.supabase) {
    console.error('❌ DEBUG: Supabase not available');
    return;
  }
  
  try {
    // Check what pageId is being used
    const currentUri = window.currentUrlData?.normalizedUrl || 'google.com/';
    console.log('🔍 DEBUG: Current URI:', currentUri);
    
    // Normalize URL like COMP does
    const normalizedUrl = await window.normalizeUrl(currentUri);
    const pageId = normalizedUrl.pageId;
    console.log('🔍 DEBUG: Normalized pageId:', pageId);
    
    // Query messages for this specific pageId
    const { data: messages, error } = await window.supabase
      .from('messages')
      .select('*')
      .eq('page_id', pageId)
      .order('created_at', { ascending: true });
    
    if (error) {
      console.error('❌ DEBUG: Query failed:', error);
      return;
    }
    
    console.log('🔍 DEBUG: Messages for current pageId:', messages?.length || 0);
    console.log('🔍 DEBUG: Message pageIds:', messages?.map(m => m.page_id) || []);
    
    // Check all unique pageIds in database
    const { data: allMessages, error: allError } = await window.supabase
      .from('messages')
      .select('page_id')
      .order('created_at', { ascending: true });
    
    if (allError) {
      console.error('❌ DEBUG: All messages query failed:', allError);
      return;
    }
    
    const uniquePageIds = [...new Set(allMessages?.map(m => m.page_id) || [])];
    console.log('🔍 DEBUG: All unique pageIds in database:', uniquePageIds);
    console.log('🔍 DEBUG: Current pageId matches any:', uniquePageIds.includes(pageId));
    
  } catch (error) {
    console.error('❌ DEBUG: Error during analysis:', error);
  }
}

// Run the debug
debugPageId();
