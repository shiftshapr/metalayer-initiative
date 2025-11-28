/**
 * DIAGNOSTIC SCRIPT: Slice 4 Type Safety Issues
 *
 * Identifies type safety issues in UI & Visibility modules:
 * - currentUser type casting issues
 * - currentVisibilityDataUnfiltered type issues
 * - any type usage
 */
import { readFileSync } from 'fs';
import { join } from 'path';
const results = [];
function scanFile(filePath) {
    try {
        const content = readFileSync(filePath, 'utf-8');
        const lines = content.split('\n');
        lines.forEach((line, index) => {
            const lineNum = index + 1;
            // Check for currentUser as any
            if (line.includes('currentUser') && line.includes('as any')) {
                results.push({
                    file: filePath,
                    line: lineNum,
                    issue: 'currentUser cast to any',
                    severity: 'critical',
                    suggestion: 'Create proper User type and use type guard or proper type assertion'
                });
            }
            // Check for currentVisibilityDataUnfiltered with any
            if (line.includes('currentVisibilityDataUnfiltered') && (line.includes(': any') || line.includes('as any'))) {
                results.push({
                    file: filePath,
                    line: lineNum,
                    issue: 'currentVisibilityDataUnfiltered with any type',
                    severity: 'high',
                    suggestion: 'Define proper VisibilityUser type and use it'
                });
            }
            // Check for stateManagerInstance.getState with as any
            if (line.includes('stateManagerInstance.getState') && line.includes('as any')) {
                results.push({
                    file: filePath,
                    line: lineNum,
                    issue: 'StateManager.getState result cast to any',
                    severity: 'critical',
                    suggestion: 'Create proper return type for getState or use type guard'
                });
            }
        });
    }
    catch (error) {
        console.error(`Error scanning ${filePath}:`, error);
    }
}
// Files to scan
const filesToScan = [
    'presence/src/features/visibility/ui/VisibilitySettings.ts',
    'presence/src/features/visibility/core/VisibilityManager.ts',
    'presence/src/features/visibility/core/VisibilityState.ts',
    'presence/src/features/visibility/services/VisibilityStorage.ts',
    'presence/src/features/UserHoverModal.ts',
    'presence/src/features/UIManager.ts',
    'presence/src/features/AnchorHighlighter.ts'
];
const projectRoot = process.cwd();
filesToScan.forEach(file => {
    const fullPath = join(projectRoot, file);
    scanFile(fullPath);
});
// Report results
console.log('\n=== SLICE 4 TYPE SAFETY DIAGNOSTIC ===\n');
console.log(`Total issues found: ${results.length}\n`);
const critical = results.filter(r => r.severity === 'critical');
const high = results.filter(r => r.severity === 'high');
const medium = results.filter(r => r.severity === 'medium');
console.log(`Critical: ${critical.length}`);
console.log(`High: ${high.length}`);
console.log(`Medium: ${medium.length}\n`);
if (critical.length > 0) {
    console.log('CRITICAL ISSUES:');
    critical.forEach(r => {
        console.log(`  ${r.file}:${r.line} - ${r.issue}`);
        console.log(`    Suggestion: ${r.suggestion}\n`);
    });
}
if (high.length > 0) {
    console.log('HIGH PRIORITY ISSUES:');
    high.forEach(r => {
        console.log(`  ${r.file}:${r.line} - ${r.issue}`);
        console.log(`    Suggestion: ${r.suggestion}\n`);
    });
}
console.log('\n=== DIAGNOSTIC COMPLETE ===\n');
export { results };
//# sourceMappingURL=diagnose-slice4-types.js.map