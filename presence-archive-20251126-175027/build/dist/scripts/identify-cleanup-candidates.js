#!/usr/bin/env node
/**
 * Diagnostic Script: Identify Cleanup Candidates
 *
 * This script identifies files that may be safe to cleanup:
 * 1. Markdown files in presence/ root (should be in docs/)
 * 2. Stale test files (test_*.js in root)
 * 3. Diagnostic scripts that may be outdated
 * 4. Duplicate files across dist/, extension/, build/
 *
 * CRITICAL: This script only IDENTIFIES candidates. Manual review required.
 */
import * as fs from 'fs';
import * as path from 'path';
const candidates = [];
const projectRoot = path.resolve(__dirname, '../../..');
const presenceRoot = path.join(projectRoot, 'presence');
function findFiles(dir, pattern, category, reason) {
    if (!dir || typeof dir !== 'string') {
        console.warn('⚠️  Warning: Invalid directory path provided to findFiles');
        return;
    }
    if (!fs.existsSync(dir)) {
        return; // Directory doesn't exist, skip silently
    }
    let entries;
    try {
        entries = fs.readdirSync(dir, { withFileTypes: true });
    }
    catch (readError) {
        console.warn(`⚠️  Warning: Could not read directory ${dir}:`, readError);
        return;
    }
    if (!entries || entries.length === 0) {
        return; // Empty directory
    }
    for (const entry of entries) {
        if (!entry || !entry.name) {
            continue; // Skip invalid entries
        }
        const fullPath = path.join(dir, entry.name);
        if (!fullPath) {
            console.warn(`⚠️  Warning: Could not construct path for ${entry.name}`);
            continue;
        }
        // Skip node_modules, .git, dist, extension, build
        if (entry.name === 'node_modules' || entry.name === '.git' ||
            entry.name === 'dist' || entry.name === 'extension' || entry.name === 'build') {
            continue;
        }
        if (entry.isDirectory()) {
            findFiles(fullPath, pattern, category, reason);
        }
        else if (entry.isFile() && pattern.test(entry.name)) {
            let stats;
            try {
                stats = fs.statSync(fullPath);
            }
            catch (statError) {
                console.warn(`⚠️  Warning: Could not stat ${fullPath}:`, statError);
                continue;
            }
            const relativePath = path.relative(projectRoot, fullPath);
            if (!relativePath) {
                console.warn(`⚠️  Warning: Could not get relative path for ${fullPath}`);
                continue;
            }
            candidates.push({
                path: relativePath,
                reason,
                category,
                lastModified: stats.mtime,
                size: stats.size
            });
        }
    }
}
console.log('🔍 Identifying cleanup candidates...\n');
// 1. Markdown files in presence/ root (violates .cursorrules)
console.log('1. Checking for markdown files in presence/ root...');
if (!fs.existsSync(presenceRoot)) {
    console.warn(`⚠️  Warning: Presence root not found: ${presenceRoot}`);
}
else {
    let presenceRootFiles;
    try {
        presenceRootFiles = fs.readdirSync(presenceRoot, { withFileTypes: true });
    }
    catch (readError) {
        console.warn(`⚠️  Warning: Could not read presence root:`, readError);
        presenceRootFiles = [];
    }
    for (const entry of presenceRootFiles) {
        if (!entry || !entry.name)
            continue;
        if (entry.isFile() && entry.name.endsWith('.md')) {
            const fullPath = path.join(presenceRoot, entry.name);
            if (!fullPath)
                continue;
            let stats;
            try {
                stats = fs.statSync(fullPath);
            }
            catch (statError) {
                console.warn(`⚠️  Warning: Could not stat ${fullPath}:`, statError);
                continue;
            }
            const relativePath = path.relative(projectRoot, fullPath);
            if (!relativePath)
                continue;
            candidates.push({
                path: relativePath,
                reason: 'Markdown file in presence/ root violates .cursorrules - should be in docs/',
                category: 'markdown',
                lastModified: stats.mtime,
                size: stats.size
            });
        }
    }
}
// 2. Test files in root (test_*.js)
console.log('2. Checking for test files in root...');
findFiles(projectRoot, /^test_.*\.js$/, 'test', 'Test file in root - should be in tests/ or archive/');
// 3. Diagnostic scripts
console.log('3. Checking for diagnostic scripts...');
findFiles(projectRoot, /.*[Dd]iagnostic.*\.js$/, 'diagnostic', 'Diagnostic script - verify if still needed');
findFiles(projectRoot, /.*[Cc]onsole.*\.js$/, 'diagnostic', 'Console diagnostic script - verify if still needed');
// 4. Stale status/progress files
console.log('4. Checking for status/progress files...');
findFiles(projectRoot, /.*_(STATUS|PROGRESS|MIGRATION)_.*\.md$/, 'stale', 'Status/progress file - may be outdated');
findFiles(projectRoot, /.*_(COMPLETE|FIXES|SUMMARY)\.md$/, 'stale', 'Completion/summary file - verify if still relevant');
// Output results
console.log('\n📊 Cleanup Candidates Found:\n');
console.log(`Total: ${candidates.length} files\n`);
// Group by category
const byCategory = candidates.reduce((acc, candidate) => {
    if (!acc[candidate.category])
        acc[candidate.category] = [];
    acc[candidate.category].push(candidate);
    return acc;
}, {});
for (const [category, items] of Object.entries(byCategory)) {
    console.log(`\n${category.toUpperCase()} (${items.length} files):`);
    items.forEach(c => {
        console.log(`  - ${c.path}`);
        console.log(`    Reason: ${c.reason}`);
        console.log(`    Modified: ${c.lastModified.toISOString().split('T')[0]}, Size: ${(c.size / 1024).toFixed(2)} KB`);
    });
}
// Write JSON output for further processing
const outputPath = path.join(projectRoot, 'cleanup-candidates.json');
fs.writeFileSync(outputPath, JSON.stringify(candidates, null, 2));
console.log(`\n✅ Results written to: ${outputPath}`);
console.log('\n⚠️  NEXT STEPS:');
console.log('1. Review candidates manually');
console.log('2. Run TypeScript check: npm run type-check');
console.log('3. Verify files are not imported/referenced');
console.log('4. Log findings to JAUmemory');
console.log('5. Archive or delete after verification');
//# sourceMappingURL=identify-cleanup-candidates.js.map