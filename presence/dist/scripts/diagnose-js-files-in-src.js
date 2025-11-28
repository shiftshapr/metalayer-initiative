/**
 * Diagnostic Script: JavaScript Files in Source Directory
 * Finds all .js files in presence/src/ that should be migrated to TypeScript
 *
 * Run: npx ts-node presence/src/scripts/diagnose-js-files-in-src.ts
 */
import * as fs from 'fs';
import * as path from 'path';
const results = [];
const srcDir = path.join(__dirname, '..');
function findJsFiles(dir, relativePath = '') {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        const relPath = path.join(relativePath, entry.name);
        // Skip scripts directory (diagnostic scripts are allowed)
        if (entry.isDirectory() && entry.name === 'scripts') {
            continue;
        }
        if (entry.isFile() && entry.name.endsWith('.js')) {
            const baseName = entry.name.replace('.js', '');
            const tsPath = path.join(dir, `${baseName}.ts`);
            const dtsPath = path.join(dir, `${baseName}.d.ts`);
            const hasTypeDefinition = fs.existsSync(dtsPath);
            const hasTypeScriptVersion = fs.existsSync(tsPath);
            const shouldMigrate = !hasTypeScriptVersion;
            results.push({
                file: relPath,
                hasTypeDefinition,
                hasTypeScriptVersion,
                shouldMigrate,
                reason: hasTypeScriptVersion
                    ? 'Has TypeScript version - JS file should be deleted'
                    : 'No TypeScript version - should be migrated'
            });
        }
        else if (entry.isDirectory()) {
            findJsFiles(fullPath, relPath);
        }
    }
}
console.log('🔍 Diagnosing JavaScript files in src/ directory...\n');
findJsFiles(srcDir);
if (results.length === 0) {
    console.log('✅ No JavaScript files found in src/ (excluding scripts/)');
    process.exit(0);
}
console.log(`Found ${results.length} JavaScript file(s):\n`);
let migrationNeeded = 0;
let deletionNeeded = 0;
for (const result of results) {
    const status = result.shouldMigrate ? '⚠️  MIGRATE' : '🗑️  DELETE';
    console.log(`${status}: ${result.file}`);
    console.log(`   Reason: ${result.reason}`);
    if (result.hasTypeDefinition) {
        console.log(`   Has .d.ts: Yes`);
    }
    console.log('');
    if (result.shouldMigrate) {
        migrationNeeded++;
    }
    else {
        deletionNeeded++;
    }
}
console.log('\n📊 Summary:');
console.log(`   Total JS files: ${results.length}`);
console.log(`   Need migration: ${migrationNeeded}`);
console.log(`   Need deletion: ${deletionNeeded}`);
if (migrationNeeded > 0 || deletionNeeded > 0) {
    console.log('\n❌ Issues found - action required');
    process.exit(1);
}
else {
    console.log('\n✅ No issues found');
    process.exit(0);
}
//# sourceMappingURL=diagnose-js-files-in-src.js.map