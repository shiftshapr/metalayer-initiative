import { spawnSync } from 'child_process';
import path from 'path';
/**
 * Slice 3 diagnostic helper for ProfileManager.
 * Runs `npm run type-check` and prints only ProfileManager-specific errors.
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
    .filter((line) => line.includes('ProfileManager.ts'));
console.log('--- Slice 3 ProfileManager diagnostics ---');
if (relevantLines.length === 0) {
    console.log('No ProfileManager-specific issues detected in type-check output.');
}
else {
    relevantLines.forEach((line) => console.log(line));
}
if (result.status !== 0) {
    console.error('Type-check failed. Inspect the output above for details.');
}
process.exit(result.status === null ? 1 : result.status);
