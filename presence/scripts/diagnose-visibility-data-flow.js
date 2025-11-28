/**
 * Visibility Data Flow Diagnostic - COMP METHOD
 * 
 * Diagnoses why visibility tab shows 0 users
 * Checks: initialization, page ID, data fetching, rendering
 */

(function() {
  'use strict';

  class VisibilityDataFlowDiagnostic {
    async run() {
      console.group('🔍 Visibility Data Flow Diagnostic - COMP METHOD');
      
      // 1. Check visibility manager instance
      console.group('📊 Step 1: Visibility Manager Instance');
      // COMP: Check if graph is accessible (buildGraph creates it)
      // VisibilityManager should be in graph, but also check window.visibilityManager (set by buildGraph.js)
      let visibilityManager = null;
      
      // Try to get from window.visibilityManager (set by buildGraph.js)
      if (typeof window !== 'undefined' && window.visibilityManager) {
        visibilityManager = window.visibilityManager;
      }
      
      console.log('Visibility manager exists:', !!visibilityManager);
      if (visibilityManager) {
        const status = visibilityManager.getStatus?.() || 'getStatus not available';
        console.log('Manager status:', status);
        console.log('Manager isActive:', status.isActive);
        console.log('Current page ID:', status.currentPageId);
        console.log('Visible users count:', status.visibleUsers);
      } else {
        console.error('❌ Visibility manager not found!');
      }
      console.groupEnd();
      
      // 2. Check current page ID
      console.group('🌐 Step 2: Current Page ID');
      const currentPageId = this.resolveCurrentPageId();
      console.log('Resolved current page ID:', currentPageId);
      console.log('window.currentUrlData:', window.currentUrlData);
      console.log('window.tabContextManager exists:', !!window.tabContextManager);
      if (window.tabContextManager) {
        const tabContainer = window.tabContextManager.getTabContainer('visibility-tab');
        console.log('Visibility tab container:', tabContainer);
        console.log('Tab container pageId:', tabContainer?.dataset?.pageId);
      }
      const firstMessage = document.querySelector('[data-page-id]');
      console.log('First message with data-page-id:', firstMessage?.getAttribute('data-page-id'));
      console.groupEnd();
      
      // 3. Check visibility data sources
      console.group('💾 Step 3: Visibility Data Sources');
      const currentVisibilityData = window.currentVisibilityData;
      const currentVisibilityDataUnfiltered = window.currentVisibilityDataUnfiltered;
      console.log('window.currentVisibilityData:', currentVisibilityData);
      console.log('window.currentVisibilityDataUnfiltered:', currentVisibilityDataUnfiltered);
      const activeUsers = currentVisibilityData?.active || [];
      console.log('Active users count:', activeUsers.length);
      if (activeUsers.length > 0) {
        console.log('Sample user:', activeUsers[0]);
      }
      console.groupEnd();
      
      // 4. Check Supabase service
      console.group('🗄️ Step 4: Supabase Service');
      const supabase = window.supabase;
      const supabaseRealtimeClient = window.supabaseRealtimeClient;
      console.log('window.supabase exists:', !!supabase);
      console.log('window.supabaseRealtimeClient exists:', !!supabaseRealtimeClient);
      
      if (supabaseRealtimeClient && typeof supabaseRealtimeClient.getPageUsers === 'function' && currentPageId) {
        console.log('Testing getPageUsers with pageId:', currentPageId);
        try {
          const users = await supabaseRealtimeClient.getPageUsers(currentPageId);
          console.log('getPageUsers returned:', users?.length || 0, 'users');
          if (users && users.length > 0) {
            console.log('Sample user from getPageUsers:', users[0]);
          } else {
            console.warn('⚠️ getPageUsers returned empty array!');
          }
        } catch (err) {
          console.error('❌ Error calling getPageUsers:', err);
        }
      } else {
        console.warn('⚠️ Cannot test getPageUsers - missing service or pageId');
      }
      console.groupEnd();
      
      // 5. Check updateVisibleTab function
      console.group('🔄 Step 5: updateVisibleTab Function');
      const updateVisibleTabFn = window.updateVisibleTab;
      console.log('updateVisibleTab function exists:', typeof updateVisibleTabFn === 'function');
      if (typeof updateVisibleTabFn === 'function') {
        console.log('Function available, can be called manually');
      } else {
        console.error('❌ updateVisibleTab function not found!');
      }
      console.groupEnd();
      
      // 6. Check visibility tab DOM
      console.group('🏗️ Step 6: Visibility Tab DOM');
      const visibilityTab = document.getElementById('visibility-tab');
      console.log('Visibility tab element exists:', !!visibilityTab);
      if (visibilityTab) {
        console.log('Tab is active:', visibilityTab.classList.contains('active'));
        const userItems = visibilityTab.querySelectorAll('.item');
        console.log('User items in DOM:', userItems.length);
        const visibleUsersContainer = visibilityTab.querySelector('.visible-users');
        console.log('.visible-users container exists:', !!visibleUsersContainer);
        if (visibleUsersContainer) {
          const itemList = visibleUsersContainer.querySelector('.item-list');
          console.log('.item-list exists:', !!itemList);
          // Check for empty state message (using textContent since :contains() is not valid CSS)
          const hasEmptyState = visibilityTab.textContent.includes('No other users');
          console.log('Empty state message:', hasEmptyState);
        }
      }
      console.groupEnd();
      
      // 7. Manual trigger test
      console.group('🧪 Step 7: Manual Trigger Test');
      if (visibilityManager && currentPageId && typeof visibilityManager.refreshVisibilityAvatars === 'function') {
        console.log('Attempting manual refresh...');
        try {
          await visibilityManager.refreshVisibilityAvatars(currentPageId);
          console.log('✅ Manual refresh completed');
          // Check data after refresh
          setTimeout(() => {
            const newData = window.currentVisibilityData?.active || [];
            console.log('Users after refresh:', newData.length);
          }, 1000);
        } catch (err) {
          console.error('❌ Error during manual refresh:', err);
        }
      } else {
        console.warn('⚠️ Cannot trigger manual refresh - missing manager or pageId');
      }
      console.groupEnd();
      
      // 8. Summary and recommendations
      console.group('📊 Summary & Recommendations');
      const issues = [];
      const recommendations = [];
      
      if (!visibilityManager) {
        issues.push('Visibility manager not initialized');
        recommendations.push('Check initialization code - visibility manager must be created and initialized');
      }
      
      if (!currentPageId) {
        issues.push('Current page ID not resolved');
        recommendations.push('Set page ID using visibilityManager.setCurrentPage(pageId) or ensure currentUrlData.pageId is set');
      }
      
      if (activeUsers.length === 0 && currentPageId) {
        issues.push('No users in visibility data despite having page ID');
        recommendations.push('Check if getPageUsers returns data, check if users are actually present in database for this page');
      }
      
      if (activeUsers.length > 0 && visibilityTab) {
        const userItems = visibilityTab.querySelectorAll('.item');
        if (userItems.length === 0) {
          issues.push('Users in data but not rendered in DOM');
          recommendations.push('Call updateVisibleTab(activeUsers) manually or check why updateVisibilityUI is not calling updateVisibleTab');
        }
      }
      
      console.log('Issues found:', issues.length);
      issues.forEach((issue, i) => console.warn(`${i + 1}. ${issue}`));
      console.log('Recommendations:', recommendations.length);
      recommendations.forEach((rec, i) => console.log(`${i + 1}. ${rec}`));
      
      const result = {
        visibilityManagerExists: !!visibilityManager,
        currentPageId,
        activeUsersCount: activeUsers.length,
        domItemsCount: visibilityTab ? visibilityTab.querySelectorAll('.item').length : 0,
        issues,
        recommendations
      };
      
      console.log('Diagnostic result:', result);
      console.groupEnd();
      console.groupEnd();
      
      window.visibilityDataFlowDiagnosticResult = result;
      return result;
    }
    
    resolveCurrentPageId() {
      const tabContainer = window.tabContextManager?.getTabContainer('visibility-tab');
      if (tabContainer?.dataset.pageId) {
        return tabContainer.dataset.pageId;
      }
      const pageId = window.currentUrlData?.pageId;
      if (pageId) {
        return pageId;
      }
      const firstMessage = document.querySelector('[data-page-id]');
      const pageIdAttr = firstMessage?.getAttribute('data-page-id');
      return pageIdAttr || null;
    }
  }
  
  const diagnostic = new VisibilityDataFlowDiagnostic();
  
  async function runVisibilityDataFlowDiagnostic() {
    return diagnostic.run();
  }
  
  if (typeof window !== 'undefined') {
    window.runVisibilityDataFlowDiagnostic = runVisibilityDataFlowDiagnostic;
    console.log('✅ Visibility Data Flow Diagnostic loaded. Run window.runVisibilityDataFlowDiagnostic()');
  }
})();

