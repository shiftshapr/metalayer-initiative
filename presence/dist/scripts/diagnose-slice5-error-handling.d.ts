/**
 * Diagnostic Script for Slice 5: Error Handling Inconsistencies
 *
 * Analyzes error handling patterns across the codebase:
 * 1. Silent failures (empty catch blocks or catch blocks without logging)
 * 2. Generic error types (catch(error) without proper typing)
 * 3. Inconsistent logging (console.log vs Logger utility)
 * 4. Missing error boundaries in critical paths
 * 5. Error handling strategy violations
 *
 * This diagnostic runs before and after implementation to measure improvements.
 */
interface ErrorHandlingIssue {
    file: string;
    line: number;
    type: 'silent_failure' | 'untyped_error' | 'inconsistent_logging' | 'missing_error_boundary' | 'no_error_handling';
    severity: 'critical' | 'high' | 'medium' | 'low';
    description: string;
    codeSnippet: string;
    recommendation: string;
}
interface DiagnosticResult {
    totalIssues: number;
    issuesByType: Record<string, number>;
    issuesBySeverity: Record<string, number>;
    issues: ErrorHandlingIssue[];
    filesAnalyzed: number;
    catchBlocksFound: number;
    silentFailures: number;
    untypedErrors: number;
    inconsistentLogging: number;
    missingErrorBoundaries: number;
}
/**
 * Main diagnostic function
 */
declare function runDiagnostic(): DiagnosticResult;
/**
 * Print diagnostic report
 */
declare function printReport(result: DiagnosticResult): void;
export { runDiagnostic, printReport, type ErrorHandlingIssue, type DiagnosticResult };
//# sourceMappingURL=diagnose-slice5-error-handling.d.ts.map