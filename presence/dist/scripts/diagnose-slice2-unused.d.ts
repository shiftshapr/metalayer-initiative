/**
 * Diagnostic Script: Slice 2 - Unused Variables/Parameters/Imports
 * Detects unused code in Auth & Profile modules
 *
 * Generated: 2025-01-24
 * Slice: 2 (Auth & Profile Modules)
 */
interface DiagnosticResult {
    file: string;
    line: number;
    column: number;
    type: 'unused-parameter' | 'unused-variable' | 'unused-import' | 'unused-interface';
    name: string;
    severity: 'low' | 'medium' | 'high';
}
declare const errors: DiagnosticResult[];
export { errors, DiagnosticResult };
//# sourceMappingURL=diagnose-slice2-unused.d.ts.map