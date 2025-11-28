import { spawnSync } from 'child_process';
import path from 'path';
/**
 * Slice 2 diagnostic helper that runs `npm run type-check` and filters
 * the output down to `MessagesModule.ts` entries. Use before and after
 * modifications to confirm duplicate export errors are resolved.
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
    .filter(line => line.includes('MessagesModule.ts'));
console.log('--- Slice 2 MessagesModule export diagnostics ---');
if (relevantLines.length === 0) {
    console.log('No MessagesModule export errors detected in type-check output.');
}
else {
    relevantLines.forEach(line => console.log(line));
}
if (result.status !== 0) {
    console.error('Type-check failed. Inspect the output above for details.');
}
process.exit(result.status === null ? 1 : result.status);
