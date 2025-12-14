/**
 * DIAGNOSTIC SCRIPT: TabManager Theme Pollution & Loading Gif Investigation
 *
 * PROBLEM: Despite deployment of TabManager fixes, theme pollution and loading gif issues persist.
 * Need to diagnose what's actually happening in the deployed code.
 *
 * PURPOSE: Real-time monitoring and diagnosis of theme changes and loading behavior
 * to identify root causes of persistent issues.
 */

(function() {
  'use strict';

  // Structured results object for validation
  const results = {
    passed: 0,
    failed: 0,
    warnings: 0,
    themeIssues: [],
    loadingIssues: [],
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
      'THEME': '🎨',
      'LOADING': '⏳'
    }[status] || '❓';

    console.log(`${statusIcon} ${testName}: ${message}`);
    if (details) {
      console.log('   Details:', details);
    }

    switch (status) {
      case 'PASS': results.passed++; break;
      case 'FAIL': results.failed++; break;
      case 'WARN': results.warnings++; break;
      case 'THEME':
        results.themeIssues.push({ testName, message, details });
        results.failed++;
        break;
      case 'LOADING':
        results.loadingIssues.push({ testName, message, details });
        results.failed++;
        break;
    }
  }

  /**
   * Monitor theme changes in real-time
   */
  function monitorThemeChanges() {
    console.log('🎨 MONITORING: Theme Changes');

    let themeChangeCount = 0;
    const themeChanges = [];

    // Monitor data-theme attribute changes
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes' && mutation.attributeName === 'data-theme') {
          themeChangeCount++;
          const target = mutation.target as Element;
          const newValue = target.getAttribute('data-theme');
          const oldValue = mutation.oldValue;

          const change = {
            timestamp: new Date().toISOString(),
            element: target.tagName + (target.id ? '#' + target.id : ''),
            oldValue: oldValue || 'NOT_SET',
            newValue: newValue || 'NOT_SET',
            stack: new Error().stack?.split('\n').slice(1, 8).join('\n') || 'NO_STACK'
          };

          themeChanges.push(change);

          logResult('Theme Change Detected', 'THEME', `Theme changed from '${change.oldValue}' to '${change.newValue}' on ${change.element}`, {
            change,
            totalChanges: themeChangeCount
          });
        }
      });
    });

    // Start monitoring
    if (document.body) {
      observer.observe(document.body, {
        attributes: true,
        attributeOldValue: true,
        attributeFilter: ['data-theme']
      });
    }
    if (document.documentElement) {
      observer.observe(document.documentElement, {
        attributes: true,
        attributeOldValue: true,
        attributeFilter: ['data-theme']
      });
    }

    // Store for cleanup
    window.themeObserver = observer;
    window.themeChanges = themeChanges;
    window.themeChangeCount = themeChangeCount;

    logResult('Theme Monitoring Started', 'PASS', 'Monitoring theme changes on document.body and document.documentElement');
  }

  /**
   * Monitor loading gif behavior
   */
  function monitorLoadingGif() {
    console.log('⏳ MONITORING: Loading Gif Behavior');

    let loadingStates = [];
    let currentLoadingGif = null;

    // Monitor loading container creation/removal
    const loadingObserver = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList') {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              const element = node as Element;
              if (element.classList?.contains('loading-container') || element.querySelector('.loading-container')) {
                const loadingContainer = element.classList?.contains('loading-container') ? element : element.querySelector('.loading-container');
                if (loadingContainer) {
                  currentLoadingGif = loadingContainer;
                  const state = {
                    timestamp: new Date().toISOString(),
                    action: 'CREATED',
                    element: loadingContainer,
                    stack: new Error().stack?.split('\n').slice(1, 6).join('\n') || 'NO_STACK'
                  };
                  loadingStates.push(state);

                  logResult('Loading Gif Created', 'LOADING', 'Loading container was added to DOM', {
                    state,
                    totalStates: loadingStates.length
                  });
                }
              }
            }
          });

          mutation.removedNodes.forEach((node) => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              const element = node as Element;
              if (element === currentLoadingGif || element.querySelector('.loading-container') === currentLoadingGif) {
                const state = {
                  timestamp: new Date().toISOString(),
                  action: 'REMOVED',
                  element: currentLoadingGif,
                  stack: new Error().stack?.split('\n').slice(1, 6).join('\n') || 'NO_STACK'
                };
                loadingStates.push(state);
                currentLoadingGif = null;

                logResult('Loading Gif Removed', 'LOADING', 'Loading container was removed from DOM', {
                  state,
                  totalStates: loadingStates.length
                });
              }
            }
          });
        }
      });
    });

    // Start monitoring chat-messages container
    const chatMessages = document.querySelector('.chat-messages');
    if (chatMessages) {
      loadingObserver.observe(chatMessages, {
        childList: true,
        subtree: true
      });
      logResult('Loading Gif Monitoring Started', 'PASS', 'Monitoring loading gif in .chat-messages container');
    } else {
      logResult('Loading Gif Monitoring Failed', 'FAIL', '.chat-messages container not found');
    }

    // Store for cleanup
    window.loadingObserver = loadingObserver;
    window.loadingStates = loadingStates;
    window.currentLoadingGif = currentLoadingGif;
  }

  /**
   * Monitor TabManager operations
   */
  function monitorTabOperations() {
    console.log('🔄 MONITORING: TabManager Operations');

    let tabOperations = [];

    // Listen for tab switch events
    document.addEventListener('tabManager:tabSwitched', (event) => {
      const detail = event.detail;
      const operation = {
        timestamp: new Date().toISOString(),
        tabId: detail.tabId,
        operation: detail.operation,
        currentTab: detail.currentTab,
        previousTab: detail.previousTab,
        wasLoaded: detail.wasLoaded,
        shouldLoad: detail.shouldLoad,
        forceLoaded: detail.forceLoaded
      };

      tabOperations.push(operation);

      logResult('Tab Operation', 'PASS', `${detail.operation?.toUpperCase() || 'UNKNOWN'} operation on ${detail.tabId}`, {
        operation,
        totalOperations: tabOperations.length
      });

      // Check for double loading
      if (detail.shouldLoad && detail.wasLoaded) {
        logResult('Double Loading Detected', 'LOADING', `Tab ${detail.tabId} was loaded when it was already loaded`, {
          operation,
          issue: 'shouldLoad=true but wasLoaded=true indicates double loading logic failure'
        });
      }

      // Check for theme pollution during operations
      // We'll check theme changes within 2 seconds of this operation
      setTimeout(() => {
        const recentThemeChanges = (window.themeChanges || []).filter(change =>
          new Date(change.timestamp).getTime() > new Date(operation.timestamp).getTime() - 2000 &&
          new Date(change.timestamp).getTime() < new Date(operation.timestamp).getTime() + 2000
        );

        if (recentThemeChanges.length > 0) {
          logResult('Theme Pollution During Tab Operation', 'THEME', `${recentThemeChanges.length} theme changes occurred during/near tab operation`, {
            operation,
            themeChanges: recentThemeChanges,
            issue: 'Theme changes should not occur during tab operations'
          });
        }
      }, 2100);
    });

    // Monitor TabStateManager state changes
    const tabStateManager = window.tabStateManager;
    if (tabStateManager) {
      // Hook into state methods to monitor calls
      const originalSetTabLoading = tabStateManager.setTabLoading;
      tabStateManager.setTabLoading = function(tabId, loading) {
        const stateChange = {
          timestamp: new Date().toISOString(),
          action: 'setTabLoading',
          tabId,
          loading,
          stack: new Error().stack?.split('\n').slice(1, 5).join('\n') || 'NO_STACK'
        };

        logResult('TabStateManager State Change', 'PASS', `${loading ? 'Started' : 'Finished'} loading ${tabId}`, {
          stateChange
        });

        return originalSetTabLoading.call(this, tabId, loading);
      };

      logResult('TabStateManager Monitoring Started', 'PASS', 'Monitoring TabStateManager state changes');
    } else {
      logResult('TabStateManager Monitoring Failed', 'FAIL', 'TabStateManager not available');
    }

    // Store for cleanup
    window.tabOperations = tabOperations;
  }

  /**
   * Monitor BootController message loading
   */
  function monitorBootControllerLoading() {
    console.log('🎛️ MONITORING: BootController Message Loading');

    // Hook into stateManager to monitor message loading states
    const stateManager = window.stateManager;
    if (stateManager) {
      const originalSetState = stateManager.setState;

      stateManager.setState = async function(key, value) {
        // Monitor messages.isLoading changes
        if (key === 'messages.isLoading') {
          const loadingChange = {
            timestamp: new Date().toISOString(),
            key,
            value,
            stack: new Error().stack?.split('\n').slice(1, 5).join('\n') || 'NO_STACK'
          };

          logResult('Message Loading State Change', 'LOADING', `messages.isLoading set to ${value}`, {
            loadingChange
          });

          // Check if loading gif exists when loading starts
          if (value === true) {
            const loadingGif = document.querySelector('.loading-container');
            if (!loadingGif) {
              logResult('Loading Gif Missing', 'LOADING', 'Loading state set to true but no loading gif visible', {
                loadingChange,
                issue: 'Loading gif should be visible when messages.isLoading = true'
              });
            }
          }

          // Check if loading gif is removed when loading completes
          if (value === false) {
            // Delay check to allow for DOM updates
            setTimeout(() => {
              const loadingGif = document.querySelector('.loading-container');
              if (loadingGif) {
                logResult('Loading Gif Not Removed', 'LOADING', 'Loading state set to false but loading gif still visible', {
                  loadingChange,
                  issue: 'Loading gif should be removed when messages.isLoading = false'
                });
              }
            }, 100);
          }
        }

        return originalSetState.call(this, key, value);
      };

      logResult('BootController Monitoring Started', 'PASS', 'Monitoring message loading state changes');
    } else {
      logResult('BootController Monitoring Failed', 'FAIL', 'StateManager not available');
    }
  }

  /**
   * Test tab switching scenarios
   */
  function testTabSwitchingScenarios() {
    console.log('🧪 TESTING: Tab Switching Scenarios');

    const tabManager = window.tabContextManager;
    if (!tabManager) {
      logResult('Tab Switching Tests', 'FAIL', 'TabManager not available for testing');
      return;
    }

    // Test scenarios
    const scenarios = [
      {
        name: 'Switch to discuss tab',
        tabId: 'discuss-tab',
        operation: 'SWITCH',
        description: 'Test basic tab switching'
      },
      {
        name: 'Switch to visibility tab',
        tabId: 'visibility-tab',
        operation: 'SWITCH',
        description: 'Test switching to visibility tab'
      },
      {
        name: 'Switch to settings tab',
        tabId: 'settings-tab',
        operation: 'SWITCH',
        description: 'Test switching to settings tab'
      },
      {
        name: 'Rapid tab switching',
        tabId: 'discuss-tab',
        operation: 'SWITCH',
        description: 'Test rapid switching back to discuss',
        delay: 500
      }
    ];

    scenarios.forEach((scenario, index) => {
      setTimeout(async () => {
        try {
          logResult(`Testing: ${scenario.name}`, 'PASS', scenario.description);

          if (tabManager.performTabOperation) {
            await tabManager.performTabOperation(scenario.tabId, { operation: scenario.operation });
          } else if (tabManager.triggerTabSwitch) {
            await tabManager.triggerTabSwitch(scenario.tabId, { operation: scenario.operation });
          } else {
            logResult(`Testing: ${scenario.name}`, 'FAIL', 'No tab operation method available');
          }
        } catch (error) {
          logResult(`Testing: ${scenario.name}`, 'FAIL', `Error during test: ${error.message}`, {
            error,
            scenario
          });
        }
      }, index * (scenario.delay || 2000));
    });

    logResult('Tab Switching Tests Started', 'PASS', `Running ${scenarios.length} test scenarios`);
  }

  /**
   * Generate investigation report
   */
  function generateInvestigationReport() {
    console.log('📋 TAB MANAGER INVESTIGATION REPORT');
    console.log('=====================================');

    // Summary
    console.log('📊 SUMMARY:');
    console.log(`   ✅ Passed: ${results.passed}`);
    console.log(`   ❌ Failed: ${results.failed}`);
    console.log(`   ⚠️ Warnings: ${results.warnings}`);
    console.log(`   🎨 Theme Issues: ${results.themeIssues.length}`);
    console.log(`   ⏳ Loading Issues: ${results.loadingIssues.length}`);
    console.log('');

    if (results.themeIssues.length > 0) {
      console.log('🎨 THEME POLLUTION ISSUES:');
      results.themeIssues.forEach((issue, index) => {
        console.log(`   ${index + 1}. ${issue.testName}: ${issue.message}`);
        if (issue.details?.change) {
          console.log(`      - Element: ${issue.details.change.element}`);
          console.log(`      - Changed: ${issue.details.change.oldValue} → ${issue.details.change.newValue}`);
        }
      });
      console.log('');
    }

    if (results.loadingIssues.length > 0) {
      console.log('⏳ LOADING GIF ISSUES:');
      results.loadingIssues.forEach((issue, index) => {
        console.log(`   ${index + 1}. ${issue.testName}: ${issue.message}`);
        if (issue.details?.issue) {
          console.log(`      - Issue: ${issue.details.issue}`);
        }
      });
      console.log('');
    }

    console.log('🔍 INVESTIGATION DATA COLLECTED:');
    console.log(`   - Theme Changes: ${window.themeChangeCount || 0}`);
    console.log(`   - Tab Operations: ${(window.tabOperations || []).length}`);
    console.log(`   - Loading States: ${(window.loadingStates || []).length}`);
    console.log('');

    console.log('💾 DATA STORED GLOBALLY:');
    console.log('   window.themeChanges - All theme change events');
    console.log('   window.tabOperations - All tab operation events');
    console.log('   window.loadingStates - All loading gif events');
    console.log('   window.investigationReport - Complete report data');
    console.log('');

    if (results.failed > 0) {
      console.log('🚨 ISSUES DETECTED - REQUIRES FURTHER INVESTIGATION');
      console.log('');
      console.log('🔧 RECOMMENDED NEXT STEPS:');
      console.log('1. Review theme change stack traces to identify pollution sources');
      console.log('2. Check BootController message loading coordination');
      console.log('3. Verify TabStateManager loading state synchronization');
      console.log('4. Test theme isolation during tab operations');
    } else {
      console.log('✅ NO ISSUES DETECTED - MONITORING CONTINUES');
    }

    // Store comprehensive report
    window.diagnosticResults = results;
    window.investigationReport = {
      ...results,
      collectedData: {
        themeChanges: window.themeChanges,
        tabOperations: window.tabOperations,
        loadingStates: window.loadingStates,
        themeChangeCount: window.themeChangeCount
      },
      generateInvestigationReport: generateInvestigationReport,
      monitorThemeChanges,
      monitorLoadingGif,
      monitorTabOperations,
      monitorBootControllerLoading,
      testTabSwitchingScenarios
    };

    return results;
  }

  /**
   * Cleanup monitoring
   */
  function cleanupMonitoring() {
    console.log('🧹 CLEANUP: Stopping all monitoring');

    if (window.themeObserver) {
      window.themeObserver.disconnect();
      delete window.themeObserver;
    }

    if (window.loadingObserver) {
      window.loadingObserver.disconnect();
      delete window.loadingObserver;
    }

    // Restore original methods if we hooked them
    const tabStateManager = window.tabStateManager;
    const stateManager = window.stateManager;

    if (tabStateManager && window.originalSetTabLoading) {
      tabStateManager.setTabLoading = window.originalSetTabLoading;
    }

    if (stateManager && window.originalSetState) {
      stateManager.setState = window.originalSetState;
    }

    console.log('✅ Monitoring cleanup completed');
  }

  /**
   * Run complete investigation
   */
  function runTabManagerInvestigation() {
    console.log('🔍 TAB MANAGER THEME POLLUTION & LOADING GIF INVESTIGATION');
    console.log('===========================================================');
    console.log('Real-time monitoring of theme changes and loading behavior');
    console.log('');

    monitorThemeChanges();
    monitorLoadingGif();
    monitorTabOperations();
    monitorBootControllerLoading();
    testTabSwitchingScenarios();

    // Auto-generate report after 30 seconds
    setTimeout(() => {
      generateInvestigationReport();
    }, 30000);

    // Auto-cleanup after 5 minutes
    setTimeout(() => {
      cleanupMonitoring();
      console.log('🏁 Investigation completed - monitoring stopped');
    }, 300000); // 5 minutes

    console.log('📊 Investigation started - monitoring for 5 minutes');
    console.log('Run generateInvestigationReport() to generate report early');
    console.log('Run cleanupMonitoring() to stop monitoring manually');
  }

  // Export functions
  if (typeof window !== 'undefined') {
    window.runTabManagerInvestigation = runTabManagerInvestigation;
    window.generateInvestigationReport = generateInvestigationReport;
    window.cleanupMonitoring = cleanupMonitoring;
  }

  // Auto-run if executed directly
  if (typeof window !== 'undefined' && window.location) {
    console.log('🔍 TabManager Investigation Script Loaded');
    console.log('Run: runTabManagerInvestigation() to start real-time monitoring');
    console.log('Or run individual monitors: monitorThemeChanges(), monitorLoadingGif(), etc.');
  }

})(); // Close IIFE


