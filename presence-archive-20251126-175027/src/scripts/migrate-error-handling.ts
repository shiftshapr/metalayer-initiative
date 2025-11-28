/**
 * Automated Error Handling Migration Script
 * 
 * Migrates error handling patterns across the codebase to use the standardized
 * ErrorHandler utilities and proper TypeScript error typing.
 * 
 * Features:
 * - Converts `catch (error)` to `catch (error: unknown)`
 * - Replaces console.log/error/warn with handleError/Logger
 * - Adds proper error context
 * - Adds necessary imports
 * - Dry-run mode for safety
 * 
 * Usage:
 *   npx tsx src/scripts/migrate-error-handling.ts --dry-run  # Preview changes
 *   npx tsx src/scripts/migrate-error-handling.ts            # Apply changes
 */

import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join, relative, dirname } from 'path';

interface MigrationResult {
  file: string;
  changes: number;
  errors: string[];
  warnings: string[];
}

interface MigrationStats {
  totalFiles: number;
  filesModified: number;
  totalChanges: number;
  errors: number;
  warnings: number;
}

const srcDir = join(__dirname, '..');
const excludedDirs = ['node_modules', 'dist', 'build', 'extension', '.git', 'scripts'];
const excludedFiles = ['.test.ts', '.spec.ts', '.d.ts'];
const dryRun = process.argv.includes('--dry-run') || process.argv.includes('-d');

// Files already migrated (skip these)
const alreadyMigrated = new Set([
  'features/ProfileManager.ts',
  'features/MessagesModule.ts'
]);

/**
 * Check if file should be processed
 */
function shouldProcessFile(filePath: string): boolean {
  const relativePath = relative(srcDir, filePath);
  
  // Skip already migrated files
  if (alreadyMigrated.has(relativePath)) {
    return false;
  }
  
  // Skip diagnostic scripts
  if (relativePath.includes('diagnose-') || relativePath.includes('migrate-')) {
    return false;
  }
  
  // Skip test files
  if (excludedFiles.some(ext => filePath.endsWith(ext))) {
    return false;
  }
  
  // Skip excluded directories
  if (excludedDirs.some(dir => relativePath.includes(dir))) {
    return false;
  }
  
  return filePath.endsWith('.ts') || filePath.endsWith('.js');
}

/**
 * Get all TypeScript/JavaScript files
 */
function getAllFiles(dir: string, fileList: string[] = []): string[] {
  const files = readdirSync(dir);
  
  files.forEach(file => {
    const filePath = join(dir, file);
    const stat = statSync(filePath);
    
    if (stat.isDirectory()) {
      const dirName = file;
      if (!excludedDirs.includes(dirName)) {
        getAllFiles(filePath, fileList);
      }
    } else if (shouldProcessFile(filePath)) {
      fileList.push(filePath);
    }
  });
  
  return fileList;
}

/**
 * Calculate relative import path
 */
function getRelativeImportPath(fromFile: string, toModule: string): string {
  const fromDir = dirname(fromFile);
  const toPath = join(srcDir, toModule);
  const relativePath = relative(fromDir, toPath);
  
  // Ensure it starts with ./
  if (!relativePath.startsWith('.')) {
    return './' + relativePath;
  }
  
  return relativePath.replace(/\\/g, '/');
}

/**
 * Check if file has import
 */
function hasImport(content: string, modulePath: string): boolean {
  const importPattern = new RegExp(`import.*from\\s+['"]${modulePath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}['"]`, 'i');
  return importPattern.test(content);
}

/**
 * Add import if not present
 */
