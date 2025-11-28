#!/usr/bin/env ts-node
/**
 * Pre-commit hook: Check for missing interface exports
 * Detects when a class implements an interface but the interface is not exported
 * 
 * Pattern: When a class uses "implements InterfaceName", verify that InterfaceName
 * is exported from the imported module.
 * 
 * Usage:
 *   npx tsx presence/src/scripts/check-interface-exports.ts [files...]
 *   npx tsx presence/src/scripts/check-interface-exports.ts --help
 */

import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import { parseCLIArgs, getFilesFromCLI, printHelp } from './helpers/cli-utils';
import { resolveImportPath, FileInfo } from './helpers/file-walker';

interface Violation {
  file: string;
  line: number;
  interfaceName: string;
  importPath: string;
  message: string;
}

interface ImplementsClause {
  line: number;
  interface: string;
  importPath: string;
}

function findImplementsClauses(filePath: string): ImplementsClause[] {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');
  const results: ImplementsClause[] = [];
  
  // Find all import statements
  const imports = new Map<string, string>(); // interface name -> import path
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Match: import { InterfaceName } from 'path' or import type { InterfaceName } from 'path'
    const importMatch = line.match(/import\s+(?:type\s+)?\{[^}]+\}\s+from\s+['"]([^'"]+)['"]/);
    if (importMatch && importMatch[1]) {
      const importPath = importMatch[1];
      
      // Extract interface names from the import
      const interfaceMatch = line.match(/\{([^}]+)\}/);
      if (interfaceMatch && interfaceMatch[1]) {
        const names = interfaceMatch[1].split(',').map(n => n.trim());
        for (const name of names) {
          // Handle "InterfaceName as Alias" pattern
          const aliasMatch = name.match(/(\w+)(?:\s+as\s+(\w+))?/);
          if (aliasMatch && aliasMatch[1]) {
            const interfaceName = aliasMatch[2] || aliasMatch[1];
            imports.set(interfaceName, importPath);
          }
        }
      }
    }
    
    // Match: class X implements InterfaceName or class X implements Interface1, Interface2
    const implementsMatch = line.match(/class\s+\w+\s+implements\s+([^\{]+)/);
    if (implementsMatch && implementsMatch[1]) {
      const interfaces = implementsMatch[1].split(',').map(i => i.trim());
      for (const interfaceName of interfaces) {
        // Check if this interface is imported
        const importPath = imports.get(interfaceName);
        if (importPath) {
          results.push({
            line: i + 1,
            interface: interfaceName,
            importPath
          });
        } else {
          // Might be a local interface or from a different import
          // We'll check this separately
        }
      }
    }
  }
  
  return results;
}

function checkInterfaceExport(
  interfaceName: string,
  importPath: string,
  projectRoot: string,
  fromFile?: string
): boolean {
  // Resolve the import path to an actual file
  const resolvedPath = resolveImportPath(importPath, projectRoot, fromFile);
  
  if (!resolvedPath) {
    return false;
  }
  
  try {
    const content = fs.readFileSync(resolvedPath, 'utf-8');
    // Check if interface is exported
    const exportPattern = new RegExp(`export\\s+(?:interface|type|class)\\s+${interfaceName}\\b`);
    return exportPattern.test(content);
  } catch {
    return false;
  }
}

function checkFiles(files: string[], projectRoot: string): Violation[] {
  const violations: Violation[] = [];
  
  for (const file of files) {
    const fullPath = path.isAbsolute(file) ? file : path.join(projectRoot, file);
    if (!fs.existsSync(fullPath) || !file.endsWith('.ts')) {
      continue;
    }
    
    const implementsClauses = findImplementsClauses(fullPath);
    
    for (const clause of implementsClauses) {
      const isExported = checkInterfaceExport(
        clause.interface,
        clause.importPath,
        projectRoot,
        fullPath
      );
      
      if (!isExported) {
        violations.push({
          file,
          line: clause.line,
          interfaceName: clause.interface,
          importPath: clause.importPath,
          message: `Interface ${clause.interface} is not exported from ${clause.importPath}`
        });
      }
    }
  }
  
  return violations;
}

