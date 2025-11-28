/**
 * Enhanced Diagnostic Script: Visibility System
 * 
 * PURPOSE: Comprehensive visibility diagnostic showing pageId, user count, communities, and filtering logic
 * 
 * USAGE: Copy this entire script and paste into browser console on a page with Canopi extension loaded
 * 
 * OUTPUT: Detailed console logs with pageId, user counts, communities, and filtering status
 * 
 * CRITICAL: This is pure JavaScript - NO TypeScript syntax, NO imports/exports
 */

(async function() {
  'use strict';
  
  console.log('🔍 ENHANCED DIAGNOSTIC: Visibility System');
  console.log('==========================================');
  
  const results = {
    timestamp: new Date().toISOString(),
    pageInfo: {},
    userInfo: {},
    communityInfo: {},
    checks: {},
    issues: [],
    recommendations: []
  };
  
  // Get current page ID
  console.log('\n📋 Page Information');
  const win = window;
  const currentPageId = win.currentUrlData?.pageId || 
                       win.tabContextManager?.getTabContainer?.('visibility-tab')?.dataset?.pageId ||
                       document.querySelector('[data-page-id]')?.getAttribute('data-page-id') ||
                       null;
  
  results.pageInfo.currentPageId = currentPageId;
  console.log(`  Current Page ID: ${currentPageId || 'NOT FOUND'}`);
  
  if (!currentPageId) {
    results.issues.push('Current page ID not found - visibility filtering may not work correctly');
  }
  
  // Get visibility data
  console.log('\n📋 Visibility Data');
  const visibilityData = win.currentVisibilityData;
  const visibilityDataUnfiltered = win.currentVisibilityDataUnfiltered;
  
  if (visibilityData?.active) {
    const userCount = Array.isArray(visibilityData.active) ? visibilityData.active.length : 0;
    results.userInfo.visibleCount = userCount;
    results.userInfo.users = visibilityData.active;
    console.log(`  Visible users: ${userCount}`);
    
    if (visibilityDataUnfiltered?.active) {
      const unfilteredCount = Array.isArray(visibilityDataUnfiltered.active) ? visibilityDataUnfiltered.active.length : 0;
      results.userInfo.unfilteredCount = unfilteredCount;
      console.log(`  Unfiltered users: ${unfilteredCount}`);
      console.log(`  Filtered out: ${unfilteredCount - userCount} users`);
    }
    
    // Analyze users by pageId
    if (userCount > 0) {
      const usersByPage = {};
      const usersOnCurrentPage = [];
      const usersOnOtherPages = [];
      
      visibilityData.active.forEach(user => {
        const userPageId = user.page_id || user.pageId;
        if (!usersByPage[userPageId || 'unknown']) {
          usersByPage[userPageId || 'unknown'] = [];
        }
        usersByPage[userPageId || 'unknown'].push(user);
        
        if (userPageId === currentPageId) {
          usersOnCurrentPage.push(user);
        } else {
          usersOnOtherPages.push(user);
        }
      });
      
      results.userInfo.usersByPage = usersByPage;
      results.userInfo.usersOnCurrentPage = usersOnCurrentPage.length;
      results.userInfo.usersOnOtherPages = usersOnOtherPages.length;
      
      console.log(`\n  Users by Page ID:`);
      Object.keys(usersByPage).forEach(pageId => {
        console.log(`    ${pageId || 'unknown'}: ${usersByPage[pageId].length} users`);
      });
      
      console.log(`\n  Users on current page (${currentPageId}): ${usersOnCurrentPage.length}`);
      console.log(`  Users on other pages: ${usersOnOtherPages.length}`);
      
      // Check if filtering by pageId is working
      if (usersOnCurrentPage.length === 0 && userCount > 0) {
        results.issues.push('No users on current page but users are visible - pageId filtering may not be working');
      }
    }
  } else {
    console.log('  currentVisibilityData NOT available');
    results.issues.push('currentVisibilityData not available on window');
  }
  
  // Check communities (if available in user data)
  console.log('\n📋 Community Information');
  if (visibilityData?.active && Array.isArray(visibilityData.active) && visibilityData.active.length > 0) {
    const allCommunities = new Set();
    const usersByCommunity = {};
    
    visibilityData.active.forEach(user => {
      const communities = user.communities || user.activeCommunities || [];
      if (Array.isArray(communities) && communities.length > 0) {
        communities.forEach(comm => {
          allCommunities.add(comm);
          if (!usersByCommunity[comm]) {
            usersByCommunity[comm] = [];
          }
          usersByCommunity[comm].push(user);
        });
      }
    });
    
    results.communityInfo.totalCommunities = allCommunities.size;
    results.communityInfo.communities = Array.from(allCommunities);
    results.communityInfo.usersByCommunity = usersByCommunity;
    
    console.log(`  Total unique communities: ${allCommunities.size}`);
    if (allCommunities.size > 0) {
      console.log(`  Communities: ${Array.from(allCommunities).join(', ')}`);
      console.log(`\n  Users per community:`);
      Object.keys(usersByCommunity).forEach(comm => {
        console.log(`    ${comm}: ${usersByCommunity[comm].length} users`);
      });
    } else {
      console.log('  No community data found in user objects');
      results.issues.push('Community data not available in user objects - community filtering may not work');
    }
  } else {
    console.log('  No users available to check communities');
  }
  
  // Check VisibilityManager
  console.log('\n📋 VisibilityManager Status');
  if (win.VisibilityManager || win.visibilityManager) {
    const vm = win.VisibilityManager || win.visibilityManager;
    console.log('  VisibilityManager available');
    
    if (typeof vm.getStatus === 'function') {
      try {
        const status = vm.getStatus();
        results.checks.visibilityManagerStatus = status;
        console.log(`  Status:`, status);
        console.log(`    Active: ${status.isActive}`);
        console.log(`    Current User Email: ${status.currentUserEmail || 'none'}`);
        console.log(`    Current Page ID: ${status.currentPageId || 'none'}`);
        console.log(`    Visible Users: ${status.visibleUsers}`);
      } catch (error) {
        console.error('  Error getting status:', error);
        results.issues.push('Error getting VisibilityManager status: ' + error.message);
      }
    }
  } else {
    console.log('  VisibilityManager NOT available');
    results.issues.push('VisibilityManager not available on window');
  }
  
  // Check refresh interval
  console.log('\n📋 Real-time Update Mechanism');
  if (win.visibilityStatusRefreshInterval) {
    console.log('  visibilityStatusRefreshInterval: ACTIVE');
    results.checks.refreshIntervalActive = true;
  } else {
    console.log('  visibilityStatusRefreshInterval: NOT FOUND');
    results.issues.push('Real-time status refresh interval not set up');
    results.checks.refreshIntervalActive = false;
  }
  
  // Check updateVisibleTab
  console.log('\n📋 updateVisibleTab Function');
  if (typeof win.updateVisibleTab === 'function') {
    console.log('  updateVisibleTab: AVAILABLE');
    results.checks.updateVisibleTabAvailable = true;
  } else {
    console.log('  updateVisibleTab: NOT AVAILABLE');
    results.issues.push('updateVisibleTab function not available on window');
    results.checks.updateVisibleTabAvailable = false;
  }
  
  // Check trace limit
  console.log('\n📋 Trace Limit Setting');
  if (win.userPreferencesManager) {
    try {
      const traceLimit = await win.userPreferencesManager.getPreference('visibilityTraceLimit');
      results.checks.traceLimit = traceLimit;
      console.log(`  Current trace limit: ${traceLimit !== null && traceLimit !== undefined ? traceLimit : 'not set (default: 30 days)'}`);
    } catch (error) {
      console.error('  Error getting trace limit:', error);
      results.issues.push('Error accessing trace limit preference: ' + error.message);
    }
  } else {
    console.log('  UserPreferencesManager NOT available');
    results.issues.push('UserPreferencesManager not available');
  }
  
  // Summary
  console.log('\n📊 DIAGNOSTIC SUMMARY');
  console.log('====================');
  console.log(`Page ID: ${currentPageId || 'NOT FOUND'}`);
  console.log(`Visible users: ${results.userInfo.visibleCount || 0}`);
  console.log(`Users on current page: ${results.userInfo.usersOnCurrentPage || 0}`);
  console.log(`Users on other pages: ${results.userInfo.usersOnOtherPages || 0}`);
  console.log(`Total communities: ${results.communityInfo.totalCommunities || 0}`);
  console.log(`Issues found: ${results.issues.length}`);
  
  results.issues.forEach((issue, idx) => {
    console.log(`  ${idx + 1}. ${issue}`);
  });
  
  console.log('\n💡 Recommendations:');
  if (results.issues.length > 0) {
    if (results.issues.some(i => i.includes('pageId') || i.includes('Page ID'))) {
      results.recommendations.push('Verify pageId is being set correctly in currentUrlData or tab container');
    }
    if (results.issues.some(i => i.includes('community'))) {
      results.recommendations.push('Check if getPageUsers returns community data and if filtering by communities is implemented');
    }
    if (results.issues.some(i => i.includes('refresh interval'))) {
      results.recommendations.push('Ensure updateVisibleTab sets up the refresh interval after rendering');
    }
    if (results.issues.some(i => i.includes('currentVisibilityData'))) {
      results.recommendations.push('Verify updateVisibleTab stores data in window.currentVisibilityData');
    }
  } else {
    results.recommendations.push('No issues found - visibility system appears to be working correctly');
  }
  
  results.recommendations.forEach((rec, idx) => {
    console.log(`  ${idx + 1}. ${rec}`);
  });
  
  console.log('\n📋 Full Results Object:');
  console.log(JSON.stringify(results, null, 2));
  
  return results;
})();



