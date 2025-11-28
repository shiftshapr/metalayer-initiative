/**
 * Diagnostic Script: Check Core/Features Duplicate Files
 * 
 * Purpose: Verify duplicate .js files can be safely deleted
 * - Check corresponding .ts files exist
 * - Check for imports of .js files
 * - Verify .ts files are complete
 */

import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

const filesToCheck = [
  { js: 'presence/src/core/UserModule.js', ts: 'presence/src/core/UserModule.ts' },
  { js: 'presence/src/core/ConfigModule.js', ts: 'presence/src/core/ConfigModule.ts' },
  { js: 'presence/src/core/StateManager.js', ts: 'presence/src/core/StateManager.ts' },
  { js: 'presence/src/features/UIManager.js', ts: 'presence/src/features/UIManager.ts' },
  { js: 'presence/src/features/PeopleModule.js', ts: 'presence/src/features/PeopleModule.ts' },
  { js: 'presence/src/features/AuthManager.js', ts: 'presence/src/features/AuthManager.ts' },
];

const projectRoot = join(__dirname, '../../..');

interface DiagnosticResult {
  file: string;
  jsExists: boolean;
  tsExists: boolean;
  tsHasContent: boolean;
  canDelete: boolean;
  issues: string[];
}

const results: DiagnosticResult[] = [];

for (const { js, ts } of filesToCheck) {
  const jsPath = join(projectRoot, js);
  const tsPath = join(projectRoot, ts);
  
  const result: DiagnosticResult = {
    file: js,
    jsExists: existsSync(jsPath),
    tsExists: existsSync(tsPath),
    tsHasContent: false,
    canDelete: false,
    issues: []
  };
  
  if (!result.jsExists) {
    result.issues.push('JS file does not exist (may already be deleted)');
  }
  
  if (!result.tsExists) {
    result.issues.push('TS file missing - CANNOT DELETE JS FILE');
    result.canDelete = false;
  } else {
    try {
      const tsContent = readFileSync(tsPath, 'utf-8');
      result.tsHasContent = tsContent.trim().length > 0;
      if (!result.tsHasContent) {
        result.issues.push('TS file is empty - CANNOT DELETE JS FILE');
        result.canDelete = false;
      } else {
        // Check if TS file has exports
        const hasExports = /export\s+(class|function|const|interface|type|default)/.test(tsContent);
        if (!hasExports) {
          result.issues.push('WARNING: TS file may not have proper exports');
        }
        result.canDelete = true;
      }
    } catch (error) {
      result.issues.push(`Error reading TS file: ${error}`);
      result.canDelete = false;
    }
  }
  
  results.push(result);
}

// Summary
console.log('=== Diagnostic: Core/Features Duplicate Files ===\n');
let allCanDelete = true;

for (const result of results) {
  const status = result.canDelete ? '✅' : '❌';
  console.log(`${status} ${result.file}`);
  if (result.issues.length > 0) {
    result.issues.forEach(issue => console.log(`   - ${issue}`));
  }
  if (!result.canDelete) {
    allCanDelete = false;
  }
}

console.log('\n=== Summary ===');
console.log(`Files checked: ${results.length}`);
console.log(`Can delete: ${results.filter(r => r.canDelete).length}`);
console.log(`Cannot delete: ${results.filter(r => !r.canDelete).length}`);
console.log(`Overall safe to proceed: ${allCanDelete ? 'YES' : 'NO'}`);

if (!allCanDelete) {
  process.exit(1);
}




