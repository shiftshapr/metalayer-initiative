/**
 * DIAGNOSTIC SCRIPT: Slice 4 - Mixed JavaScript/TypeScript in Source
 * 
 * Identifies:
 * 1. JavaScript files in src/ directory (should be in separate scripts/ or diagnostics/)
 * 2. CommonJS require() usage in TypeScript files (should use ES modules)
 * 3. Mixed module systems
 * 4. Diagnostic scripts location and build exclusion status
 * 
 * Run: npx tsx presence/src/scripts/diagnose-slice4-mixed-js-ts.ts
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

interface DiagnosticResult {
  category: 'js-in-src' | 'commonjs-in-ts' | 'build-config' | 'module-mix';
  file: string;
  line?: number;
  issue: string;
  severity: 'critical' | 'high' | 'medium' | 'info';
  recommendation: string;
}

const results: DiagnosticResult[] = [];
// Get script directory (works with ES modules via tsx)
const scriptPath = fileURLToPath(import.meta.url);
const scriptDir = dirname(scriptPath);
// Script is in presence/scripts/, so go up one level to presence/
const projectRoot = path.resolve(scriptDir, '..');
const srcDir = path.join(projectRoot, 'src');

// 1. Find all JavaScript files in src/
function findJsFilesInSrc(dir: string, relativePath: string = ''): void {
  try {
    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      const relPath = path.join(relativePath, entry.name);

      if (entry.isFile() && entry.name.endsWith('.js')) {
        // Check if it's a diagnostic script
        const isDiagnostic = relPath.includes('scripts/') || 
                           relPath.includes('diagnostics/') ||
                           entry.name.startsWith('diagnose-') ||
                           entry.name.startsWith('test-') ||
                           entry.name.startsWith('check-');

        results.push({
          category: 'js-in-src',
          file: `src/${relPath}`,
          issue: isDiagnostic 
            ? 'Diagnostic script in src/ - should be moved to presence/scripts/'
            : 'JavaScript file in src/ - should be migrated to TypeScript',
          severity: isDiagnostic ? 'high' : 'critical',
          recommendation: isDiagnostic
            ? 'Move to presence/scripts/ directory (outside src/)'
            : 'Migrate to TypeScript or move to scripts/ if diagnostic'
        });
      } else if (entry.isDirectory() && 
                 entry.name !== 'node_modules' && 
                 entry.name !== '.git' &&
                 entry.name !== 'dist' &&
                 entry.name !== 'build') {
        findJsFilesInSrc(fullPath, relPath);
      }
    }
  } catch (error) {
    console.error(`Error scanning ${dir}:`, error);
  }
}

// 2. Find CommonJS require() in TypeScript files
function findCommonJsInTs(dir: string, relativePath: string = ''): void {
  try {
    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      const relPath = path.join(relativePath, entry.name);

      if (entry.isFile() && entry.name.endsWith('.ts') && !entry.name.endsWith('.d.ts')) {
        // Skip diagnostic scripts for this check (they can use require)
        if (relPath.includes('scripts/') || relPath.includes('diagnostics/')) {
          continue;
        }

        try {
          const content = fs.readFileSync(fullPath, 'utf-8');
          const lines = content.split('\n');

          lines.forEach((line, index) => {
            // Check for require() usage
            if (line.includes('require(') && !line.trim().startsWith('//')) {
              // Allow require in comments and string literals
              const requireMatch = line.match(/require\(/);
              if (requireMatch) {
                const beforeRequire = line.substring(0, requireMatch.index || 0);
                // Check if it's in a string or comment
                const inString = (beforeRequire.match(/['"`]/g) || []).length % 2 !== 0;
                const inComment = beforeRequire.includes('//') || beforeRequire.includes('/*');
                
                if (!inString && !inComment) {
                  results.push({
                    category: 'commonjs-in-ts',
                    file: `src/${relPath}`,
                    line: index + 1,
                    issue: 'CommonJS require() used in TypeScript file',
                    severity: 'high',
                    recommendation: 'Convert to ES module import: import * as module from "module"'
                  });
                }
              }
            }
          });
        } catch (error) {
          // Skip files that can't be read
        }
      } else if (entry.isDirectory() && 
                 entry.name !== 'node_modules' && 
                 entry.name !== '.git' &&
                 entry.name !== 'dist' &&
                 entry.name !== 'build') {
        findCommonJsInTs(fullPath, relPath);
      }
    }
  } catch (error) {
    console.error(`Error scanning ${dir}:`, error);
  }
}

// 3. Check build configuration
function checkBuildConfig(): void {
  // Try multiple possible locations for tsconfig.json
  let tsconfigPath = path.join(projectRoot, 'tsconfig.json');
  if (!fs.existsSync(tsconfigPath) && projectRoot.includes('metalayer-initiative')) {
    // If projectRoot is metalayer-initiative, tsconfig is in presence/
    tsconfigPath = path.join(projectRoot, 'presence/tsconfig.json');
  } else if (!fs.existsSync(tsconfigPath)) {
    // If projectRoot is presence/, tsconfig is here
    tsconfigPath = path.join(projectRoot, 'tsconfig.json');
  }
  
  if (fs.existsSync(tsconfigPath)) {
    try {
      const tsconfig = JSON.parse(fs.readFileSync(tsconfigPath, 'utf-8'));
      
      // Check if scripts are excluded
      const exclude = tsconfig.exclude || [];
      const scriptsExcluded = exclude.some((pattern: string) => 
        pattern.includes('scripts') || pattern.includes('diagnostic')
      );

      if (!scriptsExcluded) {
        results.push({
          category: 'build-config',
          file: 'tsconfig.json',
          issue: 'Scripts directory not explicitly excluded from build',
          severity: 'medium',
          recommendation: 'Add "**/scripts/**" to tsconfig.json exclude array'
        });
      }

      // Check module system
      if (tsconfig.compilerOptions?.module !== 'ES2020' && 
          tsconfig.compilerOptions?.module !== 'ESNext') {
        results.push({
          category: 'build-config',
          file: 'tsconfig.json',
          issue: `Module system is ${tsconfig.compilerOptions?.module}, should be ES2020 or ESNext`,
          severity: 'info',
          recommendation: 'Set module to "ES2020" or "ESNext" for ES modules'
        });
      }
    } catch (error) {
      results.push({
        category: 'build-config',
        file: 'tsconfig.json',
        issue: 'Could not parse tsconfig.json',
        severity: 'high',
        recommendation: 'Fix tsconfig.json syntax errors'
      });
    }
  } else {
    results.push({
      category: 'build-config',
      file: 'tsconfig.json',
      issue: 'tsconfig.json not found',
      severity: 'critical',
      recommendation: 'Create tsconfig.json with proper configuration'
    });
  }
}

// 4. Check for module mixing (import and require in same file)
function checkModuleMixing(dir: string, relativePath: string = ''): void {
  try {
    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      const relPath = path.join(relativePath, entry.name);

      if (entry.isFile() && entry.name.endsWith('.ts') && !entry.name.endsWith('.d.ts')) {
        // Skip diagnostic scripts
        if (relPath.includes('scripts/') || relPath.includes('diagnostics/')) {
          continue;
        }

        try {
          const content = fs.readFileSync(fullPath, 'utf-8');
          const hasImport = /^import\s+/.test(content) || /^import\s*\{/.test(content) || /^import\s*\*/.test(content);
          const hasRequire = /require\(/.test(content);

          if (hasImport && hasRequire) {
            results.push({
              category: 'module-mix',
              file: `src/${relPath}`,
              issue: 'File uses both ES modules (import) and CommonJS (require)',
              severity: 'high',
              recommendation: 'Convert all require() to import statements for consistency'
            });
          }
        } catch (error) {
          // Skip files that can't be read
        }
      } else if (entry.isDirectory() && 
                 entry.name !== 'node_modules' && 
                 entry.name !== '.git' &&
                 entry.name !== 'dist' &&
                 entry.name !== 'build') {
        checkModuleMixing(fullPath, relPath);
      }
    }
  } catch (error) {
    console.error(`Error scanning ${dir}:`, error);
  }
}

