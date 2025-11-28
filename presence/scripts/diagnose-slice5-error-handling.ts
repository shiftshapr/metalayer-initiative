/**
 * Diagnostic Script for Slice 5: Error Handling Inconsistencies
 * 
 * Analyzes error handling patterns across the codebase:
 * 1. Silent failures (empty catch blocks or catch blocks without logging)
 * 2. Generic error types (catch(error) without proper typing)
 * 3. Inconsistent logging (console.log vs Logger utility)
 * 4. Missing error boundaries in critical paths
 * 5. Error handling strategy violations
 * 
 * This diagnostic runs before and after implementation to measure improvements.
 */

import { readFileSync, readdirSync, statSync } from 'fs';
import { join, relative } from 'path';

interface ErrorHandlingIssue {
  file: string;
  line: number;
  type: 'silent_failure' | 'untyped_error' | 'inconsistent_logging' | 'missing_error_boundary' | 'no_error_handling';
  severity: 'critical' | 'high' | 'medium' | 'low';
  description: string;
  codeSnippet: string;
  recommendation: string;
}

interface DiagnosticResult {
  totalIssues: number;
  issuesByType: Record<string, number>;
  issuesBySeverity: Record<string, number>;
  issues: ErrorHandlingIssue[];
  filesAnalyzed: number;
  catchBlocksFound: number;
  silentFailures: number;
  untypedErrors: number;
  inconsistentLogging: number;
  missingErrorBoundaries: number;
}

const results: ErrorHandlingIssue[] = [];
const srcDir = join(__dirname, '..');
const excludedDirs = ['node_modules', 'dist', 'build', 'extension', '.git'];
const excludedFiles = ['.test.ts', '.spec.ts', '.d.ts'];

/**
 * Check if file should be analyzed
 */
function shouldAnalyzeFile(filePath: string): boolean {
  const relativePath = relative(srcDir, filePath);
  
  // Exclude diagnostic scripts themselves
  if (relativePath.includes('diagnose-') || relativePath.includes('scripts/')) {
    return false;
  }
  
  // Exclude test files
  if (excludedFiles.some(ext => filePath.endsWith(ext))) {
    return false;
  }
  
  // Exclude excluded directories
  if (excludedDirs.some(dir => relativePath.includes(dir))) {
    return false;
  }
  
  return filePath.endsWith('.ts') || filePath.endsWith('.js');
}

/**
 * Recursively get all TypeScript/JavaScript files
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
    } else if (shouldAnalyzeFile(filePath)) {
      fileList.push(filePath);
    }
  });
  
  return fileList;
}

/**
 * Analyze a single file for error handling issues
 */
