/**
 * Diagnostic Script: Slice 2 - Excessive Debug Logging
 * 
 * Analyzes console.* usage across the codebase to identify:
 * - Total console statements by type
 * - Files with most console usage
 * - Patterns indicating sensitive data logging
 * - Recommendations for Logger replacement
 * 
 * Run: npx tsx presence/src/scripts/diagnose-slice2-console-logging.ts
 */

import { readFileSync, readdirSync, statSync, existsSync } from 'fs';
import { join, relative } from 'path';

interface ConsoleUsage {
  file: string;
  line: number;
  type: 'log' | 'error' | 'warn' | 'info' | 'debug';
  content: string;
  context: string;
}

interface FileStats {
  file: string;
  total: number;
  byType: Record<string, number>;
  usages: ConsoleUsage[];
}

interface SensitivePattern {
  pattern: RegExp;
  description: string;
  severity: 'high' | 'medium' | 'low';
}

const SENSITIVE_PATTERNS: SensitivePattern[] = [
  { pattern: /(password|passwd|pwd|secret|token|api[_-]?key|auth[_-]?token)/i, description: 'Credentials/secrets', severity: 'high' },
  { pattern: /(email|user[_-]?id|session[_-]?id)/i, description: 'User identifiers', severity: 'medium' },
  { pattern: /(credit[_-]?card|ssn|social[_-]?security)/i, description: 'Financial/PII', severity: 'high' },
  { pattern: /(private|confidential|internal)/i, description: 'Private data markers', severity: 'low' },
];

const EXCLUDE_PATTERNS = [
  /node_modules/,
  /\.git/,
  /dist\//,
  /build\//,
  /extension\//,
  /\.d\.ts$/,
  /diagnose-.*\.ts$/, // Exclude diagnostic scripts themselves
  /\.js$/, // Exclude compiled .js files - only scan .ts source files
];

function shouldExclude(filePath: string): boolean {
  return EXCLUDE_PATTERNS.some(pattern => pattern.test(filePath));
}

