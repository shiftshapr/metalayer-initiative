/**
 * Check for duplicate .js files in presence/src/ directory
 * 
 * This script checks for .js files in presence/src/ that have corresponding .ts files.
 * Diagnostic scripts in presence/src/scripts/ are excluded from this check.
 * 
 * Exit codes:
 * - 0: No duplicate .js files found (or only in scripts/)
 * - 1: Duplicate .js files found in src/ (excluding scripts/)
 */

import { readdirSync, statSync, existsSync } from 'fs';
import { join, extname, basename } from 'path';

const SRC_DIR = join(process.cwd(), 'presence/src');
const SCRIPTS_DIR = join(SRC_DIR, 'scripts');
const EXCLUDED_DIRS = ['scripts', 'node_modules', 'dist', 'build', 'extension'];

interface DuplicateFile {
  jsPath: string;
  tsPath: string;
  relativePath: string;
}

function findJsFiles(dir: string, baseDir: string = SRC_DIR): string[] {
  const jsFiles: string[] = [];
  
  try {
    const entries = readdirSync(dir);
    
    for (const entry of entries) {
      const fullPath = join(dir, entry);
      const relativePath = fullPath.replace(baseDir + '/', '');
      const stat = statSync(fullPath);
      
      // Skip excluded directories
      if (stat.isDirectory()) {
        const dirName = basename(fullPath);
        if (!EXCLUDED_DIRS.includes(dirName)) {
          jsFiles.push(...findJsFiles(fullPath, baseDir));
        }
        continue;
      }
      
      // Check if it's a .js file
      if (extname(entry) === '.js') {
        jsFiles.push(fullPath);
      }
    }
  } catch (error) {
    // Ignore permission errors or missing directories
    if ((error as NodeJS.ErrnoException).code !== 'ENOENT' && 
        (error as NodeJS.ErrnoException).code !== 'EACCES') {
      console.error(`Error reading directory ${dir}:`, error);
    }
  }
  
  return jsFiles;
}

function findDuplicates(): DuplicateFile[] {
  const duplicates: DuplicateFile[] = [];
  const jsFiles = findJsFiles(SRC_DIR);
  
  for (const jsFile of jsFiles) {
    // Skip files in scripts directory
    if (jsFile.startsWith(SCRIPTS_DIR)) {
      continue;
    }
    
    // Check if corresponding .ts file exists
    const tsFile = jsFile.replace(/\.js$/, '.ts');
    
    if (existsSync(tsFile)) {
      const relativePath = jsFile.replace(SRC_DIR + '/', '');
      duplicates.push({
        jsPath: jsFile,
        tsPath: tsFile,
        relativePath
      });
    }
  }
  
  return duplicates;
}

function main(): void {
  console.log('🔍 Checking for duplicate .js files in presence/src/...\n');
  
  const duplicates = findDuplicates();
  
  if (duplicates.length === 0) {
    console.log('✅ No duplicate .js files found in presence/src/ (excluding scripts/)');
    process.exit(0);
  }
  
  console.error('❌ Found duplicate .js files in presence/src/:\n');
  
  for (const dup of duplicates) {
    console.error(`   ${dup.relativePath}`);
    console.error(`   → Corresponding .ts file exists: ${dup.tsPath.replace(SRC_DIR + '/', '')}`);
  }
  
  console.error('\n⚠️  These .js files should be deleted as they are duplicates of .ts files.');
  console.error('   Build artifacts should only exist in dist/ or extension/, not in src/.');
  console.error('\n   To fix: Delete the .js files listed above.');
  console.error('   The TypeScript compiler will generate .js files in dist/ during build.');
  
  process.exit(1);
}

main();




