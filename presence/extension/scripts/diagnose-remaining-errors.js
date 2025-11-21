/**
 * REMAINING ERRORS DIAGNOSTIC SCRIPT
 * Run in browser console: window.runRemainingErrorsDiagnostic()
 * 
 * Checks:
 * 1. Logger.js export to window
 * 2. global.js references
 * 3. SIDEPANEL_INIT_FAILED root cause
 * 4. File loading issues
 */

window.runRemainingErrorsDiagnostic = async function() {
  const results = {
    timestamp: new Date().toISOString(),
    checks: {},
    errors: [],
    warnings: [],
    recommendations: []
  };

  console.log('🔍 REMAINING ERRORS DIAGNOSTIC: Starting comprehensive check...\n');

  // CHECK 1: Logger.js export
  console.log('1️⃣ Checking Logger.js export...');
  results.checks.logger = {
    fileExists: false,
    exportedToWindow: false,
    className: null
  };
  
  // Check if Logger class is available
  if (typeof window.Logger !== 'undefined') {
    results.checks.logger.exportedToWindow = true;
    results.checks.logger.className = window.Logger.name || 'Logger';
    console.log('   ✅ Logger exported to window');
    console.log('   📋 Class name:', results.checks.logger.className);
  } else {
    results.errors.push('Logger not exported to window');
    console.log('   ❌ Logger NOT exported to window');
    
    // Check if Logger is available as a module
    try {
      const LoggerModule = await import('../utils/Logger.js');
      if (LoggerModule && (LoggerModule.Logger || LoggerModule.default)) {
        results.checks.logger.fileExists = true;
        console.log('   ⚠️ Logger exists as module but not on window');
        results.warnings.push('Logger exists as module but not exported to window');
      }
    } catch (error) {
      results.errors.push(`Logger module import failed: ${error.message}`);
      console.log('   ❌ Logger module import failed:', error.message);
    }
  }

  // CHECK 2: global.js references
  console.log('\n2️⃣ Checking global.js references...');
  results.checks.globalJs = {
    fileExists: false,
    references: [],
    invalidImports: []
  };
  
  // Check if global.js file exists (it shouldn't - it's a phantom error)
  try {
    const response = await fetch('global.js');
    if (response.ok) {
      results.checks.globalJs.fileExists = true;
      console.log('   ⚠️ global.js file exists (unexpected)');
    } else {
      console.log('   ✅ global.js file does not exist (expected - phantom error)');
    }
  } catch (error) {
    console.log('   ✅ global.js file does not exist (expected - phantom error)');
  }
  
  // Check for window.global
  if (typeof window.global !== 'undefined') {
    results.warnings.push('window.global is defined (may be from Node.js polyfill)');
    console.log('   ⚠️ window.global is defined');
  } else {
    console.log('   ✅ window.global not defined (expected)');
  }

  // CHECK 3: SIDEPANEL_INIT_FAILED
  console.log('\n3️⃣ Checking SIDEPANEL_INIT_FAILED...');
  results.checks.sidepanelInit = {
    ready: false,
    error: null,
    tabController: false,
    bootController: false
  };
  
  // Check if sidepanel is ready
  if (window.__CANOPI_SIDEPANEL_READY__ === true) {
    results.checks.sidepanelInit.ready = true;
    console.log('   ✅ Sidepanel initialized successfully');
  } else {
    results.warnings.push('Sidepanel not marked as ready');
    console.log('   ⚠️ Sidepanel not marked as ready');
  }
  
  // Check for tabController
  if (window.tabController || window.TabController) {
    results.checks.sidepanelInit.tabController = true;
    console.log('   ✅ TabController available');
  } else {
    results.warnings.push('TabController not available');
    console.log('   ⚠️ TabController not available');
  }
  
  // Check for bootController
  if (window.bootController || window.BootController) {
    results.checks.sidepanelInit.bootController = true;
    console.log('   ✅ BootController available');
  } else {
    results.warnings.push('BootController not available');
    console.log('   ⚠️ BootController not available');
  }

  // CHECK 4: File loading errors
  console.log('\n4️⃣ Checking file loading...');
  results.checks.fileLoading = {
    loggerJs: false,
    globalJs: false,
    errors: []
  };
  
  // Check console for file loading errors
  const consoleErrors = [];
  const originalError = console.error;
  console.error = function(...args) {
    consoleErrors.push(args.join(' '));
    originalError.apply(console, args);
  };
  
  // Wait a bit for errors to accumulate
  await new Promise(resolve => setTimeout(resolve, 100));
  
  console.error = originalError;
  
  const fileErrors = consoleErrors.filter(err => 
    err.includes('Failed to load resource') || 
    err.includes('ERR_FILE_NOT_FOUND') ||
    err.includes('.js:1')
  );
  
  if (fileErrors.length > 0) {
    results.checks.fileLoading.errors = fileErrors;
    console.log('   ⚠️ File loading errors found:', fileErrors.length);
    fileErrors.forEach((err, i) => {
      console.log(`   ${i + 1}. ${err}`);
    });
  } else {
    console.log('   ✅ No file loading errors detected');
  }

  // Generate recommendations
  console.log('\n📋 RECOMMENDATIONS:');
  
  if (!results.checks.logger.exportedToWindow) {
    results.recommendations.push('Export Logger to window in Logger.ts: window.Logger = Logger');
  }
  
  if (results.checks.globalJs.fileExists) {
    results.recommendations.push('Remove global.js file if not needed');
  } else {
    results.recommendations.push('global.js error is phantom - check browser cache');
  }
  
  if (!results.checks.sidepanelInit.ready) {
    results.recommendations.push('Investigate SIDEPANEL_INIT_FAILED - check BootController initialization');
  }
  
  if (results.checks.fileLoading.errors.length > 0) {
    results.recommendations.push('Fix file loading errors - check script tags in sidepanel.html');
  }
  
  results.recommendations.forEach((rec, i) => {
    console.log(`   ${i + 1}. ${rec}`);
  });

  // Summary
  console.log('\n📊 SUMMARY:');
  console.log(`   ✅ Passed: ${Object.values(results.checks).filter(c => c && (c.exportedToWindow || c.ready || !c.errors || c.errors.length === 0)).length}`);
  console.log(`   ⚠️ Warnings: ${results.warnings.length}`);
  console.log(`   ❌ Errors: ${results.errors.length}`);
  
  if (results.errors.length > 0) {
    console.log('\n❌ ERRORS:');
    results.errors.forEach((err, i) => console.log(`   ${i + 1}. ${err}`));
  }
  
  if (results.warnings.length > 0) {
    console.log('\n⚠️ WARNINGS:');
    results.warnings.forEach((warn, i) => console.log(`   ${i + 1}. ${warn}`));
  }

  // Store results
  window.remainingErrorsDiagnosticResults = results;
  console.log('\n✅ Diagnostic complete! Results stored in window.remainingErrorsDiagnosticResults');
  
  return results;
};

console.log('✅ Remaining errors diagnostic script loaded! Run: window.runRemainingErrorsDiagnostic()');




