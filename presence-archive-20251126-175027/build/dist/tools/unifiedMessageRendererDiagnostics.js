import { spawnSync } from 'child_process';
import path from 'path';
/**
 * Slice 9 diagnostic helper that runs `npm run type-check` and filters the
 * output down to `utils/UnifiedMessageRenderer.ts`. Run before/after edits.
 */
const repoRoot = path.resolve(__dirname, '../../..');
const targetFile = 'utils/UnifiedMessageRenderer.ts';
const result = spawnSync('npm', ['run', 'type-check'], {
    cwd: repoRoot,
    shell: process.platform === 'win32',
    encoding: 'utf-8'
});
const combinedOutput = `${result.stdout ?? ''}${result.stderr ?? ''}`;
const relevantLines = combinedOutput
    .split('\n')
    .filter(line => line.includes(targetFile));
console.log('--- Slice 9 UnifiedMessageRenderer diagnostics ---');
if (relevantLines.length === 0) {
    console.log('No UnifiedMessageRenderer-specific errors detected in type-check output.');
}
else {
    relevantLines.forEach(line => console.log(line));
}
if (result.status !== 0) {
    console.error('Type-check failed. Inspect the filtered output above for component-specific errors.');
}
process.exit(result.status === null ? 1 : result.status);
//# sourceMappingURL=unifiedMessageRendererDiagnostics.js.map