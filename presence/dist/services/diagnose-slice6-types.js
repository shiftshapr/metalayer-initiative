/**
 * Diagnostic Script for Slice 6: Services Module TypeScript Issues
 *
 * Identifies:
 * - @ts-ignore and @ts-expect-error suppressions
 * - `as any` type assertions
 * - `window as any` casts
 * - Missing type definitions for Supabase query builders
 */
import { readFileSync } from 'fs';
import { join } from 'path';
const servicesDir = join(__dirname, '.');
const filesToCheck = [
    'SupabaseService.ts',
    'SupabaseRealtimeClientFix.ts',
    'RealtimeSubscriptionService.ts',
    'MessageStore.ts',
    'MessageActionListenersService.ts',
    'APIService.ts',
    'MessageRendererService.ts',
    'MessageLoadingService.ts'
];
const issues = [];
function analyzeFile(filePath, fileName) {
    if (!filePath || !fileName) {
        console.warn('⚠️  Warning: Invalid file path or name provided to analyzeFile');
        return;
    }
    try {
        const content = readFileSync(filePath, 'utf-8');
        if (!content) {
            console.warn(`⚠️  Warning: Empty file: ${fileName}`);
            return;
        }
        const lines = content.split('\n');
        lines.forEach((line, index) => {
            const lineNum = index + 1;
            // Check for suppressions
            if (line.includes('@ts-ignore') || line.includes('@ts-expect-error')) {
                issues.push({
                    file: fileName,
                    line: lineNum,
                    type: 'suppression',
                    code: line.trim(),
                    context: lines.slice(Math.max(0, index - 2), Math.min(lines.length, index + 3)).join('\n')
                });
            }
            // Check for `as any` assertions
            if (line.includes('as any') && !line.trim().startsWith('//')) {
                issues.push({
                    file: fileName,
                    line: lineNum,
                    type: 'any-assertion',
                    code: line.trim(),
                    context: lines.slice(Math.max(0, index - 2), Math.min(lines.length, index + 3)).join('\n')
                });
            }
            // Check for `window as any`
            if (line.includes('window as any')) {
                issues.push({
                    file: fileName,
                    line: lineNum,
                    type: 'window-any',
                    code: line.trim(),
                    context: lines.slice(Math.max(0, index - 2), Math.min(lines.length, index + 3)).join('\n')
                });
            }
            // Check for complex unknown assertions (potential issues)
            if (line.includes('as unknown as') && line.includes('{')) {
                issues.push({
                    file: fileName,
                    line: lineNum,
                    type: 'unknown-assertion',
                    code: line.trim(),
                    context: lines.slice(Math.max(0, index - 2), Math.min(lines.length, index + 3)).join('\n')
                });
            }
        });
    }
    catch (error) {
        console.error(`Error analyzing ${fileName}:`, error);
    }
}
// Analyze all files
if (!filesToCheck || filesToCheck.length === 0) {
    console.error('❌ Error: No files to check');
    process.exit(1);
}
filesToCheck.forEach(fileName => {
    if (!fileName) {
        console.warn('⚠️  Warning: Empty filename in filesToCheck array');
        return;
    }
    const filePath = join(servicesDir, fileName);
    if (!filePath) {
        console.warn(`⚠️  Warning: Could not construct path for ${fileName}`);
        return;
    }
    analyzeFile(filePath, fileName);
});
// Generate report
console.log('=== Slice 6 TypeScript Issues Diagnostic Report ===\n');
const byType = {
    suppression: issues.filter(i => i.type === 'suppression'),
    'any-assertion': issues.filter(i => i.type === 'any-assertion'),
    'window-any': issues.filter(i => i.type === 'window-any'),
    'unknown-assertion': issues.filter(i => i.type === 'unknown-assertion')
};
console.log(`Total Issues Found: ${issues.length}\n`);
Object.entries(byType).forEach(([type, typeIssues]) => {
    if (typeIssues.length > 0) {
        console.log(`\n${type.toUpperCase()} (${typeIssues.length}):`);
        typeIssues.forEach(issue => {
            console.log(`  ${issue.file}:${issue.line}`);
            console.log(`    ${issue.code}`);
        });
    }
});
console.log('\n=== Detailed Issues ===\n');
issues.forEach(issue => {
    console.log(`${issue.file}:${issue.line} [${issue.type}]`);
    console.log(`Code: ${issue.code}`);
    console.log(`Context:\n${issue.context}\n`);
});
// Summary by file
console.log('\n=== Summary by File ===\n');
const byFile = {};
issues.forEach(issue => {
    if (!byFile[issue.file]) {
        byFile[issue.file] = [];
    }
    byFile[issue.file].push(issue);
});
Object.entries(byFile).forEach(([file, fileIssues]) => {
    console.log(`${file}: ${fileIssues.length} issues`);
    fileIssues.forEach(issue => {
        console.log(`  Line ${issue.line}: ${issue.type}`);
    });
});
export { issues, byType, byFile };
//# sourceMappingURL=diagnose-slice6-types.js.map