function ensureImports(content: string, filePath: string): string {
  let modified = content;
  
  // Check for ErrorHandler import
  const errorHandlerPath = getRelativeImportPath(filePath, 'utils/ErrorHandler.js');
  if (!hasImport(modified, errorHandlerPath) && !hasImport(modified, '../utils/ErrorHandler') && !hasImport(modified, './utils/ErrorHandler')) {
    // Check if there are any catch blocks that need ErrorHandler
    if (modified.includes('catch') && (modified.includes('console.error') || modified.includes('console.warn') || modified.includes('console.log'))) {
      // Find the last import statement
      const importMatch = modified.match(/(import\s+.*?from\s+['"].*?['"];?\s*\n)/g);
      if (importMatch && importMatch.length > 0) {
        const lastImport = importMatch[importMatch.length - 1];
        const lastImportIndex = modified.lastIndexOf(lastImport) + lastImport.length;
        const importStatement = `import { handleError, type ErrorContext } from '${errorHandlerPath}';\n`;
        modified = modified.slice(0, lastImportIndex) + importStatement + modified.slice(lastImportIndex);
      } else {
        // No imports, add at the top after any comments
        const firstLineMatch = modified.match(/^(\/\/.*?\n|\/\*[\s\S]*?\*\/\s*\n)*/);
        if (firstLineMatch) {
          const insertIndex = firstLineMatch[0].length;
          const importStatement = `import { handleError, type ErrorContext } from '${errorHandlerPath}';\n`;
          modified = modified.slice(0, insertIndex) + importStatement + modified.slice(insertIndex);
        }
      }
    }
  }
  
  // Check for Logger import (if using Logger)
  const loggerPath = getRelativeImportPath(filePath, 'utils/Logger.js');
  if (modified.includes('Logger.') && !hasImport(modified, loggerPath) && !hasImport(modified, '../utils/Logger') && !hasImport(modified, './utils/Logger')) {
    const importMatch = modified.match(/(import\s+.*?from\s+['"].*?['"];?\s*\n)/g);
    if (importMatch && importMatch.length > 0) {
      const lastImport = importMatch[importMatch.length - 1];
      const lastImportIndex = modified.lastIndexOf(lastImport) + lastImport.length;
      const importStatement = `import { Logger } from '${loggerPath}';\n`;
      modified = modified.slice(0, lastImportIndex) + importStatement + modified.slice(lastImportIndex);
    }
  }
  
  return modified;
}

/**
 * Extract function/operation name from context
 */
function extractOperationName(lineNum: number, lines: string[]): string {
  // Look backwards for function name
  for (let i = lineNum - 1; i >= Math.max(0, lineNum - 20); i--) {
    const line = lines[i];
    const funcMatch = line.match(/(?:async\s+)?(?:function\s+)?(\w+)\s*[\(:]/);
    if (funcMatch) {
      return funcMatch[1];
    }
  }
  return 'unknown-operation';
}

/**
 * Extract component name from file path
 */
function extractComponentName(filePath: string): string {
  const relativePath = relative(srcDir, filePath);
  const parts = relativePath.split(/[/\\]/);
  const fileName = parts[parts.length - 1].replace(/\.ts$/, '').replace(/\.js$/, '');
  
  // Capitalize first letter and remove common suffixes
  return fileName.charAt(0).toUpperCase() + fileName.slice(1).replace(/Module$/, '').replace(/Manager$/, '');
}

/**
 * Build error context from catch block
 */
function buildErrorContext(
  catchLineNum: number,
  lines: string[],
  filePath: string,
  catchBody: string
): string {
  const operation = extractOperationName(catchLineNum, lines);
  const component = extractComponentName(filePath);
  
  // Try to extract relevant IDs from catch body or surrounding code
  const context: string[] = [];
  
  // Look for common variable names in the catch block or before it
  const beforeCatch = lines.slice(Math.max(0, catchLineNum - 10), catchLineNum).join('\n');
  const messageIdMatch = beforeCatch.match(/(?:message|msg)\.id|messageId|message_id/);
  const pageIdMatch = beforeCatch.match(/pageId/);
  const userIdMatch = beforeCatch.match(/userId|user\.id/);
  
  if (messageIdMatch) {
    context.push('messageId: message?.id');
  }
  if (pageIdMatch && !catchBody.includes('pageId')) {
    context.push('pageId');
  }
  if (userIdMatch) {
    context.push('userId: currentUser?.id');
  }
  
  let contextStr = `operation: '${operation}',\n            component: '${component}'`;
  if (context.length > 0) {
    contextStr += ',\n            ' + context.join(', ');
  }
  
  return contextStr;
}

/**
 * Migrate a single file
 */
function migrateFile(filePath: string): MigrationResult {
  const result: MigrationResult = {
    file: relative(srcDir, filePath),
    changes: 0,
    errors: [],
    warnings: []
  };
  
  try {
    let content = readFileSync(filePath, 'utf-8');
    const originalContent = content;
    const lines = content.split('\n');
    
    // Skip diagnostic and utility files that might intentionally use console
    const relativePath = relative(srcDir, filePath);
    if (relativePath.includes('diagnostic') || relativePath.includes('DIAGNOSTIC')) {
      result.warnings.push('Skipped diagnostic file - may intentionally use console');
      return result;
    }
    
    // Step 1: Fix untyped catch blocks (more precise matching)
    content = content.replace(/catch\s*\(\s*(\w+)\s*\)/g, (match, errorVar, offset) => {
      // Skip if already typed
      const lineIndex = content.substring(0, offset).split('\n').length - 1;
      const line = lines[lineIndex];
      if (line.includes(': unknown') || line.includes(': Error') || line.includes(': any')) {
        return match; // Already typed
      }
      
      // Only fix common error variable names
      if (errorVar === 'error' || errorVar === 'e' || errorVar === 'err') {
        result.changes++;
        return `catch (${errorVar}: unknown)`;
      }
      return match;
    });
    
    // Step 2: Replace console.error/warn in catch blocks with handleError
    // Use a more sophisticated approach to handle nested braces
    let newContent = content;
    const catchRegex = /catch\s*\([^)]*\)\s*\{/g;
    let catchMatch;
    const replacements: Array<{ start: number; end: number; replacement: string }> = [];
    
    // Find all catch blocks
    while ((catchMatch = catchRegex.exec(content)) !== null) {
      const catchStart = catchMatch.index;
      const catchHeader = catchMatch[0];
      
      // Find the matching closing brace
      let braceCount = 1;
      let pos = catchStart + catchHeader.length;
      let catchEnd = pos;
      
      while (pos < content.length && braceCount > 0) {
        if (content[pos] === '{') braceCount++;
        if (content[pos] === '}') braceCount--;
        if (braceCount === 0) {
          catchEnd = pos + 1;
          break;
        }
        pos++;
      }
      
      if (braceCount !== 0) continue; // Malformed, skip
      
      const catchBlock = content.substring(catchStart, catchEnd);
      const catchBody = catchBlock.substring(catchHeader.length, catchBlock.length - 1);
      
      // Skip if already using handleError or Logger
      if (catchBody.includes('handleError') || catchBody.includes('Logger.error') || catchBody.includes('Logger.warn')) {
        continue;
      }
      
      // Skip empty catch blocks or comments only
      const catchBodyTrimmed = catchBody.replace(/\/\/.*$/gm, '').replace(/\/\*[\s\S]*?\*\//g, '').trim();
      if (catchBodyTrimmed.length < 10) {
        continue; // Too small, might be intentionally empty
      }
      
      // Find console.error/warn calls (skip console.log in catch blocks - those are usually debug)
      const consoleErrorWarnRegex = /console\.(error|warn)\s*\([^)]*\)/g;
      let consoleMatch;
      let modifiedCatchBody = catchBody;
      let hasConsole = false;
      
      while ((consoleMatch = consoleErrorWarnRegex.exec(catchBody)) !== null) {
        hasConsole = true;
        const consoleCall = consoleMatch[0];
        const logLevel = consoleMatch[1];
        
        // Extract the line number
        const lineNum = content.substring(0, catchStart).split('\n').length;
        
        // Build context
        const contextStr = buildErrorContext(lineNum, lines, filePath, catchBody);
        
        // Check if it's a user notification scenario
        const hasUserNotification = catchBody.includes('showNotification') || 
                                   catchBody.includes('alert') ||
                                   catchBody.includes('toast');
        
        // Extract error message if possible
        const messageMatch = consoleCall.match(/['"]([^'"]+)['"]/);
        const userMessage = messageMatch ? messageMatch[1].replace(/❌|⚠️|🔧|✅/g, '').trim() : '';
        
        // Replace console call with handleError
        const handleErrorCall = `handleError(error, {
            log: true,
            logLevel: '${logLevel}',${hasUserNotification ? `
            showUserNotification: true,
            userMessage: '${userMessage || 'An error occurred'}',` : ''}
            context: {
                ${contextStr}
            }
        });`;
        
        // Replace the console call
        modifiedCatchBody = modifiedCatchBody.replace(consoleCall, handleErrorCall);
        result.changes++;
        
        // Remove showNotification code if present
        if (hasUserNotification) {
          modifiedCatchBody = modifiedCatchBody.replace(/const\s+showNotification\s*=[^;]*;?\s*/g, '');
          modifiedCatchBody = modifiedCatchBody.replace(/if\s*\(showNotification[^}]*\}\s*/g, '');
        }
      }
      
      if (hasConsole) {
        const newCatchBlock = catchHeader + modifiedCatchBody + '\n    }';
        replacements.push({
          start: catchStart,
          end: catchEnd,
          replacement: newCatchBlock
        });
      }
    }
    
    // Apply replacements in reverse order to maintain indices
    replacements.reverse().forEach(repl => {
      newContent = newContent.substring(0, repl.start) + repl.replacement + newContent.substring(repl.end);
    });
    
    content = newContent;
    
    // Step 3: Ensure imports are present
    content = ensureImports(content, filePath);
    
    // Step 4: Write file if changed
    if (content !== originalContent) {
      if (!dryRun) {
        writeFileSync(filePath, content, 'utf-8');
      }
      result.changes += content.split('\n').length - originalContent.split('\n').length;
    }
    
  } catch (error) {
    result.errors.push(error instanceof Error ? error.message : String(error));
  }
  
  return result;
}

/**
 * Main migration function
 */
function runMigration(): void {
  console.log('🔄 Starting Error Handling Migration...\n');
  console.log(`Mode: ${dryRun ? '🔍 DRY RUN (no files will be modified)' : '✏️  LIVE (files will be modified)'}\n`);
  
  const files = getAllFiles(srcDir);
  console.log(`📁 Found ${files.length} files to process\n`);
  
  const results: MigrationResult[] = [];
  const stats: MigrationStats = {
    totalFiles: files.length,
    filesModified: 0,
    totalChanges: 0,
    errors: 0,
    warnings: 0
  };
  
  files.forEach(file => {
    const result = migrateFile(file);
    results.push(result);
    
    if (result.changes > 0) {
      stats.filesModified++;
      stats.totalChanges += result.changes;
    }
    
    if (result.errors.length > 0) {
      stats.errors += result.errors.length;
    }
    
    if (result.warnings.length > 0) {
      stats.warnings += result.warnings.length;
    }
  });
  
  // Print summary
  console.log('='.repeat(80));
  console.log('MIGRATION SUMMARY');
  console.log('='.repeat(80));
  console.log(`Total Files Processed: ${stats.totalFiles}`);
  console.log(`Files Modified: ${stats.filesModified}`);
  console.log(`Total Changes: ${stats.totalChanges}`);
  console.log(`Errors: ${stats.errors}`);
  console.log(`Warnings: ${stats.warnings}`);
  console.log();
  
  // Print detailed results
  const modifiedFiles = results.filter(r => r.changes > 0);
  if (modifiedFiles.length > 0) {
    console.log('Modified Files:');
    console.log('-'.repeat(80));
    modifiedFiles.forEach(result => {
      console.log(`  ${result.file}: ${result.changes} changes`);
      if (result.errors.length > 0) {
        result.errors.forEach(err => console.log(`    ❌ Error: ${err}`));
      }
      if (result.warnings.length > 0) {
        result.warnings.forEach(warn => console.log(`    ⚠️  Warning: ${warn}`));
      }
    });
  }
  
  if (dryRun) {
    console.log('\n🔍 DRY RUN COMPLETE - No files were modified');
    console.log('Run without --dry-run to apply changes');
  } else {
    console.log('\n✅ Migration complete!');
    console.log('Please review the changes and run tests to verify.');
  }
  
  console.log('='.repeat(80));
}

// Run migration
if (require.main === module || import.meta.url === `file://${process.argv[1]}`) {
  runMigration();
}

export { runMigration, migrateFile, type MigrationResult, type MigrationStats };

