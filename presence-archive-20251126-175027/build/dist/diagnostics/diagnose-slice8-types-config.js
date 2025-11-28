/**
 * Slice 8 Diagnostic: Type Definitions & Configuration Verification
 *
 * This diagnostic script checks:
 * 1. Type definitions for duplicate snake_case/camelCase fields
 * 2. TypeScript configuration alignment between root and presence tsconfig.json
 * 3. Strict mode flags verification
 * 4. Type definition completeness
 */
import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const results = [];
// Helper to read JSON file
function readJsonFile(path) {
    try {
        const content = readFileSync(path, 'utf-8');
        return JSON.parse(content);
    }
    catch (error) {
        return null;
    }
}
// Check 1: Verify type definitions for snake_case/camelCase duplicates
function checkTypeDefinitions() {
    const typesDir = join(__dirname, '../types');
    const typeFiles = [
        'index.ts',
        'api.ts',
        'events.ts',
        'notifications.ts',
        'subscriptions.ts',
        'anchors.ts',
        'provenance.ts'
    ];
    const snakeCasePattern = /\b(user_id|user_name|created_at|updated_at|avatar_url|community_id|page_id|parent_id|author_id|message_id|target_id|target_type|target_name|auto_subscribed|notify_on_mention|notify_on_reply|muted_until|bookmark_count|is_bookmarked|has_replies|reply_count|message_kind|emoji_metadata|focus_context|camera_source|has_sensitive_media|optional_content|conversation_id)\b/gi;
    let foundSnakeCase = false;
    const snakeCaseFields = [];
    for (const file of typeFiles) {
        const filePath = join(typesDir, file);
        if (!existsSync(filePath))
            continue;
        const content = readFileSync(filePath, 'utf-8');
        const matches = content.match(snakeCasePattern);
        if (matches) {
            foundSnakeCase = true;
            snakeCaseFields.push(...matches.map(m => `${file}: ${m}`));
        }
    }
    if (foundSnakeCase) {
        results.push({
            check: 'Type Definitions: snake_case fields',
            status: 'FAIL',
            message: 'Found snake_case fields in type definitions. All fields should use camelCase.',
            details: snakeCaseFields
        });
    }
    else {
        results.push({
            check: 'Type Definitions: snake_case fields',
            status: 'PASS',
            message: 'No snake_case fields found. All fields use camelCase.'
        });
    }
}
// Check 2: Verify TypeScript configuration alignment
function checkTypeScriptConfigs() {
    // Try multiple possible paths
    const possibleRootPaths = [
        join(__dirname, '../../../tsconfig.json'),
        join(__dirname, '../../../../tsconfig.json'),
        join(process.cwd(), 'tsconfig.json')
    ];
    const possiblePresencePaths = [
        join(__dirname, '../tsconfig.json'),
        join(process.cwd(), 'presence/tsconfig.json')
    ];
    let rootConfigPath = null;
    let presenceConfigPath = null;
    for (const path of possibleRootPaths) {
        if (existsSync(path)) {
            rootConfigPath = path;
            break;
        }
    }
    for (const path of possiblePresencePaths) {
        if (existsSync(path)) {
            presenceConfigPath = path;
            break;
        }
    }
    if (!rootConfigPath || !presenceConfigPath) {
        results.push({
            check: 'TypeScript Config: File existence',
            status: 'FAIL',
            message: `One or both tsconfig.json files are missing. Root: ${rootConfigPath || 'NOT FOUND'}, Presence: ${presenceConfigPath || 'NOT FOUND'}`,
            details: [
                `Searched root paths: ${possibleRootPaths.join(', ')}`,
                `Searched presence paths: ${possiblePresencePaths.join(', ')}`
            ]
        });
        return;
    }
    const rootConfig = readJsonFile(rootConfigPath);
    const presenceConfig = readJsonFile(presenceConfigPath);
    if (!rootConfig || !presenceConfig) {
        results.push({
            check: 'TypeScript Config: File parsing',
            status: 'FAIL',
            message: 'One or both tsconfig.json files could not be parsed as JSON.',
            details: [
                `Root config path: ${rootConfigPath}`,
                `Presence config path: ${presenceConfigPath}`
            ]
        });
        return;
    }
    const rootOpts = rootConfig.compilerOptions || {};
    const presenceOpts = presenceConfig.compilerOptions || {};
    // Check strict mode
    const rootStrict = rootOpts.strict === true;
    const presenceStrict = presenceOpts.strict === true;
    if (!rootStrict || !presenceStrict) {
        results.push({
            check: 'TypeScript Config: Strict mode',
            status: 'FAIL',
            message: `Strict mode not enabled. Root: ${rootStrict}, Presence: ${presenceStrict}`,
            details: [
                `Root tsconfig.json strict: ${rootStrict}`,
                `Presence tsconfig.json strict: ${presenceStrict}`
            ]
        });
    }
    else {
        results.push({
            check: 'TypeScript Config: Strict mode',
            status: 'PASS',
            message: 'Strict mode enabled in both configurations.'
        });
    }
    // Check critical strict flags
    const criticalFlags = [
        'noUnusedLocals',
        'noUnusedParameters',
        'noImplicitReturns',
        'noFallthroughCasesInSwitch',
        'noUncheckedIndexedAccess'
    ];
    const missingFlags = [];
    for (const flag of criticalFlags) {
        if (presenceOpts[flag] !== true) {
            missingFlags.push(flag);
        }
    }
    if (missingFlags.length > 0) {
        results.push({
            check: 'TypeScript Config: Critical strict flags',
            status: 'WARN',
            message: `Some critical strict flags are not enabled in presence/tsconfig.json`,
            details: [`Missing flags: ${missingFlags.join(', ')}`]
        });
    }
    else {
        results.push({
            check: 'TypeScript Config: Critical strict flags',
            status: 'PASS',
            message: 'All critical strict flags are enabled.'
        });
    }
    // Check module system alignment
    const rootModule = rootOpts.module;
    const presenceModule = presenceOpts.module;
    if (rootModule !== presenceModule && rootModule !== 'ESNext') {
        results.push({
            check: 'TypeScript Config: Module system',
            status: 'WARN',
            message: `Module systems differ. Root: ${rootModule}, Presence: ${presenceModule}`,
            details: [
                'Root should use ESNext or match presence module system',
                `Root module: ${rootModule}`,
                `Presence module: ${presenceModule}`
            ]
        });
    }
    else {
        results.push({
            check: 'TypeScript Config: Module system',
            status: 'PASS',
            message: 'Module systems are aligned (ES6/ES2020/ESNext).'
        });
    }
}
// Check 3: Verify type definition exports
function checkTypeExports() {
    const indexPath = join(__dirname, '../types/index.ts');
    if (!existsSync(indexPath)) {
        results.push({
            check: 'Type Definitions: Index file',
            status: 'FAIL',
            message: 'presence/src/types/index.ts does not exist.'
        });
        return;
    }
    const content = readFileSync(indexPath, 'utf-8');
    // Check for re-exports
    const hasReExports = /export \* from ['"]\.\/[^'"]+['"]/g.test(content);
    if (!hasReExports) {
        results.push({
            check: 'Type Definitions: Re-exports',
            status: 'WARN',
            message: 'No re-exports found in index.ts. Consider re-exporting from sub-modules.'
        });
    }
    else {
        results.push({
            check: 'Type Definitions: Re-exports',
            status: 'PASS',
            message: 'Type definitions are properly re-exported from sub-modules.'
        });
    }
    // Check for core types
    const coreTypes = ['User', 'Message', 'Community', 'StateManager'];
    const missingTypes = [];
    for (const type of coreTypes) {
        if (!content.includes(`interface ${type}`) && !content.includes(`type ${type}`) && !content.includes(`export.*${type}`)) {
            missingTypes.push(type);
        }
    }
    if (missingTypes.length > 0) {
        results.push({
            check: 'Type Definitions: Core types',
            status: 'WARN',
            message: `Some core types may be missing from index.ts`,
            details: [`Potentially missing: ${missingTypes.join(', ')}`]
        });
    }
    else {
        results.push({
            check: 'Type Definitions: Core types',
            status: 'PASS',
            message: 'Core types are present in index.ts.'
        });
    }
}
// Run all checks
console.log('🔍 Running Slice 8 Diagnostic: Type Definitions & Configuration\n');
checkTypeDefinitions();
checkTypeScriptConfigs();
checkTypeExports();
// Print results
console.log('📊 Diagnostic Results:\n');
let passCount = 0;
let failCount = 0;
let warnCount = 0;
for (const result of results) {
    const icon = result.status === 'PASS' ? '✅' : result.status === 'FAIL' ? '❌' : '⚠️';
    console.log(`${icon} ${result.check}: ${result.status}`);
    console.log(`   ${result.message}`);
    if (result.details && result.details.length > 0) {
        console.log('   Details:');
        for (const detail of result.details) {
            console.log(`     - ${detail}`);
        }
    }
    console.log();
    if (result.status === 'PASS')
        passCount++;
    else if (result.status === 'FAIL')
        failCount++;
    else
        warnCount++;
}
console.log('📈 Summary:');
console.log(`   ✅ Passed: ${passCount}`);
console.log(`   ❌ Failed: ${failCount}`);
console.log(`   ⚠️  Warnings: ${warnCount}`);
console.log();
if (failCount > 0) {
    console.log('❌ Diagnostic FAILED. Please fix the issues above.');
    process.exit(1);
}
else if (warnCount > 0) {
    console.log('⚠️  Diagnostic completed with warnings. Review above.');
    process.exit(0);
}
else {
    console.log('✅ Diagnostic PASSED. All checks successful.');
    process.exit(0);
}
//# sourceMappingURL=diagnose-slice8-types-config.js.map