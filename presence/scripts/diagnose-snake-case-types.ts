#!/usr/bin/env node
/**
 * Diagnostic Script: Snake_case Detection in Type Definitions
 * 
 * Purpose: Identify all snake_case fields in type definitions that violate
 * camelCase-only policy (RED-LINE violation).
 * 
 * Root Cause Analysis:
 * - Type definitions should enforce camelCase-only policy
 * - API boundary code should convert snake_case → camelCase
 * - Duplicate fields create confusion and maintenance burden
 * 
 * Script ID: diagnose-snake-case-types
 * Created: 2025-01-24
 * Related Problem Memory: 76a994f9-ba6c-4da2-9e62-b4f4f14cf72b
 */

import { readFileSync, readdirSync, statSync } from 'fs';
import { join } from 'path';

interface DiagnosticResult {
  file: string;
  line: number;
  field: string;
  interface: string;
  severity: 'error' | 'warning';
  message: string;
}

const results: DiagnosticResult[] = [];
const snakeCasePattern = /\b[a-z]+(_[a-z]+)+\s*[:?]/g;
const typeFilePattern = /\.(ts|tsx)$/;

function scanFile(filePath: string): void {
  try {
    const content = readFileSync(filePath, 'utf-8');
    const lines = content.split('\n');
    
    let currentInterface = '';
    let inInterface = false;
    let braceDepth = 0;
    
    lines.forEach((line, index) => {
      const lineNum = index + 1;
      
      // Track interface/type declarations
      const interfaceMatch = line.match(/^\s*(export\s+)?(interface|type)\s+(\w+)/);
      if (interfaceMatch && interfaceMatch[3]) {
        currentInterface = interfaceMatch[3];
        inInterface = true;
        braceDepth = 0;
      }
      
      // Track brace depth to know when we exit interface
      const openBraces = (line.match(/{/g) || []).length;
      const closeBraces = (line.match(/}/g) || []).length;
      braceDepth += openBraces - closeBraces;
      
      if (braceDepth <= 0 && inInterface) {
        inInterface = false;
        currentInterface = '';
      }
      
      // Check for snake_case field definitions
      const matches = line.matchAll(snakeCasePattern);
      for (const match of matches) {
        const fieldMatch = match[0].match(/\b([a-z]+(_[a-z]+)+)\s*[:?]/);
        if (fieldMatch && fieldMatch[1]) {
          const field = fieldMatch[1];
          
          // Skip if it's in a comment
          if (line.trim().startsWith('//') || line.includes('/*') || line.includes('*/')) {
            continue;
          }
          
          // Check if it's a type definition (not API response handling)
          const isTypeDef = inInterface || 
                           line.includes(':') && !line.includes('=') ||
                           line.match(/^\s*\w+\s*[:?]/);
          
          if (isTypeDef) {
            // Check for camelCase equivalent
            const camelCase = field.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
            const hasCamelCase = content.includes(`${camelCase}:`) || content.includes(`${camelCase}?`);
            
            results.push({
              file: filePath,
              line: lineNum,
              field: field,
              interface: currentInterface || 'unknown',
              severity: hasCamelCase ? 'error' : 'warning',
              message: hasCamelCase 
                ? `Duplicate snake_case field "${field}" found alongside camelCase "${camelCase}" (RED-LINE violation)`
                : `Snake_case field "${field}" found in type definition (should use camelCase)`
            });
          }
        }
      }
    });
  } catch (error) {
    console.error(`Error scanning ${filePath}:`, error);
  }
}

function scanDirectory(dir: string): void {
  try {
    const entries = readdirSync(dir);
    
    for (const entry of entries) {
      const fullPath = join(dir, entry);
      const stat = statSync(fullPath);
      
      if (stat.isDirectory()) {
        // Skip node_modules, dist, build, extension
        if (!['node_modules', 'dist', 'build', 'extension', '.git'].includes(entry)) {
          scanDirectory(fullPath);
        }
      } else if (typeFilePattern.test(entry)) {
        scanFile(fullPath);
      }
    }
  } catch (error) {
    console.error(`Error scanning directory ${dir}:`, error);
  }
}

// Main execution
console.log('🔍 Diagnosing snake_case fields in type definitions...\n');

// Handle both running from root (presence/src/types) and from presence directory (src/types)
let typesDir = join(process.cwd(), 'src', 'types');
if (!statSync(typesDir).isDirectory()) {
  typesDir = join(process.cwd(), 'presence', 'src', 'types');
  if (!statSync(typesDir).isDirectory()) {
    console.error('Types directory not found. Tried:', typesDir);
    process.exit(1);
  }
}
scanDirectory(typesDir);

// Report results
console.log(`\n📊 Diagnostic Results:\n`);
console.log(`Total issues found: ${results.length}\n`);

if (results.length === 0) {
  console.log('✅ No snake_case fields found in type definitions.\n');
  process.exit(0);
}

// Group by file
const byFile = results.reduce((acc, result) => {
  const fileKey = result.file;
  if (!acc[fileKey]) {
    acc[fileKey] = [];
  }
  acc[fileKey]!.push(result);
  return acc;
}, {} as Record<string, DiagnosticResult[]>);

for (const [file, fileResults] of Object.entries(byFile)) {
  console.log(`\n📁 ${file}`);
  console.log('─'.repeat(80));
  
  for (const result of fileResults) {
    const icon = result.severity === 'error' ? '❌' : '⚠️';
    console.log(`${icon} Line ${result.line}: ${result.message}`);
    console.log(`   Interface: ${result.interface}`);
  }
}

// Summary
const errors = results.filter(r => r.severity === 'error');
const warnings = results.filter(r => r.severity === 'warning');

console.log(`\n\n📈 Summary:`);
console.log(`   Errors (duplicates): ${errors.length}`);
console.log(`   Warnings (no camelCase): ${warnings.length}`);

// Exit with error code if issues found
if (results.length > 0) {
  console.log(`\n❌ Diagnostic FAILED: Found ${results.length} snake_case violations\n`);
  process.exit(1);
} else {
  console.log(`\n✅ Diagnostic PASSED: No snake_case violations found\n`);
  process.exit(0);
}

