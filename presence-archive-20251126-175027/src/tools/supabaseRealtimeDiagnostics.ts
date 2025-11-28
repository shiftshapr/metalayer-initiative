import { spawnSync } from 'child_process';
import path from 'path';

const repoRoot = path.resolve(__dirname, '../../..');
const targetFiles = ['RealtimeSubscriptionService.ts', 'SupabaseRealtimeClientFix.ts'];

const result = spawnSync('npm', ['run', 'type-check'], {
  cwd: repoRoot,
  shell: process.platform === 'win32',
  encoding: 'utf-8'
});

const combinedOutput = `${result.stdout ?? ''}${result.stderr ?? ''}`;
const relevantLines = combinedOutput
  .split('\n')
  .filter((line) => targetFiles.some((file) => line.includes(file)));

console.log('--- Slice 7 Supabase realtime diagnostics ---');
if (relevantLines.length === 0) {
  console.log('No Supabase realtime specific errors detected in type-check output.');
} else {
  relevantLines.forEach((line) => console.log(line));
}

if (result.status !== 0 && relevantLines.length === 0) {
  console.warn('Type-check failed for other files; inspect full output above.');
}

process.exit(result.status === null ? 1 : result.status);


