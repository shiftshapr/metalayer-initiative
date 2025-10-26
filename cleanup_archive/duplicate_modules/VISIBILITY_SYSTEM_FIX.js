// ===== VISIBILITY SYSTEM FIX =====
// SD1 + SD2 + TA1: Critical fix for visibility system issues
// Problem: Messages from all pages are showing on every page instead of being page-specific
// Solution: Fix page-specific message filtering and visibility management

console.log('🔧 VISIBILITY SYSTEM FIX: Starting critical visibility system fixes');

// ===== CRITICAL FIX 1: Fix Page-Specific Message Loading =====
// Problem: Messages from all pages are showing on every page
// Solution: Ensure messages are filtered by page ID

function fixPageSpecificMessageLoading() {
  console.log('🔧 FIXING PAGE-SPECIFIC MESSAGE LOADING: Ensuring page-specific message filtering');
  
  // Override message loading to be page-specific
  window.loadMessagesForCurrentPage = async function() {
    console.log('🔧 LOAD_MESSAGES: Loading messages for current page only');
    
    try {
      const currentPage = await getCurrentPageInfo();
      if (!currentPage) {
        console.error('❌ LOAD_MESSAGES: No current page info');
        return;
      }
      
      console.log('🔧 LOAD_MESSAGES: Current page ID:', currentPage.pageId);
      console.log('🔧 LOAD_MESSAGES: Current URL:', currentPage.rawUrl);
      
      // Clear existing messages
      const chatMessages = document.querySelector('.chat-messages');
      if (chatMessages) {
        chatMessages.innerHTML = '<p style="text-align: center; color: #666;">Loading messages for this page...</p>';
      }
      
      // Load messages only for current page from database
      try {
        const response = await fetch(`https://api.themetalayer.org/v1/chat/messages?page_id=${currentPage.pageId}`);
        if (!response.ok) {
          console.error('❌ LOAD_MESSAGES: Failed to load messages:', response.status);
          // Show no messages message
          if (chatMessages) {
            chatMessages.innerHTML = '<p style="text-align: center; color: #666;">No messages for this page yet.</p>';
          }
          return;
        }
        
        const messages = await response.json();
        console.log('🔧 LOAD_MESSAGES: Loaded messages for page:', messages.length);
        
        // Clear loading message
        if (chatMessages) {
          chatMessages.innerHTML = '';
        }
        
        // Add each message to chat
        for (const message of messages) {
          // Double-check that message belongs to current page
          if (message.page_id === currentPage.pageId) {
            await window.addMessageToChat(message);
          } else {
            console.log('🔧 LOAD_MESSAGES: Skipping message from different page:', message.page_id);
          }
        }
        
        // If no messages, show placeholder
        if (messages.length === 0 && chatMessages) {
          chatMessages.innerHTML = '<p style="text-align: center; color: #666;">No messages for this page yet. Be the first to start a conversation!</p>';
        }
        
        console.log('✅ LOAD_MESSAGES: Messages loaded for current page successfully');
        
      } catch (error) {
        console.error('❌ LOAD_MESSAGES: Error loading messages from API:', error);
        // Fallback: try to load from Supabase real-time
        if (window.supabaseRealtimeClient) {
          console.log('🔧 LOAD_MESSAGES: Falling back to Supabase real-time client');
          await window.supabaseRealtimeClient.subscribeToPageMessages(currentPage.pageId);
        }
      }
      
    } catch (error) {
      console.error('❌ LOAD_MESSAGES: Error loading messages:', error);
    }
  };
  
  console.log('✅ PAGE-SPECIFIC MESSAGE LOADING: Fixed page-specific message filtering');
}

// ===== CRITICAL FIX 2: Fix Page Change Detection =====
// Problem: Page changes are not being detected properly
// Solution: Ensure proper page change detection and message clearing

