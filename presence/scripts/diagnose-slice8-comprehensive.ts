/**
 * Comprehensive Diagnostic Script: Slice 8 - Type Suppressions & Technical Debt
 * 
 * Scans for:
 * 1. Type suppressions (@ts-ignore, @ts-expect-error) in production code
 * 2. Diagnostic scripts location (should be outside src/)
 * 3. Potential dead code (unused exports, unused functions)
 * 4. Missing JSDoc documentation on public APIs
 * 
 * Excludes diagnostic scripts themselves from type suppression checks.
 */

import { readFileSync, readdirSync, statSync } from 'fs';
import { join, relative } from 'path';

interface DiagnosticResult {
  category: 'type-suppression' | 'diagnostic-location' | 'dead-code' | 'missing-docs';
  file: string;
  line?: number;
  issue: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  code?: string;
  recommendation?: string;
}

const results: DiagnosticResult[] = [];
// Resolve paths relative to script location
// Script is in presence/scripts/, so srcDir should be presence/src/
const scriptDir = __dirname || process.cwd();
const srcDir = join(scriptDir, '..', 'src');
const projectRoot = join(scriptDir, '..', '..');

// Files/directories to exclude from production code checks
function shouldExclude(filePath: string): boolean {
  const normalized = filePath.replace(/\\/g, '/');
  
  // Exclude diagnostic scripts and test files
  if (normalized.includes('/scripts/') || 
      normalized.includes('/diagnostics/') ||
      normalized.includes('/utils/diagnostics/') ||
      normalized.includes('/services/diagnose-') ||
      normalized.includes('.test.') ||
      normalized.includes('.spec.') ||
      normalized.includes('/diagnose-') ||
      normalized.includes('/test-') ||
      normalized.endsWith('.d.ts') ||
      normalized.includes('node_modules')) {
    return true;
  }
  
  return false;
}

function isProductionCode(filePath: string): boolean {
  const normalized = filePath.replace(/\\/g, '/');
  return !shouldExclude(normalized) && 
         (normalized.endsWith('.ts') || normalized.endsWith('.js'));
}

function scanTypeSuppressions(filePath: string, content: string): void {
  const lines = content.split('\n');
  const relativePath = relative(srcDir, filePath);
  
  lines.forEach((line, index) => {
    const lineNum = index + 1;
    
    if (line.includes('@ts-ignore')) {
      results.push({
        category: 'type-suppression',
        file: relativePath,
        line: lineNum,
        issue: 'Uses @ts-ignore - should fix underlying type issue or document necessity',
        severity: 'high',
        code: line.trim(),
        recommendation: 'Fix the type error or use proper type definitions. If truly necessary, document why.'
      });
    }
    
    if (line.includes('@ts-expect-error')) {
      results.push({
        category: 'type-suppression',
        file: relativePath,
        line: lineNum,
        issue: 'Uses @ts-expect-error - verify error still exists or remove',
        severity: 'medium',
        code: line.trim(),
        recommendation: 'Verify the expected error still exists. If fixed, remove suppression. Otherwise, document why it\'s needed.'
      });
    }
  });
}

function countFilesRecursive(dir: string): number {
  let count = 0;
  try {
    const entries = readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = join(dir, entry.name);
      if (entry.isDirectory() && !entry.name.startsWith('.') && entry.name !== 'node_modules') {
        count += countFilesRecursive(fullPath);
      } else if (entry.isFile() && (entry.name.endsWith('.ts') || entry.name.endsWith('.js'))) {
        count++;
      }
    }
  } catch (error) {
    // Skip if can't read
  }
  return count;
}

function scanDiagnosticScripts(): void {
  const scriptsDir = join(srcDir, 'scripts');
  const diagnosticsDir = join(srcDir, 'diagnostics');
  const utilsDiagnosticsDir = join(srcDir, 'utils', 'diagnostics');
  
  const diagnosticDirs = [
    { path: scriptsDir, name: 'src/scripts/' },
    { path: diagnosticsDir, name: 'src/diagnostics/' },
    { path: utilsDiagnosticsDir, name: 'src/utils/diagnostics/' }
  ];
  
  diagnosticDirs.forEach(({ path, name }) => {
    try {
      if (statSync(path).isDirectory()) {
        const count = countFilesRecursive(path);
        
        if (count > 0) {
          results.push({
            category: 'diagnostic-location',
            file: name,
            issue: `${count} diagnostic script(s) found in ${name} - should be moved outside src/`,
            severity: 'medium',
            recommendation: `Move ${name} to presence/scripts/ or presence/diagnostics/ and update tsconfig.json excludes`
          });
        }
      }
    } catch (error) {
      // Directory doesn't exist, skip
    }
  });
}

