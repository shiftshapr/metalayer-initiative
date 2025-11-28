/**
 * Diagnostic Script: Slice 2 - Any Type Annotations (Strict Mode)
 *
 * Scans prioritized files for `any` type annotations.
 * Exits with non-zero code if any are found (for CI/CD enforcement).
 *
 * Usage in CI/CD:
 *   npx tsx src/scripts/diagnose-slice2-any-types-strict.ts
 *
 * This will fail the build if any `: any` annotations are found.
 */
import fs from 'node:fs';
import path from 'node:path';
import ts from 'typescript';
// Resolve project root - works from presence/ or repo root
const currentDir = process.cwd();
const projectRoot = currentDir.endsWith('presence')
    ? path.resolve(currentDir, '..')
    : path.resolve(currentDir, '.');
const targetFiles = [
    'presence/src/features/CursorVisualSettingsManager.ts',
    'presence/src/features/DisplayNameManager.ts',
    'presence/src/features/SettingsHeadlineManager.ts',
    'presence/src/sidepanel/Sidepanel.ts',
    'presence/src/utils/DEFAULT_VS_FOCUS_MODE_DIAGNOSTIC.ts'
];
const matches = targetFiles.flatMap(file => analyzeFile(file));
// Report summary
console.log('=== Slice 2 Diagnostic: Any Type Annotations (Strict Mode) ===');
console.log(`Target files: ${targetFiles.length}`);
console.log(`Total any annotations: ${matches.length}`);
if (matches.length > 0) {
    const summary = aggregateByFile(matches);
    console.log('\n❌ FAILED: Found any type annotations:');
    console.log('\nCounts by file:');
    summary.forEach(entry => {
        console.log(`  ${entry.file}: ${entry.count}`);
    });
    console.log('\nDetailed matches:');
    matches.forEach(match => {
        console.log(`  ${match.file}:${match.line}:${match.column} - ${match.context}`);
    });
    console.log('\n⚠️  ACTION REQUIRED: Replace all `: any` with proper types.');
    console.log('💡 See: presence/src/types/window-utils.ts for helper types.');
    console.log('💡 See: presence/src/types/global.d.ts for window interface patterns.');
    console.log('\n=== Diagnostic Failed ===');
    process.exit(1);
}
else {
    console.log('\n✅ PASSED: No `: any` annotations found in Slice 2 files.');
    console.log('=== Diagnostic Complete ===');
    process.exit(0);
}
export { matches };
function analyzeFile(relativePath) {
    const absolutePath = path.resolve(projectRoot, relativePath);
    if (!fs.existsSync(absolutePath)) {
        console.warn(`⚠️  Slice2 Diagnostics: File not found - ${relativePath}`);
        return [];
    }
    const fileContents = fs.readFileSync(absolutePath, 'utf8');
    const sourceFile = ts.createSourceFile(relativePath, fileContents, ts.ScriptTarget.ESNext, true, ts.ScriptKind.TS);
    const fileMatches = [];
    const registerMatch = (pos) => {
        const { line, character } = sourceFile.getLineAndCharacterOfPosition(pos);
        const lineText = sourceFile.text.split(/\r?\n/)[line]?.trim() ?? '';
        fileMatches.push({
            file: relativePath,
            line: line + 1,
            column: character + 1,
            context: lineText
        });
    };
    const visit = (node) => {
        if (node.kind === ts.SyntaxKind.AnyKeyword) {
            registerMatch(node.getStart());
        }
        ts.forEachChild(node, visit);
    };
    visit(sourceFile);
    return fileMatches;
}
function aggregateByFile(allMatches) {
    const summaryMap = new Map();
    allMatches.forEach(match => {
        summaryMap.set(match.file, (summaryMap.get(match.file) ?? 0) + 1);
    });
    return Array.from(summaryMap.entries()).map(([file, count]) => ({
        file,
        count
    }));
}
//# sourceMappingURL=diagnose-slice2-any-types-strict.js.map