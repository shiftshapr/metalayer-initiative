/**
 * DIAGNOSTIC: Message Loading Flow
 * 
 * Checks the entire message loading flow to identify where it breaks
 */

(function() {
  console.log('========================================');
  console.log('🔍 DIAGNOSTIC: Message Loading Flow');
  console.log('========================================');
  
  async function runDiagnostic() {
    const results = {
      timestamp: new Date().toISOString(),
      issues: [],
      checks: {}
    };
    
    // 1. Check if TabManager is initialized
    console.log('\n1. Checking TabManager...');
    const win = typeof window !== 'undefined' ? window : null;
    const tabContextManager = win?.tabContextManager;
    results.checks.tabManager = {
      exists: !!tabContextManager,
      hasGetActiveTab: typeof tabContextManager?.getActiveTab === 'function',
      activeTab: tabContextManager?.getActiveTab ? tabContextManager.getActiveTab() : null
    };
    console.log('TabManager:', results.checks.tabManager);
    
    if (!tabContextManager) {
      results.issues.push('TabManager not exposed to window.tabContextManager');
    }
    
    // 2. Check getActiveSidepanelTab function
    console.log('\n2. Checking getActiveSidepanelTab...');
    const getActiveSidepanelTab = win?.getActiveSidepanelTab;
    results.checks.getActiveSidepanelTab = {
      exists: typeof getActiveSidepanelTab === 'function',
      returns: getActiveSidepanelTab ? getActiveSidepanelTab() : null
    };
    console.log('getActiveSidepanelTab:', results.checks.getActiveSidepanelTab);
    
    // 3. Check DOM for active tab
    console.log('\n3. Checking DOM for active tab...');
    const activeTabElement = document.querySelector('.main-nav-tab.active');
    const tabId = activeTabElement?.getAttribute('data-tab');
    results.checks.domTab = {
      activeElement: !!activeTabElement,
      tabId: tabId,
      allTabs: Array.from(document.querySelectorAll('.main-nav-tab')).map(t => ({
        id: t.getAttribute('data-tab'),
        active: t.classList.contains('active')
      }))
    };
    console.log('DOM Tab:', results.checks.domTab);
    
    // 4. Check MessageLoadingService
    console.log('\n4. Checking MessageLoadingService...');
    const moduleGraph = win?.__CANOPI_MODULE_GRAPH__;
    const messageLoadingService = moduleGraph?.messageLoadingService;
    results.checks.messageLoadingService = {
      moduleGraphExists: !!moduleGraph,
      serviceExists: !!messageLoadingService,
      hasLoadMessages: typeof messageLoadingService?.loadMessages === 'function'
    };
    console.log('MessageLoadingService:', results.checks.messageLoadingService);
    
    // 5. Check loadChatHistory
    console.log('\n5. Checking loadChatHistory...');
    const loadChatHistory = win?.loadChatHistory;
    results.checks.loadChatHistory = {
      exists: typeof loadChatHistory === 'function'
    };
    console.log('loadChatHistory:', results.checks.loadChatHistory);
    
    // 6. Check current URL data
    console.log('\n6. Checking current URL data...');
    try {
      const stateManager = moduleGraph?.stateManager;
      if (stateManager && typeof stateManager.getState === 'function') {
        const currentUrlData = stateManager.getState('currentUrlData');
        results.checks.currentUrlData = {
          exists: !!currentUrlData,
          data: currentUrlData
        };
        console.log('currentUrlData:', results.checks.currentUrlData);
      } else {
        results.checks.currentUrlData = { error: 'StateManager not available' };
      }
    } catch (error) {
      results.checks.currentUrlData = { error: error.message };
      results.issues.push(`Error getting currentUrlData: ${error.message}`);
    }
    
    // 7. Check active communities
    console.log('\n7. Checking active communities...');
    try {
      const stateManager = moduleGraph?.stateManager;
      if (stateManager && typeof stateManager.getState === 'function') {
        const activeCommunities = stateManager.getState('activeCommunities') || 
                                  stateManager.getState('ui.activeCommunities');
        results.checks.activeCommunities = {
          exists: !!activeCommunities,
          count: Array.isArray(activeCommunities) ? activeCommunities.length : 0,
          communities: activeCommunities
        };
        console.log('activeCommunities:', results.checks.activeCommunities);
      }
    } catch (error) {
      results.checks.activeCommunities = { error: error.message };
    }
    
    // 8. Try to manually trigger message loading
    console.log('\n8. Attempting manual message load...');
    try {
      if (messageLoadingService?.loadMessages) {
        const currentUrl = results.checks.currentUrlData?.data?.rawUrl || 'https://www.google.com/';
        console.log(`Calling messageLoadingService.loadMessages('${currentUrl}')...`);
        await messageLoadingService.loadMessages(currentUrl);
        console.log('✅ Manual load call completed');
        results.checks.manualLoad = { success: true, url: currentUrl };
      } else {
        results.checks.manualLoad = { error: 'MessageLoadingService.loadMessages not available' };
        results.issues.push('Cannot manually trigger load - service not available');
      }
    } catch (error) {
      results.checks.manualLoad = { error: error.message };
      results.issues.push(`Manual load failed: ${error.message}`);
      console.error('❌ Manual load error:', error);
    }
    
    // 9. Check messages in DOM after load
    console.log('\n9. Checking messages in DOM...');
    setTimeout(() => {
      const messageContainer = document.querySelector('.chat-messages');
      const messages = messageContainer ? Array.from(messageContainer.querySelectorAll('[data-message-id], .message')) : [];
      results.checks.messagesInDOM = {
        containerExists: !!messageContainer,
        messageCount: messages.length,
        hasMessages: messages.length > 0
      };
      console.log('Messages in DOM:', results.checks.messagesInDOM);
      
      // Final summary
      console.log('\n========================================');
      console.log('📊 DIAGNOSTIC SUMMARY');
      console.log('========================================');
      console.log(`Issues Found: ${results.issues.length}`);
      results.issues.forEach((issue, i) => {
        console.log(`  ${i + 1}. ${issue}`);
      });
      console.log('\n📋 Full Results:', results);
    }, 2000);
    
    return results;
  }
  
  // Run diagnostic
  runDiagnostic().catch(error => {
    console.error('❌ Diagnostic error:', error);
  });
})();