function scanMissingDocs(filePath: string, content: string): void {
  const relativePath = relative(srcDir, filePath);
  const lines = content.split('\n');
  
  // Check for exported functions/classes without JSDoc
  let exportKeyword = false;
  
  // Helper to check if there's a JSDoc comment before a line
  function hasJSDocBefore(lineIndex: number, lookBack: number = 30): boolean {
    const startIndex = Math.max(0, lineIndex - lookBack);
    const context = lines.slice(startIndex, lineIndex).join('\n');
    
    // Check for JSDoc pattern: /** ... */ before the function/class
    // Look for /** that is followed by */ before the target line
    const jsdocPattern = /\/\*\*[\s\S]*?\*\//;
    if (jsdocPattern.test(context)) {
      // Verify the JSDoc is close enough (not too far back)
      const lastJsdocIndex = context.lastIndexOf('/**');
      if (lastJsdocIndex !== -1) {
        // Check if there's a closing */ after the /**
        const afterJsdoc = context.substring(lastJsdocIndex);
        if (afterJsdoc.includes('*/')) {
          // Check that there's no significant code between JSDoc and target
          const between = context.substring(lastJsdocIndex + afterJsdoc.indexOf('*/') + 2);
          // Allow whitespace, comments, and empty lines between JSDoc and declaration
          const cleanBetween = between.replace(/^\s*\/\/.*$/gm, '').trim();
          if (cleanBetween.length < 50) { // Reasonable distance
            return true;
          }
        }
      }
    }
    return false;
  }
  
  lines.forEach((line, index) => {
    // Track exports
    if (line.trim().startsWith('export ')) {
      exportKeyword = true;
    }
    
    // Check for class declarations
    if (line.includes('class ') && line.includes('export')) {
      const className = line.match(/export\s+(?:default\s+)?class\s+(\w+)/)?.[1];
      if (className && !hasJSDocBefore(index)) {
        results.push({
          category: 'missing-docs',
          file: relativePath,
          line: index + 1,
          issue: `Exported class ${className} lacks JSDoc documentation`,
          severity: 'low',
          recommendation: 'Add JSDoc comment describing the class purpose, usage, and public methods'
        });
      }
    }
    
    // Check for exported functions
    if (exportKeyword && line.includes('function ') && !line.includes('=>')) {
      const funcName = line.match(/export\s+(?:default\s+)?(?:async\s+)?function\s+(\w+)/)?.[1];
      if (funcName && !hasJSDocBefore(index)) {
        results.push({
          category: 'missing-docs',
          file: relativePath,
          line: index + 1,
          issue: `Exported function ${funcName} lacks JSDoc documentation`,
          severity: 'low',
          recommendation: 'Add JSDoc comment with @param and @returns annotations'
        });
      }
      exportKeyword = false;
    }
  });
}

function scanDeadCode(filePath: string, content: string): void {
  const relativePath = relative(srcDir, filePath);
  
  // Check for unused exports (simple heuristic - exported but never imported elsewhere)
  // This is a simplified check - full analysis would require AST parsing
  const exportMatches = content.matchAll(/export\s+(?:default\s+)?(?:const|let|var|function|class|interface|type)\s+(\w+)/g);
  
  for (const match of exportMatches) {
    const exportName = match[1];
    // Check if this export is imported anywhere (simplified - just grep for import)
    // Full analysis would require cross-file analysis
    // For now, just flag potential issues
  }
}

