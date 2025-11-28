#!/usr/bin/env node
/**
 * Slice 6 Security Configuration Diagnostic Script
 * 
 * Checks for:
 * 1. Hardcoded fallback secrets
 * 2. Missing environment variable validation
 * 3. CORS configuration issues
 * 4. SQL injection risks
 * 
 * Usage: node scripts/diagnose-slice6-security.js
 */

const fs = require('fs');
const path = require('path');

const issues = {
  hardcodedSecrets: [],
  missingEnvValidation: [],
  corsIssues: [],
  sqlInjectionRisks: []
};

// Files to check
const filesToCheck = [
  path.join(__dirname, '../app.js'),
  path.join(__dirname, '../server/app.js')
];

console.log('🔍 Slice 6 Security Configuration Diagnostic\n');
console.log('='.repeat(60));

// Check for hardcoded secrets
console.log('\n1. Checking for hardcoded fallback secrets...');
filesToCheck.forEach(filePath => {
  if (!fs.existsSync(filePath)) {
    console.log(`   ⚠️  File not found: ${filePath}`);
    return;
  }
  
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  
  lines.forEach((line, index) => {
    // Check for SESSION_SECRET fallback
    if (line.includes('SESSION_SECRET') && line.includes('||')) {
      const match = line.match(/SESSION_SECRET\s*\|\|\s*['"]([^'"]+)['"]/);
      if (match && match[1] !== '') {
        issues.hardcodedSecrets.push({
          file: filePath,
          line: index + 1,
          issue: `Hardcoded SESSION_SECRET fallback: "${match[1]}"`,
          code: line.trim()
        });
      }
    }
    
    // Check for GOOGLE_CLIENT_ID fallback
    if (line.includes('GOOGLE_CLIENT_ID') && line.includes('||')) {
      const match = line.match(/GOOGLE_CLIENT_ID\s*\|\|\s*['"]([^'"]+)['"]/);
      if (match && match[1] !== '') {
        issues.hardcodedSecrets.push({
          file: filePath,
          line: index + 1,
          issue: `Hardcoded GOOGLE_CLIENT_ID fallback: "${match[1]}"`,
          code: line.trim()
        });
      }
    }
    
    // Check for GOOGLE_CLIENT_SECRET fallback
    if (line.includes('GOOGLE_CLIENT_SECRET') && line.includes('||')) {
      const match = line.match(/GOOGLE_CLIENT_SECRET\s*\|\|\s*['"]([^'"]+)['"]/);
      if (match && match[1] !== '') {
        issues.hardcodedSecrets.push({
          file: filePath,
          line: index + 1,
          issue: `Hardcoded GOOGLE_CLIENT_SECRET fallback: "${match[1]}"`,
          code: line.trim()
        });
      }
    }
  });
});

// Check for environment validation
console.log('\n2. Checking for environment variable validation...');
const configDir = path.join(__dirname, '../config');
const validateEnvFile = path.join(configDir, 'validateEnv.js');

if (!fs.existsSync(validateEnvFile)) {
  issues.missingEnvValidation.push({
    file: 'config/validateEnv.js',
    issue: 'Environment validation module does not exist',
    severity: 'high'
  });
}

filesToCheck.forEach(filePath => {
  if (!fs.existsSync(filePath)) return;
  
  const content = fs.readFileSync(filePath, 'utf8');
  
  // Check if validateEnv is imported/required
  if (!content.includes('validateEnv') && !content.includes('validate-env')) {
    issues.missingEnvValidation.push({
      file: path.basename(filePath),
      issue: 'No environment validation on startup',
      severity: 'high'
    });
  }
});

