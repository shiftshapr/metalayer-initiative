// Listen for messages from background script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'TAB_CHANGED') {
      console.log('Tab changed to:', message.tabId);
      handleTabChange(message.tabId);
      return true;
    }
    
    if (message.type === 'TAB_UPDATED') {
      console.log('Tab updated:', message.tabId, message.url);
      handleTabUpdate(message.tabId, message.url);
      return true;
    }
    
    if (message.type === 'TAB_CLOSED') {
      console.log('Tab closed:', message.tabId);
      handleTabClosed(message.tabId);
      return true;
    }
    
    return false;
  });
  
  // Handle tab changes
  async function handleTabChange(tabId) {
    console.log('🔄 TAB_CHANGE: === HANDLING TAB CHANGE ===');
    console.log('🔄 TAB_CHANGE: Tab ID:', tabId);
    console.log(`Handling tab change for tab: ${tabId}`);
    try {
      // CRITICAL FIX: Leave current page BEFORE switching to new page
      // This prevents "ghost presence" where user appears on old page for 30 seconds
      if (window.supabaseRealtimeClient) {
        console.log('🚪 TAB_CHANGE: Leaving current page before switching...');
        await window.supabaseRealtimeClient.leaveCurrentPage();
        console.log('✅ TAB_CHANGE: Left current page successfully');
      }
      
      // Get the SPECIFIC tab URL (not active tab, but the tab that changed)
      const tab = await chrome.tabs.get(tabId);
      if (tab && tab.url) {
        console.log('🔄 TAB_CHANGE: New tab URL:', tab.url);
        console.log(`New tab URL: ${tab.url}`);
        
        // CRITICAL FIX: Normalize the SPECIFIC tab URL, not the active tab
        console.log('🔄 TAB_CHANGE: Normalizing SPECIFIC tab URL:', tab.url);
        const newUrlData = await window.normalizeUrl(tab.url);
        window.currentUrlData = newUrlData; // Update global state
        console.log('🔄 TAB_CHANGE: Updated currentUrlData to:', newUrlData.pageId);
        
        // CRITICAL FIX: Ensure real-time subscription is active before loading chat
        if (window.supabaseRealtimeClient && window.supabaseRealtimeClient.currentPage) {
          console.log('🔄 TAB_CHANGE: Ensuring real-time subscription is active for new page...');
          await window.supabaseRealtimeClient.subscribeToPageUpdates(window.supabaseRealtimeClient.currentPage.pageId);
          console.log('✅ TAB_CHANGE: Real-time subscription ensured');
        }
        
        // Reload chat history for the new page (uses normalized URL)
        await loadChatHistory();
        // Update visibility list for the new page (uses normalized URL)
        const activeCommunities = await window.getState('activeCommunities') || ['comm-001'];
        await loadCombinedAvatars(activeCommunities);
        // Start presence tracking for the new URL (uses normalized URL)
        await startPresenceTracking();
        console.log('✅ TAB_CHANGE: Tab change complete');
      } else {
        console.log('⚠️ TAB_CHANGE: No tab or URL found for tab:', tabId);
        console.log(`No tab or URL found for tab: ${tabId}`);
      }
    } catch (error) {
      console.error('❌ TAB_CHANGE: Error handling tab change:', error);
      console.log(`Error handling tab change: ${error.message}`);
    }
  }
  
  // Handle tab closed
  async function handleTabClosed(tabId) {
    console.log('🔄 TAB_CLOSED: === HANDLING TAB CLOSURE ===');
    console.log('🔄 TAB_CLOSED: Tab ID:', tabId);
    console.log(`Handling tab closure for tab: ${tabId}`);
    try {
      // CRITICAL FIX: Leave current page when tab is closed
      // This immediately marks user as inactive on the closed page
      if (window.supabaseRealtimeClient) {
        console.log('🚪 TAB_CLOSED: Leaving page from closed tab...');
        await window.supabaseRealtimeClient.leaveCurrentPage();
        console.log('✅ TAB_CLOSED: Left page successfully');
      }
      
      console.log('✅ TAB_CLOSED: Tab closure handled successfully');
    } catch (error) {
      console.error('❌ TAB_CLOSED: Error handling tab closure:', error);
      console.log(`Error handling tab closure: ${error.message}`);
    }
  }
  
  // Handle tab updates (URL changes)
  async function handleTabUpdate(tabId, url) {
    console.log('');
    console.log('═══════════════════════════════════════════════════════════');
    console.log('🔄 TAB_UPDATE: === HANDLING TAB UPDATE ===');
    console.log('═══════════════════════════════════════════════════════════');
    console.log('🔄 TAB_UPDATE: Tab ID:', tabId);
    console.log('🔄 TAB_UPDATE: New URL:', url);
    console.log('🔄 TAB_UPDATE: Timestamp:', new Date().toISOString());
    console.log(`Handling tab update for tab: ${tabId}, URL: ${url}`);
    
    try {
      // === STEP 1: LOG CURRENT STATE ===
      console.log('');
      console.log('📊 TAB_UPDATE: STEP 1 - Current State Before Leaving');
      console.log('───────────────────────────────────────────────────────────');
      console.log('🔍 TAB_UPDATE: window.currentUrlData:', JSON.stringify(window.currentUrlData, null, 2));
      console.log('🔍 TAB_UPDATE: supabaseRealtimeClient exists:', !!window.supabaseRealtimeClient);
      console.log('🔍 TAB_UPDATE: supabaseRealtimeClient.currentPage:', JSON.stringify(window.supabaseRealtimeClient?.currentPage, null, 2));
      console.log('🔍 TAB_UPDATE: supabaseRealtimeClient.currentUser:', window.supabaseRealtimeClient?.currentUser?.userEmail);
      console.log('🔍 TAB_UPDATE: supabaseRealtimeClient.isLeavingPage:', window.supabaseRealtimeClient?.isLeavingPage);
      
      // Store old page ID BEFORE leaving (leaveCurrentPage clears it)
      const oldPageId = window.supabaseRealtimeClient?.currentPage?.pageId;
      const oldPageUrl = window.supabaseRealtimeClient?.currentPage?.pageUrl;
      console.log('🔍 TAB_UPDATE: Stored old page ID:', oldPageId);
      console.log('🔍 TAB_UPDATE: Stored old page URL:', oldPageUrl);
      
      // CRITICAL FIX: If currentPage is undefined, try to restore it from window.currentUrlData
      if (!oldPageId && window.currentUrlData) {
        console.log('🔧 TAB_UPDATE: currentPage is undefined, attempting to restore from window.currentUrlData');
        console.log('🔧 TAB_UPDATE: window.currentUrlData:', JSON.stringify(window.currentUrlData, null, 2));
        
        // Try to restore currentPage state
        if (window.supabaseRealtimeClient && window.currentUrlData.pageId) {
          window.supabaseRealtimeClient.currentPage = {
            pageId: window.currentUrlData.pageId,
            pageUrl: window.currentUrlData.normalizedUrl
          };
          console.log('🔧 TAB_UPDATE: Restored currentPage:', JSON.stringify(window.supabaseRealtimeClient.currentPage, null, 2));
        }
      }
      
      // === STEP 2: LEAVE CURRENT PAGE ===
      console.log('');
      console.log('📊 TAB_UPDATE: STEP 2 - Leaving Current Page');
      console.log('───────────────────────────────────────────────────────────');
      if (window.supabaseRealtimeClient) {
        if (oldPageId) {
          console.log('🚪 TAB_UPDATE: Calling leaveCurrentPage() for:', oldPageId);
          const leaveStartTime = Date.now();
          await window.supabaseRealtimeClient.leaveCurrentPage();
          const leaveEndTime = Date.now();
          console.log(`TAB_UPDATE: leaveCurrentPage() completed in ${leaveEndTime - leaveStartTime}ms`, null, 'general');
          console.log('✅ TAB_UPDATE: currentPage after leaving:', window.supabaseRealtimeClient.currentPage);
        } else {
          console.log('⚠️ TAB_UPDATE: No old page to leave (oldPageId is null)');
        }
      } else {
        console.error('❌ TAB_UPDATE: supabaseRealtimeClient not available!');
      }
      
      // === STEP 3: NORMALIZE NEW URL ===
      console.log('');
      console.log('📊 TAB_UPDATE: STEP 3 - Normalizing New URL');
      console.log('───────────────────────────────────────────────────────────');
      console.log('🔄 TAB_UPDATE: Input URL from event:', url);
      console.log('🔄 TAB_UPDATE: Calling normalizeUrl()...');
      const normalizeStartTime = Date.now();
      const newUrlData = await window.normalizeUrl(url);
      const normalizeEndTime = Date.now();
      console.log(`TAB_UPDATE: normalizeUrl() completed in ${normalizeEndTime - normalizeStartTime}ms`, null, 'general');
      console.log('🔍 TAB_UPDATE: Normalized result:', JSON.stringify(newUrlData, null, 2));
      
      // === STEP 4: COMPARE PAGE IDs ===
      console.log('');
      console.log('📊 TAB_UPDATE: STEP 4 - Comparing Page IDs');
      console.log('───────────────────────────────────────────────────────────');
      console.log('🔍 TAB_UPDATE: Old page ID:', oldPageId);
      console.log('🔍 TAB_UPDATE: New page ID:', newUrlData.pageId);
      console.log('🔍 TAB_UPDATE: Are they equal?', oldPageId === newUrlData.pageId);
      console.log('🔍 TAB_UPDATE: Old page ID type:', typeof oldPageId);
      console.log('🔍 TAB_UPDATE: New page ID type:', typeof newUrlData.pageId);
      
      if (oldPageId === newUrlData.pageId) {
        console.log('');
        console.log('⚠️⚠️⚠️ TAB_UPDATE: SAME PAGE DETECTED ⚠️⚠️⚠️');
        console.log('⚠️ TAB_UPDATE: Skipping presence re-join to avoid reactivation');
        console.log('⚠️ TAB_UPDATE: This prevents marking inactive then immediately active again');
        console.log('✅ TAB_UPDATE: Tab update complete (same page, no action needed)');
        console.log('═══════════════════════════════════════════════════════════');
        console.log('');
        return;
      }
      
      // === STEP 5: UPDATE GLOBAL STATE ===
      console.log('');
      console.log('📊 TAB_UPDATE: STEP 5 - Updating Global State');
      console.log('───────────────────────────────────────────────────────────');
      console.log('🔄 TAB_UPDATE: Setting window.currentUrlData to new page:', newUrlData.pageId);
      window.currentUrlData = newUrlData;
      console.log('✅ TAB_UPDATE: Global state updated');
      
      // === STEP 6: RELOAD CHAT HISTORY ===
      console.log('');
      console.log('📊 TAB_UPDATE: STEP 6 - Reloading Chat History');
      console.log('───────────────────────────────────────────────────────────');
      const chatStartTime = Date.now();
      await loadChatHistory();
      const chatEndTime = Date.now();
      console.log(`TAB_UPDATE: Chat history loaded in ${chatEndTime - chatStartTime}ms`, null, 'general');
      
      // === STEP 7: UPDATE VISIBILITY LIST ===
      console.log('');
      console.log('📊 TAB_UPDATE: STEP 7 - Updating Visibility List');
      console.log('───────────────────────────────────────────────────────────');
      const activeCommunities = await window.getState('activeCommunities') || ['comm-001'];
      console.log('🔍 TAB_UPDATE: Active communities:', activeCommunities);
      const visibilityStartTime = Date.now();
      await loadCombinedAvatars(activeCommunities);
      const visibilityEndTime = Date.now();
      console.log(`TAB_UPDATE: Visibility list updated in ${visibilityEndTime - visibilityStartTime}ms`, null, 'general');
      
      // === STEP 8: START PRESENCE TRACKING ===
      console.log('');
      console.log('📊 TAB_UPDATE: STEP 8 - Starting Presence Tracking');
      console.log('───────────────────────────────────────────────────────────');
      console.log('🔄 TAB_UPDATE: Calling startPresenceTracking() for new page:', newUrlData.pageId);
      const presenceStartTime = Date.now();
      await startPresenceTracking();
      const presenceEndTime = Date.now();
      console.log(`TAB_UPDATE: Presence tracking started in ${presenceEndTime - presenceStartTime}ms`, null, 'general');
      
      // === FINAL STATE ===
      console.log('');
      console.log('📊 TAB_UPDATE: FINAL STATE');
      console.log('───────────────────────────────────────────────────────────');
      console.log('🔍 TAB_UPDATE: window.currentUrlData:', JSON.stringify(window.currentUrlData, null, 2));
      console.log('🔍 TAB_UPDATE: supabaseRealtimeClient.currentPage:', JSON.stringify(window.supabaseRealtimeClient?.currentPage, null, 2));
      console.log('🔍 TAB_UPDATE: supabaseRealtimeClient.isLeavingPage:', window.supabaseRealtimeClient?.isLeavingPage);
      
      console.log('');
      console.log('✅✅✅ TAB_UPDATE: COMPLETE ✅✅✅');
      console.log('═══════════════════════════════════════════════════════════');
      console.log('');
    } catch (error) {
      console.log('');
      console.log('❌❌❌ TAB_UPDATE: ERROR ❌❌❌');
      console.log('═══════════════════════════════════════════════════════════');
      console.error('❌ TAB_UPDATE: Error details:', error);
      console.error('❌ TAB_UPDATE: Error message:', error.message);
      console.error('❌ TAB_UPDATE: Error stack:', error.stack);
      console.log('═══════════════════════════════════════════════════════════');
      console.log('');
      console.log(`Error handling tab update: ${error.message}`);
    }
  }
  
  