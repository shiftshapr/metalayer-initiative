/**
 * Diagnostic Script: Messages and Visibility Not Working
 * 
 * Diagnoses why messages and visibility features are not working after TypeScript migration.
 * 
 * Usage: Copy and paste into browser console
 */

(function() {
  console.log('🔍 DIAGNOSTIC: Messages and Visibility Not Working');
  console.log('==================================================\n');

  const result = {
    timestamp: new Date().toISOString(),
    moduleGraph: {},
    messagesModule: {},
    visibilityManager: {},
    errors: [],
    warnings: [],
    recommendations: []
  };

  if (typeof window === 'undefined') {
    console.log('❌ Window not available');
    return result;
  }

  const win = window;

  // Check module graph
  console.log('1. Module Graph Check:');
  if (win.__CANOPI_MODULE_GRAPH__) {
    result.moduleGraph.exists = true;
    result.moduleGraph.keys = Object.keys(win.__CANOPI_MODULE_GRAPH__);
    console.log('   ✅ Module graph exists');
    console.log('   Keys:', result.moduleGraph.keys);
    
    // Check for MessagesModule
    if (win.__CANOPI_MODULE_GRAPH__.messagesModule) {
      result.messagesModule.exists = true;
      console.log('   ✅ MessagesModule found in module graph');
    } else {
      result.messagesModule.exists = false;
      result.errors.push('MessagesModule not found in module graph');
      console.log('   ❌ MessagesModule NOT found in module graph');
    }
    
    // Check for VisibilityManager
    if (win.__CANOPI_MODULE_GRAPH__.visibilityManager) {
      result.visibilityManager.exists = true;
      console.log('   ✅ VisibilityManager found in module graph');
      
      // Check if initialized
      if (typeof win.__CANOPI_MODULE_GRAPH__.visibilityManager.initialize === 'function') {
        result.visibilityManager.hasInitialize = true;
        console.log('   ✅ VisibilityManager has initialize method');
      } else {
        result.visibilityManager.hasInitialize = false;
        result.warnings.push('VisibilityManager missing initialize method');
        console.log('   ⚠️ VisibilityManager missing initialize method');
      }
    } else {
      result.visibilityManager.exists = false;
      result.errors.push('VisibilityManager not found in module graph');
      console.log('   ❌ VisibilityManager NOT found in module graph');
    }
  } else {
    result.moduleGraph.exists = false;
    result.errors.push('Module graph not found - buildModuleGraph may have failed');
    console.log('   ❌ Module graph NOT found');
  }

  // Check loadChatHistory
  console.log('\n2. Messages Module Check:');
  if (typeof win.loadChatHistory === 'function') {
    result.messagesModule.loadChatHistory = true;
    console.log('   ✅ loadChatHistory function exists');
  } else {
    result.messagesModule.loadChatHistory = false;
    result.errors.push('loadChatHistory function not found on window');
    console.log('   ❌ loadChatHistory function NOT found');
  }

  // Check initializeMessagesModule
  if (typeof win.initializeMessagesModule === 'function') {
    result.messagesModule.initializeMessagesModule = true;
    console.log('   ✅ initializeMessagesModule function exists');
  } else {
    result.messagesModule.initializeMessagesModule = false;
    result.warnings.push('initializeMessagesModule function not found on window');
    console.log('   ⚠️ initializeMessagesModule function NOT found (may be called automatically)');
  }

  // Check console errors
  console.log('\n3. Console Errors Check:');
  // Note: This won't capture all errors, but we can check for common patterns
  const errorCount = console.error ? 'Check DevTools Console tab for errors' : 'Unknown';
  console.log('   Error count:', errorCount);
  result.errors.push('Check DevTools Console tab for runtime errors');

  // Check network requests
  console.log('\n4. Network Requests Check:');
  console.log('   Check DevTools Network tab for:');
  console.log('   - /api/messages requests');
  console.log('   - /v1/users requests');
  console.log('   - Supabase realtime connections');
  result.warnings.push('Check DevTools Network tab for failed API requests');

  // Check sidepanel ready state
  console.log('\n5. Sidepanel Ready State:');
  if (win.__CANOPI_SIDEPANEL_READY__) {
    result.moduleGraph.sidepanelReady = true;
    console.log('   ✅ Sidepanel marked as ready');
  } else {
    result.moduleGraph.sidepanelReady = false;
    result.errors.push('Sidepanel not marked as ready - initialization may have failed');
    console.log('   ❌ Sidepanel NOT marked as ready');
  }

  // Recommendations
  console.log('\n==================================================');
  console.log('📋 SUMMARY');
  console.log('==================================================');
  console.log(`Errors Found: ${result.errors.length}`);
  result.errors.forEach((error, i) => {
    console.log(`  ${i + 1}. ${error}`);
  });
  
  console.log(`\nWarnings: ${result.warnings.length}`);
  result.warnings.forEach((warning, i) => {
    console.log(`  ${i + 1}. ${warning}`);
  });

  // Generate recommendations
  if (!result.moduleGraph.exists) {
    result.recommendations.push('Module graph not initialized - check buildModuleGraph() execution');
    result.recommendations.push('Check console for buildModuleGraph errors');
  }
  
  if (!result.messagesModule.exists && !result.messagesModule.loadChatHistory) {
    result.recommendations.push('MessagesModule not available - check MessagesModule.ts exports');
    result.recommendations.push('Verify loadChatHistory is exported from MessagesModule.ts');
  }
  
  if (!result.visibilityManager.exists) {
    result.recommendations.push('VisibilityManager not available - check buildGraph.ts initialization');
    result.recommendations.push('Verify VisibilityManager is created and added to module graph');
  }
  
  if (!result.moduleGraph.sidepanelReady) {
    result.recommendations.push('Sidepanel initialization incomplete - check BootController.initialize()');
    result.recommendations.push('Check for errors in Sidepanel.ts bootstrap');
  }

  console.log(`\nRecommendations: ${result.recommendations.length}`);
  result.recommendations.forEach((rec, i) => {
    console.log(`  ${i + 1}. ${rec}`);
  });

  console.log('\n📋 Full Results:', JSON.stringify(result, null, 2));
  
  return result;
})();

