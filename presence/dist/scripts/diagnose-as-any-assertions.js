/**
 * diagnose-as-any-assertions.ts
 * Diagnostic script for Slice 3 - finds `as any` assertions in high-priority files.
 *
 * Usage:
 *   cd /home/ubuntu/metalayer-initiative
 *   npx ts-node presence/src/scripts/diagnose-as-any-assertions.ts
 */
import { existsSync, readFileSync } from 'node:fs';
import { join, relative } from 'node:path';
const repoRoot = join(__dirname, '..', '..');
const targetFiles = [
    'presence/src/features/AgentModule.ts',
    'presence/src/features/APIModule.ts',
    'presence/src/scripts/verify-cleanup-safety.ts'
];
function scanFile(relativePath) {
    const absolutePath = join(repoRoot, '..', relativePath);
    if (!existsSync(absolutePath)) {
        return null;
    }
    const content = readFileSync(absolutePath, 'utf-8');
    const lines = content.split('\n');
    const matches = [];
    lines.forEach((line, index) => {
        if (line.includes('as any')) {
            const trimmed = line.trim();
            if (trimmed.startsWith('//') || trimmed.startsWith('*')) {
                return;
            }
            matches.push({
                line: index + 1,
                snippet: trimmed.slice(0, 160)
            });
        }
    });
    return {
        file: relative(repoRoot, absolutePath),
        total: matches.length,
        matches
    };
}
function runDiagnostic() {
    const results = targetFiles
        .map(scanFile)
        .filter((result) => Boolean(result));
    console.log('🔎 As-Any Assertion Diagnostic (Slice 3)');
    console.log('Target files:', targetFiles.join(', '));
    let grandTotal = 0;
    for (const result of results) {
        grandTotal += result.total;
        console.log(`\n📄 ${result.file}: ${result.total} occurrence(s)`);
        result.matches.forEach(match => {
            console.log(`  - Line ${match.line}: ${match.snippet}`);
        });
    }
    console.log(`\nTotal \`as any\` assertions detected: ${grandTotal}`);
    if (grandTotal === 0) {
        console.log('✅ Slice 3 files are free of `as any` assertions.');
    }
    else {
        console.log('⚠️ Action required: remove the remaining `as any` assertions.');
    }
}
runDiagnostic();
//# sourceMappingURL=diagnose-as-any-assertions.js.map