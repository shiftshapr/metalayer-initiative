/**
 * TypeScript Migration Audit Script
 * 
 * Comprehensive audit of TypeScript migration status, issues, and completeness.
 * 
 * Usage: Copy and paste into browser console after extension loads
 */

(function() {
  console.log('🔍 TYPESCRIPT MIGRATION AUDIT');
  console.log('================================\n');

  const audit = {
    timestamp: new Date().toISOString(),
    build: {},
    moduleSystem: {},
    typeSafety: {},
    runtime: {},
    issues: [],
    warnings: [],
    recommendations: []
  };

  if (typeof window === 'undefined') {
    console.log('❌ Window not available');
    return audit;
  }

  const win = window;

  // 1. Build Status
  console.log('1. Build Status:');
  const buildInfo = win.__CANOPI_BUILD_INFO__ || null;
  if (buildInfo) {
    audit.build.info = buildInfo;
    console.log('   ✅ Build info:', buildInfo);
  } else {
    audit.build.info = null;
    audit.warnings.push('Build info not available');
    console.log('   ⚠️ Build info not available');
  }

  // 2. Module System Check
  console.log('\n2. Module System:');
  
  // Check ES6 modules
  if (win.__CANOPI_MODULE_GRAPH__) {
    audit.moduleSystem.graphExists = true;
    const graph = win.__CANOPI_MODULE_GRAPH__;
    audit.moduleSystem.modules = Object.keys(graph);
    console.log('   ✅ Module graph exists');
    console.log('   Modules:', audit.moduleSystem.modules.length);
    
    // Check for CommonJS patterns (shouldn't exist)
    const hasCommonJS = audit.moduleSystem.modules.some(key => {
      const mod = graph[key];
      return mod && (typeof mod === 'object' && ('exports' in mod || 'require' in mod));
    });
    
    if (hasCommonJS) {
      audit.issues.push('CommonJS patterns detected in module graph');
      console.log('   ❌ CommonJS patterns detected');
    } else {
      audit.moduleSystem.es6Only = true;
      console.log('   ✅ ES6 modules only (no CommonJS)');
    }
  } else {
    audit.moduleSystem.graphExists = false;
    audit.issues.push('Module graph not found');
    console.log('   ❌ Module graph not found');
  }

  // Check window globals (should be minimal)
  const windowGlobals = Object.keys(win).filter(key => 
    key.startsWith('__CANOPI_') || 
    key === 'loadChatHistory' || 
    key === 'initializeMessagesModule' ||
    key === 'currentUser' ||
    key === 'getCurrentUserEmail'
  );
  
  audit.moduleSystem.windowGlobals = windowGlobals.length;
  if (windowGlobals.length > 10) {
    audit.warnings.push(`Many window globals detected (${windowGlobals.length}) - may indicate incomplete migration`);
    console.log(`   ⚠️ ${windowGlobals.length} window globals detected`);
  } else {
    console.log(`   ✅ Minimal window globals (${windowGlobals.length})`);
  }

  // 3. Type Safety Check
  console.log('\n3. Type Safety:');
  
  // Check for 'any' types in runtime (can't detect, but check for type errors)
  audit.typeSafety.runtimeTypeErrors = [];
  
  // Check module graph types
  if (win.__CANOPI_MODULE_GRAPH__) {
    const graph = win.__CANOPI_MODULE_GRAPH__;
    
    // Check if modules have proper structure
    const requiredModules = ['stateManager', 'visibilityManager', 'messageLoadingService'];
    const missingModules = requiredModules.filter(key => !graph[key]);
    
    if (missingModules.length > 0) {
      audit.issues.push(`Missing required modules: ${missingModules.join(', ')}`);
      console.log(`   ❌ Missing modules: ${missingModules.join(', ')}`);
    } else {
      audit.typeSafety.modulesTyped = true;
      console.log('   ✅ Required modules present');
    }
    
    // Check method signatures
    if (graph.stateManager) {
      const hasGetState = typeof graph.stateManager.getState === 'function';
      const hasSetState = typeof graph.stateManager.setState === 'function';
      
      if (hasGetState && hasSetState) {
        audit.typeSafety.stateManagerTyped = true;
        console.log('   ✅ StateManager properly typed');
      } else {
        audit.issues.push('StateManager missing required methods');
        console.log('   ❌ StateManager missing methods');
      }
    }
    
    if (graph.visibilityManager) {
      const hasRefresh = typeof graph.visibilityManager.refreshVisibilityAvatars === 'function';
      const hasInitialize = typeof graph.visibilityManager.initialize === 'function';
      
      if (hasRefresh && hasInitialize) {
        audit.typeSafety.visibilityManagerTyped = true;
        console.log('   ✅ VisibilityManager properly typed');
      } else {
        audit.issues.push('VisibilityManager missing required methods');
        console.log('   ❌ VisibilityManager missing methods');
      }
    }
    
    if (graph.messageLoadingService) {
      const hasLoadMessages = typeof graph.messageLoadingService.loadMessages === 'function';
      
      if (hasLoadMessages) {
        audit.typeSafety.messageLoadingServiceTyped = true;
        console.log('   ✅ MessageLoadingService properly typed');
      } else {
        audit.issues.push('MessageLoadingService missing loadMessages method');
        console.log('   ❌ MessageLoadingService missing method');
      }
    }
  }

  // 4. Runtime Functionality
  console.log('\n4. Runtime Functionality:');
  
  // Check if modules are actually working
  if (win.__CANOPI_MODULE_GRAPH__) {
    const graph = win.__CANOPI_MODULE_GRAPH__;
    
    // Test StateManager
    try {
      const testState = graph.stateManager?.getState('currentUser');
      if (testState !== undefined) {
        audit.runtime.stateManagerWorking = true;
        console.log('   ✅ StateManager working');
      } else {
        audit.runtime.stateManagerWorking = false;
        audit.warnings.push('StateManager getState returned undefined');
        console.log('   ⚠️ StateManager may not be working');
      }
    } catch (error) {
      audit.runtime.stateManagerWorking = false;
      audit.issues.push('StateManager error: ' + (error instanceof Error ? error.message : String(error)));
      console.log('   ❌ StateManager error:', error);
    }
    
    // Test VisibilityManager
    if (graph.visibilityManager) {
      const status = graph.visibilityManager.getStatus?.();
      if (status && typeof status === 'object') {
        audit.runtime.visibilityManagerWorking = true;
        console.log('   ✅ VisibilityManager working');
      } else {
        audit.runtime.visibilityManagerWorking = false;
        audit.warnings.push('VisibilityManager getStatus not working');
        console.log('   ⚠️ VisibilityManager may not be working');
      }
    }
    
    // Test MessageLoadingService
    if (graph.messageLoadingService) {
      const hasMethod = typeof graph.messageLoadingService.loadMessages === 'function';
      if (hasMethod) {
        audit.runtime.messageLoadingServiceWorking = true;
        console.log('   ✅ MessageLoadingService available');
      } else {
        audit.runtime.messageLoadingServiceWorking = false;
        audit.issues.push('MessageLoadingService.loadMessages not a function');
        console.log('   ❌ MessageLoadingService not working');
      }
    }
  }

  // 5. Migration Completeness
  console.log('\n5. Migration Completeness:');
  
  // Check for legacy patterns
  const legacyPatterns = {
    require: typeof require !== 'undefined',
    module: typeof module !== 'undefined' && typeof module.exports !== 'undefined',
    exports: typeof exports !== 'undefined',
    define: typeof define !== 'undefined' && typeof define.amd !== 'undefined'
  };
  
  const legacyCount = Object.values(legacyPatterns).filter(Boolean).length;
  audit.moduleSystem.legacyPatterns = legacyCount;
  
  if (legacyCount > 0) {
    audit.warnings.push(`Legacy module patterns detected: ${Object.keys(legacyPatterns).filter(k => legacyPatterns[k]).join(', ')}`);
    console.log(`   ⚠️ ${legacyCount} legacy patterns detected`);
  } else {
    audit.moduleSystem.legacyFree = true;
    console.log('   ✅ No legacy module patterns');
  }

  // 6. Error Handling
  console.log('\n6. Error Handling:');
  
  // Check if error handling is in place
  if (win.__CANOPI_MODULE_GRAPH__?.logger) {
    audit.runtime.loggerAvailable = true;
    console.log('   ✅ Logger available');
  } else {
    audit.runtime.loggerAvailable = false;
    audit.warnings.push('Logger not available in module graph');
    console.log('   ⚠️ Logger not available');
  }

  // 7. Sidepanel Ready State
  console.log('\n7. Initialization State:');
  
  if (win.__CANOPI_SIDEPANEL_READY__) {
    audit.runtime.sidepanelReady = true;
    console.log('   ✅ Sidepanel initialized');
  } else {
    audit.runtime.sidepanelReady = false;
    audit.issues.push('Sidepanel not marked as ready');
    console.log('   ❌ Sidepanel not ready');
  }

  // Summary
  console.log('\n================================');
  console.log('📋 AUDIT SUMMARY');
  console.log('================================');
  console.log(`Issues: ${audit.issues.length}`);
  audit.issues.forEach((issue, i) => {
    console.log(`  ${i + 1}. ${issue}`);
  });
  
  console.log(`\nWarnings: ${audit.warnings.length}`);
  audit.warnings.forEach((warning, i) => {
    console.log(`  ${i + 1}. ${warning}`);
  });

  // Generate recommendations
  if (audit.issues.length > 0) {
    audit.recommendations.push('Fix critical issues before proceeding');
  }
  
  if (audit.moduleSystem.windowGlobals > 10) {
    audit.recommendations.push('Reduce window globals - migrate to module graph');
  }
  
  if (audit.moduleSystem.legacyPatterns > 0) {
    audit.recommendations.push('Remove legacy module patterns (CommonJS/AMD)');
  }
  
  if (!audit.runtime.sidepanelReady) {
    audit.recommendations.push('Investigate sidepanel initialization failure');
  }
  
  if (audit.issues.length === 0 && audit.warnings.length === 0) {
    audit.recommendations.push('✅ Migration appears complete - all checks passed!');
  } else if (audit.issues.length === 0) {
    audit.recommendations.push('Migration mostly complete - review warnings');
  } else {
    audit.recommendations.push('Migration incomplete - fix issues above');
  }

  console.log(`\nRecommendations: ${audit.recommendations.length}`);
  audit.recommendations.forEach((rec, i) => {
    console.log(`  ${i + 1}. ${rec}`);
  });

  // Migration Score
  const totalChecks = 15;
  const passedChecks = totalChecks - audit.issues.length - (audit.warnings.length * 0.5);
  const migrationScore = Math.round((passedChecks / totalChecks) * 100);
  
  audit.migrationScore = migrationScore;
  console.log(`\n📊 Migration Score: ${migrationScore}%`);
  
  if (migrationScore >= 90) {
    console.log('   ✅ Excellent - Migration nearly complete');
  } else if (migrationScore >= 75) {
    console.log('   ⚠️ Good - Some issues to address');
  } else if (migrationScore >= 50) {
    console.log('   ⚠️ Fair - Significant issues remain');
  } else {
    console.log('   ❌ Poor - Major migration issues');
  }

  console.log('\n📋 Full Audit Results:', JSON.stringify(audit, null, 2));
  
  return audit;
})();

