#!/usr/bin/env ts-node
/**
 * Diagnostic script for Slice 11: Features Type Errors
 * Identifies root causes of type errors in feature modules
 *
 * Usage:
 *   npx tsx presence/src/scripts/diagnose-features-types.ts [files...]
 *   npx tsx presence/src/scripts/diagnose-features-types.ts --help
 */
import { execSync } from 'child_process';
import * as path from 'path';
import { parseCLIArgs, printHelp } from './helpers/cli-utils';
const FEATURE_FILES = [
    'presence/src/features/AnchorHighlighter.ts',
    'presence/src/features/AuthManager.ts',
    'presence/src/features/AuthModule.ts',
    'presence/src/features/CursorVisualSettingsManager.ts',
    'presence/src/features/MessagesModuleServiceIntegration.ts',
    'presence/src/features/NotificationManager.ts',
    'presence/src/features/PeopleModule.ts',
    'presence/src/features/ProfileManager.ts',
    'presence/src/features/SubscriptionManager.ts',
    'presence/src/features/TabManager/AppStoreIntegration.ts',
    'presence/src/features/TabManager/TabManagerModal.ts',
    'presence/src/features/TabManager/TabManager.ts',
    'presence/src/features/UIManager.ts',
    'presence/src/features/UserHoverModal.ts',
    'presence/src/features/social-share/platforms/base/BasePlatformAdapter.ts',
];
function diagnoseTypeErrors() {
    const reports = [];
    // Use full project type checking to catch cross-file errors
    let output = '';
    try {
        output = execSync('npx tsc --noEmit', {
            cwd: path.join(__dirname, '../..'),
            encoding: 'utf-8',
            stdio: 'pipe'
        }).toString();
    }
    catch (error) {
        // tsc exits with code 2 when errors are found, which is expected
        // Errors are written to stderr, not stdout
        if (error.stderr) {
            output = error.stderr.toString();
        }
        else if (error.stdout) {
            output = error.stdout.toString();
        }
        else if (error.message) {
            output = error.message;
        }
    }
    // Parse errors - handle both stdout and stderr output
    const errorLines = output.split('\n').filter(line => line.includes('error TS'));
    // Also check for cross-file errors that might reference our files indirectly
    const crossFileErrors = [];
    for (const file of FEATURE_FILES) {
        // Direct errors in the file (errors where the file path matches exactly)
        const fileErrors = [];
        for (const line of errorLines) {
            // Extract file path from error line (format: "filepath(line,col): error...")
            const fileMatch = line.match(/^([^(]+)\(/);
            if (fileMatch && fileMatch[1]) {
                const errorFile = fileMatch[1].trim();
                // Normalize paths for comparison
                const normalizedErrorFile = errorFile.replace(/^presence\//, '');
                const normalizedTargetFile = file.replace(/^presence\//, '');
                if (normalizedErrorFile === normalizedTargetFile) {
                    const match = line.match(/\((\d+),\d+\): error (TS\d+): (.+)/);
                    if (match && match[1] && match[2] && match[3]) {
                        fileErrors.push({
                            line: parseInt(match[1], 10),
                            code: match[2],
                            message: match[3],
                            crossFile: false
                        });
                    }
                }
            }
        }
        // Check for cross-file errors (errors in other files that import from this file)
        const fileName = path.basename(file, '.ts');
        const normalizedTargetFile = file.replace(/^presence\//, '');
        const crossRefErrors = [];
        for (const line of errorLines) {
            // Extract file path from error line
            const fileMatch = line.match(/^([^(]+)\(/);
            if (fileMatch && fileMatch[1]) {
                const errorFile = fileMatch[1].trim().replace(/^presence\//, '');
                // Skip if it's the same file
                if (errorFile === normalizedTargetFile) {
                    continue;
                }
                // Check if error message mentions this file's exports or imports
                const errorIndex = line.indexOf(': error');
                if (errorIndex >= 0) {
                    const errorMessage = line.substring(errorIndex + 7);
                    const fileBase = file.replace(/\.ts$/, '').replace(/^presence\//, '');
                    if (errorMessage.includes(fileName) ||
                        errorMessage.includes(`from '${fileBase}'`) ||
                        errorMessage.includes(`from "${fileBase}"`)) {
                        const match = line.match(/\((\d+),\d+\): error (TS\d+): (.+)/);
                        if (match && match[1] && match[2] && match[3]) {
                            crossRefErrors.push({
                                line: parseInt(match[1], 10),
                                code: match[2],
                                message: match[3],
                                crossFile: true
                            });
                        }
                    }
                }
            }
        }
        const allErrors = [...fileErrors, ...crossRefErrors];
        if (allErrors.length > 0) {
            reports.push({ file, errors: allErrors });
        }
    }
    return reports;
}
function main() {
    const parsedArgs = parseCLIArgs();
    if (parsedArgs.options.help) {
        printHelp('diagnose-features-types.ts', 'Diagnostic script for Slice 11: Features Type Errors. Identifies root causes of type errors in feature modules.', [
            'npx tsx presence/src/scripts/diagnose-features-types.ts',
            'npx tsx presence/src/scripts/diagnose-features-types.ts --verbose'
        ]);
        process.exit(0);
    }
    console.log('🔍 Diagnosing TypeScript errors in feature files (Slice 11)...\n');
    console.log('Using full project type checking to detect cross-file errors...\n');
    const reports = diagnoseTypeErrors();
    if (reports.length === 0) {
        console.log('✅ No type errors found in feature files!');
        console.log('✅ No cross-file dependency errors detected!');
        process.exit(0);
    }
    console.log(`Found errors in ${reports.length} file(s):\n`);
    for (const report of reports) {
        console.log(`📄 ${report.file}`);
        console.log(`   ${report.errors.length} error(s):`);
        for (const error of report.errors) {
            const crossFileMarker = error.crossFile ? ' [CROSS-FILE]' : '';
            console.log(`   - Line ${error.line}: [${error.code}] ${error.message}${crossFileMarker}`);
        }
        console.log();
    }
    // Categorize errors
    const errorTypes = new Map();
    let crossFileCount = 0;
    for (const report of reports) {
        for (const error of report.errors) {
            errorTypes.set(error.code, (errorTypes.get(error.code) || 0) + 1);
            if (error.crossFile) {
                crossFileCount++;
            }
        }
    }
    console.log('Error type distribution:');
    for (const [code, count] of Array.from(errorTypes.entries()).sort((a, b) => b[1] - a[1])) {
        console.log(`  ${code}: ${count}`);
    }
    if (crossFileCount > 0) {
        console.log(`\n⚠️  ${crossFileCount} cross-file dependency error(s) detected`);
        console.log('   These errors occur in files that import from feature files.');
    }
    process.exit(reports.length > 0 ? 1 : 0);
}
if (require.main === module) {
    main();
}
export { diagnoseTypeErrors };
//# sourceMappingURL=diagnose-features-types.js.map