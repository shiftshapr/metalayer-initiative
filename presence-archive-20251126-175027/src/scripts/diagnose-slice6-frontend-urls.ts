/**
 * Diagnostic Script for Slice 6: Frontend Hardcoded URLs
 * 
 * Analyzes frontend code for hardcoded IP addresses and URLs:
 * 1. Hardcoded IP addresses (e.g., 216.238.91.120:3002)
 * 2. Hardcoded URLs that should use environment variables
 * 3. Missing centralized API configuration
 * 
 * This diagnostic runs before and after implementation to measure improvements.
 */

import { readFileSync, readdirSync, statSync } from 'fs';
import { join, relative } from 'path';

interface HardcodedUrlIssue {
  file: string;
  line: number;
  type: 'hardcoded_ip' | 'hardcoded_url' | 'missing_config';
  severity: 'high' | 'medium' | 'low';
  description: string;
  codeSnippet: string;
  recommendation: string;
}

interface DiagnosticResult {
  totalIssues: number;
  issuesByType: Record<string, number>;
  issuesBySeverity: Record<string, number>;
  issues: HardcodedUrlIssue[];
  filesAnalyzed: number;
  filesAffected: string[];
}

const results: HardcodedUrlIssue[] = [];
const srcDir = join(__dirname, '..');
const excludedDirs = ['node_modules', 'dist', 'build', 'extension', '.git', 'scripts'];
const excludedFiles = ['.test.ts', '.spec.ts', '.d.ts'];