function analyzeFile(filePath: string): void {
  try {
    const content = readFileSync(filePath, 'utf-8');
    const lines = content.split('\n');
    const relativePath = relative(srcDir, filePath);
    
    let catchBlockCount = 0;
    let inTryBlock = false;
    let tryBlockStart = 0;
    
    // Check for Logger import
    const hasLoggerImport = content.includes("from '../utils/Logger") || 
                           content.includes("from './utils/Logger") ||
                           content.includes("from '../../utils/Logger") ||
                           content.includes('import { Logger }') ||
                           content.includes('import Logger');
    
    lines.forEach((line, index) => {
      const lineNum = index + 1;
      const trimmedLine = line.trim();
      
      // Detect try blocks
      if (trimmedLine.startsWith('try') && trimmedLine.includes('{')) {
        inTryBlock = true;
        tryBlockStart = lineNum;
      }
      
      // Detect catch blocks
      if (trimmedLine.startsWith('catch')) {
        catchBlockCount++;
        inTryBlock = false;
        
        // Extract catch block
        const catchMatch = trimmedLine.match(/catch\s*\(([^)]*)\)/);
        const errorVar = catchMatch ? catchMatch[1].trim() : '';
        
        // Find the catch block body
        let catchBody = '';
        let braceCount = 0;
        let catchBodyStart = index;
        let catchBodyEnd = index;
        
        // Find opening brace
        if (trimmedLine.includes('{')) {
          braceCount = 1;
          catchBodyStart = index;
          
          // Find closing brace
          for (let i = index + 1; i < lines.length; i++) {
            const currentLine = lines[i];
            braceCount += (currentLine.match(/{/g) || []).length;
            braceCount -= (currentLine.match(/}/g) || []).length;
            catchBodyEnd = i;
            
            if (braceCount === 0) break;
          }
        }
        
        catchBody = lines.slice(catchBodyStart, catchBodyEnd + 1).join('\n');
        
        // Issue 1: Silent failure (empty catch or only comments)
        const catchBodyContent = catchBody.replace(/\/\/.*$/gm, '').replace(/\/\*[\s\S]*?\*\//g, '').trim();
        const isEmpty = catchBodyContent === '}' || catchBodyContent === '{}' || catchBodyContent.length < 10;
        
        if (isEmpty) {
          results.push({
            file: relativePath,
            line: lineNum,
            type: 'silent_failure',
            severity: 'critical',
            description: 'Silent failure: catch block is empty or only contains comments',
            codeSnippet: lines.slice(Math.max(0, index - 2), Math.min(lines.length, index + 5)).join('\n'),
            recommendation: 'Add error logging using Logger.error() and handle or rethrow the error appropriately'
          });
        }
        
        // Issue 2: Untyped error
        if (errorVar === 'error' || errorVar === 'e' || errorVar === 'err') {
          // Check if error is typed
          const isTyped = errorVar.includes(':') || 
                        catchBody.includes('error: unknown') ||
                        catchBody.includes('error: Error');
          
          if (!isTyped) {
            results.push({
              file: relativePath,
              line: lineNum,
              type: 'untyped_error',
              severity: 'high',
              description: `Untyped error variable: ${errorVar}. Should be 'error: unknown'`,
              codeSnippet: lines.slice(Math.max(0, index - 2), Math.min(lines.length, index + 5)).join('\n'),
              recommendation: "Change to 'catch (error: unknown)' and use proper type checking"
            });
          }
        }
        
        // Issue 3: Inconsistent logging (using console instead of Logger)
        const usesConsole = catchBody.includes('console.log') || 
                           catchBody.includes('console.error') || 
                           catchBody.includes('console.warn');
        const usesLogger = catchBody.includes('Logger.') || catchBody.includes('Logger.error');
        
        if (usesConsole && !usesLogger && hasLoggerImport) {
          results.push({
            file: relativePath,
            line: lineNum,
            type: 'inconsistent_logging',
            severity: 'medium',
            description: 'Using console.log/error/warn instead of Logger utility',
            codeSnippet: lines.slice(Math.max(0, index - 2), Math.min(lines.length, index + 5)).join('\n'),
            recommendation: 'Replace console.log/error/warn with Logger.error/warn/info for consistent logging'
          });
        }
        
        // Issue 4: No error handling in critical async operations
        // This is harder to detect automatically, but we can flag async functions without try-catch
      }
      
      // Detect async functions without error handling
      if (trimmedLine.includes('async') && trimmedLine.includes('(')) {
        // Check if function has try-catch (simplified check)
        const funcName = trimmedLine.match(/async\s+(?:function\s+)?(\w+)/)?.[1] || 'anonymous';
        const funcStart = index;
        let funcEnd = index;
        let braceCount = 0;
        let hasTryCatch = false;
        
        // Find function body
        for (let i = index; i < lines.length; i++) {
          const currentLine = lines[i];
          if (currentLine.includes('{')) braceCount++;
          if (currentLine.includes('}')) braceCount--;
          if (braceCount === 0 && i > index) {
            funcEnd = i;
            break;
          }
          if (currentLine.includes('try') || currentLine.includes('catch')) {
            hasTryCatch = true;
          }
        }
        
        // Check if function contains await without try-catch
        const funcBody = lines.slice(funcStart, funcEnd + 1).join('\n');
        const hasAwait = funcBody.includes('await');
        
        if (hasAwait && !hasTryCatch && funcBody.length > 50) {
          // Only flag if it's a significant function (not a simple wrapper)
          results.push({
            file: relativePath,
            line: lineNum,
            type: 'missing_error_boundary',
            severity: 'medium',
            description: `Async function '${funcName}' contains await but no error handling`,
            codeSnippet: lines.slice(Math.max(0, index), Math.min(lines.length, index + 10)).join('\n'),
            recommendation: 'Add try-catch block around await operations to handle errors gracefully'
          });
        }
      }
    });
    
  } catch (error) {
    console.error(`Error analyzing file ${filePath}:`, error);
  }
}

/**
 * Main diagnostic function
 */
