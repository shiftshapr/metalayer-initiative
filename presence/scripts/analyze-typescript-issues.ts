/**
 * Comprehensive TypeScript Issues Analysis
 * Analyzes actual issues in production code (excludes diagnostic/test files)
 */

import { readFileSync, readdirSync, statSync } from 'fs';
import { join, extname, basename } from 'path';

interface Issue {
  file: string;
  line: number;
  issue: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  category: string;
  code: string;
}

const issues: Issue[] = [];
const srcDir = join(process.cwd(), 'src');

function isProductionFile(filePath: string): boolean {
  const fileName = basename(filePath);
  // Only exclude diagnostic/test files, not all scripts
  return !fileName.includes('diagnostic') &&
         !fileName.includes('diagnose') &&
         !fileName.includes('.test.') &&
         !fileName.includes('.spec.') &&
         !filePath.includes('/diagnostics/') &&
         !filePath.includes('/utils/diagnostics/');
}

function scanFile(filePath: string): void {
  if (!isProductionFile(filePath)) return;
  
  if (!filePath || typeof filePath !== 'string') {
    console.warn('⚠️  Warning: Invalid file path provided to scanFile');
    return;
  }
  
  try {
    const content = readFileSync(filePath, 'utf-8');
    if (!content) {
      console.warn(`⚠️  Warning: Empty file: ${filePath}`);
      return;
    }
    const lines = content.split('\n');
    const cwd = process.cwd();
    const relativePath = filePath.replace(cwd + '/', '');
    
    lines.forEach((line, index) => {
      const lineNum = index + 1;
      const trimmed = line.trim();
      
      // Skip comments
      if (trimmed.startsWith('//') || trimmed.startsWith('*')) return;
      
      // Check for 'as any' assertions
      if (line.includes('as any') && !line.includes('//')) {
        issues.push({
          file: relativePath,
          line: lineNum,
          issue: 'Type assertion to `any`',
          severity: 'critical',
          category: 'Type Safety',
          code: trimmed.substring(0, 100)
        });
      }
      
      // Check for ': any' type annotations
      if (line.match(/:\s*any\b/) && !line.includes('//')) {
        issues.push({
          file: relativePath,
          line: lineNum,
          issue: 'Explicit `any` type',
          severity: 'high',
          category: 'Type Safety',
          code: trimmed.substring(0, 100)
        });
      }
      
      // Check for @ts-ignore
      if (line.includes('@ts-ignore')) {
        issues.push({
          file: relativePath,
          line: lineNum,
          issue: 'TypeScript error suppression (@ts-ignore)',
          severity: 'high',
          category: 'Type Safety',
          code: trimmed.substring(0, 100)
        });
      }
      
      // Check for @ts-expect-error
      if (line.includes('@ts-expect-error')) {
        issues.push({
          file: relativePath,
          line: lineNum,
          issue: 'TypeScript error expectation (@ts-expect-error)',
          severity: 'medium',
          category: 'Type Safety',
          code: trimmed.substring(0, 100)
        });
      }
      
      // Check for window as any
      if (line.includes('window as any') || line.includes('(window as any)')) {
        issues.push({
          file: relativePath,
          line: lineNum,
          issue: 'Window cast to `any`',
          severity: 'high',
          category: 'Type Safety',
          code: trimmed.substring(0, 100)
        });
      }
      
      // Check for console.log in production (but allow some)
      if (line.includes('console.log') && 
          !line.includes('diagnostic') && 
          !line.includes('test') &&
          !line.includes('DEBUG') &&
          !line.includes('🔧') && // Allow emoji logs for now
          lineNum > 50) { // Skip early initialization logs
        // Only flag if it's not a common pattern
        if (!line.match(/console\.log\(['"`]✅|❌|⚠️|🔧|🎨/)) {
          issues.push({
            file: relativePath,
            line: lineNum,
            issue: 'Console.log in production code',
            severity: 'low',
            category: 'Code Quality',
            code: trimmed.substring(0, 100)
          });
        }
      }
    });
  } catch (error) {
    // Skip errors
  }
}

function walkDirectory(dir: string): void {
  if (!dir || typeof dir !== 'string') {
    console.warn('⚠️  Warning: Invalid directory path provided to walkDirectory');
    return;
  }
  
  try {
    const entries = readdirSync(dir);
    if (!entries || entries.length === 0) {
      return; // Empty directory, skip
    }
    
    for (const entry of entries) {
      if (!entry) continue; // Skip null/undefined entries
      
      const fullPath = join(dir, entry);
      if (!fullPath) continue; // Skip if path join failed
      
      let stat;
      try {
        stat = statSync(fullPath);
      } catch (statError) {
        console.warn(`⚠️  Warning: Could not stat ${fullPath}:`, statError);
        continue;
      }
      
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
console.log('🔍 Analyzing TypeScript issues in production code...');
walkDirectory(srcDir);

// Group by file
const byFile: Record<string, Issue[]> = {};
issues.forEach(issue => {
  if (!byFile[issue.file]) {
    byFile[issue.file] = [];
  }
  byFile[issue.file].push(issue);
});

// Group by category
const byCategory: Record<string, Issue[]> = {};
issues.forEach(issue => {
  if (!byCategory[issue.category]) {
    byCategory[issue.category] = [];
  }
  byCategory[issue.category].push(issue);
});

// Group by severity
const bySeverity: Record<string, Issue[]> = {};
issues.forEach(issue => {
  if (!bySeverity[issue.severity]) {
    bySeverity[issue.severity] = [];
  }
  bySeverity[issue.severity].push(issue);
});

console.log('\n📊 SUMMARY');
console.log('='.repeat(80));
console.log(`Total Issues: ${issues.length}`);
console.log(`Files Affected: ${Object.keys(byFile).length}`);

console.log('\n📊 By Category:');
Object.entries(byCategory)
  .sort(([, a], [, b]) => b.length - a.length)
  .forEach(([category, categoryIssues]) => {
    console.log(`  ${category}: ${categoryIssues.length}`);
  });

console.log('\n📊 By Severity:');
Object.entries(bySeverity)
  .sort(([, a], [, b]) => b.length - a.length)
  .forEach(([severity, severityIssues]) => {
    console.log(`  ${severity}: ${severityIssues.length}`);
  });

console.log('\n📁 Top Files by Issue Count:');
Object.entries(byFile)
  .sort(([, a], [, b]) => b.length - a.length)
  .slice(0, 15)
  .forEach(([file, fileIssues]) => {
    const critical = fileIssues.filter(i => i.severity === 'critical').length;
    const high = fileIssues.filter(i => i.severity === 'high').length;
    console.log(`  ${file}: ${fileIssues.length} (${critical} critical, ${high} high)`);
  });

// Export for slicing
const fs = require('fs');
fs.writeFileSync(
  join(process.cwd(), 'docs/TYPESCRIPT_ISSUES_ANALYSIS.json'),
  JSON.stringify({
    total: issues.length,
    byFile,
    byCategory,
    bySeverity,
    issues: issues.slice(0, 500) // Limit for size
  }, null, 2)
);

console.log('\n✅ Analysis saved to docs/TYPESCRIPT_ISSUES_ANALYSIS.json');

