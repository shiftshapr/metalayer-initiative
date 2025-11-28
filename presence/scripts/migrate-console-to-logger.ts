/**
 * Migration Script: Console to Logger
 * 
 * Migrates console.* statements to Logger.* in a given file
 * Usage: npx tsx presence/scripts/migrate-console-to-logger.ts <file-path> <context>
 * 
 * Example: npx tsx presence/scripts/migrate-console-to-logger.ts presence/src/features/MessagesModule.ts messages
 */

import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

function migrateConsoleToLogger(filePath: string, context: string): void {
  const fullPath = join(process.cwd(), filePath);
  let content = readFileSync(fullPath, 'utf-8');
  
  // Check if Logger is imported
  const hasLoggerImport = /import\s+.*Logger.*from.*Logger/i.test(content);
  
  // Add Logger import if not present
  if (!hasLoggerImport) {
    // Find the last import statement
    const importMatch = content.match(/(?:^import\s+.*?from\s+['"].*?['"];?\s*)+/gm);
    if (importMatch) {
      const lastImport = importMatch[importMatch.length - 1];
      const lastImportIndex = content.lastIndexOf(lastImport);
      const insertIndex = lastImportIndex + lastImport.length;
      
      // Determine relative path to Logger
      const depth = filePath.split('/').length - 2; // -2 for filename and 'src'
      const relativePath = '../'.repeat(depth) + 'utils/Logger.js';
      
      content = content.slice(0, insertIndex) + 
                `\nimport { Logger } from '${relativePath}';` +
                content.slice(insertIndex);
    }
  }
  
  // Replace console.log with Logger.debug
  // Pattern: console.log('message', data) -> Logger.debug('message', data, 'context')
  content = content.replace(
    /console\.log\(([^)]+)\)/g,
    (match, args) => {
      // Parse arguments
      const trimmed = args.trim();
      
      // Handle single string argument
      if (/^['"`]/.test(trimmed)) {
        return `Logger.debug(${args}, null, '${context}')`;
      }
      
      // Handle multiple arguments - first is message, rest is data
      const parts = splitArgs(args);
      if (parts.length === 1) {
        return `Logger.debug(${parts[0]}, null, '${context}')`;
      } else if (parts.length === 2) {
        return `Logger.debug(${parts[0]}, ${parts[1]}, '${context}')`;
      } else {
        // Multiple args - combine all but first into object
        const dataArgs = parts.slice(1).join(', ');
        return `Logger.debug(${parts[0]}, { ${dataArgs} }, '${context}')`;
      }
    }
  );
  
  // Replace console.warn with Logger.warn
  content = content.replace(
    /console\.warn\(([^)]+)\)/g,
    (match, args) => {
      const trimmed = args.trim();
      if (/^['"`]/.test(trimmed)) {
        return `Logger.warn(${args}, null, '${context}')`;
      }
      const parts = splitArgs(args);
      if (parts.length === 1) {
        return `Logger.warn(${parts[0]}, null, '${context}')`;
      } else {
        return `Logger.warn(${parts[0]}, ${parts[1]}, '${context}')`;
      }
    }
  );
  
  // Replace console.error with Logger.error
  content = content.replace(
    /console\.error\(([^)]+)\)/g,
    (match, args) => {
      const trimmed = args.trim();
      if (/^['"`]/.test(trimmed)) {
        return `Logger.error(${args}, null, '${context}')`;
      }
      const parts = splitArgs(args);
      if (parts.length === 1) {
        return `Logger.error(${parts[0]}, null, '${context}')`;
      } else {
        return `Logger.error(${parts[0]}, ${parts[1]}, '${context}')`;
      }
    }
  );
  
  writeFileSync(fullPath, content, 'utf-8');
  console.log(`✅ Migrated console statements to Logger in ${filePath}`);
}

function splitArgs(args: string): string[] {
  // Simple argument splitting (handles basic cases)
  const parts: string[] = [];
  let current = '';
  let depth = 0;
  let inString = false;
  let stringChar = '';
  
  for (let i = 0; i < args.length; i++) {
    const char = args[i];
    
    if (!inString && (char === '"' || char === "'" || char === '`')) {
      inString = true;
      stringChar = char;
      current += char;
    } else if (inString && char === stringChar && args[i - 1] !== '\\') {
      inString = false;
      current += char;
    } else if (!inString && char === '(') {
      depth++;
      current += char;
    } else if (!inString && char === ')') {
      depth--;
      current += char;
    } else if (!inString && char === ',' && depth === 0) {
      parts.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  
  if (current.trim()) {
    parts.push(current.trim());
  }
  
  return parts;
}

// Main execution
const filePath = process.argv[2];
const context = process.argv[3] || 'messages';

if (!filePath) {
  console.error('Usage: npx tsx migrate-console-to-logger.ts <file-path> <context>');
  process.exit(1);
}

migrateConsoleToLogger(filePath, context);
