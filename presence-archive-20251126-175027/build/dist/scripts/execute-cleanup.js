#!/usr/bin/env node
/**
 * Cleanup Execution Script
 *
 * Executes the cleanup plan:
 * 1. Move markdown files from presence/ to docs/
 * 2. Archive test files
 * 3. Delete stale files
 * 4. Clean build artifacts
 *
 * CRITICAL: This script only processes files verified safe to delete.
 */
import * as fs from 'fs';
import * as path from 'path';
const projectRoot = path.resolve(__dirname, '../../..');
const safeToDeletePath = path.join(projectRoot, 'cleanup-safe-to-delete.json');
if (!fs.existsSync(safeToDeletePath)) {
    console.error('❌ cleanup-safe-to-delete.json not found. Run verify-cleanup-safety.ts first.');
    process.exit(1);
}
const candidates = JSON.parse(fs.readFileSync(safeToDeletePath, 'utf-8'));
console.log('🧹 Executing cleanup...\n');
console.log(`Processing ${candidates.length} files...\n`);
const results = {
    moved: [],
    deleted: [],
    errors: []
};
// Ensure docs/orchestration-reports exists
const docsDir = path.join(projectRoot, 'docs', 'orchestration-reports');
if (!fs.existsSync(docsDir)) {
    fs.mkdirSync(docsDir, { recursive: true });
}
// Ensure archive/test-files exists
const archiveTestDir = path.join(projectRoot, 'archive', 'test-files');
if (!fs.existsSync(archiveTestDir)) {
    fs.mkdirSync(archiveTestDir, { recursive: true });
}
for (const candidate of candidates) {
    const fullPath = path.join(projectRoot, candidate.path);
    if (!fs.existsSync(fullPath)) {
        console.log(`⚠️  File not found (may already be deleted): ${candidate.path}`);
        continue;
    }
    try {
        if (candidate.category === 'markdown' && candidate.path.startsWith('presence/')) {
            // Move markdown files from presence/ to docs/orchestration-reports/
            const fileName = path.basename(candidate.path);
            const destPath = path.join(docsDir, fileName);
            // Handle duplicates
            if (fs.existsSync(destPath)) {
                const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
                const nameWithoutExt = path.basename(fileName, path.extname(fileName));
                const ext = path.extname(fileName);
                const newFileName = `${nameWithoutExt}-${timestamp}${ext}`;
                const newDestPath = path.join(docsDir, newFileName);
                fs.copyFileSync(fullPath, newDestPath);
                fs.unlinkSync(fullPath);
                results.moved.push(`${candidate.path} → ${path.relative(projectRoot, newDestPath)}`);
                console.log(`✅ Moved: ${candidate.path} → ${path.relative(projectRoot, newDestPath)}`);
            }
            else {
                fs.copyFileSync(fullPath, destPath);
                fs.unlinkSync(fullPath);
                results.moved.push(`${candidate.path} → ${path.relative(projectRoot, destPath)}`);
                console.log(`✅ Moved: ${candidate.path} → ${path.relative(projectRoot, destPath)}`);
            }
        }
        else if (candidate.category === 'test' && !candidate.path.startsWith('archive/')) {
            // Move test files to archive/test-files/
            const fileName = path.basename(candidate.path);
            const destPath = path.join(archiveTestDir, fileName);
            if (fs.existsSync(destPath)) {
                // File already archived, just delete
                fs.unlinkSync(fullPath);
                results.deleted.push(candidate.path);
                console.log(`✅ Deleted (already archived): ${candidate.path}`);
            }
            else {
                fs.copyFileSync(fullPath, destPath);
                fs.unlinkSync(fullPath);
                results.moved.push(`${candidate.path} → ${path.relative(projectRoot, destPath)}`);
                console.log(`✅ Archived: ${candidate.path} → ${path.relative(projectRoot, destPath)}`);
            }
        }
        else if (candidate.path.includes('/extension/') ||
            candidate.path.includes('/dist/') ||
            candidate.path.includes('/build/')) {
            // Delete build artifacts
            fs.unlinkSync(fullPath);
            results.deleted.push(candidate.path);
            console.log(`✅ Deleted (build artifact): ${candidate.path}`);
        }
        else if (candidate.category === 'stale' ||
            candidate.category === 'diagnostic' ||
            candidate.path.startsWith('archive/') ||
            candidate.path.startsWith('presence-archive-')) {
            // Delete stale files, diagnostic scripts, and archive files
            fs.unlinkSync(fullPath);
            results.deleted.push(candidate.path);
            console.log(`✅ Deleted: ${candidate.path}`);
        }
        else {
            // Default: delete
            fs.unlinkSync(fullPath);
            results.deleted.push(candidate.path);
            console.log(`✅ Deleted: ${candidate.path}`);
        }
    }
    catch (error) {
        const errorMsg = `Failed to process ${candidate.path}: ${error}`;
        results.errors.push(errorMsg);
        console.error(`❌ ${errorMsg}`);
    }
}
// Clean build artifacts (markdown files in extension/, dist/, build/)
console.log('\n🧹 Cleaning build artifacts...\n');
const buildDirs = [
    path.join(projectRoot, 'presence', 'extension'),
    path.join(projectRoot, 'presence', 'dist'),
    path.join(projectRoot, 'presence', 'build')
];
for (const buildDir of buildDirs) {
    if (!fs.existsSync(buildDir))
        continue;
    function cleanMarkdownInDir(dir) {
        const entries = fs.readdirSync(dir, { withFileTypes: true });
        for (const entry of entries) {
            const fullPath = path.join(dir, entry.name);
            if (entry.isDirectory()) {
                cleanMarkdownInDir(fullPath);
            }
            else if (entry.isFile() && entry.name.endsWith('.md')) {
                try {
                    fs.unlinkSync(fullPath);
                    results.deleted.push(path.relative(projectRoot, fullPath));
                    console.log(`✅ Deleted (build artifact): ${path.relative(projectRoot, fullPath)}`);
                }
                catch (error) {
                    results.errors.push(`Failed to delete ${fullPath}: ${error}`);
                }
            }
        }
    }
    cleanMarkdownInDir(buildDir);
}
// Write results
const resultsPath = path.join(projectRoot, 'cleanup-execution-results.json');
fs.writeFileSync(resultsPath, JSON.stringify(results, null, 2));
console.log('\n📊 Cleanup Summary:');
console.log(`  ✅ Moved: ${results.moved.length} files`);
console.log(`  ✅ Deleted: ${results.deleted.length} files`);
console.log(`  ❌ Errors: ${results.errors.length} files`);
if (results.errors.length > 0) {
    console.log('\n⚠️  Errors encountered:');
    results.errors.forEach(err => console.log(`  - ${err}`));
}
console.log(`\n✅ Results written to: ${resultsPath}`);
console.log('\n⚠️  NEXT STEPS:');
console.log('1. Run TypeScript check: npm run type-check');
console.log('2. Run build: npm run build:presence');
console.log('3. Verify no regressions');
console.log('4. Review cleanup-execution-results.json');
//# sourceMappingURL=execute-cleanup.js.map