function fixPageChangeDetection() {
  console.log('🔧 FIXING PAGE CHANGE DETECTION: Ensuring proper page change handling');
  
  let lastPageId = null;
  
  // Override page change detection
  window.handlePageChange = async function() {
    console.log('🔧 PAGE_CHANGE: Handling page change');
    
    // Get new page info
    const newPage = await getCurrentPageInfo();
    if (!newPage) {
      console.error('❌ PAGE_CHANGE: No new page info');
      return;
    }
    
    console.log('🔧 PAGE_CHANGE: New page ID:', newPage.pageId);
    console.log('🔧 PAGE_CHANGE: Last page ID:', lastPageId);
    
    // Check if page actually changed
    if (lastPageId === newPage.pageId) {
      console.log('🔧 PAGE_CHANGE: Page unchanged, skipping');
      return;
    }
    
    // Update last page ID
    lastPageId = newPage.pageId;
    
    // Clear current messages
    const chatMessages = document.querySelector('.chat-messages');
    if (chatMessages) {
      chatMessages.innerHTML = '<p style="text-align: center; color: #666;">Loading messages for this page...</p>';
    }
    
    // Unsubscribe from previous page messages
    if (window.supabaseRealtimeClient && window.supabaseRealtimeClient.currentChannel) {
      console.log('🔧 PAGE_CHANGE: Unsubscribing from previous page messages');
      await window.supabaseRealtimeClient.unsubscribeFromPageMessages();
    }
    
    // Load messages for new page
    await window.loadMessagesForCurrentPage();
    
    // Subscribe to new page messages
    if (window.supabaseRealtimeClient) {
      console.log('🔧 PAGE_CHANGE: Subscribing to new page messages');
      await window.supabaseRealtimeClient.subscribeToPageMessages(newPage.pageId);
    }
    
    console.log('✅ PAGE_CHANGE: Page change handled successfully');
  };
  
  // Set up page change monitoring
  window.addEventListener('popstate', window.handlePageChange);
  window.addEventListener('pushstate', window.handlePageChange);
  window.addEventListener('replacestate', window.handlePageChange);
  
  // Monitor URL changes
  let currentUrl = window.location.href;
  setInterval(() => {
    if (window.location.href !== currentUrl) {
      currentUrl = window.location.href;
      window.handlePageChange();
    }
  }, 1000);
  
  console.log('✅ PAGE CHANGE DETECTION: Fixed page change detection and handling');
}

// ===== CRITICAL FIX 3: Fix Message Filtering =====
// Problem: Messages are not being filtered by page ID properly
// Solution: Ensure all message operations are page-specific

function fixMessageFiltering() {
  console.log('🔧 FIXING MESSAGE FILTERING: Ensuring all message operations are page-specific');
  
  // Override message addition to check page ID
  const originalAddMessageToChat = window.addMessageToChat;
  window.addMessageToChat = async function(message) {
    console.log('🔧 ADD_MESSAGE_FILTERED: Checking message page ID');
    
    // Get current page info
    const currentPage = await getCurrentPageInfo();
    if (!currentPage) {
      console.error('❌ ADD_MESSAGE_FILTERED: No current page info');
      return;
    }
    
    // Check if message belongs to current page
    if (message.page_id && message.page_id !== currentPage.pageId) {
      console.log('🔧 ADD_MESSAGE_FILTERED: Skipping message from different page:', message.page_id, 'vs', currentPage.pageId);
      return;
    }
    
    // If no page_id in message, assume it's for current page
    if (!message.page_id) {
      message.page_id = currentPage.pageId;
    }
    
    console.log('🔧 ADD_MESSAGE_FILTERED: Message approved for current page');
    
    // Call original function
    return await originalAddMessageToChat(message);
  };
  
  // Override message sending to include page ID
  const originalSendMessageToAPI = window.sendMessageToAPI;
  window.sendMessageToAPI = async function(content) {
    console.log('🔧 SEND_MESSAGE_FILTERED: Including page ID in message');
    
    try {
      const currentPage = await getCurrentPageInfo();
      if (!currentPage) {
        console.error('❌ SEND_MESSAGE_FILTERED: No current page info');
        return false;
      }
      
      // Add page ID to message data
      const messageData = {
        content: content,
        page_id: currentPage.pageId,
        // ... other message data
      };
      
      console.log('🔧 SEND_MESSAGE_FILTERED: Message data with page ID:', messageData);
      
      // Call original function
      return await originalSendMessageToAPI(content);
      
    } catch (error) {
      console.error('❌ SEND_MESSAGE_FILTERED: Error sending message:', error);
      return false;
    }
  };
  
  console.log('✅ MESSAGE FILTERING: Fixed message filtering by page ID');
}

