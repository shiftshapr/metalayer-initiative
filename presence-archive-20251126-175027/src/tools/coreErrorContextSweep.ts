import { spawnSync } from 'child_process';
import path from 'path';

/**
 * Slice 5 diagnostic helper that runs `npm run type-check` and filters
 * output for ErrorContext-related warnings/errors across core modules.
 */
const repoRoot = path.resolve(__dirname, '../../..');

const result = spawnSync('npm', ['run', 'type-check'], {
  cwd: repoRoot,
  shell: process.platform === 'win32',
  encoding: 'utf-8'
});

const combinedOutput = `${result.stdout ?? ''}${result.stderr ?? ''}`;

const targetFiles = [
  'src/core/StateManager.ts',
  'src/core/EventBus.ts',
  'src/core/UnifiedContextMenu.ts',
  'src/core/DependencyContainer.ts',
  'src/core/CursorParkManager.ts'
];

const relevantLines = combinedOutput
  .split('\n')
  .filter(line => line.includes('ErrorContext') || targetFiles.some(file => line.includes(file)));

console.log('--- Slice 5 Core ErrorContext diagnostics ---');
if (relevantLines.length === 0) {
  console.log('No ErrorContext issues detected for core modules in type-check output.');
} else {
  relevantLines.forEach(line => console.log(line));
}

if (result.status !== 0) {
  console.error('Type-check failed. Review the filtered output above for ErrorContext issues.');
}

process.exit(result.status === null ? 1 : result.status);




