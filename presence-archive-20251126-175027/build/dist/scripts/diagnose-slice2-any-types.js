/**
 * Diagnostic Script: Slice 2 - Any Type Annotations
 * Scans prioritized files for `any` type annotations so we can capture
 * baseline + post-fix metrics.
 */
import fs from 'node:fs';
import path from 'node:path';
import ts from 'typescript';
const projectRoot = path.resolve(process.cwd(), '.');
const targetFiles = [
    'presence/src/features/CursorVisualSettingsManager.ts',
    'presence/src/features/DisplayNameManager.ts',
    'presence/src/features/SettingsHeadlineManager.ts',
    'presence/src/sidepanel/Sidepanel.ts',
    'presence/src/utils/DEFAULT_VS_FOCUS_MODE_DIAGNOSTIC.ts'
];
const matches = targetFiles.flatMap(file => analyzeFile(file));
reportSummary(matches);
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
function reportSummary(allMatches) {
    console.log('=== Slice 2 Diagnostic: Any Type Annotations ===');
    console.log(`Target files: ${targetFiles.length}`);
    console.log(`Total any annotations: ${allMatches.length}`);
    const summary = aggregateByFile(allMatches);
    console.log('\nCounts by file:');
    summary.forEach(entry => {
        console.log(`  ${entry.file}: ${entry.count}`);
    });
    console.log('\nDetailed matches:');
    allMatches.forEach(match => {
        console.log(`  ${match.file}:${match.line}:${match.column} - ${match.context}`);
    });
    console.log('\n=== Diagnostic Complete ===');
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
//# sourceMappingURL=diagnose-slice2-any-types.js.map