/**
 * Comprehensive TypeScript Best Practices Audit
 * Scans for common TypeScript mistakes and best practice violations
 *
 * Categories:
 * 1. Type Safety Issues
 * 2. Code Quality Issues
 * 3. Performance Issues
 * 4. Maintainability Issues
 * 5. Best Practice Violations
 */
import { readFileSync, readdirSync, statSync } from 'fs';
import { join, extname } from 'path';
const issues = [];
const srcDir = join(process.cwd(), 'src');
// Patterns to check
const patterns = {
    // Type Safety
    anyType: /:\s*any\b/g,
    anyAssertion: /\sas\s+any\b/g,
    unknownAssertion: /\sas\s+unknown\s+as\s/g,
    tsIgnore: /@ts-ignore/g,
    tsExpectError: /@ts-expect-error/g,
    tsNocheck: /@ts-nocheck/g,
    nonNullAssertion: /!\s*[;),\]}]/g,
    // Code Quality
    consoleLog: /console\.(log|warn|error|info|debug)\(/g,
    emptyCatch: /catch\s*\(\s*\)\s*\{\s*\}/g,
    emptyCatchWithVar: /catch\s*\([^)]+\)\s*\{\s*\}/g,
    magicNumbers: /\b\d{3,}\b/g,
    longFunction: /function\s+\w+[^}]{200,}/g,
    // Best Practices
    varKeyword: /\bvar\s+/g,
    functionKeyword: /function\s+\w+\s*\(/g,
    eval: /\beval\s*\(/g,
    withStatement: /\bwith\s*\(/g,
    // Type Issues
    optionalChainOveruse: /\?\?\.\?\?\./g,
    typeAssertion: /\sas\s+[A-Z]/g,
    interfaceAny: /interface\s+\w+[^}]*:\s*any/g,
    // Performance
    forInLoop: /\bfor\s*\(\s*\w+\s+in\s+/g,
    innerHTML: /\.innerHTML\s*=/g,
    // Maintainability
    longLine: /.{120,}/g,
    deepNesting: /\{\s*\{\s*\{\s*\{/g,
};
function scanFile(filePath) {
    try {
        const content = readFileSync(filePath, 'utf-8');
        const lines = content.split('\n');
        const relativePath = filePath.replace(process.cwd() + '/', '');
        lines.forEach((line, index) => {
            const lineNum = index + 1;
            // Check for 'any' types
            if (patterns.anyType.test(line) && !line.includes('//')) {
                issues.push({
                    file: relativePath,
                    line: lineNum,
                    column: line.indexOf('any'),
                    category: 'Type Safety',
                    severity: 'high',
                    issue: 'Use of `any` type',
                    recommendation: 'Replace with specific type or `unknown`',
                    code: line.trim()
                });
            }
            // Check for 'as any' assertions
            if (patterns.anyAssertion.test(line)) {
                issues.push({
                    file: relativePath,
                    line: lineNum,
                    column: line.indexOf('as any'),
                    category: 'Type Safety',
                    severity: 'critical',
                    issue: 'Type assertion to `any`',
                    recommendation: 'Use proper type or type guard',
                    code: line.trim()
                });
            }
            // Check for @ts-ignore
            if (patterns.tsIgnore.test(line)) {
                issues.push({
                    file: relativePath,
                    line: lineNum,
                    column: line.indexOf('@ts-ignore'),
                    category: 'Type Safety',
                    severity: 'high',
                    issue: 'TypeScript error suppression',
                    recommendation: 'Fix the underlying type error',
                    code: line.trim()
                });
            }
            // Check for @ts-expect-error
            if (patterns.tsExpectError.test(line)) {
                issues.push({
                    file: relativePath,
                    line: lineNum,
                    column: line.indexOf('@ts-expect-error'),
                    category: 'Type Safety',
                    severity: 'medium',
                    issue: 'TypeScript error expectation',
                    recommendation: 'Verify if error is expected, otherwise fix',
                    code: line.trim()
                });
            }
            // Check for non-null assertions
            const nonNullMatches = line.match(/[^!]!\s*[a-zA-Z_$]/g);
            if (nonNullMatches && nonNullMatches.length > 0) {
                issues.push({
                    file: relativePath,
                    line: lineNum,
                    column: line.indexOf('!'),
                    category: 'Type Safety',
                    severity: 'medium',
                    issue: 'Non-null assertion operator',
                    recommendation: 'Add proper null check or use optional chaining',
                    code: line.trim()
                });
            }
            // Check for empty catch blocks
            if (patterns.emptyCatch.test(line) || patterns.emptyCatchWithVar.test(line)) {
                issues.push({
                    file: relativePath,
                    line: lineNum,
                    column: line.indexOf('catch'),
                    category: 'Code Quality',
                    severity: 'high',
                    issue: 'Empty catch block',
                    recommendation: 'Handle errors appropriately or log them',
                    code: line.trim()
                });
            }
            // Check for console.log (in production code)
            if (patterns.consoleLog.test(line) && !relativePath.includes('test') && !relativePath.includes('diagnostic')) {
                issues.push({
                    file: relativePath,
                    line: lineNum,
                    column: line.indexOf('console.'),
                    category: 'Code Quality',
                    severity: 'low',
                    issue: 'Console statement in production code',
                    recommendation: 'Use proper logging utility',
                    code: line.trim()
                });
            }
            // Check for var keyword
            if (patterns.varKeyword.test(line)) {
                issues.push({
                    file: relativePath,
                    line: lineNum,
                    column: line.indexOf('var'),
                    category: 'Best Practices',
                    severity: 'medium',
                    issue: 'Use of `var` keyword',
                    recommendation: 'Use `let` or `const` instead',
                    code: line.trim()
                });
            }
            // Check for eval
            if (patterns.eval.test(line)) {
                issues.push({
                    file: relativePath,
                    line: lineNum,
                    column: line.indexOf('eval'),
                    category: 'Security',
                    severity: 'critical',
                    issue: 'Use of `eval`',
                    recommendation: 'Remove eval, use safer alternatives',
                    code: line.trim()
                });
            }
            // Check for innerHTML
            if (patterns.innerHTML.test(line)) {
                issues.push({
                    file: relativePath,
                    line: lineNum,
                    column: line.indexOf('.innerHTML'),
                    category: 'Security',
                    severity: 'high',
                    issue: 'Direct innerHTML assignment',
                    recommendation: 'Use textContent or sanitize HTML',
                    code: line.trim()
                });
            }
            // Check for long lines (>120 chars)
            if (line.length > 120 && !line.trim().startsWith('//')) {
                issues.push({
                    file: relativePath,
                    line: lineNum,
                    column: 121,
                    category: 'Maintainability',
                    severity: 'low',
                    issue: 'Line exceeds 120 characters',
                    recommendation: 'Break into multiple lines',
                    code: line.trim().substring(0, 140) + '...'
                });
            }
        });
    }
    catch (error) {
        console.error(`Error scanning ${filePath}:`, error);
    }
}
function walkDirectory(dir) {
    const entries = readdirSync(dir);
    for (const entry of entries) {
        const fullPath = join(dir, entry);
        const stat = statSync(fullPath);
        if (stat.isDirectory()) {
            // Skip node_modules, dist, build, extension
            if (!['node_modules', 'dist', 'build', 'extension', '.git'].includes(entry)) {
                walkDirectory(fullPath);
            }
        }
        else if (stat.isFile() && extname(entry) === '.ts') {
            // Skip test and diagnostic files
            if (!entry.includes('.test.') &&
                !entry.includes('.spec.') &&
                !entry.includes('diagnostic') &&
                !entry.includes('diagnose')) {
                scanFile(fullPath);
            }
        }
    }
}
function generateReport() {
    console.log('🔍 Scanning TypeScript files for best practices violations...');
    walkDirectory(srcDir);
    const byCategory = {};
    const bySeverity = {};
    issues.forEach(issue => {
        byCategory[issue.category] = (byCategory[issue.category] || 0) + 1;
        bySeverity[issue.severity] = (bySeverity[issue.severity] || 0) + 1;
    });
    return {
        timestamp: new Date().toISOString(),
        totalIssues: issues.length,
        byCategory,
        bySeverity,
        issues
    };
}
function printReport(report) {
    console.log('\n' + '='.repeat(80));
    console.log('📋 TYPESCRIPT BEST PRACTICES AUDIT REPORT');
    console.log('='.repeat(80));
    console.log(`Timestamp: ${report.timestamp}`);
    console.log(`Total Issues: ${report.totalIssues}`);
    console.log('\n📊 By Category:');
    Object.entries(report.byCategory)
        .sort(([, a], [, b]) => b - a)
        .forEach(([category, count]) => {
        console.log(`  ${category}: ${count}`);
    });
    console.log('\n📊 By Severity:');
    Object.entries(report.bySeverity)
        .sort(([, a], [, b]) => b - a)
        .forEach(([severity, count]) => {
        console.log(`  ${severity}: ${count}`);
    });
    // Group by file
    const byFile = {};
    report.issues.forEach(issue => {
        if (!byFile[issue.file]) {
            byFile[issue.file] = [];
        }
        byFile[issue.file].push(issue);
    });
    console.log('\n📁 Issues by File:');
    Object.entries(byFile)
        .sort(([, a], [, b]) => b.length - a.length)
        .slice(0, 20)
        .forEach(([file, fileIssues]) => {
        console.log(`\n  ${file} (${fileIssues.length} issues):`);
        fileIssues.slice(0, 5).forEach(issue => {
            console.log(`    Line ${issue.line}:${issue.column} [${issue.severity.toUpperCase()}] ${issue.issue}`);
            if (issue.code) {
                console.log(`      Code: ${issue.code.substring(0, 80)}...`);
            }
        });
        if (fileIssues.length > 5) {
            console.log(`    ... and ${fileIssues.length - 5} more`);
        }
    });
    console.log('\n' + '='.repeat(80));
    // Critical issues summary
    const critical = report.issues.filter(i => i.severity === 'critical');
    if (critical.length > 0) {
        console.log(`\n🚨 CRITICAL ISSUES (${critical.length}):`);
        critical.slice(0, 10).forEach(issue => {
            console.log(`  ${issue.file}:${issue.line} - ${issue.issue}`);
        });
    }
}
// Main execution
try {
    const report = generateReport();
    printReport(report);
    // Save to file
    const fs = require('fs');
    fs.writeFileSync(join(process.cwd(), 'docs/TYPESCRIPT_BEST_PRACTICES_AUDIT.json'), JSON.stringify(report, null, 2));
    console.log('\n✅ Report saved to docs/TYPESCRIPT_BEST_PRACTICES_AUDIT.json');
    process.exit(report.totalIssues > 0 ? 1 : 0);
}
catch (error) {
    console.error('❌ Error running audit:', error);
    process.exit(1);
}
//# sourceMappingURL=audit-typescript-best-practices.js.map