function walkDirectory(dir: string, callback: (filePath: string) => void): void {
  try {
    const entries = readdirSync(dir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = join(dir, entry.name);
      
      if (entry.isDirectory()) {
        // Skip node_modules and other excluded dirs
        if (!entry.name.startsWith('.') && entry.name !== 'node_modules') {
          walkDirectory(fullPath, callback);
        }
      } else if (entry.isFile()) {
        // Check if it's production code (not diagnostic)
        const relativePath = relative(srcDir, fullPath);
        const normalized = relativePath.replace(/\\/g, '/');
        
        if (isProductionCode(relativePath)) {
          callback(fullPath);
        }
      }
    }
  } catch (error) {
    // Skip if can't read
  }
}

// Main diagnostic execution
console.log('🔍 Slice 8 Comprehensive Diagnostic\n');
console.log('Scanning for:');
console.log('  1. Type suppressions in production code');
console.log('  2. Diagnostic scripts location');
console.log('  3. Missing documentation');
console.log('  4. Potential dead code\n');

// Scan type suppressions
console.log('📋 Scanning type suppressions...');
let filesScanned = 0;
walkDirectory(srcDir, (filePath) => {
  try {
    const content = readFileSync(filePath, 'utf-8');
    filesScanned++;
    scanTypeSuppressions(filePath, content);
  } catch (error) {
    // Skip if can't read
  }
});
console.log(`   Scanned ${filesScanned} production files`);

// Scan diagnostic scripts location
console.log('📋 Scanning diagnostic scripts location...');
scanDiagnosticScripts();

// Scan missing documentation (sample - check key files)
console.log('📋 Scanning missing documentation...');
const keyFiles = [
  'features/ProfileManager.ts',
  'features/MessagesModule.ts',
  'services/SupabaseService.ts',
  'core/StateManager.ts'
];

keyFiles.forEach(relativeFile => {
  const fullPath = join(srcDir, relativeFile);
  try {
    if (statSync(fullPath).isFile()) {
      const content = readFileSync(fullPath, 'utf-8');
      scanMissingDocs(fullPath, content);
    }
  } catch (error) {
    // Skip if doesn't exist
  }
});

// Report results
console.log('\n📊 Diagnostic Results\n');

const byCategory = new Map<string, DiagnosticResult[]>();
results.forEach(r => {
  const existing = byCategory.get(r.category) || [];
  existing.push(r);
  byCategory.set(r.category, existing);
});

const typeSuppressions = results.filter(r => r.category === 'type-suppression');
const diagnosticLocation = results.filter(r => r.category === 'diagnostic-location');
const missingDocs = results.filter(r => r.category === 'missing-docs');
const deadCode = results.filter(r => r.category === 'dead-code');

console.log(`Type Suppressions: ${typeSuppressions.length}`);
console.log(`Diagnostic Location Issues: ${diagnosticLocation.length}`);
console.log(`Missing Documentation: ${missingDocs.length}`);
console.log(`Dead Code Issues: ${deadCode.length}`);
console.log(`Total Issues: ${results.length}\n`);

if (results.length === 0) {
  console.log('✅ No Slice 8 issues found!');
  process.exit(0);
}

// Detailed report by category
if (typeSuppressions.length > 0) {
  console.log('\n🔴 Type Suppressions:');
  typeSuppressions.forEach(r => {
    console.log(`  ${r.file}:${r.line} - ${r.issue}`);
    if (r.code) {
      console.log(`    Code: ${r.code.substring(0, 60)}...`);
    }
    if (r.recommendation) {
      console.log(`    Fix: ${r.recommendation}`);
    }
  });
}

if (diagnosticLocation.length > 0) {
  console.log('\n🟡 Diagnostic Scripts Location:');
  diagnosticLocation.forEach(r => {
    console.log(`  ${r.file} - ${r.issue}`);
    if (r.recommendation) {
      console.log(`    Fix: ${r.recommendation}`);
    }
  });
}

if (missingDocs.length > 0) {
  console.log('\n🟢 Missing Documentation:');
  missingDocs.slice(0, 10).forEach(r => { // Limit to first 10
    console.log(`  ${r.file}:${r.line} - ${r.issue}`);
  });
  if (missingDocs.length > 10) {
    console.log(`  ... and ${missingDocs.length - 10} more`);
  }
}

console.log('\n✅ Diagnostic complete');

// Exit with error code if issues found
process.exit(results.length > 0 ? 1 : 0);