// Patterns to detect
const HARDCODED_IP_PATTERN = /216\.238\.91\.120:3002/g;
const HARDCODED_URL_PATTERNS = [
  /['"`]http:\/\/216\.238\.91\.120:3002['"`]/g,
  /['"`]https?:\/\/\d+\.\d+\.\d+\.\d+:\d+['"`]/g, // Any IP:port pattern
];

/**
 * Check if file should be analyzed
 */
function shouldAnalyzeFile(filePath: string): boolean {
  const relativePath = relative(srcDir, filePath);
  
  // Exclude certain directories
  for (const excludedDir of excludedDirs) {
    if (relativePath.includes(excludedDir)) {
      return false;
    }
  }
  
  // Exclude certain file patterns
  for (const excludedFile of excludedFiles) {
    if (filePath.endsWith(excludedFile)) {
      return false;
    }
  }
  
  // Only analyze TypeScript files in src/
  return filePath.endsWith('.ts') && !filePath.endsWith('.d.ts');
}

/**
 * Recursively find all TypeScript files
 */
function findTypeScriptFiles(dir: string): string[] {
  const files: string[] = [];
  
  try {
    const entries = readdirSync(dir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = join(dir, entry.name);
      
      if (entry.isDirectory()) {
        if (!excludedDirs.some(excluded => entry.name === excluded)) {
          files.push(...findTypeScriptFiles(fullPath));
        }
      } else if (entry.isFile() && shouldAnalyzeFile(fullPath)) {
        files.push(fullPath);
      }
    }
  } catch (error) {
    // Skip directories we can't read
  }
  
  return files;
}

/**
 * Analyze a single file for hardcoded URLs
 */
function analyzeFile(filePath: string): void {
  try {
    const content = readFileSync(filePath, 'utf-8');
    const lines = content.split('\n');
    const relativePath = relative(srcDir, filePath);
    
    lines.forEach((line, index) => {
      const lineNumber = index + 1;
      
      // Check for hardcoded IP addresses
      if (HARDCODED_IP_PATTERN.test(line)) {
        const matches = line.match(HARDCODED_IP_PATTERN);
        if (matches) {
          results.push({
            file: relativePath,
            line: lineNumber,
            type: 'hardcoded_ip',
            severity: 'high',
            description: `Hardcoded IP address found: ${matches[0]}`,
            codeSnippet: line.trim(),
            recommendation: 'Replace with environment variable or centralized config (e.g., API_CONFIG.baseUrl)'
          });
        }
      }
      
      // Check for hardcoded URL patterns
      for (const pattern of HARDCODED_URL_PATTERNS) {
        const matches = line.match(pattern);
        if (matches && !line.includes('process.env') && !line.includes('API_CONFIG') && !line.includes('window.API_BASE_URL')) {
          results.push({
            file: relativePath,
            line: lineNumber,
            type: 'hardcoded_url',
            severity: 'medium',
            description: `Hardcoded URL found: ${matches[0]}`,
            codeSnippet: line.trim(),
            recommendation: 'Use centralized API configuration or environment variable'
          });
        }
      }
    });
  } catch (error) {
    // Skip files we can't read
  }
}

/**
 * Main diagnostic function
 */
function runDiagnostic(): DiagnosticResult {
  console.log('🔍 Slice 6 Frontend Hardcoded URLs Diagnostic\n');
  console.log('='.repeat(60));
  console.log('Scanning for hardcoded IP addresses and URLs...\n');
  
  const files = findTypeScriptFiles(srcDir);
  console.log(`Found ${files.length} TypeScript files to analyze\n`);
  
  files.forEach(analyzeFile);
  
  // Calculate statistics
  const issuesByType: Record<string, number> = {};
  const issuesBySeverity: Record<string, number> = {};
  const filesAffected = new Set<string>();
  
  results.forEach(issue => {
    issuesByType[issue.type] = (issuesByType[issue.type] || 0) + 1;
    issuesBySeverity[issue.severity] = (issuesBySeverity[issue.severity] || 0) + 1;
    filesAffected.add(issue.file);
  });
  
  return {
    totalIssues: results.length,
    issuesByType,
    issuesBySeverity,
    issues: results,
    filesAnalyzed: files.length,
    filesAffected: Array.from(filesAffected).sort()
  };
}

/**
 * Print diagnostic results
 */
function printResults(result: DiagnosticResult): void {
  console.log('='.repeat(60));
  console.log('\n📊 DIAGNOSTIC RESULTS\n');
  
  console.log(`Total Issues Found: ${result.totalIssues}`);
  console.log(`Files Analyzed: ${result.filesAnalyzed}`);
  console.log(`Files Affected: ${result.filesAffected.length}\n`);
  
  if (result.totalIssues === 0) {
    console.log('✅ No hardcoded URLs found!');
    return;
  }
  
  console.log('\n📈 Issues by Type:');
  Object.entries(result.issuesByType).forEach(([type, count]) => {
    console.log(`   ${type}: ${count}`);
  });
  
  console.log('\n📈 Issues by Severity:');
  Object.entries(result.issuesBySeverity).forEach(([severity, count]) => {
    console.log(`   ${severity}: ${count}`);
  });
  
  console.log('\n📁 Files Affected:');
  result.filesAffected.forEach(file => {
    const fileIssues = result.issues.filter(i => i.file === file);
    console.log(`   ${file}: ${fileIssues.length} issue(s)`);
  });
  
  console.log('\n🔍 Detailed Issues:\n');
  
  // Group by file
  const issuesByFile: Record<string, HardcodedUrlIssue[]> = {};
  result.issues.forEach(issue => {
    if (!issuesByFile[issue.file]) {
      issuesByFile[issue.file] = [];
    }
    issuesByFile[issue.file].push(issue);
  });
  
  Object.entries(issuesByFile).forEach(([file, issues]) => {
    console.log(`\n📄 ${file}:`);
    issues.forEach(issue => {
      console.log(`   Line ${issue.line} [${issue.type}] [${issue.severity}]`);
      console.log(`   ${issue.description}`);
      console.log(`   Code: ${issue.codeSnippet}`);
      console.log(`   Fix: ${issue.recommendation}`);
      console.log('');
    });
  });
  
  console.log('='.repeat(60));
  console.log(`\n⚠️  Total Issues: ${result.totalIssues}`);
  console.log(`📁 Files Affected: ${result.filesAffected.length}`);
}

// Run diagnostic
const result = runDiagnostic();
printResults(result);

// Exit with appropriate code
process.exit(result.totalIssues > 0 ? 1 : 0);





