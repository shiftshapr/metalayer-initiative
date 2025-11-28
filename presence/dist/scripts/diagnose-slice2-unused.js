/**
 * Diagnostic Script: Slice 2 - Unused Variables/Parameters/Imports
 * Detects unused code in Auth & Profile modules
 *
 * Generated: 2025-01-24
 * Slice: 2 (Auth & Profile Modules)
 */
const errors = [
    {
        file: 'presence/src/features/AuthManager.ts',
        line: 71,
        column: 47,
        type: 'unused-parameter',
        name: 'email',
        severity: 'low'
    },
    {
        file: 'presence/src/features/AuthModule.ts',
        line: 26,
        column: 11,
        type: 'unused-interface',
        name: 'ApiClient',
        severity: 'low'
    },
    {
        file: 'presence/src/features/AuthModule.ts',
        line: 38,
        column: 11,
        type: 'unused-interface',
        name: 'UserProfile',
        severity: 'low'
    },
    {
        file: 'presence/src/features/AuthModule.ts',
        line: 132,
        column: 39,
        type: 'unused-variable',
        name: 'sessionError',
        severity: 'low'
    },
    {
        file: 'presence/src/features/ProfileManager.ts',
        line: 144,
        column: 11,
        type: 'unused-variable',
        name: 'authPromise',
        severity: 'low'
    },
    {
        file: 'presence/src/features/ProfileManager.ts',
        line: 302,
        column: 11,
        type: 'unused-variable',
        name: 'preRenderReady',
        severity: 'low'
    },
    {
        file: 'presence/src/features/ProfileManager.ts',
        line: 732,
        column: 11,
        type: 'unused-variable',
        name: 'currentUserUnsubscribe',
        severity: 'low'
    },
    {
        file: 'presence/src/features/ProfileManager.ts',
        line: 1758,
        column: 11,
        type: 'unused-variable',
        name: 'currentThemeGetter',
        severity: 'low'
    },
    {
        file: 'presence/src/features/ProfileManager.ts',
        line: 2843,
        column: 9,
        type: 'unused-variable',
        name: 'userAvatarContainer',
        severity: 'low'
    }
];
console.log('=== Slice 2 Diagnostic: Unused Variables/Parameters/Imports ===');
console.log(`Total errors: ${errors.length}`);
console.log('\nErrors by file:');
const byFile = errors.reduce((acc, err) => {
    acc[err.file] = (acc[err.file] || 0) + 1;
    return acc;
}, {});
Object.entries(byFile).forEach(([file, count]) => {
    console.log(`  ${file}: ${count}`);
});
console.log('\nDetailed errors:');
errors.forEach(err => {
    console.log(`  ${err.file}:${err.line}:${err.column} - ${err.type} '${err.name}' (${err.severity})`);
});
console.log('\n=== Diagnostic Complete ===');
export { errors };
//# sourceMappingURL=diagnose-slice2-unused.js.map