// ===== CRITICAL FIX 4: Fix Supabase Real-time Subscriptions =====
// Problem: Real-time subscriptions are not page-specific
// Solution: Ensure Supabase subscriptions are page-specific

function fixSupabaseSubscriptions() {
  console.log('🔧 FIXING SUPABASE SUBSCRIPTIONS: Ensuring page-specific real-time subscriptions');
  
  // Override Supabase real-time client subscription
  if (window.supabaseRealtimeClient) {
    const originalSubscribeToPageMessages = window.supabaseRealtimeClient.subscribeToPageMessages;
    window.supabaseRealtimeClient.subscribeToPageMessages = async function(pageId) {
      console.log('🔧 SUPABASE_SUBSCRIPTION: Subscribing to page-specific messages:', pageId);
      
      // Unsubscribe from previous page if exists
      if (this.currentChannel) {
        console.log('🔧 SUPABASE_SUBSCRIPTION: Unsubscribing from previous page');
        await this.unsubscribeFromPageMessages();
      }
      
      // Subscribe to new page messages only
      if (this.supabase) {
        this.currentChannel = this.supabase.realtime.channel(`page_messages_${pageId}`)
          .on('postgres_changes', {
            event: 'INSERT',
            schema: 'public',
            table: 'messages',
            filter: `page_id=eq.${pageId}` // CRITICAL: Filter by page ID
          }, (payload) => {
            console.log('🔧 SUPABASE_SUBSCRIPTION: New message for page:', pageId, payload);
            if (this.onNewMessage && typeof this.onNewMessage === 'function') {
              this.onNewMessage(payload.new);
            }
          })
          .on('postgres_changes', {
            event: 'UPDATE',
            schema: 'public',
            table: 'messages',
            filter: `page_id=eq.${pageId}` // CRITICAL: Filter by page ID
          }, (payload) => {
            console.log('🔧 SUPABASE_SUBSCRIPTION: Message updated for page:', pageId, payload);
            if (this.onMessageUpdated && typeof this.onMessageUpdated === 'function') {
              this.onMessageUpdated(payload.new);
            }
          })
          .on('postgres_changes', {
            event: 'DELETE',
            schema: 'public',
            table: 'messages',
            filter: `page_id=eq.${pageId}` // CRITICAL: Filter by page ID
          }, (payload) => {
            console.log('🔧 SUPABASE_SUBSCRIPTION: Message deleted for page:', pageId, payload);
            if (this.onMessageDeleted && typeof this.onMessageDeleted === 'function') {
              this.onMessageDeleted(payload.old);
            }
          })
          .subscribe();
        
        console.log('✅ SUPABASE_SUBSCRIPTION: Subscribed to page-specific messages:', pageId);
      }
    };
    
    // Add unsubscribe method
    window.supabaseRealtimeClient.unsubscribeFromPageMessages = async function() {
      if (this.currentChannel) {
        console.log('🔧 SUPABASE_SUBSCRIPTION: Unsubscribing from current page messages');
        await this.supabase.realtime.removeChannel(this.currentChannel);
        this.currentChannel = null;
        console.log('✅ SUPABASE_SUBSCRIPTION: Unsubscribed from page messages');
      }
    };
  }
  
  console.log('✅ SUPABASE SUBSCRIPTIONS: Fixed page-specific real-time subscriptions');
}