function findConsoleStatements(content: string, filePath: string): ConsoleUsage[] {
  const usages: ConsoleUsage[] = [];
  const lines = content.split('\n');
  
  // Match console.log, console.error, console.warn, console.info, console.debug
  const consolePattern = /console\.(log|error|warn|info|debug)\s*\(/g;
  
  lines.forEach((line, index) => {
    let match;
    while ((match = consolePattern.exec(line)) !== null) {
      const type = match[1] as 'log' | 'error' | 'warn' | 'info' | 'debug';
      const startPos = match.index;
      const endPos = line.length;
      const context = line.substring(Math.max(0, startPos - 30), Math.min(line.length, startPos + 100));
      
      usages.push({
        file: filePath,
        line: index + 1,
        type,
        content: line.trim(),
        context: context.trim(),
      });
    }
  });
  
  return usages;
}

function checkSensitiveData(content: string): Array<{ pattern: string; severity: string }> {
  const found: Array<{ pattern: string; severity: string }> = [];
  
  SENSITIVE_PATTERNS.forEach(({ pattern, description, severity }) => {
    if (pattern.test(content)) {
      found.push({ pattern: description, severity });
    }
  });
  
  return found;
}

function scanDirectory(dirPath: string, basePath: string): FileStats[] {
  const results: FileStats[] = [];
  
  try {
    const entries = readdirSync(dirPath);
    
    for (const entry of entries) {
      const fullPath = join(dirPath, entry);
      const relativePath = relative(basePath, fullPath);
      
      if (shouldExclude(relativePath)) {
        continue;
      }
      
      const stat = statSync(fullPath);
      
      if (stat.isDirectory()) {
        results.push(...scanDirectory(fullPath, basePath));
      } else if (entry.endsWith('.ts')) { // Only scan TypeScript source files
        try {
          const content = readFileSync(fullPath, 'utf-8');
          const usages = findConsoleStatements(content, relativePath);
          
          if (usages.length > 0) {
            const byType: Record<string, number> = {};
            usages.forEach(usage => {
              byType[usage.type] = (byType[usage.type] || 0) + 1;
            });
            
            results.push({
              file: relativePath,
              total: usages.length,
              byType,
              usages,
            });
          }
        } catch (error) {
          console.error(`Error reading ${fullPath}:`, error);
        }
      }
    }
  } catch (error) {
    console.error(`Error scanning ${dirPath}:`, error);
  }
  
  return results;
}

function generateReport(stats: FileStats[]): void {
  console.log('\n=== SLICE 2: EXCESSIVE DEBUG LOGGING DIAGNOSTIC REPORT ===\n');
  
  // Overall statistics
  const totalStatements = stats.reduce((sum, s) => sum + s.total, 0);
  const totalByType: Record<string, number> = {};
  stats.forEach(s => {
    Object.entries(s.byType).forEach(([type, count]) => {
      totalByType[type] = (totalByType[type] || 0) + count;
    });
  });
  
  console.log('📊 OVERALL STATISTICS:');
  console.log(`   Total console statements: ${totalStatements}`);
  console.log(`   Files with console usage: ${stats.length}`);
  console.log('\n   By type:');
  Object.entries(totalByType)
    .sort(([, a], [, b]) => b - a)
    .forEach(([type, count]) => {
      console.log(`     console.${type}: ${count}`);
    });
  
  // Top files
  console.log('\n📁 TOP 20 FILES BY CONSOLE USAGE:');
  stats
    .sort((a, b) => b.total - a.total)
    .slice(0, 20)
    .forEach((stat, index) => {
      console.log(`   ${index + 1}. ${stat.file}: ${stat.total} statements`);
      Object.entries(stat.byType)
        .sort(([, a], [, b]) => b - a)
        .forEach(([type, count]) => {
          console.log(`      - console.${type}: ${count}`);
        });
    });
  
  // Sensitive data check
  console.log('\n🔒 SENSITIVE DATA CHECK:');
  const sensitiveFiles: Array<{ file: string; patterns: Array<{ pattern: string; severity: string }> }> = [];
  
  stats.forEach(stat => {
    stat.usages.forEach(usage => {
      const sensitive = checkSensitiveData(usage.content);
      if (sensitive.length > 0) {
        const existing = sensitiveFiles.find(f => f.file === stat.file);
        if (existing) {
          existing.patterns.push(...sensitive);
        } else {
          sensitiveFiles.push({ file: stat.file, patterns: sensitive });
        }
      }
    });
  });
  
  if (sensitiveFiles.length === 0) {
    console.log('   ✅ No obvious sensitive data patterns detected');
  } else {
    console.log(`   ⚠️  ${sensitiveFiles.length} files with potential sensitive data patterns:`);
    sensitiveFiles.slice(0, 10).forEach(({ file, patterns }) => {
      const uniquePatterns = Array.from(new Set(patterns.map(p => p.pattern)));
      console.log(`      - ${file}: ${uniquePatterns.join(', ')}`);
    });
  }
  
  // Recommendations
  console.log('\n💡 RECOMMENDATIONS:');
  console.log('   1. Replace console.log with Logger.debug() in production code');
  console.log('   2. Keep console.error/warn for critical errors (or use Logger.error/warn)');
  console.log('   3. Implement build-time log stripping for production');
  console.log('   4. Review files with high console usage for Logger migration');
  console.log('   5. Add environment-based log level configuration');
  
  // Migration priority
  console.log('\n🎯 MIGRATION PRIORITY (Top 10 files):');
  stats
    .sort((a, b) => b.total - a.total)
    .slice(0, 10)
    .forEach((stat, index) => {
      const priority = index < 3 ? 'HIGH' : index < 7 ? 'MEDIUM' : 'LOW';
      console.log(`   ${index + 1}. [${priority}] ${stat.file} (${stat.total} statements)`);
    });
  
  console.log('\n=== END OF DIAGNOSTIC REPORT ===\n');
}

// Main execution - scan only src/ directory
const srcPath = join(__dirname, '../src');
const basePath = join(__dirname, '../..');

// Validation: Check if src/ directory exists
if (!existsSync(srcPath)) {
  console.error(`❌ ERROR: Source directory not found: ${srcPath}`);
  console.error('   Expected path: presence/src/');
  console.error('   Current working directory:', process.cwd());
  console.error('   Script location:', __dirname);
  process.exit(1);
}

console.log('Scanning for console.* usage...');
console.log(`📁 Scanning directory: ${srcPath}`);
const stats = scanDirectory(srcPath, basePath);

// Validation: Check file count (warn if suspiciously high, suggests wrong directory)
const totalFilesScanned = stats.reduce((sum, s) => sum + s.usages.length, 0);
if (stats.length > 1000) {
  console.warn(`⚠️  WARNING: Scanned ${stats.length} files - this seems high.`);
  console.warn('   Expected: ~50-200 files in presence/src/');
  console.warn('   If this is incorrect, check that the script is scanning the right directory.');
  console.warn(`   Scanned path: ${srcPath}`);
}

generateReport(stats);

// Export for programmatic use
export { scanDirectory, findConsoleStatements, checkSensitiveData, generateReport };

