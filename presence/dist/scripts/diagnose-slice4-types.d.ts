/**
 * DIAGNOSTIC SCRIPT: Slice 4 Type Safety Issues
 *
 * Identifies type safety issues in UI & Visibility modules:
 * - currentUser type casting issues
 * - currentVisibilityDataUnfiltered type issues
 * - any type usage
 */
interface DiagnosticResult {
    file: string;
    line: number;
    issue: string;
    severity: 'critical' | 'high' | 'medium';
    suggestion: string;
}
declare const results: DiagnosticResult[];
export { results };
//# sourceMappingURL=diagnose-slice4-types.d.ts.map