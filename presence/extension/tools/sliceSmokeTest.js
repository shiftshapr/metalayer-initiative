import { spawnSync } from 'child_process';
import path from 'path';
const repoRoot = path.resolve(__dirname, '../../..');
const stagedArgs = process.argv.slice(2).filter(Boolean);
const targetedPresencePaths = Array.from(new Set(stagedArgs
    .filter(arg => arg.startsWith('presence/'))
    .map(arg => arg.replace(/^presence\//, ''))
    .filter(arg => arg.startsWith('src/'))));
if (targetedPresencePaths.length === 0) {
    console.log('Slice smoke test: no staged presence/src files detected. Skipping targeted diagnostics.');
    process.exit(0);
}
console.log('🩺 Slice smoke test: running `npm run type-check` once and filtering output for staged files...');
const typecheckResult = spawnSync('npm', ['run', 'type-check'], {
    cwd: repoRoot,
    shell: process.platform === 'win32',
    encoding: 'utf-8'
});
const combinedOutput = `${typecheckResult.stdout ?? ''}${typecheckResult.stderr ?? ''}`;
const relevantLines = combinedOutput
    .split('\n')
    .filter(line => targetedPresencePaths.some(target => line.includes(target)));
if (relevantLines.length > 0) {
    console.error('❌ Slice smoke test detected type errors referencing staged files:');
    relevantLines.forEach(line => console.error(line));
    process.exit(1);
}
if (typecheckResult.status !== 0) {
    console.warn('⚠️ Slice smoke test: global type-check failed but no staged files were implicated. Ignoring for this commit.');
}
console.log('✅ Slice smoke test: no errors referencing staged files.');
// Exit code 10 indicates the smoke test ran (so Husky can skip redundant full type-checks).
process.exit(10);
