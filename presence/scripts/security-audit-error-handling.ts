/**
 * Security Audit: Error Handling Information Leakage
 * 
 * RED Phase Security Audit
 * 
 * Checks for:
 * 1. Sensitive information in error messages exposed to users
 * 2. Stack traces exposed in production
 * 3. API keys, tokens, or secrets in error logs
 * 4. User data in error messages
 * 5. Internal system details in error responses
 */

import { readFileSync, readdirSync, statSync } from 'fs';
import { join, relative } from 'path';

interface SecurityIssue {
  file: string;
  line: number;
  type: 'sensitive_data' | 'stack_trace_exposure' | 'internal_details' | 'user_data_leak' | 'secret_exposure';
  severity: 'critical' | 'high' | 'medium';
  description: string;
  codeSnippet: string;
  recommendation: string;
}

const results: SecurityIssue[] = [];
const srcDir = join(__dirname, '..');
const sensitivePatterns = [
  /password/i,
  /secret/i,
  /token/i,
  /api[_-]?key/i,
  /auth[_-]?token/i,
  /session[_-]?id/i,
  /private[_-]?key/i,
  /access[_-]?token/i,
  /refresh[_-]?token/i
];

function getAllFiles(dir: string, fileList: string[] = []): string[] {
  const files = readdirSync(dir);
  const excludedDirs = ['node_modules', 'dist', 'build', 'extension', '.git', 'scripts'];
  
  files.forEach(file => {
    const filePath = join(dir, file);
    const stat = statSync(filePath);
    
    if (stat.isDirectory()) {
      if (!excludedDirs.includes(file)) {
        getAllFiles(filePath, fileList);
      }
    } else if (filePath.endsWith('.ts') && !filePath.includes('diagnose-') && !filePath.includes('.test.') && !filePath.includes('.spec.')) {
      fileList.push(filePath);
    }
  });
  
  return fileList;
}

function analyzeFile(filePath: string): void {
  try {
    const content = readFileSync(filePath, 'utf-8');
    const lines = content.split('\n');
    const relativePath = relative(srcDir, filePath);
    
    lines.forEach((line, index) => {
      const lineNum = index + 1;
      
      // Check for stack trace exposure in user-facing code
      if (line.includes('error.stack') || line.includes('error.stackTrace') || line.includes('.stack')) {
        // Check if it's in a user notification or response
        if (line.includes('showUserNotification') || 
            line.includes('userMessage') || 
            line.includes('notification') ||
            line.includes('alert') ||
            line.includes('toast')) {
          results.push({
            file: relativePath,
            line: lineNum,
            type: 'stack_trace_exposure',
            severity: 'high',
            description: 'Stack trace potentially exposed to user',
            codeSnippet: line,
            recommendation: 'Remove stack traces from user-facing error messages. Only log stack traces server-side.'
          });
        }
      }
      
      // Check for sensitive data in error messages
      sensitivePatterns.forEach(pattern => {
        if (pattern.test(line) && (line.includes('error') || line.includes('Error') || line.includes('message'))) {
          // Check if it's in a user-facing context
          if (line.includes('userMessage') || 
              line.includes('showUserNotification') ||
              line.includes('notification') ||
              line.includes('alert')) {
            results.push({
              file: relativePath,
              line: lineNum,
              type: 'sensitive_data',
              severity: 'critical',
              description: `Potential sensitive data exposure: ${pattern.source}`,
              codeSnippet: line,
              recommendation: 'Never include sensitive data (passwords, tokens, keys) in error messages shown to users or logged in production.'
            });
          }
        }
      });
      
      // Check for internal system details in error messages
      if ((line.includes('error.message') || line.includes('error.toString()')) && 
          (line.includes('userMessage') || line.includes('showUserNotification'))) {
        // Check for internal paths, IPs, database details
        if (line.includes('/home/') || 
            line.includes('/var/') || 
            line.includes('localhost') ||
            line.includes('127.0.0.1') ||
            line.includes('database') ||
            line.includes('SQL') ||
            line.includes('query')) {
          results.push({
            file: relativePath,
            line: lineNum,
            type: 'internal_details',
            severity: 'high',
            description: 'Internal system details potentially exposed in error message',
            codeSnippet: line,
            recommendation: 'Sanitize error messages before showing to users. Remove internal paths, IPs, and database details.'
          });
        }
      }
      
      // Check for user data in error messages
      if (line.includes('error') && 
          (line.includes('email') || 
           line.includes('userId') || 
           line.includes('user.id') ||
           line.includes('username') ||
           line.includes('phone'))) {
        if (line.includes('userMessage') || line.includes('showUserNotification')) {
          results.push({
            file: relativePath,
            line: lineNum,
            type: 'user_data_leak',
            severity: 'medium',
            description: 'User data potentially exposed in error message',
            codeSnippet: line,
            recommendation: 'Be cautious about including user identifiers in error messages. Use generic messages for user-facing errors.'
          });
        }
      }
    });
  } catch (error) {
    console.error(`Error analyzing ${filePath}:`, error);
  }
}

function runAudit(): void {
  console.log('🔒 Starting Security Audit: Error Handling Information Leakage...\n');
  
  const files = getAllFiles(srcDir);
  console.log(`📁 Analyzing ${files.length} files for security issues...\n`);
  
  files.forEach(file => {
    analyzeFile(file);
  });
  
  // Print report
  console.log('='.repeat(80));
  console.log('SECURITY AUDIT: ERROR HANDLING INFORMATION LEAKAGE');
  console.log('='.repeat(80));
  console.log();
  
  console.log(`Total Issues Found: ${results.length}`);
  console.log();
  
  const byType: Record<string, number> = {};
  const bySeverity: Record<string, number> = {};
  
  results.forEach(issue => {
    byType[issue.type] = (byType[issue.type] || 0) + 1;
    bySeverity[issue.severity] = (bySeverity[issue.severity] || 0) + 1;
  });
  
  console.log('Issues by Type:');
  Object.entries(byType).forEach(([type, count]) => {
    console.log(`  ${type}: ${count}`);
  });
  console.log();
  
  console.log('Issues by Severity:');
  Object.entries(bySeverity).forEach(([severity, count]) => {
    const emoji = severity === 'critical' ? '🔴' : severity === 'high' ? '🟡' : '🟠';
    console.log(`  ${emoji} ${severity}: ${count}`);
  });
  console.log();
  
  if (results.length > 0) {
    console.log('Detailed Findings:');
    console.log('='.repeat(80));
    results.forEach(issue => {
      const emoji = issue.severity === 'critical' ? '🔴' : issue.severity === 'high' ? '🟡' : '🟠';
      console.log(`\n${emoji} [${issue.severity.toUpperCase()}] ${issue.file}:${issue.line}`);
      console.log(`   Type: ${issue.type}`);
      console.log(`   Description: ${issue.description}`);
      console.log(`   Recommendation: ${issue.recommendation}`);
      console.log(`   Code: ${issue.codeSnippet.trim()}`);
    });
  } else {
    console.log('✅ No security issues found in error handling!');
  }
  
  console.log('\n' + '='.repeat(80));
}

if (require.main === module || import.meta.url === `file://${process.argv[1]}`) {
  runAudit();
}

export { runAudit, type SecurityIssue };

