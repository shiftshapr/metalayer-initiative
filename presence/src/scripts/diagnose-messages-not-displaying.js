/**
 * Diagnostic Script: Messages Not Displaying
 * 
 * PURPOSE: Diagnose why messages are not displaying in the Canopi extension sidepanel
 * 
 * USAGE: Copy this entire script and paste into browser console on a page with Canopi extension loaded
 * 
 * OUTPUT: Console logs with diagnostic results, issues found, and recommendations
 * 
 * CRITICAL: This is pure JavaScript - NO TypeScript syntax, NO imports/exports
 */

(async function() {
  'use strict';
  
  console.log('🔍 DIAGNOSTIC: Messages Not Displaying');
  console.log('==============================================================');
  
  const results = {
    timestamp: new Date().toISOString(),
    checks: {},
    issues: [],
    recommendations: []
  };
  
  // Check 1: Chat container exists
  console.log('\n📋 Check 1: Chat Messages Container');
  const chatContainer = document.querySelector('.chat-messages');
  const chatContainerById = document.getElementById('chat-messages');
  const chatContainerByData = document.querySelector('[data-chat-messages]');
  
  console.log(`  .chat-messages found: ${!!chatContainer}`);
  console.log(`  #chat-messages found: ${!!chatContainerById}`);
  console.log(`  [data-chat-messages] found: ${!!chatContainerByData}`);
  
  const activeContainer = chatContainer || chatContainerById || chatContainerByData;
  
  if (!activeContainer) {
    results.issues.push('Chat messages container (.chat-messages) not found in DOM');
  } else {
    const computed = window.getComputedStyle(activeContainer);
    const containerInfo = {
      exists: true,
      visible: computed.display !== 'none' && computed.visibility !== 'hidden',
      display: computed.display,
      visibility: computed.visibility,
      height: computed.height,
      minHeight: computed.minHeight,
      childCount: activeContainer.children.length,
      hasMessages: activeContainer.querySelectorAll('.message, [data-message-id]').length > 0
    };
    console.log('  Container info:', containerInfo);
    results.checks.container = containerInfo;
    
    if (!containerInfo.visible) {
      results.issues.push('Chat container exists but is not visible');
    }
    if (containerInfo.childCount === 0) {
      results.issues.push('Chat container has no child elements');
    }
    if (!containerInfo.hasMessages) {
      results.issues.push('Chat container has no message elements');
    }
  }
  
  // Check 2: loadChatHistory function availability
  console.log('\n📋 Check 2: loadChatHistory Function');
  const loadChatHistory = window.loadChatHistory;
  const hasLoadChatHistory = typeof loadChatHistory === 'function';
  
  console.log(`  loadChatHistory available: ${hasLoadChatHistory}`);
  console.log(`  loadChatHistory type: ${typeof loadChatHistory}`);
  
  results.checks.loadChatHistory = {
    available: hasLoadChatHistory,
    type: typeof loadChatHistory
  };
  
  if (!hasLoadChatHistory) {
    results.issues.push('loadChatHistory function not available on window');
  }
  
  // Check 3: Message system initialization
  console.log('\n📋 Check 3: Message System Initialization');
  const messageSystemIntegration = window.messageSystemIntegration;
  const unifiedMessageDisplay = window.unifiedMessageDisplay;
  const messageLoader = window.messageLoaderInstance;
  
  const systemInfo = {
    messageSystemIntegration: !!messageSystemIntegration,
    unifiedMessageDisplay: !!unifiedMessageDisplay,
    messageLoader: !!messageLoader
  };
  
  console.log('  Message system components:', systemInfo);
  results.checks.messageSystem = systemInfo;
  
  if (!messageSystemIntegration) {
    results.issues.push('messageSystemIntegration not initialized');
  }
  if (!unifiedMessageDisplay) {
    results.issues.push('unifiedMessageDisplay not initialized');
  }
  
  // Check 4: StateManager and chat data
  console.log('\n📋 Check 4: StateManager and Chat Data');
  const stateManager = window.stateManager;
  let chatData = null;
  let currentUrlData = null;
  let activeTab = null;
  
  if (stateManager) {
    try {
      if (typeof stateManager.getState === 'function') {
        chatData = stateManager.getState('chat.data');
        currentUrlData = stateManager.getState('currentUrlData');
        activeTab = stateManager.getState('ui.activeTab');
      }
    } catch (error) {
      console.error('  Error accessing state:', error);
      results.issues.push('Error accessing StateManager state: ' + error.message);
    }
  } else {
    results.issues.push('StateManager not available on window');
  }
  
  const stateInfo = {
    stateManagerAvailable: !!stateManager,
    chatDataCount: Array.isArray(chatData) ? chatData.length : 0,
    chatDataIsArray: Array.isArray(chatData),
    currentUrlData: currentUrlData,
    activeTab: activeTab
  };
  
  console.log('  State info:', stateInfo);
  results.checks.state = stateInfo;
  
  if (!Array.isArray(chatData)) {
    results.issues.push('chat.data in state is not an array');
  } else if (chatData.length === 0) {
    results.issues.push('chat.data in state is empty (no messages loaded)');
  }
  
  // Check 5: Active tab
  console.log('\n📋 Check 5: Active Tab');
  const discussTab = document.getElementById('discuss-tab');
  const visibilityTab = document.getElementById('visibility-tab');
  const manageTab = document.getElementById('manage-tab');
  
  const discussTabActive = discussTab && discussTab.classList.contains('active');
  const visibilityTabActive = visibilityTab && visibilityTab.classList.contains('active');
  
  const tabInfo = {
    discussTabExists: !!discussTab,
    discussTabActive: discussTabActive,
    visibilityTabExists: !!visibilityTab,
    visibilityTabActive: visibilityTabActive,
    manageTabExists: !!manageTab
  };
  
  console.log('  Tab info:', tabInfo);
  results.checks.tabs = tabInfo;
  
  if (!discussTabActive && visibilityTabActive) {
    results.issues.push('Visibility tab is active - messages will not load (only loads on discuss-tab)');
  }
  if (!discussTab && !visibilityTab && !manageTab) {
    results.issues.push('No tab elements found in DOM');
  }
  
  // Check 6: Messages in DOM
  console.log('\n📋 Check 6: Messages in DOM');
  const messageElements = document.querySelectorAll('.message, [data-message-id]');
  const messageElementsInContainer = activeContainer 
    ? activeContainer.querySelectorAll('.message, [data-message-id]')
    : [];
  
  const domInfo = {
    totalMessageElements: messageElements.length,
    messageElementsInContainer: messageElementsInContainer.length,
    messageElementsOutsideContainer: messageElements.length - messageElementsInContainer.length
  };
  
  console.log('  DOM message info:', domInfo);
  results.checks.domMessages = domInfo;
  
  if (domInfo.totalMessageElements === 0) {
    results.issues.push('No message elements found in DOM');
  } else if (domInfo.messageElementsInContainer === 0 && domInfo.totalMessageElements > 0) {
    results.issues.push('Message elements exist but not in chat container');
  }
  
  // Check 7: UnifiedMessageRenderer
  console.log('\n📋 Check 7: UnifiedMessageRenderer');
  const unifiedMessageRenderer = window.UnifiedMessageRenderer;
  const hasRenderer = !!unifiedMessageRenderer;
  const hasRenderMethod = hasRenderer && typeof unifiedMessageRenderer.renderMessage === 'function';
  const hasGenerateMethod = hasRenderer && typeof unifiedMessageRenderer.generateMessageHTML === 'function';
  
  const rendererInfo = {
    available: hasRenderer,
    hasRenderMethod: hasRenderMethod,
    hasGenerateMethod: hasGenerateMethod
  };
  
  console.log('  Renderer info:', rendererInfo);
  results.checks.renderer = rendererInfo;
  
  if (!hasRenderer) {
    results.issues.push('UnifiedMessageRenderer not available on window');
  } else if (!hasRenderMethod) {
    results.issues.push('UnifiedMessageRenderer.renderMessage method not available');
  }
  
  // Check 8: API availability
  console.log('\n📋 Check 8: API Module');
  const api = window.api;
  const hasApi = !!api;
  const hasGetMethod = hasApi && typeof api.get === 'function';
  
  const apiInfo = {
    available: hasApi,
    hasGetMethod: hasGetMethod
  };
  
  console.log('  API info:', apiInfo);
  results.checks.api = apiInfo;
  
  if (!hasApi) {
    results.issues.push('API module not available on window');
  }
  
  // Check 9: Console errors (check recent errors)
  console.log('\n📋 Check 9: Recent Console Errors');
  // Note: We can't directly access console history, but we can check for error indicators
  const errorIndicators = document.querySelectorAll('[class*="error"], [id*="error"]');
  console.log(`  Error indicator elements found: ${errorIndicators.length}`);
  results.checks.errorIndicators = errorIndicators.length;
  
  // Check 10: MessageLoadingService
  console.log('\n📋 Check 10: MessageLoadingService');
  const messageLoadingService = window.messageLoadingService;
  const hasService = !!messageLoadingService;
  const hasLoadMethod = hasService && typeof messageLoadingService.loadMessages === 'function';
  
  const serviceInfo = {
    available: hasService,
    hasLoadMethod: hasLoadMethod
  };
  
  console.log('  Service info:', serviceInfo);
  results.checks.messageLoadingService = serviceInfo;
  
  // Summary
  console.log('\n📊 DIAGNOSTIC SUMMARY');
  console.log('====================');
  console.log(`Issues found: ${results.issues.length}`);
  results.issues.forEach((issue, idx) => {
    console.log(`  ${idx + 1}. ${issue}`);
  });
  
  console.log('\n💡 Recommendations:');
  if (results.issues.length > 0) {
    if (results.issues.some(i => i.includes('container'))) {
      results.recommendations.push('Check HTML structure - ensure .chat-messages container exists');
      results.recommendations.push('Verify container is visible (not display:none or visibility:hidden)');
    }
    if (results.issues.some(i => i.includes('loadChatHistory'))) {
      results.recommendations.push('Check MessagesModule.ts - ensure loadChatHistory is exported to window');
      results.recommendations.push('Verify MessagesModule is loaded before calling loadChatHistory');
    }
    if (results.issues.some(i => i.includes('message system'))) {
      results.recommendations.push('Check initializeNewMessageSystem() - ensure it completes successfully');
      results.recommendations.push('Verify messageSystemIntegration and unifiedMessageDisplay are initialized');
    }
    if (results.issues.some(i => i.includes('chat.data') || i.includes('empty'))) {
      results.recommendations.push('Check API calls - verify messages are being fetched from backend');
      results.recommendations.push('Check loadChatHistory - verify it calls messageSystemIntegration.loadDefaultView');
      results.recommendations.push('Verify messages are being stored in stateManager chat.data');
    }
    if (results.issues.some(i => i.includes('tab'))) {
      results.recommendations.push('Ensure discuss-tab is active before loading messages');
      results.recommendations.push('Check TabController - verify tab switching works correctly');
    }
    if (results.issues.some(i => i.includes('render'))) {
      results.recommendations.push('Check UnifiedMessageRenderer - verify renderMessage method works');
      results.recommendations.push('Check unifiedMessageDisplay.render() - verify it appends to container');
    }
  } else {
    results.recommendations.push('No obvious issues found - check network requests and API responses');
    results.recommendations.push('Check browser console for runtime errors');
    results.recommendations.push('Verify backend API is returning messages');
  }
  
  results.recommendations.forEach((rec, idx) => {
    console.log(`  ${idx + 1}. ${rec}`);
  });
  
  console.log('\n📋 Full Results Object:');
  console.log(JSON.stringify(results, null, 2));
  
  return results;
})();





