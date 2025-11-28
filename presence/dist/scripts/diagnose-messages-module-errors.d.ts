/**
 * DIAGNOSTIC SCRIPT: MessagesModule TypeScript Errors
 *
 * Purpose: Diagnose and verify fixes for TypeScript errors in MessagesModule
 * Slice 3 of 8 parallel TypeScript error fixes
 *
 * Generated: 2025-01-24
 * Status: Diagnostic
 */
interface DiagnosticResult {
    file: string;
    line: number;
    column?: number;
    error: string;
    severity: 'critical' | 'warning' | 'info';
    status: 'found' | 'fixed' | 'verified';
}
declare const results: DiagnosticResult[];
declare const expectedErrors: ({
    file: string;
    line: number;
    error: string;
    severity: "warning";
    column?: undefined;
} | {
    file: string;
    line: number;
    column: number;
    error: string;
    severity: "critical";
})[];
export { results, expectedErrors };
//# sourceMappingURL=diagnose-messages-module-errors.d.ts.map