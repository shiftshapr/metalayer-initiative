/**
 * DIAGNOSTIC SCRIPT: Slice 12 TypeScript Type Errors
 *
 * Analyzes type errors in service files:
 * - MessageLoadingService.ts
 * - MessageRendererService.ts
 * - RealtimeSubscriptionService.ts
 * - SupabaseRealtimeClientFix.ts
 * - SupabaseService.ts
 *
 * Run: npx tsc --noEmit 2>&1 | grep -E "presence/src/services"
 */
function diagnoseServiceTypeErrors() {
    const errors = [];
    const byFile = {};
    const byType = {};
    // Known errors from tsc output
    const knownErrors = [
        {
            file: 'MessageRendererService.ts',
            line: 118,
            column: 11,
            code: 'TS2322',
            message: "Type 'boolean | null | undefined' is not assignable to type 'boolean | null'"
        },
        {
            file: 'MessageRendererService.ts',
            line: 124,
            column: 11,
            code: 'TS2322',
            message: "Type 'boolean | null | undefined' is not assignable to type 'boolean | null'"
        },
        {
            file: 'SupabaseService.ts',
            line: 26,
            column: 41,
            code: 'TS2307',
            message: "Cannot find module '/presence/lib/supabase.min.js'"
        },
        {
            file: 'SupabaseService.ts',
            line: 34,
            column: 7,
            code: 'TS2322',
            message: "Type '((url: string, key: string) => SupabaseClient) | null' is not assignable"
        }
    ];
    for (const error of knownErrors) {
        errors.push(error);
        byFile[error.file] = (byFile[error.file] || 0) + 1;
        byType[error.code] = (byType[error.code] || 0) + 1;
    }
    return {
        errors,
        summary: {
            total: errors.length,
            byFile,
            byType
        }
    };
}
// Root cause analysis
function analyzeRootCauses() {
    return {
        issues: [
            {
                file: 'MessageRendererService.ts',
                issue: 'calculatedCanEdit and calculatedCanDelete can be undefined, but assigned to variables typed as boolean | null',
                fix: 'Use nullish coalescing (??) or explicit null check to convert undefined to null'
            },
            {
                file: 'SupabaseService.ts',
                issue: 'Dynamic import path /presence/lib/supabase.min.js is not resolvable at compile time',
                fix: 'Use @ts-ignore or type assertion for dynamic runtime import'
            },
            {
                file: 'SupabaseService.ts',
                issue: 'createClient can be null but assigned to variable expecting non-null function',
                fix: 'Add null check or use non-null assertion after validation'
            }
        ]
    };
}
if (require.main === module) {
    const diagnosis = diagnoseServiceTypeErrors();
    const rootCauses = analyzeRootCauses();
    console.log('=== SLICE 12 TYPE ERROR DIAGNOSTIC ===\n');
    console.log('Summary:', JSON.stringify(diagnosis.summary, null, 2));
    console.log('\nErrors:', JSON.stringify(diagnosis.errors, null, 2));
    console.log('\nRoot Causes:', JSON.stringify(rootCauses.issues, null, 2));
}
export { diagnoseServiceTypeErrors, analyzeRootCauses };
//# sourceMappingURL=diagnose-slice12-types.js.map