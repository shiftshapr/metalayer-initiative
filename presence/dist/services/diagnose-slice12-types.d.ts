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
interface TypeError {
    file: string;
    line: number;
    column: number;
    code: string;
    message: string;
}
declare function diagnoseServiceTypeErrors(): {
    errors: TypeError[];
    summary: {
        total: number;
        byFile: Record<string, number>;
        byType: Record<string, number>;
    };
};
declare function analyzeRootCauses(): {
    issues: Array<{
        file: string;
        issue: string;
        fix: string;
    }>;
};
export { diagnoseServiceTypeErrors, analyzeRootCauses };
//# sourceMappingURL=diagnose-slice12-types.d.ts.map