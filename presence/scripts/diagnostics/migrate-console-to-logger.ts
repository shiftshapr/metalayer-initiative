/**
 * Migration Script: Replace console.* calls with Logger methods
 * 
 * This script helps migrate console.log/error/warn/info/debug to Logger methods.
 * 
 * Usage:
 *   npx tsx presence/src/scripts/migrate-console-to-logger.ts <file-path>
 * 
 * Or run in batch mode to process multiple files.
 */

import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

interface Replacement {
  pattern: RegExp;
  replacement: string;
  description: string;
}

const REPLACEMENTS: Replacement[] = [
  {
    pattern: /console\.error\s*\(/g,
    replacement: 'Logger.error(',
    description: 'console.error → Logger.error'
  },
  {
    pattern: /console\.warn\s*\(/g,
    replacement: 'Logger.warn(',
    description: 'console.warn → Logger.warn'
  },
  {
    pattern: /console\.info\s*\(/g,
    replacement: 'Logger.info(',
    description: 'console.info → Logger.info'
  },
  {
    pattern: /console\.debug\s*\(/g,
    replacement: 'Logger.debug(',
    description: 'console.debug → Logger.debug'
  },
  {
    pattern: /console\.log\s*\(/g,
    replacement: 'Logger.debug(', // Most console.log should be debug level
    description: 'console.log → Logger.debug (most cases)'
  },
];

function hasLoggerImport(content: string): boolean {
  return /import\s+.*Logger.*from\s+['"].*Logger['"]/i.test(content);
}

function addLoggerImport(content: string, importPath: string = '../utils/Logger.js'): string {
  // Find the last import statement
  const importLines = content.split('\n');
  let lastImportIndex = -1;
  
  for (let i = 0; i < importLines.length; i++) {
    if (importLines[i].trim().startsWith('import ')) {
      lastImportIndex = i;
    } else if (lastImportIndex >= 0 && importLines[i].trim() === '') {
      // Empty line after imports - stop
      break;
    }
  }
  
  if (lastImportIndex >= 0) {
    // Calculate relative path from file location
    // This is a simplified version - may need adjustment
    const loggerImport = `import { Logger } from '${importPath}';`;
    importLines.splice(lastImportIndex + 1, 0, loggerImport);
    return importLines.join('\n');
  }
  
  // No imports found, add at the top
  return `import { Logger } from '${importPath}';\n${content}`;
}

function migrateFile(filePath: string, dryRun: boolean = false): { changed: boolean; replacements: number } {
  try {
    let content = readFileSync(filePath, 'utf-8');
    const originalContent = content;
    let totalReplacements = 0;
    
    // Check if Logger import is needed
    const needsLoggerImport = !hasLoggerImport(content);
    
    // Apply replacements
    REPLACEMENTS.forEach(({ pattern, replacement, description }) => {
      const matches = content.match(pattern);
      if (matches) {
        content = content.replace(pattern, replacement);
        totalReplacements += matches.length;
        console.log(`  ✓ ${description}: ${matches.length} replacements`);
      }
    });
    
    // Add Logger import if needed and replacements were made
    if (needsLoggerImport && totalReplacements > 0) {
      // Calculate relative path (simplified - assumes src/ structure)
      const relativePath = filePath.includes('src/features/') 
        ? '../utils/Logger.js'
        : filePath.includes('src/utils/')
        ? './Logger.js'
        : filePath.includes('src/services/')
        ? '../utils/Logger.js'
        : '../utils/Logger.js';
      
      content = addLoggerImport(content, relativePath);
      console.log(`  ✓ Added Logger import from ${relativePath}`);
    }
    
    const changed = content !== originalContent;
    
    if (changed && !dryRun) {
      writeFileSync(filePath, content, 'utf-8');
      console.log(`  ✓ File updated: ${filePath}`);
    } else if (changed && dryRun) {
      console.log(`  [DRY RUN] Would update: ${filePath}`);
    }
    
    return { changed, replacements: totalReplacements };
  } catch (error) {
    console.error(`  ✗ Error processing ${filePath}:`, error);
    return { changed: false, replacements: 0 };
  }
}

// Main execution
const args = process.argv.slice(2);

if (args.length === 0) {
  console.log('Usage: npx tsx migrate-console-to-logger.ts <file-path> [--dry-run]');
  console.log('Example: npx tsx migrate-console-to-logger.ts src/features/ProfileManager.ts');
  process.exit(1);
}

const filePath = args[0];
const dryRun = args.includes('--dry-run');

console.log(`\n${dryRun ? '[DRY RUN] ' : ''}Migrating console.* to Logger in: ${filePath}\n`);

const result = migrateFile(filePath, dryRun);

if (result.changed) {
  console.log(`\n✓ Migration complete: ${result.replacements} replacements made`);
} else {
  console.log('\n✓ No changes needed (or dry run)');
}

export { migrateFile, addLoggerImport, hasLoggerImport };