// Run diagnostics
console.log('🔍 Diagnosing Slice 4: Mixed JavaScript/TypeScript in Source...\n');

console.log('1. Scanning for JavaScript files in src/...');
findJsFilesInSrc(srcDir);

console.log('2. Scanning for CommonJS require() in TypeScript files...');
findCommonJsInTs(srcDir);

console.log('3. Checking build configuration...');
checkBuildConfig();

console.log('4. Checking for module mixing...');
checkModuleMixing(srcDir);

// Generate report
console.log('\n' + '='.repeat(80));
console.log('SLICE 4 DIAGNOSTIC REPORT');
console.log('='.repeat(80) + '\n');

const byCategory = {
  'js-in-src': results.filter(r => r.category === 'js-in-src'),
  'commonjs-in-ts': results.filter(r => r.category === 'commonjs-in-ts'),
  'build-config': results.filter(r => r.category === 'build-config'),
  'module-mix': results.filter(r => r.category === 'module-mix')
};

const bySeverity = {
  critical: results.filter(r => r.severity === 'critical'),
  high: results.filter(r => r.severity === 'high'),
  medium: results.filter(r => r.severity === 'medium'),
  info: results.filter(r => r.severity === 'info')
};

console.log(`Total issues found: ${results.length}\n`);

console.log('By Category:');
console.log(`  JavaScript files in src/: ${byCategory['js-in-src'].length}`);
console.log(`  CommonJS in TypeScript: ${byCategory['commonjs-in-ts'].length}`);
console.log(`  Build configuration: ${byCategory['build-config'].length}`);
console.log(`  Module mixing: ${byCategory['module-mix'].length}\n`);

