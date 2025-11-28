/**
 * Diagnostic Script: Type Safety Verification
 * Checks for any types, type suppressions, and unsafe patterns
 * 
 * Run: npx ts-node presence/src/scripts/diagnose-type-safety.ts
 */

import * as fs from 'fs';
import * as path from 'path';

interface DiagnosticResult {
  file: string;
  issues: string[];
}

const results: DiagnosticResult[] = [];
const srcDir = path.join(__dirname, '..');

function checkFile(filePath: string, relativePath: string): void {
  const content = fs.readFileSync(filePath, 'utf-8');
  const issues: string[] = [];

  // Check for 'any' types
  const anyMatches = content.match(/\bany\b/g);
  if (anyMatches) {
    issues.push(`Found ${anyMatches.length} 'any' type(s)`);
  }

  // Check for type suppressions
  if (content.includes('@ts-ignore')) {
    issues.push('Found @ts-ignore');
  }
  if (content.includes('@ts-expect-error')) {
    issues.push('Found @ts-expect-error');
  }
  if (content.includes('@ts-nocheck')) {
    issues.push('Found @ts-nocheck');
  }

  // Check for unsafe type assertions
  const unsafeAssertions = content.match(/as\s+any\b/g);
  if (unsafeAssertions) {
    issues.push(`Found ${unsafeAssertions.length} 'as any' assertion(s)`);
  }

  if (issues.length > 0) {
    results.push({
      file: relativePath,
      issues
    });
  }
}

function findTsFiles(dir: string, relativePath: string = ''): void {
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    const relPath = path.join(relativePath, entry.name);

    // Skip scripts directory
    if (entry.isDirectory() && entry.name === 'scripts') {
      continue;
    }

    if (entry.isFile() && entry.name.endsWith('.ts')) {
      checkFile(fullPath, relPath);
    } else if (entry.isDirectory()) {
      findTsFiles(fullPath, relPath);
    }
  }
}

console.log('🔍 Diagnosing type safety issues...\n');
findTsFiles(srcDir);

if (results.length === 0) {
  console.log('✅ No type safety issues found');
  console.log('   - No "any" types');
  console.log('   - No type suppressions');
  console.log('   - No unsafe type assertions');
  process.exit(0);
}

console.log(`Found ${results.length} file(s) with type safety issues:\n`);

for (const result of results) {
  console.log(`⚠️  ${result.file}:`);
  for (const issue of result.issues) {
    console.log(`   - ${issue}`);
  }
  console.log('');
}

console.log('\n❌ Type safety issues found - review required');
process.exit(1);



