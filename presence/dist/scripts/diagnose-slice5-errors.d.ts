/**
 * Diagnostic Script for Slice 5 TypeScript Errors
 * Checks for possibly undefined errors and type assignment issues
 */
interface DiagnosticResult {
    file: string;
    line: number;
    error: string;
    severity: 'critical' | 'warning';
    fixed: boolean;
}
declare const results: DiagnosticResult[];
export { results };
//# sourceMappingURL=diagnose-slice5-errors.d.ts.map