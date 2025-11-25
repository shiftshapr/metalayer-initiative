/**
 * Slice 7 Diagnostic Script
 * Verifies console.* migration for AgentModule.ts, APIModule.ts, and UnifiedMessageModal.ts
 * 
 * Usage: npx tsx presence/src/scripts/diagnose-slice7-console-logging.ts
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PRESENCE_SRC = path.resolve(__dirname, '..');

interface FileDiagnostic {
  file: string;
  consoleLog: number;
  consoleWarn: number;
  consoleError: number;
  total: number;
  lines: Array<{ line: number; content: string; type: 'log' | 'warn' | 'error' }>;
}

function scanFile(filePath: string): FileDiagnostic | null {
  if (!fs.existsSync(filePath)) {
    return null;
  }

  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');
  
  const consoleLog = /console\.log\(/g;
  const consoleWarn = /console\.warn\(/g;
  const consoleError = /console\.error\(/g;
  
  const matches: Array<{ line: number; content: string; type: 'log' | 'warn' | 'error' }> = [];
  
  lines.forEach((line, index) => {
    if (consoleLog.test(line)) {
      matches.push({ line: index + 1, content: line.trim(), type: 'log' });
    }
    if (consoleWarn.test(line)) {
      matches.push({ line: index + 1, content: line.trim(), type: 'warn' });
    }
    if (consoleError.test(line)) {
      matches.push({ line: index + 1, content: line.trim(), type: 'error' });
    }
  });
  
  const logCount = (content.match(consoleLog) || []).length;
  const warnCount = (content.match(consoleWarn) || []).length;
  const errorCount = (content.match(consoleError) || []).length;
  
  return {
    file: path.relative(PRESENCE_SRC, filePath),
    consoleLog: logCount,
    consoleWarn: warnCount,
    consoleError: errorCount,
    total: logCount + warnCount + errorCount,
    lines: matches
  };
}

function main(): void {
  console.log('🔍 Slice 7 Console Logging Diagnostic\n');
  console.log('Scanning files for console.* statements...\n');
  
  const files = [
    path.join(PRESENCE_SRC, 'features', 'AgentModule.ts'),
    path.join(PRESENCE_SRC, 'features', 'APIModule.ts'),
    path.join(PRESENCE_SRC, 'components', 'UnifiedMessageModal.ts')
  ];
  
  const diagnostics: FileDiagnostic[] = [];
  let totalStatements = 0;
  
  files.forEach(filePath => {
    const diagnostic = scanFile(filePath);
    if (diagnostic) {
      diagnostics.push(diagnostic);
      totalStatements += diagnostic.total;
    }
  });
  
  console.log('Results:\n');
  console.log('─'.repeat(80));
  
  diagnostics.forEach(diag => {
    const status = diag.total === 0 ? '✅' : '⚠️';
    console.log(`${status} ${diag.file}`);
    console.log(`   console.log: ${diag.consoleLog}`);
    console.log(`   console.warn: ${diag.consoleWarn}`);
    console.log(`   console.error: ${diag.consoleError}`);
    console.log(`   Total: ${diag.total}`);
    
    if (diag.lines.length > 0) {
      console.log(`   Lines with console.*:`);
      diag.lines.slice(0, 5).forEach(m => {
        console.log(`     Line ${m.line}: ${m.content.substring(0, 60)}...`);
      });
      if (diag.lines.length > 5) {
        console.log(`     ... and ${diag.lines.length - 5} more`);
      }
    }
    console.log('');
  });
  
  console.log('─'.repeat(80));
  console.log(`\nTotal console.* statements: ${totalStatements}`);
  
  if (totalStatements === 0) {
    console.log('\n✅ SUCCESS: All console.* statements have been migrated to Logger!');
    process.exit(0);
  } else {
    console.log(`\n⚠️  WARNING: ${totalStatements} console.* statements remain.`);
    console.log('   Migration incomplete. Please replace with Logger.* calls.');
    process.exit(1);
  }
}

main();

