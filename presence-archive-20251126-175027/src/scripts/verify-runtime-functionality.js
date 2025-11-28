/**
 * Runtime Functionality Verification Script
 * 
 * Comprehensive check of messages and visibility functionality after TypeScript migration.
 * 
 * Usage: Copy and paste into browser console after extension loads
 */

(function() {
  console.log('🔍 RUNTIME VERIFICATION: Messages and Visibility Functionality');
  console.log('==============================================================\n');

  const result = {
    timestamp: new Date().toISOString(),
    buildInfo: {},
    moduleGraph: {},
    messages: {},
    visibility: {},
    errors: [],
    warnings: [],
    recommendations: []
  };

  if (typeof window === 'undefined') {
    console.log('❌ Window not available');
    return result;
  }

  const win = window;

  // 1. Check Build Info
  console.log('1. Build Information:');
  const buildInfo = win.__CANOPI_BUILD_INFO__ || null;
  if (buildInfo) {
    result.buildInfo = buildInfo;
    console.log('   ✅ Build info found:', buildInfo);
  } else {
    result.warnings.push('Build info not found');
    console.log('   ⚠️ Build info not found');
  }

  // 2. Check Sidepanel Ready State
  console.log('\n2. Sidepanel Initialization:');
  if (win.__CANOPI_SIDEPANEL_READY__) {
    result.moduleGraph.sidepanelReady = true;
    console.log('   ✅ Sidepanel marked as ready');
  } else {
    result.moduleGraph.sidepanelReady = false;
    result.errors.push('Sidepanel not marked as ready - initialization may have failed');
    console.log('   ❌ Sidepanel NOT marked as ready');
  }

  // 3. Check Module Graph
  console.log('\n3. Module Graph Check:');
  if (win.__CANOPI_MODULE_GRAPH__) {
    result.moduleGraph.exists = true;
    const graph = win.__CANOPI_MODULE_GRAPH__;
    result.moduleGraph.keys = Object.keys(graph);
    console.log('   ✅ Module graph exists');
    console.log('   Available modules:', result.moduleGraph.keys.join(', '));

    // Check MessagesModule
    if (graph.messagesModule) {
      result.messages.moduleInGraph = true;
      console.log('   ✅ MessagesModule found in module graph');
    } else {
      result.messages.moduleInGraph = false;
      result.warnings.push('MessagesModule not in module graph (may be initialized differently)');
      console.log('   ⚠️ MessagesModule not in module graph');
    }

    // Check MessageLoadingService
    if (graph.messageLoadingService) {
      result.messages.loadingService = true;
      console.log('   ✅ MessageLoadingService found');
      if (typeof graph.messageLoadingService.loadMessages === 'function') {
        result.messages.loadMessagesMethod = true;
        console.log('   ✅ MessageLoadingService.loadMessages method exists');
      } else {
        result.messages.loadMessagesMethod = false;
        result.errors.push('MessageLoadingService.loadMessages method missing');
        console.log('   ❌ MessageLoadingService.loadMessages method missing');
      }
    } else {
      result.messages.loadingService = false;
      result.warnings.push('MessageLoadingService not in module graph');
      console.log('   ⚠️ MessageLoadingService not in module graph');
    }

    // Check VisibilityManager
    if (graph.visibilityManager) {
      result.visibility.manager = true;
      console.log('   ✅ VisibilityManager found');
      
      if (typeof graph.visibilityManager.initialize === 'function') {
        result.visibility.hasInitialize = true;
        console.log('   ✅ VisibilityManager has initialize method');
      } else {
        result.visibility.hasInitialize = false;
        result.warnings.push('VisibilityManager missing initialize method');
        console.log('   ⚠️ VisibilityManager missing initialize method');
      }

      if (typeof graph.visibilityManager.refreshVisibilityAvatars === 'function') {
        result.visibility.hasRefresh = true;
        console.log('   ✅ VisibilityManager has refreshVisibilityAvatars method');
      } else {
        result.visibility.hasRefresh = false;
        result.errors.push('VisibilityManager missing refreshVisibilityAvatars method');
        console.log('   ❌ VisibilityManager missing refreshVisibilityAvatars method');
      }
    } else {
      result.visibility.manager = false;
      result.errors.push('VisibilityManager not in module graph');
      console.log('   ❌ VisibilityManager NOT found in module graph');
    }

    // Check VisibilityUIEvents
    if (graph.visibilityUIEvents) {
      result.visibility.uiEvents = true;
      console.log('   ✅ VisibilityUIEvents found');
    } else {
      result.visibility.uiEvents = false;
      result.warnings.push('VisibilityUIEvents not in module graph');
      console.log('   ⚠️ VisibilityUIEvents not in module graph');
    }
  } else {
    result.moduleGraph.exists = false;
    result.errors.push('Module graph not found - buildModuleGraph may have failed');
    console.log('   ❌ Module graph NOT found');
  }

  // 4. Check Window Functions
  console.log('\n4. Window Functions Check:');
  
  // loadChatHistory
  if (typeof win.loadChatHistory === 'function') {
    result.messages.loadChatHistory = true;
    console.log('   ✅ loadChatHistory function exists on window');
  } else {
    result.messages.loadChatHistory = false;
    result.warnings.push('loadChatHistory function not found on window (may be module-only)');
    console.log('   ⚠️ loadChatHistory function NOT found on window');
  }

  // initializeMessagesModule
  if (typeof win.initializeMessagesModule === 'function') {
    result.messages.initializeMessagesModule = true;
    console.log('   ✅ initializeMessagesModule function exists on window');
  } else {
    result.messages.initializeMessagesModule = false;
    result.warnings.push('initializeMessagesModule function not found on window (may be called automatically)');
    console.log('   ⚠️ initializeMessagesModule function NOT found on window');
  }

  // 5. Check State Manager
  console.log('\n5. State Manager Check:');
  if (win.__CANOPI_MODULE_GRAPH__?.stateManager) {
    const stateManager = win.__CANOPI_MODULE_GRAPH__.stateManager;
    result.messages.stateManager = true;
    console.log('   ✅ StateManager found');
    
    // Check chat data
    try {
      const chatData = stateManager.getState('chat.data');
      if (Array.isArray(chatData)) {
        result.messages.chatData = true;
        result.messages.chatDataLength = chatData.length;
        console.log(`   ✅ Chat data exists (${chatData.length} messages)`);
      } else {
        result.messages.chatData = false;
        result.warnings.push('Chat data not found or not an array');
        console.log('   ⚠️ Chat data not found or not an array');
      }
    } catch (error) {
      result.messages.chatData = false;
      result.errors.push('Error accessing chat data: ' + (error instanceof Error ? error.message : String(error)));
      console.log('   ❌ Error accessing chat data:', error);
    }

    // Check current user
    try {
      const currentUser = stateManager.getState('currentUser');
      if (currentUser && typeof currentUser === 'object' && 'id' in currentUser) {
        result.messages.currentUser = true;
        // Plain JS - no TypeScript 'as' syntax
        const userId = currentUser.id || currentUser.userId || 'unknown';
        result.messages.currentUserId = userId;
        console.log('   ✅ Current user found:', result.messages.currentUserId);
      } else {
        result.messages.currentUser = false;
        result.warnings.push('Current user not found in state');
        console.log('   ⚠️ Current user not found in state');
      }
    } catch (error) {
      result.messages.currentUser = false;
      result.errors.push('Error accessing current user: ' + (error instanceof Error ? error.message : String(error)));
      console.log('   ❌ Error accessing current user:', error);
    }
  } else {
    result.messages.stateManager = false;
    result.errors.push('StateManager not found in module graph');
    console.log('   ❌ StateManager NOT found');
  }

  // 6. Check DOM Elements
  console.log('\n6. DOM Elements Check:');
  
  // Messages tab
  const messagesTab = document.querySelector('[data-tab="discuss-tab"]');
  if (messagesTab) {
    result.messages.tabExists = true;
    console.log('   ✅ Messages tab (discuss-tab) exists');
  } else {
    result.messages.tabExists = false;
    result.errors.push('Messages tab (discuss-tab) not found in DOM');
    console.log('   ❌ Messages tab (discuss-tab) NOT found');
  }

  // Messages content
  const messagesContent = document.getElementById('discuss-tab');
  if (messagesContent) {
    result.messages.contentExists = true;
    console.log('   ✅ Messages content (#discuss-tab) exists');
  } else {
    result.messages.contentExists = false;
    result.errors.push('Messages content (#discuss-tab) not found in DOM');
    console.log('   ❌ Messages content (#discuss-tab) NOT found');
  }

  // Visibility tab
  const visibilityTab = document.querySelector('[data-tab="visibility-tab"]');
  if (visibilityTab) {
    result.visibility.tabExists = true;
    console.log('   ✅ Visibility tab exists');
  } else {
    result.visibility.tabExists = false;
    result.errors.push('Visibility tab not found in DOM');
    console.log('   ❌ Visibility tab NOT found');
  }

  // Visibility content
  const visibilityContent = document.getElementById('visibility-tab');
  if (visibilityContent) {
    result.visibility.contentExists = true;
    console.log('   ✅ Visibility content exists');
  } else {
    result.visibility.contentExists = false;
    result.errors.push('Visibility content not found in DOM');
    console.log('   ❌ Visibility content NOT found');
  }

  // 7. Check Console Errors
  console.log('\n7. Console Errors:');
  console.log('   ⚠️ Check DevTools Console tab for any runtime errors');
  result.warnings.push('Manually check DevTools Console for runtime errors');

  // 8. Check Network Requests
  console.log('\n8. Network Requests:');
  console.log('   ⚠️ Check DevTools Network tab for:');
  console.log('   - /api/messages requests');
  console.log('   - /v1/users requests');
  console.log('   - Supabase realtime connections');
  result.warnings.push('Manually check DevTools Network tab for API requests');

  // Summary
  console.log('\n==============================================================');
  console.log('📋 SUMMARY');
  console.log('==============================================================');
  console.log(`Errors: ${result.errors.length}`);
  result.errors.forEach((error, i) => {
    console.log(`  ${i + 1}. ${error}`);
  });
  
  console.log(`\nWarnings: ${result.warnings.length}`);
  result.warnings.forEach((warning, i) => {
    console.log(`  ${i + 1}. ${warning}`);
  });

  // Generate recommendations
  if (!result.moduleGraph.exists) {
    result.recommendations.push('Module graph not initialized - check buildModuleGraph() execution and console for errors');
  }
  
  if (!result.messages.loadingService && !result.messages.loadChatHistory) {
    result.recommendations.push('Messages loading not available - check MessageLoadingService initialization in buildGraph.ts');
  }
  
  if (!result.visibility.manager) {
    result.recommendations.push('VisibilityManager not available - check VisibilityManager initialization in buildGraph.ts');
  }
  
  if (!result.messages.currentUser) {
    result.recommendations.push('Current user not set - check authentication flow and user initialization');
  }
  
  if (result.errors.length > 0) {
    result.recommendations.push('Fix errors above before testing functionality');
  } else if (result.warnings.length > 0) {
    result.recommendations.push('Review warnings - functionality may still work despite warnings');
    result.recommendations.push('Test messages and visibility features manually');
  } else {
    result.recommendations.push('All checks passed! Test messages and visibility features manually');
  }

  console.log(`\nRecommendations: ${result.recommendations.length}`);
  result.recommendations.forEach((rec, i) => {
    console.log(`  ${i + 1}. ${rec}`);
  });

  console.log('\n📋 Full Results:', JSON.stringify(result, null, 2));
  
  return result;
})();

