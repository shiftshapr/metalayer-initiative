/**
 * Diagnostic Script: Messages Status Check
 * 
 * PURPOSE: Check if messages are loading and displaying correctly
 * 
 * USAGE: Copy this entire script and paste into browser console
 * 
 * CRITICAL: This is pure JavaScript - NO TypeScript syntax, NO imports/exports
 */

(function() {
  'use strict';
  
  console.log('🔍 DIAGNOSTIC: Messages Status Check');
  console.log('==============================================================');
  
  const results = {
    timestamp: new Date().toISOString(),
    checks: {},
    issues: [],
    recommendations: []
  };
  
  // Check 1: Container
  console.log('\n📋 Check 1: Messages Container');
  const container = document.querySelector('.chat-messages');
  const containerInfo = {
    exists: !!container,
    visible: container ? window.getComputedStyle(container).display !== 'none' : false,
    childCount: container ? container.children.length : 0,
    hasMessages: container ? container.children.length > 0 : false
  };
  console.log('  Container info:', containerInfo);
  results.checks.container = containerInfo;
  
  if (!containerInfo.exists) {
    results.issues.push('Chat messages container not found');
  }
  if (containerInfo.childCount === 0) {
    results.issues.push('No messages in container');
  }
  
  // Check 2: Active Communities
  console.log('\n📋 Check 2: Active Communities');
  const stateManager = window.stateManager || window.stateManagerInstance;
  let activeCommunities = null;
  if (stateManager && typeof stateManager.getState === 'function') {
    activeCommunities = stateManager.getState('ui.activeCommunities');
  }
  const communitiesInfo = {
    available: Array.isArray(activeCommunities),
    count: Array.isArray(activeCommunities) ? activeCommunities.length : 0,
    communities: activeCommunities
  };
  console.log('  Communities info:', communitiesInfo);
  results.checks.communities = communitiesInfo;
  
  if (!communitiesInfo.available || communitiesInfo.count === 0) {
    results.issues.push('No active communities found');
    results.recommendations.push('Check if communities are being loaded from API');
  }
  
  // Check 3: Current URL Data
  console.log('\n📋 Check 3: Current URL Data');
  let currentUrlData = null;
  let pageId = null;
  if (stateManager && typeof stateManager.getState === 'function') {
    currentUrlData = stateManager.getState('currentUrlData');
    pageId = currentUrlData?.pageId;
  }
  const urlInfo = {
    hasCurrentUrl: !!currentUrlData,
    pageId: pageId || 'unknown',
    rawUrl: currentUrlData?.rawUrl || 'unknown'
  };
  console.log('  URL info:', urlInfo);
  results.checks.url = urlInfo;
  
  if (!urlInfo.hasCurrentUrl || urlInfo.pageId === 'unknown') {
    results.issues.push('No current URL data or pageId');
    results.recommendations.push('Check TabController - it should set currentUrlData');
  }
  
  // Check 4: Active Tab
  console.log('\n📋 Check 4: Active Tab');
  const discussTab = document.getElementById('discuss-tab');
  const visibilityTab = document.getElementById('visibility-tab');
  const tabInfo = {
    discussTabActive: discussTab ? discussTab.classList.contains('active') : false,
    visibilityTabActive: visibilityTab ? visibilityTab.classList.contains('active') : false
  };
  console.log('  Tab info:', tabInfo);
  results.checks.tab = tabInfo;
  
  if (tabInfo.visibilityTabActive && !tabInfo.discussTabActive) {
    results.issues.push('Visibility tab is active - messages won\'t load on visibility tab');
    results.recommendations.push('Switch to discuss tab to see messages');
  }
  
  // Check 5: loadChatHistory availability
  console.log('\n📋 Check 5: loadChatHistory Function');
  const loadChatHistory = window.loadChatHistory;
  const loadChatHistoryInfo = {
    available: typeof loadChatHistory === 'function'
  };
  console.log('  loadChatHistory available:', loadChatHistoryInfo.available);
  results.checks.loadChatHistory = loadChatHistoryInfo;
  
  if (!loadChatHistoryInfo.available) {
    results.issues.push('loadChatHistory not available on window');
  }
  
  // Check 6: Messages in State
  console.log('\n📋 Check 6: Messages in State');
  let messagesInState = null;
  if (stateManager && typeof stateManager.getState === 'function') {
    messagesInState = stateManager.getState('chat.data');
  }
  const stateMessagesInfo = {
    available: Array.isArray(messagesInState),
    count: Array.isArray(messagesInState) ? messagesInState.length : 0
  };
  console.log('  Messages in state:', stateMessagesInfo);
  results.checks.stateMessages = stateMessagesInfo;
  
  // Check 7: Test loadChatHistory call
  if (loadChatHistoryInfo.available && urlInfo.pageId !== 'unknown' && communitiesInfo.count > 0) {
    console.log('\n📋 Check 7: Testing loadChatHistory');
    console.log('  Calling loadChatHistory with:', {
      pageId: urlInfo.pageId,
      communities: communitiesInfo.communities
    });
    
    loadChatHistory(urlInfo.pageId, communitiesInfo.communities).then(function() {
      console.log('✅ loadChatHistory completed');
      setTimeout(function() {
        const newContainerInfo = {
          childCount: container ? container.children.length : 0,
          hasMessages: container ? container.children.length > 0 : false
        };
        console.log('  Messages after load:', newContainerInfo);
        results.checks.afterLoad = newContainerInfo;
        
        if (newContainerInfo.childCount === 0) {
          results.issues.push('No messages loaded after calling loadChatHistory');
          results.recommendations.push('Check Network tab for /api/messages requests');
          results.recommendations.push('Check console for errors during loadChatHistory');
        } else {
          console.log(`✅ Successfully loaded ${newContainerInfo.childCount} messages!`);
        }
        
        console.log('\n📊 FINAL RESULTS:');
        console.log(JSON.stringify(results, null, 2));
      }, 2000);
    }).catch(function(error) {
      console.error('❌ loadChatHistory failed:', error);
      results.checks.afterLoad = {
        error: error.message || String(error)
      };
      results.issues.push('loadChatHistory call failed: ' + (error.message || String(error)));
      
      console.log('\n📊 FINAL RESULTS:');
      console.log(JSON.stringify(results, null, 2));
    });
  } else {
    console.log('⚠️ Skipping loadChatHistory test - missing prerequisites');
    results.checks.afterLoad = {
      skipped: true,
      reason: !loadChatHistoryInfo.available ? 'loadChatHistory not available' :
              urlInfo.pageId === 'unknown' ? 'No pageId' :
              communitiesInfo.count === 0 ? 'No communities' : 'Unknown'
    };
  }
  
  // Summary
  console.log('\n📊 SUMMARY:');
  console.log(`  Issues found: ${results.issues.length}`);
  if (results.issues.length > 0) {
    results.issues.forEach(function(issue, idx) {
      console.log(`    ${idx + 1}. ${issue}`);
    });
  }
  
  if (results.recommendations.length > 0) {
    console.log('\n💡 Recommendations:');
    results.recommendations.forEach(function(rec, idx) {
      console.log(`    ${idx + 1}. ${rec}`);
    });
  }
  
  return results;
})();

