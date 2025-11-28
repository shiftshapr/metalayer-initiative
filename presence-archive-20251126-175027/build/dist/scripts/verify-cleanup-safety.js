#!/usr/bin/env node
/**
 * Verification Script: Verify Cleanup Safety
 *
 * This script verifies that cleanup candidates are not referenced by:
 * 1. TypeScript source files
 * 2. Import statements
 * 3. Build configuration
 * 4. Package.json scripts
 */
import * as fs from 'fs';
import * as path from 'path';
const projectRoot = path.resolve(__dirname, '../../..');
const candidatesPath = path.join(projectRoot, 'cleanup-candidates.json');
if (!fs.existsSync(candidatesPath)) {
    console.error('❌ cleanup-candidates.json not found. Run identify-cleanup-candidates.ts first.');
    process.exit(1);
}
const candidates = JSON.parse(fs.readFileSync(candidatesPath, 'utf-8'));
const safeToDelete = [];
const needsReview = [];
console.log('🔍 Verifying cleanup safety...\n');
// Read all TypeScript source files
function getAllSourceFiles(dir, fileList = []) {
    if (!fs.existsSync(dir))
        return fileList;
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.name === 'node_modules' || entry.name === '.git' ||
            entry.name === 'dist' || entry.name === 'extension' || entry.name === 'build') {
            continue;
        }
        if (entry.isDirectory()) {
            getAllSourceFiles(fullPath, fileList);
        }
        else if (entry.isFile() && (entry.name.endsWith('.ts') || entry.name.endsWith('.js'))) {
            fileList.push(fullPath);
        }
    }
    return fileList;
}
const sourceFiles = getAllSourceFiles(path.join(projectRoot, 'presence/src'));
const allSourceContent = sourceFiles.map(file => ({
    path: file,
    content: fs.readFileSync(file, 'utf-8')
}));
// Check package.json
const packageJsonPath = path.join(projectRoot, 'package.json');
let packageJsonContent = '';
if (fs.existsSync(packageJsonPath)) {
    packageJsonContent = fs.readFileSync(packageJsonPath, 'utf-8');
}
// Check tsconfig.json
const tsconfigPath = path.join(projectRoot, 'presence/tsconfig.json');
let tsconfigContent = '';
if (fs.existsSync(tsconfigPath)) {
    tsconfigContent = fs.readFileSync(tsconfigPath, 'utf-8');
}
console.log(`Checking ${candidates.length} candidates against ${sourceFiles.length} source files...\n`);
for (const candidate of candidates) {
    const fileName = path.basename(candidate.path);
    const fileNameWithoutExt = path.basename(candidate.path, path.extname(candidate.path));
    let isReferenced = false;
    const references = [];
    // Check source files
    for (const source of allSourceContent) {
        // Check for direct filename references
        if (source.content.includes(fileName) || source.content.includes(fileNameWithoutExt)) {
            // More specific check - avoid false positives
            const regex = new RegExp(`['"]${fileName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}['"]`, 'g');
            if (regex.test(source.content)) {
                isReferenced = true;
                references.push(`Source: ${path.relative(projectRoot, source.path)}`);
            }
        }
    }
    // Check package.json
    if (packageJsonContent.includes(fileName) || packageJsonContent.includes(fileNameWithoutExt)) {
        isReferenced = true;
        references.push('package.json');
    }
    // Check tsconfig.json
    if (tsconfigContent.includes(fileName) || tsconfigContent.includes(fileNameWithoutExt)) {
        isReferenced = true;
        references.push('tsconfig.json');
    }
    // Special handling for markdown files in presence/ - these are definitely violations
    if (candidate.category === 'markdown' && candidate.path.startsWith('presence/')) {
        // Markdown files in presence/ root are violations - safe to move/delete
        safeToDelete.push(candidate);
    }
    else if (!isReferenced) {
        safeToDelete.push(candidate);
    }
    else {
        needsReview.push({ ...candidate, references: references.join(', ') });
    }
}
console.log(`✅ Safe to delete: ${safeToDelete.length} files`);
console.log(`⚠️  Needs review: ${needsReview.length} files\n`);
if (needsReview.length > 0) {
    console.log('Files that may be referenced:');
    needsReview.forEach(c => {
        console.log(`  - ${c.path}`);
        console.log(`    References: ${c.references}`);
    });
    console.log();
}
// Write results
const resultsPath = path.join(projectRoot, 'cleanup-safe-to-delete.json');
fs.writeFileSync(resultsPath, JSON.stringify(safeToDelete, null, 2));
console.log(`✅ Safe-to-delete list written to: ${resultsPath}`);
if (needsReview.length > 0) {
    const reviewPath = path.join(projectRoot, 'cleanup-needs-review.json');
    fs.writeFileSync(reviewPath, JSON.stringify(needsReview, null, 2));
    console.log(`⚠️  Needs-review list written to: ${reviewPath}`);
}
console.log('\n📋 Summary:');
console.log(`  - Markdown files in presence/ root: ${safeToDelete.filter(c => c.category === 'markdown').length}`);
console.log(`  - Test files: ${safeToDelete.filter(c => c.category === 'test').length}`);
console.log(`  - Diagnostic scripts: ${safeToDelete.filter(c => c.category === 'diagnostic').length}`);
console.log(`  - Stale files: ${safeToDelete.filter(c => c.category === 'stale').length}`);
//# sourceMappingURL=verify-cleanup-safety.js.map