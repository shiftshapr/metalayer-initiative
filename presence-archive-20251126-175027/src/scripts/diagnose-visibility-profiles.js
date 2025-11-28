/**
 * Diagnostic Script: Visibility Profiles Not Showing
 * 
 * This script diagnoses why visibility profiles are not showing correctly:
 * - No "last seen" profiles when on different pages
 * - No "online" profiles when on the same page
 * 
 * Usage: Run in browser console
 */

(async function() {
  console.log('🔍 DIAGNOSTIC: Visibility Profiles Not Showing');
  console.log('================================================\n');

  const results = {
    timestamp: new Date().toISOString(),
    currentPageId: null,
    visibilityUsers: null,
    visibilityState: null,
    issues: []
  };

  // 1. Check current pageId
  console.log('1. Checking Current PageId...');
  const getCurrentPageId = window.getCurrentPageId || 
                           (window.__CANOPI_MODULE_GRAPH__ && window.__CANOPI_MODULE_GRAPH__.visibilityManager && window.__CANOPI_MODULE_GRAPH__.visibilityManager.getCurrentPageId);
  if (getCurrentPageId) {
    results.currentPageId = getCurrentPageId();
    console.log('   Current PageId:', results.currentPageId);
  } else {
    // Try to get from state
    try {
      const stateManager = window.stateManager || (window.__CANOPI_MODULE_GRAPH__ && window.__CANOPI_MODULE_GRAPH__.stateManager);
      if (stateManager && typeof stateManager.getState === 'function') {
        try {
          // Use getAll() to get full state, handle both sync and async versions
          let state;
          if (stateManager.getAll) {
            // getAll() is async, use Promise to handle it
            const getAllResult = stateManager.getAll();
            if (getAllResult instanceof Promise) {
              state = await getAllResult;
            } else {
              state = getAllResult;
            }
          } else if (stateManager.getState) {
            // getState() now handles undefined path and returns full state (sync)
            state = stateManager.getState();
          } else {
            throw new Error('StateManager has neither getAll() nor getState() method');
          }
          if (state && state.currentUrlData && state.currentUrlData.pageId) {
            results.currentPageId = state.currentUrlData.pageId;
            console.log('   Current PageId (from state):', results.currentPageId);
          } else {
            results.issues.push('Could not determine current pageId from state');
            console.log('   ❌ State exists but currentUrlData.pageId is missing');
          }
        } catch (stateError) {
          results.issues.push('Error calling getState(): ' + stateError.message);
          console.log('   ❌ Error calling getState():', stateError.message);
        }
      } else {
        results.issues.push('Could not determine current pageId - stateManager not available');
        console.log('   ❌ Could not determine current pageId - stateManager not available');
      }
    } catch (error) {
      results.issues.push('Error accessing stateManager: ' + error.message);
      console.log('   ❌ Error accessing stateManager:', error.message);
    }
  }

  // 2. Check visibility users
  console.log('\n2. Checking Visibility Users...');
  const visibilityState = (window.__CANOPI_MODULE_GRAPH__ && window.__CANOPI_MODULE_GRAPH__.visibilityManager && window.__CANOPI_MODULE_GRAPH__.visibilityManager.state) ||
                          (window.__CANOPI_MODULE_GRAPH__ && window.__CANOPI_MODULE_GRAPH__.visibilityState) ||
                          window.visibilityState;
  if (visibilityState) {
    const users = visibilityState.getUsers ? visibilityState.getUsers() : [];
    results.visibilityUsers = {
      count: users.length,
      users: users.map(function(u) {
        // Check for field naming mismatch (page_id vs pageId)
        const pageId = u.page_id || u.pageId;
        return {
          id: u.id,
          name: u.name,
          isActive: u.isActive,
          page_id: u.page_id,
          pageId: u.pageId,
          pageIdResolved: pageId, // Resolved value (either page_id or pageId)
          lastSeen: u.lastSeen,
          samePage: pageId === results.currentPageId,
          differentPage: pageId && pageId !== results.currentPageId,
          hasFieldMismatch: (u.page_id && u.pageId) || (!u.page_id && !u.pageId && u.pageId !== undefined)
        };
      })
    };
    console.log('   Users:', results.visibilityUsers);
    
    // Check for field naming issues
    const fieldMismatchUsers = results.visibilityUsers.users.filter(function(u) { return u.hasFieldMismatch; });
    if (fieldMismatchUsers.length > 0) {
      results.issues.push(`Field naming mismatch: ${fieldMismatchUsers.length} users have both page_id and pageId or neither`);
      console.log('   ⚠️ Field naming mismatch detected');
    }
    
    // Check for issues
    const samePageUsers = results.visibilityUsers.users.filter(function(u) { return u.samePage; });
    const differentPageUsers = results.visibilityUsers.users.filter(function(u) { return u.differentPage; });
    
    // Check if VisibilityManager is available and can refresh
    const visibilityManager = window.__CANOPI_MODULE_GRAPH__ && window.__CANOPI_MODULE_GRAPH__.visibilityManager;
    if (visibilityManager) {
      results.visibilityManager = {
        available: true,
        hasRefreshMethod: typeof visibilityManager.refreshVisibilityAvatars === 'function',
        currentPageId: visibilityManager.currentPageId || (visibilityManager.getStatus && visibilityManager.getStatus().currentPageId) || null
      };
      console.log('   VisibilityManager:', results.visibilityManager);
    } else {
      results.visibilityManager = { available: false };
      results.issues.push('VisibilityManager not found in module graph');
      console.log('   ❌ VisibilityManager not found');
    }
    
    if (samePageUsers.length === 0 && results.visibilityUsers.count > 0) {
      results.issues.push('No users found on same page (should show "Online")');
      console.log('   ❌ No users on same page');
    }
    
    if (differentPageUsers.length > 0) {
      const withoutLastSeen = differentPageUsers.filter(function(u) { return !u.lastSeen; });
      if (withoutLastSeen.length > 0) {
        results.issues.push(`${withoutLastSeen.length} users on different pages without lastSeen (should show "Last seen")`);
        console.log(`   ❌ ${withoutLastSeen.length} users without lastSeen`);
      }
    }
  } else {
    results.issues.push('VisibilityState not found');
    console.log('   ❌ VisibilityState not found');
  }

  // 3. Check visibility tab rendering
  console.log('\n3. Checking Visibility Tab...');
  const visibilityTab = document.getElementById('visibility-tab');
  const userList = visibilityTab?.querySelector('.item-list');
  const userItems = userList?.querySelectorAll('li');
  results.visibilityTab = {
    exists: !!visibilityTab,
    isActive: visibilityTab?.classList.contains('active'),
    userCount: userItems?.length || 0,
    hasUsers: (userItems?.length || 0) > 0
  };
  console.log('   Visibility Tab:', results.visibilityTab);

  // 4. Check user status text
  console.log('\n4. Checking User Status Display...');
  if (userItems && userItems.length > 0) {
    const statusTexts = [];
    userItems.forEach((item) => {
      const statusEl = item.querySelector('.item-status');
      if (statusEl) {
        statusTexts.push(statusEl.textContent || '');
      }
    });
    results.statusTexts = statusTexts;
    console.log('   Status Texts:', statusTexts);
    
    const hasOnline = statusTexts.some(s => s.includes('Online'));
    const hasLastSeen = statusTexts.some(s => s.includes('Last seen'));
    
    if (!hasOnline && samePageUsers.length > 0) {
      results.issues.push('Users on same page not showing "Online" status');
      console.log('   ❌ No "Online" status found');
    }
    
    if (!hasLastSeen && differentPageUsers.length > 0) {
      results.issues.push('Users on different pages not showing "Last seen" status');
      console.log('   ❌ No "Last seen" status found');
    }
  }

  // Summary
  console.log('\n================================================');
  console.log('📊 DIAGNOSTIC SUMMARY');
  console.log('================================================');
  console.log('Issues Found:', results.issues.length);
  for (var i = 0; i < results.issues.length; i++) {
    console.log('  ' + (i + 1) + '. ' + results.issues[i]);
  }
  
  console.log('\n✅ Expected State:');
  console.log('  - Users on same page should show "Online"');
  console.log('  - Users on different pages should show "Last seen X ago"');
  console.log('  - VisibilityState should have users with pageId (camelCase) and lastSeen');
  console.log('  - Field naming: Use pageId (camelCase) consistently, not page_id (snake_case)');
  
  console.log('\n🔧 Root Cause Checks:');
  console.log('  1. Field naming: Check if users have pageId (camelCase) or page_id (snake_case)');
  console.log('  2. Data loading: Check if refreshVisibilityAvatars() is being called');
  console.log('  3. Page ID: Check if currentPageId matches user pageId');
  console.log('  4. Database: Check if presence table has data for current pageId');
  
  // 5. Manual refresh test
  console.log('\n5. Testing Manual Refresh...');
  const visibilityManager = window.__CANOPI_MODULE_GRAPH__ && window.__CANOPI_MODULE_GRAPH__.visibilityManager;
  if (visibilityManager && results.currentPageId && typeof visibilityManager.refreshVisibilityAvatars === 'function') {
    try {
      console.log('   Attempting manual refresh with pageId:', results.currentPageId);
      const refreshedUsers = await visibilityManager.refreshVisibilityAvatars(results.currentPageId);
      console.log('   ✅ Manual refresh completed:', { userCount: refreshedUsers.length });
      results.manualRefresh = {
        success: true,
        userCount: refreshedUsers.length,
        users: refreshedUsers.map(u => ({
          id: u.id,
          name: u.name,
          pageId: u.pageId || u.page_id,
          isActive: u.isActive,
          lastSeen: u.lastSeen
        }))
      };
      
      // Re-check visibility state after refresh
      const visibilityStateAfter = (window.__CANOPI_MODULE_GRAPH__ && window.__CANOPI_MODULE_GRAPH__.visibilityManager && window.__CANOPI_MODULE_GRAPH__.visibilityManager.state) ||
                                   (window.__CANOPI_MODULE_GRAPH__ && window.__CANOPI_MODULE_GRAPH__.visibilityState);
      if (visibilityStateAfter) {
        const usersAfter = visibilityStateAfter.getUsers ? visibilityStateAfter.getUsers() : [];
        results.visibilityStateAfterRefresh = {
          count: usersAfter.length,
          users: usersAfter.length > 0 ? usersAfter.slice(0, 3).map(u => ({ id: u.id, name: u.name, pageId: u.pageId || u.page_id })) : []
        };
        console.log('   VisibilityState after refresh:', results.visibilityStateAfterRefresh);
      }
    } catch (refreshError) {
      results.manualRefresh = {
        success: false,
        error: refreshError.message || String(refreshError)
      };
      console.log('   ❌ Manual refresh failed:', refreshError);
      results.issues.push('Manual refresh failed: ' + (refreshError.message || String(refreshError)));
    }
  } else {
    results.manualRefresh = {
      success: false,
      error: 'VisibilityManager or refreshVisibilityAvatars not available'
    };
    console.log('   ❌ Cannot test manual refresh - VisibilityManager not available');
    results.issues.push('Cannot test manual refresh - VisibilityManager not available');
  }
  
  console.log('\n📋 Full Results:', JSON.stringify(results, null, 2));
  
  return results;
})();

