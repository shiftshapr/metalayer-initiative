/**
 * Diagnostic Script: Check Types Duplicates Removal (SLICE 3)
 * Verifies .ts files exist, checks for .js imports, validates build readiness
 */

import { stat } from 'fs/promises';
import { join } from 'path';
import { readFile } from 'fs/promises';
import { execSync } from 'child_process';

const TYPES_DIR = join(process.cwd(), 'presence/src/types');

interface DiagnosticResult {
  phase: string;
  status: 'PASS' | 'FAIL' | 'WARN';
  message: string;
  details?: unknown;
}

const results: DiagnosticResult[] = [];

async function checkTypeScriptFilesExist(): Promise<void> {
  const requiredTsFiles = [
    'index.ts',
    'provenance.ts',
    'notifications.ts',
    'anchors.ts',
    'events.ts',
    'api.ts',
    'subscriptions.ts'
  ];

  for (const file of requiredTsFiles) {
    try {
      const filePath = join(TYPES_DIR, file);
      await stat(filePath);
      results.push({
        phase: 'verify-ts-files',
        status: 'PASS',
        message: `${file} exists`
      });
    } catch {
      results.push({
        phase: 'verify-ts-files',
        status: 'FAIL',
        message: `${file} MISSING - cannot delete .js duplicate`
      });
    }
  }
}

async function checkJavaScriptDuplicates(): Promise<void> {
  const duplicateJsFiles = [
    'index.js',
    'provenance.js',
    'notifications.js',
    'anchors.js',
    'events.js',
    'api.js',
    'subscriptions.js'
  ];

  for (const file of duplicateJsFiles) {
    try {
      const filePath = join(TYPES_DIR, file);
      await stat(filePath);
      results.push({
        phase: 'check-duplicates',
        status: 'PASS',
        message: `${file} found (ready for deletion)`
      });
    } catch {
      results.push({
        phase: 'check-duplicates',
        status: 'WARN',
        message: `${file} not found (may already be deleted)`
      });
    }
  }
}

async function checkForJsImports(): Promise<void> {
  // This is a simplified check - in practice, we'd use a proper AST parser
  // For now, we'll check if any files import from types with .js extension
  try {
    const grepResult = execSync(
      `grep -r "from.*types.*\\.js" ${join(process.cwd(), 'presence/src')} || true`,
      { encoding: 'utf-8', maxBuffer: 10 * 1024 * 1024 }
    );
    
    if (grepResult.trim()) {
      results.push({
        phase: 'check-imports',
        status: 'WARN',
        message: 'Found potential .js imports in types directory',
        details: grepResult.trim().split('\n').slice(0, 10)
      });
    } else {
      results.push({
        phase: 'check-imports',
        status: 'PASS',
        message: 'No .js imports found referencing types/*.js files'
      });
    }
  } catch (error) {
    results.push({
      phase: 'check-imports',
      status: 'WARN',
      message: 'Could not check for .js imports (grep failed)',
      details: error instanceof Error ? error.message : String(error)
    });
  }
}

async function verifyTypeScriptFileCompleteness(): Promise<void> {
  const tsFiles = [
    'index.ts',
    'provenance.ts',
    'notifications.ts',
    'anchors.ts',
    'events.ts',
    'api.ts',
    'subscriptions.ts'
  ];

  for (const file of tsFiles) {
    try {
      const filePath = join(TYPES_DIR, file);
      const content = await readFile(filePath, 'utf-8');
      
      // Basic completeness checks
      if (content.trim().length === 0) {
        results.push({
          phase: 'verify-completeness',
          status: 'FAIL',
          message: `${file} is empty`
        });
      } else if (file === 'index.ts' && !content.includes('export')) {
        results.push({
          phase: 'verify-completeness',
          status: 'WARN',
          message: `${file} may be incomplete (no exports found)`
        });
      } else {
        results.push({
          phase: 'verify-completeness',
          status: 'PASS',
          message: `${file} appears complete`
        });
      }
    } catch (error) {
      results.push({
        phase: 'verify-completeness',
        status: 'FAIL',
        message: `Could not read ${file}`,
        details: error instanceof Error ? error.message : String(error)
      });
    }
  }
}

async function runDiagnostics(): Promise<void> {
  console.log('🔍 Running Types Duplicates Diagnostic (SLICE 3)...\n');
  
  await checkTypeScriptFilesExist();
  await checkJavaScriptDuplicates();
  await checkForJsImports();
  await verifyTypeScriptFileCompleteness();

  // Print results
  console.log('📊 Diagnostic Results:\n');
  const byPhase = results.reduce((acc, r) => {
    if (!acc[r.phase]) acc[r.phase] = [];
    const phaseResults = acc[r.phase];
    if (phaseResults) {
      phaseResults.push(r);
    }
    return acc;
  }, {} as Record<string, DiagnosticResult[]>);

  for (const [phase, phaseResults] of Object.entries(byPhase)) {
    if (phaseResults) {
      console.log(`\n${phase}:`);
      for (const result of phaseResults) {
        const icon = result.status === 'PASS' ? '✅' : result.status === 'FAIL' ? '❌' : '⚠️';
        console.log(`  ${icon} ${result.message}`);
        if (result.details) {
          console.log(`     Details: ${JSON.stringify(result.details, null, 2)}`);
        }
      }
    }
  }

  // Summary
  const passCount = results.filter(r => r.status === 'PASS').length;
  const failCount = results.filter(r => r.status === 'FAIL').length;
  const warnCount = results.filter(r => r.status === 'WARN').length;

  console.log('\n📈 Summary:');
  console.log(`  ✅ PASS: ${passCount}`);
  console.log(`  ⚠️  WARN: ${warnCount}`);
  console.log(`  ❌ FAIL: ${failCount}`);

  if (failCount > 0) {
    console.log('\n❌ DIAGNOSTIC FAILED - Do not proceed with deletion');
    process.exit(1);
  } else {
    console.log('\n✅ DIAGNOSTIC PASSED - Safe to proceed with deletion');
    process.exit(0);
  }
}

runDiagnostics().catch(error => {
  console.error('❌ Diagnostic script error:', error);
  process.exit(1);
});

