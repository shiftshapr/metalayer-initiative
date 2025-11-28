/**
 * Diagnostic Script: Slice 5 TypeScript Best Practices Issues
 * Identifies all any types, window as any casts, and type suppressions in Slice 5 files
 *
 * Generated: 2025-01-24
 * Slice: 5 (Tab Manager & Other Features)
 */
import * as fs from 'fs';
import * as path from 'path';
const SLICE5_FILES = [
    'presence/src/features/TabManager/TabManager.ts',
    'presence/src/features/TabManager/TabManagerModal.ts',
    'presence/src/features/TabManager/TabConfiguration.ts',
    'presence/src/features/TabManager/initializeTabManager.ts',
    'presence/src/features/TabManager/AppStoreIntegration.ts',
    'presence/src/features/NotificationManager.ts',
    'presence/src/features/SubscriptionManager.ts',
    'presence/src/features/CommunitiesModule.ts',
    'presence/src/features/CommunityHelpers.ts',
    'presence/src/features/CommunityLoaders.ts',
];
function scanFile(filePath) {
    const issues = [];
    const fullPath = path.join(process.cwd(), filePath);
    if (!fs.existsSync(fullPath)) {
        console.warn(`⚠️  File not found: ${filePath}`);
        return issues;
    }
    const content = fs.readFileSync(fullPath, 'utf-8');
    const lines = content.split('\n');
    lines.forEach((line, index) => {
        const lineNum = index + 1;
        const trimmed = line.trim();
        // Check for window as any
        if (/(window\s+as\s+any|\(window\s+as\s+any\))/i.test(line)) {
            issues.push({
                file: filePath,
                line: lineNum,
                type: 'window-as-any',
                code: trimmed,
                context: getContext(lines, index, 3)
            });
        }
        // Check for : any type annotations
        if (/: any(\s|;|,|\)|=|>)/.test(line) && !trimmed.startsWith('//')) {
            // Exclude comments and string literals
            if (!trimmed.startsWith('*') && !trimmed.startsWith('//')) {
                issues.push({
                    file: filePath,
                    line: lineNum,
                    type: 'any-type',
                    code: trimmed,
                    context: getContext(lines, index, 3)
                });
            }
        }
        // Check for as any assertions
        if (/\s+as\s+any(\s|;|,|\))/.test(line) && !/(window\s+as\s+any)/.test(line)) {
            issues.push({
                file: filePath,
                line: lineNum,
                type: 'any-type',
                code: trimmed,
                context: getContext(lines, index, 3)
            });
        }
        // Check for @ts-ignore
        if (/@ts-ignore/.test(line)) {
            issues.push({
                file: filePath,
                line: lineNum,
                type: 'ts-ignore',
                code: trimmed,
                context: getContext(lines, index, 3)
            });
        }
        // Check for @ts-expect-error
        if (/@ts-expect-error/.test(line)) {
            issues.push({
                file: filePath,
                line: lineNum,
                type: 'ts-expect-error',
                code: trimmed,
                context: getContext(lines, index, 3)
            });
        }
        // Check for function parameters with any
        if (/\([^)]*:\s*any[^)]*\)/.test(line)) {
            issues.push({
                file: filePath,
                line: lineNum,
                type: 'any-parameter',
                code: trimmed,
                context: getContext(lines, index, 3)
            });
        }
        // Check for return types with any
        if (/:\s*any(\s*[={;]|$)/.test(line) && /=>/.test(line)) {
            issues.push({
                file: filePath,
                line: lineNum,
                type: 'any-return',
                code: trimmed,
                context: getContext(lines, index, 3)
            });
        }
    });
    return issues;
}
function getContext(lines, index, contextLines) {
    const start = Math.max(0, index - contextLines);
    const end = Math.min(lines.length - 1, index + contextLines);
    return lines.slice(start, end + 1)
        .map((line, i) => `${start + i + 1}: ${line}`)
        .join('\n');
}
function main() {
    console.log('🔍 Slice 5 TypeScript Best Practices Diagnostic\n');
    console.log('Scanning files...\n');
    const allIssues = [];
    const issueCounts = {
        'any-type': 0,
        'window-as-any': 0,
        'ts-ignore': 0,
        'ts-expect-error': 0,
        'any-parameter': 0,
        'any-return': 0
    };
    SLICE5_FILES.forEach(file => {
        const issues = scanFile(file);
        allIssues.push(...issues);
        issues.forEach(issue => {
            issueCounts[issue.type]++;
        });
        if (issues.length > 0) {
            console.log(`📄 ${file}: ${issues.length} issue(s)`);
        }
    });
    console.log('\n📊 Summary:');
    console.log(`Total issues found: ${allIssues.length}`);
    Object.entries(issueCounts).forEach(([type, count]) => {
        if (count > 0) {
            console.log(`  ${type}: ${count}`);
        }
    });
    console.log('\n📋 Detailed Issues:\n');
    allIssues.forEach(issue => {
        console.log(`\n${issue.file}:${issue.line} [${issue.type}]`);
        console.log(`  Code: ${issue.code}`);
        console.log(`  Context:\n${issue.context.split('\n').map(l => `    ${l}`).join('\n')}`);
    });
    // Write results to file
    const resultsPath = path.join(process.cwd(), 'presence/src/diagnostics/slice5-issues.json');
    fs.writeFileSync(resultsPath, JSON.stringify({
        timestamp: new Date().toISOString(),
        totalIssues: allIssues.length,
        issueCounts,
        issues: allIssues
    }, null, 2));
    console.log(`\n✅ Results saved to: ${resultsPath}`);
    return allIssues.length;
}
if (require.main === module) {
    const exitCode = main();
    process.exit(exitCode > 0 ? 1 : 0);
}
export { scanFile };
//# sourceMappingURL=diagnose-slice5-typescript-issues.js.map