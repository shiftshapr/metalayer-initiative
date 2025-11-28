/**
 * Diagnostic Script: Communities API Request/Response
 * 
 * PURPOSE: Check what we're sending to get communities and what we're receiving
 * 
 * USAGE: Copy this entire script and paste into browser console
 * 
 * CRITICAL: This is pure JavaScript - NO TypeScript syntax, NO imports/exports
 */

(function() {
  'use strict';
  
  console.log('🔍 DIAGNOSTIC: Communities API Request/Response');
  console.log('==============================================================');
  
  const results = {
    timestamp: new Date().toISOString(),
    checks: {},
    issues: [],
    recommendations: []
  };
  
  // Check 1: Current user
  console.log('\n📋 Check 1: Current User');
  const stateManager = window.stateManager || window.stateManagerInstance;
  let currentUser = null;
  if (stateManager && typeof stateManager.getState === 'function') {
    currentUser = stateManager.getState('currentUser');
  }
  console.log('  Current user:', currentUser);
  results.checks.currentUser = {
    exists: !!currentUser,
    id: currentUser?.id,
    email: currentUser?.email,
    isUUID: currentUser?.id ? /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(currentUser.id) : false
  };
  
  if (!currentUser || !currentUser.id) {
    results.issues.push('No current user found in state');
    results.recommendations.push('Ensure user is authenticated before loading communities');
  }
  
  // Check 2: Active communities in state
  console.log('\n📋 Check 2: Active Communities in State');
  let activeCommunities = null;
  let allCommunities = null;
  if (stateManager && typeof stateManager.getState === 'function') {
    activeCommunities = stateManager.getState('ui.activeCommunities');
    const altActiveCommunities = stateManager.getState('activeCommunities');
    allCommunities = stateManager.getState('communities');
    console.log('  ui.activeCommunities:', activeCommunities);
    console.log('  activeCommunities (alt):', altActiveCommunities);
    console.log('  communities (all):', allCommunities);
  }
  results.checks.activeCommunities = {
    uiActiveCommunities: activeCommunities,
    activeCommunities: stateManager?.getState('activeCommunities'),
    allCommunities: allCommunities,
    hasUI: Array.isArray(activeCommunities) && activeCommunities.length > 0,
    hasAlt: Array.isArray(stateManager?.getState('activeCommunities')) && stateManager.getState('activeCommunities').length > 0,
    hasAll: Array.isArray(allCommunities) && allCommunities.length > 0
  };
  
  if (!results.checks.activeCommunities.hasUI && !results.checks.activeCommunities.hasAlt && !results.checks.activeCommunities.hasAll) {
    results.issues.push('No active communities found in any state path');
  }
  
  // Check 3: API module
  console.log('\n📋 Check 3: API Module');
  const api = window.api;
  const hasGetCommunities = api && typeof api.getCommunities === 'function';
  console.log('  API available:', !!api);
  console.log('  has getCommunities:', hasGetCommunities);
  results.checks.api = {
    available: !!api,
    hasGetCommunities: hasGetCommunities
  };
  
  if (!hasGetCommunities) {
    results.issues.push('API.getCommunities not available');
    results.recommendations.push('Check if APIModule is properly initialized');
  }
  
  // Check 4: Test API call
  if (hasGetCommunities && currentUser && currentUser.id) {
    console.log('\n📋 Check 4: Testing API Call');
    console.log('  Calling api.getCommunities()...');
    console.log('  Expected URL:', `/communities?userId=${encodeURIComponent(currentUser.id)}`);
    
    api.getCommunities().then(function(response) {
      console.log('✅ API Response received:', response);
      results.checks.apiCall = {
        success: true,
        response: response,
        isArray: Array.isArray(response),
        hasCommunities: !!(response && typeof response === 'object' && 'communities' in response),
        communitiesCount: Array.isArray(response) 
          ? response.length 
          : (response && typeof response === 'object' && 'communities' in response && Array.isArray(response.communities))
            ? response.communities.length
            : 0
      };
      
      if (results.checks.apiCall.communitiesCount === 0) {
        results.issues.push('API returned 0 communities');
        results.recommendations.push('Check backend /communities endpoint');
        results.recommendations.push('Verify user has communities in MetaCommunityMembership table');
      } else {
        console.log(`✅ Found ${results.checks.apiCall.communitiesCount} communities`);
        // Check if they're in state
        const stateCommunities = stateManager?.getState('ui.activeCommunities');
        if (!stateCommunities || stateCommunities.length === 0) {
          results.issues.push('Communities returned from API but not in state');
          results.recommendations.push('Check CommunityLoaders.loadCommunities() - it should call setActiveCommunitiesState()');
        }
      }
      
      console.log('\n📊 FINAL RESULTS:');
      console.log(JSON.stringify(results, null, 2));
    }).catch(function(error) {
      console.error('❌ API Call failed:', error);
      results.checks.apiCall = {
        success: false,
        error: error.message || String(error)
      };
      results.issues.push('API call failed: ' + (error.message || String(error)));
      results.recommendations.push('Check Network tab for /communities request');
      results.recommendations.push('Check backend logs for errors');
      
      console.log('\n📊 FINAL RESULTS:');
      console.log(JSON.stringify(results, null, 2));
    });
  } else {
    console.log('⚠️ Skipping API call test - missing prerequisites');
    results.checks.apiCall = {
      skipped: true,
      reason: !hasGetCommunities ? 'API.getCommunities not available' : 'No current user'
    };
  }
  
  // Check 5: Network requests (if available)
  console.log('\n📋 Check 5: Network Requests');
  console.log('  💡 Open DevTools Network tab and filter for "/communities"');
  console.log('  💡 Check the request URL, headers, and response');
  results.checks.network = {
    note: 'Check Network tab manually for /communities requests'
  };
  
  console.log('\n💡 Next Steps:');
  console.log('  1. Check console logs for "🔍 API: getCommunities REQUEST"');
  console.log('  2. Check Network tab for /communities request');
  console.log('  3. Verify the userId in the URL is a UUID');
  console.log('  4. Check the response format (array vs object with communities property)');
  
  return results;
})();

