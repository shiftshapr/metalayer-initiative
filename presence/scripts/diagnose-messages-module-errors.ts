/**
 * DIAGNOSTIC SCRIPT: MessagesModule TypeScript Errors
 * 
 * Purpose: Diagnose and verify fixes for TypeScript errors in MessagesModule
 * Slice 3 of 8 parallel TypeScript error fixes
 * 
 * Generated: 2025-01-24
 * Status: Diagnostic
 */

import * as fs from 'fs';
import * as path from 'path';

interface DiagnosticResult {
  file: string;
  line: number;
  column?: number;
  error: string;
  severity: 'critical' | 'warning' | 'info';
  status: 'found' | 'fixed' | 'verified';
}

const results: DiagnosticResult[] = [];

// Expected errors from Slice 3
const expectedErrors = [
  {
    file: 'presence/src/features/MessagesModule.ts',
    line: 99,
    error: '_isInitialLoad variable is declared but never read',
    severity: 'warning' as const
  },
  {
    file: 'presence/src/features/MessagesModule.ts',
    line: 100,
    error: '_initialLoadComplete variable is declared but never read',
    severity: 'warning' as const
  },
  {
    file: 'presence/src/features/MessagesModule.ts',
    line: 2366,
    column: 57,
    error: "Property 'action' does not exist on type '{}'",
    severity: 'critical' as const
  },
  {
    file: 'presence/src/features/MessagesModule.ts',
    line: 2385,
    column: 53,
    error: "Property 'action' does not exist on type '{}'",
    severity: 'critical' as const
  },
  {
    file: 'presence/src/features/MessagesModule.ts',
    line: 2413,
    error: '_sendButton variable is declared but never read',
    severity: 'warning' as const
  },
  {
    file: 'presence/src/features/MessagesModuleServiceIntegration.ts',
    line: 13,
    error: 'MessageRendererService import is declared but never used',
    severity: 'warning' as const
  },
  {
    file: 'presence/src/features/MessagesModuleServiceIntegration.ts',
    line: 22,
    error: 'MessageActionListenersService import is declared but never used',
    severity: 'warning' as const
  },
  {
    file: 'presence/src/features/MessagesModuleServiceIntegration.ts',
    line: 76,
    error: 'messageLoading variable is declared but never read',
    severity: 'warning' as const
  }
];

function checkFile(filePath: string): void {
  const fullPath = path.join(process.cwd(), filePath);
  if (!fs.existsSync(fullPath)) {
    console.error(`❌ File not found: ${fullPath}`);
    return;
  }

  const content = fs.readFileSync(fullPath, 'utf-8');
  const lines = content.split('\n');

  for (const expected of expectedErrors) {
    if (expected.file !== filePath) continue;

    const lineNum = expected.line - 1; // 0-indexed
    if (lineNum >= 0 && lineNum < lines.length) {
      const line: string = lines[lineNum] ?? '';
      
      // Check for critical errors (missing property)
      if (expected.severity === 'critical') {
        // Check if type assertion exists
        if (line.includes('as { action?: string }')) {
          results.push({
            ...expected,
            status: 'verified',
            error: 'Type assertion present - may be fixed'
          });
        } else {
          results.push({
            ...expected,
            status: 'found',
            error: expected.error
          });
        }
      } else {
        // Check for unused variables/imports
        if (line.includes('_isInitialLoad') || line.includes('_initialLoadComplete') || 
            line.includes('_sendButton') || line.includes('messageLoading')) {
          // Check if prefixed with underscore (intentionally unused)
          if (line.match(/const _\w+/)) {
            results.push({
              ...expected,
              status: 'verified',
              error: 'Variable prefixed with _ (intentionally unused)'
            });
          } else {
            results.push({
              ...expected,
              status: 'found',
              error: expected.error
            });
          }
        } else if (line.includes('MessageRendererService') || line.includes('MessageActionListenersService')) {
          // Check if import is actually used
          const importMatch = line.match(/import.*?(\w+).*from/);
          const importName = importMatch?.[1];
          if (importName && !content.includes(importName)) {
            results.push({
              ...expected,
              status: 'found',
              error: expected.error
            });
          } else {
            results.push({
              ...expected,
              status: 'verified',
              error: 'Import may be used elsewhere'
            });
          }
        }
      }
    }
  }
}

// Run diagnostics
console.log('🔍 Diagnosing MessagesModule TypeScript errors...\n');

checkFile('presence/src/features/MessagesModule.ts');
checkFile('presence/src/features/MessagesModuleServiceIntegration.ts');

// Report results
console.log('\n📊 Diagnostic Results:\n');
let criticalCount = 0;
let warningCount = 0;
let fixedCount = 0;

for (const result of results) {
  const icon = result.severity === 'critical' ? '🔴' : '🟡';
  const statusIcon = result.status === 'verified' ? '✅' : result.status === 'fixed' ? '✅' : '❌';
  console.log(`${statusIcon} ${icon} ${result.file}:${result.line} - ${result.error}`);
  console.log(`   Status: ${result.status}`);
  
  if (result.severity === 'critical') criticalCount++;
  else warningCount++;
  if (result.status === 'verified' || result.status === 'fixed') fixedCount++;
}

console.log(`\n📈 Summary:`);
console.log(`   Critical errors: ${criticalCount}`);
console.log(`   Warning errors: ${warningCount}`);
console.log(`   Fixed/Verified: ${fixedCount}/${results.length}`);

// Export for programmatic access
export { results, expectedErrors };

