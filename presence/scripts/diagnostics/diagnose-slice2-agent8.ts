/**
 * Diagnostic Script: Slice 2 Agent 8 - Remaining High-Priority Files
 * 
 * Analyzes console.* usage in:
 * - CommunityLoaders.ts
 * - SupabaseService.ts
 * - UnifiedStorageSync.ts
 * 
 * Run: npx tsx presence/src/scripts/diagnose-slice2-agent8.ts
 */

import { readFileSync } from 'fs';
import { join } from 'path';

interface ConsoleUsage {
  file: string;
  line: number;
  type: 'log' | 'error' | 'warn';
  content: string;
  needsDataExtraction: boolean;
}

const TARGET_FILES = [
  'features/CommunityLoaders.ts',
  'services/SupabaseService.ts',
  'utils/UnifiedStorageSync.ts'
];

const CONTEXTS: Record<string, string> = {
  'CommunityLoaders.ts': 'community',
  'SupabaseService.ts': 'supabase',
  'UnifiedStorageSync.ts': 'storage'
};

function findConsoleStatements(content: string, filePath: string): ConsoleUsage[] {
  const usages: ConsoleUsage[] = [];
  const lines = content.split('\n');
  
  const consolePattern = /console\.(log|error|warn)\s*\(/g;
  
  lines.forEach((line, index) => {
    let match;
    while ((match = consolePattern.exec(line)) !== null) {
      const type = match[1] as 'log' | 'error' | 'warn';
      const fullLine = line.trim();
      
      // Check if line has data objects that need extraction
      const hasDataObject = /console\.(log|error|warn)\s*\([^)]*\{/.test(fullLine);
      const hasMultipleArgs = (fullLine.match(/,/g) || []).length > 0;
      
      usages.push({
        file: filePath,
        line: index + 1,
        type,
        content: fullLine,
        needsDataExtraction: hasDataObject || hasMultipleArgs
      });
    }
  });
  
  return usages;
}

function generateReport(): void {
  console.log('\n=== SLICE 2 AGENT 8: REMAINING HIGH-PRIORITY FILES DIAGNOSTIC ===\n');
  
  const allUsages: ConsoleUsage[] = [];
  const fileStats: Record<string, { total: number; byType: Record<string, number> }> = {};
  
  TARGET_FILES.forEach(filePath => {
    try {
      // Resolve path relative to script location (scripts/ -> src/)
      const scriptDir = __dirname;
      const srcDir = join(scriptDir, '..');
      const fullPath = join(srcDir, filePath);
      const content = readFileSync(fullPath, 'utf-8');
      const usages = findConsoleStatements(content, filePath);
      
      allUsages.push(...usages);
      
      const byType: Record<string, number> = {};
      usages.forEach(usage => {
        byType[usage.type] = (byType[usage.type] || 0) + 1;
      });
      
      fileStats[filePath] = {
        total: usages.length,
        byType
      };
    } catch (error) {
      console.error(`Error reading ${filePath}:`, error);
    }
  });
  
  // Overall statistics
  const totalStatements = allUsages.length;
  const totalByType: Record<string, number> = {};
  allUsages.forEach(usage => {
    totalByType[usage.type] = (totalByType[usage.type] || 0) + 1;
  });
  
  console.log('📊 OVERALL STATISTICS:');
  console.log(`   Total console statements: ${totalStatements}`);
  console.log('\n   By type:');
  Object.entries(totalByType)
    .sort(([, a], [, b]) => b - a)
    .forEach(([type, count]) => {
      console.log(`     console.${type}: ${count}`);
    });
  
  // Per-file statistics
  console.log('\n📁 FILE BREAKDOWN:');
  Object.entries(fileStats).forEach(([file, stats]) => {
    const fileName = file.split('/').pop() || file;
    const context = CONTEXTS[fileName] || 'unknown';
    console.log(`\n   ${fileName}:`);
    console.log(`     Total: ${stats.total} statements`);
    console.log(`     Context: '${context}'`);
    Object.entries(stats.byType)
      .sort(([, a], [, b]) => b - a)
      .forEach(([type, count]) => {
        console.log(`     - console.${type}: ${count}`);
      });
  });
  
  // Migration recommendations
  console.log('\n💡 MIGRATION PATTERNS:');
  console.log('   console.log → Logger.debug(message, data, context)');
  console.log('   console.warn → Logger.warn(message, data, context)');
  console.log('   console.error → Logger.error(message, data, context)');
  
  // Sample transformations needed
  const needsExtraction = allUsages.filter(u => u.needsDataExtraction).length;
  if (needsExtraction > 0) {
    console.log(`\n⚠️  ${needsExtraction} statements need data extraction (multiple args or objects)`);
  }
  
  console.log('\n✅ VERIFICATION CHECKLIST:');
  console.log('   1. Add Logger import: import { Logger } from \'../utils/Logger.js\';');
  console.log('   2. Replace all console.* with Logger.*');
  console.log('   3. Use appropriate context for each file');
  console.log('   4. Extract data objects to second parameter');
  console.log('   5. Run: npm run build:presence');
  console.log('   6. Verify: grep -n "console\\." <file> | wc -l (should be 0)');
  
  console.log('\n=== END OF DIAGNOSTIC REPORT ===\n');
}

// Main execution
generateReport();

// Export for programmatic use
export { findConsoleStatements, generateReport };

