/**
 * Diagnostic Script: Analyze Messages Module Type Issues
 * 
 * Identifies all `any` types, `as any` assertions, and type safety issues
 * in the Messages module files (Slice 2).
 */

import { readFileSync } from 'fs';
import { join } from 'path';

interface TypeIssue {
  file: string;
  line: number;
  type: 'any-return' | 'any-param' | 'as-any' | 'window-as-any' | 'any-type';
  code: string;
  context: string;
}

const filesToAnalyze = [
  'presence/src/features/MessagesModule.ts',
  'presence/src/features/MessagesModuleServiceIntegration.ts',
  'presence/src/components/UnifiedMessageDisplay.ts',
  'presence/src/components/UnifiedMessageModal.ts',
  'presence/src/utils/UnifiedMessageRenderer.ts',
];

function analyzeFile(filePath: string): TypeIssue[] {
  const issues: TypeIssue[] = [];
  const fullPath = join(process.cwd(), filePath);
  
  try {
    const content = readFileSync(fullPath, 'utf-8');
    const lines = content.split('\n');
    
    lines.forEach((line, index) => {
      const lineNum = index + 1;
      
      // Check for `: any` return types
      if (/: any\s*[=>]/.test(line) || /:\s*any\s*[;=]/.test(line)) {
        issues.push({
          file: filePath,
          line: lineNum,
          type: 'any-return',
          code: line.trim(),
          context: `Return type is any`,
        });
      }
      
      // Check for `(param: any)` parameters
      if (/\([^)]*:\s*any[^)]*\)/.test(line)) {
        issues.push({
          file: filePath,
          line: lineNum,
          type: 'any-param',
          code: line.trim(),
          context: `Parameter has any type`,
        });
      }
      
      // Check for `as any` assertions
      if (/as\s+any\b/.test(line)) {
        issues.push({
          file: filePath,
          line: lineNum,
          type: 'as-any',
          code: line.trim(),
          context: `Type assertion to any`,
        });
      }
      
      // Check for `window as any`
      if (/window\s+as\s+any/.test(line)) {
        issues.push({
          file: filePath,
          line: lineNum,
          type: 'window-as-any',
          code: line.trim(),
          context: `Window cast to any`,
        });
      }
      
      // Check for `any[]` array types
      if (/: any\[\]/.test(line)) {
        issues.push({
          file: filePath,
          line: lineNum,
          type: 'any-type',
          code: line.trim(),
          context: `Array with any element type`,
        });
      }
    });
  } catch (error) {
    console.error(`Error analyzing ${filePath}:`, error);
  }
  
  return issues;
}

function main() {
  console.log('🔍 Analyzing Messages Module Type Issues...\n');
  
  const allIssues: TypeIssue[] = [];
  
  filesToAnalyze.forEach(file => {
    const issues = analyzeFile(file);
    allIssues.push(...issues);
  });
  
  // Group by type
  const byType = allIssues.reduce((acc, issue) => {
    const bucket = acc[issue.type] ?? [];
    bucket.push(issue);
    acc[issue.type] = bucket;
    return acc;
  }, {} as Record<string, TypeIssue[]>);
  
  // Group by file
  const byFile = allIssues.reduce((acc, issue) => {
    const bucket = acc[issue.file] ?? [];
    bucket.push(issue);
    acc[issue.file] = bucket;
    return acc;
  }, {} as Record<string, TypeIssue[]>);
  
  console.log('📊 Summary:');
  console.log(`Total issues: ${allIssues.length}\n`);
  
  console.log('By Type:');
  Object.entries(byType).forEach(([type, issues]) => {
    console.log(`  ${type}: ${issues.length}`);
  });
  
  console.log('\nBy File:');
  Object.entries(byFile).forEach(([file, issues]) => {
    console.log(`  ${file}: ${issues.length}`);
  });
  
  console.log('\n📋 Detailed Issues:\n');
  allIssues.forEach(issue => {
    console.log(`${issue.file}:${issue.line} [${issue.type}]`);
    console.log(`  ${issue.code}`);
    console.log(`  ${issue.context}\n`);
  });
  
  return allIssues;
}

if (require.main === module) {
  main();
}

export { analyzeFile, main };


