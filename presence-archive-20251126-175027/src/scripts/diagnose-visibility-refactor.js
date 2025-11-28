/**
 * DIAGNOSTIC: Visibility System Refactor Analysis
 * 
 * This script analyzes the entire visibility system to identify
 * root causes and provide refactor recommendations.
 * 
 * Run in browser console on sidepanel.html
 */

(async function diagnoseVisibilityRefactor() {
  console.log('🔍 DIAGNOSTIC: Visibility System Refactor Analysis');
  console.log('================================================');
  
  const results = {
    timestamp: new Date().toISOString(),
    issues: [],
    architecture: {},
    dataFlow: {},
    recommendations: []
  };
  
  // 0. ROOT CAUSE: Check graph access - NO FALLBACKS
  console.log('\n0. ROOT CAUSE: Checking Graph Access...');
  console.log('Expected: window.__CANOPI_MODULE_GRAPH__ (from exposeModuleGraph in Sidepanel.ts)');
  
  const graph = window.__CANOPI_MODULE_GRAPH__;
  const sidepanelReady = window.__CANOPI_SIDEPANEL_READY__;
  
  if (!graph) {
    console.error('❌ ROOT CAUSE: Graph not accessible');
    console.log('Diagnosis:');
    console.log('  - __CANOPI_MODULE_GRAPH__:', typeof window.__CANOPI_MODULE_GRAPH__);
    console.log('  - __CANOPI_SIDEPANEL_READY__:', sidepanelReady);
    
    // Root cause analysis
    if (!sidepanelReady) {
      results.issues.push('ROOT CAUSE: Sidepanel not initialized yet - exposeModuleGraph() not called');
      results.recommendations.push('Wait for sidepanel initialization to complete');
      results.recommendations.push('Check if Sidepanel.ts loaded and buildModuleGraph() executed');
    } else {
      results.issues.push('ROOT CAUSE: Sidepanel marked ready but graph not exposed - initialization error?');
      results.recommendations.push('Check for errors during buildModuleGraph() or exposeModuleGraph()');
      results.recommendations.push('Check browser console for initialization errors');
    }
    
    // Check if Sidepanel.ts has loaded
    const sidepanelLoaded = typeof buildModuleGraph !== 'undefined' || 
                            typeof exposeModuleGraph !== 'undefined';
    console.log('  - Sidepanel.ts loaded:', sidepanelLoaded);
    
    if (!sidepanelLoaded) {
      results.issues.push('ROOT CAUSE: Sidepanel.ts may not have loaded yet');
      results.recommendations.push('Ensure script runs after Sidepanel.ts loads');
    }
    
    // NO FALLBACKS - fail clearly
    console.error('❌ Cannot proceed without graph - this is a root cause issue, not a fallback scenario');
    results.architecture.graphAccess = {
      accessible: false,
      sidepanelReady: sidepanelReady,
      rootCause: sidepanelReady ? 'Graph not exposed despite sidepanel ready' : 'Sidepanel not initialized'
    };
    
    // Return early - no point continuing without graph
    console.log('\n================================================');
    console.log('📊 DIAGNOSTIC SUMMARY');
    console.log('================================================');
    console.log('❌ CRITICAL: Cannot access graph - root cause must be fixed first');
    console.log('Issues Found:', results.issues.length);
    results.issues.forEach((issue, i) => {
      console.log(`${i + 1}. ${issue}`);
    });
    console.log('\nRecommendations:');
    results.recommendations.forEach((rec, i) => {
      console.log(`${i + 1}. ${rec}`);
    });
    return results;
  }
  
  // Graph is accessible - proceed
  console.log('✅ Graph accessible via window.__CANOPI_MODULE_GRAPH__');
  console.log('Graph properties:', Object.keys(graph));
  results.architecture.graphAccess = {
    accessible: true,
    sidepanelReady: sidepanelReady,
    properties: Object.keys(graph)
  };
  
  // 1. Check VisibilityManager state
  console.log('\n1. Checking VisibilityManager State...');
  try {
    // Graph is guaranteed to exist at this point (script returns early if not)
    const vm = graph.visibilityManager;
    if (!vm) {
      results.issues.push('VisibilityManager not found in graph object');
      console.error('❌ VisibilityManager not found in graph');
      console.log('Graph properties:', Object.keys(graph));
    } else {
      const status = vm.getStatus();
      results.architecture.visibilityManager = {
        exists: true,
        isActive: status.isActive,
        currentUserId: status.currentUserId,
        currentUserEmail: status.currentUserEmail,
        currentPageId: status.currentPageId,
        visibleUsers: status.visibleUsers || 0
      };
      console.log('VisibilityManager Status:', results.architecture.visibilityManager);
      
      if (!status.isActive) {
        results.issues.push('VisibilityManager is not active');
      }
      if (!status.currentUserId) {
        results.issues.push('VisibilityManager has no currentUserId (UUID)');
      }
    }
  } catch (error) {
    results.issues.push(`Error checking VisibilityManager: ${error.message}`);
    console.error('Error:', error);
  }
  
  // 2. Check current user from state
  console.log('\n2. Checking Current User...');
  try {
    const stateManager = graph.stateManager;
    if (stateManager) {
      const currentUser = await stateManager.getState('currentUser');
      results.architecture.currentUser = {
        exists: !!currentUser,
        id: currentUser?.id,
        userId: currentUser?.userId,
        email: currentUser?.email,
        isUUID: currentUser?.id ? /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(currentUser.id) : false
      };
      console.log('Current User:', results.architecture.currentUser);
      
      if (currentUser && !results.architecture.currentUser.isUUID) {
        results.issues.push(`Current user.id is not a UUID: ${currentUser.id}`);
      }
      if (currentUser && currentUser.id !== results.architecture.visibilityManager?.currentUserId) {
        results.issues.push('Current user.id does not match VisibilityManager currentUserId');
      }
    }
  } catch (error) {
    results.issues.push(`Error checking current user: ${error.message}`);
    console.error('Error:', error);
  }
  
  // 3. Check realtime service
  console.log('\n3. Checking Realtime Service...');
  try {
    const vm = graph.visibilityManager;
    if (vm) {
      // Check if realtime service exists
      const realtime = vm.realtime || vm['realtime'];
      if (realtime) {
        results.architecture.realtime = {
          exists: true,
          hasGetPageUsers: typeof realtime.getPageUsers === 'function',
          hasGetUserProfile: typeof realtime.getUserProfile === 'function',
          hasOn: typeof realtime.on === 'function'
        };
        console.log('Realtime Service:', results.architecture.realtime);
      } else {
        results.issues.push('Realtime service not found in VisibilityManager');
      }
    }
  } catch (error) {
    results.issues.push(`Error checking realtime service: ${error.message}`);
    console.error('Error:', error);
  }
  
  // 4. Check database presence records
  console.log('\n4. Checking Database Presence Records...');
  try {
    const stateManager = graph.stateManager;
      const currentUrlData = await stateManager?.getState('currentUrlData');
      const pageId = currentUrlData?.pageId;
      
      if (pageId && graph.supabaseService) {
        const client = graph.supabaseService.getClient();
      if (client) {
        // Query user_presence table
        const { data: presenceData, error: presenceError } = await client
          .from('user_presence')
          .select('user_id, page_id, last_seen, is_active')
          .eq('page_id', pageId)
          .eq('is_active', true);
        
        if (presenceError) {
          results.issues.push(`Database query error: ${presenceError.message}`);
        } else {
          results.dataFlow.presenceRecords = {
            pageId,
            count: presenceData?.length || 0,
            records: presenceData || []
          };
          console.log(`Presence records for ${pageId}:`, results.dataFlow.presenceRecords);
          
          // Check if current user is in presence records
          const currentUser = await stateManager.getState('currentUser');
          if (currentUser?.id && presenceData) {
            const currentUserInPresence = presenceData.find(r => r.user_id === currentUser.id);
            results.dataFlow.currentUserInPresence = {
              found: !!currentUserInPresence,
              record: currentUserInPresence || null
            };
            console.log('Current user in presence:', results.dataFlow.currentUserInPresence);
          }
        }
      }
    }
  } catch (error) {
    results.issues.push(`Error checking database: ${error.message}`);
    console.error('Error:', error);
  }
  
  // 5. Test getPageUsers directly
  console.log('\n5. Testing getPageUsers Directly...');
  try {
    const vm = graph.visibilityManager;
    const stateManager = graph.stateManager;
    const currentUrlData = await stateManager?.getState('currentUrlData');
    const pageId = currentUrlData?.pageId;
    
    if (vm && pageId) {
      const realtime = vm.realtime || vm['realtime'];
      if (realtime && typeof realtime.getPageUsers === 'function') {
        const users = await realtime.getPageUsers(pageId);
        results.dataFlow.getPageUsersResult = {
          count: users?.length || 0,
          users: users || [],
          hasCurrentUser: false
        };
        
        // Check if current user is in results
        const currentUser = await stateManager.getState('currentUser');
        if (currentUser?.id && users) {
          const currentUserInResults = users.find(u => u.id === currentUser.id || u.userId === currentUser.id);
          results.dataFlow.getPageUsersResult.hasCurrentUser = !!currentUserInResults;
          results.dataFlow.getPageUsersResult.currentUserMatch = currentUserInResults || null;
        }
        
        console.log('getPageUsers result:', results.dataFlow.getPageUsersResult);
        
        if (results.dataFlow.getPageUsersResult.hasCurrentUser) {
          results.issues.push('Current user is in getPageUsers results (should be filtered out)');
        }
      }
    }
  } catch (error) {
    results.issues.push(`Error testing getPageUsers: ${error.message}`);
    console.error('Error:', error);
  }
  
  // 6. Test refreshVisibilityAvatars
  console.log('\n6. Testing refreshVisibilityAvatars...');
  try {
    const vm = graph.visibilityManager;
    const stateManager = graph.stateManager;
    const currentUrlData = await stateManager?.getState('currentUrlData');
    const pageId = currentUrlData?.pageId;
    
    if (vm && pageId) {
      const users = await vm.refreshVisibilityAvatars(pageId);
      results.dataFlow.refreshResult = {
        count: users?.length || 0,
        users: users || [],
        hasCurrentUser: false
      };
      
      // Check if current user is in results
      const currentUser = await stateManager.getState('currentUser');
      if (currentUser?.id && users) {
        const currentUserInResults = users.find(u => u.id === currentUser.id || u.userId === currentUser.id);
        results.dataFlow.refreshResult.hasCurrentUser = !!currentUserInResults;
      }
      
      console.log('refreshVisibilityAvatars result:', results.dataFlow.refreshResult);
      
      if (results.dataFlow.refreshResult.hasCurrentUser) {
        results.issues.push('Current user is in refreshVisibilityAvatars results (should be filtered out)');
      }
    }
  } catch (error) {
    results.issues.push(`Error testing refreshVisibilityAvatars: ${error.message}`);
    console.error('Error:', error);
  }
  
  // 7. Check filterCurrentUser logic
  console.log('\n7. Checking filterCurrentUser Logic...');
  try {
    const vm = graph.visibilityManager;
    const currentUser = await graph.stateManager?.getState('currentUser');
    
    if (vm && currentUser) {
      const testUsers = [
        { id: currentUser.id, email: currentUser.email, name: 'Current User' },
        { id: '550e8400-e29b-41d4-a716-446655440001', email: 'other@example.com', name: 'Other User' }
      ];
      
      // Import filterCurrentUser if available
      // This is a test - in real code it's imported
      const filtered = testUsers.filter(u => {
        return !(u.id && String(u.id) === String(currentUser.id));
      });
      
      results.dataFlow.filterTest = {
        inputCount: testUsers.length,
        outputCount: filtered.length,
        currentUserFiltered: filtered.length < testUsers.length,
        currentUserId: currentUser.id,
        vmCurrentUserId: vm.getStatus()?.currentUserId
      };
      
      console.log('Filter test:', results.dataFlow.filterTest);
      
      if (!results.dataFlow.filterTest.currentUserFiltered) {
        results.issues.push('filterCurrentUser logic test failed - current user not filtered');
      }
      if (results.dataFlow.filterTest.vmCurrentUserId !== results.dataFlow.filterTest.currentUserId) {
        results.issues.push('VisibilityManager currentUserId does not match current user.id');
      }
    }
  } catch (error) {
    results.issues.push(`Error testing filter logic: ${error.message}`);
    console.error('Error:', error);
  }
  
  // 8. Check initialization flow
  console.log('\n8. Checking Initialization Flow...');
  try {
    const bootController = graph.bootController;
    results.architecture.initialization = {
      bootControllerExists: !!bootController,
      visibilityManagerInitialized: results.architecture.visibilityManager?.isActive || false
    };
    
    // Check if there are multiple initialization paths
    const initPaths = [];
    if (bootController) initPaths.push('BootController.handleUserChange');
    // Check if buildGraph exists (it's a function, not on graph)
    if (typeof buildGraph === 'function') initPaths.push('buildGraph (direct)');
    // Check for createVisibilityRefresher
    if (graph?.createVisibilityRefresher || typeof createVisibilityRefresher === 'function') {
      initPaths.push('createVisibilityRefresher');
    }
    
    results.architecture.initialization.paths = initPaths;
    results.architecture.initialization.pathCount = initPaths.length;
    
    if (initPaths.length > 1) {
      results.issues.push(`Multiple initialization paths detected: ${initPaths.join(', ')} - may cause race conditions`);
    }
    
    console.log('Initialization:', results.architecture.initialization);
  } catch (error) {
    results.issues.push(`Error checking initialization: ${error.message}`);
    console.error('Error:', error);
  }
  
  // Generate recommendations
  console.log('\n9. Generating Recommendations...');
  
  if (results.issues.length > 0) {
    results.recommendations.push('Fix identified issues before refactoring');
  }
  
  if (!results.architecture.visibilityManager?.isActive) {
    results.recommendations.push('Ensure VisibilityManager is initialized before use');
  }
  
  if (results.architecture.initialization?.pathCount > 1) {
    results.recommendations.push('Consolidate initialization to single path');
  }
  
  if (results.dataFlow.getPageUsersResult?.hasCurrentUser || results.dataFlow.refreshResult?.hasCurrentUser) {
    results.recommendations.push('Fix filterCurrentUser to properly filter out current user');
  }
  
  results.recommendations.push('Consider refactoring to: 1) Single initialization point, 2) Clear data flow (DB -> Realtime -> Manager -> State -> UI), 3) UUID-only throughout, 4) Proper error handling');
  
  // Summary
  console.log('\n================================================');
  console.log('📊 DIAGNOSTIC SUMMARY');
  console.log('================================================');
  console.log(`Issues Found: ${results.issues.length}`);
  results.issues.forEach((issue, i) => {
    console.log(`${i + 1}. ${issue}`);
  });
  
  console.log('\nRecommendations:');
  results.recommendations.forEach((rec, i) => {
    console.log(`${i + 1}. ${rec}`);
  });
  
  console.log('\n📋 Full Results:', results);
  
  return results;
})();