// Check CORS configuration
console.log('\n3. Checking CORS configuration...');
filesToCheck.forEach(filePath => {
  if (!fs.existsSync(filePath)) return;
  
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  
  lines.forEach((line, index) => {
    // Check for hardcoded IPs in CORS
    if (line.includes('origin:') && line.includes('216.238.91.120')) {
      issues.corsIssues.push({
        file: filePath,
        line: index + 1,
        issue: 'Hardcoded IP address in CORS configuration',
        code: line.trim(),
        severity: 'high'
      });
    }
    
    // Check if CORS uses environment variables
    if (line.includes('cors({') || line.includes('cors(')) {
      // Check next few lines for origin configuration
      const nextLines = lines.slice(index, index + 10).join('\n');
      if (!nextLines.includes('process.env') && !nextLines.includes('ALLOWED_ORIGINS')) {
        issues.corsIssues.push({
          file: filePath,
          line: index + 1,
          issue: 'CORS configuration does not use environment variables',
          severity: 'medium'
        });
      }
    }
  });
});

// Check SQL injection risks
console.log('\n4. Checking for SQL injection risks...');
const controllersDir = path.join(__dirname, '../controllers');
if (fs.existsSync(controllersDir)) {
  const controllerFiles = fs.readdirSync(controllersDir)
    .filter(f => f.endsWith('.js'))
    .map(f => path.join(controllersDir, f));
  
  controllerFiles.forEach(filePath => {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    
    lines.forEach((line, index) => {
      // Check for unsafe string concatenation in SQL
      if (line.includes('$queryRaw') || line.includes('$executeRaw')) {
        // Check if using Prisma.sql template (safe) or string concatenation (unsafe)
        const nextLines = lines.slice(Math.max(0, index - 2), index + 3).join('\n');
        if (nextLines.includes('+') && nextLines.includes('req.') && !nextLines.includes('Prisma.sql')) {
          issues.sqlInjectionRisks.push({
            file: filePath,
            line: index + 1,
            issue: 'Potential SQL injection risk: string concatenation in raw query',
            code: line.trim(),
            severity: 'high'
          });
        }
      }
    });
  });
}

// Print results
console.log('\n' + '='.repeat(60));
console.log('\n📊 DIAGNOSTIC RESULTS\n');

let totalIssues = 0;

if (issues.hardcodedSecrets.length > 0) {
  console.log('🔴 HARDCODED SECRETS FOUND:');
  issues.hardcodedSecrets.forEach(issue => {
    console.log(`   ${issue.file}:${issue.line}`);
    console.log(`   ${issue.issue}`);
    console.log(`   Code: ${issue.code}`);
    console.log('');
    totalIssues++;
  });
} else {
  console.log('✅ No hardcoded secrets found');
}

if (issues.missingEnvValidation.length > 0) {
  console.log('\n🔴 MISSING ENVIRONMENT VALIDATION:');
  issues.missingEnvValidation.forEach(issue => {
    console.log(`   ${issue.file || 'N/A'}: ${issue.issue} (${issue.severity})`);
    totalIssues++;
  });
} else {
  console.log('\n✅ Environment validation present');
}

if (issues.corsIssues.length > 0) {
  console.log('\n🔴 CORS CONFIGURATION ISSUES:');
  issues.corsIssues.forEach(issue => {
    console.log(`   ${issue.file}:${issue.line || 'N/A'}`);
    console.log(`   ${issue.issue} (${issue.severity})`);
    if (issue.code) {
      console.log(`   Code: ${issue.code}`);
    }
    console.log('');
    totalIssues++;
  });
} else {
  console.log('\n✅ CORS configuration looks good');
}

if (issues.sqlInjectionRisks.length > 0) {
  console.log('\n🔴 SQL INJECTION RISKS:');
  issues.sqlInjectionRisks.forEach(issue => {
    console.log(`   ${issue.file}:${issue.line}`);
    console.log(`   ${issue.issue} (${issue.severity})`);
    if (issue.code) {
      console.log(`   Code: ${issue.code}`);
    }
    console.log('');
    totalIssues++;
  });
} else {
  console.log('\n✅ No SQL injection risks detected (Prisma.sql template tags are safe)');
}

console.log('\n' + '='.repeat(60));
console.log(`\n📈 Total Issues Found: ${totalIssues}`);

if (totalIssues === 0) {
  console.log('\n✅ All security checks passed!');
  process.exit(0);
} else {
  console.log('\n⚠️  Security issues detected. Please review and fix.');
  process.exit(1);
}






