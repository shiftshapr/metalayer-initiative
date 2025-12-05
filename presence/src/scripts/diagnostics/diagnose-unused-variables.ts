/**
 * Diagnostic Script: Unused Variables Detection
 * 
 * This script identifies all unused variables in the codebase,
 * specifically focusing on catch error variables that need to be prefixed with underscore.
 * 
 * Usage: Run `npm run lint 2>&1 | grep "is defined but never used"`
 */

import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

interface UnusedVariableError {
  file: string;
  line: number;
  column: number;
  variable: string;
  message: string;
}

function diagnoseUnusedVariables(): {
  errors: UnusedVariableError[];
  summary: {
    total: number;
    catchErrors: number;
    other: number;
  };
} {
  console.log('🔍 DIAGNOSTIC: Unused Variables Detection');
  console.log('=========================================\n');

  const results: UnusedVariableError[] = [];
  let catchErrorCount = 0;
  let otherCount = 0;

  try {
    // Run lint and capture output
    const lintOutput = execSync('npm run lint 2>&1', {
      cwd: '/home/ubuntu/canopi',
      encoding: 'utf-8',
    });

    // Parse lint output for unused variable errors
    const lines = lintOutput.split('\n');
    let currentFile = '';

    for (const line of lines) {
      // Extract file path
      if (line.startsWith('/') && line.includes('.ts')) {
        const fileMatch = line.match(/^(.+\.ts)$/);
        if (fileMatch) {
          currentFile = fileMatch[1];
          continue;
        }
      }

      // Extract error details
      const errorMatch = line.match(/(\d+):(\d+)\s+error\s+(.+is defined but never used.+)/);
      if (errorMatch && currentFile) {
        const lineNum = parseInt(errorMatch[1], 10);
        const column = parseInt(errorMatch[2], 10);
        const message = errorMatch[3];

        // Extract variable name
        const varMatch = message.match(/'([^']+)' is defined but never used/);
        const variable = varMatch ? varMatch[1] : 'unknown';

        const error: UnusedVariableError = {
          file: currentFile,
          line: lineNum,
          column,
          variable,
          message,
        };

        results.push(error);

        // Check if it's a catch error
        if (message.includes('Allowed unused caught errors')) {
          catchErrorCount++;
        } else {
          otherCount++;
        }
      }
    }
  } catch (error) {
    console.error('Error running lint:', error);
  }

  // Summary
  const summary = {
    total: results.length,
    catchErrors: catchErrorCount,
    other: otherCount,
  };

  console.log('📊 DIAGNOSTIC SUMMARY');
  console.log('=========================================');
  console.log(`Total unused variables: ${summary.total}`);
  console.log(`Catch error variables: ${summary.catchErrors}`);
  console.log(`Other unused variables: ${summary.other}`);
  console.log('\n');

  if (results.length > 0) {
    console.log('Issues Found:');
    results.forEach((error, i) => {
      console.log(`  ${i + 1}. ${error.file}:${error.line}:${error.column}`);
      console.log(`     Variable: '${error.variable}'`);
      console.log(`     ${error.message}`);
      console.log('');
    });
  }

  return { errors: results, summary };
}

// Run diagnostic
if (require.main === module) {
  const result = diagnoseUnusedVariables();
  process.exit(result.errors.length > 0 ? 1 : 0);
}

export { diagnoseUnusedVariables };

