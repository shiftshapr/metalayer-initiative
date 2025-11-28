/**
 * Diagnostic Script: Slice 2 - Any Type Annotations
 * Scans prioritized files for `any` type annotations so we can capture
 * baseline + post-fix metrics.
 */
interface AnyTypeMatch {
    file: string;
    line: number;
    column: number;
    context: string;
}
interface DiagnosticSummary {
    file: string;
    count: number;
}
declare const matches: AnyTypeMatch[];
export { matches, AnyTypeMatch, DiagnosticSummary };
//# sourceMappingURL=diagnose-slice2-any-types.d.ts.map