console.log('By Severity:');
console.log(`  Critical: ${bySeverity.critical.length}`);
console.log(`  High: ${bySeverity.high.length}`);
console.log(`  Medium: ${bySeverity.medium.length}`);
console.log(`  Info: ${bySeverity.info.length}\n`);

// Detailed report
if (byCategory['js-in-src'].length > 0) {
  console.log('📁 JAVASCRIPT FILES IN SRC/:');
  byCategory['js-in-src'].forEach(r => {
    console.log(`  [${r.severity.toUpperCase()}] ${r.file}`);
    console.log(`    Issue: ${r.issue}`);
    console.log(`    Fix: ${r.recommendation}\n`);
  });
}

if (byCategory['commonjs-in-ts'].length > 0) {
  console.log('📦 COMMONJS IN TYPESCRIPT:');
  byCategory['commonjs-in-ts'].forEach(r => {
    console.log(`  [${r.severity.toUpperCase()}] ${r.file}:${r.line}`);
    console.log(`    Issue: ${r.issue}`);
    console.log(`    Fix: ${r.recommendation}\n`);
  });
}

if (byCategory['module-mix'].length > 0) {
  console.log('🔄 MODULE MIXING:');
  byCategory['module-mix'].forEach(r => {
    console.log(`  [${r.severity.toUpperCase()}] ${r.file}`);
    console.log(`    Issue: ${r.issue}`);
    console.log(`    Fix: ${r.recommendation}\n`);
  });
}

if (byCategory['build-config'].length > 0) {
  console.log('⚙️  BUILD CONFIGURATION:');
  byCategory['build-config'].forEach(r => {
    console.log(`  [${r.severity.toUpperCase()}] ${r.file}`);
    console.log(`    Issue: ${r.issue}`);
    console.log(`    Fix: ${r.recommendation}\n`);
  });
}

// Summary and recommendations
console.log('\n' + '='.repeat(80));
console.log('RECOMMENDATIONS');
console.log('='.repeat(80) + '\n');

if (byCategory['js-in-src'].length > 0) {
  const diagnosticCount = byCategory['js-in-src'].filter(r => 
    r.issue.includes('Diagnostic script')
  ).length;
  
  if (diagnosticCount > 0) {
    console.log(`1. Move ${diagnosticCount} diagnostic script(s) from src/scripts/ to presence/scripts/`);
    console.log('   This separates diagnostic code from production source.\n');
  }
  
  const productionCount = byCategory['js-in-src'].length - diagnosticCount;
  if (productionCount > 0) {
    console.log(`2. Migrate ${productionCount} JavaScript file(s) to TypeScript`);
    console.log('   Or move to scripts/ if they are diagnostic tools.\n');
  }
}

if (byCategory['commonjs-in-ts'].length > 0) {
  console.log(`3. Convert ${byCategory['commonjs-in-ts'].length} CommonJS require() to ES module imports`);
  console.log('   Use: import * as module from "module" instead of const module = require("module")\n');
}

if (byCategory['module-mix'].length > 0) {
  console.log(`4. Fix ${byCategory['module-mix'].length} file(s) using both import and require`);
  console.log('   Standardize on ES modules throughout.\n');
}

console.log('5. Verify build configuration excludes scripts/ from production builds');
console.log('6. Update package.json scripts if needed to reference new script locations\n');

// Exit code
const hasCritical = bySeverity.critical.length > 0;
const hasHigh = bySeverity.high.length > 0;

if (hasCritical || hasHigh) {
  console.log('❌ Issues found requiring attention');
  process.exit(1);
} else if (results.length > 0) {
  console.log('⚠️  Issues found but not critical');
  process.exit(0);
} else {
  console.log('✅ No issues found');
  process.exit(0);
}

export { results, DiagnosticResult };

