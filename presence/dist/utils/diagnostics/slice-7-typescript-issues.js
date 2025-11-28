/**
 * DIAGNOSTIC SCRIPT: Slice 7 TypeScript Best Practices Issues
 * Identifies all TypeScript violations in Utils module
 *
 * Run: npx tsx presence/src/utils/diagnostics/slice-7-typescript-issues.ts
 */
import { readFileSync, statSync } from 'fs';
import { join } from 'path';
const issues = [];
const utilsDir = join(__dirname, '..');
const filesToCheck = [
    'UserPreferencesManager.ts',
    'ThemeChangeTracker.ts',
    'UnifiedStorageSync.ts',
    'AvatarUtils.ts',
    'Logger.ts',
    'ApiBoundaryHelpers.ts',
    'UrlUtils.ts',
    'UserUtils.ts',
    'provenance/ProvenanceLinkInjector.ts'
];
function checkFile(filePath, fileName) {
    const content = readFileSync(filePath, 'utf-8');
    const lines = content.split('\n');
    lines.forEach((line, index) => {
        const lineNum = index + 1;
        const trimmed = line.trim();
        // Check for explicit any types
        if (/\bany\b/.test(line) && !line.includes('//')) {
            // Skip comments and string literals
            if (!trimmed.startsWith('//') && !trimmed.startsWith('*')) {
                issues.push({
                    file: fileName,
                    line: lineNum,
                    type: 'any',
                    code: trimmed,
                    context: lines.slice(Math.max(0, index - 2), Math.min(lines.length, index + 3)).join('\n')
                });
            }
        }
        // Check for 'as any' assertions
        if (/\bas\s+any\b/.test(line)) {
            issues.push({
                file: fileName,
                line: lineNum,
                type: 'as-any',
                code: trimmed,
                context: lines.slice(Math.max(0, index - 2), Math.min(lines.length, index + 3)).join('\n')
            });
        }
        // Check for (this as any)
        if (/\(this\s+as\s+any\)/.test(line)) {
            issues.push({
                file: fileName,
                line: lineNum,
                type: 'this-as-any',
                code: trimmed,
                context: lines.slice(Math.max(0, index - 2), Math.min(lines.length, index + 3)).join('\n')
            });
        }
        // Check for @ts-ignore
        if (/@ts-ignore/.test(line)) {
            issues.push({
                file: fileName,
                line: lineNum,
                type: 'ts-ignore',
                code: trimmed,
                context: lines.slice(Math.max(0, index - 2), Math.min(lines.length, index + 3)).join('\n')
            });
        }
        // Check for @ts-expect-error
        if (/@ts-expect-error/.test(line)) {
            issues.push({
                file: fileName,
                line: lineNum,
                type: 'ts-expect-error',
                code: trimmed,
                context: lines.slice(Math.max(0, index - 2), Math.min(lines.length, index + 3)).join('\n')
            });
        }
    });
}
// Check each file
filesToCheck.forEach(file => {
    const filePath = join(utilsDir, file);
    try {
        if (statSync(filePath).isFile()) {
            checkFile(filePath, file);
        }
    }
    catch (error) {
        console.warn(`⚠️  Could not check ${file}:`, error);
    }
});
// Generate report
console.log('\n=== SLICE 7 TYPESCRIPT ISSUES DIAGNOSTIC REPORT ===\n');
console.log(`Total issues found: ${issues.length}\n`);
const byType = issues.reduce((acc, issue) => {
    acc[issue.type] = (acc[issue.type] || 0) + 1;
    return acc;
}, {});
console.log('Issues by type:');
Object.entries(byType).forEach(([type, count]) => {
    console.log(`  ${type}: ${count}`);
});
console.log('\n=== DETAILED ISSUES ===\n');
const byFile = issues.reduce((acc, issue) => {
    const existing = acc[issue.file] ?? [];
    existing.push(issue);
    acc[issue.file] = existing;
    return acc;
}, {});
Object.entries(byFile).forEach(([file, fileIssues]) => {
    console.log(`\n📄 ${file} (${fileIssues.length} issues):`);
    fileIssues.forEach(issue => {
        console.log(`  Line ${issue.line} [${issue.type}]: ${issue.code.substring(0, 80)}`);
    });
});
console.log('\n=== SUMMARY ===\n');
console.log(`Files with issues: ${Object.keys(byFile).length}`);
console.log(`Total issues: ${issues.length}`);
console.log('\n✅ Diagnostic complete\n');
// Export for programmatic use
export { issues, byFile, byType };
