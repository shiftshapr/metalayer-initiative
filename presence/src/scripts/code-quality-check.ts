/**
 * Code Quality Check Script
 * Comprehensive code quality validation for TypeScript codebase
 * 
 * Checks:
 * - TypeScript compilation errors
 * - Unused variables/parameters/imports
 * - Code quality metrics
 * 
 * Usage: npx tsx presence/src/scripts/code-quality-check.ts
 */

import { execSync } from 'child_process';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

interface QualityReport {
  timestamp: string;
  typescriptErrors: number;
  unusedVariables: number;
  unusedParameters: number;
  unusedImports: number;
  totalIssues: number;
  status: 'pass' | 'fail' | 'warn';
  details: {
    compilationErrors: string[];
    unusedCode: Array<{
      file: string;
      line: number;
      type: 'variable' | 'parameter' | 'import';
      name: string;
    }>;
  };
}

function runTypeScriptCheck(): { errors: number; output: string[] } {
  try {
    const output = execSync('npx tsc --noEmit', {
      cwd: join(process.cwd(), 'presence'),
      encoding: 'utf-8',
      stdio: 'pipe'
    }).toString();
    
    return { errors: 0, output: [] };
  } catch (error: unknown) {
    const errorOutput = (error as { stdout?: string; stderr?: string }).stdout || 
                        (error as { stdout?: string; stderr?: string }).stderr || 
                        String(error);
    const lines = errorOutput.split('\n').filter(line => line.trim());
    const errorLines = lines.filter(line => line.includes('error TS'));
    
    return {
      errors: errorLines.length,
      output: errorLines
    };
  }
}

function parseTypeScriptErrors(output: string[]): QualityReport['details']['compilationErrors'] {
  return output.map(line => {
    // Extract file, line, column, and error message
    const match = line.match(/^(.+?)\((\d+),(\d+)\):\s+error\s+TS(\d+):\s+(.+)$/);
    if (match) {
      return `${match[1]}:${match[2]}:${match[3]} - ${match[5]}`;
    }
    return line;
  });
}

function categorizeErrors(output: string[]): {
  unusedVariables: number;
  unusedParameters: number;
  unusedImports: number;
} {
  let unusedVariables = 0;
  let unusedParameters = 0;
  let unusedImports = 0;
  
  output.forEach(line => {
    if (line.includes('is declared but its value is never read')) {
      if (line.includes('parameter')) {
        unusedParameters++;
      } else {
        unusedVariables++;
      }
    } else if (line.includes('is declared but never used')) {
      unusedImports++;
    }
  });
  
  return { unusedVariables, unusedParameters, unusedImports };
}

function generateReport(): QualityReport {
  console.log('🔍 Running TypeScript type check...');
  const tsCheck = runTypeScriptCheck();
  
  console.log('📊 Analyzing errors...');
  const errorDetails = parseTypeScriptErrors(tsCheck.output);
  const categorized = categorizeErrors(tsCheck.output);
  
  const totalIssues = tsCheck.errors;
  const status: QualityReport['status'] = 
    totalIssues === 0 ? 'pass' :
    totalIssues < 10 ? 'warn' : 'fail';
  
  const report: QualityReport = {
    timestamp: new Date().toISOString(),
    typescriptErrors: tsCheck.errors,
    unusedVariables: categorized.unusedVariables,
    unusedParameters: categorized.unusedParameters,
    unusedImports: categorized.unusedImports,
    totalIssues,
    status,
    details: {
      compilationErrors: errorDetails,
      unusedCode: []
    }
  };
  
  return report;
}

function printReport(report: QualityReport): void {
  console.log('\n' + '='.repeat(60));
  console.log('📋 CODE QUALITY REPORT');
  console.log('='.repeat(60));
  console.log(`Timestamp: ${report.timestamp}`);
  console.log(`Status: ${report.status.toUpperCase()}`);
  console.log('\n📊 Summary:');
  console.log(`  Total TypeScript Errors: ${report.typescriptErrors}`);
  console.log(`  Unused Variables: ${report.unusedVariables}`);
  console.log(`  Unused Parameters: ${report.unusedParameters}`);
  console.log(`  Unused Imports: ${report.unusedImports}`);
  console.log(`  Total Issues: ${report.totalIssues}`);
  
  if (report.details.compilationErrors.length > 0) {
    console.log('\n❌ Compilation Errors:');
    report.details.compilationErrors.slice(0, 20).forEach(error => {
      console.log(`  - ${error}`);
    });
    if (report.details.compilationErrors.length > 20) {
      console.log(`  ... and ${report.details.compilationErrors.length - 20} more`);
    }
  }
  
  console.log('\n' + '='.repeat(60));
  
  if (report.status === 'pass') {
    console.log('✅ Code quality check PASSED');
    process.exit(0);
  } else if (report.status === 'warn') {
    console.log('⚠️  Code quality check has WARNINGS');
    process.exit(0);
  } else {
    console.log('❌ Code quality check FAILED');
    process.exit(1);
  }
}

// Main execution
try {
  const report = generateReport();
  printReport(report);
} catch (error) {
  console.error('❌ Error running code quality check:', error);
  process.exit(1);
}

