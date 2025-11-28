/**
 * Diagnostic Script: Snake_case Field Detection
 * Purpose: Identify snake_case fields in type definitions and verify API boundary conversion
 * Created: 2025-01-24 (Slice 7)
 */

const { readFileSync, readdirSync, statSync } = require('fs');
const { join, dirname } = require('path');

// Target fields to check
const SNAKE_CASE_FIELDS = ['user_id', 'display_name', 'aura_color', 'avatar_url', 'last_seen', 'page_id', 'is_active'];
const CAMEL_CASE_EQUIVALENTS = {
  'user_id': 'userId',
  'display_name': 'displayName',
  'aura_color': 'auraColor',
  'avatar_url': 'avatarUrl',
  'last_seen': 'lastSeen',
  'page_id': 'pageId',
  'is_active': 'isActive'
};

function findTypeFiles(dir, fileList = []) {
  const files = readdirSync(dir);
  
  files.forEach(file => {
    const filePath = join(dir, file);
    const stat = statSync(filePath);
    
    if (stat.isDirectory() && !filePath.includes('node_modules') && !filePath.includes('dist') && !filePath.includes('build')) {
      findTypeFiles(filePath, fileList);
    } else if (file.endsWith('.ts') && !file.endsWith('.d.ts')) {
      fileList.push(filePath);
    }
  });
  
  return fileList;
}

function checkFileForSnakeCase(filePath) {
  try {
    const content = readFileSync(filePath, 'utf-8');
    const issues = [];
    
    // Check for snake_case in type definitions (interface/type declarations)
    const typeDefinitionPattern = /(interface|type)\s+\w+.*?\{[\s\S]*?\}/g;
    const typeMatches = content.matchAll(typeDefinitionPattern);
    
    for (const match of typeMatches) {
      const typeDef = match[0];
      const typeName = match[1];
      
      for (const snakeField of SNAKE_CASE_FIELDS) {
        // Check if snake_case field exists in type definition
        const snakePattern = new RegExp(`\\b${snakeField}\\s*[?:]`, 'g');
        if (snakePattern.test(typeDef)) {
          const camelEquivalent = CAMEL_CASE_EQUIVALENTS[snakeField];
          // Check if camelCase equivalent also exists (duplicate)
          const camelPattern = new RegExp(`\\b${camelEquivalent}\\s*[?:]`, 'g');
          const hasCamel = camelPattern.test(typeDef);
          
          issues.push({
            file: filePath,
            type: typeName,
            snakeField,
            camelEquivalent,
            isDuplicate: hasCamel,
            severity: hasCamel ? 'ERROR' : 'WARNING'
          });
        }
      }
    }
    
    // Also check for snake_case in object literals that might be type assignments
    const objectLiteralPattern = /:\s*\{[\s\S]*?\}/g;
    const objectMatches = content.matchAll(objectLiteralPattern);
    
    for (const match of objectMatches) {
      const objLiteral = match[0];
      
      for (const snakeField of SNAKE_CASE_FIELDS) {
        const snakePattern = new RegExp(`\\b${snakeField}\\s*:`, 'g');
        if (snakePattern.test(objLiteral)) {
          // Check if this is in a type definition context
          const beforeMatch = content.substring(0, match.index);
          const isInTypeDef = /(interface|type)\s+\w+/.test(beforeMatch);
          
          if (isInTypeDef) {
            issues.push({
              file: filePath,
              type: 'object literal in type',
              snakeField,
              camelEquivalent: CAMEL_CASE_EQUIVALENTS[snakeField],
              isDuplicate: false,
              severity: 'WARNING'
            });
          }
        }
      }
    }
    
    return issues;
  } catch (error) {
    console.error(`Error reading ${filePath}:`, error.message);
    return [];
  }
}

function checkApiBoundaryConversion(filePath) {
  try {
    const content = readFileSync(filePath, 'utf-8');
    const conversions = [];
    
    // Look for patterns like: userId: record.user_id (API boundary conversion)
    for (const snakeField of SNAKE_CASE_FIELDS) {
      const camelEquivalent = CAMEL_CASE_EQUIVALENTS[snakeField];
      const conversionPattern = new RegExp(`${camelEquivalent}\\s*:\\s*[^,}]+${snakeField}`, 'g');
      const matches = content.matchAll(conversionPattern);
      
      for (const match of matches) {
        conversions.push({
          file: filePath,
          snakeField,
          camelEquivalent,
          line: content.substring(0, match.index).split('\n').length
        });
      }
    }
    
    return conversions;
  } catch (error) {
    console.error(`Error checking API boundary in ${filePath}:`, error.message);
    return [];
  }
}

