/**
 * DIAGNOSTIC SCRIPT: Slice 14 TypeScript Errors
 * 
 * Identifies all TypeScript errors in Slice 14 files:
 * - sidepanel/buildGraph.ts
 * - sidepanel/controllers/BootController.ts
 * - sidepanel/controllers/TabController.ts
 * - sidepanel/Sidepanel.ts
 * - visibility/core/VisibilityManager.ts
 * - visibility/core/VisibilityState.ts
 * - visibility/services/VisibilityStorage.ts
 * - visibility/ui/VisibilityTab.ts
 * - visibility/ui/VisibilityUIEvents.ts
 * 
 * Usage:
 *   npx tsx presence/src/scripts/diagnose-slice14-typescript-errors.ts
 *   npx tsx presence/src/scripts/diagnose-slice14-typescript-errors.ts --help
 */

import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import { parseCLIArgs, printHelp } from './helpers/cli-utils';

const SLICE_14_FILES = [
  'presence/src/sidepanel/buildGraph.ts',
  'presence/src/sidepanel/controllers/BootController.ts',
  'presence/src/sidepanel/controllers/TabController.ts',
  'presence/src/sidepanel/Sidepanel.ts',
  'presence/src/features/visibility/core/VisibilityManager.ts',
  'presence/src/features/visibility/core/VisibilityState.ts',
  'presence/src/features/visibility/services/VisibilityStorage.ts',
  'presence/src/features/visibility/ui/VisibilityTab.ts',
  'presence/src/features/visibility/ui/VisibilityUIEvents.ts'
];

interface TypeScriptError {
  file: string;
  line: number;
  column: number;
  code: string;
  message: string;
}

function parseTypeScriptErrors(output: string): TypeScriptError[] {
  const errors: TypeScriptError[] = [];
  const lines = output.split('\n');
  
  for (const line of lines) {
    // Format: file(line,col): error TS####: message
    const match = line.match(/^(.+)\((\d+),(\d+)\):\s+error\s+(TS\d+):\s+(.+)$/);
    if (match && match[1] && match[2] && match[3] && match[4] && match[5]) {
      errors.push({
        file: match[1],
        line: parseInt(match[2], 10),
        column: parseInt(match[3], 10),
        code: match[4],
        message: match[5]
      });
    }
  }
  
  return errors;
}

function categorizeErrors(errors: TypeScriptError[]): {
  typeSafety: TypeScriptError[];
  unused: TypeScriptError[];
  other: TypeScriptError[];
} {
  const typeSafetyCodes = ['TS2322', 'TS2532', 'TS2345', 'TS18048', 'TS7053', 'TS7006', 'TS2339', 'TS2307'];
  const unusedCodes = ['TS6133'];
  
  return {
    typeSafety: errors.filter(e => typeSafetyCodes.includes(e.code)),
    unused: errors.filter(e => unusedCodes.includes(e.code)),
    other: errors.filter(e => !typeSafetyCodes.includes(e.code) && !unusedCodes.includes(e.code))
  };
}

function main(): void {
  const parsedArgs = parseCLIArgs();
  
  if (parsedArgs.options.help) {
    printHelp(
      'diagnose-slice14-typescript-errors.ts',
      'DIAGNOSTIC SCRIPT: Slice 14 TypeScript Errors. Identifies all TypeScript errors in Slice 14 files.',
      [
        'npx tsx presence/src/scripts/diagnose-slice14-typescript-errors.ts',
        'npx tsx presence/src/scripts/diagnose-slice14-typescript-errors.ts --verbose'
      ]
    );
    process.exit(0);
  }
  
  console.log('🔍 DIAGNOSTIC: Slice 14 TypeScript Errors\n');
  console.log('Files to check:');
  SLICE_14_FILES.forEach(file => console.log(`  - ${file}`));
  console.log('\n');
  
  try {
    // Run TypeScript compiler
    const output = execSync('npx tsc --noEmit 2>&1', { 
      encoding: 'utf-8',
      cwd: path.join(process.cwd(), '..', '..')
    });
    
    // Parse errors
    const allErrors = parseTypeScriptErrors(output);
    
    // Filter to Slice 14 files
    const slice14Errors = allErrors.filter(error => {
      return SLICE_14_FILES.some(file => {
        const fileName = file.split('/').pop();
        return fileName ? error.file.includes(fileName) : false;
      });
    });
    
    // Categorize
    const categorized = categorizeErrors(slice14Errors);
    
    // Report
    console.log('📊 ERROR SUMMARY\n');
    console.log(`Total errors in Slice 14 files: ${slice14Errors.length}`);
    console.log(`  - Type safety errors: ${categorized.typeSafety.length}`);
    console.log(`  - Unused variables: ${categorized.unused.length}`);
    console.log(`  - Other errors: ${categorized.other.length}`);
    console.log('\n');
    
    // Detailed breakdown by file
    console.log('📋 ERRORS BY FILE\n');
    const errorsByFile = new Map<string, TypeScriptError[]>();
    slice14Errors.forEach(error => {
      const file = error.file;
      const existingErrors = errorsByFile.get(file);
      if (existingErrors) {
        existingErrors.push(error);
      } else {
        errorsByFile.set(file, [error]);
      }
    });
    
    errorsByFile.forEach((errors, file) => {
      console.log(`\n${file}: ${errors.length} error(s)`);
      errors.forEach(error => {
        console.log(`  Line ${error.line}:${error.column} [${error.code}] ${error.message}`);
      });
    });
    
    // Type safety errors (critical)
    if (categorized.typeSafety.length > 0) {
      console.log('\n\n🚨 TYPE SAFETY ERRORS (CRITICAL)\n');
      categorized.typeSafety.forEach(error => {
        console.log(`${error.file}:${error.line}:${error.column} [${error.code}] ${error.message}`);
      });
    }
    
    // Unused variables (non-critical)
    if (categorized.unused.length > 0) {
      console.log('\n\n⚠️  UNUSED VARIABLES (CLEANUP)\n');
      categorized.unused.forEach(error => {
        console.log(`${error.file}:${error.line}:${error.column} [${error.code}] ${error.message}`);
      });
    }
    
    // Other errors
    if (categorized.other.length > 0) {
      console.log('\n\n❓ OTHER ERRORS\n');
      categorized.other.forEach(error => {
        console.log(`${error.file}:${error.line}:${error.column} [${error.code}] ${error.message}`);
      });
    }
    
    // Exit with error code if there are type safety errors
    if (categorized.typeSafety.length > 0) {
      process.exit(1);
    }
    
  } catch (error: unknown) {
    const err = error as { stdout?: string; stderr?: string; status?: number };
    if (err.stdout) {
      const allErrors = parseTypeScriptErrors(err.stdout);
      const slice14Errors = allErrors.filter(error => {
        return SLICE_14_FILES.some(file => {
          const fileName = file.split('/').pop();
          return fileName ? error.file.includes(fileName) : false;
        });
      });
      
      if (slice14Errors.length > 0) {
        console.log('Errors found (see above)');
        process.exit(1);
      }
    }
    console.error('Diagnostic script error:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}