function runDiagnostic(): DiagnosticResult {
  console.log('🔍 Starting Slice 5 Error Handling Diagnostic...\n');
  
  const files = getAllFiles(srcDir);
  console.log(`📁 Analyzing ${files.length} files...\n`);
  
  files.forEach(file => {
    analyzeFile(file);
  });
  
  // Calculate statistics
  const issuesByType: Record<string, number> = {};
  const issuesBySeverity: Record<string, number> = {};
  
  results.forEach(issue => {
    issuesByType[issue.type] = (issuesByType[issue.type] || 0) + 1;
    issuesBySeverity[issue.severity] = (issuesBySeverity[issue.severity] || 0) + 1;
  });
  
  const catchBlocksFound = results.filter(r => r.type !== 'missing_error_boundary').length;
  const silentFailures = results.filter(r => r.type === 'silent_failure').length;
  const untypedErrors = results.filter(r => r.type === 'untyped_error').length;
  const inconsistentLogging = results.filter(r => r.type === 'inconsistent_logging').length;
  const missingErrorBoundaries = results.filter(r => r.type === 'missing_error_boundary').length;
  
  const diagnosticResult: DiagnosticResult = {
    totalIssues: results.length,
    issuesByType,
    issuesBySeverity,
    issues: results,
    filesAnalyzed: files.length,
    catchBlocksFound,
    silentFailures,
    untypedErrors,
    inconsistentLogging,
    missingErrorBoundaries
  };
  
  return diagnosticResult;
}

/**
 * Print diagnostic report
 */
function printReport(result: DiagnosticResult): void {
  console.log('='.repeat(80));
  console.log('SLICE 5: ERROR HANDLING DIAGNOSTIC REPORT');
  console.log('='.repeat(80));
  console.log();
  
  console.log('📊 SUMMARY');
  console.log('-'.repeat(80));
  console.log(`Files Analyzed: ${result.filesAnalyzed}`);
  console.log(`Total Issues Found: ${result.totalIssues}`);
  console.log(`Catch Blocks Analyzed: ${result.catchBlocksFound}`);
  console.log();
  
  console.log('📈 ISSUES BY TYPE');
  console.log('-'.repeat(80));
  Object.entries(result.issuesByType).forEach(([type, count]) => {
    console.log(`  ${type.padEnd(30)} ${count}`);
  });
  console.log();
  
  console.log('⚠️  ISSUES BY SEVERITY');
  console.log('-'.repeat(80));
  Object.entries(result.issuesBySeverity).forEach(([severity, count]) => {
    const emoji = severity === 'critical' ? '🔴' : severity === 'high' ? '🟡' : severity === 'medium' ? '🟠' : '🟢';
    console.log(`  ${emoji} ${severity.padEnd(10)} ${count}`);
  });
  console.log();
  
  console.log('🔍 DETAILED FINDINGS');
  console.log('='.repeat(80));
  
  // Group by file
  const issuesByFile: Record<string, ErrorHandlingIssue[]> = {};
  result.issues.forEach(issue => {
    if (!issuesByFile[issue.file]) {
      issuesByFile[issue.file] = [];
    }
    issuesByFile[issue.file].push(issue);
  });
  
  Object.entries(issuesByFile).forEach(([file, issues]) => {
    console.log(`\n📄 ${file} (${issues.length} issues)`);
    console.log('-'.repeat(80));
    
    issues.forEach(issue => {
      const emoji = issue.severity === 'critical' ? '🔴' : 
                   issue.severity === 'high' ? '🟡' : 
                   issue.severity === 'medium' ? '🟠' : '🟢';
      console.log(`\n  ${emoji} [${issue.severity.toUpperCase()}] Line ${issue.line}: ${issue.type}`);
      console.log(`     Description: ${issue.description}`);
      console.log(`     Recommendation: ${issue.recommendation}`);
      console.log(`     Code:`);
      issue.codeSnippet.split('\n').forEach(line => {
        console.log(`       ${line}`);
      });
    });
  });
  
  console.log('\n' + '='.repeat(80));
  console.log('END OF REPORT');
  console.log('='.repeat(80));
}

// Export types and functions
export { runDiagnostic, printReport, type ErrorHandlingIssue, type DiagnosticResult };

// Run diagnostic if executed directly
if (require.main === module || import.meta.url === `file://${process.argv[1]}`) {
  const result = runDiagnostic();
  printReport(result);
}