function main() {
  console.log('🔍 DIAGNOSTIC: Snake_case Field Detection\n');
  console.log('Checking type definitions for snake_case fields...\n');
  
  const typesDir = join(__dirname, '../types');
  const srcDir = join(__dirname, '..');
  
  // Check type definition files
  const typeFiles = findTypeFiles(typesDir);
  console.log(`Found ${typeFiles.length} type definition files\n`);
  
  let allIssues = [];
  for (const file of typeFiles) {
    const issues = checkFileForSnakeCase(file);
    allIssues = allIssues.concat(issues);
  }
  
  // Check service files for API boundary conversion
  const serviceFiles = findTypeFiles(join(srcDir, 'services'));
  console.log(`Found ${serviceFiles.length} service files\n`);
  
  let allConversions = [];
  for (const file of serviceFiles) {
    const conversions = checkApiBoundaryConversion(file);
    allConversions = allConversions.concat(conversions);
  }
  
  // Report results
  console.log('='.repeat(80));
  console.log('RESULTS\n');
  
  if (allIssues.length === 0) {
    console.log('✅ No snake_case fields found in type definitions');
  } else {
    console.log(`⚠️  Found ${allIssues.length} snake_case field issues:\n`);
    
    const errors = allIssues.filter(i => i.severity === 'ERROR');
    const warnings = allIssues.filter(i => i.severity === 'WARNING');
    
    if (errors.length > 0) {
      console.log(`❌ ERRORS (${errors.length}): Duplicate snake_case + camelCase fields\n`);
      errors.forEach(issue => {
        console.log(`  File: ${issue.file}`);
        console.log(`  Type: ${issue.type}`);
        console.log(`  Issue: Both ${issue.snakeField} and ${issue.camelEquivalent} exist (DUPLICATE)`);
        console.log('');
      });
    }
    
    if (warnings.length > 0) {
      console.log(`⚠️  WARNINGS (${warnings.length}): snake_case fields without camelCase equivalent\n`);
      warnings.forEach(issue => {
        console.log(`  File: ${issue.file}`);
        console.log(`  Type: ${issue.type}`);
        console.log(`  Issue: ${issue.snakeField} exists but ${issue.camelEquivalent} not found`);
        console.log('');
      });
    }
  }
  
  console.log('='.repeat(80));
  console.log('API BOUNDARY CONVERSION CHECK\n');
  
  if (allConversions.length === 0) {
    console.log('⚠️  No API boundary conversions found (snake_case → camelCase)');
    console.log('     This might indicate missing conversion logic\n');
  } else {
    console.log(`✅ Found ${allConversions.length} API boundary conversions:\n`);
    allConversions.forEach(conv => {
      console.log(`  ${conv.file}:${conv.line}`);
      console.log(`    ${conv.snakeField} → ${conv.camelEquivalent}`);
    });
    console.log('');
  }
  
  console.log('='.repeat(80));
  console.log('SUMMARY\n');
  console.log(`Type Definition Issues: ${allIssues.length}`);
  console.log(`  - Errors (duplicates): ${allIssues.filter(i => i.severity === 'ERROR').length}`);
  console.log(`  - Warnings (snake_case only): ${allIssues.filter(i => i.severity === 'WARNING').length}`);
  console.log(`API Boundary Conversions: ${allConversions.length}`);
  console.log('');
  
  if (allIssues.length === 0 && allConversions.length > 0) {
    console.log('✅ PASSED: No snake_case in type definitions, API boundary conversions present');
    process.exit(0);
  } else if (allIssues.filter(i => i.severity === 'ERROR').length > 0) {
    console.log('❌ FAILED: Duplicate snake_case + camelCase fields found in type definitions');
    process.exit(1);
  } else if (allIssues.length > 0) {
    console.log('⚠️  WARNINGS: snake_case fields found (may need cleanup)');
    process.exit(0);
  } else {
    console.log('✅ PASSED: No issues found');
    process.exit(0);
  }
}

main();

