// presence/diagnose-active-tab.js

/**
 * Diagnostic tool to check if the extension is tracking the correct active tab
 */

(async function() {
  console.log('🧪 ACTIVE_TAB_DIAGNOSTIC: Loading diagnostic tool...');

  window.checkActiveTab = async function() {
    console.log('=== ACTIVE TAB DIAGNOSTIC ===');
    
    try {
      // 1. What the sidepanel's context is
      const sidepanelUrl = window.location.href;
      console.log('1. Sidepanel context URL:', sidepanelUrl);
      
      // 2. What the actual active tab is
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      console.log('2. Active tab URL:', tab?.url);
      console.log('2. Active tab ID:', tab?.id);
      
      // 3. What getCurrentPageUri() returns
      const currentUri = await window.getCurrentPageUri();
      console.log('3. getCurrentPageUri() returned:', currentUri);
      
      // 4. What presence tracking thinks
      if (window.normalizeCurrentUrl) {
        const urlData = await window.normalizeCurrentUrl();
        console.log('4. Presence tracking pageId:', urlData.pageId);
        console.log('4. Presence tracking URL:', urlData.normalizedUrl);
        
        // Check if they match
        if (tab && urlData.normalizedUrl !== tab.url) {
          console.error('❌ MISMATCH: Presence is tracking wrong page!');
          console.error('   Active tab URL:', tab.url);
          console.error('   Tracking URL:', urlData.normalizedUrl);
        } else {
          console.log('✅ URLs match - presence tracking is correct');
        }
      }
      
      // 5. Check current presence in Supabase
      if (window.supabaseRealtimeClient && window.supabaseRealtimeClient.currentPage) {
        console.log('5. Supabase currentPage:', window.supabaseRealtimeClient.currentPage);
      }
      
      // 6. Query Supabase for current user's presence
      if (window.supabaseRealtimeClient && window.getCurrentUserEmail) {
        const userEmail = await window.getCurrentUserEmail();
        const { data, error } = await window.supabaseRealtimeClient.supabase
          .from('user_presence')
          .select('*')
          .eq('user_email', userEmail)
          .limit(1);
        
        if (error) {
          console.error('6. Error querying Supabase:', error);
        } else if (data && data.length > 0) {
          console.log('6. Supabase presence record:');
          console.log('   page_id:', data[0].page_id);
          console.log('   page_url:', data[0].page_url);
          console.log('   is_active:', data[0].is_active);
          console.log('   last_seen:', data[0].last_seen);
        }
      }
      
    } catch (error) {
      console.error('❌ DIAGNOSTIC_ERROR:', error);
    }
    
    console.log('================================');
  };

  window.simulateTabSwitch = async function() {
    console.log('=== SIMULATING TAB SWITCH ===');
    
    try {
      // Get current active tab
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      console.log('Current active tab:', tab?.url);
      
      // Manually trigger the tab change flow
      console.log('Manually calling handleTabChange...');
      if (window.handleTabChange) {
        await window.handleTabChange(tab.id);
        console.log('✅ handleTabChange completed');
      } else {
        console.error('❌ handleTabChange function not found');
      }
      
      // Check the result
      await window.checkActiveTab();
      
    } catch (error) {
      console.error('❌ SIMULATE_ERROR:', error);
    }
    
    console.log('================================');
  };

  window.testBackgroundListeners = async function() {
    console.log('=== TESTING BACKGROUND LISTENERS ===');
    
    try {
      // Try to send a test message to background
      const response = await chrome.runtime.sendMessage({ type: 'PING' });
      console.log('Background responded:', response);
    } catch (error) {
      console.log('Background script communication:', error.message);
    }
    
    // Check if we can see tab events
    console.log('Switching tabs should trigger background listeners...');
    console.log('Check the background console (Inspect Service Worker) for logs like:');
    console.log('  🔄 BACKGROUND: Tab activated: <tabId>');
    console.log('  ✅ BACKGROUND: Sent TAB_CHANGED message to sidepanel');
    
    console.log('================================');
  };

  console.log('✅ ACTIVE_TAB_DIAGNOSTIC: Functions loaded!');
  console.log('Available functions:');
  console.log('  - checkActiveTab() - Check if tracking correct tab');
  console.log('  - simulateTabSwitch() - Manually trigger tab change');
  console.log('  - testBackgroundListeners() - Test background communication');
})();