function main(): void {
  const projectRoot = path.join(__dirname, '../..');
  const parsedArgs = parseCLIArgs();
  
  if (parsedArgs.options.help) {
    printHelp(
      'check-interface-exports.ts',
      'Check for missing interface exports. Detects when a class implements an interface but the interface is not exported.',
      [
        'npx tsx presence/src/scripts/check-interface-exports.ts',
        'npx tsx presence/src/scripts/check-interface-exports.ts [files...]',
        'npx tsx presence/src/scripts/check-interface-exports.ts --verbose'
      ]
    );
    process.exit(0);
  }
  
  console.log('🔍 Checking for missing interface exports...\n');
  
  // Get files from CLI or git staged files
  let filesToCheck: string[] = [];
  const cliFiles = getFilesFromCLI(parsedArgs, []);
  
  if (cliFiles.length > 0) {
    filesToCheck = cliFiles;
  } else {
    // Get staged files from git
    try {
      const output = execSync('git diff --cached --name-only --diff-filter=ACM', {
        cwd: projectRoot,
        encoding: 'utf-8'
      });
      filesToCheck = output.split('\n')
        .filter((line): line is string => Boolean(line.trim() && line.endsWith('.ts')))
        .filter(line => line.startsWith('presence/src/'));
    } catch {
      // Not in a git repo or no staged files
      console.log('⚠️  Not in a git repo or no staged files. Use --help for usage.\n');
      process.exit(0);
    }
  }
  
  if (filesToCheck.length === 0) {
    console.log('✅ No TypeScript files to check. Skipping check.');
    process.exit(0);
  }
  
  if (parsedArgs.options.verbose) {
    console.log(`Checking ${filesToCheck.length} file(s):\n`);
    filesToCheck.forEach(file => console.log(`  - ${file}`));
    console.log();
  }
  
  // Check files directly
  const violations = checkFiles(filesToCheck, projectRoot);
  
  if (violations.length > 0) {
    console.log('❌ Missing interface exports detected:\n');
    for (const violation of violations) {
      console.log(`   ${violation.file}:${violation.line} - ${violation.message}`);
    }
    console.log('\n💡 Fix: Export the interface from the module where it\'s defined.');
    console.log('   Pattern: When a class implements an interface, the interface must be exported.');
    process.exit(1);
  }
  
  // Also use TypeScript compiler as a fallback check
  try {
    execSync('npx tsc --noEmit', {
      cwd: projectRoot,
      encoding: 'utf-8',
      stdio: 'pipe'
    });
    console.log('✅ TypeScript compilation successful. No missing interface exports detected.');
    process.exit(0);
  } catch (error: unknown) {
    const err = error as { stderr?: string; stdout?: string; message?: string };
    const errorOutput = (err.stderr || err.stdout || err.message || '').toString();
    
    // Check for TS2305 errors (module has no exported member)
    const missingExportErrors = errorOutput
      .split('\n')
      .filter((line): line is string => Boolean(line.includes('error TS2305')))
      .filter(line => {
        // Check if error is in files we're checking
        return filesToCheck.some(file => line.includes(file));
      });
    
    if (missingExportErrors.length > 0) {
      console.log('❌ Missing interface exports detected (via TypeScript compiler):\n');
      for (const error of missingExportErrors) {
        console.log(`   ${error}`);
      }
      console.log('\n💡 Fix: Export the interface from the module where it\'s defined.');
      console.log('   Pattern: When a class implements an interface, the interface must be exported.');
      process.exit(1);
    }
    
    // Other TypeScript errors might exist, but we only care about missing exports
    console.log('✅ No missing interface export errors in checked files.');
    process.exit(0);
  }
}

if (require.main === module) {
  main();
}

export { checkFiles, findImplementsClauses };