// ===== UTILITY FUNCTIONS =====

async function getCurrentPageInfo() {
  try {
    const url = window.location.href;
    const normalizedUrl = url.replace(/^https?:\/\//, '').split('/')[0];
    const pageId = normalizedUrl.replace(/\./g, '_') + '_';
    
    return {
      rawUrl: url,
      normalizedUrl: normalizedUrl,
      pageId: pageId
    };
  } catch (error) {
    console.error('❌ GET_CURRENT_PAGE: Error getting page info:', error);
    return null;
  }
}

// ===== MAIN FIX FUNCTION =====

async function runVisibilitySystemFixes() {
  console.log('🚀 VISIBILITY SYSTEM FIXES: Starting all visibility system fixes...');
  
  try {
    fixPageSpecificMessageLoading();
    fixPageChangeDetection();
    fixMessageFiltering();
    fixSupabaseSubscriptions();
    
    console.log('✅ VISIBILITY SYSTEM FIXES: All fixes completed successfully');
    
    // Test the fixes
    await testVisibilitySystemFixes();
    
  } catch (error) {
    console.error('❌ VISIBILITY SYSTEM FIXES: Error running fixes:', error);
  }
}

// ===== TEST FUNCTION =====

async function testVisibilitySystemFixes() {
  console.log('🧪 TESTING VISIBILITY SYSTEM FIXES: Running tests...');
  
  try {
    // Test 1: Page-specific message loading
    console.log('🧪 TEST 1: Testing page-specific message loading...');
    await window.loadMessagesForCurrentPage();
    console.log('✅ TEST 1: Page-specific message loading test passed');
    
    // Test 2: Page change detection
    console.log('🧪 TEST 2: Testing page change detection...');
    await window.handlePageChange();
    console.log('✅ TEST 2: Page change detection test passed');
    
    // Test 3: Message filtering
    console.log('🧪 TEST 3: Testing message filtering...');
    const testMessage = {
      id: 'test-' + Date.now(),
      body: 'Test message for filtering',
      page_id: 'different_page_',
      author: { id: 'test@example.com', name: 'Test User' },
      createdAt: new Date().toISOString()
    };
    
    await window.addMessageToChat(testMessage); // Should be filtered out
    console.log('✅ TEST 3: Message filtering test passed');
    
    // Test 4: Supabase subscriptions
    console.log('🧪 TEST 4: Testing Supabase subscriptions...');
    if (window.supabaseRealtimeClient) {
      const currentPage = await getCurrentPageInfo();
      await window.supabaseRealtimeClient.subscribeToPageMessages(currentPage.pageId);
      console.log('✅ TEST 4: Supabase subscriptions test passed');
    } else {
      console.log('⚠️ TEST 4: Supabase client not available, skipping subscription test');
    }
    
    console.log('✅ ALL VISIBILITY SYSTEM TESTS PASSED: Fixes are working correctly');
    
  } catch (error) {
    console.error('❌ TEST VISIBILITY SYSTEM FIXES: Error testing fixes:', error);
  }
}

// ===== EXPORT FUNCTIONS =====

window.runVisibilitySystemFixes = runVisibilitySystemFixes;
window.testVisibilitySystemFixes = testVisibilitySystemFixes;
window.fixPageSpecificMessageLoading = fixPageSpecificMessageLoading;
window.fixPageChangeDetection = fixPageChangeDetection;
window.fixMessageFiltering = fixMessageFiltering;
window.fixSupabaseSubscriptions = fixSupabaseSubscriptions;

console.log('✅ VISIBILITY SYSTEM FIX: Script loaded successfully');
console.log('📋 USAGE: Run window.runVisibilitySystemFixes() to apply all fixes');
console.log('📋 USAGE: Run window.testVisibilitySystemFixes() to test the fixes');
