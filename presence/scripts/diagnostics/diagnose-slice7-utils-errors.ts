#!/usr/bin/env npx tsx
/**
 * Slice 7 Diagnostic Script: Utils Module TypeScript Errors
 * 
 * Identifies TypeScript compilation errors in utils module:
 * - Logger.ts: Type assignment errors
 * - AvatarUtils.ts: Unused imports/variables
 * - ComprehensiveDiagnostic.ts: Missing variables, undefined errors
 * - DEFAULT_VS_FOCUS_MODE_DIAGNOSTIC.ts: Possibly undefined errors
 * - DIAGNOSTIC_HEADLINE_DISPLAYNAME.ts: Unused variables
 * - FOCUS_MODE_REPLY_DIAGNOSTIC.ts: Possibly undefined errors
 */

import { execSync } from 'child_process';
import * as path from 'path';

interface DiagnosticResult {
  file: string;
  line: number;
  column: number;
  error: string;
  code: string;
}

interface FileDiagnostics {
  file: string;
  errors: DiagnosticResult[];
  warnings: DiagnosticResult[];
}

const UTILS_FILES = [
  'src/utils/Logger.ts',
  'src/utils/AvatarUtils.ts',
  'src/utils/ComprehensiveDiagnostic.ts',
  'src/utils/DEFAULT_VS_FOCUS_MODE_DIAGNOSTIC.ts',
  'src/utils/DIAGNOSTIC_HEADLINE_DISPLAYNAME.ts',
  'src/utils/FOCUS_MODE_REPLY_DIAGNOSTIC.ts'
];

function runTypeScriptCheck(): string {
  try {
    const result = execSync('npx tsc --noEmit', {
      cwd: path.join(process.cwd(), '..'),
      encoding: 'utf-8',
      stdio: 'pipe'
    });
    return result;
  } catch (error: any) {
    return error.stdout || error.stderr || error.message;
  }
}

function parseTypeScriptErrors(output: string): FileDiagnostics[] {
  const fileMap = new Map<string, DiagnosticResult[]>();
  
  const errorRegex = /src\/utils\/([^:]+)\((\d+),(\d+)\):\s+error\s+(TS\d+):\s+(.+)/g;
  let match;
  
  while ((match = errorRegex.exec(output)) !== null) {
    const [, file, line, column, code, message] = match;
    const fullPath = `src/utils/${file}`;
    
    if (!fileMap.has(fullPath)) {
      fileMap.set(fullPath, []);
    }
    
    fileMap.get(fullPath)!.push({
      file: fullPath,
      line: parseInt(line, 10),
      column: parseInt(column, 10),
      error: message.trim(),
      code: code.trim()
    });
  }
  
  return Array.from(fileMap.entries()).map(([file, errors]) => ({
    file,
    errors,
    warnings: []
  }));
}

function categorizeErrors(diagnostics: FileDiagnostics[]): {
  critical: DiagnosticResult[];
  unused: DiagnosticResult[];
  undefined: DiagnosticResult[];
  typeAssignment: DiagnosticResult[];
} {
  const critical: DiagnosticResult[] = [];
  const unused: DiagnosticResult[] = [];
  const undefined: DiagnosticResult[] = [];
  const typeAssignment: DiagnosticResult[] = [];
  
  for (const fileDiag of diagnostics) {
    for (const error of fileDiag.errors) {
      // Critical errors
      if (error.code === 'TS18004' || error.code === 'TS2552' || 
          error.code === 'TS2322' || error.code === 'TS2345') {
        critical.push(error);
      }
      
      // Unused imports/variables
      if (error.code === 'TS6133') {
        unused.push(error);
      }
      
      // Possibly undefined
      if (error.error.includes('possibly') && error.error.includes('undefined')) {
        undefined.push(error);
      }
      
      // Type assignment errors
      if (error.error.includes('not assignable to type')) {
        typeAssignment.push(error);
      }
    }
  }
  
  return { critical, unused, undefined, typeAssignment };
}

function main() {
  console.log('🔍 Slice 7 Diagnostic: Utils Module TypeScript Errors\n');
  console.log('Running TypeScript compiler check...\n');
  
  const tscOutput = runTypeScriptCheck();
  const diagnostics = parseTypeScriptErrors(tscOutput);
  const categorized = categorizeErrors(diagnostics);
  
  console.log('='.repeat(80));
  console.log('DIAGNOSTIC RESULTS');
  console.log('='.repeat(80));
  
  console.log(`\n📊 Summary:`);
  console.log(`   Total files with errors: ${diagnostics.length}`);
  console.log(`   Total errors: ${diagnostics.reduce((sum, d) => sum + d.errors.length, 0)}`);
  console.log(`   Critical errors: ${categorized.critical.length}`);
  console.log(`   Unused imports/variables: ${categorized.unused.length}`);
  console.log(`   Possibly undefined: ${categorized.undefined.length}`);
  console.log(`   Type assignment errors: ${categorized.typeAssignment.length}`);
  
  console.log(`\n📁 Files Analyzed:`);
  for (const file of UTILS_FILES) {
    const diag = diagnostics.find(d => d.file === file);
    const count = diag ? diag.errors.length : 0;
    const status = count === 0 ? '✅' : '❌';
    console.log(`   ${status} ${file}: ${count} error(s)`);
  }
  
  if (diagnostics.length > 0) {
    console.log(`\n❌ ERRORS BY FILE:\n`);
    for (const diag of diagnostics) {
      if (diag.errors.length > 0) {
        console.log(`\n${diag.file}:`);
        for (const error of diag.errors) {
          console.log(`   Line ${error.line}:${error.column} [${error.code}] ${error.error}`);
        }
      }
    }
  }
  
  if (categorized.critical.length > 0) {
    console.log(`\n🔴 CRITICAL ERRORS:\n`);
    for (const error of categorized.critical) {
      console.log(`   ${error.file}:${error.line} - ${error.error}`);
    }
  }
  
  if (categorized.unused.length > 0) {
    console.log(`\n⚠️  UNUSED IMPORTS/VARIABLES:\n`);
    for (const error of categorized.unused) {
      console.log(`   ${error.file}:${error.line} - ${error.error}`);
    }
  }
  
  if (categorized.undefined.length > 0) {
    console.log(`\n⚠️  POSSIBLY UNDEFINED:\n`);
    for (const error of categorized.undefined) {
      console.log(`   ${error.file}:${error.line} - ${error.error}`);
    }
  }
  
  if (categorized.typeAssignment.length > 0) {
    console.log(`\n⚠️  TYPE ASSIGNMENT ERRORS:\n`);
    for (const error of categorized.typeAssignment) {
      console.log(`   ${error.file}:${error.line} - ${error.error}`);
    }
  }
  
  console.log('\n' + '='.repeat(80));
  
  const hasErrors = diagnostics.some(d => d.errors.length > 0);
  if (hasErrors) {
    console.log('❌ FAILED: Utils module has TypeScript errors');
    process.exit(1);
  } else {
    console.log('✅ PASSED: No TypeScript errors in utils module');
    process.exit(0);
  }
}

if (require.main === module) {
  main();
}
