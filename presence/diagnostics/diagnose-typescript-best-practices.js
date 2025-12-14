// TypeScript Best Practices Compliance Diagnostic Script
// Pure JavaScript diagnostic script for browser console execution
// Targets remaining TypeScript errors after initial fixes

(function() {
    'use strict';

    // Diagnostic Script Template - Pure JavaScript for Browser Console
    const DIAGNOSTIC_ID = 'typescript-best-practices-compliance';
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

    // Error patterns specific to remaining issues
    const remainingErrorPatterns = {
        'expression of type void cannot be tested': 'Void truthiness anti-pattern',
        'Argument of type Message is not assignable': 'Type mismatch in message handling',
        'Property does not exist on type Window': 'Missing global Window extensions',
        'has no properties in common with type EventListenerOptions': 'Incorrect event listener options',
        'Property url does not exist on type never': 'Type narrowing issues',
        'Property lastError does not exist': 'Incomplete Chrome API declarations'
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
    function analyzeVoidTruthinessIssues() {
        log('INFO', 'Analyzing void truthiness anti-patterns');

        // This is a compile-time issue, but we can check for common patterns
        const commonPatterns = [
            'functionCall() && doSomething()', // Void function in conditional
            'voidFunction() || fallback()',   // Void function in logical OR
            'if (asyncOperation())'           // Async function without await
        ];

        log('INFO', 'Void truthiness patterns to check:', {
            patterns: commonPatterns,
            note: 'These patterns typically cause "expression of type void cannot be tested" errors'
        });

        // Check for actual usage patterns in global scope
        if (typeof window !== 'undefined') {
            const globalFunctions = Object.keys(window).filter(key => typeof window[key] === 'function');
            log('INFO', 'Available global functions that might be misused:', {
                functions: globalFunctions.slice(0, 10), // First 10
                total: globalFunctions.length
            });
        }

        return true;
    }

    function analyzeMessageTypeMismatches() {
        log('INFO', 'Analyzing Message type mismatches');

        // Check for common Message interface issues
        const expectedMessageProperties = [
            'id', 'content', 'authorId', 'authorEmail', 'authorHandle',
            'conversationId', 'communityId', 'createdAt', 'updatedAt',
            'reactions', 'bookmarkCount', 'isBookmarked'
        ];

        log('INFO', 'Expected Message properties:', {
            properties: expectedMessageProperties,
            note: 'Functions expecting string but receiving Message objects typically need toString() or property access'
        });

        // Check if common global objects have message-related methods
        if (typeof window !== 'undefined') {
            const messageRelated = Object.keys(window).filter(key =>
                key.toLowerCase().includes('message') ||
                key.toLowerCase().includes('msg')
            );
            log('INFO', 'Message-related global objects:', {
                objects: messageRelated
            });
        }

        return true;
    }

    function analyzeGlobalWindowExtensions() {
        log('INFO', 'Analyzing missing Window interface extensions');

        const missingWindowProperties = [
            'openQuoteModal', 'showReactionPicker', 'previousView', 'openRepostModal'
        ];

        log('INFO', 'Commonly missing Window properties:', {
            properties: missingWindowProperties,
            note: 'These need to be added to Window interface in type definitions'
        });

        // Check current window properties
        if (typeof window !== 'undefined') {
            const presentProperties = missingWindowProperties.filter(prop => prop in window);
            const missingProperties = missingWindowProperties.filter(prop => !(prop in window));

            log('INFO', 'Window property analysis:', {
                present: presentProperties,
                missing: missingProperties,
                totalChecked: missingWindowProperties.length
            });
        }

        return true;
    }

    function analyzeEventListenerIssues() {
        log('INFO', 'Analyzing EventListener configuration issues');

        log('INFO', 'EventListenerOptions type mismatch patterns:', {
            commonIssues: [
                'Passing boolean instead of options object',
                'Missing capture/passive/once properties',
                'Incorrect options structure'
            ],
            note: 'addEventListener expects EventListenerOptions object, not primitive values'
        });

        return true;
    }

    function analyzeChromeAPIExtensions() {
        log('INFO', 'Analyzing Chrome API extension needs');

        const chromeProperties = ['lastError', 'runtime', 'tabs', 'storage'];

        log('INFO', 'Chrome API properties to verify:', {
            properties: chromeProperties,
            note: 'lastError and other properties need proper typing in Chrome namespace'
        });

        // Check if chrome is available
        if (typeof window !== 'undefined' && window.chrome) {
            const availableProperties = chromeProperties.filter(prop => prop in window.chrome);
            const missingProperties = chromeProperties.filter(prop => !(prop in window.chrome));

            log('INFO', 'Chrome API availability:', {
                available: availableProperties,
                missing: missingProperties
            });
        } else {
            log('WARN', 'Chrome API not available in current environment');
        }

        return true;
    }

    function generateBestPracticesRecommendations() {
        log('INFO', 'Generating TypeScript best practices recommendations');

        const recommendations = [
            {
                priority: 'HIGH',
                category: 'TYPE_SAFETY',
                issue: 'Void function truthiness checks',
                action: 'Replace void function calls in conditionals with proper async/await patterns or explicit boolean checks',
                example: 'if (await asyncOperation()) => if ((await asyncOperation()) !== undefined)'
            },
            {
                priority: 'HIGH',
                category: 'TYPE_DESIGN',
                issue: 'Message object passed where string expected',
                action: 'Use explicit property access: message.id or message.content instead of passing Message object',
                example: 'logMessage(message) => logMessage(message.content)'
            },
            {
                priority: 'MEDIUM',
                category: 'GLOBAL_TYPES',
                issue: 'Missing Window interface extensions',
                action: 'Extend Window interface in type definitions for application-specific global properties',
                example: 'interface Window { openQuoteModal?: Function; showReactionPicker?: Function; }'
            },
            {
                priority: 'MEDIUM',
                category: 'EVENT_HANDLING',
                issue: 'Incorrect EventListener options',
                action: 'Use proper EventListenerOptions object instead of boolean values',
                example: 'addEventListener("click", handler, true) => addEventListener("click", handler, { capture: true })'
            },
            {
                priority: 'LOW',
                category: 'CHROME_EXTENSIONS',
                issue: 'Incomplete Chrome API types',
                action: 'Extend Chrome namespace declarations for extension-specific APIs',
                example: 'declare namespace chrome { export const lastError: { message: string } | undefined; }'
            },
            {
                priority: 'HIGH',
                category: 'BEST_PRACTICES',
                issue: 'Implicit any parameters',
                action: 'Add explicit type annotations to all function parameters',
                example: 'function handler(e) => function handler(e: Event)'
            }
        ];

        results.recommendations = recommendations;

        console.log('📋 TYPESCRIPT BEST PRACTICES RECOMMENDATIONS:');
        recommendations.forEach((rec, index) => {
            console.log(`${index + 1}. [${rec.priority}] ${rec.category}: ${rec.issue}`);
            console.log(`   Action: ${rec.action}`);
            if (rec.example) {
                console.log(`   Example: ${rec.example}`);
            }
            console.log('');
        });
    }

    // Main diagnostic execution
    function runBestPracticesDiagnostic(errorOutput) {
        console.log(`🔍 ${DIAGNOSTIC_ID.toUpperCase()}`);
        console.log('='.repeat(70));
        console.log(`Started: ${TIMESTAMP}`);
        console.log('');

        // Run all diagnostic checks
        analyzeVoidTruthinessIssues();
        analyzeMessageTypeMismatches();
        analyzeGlobalWindowExtensions();
        analyzeEventListenerIssues();
        analyzeChromeAPIExtensions();

        if (errorOutput) {
            log('INFO', 'Error analysis from compilation output:', {
                totalErrors: errorOutput.split('\n').filter(line => line.includes('error TS')).length,
                sampleErrors: errorOutput.split('\n').slice(0, 5)
            });
        }

        // Generate recommendations
        setTimeout(() => {
            generateBestPracticesRecommendations();

            console.log('');
            console.log('📊 DIAGNOSTIC SUMMARY:');
            console.log(`   ✅ Passed: ${results.passed}`);
            console.log(`   ❌ Failed: ${results.failed}`);
            console.log(`   ⚠️ Warnings: ${results.warnings}`);
            console.log(`   📋 Recommendations: ${results.recommendations.length}`);

            // Store results globally for further analysis
            window.tsBestPracticesResults = results;

            console.log('');
            console.log('💾 Results stored in window.tsBestPracticesResults');
            console.log('Run generateBestPracticesReport() to view detailed findings');
        }, 500);
    }

    // Report generation utility
    window.generateBestPracticesReport = function() {
        if (!window.tsBestPracticesResults) {
            console.log('❌ No TypeScript best practices results available. Run runBestPracticesDiagnostic() first.');
            return;
        }

        const results = window.tsBestPracticesResults;
        console.log('📋 COMPREHENSIVE TYPESCRIPT BEST PRACTICES REPORT');
        console.log('================================================');

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
            console.log('');
        });

        console.log('RECOMMENDATIONS:');
        results.recommendations.forEach((rec, index) => {
            console.log(`${index + 1}. [${rec.priority}] ${rec.category}: ${rec.action}`);
            if (rec.example) {
                console.log(`   Example: ${rec.example}`);
            }
            console.log('');
        });
    };

    // Export diagnostic function
    if (typeof window !== 'undefined') {
        window.runBestPracticesDiagnostic = runBestPracticesDiagnostic;
        console.log('🔍 TypeScript Best Practices Diagnostic Script Loaded');
        console.log('Usage: runBestPracticesDiagnostic(compilationErrorOutputString)');
        console.log('Then: generateBestPracticesReport() to view results');
    }

})(); // Close IIFE

