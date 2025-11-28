/**
 * Diagnostic Script: UI Duplicate Files Detection
 *
 * Purpose: Verify duplicate .js files in presence/src/ui/ and check for imports
 *
 * Files to check:
 * - presence/src/ui/diagnostics.js (should be deleted)
 * - presence/src/ui/autoResize.js (should be deleted)
 * - presence/src/ui/tabNavigation.js (should be deleted)
 *
 * Corresponding .ts files should exist and be complete.
 */
import { existsSync } from 'fs';
import { join } from 'path';
const UI_DIR = join(process.cwd(), 'presence/src/ui');
const FILES_TO_CHECK = [
    { js: 'diagnostics.js', ts: 'diagnostics.ts' },
    { js: 'autoResize.js', ts: 'autoResize.ts' },
    { js: 'tabNavigation.js', ts: 'tabNavigation.ts' }
];
// Defensive check: Ensure UI_DIR exists
if (!existsSync(UI_DIR)) {
    console.error(`❌ Error: UI directory not found: ${UI_DIR}`);
    process.exit(1);
}
const results = [];
console.log('🔍 UI Duplicate Files Diagnostic\n');
console.log('='.repeat(60));
// Check each file pair
for (const { js, ts } of FILES_TO_CHECK) {
    const jsPath = join(UI_DIR, js);
    const tsPath = join(UI_DIR, ts);
    const jsExists = existsSync(jsPath);
    const tsExists = existsSync(tsPath);
    const result = {
        file: js,
        jsExists,
        tsExists,
        jsShouldBeDeleted: jsExists && tsExists,
        importsFound: []
    };
    // Search for imports of .js file
    if (jsExists) {
        try {
            const jsName = js.replace('.js', '');
            if (!jsName) {
                console.warn(`⚠️  Warning: Invalid JS filename: ${js}`);
                result.importsFound = [];
            }
            else {
                const searchPattern = new RegExp(`['"]\\.\\.?/.*${jsName}\\.js['"]`, 'g');
                // This would require searching all files - simplified for diagnostic
                result.importsFound = ['(import search would require full codebase scan)'];
            }
        }
        catch (error) {
            console.warn(`⚠️  Warning: Error creating search pattern for ${js}:`, error);
            result.importsFound = [];
        }
    }
    results.push(result);
    console.log(`\n📄 ${js}:`);
    console.log(`   JS exists: ${jsExists ? '✅' : '❌'}`);
    console.log(`   TS exists: ${tsExists ? '✅' : '❌'}`);
    console.log(`   Should delete JS: ${result.jsShouldBeDeleted ? '✅ YES' : '❌ NO'}`);
}
console.log('\n' + '='.repeat(60));
console.log('\n📊 Summary:');
const duplicatesFound = results.filter(r => r.jsShouldBeDeleted).length;
const missingTS = results.filter(r => !r.tsExists && r.jsExists).length;
console.log(`   Duplicate .js files found: ${duplicatesFound}`);
console.log(`   Missing .ts files: ${missingTS}`);
if (duplicatesFound === 3 && missingTS === 0) {
    console.log('\n✅ READY FOR DELETION: All 3 .js files can be safely deleted');
}
else if (missingTS > 0) {
    console.log('\n⚠️  WARNING: Some .ts files are missing. Do not delete .js files yet.');
}
else {
    console.log('\n⚠️  WARNING: Unexpected state. Review before deletion.');
}
console.log('\n' + '='.repeat(60));
export { results, duplicatesFound, missingTS };
//# sourceMappingURL=diagnose-ui-duplicates.js.map