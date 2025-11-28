import { spawnSync } from 'child_process';
import path from 'path';
/**
 * Slice 1 diagnostic helper that runs `npm run type-check` and filters
 * the output down to `UIManager.ts` entries for quick regression detection.
 */
const repoRoot = path.resolve(__dirname, '../../..');
const result = spawnSync('npm', ['run', 'type-check'], {
    cwd: repoRoot,
    shell: process.platform === 'win32',
    encoding: 'utf-8'
});
const combinedOutput = `${result.stdout ?? ''}${result.stderr ?? ''}`;
const relevantLines = combinedOutput
    .split('\n')
    .filter(line => line.includes('UIManager.ts'));
console.log('--- Slice 1 UIManager export diagnostics ---');
if (relevantLines.length === 0) {
    console.log('No UIManager-specific errors detected in type-check output.');
}
else {
    relevantLines.forEach(line => console.log(line));
}
if (result.status !== 0) {
    console.error('Type-check failed. Inspect the output above for details.');
}
process.exit(result.status === null ? 1 : result.status);
//# sourceMappingURL=uiManagerExportsTypecheck.js.map