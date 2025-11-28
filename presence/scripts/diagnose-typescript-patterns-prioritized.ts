/**
 * Prioritized TypeScript Pattern Diagnostic
 * Identifies recurring patterns and prioritizes fixes based on frequency and impact
 */

import { readFileSync, readdirSync, statSync, writeFileSync } from 'fs';
import { join, extname, basename } from 'path';

interface PatternIssue {
  file: string;
  line: number;
  pattern: string;
  code: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  category: string;
}

interface PatternSummary {
  pattern: string;
  count: number;
  files: string[];
  severity: string;
  priority: number; // Higher = more resources needed
  examples: Array<{ file: string; line: number; code: string }>;
}

const issues: PatternIssue[] = [];
// Get the presence directory (parent of src)
const presenceDir = join(__dirname, '../..');
const srcDir = join(presenceDir, 'src');

function isProductionFile(filePath: string): boolean {
  const fileName = basename(filePath);
  return !fileName.includes('diagnostic') &&
         !fileName.includes('diagnose') &&
         !fileName.includes('.test.') &&
         !fileName.includes('.spec.') &&
         !filePath.includes('/diagnostics/') &&
         !filePath.includes('/utils/diagnostics/');
}

function scanFile(filePath: string): void {
  if (!isProductionFile(filePath)) return;
  
  try {
    const content = readFileSync(filePath, 'utf-8');
    const lines = content.split('\n');
    const relativePath = filePath.replace(presenceDir + '/', '');
    
    lines.forEach((line, index) => {
      const lineNum = index + 1;
      const trimmed = line.trim();
      
      // Skip comments-only lines
      if (trimmed.startsWith('//') || trimmed.startsWith('*')) return;
      
      // Pattern 1: 'as any' assertions (CRITICAL - most common)
      if (line.includes('as any') && !line.includes('//')) {
        issues.push({
          file: relativePath,
          line: lineNum,
          pattern: 'as-any-assertion',
          code: trimmed.substring(0, 120),
          severity: 'critical',
          category: 'Type Safety'
        });
      }
      
      // Pattern 2: ': any' type annotations (HIGH)
      if (line.match(/:\s*any\b/) && !line.includes('//')) {
        issues.push({
          file: relativePath,
          line: lineNum,
          pattern: 'any-type-annotation',
          code: trimmed.substring(0, 120),
          severity: 'high',
          category: 'Type Safety'
        });
      }
      
      // Pattern 3: 'window as any' (HIGH - recurring pattern)
      if (line.includes('window as any') || line.includes('(window as any)')) {
        issues.push({
          file: relativePath,
          line: lineNum,
          pattern: 'window-as-any',
          code: trimmed.substring(0, 120),
          severity: 'high',
          category: 'Window Casting'
        });
      }
      
      // Pattern 4: '@ts-ignore' (HIGH)
      if (line.includes('@ts-ignore')) {
        issues.push({
          file: relativePath,
          line: lineNum,
          pattern: 'ts-ignore',
          code: trimmed.substring(0, 120),
          severity: 'high',
          category: 'Type Suppression'
        });
      }
      
      // Pattern 5: '@ts-expect-error' (MEDIUM)
      if (line.includes('@ts-expect-error')) {
        issues.push({
          file: relativePath,
          line: lineNum,
          pattern: 'ts-expect-error',
          code: trimmed.substring(0, 120),
          severity: 'medium',
          category: 'Type Suppression'
        });
      }
      
      // Pattern 6: '(this as any)' (HIGH - internal property access)
      if (line.includes('(this as any)')) {
        issues.push({
          file: relativePath,
          line: lineNum,
          pattern: 'this-as-any',
          code: trimmed.substring(0, 120),
          severity: 'high',
          category: 'Internal Casting'
        });
      }
      
      // Pattern 7: Function parameters with any (HIGH)
      if (line.match(/\([^)]*:\s*any[^)]*\)/)) {
        issues.push({
          file: relativePath,
          line: lineNum,
          pattern: 'function-param-any',
          code: trimmed.substring(0, 120),
          severity: 'high',
          category: 'Type Safety'
        });
      }
      
      // Pattern 8: Return type any (HIGH)
      if (line.match(/\)\s*:\s*any\s*[={]/)) {
        issues.push({
          file: relativePath,
          line: lineNum,
          pattern: 'return-type-any',
          code: trimmed.substring(0, 120),
          severity: 'high',
          category: 'Type Safety'
        });
      }
    });
  } catch (error) {
    // Skip errors
  }
}

