/**
 * Diagnostic Script: Slice 2 Agent 6 - AuthModule, UserPreferencesManager & APIService Console Logging
 * 
 * Analyzes console.* usage in:
 * - presence/src/features/AuthModule.ts
 * - presence/src/utils/UserPreferencesManager.ts
 * - presence/src/services/APIService.ts
 * 
 * Run: npx tsx presence/src/scripts/diagnose-slice2-agent6.ts
 */

import { readFileSync } from 'fs';
import { join } from 'path';

interface ConsoleUsage {
  file: string;
  line: number;
  type: 'log' | 'error' | 'warn' | 'info' | 'debug';
  content: string;
  needsLogger: boolean;
}

const TARGET_FILES = [
  'presence/src/features/AuthModule.ts',
  'presence/src/utils/UserPreferencesManager.ts',
  'presence/src/services/APIService.ts',
];

function findConsoleStatements(filePath: string): ConsoleUsage[] {
  const usages: ConsoleUsage[] = [];
  
  try {
    const fullPath = join(process.cwd(), filePath);
    const content = readFileSync(fullPath, 'utf-8');
    const lines = content.split('\n');
    
    // Check if Logger is imported
    const hasLoggerImport = /import\s+.*Logger.*from\s+['"].*Logger/i.test(content);
    
    // Match console.log, console.error, console.warn, console.info, console.debug
    const consolePattern = /console\.(log|error|warn|info|debug)\s*\(/g;
    
    lines.forEach((line, index) => {
      let match;
      while ((match = consolePattern.exec(line)) !== null) {
        const type = match[1] as 'log' | 'error' | 'warn' | 'info' | 'debug';
        
        usages.push({
          file: filePath,
          line: index + 1,
          type,
          content: line.trim(),
          needsLogger: !hasLoggerImport,
        });
      }
    });
    
    return usages;
  } catch (error) {
    console.error(`Error reading ${filePath}:`, error);
    return [];
  }
}

function generateReport(): void {
  console.log('\n=== SLICE 2 AGENT 6: AUTHMODULE, USERPREFERENCESMANAGER & APISERVICE DIAGNOSTIC ===\n');
  
  const allUsages: ConsoleUsage[] = [];
  const fileStats: Record<string, { total: number; byType: Record<string, number>; hasLogger: boolean }> = {};
  
  TARGET_FILES.forEach(filePath => {
    const usages = findConsoleStatements(filePath);
    allUsages.push(...usages);
    
    const byType: Record<string, number> = {};
    usages.forEach(usage => {
      byType[usage.type] = (byType[usage.type] || 0) + 1;
    });
    
    const hasLogger = usages.length > 0 ? !usages[0].needsLogger : false;
    
    fileStats[filePath] = {
      total: usages.length,
      byType,
      hasLogger,
    };
  });
  
  // Overall statistics
  const totalStatements = allUsages.length;
  const totalByType: Record<string, number> = {};
  allUsages.forEach(usage => {
    totalByType[usage.type] = (totalByType[usage.type] || 0) + 1;
  });
  
  console.log('📊 OVERALL STATISTICS:');
  console.log(`   Total console statements: ${totalStatements}`);
  console.log(`   Expected: 195 (93 AuthModule + 83 UserPreferencesManager + 19 APIService)`);
  console.log(`   Difference: ${totalStatements - 195}`);
  console.log('\n   By type:');
  Object.entries(totalByType)
    .sort(([, a], [, b]) => b - a)
    .forEach(([type, count]) => {
      console.log(`     console.${type}: ${count}`);
    });
  
  // Per-file statistics
  console.log('\n📁 FILE BREAKDOWN:');
  Object.entries(fileStats).forEach(([file, stats]) => {
    console.log(`\n   ${file}:`);
    console.log(`     Total: ${stats.total} statements`);
    console.log(`     Logger import: ${stats.hasLogger ? '✅ Present' : '❌ Missing'}`);
    console.log(`     By type:`);
    Object.entries(stats.byType)
      .sort(([, a], [, b]) => b - a)
      .forEach(([type, count]) => {
        console.log(`       - console.${type}: ${count}`);
      });
  });
  
  // Migration status
  console.log('\n🔄 MIGRATION STATUS:');
  const needsLogger = allUsages.filter(u => u.needsLogger).length;
  if (needsLogger > 0) {
    console.log(`   ⚠️  ${needsLogger} statements in files without Logger import`);
  } else {
    console.log('   ✅ All files have Logger import (or no console statements)');
  }
  
  // Sample statements
  console.log('\n📝 SAMPLE STATEMENTS (first 10):');
  allUsages.slice(0, 10).forEach((usage, index) => {
    console.log(`   ${index + 1}. [${usage.file}:${usage.line}] console.${usage.type}`);
    console.log(`      ${usage.content.substring(0, 80)}${usage.content.length > 80 ? '...' : ''}`);
  });
  
  // Recommendations
  console.log('\n💡 RECOMMENDATIONS:');
  console.log('   1. Add Logger import to files missing it');
  console.log('   2. Replace console.log → Logger.debug(..., null, "auth"/"preferences"/"api")');
  console.log('   3. Replace console.warn → Logger.warn(..., null, "auth"/"preferences"/"api")');
  console.log('   4. Replace console.error → Logger.error(..., null, "auth"/"preferences"/"api")');
  console.log('   5. Use context "auth" for AuthModule.ts');
  console.log('   6. Use context "preferences" for UserPreferencesManager.ts');
  console.log('   7. Use context "api" for APIService.ts');
  console.log('   8. Build after changes: npm run build:presence');
  
  console.log('\n=== END OF DIAGNOSTIC REPORT ===\n');
  
  // Return exit code based on findings
  if (totalStatements === 0) {
    console.log('✅ No console statements found - migration complete!');
    process.exit(0);
  } else {
    console.log(`⚠️  ${totalStatements} console statements remaining - migration needed`);
    process.exit(1);
  }
}

// Main execution
generateReport();

// Export for programmatic use
export { findConsoleStatements, generateReport };


