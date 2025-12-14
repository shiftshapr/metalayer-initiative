/**
 * DIAGNOSTIC: TypeScript Build Status & Reactive System Deployment Check
 *
 * Run this in browser console to verify:
 * 1. TypeScript build compilation success
 * 2. Reactive system modules are loaded
 * 3. Missing files have been restored
 * 4. Extension is running compiled code vs old code
 * 5. All 5 reactive systems are active
 */

(function() {
  console.log('🔍 TYPESCRIPT BUILD & REACTIVE SYSTEM DIAGNOSTIC');
  console.log('=================================================');

  const results = {
    buildSuccess: false,
    reactiveModulesLoaded: false,
    missingFilesRestored: false,
    compiledCodeActive: false,
    allSystemsActive: false
  };

  // 1. Check if TypeScript modules are loaded (vs old JS files)
  console.log('\n1. 📦 TYPESCRIPT MODULE LOADING:');
  try {
    // Check for TypeScript-compiled modules in window
    const tsModules = [
      'MessageLoadingService',
      'CommunitiesModule',
      'TabController',
      'ReactiveCoordinator'
    ];

    let loadedCount = 0;
    tsModules.forEach(moduleName => {
      if (window[moduleName] || window.__CANOPI_MODULE_GRAPH__?.[moduleName]) {
        console.log(`✅ ${moduleName} loaded`);
        loadedCount++;
      } else {
        console.log(`❌ ${moduleName} NOT found`);
      }
    });

    if (loadedCount >= 3) {
      console.log(`✅ ${loadedCount}/${tsModules.length} TypeScript modules loaded`);
      results.buildSuccess = true;
    } else {
      console.log(`❌ Only ${loadedCount}/${tsModules.length} TypeScript modules loaded`);
    }

  } catch (error) {
    console.log('❌ Error checking TypeScript modules:', error.message);
  }

  // 2. Check for missing files that were causing build failures
  console.log('\n2. 📁 MISSING FILES RESTORATION:');
  try {
    const missingFiles = [
      'UserHoverModal',
      'ConfigManager'
    ];

    let restoredCount = 0;
    missingFiles.forEach(fileName => {
      if (window[fileName] || window.__CANOPI_MODULE_GRAPH__?.[fileName]) {
        console.log(`✅ ${fileName} restored and loaded`);
        restoredCount++;
      } else {
        console.log(`❌ ${fileName} still missing`);
      }
    });

    if (restoredCount === missingFiles.length) {
      console.log(`✅ All ${missingFiles.length} missing files restored`);
      results.missingFilesRestored = true;
    } else {
      console.log(`❌ ${missingFiles.length - restoredCount} files still missing`);
    }

  } catch (error) {
    console.log('❌ Error checking missing files:', error.message);
  }

  // 3. Check if reactive system is active (from existing diagnostic)
  console.log('\n3. ⚡ REACTIVE SYSTEM STATUS:');
  try {
    const reactiveResults = {
      reactiveSystem: false,
      flowArchitecture: false,
      communitiesModule: false,
      tabController: false,
      messageLoadingService: false
    };

    // Check Reactive Coordination System
    const observers = window.__CANOPI_MODULE_GRAPH__?.reactiveCoordinator?._observers || [];
    const mutationObservers = Array.from(observers).filter(obs => obs instanceof MutationObserver);

    if (mutationObservers.length > 0) {
      console.log('✅ MutationObserver-based coordination ACTIVE');
      reactiveResults.reactiveSystem = true;
    } else {
      console.log('❌ NO MutationObserver found - reactive system NOT active');
    }

    // Check Flow Architecture (load/display separation)
    if (window.__CANOPI_MODULE_GRAPH__?.flowCoordinator) {
      console.log('✅ Flow architecture (load/display separation) ACTIVE');
      reactiveResults.flowArchitecture = true;
    } else {
      console.log('❌ Flow architecture NOT active');
    }

    // Check CommunitiesModule
    if (window.__CANOPI_MODULE_GRAPH__?.communitiesModule?.initialized) {
      console.log('✅ CommunitiesModule initialized and active');
      reactiveResults.communitiesModule = true;
    } else {
      console.log('❌ CommunitiesModule not initialized');
    }

    // Check TabController
    if (window.__CANOPI_MODULE_GRAPH__?.tabController?.active) {
      console.log('✅ TabController event-based coordination active');
      reactiveResults.tabController = true;
    } else {
      console.log('❌ TabController not active');
    }

    // Check MessageLoadingService
    if (window.__CANOPI_MODULE_GRAPH__?.messageLoadingService?.initialized) {
      console.log('✅ MessageLoadingService tab-aware loading active');
      reactiveResults.messageLoadingService = true;
    } else {
      console.log('❌ MessageLoadingService not active');
    }

    const activeCount = Object.values(reactiveResults).filter(Boolean).length;
    console.log(`\n🎯 OVERALL SCORE: ${activeCount}/5 systems active`);

    if (activeCount === 5) {
      results.allSystemsActive = true;
      console.log('✅ ALL SYSTEMS ACTIVE - Reactive system fully deployed!');
    } else {
      console.log('❌ INCOMPLETE - Some systems still inactive');
    }

  } catch (error) {
    console.log('❌ Error checking reactive system:', error.message);
  }

  // 4. Check if compiled code is active (vs development source)
  console.log('\n4. 🔧 COMPILED CODE VERIFICATION:');
  try {
    // Check for dist/ paths or compiled indicators
    const isCompiled = !window.location.href.includes('src/') &&
                      !window.__CANOPI_DEBUG_MODE__;

    if (isCompiled || window.__CANOPI_COMPILED__) {
      console.log('✅ Extension running compiled production code');
      results.compiledCodeActive = true;
    } else {
      console.log('⚠️  Extension may be running development source code');
      console.log('   (This is OK for testing, but production should use compiled code)');
    }

  } catch (error) {
    console.log('❌ Error checking compilation status:', error.message);
  }

  // Summary
  console.log('\n📊 DIAGNOSTIC SUMMARY:');
  console.log('====================');

  const summaryItems = [
    { name: 'Build Success', status: results.buildSuccess },
    { name: 'Missing Files Restored', status: results.missingFilesRestored },
    { name: 'Reactive Modules Loaded', status: results.reactiveModulesLoaded },
    { name: 'Compiled Code Active', status: results.compiledCodeActive },
    { name: 'All Systems Active (5/5)', status: results.allSystemsActive }
  ];

  summaryItems.forEach(item => {
    const icon = item.status ? '✅' : '❌';
    console.log(`${icon} ${item.name}`);
  });

  const passedCount = summaryItems.filter(item => item.status).length;
  console.log(`\n🎯 FINAL SCORE: ${passedCount}/${summaryItems.length} checks passed`);

  if (passedCount === summaryItems.length) {
    console.log('🎉 SUCCESS: TypeScript build fixed and reactive system fully deployed!');
  } else {
    console.log('⚠️  PARTIAL: Some issues remain - check logs above for details');
  }

  // Return results for programmatic access
  return results;
})();
