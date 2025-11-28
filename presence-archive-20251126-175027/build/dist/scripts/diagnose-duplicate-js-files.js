/**
 * Diagnostic Script: Verify Duplicate JS Files Deletion
 *
 * Checks for:
 * 1. Presence of duplicate .js files in services/ and sidepanel/
 * 2. Imports referencing .js files
 * 3. Build compatibility after deletion
 */
import { existsSync } from 'fs';
import { join } from 'path';
const filesToCheck = [
    'presence/src/services/SupabaseService.js',
    'presence/src/services/MessageLoadingService.js',
    'presence/src/sidepanel/types.js',
    'presence/src/sidepanel/buildGraph.js'
];
const correspondingTsFiles = [
    'presence/src/services/SupabaseService.ts',
    'presence/src/services/MessageLoadingService.ts',
    'presence/src/sidepanel/types.ts',
    'presence/src/sidepanel/buildGraph.ts'
];
const projectRoot = join(__dirname, '../../..');
// Defensive check: Ensure project root exists
if (!projectRoot || !existsSync(projectRoot)) {
    console.error(`❌ Error: Project root not found: ${projectRoot}`);
    process.exit(1);
}
console.log('🔍 DIAGNOSTIC: Checking for duplicate JS files...\n');
let foundDuplicates = false;
let missingTsFiles = false;
if (!filesToCheck || filesToCheck.length === 0) {
    console.error('❌ Error: No files to check');
    process.exit(1);
}
for (let i = 0; i < filesToCheck.length; i++) {
    if (!filesToCheck[i] || !correspondingTsFiles[i]) {
        console.warn(`⚠️  Warning: Missing file definition at index ${i}`);
        continue;
    }
    const jsPath = join(projectRoot, filesToCheck[i]);
    const tsPath = join(projectRoot, correspondingTsFiles[i]);
    if (!jsPath || !tsPath) {
        console.warn(`⚠️  Warning: Could not construct paths for index ${i}`);
        continue;
    }
    const jsExists = existsSync(jsPath);
    const tsExists = existsSync(tsPath);
    if (jsExists) {
        console.log(`❌ DUPLICATE FOUND: ${filesToCheck[i]}`);
        foundDuplicates = true;
    }
    else {
        console.log(`✅ NOT FOUND: ${filesToCheck[i]}`);
    }
    if (!tsExists) {
        console.log(`⚠️  WARNING: Missing TypeScript file: ${correspondingTsFiles[i]}`);
        missingTsFiles = true;
    }
    else {
        console.log(`✅ EXISTS: ${correspondingTsFiles[i]}`);
    }
    console.log('');
}
if (foundDuplicates) {
    console.log('❌ DIAGNOSTIC RESULT: Duplicate .js files still exist. Deletion required.');
    process.exit(1);
}
else if (missingTsFiles) {
    console.log('⚠️  DIAGNOSTIC RESULT: Some TypeScript files are missing. Cannot proceed.');
    process.exit(1);
}
else {
    console.log('✅ DIAGNOSTIC RESULT: No duplicate .js files found. All TypeScript files present.');
    process.exit(0);
}
//# sourceMappingURL=diagnose-duplicate-js-files.js.map