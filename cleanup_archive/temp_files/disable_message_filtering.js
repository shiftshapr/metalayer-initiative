// SD1 EMERGENCY FIX: Disable message filtering to show all messages
console.log('🚨 SD1 EMERGENCY FIX: Disabling message filtering to show all messages');

// Override the filtering logic in CanopiModule.js
if (typeof window.loadChatHistory === 'function') {
  console.log('🚨 SD1: Overriding loadChatHistory filtering logic...');
  
  // Store original function
  const originalLoadChatHistory = window.loadChatHistory;
  
  // Create new function that bypasses filtering
  window.loadChatHistory = async function() {
    console.log('🚨 SD1 OVERRIDE: loadChatHistory called - bypassing all filtering');
    
    try {
      // Get the API response directly
      const api = window.api;
      if (!api || !api.getChatHistory) {
        console.error('❌ SD1: API not available');
        return;
      }
      
      const activeCommunities = window.activeCommunities || ['comm-001'];
      const currentUri = window.currentUrlData?.normalizedUrl || 'google.com/';
      
      console.log('🚨 SD1: Loading messages for communities:', activeCommunities);
      console.log('🚨 SD1: Current URI:', currentUri);
      
      const allConversations = [];
      
      for (const communityId of activeCommunities) {
        try {
          console.log('🚨 SD1: Requesting chat history from API for community:', communityId);
          const response = await api.getChatHistory(communityId, null, currentUri);
          
          if (response.conversations && response.conversations.length > 0) {
            console.log(`🚨 SD1: Found ${response.conversations.length} conversations for community ${communityId}`);
            
            // Find community name
            const communities = window.communities || [];
            const community = communities.find(c => c.id === communityId);
            const communityName = community ? community.name : `Community ${communityId}`;
            
            // Add community info to each conversation
            const conversationsWithCommunity = response.conversations.map(conv => ({
              ...conv,
              communityId: communityId,
              communityName: communityName
            }));
            allConversations.push(...conversationsWithCommunity);
            console.log(`🚨 SD1: Added ${conversationsWithCommunity.length} conversations from ${communityName}`);
          }
        } catch (error) {
          console.error(`❌ SD1: Error loading chat history for community ${communityId}:`, error);
        }
      }
      
      console.log('🚨 SD1: Total conversations to process:', allConversations.length);
      
      // Find chat messages container
      const chatMessages = document.querySelector('.chat-messages');
      if (!chatMessages) {
        console.error('❌ SD1: Chat messages container not found');
        return;
      }
      
      console.log('🚨 SD1: Found chat-messages element');
      
      // Clear existing messages
      chatMessages.innerHTML = '';
      console.log('🚨 SD1: Cleared existing messages');
      
      // Process each conversation WITHOUT filtering
      for (const conversation of allConversations) {
        console.log(`🚨 SD1: Processing conversation ${conversation.id} with ${conversation.posts?.length || 0} posts`);
        
        if (conversation.posts && conversation.posts.length > 0) {
          // Sort posts by creation time
          const sortedPosts = conversation.posts.sort((a, b) => {
            const timeA = new Date(a.createdAt || a.created_at || 0).getTime();
            const timeB = new Date(b.createdAt || b.created_at || 0).getTime();
            return timeA - timeB;
          });
          
          console.log(`🚨 SD1: Sorted ${sortedPosts.length} posts by creation time`);
          
          // Add ALL posts without filtering
          for (const post of sortedPosts) {
            console.log(`🚨 SD1: Adding post ${post.id} - body: "${post.body || post.content}"`);
            
            // Use the existing addMessageToChat function
            if (typeof window.addMessageToChat === 'function') {
              await window.addMessageToChat(post);
              console.log(`✅ SD1: Added post ${post.id} to chat`);
            } else {
              console.error('❌ SD1: addMessageToChat function not available');
            }
          }
        }
      }
      
      console.log('✅ SD1: All messages added without filtering');
      
    } catch (error) {
      console.error('❌ SD1: Error in overridden loadChatHistory:', error);
    }
  };
  
  console.log('✅ SD1: Message filtering disabled - all messages will be shown');
  
  // Reload chat history with disabled filtering
  console.log('🚨 SD1: Reloading chat history with disabled filtering...');
  await window.loadChatHistory();
  
} else {
  console.error('❌ SD1: loadChatHistory function not available');
}
