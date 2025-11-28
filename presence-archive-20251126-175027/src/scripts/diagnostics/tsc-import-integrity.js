/**
 * TSC Import Integrity Diagnostic
 *
 * Runs `npx tsc --noEmit --pretty false` and categorizes the current failures
 * so we can track duplicate identifiers, undefined globals, unused imports,
 * and inconsistent Supabase realtime typings before/after Slice 1 fixes.
 *
 * Usage:
 *   node src/scripts/diagnostics/tsc-import-integrity.js
 */

const { spawnSync } = require('child_process');
const path = require('path');

const repoRoot = path.resolve(__dirname, '..', '..', '..');
const command = ['tsc', '--noEmit', '--pretty', 'false'];

const regexMatchers = [
  {
    key: 'duplicateIdentifier',
    label: 'Duplicate identifier',
    regex: /Duplicate identifier '([^']+)'/i
  },
  {
    key: 'unusedImport',
    label: 'Unused import',
    regex: /is declared but its value is never read\.ts\(6133\)/i
  },
  {
    key: 'missingGlobal',
    label: 'Cannot find name',
    regex: /Cannot find name '([^']+)'/i
  },
  {
    key: 'supabaseTyping',
    label: 'Supabase realtime typing mismatch',
    regex: /Type 'Promise<[^>]*>' is not assignable|Type 'string \| .*Presence/i
  }
];

function runTypeCheck() {
  const result = spawnSync('npx', command, {
    cwd: repoRoot,
    encoding: 'utf-8'
  });

  const stderr = result.stderr || '';
  const stdout = result.stdout || '';
  const lines = (stderr + '\n' + stdout).split('\n');

  const categorized = {
    duplicateIdentifier: [],
    unusedImport: [],
    missingGlobal: [],
    supabaseTyping: [],
    uncategorized: []
  };

  for (const line of lines) {
    if (!line.trim()) continue;

    let matched = false;
    for (const matcher of regexMatchers) {
      if (matcher.regex.test(line)) {
        categorized[matcher.key].push(line.trim());
        matched = true;
        break;
      }
    }

    if (!matched) {
      categorized.uncategorized.push(line.trim());
    }
  }

  return {
    exitCode: result.status,
    timestamp: new Date().toISOString(),
    command: `npx ${command.join(' ')}`,
    categorized
  };
}

function printReport(report) {
  console.log('🔍 TSC IMPORT INTEGRITY DIAGNOSTIC');
  console.log(`   Command: ${report.command}`);
  console.log(`   Exit Code: ${report.exitCode}`);
  console.log(`   Timestamp: ${report.timestamp}`);
  console.log('---');

  Object.entries(report.categorized).forEach(([key, entries]) => {
    if (entries.length === 0) return;
    console.log(`\n${key.toUpperCase()} (${entries.length})`);
    entries.slice(0, 20).forEach(entry => console.log(`  • ${entry}`));
    if (entries.length > 20) {
      console.log(`  … ${entries.length - 20} more`);
    }
  });

  console.log('\nJSON Summary:\n');
  console.log(JSON.stringify(report, null, 2));
}

const report = runTypeCheck();
printReport(report);

module.exports = {
  runTypeCheck
};

