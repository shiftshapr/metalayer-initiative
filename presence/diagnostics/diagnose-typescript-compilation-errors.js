// TypeScript Compilation Errors Diagnostic Script
// Pure JavaScript diagnostic script for browser console execution
// Targets root cause identification for TypeScript compilation failures

(function() {
    'use strict';

    // Diagnostic Script Template - Pure JavaScript for Browser Console
    const DIAGNOSTIC_ID = 'typescript-compilation-errors-diagnostic';
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

    // Error patterns to check for
    const errorPatterns = {
        TS2558: 'Generic type arguments mismatch',
        TS2591: 'Cannot find name (missing type definitions)',
        TS2352: 'Type conversion mismatch',
        TS2339: 'Property does not exist on type',
        TS2554: 'Wrong number of arguments',
        TS2345: 'Argument type mismatch',
        TS2551: 'Property name suggestion (camelCase vs snake_case)',
        TS2353: 'Object literal property mismatch',
        TS2358: 'Instanceof type error',
        TS6133: 'Unused variable/parameter',
        TS2323: 'Cannot redeclare exported variable',
        TS2484: 'Export declaration conflict',
        TS2307: 'Cannot find module',
        TS2304: 'Cannot find name (Chrome API)',
        TS2503: 'Cannot find namespace',
        TS2532: 'Object is possibly undefined'
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
    function checkTypeScriptInstallation() {
        log('INFO', 'Checking TypeScript installation and configuration');

        // Check if tsc command is available (this would need to be run in Node.js context)
        log('INFO', 'TypeScript availability check deferred to Node.js environment');

        // Check for tsconfig.json
        try {
            const configCheck = window.tsconfigExists || false;
            if (configCheck) {
                log('PASS', 'tsconfig.json found');
            } else {
                log('WARN', 'tsconfig.json not accessible from browser context');
            }
        } catch (e) {
            log('WARN', 'Cannot check tsconfig.json from browser context');
        }

        return true; // Async check
    }

    function analyzeCompilationErrors(errorOutput) {
        log('INFO', 'Analyzing TypeScript compilation error patterns');

        if (!errorOutput || typeof errorOutput !== 'string') {
            log('WARN', 'No error output provided for analysis');
            return false;
        }

        const lines = errorOutput.split('\n');
        const errorSummary = {};
        const fileErrors = {};

        lines.forEach(line => {
            // Match TypeScript error pattern: file.ts(line,col): error TS####: message
            const errorMatch = line.match(/^(.+\.ts)\((\d+),(\d+)\):\s+error\s+(TS\d+):\s+(.+)$/);
            if (errorMatch) {
                const [, file, lineNum, col, errorCode, message] = errorMatch;

                if (!errorSummary[errorCode]) {
                    errorSummary[errorCode] = { count: 0, description: errorPatterns[errorCode] || 'Unknown error type' };
                }
                errorSummary[errorCode].count++;

                if (!fileErrors[file]) {
                    fileErrors[file] = [];
                }
                fileErrors[file].push({
                    line: parseInt(lineNum),
                    column: parseInt(col),
                    errorCode: errorCode,
                    message: message
                });
            }
        });

        // Analyze error patterns
        const totalErrors = Object.values(errorSummary).reduce((sum, err) => sum + err.count, 0);

        if (totalErrors === 0) {
            log('PASS', 'No TypeScript compilation errors detected');
            return true;
        }

        log('FAIL', `Found ${totalErrors} TypeScript compilation errors across ${Object.keys(fileErrors).length} files`, {
            errorSummary: errorSummary,
            affectedFiles: Object.keys(fileErrors),
            mostCommonErrors: Object.entries(errorSummary)
                .sort(([,a], [,b]) => b.count - a.count)
                .slice(0, 5)
        });

        // Analyze specific problem areas
        analyzeSpecificIssues(fileErrors, errorSummary);

        return false;
    }

    function analyzeSpecificIssues(fileErrors, errorSummary) {
        log('INFO', 'Analyzing specific error patterns and root causes');

        // Check for MessagesModule issues
        const messagesModuleErrors = fileErrors['src/features/MessagesModule.ts'];
        if (messagesModuleErrors) {
            const propertyErrors = messagesModuleErrors.filter(err => err.errorCode === 'TS2339' && err.message.includes('does not exist on type'));
            if (propertyErrors.length > 10) {
                log('FAIL', 'MessagesModule has extensive property mismatch issues', {
                    propertyErrors: propertyErrors.length,
                    issue: 'RawMessagePayload type definition likely out of sync with actual data structure',
                    pattern: 'Type definition uses different property names than runtime data'
                });
            }
        }

        // Check for export conflicts
        const exportConflicts = Object.values(errorSummary).find(err => err.description === 'Export declaration conflict' || err.description === 'Cannot redeclare exported variable');
        if (exportConflicts && exportConflicts.count > 5) {
            log('FAIL', 'Multiple export declaration conflicts detected', {
                conflicts: exportConflicts.count,
                issue: 'Type definitions have duplicate exports, likely from merge conflicts or refactoring',
                affectedFiles: Object.keys(fileErrors).filter(file => fileErrors[file].some(err => err.errorCode === 'TS2484' || err.errorCode === 'TS2323'))
            });
        }

        // Check for Chrome API issues
        const chromeErrors = Object.values(fileErrors).flat().filter(err => err.message.includes('Cannot find name \'chrome\''));
        if (chromeErrors.length > 0) {
            log('FAIL', 'Chrome API type declarations missing', {
                chromeErrors: chromeErrors.length,
                issue: 'Chrome extension APIs not properly typed for TypeScript',
                solution: 'Add @types/chrome or define Chrome API interfaces'
            });
        }

        // Check for module resolution issues
        const moduleErrors = Object.values(fileErrors).flat().filter(err => err.errorCode === 'TS2307');
        if (moduleErrors.length > 0) {
            log('FAIL', 'Module resolution issues detected', {
                moduleErrors: moduleErrors.length,
                issue: 'Import paths incorrect or modules not properly exported',
                affectedImports: moduleErrors.map(err => err.message.match(/Cannot find module '([^']+)'/)?.[1]).filter(Boolean)
            });
        }
    }

    function generateErrorRecommendations(errorSummary, fileErrors) {
        log('INFO', 'Generating TypeScript error resolution recommendations');

        const recommendations = [];

        // Priority 1: Type definition synchronization
        if (Object.values(fileErrors).some(errors => errors.some(err => err.errorCode === 'TS2339' && err.message.includes('RawMessagePayload')))) {
            recommendations.push({
                priority: 'HIGH',
                category: 'TYPE_DEFINITIONS',
                issue: 'RawMessagePayload interface out of sync with runtime data',
                action: 'Update RawMessagePayload interface to match actual API response structure, including snake_case properties'
            });
        }

        // Priority 2: Export conflicts
        const conflictCount = Object.values(errorSummary).reduce((sum, err) => {
            if (err.description === 'Export declaration conflict' || err.description === 'Cannot redeclare exported variable') {
                return sum + err.count;
            }
            return sum;
        }, 0);

        if (conflictCount > 5) {
            recommendations.push({
                priority: 'HIGH',
                category: 'EXPORTS',
                issue: 'Multiple export conflicts in type definitions',
                action: 'Review and consolidate duplicate exports in types.ts files, remove conflicting declarations'
            });
        }

        // Priority 3: Chrome API types
        if (Object.values(fileErrors).some(errors => errors.some(err => err.message.includes('chrome')))) {
            recommendations.push({
                priority: 'MEDIUM',
                category: 'CHROME_API',
                issue: 'Missing Chrome API type declarations',
                action: 'Install @types/chrome or define custom Chrome API interfaces for extension development'
            });
        }

        // Priority 4: Module resolution
        if (Object.values(errorSummary).some(err => err.description === 'Cannot find module')) {
            recommendations.push({
                priority: 'MEDIUM',
                category: 'MODULE_RESOLUTION',
                issue: 'Import path issues',
                action: 'Verify import paths are correct and modules are properly exported from their source files'
            });
        }

        // Priority 5: Generic type issues
        if (errorSummary['TS2558']) {
            recommendations.push({
                priority: 'MEDIUM',
                category: 'GENERICS',
                issue: 'Incorrect generic type arguments',
                action: 'Review generic type usage and ensure correct number of type parameters are provided'
            });
        }

        recommendations.push({
            priority: 'LOW',
            category: 'CODE_QUALITY',
            issue: 'Unused variables and parameters',
            action: 'Remove or prefix with underscore unused variables/parameters, or use @ts-ignore if intentionally unused'
        });

        results.recommendations = recommendations;

        console.log('📋 TYPESCRIPT ERROR RESOLUTION RECOMMENDATIONS:');
        recommendations.forEach((rec, index) => {
            console.log(`${index + 1}. [${rec.priority}] ${rec.category}: ${rec.issue}`);
            console.log(`   Action: ${rec.action}`);
        });
    }

    function checkTypeScriptConfig() {
        log('INFO', 'Checking TypeScript configuration health');

        // This would need to be run in Node.js, but we can check basic config concepts
        log('INFO', 'TypeScript configuration check deferred to Node.js environment');

        // Check for common config issues that might cause these errors
        const potentialIssues = [
            'strict mode enabled but code not compliant',
            'module resolution set to node but paths incorrect',
            'typeRoots not including @types/chrome for Chrome extensions'
        ];

        potentialIssues.forEach(issue => {
            log('INFO', `Potential config issue: ${issue}`);
        });

        return true;
    }

    // Main diagnostic execution
    function runTypeScriptDiagnostics(compilationOutput) {
        console.log(`🔍 ${DIAGNOSTIC_ID.toUpperCase()}`);
        console.log('='.repeat(60));
        console.log(`Started: ${TIMESTAMP}`);
        console.log('');

        // Run all diagnostic checks
        checkTypeScriptInstallation();
        checkTypeScriptConfig();

        if (compilationOutput) {
            analyzeCompilationErrors(compilationOutput);
        } else {
            log('WARN', 'No compilation output provided - run with: runTypeScriptDiagnostics(tscOutput)');
        }

        // Generate recommendations after analysis
        setTimeout(() => {
            if (results.findings.some(f => f.level === 'FAIL')) {
                generateErrorRecommendations(
                    // Extract error summary from findings
                    results.findings.reduce((summary, finding) => {
                        if (finding.details && finding.details.errorSummary) {
                            return finding.details.errorSummary;
                        }
                        return summary;
                    }, {}),
                    // Extract file errors from findings
                    results.findings.reduce((files, finding) => {
                        if (finding.details && finding.details.affectedFiles) {
                            finding.details.affectedFiles.forEach(file => {
                                if (!files[file]) files[file] = [];
                            });
                        }
                        return files;
                    }, {})
                );
            }

            console.log('');
            console.log('📊 DIAGNOSTIC SUMMARY:');
            console.log(`   ✅ Passed: ${results.passed}`);
            console.log(`   ❌ Failed: ${results.failed}`);
            console.log(`   ⚠️ Warnings: ${results.warnings}`);
            console.log(`   📋 Recommendations: ${results.recommendations.length}`);

            // Store results globally for further analysis
            window.tsDiagnosticResults = results;

            console.log('');
            console.log('💾 Results stored in window.tsDiagnosticResults');
            console.log('Run generateTypeScriptReport() to view detailed findings');
        }, 500);
    }

    // Report generation utility
    window.generateTypeScriptReport = function() {
        if (!window.tsDiagnosticResults) {
            console.log('❌ No TypeScript diagnostic results available. Run runTypeScriptDiagnostics() first.');
            return;
        }

        const results = window.tsDiagnosticResults;
        console.log('📋 COMPREHENSIVE TYPESCRIPT DIAGNOSTIC REPORT');
        console.log('==============================================');

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
        window.runTypeScriptDiagnostics = runTypeScriptDiagnostics;
        console.log('🔍 TypeScript Compilation Diagnostic Script Loaded');
        console.log('Usage: runTypeScriptDiagnostics(compilationErrorOutputString)');
        console.log('Then: generateTypeScriptReport() to view results');
    }

})(); // Close IIFE

