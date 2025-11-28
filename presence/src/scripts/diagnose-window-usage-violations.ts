#!/usr/bin/env npx tsx
/**
 * Diagnostic Script: Window Usage Violations
 * 
 * Detects problematic window references that violate ES6 module principles.
 * Based on TS agent audit findings.
 * 
 * Usage: npx tsx src/scripts/diagnose-window-usage-violations.ts
 */

import { readFileSync, readdirSync, statSync } from 'fs';
import { join, extname } from 'path';

interface Violation {
  file: string;
  line: number;
  content: string;
  type: 'window.currentUser' | 'window.api' | 'Object.assign(window' | 'window.function' | 'window.module' | 'other';
  severity: 'critical' | 'high' | 'medium';
  hasComment: boolean;
}

const PROBLEMATIC_PATTERNS = [
  { pattern: /window\.currentUser/g, type: 'window.currentUser' as const, severity: 'critical' as const },
  { pattern: /window\.api\s*=/g, type: 'window.api' as const, severity: 'critical' as const },
  { pattern: /Object\.assign\(window/g, type: 'Object.assign(window' as const, severity: 'critical' as const },
  { pattern: /window\.(focusedMessage|handleRepostClick|handleShareClick|AvatarUtils|addMessageToChat|profileManager|currentVisibilityDataUnfiltered)/g, type: 'window.function' as const, severity: 'high' as const },
];

const ACCEPTABLE_PATTERNS = [
  /window\.location/,           // Browser API
  /window\.getComputedStyle/,  // Browser API
  /window\.addEventListener/,   // Browser API
  /window\.removeEventListener/, // Browser API
  /window\.dispatchEvent/,      // Browser API
  /window\.navigator/,          // Browser API
  /window\.document/,           // Browser API
  /window\.localStorage/,       // Browser API
  /window\.sessionStorage/,     // Browser API
  /window\.innerWidth/,         // Browser API
  /window\.innerHeight/,        // Browser API
  /typeof window !== 'undefined'/, // SSR safety check
  /\/\/.*(best practice|acceptable|browser api|legitimate|keep|preserve|ES6 pattern)/i, // Comments
];

function isAcceptable(line: string): boolean {
  return ACCEPTABLE_PATTERNS.some(pattern => pattern.test(line));
}

function hasBestPracticeComment(lines: string[], lineIndex: number): boolean {
  // Check 3 lines before for comments
  for (let i = Math.max(0, lineIndex - 3); i < lineIndex; i++) {
    const comment = lines[i].trim();
    if (comment.includes('//') || comment.includes('/*')) {
      const lowerComment = comment.toLowerCase();
      if (lowerComment.includes('best practice') || 
          lowerComment.includes('acceptable') || 
          lowerComment.includes('browser api') ||
          lowerComment.includes('legitimate') ||
          lowerComment.includes('es6 pattern') ||
          lowerComment.includes('todo: replace')) {
        return true;
      }
    }
  }
  return false;
}

function scanFile(filePath: string): Violation[] {
  const violations: Violation[] = [];
  
  try {
    const content = readFileSync(filePath, 'utf-8');
    const lines = content.split('\n');
    
    lines.forEach((line, index) => {
      // Skip comments-only lines
      const trimmedLine = line.trim();
      if (trimmedLine.startsWith('//') || trimmedLine.startsWith('/*') || trimmedLine.startsWith('*')) {
        return;
      }
      
      // Remove inline comments for pattern matching
      const codeOnly = line.split('//')[0].split('/*')[0];
      
      // Skip acceptable patterns
      if (isAcceptable(codeOnly)) {
        return;
      }
      
      // Check for problematic patterns
      PROBLEMATIC_PATTERNS.forEach(({ pattern, type, severity }) => {
        const matches = codeOnly.matchAll(pattern);
        for (const match of matches) {
          const hasComment = hasBestPracticeComment(lines, index);
          
          // Only report if not marked as acceptable and is actual code (not comment)
          if (!hasComment && !trimmedLine.startsWith('//')) {
            violations.push({
              file: filePath,
              line: index + 1,
              content: trimmedLine,
              type,
              severity,
              hasComment: false
            });
          }
        }
      });
    });
  } catch (error) {
    console.error(`Error scanning ${filePath}:`, error);
  }
  
  return violations;
}

function scanDirectory(dir: string, violations: Violation[] = []): Violation[] {
  const entries = readdirSync(dir);
  
  for (const entry of entries) {
    const fullPath = join(dir, entry);
    const stat = statSync(fullPath);
    
    if (stat.isDirectory()) {
      // Skip node_modules, dist, build, extension
      if (['node_modules', 'dist', 'build', 'extension', '.git'].includes(entry)) {
        continue;
      }
      scanDirectory(fullPath, violations);
    } else if (stat.isFile() && extname(entry) === '.ts') {
      // Only scan TypeScript source files
      // Exclude diagnostic scripts themselves (they contain patterns as strings)
      if (fullPath.includes('/src/') && !fullPath.includes('diagnose-window-usage-violations.ts')) {
        const fileViolations = scanFile(fullPath);
        violations.push(...fileViolations);
      }
    }
  }
  
  return violations;
}

function main() {
  console.log('🔍 Scanning for window usage violations...\n');
  
  const srcDir = join(process.cwd(), 'src');
  const violations = scanDirectory(srcDir);
  
  // Group by file
  const byFile = new Map<string, Violation[]>();
  violations.forEach(v => {
    if (!byFile.has(v.file)) {
      byFile.set(v.file, []);
    }
    byFile.get(v.file)!.push(v);
  });
  
  // Report
  console.log(`Found ${violations.length} violations across ${byFile.size} files:\n`);
  
  byFile.forEach((fileViolations, file) => {
    const relativePath = file.replace(process.cwd() + '/', '');
    console.log(`\n📄 ${relativePath} (${fileViolations.length} violations)`);
    
    fileViolations.forEach(v => {
      const severityIcon = v.severity === 'critical' ? '🔴' : v.severity === 'high' ? '🟠' : '🟡';
      console.log(`  ${severityIcon} Line ${v.line}: ${v.type}`);
      console.log(`     ${v.content.substring(0, 80)}${v.content.length > 80 ? '...' : ''}`);
    });
  });
  
  // Summary
  const critical = violations.filter(v => v.severity === 'critical').length;
  const high = violations.filter(v => v.severity === 'high').length;
  const medium = violations.filter(v => v.severity === 'medium').length;
  
  console.log(`\n📊 Summary:`);
  console.log(`   🔴 Critical: ${critical}`);
  console.log(`   🟠 High: ${high}`);
  console.log(`   🟡 Medium: ${medium}`);
  console.log(`   Total: ${violations.length}`);
  
  if (violations.length > 0) {
    console.log(`\n❌ Violations found. Exit code: 1`);
    process.exit(1);
  } else {
    console.log(`\n✅ No violations found. Exit code: 0`);
    process.exit(0);
  }
}

main();