function walkDirectory(dir: string): void {
  try {
    const entries = readdirSync(dir);
    
    for (const entry of entries) {
      const fullPath = join(dir, entry);
      const stat = statSync(fullPath);
      
      if (stat.isDirectory()) {
        if (!['node_modules', 'dist', 'build', 'extension', '.git', 'diagnostics'].includes(entry)) {
          walkDirectory(fullPath);
        }
      } else if (stat.isFile() && extname(entry) === '.ts') {
        scanFile(fullPath);
      }
    }
  } catch (error) {
    // Skip errors
  }
}

// Main execution
console.log('🔍 Scanning for TypeScript patterns and prioritizing...');
walkDirectory(srcDir);

// Group by pattern
const patternMap: Record<string, PatternIssue[]> = {};
issues.forEach(issue => {
  const patternKey = issue.pattern;
  if (!patternMap[patternKey]) {
    patternMap[patternKey] = [];
  }
  patternMap[patternKey]!.push(issue);
});

// Create pattern summaries with priority
const patterns: PatternSummary[] = Object.entries(patternMap).map(([pattern, patternIssues]) => {
  const files = [...new Set(patternIssues.map(i => i.file))];
  const severity = patternIssues[0]?.severity ?? 'low';
  
  // Calculate priority: count * severity weight
  const severityWeight = {
    critical: 4,
    high: 3,
    medium: 2,
    low: 1
  }[severity] || 1;
  
  const priority = patternIssues.length * severityWeight;
  
  return {
    pattern,
    count: patternIssues.length,
    files,
    severity,
    priority,
    examples: patternIssues.slice(0, 5).map(i => ({
      file: i.file,
      line: i.line,
      code: i.code
    }))
  };
});

// Sort by priority (highest first)
patterns.sort((a, b) => b.priority - a.priority);

// Group by file
const byFile: Record<string, PatternIssue[]> = {};
issues.forEach(issue => {
  const fileKey = issue.file;
  if (!byFile[fileKey]) {
    byFile[fileKey] = [];
  }
  byFile[fileKey]!.push(issue);
});

// Print report
console.log('\n' + '='.repeat(80));
console.log('📋 PRIORITIZED TYPESCRIPT PATTERN ANALYSIS');
console.log('='.repeat(80));
console.log(`Total Issues: ${issues.length}`);
console.log(`Files Affected: ${Object.keys(byFile).length}`);
console.log(`Patterns Found: ${patterns.length}`);

console.log('\n🎯 PATTERNS BY PRIORITY (Higher = More Resources Needed):');
patterns.forEach((pattern, index) => {
  console.log(`\n${index + 1}. ${pattern.pattern} (Priority: ${pattern.priority})`);
  console.log(`   Count: ${pattern.count} | Severity: ${pattern.severity.toUpperCase()} | Files: ${pattern.files.length}`);
  console.log(`   Top Examples:`);
  pattern.examples.forEach(ex => {
    console.log(`     - ${ex.file}:${ex.line}`);
    console.log(`       ${ex.code.substring(0, 80)}...`);
  });
});

console.log('\n📁 FILES BY ISSUE COUNT:');
Object.entries(byFile)
  .sort(([, a], [, b]) => b.length - a.length)
  .slice(0, 15)
  .forEach(([file, fileIssues]) => {
    const critical = fileIssues.filter(i => i.severity === 'critical').length;
    const high = fileIssues.filter(i => i.severity === 'high').length;
    console.log(`  ${file}: ${fileIssues.length} (${critical} critical, ${high} high)`);
  });

// Save detailed report
const report = {
  timestamp: new Date().toISOString(),
  totalIssues: issues.length,
  filesAffected: Object.keys(byFile).length,
  patterns: patterns.map(p => ({
    pattern: p.pattern,
    count: p.count,
    files: p.files.length,
    severity: p.severity,
    priority: p.priority,
    topFiles: p.files.slice(0, 5)
  })),
  filesByIssueCount: Object.entries(byFile)
    .sort(([, a], [, b]) => b.length - a.length)
    .slice(0, 20)
    .map(([file, fileIssues]) => ({
      file,
      total: fileIssues.length,
      critical: fileIssues.filter(i => i.severity === 'critical').length,
      high: fileIssues.filter(i => i.severity === 'high').length,
      patterns: [...new Set(fileIssues.map(i => i.pattern))]
    }))
};

writeFileSync(
  join(presenceDir, '../docs/TYPESCRIPT_PATTERNS_PRIORITIZED.json'),
  JSON.stringify(report, null, 2)
);

console.log('\n✅ Prioritized analysis saved to docs/TYPESCRIPT_PATTERNS_PRIORITIZED.json');
console.log('\n💡 RECOMMENDATION: Allocate more resources to patterns with highest priority scores');

process.exit(0);

