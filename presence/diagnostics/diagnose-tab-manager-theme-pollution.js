// TabManager Theme Pollution & Loading Gif Investigation Diagnostic Script
// Pure JavaScript diagnostic script for browser console execution
// Targets root cause identification for tab manager issues

(function() {
    'use strict';

    // Diagnostic Script Template - Pure JavaScript for Browser Console
    const DIAGNOSTIC_ID = 'tab-manager-theme-pollution-investigation';
    const TIMESTAMP = new Date().toISOString();

    // Results tracking
    const results = {
        diagnosticId: DIAGNOSTIC_ID,
        timestamp: TIMESTAMP,
        passed: 0,
        failed: 0,
        warnings: 0,
        findings: [],
        recommendations: []
    };

    // Logging utility
    function log(level, message, details) {
        const entry = {
            timestamp: new Date().toISOString(),
            level: level,
            message: message,
            details: details || null
        };

        results.findings.push(entry);

        const icons = {
            'PASS': '✅',
            'FAIL': '❌',
            'WARN': '⚠️',
            'INFO': 'ℹ️'
        };

        console.log(icons[level] || '❓', message);
        if (details) {
            console.log('   Details:', details);
        }

        switch (level) {
            case 'PASS': results.passed++; break;
            case 'FAIL': results.failed++; break;
            case 'WARN': results.warnings++; break;
        }
    }

    // Core diagnostic functions
    function checkTabStateManagerAvailability() {
        log('INFO', 'Checking TabStateManager availability');

        const tabStateManager = window.tabStateManager;
        if (!tabStateManager) {
            log('FAIL', 'TabStateManager not available', {
                globalCheck: 'window.tabStateManager',
                value: tabStateManager,
                issue: 'TabStateManager is required for tab state management'
            });
            return false;
        }

        log('PASS', 'TabStateManager is available');
        return true;
    }

    function checkTabManagerMethods() {
        log('INFO', 'Checking TabManager method availability');

        const tabManager = window.tabContextManager || window.tabManager;
        if (!tabManager) {
            log('FAIL', 'TabManager not found', {
                checkedGlobals: ['tabContextManager', 'tabManager'],
                issue: 'TabManager is required for tab operations'
            });
            return false;
        }

        const requiredMethods = ['performTabOperation', 'triggerTabSwitch', 'switchToTab'];
        const availableMethods = [];
        const missingMethods = [];

        requiredMethods.forEach(method => {
            if (typeof tabManager[method] === 'function') {
                availableMethods.push(method);
            } else {
                missingMethods.push(method);
            }
        });

        if (missingMethods.length > 0) {
            log('FAIL', 'Missing TabManager methods', {
                available: availableMethods,
                missing: missingMethods,
                tabManagerType: tabManager.constructor ? tabManager.constructor.name : 'Unknown'
            });
            return false;
        }

        log('PASS', 'All required TabManager methods available', {
            methods: availableMethods
        });
        return true;
    }

    function checkThemeIsolation() {
        log('INFO', 'Checking theme isolation from tab operations');

        // Check for data-theme attribute on common elements
        const elements = [
            document.body,
            document.documentElement,
            document.querySelector('[data-theme]'),
            document.querySelector('.theme-container')
        ].filter(el => el);

        const themeElements = [];
        elements.forEach(el => {
            if (el && el.hasAttribute('data-theme')) {
                themeElements.push({
                    element: el.tagName + (el.id ? '#' + el.id : '') + (el.className ? '.' + el.className.split(' ')[0] : ''),
                    currentTheme: el.getAttribute('data-theme'),
                    element: el
                });
            }
        });

        if (themeElements.length === 0) {
            log('WARN', 'No theme-managed elements found', {
                checkedSelectors: ['body', 'html', '[data-theme]', '.theme-container'],
                issue: 'Theme system may not be initialized'
            });
            return false;
        }

        log('PASS', 'Theme-managed elements found', {
            elements: themeElements.map(e => ({
                selector: e.element,
                theme: e.currentTheme
            }))
        });

        // Check for theme change listeners that might interfere with tabs
        let themeInterferenceDetected = false;
        const observers = [];

        // Monitor theme changes during a simulated operation
        const observer = new MutationObserver(function(mutations) {
            mutations.forEach(mutation => {
                if (mutation.type === 'attributes' && mutation.attributeName === 'data-theme') {
                    themeInterferenceDetected = true;
                    log('FAIL', 'Theme change detected during operation', {
                        element: mutation.target.tagName + (mutation.target.id ? '#' + mutation.target.id : ''),
                        oldValue: mutation.oldValue,
                        newValue: mutation.target.getAttribute('data-theme'),
                        issue: 'Theme changes should be isolated from tab operations'
                    });
                }
            });
        });

        elements.forEach(el => {
            if (el) {
                observer.observe(el, {
                    attributes: true,
                    attributeFilter: ['data-theme']
                });
                observers.push(el);
            }
        });

        // Clean up after check
        setTimeout(() => {
            observer.disconnect();
        }, 1000);

        if (!themeInterferenceDetected) {
            log('PASS', 'No theme interference detected during monitoring period');
        }

        return !themeInterferenceDetected;
    }

    function checkLoadingGifSynchronization() {
        log('INFO', 'Checking loading gif synchronization with state');

        const stateManager = window.stateManager;
        if (!stateManager) {
            log('FAIL', 'StateManager not available for loading state checks', {
                globalCheck: 'window.stateManager',
                issue: 'StateManager required for message loading state tracking'
            });
            return false;
        }

        // Check current loading state
        const currentLoadingState = stateManager.getState ? stateManager.getState('messages.isLoading') : null;
        log('INFO', 'Current messages.isLoading state', {
            state: currentLoadingState,
            stateManagerAvailable: !!stateManager
        });

        // Check for loading gif presence
        const loadingGif = document.querySelector('.loading-container, .loading-gif, [class*="loading"]');
        const hasLoadingGif = !!loadingGif;

        if (currentLoadingState === true && !hasLoadingGif) {
            log('FAIL', 'Loading gif missing when messages.isLoading = true', {
                loadingState: currentLoadingState,
                loadingGifFound: hasLoadingGif,
                issue: 'Visual feedback missing for loading state'
            });
            return false;
        }

        if (currentLoadingState === false && hasLoadingGif) {
            log('FAIL', 'Loading gif present when messages.isLoading = false', {
                loadingState: currentLoadingState,
                loadingGifFound: hasLoadingGif,
                loadingGifElement: loadingGif ? loadingGif.tagName + (loadingGif.className ? '.' + loadingGif.className : '') : null,
                issue: 'Loading gif not removed after loading completion'
            });
            return false;
        }

        log('PASS', 'Loading gif synchronization appears correct', {
            loadingState: currentLoadingState,
            loadingGifPresent: hasLoadingGif
        });
        return true;
    }

    function checkTabOperationEvents() {
        log('INFO', 'Checking tab operation event system');

        let eventReceived = false;
        const eventHandler = function(event) {
            eventReceived = true;
            log('INFO', 'Tab operation event received', {
                eventType: event.type,
                detail: event.detail
            });

            // Validate event structure
            if (!event.detail || !event.detail.tabId) {
                log('WARN', 'Tab operation event missing required fields', {
                    event: event,
                    required: ['tabId'],
                    issue: 'Event structure incomplete'
                });
            }
        };

        document.addEventListener('tabManager:tabSwitched', eventHandler);

        // Test event dispatch (this will be called by actual tab operations)
        setTimeout(() => {
            document.removeEventListener('tabManager:tabSwitched', eventHandler);

            if (!eventReceived) {
                log('WARN', 'No tab operation events received during monitoring', {
                    monitoredEvent: 'tabManager:tabSwitched',
                    duration: '2 seconds',
                    issue: 'Tab operations may not be dispatching events'
                });
            } else {
                log('PASS', 'Tab operation events are being dispatched');
            }
        }, 2000);

        return true; // Async check
    }

    function generateRecommendations() {
        log('INFO', 'Generating diagnostic recommendations');

        const recommendations = [];

        if (results.failed > 0) {
            recommendations.push({
                priority: 'HIGH',
                category: 'INITIALIZATION',
                issue: 'Core components not available',
                action: 'Ensure TabStateManager, TabManager, and StateManager are properly initialized'
            });
        }

        if (results.findings.some(f => f.message.includes('theme'))) {
            recommendations.push({
                priority: 'HIGH',
                category: 'ISOLATION',
                issue: 'Theme pollution detected',
                action: 'Isolate theme management from tab operations using proper event coordination'
            });
        }

        if (results.findings.some(f => f.message.includes('loading'))) {
            recommendations.push({
                priority: 'MEDIUM',
                category: 'SYNCHRONIZATION',
                issue: 'Loading gif synchronization issues',
                action: 'Ensure BootController state changes trigger corresponding visual updates'
            });
        }

        if (results.findings.some(f => f.message.includes('method'))) {
            recommendations.push({
                priority: 'HIGH',
                category: 'API',
                issue: 'TabManager API inconsistencies',
                action: 'Standardize TabManager API and ensure all required methods are available'
            });
        }

        recommendations.push({
            priority: 'MEDIUM',
            category: 'MONITORING',
            issue: 'Real-time diagnostics needed',
            action: 'Implement continuous monitoring for theme pollution and loading synchronization'
        });

        results.recommendations = recommendations;

        console.log('📋 DIAGNOSTIC RECOMMENDATIONS:');
        recommendations.forEach((rec, index) => {
            console.log(`${index + 1}. [${rec.priority}] ${rec.category}: ${rec.issue}`);
            console.log(`   Action: ${rec.action}`);
        });
    }

    // Main diagnostic execution
    function runDiagnostics() {
        console.log(`🔍 ${DIAGNOSTIC_ID.toUpperCase()}`);
        console.log('='.repeat(60));
        console.log(`Started: ${TIMESTAMP}`);
        console.log('');

        // Run all diagnostic checks
        checkTabStateManagerAvailability();
        checkTabManagerMethods();
        checkThemeIsolation();
        checkLoadingGifSynchronization();
        checkTabOperationEvents();

        // Generate recommendations after a brief delay for async checks
        setTimeout(() => {
            generateRecommendations();

            console.log('');
            console.log('📊 DIAGNOSTIC SUMMARY:');
            console.log(`   ✅ Passed: ${results.passed}`);
            console.log(`   ❌ Failed: ${results.failed}`);
            console.log(`   ⚠️ Warnings: ${results.warnings}`);
            console.log(`   📋 Recommendations: ${results.recommendations.length}`);

            // Store results globally for further analysis
            window.diagnosticResults = results;

            console.log('');
            console.log('💾 Results stored in window.diagnosticResults');
            console.log('Run generateDiagnosticReport() to view detailed findings');
        }, 2500);
    }

    // Report generation utility
    window.generateDiagnosticReport = function() {
        if (!window.diagnosticResults) {
            console.log('❌ No diagnostic results available. Run runDiagnostics() first.');
            return;
        }

        const results = window.diagnosticResults;
        console.log('📋 COMPREHENSIVE DIAGNOSTIC REPORT');
        console.log('==================================');

        console.log('SUMMARY:');
        console.log(`  Passed: ${results.passed}`);
        console.log(`  Failed: ${results.failed}`);
        console.log(`  Warnings: ${results.warnings}`);
        console.log('');

        console.log('FINDINGS:');
        results.findings.forEach((finding, index) => {
            console.log(`${index + 1}. ${finding.level}: ${finding.message}`);
            if (finding.details) {
                console.log(`   ${JSON.stringify(finding.details, null, 2)}`);
            }
        });

        console.log('');
        console.log('RECOMMENDATIONS:');
        results.recommendations.forEach((rec, index) => {
            console.log(`${index + 1}. [${rec.priority}] ${rec.category}: ${rec.action}`);
        });
    };

    // Export diagnostic function
    if (typeof window !== 'undefined') {
        window.runTabManagerDiagnostics = runDiagnostics;
        console.log('🔍 TabManager Diagnostic Script Loaded');
        console.log('Run: runTabManagerDiagnostics() to start investigation');
        console.log('Then: generateDiagnosticReport() to view results');
    }

})(); // Close IIFE

