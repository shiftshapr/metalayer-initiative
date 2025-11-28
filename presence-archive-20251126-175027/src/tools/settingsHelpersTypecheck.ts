import { spawnSync } from 'child_process';
import path from 'path';

/**
 * Slice 6 diagnostic helper that runs `npm run type-check` and filters
 * the output down to settings helper files (profileSettingChannel, etc.).
 * Execute before and after touching helper exports to prove the fix.
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
  .filter((line) =>
    line.includes('settings/helpers/profileSettingChannel.ts') ||
    line.includes('settings/helpers/profileSettingHelpers.ts')
  );

console.log('--- Slice 6 Profile Setting Helpers diagnostics ---');
if (relevantLines.length === 0) {
  console.log('No settings helper errors detected in type-check output.');
} else {
  relevantLines.forEach((line) => console.log(line));
}

if (result.status !== 0) {
  console.error('Type-check failed. Inspect the output above for details.');
}

process.exit(result.status === null ? 1 : result.status);




