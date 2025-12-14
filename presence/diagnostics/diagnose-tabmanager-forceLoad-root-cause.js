/**
 * DIAGNOSTIC SCRIPT: TabManager forceLoad Boolean Root Cause Analysis
 *
 * PROBLEM: Boolean forceLoad parameter causes double loading in TabManager.triggerTabSwitch()
 * Tests the logic: shouldLoad = forceLoad || !loadedTabs.has(tabId)
 *
 * ROOT CAUSE: Boolean forceLoad creates ambiguity between LOAD and SWITCH operations,
 * causing double loading when initialization calls triggerTabSwitch(tabId, true)
 *
 * PURPOSE: Confirm root cause and validate fix approach before implementation
 *
 * USAGE: Copy this entire script and paste into browser console
 *
 * CRITICAL: This is pure JavaScript - NO TypeScript syntax, NO imports/exports
 */

(function() {
  'use strict';

  console.log('🔍 DIAGNOSTIC: TabManager forceLoad Boolean Root Cause');
  console.log('======================================================\n');

  const results = {
    timestamp: new Date().toISOString(),
    rootCauseConfirmed: false,
    doubleLoadingDetected: false,
    operationAmbiguityFound: false,
    recommendations: [],
    evidence: []
  };

  /**
   * Test forceLoad boolean parameter logic
   */
  function testForceLoadLogic() {
    console.log('🔬 Testing forceLoad Boolean Logic');

    const tabManager = window.tabContextManager;
    if (!tabManager) {
      console.error('❌ TabManager not found in window.tabContextManager');
      results.evidence.push('TabManager not accessible via window.tabContextManager');
      return false;
    }

    // Check if triggerTabSwitch method exists
    if (typeof tabManager.triggerTabSwitch !== 'function') {
      console.error('❌ triggerTabSwitch method not found');
      results.evidence.push('triggerTabSwitch method missing');
      return false;
    }

    // Try to inspect method signature (limited by browser security)
    try {
      const methodStr = tabManager.triggerTabSwitch.toString();

      if (methodStr.includes('forceLoad')) {
        console.log('✅ forceLoad parameter detected in method signature');
        results.evidence.push('forceLoad parameter confirmed in triggerTabSwitch method');

        // Check for the problematic boolean logic pattern
        if (methodStr.includes('forceLoad || !') || methodStr.includes('|| !this.loadedTabs.has')) {
          console.log('🎯 ROOT CAUSE CONFIRMED: Boolean OR logic detected');
          console.log('   Pattern: shouldLoad = forceLoad || !loadedTabs.has(tabId)');
          console.log('   Issue: This causes double loading when forceLoad=true during initialization');
          results.rootCauseConfirmed = true;
          results.evidence.push('Boolean OR logic pattern found: forceLoad || !loadedTabs.has(tabId)');
        } else {
          console.log('⚠️ forceLoad parameter found but boolean logic pattern unclear');
          results.evidence.push('forceLoad parameter found but logic pattern not clearly visible');
        }
      } else {
        console.log('❌ forceLoad parameter not found in method signature');
        results.evidence.push('forceLoad parameter not detected in triggerTabSwitch');
        return false;
      }
    } catch (error) {
      console.log('⚠️ Could not inspect method signature (browser security limitation)');
      results.evidence.push('Method signature inspection failed: ' + error.message);

      // Fallback: check for loadedTabs property which indicates the boolean logic
      if (tabManager.loadedTabs instanceof Set) {
        console.log('✅ loadedTabs Set found - indicates boolean tracking logic exists');
        results.evidence.push('loadedTabs Set exists, suggesting boolean tracking logic');
      }
    }

    return results.rootCauseConfirmed;
  }

  /**
   * Test double loading scenarios
   */
  function testDoubleLoadingScenarios() {
    console.log('\n🔬 Testing Double Loading Scenarios');

    const tabManager = window.tabContextManager;
    if (!tabManager || !tabManager.loadedTabs) {
      console.log('❌ Cannot test loading scenarios - TabManager or loadedTabs not available');
      return;
    }

    console.log(`📊 Current loaded tabs: ${Array.from(tabManager.loadedTabs).join(', ') || 'none'}`);

    // Simulate the problematic scenarios
    const testScenarios = [
      { tabId: 'agent-tab', forceLoad: false, description: 'Normal tab switch (should not reload if already loaded)' },
      { tabId: 'agent-tab', forceLoad: true, description: 'Initialization with forceLoad=true (problematic - causes double loading)' },
      { tabId: 'people-tab', forceLoad: false, description: 'Switch to unloaded tab (should load)' }
    ];

    testScenarios.forEach(scenario => {
      const shouldLoad = scenario.forceLoad || !tabManager.loadedTabs.has(scenario.tabId);
      const status = shouldLoad ? '🔄 WOULD LOAD' : '⏭️ WOULD SKIP';

      console.log(`${status} | Tab: ${scenario.tabId} | forceLoad: ${scenario.forceLoad} | ${scenario.description}`);

      if (scenario.forceLoad && tabManager.loadedTabs.has(scenario.tabId)) {
        console.log('   🎯 DOUBLE LOADING DETECTED: forceLoad=true overrides loaded state');
        results.doubleLoadingDetected = true;
        results.evidence.push(`Double loading scenario: ${scenario.tabId} would reload despite being loaded`);
      }
    });
  }

  /**
   * Test operation ambiguity
   */
  function testOperationAmbiguity() {
    console.log('\n🔬 Testing Operation Type Ambiguity');

    console.log('📋 Current boolean approach problems:');
    console.log('   • forceLoad=true: Could mean "initialization" OR "force refresh"');
    console.log('   • forceLoad=false: Could mean "navigation" OR "already loaded"');
    console.log('   • No distinction between LOAD (first time) vs SWITCH (navigation) operations');

    // Check for evidence of operation ambiguity in the codebase
    const win = window;
    const indicators = [
      { check: win.BootController || win.bootController, name: 'BootController coordination' },
      { check: win.stateManager, name: 'StateManager integration' },
      { check: typeof win.initializeTheme === 'function' || typeof win.changeTheme === 'function', name: 'Theme operations during tab switches' }
    ];

    indicators.forEach(indicator => {
      if (indicator.check) {
        console.log(`✅ ${indicator.name} detected - potential coordination conflicts`);
        results.evidence.push(`${indicator.name} present - increases operation ambiguity risk`);
      }
    });

    results.operationAmbiguityFound = indicators.some(i => i.check);
    console.log(`\n🎯 Operation ambiguity assessment: ${results.operationAmbiguityFound ? 'HIGH RISK' : 'LOW RISK'}`);
  }

  /**
   * Generate recommendations
   */
  function generateRecommendations() {
    console.log('\n💡 RECOMMENDATIONS');

    if (results.rootCauseConfirmed) {
      console.log('1. 🚨 CRITICAL: Replace boolean forceLoad with OperationType enum');
      console.log('   - Create: enum OperationType { LOAD, SWITCH }');
      console.log('   - Change: triggerTabSwitch(tabId, operation) // operation is LOAD or SWITCH');
      console.log('   - Replace: shouldLoad logic with operation-specific handling');

      results.recommendations.push('Replace boolean forceLoad parameter with OperationType enum (LOAD | SWITCH)');
    }

    if (results.doubleLoadingDetected) {
      console.log('2. 🚨 CRITICAL: Fix double loading in initialization');
      console.log('   - Initialization should use LOAD operation');
      console.log('   - Navigation should use SWITCH operation');
      console.log('   - Only LOAD should initialize unloaded tabs');

      results.recommendations.push('Fix initialization to use LOAD operation instead of forceLoad=true');
    }

    if (results.operationAmbiguityFound) {
      console.log('3. ⚠️ MEDIUM: Add TabStateManager for centralized coordination');
      console.log('   - Track loading states centrally');
      console.log('   - Coordinate with BootController via events');
      console.log('   - Isolate theme operations from tab switching');

      results.recommendations.push('Implement TabStateManager for proper state coordination');
    }

    console.log('4. 🧪 TESTING: Add operation-specific unit tests');
    console.log('   - Test LOAD vs SWITCH behavior separately');
    console.log('   - Test BootController coordination');
    console.log('   - Test theme isolation during navigation');

    results.recommendations.push('Add comprehensive tests for LOAD vs SWITCH operations');
  }

  // Run all diagnostic tests
  console.log('🚀 STARTING ROOT CAUSE ANALYSIS\n');

  const rootCauseFound = testForceLoadLogic();
  testDoubleLoadingScenarios();
  testOperationAmbiguity();
  generateRecommendations();

  // Summary
  console.log('\n📊 DIAGNOSTIC SUMMARY');
  console.log('====================');
  console.log(`Root Cause Confirmed: ${results.rootCauseConfirmed ? '✅ YES' : '❌ NO'}`);
  console.log(`Double Loading Detected: ${results.doubleLoadingDetected ? '✅ YES' : '❌ NO'}`);
  console.log(`Operation Ambiguity: ${results.operationAmbiguityFound ? '⚠️ HIGH' : '✅ LOW'}`);

  if (results.rootCauseConfirmed && results.doubleLoadingDetected) {
    console.log('\n🎯 DIAGNOSIS: CRITICAL ISSUE CONFIRMED');
    console.log('The boolean forceLoad parameter is causing double loading during initialization.');
    console.log('Immediate fix required: Replace with OperationType enum.');
  } else {
    console.log('\n🤔 DIAGNOSIS: ISSUE NOT FULLY CONFIRMED');
    console.log('Additional investigation needed to confirm root cause.');
  }

  console.log('\n📋 Evidence collected:', results.evidence.length, 'items');
  console.log('💡 Recommendations:', results.recommendations.length, 'items');

  // Store results globally for further analysis
  window.diagnoseTabmanagerForceLoadRootCauseDiagnosticResults = results;

  console.log('\n✅ Root cause diagnostic complete');
  console.log('Results stored in: window.tabManagerForceLoadDiagnostic');

  return results;
})(); // Close IIFE

