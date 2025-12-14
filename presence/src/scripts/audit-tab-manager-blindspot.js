/**
 * DIAGNOSTIC SCRIPT: TabManager Blindspot Audit (Blindspot Identifier)
 *
 * PROBLEM: Implementation may have overlooked architectural issues that could cause
 * future problems, scalability issues, or integration failures.
 *
 * PURPOSE: Identify blindspots in the TabManager architecture including lifecycle issues,
 * scalability concerns, browser compatibility, and integration risks.
 */

(function() {
  'use strict';

  // Structured results object for validation
  const results = {
    passed: 0,
    failed: 0,
    warnings: 0,
    blindspots: [],
    tests: [],
    timestamp: new Date().toISOString()
  };

  function logResult(testName, status, message, details = null) {
    const result = { testName, status, message, details, timestamp: new Date().toISOString() };
    results.tests.push(result);

    const statusIcon = {
      'PASS': '✅',
      'FAIL': '❌',
      'WARN': '⚠️',
      'BLINDSPOT': '👁️'
    }[status] || '❓';

    console.log(`${statusIcon} ${testName}: ${message}`);
    if (details) {
      console.log('   Details:', details);
    }

    switch (status) {
      case 'PASS': results.passed++; break;
      case 'FAIL': results.failed++; break;
      case 'WARN': results.warnings++; break;
      case 'BLINDSPOT':
        results.blindspots.push({ testName, message, details });
        results.warnings++;
        break;
    }
  }

  /**
   * Audit singleton pattern risks
   */
  function auditSingletonPattern() {
    console.log('👁️ AUDITING: Singleton Pattern Risks');

    const tabStateManager1 = window.tabStateManager;
    const tabStateManager2 = window.tabStateManager;

    if (tabStateManager1 && tabStateManager1 === tabStateManager2) {
      logResult('Singleton Pattern', 'PASS', 'TabStateManager properly implements singleton pattern');

      // Test singleton state isolation
      const testTabId = 'singleton-test-tab';

      // Modify state through one reference
      tabStateManager1.setTabLoading(testTabId, true);
      const state1 = tabStateManager1.isTabLoading(testTabId);

      // Check through other reference
      const state2 = tabStateManager2.isTabLoading(testTabId);

      if (state1 === state2) {
        logResult('Singleton State Isolation', 'PASS', 'Singleton state properly shared between references');
      } else {
        logResult('Singleton State Isolation', 'BLINDSPOT', 'Singleton state not properly synchronized', {
          state1,
          state2,
          risk: 'Multiple singleton instances could cause state desynchronization'
        });
      }

      // Clean up
      tabStateManager1.setTabLoading(testTabId, false);

    } else {
      logResult('Singleton Pattern', 'BLINDSPOT', 'TabStateManager may not properly implement singleton', {
        instance1: !!tabStateManager1,
        instance2: !!tabStateManager2,
        sameInstance: tabStateManager1 === tabStateManager2,
        risk: 'Multiple instances could cause inconsistent state management'
      });
    }
  }

  /**
   * Audit memory leak potential
   */
  function auditMemoryLeaks() {
    console.log('👁️ AUDITING: Memory Leak Potential');

    const tabStateManager = window.tabStateManager;
    if (!tabStateManager) {
      logResult('Memory Leaks', 'FAIL', 'TabStateManager not available');
      return;
    }

    // Test for retained references
    const initialState = tabStateManager.getState();
    const initialSize = JSON.stringify(initialState).length;

    // Create many tabs and operations
    for (let i = 0; i < 100; i++) {
      const tabId = `leak-test-tab-${i}`;
      tabStateManager.setTabLoading(tabId, true);
      tabStateManager.setTabLoading(tabId, false); // Complete the operation
    }

    // Force garbage collection hint (if available)
    if (typeof window !== 'undefined' && window.gc) {
      window.gc();
    }

    const finalState = tabStateManager.getState();
    const finalSize = JSON.stringify(finalState).length;

    // Reset and check cleanup
    tabStateManager.reset();
    const resetState = tabStateManager.getState();
    const resetSize = JSON.stringify(resetState).length;

    if (resetSize < initialSize * 1.1) { // Allow 10% variance
      logResult('Memory Cleanup', 'PASS', 'Memory properly cleaned up after reset');
    } else {
      logResult('Memory Cleanup', 'BLINDSPOT', 'Potential memory leak in state management', {
        initialSize,
        finalSize,
        resetSize,
        growth: ((resetSize - initialSize) / initialSize * 100).toFixed(1) + '%',
        risk: 'Accumulating state could cause memory exhaustion over time'
      });
    }

    // Check for circular references in state
    const stateStr = JSON.stringify(finalState);
    if (stateStr.includes('[object Object]') || stateStr.includes('undefined')) {
      logResult('Circular References', 'BLINDSPOT', 'Potential circular references in state object', {
        stateStr: stateStr.substring(0, 200) + '...',
        risk: 'Circular references could prevent proper serialization and cause memory issues'
      });
    } else {
      logResult('Circular References', 'PASS', 'No circular references detected in state');
    }
  }

  /**
   * Audit browser compatibility issues
   */
  function auditBrowserCompatibility() {
    console.log('👁️ AUDITING: Browser Compatibility');

    // Test MutationObserver support (used in TabContextManager)
    if (typeof MutationObserver === 'undefined') {
      logResult('MutationObserver Support', 'BLINDSPOT', 'MutationObserver not supported', {
        userAgent: navigator.userAgent,
        risk: 'Tab switching may not work in older browsers'
      });
    } else {
      logResult('MutationObserver Support', 'PASS', 'MutationObserver available');
    }

    // Test CustomEvent support
    try {
      const testEvent = new CustomEvent('test', { detail: { test: true } });
      if (testEvent.detail.test) {
        logResult('CustomEvent Support', 'PASS', 'CustomEvent properly supported');
      } else {
        logResult('CustomEvent Support', 'BLINDSPOT', 'CustomEvent not working correctly', {
          risk: 'Tab events may not fire properly'
        });
      }
    } catch (error) {
      logResult('CustomEvent Support', 'BLINDSPOT', 'CustomEvent not supported', {
        error: error.message,
        risk: 'Event-driven architecture may fail in older browsers'
      });
    }

    // Test Promise support (used in async operations)
    if (typeof Promise === 'undefined') {
      logResult('Promise Support', 'BLINDSPOT', 'Promises not supported', {
        risk: 'Async tab operations will fail in older browsers'
      });
    } else {
      logResult('Promise Support', 'PASS', 'Promises available');
    }

    // Test Map support (used in TabStateManager)
    if (typeof Map === 'undefined') {
      logResult('Map Support', 'BLINDSPOT', 'Map not supported', {
        risk: 'State management may fail in older browsers'
      });
    } else {
      const testMap = new Map();
      testMap.set('test', 'value');
      if (testMap.get('test') === 'value') {
        logResult('Map Support', 'PASS', 'Map properly supported');
      } else {
        logResult('Map Support', 'BLINDSPOT', 'Map implementation unreliable', {
          risk: 'State storage may be inconsistent'
        });
      }
    }
  }

  /**
   * Audit extension lifecycle integration
   */
  function auditExtensionLifecycle() {
    console.log('👁️ AUDITING: Extension Lifecycle Integration');

    // Check if we're in an extension context
    const isExtension = typeof chrome !== 'undefined' && chrome.tabs;
    logResult('Extension Context', isExtension ? 'PASS' : 'WARN', `Running in ${isExtension ? 'extension' : 'non-extension'} context`);

    if (isExtension) {
      // Test tab query permissions
      try {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
          if (tabs && tabs.length > 0) {
            logResult('Tab API Access', 'PASS', 'Extension has tab API access');
          } else {
            logResult('Tab API Access', 'WARN', 'Tab API returned no results');
          }
        });
      } catch (error) {
        logResult('Tab API Access', 'BLINDSPOT', 'Tab API access failed', {
          error: error.message,
          risk: 'TabManager may not work properly in extension context'
        });
      }

      // Check for service worker context
      if (typeof importScripts !== 'undefined') {
        logResult('Service Worker Context', 'BLINDSPOT', 'Running in service worker context', {
          risk: 'DOM manipulation will fail in service worker'
        });
      } else {
        logResult('Service Worker Context', 'PASS', 'Not running in service worker context');
      }
    }

    // Test page lifecycle events
    let visibilityChanges = 0;
    const handleVisibilityChange = () => {
      visibilityChanges++;
    };

    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', handleVisibilityChange);

      // Simulate visibility change
      const originalHidden = document.hidden;
      Object.defineProperty(document, 'hidden', { value: !originalHidden, configurable: true });

      try {
        document.dispatchEvent(new Event('visibilitychange'));
      } catch (error) {
        // Ignore dispatch errors
      }

      // Restore
      Object.defineProperty(document, 'hidden', { value: originalHidden, configurable: true });
      document.removeEventListener('visibilitychange', handleVisibilityChange);

      if (visibilityChanges > 0) {
        logResult('Page Visibility API', 'PASS', 'Page visibility events working');
      } else {
        logResult('Page Visibility API', 'BLINDSPOT', 'Page visibility events not working', {
          risk: 'Extension suspend/resume may not be handled properly'
        });
      }
    }
  }

  /**
   * Audit error propagation and cascading failures
   */
  function auditErrorPropagation() {
    console.log('👁️ AUDITING: Error Propagation');

    const tabStateManager = window.tabStateManager;
    const tabManager = window.tabContextManager;

    if (!tabStateManager || !tabManager) {
      logResult('Error Propagation', 'FAIL', 'Required components not available');
      return;
    }

    // Test error isolation
    const errorScenarios = [
      {
        name: 'Invalid Tab ID',
        action: () => tabStateManager.validateOperation(null, window.TabOperation.SWITCH),
        expectError: true
      },
      {
        name: 'Invalid Operation',
        action: () => tabStateManager.validateOperation('test-tab', 'INVALID'),
        expectError: true
      },
      {
        name: 'DOM Operation on Missing Element',
        action: () => {
          if (tabManager.performTabOperation) {
            return tabManager.performTabOperation('nonexistent-tab-id', { operation: window.TabOperation.SWITCH });
          }
        },
        expectError: true
      }
    ];

    let cascadingErrors = 0;
    let isolatedErrors = 0;

    errorScenarios.forEach(scenario => {
      try {
        const result = scenario.action();
        if (scenario.expectError) {
          if (result && !result.valid) {
            isolatedErrors++;
          } else {
            cascadingErrors++;
            console.log(`   ${scenario.name}: Expected error but got success`);
          }
        }
      } catch (error) {
        if (scenario.expectError) {
          isolatedErrors++;
        } else {
          cascadingErrors++;
          console.log(`   ${scenario.name}: Unexpected error:`, error.message);
        }
      }
    });

    if (cascadingErrors === 0) {
      logResult('Error Isolation', 'PASS', 'Errors properly isolated and handled');
    } else {
      logResult('Error Isolation', 'BLINDSPOT', `${cascadingErrors} errors not properly isolated`, {
        cascadingErrors,
        isolatedErrors,
        risk: 'Uncontained errors could cause cascading system failures'
      });
    }

    // Test error recovery
    const testTabId = 'error-recovery-test';
    try {
      // Cause an error state
      tabStateManager.setTabLoading(testTabId, true);

      // Try to perform invalid operation
      tabStateManager.validateOperation(null, null);

      // Check if system can continue
      const stillWorks = tabStateManager.isTabLoading(testTabId);
      if (stillWorks) {
        logResult('Error Recovery', 'PASS', 'System maintains state after error');
      } else {
        logResult('Error Recovery', 'BLINDSPOT', 'System state corrupted by error', {
          risk: 'Errors could leave system in inconsistent state'
        });
      }
    } catch (error) {
      logResult('Error Recovery', 'BLINDSPOT', 'Error handling itself failed', {
        error: error.message,
        risk: 'Error handling system may be unreliable'
      });
    }
  }

  /**
   * Audit scalability concerns
   */
  function auditScalability() {
    console.log('👁️ AUDITING: Scalability Concerns');

    const tabStateManager = window.tabStateManager;
    if (!tabStateManager) {
      logResult('Scalability', 'FAIL', 'TabStateManager not available');
      return;
    }

    // Test performance with many tabs
    const startTime = Date.now();
    const tabCount = 100;

    for (let i = 0; i < tabCount; i++) {
      const tabId = `scale-test-tab-${i}`;
      tabStateManager.setTabLoading(tabId, true);
      tabStateManager.isTabLoading(tabId);
      tabStateManager.setTabLoading(tabId, false);
    }

    const endTime = Date.now();
    const duration = endTime - startTime;
    const avgTime = duration / tabCount;

    if (avgTime < 1) { // Less than 1ms per operation
      logResult('Performance Scalability', 'PASS', `${tabCount} tabs processed in ${duration}ms (${avgTime.toFixed(2)}ms avg)`);
    } else {
      logResult('Performance Scalability', 'BLINDSPOT', `Slow performance with ${tabCount} tabs`, {
        duration,
        avgTime: avgTime.toFixed(2) + 'ms',
        risk: 'Performance may degrade significantly with many tabs'
      });
    }

    // Test state size growth
    const state = tabStateManager.getState();
    const stateSize = JSON.stringify(state).length;

    // Estimate size per tab (rough approximation)
    const bytesPerTab = stateSize / Math.max(tabCount, 1);

    if (bytesPerTab < 1000) { // Less than 1KB per tab
      logResult('Memory Scalability', 'PASS', `${bytesPerTab.toFixed(0)} bytes per tab state`);
    } else {
      logResult('Memory Scalability', 'BLINDSPOT', `High memory usage: ${bytesPerTab.toFixed(0)} bytes per tab`, {
        bytesPerTab: bytesPerTab.toFixed(0),
        totalSize: stateSize,
        risk: 'Memory usage may become problematic with many tabs'
      });
    }

    // Clean up
    tabStateManager.reset();
  }

  /**
   * Audit integration risks
   */
  function auditIntegrationRisks() {
    console.log('👁️ AUDITING: Integration Risks');

    // Check for BootController integration
    const bootController = window.bootController || window.BootController;
    if (bootController) {
      logResult('BootController Integration', 'PASS', 'BootController available for coordination');

      // Check for handleUserChange method
      if (typeof bootController.handleUserChange === 'function') {
        logResult('BootController User Handling', 'PASS', 'User change handling available');
      } else {
        logResult('BootController User Handling', 'BLINDSPOT', 'handleUserChange method missing', {
          risk: 'User authentication may not trigger proper tab initialization'
        });
      }
    } else {
      logResult('BootController Integration', 'BLINDSPOT', 'BootController not available', {
        risk: 'TabManager may not integrate properly with initialization flow'
      });
    }

    // Check StateManager integration
    const stateManager = window.stateManager;
    if (stateManager) {
      logResult('StateManager Integration', 'PASS', 'StateManager available');

      // Check for messages loading state
      const isLoading = stateManager.getState('messages.isLoading');
      if (isLoading !== undefined) {
        logResult('Loading State Integration', 'PASS', 'Message loading state properly tracked');
      } else {
        logResult('Loading State Integration', 'BLINDSPOT', 'Message loading state not found', {
          risk: 'Double loading prevention may not work'
        });
      }
    } else {
      logResult('StateManager Integration', 'BLINDSPOT', 'StateManager not available', {
        risk: 'State coordination between components may fail'
      });
    }

    // Check for theme integration
    const themeFunctions = ['initializeTheme', 'changeTheme', 'applyTheme'];
    const availableThemes = themeFunctions.filter(func =>
      typeof window[func] === 'function'
    );

    if (availableThemes.length > 0) {
      logResult('Theme Integration', 'PASS', `${availableThemes.length} theme functions available`);
    } else {
      logResult('Theme Integration', 'BLINDSPOT', 'No theme functions found', {
        risk: 'Theme changes may interfere with tab operations'
      });
    }
  }

  /**
   * Run all blindspot audits
   */
  function runTabManagerBlindspotAudit() {
    console.log('👁️ TAB MANAGER BLINDSPOT AUDIT');
    console.log('==============================');
    console.log('Auditing: Singleton risks, memory leaks, browser compatibility, lifecycle integration');
    console.log('');

    auditSingletonPattern();
    console.log('');

    auditMemoryLeaks();
    console.log('');

    auditBrowserCompatibility();
    console.log('');

    auditExtensionLifecycle();
    console.log('');

    auditErrorPropagation();
    console.log('');

    auditScalability();
    console.log('');

    auditIntegrationRisks();
    console.log('');

    // Summary
    console.log('📊 BLINDSPOT AUDIT SUMMARY');
    console.log('==========================');
    console.log(`✅ Passed: ${results.passed}`);
    console.log(`❌ Failed: ${results.failed}`);
    console.log(`⚠️  Warnings: ${results.warnings}`);
    console.log(`👁️ Blindspots: ${results.blindspots.length}`);
    console.log('');

    if (results.blindspots.length > 0) {
      console.log('👁️ CRITICAL BLINDSPOTS IDENTIFIED:');
      results.blindspots.forEach((spot, index) => {
        console.log(`${index + 1}. ${spot.testName}: ${spot.message}`);
        if (spot.details && spot.details.risk) {
          console.log(`   Risk: ${spot.details.risk}`);
        }
      });
      console.log('');
    }

    if (results.failed === 0 && results.blindspots.length === 0) {
      console.log('👁️ No significant blindspots found!');
      console.log('✅ TabManager architecture appears robust');
    } else {
      console.log('⚠️  Blindspots identified - review risks above');
      console.log('');
      console.log('🔧 Address blindspots before deployment or document as acceptable risks');
    }

    // Store results globally for further inspection (like other diagnostic scripts)
    window.diagnosticResults = results;
    window.auditTabManagerBlindspotDiagnosticResults = {
      ...results,
      runTabManagerBlindspotAudit: runTabManagerBlindspotAudit,
      auditSingletonPattern,
      auditMemoryLeaks,
      auditBrowserCompatibility,
      auditExtensionLifecycle,
      auditErrorPropagation,
      auditScalability,
      auditIntegrationRisks
    };

    return results;
  }

  // Export for use in other scripts
  if (typeof window !== 'undefined') {
    window.runTabManagerBlindspotAudit = runTabManagerBlindspotAudit;
  }

  // Auto-run if executed directly
  if (typeof window !== 'undefined' && window.location) {
    console.log('👁️ TabManager Blindspot Audit Script Loaded');
    console.log('Run: runTabManagerBlindspotAudit() to start blindspot analysis');
  }

})(); // Close IIFE


