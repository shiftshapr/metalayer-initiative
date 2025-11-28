/**
 * Diagnostic Script: Slice 8 Type Issues
 *
 * Scans for TypeScript best practice violations in:
 * - sidepanel/Sidepanel.ts
 * - sidepanel/buildGraph.ts
 * - sidepanel/controllers/BootController.ts
 * - sidepanel/controllers/TabController.ts
 * - sidepanel/types.ts
 * - components/*.ts
 * - ui/*.ts
 *
 * Issues to detect:
 * - `as any` type assertions
 * - `@ts-ignore` / `@ts-expect-error` suppressions
 * - `(graph as any)` casting
 * - `(window as any)` casting
 * - Missing proper type definitions
 */
import { readFileSync } from 'fs';
import { join } from 'path';
const results = [];
function scanFile(filePath, content) {
    const lines = content.split('\n');
    lines.forEach((line, index) => {
        const lineNum = index + 1;
        // Check for `as any` assertions
        if (line.includes('as any')) {
            results.push({
                file: filePath,
                line: lineNum,
                issue: 'Uses `as any` type assertion',
                severity: 'critical',
                code: line.trim()
            });
        }
        // Check for `(graph as any)`
        if (line.includes('(graph as any)') || line.includes('graph as any')) {
            results.push({
                file: filePath,
                line: lineNum,
                issue: 'Uses `(graph as any)` casting - should use proper ModuleGraph type',
                severity: 'critical',
                code: line.trim()
            });
        }
        // Check for `(window as any)`
        if (line.includes('(window as any)') || line.includes('window as any')) {
            results.push({
                file: filePath,
                line: lineNum,
                issue: 'Uses `(window as any)` casting - should extend Window interface',
                severity: 'high',
                code: line.trim()
            });
        }
        // Check for type suppressions
        if (line.includes('@ts-ignore') || line.includes('@ts-expect-error')) {
            results.push({
                file: filePath,
                line: lineNum,
                issue: 'Uses type suppression comment',
                severity: 'high',
                code: line.trim()
            });
        }
        // Check for `unknown` in ModuleGraph (should be properly typed)
        if (filePath.includes('types.ts') && line.includes('unknown') && line.includes('ModuleGraph')) {
            results.push({
                file: filePath,
                line: lineNum,
                issue: 'ModuleGraph uses `unknown` - should use proper types',
                severity: 'high',
                code: line.trim()
            });
        }
    });
}
// Files to scan
const filesToScan = [
    'sidepanel/Sidepanel.ts',
    'sidepanel/buildGraph.ts',
    'sidepanel/controllers/BootController.ts',
    'sidepanel/controllers/TabController.ts',
    'sidepanel/types.ts',
    'components/MessageLoader.ts',
    'components/DraftSelectionModal.ts',
    'components/GoVisibleModal.ts',
    'components/OverlaySpinner.ts',
    'ui/autoResize.ts',
    'ui/messagingBridge.ts',
    'ui/tabNavigation.ts'
];
const srcDir = join(process.cwd(), 'presence', 'src');
console.log('🔍 Scanning Slice 8 files for type issues...\n');
filesToScan.forEach(relativePath => {
    const fullPath = join(srcDir, relativePath);
    try {
        const content = readFileSync(fullPath, 'utf-8');
        scanFile(relativePath, content);
    }
    catch (error) {
        console.error(`❌ Error reading ${relativePath}:`, error);
    }
});
// Report results
console.log(`\n📊 Diagnostic Results: ${results.length} issues found\n`);
if (results.length === 0) {
    console.log('✅ No type issues found in Slice 8 files!');
    process.exit(0);
}
// Group by severity
const critical = results.filter(r => r.severity === 'critical');
const high = results.filter(r => r.severity === 'high');
const medium = results.filter(r => r.severity === 'medium');
console.log(`🔴 Critical: ${critical.length}`);
console.log(`🟠 High: ${high.length}`);
console.log(`🟡 Medium: ${medium.length}\n`);
// Group by file
const byFile = new Map();
results.forEach(r => {
    const existing = byFile.get(r.file) || [];
    existing.push(r);
    byFile.set(r.file, existing);
});
byFile.forEach((fileResults, file) => {
    console.log(`\n📄 ${file} (${fileResults.length} issues)`);
    fileResults.forEach(r => {
        console.log(`  ${r.severity === 'critical' ? '🔴' : r.severity === 'high' ? '🟠' : '🟡'} Line ${r.line}: ${r.issue}`);
        console.log(`     ${r.code.substring(0, 80)}${r.code.length > 80 ? '...' : ''}`);
    });
});
console.log('\n✅ Diagnostic complete');
// Exit with error code if issues found
process.exit(results.length > 0 ? 1 : 0);
//# sourceMappingURL=diagnose-slice8-types.js.map