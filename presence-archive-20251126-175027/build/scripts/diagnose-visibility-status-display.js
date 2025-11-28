/**
 * Visibility Status Display Diagnostic
 * 
 * Targets:
 * 1. Verify .user-status elements are created in visibility tab
 * 2. Verify status text shows "Last Seen" for users on different pages
 * 3. Verify status text shows "Online" for users on same page
 * 4. Check if status rendering logic is missing in updateVisibleTab
 */

(function() {
  'use strict';

  class VisibilityStatusDisplayDiagnostic {
    async run() {
      const timestamp = new Date().toISOString();
      
      console.group('🔍 Visibility Status Display Diagnostic');
      console.info('Timestamp:', timestamp);
      
      // 1. Check visibility tab DOM structure
      console.group('📊 Step 1: Visibility Tab DOM Structure');
      const visibilityTab = document.getElementById('visibility-tab');
      if (!visibilityTab) {
        console.error('❌ Visibility tab not found in DOM');
        console.groupEnd();
        console.groupEnd();
        return { error: 'Visibility tab not found' };
      }
      
      const userItems = visibilityTab.querySelectorAll('.item');
      console.log('User items found:', userItems.length);
      
      if (userItems.length === 0) {
        console.warn('⚠️ No user items found in visibility tab');
        console.log('Checking if visibility data exists...');
        const visibilityData = window.currentVisibilityData?.active || [];
        console.log('Visibility data count:', visibilityData.length);
        console.groupEnd();
        console.groupEnd();
        return { 
          userItemsCount: 0,
          visibilityDataCount: visibilityData.length,
          issue: 'No users rendered in visibility tab'
        };
      }
      
      // 2. Check for status elements
      console.group('📋 Step 2: Status Element Analysis');
      const statusAnalysis = [];
      
      userItems.forEach((item, index) => {
        const userNameEl = item.querySelector('.user-name');
        const userName = userNameEl?.textContent?.trim() || `User ${index + 1}`;
        const statusEl = item.querySelector('.user-status');
        const hasStatus = !!statusEl;
        const statusText = statusEl?.textContent?.trim() || null;
        
        statusAnalysis.push({
          index: index + 1,
          userName,
          hasStatusElement: hasStatus,
          statusText,
          issue: hasStatus ? null : 'Missing .user-status element'
        });
      });
      
      console.table(statusAnalysis);
      
      const missingStatusCount = statusAnalysis.filter(item => !item.hasStatusElement).length;
      if (missingStatusCount > 0) {
        console.error(`❌ ${missingStatusCount} users missing .user-status elements`);
      } else {
        console.log('✅ All users have .user-status elements');
      }
      console.groupEnd();
      
      // 3. Check visibility data for status information
      console.group('🔍 Step 3: Visibility Data Status Information');
      const visibilityData = window.currentVisibilityData?.active || [];
      const currentPageId = this.resolveCurrentPageId();
      console.log('Current page ID:', currentPageId);
      console.log('Visibility data users:', visibilityData.length);
      
      const dataAnalysis = visibilityData.map((user, index) => {
        const onSamePage = Boolean(user.page_id && currentPageId && user.page_id === currentPageId);
        const isActive = user.isActive === true;
        const expectedType = isActive && onSamePage ? 'online' : 'last_seen';
        const hasLastSeen = !!user.lastSeen;
        
        return {
          index: index + 1,
          userName: user.name || user.email || `User ${index + 1}`,
          pageId: user.page_id || null,
          onSamePage,
          isActive,
          expectedType,
          hasLastSeen,
          lastSeen: user.lastSeen || null
        };
      });
      
      console.table(dataAnalysis);
      console.groupEnd();
      
      // 4. Compare DOM vs Data expectations
      console.group('⚖️ Step 4: DOM vs Data Comparison');
      const comparison = [];
      
      userItems.forEach((item, index) => {
        const userNameEl = item.querySelector('.user-name');
        const userName = userNameEl?.textContent?.trim() || null;
        const statusEl = item.querySelector('.user-status');
        const statusText = statusEl?.textContent?.trim() || null;
        
        // Find matching user in visibility data
        const matchingUser = visibilityData.find(u => {
          const uName = u.name || u.email || '';
          return uName === userName;
        });
        
        if (matchingUser) {
          const onSamePage = Boolean(matchingUser.page_id && currentPageId && matchingUser.page_id === currentPageId);
          const isActive = matchingUser.isActive === true;
          const expectedType = isActive && onSamePage ? 'online' : 'last_seen';
          const expectedText = expectedType === 'online' 
            ? 'Online on this page'
            : this.formatLastSeenDisplay(matchingUser.lastSeen);
          
          const hasStatus = !!statusText;
          const matches = hasStatus && (
            (expectedType === 'online' && statusText.toLowerCase().includes('online')) ||
            (expectedType === 'last_seen' && statusText.toLowerCase().includes('last seen'))
          );
          
          comparison.push({
            userName,
            expectedType,
            expectedText: expectedText.substring(0, 30),
            actualText: statusText ? statusText.substring(0, 30) : '(missing)',
            matches,
            issue: !hasStatus ? 'Status element missing' : !matches ? 'Status text mismatch' : null
          });
        }
      });
      
      console.table(comparison);
      
      const mismatches = comparison.filter(item => !item.matches);
      if (mismatches.length > 0) {
        console.error(`❌ ${mismatches.length} status mismatches found`);
        mismatches.forEach(m => {
          console.error(`  - ${m.userName}: Expected "${m.expectedText}", got "${m.actualText}"`);
        });
      } else if (comparison.length > 0) {
        console.log('✅ All status displays match expectations');
      }
      console.groupEnd();
      
      // 5. Check updateVisibleTab function
      console.group('🔧 Step 5: Code Analysis');
      const updateVisibleTabFn = window.updateVisibleTab;
      if (typeof updateVisibleTabFn === 'function') {
        console.log('✅ updateVisibleTab function exists');
        const fnString = updateVisibleTabFn.toString();
        const hasStatusRendering = fnString.includes('.user-status') || 
                                   fnString.includes('user-status') ||
                                   fnString.includes('formatLastSeenDisplay') ||
                                   fnString.includes('formatTimeDisplay');
        console.log('Has status rendering code:', hasStatusRendering);
        if (!hasStatusRendering) {
          console.error('❌ updateVisibleTab function does not appear to render .user-status elements');
        }
      } else {
        console.error('❌ updateVisibleTab function not found');
      }
      console.groupEnd();
      
      // 6. Summary
      console.group('📊 Summary');
      const result = {
        timestamp,
        userItemsCount: userItems.length,
        visibilityDataCount: visibilityData.length,
        missingStatusCount,
        statusAnalysis,
        dataAnalysis,
        comparison,
        mismatches: mismatches.length,
        rootCause: missingStatusCount > 0 ? 'Status elements not being created in updateVisibleTab' : 
                   mismatches.length > 0 ? 'Status text does not match expected values' :
                   'Unknown'
      };
      
      console.log('User items in DOM:', result.userItemsCount);
      console.log('Users in visibility data:', result.visibilityDataCount);
      console.log('Missing status elements:', result.missingStatusCount);
      console.log('Status mismatches:', result.mismatches);
      console.log('Root cause:', result.rootCause);
      console.groupEnd();
      console.groupEnd();
      
      window.visibilityStatusDisplayDiagnosticResult = result;
      return result;
    }
    
    formatLastSeenDisplay(lastSeen) {
      if (!lastSeen) return 'Last seen unknown';
      
      const now = new Date();
      const lastSeenDate = new Date(lastSeen);
      const diffMs = now.getTime() - lastSeenDate.getTime();
      const diffSeconds = Math.floor(diffMs / 1000);
      const diffMinutes = Math.floor(diffSeconds / 60);
      const diffHours = Math.floor(diffMinutes / 60);
      const diffDays = Math.floor(diffHours / 24);
      
      if (diffMs < 0) {
        return 'Last seen just now';
      }
      if (diffSeconds < 60) {
        return `Last seen ${diffSeconds} second${diffSeconds === 1 ? '' : 's'} ago`;
      } else if (diffMinutes < 60) {
        return `Last seen ${diffMinutes} minute${diffMinutes === 1 ? '' : 's'} ago`;
      } else if (diffHours < 24) {
        return `Last seen ${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;
      } else {
        return `Last seen ${diffDays} day${diffDays === 1 ? '' : 's'} ago`;
      }
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
  
  const diagnostic = new VisibilityStatusDisplayDiagnostic();
  
  async function runVisibilityStatusDisplayDiagnostic() {
    return diagnostic.run();
  }
  
  if (typeof window !== 'undefined') {
    window.runVisibilityStatusDisplayDiagnostic = runVisibilityStatusDisplayDiagnostic;
    console.log('✅ Visibility Status Display Diagnostic loaded. Run window.runVisibilityStatusDisplayDiagnostic()');
  }
})();





